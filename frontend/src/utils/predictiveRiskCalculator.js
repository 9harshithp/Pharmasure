/**
 * Zero-Risk Predictive Expiry & Runout Calculator
 * 
 * Computes whether a medication quantity and dosage schedule will be consumed safely
 * before batch expiration, guaranteeing zero-risk dispensing.
 */

export function getDailyDoses(timing) {
  if (!timing) return 1;
  const parts = Array.isArray(timing) ? timing : timing.split(",");
  const count = parts.map((t) => t.trim()).filter(Boolean).length;
  return Math.max(1, count);
}

export function calculateMedicationRisk(med, customToday = new Date()) {
  const today = new Date(customToday);
  today.setHours(0, 0, 0, 0);

  const tabletQty = parseInt(med.tabletQty || med.quantity || 0, 10);
  const dailyDoses = getDailyDoses(med.timing);
  const daysSupply = Math.max(1, Math.ceil(tabletQty / dailyDoses));

  // Projected runout date
  const runoutDate = new Date(today);
  runoutDate.setDate(runoutDate.getDate() + daysSupply);

  if (!med.expiryDate) {
    return {
      status: "UNKNOWN",
      badgeColor: "secondary",
      badgeText: "No Expiry Specified",
      daysSupply,
      dailyDoses,
      runoutDateStr: runoutDate.toISOString().split("T")[0],
      daysUntilExpiry: null,
      message: "Please specify an expiration date to evaluate risk.",
      safeQty: tabletQty,
    };
  }

  const expiry = new Date(med.expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - today.getTime();
  const daysUntilExpiry = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const runoutDiffMs = expiry.getTime() - runoutDate.getTime();
  const bufferDays = Math.round(runoutDiffMs / (1000 * 60 * 60 * 24));

  // Maximum safe tablets that can be taken before expiration
  const maxSafeDoses = Math.max(0, daysUntilExpiry * dailyDoses);
  const safeQty = Math.min(tabletQty, maxSafeDoses);

  // 1. Already Expired
  if (daysUntilExpiry < 0) {
    return {
      status: "EXPIRED",
      badgeColor: "danger",
      badgeText: "⛔ EXPIRED",
      daysSupply,
      dailyDoses,
      bufferDays,
      runoutDateStr: runoutDate.toISOString().split("T")[0],
      expiryDateStr: med.expiryDate,
      daysUntilExpiry,
      safeQty: 0,
      riskLevel: "CRITICAL",
      message: `Batch expired ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) > 1 ? "s" : ""} ago. Do not dispense or consume.`,
    };
  }

  // 2. Expires Today
  if (daysUntilExpiry === 0) {
    return {
      status: "EXPIRES_TODAY",
      badgeColor: "danger",
      badgeText: "⛔ EXPIRES TODAY",
      daysSupply,
      dailyDoses,
      bufferDays,
      runoutDateStr: runoutDate.toISOString().split("T")[0],
      expiryDateStr: med.expiryDate,
      daysUntilExpiry: 0,
      safeQty: Math.min(tabletQty, dailyDoses),
      riskLevel: "CRITICAL",
      message: "Batch expires today. Only immediate doses are valid.",
    };
  }

  // 3. Runout date exceeds expiry date (Patient will run into expired pills during the course)
  if (bufferDays < 0) {
    const expiredPillCount = tabletQty - safeQty;
    const safeDays = Math.max(0, daysUntilExpiry);
    return {
      status: "RUNOUT_EXCEEDS_EXPIRY",
      badgeColor: "danger",
      badgeText: "🚨 ZERO-RISK VIOLATION",
      daysSupply,
      dailyDoses,
      bufferDays,
      runoutDateStr: runoutDate.toISOString().split("T")[0],
      expiryDateStr: med.expiryDate,
      daysUntilExpiry,
      safeQty,
      expiredPillCount,
      riskLevel: "HIGH",
      message: `Course finishes on ${runoutDate.toISOString().split("T")[0]}, which is ${Math.abs(bufferDays)} days AFTER batch expiry. Patient will take ${expiredPillCount} expired tablet(s) from Day ${safeDays + 1}.`,
      recommendation: `Dispense at most ${safeQty} tablets from this batch, or switch to a newer stock.`,
    };
  }

  // 4. Near Expiry (Buffer is thin: within 10 days of course completion)
  if (bufferDays <= 10) {
    return {
      status: "TIGHT_BUFFER",
      badgeColor: "warning",
      badgeText: "⚠️ TIGHT BUFFER",
      daysSupply,
      dailyDoses,
      bufferDays,
      runoutDateStr: runoutDate.toISOString().split("T")[0],
      expiryDateStr: med.expiryDate,
      daysUntilExpiry,
      safeQty: tabletQty,
      riskLevel: "MODERATE",
      message: `Course finishes on ${runoutDate.toISOString().split("T")[0]} with only a ${bufferDays}-day safety margin before batch expiration.`,
      recommendation: "Ensure patient completes prescription without delay to prevent expiration during therapy.",
    };
  }

  // 5. Zero-Risk Verified
  return {
    status: "ZERO_RISK_COMPLIANT",
    badgeColor: "success",
    badgeText: "✅ ZERO-RISK VERIFIED",
    daysSupply,
    dailyDoses,
    bufferDays,
    runoutDateStr: runoutDate.toISOString().split("T")[0],
    expiryDateStr: med.expiryDate,
    daysUntilExpiry,
    safeQty: tabletQty,
    riskLevel: "SAFE",
    message: `Zero-Risk Validated: Full ${daysSupply}-day course completes on ${runoutDate.toISOString().split("T")[0]}, safely ${bufferDays} days ahead of batch expiry.`,
    recommendation: "Prescription schedule is completely safe for consumption.",
  };
}

/**
 * Returns overall summary stats across a collection of medications.
 */
export function getZeroRiskSummary(medications) {
  if (!medications || medications.length === 0) {
    return { total: 0, violations: 0, tightBuffers: 0, safe: 0, expired: 0 };
  }

  const results = medications.map((m) => calculateMedicationRisk(m));
  return {
    total: medications.length,
    violations: results.filter((r) => r.status === "RUNOUT_EXCEEDS_EXPIRY").length,
    expired: results.filter((r) => r.status === "EXPIRED" || r.status === "EXPIRES_TODAY").length,
    tightBuffers: results.filter((r) => r.status === "TIGHT_BUFFER").length,
    safe: results.filter((r) => r.status === "ZERO_RISK_COMPLIANT").length,
    details: results,
  };
}
