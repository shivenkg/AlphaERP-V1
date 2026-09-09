import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  Layers,
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  TrendingUp,
  ShoppingCart,
  Boxes,
  Wrench,
  CreditCard,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target,
  Clock,
  ArrowRight,
  TrendingDown,
  Building2,
  DollarSign,
  PieChart,
  Sliders,
  FileSpreadsheet,
  Globe,
  Award,
  BookOpen,
  Share2,
  CheckCheck,
  Grid,
  Info,
  ChevronDown
} from 'lucide-react';
import { JSAlphaSoftLogo } from './JSAlphaSoftLogo';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { triggerPitchDeckPrint, DeckExportProgress } from '../utils/pitchDeckExportHelper';
import { Project, Quote, Lead, InventoryItem, PurchaseOrder, PurchaseRequisition, PaymentRecord, Employee } from '../types';

interface PitchDeckViewProps {
  onNavigateTab: (tab: string) => void;
  projects?: Project[];
  quotes?: Quote[];
  leads?: Lead[];
  inventory?: InventoryItem[];
  pos?: PurchaseOrder[];
  prs?: PurchaseRequisition[];
  payments?: PaymentRecord[];
  employees?: Employee[];
}

interface SlideData {
  id: string;
  category: 'Overview' | 'Problem & Solution' | 'Product Showcase' | 'Market & Business' | 'Vision & Roadmap';
  title: string;
  subtitle: string;
  badge?: string;
  relatedTab?: string;
  speakerNotes: string;
  renderContent: () => React.ReactNode;
}

