# Email/Password Authentication Guide

## Overview

Complete email/password authentication system with registration, login, email verification (OTP), and password reset functionality.

## Features Implemented

### Registration Flow
1. User enters email, password (with validation), and confirms password
2. Real-time password validation feedback
3. Terms acceptance required
4. Supabase sends verification email with OTP code
5. User enters 6-digit OTP code
6. After OTP verification, user completes profile (teacher/category selection)
7. Success message displayed

### Login Flow
1. User enters email and password
2. Validates credentials with Supabase
3. Error handling for unverified emails
4. "Forgot password?" link available
5. After successful login, checks if profile is completed
6. If incomplete, shows CompleteRegistrationModal

### Password Reset Flow
1. User clicks "Forgot password?" on login
2. Enters email address
3. Receives password reset email with link
4. Clicks link → redirected to `/auth/reset-password`
5. Enters new password (with validation)
6. Confirms new password
7. Password updated, redirected to home page

## Password Validation Rules

### Requirements:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)

### Validation Messages (Czech):
- "Heslo musí mít alespoň 8 znaků"
- "Heslo musí obsahovat alespoň jedno velké písmeno"
- "Heslo musí obsahovat alespoň jedno malé písmeno"
- "Heslo musí obsahovat alespoň jedno číslo"

### UI Feedback:
- Real-time validation on blur
- Red error messages displayed below password field
- Passwords match check for confirmation field
- Submit button disabled until valid

## Email Verification

### How It Works:
1. Supabase sends email with:
   - 6-digit OTP code
   - Magic link (can click to verify instantly)
2. User can enter OTP in modal OR click link
3. Code expires after configured time (default: 1 hour)

### Features:
- "Resend code" button with success feedback
- Back button to return to registration
- Auto-submission when 6 digits entered
- Clear error messages

## Files Created

### Core Logic
- `src/lib/validation.ts` - Password validation utilities
- `src/lib/supabase/email-auth.ts` - Email auth functions
- `src/app/auth/reset-password/page.tsx` - Password reset page

### Components
- `src/components/auth/ForgotPasswordModal.tsx` - Forgot password modal

### Updated Components
- `src/components/auth/RegisterModal.tsx` - Added password validation & repeat field
- `src/components/auth/LoginModal.tsx` - Implemented login & forgot password link
- `src/components/auth/OTPModal.tsx` - Implemented OTP verification
- `src/components/auth/AuthModal.tsx` - Updated flow with forgot-password step

### Types
- `src/types/user.types.ts` - Added PasswordValidationResult & AuthError

## Usage Examples

### Register a User

```typescript
import { signUpWithEmail } from "@/lib/supabase/email-auth"

const { data, error } = await signUpWithEmail("user@email.com", "SecurePass123")

if (error) {
  console.error("Registration failed:", error)
} else {
  console.log("Registration successful! Check email for OTP")
}
```

### Login a User

```typescript
import { signInWithEmail } from "@/lib/supabase/email-auth"

const { data, error } = await signInWithEmail("user@email.com", "SecurePass123")

if (error) {
  console.error("Login failed:", error)
} else {
  console.log("Login successful!", data.user)
}
```

### Verify OTP

```typescript
import { verifyOTP } from "@/lib/supabase/email-auth"

const { data, error } = await verifyOTP("user@email.com", "123456")

if (error) {
  console.error("Verification failed:", error)
} else {
  console.log("Email verified!")
}
```

### Send Password Reset

```typescript
import { sendPasswordResetEmail } from "@/lib/supabase/email-auth"

const { data, error } = await sendPasswordResetEmail("user@email.com")

if (error) {
  console.error("Failed to send reset email:", error)
} else {
  console.log("Reset email sent!")
}
```

### Update Password

```typescript
import { updatePassword } from "@/lib/supabase/email-auth"

const { data, error } = await updatePassword("NewSecurePass123")

if (error) {
  console.error("Failed to update password:", error)
} else {
  console.log("Password updated!")
}
```

### Validate Password

```typescript
import { validatePassword, passwordsMatch } from "@/lib/validation"

const validation = validatePassword("MyPass123")
if (!validation.isValid) {
  console.log("Errors:", validation.errors)
}

const match = passwordsMatch("MyPass123", "MyPass123")
console.log("Passwords match:", match)
```

## Authentication Flow Diagram

