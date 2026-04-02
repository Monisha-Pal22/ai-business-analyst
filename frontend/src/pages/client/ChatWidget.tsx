// import React, { useState, useRef, useEffect } from "react";
// import { sendMessage } from "../../api/chat";
// import { getServices } from "../../api/services";
// import { Send, Mic, Paperclip, X } from "lucide-react";

// interface Msg { role: "user" | "bot"; text: string; cards?: Service[]; }
// interface Service { id: number; title: string; description: string; pricing: string; features: string; }
// interface Props { isPopup?: boolean; onClose?: () => void; }

// export default function ChatWidget({ isPopup = false, onClose }: Props) {
//   const [messages,   setMessages]   = useState<Msg[]>([
//     { role: "bot", text: "Hello! 👋 I'm your LogiAI assistant. How can I help you today? I can tell you about our services, help you book a meeting, or answer any logistics questions." }
//   ]);
//   const [input,      setInput]      = useState("");
//   const [sessionId,  setSessionId]  = useState<string | undefined>();
//   const [loading,    setLoading]    = useState(false);
//   const [services,   setServices]   = useState<Service[]>([]);
//   const [isListening,setIsListening]= useState(false);
//   const cardsShownRef = useRef(false);
//   const bottomRef     = useRef<HTMLDivElement>(null);
//   const fileRef       = useRef<HTMLInputElement>(null);

//   // Added type 'any' to 'r' (or you could type it based on your Axios response)
//   useEffect(() => { getServices().then((r: any) => setServices(r.data)).catch(() => {}); }, []);
//   useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

//   const send = async (customText?: string) => {
//     const text = customText || input.trim();
//     if (!text || loading) return;
//     // Added type 'Msg[]' to 'm'
//     setMessages((m: Msg[]) => [...m, { role: "user", text }]);
//     setInput("");
//     setLoading(true);
//     try {
//       const res = await sendMessage(text, sessionId);
//       setSessionId(res.data.session_id);
//       const rawReply = res.data.reply;
//       const hasServiceTag = rawReply.includes("[SERVICES_CARD]");
//       const cleanReply = rawReply
//         .replace(/\[SERVICES_CARD\]/g, "")
//         .replace(/\[USER_DATA:[^\]]+\]/g, "")
//         .replace(/\[BOOK_MEETING:[^\]]+\]/g, "")
//         .trim();

//       if (hasServiceTag && services.length > 0 && !cardsShownRef.current) {
//         cardsShownRef.current = true;
//         setMessages((m: Msg[]) => [...m, { role: "bot", text: cleanReply || "Here are our services:", cards: services }]);
//       } else {
//         setMessages((m: Msg[]) => [...m, { role: "bot", text: cleanReply }]);
//       }
//     } catch {
//       setMessages((m: Msg[]) => [...m, { role: "bot", text: "Sorry, having trouble connecting. Please try again." }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVoice = () => {
//     const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SR) { alert("Voice not supported in this browser."); return; }
//     const r = new SR();
//     r.lang = "en-US";
//     r.onstart  = () => setIsListening(true);
//     r.onend    = () => setIsListening(false);
//     // Added type 'any' to 'e'
//     r.onresult = (e: any) => {
//       const t = e.results[0][0].transcript;
//       setInput(t);
//       setMessages((m: Msg[]) => [...m, { role: "bot", text: `🎤 I heard: "${t}" — correct? Press Send or edit above.` }]);
//     };
//     r.start();
//   };

//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setMessages((m: Msg[]) => [...m, { role: "user", text: `📎 ${file.name}` }]);
//     setMessages((m: Msg[]) => [...m, { role: "bot", text: `I received "${file.name}". May I know your name so I can arrange a follow-up?` }]);
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
//             <div className="flex items-center gap-1">
//               <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
//               <p className="text-xs text-green-400">Online</p>
//             </div>
//           </div>
//         </div>
//         {isPopup && onClose && <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>}
//       </div>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
//         {/* Added types 'Msg' and 'number' to the map callback */}
//         {messages.map((m: Msg, i: number) => (
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
//                   {/* Added type 'Service' to the map callback */}
//                   {m.cards.map((s: Service) => (
//                     <div key={s.id}
//                       className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-colors cursor-pointer"
//                       onClick={() => send(`I want to book ${s.title}`)}>
//                       <div className="flex justify-between items-start mb-1">
//                         <span className="text-sm font-semibold text-slate-800">{s.title}</span>
//                         <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{s.pricing}</span>
//                       </div>
//                       <p className="text-xs text-slate-500 mb-2">{s.description}</p>
//                       {s.features && (
//                         <div className="flex flex-wrap gap-1 mb-2">
//                           {/* Added type 'string' to the map callback */}
//                           {s.features.split(",").slice(0, 3).map((f: string) => (
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
//             <button key={q} onClick={() => send(q)}
//               className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors">
//               {q}
//             </button>
//           ))}
//         </div>
//       )}

