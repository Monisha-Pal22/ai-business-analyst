import { useEffect, useState } from "react";
import { getServices, createService, updateService, deleteService } from "../../api/services";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface Service { id: number; title: string; description: string; industry: string; pricing: string; features: string; }

const empty = { title: "", description: "", industry: "Logistics", pricing: "", features: "" };

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState<Service | null>(null);
  const [form,     setForm]     = useState(empty);
  const [loading,  setLoading]  = useState(false);

  const load = () => getServices().then((r) => setServices(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ title: s.title, description: s.description, industry: s.industry, pricing: s.pricing, features: s.features }); setModal(true); };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editing) await updateService(editing.id, form);
      else         await createService(form);
      setModal(false);
      load();
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deactivate this service?")) return;
    await deleteService(id);
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Services catalog</h1>
          <p className="text-slate-400 text-sm mt-0.5">Add, edit, or remove logistics services</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={15} /> Add new service
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">{s.title}</h3>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">{s.industry}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"><Pencil size={13} className="text-slate-400" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={13} className="text-red-400" /></button>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">{s.description}</p>
            <p className="text-sm font-semibold text-blue-600">{s.pricing}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800">{editing ? "Edit service" : "Add new service"}</h2>
              <button onClick={() => setModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>
            {[
              { label: "Title",       key: "title",       type: "text" },
              { label: "Industry",    key: "industry",    type: "text" },
              { label: "Pricing",     key: "pricing",     type: "text" },
            ].map((f) => (
              <div key={f.key} className="mb-3">
                <label className="text-xs font-medium text-slate-600 block mb-1">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div className="mb-3">
              <label className="text-xs font-medium text-slate-600 block mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-600 block mb-1">Features (comma separated)</label>
              <input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModal(false)} className="flex-1 border border-slate-200 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Saving..." : "Save service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}