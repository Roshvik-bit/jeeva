import React, { useEffect } from "react";
import { useEmergency } from "../../context/EmergencyContext";
import { AlertTriangle, CheckCircle, Info, X, WifiOff, Siren } from "lucide-react";

export const ToastContainer = () => {
  const { toasts, removeToast } = useEmergency();

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const getTheme = () => {
    switch (toast.type) {
      case "warning":
        return {
          bg: "bg-amber-950/90 border-amber-500/40 text-amber-100",
          icon: <WifiOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        };
      case "success":
        return {
          bg: "bg-emerald-950/90 border-emerald-500/40 text-emerald-100",
          icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        };
      case "danger":
        return {
          bg: "bg-rose-950/90 border-rose-500/50 text-rose-100",
          icon: <Siren className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
        };
      case "info":
      default:
        return {
          bg: "bg-sky-950/90 border-sky-500/40 text-sky-100",
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${theme.bg}`}
    >
      {theme.icon}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold tracking-wide">{toast.title}</h4>
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
