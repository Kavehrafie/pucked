import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  githubId: integer("github_id").notNull().unique(),
  username: text("username").notNull(),
  invitationAcceptedAt: integer("invitation_accepted_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .$type<number>(), // Add type annotation
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
}, (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
]);

export const invitations = sqliteTable("invitations", {
  id: integer("id").primaryKey(),
  code: text("code").notNull().unique(),
  createdBy: integer("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedBy: integer("used_by").references(() => users.id, { onDelete: "set null" }),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  createdInvitations: many(invitations),
  usedInvitations: many(invitations),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const invitationRelations = relations(invitations, ({ one }) => ({
  createdByUser: one(users, {
    fields: [invitations.createdBy],
    references: [users.id],
  }),
  usedByUser: one(users, {
    fields: [invitations.usedBy],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
