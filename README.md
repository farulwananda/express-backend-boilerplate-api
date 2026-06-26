# Express Backend Boilerplate API

Production-grade Express.js scaffold with TypeScript, Zod validation, Drizzle ORM, MySQL, JWT access/refresh authentication, Google OAuth, queues, email, uploads, structured logging, and Docker Compose.

## Stack

- Express.js + TypeScript
- Zod for request and environment validation
- Drizzle ORM + MySQL 8
- JWT access/refresh tokens with hashed refresh token storage
- Passport.js Google OAuth 2.0 with one-time auth code exchange
- BullMQ + Redis worker for background jobs
- Nodemailer mail service
- Multer local upload endpoint
- Pino logging, Helmet, CORS, compression, rate limiting, request IDs
- Vitest + Supertest
- Docker Compose with API, MySQL, and Redis

## Getting Started

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

The API listens on `http://localhost:3000` by default.

For Google login, configure these values in `.env`:

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
FRONTEND_AUTH_SUCCESS_URL=http://localhost:5173/auth/callback
FRONTEND_AUTH_ERROR_URL=http://localhost:5173/login
```

## Docker

```bash
cp .env.example .env
docker compose up --build
```

Docker must be installed locally before this command can run.

## Main Endpoints

- `GET /health/live`
- `GET /health/ready`
- `GET /api/v1`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/google`
- `GET /api/v1/auth/google/callback`
- `POST /api/v1/auth/google/exchange`
- `GET /api/v1/auth/me`
- `POST /api/v1/uploads`

Google OAuth redirects back to the frontend with a one-time `code`. Exchange that code through `POST /api/v1/auth/google/exchange` to receive the normal API `{ user, tokens }` response.

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run worker:dev
npm run worker:start
npm run db:generate
npm run db:migrate
npm run db:studio
```

## Architecture Notes

- `src/app.ts` is an app factory. Tests inject an in-memory auth repository; production uses Drizzle/MySQL.
- `src/config` validates environment variables lazily at boot.
- `src/modules/auth` owns auth schemas, service logic, middleware, routes, and repository contracts.
- `src/modules/queue` owns BullMQ queues and worker processors.
- `src/modules/mail` owns Nodemailer delivery.
- `src/modules/uploads` owns protected file upload handling.
- `src/db/schema` is the Drizzle source of truth for migrations.
- Refresh tokens are never stored raw; only SHA-256 hashes are stored in MySQL.
- Google callback tokens are not placed in URLs; the callback redirects with a one-time login code that is hashed in MySQL and can be consumed once.

## Superpowers Docs

Full module docs live in [`docs/superpowers/modules`](./docs/superpowers/modules/README.md). Start there for architecture, auth, Google OAuth, uploads, mail, queues, Docker, and testing references.

## Agent/Contributor Rules

- Project rules for future agents live in [`AGENTS.md`](./AGENTS.md).
- Contributor workflow and verification gates live in [`CONTRIBUTING.md`](./CONTRIBUTING.md).
