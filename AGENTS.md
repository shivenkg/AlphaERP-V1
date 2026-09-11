---
description: Instructions for AI agents, developers, and MCP tools building and maintaining AlphaERP
globs: *
alwaysApply: true
---

# AlphaERP — AI Agent & Developer Architecture Guidelines
### Enterprise HVAC Techno-Commercial, BOQ Engineering, Multi-Tier Procurement & Multi-Cloud Backend

**Target Repository:** `AlphaERP-V1`  
**Live Production Applet:** [https://hvacbiz.insforge.site/#dashboard](https://hvacbiz.insforge.site/#dashboard) (Custom InsForge Domain) | [https://hvacbiz.vercel.app](https://hvacbiz.vercel.app)  
**Version:** 3.5.0-Production

---

## 1. System Architecture & Component Interactions

```mermaid
flowchart TD
    subgraph AgentOrchestration["🤖 AI Agents & Developer Tooling"]
        Agent["Antigravity / Coding Agent"]
        MCP["MCP Server Tools (Database, Storage, Docs, DevTools)"]
        Agent --> MCP
    end

    subgraph ClientApplication["🖥️ Presentation Layer (React 19 + TypeScript + Vite 6 + Tailwind CSS)"]
        UI["SPA Views (Dashboard, CRM, Quotes, BOQ, PR/PO, Inventory, Finance, HR)"]
        Storage["Storage Service & PubSub State (storageService.ts)"]
        Audio["Duplex PCM Audio Worklet (Gemini Live Voice)"]
        UI --> Storage
        UI --> Audio
    end

    subgraph BackendRuntimes["⚙️ Hybrid Server Runtimes"]
        VercelServerless["Vercel Serverless Function (api/index.js)"]
        DedicatedNode["Dedicated Node.js Server & WebSocket Hub (dist/server.cjs)"]
        ExpressRouter["Express API Router (server/app.ts)"]
        
        VercelServerless --> ExpressRouter
        DedicatedNode --> ExpressRouter
    end

    subgraph PersistenceLayer["☁️ Cloud Persistence & Backend-as-a-Service"]
        InsForgeBaaS[("InsForge BaaS (PostgreSQL + PostgREST + Auth + Storage)")]
        MongoDBAtlas[("MongoDB Atlas Cloud Database (alphaerp)")]
        GoogleDrive["Google Sheets 9-Tab Synchronization Engine"]
        SMTPRelay["Nodemailer SMTP Transporter / Mailtrap Sandbox"]
        GeminiPlatform["Google Gemini Live AI Engine (/live)"]
    end

    Agent -->|Code Edits & CLI| ClientApplication
    Agent -->|API & Server Maintenance| BackendRuntimes
    ClientApplication <-->|HTTPS REST| BackendRuntimes
    ClientApplication <-->|WSS Duplex Audio| DedicatedNode
    ExpressRouter <--> InsForgeBaaS
    ExpressRouter <--> MongoDBAtlas
    ExpressRouter --> SMTPRelay
    DedicatedNode <--> GeminiPlatform
    Storage <-->|GIS OAuth 2.0| GoogleDrive
```

---

## 2. Technology Stack & Hard Constraints

1. **Frontend**: React 19, TypeScript 5.8+, Vite 6, Tailwind CSS v4, Lucide React icons, Motion animations.
2. **Backend**: Express 4.21+ running on Node.js 20+ with esbuild bundling:
   - `dist/server.cjs`: Standalone Node.js bundle for Docker, Cloud Run, and Ubuntu Systemd/PM2.
   - `api/index.js`: Serverless bundle for Vercel Serverless Functions.
3. **Database Options**:
   - **InsForge BaaS / PostgreSQL 14+**: Relational schemas in `database/schema.sql` and `database/insforge_schema.sql`.
   - **MongoDB Atlas**: Document store with endpoints in `server/mongodb.ts` and `/api/mongodb/*`.
   - **Browser Storage**: IndexedDB and reactive LocalStorage in `src/services/storageService.ts`.
4. **AI & Voice Engine**: Google GenAI SDK (`@google/genai`) and WebSocket duplex streaming (`/live`).
5. **Email System**: Nodemailer with dynamic fallback to Mock Sandbox wrapper when SMTP credentials are absent.

---

## 3. InsForge Backend-as-a-Service (BaaS) Architecture

This project is configured with [InsForge](https://insforge.dev) for PostgreSQL database operations, user authentication, file storage, edge functions, and real-time events.

- **Project Name:** **hvac-biz**
- **API Base URL:** `https://as2hwz72.us-east.insforge.app`

### 3.1 SDK Client Initialization

```typescript
import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: process.env.VITE_INSFORGE_URL || 'https://as2hwz72.us-east.insforge.app',
  anonKey: process.env.VITE_INSFORGE_ANON_KEY || 'your-anon-key-here'
});
```

### 3.2 Critical InsForge Implementation Rules

- **Array Insert Rule**: All database inserts **MUST** use array format:
  ```typescript
  // CORRECT
  const { data, error } = await insforge.database
    .from('projects')
    .insert([{ project_code: 'PRJ-2026-001', name: 'One BKC Tower' }]);

  // INCORRECT - WILL FAIL
  // .insert({ project_code: 'PRJ-2026-001' })
  ```
- **Error Handling**: All SDK methods return a `{ data, error }` tuple. Always check `if (error)` before proceeding.
- **User Association**: Reference users via `auth.users(id)` and use `auth.uid()` in Row Level Security (RLS) policies.
- **Storage Operations**: When uploading files, always persist both the returned `url` and `key`.

---

## 4. End-to-End HVAC Engineering & Techno-Commercial Workflows

### 4.1 HVAC Quotation to Project BOQ Lifecycle

```mermaid
flowchart TD
    Lead["Lead Created in CRM"] --> Survey["On-Site Survey & Heat Load (TR/CFM)"]
    Survey --> Quote["Techno-Commercial Quote with 18% GST"]
    Quote --> Award{"Quote Approved / Awarded"}
    Award --> Project["Initialize Project Workspace"]
    Project --> BOQ["Generate BOQ Line Items"]
    BOQ --> Check{"Warehouse Stock Check"}
    Check -- Stock Deficit --> PR["Auto-Generate Purchase Requisition (PR)"]
    Check -- Stock Available --> Allocate["Allocate Stock to Project"]
    PR --> PO["Procurement Head Releases Vendor PO"]
    PO --> GRN["Warehouse Goods Receipt Note (GRN) Inwarding"]
    GRN --> Allocate
    Allocate --> Dispatch["Site Dispatch & Installation"]
    Dispatch --> WO["Commissioning Work Order & Signoff"]
    WO --> Invoice["Milestone Invoicing & GAAP Ledger"]
```

### 4.2 Predictive Inventory Safety-Stock Alert Process

```mermaid
flowchart TD
    Stock["Warehouse Stock Monitor"] --> Check{"AvailableStock <= ReorderLevel?"}
    Check -- Yes --> Deficit["Deficit = ReorderLevel - AvailableStock"]
    Deficit --> Alert["POST /api/procurement/reorder-alert-email"]
    Alert --> Mode{"SMTP Configuration"}
    Mode -- Live SMTP --> SMTP["Deliver via SMTP Server (Port 587/465)"]
    Mode -- Sandbox Mock --> Sandbox["Deliver via Resilient Mock Sandbox Wrapper"]
    SMTP --> Audit["Write Event to Immutable Audit Log"]
    Sandbox --> Audit
```

---

## 5. REST & WebSocket API Endpoints

| Method | Endpoint | Description | Key Parameters |
|---|---|---|---|
| `GET` | `/api/health` | Service health, model status & DB config | None |
| `POST` | `/api/procurement/reorder-alert-email` | Dispatches low-stock email alerts | `recipients`, `itemsSummary`, `smtpConfig` |
| `POST` | `/api/email/test-connection` | Validates SMTP connection and sends test email | `host`, `port`, `username`, `password`, `testRecipient` |
| `GET` | `/api/mongodb/status` | MongoDB cluster connection state & stats | None |
| `POST` | `/api/mongodb/test` | Tests MongoDB Atlas ping latency | None |
| `POST` | `/api/mongodb/migrate` | Migrates local state payload into MongoDB | `payload: { projects, quotes, leads, inventory }` |
| `GET` | `/api/mongodb/export` | Full snapshot export of all collections | None |
| `GET` | `/api/mongodb/projects` | Fetches projects array from MongoDB | None |
| `POST` | `/api/mongodb/projects` | Bulk-saves projects array to MongoDB | `projects: [...]` |
| `POST` | `/api/mongodb/project` | Upserts single project in MongoDB | `project: { id, ... }` |
| `WS` | `/live` | Duplex real-time audio voice assistant | 16kHz PCM upstream / 24kHz PCM downstream |

---

## 6. Directory Layout & Module Responsibilities

```
AlphaERP-V1/
├── api/index.ts                         # Vercel Serverless Function adapter
├── server/
│   ├── app.ts                           # Express application & REST routes
│   ├── api-entry.ts                     # Bundling entrypoint for Vercel
│   └── mongodb.ts                       # MongoDB Atlas driver & sync operations
├── server.ts                            # Standalone Node.js server with WebSockets
├── vercel.json                          # Vercel routing rules & security headers
├── database/
│   ├── schema.sql                       # PostgreSQL 14+ DDL Schema
│   ├── insforge_schema.sql              # InsForge BaaS PostgreSQL schema
│   └── seed_data.sql                    # Production HVAC seed data
├── src/
│   ├── App.tsx                          # Root shell & role state
│   ├── main.tsx                         # DOM mounting point
│   ├── index.css                        # Tailwind CSS global styling
│   ├── types/index.ts                   # TypeScript interfaces & enums
│   ├── services/
│   │   ├── storageService.ts            # Reactive storage & audit logger
│   │   ├── googleSheets.ts              # Google Identity Services 9-tab sync
│   │   └── whatsappEmailService.ts      # SMTP alert & WhatsApp formatters
│   └── components/
│       ├── DashboardView.tsx            # Executive KPI & P&L widgets
│       ├── CRMLeadsView.tsx             # Leads & site survey scheduler
│       ├── QuotesView.tsx               # HVAC quotation builder & pricing
│       ├── ProjectsBOQView.tsx          # BOQ shortage reconciliation
│       ├── ProcurementPRPOView.tsx      # PR/PO lifecycle & approvals
│       ├── InventoryWarehouseView.tsx   # Warehouse inventory & bin locations
│       ├── PredictiveInventoryReorderPanel.tsx # Safety-stock alerts & email dispatch
│       ├── WorkOrdersView.tsx           # Field commissioning tickets
│       ├── FinancePaymentsView.tsx      # Milestone invoices & receipts
│       ├── FinanceView.tsx              # GAAP double-entry ledger
│       ├── HRView.tsx                   # 12-module HRMS suite
│       ├── SalesPerformanceView.tsx     # Quota tracking & leaderboard
│       ├── EmailSettingsAdminSection.tsx# SMTP credentials & Sandbox mode
│       ├── LiveAudioAssistantModal.tsx  # Gemini Live voice assistant
│       ├── MongoSyncModal.tsx           # MongoDB Atlas cloud sync
│       └── UserManagementView.tsx       # RBAC role management
```

---

## 7. Verification & Testing

Before submitting changes, ensure you execute:

```bash
# 1. Type-checking and static analysis
npm run lint

# 2. Build verification for all targets (Vite SPA + Serverless + Standalone Server)
npm run build
```

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **oss-project** (API base `https://as2hwz72.us-east.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->
