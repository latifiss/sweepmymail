import { Request, Response } from "express";
import {
  generateDailySummaryForUser,
  getDailySummaryForUser,
} from "../services/dailySummaryService";

export const getLatestDailySummary = async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  try {
    const summary = await getDailySummaryForUser(userId);
    if (!summary) {
      return res.status(404).json({ ok: false, error: "No daily summary available yet" });
    }
    return res.json({ ok: true, summary });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
};

export const regenerateDailySummary = async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  try {
    const summary = await generateDailySummaryForUser(userId);
    return res.json({ ok: true, summary });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
};
