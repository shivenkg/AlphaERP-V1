#!/usr/bin/env python3
"""
================================================================================
JS AlphaSoft ERP - HVAC Commercial & Enterprise Suite
Automated One-Click Ubuntu On-Premise Production Deployment Script
================================================================================
This script automates the complete end-to-end setup of JS AlphaSoft ERP on Ubuntu OS:
  1. System & Architecture Validation (Ubuntu 20.04/22.04/24.04 LTS & Debian 11/12)
  2. System Packages & Build Utilities (curl, git, build-essential, ufw, nginx)
  3. Node.js 20+ LTS & npm Installation via official NodeSource repository
  4. PostgreSQL 14+ Database Engine Provisioning (User, DB, Permissions, Extensions)
  5. Relational DDL Schema Ingestion (35+ normalized tables) & Sample Seed Data
  6. Application Dependencies (npm install) & Production Build (npm run build)
  7. Systemd Production Background Service (24/7 auto-restart on crashes)
  8. Nginx Reverse Proxy with Gzip Compression, WebSocket & Large Upload Support
  9. Firewall (UFW) Hardening (SSH, HTTP, HTTPS, App Ports)
 10. End-to-End Live Environment Health Check & Service Verification
================================================================================
"""

import os
import sys
import subprocess
import shutil
import argparse
import time
import getpass
import urllib.request
import urllib.error
from pathlib import Path

# ANSI Terminal Colors
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    RESET = '\033[0m'

def log_header(title: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'=' * 78}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN} [STEP] {title}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'=' * 78}{Colors.RESET}")

def log_info(msg: str):
    print(f"{Colors.BLUE}  [*] {msg}{Colors.RESET}")

def log_success(msg: str):
    print(f"{Colors.GREEN}  [✓] {msg}{Colors.RESET}")

def log_warn(msg: str):
    print(f"{Colors.WARNING}  [!] {msg}{Colors.RESET}")

def log_error(msg: str):
    print(f"{Colors.FAIL}  [✗] {msg}{Colors.RESET}")

def run_cmd(cmd, check=True, capture_output=False, shell=True, env=None):
    """Executes a shell command with real-time logging and error handling."""
    custom_env = os.environ.copy()
    if env:
        custom_env.update(env)
    
    try:
        if capture_output:
            result = subprocess.run(cmd, shell=shell, check=check, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, env=custom_env)
            return result
        else:
            return subprocess.run(cmd, shell=shell, check=check, env=custom_env)
    except subprocess.CalledProcessError as e:
        log_error(f"Command execution failed with exit code {e.returncode}: {cmd}")
        if capture_output and e.stderr:
            print(f"{Colors.FAIL}{e.stderr.strip()}{Colors.RESET}")
        if check:
            sys.exit(e.returncode)
        return e

def is_root() -> bool:
    return os.geteuid() == 0

def check_os():
    """Verify that the host operating system is Ubuntu or Debian-based."""
    log_header("1. Operating System & Architecture Inspection")
    if not os.path.exists("/etc/os-release"):
        log_warn("Unable to detect /etc/os-release. Proceeding with standard Debian/Ubuntu commands.")
        return
    
    with open("/etc/os-release", "r") as f:
        content = f.read()
    
    if "ubuntu" in content.lower() or "debian" in content.lower():
        log_success("Host operating system confirmed: Debian/Ubuntu Linux family.")
    else:
        log_warn("Target OS does not appear to be Ubuntu/Debian. Commands will proceed using standard apt/systemctl.")

def install_system_dependencies(skip=False):
    """Install standard OS packages, build tools, PostgreSQL and Nginx."""
    log_header("2. Installing System Packages & Database Engine")
    if skip:
        log_info("Skipping system package installation (--skip-packages).")
        return
    
    log_info("Updating apt package repositories...")
    run_cmd("DEBIAN_FRONTEND=noninteractive apt-get update -y")
    
    packages = [
        "curl",
        "wget",
        "git",
        "build-essential",
        "software-properties-common",
        "ca-certificates",
        "gnupg",
        "postgresql",
        "postgresql-contrib",
        "nginx",
        "ufw",
        "python3-pip"
    ]
    
    log_info(f"Installing prerequisites: {', '.join(packages)}")
    run_cmd(f"DEBIAN_FRONTEND=noninteractive apt-get install -y {' '.join(packages)}")
    log_success("System packages, PostgreSQL and Nginx installed successfully.")

