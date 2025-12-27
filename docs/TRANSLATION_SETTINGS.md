# Translation Settings Implementation

## Overview

This document describes the implementation of translation general settings in the Puck page editor, including publish/unpublish functionality and translation deletion.

## Features

### 1. Published Status Indicator
- Visual indicator showing whether a translation is "Published" or "Draft"
- Located in the Puck editor header actions
- Updates in real-time when status changes

### 2. Publish/Unpublish Toggle
- Button to toggle the published status of a translation
- Changes appearance based on current state:
  - When published: Shows "Unpublish" button (secondary variant)
  - When draft: Shows "Publish" button (primary variant)
- Updates the database without modifying content

### 3. Delete Translation
- Delete button to remove a translation completely
- Shows confirmation dialog before deletion
- Redirects to `/admin` after successful deletion
- Only deletes the translation, not the page itself

## Implementation Details

### Frontend (Editor Component)

**File**: `app/admin/pages/[locale]/[slug]/edit/editor.tsx`

#### Props
```typescript
type EditorProps = {
  pageId: number;
  locale: string;
  initialTitle: string;
  initialContent: any;
  initialPublished: boolean;  // NEW
};
```

#### State Management
```typescript
const [published, setPublished] = React.useState(initialPublished);
```

#### Handler Functions

**handleTogglePublish**: Toggles published status
```typescript
const handleTogglePublish = async () => {
  const newPublished = !published;
  const formData = new FormData();
  formData.append("action", "toggle-publish");
  
  startTransition(() => {
    formAction(formData);
  });
};
```

**handleDelete**: Deletes translation with confirmation
```typescript
const handleDelete = async () => {
  if (!confirm("Are you sure you want to delete this translation?")) {
    return;
  }
  
  const formData = new FormData();
  formData.append("action", "delete");
  
  startTransition(() => {
    formAction(formData);
  });
};
```

**useEffect**: Updates state and handles redirect
```typescript
React.useEffect(() => {
  if (state.published !== undefined) {
    setPublished(state.published);
  }
  if (state.deleted) {
    router.push("/admin");
  }
}, [state.published, state.deleted, router]);
```

#### Header Actions UI
```tsx
headerActions={
  <div className="flex items-center gap-2">
    {/* Status Indicator */}
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
      <div className={`w-2 h-2 rounded-full ${published ? "bg-green-500" : "bg-yellow-500"}`} />
      <span className="text-sm font-medium">
        {published ? "Published" : "Draft"}
      </span>
    </div>

    {/* Publish/Unpublish Button */}
    <Button
      onClick={handleTogglePublish}
      variant={published ? "secondary" : "primary"}
      disabled={isPending}
    >
      {published ? "Unpublish" : "Publish"}
    </Button>

    {/* Delete Button */}
    <Button
      onClick={handleDelete}
      variant="secondary"
      disabled={isPending}
    >
      Delete
    </Button>
  </div>
}
```

### Backend (Server Actions)

**File**: `app/actions.ts`

#### Updated savePageContent Function

The `savePageContent` function now handles three actions:

1. **Delete Action** (`action === "delete"`)
   - Deletes the translation from `page_translations` table
   - Uses composite key: (pageId, locale)
   - Revalidates paths
   - Returns `{ success: true, deleted: true }`

```typescript
if (action === "delete") {
  await db
    .delete(pageTranslations)
    .where(
      and(
        eq(pageTranslations.pageId, pageId),
        eq(pageTranslations.locale, locale)
      )
    );
  
  return { success: true, deleted: true };
}
```

