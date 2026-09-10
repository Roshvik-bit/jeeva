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
  const { updateIncidentStatus, rescueUnits } = useEmergency();
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  if (!isOpen || !incident) return null;

  const assignedUnitObj = rescueUnits.find((u) => u.id === incident.assignedUnit);

  const handleStatusChange = (newStatus) => {
    updateIncidentStatus(incident.id, newStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono tracking-wider ${
                incident.severity === "Critical"
                  ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                  : incident.severity === "High"
                  ? "bg-orange-950 text-orange-300 border border-orange-500/40"
                  : "bg-amber-950 text-amber-300 border border-amber-500/40"
              }`}
            >
              {incident.severity} SEVERITY
            </span>
            <span className="font-mono text-xs font-bold text-slate-400">
              #{incident.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Title & Location Header */}
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
              {incident.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {incident.location?.address}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Priority Score */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Priority Score</p>
              <p className="text-xl font-black font-mono text-rose-400 mt-0.5">
                {incident.priorityScore}/100
              </p>
            </div>

            {/* Trapped Victims */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Civilians Trapped</p>
              <p className="text-xl font-black font-mono text-amber-400 mt-0.5">
                {incident.peopleCount}
              </p>
            </div>

            {/* Corroborations */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Reports Merged</p>
              <p className="text-xl font-black font-mono text-cyan-400 mt-0.5">
                {incident.corroboratingReportsCount || 1}
              </p>
            </div>

            {/* Status */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
              <p className="text-xs font-bold font-mono text-indigo-300 mt-1.5 uppercase">
                {incident.status}
              </p>
            </div>
          </div>

          {/* Photo & Edge AI Vision Analysis Card */}
          {incident.photoUrl && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden">
              <div className="relative max-h-56 overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={incident.photoUrl}
                  alt="Disaster Scene"
                  className="w-full h-52 object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-700">
                  FIELD PHOTO TELEMETRY
                </div>
              </div>

              {incident.aiClassification && (
                <div className="p-3.5 space-y-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Edge Computer Vision Assessment</span>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                      AI Confidence: {incident.aiClassification.confidence}%
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-200">
                    Detected Hazard: {incident.aiClassification.detectedHazard}
                  </p>

                  {incident.aiClassification.visualTags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {incident.aiClassification.visualTags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
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

          {/* Priority Score Mathematical Breakdown */}
          {incident.scoreBreakdown && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                <span>Smart Priority Score Calculation Breakdown</span>
              </h4>
              <p className="text-xs text-slate-400 font-mono leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {incident.scoreBreakdown.explanation}
              </p>
            </div>
          )}

          {/* Citizen Description & Voice Notes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Field Report Narrative
            </h4>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed space-y-2">
              <p>{incident.description}</p>
              {incident.medicalDetails && (
                <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-200">
                  <strong>🚨 Medical Urgency:</strong> {incident.medicalDetails}
                </div>
              )}
              {incident.voiceTranscript && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <Volume2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-bold text-slate-200">Voice Transcription:</span>{" "}
                    "{incident.voiceTranscript}"
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sub-Reports / Duplicate Aggregation Section */}
          {incident.subReports && incident.subReports.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>
                  Corroborating Reports Merged into this Epicenter ({incident.subReports.length})
                </span>
              </h4>
              <div className="space-y-2">
                {incident.subReports.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-200">
                        {sub.reporter} ({sub.contact})
                      </span>
                      <span className="text-slate-500 font-mono">
                        {new Date(sub.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400">{sub.note}</p>
                    <span className="text-[10px] font-mono text-amber-400 font-semibold">
                      +{sub.peopleCount} trapped reported
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Unit & Status Management Workflow */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-300">
                  Assigned Rescue Unit
                </h4>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                  {assignedUnitObj ? assignedUnitObj.name : "None assigned yet"}
                </p>
              </div>

              <button
                onClick={() => setIsDispatchModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{incident.assignedUnit ? "Re-assign Unit" : "Dispatch Unit"}</span>
              </button>
            </div>

            {/* Status Workflow Selector Tabs */}
            <div className="pt-2 border-t border-slate-900 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Progress Status Workflow:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {["Pending", "Dispatched", "On Scene", "Resolved"].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      incident.status === st
                        ? st === "Resolved"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40"
                          : "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Close Inspector
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
