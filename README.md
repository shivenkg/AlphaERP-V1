# AlphaERP - Enterprise HVAC Systems, Engineering & Resource Planning Suite
### Full-Lifecycle Techno-Commercial CRM, BOQ Engineering, Multi-Tier Procurement, GAAP Financials & HRMS Platform

---

## 1. Executive Summary & Enterprise Overview

**AlphaERP** is a full-lifecycle enterprise resource planning platform engineered specifically for commercial HVAC contractors, MEP (Mechanical, Electrical, Plumbing) engineering consultancies, and turnkey HVAC system integrators.

Commercial HVAC projects differ substantially from standard retail or manufacturing workflows:
1. **High-Tonnage Custom Sizing**: Thermodynamic equipment selection (Tonnage of Refrigeration - TR, CFM air flow, Static Pressure ESP, Chilled Water flow rates, ambient temperature derating).
2. **Multi-Category Bill of Quantities (BOQ)**: Complex quotations spanning heavy machinery (VRV/VRF outdoor units, modular chillers, precision AHUs), sheet metal ductwork (GI 24/22/20G), thermal/acoustic insulation (Nitrile/Glasswool), hard-drawn copper piping, motorized butterfly/modulating valves, refrigerants (R-410A/R-32), and certified field labor.
3. **Real-Time Inventory Allocation & Supply Chain Dependencies**: Equipment must be reserved or procured just-in-time from specialized OEMs (e.g., Daikin, Voltas, Blue Star, Carrier, Danfoss, Supreme, Mandev).
4. **Phased Milestone Contracting & GAAP Financials**: Commercial contracting requires milestone-based billing (30% Advance, 40% Delivery, 20% Erection, 10% Testing & Commissioning Handover) tied to double-entry accounting ledgers and tax compliance (GST & TDS).
5. **Human Capital & Field Workforce Operations**: Integrated HRMS managing 12 sub-modules (Attendance Regularization, Payroll Payslip Generation, Employee Asset Allocations, Digital Document Vault, KRA Job Requisitions, Candidate Tracking, Grievances, Travel & Per-Diem Claims, and Full & Final Settlements).

---

## 2. Complete System Architecture & Technology Stack

