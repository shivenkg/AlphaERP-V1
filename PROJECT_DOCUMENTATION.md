# Comprehensive Architecture & Technical Project Document (AlphaERP / HVAC-Sync Pro)

**Project Name:** AlphaERP / HVAC-Sync Pro (Commercial HVAC & MEP Enterprise Lifecycle Platform)  
**Version:** 3.5.0-Production  
**Document Author:** Google AI Studio Systems Engineering & Enterprise Solutions  
**Date:** September 2026  
**Live Production URL:** [https://hvacbiz.vercel.app](https://hvacbiz.vercel.app)

---

## Executive Summary & System Overview

**AlphaERP** is an enterprise-grade ERP, CRM, and Supply Chain automation platform tailored specifically for Heating, Ventilation, Air Conditioning (HVAC), and MEP (Mechanical, Electrical, Plumbing) engineering contractors. The platform automates the end-to-end operational lifecycle: from lead capture and on-site engineering surveys to automated quotation generation, project scheduling, Bill of Quantities (BOQ) reconciliation, Purchase Requisition (PR) & Purchase Order (PO) procurement pipelines, predictive inventory alerts with automated email dispatch, warehouse stock inwarding (GRN), field work orders, multi-stage milestone billing, cloud MongoDB synchronization, and real-time Gemini Live voice interaction.

---

## 1. System Architecture Design

```
                                  +---------------------------------------+
                                  |         CLIENT WEB / MOBILE APP       |
                                  |  (React 19 + TypeScript + Tailwind)   |
                                  +-------------------+-------------------+
                                                      │
                          +---------------------------+---------------------------+
                          │                                                       │
                          ▼                                                       ▼
         +--------------------------------+                     +----------------------------------+
         |      STATE & PERSISTENCE       |                     |     COMMUNICATIONS & INTEGRATION |
         |   - LocalStorage / IndexedDB   |                     |   - WhatsApp Universal Dispatch  |
         |   - MongoDB Atlas Cloud DB     |                     |   - Nodemailer SMTP Alert Relay  |
         |   - Google Sheets 2-Way Sync   |                     |   - Gemini Live Duplex Audio     |
         |   - Role-Based Access Control  |                     |   - Vercel Serverless Functions  |
         +----------------+---------------+                     +-----------------+----------------+
                          │                                                       │
                          ▼                                                       ▼
         +--------------------------------+                     +----------------------------------+
         |     CORE BUSINESS ENGINES      |                     |         FIELD SERVICES & GRN     |
         |  1. CRM Pipeline & Site Survey |                     |   - Work Order Ticket Dispatch   |
         |  2. HVAC Quotation & Tax Calc  |                     |   - Commissioning Checklists     |
         |  3. Project Execution & Gantt  |                     |   - Warehouse Goods Receipt Note |
         |  4. BOQ Shortage Cross-Check   |                     |   - Real-time Inventory Ledger   |
         |  5. Procurement PR/PO Pipeline |                     |   - Predictive Reorder Indents   |
         |  6. Sales Quota / Leaderboard  |                     |   - Multi-stage GST Milestone    |
         |  7. Admin Email Configuration  |                     |     Invoicing & Payment Tracker  |
         +--------------------------------+                     +----------------------------------+
```

### 1.1 Architecture Topology
- **Presentation Layer**: Client-Side Single Page Application (SPA) built with React 19, Vite 6, TypeScript, Lucide Icons, and Tailwind CSS v4.
- **Backend Service Layer**: Express application configured for dual-mode execution:
  - Dedicated full-stack server (`dist/server.cjs`) supporting persistent WebSockets (`/live`) for Gemini Live audio.
  - Vercel Serverless Function adapter (`api/index.js`) for cost-efficient zero-maintenance scale.
- **Data & Business Logic Layer**: Modular domain engines (`storageService`, `whatsappEmailService`, `rbac`, `exportService`, `mongodb`).
- **Communication & Notifications**: In-app SMTP mailer supporting dummy sandbox simulation (Mailtrap) and live authenticated SMTP relays for automated stock replenishment indents.

---

## 2. Core Entity Schemas & Data Model

### 2.1 Entity Relationship Diagram (ERD)

```
 [User] 1 ──────── * [AuditLog]
   │
   +──────── * [Lead] 1 ──────── * [Quotation] 1 ──────── 1 [Project]
                                                              │
                 +────────────────────────────────────────────+
                 │
                 ▼
              [BOQItem] * ──────── 1 [InventoryItem]
                 │                          │
                 ▼ (Deficit Trigger)        ▼ (Low Stock Reorder Trigger)
              [PurchaseRequisition]     [Automated Email Alert]
                 │                          │
                 ▼                          ▼
              [PurchaseOrder] 1 ──────── * [GoodsReceiptNote (GRN)]
                                                │
                                                ▼
                                         [Warehouse Stock +]
```

### 2.2 TypeScript Data Interfaces

```typescript
// 1. User & Authentication
interface User {
  id: string;
  name: string;
  email: string;
  role: 'executive' | 'procurement' | 'estimator' | 'sales_manager' | 'warehouse_manager' | 'finance' | 'technician';
  department: string;
  status: 'Active' | 'Inactive';
  phone?: string;
  createdAt: string;
  lastLoginAt?: string;
}

// 2. CRM Lead
interface Lead {
  id: string;
  leadNumber: string;
  clientName: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  projectType: string;
  estimatedTonnage: number;
  estimatedBudget: number;
  stage: 'New Lead' | 'Site Survey Scheduled' | 'Site Survey Completed' | 'Quote Sent' | 'Negotiation' | 'Won / Awarded' | 'Lost';
  assignedSalesEngineer: string;
  notes: string;
  createdAt: string;
}

// 3. Project & BOQ
interface Project {
  id: string;
  projectCode: string;
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
  progressPercent: number;
  boqItems: BOQItem[];
}

interface BOQItem {
  id: string;
  category: string;
  itemSku: string;
  description: string;
  quantityRequired: number;
  quantityAllocated: number;
  quantityShortage: number;
  unit: string;
  status: 'Fully Available' | 'Partially Available' | 'Critical Shortage' | 'PR Generated';
}

// 4. Inventory & Predictive Reorder
interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouseLocation: string;
  currentStock: number;
  allocatedStock: number;
  availableStock: number;
  reorderThreshold: number;
  unit: string;
  averageUnitCost: number;
  leadTimeDays?: number;
}

// 5. SMTP Configuration
interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
  secure?: boolean;
  isDummy?: boolean;
}
```

---

## 3. Key Operational Workflows

### Flow 1: Lead to Project Conversion & BOQ Reconciliation
1. **Lead Qualification**: Sales Engineer records customer requirements and schedules on-site survey.
2. **Heat Load & Quotation**: System calculates tonnage, equipment schedules, ducting materials, and 18% statutory GST.
3. **Award & Project Creation**: Marking the quote "Approved / Awarded" initiates a project workspace and generates the initial BOQ.
4. **Stock Reconciliation**: Real-time cross-referencing against warehouse inventory highlights deficits.

### Flow 2: Predictive Inventory & Automated Email Procurement
1. **Threshold Monitoring**: Inventory engine constantly compares `availableStock` vs `reorderThreshold`.
2. **Predictive Calculation**: When critical levels are reached, the system computes needed replenishment quantities.
3. **Automated Alert Dispatch**: Dispatches formatted HTML notification emails to the procurement inbox (`procurement@company.com`).
4. **Sandbox & Production Toggle**: Admin settings allow switching between Mailtrap testing mode and live authenticated SMTP.

### Flow 3: PR ➔ Approved PO ➔ Vendor Dispatch ➔ GRN Inwarding
1. **Auto-Generate PR**: Shortages automatically produce Purchase Requisitions.
2. **Procurement Review**: Procurement Manager approves specifications and pricing.
3. **PO Creation & Financial Sign-off**: PO generated and signed off by Executive management.
4. **Vendor Dispatch**: Instant transmission via WhatsApp formatting or email.
5. **Goods Receipt Note (GRN)**: Warehouse team confirms physical inwarding, replenishing stock and clearing BOQ shortages.

---

## 4. Role-Based Access Control (RBAC) Matrix

| Feature / Action | Executive / Admin | Procurement | Estimator | Sales Mgr | Warehouse | Finance | Technician |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Manage Users & Settings** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Configure SMTP / Database** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create / Edit Leads** | ✅ Full | ❌ | ❌ | ✅ Full | ❌ | ❌ | ❌ |
| **Generate HVAC Quotes** | ✅ Full | ❌ | ✅ Full | ✅ Full | ❌ | ❌ | ❌ |
| **Project BOQ Reconciliation** | ✅ Full | ✅ View | ✅ Full | ✅ View | ✅ View | ✅ View | ✅ View |
| **Raise & Approve PR** | ✅ Full | ✅ Full | ✅ Full | ❌ | ✅ Full | ❌ | ❌ |
| **Create & Dispatch PO** | ✅ Full | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Goods Receipt Note (GRN)** | ✅ Full | ❌ | ❌ | ❌ | ✅ Full | ❌ | ❌ |
| **Milestone Invoicing & GST** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ✅ Full | ❌ |
| **Field Work Orders** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Full |

---

## 5. Development & File Hierarchy

```
├── index.html                           # HTML entry point with metadata
├── metadata.json                        # Applet metadata, title and permissions
├── package.json                         # Node dependencies, dev/build scripts
├── vercel.json                          # Vercel routing, build command, headers
├── api/
│   └── index.ts                         # Vercel Serverless Function adapter
├── server/
│   ├── app.ts                           # Express application & API router
│   ├── api-entry.ts                     # Bundling entrypoint for Vercel
│   └── mongodb.ts                       # MongoDB Atlas connection manager
├── server.ts                            # Dedicated Node entrypoint & WebSocket server
├── src/
│   ├── main.tsx                         # React DOM bootstrapping
│   ├── App.tsx                          # Root layout, RBAC & navigation
│   ├── types/
│   │   └── index.ts                     # Global interfaces & types
│   ├── services/
│   │   ├── storageService.ts            # Local cache, storage & audit logger
│   │   ├── whatsappEmailService.ts      # Communication generators & SMTP triggers
│   │   └── exportService.ts             # CSV / PDF export engines
│   └── components/
│       ├── Header.tsx                   # Top navigation, role selector & alerts
│       ├── Sidebar.tsx                  # Collapsible navigation sidebar
│       ├── DashboardView.tsx            # Executive KPI widgets & real-time feed
│       ├── CRMLeadsView.tsx             # Lead management & site survey tracker
│       ├── QuotesView.tsx               # HVAC quotation builder & pricing engine
│       ├── ProjectsBOQView.tsx          # Gantt milestones & BOQ reconciliation
│       ├── ProcurementPRPOView.tsx      # PR/PO lifecycle & GRN inwarding
│       ├── InventoryWarehouseView.tsx   # Warehouse inventory & stock tracker
│       ├── PredictiveInventoryReorderPanel.tsx # Predictive stock alerts & email dispatch
│       ├── WorkOrdersView.tsx           # Field service & commissioning tickets
│       ├── FinancePaymentsView.tsx      # Milestone billing, GST & photo invoices
│       ├── SalesPerformanceView.tsx     # Quota tracking & performance charts
│       ├── UserManagementView.tsx       # Team management & role permissions
│       ├── EmailSettingsAdminSection.tsx# SMTP & Dummy Sandbox email settings
│       ├── LiveAudioAssistantModal.tsx  # Gemini Live real-time voice assistant
│       └── MongoSyncModal.tsx           # MongoDB Atlas bidirectional cloud sync
```

---

## 6. Deployment & Cloud Topology

- **Vercel Serverless Deployment**: Live at `https://hvacbiz.vercel.app`.
- **Google Cloud Run & Docker**: Fully supported with multi-stage `Dockerfile` running on port 3000.
- **Ubuntu Bare-Metal / VM**: Supports Nginx reverse proxy, Systemd service, and Let's Encrypt SSL.
