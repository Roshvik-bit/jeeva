import React from "react";
import { useEmergency } from "../../context/EmergencyContext";
import {
  AlertOctagon,
  Users,
  Truck,
  Clock,
  Layers,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";

export const CommandAnalyticsBar = () => {
  const { incidents, rescueUnits, addToast } = useEmergency();

  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter(
    (i) => i.severity === "Critical" && i.status !== "Resolved"
  ).length;
  const activeIncidents = incidents.filter((i) => i.status !== "Resolved").length;
  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;

  const totalPeopleAffected = incidents
    .filter((i) => i.status !== "Resolved")
    .reduce((acc, curr) => acc + (curr.peopleCount || 0), 0);

  const unitsDeployed = rescueUnits.filter((u) => u.status !== "Available").length;

  const corroboratedClusters = incidents.filter(
    (i) => (i.corroboratingReportsCount || 1) > 1
  ).length;

  const handleExportBrief = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(incidents, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `JEEVA_Disaster_Briefing_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      type: "success",
      title: "Operational Brief Exported",
      message: "Disaster incident telemetry downloaded for command review."
    });
  };

  return (
    <div className="space-y-2.5">
      {/* Header Bar with Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide font-mono flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            INCIDENT COMMAND & TELEMETRY
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-source disaster triage & spatial consolidation
          </p>
        </div>

        <button
          onClick={handleExportBrief}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
          <span>Export Disaster Brief (JSON)</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {/* Active Incidents */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Events
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
            {activeIncidents}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {resolvedCount} resolved so far
          </p>
        </div>

        {/* Critical Urgency */}
        <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
              Critical Urgency
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-400 font-mono mt-1">
            {criticalCount}
          </p>
          <p className="text-[10px] text-rose-400/70 mt-0.5">
            Immediate dispatch tier
          </p>
        </div>

        {/* Trapped Civilians */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Trapped Civilians
            </span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">
            {totalPeopleAffected}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Aggregated victim count
          </p>
        </div>

        {/* Units Deployed */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Units Deployed
            </span>
            <Truck className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-300 font-mono mt-1">
            {unitsDeployed} / {rescueUnits.length}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Boats, EMS, Earthmovers
          </p>
        </div>

        {/* Corroborated Clusters */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Consolidated
            </span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-1">
            {corroboratedClusters}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            De-duplicated clusters
          </p>
        </div>

        {/* Mean Response Time */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Mean Dispatch
            </span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
            11.4 m
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            From distress to wheels rolling
          </p>
        </div>
      </div>
    </div>
  );
};
