# Module DevOps 01 - Docker Runtime

**Status:** Live
**Last updated:** 2026-06-25
**Audience:** Operator

---

## Scope

Documents Dockerfile, Docker Compose services, and runtime processes.

## Source Of Truth

| Concern          | File                 |
| ---------------- | -------------------- |
| Docker image     | `Dockerfile`         |
| Compose services | `docker-compose.yml` |
| App server       | `src/server.ts`      |
| Worker           | `src/worker.ts`      |

## Services

| Service  | Purpose               |
| -------- | --------------------- |
| `api`    | Express HTTP API      |
| `worker` | BullMQ email worker   |
| `mysql`  | MySQL 8.4 database    |
| `redis`  | Redis 7 queue backend |

## Commands

```bash
cp .env.example .env
docker compose up --build
```

## Runtime Entrypoints

| Process | Command                |
| ------- | ---------------------- |
| API     | `npm start`            |
| Worker  | `npm run worker:start` |

## Known Local Limitation

Docker verification requires Docker CLI/Desktop to be installed. If `docker --version` fails, local Compose verification cannot run from this shell.
