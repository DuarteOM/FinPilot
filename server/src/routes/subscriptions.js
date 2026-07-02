import { Router } from "express";
import { z } from "zod";
import { query, queryOne, execute } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http.js";

const router = Router();

const input = z.object({
  name:          z.string().trim().min(1).max(150),
  provider:      z.string().trim().max(150).nullable().optional(),
  accountId:     z.number().int().positive().nullable().optional(),
  categoryId:    z.number().int().positive().nullable().optional(),
  amount:        z.number().positive().finite(),
  billingCycle:  z.enum(["weekly", "monthly", "quarterly", "yearly"]).default("monthly"),
  nextPayment:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  autoRenew:     z.boolean().default(true),
  reminderDays:  z.number().int().min(0).max(30).default(3),
  status:        z.enum(["active", "paused", "cancelled"]).default("active"),
});

// ── GET /api/subscriptions ────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT s.subscription_id AS id, s.name, s.provider, s.amount,
              s.billing_cycle AS billingCycle, s.next_payment AS nextPayment,
              s.auto_renew AS autoRenew, s.reminder_days AS reminderDays,
              s.status, s.account_id AS accountId, s.category_id AS categoryId,
              a.name AS accountName, c.name AS categoryName, c.color AS categoryColor
       FROM subscriptions s
       LEFT JOIN accounts a ON a.account_id = s.account_id
       LEFT JOIN categories c ON c.category_id = s.category_id
       WHERE s.user_id = ?
       ORDER BY s.status ASC, s.next_payment ASC`,
      [req.user.id]
    );
    res.json({
      subscriptions: rows.map(r => ({ ...r, autoRenew: Boolean(r.autoRenew) })),
    });
  } catch (err) { next(err); }
});

// ── POST /api/subscriptions ───────────────────────────────────────────────────
router.post("/", validate(input), async (req, res, next) => {
  try {
    const { name, provider, accountId, categoryId, amount, billingCycle, nextPayment, autoRenew, reminderDays, status } = req.body;

    const result = await execute(
      "INSERT INTO subscriptions (user_id, account_id, category_id, name, provider, amount, billing_cycle, next_payment, auto_renew, reminder_days, status) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [req.user.id, accountId ?? null, categoryId ?? null, name, provider ?? null, amount, billingCycle, nextPayment, autoRenew ? 1 : 0, reminderDays, status]
    );

    res.status(201).json({ subscription: { id: result.insertId, name, provider, accountId, categoryId, amount, billingCycle, nextPayment, autoRenew, reminderDays, status } });
  } catch (err) { next(err); }
});

// ── PUT /api/subscriptions/:id ────────────────────────────────────────────────
router.put("/:id", validate(input), async (req, res, next) => {
  try {
    const { name, provider, accountId, categoryId, amount, billingCycle, nextPayment, autoRenew, reminderDays, status } = req.body;

    const result = await execute(
      "UPDATE subscriptions SET account_id=?, category_id=?, name=?, provider=?, amount=?, billing_cycle=?, next_payment=?, auto_renew=?, reminder_days=?, status=? WHERE subscription_id=? AND user_id=?",
      [accountId ?? null, categoryId ?? null, name, provider ?? null, amount, billingCycle, nextPayment, autoRenew ? 1 : 0, reminderDays, status, req.params.id, req.user.id]
    );
    if (!result.affectedRows) return next(new HttpError(404, "Subscrição não encontrada."));

    res.json({ subscription: { id: Number(req.params.id), name, provider, accountId, categoryId, amount, billingCycle, nextPayment, autoRenew, reminderDays, status } });
  } catch (err) { next(err); }
});

// ── PATCH /api/subscriptions/:id/status ──────────────────────────────────────
router.patch(
  "/:id/status",
  validate(z.object({ status: z.enum(["active", "paused", "cancelled"]) })),
  async (req, res, next) => {
    try {
      const result = await execute(
        "UPDATE subscriptions SET status=? WHERE subscription_id=? AND user_id=?",
        [req.body.status, req.params.id, req.user.id]
      );
      if (!result.affectedRows) return next(new HttpError(404, "Subscrição não encontrada."));
      res.json({ status: req.body.status });
    } catch (err) { next(err); }
  }
);

// ── DELETE /api/subscriptions/:id ─────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await execute(
      "DELETE FROM subscriptions WHERE subscription_id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return next(new HttpError(404, "Subscrição não encontrada."));
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
