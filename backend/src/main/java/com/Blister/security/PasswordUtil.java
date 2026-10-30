package com.Blister.security;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Component;

@Component
public class PasswordUtil {

    private static final int BCRYPT_LOG_ROUNDS = 12;

    /**
     * Hashes a plaintext password using BCrypt with 12 rounds of salt.
     */
    public String hashPassword(String rawPassword) {
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        return BCrypt.hashpw(rawPassword, BCrypt.gensalt(BCRYPT_LOG_ROUNDS));
    }

    /**
     * Checks if the plaintext password matches the stored hash or legacy plaintext password.
     */
    public boolean checkPassword(String rawPassword, String storedPassword) {
        if (rawPassword == null || storedPassword == null) {
            return false;
        }

        // Standard BCrypt hash check
        if (isBCryptHash(storedPassword)) {
            try {
                return BCrypt.checkpw(rawPassword, storedPassword);
            } catch (Exception e) {
                return false;
            }
        }

        // Fallback for legacy plaintext passwords (safe constant-time comparison)
        return slowEquals(rawPassword, storedPassword);
    }

    /**
     * Returns true if the stored password is not yet hashed with BCrypt.
     */
    public boolean needsRehash(String storedPassword) {
        return storedPassword != null && !isBCryptHash(storedPassword);
    }

    private boolean isBCryptHash(String str) {
        return str != null && (str.startsWith("$2a$") || str.startsWith("$2b$") || str.startsWith("$2y$")) && str.length() == 60;
    }

    private boolean slowEquals(String a, String b) {
        byte[] aBytes = a.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] bBytes = b.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        int diff = aBytes.length ^ bBytes.length;
        for (int i = 0; i < aBytes.length && i < bBytes.length; i++) {
            diff |= aBytes[i] ^ bBytes[i];
        }
        return diff == 0;
    }
}
