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
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#1F2937] selection:bg-blue-600 selection:text-white">
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
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-md">
        <button
          onClick={() => setActivePortal("landing")}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            activePortal === "landing" ? "text-blue-700 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActivePortal("citizen")}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            activePortal === "citizen" ? "text-blue-700 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Radio className="w-5 h-5" />
          <span>Citizen App</span>
        </button>

        <button
          onClick={() => setActivePortal("dashboard")}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
            activePortal === "dashboard" ? "text-blue-700 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Rescue Dashboard</span>
        </button>
      </nav>

      {/* Clean Light Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-xs text-slate-500 hidden sm:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-900">JEEVA</span>
            <span>• Disaster Response & Rescue Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600 text-xs">
            <button
              onClick={() => setActivePortal("landing")}
              className="hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => setActivePortal("citizen")}
              className="hover:text-blue-600 transition-colors"
            >
              Citizen App
            </button>
            <button
              onClick={() => setActivePortal("dashboard")}
              className="hover:text-blue-600 transition-colors"
            >
              Rescue Dashboard
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            Developed for Disaster Management & Rapid Rescue Coordination
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
