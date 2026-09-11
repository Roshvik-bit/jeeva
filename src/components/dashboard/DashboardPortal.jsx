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
  ExternalLink,
  Trash2
} from "lucide-react";

export const DashboardPortal = () => {
  const { incidents, rescueUnits, isOnline, setActivePortal, clearAllIncidents, t } = useEmergency();

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
    { id: "dashboard", label: t.dashboard || "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "incidents", label: t.incidents || "Incidents", icon: <ShieldAlert className="w-4 h-4" />, count: incidents.filter(i => i.status !== "Resolved").length },
    { id: "map", label: t.map || "Map", icon: <MapIcon className="w-4 h-4" /> },
    { id: "alerts", label: t.alerts || "Alerts", icon: <Bell className="w-4 h-4" />, count: incidents.filter(i => (i.severity === "Critical" || i.priorityScore >= 8.5) && i.status !== "Resolved").length, alertBadge: true },
    { id: "resources", label: t.resources || "Resources", icon: <Truck className="w-4 h-4" />, count: `${rescueUnits.filter(u => u.status === "Available").length}/${rescueUnits.length}` },
    { id: "status", label: t.systemStatus || "System Status", icon: <Activity className="w-4 h-4" /> }
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
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F7F9FC]">
      {/* Clean Left Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-slate-200 bg-white p-4 space-y-6">
        <div>
          <div className="flex items-center gap-2 px-2 py-1 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>{t.navigation || "Navigation"}</span>
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
                      ? "bg-[#1976D2] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? "text-white" : "text-slate-500"}>
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
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
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
        <div className="mt-auto pt-4 border-t border-slate-200 space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600" /> {t.fleetReadiness || "Fleet Readiness"}
              </span>
              <span className="text-teal-700 font-mono font-bold">
                {rescueUnits.filter((u) => u.status === "Available").length} {t.readyCount || "Ready"}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-teal-600 h-full transition-all duration-500"
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
            className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center justify-between transition-colors"
          >
            <span>{t.switchToCitizen || "Citizen App"}</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 min-w-0 p-3 sm:p-5 lg:p-6 space-y-4">
        {/* Top Status Bar: System Online, Pulsating Green Dot, Sync Timestamp */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-green-700 font-mono">
                {t.systemOnline || "System Online"}
              </span>
            </div>

            <span className="text-slate-300 hidden sm:inline">|</span>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.lastSynchronized || "Last synchronized"}: <strong className="text-slate-800 font-mono">{lastSyncTime}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
              SAT-COM 14.2 GHz
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
              Node: IN-MAA-01
            </span>
            {incidents.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to remove all incidents from the application and database?")) {
                    clearAllIncidents();
                  }
                }}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Remove all incidents from application and Supabase"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
                <span>Clear All Incidents</span>
              </button>
            )}
          </div>
        </div>

        {/* Top Command Analytics & 4 Bento KPI Cards */}
        <CommandAnalyticsBar />

        {/* Mobile View Segmented Control (Hidden on lg screens) */}
        <div className="lg:hidden flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setMobileView("split")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mobileView === "split" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"
            }`}
          >
            Combined View
          </button>
          <button
            onClick={() => setMobileView("map")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mobileView === "map" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
          <button
            onClick={() => setMobileView("list")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mobileView === "list" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Incident Queue ({filteredIncidents.length})</span>
          </button>
        </div>

        {/* Main Grid: Left Map + Right Incident Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Col: Live Interactive Leaflet Map */}
          <div
            className={`lg:col-span-6 xl:col-span-7 space-y-3 ${
              mobileView === "list" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapIcon className="w-4 h-4 text-blue-600" />
                <span>{t.liveOperationsMap || "Live Disaster Operations Map"}</span>
              </h3>
              <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                {t.openStreetMapActive || "OpenStreetMap Active"}
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
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span className="font-semibold text-slate-800">
                {t.rankedQueue || "Ranked Incident Queue"} ({filteredIncidents.length})
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Sort:{" "}
                {sortBy === "people"
                  ? "Victim Count"
                  : sortBy === "recent"
                  ? "Recency"
                  : "Priority Score"}
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

