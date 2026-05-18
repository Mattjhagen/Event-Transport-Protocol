import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  ArrowRight, 
  Calendar, 
  Code, 
  Globe, 
  Link as LinkIcon, 
  Navigation, 
  Plus, 
  RefreshCcw, 
  Server, 
  Terminal, 
  Zap,
  ChevronRight,
  MapPin,
  Clock,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { ETPEvent } from "./types";

// --- Components ---

const Header = () => (
  <header className="border-b etp-border px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center font-bold text-white">E</div>
      <div>
        <h1 className="text-sm font-bold tracking-tight text-white">ETP <span className="opacity-40 font-normal">v0.1</span></h1>
        <p className="text-[10px] mono-label leading-none">Event Transport Protocol</p>
      </div>
    </div>
    <nav className="flex items-center gap-6">
      <a href="#spec" className="text-xs font-medium hover:text-orange-500 transition-colors text-white">Specification</a>
      <a href="https://eventtransport.dev" className="text-xs font-medium opacity-50 text-white">Docs</a>
      <div className="h-4 w-[1px] bg-white/10" />
      <div className="flex items-center gap-2 px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest font-bold">Node Online</span>
      </div>
    </nav>
  </header>
);

const Hero = () => (
  <section className="px-6 py-20 flex flex-col items-center text-center max-w-4xl mx-auto">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/5 text-xs text-orange-500 font-medium mb-8"
    >
      <Zap size={12} />
      <span>Internet-native event infrastructure</span>
    </motion.div>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-white"
    >
      Events are <span className="text-orange-500 italic">objects</span>,<br />not files.
    </motion.h2>
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="text-lg text-white/60 mb-10 max-w-2xl"
    >
      ETP is an open protocol for transporting and synchronizing live event state across calendars, apps, AI agents, and operating systems.
    </motion.p>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex flex-wrap items-center justify-center gap-4"
    >
      <button 
        onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-6 py-3 bg-white text-black font-bold rounded flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105 cursor-pointer"
      >
        Live Demo <ArrowRight size={18} />
      </button>
      <button className="px-6 py-3 bg-white/5 border border-white/10 rounded font-bold hover:bg-white/10 transition-colors text-white">
        Read the RFC
      </button>
    </motion.div>
  </section>
);

const Features = () => (
  <section className="px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto border-t etp-border">
    {[
      {
        icon: <Globe size={24} className="text-orange-500" />,
        title: "Permanent Identities",
        desc: "Every event gets a canonical URI (etp://) that persists across platforms and updates."
      },
      {
        icon: <RefreshCcw size={24} className="text-orange-500" />,
        title: "Live Synchronization",
        desc: "Calendars subscribe to event streams instead of importing static snapshots. Updates propagate in real-time."
      },
      {
        icon: <LinkIcon size={24} className="text-orange-500" />,
        title: "Universal Routing",
        desc: "One link detects device and platform to route users to the best native experience."
      }
    ].map((f, i) => (
      <div key={i} className="p-8 glass-card rounded-2xl border etp-border">
        <div className="mb-6">{f.icon}</div>
        <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
      </div>
    ))}
  </section>
);

