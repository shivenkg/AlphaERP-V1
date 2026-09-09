# AlphaERP - Enterprise HVAC Systems, Engineering & Resource Planning Suite
### Full-Lifecycle Techno-Commercial CRM, BOQ Engineering, Multi-Tier Procurement, Automated Email Indents, GAAP Financials & HRMS Platform

**Live Production Deployment**: [https://hvacbiz.vercel.app](https://hvacbiz.vercel.app)  
**Version**: 3.5.0-Production  
**Framework**: React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Express & Vercel Serverless

---

## 1. Executive Summary & Enterprise Overview

**AlphaERP** is a full-lifecycle enterprise resource planning platform engineered specifically for commercial HVAC contractors, MEP (Mechanical, Electrical, Plumbing) engineering consultancies, and turnkey HVAC system integrators.

Commercial HVAC projects require specialized workflows:
1. **High-Tonnage Custom Sizing**: Thermodynamic equipment selection (Tonnage of Refrigeration - TR, CFM air flow, Static Pressure ESP, Chilled Water flow rates, ambient temperature derating).
2. **Multi-Category Bill of Quantities (BOQ)**: Complex quotations spanning heavy machinery (VRV/VRF outdoor units, modular chillers, precision AHUs), sheet metal ductwork (GI 24/22/20G), thermal/acoustic insulation (Nitrile/Glasswool), hard-drawn copper piping, motorized butterfly/modulating valves, refrigerants (R-410A/R-32), and certified field labor.
3. **Real-Time Inventory Allocation & Predictive Procurement**: Equipment must be reserved or procured just-in-time from specialized OEMs. When stock falls below safety levels, the system automatically dispatches email indents to procurement officers.
4. **Phased Milestone Contracting & GAAP Financials**: Commercial contracting requires milestone-based billing (30% Advance, 40% Delivery, 20% Erection, 10% Testing & Commissioning Handover) tied to double-entry accounting ledgers and tax compliance (GST & TDS).
5. **Human Capital & Field Workforce Operations**: Integrated HRMS managing 12 sub-modules (Attendance Regularization, Payroll Payslip Generation, Employee Asset Allocations, Digital Document Vault, KRA Job Requisitions, Candidate Tracking, Grievances, Travel & Per-Diem Claims, and Full & Final Settlements).
6. **Live Multi-Cloud Persistence & AI Voice Interaction**: Native bidirectional sync with MongoDB Atlas, Google Sheets enterprise export, and real-time duplex voice assistance via Gemini Live API.

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
|  |  | HRMS Suite (12 Mod) | | Predictive Reorder  | | Email / SMTP Config | | MongoDB Sync   |  |  |
|  |  | (Payroll, Leaves)   | | (Auto Email Indent) | | (Sandbox / Live Rel)| | (Cloud Backup) |  |  |
|  |  +---------------------+ +---------------------+ +---------------------+ +----------------+  |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                   │
                                                   ▼
+---------------------------------------------------------------------------------------------------+
|                                   SERVICES & LOGIC ENGINE LAYER                                   |
|  +-----------------------------+ +----------------------------+ +------------------------------+  |
|  |       StorageService        | |    GoogleSheetsService     | |     WhatsAppEmailService     |  |
|  |  - Reactive Pub/Sub State   | |  - GIS OAuth 2.0 Auth      | |  - WhatsApp Click-to-Chat    |  |
|  |  - Transactional Mutations  | |  - 9-Tab Data Marshaller   | |  - Automated SMTP Transporter|  |
|  |  - Automated Conversions    | |  - Live GDrive Sync        | |  - Dummy Sandbox Testing     |  |
|  |  - Immutable Audit Logging  | |  - CSV Export Engine       | |  - Critical Reorder Indents  |  |
|  +-----------------------------+ +----------------------------+ +------------------------------+  |
+---------------------------------------------------------------------------------------------------+
                                                   │
                                                   ▼
+---------------------------------------------------------------------------------------------------+
|                                    PERSISTENCE & RUNTIME LAYER                                    |
|  +--------------------------------------------+ +----------------------------------------------+  |
|  |       Vercel Serverless / Cloud Run        | |             Cloud Databases                  |  |
|  |  - Vercel Serverless Adapter (api/index.js)| |  - MongoDB Atlas Cloud DB (alphaerp)         |  |
|  |  - Standalone Node Server (dist/server.cjs)| |  - Google Sheets API v4 Sync                 |  |
|  |  - Gemini Live Duplex WebSocket (/live)   | |  - PostgreSQL 14+ Relational Schemas         |  |
|  +--------------------------------------------+ +----------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Key Operational Modules

### 3.1 Techno-Commercial CRM & Quotation Estimator
- Lead qualification with cooling tonnage (TR), static pressure, and CFM requirements.
- Automated HVAC bill of quantities with margin analysis, freight/labor allowances, and 18% statutory GST.
- Single-click quote award automatically initializes an active project with synchronized BOQ line items.

### 3.2 Predictive Inventory & Automated Email Indents
- Real-time comparison of `availableStock` against configured `reorderThreshold`.
- **Predictive Inventory Reorder Panel**: Highlights critical shortages and calculates suggested replenishment indents.
- **Automated Email Dispatch**: Sends itemized procurement notifications via SMTP.
- **Admin Configuration Interface**: Allows switching between Mailtrap/Ethereal Dummy Sandbox testing and live production SMTP relays (Google Workspace, SendGrid, Amazon SES) with connection testing.

### 3.3 Procurement Pipeline & GRN Inwarding
- Purchase Requisition (PR) generation directly from project BOQ deficit items.
- Multi-tier approval workflow with financial sign-off before vendor PO release.
- Warehouse Goods Receipt Note (GRN) inwarding automatically replenishes stock and resolves active project BOQ shortages.

### 3.4 MongoDB Atlas Cloud Database Synchronization
- Seamless cloud synchronization of projects, quotes, leads, and inventory items.
- Connection health diagnostics and full database export/import migrations via `/api/mongodb/*`.

### 3.5 Gemini Live Real-Time Duplex Voice Assistant
- Interactive voice assistant running over duplex WebSocket (`ws://<host>/live`).
- Provides real-time technical answers on HVAC thermodynamics, refrigerant pressures, and BOQ items.

---

## 4. Mathematical Sizing & HVAC Contracting Formulations

### 4.1 Quotation & Financial Calculations
$$\text{Subtotal} = \sum_{i=1}^n \text{Line Price}_i$$
$$\text{Taxable Revenue} = \text{Subtotal} - \text{Discount}$$
$$\text{GST Amount} = \text{Taxable Revenue} \times 0.18 \quad (18\% \text{ Commercial HVAC GST})$$
$$\text{Grand Total (Quoted)} = \text{Taxable Revenue} + \text{GST Amount}$$
$$\text{Gross Margin (₹)} = \text{Taxable Revenue} - \text{Total Raw Cost}$$
$$\text{Gross Margin (\%)} = \left( \frac{\text{Gross Margin (₹)}}{\text{Taxable Revenue}} \right) \times 100$$

### 4.2 Automated BOQ Stock Shortage Evaluation
When a project is awarded:
$$\text{Available Stock} = \text{Current Physical Stock} - \text{Allocated Stock}$$
$$\text{Shortage Qty} = \max(0, \text{Required Qty} - \text{Available Stock})$$

---

## 5. Role-Based Access Control (RBAC) Matrix

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

## 6. Default System Personas (Instant Login)

The system supports instant authentication via **OTP** with master passcodes `123456` or `999999`:

- **Executive / MD**: `vikram.m@airdynamic.com`
- **Sales Manager**: `rajesh.s@airdynamic.com`
- **HVAC Estimator**: `ananya.d@airdynamic.com`
- **Procurement Manager**: `karan.m@airdynamic.com`
- **Warehouse Storekeeper**: `suresh.k@airdynamic.com`
- **Finance Controller**: `pooja.i@airdynamic.com`
- **Lead Commissioning Engineer**: `amit.v@airdynamic.com`

---

## 7. Project Directory Structure

```
alpha-erp/
|-- api/
|   |-- index.ts                         # Vercel Serverless Function entry point
|-- server/
|   |-- app.ts                           # Express application & REST API routes
|   |-- api-entry.ts                     # Bundling entry for Vercel Serverless
|   |-- mongodb.ts                       # MongoDB Atlas connection manager
|-- server.ts                            # Dedicated Node entrypoint & WebSocket server
|-- vercel.json                          # Vercel deployment configuration
|-- database/
|   |-- schema.sql                       # Complete PostgreSQL 14+ DDL Schema
|   |-- seed_data.sql                    # Production-grade HVAC Demo Seed Data
|-- package.json                         # NPM Dependencies & Build Scripts
|-- vite.config.ts                       # Vite Bundler Configuration
|-- src/
    |-- App.tsx                          # Main Application Shell & Navigation
    |-- main.tsx                         # React 19 Mounting Entry Point
    |-- index.css                        # Tailwind CSS Global Imports
    |-- types/
    |   |-- index.ts                     # TypeScript Type Definitions & Enums
    |-- services/
    |   |-- storageService.ts            # Reactive Pub/Sub State & Transaction Engine
    |   |-- googleSheets.ts              # Google Identity Services & 9-Tab Sync
    |   |-- whatsappEmailService.ts      # WhatsApp & Automated SMTP Alerts Dispatcher
    |-- components/
        |-- DashboardView.tsx            # Executive Management KPIs & Margins
        |-- ActivityFeed.tsx             # Real-time Reactive User Activity Feed
        |-- CRMLeadsView.tsx             # CRM Pipeline & Site Survey Scheduler
        |-- QuotesView.tsx               # Techno-Commercial Quote Register & Pricing
        |-- ProjectsBOQView.tsx          # Project Execution & BOQ Shortage Check
        |-- ProcurementPRPOView.tsx      # PR Approvals & PO Vendor Dispatch
        |-- InventoryWarehouseView.tsx   # Warehouse SKU Inventory & Bin Locations
        |-- PredictiveInventoryReorderPanel.tsx # Low Stock Reorder & Email Indents
        |-- WorkOrdersView.tsx           # Field Engineering, Startup & Signoff
        |-- FinancePaymentsView.tsx      # Milestone Invoicing Ledger & Receipts
        |-- FinanceView.tsx              # GAAP Double-Entry Accounting & Vouchers
        |-- HRView.tsx                   # Human Resources Management & 12 Sub-Modules
        |-- EmailSettingsAdminSection.tsx# SMTP Credentials & Dummy Sandbox Settings
        |-- LiveAudioAssistantModal.tsx  # Gemini Live Real-Time Duplex Voice Assistant
        |-- MongoSyncModal.tsx           # MongoDB Atlas Bidirectional Cloud Sync
        |-- UserManagementView.tsx       # RBAC User Roles & Authentication
        |-- AuditLogView.tsx             # Immutable Compliance & Event Log
```

---

## 8. Deployment & Build Instructions

### 8.1 Production Build
```bash
npm run build
```
This builds:
1. `dist/`: Optimized Vite React SPA.
2. `dist/server.cjs`: Self-contained CommonJS server bundle for Node/Docker/Cloud Run.
3. `api/index.js`: Self-contained serverless bundle for Vercel.

### 8.2 Live Vercel Deployment
```bash
# Automated Vercel deployment with Personal Access Token
npx vercel deploy --prod --token "$VERCEL_TOKEN" --yes
```

### 8.3 Containerized / Ubuntu Deployment
Refer to `DEPLOYMENT_MANUAL.md` and `IMPLEMENTATION_GUIDE.md` for comprehensive Docker, Cloud Run, and Ubuntu Nginx instructions.

---

## 9. Verification & Quality Assurance

```bash
# Linting & static analysis
npm run lint

# Application build verification
npm run build
```

---

## 10. Compliance & Standards
- **ASHRAE Standard 90.1 / 62.1**: HVAC Energy Efficiency & Indoor Air Quality.
- **ISHRAE**: Indian Society of Heating, Refrigerating and Air Conditioning Engineers guidelines.
- **GAAP / Ind AS**: Double-entry financial accounting and revenue recognition standards.
- **GST / TDS**: Indian Statutory Indirect & Direct Tax compliance ready.
