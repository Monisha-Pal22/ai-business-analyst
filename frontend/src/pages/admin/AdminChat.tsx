// // import { useState } from "react";
// // import { adminChat } from "../../api/chat";
// // import { Send } from "lucide-react";

// // interface Msg { role: "user" | "ai"; text: string; }

// // export default function AdminChat() {
// //   const [messages, setMessages] = useState<Msg[]>([
// //     { role: "ai", text: "Hello! I'm your logistics business analyst. Ask me about fleet performance, delivery trends, cost optimization, or revenue forecasts." }
// //   ]);
// //   const [input,   setInput]   = useState("");
// //   const [loading, setLoading] = useState(false);

// //   const send = async () => {
// //     if (!input.trim() || loading) return;
// //     const text = input.trim();
// //     setMessages((m) => [...m, { role: "user", text }]);
// //     setInput("");
// //     setLoading(true);
// //     try {
// //       const res = await adminChat(text);
// //       setMessages((m) => [...m, { role: "ai", text: res.data.reply }]);
// //     } catch {
// //       setMessages((m) => [...m, { role: "ai", text: "Sorry, something went wrong. Please try again." }]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="p-6 h-full flex flex-col">
// //       <div className="mb-4">
// //         <h1 className="text-2xl font-bold text-slate-800">AI Business Chat</h1>
// //         <p className="text-slate-400 text-sm mt-0.5">Internal analytics assistant — ask anything about logistics data</p>
// //       </div>

// //       <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
// //         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
// //           {messages.map((m, i) => (
// //             <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
// //               <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.role === "ai" ? "bg-blue-100 text-blue-600" : "bg-slate-800 text-white"}`}>
// //                 {m.role === "ai" ? "AI" : "A"}
// //               </div>
// //               <div className={`max-w-3xl px-4 py-2.5 rounded-xl text-sm leading-relaxed ${m.role === "ai" ? "bg-white border border-slate-200 text-slate-600" : "bg-blue-600 text-white"}`}>
// //                 {m.text}
// //               </div>
// //             </div>
// //           ))}
// //           {loading && (
// //             <div className="flex gap-3">
// //               <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
// //               <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-slate-400">Thinking...</div>
// //             </div>
// //           )}
// //         </div>

// //         <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
// //           <input
// //             value={input}
// //             onChange={(e) => setInput(e.target.value)}
// //             onKeyDown={(e) => e.key === "Enter" && send()}
// //             placeholder="Ask about fleet, revenue, deliveries, routes..."
// //             className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />
// //           <button onClick={send} disabled={loading}
// //             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
// //             <Send size={15} />
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import { useState, useRef, useEffect } from "react";
// import { adminChat } from "../../api/chat";
// import { Send, TrendingUp, TrendingDown, Minus } from "lucide-react";

// interface Msg {
//   role: "user" | "ai";
//   text: string;
// }

// // Parse bullet points into structured list items
// function parseInsights(text: string): { bullets: string[]; plain: string } {
//   const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
//   const bullets: string[] = [];
//   const plainLines: string[] = [];

//   for (const line of lines) {
//     if (line.startsWith("- ") || line.startsWith("• ") || line.startsWith("* ")) {
//       bullets.push(line.replace(/^[-•*]\s+/, ""));
//     } else if (/^\d+\.\s/.test(line)) {
//       bullets.push(line.replace(/^\d+\.\s+/, ""));
//     } else {
//       plainLines.push(line);
//     }
//   }

//   return { bullets, plain: plainLines.join(" ") };
// }

// // Detect if text contains metrics (numbers with %)
// function extractMetrics(text: string): { label: string; value: string; trend: "up" | "down" | "flat" }[] {
//   const metrics: { label: string; value: string; trend: "up" | "down" | "flat" }[] = [];
//   const patterns = [
//     /([A-Za-z\s]+):\s*([\d.]+%)/g,
//     /([A-Za-z\s]+):\s*\$?([\d,.]+)/g,
//   ];

