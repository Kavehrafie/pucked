# Page Tree Sync and Selection System

## Overview

This document explains how the page tree synchronization and selection system works in the Pucked admin area. This system ensures that:

1. **Sync**: Changes made in the Page Properties Form immediately reflect in the Page Tree
2. **Selection**: The currently selected page is visually highlighted in the tree

## Architecture

The system uses three React Contexts working together:

```
┌─────────────────────────┐
│  PageTreeContext        │
│  - pagesTree: state     │
│  - updatePageInTree()   │
│  - setPagesTree()       │
└───────────┬─────────────┘
            │
            │ provides tree data
            ▼
┌─────────────────────────┐
│  SortableTree Component │
│  - Renders tree UI      │
│  - Uses pagesTree       │
│  - Shows selected page  │
└───────────┬─────────────┘
            │
            │ gets/sets selection
            ▼
┌─────────────────────────┐
│ PageSelectionContext    │
│  - selectedPage: state  │
│  - setSelectedPage()    │
└─────────────────────────┘
            ▲
            │
            │ updates after save
┌───────────┴─────────────┐
│ PagePropertiesForm      │
│  - Edits page data      │
│  - Calls updatePage()   │
│  - Updates contexts     │
└─────────────────────────┘
```

## 1. PageTreeContext - Tree State Management

**Location**: `contexts/page-tree-context.tsx`

### Purpose
Manages the centralized state for the page tree structure. All components that need to display or modify the tree use this context.

### Key State
```typescript
pagesTree: PageTreeNode[]  // The tree structure
```

### Key Methods

#### `updatePageInTree(page: Page)`
Updates a single node in the tree when page data changes.

**How it works**:
1. Receives the updated `Page` object (from server action response)
2. Recursively traverses the tree to find the node with matching `id`
3. Updates that node's properties (title, slug, isDraft, showOnMenu)
4. Triggers re-render in all components using `pagesTree`

**Implementation**:
```typescript
const updatePageInTree = useCallback((page: Page) => {
  setPagesTree((prevTree) => {
    const updateNode = (nodes: PageTreeNode[]): PageTreeNode[] => {
      return nodes.map((node) => {
        // Found the node - update it
        if (node.id === String(page.id)) {
          return {
            ...node,
            title: page.title,
            slug: page.slug,
            isDraft: page.isDraft,
            showOnMenu: page.showOnMenu,
          };
        }
        // Check children recursively
        if (node.children) {
          return {
            ...node,
            children: updateNode(node.children),
          };
        }
        return node;
      });
    };
    return updateNode(prevTree);
  });
}, []);
```

**Why recursive?** The tree is a nested structure where nodes can have children, which can have their own children. We need to search the entire tree to find the matching node.

#### `setPagesTree(tree: PageTreeNode[])`
Directly replaces the entire tree. Used for:
- Initial tree load
- After drag-and-drop reordering
- After collapsing/expanding nodes
- After deleting pages

## 2. PageSelectionContext - Selection Tracking

**Location**: `components/admin/page-selection-context.tsx`

### Purpose
Tracks which page is currently selected in the admin interface.

### Key State
```typescript
selectedPage: Page | null  // The currently selected page, or null
```

### Key Methods

#### `setSelectedPage(page: Page | null)`
Sets the currently selected page. Called when:
- User clicks a page in the tree
- Form successfully updates a page (to refresh selection)
- Form creates a new page (to select it)

#### `clearSelection()`
Clears the selection. Called when:
- User deletes the selected page
- User navigates away

## 3. SortableTree Component

**Location**: `components/admin/sortable-tree.tsx`

### Purpose
Renders the drag-and-drop sortable page tree with visual selection indication.

### Key Changes for Sync

#### Before (Local State - Didn't Work)
```typescript
const [itemsState, setItemsState] = useState<PageTreeNode[]>(items);
```
**Problem**: When `updatePageInTree()` updated the context, SortableTree didn't see the changes because it was using local state.

#### After (Context State - Works)
```typescript
const { pagesTree, setPagesTree } = usePageTree();
const itemsState = pagesTree.length > 0 ? pagesTree : items;
```
**Solution**: SortableTree now uses `pagesTree` from context. When `updatePageInTree()` updates the context, SortableTree automatically re-renders with the new data.

### Key Changes for Active Styling

#### 1. Get Selected Page
```typescript
const { selectedPage } = usePageSelection();
```

