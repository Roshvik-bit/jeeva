export const PRESEEDED_INCIDENTS = [
  {
    id: "INC-2026-001",
    title: "Severe Ground Floor Inundation - Senior Care Facility",
    category: "flood", // flood, landslide, collapse, medical, fire, cyclone
    severity: "Critical", // Critical, High, Medium, Low
    status: "Dispatched", // Pending, Dispatched, On Scene, Resolved
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 18 mins ago
    location: {
      lat: 13.0845,
      lng: 80.2740,
      address: "Plot 42, Riverbed Road, Gandhi Nagar, Ward 8",
      landmark: "Near St. Anthony Church"
    },
    peopleCount: 16,
    hasMedicalEmergency: true,
    medicalDetails: "4 bedridden elderly individuals requiring continuous oxygen concentrators; power cut since 3 hours.",
    description: "Water level rapidly crossed 5 feet and entered ground floor ward. Current flow is severe. Windows submerged. Need urgent motorized boat evacuation with paramedics.",
    photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80",
    aiClassification: {
      detectedHazard: "Severe Flash Inundation / Submerged Ground Structures",
      hazardSeverity: 9.6,
      confidence: 97.4,
      visualTags: ["Water Depth > 5ft", "Trapped Inhabitants", "Submerged Transformers", "High Current Flow"],
      urgencyAssessment: "EXTREME_IMMEDIATE_DISPATCH"
    },
    voiceTranscript: "Water has broken through the perimeter wall! 16 people are trapped here, please send boats immediately, patients are running out of battery for oxygen!",
    recommendedResource: "Rescue Boat",
    assignedUnit: "UNIT-NDRF-02",
    priorityScore: 9.7,
    scoreBreakdown: {
      peopleScore: 3.5,
      medicalScore: 2.5,
      aiHazardScore: 2.4,
      recencyScore: 0.8,
      corroborationScore: 0.5
    },
    corroboratingReportsCount: 2,
    subReports: [
      {
        id: "SUB-REP-01A",
        reportedAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
        reporter: "Dr. K. Sharma (Staff Nurse)",
        peopleCount: 14,
        note: "Water rising above steps. Patients moved onto tables.",
        contact: "+91 98401 23456"
      },
      {
        id: "SUB-REP-01B",
        reportedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        reporter: "Suresh M. (Neighbor)",
        peopleCount: 2,
        note: "Can hear distress whistles from the old age home ground floor!",
        contact: "+91 98402 78910"
      }
    ]
  },
  {
    id: "INC-2026-002",
    title: "Structural Fracture & Bridge Obstruction on Arterial Canal",
    category: "collapse",
    severity: "Critical",
    status: "Pending",
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    location: {
      lat: 13.0690,
      lng: 80.2510,
      address: "North Arterial Overpass & Canal Link",
      landmark: "Opposite Metro Pillar 248"
    },
    peopleCount: 8,
    hasMedicalEmergency: true,
    medicalDetails: "2 commuters crushed beneath collapsed steel billboard girders on bridge ramp.",
    description: "Half of the bridge approach has fractured into the water. Two vehicles dangling at edge. Major evacuation corridor blocked for ambulances.",
    photoUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    aiClassification: {
      detectedHazard: "Structural Failure / Dangling Heavy Vehicles",
      hazardSeverity: 9.1,
      confidence: 94.8,
      visualTags: ["Critical Bridge Fracture", "Imminent Vehicle Fall", "Key Route Blocked", "Injured Commuters"],
      urgencyAssessment: "CRITICAL_ROUTE_BLOCK"
    },
    voiceTranscript: "The bridge slab just gave way! Send hydraulic cutters and crane immediately, people are trapped in the white taxi!",
    recommendedResource: "Road Clearance Unit",
    assignedUnit: null,
    priorityScore: 9.2,
    scoreBreakdown: {
      peopleScore: 2.8,
      medicalScore: 2.5,
      aiHazardScore: 2.3,
      recencyScore: 0.7,
      corroborationScore: 0.9
    },
    corroboratingReportsCount: 3,
    subReports: [
      {
        id: "SUB-REP-02A",
        reportedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        reporter: "Traffic Constable Rajan",
        peopleCount: 4,
        note: "Blocked north artery completely. Heavy rescue equipment needed.",
        contact: "+91 99401 11223"
      },
      {
        id: "SUB-REP-02B",
        reportedAt: new Date(Date.now() - 29 * 60 * 1000).toISOString(),
        reporter: "Priya V. (Commuter)",
        peopleCount: 3,
        note: "Cab passengers cannot open doors, girder on top.",
        contact: "+91 99402 33445"
      },
      {
        id: "SUB-REP-02C",
        reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        reporter: "Auto Driver Karthik",
        peopleCount: 1,
        note: "Please send ambulance urgently, head injury visible.",
        contact: "+91 99403 55667"
      }
    ]
  },
  {
    id: "INC-2026-003",
    title: "Cardiac Patient & Pregnant Mother Trapped in Flooded Slum Cluster",
    category: "medical",
    severity: "Critical",
    status: "Pending",
    timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    location: {
      lat: 13.0760,
      lng: 80.2645,
      address: "Kamaraj Colony, Low-lying Slum Sector 4",
      landmark: "Behind Canal Pumping Station"
    },
    peopleCount: 5,
    hasMedicalEmergency: true,
    medicalDetails: "32-year-old mother in active labor; 60-year-old grandfather having chest pains.",
    description: "Alleyways flooded chest-deep. 108 ambulance cannot enter due to water height. Require shallow boat with medical crew or stretcher float.",
    photoUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    aiClassification: {
      detectedHazard: "Acute Medical Emergency / Narrow Inaccessible Waterway",
      hazardSeverity: 9.4,
      confidence: 96.1,
      visualTags: ["High Medical Risk", "Inaccessible By Road", "Rising Water", "Pregnant Woman"],
      urgencyAssessment: "LIFE_THREATENING_MEDICAL"
    },
    voiceTranscript: "My sister is in labor pains! Water is inside our hut, ambulances say they cannot cross the flooded road, help us please!",
    recommendedResource: "Medical Team",
    assignedUnit: null,
    priorityScore: 9.4,
    scoreBreakdown: {
      peopleScore: 2.4,
      medicalScore: 3.0,
      aiHazardScore: 2.2,
      recencyScore: 1.0,
      corroborationScore: 0.8
    },
    corroboratingReportsCount: 2,
    subReports: [
      {
        id: "SUB-REP-03A",
        reportedAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
        reporter: "Arun Kumar (Brother)",
        peopleCount: 3,
        note: "Labor pains intensifying. No electricity, dark.",
        contact: "+91 97910 88221"
      },
      {
        id: "SUB-REP-03B",
        reportedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
        reporter: "ASHA Worker Meena",
        peopleCount: 2,
        note: "I am with the patient. Need ALS kit and sterile delivery pack.",
        contact: "+91 97911 44556"
      }
    ]
  },
  {
    id: "INC-2026-004",
    title: "High-Voltage Transformer Fire Sparking Over Floodwaters",
    category: "fire",
    severity: "High",
    status: "Pending",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    location: {
      lat: 13.0910,
      lng: 80.2830,
      address: "Corner of Market Road & Dockside",
      landmark: "Next to Substation 11"
    },
    peopleCount: 12,
    hasMedicalEmergency: false,
    medicalDetails: "No burn injuries yet, but electrical arcing in water is posing extreme electrocution hazard.",
    description: "Transformer caught fire after lightning strike and water ingress. High voltage sparking directly into standing street water. 12 residents trapped in adjacent grocery store balcony.",
    photoUrl: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=800&q=80",
    aiClassification: {
      detectedHazard: "Active Electrical Arcing into Water / Structural Fire",
      hazardSeverity: 8.8,
      confidence: 93.0,
      visualTags: ["Live Electric Sparking", "Inundated Street", "Dense Toxic Smoke", "Grid Isolation Needed"],
      urgencyAssessment: "HIGH_ELECTROCUTION_RISK"
    },
    voiceTranscript: "Transformer is exploding with sparks in the water! Don't let anyone step into the water, call electricity board and fire department!",
    recommendedResource: "Fire Tender",
    assignedUnit: null,
    priorityScore: 8.4,
    scoreBreakdown: {
      peopleScore: 3.0,
      medicalScore: 1.0,
      aiHazardScore: 2.4,
      recencyScore: 0.5,
      corroborationScore: 1.5
    },
    corroboratingReportsCount: 4,
    subReports: [
      {
        id: "SUB-REP-04A",
        reportedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        reporter: "Shopkeeper Ramesh",
        peopleCount: 5,
        note: "Sparks flying everywhere.",
        contact: "+91 98840 12345"
      },
      {
        id: "SUB-REP-04B",
        reportedAt: new Date(Date.now() - 43 * 60 * 1000).toISOString(),
        reporter: "Security Guard Mani",
        peopleCount: 7,
        note: "Grid switch must be tripped from substation.",
        contact: "+91 98840 67890"
      }
    ]
  },
  {
    id: "INC-2026-005",
    title: "Massive Banyan Tree & Mudslide Blocking Evacuation Route 7",
    category: "landslide",
    severity: "Medium",
    status: "On Scene",
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    location: {
      lat: 13.0580,
      lng: 80.2380,
      address: "Hill Link Road KM 14",
      landmark: "Near Forest Checkpost"
    },
    peopleCount: 6,
    hasMedicalEmergency: false,
    medicalDetails: "No immediate trauma, but 4 tourist vehicles stranded on mountain road.",
    description: "Massive uprooted tree across both lanes with mud debris. SDRF team is clearing with chainsaws. Estimated 35 mins to clear lane 1.",
    photoUrl: "https://images.unsplash.com/photo-1542314831-c6a4d27376db?auto=format&fit=crop&w=800&q=80",
    aiClassification: {
      detectedHazard: "Vegetation & Mud Obstruction on Dual Carriageway",
      hazardSeverity: 6.4,
      confidence: 91.5,
      visualTags: ["Heavy Tree Fall", "Mud Runoff", "Vehicles Stranded", "No Crushed Cabins"],
      urgencyAssessment: "CLEARANCE_IN_PROGRESS"
    },
    voiceTranscript: "Road is completely blocked by huge tree, we cannot move forward or reverse due to mud. 6 of us waiting in cars.",
    recommendedResource: "Road Clearance Unit",
    assignedUnit: "UNIT-SDRF-ENG",
    priorityScore: 6.8,
    scoreBreakdown: {
      peopleScore: 2.2,
      medicalScore: 0,
      aiHazardScore: 1.8,
      recencyScore: 0.8,
      corroborationScore: 2.0
    },
    corroboratingReportsCount: 2,
    subReports: []
  },
  {
    id: "INC-2026-006",
    title: "Drinking Water & Rations Shortage at Cyclone Relief Shelter",
    category: "cyclone",
    severity: "Low",
    status: "Resolved",
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    location: {
      lat: 13.0420,
      lng: 80.2590,
      address: "Community Hall Camp, Sector 9",
      landmark: "Opposite Govt High School"
    },
    peopleCount: 45,
    hasMedicalEmergency: false,
    medicalDetails: "Infant milk formula and dry rations replenished by district supply truck.",
    description: "45 evacuees housed in community hall had run out of clean drinking water. Municipal water tanker successfully dispatched and distributed 3000L safe water.",
    photoUrl: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800&q=80",
    aiClassification: {
      detectedHazard: "Shelter Resource Depletion / Safe Inundation Margins",
      hazardSeverity: 4.2,
      confidence: 88.0,
      visualTags: ["Organized Shelter", "Dry High Ground", "Sufficient Space", "Clean Water Delivered"],
      urgencyAssessment: "RESOLVED_DISTRIBUTION"
    },
    voiceTranscript: "We have over 40 people in the school hall and clean water has run out, please send water bottles.",
    recommendedResource: "Rescue Boat",
    assignedUnit: null,
    priorityScore: 4.2,
    scoreBreakdown: {
      peopleScore: 2.5,
      medicalScore: 0,
      aiHazardScore: 1.0,
      recencyScore: 0.2,
      corroborationScore: 0.5
    },
    corroboratingReportsCount: 1,
    subReports: []
  }
];
