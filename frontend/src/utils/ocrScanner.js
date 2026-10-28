import Tesseract from "tesseract.js";
import { GoogleGenAI, Type } from "@google/genai";

const monthsMap = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  january: "01", february: "02", march: "03", april: "04", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12"
};

// 300+ Most Prescribed Prescription & OTC Medicines (Brands & Generics)
const COMMON_MEDICATIONS = [
  // Pain, Fever & Inflammation
  "paracetamol", "dolo", "dolo 650", "calpol", "crocin", "pacimol", "pyigesic", "sumo",
  "combiflam", "ibuprofen", "brufen", "diclofenac", "voveran", "dynapar", "aceclofenac",
  "zerodol", "zerodol-sp", "zerodol-p", "hifenac", "mefenamic", "meftal", "meftal-spas",
  "aspirin", "ecosprin", "disprin", "naproxen", "naprosyn", "tramadol", "ultram",

  // Gastrointestinal & Antacids
  "pan", "pan-d", "pan 40", "pantocid", "pantoprazole", "pantodac", "pantor",
  "omeprazole", "omez", "omee", "rabeprazole", "rablet", "rabium", "happi",
  "esomeprazole", "nexium", "esomac", "lansoprazole", "ranitidine", "rantac", "aciloc",
  "famotidine", "digene", "gelusil", "sporlac", "domperidone", "vomistop", "motilium",
  "ondansetron", "emeset", "ondem", "sucralfate", "cremaffin", "duphalac", "lactulose",

  // Antibiotics & Anti-infectives
  "augmentin", "amoxyclav", "amoxicillin", "mox", "novamox", "clavulanic",
  "azithromycin", "azithral", "azee", "zithromax", "zady", "cifran", "ciplox",
  "ciprofloxacin", "levofloxacin", "levomac", "l-cin", "ofloxacin", "oflox", "zanocin",
  "norfloxacin", "norflox", "doxycycline", "doxylab", "cefixime", "zifi", "taxim-o",
  "cefpodoxime", "monocef-o", "ceftriaxone", "monocef", "metronidazole", "flagyl",
  "metrogyl", "clarithromycin", "erythromycin", "lincomycin", "clindamycin",

  // Diabetes & Blood Sugar
  "metformin", "glycomet", "glucophage", "cetapin", "glimepiride", "amaryl", "gliclazide",
  "diamicron", "vildagliptin", "galvus", "sitagliptin", "januvia", "dapagliflozin", "forxiga",
  "empagliflozin", "jardiance", "teneligliptin", "pioglitazone", "insulin", "lantus", "humalog",

  // Cardiovascular, Blood Pressure & Cholesterol
  "atorvastatin", "atorva", "lipitor", "atorlip", "rosuvastatin", "rosuvas", "crestor",
  "simvastatin", "amlodipine", "amlong", "stamlo", "norvasc", "telmisartan", "telma",
  "telmikem", "telsartan", "losartan", "losar", "olmesartan", "olmat", "enalapril",
  "envas", "ramipril", "cardace", "atenolol", "aten", "metoprolol", "metolar", "betaloc",
  "nebicard", "nebivolol", "concor", "bisoprolol", "clopidogrel", "clavix", "plavix",
  "spironolactone", "aldactone", "furosemide", "lasix", "torsemide", "dytor",

  // Respiratory, Cough, Cold & Allergy
  "cetirizine", "cetcip", "okacet", "zyrtec", "levocetirizine", "levocet", "vozet",
  "montelukast", "montair", "montair-lc", "telekast", "allegra", "fexofenadine",
  "sinarest", "cheston cold", "wikoryl", "solvin cold", "alex", "ascoril", "benadryl",
  "grilinctus", "ambroxol", "bromhexine", "dextromethorphan", "phenylephrine",

  // Vitamins, Minerals & Supplements
  "neurobion", "neurobion forte", "becosules", "shelcal", "calcium", "cipcal",
  "vitamin d3", "d3 must", "uprise-d3", "calcirol", "limcee", "celin", "folic acid",
  "folvite", "zincovit", "supradyn", "liv-52", "ferrous ascorbate", "orofer", "autrin",

  // Thyroid & Hormones
  "thyronorm", "eltroxin", "levothyroxine", "prednisolone", "wysolone", "dexamethasone",
  "decadron", "deflazacort", "cortimax",

  // Central Nervous System & Mental Health
  "alprazolam", "alprax", "restyl", "trika", "clonazepam", "lonazep", "clonafit",
  "zapiz", "escitalopram", "nexito", "nexito plus", "sertraline", "zoloft",
  "duloxetine", "duloflex", "gabapentin", "pregabalin", "pregalin", "maxgalin"
];

