import api from "./config1";

export const sendMessage    = (message: string, session_id?: string) =>
  api.post("/chat/message", { message, session_id });
export const getChatHistory = (session_id: string) =>
  api.get(`/chat/history/${session_id}`);
export const adminChat      = (message: string) =>
  api.post("/admin/chat", { message });