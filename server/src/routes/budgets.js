import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http.js";

const router=Router();
const input=z.object({name:z.string().trim().min(1).max(60),limit:z.number().positive().finite(),color:z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#5DCAA5")});
router.get("/",(req,res)=>{const budgets=db.prepare(`SELECT b.id,b.name,b.limit_amount AS 'limit',b.color,ROUND(ABS(COALESCE(SUM(t.amount),0)),2) AS spent FROM budgets b LEFT JOIN transactions t ON t.user_id=b.user_id AND t.category=b.name AND t.amount<0 AND substr(t.transaction_date,1,7)=strftime('%Y-%m','now') WHERE b.user_id=? GROUP BY b.id ORDER BY b.created_at`).all(req.user.id);res.json({budgets});});
router.post("/",validate(input),(req,res)=>{const id=randomUUID();db.prepare("INSERT INTO budgets(id,user_id,name,limit_amount,color) VALUES(?,?,?,?,?)").run(id,req.user.id,req.body.name,req.body.limit,req.body.color);res.status(201).json({budget:{id,spent:0,...req.body}});});
router.put("/:id",validate(input),(req,res,next)=>{const r=db.prepare("UPDATE budgets SET name=?,limit_amount=?,color=? WHERE id=? AND user_id=?").run(req.body.name,req.body.limit,req.body.color,req.params.id,req.user.id);if(!r.changes)return next(new HttpError(404,"Orçamento não encontrado."));res.json({budget:{id:req.params.id,...req.body}});});
router.delete("/:id",(req,res,next)=>{const r=db.prepare("DELETE FROM budgets WHERE id=? AND user_id=?").run(req.params.id,req.user.id);if(!r.changes)return next(new HttpError(404,"Orçamento não encontrado."));res.status(204).end();});
export default router;