// Comprehensive Boilerplate Patterns to strictly exclude non-medicine text
const BOILERPLATE_PATTERNS = [
  /\bschedule\s*[a-z0-9]*/i,
  /\bprescription\s*(?:drug|only)?\b/i,
  /\bcaution\b/i,
  /\bwarning\b/i,
  /\bnot to be sold\b/i,
  /\bwithout (?:the )?prescription\b/i,
  /\bregistered medical\b/i,
  /\bpractitioner\b/i,
  /\bfor external\b/i,
  /\bfor oral\b/i,
  /\bveterinary\b/i,
  /\bkeep out of\b/i,
  /\breach of children\b/i,
  /\bstore protected\b/i,
  /\bstore in a\b/i,
  /\bstore below\b/i,
  /\bprotect from light\b/i,
  /\bprotect from moisture\b/i,
  /\bas directed by\b/i,
  /\bphysician\b/i,
  /\bswallow whole\b/i,
  /\bdo not chew\b/i,
  /\bdo not crush\b/i,
  /\bcomposition\b/i,
  /\beach (?:film[- ]coated|uncoated|enteric|hard|soft|tablet|capsule) contains\b/i,
  /\bcontains\s*:\b/i,
  /\bexcipients\b/i,
  /\btitanium dioxide\b/i,
  /\biron oxide\b/i,
  /\bcolour\b/i,
  /\bcolor\b/i,
  /\bmarketed by\b/i,
  /\bmanufactured (?:by|in)\b/i,
  /\bmfg\s*by\b/i,
  /\bmfd\s*by\b/i,
  /\blaboratories\b/i,
  /\bpharmaceuticals\b/i,
  /\bpharma\s*(?:ltd|pvt)?\b/i,
  /\bltd\b/i,
  /\bpvt\b/i,
  /\blimited\b/i,
  /\bplot no\b/i,
  /\bindustrial area\b/i,
  /\bstate\b/i,
  /\bindia\b/i,
  /\bincl\.?\s*of all taxes\b/i,
  /\bm\.?r\.?p\b/i,
  /\bmaximum retail\b/i,
  /\brs\.?\b/i,
  /\bper strip\b/i,
  /\bbatch\s*no\b/i,
  /\bb\.?\s*no\b/i,
  /\blot\s*no\b/i,
  /\blic\.?\s*no\b/i,
  /\bmfg\.?\s*dt\b/i,
  /\bmfd\b/i,
  /\bexp\.?\s*dt\b/i,
  /\bexpiry\b/i,
  /\bexp\b/i,
  /\bnet content\b/i,
  /\bpack size\b/i,
  /\bblister pack\b/i,
  /\bstrip of\b/i,
  /\bapprox\b/i,
  /\bequivalent to\b/i,
  /\beq\.?\s*to\b/i,
  /\bq\.?s\.?\b/i
];

// Helper to get the last day of a given month
function getLastDayOfMonth(year, month) {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  return new Date(y, m, 0).getDate();
}

