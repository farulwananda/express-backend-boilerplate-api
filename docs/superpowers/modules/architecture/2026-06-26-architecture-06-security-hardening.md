# Module Architecture 06 - Security Hardening

**Status:** Live
**Last updated:** 2026-06-26
**Audience:** Architect, Operator

---

## Scope

Documents the production security baseline for API auth, rate limiting, CORS, uploads, config guards, and error handling.

## Source Of Truth

| Concern           | File                                   |
| ----------------- | -------------------------------------- |
| Env guards        | `src/config/env.ts`                    |
| Rate limiters     | `src/middleware/rate-limiters.ts`      |
| Auth service      | `src/modules/auth/auth.service.ts`     |
| Upload validation | `src/modules/uploads/upload.routes.ts` |
| Error handling    | `src/middleware/error-handler.ts`      |
| Agent rules       | `AGENTS.md`                            |

## Security Rules

- JWT access and refresh tokens require issuer and audience validation.
- Password registration requires lowercase, uppercase, number, symbol, and minimum 12 characters.
- Refresh tokens and OAuth login codes are stored as SHA-256 hashes.
- Production boot rejects placeholder auth secrets and Google OAuth credentials.
- Production boot requires explicit CORS origins.
- Production boot requires Redis-backed rate limiting.
- Uploads validate both MIME allowlist and file signature.
- Error responses never expose stack traces or dependency error details.

## Rate Limits

| Policy  | Purpose                                         |
| ------- | ----------------------------------------------- |
| General | Baseline API abuse protection                   |
| Auth    | Login/register/refresh/logout protection        |
| OAuth   | Google OAuth start/callback/exchange protection |
| Upload  | Upload resource consumption protection          |

## OWASP API Notes

| OWASP Risk                    | Current Control                                              |
| ----------------------------- | ------------------------------------------------------------ |
| Broken authentication         | JWT issuer/audience, refresh rotation, hashed refresh tokens |
| Broken function authorization | `authenticate` and `requireRole` middleware                  |
| Resource consumption          | Route-specific rate limits and upload size limits            |
| Security misconfiguration     | Zod env guards and Helmet                                    |
| Unsafe file uploads           | MIME allowlist plus magic-byte validation                    |
