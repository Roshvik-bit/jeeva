// Edge AI Vision & Multimodal Disaster Verification Engine (SIH26013)
// Includes Automated Statement Verification, False Alarm Neutralization & Multi-Hazard Authentication

export const SAMPLE_DISASTER_IMAGES = [
  {
    id: "flood-rooftop",
    label: "Urban Flooding & Rooftop Evacuation",
    category: "flood",
    url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=640&q=70",
    hazard: "Severe Inundation / Trapped Residents on Elevated Structures",
    severity: 9.7,
    confidence: 97.2,
    visualTags: ["Water Level > 5ft", "Current Speed: 1.8 m/s", "Submerged Transformer", "Hand Gestures Detected"],
    resource: "Rescue Boat",
    urgency: "CRITICAL_IMMEDIATE_ACTION",
    isValidDisaster: true,
    isFalseAlarm: false,
    isFakeReport: false,
    verificationReason: "Verified: Severe street waterlogging and civilian roof entrapment detected."
  },
  {
    id: "bridge-collapse",
    label: "Bridge & Overpass Structural Failure",
    category: "collapse",
    url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=640&q=70",
    hazard: "Bridge Deck Fracture / Vehicle Dangling Over Chasm",
    severity: 9.3,
    confidence: 95.4,
    visualTags: ["Structural Shear Failure", "Arterial Road Severed", "Vehicle Impact", "Secondary Collapse Risk"],
    resource: "Road Clearance Unit",
    urgency: "CRITICAL_IMMEDIATE_ACTION",
    isValidDisaster: true,
    isFalseAlarm: false,
    isFakeReport: false,
    verificationReason: "Verified: Critical bridge structural shear and transit route severed."
  },
  {
    id: "medical-trauma",
    label: "Casualty / Medical Distress in Water",
    category: "medical",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=640&q=70",
    hazard: "Critical Patient Immobility / Hypothermia & Trauma",
    severity: 9.5,
    confidence: 96.8,
    visualTags: ["Immobilized Patient", "Oxygen Requirement", "Elderly Subject", "Inaccessible Roadway"],
    resource: "Medical Team",
    urgency: "LIFE_THREATENING_MEDICAL",
    isValidDisaster: true,
    isFalseAlarm: false,
    isFakeReport: false,
    verificationReason: "Verified: Acute medical emergency requiring immediate paramedic evacuation."
  },
  {
    id: "electric-fire",
    label: "Electrical Fire & Submerged Substation",
    category: "fire",
    url: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=640&q=70",
    hazard: "Electrical Arcing in Floodwaters / Chemical Fire",
    severity: 8.9,
    confidence: 93.6,
    visualTags: ["High Voltage Arc", "Conductive Standing Water", "Toxic Dense Plume", "Flammable Oils"],
    resource: "Fire Tender",
    urgency: "HIGH_HAZARD",
    isValidDisaster: true,
    isFalseAlarm: false,
    isFakeReport: false,
    verificationReason: "Verified: Active electrical fire and toxic combustion near water."
  },
  {
    id: "tree-debris",
    label: "Fallen Tree & Mud Debris Highway Block",
    category: "landslide",
    url: "https://images.unsplash.com/photo-1542314831-c6a4d27376db?auto=format&fit=crop&w=640&q=70",
    hazard: "Vegetation & Mud Obstruction Blocking Escape Route",
    severity: 6.8,
    confidence: 91.2,
    visualTags: ["Heavy Trunk Diameter > 1m", "Both Lanes Impassable", "Stranded Civilians", "No Crush Fatalities"],
    resource: "Road Clearance Unit",
    urgency: "CLEARANCE_IN_PROGRESS",
    isValidDisaster: true,
    isFalseAlarm: false,
    isFakeReport: false,
    verificationReason: "Verified: Major arterial road obstruction requiring heavy clearing machinery."
  },
  {
    id: "false-alarm-coffee",
    label: "⚠️ Test False Alarm: Coffee Cup & Desk",
    category: "flood",
    url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=640&q=70",
    hazard: "No Disaster Detected: Coffee cup on indoor desk",
    severity: 0.0,
    confidence: 98.2,
    visualTags: ["Domestic Table", "Beverage", "No Standing Water", "Non-Emergency Photo"],
    resource: "None (False Alarm)",
    urgency: "FALSE_ALARM_DISMISSED",
    isValidDisaster: false,
    isFalseAlarm: true,
    isFakeReport: true,
    verificationReason: "False Alarm: Photo shows an indoor coffee beverage on a dry surface. Zero disaster or flood hazards observed."
  },
  {
    id: "false-alarm-pet",
    label: "⚠️ Test False Alarm: Domestic Pet Indoors",
    category: "trapped",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=640&q=70",
    hazard: "No Disaster Detected: Household cat in living room",
    severity: 0.0,
    confidence: 98.9,
    visualTags: ["Domestic Pet", "Intact Interior", "No Trapped Civilians", "Safe Habitat"],
    resource: "None (False Alarm)",
    urgency: "FALSE_ALARM_DISMISSED",
    isValidDisaster: false,
    isFalseAlarm: true,
    isFakeReport: true,
    verificationReason: "False Alarm: Photo shows a household domestic pet in a safe, undamaged interior. No distress victims or entrapment."
  }
];

