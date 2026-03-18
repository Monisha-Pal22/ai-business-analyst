import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { adminLogin } from "../../api/auth";

export default function AdminLogin() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const login    = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await adminLogin(email, password);
      login(res.data.access_token, "admin");
      navigate("/admin/dashboard");
    } catch {
      setError("Wrong email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-sm">
        <div className="flex justify-center mb-5">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <span className="text-blue-400 font-bold text-lg">L</span>
          </div>
        </div>
        <h1 className="text-xl font-bold text-slate-800 text-center mb-1">Admin Portal</h1>
        <p className="text-slate-400 text-xs text-center mb-6">Logistics Intelligence Platform v2.0</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in to dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}