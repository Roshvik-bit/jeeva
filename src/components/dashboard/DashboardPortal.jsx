import React, { useState, useMemo } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { CommandAnalyticsBar } from "./CommandAnalyticsBar";
import { IncidentMapView } from "./IncidentMapView";
import { FilterSortControls } from "./FilterSortControls";
import { PriorityIncidentList } from "./PriorityIncidentList";
import { IncidentDetailModal } from "./IncidentDetailModal";
import { DispatchUnitModal } from "./DispatchUnitModal";
import { Map, List, Radio } from "lucide-react";

export const DashboardPortal = () => {
  const { incidents } = useEmergency();

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dispatchTargetIncident, setDispatchTargetIncident] = useState(null);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("priority");

  // Mobile view toggle ("split" | "map" | "list")
  const [mobileView, setMobileView] = useState("split");

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
  }, [incidents, searchQuery, selectedCategory, selectedSeverity, selectedStatus, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* Top Command Analytics & KPI Row */}
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
          <Map className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>
        <button
          onClick={() => setMobileView("list")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            mobileView === "list" ? "bg-indigo-600 text-white" : "text-slate-400"
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Priority Feed ({filteredIncidents.length})</span>
        </button>
      </div>

      {/* Main Grid: Left Map + Right Incident Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Col: Live Interactive Leaflet Map (Hidden if mobileView === 'list') */}
        <div
          className={`lg:col-span-6 xl:col-span-7 space-y-3 ${
            mobileView === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Map className="w-4 h-4 text-rose-500" />
              <span>Live Disaster Operational Map</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live GPS Telemetry Active
            </span>
          </div>

          <IncidentMapView
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            selectedIncidentId={selectedIncident?.id}
            onQuickDispatch={(inc) => setDispatchTargetIncident(inc)}
          />
        </div>

        {/* Right Col: Filters & Priority Incident Feed (Hidden if mobileView === 'map') */}
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
              Ordered by:{" "}
              {sortBy === "people"
                ? "Victim Count"
                : sortBy === "recent"
                ? "Recency"
                : "AI Priority Score"}
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
