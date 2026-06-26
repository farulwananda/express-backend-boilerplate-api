# Module Architecture 03 - Config And Environment

**Status:** Live
**Last updated:** 2026-06-25
**Audience:** Architect, Operator

---

## Scope

Documents runtime configuration, Zod validation, and `.env.example` expectations.

## Source Of Truth

| Concern        | File                  |
| -------------- | --------------------- |
| Env validation | `src/config/env.ts`   |
| Config mapping | `src/config/index.ts` |
| Example values | `.env.example`        |

## Required Groups

| Group        | Variables                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| App          | `NODE_ENV`, `APP_NAME`, `LOG_LEVEL`, `HOST`, `PORT`, `TRUST_PROXY`, `CORS_ORIGINS`                                                                 |
| Database     | `DATABASE_URL`, `DB_POOL_CONNECTION_LIMIT`, `DB_POOL_MAX_IDLE`, `DB_POOL_IDLE_TIMEOUT_MS`                                                          |
| Redis        | `REDIS_URL`                                                                                                                                        |
| JWT          | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_ACCESS_TTL_SECONDS`, `JWT_REFRESH_TTL_DAYS`                          |
| Rate limits  | `RATE_LIMIT_STORE`, `RATE_LIMIT_*_WINDOW_MS`, `RATE_LIMIT_*_MAX`                                                                                   |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `FRONTEND_AUTH_SUCCESS_URL`, `FRONTEND_AUTH_ERROR_URL`, `AUTH_CODE_TTL_SECONDS` |
| Mail         | `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`                                                                 |
| Worker       | `WORKER_CONCURRENCY`                                                                                                                               |
| Upload       | `UPLOAD_MAX_MB`, `UPLOAD_ALLOWED_MIME_TYPES`, `UPLOAD_DIR`                                                                                         |

## Defaults And Production Guards

The env schema provides safe local defaults for most non-secret integration values. JWT secrets and database URL remain explicit inputs for real deployments.

Production mode rejects placeholder values for:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Production mode also requires explicit `CORS_ORIGINS`.

Production mode requires `RATE_LIMIT_STORE=redis`.

## CORS

`CORS_ORIGINS` is comma-separated. Empty origins are allowed for non-browser clients.

## JWT Issuer And Audience

Access and refresh tokens are signed and verified with `JWT_ISSUER` and `JWT_AUDIENCE`. Changing either value invalidates existing tokens.

## Upload MIME Allowlist

`UPLOAD_ALLOWED_MIME_TYPES` is comma-separated. Default:

```text
image/jpeg,image/png,application/pdf
```

## Boolean Parsing

`MAIL_SECURE` accepts `true`, `false`, `1`, `0`, or actual booleans. The string `"false"` is parsed as `false`.

## SMTP Credentials

`MAIL_USER` and `MAIL_PASSWORD` must be configured together. Leaving both empty is allowed for local SMTP relays such as Mailpit or MailHog.

## Testing

Env parsing tests live in:

```text
tests/config/env.test.ts
```
