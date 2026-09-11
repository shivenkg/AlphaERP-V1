import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  Target,
  Users,
  FileText,
  Briefcase,
  ShoppingCart,
  Boxes,
  Wrench,
  Landmark,
  CreditCard,
  Sparkles,
  UserCheck,
  Database,
  FileSpreadsheet,
  ShieldCheck,
  Sliders,
  History,
  Building2,
  Compass,
  Search,
  Pin,
  PinOff
} from 'lucide-react';
import { UserRole } from '../types';

interface BreadcrumbNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole?: UserRole;
  className?: string;
  onBack?: () => void;
  canGoBack?: boolean;
}

interface ERPNavPath {
  tabId: string;
  groupName: string;
  groupId: string;
  groupIcon: React.ElementType;
  pageTitle: string;
  pageIcon: React.ElementType;
  description: string;
  badge?: string;
  badgeColor?: string;
  siblings: Array<{ id: string; label: string }>;
}

export const ERP_HIERARCHY: Record<string, ERPNavPath> = {
  search: {
    tabId: 'search',
    groupId: 'executive',
    groupName: 'Core Navigation & Search',
    groupIcon: Search,
    pageTitle: 'Global ERP Search & Record Lookup',
    pageIcon: Search,
    description: 'Instant multi-module search across Quotes, CRM Leads, Projects, POs, PRs, Vendors, Clients, SKUs & Employees',
    siblings: [
      { id: 'search', label: 'Global ERP Search' },
      { id: 'dashboard', label: 'Executive Dashboard' },
      { id: 'masterdata', label: 'Master Data' }
    ]
  },
  dashboard: {
    tabId: 'dashboard',
    groupId: 'executive',
    groupName: 'Executive & Strategy',
    groupIcon: LayoutDashboard,
    pageTitle: 'Executive Dashboard',
    pageIcon: LayoutDashboard,
    description: 'High-level business analytics, order book, revenue & KPIs',
    siblings: [
      { id: 'dashboard', label: 'Executive Dashboard' },
      { id: 'sales', label: 'Sales Performance' }
    ]
  },
  sales: {
    tabId: 'sales',
    groupId: 'executive',
    groupName: 'Executive & Strategy',
    groupIcon: LayoutDashboard,
    pageTitle: 'Sales Performance & Quotas',
    pageIcon: Target,
    description: 'Quota attainment, commission breakdown & team run-rates',
    siblings: [
      { id: 'dashboard', label: 'Executive Dashboard' },
      { id: 'sales', label: 'Sales Performance' }
    ]
  },
  crm: {
    tabId: 'crm',
    groupId: 'sales_eng',
    groupName: 'Sales & Engineering',
    groupIcon: Briefcase,
    pageTitle: 'CRM & HVAC Leads',
    pageIcon: Users,
    description: 'Inquiry capture, pipeline stages, client engagement & followups',
    siblings: [
      { id: 'crm', label: 'CRM & HVAC Leads' },
      { id: 'quotes', label: 'Quotes & Estimations' },
      { id: 'projects', label: 'Projects & BOQ Engine' }
    ]
  },
  quotes: {
    tabId: 'quotes',
    groupId: 'sales_eng',
    groupName: 'Sales & Engineering',
    groupIcon: Briefcase,
    pageTitle: 'Quotes & HVAC Estimations',
    pageIcon: FileText,
    description: 'Detailed heat-load estimations, BOQ costing, margin & client proposals',
    siblings: [
      { id: 'crm', label: 'CRM & HVAC Leads' },
      { id: 'quotes', label: 'Quotes & Estimations' },
      { id: 'projects', label: 'Projects & BOQ Engine' }
    ]
  },
  projects: {
    tabId: 'projects',
    groupId: 'sales_eng',
    groupName: 'Sales & Engineering',
    groupIcon: Briefcase,
    pageTitle: 'Projects & BOQ Inventory Engine',
    pageIcon: Briefcase,
    description: 'Live site execution, line-item BOQ shortages, automated PRs & billing',
    badge: 'BOQ Shortage Sync',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    siblings: [
      { id: 'crm', label: 'CRM & HVAC Leads' },
      { id: 'quotes', label: 'Quotes & Estimations' },
      { id: 'projects', label: 'Projects & BOQ Engine' }
    ]
  },
  procurement: {
    tabId: 'procurement',
    groupId: 'procurement_field',
    groupName: 'Supply Chain & Field',
    groupIcon: ShoppingCart,
    pageTitle: 'Inventory & PR/PO Pipeline',
    pageIcon: ShoppingCart,
    description: 'Purchase Requisitions, RFQs, Purchase Orders & vendor management',
    siblings: [
      { id: 'procurement', label: 'Inventory & PR/PO' },
      { id: 'inventory', label: 'Warehouse Stock & SKUs' },
      { id: 'workorders', label: 'Work Orders & Field' }
    ]
  },
  inventory: {
    tabId: 'inventory',
    groupId: 'procurement_field',
    groupName: 'Supply Chain & Field',
    groupIcon: ShoppingCart,
    pageTitle: 'Warehouse Stock & HVAC SKUs',
    pageIcon: Boxes,
    description: 'Bin locations, stock valuation, reorder levels & material inwarding',
    siblings: [
      { id: 'procurement', label: 'Inventory & PR/PO' },
      { id: 'inventory', label: 'Warehouse Stock & SKUs' },
      { id: 'workorders', label: 'Work Orders & Field' }
    ]
  },
  workorders: {
    tabId: 'workorders',
    groupId: 'procurement_field',
    groupName: 'Supply Chain & Field',
    groupIcon: ShoppingCart,
    pageTitle: 'Work Orders & Field Dispatch',
    pageIcon: Wrench,
    description: 'Installation dispatch, testing & commissioning checklists and site logs',
    siblings: [
      { id: 'procurement', label: 'Inventory & PR/PO' },
      { id: 'inventory', label: 'Warehouse Stock & SKUs' },
      { id: 'workorders', label: 'Work Orders & Field' }
    ]
  },
  finance: {
    tabId: 'finance',
    groupId: 'finance_section',
    groupName: 'Finance & Accounting',
    groupIcon: Landmark,
    pageTitle: 'General Ledger & Journal Vouchers',
    pageIcon: Landmark,
    description: 'Double-entry books, chart of accounts, GST, TDS & profit/loss statements',
    siblings: [
      { id: 'finance', label: 'General Ledger & Vouchers' },
      { id: 'payments', label: 'Invoices & Receivables' }
    ]
  },
  payments: {
    tabId: 'payments',
    groupId: 'finance_section',
    groupName: 'Finance & Accounting',
    groupIcon: Landmark,
    pageTitle: 'Invoices & Milestone Receivables',
    pageIcon: CreditCard,
    description: 'Tax invoices, retention tracking, client payments & vendor payables',
    siblings: [
      { id: 'finance', label: 'General Ledger & Vouchers' },
      { id: 'payments', label: 'Invoices & Receivables' }
    ]
  },
  hr: {
    tabId: 'hr',
    groupId: 'hr_section',
    groupName: 'AlphaHR & Talent Operations',
    groupIcon: Sparkles,
    pageTitle: 'AlphaHR™ HRMS, KRA JDs & Payroll Engine',
    pageIcon: Sparkles,
    description: 'Talent hiring, employee directory, biometric attendance, leaves, monthly payroll & PMS',
    siblings: [
      { id: 'hr', label: 'AlphaHR Suite' },
      { id: 'ess', label: 'ESS / MSS Self-Service Portal' }
    ]
  },
  ess: {
    tabId: 'ess',
    groupId: 'hr_section',
    groupName: 'AlphaHR & Talent Operations',
    groupIcon: Sparkles,
    pageTitle: 'AlphaHR™ ESS / MSS Self-Service Portal',
    pageIcon: UserCheck,
    description: 'Employee self-service, manager approvals, leave applications, attendance check-in & payslips',
    siblings: [
      { id: 'hr', label: 'AlphaHR Suite' },
      { id: 'ess', label: 'ESS / MSS Self-Service Portal' }
    ]
  },
  masterdata: {
    tabId: 'masterdata',
    groupId: 'master_section',
    groupName: 'Master Data Hub',
    groupIcon: Database,
    pageTitle: 'Master Data Management',
    pageIcon: Database,
    description: 'Central registry for clients, vendors, item catalog, cost centers & tax slabs',
    siblings: [
      { id: 'masterdata', label: 'Master Data Management' }
    ]
  },
  sheets: {
    tabId: 'sheets',
    groupId: 'system_section',
    groupName: 'System & Administration',
    groupIcon: Sliders,
    pageTitle: 'Google Sheet Master Sync',
    pageIcon: FileSpreadsheet,
    description: 'Bi-directional live cloud synchronization with Google Sheets worksheets',
    siblings: [
      { id: 'sheets', label: 'Google Sheet Sync' },
      { id: 'users', label: 'Users & RBAC Roles' },
      { id: 'customization', label: 'Admin Customization' },
      { id: 'audit', label: 'Audit Trail Logs' }
    ]
  },
  users: {
    tabId: 'users',
    groupId: 'system_section',
    groupName: 'System & Administration',
    groupIcon: Sliders,
    pageTitle: 'Users & RBAC Roles',
    pageIcon: ShieldCheck,
    description: 'Access control, employee roles, permissions matrix & security',
    siblings: [
      { id: 'sheets', label: 'Google Sheet Sync' },
      { id: 'users', label: 'Users & RBAC Roles' },
      { id: 'customization', label: 'Admin Customization' },
      { id: 'audit', label: 'Audit Trail Logs' }
    ]
  },
  customization: {
    tabId: 'customization',
    groupId: 'system_section',
    groupName: 'System & Administration',
    groupIcon: Sliders,
    pageTitle: 'Admin Customization Suite',
    pageIcon: Sliders,
    description: 'System configurations, workflow rules, automated alerts & branding',
    siblings: [
      { id: 'sheets', label: 'Google Sheet Sync' },
      { id: 'users', label: 'Users & RBAC Roles' },
      { id: 'customization', label: 'Admin Customization' },
      { id: 'audit', label: 'Audit Trail Logs' }
    ]
  },
  audit: {
    tabId: 'audit',
    groupId: 'system_section',
    groupName: 'System & Administration',
    groupIcon: Sliders,
    pageTitle: 'Audit Trail Logs',
    pageIcon: History,
    description: 'Immutable system change logs, user activity records & timestamped audits',
    siblings: [
      { id: 'sheets', label: 'Google Sheet Sync' },
      { id: 'users', label: 'Users & RBAC Roles' },
      { id: 'customization', label: 'Admin Customization' },
      { id: 'audit', label: 'Audit Trail Logs' }
    ]
  }
};

