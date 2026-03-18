import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { clientRegister } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";

export default function ClientRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", company: "", requirements: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const login    = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await clientRegister(form);
      login(res.data.access_token, "client");
      navigate("/");
    } catch {
      setError("Registration failed. Email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Full name",     key: "name",         type: "text",     placeholder: "Your full name",      required: true  },
    { label: "Email address", key: "email",         type: "email",    placeholder: "your@email.com",      required: true  },
    { label: "Password",      key: "password",      type: "password", placeholder: "••••••••",            required: true  },
    { label: "Phone number",  key: "phone",         type: "text",     placeholder: "+91 xxxxx xxxxx",     required: false },
    { label: "Company name",  key: "company",       type: "text",     placeholder: "Your company",        required: false },
    { label: "Requirements",  key: "requirements",  type: "text",     placeholder: "What do you need?",   required: false },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Create account</h1>
        <p className="text-slate-400 text-xs mb-6">Join the LogiAI platform</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-slate-600 block mb-1">{f.label}</label>
              <input type={f.type} required={f.required}
                value={(form as any)[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-4">
          Already registered?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}