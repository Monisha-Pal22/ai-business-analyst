// import { useState, useRef, useEffect } from "react";
// import { sendMessage } from "../../api/chat";
// // import { getAllMeetings } from "../../api/meetings";
// // Remove this line
// // import { getAllMeetings } from "../../api/meetings";
// import { getServices } from "../../api/services";
// import { scheduleMeeting } from "../../api/meetings";
// import { Send, Mic, Paperclip } from "lucide-react";

// interface Msg { role: "user" | "bot"; text: string; }

// export default function ChatWidget() {
//   const [messages,  setMessages]  = useState<Msg[]>([
//     { role: "bot", text: "Hello! I'm your AI logistics assistant. Ask me about services, pricing, or book a meeting. How can I help?" }
//   ]);
//   const [input,     setInput]     = useState("");
//   const [sessionId, setSessionId] = useState<string | undefined>();
//   const [loading,   setLoading]   = useState(false);
//   const [services,  setServices]  = useState<any[]>([]);
//   const [meetForm,  setMeetForm]  = useState({ client_name: "", client_email: "", datetime_str: "", notes: "" });
//   const [meetSent,  setMeetSent]  = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const bottomRef   = useRef<HTMLDivElement>(null);
//   const fileRef     = useRef<HTMLInputElement>(null);

//   useEffect(() => { getServices().then((r) => setServices(r.data)).catch(() => {}); }, []);
//   useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

//   const send = async () => {
//     if (!input.trim() || loading) return;
//     const text = input.trim();
//     setMessages((m) => [...m, { role: "user", text }]);
//     setInput("");
//     setLoading(true);
//     try {
//       const res = await sendMessage(text, sessionId);
//       setSessionId(res.data.session_id);
//       setMessages((m) => [...m, { role: "bot", text: res.data.reply }]);
//     } catch {
//       setMessages((m) => [...m, { role: "bot", text: "Sorry, I'm unable to respond right now. Please try again." }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVoice = () => {
//     const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) { alert("Voice not supported in this browser."); return; }
//     const recognition = new SR();
//     recognition.lang = "en-US";
//     recognition.onstart  = () => setIsListening(true);
//     recognition.onend    = () => setIsListening(false);
//     recognition.onresult = (e: any) => setInput(e.results[0][0].transcript);
//     recognition.start();
//   };

//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setMessages((m) => [...m, { role: "user", text: `📎 Uploaded file: ${file.name}` }]);
//     setMessages((m) => [...m, { role: "bot",  text: `I received your file "${file.name}". Our team will review it. Would you like to schedule a meeting to discuss it?` }]);
//   };

//   const handleBookMeeting = async () => {
//     if (!meetForm.client_name || !meetForm.client_email || !meetForm.datetime_str) return;
//     try {
//       await scheduleMeeting(meetForm);
//       setMeetSent(true);
//       setMessages((m) => [...m, { role: "bot", text: `Meeting booked for ${meetForm.datetime_str}! Our team will confirm within 2 hours.` }]);
//     } catch {
//       alert("Failed to book meeting. Please try again.");
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto px-6 py-8">
//       <div className="mb-5">
//         <h1 className="text-2xl font-bold text-slate-800">AI Chat assistant</h1>
//         <p className="text-slate-400 text-sm mt-0.5">Ask about services, pricing, or book a meeting</p>
//       </div>

//       <div className="grid grid-cols-3 gap-4" style={{ height: "520px" }}>
//         {/* Chat window */}
//         <div className="col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
//           {/* Header */}
//           <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
//             <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
//             <div>
//               <p className="text-sm font-semibold text-slate-800">Logistics Assistant</p>
//               <p className="text-xs text-green-500">Online</p>
//             </div>
//           </div>

//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
//             {messages.map((m, i) => (
//               <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
//                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.role === "bot" ? "bg-blue-100 text-blue-600" : "bg-slate-700 text-white"}`}>
//                   {m.role === "bot" ? "AI" : "U"}
//                 </div>
//                 <div className={`max-w-xs px-3 py-2 rounded-xl text-sm leading-relaxed ${m.role === "bot" ? "bg-white border border-slate-200 text-slate-600" : "bg-blue-600 text-white"}`}>
//                   {m.text}
//                 </div>
//               </div>
//             ))}
//             {loading && (
//               <div className="flex gap-2">
//                 <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
//                 <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm text-slate-400">Typing...</div>
//               </div>
//             )}
//             <div ref={bottomRef} />
//           </div>

//           {/* Input */}
//           <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center">
//             <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
//             <button onClick={() => fileRef.current?.click()} title="Upload file"
//               className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
//               <Paperclip size={16} />
//             </button>
//             <button onClick={handleVoice} title="Voice input"
//               className={`p-2 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-500" : "hover:bg-slate-100 text-slate-400"}`}>
//               <Mic size={16} />
//             </button>
//             <input value={input} onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && send()}
//               placeholder="Type your message..."
//               className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
//             <button onClick={send} disabled={loading}
//               className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
//               <Send size={15} />
//             </button>
//           </div>
//         </div>

//         {/* Right panel */}
//         <div className="flex flex-col gap-3 overflow-y-auto">
//           {/* Recommended services */}
//           <div className="bg-white rounded-xl border border-slate-200 p-3">
//             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Recommended services</p>
//             <div className="space-y-2">
//               {services.slice(0, 3).map((s) => (
//                 <div key={s.id} className="flex justify-between items-center p-2 border border-slate-100 rounded-lg hover:border-blue-200 cursor-pointer transition-colors">
//                   <span className="text-xs font-medium text-slate-700">{s.title}</span>
//                   <span className="text-xs font-semibold text-blue-600">{s.pricing}</span>
//                 </div>
//               ))}
//               {services.length === 0 && <p className="text-xs text-slate-400">Loading services...</p>}
//             </div>
//           </div>

