import { supabase, isSupabaseConfigured } from "./supabaseClient";

/**
 * Convert a Data URL or raw Base64 string to a standard Blob
 */
export const dataUrlToBlob = (dataUrl, fallbackMime = "application/octet-stream") => {
  if (!dataUrl || typeof dataUrl !== "string") return null;
  try {
    let mime = fallbackMime;
    let base64Data = dataUrl;

    if (dataUrl.includes(";base64,")) {
      const parts = dataUrl.split(";base64,");
      mime = parts[0].replace("data:", "") || fallbackMime;
      base64Data = parts[1];
    } else if (dataUrl.startsWith("data:")) {
      const parts = dataUrl.split(",");
      base64Data = parts[1] || "";
    }

    const binary = atob(base64Data.trim());
    const len = binary.length;
    const array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
  } catch (err) {
    console.warn("dataUrlToBlob parsing error:", err);
    return null;
  }
};

/**
 * Maps Supabase PostgreSQL snake_case row to JEEVA camelCase incident object
 */
export const mapRowToIncident = (row) => {
  if (!row) return null;
  const audioData = row.audio_url || null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    severity: row.severity,
    status: row.status || "Pending",
    priorityScore: row.priority_score != null ? Number(row.priority_score) : 5.0,
    peopleCount: row.people_count || 1,
    hasMedicalEmergency: Boolean(row.has_medical),
    medicalDetails: row.medical_details || "",
    description: row.description || "",
    location: row.location || { address: "Unknown Location", lat: 13.0827, lng: 80.2707 },
    photoUrl: row.photo_url || null,
    audioUrl: audioData,
    audioBase64: audioData && audioData.startsWith("data:audio") ? audioData : null,
    voiceTranscript: row.voice_transcript || "",
    aiClassification: row.ai_classification || null,
    timestamp: row.created_at || new Date().toISOString(),
    recommendedResource: row.recommended_resource || "Rescue Boat",
    assignedUnit: row.assigned_unit || null,
    corroboratingReportsCount: row.corroborating_reports_count || 1,
    subReports: row.sub_reports || []
  };
};

/**
 * Maps JEEVA camelCase incident object to Supabase PostgreSQL snake_case payload
 * Ensures audio_url and photo_url are always clean URLs under 1024 characters
 */
export const mapIncidentToRow = (incident) => {
  // Only accept clean HTTP/HTTPS URLs under 1024 characters for database columns
  let cleanPhotoUrl = null;
  if (
    incident.photoUrl &&
    typeof incident.photoUrl === "string" &&
    (incident.photoUrl.startsWith("http://") || incident.photoUrl.startsWith("https://")) &&
    incident.photoUrl.length <= 1024
  ) {
    cleanPhotoUrl = incident.photoUrl;
  }

  let cleanAudioUrl = null;
  if (
    incident.audioUrl &&
    typeof incident.audioUrl === "string" &&
    (incident.audioUrl.startsWith("http://") || incident.audioUrl.startsWith("https://")) &&
    incident.audioUrl.length <= 1024
  ) {
    cleanAudioUrl = incident.audioUrl;
  }

  return {
    id: incident.id,
    title: incident.title,
    category: incident.category,
    severity: incident.severity,
    status: incident.status || "Pending",
    priority_score: incident.priorityScore,
    people_count: incident.peopleCount || 1,
    has_medical: Boolean(incident.hasMedicalEmergency),
    medical_details: incident.medicalDetails || "",
    description: incident.description || "",
    location: incident.location,
    photo_url: cleanPhotoUrl,
    audio_url: cleanAudioUrl,
    voice_transcript: incident.voiceTranscript || "",
    ai_classification: incident.aiClassification || null,
    recommended_resource: incident.recommendedResource || "Rescue Boat",
    assigned_unit: incident.assignedUnit || null,
    corroborating_reports_count: incident.corroboratingReportsCount || 1,
    created_at: incident.timestamp || new Date().toISOString()
  };
};