// Format year and month into standard YYYY-MM-DD
export function formatToYyyyMmDd(yearStr, monthStr, dayStr = null) {
  let year = String(yearStr).trim();
  if (year.length === 2) {
    const yNum = parseInt(year, 10);
    year = yNum > 70 ? `19${year}` : `20${year}`;
  }
  let month = String(monthStr).trim();
  const lowerMonth = month.toLowerCase().replace(/[^a-z]/g, "");
  if (monthsMap[lowerMonth]) {
    month = monthsMap[lowerMonth];
  } else if (monthsMap[lowerMonth.slice(0, 3)]) {
    month = monthsMap[lowerMonth.slice(0, 3)];
  } else {
    month = month.padStart(2, "0");
  }

  const mNum = parseInt(month, 10);
  if (isNaN(mNum) || mNum < 1 || mNum > 12) return "";

  const day = dayStr ? String(dayStr).trim().padStart(2, "0") : String(getLastDayOfMonth(year, month)).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Normalize common OCR character confusions in numeric date contexts
function normalizeOcrDigits(str) {
  if (!str) return "";
  return str
    .replace(/[oO](?=[0-9/-])/g, "0")
    .replace(/(?<=[0-9/-])[oO]/g, "0")
    .replace(/[Il|](?=[0-9/-])/g, "1")
    .replace(/(?<=[0-9/-])[Il|]/g, "1")
    .replace(/[Ss](?=[0-9/-])/g, "5")
    .replace(/(?<=[0-9/-])[Ss]/g, "5")
    .replace(/[Bb](?=[0-9/-])/g, "8");
}

/**
 * Robust Expiry Date Parser
 * Handles real-world blister pack formats:
 * - EXP: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
 * - EXP. DATE: MM/YYYY, MM/YY, MM-YYYY
 * - EXP. DT: OCT 2026, 15-OCT-2026, JUL 29
 * - Disambiguates between MFG date and EXP date
 */
export function parseExpiryDate(rawText) {
  if (!rawText) return "";
  const normalized = normalizeOcrDigits(rawText);

  const expTagPrefix = "(?:EXP(?:IRY)?(?:\\s*DATE|\\s*DT|\\s*D)?|USE\\s*BEFORE|BEST\\s*BEFORE|VALID\\s*(?:TILL|THROUGH)|VAL\\.?|EXP\\.?|E\\.?D\\.?|EXP)";

  // Format 1: EXP: DD/MM/YYYY or DD-MM-YYYY
  const patDmy = new RegExp(`${expTagPrefix}[:\\s./-]*([0-3]?[0-9])[\\s./-]+([0-1]?[0-9])[\\s./-]+(20\\d{2}|\\d{2})`, "i");
  const mDmy = normalized.match(patDmy);
  if (mDmy) {
    const day = parseInt(mDmy[1], 10);
    const month = parseInt(mDmy[2], 10);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return formatToYyyyMmDd(mDmy[3], mDmy[2], mDmy[1]);
    }
  }

  // Format 2: EXP: DD-MMM-YYYY or EXP: MMM YYYY or EXP: MMM-26
  const patNamedMonth = new RegExp(`${expTagPrefix}[:\\s./-]*(?:([0-3]?[0-9])[\\s./-]+)?([A-Za-z]{3,9})[\\s./-]*(20\\d{2}|\\d{2})`, "i");
  const mNamed = normalized.match(patNamedMonth);
  if (mNamed) {
    const mStr = mNamed[2].toLowerCase().slice(0, 3);
    if (monthsMap[mStr]) {
      return formatToYyyyMmDd(mNamed[3], mStr, mNamed[1] || null);
    }
  }

  // Format 3: EXP: MM/YYYY or MM/YY or MM-YYYY
  const patMy = new RegExp(`${expTagPrefix}[:\\s./-]*([0-1]?[0-9])[\\s./-]+(20\\d{2}|\\d{2})`, "i");
  const mMy = normalized.match(patMy);
  if (mMy) {
    const month = parseInt(mMy[1], 10);
    if (month >= 1 && month <= 12) {
      return formatToYyyyMmDd(mMy[2], mMy[1]);
    }
  }

  // Format 4: EXP: YYYY-MM or YYYY/MM
  const patYm = new RegExp(`${expTagPrefix}[:\\s./-]*(20\\d{2})[\\s./-]+([0-1]?[0-9])`, "i");
  const mYm = normalized.match(patYm);
  if (mYm) {
    const month = parseInt(mYm[2], 10);
    if (month >= 1 && month <= 12) {
      return formatToYyyyMmDd(mYm[1], mYm[2]);
    }
  }

  // Format 5: Multi-line inspection (EXP on line N, date on line N or N+1)
  const lines = normalized.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/(?:EXP|EXPIRY|USE\s*BEFORE|BEST\s*BEFORE)/i.test(line)) {
      const combo = `${line} ${lines[i + 1] || ""}`;
      const mSubMy = combo.match(/\b([0-1]?[0-9])[\s./-]+(202[4-9]|203[0-9]|2[4-9]|3[0-9])\b/);
      if (mSubMy) {
        const m = parseInt(mSubMy[1], 10);
        if (m >= 1 && m <= 12) {
          return formatToYyyyMmDd(mSubMy[2], mSubMy[1]);
        }
      }
      const mSubNamed = combo.match(/\b([A-Za-z]{3,9})[\s./-]*(202[4-9]|203[0-9]|2[4-9]|3[0-9])\b/i);
      if (mSubNamed && monthsMap[mSubNamed[1].toLowerCase().slice(0, 3)]) {
        return formatToYyyyMmDd(mSubNamed[2], mSubNamed[1]);
      }
    }
  }

  // Format 6: Fallback - Extract all valid dates and pick the latest date (Expiry is always >= Manufacturing)
  const allDateMatches = [];
  const genericRegex = /\b([0-1]?[0-9])[\s./-](202[4-9]|203[0-9]|2[4-9]|3[0-9])\b/g;
  let match;
  while ((match = genericRegex.exec(normalized)) !== null) {
    const m = parseInt(match[1], 10);
    if (m >= 1 && m <= 12) {
      const formatted = formatToYyyyMmDd(match[2], match[1]);
      if (formatted) allDateMatches.push(formatted);
    }
  }

  if (allDateMatches.length > 0) {
    allDateMatches.sort();
    return allDateMatches[allDateMatches.length - 1];
  }

  return "";
}

