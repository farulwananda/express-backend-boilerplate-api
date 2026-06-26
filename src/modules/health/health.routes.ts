import { Router } from "express";
import { successResponse } from "../../lib/api-response.js";
import { asyncHandler } from "../../lib/async-handler.js";

export function createHealthRouter(readinessCheck: () => Promise<void>) {
  const router = Router();

  router.get("/live", (_req, res) => successResponse(res, { status: "ok" }));

  router.get(
    "/ready",
    asyncHandler(async (_req, res) => {
      await readinessCheck();
      return successResponse(res, { status: "ready" });
    }),
  );

  return router;
}
