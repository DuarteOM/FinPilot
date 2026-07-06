import { Router } from "express";
import { z } from "zod";
import { query, queryOne, transaction } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http.js";

const router = Router();

// ─── Validation ───────────────────────────────────────────────────────────────

const itemSchema = z.object({
  categoryId:  z.number().int().positive(),
  description: z.string().trim().max(255).nullable().optional(),
  amount:      z.number().positive().finite(),
});

const input = z.object({
  accountId:       z.number().int().positive(),
  paymentMethodId: z.number().int().positive().nullable().optional(),
  transactionType: z.enum(["income", "expense", "transfer"]),
  description:     z.string().trim().max(255).nullable().optional(),
  totalAmount:     z.number().positive().finite(),
  transactionDate: z.string().datetime({ local: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/)),
  merchant:        z.string().trim().max(150).nullable().optional(),
  location:        z.string().trim().max(150).nullable().optional(),
  notes:           z.string().max(2000).nullable().optional(),
  status:          z.enum(["pending", "completed", "cancelled"]).default("completed"),
  items:           z.array(itemSchema).min(1),
});

// ─── GET /api/transactions ────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const limit  = Math.min(Math.max(Number(req.query.limit)  || 100, 1), 500);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const search = String(req.query.search || "").trim();
    const type   = req.query.type;
    const category = String(req.query.category || "").trim();
    const account = String(req.query.account || "").trim();
    const paymentMethod = String(req.query.paymentMethod || "").trim();
    const status = req.query.status;
    const dateFrom = String(req.query.dateFrom || "").trim();
    const dateTo = String(req.query.dateTo || "").trim();
    const minAmount = req.query.minAmount !== undefined ? Number(req.query.minAmount) : null;
    const maxAmount = req.query.maxAmount !== undefined ? Number(req.query.maxAmount) : null;
    const sort = String(req.query.sort || "newest");

    const sortSql = {
      newest: "t.transaction_date DESC, t.created_at DESC",
      oldest: "t.transaction_date ASC, t.created_at ASC",
      amountAsc: "t.total_amount ASC, t.transaction_date DESC",
      amountDesc: "t.total_amount DESC, t.transaction_date DESC",
      az: "COALESCE(t.merchant, t.description, '') ASC, t.transaction_date DESC",
    }[sort] ?? "t.transaction_date DESC, t.created_at DESC";

    const conditions = ["t.account_id IN (SELECT account_id FROM accounts WHERE user_id = ?)"];
    const params     = [req.user.id];

    if (search) {
      conditions.push(`(
        t.merchant LIKE ?
        OR t.description LIKE ?
        OR t.notes LIKE ?
        OR CAST(t.transaction_id AS CHAR) LIKE ?
        OR EXISTS (
          SELECT 1
          FROM transaction_items ti_search
          JOIN categories c_search ON c_search.category_id = ti_search.category_id
          WHERE ti_search.transaction_id = t.transaction_id
            AND (c_search.name LIKE ? OR ti_search.description LIKE ?)
        )
      )`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (type && ["income", "expense", "transfer"].includes(type)) {
      conditions.push("t.transaction_type = ?");
      params.push(type);
    }
    if (category) {
      conditions.push(`EXISTS (
        SELECT 1
        FROM transaction_items ti_cat
        JOIN categories c_cat ON c_cat.category_id = ti_cat.category_id
        WHERE ti_cat.transaction_id = t.transaction_id
          AND (CAST(c_cat.category_id AS CHAR) = ? OR c_cat.name = ?)
      )`);
      params.push(category, category);
    }
    if (account) {
      conditions.push("(CAST(t.account_id AS CHAR) = ? OR a.name = ?)");
      params.push(account, account);
    }
    if (paymentMethod) {
      if (paymentMethod === "none") {
        conditions.push("t.payment_method_id IS NULL");
      } else {
        conditions.push("(CAST(t.payment_method_id AS CHAR) = ? OR pm.name = ?)");
        params.push(paymentMethod, paymentMethod);
      }
    }
    if (status && ["pending", "completed", "cancelled"].includes(status)) {
      conditions.push("t.status = ?");
      params.push(status);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
      conditions.push("DATE(t.transaction_date) >= ?");
      params.push(dateFrom);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
      conditions.push("DATE(t.transaction_date) <= ?");
      params.push(dateTo);
    }
    if (Number.isFinite(minAmount)) {
      conditions.push("t.total_amount >= ?");
      params.push(minAmount);
    }
    if (Number.isFinite(maxAmount)) {
      conditions.push("t.total_amount <= ?");
      params.push(maxAmount);
    }

    const where = conditions.join(" AND ");

    const rows = await query(
      `SELECT t.transaction_id AS id, t.transaction_type AS type, t.description,
              t.total_amount AS totalAmount, t.transaction_date AS date,
              t.merchant, t.location, t.notes, t.status,
              t.account_id AS accountId, t.payment_method_id AS paymentMethodId,
              a.name AS accountName, pm.name AS paymentMethod
       FROM transactions t
       JOIN accounts a ON a.account_id = t.account_id
       LEFT JOIN payment_methods pm ON pm.payment_method_id = t.payment_method_id
       WHERE ${where}
       ORDER BY ${sortSql}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Attach items
    const txIds = rows.map(r => r.id);
    let items = [];
    if (txIds.length) {
      items = await query(
        `SELECT ti.item_id AS id, ti.transaction_id AS transactionId,
                ti.category_id AS categoryId, c.name AS categoryName,
                c.color AS categoryColor, c.icon AS categoryIcon,
                ti.description, ti.amount
         FROM transaction_items ti
         JOIN categories c ON c.category_id = ti.category_id
         WHERE ti.transaction_id IN (${txIds.map(() => "?").join(",")})`,
        txIds
      );
    }

    const itemsByTx = items.reduce((acc, item) => {
      (acc[item.transactionId] ||= []).push(item);
      return acc;
    }, {});

    res.json({ transactions: rows.map(r => ({ ...r, items: itemsByTx[r.id] || [] })) });
  } catch (err) { next(err); }
});

router.get("/payment-methods", async (_req, res, next) => {
  try {
    const methods = await query("SELECT payment_method_id AS id, name, icon FROM payment_methods ORDER BY name");
    res.json({ methods });
  } catch (err) { next(err); }
});

// ─── GET /api/transactions/:id ────────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const tx = await queryOne(
      `SELECT t.*, a.name AS accountName, pm.name AS paymentMethod
       FROM transactions t
       JOIN accounts a ON a.account_id = t.account_id
       LEFT JOIN payment_methods pm ON pm.payment_method_id = t.payment_method_id
       WHERE t.transaction_id = ? AND a.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!tx) return next(new HttpError(404, "Transação não encontrada."));

    const items = await query(
      `SELECT ti.item_id AS id, ti.category_id AS categoryId,
              c.name AS categoryName, c.color AS categoryColor, c.icon AS categoryIcon,
              ti.description, ti.amount
       FROM transaction_items ti
       JOIN categories c ON c.category_id = ti.category_id
       WHERE ti.transaction_id = ?`,
      [req.params.id]
    );

    res.json({ transaction: { ...tx, items } });
  } catch (err) { next(err); }
});