//       <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
//         <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
//         <button onClick={() => fileRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400" title="Upload file">
//           <Paperclip size={15} />
//         </button>
//         <button onClick={handleVoice} className={`p-2 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-500" : "hover:bg-slate-100 text-slate-400"}`} title="Voice input">
//           <Mic size={15} />
//         </button>
//         {/* Added explicit types for the event handlers below */}
//         <input value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
//           onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && send()}
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






// import { useRef, useEffect, useReducer } from "react";
// import { getServices } from "../../api/services";
// import { Send, Mic, Paperclip, X } from "lucide-react";
// import api from "../../api/config";
// import type { AxiosResponse } from "axios";

// interface Msg { role: "user" | "bot"; text: string; cards?: Service[]; }
// interface Service { id: number; title: string; description: string; pricing: string; features: string; }
// interface Props { isPopup?: boolean; onClose?: () => void; }
// interface HistoryItem { role: string; content: string; }
// interface SpeechRecognitionAlternativeLike { transcript: string; }
// interface SpeechRecognitionResultLike { 0: SpeechRecognitionAlternativeLike; }
// interface SpeechRecognitionEventLike { results: ArrayLike<SpeechRecognitionResultLike>; }
// interface SpeechRecognitionLike extends EventTarget {
//   lang: string;
//   continuous: boolean;
//   interimResults: boolean;
//   onstart: (() => void) | null;
//   onend: (() => void) | null;
//   onresult: ((event: SpeechRecognitionEventLike) => void) | null;
//   start: () => void;
// }
// interface SpeechRecognitionConstructorLike {
//   new (): SpeechRecognitionLike;
// }

// interface State {
//   messages: Msg[];
//   input: string;
//   loading: boolean;
//   services: Service[];
//   isListening: boolean;
// }

// type Action =
//   | { type: "ADD_MSG"; msg: Msg }
//   | { type: "SET_INPUT"; val: string }
//   | { type: "SET_LOADING"; val: boolean }
//   | { type: "SET_SERVICES"; val: Service[] }
//   | { type: "SET_LISTENING"; val: boolean };

// const init: State = {
//   messages: [{ role: "bot", text: "Hello! 👋 I'm Alexa, your LogiAI assistant. How can I help you today? I can tell you about our services, help you book a meeting, or answer any logistics questions." }],
//   input: "",
//   loading: false,
//   services: [],
//   isListening: false,
// };

// function reducer(state: State, action: Action): State {
//   switch (action.type) {
//     case "ADD_MSG":       return { ...state, messages: [...state.messages, action.msg] };
//     case "SET_INPUT":     return { ...state, input: action.val };
//     case "SET_LOADING":   return { ...state, loading: action.val };
//     case "SET_SERVICES":  return { ...state, services: action.val };
//     case "SET_LISTENING": return { ...state, isListening: action.val };
//     default: return state;
//   }
// }

// function cleanText(raw: string): string {
//   return raw
//     .replace(/\[SERVICES_CARD\]/g, "")
//     .replace(/\[LEAD_DATA:[^\]]*\]/g, "")
//     .replace(/\[USER_DATA:[^\]]*\]/g, "")
//     .replace(/\[BOOK_MEETING:[^\]]*\]/g, "")
//     .trim();
// }

// export default function ChatWidget({ isPopup = false, onClose }: Props) {
//   const [state, dispatch] = useReducer(reducer, init);
//   const { messages, input, loading, services, isListening } = state;

//   const cardsShown   = useRef(false);
//   const historyRef   = useRef<HistoryItem[]>([]);
//   const sessionIdRef = useRef<string>(crypto.randomUUID());
//   const bottomRef    = useRef<HTMLDivElement>(null);
//   const fileRef      = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     getServices()
//       .then((r: AxiosResponse<Service[]>) => dispatch({ type: "SET_SERVICES", val: r.data }))
//       .catch(() => {});
//   }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const send = async (customText?: string) => {
//     const text = customText || input.trim();
//     if (!text || loading) return;

