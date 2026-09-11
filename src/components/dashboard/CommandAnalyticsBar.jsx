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
            <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Incident Command & Operations
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-source disaster triage, automated clustering & tactical routing
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-700 shadow-sm font-medium">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Units Deployed: <strong className="text-slate-900">{unitsDeployed} / {rescueUnits.length}</strong></span>
          </div>

          <button
            onClick={handleExportBrief}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Brief</span>
          </button>
        </div>
      </div>

      {/* 4 Rounded Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Incidents */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Incidents
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono mt-2">
            {activeIncidents}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span>{resolvedCount} resolved so far</span>
          </div>
        </div>

        {/* Card 2: Critical Incidents */}
        <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm hover:border-red-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Critical
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-600 font-mono mt-2">
            {criticalCount}
          </p>
          <p className="text-[11px] text-red-700 mt-1.5 font-medium">
            Immediate dispatch tier
          </p>
        </div>

        {/* Card 3: High Priority */}
        <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-sm hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">
              High Priority
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-orange-600 font-mono mt-2">
            {highPriorityCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Priority response queue
          </p>
        </div>

        {/* Card 4: Potentially Affected People */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              People Affected
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono mt-2">
            {totalPeopleAffected}
          </p>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Aggregated civilian victim count
          </p>
        </div>
      </div>
    </div>
  );
};
