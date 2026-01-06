# 🚀 Quick Start: Google OAuth

## ⚡ Fast Setup (5 minutes)

### Step 1: Run Database Migration
```bash
# In PostgreSQL, run this command:
psql -U your_username -d your_database -f server/models/oauth_migration.sql
```

### Step 2: Get Google Credentials
1. Visit: https://console.cloud.google.com/
2. Create project → Enable Google+ API
3. Create OAuth 2.0 Client ID
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret

### Step 3: Configure Environment
Create `.env.local` in root folder:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=run-openssl-rand-base64-32-to-generate
GOOGLE_CLIENT_ID=your-id-here
GOOGLE_CLIENT_SECRET=your-secret-here
```

### Step 4: Start Servers
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend  
cd ..
npm run dev
```

### Step 5: Test
1. Go to http://localhost:3000/login
2. Click "Continue with Google"
3. Sign in with Google account
4. ✅ Done! You're redirected to dashboard

---

## 📋 What Was Added

### Frontend Files:
- ✅ `app/api/auth/[...nextauth]/route.ts` - NextAuth config
- ✅ `types/next-auth.d.ts` - TypeScript types
- ✅ `app/components/AuthProvider.tsx` - Session provider
- ✅ Updated `app/login/page.tsx` - Google button
- ✅ Updated `app/layout.tsx` - Wrapped with AuthProvider

### Backend Files:
- ✅ `server/models/oauth_migration.sql` - Database schema
- ✅ Updated `server/controllers/authController.js` - OAuth handler
- ✅ Updated `server/routes/authRoutes.js` - New route

### Dependencies Installed:
- ✅ `next-auth@beta` - OAuth library
- ✅ `react-icons` - Google icon
- ✅ `passport` - Backend auth
- ✅ `passport-google-oauth20` - Google strategy

---

## 🔑 Key Features

- **Seamless Integration**: Works alongside existing email/password auth
- **Account Linking**: Can link Google to existing email accounts
- **Auto Registration**: New users created automatically
- **JWT Tokens**: Same token system as regular login
- **Profile Pictures**: Google avatars saved automatically

---

## 💡 Common Issues

**"redirect_uri_mismatch"**  
→ Check Google Console redirect URI matches exactly

**"NEXTAUTH_SECRET missing"**  
→ Add to `.env.local` and restart dev server

**Database errors**  
→ Make sure migration ran successfully

For detailed troubleshooting, see `GOOGLE_OAUTH_SETUP.md`
