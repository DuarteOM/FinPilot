import { Router } from "express";
import { z } from "zod";
import { query, execute } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http.js";

const router = Router();

const input = z.object({
  name:             z.string().trim().min(1).max(120),
  icon:             z.string().max(80).nullable().optional(),
  color:            z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  type:             z.enum(["income", "expense"]),
  parentCategoryId: z.number().int().positive().nullable().optional(),
});

// ── GET /api/categories ───────────────────────────────────────────────────────
// Returns global categories (user_id IS NULL) + user's own categories
router.get("/", async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT category_id AS id, name, icon, color, type, parent_category_id AS parentCategoryId,
              CASE WHEN user_id IS NULL THEN 0 ELSE 1 END AS isCustom
       FROM categories
       WHERE user_id IS NULL OR user_id = ?
       ORDER BY type, name`,
      [req.user.id]
    );
    res.json({ categories: rows.map(r => ({ ...r, isCustom: Boolean(r.isCustom) })) });
  } catch (err) { next(err); }
});

// ── POST /api/categories ──────────────────────────────────────────────────────
router.post("/", validate(input), async (req, res, next) => {
  try {
    const { name, icon, color, type, parentCategoryId } = req.body;
    const result = await execute(
      "INSERT INTO categories (user_id, name, icon, color, type, parent_category_id) VALUES (?,?,?,?,?,?)",
      [req.user.id, name, icon ?? null, color ?? null, type, parentCategoryId ?? null]
    );
    res.status(201).json({ category: { id: result.insertId, name, icon, color, type, parentCategoryId, isCustom: true } });
  } catch (err) { next(err); }
});

// ── PUT /api/categories/:id ───────────────────────────────────────────────────
router.put("/:id", validate(input), async (req, res, next) => {
  try {
    const { name, icon, color, type, parentCategoryId } = req.body;
    const result = await execute(
      "UPDATE categories SET name=?, icon=?, color=?, type=?, parent_category_id=? WHERE category_id=? AND user_id=?",
      [name, icon ?? null, color ?? null, type, parentCategoryId ?? null, req.params.id, req.user.id]
    );
    if (!result.affectedRows) return next(new HttpError(404, "Categoria não encontrada ou não pode ser editada."));
    res.json({ category: { id: Number(req.params.id), name, icon, color, type, parentCategoryId, isCustom: true } });
  } catch (err) { next(err); }
});

// ── DELETE /api/categories/:id ────────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await execute(
      "DELETE FROM categories WHERE category_id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return next(new HttpError(404, "Categoria não encontrada ou não pode ser eliminada."));
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
