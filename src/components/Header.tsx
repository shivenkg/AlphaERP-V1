import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  Bell,
  Search,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Menu,
  X,
  Pin,
  PinOff,
  Sliders,
  LogOut,
  LogIn,
  User,
  Settings,
  Sun,
  Moon,
  Truck,
  Building2,
  Boxes,
  FileText,
  Briefcase,
  ShoppingCart,
  ArrowRight,
  BookOpen,
  Code,
  HelpCircle,
  Presentation,
  Table,
  Type,
  Key
} from 'lucide-react';
import { UserRole, AppNotification, GoogleSheetsSyncConfig, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { googleSheetsService } from '../services/googleSheets';
import { mongoService } from '../services/mongoService';
import { useTheme } from '../context/ThemeContext';
import { useFontSize } from '../context/FontSizeContext';
import { JSAlphaSoftLogo } from './JSAlphaSoftLogo';
import { ThemeToggle } from './ThemeToggle';
import { FontSizeControl } from './FontSizeControl';

interface HeaderProps {
  currentUser: UserProfile;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  sheetsConfig: GoogleSheetsSyncConfig;
  notifications: AppNotification[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenSheetsModal: () => void;
  onOpenAuditLogs: () => void;
  onOpenApiDocs?: () => void;
  onOpenQuickGuide?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  isSidebarPinned?: boolean;
  onToggleSidebar?: () => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  onRoleChange,
  sheetsConfig,
  notifications,
  searchTerm,
  onSearchChange,
  onOpenSheetsModal,
  onOpenAuditLogs,
  onOpenApiDocs,
  onOpenQuickGuide,
  activeTab,
  setActiveTab,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  isSidebarPinned = false,
  onToggleSidebar,
  onOpenAuthModal,
  onLogout
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { fontSizeMode, isAuto, computedScale, setFontSizeMode } = useFontSize();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showCompactSearch, setShowCompactSearch] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [quickSyncState, setQuickSyncState] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [quickSyncError, setQuickSyncError] = useState<string | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Enterprise Customization: Organization Logo reactive state
  const [orgLogo, setOrgLogo] = useState<string | undefined>(() => storageService.getSystemSettings()?.organizationLogo);
  const [orgLogoAlt, setOrgLogoAlt] = useState<string | undefined>(() => storageService.getSystemSettings()?.organizationLogoAlt);

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      const s = storageService.getSystemSettings();
      setOrgLogo(s?.organizationLogo);
      setOrgLogoAlt(s?.organizationLogoAlt);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Close search preview dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick live search matching for Header dropdown
  const quickSearchResults = useMemo(() => {
    const term = (searchTerm || '').trim().toLowerCase();
    if (!term) return [];

    const allData = storageService.getAllData();
    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      code: string;
      type: string;
      icon: React.ElementType;
      tab: string;
      color: string;
    }> = [];

    // Search Vendors
    (allData.vendors || []).forEach((v) => {
      const code = v.vendorCode || v.code || `VND-${v.id}`;
      if (
        code.toLowerCase().includes(term) ||
        (v.name || '').toLowerCase().includes(term) ||
        (v.category || '').toLowerCase().includes(term) ||
        (v.city || '').toLowerCase().includes(term) ||
        (v.gstin || '').toLowerCase().includes(term)
      ) {
        results.push({
          id: `ven-${v.id}`,
          title: v.name,
          subtitle: `Vendor Master • ${v.category || 'HVAC Supplier'}`,
          code,
          type: 'Vendor',
          icon: Truck,
          tab: 'masterdata',
          color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400'
        });
      }
    });

    // Search Quotes
    (allData.quotes || []).forEach((q: any) => {
      const code = q.quoteNumber || `QT-${q.id}`;
      if (
        code.toLowerCase().includes(term) ||
        (q.projectTitle || '').toLowerCase().includes(term) ||
        (q.clientName || '').toLowerCase().includes(term)
      ) {
        results.push({
          id: `qt-${q.id}`,
          title: q.projectTitle || `Quote for ${q.clientName}`,
          subtitle: `Quotation • ${q.clientName || 'Client'} (₹${(q.totalAmount || 0).toLocaleString('en-IN')})`,
          code,
          type: 'Quote',
          icon: FileText,
          tab: 'quotes',
          color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400'
        });
      }
    });

    // Search Projects
    (allData.projects || []).forEach((p: any) => {
      const code = p.projectNumber || `PJ-${p.id}`;
      if (
        code.toLowerCase().includes(term) ||
        (p.projectName || '').toLowerCase().includes(term) ||
        (p.clientName || '').toLowerCase().includes(term)
      ) {
        results.push({
          id: `pj-${p.id}`,
          title: p.projectName || 'Project Site',
          subtitle: `Project Site • ${p.clientName || 'Client'}`,
          code,
          type: 'Project',
          icon: Briefcase,
          tab: 'projects',
          color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400'
        });
      }
    });

    // Search Inventory SKUs
    (allData.inventory || []).forEach((i: any) => {
      const code = i.sku || `SKU-${i.id}`;
      if (
        code.toLowerCase().includes(term) ||
        (i.name || '').toLowerCase().includes(term) ||
        (i.category || '').toLowerCase().includes(term)
      ) {
        results.push({
          id: `inv-${i.id}`,
          title: i.name,
          subtitle: `Inventory SKU • Stock: ${i.currentStock || 0} ${i.unit || 'Nos'}`,
          code,
          type: 'SKU',
          icon: Boxes,
          tab: 'inventory',
          color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/60 dark:text-violet-400'
        });
      }
    });

    // Search Purchase Orders
    (allData.pos || []).forEach((po: any) => {
      const code = po.poNumber || `PO-${po.id}`;
      if (
        code.toLowerCase().includes(term) ||
        (po.vendorName || '').toLowerCase().includes(term) ||
        (po.projectName || '').toLowerCase().includes(term)
      ) {
        results.push({
          id: `po-${po.id}`,
          title: `PO for ${po.vendorName}`,
          subtitle: `Purchase Order • ${po.projectName || 'Project'} (₹${(po.grandTotal || 0).toLocaleString('en-IN')})`,
          code,
          type: 'PO',
          icon: ShoppingCart,
          tab: 'procurement',
          color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400'
        });
      }
    });

    // Search Clients
    (allData.clients || []).forEach((c: any) => {
      const code = c.clientCode || `CL-${c.id}`;
      if (
        code.toLowerCase().includes(term) ||
        (c.companyName || '').toLowerCase().includes(term) ||
        (c.city || '').toLowerCase().includes(term)
      ) {
        results.push({
          id: `cl-${c.id}`,
          title: c.companyName || 'Corporate Client',
          subtitle: `Client Master • ${c.city || 'Corporate'}`,
          code,
          type: 'Client',
          icon: Building2,
          tab: 'masterdata',
          color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-400'
        });
      }
    });

    // Search Employees / AlphaHR Records
    (allData.employees || []).forEach((emp: any) => {
      const code = emp.empCode || emp.code || `EMP-${emp.id}`;
      const name = emp.fullName || emp.name || 'Employee';
      if (
        code.toLowerCase().includes(term) ||
        name.toLowerCase().includes(term) ||
        (emp.designation || '').toLowerCase().includes(term) ||
        (emp.department || '').toLowerCase().includes(term)
      ) {
        results.push({
          id: `emp-${emp.id}`,
          title: name,
          subtitle: `AlphaHR • ${emp.designation || 'Staff'} (${emp.department || 'Operations'})`,
          code,
          type: 'AlphaHR',
          icon: UserCheck,
          tab: 'hr',
          color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400'
        });
      }
    });

    // Module Match: AlphaHR & ESS/MSS
    if ('alphahr'.includes(term) || 'hr'.includes(term) || 'payroll'.includes(term) || 'attendance'.includes(term)) {
      results.push({
        id: 'mod-hr',
        title: 'AlphaHR™ HRMS Suite',
        subtitle: 'KRA JDs, Biometrics, Leaves, Payroll & Full & Final',
        code: 'HRMS',
        type: 'Module',
        icon: Sparkles,
        tab: 'hr',
        color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400'
      });
    }

    if ('ess'.includes(term) || 'mss'.includes(term) || 'self service'.includes(term) || 'portal'.includes(term) || 'leave application'.includes(term) || 'salary slip'.includes(term)) {
      results.push({
        id: 'mod-ess',
        title: 'ESS / MSS Self-Service Portal',
        subtitle: 'Employee Self-Service, Leaves, Timesheets & Manager Approvals',
        code: 'PORTAL',
        type: 'Module',
        icon: UserCheck,
        tab: 'ess',
        color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400'
      });
    }

    return results.slice(0, 6);
  }, [searchTerm]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchFocused(false);
    setShowCompactSearch(false);
    setActiveTab('search');
  };

  const handleSelectQuickResult = (tab: string) => {
    setIsSearchFocused(false);
    setShowCompactSearch(false);
    setActiveTab(tab);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleLabels: Record<UserRole, { title: string; badge: string; color: string }> = {
    superadmin: { title: 'Master SuperAdmin (Root DRM Authority)', badge: 'Root SuperAdmin', color: 'bg-red-950 text-red-200' },
    admin: { title: 'Enterprise System Administrator', badge: 'System Admin', color: 'bg-blue-950 text-blue-200' },
    executive: { title: 'Executive / Managing Director', badge: 'Admin & Signoff', color: 'bg-indigo-900 text-indigo-200' },
    service_manager: { title: 'Service Operations Manager', badge: 'AMC & Field SLA', color: 'bg-rose-900 text-rose-200' },
    sales_manager: { title: 'Sales Manager', badge: 'CRM & Quotas', color: 'bg-emerald-900 text-emerald-200' },
    estimator: { title: 'MEP / HVAC Estimator', badge: 'BOQ & Quotes', color: 'bg-amber-900 text-amber-200' },
    procurement: { title: 'Procurement Officer', badge: 'PR & PO Workflow', color: 'bg-blue-900 text-blue-200' },
    warehouse: { title: 'Warehouse / Inventory Head', badge: 'Stock & Inwarding', color: 'bg-teal-900 text-teal-200' },
    finance: { title: 'Finance & Accounts Controller', badge: 'Invoices & Payments', color: 'bg-purple-900 text-purple-200' },
    technician: { title: 'Field HVAC Project Engineer', badge: 'Work Orders & Site', color: 'bg-slate-800 text-slate-200' }
  };

  const handleQuickSync = async () => {
    if (quickSyncState === 'syncing' || isSyncing) return;
    setIsSyncing(true);
    setQuickSyncState('syncing');
    setQuickSyncError(null);
    try {
      // Keep projects and active state persisted in MongoDB Atlas
      await mongoService.saveProjects(storageService.getProjects()).catch(() => {});
      await googleSheetsService.syncToGoogleSheet();
      setQuickSyncState('success');
      storageService.addNotification(
        'Quick Sync Completed',
        'Direct data flush to MongoDB Atlas and Google Sheets finished successfully for all modules.',
        'success',
        'sheets'
      );
      setTimeout(() => {
        setQuickSyncState('idle');
      }, 3500);
    } catch (e: any) {
      console.error('Quick sync error:', e);
      const msg = e?.message || 'Failed to sync with Google Sheets';
      setQuickSyncError(msg);
      setQuickSyncState('error');
      storageService.addNotification(
        'Quick Sync Failed',
        msg,
        'alert',
        'sheets'
      );
      setTimeout(() => {
        setQuickSyncState('idle');
      }, 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="bg-[var(--content-bg,#FFFFFF)] text-[var(--text-primary,#1F2937)] border-b border-[var(--border-default,#E5E7EB)] sticky top-0 z-30 shadow-xs w-full max-w-full transition-colors duration-200">
      <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 w-full max-w-full">
        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-fit">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
              title={isMobileMenuOpen ? 'Click to collapse sidebar' : 'Click to expand sidebar'}
              aria-label={isMobileMenuOpen ? 'Click to collapse sidebar' : 'Click to expand sidebar'}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {onToggleSidebar && (
            <button
              id="header-sidebar-toggle-btn"
              onClick={onToggleSidebar}
              className="hidden md:flex items-center justify-center p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
              title={
                isSidebarPinned
                  ? 'Sidebar pinned open • Click to unpin (auto-collapse on hover)'
                  : 'Auto-collapse mode • Hover over sidebar to expand, or click to pin open'
              }
              aria-label={
                isSidebarPinned
                  ? 'Sidebar pinned open • Click to unpin (auto-collapse on hover)'
                  : 'Auto-collapse mode • Hover over sidebar to expand, or click to pin open'
              }
            >
              {isSidebarPinned ? (
                <PinOff className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              )}
            </button>
          )}

          {/* Application Heading & Logo beside hamburger icon */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 text-left p-1 -m-1 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            title="Go to Executive Dashboard"
            aria-label="HVAC Biz - Go to Executive Dashboard"
          >
            {orgLogo ? (
              <img
                src={orgLogo}
                alt={orgLogoAlt || 'Organization Logo'}
                className="h-8 max-w-[120px] object-contain rounded drop-shadow-sm"
              />
            ) : (
              <JSAlphaSoftLogo size="sm" variant="icon" isDarkTheme={isDark} />
            )}
            <div className="flex items-center gap-1.5 leading-none select-none">
              <span className="text-base sm:text-lg font-black tracking-tight flex items-baseline">
                <span className="text-[#0B3B95] dark:text-[#3B82F6]">HVAC</span>
                <span className="ml-1 text-[#FF5500] dark:text-[#FF6600]">Biz</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100/80 dark:bg-blue-950/80 text-[#0B3B95] dark:text-blue-300 border border-blue-200 dark:border-blue-800 tracking-wide font-mono hidden sm:inline">
                AlphaERP
              </span>
            </div>
          </button>
        </div>

        {/* Center: Global Search Bar (Full on large screens) */}
        <div ref={searchContainerRef} className="flex-1 max-w-xs 2xl:max-w-md hidden xl:block min-w-[200px] mx-2 relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSearchFocused(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(e);
                }
              }}
              placeholder="Search leads, quotes, SKUs, vendors, POs..."
              className="w-full bg-slate-100/90 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-slate-100 pl-9 pr-14 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500 transition-all"
            />
            <div className="absolute right-2.5 top-2 flex items-center gap-1">
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-1"
                >
                  Clear
                </button>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                  ⌘K
                </span>
              )}
            </div>
          </form>

          {/* Interactive Live Search Dropdown */}
          {isSearchFocused && searchTerm.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <span>QUICK RESULTS</span>
                <span>Press Enter for full search</span>
              </div>

              <div className="mt-1 space-y-1 max-h-72 overflow-y-auto">
                {quickSearchResults.length > 0 ? (
                  quickSearchResults.map((res) => {
                    const ResIcon = res.icon;
                    return (
                      <button
                        key={res.id}
                        type="button"
                        onClick={() => handleSelectQuickResult(res.tab)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${res.color}`}>
                            <ResIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {res.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {res.subtitle}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {res.code}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">
                    No instant matches for &ldquo;{searchTerm}&rdquo;
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-950/50 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Open &ldquo;{searchTerm}&rdquo; in Global Search view</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions, Google Sheet Sync, RBAC Role Selector, Theme Toggle & Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Compact Search Trigger Button for screens below xl */}
          <div className="relative xl:hidden">
            <button
              onClick={() => {
                setShowCompactSearch(!showCompactSearch);
                if (!showCompactSearch && searchTerm) {
                  setActiveTab('search');
                }
              }}
              title="Search ERP Data"
              className={`p-2 rounded-xl border transition-colors ${
                showCompactSearch || searchTerm
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 border-blue-300 dark:border-blue-700'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>

            {showCompactSearch && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSubmit(e);
                      }
                    }}
                    placeholder="Search quotes, leads, SKUs, vendors..."
                    className="w-full bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 pl-8 pr-16 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute right-2 top-1.5 flex items-center gap-1">
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => onSearchChange('')}
                        className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
                      >
                        ✕
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold"
                    >
                      Go
                    </button>
                  </div>
                </form>

                {searchTerm && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="w-full py-1 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View full results in Global Search →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* WhatsApp Status Pill */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-xs whitespace-nowrap">
            <span className="text-slate-500 dark:text-slate-400 font-medium">WhatsApp:</span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Connected</span>
          </div>

          {/* Pitch Deck Quick Launcher (Strict SuperAdmin Exclusive) */}
          {currentRole === 'superadmin' && (
            <button
              onClick={() => setActiveTab('pitch_deck')}
              id="btn-header-pitch-deck"
              title="Open Investor Pitch Deck & System Walkthrough (SuperAdmin Only)"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 shrink-0 ${
                activeTab === 'pitch_deck'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              <Presentation className="w-3.5 h-3.5 shrink-0 transition-transform duration-150 group-hover:scale-110" />
              <span className="hidden sm:inline">Pitch Deck</span>
            </button>
          )}

          {/* Enterprise DRM License Controller (SuperAdmin Exclusive) */}
          {currentRole === 'superadmin' && (
            <button
              onClick={() => setActiveTab('license')}
              id="btn-header-license-ctrl"
              title="Open Enterprise License DRM Controller & Key Generator"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 shrink-0 ${
                activeTab === 'license'
                  ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                  : 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span className="hidden xl:inline">License DRM</span>
            </button>
          )}

          {/* Quick Sync Direct Trigger Button */}
          <button
            onClick={handleQuickSync}
            disabled={quickSyncState === 'syncing' || isSyncing}
            id="btn-header-quick-sync"
            title={
              quickSyncState === 'success'
                ? 'Data flushed to Google Sheets successfully!'
                : quickSyncState === 'error'
                ? `Sync issue: ${quickSyncError || 'Click to retry'}`
                : 'Directly flush all 10 ERP modules to Google Sheets without opening the modal'
            }
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0 shrink-0 ${
              quickSyncState === 'syncing'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 animate-pulse'
                : quickSyncState === 'success'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-xs'
                : quickSyncState === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {quickSyncState === 'syncing' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="hidden sm:inline">Syncing...</span>
              </>
            ) : quickSyncState === 'success' ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="hidden sm:inline">Synced!</span>
              </>
            ) : quickSyncState === 'error' ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="hidden sm:inline">Sync Failed</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 hover:rotate-180 transition-transform duration-300" />
                <span className="hidden sm:inline">Quick Sync</span>
              </>
            )}
          </button>

          {/* Google Sheets Modal Opener & Status */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 sm:p-1 border border-slate-200 dark:border-slate-700 shrink-0 transition-all duration-150 hover:shadow-xs hover:-translate-y-0.5">
            <button
              onClick={onOpenSheetsModal}
              id="btn-header-sheets-modal"
              title="Open Google Sheets Master Database & Live Preview Modal"
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden 2xl:inline">Google Sheets</span>
              {sheetsConfig.syncStatus === 'success' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
              )}
            </button>

            {sheetsConfig.spreadsheetUrl && (
              <a
                href={sheetsConfig.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                title="Open Live Spreadsheet in Google Drive / Google Sheets"
                className="p-1 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors hidden sm:inline-block shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Role-Based Access Control (RBAC) Selector */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="text-left hidden 2xl:block">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Active Role</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">{roleLabels[currentRole].badge}</div>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px] hidden sm:inline 2xl:hidden">
                {roleLabels[currentRole].badge}
              </span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 divide-y divide-slate-100 dark:divide-slate-800">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Switch RBAC Persona</span>
                  <Sparkles className="w-3 h-3 text-blue-500" />
                </div>
                <div className="py-1">
                  {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        onRoleChange(role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${
                        currentRole === role ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{roleLabels[role].title}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{roleLabels[role].badge}</div>
                      </div>
                      {currentRole === role && <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setShowRoleDropdown(false);
                    }}
                    className="w-full text-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 border border-indigo-100 dark:border-indigo-900/60"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Manage Users & Roles (Admin)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Notifications ({unreadCount} unread)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => storageService.markAllNotificationsAsRead()}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">No recent notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          storageService.markNotificationAsRead(n.id);
                          if (n.linkTab) setActiveTab(n.linkTab);
                          setShowNotifDropdown(false);
                        }}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                          n.read
                            ? 'opacity-60 bg-white dark:bg-slate-900'
                            : 'bg-blue-50/40 dark:bg-blue-950/30 font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-semibold ${n.type === 'alert' || n.type === 'warning' ? 'text-amber-700 dark:text-amber-400' : n.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5 whitespace-nowrap">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Guide & Shortcuts Button */}
          {onOpenQuickGuide && (
            <button
              id="header-quick-guide-btn"
              onClick={onOpenQuickGuide}
              title="Quick Guide & System Shortcuts (Press '?')"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center justify-center cursor-pointer group"
            >
              <HelpCircle className="w-4 h-4" />
              <kbd className="hidden lg:inline-block ml-1 text-[10px] px-1 py-0.2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-500 dark:text-slate-400 font-mono">?</kbd>
            </button>
          )}

          {/* API & Deployment Guide Quick Button */}
          {onOpenApiDocs && (
            <button
              onClick={onOpenApiDocs}
              title="API Integration Guide & Enterprise Deployment Manual"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors hidden sm:inline-flex"
            >
              <Code className="w-4 h-4" />
            </button>
          )}

          {/* Audit Logs Quick Button */}
          <button
            onClick={onOpenAuditLogs}
            title="View User Activity Audit Logs"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors hidden sm:inline-flex"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Admin Customization Quick Button (If Executive) */}
          {currentRole === 'executive' && (
            <button
              onClick={() => setActiveTab('customization')}
              title="Enterprise Customization Suite (Admin)"
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Admin Settings</span>
            </button>
          )}

          {/* Auto Font Size & Viewport Rendering Control */}
          <FontSizeControl />

          {/* Theme Toggle (Light / Dark mode) */}
          <ThemeToggle id="header-theme-toggle" className="shrink-0" />

          {/* User Profile & Account Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all shrink-0"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="text-left hidden 2xl:block">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[110px]">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                  {currentUser.role.toUpperCase()}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-500 shrink-0 hidden sm:inline-block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 divide-y divide-slate-100 dark:divide-slate-800">
                {/* User Info Header */}
                <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-800/60">
                  <div className="flex items-center gap-3">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                        {currentUser.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Theme toggle & Display density items inside profile menu */}
                <div className="py-1.5 space-y-0.5">
                  <button
                    onClick={toggleTheme}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                      <span>Theme Appearance</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize border border-slate-200 dark:border-slate-700">
                      {theme} mode
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      const currentDensity = storageService.getDisplayDensity();
                      const nextDensity = currentDensity === 'compact' ? 'spacious' : 'compact';
                      storageService.setDisplayDensity(nextDensity);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between"
                    title="Toggle between Compact (dense tables) and Spacious (increased padding) modes"
                  >
                    <div className="flex items-center gap-2.5">
                      <Table className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Display Density</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 capitalize border border-indigo-200 dark:border-indigo-800/60">
                      {storageService.getDisplayDensity()} mode
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (isAuto) {
                        setFontSizeMode('normal');
                      } else if (fontSizeMode === 'normal') {
                        setFontSizeMode('large');
                      } else if (fontSizeMode === 'large') {
                        setFontSizeMode('xlarge');
                      } else if (fontSizeMode === 'xlarge') {
                        setFontSizeMode('compact');
                      } else {
                        setFontSizeMode('auto');
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between cursor-pointer"
                    title="Toggle auto viewport rendering or cycle typography scale"
                  >
                    <div className="flex items-center gap-2.5">
                      <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Font Size Scaling</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                      {isAuto ? `Auto (${Math.round(computedScale * 100)}%)` : `${Math.round(computedScale * 100)}%`}
                    </span>
                  </button>
                </div>

                {/* Actions */}
                <div className="py-1.5">
                  {currentUser.role === 'executive' && (
                    <button
                      onClick={() => {
                        setActiveTab('customization');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5"
                    >
                      <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Enterprise Customization Suite</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5"
                  >
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>User Directory & Team Access</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenAuthModal) onOpenAuthModal();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2.5"
                  >
                    <LogIn className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Switch Account (Email OTP)</span>
                  </button>
                </div>

                {/* Sign Out */}
                <div className="py-1.5">
                  <button
                    onClick={() => {
                      if (onLogout) {
                        onLogout();
                      } else {
                        storageService.logout();
                      }
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5"
                  >
                    <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

