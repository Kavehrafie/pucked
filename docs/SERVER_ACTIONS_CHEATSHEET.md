# Server Actions Quick Reference

## Type Definitions

```typescript
// For actions that return data/errors
type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

// For form submissions
type FormActionResult = {
  error?: string;
  success?: boolean;
};

// For actions that always redirect
type void
```

## Common Patterns

### 1. Simple Form with Error Display
```typescript
export async function submitForm(formData: FormData): Promise<FormActionResult> {
  const value = formData.get("field") as string;
  
  if (!value) {
    return { error: "Field is required" };
  }
  
  await doSomething(value);
  return { success: true };
}
```

### 2. Action with Redirect
```typescript
export async function doSomething(): Promise<void> {
  const result = await someOperation();
  redirect("/success"); // Never returns
}
```

### 3. Authenticated Action
```typescript
export async function protectedAction(): Promise<ActionResult> {
  const { user } = await getCurrentSession();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  
  const result = await doWork(user.id);
  return { success: true, data: result };
}
```

### 4. Form Validation with Redirect
```typescript
export async function submitForm(formData: FormData): Promise<void> {
  const code = formData.get("code") as string;
  
  if (!code) {
    redirect("/form?error=required");
  }
  
  await processCode(code);
  redirect("/success");
}
```

## FormData Validation

```typescript
// Extract string from FormData
const rawValue = formData.get("field");
const value = typeof rawValue === "string" ? rawValue.trim() : "";

// Validate presence
if (!value) {
  return { error: "Field is required" };
}

// Validate format
if (!value.match(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/i)) {
  return { error: "Invalid format" };
}

// Validate length
if (value.length < 10) {
  return { error: "Too short" };
}
```

## Error Handling

```typescript
// Try-catch
export async function myAction(): Promise<ActionResult> {
  try {
    const result = await riskyOperation();
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

// Early return
export async function myAction(): Promise<ActionResult> {
  const { user } = await getCurrentSession();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  
  // Continue...
}
```

## Redirects

```typescript
import { redirect } from "next/navigation";

// Simple redirect
redirect("/path");

// With query params
redirect("/path?error=message");

// Conditional
if (error) {
  redirect("/error");
}
redirect("/success");
```

## Revalidation

```typescript
import { revalidatePath } from "next/cache";

// Revalidate single path
revalidatePath("/posts");

// Revalidate multiple paths
revalidatePath("/admin");
revalidatePath("/profile");
```

## Client-Side Usage

### Basic Form
```tsx
<form action={serverAction}>
  <input name="field" />
  <button>Submit</button>
</form>
```

### With Error Display
```tsx
"use client";

import { useActionState } from "react";

export default function Form() {
  const [state, formAction, isPending] = useActionState(serverAction, null);
  
  return (
    <form action={formAction}>
      {state?.error && <p className="error">{state.error}</p>}
      <input name="field" disabled={isPending} />
      <button disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## Best Practices

✅ **DO:**
- Use consistent return types
- Validate FormData
- Handle errors explicitly
- Add JSDoc comments
- Use TypeScript
- Log errors

❌ **DON'T:**
- Mix return types
- Return both data and redirect
- Use `any` for FormData
- Silently swallow errors
- Forget null checks

## Common Gotchas

### FormData values can be null
```typescript
// ❌ BAD
const value = formData.get("field") as string;

// ✅ GOOD
const rawValue = formData.get("field");
const value = typeof rawValue === "string" ? rawValue : "";
```

### Redirect never returns
```typescript
// ❌ BAD
export async function badAction(): Promise<ActionResult> {
  if (error) return { error: "Oops" };
  redirect("/success"); // Type error!
}

// ✅ GOOD
export async function goodAction(): Promise<void> {
  if (error) redirect("/error");
  redirect("/success");
}
```

### Don't forget to trim strings
```typescript
// ❌ BAD
const value = formData.get("field") as string;
if (value === "") { ... } // " " passes!

// ✅ GOOD
const value = formData.get("field") as string;
const trimmed = typeof value === "string" ? value.trim() : "";
if (!trimmed) { ... }
```
