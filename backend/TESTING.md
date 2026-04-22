# Testing Gmail API Routes

This guide will help you test the Gmail API integration and routes in your email cleaner application.

## Prerequisites

1. **Google Cloud Console Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Gmail API:
     - Navigate to "APIs & Services" > "Library"
     - Search for "Gmail API"
     - Click "Enable"
   - Create OAuth 2.0 credentials:
     - Go to "APIs & Services" > "Credentials"
     - Click "Create Credentials" > "OAuth client ID"
     - Choose "Web application"
     - Add authorized redirect URI: `http://localhost:7000/auth/google/callback`
     - Copy the Client ID and Client Secret

2. **Environment Variables**
   Your `.env` file should contain:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:7000/auth/google/callback
   ```

3. **MongoDB Connection**
   Make sure MongoDB is running and `MONGO_URI` is set in your `.env` file.

## Testing Steps

### Step 1: Start the Server

```bash
npm run dev
```

The server should start on port 7000 (or the port specified in your `.env` file).

### Step 2: Test Authentication Flow

#### Option A: Using the Test Script

1. Run the test script:
   ```bash
   node test-routes.js
   ```

2. The script will:
   - Check if the server is running
   - Get the Google Auth URL
   - Display instructions for completing authentication

3. To complete authentication:
   - Copy the Google Auth URL from the output
   - Open it in your browser
   - Sign in with your Google account
   - Grant permissions for Gmail access
   - After redirect, copy the `code` parameter from the URL
   - Run: `node test-routes.js <code>`

#### Option B: Manual Testing with cURL or Postman

1. **Get Google Auth URL:**
   ```bash
   curl http://localhost:7000/auth/google/url
   ```

2. **Open the URL in your browser** and authenticate

3. **After authentication**, you'll be redirected to:
   ```
   http://localhost:7000/auth/google/callback?code=AUTHORIZATION_CODE
   ```

4. **The callback endpoint will:**
   - Exchange the code for access and refresh tokens
   - Create or update the user in the database
   - Return a JWT token and user information

### Step 3: Test Email Routes

All email routes require authentication. Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

#### Available Routes:

1. **Fetch Emails**
   ```bash
   GET /emails
   ```
   Fetches promotional/newsletter emails from Gmail and saves them to the database.

2. **Get Grouped Emails**
   ```bash
   GET /emails/grouped
   ```
   Returns emails grouped by sender/domain with counts.

3. **Get Emails by Sender**
   ```bash
   GET /emails/by-sender?sender=newsletter
   ```
   Returns emails from a specific sender.

4. **Unsubscribe**
   ```bash
   POST /emails/unsubscribe
   Content-Type: application/json
   
   {
     "messageId": "gmail_message_id",
     "unsubscribeLink": "optional_unsubscribe_url",
     "sender": "optional_sender_email"
   }
   ```

5. **Rollup (Archive) Sender**
   ```bash
   POST /emails/rollup
   Content-Type: application/json
   
   {
     "sender": "sender@example.com"
   }
   ```
   Archives all messages from a specific sender.

6. **Batch Delete**
   ```bash
   POST /emails/delete
   Content-Type: application/json
   
   {
     "messageIds": ["id1", "id2", "id3"]
   }
   ```
   Permanently deletes multiple messages.

## Example cURL Commands

### 1. Get Auth URL
```bash
curl http://localhost:7000/auth/google/url
```

### 2. Complete Callback (after authentication)
```bash
curl "http://localhost:7000/auth/google/callback?code=YOUR_CODE"
```

### 3. Fetch Emails
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:7000/emails
```

### 4. Get Grouped Emails
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:7000/emails/grouped
```

### 5. Unsubscribe
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"sender": "newsletter@example.com"}' \
     http://localhost:7000/emails/unsubscribe
```

## Troubleshooting

### Error: "Invalid redirect_uri"
- Make sure the redirect URI in `.env` matches exactly what's configured in Google Cloud Console
- Current redirect URI should be: `http://localhost:7000/auth/google/callback`

### Error: "Invalid credentials"
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Make sure there are no extra spaces or quotes

### Error: "User not found" or "No token provided"
- Make sure you've completed the OAuth flow and received a JWT token
- Include the token in the Authorization header: `Bearer <token>`

### Error: "Failed to fetch messages"
- Check if the user has granted Gmail API permissions
- Verify the access token hasn't expired (refresh tokens should auto-refresh)

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env` is correct
- For MongoDB Atlas, make sure your IP is whitelisted

## Testing Checklist

- [ ] Server starts without errors
- [ ] Google Auth URL endpoint returns a valid URL
- [ ] OAuth flow completes successfully
- [ ] JWT token is received after authentication
- [ ] User is created/updated in database
- [ ] Fetch emails endpoint returns emails
- [ ] Grouped emails endpoint returns grouped data
- [ ] Unsubscribe endpoint works
- [ ] Rollup endpoint archives messages
- [ ] Delete endpoint removes messages

## Next Steps

After testing the basic routes:
1. Test with real Gmail accounts
2. Test batch operations with multiple emails
3. Test error handling (invalid tokens, expired tokens, etc.)
4. Set up automated tests
5. Monitor API rate limits
