---
title: Getting Started with Development
description: A comprehensive guide to setting up your development environment and contributing to the Pucked project.
order: 1
category: Development
tags:
  - setup
  - development
  - contributing
lastModified: 2025-12-27
author: Pucked Team
---

# Getting Started with Development

Welcome to the Pucked development guide! This documentation will help you set up your development environment and understand the project structure.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** 18.x or higher
- **pnpm** 10.x or higher (recommended package manager)
- **Git** for version control
- **Turso account** for the database (libSQL/SQLite)

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/pucked.git
cd pucked
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CLIENT_REDIRECT_URI=http://localhost:3000/api/login/github/callback
```

4. **Set up the database**

```bash
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Apply migrations
pnpm db:studio    # Optional: Open Drizzle Studio
```

5. **Seed initial data**

```bash
pnpm create-invitation  # Create an invitation code
pnpm seed-site-settings # Seed site settings
```

## Running the Development Server

Start the development server:

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
pucked/
├── app/              # Next.js app directory
│   ├── [locale]/    # Internationalized routes
│   ├── admin/       # Admin dashboard (no i18n)
│   └── api/         # API routes
├── components/      # React components
│   ├── admin/       # Admin components (Puck)
│   ├── ui/          # Shadcn UI components
│   └── markdown/    # Markdown rendering components
├── lib/             # Utility libraries
├── db/              # Database schema
├── docs/            # Project documentation
├── content/         # Markdown content for docs
└── messages/        # i18n message files
```

## Key Technologies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Turso** - Edge database (libSQL/SQLite)
- **Drizzle ORM** - Database ORM
- **Arctic** - OAuth library
- **next-intl** - Internationalization
- **@measured/puck** - Visual page builder
- **Shadcn UI** - Component library
- **Tailwind CSS v4** - Styling

## Development Workflow

### Creating a New Feature

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test them

3. Run linting:
```bash
pnpm lint
```

4. Commit your changes:
```bash
git commit -m "feat: add your feature description"
```

5. Push and create a pull request

### Database Changes

When modifying the database schema in `db/schema.ts`:

```bash
pnpm db:generate  # Generate migration
pnpm db:migrate   # Apply migration
```

### Adding New Documentation

1. Create a new markdown file in `content/docs/dev/` or `content/docs/user/`
2. Add frontmatter with metadata
3. The documentation will be automatically available

## Code Style

- Use **TypeScript** with strict mode enabled
- Follow the **dual design system** pattern:
  - Admin area → Use `@measured/puck` components
  - Public area → Use Shadcn UI components
- Always use **Tailwind CSS** for styling (no inline styles)
- Add **dark mode** support for all custom styles
- Use **semantic color tokens** from the design system

## Testing Authentication

1. Create an invitation code:
```bash
pnpm create-invitation
```

2. Visit `/login` (redirects to `/en/login`)

3. Click "Login with GitHub"

4. Complete GitHub OAuth flow

5. Enter the invitation code on `/signup`

6. Access the admin dashboard at `/admin`

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate database migrations |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm create-invitation` | Create invitation code |

## Getting Help

- Check the [UI Guidelines](/docs/dev/ui-guidelines) for design patterns
- Read the [Authentication Guide](/docs/dev/authentication) for auth flow details
- See [Server Actions Guide](/docs/dev/server-actions) for form handling patterns

## Next Steps

- Explore the [Component Library](/docs/dev/components)
- Learn about [Page Builder](/docs/dev/page-builder)
- Understand [Internationalization](/docs/dev/i18n)
