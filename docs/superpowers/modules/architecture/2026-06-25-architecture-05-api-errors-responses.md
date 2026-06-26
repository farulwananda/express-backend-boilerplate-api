# Module Architecture 05 - API Responses And Errors

**Status:** Live
**Last updated:** 2026-06-25
**Audience:** Architect, Client

---

## Scope

Documents response envelopes, validation errors, request IDs, and centralized error handling.

## Source Of Truth

| Concern               | File                              |
| --------------------- | --------------------------------- |
| Success envelope      | `src/lib/api-response.ts`         |
| App errors            | `src/lib/app-error.ts`            |
| Error handler         | `src/middleware/error-handler.ts` |
| Request ID            | `src/middleware/request-id.ts`    |
| Validation middleware | `src/middleware/validate.ts`      |

## Success Shape

```json
{
  "success": true,
  "data": {}
}
```

Optional metadata:

```json
{
  "success": true,
  "data": [],
  "meta": {}
}
```

## Error Shape

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {},
  "requestId": "example-request-id"
}
```

## Request ID

Every request receives an `x-request-id` response header. If the client sends `x-request-id`, the app reuses it when length is <= 128.

## Known Error Sources

| Source                     | Status            |
| -------------------------- | ----------------- |
| Zod validation             | 422               |
| AppError                   | status from error |
| Multer file size           | 413               |
| Multer other upload errors | 422               |
| Unhandled errors           | 500               |
