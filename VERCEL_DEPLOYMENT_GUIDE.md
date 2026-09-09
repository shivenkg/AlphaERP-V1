# Vercel Deployment Guide for AlphaERP

This guide covers how to deploy the **AlphaERP** full-stack application directly to **Vercel** with zero-friction configuration.

---

## 🚀 Quick Summary

The project is pre-configured for Vercel with:
1. **`vercel.json`**: Pre-configured rewrites, Vite build target, static asset caching, and security headers.
2. **`api/index.ts`**: Serverless Function adapter routing all `/api/*` endpoints (MongoDB Atlas sync, health checks, backup/restore) to Vercel Serverless.
3. **`dist/`**: Client SPA built with Vite and distributed globally across Vercel's Edge CDN.

---

## Method 1: Deploy via GitHub (Recommended for Continuous Deployment)

This is the easiest and most robust method. Every time you push code, Vercel will automatically build and deploy your app.

### Step 1: Push / Export Code to GitHub
1. In Google AI Studio Build, open the top-right menu and export or push the repository to your GitHub account (e.g. `github.com/your-username/alpha-erp`).
2. Alternatively, download the ZIP archive and push to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

### Step 2: Import into Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository from the list and click **"Import"**.

### Step 3: Configure Project Settings in Vercel UI
Vercel will detect the settings from `vercel.json` automatically:
- **Framework Preset**: Vite
- **Build Command**: `vite build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Add Environment Variables
Under the **Environment Variables** section in the Vercel project configuration, add your secret variables:

| Variable Name | Description | Example / Current Value |
|---------------|-------------|-------------------------|
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://shivenk_db_user:<password>@cluster0.5gbrhfg.mongodb.net/alphaerp?retryWrites=true&w=majority` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` (from Google AI Studio) |
| `NODE_ENV` | Runtime environment | `production` |

> 💡 **MongoDB Atlas IP Whitelist Note**: In MongoDB Atlas (`cloud.mongodb.com`), go to **Network Access** and ensure **`0.0.0.0/0` (Allow access from anywhere)** is added so Vercel's dynamic serverless IP ranges can connect to your database.

### Step 5: Click "Deploy"
Vercel will build the frontend assets, bundle the serverless functions in `/api`, and provide you with a live URL (e.g. `https://alpha-erp.vercel.app`).

---

## Method 2: Deploy using Vercel CLI (Direct Terminal Deployment)

If you have Node.js and npm installed locally on your machine:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Log In to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from Project Root**:
   ```bash
   vercel
   ```
   - When asked to link to an existing project, choose `N` (create new).
   - Confirm project name and settings (accept defaults).

4. **Add Environment Variables to Vercel**:
   ```bash
   vercel env add MONGODB_URI production
   vercel env add GEMINI_API_KEY production
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

---

## ⚙️ How the Vercel Architecture Works

```
                        [ Client Request ]
                                 │
                                 ▼
                    Vercel Edge Network (CDN)
                    ┌────────────┬────────────┐
                    │                         │
            Static Files (/assets/*)     API Requests (/api/*)
                    │                         │
                    ▼                         ▼
            Fast Edge Cache             Vercel Serverless
            (dist/index.html)           (api/index.ts)
                                              │
                                              ▼
                                       MongoDB Atlas
                                 (cluster0.5gbrhfg.mongodb.net)
```

1. **Static Assets**: All CSS, JS, and image bundles in `dist/` are served with `Cache-Control: public, max-age=31536000, immutable`.
2. **Serverless APIs**: All requests to `/api/health`, `/api/mongodb/status`, `/api/mongodb/projects`, etc. execute via `api/index.ts`.
3. **MongoDB Connection**: Connects securely to database `alphaerp` on your MongoDB Atlas cluster.