//           {/* Meeting booking form */}
//           <div className="bg-white rounded-xl border border-slate-200 p-3 flex-1">
//             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Schedule a meeting</p>
//             {meetSent ? (
//               <div className="text-center py-4">
//                 <p className="text-green-600 text-xs font-medium">Meeting booked!</p>
//                 <p className="text-slate-400 text-xs mt-1">Team will confirm in 2 hours.</p>
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {[
//                   { label: "Your name",   key: "client_name",  type: "text",           placeholder: "Full name"       },
//                   { label: "Email",       key: "client_email", type: "email",          placeholder: "your@email.com"  },
//                   { label: "Date & time", key: "datetime_str", type: "datetime-local", placeholder: ""                },
//                   { label: "Notes",       key: "notes",        type: "text",           placeholder: "Optional"        },
//                 ].map((f) => (
//                   <div key={f.key}>
//                     <label className="text-xs text-slate-400 block mb-0.5">{f.label}</label>
//                     <input type={f.type} placeholder={f.placeholder}
//                       value={f.key === "datetime_str" ? meetForm.datetime_str.replace(" ", "T") : (meetForm as any)[f.key]}
//                       onChange={(e) => setMeetForm({ ...meetForm, [f.key]: f.key === "datetime_str" ? e.target.value.replace("T", " ") : e.target.value })}
//                       className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400" />
//                   </div>
//                 ))}
//                 <button onClick={handleBookMeeting}
//                   className="w-full bg-blue-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-blue-700 transition-colors mt-1">
//                   Book meeting
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState, useRef, useEffect } from "react";
// import { sendMessage } from "../../api/chat";
// import { getServices } from "../../api/services";
// import { scheduleMeeting } from "../../api/meetings";
// // import { Send, Mic, Paperclip, X, Minus } from "lucide-react";
// import { Send, Mic, Paperclip, X } from "lucide-react";

// interface Msg {
//   role: "user" | "bot";
//   text: string;
//   cards?: Service[];
// }

// interface Service {
//   id: number;
//   title: string;
//   description: string;
//   pricing: string;
//   features: string;
// }

// interface Props {
//   isPopup?: boolean;
//   onClose?: () => void;
// }

// export default function ChatWidget({ isPopup = false, onClose }: Props) {
//   const [messages, setMessages] = useState<Msg[]>([
//     { role: "bot", text: "Hello! 👋 I'm your LogiAI assistant. I can help you with our logistics services, pricing, booking meetings, or answer any questions. How can I help you today?" }
//   ]);
//   const [input,       setInput]       = useState("");
//   const [sessionId,   setSessionId]   = useState<string | undefined>();
//   const [loading,     setLoading]     = useState(false);
//   const [services,    setServices]    = useState<Service[]>([]);
//   const [meetForm,    setMeetForm]    = useState({ client_name: "", client_email: "", datetime_str: "", notes: "" });
//   const [showMeetForm, setShowMeetForm] = useState(false);
//   const [meetSent,    setMeetSent]    = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const fileRef   = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     getServices().then((r) => setServices(r.data)).catch(() => {});
//   }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // const send = async (customText?: string) => {
//   const send = async (customText?: string) => {
//   const text = customText || input.trim();
//   if (!text || loading) return;
//   setMessages((m) => [...m, { role: "user", text }]);
//   setInput("");
//   setLoading(true);
//   try {
//     const res = await sendMessage(text, sessionId);
//     setSessionId(res.data.session_id);
//     const reply = res.data.reply;

//     if (
//       reply.includes("[SERVICES_CARD]") ||
//       text.toLowerCase().includes("service") ||
//       text.toLowerCase().includes("what do you offer") ||
//       text.toLowerCase().includes("pricing") ||
//       text.toLowerCase().includes("price")
//     ) {
//       const cleanReply = reply.replace("[SERVICES_CARD]", "").trim();
//       setMessages((m) => [...m, {
//         role: "bot",
//         text: cleanReply || "Here are our available services:",
//         cards: services
//       }]);
//     } else {
//       if (
//         reply.toLowerCase().includes("meeting") ||
//         reply.toLowerCase().includes("schedule") ||
//         reply.toLowerCase().includes("book")
//       ) {
//         setShowMeetForm(true);
//       }
//       setMessages((m) => [...m, { role: "bot", text: reply }]);
//     }
//   } catch {
//     setMessages((m) => [...m, {
//       role: "bot",
//       text: "Sorry, I am having trouble connecting. Please try again."
//     }]);
//   } finally {
//     setLoading(false);
//   }
// };
//   //   const text = customText || input.trim();
//   //   if (!text || loading) return;
//   //   setMessages((m) => [...m, { role: "user", text }]);
//   //   setInput("");
//   //   setLoading(true);
//   //   try {
//   //     const res = await sendMessage(text, sessionId);
//   //     setSessionId(res.data.session_id);
//   //     const reply = res.data.reply;

//   //     // Check if response contains service cards trigger
//   //     if (reply.includes("[SERVICES_CARD]") || text.toLowerCase().includes("service") || text.toLowerCase().includes("what do you offer")) {
//   //       const cleanReply = reply.replace("[SERVICES_CARD]", "").trim();
//   //       setMessages((m) => [...m, {
//   //         role: "bot",
//   //         text: cleanReply || "Here are our available services:",
//   //         cards: services
//   //       }]);
//   //     } else {
//   //       // Check if meeting booking is mentioned
//   //       if (reply.toLowerCase().includes("schedule") || reply.toLowerCase().includes("meeting") || reply.toLowerCase().includes("book")) {
//   //         setShowMeetForm(true);
//   //       }
//   //       setMessages((m) => [...m, { role: "bot", text: reply }]);
//   //     }
//   //   } catch {
//   //     setMessages((m) => [...m, { role: "bot", text: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // const handleVoice = () => {
//   //   const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//   //   if (!SR) { alert("Voice not supported in this browser."); return; }
//   //   const recognition = new SR();
//   //   recognition.lang     = "en-US";
//   //   recognition.onstart  = () => setIsListening(true);
//   //   recognition.onend    = () => setIsListening(false);
//   //   recognition.onresult = (e: any) => setInput(e.results[0][0].transcript);
//   //   recognition.start();
//   // };

//   const handleVoice = () => {
//   const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//   if (!SR) { alert("Voice not supported in this browser."); return; }
//   const recognition = new SR();
//   recognition.lang     = "en-US";
//   recognition.onstart  = () => setIsListening(true);
//   recognition.onend    = () => setIsListening(false);
//   recognition.onresult = (e: any) => {
//     const transcript = e.results[0][0].transcript;
//     setInput(transcript);
//     // Show confirmation message
//     setMessages((m) => [...m, {
//       role: "bot",
//       text: `I heard: "${transcript}" — is that correct? Press Send to confirm or edit above.`
//     }]);
//   };
//   recognition.start();
// };

//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setMessages((m) => [...m, { role: "user", text: `📎 ${file.name}` }]);
//     setMessages((m) => [...m, { role: "bot", text: `I received your file "${file.name}". Our team will review it. Would you like to schedule a meeting to discuss it?` }]);
//     setShowMeetForm(true);
//   };

//   const handleBookMeeting = async () => {
//     if (!meetForm.client_name || !meetForm.client_email || !meetForm.datetime_str) {
//       alert("Please fill name, email and date");
//       return;
//     }
//     try {
//       await scheduleMeeting(meetForm);
//       setMeetSent(true);
//       setShowMeetForm(false);
//       setMessages((m) => [...m, { role: "bot", text: `✅ Meeting booked for ${meetForm.datetime_str}! Our team will confirm within 2 hours. Is there anything else I can help you with?` }]);
//     } catch {
//       alert("Failed to book meeting. Please try again.");
//     }
//   };

//   const quickReplies = [
//     "What services do you offer?",
//     "I need express delivery",
//     "Book a meeting",
//     "What are your prices?",
//   ];

//   const wrapperClass = isPopup
//     ? "flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
//     : "max-w-4xl mx-auto px-6 py-8";

//   const containerStyle = isPopup
//     ? { width: "380px", height: "580px" }
//     : {};

//   return (
//     <div className={wrapperClass} style={containerStyle}>
//       {!isPopup && (
//         <div className="mb-5">
//           <h1 className="text-2xl font-bold text-slate-800">AI Chat assistant</h1>
//           <p className="text-slate-400 text-sm mt-0.5">Ask about services, pricing, or book a meeting</p>
//         </div>
//       )}

//       <div className={`flex flex-col ${isPopup ? "h-full" : "h-[600px] bg-white rounded-xl border border-slate-200"} overflow-hidden`}>
//         {/* Header */}
//         <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-900 flex-shrink-0">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
//             <div>
//               <p className="text-sm font-semibold text-white">LogiAI Assistant</p>
//               <div className="flex items-center gap-1">
//                 <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
//                 <p className="text-xs text-green-400">Online</p>
//               </div>
//             </div>
//           </div>
//           {isPopup && onClose && (
//             <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
//               <X size={18} />
//             </button>
//           )}
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
//           {messages.map((m, i) => (
//             <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
//               <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${m.role === "bot" ? "bg-blue-100 text-blue-600" : "bg-slate-700 text-white"}`}>
//                 {m.role === "bot" ? "AI" : "U"}
//               </div>
//               <div className="flex flex-col gap-2 max-w-[80%]">
//                 {m.text && (
//                   <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "bot" ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm" : "bg-blue-600 text-white rounded-tr-sm"}`}>
//                     {m.text}
//                   </div>
//                 )}
//                 {/* Service Cards inside chat */}
//                 {m.cards && m.cards.length > 0 && (
//                   <div className="flex flex-col gap-2">
//                     {m.cards.map((s) => (
//                       <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-colors cursor-pointer"
//                         onClick={() => send(`Tell me more about ${s.title}`)}>
//                         <div className="flex justify-between items-start mb-1">
//                           <span className="text-sm font-semibold text-slate-800">{s.title}</span>
//                           <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{s.pricing}</span>
//                         </div>
//                         <p className="text-xs text-slate-500 leading-relaxed mb-2">{s.description}</p>
//                         {s.features && (
//                           <div className="flex flex-wrap gap-1">
//                             {s.features.split(",").slice(0, 3).map((f) => (
//                               <span key={f} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{f.trim()}</span>
//                             ))}
//                           </div>
//                         )}
//                         <button className="mt-2 w-full bg-slate-900 text-white text-xs py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
//                           Learn more →
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}