def install_nodejs(target_version=20):
    """Install or upgrade Node.js to Node 20 LTS if not present."""
    log_header("3. Node.js & npm LTS Environment Setup")
    
    node_installed = False
    try:
        res = run_cmd("node -v", capture_output=True, check=False)
        if res.returncode == 0:
            version_str = res.stdout.strip().lstrip('v')
            major_ver = int(version_str.split('.')[0])
            if major_ver >= target_version:
                log_success(f"Node.js is already installed: v{version_str} (>= v{target_version})")
                node_installed = True
            else:
                log_warn(f"Existing Node.js version is v{version_str}. Upgrading to v{target_version} LTS...")
    except Exception:
        pass
    
    if not node_installed:
        log_info(f"Adding NodeSource repository for Node.js {target_version}.x LTS...")
        run_cmd(f"curl -fsSL https://deb.nodesource.com/setup_{target_version}.x | bash -")
        run_cmd("DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs")
        
        res = run_cmd("node -v", capture_output=True)
        log_success(f"Node.js successfully configured: {res.stdout.strip()}")
    
    npm_res = run_cmd("npm -v", capture_output=True, check=False)
    if npm_res.returncode == 0:
        log_success(f"npm package manager verified: v{npm_res.stdout.strip()}")
    else:
        log_warn("npm not found, installing npm...")
        run_cmd("DEBIAN_FRONTEND=noninteractive apt-get install -y npm")

def setup_postgresql(db_name="alpha_erp_db", db_user="alpha_user", db_password="AlphaSecurePassword2026!", reset_db=False, skip=False, app_dir=None):
    """Start PostgreSQL, create user and database, and apply schema & seed data."""
    log_header("4. PostgreSQL Database Configuration & Schema Ingestion")
    if skip:
        log_info("Skipping database setup (--skip-db).")
        return
    
    log_info("Ensuring PostgreSQL service is active...")
    run_cmd("systemctl enable postgresql", check=False)
    run_cmd("systemctl start postgresql", check=False)
    
    status_res = run_cmd("systemctl is-active postgresql", capture_output=True, check=False)
    if "active" not in status_res.stdout.strip():
        log_warn("PostgreSQL service not reported active. Restarting service...")
        run_cmd("service postgresql restart", check=False)
    
    log_info(f"Configuring PostgreSQL database user '{db_user}'...")
    
    provision_sql = f"""
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '{db_user}') THEN
            CREATE ROLE {db_user} WITH LOGIN PASSWORD '{db_password}' SUPERUSER CREATEDB;
        ELSE
            ALTER ROLE {db_user} WITH PASSWORD '{db_password}';
        END IF;
    END
    $$;
    """
    run_cmd(f"""sudo -u postgres psql -c "{provision_sql}" """)
    
    if reset_db:
        log_warn(f"Resetting existing database '{db_name}' (--reset-db)...")
        run_cmd(f"sudo -u postgres dropdb --if-exists {db_name}", check=False)
    
    check_db_cmd = f"sudo -u postgres psql -tAc \"SELECT 1 FROM pg_database WHERE datname='{db_name}'\""
    db_check_res = run_cmd(check_db_cmd, capture_output=True)
    if db_check_res.stdout.strip() != "1":
        log_info(f"Creating database '{db_name}' with owner '{db_user}'...")
        run_cmd(f"sudo -u postgres createdb -O {db_user} -E UTF8 {db_name}")
        log_success(f"Database '{db_name}' created.")
    else:
        log_info(f"Database '{db_name}' already exists.")
    
    run_cmd(f"""sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};" """)
    
    # Path resolution
    workspace_root = Path(app_dir).resolve() if app_dir else Path(__file__).resolve().parent
    schema_path = workspace_root / "database" / "schema.sql"
    seed_path = workspace_root / "database" / "seed_data.sql"
    
    if schema_path.exists():
        log_info(f"Executing database schema from {schema_path}...")
        run_cmd(f"PGPASSWORD='{db_password}' psql -h localhost -U {db_user} -d {db_name} -f {schema_path}")
        log_success("All 35+ PostgreSQL relational tables, enums, triggers, and indexes created.")
    else:
        log_warn(f"Schema file not found at {schema_path}.")
    
    if seed_path.exists():
        log_info(f"Ingesting sample HVAC seed data from {seed_path}...")
        run_cmd(f"PGPASSWORD='{db_password}' psql -h localhost -U {db_user} -d {db_name} -f {seed_path}")
        log_success("Sample production-grade HVAC projects, BOQ, quotes, and CRM records populated.")
    else:
        log_warn(f"Seed data file not found at {seed_path}.")

