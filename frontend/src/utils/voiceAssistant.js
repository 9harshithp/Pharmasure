/**
 * Web Speech API Voice Assistant for Pharmasure
 * Engineered to handle all browser quirks (Chromium garbage collection bug,
 * async getVoices loading, audio context unfreezing, Linux speech engine resume,
 * and reliable 1-click Start / 2nd-click Stop toggle controls).
 */

let cachedVoices = [];
let currentActiveKey = null;

// Eagerly cache and listen for voices
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const populateVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    } catch (e) {
      console.warn("Could not load speech voices:", e);
    }
  };

  populateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }
}

export const isSpeechSynthesisSupported = () => {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
};

export const isSpeaking = () => {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking || window.speechSynthesis.pending;
};

export const getActiveSpeakingKey = () => currentActiveKey;

export const stopSpeaking = () => {
  if (isSpeechSynthesisSupported()) {
    try {
      if (window._speechInterval) {
        clearInterval(window._speechInterval);
        window._speechInterval = null;
      }
      window.speechSynthesis.cancel();
      window._activeSpeechUtterance = null;
      currentActiveKey = null;
    } catch (e) {
      console.warn("Error stopping speech:", e);
    }
  }
};

/**
 * Robust speech synthesis function
 * @param {string} text - Message to read aloud
 * @param {object} options - Configuration options (rate, pitch, volume, lang, onEnd, onError, onStart)
 */
export const speakText = (text, options = {}) => {
  if (!isSpeechSynthesisSupported()) {
    console.warn("Speech synthesis is not supported in this browser.");
    return false;
  }

  if (!text || !text.trim()) {
    return false;
  }

  try {
    // 1. Unfreeze any paused engine state (common in Chrome/Linux)
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // 2. Stop ongoing speech safely
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    // 3. Create utterance
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = options.rate || 0.95; // Slightly measured rate for medical accuracy
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.lang = options.lang || "en-US";

    // 4. Select best natural voice available
    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferredVoice =
        voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Daniel"))) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    // 5. CRITICAL FIX: Retain strong global reference to prevent V8 garbage collection mid-speech
    window._activeSpeechUtterance = utterance;

    utterance.onstart = () => {
      // Periodic heartbeat to prevent Chrome from timing out long speeches (>15s)
      if (window._speechInterval) clearInterval(window._speechInterval);
      window._speechInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(window._speechInterval);
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      if (window._speechInterval) clearInterval(window._speechInterval);
      window._activeSpeechUtterance = null;
      currentActiveKey = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      if (window._speechInterval) clearInterval(window._speechInterval);
      window._activeSpeechUtterance = null;
      currentActiveKey = null;
      // 'canceled' or 'interrupted' is normal when user clicks stop
      if (event.error !== "canceled" && event.error !== "interrupted") {
        console.warn("SpeechSynthesis utterance error:", event.error);
      }
      if (options.onError) options.onError(event);
    };

    // 6. Give Chrome 50ms after cancel() to clear internal audio buffers before queuing new utterance
    setTimeout(() => {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Failed to execute window.speechSynthesis.speak:", err);
      }
    }, 50);

    return true;
  } catch (error) {
    console.error("Speech assistant exception:", error);
    return false;
  }
};

/**
 * ⚡ Toggle Speech Play/Stop:
 * - 1st Click: Starts speaking & returns true
 * - 2nd Click (or clicking while speaking): Stops speaking immediately & returns false
 *
 * @param {string} key - Unique identifier for the audio source (e.g. med.mid, 'alert', etc.)
 * @param {string} text - The text to announce
 * @param {object} options - Callbacks: { onStart, onEnd, onStop, onError }
 * @returns {boolean} true if now playing, false if now stopped
 */
export const toggleSpeech = (key, text, options = {}) => {
  if (!isSpeechSynthesisSupported()) {
    console.warn("Speech synthesis is not supported in this browser.");
    return false;
  }

  const lookupKey = key || text;

  // If already speaking:
  // If user clicked the SAME active button OR any voice toggle while speaking -> STOP
  if (isSpeaking()) {
    const wasSameSource = currentActiveKey === lookupKey;
    stopSpeaking();
    if (options.onStop) options.onStop();

    // If it was the same source, we stop and don't restart (Toggle Stop!)
    if (wasSameSource) {
      return false;
    }
  }

  // If was not speaking, or was speaking a different item: start this one!
  currentActiveKey = lookupKey;

  const wrappedOptions = {
    ...options,
    onStart: () => {
      currentActiveKey = lookupKey;
      if (options.onStart) options.onStart();
    },
    onEnd: () => {
      if (currentActiveKey === lookupKey) {
        currentActiveKey = null;
      }
      if (options.onEnd) options.onEnd();
    },
    onError: (err) => {
      if (currentActiveKey === lookupKey) {
        currentActiveKey = null;
      }
      if (options.onError) options.onError(err);
    },
  };

  const started = speakText(text, wrappedOptions);
  return started ? true : false;
};

/**
 * Announces medication schedule and safety warnings
 */
export const speakMedicationInstructions = (med) => {
  if (!med) return;

  const name = med.tableName || med.medicineName || "Medication";
  const dosage = med.dosage || med.dose || "as prescribed";
  const frequency = med.frequency || (Array.isArray(med.timing) ? med.timing.join(", ") : med.timing) || "daily";
  const instructions = med.instructions || "as directed by your doctor";
  const remaining = med.tabletQty !== undefined ? `${med.tabletQty} units remaining.` : "";

  let speech = `Instruction for ${name}. Dosage: ${dosage}, timing: ${frequency}. Instructions: ${instructions}. ${remaining}`;
  if (med.expiryDate) {
    speech += ` Expiry date is ${med.expiryDate}.`;
  }

  return speakText(speech);
};

/**
 * Announces urgent predictive zero-risk violation
 */
export const speakRiskAlert = (medName, runoutDate, expiryDate) => {
  const speech = `Zero risk warning for ${medName}. At your current dosage, your supply will run until ${runoutDate}, but your medicine expires earlier on ${expiryDate}. Please replace this batch immediately.`;
  return speakText(speech, { pitch: 1.05, rate: 0.9 });
};
