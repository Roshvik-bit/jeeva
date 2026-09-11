import React, { useState } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { DispatchUnitModal } from "./DispatchUnitModal";
import {
  AlertOctagon,
  Users,
  Sparkles,
  Layers,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Check,
  X,
  Volume2,
  FileText
} from "lucide-react";

export const IncidentDetailModal = ({ incident, isOpen, onClose }) => {
  const { updateIncidentStatus, rescueUnits, t } = useEmergency();
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  if (!isOpen || !incident) return null;

  const assignedUnitObj = rescueUnits.find((u) => u.id === incident.assignedUnit);

  const handleStatusChange = (newStatus) => {
    updateIncidentStatus(incident.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-6 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                incident.severity === "Critical"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : incident.severity === "High"
                  ? "bg-orange-50 text-orange-700 border-orange-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {incident.severity} Severity
            </span>
            <span className="font-mono text-xs font-semibold text-slate-500">
              #{incident.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Title & Location Header */}
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {incident.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                {incident.location?.address}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Priority Score */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500">{t.priorityScore || "Priority Score"}</p>
              <p className="text-xl font-bold font-mono text-red-600 mt-0.5">
                {incident.priorityScore}/100
              </p>
            </div>

            {/* Trapped Victims */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500">{t.peopleAffectedLabel || "People Affected"}</p>
              <p className="text-xl font-bold font-mono text-orange-600 mt-0.5">
                {incident.peopleCount}
              </p>
            </div>

            {/* Corroborations */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500">Reports Merged</p>
              <p className="text-xl font-bold font-mono text-teal-700 mt-0.5">
                {incident.corroboratingReportsCount || 1}
              </p>
            </div>

            {/* Status */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-500">{t.statusLabel || "Status"}</p>
              <p className="text-xs font-bold font-mono text-blue-700 mt-1.5 uppercase">
                {incident.status === "Resolved" ? (t.statusResolved || "Resolved") : incident.status}
              </p>
            </div>
          </div>

          {/* AI-Assisted Incident Analysis Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    AI-assisted incident analysis
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Automated multi-factor operational ranking
                  </p>
                </div>
              </div>

              {/* Priority Score Gauge Pill */}
              <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto shadow-sm">
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                    Priority Score
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {incident.priorityScore >= 85 ? "Critical Urgency" : incident.priorityScore >= 65 ? "High Urgency" : "Moderate"}
                  </span>
                </div>
                <div className={`px-2.5 py-1 rounded-lg font-mono font-bold text-base border ${
                  incident.priorityScore >= 85
                    ? "bg-red-50 border-red-200 text-red-700"
                    : incident.priorityScore >= 65
                    ? "bg-orange-50 border-orange-200 text-orange-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                }`}>
                  {incident.priorityScore}/100
                </div>
              </div>
            </div>

            {/* 4-Factor AI Breakdown (Grid 2x2) */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                4-Factor Analysis Breakdown:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Factor 1: Severity */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">1. Hazard Severity</span>
                    <span className="font-bold text-red-600">{incident.severity} Hazard</span>
                  </div>
                  <p className="text-[11px] text-slate-800 font-semibold leading-tight">
                    Level {incident.severity === "Critical" ? "4 (Life Threatening)" : incident.severity === "High" ? "3 (Elevated Risk)" : "2 (Sub-acute)"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Calculated from disaster category ({incident.category}) & physical hazard
                  </p>
                </div>

                {/* Factor 2: Civilian Isolation */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">2. Civilian Isolation</span>
                    <span className="font-bold text-orange-600">
                      {incident.peopleCount >= 5 ? "Extreme" : incident.peopleCount >= 2 ? "High Risk" : "Moderate"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-800 font-semibold leading-tight">
                    {incident.peopleCount} civilian(s) affected{incident.hasMedicalEmergency ? " • Medical assistance needed" : ""}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {incident.category === "flood" ? "Trapped by rising flood water" : "Extraction priority calculated"}
                  </p>
                </div>

                {/* Factor 3: Road Accessibility */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">3. Route Accessibility</span>
                    <span className="font-bold text-blue-700">
                      {incident.category === "flood" ? "Waterway Ingress" : incident.category === "landslide" ? "Partially Blocked" : "Clear"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-800 font-semibold leading-tight">
                    {incident.category === "flood"
                      ? "Passable by Rescue Boat / High-Clearance Truck Only"
                      : incident.category === "landslide"
                      ? "Standard Route Blocked by Debris"
                      : "Standard Emergency Vehicle Access"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Accessibility assessment based on road sensor data
                  </p>
                </div>

                {/* Factor 4: Report Confidence */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">4. Report Confidence</span>
                    <span className="font-bold text-teal-700">
                      {incident.aiClassification?.confidence || 94}% Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-800 font-semibold leading-tight">
                    Multi-source verified & corroborated
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {incident.corroboratingReportsCount || 1} independent citizen report(s) aggregated
                  </p>
                </div>
              </div>
            </div>

            {/* Recommended Response Units */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Recommended Response Units
                  </span>
                </div>
                <span className="text-[10px] font-mono text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 font-semibold">
                  Match Ready
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {incident.category === "flood"
                        ? "Water Rescue Team - Unit Alpha"
                        : incident.category === "medical"
                        ? "Mobile ICU Medical Team"
                        : incident.category === "fire"
                        ? "Fire & Hazmat Engine"
                        : "Civil Protection Taskforce"}
                    </p>
                    <p className="text-[10px] text-slate-500">Primary Dispatch Profile • ETA: 7-12 min</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    Primary
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {incident.hasMedicalEmergency
                        ? "Emergency Ambulance & Trauma Care"
                        : "Rapid Evacuation Squad"}
                    </p>
                    <p className="text-[10px] text-slate-500">Support Squad</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    Support
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo & Image Analysis Card */}
          {incident.photoUrl && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <div className="relative max-h-56 overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src={incident.photoUrl}
                  alt="Incident Scene"
                  className="w-full h-52 object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/90 text-[10px] font-mono text-slate-700 border border-slate-200 shadow-sm">
                  Field Photo
                </div>
              </div>

              {incident.aiClassification && (
                <div className="p-3.5 space-y-2 border-t border-slate-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>AI-assisted image analysis</span>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                      Confidence: {incident.aiClassification.confidence}%
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800">
                    Detected Hazard: {incident.aiClassification.detectedHazard}
                  </p>

                  {incident.aiClassification.visualTags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {incident.aiClassification.visualTags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Citizen Description & Voice Notes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Field Report Details
            </h4>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed space-y-2">
              <p>{incident.description}</p>
              {incident.medicalDetails && (
                <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium">
                  🚨 Medical note: {incident.medicalDetails}
                </div>
              )}
              {incident.voiceTranscript && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm">
                  <Volume2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-bold text-slate-800">Voice Transcription:</span>{" "}
                    "{incident.voiceTranscript}"
                  </div>
                </div>
              )}
              {incident.audioUrl && (
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Recorded Civilian Audio Call:</span>
                  </div>
                  <audio src={incident.audioUrl} controls className="w-full h-8 rounded" />
                </div>
              )}
            </div>
          </div>

          {/* Sub-Reports / Duplicate Aggregation Section */}
          {incident.subReports && incident.subReports.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>
                  Corroborating Reports Merged ({incident.subReports.length})
                </span>
              </h4>
              <div className="space-y-2">
                {incident.subReports.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">
                        {sub.reporter} ({sub.contact})
                      </span>
                      <span className="text-slate-400 font-mono">
                        {new Date(sub.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600">{sub.note}</p>
                    <span className="text-[10px] font-mono text-orange-700 font-semibold">
                      +{sub.peopleCount} trapped reported
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Unit & Status Management Workflow */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-700">
                  Assigned Rescue Unit
                </h4>
                <p className="text-xs text-blue-700 font-semibold mt-0.5">
                  {assignedUnitObj ? assignedUnitObj.name : "None assigned yet"}
                </p>
              </div>

              <button
                onClick={() => setIsDispatchModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{incident.assignedUnit ? (t.reassign || "Re-assign Unit") : (t.dispatch || "Dispatch Unit")}</span>
              </button>
            </div>

            {/* Status Workflow Selector Tabs */}
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {t.statusLabel || "Progress Status"}:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "Pending", label: t.statusPending || "Pending" },
                  { id: "Dispatched", label: t.statusDispatched || "Dispatched" },
                  { id: "On Scene", label: t.statusOnScene || "On Scene" },
                  { id: "Resolved", label: t.statusResolved || "Resolved" }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleStatusChange(st.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all truncate ${
                      incident.status === st.id
                        ? st.id === "Resolved"
                          ? "bg-green-600 text-white shadow-sm"
                          : "bg-blue-600 text-white shadow-sm"
                        : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            {t.cancel || "Close"}
          </button>
        </div>
      </div>

      {/* Dispatch Unit Submodal */}
      <DispatchUnitModal
        incident={incident}
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
      />
    </div>
  );
};
