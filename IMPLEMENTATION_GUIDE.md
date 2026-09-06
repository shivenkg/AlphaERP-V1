# AlphaERP: Complete Step-by-Step Ubuntu Implementation & Deployment Guide
### Enterprise HVAC Techno-Commercial, BOQ Engineering, Multi-Tier Procurement, GAAP Accounting & HRMS Suite

---

## 1. System Architecture & Prerequisites

AlphaERP is an enterprise resource planning platform engineered specifically for commercial HVAC contractors, MEP engineering consultancies, and turnkey HVAC system integrators.

```
+-----------------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER (HTTPS)                                     |
+-----------------------------------------------------------------------------------------------+
                                               |
                                               v
+-----------------------------------------------------------------------------------------------+
|                             NGINX REVERSE PROXY (Port 80 / 443)                               |
|   - SSL / TLS Termination via Let's Encrypt Certbot                                           |
|   - Gzip Static Asset Compression & HTTP/2 Multiplexing                                       |
|   - WebSocket Upgrade Proxying & Real-Time Keepalive                                          |
+-----------------------------------------------------------------------------------------------+
                                               |
                                               v (Proxy to 127.0.0.1:3000)
+-----------------------------------------------------------------------------------------------+
|                        SYSTEMD / PM2 MANAGED APPLICATION SERVER                               |
|   - React 19 + TypeScript + Vite + Tailwind CSS Architecture                                  |
|   - Multi-Tier RBAC Authentication & Session Engine                                           |
|   - 12 Comprehensive ERP Modules (CRM, Quotes, BOQ, PR/PO, Inventory, GAAP, HRMS)             |
+-----------------------------------------------------------------------------------------------+
                                               |
                                               v
+-----------------------------------------------------------------------------------------------+
|                             POSTGRESQL 14+ DATABASE CLUSTER                                   |
|   - Database: alpha_erp_db                                                                    |
|   - 35+ Normalized Tables with Foreign Keys, Triggers, and B-Tree Indexes                     |
|   - JSONB Document Store for Dynamic Line Items, Milestones, and Audit Trails                 |
+-----------------------------------------------------------------------------------------------+
```

### Hardware Recommendations
| Deployment Scale | Concurrent Users | CPU Cores | RAM | Storage (NVMe/SSD) |
|---|---|---|---|---|
| **Development / Testing** | 1 - 5 Users | 2 vCPUs | 4 GB | 25 GB SSD |
| **Small-Medium Enterprise** | 5 - 50 Users | 4 vCPUs | 8 GB | 60 GB NVMe |
| **Large Turnkey Contractor** | 50 - 250+ Users | 8 vCPUs | 16 - 32 GB | 150 GB NVMe (RAID-10) |

### Supported Operating Systems
- **Ubuntu Linux**: 24.04 LTS, 22.04 LTS, 20.04 LTS (x86_64 and ARM64)
- **Debian GNU/Linux**: 12 (Bookworm), 11 (Bullseye)

---

## 2. One-Click Automated Setup (Fastest Method)

AlphaERP includes an automated Python 3 deployment script (`setup_ubuntu.py`) that handles all system dependencies, PostgreSQL provisioning, schema creation, seed data ingestion, Node.js installation, Nginx configuration, and Systemd service registration in a single step.

```bash
# 1. Clone repository or navigate to the workspace directory
cd /opt/alpha-erp

# 2. Run the automated deployment script as root / sudo
sudo python3 setup_ubuntu.py
```

### Customizing the Automated Script
```bash
# Custom port, domain, and database credentials:
sudo python3 setup_ubuntu.py \
  --port 3000 \
  --domain erp.yourdomain.com \
  --db-name alpha_erp_db \
  --db-user alpha_user \
  --db-password "YourStrongPassword123!"
```

---

## 3. Manual Step-by-Step Implementation Guide

If you prefer full control over every component, follow the manual steps below.

