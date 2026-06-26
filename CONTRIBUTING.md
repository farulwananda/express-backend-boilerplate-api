# Contributing

## Local Workflow

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

Run the worker separately when testing queued email jobs:

```bash
npm run worker:dev
```

## Quality Gates

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```

Security/dependency changes should also run:

```bash
npm audit --omit=dev
```

## Architecture Boundaries

- `src/bootstrap` wires runtime dependencies.
- `src/config` owns all environment validation.
- `src/middleware` owns cross-cutting Express middleware.
- `src/modules` owns business modules.
- `src/db/schema` owns Drizzle table definitions.
- `drizzle` contains generated migrations only.

## Security Checklist For Changes

- Request input is validated with Zod.
- Protected routes use `authenticate`.
- Role-sensitive routes use authorization middleware.
- New endpoints have rate limits.
- Secrets and tokens are not logged or returned.
- Errors use safe public messages.
- Docs and `.env.example` are updated.
