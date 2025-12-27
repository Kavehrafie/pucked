---
title: Puck Components Guide
description: Complete guide to using @measured/puck components in the admin dashboard for visual consistency with the page editor.
order: 4
category: Development
tags:
  - puck
  - components
  - admin
  - ui
  - design-system
lastModified: 2025-12-27
author: Pucked Team
---

# Puck Components Guide

This guide covers using `@measured/puck` components in the admin dashboard to maintain visual consistency with the page editor.

## Why Use Puck Components?

The admin dashboard uses `@measured/puck` components to maintain **visual consistency** with the page editor. This creates a cohesive user experience throughout the admin interface.

**Benefits:**
- ✅ Consistent styling with the page editor
- ✅ No additional CSS to maintain
- ✅ Automatic updates with Puck releases
- ✅ Reduced bundle size (already installed)
- ✅ Familiar patterns for users

## Quick Start

### 1. Import Components

```tsx
import { Button, ActionBar, IconButton } from "@measured/puck";
```

### 2. Use in Admin Pages

```tsx
<ActionBar label="Actions">
  <ActionBar.Action onClick={() => {}}>
    <Button variant="primary">Save</Button>
  </ActionBar.Action>
</ActionBar>
```

### 3. Follow Puck's Styling Patterns

```tsx
// Use CSS variables for styling
<div style={{
  background: "var(--puck-color-grey-12)",
  padding: "var(--puck-space-px)"
}}>
```

## Available Components

### Button

Primary and secondary button variants with icon support.

**Props:**
- `variant`: "primary" | "secondary" | "ghost"
- `href`: string (for links)
- `onClick`: function
- `icon`: React element
- `fullWidth`: boolean
- `disabled`: boolean

**Examples:**

```tsx
// Primary button
<Button variant="primary">Save</Button>

// Secondary button
<Button variant="secondary">Cancel</Button>

// With icon
<Button variant="primary" icon={<Plus />}>
  Add Item
</Button>

// As link
<Button variant="primary" href="/admin/pages">
  View Pages
</Button>

// Full width
<Button variant="primary" fullWidth>
  Submit
</Button>
```

**⚠️ Constraints:**
- Does NOT accept `className` prop
- Does NOT support `asChild` pattern
- Use `href` prop for links, not `<a>` wrapper

### ActionBar

Action bar with label and action buttons.

**Structure:**
```tsx
<ActionBar label="Actions">
  <ActionBar.Action onClick={handler1}>
    <Button>Action 1</Button>
  </ActionBar.Action>
  <ActionBar.Action onClick={handler2}>
    <Button>Action 2</Button>
  </ActionBar.Action>
</ActionBar>
```

**⚠️ Constraints:**
- Uses `label` prop, NOT `ActionBar.Label` subcomponent
- Actions must be wrapped in `ActionBar.Action`

### IconButton

Icon-only buttons with tooltip support.

**Props:**
- `icon`: React element (required)
- `title`: string (required for accessibility)
- `onClick`: function
- `href`: string

**Examples:**

```tsx
// Basic icon button
<IconButton
  icon={<Trash />}
  title="Delete"
  onClick={() => {}}
/>

// As link
<IconButton
  icon={<Edit />}
  title="Edit"
  href="/admin/edit"
/>
```

**⚠️ Constraints:**
- `title` prop is REQUIRED for accessibility
- Icon prop is required

### Drawer

Collapsible drawer for navigation menus.

**Examples:**

```tsx
<Drawer>
  <Drawer.Item href="/admin/pages">
    Pages
  </Drawer.Item>
  <Drawer.Item href="/admin/settings">
    Settings
  </Drawer.Item>
</Drawer>
```

**⚠️ Constraints:**
- `Drawer.Item` `label` expects string, NOT JSX
- For custom navigation, use plain links instead

### DropZone

Drop zone for drag-and-drop content areas.

