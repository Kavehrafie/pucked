---
title: API Reference
description: Complete API reference for the Pucked application, including routes, server actions, and utilities.
order: 3
category: Development
tags:
  - api
  - reference
  - routes
  - server-actions
lastModified: 2025-12-27
author: Pucked Team
---

# API Reference

This document provides a comprehensive reference for all API routes, server actions, and utility functions in the Pucked application.

## Authentication API

### GitHub OAuth Endpoints

#### Initiate OAuth

**Endpoint**: `GET /api/login/github`

Initiates the GitHub OAuth flow.

**Response**: Redirects to GitHub authorization page

**Example**:
```typescript
// Client-side usage
const login = () => {
  window.location.href = '/api/login/github';
};
```

#### OAuth Callback

**Endpoint**: `GET /api/login/github/callback`

Handles the OAuth callback from GitHub.

**Query Parameters**:
- `code` (string): Authorization code from GitHub
- `state` (string): State parameter for CSRF protection

**Response**: Redirects to `/signup` or `/admin`

**Flow**:
1. Validates state parameter
2. Exchanges code for access token
3. Fetches user profile from GitHub
4. Creates or updates user in database
5. Creates session
6. Sets session cookie
7. Redirects based on invitation status

## Server Actions

Server actions are defined in `app/actions.ts` and use React 19's `useActionState` hook.

### Authentication Actions

#### `loginWithGitHub`

Initiates GitHub OAuth login from a server action.

**Returns**: Never (redirects)

**Example**:
```typescript
"use client";
import { useActionState } from "react";
import { loginWithGitHub } from "@/app/actions";

function LoginForm() {
  const [, formAction] = useActionState(loginWithGitHub, null);
  
  return <form action={formAction}>...</form>;
}
```

#### `submitInvitation`

Validates and submits an invitation code.

**Parameters**:
- `code` (string): Invitation code from form data

**Returns**:
```typescript
type FormState = {
  errors?: {
    code?: string[]
    _form?: string[]
  }
  success?: boolean
}
```

**Example**:
```typescript
"use client";
import { useActionState } from "react";
import { submitInvitation } from "@/app/actions";

function InvitationForm() {
  const [state, formAction] = useActionState(submitInvitation, initialState);
  
  return (
    <form action={formAction}>
      <input name="code" type="text" />
      {state.errors?.code && (
        <p>{state.errors.code[0]}</p>
      )}
    </form>
  );
}
```

#### `logout`

Logs out the current user and destroys the session.

**Returns**: Never (redirects to `/login`)

**Example**:
```typescript
"use client";
import { useActionState } from "react";
import { logout } from "@/app/actions";

function LogoutButton() {
  const [, formAction] = useActionState(logout, null);
  
  return (
    <form action={formAction}>
      <button type="submit">Logout</button>
    </form>
  );
}
```

#### `checkInvitationStatus`

Checks if the current user has accepted an invitation.

**Returns**:
```typescript
type InvitationStatus = {
  hasInvitation: boolean
  invitationAcceptedAt: Date | null
}
```

### Page Actions

#### `createPageAction`

Creates a new page in the database.

**Parameters**:
- `title` (string): Page title
- `slug` (string): URL slug
- `parentId` (string | null): Parent page ID
- `locale` (string): Locale (en or fa)

**Returns**:
```typescript
type PageState = {
  errors?: {
    title?: string[]
    slug?: string[]
    _form?: string[]
  }
  success?: boolean
  page?: Page
}
```

**Example**:
```typescript
"use client";
import { useActionState } from "react";
import { createPageAction } from "@/app/actions";

function CreatePageForm() {
  const [state, formAction] = useActionState(createPageAction, initialState);
  
  return (
    <form action={formAction}>
      <input name="title" type="text" />
      <input name="slug" type="text" />
      <input name="locale" type="text" defaultValue="en" />
      <button type="submit">Create Page</button>
    </form>
  );
}
```

#### `updatePageAction`

Updates an existing page.

**Parameters**:
- `id` (string): Page ID
- `title` (string): New title
- `slug` (string): New slug
- `content` (object): Puck page content

**Returns**: Same as `createPageAction`

#### `deletePageAction`

Deletes a page and its translations.

**Parameters**:
- `id` (string): Page ID

**Returns**:
```typescript
type DeleteState = {
  errors?: {
    _form?: string[]
  }
  success?: boolean
}
```

## Utility Functions

### Session Management (`lib/session.ts`)

#### `generateSessionToken()`

Generates a secure random session token.

**Returns**: Base32 encoded token (20 random bytes)

**Example**:
```typescript
import { generateSessionToken } from "@/lib/session";

const token = generateSessionToken();
// "abc123def456..."
```

#### `createSession(token, userId)`

Creates a new session in the database.

**Parameters**:
- `token` (string): Session token
- `userId` (string): User ID

**Returns**: Session object

**Example**:
```typescript
const session = await createSession(token, userId);
// { id, userId, expiresAt, ... }
```

#### `validateSession(token)`

Validates a session token and returns the session with user data.

**Parameters**:
- `token` (string): Session token to validate

**Returns**: Session with user or null

**Example**:
```typescript
const session = await validateSession(token);
if (session) {
  console.log("User:", session.user);
}
```

#### `getCurrentSession()`

Gets the current session from the request cookies.

**Returns**: Session with user or null

**Example**:
```typescript
import { getCurrentSession } from "@/lib/session";

const session = await getCurrentSession();
if (session) {
  // User is authenticated
}
```

#### `invalidateSession(sessionId)`

Invalidates a session by ID.

