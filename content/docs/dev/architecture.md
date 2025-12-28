---
title: Architecture Overview
description: High-level architecture overview of the Pucked application, including system design, data flow, and technology choices.
order: 11
category: Development
tags:
  - architecture
  - system-design
  - overview
  - technology
lastModified: 2025-12-27
author: Pucked Team
---

# Architecture Overview

High-level architecture overview of the Pucked application.

## System Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Browser (Next.js 16 + React 19)                            │
│  - Admin Dashboard (Puck Components)                        │
│  - Public Pages (Shadcn UI)                                 │
│  - Server Actions (useActionState)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router                                         │
│  - API Routes (/api/*)                                      │
│  - Server Actions (app/actions.ts)                          │
│  - Route Handlers (app/*/route.ts)                          │
│  - Middleware (proxy.ts - i18n)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Business Logic                                             │
│  - Authentication (lib/oauth.ts, lib/session.ts)            │
│  - User Management (lib/users.ts)                           │
│  - Invitation System (lib/invitation.ts)                    │
│  - Page Management (lib/page.ts, lib/page-tree.ts)          │
│  - Image Upload (lib/cloudinary.ts)                         │
│  - Notifications (lib/notifications.ts)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Database (Turso/libSQL)                                    │
│  - Drizzle ORM (lib/db.ts)                                  │
│  - Schema (db/schema.ts)                                    │
│  - Migrations (migrations/*)                                │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
├─────────────────────────────────────────────────────────────┤
│  - GitHub OAuth (Arctic)                                    │
│  - Cloudinary (Image Storage)                               │
│  - Oslo (Crypto for sessions)                               │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | Latest | Type safety |
| **Tailwind CSS** | v4 | Styling |
| **Puck** | 0.20.2 | Page builder (admin) |
| **Shadcn UI** | Latest | Component library (public) |
| **next-intl** | Latest | Internationalization |
| **TipTap** | Latest | Rich text editor |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 16.1.1 | Server-side endpoints |
| **Server Actions** | Latest | Form handling |
| **Drizzle ORM** | Latest | Database queries |
| **Turso** | Latest | Database (libSQL) |
| **Arctic** | Latest | OAuth client |
| **Oslo** | Latest | Crypto utilities |

### Infrastructure

| Service | Purpose |
|---------|---------|
| **Turso** | Edge database |
| **Cloudinary** | Image storage |
| **GitHub** | OAuth provider |

## Application Structure

### Directory Layout

```
pucked/
├── app/                      # Next.js App Router
│   ├── actions.ts           # Server actions
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Root page (redirect)
│   ├── [locale]/            # Internationalized routes
│   │   ├── layout.tsx       # Locale layout
│   │   ├── page.tsx         # Home page
│   │   ├── [...path]/       # Puck pages
│   │   ├── login/           # Login page
│   │   └── invitation/      # Invitation page
│   ├── admin/               # Admin dashboard
│   │   ├── layout.tsx       # Admin layout
│   │   ├── (dashboard)/     # Dashboard routes
│   │   ├── docs/            # Documentation
│   │   └── pages/           # Page management
│   └── api/                 # API routes
│       ├── login/           # OAuth endpoints
│       └── upload/          # Image upload
├── components/              # React components
│   ├── admin/               # Admin components
│   ├── ui/                  # Shadcn UI components
│   ├── guest-*.tsx          # Guest components
│   └── *.tsx                # Shared components
├── lib/                     # Utilities and services
│   ├── db.ts                # Database client
│   ├── oauth.ts             # OAuth client
│   ├── session.ts           # Session management
│   ├── users.ts             # User operations
│   ├── invitation.ts        # Invitation logic
│   └── ...                  # Other utilities
├── db/                      # Database
│   ├── schema.ts            # Drizzle schema
│   └── index.ts             # Database exports
├── content/docs/            # Documentation
│   ├── dev/                 # Developer docs
│   └── user/                # User docs
├── migrations/              # Database migrations
├── public/                  # Static assets
└── types/                   # TypeScript types
```

## Key Architectural Patterns

### 1. Dual Design System

**Admin Area** (`/admin/*`):
- Uses `@measured/puck` components
- Consistent with page editor
- No i18n (English-only)

**Public Area** (`/app/[locale]/*`):
- Uses Shadcn UI components
- Full i18n support (English/Farsi)
- RTL support for Farsi

### 2. Server-Side Rendering

**Next.js App Router**:
- Server Components by default
- Client Components for interactivity
- Server Actions for form handling
- Streaming for performance

### 3. Authentication Flow

**Invitation-Based OAuth**:
1. User initiates GitHub OAuth
2. GitHub redirects back with code
3. Server creates/updates user
4. Server creates session
5. If invitation not accepted → redirect to `/signup`
6. User submits invitation code
7. User granted access

### 4. Internationalization

**Partial i18n**:
- Public routes: Full i18n (`/en/*`, `/fa/*`)
- Admin routes: English-only (`/admin/*`)
- API routes: No i18n (`/api/*`)

**Implementation**:
- `next-intl` for translations
- Middleware for locale detection
- Separate layouts for i18n/non-i18n

### 5. Page Builder Architecture

**Dual-Layout System**:
- **Guest Pages**: Full layout with navbar/footer
- **Editor Preview**: Full layout with preview components
- **Puck Config**: `root.render` function handles both modes

**Why Two Layouts?**
- Guest components use `next-intl` hooks (require provider)
- Editor runs at `/admin/*` (no provider)
- Solution: Separate preview components for editor

## Data Flow

### Authentication Flow

```
User clicks "Login with GitHub"
    ↓
GET /api/login/github
    ↓
Redirect to GitHub
    ↓
User authorizes
    ↓
GitHub redirects to /api/login/github/callback
    ↓
Server validates state
    ↓
Server exchanges code for access token
    ↓
Server fetches user profile
    ↓
Server creates/updates user in database
    ↓
Server creates session
    ↓
Server sets session cookie
    ↓
Redirect to /signup or /admin
```

### Page Rendering Flow

```
User visits /en/about
    ↓
Next.js matches route to app/[locale]/[...path]/page.tsx
    ↓
Server Component fetches page data from database
    ↓
Server Component loads Puck config
    ↓
Dynamic import loads components/puck-render.tsx (Client Component)
    ↓
Client Component renders with @measured/puck's Render component
    ↓
Next.js layout (locale-layout-client.tsx) wraps with navbar/footer
    ↓
Puck config's root.render returns just children (no wrapper)
    ↓
Final HTML sent to browser
```

### Image Upload Flow

```
User drags image to ImageField
    ↓
ImageField validates file (type, size)
    ↓
FormData sent to POST /api/upload
    ↓
Server validates authentication (requireAuth)
    ↓
Server uploads to Cloudinary
    ↓
Cloudinary returns URL and metadata
    ↓
Server returns response to client
    ↓
ImageField updates component data
    ↓
ImageBlock renders preview
```

## Security Architecture

### Authentication

**GitHub OAuth**:
- Arctic library for OAuth client
- State parameter for CSRF protection
- HttpOnly cookies for session tokens
- SHA256 hashing for session IDs

**Session Management**:
- Oslo crypto for token generation
- Base32 encoded tokens (20 random bytes)
- Auto-extension within 45 minutes of expiration
- Secure cookie flags (HttpOnly, Secure, SameSite)

### Authorization

**Route Protection**:
- `requireAuth()` for server routes
- `AuthGuard` component for client routes
- Invitation check for new users
- Role-based access (planned)

### Data Validation

**Server Actions**:
- Input validation on all actions
- Type checking for form data
- File validation (type, size)
- SQL injection prevention (Drizzle ORM)

## Performance Optimization

### Database

**Turso/libSQL**:
- Edge-optimized database
- Automatic connection pooling
- Query optimization via Drizzle
- Migration-based schema management

### Frontend

**Next.js**:
- Server Components by default
- Code splitting via dynamic imports
- Image optimization
- Font optimization
- Streaming for progressive rendering

### Caching

**Planned**:
- Edge caching (Cloudflare Workers)
- Image CDN (Cloudinary)
- Database query caching
- HTTP caching headers

## Scalability Considerations

### Current Limitations

1. **Single Database**: Turso limitations
2. **No Horizontal Scaling**: Single server
3. **No Caching**: Every request hits database
4. **No CDN**: Static files served from server

### Future Improvements

1. **Multi-Region Deployment**: Edge functions
2. **Database Replication**: Read replicas
3. **Caching Layer**: Redis or similar
4. **CDN**: Cloudflare or Vercel
5. **Load Balancing**: Multiple server instances

## Monitoring & Observability

### Planned

1. **Error Tracking**: Sentry integration
2. **Performance Monitoring**: New Relic or similar
3. **Logging**: Structured logging
4. **Analytics**: User behavior tracking
5. **Uptime Monitoring**: Ping services

## Deployment Architecture

### Development

```
Local Machine
    ↓
pnpm dev
    ↓
Next.js Dev Server (localhost:3000)
    ↓
Turso Database (remote)
```

### Production (Planned)

```
User
    ↓
CDN (Cloudflare)
    ↓
Edge Functions (Vercel/Cloudflare Workers)
    ↓
Application Server
    ↓
Turso Database (multi-region)
    ↓
Cloudinary (images)
```

## Technology Choices

### Why Next.js 16?

- ✅ Latest App Router features
- ✅ Server Actions for forms
- ✅ Built-in optimization
- ✅ Great developer experience
- ✅ Strong community

### Why Turso?

- ✅ Edge-optimized
- ✅ SQLite-compatible
- ✅ Free tier available
- ✅ Low latency
- ✅ Easy migrations

### Why Puck?

- ✅ Visual page builder
- ✅ React-based
- ✅ Custom components
- ✅ Good documentation
- ✅ Active development

### Why Drizzle ORM?

- ✅ Type-safe queries
- ✅ Great TypeScript support
- ✅ Auto-generated migrations
- ✅ Lightweight
- ✅ SQL-like syntax

### Why Arctic + Oslo?

- ✅ Modern OAuth libraries
- ✅ Type-safe
- ✅ Secure crypto
- ✅ Framework-agnostic
- ✅ Well-maintained

## Related Documentation

- [Getting Started](./getting-started.md) - Project setup
- [Database Setup](./database-setup.md) - Database architecture
- [Authentication System](./authentication.md) - Auth flow details
- [API Reference](./api-reference.md) - API endpoints
- [UI Guidelines](./ui-guidelines.md) - Design system
