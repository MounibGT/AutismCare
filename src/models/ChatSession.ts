import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatSession extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  type: "general" | "adi_assessment";
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    image?: string;
    confidence?: number;
  }>;
  adiResponses?: Array<{
    questionId: number;
    answer: string;
    score: number;
    timestamp: Date;
  }>;
  adiScore?: {
    total: number;
    maxPossible: number;
    percentage: number;
    riskLevel: "low" | "moderate" | "high";
  };
  status: "active" | "completed" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["general", "adi_assessment"],
      default: "general",
    },
    messages: {
      type: [
        {
          role: { type: String, enum: ["user", "assistant"] },
          content: { type: String, required: true },
          timestamp: { type: Date, default: Date.now },
          image: String,
          confidence: Number,
        },
      ],
      default: [],
    },
    adiResponses: {
      type: [
        {
          questionId: { type: Number, required: true },
          answer: { type: String, required: true },
          score: { type: Number, default: 0 },
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    adiScore: {
      total: Number,
      maxPossible: Number,
      percentage: Number,
      riskLevel: {
        type: String,
        enum: ["low", "moderate", "high"],
      },
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ChatSessionSchema.index({ userId: 1, status: 1 });
ChatSessionSchema.index({ sessionId: 1 });
ChatSessionSchema.index({ type: 1, status: 1 });

const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession || mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);

export default ChatSession;