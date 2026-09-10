import React from "react";
import { useEmergency } from "../../context/EmergencyContext";
import {
  AlertOctagon,
  Users,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  Truck,
  CheckCircle,
  Eye,
  AlertTriangle
} from "lucide-react";

export const PriorityIncidentList = ({
  incidents,
  onSelectIncident,
  onOpenDispatch,
  selectedIncidentId
}) => {
  const { updateIncidentStatus, rescueUnits } = useEmergency();

  if (incidents.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-500">
        <AlertOctagon className="w-10 h-10 stroke-[1.5] mb-2 text-slate-600" />
        <p className="text-sm font-bold text-slate-300">No matching incidents found</p>
        <p className="text-xs text-slate-500 mt-1">Try relaxing filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => {
        const isSelected = selectedIncidentId === incident.id;
        const isCritical = incident.severity === "Critical" && incident.status !== "Resolved";
        const isResolved = incident.status === "Resolved";
        const assignedUnit = rescueUnits.find((u) => u.id === incident.assignedUnit);

        return (
          <div
            key={incident.id}
            onClick={() => onSelectIncident(incident)}
            className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
              isSelected
                ? "bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-950/60 ring-1 ring-indigo-500"
                : isCritical
                ? "bg-slate-900/90 border-rose-500/40 hover:border-rose-500/80 shadow-md shadow-rose-950/30"
                : "bg-slate-900/70 border-slate-800 hover:border-slate-700 shadow-sm"
            }`}
          >
            {/* Header: Priority Score + Title + Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {/* Priority Score Circle */}
                <div
                  className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 font-mono font-black border shadow-md transition-transform group-hover:scale-105 ${
                    isResolved
                      ? "bg-emerald-950 text-emerald-400 border-emerald-500/40"
                      : incident.priorityScore >= 85
                      ? "bg-rose-950 text-rose-400 border-rose-500/50 shadow-rose-950/50"
                      : incident.priorityScore >= 70
                      ? "bg-orange-950 text-orange-400 border-orange-500/40"
                      : "bg-amber-950 text-amber-400 border-amber-500/40"
                  }`}
                >
                  <span className="text-sm leading-none">{incident.priorityScore}</span>
                  <span className="text-[9px] text-slate-400 font-sans font-normal">SCORE</span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      #{incident.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        incident.severity === "Critical"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : incident.severity === "High"
                          ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {incident.severity} • {incident.category}
                    </span>

                    {/* Consolidated Duplicate Badge */}
                    {(incident.corroboratingReportsCount || 1) > 1 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{incident.corroboratingReportsCount} Reports Corroborated</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                    {incident.title}
                  </h3>
                </div>
              </div>

              {/* Status Pill */}
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 uppercase tracking-wider border ${
                  incident.status === "Resolved"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                    : incident.status === "On Scene"
                    ? "bg-cyan-950 text-cyan-300 border-cyan-500/40"
                    : incident.status === "Dispatched"
                    ? "bg-indigo-950 text-indigo-300 border-indigo-500/40"
                    : "bg-rose-950 text-rose-300 border-rose-500/40"
                }`}
              >
                {incident.status}
              </span>
            </div>

            {/* Address & Trapped Citizens Bar */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1 truncate max-w-xs">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{incident.location?.address}</span>
              </span>

              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>{incident.peopleCount} trapped civilians</span>
              </span>

              {incident.hasMedicalEmergency && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Medical Emergency</span>
                </span>
              )}

              <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono ml-auto">
                <Clock className="w-3 h-3" />
                <span>
                  {new Date(incident.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </span>
            </div>

            {/* Recommended Resource Tag & Unit Status */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Recommended: {incident.recommendedResource || "Rescue Boat"}</span>
                </span>

                {assignedUnit && (
                  <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Unit: {assignedUnit.name.split("-")[0]}</span>
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDispatch(incident);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                >
                  <Truck className="w-3 h-3" />
                  <span>{incident.assignedUnit ? "Re-assign" : "Dispatch"}</span>
                </button>

                {incident.status !== "Resolved" ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateIncidentStatus(incident.id, "Resolved");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Resolve</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateIncidentStatus(incident.id, "Pending");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                  >
                    Reopen
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIncident(incident);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Inspect incident details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
