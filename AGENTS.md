# Agent Instructions

This repo is a production-grade Express.js API boilerplate. Treat it as one deployable microservice with two runtime processes: API server and worker.

## Architecture Rules

- Keep feature code inside `src/modules/{module}`.
- Keep cross-cutting middleware in `src/middleware`.
- Keep runtime wiring in `src/bootstrap` and entrypoints only.
- Keep environment access inside `src/config` and tool config files such as `drizzle.config.ts`.
- Services own business rules. Routes should only parse/validate requests, call services, and return responses.
- Repository implementations are infrastructure adapters. Do not put HTTP concerns inside repositories.

## Naming Rules

- Use explicit names: `createRateLimiters`, `AuthService`, `DrizzleAuthRepository`, `createUploadRouter`.
- Avoid vague names like `handler`, `manager`, `helper`, or `util` unless the scope is truly generic.
- Use `*.routes.ts`, `*.service.ts`, `*.schemas.ts`, and `*.types.ts` consistently inside modules.
- Name security errors with stable uppercase codes such as `INVALID_ACCESS_TOKEN`.

## Security Rules

- Validate all request bodies with Zod before using them.
- Never read raw `process.env` in feature code.
- Never return password hashes, raw refresh tokens, raw OAuth login codes, stack traces, or provider secrets.
- Never trust file MIME headers alone; keep content signature validation for uploads.
- Keep JWT issuer and audience validation enabled.
- Keep production guards in `src/config/env.ts` strict.
- Production rate limiting must use Redis.

## Testing Rules

Run these before handing off changes:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

For dependency/security changes, also run:

```bash
npm audit --omit=dev
```

## Documentation Rules

- Update `README.md` when public workflow changes.
- Update `docs/superpowers/modules` when routes, env, security policy, queues, uploads, or deployment behavior changes.
- Keep `.env.example` grouped by operational concern and explain production-only requirements.

## Anti Tech Debt Rules

- Do not add compatibility shims without a removal plan.
- Do not duplicate config constants across modules; add them to `src/config`.
- Do not introduce a new abstraction unless it protects a real boundary.
- Do not weaken tests to make implementation pass.
