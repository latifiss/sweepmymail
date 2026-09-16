import express from "express";
import { pipeAgentUIStreamToResponse } from "ai";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createMailAgent } from "../agent/mailAgent";
import {
  addMessage,
  createConversation,
  deleteConversation,
  ensureConversationForUser,
  getConversationForUser,
  listConversationsForUser,
  listMessagesForConversation,
  setConversationStatus,
  setConversationTitleIfNew,
  updateConversationTitle,
} from "../agent/agent.persistence";
import { env } from "../config/env";

const router = express.Router();

router.get("/conversations", authMiddleware, async (req, res, next) => {
  try {
    const user = (req as any).user as { id: string };
    return res.json({ conversations: await listConversationsForUser(user.id) });
  } catch (error) {
    return next(error);
  }
});

router.post("/conversations", authMiddleware, async (req, res, next) => {
  try {
    const user = (req as any).user as { id: string };
    const conversation = await createConversation(user.id, req.body?.title);
    return res.status(201).json({ conversation });
  } catch (error) {
    return next(error);
  }
});

router.get("/conversations/:conversationId", authMiddleware, async (req, res, next) => {
  try {
    const user = (req as any).user as { id: string };
    const conversation = await getConversationForUser(user.id, req.params.conversationId);
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    const messages = await listMessagesForConversation(user.id, conversation.id);
    return res.json({ conversation, messages });
  } catch (error) {
    return next(error);
  }
});

router.patch("/conversations/:conversationId", authMiddleware, async (req, res, next) => {
  try {
    const user = (req as any).user as { id: string };
    const conversationId = req.params.conversationId;
    let conversation = await getConversationForUser(user.id, conversationId);
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    if (typeof req.body?.title === "string") {
      conversation = await updateConversationTitle(user.id, conversationId, req.body.title);
    }
    if (req.body?.status === "active" || req.body?.status === "archived") {
      conversation = await setConversationStatus(user.id, conversationId, req.body.status);
    }

    return res.json({ conversation });
  } catch (error) {
    return next(error);
  }
});

router.delete("/conversations/:conversationId", authMiddleware, async (req, res, next) => {
  try {
    const user = (req as any).user as { id: string };
    const deleted = await deleteConversation(user.id, req.params.conversationId);
    if (!deleted) return res.status(404).json({ error: "Conversation not found" });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get("/debug/openrouter", authMiddleware, async (req, res) => {
  const key = env.OPENROUTER_API_KEY;
  return res.json({
    openrouterKeyConfigured: Boolean(key),
    openrouterKeyPrefix: key ? `${key.slice(0, 7)}...` : null,
    openrouterKeyLength: key.length,
    agentModel: env.AGENT_MODEL,
  });
});

router.get("/debug/openrouter-direct", authMiddleware, async (req, res) => {
  const key = env.OPENROUTER_API_KEY;

  if (!key) {
    return res.status(500).json({ ok: false, error: "OPENROUTER_API_KEY is not configured" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.AGENT_MODEL,
        messages: [{ role: "user", content: "Say hello" }],
      }),
    });

    const body = await response.json().catch(() => null);
    const model = body?.model ?? env.AGENT_MODEL;
    const error = body?.error
      ? { code: body.error.code ?? null, message: body.error.message ?? "Unknown error" }
      : null;

    return res.status(response.ok ? 200 : response.status).json({
      ok: response.ok,
      status: response.status,
      model,
      error,
      responseId: body?.id ?? null,
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      status: 502,
      error: {
        message: error instanceof Error ? error.message : "OpenRouter request failed",
      },
    });
  }
});

router.post("/chat", authMiddleware, async (req, res, next) => {
  const user = (req as any).user as { id: string; email: string };
  const messages = req.body?.messages;
  const requestedConversationId = req.body?.conversationId;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const abortController = new AbortController();
  req.on("close", () => abortController.abort());

  try {
    const conversation = await ensureConversationForUser(user.id, requestedConversationId);
    const lastUserMessage = [...messages].reverse().find((message: any) => message?.role === "user");
    const lastUserContent = Array.isArray(lastUserMessage?.parts)
      ? lastUserMessage.parts
          .filter((part: any) => part?.type === "text")
          .map((part: any) => part.text)
          .join(" ")
      : typeof lastUserMessage?.content === "string"
        ? lastUserMessage.content
        : "";

    if (lastUserContent) {
      await setConversationTitleIfNew(user.id, conversation.id, lastUserContent);
      await addMessage({
        conversationId: conversation.id,
        role: "user",
        content: lastUserMessage,
      });
    }

    res.setHeader("X-Conversation-Id", conversation.id);

    await pipeAgentUIStreamToResponse({
      response: res,
      agent: createMailAgent(user.id, user.email, conversation.id),
      uiMessages: messages,
      abortSignal: abortController.signal,
    });
  } catch (error) {
    if (res.headersSent) return;
    return next(error);
  }
});

export default router;
