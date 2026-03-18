import { useEffect, useState } from "react";
import { getWeeklySummary, getMonthlySummary } from "../../api/analytics";
import { FileText } from "lucide-react";

export default function Reports() {
  const [weekly,  setWeekly]  = useState("");
  const [monthly, setMonthly] = useState("");
  const [loading, setLoading] = useState(false);

  const loadWeekly  = async () => { const r = await getWeeklySummary();  setWeekly(r.data.summary);  };
  const loadMonthly = async () => { const r = await getMonthlySummary(); setMonthly(r.data.summary); };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadWeekly(), loadMonthly()]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="text-slate-400 text-sm mt-0.5">Weekly & monthly automated logistics reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadWeekly}  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <FileText size={14} /> Refresh weekly
          </button>
          <button onClick={loadMonthly} className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <FileText size={14} /> Refresh monthly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-slate-400 text-sm">Loading reports...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Weekly performance summary</p>
            <pre className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 rounded-lg p-4 whitespace-pre-wrap overflow-auto max-h-96">{weekly || "No data yet"}</pre>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Monthly performance report</p>
            <pre className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 rounded-lg p-4 whitespace-pre-wrap overflow-auto max-h-96">{monthly || "No data yet"}</pre>
          </div>
        </div>
      )}
    </div>
  );
}