// ─── POST /api/transactions ───────────────────────────────────────────────────
router.post("/", validate(input), async (req, res, next) => {
  try {
    const { accountId, paymentMethodId, transactionType, description, totalAmount,
            transactionDate, merchant, location, notes, status, items } = req.body;

    const account = await queryOne(
      "SELECT account_id FROM accounts WHERE account_id = ? AND user_id = ?",
      [accountId, req.user.id]
    );
    if (!account) return next(new HttpError(403, "Conta não encontrada."));

    const txId = await transaction(async conn => {
      const [txResult] = await conn.execute(
        `INSERT INTO transactions
         (account_id, payment_method_id, transaction_type, description, total_amount,
          transaction_date, merchant, location, notes, status)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [accountId, paymentMethodId ?? null, transactionType, description ?? null,
         totalAmount, transactionDate, merchant ?? null, location ?? null, notes ?? null, status]
      );
      const newId = txResult.insertId;

      for (const item of items) {
        await conn.execute(
          "INSERT INTO transaction_items (transaction_id, category_id, description, amount) VALUES (?,?,?,?)",
          [newId, item.categoryId, item.description ?? null, item.amount]
        );
      }

      const delta = transactionType === "expense" ? -totalAmount : totalAmount;
      await conn.execute(
        "UPDATE accounts SET balance = balance + ? WHERE account_id = ?",
        [delta, accountId]
      );

      return newId;
    });

    res.status(201).json({ transaction: { id: txId, accountId, transactionType, totalAmount, transactionDate, merchant, status, items } });
  } catch (err) { next(err); }
});

// ─── DELETE /api/transactions/:id ─────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const tx = await queryOne(
      `SELECT t.transaction_id, t.transaction_type, t.total_amount, t.account_id
       FROM transactions t
       JOIN accounts a ON a.account_id = t.account_id
       WHERE t.transaction_id = ? AND a.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!tx) return next(new HttpError(404, "Transação não encontrada."));

    await transaction(async conn => {
      await conn.execute("DELETE FROM transaction_items WHERE transaction_id = ?", [tx.transaction_id]);
      await conn.execute("DELETE FROM transactions WHERE transaction_id = ?", [tx.transaction_id]);
      const delta = tx.transaction_type === "expense" ? tx.total_amount : -tx.total_amount;
      await conn.execute("UPDATE accounts SET balance = balance + ? WHERE account_id = ?", [delta, tx.account_id]);
    });

    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