**Parameters**:
- `sessionId` (string): Session ID to invalidate

**Returns**: void

### User Management (`lib/users.ts`)

#### `createUser(githubUser)`

Creates a new user from GitHub profile data.

**Parameters**:
- `githubUser` (object): GitHub user profile
  - `id` (number): GitHub user ID
  - `login` (string): GitHub username
  - `email` (string | null): GitHub email
  - `avatar_url` (string): Profile picture URL

**Returns**: Created user object

**Example**:
```typescript
import { createUser } from "@/lib/users";

const githubUser = {
  id: 123456,
  login: "username",
  email: "user@example.com",
  avatar_url: "https://avatars.githubusercontent.com/u/123456"
};

const user = await createUser(githubUser);
```

#### `getUserByGitHubId(githubId)`

Retrieves a user by their GitHub ID.

**Parameters**:
- `githubId` (number): GitHub user ID

**Returns**: User object or null

#### `getUserById(id)`

Retrieves a user by their database ID.

**Parameters**:
- `id` (string): User ID

**Returns**: User object or null

#### `updateUser(id, data)`

Updates user information.

**Parameters**:
- `id` (string): User ID
- `data` (object): Fields to update

**Returns**: Updated user object

### Invitation Management (`lib/invitation.ts`)

#### `generateInvitationCode()`

Generates a unique 12-character invitation code.

**Returns**: Invitation code string

**Example**:
```typescript
import { generateInvitationCode } from "@/lib/invitation";

const code = generateInvitationCode();
// "ABC123XYZ456"
```

#### `createInvitation(data)`

Creates a new invitation in the database.

**Parameters**:
- `data` (object):
  - `code` (string): Invitation code
  - `createdBy` (string): Creator user ID
  - `expiresAt` (Date): Expiration date

**Returns**: Created invitation object

**Example**:
```typescript
const invitation = await createInvitation({
  code: "ABC123XYZ456",
  createdBy: userId,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});
```

#### `validateInvitation(code)`

Validates an invitation code.

**Parameters**:
- `code` (string): Invitation code to validate

**Returns**: Invitation object if valid, null otherwise

**Validation Rules**:
- Code must exist
- Must not be expired
- Must not already be used

**Example**:
```typescript
const invitation = await validateInvitation("ABC123XYZ456");
if (invitation) {
  // Valid invitation
} else {
  // Invalid or expired
}
```

#### `useInvitation(invitationId, userId)`

Marks an invitation as used.

**Parameters**:
- `invitationId` (string): Invitation ID
- `userId` (string): User who used the invitation

**Returns**: Updated invitation object

### Route Protection (`lib/route-guard.ts`)

#### `requireAuth(options?)`

Protects server routes and actions. Redirects if not authenticated.

**Parameters**:
- `options` (object):
  - `requireInvitation` (boolean): Whether to require accepted invitation

**Returns**:
```typescript
type AuthResult = {
  user: User
  session: Session
}
```

**Redirects**:
- Not authenticated → `/login`
- Not invited → `/signup`

**Example**:
```typescript
import { requireAuth } from "@/lib/route-guard";

export default async function ProtectedPage() {
  const { user, session } = await requireAuth({ requireInvitation: true });
  
  return <div>Welcome {user.username}</div>;
}
```

## Database Schema

### Users Table

```typescript
{
  id: string           // Primary key
  githubId: number     // GitHub user ID (unique)
  username: string     // GitHub username
  email: string | null // GitHub email
  avatar: string | null // Profile picture URL
  invitationAcceptedAt: Date | null // When invitation was accepted
  createdAt: Date      // Account creation date
}
```

### Sessions Table

```typescript
{
  id: string           // Primary key (SHA256 hash of token)
  userId: string       // Foreign key to users
  expiresAt: Date      // Session expiration
  createdAt: Date      // Session creation date
}
```

### Invitations Table

```typescript
{
  id: string           // Primary key
  code: string         // 12-character code (unique)
  createdBy: string    // Foreign key to users
  usedBy: string | null // Foreign key to users (null if unused)
  usedAt: Date | null  // When invitation was used
  expiresAt: Date      // Invitation expiration
  createdAt: Date      // Invitation creation date
}
```

### Pages Table

```typescript
{
  id: string           // Primary key
  title: string        // Page title
  slug: string         // URL slug
  parentId: string | null // Parent page ID
  locale: string       // 'en' or 'fa'
  puckData: object     // Puck page content
  createdAt: Date      // Page creation date
  updatedAt: Date      // Last update date
}
```

## Error Handling

### Standard Error Response

```typescript
type ErrorResponse = {
  errors: {
    field?: string[]
    _form?: string[]
  }
}
```

### Common Errors

| Error | Description | Solution |
|-------|-------------|----------|
| Invalid session | Session token is invalid or expired | User must log in again |
| Invalid invitation | Invitation code is invalid or expired | Generate new invitation |
| Duplicate slug | Page slug already exists | Use a different slug |
| Unauthorized | User lacks permission | Check user permissions |

## Rate Limiting

API routes are rate-limited to prevent abuse:

- **Login endpoint**: 5 requests per minute per IP
- **API routes**: 100 requests per minute per user

## CORS

API routes support CORS for authorized origins.

## Webhooks

Coming soon...

## Changelog

### v1.0.0 (2025-12-27)

- Initial API documentation
- Authentication endpoints
- Server actions reference
- Utility functions reference

## See Also

- [Authentication Guide](/docs/dev/authentication)
- [Server Actions Guide](/docs/dev/server-actions)
- [Database Schema](/docs/dev/database)
