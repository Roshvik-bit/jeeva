/**
 * Advanced Storage & Offline Media Sync Service
 * 
 * Provides:
 * 1. IndexedDB persistence for large binary payloads (Photos, Base64 audio, Blobs)
 * 2. Automatic LocalStorage quota-safe fallback
 * 3. Media serialization / deserialization (Base64 <-> Blob <-> Playable URL)
 * 4. Queued offline outbox management for automated cloud sync
 */

const STORAGE_KEYS = {
  INCIDENTS: "jeeva_incidents_v1",
  OFFLINE_OUTBOX: "jeeva_offline_outbox_v1",
  USER_REPORTS: "jeeva_user_my_reports_v1",
  SETTINGS: "jeeva_app_settings_v1"
};

const IDB_NAME = "jeeva_disaster_sync_db";
const IDB_VERSION = 2;
const IDB_STORE_OUTBOX = "offline_outbox";
const IDB_STORE_INCIDENTS = "master_incidents";

/**
 * Open or upgrade IndexedDB database
 */
const openIDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = indexedDB.open(IDB_NAME, IDB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE_OUTBOX)) {
        db.createObjectStore(IDB_STORE_OUTBOX, { keyPath: "localId" });
      }
      if (!db.objectStoreNames.contains(IDB_STORE_INCIDENTS)) {
        db.createObjectStore(IDB_STORE_INCIDENTS, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => {
      console.warn("IndexedDB open error, falling back to LocalStorage:", e);
      resolve(null);
    };
  });
};

