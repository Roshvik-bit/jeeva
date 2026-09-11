import React from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { Search, Filter, ArrowUpDown } from "lucide-react";

export const FilterSortControls = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSeverity,
  setSelectedSeverity,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy
}) => {
  const { t } = useEmergency();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 shadow-sm">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder || "Search by area, landmark, category, or ID..."}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
        />
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-600"
        >
          <option value="all">{t.allCategories || "All Categories"}</option>
          <option value="flood">{t.flood || "Flood"} / Submerged</option>
          <option value="collapse">{t.collapse || "Structural Collapse"}</option>
          <option value="medical">{t.medical || "Medical Emergency"}</option>
          <option value="fire">{t.fire || "Fire"} / Hazmat</option>
          <option value="landslide">{t.landslide || "Landslide"}</option>
          <option value="cyclone">{t.cyclone || "Cyclone"}</option>
        </select>

        {/* Severity */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-600"
        >
          <option value="all">{t.allSeverities || "All Severities"}</option>
          <option value="Critical">{t.criticalCard || "Critical"}</option>
          <option value="High">{t.highPriorityCard || "High"}</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="False Alarm">⚠️ False Alarms (Score 0.0)</option>
        </select>

        {/* Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-600"
        >
          <option value="all">{t.allStatuses || "All Statuses"}</option>
          <option value="Pending">{t.statusPending || "Pending Verification"}</option>
          <option value="Dispatched">{t.statusDispatched || "Unit Dispatched"}</option>
          <option value="On Scene">{t.statusOnScene || "On Scene"}</option>
          <option value="Resolved">{t.statusResolved || "Resolved"}</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-700 font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
        >
          <option value="priority">{t.sortPriority || "Sort: Priority Score (High)"}</option>
          <option value="people">{t.sortPeople || "Sort: Most Trapped"}</option>
          <option value="recent">{t.sortRecent || "Sort: Most Recent"}</option>
        </select>
      </div>
    </div>
  );
};