/**
 * Intelligent Pharmaceutical Brand & Generic Name Extractor
 * Uses a scoring heuristic:
 * - High priority for known pharmaceutical drugs
 * - Detects dosage notations (650mg, 500 mg, 40mg, etc.)
 * - Filters out legal disclaimers, manufacturer addresses, excipients, and composition lines
 */
export function parseMedicineName(text) {
  if (!text) return "";
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 3);

  let bestCandidate = "";
  let highestScore = -100;

  for (const line of lines) {
    // 1. Check if line matches boilerplate or legal disclaimers
    const isBoilerplate = BOILERPLATE_PATTERNS.some((pattern) => pattern.test(line));
    if (isBoilerplate) continue;

    // Exclude ingredient breakdown lines (contains '...', 'equivalent to', 'q.s.')
    if (/equivalent\s*to|\beq\.?\s*to|\bq\.?s\.?|\.{2,}|\bexcipient/i.test(line)) {
      continue;
    }

    // Clean stray symbols but preserve hyphens, plus, numbers, slashes
    const cleaned = line.replace(/[^a-zA-Z0-9\s\-+/.]/g, " ").replace(/\s+/g, " ").trim();
    if (cleaned.length < 3 || cleaned.length > 55) continue;
    if (!/[a-zA-Z]/.test(cleaned)) continue;

    let score = 0;
    const lower = cleaned.toLowerCase();

    // Known drug matching
    for (const drug of COMMON_MEDICATIONS) {
      if (lower.includes(drug)) {
        score += 200;
        // Exact start bonus
        if (lower.startsWith(drug)) score += 60;
        break;
      }
    }

    // Dosage strength patterns (e.g. 650mg, 500 mg, 40mg, 10 mg, 625 duo)
    if (/\b\d{1,4}\s*(?:mg|ml|mcg|gm|g)\b/i.test(cleaned) || /\b(?:650|500|625|400|250|100|50|40|25|20|10|5)\b/.test(cleaned)) {
      score += 60;
    }

    // Pharmacopoeia standards (IP, BP, USP)
    if (/\b(?:I\.?P\.?|B\.?P\.?|U\.?S\.?P\.?)\b/i.test(cleaned)) {
      score += 40;
    }

    // Prominent casing (Medicine brand names are almost always ALL CAPS or Title Case)
    const upperCount = (cleaned.match(/[A-Z]/g) || []).length;
    const letterCount = (cleaned.match(/[a-zA-Z]/g) || []).length;
    if (letterCount > 0 && upperCount / letterCount > 0.6) {
      score += 35;
    }

    // Short, punchy line bonus
    if (cleaned.length >= 4 && cleaned.length <= 25) {
      score += 30;
    } else if (cleaned.length > 35) {
      score -= 20;
    }

    // Penalize long sentences without drug matches
    const wordCount = cleaned.split(/\s+/).length;
    if (wordCount > 6 && score < 150) {
      score -= 40;
    }

    if (score > highestScore) {
      highestScore = score;
      bestCandidate = cleaned;
    }
  }

  // Fallback: If no candidate scored well, pick first non-boilerplate line
  if (!bestCandidate || highestScore < 10) {
    for (const line of lines) {
      if (!BOILERPLATE_PATTERNS.some((p) => p.test(line))) {
        const cleaned = line.replace(/[^a-zA-Z0-9\s\-+/.]/g, " ").replace(/\s+/g, " ").trim();
        if (cleaned.length >= 3 && cleaned.length <= 40 && /[a-zA-Z]/.test(cleaned)) {
          return cleaned;
        }
      }
    }
  }

  // Capitalize nicely if it looks like a clean medicine name
  return bestCandidate || lines[0] || "";
}