### Step 3.1: System Package Update & Tooling Installation
```bash
# Update Ubuntu package repositories
sudo apt-get update -y && sudo apt-get upgrade -y

# Install essential compilation and network utilities
sudo apt-get install -y \
  curl \
  wget \
  git \
  build-essential \
  software-properties-common \
  ca-certificates \
  gnupg \
  ufw \
  nginx \
  certbot \
  python3-certbot-nginx
```

---

### Step 3.2: Node.js 20 LTS Installation
```bash
# Add NodeSource official repository for Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js & npm
sudo apt-get install -y nodejs

# Verify installation versions
node -v   # Expected: v20.x.x
npm -v    # Expected: v10.x.x
```

---

### Step 3.3: PostgreSQL 14+ Installation & Configuration
```bash
# Install PostgreSQL and contrib extensions
sudo apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service on system boot
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### Create PostgreSQL Database & User
```bash
# Switch to the postgres system user and launch psql
sudo -u postgres psql
```

In the PostgreSQL shell, run:
```sql
-- Create dedicated application database user
CREATE USER alpha_user WITH PASSWORD 'AlphaSecurePassword2026!';

-- Create production database with UTF-8 encoding
CREATE DATABASE alpha_erp_db OWNER alpha_user ENCODING 'UTF8';

-- Grant superuser and schema creation privileges
GRANT ALL PRIVILEGES ON DATABASE alpha_erp_db TO alpha_user;
ALTER USER alpha_user WITH CREATEDB;

-- Exit psql
\q
```

---

### Step 3.4: Applying Database Schema & Sample Data

AlphaERP provides production-grade SQL scripts in the `/database` directory:
1. `database/schema.sql`: Complete DDL schema including tables, constraints, enums, triggers, and indexes.
2. `database/seed_data.sql`: Rich, realistic HVAC demo dataset (Clients, Vendors, SKUs, Quotes, Projects, BOQs, PRs, POs, GAAP Ledger, HR Employees).
3. `database/setup_postgresql.sql`: Unified master setup script.

Run the following command to initialize the schema and populate seed data:
```bash
# Run schema and seed ingestion
PGPASSWORD='AlphaSecurePassword2026!' psql -h localhost -U alpha_user -d alpha_erp_db -f database/schema.sql
PGPASSWORD='AlphaSecurePassword2026!' psql -h localhost -U alpha_user -d alpha_erp_db -f database/seed_data.sql
```

#### Verifying Database Tables
```bash
PGPASSWORD='AlphaSecurePassword2026!' psql -h localhost -U alpha_user -d alpha_erp_db -c "\dt"
```
*You will see all 35+ tables successfully created.*

---

### Step 3.5: Application Configuration & Build

```bash
# Navigate to the project root directory
cd /opt/alpha-erp

# Create production environment configuration
cat << 'EOF' > .env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://alpha_user:AlphaSecurePassword2026!@localhost:5432/alpha_erp_db
PGHOST=localhost
PGPORT=5432
PGUSER=alpha_user
PGPASSWORD=AlphaSecurePassword2026!
PGDATABASE=alpha_erp_db
EOF

# Install Node.js packages
npm install

# Run static TypeScript verification
npm run lint

# Build optimized production bundle
npm run build
```

---

### Step 3.6: Production Service Management with Systemd

Create a Systemd service unit to manage the application process with auto-restart on crashes or system reboots:

```bash
sudo tee /etc/systemd/system/alpha-erp.service > /dev/null << 'EOF'
[Unit]
Description=AlphaERP HVAC Enterprise Suite Web Service
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/alpha-erp
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=alpha-erp
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=PATH=/usr/bin:/usr/local/bin:$PATH

[Install]
WantedBy=multi-user.target
EOF
```

#### Reload & Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable alpha-erp
sudo systemctl start alpha-erp

# Verify service status
sudo systemctl status alpha-erp
```

---

### Step 3.7: Nginx Reverse Proxy & HTTP/2 Setup

Create an Nginx server block to route external HTTP/HTTPS traffic to the local application port:

```bash
sudo tee /etc/nginx/sites-available/alpha-erp > /dev/null << 'EOF'
server {
    listen 80;
    server_name erp.yourdomain.com localhost;

    client_max_body_size 50M;

    # Gzip Compression for high performance
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/json;
    gzip_disable "MSIE [1-6]\.";

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
```

