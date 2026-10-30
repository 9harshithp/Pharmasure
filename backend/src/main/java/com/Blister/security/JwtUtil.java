package com.Blister.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final String secretKey;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final long EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000L; // 24 hours

    public JwtUtil(@Value("${jwt.secret:pharmasure-secure-jwt-production-secret-token-key-2026-xyz}") String secretKey) {
        this.secretKey = secretKey;
    }

    /**
     * Generates a signed JWT token containing email, role, and userId.
     */
    public String generateToken(String email, String role, Object userId) {
        try {
            long now = System.currentTimeMillis();
            long exp = now + EXPIRATION_TIME_MS;

            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", email);
            payload.put("role", role);
            payload.put("uid", String.valueOf(userId));
            payload.put("iat", now / 1000);
            payload.put("exp", exp / 1000);

            String encodedHeader = base64UrlEncode(objectMapper.writeValueAsString(header).getBytes(StandardCharsets.UTF_8));
            String encodedPayload = base64UrlEncode(objectMapper.writeValueAsString(payload).getBytes(StandardCharsets.UTF_8));

            String content = encodedHeader + "." + encodedPayload;
            String signature = sign(content, secretKey);

            return content + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating security token", e);
        }
    }

    /**
     * Validates a JWT token and returns the claims map if valid, or null if invalid/expired.
     */
    public Map<String, Object> validateAndGetClaims(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }

        try {
            String[] parts = token.trim().split("\\.");
            if (parts.length != 3) {
                return null;
            }

            String content = parts[0] + "." + parts[1];
            String expectedSignature = sign(content, secretKey);

            // Constant-time signature verification to prevent timing attacks
            if (!MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    parts[2].getBytes(StandardCharsets.UTF_8))) {
                return null;
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            @SuppressWarnings("unchecked")
            Map<String, Object> claims = objectMapper.readValue(payloadBytes, Map.class);

            // Check expiration
            if (claims.containsKey("exp")) {
                long exp = ((Number) claims.get("exp")).longValue();
                if (System.currentTimeMillis() / 1000 > exp) {
                    return null; // Expired
                }
            }

            return claims;
        } catch (Exception e) {
            return null;
        }
    }

    private String sign(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return base64UrlEncode(rawHmac);
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