//   for (const pattern of patterns) {
//     let m;
//     while ((m = pattern.exec(text)) !== null) {
//       const label = m[1].trim();
//       const value = m[2];
//       if (label.length > 2 && label.length < 40 && metrics.length < 4) {
//         const lowerLabel = label.toLowerCase();
//         const trend =
//           lowerLabel.includes("increas") || lowerLabel.includes("improv") || lowerLabel.includes("up")
//             ? "up"
//             : lowerLabel.includes("decreas") || lowerLabel.includes("delay") || lowerLabel.includes("down")
//             ? "down"
//             : "flat";
//         metrics.push({ label, value, trend });
//       }
//     }
//   }

//   return metrics;
// }

// function AIMessageCard({ text }: { text: string }) {
//   const { bullets, plain } = parseInsights(text);
//   const metrics = extractMetrics(text);
//   const hasStructure = bullets.length >= 2 || metrics.length >= 2;

//   if (!hasStructure) {
//     return (
//       <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-700 leading-relaxed shadow-sm">
//         {text}
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col gap-3">
//       {/* Plain text summary */}
//       {plain && (
//         <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-700 leading-relaxed shadow-sm">
//           {plain}
//         </div>
//       )}

//       {/* Metric cards */}
//       {metrics.length >= 2 && (
//         <div className="grid grid-cols-2 gap-2">
//           {metrics.map((m, i) => (
//             <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
//               <p className="text-xs text-slate-400 mb-1">{m.label}</p>
//               <div className="flex items-center gap-1.5">
//                 <span className="text-lg font-bold text-slate-800">{m.value}</span>
//                 {m.trend === "up" && <TrendingUp size={14} className="text-green-500" />}
//                 {m.trend === "down" && <TrendingDown size={14} className="text-red-500" />}
//                 {m.trend === "flat" && <Minus size={14} className="text-slate-400" />}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Insight bullets */}
//       {bullets.length >= 2 && (
//         <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
//           <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
//             Key Insights
//           </p>
//           <div className="space-y-2">
//             {bullets.map((b, i) => (
//               <div key={i} className="flex gap-2.5 items-start">
//                 <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
//                   {i + 1}
//                 </div>
//                 <p className="text-sm text-slate-600 leading-relaxed">{b}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// const STARTER_PROMPTS = [
//   "How is our delivery performance this month?",
//   "What are our biggest cost optimization opportunities?",
//   "Which routes are most inefficient?",
//   "Summarize our fleet utilization",
// ];

