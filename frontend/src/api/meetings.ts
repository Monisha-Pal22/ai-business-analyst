import api from "./config";

export const scheduleMeeting = (data: {
  client_name: string; client_email: string;
  datetime_str: string; notes?: string;
}) => api.post("/meetings/schedule", data);

export const getAllMeetings       = ()                           => api.get("/meetings/all");
export const updateMeetingStatus  = (id: number, status: string)=>
  api.put(`/meetings/${id}/status?status=${status}`);