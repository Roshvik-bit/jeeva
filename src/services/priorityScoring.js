/**
 * Smart Priority Scoring Engine for JEEVA (SIH26013)
 * Multi-factor algorithmic ranking for disaster incidents
 * Normalized strictly to a 0.0 - 10.0 scale
 */

export const calculatePriorityScore = (incident) => {
  const {
    peopleCount = 1,
    hasMedicalEmergency = false,
    category = "flood",
    aiClassification = {},
    timestamp = new Date().toISOString(),
    corroboratingReportsCount = 1
  } = incident;

  // 0. False Alarm Check: Deprioritize invalid non-disaster photos
  const isFalseAlarm = Boolean(
    aiClassification?.isFalseAlarm ||
    aiClassification?.isValidDisaster === false ||
    aiClassification?.urgencyAssessment === "FALSE_ALARM_DISMISSED"
  );

  if (isFalseAlarm) {
    const reason = aiClassification?.verificationReason || "Image verification flagged as non-emergency photo.";
    return {
      priorityScore: 0.5,
      severity: "False Alarm",
      isFalseAlarm: true,
      scoreBreakdown: {
        peopleScore: 0,
        medicalScore: 0,
        categoryScore: 0,
        aiHazardScore: 0.5,
        recencyScore: 0,
        corroborationScore: 0,
        explanation: `⚠️ Flagged as False Alarm (Score 0.5/10): ${reason} Deprioritized to bottom of queue.`
      }
    };
  }

  // 1. People / Victims Weight (Max: 3.5)
  let peopleScore = 1.0;
  if (peopleCount >= 20) peopleScore = 3.5;
  else if (peopleCount >= 10) peopleScore = 3.0;
  else if (peopleCount >= 5) peopleScore = 2.5;
  else if (peopleCount >= 2) peopleScore = 1.8;

  // 2. Medical Urgency Weight (Max: 2.5)
  const medicalScore = hasMedicalEmergency ? 2.5 : 0.0;

  // 3. Category Hazard Base Weight (Max: 2.0)
  let categoryScore = 1.0;
  if (category === "trapped") categoryScore = 2.0;          // People Trapped (Immediate life safety risk)
  else if (category === "medical") categoryScore = 2.0;      // Medical Emergency (Immediate life risk)
  else if (category === "fire") categoryScore = 1.8;         // Active Fire (Rapid escalation)
  else if (category === "flood") categoryScore = 1.5;        // Flood / Flash Inundation
  else if (category === "bridge") categoryScore = 1.3;       // Damaged Bridge / Structural collapse
  else if (category === "blocked_road") categoryScore = 0.8; // Blocked Road / Obstruction

  // 4. AI Hazard Severity Weight (Max: 1.5)
  const hazardSeverity = aiClassification?.hazardSeverity != null ? aiClassification.hazardSeverity : 5.0;
  const aiHazardScore = Math.min(1.5, Number(((hazardSeverity / 10) * 1.5).toFixed(1)));

  // 5. Recency Factor (Max: 1.0)
  const elapsedMinutes = Math.max(0, (Date.now() - new Date(timestamp).getTime()) / (1000 * 60));
  let recencyScore = 1.0;
  if (elapsedMinutes > 120) recencyScore = 0.2;
  else if (elapsedMinutes > 60) recencyScore = 0.5;
  else if (elapsedMinutes > 30) recencyScore = 0.8;

  // 6. Corroborating duplicate reports bonus (Max: 1.0)
  let corroborationScore = 0;
  if (corroboratingReportsCount >= 4) corroborationScore = 1.0;
  else if (corroboratingReportsCount >= 2) corroborationScore = 0.5;

  // Total Score (0.0 - 10.0 scale)
  const rawScore = peopleScore + medicalScore + categoryScore + aiHazardScore + recencyScore + corroborationScore;
  const priorityScore = Number(Math.min(10.0, Math.max(1.0, rawScore)).toFixed(1));

  // Determine qualitative severity label based on accurate thresholds
  let severity = "Low";
  if (priorityScore >= 8.5) severity = "Critical";
  else if (priorityScore >= 6.5) severity = "High";
  else if (priorityScore >= 4.0) severity = "Medium";

  const explanation = `Score ${priorityScore}/10: ${peopleCount} victim(s) (${peopleScore} pts) + ${
    hasMedicalEmergency ? "Medical Emergency (2.5 pts)" : "No Medical Triage (0 pts)"
  } + Category ${category} (${categoryScore} pts) + AI Hazard (${aiHazardScore} pts) + Recency (${recencyScore} pts) + Corroboration (${corroborationScore} pts)`;

  return {
    priorityScore,
    severity,
    scoreBreakdown: {
      peopleScore,
      medicalScore,
      categoryScore,
      aiHazardScore,
      recencyScore,
      corroborationScore,
      explanation
    }
  };
};
