import { queryOne } from "../db/database.js";
import { verifyToken } from "../utils/auth.js";
import { HttpError } from "../utils/http.js";

export async function requireAuth(req, _res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const payload = verifyToken(token);
    if (!payload) return next(new HttpError(401, "Autenticação necessária."));

    // payload.sub may be a number or bigint — normalise to Number
    const userId = Number(payload.sub);

    const user = await queryOne(
      "SELECT user_id AS id, first_name AS firstName, last_name AS lastName, email, currency_id AS currencyId FROM users WHERE user_id = ? AND is_active = 1",
      [userId]
    );
    if (!user) return next(new HttpError(401, "Utilizador inválido."));

    // Ensure id is always a plain Number (never BigInt)
    req.user = { ...user, id: Number(user.id) };
    next();
  } catch (err) {
    next(err);
  }
}
