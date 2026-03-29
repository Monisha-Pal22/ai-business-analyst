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
  const [input,      setInput]      = useState("");
  const [sessionId,  setSessionId]  = useState<string | undefined>();
  const [loading,    setLoading]    = useState(false);
  const [services,   setServices]   = useState<Service[]>([]);
  const [isListening,setIsListening]= useState(false);
  const [cardsShown, setCardsShown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef   = useRef<HTMLInputElement>(null);

  useEffect(() => { getServices().then((r: any) => setServices(r.data)).catch(() => {}); }, []);
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
      const reply = res.data.reply.replace("[SERVICES_CARD]", "").trim();
      const isServiceQuery =
        res.data.reply.includes("[SERVICES_CARD]") ||
        text.toLowerCase().includes("service") ||
        text.toLowerCase().includes("offer") ||
        text.toLowerCase().includes("price");
      if (isServiceQuery && services.length > 0 && !cardsShown) {
        setCardsShown(true);
        setMessages((m) => [...m, { role: "bot", text: reply || "Here are our services:", cards: services }]);
      } else {
        setMessages((m) => [...m, { role: "bot", text: reply }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Sorry, having trouble. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice not supported."); return; }
    const r = new SR();
    r.lang = "en-US";
    r.onstart  = () => setIsListening(true);
    r.onend    = () => setIsListening(false);
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setInput(t);
      setMessages((m) => [...m, { role: "bot", text: `🎤 I heard: "${t}" — correct? Press Send or edit above.` }]);
    };
    r.start();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessages((m) => [...m, { role: "user", text: `📎 ${file.name}` }]);
    setMessages((m) => [...m, { role: "bot", text: `I received "${file.name}". May I know your name so I can arrange a follow-up?` }]);
  };

  const quickReplies = ["What services do you offer?", "I need express delivery", "Book a meeting", "What are your prices?"];

  return (
    <div className={`flex flex-col bg-white ${isPopup ? "rounded-2xl overflow-hidden" : "rounded-xl border border-slate-200 max-w-4xl mx-auto"}`}
      style={isPopup ? { width: "380px", height: "580px" } : { height: "600px" }}>

      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
          <div>
            <p className="text-sm font-semibold text-white">LogiAI Assistant</p>
            <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-400"></div><p className="text-xs text-green-400">Online</p></div>
          </div>
        </div>
        {isPopup && onClose && <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>}
      </div>

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
              {m.cards && m.cards.length > 0 && (
                <div className="flex flex-col gap-2">
                  {m.cards.map((s) => (
                    <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-3 hover:border-blue-300 cursor-pointer"
                      onClick={() => send(`I want to book ${s.title}`)}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-semibold text-slate-800">{s.title}</span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{s.pricing}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{s.description}</p>
                      {s.features && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {s.features.split(",").slice(0, 3).map((f) => (
                            <span key={f} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{f.trim()}</span>
                          ))}
                        </div>
                      )}
                      <button className="w-full bg-slate-900 text-white text-xs py-1.5 rounded-lg hover:bg-blue-600">Book this service →</button>
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
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl">
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

      {messages.length <= 2 && (
        <div className="px-3 py-2 flex gap-2 flex-wrap bg-slate-50 border-t border-slate-100 flex-shrink-0">
          {quickReplies.map((q) => (
            <button key={q} onClick={() => send(q)} className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-600">{q}</button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center flex-shrink-0">
        <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Paperclip size={15} /></button>
        <button onClick={handleVoice} className={`p-2 rounded-lg ${isListening ? "bg-red-100 text-red-500" : "hover:bg-slate-100 text-slate-400"}`}><Mic size={15} /></button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type your message..."
          className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <button onClick={() => send()} disabled={loading} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"><Send size={15} /></button>
      </div>
    </div>
  );
}