//     dispatch({ type: "ADD_MSG", msg: { role: "user", text } });
//     dispatch({ type: "SET_INPUT", val: "" });
//     dispatch({ type: "SET_LOADING", val: true });

//     // Add to history BEFORE sending
//     historyRef.current = [...historyRef.current, { role: "user", content: text }];

//     try {
//       const res = await api.post("/chat/message", {
//         message:    text,
//         session_id: sessionIdRef.current,
//         history:    historyRef.current.slice(-16), // send last 16 messages = 8 turns
//       });

//       const rawReply   = (res.data.reply || "") as string;
//       const cleanReply = cleanText(rawReply);
//       const isService  = rawReply.includes("[SERVICES_CARD]");

//       // Add AI response to history
//       historyRef.current = [...historyRef.current, { role: "assistant", content: cleanReply }];

//       if (isService && services.length > 0 && !cardsShown.current) {
//         cardsShown.current = true;
//         dispatch({ type: "ADD_MSG", msg: { role: "bot", text: cleanReply, cards: services } });
//       } else {
//         dispatch({ type: "ADD_MSG", msg: { role: "bot", text: cleanReply } });
//       }
//     } catch {
//       dispatch({ type: "ADD_MSG", msg: { role: "bot", text: "Sorry, having trouble connecting. Please try again." } });
//     } finally {
//       dispatch({ type: "SET_LOADING", val: false });
//     }
//   };

//   const handleVoice = () => {
//     const speechWindow = window as Window & {
//       SpeechRecognition?: SpeechRecognitionConstructorLike;
//       webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
//     };
//     const SR = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
//     if (!SR) { alert("Voice not supported. Use Chrome."); return; }
//     const recognition = new SR();
//     recognition.lang           = "en-US";
//     recognition.continuous     = false;
//     recognition.interimResults = false;
//     recognition.onstart  = () => dispatch({ type: "SET_LISTENING", val: true });
//     recognition.onend    = () => dispatch({ type: "SET_LISTENING", val: false });
//     recognition.onresult = (e: SpeechRecognitionEventLike) => {
//       const t = e.results[0][0].transcript;
//       dispatch({ type: "SET_INPUT", val: t });
//       dispatch({ type: "ADD_MSG", msg: { role: "bot", text: `🎤 I heard: "${t}" — correct? Press Send to confirm or edit above.` } });
//     };
//     recognition.start();
//   };

//   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     dispatch({ type: "ADD_MSG", msg: { role: "user", text: `📎 ${file.name}` } });
//     dispatch({ type: "ADD_MSG", msg: { role: "bot", text: `I received "${file.name}". May I know your name so I can arrange a follow-up?` } });
//   };

//   const quickReplies = [
//     "What services do you offer?",
//     "I need express delivery",
//     "Book a meeting with your team",
//     "I need fleet tracking",
//   ];

//   return (
//     <div
//       className={`flex flex-col bg-white ${isPopup ? "rounded-2xl overflow-hidden shadow-2xl" : "rounded-xl border border-slate-200 max-w-4xl mx-auto"}`}
//       style={isPopup ? { width: "380px", height: "580px" } : { height: "600px" }}
//     >
//       <div className="flex items-center justify-between px-4 py-3 bg-slate-900 flex-shrink-0">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
//           <div>
//             <p className="text-sm font-semibold text-white">Alexa — LogiAI Assistant</p>
//             <div className="flex items-center gap-1">
//               <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
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

//       <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
//         {messages.map((m, i) => (
//           <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
//             <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${m.role === "bot" ? "bg-blue-100 text-blue-600" : "bg-slate-700 text-white"}`}>
//               {m.role === "bot" ? "AI" : "U"}
//             </div>
//             <div className="flex flex-col gap-2 max-w-[85%]">
//               {m.text && (
//                 <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === "bot" ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm" : "bg-blue-600 text-white rounded-tr-sm"}`}>
//                   {m.text}
//                 </div>
//               )}
//               {m.cards && m.cards.length > 0 && (
//                 <div className="flex flex-col gap-2">
//                   {m.cards.map((s) => (
//                     <div key={s.id}
//                       className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 transition-colors cursor-pointer"
//                       onClick={() => send(`I want to book ${s.title}`)}>
//                       <div className="flex justify-between items-start mb-1">
//                         <span className="text-sm font-semibold text-slate-800">{s.title}</span>
//                         <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{s.pricing}</span>
//                       </div>
//                       <p className="text-xs text-slate-500 mb-2">{s.description}</p>
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
//         <div className="px-3 py-2 flex gap-2 flex-wrap bg-white border-t border-slate-100 flex-shrink-0">
//           {quickReplies.map((q) => (
//             <button key={q} onClick={() => send(q)}
//               className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors">
//               {q}
//             </button>
//           ))}
//         </div>
//       )}

