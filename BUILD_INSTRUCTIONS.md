# Build Instructions

## Prerequisites for Building

### 1. Environment Variables Required

Create a `.env.local` file in the project root with your Supabase credentials:

```bash
# Copy the example file
cp .env.local.example .env.local

# Or create manually with these variables:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Why is this needed?**
- Next.js pre-renders pages during build
- Your pages use Supabase client which requires these env vars
- Without them, the build fails with "Missing Supabase environment variables"

### 2. Building the Project

```bash
# Development build
npm run dev

# Production build
npm run build

# Start production server
npm start
```

---

## Build Errors & Solutions

### Error: "Module not found: Can't resolve 'md5'"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "Missing Supabase environment variables"

**Solution:**
```bash
# Make sure .env.local exists with valid credentials
cat .env.local  # Check if file exists

# If missing, copy from example:
cp .env.local.example .env.local

# Edit and add your actual Supabase credentials
```

### Error: "useSearchParams() should be wrapped in Suspense"

**Solution**: Already handled! `OAuthErrorDisplay` is wrapped in `Suspense` in `page.tsx`

---

## CI/CD Build Configuration

### GitHub Actions / Vercel / Netlify

Add these environment variables to your CI/CD platform:

```yaml
# Example: GitHub Actions
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### Vercel

1. Go to Project Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Docker

```dockerfile
# Dockerfile
FROM node:23-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build args for environment variables
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

RUN npm run build

CMD ["npm", "start"]
```

---

## Local Development

For local development, you only need `.env.local`:

```bash
# 1. Get Supabase credentials from dashboard
#    https://app.supabase.com/project/_/settings/api

# 2. Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF

# 3. Run dev server
npm run dev
```

---

## Troubleshooting

### "Client Component" can't have async/await

**Error:**
```
Error: "use client" components cannot use async/await
```

**Solution**: You're already using client components correctly. No async in component functions, only in handlers.

### Pages Try to Prerender During Build

**Current behavior**: Your pages are client components, so they won't prerender by default.

**If you want to use Server Components** (better for performance):

```typescript
// src/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import { HomeClient } from './HomeClient'

// Server Component (no "use client")
export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return <HomeClient initialUser={user} />
}
```

But for now, your client component approach is fine!

---

## Quick Build Test

```bash
# Test if everything is set up correctly
npm run build

# Expected output:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Collecting page data
# ✓ Generating static pages
# ✓ Finalizing page optimization
```

---

## Summary

✅ **For local development:** Just create `.env.local` with your credentials  
✅ **For CI/CD:** Add environment variables to your platform settings  
✅ **Build works:** Once env vars are present  

See `.env.local.example` for the template.

