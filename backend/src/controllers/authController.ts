import { Request, Response } from "express";
import { google } from "googleapis";
import User from "../models/user";
import { generateAccessToken } from "../utils/tokenUtils";
import { env } from "../config/env";

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

export const googleAuthUrl = (req: Request, res: Response) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly", "email", "profile"],
  });
  res.json({ url });
};

export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
  const { data } = await oauth2.userinfo.get();

  let user = await User.findOne({ email: data.email });
  if (!user) {
    user = await User.create({
      email: data.email,
      name: data.name,
      provider: "google",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      picture: data.picture,
    });
  } else {
    user.accessToken = tokens.access_token!;
    user.refreshToken = tokens.refresh_token || user.refreshToken;
    await user.save();
  }

  const token = generateAccessToken({ id: user._id });
  res.json({ token, user });
};
