# Server Actions - Real Examples from Pucked

This file contains the actual server actions used in the Pucked project with explanations.

## File: `/app/actions.ts`

### Example 1: Logout Action (Void Return with Redirect)

```typescript
/**
 * Logs out the current user and redirects to login
 * @throws Will redirect to /login
 */
export async function logout(): Promise<void> {
  const { session } = await getCurrentSession();
  
  if (!session) {
    redirect("/login");
  }

  await invalidateSession(session.id);
  await deleteSessionTokenCookie();
  redirect("/login");
}
```

**Key Points:**
- Return type is `Promise<void>` because it always redirects
- Early redirect if no session
- Cleans up session data before redirect
- Never returns data to the client

---

### Example 2: GitHub OAuth Login (Void Return with Redirect)

```typescript
/**
 * Initiates GitHub OAuth flow
 * @throws Will redirect to GitHub
 */
export async function loginWithGitHub(): Promise<void> {
  const state = generateState();
  const url = github.createAuthorizationURL(state, []);

  const cookieStore = await cookies();
  cookieStore.set("github_oauth_state", state, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax"
  });

  redirect(url.toString());
}
```

**Key Points:**
- Sets OAuth state cookie for CSRF protection
- Uses environment-based security flags
- Always redirects to GitHub
- No return value needed

---

### Example 3: Submit Invitation (Void Return with Validation & Redirect)

```typescript
/**
 * Submits an invitation code and accepts it for the current user
 * @param formData - Form data containing the invitation code
 * @returns FormActionResult with error if validation fails
 * @throws Will redirect to /admin on success
 */
export async function submitInvitation(formData: FormData): Promise<void> {
  // Step 1: Validate and extract code from FormData
  const rawCode = formData.get("code");
  const code = typeof rawCode === "string" ? rawCode.trim() : "";

  // Step 2: Get current session
  const { user } = await getCurrentSession();
  if (!user) {
    redirect("/login");
  }

  // Step 3: Validate invitation code format
  if (!code) {
    redirect("/signup?error=code_required");
  }

  if (code.length !== 14 || !code.match(/^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/i)) {
    redirect("/signup?error=invalid_format");
  }

  // Step 4: Validate invitation exists
  const invitation = await getInvitationByCode(code);
  if (!invitation) {
    redirect("/signup?error=code_not_found");
  }

  // Step 5: Validate invitation is valid (not expired, not used)
  if (!isInvitationValid(invitation)) {
    redirect("/signup?error=code_invalid_or_expired");
  }

  // Step 6: Process invitation
  try {
    await useInvitation(code, user.id);
    await acceptInvitationForUser(user.id);
    redirect("/admin");
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    redirect("/signup?error=server_error");
  }
}
```

**Key Points:**
- Type-safe FormData extraction
- Multiple validation layers
- User-friendly error messages via query params
- Try-catch for unexpected errors
- Always redirects (never returns data)

---

## Comparison: Different Approaches

### Approach 1: Return Error Object (Used in APIs)

```typescript
type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

export async function createInvitation(): Promise<ActionResult> {
  const { user } = await getCurrentSession();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  
  const code = generateInvitationCode();
  await db.createInvitation(code, user.id);
  
  return { success: true, data: { code } };
}
```

**When to use:**
- Client needs to display the result
- Client needs to use returned data
- Not redirecting after action

**Client usage:**
```tsx
const [state, formAction] = useActionState(createInvitation, null);

return (
  <form action={formAction}>
    {state?.success && <p>Code: {state.data.code}</p>}
    {state?.error && <p>Error: {state.error}</p>}
    <button>Create</button>
  </form>
);
```

---

### Approach 2: Redirect on Error (Used in Forms)

```typescript
export async function submitInvitation(formData: FormData): Promise<void> {
  const code = formData.get("code") as string;
  
  if (!code) {
    redirect("/signup?error=code_required");
  }
  
  await processInvitation(code);
  redirect("/admin");
}
```

**When to use:**
- Simple success/error flow
- Don't need to return data
- Want clean URL-based error handling

**Client usage:**
```tsx
export default function SignupPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  return (
    <form action={submitInvitation}>
      {error && <p>Error: {error}</p>}
      <input name="code" />
      <button>Submit</button>
    </form>
  );
}
```

---

### Approach 3: Mixed (Not Recommended)

