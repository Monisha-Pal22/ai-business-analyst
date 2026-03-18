import api from "./config";

export const adminLogin = (email: string, password: string) =>
  api.post("/admin/login",
    new URLSearchParams({ username: email, password }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

export const clientRegister = (data: {
  name: string; email: string; password: string;
  phone?: string; company?: string; requirements?: string;
}) => api.post("/client/register", data);

export const clientLogin = (email: string, password: string) =>
  api.post("/client/login", { email, password });