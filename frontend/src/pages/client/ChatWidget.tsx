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





import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../../api/chat";
import { getServices } from "../../api/services";
import { scheduleMeeting } from "../../api/meetings";
// import { Send, Mic, Paperclip, X, Minus } from "lucide-react";
import { Send, Mic, Paperclip, X } from "lucide-react";

interface Msg {
  role: "user" | "bot";
  text: string;
  cards?: Service[];
}

interface Service {
  id: number;
  title: string;
  description: string;
  pricing: string;
  features: string;
}

interface Props {
  isPopup?: boolean;
  onClose?: () => void;
}

export default function ChatWidget({ isPopup = false, onClose }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hello! 👋 I'm your LogiAI assistant. I can help you with our logistics services, pricing, booking meetings, or answer any questions. How can I help you today?" }
  ]);
  const [input,       setInput]       = useState("");
  const [sessionId,   setSessionId]   = useState<string | undefined>();
  const [loading,     setLoading]     = useState(false);
  const [services,    setServices]    = useState<Service[]>([]);
  const [meetForm,    setMeetForm]    = useState({ client_name: "", client_email: "", datetime_str: "", notes: "" });
  const [showMeetForm, setShowMeetForm] = useState(false);
  const [meetSent,    setMeetSent]    = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getServices().then((r) => setServices(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // const send = async (customText?: string) => {
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

    if (
      reply.includes("[SERVICES_CARD]") ||
      text.toLowerCase().includes("service") ||
      text.toLowerCase().includes("what do you offer") ||
      text.toLowerCase().includes("pricing") ||
      text.toLowerCase().includes("price")
    ) {
      const cleanReply = reply.replace("[SERVICES_CARD]", "").trim();
      setMessages((m) => [...m, {
        role: "bot",
        text: cleanReply || "Here are our available services:",
        cards: services
      }]);
    } else {
      if (
        reply.toLowerCase().includes("meeting") ||
        reply.toLowerCase().includes("schedule") ||
        reply.toLowerCase().includes("book")
      ) {
        setShowMeetForm(true);
      }
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    }
  } catch {
    setMessages((m) => [...m, {
      role: "bot",
      text: "Sorry, I am having trouble connecting. Please try again."
    }]);
  } finally {
    setLoading(false);
  }
};
  //   const text = customText || input.trim();
  //   if (!text || loading) return;
  //   setMessages((m) => [...m, { role: "user", text }]);
  //   setInput("");
  //   setLoading(true);
  //   try {
  //     const res = await sendMessage(text, sessionId);
  //     setSessionId(res.data.session_id);
  //     const reply = res.data.reply;

  //     // Check if response contains service cards trigger
  //     if (reply.includes("[SERVICES_CARD]") || text.toLowerCase().includes("service") || text.toLowerCase().includes("what do you offer")) {
  //       const cleanReply = reply.replace("[SERVICES_CARD]", "").trim();
  //       setMessages((m) => [...m, {
  //         role: "bot",
  //         text: cleanReply || "Here are our available services:",
  //         cards: services
  //       }]);
  //     } else {
  //       // Check if meeting booking is mentioned
  //       if (reply.toLowerCase().includes("schedule") || reply.toLowerCase().includes("meeting") || reply.toLowerCase().includes("book")) {
  //         setShowMeetForm(true);
  //       }
  //       setMessages((m) => [...m, { role: "bot", text: reply }]);
  //     }
  //   } catch {
  //     setMessages((m) => [...m, { role: "bot", text: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleVoice = () => {
  //   const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  //   if (!SR) { alert("Voice not supported in this browser."); return; }
  //   const recognition = new SR();
  //   recognition.lang     = "en-US";
  //   recognition.onstart  = () => setIsListening(true);
  //   recognition.onend    = () => setIsListening(false);
  //   recognition.onresult = (e: any) => setInput(e.results[0][0].transcript);
  //   recognition.start();
  // };

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
    // Show confirmation message
    setMessages((m) => [...m, {
      role: "bot",
      text: `I heard: "${transcript}" — is that correct? Press Send to confirm or edit above.`
    }]);
  };
  recognition.start();
};

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessages((m) => [...m, { role: "user", text: `📎 ${file.name}` }]);
    setMessages((m) => [...m, { role: "bot", text: `I received your file "${file.name}". Our team will review it. Would you like to schedule a meeting to discuss it?` }]);
    setShowMeetForm(true);
  };

  const handleBookMeeting = async () => {
    if (!meetForm.client_name || !meetForm.client_email || !meetForm.datetime_str) {
      alert("Please fill name, email and date");
      return;
    }
    try {
      await scheduleMeeting(meetForm);
      setMeetSent(true);
      setShowMeetForm(false);
      setMessages((m) => [...m, { role: "bot", text: `✅ Meeting booked for ${meetForm.datetime_str}! Our team will confirm within 2 hours. Is there anything else I can help you with?` }]);
    } catch {
      alert("Failed to book meeting. Please try again.");
    }
  };

  const quickReplies = [
    "What services do you offer?",
    "I need express delivery",
    "Book a meeting",
    "What are your prices?",
  ];

  const wrapperClass = isPopup
    ? "flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
    : "max-w-4xl mx-auto px-6 py-8";

  const containerStyle = isPopup
    ? { width: "380px", height: "580px" }
    : {};

  return (
    <div className={wrapperClass} style={containerStyle}>
      {!isPopup && (
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-800">AI Chat assistant</h1>
          <p className="text-slate-400 text-sm mt-0.5">Ask about services, pricing, or book a meeting</p>
        </div>
      )}

      <div className={`flex flex-col ${isPopup ? "h-full" : "h-[600px] bg-white rounded-xl border border-slate-200"} overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-900 flex-shrink-0">
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
              <div className="flex flex-col gap-2 max-w-[80%]">
                {m.text && (
                  <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "bot" ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm" : "bg-blue-600 text-white rounded-tr-sm"}`}>
                    {m.text}
                  </div>
                )}
                {/* Service Cards inside chat */}
                {m.cards && m.cards.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {m.cards.map((s) => (
                      <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-colors cursor-pointer"
                        onClick={() => send(`Tell me more about ${s.title}`)}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-semibold text-slate-800">{s.title}</span>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{s.pricing}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-2">{s.description}</p>
                        {s.features && (
                          <div className="flex flex-wrap gap-1">
                            {s.features.split(",").slice(0, 3).map((f) => (
                              <span key={f} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{f.trim()}</span>
                            ))}
                          </div>
                        )}
                        <button className="mt-2 w-full bg-slate-900 text-white text-xs py-1.5 rounded-lg hover:bg-blue-600 transition-colors">
                          Learn more →
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

          {/* Meeting booking form inside chat */}
          {showMeetForm && !meetSent && (
            <div className="bg-white border border-blue-200 rounded-xl p-3 ml-9">
              <p className="text-xs font-semibold text-slate-600 mb-2">📅 Schedule a meeting</p>
              <div className="space-y-2">
                <input type="text" placeholder="Your name" value={meetForm.client_name}
                  onChange={(e) => setMeetForm({ ...meetForm, client_name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                <input type="email" placeholder="your@email.com" value={meetForm.client_email}
                  onChange={(e) => setMeetForm({ ...meetForm, client_email: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                <input type="datetime-local" value={meetForm.datetime_str.replace(" ", "T")}
                  onChange={(e) => setMeetForm({ ...meetForm, datetime_str: e.target.value.replace("T", " ") })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                <input type="text" placeholder="What would you like to discuss?" value={meetForm.notes}
                  onChange={(e) => setMeetForm({ ...meetForm, notes: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                <div className="flex gap-2">
                  <button onClick={() => setShowMeetForm(false)}
                    className="flex-1 border border-slate-200 text-slate-500 text-xs py-1.5 rounded-lg hover:bg-slate-50">
                    Cancel
                  </button>
                  <button onClick={handleBookMeeting}
                    className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700">
                    Book meeting
                  </button>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {messages.length <= 2 && (
          <div className="px-3 py-2 flex gap-2 flex-wrap bg-slate-50 border-t border-slate-100">
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
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <Paperclip size={15} />
          </button>
          <button onClick={handleVoice}
            className={`p-2 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-500" : "hover:bg-slate-100 text-slate-400"}`}>
            <Mic size={15} />
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={() => send()} disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}