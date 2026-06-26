# Module Client 02 - Google OAuth

**Status:** Live
**Last updated:** 2026-06-25
**Audience:** Client

---

## Scope

Documents Google login with Passport OAuth 2.0 and one-time code exchange. The backend never redirects with access or refresh tokens in the URL.

## Source Of Truth

| Concern        | File                                                                  |
| -------------- | --------------------------------------------------------------------- |
| Passport setup | `src/modules/auth/passport.ts`                                        |
| Routes         | `src/modules/auth/auth.routes.ts`                                     |
| Service        | `src/modules/auth/auth.service.ts`                                    |
| Tables         | `src/db/schema/auth-accounts.ts`, `src/db/schema/auth-login-codes.ts` |
| Tests          | `tests/auth/google-auth.integration.test.ts`                          |

## Routes

| Method | URL                            | Auth         | Purpose                                                |
| ------ | ------------------------------ | ------------ | ------------------------------------------------------ |
| GET    | `/api/v1/auth/google`          | Public       | Start Google OAuth redirect                            |
| GET    | `/api/v1/auth/google/callback` | Google OAuth | Create/link user, create login code, redirect frontend |
| POST   | `/api/v1/auth/google/exchange` | Public       | Exchange one-time code for `{ user, tokens }`          |

## Flow

```text
Frontend
  -> GET /api/v1/auth/google
  -> Google consent
  -> GET /api/v1/auth/google/callback
  -> backend creates hashed one-time code
  -> redirect FRONTEND_AUTH_SUCCESS_URL?code=one-time-code
  -> POST /api/v1/auth/google/exchange
  -> normal JWT token response
```

## Business Rules

- Google email is required.
- Provider account is linked by `provider + providerAccountId`.
- Existing user with the same email is linked instead of duplicated.
- Login code is single-use and expires after `AUTH_CODE_TTL_SECONDS`.
- Raw login code is never stored.

## Environment Variables

| Variable                    | Required | Description                                        |
| --------------------------- | -------- | -------------------------------------------------- |
| `GOOGLE_CLIENT_ID`          | Yes      | OAuth client ID                                    |
| `GOOGLE_CLIENT_SECRET`      | Yes      | OAuth client secret                                |
| `GOOGLE_CALLBACK_URL`       | Yes      | Backend callback URL registered in Google Console  |
| `FRONTEND_AUTH_SUCCESS_URL` | Yes      | Frontend redirect target after successful callback |
| `FRONTEND_AUTH_ERROR_URL`   | Yes      | Frontend redirect target after failed callback     |
| `AUTH_CODE_TTL_SECONDS`     | Yes      | One-time exchange code TTL                         |