#### 2. Pass Selection State to Tree Items
```typescript
<SortableTreeItem
  // ... other props
  isSelected={selectedPage?.id === parseInt(node.id, 10)}
  onClick={() => {
    const page: Page = {
      id: parseInt(node.id, 10),
      title: node.title,
      slug: node.slug,
      isDraft: node.isDraft,
      showOnMenu: node.showOnMenu,
      sortOrder: 0,
      parentId: null,
    };
    setSelectedPage(page);
  }}
/>
```

**How it works**:
- `isSelected` is `true` when this tree item's ID matches `selectedPage.id`
- When user clicks, `setSelectedPage()` updates the context
- All tree items re-render, and only the matching one shows active styling

#### 3. Update Context on Tree Changes
All tree modifications now update the context instead of local state:

**Drag and Drop**:
```typescript
const newItems = buildTreeFromFlattened(sortedItems, ...);
setPagesTree(newItems);  // Was: setItemsState(newItems)
```

**Collapse/Expand**:
```typescript
setPagesTree(toggleCollapse(itemsState));  // Was: setItemsState(...)
```

**Delete**:
```typescript
setPagesTree(removeNode(itemsState));  // Was: setItemsState(...)
```

## 4. TreeItem Component - Visual Styling

**Location**: `components/TreeItem/TreeItem.tsx`

### Purpose
Renders individual tree items with drag handle, collapse button, and selection styling.

### Selection Styling

#### Props
```typescript
isSelected?: boolean  // Whether this item is the selected page
```

#### Styling Logic
```typescript
<div
  className={cn(
    "flex items-center gap-2 rounded-lg border px-3 py-2.5 ...",
    // Default state
    "bg-card border-border",
    // Hover state (when not disabled)
    !disableInteraction && "hover:bg-accent/50",
    // Selected state - overrides default
    isSelected && "bg-primary/10 border-primary"
  )}
>
```

**Visual States**:
1. **Default**: Gray background (`bg-card`), gray border (`border-border`)
2. **Hover**: Light accent background (`bg-accent/50`)
3. **Selected**: Primary color background (`bg-primary/10`), primary border (`border-primary`)

**Why `bg-primary/10`?** The `/10` means 10% opacity, providing a subtle highlight that's clearly visible but not overwhelming.

## 5. PagePropertiesForm - Triggering Updates

**Location**: `components/admin/page-properties-form.tsx`

### Purpose
Form for editing page properties. After successful save, it updates both contexts.

### Update Flow

#### 1. User Submits Form
```typescript
<form action={formAction}>
  {/* Form fields */}
</form>
```

#### 2. Server Action Returns Updated Page
```typescript
const result = await updatePageAction(prevState, formData);

if (result.success && result.updatedPage) {
  // result.updatedPage contains fresh data from database
}
```

#### 3. useEffect Updates Contexts
```typescript
useEffect(() => {
  if (state.updatedPage) {
    // Update tree to show new title/slug/etc
    updatePageInTree(state.updatedPage);
    
    // Update selection to refresh form data
    setSelectedPage(state.updatedPage);
    
    // Show success notification
    showSuccess("Page updated successfully");
  }
}, [state.updatedPage, updatePageInTree, setSelectedPage, showSuccess]);
```

**Why both contexts?**
- `updatePageInTree()`: Updates the tree view to show new data
- `setSelectedPage()`: Ensures the form has the latest page data
- `showSuccess()`: Provides user feedback

## Complete Data Flow Example

### Scenario: User Changes Page Title

**Step 1: User edits title in form**
```
PagePropertiesForm
  ↓
User types "New Title" in title field
```

**Step 2: User submits form**
```
<form action={formAction}>
  ↓
updatePageAction(prevState, formData)
```

**Step 3: Server updates database**
```
updatePageAction()
  ↓
db.update(pages).set({ title: "New Title" })
  ↓
Returns { success: true, updatedPage: { id: 1, title: "New Title", ... } }
```

**Step 4: useEffect detects success**
```
useEffect(() => {
  if (state.updatedPage) {
    updatePageInTree(state.updatedPage);  // ← Triggers tree update
    setSelectedPage(state.updatedPage);    // ← Refreshes selection
    showSuccess("Page updated successfully");
  }
}, [state.updatedPage, ...]);
```

**Step 5: PageTreeContext updates tree**
```
updatePageInTree({ id: 1, title: "New Title", ... })
  ↓
setPagesTree((prevTree) => {
  return prevTree.map(node => {
    if (node.id === "1") {
      return { ...node, title: "New Title" };  // ← Updates node
    }
    return node;
  });
});
```

**Step 6: SortableTree re-renders**
```
SortableTree
  ↓
const itemsState = pagesTree;  // ← Gets updated tree
  ↓
Renders tree with "New Title"
```