2. **Toggle Publish Action** (`action === "toggle-publish"`)
   - Fetches current translation
   - Toggles the `published` boolean field
   - Updates only the published status (doesn't modify content)
   - Returns `{ success: true, published: boolean }`

```typescript
if (action === "toggle-publish") {
  const [existingTranslation] = await db
    .select()
    .from(pageTranslations)
    .where(
      and(
        eq(pageTranslations.pageId, pageId),
        eq(pageTranslations.locale, locale)
      )
    )
    .limit(1);

  const newPublishedStatus = !existingTranslation.published;

  await db
    .update(pageTranslations)
    .set({ published: newPublishedStatus })
    .where(
      and(
        eq(pageTranslations.pageId, pageId),
        eq(pageTranslations.locale, locale)
      )
    );

  return { success: true, published: newPublishedStatus };
}
```

3. **Default Save Action** (no action parameter)
   - Saves content with current published status
   - Uses `formData.get("published")` to determine published state
   - Creates or updates translation using `onConflictDoUpdate`
   - Returns `{ success: true, published: boolean }`

```typescript
const rawPublished = formData.get("published");
let published = true;
if (typeof rawPublished === "string") {
  published = rawPublished === "true";
}

await db
  .insert(pageTranslations)
  .values({
    pageId,
    locale,
    title,
    content: validatedContent,
    published,
  })
  .onConflictDoUpdate({
    target: [pageTranslations.pageId, pageTranslations.locale],
    set: {
      title,
      content: validatedContent,
      published,
    },
  });

return { success: true, published };
```

#### FormState Type
```typescript
type FormState = {
  errors?: {
    title?: string[];
    _form?: string[];
  };
  success: boolean;
  published?: boolean;  // NEW
  deleted?: boolean;    // NEW
};
```

### Server Component (Page Loader)

**File**: `app/admin/pages/[locale]/[slug]/edit/page.tsx`

#### Updated Props
```tsx
<Editor
  pageId={page.id}
  locale={locale}
  initialTitle={pageContent.title}
  initialContent={pageContent.content}
  initialPublished={pageContent.published}  // NEW
/>
```

## Database Schema

**Table**: `page_translations`

```sql
CREATE TABLE page_translations (
  pageId INTEGER NOT NULL,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT false NOT NULL,
  FOREIGN KEY (pageId) REFERENCES pages(id) ON DELETE CASCADE,
  PRIMARY KEY (pageId, locale)
);
```

**Key Fields**:
- `published`: Boolean field indicating whether translation is published
- Composite primary key on (pageId, locale)

## User Flow

### Publishing a Translation
1. User opens Puck editor for a draft translation
2. Status indicator shows "Draft" (yellow dot)
3. User clicks "Publish" button
4. `handleTogglePublish` creates FormData with `action: "toggle-publish"`
5. Server action toggles `published` from false to true
6. Response returns `{ published: true }`
7. useEffect updates state: `setPublished(true)`
8. Status indicator changes to "Published" (green dot)
9. Button changes to "Unpublish" (secondary variant)

### Unpublishing a Translation
1. User opens Puck editor for a published translation
2. Status indicator shows "Published" (green dot)
3. User clicks "Unpublish" button
4. `handleTogglePublish` creates FormData with `action: "toggle-publish"`
5. Server action toggles `published` from true to false
6. Response returns `{ published: false }`
7. useEffect updates state: `setPublished(false)`
8. Status indicator changes to "Draft" (yellow dot)
9. Button changes to "Publish" (primary variant)

### Deleting a Translation
1. User opens Puck editor for a translation
2. User clicks "Delete" button
3. Confirmation dialog appears: "Are you sure you want to delete this translation?"
4. If user confirms, `handleDelete` creates FormData with `action: "delete"`
5. Server action deletes the translation record from database
6. Response returns `{ deleted: true }`
7. useEffect detects `deleted: true` and redirects to `/admin`

### Saving Content
1. User makes changes in Puck editor
2. User clicks "Save" button in Puck UI
3. `handlePublish` creates FormData with title, content, and published status
4. Server action saves/updates translation with current published status
5. Response returns `{ published: boolean }`
6. useEffect updates published state if changed

## Technical Considerations

### Why Separate Actions?
- **Delete**: Requires database deletion, not content update
- **Toggle Publish**: Only updates `published` field, more efficient than full content save
- **Save**: Updates content and published status together

### State Management
- Published state is managed locally in Editor component
- useEffect syncs local state with server response
- Prevents unnecessary re-renders of entire Puck editor

### Error Handling
- All actions include try-catch blocks
- User-friendly error messages returned in FormState
- Errors displayed in UI (if error handling is implemented)

### Path Revalidation
- Delete action: Revalidates `/admin` and `/${locale}/${slug}`
- Toggle publish: Revalidates `/admin` and `/${locale}`
- Save action: Revalidates `/admin` and `/${locale}/${slug}`

### Security
- All actions require authentication via `getCurrentSession()`
- Page existence verified before operations
- Confirmation dialog for destructive delete action

## Testing Checklist

### Publish/Unpublish
- [ ] Can publish a draft translation
- [ ] Can unpublish a published translation
- [ ] Status indicator updates correctly
- [ ] Button variant changes correctly
- [ ] Published status persists after page refresh
- [ ] Content is not modified when toggling publish status

### Delete
- [ ] Delete button shows confirmation dialog
- [ ] Can cancel deletion
- [ ] Translation is deleted from database after confirmation
- [ ] User is redirected to `/admin` after deletion
- [ ] Page itself is not deleted (only translation)
- [ ] Other translations of the same page are not affected

### Save
- [ ] Content saves with correct published status
- [ ] Published status is preserved when saving content
- [ ] Can save draft (published=false)
- [ ] Can save published (published=true)

### Edge Cases
- [ ] Toggle publish on non-existent translation shows error
- [ ] Delete on non-existent translation shows error
- [ ] Actions fail gracefully when not authenticated
- [ ] Concurrent actions don't cause race conditions

## Future Enhancements

### Potential Improvements
1. **Bulk Actions**: Publish/unpublish multiple translations at once
2. **Publishing Workflow**: Add "review" status before publishing
3. **Version History**: Track published/unpublished history
4. **Scheduled Publishing**: Auto-publish/unpublish at specific times
5. **Permissions**: Restrict publish/delete to certain user roles
6. **Soft Delete**: Mark translations as deleted instead of removing them
7. **Undo**: Restore accidentally deleted translations

### UI Enhancements
1. **Loading States**: Show spinner during publish/delete operations
2. **Success Notifications**: Toast messages after successful operations
3. **Error Display**: Inline error messages for failed operations
4. **Keyboard Shortcuts**: Quick keys for publish/delete
5. **Batch Operations**: Select multiple translations for bulk actions

## Related Documentation

- `docs/PUCK_COMPONENTS_GUIDE.md` - Puck component usage
- `docs/SERVER_ACTIONS_GUIDE.md` - Server action patterns
- `docs/INVITATION_SYSTEM.md` - Authentication system
- `DATABASE_SETUP.md` - Database schema documentation
