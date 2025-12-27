---
title: Database Setup
description: Complete guide to database setup, migrations, and operations using Turso (libSQL) and Drizzle ORM in the Pucked application.
order: 7
category: Development
tags:
  - database
  - turso
  - drizzle
  - migrations
  - libsql
lastModified: 2025-12-27
author: Pucked Team
---

# Database Setup

This guide covers database setup, migrations, and operations using Turso (libSQL) and Drizzle ORM in the Pucked application.

## Overview

**Tech Stack:**
- **Database**: Turso (libSQL) - SQLite-compatible edge database
- **ORM**: Drizzle ORM - Type-safe SQL queries
- **Migrations**: Drizzle Kit - Auto-generated migrations

**Key Benefits:**
- ✅ Edge-optimized database
- ✅ Type-safe queries
- ✅ Auto-generated migrations
- ✅ SQLite-compatible
- ✅ Free tier available

## Environment Setup

### 1. Create Turso Database

```bash
# Install Turso CLI
npm install -g turso

# Create database
turso db create pucked

# Get database URL
turso db list

# Create auth token
turso db tokens create pucked
```

### 2. Configure Environment Variables

Create `.env.local` in project root:

```bash
# Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CLIENT_REDIRECT_URI=http://localhost:3000/api/login/github/callback
```

### 3. Verify Configuration

```bash
# Test database connection
pnpm db:studio
```

## Database Schema

### Schema Location

`db/schema.ts` - Drizzle ORM schema definitions

### Key Tables

#### users
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  githubId: text("github_id").notNull().unique(),
  username: text("username").notNull(),
  invitationAcceptedAt: timestamp("invitation_accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### sessions
```typescript
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});
```

#### invitations
```typescript
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  createdBy: integer("created_by").references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  usedBy: integer("used_by").references(() => users.id),
  usedAt: timestamp("used_at"),
});
```

#### pages
```typescript
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  path: text("path").notNull(),
  parentId: integer("parent_id").references(() => pages.id),
  locale: text("locale").notNull(),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### page_translations
```typescript
export const pageTranslations = pgTable("page_translations", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id").references(() => pages.id).notNull(),
  locale: text("locale").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
});
```

## Database Client

### Client Configuration

`lib/db.ts` - Database client singleton

```typescript
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client);
```

### Usage in Server Actions

```typescript
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUser(id: number) {
  const user = await db.select().from(users).where(eq(users.id, id));
  return user[0];
}
```

## Migrations

### Migration Workflow

```bash
# 1. Modify schema in db/schema.ts
# 2. Generate migration
pnpm db:generate

# 3. Apply migration
pnpm db:migrate

# 4. Verify changes
pnpm db:studio
```

### Migration Commands

```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Open Drizzle Studio (visual database inspector)
pnpm db:studio

# Drop all tables and re-run migrations (destructive!)
pnpm db:push
```

### Migration Files

Migrations are auto-generated in `migrations/` directory:

```
migrations/
├── 0000_wealthy_songbird.sql
├── 0001_lean_wither.sql
├── 0002_oval_jocasta.sql
└── ...
```

### Migration Metadata

`migrations/meta/` - Migration journal and sequence numbers

## Common Database Operations

### Create

```typescript
import { db } from "@/lib/db";
import { users } from "@/db/schema";

const newUser = await db.insert(users).values({
  githubId: "123456",
  username: "johndoe",
}).returning();
```

### Read

```typescript
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Single user
const user = await db.select().from(users).where(eq(users.id, 1));

// All users
const allUsers = await db.select().from(users);

// With relations
const userWithSessions = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    sessions: true,
  },
});
```

### Update

```typescript
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

await db.update(users)
  .set({ username: "newname" })
  .where(eq(users.id, 1));
```

### Delete

```typescript
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

await db.delete(users).where(eq(users.id, 1));
```

## Drizzle ORM Patterns

### Type-Safe Queries

```typescript
// Select with where
const user = await db.select().from(users).where(eq(users.githubId, githubId));

// Select with ordering
const sortedUsers = await db.select().from(users).orderBy(desc(users.createdAt));

// Select with limit
const recentUsers = await db.select().from(users).limit(10);
```

### Relations

```typescript
// Define relations in schema
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

// Query with relations
const userWithSessions = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    sessions: true,
  },
});
```

### Transactions

```typescript
await db.transaction(async (tx) => {
  await tx.insert(users).values({ /* ... */ });
  await tx.insert(sessions).values({ /* ... */ });
});
```

## Database Scripts

### Create Invitation

```bash
# Create invitation code
pnpm create-invitation
```

`scripts/create-invitation.ts` - Invitation code generator

### Seed Data

```bash
# Seed site settings
pnpm seed:settings
```

`scripts/seed-site-settings.ts` - Site settings seeder

## Drizzle Studio

### Visual Database Inspector

```bash
# Open Drizzle Studio
pnpm db:studio
```

**Features:**
- Visual table inspection
- Query builder
- Data editing
- Schema viewer

**Access**: Opens at `http://localhost:4983`

## Troubleshooting

### Connection Issues

**Error**: "Failed to connect to database"

**Solution**:
1. Verify `TURSO_DATABASE_URL` in `.env.local`
2. Check `TURSO_AUTH_TOKEN` is valid
3. Ensure database exists in Turso dashboard

### Migration Conflicts

**Error**: "Migration already applied"

**Solution**:
```bash
# Check migration status
turso db inspect pucked

# Rollback if needed
turso db rollback pucked
```

### Schema Mismatch

**Error**: "Column does not exist"

**Solution**:
1. Regenerate migration: `pnpm db:generate`
2. Apply migration: `pnpm db:migrate`
3. Verify in Drizzle Studio

## Best Practices

1. **Always generate migrations** after schema changes
2. **Use type-safe queries** with Drizzle ORM
3. **Define relations** in schema for better queries
4. **Use transactions** for multi-step operations
5. **Test migrations** in development first
6. **Backup database** before major changes
7. **Use Drizzle Studio** for visual inspection
8. **Keep schema in sync** with migrations

## See Also

- [Getting Started](./getting-started.md) - Project setup overview
- [Authentication Guide](./authentication.md) - User management
- [Server Actions Guide](./server-actions.md) - Database operations in actions