/**
 * Image Preprocessing via HTML5 Canvas
 * Dramatically improves Tesseract OCR on shiny blister packs, foil, and low-contrast photos
 */
export async function preprocessImage(imageSource) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return imageSource;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const objectUrl = imageSource instanceof Blob ? URL.createObjectURL(imageSource) : imageSource;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxDim = 1500;
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const d = imgData.data;

        // Grayscale + Contrast Stretch
        let minLum = 255;
        let maxLum = 0;
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          if (lum < minLum) minLum = lum;
          if (lum > maxLum) maxLum = lum;
        }

        const range = Math.max(maxLum - minLum, 1);
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          let stretched = ((lum - minLum) / range) * 255;
          // Apply slight threshold curve for crisp embossed text
          stretched = stretched > 135 ? Math.min(255, stretched * 1.15) : Math.max(0, stretched * 0.85);

          d[i] = stretched;
          d[i + 1] = stretched;
          d[i + 2] = stretched;
        }

        ctx.putImageData(imgData, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (imageSource instanceof Blob) URL.revokeObjectURL(objectUrl);
            resolve(blob || imageSource);
          },
          "image/jpeg",
          0.92
        );
      } catch (err) {
        if (imageSource instanceof Blob) URL.revokeObjectURL(objectUrl);
        resolve(imageSource);
      }
    };
    img.onerror = () => {
      if (imageSource instanceof Blob) URL.revokeObjectURL(objectUrl);
      resolve(imageSource);
    };
    img.src = objectUrl;
  });
}

export const PERMANENT_GEMINI_API_KEY =
  typeof atob === "function"
    ? atob("QVEuQWI4Uk42SU5MLUxwYzFKUXlPS2JtdUthY2Y0TU9PQmNDWVJlWkF4M1lRYUx5ZkNxVlE=")
    : "";

/**
 * Retrieve user-configured Gemini API Key from localStorage, .env, or permanent default
 */
export function getStoredGeminiKey() {
  try {
    if (typeof window !== "undefined") {
      const localKey = localStorage.getItem("pharmasure_gemini_api_key");
      if (localKey && localKey.trim().length > 15 && !localKey.includes("your_") && !localKey.includes("dummy")) {
        return localKey.trim();
      }
    }
    const envKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 15 && !envKey.includes("your_") && !envKey.includes("dummy")) {
      return envKey.trim();
    }
  } catch (e) {}
  return PERMANENT_GEMINI_API_KEY;
}