```
+---------------------------------------------------------------------------------------------------+
|                                      CLIENT INTERFACE LAYER                                       |
|  +---------------------------------------------------------------------------------------------+  |
|  |                 React 19 SPA + TypeScript + Tailwind CSS (Slate High-Contrast Theme)        |  |
|  |                                                                                             |  |
|  |  +---------------------+ +---------------------+ +---------------------+ +----------------+  |  |
|  |  | Executive Dashboard | | CRM & Lead Intake   | | Techno-Commercial   | | Projects & BOQ |  |  |
|  |  | (P&L, Margins, KPIs)| | (Surveys & Sizing)  | | (Margin Estimator)  | | (Shortage Calc)|  |  |
|  |  +---------------------+ +---------------------+ +---------------------+ +----------------+  |  |
|  |  +---------------------+ +---------------------+ +---------------------+ +----------------+  |  |
|  |  | Procurement Hub    | | Warehouse Inventory | | Field Work Orders   | | GAAP Financial |  |  |
|  |  | (PR -> PO Pipeline) | | (Bin Stock & Alloc) | | (Commissioning/Sign)| | (Vouchers/Ledg)|  |  |
|  |  +---------------------+ +---------------------+ +---------------------+ +----------------+  |  |
|  |  +---------------------+ +---------------------+ +---------------------+ +----------------+  |  |
|  |  | HRMS Suite (12 Mod) | | Master Data Hub     | | User Management     | | Audit Trail    |  |  |
|  |  | (Payroll, Leaves)   | | (Clients & Vendors) | | (RBAC Personas/OTP) | | (Compliance)   |  |  |
|  |  +---------------------+ +---------------------+ +---------------------+ +----------------+  |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                   |
                                                   v
+---------------------------------------------------------------------------------------------------+
|                                   SERVICES & LOGIC ENGINE LAYER                                   |
|  +-----------------------------+ +----------------------------+ +------------------------------+  |
|  |       StorageService        | |    GoogleSheetsService     | |     WhatsAppEmailService     |  |
|  |  - Reactive Pub/Sub State   | |  - GIS OAuth 2.0 Auth      | |  - WhatsApp Click-to-Chat    |  |
|  |  - Transactional Mutations  | |  - 9-Tab Data Marshaller   | |  - Mailto Communication Log  |  |
|  |  - Automated Conversions    | |  - Live GDrive Sync        | |  - Automated PDF Quotations  |  |
|  |  - Immutable Audit Logging  | |  - CSV Export Engine       | |  - Real-time Notifications   |  |
|  +-----------------------------+ +----------------------------+ +------------------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                   |
                                                   v
+---------------------------------------------------------------------------------------------------+
|                                    PERSISTENCE & DATABASE LAYER                                   |
|  +--------------------------------------------+ +----------------------------------------------+  |
|  |      PostgreSQL 14+ Relational Engine      | |          Google Workspace REST APIs          |  |
|  |  - 35+ Normalized Relational Tables        | |  - Google Sheets API v4                      |  |
|  |  - Foreign Key Constraints & Triggers      | |  - Google Drive REST API                     |  |
|  |  - B-Tree Indexes & JSONB Storage          | |  - OAuth 2.0 Security Scope                  |  |
|  +--------------------------------------------+ +----------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Database Architecture & PostgreSQL Schema

The database model provides 35+ relational tables covering the full lifecycle of HVAC contracting:

### 3.1 Entity Relationship Diagram (ERD)

```
  +------------------+          1:N          +-------------------+
  |   ClientMaster   | --------------------> |       Lead        |
  +------------------+                       +-------------------+
           | 1                                         | 1
           | 1:N                                       | 1:N
           v                                           v
  +------------------+                       +-------------------+
  |  PaymentRecord   |                       |       Quote       |
  | (Milestone/Ledg) |                       | (Techno-Comm BOQ) |
  +------------------+                       +-------------------+
           ^                                           | 1 (On Award)
           |                                           v
           | (Generates)                     +-------------------+
           +-------------------------------- |      Project      |
                                             | (Execution Engine)|
                                             +-------------------+
                                                       | 1
                                                       | 1:N
                                                       v
  +------------------+                       +-------------------+
  |  InventoryItem   | <-------------------- |   ProjectBOQItem  |
  | (Warehouse SKUs) |     (Stock Check)     | (Shortage Engine) |
  +------------------+                       +-------------------+
           ^                                           | (Shortage > 0)
           |                                           v
           | (Restocks)                      +-------------------+
           |                                 |   PurchaseReq     |
           |                                 +-------------------+
           |                                           | 1 (Converts)
           |                                           v
  +------------------+          1:N          +-------------------+
  |   VendorMaster   | <-------------------- |   PurchaseOrder   |
  +------------------+                       +-------------------+
