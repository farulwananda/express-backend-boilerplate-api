import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { AppConfig } from "../../config/index.js";
import { AppError } from "../../lib/app-error.js";
import type {
  AuthRepository,
  AuthenticatedUser,
  OAuthProfileInput,
  UserRecord,
} from "./auth.types.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";

interface RefreshPayload extends JwtPayload {
  sub: string;
  typ: "refresh";
}

interface AccessPayload extends JwtPayload {
  sub: string;
  email: string;
  role: string;
  typ: "access";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly config: AppConfig["auth"],
  ) {}

  async register(input: RegisterInput) {
    const existingUser = await this.repository.findUserByEmail(input.email);

    if (existingUser) {
      throw new AppError(409, "EMAIL_ALREADY_REGISTERED", "Email is already registered");
    }

    const passwordHash = await argon2.hash(input.password);
    const user = await this.repository.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
      role: "user",
    });
    const tokens = await this.issueAndStoreTokenPair(user);

    return {
      user: this.toAuthenticatedUser(user),
      tokens,
    };
  }

  async login(input: LoginInput) {
    const user = await this.repository.findUserByEmail(input.email);

    if (!user || !user.passwordHash || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const tokens = await this.issueAndStoreTokenPair(user);

    return {
      user: this.toAuthenticatedUser(user),
      tokens,
    };
  }

  async refresh(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const tokenHash = this.hashRefreshToken(refreshToken);
    const storedToken = await this.repository.findActiveRefreshTokenByHash(tokenHash);

    if (!storedToken || storedToken.userId !== Number(payload.sub)) {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
    }

    const user = await this.repository.findUserById(storedToken.userId);

    if (!user) {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
    }

    const nextTokens = this.createTokenPair(user);
    await this.repository.revokeRefreshToken({
      tokenHash,
      replacedByTokenHash: nextTokens.refreshTokenHash,
    });
    await this.repository.createRefreshToken({
      userId: user.id,
      tokenHash: nextTokens.refreshTokenHash,
      expiresAt: nextTokens.refreshExpiresAt,
    });

    return {
      user: this.toAuthenticatedUser(user),
      tokens: nextTokens.tokens,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.repository.revokeRefreshToken({ tokenHash });
  }

  async handleOAuthLogin(profile: OAuthProfileInput) {
    const existingAccount = await this.repository.findAuthAccount(
      profile.provider,
      profile.providerAccountId,
    );

    if (existingAccount) {
      const user = await this.repository.findUserById(existingAccount.userId);

      if (!user) {
        throw new AppError(401, "OAUTH_ACCOUNT_NOT_FOUND", "OAuth account is not linked");
      }

      await this.repository.upsertAuthAccount({
        ...profile,
        userId: user.id,
      });

      return user;
    }

    const existingUser = await this.repository.findUserByEmail(profile.email);
    const user =
      existingUser ??
      (await this.repository.createUser({
        name: profile.name,
        email: profile.email,
        passwordHash: null,
        avatarUrl: profile.avatarUrl ?? null,
        emailVerifiedAt: profile.emailVerified ? new Date() : null,
        role: "user",
      }));

    const updatedUser = await this.repository.updateUserOAuthProfile(user.id, {
      name: user.name || profile.name,
      avatarUrl: profile.avatarUrl ?? user.avatarUrl,
      emailVerifiedAt: profile.emailVerified
        ? (user.emailVerifiedAt ?? new Date())
        : user.emailVerifiedAt,
    });

    await this.repository.upsertAuthAccount({
      ...profile,
      userId: user.id,
    });

    return updatedUser;
  }

  async createLoginCodeForUser(user: UserRecord) {
    const code = randomBytes(48).toString("base64url");
    await this.repository.createLoginCode({
      userId: user.id,
      codeHash: this.hashOpaqueToken(code),
      expiresAt: new Date(Date.now() + this.config.codeTtlSeconds * 1000),
    });

    return code;
  }

  async exchangeLoginCode(code: string) {
    const codeHash = this.hashOpaqueToken(code);
    const storedCode = await this.repository.findActiveLoginCodeByHash(codeHash);

    if (!storedCode) {
      throw new AppError(401, "INVALID_LOGIN_CODE", "Invalid or expired login code");
    }

    const user = await this.repository.findUserById(storedCode.userId);

    if (!user) {
      throw new AppError(401, "INVALID_LOGIN_CODE", "Invalid or expired login code");
    }

    await this.repository.consumeLoginCode(codeHash);
    const tokens = await this.issueAndStoreTokenPair(user);

    return {
      user: this.toAuthenticatedUser(user),
      tokens,
    };
  }

  async getUserFromAccessToken(accessToken: string): Promise<AuthenticatedUser> {
    const payload = this.verifyAccessToken(accessToken);
    const user = await this.repository.findUserById(Number(payload.sub));

    if (!user) {
      throw new AppError(401, "INVALID_ACCESS_TOKEN", "Invalid access token");
    }

    return this.toAuthenticatedUser(user);
  }

  private async issueAndStoreTokenPair(user: UserRecord): Promise<AuthTokens> {
    const created = this.createTokenPair(user);
    await this.repository.createRefreshToken({
      userId: user.id,
      tokenHash: created.refreshTokenHash,
      expiresAt: created.refreshExpiresAt,
    });

    return created.tokens;
  }

  private createTokenPair(user: UserRecord) {
    const refreshTokenId = randomBytes(48).toString("base64url");
    const refreshExpiresAt = new Date(
      Date.now() + this.config.refreshTtlDays * 24 * 60 * 60 * 1000,
    );

    const accessPayload: AccessPayload = {
      sub: String(user.id),
      email: user.email,
      role: user.role,
      typ: "access",
    };
    const refreshPayload: RefreshPayload = {
      sub: String(user.id),
      jti: refreshTokenId,
      typ: "refresh",
    };

    const accessToken = jwt.sign(accessPayload, this.config.accessSecret, {
      expiresIn: this.config.accessTtlSeconds,
      issuer: this.config.issuer,
      audience: this.config.audience,
    });
    const refreshToken = jwt.sign(refreshPayload, this.config.refreshSecret, {
      expiresIn: `${this.config.refreshTtlDays}d`,
      issuer: this.config.issuer,
      audience: this.config.audience,
    });

    return {
      refreshTokenHash: this.hashRefreshToken(refreshToken),
      refreshExpiresAt,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: this.config.accessTtlSeconds,
      },
    };
  }

  private verifyAccessToken(accessToken: string): AccessPayload {
    try {
      const payload = jwt.verify(accessToken, this.config.accessSecret, {
        issuer: this.config.issuer,
        audience: this.config.audience,
      });

      if (typeof payload === "string" || payload.typ !== "access") {
        throw new Error("Unexpected access token payload");
      }

      return payload as AccessPayload;
    } catch {
      throw new AppError(401, "INVALID_ACCESS_TOKEN", "Invalid access token");
    }
  }

  private verifyRefreshToken(refreshToken: string): RefreshPayload {
    try {
      const payload = jwt.verify(refreshToken, this.config.refreshSecret, {
        issuer: this.config.issuer,
        audience: this.config.audience,
      });

      if (typeof payload === "string" || payload.typ !== "refresh") {
        throw new Error("Unexpected refresh token payload");
      }

      return payload as RefreshPayload;
    } catch {
      throw new AppError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
    }
  }

  private hashRefreshToken(refreshToken: string) {
    return this.hashOpaqueToken(refreshToken);
  }

  private hashOpaqueToken(refreshToken: string) {
    return createHash("sha256").update(refreshToken).digest("hex");
  }

  private toAuthenticatedUser(user: UserRecord): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
    };
  }
}
