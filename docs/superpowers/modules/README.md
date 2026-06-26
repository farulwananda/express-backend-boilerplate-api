# Module Reference - express-backend-boilerplate-api

Per-module reference documentation. Each file describes how a feature works today: routes, schemas, services, repositories, database tables, jobs, environment variables, and tests.

## Convention

- One file per module or operational concern.
- Filename: `YYYY-MM-DD-{audience}-NN-{feature-slug}.md`.
- Audience examples: `architecture`, `client`, `devops`, `system`.
- Source of truth: the actual code. If code and docs disagree, code wins.
- Template: [`_template.md`](./_template.md).

## Production Command Quick Reference

### API server

```bash
npm run build
npm start
```

### Worker

```bash
npm run build
npm run worker:start
```

### Database

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

### Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

The compose file defines `api`, `worker`, `mysql`, and `redis`.

## Module Index

### Architecture

- [`architecture/2026-06-25-architecture-01-overview.md`](./architecture/2026-06-25-architecture-01-overview.md)
- [`architecture/2026-06-25-architecture-02-project-structure.md`](./architecture/2026-06-25-architecture-02-project-structure.md)
- [`architecture/2026-06-25-architecture-03-config-env.md`](./architecture/2026-06-25-architecture-03-config-env.md)
- [`architecture/2026-06-25-architecture-04-database-drizzle.md`](./architecture/2026-06-25-architecture-04-database-drizzle.md)
- [`architecture/2026-06-25-architecture-05-api-errors-responses.md`](./architecture/2026-06-25-architecture-05-api-errors-responses.md)
- [`architecture/2026-06-26-architecture-06-security-hardening.md`](./architecture/2026-06-26-architecture-06-security-hardening.md)

### Client/API

- [`client/2026-06-25-client-01-password-auth-jwt.md`](./client/2026-06-25-client-01-password-auth-jwt.md)
- [`client/2026-06-25-client-02-google-oauth.md`](./client/2026-06-25-client-02-google-oauth.md)
- [`client/2026-06-25-client-03-uploads.md`](./client/2026-06-25-client-03-uploads.md)

### System

- [`system/2026-06-25-system-01-mail-service.md`](./system/2026-06-25-system-01-mail-service.md)
- [`system/2026-06-25-system-02-email-queue.md`](./system/2026-06-25-system-02-email-queue.md)

### DevOps

- [`devops/2026-06-25-devops-01-docker-runtime.md`](./devops/2026-06-25-devops-01-docker-runtime.md)
- [`devops/2026-06-25-devops-02-testing-quality.md`](./devops/2026-06-25-devops-02-testing-quality.md)
