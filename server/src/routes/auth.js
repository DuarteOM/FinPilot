import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { env } from "../config/env.js";
import { queryOne, execute, transaction } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createToken, hashPassword, passwordNeedsRehash, verifyPassword } from "../utils/auth.js";
import { HttpError } from "../utils/http.js";
import { seedDemoData } from "../services/demoData.js";

const router = Router();
const emailSchema    = z.string().trim().toLowerCase().email().max(191);
const passwordSchema = z.string().min(8).max(128);
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

function authUser(user) {
  return {
    id:        Number(user.user_id),
    firstName: user.first_name,
    lastName:  user.last_name,
    name:      `${user.first_name} ${user.last_name}`.trim(),
    email:     user.email,
  };
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post(
  "/register",
  validate(z.object({
    firstName: z.string().trim().min(2).max(100),
    lastName:  z.string().trim().min(1).max(100),
    email:     emailSchema,
    password:  passwordSchema,
  })),
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      const existing = await queryOne("SELECT user_id FROM users WHERE email = ?", [email]);
      if (existing) throw new HttpError(409, "Já existe uma conta com este email.");

      // currency_id=1 → EUR (pre-seeded in the DB)
      const result = await execute(
        "INSERT INTO users (first_name, last_name, email, password_hash, currency_id) VALUES (?, ?, ?, ?, 1)",
        [firstName, lastName, email, hashPassword(password)]
      );
      const userId = result.insertId;

      await transaction(async conn => {
        await conn.execute("INSERT INTO user_settings (user_id) VALUES (?)", [userId]);
      });

      // seedDemoData is best-effort — if it fails the user still gets their token
      try {
        await seedDemoData(userId);
      } catch (seedErr) {
        console.error("[register] seedDemoData failed:", seedErr.message, seedErr.stack);
        // Do NOT re-throw — user is created, let them in
      }

      const token = createToken(userId);
      res.status(201).json({
        token,
        user: {
          id:        Number(userId),
          firstName,
          lastName,
          name:      `${firstName} ${lastName}`.trim(),
          email,
        },
      });
    } catch (err) { next(err); }
  }
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  "/login",
  validate(z.object({ email: emailSchema, password: z.string().min(1).max(128) })),
  async (req, res, next) => {
    try {
      const user = await queryOne(
        "SELECT user_id, first_name, last_name, email, password_hash FROM users WHERE email = ? AND is_active = 1",
        [req.body.email]
      );
      if (!user || !verifyPassword(req.body.password, user.password_hash)) {
        throw new HttpError(401, "Email ou palavra-passe incorretos.");
      }

      if (passwordNeedsRehash(user.password_hash)) {
        await execute("UPDATE users SET password_hash = ? WHERE user_id = ?", [
          hashPassword(req.body.password),
          user.user_id,
        ]);
      }

      res.json({
        token: createToken(user.user_id),
        user: {
          id:        Number(user.user_id),
          firstName: user.first_name,
          lastName:  user.last_name,
          name:      `${user.first_name} ${user.last_name}`.trim(),
          email:     user.email,
        },
      });
    } catch (err) { next(err); }
  }
);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.post(
  "/google",
  validate(z.object({ accessToken: z.string().min(20) })),
  async (req, res, next) => {
    try {
      if (!env.GOOGLE_CLIENT_ID) {
        throw new HttpError(503, "Autenticação Google não está configurada.");
      }

      const tokenInfo = await googleClient.getTokenInfo(req.body.accessToken);
      if (tokenInfo.aud !== env.GOOGLE_CLIENT_ID || !tokenInfo.email_verified) {
        throw new HttpError(401, "Token Google inválido.");
      }

      const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${req.body.accessToken}` },
      });
      if (!profileResponse.ok) {
        throw new HttpError(401, "Não foi possível validar a conta Google.");
      }

      const profile = await profileResponse.json();
      const email = profile.email?.toLowerCase();
      if (!email || !profile.email_verified) {
        throw new HttpError(401, "Conta Google sem email verificado.");
      }

      let user = await queryOne(
        "SELECT user_id, first_name, last_name, email FROM users WHERE email = ? AND is_active = 1",
        [email]
      );

      if (!user) {
        const fullName = profile.name?.trim() || email.split("@")[0];
        const parts = fullName.split(/\s+/).filter(Boolean);
        const firstName = (profile.given_name || parts[0] || "Google").slice(0, 100);
        const lastName = (profile.family_name || parts.slice(1).join(" ") || "User").slice(0, 100);

        const result = await execute(
          "INSERT INTO users (first_name, last_name, email, password_hash, avatar, currency_id) VALUES (?, ?, ?, ?, ?, 1)",
          [firstName, lastName, email, `google:${profile.sub}`, profile.picture ?? null]
        );
        const userId = result.insertId;

        await transaction(async conn => {
          await conn.execute("INSERT INTO user_settings (user_id) VALUES (?)", [userId]);
        });

        try {
          await seedDemoData(userId);
        } catch (seedErr) {
          console.error("[google] seedDemoData failed:", seedErr.message, seedErr.stack);
        }

        user = { user_id: userId, first_name: firstName, last_name: lastName, email };
      }

      res.json({
        token: createToken(user.user_id),
        user: authUser(user),
      });
    } catch (err) { next(err); }
  }
);

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const settings = await queryOne(
      "SELECT dark_mode, notifications_enabled, email_notifications, language, currency_format, first_day_of_week FROM user_settings WHERE user_id = ?",
      [req.user.id]
    );
    res.json({
      user: {
        ...req.user,
        name: `${req.user.firstName} ${req.user.lastName}`.trim(),
      },
      settings: {
        darkMode:            Boolean(settings?.dark_mode),
        notificationsEnabled:Boolean(settings?.notifications_enabled),
        emailNotifications:  Boolean(settings?.email_notifications),
        language:            settings?.language ?? "pt",
        currencyFormat:      settings?.currency_format ?? "EUR",
        firstDayOfWeek:      settings?.first_day_of_week ?? "monday",
      },
    });
  } catch (err) { next(err); }
});

export default router;
