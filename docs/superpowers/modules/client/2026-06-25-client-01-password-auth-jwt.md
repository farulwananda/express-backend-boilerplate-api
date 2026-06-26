# Module Client 01 - Password Auth And JWT

**Status:** Live
**Last updated:** 2026-06-25
**Audience:** Client

---

## Scope

Documents email/password registration, login, refresh token rotation, logout, and current-user lookup.

## Source Of Truth

| Concern    | File                                  |
| ---------- | ------------------------------------- |
| Routes     | `src/modules/auth/auth.routes.ts`     |
| Service    | `src/modules/auth/auth.service.ts`    |
| Schemas    | `src/modules/auth/auth.schemas.ts`    |
| Repository | `src/modules/auth/auth.repository.ts` |
| Tests      | `tests/auth/auth.integration.test.ts` |

## Routes

| Method | URL                     | Auth       | Purpose                                    |
| ------ | ----------------------- | ---------- | ------------------------------------------ |
| POST   | `/api/v1/auth/register` | Public     | Create password user and return tokens     |
| POST   | `/api/v1/auth/login`    | Public     | Login password user and return tokens      |
| POST   | `/api/v1/auth/refresh`  | Public     | Rotate refresh token and return new tokens |
| POST   | `/api/v1/auth/logout`   | Public     | Revoke refresh token                       |
| GET    | `/api/v1/auth/me`       | Bearer JWT | Return authenticated user                  |

## Token Rules

- Access token is JWT signed with `JWT_ACCESS_SECRET`.
- Refresh token is JWT signed with `JWT_REFRESH_SECRET`.
- Refresh token is hashed with SHA-256 before storage.
- Refresh uses rotation: old token is revoked and linked to replacement hash.

## Password Rules

- Passwords are hashed with Argon2.
- Google-only users have no password hash and cannot use password login.
- Duplicate email registration returns `EMAIL_ALREADY_REGISTERED`.

## Tests

Coverage includes register, duplicate email, login success/failure, `/me`, refresh rotation, and logout revocation.
