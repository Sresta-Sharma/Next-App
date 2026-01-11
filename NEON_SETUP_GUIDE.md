# Neon Database Setup Guide

## Step 1: Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Sign up or log in
3. Click **"Create a project"**
4. Choose:
   - **Region**: Select closest to your users
   - **Postgres version**: Latest (16 recommended)
   - **Project name**: `next-app-db` (or your preferred name)
5. Click **Create project**

## Step 2: Get Connection String

After creating the project:

1. You'll see a **Connection Details** section
2. Copy the **Connection string** (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. **Save this connection string** - you'll need it for both local development and deployment

## Step 3: Run Database Schema

1. In the Neon Console, go to **SQL Editor**
2. Open the file `server/neon_setup.sql` from your project
3. Copy all the SQL content
4. Paste it into the Neon SQL Editor
5. Click **Run** to execute
6. You should see: "Success" messages for all tables created

## Step 4: Update Local Environment

Create or update `server/.env`:

```env
# Neon Database Connection
DATABASE_URL=your_neon_connection_string_here

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key

# Email Configuration (for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Note**: Replace `your_neon_connection_string_here` with the actual connection string from Step 2.

## Step 5: Test Local Connection

1. Open terminal in the `server` folder
2. Run:
   ```bash
   npm install
   node index.js
   ```
3. You should see: `PostgreSQL connected successfully!`

## Step 6: Deploy Backend with Neon

### Option A: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `your-app-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. Add **Environment Variables**:
   - `DATABASE_URL` = (your Neon connection string)
   - `JWT_SECRET` = (your secret)
   - `REFRESH_TOKEN_SECRET` = (your secret)
   - `EMAIL_USER` = (your email)
   - `EMAIL_PASS` = (your app password)
   - `FRONTEND_URL` = (your Vercel frontend URL)
   - `GOOGLE_CLIENT_ID` = (if using OAuth)
   - `GOOGLE_CLIENT_SECRET` = (if using OAuth)
6. Click **Create Web Service**
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://your-app-backend.onrender.com`)

### Option B: Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Configure:
   - **Root Directory**: `server`
   - **Start Command**: `node index.js`
5. Add environment variables (same as Render)
6. Deploy

## Step 7: Update Frontend Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update or add:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend-url.onrender.com`
5. Go to **Deployments** tab
6. Click **...** on latest deployment → **Redeploy**

## Step 8: Create Admin User (Optional)

In Neon SQL Editor, run:

```sql
-- Create an admin user
INSERT INTO users (name, email, password, role, email_verified)
VALUES (
  'Admin',
  'admin@example.com',
  '$2b$10$example-hashed-password',  -- You'll need to hash this
  'admin',
  true
);
```

Or use the backend endpoint after deployment.

## Connection String Format

Neon provides connection strings in this format:
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

Your code in `server/db.js` is already configured to handle this with the `DATABASE_URL` environment variable!

## Troubleshooting

### Issue: "Connection timeout"
- Check if your connection string is correct
- Ensure `sslmode=require` is in the connection string
- Verify your Neon project is active

### Issue: "Password authentication failed"
- Double-check the connection string
- Regenerate credentials in Neon Console if needed

### Issue: "SSL connection required"
- Your `server/db.js` already handles SSL for Neon
- Ensure the connection string includes `?sslmode=require`

## Benefits of Neon

✅ **Serverless** - Scales automatically, pay only for what you use
✅ **Fast** - Built on PostgreSQL with instant provisioning
✅ **Free tier** - Generous free tier for development
✅ **Branching** - Database branching for testing
✅ **Auto-scaling** - Handles traffic spikes automatically

## Next Steps

After setup:
1. ✅ Database is on Neon
2. ✅ Backend is deployed (Render/Railway)
3. ✅ Frontend is on Vercel
4. ✅ Environment variables are configured

Your app should now be fully functional in production!
