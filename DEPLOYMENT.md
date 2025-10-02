# Deployment Guide for Nano Banana Ad Creator

This guide will walk you through deploying both the **frontend** (to Vercel) and **backend** (to Railway or Render).

## Architecture Overview

- **Frontend**: React + Vite application (deployed to Vercel)
- **Backend**: Node.js + Express + Prisma (deployed to Railway/Render)
- **Database**: PostgreSQL (managed by Railway/Render)

---

## Part 1: Deploy Backend (Railway - Recommended)

### Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Deploy Backend to Railway

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `nanoBananaAds` repository
4. Click **"Add Variables"** and add these environment variables:

```
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
```

5. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
6. Railway will automatically create a PostgreSQL database
7. Copy the `DATABASE_URL` from the PostgreSQL service and add it to your backend environment variables

### Step 3: Configure Build Settings

Railway should auto-detect your backend, but if needed:

1. Go to **Settings** → **Build**
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Set **Start Command**: `node server.js`

### Step 4: Run Database Migrations

Once deployed, go to your backend service and run:
```bash
npx prisma migrate deploy
```

### Step 5: Get Your Backend URL

Railway will give you a public URL like: `https://nanobananaads-production.up.railway.app`

**Important**: Copy this URL - you'll need it for Vercel!

---

## Part 2: Deploy Frontend (Vercel)

### Step 1: Prepare Frontend

1. Make sure you have the `vercel.json` file in your root directory (already created)
2. Create a `.env` file in the `frontend` directory:

```bash
VITE_API_URL=https://your-backend-url.railway.app/api
```

**Replace** `your-backend-url.railway.app` with your actual Railway backend URL!

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel.com](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your `nanoBananaAds` repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.railway.app/api`

6. Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

When prompted:
- Set up and deploy: **Y**
- Which scope: Choose your account
- Link to existing project: **N**
- Project name: `nano-banana-ads`
- In which directory is your code located: `./frontend`
- Override settings: **Y**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

---

## Part 3: Post-Deployment Configuration

### Update API Keys in Vercel

After frontend is deployed:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Verify `VITE_API_URL` is set correctly
3. If you need to update it, add/edit the variable and **redeploy**

### Update CORS in Backend

Your backend needs to allow requests from your Vercel domain:

1. Open `backend/server.js`
2. Update the CORS configuration:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app'  // Add your Vercel URL here
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

3. Commit and push changes to trigger Railway redeploy

---

## Troubleshooting

### Frontend shows 404 or blank page
- Check that `vercel.json` is in the root directory
- Verify Root Directory is set to `frontend` in Vercel settings
- Check browser console for errors

### API calls failing (CORS errors)
- Make sure `VITE_API_URL` environment variable is set in Vercel
- Verify backend CORS settings include your Vercel domain
- Check that backend is running on Railway

### Database connection errors
- Verify `DATABASE_URL` is set in Railway
- Run migrations: `npx prisma migrate deploy`
- Check Railway logs for database errors

### API Keys not working
- Users need to add their own API keys in the Settings page
- API keys are stored in localStorage (client-side)
- Backend receives keys via request headers

---

## Environment Variables Summary

### Backend (Railway)
```
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://... (auto-provided by Railway)
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-backend-url.railway.app/api
```

---

## Alternative: Deploy Backend to Render

If you prefer Render over Railway:

1. Go to [Render.com](https://render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `node server.js`
5. Add the same environment variables as Railway
6. Create a PostgreSQL database on Render
7. Copy the internal/external database URL to your web service

---

## Testing Your Deployment

1. Visit your Vercel URL
2. Go to **Settings** page
3. Add your Gemini and OpenAI API keys
4. Try creating an ad to test the full flow
5. Check that images generate and copy is created

---

## Need Help?

- **Frontend Issues**: Check Vercel deployment logs
- **Backend Issues**: Check Railway/Render logs
- **Database Issues**: Check PostgreSQL logs in Railway/Render
- **API Issues**: Check browser Network tab and backend logs

---

## Local Development vs Production

### Local Development
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Database: Local PostgreSQL

### Production
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`
- Database: Railway/Render PostgreSQL

Make sure to use the correct `VITE_API_URL` for each environment!
