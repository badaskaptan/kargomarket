# Storage Debug Instructions

## How to Debug the Storage Issue

1. **Open the application in your browser:**
   - Navigate to http://localhost:5182/ (or wherever your dev server is running)
   - Open the browser's Developer Console (F12 → Console tab)

2. **Log in to your account** (if not already logged in)
   - The storage check requires authentication
   - Look for the automatic storage check logs in the console

3. **Go to "Yeni Nakliye Talebi İlanı Oluştur" section**
   - This will trigger the storage check automatically
   - Watch the console for detailed logging

4. **Use the debugging functions in the browser console:**

   **Check authentication status (run this first):**
   ```javascript
   await checkAuthStatus()
   ```

   **Basic connectivity test (no auth required):**
   ```javascript
   await testStorageConnectivity()
   ```

   **Manual bucket check:**
   ```javascript
   await debugBuckets()
   ```

   **Force storage check (same as automatic check):**
   ```javascript
   await forceStorageCheck()
   ```

   **Run full storage diagnostics:**
   ```javascript
   await debugStorage()
   ```

## What to Look For

### Expected Authentication Status:
```
🔐 Checking authentication status...
👤 Auth user: {id: "...", email: "...", ...}
❌ Auth error: null
🔐 Is authenticated: true
📧 User email: your-email@example.com
🆔 User ID: uuid-string
```

### Expected Success Output:
```
🔍 Checking storage buckets...
📋 All existing buckets: ["documents", "listings", "avatars"]
🎯 Required buckets: ["documents", "listings"]
📊 Total buckets found: 3
❓ Missing required buckets: []
✅ All required and optional buckets exist
✅ checkStorageBuckets returning TRUE - all required buckets found
```

### If Storage Check Fails:
Look for:
- ❌ Error listing buckets: [error details]
- ⚠️ Missing REQUIRED buckets: [list]
- Any authentication errors
- Network connectivity issues

## Troubleshooting

### If buckets are missing:
1. Check Supabase Dashboard → Storage → Buckets
2. Ensure `documents` and `listings` buckets exist and are public
3. Run `await initializeStorageBuckets()` to try creating them

### If authentication errors:
1. Check if you're logged in: `supabase.auth.getUser()`
2. Verify RLS policies allow storage access for authenticated users

### If still showing "Storage Kurulum Gerekli":
1. Check browser console logs
2. Look for the `storageReady` state in React DevTools
3. Try refreshing the page after login

## Manual Bucket Creation (if needed)

If automatic bucket creation fails, create them manually in Supabase Dashboard:

### documents bucket:
- Name: `documents`
- Public: ✅ Yes
- File size limit: 10MB
- MIME types: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `image/jpeg`, `image/png`

### listings bucket:
- Name: `listings` 
- Public: ✅ Yes
- File size limit: 10MB
- MIME types: `image/jpeg`, `image/png`, `image/gif`
