import { Router } from "express";
import { query, execute } from "../db/database.js";
import { HttpError } from "../utils/http.js";

const router = Router();

// ── GET /api/notifications ────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT notification_id AS id, title, message, type, is_read AS isRead, created_at AS createdAt
       FROM notifications WHERE user_id = ?
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ notifications: rows.map(r => ({ ...r, isRead: Boolean(r.isRead) })) });
  } catch (err) { next(err); }
});

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
router.patch("/:id/read", async (req, res, next) => {
  try {
    const result = await execute(
      "UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return next(new HttpError(404, "Notificação não encontrada."));
    res.status(204).end();
  } catch (err) { next(err); }
});

// ── PATCH /api/notifications/read-all ────────────────────────────────────────
router.patch("/read-all", async (req, res, next) => {
  try {
    await execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [req.user.id]);
    res.status(204).end();
  } catch (err) { next(err); }
});

// ── DELETE /api/notifications/:id ─────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await execute(
      "DELETE FROM notifications WHERE notification_id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return next(new HttpError(404, "Notificação não encontrada."));
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
