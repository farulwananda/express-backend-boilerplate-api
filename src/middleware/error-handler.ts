import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { AppError } from "../lib/app-error.js";
import type { Logger } from "../lib/logger.js";

export function errorHandler(logger: Logger) {
  return (error: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: error.flatten(),
        requestId: req.id,
      });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
        ...(error.details ? { errors: error.details } : {}),
        requestId: req.id,
      });
    }

    if (error instanceof MulterError) {
      return res.status(error.code === "LIMIT_FILE_SIZE" ? 413 : 422).json({
        success: false,
        message: error.message,
        code: error.code,
        requestId: req.id,
      });
    }

    logger.error({ err: error, requestId: req.id }, "Unhandled application error");

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      requestId: req.id,
    });
  };
}
