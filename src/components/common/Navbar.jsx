import React from "react";
import { useEmergency } from "../../context/EmergencyContext";
import {
  ShieldAlert,
  Wifi,
  WifiOff,
  Globe,
  Radio,
  Volume2,
  Users,
  LayoutDashboard,
  Home
} from "lucide-react";

export const Navbar = () => {
  const {
    activePortal,
    setActivePortal,
    language,
    setLanguage,
    t,
    isOnline,
    toggleOnlineStatus,
    offlineOutbox,
    playEmergencyAudio
  } = useEmergency();

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी (Hindi)" },
    { code: "bn", label: "বাংলা (Bengali)" },
    { code: "ta", label: "தமிழ் (Tamil)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "ml", label: "മലയാളം (Malayalam)" },
    { code: "mr", label: "मराठी (Marathi)" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Jeeva Logo Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePortal("landing")}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all group shadow-sm"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-md shadow-rose-600/30 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-wider text-white font-mono">
                JEEVA
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold hidden sm:inline">
                RESCUE
              </span>
            </div>
          </button>
        </div>

        {/* Center: Clean Page Links */}
        <nav className="flex items-center bg-slate-900/80 p-1 rounded-full border border-slate-800/80 shadow-inner">
          <button
            onClick={() => setActivePortal("citizen")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              activePortal === "citizen"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Citizen App</span>
          </button>

          <button
            onClick={() => setActivePortal("dashboard")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              activePortal === "dashboard"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Rescue Dashboard</span>
          </button>
        </nav>

        {/* Right: Connectivity Indicator & Language */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Connectivity Pill Indicator ("🟢 Online" / "🔴 Offline") */}
          <button
            onClick={() => toggleOnlineStatus()}
            title={isOnline ? "Click to simulate Offline Mode" : "Click to simulate Online Reconnection"}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-all cursor-pointer shadow-sm ${
              isOnline
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 hover:border-emerald-400"
                : "bg-rose-950/50 border-rose-500/60 text-rose-300 animate-pulse hover:bg-rose-900/50"
            }`}
          >
            {isOnline ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>🟢 Online</span>
              </>
            ) : (
              <>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                <span>🔴 Offline</span>
                {offlineOutbox.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500 text-slate-950 text-[10px] font-black rounded-full">
                    {offlineOutbox.length}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Multilingual Selector */}
          <div className="relative">
            <label htmlFor="language-select" className="sr-only">Select Language</label>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus-within:border-slate-600">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer pr-1"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Siren Audio Test Button */}
          <button
            onClick={() => playEmergencyAudio("siren")}
            title="Test Emergency Audio Beacon"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
            aria-label="Sound Siren"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
