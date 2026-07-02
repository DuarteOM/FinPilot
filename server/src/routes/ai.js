import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/http.js";
import { askFinancialAssistant, streamFinancialAssistant } from "../services/ai.js";
import { db } from "../db/database.js";

const router = Router();

// Stricter rate limit for AI endpoints (10 requests/min per IP)
const aiLimit = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiadas perguntas. Tenta novamente dentro de um minuto." },
});

router.use(aiLimit);

// ── GET /api/ai/history ───────────────────────────────────────────────────────
router.get("/history", (req, res) => {
  const messages = db
    .prepare(
      "SELECT id, role, content, created_at AS createdAt FROM chat_messages WHERE user_id=? ORDER BY created_at DESC LIMIT 50"
    )
    .all(req.user.id)
    .reverse();
  res.json({ messages });
});

// ── DELETE /api/ai/history ────────────────────────────────────────────────────
router.delete("/history", (req, res) => {
  db.prepare("DELETE FROM chat_messages WHERE user_id=?").run(req.user.id);
  res.status(204).end();
});

// ── POST /api/ai/chat  (standard JSON response) ───────────────────────────────
router.post(
  "/chat",
  validate(z.object({ message: z.string().trim().min(1).max(1500) })),
  asyncHandler(async (req, res) => {
    const result = await askFinancialAssistant(req.user.id, req.body.message);
    res.json(result);
  })
);

// ── POST /api/ai/chat/stream  (Server-Sent Events) ────────────────────────────
// The client opens this as an EventSource / fetch with ReadableStream.
// Each SSE message is: data: {"delta":"..."}\n\n
// Final message:       data: {"done":true,"model":"..."}\n\n
router.post(
  "/chat/stream",
  validate(z.object({ message: z.string().trim().min(1).max(1500) })),
  asyncHandler(async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // If the client disconnects early, abort gracefully
    req.on("close", () => res.end());

    await streamFinancialAssistant(req.user.id, req.body.message, res);
  })
);

export default router;
