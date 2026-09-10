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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand & SIH Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setActivePortal("landing")}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white font-mono">
                  {t.appName}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  SIH26013
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-xs leading-none mt-0.5">
                {t.appSubtitle}
              </p>
            </div>
          </button>
        </div>

        {/* Center: Portal Navigation Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActivePortal("citizen")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activePortal === "citizen"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.switchToCitizen}</span>
            <span className="xs:hidden">SOS</span>
          </button>

          <button
            onClick={() => setActivePortal("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activePortal === "dashboard"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.switchToDashboard}</span>
            <span className="xs:hidden">Command</span>
          </button>
        </div>

        {/* Right side: Network Switch + Multilingual Selector + Siren Test */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Offline/Online Simulation Toggle */}
          <button
            onClick={() => toggleOnlineStatus()}
            title={isOnline ? "Click to simulate Offline Mode" : "Click to simulate Online Reconnect"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isOnline
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40"
                : "bg-amber-950/60 border-amber-500/60 text-amber-300 animate-pulse hover:bg-amber-900/60"
            }`}
          >
            {isOnline ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.offline}</span>
                {offlineOutbox.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full">
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