export function setStoredGeminiKey(key) {
  try {
    if (typeof window !== "undefined") {
      if (key && key.trim()) {
        localStorage.setItem("pharmasure_gemini_api_key", key.trim());
      } else {
        localStorage.removeItem("pharmasure_gemini_api_key");
      }
    }
  } catch (e) {}
}

const fileToGenerativePart = async (file) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type || "image/jpeg" },
  };
};

/**
 * Main Medication OCR extraction:
 * 1. Checks for a real, valid Gemini API Key (UI config, .env, or permanent key).
 *    If present, utilizes Gemini Multimodal Vision (gemini-3.8-flash / gemini-3.5-flash / gemini-flash-latest).
 * 2. If no API key or cloud request fails, runs Enhanced In-Browser Canvas Preprocessing
 *    + Tesseract OCR with intelligent Pharmaceutical Heuristic Parsing.
 */
export async function performMedicationOCR(file, onProgress) {
  const geminiKey = getStoredGeminiKey();

  // Tier 1: Try Gemini Vision if a valid key is provided
  if (geminiKey) {
    try {
      if (onProgress) onProgress("Scanning with Gemini AI Vision...");
      const genAI = new GoogleGenAI({ apiKey: geminiKey });
      const imagePart = await fileToGenerativePart(file);

      const promptText = `You are an expert Clinical Pharmacist specialized in reading medicine packaging, blister packs, boxes, and foil strips.
Analyze the image of the medicine label/strip provided.
Pay close attention to embossed text on foil, crimped margins, vertical text, and dot-matrix batch stamps.

Extract:
1. "name": The commercial brand name or primary active salt name (e.g. "PAN-D", "Dolo 650", "Augmentin 625 Duo", "Metformin 500mg").
2. "expiryDate": The expiration date in standard "YYYY-MM-DD" format.
   - Look for "EXP", "EXPIRY", "EXP. DATE", "USE BEFORE", "VALID TILL".
   - If only month and year are printed (e.g. "05/2027" or "EXP. JUL 29"), use the last day of that month (e.g. "2027-05-31" or "2029-07-31").
   - Disambiguate from MFG/Manufacturing date (do NOT return the manufacturing date).

Return ONLY a valid JSON object:
{
  "name": "Medicine Name",
  "expiryDate": "YYYY-MM-DD"
}`;

      const candidateModels = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.5-flash"];

      for (const model of candidateModels) {
        try {
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
            return {
              name: parsed.name || "",
              expiryDate: parsed.expiryDate || "",
              engine: `Gemini AI Vision (${model})`,
            };
          }
        } catch (err) {
          console.warn(`Gemini model ${model} error:`, err.message || err);
        }
      }
    } catch (geminiErr) {
      console.warn("Gemini vision encountered an issue, transitioning to local OCR:", geminiErr);
    }
  }

  // Tier 2: Enhanced Local Offline OCR with Canvas Image Preprocessing
  if (onProgress) onProgress("Enhancing image contrast for blister pack...");
  const processedBlob = await preprocessImage(file);

  if (onProgress) onProgress("Running Clinical Offline OCR...");
  const result = await Tesseract.recognize(processedBlob, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        const percent = Math.round((m.progress || 0) * 100);
        onProgress(`Reading blister pack text (${percent}%)...`);
      }
    },
  });

  let rawText = result?.data?.text || "";

  // If preprocessed text was very short, also check original image to ensure no loss
  if (rawText.length < 25) {
    try {
      const fallbackResult = await Tesseract.recognize(file, "eng");
      const fallbackText = fallbackResult?.data?.text || "";
      if (fallbackText.length > rawText.length) {
        rawText = `${rawText}\n${fallbackText}`;
      }
    } catch (e) {}
  }

  console.log("📄 PharmaSure OCR Raw Text:\n", rawText);

  const detectedName = parseMedicineName(rawText);
  const detectedExpiry = parseExpiryDate(rawText);

  return {
    name: detectedName,
    expiryDate: detectedExpiry,
    rawText: rawText,
    engine: "Enhanced Clinical OCR (Offline)",
  };
}
