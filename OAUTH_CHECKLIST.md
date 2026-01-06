# ✅ Google OAuth Setup Checklist

## Prerequisites
- [ ] PostgreSQL database running
- [ ] Node.js and npm installed
- [ ] Google Cloud account

---

## Setup Steps

### 1. Database Setup
- [ ] Run migration: `psql -U postgres -d your_db -f server/models/oauth_migration.sql`
- [ ] Verify columns exist: `oauth_provider`, `oauth_id`, `email_verified`
- [ ] Check password column is nullable

### 2. Google Cloud Console
- [ ] Go to https://console.cloud.google.com/
- [ ] Create new project (or select existing)
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Add JavaScript origin: `http://localhost:3000`
- [ ] Add redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Copy Client ID
- [ ] Copy Client Secret

### 3. Environment Variables

#### Frontend (.env.local in root)
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`
- [ ] Set `NEXTAUTH_URL=http://localhost:3000`
- [ ] Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Set `GOOGLE_CLIENT_ID` from Google Console
- [ ] Set `GOOGLE_CLIENT_SECRET` from Google Console

#### Backend (.env in server folder)
- [ ] Verify `JWT_ACCESS_SECRET` exists
- [ ] Verify `JWT_REFRESH_SECRET` exists
- [ ] Verify database credentials
- [ ] Verify email credentials (for welcome emails)

### 4. Install Dependencies
- [ ] Frontend: Already installed ✅ (next-auth@beta, react-icons)
- [ ] Backend: Already installed ✅ (passport, passport-google-oauth20)

### 5. Start Servers
- [ ] Backend: `cd server && npm start` (should run on port 5000)
- [ ] Frontend: `cd .. && npm run dev` (should run on port 3000)

### 6. Testing
- [ ] Open http://localhost:3000/login
- [ ] See "Continue with Google" button
- [ ] Click button → redirects to Google
- [ ] Select Google account
- [ ] Grant permissions
- [ ] Redirected back to app
- [ ] See success toast message
- [ ] Redirected to /dashboard
- [ ] Check localStorage has tokens
- [ ] Check database has user record with OAuth fields

### 7. Verify Database
```sql
-- Check if OAuth user was created
SELECT user_id, name, email, oauth_provider, oauth_id, email_verified 
FROM users 
WHERE oauth_provider = 'google';
```

---

## Common Issues Quick Fix

| Issue | Quick Fix |
|-------|-----------|
| redirect_uri_mismatch | Check Google Console redirect URI exactly matches |
| NEXTAUTH_SECRET missing | Add to .env.local and restart dev server |
| Database error | Verify migration ran successfully |
| 404 on OAuth endpoint | Check backend is running on port 5000 |
| Tokens not saved | Check browser console for errors |

---

## Production Checklist (When Deploying)

- [ ] Update `NEXTAUTH_URL` to production URL
- [ ] Update `NEXT_PUBLIC_API_BASE_URL` to production API
- [ ] Add production URL to Google Console origins
- [ ] Add production redirect URI to Google Console
- [ ] Generate new `NEXTAUTH_SECRET` for production
- [ ] Update backend database connection
- [ ] Test OAuth flow on production

---

## Success Indicators

✅ No console errors  
✅ Google login button visible  
✅ Google consent screen appears  
✅ Successful redirect to dashboard  
✅ Toast shows "Logged in with Google!"  
✅ User data in localStorage  
✅ User record in database with oauth_provider='google'  
✅ Can logout and login again  

---

## Need Help?

1. Check backend logs: Look at terminal running `npm start`
2. Check frontend console: Open browser DevTools
3. Review setup guides:
   - Quick start: `OAUTH_QUICKSTART.md`
   - Full guide: `GOOGLE_OAUTH_SETUP.md`
   - Summary: `OAUTH_IMPLEMENTATION_SUMMARY.md`

---

**All done? Great! You now have Google OAuth working! 🎉**
