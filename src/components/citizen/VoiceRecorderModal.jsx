import React, { useState, useEffect, useRef } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { speechService } from "../../services/speechRecognition";
import { Mic, MicOff, Volume2, Sparkles, RefreshCw, Check } from "lucide-react";

export const VoiceRecorderModal = ({ voiceTranscript, setVoiceTranscript }) => {
  const { t } = useEmergency();
  const [isRecording, setIsRecording] = useState(false);
  const [waveformLevels, setWaveformLevels] = useState([12, 24, 40, 20, 32, 16, 28, 45, 22, 14]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setWaveformLevels(
          Array.from({ length: 10 }, () => Math.floor(Math.random() * 40) + 8)
        );
      }, 120);
    } else {
      setWaveformLevels([10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startVoiceRecording = () => {
    setIsRecording(true);

    if (speechService.isSupported()) {
      try {
        const recognition = speechService.createRecognitionInstance(
          (text) => {
            setVoiceTranscript((prev) => (prev ? prev + " " + text : text));
          },
          (err) => {
            console.warn("Speech error, falling back to simulated dictation:", err);
          },
          () => {
            setIsRecording(false);
          }
        );
        if (recognition) {
          recognitionRef.current = recognition;
          recognition.start();
          return;
        }
      } catch (e) {
        console.warn("Speech recognition initialization error:", e);
      }
    }

    // Fallback simulation timer (after 2.5 seconds, populates realistic distress message)
    setTimeout(() => {
      const simulatedText = speechService.getRandomDistressScript();
      setVoiceTranscript(simulatedText);
      setIsRecording(false);
    }, 2400);
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handleSimulateVoice = () => {
    setIsRecording(true);
    setTimeout(() => {
      const simulatedText = speechService.getRandomDistressScript();
      setVoiceTranscript(simulatedText);
      setIsRecording(false);
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <Mic className="w-4 h-4 text-blue-600" />
          <span>{t.voiceLabel || "Voice Distress Note (Voice-to-Text)"}</span>
        </label>
        <button
          type="button"
          onClick={handleSimulateVoice}
          disabled={isRecording}
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.simulateVoice || "Simulate Voice"}</span>
        </button>
      </div>

      {/* Recording Interface with Animated Waveform */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center gap-2.5">
        {/* Waveform Visualization Bars */}
        <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs px-4">
          {waveformLevels.map((lvl, idx) => (
            <div
              key={idx}
              className={`w-2 rounded-full transition-all duration-100 ${
                isRecording ? "bg-red-500" : "bg-slate-300"
              }`}
              style={{ height: `${lvl}px` }}
            />
          ))}
        </div>

        {/* Mic Control Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              isRecording
                ? "bg-red-600 text-white shadow-sm"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm"
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 text-white" />
                <span>{t.stopListening || "Stop Listening..."}</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-blue-600" />
                <span>{t.tapRecordAudio || "Tap to Record Audio"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transcribed Speech Output */}
      {voiceTranscript && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-green-600" />
              {t.transcribedText || "Transcribed Voice Text"}:
            </span>
            <button
              type="button"
              onClick={() => setVoiceTranscript("")}
              className="text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          </div>
          <textarea
            rows={2}
            value={voiceTranscript}
            onChange={(e) => setVoiceTranscript(e.target.value)}
            placeholder="Transcribed voice speech will appear here..."
            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed resize-none"
          />
        </div>
      )}
    </div>
  );
};
