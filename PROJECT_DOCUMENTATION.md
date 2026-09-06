# Comprehensive Architecture & Technical Project Document (HVAC-Sync Pro)

**Project Name:** HVAC-Sync Pro (Commercial HVAC & MEP Lifecycle Platform)  
**Version:** 2.4.0-Production  
**Document Author:** Google AI Studio Systems Engineering & Enterprise Solutions  
**Date:** August 2026  

---

## Executive Summary & System Overview

**HVAC-Sync Pro** is an enterprise-grade ERP, CRM, and Supply Chain automation platform tailored specifically for Heating, Ventilation, Air Conditioning (HVAC), and MEP (Mechanical, Electrical, Plumbing) engineering contractors. The platform automates the end-to-end operational lifecycle: from lead capture and on-site engineering surveys to automated quotation generation, project scheduling, Bill of Quantities (BOQ) reconciliation, Purchase Requisition (PR) & Purchase Order (PO) procurement pipelines, warehouse stock inwarding (GRN), field work orders, multi-stage milestone billing, and bidirectional Google Sheets synchronization.

---

## 1. System Architecture Design

```
                                  +---------------------------------------+
                                  |         CLIENT WEB / MOBILE APP       |
                                  |  (React 18 + TypeScript + Tailwind)   |
                                  +-------------------+-------------------+
                                                      |
                          +---------------------------+---------------------------+
                          |                                                       |
                          v                                                       v
         +--------------------------------+                     +----------------------------------+
         |      STATE & PERSISTENCE       |                     |     COMMUNICATIONS & INTEGRATION |
         |   - LocalStorage / IndexedDB   |                     |   - WhatsApp Web Messaging API   |
         |   - Audit Logging Engine       |                     |   - Mailto RFC 6068 Mail Service |
         |   - Role-Based Access Control  |                     |   - Google Sheets Sync Engine    |
         +----------------+---------------+                     +-----------------+----------------+
                          |                                                       |
                          v                                                       v
         +--------------------------------+                     +----------------------------------+
         |     CORE BUSINESS ENGINES      |                     |         FIELD SERVICES & GRN     |
         |  1. CRM Pipeline Manager       |                     |   - Work Order Ticket Dispatch   |
         |  2. HVAC Quotation & Tax Calc  |                     |   - Commissioning Checklists     |
         |  3. Project Execution & Gantt  |                     |   - Warehouse Goods Receipt Note |
         |  4. BOQ Shortage Cross-Check   |                     |   - Real-time Inventory Ledger   |
         |  5. Procurement PR/PO Engine   |                     |   - Multi-stage GST Milestone    |
         |  6. Sales Quota / Leaderboard  |                     |     Invoicing & Payment Tracker  |
         +--------------------------------+                     +----------------------------------+
```

### 1.1 Architecture Topology
- **Presentation Layer**: Client-Side Single Page Application (SPA) built with React 18, Vite, TypeScript, Lucide Icons, and Tailwind CSS.
- **Data & Business Logic Layer**: Modular domain engines (`storageService`, `whatsappEmailService`, `rbac`, `exportService`) ensuring clean separation of concerns.
- **Storage Layer**: Real-time cached state with browser persistence and structured synchronization schemas for Google Sheets and cloud databases.
- **Integrations**: Direct vendor transmission via WhatsApp Universal Click-to-Chat protocol, RFC 6068 email generation, and two-way Google Sheets Apps Script endpoints.

---

## 2. Relational & Document Database Schemas

### 2.1 Entity Relationship Diagram (ERD) Overview

```
 [User] 1 -------- * [AuditLog]
   |
   +-------- * [Lead] 1 -------- * [Quotation] 1 -------- 1 [Project]
                                                              |
                 +--------------------------------------------+
                 |
                 v
              [BOQItem] * -------- 1 [InventoryItem]
                 |
                 v (Deficit Trigger)
              [PurchaseRequisition] 1 -------- * [PurchaseOrder] 1 -------- * [GoodsReceiptNote (GRN)]
                                                                               |
                                                                               v
                                                                        [Warehouse Stock +]
```

### 2.2 Schema Definitions

