# Pucked Documentation

> **⚠️ Documentation Moved**: All project documentation has been moved to the admin area at `/admin/docs`. This file is kept for historical reference only.

## 📚 New Documentation Location

All development documentation is now available in the admin dashboard at **`/admin/docs`**.

### Accessing Documentation

1. Start the development server: `pnpm dev`
2. Visit `http://localhost:3000/login`
3. Login with GitHub (requires invitation code)
4. Navigate to `/admin/docs`

### Available Documentation

The documentation is organized into two categories:

#### Development Docs
- **[Getting Started](/admin/docs/dev/getting-started)** - Project setup and overview
- **[Authentication](/admin/docs/dev/authentication)** - GitHub OAuth and invitation system
- **[API Reference](/admin/docs/dev/api-reference)** - Core APIs and utilities
- **[Puck Components](/admin/docs/dev/puck-components)** - Admin component library guide
- **[UI Guidelines](/admin/docs/dev/ui-guidelines)** - Design system and styling conventions
- **[Server Actions](/admin/docs/dev/server-actions)** - Form handling patterns
- **[Database Setup](/admin/docs/dev/database-setup)** - Turso and Drizzle ORM guide

#### User Docs
- **[Overview](/admin/docs/user/overview)** - Application overview for users
- **[Features](/admin/docs/user/features)** - Feature documentation
- **[FAQ](/admin/docs/user/faq)** - Frequently asked questions

## 🎯 Quick Start

**New to the project?** Start here:
1. Read [Getting Started](/admin/docs/dev/getting-started) for project setup
2. Check [UI Guidelines](/admin/docs/dev/ui-guidelines) to understand the design system
3. Review [Authentication](/admin/docs/dev/authentication) for auth system overview

**Building a feature?**
- Admin pages → Use [Puck Components](/admin/docs/dev/puck-components)
- Public pages → Use Shadcn UI (see [UI Guidelines](/admin/docs/dev/ui-guidelines))
- Forms → Follow [Server Actions](/admin/docs/dev/server-actions) patterns
- Database changes → See [Database Setup](/admin/docs/dev/database-setup)

## 📝 Key Concepts

### Dual Design System
The application uses two component libraries:
- **Admin Area** (`/admin/*`): `@measured/puck` components
- **Public Area** (`/app/[locale]/*`): Shadcn UI components

See [UI Guidelines](/admin/docs/dev/ui-guidelines) for details.

### Invitation-Based Authentication
Users must have a valid invitation code to sign up. This is enforced via GitHub OAuth.
See [Authentication](/admin/docs/dev/authentication) for the complete flow.

### Server Actions with React 19
All forms use `useActionState` hook (NOT `useFormState`) for state management.
See [Server Actions](/admin/docs/dev/server-actions) for patterns.

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **UI**: React 19.2.3
- **Admin Components**: `@measured/puck` v0.20.2
- **Public Components**: Shadcn UI
- **Styling**: Tailwind CSS v4
- **Database**: Turso (libSQL/SQLite) with Drizzle ORM
- **Authentication**: Arctic (GitHub OAuth)
- **i18n**: next-intl (public routes only)

## 📄 Additional Resources

- **[CLAUDE.md](../CLAUDE.md)** - Project overview and AI assistant instructions
- **[README.md](../README.md)** - Project overview and setup instructions

---

**Last Updated**: December 27, 2025
