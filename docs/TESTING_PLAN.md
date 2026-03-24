# Comprehensive Testing Plan: Authentication & File Upload

## Overview
This document outlines the testing procedures for Supabase authentication and file upload functionality in the 4 Paws pet management system.

---

## 1. Supabase Authentication Testing

### 1.1 User Authentication Flow

#### Prerequisites
- Supabase integration connected in v0 settings
- Valid test user credentials

#### Test Cases

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| AUTH-01 | Sign Up Flow | 1. Navigate to `/auth/sign-up` 2. Enter email, password 3. Submit form | User created, confirmation email sent |
| AUTH-02 | Login Flow | 1. Navigate to `/auth/login` 2. Enter credentials 3. Submit | Redirect to `/account`, session created |
| AUTH-03 | Session Persistence | 1. Login 2. Close browser 3. Reopen and visit `/account` | User remains logged in |
| AUTH-04 | Logout Flow | 1. Login 2. Click logout 3. Try accessing `/account` | Redirect to login page |
| AUTH-05 | Protected Route Access | 1. Without login, visit `/account` | Redirect to `/auth/login` |

### 1.2 Verify Logged-In User Object

Add this debug code temporarily to verify user data:

```typescript
// In any authenticated component
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

console.log("[v0] User object:", {
  id: user?.id,
  email: user?.email,
  created_at: user?.created_at,
  last_sign_in: user?.last_sign_in_at,
  role: user?.role,
  // Mask sensitive data
  token: user?.id ? `${user.id.slice(0, 8)}...${user.id.slice(-4)}` : 'none'
})
```

#### Expected User Object Structure
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00.000Z",
  "last_sign_in_at": "2024-01-01T00:00:00.000Z",
  "role": "authenticated"
}
```

---

## 2. File Upload Testing

### 2.1 Test Upload Endpoint

**Endpoint:** `POST /api/vaccines/upload`

#### Test Files Required
| File Type | Test File | Max Size | MIME Type |
|-----------|-----------|----------|-----------|
| JPEG | `test-vaccine.jpg` | 10MB | `image/jpeg` |
| PNG | `test-vaccine.png` | 10MB | `image/png` |
| WEBP | `test-vaccine.webp` | 10MB | `image/webp` |
| PDF | `test-vaccine.pdf` | 10MB | `application/pdf` |
| GIF | `test-vaccine.gif` | 10MB | `image/gif` |

### 2.2 Upload Test Cases

| Test ID | Description | File | Expected Result |
|---------|-------------|------|-----------------|
| UPLOAD-01 | JPEG Upload | 500KB JPEG | Success, URL returned |
| UPLOAD-02 | PNG Upload | 1MB PNG | Success, URL returned |
| UPLOAD-03 | WEBP Upload | 300KB WEBP | Success, URL returned |
| UPLOAD-04 | PDF Upload | 2MB PDF | Success, URL returned |
| UPLOAD-05 | Large File (>10MB) | 15MB file | Error: File too large |
| UPLOAD-06 | Invalid Type | .exe file | Error: Invalid file type |
| UPLOAD-07 | No Auth | Any file, no session | Error: Unauthorized |

### 2.3 Debug Logging for Uploads

The upload endpoint should log:

```typescript
console.log("[v0] Upload request received:", {
  fileName: file.name,
  fileSize: `${(file.size / 1024).toFixed(2)} KB`,
  fileType: file.type,
  timestamp: new Date().toISOString()
})

// After successful upload
console.log("[v0] Upload successful:", {
  pathname: blob.pathname,
  url: `${blob.url.slice(0, 50)}...`, // Truncated for security
  contentType: blob.contentType,
  size: blob.size
})

// Token verification (masked)
console.log("[v0] Blob token status:", {
  tokenPresent: !!process.env.BLOB_READ_WRITE_TOKEN,
  tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0,
  tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 8) + "..."
})
```

### 2.4 Manual Upload Test Script

```bash
# Test JPEG upload via curl
curl -X POST https://your-domain.vercel.app/api/vaccines/upload \
  -H "Cookie: your-session-cookie" \
  -F "file=@test-vaccine.jpg"

