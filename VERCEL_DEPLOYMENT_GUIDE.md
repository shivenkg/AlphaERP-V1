# Vercel Deployment Guide for AlphaERP

## Full-Stack HVAC Enterprise Resource Planning on Vercel Serverless & Edge Network

**Live Production Mirror:** [https://hvacbiz.vercel.app](https://hvacbiz.vercel.app)  
**Primary Custom InsForge Domain:** [https://hvacbiz.insforge.site](https://hvacbiz.insforge.site)  
**GitHub Repository:** [https://github.com/gautam303in/AlphaERP-HVAC](https://github.com/gautam303in/AlphaERP-HVAC)  
**Target Architecture:** React 19 Client SPA + Node.js 20 Express Serverless Functions  
**Configuration File:** `vercel.json` | **Serverless Entrypoint:** `api/index.js`

---

## 🚀 Overview & Architecture

AlphaERP is architected to leverage Vercel's Global Edge Network for ultra-fast static asset delivery while routing all dynamic backend operations to lightweight, auto-scaling Serverless Functions.

```mermaid
flowchart TD
    subgraph Client["🌍 User Client Request"]
        Request["HTTPS Request to https://hvacbiz.vercel.app"]
    end

    subgraph VercelEdge["🌐 Vercel Edge Network (Global CDN)"]
        Router{"Request Route Matching"}
        StaticAssets["Static Files (/assets/*, index.html)"]
        APIRoute["API Requests (/api/*)"]
    end

    subgraph ServerlessCompute["⚙️ Vercel Serverless Execution Layer"]
        Function["Serverless Express Handler (api/index.js)"]
        HealthRoute["/api/health"]
        ProcureRoute["/api/procurement/reorder-alert-email"]
        AMCEmailRoute["/api/service/amc-expiry-alert-email"]
        EmailTestRoute["/api/email/test-connection"]
        MongoRoutes["/api/mongodb/*"]
        AdminEnvRoute["/api/admin/env*"]
        
        Function --> HealthRoute
        Function --> ProcureRoute
        Function --> AMCEmailRoute
        Function --> EmailTestRoute
        Function --> MongoRoutes
        Function --> AdminEnvRoute
    end

    subgraph CloudPersistence["☁️ External Persistence & Microservices"]
        InsForgeBaaS[("InsForge BaaS PostgreSQL (hvac-biz)")]
        MongoDB[("MongoDB Atlas Cloud Database (alphaerp)")]
        SMTP["SMTP Transporter (Gmail / SendGrid / Mailtrap)"]
        GeminiAPI["Google Gemini AI Platform"]
    end

    Request --> Router
    Router -- "/assets/* or SPA paths" --> StaticAssets
    Router -- "/api/*" --> APIRoute
    APIRoute --> Function
    Function <--> InsForgeBaaS
    MongoRoutes <--> MongoDB
    ProcureRoute --> SMTP
    AMCEmailRoute --> SMTP
    EmailTestRoute --> SMTP
    Function <--> GeminiAPI
```

---

## 📋 Pre-Configured Vercel Components

1. **`vercel.json`**:
   - Defines build script: `npm run build`
   - Defines static output directory: `dist`
   - Configures URL rewrites routing `/api/(.*)` to `/api/index` and SPA fallback routing to `/index.html`.
   - Injects enterprise HTTP security headers (`X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`).
2. **`api/index.js`** (bundled from `server/api-entry.ts`):
   - Serverless Function adapter wrapping the Express router.
   - Normalizes path parameters and executes MongoDB migrations, health checks, and email dispatches.
3. **`dist/`**:
   - Optimized React 19 SPA assets served with immutable cache-control headers across global points of presence.

---

## Method 1: Continuous Deployment via GitHub (Recommended)

### Step 1: Push Repository to GitHub

```bash
git init
git add .
git commit -m "feat: complete enterprise AlphaERP release"
git branch -M main
git remote add origin https://github.com/gautam303in/AlphaERP-HVAC.git
git push -u origin main
```

### Step 2: Import Project into Vercel

1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository from the list and click **"Import"**.

### Step 3: Configure Build & Output Settings

Vercel automatically detects settings from `vercel.json`:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Configure Environment Variables

Under the **Environment Variables** section in the Vercel dashboard, add:

| Variable Name | Required | Description | Example / Value |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | Runtime environment | `production` |
| `VITE_INSFORGE_URL` | Optional | InsForge BaaS API Endpoint | `https://as2hwz72.us-east.insforge.app` |
| `VITE_INSFORGE_ANON_KEY` | Optional | InsForge BaaS Public Client Key | `your_anon_key` |
| `GEMINI_API_KEY` | Optional | Google Gemini API Key for AI features | `AIzaSy...` |
| `MONGODB_URI` | Optional | MongoDB Atlas Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/alphaerp` |
| `SMTP_HOST` | Optional | SMTP Mail Host (e.g. Mailtrap, SendGrid, Gmail) | `smtp.mailtrap.io` |
| `SMTP_PORT` | Optional | SMTP Port (587 for TLS, 465 for SSL) | `587` |
| `SMTP_USER` | Optional | SMTP Username / Account | `your_smtp_username` |
| `SMTP_PASS` | Optional | SMTP Password / App Password | `your_smtp_password` |
| `SMTP_FROM` | Optional | Outbound Email Display & Address | `"AlphaERP" <procurement@alphaerp.com>` |
| `PROCUREMENT_ALERT_EMAIL` | Optional | Destination email for reorder indents | `procurement@yourcompany.com` |
| `SALES_ALERT_EMAIL` | Optional | Destination email for 30-day AMC expiry notices | `sales@yourcompany.com` |

> ⚠️ **MongoDB Atlas IP Whitelist Requirement**: In MongoDB Atlas (`cloud.mongodb.com`), navigate to **Network Access** and ensure **`0.0.0.0/0` (Allow access from anywhere)** is active so Vercel's dynamic serverless IP ranges can connect.

### Step 5: Deploy

Click **"Deploy"**. Vercel will build the frontend assets, bundle serverless functions, and assign your live domain: `https://hvacbiz.vercel.app`.

---

## Method 2: Instant Deployment via Vercel CLI

```bash
# 1. Login or supply token
npx vercel deploy --prod --token "$VERCEL_TOKEN" --yes
```

---

## 🔍 Verification & Health Check

```bash
# 1. Verify API Health
curl -s https://hvacbiz.vercel.app/api/health | jq .

# 2. Verify MongoDB Cluster Status
curl -s https://hvacbiz.vercel.app/api/mongodb/status | jq .

# 3. Run Automated Enterprise UAT Test Suite (24 Cases, 92 Steps)
npm run test:uat
```
