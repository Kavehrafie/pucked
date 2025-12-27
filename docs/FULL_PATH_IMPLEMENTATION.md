# Full Path Implementation for Nested Pages

## Overview

This document describes the implementation of the `fullPath` column for the pages table, which stores the complete nested path for each page (e.g., "parent/child/grandchild") for efficient URL generation.

## Database Schema

The `pages` table now includes a `fullPath` column:

```typescript
export const pages = sqliteTable("pages", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  fullPath: text("full_path").notNull().default(""),  // NEW COLUMN
  isDraft: integer("is_draft", { mode: "boolean" }).notNull().default(false),
  showOnMenu: integer("show_on_menu", { mode: "boolean" }).notNull().default(true),
  parentId: integer("parent_id").references((): AnySQLiteColumn => pages.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
});
```

## Key Design Decisions

### ✅ Efficient Tree-Based Approach

**Instead of making multiple database queries** to traverse the parent chain for each page, we:

1. **Load the complete tree once** when we need to update full paths
2. **Build the tree structure in memory** using `buildPageTree()`
3. **Generate all full paths from the tree** using `buildFullPathMap()`
4. **Batch update all pages** in a single operation using `updateFullPathsForTree()`

This approach is **much more efficient** than querying the database for each page's parent chain.

## Core Functions

### Tree-Based Functions (Preferred)

These functions work with the in-memory tree structure and are **much more efficient**:

#### `buildFullPathMap(tree: PageTreeNode[], parentPath = ""): Map<string, string>`

Builds a map of page IDs to their full paths from a tree structure.

**Example:**
```typescript
const tree = await getPagesTree();
const pathMap = buildFullPathMap(tree);
// pathMap: Map { "1" => "about", "2" => "about/team", "3" => "about/team/leadership" }
```

#### `getFullPathFromTree(tree: PageTreeNode[], pageId: string): string | null`

Gets the full path for a specific page from the tree structure.

**Example:**
```typescript
const tree = await getPagesTree();
const fullPath = getFullPathFromTree(tree, "123");
// Returns: "parent/child/grandchild" or null if not found
```

#### `updateFullPathsForTree(tree: PageTreeNode[])`

Updates full paths for all pages in a tree in a single batch operation.

**Example:**
```typescript
const tree = await getPagesTree();
await updateFullPathsForTree(tree);
// Updates all pages' fullPath in the database in one batch
```

### Database-Based Functions (Fallback)

These functions query the database and are used when tree data is not available:

#### `generateFullPath(pageId: number): Promise<string>`

Generates the full path for a page by traversing up the parent chain in the database.

#### `updatePageFullPath(pageId: number)`

Updates the full path for a single page in the database.

#### `updateFullPathTree(pageId: number)`

Updates full paths for a page and all its descendants recursively.

**Use this when:**
- A page's parent changes
- You need to update a specific subtree

#### `updateFullPathForSlugChange(pageId: number, newSlug: string)` ⚡ **Most Efficient for Slug Updates**

Updates the full path when only a page's slug changes (not its parent). This is **much more efficient** than `updateFullPathTree()` because:

1. It only updates the last segment of the path
2. It uses string replacement for descendants instead of traversing the tree
3. It uses a single SQL LIKE query to find all descendants

**Example:**
```typescript
// When slug changes from "about" to "about-us"
// Before: fullPath = "about/team/leadership"
// After:  fullPath = "about-us/team/leadership"
await updateFullPathForSlugChange(pageId, "about-us");
```

**Performance:**
- `updateFullPathTree()`: O(n × m) where n = descendants, m = depth
- `updateFullPathForSlugChange()`: O(n) where n = descendants (single query + string replace)

## Usage in Server Actions

### Creating a Page

```typescript
// In createPageAction
const [newPage] = await db.insert(pages).values({
  title: validatedFields.data.title,
  slug: slug,
  fullPath: slug, // Initial fullPath is just the slug
  isDraft: true,
}).returning();

// Update fullPath based on parent hierarchy
await updatePageFullPath(newPage.id);
```

