import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/http.js";
import { askFinancialAssistant } from "../services/ai.js";
import { db } from "../db/database.js";

const router=Router();
router.use(rateLimit({windowMs:60_000,limit:10,standardHeaders:"draft-8",legacyHeaders:false,message:{error:"Demasiadas perguntas. Tenta novamente dentro de um minuto."}}));
router.get("/history",(req,res)=>res.json({messages:db.prepare("SELECT id,role,content,created_at AS createdAt FROM chat_messages WHERE user_id=? ORDER BY created_at DESC LIMIT 50").all(req.user.id).reverse()}));
router.post("/chat",validate(z.object({message:z.string().trim().min(1).max(1500)})),asyncHandler(async(req,res)=>res.json(await askFinancialAssistant(req.user.id,req.body.message))));
router.delete("/history",(req,res)=>{db.prepare("DELETE FROM chat_messages WHERE user_id=?").run(req.user.id);res.status(204).end();});
export default router;
