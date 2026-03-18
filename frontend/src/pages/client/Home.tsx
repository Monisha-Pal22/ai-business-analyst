import { useNavigate } from "react-router-dom";
import { Truck, Warehouse, MapPin, ArrowRight } from "lucide-react";

const features = [
  { icon: Truck,     title: "Express delivery",   desc: "Same-day and next-day delivery with real-time GPS tracking.",  price: "From $49/shipment", color: "bg-blue-50 text-blue-600"   },
  { icon: Warehouse, title: "Warehouse storage",  desc: "Secure short and long-term storage with 24/7 monitoring.",     price: "From $299/month",   color: "bg-green-50 text-green-600" },
  { icon: MapPin,    title: "Fleet tracking",     desc: "Real-time GPS and intelligent route optimization.",            price: "From $199/month",   color: "bg-amber-50 text-amber-600" },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <div className="bg-slate-900 px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Smart Logistics.<br />
          <span className="text-blue-400">Powered by AI.</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
          Real-time tracking, route optimization, and intelligent fleet management for your business.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate("/services")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            Explore services
          </button>
          <button onClick={() => navigate("/book")}
            className="border border-slate-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
            Book a meeting
          </button>
        </div>
      </div>

      {/* Services preview */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Our services</h2>
          <button onClick={() => navigate("/services")} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline">
            View all <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon size={18} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{f.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-600">{f.price}</span>
                <button onClick={() => navigate("/book")}
                  className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                  Book now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-900 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-4 gap-6 text-center">
          {[
            { val: "342+", label: "Shipments delivered" },
            { val: "91%",  label: "On-time delivery"    },
            { val: "78%",  label: "Fleet utilization"   },
            { val: "24/7", label: "Support available"   },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-blue-400 mb-1">{s.val}</p>
              <p className="text-slate-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Ready to optimize your logistics?</h2>
        <p className="text-slate-400 text-sm mb-6">Talk to our AI assistant or schedule a meeting with our team.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate("/chat")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            Chat with AI
          </button>
          <button onClick={() => navigate("/register")}
            className="border border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}