### Updating a Page

```typescript
// In updatePageAction
const [updatedPage] = await db
  .update(pages)
  .set({ title, slug, isDraft, showOnMenu })
  .where(eq(pages.id, pageId))
  .returning();

// If slug changed, use the efficient slug update
if (slug !== existingPage.slug) {
  await updateFullPathForSlugChange(pageId, slug);
}
```

### Reordering Pages (Tree-Based - Most Efficient)

```typescript
// In savePageOrderAction
// 1. Update all parent/sort relationships
for (const page of pagesOrder) {
  await db
    .update(pages)
    .set({
      parentId: page.parentId ? Number(page.parentId) : null,
      sortOrder: page.sortOrder,
    })
    .where(eq(pages.id, Number(page.id)));
}

// 2. Load the complete tree once
const allPages = await db.select().from(pages).orderBy(pages.sortOrder);
const allTranslations = await db.select().from(pageTranslations);

// 3. Build tree structure
const translationsMap = /* build map from translations */;
const tree = buildPageTree(allPages, translationsMap, null);

// 4. Update all full paths in one batch
await updateFullPathsForTree(tree);
```

## Client-Side Usage

When you have the page tree loaded in the client (via `PageTreeContext`), you can get full paths without any database queries:

```typescript
"use client";

import { usePageTree } from "@/contexts/page-tree-context";
import { getFullPathFromTree } from "@/lib/page";

export function PageUrl({ pageId }: { pageId: string }) {
  const { pagesTree } = usePageTree();
  const fullPath = getFullPathFromTree(pagesTree, pageId);
  
  return <a href={`/${fullPath}`}>View Page</a>;
}
```

## Performance Benefits

### Before (Inefficient - Multiple Queries)
```typescript
// For each page, query database multiple times to traverse parent chain
for (const page of pages) {
  await updateFullPathTree(page.id); // Multiple DB queries per page
}
```

### After (Efficient - Single Batch)
```typescript
// Load tree once, generate all paths, batch update
const tree = await getPagesTree();
await updateFullPathsForTree(tree); // Single batch update
```

**Performance improvement:**
- **Before**: O(n × m) database queries where n = pages, m = average depth
- **After**: O(1) batch update after loading tree once

## Migration

To add the `fullPath` column to your database:

```bash
pnpm db:generate  # Generate migration
pnpm db:migrate   # Apply migration
```

Then populate initial full paths:

```typescript
// Run once to populate existing pages
const allPages = await db.select().from(pages);
const tree = buildPageTree(allPages, new Map(), null);
await updateFullPathsForTree(tree);
```

## Best Practices

1. **Use tree-based functions** when you have the tree loaded (client-side or server-side)
2. **Use `updateFullPathForSlugChange()`** when only the slug changes (most efficient)
3. **Use `updateFullPathTree()`** only when a page's parent changes
4. **Batch update full paths** after reordering pages using `updateFullPathsForTree()`
5. **Never manually construct full paths** - always use the provided utility functions
6. **Revalidate paths** after updating full paths to ensure Next.js cache is updated

## Examples

### Get full path for a page (client-side)
```typescript
const fullPath = getFullPathFromTree(pagesTree, "123");
console.log(fullPath); // "about/team/leadership"
```

### Get full path for a page (server-side, with tree loaded)
```typescript
const tree = await getPagesTree();
const pathMap = buildFullPathMap(tree);
const fullPath = pathMap.get("123");
console.log(fullPath); // "about/team/leadership"
```

### Update full paths after reordering
```typescript
// After drag-and-drop reordering
await savePageOrder(prevState, formData);
// Full paths are automatically updated in the action
```

## Summary

The `fullPath` column provides efficient URL generation for nested pages by:

1. **Storing the complete path** in the database for quick access
2. **Using tree-based algorithms** to avoid multiple database queries
3. **Batch updating** all paths when the tree structure changes
4. **Providing utility functions** for both client-side and server-side usage

This approach ensures optimal performance while maintaining data consistency.