// export default function AdminChat() {
//   const [messages, setMessages] = useState<Msg[]>([
//     {
//       role: "ai",
//       text: "Hello! I'm your logistics business analyst. Ask me about fleet performance, delivery trends, cost optimization, route efficiency, or revenue forecasts. I'll give you structured insights with key metrics."
//     }
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const send = async (customText?: string) => {
//     const text = (customText || input).trim();
//     if (!text || loading) return;

//     setMessages(m => [...m, { role: "user", text }]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await adminChat(text);
//       setMessages(m => [...m, { role: "ai", text: res.data.reply }]);
//     } catch {
//       setMessages(m => [
//         ...m,
//         { role: "ai", text: "Sorry, something went wrong. Please try again." }
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 h-screen flex flex-col">
//       <div className="mb-4">
//         <h1 className="text-2xl font-bold text-slate-800">AI Business Analyst</h1>
//         <p className="text-slate-400 text-sm mt-0.5">
//           Ask about logistics KPIs, costs, routes, and fleet performance
//         </p>
//       </div>

//       <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden min-h-0">
//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">
//           {messages.map((m, i) => (
//             <div
//               key={i}
//               className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
//             >
//               <div
//                 className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${
//                   m.role === "ai"
//                     ? "bg-blue-100 text-blue-600"
//                     : "bg-slate-800 text-white"
//                 }`}
//               >
//                 {m.role === "ai" ? "AI" : "A"}
//               </div>

//               <div className="max-w-2xl w-full">
//                 {m.role === "ai" ? (
//                   <AIMessageCard text={m.text} />
//                 ) : (
//                   <div className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm leading-relaxed">
//                     {m.text}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}

//           {loading && (
//             <div className="flex gap-3">
//               <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
//                 AI
//               </div>
//               <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm">
//                 <div className="flex gap-1">
//                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
//                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
//                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
//                 </div>
//               </div>
//             </div>
//           )}

//           <div ref={bottomRef} />
//         </div>

//         {/* Starter prompts */}
//         {messages.length <= 2 && (
//           <div className="px-4 py-2 flex gap-2 flex-wrap bg-white border-t border-slate-100">
//             {STARTER_PROMPTS.map((q) => (
//               <button
//                 key={q}
//                 onClick={() => send(q)}
//                 className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors"
//               >
//                 {q}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Input */}
//         <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
//           <input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && send()}
//             placeholder="Ask about fleet, revenue, deliveries, route efficiency..."
//             className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <button
//             onClick={() => send()}
//             disabled={loading || !input.trim()}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40"
//           >
//             <Send size={15} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }





// import { useState } from "react";
// import { adminChat } from "../../api/chat";
// import { Send } from "lucide-react";

// interface Msg { role: "user" | "ai"; text: string; table?: TableRow[]; }
// interface TableRow { metric: string; value: string; status: string; }

// function parseTable(text: string): { clean: string; rows: TableRow[] } {
//   const rows: TableRow[] = [];
//   const tableMatch = text.match(/\[TABLE_START\]([\s\S]*?)\[TABLE_END\]/);
//   if (tableMatch) {
//     const lines = tableMatch[1].trim().split('\n').filter(l => l.trim() && !l.includes('Metric | Value'));
//     lines.forEach(line => {
//       const parts = line.split('|').map(p => p.trim());
//       if (parts.length >= 2) {
//         rows.push({ metric: parts[0], value: parts[1], status: parts[2] || '' });
//       }
//     });
//   }
//   const clean = text.replace(/\[TABLE_START\][\s\S]*?\[TABLE_END\]/, '').trim();
//   return { clean, rows };
// }

// const statusColor = (status: string) => {
//   const s = status.toLowerCase();
//   if (s.includes('excel') || s.includes('good')) return 'bg-green-100 text-green-700';
//   if (s.includes('average') || s.includes('ok')) return 'bg-amber-100 text-amber-700';
//   if (s.includes('attention') || s.includes('bad') || s.includes('poor')) return 'bg-red-100 text-red-700';
//   return 'bg-slate-100 text-slate-600';
// };

// export default function AdminChat() {
//   const [messages, setMessages] = useState<Msg[]>([
//     { role: "ai", text: "Hello! I'm your logistics business analyst. Ask me about fleet performance, delivery trends, cost optimization, or revenue forecasts. I'll show you data in a clear table format." }
//   ]);
//   const [input,   setInput]   = useState("");
//   const [loading, setLoading] = useState(false);

//   const send = async () => {
//     if (!input.trim() || loading) return;
//     const text = input.trim();
//     setMessages((m) => [...m, { role: "user", text }]);
//     setInput("");
//     setLoading(true);
//     try {
//       const res = await adminChat(text);
//       const { clean, rows } = parseTable(res.data.reply);
//       setMessages((m) => [...m, { role: "ai", text: clean, table: rows }]);
//     } catch {
//       setMessages((m) => [...m, { role: "ai", text: "Sorry, something went wrong. Please try again." }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const quickQueries = [
//     "How is my business performing?",
//     "Show fleet utilization data",
//     "How can I reduce costs?",
//     "What are delivery performance metrics?",
//   ];

//   return (
//     <div className="p-6 h-screen flex flex-col">
//       <div className="mb-4">
//         <h1 className="text-2xl font-bold text-slate-800">AI Business Chat</h1>
//         <p className="text-slate-400 text-sm mt-0.5">Internal analytics assistant — data shown as tables and cards</p>
//       </div>

//       <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
//         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
//           {messages.map((m, i) => (
//             <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
//               <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.role === "ai" ? "bg-blue-100 text-blue-600" : "bg-slate-800 text-white"}`}>
//                 {m.role === "ai" ? "AI" : "A"}
//               </div>
//               <div className="flex flex-col gap-2 max-w-3xl">
//                 {m.text && (
//                   <div className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed ${m.role === "ai" ? "bg-white border border-slate-200 text-slate-600" : "bg-blue-600 text-white"}`}>
//                     {m.text}
//                   </div>
//                 )}
//                 {/* Analytics Table */}
//                 {m.table && m.table.length > 0 && (
//                   <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
//                     <div className="bg-slate-800 px-4 py-2">
//                       <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Analytics Data</p>
//                     </div>
//                     <table className="w-full">
//                       <thead className="bg-slate-50">
//                         <tr>
//                           <th className="text-left text-xs font-medium text-slate-400 px-4 py-2">Metric</th>
//                           <th className="text-left text-xs font-medium text-slate-400 px-4 py-2">Value</th>
//                           <th className="text-left text-xs font-medium text-slate-400 px-4 py-2">Status</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {m.table.map((row, j) => (
//                           <tr key={j} className="border-t border-slate-50">
//                             <td className="px-4 py-2 text-sm text-slate-600">{row.metric}</td>
//                             <td className="px-4 py-2 text-sm font-semibold text-slate-800">{row.value}</td>
//                             <td className="px-4 py-2">
//                               {row.status && (
//                                 <span className={`text-xs px-2 py-1 rounded-md font-medium ${statusColor(row.status)}`}>
//                                   {row.status}
//                                 </span>
//                               )}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//           {loading && (
//             <div className="flex gap-3">
//               <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
//               <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-slate-400">Analysing data...</div>
//             </div>
//           )}
//         </div>

//         {/* Quick queries */}
//         {messages.length <= 1 && (
//           <div className="px-4 py-3 flex gap-2 flex-wrap border-t border-slate-100 bg-slate-50">
//             {quickQueries.map((q) => (
//               <button key={q} onClick={() => { setInput(q); }}
//                 className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors">
//                 {q}
//               </button>
//             ))}
//           </div>
//         )}

//         <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
//           <input value={input} onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && send()}
//             placeholder="Ask about fleet, revenue, deliveries, routes..."
//             className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
//           <button onClick={send} disabled={loading}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
//             <Send size={15} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }







// import { useState } from "react";
// import { adminChat } from "../../api/chat";
// import { Send } from "lucide-react";

// interface TableRow { metric: string; value: string; status: string; }
// interface Msg { role: "user" | "ai"; text: string; table?: TableRow[]; }

// function parseTable(text: string): { clean: string; rows: TableRow[] } {
//   const rows: TableRow[] = [];
//   const match = text.match(/\[TABLE_START\]([\s\S]*?)\[TABLE_END\]/);
//   if (match) {
//     const lines = match[1].trim().split('\n').filter(l => l.trim() && !l.includes('Metric | Value'));
//     lines.forEach(line => {
//       const parts = line.split('|').map(p => p.trim());
//       if (parts.length >= 2) rows.push({ metric: parts[0], value: parts[1], status: parts[2] || '' });
//     });
//   }
//   const clean = text.replace(/\[TABLE_START\][\s\S]*?\[TABLE_END\]/, '').trim();
//   return { clean, rows };
// }

// const statusColor = (s: string) => {
//   const sl = s.toLowerCase();
//   if (sl.includes('excel') || sl.includes('great')) return 'bg-green-100 text-green-700';
//   if (sl.includes('good')) return 'bg-blue-100 text-blue-700';
//   if (sl.includes('average') || sl.includes('ok')) return 'bg-amber-100 text-amber-700';
//   if (sl.includes('attention') || sl.includes('poor') || sl.includes('bad')) return 'bg-red-100 text-red-700';
//   return 'bg-slate-100 text-slate-600';
// };

// export default function AdminChat() {
//   const [messages, setMessages] = useState<Msg[]>([
//     { role: "ai", text: "Hello! I'm your AI business analyst. I can check today's meetings, analyse your business performance, and give you actionable recommendations. What would you like to know?" }
//   ]);
//   const [input,   setInput]   = useState("");
//   const [loading, setLoading] = useState(false);

//   const send = async (customText?: string) => {
//     const text = customText || input.trim();
//     if (!text || loading) return;
//     setMessages((m) => [...m, { role: "user", text }]);
//     setInput("");
//     setLoading(true);
//     try {
//       const res = await adminChat(text);
//       const { clean, rows } = parseTable(res.data.reply);
//       setMessages((m) => [...m, { role: "ai", text: clean, table: rows.length > 0 ? rows : undefined }]);
//     } catch {
//       setMessages((m) => [...m, { role: "ai", text: "Sorry, something went wrong. Please try again." }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const quickQueries = [
//     "Do I have any meetings today?",
//     "How is my business performing?",
//     "What needs my attention right now?",
//     "Show me delivery performance data",
//     "How can I reduce costs?",
//   ];

//   return (
//     <div className="p-6 h-screen flex flex-col">
//       <div className="mb-4">
//         <h1 className="text-2xl font-bold text-slate-800">AI Business Analyst</h1>
//         <p className="text-slate-400 text-sm mt-0.5">Check meetings, analyse business data, get recommendations</p>
//       </div>

//       <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
//         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
//           {messages.map((m, i) => (
//             <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
//               <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.role === "ai" ? "bg-blue-100 text-blue-600" : "bg-slate-800 text-white"}`}>
//                 {m.role === "ai" ? "AI" : "A"}
//               </div>
//               <div className="flex flex-col gap-2 max-w-3xl">
//                 {m.text && (
//                   <div className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed ${m.role === "ai" ? "bg-white border border-slate-200 text-slate-600" : "bg-blue-600 text-white"}`}>
//                     {m.text}
//                   </div>
//                 )}
//                 {m.table && m.table.length > 0 && (
//                   <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
//                     <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
//                       <div className="w-2 h-2 rounded-full bg-green-400"></div>
//                       <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Business Analytics</p>
//                     </div>
//                     <table className="w-full">
//                       <thead className="bg-slate-50">
//                         <tr>
//                           <th className="text-left text-xs font-medium text-slate-400 px-4 py-2">Metric</th>
//                           <th className="text-left text-xs font-medium text-slate-400 px-4 py-2">Value</th>
//                           <th className="text-left text-xs font-medium text-slate-400 px-4 py-2">Status</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {m.table.map((row, j) => (
//                           <tr key={j} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
//                             <td className="px-4 py-2.5 text-sm text-slate-600">{row.metric}</td>
//                             <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">{row.value}</td>
//                             <td className="px-4 py-2.5">
//                               {row.status && <span className={`text-xs px-2 py-1 rounded-md font-medium ${statusColor(row.status)}`}>{row.status}</span>}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//           {loading && (
//             <div className="flex gap-3">
//               <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
//               <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-slate-400">Analysing data...</div>
//             </div>
//           )}
//         </div>

//         {messages.length <= 1 && (
//           <div className="px-4 py-3 flex gap-2 flex-wrap border-t border-slate-100 bg-slate-50">
//             {quickQueries.map((q) => (
//               <button key={q} onClick={() => send(q)}
//                 className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors">
//                 {q}
//               </button>
//             ))}
//           </div>
//         )}

//         <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
//           <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
//             placeholder="Ask about meetings, performance, costs, recommendations..."
//             className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
//           <button onClick={() => send()} disabled={loading}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
//             <Send size={15} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }





import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import api from "../../api/config";

interface TableRow { metric: string; value: string; status: string; }
interface Msg { role: "user" | "ai"; text: string; table?: TableRow[]; }

function parseTable(text: string): { clean: string; rows: TableRow[] } {
  const rows: TableRow[] = [];
  const match = text.match(/\[TABLE_START\]([\s\S]*?)\[TABLE_END\]/);
  if (match) {
    const lines = match[1].trim().split('\n').filter(l => l.trim() && !l.toLowerCase().includes('metric'));
    lines.forEach(line => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2 && parts[0]) {
        rows.push({ metric: parts[0], value: parts[1] || '', status: parts[2] || '' });
      }
    });
  }
  const clean = text.replace(/\[TABLE_START\][\s\S]*?\[TABLE_END\]/, '').trim();
  return { clean, rows };
}