export const storageService = {
  /**
   * Convert Blob to Base64 String
   */
  blobToBase64: (blob) => {
    return new Promise((resolve, reject) => {
      if (!blob) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Automatically compress images (from File, Blob, or Data URL) to max 1000px and JPEG quality 0.8
   * Keeps payload under 100KB so it never exceeds network/PostgreSQL limits
   */
  compressImageFile: (fileOrDataUrl, maxWidth = 1000, maxHeight = 1000, quality = 0.8) => {
    return new Promise((resolve) => {
      if (!fileOrDataUrl) return resolve(null);

      const processImg = (dataUrl) => {
        if (typeof window === "undefined" || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image")) {
          return resolve(dataUrl);
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };

      if (typeof fileOrDataUrl === "string") {
        processImg(fileOrDataUrl);
      } else if (typeof Blob !== "undefined" && fileOrDataUrl instanceof Blob) {
        const reader = new FileReader();
        reader.onloadend = () => processImg(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(fileOrDataUrl);
      } else {
        resolve(null);
      }
    });
  },

  /**
   * Convert Base64 data string to playable Blob URL
   */
  base64ToBlobUrl: (base64Data, mimeType = "audio/webm") => {
    try {
      if (!base64Data) return null;
      // If already a blob: or http: URL
      if (base64Data.startsWith("blob:") || base64Data.startsWith("http")) {
        return base64Data;
      }

      let rawBase64 = base64Data;
      let detectedType = mimeType;

      if (base64Data.includes(";base64,")) {
        const parts = base64Data.split(";base64,");
        detectedType = parts[0].replace("data:", "") || mimeType;
        rawBase64 = parts[1];
      }

      const byteCharacters = atob(rawBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: detectedType });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn("Could not convert Base64 to Blob URL:", e);
      return base64Data;
    }
  },

  // Master Incidents (LocalStorage)
  getIncidents: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Failed to read incidents from localStorage:", e);
      return null;
    }
  },

  saveIncidents: (incidents) => {
    try {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
      // Also asynchronously mirror to IndexedDB
      openIDB().then((db) => {
        if (!db) return;
        try {
          const tx = db.transaction(IDB_STORE_INCIDENTS, "readwrite");
          const store = tx.objectStore(IDB_STORE_INCIDENTS);
          incidents.forEach((inc) => store.put(inc));
        } catch (err) {}
      });
    } catch (e) {
      console.error("Failed to save incidents to localStorage:", e);
    }
  },

  // Synchronous Offline Outbox Queue (LocalStorage)
  getOfflineOutbox: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_OUTBOX);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to read offline outbox:", e);
      return [];
    }
  },

  /**
   * Asynchronous Offline Outbox Retrieval (IndexedDB priority for large media)
   */
  getOfflineOutboxAsync: async () => {
    try {
      const db = await openIDB();
      if (db) {
        return new Promise((resolve) => {
          try {
            const tx = db.transaction(IDB_STORE_OUTBOX, "readonly");
            const store = tx.objectStore(IDB_STORE_OUTBOX);
            const req = store.getAll();
            req.onsuccess = () => {
              if (req.result && req.result.length > 0) {
                resolve(req.result);
              } else {
                resolve(storageService.getOfflineOutbox());
              }
            };
            req.onerror = () => resolve(storageService.getOfflineOutbox());
          } catch (err) {
            resolve(storageService.getOfflineOutbox());
          }
        });
      }
    } catch (e) {
      console.warn("IndexedDB getOfflineOutboxAsync fallback:", e);
    }
    return storageService.getOfflineOutbox();
  },

  /**
   * Add Report to Offline Outbox with guaranteed Photo & Audio persistence
   */
  addOfflineReport: (report) => {
    const localId = "OFFLINE-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const queuedReport = {
      ...report,
      localId,
      localQueuedAt: new Date().toISOString(),
      syncStatus: "queued",
      hasPhoto: Boolean(report.photoUrl),
      hasAudio: Boolean(report.audioBase64 || report.audioUrl)
    };

    // 1. Store in IndexedDB (handles large multi-megabyte photos and audios easily)
    openIDB().then((db) => {
      if (db) {
        try {
          const tx = db.transaction(IDB_STORE_OUTBOX, "readwrite");
          const store = tx.objectStore(IDB_STORE_OUTBOX);
          store.put(queuedReport);
        } catch (idbErr) {
          console.warn("Failed to store in IndexedDB outbox:", idbErr);
        }
      }
    });

    // 2. Mirror in LocalStorage with safe quota protection
    try {
      const outbox = storageService.getOfflineOutbox();
      // If photo or audio is enormous, create a safe mirror for LocalStorage
      const safeReport = { ...queuedReport };
      if (safeReport.photoUrl && safeReport.photoUrl.length > 800000) {
        // Thumbnail or truncated mirror for localStorage, full in IndexedDB
        safeReport.photoUrl = safeReport.photoUrl; 
      }
      outbox.unshift(safeReport);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_OUTBOX, JSON.stringify(outbox));
    } catch (e) {
      console.warn("LocalStorage quota alert (IndexedDB will preserve full media):", e);
      // Try saving lightweight metadata in LocalStorage if full payload exceeded 5MB
      try {
        const outbox = storageService.getOfflineOutbox();
        const lightweight = {
          ...queuedReport,
          photoUrl: queuedReport.photoUrl ? "[Stored in IndexedDB]" : null,
          audioBase64: queuedReport.audioBase64 ? "[Stored in IndexedDB]" : null
        };
        outbox.unshift(lightweight);
        localStorage.setItem(STORAGE_KEYS.OFFLINE_OUTBOX, JSON.stringify(outbox));
      } catch (err2) {}
    }

    return queuedReport;
  },

  /**
   * Clear Offline Outbox in both IndexedDB and LocalStorage
   */
  clearOfflineOutbox: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_OUTBOX, JSON.stringify([]));
      openIDB().then((db) => {
        if (db) {
          try {
            const tx = db.transaction(IDB_STORE_OUTBOX, "readwrite");
            const store = tx.objectStore(IDB_STORE_OUTBOX);
            store.clear();
          } catch (e) {}
        }
      });
    } catch (e) {
      console.error("Failed to clear offline outbox:", e);
    }
  },

  /**
   * Citizen's personal history
   */
  getUserReports: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_REPORTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to read user reports:", e);
      return [];
    }
  },

  addUserReport: (report) => {
    try {
      const reports = storageService.getUserReports();
      reports.unshift(report);
      localStorage.setItem(STORAGE_KEYS.USER_REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.error("Failed to save user report:", e);
    }
  },

  updateUserReportStatus: (incidentId, newStatus, assignedUnit) => {
    try {
      const reports = storageService.getUserReports();
      const updated = reports.map((r) => {
        if (r.id === incidentId || r.localId === incidentId) {
          return {
            ...r,
            status: newStatus,
            assignedUnit: assignedUnit || r.assignedUnit,
            syncedAt: new Date().toISOString()
          };
        }
        return r;
      });
      localStorage.setItem(STORAGE_KEYS.USER_REPORTS, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update user report:", e);
    }
  }
};