//       <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
//         <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
//         <button onClick={() => fileRef.current?.click()}
//           className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
//           <Paperclip size={15} />
//         </button>
//         <button onClick={handleVoice}
//           className={`p-2 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-500 animate-pulse" : "hover:bg-slate-100 text-slate-400"}`}>
//           <Mic size={15} />
//         </button>
//         <input value={input}
//           onChange={(e) => dispatch({ type: "SET_INPUT", val: e.target.value })}
//           onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
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



import { useRef, useEffect, useReducer } from "react";
import { getServices } from "../../api/services";
import { Send, Mic, Paperclip, X } from "lucide-react";
import api from "../../api/config";

interface Msg { role: "user" | "bot"; text: string; cards?: Svc[]; }
interface Svc  { id: number; title: string; description: string; pricing: string; features: string; }
interface Props { isPopup?: boolean; onClose?: () => void; }
interface HItem { role: string; content: string; }
interface ServicesResponse { data: Svc[]; }
interface SpeechRecognitionAlternativeLike { transcript: string; }
interface SpeechRecognitionResultLike { 0: SpeechRecognitionAlternativeLike; }
interface SpeechRecognitionEventLike { results: ArrayLike<SpeechRecognitionResultLike>; }
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start(): void;
}
interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}
interface St {
  messages: Msg[]; input: string; loading: boolean;
  services: Svc[]; listening: boolean;
}
type Act =
  | { type:"MSG";   m: Msg }
  | { type:"INPUT"; v: string }
  | { type:"LOAD";  v: boolean }
  | { type:"SVC";   v: Svc[] }
  | { type:"MIC";   v: boolean };

const INIT: St = {
  messages: [{ role:"bot", text:"Hello! 👋 I'm Alexa, your LogiAI assistant. How can I help you today? I can tell you about our services, help you book a meeting, or answer any logistics questions." }],
  input:"", loading:false, services:[], listening:false,
};

function reducer(s: St, a: Act): St {
  switch(a.type){
    case "MSG":   return {...s, messages:[...s.messages, a.m]};
    case "INPUT": return {...s, input: a.v};
    case "LOAD":  return {...s, loading: a.v};
    case "SVC":   return {...s, services: a.v};
    case "MIC":   return {...s, listening: a.v};
    default: return s;
  }
}

function cleanText(raw: string): string {
  return raw
    .replace(/\[SERVICES_CARD\]/g,"")
    .replace(/\[LEAD_DATA:[^\]]*\]/g,"")
    .replace(/\[USER_DATA:[^\]]*\]/g,"")
    .replace(/\[BOOK_MEETING:[^\]]*\]/g,"")
    .trim();
}

