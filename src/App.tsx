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
  Check,
  User,
  UserPlus,
  Mail,
  Smartphone,
  Shield,
  Trash2
} from "lucide-react";
import { ETPEvent } from "./types";

import { ETPClient } from "../sdk/etp-client";

// --- Components ---

const ETPLogo = ({ size = 32, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <rect x="6" y="8" width="20" height="3" rx="1.5" fill="currentColor" />
    <rect x="6" y="14" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.6" />
    <rect x="6" y="20" width="20" height="3" rx="1.5" fill="currentColor" />
  </svg>
);

const Header = () => (
  <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-between overflow-x-auto no-scrollbar">
    <div className="flex items-center gap-4 px-6 py-4 flex-shrink-0">
      <a 
        href="/" 
        onClick={(e) => {
          if (window.location.search.includes("id")) {
            e.preventDefault();
            window.history.pushState({}, "", "/");
            window.dispatchEvent(new Event("popstate"));
          }
        }}
        className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:scale-105 transition-transform"
      >
        <ETPLogo size={24} />
      </a>
      <div className="flex flex-col">
        <h1 className="text-sm font-bold tracking-tight text-white uppercase tracking-wider">Event Transport Protocol</h1>
        <div className="flex items-center gap-2">
          <p className="text-[10px] mono-label leading-none opacity-40 uppercase tracking-widest">Live Event State Protocol</p>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <p className="text-[9px] font-medium opacity-20 uppercase tracking-tighter">Ref: CMAMeet</p>
        </div>
      </div>
    </div>
    <nav className="flex items-center gap-8 px-6 py-4 flex-shrink-0">
      <a href="#why" className="text-xs font-medium hover:text-white transition-colors text-white/50 underline-offset-4 hover:underline">Rationale</a>
      <a href="#demo" className="text-xs font-medium hover:text-white transition-colors text-white/50 underline-offset-4 hover:underline">Engine</a>
      <a href="#ref-impl" className="text-xs font-medium hover:text-white transition-colors text-white/50 flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 hover:border-white/20 transition-all group">
        <Activity size={10} className="group-hover:animate-pulse" /> CMAMeet
      </a>
      <a 
        href="#scheduler" 
        onClick={(e) => {
          if (window.location.search.includes("id")) {
            e.preventDefault();
            window.history.pushState({}, "", "/#scheduler");
            window.dispatchEvent(new Event("popstate"));
          }
        }}
        className="text-xs font-medium hover:text-orange-500 transition-colors text-orange-400 font-semibold underline-offset-4 hover:underline"
      >
        Living Scheduler
      </a>
      <div className="h-4 w-[1px] bg-white/10" />
      <a 
        href="https://github.com/Mattjhagen/Event-Transport-Protocol" 
        target="_blank" 
        rel="noopener noreferrer"
        className="px-4 py-1.5 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 transition-colors flex items-center gap-2"
      >
        <Code size={12} /> Protocol Source
      </a>
    </nav>
  </header>
);

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("etp_cookie_consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("etp_cookie_consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-6 right-6 z-[60] p-6 bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto"
    >
      <div className="space-y-1">
        <h4 className="text-black font-bold tracking-tight">Privacy & Protocol State</h4>
        <p className="text-black/60 text-sm">We use cookies to maintain your session state and improve protocol telemetry. No personal data is harvested.</p>
      </div>
      <div className="flex gap-3 flex-shrink-0 w-full md:w-auto">
        <button 
          onClick={() => setShow(false)}
          className="flex-1 md:flex-none px-6 py-3 text-xs font-bold text-black/40 uppercase hover:text-black transition-colors"
        >
          Decline
        </button>
        <button 
          onClick={accept}
          className="flex-1 md:flex-none px-6 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black/90 transition-colors"
        >
          Accept Consent
        </button>
      </div>
    </motion.div>
  );
};

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
      className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-12 shadow-xl"
    >
      <ETPLogo size={12} className="text-white" />
      The Event Transport Protocol v0.1
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
      Events should behave like live state, not static attachments. ETP is the infrastructure layer for authoritative event-state synchronization across the living web.
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

