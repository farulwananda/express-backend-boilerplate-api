import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/app-error.js";
import type { AuthService } from "./auth.service.js";
import type { AuthenticatedUser } from "./auth.types.js";

export function authenticate(authService: AuthService) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authorization = req.header("authorization");
      const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

      if (!token) {
        throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication required");
      }

      req.user = await authService.getUserFromAccessToken(token);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireRole(...roles: AuthenticatedUser["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication required"));
    }

    const user = req.user as AuthenticatedUser;

    if (!roles.includes(user.role)) {
      return next(new AppError(403, "AUTHORIZATION_FAILED", "Forbidden"));
    }

    return next();
  };
}
