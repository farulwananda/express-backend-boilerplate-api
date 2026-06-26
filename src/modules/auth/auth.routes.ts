import { Router } from "express";
import passport from "passport";
import type { AppConfig } from "../../config/index.js";
import { successResponse } from "../../lib/api-response.js";
import { asyncHandler } from "../../lib/async-handler.js";
import type { createRateLimiters } from "../../middleware/rate-limiters.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "./auth.middleware.js";
import {
  googleExchangeSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
} from "./auth.schemas.js";
import type { AuthService } from "./auth.service.js";
import type { OAuthProfileInput } from "./auth.types.js";

export function createAuthRouter(
  authService: AuthService,
  config: AppConfig["auth"],
  rateLimiters: ReturnType<typeof createRateLimiters>,
) {
  const router = Router();

  router.post(
    "/register",
    rateLimiters.auth,
    validate({ body: registerSchema }),
    asyncHandler(async (req, res) => {
      const result = await authService.register(req.body);
      return successResponse(res, result, 201);
    }),
  );

  router.post(
    "/login",
    rateLimiters.auth,
    validate({ body: loginSchema }),
    asyncHandler(async (req, res) => {
      const result = await authService.login(req.body);
      return successResponse(res, result);
    }),
  );

  router.post(
    "/refresh",
    rateLimiters.auth,
    validate({ body: refreshTokenSchema }),
    asyncHandler(async (req, res) => {
      const result = await authService.refresh(req.body.refreshToken);
      return successResponse(res, result);
    }),
  );

  router.post(
    "/logout",
    validate({ body: logoutSchema }),
    asyncHandler(async (req, res) => {
      await authService.logout(req.body.refreshToken);
      return successResponse(res, { loggedOut: true });
    }),
  );

  router.get(
    "/google",
    rateLimiters.oauth,
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    }),
  );

  router.get(
    "/google/callback",
    rateLimiters.oauth,
    passport.authenticate("google", {
      session: false,
      failureRedirect: config.google.frontendErrorUrl,
    }),
    asyncHandler(async (req, res) => {
      const user = await authService.handleOAuthLogin(req.user as OAuthProfileInput);
      const code = await authService.createLoginCodeForUser(user);
      const redirectUrl = new URL(config.google.frontendSuccessUrl);
      redirectUrl.searchParams.set("code", code);

      return res.redirect(302, redirectUrl.toString());
    }),
  );

  router.post(
    "/google/exchange",
    rateLimiters.oauth,
    validate({ body: googleExchangeSchema }),
    asyncHandler(async (req, res) => {
      const result = await authService.exchangeLoginCode(req.body.code);
      return successResponse(res, result);
    }),
  );

  router.get(
    "/me",
    authenticate(authService),
    asyncHandler(async (req, res) => successResponse(res, { user: req.user })),
  );

  return router;
}
