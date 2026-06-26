# Module DevOps 02 - Testing And Quality

**Status:** Live
**Last updated:** 2026-06-25
**Audience:** Operator, Developer

---

## Scope

Documents quality gates and test coverage for the scaffold.

## Source Of Truth

| Concern    | File                |
| ---------- | ------------------- |
| TypeScript | `tsconfig.json`     |
| ESLint     | `eslint.config.mjs` |
| Prettier   | `.prettierrc`       |
| Vitest     | `vitest.config.ts`  |
| Tests      | `tests/`            |

## Verification Commands

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

## Current Test Areas

| Test file                                       | Coverage                                             |
| ----------------------------------------------- | ---------------------------------------------------- |
| `tests/config/env.test.ts`                      | Env parsing and required secrets                     |
| `tests/health/health.integration.test.ts`       | Liveness and readiness                               |
| `tests/auth/auth.integration.test.ts`           | Password auth, refresh rotation, logout              |
| `tests/auth/google-auth.integration.test.ts`    | Google user create/link and login code exchange      |
| `tests/auth/jwt-security.test.ts`               | JWT issuer/audience rejection                        |
| `tests/security/rate-limit.integration.test.ts` | Route-specific rate limiting                         |
| `tests/uploads/upload.integration.test.ts`      | Authenticated upload, MIME rejection, size rejection |
| `tests/mail/mail.service.test.ts`               | Nodemailer wrapper and email queue helper            |

## Build Output

`npm run build` uses `tsup.config.ts` and emits:

```text
dist/server.js
dist/worker.js
```
