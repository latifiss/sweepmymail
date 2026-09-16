import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth/auth";

export type AuthenticatedRequest = Request & {
  auth: {
    user: typeof auth.$Infer.Session.user;
    session: typeof auth.$Infer.Session.session;
  };
};

export async function betterAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user || !session.session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    (req as AuthenticatedRequest).auth = session;
    return next();
  } catch (error) {
    console.error("Better Auth session validation failed:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
