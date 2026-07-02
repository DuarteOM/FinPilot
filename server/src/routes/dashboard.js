import { Router } from "express";
import { getDashboard } from "../services/finance.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();
router.get("/", asyncHandler(async (req, res) => {
  res.json(await getDashboard(req.user.id));
}));
export default router;
