# Comprehensive Architecture & Technical Project Document (AlphaERP)
### Enterprise HVAC Techno-Commercial, BOQ Engineering, Multi-Tier Procurement, Predictive Stock Indents, GAAP Accounting & Multi-Cloud Platform

**Project Name:** AlphaERP / HVAC-Sync Pro (Commercial HVAC & MEP Enterprise Lifecycle Platform)  
**Version:** 3.5.0-Production  
**Document Author:** Google AI Studio Systems Engineering & Enterprise Solutions Architecture  
**Date:** September 2026  
**Live Production URL:** [https://hvacbiz.vercel.app](https://hvacbiz.vercel.app)  
**Target Repository:** `AlphaERP-V1`

---

## 1. Executive Summary & System Overview

**AlphaERP** is a full-stack, enterprise-grade ERP, CRM, and Supply Chain automation platform tailored specifically for Heating, Ventilation, Air Conditioning (HVAC), and MEP (Mechanical, Electrical, Plumbing) engineering contractors. The platform digitizes and unifies the operational lifecycle: from initial lead qualification and on-site engineering surveys to automated quotation generation, thermodynamic sizing, project scheduling, Bill of Quantities (BOQ) reconciliation, Purchase Requisition (PR) & Purchase Order (PO) procurement pipelines, predictive inventory alerts with automated email dispatch, warehouse stock inwarding (GRN), field work orders, multi-stage milestone billing, cloud MongoDB synchronization, and real-time Gemini Live voice interaction.

---

## 2. System Architecture & Topology

### 2.1 Multi-Tier Architecture Diagram

```mermaid
flowchart TB
    subgraph ClientTier["🖥️ Presentation Tier (React 19 + TypeScript + Vite 6 + Tailwind CSS v4)"]
        SPA["React SPA Shell (App.tsx)"]
        StateEngine["Reactive Pub/Sub Local Storage & IndexedDB (storageService.ts)"]
        AudioEngine["Web AudioContext & 16kHz PCM Streamer"]
        GISAuth["Google Identity Services (GIS) OAuth 2.0 Auth"]
        SPA --> StateEngine
        SPA --> AudioEngine
        SPA --> GISAuth
    end

    subgraph IngressTier["🌐 Edge Routing & Ingress Tier"]
        VercelCDN["Vercel Edge Global CDN / Nginx Proxy"]
        SecurityHeaders["Enterprise Security Headers (nosniff, XSS, Strict Referrer)"]
        CompressionEngine["GZIP / Deflate Compression Middleware"]
        VercelCDN --> SecurityHeaders --> CompressionEngine
    end

    subgraph ServiceTier["⚙️ Application & Serverless Backend Tier (Node.js 20+ / Express)"]
        VercelServerless["Vercel Serverless Function Adapter (api/index.js)"]
        DedicatedNode["Dedicated Full-Stack Server (dist/server.cjs)"]
        
        subgraph REST_APIs["Core REST Endpoints"]
            HAPI["GET /api/health"]
            EmailAlertAPI["POST /api/procurement/reorder-alert-email"]
            EmailTestAPI["POST /api/email/test-connection"]
            MongoStatusAPI["GET /api/mongodb/status"]
            MongoMigrateAPI["POST /api/mongodb/migrate"]
            MongoExportAPI["GET /api/mongodb/export"]
            MongoProjectsAPI["GET & POST /api/mongodb/projects"]
        end
        
        subgraph RealtimeHub["Real-Time Duplex WebSocket Hub"]
            LiveWSEndpoint["Duplex WebSocket Server (/live)"]
        end

        VercelServerless --> REST_APIs
        DedicatedNode --> REST_APIs
        DedicatedNode --> RealtimeHub
    end

    subgraph PersistenceTier["☁️ Cloud Persistence & Integration Tier"]
        MongoCluster[("MongoDB Atlas Cloud Database (alphaerp)")]
        GoogleSpreadsheets["Google Sheets 9-Tab Real-time Synchronizer"]
        SMTPRelay["Production SMTP Server / Mailtrap Dummy Sandbox"]
        GeminiAI["Google Gemini Live Real-Time Voice Model"]
    end

    ClientTier <-->|HTTPS REST| IngressTier
    ClientTier <-->|WSS Live Audio Stream| RealtimeHub
    IngressTier --> ServiceTier
    REST_APIs <--> MongoCluster
    REST_APIs --> SMTPRelay
    GISAuth <--> GoogleSpreadsheets
    RealtimeHub <--> GeminiAI
```

---

## 3. Core Entity Schemas & Data Model

### 3.1 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ AUDIT_LOG : generates
    USER ||--o{ LEAD : manages
    LEAD ||--o{ QUOTATION : converts_to
    QUOTATION ||--|| PROJECT : instantiates
    PROJECT ||--|{ BOQ_ITEM : contains
    BOQ_ITEM }o--|| INVENTORY_ITEM : references
    BOQ_ITEM ||--o{ PURCHASE_REQUISITION : triggers_shortage
    PURCHASE_REQUISITION ||--|| PURCHASE_ORDER : approved_into
    PURCHASE_ORDER ||--|{ GOODS_RECEIPT_NOTE : inwarded_by
    GOODS_RECEIPT_NOTE ||--|| INVENTORY_ITEM : updates_stock
    PROJECT ||--|{ WORK_ORDER : dispatches
    PROJECT ||--|{ MILESTONE_INVOICE : bills
    MILESTONE_INVOICE ||--|{ PAYMENT_RECEIPT : reconciled_with
    INVENTORY_ITEM ||--o{ REORDER_EMAIL_ALERT : dispatches
```

### 3.2 TypeScript Data Interfaces

```typescript
// 1. User & Identity
export interface User {
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

// 2. CRM Lead & Site Survey
export interface Lead {
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

// 3. Techno-Commercial Quotation
export interface Quotation {
  id: string;
  quoteNumber: string;
  leadId: string;
  clientName: string;
  projectName: string;
  systemType: 'VRV/VRF' | 'Chilled Water Plant' | 'Packaged DX' | 'Ventilation & Exhaust';
  tonnage: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  gstAmount: number; // 18% Statutory GST
  grandTotal: number;
  rawMaterialCost: number;
  estimatedGrossMargin: number;
  status: 'Draft' | 'Sent to Client' | 'Negotiation' | 'Approved / Awarded' | 'Rejected';
  items: QuoteLineItem[];
  validUntil: string;
  createdAt: string;
}

// 4. Project & BOQ Line Item
export interface Project {
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

export interface BOQItem {
  id: string;
  category: 'Heavy Machinery' | 'Ducting & Air Distribution' | 'Piping & Valves' | 'Insulation' | 'Refrigerant & Consumables' | 'Electrical & Controls';
  itemSku: string;
  description: string;
  quantityRequired: number;
  quantityAllocated: number;
  quantityShortage: number;
  unit: string;
  status: 'Fully Available' | 'Partially Available' | 'Critical Shortage' | 'PR Generated';
}

// 5. Inventory & Safety Stock
export interface InventoryItem {
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

// 6. Procurement: PR, PO & GRN
export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  projectId: string;
  requestedBy: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'PO Issued' | 'Rejected';
  items: {
    sku: string;
    name: string;
    quantity: number;
    estimatedCost: number;
    unit: string;
  }[];
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  prId: string;
  vendorName: string;
  vendorEmail: string;
  totalAmount: number;
  status: 'Issued' | 'Partially Received' | 'Completed' | 'Cancelled';
  deliveryDueDate: string;
  createdAt: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string;
  poNumber: string;
  vendorInvoiceNumber: string;
  inwardDate: string;
  inspectedBy: string;
  itemsReceived: {
    sku: string;
    quantityReceived: number;
    acceptedQuantity: number;
    rejectedQuantity: number;
  }[];
}
```

---

## 4. Key Operational Workflows & Process Logic

### Flow 1: Lead to Project Conversion & BOQ Reconciliation

```mermaid
flowchart TD
    A["Lead Qualified in CRM"] --> B["On-Site Survey & Heat Load Calculation"]
    B --> C["Generate Techno-Commercial Quotation"]
    C --> D{"Client Status"}
    D -- Negotiate --> C
    D -- Won / Awarded --> E["Initialize Project Workspace"]
    E --> F["Parse Quote Line Items into BOQ"]
    F --> G["Cross-Reference with Warehouse Available Stock"]
    G --> H{"Is Available Stock >= Required?"}
    H -- Yes --> I["Set Status: Fully Available & Allocate Stock"]
    H -- No --> J["Calculate Shortage Deficit & Set Status: Critical Shortage"]
    J --> K["One-Click Auto-Generate Purchase Requisition (PR)"]
```

### Flow 2: Predictive Safety Stock & Automated Email Procurement

```mermaid
flowchart TD
    A["Warehouse Stock Level Check"] --> B{"Is Available Stock <= Reorder Threshold?"}
    B -- No --> C["Status Normal: No Action Required"]
    B -- Yes --> D["Highlight SKU in Predictive Inventory Reorder Panel"]
    D --> E["Calculate Suggested Reorder Indent: ReorderLevel - AvailableStock"]
    E --> F["Trigger POST /api/procurement/reorder-alert-email"]
    F --> G{"SMTP Mode"}
    G -- Production SMTP --> H["Dispatch via Nodemailer to procurement@company.com"]
    G -- Sandbox Mode --> I["Capture in Mailtrap / Simulated Sandbox Wrapper"]
    H --> J["Log Action in Immutable System Audit Trail"]
    I --> J
```

### Flow 3: Procurement PR ➔ PO ➔ Vendor Dispatch ➔ GRN Stock Inwarding

```mermaid
flowchart TD
    A["Purchase Requisition (PR) Raised"] --> B["Procurement Head Review & Approval"]
    B --> C["Vendor Selection & Purchase Order (PO) Generation"]
    C --> D["Executive Financial Signoff"]
    D --> E["Dispatch PO via Automated WhatsApp / Email"]
    E --> F["Vendor Physical Delivery at Warehouse"]
    F --> G["Storekeeper Generates Goods Receipt Note (GRN)"]
    G --> H["Physical Quality Inspection & Count Verification"]
    H --> I["Update Inventory Current & Available Stock"]
    I --> J["Reconcile Active Project BOQ Shortages Automatically"]
```

### Flow 4: Field Work Order, Commissioning & Client Signoff

```mermaid
flowchart TD
    A["Project Reaches Commissioning Stage"] --> B["Dispatch Field Work Order to Lead Technician"]
    B --> C["Technician Executes Mobile Commissioning Checklist"]
    C --> D["Record Operating Parameters: Refrigerant Suction/Discharge PSI, Delta T, CFM, Amperage"]
    D --> E["Capture Site Execution Photographs & Document Vault Upload"]
    E --> F["Client Digital Touchscreen Signature Capture"]
    F --> G["Mark Work Order Completed & Trigger Final Handover Milestone"]
```

### Flow 5: Milestone Invoicing, GST Ledger & GAAP Double-Entry Accounting

```mermaid
flowchart TD
    A["Project Milestone Milestone Achieved (Advance / Delivery / Erection / Handover)"] --> B["Generate Phased Milestone Tax Invoice"]
    B --> C["Calculate 18% Commercial HVAC GST (CGST + SGST / IGST)"]
    C --> D["Debit: Accounts Receivable (Client Ledger)"]
    D --> E["Credit: HVAC Project Revenue & GST Output Liability"]
    E --> F["Client Payment Received (NEFT / RTGS / Cheque)"]
    F --> G["Debit: Bank Account"]
    G --> H["Credit: Accounts Receivable (Clearing Outstanding)"]
```

---

## 5. Role-Based Access Control (RBAC) Matrix

| Module / Operation | Executive / MD | Sales Manager | HVAC Estimator | Procurement | Warehouse | Finance | Lead Engineer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Executive Management Dashboard** | Full | View | View | View | View | View | View |
| **CRM Leads & Site Survey** | Full | Full | View | View | No | View | No |
| **Quotation & Margin Engine** | Full | Full | Full | View | No | View | No |
| **Project Milestones & Gantt** | Full | View | View | View | View | View | Full |
| **BOQ Stock Shortage Reconciliation**| Full | View | Full | View | View | View | View |
| **Raise Purchase Requisition (PR)**| Full | No | Full | Full | Full | No | No |
| **Issue Purchase Order (PO)** | Full | No | No | Full | No | No | No |
| **Goods Receipt Note (GRN) Inwarding**| Full | No | No | No | Full | No | No |
| **Field Work Orders & Signoff** | Full | No | No | No | No | No | Full |
| **Milestone Invoicing & GST** | Full | View | No | View | No | Full | No |
| **GAAP Double-Entry Ledger** | Full | No | No | No | No | Full | No |
| **HRMS & Payroll Administration** | Full | Team View| Self | Self | Self | Payroll Full | Self |
| **Admin SMTP & MongoDB Config** | Full | No | No | No | No | No | No |

---

## 6. Security, Performance & Storage Specifications

1. **Enterprise HTTP Security Headers**:
   - `X-Content-Type-Options: nosniff` (prevents MIME-type confusion attacks).
   - `X-XSS-Protection: 1; mode=block` (browser-level XSS protection).
   - `Referrer-Policy: strict-origin-when-cross-origin` (prevents confidential path leakage).
   - `X-Powered-By` header disabled across all Express instances.
2. **Payload Protection**:
   - `express.json({ limit: "25mb" })` enforces strict payload ceilings while enabling full database backups.
3. **Response Compression**:
   - `compression({ level: 6, threshold: 1024 })` applies GZIP/Deflate compression on responses > 1KB.
4. **WebSocket Connection Integrity**:
   - Gemini Live Duplex WebSockets feature heartbeat ping/pong monitoring and 5-minute idle disconnection sweeps.
5. **Database Cloud Sync & Resiliency**:
   - Automatic fallback to browser IndexedDB/LocalStorage when network or cloud MongoDB Atlas is unreachable.

---

## 7. Compliance & Standards

- **ASHRAE Standard 90.1 & 62.1**: Compliant heat load and airflow estimation formulas.
- **ISHRAE Standards**: Commercial cooling design standards in tropical operating conditions.
- **Ind AS 115 / GAAP**: Milestone-based revenue recognition from customer contracts.
- **Indian GST Law**: Complete support for B2B tax invoices with SAC/HSN codes and 18% GST split.
