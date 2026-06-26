import type {
  AuthRepository,
  CreateRefreshTokenInput,
  CreateUserInput,
  AuthAccountRecord,
  CreateLoginCodeInput,
  LoginCodeRecord,
  OAuthProfileInput,
  RefreshTokenRecord,
  RevokeRefreshTokenInput,
  UserRecord,
} from "../../src/modules/auth/auth.types.js";

export class InMemoryAuthRepository implements AuthRepository {
  private users = new Map<number, UserRecord>();
  private refreshTokens = new Map<string, RefreshTokenRecord>();
  private authAccounts = new Map<string, AuthAccountRecord>();
  private loginCodes = new Map<string, LoginCodeRecord>();
  private userSequence = 1;
  private refreshTokenSequence = 1;
  private authAccountSequence = 1;
  private loginCodeSequence = 1;

  async createUser(input: CreateUserInput): Promise<UserRecord> {
    const now = new Date();
    const user: UserRecord = {
      id: this.userSequence,
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash ?? null,
      avatarUrl: input.avatarUrl ?? null,
      emailVerifiedAt: input.emailVerifiedAt ?? null,
      role: input.role ?? "user",
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(this.userSequence, user);
    this.userSequence += 1;

    return user;
  }

  async findUserByEmail(email: string): Promise<UserRecord | null> {
    return [...this.users.values()].find((user) => user.email === email) ?? null;
  }

  async findUserById(id: number): Promise<UserRecord | null> {
    return this.users.get(id) ?? null;
  }

  async updateUserOAuthProfile(
    userId: number,
    input: Pick<CreateUserInput, "name" | "avatarUrl" | "emailVerifiedAt">,
  ): Promise<UserRecord> {
    const user = this.users.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const updated: UserRecord = {
      ...user,
      name: input.name ?? user.name,
      avatarUrl: input.avatarUrl ?? user.avatarUrl,
      emailVerifiedAt: input.emailVerifiedAt ?? user.emailVerifiedAt,
      updatedAt: new Date(),
    };

    this.users.set(userId, updated);

    return updated;
  }

  async createRefreshToken(input: CreateRefreshTokenInput): Promise<RefreshTokenRecord> {
    const token: RefreshTokenRecord = {
      id: this.refreshTokenSequence,
      userId: input.userId,
      tokenHash: input.tokenHash,
      replacedByTokenHash: null,
      expiresAt: input.expiresAt,
      revokedAt: null,
      createdAt: new Date(),
    };

    this.refreshTokens.set(input.tokenHash, token);
    this.refreshTokenSequence += 1;

    return token;
  }

  async findActiveRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const token = this.refreshTokens.get(tokenHash);

    if (!token || token.revokedAt || token.expiresAt <= new Date()) {
      return null;
    }

    return token;
  }

  async revokeRefreshToken(input: RevokeRefreshTokenInput): Promise<void> {
    const token = this.refreshTokens.get(input.tokenHash);

    if (!token) {
      return;
    }

    this.refreshTokens.set(input.tokenHash, {
      ...token,
      revokedAt: new Date(),
      replacedByTokenHash: input.replacedByTokenHash ?? null,
    });
  }

  async findAuthAccount(
    provider: string,
    providerAccountId: string,
  ): Promise<AuthAccountRecord | null> {
    return this.authAccounts.get(`${provider}:${providerAccountId}`) ?? null;
  }

  async upsertAuthAccount(
    input: OAuthProfileInput & { userId: number },
  ): Promise<AuthAccountRecord> {
    const key = `${input.provider}:${input.providerAccountId}`;
    const existing = this.authAccounts.get(key);
    const now = new Date();
    const account: AuthAccountRecord = {
      id: existing?.id ?? this.authAccountSequence,
      userId: input.userId,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      email: input.email,
      name: input.name,
      avatarUrl: input.avatarUrl ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    if (!existing) {
      this.authAccountSequence += 1;
    }

    this.authAccounts.set(key, account);

    return account;
  }

  async createLoginCode(input: CreateLoginCodeInput): Promise<LoginCodeRecord> {
    const code: LoginCodeRecord = {
      id: this.loginCodeSequence,
      userId: input.userId,
      codeHash: input.codeHash,
      expiresAt: input.expiresAt,
      consumedAt: null,
      createdAt: new Date(),
    };

    this.loginCodes.set(input.codeHash, code);
    this.loginCodeSequence += 1;

    return code;
  }

  async findActiveLoginCodeByHash(codeHash: string): Promise<LoginCodeRecord | null> {
    const code = this.loginCodes.get(codeHash);

    if (!code || code.consumedAt || code.expiresAt <= new Date()) {
      return null;
    }

    return code;
  }

  async consumeLoginCode(codeHash: string): Promise<void> {
    const code = this.loginCodes.get(codeHash);

    if (!code) {
      return;
    }

    this.loginCodes.set(codeHash, {
      ...code,
      consumedAt: new Date(),
    });
  }
}
