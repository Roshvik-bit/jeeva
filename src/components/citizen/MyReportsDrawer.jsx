import React from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { FileText, Clock, CheckCircle2, Truck, AlertCircle, X, ExternalLink } from "lucide-react";

export const MyReportsDrawer = ({ isOpen, onClose }) => {
  const { myReports, t } = useEmergency();

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved":
        return {
          color: "bg-emerald-950 text-emerald-300 border-emerald-500/40",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: t.statusResolved
        };
      case "On Scene":
        return {
          color: "bg-cyan-950 text-cyan-300 border-cyan-500/40",
          icon: <Truck className="w-3.5 h-3.5 text-cyan-400" />,
          label: t.statusOnScene
        };
      case "Dispatched":
        return {
          color: "bg-indigo-950 text-indigo-300 border-indigo-500/40",
          icon: <Truck className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />,
          label: t.statusDispatched
        };
      case "Pending Sync":
        return {
          color: "bg-amber-950 text-amber-300 border-amber-500/40",
          icon: <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
          label: "Offline / Pending Sync"
        };
      case "Pending":
      default:
        return {
          color: "bg-rose-950 text-rose-300 border-rose-500/40",
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
          label: t.statusPending
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t.myReports}</h3>
              <p className="text-[11px] text-slate-400">Live rescue dispatch tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {myReports.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <FileText className="w-12 h-12 stroke-[1.5] mb-2 text-slate-600" />
              <p className="text-xs">{t.noReportsYet}</p>
            </div>
          ) : (
            myReports.map((rep) => {
              const status = getStatusBadge(rep.status);
              return (
                <div
                  key={rep.id || rep.localId}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-rose-400 font-bold tracking-wider">
                        #{rep.id || rep.localId}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200 capitalize">
                        {rep.category || "Emergency SOS"}
                      </h4>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.color}`}
                    >
                      {status.icon}
                      <span>{status.label}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {rep.description || rep.medicalDetails || "Emergency distress signal tagged."}
                  </p>

                  <div className="text-[11px] text-slate-500 font-mono space-y-0.5 pt-1 border-t border-slate-900">
                    <p>📍 {rep.location?.address || "GPS Location Tagged"}</p>
                    <p>👥 Affected: {rep.peopleCount || 1} person(s)</p>
                    {rep.assignedUnit && (
                      <p className="text-indigo-400 font-sans font-semibold">
                        🚒 Unit: {rep.assignedUnit}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