const statusColor = (s: string) => {
  const sl = (s || '').toLowerCase();
  if (sl.includes('excel') || sl.includes('great') || sl.includes('good')) return 'bg-green-100 text-green-700';
  if (sl.includes('average') || sl.includes('active')) return 'bg-blue-100 text-blue-700';
  if (sl.includes('attention') || sl.includes('follow') || sl.includes('risk') || sl.includes('below')) return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-600';
};

export default function AdminChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Good morning! I'm Alexa, your business assistant. I can check today's meetings, show your business status, identify risks, and give you an action plan. What would you like to know?" }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const historyRef = useRef<{role:string; content:string}[]>([]);
  const bottomRef  = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (customText?: string) => {
    const text = customText || input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    historyRef.current = [...historyRef.current, { role: "user", content: text }];
    
    try {
      const res = await api.post("/admin/chat", { message: text });
      const { clean, rows } = parseTable(res.data.reply);
      historyRef.current = [...historyRef.current, { role: "assistant", content: clean }];
      setMessages((m) => [...m, {
        role: "ai",
        text: clean,
        table: rows.length > 0 ? rows : undefined
      }]);
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || "Something went wrong. Please try again.";
      setMessages((m) => [...m, { role: "ai", text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQueries = [
    "Give me today's business status",
    "Do I have any meetings today?",
    "What needs my attention right now?",
    "Show me the leads pipeline",
    "What should I focus on next 4 hours?",
    "Any risks I should know about?",
  ];

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">AI Business Assistant</h1>
        <p className="text-slate-400 text-sm mt-0.5">Alexa — Your personal business intelligence assistant</p>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.role === "ai" ? "bg-blue-100 text-blue-600" : "bg-slate-800 text-white"}`}>
                {m.role === "ai" ? "AI" : "A"}
              </div>
              <div className="flex flex-col gap-2 max-w-3xl">
                {m.text && (
                  <div className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === "ai" ? "bg-white border border-slate-200 text-slate-600" : "bg-blue-600 text-white"}`}>
                    {m.text}
                  </div>
                )}
                {m.table && m.table.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Business Data</p>
                    </div>
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left text-xs font-medium text-slate-400 px-4 py-2">Metric</th>
                          <th className="text-left text-xs font-medium text-slate-400 px-4 py-2">Value</th>
                          <th className="text-left text-xs font-medium text-slate-400 px-4 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.table.map((row, j) => (
                          <tr key={j} className="border-t border-slate-50 hover:bg-slate-50">
                            <td className="px-4 py-2.5 text-sm text-slate-600">{row.metric}</td>
                            <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">{row.value}</td>
                            <td className="px-4 py-2.5">
                              {row.status && (
                                <span className={`text-xs px-2 py-1 rounded-md font-medium ${statusColor(row.status)}`}>
                                  {row.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
              <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-slate-400">
                Analysing your business data...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-4 py-3 flex gap-2 flex-wrap border-t border-slate-100 bg-slate-50">
            {quickQueries.map((q) => (
              <button key={q} onClick={() => send(q)}
                className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about meetings, business status, leads, risks..."
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={() => send()} disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
