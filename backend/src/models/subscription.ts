
import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  sender: string;
  unsubscribed: boolean;
  unsubscribedAt?: Date;
  rolledUp?: boolean;
  rule?: string;
  rolledUpAt?: Date;
}

const subscriptionSchema = new Schema<ISubscription>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sender: String,
  unsubscribed: { type: Boolean, default: false },
  unsubscribedAt: Date,
  rolledUp: { type: Boolean, default: false },
  rule: String,
  rolledUpAt: Date,
});

export default mongoose.model<ISubscription>("Subscription", subscriptionSchema);
