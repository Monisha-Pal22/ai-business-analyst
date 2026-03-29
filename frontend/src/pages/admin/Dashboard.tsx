// import { useEffect, useState } from "react";
// import { getAdminReport, getKPIs } from "../../api/analytics";
// import { BarChart2, CalendarDays, MessageSquare, Package } from "lucide-react";

// export default function Dashboard() {
//   const [report, setReport] = useState<any>(null);
//   const [kpis,   setKpis]   = useState<any>(null);

//   useEffect(() => {
//     getAdminReport().then((r) => setReport(r.data)).catch(() => {});
//     getKPIs().then((r) => setKpis(r.data)).catch(() => {});
//   }, []);

//   const cards = [
//     { label: "Total meetings",   value: report?.total_meetings   ?? "—", icon: CalendarDays, color: "bg-blue-50 text-blue-600",   sub: "All time" },
//     { label: "Pending meetings", value: report?.pending_meetings ?? "—", icon: CalendarDays, color: "bg-amber-50 text-amber-600", sub: "Needs action" },
//     { label: "Active services",  value: report?.total_services   ?? "—", icon: Package,      color: "bg-green-50 text-green-600", sub: "Live services" },
//     { label: "Client chats",     value: report?.total_client_chats ?? "—", icon: MessageSquare, color: "bg-purple-50 text-purple-600", sub: "All time" },
//   ];

//   const bars = [38, 52, 44, 60, 48, 70, 55];
//   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
//           <p className="text-slate-400 text-sm mt-0.5">Logistics Intelligence Overview</p>
//         </div>
//         <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
//           <BarChart2 size={14} className="text-blue-500" />
//           <span className="text-xs text-slate-500">Live data</span>
//         </div>
//       </div>

//       {/* KPI Cards */}
//       <div className="grid grid-cols-4 gap-4 mb-6">
//         {cards.map((c) => (
//           <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
//             <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
//               <c.icon size={16} />
//             </div>
//             <p className="text-xs text-slate-400 mb-1">{c.label}</p>
//             <p className="text-2xl font-bold text-slate-800">{String(c.value)}</p>
//             <p className="text-xs text-green-500 mt-1">{c.sub}</p>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-3 gap-4 mb-6">
//         {/* Revenue Chart */}
//         <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-4">
//           <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Revenue — monthly</p>
//           <div className="flex items-end gap-2 h-24">
//             {bars.map((h, i) => (
//               <div key={i} className="flex-1 flex flex-col items-center gap-1">
//                 <div
//                   className={`w-full rounded-t-md transition-all ${i === 6 ? "bg-blue-600" : "bg-blue-300"}`}
//                   style={{ height: `${h}px` }}
//                 />
//                 <span className="text-xs text-slate-400">{months[i]}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Fleet Utilization */}
//         <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center justify-center">
//           <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Fleet utilization</p>
//           <div className="relative w-24 h-24">
//             <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
//               <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
//               <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
//                 strokeDasharray={`${kpis?.fleet_utilization ? parseInt(kpis.fleet_utilization) : 78} 100`}
//                 strokeLinecap="round"
//               />
//             </svg>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <span className="text-lg font-bold text-slate-800">{kpis?.fleet_utilization ?? "78%"}</span>
//             </div>
//           </div>
//           <div className="flex gap-4 mt-3">
//             <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-xs text-slate-500">Active</span></div>
//             <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-200" /><span className="text-xs text-slate-500">Idle</span></div>
//           </div>
//         </div>
//       </div>