const EventGenerator = ({ onCreated }: { onCreated: (data: any) => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "Global ETP Launch Keynote",
    description: "Architecting the future of event synchronization.",
    start: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    end: new Date(Date.now() + 86460000).toISOString().slice(0, 16),
    location: "Stockholm / Metaverse",
    alias: "etp-launch-2026"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/e", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          start: new Date(formData.start).toISOString(),
          end: new Date(formData.end).toISOString(),
          location: { name: formData.location },
          sync: { strategy: "poll", poll_interval: 3600 }
        })
      });
      const data = await response.json();
      onCreated(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 border etp-border rounded-2xl bg-white/5">
      <div className="flex items-center gap-2 mb-8">
        <Plus size={18} className="text-orange-500" />
        <span className="mono-label">Protocol Demo / EID Registration</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono opacity-40 uppercase">Event Title</label>
            <input 
              className="w-full bg-transparent border-b etp-border py-2 focus:border-orange-500 outline-none transition-colors text-white"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Keynote..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono opacity-40 uppercase">Alias (optional)</label>
            <input 
              className="w-full bg-transparent border-b etp-border py-2 focus:border-orange-500 outline-none transition-colors text-white"
              value={formData.alias}
              onChange={e => setFormData({...formData, alias: e.target.value})}
              placeholder="launch-slug"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono opacity-40 uppercase">Start Time</label>
            <input 
              type="datetime-local"
              className="w-full bg-transparent border-b etp-border py-2 focus:border-orange-500 outline-none transition-colors text-white"
              value={formData.start}
              onChange={e => setFormData({...formData, start: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono opacity-40 uppercase">End Time</label>
            <input 
              type="datetime-local"
              className="w-full bg-transparent border-b etp-border py-2 focus:border-orange-500 outline-none transition-colors text-white"
              value={formData.end}
              onChange={e => setFormData({...formData, end: e.target.value})}
            />
          </div>
        </div>
        <button 
          disabled={loading}
          type="submit"
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          {loading ? <RefreshCcw className="animate-spin" /> : <><Globe size={18} /> Register Event (EID)</>}
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
};

const SuccessPanel = ({ result, onReset }: { result: any, onReset: () => void, key?: string }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-10 border-2 border-orange-500/50 rounded-2xl bg-orange-500/5 glow-orange"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-orange-500" />
          <span className="mono-label">EID Registered Sucessfully</span>
        </div>
        <button onClick={onReset} className="text-xs underline opacity-50 hover:opacity-100 text-white cursor-pointer">Register New Identity</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="p-6 bg-black/40 rounded-xl border etp-border space-y-4">
            <h4 className="text-sm font-bold opacity-40 uppercase tracking-widest font-mono text-white">Universal Routing Link</h4>
            <div className="flex items-center justify-between bg-black/60 p-3 rounded border etp-border">
              <code className="text-xs truncate w-48 text-orange-400">{result.links.universal}</code>
              <button onClick={() => copyToClipboard(result.links.universal, 'link')} className="p-2 hover:bg-white/10 rounded transition-colors text-white cursor-pointer">
                {copied === 'link' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[10px] opacity-40 italic text-white/70">Routing resolves EID to native platform protocols or EVT stream endpoints.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                <Terminal size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">EID Identity</p>
                <p className="text-[10px] text-orange-500 font-mono">{result.event.eid}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold opacity-40 uppercase tracking-widest font-mono text-white">EVT Object (application/etp+json)</h4>
          <div className="bg-black/80 p-6 rounded-xl border etp-border font-mono text-[10px] h-64 overflow-y-auto custom-scrollbar">
            <pre className="text-green-500/80">
              {JSON.stringify(result.event, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EventDetails = ({ id }: { id: string }) => {
  const [event, setEvent] = useState<ETPEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/e/${id}`)
      .then(res => res.json())
      .then(data => {
        setEvent(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-20 text-center mono-label animate-pulse">Resolving EID Protocol Handshake...</div>;
  if (!event) return <div className="p-20 text-center mono-label">Identity {id} not found in transport layer.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-8 rounded-3xl glass-card border etp-border overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-orange-500" />
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-500 text-[10px] font-mono rounded uppercase tracking-widest">{event.lifecycle}</span>
        </div>
        <div className="text-right">
          <p className="mono-label text-[10px]">EVT v{event.v}</p>
          <p className="text-[9px] opacity-30 font-mono text-white">{event.eid}</p>
        </div>
      </div>

      <h3 className="text-4xl font-bold tracking-tighter mb-4 text-white">{event.title}</h3>
      {event.description && <p className="text-white/60 mb-8 leading-relaxed">{event.description}</p>}

      <div className="grid grid-cols-2 gap-6 mb-10 pb-10 border-b etp-border">
        <div className="space-y-1">
          <p className="mono-label">Starting</p>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-orange-500" />
            <span className="font-bold text-white tracking-tight">{new Date(event.start).toLocaleString()}</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="mono-label">Ending</p>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-orange-500" />
            <span className="font-bold text-white tracking-tight">{new Date(event.end).toLocaleString()}</span>
          </div>
        </div>
        <div className="space-y-1 col-span-2">
          <p className="mono-label">Location Identity</p>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-orange-500" />
            <span className="font-bold text-white tracking-tight">{event.location?.name}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="flex-1 py-3 bg-white text-black font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer">
          <Calendar size={18} /> Add to Calendar (ICS)
        </button>
        <button className="px-5 py-3 border etp-border rounded-lg hover:bg-white/5 transition-colors text-white cursor-pointer">
          <ExternalLink size={18} />
        </button>
      </div>

      {event.sync.strategy !== 'static' && (
        <div className="mt-8 flex items-center gap-2 justify-center text-[10px] font-mono text-green-500/60 uppercase tracking-widest">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
          Synchronization Strategy: {event.sync.strategy} Active
        </div>
      )}
    </motion.div>
  );
};

const SpecSection = () => (
  <section id="spec" className="px-6 py-32 border-t etp-border bg-black/40">
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <Terminal className="text-orange-500" />
        <h2 className="text-3xl font-bold tracking-tight text-white">Protocol Specification v0.1</h2>
      </div>
      
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h4 className="text-sm border-l-2 border-orange-500 pl-4 font-bold uppercase tracking-widest font-mono text-white/50">Core Intent</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              ETP moves away from static snapshots (.ics) and fragmented provider APIs. By treating events as living objects with persistent URIs, we enable true cross-platform synchronization.
            </p>
            <ul className="space-y-2 text-xs text-white/50 font-mono">
              <li className="flex items-center gap-2 text-white"><ArrowRight size={10} className="text-orange-500" /> URI: etp://eventId</li>
              <li className="flex items-center gap-2 text-white"><ArrowRight size={10} className="text-orange-500" /> Type: application/etp+json</li>
              <li className="flex items-center gap-2 text-white"><ArrowRight size={10} className="text-orange-500" /> Scope: internet-native</li>
            </ul>
          </div>
          <div className="p-6 bg-white/5 border etp-border rounded-xl">
             <Code size={18} className="mb-4 opacity-30 text-white" />
             <p className="text-xs font-mono opacity-50 mb-2 text-white/70">Registration Sample</p>
             <pre className="text-[10px] font-mono text-orange-400">
{`POST /api/e
Content-Type: application/etp+json

{
  "title": "Protocol Sync",
  "start": "2024-06-01T10:00:00Z",
  "dynamic": true
}`}
             </pre>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 space-y-3">
             <Server size={18} className="text-orange-500" />
             <h5 className="font-bold text-white">Subscription Model</h5>
             <p className="text-[11px] opacity-50 text-white/60">Calendars don't import, they subscribe to the EVT stream URL provided by the router.</p>
          </div>
          <div className="p-6 space-y-3">
             <Navigation size={18} className="text-orange-500" />
             <h5 className="font-bold text-white">Device Routing</h5>
             <p className="text-[11px] opacity-50 text-white/60">Routers detect UA and serve webcal, desktop deep links, or Android/iOS intent filters.</p>
          </div>
          <div className="p-6 space-y-3">
             <Plus size={18} className="text-orange-500" />
             <h5 className="font-bold text-white">Agent Awareness</h5>
             <p className="text-[11px] opacity-50 text-white/60">JSON-first design allows AI agents to negotiate meeting times via ETP handshakes.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// --- Main App ---

export default function App() {
  const [createdResult, setCreatedResult] = useState<any>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) setViewId(id);
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-orange-500 selection:text-white bg-[#0C0C0C]">
      <Header />
      
      <main>
        {viewId ? (
          <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <button 
                onClick={() => { window.history.pushState({}, '', '/'); setViewId(null); }}
                className="mb-12 flex items-center gap-2 text-xs opacity-50 hover:opacity-100 transition-opacity text-white cursor-pointer"
              >
                <ArrowRight size={14} className="rotate-180" /> Back to Protocol Overview
              </button>
              <EventDetails id={viewId} />
            </div>
          </section>
        ) : (
          <>
            <Hero />
            <Features />
            
            <section id="demo" className="px-6 py-32 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                <div className="lg:col-span-5 space-y-8">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-orange-500 rounded-full" />
                    <h2 className="text-3xl font-bold tracking-tight text-white">Router Demo</h2>
                  </div>
                  <p className="text-white/60 leading-relaxed">
                    Test the ETP v0.1 router. Create an event object, register it with the transport node, and generate a universal routing link that works across all clients.
                  </p>
                  
                  <div className="space-y-4 pt-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-mono text-white">1</div>
                      <p className="text-sm opacity-50 text-white">Event data is compiled into a standards-compliant <span className="text-white">EVT</span> object.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-mono text-white">2</div>
                      <p className="text-sm opacity-50 text-white">Node computes the canonical <span className="text-white">etp://</span> hash and persistence layer.</p>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-mono text-white">3</div>
                      <p className="text-sm opacity-50 text-white">The <span className="text-white">Event Router</span> provides a single entry point for all devices.</p>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-7">
                  <AnimatePresence mode="wait">
                    {createdResult ? (
                      <SuccessPanel 
                        key="success" 
                        result={createdResult} 
                        onReset={() => setCreatedResult(null)} 
                      />
                    ) : (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <EventGenerator onCreated={setCreatedResult} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>
            
            <SpecSection />
          </>
        )}
      </main>

      <footer className="px-6 py-20 border-t etp-border text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-6 h-6 bg-white/5 border border-white/10 rounded flex items-center justify-center font-bold text-[10px] text-white">E</div>
          <span className="text-[10px] mono-label tracking-[0.2em] text-white">End of Protocol Stream</span>
        </div>
        <p className="text-[10px] opacity-30 uppercase tracking-[0.1em] text-white">© 2026 Event Transport Labs — Distributed Internet Infrastructure</p>
      </footer>
    </div>
  );
}
