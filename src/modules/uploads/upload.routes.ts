import { mkdirSync } from "node:fs";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { RequestHandler } from "express";
import multer from "multer";
import type { AppConfig } from "../../config/index.js";
import { successResponse } from "../../lib/api-response.js";
import { AppError } from "../../lib/app-error.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { authenticate } from "../auth/auth.middleware.js";
import type { AuthService } from "../auth/auth.service.js";

export function createUploadRouter(
  authService: AuthService,
  config: AppConfig["upload"],
  uploadRateLimiter: RequestHandler,
) {
  const router = Router();
  const uploadDir = path.resolve(config.dir);
  mkdirSync(uploadDir, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, callback) => {
        callback(null, uploadDir);
      },
      filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname);
        callback(null, `${randomUUID()}${extension}`);
      },
    }),
    limits: {
      fileSize: config.maxMb * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
      if (!config.allowedMimeTypes.includes(file.mimetype)) {
        return callback(
          new AppError(422, "UPLOAD_MIME_NOT_ALLOWED", "Uploaded file type is not allowed"),
        );
      }

      return callback(null, true);
    },
  });

  router.post(
    "/",
    uploadRateLimiter,
    authenticate(authService),
    upload.single("file"),
    asyncHandler(async (req, res) => {
      if (!req.file) {
        throw new AppError(422, "UPLOAD_FILE_REQUIRED", "File is required");
      }

      const hasValidSignature = await validateFileSignature(req.file.path, req.file.mimetype);

      if (!hasValidSignature) {
        await unlink(req.file.path).catch(() => undefined);
        throw new AppError(
          422,
          "UPLOAD_CONTENT_NOT_ALLOWED",
          "Uploaded file content does not match an allowed file type",
        );
      }

      return successResponse(
        res,
        {
          file: {
            originalName: req.file.originalname,
            filename: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
          },
        },
        201,
      );
    }),
  );

  return router;
}

async function validateFileSignature(filePath: string, mimeType: string) {
  const header = await readFile(filePath).then((buffer) => buffer.subarray(0, 8));

  if (mimeType === "image/png") {
    return header.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (mimeType === "image/jpeg") {
    return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  }

  if (mimeType === "application/pdf") {
    return header.subarray(0, 4).toString("utf8") === "%PDF";
  }

  return false;
}
