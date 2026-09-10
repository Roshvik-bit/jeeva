import React, { useState } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { LocationPicker } from "./LocationPicker";
import { PhotoCaptureModal } from "./PhotoCaptureModal";
import { VoiceRecorderModal } from "./VoiceRecorderModal";
import {
  Waves,
  Mountain,
  Building2,
  HeartPulse,
  Flame,
  Wind,
  Users,
  Send,
  Save,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export const EmergencyReportForm = ({ onSubmitted }) => {
  const { t, isOnline, submitDistressReport } = useEmergency();

  const [category, setCategory] = useState("flood");
  const [peopleCount, setPeopleCount] = useState(2);
  const [hasMedicalEmergency, setHasMedicalEmergency] = useState(false);
  const [medicalDetails, setMedicalDetails] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [aiClassification, setAiClassification] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [location, setLocation] = useState({
    lat: 13.0827,
    lng: 80.2707,
    address: "Ward 8 Riverbed Sector, Disaster Grid",
    landmark: "GPS Beacon Tag",
    accuracy: 10
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: "flood", label: t.flood, icon: <Waves className="w-5 h-5 text-sky-400" /> },
    { id: "landslide", label: t.landslide, icon: <Mountain className="w-5 h-5 text-amber-400" /> },
    { id: "collapse", label: t.collapse, icon: <Building2 className="w-5 h-5 text-rose-400" /> },
    { id: "medical", label: t.medical, icon: <HeartPulse className="w-5 h-5 text-red-500" /> },
    { id: "fire", label: t.fire, icon: <Flame className="w-5 h-5 text-orange-400" /> },
    { id: "cyclone", label: t.cyclone, icon: <Wind className="w-5 h-5 text-cyan-400" /> }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullDescription = [
        description,
        voiceTranscript ? `[Voice Note: "${voiceTranscript}"]` : "",
        medicalDetails ? `[Medical Condition: ${medicalDetails}]` : ""
      ]
        .filter(Boolean)
        .join("\n\n");

      await submitDistressReport({
        title: `${category.toUpperCase()} Crisis: ${location.address}`,
        category,
        peopleCount: Number(peopleCount),
        hasMedicalEmergency,
        medicalDetails,
        description: fullDescription || "Emergency distress report filed by citizen.",
        location,
        photoUrl,
        aiClassification,
        voiceTranscript
      });

      // Reset form
      setDescription("");
      setVoiceTranscript("");
      setPhotoUrl(null);
      setAiClassification(null);
      setHasMedicalEmergency(false);
      setMedicalDetails("");
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Selection Grid */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          1. {t.categoryLabel}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                category === cat.id
                  ? "bg-rose-950/60 border-rose-500 text-white shadow-md shadow-rose-950/40"
                  : "bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700"
              }`}
            >
              <div className="shrink-0">{cat.icon}</div>
              <span className="text-xs font-semibold leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trapped People Stepper */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-200">
              {t.victimsLabel}
            </label>
            <p className="text-[11px] text-slate-400">Affects dispatch priority ranking</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
            className="w-8 h-8 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-sm"
          >
            -
          </button>
          <span className="w-10 text-center font-mono font-bold text-sm text-rose-400">
            {peopleCount}
          </span>
          <button
            type="button"
            onClick={() => setPeopleCount(peopleCount + 1)}
            className="w-8 h-8 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-sm"
          >
            +
          </button>
        </div>
      </div>

      {/* Critical Medical Checkbox */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasMedicalEmergency}
            onChange={(e) => setHasMedicalEmergency(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-rose-500 rounded cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-bold text-rose-300">
              {t.medicalNeeds}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enables highest priority algorithm tier (+28 priority points) & triggers ambulance unit
            </p>
          </div>
        </label>

        {hasMedicalEmergency && (
          <input
            type="text"
            value={medicalDetails}
            onChange={(e) => setMedicalDetails(e.target.value)}
            placeholder="E.g., 70yr diabetic, oxygen cylinder ran out, bleeding laceration..."
            className="w-full bg-slate-950 border border-rose-500/40 rounded-lg p-2.5 text-xs text-rose-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 animate-fadeIn"
          />
        )}
      </div>

      {/* Location Picker */}
      <LocationPicker location={location} setLocation={setLocation} />

      {/* Photo Capture with Edge AI Vision */}
      <PhotoCaptureModal
        photoUrl={photoUrl}
        setPhotoUrl={setPhotoUrl}
        aiClassification={aiClassification}
        setAiClassification={setAiClassification}
        category={category}
        hasMedical={hasMedicalEmergency}
      />

      {/* Voice-to-Text Recorder */}
      <VoiceRecorderModal
        voiceTranscript={voiceTranscript}
        setVoiceTranscript={setVoiceTranscript}
      />

      {/* Text Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Additional Description & Landmarks
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe water depth, nearest landmark, building color, phone numbers..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 leading-relaxed resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
          !isOnline
            ? "bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-amber-600/30"
            : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/40"
        }`}
      >
        {!isOnline ? (
          <>
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? t.savingOffline : "STORE IN OFFLINE OUTBOX (AUTO-SYNC)"}</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "DISPATCHING ALERT..." : t.submitReport}</span>
          </>
        )}
      </button>
    </form>
  );
};