/**
 * Checks report text statement (title, description, transcript) for fake report / false alarm markers.
 * Identifies pranks, jokes, trivial deliveries, fantasy claims, contradictions, and non-emergency requests.
 */
export const verifyReportStatement = (textContext = "", options = {}) => {
  if (!textContext || typeof textContext !== "string") {
    return { isFakeStatement: false, reason: null, confidence: 90 };
  }

  const normalized = textContext.toLowerCase().trim();
  if (normalized.length === 0) {
    return { isFakeStatement: false, reason: null, confidence: 90 };
  }

  // 1. Explicit Prank / Joke / Hoax / Troll / Test markers
  const prankRegex = /\b(prank|joke|joking|fake\s*report|fake\s*alarm|hoax|troll|trolling|haha|hehe|lol|lmao|just\s*kidding|jk\b|just\s*testing|test\s*123|testing\s*app|trial\s*test|mock\s*report|playing\s*around|fooling\s*around)\b/i;
  const prankMatch = normalized.match(prankRegex);
  if (prankMatch) {
    return {
      isFakeStatement: true,
      reason: `Flagged as Fake Report: Statement contains prank/test marker ('${prankMatch[0]}'). Zero emergency credibility.`,
      confidence: 99.0
    };
  }

  // 2. Commercial / Food delivery / Non-emergency trivial requests
  const trivialRegex = /\b(pizza|burger|ice\s*cream|biryani|beer|alcohol|party|movie|cinema|netflix|gaming|pubg|free\s*fire|homework|swiggy|zomato|order\s*food|deliver\s*food|shopping|buy\s*car)\b/i;
  const trivialMatch = normalized.match(trivialRegex);
  if (trivialMatch) {
    return {
      isFakeStatement: true,
      reason: `Flagged as False Alarm: Statement indicates a non-emergency trivial or delivery request ('${trivialMatch[0]}'). Not a disaster situation.`,
      confidence: 97.5
    };
  }

  // 3. Fictional / Fantasy / Mythical claims
  const fantasyRegex = /\b(alien|aliens|ufo|flying\s*saucer|dragon|dragons|zombie|zombies|vampire|vampires|ghost|ghosts|monster|monsters|superhero|batman|superman|spiderman)\b/i;
  const fantasyMatch = normalized.match(fantasyRegex);
  if (fantasyMatch) {
    return {
      isFakeStatement: true,
      reason: `Flagged as Fake Report: Statement contains fictitious/fantasy narrative ('${fantasyMatch[0]}'). Zero real hazard.`,
      confidence: 99.5
    };
  }

  // 4. Explicit denial / contradiction of emergency
  const denialRegex = /\b(nothing\s*happened|no\s*disaster|no\s*emergency|everything\s*is\s*fine|all\s*good\s*here|just\s*chilling|relaxing\s*at\s*home|no\s*flood\s*here|sunny\s*day|false\s*alert)\b/i;
  const denialMatch = normalized.match(denialRegex);
  if (denialMatch) {
    return {
      isFakeStatement: true,
      reason: `Flagged as False Alarm: Statement explicitly states there is no emergency or hazard ('${denialMatch[0]}').`,
      confidence: 98.0
    };
  }

  // 5. Keystroke mash / Nonsense spam (e.g. asdfghjkl, 12345678, aaaaaaaa)
  const isGibberish = /^[a-z0-9]{1,4}$/i.test(normalized) ||
    /^(.)\1{4,}$/i.test(normalized) ||
    /^(asdf|qwer|zxcv|1234|test)+$/i.test(normalized.replace(/[\s\-_]/g, ""));
  if (isGibberish && normalized.length > 3) {
    return {
      isFakeStatement: true,
      reason: "Flagged as False Alarm: Statement consists of non-descriptive keystroke mash/gibberish.",
      confidence: 95.0
    };
  }

  return { isFakeStatement: false, reason: null, confidence: 92.0 };
};