### Registration
```
User clicks "Zaregistrovat se"
    ↓
Fills email + password + confirm password
    ↓
Validates password (8 chars, uppercase, lowercase, number)
    ↓
Accepts terms
    ↓
Submits form → signUpWithEmail()
    ↓
Supabase sends verification email
    ↓
Modal shows OTP input
    ↓
User enters 6-digit code → verifyOTP()
    ↓
Email verified ✅
    ↓
Modal shows CompleteRegistrationModal
    ↓
User selects role + school/category
    ↓
Profile saved to database
    ↓
Success modal → Close → User logged in
```

### Login
```
User clicks "Přihlásit"
    ↓
Fills email + password
    ↓
Accepts terms
    ↓
Submits form → signInWithEmail()
    ↓
Credentials validated ✅
    ↓
Modal closes
    ↓
Home page checks if profile completed
    ↓
If not completed → Show CompleteRegistrationModal
    ↓
If completed → Show user profile info
```

### Password Reset
```
User clicks "Zapomenuté heslo?"
    ↓
Enters email
    ↓
Submits → sendPasswordResetEmail()
    ↓
Supabase sends reset link email
    ↓
Success message shown
    ↓
User clicks link in email
    ↓
Redirected to /auth/reset-password
    ↓
Enters new password + confirm
    ↓
Validates password
    ↓
Submits → updatePassword()
    ↓
Password updated ✅
    ↓
Success message → Redirected to home
```

## Error Handling

### Common Errors (Czech Messages)

| Supabase Error | Czech Message |
|----------------|---------------|
| Invalid login credentials | Neplatné přihlašovací údaje |
| Email not confirmed | Email nebyl ověřen. Zkontrolujte svou e-mailovou schránku. |
| User already registered | Uživatel s tímto emailem již existuje |
| Password should be at least 6 chars | Heslo musí mít alespoň 6 znaků |
| Unable to validate email | Neplatný formát emailu |
| Email rate limit exceeded | Bylo odesláno příliš mnoho emailů. Zkuste to později. |
| Token has expired | Platnost odkazu vypršela. Požádejte o nový. |

### Validation Errors

**Password Requirements:**
- "Heslo musí mít alespoň 8 znaků"
- "Heslo musí obsahovat alespoň jedno velké písmeno"
- "Heslo musí obsahovat alespoň jedno malé písmeno"
- "Heslo musí obsahovat alespoň jedno číslo"

**Mismatch:**
- "Hesla se neshodují"

## Supabase Configuration

### Email Templates

Customize in **Supabase Dashboard** → **Authentication** → **Email Templates**:

1. **Confirm signup** - Contains OTP code
2. **Reset password** - Contains reset link

### Email Settings

**Authentication** → **Email** settings:
- ✅ Enable email confirmations
- Set OTP expiry (default: 3600 seconds = 1 hour)
- Configure email rate limits

### Redirect URLs

**Authentication** → **URL Configuration**:

Add these redirect URLs:
```
http://localhost:3000/*
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
```

## Security Features

### Password Security
- Hashed by Supabase (bcrypt)
- Never sent in plain text after initial registration
- Minimum complexity requirements enforced

### Email Verification
- Required before login
- OTP codes expire after 1 hour
- Rate limiting on resend

### Password Reset
- Secure tokens in email
- Token expires after configured time
- One-time use tokens

### Rate Limiting
- Prevents brute force attacks
- Limits password reset requests
- Limits OTP resend requests

## Testing

### Test Registration
1. Open app
2. Click "Přihlásit se / Registrovat"
3. Click "Zaregistrovat se"
4. Enter email & password (test: `Test123456`)
5. Confirm password
6. Accept terms
7. Submit
8. Check email for OTP code
9. Enter code
10. Complete profile
11. Verify user in database:
```sql
SELECT * FROM auth.users WHERE email = 'test@email.com';
SELECT * FROM profiles WHERE email = 'test@email.com';
```

### Test Login
1. Register a user first
2. Logout
3. Click "Přihlásit"
4. Enter credentials
5. Should login successfully
6. Profile should display

### Test Password Reset
1. Click "Zapomenuté heslo?"
2. Enter email
3. Check email for reset link
4. Click link
5. Enter new password
6. Confirm password
7. Submit
8. Login with new password

### Test Validation
1. Try password "test" → Should show errors
2. Try password "testtest" → Should show "need uppercase and number"
3. Try password "Test1234" → Should be valid ✅
4. Try mismatched passwords → Should show "Hesla se neshodují"

## Troubleshooting

### Issue: Email Not Received

**Check:**
1. Spam folder
2. Supabase email provider status
3. Email rate limits
4. SMTP configuration in Supabase

**Fix:**
- Use "Resend code" button
- Wait a few minutes (rate limiting)
- Check Supabase logs

### Issue: OTP Code Invalid

**Reasons:**
- Code expired (> 1 hour old)
- Wrong code entered
- Code already used

