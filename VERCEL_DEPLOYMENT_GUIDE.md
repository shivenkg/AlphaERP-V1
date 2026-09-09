# Vercel Deployment Guide for AlphaERP
### Full-Stack HVAC Enterprise Resource Planning on Vercel Serverless & Edge Network

This guide covers deploying the **AlphaERP** full-stack application directly to **Vercel** with zero-friction configuration, supporting both the React 19 Vite SPA and the Node.js Express serverless API.

---

## 🚀 Quick Summary

The project is pre-configured for Vercel with:
1. **`vercel.json`**: Pre-configured rewrites, `npm run build` build command, `dist` output directory, static asset caching, and enterprise HTTP security headers.
2. **`api/index.js` (bundled from `server/api-entry.ts`)**: Serverless Function adapter routing all `/api/*` endpoints (MongoDB Atlas sync, low-stock reorder emails, health checks, backup/restore) to Vercel Serverless Functions.
3. **`dist/`**: Client SPA built with React 19 and Vite, distributed globally across Vercel's Edge CDN.

---

## Method 1: Claim Existing Live Deployment (Instant 1-Click)

When deploying anonymously via the Vercel CLI, Vercel creates a temporary deployment and issues a unique claim link:

1. Click your active claim link while logged into your Vercel account at [vercel.com](https://vercel.com).
2. Confirm the transfer to link the project permanently into your personal or team Vercel dashboard.
3. Once claimed, your project is accessible at your custom production domain (e.g. `https://hvacbiz.vercel.app`).

---

## Method 2: Deploy via GitHub (Recommended for Continuous Deployment)

This is the easiest and most robust method for production CI/CD. Every time you push code to GitHub, Vercel automatically builds and deploys your app.

### Step 1: Push / Export Code to GitHub
1. In Google AI Studio Build, open the top-right menu and export the repository to your GitHub account (e.g. `github.com/your-username/alpha-erp`).
2. Alternatively, push from terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for AlphaERP Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/alpha-erp.git
   git push -u origin main
   ```

### Step 2: Import into Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository from the list and click **"Import"**.

### Step 3: Configure Project Settings in Vercel UI
Vercel will detect the settings from `vercel.json` automatically:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `bun install` or `npm install`

### Step 4: Add Environment Variables
Under the **Environment Variables** section in the Vercel project configuration, add your secret variables:

| Variable Name | Required | Description | Example / Value |
|---|:---:|---|---|
| `NODE_ENV` | Yes | Runtime environment | `production` |
| `GEMINI_API_KEY` | Optional | Google Gemini API Key for AI estimations | `AIzaSy...` |
| `MONGODB_URI` | Optional | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/alphaerp` |
| `SMTP_HOST` | Optional | SMTP Mail Host (e.g., SendGrid, Mailtrap, Gmail) | `smtp.mailtrap.io` or `smtp.gmail.com` |
| `SMTP_PORT` | Optional | SMTP Port (587 for TLS, 465 for SSL) | `587` |
| `SMTP_USER` | Optional | SMTP Username / Account | `your_smtp_username` |
| `SMTP_PASS` | Optional | SMTP Password / App Password | `your_smtp_password` |
| `SMTP_FROM` | Optional | Outbound Email Display & Address | `"AlphaERP" <procurement@alphaerp.com>` |
| `PROCUREMENT_ALERT_EMAIL` | Optional | Default destination email for reorder indents | `procurement@yourcompany.com` |

> 💡 **MongoDB Atlas IP Whitelist Note**: In MongoDB Atlas (`cloud.mongodb.com`), navigate to **Network Access** and ensure **`0.0.0.0/0` (Allow access from anywhere)** is added so Vercel's dynamic serverless IP ranges can connect to your database.

### Step 5: Click "Deploy"
Vercel will build the frontend assets, bundle the serverless functions in `/api`, and provide you with a live URL (e.g. `https://hvacbiz.vercel.app`).

---

## Method 3: Deploy using Vercel CLI with Personal Access Token

To trigger direct CLI deployments from your local machine or container without interactive prompts:

1. **Generate a Personal Access Token**:
   - Visit [vercel.com/account/tokens](https://vercel.com/account/tokens).
   - Click **Create Token**, select your scope, and copy the token.

2. **Deploy directly with the token**:
   ```bash
   npx vercel deploy --prod --token "YOUR_VERCEL_TOKEN" --yes
   ```

3. **Or set the environment variable**:
   ```bash
   export VERCEL_TOKEN="YOUR_VERCEL_TOKEN"
   npx vercel deploy --prod --token "$VERCEL_TOKEN" --yes
   ```

---

## ⚙️ Vercel Architecture & Runtime Behavior

```
                        [ User HTTPS Request ]
                                  │
                                  ▼
                     Vercel Edge Network (Global CDN)
                     ┌────────────┬────────────┐
                     │                         │
             Static Files (/assets/*)     API Requests (/api/*)
                     │                         │
                     ▼                         ▼
             Fast Edge Cache             Vercel Serverless
             (dist/index.html)           (api/index.js)
                                               │
                         ┌─────────────────────┼─────────────────────┐
                         │                     │                     │
                         ▼                     ▼                     ▼
                  MongoDB Atlas           SMTP Mailer           Gemini AI
               (cloud.mongodb.net)    (Mailtrap/SendGrid)    (Google GenAI)
```

1. **Static Assets**: All CSS, JS, and image bundles in `dist/` are served with `Cache-Control: public, max-age=31536000, immutable`.
2. **Serverless APIs**: All requests to `/api/health`, `/api/mongodb/*`, `/api/procurement/reorder-alert-email`, and `/api/email/test-connection` execute via `api/index.js`.
3. **Email Sandbox & Live Dispatch**: The backend gracefully supports both Mailtrap dummy sandbox testing and live production SMTP relays.
4. **WebSocket Note**: Note that Gemini Live streaming voice sessions (`/live`) require a persistent duplex WebSocket connection, which is hosted on long-running containerized servers (e.g., Cloud Run or Ubuntu Systemd/PM2), while all standard REST and ERP operations run seamlessly serverless on Vercel.
