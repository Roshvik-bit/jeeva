import { supabase, isSupabaseConfigured } from "./supabaseClient";

/**
 * Maps Supabase PostgreSQL snake_case row to JEEVA camelCase incident object
 */
export const mapRowToIncident = (row) => {
  if (!row) return null;
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
    audioUrl: row.audio_url || null,
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
    audio_url: incident.audioUrl || null,
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
   * Fetch all incidents from Supabase ordered by created_at DESC
   */
  fetchIncidents: async () => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase fetchIncidents notice:", error.message);
        return null;
      }

      return Array.isArray(data) ? data.map(mapRowToIncident) : [];
    } catch (err) {
      console.warn("Supabase fetch exception:", err);
      return null;
    }
  },

  /**
   * Insert a new incident into Supabase
   */
  insertIncident: async (incident) => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const row = mapIncidentToRow(incident);
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
            if (payload.new && onInsert) {
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
