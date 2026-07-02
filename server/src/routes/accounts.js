import { Router } from "express";
import { z } from "zod";
import { query, execute } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http.js";

const router = Router();

const input = z.object({
  accountTypeId: z.number().int().positive(),
  name:          z.string().trim().min(1).max(150),
  institution:   z.string().trim().max(150).nullable().optional(),
  balance:       z.number().finite().default(0),
  color:         z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  icon:          z.string().max(80).nullable().optional(),
  isDefault:     z.boolean().default(false),
});

// ── GET /api/accounts ─────────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT a.account_id AS id, a.name, a.institution, a.balance, a.color, a.icon,
              a.is_default AS isDefault, a.is_archived AS isArchived,
              at.name AS accountType, at.icon AS accountTypeIcon
       FROM accounts a
       JOIN account_types at ON at.account_type_id = a.account_type_id
       WHERE a.user_id = ? AND a.is_archived = 0
       ORDER BY a.is_default DESC, a.created_at ASC`,
      [req.user.id]
    );
    res.json({ accounts: rows.map(r => ({ ...r, isDefault: Boolean(r.isDefault), isArchived: Boolean(r.isArchived) })) });
  } catch (err) { next(err); }
});

// ── GET /api/accounts/types ───────────────────────────────────────────────────
router.get("/types", async (_req, res, next) => {
  try {
    const types = await query("SELECT account_type_id AS id, name, icon FROM account_types ORDER BY account_type_id");
    res.json({ types });
  } catch (err) { next(err); }
});

// ── POST /api/accounts ────────────────────────────────────────────────────────
router.post("/", validate(input), async (req, res, next) => {
  try {
    const { accountTypeId, name, institution, balance, color, icon, isDefault } = req.body;

    // Only one default account per user
    if (isDefault) {
      await execute("UPDATE accounts SET is_default = 0 WHERE user_id = ?", [req.user.id]);
    }

    const result = await execute(
      "INSERT INTO accounts (user_id, account_type_id, name, institution, balance, color, icon, is_default) VALUES (?,?,?,?,?,?,?,?)",
      [req.user.id, accountTypeId, name, institution ?? null, balance, color ?? null, icon ?? null, isDefault ? 1 : 0]
    );

    res.status(201).json({ account: { id: result.insertId, accountTypeId, name, institution, balance, color, icon, isDefault } });
  } catch (err) { next(err); }
});

// ── PUT /api/accounts/:id ─────────────────────────────────────────────────────
router.put("/:id", validate(input), async (req, res, next) => {
  try {
    const { accountTypeId, name, institution, balance, color, icon, isDefault } = req.body;

    if (isDefault) {
      await execute("UPDATE accounts SET is_default = 0 WHERE user_id = ? AND account_id <> ?", [req.user.id, req.params.id]);
    }

    const result = await execute(
      "UPDATE accounts SET account_type_id=?, name=?, institution=?, balance=?, color=?, icon=?, is_default=? WHERE account_id=? AND user_id=?",
      [accountTypeId, name, institution ?? null, balance, color ?? null, icon ?? null, isDefault ? 1 : 0, req.params.id, req.user.id]
    );
    if (!result.affectedRows) return next(new HttpError(404, "Conta não encontrada."));

    res.json({ account: { id: Number(req.params.id), accountTypeId, name, institution, balance, color, icon, isDefault } });
  } catch (err) { next(err); }
});

// ── PATCH /api/accounts/:id/archive ──────────────────────────────────────────
router.patch("/:id/archive", async (req, res, next) => {
  try {
    const result = await execute(
      "UPDATE accounts SET is_archived = 1 WHERE account_id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return next(new HttpError(404, "Conta não encontrada."));
    res.status(204).end();
  } catch (err) { next(err); }
});

// ── DELETE /api/accounts/:id ──────────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await execute(
      "DELETE FROM accounts WHERE account_id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return next(new HttpError(404, "Conta não encontrada."));
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
