import { toNodeHandler } from "better-auth/node";
import { Router } from "express";
import { auth } from "../auth/auth";

const router = Router();

router.all("/api/auth/*splat", toNodeHandler(auth));

export default router;
