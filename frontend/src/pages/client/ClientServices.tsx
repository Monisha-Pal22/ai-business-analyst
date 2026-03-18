import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getServices } from "../../api/services";

interface Service { id: number; title: string; description: string; industry: string; pricing: string; features: string; }

export default function ClientServices() {
  const [services, setServices] = useState<Service[]>([]);
  const navigate = useNavigate();

  useEffect(() => { getServices().then((r) => setServices(r.data)).catch(() => {}); }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Our services</h1>
        <p className="text-slate-400 text-sm">Choose the right logistics solution for your business</p>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No services available yet.</div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 text-lg font-bold">
                {s.title.charAt(0)}
              </div>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md w-fit mb-3">{s.industry}</span>
              <h3 className="font-semibold text-slate-800 mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-3 flex-1">{s.description}</p>
              {s.features && (
                <ul className="mb-4 space-y-1">
                  {s.features.split(",").map((f) => (
                    <li key={f} className="text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                      {f.trim()}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sm font-bold text-blue-600">{s.pricing}</span>
                <button onClick={() => navigate("/book")}
                  className="bg-slate-900 text-white text-xs px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
                  Book now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}