# Expected response:
# {
#   "pathname": "vaccinations/abc123-test-vaccine.jpg",
#   "url": "https://blob.vercel-storage.com/..."
# }
```

---

## 3. Environment Variables Verification

### 3.1 Required Variables

| Variable | Purpose | Required In |
|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | All environments |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | All environments |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations | Production only |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage | All environments |

### 3.2 Verification Steps

#### Step 1: Check Vercel Dashboard
1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Verify each variable exists for:
   - [ ] Development
   - [ ] Preview
   - [ ] Production

#### Step 2: Runtime Verification
Add temporary endpoint to verify (remove after testing):

```typescript
// app/api/debug/env/route.ts (DELETE AFTER TESTING)
export async function GET() {
  return Response.json({
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
    },
    blob: {
      token: process.env.BLOB_READ_WRITE_TOKEN ? "SET" : "MISSING",
      tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0,
    },
    environment: process.env.VERCEL_ENV || "local",
  })
}
```

#### Step 3: Environment-Specific Testing

| Environment | URL Pattern | Test Command |
|-------------|-------------|--------------|
| Development | localhost:3000 | `npm run dev` |
| Preview | project-git-branch.vercel.app | Push to branch |
| Production | your-domain.vercel.app | Merge to main |

---

## 4. Vercel Redeployment Process

### 4.1 Pre-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase integration connected
- [ ] Blob storage integration connected
- [ ] Database migrations applied
- [ ] No console.log debug statements in production code

### 4.2 Deployment Steps

#### Option A: Automatic (Git Push)
```bash
git add .
git commit -m "fix: update file upload and auth handling"
git push origin main
```

#### Option B: Manual Redeploy
1. Go to Vercel Dashboard > Deployments
2. Click "..." on latest deployment
3. Select "Redeploy"
4. Choose "Use existing Build Cache" or "Redeploy with existing settings"

#### Option C: Force Fresh Build
1. Vercel Dashboard > Settings > General
2. Click "Clear Build Cache" (if needed)
3. Trigger new deployment

### 4.3 Post-Deployment Validation

#### Immediate Checks (within 5 minutes)
| Check | URL | Expected |
|-------|-----|----------|
| Homepage loads | `/` | 200 OK |
| Auth pages work | `/auth/login` | 200 OK |
| API health | `/api/health` | 200 OK |
| Protected routes redirect | `/account` (no auth) | Redirect to login |

#### Functional Tests
| Test | Steps | Expected |
|------|-------|----------|
| Login | Enter credentials, submit | Success, redirect to account |
| File Upload | Upload test JPEG | Success, URL accessible |
| View Upload | Click uploaded file URL | Image/PDF displays |
| Admin Access | Login as admin, view dashboard | Data loads correctly |

---

## 5. Upload URL Accessibility Validation

### 5.1 URL Structure
Uploaded files should return URLs in format:
```
https://[store-id].public.blob.vercel-storage.com/vaccinations/[unique-id]-[filename].[ext]
```

### 5.2 Accessibility Tests

| Test | Method | Expected |
|------|--------|----------|
| Direct URL Access | Open URL in browser | File displays/downloads |
| Cross-Origin Access | Fetch from different domain | CORS headers present |
| Expiration | Check after 24hrs | URL still accessible (no expiry for public blobs) |

### 5.3 Troubleshooting Failed Uploads

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| 401 Unauthorized | Missing BLOB_READ_WRITE_TOKEN | Add token to env vars |
| 413 Payload Too Large | File exceeds limit | Reduce file size |
| 500 Internal Error | Token invalid or expired | Regenerate token in Vercel |
| URL returns 404 | Blob deleted or wrong path | Check pathname in response |

---

## 6. Test Execution Checklist

### Pre-Release Testing
- [ ] AUTH-01 through AUTH-05 pass
- [ ] UPLOAD-01 through UPLOAD-07 pass
- [ ] All env vars verified in all environments
- [ ] Admin dashboard loads vaccinations
- [ ] File URLs are accessible after upload

### Post-Deployment Smoke Test
- [ ] Production URL accessible
- [ ] Login works
- [ ] File upload works
- [ ] Uploaded files accessible
- [ ] No console errors in browser

---

## 7. Contact & Escalation

For issues during testing:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Review browser console for client-side errors
4. Check Network tab for failed API calls

---

*Last Updated: March 2026*
*Version: 1.0*
