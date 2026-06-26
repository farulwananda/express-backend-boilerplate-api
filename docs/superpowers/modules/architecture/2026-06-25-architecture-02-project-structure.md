# Module Architecture 02 - Project Structure

**Status:** Live
**Last updated:** 2026-06-25
**Audience:** Architect

---

## Scope

Documents the current folder layout and ownership boundaries.

## Structure

```text
src/
  app.ts
  server.ts
  worker.ts
  routes.ts
  config/
  db/
  lib/
  middleware/
  modules/
    auth/
    health/
    mail/
    queue/
    uploads/
tests/
drizzle/
docs/superpowers/
```

## Ownership Rules

| Folder           | Responsibility                                                             |
| ---------------- | -------------------------------------------------------------------------- |
| `src/config`     | Environment validation and runtime config mapping                          |
| `src/db`         | MySQL pool, Drizzle client, Drizzle schema                                 |
| `src/lib`        | Shared app primitives: errors, logger, Redis options, API response helpers |
| `src/middleware` | Express middleware not owned by a feature module                           |
| `src/modules/*`  | Feature modules with routes/services/types                                 |
| `tests`          | Unit and integration tests                                                 |
| `drizzle`        | Generated migration SQL and metadata                                       |

## Dependency Direction

Feature routes may depend on services. Services may depend on repositories or integration wrappers. Shared utilities must not depend on feature modules.

```text
routes -> module routes -> services -> repositories/integrations -> db/queue/provider
```

## Testing Pattern

Tests inject `AuthService` with `InMemoryAuthRepository`. This keeps auth and upload API tests fast while production remains backed by Drizzle/MySQL.
