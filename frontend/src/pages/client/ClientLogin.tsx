import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { clientLogin } from "../../api/auth";
import { useAuthStore } from "../../store/authStore";

export default function ClientLogin() {
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
      const res = await clientLogin(email, password);
      login(res.data.access_token, "client");
      navigate("/");
    } catch {
      setError("Wrong email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Welcome back</h1>
        <p className="text-slate-400 text-xs mb-6">Sign in to your LogiAI account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-center text-xs text-slate-400 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}