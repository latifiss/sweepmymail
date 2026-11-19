import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth, describeDatabaseError } from "../auth/auth";
import { getUserByEmail } from "../repositories/dataRepository";

function isDatabaseUnavailable(error: any) {
  const code = error?.code || error?.cause?.code;
  const message = String(error?.message || "");
  return ["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ETIMEDOUT", "ECONNRESET", "28P01", "3D000"].includes(code) ||
    /tenant\/user .* not found|database.*(connect|unavailable)|could not connect/i.test(message);
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session?.user || !session.session) {
      return res.status(401).json({
        error: "You are not signed in. Please sign in and try again.",
        code: "UNAUTHENTICATED",
      });
    }

    const legacyUser = await getUserByEmail(session.user.email);
    if (!legacyUser) {
      return res.status(409).json({
        error: "Your account is signed in but its application profile is missing. Please contact support.",
        code: "USER_NOT_INITIALIZED",
      });
    }

    (req as any).user = { id: legacyUser.id, email: legacyUser.email, name: legacyUser.name };
    (req as any).auth = session;
    return next();
  } catch (error: any) {
    if (isDatabaseUnavailable(error)) {
      const diagnostic = describeDatabaseError(error?.cause || error);
      console.error("[auth] Database unavailable while validating session:", diagnostic);
      return res.status(503).json({
        error: "Login is temporarily unavailable because the database cannot be reached.",
        code: "DATABASE_UNAVAILABLE",
        message: diagnostic.message,
        action: "Check the backend DATABASE_URL and Supabase project connection settings, then restart the backend.",
      });
    }

    console.error("[auth] Session validation failed:", error);
    return res.status(500).json({
      error: "We couldn't verify your sign-in session. Please try again.",
      code: "SESSION_VALIDATION_FAILED",
    });
  }
};
