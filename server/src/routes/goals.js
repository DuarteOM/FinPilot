import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db/database.js";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../utils/http.js";

const router=Router();
const input=z.object({name:z.string().trim().min(1).max(100),target:z.number().positive(),saved:z.number().nonnegative().default(0),monthly:z.number().nonnegative().default(0),eta:z.string().max(40).default("A calcular"),color:z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#5DCAA5"),probability:z.number().int().min(0).max(100).default(80)});
const select="SELECT id,name,target_amount AS target,saved_amount AS saved,monthly_amount AS monthly,eta,color,probability FROM goals";
router.get("/",(req,res)=>res.json({goals:db.prepare(`${select} WHERE user_id=? ORDER BY created_at`).all(req.user.id)}));
router.post("/",validate(input),(req,res)=>{const id=randomUUID(),v=req.body;db.prepare("INSERT INTO goals(id,user_id,name,target_amount,saved_amount,monthly_amount,eta,color,probability) VALUES(?,?,?,?,?,?,?,?,?)").run(id,req.user.id,v.name,v.target,v.saved,v.monthly,v.eta,v.color,v.probability);res.status(201).json({goal:{id,...v}});});
router.put("/:id",validate(input),(req,res,next)=>{const v=req.body,r=db.prepare("UPDATE goals SET name=?,target_amount=?,saved_amount=?,monthly_amount=?,eta=?,color=?,probability=? WHERE id=? AND user_id=?").run(v.name,v.target,v.saved,v.monthly,v.eta,v.color,v.probability,req.params.id,req.user.id);if(!r.changes)return next(new HttpError(404,"Objetivo não encontrado."));res.json({goal:{id:req.params.id,...v}});});
router.post("/:id/contributions",validate(z.object({amount:z.number().positive()})),(req,res,next)=>{const goal=db.prepare("SELECT saved_amount AS saved,target_amount AS target FROM goals WHERE id=? AND user_id=?").get(req.params.id,req.user.id);if(!goal)return next(new HttpError(404,"Objetivo não encontrado."));const saved=Math.min(goal.saved+req.body.amount,goal.target);db.prepare("UPDATE goals SET saved_amount=? WHERE id=?").run(saved,req.params.id);res.json({saved});});
router.delete("/:id",(req,res,next)=>{const r=db.prepare("DELETE FROM goals WHERE id=? AND user_id=?").run(req.params.id,req.user.id);if(!r.changes)return next(new HttpError(404,"Objetivo não encontrado."));res.status(204).end();});
export default router;
