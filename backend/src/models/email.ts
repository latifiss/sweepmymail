import mongoose, { Schema, Document } from "mongoose";

export interface IEmail extends Document {
  user: mongoose.Types.ObjectId;
  sender: string;
  subject: string;
  snippet: string;
  date: Date;
  unsubscribeLink?: string;
  messageId: string;
  archived?: boolean;
}

const emailSchema = new Schema<IEmail>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sender: String,
  subject: String,
  snippet: String,
  date: Date,
  unsubscribeLink: String,
  messageId: { type: String, unique: true },
  archived: { type: Boolean, default: false },
});

export default mongoose.model<IEmail>("Email", emailSchema);
