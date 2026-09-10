import React from "react";
import { useEmergency } from "../../context/EmergencyContext";
import {
  ShieldAlert,
  Radio,
  LayoutDashboard,
  WifiOff,
  Sparkles,
  MapPin,
  Layers,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Clock,
  HeartPulse
} from "lucide-react";

export const LandingHero = () => {
  const { setActivePortal, t, incidents, offlineOutbox, isOnline } = useEmergency();

  const totalCivilians = incidents.reduce((sum, i) => sum + (i.peopleCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 space-y-12">
      {/* Hero Headline Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>SIH PROBLEM STATEMENT ID: SIH26013</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          JEEVA: Immediate Rescue Interface for Disaster Relief
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          High-performance, offline-first emergency response system connecting stranded citizens
          with rescue command centers via edge AI vision, smart priority scoring, and instant GPS coordination.
        </p>

        {/* Real-time Telemetry Pill */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 font-mono pt-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {incidents.length} Monitored Incidents
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
            {totalCivilians} Citizens Accounted
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Zero-Data Offline Queue Ready
          </span>
        </div>
      </div>

      {/* Primary Portal Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Portal A: Citizen Emergency App */}
        <div
          onClick={() => setActivePortal("citizen")}
          className="group relative bg-gradient-to-b from-rose-950/40 via-slate-900/90 to-slate-950 border-2 border-rose-500/40 hover:border-rose-500 rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-rose-900/40 transition-all cursor-pointer transform hover:-translate-y-1 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 group-hover:scale-110 transition-transform">
                <Radio className="w-7 h-7 animate-pulse" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Citizen Portal
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-rose-300 transition-colors">
                Citizen Emergency SOS App
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                For individuals affected by disasters to send distress alerts immediately. Works completely offline with auto-sync, speech-to-text dictation, and AI photo hazard tagging.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>1-Tap SOS with 3s cancel failsafe & GPS coordinates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Offline local storage with automatic cloud sync</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Edge AI image classification & 7 Indian regional languages</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-rose-400 font-bold text-sm group-hover:text-rose-300">
            <span>Launch Citizen SOS App</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Portal B: Rescue-Team Command Dashboard */}
        <div
          onClick={() => setActivePortal("dashboard")}
          className="group relative bg-gradient-to-b from-indigo-950/40 via-slate-900/90 to-slate-950 border-2 border-indigo-500/40 hover:border-indigo-500 rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-indigo-900/40 transition-all cursor-pointer transform hover:-translate-y-1 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Command Center
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">
                Rescue Operations Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                For command headquarters, NDRF, and district responders to view live Leaflet disaster maps, rank emergencies with Smart Priority Scoring, and dispatch units.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Interactive Leaflet Map with live severity color pins</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Smart Priority Scoring Engine (0-100) with full transparency</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Automated spatial duplicate grouping within 500m</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between text-indigo-400 font-bold text-sm group-hover:text-indigo-300">
            <span>Open Command Operations</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Technology & Architecture Highlights */}
      <div className="pt-6 border-t border-slate-800/80">
        <h3 className="text-center text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-6">
          Architectural Pillars of JEEVA
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <WifiOff className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Offline-First Outbox</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              LocalStorage + IndexedDB store saves distress reports locally during cellular outages and automatically syncs when signal returns.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Edge AI Computer Vision</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyzes field photos to estimate flood water depths, structural shear, and hazardous electrical conditions with confidence tags.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Spatial Duplicate Clustered</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically clusters incoming calls within 500m of matching disaster category into single high-impact incidents.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Resource Matching Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically pairs disaster profiles with ideal response units (NDRF Motorized Boats, SDRF Earthmovers, ALS Ambulances).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
