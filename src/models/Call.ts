import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICall extends Document {
  callerId: mongoose.Types.ObjectId;
  callerName: string;
  callerImage?: string;
  receiverId: mongoose.Types.ObjectId;
  receiverName: string;
  receiverImage?: string;
  status: "pending" | "accepted" | "rejected" | "ended" | "missed";
  type: "video" | "audio";
  // WebRTC signaling fields
  offer?: any;
  answer?: any;
  iceCandidates?: any[];
  startedAt?: Date;
  endedAt?: Date;
  duration?: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

const CallSchema = new Schema<ICall>(
  {
    callerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    callerName: {
      type: String,
      required: true,
    },
    callerImage: String,
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
    receiverImage: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "ended", "missed"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["video", "audio"],
      default: "video",
    },
    // WebRTC signaling fields
    offer: {
      type: Schema.Types.Mixed,
      default: null,
    },
    answer: {
      type: Schema.Types.Mixed,
      default: null,
    },
    iceCandidates: [
      {
        type: Schema.Types.Mixed,
      },
    ],
    startedAt: Date,
    endedAt: Date,
    duration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CallSchema.index({ receiverId: 1, status: 1 });
CallSchema.index({ callerId: 1, status: 1 });

const Call: Model<ICall> =
  mongoose.models.Call || mongoose.model<ICall>("Call", CallSchema);

export default Call;
