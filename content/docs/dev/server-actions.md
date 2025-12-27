---
title: Server Actions Guide
description: Complete guide to using Next.js Server Actions with React 19's useActionState for form handling in the Pucked application.
order: 6
category: Development
tags:
  - server-actions
  - forms
  - react-19
  - nextjs
  - validation
lastModified: 2025-12-27
author: Pucked Team
---

# Server Actions Guide

This guide covers using Next.js Server Actions with React 19's `useActionState` hook for form handling in the Pucked application.

## Overview

Server Actions allow you to run server code directly from client components, eliminating the need for manual API route creation. In Pucked, we use Server Actions with React 19's `useActionState` hook for form handling.

**Key Benefits:**
- ✅ No manual API route creation
- ✅ Automatic form validation
- ✅ Built-in error handling
- ✅ Progressive enhancement
- ✅ TypeScript support

## Server Action Definition

### Location

All server actions are centralized in `app/actions.ts`.

### Standard Pattern

```typescript
"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/route-guard";

type FormState = {
  errors?: {
    fieldName?: string[]
    _form?: string[]
  }
  success?: boolean
}

export async function someAction(prevState: FormState, formData: FormData) {
  const { user } = await requireAuth();
  
  // Validate input
  const title = formData.get("title");
  if (!title || typeof title !== "string") {
    return {
      errors: {
        title: ["Title is required"]
      }
    };
  }
  
  // Process data
  try {
    // Database operations, etc.
    return { success: true };
  } catch (error) {
    return {
      errors: {
        _form: ["Something went wrong. Please try again."]
      }
    };
  }
}
```

### Key Components

1. **"use server" directive** - Marks function as a Server Action
2. **FormState type** - Defines error structure
3. **prevState parameter** - Required by useActionState
4. **formData parameter** - Form data from client
5. **Error handling** - Returns structured errors
6. **Authentication** - Uses `requireAuth()` for protected actions

## Client Component Form Pattern

### Basic Form

**CRITICAL**: Always use `useActionState` from `"react"`, NOT `useFormState` from `"react-dom"`.

```typescript
"use client"

import { useActionState } from "react"
import { someAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type FormState = {
  errors?: {
    title?: string[]
    _form?: string[]
  }
  success?: boolean
}

const initialState: FormState = {}

export function MyForm() {
  const [state, formAction] = useActionState(someAction, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Title</CardTitle>
        <CardDescription>Brief description</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {/* Field with error */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Enter title"
              required
              className={state.errors && 'title' in state.errors ? "border-destructive" : ""}
            />
            {state.errors && 'title' in state.errors && Array.isArray(state.errors.title) && state.errors.title.length > 0 && (
              <p className="text-xs text-destructive">{state.errors.title[0]}</p>
            )}
          </div>

          {/* Form-level error */}
          {state.errors && '_form' in state.errors && Array.isArray(state.errors._form) && state.errors._form.length > 0 && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{state.errors._form[0]}</p>
            </div>
          )}

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### Form with Custom Data Submission

```typescript
"use client"

import { useActionState } from "react"
import { someAction } from "@/app/actions"
import { Button } from "@/components/ui/button"

type FormState = {
  errors?: {
    _form?: string[]
  }
  success?: boolean
}

const initialState: FormState = {}

