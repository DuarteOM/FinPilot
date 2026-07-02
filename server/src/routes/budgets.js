import { Router } from "express";
import { z } from "zod";
import { query, queryOne, execute, transaction } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http.js";

const router = Router();

const input = z.object({
  name:             z.string().trim().min(1).max(150),
  description:      z.string().max(1000).nullable().optional(),
  amount:           z.number().positive().finite(),
  startDate:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate:          z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  alertPercentage:  z.number().int().min(1).max(100).default(80),
  color:            z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  isActive:         z.boolean().default(true),
  categoryIds:      z.array(z.number().int().positive()).default([]),
});

// ── GET /api/budgets ──────────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const budgets = await query(
      `SELECT b.budget_id AS id, b.name, b.description, b.amount, b.start_date AS startDate,
              b.end_date AS endDate, b.alert_percentage AS alertPercentage,
              b.color, b.is_active AS isActive, b.created_at AS createdAt,
              COALESCE(
                (SELECT ROUND(SUM(ti.amount), 2)
                 FROM transaction_items ti
                 JOIN transactions t ON t.transaction_id = ti.transaction_id
                 JOIN accounts a ON a.account_id = t.account_id
                 JOIN budget_categories bc ON bc.category_id = ti.category_id AND bc.budget_id = b.budget_id
                 WHERE a.user_id = ? AND t.transaction_date BETWEEN b.start_date AND b.end_date
                   AND t.transaction_type = 'expense'
                ), 0
              ) AS spent
       FROM budgets b
       WHERE b.user_id = ?
       ORDER BY b.is_active DESC, b.created_at DESC`,
      [req.user.id, req.user.id]
    );

    // Attach category ids
    const ids = budgets.map(b => b.id);
    let catLinks = [];
    if (ids.length) {
      catLinks = await query(
        `SELECT bc.budget_id AS budgetId, bc.category_id AS categoryId, c.name AS categoryName
         FROM budget_categories bc
         JOIN categories c ON c.category_id = bc.category_id
         WHERE bc.budget_id IN (${ids.map(() => "?").join(",")})`,
        ids
      );
    }

    const catsByBudget = catLinks.reduce((acc, r) => {
      (acc[r.budgetId] ||= []).push({ id: r.categoryId, name: r.categoryName });
      return acc;
    }, {});

    res.json({
      budgets: budgets.map(b => ({
        ...b,
        isActive: Boolean(b.isActive),
        categories: catsByBudget[b.id] || [],
      })),
    });
  } catch (err) { next(err); }
});

// ── POST /api/budgets ─────────────────────────────────────────────────────────
router.post("/", validate(input), async (req, res, next) => {
  try {
    const { name, description, amount, startDate, endDate, alertPercentage, color, isActive, categoryIds } = req.body;

    const budgetId = await transaction(async conn => {
      const [r] = await conn.execute(
        "INSERT INTO budgets (user_id, name, description, amount, start_date, end_date, alert_percentage, color, is_active) VALUES (?,?,?,?,?,?,?,?,?)",
        [req.user.id, name, description ?? null, amount, startDate, endDate, alertPercentage, color ?? null, isActive ? 1 : 0]
      );
      const newId = r.insertId;
      for (const catId of categoryIds) {
        await conn.execute("INSERT INTO budget_categories (budget_id, category_id) VALUES (?,?)", [newId, catId]);
      }
      return newId;
    });

    res.status(201).json({ budget: { id: budgetId, name, description, amount, startDate, endDate, alertPercentage, color, isActive, categoryIds, spent: 0 } });
  } catch (err) { next(err); }
});

// ── PUT /api/budgets/:id ──────────────────────────────────────────────────────
router.put("/:id", validate(input), async (req, res, next) => {
  try {
    const { name, description, amount, startDate, endDate, alertPercentage, color, isActive, categoryIds } = req.body;

    const existing = await queryOne("SELECT budget_id FROM budgets WHERE budget_id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!existing) return next(new HttpError(404, "Orçamento não encontrado."));

    await transaction(async conn => {
      await conn.execute(
        "UPDATE budgets SET name=?, description=?, amount=?, start_date=?, end_date=?, alert_percentage=?, color=?, is_active=? WHERE budget_id=?",
        [name, description ?? null, amount, startDate, endDate, alertPercentage, color ?? null, isActive ? 1 : 0, req.params.id]
      );
      await conn.execute("DELETE FROM budget_categories WHERE budget_id = ?", [req.params.id]);
      for (const catId of categoryIds) {
        await conn.execute("INSERT INTO budget_categories (budget_id, category_id) VALUES (?,?)", [req.params.id, catId]);
      }
    });

    res.json({ budget: { id: Number(req.params.id), name, description, amount, startDate, endDate, alertPercentage, color, isActive, categoryIds } });
  } catch (err) { next(err); }
});

// ── DELETE /api/budgets/:id ───────────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await execute("DELETE FROM budgets WHERE budget_id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!result.affectedRows) return next(new HttpError(404, "Orçamento não encontrado."));
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
