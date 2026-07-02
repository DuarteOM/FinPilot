import { Router } from "express";
import { getReports } from "../services/finance.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();
router.get("/", asyncHandler(async (req, res) => {
  const months = Math.min(Math.max(Number(req.query.months) || 7, 1), 24);
  res.json(await getReports(req.user.id, months));
}));
export default router;
