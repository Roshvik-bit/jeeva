import React, { useState } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { Truck, Check, X, ShieldAlert, Sparkles, Navigation } from "lucide-react";

export const DispatchUnitModal = ({ incident, isOpen, onClose }) => {
  const { rescueUnits, dispatchRescueUnit } = useEmergency();
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  if (!isOpen || !incident) return null;

  const handleConfirmDispatch = () => {
    if (!selectedUnitId) return;
    dispatchRescueUnit(incident.id, selectedUnitId);
    onClose();
  };

  // Sort units so matching capability appears first
  const recommendedType = incident.recommendedResource || "Rescue Boat";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Dispatch Rescue Responder</h3>
              <p className="text-[11px] text-slate-400">
                Incident #{incident.id} • {incident.category.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Target Incident Profile */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 truncate">
                {incident.title}
              </span>
              <span className="font-mono text-xs font-black text-rose-400">
                Score: {incident.priorityScore}/100
              </span>
            </div>
            <p className="text-xs text-slate-400">📍 {incident.location?.address}</p>

            {/* Smart Recommendation Tag */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-900 text-xs text-indigo-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Resource Match: {recommendedType} Recommended</span>
            </div>
          </div>

          {/* Available Units List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Response Unit for Assignment:
            </label>

            <div className="space-y-2">
              {rescueUnits.map((unit) => {
                const isRecommended = unit.type === recommendedType;
                const isSelected = selectedUnitId === unit.id;
                const isAvailable = unit.status === "Available";

                return (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedUnitId(unit.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-950/50"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-100">{unit.name}</h4>
                          {isRecommended && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                              RECOMMENDED MATCH
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Base: {unit.baseLocation} • {unit.personnelCount} Crew Members
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isAvailable
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                              : "bg-amber-950 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {unit.status}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "border-slate-700"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {/* Capabilities Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {unit.capabilities.map((cap, cIdx) => (
                        <span
                          key={cIdx}
                          className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedUnitId}
            onClick={handleConfirmDispatch}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4" />
            <span>Confirm & Dispatch Unit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
