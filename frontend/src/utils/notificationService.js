/**
 * Notification Service for WhatsApp & SMS Clinical Alerts in Pharmasure
 * Formats clinical alerts for Missed Doses, Zero-Risk Expiry Conflicts, and Refill Reminders.
 */

// Default emergency / pharmacy contact if none configured
export const DEFAULT_CARETAKER_PHONE = "+919876543210";

/**
 * Normalizes phone numbers for WhatsApp international format (digits only, e.g. 919876543210)
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return "919876543210";
  const digits = String(phone).replace(/\D/g, "");
  // If 10-digit Indian number without country code, prepend 91
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * 1. Generates Missed / Pending Dose Alert message
 */
export function formatMissedDoseMessage({ patientName, tablets, slot }) {
  const patient = patientName || "Patient";
  const slotName = slot || "current";
  const tabletList = Array.isArray(tablets)
    ? tablets.map((t) => `• *${t.tabletName || t.tableName || "Medication"}* (${t.timing || slotName})`).join("\n")
    : `• *${tablets || "Prescribed Medication"}*`;

  return `🚨 *PHARMASURE CLINICAL ALERT* 🚨
Dear ${patient},

Our predictive adherence monitor detected *PENDING / MISSED* medication for the *${slotName}* schedule:

${tabletList}

⚠️ *Action Required:* Please take your dose promptly with water to maintain clinical therapeutic efficacy.

_Powered by PharmaSure Zero-Risk Dispensing System_`;
}

/**
 * 2. Generates Zero-Risk Expiry Inversion Hazard message
 */
export function formatZeroRiskExpiryMessage({ patientName, medicineName, runoutDate, expiryDate, daysBuffer }) {
  const patient = patientName || "Patient";
  return `⚠️ *CRITICAL ZERO-RISK SAFETY WARNING* ⚠️
Dear ${patient},

A hazardous expiry conflict was detected in your active prescription:

💊 *Medication:* ${medicineName}
📅 *Projected Runout:* ${runoutDate}
🛑 *Batch Expiry Date:* ${expiryDate}

❌ *DANGER:* Your treatment course overruns the batch validity by ${Math.abs(daysBuffer || 1)} days! You will be consuming expired medication mid-course.

✅ *Immediate Action:* Do NOT consume expired doses. Visit your pharmacy or request an immediate fresh batch replacement.

_PharmaSure Zero-Risk Patient Safety Protocol_`;
}

/**
 * 3. Generates Refill Alert message
 */
export function formatRefillAlertMessage({ patientName, medicineName, remainingQty, daysLeft }) {
  const patient = patientName || "Patient";
  return `📦 *PHARMASURE REFILL REMINDER* 📦
Hi ${patient},

Your supply for *${medicineName}* is running low:
• *Remaining Tablets:* ${remainingQty} tabs
• *Estimated Supply:* ~${daysLeft || 3} days remaining

Please re-order your refill from your pharmacy now to prevent missing consecutive doses.

_PharmaSure Adherence Monitor_`;
}

/**
 * 4. Generates Complete Daily Regimen Schedule message
 */
export function formatDailyScheduleMessage({ patientName, medications }) {
  const patient = patientName || "Patient";
  let scheduleText = "";

  if (Array.isArray(medications) && medications.length > 0) {
    scheduleText = medications
      .map((m) => `• *${m.tableName || m.tabletName}* - ${m.tabletQty} tabs remaining | Timing: [${m.timing}] (Expires: ${m.expiryDate})`)
      .join("\n");
  } else {
    scheduleText = "No active medications found in your profile.";
  }

  return `📋 *PHARMASURE DAILY MEDICATION SCHEDULE* 📋
Patient: *${patient}*
Date: *${new Date().toLocaleDateString()}*

Your active dosage regimen:
${scheduleText}

Stay compliant, stay healthy! 💧
_PharmaSure Zero-Risk Healthcare_`;
}

/**
 * Creates direct WhatsApp Web / App intent link
 */
export function getWhatsAppUrl(phone, message) {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
}

/**
 * Creates direct SMS intent link
 */
export function getSmsUrl(phone, message) {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedBody = encodeURIComponent(message);
  // Works across iOS and Android browsers
  return `sms:${cleanPhone}?body=${encodedBody}`;
}

/**
 * Simulates enterprise SMS/WhatsApp Gateway dispatch
 */
export function simulateGatewayDispatch({ channel, phone, message }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sid = `${channel === "whatsapp" ? "WA" : "SM"}-${Math.floor(100000 + Math.random() * 900000)}`;
      resolve({
        success: true,
        messageId: sid,
        channel,
        recipient: cleanPhoneNumber(phone),
        deliveredAt: new Date().toLocaleTimeString(),
      });
    }, 600);
  });
}
