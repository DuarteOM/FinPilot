import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http.js";

const router = Router();
const input = z.object({ merchant: z.string().trim().min(1).max(120), category: z.string().trim().min(1).max(60), date: z.iso.date(), amount: z.number().finite().refine(value => value !== 0), color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#5DCAA5") });
const select = "SELECT id,merchant,category,transaction_date AS date,amount,color,created_at AS createdAt FROM transactions";

router.get("/", (req, res) => {
  const search = String(req.query.search || "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
  const rows = search
    ? db.prepare(`${select} WHERE user_id=? AND (merchant LIKE ? OR category LIKE ?) ORDER BY transaction_date DESC,created_at DESC LIMIT ?`).all(req.user.id, `%${search}%`, `%${search}%`, limit)
    : db.prepare(`${select} WHERE user_id=? ORDER BY transaction_date DESC,created_at DESC LIMIT ?`).all(req.user.id, limit);
  res.json({ transactions: rows });
});

router.post("/", validate(input), (req, res) => {
  const id = randomUUID(); const value = req.body;
  db.prepare("INSERT INTO transactions (id,user_id,merchant,category,transaction_date,amount,color) VALUES (?,?,?,?,?,?,?)").run(id, req.user.id, value.merchant, value.category, value.date, value.amount, value.color);
  res.status(201).json({ transaction: { id, ...value } });
});

router.put("/:id", validate(input), (req, res, next) => {
  const value=req.body; const result=db.prepare("UPDATE transactions SET merchant=?,category=?,transaction_date=?,amount=?,color=? WHERE id=? AND user_id=?").run(value.merchant,value.category,value.date,value.amount,value.color,req.params.id,req.user.id);
  if (!result.changes) return next(new HttpError(404,"Transação não encontrada."));
  res.json({ transaction: { id:req.params.id,...value } });
});

router.delete("/:id", (req,res,next)=>{const result=db.prepare("DELETE FROM transactions WHERE id=? AND user_id=?").run(req.params.id,req.user.id);if(!result.changes)return next(new HttpError(404,"Transação não encontrada."));res.status(204).end();});
export default router;
