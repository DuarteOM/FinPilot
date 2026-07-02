import { Router } from "express";
import { getDashboard } from "../services/finance.js";

const router=Router();
router.get("/",(req,res)=>res.json(getDashboard(req.user.id)));
export default router;
