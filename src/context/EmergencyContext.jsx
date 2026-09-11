import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PRESEEDED_INCIDENTS } from "../mockData/preseededIncidents";
import { RESCUE_UNITS } from "../mockData/rescueUnits";
import { translations } from "../mockData/translations";
import { storageService } from "../services/storageService";
import { mockAiClassifier } from "../services/mockAiClassifier";
import { calculatePriorityScore } from "../services/priorityScoring";
import { duplicateDetector } from "../services/duplicateDetector";
import { geoService } from "../services/geoService";

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
  // Portal & View State
  const [activePortal, setActivePortal] = useState("landing"); // "landing" | "citizen" | "dashboard"
  const [language, setLanguage] = useState("en");
  const [isOnline, setIsOnline] = useState(true);

  // Core Data Stores
  const [incidents, setIncidents] = useState(() => {
    const saved = storageService.getIncidents();
    const list = saved && saved.length > 0 ? saved : PRESEEDED_INCIDENTS;
    return list.map((inc) => ({
      ...inc,
      priorityScore: inc.priorityScore > 10 ? Number((inc.priorityScore / 10).toFixed(1)) : inc.priorityScore
    }));
  });

  const [offlineOutbox, setOfflineOutbox] = useState(() => {
    return storageService.getOfflineOutbox();
  });

  const [myReports, setMyReports] = useState(() => {
    return storageService.getUserReports();
  });

  const [rescueUnits, setRescueUnits] = useState(RESCUE_UNITS);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, duration: 4500, ...toast }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save incidents to storage when modified
  useEffect(() => {
    storageService.saveIncidents(incidents);
  }, [incidents]);

  // Audio Siren generator using Web Audio API
  const playEmergencyAudio = useCallback((toneType = "siren") => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (toneType === "siren") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        gain.gain.setValueAtTime(0.12, ctx.currentTime);

        // Siren frequency modulation
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 0.35);
        osc.frequency.linearRampToValueAtTime(650, ctx.currentTime + 0.7);
        osc.frequency.linearRampToValueAtTime(950, ctx.currentTime + 1.05);

        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.4);
      } else if (toneType === "beep") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (err) {
      console.warn("Web Audio playback prevented by browser policy:", err);
    }
  }, []);

  // Synchronize queued offline reports to the cloud/master store
  const syncOfflineReports = useCallback(async () => {
    const queue = await storageService.getOfflineOutboxAsync();
    if (!queue || queue.length === 0) return;

    addToast({
      type: "info",
      title: "Sync Initiated",
      message: `Uploading ${queue.length} offline distress report(s) to Rescue Command...`
    });

    let currentIncidents = [...incidents];
    let newlySyncedCount = 0;
    let mediaSyncedCount = 0;

    for (const report of queue) {
      // 1. Reconstitute playable audio Blob URL from audioBase64
      let restoredAudioUrl = report.audioUrl;
      if (report.audioBase64) {
        restoredAudioUrl = storageService.base64ToBlobUrl(report.audioBase64, report.audioMimeType || "audio/webm");
      }

      if (report.photoUrl || report.audioBase64 || restoredAudioUrl) {
        mediaSyncedCount++;
      }

      // 2. Run AI vision classification if not already done
      let aiResult = report.aiClassification;
      if (!aiResult && report.photoUrl) {
        aiResult = await mockAiClassifier.classifyDisasterImage(
          report.photoUrl,
          report.category,
          report.hasMedicalEmergency
        );
      }

      // 3. Check for duplicate/corroborating cluster
      const dupCheck = duplicateDetector.processIncomingReport(
        { ...report, audioUrl: restoredAudioUrl, aiClassification: aiResult },
        currentIncidents
      );

      let resultingIncidentId;

      if (dupCheck.isDuplicate) {
        // Update the existing cluster
        currentIncidents = currentIncidents.map((inc) =>
          inc.id === dupCheck.matchedIncidentId ? dupCheck.updatedIncident : inc
        );
        resultingIncidentId = dupCheck.matchedIncidentId;
      } else {
        // Create new incident
        const scored = calculatePriorityScore({
          ...report,
          aiClassification: aiResult,
          corroboratingReportsCount: 1
        });

        const newIncident = {
          id: "INC-2026-" + Math.floor(100 + Math.random() * 900),
          title: report.title || `${report.category.toUpperCase()} Distress Alert at ${report.location.address}`,
          category: report.category,
          severity: scored.severity,
          status: "Pending",
          timestamp: report.timestamp || new Date().toISOString(),
          location: report.location,
          peopleCount: report.peopleCount || 1,
          hasMedicalEmergency: report.hasMedicalEmergency || false,
          medicalDetails: report.medicalDetails || "",
          description: report.description || "Field emergency alert logged by citizen.",
          photoUrl: report.photoUrl || null,
          aiClassification: aiResult,
          voiceTranscript: report.voiceTranscript || "",
          audioUrl: restoredAudioUrl,
          audioBase64: report.audioBase64 || null,
          isOfflineSync: true,
          syncedAt: new Date().toISOString(),
          recommendedResource: aiResult?.recommendedResource || "Rescue Boat",
          assignedUnit: null,
          priorityScore: scored.priorityScore,
          scoreBreakdown: scored.scoreBreakdown,
          corroboratingReportsCount: 1,
          subReports: []
        };

        currentIncidents.unshift(newIncident);
        resultingIncidentId = newIncident.id;
      }

      // Optional remote API cloud sync if VITE_API_BASE_URL is configured
      const apiBaseUrl = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE_URL : null;
      if (apiBaseUrl) {
        try {
          await fetch(`${apiBaseUrl}/incidents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...report, syncedAt: new Date().toISOString() })
          });
        } catch (apiErr) {
          console.warn("Backend API sync warning (saved to master state):", apiErr);
        }
      }

      // Update citizen's local tracking copy
      storageService.updateUserReportStatus(report.localId, "Pending (Synced)", null);
      newlySyncedCount++;
    }

    setIncidents(currentIncidents);
    storageService.saveIncidents(currentIncidents);
    storageService.clearOfflineOutbox();
    setOfflineOutbox([]);
    setMyReports(storageService.getUserReports());

    playEmergencyAudio("beep");
    addToast({
      type: "success",
      title: "Offline Sync Complete",
      message: `Successfully synchronized ${newlySyncedCount} emergency alert(s) including ${mediaSyncedCount} photo & audio file(s) to Database!`
    });
  }, [incidents, addToast, playEmergencyAudio]);

  // Handle Online/Offline network toggle
  const toggleOnlineStatus = useCallback(
    (forcedState) => {
      const nextState = typeof forcedState === "boolean" ? forcedState : !isOnline;
      setIsOnline(nextState);

      if (nextState) {
        addToast({
          type: "success",
          title: "Network Connected",
          message: "Online telemetry restored. Connecting to Rescue Command Database."
        });
        // Auto-sync queued reports with photos and audio
        setTimeout(async () => {
          const currentOutbox = await storageService.getOfflineOutboxAsync();
          if (currentOutbox && currentOutbox.length > 0) {
            syncOfflineReports();
          }
        }, 300);
      } else {
        addToast({
          type: "warning",
          title: "Offline Mode Active",
          message: "Reports, photos, and voice recordings will be saved locally on your device."
        });
      }
    },
    [isOnline, addToast, syncOfflineReports]
  );

  // Auto-detect real browser online / offline connectivity changes
  useEffect(() => {
    const handleOnline = () => {
      console.log("Internet connection restored, triggering auto-sync...");
      toggleOnlineStatus(true);
    };

    const handleOffline = () => {
      console.log("Internet connection lost, activating offline mode...");
      toggleOnlineStatus(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOnline(false);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toggleOnlineStatus]);

  // Submit Emergency Report (Citizen action)
  const submitDistressReport = useCallback(
    async (rawReport) => {
      const timestamp = new Date().toISOString();

      if (!isOnline) {
        let audioBase64 = rawReport.audioBase64;
        // If audioBase64 is missing but audioUrl is present, attempt conversion
        if (!audioBase64 && rawReport.audioUrl) {
          try {
            const res = await fetch(rawReport.audioUrl);
            if (res.ok) {
              const blob = await res.blob();
              audioBase64 = await storageService.blobToBase64(blob);
            }
          } catch (e) {}
        }

        // Offline: save to local queue with full photo & audio persistence
        const queued = storageService.addOfflineReport({
          ...rawReport,
          audioBase64,
          timestamp
        });

        // Also add to citizen's viewable list
        storageService.addUserReport({
          id: queued.localId,
          ...queued,
          status: "Pending Sync"
        });

        setOfflineOutbox(storageService.getOfflineOutbox());
        setMyReports(storageService.getUserReports());

        playEmergencyAudio("beep");
        addToast({
          type: "warning",
          title: "Saved to Offline Outbox",
          message: "Distress report stored on device with photo and audio. Will auto-sync when network reconnects!"
        });
        return { success: true, isOffline: true, report: queued };
      }

      // Online: Real-time processing
      let aiResult = rawReport.aiClassification;
      if (!aiResult) {
        aiResult = await mockAiClassifier.classifyDisasterImage(
          rawReport.photoUrl || rawReport.category,
          rawReport.category,
          rawReport.hasMedicalEmergency
        );
      }

      const dupCheck = duplicateDetector.processIncomingReport(
        { ...rawReport, aiClassification: aiResult, timestamp },
        incidents
      );

      let finalIncidentId;
      let isMerged = false;

      if (dupCheck.isDuplicate) {
        // Merge into existing incident
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === dupCheck.matchedIncidentId ? dupCheck.updatedIncident : inc))
        );
        finalIncidentId = dupCheck.matchedIncidentId;
        isMerged = true;

        addToast({
          type: "info",
          title: "Incident Corroborated",
          message: `Your report matches an active cluster nearby (${dupCheck.distanceMeters}m away) and has boosted priority!`
        });
      } else {
        // Create new incident
        const scored = calculatePriorityScore({
          ...rawReport,
          aiClassification: aiResult,
          timestamp,
          corroboratingReportsCount: 1
        });

        const newIncident = {
          id: "INC-2026-" + Math.floor(100 + Math.random() * 900),
          title: rawReport.title || `${rawReport.category.toUpperCase()} Crisis at ${rawReport.location.address}`,
          category: rawReport.category,
          severity: scored.severity,
          status: "Pending",
          timestamp,
          location: rawReport.location,
          peopleCount: rawReport.peopleCount || 1,
          hasMedicalEmergency: rawReport.hasMedicalEmergency || false,
          medicalDetails: rawReport.medicalDetails || "",
          description: rawReport.description || "Field emergency alert logged by citizen.",
          photoUrl: rawReport.photoUrl || null,
          aiClassification: aiResult,
          voiceTranscript: rawReport.voiceTranscript || "",
          audioUrl: rawReport.audioUrl || null,
          recommendedResource: aiResult.recommendedResource || "Rescue Boat",
          assignedUnit: null,
          priorityScore: scored.priorityScore,
          scoreBreakdown: scored.scoreBreakdown,
          corroboratingReportsCount: 1,
          subReports: []
        };

        setIncidents((prev) => [newIncident, ...prev]);
        finalIncidentId = newIncident.id;
      }

      // Add to citizen personal history
      storageService.addUserReport({
        id: finalIncidentId,
        ...rawReport,
        timestamp,
        status: "Pending"
      });
      setMyReports(storageService.getUserReports());

      playEmergencyAudio("siren");
      addToast({
        type: "success",
        title: "SOS Alert Dispatched!",
        message: `Incident #${finalIncidentId} logged. Rescue teams alerted on operations map.`
      });

      return { success: true, isOffline: false, incidentId: finalIncidentId, isMerged };
    },
    [isOnline, incidents, addToast, playEmergencyAudio]
  );

  // 1-Tap Quick SOS Trigger
  const triggerQuickSOS = useCallback(async () => {
    playEmergencyAudio("siren");
    const coords = await geoService.getCurrentCoordinates();
    const address = geoService.getReadableAddress(coords.lat, coords.lng);

    const sosPayload = {
      title: "CRITICAL 1-TAP SOS DISTRESS BEACON",
      category: "flood",
      peopleCount: 2,
      hasMedicalEmergency: true,
      medicalDetails: "Immediate evacuation requested via 1-Tap Emergency SOS beacon.",
      description: "Citizen activated high-priority panic beacon. Urgent life safety response required.",
      location: {
        lat: coords.lat,
        lng: coords.lng,
        address: address,
        landmark: "GPS Beacon Tag"
      },
      photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
      voiceTranscript: "AUTOMATIC SOS: User pressed instant emergency distress button."
    };

    return await submitDistressReport(sosPayload);
  }, [submitDistressReport, playEmergencyAudio]);

  // Dispatch rescue unit to incident (Dashboard action)
  const dispatchRescueUnit = useCallback(
    (incidentId, unitId) => {
      const unit = rescueUnits.find((u) => u.id === unitId);
      const unitName = unit ? unit.name : unitId;

      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id === incidentId) {
            return {
              ...inc,
              status: "Dispatched",
              assignedUnit: unitId
            };
          }
          return inc;
        })
      );

      setRescueUnits((prev) =>
        prev.map((u) => {
          if (u.id === unitId) {
            return {
              ...u,
              status: "Dispatched",
              assignedIncidentId: incidentId
            };
          }
          return u;
        })
      );

      // Update citizen copy
      storageService.updateUserReportStatus(incidentId, "Dispatched", unitName);
      setMyReports(storageService.getUserReports());

      playEmergencyAudio("beep");
      addToast({
        type: "success",
        title: "Unit Dispatched",
        message: `${unitName} assigned and en route to Incident #${incidentId}!`
      });
    },
    [rescueUnits, addToast, playEmergencyAudio]
  );

  // Update incident status
  const updateIncidentStatus = useCallback(
    (incidentId, newStatus) => {
      let freedUnitId = null;

      setIncidents((prev) =>
        prev.map((inc) => {
          if (inc.id === incidentId) {
            if (newStatus === "Resolved" && inc.assignedUnit) {
              freedUnitId = inc.assignedUnit;
            }
            return { ...inc, status: newStatus };
          }
          return inc;
        })
      );

      if (freedUnitId) {
        setRescueUnits((prev) =>
          prev.map((u) => {
            if (u.id === freedUnitId) {
              return { ...u, status: "Available", assignedIncidentId: null };
            }
            return u;
          })
        );
      }

      // Update citizen copy
      storageService.updateUserReportStatus(incidentId, newStatus);
      setMyReports(storageService.getUserReports());

      addToast({
        type: "info",
        title: "Status Updated",
        message: `Incident #${incidentId} updated to "${newStatus}".`
      });
    },
    [addToast]
  );

  // Translation helper
  const t = { ...translations.en, ...(translations[language] || {}) };

  return (
    <EmergencyContext.Provider
      value={{
        activePortal,
        setActivePortal,
        language,
        setLanguage,
        t,
        isOnline,
        toggleOnlineStatus,
        incidents,
        offlineOutbox,
        myReports,
        rescueUnits,
        toasts,
        addToast,
        removeToast,
        submitDistressReport,
        triggerQuickSOS,
        syncOfflineReports,
        dispatchRescueUnit,
        updateIncidentStatus,
        playEmergencyAudio
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error("useEmergency must be used within an EmergencyProvider");
  }
  return context;
};