#### Enable Nginx Configuration
```bash
# Enable the site
sudo ln -sf /etc/nginx/sites-available/alpha-erp /etc/nginx/sites-enabled/

# Remove default site if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 3.8: SSL / TLS Certificate Setup (Let's Encrypt)
To secure the application with free, automated SSL certificates:

```bash
# Run Certbot for Nginx (replace with your actual domain)
sudo certbot --nginx -d erp.yourdomain.com
```

Certbot will automatically modify the Nginx configuration to enforce HTTPS redirection and set up auto-renewing cron timers.

---

### Step 3.9: Firewall Configuration (UFW)
```bash
# Allow SSH access
sudo ufw allow OpenSSH

# Allow Nginx Web Traffic (Ports 80 and 443)
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw --force enable
sudo ufw status
```

---

## 4. Default Seed Personas & Access Credentials

AlphaERP supports instant authentication via **OTP (One-Time Password)** with master demo passcodes `123456` or `999999`:

| Role Persona | Staff Name | Email Address | Primary Responsibilities |
|---|---|---|---|
| **Executive / MD** | Vikram Malhotra | `vikram.m@airdynamic.com` | Full P&L, contract approvals, global override |
| **Commercial Sales** | Rajesh Sharma | `rajesh.s@airdynamic.com` | Lead CRM, site surveys, quotas, commission rules |
| **HVAC Estimator** | Ananya Deshmukh | `ananya.d@airdynamic.com` | BOQ quotation builder, margin analysis, technical sizing |
| **Procurement Head** | Karan Mehta | `karan.m@airdynamic.com` | PR review, PO generation, vendor negotiation |
| **Warehouse Storekeeper** | Suresh Kumar | `suresh.k@airdynamic.com` | Stock inwarding, SKU allocations, physical audits |
| **Finance Controller** | Pooja Iyer | `pooja.i@airdynamic.com` | Milestone invoices, GST filing, TDS, Chart of Accounts |
| **Lead Site Engineer** | Amit Verma | `amit.v@airdynamic.com` | Project execution, BOQ shortage tracking, field sign-offs |

---

## 5. Automated Backup & Disaster Recovery

### Automated PostgreSQL Backup Cron Job
To create automated daily database backups at 02:00 AM:

```bash
# Create backup directory
sudo mkdir -p /var/backups/alpha-erp
sudo chown postgres:postgres /var/backups/alpha-erp

# Add crontab entry for postgres user
sudo crontab -u postgres -e
```

Add the following line:
```cron
0 2 * * * pg_dump -U postgres alpha_erp_db | gzip > /var/backups/alpha-erp/alpha_erp_backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz && find /var/backups/alpha-erp -type f -name "*.sql.gz" -mtime +30 -delete
```

### Database Restoration Procedure
```bash
# Unpack and restore backup into PostgreSQL
gunzip < /var/backups/alpha-erp/alpha_erp_backup_YYYYMMDD_HHMMSS.sql.gz | psql -U alpha_user -d alpha_erp_db
```

---

## 6. Maintenance & Troubleshooting Runbook

### Service Management Commands
```bash
# Check application status
sudo systemctl status alpha-erp

# View live application log stream
journalctl -u alpha-erp -f

# Restart application
sudo systemctl restart alpha-erp

# Restart PostgreSQL
sudo systemctl restart postgresql

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### Troubleshooting FAQs
1. **Port 3000 already in use**:
   Check what process is bound using `sudo lsof -i :3000` or modify `PORT` in `.env` and `/etc/nginx/sites-available/alpha-erp`.
2. **PostgreSQL Connection Refused**:
   Verify PostgreSQL is running with `sudo systemctl status postgresql` and check `pg_hba.conf` to ensure local socket or password authentication is enabled.
3. **White Screen or Assets Not Loading**:
   Verify `npm run build` completed without errors and that Nginx proxy headers (`X-Forwarded-Proto`, `Host`) are properly passed.
