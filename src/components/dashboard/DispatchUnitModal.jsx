import React, { useState } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { Truck, Check, X, ShieldAlert, Sparkles, Navigation } from "lucide-react";

export const DispatchUnitModal = ({ incident, isOpen, onClose }) => {
  const { rescueUnits, dispatchRescueUnit, t } = useEmergency();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dispatch Rescue Team</h3>
              <p className="text-[11px] text-slate-500">
                Incident #{incident.id} • {incident.category.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Target Incident Profile */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 truncate">
                {incident.title}
              </span>
              <span className="font-mono text-xs font-bold text-red-600">
                Score: {incident.priorityScore}/10
              </span>
            </div>
            <p className="text-xs text-slate-600">📍 {incident.location?.address}</p>

            {/* Smart Recommendation Tag */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-xs text-blue-700 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Recommended Match: {recommendedType}</span>
            </div>
          </div>

          {/* Available Units List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Response Unit:
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
                        ? "bg-blue-50 border-blue-600 ring-1 ring-blue-600 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{unit.name}</h4>
                          {isRecommended && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                              MATCH
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Base: {unit.baseLocation} • {unit.personnelCount} Crew Members
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isAvailable
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {unit.status}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-300 bg-white"
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
                          className="text-[10px] bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
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
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            {t.cancel || "Cancel"}
          </button>

          <button
            type="button"
            disabled={!selectedUnitId}
            onClick={handleConfirmDispatch}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4" />
            <span>{t.confirmDispatch || "Confirm & Dispatch"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
