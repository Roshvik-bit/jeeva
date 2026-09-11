import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useEmergency } from "../../context/EmergencyContext";
import { Maximize2, Layers, Compass, Filter, RefreshCw } from "lucide-react";

export const IncidentMapView = ({ onSelectIncident, selectedIncidentId, onQuickDispatch }) => {
  const { incidents, rescueUnits, t } = useEmergency();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const unitsLayerRef = useRef(null);
  const dangerZonesLayerRef = useRef(null);

  const [showRescueUnits, setShowRescueUnits] = useState(true);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [mapStyle, setMapStyle] = useState("streets"); // "streets" | "satellite" | "hot"
  const tileLayerRef = useRef(null);

  // Helper to get tile layer options based on OpenStreetMap style
  const getTileConfig = (style) => {
    if (style === "satellite") {
      return {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, USGS, Maxar",
        maxZoom: 19
      };
    }

    if (style === "hot") {
      return {
        url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles: <a href="https://www.hotosm.org/">Humanitarian OSM</a>',
        subdomains: "abc",
        maxZoom: 19
      };
    }

    // Default: Clean Standard OpenStreetMap (100% Free, NO API KEY, Clean Natural Colors)
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: "abc",
      maxZoom: 19
    };
  };

  // Switch Tile Layer when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = getTileConfig(mapStyle);
    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: config.subdomains || "abc",
      tileSize: config.tileSize || 256,
      zoomOffset: config.zoomOffset || 0,
      className: config.className || "",
      maxZoom: config.maxZoom || 19
    });

    // Fallback on tile error to standard OpenStreetMap
    newTileLayer.on("tileerror", () => {
      console.warn("Tile layer error, falling back to standard OpenStreetMap");
    });

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // Initialize Leaflet Map with container lifecycle management & resize observers
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Reset container leaflet ID to prevent React StrictMode remount crashes
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    // Initial center on disaster operations area
    const map = L.map(container, {
      center: [13.075, 80.265],
      zoom: 13,
      zoomControl: false
    });

    // Initial tile layer (Tactical Dark OSM)
    const config = getTileConfig(mapStyle);
    const initialTiles = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: config.subdomains || "abc",
      tileSize: config.tileSize || 256,
      zoomOffset: config.zoomOffset || 0,
      className: config.className || "",
      maxZoom: config.maxZoom || 19
    }).addTo(map);

    tileLayerRef.current = initialTiles;

    // Zoom control in bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Create Layer Groups
    const dangerZones = L.layerGroup().addTo(map);
    const markers = L.layerGroup().addTo(map);
    const units = L.layerGroup().addTo(map);

    dangerZonesLayerRef.current = dangerZones;
    markersLayerRef.current = markers;
    unitsLayerRef.current = units;
    mapInstanceRef.current = map;

    // Invalidate size on mount to eliminate gray boxes from layout delays
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 500);

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(container);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      if (container) {
        container._leaflet_id = null;
      }
    };
  }, []);

  // Update Markers when incidents or units change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const dangerZonesLayer = dangerZonesLayerRef.current;
    const unitsLayer = unitsLayerRef.current;

    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    dangerZonesLayer.clearLayers();
    unitsLayer.clearLayers();

    // 1. Plot Incidents
    incidents.forEach((inc) => {
      if (!inc.location?.lat || !inc.location?.lng) return;

      const isSelected = selectedIncidentId === inc.id;
      const isCritical = inc.severity === "Critical" && inc.status !== "Resolved";
      const isResolved = inc.status === "Resolved";

      // Marker color palette
      let pinColor = "#f59e0b"; // Medium = amber
      let glowClass = "";
      if (isResolved) {
        pinColor = "#10b981"; // Emerald
      } else if (inc.severity === "Critical") {
        pinColor = "#ef4444"; // Rose/Red
        glowClass = "animate-radar";
      } else if (inc.severity === "High") {
        pinColor = "#f97316"; // Orange
      } else if (inc.severity === "Low") {
        pinColor = "#38bdf8"; // Blue
      }

      // Custom HTML Marker with pulse effect
      const customIcon = L.divIcon({
        className: "custom-incident-pin",
        html: `
          <div style="position: relative; width: 34px; height: 34px; cursor: pointer;">
            ${isCritical
            ? `<div style="position: absolute; inset: -6px; border-radius: 9999px; background: rgba(239, 68, 68, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ""
          }
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 9999px;
              background-color: ${pinColor};
              border: 2px solid #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 800;
              font-size: 11px;
              font-family: monospace;
              transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
              transition: transform 0.2s ease;
            ">
              ${inc.priorityScore || "!"}
            </div>
            ${(inc.corroboratingReportsCount || 1) > 1
            ? `<div style="position: absolute; top: -4px; right: -4px; background: #0f172a; border: 1px solid #f59e0b; color: #f59e0b; border-radius: 9999px; width: 16px; height: 16px; font-size: 9px; font-weight: bold; display: flex; align-items: center; justify-content: center;">${inc.corroboratingReportsCount}</div>`
            : ""
          }
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const marker = L.marker([inc.location.lat, inc.location.lng], { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div style="padding: 12px; font-family: system-ui, -apple-system, sans-serif; width: 240px; color: #1F2937;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${pinColor}; letter-spacing: 0.05em;">
              ${inc.severity} • ${inc.category}
            </span>
            <span style="font-size: 10px; font-family: monospace; font-weight: 700; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #334155; border: 1px solid #e2e8f0;">
              Score: ${inc.priorityScore}/10
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
            ${inc.title || inc.location?.address || "Emergency Incident"}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">
            📍 ${inc.location?.address || "Disaster Zone"}
          </p>
          <div style="display: flex; gap: 8px; font-size: 11px; color: #475569; margin-bottom: 10px; font-weight: 600;">
            <span>👥 ${inc.peopleCount} people</span>
            ${inc.hasMedicalEmergency ? '<span style="color: #dc2626;">🚨 Medical needed</span>' : ""}
          </div>
          <button id="btn-inspect-${inc.id}" style="
            width: 100%;
            padding: 7px 10px;
            background: #1976D2;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          ">
            View Incident Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("popupopen", (e) => {
        const popupEl = e.popup?.getElement();
        const btn = popupEl ? popupEl.querySelector("button") : document.getElementById(`btn-inspect-${inc.id}`);
        if (btn) {
          btn.onclick = (event) => {
            if (event) event.stopPropagation();
            onSelectIncident(inc);
          };
        }
      });

      // Also trigger onSelectIncident when clicking the marker itself
      marker.on("click", () => {
        onSelectIncident(inc);
      });

      marker.addTo(markersLayer);

      // Plot Danger Zone Circles around critical water or hazard areas
      if (showDangerZones && isCritical) {
        L.circle([inc.location.lat, inc.location.lng], {
          radius: 350,
          color: "#ef4444",
          fillColor: "#ef4444",
          fillOpacity: 0.15,
          weight: 1,
          dashArray: "4, 6"
        }).addTo(dangerZonesLayer);
      }
    });

    // 2. Plot Rescue Units
    if (showRescueUnits) {
      rescueUnits.forEach((unit) => {
        const isDispatched = unit.status !== "Available";
        const unitIcon = L.divIcon({
          className: "custom-unit-pin",
          html: `
            <div style="
              width: 28px;
              height: 28px;
              border-radius: 8px;
              background-color: ${isDispatched ? "#6366f1" : "#0284c7"};
              border: 1.5px solid #ffffff;
              box-shadow: 0 4px 8px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: 12px;
            ">
              🚒
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const unitMarker = L.marker([unit.lat, unit.lng], { icon: unitIcon });
        unitMarker.bindPopup(`
          <div style="padding: 10px; font-family: system-ui, -apple-system, sans-serif; width: 220px; color: #1F2937;">
            <span style="font-size: 10px; font-weight: 700; color: #0284c7; text-transform: uppercase;">
              ${unit.type} • ${unit.status}
            </span>
            <h4 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 4px 0;">
              ${unit.name}
            </h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
              Base: ${unit.baseLocation}
            </p>
            <p style="font-size: 11px; color: #334155; font-family: monospace;">
              📞 ${unit.contact}
            </p>
          </div>
        `);
        unitMarker.addTo(unitsLayer);
      });
    }
  }, [incidents, rescueUnits, selectedIncidentId, showRescueUnits, showDangerZones, onSelectIncident]);

  // Center on selected incident if requested
  useEffect(() => {
    if (selectedIncidentId && mapInstanceRef.current) {
      const target = incidents.find((i) => i.id === selectedIncidentId);
      if (target?.location?.lat && target?.location?.lng) {
        mapInstanceRef.current.flyTo([target.location.lat, target.location.lng], 15, {
          duration: 1.2
        });
      }
    }
  }, [selectedIncidentId, incidents]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([13.075, 80.265], 13, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Controls Floating Overlay */}
      <div className="absolute top-3 left-3 z-[20] flex flex-wrap items-center gap-2">
        {/* Layer Filters: Danger Zones & Responders */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1.5 flex items-center gap-1 shadow-md">
          <button
            onClick={() => setShowDangerZones(!showDangerZones)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showDangerZones
                ? "bg-red-50 text-red-700 border border-red-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span>Danger Zones</span>
          </button>

          <button
            onClick={() => setShowRescueUnits(!showRescueUnits)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showRescueUnits
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span>🚒 Responders</span>
          </button>
        </div>

        {/* Map Imagery Style Switcher */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-1 flex items-center gap-1 shadow-md">
          <button
            onClick={() => setMapStyle("streets")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapStyle === "streets" || mapStyle === "osm"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Standard OpenStreetMap (100% Free & Open Source)"
          >
            🗺️ Map
          </button>

          <button
            onClick={() => setMapStyle("hot")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapStyle === "hot"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="Humanitarian OpenStreetMap Layer"
          >
            🚑 Humanitarian
          </button>

          <button
            onClick={() => setMapStyle("satellite")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapStyle === "satellite"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title="High-Resolution Satellite Aerial View"
          >
            🛰️ Satellite
          </button>
        </div>

        <button
          onClick={handleResetView}
          title="Reset Map Center"
          className="p-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 shadow-md hover:bg-slate-50 transition-colors"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Legend Card in Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[20] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-2.5 shadow-md hidden sm:block">
        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          {t.categoryLabel || "Incident Severity"}
        </p>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-700">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span>{t.criticalCard || "Critical"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>{t.highPriorityCard || "High"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
            <span>{t.statusResolved || "Resolved"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
