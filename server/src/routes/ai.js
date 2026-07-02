import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/http.js";
import { askFinancialAssistant, streamFinancialAssistant } from "../services/ai.js";
import { query, execute, queryOne } from "../db/database.js";

const router = Router();

const aiLimit = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Demasiadas perguntas. Tenta novamente dentro de um minuto." },
});

router.use(aiLimit);

// ── GET /api/ai/conversations ─────────────────────────────────────────────────
router.get("/conversations", asyncHandler(async (req, res) => {
  const convs = await query(
    "SELECT conversation_id AS id, title, model, created_at AS createdAt, updated_at AS updatedAt FROM ai_conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20",
    [req.user.id]
  );
  res.json({ conversations: convs });
}));

// ── GET /api/ai/conversations/:id/messages ────────────────────────────────────
router.get("/conversations/:id/messages", asyncHandler(async (req, res) => {
  const conv = await queryOne("SELECT conversation_id FROM ai_conversations WHERE conversation_id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (!conv) throw { status: 404, message: "Conversa não encontrada." };

  const messages = await query(
    "SELECT message_id AS id, role, content, tokens, created_at AS createdAt FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC",
    [req.params.id]
  );
  res.json({ messages });
}));

// ── GET /api/ai/history (flat — backward compat) ──────────────────────────────
router.get("/history", asyncHandler(async (req, res) => {
  const messages = await query(
    `SELECT m.message_id AS id, m.role, m.content, m.created_at AS createdAt
     FROM ai_messages m
     JOIN ai_conversations c ON c.conversation_id = m.conversation_id
     WHERE c.user_id = ?
     ORDER BY m.created_at DESC LIMIT 50`,
    [req.user.id]
  );
  res.json({ messages: messages.reverse() });
}));

// ── DELETE /api/ai/history ────────────────────────────────────────────────────
router.delete("/history", asyncHandler(async (req, res) => {
  // Delete all conversations (messages cascade via FK if enforced, otherwise delete manually)
  const convs = await query("SELECT conversation_id FROM ai_conversations WHERE user_id = ?", [req.user.id]);
  for (const c of convs) {
    await execute("DELETE FROM ai_messages WHERE conversation_id = ?", [c.conversation_id]);
  }
  await execute("DELETE FROM ai_conversations WHERE user_id = ?", [req.user.id]);
  res.status(204).end();
}));

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
router.post(
  "/chat",
  validate(z.object({
    message:        z.string().trim().min(1).max(1500),
    conversationId: z.number().int().positive().nullable().optional(),
  })),
  asyncHandler(async (req, res) => {
    const result = await askFinancialAssistant(req.user.id, req.body.message, req.body.conversationId ?? null);
    res.json(result);
  })
);

// ── POST /api/ai/chat/stream ──────────────────────────────────────────────────
router.post(
  "/chat/stream",
  validate(z.object({
    message:        z.string().trim().min(1).max(1500),
    conversationId: z.number().int().positive().nullable().optional(),
  })),
  asyncHandler(async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    req.on("close", () => res.end());
    await streamFinancialAssistant(req.user.id, req.body.message, req.body.conversationId ?? null, res);
  })
);

// ── DELETE /api/ai/conversations/:id ─────────────────────────────────────────
router.delete("/conversations/:id", asyncHandler(async (req, res) => {
  const conv = await queryOne("SELECT conversation_id FROM ai_conversations WHERE conversation_id = ? AND user_id = ?", [req.params.id, req.user.id]);
  if (!conv) throw { status: 404, message: "Conversa não encontrada." };
  await execute("DELETE FROM ai_messages WHERE conversation_id = ?", [req.params.id]);
  await execute("DELETE FROM ai_conversations WHERE conversation_id = ?", [req.params.id]);
  res.status(204).end();
}));

export default router;
