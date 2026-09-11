import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PRESEEDED_INCIDENTS } from "../mockData/preseededIncidents";
import { RESCUE_UNITS } from "../mockData/rescueUnits";
import { translations } from "../mockData/translations";
import { storageService } from "../services/storageService";
import { mockAiClassifier } from "../services/mockAiClassifier";
import { calculatePriorityScore } from "../services/priorityScoring";
import { duplicateDetector } from "../services/duplicateDetector";
import { geoService } from "../services/geoService";
import { supabaseService } from "../services/supabaseService";

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
  // Portal & View State
  const [activePortal, setActivePortal] = useState("landing"); // "landing" | "citizen" | "dashboard"
  const [language, setLanguage] = useState("en");
  const [isOnline, setIsOnline] = useState(true);

  // Core Data Stores (Clean startup: only genuine new incidents)
  const [incidents, setIncidents] = useState(() => {
    const saved = storageService.getIncidents();
    const filteredSaved = (saved || []).filter(
      (inc) =>
        inc &&
        !inc.id.startsWith("INC-2026-00") &&
        inc.id !== "TEST-INIT-001" &&
        inc.id !== "JEEVA-2026-TEST" &&
        inc.status !== "Archived" &&
        inc.status !== "Deleted"
    );
    if (saved && saved.length !== filteredSaved.length) {
      storageService.saveIncidents(filteredSaved);
    }
    return filteredSaved.map((inc) => ({
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

  // Supabase Initial Fetch & Real-time Live Listener
  useEffect(() => {
    if (!supabaseService.isConfigured()) return;

    // 1. Initial Cloud Fetch (Only load genuine new incidents)
    supabaseService.fetchIncidents().then((cloudIncidents) => {
      if (cloudIncidents) {
        const cleanCloud = cloudIncidents.filter(
          (i) =>
            i &&
            !i.id.startsWith("INC-2026-00") &&
            i.id !== "TEST-INIT-001" &&
            i.id !== "JEEVA-2026-TEST" &&
            i.status !== "Archived" &&
            i.status !== "Deleted"
        );
        setIncidents(cleanCloud);
        storageService.saveIncidents(cleanCloud);
      }
    });

    // 2. Real-time Live WebSockets Subscription
    const unsubscribe = supabaseService.subscribeToIncidents(
      (newIncident) => {
        setIncidents((prev) => {
          if (prev.some((i) => i.id === newIncident.id)) return prev;
          return [newIncident, ...prev];
        });
        playEmergencyAudio("siren");
        addToast({
          type: "warning",
          title: "Real-time Incident Alert",
          message: `Distress alert #${newIncident.id} received in real-time from Supabase.`
        });
      },
      (updatedIncident) => {
        setIncidents((prev) =>
          prev.map((i) => (i.id === updatedIncident.id ? { ...i, ...updatedIncident } : i))
        );
      }
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [addToast, playEmergencyAudio]);

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

      // 2. Run AI multi-modal verification (statement + photo) if not already done
      let aiResult = report.aiClassification;
      if (!aiResult || aiResult.isFalseAlarm === undefined) {
        aiResult = await mockAiClassifier.verifyReport({
          title: report.title,
          description: report.description,
          voiceTranscript: report.voiceTranscript,
          category: report.category,
          hasMedicalEmergency: report.hasMedicalEmergency,
          peopleCount: report.peopleCount,
          photoUrl: report.photoUrl
        });
      }

      // Upload offline media to Supabase Storage first so database row contains only public URLs
      let syncedPhotoUrl = report.photoUrl;
      if (supabaseService.isConfigured() && syncedPhotoUrl && !syncedPhotoUrl.startsWith("http")) {
        try {
          syncedPhotoUrl = await supabaseService.uploadPhotoFile(syncedPhotoUrl, report.localId || "offline");
        } catch (e) {
          console.warn("Offline photo sync upload error:", e);
        }
      }

      let syncedAudioUrl = null;
      const offlineAudioSource = report.audioBlob || report.audioBase64 || report.audioUrl;
      if (supabaseService.isConfigured() && offlineAudioSource) {
        try {
          syncedAudioUrl = await supabaseService.uploadAudioFile(offlineAudioSource, report.localId || "offline");
        } catch (e) {
          console.warn("Offline audio sync upload error:", e);
        }
      }

      const activePlayableAudio = syncedAudioUrl || restoredAudioUrl || null;

      // 3. Check for duplicate/corroborating cluster (false alarms are never clustered)
      const dupCheck = duplicateDetector.processIncomingReport(
        { ...report, photoUrl: syncedPhotoUrl || report.photoUrl, audioUrl: activePlayableAudio, aiClassification: aiResult },
        currentIncidents
      );

      let resultingIncidentId;

      if (dupCheck.isDuplicate) {
        // Update the existing cluster
        const updatedCluster = {
          ...dupCheck.updatedIncident,
          photoUrl: syncedPhotoUrl || dupCheck.updatedIncident.photoUrl,
          audioUrl: syncedAudioUrl || dupCheck.updatedIncident.audioUrl
        };
        currentIncidents = currentIncidents.map((inc) =>
          inc.id === dupCheck.matchedIncidentId ? updatedCluster : inc
        );
        resultingIncidentId = dupCheck.matchedIncidentId;
        if (supabaseService.isConfigured()) {
          await supabaseService.updateIncident(dupCheck.matchedIncidentId, updatedCluster);
        }
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
          status: scored.isFalseAlarm ? "Resolved" : "Pending",
          timestamp: report.timestamp || new Date().toISOString(),
          location: report.location,
          peopleCount: report.peopleCount || 1,
          hasMedicalEmergency: report.hasMedicalEmergency || false,
          medicalDetails: report.medicalDetails || "",
          description: report.description || "Field emergency alert logged by citizen.",
          photoUrl: syncedPhotoUrl || report.photoUrl || null,
          aiClassification: aiResult,
          voiceTranscript: report.voiceTranscript || "",
          audioUrl: syncedAudioUrl || activePlayableAudio,
          audioBase64: null,
          isOfflineSync: true,
          syncedAt: new Date().toISOString(),
          recommendedResource: aiResult?.recommendedResource || "Rescue Boat",
          assignedUnit: null,
          priorityScore: scored.priorityScore,
          isFalseAlarm: scored.isFalseAlarm,
          isRealReport: scored.isRealReport,
          isAbsoluteEmergency: scored.isAbsoluteEmergency,
          disasterTypeTags: scored.disasterTypeTags || [],
          scoreBreakdown: scored.scoreBreakdown,
          corroboratingReportsCount: 1,
          subReports: []
        };

        currentIncidents.unshift(newIncident);
        resultingIncidentId = newIncident.id;
        if (supabaseService.isConfigured()) {
          await supabaseService.insertIncident(newIncident);
        }
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

      // Online: Real-time multi-modal AI verification (statement + photo)
      let aiResult = rawReport.aiClassification;
      if (!aiResult || aiResult.isFalseAlarm === undefined || aiResult.isInvalidImage === undefined) {
        aiResult = await mockAiClassifier.verifyReport({
          title: rawReport.title,
          description: rawReport.description,
          voiceTranscript: rawReport.voiceTranscript,
          category: rawReport.category,
          hasMedicalEmergency: rawReport.hasMedicalEmergency,
          peopleCount: rawReport.peopleCount,
          photoUrl: rawReport.photoUrl,
          fileName: rawReport.fileName || "",
          imageMetadata: rawReport.imageMetadata || {}
        });
      }

      // Generate unique incident ID upfront
      const incidentId = "INC-2026-" + Math.floor(100 + Math.random() * 900);

      // 1. Upload Photo to Supabase Storage Bucket ('incident-media') first
      let publicPhotoUrl = rawReport.photoUrl;
      if (supabaseService.isConfigured() && publicPhotoUrl && !publicPhotoUrl.startsWith("http")) {
        try {
          publicPhotoUrl = await supabaseService.uploadPhotoFile(publicPhotoUrl, incidentId);
        } catch (e) {
          console.warn("Photo storage upload notice:", e);
        }
      }

      // 2. Upload Audio Recording to Supabase Storage Bucket ('incident-media' / 'audio-reports') first
      let publicAudioUrl = null;
      const audioSource = rawReport.audioBlob || rawReport.audioUrl || rawReport.audioBase64;
      if (supabaseService.isConfigured() && audioSource) {
        try {
          publicAudioUrl = await supabaseService.uploadAudioFile(audioSource, incidentId);
        } catch (e) {
          console.warn("Audio storage upload notice:", e);
        }
      }

      // Playable audio URL locally: prefer public storage URL, or fallback to existing temporary audioUrl
      const activePlayableAudio = publicAudioUrl || rawReport.audioUrl || null;

      const dupCheck = duplicateDetector.processIncomingReport(
        { ...rawReport, photoUrl: publicPhotoUrl || rawReport.photoUrl, audioUrl: activePlayableAudio, aiClassification: aiResult, timestamp },
        incidents
      );

      const scored = calculatePriorityScore({
        ...rawReport,
        aiClassification: aiResult,
        timestamp,
        corroboratingReportsCount: 1
      });

      const assignedStatus = scored.status || (scored.isFalseAlarm ? "REJECTED" : "Pending");

      if (scored.isInvalidImage || aiResult?.isInvalidImage) {
        addToast({
          type: "warning",
          title: "Image Verification Alert",
          message: "Image does not appear to match a disaster emergency. Please upload a valid incident photo or provide a detailed text description."
        });
      }

      // Save only lightweight text URLs into the incident record (zero base64 strings to prevent 413 errors)
      const newCitizenIncident = {
        id: incidentId,
        title: rawReport.title || `${rawReport.category.toUpperCase()} Crisis at ${rawReport.location.address}`,
        category: rawReport.category,
        severity: scored.severity,
        status: assignedStatus,
        timestamp,
        location: rawReport.location,
        peopleCount: rawReport.peopleCount || 1,
        hasMedicalEmergency: rawReport.hasMedicalEmergency || false,
        medicalDetails: rawReport.medicalDetails || "",
        description: rawReport.description || "Field emergency alert logged by citizen.",
        photoUrl: publicPhotoUrl || rawReport.photoUrl || null,
        aiClassification: aiResult,
        voiceTranscript: rawReport.voiceTranscript || "",
        audioUrl: publicAudioUrl || activePlayableAudio,
        audioBase64: null, // Strictly null so raw base64 never inflates database insert payloads
        recommendedResource: aiResult?.recommendedResource || "Rescue Boat",
        assignedUnit: null,
        priorityScore: scored.priorityScore,
        isFalseAlarm: scored.isFalseAlarm,
        isRequiresReview: scored.isRequiresReview,
        isInvalidImage: Boolean(scored.isInvalidImage || aiResult?.isInvalidImage),
        isRealReport: scored.isRealReport,
        isAbsoluteEmergency: scored.isAbsoluteEmergency,
        disasterTypeTags: scored.disasterTypeTags || [],
        verificationReason: aiResult?.verificationReason || "",
        scoreBreakdown: scored.scoreBreakdown,
        corroboratingReportsCount: 1,
        subReports: []
      };

      let finalIncidentId;
      let isMerged = false;

      if (dupCheck.isDuplicate) {
        // Merge into existing cluster locally
        const mergedCluster = {
          ...dupCheck.updatedIncident,
          photoUrl: publicPhotoUrl || dupCheck.updatedIncident.photoUrl,
          audioUrl: publicAudioUrl || activePlayableAudio || dupCheck.updatedIncident.audioUrl
        };

        setIncidents((prev) =>
          prev.map((inc) => (inc.id === dupCheck.matchedIncidentId ? mergedCluster : inc))
        );
        finalIncidentId = newCitizenIncident.id;
        isMerged = true;

        if (supabaseService.isConfigured()) {
          // Always insert citizen distress report into Supabase with public storage URLs
          await supabaseService.insertIncident(newCitizenIncident);
          // Also update the cluster in Supabase
          await supabaseService.updateIncident(dupCheck.matchedIncidentId, mergedCluster);
        }

        addToast({
          type: "info",
          title: "SOS Recorded & Corroborated",
          message: `Your report #${newCitizenIncident.id} has been saved to the database and corroborated with active cluster #${dupCheck.matchedIncidentId} (${dupCheck.distanceMeters}m away)!`
        });
      } else {
        // Create new incident
        setIncidents((prev) => [newCitizenIncident, ...prev]);
        finalIncidentId = newCitizenIncident.id;
        if (supabaseService.isConfigured()) {
          await supabaseService.insertIncident(newCitizenIncident);
        }
      }

      // Add to citizen personal history with public URL
      storageService.addUserReport({
        id: finalIncidentId,
        ...rawReport,
        priorityScore: scored.priorityScore,
        severity: scored.severity,
        isFalseAlarm: scored.isFalseAlarm,
        photoUrl: publicPhotoUrl || rawReport.photoUrl,
        audioUrl: publicAudioUrl || activePlayableAudio,
        audioBase64: null,
        timestamp,
        status: scored.isFalseAlarm ? "Resolved (False Alarm)" : "Pending"
      });
      setMyReports(storageService.getUserReports());

      if (scored.isFalseAlarm) {
        playEmergencyAudio("beep");
        addToast({
          type: "warning",
          title: "⚠️ Report Flagged as False Alarm (Score 0.0)",
          message: "Report identified as a non-emergency or false alarm. Priority Score set strictly to 0.0/10."
        });
      } else {
        playEmergencyAudio("siren");
        addToast({
          type: "success",
          title: scored.isAbsoluteEmergency ? "🚨 Absolute Emergency Dispatched!" : "SOS Alert Dispatched!",
          message: `Incident #${finalIncidentId} logged (Priority: ${scored.priorityScore}/10). Rescue teams alerted on operations map.`
        });
      }

      return {
        success: true,
        isOffline: false,
        incidentId: finalIncidentId,
        isMerged,
        isFalseAlarm: scored.isFalseAlarm,
        priorityScore: scored.priorityScore,
        severity: scored.severity,
        verificationReason: aiResult?.verificationReason
      };
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

      if (supabaseService.isConfigured()) {
        supabaseService.updateIncident(incidentId, { status: "Dispatched", assignedUnit: unitId });
      }

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

      if (supabaseService.isConfigured()) {
        supabaseService.updateIncident(incidentId, { status: newStatus });
      }

      addToast({
        type: "info",
        title: "Status Updated",
        message: `Incident #${incidentId} updated to "${newStatus}".`
      });
    },
    [addToast]
  );

  // Clear all incidents across the application and Supabase
  const clearAllIncidents = useCallback(async () => {
    setIncidents([]);
    storageService.clearIncidents();
    if (supabaseService.isConfigured()) {
      await supabaseService.clearAllIncidents();
    }
    addToast({
      type: "info",
      title: "Incidents Cleared",
      message: "All existing incidents have been removed from the platform and database."
    });
  }, [addToast]);

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
        clearAllIncidents,
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