**Step 7: Tree item shows selection**
```
TreeItem
  ↓
isSelected={selectedPage?.id === parseInt(node.id, 10)}
  ↓
If true: className="bg-primary/10 border-primary"
```

**Result**: User sees the title change in the tree immediately, with the page still highlighted as selected.

## Key Patterns

### 1. Single Source of Truth
**Rule**: All tree state lives in PageTreeContext.

**Why**: Ensures all components see the same data. When one component updates the tree, all components see the change.

**Example**:
```typescript
// ❌ Wrong - Local state
const [tree, setTree] = useState(items);

// ✅ Correct - Context state
const { pagesTree, setPagesTree } = usePageTree();
```

### 2. Context Updates Trigger Re-renders
**Rule**: When context state changes, all components using that context re-render.

**Why**: Automatic synchronization without manual prop drilling.

**Example**:
```typescript
// In PagePropertiesForm
updatePageInTree(updatedPage);  // Updates context

// In SortableTree (different component)
const itemsState = pagesTree;  // Automatically gets new value
```

### 3. Recursive Tree Traversal
**Rule**: Use recursion to search/modify nested tree structures.

**Why**: Trees can have arbitrary depth. Recursion handles any depth.

**Example**:
```typescript
const updateNode = (nodes: PageTreeNode[]): PageTreeNode[] => {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return { ...node, title: newTitle };  // Found it
    }
    if (node.children) {
      return { ...node, children: updateNode(node.children) };  // Search deeper
    }
    return node;  // Not this node, no children
  });
};
```

### 4. Conditional Styling with cn()
**Rule**: Use `cn()` utility for conditional class names.

**Why**: Clean, readable conditional styling.

**Example**:
```typescript
className={cn(
  "base-classes",
  condition && "conditional-classes",
  anotherCondition && "more-classes"
)}
```

### 5. Type Guards for Optional State
**Rule**: Always check if context state exists before using.

**Why**: Prevents runtime errors when state is null/undefined.

**Example**:
```typescript
// ❌ Wrong - Could crash
isSelected={selectedPage.id === nodeId}

// ✅ Correct - Safe check
isSelected={selectedPage?.id === nodeId}
```

## Testing the System

### Test 1: Sync Verification
1. Open admin dashboard
2. Click a page in the tree
3. Change the title in the form
4. Click "Save Changes"
5. **Expected**: Tree immediately shows new title

### Test 2: Selection Styling
1. Open admin dashboard
2. Click different pages in the tree
3. **Expected**: Clicked page gets primary color background
4. **Expected**: Previously selected page loses highlight

### Test 3: Persistence
1. Select a page (it highlights)
2. Edit and save the page
3. **Expected**: Page remains selected after save
4. **Expected**: Form shows updated data

## Troubleshooting

### Issue: Tree doesn't update after form save
**Cause**: SortableTree using local state instead of context
**Fix**: 
```typescript
// Add to SortableTree
const { pagesTree, setPagesTree } = usePageTree();
const itemsState = pagesTree.length > 0 ? pagesTree : items;
```

### Issue: Selected page doesn't highlight
**Cause**: TreeItem not receiving `isSelected` prop
**Fix**:
```typescript
// In SortableTree, pass isSelected
<SortableTreeItem
  isSelected={selectedPage?.id === parseInt(node.id, 10)}
  // ... other props
/>
```

### Issue: Selection lost after save
**Cause**: Form not calling `setSelectedPage()` after update
**Fix**:
```typescript
// In PagePropertiesForm useEffect
useEffect(() => {
  if (state.updatedPage) {
    setSelectedPage(state.updatedPage);  // ← Add this
  }
}, [state.updatedPage, setSelectedPage]);
```

## Related Files

- `contexts/page-tree-context.tsx` - Tree state management
- `components/admin/page-selection-context.tsx` - Selection tracking
- `components/admin/sortable-tree.tsx` - Tree UI component
- `components/TreeItem/TreeItem.tsx` - Individual tree item
- `components/TreeItem/SortableTreeItem.tsx` - Draggable tree item
- `components/admin/page-properties-form.tsx` - Page edit form
- `app/actions.ts` - Server actions (updatePageAction)

## Summary

The sync and selection system works by:

1. **Centralized State**: PageTreeContext holds the single source of truth for tree data
2. **Context Updates**: When data changes, update the context (not local state)
3. **Automatic Re-renders**: Components using context automatically see changes
4. **Visual Feedback**: Selected page gets distinct styling via conditional classes
5. **Server Actions**: Form saves return updated data, which triggers context updates

This architecture ensures that changes in the form immediately reflect in the tree, and users always know which page they're working with.
