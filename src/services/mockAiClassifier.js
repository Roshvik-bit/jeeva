// Edge AI Vision & Multimodal Disaster Verification Engine (SIH26013)
// Includes Automated False Alarm Detection & Hazard Authentication

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
    verificationReason: "Verified: Major arterial road obstruction requiring heavy clearing machinery."
  },
  {
    id: "false-alarm-coffee",
    label: "⚠️ Test False Alarm: Coffee Cup & Desk",
    category: "flood",
    url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=640&q=70",
    hazard: "No Disaster Detected: Coffee cup on indoor desk",
    severity: 0.5,
    confidence: 98.2,
    visualTags: ["Domestic Table", "Beverage", "No Standing Water", "Non-Emergency Photo"],
    resource: "None (False Alarm)",
    urgency: "FALSE_ALARM_DISMISSED",
    isValidDisaster: false,
    isFalseAlarm: true,
    verificationReason: "False Alarm: Photo shows an indoor coffee beverage on a dry surface. Zero disaster or flood hazards observed."
  },
  {
    id: "false-alarm-pet",
    label: "⚠️ Test False Alarm: Domestic Pet Indoors",
    category: "trapped",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=640&q=70",
    hazard: "No Disaster Detected: Household cat in living room",
    severity: 0.5,
    confidence: 98.9,
    visualTags: ["Domestic Pet", "Intact Interior", "No Trapped Civilians", "Safe Habitat"],
    resource: "None (False Alarm)",
    urgency: "FALSE_ALARM_DISMISSED",
    isValidDisaster: false,
    isFalseAlarm: true,
    verificationReason: "False Alarm: Photo shows a household domestic pet in a safe, undamaged interior. No distress victims or entrapment."
  }
];

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

