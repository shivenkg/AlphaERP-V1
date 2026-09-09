# AlphaERP: Complete Step-by-Step Implementation & Deployment Guide
### Enterprise HVAC Techno-Commercial, BOQ Engineering, Multi-Tier Procurement, Email/SMTP Alerts, GAAP Accounting & Cloud Sync Suite

---

## 1. System Architecture & Prerequisites

AlphaERP is an enterprise resource planning platform engineered specifically for commercial HVAC contractors, MEP engineering consultancies, and turnkey HVAC system integrators.

```
+-----------------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER (HTTPS)                                     |
+-----------------------------------------------------------------------------------------------+
                                               │
                                               ▼
+-----------------------------------------------------------------------------------------------+
|                      INGRESS / EDGE ROUTING (Vercel CDN / Nginx Reverse Proxy)                |
|   - SSL / TLS Termination via Let's Encrypt / Vercel Edge                                      |
|   - Static Asset Edge Caching (React 19 + Vite 6 + Tailwind CSS v4)                           |
|   - WebSocket Proxying & Real-Time Keepalive (/live for Gemini Voice)                         |
+-----------------------------------------------------------------------------------------------+
                                               │
                                               ▼
+-----------------------------------------------------------------------------------------------+
|                       BACKEND APPLICATION ENGINE (Node.js 20+ / Express)                     |
|   - Dual Runtime: Vercel Serverless (api/index.js) & Dedicated Server (dist/server.cjs)       |
|   - 12 Core Business Modules (CRM, BOQ, PR/PO, GRN, Finance, HRMS, Audit)                     |
|   - Predictive Inventory Engine & Automated Low-Stock Email Reorder Indents                   |
|   - Gemini Live Duplex Voice Streaming & Multimodal Technical Assistants                      |
+-----------------------------------------------------------------------------------------------+
                                               │
                                               ▼
+-----------------------------------------------------------------------------------------------+
|                         STORAGE & DATA PERSISTENCE SERVICES                                  |
|   - MongoDB Atlas Cloud Database (Real-Time Bidirectional Sync & Full Backups)               |
|   - Client-Side IndexedDB / LocalStorage Multi-Tier Offline Cache                             |
|   - Google Sheets 2-Way Enterprise Synchronization Engine                                     |
|   - SMTP Relay & Dummy Sandbox Transporter (Nodemailer)                                       |
+-----------------------------------------------------------------------------------------------+
```

---

## 2. Supported Platforms & Deployment Paths

AlphaERP can be deployed in three primary modes:
1. **Vercel Serverless** (Zero ops, instant scale): Recommended for standard web access. Live at `https://hvacbiz.vercel.app`.
2. **Docker / Google Cloud Run** (Containerized): Recommended for enterprise multi-region deployments with persistent WebSocket capabilities.
3. **Ubuntu Linux 24.04 / 22.04 LTS** (Dedicated VM/Bare-Metal): Complete on-premise or cloud VM deployment.

---

## 3. Ubuntu Linux Step-by-Step Implementation

### Step 3.1: System Package Update & Tooling Installation
```bash
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git build-essential nginx certbot python3-certbot-nginx ufw
```

### Step 3.2: Node.js 20 LTS Installation
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # Expected: v20.x.x
npm -v    # Expected: v10.x.x
```

### Step 3.3: Clone Codebase & Install Dependencies
```bash
cd /opt
git clone https://github.com/YOUR_REPO/alpha-erp.git
cd /opt/alpha-erp
npm install
```

### Step 3.4: Configure Environment Variables
Create `/opt/alpha-erp/.env`:
```env
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# MongoDB Atlas Persistent Database
MONGODB_URI=mongodb+srv://shivenk_db_user:<password>@cluster0.5gbrhfg.mongodb.net/alphaerp?retryWrites=true&w=majority

# Gemini AI API Key
GEMINI_API_KEY=AIzaSy...YourGeminiApiKeyHere

# Automated Procurement Email Alerts
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="AlphaERP Procurement" <procurement@alphaerp.com>
PROCUREMENT_ALERT_EMAIL=procurement@yourcompany.com
```

### Step 3.5: Build Application
```bash
npm run build
```
This single build command compiles:
- `dist/`: Optimized Vite React 19 SPA.
- `dist/server.cjs`: Standalone bundled Express backend.
- `api/index.js`: Bundled Vercel serverless adapter.

### Step 3.6: Production Process Management (Systemd / PM2)
```bash
# Using PM2
sudo npm install -g pm2
pm2 start dist/server.cjs --name "alpha-erp" --env production
pm2 startup systemd
pm2 save
```

### Step 3.7: Nginx Reverse Proxy Configuration
Create `/etc/nginx/sites-available/alpha-erp`:
```nginx
server {
    listen 80;
    server_name erp.yourdomain.com;

    client_max_body_size 50M;
    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;

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

Enable site and activate SSL:
```bash
sudo ln -sf /etc/nginx/sites-available/alpha-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d erp.yourdomain.com
```

---

## 4. Email & SMTP System Configuration

AlphaERP includes a flexible email alerting system for low-stock inventory indents:

1. **Dummy Sandbox Mode (Default)**:
   - Built with Mailtrap/Ethereal compatibility.
   - Ideal for staging, unit testing, and preview environments.
   - Logs simulated delivery results directly to the in-app audit ledger and console.
2. **Production SMTP Relay**:
   - Easily switch between Sandbox and Production directly in the **Admin Settings > Email & Alerts Configuration** interface.
   - Supports Google Workspace (Gmail SMTP with App Password), SendGrid, Amazon SES, or Office 365.
   - Includes real-time connection testing (`POST /api/email/test-connection`).

---

## 5. Default Role Personas & Access Credentials

AlphaERP provides one-click instant persona switching and OTP master codes (`123456` or `999999`):

| Persona | Staff Name | Email Address | Department | Key Permissions |
|---|---|---|---|---|
| **Executive / MD** | Vikram Malhotra | `vikram.m@airdynamic.com` | Management | Full P&L, contract approvals, system overrides |
| **Commercial Sales** | Rajesh Sharma | `rajesh.s@airdynamic.com` | Sales & CRM | Lead qualification, quotas, site surveys |
| **HVAC Estimator** | Ananya Deshmukh | `ananya.d@airdynamic.com` | Engineering | BOQ generation, margin analysis, technical sizing |
| **Procurement Head** | Karan Mehta | `karan.m@airdynamic.com` | Supply Chain | PR review, PO creation, vendor communications |
| **Warehouse Storekeeper**| Suresh Kumar | `suresh.k@airdynamic.com` | Logistics | Stock inwarding (GRN), SKU allocations, dispatch |
| **Finance Controller** | Pooja Iyer | `pooja.i@airdynamic.com` | Accounts | Milestone billing, GST, payment receipts, GAAP ledger|
| **Lead Site Engineer** | Amit Verma | `amit.v@airdynamic.com` | Projects | Project execution, BOQ shortage cross-check, milestones |

---

## 6. Verification & Troubleshooting

1. **Check Live API Health**:
   ```bash
   curl -s https://hvacbiz.vercel.app/api/health | jq .
   ```
2. **Test SMTP Connection**:
   Navigate to **Admin Settings** in the app or send a POST request to `/api/email/test-connection`.
3. **Verify MongoDB Connection**:
   Navigate to **Database Sync** in the app or check `GET /api/mongodb/status`.
