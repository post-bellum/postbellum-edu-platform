# Azure OAuth Setup Guide

## 🔧 What I've Added

1. **Better error logging** in callback route
2. **Error display** on home page
3. **Azure-specific scopes** in OAuth helper

## 🚀 Complete Setup Checklist

### Step 1: Azure Portal Configuration

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**

**Fill in:**
- **Name**: "Post Bellum Educational Platform"
- **Supported account types**: "Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts"
- **Redirect URI**: 
  - Platform: **Web**
  - URI: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`

4. Click **Register**

### Step 2: Get Credentials

After registration:

1. Copy **Application (client) ID** (you'll need this)
2. Copy **Directory (tenant) ID** (you'll need this)
3. Go to **Certificates & secrets**
4. Click **New client secret**
5. Add description: "Supabase OAuth"
6. Set expiration (e.g., 24 months)
7. Click **Add**
8. **IMMEDIATELY COPY THE SECRET VALUE** (you can't see it again!)

### Step 3: Configure Redirect URIs

In Azure Portal, your app → **Authentication**:

Add these redirect URIs:
```
https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback (for development)
```

### Step 4: Configure Supabase

1. Go to **Supabase Dashboard**
2. **Authentication** → **Providers**
3. Find **Azure** and click to configure
4. **Enable** the provider
5. Fill in:
   - **Azure Client ID**: Your Application (client) ID
   - **Azure Secret**: Your client secret value
   - **Azure Tenant**: Your Directory (tenant) ID
   - Or use `common` for multi-tenant apps

6. **Save**

### Step 5: Add Redirect URLs in Supabase

**Authentication** → **URL Configuration**:

Add to **Redirect URLs**:
```
http://localhost:3000/*
http://localhost:3000/auth/callback
```

## 🧪 Testing the Setup

### Test 1: Click Microsoft Login Button
You should be redirected to Microsoft login page

### Test 2: Login with Microsoft Account
After successful login, you should be redirected back

### Test 3: Check for Errors
Look at the home page - any error messages displayed?

### Test 4: Check Console
Open DevTools (F12) → Console tab
Look for:
- ✅ "OAuth success! User: your-email@example.com"
- ❌ Any error messages

### Test 5: Check Database
```sql
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 1;
```
Should see your user!

## 🐛 Common Issues & Solutions

### Issue 1: "redirect_uri_mismatch"

**Error shown:** URL mismatch or invalid redirect URI

**Fix:**
1. Check Azure Portal → Your App → **Authentication**
2. Ensure redirect URI **exactly matches**:
   ```
   https://YOUR_PROJECT.supabase.co/auth/v1/callback
   ```
3. **No trailing slashes!**
4. **https** not http for production

### Issue 2: "AADSTS50011: The redirect URI specified in the request does not match"

**Fix:** Same as Issue 1 - redirect URI mismatch

### Issue 3: "invalid_client"

**Error:** Client authentication failed

**Fix:**
1. Check Supabase → Azure provider
2. Verify **Client ID** is correct
3. Verify **Client Secret** is correct (not expired)
4. Regenerate secret if needed

### Issue 4: User Redirected Back But Not Logged In

**Possible causes:**
- Session not being created
- Callback route error
- RLS policy blocking

**Debug:**
1. Check browser console for errors
2. Check Network tab for `/auth/callback` response
3. Run this query:
```sql
SELECT * FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Issue 5: "insufficient_scope"

**Error:** Required scopes not granted

**Fix:**
In Azure Portal → Your App → **API permissions**:

Add these permissions:
- Microsoft Graph → **Delegated permissions**:
  - ✅ `openid`
  - ✅ `profile`
  - ✅ `email`
  - ✅ `User.Read`

Then click **Grant admin consent**

### Issue 6: Localhost Redirect Not Working

**For development:**

1. In Supabase, add: `http://localhost:3000/*`
2. In Azure, add: `http://localhost:3000/auth/callback`
3. Hard refresh your dev app (Cmd+Shift+R / Ctrl+Shift+R)

## 📊 Verify Setup with SQL

### Check Auth Logs
```sql
SELECT 
  created_at,
  action,
  actor_id,
  actor_name,
  log_type
FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;
```

### Check User Was Created
```sql
SELECT 
  id,
  email,
  raw_app_meta_data->>'provider' as provider,
  created_at
FROM auth.users
WHERE raw_app_meta_data->>'provider' = 'azure'
ORDER BY created_at DESC;
```

## 🔍 Debug Flow

### What Should Happen:

1. **Click Microsoft button**
   - Browser console: "OAuth login with microsoft"
   - Redirect to Microsoft login

2. **Microsoft login page**
   - Enter credentials
   - Accept permissions

3. **Redirect to callback**
   - URL: `http://localhost:3000/auth/callback?code=...`
   - Server console: "OAuth success! User: email@example.com"

4. **Redirect to home**
   - URL: `http://localhost:3000/`
   - If new user: Registration modal appears
   - If returning: User info displayed

### What's Probably Wrong:

**If stuck at step 1:**
- Check browser console for errors
- Check network tab for failed requests

**If stuck at step 2:**
- Azure configuration issue
- Redirect URI mismatch

**If stuck at step 3:**
- Code exchange failing
- Check server logs
- Check Supabase auth logs

**If stuck at step 4:**
- User created but session not persisting
- Check cookies in DevTools

## 🆘 Still Not Working?

Run this diagnostic:

```sql
-- Check Azure provider is enabled
SELECT * FROM auth.config WHERE name = 'azure';

-- Check recent auth attempts
SELECT 
  created_at,
  action,
  log_type,
  error_message
FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

**Share:**
1. Any error messages from home page
2. Browser console errors
3. Result of diagnostic SQL above

## ✅ Success Checklist

- [ ] Azure app created in Azure Portal
- [ ] Client ID, Secret, and Tenant ID obtained
- [ ] Redirect URIs configured in Azure
- [ ] Azure provider enabled in Supabase
- [ ] Client ID, Secret, Tenant configured in Supabase
- [ ] Redirect URLs configured in Supabase
- [ ] API permissions granted in Azure
- [ ] Test login successful
- [ ] User created in `auth.users`
- [ ] Profile created in `profiles` (after modal)

---

**Now try logging in with Microsoft again and check:**
1. Do you see any error message on the home page?
2. Any errors in browser console?
3. Does user appear in `auth.users` table?

