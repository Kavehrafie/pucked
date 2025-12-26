# Database Setup Documentation

This document covers the complete database setup for the Didaar website project using Turso and Drizzle ORM.

**Related Documentation:**
- [CLAUDE.md](./CLAUDE.md) - Main project documentation
- [Anytype "Didaar website" page](https://anytype.io) - Project requirements and specifications

## Overview

- **Database**: Turso (libSQL - SQLite-compatible edge database)
- **ORM**: Drizzle ORM (lightweight, type-safe)
- **Migration Tool**: Drizzle Kit
- **Location**: All database files in `db/` and `lib/db.ts`

## Architecture

### Tech Stack Choice

**Why Turso?**
- ✅ Edge-compatible (fast global deployment)
- ✅ SQLite-based (familiar SQL syntax)
- ✅ Free tier available
- ✅ Built-in replication

**Why Drizzle ORM?**
- ✅ Lightweight (~50kb gzipped)
- ✅ Type-safe with TypeScript
- ✅ Excellent Turso integration
- ✅ Simple migration system
- ✅ No runtime overhead

## File Structure

```
pucked/
├── db/
│   └── schema.ts           # Database schema definitions
├── lib/
│   └── db.ts              # Drizzle client instance
├── migrations/            # SQL migration files
│   ├── 0000_wealthy_songbird.sql
│   └── meta/
├── scripts/
│   └── migrate.ts         # Migration runner script
├── drizzle.config.ts      # Drizzle Kit configuration
└── .env.local            # Database credentials
```

## Setup Instructions

### 1. Environment Variables

Add to `.env.local`:

```bash
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### 2. Database Schema

Located in `db/schema.ts`:

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Users table (for GitHub OAuth)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  githubId: integer("github_id").notNull().unique(),
  username: text("username").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Sessions table (for authentication)
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// TypeScript types inferred from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
```

### 3. Database Client

Located in `lib/db.ts`:

```typescript
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../db/schema";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(turso, { schema });
```

### 4. Drizzle Configuration

Located in `drizzle.config.ts`:

```typescript
require("dotenv").config({ path: ".env.local" });

import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
```

## Usage

### Running Migrations

Generate migration from schema changes:
```bash
npm run db:generate
```

Apply migrations to database:
```bash
npx tsx scripts/migrate.ts
```

### Database Operations

#### Insert Data

```typescript
import { db } from "@/lib/db";
import { users } from "@/db/schema";

await db.insert(users).values({
  id: "user-123",
  githubId: 12345,
  username: "octocat",
});
```

#### Query Data

```typescript
import { db } from "@/lib/db";
import { users } from "@/db/schema";

// Get all users
const allUsers = await db.select().from(users);

// Get user by GitHub ID
const user = await db.select()
  .from(users)
  .where(eq(users.githubId, 12345));
```

#### Update Data

```typescript
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

await db.update(users)
  .set({ username: "new-username" })
  .where(eq(users.id, "user-123"));
```

#### Delete Data

```typescript
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

await db.delete(users)
  .where(eq(users.id, "user-123"));
```

## Schema Changes

### Adding a New Table

1. Edit `db/schema.ts`:
```typescript
export const posts = sqliteTable("posts", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  // ... more fields
});
```

2. Generate migration:
```bash
npm run db:generate
```

3. Apply migration:
```bash
npx tsx scripts/migrate.ts
```

### Adding Columns to Existing Table

1. Update the table definition in `db/schema.ts`
2. Run `npm run db:generate`
3. Run `npx tsx scripts/migrate.ts`

## Current Schema

### Users Table
- `id` (TEXT, PRIMARY KEY)
- `github_id` (INTEGER, UNIQUE, NOT NULL)
- `username` (TEXT, NOT NULL)
- `created_at` (INTEGER, TIMESTAMP, DEFAULT: now)

### Sessions Table
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY → users.id, ON DELETE CASCADE)
- `expires_at` (INTEGER, TIMESTAMP, NOT NULL)

## Planned Schema (From Anytype)

### Pages Table
```sql
CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  parent_id TEXT REFERENCES pages(id),
  is_draft BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Page Translations Table
```sql
CREATE TABLE page_translations (
  id TEXT PRIMARY KEY,
  page_id TEXT REFERENCES pages(id),
  locale TEXT NOT NULL, -- 'en' or 'fa'
  puck_data TEXT NOT NULL, -- JSON from Puck editor
  UNIQUE(page_id, locale)
);
```

## Troubleshooting

### Migration Issues

If migrations fail:
1. Check `.env.local` has correct credentials
2. Ensure Turso database is accessible
3. Verify schema syntax in `db/schema.ts`
4. Check migration files in `migrations/` folder

### Type Errors

If TypeScript errors occur:
1. Run `npm run db:generate` to regenerate types
2. Restart TypeScript server in VS Code
3. Clear `.next` cache: `rm -rf .next`

## Anytype Integration

This database setup supports the requirements defined in the Anytype "Didaar website" page:
- ✅ GitHub OAuth (users & sessions tables)
- ✅ Bilingual support (planned page_translations table)
- ✅ Page hierarchy (planned pages table with parent_id)
- ✅ Draft/Publish logic (planned is_draft field)

## References

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Turso Docs](https://docs.turso.tech/)
- [libSQL Reference](https://github.com/libsql/libsql)
- [Arctic Auth](https://arctic.js.org/) - OAuth library used with GitHub
