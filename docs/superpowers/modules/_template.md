# Module {Audience} {NN} - {Feature Name}

**Status:** Live | In progress | Planned | Has known issues
**Last updated:** YYYY-MM-DD
**Audience:** Client | Operator | Architect | System

---

## Scope

What this module covers: routes, services, repositories, jobs, models, and external integrations.

## Source Of Truth

| Concern | File                                       |
| ------- | ------------------------------------------ |
| Routes  | `src/modules/{module}/{module}.routes.ts`  |
| Service | `src/modules/{module}/{module}.service.ts` |
| Schema  | `src/modules/{module}/{module}.schemas.ts` |
| Tests   | `tests/{module}/{module}.test.ts`          |

## Routes

| Method | URL                  | Auth       | Handler   |
| ------ | -------------------- | ---------- | --------- |
| GET    | `/api/v1/{resource}` | Bearer JWT | `handler` |

## Domain Model

Tables, key columns, and relationships.

## Service Architecture

```text
Router
  -> Middleware
  -> Service
  -> Repository
  -> Database / Queue / External provider
```

## Business Rules

- Validation rules.
- State transitions.
- Idempotency rules.
- Security constraints.

## Environment Variables

| Variable  | Required | Default | Description |
| --------- | -------- | ------- | ----------- |
| `EXAMPLE` | Yes      | -       | Description |

## Testing

- Test files.
- Happy path coverage.
- Negative path coverage.
- Remaining risks.
