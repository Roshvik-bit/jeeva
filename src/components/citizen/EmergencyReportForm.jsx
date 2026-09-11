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
  ArrowRight,
  Camera,
  Mic,
  ShieldAlert
} from "lucide-react";

export const EmergencyReportForm = ({ onSubmitted }) => {
  const { isOnline, submitDistressReport, setActivePortal } = useEmergency();

  const [category, setCategory] = useState("flood");
  const [peopleCount, setPeopleCount] = useState(1);
  const [hasMedicalEmergency, setHasMedicalEmergency] = useState(false);
  const [medicalDetails, setMedicalDetails] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);
  const [aiClassification, setAiClassification] = useState(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [location, setLocation] = useState({
    lat: 13.0827,
    lng: 80.2707,
    address: "Ward 8 Riverbed Sector, Disaster Zone",
    landmark: "GPS Pin",
    accuracy: 10
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReceipt, setSubmittedReceipt] = useState(null);

  // Exact categories: Flood, People Trapped, Medical Emergency, Blocked Road, Damaged Bridge, Fire
  const categories = [
    { id: "flood", label: "Flood", icon: <Waves className="w-4 h-4 text-blue-600" /> },
    { id: "trapped", label: "People Trapped", icon: <Users className="w-4 h-4 text-orange-600" /> },
    { id: "medical", label: "Medical Emergency", icon: <HeartPulse className="w-4 h-4 text-red-600" /> },
    { id: "blocked_road", label: "Blocked Road", icon: <AlertTriangle className="w-4 h-4 text-amber-600" /> },
    { id: "bridge", label: "Damaged Bridge", icon: <Building2 className="w-4 h-4 text-slate-600" /> },
    { id: "fire", label: "Fire", icon: <Flame className="w-4 h-4 text-red-500" /> }
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
        title: `${category.toUpperCase().replace("_", " ")} Emergency: ${location.address}`,
        category,
        peopleCount: Number(peopleCount),
        hasMedicalEmergency,
        medicalDetails,
        description: fullDescription || "Emergency report filed by citizen.",
        location,
        photoUrl,
        aiClassification,
        voiceTranscript
      });

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
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 space-y-5 text-center shadow-sm">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-200 mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Report Submitted
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mt-1">
            Emergency response teams have received your distress signal and priority triage has been assigned.
          </p>

          <div className="mt-3 px-3.5 py-1 rounded-md bg-slate-100 border border-slate-200 inline-flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">Incident ID:</span>
            <span className="font-bold text-xs text-slate-900 font-mono">
              {submittedReceipt.incidentId}
            </span>
          </div>
        </div>

        {/* Structured Summary Rows */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left divide-y divide-slate-200 space-y-2">
          <div className="flex items-center justify-between pb-2 text-xs">
            <span className="text-slate-600 font-medium">Incident Type:</span>
            <span className="font-bold text-slate-900">{submittedReceipt.category}</span>
          </div>

          <div className="flex items-center justify-between py-2 text-xs">
            <span className="text-slate-600 font-medium">People Affected:</span>
            <span className="font-bold text-slate-900">{submittedReceipt.peopleCount} person(s)</span>
          </div>

          <div className="flex items-center justify-between py-2 text-xs">
            <span className="text-slate-600 font-medium">Medical Emergency:</span>
            <span className={`font-bold ${submittedReceipt.hasMedicalEmergency ? "text-red-600" : "text-slate-600"}`}>
              {submittedReceipt.hasMedicalEmergency ? "Yes — Assistance Flagged" : "None Reported"}
            </span>
          </div>

          <div className="flex items-start justify-between py-2 text-xs gap-3">
            <span className="text-slate-600 font-medium shrink-0">Location:</span>
            <span className="font-semibold text-slate-800 text-right truncate max-w-[220px]">
              {submittedReceipt.address}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-600 font-medium">Status:</span>
            <span className="font-semibold text-green-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              {submittedReceipt.isOffline ? "Saved Locally (Will auto-sync)" : "Sent to Rescue Dashboard"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="py-2.5 px-4 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-300 transition-colors"
          >
            <span className="flex items-center justify-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Submit Another Report
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortal("dashboard")}
            className="py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-xs"
          >
            <span className="flex items-center justify-center gap-1.5">
              View on Rescue Map
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. Incident Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Incident Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                category === cat.id
                  ? "bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="shrink-0">{cat.icon}</div>
              <span className="text-xs">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Photo / Camera */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Photo / Camera
        </label>
        <PhotoCaptureModal
          photoUrl={photoUrl}
          setPhotoUrl={setPhotoUrl}
          aiClassification={aiClassification}
          setAiClassification={setAiClassification}
          category={category}
          hasMedical={hasMedicalEmergency}
        />
      </div>

      {/* 3. Voice Report */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Voice Report
        </label>
        <VoiceRecorderModal
          voiceTranscript={voiceTranscript}
          setVoiceTranscript={setVoiceTranscript}
        />
      </div>

      {/* 4. Text Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Text Description
          </label>
          <span className="text-[11px] text-slate-500 font-mono">
            {description.length} / 500 characters
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe landmarks, water depth, building color, phone number or urgent needs..."
          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 leading-relaxed resize-none"
        />
      </div>

      {/* 5. People Affected */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center justify-between gap-4">
        <div>
          <label className="text-xs font-bold text-slate-900 block">
            People Affected
          </label>
          <p className="text-[11px] text-slate-500">Number of people stranded or needing help</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
            className="w-8 h-8 rounded bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 flex items-center justify-center text-sm transition-colors"
          >
            -
          </button>
          <span className="w-8 text-center font-bold text-sm text-slate-900">
            {peopleCount}
          </span>
          <button
            type="button"
            onClick={() => setPeopleCount(peopleCount + 1)}
            className="w-8 h-8 rounded bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 flex items-center justify-center text-sm transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* 6. Medical Emergency */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={hasMedicalEmergency}
            onChange={(e) => setHasMedicalEmergency(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-red-600 rounded cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-bold text-slate-900">
              Medical Emergency Assistance Required
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Check this if someone is injured, unconscious, elderly, pregnant, or has chronic illness.
            </p>
          </div>
        </label>

        {hasMedicalEmergency && (
          <input
            type="text"
            value={medicalDetails}
            onChange={(e) => setMedicalDetails(e.target.value)}
            placeholder="E.g., elderly diabetic person, oxygen needed, severe bleeding..."
            className="w-full bg-slate-50 border border-red-300 rounded-md p-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:bg-white"
          />
        )}
      </div>

      {/* 7. Current Location */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Current Location
        </label>
        <LocationPicker location={location} setLocation={setLocation} />
      </div>

      {/* 8. Submit Report Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-6 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer ${
          !isOnline
            ? "bg-amber-600 hover:bg-amber-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {!isOnline ? (
          <>
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Saving Report..." : "Save Report Offline"}</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Submitting Report..." : "Submit Report"}</span>
          </>
        )}
      </button>
    </form>
  );
};


