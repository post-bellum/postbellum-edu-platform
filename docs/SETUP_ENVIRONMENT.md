# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

### 1. Supabase Configuration

Get these from your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API

```bash
# Public Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Public anonymous key (safe to expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key (KEEP SECRET!)
# Required for admin operations like account deletion
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. OAuth Providers (Optional)

#### Azure AD
```bash
NEXT_PUBLIC_AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
NEXT_PUBLIC_AZURE_TENANT_ID=your-azure-tenant-id
NEXT_PUBLIC_AZURE_REDIRECT_URI=http://localhost:3000/auth/callback
```

#### Google
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Getting Your Supabase Keys

### Step 1: Access Your Project Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on **Settings** (gear icon) in the sidebar
4. Click on **API** in the Settings menu

### Step 2: Copy the Keys

You'll see three important values:

1. **Project URL**: `https://xxxxx.supabase.co`
   - Copy this to `NEXT_PUBLIC_SUPABASE_URL`

2. **Project API keys**:
   - **anon/public key**: Copy to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: Copy to `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Create .env.local File

Create a file named `.env.local` in your project root:

```bash
# Copy from .env.example and fill in your values
cp .env.example .env.local
```

Then edit `.env.local` with your actual keys.

## ⚠️ Important Security Notes

### Service Role Key

The `SUPABASE_SERVICE_ROLE_KEY` is **extremely powerful**:
- ✅ **DO** keep it secret
- ✅ **DO** only use it server-side
- ✅ **DO** add `.env.local` to `.gitignore`
- ❌ **DON'T** expose it to the client
- ❌ **DON'T** commit it to git
- ❌ **DON'T** share it publicly

It bypasses ALL Row Level Security policies!

### What Needs Service Role Key?

Currently used for:
- **Account Deletion**: Deleting users from `auth.users` table
- Future admin operations

## Verification

After setting up your environment variables:

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Check for validation errors**:
   - Look for ✅ or ❌ messages in console
   - Fix any missing or invalid variables

3. **Test the features**:
   - Try logging in
   - Try OAuth providers (if configured)
   - Try deleting account (uses service role key)

## Troubleshooting

### "Environment validation failed"

- Check that all required variables are set
- Ensure no typos in variable names
- Restart dev server after changes

### "Invalid API key"

- Verify you copied the correct keys from Supabase
- Check for extra spaces or quotes
- Make sure keys are from the correct project

### "Missing SUPABASE_SERVICE_ROLE_KEY"

- This is required for account deletion feature
- Get it from Project Settings → API → service_role
- Add it to `.env.local`
- Restart server

### Account deletion not working

1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
2. Check server console for errors
3. Make sure key is the full service_role key (not anon key)
4. Restart dev server

## Production Deployment

### Vercel

1. Go to your project settings
2. Click **Environment Variables**
3. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your URL
   - ✅ Select all environments

4. For `SUPABASE_SERVICE_ROLE_KEY`:
   - ⚠️ **Only** select Production/Preview (not Development)
   - This keeps it server-side only

### Other Platforms

Follow similar steps:
- Add all `NEXT_PUBLIC_*` variables (safe to expose)
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server-only)
- Never expose service role key to client

## Example .env.local

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Azure OAuth (optional)
NEXT_PUBLIC_AZURE_CLIENT_ID=12345678-1234-1234-1234-123456789012
AZURE_CLIENT_SECRET=your-secret-here
NEXT_PUBLIC_AZURE_TENANT_ID=87654321-4321-4321-4321-210987654321
NEXT_PUBLIC_AZURE_REDIRECT_URI=http://localhost:3000/auth/callback

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-secret
```

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Service role key is NOT in public code
- [ ] Service role key is only used server-side
- [ ] Environment variables validated on startup
- [ ] Production keys are different from development
- [ ] Team members have their own keys

