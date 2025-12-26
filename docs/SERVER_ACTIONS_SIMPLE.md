# Server Actions - The Simple Next.js Way

Based on the official [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms)

## Basic Pattern

### 1. Simple Server Action

```typescript
// app/actions.ts
"use server";

export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  };

  // mutate data
  // revalidate cache
}
```

### 2. Use in Form

```tsx
// app/invoices/page.tsx
import { createInvoice } from "./actions";

export default function Page() {
  return (
    <form action={createInvoice}>
      <input type="text" name="customerId" />
      <input type="number" name="amount" />
      <select name="status">
        <option value="pending">Pending</option>
        <option value="paid">Paid</option>
      </select>
      <button type="submit">Create</button>
    </form>
  );
}
```

## Handling Errors

### Return Error State

```typescript
// app/actions.ts
"use server";

export async function submitInvitation(formData: FormData) {
  const code = formData.get("code") as string;

  if (!code) {
    return { error: "Invitation code is required" };
  }

  // Validate and process
  const invitation = await getInvitation(code);
  if (!invitation) {
    return { error: "Invalid invitation code" };
  }

  // Success - redirect
  redirect("/admin");
}
```

### Display Errors with useActionState

```tsx
"use client";

import { useActionState } from "react";
import { submitInvitation } from "./actions";

const initialState = {
  error: "",
};

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(
    submitInvitation,
    initialState
  );

  return (
    <form action={formAction}>
      <input name="code" disabled={isPending} />
      {state.error && <p className="error">{state.error}</p>}
      <button disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## Form Validation

### Using Zod

```typescript
// app/actions.ts
"use server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid Email"),
});

export async function createUser(formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Mutate data
}
```

### Display Validation Errors

```tsx
"use client";

import { useActionState } from "react";
import { createUser } from "./actions";

const initialState = {
  errors: {},
};

export default function Signup() {
  const [state, formAction] = useActionState(createUser, initialState);

  return (
    <form action={formAction}>
      <label htmlFor="email">Email</label>
      <input type="email" id="email" name="email" required />
      {state.errors?.email && (
        <p className="error">{state.errors.email[0]}</p>
      )}
      <button>Sign up</button>
    </form>
  );
}
```

## Redirects

```typescript
// app/actions.ts
"use server";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  // Update profile
  await db.update(user).set({ name: formData.get("name") });

  // Redirect on success
  redirect("/profile");
}
```

## Passing Additional Arguments

### Using bind()

```tsx
"use client";

import { updateUser } from "./actions";

export function UserProfile({ userId }: { userId: string }) {
  const updateUserWithId = updateUser.bind(null, userId);

  return (
    <form action={updateUserWithId}>
      <input type="text" name="name" />
      <button>Update User Name</button>
    </form>
  );
}
```

```typescript
// app/actions.ts
"use server";

export async function updateUser(userId: string, formData: FormData) {
  // Update user with userId
  await db.update(users).set({ name: formData.get("name") });
}
```

## Pending States

### Using useActionState

```tsx
"use client";

import { useActionState } from "react";
import { createUser } from "./actions";

export function Signup() {
  const [state, formAction, pending] = useActionState(
    createUser,
    initialState
  );

  return (
    <form action={formAction}>
      <input name="email" />
      <button disabled={pending}>
        {pending ? "Submitting..." : "Sign up"}
      </button>
    </form>
  );
}
```

### Using useFormStatus

```tsx
// app/ui/button.tsx
"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} type="submit">
      {pending ? "Submitting..." : "Sign Up"}
    </button>
  );
}
```

```tsx
// app/ui/signup.tsx
import { SubmitButton } from "./button";
import { createUser } from "./actions";

export function Signup() {
  return (
    <form action={createUser}>
      <input name="email" />
      <SubmitButton />
    </form>
  );
}
```

## Object.fromEntries() for Multiple Fields

```typescript
// app/actions.ts
"use server";

export async function updateSettings(formData: FormData) {
  const data = Object.fromEntries(formData);
  // data will have all form fields
  // Note: includes extra $ACTION_ properties

  const { name, email, bio } = data;

  // Update settings
}
```

## Key Points

1. **No complex types** - Just return plain objects or redirect
2. **FormData is automatic** - No need to type it explicitly
3. **useActionState** - For errors and pending states
4. **Redirect** - Use `redirect()` for navigation
5. **Zod** - Recommended for validation
6. **Keep it simple** - Don't over-engineer

## Real Example from Pucked

```typescript
// app/actions.ts
"use server";

import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { getInvitationByCode, isInvitationValid, useInvitation } from "@/lib/invitation";
import { acceptInvitationForUser } from "@/lib/users";

export async function submitInvitation(formData: FormData) {
  const rawCode = formData.get("code");
  const code = typeof rawCode === "string" ? rawCode.trim() : "";

  const { user } = await getCurrentSession();

  if (!user) {
    redirect("/login");
  }

  if (!code) {
    return { error: "Invitation code is required" };
  }

  const invitation = await getInvitationByCode(code);
  if (!invitation || !isInvitationValid(invitation)) {
    return { error: "Invalid or expired invitation code" };
  }

  await useInvitation(code, user.id);
  await acceptInvitationForUser(user.id);

  redirect("/admin");
}
```

```tsx
// app/[locale]/signup/page.tsx
"use client";

import { useActionState } from "react";
import { submitInvitation } from "@/app/actions";

const initialState = {
  error: "",
};

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(
    submitInvitation,
    initialState
  );

  return (
    <>
      <h1>Enter Invitation Code</h1>
      <form action={formAction}>
        <div>
          <label htmlFor="code">Invitation Code</label>
          <input
            type="text"
            id="code"
            name="code"
            placeholder="XXXX-XXXX-XXXX"
            maxLength={14}
            disabled={isPending}
            required
          />
        </div>
        {state.error && <p style={{ color: "red" }}>{state.error}</p>}
        <button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </>
  );
}
```

## Resources

- [Next.js Forms Guide](https://nextjs.org/docs/app/guides/forms)
- [React useActionState](https://react.dev/reference/react/useActionState)
- [React useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [Zod Validation](https://zod.dev/)