export function CustomDataForm() {
  const [state, formAction] = useActionState(someAction, initialState)

  const handleSubmit = (formData: FormData) => {
    // Add custom data to form before submitting
    formData.append('customField', JSON.stringify(customData))
    return formAction(formData)
  }

  return (
    <form action={handleSubmit}>
      <Button type="submit">Submit</Button>
    </form>
  )
}
```

## Type-Safe Error Handling

### Field Errors

```typescript
// Type-safe error checking
{state.errors && 'title' in state.errors && Array.isArray(state.errors.title) && state.errors.title.length > 0 && (
  <p className="text-xs text-destructive">{state.errors.title[0]}</p>
)}
```

### Form-Level Errors

```typescript
// Type-safe form error checking
{state.errors && '_form' in state.errors && Array.isArray(state.errors._form) && state.errors._form.length > 0 && (
  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
    <p className="text-sm text-destructive">{state.errors._form[0]}</p>
  </div>
)}
```

## Common Patterns

### Redirect After Success

```typescript
export async function createAction(prevState: FormState, formData: FormData) {
  try {
    // Create item
    await db.insert(items).values({ /* ... */ })
    
    // Redirect after success
    redirect('/admin/items')
  } catch (error) {
    return {
      errors: {
        _form: ["Failed to create item"]
      }
    }
  }
}
```

### Multiple Field Validation

```typescript
export async function validateForm(prevState: FormState, formData: FormData) {
  const errors: Record<string, string[]> = {}
  
  const title = formData.get("title")
  if (!title || typeof title !== "string") {
    errors.title = ["Title is required"]
  }
  
  const email = formData.get("email")
  if (!email || typeof email !== "string") {
    errors.email = ["Email is required"]
  } else if (!email.includes('@')) {
    errors.email = ["Invalid email format"]
  }
  
  if (Object.keys(errors).length > 0) {
    return { errors }
  }
  
  // Process valid data
  return { success: true }
}
```

### File Upload

```typescript
export async function uploadFile(prevState: FormState, formData: FormData) {
  const file = formData.get("file") as File
  
  if (!file || file.size === 0) {
    return {
      errors: {
        file: ["File is required"]
      }
    }
  }
  
  // Process file
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  // Save to storage/database
  // ...
  
  return { success: true }
}
```

## Authentication in Server Actions

### Protected Actions

```typescript
export async function protectedAction(prevState: FormState, formData: FormData) {
  // Require authentication
  const { user } = await requireAuth();
  
  // User is authenticated, proceed
  // ...
}
```

### Require Invitation Acceptance

```typescript
export async function adminAction(prevState: FormState, formData: FormData) {
  // Require authentication AND invitation acceptance
  const { user } = await requireAuth({ requireInvitation: true });
  
  // User is fully authorized, proceed
  // ...
}
```

## Common Pitfalls

### ❌ Wrong: useFormState from react-dom

```typescript
import { useFormState } from "react-dom"  // Wrong
const [state, formAction] = useFormState(action, initialState)
```

### ✅ Correct: useActionState from react

```typescript
import { useActionState } from "react"  // Correct
const [state, formAction] = useActionState(action, initialState)
```

### ❌ Wrong: Calling formAction in onClick

```typescript
<Button onClick={() => formAction()}>Submit</Button>  // Wrong
```

### ✅ Correct: Pass to form's action prop

```typescript
<form action={formAction}>
  <Button type="submit">Submit</Button>
</form>
```

### ❌ Wrong: Not checking array before accessing

```typescript
{state.errors?.title && <p>{state.errors.title[0]}</p>}  // Unsafe
```

### ✅ Correct: Type-safe array checking

```typescript
{state.errors && 'title' in state.errors && Array.isArray(state.errors.title) && state.errors.title.length > 0 && (
  <p>{state.errors.title[0]}</p>
)}
```

### ❌ Wrong: Missing prevState parameter

```typescript
export async function action(formData: FormData) {  // Wrong
  // ...
}
```

### ✅ Correct: Include prevState parameter

```typescript
export async function action(prevState: FormState, formData: FormData) {  // Correct
  // ...
}
```

## Best Practices

1. **Centralize actions** - Keep all server actions in `app/actions.ts`
2. **Type FormState** - Always define the FormState interface
3. **Use requireAuth** - Protect actions that need authentication
4. **Validate input** - Always validate form data before processing
5. **Handle errors** - Return structured errors for better UX
6. **Use semantic colors** - Use `text-destructive`, `bg-destructive/10` for errors
7. **Type-safe checks** - Always check array types before accessing
8. **Redirect after success** - Use `redirect()` for navigation after successful actions

## See Also

- [UI Guidelines](./ui-guidelines.md) - Form styling patterns
- [Authentication Guide](./authentication.md) - Auth system overview
- [Getting Started](./getting-started.md) - Project setup overview
