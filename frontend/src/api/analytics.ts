import api from "./config";

export const getKPIs           = () => api.get("/analytics/kpis");
export const getWeeklySummary  = () => api.get("/analytics/weekly-summary");
export const getMonthlySummary = () => api.get("/analytics/monthly-summary");
export const getAdminReport    = () => api.get("/admin/analytics/report");
export const getAuditLogs      = () => api.get("/admin/audit-logs");