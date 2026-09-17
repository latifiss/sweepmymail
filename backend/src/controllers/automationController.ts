import { Request, Response } from "express";
import {
  createAutomation,
  deleteAutomationForUser,
  getAutomationForUser,
  listAutomationsForUser,
  updateAutomationForUser,
} from "../repositories/automationRepository";

const triggers = new Set(["new_email"]);
const actions = new Set(["archive", "mark_important", "categorize", "forward"]);

function required(value: unknown, name: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${name} is required`);
  return value.trim();
}

function validate(body: any) {
  const triggerType = required(body?.triggerType, "triggerType");
  const actionType = required(body?.actionType, "actionType");
  if (!triggers.has(triggerType)) throw new Error("Unsupported trigger type");
  if (!actions.has(actionType)) throw new Error("Unsupported action type");
  const triggerConfig = body?.triggerConfig && typeof body.triggerConfig === "object" ? body.triggerConfig : {};
  const actionConfig = body?.actionConfig && typeof body.actionConfig === "object" ? body.actionConfig : {};
  if (actionType === "categorize" && !String(actionConfig.label || "").trim()) throw new Error("Category label is required");
  if (actionType === "forward" && (!Array.isArray(actionConfig.to) || !actionConfig.to.length)) throw new Error("Forwarding recipients are required");
  return {
    name: required(body?.name, "name"),
    trigger_type: triggerType,
    trigger_config: triggerConfig,
    action_type: actionType,
    action_config: actionConfig,
    status: body?.status === "paused" ? "paused" : "active" as const,
  };
}

function fail(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Automation request failed";
  const status = /required|unsupported/i.test(message) ? 400 : 500;
  return res.status(status).json({ ok: false, error: message });
}

export async function listAutomations(req: Request, res: Response) {
  try { res.json({ ok: true, automations: await listAutomationsForUser((req as any).user.id) }); } catch (e) { fail(res, e); }
}

export async function createAutomationController(req: Request, res: Response) {
  try {
    const input = validate(req.body);
    const result = await createAutomation({ user_id: (req as any).user.id, ...input });
    res.status(201).json({ ok: true, automation: result });
  } catch (e) { fail(res, e); }
}

export async function getAutomation(req: Request, res: Response) {
  try {
    const result = await getAutomationForUser((req as any).user.id, required(req.params.id, "id"));
    if (!result) return res.status(404).json({ ok: false, error: "Automation not found" });
    res.json({ ok: true, automation: result });
  } catch (e) { fail(res, e); }
}

export async function updateAutomationController(req: Request, res: Response) {
  try {
    const input = validate(req.body);
    const result = await updateAutomationForUser((req as any).user.id, required(req.params.id, "id"), input);
    res.json({ ok: true, automation: result });
  } catch (e) { fail(res, e); }
}

export async function deleteAutomationController(req: Request, res: Response) {
  try {
    const result = await deleteAutomationForUser((req as any).user.id, required(req.params.id, "id"));
    res.json({ ok: true, automation: result });
  } catch (e) { fail(res, e); }
}