```tsx
<DropZone zone="sidebar">
  {/* Droppable area */}
</DropZone>
```

### FieldLabel

Labels for form fields with optional icons.

```tsx
<FieldLabel label="Page Title" icon={<Heading />} />
```

### Label

Text label component.

```tsx
<Label label="Description" />
```

### AutoField

Auto-rendering field component for dynamic forms.

```tsx
<AutoField field={fieldConfig} />
```

## Styling with CSS Variables

Puck uses CSS custom properties for theming. Use these for consistent styling:

**Colors:**
- `--puck-color-grey-12` through `--puck-color-grey-0` (grayscale)
- `--puck-color-blue` (primary color)
- `--puck-color-red` (destructive color)
- `--puck-color-green` (success color)

**Spacing:**
- `--puck-space-px` (1px)
- `--puck-space-1` through `--puck-space-16` (spacing scale)

**Example:**

```tsx
<div style={{
  background: "var(--puck-color-grey-12)",
  padding: "var(--puck-space-4)",
  borderRadius: "var(--puck-space-2)"
}}>
  Content
</div>
```

## Common Patterns

### Action Bar with Multiple Actions

```tsx
<ActionBar label="Page Actions">
  <ActionBar.Action onClick={handleSave}>
    <Button variant="primary">Save</Button>
  </ActionBar.Action>
  <ActionBar.Action onClick={handleCancel}>
    <Button variant="secondary">Cancel</Button>
  </ActionBar.Action>
  <ActionBar.Action onClick={handleDelete}>
    <Button variant="ghost" icon={<Trash />} title="Delete" />
  </ActionBar.Action>
</ActionBar>
```

### Icon Button Group

```tsx
<div style={{ display: "flex", gap: "var(--puck-space-2)" }}>
  <IconButton icon={<Edit />} title="Edit" onClick={handleEdit} />
  <IconButton icon={<Copy />} title="Duplicate" onClick={handleDuplicate} />
  <IconButton icon={<Trash />} title="Delete" onClick={handleDelete} />
</div>
```

### Button with Link

```tsx
<Button variant="primary" href="/admin/pages/new">
  New Page
</Button>
```

## Common Pitfalls

### ❌ Wrong: Using className with Button

```tsx
<Button className="my-class">Click</Button>  // Error
```

### ✅ Correct: Use wrapper div

```tsx
<div className="my-class">
  <Button>Click</Button>
</div>
```

### ❌ Wrong: Using asChild pattern

```tsx
<Button asChild>
  <a href="/link">Link</a>
</Button>  // Error
```

### ✅ Correct: Use href prop

```tsx
<Button href="/link">Link</Button>
```

### ❌ Wrong: ActionBar.Label subcomponent

```tsx
<ActionBar>
  <ActionBar.Label>Actions</ActionBar.Label>  // Wrong
</ActionBar>
```

### ✅ Correct: Use label prop

```tsx
<ActionBar label="Actions">
  {/* actions */}
</ActionBar>
```

### ❌ Wrong: IconButton without title

```tsx
<IconButton icon={<Trash />} />  // Missing title
```

### ✅ Correct: Always include title

```tsx
<IconButton icon={<Trash />} title="Delete" />
```

## When to Use Puck Components

Use Puck components in:
- ✅ All admin pages (`app/admin/*`)
- ✅ Admin dashboard
- ✅ Page management
- ✅ Settings panels
- ✅ Any UI within `/admin/*` routes

**Do NOT use Puck components in:**
- ❌ Public pages (`app/[locale]/*`)
- ❌ Login/signup forms
- ❌ Guest-facing UI

For public pages, use [Shadcn UI components](./ui-guidelines.md).

## See Also

- [UI Guidelines](./ui-guidelines.md) - Complete design system documentation
- [Server Actions Guide](./server-actions.md) - Form handling patterns
- [Getting Started](./getting-started.md) - Project setup overview
