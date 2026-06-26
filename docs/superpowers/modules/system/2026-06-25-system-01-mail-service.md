# Module System 01 - Mail Service

**Status:** Live
**Last updated:** 2026-06-25
**Audience:** System, Operator

---

## Scope

Documents the Nodemailer wrapper used for direct mail delivery and queued email jobs.

## Source Of Truth

| Concern           | File                               |
| ----------------- | ---------------------------------- |
| Mail service      | `src/modules/mail/mail.service.ts` |
| Mail type         | `src/modules/mail/mail.types.ts`   |
| Queue integration | `src/modules/queue/email.queue.ts` |
| Tests             | `tests/mail/mail.service.test.ts`  |

## Environment Variables

| Variable        | Required | Default                              | Description    |
| --------------- | -------- | ------------------------------------ | -------------- |
| `MAIL_HOST`     | Yes      | `localhost`                          | SMTP host      |
| `MAIL_PORT`     | Yes      | `1025`                               | SMTP port      |
| `MAIL_SECURE`   | Yes      | `false`                              | TLS mode       |
| `MAIL_USER`     | No       | empty                                | SMTP username  |
| `MAIL_PASSWORD` | No       | empty                                | SMTP password  |
| `MAIL_FROM`     | Yes      | `Express API <no-reply@example.com>` | Default sender |

## Message Shape

```ts
{
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
```

## Operational Notes

- Use direct `MailService.send()` for synchronous delivery.
- Use the BullMQ email queue for user-facing workflows that should retry.
- Local development can use Mailpit/MailHog on port `1025`.
