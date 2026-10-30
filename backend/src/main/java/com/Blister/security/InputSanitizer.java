package com.Blister.security;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

@Component
public class InputSanitizer {

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern DANGEROUS_JS_PATTERN = Pattern.compile("(?i)(javascript:|vbscript:|data:text/html|onload=|onerror=|onclick=)");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}$");

    /**
     * Strips dangerous HTML tags and script protocols from input strings.
     */
    public String sanitizeText(String input, int maxLength) {
        if (input == null) {
            return null;
        }
        String cleaned = input.trim();
        // Remove HTML tags
        cleaned = HTML_TAG_PATTERN.matcher(cleaned).replaceAll("");
        // Remove active JS payload signatures
        cleaned = DANGEROUS_JS_PATTERN.matcher(cleaned).replaceAll("");
        // Truncate to maximum permitted length
        if (cleaned.length() > maxLength) {
            cleaned = cleaned.substring(0, maxLength);
        }
        return cleaned;
    }

    /**
     * Validates email format.
     */
    public boolean isValidEmail(String email) {
        if (email == null) {
            return false;
        }
        String trimmed = email.trim();
        return trimmed.length() <= 100 && EMAIL_PATTERN.matcher(trimmed).matches();
    }
}
