# AlphaERP: Complete Enterprise Deployment Manual
### Production Deployment for Vercel Serverless, Google Cloud Run, Docker Containers, Ubuntu Linux, Systemd, PM2 & Nginx

---

## 1. System Requirements & Architecture

AlphaERP is architected as an enterprise-grade, full-stack HVAC operations platform:
- **Frontend / Client**: React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Lucide Icons + Motion
- **Backend / API**: Node.js 20+ / Express with TypeScript bundling via esbuild
- **Persistence Options**: MongoDB Atlas (Cloud NoSQL), PostgreSQL 14+ (Relational), or browser IndexedDB cache
- **Ingress Port**: Hardcoded to **Port 3000** (Host: `0.0.0.0`) for container compatibility and reverse proxies.

---

## 2. Environment Variables Specification

Declare all required variables in your runtime environment (or `.env` file):

```env
# Application Runtime Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Cloud Database Configuration (MongoDB Atlas)
MONGODB_URI=mongodb+srv://shivenk_db_user:<password>@cluster0.5gbrhfg.mongodb.net/alphaerp?retryWrites=true&w=majority

# AI Intelligence (Gemini Live & Vision APIs)
GEMINI_API_KEY=AIzaSy...YourGeminiApiKeyHere

# Automated Email & SMTP Dispatch (Dummy Sandbox or Production SMTP)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="AlphaERP Procurement" <procurement@alphaerp.com>
PROCUREMENT_ALERT_EMAIL=procurement@yourcompany.com

# Vercel Production Deployment Credentials (Optional)
VERCEL_TOKEN=your_vercel_access_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Optional PostgreSQL / Cloud SQL Relational Storage
DATABASE_URL=postgresql://alpha_user:YourStrongPassword123!@localhost:5432/alpha_erp_db
```

---

## 3. Deployment Option 1: Vercel Serverless & Edge Network (Zero Ops)

AlphaERP is fully configured with `vercel.json` and a dedicated serverless entrypoint in `api/index.js`.

### 3.1 Automated Production Build
Running `npm run build` generates:
1. `dist/`: High-performance static React assets served via Vercel Edge CDN.
2. `api/index.js`: Self-contained serverless bundle wrapping the Express API.
3. `dist/server.cjs`: Standalone Node.js server bundle for container runtimes.

### 3.2 Deploy via Vercel CLI
```bash
# 1. Install or run Vercel CLI
npx vercel deploy --prod --yes

# 2. Or supply token directly
npx vercel deploy --prod --token "$VERCEL_TOKEN" --yes
```

### 3.3 Live Production Verification
- Production Domain: `https://hvacbiz.vercel.app`
- Health Endpoint: `https://hvacbiz.vercel.app/api/health`

---

## 4. Deployment Option 2: Google Cloud Run & Docker Containers

### 4.1 Dockerfile
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

### 4.2 Build and Deploy to Cloud Run
```bash
# 1. Submit build to Google Artifact Registry
gcloud builds submit --tag gcr.io/your-gcp-project-id/alpha-erp:latest

# 2. Deploy to Cloud Run
gcloud run deploy alpha-erp \
  --image gcr.io/your-gcp-project-id/alpha-erp:latest \
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

### 5.1 System Setup & Node.js 20
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

### 5.3 Nginx Reverse Proxy & SSL
Create `/etc/nginx/sites-available/alpha-erp`:
```nginx
server {
    listen 80;
    server_name erp.yourdomain.com;

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
curl -I https://hvacbiz.vercel.app/api/health
```

Expected Output:
```http
HTTP/2 200 
content-type: application/json; charset=utf-8
```

---

## 7. Zero-Downtime Updates

```bash
cd /opt/alpha-erp
git pull origin main
npm ci
npm run build
pm2 reload alpha-erp --update-env
```