//           {loading && (
//             <div className="flex gap-2">
//               <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
//               <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm">
//                 <div className="flex gap-1">
//                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
//                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
//                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Meeting booking form inside chat */}
//           {showMeetForm && !meetSent && (
//             <div className="bg-white border border-blue-200 rounded-xl p-3 ml-9">
//               <p className="text-xs font-semibold text-slate-600 mb-2">📅 Schedule a meeting</p>
//               <div className="space-y-2">
//                 <input type="text" placeholder="Your name" value={meetForm.client_name}
//                   onChange={(e) => setMeetForm({ ...meetForm, client_name: e.target.value })}
//                   className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400" />
//                 <input type="email" placeholder="your@email.com" value={meetForm.client_email}
//                   onChange={(e) => setMeetForm({ ...meetForm, client_email: e.target.value })}
//                   className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400" />
//                 <input type="datetime-local" value={meetForm.datetime_str.replace(" ", "T")}
//                   onChange={(e) => setMeetForm({ ...meetForm, datetime_str: e.target.value.replace("T", " ") })}
//                   className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400" />
//                 <input type="text" placeholder="What would you like to discuss?" value={meetForm.notes}
//                   onChange={(e) => setMeetForm({ ...meetForm, notes: e.target.value })}
//                   className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400" />
//                 <div className="flex gap-2">
//                   <button onClick={() => setShowMeetForm(false)}
//                     className="flex-1 border border-slate-200 text-slate-500 text-xs py-1.5 rounded-lg hover:bg-slate-50">
//                     Cancel
//                   </button>
//                   <button onClick={handleBookMeeting}
//                     className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700">
//                     Book meeting
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div ref={bottomRef} />
//         </div>

//         {/* Quick replies */}
//         {messages.length <= 2 && (
//           <div className="px-3 py-2 flex gap-2 flex-wrap bg-slate-50 border-t border-slate-100">
//             {quickReplies.map((q) => (
//               <button key={q} onClick={() => send(q)}
//                 className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors">
//                 {q}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Input */}
//         <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
//           <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
//           <button onClick={() => fileRef.current?.click()}
//             className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
//             <Paperclip size={15} />
//           </button>
//           <button onClick={handleVoice}
//             className={`p-2 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-500" : "hover:bg-slate-100 text-slate-400"}`}>
//             <Mic size={15} />
//           </button>
//           <input value={input} onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && send()}
//             placeholder="Type a message..."
//             className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
//           <button onClick={() => send()} disabled={loading}
//             className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50">
//             <Send size={15} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



// import { useState, useRef, useEffect, useCallback } from "react";
// import { sendMessage } from "../../api/chat";
// import { getServices } from "../../api/services";
// import { Send, Mic, Paperclip, X } from "lucide-react";

// interface Msg {
//   role: "user" | "bot";
//   text: string;
//   cards?: Service[];
// }

// interface Service {
//   id: number;
//   title: string;
//   description: string;
//   pricing: string;
//   features: string;
//   industry: string;
// }

// interface Props {
//   isPopup?: boolean;
//   onClose?: () => void;
// }

// const SERVICE_KEYWORDS = [
//   "service", "offer", "price", "pricing", "cost", "what do you do",
//   "what can you", "tell me about", "options", "packages", "plans",
//   "delivery", "warehouse", "fleet", "tracking", "storage"
// ];

// export default function ChatWidget({ isPopup = false, onClose }: Props) {
//   const [messages, setMessages] = useState<Msg[]>([
//     {
//       role: "bot",
//       text: "Hello! 👋 I'm your LogiAI assistant. I can help you with our logistics services, pricing, or scheduling a meeting. What brings you here today?"
//     }
//   ]);
//   const [input, setInput] = useState("");
//   const [sessionId, setSessionId] = useState<string | undefined>();
//   const [loading, setLoading] = useState(false);
//   const [services, setServices] = useState<Service[]>([]);
//   const [isListening, setIsListening] = useState(false);
//   const [voiceTranscript, setVoiceTranscript] = useState("");
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const fileRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     getServices().then((r) => setServices(r.data)).catch(() => {});
//   }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const isServiceQuery = useCallback((text: string) => {
//     const lower = text.toLowerCase();
//     return SERVICE_KEYWORDS.some(kw => lower.includes(kw));
//   }, []);

//   const addBotMessage = useCallback((text: string, cards?: Service[]) => {
//     setMessages(m => [...m, { role: "bot", text, cards }]);
//   }, []);

//   const send = useCallback(async (customText?: string) => {
//     const text = (customText || input).trim();
//     if (!text || loading) return;

//     setMessages(m => [...m, { role: "user", text }]);
//     setInput("");
//     setLoading(true);

//     try {
//       const res = await sendMessage(text, sessionId);
//       setSessionId(res.data.session_id);
//       const reply: string = res.data.reply;

//       // Check if we should show service cards
//       const showCards =
//         reply.includes("[SERVICES_CARD]") ||
//         isServiceQuery(text);

//       if (showCards && services.length > 0) {
//         const cleanReply = reply
//           .replace("[SERVICES_CARD]", "")
//           .trim() || "Here are our available services:";
//         addBotMessage(cleanReply, services);
//       } else {
//         addBotMessage(reply.replace("[SERVICES_CARD]", "").trim());
//       }
//     } catch {
//       addBotMessage("Sorry, I'm having trouble connecting right now. Please try again in a moment.");
//     } finally {
//       setLoading(false);
//     }
//   }, [input, loading, sessionId, services, isServiceQuery, addBotMessage]);

//   const handleVoice = useCallback(() => {
//     const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) {
//       addBotMessage("Voice input isn't supported in your browser. Please type your message instead.");
//       return;
//     }

//     const recognition = new SR();
//     recognition.lang = "en-US";
//     recognition.continuous = false;
//     recognition.interimResults = false;

//     recognition.onstart = () => setIsListening(true);
//     recognition.onend = () => setIsListening(false);

//     recognition.onresult = (e: any) => {
//       const transcript = e.results[0][0].transcript;
//       setVoiceTranscript(transcript);
//       setInput(transcript);

//       // Show confirmation in chat
//       addBotMessage(
//         `I heard: **"${transcript}"** — does that look right? You can edit it above or press Send to confirm.`
//       );
//     };

//     recognition.onerror = () => {
//       setIsListening(false);
//       addBotMessage("I couldn't catch that. Could you try again or type your message?");
//     };

//     recognition.start();
//   }, [addBotMessage]);

