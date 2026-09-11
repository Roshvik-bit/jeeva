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
          color: "bg-green-50 text-green-700 border-green-200",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />,
          label: t.statusResolved
        };
      case "On Scene":
        return {
          color: "bg-teal-50 text-teal-700 border-teal-200",
          icon: <Truck className="w-3.5 h-3.5 text-teal-600" />,
          label: t.statusOnScene
        };
      case "Dispatched":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <Truck className="w-3.5 h-3.5 text-blue-600 animate-bounce" />,
          label: t.statusDispatched
        };
      case "Pending Sync":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />,
          label: "Offline / Pending Sync"
        };
      case "Pending":
      default:
        return {
          color: "bg-red-50 text-red-700 border-red-200",
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-600" />,
          label: t.statusPending
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.myReports}</h3>
              <p className="text-[11px] text-slate-500">Live rescue dispatch tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {myReports.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <FileText className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
              <p className="text-xs">{t.noReportsYet}</p>
            </div>
          ) : (
            myReports.map((rep) => {
              const status = getStatusBadge(rep.status);
              return (
                <div
                  key={rep.id || rep.localId}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 hover:border-slate-300 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-500 font-bold tracking-wider">
                        #{rep.id || rep.localId}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {rep.title || rep.category || "Emergency Report"}
                      </h4>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.color}`}
                    >
                      {status.icon}
                      <span>{status.label}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {rep.description || rep.medicalDetails || "Emergency distress signal tagged."}
                  </p>

                  {rep.photoUrl && (
                    <div className="pt-1">
                      <img
                        src={rep.photoUrl}
                        alt="Submitted Field Photo"
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  )}

                  {rep.audioUrl && (
                    <div className="pt-1 space-y-1">
                      <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                        <span>🎙️ Voice Distress Note:</span>
                      </span>
                      <audio src={rep.audioUrl} controls className="w-full h-7 rounded" />
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 font-mono space-y-0.5 pt-2 border-t border-slate-100">
                    <p>📍 {rep.location?.address || "GPS Location Tagged"}</p>
                    <p>👥 Affected: {rep.peopleCount || 1} person(s)</p>
                    {rep.assignedUnit && (
                      <p className="text-blue-700 font-sans font-semibold">
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
