import { Router } from "express";
import { z } from "zod";
import { queryOne, execute } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http.js";

const router = Router();

// ── PATCH /api/user/profile ───────────────────────────────────────────────────
router.patch(
  "/profile",
  validate(z.object({
    firstName: z.string().trim().min(2).max(100),
    lastName:  z.string().trim().min(1).max(100),
    email:     z.string().trim().toLowerCase().email().max(191),
  })),
  async (req, res, next) => {
    try {
      const { firstName, lastName, email } = req.body;

      const conflict = await queryOne(
        "SELECT user_id FROM users WHERE email = ? AND user_id <> ?",
        [email, req.user.id]
      );
      if (conflict) throw new HttpError(409, "Este email já está a ser utilizado.");

      await execute(
        "UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE user_id = ?",
        [firstName, lastName, email, req.user.id]
      );

      res.json({ user: { ...req.user, firstName, lastName, email } });
    } catch (err) { next(err); }
  }
);

// ── PATCH /api/user/settings ──────────────────────────────────────────────────
router.patch(
  "/settings",
  validate(z.object({
    darkMode:             z.boolean().optional(),
    notificationsEnabled: z.boolean().optional(),
    emailNotifications:   z.boolean().optional(),
    language:             z.string().max(10).optional(),
    currencyFormat:       z.string().max(20).optional(),
    firstDayOfWeek:       z.enum(["monday", "sunday"]).optional(),
  })),
  async (req, res, next) => {
    try {
      const current = await queryOne(
        "SELECT * FROM user_settings WHERE user_id = ?",
        [req.user.id]
      );

      const updated = {
        dark_mode:             req.body.darkMode             ?? Boolean(current?.dark_mode),
        notifications_enabled: req.body.notificationsEnabled ?? Boolean(current?.notifications_enabled),
        email_notifications:   req.body.emailNotifications   ?? Boolean(current?.email_notifications),
        language:              req.body.language             ?? current?.language             ?? "pt",
        currency_format:       req.body.currencyFormat       ?? current?.currency_format      ?? "EUR",
        first_day_of_week:     req.body.firstDayOfWeek       ?? current?.first_day_of_week    ?? "monday",
      };

      if (current) {
        await execute(
          `UPDATE user_settings SET
            dark_mode = ?, notifications_enabled = ?, email_notifications = ?,
            language = ?, currency_format = ?, first_day_of_week = ?
           WHERE user_id = ?`,
          [
            updated.dark_mode ? 1 : 0,
            updated.notifications_enabled ? 1 : 0,
            updated.email_notifications ? 1 : 0,
            updated.language,
            updated.currency_format,
            updated.first_day_of_week,
            req.user.id,
          ]
        );
      } else {
        await execute(
          "INSERT INTO user_settings (user_id, dark_mode, notifications_enabled, email_notifications, language, currency_format, first_day_of_week) VALUES (?,?,?,?,?,?,?)",
          [req.user.id, updated.dark_mode ? 1 : 0, updated.notifications_enabled ? 1 : 0, updated.email_notifications ? 1 : 0, updated.language, updated.currency_format, updated.first_day_of_week]
        );
      }

      res.json({
        settings: {
          darkMode:             Boolean(updated.dark_mode),
          notificationsEnabled: Boolean(updated.notifications_enabled),
          emailNotifications:   Boolean(updated.email_notifications),
          language:             updated.language,
          currencyFormat:       updated.currency_format,
          firstDayOfWeek:       updated.first_day_of_week,
        },
      });
    } catch (err) { next(err); }
  }
);

export default router;
