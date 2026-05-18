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

const ComparisonSection = () => (
  <section className="px-6 py-32 max-w-7xl mx-auto border-t etp-border">
    <div className="flex flex-col items-center mb-20 text-center">
      <span className="mono-label text-orange-500 mb-4 tracking-[0.3em]">Comparative Analysis</span>
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Why Transport Matters</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Traditional Flow */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="p-10 rounded-3xl bg-white/5 border etp-border relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Calendar size={120} className="text-white" />
        </div>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-xs font-mono uppercase tracking-widest text-red-500 opacity-80">Legacy: Payload Import</span>
        </div>
        <h3 className="text-2xl font-bold mb-6 text-white">The Stale Sandbox</h3>
        <ul className="space-y-6">
          {[
            { t: "Static Snapshot", d: "Events are trapped in .ics files at the moment of download." },
            { t: "Manual Refresh", d: "Updates require rescheduling or re-importing new files." },
            { t: "Duplicate Records", d: "Moving an event locally creates fragmented, conflicting states." },
            { t: "Silent Failures", d: "Cancellations don't propagate to imported calendar files." }
          ].map((item, i) => (
            <li key={i} className="flex gap-4">
              <div className="w-5 h-5 mt-1 rounded-full border border-red-500/30 flex items-center justify-center flex-shrink-0 text-red-500 font-mono text-[10px]">!</div>
              <div>
                <p className="font-bold text-sm text-white/90">{item.t}</p>
                <p className="text-xs text-white/40 leading-relaxed">{item.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* ETP Flow */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="p-10 rounded-3xl bg-orange-500/5 border-2 border-orange-500/50 relative overflow-hidden group glow-orange"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Globe size={120} className="text-orange-500" />
        </div>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-green-500 font-bold">ETP: State Transport</span>
        </div>
        <h3 className="text-2xl font-bold mb-6 text-white">The Living Identity</h3>
        <ul className="space-y-6">
          {[
            { t: "Immutable Identity (EID)", d: "Universal anchor (evt_) resolves across all devices and clients." },
            { t: "Subscription Streams", d: "Calendars maintain a live interest in the event state." },
            { t: "Atomic Propogation", d: "Authoritative mutations propagate to all nodes in milliseconds." },
            { t: "Lifecycle Transparency", d: "Transitions (Cancelled, Updated) are signaled protocol-wide." }
          ].map((item, i) => (
            <li key={i} className="flex gap-4">
              <div className="w-5 h-5 mt-1 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 text-white font-mono text-[10px]">✓</div>
              <div>
                <p className="font-bold text-sm text-orange-400">{item.t}</p>
                <p className="text-xs text-white/50 leading-relaxed">{item.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  </section>
);

const LiveMutationDemo = () => {
  const [event, setEvent] = useState<ETPEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<{msg: string, type: 'info' | 'sync' | 'error'}[]>([]);

  const addLog = (msg: string, type: 'info' | 'sync' | 'error' = 'info') => {
    setLog(prev => [{ msg, type }, ...prev].slice(0, 5));
  };

  const createInitial = async () => {
    setLoading(true);
    addLog("Registering original event identity...", "info");
    const res = await fetch("/api/e", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "ETP Global Summit",
        start: new Date(Date.now() + 3600000).toISOString(),
        end: new Date(Date.now() + 7200000).toISOString(),
        location: { name: "Stockholm Central" },
        sync: { strategy: "stream" }
      })
    });
    const data = await res.json();
    setEvent(data.event);
    addLog(`Identity Created: ${data.event.eid}`, "sync");
    setLoading(false);
  };

  const mutate = async (type: 'location' | 'cancel') => {
    if (!event) return;
    setLoading(true);
    const updates = type === 'location' 
      ? { location: { name: "The Metaverse (E-Node #4)" }, lifecycle: "updated" }
      : { lifecycle: "cancelled" };
    
    addLog(`Broadcasting authoritative ${type === 'location' ? 'Update' : 'Cancellation'}...`, "info");
    
    const res = await fetch(`/api/e/${event.eid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    const updated = await res.json();
    setEvent(updated);
    addLog(`EID ${updated.eid} version incremented to v${updated.v}`, "sync");
    setLoading(false);
  };

  return (
    <section id="demo" className="px-6 py-40 max-w-7xl mx-auto border-t etp-border bg-black/20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5 space-y-8">
          <div className="flex items-center gap-3">
            <Activity className="text-orange-500 animate-pulse" />
            <h2 className="text-3xl font-bold tracking-tight text-white">Propagation Simulation</h2>
          </div>
          <p className="text-white/60 leading-relaxed text-lg">
            Experience the "Emotional Gap." Click below to register an event identity, then trigger a protocol-wide mutation.
          </p>
          
          <div className="p-6 bg-black/40 border etp-border rounded-xl font-mono text-[10px] space-y-2 h-40 overflow-hidden">
            <AnimatePresence>
              {log.map((l, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-2 ${l.type === 'sync' ? 'text-green-500' : 'text-white/40'}`}
                >
                  <span>[{new Date().toLocaleTimeString()}]</span>
                  <span>{l.type === 'sync' ? 'SYN' : 'LOG'}:</span>
                  <span className={l.type === 'sync' ? 'font-bold' : ''}>{l.msg}</span>
                </motion.div>
              ))}
              {log.length === 0 && <div className="opacity-20">Waiting for protocol interaction...</div>}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-4">
            {!event ? (
              <button 
                onClick={createInitial}
                disabled={loading}
                className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                1. Register Initial Identity {loading && <RefreshCcw className="animate-spin" size={16} />}
              </button>
            ) : (
              <>
                <button 
                  onClick={() => mutate('location')}
                  disabled={loading || event.lifecycle === 'cancelled'}
                  className="w-full py-4 bg-orange-600/20 border border-orange-500/50 text-orange-500 font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30"
                >
                  2. Mutate Location (Live Propogation)
                </button>
                <button 
                  onClick={() => mutate('cancel')}
                  disabled={loading || event.lifecycle === 'cancelled'}
                  className="w-full py-4 bg-red-500/10 border border-red-500/30 text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30"
                >
                  3. Signal Cancellation
                </button>
                <button onClick={() => setEvent(null)} className="text-[10px] mono-label text-center opacity-30 hover:opacity-100 transition-opacity cursor-pointer">Clear Identity</button>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="relative">
             <div className="absolute -top-4 left-4 bg-[#0C0C0C] px-2 text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] z-10">Client Observation Layer</div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Simulated Traditional App */}
                <div className="p-8 rounded-2xl glass-card border etp-border opacity-50 grayscale transition-all hover:grayscale-0">
                   <p className="mono-label mb-6">Legacy Mail App</p>
                   {event ? (
                     <div className="space-y-4">
                       <div className="p-4 bg-white/5 rounded border border-white/10">
                          <p className="text-[10px] opacity-40 font-mono mb-1">Attached: invitation.ics</p>
                          <p className="text-sm font-bold text-white line-through opacity-30">Global Summit (v1)</p>
                          <p className="text-[10px] text-red-400 mt-2">Status: Stale. Origin has moved.</p>
                       </div>
                       <div className="text-[9px] text-white/30 italic">User must re-download .ics to see updates.</div>
                     </div>
                   ) : (
                     <div className="h-32 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-[10px] opacity-20">Waiting for payload...</div>
                   )}
                </div>

                {/* Simulated ETP App */}
                <motion.div 
                  animate={event ? { scale: [1, 1.02, 1], borderColor: ["rgba(255,92,0,0.1)", "rgba(255,92,0,1)", "rgba(255,92,0,0.1)"] } : {}}
                  className="p-8 rounded-2xl border-4 border-orange-500/0 bg-orange-500/5 relative overflow-hidden"
                >
                   <div className="flex justify-between items-center mb-6">
                      <p className="mono-label text-orange-500 font-bold">ETP Native Client</p>
                      {event && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                   </div>
                   {event ? (
                     <motion.div 
                        key={event.v}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                     >
                       <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-1 rounded ${event.lifecycle === 'cancelled' ? 'bg-red-500' : 'bg-green-500'} text-white font-mono`}>{event.lifecycle.toUpperCase()}</span>
                          <span className="text-[10px] font-mono text-white/40">EVT Version {event.v}</span>
                       </div>
                       <h4 className="text-xl font-bold tracking-tight text-white">{event.title}</h4>
                       <div className="flex items-center gap-2 text-white/60">
                          <MapPin size={12} className="text-orange-500" />
                          <span className="text-xs transition-all">{event.location?.name}</span>
                       </div>
                       {event.lifecycle !== 'cancelled' && (
                         <div className="pt-4 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                               <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 1.5 }}
                                  className="h-full bg-orange-500" 
                               />
                            </div>
                            <span className="text-[8px] font-mono opacity-30 text-white">STATE SYNCED</span>
                         </div>
                       )}
                     </motion.div>
                   ) : (
                     <div className="h-32 flex items-center justify-center border-2 border-dashed border-orange-500/10 rounded-xl text-[10px] opacity-20">Awaiting stream...</div>
                   )}
                </motion.div>
             </div>
          </div>

          <div className="p-6 bg-black/40 border etp-border rounded-xl">
             <div className="flex items-center justify-between mb-4">
                <p className="mono-label">Protocol Visualization</p>
                <div className="flex items-center gap-1">
                   <div className="w-1 h-1 bg-orange-500 rounded-full" />
                   <div className="w-1 h-3 bg-orange-500/20 rounded-full" />
                   <div className="w-1 h-2 bg-orange-500/50 rounded-full" />
                </div>
             </div>
             {event ? (
               <div className="space-y-4 font-mono text-[9px]">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                     <span className="opacity-30 uppercase tracking-widest text-white">Identity</span>
                     <span className="text-orange-500 underline text-white">etp://{event.eid}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                     <span className="opacity-30 uppercase tracking-widest text-white">AUTHORITY</span>
                     <span className="text-white">Origin Verified Node</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                     <span className="opacity-30 uppercase tracking-widest text-white">MUTATION TYPE</span>
                     <span className="text-white font-bold">{event.v > 1 ? 'Incremental Delta' : 'Initial Snapshot'}</span>
                  </div>
                  <div className="pt-2 flex gap-1">
                     {Array.from({ length: 12 }).map((_, i) => (
                       <motion.div 
                          key={i}
                          animate={{ 
                            height: [8, Math.random() * 20 + 5, 8],
                            opacity: [0.3, 0.8, 0.3]
                          }}
                          transition={{ 
                            duration: 1 + Math.random(), 
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                          className="w-1 bg-orange-500 rounded-full"
                       />
                     ))}
                     <span className="ml-4 opacity-30 uppercase text-[8px] self-center text-white">Protocol Stream Active</span>
                  </div>
               </div>
             ) : (
               <div className="text-center py-10 opacity-10 uppercase tracking-[0.3em] text-[10px] text-white">Identity Inactive</div>
             )}
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Hero & Main App ---

const Hero = () => (
  <section className="px-6 py-32 flex flex-col items-center text-center max-w-5xl mx-auto overflow-hidden relative">
    {/* Background Glows */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/5 rounded-full blur-[120px] -z-10" />
    <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] -z-10" />

    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-xs text-orange-500 font-bold mb-10 tracking-widest uppercase"
    >
      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
      ETP Protocol v0.1-Alpha
    </motion.div>

    <motion.h2 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.95] text-white"
    >
      Events are <span className="text-orange-500 italic">synchronous</span>,<br />not downloadable.
    </motion.h2>

    <motion.p 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="text-xl md:text-2xl text-white/50 mb-12 max-w-3xl font-light leading-relaxed"
    >
      Stop sending files. Start transporting state. ETP is the internet-native plumbing for event synchronization across apps, agents, and OS.
    </motion.p>

    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="flex flex-wrap items-center justify-center gap-6"
    >
      <button 
        onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-10 py-5 bg-white text-black font-bold rounded-xl flex items-center gap-3 hover:bg-orange-500 hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-2xl shadow-orange-500/20 cursor-pointer text-lg"
      >
        Experience the Demo <ArrowRight size={20} />
      </button>
      <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-colors text-lg text-white">
        Spec Definition
      </button>
    </motion.div>
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
          <span className="mono-label">EID Identity Registered</span>
        </div>
        <button onClick={onReset} className="text-xs underline opacity-50 hover:opacity-100 text-white cursor-pointer transition-opacity">Register New Identity</button>
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
                <p className="text-xs font-bold text-white">EID (ULID)</p>
                <p className="text-[10px] text-orange-500 font-mono tracking-tight">{result.event.eid}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 border etp-border flex items-center justify-center">
                <Calendar size={20} className="text-white opacity-40" />
              </div>
              <div>
                <p className="text-xs font-bold text-white opacity-40">ICS Compatibility</p>
                <a href={result.links.ics} className="text-[10px] text-orange-500 hover:underline">Download Legacy Blob</a>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold opacity-40 uppercase tracking-widest font-mono text-white">EVT Object (Snapshot)</h4>
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
        <h2 className="text-3xl font-bold tracking-tight text-white">Event Transport Protocol v0.1</h2>
      </div>
      
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <h4 className="text-sm border-l-2 border-orange-500 pl-4 font-bold uppercase tracking-widest font-mono text-white/50">Core Identity Foundation</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              ETP uses <strong>EIDs</strong> (Immutable Event Identities) based on ULIDs to ensure every event state is uniquely addressable and sortable across the internet.
            </p>
            <ul className="space-y-2 text-xs text-white/50 font-mono">
              <li className="flex items-center gap-2 text-white"><ArrowRight size={10} className="text-orange-500" /> EID Format: evt_[ULID]</li>
              <li className="flex items-center gap-2 text-white"><ArrowRight size={10} className="text-orange-500" /> Serialization: application/etp+json</li>
              <li className="flex items-center gap-2 text-white"><ArrowRight size={10} className="text-orange-500" /> Scheme: etp:// identity anchor</li>
            </ul>
          </div>
          <div className="p-6 bg-white/5 border etp-border rounded-xl">
             <Code size={18} className="mb-4 opacity-30 text-white" />
             <p className="text-xs font-mono opacity-50 mb-2 text-white/70">Authoritative Mutation</p>
             <pre className="text-[10px] font-mono text-orange-400">
{`POST /api/e
Content-Type: application/etp+json

{
  "title": "Protocol Sync",
  "start": "2026-06-01T10:00:00Z",
  "origin": "https://node.etp.dev"
}`}
             </pre>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 space-y-3">
             <Server size={18} className="text-orange-500" />
             <h5 className="font-bold text-white">State Propagation</h5>
             <p className="text-[11px] opacity-50 text-white/60">ETP shifts from "importing snapshots" to "subscribing to streams" of canonical event objects.</p>
          </div>
          <div className="p-6 space-y-3">
             <Navigation size={18} className="text-orange-500" />
             <h5 className="font-bold text-white">Universal Routing</h5>
             <p className="text-[11px] opacity-50 text-white/60">The router resolves EIDs to native platform protocols like webcal or EVT streaming endpoints.</p>
          </div>
          <div className="p-6 space-y-3">
             <Activity size={18} className="text-orange-500" />
             <h5 className="font-bold text-white">Agent Ready</h5>
             <p className="text-[11px] opacity-50 text-white/60">JSON-first schema enables AI agents to negotiate and synchronize meeting states autonomously.</p>
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
          <div className="space-y-0">
            <Hero />
            <ComparisonSection />
            <LiveMutationDemo />
            
            <section className="px-6 py-32 border-t etp-border bg-black/40">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                  <div className="space-y-6">
                    <h3 className="text-3xl font-bold tracking-tight text-white underline decoration-orange-500/30">Developer Integration</h3>
                    <p className="text-white/50 leading-relaxed text-sm">
                      Ready to build on the transport layer? Register your first event identity manually to see the underlying architecture in action.
                    </p>
                    <ul className="space-y-4">
                      {[
                        "Resolvable EID Handshakes",
                        "Universal Router Gateway",
                        "Native Protocol Resolution"
                      ].map(item => (
                        <li key={item} className="flex items-center gap-3 text-xs font-mono text-white/30 italic italic italic">
                          <Check size={12} className="text-orange-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <EventGenerator onCreated={setCreatedResult} />
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>
            </section>
            
            <SpecSection />
          </div>
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