const DEFAULT_PATH: ERPNavPath = {
  tabId: 'dashboard',
  groupId: 'executive',
  groupName: 'Executive & Strategy',
  groupIcon: LayoutDashboard,
  pageTitle: 'Executive Dashboard',
  pageIcon: LayoutDashboard,
  description: 'Enterprise overview & business telemetry',
  siblings: [
    { id: 'dashboard', label: 'Executive Dashboard' }
  ]
};

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  activeTab,
  setActiveTab,
  className = '',
  onBack,
  canGoBack = false
}) => {
  const currentPath = ERP_HIERARCHY[activeTab] || DEFAULT_PATH;
  const GroupIcon = currentPath.groupIcon;
  const PageIcon = currentPath.pageIcon;

  // Auto-hide and Pin state: default is auto-hide (isPinned: false)
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('alphaerp_breadcrumb_pinned');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 220);
  };

  const togglePin = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('alphaerp_breadcrumb_pinned', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  const navContent = (
    <div className="flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto w-full">
      {/* Left: Breadcrumb Items Trail */}
      <ol className="flex items-center flex-wrap gap-1 sm:gap-1.5 min-w-0 text-slate-500 dark:text-slate-400">
        {/* Back Action Button */}
        {canGoBack && onBack && (
          <li className="inline-flex items-center mr-1">
            <button
              id="btn-breadcrumb-back"
              type="button"
              onClick={onBack}
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700/90 shadow-2xs hover:shadow-xs transition-all font-bold text-xs shrink-0 cursor-pointer"
              title="Go back to previous screen (Backspace or Alt+Left)"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-150 group-hover:-translate-x-0.5 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              <span>Back</span>
            </button>
          </li>
        )}

        {/* Level 1: Root / Home */}
        <li className="inline-flex items-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="group inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all font-semibold cursor-pointer"
            title="Return to Main ERP Dashboard"
          >
            <Home className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="font-bold tracking-tight">AlphaERP</span>
          </button>
        </li>

        {/* Separator 1 */}
        <li className="text-slate-300 dark:text-slate-600 shrink-0 select-none">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>

        {/* Level 2: Module Group */}
        <li className="inline-flex items-center">
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 font-medium">
            <GroupIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="truncate max-w-[160px] sm:max-w-none">{currentPath.groupName}</span>
          </div>
        </li>

        {/* Separator 2 */}
        <li className="text-slate-300 dark:text-slate-600 shrink-0 select-none">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>

        {/* Level 3: Active Page / Tab (Highlighted) */}
        <li className="inline-flex items-center min-w-0" aria-current="page">
          <motion.div
            key={currentPath.tabId}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-800/80 shadow-2xs"
          >
            <PageIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-none">{currentPath.pageTitle}</span>
            {currentPath.badge && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border shrink-0 hidden sm:inline ${currentPath.badgeColor}`}>
                {currentPath.badge}
              </span>
            )}
          </motion.div>
        </li>
      </ol>

      {/* Right Controls: Sibling Quick Jump & Pin / Auto-hide Toggle */}
      <div className="flex items-center gap-2">
        {/* Sibling Navigation Pills for Fast Context Switching */}
        {currentPath.siblings && currentPath.siblings.length > 1 && (
          <div className="hidden md:flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 dark:text-slate-500 font-medium mr-1 text-[10px] uppercase tracking-wider">
              Quick Jump:
            </span>
            <div className="inline-flex items-center gap-1 p-0.5 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60">
              {currentPath.siblings.map((sibling) => {
                const isCurrent = sibling.id === activeTab;
                return (
                  <button
                    key={sibling.id}
                    onClick={() => setActiveTab(sibling.id)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {sibling.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pin / Auto-hide Toggle Button */}
        <button
          id="btn-breadcrumb-pin-toggle"
          type="button"
          onClick={togglePin}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            isPinned
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-2xs'
              : 'bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'
          }`}
          title={
            isPinned
              ? 'Bar is pinned permanently. Click to enable Auto-hide (reveals on mouse hover).'
              : 'Auto-hide enabled (reveals on mouse hover). Click to pin permanently.'
          }
        >
          {isPinned ? (
            <>
              <Pin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Pinned</span>
            </>
          ) : (
            <>
              <PinOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto-hide</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // If permanently pinned, render in-flow like standard layout
  if (isPinned) {
    return (
      <nav
        aria-label="Breadcrumb"
        className={`bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-xs transition-colors duration-200 shadow-2xs z-20 ${className}`}
      >
        {navContent}
      </nav>
    );
  }

  // Auto-hide mode: collapsed trigger zone by default, reveals on mouse hover
  return (
    <div
      id="breadcrumb-autohide-wrapper"
      className="relative z-30 w-full group/autohide select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Sleek, subtle hover trigger handle when collapsed */}
      <div
        id="breadcrumb-autohide-trigger"
        onClick={() => setIsHovered(true)}
        className="h-2 hover:h-2.5 w-full bg-slate-200/40 dark:bg-slate-800/40 hover:bg-blue-500/20 transition-all duration-200 cursor-pointer flex items-center justify-center relative"
        title="Breadcrumb Navigation & Quick Jump (Hover to reveal)"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsHovered(true);
          }
        }}
      >
        <div className="h-1 w-12 rounded-full bg-slate-300 dark:bg-slate-600 group-hover/autohide:bg-blue-500 group-hover/autohide:w-20 transition-all duration-200" />
      </div>

      {/* Floating Animated Breadcrumb Bar (Revealed on Hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.nav
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            aria-label="Breadcrumb"
            className={`absolute top-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-xs shadow-lg z-30 ${className}`}
          >
            {navContent}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
};
