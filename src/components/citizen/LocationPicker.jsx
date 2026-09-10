import React, { useState, useEffect } from "react";
import { geoService, LANDMARK_PRESETS } from "../../services/geoService";
import { MapPin, Navigation, Compass, CheckCircle2 } from "lucide-react";

export const LocationPicker = ({ location, setLocation }) => {
  const [isLocating, setIsLocating] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handleAutoDetect = async () => {
    setIsLocating(true);
    try {
      const coords = await geoService.getCurrentCoordinates();
      const address = geoService.getReadableAddress(coords.lat, coords.lng);
      setLocation({
        lat: coords.lat,
        lng: coords.lng,
        address: address,
        landmark: coords.isSimulated ? "Simulated Grid Pin" : "GPS Triangulated",
        accuracy: coords.accuracy
      });
    } catch (err) {
      console.error("GPS detection error:", err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setLocation({
      lat: preset.lat,
      lng: preset.lng,
      address: preset.name,
      landmark: "Disaster Sector Checkpoint",
      accuracy: 8
    });
    setShowPresets(false);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-rose-500" />
          <span>GPS Coordinates & Location</span>
        </label>
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={isLocating}
          className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20"
        >
          <Navigation className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? "Acquiring..." : "Auto-Detect GPS"}</span>
        </button>
      </div>

      {/* Coordinate & Address Preview Card */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-xs">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{location.address || "Fetching address..."}</span>
            </p>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>LAT: {location.lat?.toFixed(4) || "13.0827"}</span>
              <span>LNG: {location.lng?.toFixed(4) || "80.2707"}</span>
              {location.accuracy && (
                <span className="text-[10px] text-slate-500">±{location.accuracy}m</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[11px] font-medium text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 shrink-0"
          >
            {showPresets ? "Close" : "Landmarks"}
          </button>
        </div>

        {/* Quick Disaster Zone Landmark Selector */}
        {showPresets && (
          <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-1.5 animate-fadeIn">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Quick Pick Known Disaster Hotspots:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {LANDMARK_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="text-left px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white truncate transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