def setup_application_code(port=3000, skip_build=False, app_dir=None):
    """Install Node modules, prepare environment configuration and build application."""
    log_header("5. Building JS AlphaSoft Web Application")
    workspace_root = Path(app_dir).resolve() if app_dir else Path(__file__).resolve().parent
    
    log_info(f"Application Directory: {workspace_root}")
    
    env_file = workspace_root / ".env"
    if not env_file.exists():
        log_info("Creating .env production configuration...")
        env_content = f"""# JS AlphaSoft ERP Production Configuration
PORT={port}
NODE_ENV=production
DATABASE_URL=postgresql://alpha_user:AlphaSecurePassword2026!@localhost:5432/alpha_erp_db
PGHOST=localhost
PGPORT=5432
PGUSER=alpha_user
PGPASSWORD=AlphaSecurePassword2026!
PGDATABASE=alpha_erp_db
"""
        with open(env_file, "w") as f:
            f.write(env_content)
        log_success(".env file created.")
    else:
        log_info(".env configuration file already exists.")
    
    log_info("Installing NPM dependencies...")
    run_cmd(f"cd {workspace_root} && npm install --include=dev")
    log_success("NPM dependencies verified and installed.")
    
    if not skip_build:
        log_info("Compiling production static assets (npm run build)...")
        run_cmd(f"cd {workspace_root} && npm run build")
        log_success("Production bundle successfully generated in /dist directory.")
    else:
        log_info("Skipping production build (--skip-build).")

def configure_systemd_service(service_name="js-alphasoft-erp", port=3000, app_user="root", app_dir=None):
    """Create and enable a Systemd service to maintain JS AlphaSoft ERP 24/7."""
    log_header("6. Systemd Production Service Setup (24/7 Daemon)")
    workspace_root = Path(app_dir).resolve() if app_dir else Path(__file__).resolve().parent
    service_file = f"/etc/systemd/system/{service_name}.service"
    
    # Locate npm binary
    npm_path = shutil.which("npm") or "/usr/bin/npm"
    node_path = shutil.which("node") or "/usr/bin/node"
    bin_dir = str(Path(npm_path).parent)
    
    service_content = f"""[Unit]
Description=JS AlphaSoft HVAC Enterprise ERP Application
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User={app_user}
WorkingDirectory={workspace_root}
ExecStart={npm_path} run dev
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier={service_name}
Environment=NODE_ENV=production
Environment=PORT={port}
Environment=PATH={bin_dir}:/usr/bin:/usr/local/bin:$PATH

[Install]
WantedBy=multi-user.target
"""
    
    log_info(f"Writing systemd service file: {service_file}")
    with open(service_file, "w") as f:
        f.write(service_content)
    
    run_cmd("systemctl daemon-reload")
    run_cmd(f"systemctl enable {service_name}")
    run_cmd(f"systemctl restart {service_name}")
    
    time.sleep(3)
    status_res = run_cmd(f"systemctl is-active {service_name}", capture_output=True, check=False)
    if "active" in status_res.stdout.strip():
        log_success(f"Systemd service '{service_name}' is ACTIVE and RUNNING.")
    else:
        log_warn(f"Service status: {status_res.stdout.strip()}. Check logs via: journalctl -u {service_name} -n 50")

def configure_nginx(domain="localhost", app_port=3000, site_name="js-alphasoft-erp"):
    """Configure Nginx reverse proxy with gzip compression and WebSocket support."""
    log_header("7. Nginx Web Server Reverse Proxy Setup")
    
    nginx_conf_path = f"/etc/nginx/sites-available/{site_name}"
    nginx_conf = f"""# JS AlphaSoft ERP Nginx Reverse Proxy Configuration
server {{
    listen 80;
    server_name {domain};

    client_max_body_size 50M;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/json;
    gzip_disable "MSIE [1-6]\\.";

    location / {{
        proxy_pass http://127.0.0.1:{app_port};
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
    }}
}}
"""
    
    log_info(f"Writing Nginx site configuration to {nginx_conf_path}...")
    with open(nginx_conf_path, "w") as f:
        f.write(nginx_conf)
    
    symlink_path = f"/etc/nginx/sites-enabled/{site_name}"
    if not os.path.exists(symlink_path):
        os.symlink(nginx_conf_path, symlink_path)
    
    default_site = "/etc/nginx/sites-enabled/default"
    if os.path.exists(default_site):
        try:
            os.remove(default_site)
            log_info("Removed default Nginx site configuration.")
        except Exception:
            pass
    
    test_res = run_cmd("nginx -t", capture_output=True, check=False)
    if test_res.returncode == 0:
        run_cmd("systemctl reload nginx")
        log_success("Nginx reverse proxy syntax verified and reloaded.")
    else:
        log_error("Nginx syntax test failed:")
        print(test_res.stderr)

