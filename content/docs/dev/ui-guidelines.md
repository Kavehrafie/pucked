---
title: UI Guidelines
description: Complete design system documentation for the Pucked application, covering dual design system approach, styling conventions, and UI patterns.
order: 5
category: Development
tags:
  - ui
  - design-system
  - tailwind
  - components
  - styling
lastModified: 2025-12-27
author: Pucked Team
---

# UI Guidelines

This guide covers the design system, styling conventions, and UI patterns used throughout the Pucked application.

## Dual Design System

**CRITICAL**: This project uses a **dual design system** approach:

### Admin Area (`/admin/*`)
- **Component Library**: `@measured/puck` v0.20.2
- **Purpose**: Visual consistency with the page editor
- **Import**: `import { Button, ActionBar } from "@measured/puck"`
- **Documentation**: See [Puck Components Guide](./puck-components.md)

### Guest/Public Area (`/app/[locale]/*`)
- **Component Library**: Shadcn UI
- **Purpose**: Accessible, customizable components for public pages
- **Import**: `import { Button } from "@/components/ui/button"`
- **Location**: `components/ui/`

## Core Principles

### 1. No Inline Styles
**❌ Never use inline styles:**
```tsx
<div style={{ color: "red", padding: "20px" }}>Wrong</div>
```

**✅ Always use Tailwind utility classes:**
```tsx
<div className="text-red-500 p-5">Correct</div>
```

### 2. Semantic Color Tokens
**❌ Avoid hardcoded colors:**
```tsx
<div className="bg-[#ff0000] text-[#ffffff]">Wrong</div>
```

**✅ Use semantic color tokens:**
```tsx
<div className="bg-destructive text-destructive-foreground">Correct</div>
```

**Available semantic tokens:**
- `bg-primary`, `text-primary`, `border-primary`
- `bg-secondary`, `text-secondary`, `border-secondary`
- `bg-muted`, `text-muted-foreground`
- `bg-accent`, `text-accent-foreground`
- `bg-destructive`, `text-destructive`, `border-destructive`
- `bg-card`, `text-card-foreground`, `border-card`

### 3. Dark Mode Support
**❌ Missing dark mode:**
```tsx
<div className="bg-white text-gray-900">Wrong</div>
```

**✅ Always add dark mode variants:**
```tsx
<div className="bg-background text-foreground dark:bg-gray-950 dark:text-gray-50">Correct</div>
```

### 4. Use the `cn()` Helper
For conditional class merging:

```tsx
import { cn } from "@/lib/utils"

// Conditional classes
<div className={cn(
  "base-class",
  condition && "conditional-class",
  className // allow override via prop
)} />

// Example with error state
<Input className={cn(
  hasError && "border-destructive"
)} />
```

## Spacing

### Tailwind Scale (4px base)
```tsx
// Small gaps
<div className="gap-1">  // 4px
<div className="gap-2">  // 8px

// Medium gaps
<div className="gap-4">  // 16px
<div className="gap-6">  // 24px

// Large gaps
<div className="gap-8">  // 32px
<div className="gap-12"> // 48px
```

### Flex Layouts
```tsx
// ✅ Use gap for flex
<div className="flex gap-4">
  <Item />
  <Item />
</div>

// ❌ Don't use space-x for flex
<div className="flex space-x-4">  // Wrong
```

### Vertical Layouts
```tsx
// ✅ Use space-y for vertical
<div className="space-y-4">
  <Item />
  <Item />
</div>

// ❌ Don't use gap for stacked elements
<div className="flex flex-col gap-4">  // Less semantic
```

## Typography

### Font Sizes
```tsx
<p className="text-xs">   // Extra small (12px)
<p className="text-sm">   // Small (14px)
<p className="text-base"> // Base (16px)
<p className="text-lg">   // Large (18px)
<p className="text-xl">   // Extra large (20px)
<p className="text-2xl">  // 2X large (24px)
```

### Font Weights
```tsx
<span className="font-normal">  // 400
<span className="font-medium">  // 500
<span className="font-semibold"> // 600
<span className="font-bold">    // 700
```

### Text Colors
```tsx
// Primary text
<p className="text-foreground">Main content</p>

// Muted text
<p className="text-muted-foreground">Secondary info</p>

// Error text
<p className="text-destructive">Error message</p>

// Success text
<p className="text-green-600 dark:text-green-400">Success</p>
```

## Error Styling

### Field Error
```tsx
// Input with error
<Input
  className={cn(
    hasError && "border-destructive focus-visible:ring-destructive"
  )}
/>

// Error message
{hasError && (
  <p className="text-xs text-destructive mt-1">{error}</p>
)}
```

