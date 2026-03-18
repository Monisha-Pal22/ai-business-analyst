import { useEffect, useState } from "react";
import { getAuditLogs } from "../../api/analytics";

interface Log { id: number; admin_email: string; action: string; target: string; detail: string; ip_address: string; timestamp: string; }

const actionColor: Record<string, string> = {
  LOGIN:          "bg-amber-100 text-amber-700",
  LOGIN_FAILED:   "bg-red-100 text-red-700",
  CREATE_SERVICE: "bg-green-100 text-green-700",
  UPDATE_SERVICE: "bg-blue-100 text-blue-700",
  DELETE_SERVICE: "bg-red-100 text-red-700",
  CREATE_ADMIN:   "bg-purple-100 text-purple-700",
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => { getAuditLogs().then((r) => setLogs(r.data)).catch(() => {}); }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Audit logs</h1>
        <p className="text-slate-400 text-sm mt-0.5">All admin actions tracked for security compliance</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Action", "Admin", "Target", "Detail", "IP address", "Time"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={6} className="text-center text-slate-400 text-sm py-10">No audit logs yet</td></tr>
            )}
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${actionColor[l.action] ?? "bg-slate-100 text-slate-600"}`}>{l.action}</span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{l.admin_email}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{l.target || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{l.detail || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{l.ip_address || "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{new Date(l.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}