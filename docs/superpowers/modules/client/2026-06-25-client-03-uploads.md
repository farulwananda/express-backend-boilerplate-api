# Module Client 03 - Uploads

**Status:** Live
**Last updated:** 2026-06-25
**Audience:** Client

---

## Scope

Documents protected local file uploads using Multer.

## Source Of Truth

| Concern         | File                                       |
| --------------- | ------------------------------------------ |
| Route           | `src/modules/uploads/upload.routes.ts`     |
| Auth middleware | `src/modules/auth/auth.middleware.ts`      |
| Error handler   | `src/middleware/error-handler.ts`          |
| Tests           | `tests/uploads/upload.integration.test.ts` |

## Route

| Method | URL               | Auth       | Body                   |
| ------ | ----------------- | ---------- | ---------------------- |
| POST   | `/api/v1/uploads` | Bearer JWT | multipart field `file` |

## Response

```json
{
  "success": true,
  "data": {
    "file": {
      "originalName": "avatar.png",
      "filename": "uuid.png",
      "mimeType": "image/png",
      "size": 123,
      "path": "/absolute/path"
    }
  }
}
```

## Upload Rules

- User must be authenticated.
- File field name must be `file`.
- MIME type must be in `UPLOAD_ALLOWED_MIME_TYPES`.
- File content signature must match the declared allowed MIME type.
- Max size is `UPLOAD_MAX_MB`.
- Storage directory is `UPLOAD_DIR`.

## Default Storage

Local storage is used for the boilerplate. For production object storage, replace the Multer storage adapter in `src/modules/uploads/upload.routes.ts`.