```typescript
// 1. User & Authentication Schema
interface User {
  id: string;                      // Unique UUID / identifier
  name: string;                    // Full display name
  email: string;                   // Corporate email
  role: UserRole;                  // 'executive' | 'procurement' | 'estimator' | 'sales_manager' | 'warehouse_manager' | 'finance' | 'technician'
  department: string;              // E.g., 'Commercial HVAC Sales', 'Procurement & Logistics'
  status: 'Active' | 'Inactive';
  phone?: string;
  avatarUrl?: string;
  createdAt: string;               // ISO 8601 Timestamp
  lastLoginAt?: string;
}

// 2. CRM Lead Schema
interface Lead {
  id: string;
  leadNumber: string;              // Format: LD-YYYY-XXXX
  clientName: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  projectType: 'Commercial VRF' | 'Industrial Chiller' | 'Cleanroom Ducting' | 'Data Center Precision Cooling' | 'Hospital HVAC & AHU' | 'Mall Package Unit';
  estimatedTonnage: number;        // Tons of Refrigeration (TR)
  estimatedBudget: number;         // Monetary value (INR)
  stage: 'New Lead' | 'Site Survey Scheduled' | 'Site Survey Completed' | 'Quote Sent' | 'Negotiation' | 'Won / Awarded' | 'Lost';
  assignedSalesEngineer: string;
  siteSurveyDate?: string;
  heatLoadSqFt?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// 3. Quotation Schema
interface Quotation {
  id: string;
  quoteNumber: string;             // Format: QT-YYYY-XXXX
  leadId: string;
  clientName: string;
  projectName: string;
  systemType: string;
  tonnage: number;
  items: QuoteItem[];
  subTotal: number;
  freightAndLabor: number;
  gstRate: number;                 // Standard 18% for MEP machinery
  gstAmount: number;
  grandTotal: number;
  paymentTerms: string;            // Standard: 30% Advance, 40% Delivery, 20% Erection, 10% Handover
  status: 'Draft' | 'Sent to Client' | 'Approved / Awarded' | 'Revised' | 'Declined';
  validUntil: string;
  preparedBy: string;
  createdAt: string;
}

// 4. Project & BOQ Schema
interface Project {
  id: string;
  projectCode: string;             // Format: PRJ-YYYY-XXXX
  leadId: string;
  quoteId: string;
  name: string;
  clientName: string;
  systemType: string;
  tonnage: number;
  contractValue: number;
  startDate: string;
  targetHandoverDate: string;
  status: 'Engineering Planning' | 'Material Procurement' | 'Piping & Ducting' | 'Equipment Installation' | 'Testing & Commissioning' | 'Completed & Handed Over';
  assignedProjectManager: string;
  progressPercent: number;
  boqItems: BOQItem[];
}

interface BOQItem {
  id: string;
  category: 'Major Equipment' | 'Piping & Valves' | 'Ducting & Insulation' | 'Air Distribution' | 'Electrical & Controls';
  itemSku: string;
  description: string;
  quantityRequired: number;
  quantityAllocated: number;
  quantityShortage: number;        // Auto-calculated: Math.max(0, required - allocated)
  unit: string;
  allocatedInventoryId?: string;
  status: 'Fully Available' | 'Partially Available' | 'Critical Shortage' | 'PR Generated';
}

// 5. Purchase Requisition (PR) Schema
interface PurchaseRequisition {
  id: string;
  prNumber: string;                // Format: PR-YYYY-XXXX
  projectId: string;
  projectName: string;
  requestedBy: string;
  requestDate: string;
  requiredByDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Converted to PO' | 'Rejected';
  items: PRItem[];
  totalEstimatedAmount: number;
  approvalRemarks?: string;
  approvedBy?: string;
  approvedAt?: string;
  convertedPoNumber?: string;
}

// 6. Purchase Order (PO) Schema
interface PurchaseOrder {
  id: string;
  poNumber: string;                // Format: PO-YYYY-XXXX
  prId?: string;
  prNumber?: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  orderDate: string;
  expectedDeliveryDate: string;
  paymentTerms: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Sent to Vendor' | 'Partially Received' | 'Fulfilled' | 'Rejected' | 'Cancelled';
  items: POItem[];
  subTotal: number;
  taxAmount: number;               // 18% GST
  grandTotal: number;
  approvedBy?: string;
  approvedAt?: string;
  transmittedVia?: 'WhatsApp' | 'Email';
  transmittedAt?: string;
}

// 7. Inventory Item & Warehouse Schema
interface InventoryItem {
  id: string;
  sku: string;                     // E.g., 'VRF-ODU-28HP-V8', 'COP-PIPE-78-IS'
  name: string;
  category: 'Outdoor Units' | 'Indoor Units' | 'Copper Piping' | 'Ducting Sheets' | 'Valves & Fittings' | 'Electrical Cables' | 'Refrigerant Gas';
  warehouseLocation: string;       // E.g., 'Central Warehouse Bay 4B'
  currentStock: number;
  allocatedStock: number;          // Stock reserved for active projects
  availableStock: number;          // currentStock - allocatedStock
  reorderThreshold: number;
  unit: string;
  averageUnitCost: number;
}
```