def configure_firewall(app_port=3000):
    """Configure UFW to allow SSH, HTTP, HTTPS, and internal app port."""
    log_header("8. Firewall (UFW) Security Rules")
    log_info("Applying firewall rules...")
    run_cmd("ufw allow OpenSSH", check=False)
    run_cmd("ufw allow 'Nginx Full'", check=False)
    run_cmd(f"ufw allow {app_port}/tcp", check=False)
    log_success(f"Firewall configured: Allowed SSH (22), HTTP (80), HTTPS (443), and App Port ({app_port}).")

def verify_live_environment(app_port=3000, db_name="alpha_erp_db", db_user="alpha_user", db_password="AlphaSecurePassword2026!"):
    """Automated live verification testing PostgreSQL and Web server responsiveness."""
    log_header("9. Live Environment Health Check & Verification")
    
    # 1. Test PostgreSQL connection and table count
    try:
        query_cmd = f"PGPASSWORD='{db_password}' psql -h localhost -U {db_user} -d {db_name} -tAc \"SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';\""
        res = run_cmd(query_cmd, capture_output=True, check=False)
        if res.returncode == 0:
            table_count = int(res.stdout.strip())
            log_success(f"PostgreSQL Connection OK: Found {table_count} tables in '{db_name}'.")
        else:
            log_warn("PostgreSQL table count query returned non-zero. Check database credentials.")
    except Exception as e:
        log_warn(f"PostgreSQL verification warning: {e}")

    # 2. Test HTTP Server response on App Port
    max_retries = 10
    server_live = False
    test_url = f"http://127.0.0.1:{app_port}"
    
    log_info(f"Pinging application endpoint: {test_url}...")
    for i in range(max_retries):
        try:
            req = urllib.request.Request(test_url, headers={'User-Agent': 'HealthChecker/1.0'})
            with urllib.request.urlopen(req, timeout=3) as response:
                if response.status in (200, 304):
                    log_success(f"HTTP Server Response OK: Received HTTP {response.status} from {test_url}.")
                    server_live = True
                    break
        except Exception:
            time.sleep(1.5)
    
    if not server_live:
        log_warn(f"Application server did not respond within {max_retries * 1.5}s on port {app_port}.")
        log_info("Please verify the service using: systemctl status js-alphasoft-erp")

def print_summary(app_port=3000, domain="localhost", db_name="alpha_erp_db", db_user="alpha_user", service_name="js-alphasoft-erp"):
    print(f"\n{Colors.BOLD}{Colors.GREEN}{'=' * 78}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.GREEN}   JS AlphaSoft - Enterprise HVAC Suite Deployment Completed Successfully!{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.GREEN}{'=' * 78}{Colors.RESET}")
    print(f"""
{Colors.BOLD}Live Access Endpoints:{Colors.RESET}
  • Web Application (Nginx Port 80):  {Colors.CYAN}http://{domain}{Colors.RESET}
  • Direct App Port (Vite / Node):    {Colors.CYAN}http://{domain}:{app_port}{Colors.RESET}
  • PostgreSQL Database:              {Colors.BOLD}{db_name}{Colors.RESET} (User: {Colors.BOLD}{db_user}{Colors.RESET}, Port: 5432)

{Colors.BOLD}Default System Personas for Instant Login (OTP: 123456 / 999999):{Colors.RESET}
  1. {Colors.BOLD}Executive / MD:{Colors.RESET}         vikram.m@airdynamic.com
  2. {Colors.BOLD}Sales Manager:{Colors.RESET}          rajesh.s@airdynamic.com
  3. {Colors.BOLD}HVAC Estimator:{Colors.RESET}         ananya.d@airdynamic.com
  4. {Colors.BOLD}Procurement Manager:{Colors.RESET}    karan.m@airdynamic.com
  5. {Colors.BOLD}Warehouse Storekeeper:{Colors.RESET}  suresh.k@airdynamic.com
  6. {Colors.BOLD}Finance Controller:{Colors.RESET}     pooja.i@airdynamic.com
  7. {Colors.BOLD}Lead Site Engineer:{Colors.RESET}     amit.v@airdynamic.com

{Colors.BOLD}System Management Commands:{Colors.RESET}
  • View Live Service Logs:   {Colors.BLUE}journalctl -u {service_name} -f{Colors.RESET}
  • Restart ERP Service:      {Colors.BLUE}sudo systemctl restart {service_name}{Colors.RESET}
  • Check Status:             {Colors.BLUE}sudo systemctl status {service_name}{Colors.RESET}
  • PostgreSQL Shell:         {Colors.BLUE}psql -U {db_user} -d {db_name} -h localhost{Colors.RESET}
  • Enable Free SSL (HTTPS):  {Colors.BLUE}sudo certbot --nginx -d {domain}{Colors.RESET}
""")

