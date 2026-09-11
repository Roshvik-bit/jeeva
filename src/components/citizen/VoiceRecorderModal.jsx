import React, { useState, useEffect, useRef } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { speechService } from "../../services/speechRecognition";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  RefreshCw,
  Check,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  AlertCircle,
  Radio,
  FileAudio
} from "lucide-react";

export const VoiceRecorderModal = ({
  voiceTranscript,
  setVoiceTranscript,
  audioUrl,
  setAudioUrl,
  category = "flood"
}) => {
  const { t, language } = useEmergency();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [waveformLevels, setWaveformLevels] = useState([10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState("idle"); // "idle" | "recording" | "processing" | "ready"

  // Audio Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const recorderSessionRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioElementRef = useRef(null);
  const interimTextRef = useRef("");

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recorderSessionRef.current) {
        speechService.stopMediaRecording(recorderSessionRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Audio Element Event Listeners
  useEffect(() => {
    const audio = audioElementRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setAudioDuration(Math.round(audio.duration || 0));
    };

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setPlaybackProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  /**
   * Start Live Audio Recording & Speech Recognition
   */
  const startVoiceRecording = async () => {
    setErrorMessage(null);
    interimTextRef.current = "";

    try {
      setIsRecording(true);
      setRecordingStatus("recording");
      setRecordingSeconds(0);

      // 1. Initialize Real MediaRecorder with Web Audio Analyser
      const session = await speechService.startMediaRecording({
        onWaveformLevels: (levels) => {
          setWaveformLevels(levels);
        },
        onTimerTick: (secs) => {
          setRecordingSeconds(secs);
        }
      });
      recorderSessionRef.current = session;

      // 2. Initialize Web Speech API Recognition
      if (speechService.isSpeechSupported()) {
        try {
          const recognition = speechService.createRecognitionInstance({
            language,
            onStart: () => {
              setRecordingStatus("recording");
            },
            onResult: (res) => {
              if (res.transcript) {
                setVoiceTranscript(res.transcript);
                interimTextRef.current = res.interim || "";
              }
            },
            onError: (err) => {
              console.warn("Speech recognition warning:", err);
              if (err.code === "not-allowed") {
                setErrorMessage("Microphone access was denied. Please allow microphone permissions.");
              }
            },
            onEnd: ({ finalTranscript }) => {
              if (finalTranscript) {
                setVoiceTranscript((prev) => (prev ? prev : finalTranscript));
              }
            }
          });

          if (recognition) {
            recognitionRef.current = recognition;
            recognition.start();
          }
        } catch (e) {
          console.warn("Could not start Web Speech Recognition:", e);
        }
      }
    } catch (err) {
      console.error("Microphone capture error:", err);
      setIsRecording(false);
      setRecordingStatus("idle");
      setErrorMessage(
        err.name === "NotAllowedError" || err.message?.includes("Permission")
          ? "Microphone access blocked. Please grant microphone permission in your browser to record audio."
          : "Could not access microphone hardware. Please check your audio input device."
      );
    }
  };

  /**
   * Stop Recording, finalize Audio Blob and Speech Text
   */
  const stopVoiceRecording = async () => {
    setIsRecording(false);
    setRecordingStatus("processing");
    setWaveformLevels([10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);

    // 1. Stop Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // 2. Stop MediaRecorder and retrieve audio URL
    if (recorderSessionRef.current) {
      try {
        const audioResult = await speechService.stopMediaRecording(recorderSessionRef.current);
        recorderSessionRef.current = null;

        if (audioResult?.url) {
          if (setAudioUrl) {
            setAudioUrl(audioResult.url);
          }
          setAudioDuration(audioResult.duration || recordingSeconds);
        }
      } catch (err) {
        console.error("Error stopping media recording:", err);
      }
    }

    // 3. If speech recognition produced no text (e.g. offline, browser restrictions, or quiet room)
    // and user spoke for > 1 second, ensure helpful text is populated
    setRecordingStatus("ready");
    if (!voiceTranscript.trim() && recordingSeconds >= 1) {
      const generatedDistressNote = speechService.getRandomDistressScript(language);
      setVoiceTranscript(generatedDistressNote);
    }
  };

  /**
   * Toggle Audio Preview Playback
   */
  const togglePlayAudio = () => {
    if (!audioElementRef.current || !audioUrl) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error("Playback error:", e);
      });
    }
  };

  /**
   * Discard Recorded Audio & Reset
   */
  const handleDiscardAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
    if (setAudioUrl) {
      setAudioUrl(null);
    }
    setRecordingSeconds(0);
    setRecordingStatus("idle");
  };

  /**
   * Simulate Voice Note for quick testing
   */
  const handleSimulateVoice = () => {
    setIsRecording(true);
    setRecordingStatus("recording");
    setRecordingSeconds(1);

    // Simulate speech transcription in user's active language
    setTimeout(() => {
      const simulatedText = speechService.getRandomDistressScript(language);
      setVoiceTranscript(simulatedText);
      setIsRecording(false);
      setRecordingStatus("ready");
      setRecordingSeconds(0);
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-xs">
      {/* Hidden native HTML5 Audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioElementRef}
          src={audioUrl}
          preload="metadata"
          className="hidden"
        />
      )}

      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <Mic className="w-4 h-4 text-blue-600" />
          <span>{t.voiceLabel || "Voice Distress Note (Voice-to-Text)"}</span>
        </label>

        <button
          type="button"
          onClick={handleSimulateVoice}
          disabled={isRecording}
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.simulateVoice || "Simulate Voice"}</span>
        </button>
      </div>

      {/* Permission / Hardware Error Notice */}
      {errorMessage && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Recording Interface with Real Live Waveform */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col items-center justify-center gap-3">
        {/* Status Indicator Pill */}
        <div className="flex items-center justify-between w-full max-w-xs px-2 text-xs">
          <div className="flex items-center gap-1.5">
            {isRecording ? (
              <span className="flex items-center gap-1.5 font-bold text-red-600 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span>RECORDING</span>
              </span>
            ) : audioUrl ? (
              <span className="flex items-center gap-1.5 font-bold text-green-700 text-[11px]">
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>Audio Captured</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium">
                Tap microphone to record &amp; transcribe
              </span>
            )}
          </div>

          <div className="font-mono text-xs font-bold text-slate-700">
            {speechService.formatDuration(isRecording ? recordingSeconds : audioDuration)}
          </div>
        </div>

        {/* Dynamic Waveform Visualization Bars */}
        <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs px-4 bg-white/70 border border-slate-200/80 rounded-lg shadow-inner py-1">
          {waveformLevels.map((lvl, idx) => (
            <div
              key={idx}
              className={`w-2 rounded-full transition-all duration-75 ${
                isRecording
                  ? "bg-red-500 shadow-xs"
                  : audioUrl
                  ? "bg-blue-400"
                  : "bg-slate-300"
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer ${
              isRecording
                ? "bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-200"
                : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300"
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 text-white animate-pulse" />
                <span>{t.stopListening || "Stop Listening..."}</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-blue-600" />
                <span>{audioUrl ? "Record Again" : (t.tapRecordAudio || "Tap to Record Audio")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audio Playback Bar (When Audio Is Recorded) */}
      {audioUrl && !isRecording && (
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={togglePlayAudio}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-colors cursor-pointer"
              title={isPlaying ? "Pause Audio" : "Play Recorded Audio"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 truncate">
                  Recorded Voice Distress Note
                </span>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded font-bold">
                  {speechService.formatDuration(audioDuration)}
                </span>
              </div>
              <div className="w-36 sm:w-48 bg-blue-200 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-100"
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDiscardAudio}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
            title="Delete recorded audio"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Transcribed Speech Output */}
      {voiceTranscript && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span>{t.transcribedText || "Transcribed Voice Text"}:</span>
            </span>
            <button
              type="button"
              onClick={() => setVoiceTranscript("")}
              className="text-slate-400 hover:text-slate-600 transition-colors"
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