---

## 3. End-to-End Process Flows

### Flow 1: Lead to Project Conversion & BOQ Reconciliation
1. **Lead Ingestion**: Sales team records an HVAC inquiry (e.g., 85 TR Commercial VRF System).
2. **Site Survey & Heat Load Analysis**: Estimator logs square footage, ambient load conditions, and pipe lengths.
3. **Quotation Generation**: System computes itemized pricing for Chillers/ODUs, IDUs, class 'O' Nitrile insulation, VRV Y-joints, and 18% GST.
4. **Award & Project Creation**: When the Quote is marked "Approved / Awarded", the system automatically creates an active Project, populates the schedule, and generates the initial Bill of Quantities (BOQ).
5. **Stock Allocation & Shortage Detection**: The system cross-references each BOQ line item against warehouse inventory. If available stock < required quantity, the item is flagged as `Critical Shortage`.

### Flow 2: Automated PR ➔ Approved PO ➔ Vendor Dispatch ➔ GRN Inwarding
1. **Auto-Generate PR**: The project manager or MEP estimator triggers "Auto-Generate Deficit PR". A Purchase Requisition is created grouping all shortage line items with estimated costs.
2. **Procurement Manager Approval**: The Purchase/Procurement Manager reviews technical specifications, approves the PR, and authorizes procurement.
3. **PO Generation**: The PR is converted into an official Purchase Order linked to an approved OEM vendor (e.g., Daikin, Voltas, Blue Star).
4. **Business Sign-off**: The PO is submitted to the Business Manager / Executive for financial sign-off.
5. **Vendor Dispatch**: The procurement team transmits the PO via WhatsApp or Email with automated purchase order formatting.
6. **Goods Receipt Note (GRN) & Warehouse Inwarding**: Upon physical arrival at the warehouse, the warehouse manager records inward quantities. The inventory ledger is incremented, and project BOQ shortages are marked fulfilled.

```
+-----------------------------------------------------------------------------------+
|                        HVAC-SYNC PRO LIFECYCLE PIPELINE                           |
+-----------------------------------------------------------------------------------+
|  [Lead Capture]                                                                   |
|         |                                                                         |
|         v                                                                         |
|  [Site Heat Load Survey]                                                          |
|         |                                                                         |
|         v                                                                         |
|  [Quote / BOQ Estimation]                                                         |
|         |                                                                         |
|         v                                                                         |
|  [Project Awarded] ────────> [Auto BOQ Cross-Check vs Warehouse Stock]            |
|                                                     |                             |
|                                            (Shortage Detected)                    |
|                                                     |                             |
|                                                     v                             |
|                                     [Purchase Requisition (PR)]                   |
|                                                     |                             |
|                                            (Procurement Mgr OK)                   |
|                                                     |                             |
|                                                     v                             |
|                                      [Purchase Order (PO)]                        |
|                                                     |                             |
|                                            (Business Mgr Sign-off)                |
|                                                     |                             |
|                                                     v                             |
|                                        [WhatsApp / Email Dispatch]                |
|                                                     |                             |
|                                                     v                             |
|                                        [GRN Inwarding & Stock Update]             |
|                                                     |                             |
|                                                     v                             |
|                                    [Testing, Commissioning & Billing]             |
+-----------------------------------------------------------------------------------+
```

---

## 4. Standard Operating Procedures (SOPs)

### SOP-01: Site Survey & Quote Generation
- **Owner:** Sales Engineer & MEP Estimator
- **Frequency:** Per new verified inquiry
- **Procedure:**
  1. Inspect site architectural drawings and check floor-to-ceiling clearance for ductwork.
  2. Input heat load tonnage, piping distances, and equipment requirements into HVAC-Sync Pro.
  3. Verify statutory GST calculations (18%) and apply standardized milestone terms (30% Advance, 40% Delivery, 20% Erection, 10% Commissioning).
  4. Submit quotation to client via PDF or Email.

