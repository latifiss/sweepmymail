import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  provider: "google" | "microsoft";
  accessToken: string;
  refreshToken: string;
  picture?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  provider: { type: String, enum: ["google", "microsoft"], required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  picture: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", userSchema);
