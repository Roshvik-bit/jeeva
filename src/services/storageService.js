const STORAGE_KEYS = {
  INCIDENTS: "jeeva_incidents_v1",
  OFFLINE_OUTBOX: "jeeva_offline_outbox_v1",
  USER_REPORTS: "jeeva_user_my_reports_v1",
  SETTINGS: "jeeva_app_settings_v1"
};

export const storageService = {
  // Master Incidents
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
    } catch (e) {
      console.error("Failed to save incidents to localStorage:", e);
    }
  },

  // Offline Outbox Queue
  getOfflineOutbox: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_OUTBOX);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to read offline outbox:", e);
      return [];
    }
  },

  addOfflineReport: (report) => {
    try {
      const outbox = storageService.getOfflineOutbox();
      const queuedReport = {
        ...report,
        localQueuedAt: new Date().toISOString(),
        syncStatus: "queued",
        localId: "OFFLINE-" + Math.random().toString(36).substring(2, 9).toUpperCase()
      };
      outbox.unshift(queuedReport);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_OUTBOX, JSON.stringify(outbox));
      return queuedReport;
    } catch (e) {
      console.error("Failed to add to offline outbox:", e);
      return null;
    }
  },

  clearOfflineOutbox: () => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_OUTBOX, JSON.stringify([]));
    } catch (e) {
      console.error("Failed to clear offline outbox:", e);
    }
  },

  // Citizen's personal history
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
        if (r.id === incidentId) {
          return { ...r, status: newStatus, assignedUnit: assignedUnit || r.assignedUnit };
        }
        return r;
      });
      localStorage.setItem(STORAGE_KEYS.USER_REPORTS, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to update user report:", e);
    }
  }
};