```

### 3.2 Key Database Tables Overview

| Table Name | Purpose | Key Foreign Keys & Constraints |
|---|---|---|
| `users` | RBAC user profiles and system credentials | Unique email, role enum |
| `leads` | Inbound commercial leads & site surveys | `assigned_to` -> `sales_reps(id)` |
| `quotes` & `quote_line_items` | Techno-commercial estimates & margin analysis | `lead_id` -> `leads(id)`, cascading lines |
| `projects` & `project_boq_items`| Project tracking & real-time BOQ shortages | `quote_id` -> `quotes(id)`, `lead_id` -> `leads(id)` |
| `inventory_items` | Warehouse stock, allocations & reorder levels | Unique SKU, warehouse bin location |
| `purchase_requisitions` & `pr_items` | Deficit material indents & approvals | `project_id` -> `projects(id)` |
| `purchase_orders` & `po_items` | Vendor contracts & transit insurance | `vendor_id` -> `vendor_masters(id)`, `pr_id` |
| `vendor_masters` | OEM supplier directory & credit ratings | GSTIN, PAN, Bank Details |
| `client_masters` | Client accounts, credit limits & payment terms| GSTIN, PAN, Billing Address |
| `chart_of_accounts` | Double-entry general ledger structure | Assets, Liabilities, Equity, Revenue, COGS |
| `journal_vouchers` | GAAP accounting vouchers and balance updates | Multi-line debit/credit entries |
| `payment_records` | Milestone receivables (AR) & payables (AP) | Linked reference IDs, Tax computations |
| `employees` | Staff master records, salaries & statutory IDs | PAN, Aadhaar, Bank Details, Leave Balances |
| `departments` & `designations` | Corporate organizational hierarchy | Grade codes, salary bounds |
| `attendance_records` & `timesheets` | Biometric check-in/out & weekly project hours| Unique (emp_id, date) |
| `payroll_months` & `payslips` | Monthly compensation, PF, ESIC, TDS & PT | Itemized salary slips & Net pay in words |
| `employee_assets` & `documents` | Hardware allocation & HR verification vault | Asset tags, verification status |
| `audit_logs` | Immutable compliance trail for all transactions | Actor ID, entity type, diff payload |

---

## 4. Automated One-Click Ubuntu Setup (`setup_ubuntu.py`)

AlphaERP includes a standalone, self-contained Python 3 deployment script (`setup_ubuntu.py`) that provisions an entire Ubuntu server from bare metal to a fully running production instance.

### Automated Actions Executed by `setup_ubuntu.py`:
1. **OS Validation**: Verifies Debian/Ubuntu compatibility.
2. **System Dependencies**: Installs `curl`, `git`, `build-essential`, `postgresql`, `postgresql-contrib`, `nginx`, `certbot`, and `ufw`.
3. **Node.js Environment**: Sets up official NodeSource repository and installs **Node.js 20 LTS** and `npm`.
4. **PostgreSQL Configuration**:
   - Starts and enables PostgreSQL service.
   - Creates database user `alpha_user` with a secure password.
   - Creates database `alpha_erp_db`.
   - Executes `database/schema.sql` (all tables, triggers, and indexes).
   - Ingests `database/seed_data.sql` (sample HVAC projects, quotes, clients, inventory, and HR records).
5. **Application Setup**:
   - Generates `.env` production configuration.
   - Installs all NPM dependencies (`npm install`).
   - Compiles production static assets (`npm run build`).
6. **Systemd Service Setup**:
   - Generates and enables `/etc/systemd/system/alpha-erp.service` for 24/7 background operation with auto-restart on crashes.
7. **Nginx Reverse Proxy & Firewall**:
   - Writes `/etc/nginx/sites-available/alpha-erp` with Gzip compression and WebSocket proxying.
   - Configures UFW firewall rules for Ports 80, 443, 3000, and SSH.

### How to Run the Automated Setup:
```bash
# 1. Navigate to the application root directory
cd /opt/alpha-erp

# 2. Make the script executable
chmod +x setup_ubuntu.py

# 3. Run with sudo / root privileges
sudo python3 setup_ubuntu.py
```

#### Optional CLI Arguments:
```bash
sudo python3 setup_ubuntu.py \
  --port 3000 \
  --domain erp.yourcompany.com \
  --db-name alpha_erp_db \
  --db-user alpha_user \
  --db-password "YourSecurePassword2026!"
```

---

## 5. Manual Step-by-Step Installation on Ubuntu OS

For administrators performing manual deployments, follow the complete guide in [`IMPLEMENTATION_GUIDE.md`](./IMPLEMENTATION_GUIDE.md) or run the summary steps below:

### Step 5.1: Install System Packages
```bash
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y curl wget git build-essential postgresql postgresql-contrib nginx ufw certbot python3-certbot-nginx
```

### Step 5.2: Install Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 5.3: Configure PostgreSQL & Populate Database
```bash
# Create database user and database
sudo -u postgres psql -c "CREATE USER alpha_user WITH PASSWORD 'AlphaSecurePassword2026!' SUPERUSER CREATEDB;"
sudo -u postgres createdb -O alpha_user alpha_erp_db

# Ingest Schema and Seed Data
PGPASSWORD='AlphaSecurePassword2026!' psql -h localhost -U alpha_user -d alpha_erp_db -f database/schema.sql
PGPASSWORD='AlphaSecurePassword2026!' psql -h localhost -U alpha_user -d alpha_erp_db -f database/seed_data.sql
```

### Step 5.4: Install App Dependencies & Build
```bash
cd /opt/alpha-erp
npm install
npm run lint
npm run build
```

### Step 5.5: Start Service & Configure Nginx
```bash
# Register systemd service
sudo cp setup_files/alpha-erp.service /etc/systemd/system/ # Or use setup_ubuntu.py
sudo systemctl daemon-reload
sudo systemctl enable --now alpha-erp

