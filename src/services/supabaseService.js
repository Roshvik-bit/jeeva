import { supabase, isSupabaseConfigured } from "./supabaseClient";

/**
 * Convert a Data URL (Base64) to a standard Blob
 */
export const dataUrlToBlob = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.includes(";base64,")) {
    return null;
  }
  try {
    const parts = dataUrl.split(";base64,");
    const mime = parts[0].replace("data:", "") || "application/octet-stream";
    const binary = atob(parts[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
  } catch (err) {
    console.warn("dataUrlToBlob error:", err);
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
 */
export const mapIncidentToRow = (incident) => {
  // If audioUrl is a local blob: URL, prefer persistent audioBase64 string
  let persistentAudio = incident.audioBase64 || incident.audioUrl || null;
  if (persistentAudio && persistentAudio.startsWith("blob:") && incident.audioBase64) {
    persistentAudio = incident.audioBase64;
  }
  // Safeguard: guard against massive audio blobs in PostgreSQL column to ensure zero latency
  if (persistentAudio && typeof persistentAudio === "string" && !persistentAudio.startsWith("http")) {
    if (persistentAudio.length > 75000) {
      console.warn("Audio payload exceeds 75KB column safety threshold, omitting from column");
      persistentAudio = null;
    }
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
    photo_url: incident.photoUrl || null,
    audio_url: persistentAudio,
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
   * Upload media (photo or audio) to Supabase Storage if bucket exists,
   * otherwise fallback gracefully to persistent Data URL / Base64 in PostgreSQL column
   */
  uploadMedia: async (mediaData, incidentId, type = "photo") => {
    if (!isSupabaseConfigured || !supabase || !mediaData) return mediaData;

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
      if (typeof mediaData === "string" && mediaData.startsWith("data:")) {
        blobToUpload = dataUrlToBlob(mediaData);
      } else if (typeof mediaData === "string" && mediaData.startsWith("blob:") && typeof window !== "undefined") {
        try {
          const res = await fetch(mediaData);
          if (res.ok) {
            blobToUpload = await res.blob();
          }
        } catch (e) {
          console.warn("Could not fetch blob URL:", e);
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
          // If storage bucket is not created or RLS rejects, fallback to direct column storage
          console.info("Supabase storage bucket notice (using direct database column):", error.message);
        }

        // If upload to bucket didn't return a public URL and it was a temporary blob: URL,
        // convert to permanent Base64 Data URL so it is persisted in PostgreSQL
        if (typeof mediaData === "string" && mediaData.startsWith("blob:") && typeof window !== "undefined") {
          const b64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(mediaData);
            reader.readAsDataURL(blobToUpload);
          });
          return b64;
        }
      }
    } catch (storageErr) {
      console.warn("Storage upload exception, fallback to direct column:", storageErr);
    }

    return mediaData;
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

      // 1. Sync photo to Supabase Storage (or fallback to persistent Base64)
      if (photoUrl && (photoUrl.startsWith("data:") || photoUrl instanceof Blob)) {
        photoUrl = await supabaseService.uploadMedia(photoUrl, incident.id, "photo");
      }

      // 2. Sync audio to Supabase Storage (or fallback to persistent Base64)
      if (audioUrl && (audioUrl.startsWith("data:") || audioUrl.startsWith("blob:") || audioUrl instanceof Blob)) {
        audioUrl = await supabaseService.uploadMedia(audioUrl, incident.id, "audio");
      }

      const row = mapIncidentToRow({
        ...incident,
        photoUrl,
        audioUrl,
        audioBase64: audioUrl && typeof audioUrl === "string" && audioUrl.startsWith("data:") ? audioUrl : null
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
      if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl;
      if (updates.audioUrl !== undefined) payload.audio_url = updates.audioUrl;
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