### SOP-02: Purchase Requisition (PR) & Purchase Order (PO) Governance
- **Owner:** MEP Project Manager & Procurement Manager
- **Frequency:** Upon project contract award or warehouse stock reorder alerts
- **Procedure:**
  1. Review automated deficit items generated by the project BOQ cross-check engine.
  2. The Project Manager raises a Purchase Requisition (PR) detailing required on-site delivery dates.
  3. The Procurement Manager reviews supplier rates and approves the PR.
  4. The Procurement Officer converts the approved PR into a Purchase Order (PO) and routes it to the Business Manager.
  5. The Business Manager performs financial review and digitally signs off.
  6. The Purchase Order is transmitted to the OEM vendor via automated WhatsApp/Email templates.

### SOP-03: Warehouse Goods Receipt Note (GRN) Inwarding
- **Owner:** Warehouse Manager & Inventory Lead
- **Frequency:** Upon equipment truck delivery at warehouse or project site
- **Procedure:**
  1. Match physical delivery challan / tax invoice against the active PO in HVAC-Sync Pro.
  2. Perform visual inspection for transport damage (copper coil fin damage, refrigerant leaks).
  3. Open the **Procurement & PO** tab, locate the PO, and click **Inward Stock (GRN)**.
  4. Input received quantities per SKU. The system automatically updates warehouse available stock and marks the project BOQ shortage as resolved.

### SOP-04: Google Sheets Master Synchronization
- **Owner:** Admin / Systems Coordinator
- **Frequency:** Real-time auto-sync / Daily manual audit
- **Procedure:**
  1. Open **Google Sheet Master** from the navigation sidebar.
  2. Verify the Google Apps Script Webhook URL is configured.
  3. Click **Sync Now** to push all active leads, quotations, project BOQs, and PO records into the designated Google Sheet.

---

## 5. Role-Based Access Control (RBAC) Matrix

| Feature / Action | Executive / Admin | Procurement Manager | MEP Estimator | Sales Manager | Warehouse Manager | Finance & Accounts | Site Technician |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Manage Users & Roles** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create / Edit Leads** | ✅ Full | ❌ | ❌ | ✅ Full | ❌ | ❌ | ❌ |
| **Generate HVAC Quotes** | ✅ Full | ❌ | ✅ Full | ✅ Full | ❌ | ❌ | ❌ |
| **Approve / Award Quotes** | ✅ Full | ❌ | ❌ | ✅ Full | ❌ | ❌ | ❌ |
| **View Project BOQ** | ✅ Full | ✅ View | ✅ Full | ✅ View | ✅ View | ✅ View | ✅ View |
| **Raise Purchase Requisition (PR)** | ✅ Full | ✅ Full | ✅ Full | ❌ | ✅ Full | ❌ | ❌ |
| **Approve Purchase Requisition (PR)** | ✅ Full | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create Purchase Order (PO)** | ✅ Full | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Approve PO (Sign-off)** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Transmit PO (WhatsApp/Email)** | ✅ Full | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Inward Goods (GRN)** | ✅ Full | ❌ | ❌ | ❌ | ✅ Full | ❌ | ❌ |
| **Manage Invoices & Payments** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ✅ Full | ❌ |
| **Complete Work Orders** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Full |
| **Audit Trail Logs** | ✅ Full | ✅ View | ❌ | ❌ | ❌ | ✅ View | ❌ |

---

## 6. Development Guide

### 6.1 Technology Stack & Dependencies
- **Runtime & Bundler**: Node.js 18+ / 20+, Vite 5+
- **Frontend Framework**: React 18 with TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v3 / v4 with responsive mobile-first typography
- **Iconography**: `lucide-react`
- **Charts & KPIs**: `recharts` for financial milestones and sales quotas
- **Date Handling & Utilities**: Native Date ISO strings, standard browser storage APIs

