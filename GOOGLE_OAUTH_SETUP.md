# Google OAuth Setup Guide

## 🎯 Complete Setup Instructions

### 1. Database Migration

First, run the SQL migration to add OAuth support to your database:

```bash
# Connect to your PostgreSQL database and run:
psql -U your_username -d your_database -f server/models/oauth_migration.sql
```

Or manually execute the SQL in your database client:
```sql
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50),
  ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);

UPDATE users SET email_verified = true WHERE password IS NOT NULL;
```

### 2. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production URL (e.g., `https://yourdomain.com`)
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

### 3. Environment Variables

#### Frontend (.env.local in root directory)

Create or update `f:\next-app\.env.local`:

```env
# API Backend URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars-long

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Backend (.env in server directory)

Update `f:\next-app\server\.env`:

```env
# Existing variables...
JWT_ACCESS_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_username
DB_PASSWORD=your_password

# Email (existing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
# Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or use this simple method
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

### 5. Start Your Servers

#### Terminal 1 - Backend Server
```bash
cd f:\next-app\server
npm start
```

#### Terminal 2 - Next.js Frontend
```bash
cd f:\next-app
npm run dev
```

### 6. Test Google OAuth

1. Navigate to `http://localhost:3000/login`
2. Click on "Continue with Google" button
3. Select your Google account
4. Grant permissions
5. You should be redirected to `/dashboard` with a success message

---

## 🔍 How It Works

### Authentication Flow:

1. **User clicks "Continue with Google"** on the login page
2. **NextAuth.js** redirects to Google's OAuth consent screen
3. **User authorizes** the application
4. **Google redirects back** to your app with authorization code
5. **NextAuth.js** exchanges code for user profile
6. **Your backend** (`/api/auth/oauth/google`) receives user data:
   - Checks if user exists (by email or oauth_id)
   - Creates new user if doesn't exist
   - Links OAuth to existing user if email matches
   - Generates JWT tokens
7. **Frontend** stores tokens in localStorage
8. **User is redirected** to dashboard

### Key Features:

✅ **Account Linking**: Users can link Google OAuth to existing email/password accounts  
✅ **Auto Registration**: New users are automatically registered via Google  
✅ **Email Verified**: OAuth users are marked as email verified  
✅ **JWT Tokens**: Same token system as regular login  
✅ **Avatar Support**: Google profile picture is saved  

---

## 🛠️ Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Console exactly matches:
  `http://localhost:3000/api/auth/callback/google`

### Error: "NEXTAUTH_SECRET missing"
- Ensure `.env.local` has `NEXTAUTH_SECRET` set
- Restart your Next.js dev server after adding it

### OAuth user can't login
- Check if database migration ran successfully
- Verify `oauth_provider` and `oauth_id` columns exist
- Check backend logs for errors

### Tokens not stored
- Check browser console for errors
- Verify backend returns `accessToken` and `refreshToken`
- Check if `/api/auth/oauth/google` endpoint is working

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `server/.env`
- Test connection: `psql -U your_username -d your_database`

---

## 📝 Notes

- **Security**: Never commit `.env` or `.env.local` files to Git
- **Production**: Update redirect URIs in Google Console with production URL
- **Password**: OAuth users don't have passwords (password column is NULL)
- **Migration**: Existing users can link Google OAuth to their accounts
- **Phone Number**: OAuth users won't have phone numbers initially (can be added later in profile)

---

## 🚀 Next Steps

1. ✅ Run database migration
2. ✅ Set up Google OAuth credentials
3. ✅ Configure environment variables
4. ✅ Test OAuth login flow
5. 🔄 Optional: Add GitHub, Facebook, or other OAuth providers
6. 🔄 Optional: Add user profile page to update phone number

---

## 🆘 Need Help?

- Check backend logs: `cd server && npm start`
- Check frontend console: Browser DevTools → Console
- Verify API endpoint: `http://localhost:5000/api/auth/oauth/google`
- Test database connection in your PostgreSQL client

Happy coding! 🎉