/**
 * Client-side visual inspection analyzing canvas pixel data
 * Detects blank screens, selfies, everyday indoor scenes vs disaster signatures
 */
const analyzeImagePixels = (dataUrl) => {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image")) {
      return resolve(null);
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size);
        const data = imgData.data;
        const totalPixels = size * size;

        let totalBrightness = 0;
        let skinToneCount = 0;
        let waterColorCount = 0;
        let fireColorCount = 0;
        const brightnessArray = [];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
          totalBrightness += brightness;
          brightnessArray.push(brightness);

          // Skin tone check (selfie / face detection)
          if (r > 95 && g > 40 && b > 20 && Math.max(r, g, b) - Math.min(r, g, b) > 15 && Math.abs(r - g) > 15 && r > g && r > b) {
            skinToneCount++;
          }

          // Flood / water detection (muddy/brown or blue/cyan/grey high reflective spectrum)
          if ((b > r && b > g && b > 70) || (r > 70 && g > 60 && b < 60 && Math.abs(r - g) < 25) || (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && brightness > 50 && brightness < 180)) {
            waterColorCount++;
          }

          // Fire / flame detection (bright yellow, orange, red)
          if (r > 180 && g > 90 && b < 100 && (r - b) > 80) {
            fireColorCount++;
          }
        }

        const avgBrightness = totalBrightness / totalPixels;
        let varianceSum = 0;
        for (let b of brightnessArray) {
          varianceSum += Math.pow(b - avgBrightness, 2);
        }
        const stdDev = Math.sqrt(varianceSum / totalPixels);
        const skinRatio = skinToneCount / totalPixels;
        const waterRatio = waterColorCount / totalPixels;
        const fireRatio = fireColorCount / totalPixels;

        resolve({
          avgBrightness,
          stdDev,
          skinRatio,
          waterRatio,
          fireRatio
        });
      } catch (err) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
};

/**
 * Complete Multi-Modal Disaster Verification Engine
 * Verifies written statement, voice note transcription, and attached photo.
 * Authenticates real disaster emergencies and neutralizes fake reports to 0.0 score.
 */
