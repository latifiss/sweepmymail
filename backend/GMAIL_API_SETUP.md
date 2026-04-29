# Gmail API Setup Summary

## ✅ What's Been Configured

1. **Fixed Redirect URI**
   - Updated `.env` file to use the correct redirect URI: `http://localhost:7000/auth/google/callback`
   - This matches your auth route configuration

2. **Google API Credentials**
   - Your `.env` file already contains:
     - `GOOGLE_CLIENT_ID`: ✅ Set
     - `GOOGLE_CLIENT_SECRET`: ✅ Set
     - `GOOGLE_REDIRECT_URI`: ✅ Fixed to match route

3. **Test Script Created**
   - `test-routes.js` - Automated test script for all routes
   - Provides colored output and clear instructions

4. **Testing Documentation**
   - `TESTING.md` - Comprehensive testing guide

## 🚀 Quick Start Guide

### Step 1: Verify Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** > **Credentials**
3. Find your OAuth 2.0 Client ID
4. **IMPORTANT**: Make sure the authorized redirect URI includes:
   ```
   http://localhost:7000/auth/google/callback
   ```
5. If it's not there, add it and save

### Step 2: Start the Server

```bash
npm run dev
```

The server should start on port 7000.

### Step 3: Test Authentication

#### Quick Test (Recommended)

```bash
# In a new terminal window
node test-routes.js
```

The script will:
1. Check if server is running
2. Display the Google Auth URL
3. Guide you through the authentication process

#### Manual Test

1. **Get Auth URL:**
   ```bash
   curl http://localhost:7000/auth/google/url
   ```
   Or open in browser: `http://localhost:7000/auth/google/url`

2. **Copy the URL** from the response and open it in your browser

3. **Sign in** with your Google account and grant permissions

4. **After redirect**, you'll be redirected to:
   ```
   http://localhost:7000/auth/google/callback?code=YOUR_CODE
   ```
   The callback will automatically:
   - Exchange the code for tokens
   - Save user to database
   - Return a JWT token

### Step 4: Test Email Routes

After authentication, you'll receive a JWT token. Use it to test email routes:

```bash
# Set your token (replace YOUR_TOKEN with actual token)
TOKEN="YOUR_TOKEN"

# Fetch emails
curl -H "Authorization: Bearer $TOKEN" http://localhost:7000/emails

# Get grouped emails
curl -H "Authorization: Bearer $TOKEN" http://localhost:7000/emails/grouped
```

Or use the test script with the authorization code:
```bash
node test-routes.js YOUR_AUTHORIZATION_CODE
```

## 📋 Current Configuration

### Environment Variables (.env)
```env
PORT=7000
GOOGLE_CLIENT_ID=538152356219-ofu6sespinfvivgaild2cgd2vto8u3ne.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:7000/auth/google/callback
```

### Routes Available

**Authentication:**
- `GET /auth/google/url` - Get Google OAuth URL
- `GET /auth/google/callback` - OAuth callback handler

**Email Operations (require auth):**
- `GET /emails` - Fetch and save emails from Gmail
- `GET /emails/grouped` - Get emails grouped by sender
- `GET /emails/by-sender?sender=...` - Get emails from specific sender
- `POST /emails/unsubscribe` - Unsubscribe from emails
- `POST /emails/rollup` - Archive emails from a sender
- `POST /emails/delete` - Batch delete messages

## 🔍 Verification Checklist

Before testing, verify:

- [ ] Google Cloud Console has Gmail API enabled
- [ ] OAuth 2.0 credentials are created
- [ ] Redirect URI `http://localhost:7000/auth/google/callback` is added in Google Cloud Console
- [ ] `.env` file has correct `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] MongoDB is running and connected
- [ ] Server starts without errors (`npm run dev`)

## 🐛 Common Issues

### "redirect_uri_mismatch" Error
**Solution**: Make sure the redirect URI in Google Cloud Console exactly matches:
```
http://localhost:7000/auth/google/callback
```
(No trailing slash, exact match required)

### "invalid_client" Error
**Solution**: 
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Make sure there are no extra spaces or quotes
- Regenerate credentials in Google Cloud Console if needed

### "access_denied" Error
**Solution**: 
- Make sure Gmail API is enabled in Google Cloud Console
- Check that you're using the correct Google account
- Verify OAuth consent screen is configured

### Server Not Starting
**Solution**:
- Check MongoDB connection (`MONGO_URI` in `.env`)
- Verify all dependencies are installed: `npm install`
- Check for port conflicts (port 7000)

## 📚 Additional Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- See `TESTING.md` for detailed testing instructions

## 🎯 Next Steps

1. **Test Authentication Flow**
   - Run `node test-routes.js`
   - Complete OAuth flow
   - Verify JWT token is received

2. **Test Email Fetching**
   - Use the JWT token to call `/emails`
   - Verify emails are fetched and saved

3. **Test Email Management**
   - Try grouping emails
   - Test unsubscribe functionality
   - Test rollup/archive features

4. **Production Setup**
   - Update redirect URI for production domain
   - Set up proper error handling
   - Add rate limiting
   - Implement token refresh logic