```typescript
// ❌ AVOID: Mixed return types
export async function badAction(formData: FormData): Promise<ActionResult | void> {
  const code = formData.get("code") as string;
  
  if (!code) {
    return { error: "Code required" }; // Returns object
  }
  
  redirect("/success"); // Returns void (redirect)
}
```

**Why avoid:**
- Confusing return type
- Client doesn't know what to expect
- TypeScript can't properly type-check

---

## FormData Validation Patterns

### Pattern 1: Basic Validation

```typescript
export async function submitForm(formData: FormData): Promise<void> {
  const rawCode = formData.get("code");
  const code = typeof rawCode === "string" ? rawCode.trim() : "";
  
  if (!code) {
    redirect("/form?error=required");
  }
  
  // Process...
}
```

### Pattern 2: Format Validation

```typescript
export async function submitForm(formData: FormData): Promise<void> {
  const code = formData.get("code") as string;
  
  // Check format: XXXX-XXXX-XXXX
  if (!code.match(/^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/i)) {
    redirect("/form?error=invalid_format");
  }
  
  // Process...
}
```

### Pattern 3: Length Validation

```typescript
export async function submitForm(formData: FormData): Promise<void> {
  const name = formData.get("name") as string;
  
  if (name.length < 2) {
    redirect("/form?error=too_short");
  }
  
  if (name.length > 50) {
    redirect("/form?error=too_long");
  }
  
  // Process...
}
```

### Pattern 4: Multiple Fields

```typescript
export async function submitForm(formData: FormData): Promise<void> {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  
  if (!email || !name) {
    redirect("/form?error=required_fields");
  }
  
  if (!email.includes("@")) {
    redirect("/form?error=invalid_email");
  }
  
  // Process...
}
```

---

## Error Handling Patterns

### Pattern 1: Early Return

```typescript
export async function myAction(): Promise<ActionResult> {
  const { user } = await getCurrentSession();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  
  // Continue with user...
}
```

### Pattern 2: Try-Catch

```typescript
export async function myAction(): Promise<ActionResult> {
  try {
    const result = await riskyOperation();
    return { success: true, data: result };
  } catch (error) {
    console.error("Action failed:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
```

### Pattern 3: Redirect on Error

```typescript
export async function myAction(): Promise<void> {
  try {
    const result = await riskyOperation();
    redirect("/success");
  } catch (error) {
    console.error("Action failed:", error);
    redirect("/error?message=failed");
  }
}
```

---

## Authentication Patterns

### Pattern 1: Require Auth

```typescript
export async function protectedAction(): Promise<ActionResult> {
  const { user } = await getCurrentSession();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  
  // User is authenticated, continue...
  const result = await doWork(user.id);
  return { success: true, data: result };
}
```

### Pattern 2: Require Auth or Redirect

```typescript
export async function protectedAction(): Promise<void> {
  const { user } = await getCurrentSession();
  
  if (!user) {
    redirect("/login");
  }
  
  // User is authenticated, continue...
  await doWork(user.id);
  redirect("/dashboard");
}
```

### Pattern 3: Check Permissions

```typescript
export async function adminAction(): Promise<ActionResult> {
  const { user } = await getCurrentSession();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  
  if (!user.isAdmin) {
    return { success: false, error: "Forbidden: Admin only" };
  }
  
  // User is admin, continue...
  const result = await doAdminWork();
  return { success: true, data: result };
}
```

---

## Summary Table

| Pattern | Return Type | Use Case | Example |
|---------|-------------|----------|---------|
| **Data Return** | `Promise<ActionResult>` | API-like actions | `createInvitation()` |
| **Form with Error** | `Promise<FormActionResult>` | Form submissions | `submitForm()` |
| **Redirect Only** | `Promise<void>` | Navigation actions | `logout()`, `loginWithGitHub()` |
| **Redirect with Error** | `Promise<void>` | Form with URL errors | `submitInvitation()` |

---

## Key Takeaways

1. **Be Consistent**: Choose one pattern per action and stick to it
2. **Type Safe**: Always validate FormData before using
3. **Handle Errors**: Never silently swallow errors
4. **Document**: Add JSDoc comments for complex actions
5. **Test**: Test both success and error paths
6. **Log Errors**: Use console.error for debugging
7. **User Friendly**: Provide clear error messages
