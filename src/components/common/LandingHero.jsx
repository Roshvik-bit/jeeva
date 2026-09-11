import React from "react";
import { useEmergency } from "../../context/EmergencyContext";
import {
  Radio,
  LayoutDashboard,
  ArrowRight,
  ShieldAlert,
  Users,
  CheckCircle2
} from "lucide-react";

export const LandingHero = () => {
  const { setActivePortal, incidents, t } = useEmergency();

  const activeIncidents = incidents.filter((i) => i.status !== "Resolved").length;
  const totalCivilians = incidents
    .filter((i) => i.status !== "Resolved")
    .reduce((sum, i) => sum + (i.peopleCount || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* Main Heading & Subtitle */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white border border-slate-200 shadow-sm mb-1">
          <img src="/logo.png" alt="JEEVA Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.heroTitle || "Jeeva"}
          <span className="block text-xl sm:text-2xl font-bold text-blue-700 mt-1">
            {t.tagline || "Disaster Response & Rescue Platform"}
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1">
          {t.heroSubtitle || "Report emergencies quickly and help rescue teams understand which incidents need attention first."}
        </p>

        {/* Practical Status Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-600" />
            <span>{activeIncidents} {t.activeIncidentsCount || "Active Incidents"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm font-medium">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{totalCivilians} {t.peopleAffectedCount || "People Affected"}</span>
          </span>
        </div>
      </div>

      {/* Two Clean White Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* CARD 1: Citizen App */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                {t.switchToCitizen || "Citizen App"}
              </span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              {t.reportEmergencyCardTitle || "Report an Emergency"}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              {t.reportEmergencyCardDesc || "Submit an emergency report using photo, voice or text and share your location."}
            </p>

            <ul className="space-y-2 text-xs text-slate-500 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>{t.featureOffline || "Works offline and syncs automatically when reconnected"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>{t.featureSos || "One-touch SOS beacon with GPS coordinates"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>{t.featureVoicePhoto || "Voice description and image upload support"}</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => setActivePortal("citizen")}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>{t.openCitizenApp || "Open Citizen App"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 2: Rescue Dashboard */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                {t.switchToDashboard || "Rescue Dashboard"}
              </span>
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              {t.monitorEmergenciesCardTitle || "Monitor Emergencies"}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              {t.monitorEmergenciesCardDesc || "View reported incidents, affected people, priority levels and locations in one place."}
            </p>

            <ul className="space-y-2 text-xs text-slate-500 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{t.featureMap || "Live map view with priority-ranked markers"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{t.featureScore || "Automated priority scoring and route accessibility status"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{t.featureDispatch || "Dispatch rescue boats, ambulances, and response teams"}</span>
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => setActivePortal("dashboard")}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>{t.openRescueDashboard || "Open Rescue Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Simple Emergency Contact Row */}
      <div className="max-w-2xl mx-auto pt-6 border-t border-slate-200 flex flex-wrap items-center justify-around gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span>{t.emergencyHelpline || "National Emergency SOS"}:</span>
          <strong className="text-slate-900 font-bold">112</strong>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Disaster Helpline:</span>
          <strong className="text-slate-900 font-bold">1078</strong>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Ambulance:</span>
          <strong className="text-slate-900 font-bold">108</strong>
        </div>
      </div>
    </div>
  );
};

