import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incomingRequestId = req.header("x-request-id");
  req.id = incomingRequestId && incomingRequestId.length <= 128 ? incomingRequestId : randomUUID();
  res.setHeader("x-request-id", req.id);
  next();
}
