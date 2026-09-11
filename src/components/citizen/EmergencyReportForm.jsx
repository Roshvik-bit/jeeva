import React, { useState } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { LocationPicker } from "./LocationPicker";
import { PhotoCaptureModal } from "./PhotoCaptureModal";
import { VoiceRecorderModal } from "./VoiceRecorderModal";
import {
  Waves,
  Users,
  HeartPulse,
  AlertTriangle,
  Building2,
  Flame,
  Send,
  Save,
  CheckCircle2,
  MapPin,
  Clock,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export const EmergencyReportForm = ({ onSubmitted }) => {
  const { t, isOnline, submitDistressReport, setActivePortal } = useEmergency();

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
  const [submittedReceipt, setSubmittedReceipt] = useState(null);

  // Exact categories required: Flood, People Trapped, Medical Emergency, Blocked Road, Damaged Bridge, Fire
  const categories = [
    { id: "flood", label: "Flood", icon: <Waves className="w-5 h-5 text-sky-400" /> },
    { id: "trapped", label: "People Trapped", icon: <Users className="w-5 h-5 text-indigo-400" /> },
    { id: "medical", label: "Medical Emergency", icon: <HeartPulse className="w-5 h-5 text-red-500" /> },
    { id: "blocked_road", label: "Blocked Road", icon: <AlertTriangle className="w-5 h-5 text-amber-400" /> },
    { id: "bridge", label: "Damaged Bridge", icon: <Building2 className="w-5 h-5 text-rose-400" /> },
    { id: "fire", label: "Fire", icon: <Flame className="w-5 h-5 text-orange-400" /> }
  ];

  const handleResetForm = () => {
    setDescription("");
    setVoiceTranscript("");
    setPhotoUrl(null);
    setAiClassification(null);
    setHasMedicalEmergency(false);
    setMedicalDetails("");
    setSubmittedReceipt(null);
  };

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

      const result = await submitDistressReport({
        title: `${category.toUpperCase().replace("_", " ")} Crisis: ${location.address}`,
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

      // Generate consistent incident ID tag
      const rawId = result?.incidentId || result?.report?.localId || `JEEVA-2026-${Math.floor(100 + Math.random() * 900)}`;
      const incidentIdFormatted = rawId.startsWith("INC-")
        ? rawId.replace("INC-", "JEEVA-")
        : rawId.startsWith("JEEVA-")
        ? rawId
        : `JEEVA-2026-${rawId.slice(-3)}`;

      const currentCategoryLabel = categories.find((c) => c.id === category)?.label || category;

      setSubmittedReceipt({
        incidentId: incidentIdFormatted,
        category: currentCategoryLabel,
        peopleCount,
        hasMedicalEmergency,
        medicalDetails,
        address: location.address,
        lat: location.lat,
        lng: location.lng,
        isOffline: !isOnline,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });

      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Receipt / Confirmation Success Screen
  if (submittedReceipt) {
    return (
      <div className="bento-card p-6 sm:p-7 space-y-6 text-center animate-fadeIn border-emerald-500/40 shadow-2xl shadow-emerald-950/30">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/50 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping pointer-events-none"></div>
          </div>
          
          <h2 className="mt-4 text-xl sm:text-2xl font-black text-white tracking-tight">
            Report Submitted
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mt-1">
            Emergency dispatch centers have received your distress signal and response protocols are active.
          </p>

          <div className="mt-3 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/40 inline-flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Incident ID:
            </span>
            <span className="font-mono font-black text-xs text-emerald-400">
              {submittedReceipt.incidentId}
            </span>
          </div>
        </div>

        {/* Structured Summary Rows */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-left divide-y divide-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between pb-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Category:
            </span>
            <span className="font-bold text-white">{submittedReceipt.category}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> People Trapped / Affected:
            </span>
            <span className="font-bold text-white font-mono">{submittedReceipt.peopleCount} civilian(s)</span>
          </div>

          <div className="flex items-center justify-between py-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <HeartPulse className="w-3.5 h-3.5 text-red-400" /> Medical Emergency:
            </span>
            <span className={`font-bold ${submittedReceipt.hasMedicalEmergency ? "text-rose-400" : "text-slate-400"}`}>
              {submittedReceipt.hasMedicalEmergency ? "Critical Priority Flagged" : "None Reported"}
            </span>
          </div>

          <div className="flex items-start justify-between py-2 text-xs gap-3">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium shrink-0">
              <MapPin className="w-3.5 h-3.5 text-sky-400" /> Location:
            </span>
            <span className="font-bold text-slate-200 text-right truncate max-w-[220px]">
              {submittedReceipt.address}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Transmission Status:
            </span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {submittedReceipt.isOffline ? "Queued in Local Storage (Auto-Sync)" : "Dispatched to Command Cloud"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Submit Another Report</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortal("dashboard")}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>View on Rescue Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Selection Grid: Flood, People Trapped, Medical Emergency, Blocked Road, Damaged Bridge, Fire */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          1. Select Emergency Type
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
              Trapped / Affected Civilians
            </label>
            <p className="text-[11px] text-slate-400">Affects dispatch priority ranking</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
            className="w-8 h-8 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-sm transition-colors"
          >
            -
          </button>
          <span className="w-10 text-center font-mono font-bold text-sm text-rose-400">
            {peopleCount}
          </span>
          <button
            type="button"
            onClick={() => setPeopleCount(peopleCount + 1)}
            className="w-8 h-8 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold flex items-center justify-center text-sm transition-colors"
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
              Critical Medical Assistance Required
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Enables highest priority algorithm tier (+28 priority points) & triggers ambulance dispatch
            </p>
          </div>
        </label>

        {hasMedicalEmergency && (
          <input
            type="text"
            value={medicalDetails}
            onChange={(e) => setMedicalDetails(e.target.value)}
            placeholder="E.g., Elderly diabetic, oxygen cylinder ran out, bleeding trauma..."
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

      {/* Description Textarea with Live Character Counter */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Incident Description & Landmarks
          </label>
          <span
            className={`text-[11px] font-mono font-medium ${
              description.length > 450 ? "text-amber-400 font-bold" : "text-slate-400"
            }`}
          >
            {description.length} / 500 characters
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe water depth, nearest landmark, building color, phone numbers..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 leading-relaxed resize-none transition-colors"
        />
      </div>

      {/* Submit CTA Button */}
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
            <span>{isSubmitting ? "DISPATCHING SOS SIGNAL..." : "SUBMIT SOS DISPATCH REPORT"}</span>
          </>
        )}
      </button>
    </form>
  );
};

