# Module Architecture 04 - Database And Drizzle

**Status:** Live
**Last updated:** 2026-06-25
**Audience:** Architect, Operator

---

## Scope

Documents MySQL, Drizzle schema ownership, migrations, and auth-related tables.

## Source Of Truth

| Concern        | File                     |
| -------------- | ------------------------ |
| Drizzle config | `drizzle.config.ts`      |
| DB client      | `src/db/client.ts`       |
| Schema exports | `src/db/schema/index.ts` |
| Migrations     | `drizzle/*.sql`          |

## Tables

| Table              | Purpose                                                                    |
| ------------------ | -------------------------------------------------------------------------- |
| `users`            | User identity, email, optional password hash, role, OAuth profile metadata |
| `refresh_tokens`   | Hashed refresh tokens, expiry, revocation, rotation linkage                |
| `auth_accounts`    | OAuth provider identity links such as Google account ID                    |
| `auth_login_codes` | Hashed one-time codes used after Google callback redirect                  |

## Migration Commands

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

## Auth Storage Rules

- Raw refresh tokens are never stored.
- Raw Google exchange codes are never stored.
- Google-only users have `users.password_hash = null`.
- Password login requires a non-null password hash.

## Generated Migrations

| Migration                       | Purpose                                               |
| ------------------------------- | ----------------------------------------------------- |
| `drizzle/0000_loud_smasher.sql` | Initial users and refresh tokens                      |
| `drizzle/0001_even_warlock.sql` | Google OAuth accounts, login codes, user OAuth fields |
