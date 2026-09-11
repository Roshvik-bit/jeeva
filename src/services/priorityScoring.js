/**
 * Smart Priority Scoring Engine for JEEVA (SIH26013)
 * Multi-factor algorithmic ranking for disaster incidents
 * Normalized to a 0.0 - 10.0 scale
 */

export const calculatePriorityScore = (incident) => {
  const {
    peopleCount = 1,
    hasMedicalEmergency = false,
    aiClassification = {},
    timestamp = new Date().toISOString(),
    corroboratingReportsCount = 1
  } = incident;

  // 1. People Weight (Max: 3.5)
  let peopleScore = 1.5;
  if (peopleCount >= 20) peopleScore = 3.5;
  else if (peopleCount >= 10) peopleScore = 3.2;
  else if (peopleCount >= 5) peopleScore = 2.8;
  else if (peopleCount >= 2) peopleScore = 2.2;

  // 2. Medical Urgency Weight (Max: 3.0)
  const medicalScore = hasMedicalEmergency ? 2.8 : 0.5;

  // 3. AI Hazard Severity Weight (Max: 2.5)
  const hazardSeverity = aiClassification.hazardSeverity || 7.0;
  const aiHazardScore = Math.min(2.5, Number(((hazardSeverity / 10) * 2.5).toFixed(1)));

  // 4. Recency Decay (Max: 1.0)
  const elapsedMinutes = Math.max(0, (Date.now() - new Date(timestamp).getTime()) / (1000 * 60));
  let recencyScore = 1.0;
  if (elapsedMinutes > 120) recencyScore = 0.2;
  else if (elapsedMinutes > 60) recencyScore = 0.4;
  else if (elapsedMinutes > 30) recencyScore = 0.7;
  else if (elapsedMinutes > 15) recencyScore = 0.9;

  // 5. Corroborating duplicate reports bonus (Max: 1.5)
  let corroborationScore = 0;
  if (corroboratingReportsCount >= 4) corroborationScore = 1.5;
  else if (corroboratingReportsCount === 3) corroborationScore = 1.0;
  else if (corroboratingReportsCount === 2) corroborationScore = 0.5;

  // Total Score (0.0 - 10.0)
  const rawScore = peopleScore + medicalScore + aiHazardScore + recencyScore + corroborationScore;
  const priorityScore = Number(Math.min(10.0, Math.max(1.0, rawScore)).toFixed(1));

  // Determine qualitative severity label
  let severity = "Low";
  if (priorityScore >= 8.5) severity = "Critical";
  else if (priorityScore >= 7.0) severity = "High";
  else if (priorityScore >= 5.0) severity = "Medium";

  const explanation = `Score ${priorityScore}/10: ${peopleCount} trapped (${peopleScore} pts) + ${
    hasMedicalEmergency ? "Medical Emergency (2.8 pts)" : "Standard Triage (0.5 pts)"
  } + AI Hazard (${aiHazardScore} pts) + Recency (${recencyScore} pts) + ${corroboratingReportsCount} Corroborations (${corroborationScore} pts)`;

  return {
    priorityScore,
    severity,
    scoreBreakdown: {
      peopleScore,
      medicalScore,
      aiHazardScore,
      recencyScore,
      corroborationScore,
      explanation
    }
  };
};