export const supabaseService = {
  isConfigured: () => isSupabaseConfigured,

  /**
   * Upload media (photo or audio) to Supabase Storage bucket 'incident-media'
   * Returns public HTTPS URL (length ~100 chars, well under 1024 char limit)
   */
  uploadMedia: async (mediaData, incidentId, type = "photo") => {
    if (!isSupabaseConfigured || !supabase || !mediaData) return null;

    // If already a public https URL, return as-is
    if (typeof mediaData === "string" && (mediaData.startsWith("http://") || mediaData.startsWith("https://"))) {
      return mediaData;
    }

    try {
      const isPhoto = type === "photo";
      const ext = isPhoto ? "jpg" : "webm";
      const mimeType = isPhoto ? "image/jpeg" : "audio/webm";
      const fileName = `${type}s/${incidentId}_${Date.now()}.${ext}`;

      let blobToUpload = null;
      if (typeof mediaData === "string") {
        if (mediaData.startsWith("blob:") && typeof window !== "undefined") {
          try {
            const res = await fetch(mediaData);
            if (res.ok) {
              blobToUpload = await res.blob();
            }
          } catch (e) {
            console.warn("Could not fetch blob URL:", e);
          }
        } else {
          blobToUpload = dataUrlToBlob(mediaData, mimeType);
        }
      } else if (typeof Blob !== "undefined" && mediaData instanceof Blob) {
        blobToUpload = mediaData;
      }

      if (blobToUpload) {
        const { data, error } = await supabase.storage
          .from("incident-media")
          .upload(fileName, blobToUpload, {
            contentType: mimeType,
            upsert: true
          });

        if (!error && data?.path) {
          const { data: publicUrlData } = supabase.storage
            .from("incident-media")
            .getPublicUrl(data.path);
          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        } else if (error) {
          console.warn("Supabase storage upload notice:", error.message);
        }
      }
    } catch (storageErr) {
      console.warn("Storage upload exception:", storageErr);
    }

    // Never return raw base64 string to avoid database column bloat / 413 errors
    return null;
  },

  /**
   * Fetch all incidents from Supabase ordered by created_at DESC (excludes archived/legacy demo incidents)
   */
  fetchIncidents: async () => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .neq("status", "Archived")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase fetchIncidents notice:", error.message);
        return null;
      }

      return Array.isArray(data)
        ? data
            .filter(
              (row) =>
                row.status !== "Archived" &&
                row.status !== "Deleted" &&
                !row.id.startsWith("INC-2026-00") &&
                row.id !== "TEST-INIT-001" &&
                row.id !== "JEEVA-2026-TEST"
            )
            .map(mapRowToIncident)
        : [];
    } catch (err) {
      console.warn("Supabase fetch exception:", err);
      return null;
    }
  },

  /**
   * Delete or archive an incident in Supabase
   */
  deleteIncident: async (id) => {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      await supabase.from("incidents").update({ status: "Archived" }).eq("id", id);
      await supabase.from("incidents").delete().eq("id", id);
      return true;
    } catch (e) {
      console.warn("Delete incident error:", e);
      return false;
    }
  },

  /**
   * Remove/archive all incidents in Supabase
   */
  clearAllIncidents: async () => {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { data } = await supabase.from("incidents").select("id");
      if (data && data.length > 0) {
        for (const row of data) {
          await supabase.from("incidents").update({ status: "Archived" }).eq("id", row.id);
          await supabase.from("incidents").delete().eq("id", row.id);
        }
      }
      return true;
    } catch (e) {
      console.warn("Clear all incidents error:", e);
      return false;
    }
  },

  /**
   * Insert a new incident into Supabase, uploading photos and audio
   */
  insertIncident: async (incident) => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      let photoUrl = incident.photoUrl;
      let audioUrl = incident.audioBase64 || incident.audioUrl;

      // 1. Upload photo to Supabase Storage bucket 'incident-media'
      if (photoUrl && !photoUrl.startsWith("http://") && !photoUrl.startsWith("https://")) {
        photoUrl = await supabaseService.uploadMedia(photoUrl, incident.id, "photo");
      }

      // 2. Upload audio to Supabase Storage bucket 'incident-media'
      if (audioUrl && !audioUrl.startsWith("http://") && !audioUrl.startsWith("https://")) {
        audioUrl = await supabaseService.uploadMedia(audioUrl, incident.id, "audio");
      }

      const row = mapIncidentToRow({
        ...incident,
        photoUrl,
        audioUrl
      });

      const { data, error } = await supabase
        .from("incidents")
        .insert([row])
        .select();

      if (error) {
        console.warn("Supabase insertIncident error:", error.message);
        return null;
      }

      return data && data[0] ? mapRowToIncident(data[0]) : incident;
    } catch (err) {
      console.warn("Supabase insert exception:", err);
      return null;
    }
  },

  /**
   * Update an incident in Supabase (status, assigned unit, etc.)
   */
  updateIncident: async (id, updates) => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const payload = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.assignedUnit !== undefined) payload.assigned_unit = updates.assignedUnit;
      if (updates.priorityScore !== undefined) payload.priority_score = updates.priorityScore;
      if (updates.photoUrl !== undefined && typeof updates.photoUrl === "string" && updates.photoUrl.startsWith("http") && updates.photoUrl.length <= 1024) {
        payload.photo_url = updates.photoUrl;
      }
      if (updates.audioUrl !== undefined && typeof updates.audioUrl === "string" && updates.audioUrl.startsWith("http") && updates.audioUrl.length <= 1024) {
        payload.audio_url = updates.audioUrl;
      }
      if (updates.peopleCount !== undefined) payload.people_count = updates.peopleCount;
      if (updates.corroboratingReportsCount !== undefined) payload.corroborating_reports_count = updates.corroboratingReportsCount;

      const { data, error } = await supabase
        .from("incidents")
        .update(payload)
        .eq("id", id)
        .select();

      if (error) {
        console.warn("Supabase updateIncident error:", error.message);
        return null;
      }

      return data && data[0] ? mapRowToIncident(data[0]) : null;
    } catch (err) {
      console.warn("Supabase update exception:", err);
      return null;
    }
  },

  /**
   * Subscribe to real-time incident insertions and updates
   */
  subscribeToIncidents: (onInsert, onUpdate) => {
    if (!isSupabaseConfigured || !supabase) return () => {};

    try {
      const channel = supabase
        .channel("public:incidents")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "incidents" },
          (payload) => {
            if (
              payload.new &&
              payload.new.status !== "Archived" &&
              payload.new.status !== "Deleted" &&
              !payload.new.id.startsWith("INC-2026-00") &&
              payload.new.id !== "TEST-INIT-001" &&
              payload.new.id !== "JEEVA-2026-TEST" &&
              onInsert
            ) {
              onInsert(mapRowToIncident(payload.new));
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "incidents" },
          (payload) => {
            if (payload.new && onUpdate) {
              onUpdate(mapRowToIncident(payload.new));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Supabase realtime subscription failed:", err);
      return () => {};
    }
  }
};
