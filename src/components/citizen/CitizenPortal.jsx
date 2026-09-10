import React, { useState } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { QuickSOSButton } from "./QuickSOSButton";
import { EmergencyReportForm } from "./EmergencyReportForm";
import { OfflineSyncBanner } from "./OfflineSyncBanner";
import { SurvivalGuideModal } from "./SurvivalGuideModal";
import { MyReportsDrawer } from "./MyReportsDrawer";
import {
  AlertCircle,
  FileText,
  BookOpen,
  PhoneCall,
  CheckCircle2,
  Shield,
  Clock
} from "lucide-react";

export const CitizenPortal = () => {
  const { t, myReports, offlineOutbox, isOnline } = useEmergency();
  const [activeTab, setActiveTab] = useState("sos"); // "sos" | "form"
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 space-y-4">
      {/* Offline Alert & Pending Sync Banner */}
      <OfflineSyncBanner />

      {/* Mode Switcher Tabs: 1-Tap SOS vs Detailed Report */}
      <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
        <button
          onClick={() => setActiveTab("sos")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "sos"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping"></span>
          <span>1-TAP EMERGENCY SOS</span>
        </button>

        <button
          onClick={() => setActiveTab("form")}
          className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "form"
              ? "bg-slate-800 text-white shadow-md"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>DETAILED REPORT</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
        {activeTab === "sos" ? (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                LIFE THREATENING DISTRESS
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                One-Touch Emergency Beacon
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Immediately broadcasts your GPS location and triggers high-priority rescue dispatch.
              </p>
            </div>

            <QuickSOSButton />

            {/* Quick Helpline Numbers Strip */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-around text-center text-xs">
              <a
                href="tel:112"
                className="flex items-center gap-1 text-slate-300 hover:text-rose-400 font-bold"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
                <span>112 (National SOS)</span>
              </a>
              <span className="text-slate-700">|</span>
              <a
                href="tel:108"
                className="flex items-center gap-1 text-slate-300 hover:text-rose-400 font-bold"
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
                <span>108 (Ambulance)</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base sm:text-lg font-black text-white">
                {t.quickReport}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.quickReportSubtitle}
              </p>
            </div>

            <EmergencyReportForm onSubmitted={() => setActiveTab("sos")} />
          </div>
        )}
      </div>

      {/* Citizen Utility Drawer Action Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 text-left transition-colors group flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">Track My Alerts</p>
            <p className="text-[11px] text-slate-400 truncate">
              {myReports.length} submitted alert(s)
            </p>
          </div>
        </button>

        <button
          onClick={() => setIsGuideOpen(true)}
          className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 text-left transition-colors group flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">Survival Guide</p>
            <p className="text-[11px] text-slate-400 truncate">Offline emergency tips</p>
          </div>
        </button>
      </div>

      {/* Modals & Drawers */}
      <SurvivalGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <MyReportsDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};
