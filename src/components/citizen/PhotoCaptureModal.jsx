import React, { useState } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { SAMPLE_DISASTER_IMAGES, mockAiClassifier } from "../../services/mockAiClassifier";
import { Camera, Image as ImageIcon, Sparkles, AlertTriangle, Check, RefreshCw, X } from "lucide-react";

export const PhotoCaptureModal = ({ photoUrl, setPhotoUrl, aiClassification, setAiClassification, category, hasMedical }) => {
  const { t } = useEmergency();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const handleSelectSample = async (sample) => {
    setPhotoUrl(sample.url);
    setIsAnalyzing(true);
    setShowPicker(false);

    try {
      const result = await mockAiClassifier.classifyDisasterImage(sample.url, sample.category, hasMedical);
      setAiClassification(result);
    } catch (err) {
      console.error("AI inference error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setPhotoUrl(dataUrl);
      setIsAnalyzing(true);

      try {
        const result = await mockAiClassifier.classifyDisasterImage(dataUrl, category, hasMedical);
        setAiClassification(result);
      } catch (err) {
        console.error("AI inference error:", err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setPhotoUrl(null);
    setAiClassification(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-blue-600" />
          <span>{t.photoLabel || "Incident Photo & AI Analysis"}</span>
        </label>
        {photoUrl && (
          <button
            type="button"
            onClick={handleClearPhoto}
            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {!photoUrl ? (
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* File Upload / Camera Trigger */}
            <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 cursor-pointer text-xs font-medium text-slate-700 transition-colors">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>{t.takePhoto || "Take Photo / Upload"}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Choose Disaster Preset Sample */}
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-teal-600" />
              <span>{t.pickScenario || "Pick Test Scenario"}</span>
            </button>
          </div>

          {/* Test Disaster Preset Gallery */}
          {showPicker && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 animate-fadeIn">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Select Realistic Incident Photo:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_DISASTER_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-left transition-all hover:border-blue-300"
                  >
                    <img
                      src={sample.url}
                      alt={sample.label}
                      className="w-12 h-12 rounded object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {sample.label}
                      </p>
                      <p className="text-[10px] text-red-600 capitalize">
                        {sample.category} • Severity: {sample.severity}/10
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Image Preview & AI Inference Results */
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-48 flex items-center justify-center">
            <img
              src={photoUrl}
              alt="Disaster Scene"
              className="w-full h-44 object-cover"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-slate-800">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-xs font-semibold text-slate-700">
                  Analyzing incident image...
                </span>
              </div>
            )}
          </div>

          {/* AI Vision Insights Card */}
          {aiClassification && !isAnalyzing && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>AI-assisted image analysis</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Confidence: {aiClassification.confidence}%
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                  <span>{aiClassification.detectedHazard}</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Hazard Severity Rating:{" "}
                  <span className="font-bold text-red-600">
                    {aiClassification.hazardSeverity}/10
                  </span>
                </p>
              </div>

              {/* Visual Tags */}
              {aiClassification.visualTags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {aiClassification.visualTags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
