import React from "react";
import { useEmergency } from "../../context/EmergencyContext";
import {
  AlertOctagon,
  Users,
  AlertTriangle,
  Flame,
  ShieldAlert,
  FileSpreadsheet,
  Activity,
  CheckCircle2
} from "lucide-react";

export const CommandAnalyticsBar = () => {
  const { incidents, rescueUnits, addToast } = useEmergency();

  const activeIncidents = incidents.filter((i) => i.status !== "Resolved").length;
  const resolvedCount = incidents.filter((i) => i.status === "Resolved").length;

  const criticalCount = incidents.filter(
    (i) => (i.severity === "Critical" || i.priorityScore >= 85) && i.status !== "Resolved"
  ).length;

  const highPriorityCount = incidents.filter(
    (i) =>
      (i.severity === "High" || (i.priorityScore >= 65 && i.priorityScore < 85)) &&
      i.status !== "Resolved"
  ).length;

  const totalPeopleAffected = incidents
    .filter((i) => i.status !== "Resolved")
    .reduce((acc, curr) => acc + (curr.peopleCount || 0), 0);

  const unitsDeployed = rescueUnits.filter((u) => u.status !== "Available").length;

  const handleExportBrief = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(incidents, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `JEEVA_Disaster_Briefing_${new Date().toISOString().slice(0, 10)}.json`
    );
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
    <div className="space-y-3">
      {/* Header Bar with Telemetry Meta & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide font-mono">
              INCIDENT COMMAND & TELEMETRY
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              LIVE FEED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-source disaster triage, automated clustering & tactical routing
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 font-mono">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Units Deployed: <strong className="text-white">{unitsDeployed} / {rescueUnits.length}</strong></span>
          </div>

          <button
            onClick={handleExportBrief}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Brief</span>
          </button>
        </div>
      </div>

      {/* 4 Rounded Bento Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Incidents */}
        <div className="bento-card p-4 transition-all hover:border-slate-700 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Incidents
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-2">
            {activeIncidents}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{resolvedCount} resolved so far</span>
          </div>
        </div>

        {/* Card 2: Critical Incidents */}
        <div className="bento-card p-4 border-rose-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-rose-950/20 transition-all hover:border-rose-500/50 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Critical
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-400 font-mono mt-2">
            {criticalCount}
          </p>
          <p className="text-[11px] text-rose-400/80 mt-1.5 font-medium">
            Immediate dispatch tier
          </p>
        </div>

        {/* Card 3: High Priority */}
        <div className="bento-card p-4 transition-all hover:border-amber-500/40 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              High Priority
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-2">
            {highPriorityCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Priority response queue
          </p>
        </div>

        {/* Card 4: Potentially Affected People */}
        <div className="bento-card p-4 transition-all hover:border-indigo-500/40 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              Potentially Affected
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-300 font-mono mt-2">
            {totalPeopleAffected}
          </p>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Aggregated civilian victim count
          </p>
        </div>
      </div>
    </div>
  );
};
