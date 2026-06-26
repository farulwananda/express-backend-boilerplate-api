import { relations } from "drizzle-orm";
import { bigint, index, mysqlTable, serial, timestamp, varchar } from "drizzle-orm/mysql-core";
import { users } from "./users.js";

export const authLoginCodes = mysqlTable(
  "auth_login_codes",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    codeHash: varchar("code_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    consumedAt: timestamp("consumed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    codeHashIdx: index("auth_login_codes_code_hash_idx").on(table.codeHash),
    userIdIdx: index("auth_login_codes_user_id_idx").on(table.userId),
  }),
);

export const authLoginCodeRelations = relations(authLoginCodes, ({ one }) => ({
  user: one(users, {
    fields: [authLoginCodes.userId],
    references: [users.id],
  }),
}));

export type AuthLoginCode = typeof authLoginCodes.$inferSelect;
export type NewAuthLoginCode = typeof authLoginCodes.$inferInsert;