//       {/* Recent Meetings */}
//       <div className="bg-white rounded-xl border border-slate-200 p-4">
//         <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent meetings</p>
//         <table className="w-full">
//           <thead>
//             <tr className="border-b border-slate-100">
//               <th className="text-left text-xs text-slate-400 font-medium pb-2 px-2">Client</th>
//               <th className="text-left text-xs text-slate-400 font-medium pb-2 px-2">Email</th>
//               <th className="text-left text-xs text-slate-400 font-medium pb-2 px-2">Date & time</th>
//               <th className="text-left text-xs text-slate-400 font-medium pb-2 px-2">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {[
//               { name: "Acme Corp",   email: "acme@corp.com",    date: "2025-06-20 14:00", status: "Scheduled", color: "bg-green-100 text-green-700" },
//               { name: "TechMove Ltd",email: "tech@move.com",    date: "2025-06-22 10:00", status: "Pending",   color: "bg-amber-100 text-amber-700" },
//               { name: "FastFreight", email: "fast@freight.io",  date: "2025-06-18 09:00", status: "Completed", color: "bg-blue-100 text-blue-700"   },
//             ].map((row) => (
//               <tr key={row.name} className="border-b border-slate-50 last:border-none">
//                 <td className="py-2.5 px-2 text-sm font-medium text-slate-700">{row.name}</td>
//                 <td className="py-2.5 px-2 text-sm text-slate-400">{row.email}</td>
//                 <td className="py-2.5 px-2 text-sm text-slate-400">{row.date}</td>
//                 <td className="py-2.5 px-2"><span className={`text-xs px-2 py-1 rounded-md font-medium ${row.color}`}>{row.status}</span></td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }





import { useEffect, useState } from "react";
import { getAdminReport, getKPIs } from "../../api/analytics";
import { getAllMeetings } from "../../api/meetings";
import { BarChart2, CalendarDays, MessageSquare, Package } from "lucide-react";

export default function Dashboard() {
  const [report,   setReport]   = useState<any>(null);
  const [kpis,     setKpis]     = useState<any>(null);
  const [meetings, setMeetings] = useState<any[]>([]);

  useEffect(() => {
    getAdminReport().then((r:any) => setReport(r.data)).catch(() => {});
    getKPIs().then((r: any) => setKpis(r.data)).catch(() => {});
    getAllMeetings().then((r: any) => setMeetings(r.data.slice(0, 5))).catch(() => {});
  }, []);

  const cards = [
    { label: "Total meetings",   value: report?.total_meetings      ?? "0", icon: CalendarDays,  color: "bg-blue-50 text-blue-600",    sub: "All time"    },
    { label: "Pending meetings", value: report?.pending_meetings    ?? "0", icon: CalendarDays,  color: "bg-amber-50 text-amber-600",  sub: "Needs action"},
    { label: "Active services",  value: report?.total_services      ?? "0", icon: Package,       color: "bg-green-50 text-green-600",  sub: "Live now"    },
    { label: "Client chats",     value: report?.total_client_chats  ?? "0", icon: MessageSquare, color: "bg-purple-50 text-purple-600",sub: "All time"   },
  ];

  const bars   = [38, 52, 44, 60, 48, 70, 55];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul"];

  const statusColor: Record<string, string> = {
    scheduled: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
    pending:   "bg-amber-100 text-amber-700",
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Logistics Intelligence Overview</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
          <BarChart2 size={14} className="text-blue-500" />
          <span className="text-xs text-slate-500">Live data</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center mb-3`}>
              <c.icon size={16} />
            </div>
            <p className="text-xs text-slate-400 mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-slate-800">{String(c.value)}</p>
            <p className="text-xs text-green-500 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Revenue — monthly</p>
          <div className="flex items-end gap-2 h-24">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${i === 6 ? "bg-blue-600" : "bg-blue-300"}`} style={{ height: `${h}px` }} />
                <span className="text-xs text-slate-400">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Fleet utilization</p>
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3"
                strokeDasharray={`${kpis?.fleet_utilization ? parseInt(kpis.fleet_utilization) : 78} 100`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-slate-800">{kpis?.fleet_utilization ?? "78%"}</span>
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-xs text-slate-500">Active</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-200" /><span className="text-xs text-slate-500">Idle</span></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent meetings</p>
        {meetings.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No meetings yet</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Client","Email","Date & time","Status"].map((h) => (
                  <th key={h} className="text-left text-xs text-slate-400 font-medium pb-2 px-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meetings.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 last:border-none">
                  <td className="py-2.5 px-2 text-sm font-medium text-slate-700">{m.client_name}</td>
                  <td className="py-2.5 px-2 text-sm text-slate-400">{m.client_email}</td>
                  <td className="py-2.5 px-2 text-sm text-slate-400">{new Date(m.datetime).toLocaleString()}</td>
                  <td className="py-2.5 px-2">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${statusColor[m.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
