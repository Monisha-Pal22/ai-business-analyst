// // import { useState } from 'react'
// // import reactLogo from './assets/react.svg'
// // import viteLogo from './assets/vite.svg'
// // import heroImg from './assets/hero.png'
// // import './App.css'

// // function App() {
// //   const [count, setCount] = useState(0)

// //   return (
// //     <>
// //       <section id="center">
// //         <div className="hero">
// //           <img src={heroImg} className="base" width="170" height="179" alt="" />
// //           <img src={reactLogo} className="framework" alt="React logo" />
// //           <img src={viteLogo} className="vite" alt="Vite logo" />
// //         </div>
// //         <div>
// //           <h1>Get started</h1>
// //           <p>
// //             Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
// //           </p>
// //         </div>
// //         <button
// //           className="counter"
// //           onClick={() => setCount((count) => count + 1)}
// //         >
// //           Count is {count}
// //         </button>
// //       </section>

// //       <div className="ticks"></div>

// //       <section id="next-steps">
// //         <div id="docs">
// //           <svg className="icon" role="presentation" aria-hidden="true">
// //             <use href="/icons.svg#documentation-icon"></use>
// //           </svg>
// //           <h2>Documentation</h2>
// //           <p>Your questions, answered</p>
// //           <ul>
// //             <li>
// //               <a href="https://vite.dev/" target="_blank">
// //                 <img className="logo" src={viteLogo} alt="" />
// //                 Explore Vite
// //               </a>
// //             </li>
// //             <li>
// //               <a href="https://react.dev/" target="_blank">
// //                 <img className="button-icon" src={reactLogo} alt="" />
// //                 Learn more
// //               </a>
// //             </li>
// //           </ul>
// //         </div>
// //         <div id="social">
// //           <svg className="icon" role="presentation" aria-hidden="true">
// //             <use href="/icons.svg#social-icon"></use>
// //           </svg>
// //           <h2>Connect with us</h2>
// //           <p>Join the Vite community</p>
// //           <ul>
// //             <li>
// //               <a href="https://github.com/vitejs/vite" target="_blank">
// //                 <svg
// //                   className="button-icon"
// //                   role="presentation"
// //                   aria-hidden="true"
// //                 >
// //                   <use href="/icons.svg#github-icon"></use>
// //                 </svg>
// //                 GitHub
// //               </a>
// //             </li>
// //             <li>
// //               <a href="https://chat.vite.dev/" target="_blank">
// //                 <svg
// //                   className="button-icon"
// //                   role="presentation"
// //                   aria-hidden="true"
// //                 >
// //                   <use href="/icons.svg#discord-icon"></use>
// //                 </svg>
// //                 Discord
// //               </a>
// //             </li>
// //             <li>
// //               <a href="https://x.com/vite_js" target="_blank">
// //                 <svg
// //                   className="button-icon"
// //                   role="presentation"
// //                   aria-hidden="true"
// //                 >
// //                   <use href="/icons.svg#x-icon"></use>
// //                 </svg>
// //                 X.com
// //               </a>
// //             </li>
// //             <li>
// //               <a href="https://bsky.app/profile/vite.dev" target="_blank">
// //                 <svg
// //                   className="button-icon"
// //                   role="presentation"
// //                   aria-hidden="true"
// //                 >
// //                   <use href="/icons.svg#bluesky-icon"></use>
// //                 </svg>
// //                 Bluesky
// //               </a>
// //             </li>
// //           </ul>
// //         </div>
// //       </section>

// //       <div className="ticks"></div>
// //       <section id="spacer"></section>
// //     </>
// //   )
// // }

// // export default App




// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useAuthStore } from "./store/authStore";

// // Admin pages
// import AdminLogin from "./pages/admin/AdminLogin";
// import AdminLayout from "./components/layout/AdminLayout";
// import Dashboard from "./pages/admin/Dashboard";
// import Services from "./pages/admin/Services";
// import Meetings from "./pages/admin/Meetings";
// import Analytics from "./pages/admin/Analytics";
// import Reports from "./pages/admin/Reports";
// import AdminChat from "./pages/admin/AdminChat";
// import AuditLogs from "./pages/admin/AuditLogs";

