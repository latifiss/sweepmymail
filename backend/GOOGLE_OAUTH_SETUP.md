# Google OAuth 2.0 Setup Guide

## Step-by-Step Instructions to Create New Google API Credentials

### Step 1: Go to Google Cloud Console

1. Open your browser and go to: https://console.cloud.google.com/
2. Sign in with your Google account (issakalatif49@gmail.com or any Google account)

### Step 2: Create or Select a Project

1. Click on the project dropdown at the top (next to "Google Cloud")
2. Either:
   - **Select an existing project** (if you have one)
   - **Click "New Project"** to create a new one
     - Project name: `freemymail` (or any name you prefer)
     - Click "Create"
     - Wait for the project to be created
     - Select the new project from the dropdown

### Step 3: Enable Gmail API

1. In the left sidebar, click **"APIs & Services"** > **"Library"**
2. In the search bar, type: **"Gmail API"**
3. Click on **"Gmail API"** from the results
4. Click the **"Enable"** button
5. Wait for it to enable (you'll see a green checkmark)

### Step 4: Configure OAuth Consent Screen

1. In the left sidebar, go to **"APIs & Services"** > **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace account, then choose "Internal")
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: `FreeMyMail` (or any name)
   - **User support email**: Select your email (issakalatif49@gmail.com)
   - **Developer contact information**: Enter your email
5. Click **"Save and Continue"**
6. On the **Scopes** page:
   - Click **"Add or Remove Scopes"**
   - Search for and select:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `email`
     - `profile`
   - Click **"Update"**
   - Click **"Save and Continue"**
7. On the **Test users** page (if in testing mode):
   - Click **"Add Users"**
   - Add your email: `issakalatif49@gmail.com`
   - Click **"Add"**
   - Click **"Save and Continue"**
8. Review and click **"Back to Dashboard"**

### Step 5: Create OAuth 2.0 Credentials

1. In the left sidebar, go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. If prompted, select **"Web application"** as the application type
5. Fill in the form:
   - **Name**: `FreeMyMail Web Client` (or any name)
   - **Authorized JavaScript origins**: 
     - Click **"+ ADD URI"**
     - Add: `http://localhost:7000`
   - **Authorized redirect URIs** (THIS IS CRITICAL):
     - Click **"+ ADD URI"**
     - Add: `http://localhost:7000/auth/google/callback`
     - ⚠️ **IMPORTANT**: Make sure this matches EXACTLY (no trailing slash, correct port)
6. Click **"Create"**
7. A popup will appear with your credentials:
   - **Your Client ID**: Copy this (looks like: `xxxxx-xxxxx.apps.googleusercontent.com`)
   - **Your Client Secret**: Copy this (looks like: `GOCSPX-xxxxx`)
8. Click **"OK"**

### Step 6: Update Your .env File

1. Open your `.env` file in the backend directory
2. Update these values with your NEW credentials:

```env
GOOGLE_CLIENT_ID=your_new_client_id_here
GOOGLE_CLIENT_SECRET=your_new_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:7000/auth/google/callback
```

**Example:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-ABCDEFGHIJKLMNOPQRSTUVWXYZ
GOOGLE_REDIRECT_URI=http://localhost:7000/auth/google/callback
```

### Step 7: Restart Your Server

1. Stop your server (Ctrl+C if it's running)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 8: Test the Authentication

1. Run the test script:
   ```bash
   node test-routes.js
   ```
2. Copy the Google Auth URL from the output
3. Open it in your browser
4. Sign in with your Google account
5. Grant permissions
6. You should be redirected back to your app successfully!

## Common Issues and Solutions

### Issue: "redirect_uri_mismatch" Error

**Causes:**
- Redirect URI in Google Cloud Console doesn't match `.env` file
- Extra spaces or characters
- Wrong port number
- Missing or extra trailing slash

**Solution:**
1. Go to Google Cloud Console > Credentials
2. Click on your OAuth 2.0 Client ID
3. Check the **Authorized redirect URIs** section
4. Make sure it EXACTLY matches: `http://localhost:7000/auth/google/callback`
5. No trailing slash, correct port (7000), correct path
6. Save and wait 1-2 minutes for changes to propagate

### Issue: "Access blocked: This app's request is invalid"

**Causes:**
- OAuth consent screen not configured
- App is in testing mode and your email isn't added as a test user
- Required scopes not added

**Solution:**
1. Go to OAuth consent screen
2. Make sure you've completed all steps
3. Add your email as a test user (if in testing mode)
4. Make sure Gmail API scopes are added

### Issue: "invalid_client" Error

**Causes:**
- Wrong Client ID or Client Secret
- Extra spaces in `.env` file
- Credentials copied incorrectly

**Solution:**
1. Double-check your `.env` file
2. Make sure there are no extra spaces around the `=` sign
3. Make sure there are no quotes around the values
4. Re-copy credentials from Google Cloud Console

## Verification Checklist

Before testing, verify:

- [ ] Gmail API is enabled in Google Cloud Console
- [ ] OAuth consent screen is configured
- [ ] Your email is added as a test user (if in testing mode)
- [ ] OAuth 2.0 credentials are created
- [ ] Redirect URI in Google Cloud Console: `http://localhost:7000/auth/google/callback`
- [ ] Redirect URI in `.env` file: `http://localhost:7000/auth/google/callback`
- [ ] Both URIs match EXACTLY (character by character)
- [ ] Client ID and Secret are correctly copied to `.env`
- [ ] No extra spaces or quotes in `.env` file
- [ ] Server is restarted after updating `.env`

## Quick Reference: Exact Redirect URI Format

```
http://localhost:7000/auth/google/callback
```

**Important:**
- ✅ Starts with `http://` (not `https://`)
- ✅ Uses `localhost` (not `127.0.0.1`)
- ✅ Port is `7000` (match your server port)
- ✅ Path is `/auth/google/callback` (matches your route)
- ✅ No trailing slash
- ✅ No spaces

## Need Help?

If you still get errors:
1. Double-check the redirect URI matches exactly
2. Wait 1-2 minutes after making changes in Google Cloud Console
3. Clear your browser cache and cookies
4. Try in an incognito/private window
5. Check server logs for detailed error messages
