import { Router } from "express";
import { z } from "zod";
import { query, queryOne, execute, transaction } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http.js";

const router = Router();

const input = z.object({
  name:          z.string().trim().min(1).max(150),
  description:   z.string().max(1000).nullable().optional(),
  targetAmount:  z.number().positive().finite(),
  currentAmount: z.number().nonnegative().finite().default(0),
  targetDate:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  priority:      z.enum(["low", "medium", "high"]).default("medium"),
  color:         z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  icon:          z.string().max(80).nullable().optional(),
  status:        z.enum(["active", "completed", "cancelled"]).default("active"),
});

// ── GET /api/goals ────────────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const goals = await query(
      `SELECT goal_id AS id, name, description, target_amount AS targetAmount,
              current_amount AS currentAmount, target_date AS targetDate,
              priority, color, icon, status, created_at AS createdAt
       FROM goals WHERE user_id = ? AND status != 'cancelled'
       ORDER BY created_at ASC`,
      [req.user.id]
    );
    res.json({ goals });
  } catch (err) { next(err); }
});

// ── POST /api/goals ───────────────────────────────────────────────────────────
router.post("/", validate(input), async (req, res, next) => {
  try {
    const { name, description, targetAmount, currentAmount, targetDate, priority, color, icon, status } = req.body;
    const result = await execute(
      "INSERT INTO goals (user_id, name, description, target_amount, current_amount, target_date, priority, color, icon, status) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [req.user.id, name, description ?? null, targetAmount, currentAmount, targetDate ?? null, priority, color ?? null, icon ?? null, status]
    );
    res.status(201).json({ goal: { id: result.insertId, name, description, targetAmount, currentAmount, targetDate, priority, color, icon, status } });
  } catch (err) { next(err); }
});

// ── PUT /api/goals/:id ────────────────────────────────────────────────────────
router.put("/:id", validate(input), async (req, res, next) => {
  try {
    const { name, description, targetAmount, currentAmount, targetDate, priority, color, icon, status } = req.body;
    const result = await execute(
      "UPDATE goals SET name=?, description=?, target_amount=?, current_amount=?, target_date=?, priority=?, color=?, icon=?, status=? WHERE goal_id=? AND user_id=?",
      [name, description ?? null, targetAmount, currentAmount, targetDate ?? null, priority, color ?? null, icon ?? null, status, req.params.id, req.user.id]
    );
    if (!result.affectedRows) return next(new HttpError(404, "Objetivo não encontrado."));
    res.json({ goal: { id: Number(req.params.id), name, description, targetAmount, currentAmount, targetDate, priority, color, icon, status } });
  } catch (err) { next(err); }
});

// ── POST /api/goals/:id/contributions ─────────────────────────────────────────
router.post(
  "/:id/contributions",
  validate(z.object({
    amount:           z.number().positive().finite(),
    contributionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    notes:            z.string().max(500).nullable().optional(),
  })),
  async (req, res, next) => {
    try {
      const goal = await queryOne(
        "SELECT goal_id, current_amount, target_amount FROM goals WHERE goal_id = ? AND user_id = ?",
        [req.params.id, req.user.id]
      );
      if (!goal) return next(new HttpError(404, "Objetivo não encontrado."));

      const { amount, contributionDate, notes } = req.body;
      const newAmount = Math.min(Number(goal.current_amount) + amount, Number(goal.target_amount));
      const contribDate = contributionDate ?? new Date().toISOString().slice(0, 10);

      await transaction(async conn => {
        await conn.execute(
          "INSERT INTO goal_contributions (goal_id, amount, contribution_date, notes) VALUES (?,?,?,?)",
          [goal.goal_id, amount, contribDate, notes ?? null]
        );
        await conn.execute(
          "UPDATE goals SET current_amount = ? WHERE goal_id = ?",
          [newAmount, goal.goal_id]
        );
        // Auto-complete if target reached
        if (newAmount >= Number(goal.target_amount)) {
          await conn.execute("UPDATE goals SET status = 'completed' WHERE goal_id = ?", [goal.goal_id]);
        }
      });

      res.json({ currentAmount: newAmount, contributed: amount });
    } catch (err) { next(err); }
  }
);

// ── GET /api/goals/:id/contributions ─────────────────────────────────────────
router.get("/:id/contributions", async (req, res, next) => {
  try {
    const goal = await queryOne("SELECT goal_id FROM goals WHERE goal_id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!goal) return next(new HttpError(404, "Objetivo não encontrado."));

    const contribs = await query(
      "SELECT contribution_id AS id, amount, contribution_date AS date, notes FROM goal_contributions WHERE goal_id = ? ORDER BY contribution_date DESC",
      [req.params.id]
    );
    res.json({ contributions: contribs });
  } catch (err) { next(err); }
});

// ── DELETE /api/goals/:id ─────────────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await execute(
      "DELETE FROM goals WHERE goal_id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return next(new HttpError(404, "Objetivo não encontrado."));
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
