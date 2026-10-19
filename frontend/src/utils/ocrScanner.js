import Tesseract from "tesseract.js";
import { GoogleGenAI, Type } from "@google/genai";

const monthsMap = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
};

// Helper to get the last day of a given month
function getLastDayOfMonth(year, month) {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  return new Date(y, m, 0).getDate();
}

// Format year and month into standard YYYY-MM-DD
function formatToYyyyMmDd(yearStr, monthStr, dayStr = null) {
  let year = yearStr.trim();
  if (year.length === 2) {
    year = `20${year}`;
  }
  let month = monthStr.trim();
  if (monthsMap[month.toLowerCase().slice(0, 3)]) {
    month = monthsMap[month.toLowerCase().slice(0, 3)];
  } else {
    month = month.padStart(2, "0");
  }

  // If day is not explicitly given, pharmaceutical standard is the last day of that month
  const day = dayStr ? dayStr.padStart(2, "0") : String(getLastDayOfMonth(year, month)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Parse expiry date from raw OCR text
export function parseExpiryDate(text) {
  if (!text) return "";

  // 1. Matches: EXP: 10/2026 or EXP 05/26 or EXP. 12-2027
  const expPattern1 = /(?:EXP|EXPIRY|EXP\.?|VAL\.?|USE\s*BEFORE|BEST\s*BEFORE)[\s.:/-]*([0-1]?[0-9])[\s.:/-]*(20\d{2}|\d{2})/i;
  const match1 = text.match(expPattern1);
  if (match1) {
    return formatToYyyyMmDd(match1[2], match1[1]);
  }

  // 2. Matches: EXP: OCT 2026 or EXP NOV-26
  const expPattern2 = /(?:EXP|EXPIRY|EXP\.?)[\s.:/-]*([A-Za-z]{3,9})[\s.:/-]*(20\d{2}|\d{2})/i;
  const match2 = text.match(expPattern2);
  if (match2 && monthsMap[match2[1].toLowerCase().slice(0, 3)]) {
    return formatToYyyyMmDd(match2[2], match2[1]);
  }

  // 3. Matches: EXP: 2026/10
  const expPattern3 = /(?:EXP|EXPIRY|EXP\.?)[\s.:/-]*(20\d{2})[\s.:/-]*([0-1]?[0-9])/i;
  const match3 = text.match(expPattern3);
  if (match3) {
    return formatToYyyyMmDd(match3[1], match3[2]);
  }

  // 4. Fallback search for any MM/YYYY or MM/YY near any date-like token
  const genericDatePattern = /\b([0-1]?[0-9])[\s.:/-](202[4-9]|203[0-9]|2[4-9]|3[0-9])\b/;
  const match4 = text.match(genericDatePattern);
  if (match4) {
    const m = parseInt(match4[1], 10);
    if (m >= 1 && m <= 12) {
      return formatToYyyyMmDd(match4[2], match4[1]);
    }
  }

  return "";
}

// Parse plausible medicine name from raw OCR text
export function parseMedicineName(text) {
  if (!text) return "";
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 3);

  const ignoredKeywords = [
    "mfg", "mfd", "batch", "b.no", "exp", "expiry", "lic", "mrp", "rs", "price",
    "tablets", "capsules", "composition", "storage", "store", "keep", "out of reach",
    "children", "warning", "dosage", "schedule", "prescription", "caution", "marketed",
    "manufactured", "pharmaceuticals", "pharma", "ltd", "pvt", "limited", "india", "pkg"
  ];

  for (const line of lines) {
    const lower = line.toLowerCase();
    const hasIgnored = ignoredKeywords.some((kw) => lower.startsWith(kw) || lower.includes(`${kw}:`) || lower.includes(`${kw}.`));
    if (hasIgnored) continue;

    // Remove stray special chars
    const cleaned = line.replace(/[^a-zA-Z0-9\s\-+]/g, "").trim();
    if (cleaned.length >= 3 && cleaned.length <= 40 && /[a-zA-Z]/.test(cleaned)) {
      return cleaned;
    }
  }

  return lines[0]?.replace(/[^a-zA-Z0-9\s\-+]/g, "").trim() || "";
}

// Convert file to Gemini inline data
const fileToGenerativePart = async (file) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

/**
 * Main OCR function:
 * 1. Attempts Gemini API if REACT_APP_GEMINI_API_KEY is configured.
 * 2. Seamlessly falls back to local in-browser Tesseract.js OCR.
 */
export async function performMedicationOCR(file, onProgress) {
  const geminiKey = process.env.REACT_APP_GEMINI_API_KEY;

  // 1. Try Gemini if key exists and is non-empty
  if (geminiKey && geminiKey.trim().length > 5) {
    if (onProgress) onProgress("Scanning with Gemini AI...");
    const genAI = new GoogleGenAI({ apiKey: geminiKey.trim() });
    const imagePart = await fileToGenerativePart(file);

    const promptText = `Analyze this image of a medicine label or blister pack.
Look carefully across the whole image, including text printed vertically along the side edges, margins, crimped foil, or embossed tabs.

Extract:
1. "name": The commercial brand name or salt name (e.g. "Levoflox-750" or "Levofloxacin Tablets IP 750 mg").
2. "expiryDate": The expiration date in standard "YYYY-MM-DD" format.
   - Look for text like "EXP. JUL. 29" or "EXP 07/29" or "EXP: 10/26".
   - If only month and year are printed (e.g. "EXP. JUL. 29"), use the last day of that month per pharmaceutical convention (e.g. "2029-07-31").

Return ONLY a valid JSON object:
{
  "name": "Medicine Name",
  "expiryDate": "YYYY-MM-DD"
}`;

    const candidateModels = ["gemini-3.8-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    let lastGeminiError = null;

    for (const model of candidateModels) {
      try {
        console.log(`🤖 Attempting Gemini model: ${model}...`);
        const response = await genAI.models.generateContent({
          model: model,
          contents: [imagePart, promptText],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                expiryDate: { type: Type.STRING },
              },
              required: ["name"],
            },
          },
        });

        const rawRespText = response?.text || "";
        const cleanJson = rawRespText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
        const parsed = JSON.parse(cleanJson);

        if (parsed && (parsed.name || parsed.expiryDate)) {
          console.log("✅ Gemini OCR Success:", parsed);
          return {
            name: parsed.name || "",
            expiryDate: parsed.expiryDate || "",
            engine: `Gemini AI (${model})`,
          };
        }
      } catch (err) {
        lastGeminiError = err;
        console.warn(`Gemini model ${model} failed:`, err.message || err);
      }
    }

    console.warn("All Gemini models encountered an error, falling back to Tesseract OCR:", lastGeminiError);
    if (lastGeminiError) {
      if (onProgress) onProgress(`Gemini error (${lastGeminiError.message || "key/quota issue"}), trying Tesseract OCR...`);
    }
  }

  // 2. Local Tesseract.js OCR (No API Key Required)
  if (onProgress) onProgress("Processing image with local Tesseract OCR...");
  
  const result = await Tesseract.recognize(file, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        const percent = Math.round((m.progress || 0) * 100);
        onProgress(`Recognizing text (${percent}%)...`);
      }
    },
  });

  const rawText = result?.data?.text || "";
  console.log("📄 Tesseract OCR Raw Text:\n", rawText);

  const detectedName = parseMedicineName(rawText);
  const detectedExpiry = parseExpiryDate(rawText);

  return {
    name: detectedName,
    expiryDate: detectedExpiry,
    rawText: rawText,
    engine: "Tesseract.js (Offline)",
  };
}