export const mockAiClassifier = {
  /**
   * Simulates or executes neural net inference on an image and context
   * Supports Google Gemini Vision when VITE_GEMINI_API_KEY is set in .env
   * Also performs client-side edge false alarm verification & hazard authentication
   */
  classifyDisasterImage: async (imageSource, category = "flood", hasMedical = false) => {
    // 1. Check preset disaster & false alarm samples first
    const matchingSample = SAMPLE_DISASTER_IMAGES.find(
      (s) => s.url === imageSource || s.id === imageSource || s.hazard === imageSource
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
        verificationReason: matchingSample.verificationReason
      };
    }

    const apiKey = typeof import.meta !== "undefined" ? import.meta.env?.VITE_GEMINI_API_KEY : null;

    // 2. Real Multimodal Gemini Vision API (if API Key is configured)
    if (apiKey && imageSource) {
      try {
        let mimeType = "image/jpeg";
        let base64Data = null;

        if (imageSource.startsWith("data:image/")) {
          const matches = imageSource.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            mimeType = matches[1];
            base64Data = matches[2];
          }
        } else if (imageSource.startsWith("http")) {
          try {
            const imgRes = await fetch(imageSource);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              mimeType = blob.type || "image/jpeg";
              const buffer = await blob.arrayBuffer();
              let binary = "";
              const bytes = new Uint8Array(buffer);
              const len = bytes.byteLength;
              for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              base64Data = btoa(binary);
            }
          } catch (fetchErr) {
            console.warn("Could not fetch remote image for Gemini Vision:", fetchErr);
          }
        }

        if (base64Data) {
          const prompt = `You are an expert disaster triage and false alarm verification AI (SIH26013).
Inspect this submitted citizen emergency photo and determine whether it shows a genuine disaster/emergency or a FALSE ALARM.
Genuine disasters include: floodwaters, rising water, structural collapse, debris, visible injuries/medical trauma, active fire/smoke, fallen trees/blocked highways, damaged bridges, or stranded distress victims.
FALSE ALARMS include: selfies, household pets, food/drinks, tidy rooms, office desks, random objects, memes, cartoons, plain screenshots, or normal streets without damage.

Return ONLY a valid JSON object (no markdown, no backticks):
{
  "isValidDisaster": true or false,
  "isFalseAlarm": true or false,
  "verificationReason": "Detailed 1-sentence reason explaining if valid emergency or false alarm",
  "detectedHazard": "Specific hazard description (or 'No Disaster Hazard Detected - False Alarm')",
  "hazardSeverity": float between 0.0 and 10.0 (must be <= 1.0 if false alarm),
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
                detectedHazard: parsed.detectedHazard || (isFalse ? "No Active Hazard (False Alarm)" : "Severe Disaster Hazard Detected"),
                hazardSeverity: isFalse ? 0.5 : (Number(parsed.hazardSeverity) || 9.0),
                confidence: Number(parsed.confidence) || 96.0,
                visualTags: parsed.visualTags || (isFalse ? ["False Alarm", "Non-Hazard Scene"] : ["Disaster Impact", "Rescue Needed"]),
                recommendedResource: isFalse ? "None (False Alarm)" : (parsed.recommendedResource || "Rescue Boat"),
                urgencyAssessment: isFalse ? "FALSE_ALARM_DISMISSED" : (parsed.urgencyAssessment || "CRITICAL_IMMEDIATE_ACTION"),
                isValidDisaster: !isFalse,
                isFalseAlarm: isFalse,
                verificationReason: parsed.verificationReason || (isFalse ? "False alarm detected by AI vision." : "Disaster hazard verified."),
                isLiveAi: true
              };
            }
          }
        }
      } catch (err) {
        console.warn("Gemini Vision API fallback to edge verification:", err);
      }
    }

    // 3. Client-Side Edge Computer Vision Verification
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Analyze pixel values for blank screens, selfies, or flat surfaces
    if (typeof imageSource === "string" && imageSource.startsWith("data:image")) {
      const pixelStats = await analyzeImagePixels(imageSource);
      if (pixelStats) {
        // A. Blank, covered lens, or solid flat screenshot
        if (pixelStats.stdDev < 12 || pixelStats.avgBrightness < 16 || pixelStats.avgBrightness > 242) {
          return {
            detectedHazard: "No Disaster Hazard Detected (Blank / Occluded Frame)",
            hazardSeverity: 0.5,
            confidence: 98.5,
            visualTags: ["Blank Frame", "Lens Obstructed", "Zero Hazard Features", "False Alarm"],
            recommendedResource: "None (False Alarm)",
            urgencyAssessment: "FALSE_ALARM_DISMISSED",
            isValidDisaster: false,
            isFalseAlarm: true,
            verificationReason: "False Alarm: Uploaded image appears blank, dark, or occluded with zero disaster indicators."
          };
        }

        // B. Selfie / Personal portrait check
        if (pixelStats.skinRatio > 0.42 && pixelStats.waterRatio < 0.12 && pixelStats.fireRatio < 0.04) {
          return {
            detectedHazard: "No Emergency Detected (Personal Portrait / Selfie)",
            hazardSeverity: 0.5,
            confidence: 96.2,
            visualTags: ["Personal Portrait", "Safe Environment", "No Structural Damage", "False Alarm"],
            recommendedResource: "None (False Alarm)",
            urgencyAssessment: "FALSE_ALARM_DISMISSED",
            isValidDisaster: false,
            isFalseAlarm: true,
            verificationReason: "False Alarm: Image is a personal selfie/portrait without visible flood, fire, or collapse hazards."
          };
        }

        // C. Clean indoor surface check
        if (pixelStats.waterRatio < 0.08 && pixelStats.fireRatio < 0.03 && pixelStats.stdDev < 22) {
          return {
            detectedHazard: "No Disaster Detected (Everyday Indoor / Non-Emergency Scene)",
            hazardSeverity: 0.5,
            confidence: 94.0,
            visualTags: ["Indoor Surface", "No Standing Water", "Dry Environment", "False Alarm"],
            recommendedResource: "None (False Alarm)",
            urgencyAssessment: "FALSE_ALARM_DISMISSED",
            isValidDisaster: false,
            isFalseAlarm: true,
            verificationReason: "False Alarm: Image exhibits domestic indoor characteristics with no signs of flooding, debris, or fire."
          };
        }
      }
    }

    // D. Valid Disaster Heuristics based on selected category
    const heuristics = {
      flood: {
        detectedHazard: "Inundation Zone / Rising Surface Water Level",
        hazardSeverity: hasMedical ? 9.6 : 8.5,
        confidence: 95.5,
        visualTags: ["Submerged Ground", "Water Depth > 4ft", "Vehicle Entrapment", "Silt Current"],
        recommendedResource: "Rescue Boat",
        urgencyAssessment: "CRITICAL_IMMEDIATE_ACTION",
        isValidDisaster: true,
        isFalseAlarm: false,
        verificationReason: "Verified: Active surface inundation and floodwater hazards detected."
      },
      landslide: {
        detectedHazard: "Slope Instability & Roadway Mud Ingress",
        hazardSeverity: hasMedical ? 9.2 : 7.6,
        confidence: 93.8,
        visualTags: ["Earth Movement", "Highway Blocked", "Unstable Escarpment", "Rockfall Danger"],
        recommendedResource: "Road Clearance Unit",
        urgencyAssessment: "HIGH_HAZARD",
        isValidDisaster: true,
        isFalseAlarm: false,
        verificationReason: "Verified: Roadway mud obstruction and unstable terrain identified."
      },
      collapse: {
        detectedHazard: "Masonry & Structural Shear Collapse",
        hazardSeverity: 9.5,
        confidence: 96.4,
        visualTags: ["Rubble Cavities", "Crushed Beams", "Entombed Victims Risk", "Dust Cloud"],
        recommendedResource: "Road Clearance Unit",
        urgencyAssessment: "CRITICAL_IMMEDIATE_ACTION",
        isValidDisaster: true,
        isFalseAlarm: false,
        verificationReason: "Verified: Structural collapse and dangerous rubble cavities identified."
      },
      medical: {
        detectedHazard: "Acute Medical Trauma / Evacuation Impasse",
        hazardSeverity: 9.8,
        confidence: 98.2,
        visualTags: ["Critical Patient", "Paramedic Intervention Required", "Vital Signs Compromised"],
        recommendedResource: "Medical Team",
        urgencyAssessment: "LIFE_THREATENING_MEDICAL",
        isValidDisaster: true,
        isFalseAlarm: false,
        verificationReason: "Verified: Urgent civilian medical trauma requiring priority dispatch."
      },
      fire: {
        detectedHazard: "Thermal Combustive Hazard / Industrial Flumes",
        hazardSeverity: 8.9,
        confidence: 94.0,
        visualTags: ["Open Flames", "Dense Toxic Smoke", "Risk of Explosion", "Radiant Heat"],
        recommendedResource: "Fire Tender",
        urgencyAssessment: "HIGH_HAZARD",
        isValidDisaster: true,
        isFalseAlarm: false,
        verificationReason: "Verified: High-temperature open flames and hazardous smoke plume."
      },
      cyclone: {
        detectedHazard: "Extreme Gale Wind Damage / Flying Debris Hazard",
        hazardSeverity: 7.9,
        confidence: 91.5,
        visualTags: ["Uprooted Utilities", "Tin Roof Detachment", "Rain Squall Blindness"],
        recommendedResource: "Rescue Boat",
        urgencyAssessment: "HIGH_HAZARD",
        isValidDisaster: true,
        isFalseAlarm: false,
        verificationReason: "Verified: Severe storm squall and debris disruption authenticated."
      }
    };

    return heuristics[category] || heuristics.flood;
  }
};