export const PitchDeckView: React.FC<PitchDeckViewProps> = ({
  onNavigateTab,
  projects = [],
  quotes = [],
  leads = [],
  inventory = [],
  pos = [],
  prs = [],
  payments = [],
  employees = []
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [stagingSlideIndex, setStagingSlideIndex] = useState<number | null>(null);
  const [exportProgress, setExportProgress] = useState<DeckExportProgress | null>(null);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [showPrintMenu, setShowPrintMenu] = useState<boolean>(false);
  const cancelExportRef = useRef<boolean>(false);
  const deckContainerRef = useRef<HTMLDivElement>(null);
  const activeSlideRef = useRef<HTMLDivElement>(null);
  const printableMasterRef = useRef<HTMLDivElement>(null);

  // Compute live real-world metrics from project data
  const totalPipelineValue = useMemo(() => {
    return quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  }, [quotes]);

  const activeProjectsCount = projects.filter((p) => p.status !== 'Completed').length;
  const totalContractValue = projects.reduce((sum, p) => sum + (p.contractValue || 0), 0);
  const avgGrossMargin = quotes.length > 0
    ? (quotes.reduce((sum, q) => sum + (q.grossMarginPct || 0), 0) / quotes.length).toFixed(1)
    : '18.5';

  // Define All Slides for the Pitch Deck
  const slides: SlideData[] = [
    // Slide 1: Cover
    {
      id: 'slide-cover',
      category: 'Overview',
      title: 'AlphaERP & HVAC Biz',
      subtitle: 'The Intelligent Operating System for Turnkey HVAC & MEP Engineering Contractors',
      badge: 'INVESTOR PITCH DECK • SERIES A',
      speakerNotes:
        'Welcome everyone. Today we are presenting AlphaERP by HVAC Biz—the industry-specific operating system designed to solve the multi-billion dollar margin leakage and execution crisis facing HVAC and MEP engineering contractors.',
      renderContent: () => (
        <div className="flex flex-col items-center justify-center text-center h-full px-6 py-8 space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-3 p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-900 flex items-center justify-center shadow-md overflow-hidden shrink-0">
              <JSAlphaSoftLogo variant="icon" size="sm" isDarkTheme={true} />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                HVAC BIZ PRIVATE LIMITED
              </div>
              <div className="text-[11px] text-blue-700 dark:text-blue-300 font-mono">
                Class-1 Licensed HVAC Turnkey Contractor & Enterprise Software
              </div>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
              Proprietary Vertical ERP Platform
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Transforming High-Stakes HVAC & MEP Contracting into a High-Margin Science
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Connecting commercial bidding, parametric BOQ engineering, real-time site procurement, milestone billing, and statutory accounting into a single unified digital thread.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400 font-mono">₹{(totalContractValue / 10000000).toFixed(2)} Cr+</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Active Project Portfolio</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{avgGrossMargin}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Target Gross Margin</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">100%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">BOQ 3-Way Reconciliation</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">Zero</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Spreadsheet Data Leakage</div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: The Industry Problem
    {
      id: 'slide-problem',
      category: 'Problem & Solution',
      title: 'The $120B MEP Contracting Crisis',
      subtitle: 'Why Generic ERPs (SAP, Odoo, QuickBooks) Fail Specialty Engineering Contractors',
      badge: 'THE PROBLEM',
      speakerNotes:
        'HVAC and MEP contractors operate in a high-variance environment. Thin initial bids of 15-20% margin routinely degrade into single digits or losses due to disconnected systems, unmonitored site procurement, and delayed billing cycles.',
      renderContent: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full p-2 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Painful Reality for 85,000+ Contractors</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              A Disconnected Stack Bleeds 6% to 8% of Contractor Margin on Every Job
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Specialized contractors handle complex bills of quantities, multi-tiered subcontractor labor, OEM equipment orders, and rigorous site commissioning. Generic software fails to bridge the gap between engineering plans and field reality.
            </p>

            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 text-xs space-y-1">
              <div className="font-bold text-red-900 dark:text-red-300 uppercase tracking-wider">
                Average Project Erosion Anatomy:
              </div>
              <div className="text-red-800 dark:text-red-200">
                Initial Quoted Margin: <span className="font-bold font-mono">19.2%</span> → Final Handover Margin: <span className="font-bold font-mono text-red-600">8.4%</span> (Over 56% of profits lost to untracked variances, unbilled scope creep, and procurement delays).
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                icon: FileSpreadsheet,
                title: 'Spreadsheet Estimation Silos',
                desc: 'Estimators build complex quotes in Excel. When the tender is awarded, line items are never mapped to warehouse inventory or procurement codes, causing immediate ordering blunders.'
              },
              {
                icon: TrendingDown,
                title: 'Uncontrolled Site Procurement',
                desc: 'Field engineers purchase expensive copper pipes, refrigerants, and valves locally at premium retail rates because central warehouse availability is opaque.'
              },
              {
                icon: Clock,
                title: 'Delayed Milestone Cashflow & Retention Drag',
                desc: 'Contractors wait months to bill clients because milestone completion evidence is scattered across WhatsApp chats, paper challans, and fragmented emails.'
              },
              {
                icon: ShieldCheck,
                title: 'Compliance & Payroll Vulnerability',
                desc: 'Managing field technician site attendance, statutory PF/ESIC deductions, and GST e-invoicing manually creates severe audit and regulatory exposure.'
              }
            ].map((pain, i) => (
              <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 shadow-2xs">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 shrink-0">
                  <pain.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{pain.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{pain.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },

    // Slide 3: The Solution (AlphaERP)
    {
      id: 'slide-solution',
      category: 'Problem & Solution',
      title: 'The Solution: AlphaERP Ecosystem',
      subtitle: 'A Single Source of Truth from First Site Survey to Final Handover Certificate',
      badge: 'OUR SOLUTION',
      speakerNotes:
        'AlphaERP replaces 6 disconnected applications with one cohesive, high-performance platform. It was forged on the frontlines of real HVAC contracting, giving it an unmatched depth of domain-specific logic.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-6">
          <div className="max-w-3xl">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              Engineered Ground-Up for HVAC, VRF, Chiller Plants & Electrical Infrastructure
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Unlike generic accounting software or lightweight CRMs, AlphaERP links every commercial line item directly to engineering specifications, live warehouse inventory, and milestone receivables.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-blue-200 dark:border-blue-900 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Precision BOQ Engineering</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dynamic line-item costing with automatic margin calculations. Instantly converts winning proposals into active project budgets with 1-click conversion.
              </p>
              <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Client PDF Generator Included
              </div>
            </div>

            <div className="p-5 bg-gradient-to-b from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Controlled Supply Chain</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated site shortages trigger Indents (PR) and 3-way matched Purchase Orders (PO). Zero unauthorized off-book purchases, preventing margin erosion.
              </p>
              <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Real-time Warehouse Staging
              </div>
            </div>

            <div className="p-5 bg-gradient-to-b from-emerald-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Automated Finance & HR</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Milestone-based progress billing with retention aging. Integrated double-entry General Ledger, GST/TDS tax records, and 12-subsystem AlphaHRMS payroll.
              </p>
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Full Statutory Compliance
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <div>
                <div className="font-bold text-sm">Experience the Entire Working Ecosystem</div>
                <div className="text-xs text-slate-400">11 integrated core modules built and operating live today.</div>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="no-print px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              data-no-print="true"
            >
              <span>Explore Live ERP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )
    },

    // Slide 4: High-Level Platform Architecture
    {
      id: 'slide-architecture',
      category: 'Product Showcase',
      title: 'Platform Architecture & Digital Thread',
      subtitle: 'How Data Flows Seamlessly Across Every Operational Department',
      badge: 'SYSTEM DESIGN',
      speakerNotes:
        'Notice the continuous flow of data. When an estimate is won, it becomes a project. The BOQ line items auto-populate the warehouse shortage tracker. The shortages generate PRs, POs, and automatically update the General Ledger upon invoice approval.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-800 space-y-1">
              <div className="font-bold text-blue-700 dark:text-blue-400 uppercase text-[10px]">1. Commercial Hub</div>
              <div className="font-bold text-slate-900 dark:text-white">CRM & Quotations</div>
              <div className="text-slate-500 text-[11px]">Leads, Site Surveys, Parametric BOQ, Client PDF Generator.</div>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-slate-800 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-1">
              <div className="font-bold text-indigo-700 dark:text-indigo-400 uppercase text-[10px]">2. Engineering Core</div>
              <div className="font-bold text-slate-900 dark:text-white">Projects & BOQ Engine</div>
              <div className="text-slate-500 text-[11px]">Material Allocation, Budget Milestones, Variance & Variance Alerts.</div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1">
              <div className="font-bold text-amber-700 dark:text-amber-400 uppercase text-[10px]">3. Supply Chain</div>
              <div className="font-bold text-slate-900 dark:text-white">PR/PO & Multi-Warehouse</div>
              <div className="text-slate-500 text-[11px]">Site Indents, 3-Way Match, Vendor PO Dispatch, SKU Stock.</div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
              <div className="font-bold text-emerald-700 dark:text-emerald-400 uppercase text-[10px]">4. Financials & HR</div>
              <div className="font-bold text-slate-900 dark:text-white">Ledger, Billing & HRMS</div>
              <div className="text-slate-500 text-[11px]">Progress Invoicing, Retention Aging, Journal Vouchers, Payroll.</div>
            </div>
          </div>

          <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 font-mono text-xs space-y-4 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-emerald-400 font-bold">DIGITAL THREAD EXECUTION PIPELINE</span>
              <span className="text-slate-500 text-[10px]">Zero Manual Double-Entry</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-[11px]">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-blue-400 font-bold block">Tender Lead</span>
                <span className="text-slate-400 text-[10px]">Heat-Load Calc</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-indigo-400 font-bold block">Quotation BOQ</span>
                <span className="text-slate-400 text-[10px]">Cost vs Selling</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-purple-400 font-bold block">Active Project</span>
                <span className="text-slate-400 text-[10px]">Auto Material Sync</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-amber-400 font-bold block">PR / PO Dispatch</span>
                <span className="text-slate-400 text-[10px]">3-Way Verification</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block">Milestone Bill</span>
                <span className="text-slate-400 text-[10px]">Ledger + GST TDS</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>Security: Role-Based Access Control (RBAC: Admin, Project Manager, Site Engineer, Finance, HR)</span>
              <span className="text-blue-400">Cloud Sync: Google Sheets 2-Way API</span>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5: Main Screen 1 - Executive Dashboard
    {
      id: 'slide-screen-dashboard',
      category: 'Product Showcase',
      title: 'Main Screen 1: Executive Command Center',
      subtitle: 'Live Operational KPIs, Revenue Digest, Margin Sparklines & Critical Alerts',
      badge: 'SCREEN WALKTHROUGH',
      relatedTab: 'dashboard',
      speakerNotes:
        'Here is our Executive Dashboard. Leadership gets an instant high-altitude snapshot: total active projects, gross margin trajectory, procurement bottlenecks, and receivables aging, updated in real time.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Module: <span className="font-bold text-slate-900 dark:text-white">src/components/DashboardView.tsx</span>
            </div>
            <button
              onClick={() => onNavigateTab('dashboard')}
              className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              data-no-print="true"
            >
              <span>Launch Live Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Interactive Screen Preview Container */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-sm">Executive Overview & Margin Health</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                LIVE METRICS CONNECTED
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Pipeline Value</div>
                <div className="text-xl font-bold font-mono text-blue-400">₹{(totalPipelineValue / 10000000).toFixed(2)} Cr</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> Active Estimates
                </div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Active Projects</div>
                <div className="text-xl font-bold font-mono text-white">{activeProjectsCount} Ongoing</div>
                <div className="text-[10px] text-blue-400 mt-0.5">Site Erection Phase</div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Avg Gross Margin</div>
                <div className="text-xl font-bold font-mono text-emerald-400">{avgGrossMargin}%</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Target &gt; 18.0%</div>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Pending Invoices</div>
                <div className="text-xl font-bold font-mono text-amber-400">₹24.8 Lakhs</div>
                <div className="text-[10px] text-amber-300 mt-0.5">Milestone Recovery</div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/80 text-xs space-y-1.5">
              <div className="font-bold text-slate-300 flex items-center justify-between text-[11px]">
                <span>CRITICAL OPERATIONAL ALERTS & NOTIFICATIONS</span>
                <span className="text-[10px] text-blue-400">Auto-Refreshed</span>
              </div>
              <div className="text-slate-400 text-[11px] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Nexus Tech Park 120 TR: 3 copper pipe indents awaiting PM approval before delivery deadline.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>• Real-time Gross Margin Sparklines</div>
            <div>• Bi-directional Google Sheets API Sync</div>
            <div>• Role-Based Privacy Masking for Staff</div>
          </div>
        </div>
      )
    },

    // Slide 6: Main Screen 2 - CRM & HVAC Leads
    {
      id: 'slide-screen-crm',
      category: 'Product Showcase',
      title: 'Main Screen 2: CRM & HVAC Leads Pipeline',
      subtitle: 'Managing Complex Commercial Inquiries, Heat-Load Surveys & Tenders',
      badge: 'SCREEN WALKTHROUGH',
      relatedTab: 'crm',
      speakerNotes:
        'Our CRM tracks inquiries through technical stages: site survey, heat-load calculation, tender review, and techno-commercial submission. With one click, an engineer converts a qualified lead into a formal quote.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Module: <span className="font-bold text-slate-900 dark:text-white">src/components/CRMLeadsView.tsx</span>
            </div>
            <button
              onClick={() => onNavigateTab('crm')}
              className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              data-no-print="true"
            >
              <span>Open CRM & Leads</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-sm">HVAC Pipeline Stages & Technical Site Surveys</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">{leads.length} Enterprise Inquiries</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-bold text-blue-300">Nexus Enterprises</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-900 text-blue-200">Site Survey Done</span>
                </div>
                <div className="text-[11px] text-slate-400">Scope: 120 TR VRF Heat Pump</div>
                <div className="font-mono text-emerald-400 font-bold">Est: ₹1.08 Cr</div>
                <div className="text-[10px] text-slate-500">Rep: Vikramaditya Solanki</div>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-bold text-indigo-300">Lodha FinTech Hub</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-900 text-purple-200">Quotation Issued</span>
                </div>
                <div className="text-[11px] text-slate-400">Scope: 45 TR Chilled Water Fan Coil</div>
                <div className="font-mono text-emerald-400 font-bold">Est: ₹42.5 Lakhs</div>
                <div className="text-[10px] text-slate-500">Rep: Sneha Kulkarni</div>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-bold text-amber-300">Hiranandani Corporate</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-900 text-emerald-200">Won & Awarded</span>
                </div>
                <div className="text-[11px] text-slate-400">Scope: 80 TR High-Sensible IT Hub</div>
                <div className="font-mono text-emerald-400 font-bold">Est: ₹78.9 Lakhs</div>
                <div className="text-[10px] text-slate-500">Project Converted: PRJ-2026-003</div>
              </div>
            </div>

            <div className="p-2.5 bg-blue-950/50 rounded-xl border border-blue-900/80 text-[11px] text-blue-200 flex items-center justify-between">
              <span>Integrated WhatsApp & Email proposal transmission logged with audit trails.</span>
              <span className="font-bold text-white">1-Click &quot;Award to Project&quot;</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>• Heat-Load Calculation Records</div>
            <div>• Sales Rep Commission Attribution</div>
            <div>• WhatsApp Direct Quote Dispatch</div>
          </div>
        </div>
      )
    },

    // Slide 7: Main Screen 3 - Quotes & Estimations
    {
      id: 'slide-screen-quotes',
      category: 'Product Showcase',
      title: 'Main Screen 3: Quotes & BOQ Estimations',
      subtitle: 'Granular Cost vs Selling Price, Margin Guardrails & Client PDF Generator',
      badge: 'SCREEN WALKTHROUGH',
      relatedTab: 'quotes',
      speakerNotes:
        'This is the heart of commercial engineering. QuotesView breaks down every quote into categorized equipment, ducting, piping, and labor. It warns if margin drops below 15% and includes our newly upgraded Client Quotation PDF Generator.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Module: <span className="font-bold text-slate-900 dark:text-white">src/components/QuotesView.tsx</span>
            </div>
            <button
              onClick={() => onNavigateTab('quotes')}
              className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              data-no-print="true"
            >
              <span>Open Quotes View</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-sm">Quote Builder: Granular BOQ Cost vs Client Selling Price</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-600 text-white font-bold">
                Client PDF Generator Included
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-sm text-white">QT-2026-001 • Nexus Tech Park 120 TR VRF Contract</div>
                  <div className="text-slate-400 text-[11px]">Daikin VRV X Inverter Heat Pump • 6 Units • 120 TR Total</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Contractor BOQ Cost:</span>
                    <span className="font-mono text-slate-300 font-semibold">₹88.5 Lakhs</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Client Selling Price:</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">₹1.08 Cr</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold">
                    18.6% Margin
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-[11px] pt-1">
                <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Equipment:</span>
                  <span className="font-mono font-bold text-white">₹51.0 L</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Piping & Insulation:</span>
                  <span className="font-mono font-bold text-white">₹14.2 L</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">GI Ducting & Diffusers:</span>
                  <span className="font-mono font-bold text-white">₹12.8 L</span>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Installation Labor:</span>
                  <span className="font-mono font-bold text-white">₹10.5 L</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-indigo-950/60 rounded-xl border border-indigo-900/80 text-[11px] text-indigo-200 flex items-center justify-between">
              <span>Automatic statutory GST calculation (9% CGST + 9% SGST) and milestone payment scheduling.</span>
              <span className="font-mono font-semibold text-white">Confetti &quot;Award & Convert&quot; Automation</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>• Real-time Gross Margin Guardrails</div>
            <div>• Letterhead Client PDF Generation</div>
            <div>• Seamless Conversion to Project Execution</div>
          </div>
        </div>
      )
    },

    // Slide 8: Main Screen 4 - Projects & BOQ Engine
    {
      id: 'slide-screen-projects',
      category: 'Product Showcase',
      title: 'Main Screen 4: Projects & BOQ Inventory Engine',
      subtitle: 'Execution Tracking, Milestone Budgets & Real-Time Material Shortages',
      badge: 'SCREEN WALKTHROUGH',
      relatedTab: 'projects',
      speakerNotes:
        'Once a quote is converted, it lands in the ProjectsBOQView. The system matches required project materials against warehouse stock, calculates shortages, and allows site managers to trigger purchase requests instantly.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Module: <span className="font-bold text-slate-900 dark:text-white">src/components/ProjectsBOQView.tsx</span>
            </div>
            <button
              onClick={() => onNavigateTab('projects')}
              className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              data-no-print="true"
            >
              <span>Open Projects & BOQ</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">Project Execution & Warehouse Material Allocation</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                PRJ-2026-001 ACTIVE
              </span>
            </div>

            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-sm text-white">Nexus Tech Park 120 TR VRF Installation</span>
                  <span className="text-slate-400 block text-[11px]">PM: Vikramaditya Solanki • Vashi Sector 18</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-mono font-bold text-sm">₹1.08 Cr Value</span>
                  <span className="text-slate-400 text-[10px] block">Progress: 65% Completed</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full w-[65%]" />
              </div>

              {/* Material Allocation Table Snippet */}
              <div className="pt-2 text-[11px] space-y-1">
                <div className="flex justify-between font-bold text-slate-400 uppercase text-[9px] border-b border-slate-700 pb-1">
                  <span>Scope Item</span>
                  <span>Required</span>
                  <span>In Stock</span>
                  <span>Shortage / Status</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Daikin VRV X Outdoor Units (20 HP)</span>
                  <span className="font-mono">6 Nos</span>
                  <span className="font-mono text-emerald-400">6 Nos</span>
                  <span className="text-emerald-400 font-bold">100% Allocated</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Hard Copper Pipe (1-1/8&quot; OD)</span>
                  <span className="font-mono">450 Mtr</span>
                  <span className="font-mono text-amber-400">300 Mtr</span>
                  <span className="text-amber-400 font-bold">150 Mtr Shortage (PR Created)</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-900/80 text-[11px] text-emerald-200 flex items-center justify-between">
              <span>Automatic milestone budgeting (M1 to M5) with Project Completion Billing Modal.</span>
              <span className="font-bold text-white">Project Summary PDF Export</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>• Real-time Shortage Detection</div>
            <div>• Auto Purchase Requisition Trigger</div>
            <div>• Completion Bill & Retention Ledger</div>
          </div>
        </div>
      )
    },

    // Slide 9: Main Screen 5 - Project Cost Variance & Actuals
    {
      id: 'slide-screen-cost-analysis',
      category: 'Product Showcase',
      title: 'Main Screen 5: Project Cost & PO Variance',
      subtitle: 'Target Budget vs Committed POs vs Actuals: Stopping Margin Leakage Early',
      badge: 'SCREEN WALKTHROUGH',
      relatedTab: 'cost_analysis',
      speakerNotes:
        'This is how AlphaERP protects the contractor\'s profit. ProjectCostAnalysisView compares the original estimate against actual purchase orders in real time. If copper pipe or labor costs rise, leadership is alerted before invoices are approved.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Module: <span className="font-bold text-slate-900 dark:text-white">src/components/ProjectCostAnalysisView.tsx</span>
            </div>
            <button
              onClick={() => onNavigateTab('cost_analysis')}
              className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              data-no-print="true"
            >
              <span>Open Cost Analysis</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">Target Cost vs Committed PO vs Actual Spend Breakdown</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                PROFIT MARGIN GUARDRAIL
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Estimated Cost (Budget)</div>
                <div className="text-lg font-bold font-mono text-white mt-1">₹88.50 Lakhs</div>
                <div className="text-[10px] text-slate-400">Baseline Quote</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Committed POs (Purchased)</div>
                <div className="text-lg font-bold font-mono text-blue-400 mt-1">₹86.20 Lakhs</div>
                <div className="text-[10px] text-emerald-400 font-bold">-₹2.30 L Savings</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Projected Net Margin</div>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-1">20.1% (+1.5%)</div>
                <div className="text-[10px] text-emerald-400">Above Quoted 18.6%</div>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-1">
              <div className="font-bold text-slate-300 text-[11px]">Category Level Variance Tracking:</div>
              <div className="text-slate-400 text-[11px] leading-relaxed">
                Equipment variance: <span className="text-emerald-400 font-semibold font-mono">0.0%</span> • Piping & Insulation: <span className="text-emerald-400 font-semibold font-mono">-2.4% (Favorable)</span> • Ducting & Grilles: <span className="text-amber-400 font-semibold font-mono">+1.8% (Raw GI Steel Spike)</span>.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>• Real-time Margin Erosion Alerts</div>
            <div>• Committed PO vs Uncommitted Delta</div>
            <div>• Early Warning Before Invoice Clearance</div>
          </div>
        </div>
      )
    },

    // Slide 10: Main Screen 6 - Procurement (PR & PO Pipeline)
    {
      id: 'slide-screen-procurement',
      category: 'Product Showcase',
      title: 'Main Screen 6: Procurement PR & PO Pipeline',
      subtitle: '3-Way Matching, Multi-Tier Approvals & Instant Vendor PO Generation',
      badge: 'SCREEN WALKTHROUGH',
      relatedTab: 'procurement',
      speakerNotes:
        'Procurement is strictly tied to project budgets. When site engineers submit a Purchase Requisition, it routes to the Project Manager and Finance. Once approved, the system generates an official PO PDF and dispatches it directly to the vendor.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Module: <span className="font-bold text-slate-900 dark:text-white">src/components/ProcurementPRPOView.tsx</span>
            </div>
            <button
              onClick={() => onNavigateTab('procurement')}
              className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              data-no-print="true"
            >
              <span>Open PR/PO Pipeline</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm">Purchase Requisition (PR) to Approved PO Flow</span>
              </div>
              <span className="text-xs font-mono text-slate-400">{pos.length} Active Purchase Orders</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-mono font-bold text-amber-400">PR-2026-004</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">Pending PM Approval</span>
                </div>
                <div className="text-white font-semibold">Copper Tubing & Armacell Class-O Insulation</div>
                <div className="text-slate-400 text-[11px]">Requested by: Site Eng. Rohan • Project: Nexus 120 TR</div>
                <div className="font-mono text-slate-200">Est. Amount: ₹3.42 Lakhs</div>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-mono font-bold text-emerald-400">PO-2026-001</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">Issued to Vendor</span>
                </div>
                <div className="text-white font-semibold">Daikin Airconditioning India Pvt Ltd</div>
                <div className="text-slate-400 text-[11px]">Item: 6x VRV X Heat Recovery ODUs + Y-Joints</div>
                <div className="font-mono text-emerald-400 font-bold">PO Value: ₹41.40 Lakhs (GST Inc.)</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700 text-[11px] text-slate-300 flex items-center justify-between">
              <span>Automatic 3-Way Match between PO, Goods Receipt Note (GRN), and Vendor Invoice.</span>
              <span className="font-bold text-blue-400">PO PDF Document Export</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>• Multi-Tier Approval Chain</div>
            <div>• Vendor Rate Benchmarking</div>
            <div>• Automated PO Delivery Tracking</div>
          </div>
        </div>
      )
    },

    // Slide 11: Main Screen 7 & 8 - Warehouse & Work Orders
    {
      id: 'slide-screen-warehouse-workorders',
      category: 'Product Showcase',
      title: 'Main Screens 7 & 8: Warehouse & Field Operations',
      subtitle: 'Multi-Location Stock Control, Serial Tracking & Mobile Field Ticketing',
      badge: 'SCREEN WALKTHROUGH',
      relatedTab: 'inventory',
      speakerNotes:
        'HVAC execution lives in the field. Our Warehouse module tracks equipment down to serial numbers and reorder thresholds, while Work Orders handles technician dispatch, commissioning checklists, and tool asset returns.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Modules: <span className="font-bold text-slate-900 dark:text-white">InventoryWarehouseView & WorkOrdersView</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigateTab('inventory')}
                className="no-print flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
                data-no-print="true"
              >
                <span>Warehouse</span>
                <Boxes className="w-3 h-3" />
              </button>
              <button
                onClick={() => onNavigateTab('workorders')}
                className="no-print flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                data-no-print="true"
              >
                <span>Work Orders</span>
                <Wrench className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Warehouse Card */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-sm">Warehouse Stock & Reorder Triggers</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Multi-Location</span>
              </div>
              <div className="text-xs text-slate-300 space-y-2">
                <div className="p-2 bg-slate-800 rounded-lg flex justify-between">
                  <span>R-410A Refrigerant Cylinders (45kg)</span>
                  <span className="font-mono font-bold text-emerald-400">18 In Stock</span>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg flex justify-between">
                  <span>VRF Inverter Compressor 10HP</span>
                  <span className="font-mono font-bold text-amber-400">2 Units (Reorder Level)</span>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg flex justify-between">
                  <span>Galvanized Steel Sheets (22 Gauge)</span>
                  <span className="font-mono font-bold text-white">4.8 Tons In Stock</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400">Barcode/QR scanning for site dispatch & staging.</div>
            </div>

            {/* Field Operations Card */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm">Field Work Orders & Commissioning</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400">Mobile Ready</span>
              </div>
              <div className="text-xs text-slate-300 space-y-2">
                <div className="p-2 bg-slate-800 rounded-lg flex justify-between">
                  <span>WO-901: Nitrogen Pressure Testing</span>
                  <span className="text-emerald-400 font-bold">Passed (450 PSI)</span>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg flex justify-between">
                  <span>WO-902: Air Balancing (TAB) CFM Signoff</span>
                  <span className="text-blue-400 font-bold">In Progress</span>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg flex justify-between">
                  <span>WO-903: Company Tools Return Verification</span>
                  <span className="text-slate-300 font-bold">Flaring Tool Returned</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400">Includes company asset return logging & remark tracking.</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>• Minimum Stock Safety Thresholds</div>
            <div>• Technician Digital Signatures</div>
            <div>• Asset Return Remarks & Checklist</div>
          </div>
        </div>
      )
    },

    // Slide 12: Main Screen 9 & 10 - Finance, Invoicing & General Ledger
    {
      id: 'slide-screen-finance',
      category: 'Product Showcase',
      title: 'Main Screens 9 & 10: Invoicing, Receivables & General Ledger',
      subtitle: 'Milestone Progress Billing, Retention Recovery, TDS & Double-Entry Accounting',
      badge: 'SCREEN WALKTHROUGH',
      relatedTab: 'finance',
      speakerNotes:
        'Cashflow is king in contracting. Our Finance suite automates milestone invoices, tracks client retention money, and feeds directly into a double-entry General Ledger complete with GST e-invoicing and TDS compliance.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Modules: <span className="font-bold text-slate-900 dark:text-white">FinancePaymentsView & FinanceView</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigateTab('payments')}
                className="no-print flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
                data-no-print="true"
              >
                <span>Invoices & Receivables</span>
                <CreditCard className="w-3 h-3" />
              </button>
              <button
                onClick={() => onNavigateTab('finance')}
                className="no-print flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                data-no-print="true"
              >
                <span>General Ledger</span>
                <Landmark className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-sm">Contractor Financial Integrity & Statutory Tax Schedule</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">Tally / SAP Interface Ready</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Progress Milestone Billing</div>
                <div className="text-base font-bold font-mono text-white">INV-2026-003</div>
                <div className="text-emerald-400 font-mono font-semibold">₹32.40 Lakhs (30% Equipment Dispatch)</div>
                <div className="text-[10px] text-slate-400">Status: Client Paid via RTGS</div>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Retention Money Ledger</div>
                <div className="text-base font-bold font-mono text-amber-400">₹10.80 Lakhs (10%)</div>
                <div className="text-slate-300 text-[11px]">Matures: 12 Mos Post Handover</div>
                <div className="text-[10px] text-amber-300">Automated Aging Notification</div>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Tax Compliance Schedule</div>
                <div className="text-base font-bold font-mono text-blue-400">18% GST (Works Contract)</div>
                <div className="text-slate-300 text-[11px]">CGST 9% + SGST 9% Reconciled</div>
                <div className="text-[10px] text-blue-300">TDS 2% Section 194C Deducted</div>
              </div>
            </div>

            <div className="p-2.5 bg-purple-950/60 rounded-xl border border-purple-900/80 text-[11px] text-purple-200 flex items-center justify-between">
              <span>Automated Double-Entry Journal Vouchers generated on every invoice approval & PO settlement.</span>
              <span className="font-bold text-white">Balance Sheet & P&L Ready</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>• Milestone Receivables Aging</div>
            <div>• Automated Bank RTGS Coordinates</div>
            <div>• Statutory TDS & GST Vouchers</div>
          </div>
        </div>
      )
    },

    // Slide 13: Main Screen 11 - AlphaHR Suite & Workforce Management
    {
      id: 'slide-screen-hr',
      category: 'Product Showcase',
      title: 'Main Screen 11: AlphaHR Suite & Employee Portal',
      subtitle: 'ATS Recruitment, Biometric Attendance, Statutory Payroll & 3-Tier Exit Approvals',
      badge: 'SCREEN WALKTHROUGH',
      relatedTab: 'hr',
      speakerNotes:
        'Managing hundreds of technicians, engineers, and contract staff is streamlined through AlphaHR. It features 12 specialized subsystems including biometric attendance, statutory payroll (PF, ESIC, PT), and our newly upgraded 3-tier resignation approval workflow.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Module: <span className="font-bold text-slate-900 dark:text-white">src/components/HRView.tsx</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigateTab('hr')}
                className="no-print flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                data-no-print="true"
              >
                <span>Launch AlphaHR Suite</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-sm">AlphaHR: 12 Integrated Subsystems & Self-Service Portal</span>
              </div>
              <span className="text-xs font-mono text-emerald-400">12 Enterprise Subsystems</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                <span className="text-indigo-400 font-bold block text-[11px]">1. Talent Acquisition</span>
                <span className="text-slate-400 text-[10px]">Kanban ATS & Candidate Pipeline</span>
              </div>
              <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                <span className="text-blue-400 font-bold block text-[11px]">2. Attendance & Roster</span>
                <span className="text-slate-400 text-[10px]">Biometric Geo-fenced Punch</span>
              </div>
              <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                <span className="text-emerald-400 font-bold block text-[11px]">3. Statutory Payroll</span>
                <span className="text-slate-400 text-[10px]">PF, ESIC, PT, TDS Formula Engine</span>
              </div>
              <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700">
                <span className="text-purple-400 font-bold block text-[11px]">4. Multi-Tier Exit Flow</span>
                <span className="text-slate-400 text-[10px]">Manager → Admin → HR → Finance F&F</span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Full & Final (F&F) Settlement Automation</div>
                <div className="text-slate-400 text-[11px]">Tracks company asset handover remarks, notice pay, gratuity, and leaves.</div>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold">
                Zero Audit Lag
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>• Automated Payslip PDF Generation</div>
            <div>• ESS / MSS Mobile Self-Service</div>
            <div>• Statutory Compliance Guarantee</div>
          </div>
        </div>
      )
    },

    // Slide 14: Market Opportunity & TAM
    {
      id: 'slide-market',
      category: 'Market & Business',
      title: 'Market Opportunity & Expansion',
      subtitle: '$250 Billion Global HVAC Boom Powered by Urbanization & Data Centers',
      badge: 'MARKET SIZE',
      speakerNotes:
        'The Total Addressable Market is exploding. Increased demand for high-efficiency inverter heat pumps, data center cooling, pharmaceutical cleanrooms, and corporate real estate is driving double-digit growth in specialized MEP contracting.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase">Total Addressable Market</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">$250 B+</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Global HVAC equipment installation & turnkey MEP engineering services by 2030.</p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-indigo-600 uppercase">Serviceable Addressable Market</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">$45 B</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Commercial & industrial HVAC contractors in India, Middle East, and Southeast Asia.</p>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-emerald-600 uppercase">Serviceable Obtainable Market</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">$1.8 B</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Vertical SaaS & ERP software spend by Tier-1 & Tier-2 engineering contractors.</p>
            </div>
          </div>

          <div className="p-5 bg-blue-50/70 dark:bg-slate-800/60 rounded-2xl border border-blue-200 dark:border-blue-900 space-y-3">
            <h4 className="font-bold text-sm text-blue-950 dark:text-blue-300 uppercase tracking-wider">
              Macro Growth Tailwinds Accelerating Adoption:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-slate-800">
                <span className="font-bold block text-slate-900 dark:text-white">1. Data Center Boom</span>
                <span className="text-slate-500 text-[11px]">Precision liquid and chilled water cooling contracts growing at 28% CAGR.</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-slate-800">
                <span className="font-bold block text-slate-900 dark:text-white">2. Green Building Mandates</span>
                <span className="text-slate-500 text-[11px]">LEED & IGBC compliance requires strict verification of equipment efficiency & air balancing.</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-slate-800">
                <span className="font-bold block text-slate-900 dark:text-white">3. Generational Handover</span>
                <span className="text-slate-500 text-[11px]">Second-generation contractor leadership demands modern cloud ERP over outdated desktop software.</span>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 15: Business Model & Monetization
    {
      id: 'slide-business-model',
      category: 'Market & Business',
      title: 'Business Model & Unit Economics',
      subtitle: 'SaaS Subscription Tiers + High-Margin Enterprise Implementation',
      badge: 'MONETIZATION',
      speakerNotes:
        'AlphaERP operates on a SaaS subscription model tiered by active project capacity and user seats, augmented by enterprise onboarding services and supplier marketplace transaction fees.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-bold text-base text-slate-900 dark:text-white">Growth Contractor</div>
              <div className="text-2xl font-black text-blue-600 font-mono">₹25,000 <span className="text-xs font-normal text-slate-500">/ mo</span></div>
              <p className="text-xs text-slate-500">For contractors executing up to 5 concurrent projects.</p>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                <li>• CRM & Lead Pipeline</li>
                <li>• BOQ Quote Estimator</li>
                <li>• Client PDF Generator</li>
                <li>• 10 Team User Seats</li>
              </ul>
            </div>

            <div className="p-5 bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-blue-600 shadow-md space-y-3 relative">
              <span className="absolute -top-3 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase">
                Most Popular
              </span>
              <div className="font-bold text-base text-slate-900 dark:text-white">Turnkey Enterprise</div>
              <div className="text-2xl font-black text-blue-700 dark:text-blue-400 font-mono">₹65,000 <span className="text-xs font-normal text-slate-500">/ mo</span></div>
              <p className="text-xs text-slate-500">For mid-size MEP contractors handling up to 25 active sites.</p>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                <li>• Everything in Growth</li>
                <li>• PR/PO 3-Way Match & Warehouse</li>
                <li>• Milestone Progress Invoicing</li>
                <li>• Full AlphaHRMS & Payroll</li>
                <li>• 50 User Seats</li>
              </ul>
            </div>

            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-bold text-base text-slate-900 dark:text-white">EPC Mega-Projects</div>
              <div className="text-2xl font-black text-indigo-600 font-mono">₹1,50,000+ <span className="text-xs font-normal text-slate-500">/ mo</span></div>
              <p className="text-xs text-slate-500">For large industrial infrastructure & data center contractors.</p>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                <li>• Unlimited Active Projects</li>
                <li>• Custom General Ledger COA</li>
                <li>• Dedicated Cloud Run Tenant</li>
                <li>• Bi-directional ERP Bridge</li>
                <li>• 24/7 Priority SLA Support</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div>Target LTV/CAC: <span className="font-bold font-mono text-emerald-600">5.8x</span></div>
            <div>Gross Margin on Software: <span className="font-bold font-mono text-blue-600">84%</span></div>
            <div>Net Revenue Retention: <span className="font-bold font-mono text-purple-600">124%</span></div>
          </div>
        </div>
      )
    },

    // Slide 16: Competitive Landscape & Moat
    {
      id: 'slide-moat',
      category: 'Market & Business',
      title: 'Competitive Moat: Why We Win',
      subtitle: 'Generic Horizontal ERPs vs Specialized Vertical Mastery',
      badge: 'COMPETITIVE EDGE',
      speakerNotes:
        'Why can\'t SAP or Salesforce compete here? Because their implementation takes 18 months, costs hundreds of thousands, and still requires contractors to customize HVAC heat-load logic and retention money tables from scratch. AlphaERP is turnkey on Day 1.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-200 dark:border-slate-700">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 border border-slate-200 dark:border-slate-700">Capability</th>
                  <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-center text-blue-600 font-black bg-blue-50 dark:bg-blue-950/40">AlphaERP</th>
                  <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">SAP / Oracle</th>
                  <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">Odoo / Zoho</th>
                  <th className="p-2.5 border border-slate-200 dark:border-slate-700 text-center">Excel / Spreadsheets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                {[
                  { feat: 'Turnkey HVAC BOQ Cost vs Selling Builder', alpha: true, sap: false, odoo: false, excel: true },
                  { feat: 'Automated Client Quotation PDF Generator', alpha: true, sap: false, odoo: false, excel: false },
                  { feat: 'Live Material Shortage to PR Auto-Trigger', alpha: true, sap: false, odoo: false, excel: false },
                  { feat: 'Project Cost Variance & Margin Guardrail', alpha: true, sap: true, odoo: false, excel: false },
                  { feat: 'Retention Money Aging & Progress Invoicing', alpha: true, sap: false, odoo: false, excel: false },
                  { feat: 'Integrated 12-Subsystem AlphaHRMS Payroll', alpha: true, sap: false, odoo: false, excel: false },
                  { feat: 'Time to Value / Deployment Speed', alpha: '2 Weeks', sap: '12-18 Months', odoo: '3-6 Months', excel: 'Immediate' },
                  { feat: 'Implementation Cost', alpha: 'Low', sap: '$150k+', odoo: '$25k+', excel: 'Hidden (Errors)' }
                ].map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/40'}>
                    <td className="p-2.5 border border-slate-200 dark:border-slate-700 font-medium">{row.feat}</td>
                    <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center font-bold bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400">
                      {typeof row.alpha === 'boolean' ? (row.alpha ? '✓ Yes' : '✕') : row.alpha}
                    </td>
                    <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center text-slate-400">
                      {typeof row.sap === 'boolean' ? (row.sap ? '✓' : '✕ No') : row.sap}
                    </td>
                    <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center text-slate-400">
                      {typeof row.odoo === 'boolean' ? (row.odoo ? '✓' : '✕ No') : row.odoo}
                    </td>
                    <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center text-slate-400">
                      {typeof row.excel === 'boolean' ? (row.excel ? '✓ Manual' : '✕ No') : row.excel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 font-medium">
            Core Moat: Real-world operational battle-testing by HVAC Biz ensures every workflow, unit rate, and approval logic aligns with practical site reality.
          </div>
        </div>
      )
    },

    // Slide 17: Vision, Roadmap & The Ask
    {
      id: 'slide-vision-ask',
      category: 'Vision & Roadmap',
      title: 'Vision, Product Roadmap & The Ask',
      subtitle: 'Building the Global Operating System for MEP Infrastructure Engineering',
      badge: 'THE FUTURE',
      speakerNotes:
        'In Phase 2, we are integrating AI drawing takeoff from CAD/BIM files, IoT telematics from active chiller plants, and an automated subcontractor marketplace. We invite you to join us on this journey.',
      renderContent: () => (
        <div className="flex flex-col justify-between h-full p-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-xs uppercase text-blue-600">Q3 - Q4 2026</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">AI Drawing BOQ Takeoff</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Computer vision & LLM parser to ingest 2D DWG and PDF floor plans, automatically extracting duct lengths, tonnage, and diffuser counts.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-xs uppercase text-indigo-600">Q1 - Q2 2027</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">IoT BMS Telematics</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct integration with Daikin, Voltas, and Carrier BACnet controllers for continuous sensor monitoring and predictive warranty maintenance.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-xs uppercase text-emerald-600">Q3 - Q4 2027</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Supplier Marketplace</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct wholesale material ordering from certified copper, steel, and insulation manufacturers with automated trade credit financing.
              </p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-300">Contact & Investor Relations</div>
              <div className="text-xl font-bold">HVAC BIZ PRIVATE LIMITED</div>
              <div className="text-xs text-blue-200">Plot No. 42, Sector 18, Vashi Commercial Hub, Navi Mumbai, MH - 400705</div>
              <div className="text-xs text-blue-300/80 font-mono pt-1">Email: contact@hvacbiz.com • Phone: +91 22 2789 4400</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => onNavigateTab('dashboard')}
                className="no-print px-5 py-2.5 bg-white text-blue-950 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                data-no-print="true"
              >
                Experience Live Demo
              </button>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentSlide = slides[currentSlideIndex];

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key.toLowerCase() === 'f') {
        setIsFullscreen((prev) => !prev);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, isFullscreen]);

  // Fallback vector slide renderer for jsPDF when canvas capture encounters constraints
  const renderVectorSlideFallback = (
    pdf: jsPDF,
    slide: SlideData,
    slideIndex: number,
    totalSlides: number
  ) => {
    // 1. Clean presentation background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 297, 210, 'F');

    // 2. Top accent stripe (Deep navy blue)
    pdf.setFillColor(15, 23, 42);
    pdf.rect(12, 10, 273, 2.5, 'F');

    // 3. Header row: Badge, Category, AlphaERP branding
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(2, 132, 199);
    pdf.text((slide.badge || slide.category).toUpperCase(), 14, 20);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`• ${slide.category}`, 75, 20);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(15, 23, 42);
    pdf.text('AlphaERP • Series A Presentation', 283, 20, { align: 'right' });

    // 4. Slide Title & Subtitle
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(15, 23, 42);
    const titleLines = pdf.splitTextToSize(slide.title, 260);
    pdf.text(titleLines, 14, 30);

    const titleBottomY = 30 + (titleLines.length * 7);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    const subtitleLines = pdf.splitTextToSize(slide.subtitle, 260);
    pdf.text(subtitleLines, 14, titleBottomY);

    const dividerY = titleBottomY + (subtitleLines.length * 5) + 4;
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.4);
    pdf.line(14, dividerY, 283, dividerY);

    // 5. Card container for content / notes
    const contentY = dividerY + 6;
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(14, contentY, 269, 125, 3, 3, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(14, contentY, 269, 125, 3, 3, 'S');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(30, 41, 59);
    pdf.text('Executive Summary & Strategic Overview:', 20, contentY + 12);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(51, 65, 85);
    const notesText = slide.speakerNotes || slide.subtitle;
    const notesLines = pdf.splitTextToSize(notesText, 255);
    pdf.text(notesLines, 20, contentY + 22);

    // 6. Footer
    pdf.setDrawColor(226, 232, 240);
    pdf.line(14, 196, 283, 196);

    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('HVAC Biz Private Limited • AlphaERP Intelligent Operating System for Turnkey MEP • Confidential', 14, 203);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Slide ${slideIndex + 1} of ${totalSlides}`, 283, 203, { align: 'right' });
  };

  // High-fidelity PDF Export Handler (Multi-slide or single slide with on-screen staging)
  const handleExportDeckPDF = async (mode: 'full' | 'current' = 'full') => {
    setShowExportMenu(false);
    setShowPrintMenu(false);
    cancelExportRef.current = false;
    setIsExportingPDF(true);

    try {
      const isSingle = mode === 'current';
      const indicesToExport: number[] = isSingle
        ? [currentSlideIndex]
        : slides.map((_, i) => i);
      const total = indicesToExport.length;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = 297;
      const pageHeight = 210;
      const maxContentWidth = 285;
      const maxContentHeight = 198;

      let validPages = 0;

      for (let i = 0; i < total; i++) {
        if (cancelExportRef.current) {
          console.log('PDF export cancelled by user.');
          break;
        }

        const slideIdx = indicesToExport[i];
        const slide = slides[slideIdx];

        // 1. Stage the slide and update visual progress feedback
        setStagingSlideIndex(slideIdx);
        setExportProgress({
          current: i + 1,
          total,
          slideTitle: slide.title,
          percent: Math.round(((i + 1) / total) * 100)
        });

        // 2. Allow the browser engine to paint the DOM element
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (cancelExportRef.current) break;

        // 3. Locate the staged DOM element
        const stagingEl = document.getElementById('pitch-deck-pdf-staging-element');
        let capturedCanvas: HTMLCanvasElement | null = null;

        if (stagingEl) {
          try {
            // High quality canvas capture with html2canvas-pro (native oklch & modern CSS support)
            const capturePromise = html2canvas(stagingEl, {
              scale: 1.5,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              logging: false,
              width: 1200,
              windowWidth: 1200,
              scrollX: 0,
              scrollY: 0,
              x: 0,
              y: 0,
              ignoreElements: (element) => {
                if (!element || !(element instanceof Element)) return false;
                return (
                  element.classList?.contains('no-print') ||
                  element.getAttribute?.('data-no-print') === 'true' ||
                  element.id === 'pdf-export-progress-modal'
                );
              },
              onclone: (clonedDoc) => {
                const modal = clonedDoc.getElementById('pdf-export-progress-modal');
                if (modal) modal.remove();
              }
            });

            // 6-second timeout safety guard per slide
            const timeoutPromise = new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error('Slide capture timed out')), 6000)
            );

            capturedCanvas = (await Promise.race([capturePromise, timeoutPromise])) as HTMLCanvasElement | null;
          } catch (captureErr) {
            console.warn(`Canvas capture timed out or failed for slide ${slideIdx + 1} (${slide.title}), using vector fallback:`, captureErr);
          }
        }

        if (cancelExportRef.current) break;

        if (validPages > 0) {
          pdf.addPage();
        }

        // 4. Render slide into PDF: Canvas image or high-quality vector fallback
        if (capturedCanvas && capturedCanvas.width > 0 && capturedCanvas.height > 0) {
          const imgData = capturedCanvas.toDataURL('image/jpeg', 0.94);

          let renderWidth = maxContentWidth;
          let renderHeight = (capturedCanvas.height * renderWidth) / capturedCanvas.width;

          if (renderHeight > maxContentHeight) {
            renderHeight = maxContentHeight;
            renderWidth = (capturedCanvas.width * renderHeight) / capturedCanvas.height;
          }

          const posX = (pageWidth - renderWidth) / 2;
          const posY = (pageHeight - renderHeight) / 2;

          pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
        } else {
          renderVectorSlideFallback(pdf, slide, i, total);
        }

        validPages++;
      }

      if (!cancelExportRef.current && validPages > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const filename = isSingle
          ? `AlphaERP_Pitch_Deck_Slide_${currentSlideIndex + 1}_${todayStr}.pdf`
          : `AlphaERP_Investor_Pitch_Deck_Complete_17_Slides_${todayStr}.pdf`;

        try {
          pdf.save(filename);
        } catch (saveErr) {
          console.warn('Direct pdf.save failed, using fallback blob download link:', saveErr);
          const blob = pdf.output('blob');
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
          }, 4000);
        }
      }
    } catch (err) {
      console.error('Error exporting Pitch Deck to PDF:', err);
    } finally {
      setStagingSlideIndex(null);
      setIsExportingPDF(false);
      setExportProgress(null);
    }
  };

  // Dedicated Print Handlers (A4 Landscape, multi-slide or single slide)
  const handlePrintDeck = (mode: 'full' | 'current' = 'full') => {
    setShowPrintMenu(false);
    setShowExportMenu(false);

    if (mode === 'current') {
      const singleEl = deckContainerRef.current;
      if (singleEl) {
        triggerPitchDeckPrint(
          singleEl.outerHTML,
          `AlphaERP - Slide ${currentSlideIndex + 1} (${slides[currentSlideIndex].title})`
        );
      }
    } else {
      if (printableMasterRef.current) {
        triggerPitchDeckPrint(
          printableMasterRef.current.innerHTML,
          'AlphaERP - Full Investor Pitch Deck & System Walkthrough'
        );
      }
    }
  };

  return (
    <div
      className={`space-y-4 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto'
          : 'pb-16'
      }`}
    >
      {/* Top Deck Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                AlphaERP Official Pitch Deck & Product Showcase
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive presentation covering the industry problem, platform architecture, all 11 core screens, and unit economics.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowThumbnails((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showThumbnails
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Toggle Slide Grid Overview"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Slides Grid</span>
          </button>

          <button
            onClick={() => setShowSpeakerNotes((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showSpeakerNotes
                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Toggle Presenter Speaker Notes"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Speaker Notes</span>
          </button>

          {/* Print Presentation Dropdown */}
          <div className="relative">
            <div className="inline-flex rounded-xl shadow-xs">
              <button
                onClick={() => handlePrintDeck('full')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-l-xl border border-r-0 border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
                title="Print Full Deck (All 17 Slides in Landscape)"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Deck</span>
              </button>
              <button
                onClick={() => {
                  setShowPrintMenu((prev) => !prev);
                  setShowExportMenu(false);
                }}
                className="px-1.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-r-xl border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
                title="Print Options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {showPrintMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPrintMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Print Pitch Deck</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">A4 Landscape with exact slide pages</div>
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => handlePrintDeck('full')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 transition-colors flex items-start gap-2.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>Print All 17 Slides</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Booklet</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">1 slide per sheet for meeting handouts</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handlePrintDeck('current')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-start gap-2.5 cursor-pointer"
                    >
                      <Presentation className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Print Current Slide ({currentSlideIndex + 1}/{slides.length})</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Prints only the active slide in landscape</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Export Deck PDF Dropdown */}
          <div className="relative">
            <div className="inline-flex rounded-xl shadow-xs">
              <button
                onClick={() => handleExportDeckPDF('full')}
                disabled={isExportingPDF}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-l-xl transition-all disabled:opacity-50 cursor-pointer"
                title="Export Complete 17-Slide Deck to Landscape PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingPDF ? 'Exporting...' : 'Export Deck PDF'}</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu((prev) => !prev);
                  setShowPrintMenu(false);
                }}
                disabled={isExportingPDF}
                className="px-1.5 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-r-xl border-l border-blue-500/40 transition-all disabled:opacity-50 cursor-pointer"
                title="Export Options"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Export Presentation to PDF</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Exact landscape slide pages without clipping</div>
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => handleExportDeckPDF('full')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 transition-colors flex items-start gap-2.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>Complete Deck (All 17 Slides)</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Recommended</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">17-page presentation deck for investors</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleExportDeckPDF('current')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors flex items-start gap-2.5 cursor-pointer"
                    >
                      <Presentation className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Current Slide Only (Slide {currentSlideIndex + 1})</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Single landscape presentation page</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Slide Thumbnails Drawer (Optional) */}
      {showThumbnails && (
        <div className="bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-inner overflow-x-auto">
          <div className="flex items-center gap-3 min-w-max pb-1">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  setShowThumbnails(false);
                }}
                className={`w-36 text-left p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                  currentSlideIndex === idx
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono opacity-80 mb-1">
                  <span>Slide {idx + 1}</span>
                  <span className="truncate max-w-[60px]">{s.category}</span>
                </div>
                <div className="font-bold text-xs truncate">{s.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Active Slide Display Stage */}
      <div
        ref={deckContainerRef}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col justify-between min-h-[560px] sm:min-h-[620px] transition-all"
      >
        {/* Slide Top Header Bar */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-mono">
                {currentSlide.badge || currentSlide.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                • {currentSlide.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentSlide.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {currentSlide.subtitle}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              <JSAlphaSoftLogo variant="icon" size="xs" isDarkTheme={true} />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white">AlphaERP</div>
              <div className="text-[10px] text-slate-400 font-mono">Series A Deck</div>
            </div>
          </div>
        </div>

        {/* Slide Body Content */}
        <div ref={activeSlideRef} className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {currentSlide.renderContent()}
        </div>

        {/* Speaker Notes Overlay (If enabled) */}
        {showSpeakerNotes && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900 px-6 py-3 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2 animate-in slide-in-from-bottom-2 duration-150">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase text-[10px] tracking-wider text-amber-800 dark:text-amber-400 block">
                Presenter Script / Talking Points:
              </span>
              <p className="leading-relaxed mt-0.5">{currentSlide.speakerNotes}</p>
            </div>
          </div>
        )}

        {/* Slide Bottom Navigation Bar */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-30 transition-all cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline">
              Tip: Use Arrow Keys or Space to navigate • Press F for Fullscreen
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Slide Dots Indicator */}
            <div className="hidden md:flex items-center gap-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    currentSlideIndex === idx
                      ? 'w-6 bg-blue-600'
                      : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              {currentSlideIndex + 1} / {slides.length}
            </div>
          </div>
        </div>
      </div>

      {/* Active PDF Export Staging Canvas (Mounted at (0,0) behind the progress modal during PDF capture) */}
      {isExportingPDF && stagingSlideIndex !== null && slides[stagingSlideIndex] && (
        <div
          id="pitch-deck-pdf-staging-wrapper"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '1200px',
            minHeight: '680px',
            zIndex: 40,
            backgroundColor: '#ffffff',
            color: '#0f172a',
            pointerEvents: 'none',
            overflow: 'visible'
          }}
          className="bg-white text-slate-900"
        >
          <div
            id="pitch-deck-pdf-staging-element"
            style={{
              width: '1200px',
              minHeight: '680px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              boxSizing: 'border-box'
            }}
            className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-8 flex flex-col justify-between shadow-xs"
          >
            {/* Slide Header */}
            <div className="pb-4 mb-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                    {slides[stagingSlideIndex].badge || slides[stagingSlideIndex].category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    • {slides[stagingSlideIndex].category}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {slides[stagingSlideIndex].title}
                </h2>
                <p className="text-sm text-slate-600">
                  {slides[stagingSlideIndex].subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-blue-900 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  <JSAlphaSoftLogo variant="icon" size="xs" isDarkTheme={true} />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">AlphaERP</div>
                  <div className="text-[10px] text-slate-500 font-mono">Series A Presentation</div>
                </div>
              </div>
            </div>

            {/* Slide Body */}
            <div className="flex-1 overflow-visible">
              {slides[stagingSlideIndex].renderContent()}
            </div>

            {/* Slide Footer */}
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">HVAC Biz Private Limited</span>
                <span>•</span>
                <span>AlphaERP Intelligent Operating System for Turnkey MEP</span>
                <span>•</span>
                <span>Confidential</span>
              </div>
              <div className="font-mono font-bold text-slate-800">
                Slide {stagingSlideIndex + 1} of {slides.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Progress Modal */}
      {isExportingPDF && (
        <div id="pdf-export-progress-modal" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md animate-pulse">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Exporting Presentation to PDF
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rendering exact landscape slide pages
                </p>
              </div>
            </div>

            {exportProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[280px]">
                    Slide {exportProgress.current} of {exportProgress.total}: {exportProgress.slideTitle}
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {exportProgress.percent}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-200"
                    style={{ width: `${exportProgress.percent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>Each slide is formatted into an exact A4 Landscape page without clipping or layout shifting.</span>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  cancelExportRef.current = true;
                  setIsExportingPDF(false);
                  setStagingSlideIndex(null);
                  setExportProgress(null);
                }}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900 transition-colors cursor-pointer"
              >
                Cancel Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Master Printable Deck for Print Frame (Hidden from display on screen, visible only to print engine) */}
      <div
        ref={printableMasterRef}
        id="pitch-deck-printable-master"
        style={{
          display: 'none'
        }}
        className="bg-white text-slate-900 print:block"
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            id={`printable-slide-${idx}`}
            className="deck-print-slide bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between mb-8 shadow-xs"
            style={{
              width: '1200px',
              minHeight: '680px',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              color: '#0f172a'
            }}
          >
            {/* Slide Header */}
            <div className="pb-4 mb-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono">
                    {slide.badge || slide.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">• {slide.category}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{slide.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600">{slide.subtitle}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-blue-900 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  <JSAlphaSoftLogo variant="icon" size="xs" isDarkTheme={true} />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">AlphaERP</div>
                  <div className="text-[10px] text-slate-500 font-mono">Series A Presentation</div>
                </div>
              </div>
            </div>

            {/* Slide Body */}
            <div className="flex-1 overflow-visible">
              {slide.renderContent()}
            </div>

            {/* Slide Footer */}
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">HVAC Biz Private Limited</span>
                <span>•</span>
                <span>AlphaERP Intelligent Operating System for Turnkey MEP</span>
                <span>•</span>
                <span>Confidential</span>
              </div>
              <div className="font-mono font-bold text-slate-800">
                Slide {idx + 1} of {slides.length}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
