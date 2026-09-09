import api from "./axios.js";

export const sendChatMessage = async (conversationId, message, contextNote) => {
  const { data } = await api.post("/chat/message", { conversationId, message, contextNote });
  return data.conversation;
};

export const listConversations = async () => {
  const { data } = await api.get("/chat");
  return data.conversations;
};

export const getConversation = async (id) => {
  const { data } = await api.get(`/chat/${id}`);
  return data.conversation;
};

export const deleteConversation = async (id) => {
  await api.delete(`/chat/${id}`);
};
