---
title: Authentication System
description: Complete guide to the invitation-based GitHub OAuth authentication system in Pucked.
order: 2
category: Development
tags:
  - authentication
  - oauth
  - security
  - github
lastModified: 2025-12-27
author: Pucked Team
---

# Authentication System

Pucked uses an **invitation-based GitHub OAuth authentication system**. This ensures that only authorized users can access the application while providing a seamless login experience.

## Architecture Overview

The authentication system consists of several key components:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   OAuth     │────▶│   Session   │
│   OAuth     │     │   Callback  │     │   Creation  │
└─────────────┘     └─────────────┘     └─────────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │ Invitation  │
                                         │   Check     │
                                         └─────────────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │   Access    │
                                         │  Granted    │
                                         └─────────────┘
```

## Key Components

### 1. OAuth Client (`lib/oauth.ts`)

Uses **Arctic** library to create a GitHub OAuth client:

```typescript
import { GitHub } from "arctic";

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  process.env.GITHUB_CLIENT_REDIRECT_URI!
);
```

### 2. Session Management (`lib/session.ts`)

Uses **Oslo** crypto library for secure session handling:

- **Token Generation**: Base32 encoded, 20 random bytes
- **Token Storage**: SHA256 hash (not stored directly)
- **Auto-Extension**: Sessions extend if within 45 minutes of expiration
- **HttpOnly Cookies**: Prevent XSS attacks

```typescript
const token = generateRandomToken();
const sessionId = encodeBase64LowerCase(sha256(token));
```

### 3. User Management (`lib/users.ts`)

CRUD operations for user data:

- `createUser()` - Create new user from GitHub profile
- `getUserById()` - Retrieve user by database ID
- `getUserByGitHubId()` - Retrieve user by GitHub ID
- `updateUser()` - Update user information

### 4. Invitation System (`lib/invitation.ts`)

Manages invitation codes:

- `generateInvitationCode()` - Generate unique 12-character code
- `createInvitation()` - Create invitation in database
- `validateInvitation()` - Check if code is valid and unused
- `useInvitation()` - Mark invitation as used

### 5. Route Protection (`lib/route-guard.ts`)

Protects server routes and actions:

```typescript
export async function requireAuth(options?: { requireInvitation?: boolean }) {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }
  
  if (options?.requireInvitation && !session.user.invitationAcceptedAt) {
    redirect("/signup");
  }
  
  return { user: session.user };
}
```

## Authentication Flow

### Step 1: Initiate OAuth

**Route**: `GET /api/login/github`

```typescript
export async function GET() {
  const state = generateRandomState();
  const url = github.createAuthorizationURL(state, ["user:email"]);
  
  cookies().set("github_oauth_state", state, {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
  });
  
  return Response.redirect(url);
}
```

### Step 2: OAuth Callback

**Route**: `GET /api/login/github/callback`

```typescript
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  
  // Validate state
  const storedState = cookies().get("github_oauth_state")?.value;
  if (!state || !storedState || state !== storedState) {
    return new Response("Invalid state", { status: 400 });
  }
  
  // Exchange code for tokens
  const tokens = await github.validateAuthorizationCode(code);
  const githubUser = await fetchGitHubUser(tokens.accessToken());
  
  // Create or update user
  const existingUser = await getUserByGitHubId(githubUser.id);
  const user = existingUser || await createUser(githubUser);
  
  // Create session
  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);
  
  // Set session cookie
  cookies().set("session", sessionToken, {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: session.expiresAt,
  });
  
  // Check if user needs to accept invitation
  if (!user.invitationAcceptedAt) {
    return Response.redirect(new URL("/signup", request.url));
  }
  
  return Response.redirect(new URL("/admin", request.url));
}
```

### Step 3: Invitation Submission

**Action**: `submitInvitation` in `app/actions.ts`

```typescript
export async function submitInvitation(prevState: FormState, formData: FormData) {
  const { user } = await requireAuth();
  
  const code = formData.get("code");
  if (!code || typeof code !== "string") {
    return { errors: { code: ["Invitation code is required"] } };
  }
  
  // Validate invitation
  const invitation = await validateInvitation(code);
  if (!invitation) {
    return { errors: { code: ["Invalid or expired invitation code"] } };
  }
  
  // Mark invitation as used
  await useInvitation(invitation.id, user.id);
  
  // Accept user invitation
  await acceptUserInvitation(user.id);
  
  redirect("/admin");
}
```

## Protecting Routes

### Server Components

```typescript
import { requireAuth } from "@/lib/route-guard";

export default async function ProtectedPage() {
  const { user } = await requireAuth({ requireInvitation: true });
  return <div>Welcome {user.username}</div>;
}
```

### Server Actions

```typescript
"use server";
import { requireAuth } from "@/lib/route-guard";

export async function protectedAction() {
  const { user } = await requireAuth();
  // Perform action with authenticated user
}
```

### Client Components

Use the `AuthGuard` wrapper:

```typescript
import { AuthGuard } from "@/components/auth-guard";

export function ProtectedComponent() {
  return (
    <AuthGuard requireInvitation>
      <YourContent />
    </AuthGuard>
  );
}
```

## Security Features

1. **State Parameter**: Prevents CSRF attacks
2. **HttpOnly Cookies**: Prevents XSS attacks on session tokens
3. **SHA256 Hashing**: Session IDs are hashed, not stored directly
4. **Secure Tokens**: Base32 encoded with 20 random bytes
5. **Invitation System**: Only authorized users can access
6. **Auto-Expiration**: Sessions expire after 30 days

## User States

| State | Description | Redirect |
|-------|-------------|----------|
| Not authenticated | No valid session | `/login` |
| Authenticated, no invitation | User created but hasn't entered code | `/signup` |
| Authenticated with invitation | User has entered valid code | `/admin` |

## Creating Invitations

### Command Line

```bash
pnpm create-invitation
```

### Programmatic

```typescript
import { createInvitation } from "@/lib/invitation";

const invitation = await createInvitation({
  createdBy: "admin-user-id",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
});
```

## Testing Authentication

1. **Create an invitation**:
   ```bash
   pnpm create-invitation
   ```

2. **Visit login page**:
   ```
   http://localhost:3000/login
   ```

3. **Complete GitHub OAuth**:
   - Click "Login with GitHub"
   - Authorize the application

4. **Enter invitation code**:
   - You'll be redirected to `/signup`
   - Enter the invitation code
   - Submit the form

5. **Access admin dashboard**:
   ```
   http://localhost:3000/admin
   ```

## Troubleshooting

### "Invalid state" error

- Ensure cookies are enabled in your browser
- Check that `GITHUB_CLIENT_REDIRECT_URI` matches your callback URL

### "Invalid or expired invitation code"

- Verify the code was created correctly
- Check the expiration date in the database
- Ensure the code hasn't been used already

### Session not persisting

- Check that cookies are being set correctly
- Verify the `session` cookie is HttpOnly and Secure
- Ensure the session hasn't expired

## Related Documentation

- [Server Actions Guide](/docs/dev/server-actions)
- [Getting Started](/docs/dev/getting-started)
- [UI Guidelines](/docs/dev/ui-guidelines)