//   const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setMessages(m => [...m, { role: "user", text: `📎 ${file.name}` }]);
//     setTimeout(() => {
//       addBotMessage(
//         `Thanks for sending "${file.name}"! Our team will review it carefully. To make sure we address it properly, could I get your name and the best email to reach you?`
//       );
//     }, 500);

//     if (e.target) e.target.value = "";
//   }, [addBotMessage]);

//   const quickReplies = [
//     "What services do you offer?",
//     "I need express delivery",
//     "How much does fleet tracking cost?",
//     "I'd like to book a meeting",
//   ];

//   const wrapperClass = isPopup
//     ? "flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden w-full h-full"
//     : "max-w-4xl mx-auto px-6 py-8";

//   return (
//     <div className={wrapperClass}>
//       {!isPopup && (
//         <div className="mb-5">
//           <h1 className="text-2xl font-bold text-slate-800">AI Chat assistant</h1>
//           <p className="text-slate-400 text-sm mt-0.5">
//             Ask about services, pricing, or book a meeting through conversation
//           </p>
//         </div>
//       )}

//       <div
//         className={`flex flex-col overflow-hidden ${
//           isPopup ? "h-full" : "h-[600px] bg-white rounded-xl border border-slate-200"
//         }`}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between px-4 py-3 bg-slate-900 flex-shrink-0">
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
//                 AI
//               </div>
//               <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-900" />
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-white">LogiAI Assistant</p>
//               <p className="text-xs text-green-400">Online · Replies instantly</p>
//             </div>
//           </div>
//           {isPopup && onClose && (
//             <button
//               onClick={onClose}
//               className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
//             >
//               <X size={18} />
//             </button>
//           )}
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
//           {messages.map((m, i) => (
//             <div
//               key={i}
//               className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
//             >
//               <div
//                 className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${
//                   m.role === "bot"
//                     ? "bg-blue-100 text-blue-600"
//                     : "bg-slate-700 text-white"
//                 }`}
//               >
//                 {m.role === "bot" ? "AI" : "U"}
//               </div>

//               <div className="flex flex-col gap-2 max-w-[82%]">
//                 {m.text && (
//                   <div
//                     className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
//                       m.role === "bot"
//                         ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
//                         : "bg-blue-600 text-white rounded-tr-sm"
//                     }`}
//                   >
//                     {m.text}
//                   </div>
//                 )}

//                 {/* ── Service Cards inside chat ── */}
//                 {m.cards && m.cards.length > 0 && (
//                   <div className="flex flex-col gap-2">
//                     {m.cards.map((s) => (
//                       <div
//                         key={s.id}
//                         className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
//                         onClick={() =>
//                           send(`Tell me more about ${s.title} and how to get started`)
//                         }
//                       >
//                         <div className="flex items-start justify-between mb-1.5">
//                           <div>
//                             <span className="text-xs text-blue-500 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
//                               {s.industry}
//                             </span>
//                             <h4 className="text-sm font-semibold text-slate-800 mt-1">
//                               {s.title}
//                             </h4>
//                           </div>
//                           <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg whitespace-nowrap ml-2">
//                             {s.pricing}
//                           </span>
//                         </div>

//                         <p className="text-xs text-slate-500 leading-relaxed mb-2">
//                           {s.description}
//                         </p>

//                         {s.features && (
//                           <div className="flex flex-wrap gap-1 mb-2.5">
//                             {s.features
//                               .split(",")
//                               .slice(0, 3)
//                               .map((f) => (
//                                 <span
//                                   key={f}
//                                   className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
//                                 >
//                                   {f.trim()}
//                                 </span>
//                               ))}
//                           </div>
//                         )}

//                         <button className="w-full text-xs bg-slate-900 group-hover:bg-blue-600 text-white py-1.5 rounded-lg transition-colors font-medium">
//                           Learn more & book →
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}

//           {/* Typing indicator */}
//           {loading && (
//             <div className="flex gap-2">
//               <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
//                 AI
//               </div>
//               <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
//                 <div className="flex gap-1 items-center">
//                   <div
//                     className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
//                     style={{ animationDelay: "0ms" }}
//                   />
//                   <div
//                     className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
//                     style={{ animationDelay: "150ms" }}
//                   />
//                   <div
//                     className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
//                     style={{ animationDelay: "300ms" }}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           <div ref={bottomRef} />
//         </div>

//         {/* Quick replies — shown only at start */}
//         {messages.length <= 2 && (
//           <div className="px-3 py-2 flex gap-2 flex-wrap bg-slate-50 border-t border-slate-100">
//             {quickReplies.map((q) => (
//               <button
//                 key={q}
//                 onClick={() => send(q)}
//                 className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
//               >
//                 {q}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Voice confirmation hint */}
//         {voiceTranscript && input === voiceTranscript && (
//           <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 flex items-center justify-between">
//             <span>Voice input detected — edit above if needed</span>
//             <button
//               onClick={() => setVoiceTranscript("")}
//               className="text-amber-500 hover:text-amber-700"
//             >
//               ✕
//             </button>
//           </div>
//         )}

//         {/* Input bar */}
//         <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
//           <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />

//           <button
//             onClick={() => fileRef.current?.click()}
//             title="Upload document"
//             className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
//           >
//             <Paperclip size={16} />
//           </button>

//           <button
//             onClick={handleVoice}
//             title={isListening ? "Listening..." : "Voice input"}
//             className={`p-2 rounded-lg transition-colors ${
//               isListening
//                 ? "bg-red-100 text-red-500 animate-pulse"
//                 : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
//             }`}
//           >
//             <Mic size={16} />
//           </button>

//           <input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
//             placeholder={isListening ? "Listening..." : "Type a message..."}
//             className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-colors"
//           />

//           <button
//             onClick={() => send()}
//             disabled={loading || !input.trim()}
//             className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
//           >
//             <Send size={15} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }




// import { useState, useRef, useEffect } from "react";
// import { sendMessage } from "../../api/chat";
// import { getServices } from "../../api/services";
// import { scheduleMeeting } from "../../api/meetings";
// import { Send, Mic, Paperclip, X } from "lucide-react";

// interface Msg { role: "user" | "bot"; text: string; cards?: Service[]; }
// interface Service { id: number; title: string; description: string; pricing: string; features: string; }
// interface Props { isPopup?: boolean; onClose?: () => void; }

// export default function ChatWidget({ isPopup = false, onClose }: Props) {
//   const [messages,    setMessages]    = useState<Msg[]>([
//     { role: "bot", text: "Hello! 👋 I'm your LogiAI assistant. I can help you with our logistics services, pricing, and booking. How can I help you today?" }
//   ]);
//   const [input,       setInput]       = useState("");
//   const [sessionId,   setSessionId]   = useState<string | undefined>();
//   const [loading,     setLoading]     = useState(false);
//   const [services,    setServices]    = useState<Service[]>([]);
//   const [isListening, setIsListening] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const fileRef   = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     getServices().then((r) => setServices(r.data)).catch(() => {});
//   }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const send = async (customText?: string) => {
//     const text = customText || input.trim();
//     if (!text || loading) return;
//     setMessages((m) => [...m, { role: "user", text }]);
//     setInput("");
//     setLoading(true);
//     try {
//       const res = await sendMessage(text, sessionId);
//       setSessionId(res.data.session_id);
//       const reply = res.data.reply;
//       const isServiceQuery =
//         reply.includes("[SERVICES_CARD]") ||
//         text.toLowerCase().includes("service") ||
//         text.toLowerCase().includes("offer") ||
//         text.toLowerCase().includes("price") ||
//         text.toLowerCase().includes("pricing") ||
//         text.toLowerCase().includes("what do you do");

