# AlphaERP: Complete Enterprise Deployment Manual
### Production Deployment for Google Cloud Run, Docker Containers, Ubuntu Linux, Systemd, PM2 & Nginx

---

## 1. System Requirements & Architecture

AlphaERP is architected as a high-performance, full-stack enterprise web application:
- **Frontend / Client**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Motion
- **Backend / API**: Node.js 20+ / Express with TypeScript type stripping & Vite SPA fallback middleware
- **Database**: PostgreSQL 14+ (or Cloud SQL / Firestore persistent storage)
- **Ingress Port**: Hardcoded to **Port 3000** (Host: `0.0.0.0`) for container compatibility and Nginx reverse proxy.

---

## 2. Environment Variables Specification

Declare all required variables in your runtime environment (or `.env` file):

```env
# Application Runtime Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration (PostgreSQL / Cloud SQL)
DATABASE_URL=postgresql://alpha_user:YourStrongPassword123!@localhost:5432/alpha_erp_db
PGHOST=localhost
PGPORT=5432
PGDATABASE=alpha_erp_db
PGUSER=alpha_user
PGPASSWORD=YourStrongPassword123!

# AI Intelligence (Gemini API)
GEMINI_API_KEY=AIzaSy...YourGeminiApiKeyHere

# WhatsApp Cloud API / Webhook Integration
WHATSAPP_PHONE_NUMBER_ID=109283746592837
WHATSAPP_ACCESS_TOKEN=EAAB...YourMetaAccessToken
WHATSAPP_WEBHOOK_VERIFY_TOKEN=AlphaERP_Verify_Token_2026

# Google Sheets API Integration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

---

## 3. Deployment Method A: Google Cloud Run / Containerized Docker

### 3.1 Dockerfile
Create a production-grade `Dockerfile` in the project root:

```dockerfile
# Stage 1: Build & Bundle
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lock* package-lock.json* ./
RUN npm ci

# Copy source files
COPY . .

# Build Vite frontend and bundle Express server
RUN npm run build

# Stage 2: Minimal Production Image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built artifacts from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start bundled production server
CMD ["node", "dist/server.cjs"]
```

### 3.2 Build and Deploy to Google Cloud Run
```bash
# 1. Set Google Cloud Project
gcloud config set project your-gcp-project-id

# 2. Build container with Google Cloud Build
gcloud builds submit --tag gcr.io/your-gcp-project-id/alpha-erp:v3.4

# 3. Deploy to Cloud Run (Port 3000, 1GB RAM, Auto-scaling 1-10 instances)
gcloud run deploy alpha-erp \
  --image gcr.io/your-gcp-project-id/alpha-erp:v3.4 \
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

## 4. Deployment Method B: Ubuntu 24.04 / 22.04 LTS (Bare-Metal / VM)

### Step 4.1: Automated Setup
Run the included Python 3 deployment engine:
```bash
sudo python3 setup_ubuntu.py --port 3000 --domain erp.yourdomain.com
```

### Step 4.2: Manual Setup

#### 1. System Dependencies & Node.js 20
```bash
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git build-essential nginx certbot python3-certbot-nginx postgresql postgresql-contrib

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. PostgreSQL Provisioning & Schema Ingestion
```bash
# Create database and user
sudo -u postgres psql -c "CREATE USER alpha_user WITH ENCRYPTED PASSWORD 'YourStrongPassword123!';"
sudo -u postgres psql -c "CREATE DATABASE alpha_erp_db OWNER alpha_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE alpha_erp_db TO alpha_user;"

# Ingest schema and initial data
psql -h localhost -U alpha_user -d alpha_erp_db -f /opt/alpha-erp/database/init.sql
```

#### 3. Build Application
```bash
cd /opt/alpha-erp
npm ci
npm run build
```

#### 4. PM2 Process Manager Service
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start server with PM2
pm2 start dist/server.cjs --name "alpha-erp" --env production

# Setup startup hook
pm2 startup systemd
pm2 save
```

#### 5. Nginx Reverse Proxy Configuration
Create `/etc/nginx/sites-available/alpha-erp`:

```nginx
server {
    listen 80;
    server_name erp.yourdomain.com;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
}
```

Enable site and obtain SSL/TLS certificate:
```bash
sudo ln -s /etc/nginx/sites-available/alpha-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Issue Let's Encrypt SSL
sudo certbot --nginx -d erp.yourdomain.com --non-interactive --agree-tos -m admin@yourdomain.com
```

---

## 5. Health Check & Deployment Verification

Verify your live deployment with the automated health endpoint:

```bash
curl -I https://erp.yourdomain.com/api/health
```

Expected Output:
```http
HTTP/2 200 
content-type: application/json; charset=utf-8
```

---

## 6. Zero-Downtime Rolling Update Procedure

To update a live production instance:
```bash
cd /opt/alpha-erp
git pull origin main
npm ci
npm run build
pm2 reload alpha-erp --update-env
```
