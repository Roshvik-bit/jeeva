/**
 * Smart Priority Scoring Engine for JEEVA (SIH26013)
 * Multi-factor algorithmic ranking for disaster incidents
 */

export const calculatePriorityScore = (incident) => {
  const {
    peopleCount = 1,
    hasMedicalEmergency = false,
    aiClassification = {},
    timestamp = new Date().toISOString(),
    corroboratingReportsCount = 1
  } = incident;

  // 1. People Weight (Max: 35)
  let peopleScore = 15;
  if (peopleCount >= 20) peopleScore = 35;
  else if (peopleCount >= 10) peopleScore = 32;
  else if (peopleCount >= 5) peopleScore = 28;
  else if (peopleCount >= 2) peopleScore = 22;

  // 2. Medical Urgency Weight (Max: 30)
  const medicalScore = hasMedicalEmergency ? 28 : 5;

  // 3. AI Hazard Severity Weight (Max: 25)
  const hazardSeverity = aiClassification.hazardSeverity || 7.0;
  const aiHazardScore = Math.min(25, Math.round((hazardSeverity / 10) * 25));

  // 4. Recency Decay (Max: 10)
  const elapsedMinutes = Math.max(0, (Date.now() - new Date(timestamp).getTime()) / (1000 * 60));
  let recencyScore = 10;
  if (elapsedMinutes > 120) recencyScore = 2;
  else if (elapsedMinutes > 60) recencyScore = 4;
  else if (elapsedMinutes > 30) recencyScore = 7;
  else if (elapsedMinutes > 15) recencyScore = 9;

  // 5. Corroborating duplicate reports bonus (Max: 15)
  let corroborationScore = 0;
  if (corroboratingReportsCount >= 4) corroborationScore = 15;
  else if (corroboratingReportsCount === 3) corroborationScore = 10;
  else if (corroboratingReportsCount === 2) corroborationScore = 5;

  // Total Score (0 - 100)
  const rawScore = peopleScore + medicalScore + aiHazardScore + recencyScore + corroborationScore;
  const priorityScore = Math.min(100, Math.max(15, rawScore));

  // Determine qualitative severity label
  let severity = "Low";
  if (priorityScore >= 85) severity = "Critical";
  else if (priorityScore >= 70) severity = "High";
  else if (priorityScore >= 50) severity = "Medium";

  const explanation = `Score ${priorityScore}/100: ${peopleCount} trapped (${peopleScore} pts) + ${
    hasMedicalEmergency ? "Medical Emergency (28 pts)" : "Standard Triage (5 pts)"
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
