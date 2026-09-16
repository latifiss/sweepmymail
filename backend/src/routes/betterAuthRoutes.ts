import { toNodeHandler } from "better-auth/node";
import { auth } from "../auth/auth";

export const betterAuthHandler = toNodeHandler(auth);
