import express from "express";
import { pipeAgentUIStreamToResponse } from "ai";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createMailAgent } from "../agent/mailAgent";

const router = express.Router();

router.post("/chat", authMiddleware, async (req, res, next) => {
  const user = (req as any).user as { id: string; email: string };
  const messages = req.body?.messages;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const abortController = new AbortController();
  req.on("close", () => abortController.abort());

  try {
    await pipeAgentUIStreamToResponse({
      response: res,
      agent: createMailAgent(user.id, user.email),
      uiMessages: messages,
      abortSignal: abortController.signal,
    });
  } catch (error) {
    if (res.headersSent) return;
    return next(error);
  }
});

export default router;