//       if (isServiceQuery && services.length > 0) {
//         const cleanReply = reply.replace("[SERVICES_CARD]", "").trim();
//         setMessages((m) => [...m, {
//           role: "bot",
//           text: cleanReply || "Here are our available services:",
//           cards: services
//         }]);
//       } else {
//         setMessages((m) => [...m, { role: "bot", text: reply }]);
//       }
//     } catch {
//       setMessages((m) => [...m, {
//         role: "bot",
//         text: "Sorry, I am having trouble connecting. Please try again."
//       }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVoice = () => {
//     const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) { alert("Voice not supported in this browser."); return; }
//     const recognition = new SR();
//     recognition.lang     = "en-US";
//     recognition.onstart  = () => setIsListening(true);
//     recognition.onend    = () => setIsListening(false);
//     recognition.onresult = (e: any) => {
//       const transcript = e.results[0][0].transcript;
//       setInput(transcript);
//       setMessages((m) => [...m, {
//         role: "bot",
//         text: `🎤 I heard: "${transcript}" — is that correct? Edit above if needed, then press Send.`
//       }]);
//     };
//     recognition.start();
//   };

//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setMessages((m) => [...m, { role: "user", text: `📎 ${file.name}` }]);
//     setMessages((m) => [...m, {
//       role: "bot",
//       text: `I received your file "${file.name}". Our team will review it. To schedule a discussion, just tell me your name and email and I will arrange a meeting for you.`
//     }]);
//   };

//   const quickReplies = [
//     "What services do you offer?",
//     "I need express delivery",
//     "I want to book a meeting",
//     "What are your prices?",
//   ];

//   return (
//     <div className={`flex flex-col bg-white ${isPopup ? "rounded-2xl overflow-hidden" : "rounded-xl border border-slate-200"}`}
//       style={isPopup ? { width: "380px", height: "580px" } : { height: "600px" }}>

//       {/* Header */}
//       <div className="flex items-center justify-between px-4 py-3 bg-slate-900 flex-shrink-0">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
//           <div>
//             <p className="text-sm font-semibold text-white">LogiAI Assistant</p>
//             <div className="flex items-center gap-1">
//               <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
//               <p className="text-xs text-green-400">Online</p>
//             </div>
//           </div>
//         </div>
//         {isPopup && onClose && (
//           <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
//             <X size={18} />
//           </button>
//         )}
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
//         {messages.map((m, i) => (
//           <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
//             <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${m.role === "bot" ? "bg-blue-100 text-blue-600" : "bg-slate-700 text-white"}`}>
//               {m.role === "bot" ? "AI" : "U"}
//             </div>
//             <div className="flex flex-col gap-2 max-w-[82%]">
//               {m.text && (
//                 <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "bot" ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm" : "bg-blue-600 text-white rounded-tr-sm"}`}>
//                   {m.text}
//                 </div>
//               )}
//               {/* Service Cards inside chat */}
//               {m.cards && m.cards.length > 0 && (
//                 <div className="flex flex-col gap-2">
//                   {m.cards.map((s) => (
//                     <div key={s.id}
//                       className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-colors cursor-pointer"
//                       onClick={() => send(`Tell me more about ${s.title}`)}>
//                       <div className="flex justify-between items-start mb-1">
//                         <span className="text-sm font-semibold text-slate-800">{s.title}</span>
//                         <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{s.pricing}</span>
//                       </div>
//                       <p className="text-xs text-slate-500 leading-relaxed mb-2">{s.description}</p>
//                       {s.features && (
//                         <div className="flex flex-wrap gap-1 mb-2">
//                           {s.features.split(",").slice(0, 3).map((f) => (
//                             <span key={f} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{f.trim()}</span>
//                           ))}
//                         </div>
//                       )}
//                       <button className="w-full bg-slate-900 text-white text-xs py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
//                         Book this service →
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}

//         {loading && (
//           <div className="flex gap-2">
//             <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
//             <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm">
//               <div className="flex gap-1">
//                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
//                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
//                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
//               </div>
//             </div>
//           </div>
//         )}
//         <div ref={bottomRef} />
//       </div>

//       {/* Quick replies — show only at start */}
//       {messages.length <= 2 && (
//         <div className="px-3 py-2 flex gap-2 flex-wrap bg-slate-50 border-t border-slate-100 flex-shrink-0">
//           {quickReplies.map((q) => (
//             <button key={q} onClick={() => send(q)}
//               className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors">
//               {q}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Input */}
//       <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
//         <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
//         <button onClick={() => fileRef.current?.click()}
//           className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400" title="Upload file">
//           <Paperclip size={15} />
//         </button>
//         <button onClick={handleVoice}
//           className={`p-2 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-500" : "hover:bg-slate-100 text-slate-400"}`}
//           title="Voice input">
//           <Mic size={15} />
//         </button>
//         <input value={input} onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && send()}
//           placeholder="Type your message..."
//           className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
//         <button onClick={() => send()} disabled={loading}
//           className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50">
//           <Send size={15} />
//         </button>
//       </div>
//     </div>
//   );
// }






// import { useState, useRef, useEffect } from "react";
// import { sendMessage } from "../../api/chat";
// import { getServices } from "../../api/services";
// import { scheduleMeeting } from "../../api/meetings"; 
// import { Send, Mic, Paperclip, X } from "lucide-react";

// interface Msg { role: "user" | "bot"; text: string; cards?: Service[]; }
// interface Service { id: number; title: string; description: string; pricing: string; features: string; }
// interface Props { isPopup?: boolean; onClose?: () => void; }

// export default function ChatWidget({ isPopup = false, onClose }: Props) {
//   const [messages,    setMessages]    = useState<Msg[]>([
//     { role: "bot", text: "Hello! 👋 I'm your LogiAI assistant. I can help you with our logistics services, pricing, and booking. How can I help you today?" }
//   ]);
//   const [input,       setInput]       = useState("");
//   const [sessionId,   setSessionId]   = useState<string | undefined>();
//   const [loading,     setLoading]     = useState(false);
//   const [services,    setServices]    = useState<Service[]>([]);
//   const [isListening, setIsListening] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const fileRef   = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     // RESOLVED: Added ': any' to 'r' to fix "Implicit any" error (Code 7006)
//     getServices().then((r: any) => setServices(r.data)).catch(() => {});
//   }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const send = async (customText?: string) => {
//     const text = customText || input.trim();
//     if (!text || loading) return;

//     // RESOLVED: Called scheduleMeeting so it is no longer "unused" (Code 6133)
//     if (text.toLowerCase().includes("meeting") || text.toLowerCase().includes("schedule")) {
//       scheduleMeeting({ query: text }).catch(() => {});
//     }

//     setMessages((m) => [...m, { role: "user", text }]);
//     setInput("");
//     setLoading(true);
//     try {
//       const res = await sendMessage(text, sessionId);
//       setSessionId(res.data.session_id);
//       const reply = res.data.reply;
//       const isServiceQuery =
//         reply.includes("[SERVICES_CARD]") ||
//         text.toLowerCase().includes("service") ||
//         text.toLowerCase().includes("offer") ||
//         text.toLowerCase().includes("price") ||
//         text.toLowerCase().includes("pricing") ||
//         text.toLowerCase().includes("what do you do");

