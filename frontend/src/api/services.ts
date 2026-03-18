import api from "./config";

export const getServices   = ()                        => api.get("/services/");
export const createService = (data: object)            => api.post("/admin/services/create", data);
export const updateService = (id: number, data: object)=> api.put(`/admin/services/${id}`, data);
export const deleteService = (id: number)              => api.delete(`/admin/services/${id}`);