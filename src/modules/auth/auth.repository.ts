import { and, eq, gt, isNull } from "drizzle-orm";
import type { Db } from "../../db/client.js";
import { authAccounts, authLoginCodes, refreshTokens, users } from "../../db/schema/index.js";
import type {
  AuthAccountRecord,
  AuthRepository,
  CreateLoginCodeInput,
  CreateRefreshTokenInput,
  CreateUserInput,
  LoginCodeRecord,
  OAuthProfileInput,
  RefreshTokenRecord,
  RevokeRefreshTokenInput,
  UserRecord,
} from "./auth.types.js";

function toUserRecord(user: typeof users.$inferSelect): UserRecord {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    avatarUrl: user.avatarUrl,
    emailVerifiedAt: user.emailVerifiedAt,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function toRefreshTokenRecord(token: typeof refreshTokens.$inferSelect): RefreshTokenRecord {
  return {
    id: token.id,
    userId: token.userId,
    tokenHash: token.tokenHash,
    replacedByTokenHash: token.replacedByTokenHash,
    expiresAt: token.expiresAt,
    revokedAt: token.revokedAt,
    createdAt: token.createdAt,
  };
}

function toAuthAccountRecord(account: typeof authAccounts.$inferSelect): AuthAccountRecord {
  return {
    id: account.id,
    userId: account.userId,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    email: account.email,
    name: account.name,
    avatarUrl: account.avatarUrl,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

function toLoginCodeRecord(code: typeof authLoginCodes.$inferSelect): LoginCodeRecord {
  return {
    id: code.id,
    userId: code.userId,
    codeHash: code.codeHash,
    expiresAt: code.expiresAt,
    consumedAt: code.consumedAt,
    createdAt: code.createdAt,
  };
}

export class DrizzleAuthRepository implements AuthRepository {
  constructor(private readonly db: Db) {}

  async createUser(input: CreateUserInput): Promise<UserRecord> {
    const result = await this.db.insert(users).values(input).$returningId();
    const id = result[0]?.id;

    if (!id) {
      throw new Error("Failed to create user");
    }

    const user = await this.findUserById(Number(id));

    if (!user) {
      throw new Error("Failed to load created user");
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const rows = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0] ? toUserRecord(rows[0]) : null;
  }

  async findUserById(id: number): Promise<UserRecord | null> {
    const rows = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ? toUserRecord(rows[0]) : null;
  }

  async updateUserOAuthProfile(
    userId: number,
    input: Pick<CreateUserInput, "name" | "avatarUrl" | "emailVerifiedAt">,
  ): Promise<UserRecord> {
    await this.db
      .update(users)
      .set({
        name: input.name,
        avatarUrl: input.avatarUrl,
        emailVerifiedAt: input.emailVerifiedAt,
      })
      .where(eq(users.id, userId));

    const user = await this.findUserById(userId);

    if (!user) {
      throw new Error("Failed to load updated user");
    }

    return user;
  }

  async createRefreshToken(input: CreateRefreshTokenInput): Promise<RefreshTokenRecord> {
    const result = await this.db.insert(refreshTokens).values(input).$returningId();
    const id = result[0]?.id;

    if (!id) {
      throw new Error("Failed to create refresh token");
    }

    const rows = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.id, Number(id)));
    const token = rows[0];

    if (!token) {
      throw new Error("Failed to load created refresh token");
    }

    return toRefreshTokenRecord(token);
  }

  async findActiveRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const rows = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return rows[0] ? toRefreshTokenRecord(rows[0]) : null;
  }

  async revokeRefreshToken(input: RevokeRefreshTokenInput): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({
        revokedAt: new Date(),
        replacedByTokenHash: input.replacedByTokenHash,
      })
      .where(eq(refreshTokens.tokenHash, input.tokenHash));
  }

  async findAuthAccount(
    provider: string,
    providerAccountId: string,
  ): Promise<AuthAccountRecord | null> {
    const rows = await this.db
      .select()
      .from(authAccounts)
      .where(
        and(
          eq(authAccounts.provider, provider),
          eq(authAccounts.providerAccountId, providerAccountId),
        ),
      )
      .limit(1);

    return rows[0] ? toAuthAccountRecord(rows[0]) : null;
  }

  async upsertAuthAccount(
    input: OAuthProfileInput & { userId: number },
  ): Promise<AuthAccountRecord> {
    const existing = await this.findAuthAccount(input.provider, input.providerAccountId);
    const values = {
      userId: input.userId,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      email: input.email,
      name: input.name,
      avatarUrl: input.avatarUrl ?? null,
    };

    if (existing) {
      await this.db.update(authAccounts).set(values).where(eq(authAccounts.id, existing.id));

      const updated = await this.findAuthAccount(input.provider, input.providerAccountId);

      if (!updated) {
        throw new Error("Failed to load updated auth account");
      }

      return updated;
    }

    const result = await this.db.insert(authAccounts).values(values).$returningId();
    const id = result[0]?.id;

    if (!id) {
      throw new Error("Failed to create auth account");
    }

    const rows = await this.db
      .select()
      .from(authAccounts)
      .where(eq(authAccounts.id, Number(id)));
    const account = rows[0];

    if (!account) {
      throw new Error("Failed to load created auth account");
    }

    return toAuthAccountRecord(account);
  }

  async createLoginCode(input: CreateLoginCodeInput): Promise<LoginCodeRecord> {
    const result = await this.db.insert(authLoginCodes).values(input).$returningId();
    const id = result[0]?.id;

    if (!id) {
      throw new Error("Failed to create login code");
    }

    const rows = await this.db
      .select()
      .from(authLoginCodes)
      .where(eq(authLoginCodes.id, Number(id)));
    const code = rows[0];

    if (!code) {
      throw new Error("Failed to load created login code");
    }

    return toLoginCodeRecord(code);
  }

  async findActiveLoginCodeByHash(codeHash: string): Promise<LoginCodeRecord | null> {
    const rows = await this.db
      .select()
      .from(authLoginCodes)
      .where(
        and(
          eq(authLoginCodes.codeHash, codeHash),
          isNull(authLoginCodes.consumedAt),
          gt(authLoginCodes.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return rows[0] ? toLoginCodeRecord(rows[0]) : null;
  }

  async consumeLoginCode(codeHash: string): Promise<void> {
    await this.db
      .update(authLoginCodes)
      .set({ consumedAt: new Date() })
      .where(eq(authLoginCodes.codeHash, codeHash));
  }
}
