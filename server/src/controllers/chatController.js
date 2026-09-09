import ChatConversation from "../models/ChatConversation.js";
import { sendChatMessage } from "../services/chatService.js";

const deriveTitle = (firstMessage) => {
  const trimmed = firstMessage.trim().replace(/\s+/g, " ");
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed || "New conversation";
};

export const postMessage = async (req, res, next) => {
  try {
    const { conversationId, message, contextNote } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    let conversation;
    if (conversationId) {
      conversation = await ChatConversation.findOne({ _id: conversationId, user: req.user._id });
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
    } else {
      conversation = await ChatConversation.create({
        user: req.user._id,
        title: deriveTitle(message),
        messages: [],
      });
    }

    conversation.messages.push({ role: "user", content: message.trim() });

    try {
      const reply = await sendChatMessage({
        history: conversation.messages.map((m) => ({ role: m.role, content: m.content })),
        contextNote,
      });
      conversation.messages.push({ role: "assistant", content: reply });
      await conversation.save();
    } catch (err) {
      await conversation.save();
      return res.status(502).json({ message: `Assistant reply failed: ${err.message}` });
    }

    res.status(200).json({ conversation });
  } catch (error) {
    next(error);
  }
};

export const listConversations = async (req, res, next) => {
  try {
    const conversations = await ChatConversation.find({ user: req.user._id })
      .select("title updatedAt createdAt")
      .sort({ updatedAt: -1 });
    res.status(200).json({ conversations });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const conversation = await ChatConversation.findOne({ _id: req.params.id, user: req.user._id });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    res.status(200).json({ conversation });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await ChatConversation.findOne({ _id: req.params.id, user: req.user._id });
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    await conversation.deleteOne();
    res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    next(error);
  }
};
