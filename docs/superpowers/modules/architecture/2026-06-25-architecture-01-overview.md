# Module Architecture 01 - Overview

**Status:** Live
**Last updated:** 2026-06-25
**Audience:** Architect

---

## Scope

This backend is a production-grade Express.js API scaffold using TypeScript, Zod, Drizzle ORM, MySQL, JWT auth, Passport Google OAuth, BullMQ, Nodemailer, Multer, Pino logging, and Docker Compose.

## Source Of Truth

| Concern           | File                  |
| ----------------- | --------------------- |
| App factory       | `src/app.ts`          |
| Server entrypoint | `src/server.ts`       |
| Worker entrypoint | `src/worker.ts`       |
| Routes            | `src/routes.ts`       |
| Config            | `src/config/index.ts` |
| Env schema        | `src/config/env.ts`   |

## Runtime Shape

```text
HTTP request
  -> request id
  -> pino-http
  -> helmet/cors/compression/json/rate-limit
  -> route
  -> module middleware
  -> service
  -> repository / queue / external provider
  -> centralized error handler
```

## Main Modules

| Module   | Responsibility                                                          |
| -------- | ----------------------------------------------------------------------- |
| Auth     | Password login, JWT, Google OAuth, refresh tokens, one-time login codes |
| Health   | Liveness/readiness endpoints                                            |
| Uploads  | Protected local file uploads with Multer                                |
| Mail     | Nodemailer transport wrapper                                            |
| Queue    | BullMQ email queue and worker processor                                 |
| Database | Drizzle schema and MySQL connection                                     |

## Public API Prefix

All business API routes live under:

```text
/api/v1
```

Health routes intentionally live outside versioning:

```text
/health/live
/health/ready
```

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```
