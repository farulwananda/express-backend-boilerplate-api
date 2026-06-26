import type { UserRole } from "../../db/schema/users.js";

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
}

export interface UserRecord extends AuthenticatedUser {
  passwordHash: string | null;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenRecord {
  id: number;
  userId: number;
  tokenHash: string;
  replacedByTokenHash: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash?: string | null;
  avatarUrl?: string | null;
  emailVerifiedAt?: Date | null;
  role?: UserRole;
}

export interface CreateRefreshTokenInput {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}

export interface RevokeRefreshTokenInput {
  tokenHash: string;
  replacedByTokenHash?: string;
}

export interface OAuthProfileInput {
  provider: "google";
  providerAccountId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
}

export interface AuthAccountRecord {
  id: number;
  userId: number;
  provider: string;
  providerAccountId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCodeRecord {
  id: number;
  userId: number;
  codeHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}

export interface CreateLoginCodeInput {
  userId: number;
  codeHash: string;
  expiresAt: Date;
}

export interface AuthRepository {
  createUser(input: CreateUserInput): Promise<UserRecord>;
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: number): Promise<UserRecord | null>;
  updateUserOAuthProfile(
    userId: number,
    input: Pick<CreateUserInput, "name" | "avatarUrl" | "emailVerifiedAt">,
  ): Promise<UserRecord>;
  createRefreshToken(input: CreateRefreshTokenInput): Promise<RefreshTokenRecord>;
  findActiveRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  revokeRefreshToken(input: RevokeRefreshTokenInput): Promise<void>;
  findAuthAccount(provider: string, providerAccountId: string): Promise<AuthAccountRecord | null>;
  upsertAuthAccount(input: OAuthProfileInput & { userId: number }): Promise<AuthAccountRecord>;
  createLoginCode(input: CreateLoginCodeInput): Promise<LoginCodeRecord>;
  findActiveLoginCodeByHash(codeHash: string): Promise<LoginCodeRecord | null>;
  consumeLoginCode(codeHash: string): Promise<void>;
}
