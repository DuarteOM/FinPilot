import { db } from "../db/database.js";
import { verifyToken } from "../utils/auth.js";
import { HttpError } from "../utils/http.js";

export function requireAuth(req, _res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const payload = verifyToken(token);
  if (!payload) return next(new HttpError(401, "Autenticação necessária."));
  const user = db.prepare("SELECT id, name, email, created_at AS createdAt FROM users WHERE id = ?").get(payload.sub);
  if (!user) return next(new HttpError(401, "Utilizador inválido."));
  req.user = user;
  next();
}
