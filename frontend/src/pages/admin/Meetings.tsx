import { useEffect, useState } from "react";
import { getAllMeetings, updateMeetingStatus } from "../../api/meetings";

interface Meeting { id: number; client_name: string; client_email: string; datetime: string; status: string; notes: string; meeting_link: string; }

const statusColor: Record<string, string> = {
  scheduled:  "bg-green-100 text-green-700",
  completed:  "bg-blue-100 text-blue-700",
  cancelled:  "bg-red-100 text-red-700",
  pending:    "bg-amber-100 text-amber-700",
};

export default function Meetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filter,   setFilter]   = useState("all");

  const load = () => getAllMeetings().then((r) => setMeetings(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleStatus = async (id: number, status: string) => {
    await updateMeetingStatus(id, status);
    load();
  };

  const filtered = filter === "all" ? meetings : meetings.filter((m) => m.status === filter);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meetings</h1>
          <p className="text-slate-400 text-sm mt-0.5">All scheduled client meetings</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-600 focus:outline-none">
          <option value="all">All status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Client name", "Email", "Date & time", "Notes", "Meeting link", "Status", "Update"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center text-slate-400 text-sm py-10">No meetings found</td></tr>
            )}
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm font-semibold text-slate-700">{m.client_name}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{m.client_email}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{new Date(m.datetime).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-slate-400">{m.notes || "—"}</td>
                <td className="px-4 py-3 text-sm text-blue-500 underline cursor-pointer">
                  {m.meeting_link ? <a href={m.meeting_link} target="_blank" rel="noreferrer">Join</a> : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${statusColor[m.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select value={m.status} onChange={(e) => handleStatus(m.id, e.target.value)}
                    className="border border-slate-200 rounded-md px-2 py-1 text-xs bg-white text-slate-600 focus:outline-none">
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}