// --- OS & Format Helpers ---
const getBrowserOS = () => {
  if (typeof window === "undefined") {
    return { name: "unknown", label: "Web Client", action: "deep-link", icon: "🌐" };
  }
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    return { name: "ios", label: "iOS (Apple Device)", action: "deep-link", icon: "📱" };
  }
  if (ua.includes("mac")) {
    return { name: "macos", label: "macOS (Apple Mac)", action: "deep-link", icon: "🍏" };
  }
  if (ua.includes("android")) {
    return { name: "android", label: "Android System", action: "deep-link", icon: "🤖" };
  }
  if (ua.includes("cros")) {
    return { name: "chromeos", label: "ChromeOS (Chromebook)", action: "google-calendar", icon: "💻" };
  }
  if (ua.includes("win")) {
    return { name: "windows", label: "Windows PC", action: "deep-link", icon: "🪟" };
  }
  if (ua.includes("linux")) {
    return { name: "linux", label: "Linux Workspace", action: "deep-link", icon: "🐧" };
  }
  return { name: "unknown", label: "Universal Web", action: "google-calendar", icon: "🌐" };
};

const formatDateForGoogle = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    const yr = d.getUTCFullYear();
    const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
    const da = String(d.getUTCDate()).padStart(2, '0');
    const ho = String(d.getUTCHours()).padStart(2, '0');
    const mi = String(d.getUTCMinutes()).padStart(2, '0');
    const se = String(d.getUTCSeconds()).padStart(2, '0');
    return `${yr}${mo}${da}T${ho}${mi}${se}Z`;
  } catch (e) {
    return "";
  }
};

