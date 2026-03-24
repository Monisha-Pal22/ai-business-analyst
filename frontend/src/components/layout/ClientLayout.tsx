// import { Outlet, NavLink, useNavigate } from "react-router-dom";
// import { MessageCircle } from "lucide-react";

// export default function ClientLayout() {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-slate-100">
//       {/* Navbar */}
//       <nav className="bg-slate-900 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
//         <div className="flex items-center gap-2">
//           <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
//             <span className="text-white text-xs font-bold">L</span>
//           </div>
//           <span className="text-white font-bold text-sm">LogiAI</span>
//         </div>
//         <div className="flex items-center gap-6">
//           {[
//             { to: "/",         label: "Home"     },
//             { to: "/services", label: "Services" },
//             { to: "/book",     label: "Book meeting" },
//           ].map((l) => (
//             <NavLink
//               key={l.to}
//               to={l.to}
//               end={l.to === "/"}
//               className={({ isActive }) =>
//                 `text-xs font-medium transition-colors ${
//                   isActive ? "text-blue-400" : "text-slate-400 hover:text-white"
//                 }`
//               }
//             >
//               {l.label}
//             </NavLink>
//           ))}
//         </div>
//         <div className="flex items-center gap-3">
//           <NavLink to="/login"    className="text-xs text-slate-400 hover:text-white transition-colors">Login</NavLink>
//           <NavLink to="/register" className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">Register</NavLink>
//         </div>
//       </nav>

//       {/* Page content */}
//       <Outlet />

//       {/* Floating chat bubble */}
//       <button
//         onClick={() => navigate("/chat")}
//         className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50"
//       >
//         <MessageCircle size={22} className="text-white" />
//       </button>
//     </div>
//   );
// }





// import { useState } from "react";
// import { Outlet, NavLink, useNavigate } from "react-router-dom";
// import { MessageCircle, X } from "lucide-react";
// import ChatWidget from "../../pages/client/ChatWidget";

import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
// import { Outlet, NavLink, useNavigate } from "react-router-dom";
// import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import ChatWidget from "../../pages/client/ChatWidget";

export default function ClientLayout() {
  // const navigate  = useNavigate();
  // const navigate  = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <nav className="bg-slate-900 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">L</span>
          </div>
          <span className="text-white font-bold text-sm">LogiAI</span>
        </div>
        <div className="flex items-center gap-6">
          {[
            { to: "/",         label: "Home"         },
            { to: "/services", label: "Services"     },
            { to: "/book",     label: "Book meeting" },
          ].map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"}
              className={({ isActive }) =>
                `text-xs font-medium transition-colors ${isActive ? "text-blue-400" : "text-slate-400 hover:text-white"}`
              }>
              {l.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <NavLink to="/login"    className="text-xs text-slate-400 hover:text-white transition-colors">Login</NavLink>
          <NavLink to="/register" className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">Register</NavLink>
        </div>
      </nav>

      {/* Page content */}
      <Outlet />

      {/* Floating chat bubble */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all z-50 hover:scale-110">
          <MessageCircle size={24} className="text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Chat popup */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-2xl overflow-hidden"
          style={{ width: "380px", height: "580px" }}>
          <ChatWidget isPopup={true} onClose={() => setChatOpen(false)} />
        </div>
      )}
    </div>
  );
}