// // Client pages
// import ClientLayout from "./components/layout/ClientLayout";
// import Home from "./pages/client/Home";
// import ClientServices from "./pages/client/ClientServices";
// import BookMeeting from "./pages/client/BookMeeting";
// import ClientLogin from "./pages/client/ClientLogin";
// import ClientRegister from "./pages/client/ClientRegister";
// import ChatWidget from "./pages/client/ChatWidget";

// function AdminRoute({ children }: { children: React.ReactNode }) {
//   const token = useAuthStore((s) => s.token);
//   const role  = useAuthStore((s) => s.role);
//   if (!token || role !== "admin") return <Navigate to="/admin/login" />;
//   return <>{children}</>;
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Admin routes */}
//         <Route path="/admin/login" element={<AdminLogin />} />
//         <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
//           <Route index element={<Navigate to="/admin/dashboard" />} />
//           <Route path="dashboard" element={<Dashboard />} />
//           <Route path="services"  element={<Services />} />
//           <Route path="meetings"  element={<Meetings />} />
//           <Route path="analytics" element={<Analytics />} />
//           <Route path="reports"   element={<Reports />} />
//           <Route path="chat"      element={<AdminChat />} />
//           <Route path="audit"     element={<AuditLogs />} />
//         </Route>

//         {/* Client routes */}
//         <Route path="/" element={<ClientLayout />}>
//           <Route index element={<Home />} />
//           <Route path="services"  element={<ClientServices />} />
//           <Route path="book"      element={<BookMeeting />} />
//           <Route path="login"     element={<ClientLogin />} />
//           <Route path="register"  element={<ClientRegister />} />
//           <Route path="chat"      element={<ChatWidget />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }



import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Admin pages
import AdminLogin    from "./pages/admin/AdminLogin";
import AdminLayout   from "./components/layout/AdminLayout";
import Dashboard     from "./pages/admin/Dashboard";
import Services      from "./pages/admin/Services";
import Meetings      from "./pages/admin/Meetings";
import Analytics     from "./pages/admin/Analytics";
import Reports       from "./pages/admin/Reports";
import AdminChat     from "./pages/admin/AdminChat";
import AuditLogs     from "./pages/admin/AuditLogs";

// Client pages
import ClientLayout  from "./components/layout/ClientLayout";
import Home          from "./pages/client/Home";
import ClientServices from "./pages/client/ClientServices";
import BookMeeting   from "./pages/client/BookMeeting";
import ClientLogin   from "./pages/client/ClientLogin";
import ClientRegister from "./pages/client/ClientRegister";
import ChatWidget    from "./pages/client/ChatWidget";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const role  = useAuthStore((s) => s.role);
  // if (!token || role !== "admin") return <Navigate to="/admin/login" />;
  // if (!token || !role) return <Navigate to="/admin/login" />;
  if (!token || !role) return <Navigate to="/admin/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminRoute><AdminLayout /></AdminRoute>
        }>
          <Route index              element={<Dashboard />} />
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="services"    element={<Services />} />
          <Route path="meetings"    element={<Meetings />} />
          <Route path="analytics"   element={<Analytics />} />
          <Route path="reports"     element={<Reports />} />
          <Route path="chat"        element={<AdminChat />} />
          <Route path="audit-logs"  element={<AuditLogs />} />
        </Route>

        {/* Client routes */}
        <Route path="/" element={<ClientLayout />}>
          <Route index              element={<Home />} />
          <Route path="services"    element={<ClientServices />} />
          <Route path="book"        element={<BookMeeting />} />
          <Route path="login"       element={<ClientLogin />} />
          <Route path="register"    element={<ClientRegister />} />
          <Route path="chat"        element={<ChatWidget />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}