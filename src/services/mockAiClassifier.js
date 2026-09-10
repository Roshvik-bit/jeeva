// Edge AI Vision Simulation Engine for Disaster Hazard Detection
export const SAMPLE_DISASTER_IMAGES = [
  {
    id: "flood-rooftop",
    label: "Urban Flooding & Rooftop Evacuation",
    category: "flood",
    url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    hazard: "Severe Inundation / Trapped Residents on Elevated Structures",
    severity: 9.7,
    confidence: 97.2,
    visualTags: ["Water Level > 5ft", "Current Speed: 1.8 m/s", "Submerged Transformer", "Hand Gestures Detected"],
    resource: "Rescue Boat",
    urgency: "CRITICAL_IMMEDIATE_ACTION"
  },
  {
    id: "bridge-collapse",
    label: "Bridge & Overpass Structural Failure",
    category: "collapse",
    url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    hazard: "Bridge Deck Fracture / Vehicle Dangling Over Chasm",
    severity: 9.3,
    confidence: 95.4,
    visualTags: ["Structural Shear Failure", "Arterial Road Severed", "Vehicle Impact", "Secondary Collapse Risk"],
    resource: "Road Clearance Unit",
    urgency: "CRITICAL_IMMEDIATE_ACTION"
  },
  {
    id: "medical-trauma",
    label: "Casualty / Medical Distress in Water",
    category: "medical",
    url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    hazard: "Critical Patient Immobility / Hypothermia & Trauma",
    severity: 9.5,
    confidence: 96.8,
    visualTags: ["Immobilized Patient", "Oxygen Requirement", "Elderly Subject", "Inaccessible Roadway"],
    resource: "Medical Team",
    urgency: "LIFE_THREATENING_MEDICAL"
  },
  {
    id: "electric-fire",
    label: "Electrical Fire & Submerged Substation",
    category: "fire",
    url: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=800&q=80",
    hazard: "Electrical Arcing in Floodwaters / Chemical Fire",
    severity: 8.9,
    confidence: 93.6,
    visualTags: ["High Voltage Arc", "Conductive Standing Water", "Toxic Dense Plume", "Flammable Oils"],
    resource: "Fire Tender",
    urgency: "HIGH_HAZARD"
  },
  {
    id: "tree-debris",
    label: "Fallen Tree & Mud Debris Highway Block",
    category: "landslide",
    url: "https://images.unsplash.com/photo-1542314831-c6a4d27376db?auto=format&fit=crop&w=800&q=80",
    hazard: "Vegetation & Mud Obstruction Blocking Escape Route",
    severity: 6.8,
    confidence: 91.2,
    visualTags: ["Heavy Trunk Diameter > 1m", "Both Lanes Impassable", "Stranded Civilians", "No Crush Fatalities"],
    resource: "Road Clearance Unit",
    urgency: "CLEARANCE_IN_PROGRESS"
  }
];