### Form-Level Error
```tsx
// Error banner
{formError && (
  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
    <p className="text-sm text-destructive">{formError}</p>
  </div>
)}
```

## Common UI Patterns

### Centered Form Layout
```tsx
<div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
  <div className="w-full max-w-lg">
    <Card>
      <CardHeader>
        <CardTitle>Form Title</CardTitle>
        <CardDescription>Brief description</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Form content */}
      </CardContent>
    </Card>
  </div>
</div>
```

### Form Field with Label
```tsx
<div className="space-y-2">
  <Label htmlFor="field">Field Name</Label>
  <Input
    id="field"
    name="field"
    type="text"
    placeholder="Enter value"
    required
  />
  {error && (
    <p className="text-xs text-destructive">{error}</p>
  )}
</div>
```

### Checkbox with Label
```tsx
<div className="flex items-center gap-2">
  <Checkbox id="agree" name="agree" />
  <Label htmlFor="agree" className="cursor-pointer">
    I agree to the terms
  </Label>
</div>
```

### Action Bar
```tsx
// Using Shadcn UI (public area)
<div className="flex items-center justify-between p-4 border-b">
  <h2 className="text-lg font-semibold">Actions</h2>
  <div className="flex gap-2">
    <Button variant="secondary">Cancel</Button>
    <Button>Save</Button>
  </div>
</div>

// Using Puck (admin area)
<ActionBar label="Actions">
  <ActionBar.Action onClick={handleSave}>
    <Button variant="primary">Save</Button>
  </ActionBar.Action>
</ActionBar>
```

### Card Layout
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Brief description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

### Loading State
```tsx
// Skeleton loader
<div className="space-y-4">
  <div className="h-4 bg-muted animate-pulse rounded" />
  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
</div>

// Spinner
<div className="flex items-center justify-center p-8">
  <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
</div>
```

## Responsive Design

### Breakpoints
```tsx
// Mobile first
<div className="p-4 md:p-6 lg:p-8">Content</div>

// Hide on mobile
<div className="hidden md:block">Desktop only</div>

// Show on mobile only
<div className="md:hidden">Mobile only</div>
```

### Grid Layouts
```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Item />
  <Item />
  <Item />
</div>

// Auto-fit grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <Item />
  <Item />
</div>
```

## Accessibility

### Semantic HTML
```tsx
// ✅ Use semantic elements
<header>
  <nav>
    <ul>
      <li><a href="/link">Link</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Article Title</h1>
  </article>
</main>

<footer>
  <p>Footer content</p>
</footer>
```

### ARIA Labels
```tsx
// Icon buttons need labels
<IconButton icon={<Trash />} title="Delete" />

// Custom interactive elements
<div role="button" tabIndex={0} aria-label="Close">
  <X />
</div>
```

### Focus States
```tsx
// Ensure visible focus
<button className="focus-visible:ring-2 focus-visible:ring-primary">
  Click me
</button>
```

## Animation

### Transitions
```tsx
// Smooth transitions
<div className="transition-all duration-200 hover:scale-105">
  Content
</div>

// Color transitions
<Button className="transition-colors duration-200">
  Hover me
</Button>
```

### Animations
```tsx
// Pulse animation
<div className="animate-pulse">Loading...</div>

// Spin animation
<div className="animate-spin">Spinner</div>

// Bounce animation
<div className="animate-bounce">Bounce</div>
```

## Common Pitfalls

### ❌ Inline Styles
```tsx
<div style={{ padding: "20px", color: "red" }}>Wrong</div>
```

### ✅ Tailwind Classes
```tsx
<div className="p-5 text-red-500">Correct</div>
```

### ❌ Hardcoded Colors
```tsx
<div className="bg-[#ff0000] text-[#ffffff]">Wrong</div>
```

### ✅ Semantic Tokens
```tsx
<div className="bg-destructive text-destructive-foreground">Correct</div>
```

### ❌ Missing Dark Mode
```tsx
<div className="bg-white text-gray-900">Wrong</div>
```

### ✅ Dark Mode Support
```tsx
<div className="bg-background text-foreground dark:bg-gray-950 dark:text-gray-50">Correct</div>
```

### ❌ Wrong Component Library
```tsx
// Using Shadcn in admin
import { Button } from "@/components/ui/button"  // Wrong in admin
```

### ✅ Correct Component Library
```tsx
// Using Puck in admin
import { Button } from "@measured/puck"  // Correct in admin

// Using Shadcn in public
import { Button } from "@/components/ui/button"  // Correct in public
```

## See Also

- [Puck Components Guide](./puck-components.md) - Admin component library
- [Server Actions Guide](./server-actions.md) - Form handling patterns
- [Getting Started](./getting-started.md) - Project setup overview
