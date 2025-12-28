---
title: Deployment Guide
description: Complete guide to deploying the Pucked application to production.
order: 12
category: Development
tags:
  - deployment
  - production
  - vercel
  - hosting
  - infrastructure
lastModified: 2025-12-27
author: Pucked Team
---

# Deployment Guide

Complete guide to deploying the Pucked application to production.

## Overview

This guide covers deploying the Pucked application to production using Vercel, the recommended hosting platform for Next.js applications.

**Prerequisites:**
- Node.js 18+ installed
- Git repository
- Vercel account
- Turso database
- Cloudinary account
- GitHub OAuth app

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set:

```bash
# Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CLIENT_REDIRECT_URI=https://yourdomain.com/api/login/github/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional
CLOUDINARY_UPLOAD_PRESET=your-preset-name
```

### 2. Database Setup

**Production Database:**

```bash
# Create production database
turso db create pucked-prod

# Get database URL
turso db list

# Create auth token
turso db tokens create pucked-prod

# Run migrations
pnpm db:migrate
```

### 3. GitHub OAuth App

**Production OAuth Settings:**

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth app or update existing
3. Set **Authorization callback URL**:
   ```
   https://yourdomain.com/api/login/github/callback
   ```
4. Copy **Client ID** and generate new **Client Secret**
5. Update environment variables

### 4. Cloudinary Settings

**Production Cloudinary:**

1. Ensure upload preset is configured
2. Set folder organization (e.g., `pucked-prod`)
3. Enable auto-optimization
4. Configure transformations

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended platform for deploying Next.js applications.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy Project

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Step 4: Configure Environment Variables

In Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add all environment variables from pre-deployment checklist
3. Select appropriate environments (Production, Preview, Development)

#### Step 5: Configure Custom Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records (as instructed by Vercel)
4. Wait for SSL certificate provisioning

#### Step 6: Update GitHub OAuth

Update GitHub OAuth app with production URL:
```
https://yourdomain.com/api/login/github/callback
```

### Option 2: Docker Deployment

For self-hosted deployment using Docker.

#### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN corepack enable pnpm && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - TURSO_DATABASE_URL=${TURSO_DATABASE_URL}
      - TURSO_AUTH_TOKEN=${TURSO_AUTH_TOKEN}
      - GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
      - GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
      - GITHUB_CLIENT_REDIRECT_URI=${GITHUB_CLIENT_REDIRECT_URI}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
    restart: unless-stopped
```

#### Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 3: Node.js Server

Traditional deployment on a VPS or cloud server.

#### Step 1: Build Application

```bash
pnpm build
```

#### Step 2: Start Server

```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start npm --name "pucked" -- start

# Or using Node directly
NODE_ENV=production node .next/standalone/server.js
```

#### Step 3: Configure Reverse Proxy

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment

### 1. Verify Deployment

**Checklist:**
- [ ] Homepage loads correctly
- [ ] Login with GitHub works
- [ ] Invitation submission works
- [ ] Page builder loads
- [ ] Image upload works
- [ ] Public pages render correctly
- [ ] i18n works (English/Farsi)
- [ ] RTL support works for Farsi

### 2. Run Database Migrations

```bash
# Apply any pending migrations
pnpm db:migrate
```

### 3. Create Initial Content

```bash
# Create invitation codes
pnpm create-invitation

# Create site settings
pnpm seed-site-settings
```

### 4. Configure Monitoring

**Recommended Tools:**
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Plausible
- **Uptime**: UptimeRobot, Pingdom
- **Performance**: Vercel Analytics, New Relic

### 5. Set Up Backups

**Database Backups:**

```bash
# Export database
turso db shell pucked-prod < backup.sql

# Schedule regular backups
# Use cron job or Turso's backup features
```

## Performance Optimization

### 1. Enable Caching

**Vercel Edge Config:**

```json
{
  "caching": {
    "rules": [
      {
        "source": "/api/(.*)",
        "headers": {
          "Cache-Control": "s-maxage=60, stale-while-revalidate"
        }
      }
    ]
  }
}
```

### 2. Optimize Images

- Use WebP format
- Enable lazy loading
- Use responsive images
- Leverage Cloudinary transformations

### 3. Enable Compression

**next.config.ts:**

```typescript
const nextConfig = {
  compress: true,
  swcMinify: true,
};
```

## Security Hardening

### 1. Environment Variables

- Never commit `.env.local` to version control
- Use different secrets for dev/staging/prod
- Rotate secrets regularly
- Use Vercel's environment variable encryption

### 2. Headers

**next.config.ts:**

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### 3. Rate Limiting

Implement rate limiting on API routes:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

### 4. Security Headers

Add Content Security Policy (CSP):

```typescript
// next.config.ts
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://res.cloudinary.com;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;
```

## Monitoring & Logging

### 1. Error Tracking

**Sentry Integration:**

```bash
pnpm add @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### 2. Analytics

**Vercel Analytics:**

```bash
pnpm add @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 3. Logging

**Structured Logging:**

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta }));
  },
  error: (message: string, error?: Error) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message
    }));
  },
};
```

## Scaling Considerations

### 1. Database Scaling

**Turso Scaling:**
- Upgrade to paid tier for higher limits
- Enable read replicas
- Use edge locations for lower latency

### 2. CDN Scaling

**Vercel Edge Network:**
- Automatic global distribution
- Edge functions for compute
- Static asset caching

### 3. Application Scaling

**Horizontal Scaling:**
- Use multiple server instances
- Load balancer (Vercel handles this)
- Stateless application design

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Symptoms**: Deployment fails during build

**Solutions**:
- Check build logs for errors
- Verify all dependencies are installed
- Ensure environment variables are set
- Check TypeScript errors

#### 2. Runtime Errors

**Symptoms**: Application crashes or errors in production

**Solutions**:
- Check server logs
- Verify database connection
- Check environment variables
- Test API endpoints

#### 3. Performance Issues

**Symptoms**: Slow page loads or timeouts

**Solutions**:
- Enable caching
- Optimize images
- Check database queries
- Use Edge Functions
- Enable compression

#### 4. Authentication Issues

**Symptoms**: Users can't log in

**Solutions**:
- Verify GitHub OAuth settings
- Check redirect URI matches
- Verify session cookie settings
- Check environment variables

## Maintenance

### Regular Tasks

**Daily:**
- Monitor error rates
- Check uptime
- Review performance metrics

**Weekly:**
- Review logs for issues
- Check database performance
- Update dependencies

**Monthly:**
- Security updates
- Dependency upgrades
- Backup verification
- Performance review

**Quarterly:**
- Security audit
- Performance optimization
- Cost review
- Architecture review

## Rollback Procedure

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Database Rollback

```bash
# List migrations
turso db migrations list pucked-prod

# Rollback to specific migration
turso db migrations rollback pucked-prod [migration-id]
```

## Related Documentation

- [Getting Started](./getting-started.md) - Project setup
- [Database Setup](./database-setup.md) - Database configuration
- [Authentication System](./authentication.md) - Auth setup
- [Architecture Overview](./architecture.md) - System architecture

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Turso Documentation](https://docs.turso.tech)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