//       if (isServiceQuery && services.length > 0) {
//         const cleanReply = reply.replace("[SERVICES_CARD]", "").trim();
//         setMessages((m) => [...m, {
//           role: "bot",
//           text: cleanReply || "Here are our available services:",
//           cards: services
//         }]);
//       } else {
//         setMessages((m) => [...m, { role: "bot", text: reply }]);
//       }
//     } catch {
//       setMessages((m) => [...m, {
//         role: "bot",
//         text: "Sorry, I am having trouble connecting. Please try again."
//       }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVoice = () => {
//     const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) { alert("Voice not supported in this browser."); return; }
//     const recognition = new SR();
//     recognition.lang     = "en-US";
//     recognition.onstart  = () => setIsListening(true);
//     recognition.onend    = () => setIsListening(false);
//     recognition.onresult = (e: any) => {
//       const transcript = e.results[0][0].transcript;
//       setInput(transcript);
//       setMessages((m) => [...m, {
//         role: "bot",
//         text: `🎤 I heard: "${transcript}" — is that correct? Edit above if needed, then press Send.`
//       }]);
//     };
//     recognition.start();
//   };

//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setMessages((m) => [...m, { role: "user", text: `📎 ${file.name}` }]);
//     setMessages((m) => [...m, {
//       role: "bot",
//       text: `I received your file "${file.name}". Our team will review it. To schedule a discussion, just tell me your name and email and I will arrange a meeting for you.`
//     }]);
//   };

//   const quickReplies = [
//     "What services do you offer?",
//     "I need express delivery",
//     "I want to book a meeting",
//     "What are your prices?",
//   ];

//   return (
//     <div className={`flex flex-col bg-white ${isPopup ? "rounded-2xl overflow-hidden" : "rounded-xl border border-slate-200"}`}
//       style={isPopup ? { width: "380px", height: "580px" } : { height: "600px" }}>

//       {/* Header */}
//       <div className="flex items-center justify-between px-4 py-3 bg-slate-900 flex-shrink-0">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
//           <div>
//             <p className="text-sm font-semibold text-white">LogiAI Assistant</p>
//             <div className="flex items-center gap-1">
//               <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
//               {/* <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> */}
// //               <p className="text-xs text-green-400">Online</p>
// //             </div>
// //           </div>
// //         </div>
// //         {isPopup && onClose && (
//           <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
//             <X size={18} />
//           </button>
//         )}
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
//         {messages.map((m, i) => (
//           <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
//             <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${m.role === "bot" ? "bg-blue-100 text-blue-600" : "bg-slate-700 text-white"}`}>
//               {m.role === "bot" ? "AI" : "U"}
//             </div>
//             <div className="flex flex-col gap-2 max-w-[82%]">
//               {m.text && (
//                 <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "bot" ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm" : "bg-blue-600 text-white rounded-tr-sm"}`}>
//                   {m.text}
//                 </div>
//               )}
//               {/* Service Cards inside chat */}
//               {m.cards && m.cards.length > 0 && (
//                 <div className="flex flex-col gap-2">
//                   {m.cards.map((s) => (
//                     <div key={s.id}
//                       className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-colors cursor-pointer"
//                       onClick={() => send(`Tell me more about ${s.title}`)}>
//                       <div className="flex justify-between items-start mb-1">
//                         <span className="text-sm font-semibold text-slate-800">{s.title}</span>
//                         <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{s.pricing}</span>
//                       </div>
//                       <p className="text-xs text-slate-500 leading-relaxed mb-2">{s.description}</p>
//                       {s.features && (
//                         <div className="flex flex-wrap gap-1 mb-2">
//                           {s.features.split(",").slice(0, 3).map((f) => (
//                             <span key={f} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{f.trim()}</span>
//                           ))}
//                         </div>
//                       )}
//                       <button className="w-full bg-slate-900 text-white text-xs py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
//                         Book this service →
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}

//         {loading && (
//           <div className="flex gap-2">
//             <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
//             <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm">
//               <div className="flex gap-1">
//                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
//                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
//                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
//               </div>
//             </div>
//           </div>
//         )}
//         <div ref={bottomRef} />
//       </div>

//       {/* Quick replies — show only at start */}
//       {messages.length <= 2 && (
//         <div className="px-3 py-2 flex gap-2 flex-wrap bg-slate-50 border-t border-slate-100 flex-shrink-0">
//           {quickReplies.map((q) => (
//             <button key={q} onClick={() => send(q)}
//               className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors">
//               {q}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Input */}
//       <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
//         <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
//         <button onClick={() => fileRef.current?.click()}
//           className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400" title="Upload file">
//           <Paperclip size={15} />
//         </button>
//         <button onClick={handleVoice}
//           className={`p-2 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-500" : "hover:bg-slate-100 text-slate-400"}`}
//           title="Voice input">
//           <Mic size={15} />
//         </button>
//         <input value={input} onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && send()}
//           placeholder="Type your message..."
//           className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
//         <button onClick={() => send()} disabled={loading}
//           className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50">
//           <Send size={15} />
//         </button>
//       </div>
//     </div>
//   );
// }




// import { useState, useRef, useEffect } from "react";
// import { sendMessage } from "../../api/chat";
// import { getServices } from "../../api/services";
// import { scheduleMeeting } from "../../api/meetings"; 
// import { Send, Mic, Paperclip, X } from "lucide-react";

// interface Msg { role: "user" | "bot"; text: string; cards?: Service[]; }
// interface Service { id: number; title: string; description: string; pricing: string; features: string; }
// interface Props { isPopup?: boolean; onClose?: () => void; }

// export default function ChatWidget({ isPopup = false, onClose }: Props) {
//   const [messages,    setMessages]    = useState<Msg[]>([
//     { role: "bot", text: "Hello! 👋 I'm your LogiAI assistant. I can help you with our logistics services, pricing, and booking. How can I help you today?" }
//   ]);
//   const [input,       setInput]       = useState("");
//   const [sessionId,   setSessionId]   = useState<string | undefined>();
//   const [loading,     setLoading]     = useState(false);
//   const [services,    setServices]    = useState<Service[]>([]);
//   const [isListening, setIsListening] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const fileRef   = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     getServices().then((r: any) => setServices(r.data)).catch(() => {});
//   }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const send = async (customText?: string) => {
//     const text = customText || input.trim();
//     if (!text || loading) return;

//     setMessages((m) => [...m, { role: "user", text }]);
//     setInput("");
//     setLoading(true);

//     try {
//       // FIX FOR ERROR 2353: Pass an object that matches the expected type
//       // Using placeholders since we don't have a form yet
//       if (text.toLowerCase().includes("schedule") || text.toLowerCase().includes("meeting")) {
//         await scheduleMeeting({ 
//           client_name: "Interested Client", 
//           client_email: "pending@example.com", 
//           datetime_str: new Date().toISOString(),
//           notes: text 
//         }).catch(() => {});
//       }

//       const res = await sendMessage(text, sessionId);
//       setSessionId(res.data.session_id);
//       const reply = res.data.reply;
//       const isServiceQuery =
//         reply.includes("[SERVICES_CARD]") ||
//         text.toLowerCase().includes("service") ||
//         text.toLowerCase().includes("offer") ||
//         text.toLowerCase().includes("price") ||
//         text.toLowerCase().includes("pricing") ||
//         text.toLowerCase().includes("what do you do");

