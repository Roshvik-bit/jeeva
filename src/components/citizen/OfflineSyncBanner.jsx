import React, { useState } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { WifiOff, RefreshCw, ChevronDown, ChevronUp, Database, CheckCircle } from "lucide-react";

export const OfflineSyncBanner = () => {
  const { isOnline, offlineOutbox, syncOfflineReports, toggleOnlineStatus, t } = useEmergency();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (offlineOutbox.length === 0 && isOnline) {
    return null;
  }

  const handleManualSync = async () => {
    if (!isOnline) {
      // Prompt reconnect
      toggleOnlineStatus(true);
    } else {
      setIsSyncing(true);
      await syncOfflineReports();
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-y sm:border sm:rounded-xl border-amber-500/40 p-3 sm:p-4 shadow-lg backdrop-blur-md mb-4 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-amber-200">
                {!isOnline ? "Offline Mode Active" : "Pending Outbox Synchronizing"}
              </span>
              {offlineOutbox.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 shadow-sm">
                  {offlineOutbox.length} {t.pendingSyncBadge}
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-amber-300/80 mt-0.5">
              {!isOnline
                ? "Reports stored on your device. Will auto-sync when online."
                : "Network active. Ready to upload pending distress calls."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-end">
          {offlineOutbox.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-1"
            >
              <span>{isExpanded ? "Hide Queue" : "View Outbox"}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/30 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{!isOnline ? "Reconnect & Sync" : isSyncing ? "Syncing..." : t.syncNow}</span>
          </button>
        </div>
      </div>

      {/* Expandable Outbox List */}
      {isExpanded && offlineOutbox.length > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-2">
          <p className="text-[11px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Queued Offline Reports (Encrypted on Local Device)</span>
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {offlineOutbox.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-bold text-slate-200 capitalize">
                    {item.category || "Emergency SOS"}
                  </span>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.location?.address || "GPS Location Tagged"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  <span>PENDING SYNC</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
