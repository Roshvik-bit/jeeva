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
  const { updateIncidentStatus, rescueUnits, t } = useEmergency();

  if (incidents.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-sm">
        <AlertOctagon className="w-10 h-10 stroke-[1.5] mb-2 text-slate-400" />
        <p className="text-sm font-bold text-slate-800">No matching incidents found</p>
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

        const routeStatus =
          incident.routeStatus ||
          (incident.category === "flood"
            ? "Restricted (Boats only)"
            : incident.category === "landslide"
            ? "Partially blocked"
            : "Clear");

        return (
          <div
            key={incident.id}
            onClick={() => onSelectIncident(incident)}
            className={`group relative p-4 rounded-xl border transition-all cursor-pointer bg-white ${
              isSelected
                ? "border-blue-600 ring-2 ring-blue-600/20 shadow-md"
                : isCritical
                ? "border-red-300 hover:border-red-400 shadow-sm"
                : "border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            {/* Top row: Area / Title & Severity badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {incident.location?.address || incident.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  #{incident.id} • {incident.title !== incident.location?.address ? incident.title : incident.category}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    isResolved
                      ? "bg-green-50 text-green-700 border-green-200"
                      : incident.severity === "Critical"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : incident.severity === "High"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {isResolved ? (t.statusResolved || "Resolved") : incident.severity}
                </span>

                {(incident.corroboratingReportsCount || 1) > 1 && (
                  <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-400" />
                    <span>{incident.corroboratingReportsCount} reports</span>
                  </span>
                )}
              </div>
            </div>

            {/* Middle Section: Metrics strictly matching pattern */}
            <div className="mt-3 space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{incident.peopleCount} {t.peopleAffectedLabel || "people affected"}</span>
              </div>

              {incident.hasMedicalEmergency && (
                <div className="flex items-center gap-1.5 font-semibold text-red-600">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>{t.medicalAssistanceRequired || "Medical assistance required"}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="text-slate-400 font-medium">{t.route || "Route"}:</span>
                <span className={`font-semibold ${
                  routeStatus.includes("blocked") || routeStatus.includes("Restricted")
                    ? "text-orange-700"
                    : "text-green-700"
                }`}>
                  {routeStatus}
                </span>
              </div>

              {/* Media & Offline Sync Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {incident.isOfflineSync && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                    <span>⚡ Synced from Offline</span>
                  </span>
                )}
                {incident.photoUrl && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                    <span>📸 Photo</span>
                  </span>
                )}
                {(incident.audioUrl || incident.audioBase64) && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-200">
                    <span>🎙️ Voice Note</span>
                  </span>
                )}
              </div>
            </div>

            {/* Priority Score Display */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700">
                <span>{t.priorityScore || "Priority Score"}: </span>
                <span className={`font-mono font-bold text-sm ${
                  incident.priorityScore >= 8.5
                    ? "text-red-600"
                    : incident.priorityScore >= 6.5
                    ? "text-orange-600"
                    : "text-amber-600"
                }`}>
                  {incident.priorityScore}/10
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIncident(incident);
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  {t.viewIncident || "View Incident"}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDispatch(incident);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                >
                  {incident.assignedUnit ? (t.reassign || "Re-assign") : (t.dispatch || "Dispatch")}
                </button>

                {incident.status !== "Resolved" ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateIncidentStatus(incident.id, "Resolved");
                    }}
                    className="p-1 text-slate-400 hover:text-green-600 rounded transition-colors"
                    title={t.resolve || "Mark Resolved"}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateIncidentStatus(incident.id, "Pending");
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-700 font-medium underline"
                  >
                    {t.reopen || "Reopen"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
