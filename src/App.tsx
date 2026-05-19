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

import { ETPClient } from "../sdk/etp-client";

// --- Components ---

const Header = () => (
  <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">CM</div>
      <div>
        <h1 className="text-sm font-bold tracking-tight text-white">CMAMeet</h1>
        <p className="text-[10px] mono-label leading-none opacity-40 uppercase tracking-widest">ETP Reference implementation</p>
      </div>
    </div>
    <nav className="flex items-center gap-8">
      <a href="#why" className="text-xs font-medium hover:text-white transition-colors text-white/50">Rationale</a>
      <a href="#ref-impl" className="text-xs font-medium hover:text-white transition-colors text-white/50">Implementation</a>
      <a href="#demo" className="text-xs font-medium hover:text-white transition-colors text-white/50">Engine</a>
      <div className="h-4 w-[1px] bg-white/10" />
      <a 
        href="https://github.com/Mattjhagen/Event-Transport-Protocol" 
        target="_blank" 
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-tight hover:bg-white/10 transition-colors flex items-center gap-2"
      >
        <Code size={12} /> Source
      </a>
    </nav>
  </header>
);

const CMAMeetReferenceSection = () => (
  <section id="ref-impl" className="px-6 py-40 max-w-7xl mx-auto border-t border-white/5">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
      <div className="relative order-2 lg:order-1">
        <div className="absolute -inset-4 bg-orange-500/5 blur-2xl rounded-3xl" />
        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/20" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
              <div className="w-2 h-2 rounded-full bg-green-500/20" />
            </div>
            <div className="text-[10px] font-mono text-white/20">cmameet.app/j/evt_k8s2x9</div>
          </div>
          <div className="aspect-video bg-black flex flex-col items-center justify-center p-12 text-center group">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap size={32} className="text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2 tracking-tight">Active ETP Binding</h4>
            <p className="text-sm text-white/40 max-w-xs">Connecting to authoritative origin for real-time synchronization...</p>
            
            <div className="mt-8 flex gap-2">
              <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[8px] font-bold uppercase tracking-widest">Verified</div>
              <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[8px] font-bold uppercase tracking-widest">TLS 1.3</div>
            </div>
          </div>
        </div>
        
        {/* Floating Stat Card */}
        <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-2xl hidden md:block">
          <p className="text-black text-[10px] font-bold uppercase tracking-widest mb-1">State Latency</p>
          <p className="text-black text-3xl font-bold tracking-tighter">&lt;85ms</p>
          <p className="text-black/40 text-[9px] mt-2 font-mono">P99 Global Propagation</p>
        </div>
      </div>

      <div className="space-y-8 order-1 lg:order-2">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">Reference Implementation</span>
        <h2 className="text-5xl font-bold tracking-tighter text-white">CMAMeet</h2>
        <div className="space-y-6 text-white/60 text-lg leading-relaxed font-light">
          <p>
            <a href="https://github.com/Mattjhagen/CMAMeet" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline flex items-center gap-1 inline-flex">
              CMAMeet <ExternalLink size={14} />
            </a> is the open-source reference for ETP-native meetings. It is a lightweight video platform built specifically to demonstrate why <strong>live event-state</strong> is superior to static invitations.
          </p>
          <p>
            While legacy systems struggle with "ghost invites" and stale links, CMAMeet uses ETP to maintain a persistent, authoritative heartbeat between the meeting organizer and every invited participant.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          {[
            { t: "Organizer Mutation", d: "Host changes the meeting link or venue." },
            { t: "ETP Delta Propagation", d: "Incremental JSON patches sent to all listeners." },
            { t: "Subscriber Synchronization", d: "Calendars and clients update in milliseconds." },
            { t: "Authoritative Join", d: "Participants join the correct room, every time." }
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="text-[10px] font-mono text-white/20 w-4">{i + 1}</div>
              <div className="h-px bg-white/10 flex-1" />
              <div className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">{step.t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const ProblemSolutionSection = () => (
  <section id="why" className="px-6 py-40 max-w-7xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
      <div className="space-y-8">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">The Motivation</span>
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[0.9]">
          Calendars designed <br /><span className="opacity-30">for a static era.</span>
        </h2>
        <div className="space-y-6 text-white/60 text-lg leading-relaxed max-w-xl font-light">
          <p>
            Traditional invites are <strong>snapshots</strong>. Once an invitation is sent, the connection between the organizer and the participant is severed.
          </p>
          <p>
            When a meeting link changes or a start time shifts, your calendar stays stale. This results in "meeting drift"—a persistent coordination failure that ETP solves at the transport layer.
          </p>
        </div>
        
        <div className="pt-8 grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white tracking-tighter">72%</p>
            <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Invite Mismatch</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white tracking-tighter">&lt;1s</p>
            <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Sync Target</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
        <div className="relative border border-white/10 bg-black/40 rounded-3xl p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[10px] font-mono text-white/50">CMAMeet: The Difference</p>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <ul className="space-y-6">
            {[
              { icon: <LinkIcon size={16} />, t: "Live Links", d: "Change your Zoom link at T-2 minutes. Everyone joins the correct room." },
              { icon: <Clock size={16} />, t: "Real-time Delays", d: "Signal a 10m delay authoritativey. Calendars shift instantly." },
              { icon: <Activity size={16} />, t: "Presence Sync", d: "Know who is in the room before you even click join." },
              { icon: <Calendar size={16} />, t: "Zero Duplication", d: "One Event Identity (EID). No conflicting duplicate invites." }
            ].map((item, i) => (
              <li key={i} className="flex gap-4 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">{item.t}</h4>
                  <p className="text-sm text-white/50">{item.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const ComparisonSection = () => (
  <section className="px-6 py-40 max-w-7xl mx-auto border-t border-white/5">
    <div className="flex flex-col items-center mb-24 text-center">
      <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">How deltas beat snapshots.</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-0">
      {/* Traditional Flow */}
      <div className="p-12 rounded-3xl lg:rounded-r-none border border-white/5 bg-black/40 relative overflow-hidden flex flex-col">
        <div className="mb-12">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">Snapshot Model</span>
          <h3 className="text-3xl font-bold text-white mt-4 tracking-tight">Isolated invites</h3>
        </div>
        
        <div className="space-y-12 flex-1">
          <div className="relative pl-8 border-l border-white/5 space-y-8">
            <div className="absolute -left-[1px] top-0 w-[2px] h-full bg-red-500/20" />
            <div className="relative">
              <div className="absolute -left-[9.5px] top-1 w-4 h-4 bg-[#0A0A0A] border border-white/10 flex items-center justify-center rounded-full text-[8px] text-white/30">1</div>
              <p className="text-sm text-white font-medium">Export .ics snapshot</p>
              <p className="text-xs text-white/40">The state is frozen in a dead file.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[9.5px] top-1 w-4 h-4 bg-[#0A0A0A] border border-white/10 flex items-center justify-center rounded-full text-[8px] text-white/30">2</div>
              <p className="text-sm text-white font-medium line-through decoration-red-500/50">Manual Link Update</p>
              <p className="text-xs text-white/40">Meeting URL changes. Calendar invite stays stale.</p>
            </div>
            <div className="relative opacity-30">
              <div className="absolute -left-[9.5px] top-1 w-4 h-4 bg-[#0A0A0A] border border-white/10 flex items-center justify-center rounded-full text-[8px] text-white/30">3</div>
              <p className="text-sm text-white font-medium italic">Broken Join</p>
              <p className="text-xs text-white/40">Users land in empty rooms or dead calls.</p>
            </div>
          </div>
          
          <div className="p-4 bg-red-500/5 rounded border border-red-500/10 text-red-500/60 text-[10px] font-mono uppercase tracking-widest text-center">
            Synchronicity Lost
          </div>
        </div>
      </div>

      {/* CMAMeet Flow */}
      <div className="p-12 rounded-3xl lg:rounded-l-none border-y border-r border-white/10 bg-white/[0.02] shadow-[inset_0_0_80px_rgba(255,255,255,0.01)] relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] blur-3xl" />
        <div className="mb-12">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/60">ETP Stream Model</span>
            <span className="px-2 py-0.5 rounded-full bg-white text-black text-[8px] font-bold uppercase tracking-tight">Synchronized</span>
          </div>
          <h3 className="text-3xl font-bold text-white mt-4 tracking-tight">Live state propagation</h3>
        </div>

        <div className="space-y-12 flex-1">
          <div className="relative pl-8 border-l border-white/20 space-y-8">
            <motion.div 
               animate={{ opacity: [1, 0.5, 1] }} 
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute -left-[1px] top-0 w-[2px] h-full bg-white/40 shadow-[0_0_10px_white/20]" 
            />
            <div className="relative">
              <div className="absolute -left-[9.5px] top-1 w-4 h-4 bg-white flex items-center justify-center rounded-full text-[8px] text-black font-bold">1</div>
              <p className="text-sm text-white font-medium">Subscribe: evt_cmameet_38</p>
              <p className="text-xs text-white/60">Authorization established via ETP client handshake.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[9.5px] top-1 w-4 h-4 bg-white flex items-center justify-center rounded-full text-[8px] text-black font-bold">2</div>
              <p className="text-sm text-white font-medium">Auto-Delta Propagation</p>
              <p className="text-xs text-white/60">Link update pushed to all subscribers in &lt;100ms.</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[9.5px] top-1 w-4 h-4 bg-white flex items-center justify-center rounded-full text-[8px] text-black font-bold">3</div>
              <p className="text-sm text-white font-medium">Authoritative Join</p>
              <p className="text-xs text-white/60">Seamless handover to CMAMeet meeting engine.</p>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded border border-white/10 text-white/80 text-[10px] font-mono uppercase tracking-widest text-center">
            Authoritative State Maintained
          </div>
        </div>
      </div>
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
  const [verificationState, setVerificationState] = useState<'VERIFIED' | 'UNVERIFIED' | 'AUTHORITATIVE' | 'PENDING'>('PENDING');
  
  const etpClientRef = useRef<ETPClient | null>(null);

  const addLog = (msg: string, type: 'info' | 'sync' | 'error' | 'meta' = 'info', v?: number) => {
    setLog(prev => [{ msg, type, v }, ...prev].slice(0, 15));
  };

  useEffect(() => {
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
    fetchCapabilities();
  }, []);

  useEffect(() => {
    if (!etpClientRef.current) {
      etpClientRef.current = new ETPClient({
        nodeUrl: window.location.origin,
        transport: transport
      });

      etpClientRef.current.onFrame((data: any) => {
        if (data.type === 'snapshot.sync') {
          const status = data.fallback ? 'FALLBACK RESYNC' : 'SNAPSHOT RECEIVED';
          addLog(`${status} (v${data.event.v})`, "sync", data.event.v);
          setEvent(data.event);
          setSyncState('SYNCHRONIZED');
          setVerificationState(data.event.auth?.signature ? 'AUTHORITATIVE' : 'UNVERIFIED');
          setIsReplaying(false);
        } else if (data.type === 'delta.sync' || data.type === 'event.updated') {
          addLog(`DELTA PROPAGATED (v${data.v})`, "sync", data.v);
          setEvent(data.event);
          setSyncState('SYNCHRONIZED');
          setVerificationState(data.signature || data.event?.auth?.signature ? 'VERIFIED' : 'UNVERIFIED');
        } else if (data.type === 'subscription.state') {
           addLog(`Subscription ${data.state.toUpperCase()}`, "meta");
        }
        
        if (data.type !== 'heartbeat') {
          setStreamData(prev => [data, ...prev].slice(0, 10));
        }
      });

      etpClientRef.current.onStateChange((state) => {
        switch (state) {
          case "CONNECTING": setSyncState('REPLAYING'); break;
          case "CONNECTED": setSyncState('SYNCHRONIZED'); break;
          case "DISCONNECTED": setSyncState('OFFLINE'); break;
          case "ERROR": addLog("Transport Failure", "error"); setSyncState('OFFLINE'); break;
        }
      });
    }

    if (event && !isReplaying) {
      etpClientRef.current.subscribe(event.eid);
    }

    return () => {
      etpClientRef.current?.disconnect();
      etpClientRef.current = null;
    };
  }, [event?.eid, isReplaying, transport]);

  const simulateReconnect = () => {
    if (!event || !etpClientRef.current) return;
    setIsReplaying(true);
    setSyncState('STALE');
    addLog("SDK-Triggered Recovery Flow...", "meta");
    etpClientRef.current.disconnect();
    
    setTimeout(() => {
      etpClientRef.current?.subscribe(event.eid, event.v);
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
    
    try {
      await etpClientRef.current?.mutate(event.eid, updates, event.v);
    } catch (e: any) {
      addLog(`Mutation Error: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
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
    <section id="demo" className="px-6 py-40 max-w-7xl mx-auto border-t border-white/5 bg-white/[0.01]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="text-white animate-pulse" />
              <h2 className="text-3xl font-bold tracking-tight text-white">Protocol Engine</h2>
            </div>
            <div className={`text-[10px] font-mono font-bold tracking-widest ${getStatusColor()}`}>
              {syncState}
            </div>
          </div>
          <p className="text-white/40 leading-relaxed text-lg font-light">
            Behind the CMAMeet UI is the <strong>ETP Synchronization Layer</strong>. This demo allows you to trigger authoritative mutations and observe real-time delta propagation across multiple transport bindings.
          </p>

          {/* Transport Selection */}
          <div className="flex p-1 bg-white/5 border etp-border rounded-lg">
            <button 
              onClick={() => { setTransport('sse'); etpClientRef.current?.disconnect(); }}
              className={`flex-1 py-2 text-xs font-bold rounded transition-all ${transport === 'sse' ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'}`}
            >
              SSE Binding
            </button>
            <button 
              onClick={() => { setTransport('ws'); etpClientRef.current?.disconnect(); }}
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
                <div className="p-8 rounded-2xl border-2 border-orange-500/10 bg-orange-500/5">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex flex-col">
                         <p className="mono-label text-orange-500 font-bold">ETP Subscriber</p>
                         {nodeCapabilities?.identity && (
                            <span className="text-[8px] font-mono text-white/30 uppercase">NODE.ID: {nodeCapabilities.identity.node_id}</span>
                         )}
                      </div>
                      {event && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_green]" />}
                   </div>
                   {event ? (
                     <motion.div 
                        key={event.v}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                     >
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                             <span className={`text-[9px] px-1.5 py-0.5 rounded ${event.lifecycle === 'cancelled' ? 'bg-red-500' : 'bg-green-500'} text-white font-bold`}>{event.lifecycle.toUpperCase()}</span>
                             <span className="text-[10px] font-mono text-white/40">v{event.v}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/20 rounded-full border border-white/5">
                             <Check size={10} className={verificationState === 'UNVERIFIED' ? 'text-red-500' : 'text-green-500'} />
                             <span className={`text-[8px] font-mono font-bold uppercase tracking-tight ${verificationState === 'UNVERIFIED' ? 'text-red-500' : 'text-green-500'}`}>{verificationState}</span>
                          </div>
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
                </div>
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
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-blue-400">frame: {d.type}</span>
                      <span className={`text-[7px] font-mono px-1 rounded ${d.signature ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {d.signature ? 'SIGNED' : 'UNSIGNED'}
                      </span>
                    </div>
                    <span className="text-white/60 block truncate font-mono text-[8px]">{JSON.stringify(d)}</span>
                  </motion.div>
                ))}
                {streamData.length === 0 && <div className="text-center py-8 opacity-20 uppercase tracking-widest">No Active Subscription</div>}
             </div>
          </div>

          {/* Interop & Downgrade Visualization */}
          <div className="p-8 rounded-2xl border etp-border bg-black/40">
             <div className="flex items-center gap-2 mb-8">
                <Globe size={18} className="text-blue-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">Interoperability Bridge</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <p className="mono-label text-white/40">ETP Canonical State</p>
                   <div className="p-4 bg-orange-500/5 border-l-2 border-orange-500 rounded-r">
                      <p className="text-[10px] font-bold text-orange-500 mb-1 tracking-widest uppercase">High Fidelity</p>
                      <ul className="space-y-2">
                         {['Real-time Streams', 'Authoritative Signatures', 'Durable Replay', 'Rich Lifecycle'].map(f => (
                           <li key={f} className="text-[10px] text-white/60 flex items-center gap-2">
                              <Check size={10} className="text-green-500" /> {f}
                           </li>
                         ))}
                      </ul>
                   </div>
                </div>

                <div className="space-y-4">
                   <p className="mono-label text-white/40">Legacy Interop (ICS/CalDAV)</p>
                   <div className="p-4 bg-red-500/5 border-l-2 border-red-500/30 rounded-r opacity-60">
                      <p className="text-[10px] font-bold text-red-400/60 mb-1 tracking-widest uppercase">Semantic Downgrade</p>
                      <ul className="space-y-2">
                         {['Periodic Polling', 'Unverified State', 'Static Snapshots', 'Flattened Metadata'].map(f => (
                           <li key={f} className="text-[10px] text-white/40 flex items-center gap-2">
                              <span className="text-red-500/50">×</span> {f}
                           </li>
                         ))}
                      </ul>
                   </div>
                </div>
             </div>

             <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] mono-label">Bridged Metadata Confidence</span>
                   <span className="text-[10px] font-mono text-orange-500">42% (Degraded)</span>
                </div>
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full w-[42%] bg-orange-500/50" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Hero & Main App ---

const Hero = () => (
  <section className="px-6 py-48 flex flex-col items-center text-center max-w-7xl mx-auto relative overflow-hidden">
    {/* Subtle Minimalist Accents */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-white/20 to-transparent" />
    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px] -z-10" />

    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-3 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-12 shadow-xl"
    >
      <Zap size={10} className="text-white fill-white" />
      Reference Implementation v0.1
    </motion.div>

    <motion.h2 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="text-7xl md:text-9xl font-bold tracking-tighter mb-10 leading-[0.85] text-white"
    >
      Meetings change. <br />
      <span className="opacity-20 italic">Static invites don't.</span>
    </motion.h2>

    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="text-xl md:text-3xl text-white/40 mb-16 max-w-3xl font-light leading-snug tracking-tight"
    >
      Events should behave like live state, not static attachments. ETP is an open protocol for authoritative event-state synchronization across the internet.
    </motion.p>

    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex flex-wrap items-center justify-center gap-6"
    >
      <button 
        onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-10 py-5 bg-white text-black font-bold rounded-full flex items-center gap-3 hover:bg-white/90 transition-all hover:scale-105 active:scale-95 cursor-pointer text-lg shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
      >
        Explore the Protocol <ArrowRight size={20} />
      </button>
      <button 
        onClick={() => document.getElementById('ref-impl')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-10 py-5 bg-black/40 border border-white/10 rounded-full font-bold hover:bg-white/5 transition-all text-lg text-white"
      >
        View Reference App
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
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black font-sans pt-16">
      <Header />
      <Hero />
      <ProblemSolutionSection />
      <CMAMeetReferenceSection />
      <ComparisonSection />
      <LiveMutationDemo />
      <section className="px-6 py-40 border-t border-white/5 flex flex-col items-center">
         <span className="text-[10px] font-mono opacity-20 uppercase tracking-[0.4em] mb-8">Standardization</span>
         <h2 className="text-3xl font-bold tracking-tight text-center max-w-2xl opacity-80 leading-snug">
           ETP is an open, community-driven project dedicated to building synchronization plumbing for the modern web.
         </h2>
      </section>
      <footer className="px-6 py-20 border-t border-white/5 text-center text-white/30 text-xs font-mono">
        <p>&copy; 2026 ETP FOUNDATION // CMAMEET_REFERENCE_NODE</p>
      </footer>
    </div>
  );
}