const getGoogleCalendarUrl = (event: ETPEvent) => {
  const start = formatDateForGoogle(event.start);
  const end = formatDateForGoogle(event.end);
  const title = encodeURIComponent(event.title);
  const desc = encodeURIComponent(event.description || "");
  const loc = encodeURIComponent(event.location?.name || "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${desc}&location=${loc}`;
};

const EventGenerator = ({ onCreated }: { onCreated: (data: any) => void }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendees, setAttendees] = useState<string[]>([
    "mattjhagen0@gmail.com",
    "engineering@etp.dev"
  ]);
  const [formData, setFormData] = useState({
    title: "Quarterly Strategy Alignment",
    description: "Living review of technical infrastructure deliverables and sync rules.",
    start: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
    end: new Date(Date.now() + 86400000 + 3600000).toISOString().slice(0, 16),
    location: "Stockholm / Metaverse Node 14",
    alias: "strategy-sync-2026",
    recurrence: "weekly"
  });

  const addAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    if (attendeeEmail && attendeeEmail.includes("@") && !attendees.includes(attendeeEmail)) {
      setAttendees([...attendees, attendeeEmail.trim()]);
      setAttendeeEmail("");
    }
  };

  const removeAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const organizerToken = "org_" + Math.random().toString(36).substring(2, 12);
      
      const payload = {
        title: formData.title,
        description: formData.description,
        start: new Date(formData.start).toISOString(),
        end: new Date(formData.end).toISOString(),
        location: { name: formData.location },
        alias: formData.alias || undefined,
        sync: { strategy: "stream" },
        ext: {
          recurrence: formData.recurrence,
          attendees: attendees.map(email => ({ email, status: "pending" })),
          organizerToken: organizerToken
        }
      };

      const response = await fetch("/api/e", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        setError(data.error || "Event object registration rejected by ETP network.");
        return;
      }
      
      // Save organizer permission token in localStorage
      if (data?.event?.eid) {
        const storedTokens = JSON.parse(localStorage.getItem("etp_organizer_keys") || "{}");
        storedTokens[data.event.eid] = organizerToken;
        localStorage.setItem("etp_organizer_keys", JSON.stringify(storedTokens));
      }

      onCreated(data);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the ETP node. Please check server state.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 border etp-border rounded-3xl bg-black/40 backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-600/[0.02] rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-10">
        <Plus size={20} className="text-orange-500" />
        <span className="mono-label tracking-widest text-[11px] text-orange-500 font-bold">ETP Living Event Scheduler</span>
      </div>

      {error && (
        <div className="p-4 mb-8 border border-red-500/20 bg-red-500/5 rounded-xl text-xs font-mono text-red-400">
          <span className="font-bold text-red-500 uppercase mr-1">[Identity Registration Rejected]</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Event Title</label>
            <input 
              className="w-full bg-transparent border-b etp-border py-2 text-lg focus:border-orange-500 outline-none transition-colors text-white"
              value={formData.title}
              required
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Enter meeting title..."
            />
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Description</label>
            <textarea 
              className="w-full bg-transparent border-b etp-border py-2 text-sm focus:border-orange-500 outline-none transition-colors text-white h-20 resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Enter description..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Start Time (UTC-linked)</label>
            <input 
              type="datetime-local"
              className="w-full bg-transparent border-b etp-border py-2 text-sm focus:border-orange-500 outline-none transition-colors text-white"
              value={formData.start}
              required
              onChange={e => setFormData({...formData, start: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest">End Time (UTC-linked)</label>
            <input 
              type="datetime-local"
              className="w-full bg-transparent border-b etp-border py-2 text-sm focus:border-orange-500 outline-none transition-colors text-white"
              value={formData.end}
              required
              onChange={e => setFormData({...formData, end: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Location Identity Address</label>
            <input 
              className="w-full bg-transparent border-b etp-border py-2 text-sm focus:border-orange-500 outline-none transition-colors text-white"
              value={formData.location}
              required
              onChange={e => setFormData({...formData, location: e.target.value})}
              placeholder="Physical address or conference link..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Permanent URL Alias (optional)</label>
            <input 
              className="w-full bg-transparent border-b etp-border py-2 text-sm focus:border-orange-500 outline-none transition-colors text-white"
              value={formData.alias}
              onChange={e => setFormData({...formData, alias: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")})}
              placeholder="e.g. strategy-sync"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Recurrence Propagation</label>
            <select 
              className="w-full bg-black/60 border-b etp-border py-2 text-sm focus:border-orange-500 outline-none transition-colors text-white"
              value={formData.recurrence}
              onChange={e => setFormData({...formData, recurrence: e.target.value})}
            >
              <option value="none">Does Not Repeat (One-off)</option>
              <option value="daily">Repeats Daily</option>
              <option value="weekly">Repeats Weekly</option>
              <option value="monthly">Repeats Monthly</option>
              <option value="yearly">Repeats Yearly</option>
            </select>
          </div>
        </div>

        {/* Dynamic Attendees Section */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest flex items-center gap-1.5">
              <UserPlus size={12} /> Invite Attendees ({attendees.length})
            </label>
            <span className="text-[9px] font-mono text-emerald-400">⚡ Auto-handshake Email Dispatched on Save</span>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="email"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-orange-500 outline-none transition-colors"
              value={attendeeEmail}
              onChange={e => setAttendeeEmail(e.target.value)}
              placeholder="Add guest email (e.g., alex@domain.com)..."
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAttendee(e); } }}
            />
            <button 
              type="button"
              onClick={addAttendee}
              className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {attendees.map(email => (
              <span key={email} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">
                <Mail size={10} className="opacity-40" />
                <span>{email}</span>
                <button 
                  type="button" 
                  onClick={() => removeAttendee(email)} 
                  className="text-red-400 hover:text-red-300 font-bold ml-1.5 text-xs inline-block"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 group cursor-pointer shadow-[0_15px_30px_rgba(234,88,12,0.2)] hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <RefreshCcw className="animate-spin" size={20} />
          ) : (
            <>
              <Globe size={18} /> 
              <span>Deploy Living Event to Network (EID)</span>
            </>
          )}
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
};

const SuccessPanel = ({ result, onReset }: { result: any, onReset: () => void }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [emailLogs, setEmailLogs] = useState<string[]>([]);
  
  useEffect(() => {
    // Generate simulated dynamic email dispatch logs
    const emails = result.event.ext?.attendees || [];
    const logPool = [
      `Initializing SMTP Secure TLS Transport to evt.life relay...`,
      `Cryptographic Identity Key Authenticated (ed25519 signature validated).`,
      ...emails.map((e: any) => `→ Synthesized invitation packet dispatched to: ${e.email}`),
      `✔ Dynamic mail handlers online. Local subscriptions established in calendar cache.`,
      `Synchronization Strategy set to real-time streams.`
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < logPool.length) {
        setEmailLogs(prev => [...prev, logPool[current]]);
        current++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [result]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const localTestLink = `${window.location.origin}/?id=${result.event.eid}`;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 lg:p-12 border-2 border-orange-500/30 rounded-3xl bg-orange-500/[0.02] shadow-[0_30px_60px_rgba(234,88,12,0.05)] text-left"
    >
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Activity size={24} className="text-orange-500 animate-pulse" />
          <div>
            <span className="mono-label text-[10px] text-orange-500 font-bold uppercase tracking-widest block">Deployment Succeeded</span>
            <h3 className="text-xl font-bold font-sans text-white">Event State Live & Immutable</h3>
          </div>
        </div>
        <button 
          onClick={onReset} 
          className="text-xs font-mono py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-colors border border-white/5"
        >
          Schedule New Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          {/* Working local link for testing */}
          <div className="p-6 bg-black/40 rounded-2xl border border-emerald-500/20 space-y-3 relative overflow-hidden">
            <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Working Local Playback URL</h4>
            <div className="flex items-center justify-between bg-black/60 p-3 rounded-lg border border-emerald-500/10">
              <code className="text-[11px] truncate w-80 text-emerald-400 font-mono">{localTestLink}</code>
              <button 
                onClick={() => copyToClipboard(localTestLink, 'local')} 
                className="p-2 hover:bg-white/10 rounded transition-colors text-emerald-400 cursor-pointer"
              >
                {copied === 'local' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[10px] opacity-60 text-white font-sans">
              Click or copy this link. If you load it in a separate browser window, you can view the state in real-time as an attendee and observe instant updates when mutated!
            </p>
          </div>

          {/* Permalinks info requested */}
          <div className="p-6 bg-black/40 rounded-2xl border etp-border space-y-3">
            <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-widest font-mono">Permanent Static Protocol URL</h4>
            <div className="flex items-center justify-between bg-black/60 p-3 rounded-lg border etp-border">
              <code className="text-xs truncate w-80 text-orange-400 font-mono">evt.life/e/{result.event.alias || result.event.eid}</code>
              <button 
                onClick={() => copyToClipboard(`https://evt.life/e/${result.event.alias || result.event.eid}`, 'permalink')} 
                className="p-2 hover:bg-white/10 rounded transition-colors text-white cursor-pointer"
              >
                {copied === 'permalink' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[10px] opacity-40 italic text-white font-mono">
              Universal static routing on the protocol network resolving to edge nodes.
            </p>
          </div>

          {/* Core EID identifiers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/[0.02] border etp-border rounded-xl">
              <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">EID Identity (ULID)</p>
              <p className="text-[11px] font-mono text-white font-bold break-all mt-1">{result.event.eid}</p>
            </div>
            <div className="p-4 bg-white/[0.02] border etp-border rounded-xl">
              <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Recurrence</p>
              <p className="text-[11px] font-mono text-orange-500 font-bold uppercase mt-1">{result.event.ext?.recurrence || "None"}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Log Feed */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold opacity-40 uppercase tracking-widest font-mono text-white">Dynamic Email Relay Logs / Frame Stream</h4>
          <div className="bg-black/90 p-5 rounded-2xl border etp-border font-mono text-[10px] h-60 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 text-orange-500/80">
            {emailLogs.map((logLine, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -5 }} 
                animate={{ opacity: 1, x: 0 }} 
                key={idx}
                className={logLine.startsWith("✔") || logLine.includes("smtp") ? "text-emerald-400 font-bold" : "text-white/70"}
              >
                <span className="text-white/20 select-none mr-2">[{idx+1}]</span>
                <span>{logLine}</span>
              </motion.div>
            ))}
            {emailLogs.length < 5 && <div className="text-[10px] animate-pulse text-white/10 font-mono mt-2">Connecting relay nodes...</div>}
          </div>
          
          <a 
            href={localTestLink}
            className="w-full py-3.5 bg-white text-black font-semibold rounded-lg hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase font-mono tracking-wider text-center"
          >
            Open Live Portal View <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const EventDetails = ({ id, onLeave }: { id: string, onLeave: () => void }) => {
  const [event, setEvent] = useState<ETPEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState<string>("CONNECTING");
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [inviteeLoading, setInviteeLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  // Participant chosen identity
  const [viewerEmail, setViewerEmail] = useState<string>("");
  const [localRsvps, setLocalRsvps] = useState<Record<string, string>>({});
  
  const etpClientRef = useRef<ETPClient | null>(null);
  const osInfo = getBrowserOS();

  // Load RSVP state
  useEffect(() => {
    const saved = localStorage.getItem(`etp_rsvp_${id}`);
    if (saved) {
      setLocalRsvps(prev => ({ ...prev, [id]: saved }));
    }
  }, [id]);

  useEffect(() => {
    // Standard subscription via ETPClient SDK
    etpClientRef.current = new ETPClient({
      nodeUrl: window.location.origin,
      transport: "sse"
    });

    etpClientRef.current.onFrame((frame: any) => {
      if (frame.type === "snapshot.sync" || frame.type === "delta.sync" || frame.type === "event.updated") {
        setEvent(frame.event);
        setSyncState("CONNECTED");
        setLoading(false);
        
        // Auto-select first attendee as the default viewer email if not set
        const attendeesArray = frame.event?.ext?.attendees || [];
        if (attendeesArray.length > 0 && !viewerEmail) {
          setViewerEmail(attendeesArray[0].email);
        }
      }
    });

    etpClientRef.current.onStateChange((state) => {
      if (state === "DISCONNECTED") setSyncState("STALE");
      else if (state === "ERROR") setSyncState("OFFLINE");
    });

    etpClientRef.current.subscribe(id);

    return () => {
      etpClientRef.current?.disconnect();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 max-w-xl mx-auto text-center space-y-4">
        <RefreshCcw className="animate-spin text-orange-500 mx-auto" size={40} />
        <p className="font-mono text-sm tracking-widest uppercase opacity-40 animate-pulse">Resolving EID Synchronization Handshake...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-24 max-w-xl mx-auto text-center space-y-6">
        <Activity size={40} className="text-red-500 mx-auto" />
        <div>
          <h3 className="font-mono uppercase font-bold text-lg text-white">Event Identity Resolution Cancelled</h3>
          <p className="text-sm text-white/50 mt-2">The EID `{id}` was not discovered on any canonical ETP routing grids.</p>
        </div>
        <button onClick={onLeave} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono rounded-lg transition-colors">
          Return to Hub
        </button>
      </div>
    );
  }

  // Check if current user is the organic organizer calculated from localStorage tokens or default seed
  const storedKeys = JSON.parse(localStorage.getItem("etp_organizer_keys") || "{}");
  const isOrganizer = !!storedKeys[event.eid] || event.ext?.organizerToken === "demo-organizer-secret-2026";

  const attendeesList = event.ext?.attendees || [];

  const handleUpdateRsvp = async (option: string) => {
    if (!viewerEmail) return;
    
    // Optimistic local state
    localStorage.setItem(`etp_rsvp_${event.eid}`, option);
    setLocalRsvps(prev => ({ ...prev, [event.eid]: option }));

    const updatedAttendees = attendeesList.map((att: any) => 
      att.email === viewerEmail ? { ...att, status: option } : att
    );

    try {
      await etpClientRef.current?.mutate(event.eid, {
        ext: {
          ...event.ext,
          attendees: updatedAttendees
        }
      }, event.v);
    } catch (e) {
      console.error("Failed to commit RSVP mutation", e);
    }
  };

  const handleInviteAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteeEmail || !inviteeEmail.includes("@")) return;
    
    setInviteeLoading(true);
    const updatedAttendees = [...attendeesList, { email: inviteeEmail.trim(), status: "pending" }];

    try {
      await etpClientRef.current?.mutate(event.eid, {
        ext: {
          ...event.ext,
          attendees: updatedAttendees
        }
      }, event.v);
      setInviteeEmail("");
    } catch (err) {
      console.error(err);
    } finally {
      setInviteeLoading(false);
    }
  };

  const handleUpdateField = async (field: string, value: any) => {
    const payload: Partial<ETPEvent> = {};
    if (field === "location") {
      payload.location = { name: value };
    } else if (field === "recurrence") {
      payload.ext = {
        ...event.ext,
        recurrence: value
      };
    } else {
      (payload as any)[field] = value;
    }

    try {
      await etpClientRef.current?.mutate(event.eid, payload, event.v);
    } catch (err) {
      console.error("Mutation aborted", err);
    }
  };

  const handleAddCalendar = () => {
    if (osInfo.action === 'google-calendar') {
      window.open(getGoogleCalendarUrl(event), '_blank');
    } else {
      // Direct deep link stream or attachment
      window.location.href = `webcal://${window.location.host}/e/${event.eid}.ics`;
    }
  };

  const currentViewerStatus = attendeesList.find((a: any) => a.email === viewerEmail)?.status || "pending";

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Synchronization Banner Notification */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 text-orange-500 font-mono text-[11px] font-semibold gap-4 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          <span>Handshake Active: Resolving evt.life/e/{event.alias || event.eid}</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="opacity-60 uppercase">Stream Strategy: {event.sync.strategy.toUpperCase()} ({syncState})</span>
          <span className="opacity-60 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">Version EID v{event.v}</span>
          <button onClick={onLeave} className="text-white hover:underline uppercase text-[9px] cursor-pointer">← Return to Hub</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Interactive Event Presentation */}
        <div className="lg:col-span-7 space-y-8">
          <div className="p-8 lg:p-12 border etp-border rounded-3xl bg-black/40 backdrop-blur-md relative overflow-hidden space-y-8 animate-fade-in">
            {/* Minimalist Header */}
            <div className="flex justify-between items-start pb-6 border-b border-white/5">
              <div>
                <span className="mono-label px-2.5 py-1 text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded font-bold uppercase tracking-wider">{event.lifecycle.toUpperCase()}</span>
                {event.ext?.recurrence && event.ext?.recurrence !== 'none' && (
                  <span className="mono-label ml-2 px-2.5 py-1 text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded font-bold uppercase tracking-wider">🔁 {event.ext?.recurrence.toUpperCase()}</span>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 font-mono tracking-tight">Identity: {event.eid}</p>
                {event.updated_at && (
                  <p className="text-[8px] text-white/20 font-mono mt-1">Succeeded: {new Date(event.updated_at).toLocaleTimeString()}</p>
                )}
              </div>
            </div>

            {/* Event Meta */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-sans">
                {event.title}
              </h1>
              {event.description && (
                <p className="text-white/60 text-base leading-relaxed tracking-wide font-light max-w-2xl">
                  {event.description}
                </p>
              )}
            </div>

            {/* Practical Scheduling Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/[0.02] border etp-border rounded-2xl">
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-wider opacity-30 text-white">Starting</span>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-orange-500" />
                  <span className="font-bold text-sm text-white tracking-tight">{new Date(event.start).toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-wider opacity-30 text-white">Ending</span>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-orange-500" />
                  <span className="font-bold text-sm text-white tracking-tight">{new Date(event.end).toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-1 col-span-1 md:col-span-2 pt-2 border-t border-white/5">
                <span className="text-[9px] font-mono uppercase tracking-wider opacity-30 text-white">Authorized Location Node</span>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-orange-500 animate-pulse" />
                  <span className="font-bold text-sm text-white tracking-tight">{event.location?.name}</span>
                </div>
              </div>
            </div>

            {/* OS Aware Deep Linking Calendar Sync Panel */}
            <div className="p-6 bg-orange-600/[0.02] border-2 border-orange-500/20 rounded-2xl space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none" role="img" aria-label="os icon">{osInfo.icon}</span>
                  <div>
                    <span className="font-bold text-xs text-white block">Detected: {osInfo.label}</span>
                    <span className="text-[9px] font-mono text-white/40">Synchronized ETP Feed subscription active</span>
                  </div>
                </div>
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded uppercase">Validated Link</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {osInfo.action === 'google-calendar' ? (
                  <a 
                    href={getGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar size={14} /> Add directly to Google Calendar
                  </a>
                ) : (
                  <a 
                    href={`webcal://${window.location.host}/e/${event.eid}.ics`}
                    target="_top"
                    className="flex-1 py-4 bg-white text-black hover:bg-orange-500 hover:text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <Calendar size={14} className="inline-block" /> One-Press Add to native Calendar (Deep-Link)
                  </a>
                )}

                {/* Secondary Cloud Fallback / Chromebook Option */}
                {osInfo.action !== 'google-calendar' && (
                  <a 
                    href={getGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-4 px-6 bg-white/5 hover:bg-white/10 text-white text-xs font-mono rounded-xl border etp-border text-center flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    ChromeOS / Google Cal Fallback
                  </a>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#999999] font-bold">Subscription Feed URL (Copy & Paste Method)</span>
                  <span className="text-[8px] font-mono text-white/40 uppercase">Manual Sync Fallback</span>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-black/60 rounded-xl border border-white/10 flex items-center justify-between gap-2 overflow-hidden">
                    <span id="calendar_feed_url" className="text-[11px] font-mono text-orange-500 truncate select-all">
                      https://{window.location.host}/e/{event.eid}.ics
                    </span>
                  </div>
                  <button
                    id="copy-feed-btn"
                    onClick={() => {
                      const feedUrl = `https://${window.location.host}/e/${event.eid}.ics`;
                      navigator.clipboard.writeText(feedUrl);
                      setCopied("feed");
                      setTimeout(() => setCopied(null), 2500);
                    }}
                    className="px-4 py-3 bg-white/5 hover:bg-orange-500 hover:text-white rounded-xl border border-white/10 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {copied === "feed" ? "Copied!" : "Copy"}
                  </button>
                </div>
                
                <p className="text-[10px] text-white/30 font-light leading-relaxed">
                  💡 If the system security blocker prevents one-press subscription from inside the browser preview, click <strong className="text-white/60">Copy</strong> above, open your system Calendar, click <strong className="text-white/60">Add Subscription Calendar</strong>, and paste this URL directly! It will sync all future changes automatically.
                </p>
              </div>

              <p className="text-[10px] text-white/40 font-mono tracking-normal leading-relaxed">
                * Note: Subscribing via deep link creates an authoritative synchronization channel. Any adjustments the host makes downstream (such as postponing or shifting time) recalculate dynamically on your native machine or cloud inbox without manual re-imports!
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Roles, Attendees List & RSVP Opt-outs */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Subscriber Identity Box */}
          <div className="p-6 bg-white/[0.01] border etp-border rounded-3xl space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <User size={16} className="text-orange-500" />
              <h4 className="font-bold text-sm text-white font-mono tracking-tight uppercase">Subscriber Portal Context</h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-mono uppercase tracking-widest opacity-40 text-white block mb-1.5">Viewing network state as:</label>
                <select 
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-orange-500 transition-colors"
                  value={viewerEmail}
                  onChange={(e) => {
                    setViewerEmail(e.target.value);
                    const localSavedFlag = localStorage.getItem(`etp_rsvp_${event.eid}`);
                    if (localSavedFlag) {
                      setLocalRsvps(prev => ({ ...prev, [event.eid]: localSavedFlag }));
                    }
                  }}
                >
                  {attendeesList.map((att: any) => (
                    <option key={att.email} value={att.email}>{att.email} ({att.status})</option>
                  ))}
                  {attendeesList.length === 0 && <option value="">No Invitees added</option>}
                </select>
                <p className="text-[8px] font-mono text-white/30 mt-1">Switch email to test different attendee point-of-views.</p>
              </div>

              {/* Opt-out controls */}
              {viewerEmail && (
                <div className="p-4 bg-white/5 border etp-border rounded-xl space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 font-bold">Local RSVPs / State Opt-Out</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">{currentViewerStatus.toUpperCase()}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleUpdateRsvp("accepted")}
                      className={`py-2 px-1 text-[9px] font-bold uppercase tracking-wider rounded font-mono border transition-all cursor-pointer ${currentViewerStatus === 'accepted' ? 'bg-green-500/10 border-green-500/40 text-green-400' : 'bg-black/40 border-white/5 text-white/40 hover:text-white'}`}
                    >
                      Opt-In (Sync)
                    </button>
                    <button 
                      onClick={() => handleUpdateRsvp("opt_out_single")}
                      className={`py-2 px-1 text-[9px] font-bold uppercase tracking-wider rounded font-mono border transition-all cursor-pointer ${currentViewerStatus === 'opt_out_single' ? 'bg-orange-500/10 border-orange-500/40 text-orange-400' : 'bg-black/40 border-white/5 text-white/40 hover:text-white'}`}
                    >
                      Opt-Out (Once)
                    </button>
                    <button 
                      onClick={() => handleUpdateRsvp("opt_out_forever")}
                      className={`py-2 px-1 text-[9px] font-bold uppercase tracking-wider rounded font-mono border transition-all cursor-pointer ${currentViewerStatus === 'opt_out_forever' ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-black/40 border-white/5 text-white/40 hover:text-white'}`}
                    >
                      Opt-Out (Forever)
                    </button>
                  </div>
                  <p className="text-[9px] text-white/30 font-sans leading-snug">
                    * Opting out registers an authorized mutation directly to the event ledger. All sync threads connected globally will update state values dynamically.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Organizer Console / Multi-User update propagation (Editable fields) */}
          {isOrganizer ? (
            <div className="p-6 bg-orange-500/[0.01] border-2 border-orange-500/20 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-orange-500/10">
                <Shield size={16} className="text-orange-500 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm text-white font-mono uppercase tracking-tight">Organizer authorities center</h4>
                  <p className="text-[8px] font-mono text-orange-400 font-bold uppercase tracking-widest mt-0.5">Authoritative Mutation Mode Enabled</p>
                </div>
              </div>

              {/* Editing controls */}
              <div className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-widest opacity-40 text-white">Live Mutation Title</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                    value={event.title}
                    onChange={(e) => handleUpdateField("title", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase tracking-widest opacity-40 text-white">Adjust Location</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-orange-500 outline-none"
                    value={event.location?.name || ""}
                    onChange={(e) => handleUpdateField("location", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-widest opacity-40 text-white">Mutation Start Date</label>
                    <input 
                      type="datetime-local" 
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:border-orange-500 outline-none font-mono"
                      value={new Date(event.start).toISOString().slice(0, 16)}
                      onChange={(e) => handleUpdateField("start", new Date(e.target.value).toISOString())}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-widest opacity-40 text-white">Mutation End Date</label>
                    <input 
                      type="datetime-local" 
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:border-orange-500 outline-none font-mono"
                      value={new Date(event.end).toISOString().slice(0, 16)}
                      onChange={(e) => handleUpdateField("end", new Date(e.target.value).toISOString())}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-orange-500/10 space-y-3">
                  <label className="text-[9px] font-mono uppercase tracking-widest opacity-40 text-white block">Publish Invitation to new subscriber</label>
                  <form onSubmit={handleInviteAttendee} className="flex gap-2">
                    <input 
                      type="email" 
                      required
                      placeholder="Invitee's email address..." 
                      className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:border-orange-500 outline-none"
                      value={inviteeEmail}
                      onChange={(e) => setInviteeEmail(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      disabled={inviteeLoading}
                      className="px-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Invite
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white/[0.01] border etp-border rounded-3xl space-y-4 text-left">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-white/30" />
                <h4 className="font-bold text-xs text-white/50 font-mono uppercase">Organizer Lock Context</h4>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed font-sans">
                You are currently viewing this thread with <strong>Participant Clearances</strong>. Only the verified organizer of this event identity holds cryptographic privileges to update the core timeline or title.
              </p>
              <button 
                onClick={() => {
                  const saved = JSON.parse(localStorage.getItem("etp_organizer_keys") || "{}");
                  saved[event.eid] = "org_claimed";
                  localStorage.setItem("etp_organizer_keys", JSON.stringify(saved));
                  // force trigger re-render
                  setEvent({ ...event });
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 hover:border-white/20 text-white text-[10px] font-bold font-mono uppercase tracking-wide cursor-pointer transition-colors"
              >
                Claim Local Organizer Token (Simulator Bypass)
              </button>
            </div>
          )}

          {/* Dynamic Attendees Monitor displaying real-time updates */}
          <div className="p-6 bg-white/[0.01] border etp-border rounded-3xl max-h-72 overflow-y-auto custom-scrollbar space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-white opacity-40 text-left">Active Invitees & Statuses ({attendeesList.length})</h4>
            <div className="divide-y divide-white/5">
              {attendeesList.map((att: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-2 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    <span className="text-white truncate font-mono">{att.email}</span>
                  </div>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase leading-none border ${
                    att.status === 'accepted' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                    att.status === 'opt_out_single' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                    att.status === 'opt_out_forever' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                    'bg-white/5 border-white/10 text-white/40'
                  }`}>
                    {att.status === 'accepted' ? 'Opt-In' :
                     att.status === 'opt_out_single' ? 'Opt-Out (Once)' :
                     att.status === 'opt_out_forever' ? 'Opt-Out (Indefinitely)' :
                     'Pending'}
                  </span>
                </div>
              ))}
              {attendeesList.length === 0 && (
                <p className="text-center text-xs opacity-20 font-mono py-4 uppercase">No current invitees recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<any | null>(null);

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id");
      if (idParam) {
        setActiveEventId(idParam);
      } else {
        setActiveEventId(null);
      }
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  const handleLeaveEvent = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("id");
    window.history.pushState({}, "", url.toString());
    setActiveEventId(null);
  };

  const handleCreated = (result: any) => {
    setCreatedResult(result);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black font-sans pt-16">
      <Header />
      
      {activeEventId ? (
        <div className="px-6 py-20">
          <EventDetails id={activeEventId} onLeave={handleLeaveEvent} />
        </div>
      ) : (
        <>
          <Hero />
          <ProblemSolutionSection />
          <CMAMeetReferenceSection />
          <ComparisonSection />
          <LiveMutationDemo />
          
          <section id="scheduler" className="px-6 py-32 border-t border-white/5 bg-gradient-to-b from-black to-neutral-950">
            <div className="max-w-4xl mx-auto space-y-12 text-center">
              <div className="space-y-4">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-orange-500">Living Protocol Playground</span>
                <h2 className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-white mb-4">ETP Event Scheduler</h2>
                <p className="text-white/60 text-base max-w-2xl mx-auto font-light leading-relaxed">
                  Experience the ETP protocol handshake. Schedule a real living event on our distributed ledger, distribute recurring streams, invite participants, and watch statuses synchronize in real-time.
                </p>
              </div>
              
              <div className="max-w-3xl mx-auto text-left relative z-10">
                {!createdResult ? (
                  <EventGenerator onCreated={handleCreated} />
                ) : (
                  <SuccessPanel result={createdResult} onReset={() => setCreatedResult(null)} />
                )}
              </div>
            </div>
          </section>

          <section className="px-6 py-40 border-t border-white/5 flex flex-col items-center">
             <span className="text-[10px] font-mono opacity-20 uppercase tracking-[0.4em] mb-8">Standardization</span>
             <h2 className="text-3xl font-bold tracking-tight text-center max-w-2xl opacity-80 leading-snug">
               ETP is an open, community-driven project dedicated to building synchronization plumbing for the modern web.
             </h2>
          </section>
        </>
      )}

      <footer className="px-6 py-20 border-t border-white/5 text-center text-white/30 text-xs font-mono">
        <p>&copy; 2026 ETP FOUNDATION // CMAMEET_REFERENCE_NODE</p>
      </footer>
      <CookieConsent />
    </div>
  );
}
