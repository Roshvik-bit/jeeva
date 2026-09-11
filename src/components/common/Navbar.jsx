import React from "react";
import { useEmergency } from "../../context/EmergencyContext";
import {
  ShieldAlert,
  Globe,
  Radio,
  Volume2,
  LayoutDashboard
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
    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { code: "bn", label: "বাংলা (Bengali)" },
    { code: "ta", label: "தமிழ் (Tamil)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "ml", label: "മലയാളം (Malayalam)" },
    { code: "mr", label: "मराठी (Marathi)" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand: JEEVA | Disaster Response Platform */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePortal("landing")}
            className="flex items-center gap-2.5 text-left group transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none">
                {t.appName || "JEEVA"}
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline mt-0.5">
                {t.appSubtitle || "Disaster Response Platform"}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActivePortal("citizen")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              activePortal === "citizen"
                ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{t.switchToCitizen || "Citizen App"}</span>
          </button>

          <button
            onClick={() => setActivePortal("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              activePortal === "dashboard"
                ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t.switchToDashboard || "Rescue Dashboard"}</span>
          </button>
        </nav>

        {/* Right: Online Status & Language Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online / Offline Status Button */}
          <button
            onClick={() => toggleOnlineStatus()}
            title={isOnline ? "Click to simulate Offline Mode" : "Click to simulate Online Reconnection"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isOnline
                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-600" : "bg-red-600"
              }`}
            />
            <span>{isOnline ? (t.online || "Online") : (t.offline || "Offline")}</span>
            {!isOnline && offlineOutbox.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-bold rounded-full">
                {offlineOutbox.length}
              </span>
            )}
          </button>

          {/* Multilingual Selector */}
          <div className="relative">
            <label htmlFor="language-select" className="sr-only">Select Language</label>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus-within:border-blue-500">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-slate-700 text-xs focus:outline-none cursor-pointer pr-1"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Audio Alert Test Button */}
          <button
            onClick={() => playEmergencyAudio("siren")}
            title="Test Emergency Alert Sound"
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Sound Siren"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

