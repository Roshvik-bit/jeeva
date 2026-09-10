import React from "react";
import { EmergencyProvider, useEmergency } from "./context/EmergencyContext";
import { Navbar } from "./components/common/Navbar";
import { ToastContainer } from "./components/common/ToastContainer";
import { LandingHero } from "./components/common/LandingHero";
import { CitizenPortal } from "./components/citizen/CitizenPortal";
import { DashboardPortal } from "./components/dashboard/DashboardPortal";
import { ShieldAlert, Heart, Radio, LayoutDashboard, Home } from "lucide-react";

const AppContent = () => {
  const { activePortal, setActivePortal, t } = useEmergency();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Global Header */}
      <Navbar />

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Main Content Body */}
      <main className="flex-1">
        {activePortal === "landing" && <LandingHero />}
        {activePortal === "citizen" && <CitizenPortal />}
        {activePortal === "dashboard" && <DashboardPortal />}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => setActivePortal("landing")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activePortal === "landing" ? "text-rose-500" : "text-slate-400"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActivePortal("citizen")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activePortal === "citizen" ? "text-rose-500" : "text-slate-400"
          }`}
        >
          <Radio className="w-5 h-5" />
          <span>Citizen SOS</span>
        </button>

        <button
          onClick={() => setActivePortal("dashboard")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
            activePortal === "dashboard" ? "text-indigo-400" : "text-slate-400"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Command Hub</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500 hidden sm:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span className="font-bold text-slate-200">JEEVA</span>
            <span>• SIH Problem Statement ID: SIH26013</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <button
              onClick={() => setActivePortal("landing")}
              className="hover:text-white transition-colors"
            >
              Overview
            </button>
            <button
              onClick={() => setActivePortal("citizen")}
              className="hover:text-white transition-colors"
            >
              Citizen SOS
            </button>
            <button
              onClick={() => setActivePortal("dashboard")}
              className="hover:text-white transition-colors"
            >
              Rescue Command
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            Designed for National Disaster Management & Rapid Response
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <EmergencyProvider>
      <AppContent />
    </EmergencyProvider>
  );
}
