import { Router } from "express";
import { z } from "zod";
import { query, queryOne, execute, transaction } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createToken, hashPassword, verifyPassword } from "../utils/auth.js";
import { HttpError } from "../utils/http.js";
import { seedDemoData } from "../services/demoData.js";

const router = Router();
const emailSchema    = z.string().trim().toLowerCase().email().max(191);
const passwordSchema = z.string().min(8).max(128);

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

      await seedDemoData(userId);

      const token = createToken(userId);
      res.status(201).json({
        token,
        user: { id: userId, firstName, lastName, email },
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
      res.json({
        token: createToken(user.user_id),
        user: { id: user.user_id, firstName: user.first_name, lastName: user.last_name, email: user.email },
      });
    } catch (err) { next(err); }
  }
);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const settings = await queryOne(
      "SELECT dark_mode, notifications_enabled, email_notifications, language, currency_format, first_day_of_week FROM user_settings WHERE user_id = ?",
      [req.user.id]
    );
    res.json({
      user: req.user,
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
