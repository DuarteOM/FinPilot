import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http.js";

const router=Router();
const input=z.object({name:z.string().trim().min(1).max(100),monthly:z.number().positive(),next:z.string().max(40).nullable().default(null),used:z.boolean().default(true),active:z.boolean().default(true),color:z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#7F8FE4")});
const select="SELECT id,name,monthly_amount AS monthly,next_charge AS next,is_used AS used,is_active AS active,color FROM subscriptions";
const normalize=row=>({...row,used:Boolean(row.used),active:Boolean(row.active)});
router.get("/",(req,res)=>res.json({subscriptions:db.prepare(`${select} WHERE user_id=? ORDER BY created_at`).all(req.user.id).map(normalize)}));
router.post("/",validate(input),(req,res)=>{const id=randomUUID(),v=req.body;db.prepare("INSERT INTO subscriptions(id,user_id,name,monthly_amount,next_charge,is_used,is_active,color) VALUES(?,?,?,?,?,?,?,?)").run(id,req.user.id,v.name,v.monthly,v.next,v.used?1:0,v.active?1:0,v.color);res.status(201).json({subscription:{id,...v}});});
router.put("/:id",validate(input),(req,res,next)=>{const v=req.body,r=db.prepare("UPDATE subscriptions SET name=?,monthly_amount=?,next_charge=?,is_used=?,is_active=?,color=? WHERE id=? AND user_id=?").run(v.name,v.monthly,v.next,v.used?1:0,v.active?1:0,v.color,req.params.id,req.user.id);if(!r.changes)return next(new HttpError(404,"Subscrição não encontrada."));res.json({subscription:{id:req.params.id,...v}});});
router.patch("/:id/status",validate(z.object({active:z.boolean()})),(req,res,next)=>{const r=db.prepare("UPDATE subscriptions SET is_active=? WHERE id=? AND user_id=?").run(req.body.active?1:0,req.params.id,req.user.id);if(!r.changes)return next(new HttpError(404,"Subscrição não encontrada."));res.json({active:req.body.active});});
router.delete("/:id",(req,res,next)=>{const r=db.prepare("DELETE FROM subscriptions WHERE id=? AND user_id=?").run(req.params.id,req.user.id);if(!r.changes)return next(new HttpError(404,"Subscrição não encontrada."));res.status(204).end();});
export default router;
