import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth/auth";
import { getUserByEmail } from "../repositories/dataRepository";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user || !session.session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const legacyUser = await getUserByEmail(session.user.email);

    if (!legacyUser) {
      return res.status(409).json({
        error: "Account is authenticated but not initialized",
        code: "USER_NOT_INITIALIZED",
      });
    }

    (req as any).user = {
      id: legacyUser.id,
      email: legacyUser.email,
      name: legacyUser.name,
    };
    (req as any).auth = session;

    return next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