**Fix:**
- Click "Resend code"
- Use new code

### Issue: Can't Login - Email Not Verified

**Message:** "Email nebyl ověřen"

**Fix:**
- Check email for OTP
- Complete verification
- Or click magic link in email

### Issue: Password Too Weak

**Message:** Multiple validation errors

**Fix:**
- Make sure password has:
  - At least 8 characters
  - Uppercase letter
  - Lowercase letter
  - Number
- Example: `SecurePass123`

## API Reference

### signUpWithEmail(email, password)
**Returns:** `{ data, error }`
- Registers new user
- Sends verification email
- Does NOT log user in automatically

### signInWithEmail(email, password)
**Returns:** `{ data, error }`
- Logs in existing user
- Requires verified email
- Returns user and session

### verifyOTP(email, token)
**Returns:** `{ data, error }`
- Verifies 6-digit OTP code
- Confirms email address
- Logs user in

### resendOTP(email)
**Returns:** `{ data, error }`
- Sends new OTP code
- Rate limited

### sendPasswordResetEmail(email)
**Returns:** `{ data, error }`
- Sends reset link to email
- Link valid for configured time

### updatePassword(newPassword)
**Returns:** `{ data, error }`
- Updates user password
- Requires valid reset token
- Used on reset-password page

### validatePassword(password)
**Returns:** `{ isValid, errors }`
- Validates password against rules
- Returns array of error messages

### passwordsMatch(password, confirmPassword)
**Returns:** `boolean`
- Checks if passwords match

### getErrorMessage(error)
**Returns:** `string`
- Converts Supabase errors to Czech

## Complete User Journey

### New User (Email/Password)
```
Day 1:
- Registers with email/password
- Receives verification email
- Enters OTP code
- Completes profile (teacher + school OR category)
- Success! Account created

Day 2:
- Visits site
- Clicks login
- Enters credentials
- Logged in, profile displayed
```

### Forgot Password User
```
- Can't remember password
- Clicks "Zapomenuté heslo?"
- Enters email
- Receives reset link
- Clicks link
- Creates new password
- Can now login
```

## Comparison: OAuth vs Email/Password

| Feature | Google OAuth | Email/Password |
|---------|--------------|----------------|
| Registration | Click button | Email + Password + OTP |
| Email Verification | Automatic (Google) | Manual (OTP code) |
| Password | Not needed | Required, validated |
| Profile Completion | Yes | Yes |
| Same final result | ✅ Yes | ✅ Yes |

Both methods lead to the same outcome: verified user with completed profile in the database.

## Best Practices Followed

✅ Password validation enforced  
✅ Email verification required  
✅ Secure password hashing (Supabase)  
✅ Rate limiting on sensitive operations  
✅ Clear error messages in user's language  
✅ Consistent UX across auth methods  
✅ Mobile-responsive design  
✅ Accessibility considerations  

## Next Steps

### Recommended Enhancements:

1. **Remember Me** - Keep user logged in longer
2. **Social Recovery** - Additional recovery methods
3. **2FA** - Two-factor authentication option
4. **Password Strength Meter** - Visual indicator
5. **Email Change** - Allow users to update email
6. **Account Deletion** - GDPR compliance

### Analytics to Track:

```sql
-- Registration method distribution
SELECT 
  raw_app_meta_data->>'provider' as method,
  COUNT(*) as count
FROM auth.users
GROUP BY method;

-- Email verification completion rate
SELECT 
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) * 100.0 / COUNT(*) as verification_rate
FROM auth.users;

-- Password reset frequency
SELECT 
  COUNT(*) as reset_requests
FROM auth.audit_log_entries
WHERE action = 'password_recovery'
AND created_at > NOW() - INTERVAL '30 days';
```

## Configuration

### Supabase Settings to Review

**Authentication** → **Providers**:
- ✅ Email provider enabled
- ✅ Confirm email enabled
- ✅ Secure email change enabled (recommended)

**Authentication** → **Email Templates**:
- Customize "Confirm signup" template (OTP code)
- Customize "Reset password" template (reset link)
- Add your branding/logo

**Authentication** → **Auth** → **General**:
- Site URL: Your production domain
- Redirect URLs: Include all callback URLs

## Summary

You now have a complete, production-ready email/password authentication system with:
- ✅ Secure registration with email verification
- ✅ Password validation and complexity requirements
- ✅ Login with proper error handling
- ✅ Password reset functionality
- ✅ Consistent profile completion flow
- ✅ Czech language throughout
- ✅ No linter errors
- ✅ All tests passing

Ready to use! 🚀


