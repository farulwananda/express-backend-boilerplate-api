# Module System 02 - Email Queue

**Status:** Live
**Last updated:** 2026-06-25
**Audience:** System, Operator

---

## Scope

Documents BullMQ email queue, Redis connection, worker entrypoint, and retry behavior.

## Source Of Truth

| Concern           | File                               |
| ----------------- | ---------------------------------- |
| Queue module      | `src/modules/queue/email.queue.ts` |
| Redis options     | `src/lib/redis.ts`                 |
| Worker entrypoint | `src/worker.ts`                    |
| Mail service      | `src/modules/mail/mail.service.ts` |

## Queue

| Queue   | Job name     | Processor             |
| ------- | ------------ | --------------------- |
| `email` | `send-email` | `createEmailWorker()` |

## Retry Rules

- Attempts: 3
- Backoff: exponential
- Delay: 5000 ms
- Remove completed jobs: keep last 100
- Remove failed jobs: keep last 500

## Commands

```bash
npm run worker:dev
npm run worker:start
```

## Docker Compose

The `worker` service uses the same app image and runs:

```bash
npm run worker:start
```

## Environment

| Variable    | Required | Description                     |
| ----------- | -------- | ------------------------------- |
| `REDIS_URL` | Yes      | Redis connection URL for BullMQ |
| `MAIL_*`    | Yes      | SMTP delivery settings          |
