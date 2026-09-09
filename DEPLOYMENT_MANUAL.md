# AlphaERP: Complete Enterprise Deployment Manual
### Production Deployment for Vercel Serverless, Google Cloud Run, Docker Containers, Ubuntu Linux, Systemd, PM2 & Nginx

**Document Version:** 3.5.0-Production  
**Applet URL:** [https://hvacbiz.vercel.app](https://hvacbiz.vercel.app)  
**Ingress Host & Port:** `0.0.0.0:3000` (Dedicated Server) | Vercel Serverless Edge

---

## 1. System Requirements & Architecture Topology

AlphaERP is engineered as an enterprise-grade, full-stack HVAC operations platform:
- **Frontend / Client**: React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Lucide Icons + Motion
- **Backend / API**: Node.js 20+ / Express with TypeScript bundling via esbuild
- **Persistence Options**: MongoDB Atlas (Cloud NoSQL), PostgreSQL 14+ (Relational), or browser IndexedDB cache
- **Ingress Port**: Hardcoded to **Port 3000** (Host: `0.0.0.0`) for container compatibility and reverse proxies.

```mermaid
flowchart TD
    subgraph TrafficSource["🌍 Incoming Client Traffic"]
        WebUsers["HTTPS Web Browser Traffic (Port 443)"]
        WSUsers["WSS Duplex Audio Stream (/live)"]
    end

    subgraph IngressGateway["🛡️ Ingress Gateway & Edge Network"]
        VercelCDN["Vercel Edge Global CDN"]
        NginxProxy["Nginx Reverse Proxy / Load Balancer"]
        Certbot["Let's Encrypt Automated SSL Renewal"]
        NginxProxy <--> Certbot
    end

    subgraph ExecutionLayer["⚙️ Runtime & Execution Options"]
        VercelFunc["Vercel Serverless Execution (api/index.js)"]
        DockerContainer["Docker Container (dist/server.cjs)"]
        PM2Service["Ubuntu PM2 Systemd Daemon (Port 3000)"]
    end

    subgraph PersistentBackend["☁️ Persistent Storage & AI Services"]
        MongoCluster[("MongoDB Atlas Cloud Database")]
        GoogleSheets["Google Sheets 9-Tab Real-time Engine"]
        SMTPHost["SMTP Mailer (Production / Mailtrap Sandbox)"]
        GeminiVoice["Gemini Live Duplex WebSocket Engine"]
    end

    WebUsers --> VercelCDN --> VercelFunc
    WebUsers --> NginxProxy
    WSUsers --> NginxProxy
    NginxProxy --> DockerContainer
    NginxProxy --> PM2Service
    VercelFunc <--> MongoCluster
    VercelFunc --> SMTPHost
    DockerContainer <--> MongoCluster
    DockerContainer --> SMTPHost
    DockerContainer <--> GeminiVoice
    PM2Service <--> MongoCluster
    PM2Service --> SMTPHost
    PM2Service <--> GeminiVoice
```

---

## 2. Environment Variables Specification

Declare all required variables in your runtime environment (or `.env` file):

```env
# ==============================================================================
# APPLICATION RUNTIME CONFIGURATION
# ==============================================================================
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# ==============================================================================
# CLOUD DATABASE PERSISTENCE (MONGODB ATLAS)
# ==============================================================================
MONGODB_URI=mongodb+srv://shivenk_db_user:<password>@cluster0.5gbrhfg.mongodb.net/alphaerp?retryWrites=true&w=majority

# ==============================================================================
# AI & VOICE INTELLIGENCE (GEMINI LIVE & THERMODYNAMIC REASONING)
# ==============================================================================
GEMINI_API_KEY=AIzaSy...YourGeminiApiKeyHere

# ==============================================================================
# AUTOMATED PROCUREMENT EMAIL & SMTP ALERTS (SANDBOX OR LIVE SMTP)
# ==============================================================================
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="AlphaERP Procurement" <procurement@alphaerp.com>
PROCUREMENT_ALERT_EMAIL=procurement@yourcompany.com

# ==============================================================================
# VERCEL PRODUCTION DEPLOYMENT CREDENTIALS (OPTIONAL)
# ==============================================================================
VERCEL_TOKEN=your_vercel_access_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

---

## 3. Deployment Option 1: Vercel Serverless & Edge Network (Zero Ops)

AlphaERP is pre-configured with `vercel.json` and a serverless entrypoint in `api/index.js`.

### 3.1 Automated Production Build
Running `npm run build` compiles:
1. `dist/`: High-performance static React assets served via Vercel Edge CDN.
2. `api/index.js`: Self-contained serverless bundle wrapping the Express API.
3. `dist/server.cjs`: Standalone Node.js server bundle for container runtimes.

### 3.2 Deploy via Vercel CLI
```bash
# 1. Standard production deploy
npx vercel deploy --prod --yes

# 2. Or deploy using automated token
npx vercel deploy --prod --token "$VERCEL_TOKEN" --yes
```

### 3.3 Live Production Verification
- Production Domain: `https://hvacbiz.vercel.app`
- Health Endpoint: `https://hvacbiz.vercel.app/api/health`

---

## 4. Deployment Option 2: Google Cloud Run & Docker Containers

### 4.1 Production Multi-Stage Dockerfile

```dockerfile
# Stage 1: Build & Bundle
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* bun.lock* ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Minimal Production Image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/dist/server.cjs ./dist/server.cjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
```

### 4.2 Build and Deploy to Google Cloud Run
```bash
# 1. Submit build to Google Artifact Registry
gcloud builds submit --tag gcr.io/YOUR_GCP_PROJECT_ID/alpha-erp:latest

# 2. Deploy to Cloud Run
gcloud run deploy alpha-erp \
  --image gcr.io/YOUR_GCP_PROJECT_ID/alpha-erp:latest \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production
```

---

## 5. Deployment Option 3: Ubuntu 24.04 / 22.04 LTS (Bare-Metal / VM)

### 5.1 System Setup & Node.js 20 LTS
```bash
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git build-essential nginx certbot python3-certbot-nginx

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 5.2 Build & Run with PM2
```bash
cd /opt/alpha-erp
npm ci
npm run build

# Install PM2 and launch
sudo npm install -g pm2
pm2 start dist/server.cjs --name "alpha-erp" --env production
pm2 startup systemd
pm2 save
```

### 5.3 Nginx Reverse Proxy & SSL Configuration
Create `/etc/nginx/sites-available/alpha-erp`:
```nginx
server {
    listen 80;
    server_name erp.yourdomain.com;

    client_max_body_size 50M;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and activate Let's Encrypt SSL:
```bash
sudo ln -sf /etc/nginx/sites-available/alpha-erp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d erp.yourdomain.com --non-interactive --agree-tos -m admin@yourdomain.com
```

---

## 6. Health Check & Deployment Verification

```bash
# 1. Health & Environment Status Check
curl -s https://hvacbiz.vercel.app/api/health | jq .

# 2. Test Procurement Alert Email API
curl -X POST https://hvacbiz.vercel.app/api/procurement/reorder-alert-email \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Deployment Smoke Test",
    "recipients": ["admin@yourcompany.com"],
    "smtpConfig": { "mode": "mock" }
  }'

# 3. MongoDB Cluster Connection Test
curl -s https://hvacbiz.vercel.app/api/mongodb/status | jq .
```

---

## 7. Zero-Downtime Updates & Rollbacks

```bash
cd /opt/alpha-erp
git pull origin main
npm ci
npm run build
pm2 reload alpha-erp --update-env
```
