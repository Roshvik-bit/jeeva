import React, { useState, useMemo, useEffect } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { CommandAnalyticsBar } from "./CommandAnalyticsBar";
import { IncidentMapView } from "./IncidentMapView";
import { FilterSortControls } from "./FilterSortControls";
import { PriorityIncidentList } from "./PriorityIncidentList";
import { IncidentDetailModal } from "./IncidentDetailModal";
import { DispatchUnitModal } from "./DispatchUnitModal";
import {
  LayoutDashboard,
  ShieldAlert,
  Map as MapIcon,
  Bell,
  Truck,
  Activity,
  Radio,
  Clock,
  CheckCircle2,
  RefreshCw,
  Layers,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export const DashboardPortal = () => {
  const { incidents, rescueUnits, isOnline, setActivePortal } = useEmergency();

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dispatchTargetIncident, setDispatchTargetIncident] = useState(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState("dashboard"); // "dashboard" | "incidents" | "map" | "alerts" | "resources" | "status"
  const [lastSyncTime, setLastSyncTime] = useState("Just now");

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("priority");

  // Mobile view toggle ("split" | "map" | "list")
  const [mobileView, setMobileView] = useState("split");

  // Update sync timestamp periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLastSyncTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filtered & Sorted Incidents
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = inc.title?.toLowerCase().includes(q);
          const matchAddress = inc.location?.address?.toLowerCase().includes(q);
          const matchCategory = inc.category?.toLowerCase().includes(q);
          const matchId = inc.id?.toLowerCase().includes(q);
          if (!matchTitle && !matchAddress && !matchCategory && !matchId) return false;
        }

        // Category
        if (selectedCategory !== "all" && inc.category !== selectedCategory) {
          return false;
        }

        // Severity
        if (selectedSeverity !== "all" && inc.severity !== selectedSeverity) {
          return false;
        }

        // Alerts tab filter (only Critical/High)
        if (activeSidebarTab === "alerts") {
          if (inc.severity !== "Critical" && inc.severity !== "High") return false;
        }

        // Status
        if (selectedStatus !== "all" && inc.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "people") {
          return (b.peopleCount || 0) - (a.peopleCount || 0);
        }
        if (sortBy === "recent") {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        // Default: Smart Priority Score
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      });
  }, [incidents, searchQuery, selectedCategory, selectedSeverity, selectedStatus, sortBy, activeSidebarTab]);

  // Sidebar navigation items
  const sidebarNavItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "incidents", label: "Incidents", icon: <ShieldAlert className="w-4 h-4" />, count: incidents.filter(i => i.status !== "Resolved").length },
    { id: "map", label: "Map", icon: <MapIcon className="w-4 h-4" /> },
    { id: "alerts", label: "Alerts", icon: <Bell className="w-4 h-4" />, count: incidents.filter(i => (i.severity === "Critical" || i.priorityScore >= 85) && i.status !== "Resolved").length, alertBadge: true },
    { id: "resources", label: "Resources", icon: <Truck className="w-4 h-4" />, count: `${rescueUnits.filter(u => u.status === "Available").length}/${rescueUnits.length}` },
    { id: "status", label: "System Status", icon: <Activity className="w-4 h-4" /> }
  ];

  const handleSidebarClick = (id) => {
    setActiveSidebarTab(id);
    if (id === "map") {
      setMobileView("map");
    } else if (id === "incidents" || id === "alerts") {
      setMobileView("list");
    } else {
      setMobileView("split");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sleek Left Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-md p-4 space-y-6">
        <div>
          <div className="flex items-center gap-2 px-2 py-1 text-slate-400 text-[11px] font-mono font-semibold uppercase tracking-wider">
            <span>Navigation</span>
          </div>
          <nav className="mt-2 space-y-1">
            {sidebarNavItems.map((item) => {
              const isActive = activeSidebarTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSidebarClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-900/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.alertBadge
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Resources Fleet Quick Widget */}
        <div className="mt-auto pt-4 border-t border-slate-900 space-y-3">
          <div className="bento-card p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-400" /> Fleet Readiness
              </span>
              <span className="text-emerald-400 font-mono">
                {rescueUnits.filter((u) => u.status === "Available").length} Ready
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full transition-all duration-500"
                style={{
                  width: `${(rescueUnits.filter((u) => u.status === "Available").length / rescueUnits.length) * 100}%`
                }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500">
              {rescueUnits.filter((u) => u.status !== "Available").length} unit(s) currently deployed on missions
            </p>
          </div>

          <button
            onClick={() => setActivePortal("citizen")}
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-between transition-colors"
          >
            <span>Citizen SOS App</span>
            <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 space-y-4">
        {/* Top Status Bar: System Online, Pulsating Green Dot, Sync Timestamp */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 font-mono">
                System Online
              </span>
            </div>

            <span className="text-slate-700 hidden sm:inline">|</span>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Last synchronized: <strong className="text-slate-300 font-mono">{lastSyncTime}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
              SAT-COM 14.2 GHz
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
              Node: IN-MAA-01
            </span>
          </div>
        </div>

        {/* Top Command Analytics & 4 Bento KPI Cards */}
        <CommandAnalyticsBar />

        {/* Mobile View Segmented Control (Hidden on lg screens) */}
        <div className="lg:hidden flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMobileView("split")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mobileView === "split" ? "bg-indigo-600 text-white" : "text-slate-400"
            }`}
          >
            Combined View
          </button>
          <button
            onClick={() => setMobileView("map")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mobileView === "map" ? "bg-indigo-600 text-white" : "text-slate-400"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Tactical Map</span>
          </button>
          <button
            onClick={() => setMobileView("list")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mobileView === "list" ? "bg-indigo-600 text-white" : "text-slate-400"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Priority Queue ({filteredIncidents.length})</span>
          </button>
        </div>

        {/* Main Grid: Left Map + Right Incident Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Col: Live Interactive Leaflet Map (Tactical Dark OSM) */}
          <div
            className={`lg:col-span-6 xl:col-span-7 space-y-3 ${
              mobileView === "list" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MapIcon className="w-4 h-4 text-rose-500" />
                <span>Live Disaster Operational Map</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Tactical OpenStreetMap (Offline-Cached)
              </span>
            </div>

            <IncidentMapView
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              selectedIncidentId={selectedIncident?.id}
              onQuickDispatch={(inc) => setDispatchTargetIncident(inc)}
            />
          </div>

          {/* Right Col: Filters & Priority Incident Feed */}
          <div
            className={`lg:col-span-6 xl:col-span-5 space-y-3.5 ${
              mobileView === "map" ? "hidden lg:block" : "block"
            }`}
          >
            {/* Filter & Sort Controls */}
            <FilterSortControls
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSeverity={selectedSeverity}
              setSelectedSeverity={setSelectedSeverity}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Results Counter Header */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold text-slate-300">
                Ranked Incident Queue ({filteredIncidents.length})
              </span>
              <span className="text-[11px] font-mono">
                Sort:{" "}
                {sortBy === "people"
                  ? "Victim Count"
                  : sortBy === "recent"
                  ? "Recency"
                  : "Smart Priority Score"}
              </span>
            </div>

            {/* Priority Incident Feed */}
            <div className="max-h-[620px] overflow-y-auto pr-1 space-y-3">
              <PriorityIncidentList
                incidents={filteredIncidents}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onOpenDispatch={(inc) => setDispatchTargetIncident(inc)}
                selectedIncidentId={selectedIncident?.id}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Incident Detail Inspector Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        isOpen={Boolean(selectedIncident)}
        onClose={() => setSelectedIncident(null)}
      />

      {/* Direct Dispatch Modal */}
      <DispatchUnitModal
        incident={dispatchTargetIncident}
        isOpen={Boolean(dispatchTargetIncident)}
        onClose={() => setDispatchTargetIncident(null)}
      />
    </div>
  );
};

