import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { pool } from "./db/database.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/errors.js";

import authRoutes          from "./routes/auth.js";
import userRoutes          from "./routes/user.js";
import accountRoutes       from "./routes/accounts.js";
import categoryRoutes      from "./routes/categories.js";
import transactionRoutes   from "./routes/transactions.js";
import budgetRoutes        from "./routes/budgets.js";
import goalRoutes          from "./routes/goals.js";
import subscriptionRoutes  from "./routes/subscriptions.js";
import notificationRoutes  from "./routes/notifications.js";
import dashboardRoutes     from "./routes/dashboard.js";
import reportRoutes        from "./routes/reports.js";
import aiRoutes            from "./routes/ai.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_ORIGIN.split(",").map(v => v.trim()),
  credentials: false,
}));
app.use(express.json({ limit: "200kb" }));
app.use(rateLimit({
  windowMs: 15 * 60_000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
}));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    await pool.execute("SELECT 1");
    res.json({
      status: "ok",
      service: "finpilot-api",
      db: "mysql",
      aiConfigured: Boolean(env.OPENAI_API_KEY),
    });
  } catch {
    res.status(503).json({ status: "error", db: "unreachable" });
  }
});

// ── Public routes ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// ── Protected routes ──────────────────────────────────────────────────────────
app.use("/api/user",          requireAuth, userRoutes);
app.use("/api/accounts",      requireAuth, accountRoutes);
app.use("/api/categories",    requireAuth, categoryRoutes);
app.use("/api/transactions",  requireAuth, transactionRoutes);
app.use("/api/budgets",       requireAuth, budgetRoutes);
app.use("/api/goals",         requireAuth, goalRoutes);
app.use("/api/subscriptions", requireAuth, subscriptionRoutes);
app.use("/api/notifications", requireAuth, notificationRoutes);
app.use("/api/dashboard",     requireAuth, dashboardRoutes);
app.use("/api/reports",       requireAuth, reportRoutes);
app.use("/api/ai",            requireAuth, aiRoutes);

// ── Error handlers ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);
