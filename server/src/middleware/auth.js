import { queryOne } from "../db/database.js";
import { verifyToken } from "../utils/auth.js";
import { HttpError } from "../utils/http.js";

export async function requireAuth(req, _res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const payload = verifyToken(token);
    if (!payload) return next(new HttpError(401, "Autenticação necessária."));

    const user = await queryOne(
      "SELECT user_id AS id, first_name, last_name, email, currency_id FROM users WHERE user_id = ? AND is_active = 1",
      [payload.sub]
    );
    if (!user) return next(new HttpError(401, "Utilizador inválido."));

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
