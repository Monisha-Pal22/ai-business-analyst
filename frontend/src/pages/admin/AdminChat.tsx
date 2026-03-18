import { useState } from "react";
import { adminChat } from "../../api/chat";
import { Send } from "lucide-react";

interface Msg { role: "user" | "ai"; text: string; }

export default function AdminChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hello! I'm your logistics business analyst. Ask me about fleet performance, delivery trends, cost optimization, or revenue forecasts." }
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await adminChat(text);
      setMessages((m) => [...m, { role: "ai", text: res.data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">AI Business Chat</h1>
        <p className="text-slate-400 text-sm mt-0.5">Internal analytics assistant — ask anything about logistics data</p>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${m.role === "ai" ? "bg-blue-100 text-blue-600" : "bg-slate-800 text-white"}`}>
                {m.role === "ai" ? "AI" : "A"}
              </div>
              <div className={`max-w-3xl px-4 py-2.5 rounded-xl text-sm leading-relaxed ${m.role === "ai" ? "bg-white border border-slate-200 text-slate-600" : "bg-blue-600 text-white"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">AI</div>
              <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm text-slate-400">Thinking...</div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about fleet, revenue, deliveries, routes..."
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={send} disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}