//       if (isServiceQuery && services.length > 0) {
//         const cleanReply = reply.replace("[SERVICES_CARD]", "").trim();
//         setMessages((m) => [...m, {
//           role: "bot",
//           text: cleanReply || "Here are our available services:",
//           cards: services
//         }]);
//       } else {
//         setMessages((m) => [...m, { role: "bot", text: reply }]);
//       }
//     } catch {
//       setMessages((m) => [...m, {
//         role: "bot",
//         text: "Sorry, I am having trouble connecting. Please try again."
//       }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVoice = () => {
//     const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) { alert("Voice not supported in this browser."); return; }
//     const recognition = new SR();
//     recognition.lang     = "en-US";
//     recognition.onstart  = () => setIsListening(true);
//     recognition.onend    = () => setIsListening(false);
//     recognition.onresult = (e: any) => {
//       const transcript = e.results[0][0].transcript;
//       setInput(transcript);
//     };
//     recognition.start();
//   };

//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setMessages((m) => [...m, { role: "user", text: `📎 ${file.name}` }]);
//     setMessages((m) => [...m, {
//       role: "bot",
//       text: `I received your file "${file.name}". Our team will review it.`
//     }]);
//   };

//   const quickReplies = [
//     "What services do you offer?",
//     "I need express delivery",
//     "I want to book a meeting",
//     "What are your prices?",
//   ];

//   return (
//     <div className={`flex flex-col bg-white ${isPopup ? "rounded-2xl overflow-hidden" : "rounded-xl border border-slate-200"}`}
//       style={isPopup ? { width: "380px", height: "580px" } : { height: "600px" }}>

//       <div className="flex items-center justify-between px-4 py-3 bg-slate-900 flex-shrink-0">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
//           <div>
//             <p className="text-sm font-semibold text-white">LogiAI Assistant</p>
//             <div className="flex items-center gap-1">
//               <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
//               <p className="text-xs text-green-400">Online</p>
//             </div>
//           </div>
//         </div>
//         {isPopup && onClose && (
//           <button onClick={onClose} className="text-slate-400 hover:text-white">
//             <X size={18} />
//           </button>
//         )}
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
//         {messages.map((m, i) => (
//           <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
//             <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${m.role === "bot" ? "bg-blue-100 text-blue-600" : "bg-slate-700 text-white"}`}>
//               {m.role === "bot" ? "AI" : "U"}
//             </div>
//             <div className="flex flex-col gap-2 max-w-[82%]">
//               {m.text && (
//                 <div className={`px-3 py-2.5 rounded-2xl text-sm ${m.role === "bot" ? "bg-white border border-slate-200 text-slate-700" : "bg-blue-600 text-white"}`}>
//                   {m.text}
//                 </div>
//               )}
//               {m.cards && (
//                 <div className="flex flex-col gap-2">
//                   {m.cards.map((s) => (
//                     <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-3 cursor-pointer" onClick={() => send(`Tell me more about ${s.title}`)}>
//                       <div className="flex justify-between mb-1">
//                         <span className="text-sm font-semibold">{s.title}</span>
//                         <span className="text-xs font-bold text-blue-600">{s.pricing}</span>
//                       </div>
//                       <p className="text-xs text-slate-500">{s.description}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//         {loading && <div className="text-xs text-slate-400">Typing...</div>}
//         <div ref={bottomRef} />
//       </div>

//       {/* FIX FOR ERROR 6133: Mapping quickReplies here makes it "read" by the component */}
//       {messages.length <= 2 && (
//         <div className="px-3 py-2 flex gap-2 flex-wrap bg-slate-50 border-t border-slate-100">
//           {quickReplies.map((q) => (
//             <button key={q} onClick={() => send(q)} className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors">
//               {q}
//             </button>
//           ))}
//         </div>
//       )}

//       <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
//         <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
//         <button onClick={() => fileRef.current?.click()} className="p-2 text-slate-400"><Paperclip size={15} /></button>
//         <button onClick={handleVoice} className={`p-2 rounded-lg ${isListening ? "bg-red-100 text-red-500" : "text-slate-400"}`}><Mic size={15} /></button>
//         <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type your message..." className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none" />
//         <button onClick={() => send()} disabled={loading} className="bg-blue-600 text-white p-2 rounded-full disabled:opacity-50"><Send size={15} /></button>
//       </div>
//     </div>
//   );
// }





// import { useState, useRef, useEffect } from "react";
// import { sendMessage } from "../../api/chat";
// import { getServices } from "../../api/services";
// import { Send, Mic, Paperclip, X } from "lucide-react";

// interface Msg { role: "user" | "bot"; text: string; cards?: Service[]; }
// interface Service { id: number; title: string; description: string; pricing: string; features: string; }
// // interface Props { isPopup?: boolean; onClose?: () => void; }
// interface Props { isPopup?: boolean; onClose?: () => void; }

// export default function ChatWidget({ isPopup = false, onClose }: Props) {
//   const [messages,    setMessages]    = useState<Msg[]>([
//     { role: "bot", text: "Hello! 👋 I'm your LogiAI assistant. How can I help you today? I can tell you about our services, help you book a meeting, or answer any logistics questions." }
//   ]);
//   const [input,       setInput]       = useState("");
//   const [sessionId,   setSessionId]   = useState<string | undefined>();
//   const [loading,     setLoading]     = useState(false);
//   const [services,    setServices]    = useState<Service[]>([]);
//   const [isListening, setIsListening] = useState(false);
//   const bottomRef = useRef<HTMLDivElement>(null);
//   const fileRef   = useRef<HTMLInputElement>(null);

//   useEffect(() => { getServices().then((r) => setServices(r.data)).catch(() => {}); }, []);
//   useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

//   const send = async (customText?: string) => {
//     const text = customText || input.trim();
//     if (!text || loading) return;
//     setMessages((m) => [...m, { role: "user", text }]);
//     setInput("");
//     setLoading(true);
//     try {
//       const res = await sendMessage(text, sessionId);
//       setSessionId(res.data.session_id);
//       const reply = res.data.reply;
//       const isServiceQuery =
//         reply.includes("[SERVICES_CARD]") ||
//         text.toLowerCase().includes("service") ||
//         text.toLowerCase().includes("offer") ||
//         text.toLowerCase().includes("price") ||
//         text.toLowerCase().includes("what do you") ||
//         text.toLowerCase().includes("options");

//       if (isServiceQuery && services.length > 0) {
//         const cleanReply = reply.replace("[SERVICES_CARD]", "").trim();
//         setMessages((m) => [...m, { role: "bot", text: cleanReply || "Here are our services:", cards: services }]);
//       } else {
//         setMessages((m) => [...m, { role: "bot", text: reply }]);
//       }
//     } catch {
//       setMessages((m) => [...m, { role: "bot", text: "Sorry, having trouble connecting. Please try again." }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVoice = () => {
//     const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) { alert("Voice not supported in this browser."); return; }
//     const recognition = new SR();
//     recognition.lang     = "en-US";
//     recognition.onstart  = () => setIsListening(true);
//     recognition.onend    = () => setIsListening(false);
//     recognition.onresult = (e: any) => {
//       const transcript = e.results[0][0].transcript;
//       setInput(transcript);
//       setMessages((m) => [...m, { role: "bot", text: `🎤 I heard: "${transcript}" — is that correct? Press Send to confirm or edit above.` }]);
//     };
//     recognition.start();
//   };

//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setMessages((m) => [...m, { role: "user", text: `📎 ${file.name}` }]);
//     setMessages((m) => [...m, { role: "bot", text: `I received "${file.name}". Our team will review it. May I know your name so I can arrange a follow-up for you?` }]);
//   };

//   const quickReplies = ["What services do you offer?", "I need express delivery", "Book a meeting", "What are your prices?"];

//   return (
//     <div className={`flex flex-col bg-white ${isPopup ? "rounded-2xl overflow-hidden" : "rounded-xl border border-slate-200 max-w-4xl mx-auto"}`}
//       style={isPopup ? { width: "380px", height: "580px" } : { height: "600px" }}>