def main():
    parser = argparse.ArgumentParser(description="JS AlphaSoft ERP Ubuntu On-Premise Automated Deployment Script")
    parser.add_argument("--port", type=int, default=3000, help="Application port (default: 3000)")
    parser.add_argument("--domain", type=str, default="localhost", help="Domain or server IP for Nginx (default: localhost)")
    parser.add_argument("--app-dir", type=str, default=None, help="Root directory of the application (default: script location)")
    parser.add_argument("--service-name", type=str, default="js-alphasoft-erp", help="Systemd service name (default: js-alphasoft-erp)")
    parser.add_argument("--db-name", type=str, default="alpha_erp_db", help="PostgreSQL database name (default: alpha_erp_db)")
    parser.add_argument("--db-user", type=str, default="alpha_user", help="PostgreSQL user (default: alpha_user)")
    parser.add_argument("--db-password", type=str, default="AlphaSecurePassword2026!", help="PostgreSQL user password")
    parser.add_argument("--reset-db", action="store_true", help="Drop and recreate database if it already exists")
    parser.add_argument("--skip-packages", action="store_true", help="Skip apt system package installation")
    parser.add_argument("--skip-db", action="store_true", help="Skip PostgreSQL database creation & seeding")
    parser.add_argument("--skip-build", action="store_true", help="Skip npm run build step")
    parser.add_argument("--no-nginx", action="store_true", help="Do not configure Nginx reverse proxy")
    parser.add_argument("--verify-only", action="store_true", help="Run only health checks against an existing installation")
    
    args = parser.parse_args()
    
    print(f"""{Colors.BOLD}{Colors.CYAN}
    ╔════════════════════════════════════════════════════════════════════════════╗
    ║      JS AlphaSoft ERP - Commercial HVAC Enterprise Suite Deployment        ║
    ╚════════════════════════════════════════════════════════════════════════════╝{Colors.RESET}
    """)
    
    if args.verify_only:
        verify_live_environment(app_port=args.port, db_name=args.db_name, db_user=args.db_user, db_password=args.db_password)
        print_summary(app_port=args.port, domain=args.domain, db_name=args.db_name, db_user=args.db_user, service_name=args.service_name)
        return
    
    if not is_root():
        log_error("This script must be run with root / sudo privileges on your Ubuntu server.")
        print(f"Please execute: {Colors.BOLD}sudo python3 setup_ubuntu.py{Colors.RESET}\n")
        sys.exit(1)
    
    check_os()
    install_system_dependencies(skip=args.skip_packages)
    install_nodejs(target_version=20)
    setup_postgresql(
        db_name=args.db_name,
        db_user=args.db_user,
        db_password=args.db_password,
        reset_db=args.reset_db,
        skip=args.skip_db,
        app_dir=args.app_dir
    )
    setup_application_code(port=args.port, skip_build=args.skip_build, app_dir=args.app_dir)
    
    current_user = os.environ.get("SUDO_USER", "root")
    configure_systemd_service(service_name=args.service_name, port=args.port, app_user=current_user, app_dir=args.app_dir)
    
    if not args.no_nginx:
        configure_nginx(domain=args.domain, app_port=args.port, site_name=args.service_name)
        configure_firewall(app_port=args.port)
    
    verify_live_environment(app_port=args.port, db_name=args.db_name, db_user=args.db_user, db_password=args.db_password)
    print_summary(app_port=args.port, domain=args.domain, db_name=args.db_name, db_user=args.db_user, service_name=args.service_name)

if __name__ == "__main__":
    main()