# Test and reload Nginx
sudo systemctl reload nginx
```

---

## 6. Mathematical Formulas & Business Logic Engines

### 6.1 Quotation Gross Margin & Tax Formulas
For every line item $i \in \{1 \dots n\}$:
$$\text{Line Cost}_i = \text{qty}_i \times \text{unitCost}_i$$
$$\text{Line Price}_i = \text{qty}_i \times \text{unitPrice}_i$$

The quotation aggregate totals are calculated as:
$$\text{Total Raw Cost} = \sum_{i=1}^n \text{Line Cost}_i$$
$$\text{Subtotal} = \sum_{i=1}^n \text{Line Price}_i$$
$$\text{Discount Amount} = \text{Subtotal} \times \left( \frac{\text{Discount \%}}{100} \right)$$
$$\text{Taxable Revenue} = \text{Subtotal} - \text{Discount Amount}$$
$$\text{GST Amount} = \text{Taxable Revenue} \times 0.18 \quad (18\% \text{ Commercial HVAC GST})$$
$$\text{Grand Total (Quoted)} = \text{Taxable Revenue} + \text{GST Amount}$$
$$\text{Gross Margin (₹)} = \text{Taxable Revenue} - \text{Total Raw Cost}$$
$$\text{Gross Margin (\%)} = \left( \frac{\text{Gross Margin (₹)}}{\text{Taxable Revenue}} \right) \times 100$$

### 6.2 Automated BOQ Stock Shortage Evaluation
When a project is awarded from a quote:
$$\text{Available Stock} = \text{Current Physical Stock} - \text{Allocated Stock}$$
$$\text{Shortage Qty} = \max(0, \text{Required Qty} - \text{Available Stock})$$
- If $\text{Shortage Qty} > 0 \implies \text{Status} = \text{'Shortage - PR Needed'}$.
- If $\text{Shortage Qty} = 0 \implies \text{Status} = \text{'In Stock'} \land \text{Increment } \text{Allocated Stock} += \text{Required Qty}$.

---

## 7. Role-Based Access Control (RBAC) Matrix

| User Role | Leads CRM | Quotes Builder | Projects & BOQ | Procurement PR/PO | Warehouse Stock | Field Work Orders | Finance & Ledger | HRMS & Payroll | Audit Trail |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Executive / MD** | Full Access | Full Access | Full Access | Full Access & Approve | Full Access | Full Access | Full Access | Full Access | Full Access |
| **Sales Manager** | Full Access | Full Access | View Only | View Only | View Stock | View Only | View AR | View Team | View Only |
| **HVAC Estimator** | View Leads | Full Access | View BOQ | Create PR | View Stock | View Only | View Margins | Self Service | View Only |
| **Procurement Head**| View Only | View Costs | View BOQ | Full Access & PO | Manage Stock | View Only | View AP | Self Service | View Only |
| **Warehouse Keeper**| No Access | No Access | View BOQ | Inward POs | Full Access | No Access | No Access | Self Service | View Logs |
| **Finance Officer** | View Won | View Approved| View Values | View PO Totals | View Valuation | View Completed | Full Access | Payroll Admin | Full Access |
| **Lead Technician** | No Access | No Access | View Site | No Access | View Dispatched| Full Access | No Access | Self Service | Log Signoff |

---

## 8. Default System Personas (Instant Login)

The system supports instant authentication via **OTP** with master passcodes `123456` or `999999`:

- **Executive / MD**: `vikram.m@airdynamic.com`
- **Sales Manager**: `rajesh.s@airdynamic.com`
- **HVAC Estimator**: `ananya.d@airdynamic.com`
- **Procurement Manager**: `karan.m@airdynamic.com`
- **Warehouse Storekeeper**: `suresh.k@airdynamic.com`
- **Finance Controller**: `pooja.i@airdynamic.com`
- **Lead Commissioning Engineer**: `amit.v@airdynamic.com`

---

## 9. Project Directory Structure

```
alpha-erp/
|-- database/
|   |-- schema.sql                       # Complete PostgreSQL 14+ DDL Schema
|   |-- seed_data.sql                    # Production-grade HVAC Demo Seed Data
|   |-- setup_postgresql.sql             # Unified master SQL execution script
|-- setup_ubuntu.py                      # Automated Ubuntu Python 3 deployment script
|-- IMPLEMENTATION_GUIDE.md              # Detailed step-by-step Ubuntu setup guide
|-- README.md                            # Complete architecture & documentation
|-- package.json                         # NPM Dependencies & Build Scripts
|-- tsconfig.json                        # TypeScript Configuration
|-- vite.config.ts                       # Vite Bundler Configuration
|-- src/
    |-- App.tsx                          # Main Application Shell & Navigation
    |-- main.tsx                         # React 19 Mounting Entry Point
    |-- index.css                        # Tailwind CSS Global Imports
    |-- types/
    |   |-- index.ts                     # TypeScript Type Definitions & Enums
    |-- data/
    |   |-- initialData.ts               # In-memory baseline data
    |-- services/
    |   |-- storageService.ts            # Reactive Pub/Sub State & Transaction Engine
    |   |-- googleSheets.ts              # Google Identity Services & 9-Tab Sync
    |   |-- whatsappEmailService.ts      # WhatsApp & Email Dispatcher
    |-- components/
        |-- DashboardView.tsx            # Executive Management KPIs & Margins with Drag & Drop Layout
        |-- ActivityFeed.tsx             # Real-time Reactive User Activity Feed with action filtering
        |-- dashboard/
        |   |-- DashboardLayoutManagerModal.tsx # Drag & Drop layout manager, widget visibility & preset selector
        |-- CRMLeadsView.tsx             # CRM Pipeline & Site Survey Scheduler
        |-- QuotesView.tsx               # Techno-Commercial Quote Register & PDF Export
        |-- ProjectsBOQView.tsx          # Project Execution & BOQ Shortage Check
        |-- ProcurementPRPOView.tsx      # PR Approvals & PO Vendor Dispatch
        |-- InventoryWarehouseView.tsx   # Warehouse SKU Inventory & Bin Locations
        |-- WorkOrdersView.tsx           # Field Engineering, Startup & Signoff
        |-- FinancePaymentsView.tsx      # Milestone Invoicing Ledger, Cashflow & Invoice Photos
        |-- ProjectCompletionBillModal.tsx # Project Completion Billing Statement Engine
        |-- FinanceView.tsx              # GAAP Double-Entry Accounting & Vouchers
        |-- HRView.tsx                   # Human Resources Management & 12 Sub-Modules
        |-- MasterDataView.tsx           # Master Clients, Vendors & Cost Centers
        |-- UserManagementView.tsx       # RBAC User Roles & Authentication
        |-- AuditLogView.tsx             # Immutable Compliance & Event Log
        |-- Header.tsx                   # Top Bar, Persona Switcher & Notifications
        |-- Sidebar.tsx                  # Collapsible Dynamic Sidebar
        |-- finance/
        |   |-- GAAPFinancialsView.tsx   # Balance Sheet, P&L, Trial Balance, TDS
        |   |-- InvoiceCameraModal.tsx   # Live Camera Hardware Capture for Paper Invoices
        |   |-- InvoiceAttachmentGalleryModal.tsx # Invoice Attachment Gallery & Lightbox Viewer
        |-- hr/
            |-- AttendanceRegularizationView.tsx # Attendance & Check-in Tracker
            |-- EmployeeAssetsDocsView.tsx       # Asset Assignment & Document Vault
            |-- GrievanceManagementView.tsx      # Workplace Grievance Escalation
            |-- OnboardingWorkflowView.tsx       # New Hire Onboarding Steps
            |-- OrgMasterView.tsx                # Departments & Designations
            |-- PayslipModal.tsx                 # Detailed Payslip Viewer & PDF
            |-- PerformanceManagementView.tsx   # KRA Appraisals & Ratings
            |-- SelfServicePortalView.tsx        # Employee Leave Requests
            |-- TrainingTalentView.tsx           # Skill Workshops & Certifications
            |-- TravelExpensesView.tsx           # Travel & Per-Diem Expense Claims
            |-- WorkforcePlanningView.tsx        # Headcount & Job Requisitions
```

---

## 10. Verification & Quality Assurance

To verify that the application compiles and passes static analysis:

```bash
# TypeScript compiler check
npm run lint

# Production asset compilation
npm run build
```

---

## 11. Compliance & Standards
- **ASHRAE Standard 90.1 / 62.1**: HVAC Energy Efficiency & Indoor Air Quality Standards.
- **ISHRAE**: Indian Society of Heating, Refrigerating and Air Conditioning Engineers guidelines.
- **GAAP / Ind AS**: Double-entry financial accounting and revenue recognition standards.
- **GST / TDS**: Indian Statutory Indirect & Direct Tax compliance ready.
