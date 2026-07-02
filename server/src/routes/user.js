import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http.js";

const router = Router();

router.patch("/profile", validate(z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().toLowerCase().email().max(254) })), (req, res, next) => {
  try {
    const conflict = db.prepare("SELECT id FROM users WHERE email=? AND id<>?").get(req.body.email, req.user.id);
    if (conflict) throw new HttpError(409, "Este email já está a ser utilizado.");
    db.prepare("UPDATE users SET name=?,email=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(req.body.name, req.body.email, req.user.id);
    res.json({ user: { ...req.user, ...req.body } });
  } catch (error) { next(error); }
});

router.patch("/settings", validate(z.object({ darkMode: z.boolean().optional(), twoFactor: z.boolean().optional(), notificationPrefs: z.record(z.string(), z.boolean()).optional() })), (req, res) => {
  const current = db.prepare("SELECT * FROM user_settings WHERE user_id=?").get(req.user.id);
  const prefs = req.body.notificationPrefs ?? JSON.parse(current.notification_prefs);
  db.prepare("UPDATE user_settings SET dark_mode=?,two_factor=?,notification_prefs=? WHERE user_id=?").run(req.body.darkMode ?? current.dark_mode, req.body.twoFactor ?? current.two_factor, JSON.stringify(prefs), req.user.id);
  res.json({ settings: { darkMode: req.body.darkMode ?? Boolean(current.dark_mode), twoFactor: req.body.twoFactor ?? Boolean(current.two_factor), notificationPrefs: prefs } });
});

export default router;
