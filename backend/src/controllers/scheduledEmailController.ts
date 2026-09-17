import { Request, Response } from "express";
import {
  cancelScheduledEmail,
  getScheduledEmailForUser,
  listUserScheduledEmails,
  scheduleEmail,
  updateScheduledEmail,
} from "../services/scheduledEmailService";

function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}

function recipients(value: unknown, field = "to") {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) {
    throw new Error(`${field} must contain between 1 and 20 recipients`);
  }
  return value.map((item) => requiredString(item, field));
}

function input(body: any) {
  return {
    to: recipients(body?.to),
    cc: Array.isArray(body?.cc) ? body.cc.map((item: unknown) => requiredString(item, "cc")) : [],
    bcc: Array.isArray(body?.bcc) ? body.bcc.map((item: unknown) => requiredString(item, "bcc")) : [],
    subject: requiredString(body?.subject, "subject"),
    body: requiredString(body?.body, "body"),
    sendAt: requiredString(body?.sendAt, "sendAt"),
    timezone: typeof body?.timezone === "string" && body.timezone.trim() ? body.timezone.trim() : "UTC",
  };
}

function errorResponse(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Scheduled email request failed";
  const status = /required|must contain|valid iso|future|invalid timezone|cannot be/i.test(message) ? 400 : 500;
  return res.status(status).json({ ok: false, error: message });
}

export const createScheduled = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await scheduleEmail({ userId, conversationId: req.body?.conversationId || null, ...input(req.body) });
    res.status(201).json({ ok: true, scheduledEmail: result });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const listScheduled = async (req: Request, res: Response) => {
  try {
    const result = await listUserScheduledEmails((req as any).user.id);
    res.json({ ok: true, scheduledEmails: result });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const getScheduled = async (req: Request, res: Response) => {
  try {
    const result = await getScheduledEmailForUser((req as any).user.id, requiredString(req.params.id, "id"));
    if (!result) return res.status(404).json({ ok: false, error: "Scheduled email not found" });
    res.json({ ok: true, scheduledEmail: result });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const editScheduled = async (req: Request, res: Response) => {
  try {
    const result = await updateScheduledEmail({ userId: (req as any).user.id, id: requiredString(req.params.id, "id"), ...input(req.body) });
    res.json({ ok: true, scheduledEmail: result });
  } catch (error) {
    errorResponse(res, error);
  }
};

export const cancelScheduled = async (req: Request, res: Response) => {
  try {
    const result = await cancelScheduledEmail((req as any).user.id, requiredString(req.params.id, "id"));
    res.json({ ok: true, scheduledEmail: result });
  } catch (error) {
    errorResponse(res, error);
  }
};
