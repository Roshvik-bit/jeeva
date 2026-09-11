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
      // Restore connection & trigger sync
      toggleOnlineStatus(true);
      setIsSyncing(true);
      setTimeout(async () => {
        await syncOfflineReports();
        setIsSyncing(false);
      }, 500);
    } else {
      setIsSyncing(true);
      await syncOfflineReports();
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-rose-500/40 sm:rounded-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md mb-4 transition-all animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
            <WifiOff className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white font-mono">
                {!isOnline
                  ? "🔴 Offline - Report will be saved and synced when connection returns"
                  : "🟢 Connection Restored - Syncing Local Queue"}
              </span>
              {offlineOutbox.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {offlineOutbox.length} Queued Locally
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {!isOnline
                ? "Full device storage active (IndexedDB). No internet connection required to broadcast SOS."
                : "Uploading encrypted local distress alerts to Rescue Command cloud."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-end">
          {offlineOutbox.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <span>{isExpanded ? "Hide Queue" : "View Outbox"}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{!isOnline ? "Restore Connection" : isSyncing ? "Synchronizing..." : "Sync Now"}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar when Synchronizing */}
      {isSyncing && (
        <div className="mt-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 mb-1">
            <span>Uploading distress telemetry to central rescue cloud...</span>
            <span className="animate-pulse">Active</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse w-full" />
          </div>
        </div>
      )}

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
