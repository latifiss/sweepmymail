import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateAccessToken = (payload: object) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET);
