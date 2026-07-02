import { Router } from "express";
import { getReports } from "../services/finance.js";

const router=Router();
router.get("/",(req,res)=>{const months=Math.min(Math.max(Number(req.query.months)||7,1),24);res.json(getReports(req.user.id,months));});
export default router;
