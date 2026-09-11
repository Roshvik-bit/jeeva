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
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-xl text-slate-500 shadow-sm space-y-2">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
          <AlertOctagon className="w-6 h-6 stroke-[1.8]" />
        </div>
        <p className="text-sm font-bold text-slate-800">No Active Incidents</p>
        <p className="text-xs text-slate-500 max-w-xs">
          All zones clear. Rescue teams are on standby awaiting new citizen distress dispatches.
        </p>
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
            {/* Top row: Incident Title & Severity badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {incident.title || incident.location?.address || incident.category}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-700">#{incident.id}</span>
                  <span>•</span>
                  <span className="truncate">📍 {incident.location?.address || incident.category}</span>
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                {incident.isFalseAlarm || incident.severity === "False Alarm" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                    ⚠️ False Alarm (0.0)
                  </span>
                ) : (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isResolved
                        ? "bg-green-50 text-green-700 border-green-200"
                        : incident.priorityScore >= 8.5 || incident.isAbsoluteEmergency
                        ? "bg-red-100 text-red-800 border-red-300 animate-pulse font-extrabold"
                        : incident.severity === "Critical"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : incident.severity === "High"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {isResolved ? (t.statusResolved || "Resolved") : incident.isAbsoluteEmergency ? "🚨 Absolute Emergency" : incident.severity}
                  </span>
                )}

                {(incident.corroboratingReportsCount || 1) > 1 && (
                  <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-400" />
                    <span>{incident.corroboratingReportsCount} reports</span>
                  </span>
                )}
              </div>
            </div>

            {/* Middle Section: Operational Badges & Metrics */}
            <div className="mt-3 space-y-1 text-xs text-slate-600">
              {/* Disaster Domain Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                {["flood", "landslide", "cyclone", "collapse", "earthquake"].includes(incident.category?.toLowerCase()) && !incident.isFalseAlarm && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                    🌊 Natural Disaster
                  </span>
                )}
                {incident.category?.toLowerCase() === "fire" && !incident.isFalseAlarm && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-800 text-[10px] font-bold border border-red-200">
                    🔥 Fire Emergency
                  </span>
                )}
                {(incident.category?.toLowerCase() === "medical" || incident.hasMedicalEmergency) && !incident.isFalseAlarm && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200">
                    🚑 Health / Medical
                  </span>
                )}
                {incident.isFalseAlarm && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                    ⚠️ False Statement / Non-Hazard
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{incident.peopleCount} {t.peopleAffectedLabel || "people affected"}</span>
              </div>

              {incident.hasMedicalEmergency && !incident.isFalseAlarm && (
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
                {incident.isFalseAlarm || incident.severity === "False Alarm" ? (
                  <span className="font-mono font-bold text-sm text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    0.0/10 (False Alarm)
                  </span>
                ) : (
                  <span className={`font-mono font-bold text-sm ${
                    incident.priorityScore >= 8.5
                      ? "text-red-600 font-extrabold"
                      : incident.priorityScore >= 6.5
                      ? "text-orange-600"
                      : "text-blue-600"
                  }`}>
                    {incident.priorityScore}/10
                  </span>
                )}
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