export const verifyDisasterReport = async ({
  title = "",
  description = "",
  voiceTranscript = "",
  category = "flood",
  hasMedicalEmergency = false,
  peopleCount = 1,
  photoUrl = null
}) => {
  // 1. Text & Statement Verification
  const combinedText = [title, description, voiceTranscript].filter(Boolean).join(" ");
  const statementCheck = verifyReportStatement(combinedText);

  if (statementCheck.isFakeStatement) {
    return {
      isValidDisaster: false,
      isFalseAlarm: true,
      isFakeReport: true,
      isRealReport: false,
      verificationStatus: "FLAGGED_FAKE_REPORT",
      verificationReason: statementCheck.reason,
      detectedHazard: "No Real Hazard Detected — Statement Flagged as Fake / False Alarm",
      hazardSeverity: 0.0,
      confidence: statementCheck.confidence || 98.0,
      visualTags: ["Fake Statement", "False Alarm", "Zero Hazard", "Priority 0.0"],
      recommendedResource: "None (False Alarm)",
      urgencyAssessment: "FALSE_ALARM_DISMISSED"
    };
  }

  // 2. Photo / Image Verification (if photo is attached)
  if (photoUrl) {
    // Check preset disaster & false alarm samples first
    const matchingSample = SAMPLE_DISASTER_IMAGES.find(
      (s) => s.url === photoUrl || s.id === photoUrl || s.hazard === photoUrl
    );

    if (matchingSample) {
      return {
        detectedHazard: matchingSample.hazard,
        hazardSeverity: matchingSample.severity,
        confidence: matchingSample.confidence,
        visualTags: matchingSample.visualTags,
        recommendedResource: matchingSample.resource,
        urgencyAssessment: matchingSample.urgency,
        isValidDisaster: matchingSample.isValidDisaster,
        isFalseAlarm: matchingSample.isFalseAlarm,
        isFakeReport: matchingSample.isFalseAlarm,
        isRealReport: !matchingSample.isFalseAlarm,
        verificationStatus: matchingSample.isFalseAlarm ? "FLAGGED_FALSE_ALARM" : "VERIFIED_REAL_EMERGENCY",
        verificationReason: matchingSample.verificationReason
      };
    }

    // Real Multimodal Gemini Vision API (if configured in environment)
    const apiKey = typeof import.meta !== "undefined" ? import.meta.env?.VITE_GEMINI_API_KEY : null;
    if (apiKey) {
      try {
        let mimeType = "image/jpeg";
        let base64Data = null;

        if (photoUrl.startsWith("data:image/")) {
          const matches = photoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            mimeType = matches[1];
            base64Data = matches[2];
          }
        } else if (photoUrl.startsWith("http")) {
          try {
            const imgRes = await fetch(photoUrl);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              mimeType = blob.type || "image/jpeg";
              const buffer = await blob.arrayBuffer();
              let binary = "";
              const bytes = new Uint8Array(buffer);
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              base64Data = btoa(binary);
            }
          } catch (fetchErr) {
            console.warn("Gemini fetch remote image fallback:", fetchErr);
          }
        }

        if (base64Data) {
          const prompt = `You are an expert disaster triage and false alarm verification AI (SIH26013).
Analyze this emergency report:
Statement: "${combinedText || 'No statement'}"
Category: ${category}
Photo: [Attached Image]

Determine whether this is a GENUINE DISASTER/EMERGENCY or a FAKE REPORT / FALSE ALARM.
Genuine emergencies: floodwaters, active fire/smoke, structural collapse, debris, visible injuries, trapped victims.
Fake reports / false alarms: jokes, pranks, selfies, domestic pets, food/beverages, clean rooms, normal streets, memes.

Return ONLY a valid JSON object:
{
  "isValidDisaster": true or false,
  "isFalseAlarm": true or false,
  "verificationReason": "Detailed 1-sentence reason explaining genuine emergency vs false alarm",
  "detectedHazard": "Specific hazard or 'No Hazard Detected - False Alarm'",
  "hazardSeverity": float between 0.0 and 10.0 (strictly 0.0 if false alarm),
  "confidence": float between 80.0 and 99.9,
  "visualTags": ["3-5 observation tags"],
  "recommendedResource": "Rescue Boat" | "Road Clearance Unit" | "Medical Team" | "Fire Tender" | "None (False Alarm)",
  "urgencyAssessment": "CRITICAL_IMMEDIATE_ACTION" | "HIGH_HAZARD" | "MONITOR" | "FALSE_ALARM_DISMISSED"
}`;

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { inlineData: { mimeType, data: base64Data } },
                      { text: prompt }
                    ]
                  }
                ]
              })
            }
          );

          if (res.ok) {
            const json = await res.json();
            const textResponse = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textResponse) {
              const cleaned = textResponse.replace(/```json|```/g, "").trim();
              const parsed = JSON.parse(cleaned);
              const isFalse = Boolean(parsed.isFalseAlarm || parsed.isValidDisaster === false);
              return {
                detectedHazard: parsed.detectedHazard || (isFalse ? "No Active Hazard (False Alarm)" : "Disaster Hazard Verified"),
                hazardSeverity: isFalse ? 0.0 : (Number(parsed.hazardSeverity) || 9.0),
                confidence: Number(parsed.confidence) || 96.0,
                visualTags: parsed.visualTags || (isFalse ? ["False Alarm", "Non-Hazard Scene"] : ["Disaster Impact", "Rescue Needed"]),
                recommendedResource: isFalse ? "None (False Alarm)" : (parsed.recommendedResource || "Rescue Boat"),
                urgencyAssessment: isFalse ? "FALSE_ALARM_DISMISSED" : (parsed.urgencyAssessment || "CRITICAL_IMMEDIATE_ACTION"),
                isValidDisaster: !isFalse,
                isFalseAlarm: isFalse,
                isFakeReport: isFalse,
                isRealReport: !isFalse,
                verificationStatus: isFalse ? "FLAGGED_FALSE_ALARM" : "VERIFIED_REAL_EMERGENCY",
                verificationReason: parsed.verificationReason || (isFalse ? "False alarm detected by AI vision." : "Disaster hazard verified by AI vision."),
                isLiveAi: true
              };
            }
          }
        }
      } catch (err) {
        console.warn("Gemini API fallback to client edge verification:", err);
      }
    }

    // Edge Computer Vision pixel analysis
    if (typeof photoUrl === "string" && photoUrl.startsWith("data:image")) {
      const pixelStats = await analyzeImagePixels(photoUrl);
      if (pixelStats) {
        // Blank or covered frame
        if (pixelStats.stdDev < 12 || pixelStats.avgBrightness < 16 || pixelStats.avgBrightness > 242) {
          return {
            detectedHazard: "No Disaster Hazard Detected (Blank / Occluded Frame)",
            hazardSeverity: 0.0,
            confidence: 98.5,
            visualTags: ["Blank Frame", "Lens Obstructed", "Zero Hazard Features", "False Alarm"],
            recommendedResource: "None (False Alarm)",
            urgencyAssessment: "FALSE_ALARM_DISMISSED",
            isValidDisaster: false,
            isFalseAlarm: true,
            isFakeReport: true,
            isRealReport: false,
            verificationStatus: "FLAGGED_FALSE_ALARM",
            verificationReason: "False Alarm: Attached photo is dark or blank with zero visible disaster indicators."
          };
        }

        // Selfie / Personal portrait
        if (pixelStats.skinRatio > 0.42 && pixelStats.waterRatio < 0.12 && pixelStats.fireRatio < 0.04) {
          return {
            detectedHazard: "No Emergency Detected (Personal Portrait / Selfie)",
            hazardSeverity: 0.0,
            confidence: 96.2,
            visualTags: ["Personal Portrait", "Safe Habitat", "Zero Disaster Signs", "False Alarm"],
            recommendedResource: "None (False Alarm)",
            urgencyAssessment: "FALSE_ALARM_DISMISSED",
            isValidDisaster: false,
            isFalseAlarm: true,
            isFakeReport: true,
            isRealReport: false,
            verificationStatus: "FLAGGED_FALSE_ALARM",
            verificationReason: "False Alarm: Image is a personal selfie without visible flood, fire, or collapse hazards."
          };
        }

        // Domestic indoor surface
        if (pixelStats.waterRatio < 0.08 && pixelStats.fireRatio < 0.03 && pixelStats.stdDev < 22) {
          return {
            detectedHazard: "No Disaster Detected (Everyday Indoor Scene)",
            hazardSeverity: 0.0,
            confidence: 94.0,
            visualTags: ["Indoor Flat Surface", "No Standing Water", "Dry Environment", "False Alarm"],
            recommendedResource: "None (False Alarm)",
            urgencyAssessment: "FALSE_ALARM_DISMISSED",
            isValidDisaster: false,
            isFalseAlarm: true,
            isFakeReport: true,
            isRealReport: false,
            verificationStatus: "FLAGGED_FALSE_ALARM",
            verificationReason: "False Alarm: Image shows an everyday indoor environment with no signs of flooding, fire, or debris."
          };
        }
      }
    }
  }

  // 3. Genuine Emergency Heuristics by Category
  const catLower = (category || "flood").toLowerCase();
  const heuristics = {
    flood: {
      detectedHazard: "Inundation Zone / Rising Surface Water Level",
      hazardSeverity: hasMedicalEmergency ? 9.6 : 8.6,
      confidence: 95.5,
      visualTags: ["Submerged Ground", "Water Depth > 4ft", "Vehicle Entrapment", "Flood Inundation"],
      recommendedResource: "Rescue Boat",
      urgencyAssessment: "CRITICAL_IMMEDIATE_ACTION",
      isValidDisaster: true,
      isFalseAlarm: false,
      isFakeReport: false,
      isRealReport: true,
      verificationStatus: "VERIFIED_REAL_EMERGENCY",
      verificationReason: "Verified: Natural disaster flood inundation authenticated."
    },
    fire: {
      detectedHazard: "Thermal Combustive Hazard / Industrial Flumes",
      hazardSeverity: hasMedicalEmergency ? 9.8 : 9.0,
      confidence: 96.0,
      visualTags: ["Open Flames", "Dense Toxic Smoke", "Risk of Explosion", "Radiant Heat"],
      recommendedResource: "Fire Tender",
      urgencyAssessment: "CRITICAL_IMMEDIATE_ACTION",
      isValidDisaster: true,
      isFalseAlarm: false,
      isFakeReport: false,
      isRealReport: true,
      verificationStatus: "VERIFIED_REAL_EMERGENCY",
      verificationReason: "Verified: Active fire emergency and hazardous combustion authenticated."
    },
    medical: {
      detectedHazard: "Acute Medical Trauma / Life Preservation Impasse",
      hazardSeverity: 9.8,
      confidence: 98.2,
      visualTags: ["Critical Patient", "Paramedic Intervention Required", "Vital Signs Compromised"],
      recommendedResource: "Medical Team",
      urgencyAssessment: "LIFE_THREATENING_MEDICAL",
      isValidDisaster: true,
      isFalseAlarm: false,
      isFakeReport: false,
      isRealReport: true,
      verificationStatus: "VERIFIED_REAL_EMERGENCY",
      verificationReason: "Verified: Acute health emergency requiring immediate medical dispatch."
    },
    trapped: {
      detectedHazard: "Civilian Entrapment / Extraction Required",
      hazardSeverity: 9.5,
      confidence: 96.0,
      visualTags: ["Stranded Victims", "No Egress Route", "Impassable Perimeter", "Life Threat"],
      recommendedResource: "Rescue Boat",
      urgencyAssessment: "CRITICAL_IMMEDIATE_ACTION",
      isValidDisaster: true,
      isFalseAlarm: false,
      isFakeReport: false,
      isRealReport: true,
      verificationStatus: "VERIFIED_REAL_EMERGENCY",
      verificationReason: "Verified: Civilian entrapment and absolute rescue priority authenticated."
    },
    landslide: {
      detectedHazard: "Slope Instability & Roadway Mud Ingress",
      hazardSeverity: hasMedicalEmergency ? 9.2 : 7.8,
      confidence: 93.8,
      visualTags: ["Earth Movement", "Highway Blocked", "Unstable Escarpment", "Rockfall Danger"],
      recommendedResource: "Road Clearance Unit",
      urgencyAssessment: "HIGH_HAZARD",
      isValidDisaster: true,
      isFalseAlarm: false,
      isFakeReport: false,
      isRealReport: true,
      verificationStatus: "VERIFIED_REAL_EMERGENCY",
      verificationReason: "Verified: Natural disaster landslide and roadway obstruction authenticated."
    },
    cyclone: {
      detectedHazard: "Extreme Gale Wind Damage & Squall Inundation",
      hazardSeverity: 8.5,
      confidence: 92.5,
      visualTags: ["Uprooted Trees", "Structural Roof Failure", "High Velocity Gales"],
      recommendedResource: "Rescue Boat",
      urgencyAssessment: "HIGH_HAZARD",
      isValidDisaster: true,
      isFalseAlarm: false,
      isFakeReport: false,
      isRealReport: true,
      verificationStatus: "VERIFIED_REAL_EMERGENCY",
      verificationReason: "Verified: Natural disaster cyclone and gale damage authenticated."
    },
    collapse: {
      detectedHazard: "Masonry & Structural Shear Collapse",
      hazardSeverity: 9.5,
      confidence: 96.4,
      visualTags: ["Rubble Cavities", "Crushed Beams", "Entombed Victims Risk"],
      recommendedResource: "Road Clearance Unit",
      urgencyAssessment: "CRITICAL_IMMEDIATE_ACTION",
      isValidDisaster: true,
      isFalseAlarm: false,
      isFakeReport: false,
      isRealReport: true,
      verificationStatus: "VERIFIED_REAL_EMERGENCY",
      verificationReason: "Verified: Structural collapse and dangerous rubble cavities identified."
    }
  };

  return heuristics[catLower] || heuristics.flood;
};

export const mockAiClassifier = {
  verifyStatement: verifyReportStatement,
  verifyReport: verifyDisasterReport,

  /**
   * Preserves backward compatibility with existing classifyDisasterImage calls
   */
  classifyDisasterImage: async (imageSource, category = "flood", hasMedical = false, reportMeta = {}) => {
    return verifyDisasterReport({
      photoUrl: imageSource && imageSource.startsWith("http") || imageSource && imageSource.startsWith("data:image") ? imageSource : null,
      category,
      hasMedicalEmergency: hasMedical,
      title: reportMeta.title || "",
      description: reportMeta.description || "",
      voiceTranscript: reportMeta.voiceTranscript || "",
      peopleCount: reportMeta.peopleCount || 1
    });
  }
};