export default function ChatWidget({ isPopup=false, onClose }: Props) {
  const [s, d] = useReducer(reducer, INIT);
  const cardsShown = useRef(false);
  const history    = useRef<HItem[]>([]);
  const sessionId  = useRef(crypto.randomUUID());
  const bottom     = useRef<HTMLDivElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  useEffect(()=>{ getServices().then((r: ServicesResponse)=>d({type:"SVC",v:r.data})).catch(()=>{}); },[]);
  useEffect(()=>{ bottom.current?.scrollIntoView({behavior:"smooth"}); },[s.messages]);

  const send = async (txt?: string) => {
    const text = txt || s.input.trim();
    if(!text || s.loading) return;
    d({type:"MSG", m:{role:"user", text}});
    d({type:"INPUT", v:""});
    d({type:"LOAD", v:true});
    history.current = [...history.current, {role:"user", content:text}];
    try {
      const res  = await api.post("/chat/message",{
        message:    text,
        session_id: sessionId.current,
        history:    history.current.slice(-20),
      });
      const raw   = (res.data.reply||"") as string;
      const clean = cleanText(raw);
      history.current = [...history.current, {role:"assistant", content:clean}];
      if(raw.includes("[SERVICES_CARD]") && s.services.length>0 && !cardsShown.current){
        cardsShown.current = true;
        d({type:"MSG", m:{role:"bot", text:clean, cards:s.services}});
      } else {
        d({type:"MSG", m:{role:"bot", text:clean}});
      }
    } catch {
      d({type:"MSG", m:{role:"bot", text:"Sorry, having trouble connecting. Please try again."}});
    } finally {
      d({type:"LOAD", v:false});
    }
  };

  const handleVoice = () => {
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructorLike;
      webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
    };
    const SR = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if(!SR){ alert("Voice not supported. Use Chrome."); return; }
    const r = new SR();
    r.lang="en-US"; r.continuous=false; r.interimResults=false;
    r.onstart  = ()=>d({type:"MIC",v:true});
    r.onend    = ()=>d({type:"MIC",v:false});
    r.onresult = (e: SpeechRecognitionEventLike)=>{
      const t = e.results[0][0].transcript;
      d({type:"INPUT",v:t});
      d({type:"MSG",m:{role:"bot",text:`🎤 I heard: "${t}" — correct? Press Send to confirm.`}});
    };
    r.start();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    d({type:"MSG",m:{role:"user",text:`📎 ${file.name}`}});
    d({type:"MSG",m:{role:"bot",text:`I received "${file.name}". May I know your name so I can arrange a follow-up?`}});
  };

  const quick = ["What services do you offer?","Book a meeting with your team","I need fleet tracking","I need warehouse storage"];

  return (
    <div className={`flex flex-col bg-white ${isPopup?"rounded-2xl overflow-hidden shadow-2xl":"rounded-xl border border-slate-200 max-w-4xl mx-auto"}`}
      style={isPopup?{width:"380px",height:"580px"}:{height:"600px"}}>

      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
          <div>
            <p className="text-sm font-semibold text-white">Alexa — LogiAI Assistant</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <p className="text-xs text-green-400">Online</p>
            </div>
          </div>
        </div>
        {isPopup && onClose && <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18}/></button>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {s.messages.map((m,i)=>(
          <div key={i} className={`flex gap-2 ${m.role==="user"?"flex-row-reverse":""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 ${m.role==="bot"?"bg-blue-100 text-blue-600":"bg-slate-700 text-white"}`}>
              {m.role==="bot"?"AI":"U"}
            </div>
            <div className="flex flex-col gap-2 max-w-[85%]">
              {m.text && (
                <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role==="bot"?"bg-white border border-slate-200 text-slate-700 rounded-tl-sm":"bg-blue-600 text-white rounded-tr-sm"}`}>
                  {m.text}
                </div>
              )}
              {m.cards && m.cards.length>0 && (
                <div className="flex flex-col gap-2">
                  {m.cards.map(sv=>(
                    <div key={sv.id} className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 cursor-pointer"
                      onClick={()=>send(`I want to book ${sv.title}`)}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-semibold text-slate-800">{sv.title}</span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{sv.pricing}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{sv.description}</p>
                      {sv.features && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {sv.features.split(",").slice(0,3).map(f=>(
                            <span key={f} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{f.trim()}</span>
                          ))}
                        </div>
                      )}
                      <button className="w-full bg-slate-900 text-white text-xs py-1.5 rounded-lg hover:bg-blue-600 transition-colors">Book this service →</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {s.loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                {[0,150,300].map(d=>(
                  <div key={d} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}></div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottom}/>
      </div>

      {s.messages.length<=2 && (
        <div className="px-3 py-2 flex gap-2 flex-wrap bg-white border-t border-slate-100 flex-shrink-0">
          {quick.map(q=>(
            <button key={q} onClick={()=>send(q)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
        <input type="file" ref={fileRef} onChange={handleFile} className="hidden"/>
        <button onClick={()=>fileRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Paperclip size={15}/></button>
        <button onClick={handleVoice} className={`p-2 rounded-lg ${s.listening?"bg-red-100 text-red-500 animate-pulse":"hover:bg-slate-100 text-slate-400"}`}><Mic size={15}/></button>
        <input value={s.input} onChange={e=>d({type:"INPUT",v:e.target.value})}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
          placeholder="Type your message..."
          className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400"/>
        <button onClick={()=>send()} disabled={s.loading} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"><Send size={15}/></button>
      </div>
    </div>
  );
}
