import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db, transaction } from "../db/database.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createToken, hashPassword, verifyPassword } from "../utils/auth.js";
import { HttpError } from "../utils/http.js";
import { seedDemoData } from "../services/demoData.js";

const router = Router();
const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(8).max(128);

router.post("/register", validate(z.object({ name: z.string().trim().min(2).max(80), email, password })), (req, res, next) => {
  try {
    if (db.prepare("SELECT 1 FROM users WHERE email=?").get(req.body.email)) throw new HttpError(409, "Já existe uma conta com este email.");
    const id = randomUUID();
    transaction(() => {
      db.prepare("INSERT INTO users (id,name,email,password_hash) VALUES (?,?,?,?)").run(id, req.body.name, req.body.email, hashPassword(req.body.password));
      db.prepare("INSERT INTO user_settings (user_id) VALUES (?)").run(id);
    });
    seedDemoData(id);
    res.status(201).json({ token: createToken(id), user: { id, name: req.body.name, email: req.body.email } });
  } catch (error) { next(error); }
});

router.post("/login", validate(z.object({ email, password: z.string().min(1).max(128) })), (req, res, next) => {
  try {
    const user = db.prepare("SELECT id,name,email,password_hash AS passwordHash FROM users WHERE email=?").get(req.body.email);
    if (!user || !verifyPassword(req.body.password, user.passwordHash)) throw new HttpError(401, "Email ou palavra-passe incorretos.");
    res.json({ token: createToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});

router.get("/me", requireAuth, (req, res) => {
  const settings = db.prepare("SELECT dark_mode AS darkMode,two_factor AS twoFactor,notification_prefs AS notificationPrefs FROM user_settings WHERE user_id=?").get(req.user.id);
  res.json({ user: req.user, settings: { darkMode: Boolean(settings.darkMode), twoFactor: Boolean(settings.twoFactor), notificationPrefs: JSON.parse(settings.notificationPrefs) } });
});

export default router;
