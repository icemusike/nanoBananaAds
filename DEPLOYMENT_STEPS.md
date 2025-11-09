# Step-by-Step Deployment Guide - FastComet cPanel

## Files That Need to Be Updated on Live Server

### Critical Backend Files (Fixed Prisma Connection):
```
backend/routes/auth.js
backend/routes/license.js
backend/routes/admin/auth.js
backend/routes/admin/users.js
backend/routes/admin/dashboard.js
backend/routes/admin/costs.js
backend/routes/admin/settings.js
backend/services/licenseService.js
backend/services/jvzooService.js
backend/middleware/auth.js
backend/middleware/adminAuth.js
```

---

## Step 1: Access cPanel File Manager

1. Log in to your FastComet cPanel at: https://yoursite.fastcomet.com:2083
2. Navigate to **File Manager** in the Files section
3. Go to the folder where your backend is hosted (likely `public_html/api` or similar)

---

## Step 2: Upload Updated Backend Files

### Option A: Upload Individual Files (Recommended)
For each file listed above:
1. In File Manager, navigate to the corresponding folder
2. Click **Upload** button
3. Drag the file from your local computer: `C:\AI\Nano-Banana-Ad-Creator\backend\[filepath]`
4. If prompted, choose to **Overwrite** existing files
5. Wait for upload to complete (green checkmark)

### Option B: Upload as ZIP (Faster for Multiple Files)
1. Create a ZIP of the updated files
2. Upload the ZIP to cPanel
3. Right-click the ZIP and select **Extract**
4. Delete the ZIP file after extraction

---

## Step 3: Verify File Upload

Check that these files have been updated by:
1. Right-click any uploaded file
2. Select **View** or **Edit**
3. Verify the first few lines match your local version
4. Look for: `import prisma from '../utils/prisma.js';` or `import prisma from '../../utils/prisma.js';`

---

## Step 4: Restart Node.js Application

### Method 1: Using Node.js Selector (if available)
1. In cPanel, find **Setup Node.js App** (or **Node.js Selector**)
2. Find your application (api.adgeniusai.io)
3. Click **Restart** button
4. Wait 10-30 seconds for restart to complete

### Method 2: Using Terminal/SSH
1. In cPanel, open **Terminal**
2. Navigate to your app directory:
   ```bash
   cd public_html/api  # or wherever your backend is
   ```
3. Restart using PM2 or your process manager:
   ```bash
   pm2 restart all
   # OR
   npm run restart
   # OR kill and restart the process
   ```

### Method 3: Contact FastComet Support
If the above methods don't work:
1. Open a support ticket
2. Ask them to restart your Node.js application at api.adgeniusai.io

---

## Step 5: Reset Password on Production Database

Run this script to set your password on the live database:

1. In cPanel Terminal, navigate to backend folder
2. Run:
   ```bash
   node reset-password.js
   ```

**OR** if you can't run scripts via cPanel:
1. Temporarily upload `reset-password.js` to your live server
2. SSH into server
3. Run: `node reset-password.js`
4. Delete the script after running

---

## Step 6: Test Login

1. Go to: https://app.adgeniusai.io/login
2. Enter credentials:
   - **Email:** isfanbogdan@gmail.com
   - **Password:** Admin123!
3. Click **Login**

### Expected Results:
✅ Login successful - redirected to dashboard
❌ If error persists - check server logs

---

## Step 7: Check Server Logs (If Issues)

### In cPanel:
1. Go to **Metrics** → **Errors**
2. Check for recent 500 errors
3. Look at error details

### Via Terminal:
```bash
cd public_html/api  # your backend folder
pm2 logs          # if using PM2
# OR
tail -f error.log  # check your error log location
```

---

## Troubleshooting

### Issue: Still getting 500 error after upload
**Solution:**
- Verify all 11 files were uploaded correctly
- Ensure Node.js app restarted
- Check that `backend/utils/prisma.js` exists on server

### Issue: Can't restart Node.js app
**Solution:**
- Contact FastComet support via live chat
- They can restart it for you in 2-3 minutes

### Issue: Password reset doesn't work
**Solution:**
- Verify DATABASE_URL in production `.env` file
- Check that the user exists in production database

---

## Quick Checklist

- [ ] Upload 11 backend files via File Manager
- [ ] Verify files uploaded (check file contents)
- [ ] Restart Node.js application
- [ ] Reset password on production database
- [ ] Test login at app.adgeniusai.io
- [ ] Confirm successful login

---

## Need Help?

If you encounter issues:
1. Check the exact error message in browser console (F12)
2. Check cPanel error logs
3. Contact FastComet support - they're usually very helpful
4. Share the error details here for further troubleshooting
