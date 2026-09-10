import React, { useState, useEffect } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { AlertOctagon, X, Check, Radio } from "lucide-react";

export const QuickSOSButton = () => {
  const { t, triggerQuickSOS, playEmergencyAudio } = useEmergency();
  const [countdown, setCountdown] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let timer = null;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
        playEmergencyAudio("beep");
      }, 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      handleExecuteSOS();
    }
    return () => clearTimeout(timer);
  }, [countdown, playEmergencyAudio]);

  const handleStartSOS = () => {
    playEmergencyAudio("beep");
    setCountdown(3);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setCountdown(null);
  };

  const handleExecuteSOS = async () => {
    setIsSuccess(true);
    await triggerQuickSOS();
    setTimeout(() => {
      setIsSuccess(false);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {countdown !== null ? (
        // Countdown Failsafe State
        <div className="w-full max-w-sm bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-6 shadow-2xl shadow-rose-900/50 text-center animate-bounce-slow">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center animate-ping-slow text-white text-3xl font-extrabold font-mono">
              {countdown}
            </div>
          </div>
          <h3 className="text-xl font-black text-rose-100 tracking-wide">
            DISPATCHING CRITICAL SOS!
          </h3>
          <p className="text-xs text-rose-300 mt-1 mb-5">
            {t.sosCancelWarning}
          </p>

          <button
            onClick={handleCancel}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <X className="w-5 h-5 text-rose-400" />
            <span>{t.cancel} (Accidental Press)</span>
          </button>
        </div>
      ) : isSuccess ? (
        // Successful Dispatch State
        <div className="w-full max-w-sm bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl p-6 shadow-2xl shadow-emerald-900/50 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 mb-3 shadow-lg shadow-emerald-500/50">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <h3 className="text-lg font-bold text-emerald-100">
            {t.sosSent}
          </h3>
          <p className="text-xs text-emerald-300 mt-1">
            Rescue response teams notified. Keep phone on high volume.
          </p>
        </div>
      ) : (
        // Default SOS Button
        <div className="flex flex-col items-center">
          <button
            onClick={handleStartSOS}
            className="group relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 text-white shadow-2xl shadow-rose-600/60 hover:shadow-rose-600/80 transition-transform active:scale-95 animate-radar focus:outline-none"
            aria-label="Trigger Emergency SOS"
          >
            {/* Outer pulsating beacon ring */}
            <span className="absolute inset-0 rounded-full border-4 border-rose-400/40 animate-ping-slow pointer-events-none" />

            <div className="flex flex-col items-center text-center px-4">
              <AlertOctagon className="w-12 h-12 sm:w-14 sm:h-14 mb-2 stroke-[2.5] group-hover:rotate-12 transition-transform" />
              <span className="text-2xl sm:text-3xl font-black tracking-wider uppercase font-mono drop-shadow-md">
                SOS
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-rose-100 mt-1 uppercase tracking-widest opacity-90">
                1-TAP RESCUE
              </span>
            </div>
          </button>

          <p className="text-xs text-slate-400 mt-4 text-center max-w-xs leading-relaxed">
            {t.sosSubtitle} • Captures GPS & dispatches immediate alert
          </p>
        </div>
      )}
    </div>
  );
};
