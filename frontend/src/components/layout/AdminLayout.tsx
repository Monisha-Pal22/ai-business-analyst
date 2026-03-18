import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  LayoutDashboard, Package, CalendarDays,
  BarChart2, FileText, MessageSquare,
  ShieldCheck, LogOut
} from "lucide-react";

const links = [
  { to: "/admin/dashboard",  label: "Dashboard",  icon: LayoutDashboard, section: "Main" },
  { to: "/admin/services",   label: "Services",   icon: Package,          section: "Main" },
  { to: "/admin/meetings",   label: "Meetings",   icon: CalendarDays,     section: "Main" },
  { to: "/admin/analytics",  label: "Analytics",  icon: BarChart2,        section: "Analytics" },
  { to: "/admin/reports",    label: "Reports",    icon: FileText,         section: "Analytics" },
  { to: "/admin/chat",       label: "AI Chat",    icon: MessageSquare,    section: "Admin" },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck,      section: "Admin" },
];

export default function AdminLayout() {
  const logout   = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const sections = ["Main", "Analytics", "Admin"];

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-52 bg-slate-900 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            <div>
              <p className="text-white text-sm font-bold">LogiAI</p>
              <p className="text-slate-400 text-xs">Admin Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {sections.map((section) => (
            <div key={section} className="mb-2">
              <p className="text-slate-500 text-xs uppercase tracking-widest px-4 py-2">
                {section}
              </p>
              {links.filter((l) => l.section === section).map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 text-sm transition-all border-l-2 ${
                      isActive
                        ? "text-white bg-slate-700 border-blue-500"
                        : "text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200"
                    }`
                  }
                >
                  <link.icon size={15} />
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all text-sm border-t border-slate-700"
        >
          <LogOut size={15} />
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}