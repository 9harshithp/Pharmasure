# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (main) | Yes - Actively maintained |
| Legacy (pagespeed branch) | No |

---

## Security Architecture

### Authentication and Authorization
- JWT-based authentication: all protected endpoints require a valid `Authorization: Bearer <token>` header
- BCrypt password hashing: 12-round salted hashes (never plaintext)
- Auto-upgrade: legacy plaintext passwords are transparently rehashed on first login
- Role-Based Access Control (RBAC): three roles: `patient`, `caretaker`, `PHARMASURE`
- IDOR Protection: patients can only access their own records (enforced in `SecurityFilter`)

### API Security Layers
| Layer | Implementation |
|-------|---------------|
| CORS | Strict origin pattern allowlist (Vercel/Render/localhost only) |
| Rate Limiting | 15 req/min login, 10 req/min register, 25 req/min AI endpoint |
| Security Headers | X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy |
| Input Sanitization | Server-side HTML/JS stripping + client-side sanitize util |
| Error Handling | Stack traces and binding errors never exposed to clients |

### Secrets Management
- API keys go in environment variables only (never in source code)
- Database credentials go in environment variables only
- JWT secret uses environment variable `JWT_SECRET`
- Frontend exposes only the public API base URL via `REACT_APP_API_BASE_URL`

### Key Security Files

```
backend/src/main/java/com/Blister/security/
  CorsConfig.java             CORS allowlist and filter ordering
  SecurityFilter.java         JWT validation and RBAC enforcement
  SecurityHeadersFilter.java  OWASP security response headers
  RateLimitingFilter.java     Per-IP sliding-window rate limits
  JwtUtil.java                HS256 JWT sign/verify
  PasswordUtil.java           BCrypt hash/verify with legacy fallback
  InputSanitizer.java         Server-side XSS/injection sanitization

frontend/src/
  Components/ProtectedRoute.jsx  Client-side route guard (RBAC)
  utils/apiAuth.js               Axios JWT interceptor + 401 handler
  utils/sanitize.js              Client-side input sanitization
```

---

## Reporting a Vulnerability

Do NOT open a public GitHub issue for security vulnerabilities.

1. Email the maintainer with the subject: `[PharmaSure Security] <short description>`
2. Include: affected component, reproduction steps, and potential impact
3. You will receive a response within 72 hours
4. Once patched, you will be credited in the release notes (unless you prefer anonymity)

---

## Security Considerations for Developers

**WARNING**: The demo database seed (`seed-data.sql`) contains demo credentials for development/demo purposes only. Never use demo credentials in production.

**IMPORTANT**: If migrating an existing database from plaintext passwords:
1. Run `scripts/migrate-passwords.sql` against your database BEFORE deploying the new backend
2. The `admin` table's `password` column must be `VARCHAR(255)` (expanded from `VARCHAR(40)`)
3. Verify: `SELECT LENGTH(password) FROM admin;` -- result must be 60 for BCrypt hash

### Required Production Environment Variables

```bash
DB_URL=jdbc:mysql://<host>:3306/blister
DB_USERNAME=<db_user>
DB_PASSWORD=<strong_password>
JWT_SECRET=<minimum_32_char_random_secret>
GEMINI_API_KEY=<your_google_ai_key>
MAIL_USERNAME=<smtp_email>
MAIL_PASSWORD=<smtp_app_password>
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```
