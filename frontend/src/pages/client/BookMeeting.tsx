import { useState } from "react";
import { scheduleMeeting } from "../../api/meetings";
import { CalendarCheck } from "lucide-react";

export default function BookMeeting() {
  const [form, setForm] = useState({ client_name: "", client_email: "", datetime_str: "", notes: "" });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await scheduleMeeting(form);
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarCheck size={28} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Meeting scheduled!</h2>
        <p className="text-slate-400 text-sm mb-6">Our team will confirm your meeting within 2 hours.</p>
        <button onClick={() => setSuccess(false)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
          Book another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Book a meeting</h1>
        <p className="text-slate-400 text-sm">Schedule a call with our logistics experts</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Full name</label>
            <input type="text" required value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              placeholder="Your full name"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Email address</label>
            <input type="email" required value={form.client_email}
              onChange={(e) => setForm({ ...form, client_email: e.target.value })}
              placeholder="your@email.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Preferred date & time</label>
            <input type="datetime-local" required value={form.datetime_str.replace(" ", "T")}
              onChange={(e) => setForm({ ...form, datetime_str: e.target.value.replace("T", " ") })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Notes (optional)</label>
            <textarea rows={3} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="What would you like to discuss?"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? "Scheduling..." : "Schedule meeting"}
          </button>
        </form>
      </div>
    </div>
  );
}