package com.Blister.security;

import org.junit.jupiter.api.Test;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class SecurityComponentsTest {

    private final PasswordUtil passwordUtil = new PasswordUtil();
    private final JwtUtil jwtUtil = new JwtUtil("test-security-secret-key-for-unit-testing-32-chars-long");
    private final InputSanitizer inputSanitizer = new InputSanitizer();

    @Test
    void testPasswordHashingAndVerification() {
        String raw = "superSecurePass123";
        String hashed = passwordUtil.hashPassword(raw);

        assertNotNull(hashed);
        assertTrue(hashed.startsWith("$2a$") || hashed.startsWith("$2b$"));
        assertTrue(passwordUtil.checkPassword(raw, hashed));
        assertFalse(passwordUtil.checkPassword("wrongPassword", hashed));
        assertFalse(passwordUtil.needsRehash(hashed));
    }

    @Test
    void testLegacyPlaintextPasswordMigration() {
        String legacyPlaintext = "student123";
        assertTrue(passwordUtil.needsRehash(legacyPlaintext));
        assertTrue(passwordUtil.checkPassword("student123", legacyPlaintext));
        assertFalse(passwordUtil.checkPassword("otherPass", legacyPlaintext));
    }

    @Test
    void testJwtTokenGenerationAndValidation() {
        String token = jwtUtil.generateToken("user@pharmasure.com", "patient", 101);
        assertNotNull(token);
        assertEquals(3, token.split("\\.").length);

        Map<String, Object> claims = jwtUtil.validateAndGetClaims(token);
        assertNotNull(claims);
        assertEquals("user@pharmasure.com", claims.get("sub"));
        assertEquals("patient", claims.get("role"));
        assertEquals("101", claims.get("uid"));
    }

    @Test
    void testJwtTamperedTokenRejection() {
        String token = jwtUtil.generateToken("admin@pharmasure.com", "PHARMASURE", 1);
        String tampered = token.substring(0, token.length() - 5) + "ABCDE";

        assertNull(jwtUtil.validateAndGetClaims(tampered));
    }

    @Test
    void testInputSanitizerXSSRemoval() {
        String dirty = "<script>alert('XSS')</script>Hello <b>Doctor</b><img src=x onerror=alert(1)>";
        String clean = inputSanitizer.sanitizeText(dirty, 200);

        assertFalse(clean.contains("<script>"));
        assertFalse(clean.contains("<b>"));
        assertFalse(clean.contains("onerror"));
        assertTrue(clean.contains("Hello"));
    }

    @Test
    void testEmailValidation() {
        assertTrue(inputSanitizer.isValidEmail("pharmacist@pharmasure.com"));
        assertTrue(inputSanitizer.isValidEmail("john.doe+care@hospital.org"));
        assertFalse(inputSanitizer.isValidEmail("invalid-email"));
        assertFalse(inputSanitizer.isValidEmail("<script>@bad.com"));
    }
}