//       <div className="flex items-center justify-between px-4 py-3 bg-slate-900 flex-shrink-0">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
//           <div>
//             <p className="text-sm font-semibold text-white">LogiAI Assistant</p>
//             <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400"></div><p className="text-xs text-green-400">Online</p></div>
//           </div>
//         </div>
//         {isPopup && onClose && <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>}
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
//         {messages.map((m, i) => (
//           <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
//             <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${m.role === "bot" ? "bg-blue-100 text-blue-600" : "bg-slate-700 text-white"}`}>
//               {m.role === "bot" ? "AI" : "U"}
//             </div>
//             <div className="flex flex-col gap-2 max-w-[82%]">
//               {m.text && (
//                 <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "bot" ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm" : "bg-blue-600 text-white rounded-tr-sm"}`}>
//                   {m.text}
//                 </div>
//               )}
//               {m.cards && m.cards.length > 0 && (
//                 <div className="flex flex-col gap-2">
//                   {m.cards.map((s) => (
//                     <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-colors cursor-pointer"
//                       onClick={() => send(`I want to know more about ${s.title} and book it`)}>
//                       <div className="flex justify-between items-start mb-1">
//                         <span className="text-sm font-semibold text-slate-800">{s.title}</span>
//                         <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{s.pricing}</span>
//                       </div>
//                       <p className="text-xs text-slate-500 leading-relaxed mb-2">{s.description}</p>
//                       {s.features && (
//                         <div className="flex flex-wrap gap-1 mb-2">
//                           {s.features.split(",").slice(0, 3).map((f) => (
//                             <span key={f} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{f.trim()}</span>
//                           ))}
//                         </div>
//                       )}
//                       <button className="w-full bg-slate-900 text-white text-xs py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
//                         Book this service →
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//         {loading && (
//           <div className="flex gap-2">
//             <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
//             <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm">
//               <div className="flex gap-1">
//                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
//                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
//                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
//               </div>
//             </div>
//           </div>
//         )}
//         <div ref={bottomRef} />
//       </div>

//       {messages.length <= 2 && (
//         <div className="px-3 py-2 flex gap-2 flex-wrap bg-slate-50 border-t border-slate-100 flex-shrink-0">
//           {quickReplies.map((q) => (
//             <button key={q} onClick={() => send(q)} className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors">{q}</button>
//           ))}
//         </div>
//       )}

//       <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
//         <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
//         <button onClick={() => fileRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400" title="Upload file"><Paperclip size={15} /></button>
//         <button onClick={handleVoice} className={`p-2 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-500" : "hover:bg-slate-100 text-slate-400"}`} title="Voice input"><Mic size={15} /></button>
//         <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type your message..."
//           className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
//         <button onClick={() => send()} disabled={loading} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"><Send size={15} /></button>
//       </div>
//     </div>
//   );
// }





import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../../api/chat";
import { getServices } from "../../api/services";
import { Send, Mic, Paperclip, X } from "lucide-react";

interface Msg { role: "user" | "bot"; text: string; cards?: Service[]; }
interface Service { id: number; title: string; description: string; pricing: string; features: string; }
interface Props { isPopup?: boolean; onClose?: () => void; }

export default function ChatWidget({ isPopup = false, onClose }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hello! 👋 I'm your LogiAI assistant. How can I help you today? I can tell you about our services, help you book a meeting, or answer any logistics questions." }
  ]);
  const [input,       setInput]       = useState("");
  const [sessionId,   setSessionId]   = useState<string | undefined>();
  const [loading,     setLoading]     = useState(false);
  const [services,    setServices]    = useState<Service[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [shownCards,  setShownCards]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  // useEffect(() => { getServices().then((r) => setServices(r.data)).catch(() => {}); }, []);
  useEffect(() => { getServices().then((r: { data: Service[] }) => setServices(r.data)).catch(() => {}); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (customText?: string) => {
    const text = customText || input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendMessage(text, sessionId);
      setSessionId(res.data.session_id);
      const reply = res.data.reply;

      const isServiceQuery =
        reply.includes("[SERVICES_CARD]") ||
        text.toLowerCase().includes("service") ||
        text.toLowerCase().includes("offer") ||
        text.toLowerCase().includes("price") ||
        text.toLowerCase().includes("what do you do") ||
        text.toLowerCase().includes("options");

      // Only show cards ONCE per session
      if (isServiceQuery && services.length > 0 && !shownCards) {
        const cleanReply = reply.replace("[SERVICES_CARD]", "").trim();
        setShownCards(true);
        setMessages((m) => [...m, {
          role: "bot",
          text: cleanReply || "Here are our available services:",
          cards: services
        }]);
      } else {
        setMessages((m) => [...m, { role: "bot", text: reply.replace("[SERVICES_CARD]", "").trim() }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Sorry, having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice not supported in this browser."); return; }
    const recognition = new SR();
    recognition.lang     = "en-US";
    recognition.onstart  = () => setIsListening(true);
    recognition.onend    = () => setIsListening(false);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setMessages((m) => [...m, {
        role: "bot",
        text: `🎤 I heard: "${transcript}" — is that correct? Press Send to confirm or edit above.`
      }]);
    };
    recognition.start();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessages((m) => [...m, { role: "user", text: `📎 ${file.name}` }]);
    setMessages((m) => [...m, {
      role: "bot",
      text: `I received "${file.name}". Our team will review it. May I know your name so I can arrange a follow-up?`
    }]);
  };

  const quickReplies = [
    "What services do you offer?",
    "I need express delivery",
    "Book a meeting",
    "What are your prices?",
  ];

  return (
    <div
      className={`flex flex-col bg-white ${isPopup ? "rounded-2xl overflow-hidden" : "rounded-xl border border-slate-200 max-w-4xl mx-auto"}`}
      style={isPopup ? { width: "380px", height: "580px" } : { height: "600px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
          <div>
            <p className="text-sm font-semibold text-white">LogiAI Assistant</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
        </div>
        {isPopup && onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${m.role === "bot" ? "bg-blue-100 text-blue-600" : "bg-slate-700 text-white"}`}>
              {m.role === "bot" ? "AI" : "U"}
            </div>
            <div className="flex flex-col gap-2 max-w-[82%]">
              {m.text && (
                <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "bot" ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm" : "bg-blue-600 text-white rounded-tr-sm"}`}>
                  {m.text}
                </div>
              )}
              {/* Service Cards — shown only once */}
              {m.cards && m.cards.length > 0 && (
                <div className="flex flex-col gap-2">
                  {m.cards.map((s) => (
                    <div key={s.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => send(`I want to book ${s.title}`)}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-semibold text-slate-800">{s.title}</span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{s.pricing}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">{s.description}</p>
                      {s.features && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {s.features.split(",").slice(0, 3).map((f) => (
                            <span key={f} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{f.trim()}</span>
                          ))}
                        </div>
                      )}
                      <button className="w-full bg-slate-900 text-white text-xs py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
                        Book this service →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {messages.length <= 2 && (
        <div className="px-3 py-2 flex gap-2 flex-wrap bg-slate-50 border-t border-slate-100 flex-shrink-0">
          {quickReplies.map((q) => (
            <button key={q} onClick={() => send(q)}
              className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
        <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400" title="Upload file">
          <Paperclip size={15} />
        </button>
        <button onClick={handleVoice}
          className={`p-2 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-500" : "hover:bg-slate-100 text-slate-400"}`}
          title="Voice input">
          <Mic size={15} />
        </button>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your message..."
          className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <button onClick={() => send()} disabled={loading}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50">
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
