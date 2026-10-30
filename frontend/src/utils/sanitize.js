/**
 * Client-side input sanitization & validation utility to guard against XSS and injection
 */

export function sanitizeInput(input, maxLength = 255) {
  if (typeof input !== "string") return "";
  // Strip HTML tags & JavaScript protocol injections
  let clean = input
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .trim();

  if (maxLength && clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }
  return clean;
}

export function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}