### 6.2 Project Directory Structure
```
├── index.html                   # HTML entry point with metadata
├── metadata.json                # Project configurations & permissions
├── package.json                 # Dependencies and build scripts
├── src/
│   ├── main.tsx                 # React DOM bootstrapping
│   ├── App.tsx                  # Root layout, role state, navigation tabs
│   ├── types/
│   │   └── index.ts             # Global TypeScript interfaces & enums
│   ├── services/
│   │   ├── storageService.ts    # Centralized storage, state & audit logging
│   │   ├── whatsappEmailService.ts # WhatsApp & Email communication generators
│   │   └── exportService.ts     # CSV & data export helpers
│   ├── utils/
│   │   └── rbac.ts              # RBAC helper functions & permission gates
│   └── components/
│       ├── Header.tsx           # Top navigation, notifications & role switcher
│       ├── Sidebar.tsx          # Collapsible responsive sidebar drawer
│       ├── DashboardView.tsx    # Executive KPIs, shortage alerts & quick actions
│       ├── ActivityFeed.tsx     # Real-time reactive user activity feed with live sync & action filters
│       ├── ActivityFeed.tsx     # Real-time interactive activity feed with filtering & event inspection
│       ├── dashboard/
│       │   └── DashboardLayoutManagerModal.tsx # Drag & Drop layout manager, widget visibility & preset configurations
│       ├── WeeklySalesPerformanceChart.tsx # Recharts sales trendline visualizer
│       ├── ProjectStatusDistributionChart.tsx # Recharts project status donut visualizer
│       ├── CRMLeadsView.tsx     # Kanban & List lead pipeline with modal detail
│       ├── QuotesView.tsx       # Quotation calculator & award engine
│       ├── ProjectsBOQView.tsx  # Project Gantt, BOQ reconciliation & auto PR
│       ├── ProcurementPRPOView.tsx # PR/PO pipeline, GRN inwarding & approval flow
│       ├── CreatePRModal.tsx    # Modal for raising Purchase Requisitions
│       ├── CreatePOModal.tsx    # Modal for creating direct Purchase Orders
│       ├── PRDetailModal.tsx    # Interactive PR inspection & conversion
│       ├── PODetailModal.tsx    # Interactive PO inspection & transmission
│       ├── InventoryWarehouseView.tsx # Stock levels & reorder alerts
│       ├── WorkOrdersView.tsx   # Field service tickets & commissioning checklist
│       ├── FinancePaymentsView.tsx # GST milestone billing, payment tracking & photo invoices
│       ├── finance/
│       │   ├── InvoiceCameraModal.tsx # Live camera hardware capture for physical paper invoices & receipts
│       │   └── InvoiceAttachmentGalleryModal.tsx # Photo gallery, multi-page attachments & high-res lightbox
│       ├── ProjectCompletionBillModal.tsx # Formatted completion billing & PDF statement engine
│       ├── SalesPerformanceView.tsx # Sales quota metrics & team leaderboard
│       ├── UserManagementView.tsx # Admin user registration & role manager
│       ├── GoogleSheetsModal.tsx# Two-way Google Sheets configuration
│       └── AuditLogView.tsx     # Immutable audit log ledger
```

### 6.3 Local Development Setup
```bash
# 1. Clone or access the workspace
cd /workspace

# 2. Install all dependencies
npm install

# 3. Start development server on port 3000
npm run dev

# 4. Run TypeScript validation
npm run lint

# 5. Production build test
npm run build
```

---

## 7. Production Deployment & Operations

### 7.1 Containerization & Cloud Run Architecture
HVAC-Sync Pro is packaged for containerized deployment on Google Cloud Run:
- **Port Ingress**: Standard port `3000` routed via Cloud Run HTTPS reverse proxy.
- **Build Artifacts**: Compiled via `npm run build` with optimized single-bundle chunking inside `dist/`.
- **Stateless Container**: The web application serves pre-compiled static assets and connects to client-authenticated APIs and cloud persistence.

### 7.2 Google Cloud Run Deployment Commands
```bash
# Build and submit the container to Google Artifact Registry
gcloud builds submit --tag gcr.io/[PROJECT_ID]/hvac-sync-pro:latest

# Deploy to Cloud Run with auto-scaling (0 to 10 instances)
gcloud run deploy hvac-sync-pro \
  --image gcr.io/[PROJECT_ID]/hvac-sync-pro:latest \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --port 3000
```

### 7.3 Data Backup & Disaster Recovery
- **Google Sheets Sync**: Real-time snapshot backups stored automatically in the connected corporate Google Drive / Sheets workbook.
- **CSV & JSON Exports**: Export buttons are built into every core module (CRM Leads, Project BOQs, Inventory, PR/PO Ledgers, Audit Logs) to support periodic offline archiving.
- **Audit Trails**: Every write and approval operation creates an immutable audit record containing timestamp, user role, entity ID, and change summary.

---
*End of Technical Project Architecture & Operations Documentation.*