export const mockAiClassifier = {
  /**
   * Simulates or executes neural net inference on an image and context
   * Supports Google Gemini API when VITE_GEMINI_API_KEY is set in .env
   * @param {string} imageSource - Data URI, URL, or image identifier
   * @param {string} category - disaster category hint
   * @param {boolean} hasMedical - whether medical urgency flagged
   * @returns {Promise<Object>} classification results
   */
  classifyDisasterImage: async (imageSource, category = "flood", hasMedical = false) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // If a Gemini API key is configured, call Gemini Vision
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
            console.warn("Could not fetch remote image for Gemini, using edge heuristics:", fetchErr);
          }
        }

        if (base64Data) {
          const prompt = `Analyze this emergency/disaster photo for rapid rescue coordination (SIH26013).
Return ONLY a valid JSON object (no markdown, no backticks) with:
{
  "detectedHazard": "Specific hazard description (e.g., Severe Flash Inundation / Submerged Transformer)",
  "hazardSeverity": 9.4 (float between 1.0 and 10.0),
  "confidence": 97.2 (float between 80.0 and 99.9),
  "visualTags": ["3-5 key observation tags"],
  "recommendedResource": "Rescue Boat" (must be one of: "Rescue Boat", "Road Clearance Unit", "Medical Team", "Fire Tender"),
  "urgencyAssessment": "CRITICAL_IMMEDIATE_ACTION"
}`;

          // Try gemini-1.5-flash
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
              return {
                detectedHazard: parsed.detectedHazard || "Severe Disaster Hazard Detected",
                hazardSeverity: Number(parsed.hazardSeverity) || 9.2,
                confidence: Number(parsed.confidence) || 96.0,
                visualTags: parsed.visualTags || ["Disaster Impact", "Rescue Needed"],
                recommendedResource: parsed.recommendedResource || "Rescue Boat",
                urgencyAssessment: parsed.urgencyAssessment || "CRITICAL_IMMEDIATE_ACTION",
                isLiveAi: true
              };
            }
          } else {
            const errBody = await res.text();
            console.warn(`Gemini API responded with ${res.status}:`, errBody);
          }
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to edge classifier:", err);
      }
    }

    // Artificial 400ms inference latency for edge processing feel
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Check if it matches a preset sample
    const matchingSample = SAMPLE_DISASTER_IMAGES.find(
      (s) => s.url === imageSource || s.id === imageSource || s.category === category
    );

    if (matchingSample) {
      return {
        detectedHazard: matchingSample.hazard,
        hazardSeverity: matchingSample.severity,
        confidence: matchingSample.confidence,
        visualTags: matchingSample.visualTags,
        recommendedResource: matchingSample.resource,
        urgencyAssessment: matchingSample.urgency
      };
    }

    // Dynamic heuristic classification based on category
    const heuristics = {
      flood: {
        detectedHazard: "Inundation Zone / Rising Surface Water Level",
        hazardSeverity: hasMedical ? 9.6 : 8.5,
        confidence: 94.5,
        visualTags: ["Submerged Ground", "Water Depth > 4ft", "Vehicle Entrapment", "Silt Current"],
        recommendedResource: "Rescue Boat",
        urgencyAssessment: "CRITICAL_IMMEDIATE_ACTION"
      },
      landslide: {
        detectedHazard: "Slope Instability & Roadway Mud Ingress",
        hazardSeverity: hasMedical ? 9.2 : 7.6,
        confidence: 92.8,
        visualTags: ["Earth Movement", "Highway Blocked", "Unstable Escarpment", "Rockfall Danger"],
        recommendedResource: "Road Clearance Unit",
        urgencyAssessment: "HIGH_HAZARD"
      },
      collapse: {
        detectedHazard: "Masonry & Structural Shear Collapse",
        hazardSeverity: 9.5,
        confidence: 95.8,
        visualTags: ["Rubble Cavities", "Crushed Beams", "Entombed Victims Risk", "Dust Cloud"],
        recommendedResource: "Road Clearance Unit",
        urgencyAssessment: "CRITICAL_IMMEDIATE_ACTION"
      },
      medical: {
        detectedHazard: "Acute Medical Trauma / Evacuation Impasse",
        hazardSeverity: 9.8,
        confidence: 98.2,
        visualTags: ["Critical Patient", "Paramedic Intervention Required", "Vital Signs Compromised"],
        recommendedResource: "Medical Team",
        urgencyAssessment: "LIFE_THREATENING_MEDICAL"
      },
      fire: {
        detectedHazard: "Thermal Combustive Hazard / Industrial Flumes",
        hazardSeverity: 8.9,
        confidence: 93.4,
        visualTags: ["Open Flames", "Dense Toxic Smoke", "Risk of Explosion", "Radiant Heat"],
        recommendedResource: "Fire Tender",
        urgencyAssessment: "HIGH_HAZARD"
      },
      cyclone: {
        detectedHazard: "Extreme Gale Wind Damage / Flying Debris Hazard",
        hazardSeverity: 7.9,
        confidence: 90.5,
        visualTags: ["Uprooted Utilities", "Tin Roof Detachment", "Rain Squall Blindness"],
        recommendedResource: "Rescue Boat",
        urgencyAssessment: "HIGH_HAZARD"
      }
    };

    return heuristics[category] || heuristics.flood;
  }
};
