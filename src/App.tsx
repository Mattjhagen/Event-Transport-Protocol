import React, { useState, useEffect, useRef } from "react";
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
  const [log, setLog] = useState<{msg: string, type: 'info' | 'sync' | 'error' | 'meta', v?: number}[]>([]);
  const [streamData, setStreamData] = useState<any[]>([]);
  const [isReplaying, setIsReplaying] = useState(false);
  const [transport, setTransport] = useState<'sse' | 'ws'>('sse');
  const [syncState, setSyncState] = useState<'IDLE' | 'SYNCHRONIZED' | 'REPLAYING' | 'STALE' | 'OFFLINE'>('IDLE');
  const [nodeCapabilities, setNodeCapabilities] = useState<any>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const addLog = (msg: string, type: 'info' | 'sync' | 'error' | 'meta' = 'info', v?: number) => {
    setLog(prev => [{ msg, type, v }, ...prev].slice(0, 15));
  };

  const fetchCapabilities = async () => {
    try {
      const res = await fetch("/api/capabilities");
      const data = await res.json();
      setNodeCapabilities(data);
      addLog(`Capability Negotiated: ETP v${data.version}`, "meta");
    } catch (e) {
      addLog("Capability Negotiation Failed", "error");
    }
  };

  useEffect(() => {
    fetchCapabilities();
  }, []);

  const subscribeSSE = (since?: number) => {
    if (!event) return;
    setSyncState('REPLAYING');
    
    const url = `/api/e/${event.eid}/stream${since ? `?since=${since}` : ''}`;
    addLog(`INIT SSE TRANS-BIND (since v${since || 0})`, "info");
    
    const es = new EventSource(url);
    
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      handleFrame(data);
    };

    es.onerror = () => {
      setSyncState('OFFLINE');
      addLog("SSE Transport Disconnected", "error");
    };

    eventSourceRef.current = es;
  };

  const subscribeWS = (since?: number) => {
    if (!event) return;
    setSyncState('REPLAYING');
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/api/etp-ws`;
    
    addLog(`INIT WS TRANS-BIND (since v${since || 0})`, "info");
    
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'etp.subscribe',
        eid: event.eid,
        since: since || 0
      }));
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      handleFrame(data);
    };

    ws.onerror = () => {
      setSyncState('OFFLINE');
      addLog("WS Transport Failure", "error");
    };

    ws.onclose = () => {
      if (syncState !== 'OFFLINE') setSyncState('OFFLINE');
    };

    socketRef.current = ws;
  };

  const handleFrame = (data: any) => {
    if (data.type === 'snapshot.sync') {
      const status = data.fallback ? 'FALLBACK RESYNC' : 'SNAPSHOT RECEIVED';
      addLog(`${status} (v${data.event.v})`, "sync", data.event.v);
      setEvent(data.event);
      setSyncState('SYNCHRONIZED');
      setIsReplaying(false);
    } else if (data.type === 'delta.sync' || data.type === 'event.updated') {
      addLog(`DELTA PROPAGATED (v${data.v})`, "sync", data.v);
      setEvent(data.event);
      setSyncState('SYNCHRONIZED');
    } else if (data.type === 'subscription.state') {
       addLog(`Subscription ${data.state.toUpperCase()}`, "meta");
    } else if (data.type === 'heartbeat') {
       // Minimal visualization for heartbeats
    }
    
    if (data.type !== 'heartbeat') {
      setStreamData(prev => [data, ...prev].slice(0, 10));
    }
  };

  const cleanup = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  useEffect(() => {
    if (event && !eventSourceRef.current && !socketRef.current && !isReplaying) {
      if (transport === 'sse') subscribeSSE();
      else subscribeWS();
    }

    return cleanup;
  }, [event?.eid, isReplaying, transport]);

  const simulateReconnect = () => {
    if (!event) return;
    setIsReplaying(true);
    setSyncState('STALE');
    addLog("Transport Drop Triggered...", "meta");
    cleanup();
    
    setTimeout(() => {
      if (transport === 'sse') subscribeSSE(event.v);
      else subscribeWS(event.v);
    }, 2000);
  };

  const createInitial = async () => {
    setLoading(true);
    addLog("Negotiating EID Registration...", "info");
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
    setLoading(false);
  };

  const mutate = async (type: 'location' | 'cancel' | 'delay' | 'reschedule' | 'complete') => {
    if (!event) return;
    setLoading(true);
    
    let updates: any = {};
    switch (type) {
      case 'location':
        updates = { location: { name: "The Metaverse (E-Node #42)" }, lifecycle: "updated" };
        break;
      case 'cancel':
        updates = { lifecycle: "cancelled" };
        break;
      case 'delay':
        const newStart = new Date(new Date(event.start).getTime() + 30 * 60000).toISOString();
        updates = { start: newStart, lifecycle: "delayed" };
        break;
      case 'reschedule':
        const resStart = new Date(new Date(event.start).getTime() + 86400000).toISOString();
        updates = { start: resStart, lifecycle: "rescheduled" };
        break;
      case 'complete':
        updates = { lifecycle: "completed" };
        break;
    }
    
    addLog(`Broadcasting Mutative Intent: ${type}`, "info");
    
    await fetch(`/api/e/${event.eid}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "X-Mutation-ID": `mut_${ulid_safe()}`,
        "X-ETP-If-Version": String(event.v)
      },
      body: JSON.stringify(updates)
    });
    setLoading(false);
  };

  const ulid_safe = () => Math.random().toString(36).substring(2, 15);

  const getStatusColor = () => {
    switch (syncState) {
      case 'SYNCHRONIZED': return 'text-green-500';
      case 'REPLAYING': return 'text-blue-400';
      case 'STALE': return 'text-orange-500';
      case 'OFFLINE': return 'text-red-500';
      default: return 'text-white/20';
    }
  };

  return (
    <section id="demo" className="px-6 py-40 max-w-7xl mx-auto border-t etp-border bg-black/20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="text-orange-500 animate-pulse" />
              <h2 className="text-3xl font-bold tracking-tight text-white">Transport Binding Demo</h2>
            </div>
            <div className={`text-[10px] font-mono font-bold tracking-widest ${getStatusColor()}`}>
              {syncState}
            </div>
          </div>
          <p className="text-white/60 leading-relaxed text-lg">
            ETP is <strong>transport-neutral</strong>. Select a binding below to observe how the protocol maintains synchronization consistency across different delivery layers.
          </p>

          {/* Transport Selection */}
          <div className="flex p-1 bg-white/5 border etp-border rounded-lg">
            <button 
              onClick={() => { setTransport('sse'); cleanup(); }}
              className={`flex-1 py-2 text-xs font-bold rounded transition-all ${transport === 'sse' ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'}`}
            >
              SSE Binding
            </button>
            <button 
              onClick={() => { setTransport('ws'); cleanup(); }}
              className={`flex-1 py-2 text-xs font-bold rounded transition-all ${transport === 'ws' ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'}`}
            >
              WebSocket Binding
            </button>
          </div>
          
          <div className="p-6 bg-black/40 border etp-border rounded-xl font-mono text-[10px] space-y-2 h-48 overflow-y-auto custom-scrollbar">
            <AnimatePresence initial={false}>
              {log.map((l, i) => (
                <motion.div 
                  key={`${l.msg}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-2 ${l.type === 'sync' ? 'text-green-500' : l.type === 'error' ? 'text-red-500' : l.type === 'meta' ? 'text-blue-400 italic' : 'text-white/40'}`}
                >
                  <span>[{new Date().toLocaleTimeString()}]</span>
                  <span>{l.type === 'sync' ? 'SYN' : l.type === 'meta' ? 'MET' : 'LOG'}:</span>
                  <span className={l.type === 'sync' ? 'font-bold' : ''}>
                    {l.msg} {l.v && <span className="opacity-40">v{l.v}</span>}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {log.length === 0 && <div className="opacity-20 text-white">Listening for transport frames...</div>}
            {isReplaying && (
              <motion.div 
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-[9px] text-blue-400 font-mono"
              >
                &gt; CONNECTION INTERRUPTED ... RECOVERY PENDING
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {!event ? (
              <button 
                onClick={createInitial}
                disabled={loading}
                className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                1. Register & Subscribe {loading && <RefreshCcw className="animate-spin" size={16} />}
              </button>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => mutate('location')}
                    disabled={loading || event.lifecycle === 'cancelled'}
                    className="py-4 bg-orange-600/20 border border-orange-500/50 text-orange-500 text-xs font-bold rounded-lg hover:bg-orange-500 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                  >
                    Mutate Content
                  </button>
                  <button 
                    onClick={() => mutate('delay')}
                    disabled={loading || event.lifecycle === 'cancelled' || event.lifecycle === 'completed'}
                    className="py-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs font-bold rounded-lg hover:bg-yellow-500 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                  >
                    Delay (+30m)
                  </button>
                  <button 
                    onClick={() => mutate('reschedule')}
                    disabled={loading || event.lifecycle === 'cancelled' || event.lifecycle === 'completed'}
                    className="py-4 bg-purple-500/10 border border-purple-500/30 text-purple-500 text-xs font-bold rounded-lg hover:bg-purple-500 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                  >
                    Reschedule (+24h)
                  </button>
                  <button 
                    onClick={() => mutate('complete')}
                    disabled={loading || event.lifecycle === 'cancelled' || event.lifecycle === 'completed'}
                    className="py-4 bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-bold rounded-lg hover:bg-green-500 hover:text-white transition-all disabled:opacity-30 cursor-pointer"
                  >
                    Signal Completion
                  </button>
                </div>
                
                <button 
                  onClick={() => mutate('cancel')}
                  disabled={loading || event.lifecycle === 'cancelled'}
                  className="w-full py-4 bg-red-500/10 border border-red-500/30 text-red-500 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30"
                >
                  3. Withdraw Identity (Signal Cancel)
                </button>
                <button 
                  onClick={simulateReconnect}
                  disabled={loading || isReplaying}
                  className="w-full py-4 bg-blue-500/10 border border-blue-500/30 text-blue-500 font-bold rounded-lg hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30"
                >
                  {isReplaying ? "Recovering..." : "Simulate Connection Drop & Replay"}
                </button>
                <div className="flex gap-4">
                  <button onClick={() => { setEvent(null); setLog([]); setStreamData([]); setIsReplaying(false); }} className="flex-1 text-[10px] mono-label text-center opacity-30 hover:opacity-100 transition-opacity cursor-pointer">Unsubscribe</button>
                  <button onClick={() => setLog([])} className="flex-1 text-[10px] mono-label text-center opacity-30 hover:opacity-100 transition-opacity cursor-pointer">Clear Logs</button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="relative">
             <div className="absolute -top-4 left-4 bg-[#0C0C0C] px-2 text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] z-10">Client Observations</div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Legacy App - Stays stale */}
                <div className="p-8 rounded-2xl glass-card border etp-border opacity-50 grayscale">
                   <p className="mono-label mb-6">Legacy Mail Client</p>
                   {event ? (
                     <div className="space-y-4">
                       <div className="p-4 bg-white/5 rounded border border-white/10">
                          <p className="text-[10px] opacity-40 font-mono mb-1">Attached: invitation.ics</p>
                          <p className="text-sm font-bold text-white line-through opacity-30">Global Summit (v1)</p>
                          <p className="text-[10px] text-red-400 mt-2">Update Required: Manual</p>
                       </div>
                     </div>
                   ) : <div className="h-32 flex items-center justify-center opacity-10">Empty Inbox</div>}
                </div>

                {/* ETP Native Client - Updates via SSE */}
                <motion.div 
                  animate={event ? { scale: [1, 1.01, 1] } : {}}
                  className="p-8 rounded-2xl border-2 border-orange-500/10 bg-orange-500/5"
                >
                   <div className="flex justify-between items-center mb-6">
                      <p className="mono-label text-orange-500 font-bold">ETP Subscriber</p>
                      {event && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_green]" />}
                   </div>
                   {event ? (
                     <motion.div 
                        key={event.v}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                     >
                       <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded ${event.lifecycle === 'cancelled' ? 'bg-red-500' : 'bg-green-500'} text-white font-bold`}>{event.lifecycle.toUpperCase()}</span>
                          <span className="text-[10px] font-mono text-white/40">v{event.v}</span>
                       </div>
                       <h4 className="text-xl font-bold tracking-tight text-white">{event.title}</h4>
                       <div className="flex items-center gap-2 text-white/40 mb-2">
                          <Clock size={12} />
                          <span className="text-[10px] font-mono">{new Date(event.start).toLocaleString()}</span>
                       </div>
                       <div className="flex items-center gap-2 text-white/60">
                          <MapPin size={12} className="text-orange-500" />
                          <span className="text-xs">{event.location?.name}</span>
                       </div>
                       
                       {/* Urgency Indicator */}
                       <div className="mt-6 pt-4 border-t border-white/5">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest text-white">Temporal Urgency</span>
                             <span className="text-[9px] font-bold text-orange-500">REAL-TIME PRIORITY</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                                animate={{ width: ["10%", "90%", "10%"] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="h-full bg-orange-500"
                             />
                          </div>
                       </div>
                     </motion.div>
                   ) : <div className="h-32 flex items-center justify-center opacity-10">Listening for EIDs...</div>}
                </motion.div>
             </div>
          </div>

          {/* Authoritative Timeline */}
          <div className="p-6 bg-black/60 border etp-border rounded-xl">
             <div className="flex items-center justify-between mb-4">
                <p className="mono-label text-orange-500">Authoritative Timeline</p>
                <div className="flex gap-1">
                   {Array.from({ length: 5 }).map((_, i) => (
                     <div key={i} className={`w-1 h-3 rounded-full ${event && event.v > i ? 'bg-orange-500' : 'bg-white/5'}`} />
                   ))}
                </div>
             </div>
             {event ? (
               <div className="relative pl-4 border-l border-white/10 space-y-4">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 bg-orange-500 rounded-full" />
                  <div className="space-y-4">
                     <div className="text-[10px]">
                        <span className="text-orange-500 font-bold font-mono">v{event.v}</span>
                        <span className="text-white opacity-40 mx-2">—</span>
                        <span className="text-white opacity-60">Current State superseded {event.v - 1} prior versions.</span>
                        {event.supersedes && (
                          <p className="mt-1 text-[8px] opacity-30 font-mono text-white">SUPERCEDES: {event.supersedes}</p>
                        )}
                     </div>
                  </div>
               </div>
             ) : (
               <div className="text-center py-4 opacity-10 uppercase tracking-widest text-[10px] text-white">Timeline Inactive</div>
             )}
          </div>

          {/* Raw Stream Monitor */}
          <div className="p-6 bg-black/60 border etp-border rounded-xl">
             <div className="flex items-center justify-between mb-4">
                <p className="mono-label text-orange-500">Raw Stream Primitives</p>
                <span className="text-[10px] opacity-30 font-mono">application/etp+json</span>
             </div>
             <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar font-mono text-[9px]">
                {streamData.map((d, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={i} 
                    className="p-2 bg-white/5 border border-white/5 rounded"
                  >
                    <span className="text-blue-400">event: message</span><br/>
                    <span className="text-green-400">data: </span>
                    <span className="text-white/60">{JSON.stringify(d)}</span>
                  </motion.div>
                ))}
                {streamData.length === 0 && <div className="text-center py-8 opacity-20 uppercase tracking-widest">No Active Subscription</div>}
             </div>
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
