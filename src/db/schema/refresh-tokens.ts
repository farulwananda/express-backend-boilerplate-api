import { relations } from "drizzle-orm";
import { bigint, index, mysqlTable, serial, timestamp, varchar } from "drizzle-orm/mysql-core";
import { users } from "./users.js";

export const refreshTokens = mysqlTable(
  "refresh_tokens",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    replacedByTokenHash: varchar("replaced_by_token_hash", { length: 255 }),
    expiresAt: timestamp("expires_at").notNull(),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    tokenHashIdx: index("refresh_tokens_token_hash_idx").on(table.tokenHash),
    userIdIdx: index("refresh_tokens_user_id_idx").on(table.userId),
  }),
);

export const refreshTokenRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
