import { GoogleGenAI } from "@google/genai";

/**
 * AI Clinical Drug-Drug Interaction (DDI) & Food Safety Checker
 * Powered by Gemini 3.8 Flash with local clinical rules fallback.
 */

export async function analyzeClinicalSafety(medicationsList) {
  if (!medicationsList || medicationsList.length === 0) {
    return {
      safetyScore: 100,
      overallStatus: "SAFE",
      summary: "No active medications to analyze.",
      interactions: [],
      foodWarnings: [],
      keyPrecautions: ["Always take medications as prescribed by your registered physician."]
    };
  }

  const medNames = medicationsList.map((m) => m.tableName || m.name || m).join(", ");
  const geminiKey = process.env.REACT_APP_GEMINI_API_KEY;

  if (geminiKey && geminiKey.trim().length > 5) {
    try {
      const genAI = new GoogleGenAI({ apiKey: geminiKey.trim() });
      const prompt = `You are a clinical pharmacologist. Analyze this list of concurrently prescribed medications for a patient:
${medNames}

Provide an evidence-based clinical safety evaluation in JSON format:
{
  "safetyScore": <number between 50 and 100>,
  "overallStatus": "SAFE" or "CAUTION" or "HIGH_RISK",
  "summary": "<1-2 sentence clinical summary>",
  "interactions": [
    {
      "drugs": "<Drug A + Drug B>",
      "severity": "Mild" or "Moderate" or "Severe",
      "effect": "<Clinical effect or risk>",
      "management": "<Actionable instruction for patient or caretaker>"
    }
  ],
  "foodWarnings": [
    {
      "drug": "<Drug Name>",
      "warning": "<Dietary or food restriction, e.g. avoid dairy/alcohol/take with meals>"
    }
  ],
  "keyPrecautions": [
    "<Precaution 1>",
    "<Precaution 2>"
  ]
}
Return ONLY valid JSON.`;

      const response = await genAI.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const raw = response?.text || "";
      const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(clean);
      if (parsed && parsed.overallStatus) {
        parsed.source = "Gemini 3.8 Flash Clinical AI";
        return parsed;
      }
    } catch (err) {
      console.warn("Gemini clinical safety check failed, using local clinical rules engine:", err);
    }
  }

  // --- Offline Rule-Based Fallback Clinical Analysis ---
  const lowerNames = medNames.toLowerCase();
  const interactions = [];
  const foodWarnings = [];
  const precautions = [];

  if (lowerNames.includes("levoflox") || lowerNames.includes("cipro")) {
    foodWarnings.push({
      drug: "Fluoroquinolones (Levofloxacin)",
      warning: "Avoid calcium-rich foods (milk, yogurt) and iron supplements 2 hours before or after taking this dose."
    });
    precautions.push("Drink at least 2 liters of water daily to prevent kidney crystalluria while on quinolones.");
  }

  if (lowerNames.includes("panto") || lowerNames.includes("omeprazole")) {
    foodWarnings.push({
      drug: "Proton Pump Inhibitors (Pantoprazole)",
      warning: "Take 30 to 60 minutes before morning breakfast for optimal acid suppression."
    });
  }

  if (lowerNames.includes("metformin")) {
    foodWarnings.push({
      drug: "Metformin",
      warning: "Take with or immediately after meals to minimize stomach upset and nausea."
    });
    precautions.push("Avoid excessive alcohol intake as it increases the risk of lactic acidosis.");
  }

  if (lowerNames.includes("paracetamol")) {
    precautions.push("Do not exceed 4,000 mg of Paracetamol daily from all combined sources to prevent hepatotoxicity.");
  }

  if (lowerNames.includes("levoflox") && lowerNames.includes("panto")) {
    interactions.push({
      drugs: "Levofloxacin + Pantoprazole",
      severity: "Moderate",
      effect: "PPI-induced gastric pH increase may slightly diminish fluoroquinolone bioavailability.",
      management: "Separate administration timing by at least 2 hours."
    });
  }

  const score = interactions.length > 0 ? 82 : 95;
  return {
    safetyScore: score,
    overallStatus: interactions.length > 0 ? "CAUTION" : "SAFE",
    summary: interactions.length > 0 
      ? `Found ${interactions.length} moderate drug interaction(s). Spacing medication timings is recommended.`
      : "No severe drug-drug interactions detected across your active regimen.",
    interactions,
    foodWarnings,
    keyPrecautions: precautions.length > 0 ? precautions : ["Maintain consistent daily dosing times."],
    source: "Clinical Rules Engine (Offline Fallback)"
  };
}
