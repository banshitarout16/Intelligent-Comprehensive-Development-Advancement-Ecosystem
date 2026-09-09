import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const chatConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, default: "New conversation" },
    messages: [chatMessageSchema],
  },
  { timestamps: true }
);

chatConversationSchema.index({ user: 1, updatedAt: -1 });

const ChatConversation = mongoose.model("ChatConversation", chatConversationSchema);

export default ChatConversation;
