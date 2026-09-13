import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  ShoppingCart,
  Boxes,
  Wrench,
  CreditCard,
  Target,
  History,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  X,
  Menu,
  Sliders,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Database,
  Building2,
  Landmark,
  Sparkles,
  Layers,
  FoldHorizontal,
  UnfoldHorizontal,
  UserCheck,
  Pin,
  PinOff,
  Zap,
  Search,
  TrendingUp,
  Presentation,
  CalendarClock
} from 'lucide-react';
import { UserRole } from '../types';
import { storageService } from '../services/storageService';
import { ROLE_DEFINITIONS } from '../utils/rbac';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  leadCount: number;
  openShortagesCount: number;
  pendingPRCount: number;
  pendingPOCount: number;
  lowStockCount: number;
  pendingInvoicesCount: number;
  activeAmcCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentRole?: UserRole;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | null;
  badgeColor?: string;
  description?: string;
}

interface NavGroup {
  id: string;
  title: string;
  shortTitle?: string;
  icon: React.ElementType;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  leadCount,
  openShortagesCount,
  pendingPRCount,
  pendingPOCount,
  lowStockCount,
  pendingInvoicesCount,
  activeAmcCount,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse: controlledToggleCollapse,
  currentRole
}) => {
  // Navigation Groups Definition
  const navGroups: NavGroup[] = [
    {
      id: 'executive',
      title: 'Executive & Strategy',
      shortTitle: 'Executive',
      icon: LayoutDashboard,
      items: [
        {
          id: 'search',
          label: 'Global ERP Search',
          icon: Search,
          badge: '⌘K',
          badgeColor: 'bg-blue-600',
          description: 'Unified record search & lookup'
        },
        {
          id: 'dashboard',
          label: 'Executive Dashboard',
          icon: LayoutDashboard,
          badge: null,
          description: 'High-level KPIs & executive overview'
        },
        {
          id: 'pitch_deck',
          label: 'Investor Pitch Deck',
          icon: Presentation,
          badge: 'Deck',
          badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
          description: 'Interactive investor presentation'
        },
        {
          id: 'sales',
          label: 'Sales Performance',
          icon: Target,
          badge: null,
          description: 'Quotas, conversion & team pipeline'
        }
      ]
    },
    {
      id: 'sales_eng',
      title: 'Sales & Engineering',
      shortTitle: 'Sales/BOQ',
      icon: Briefcase,
      items: [
        {
          id: 'crm',
          label: 'CRM & HVAC Leads',
          icon: Users,
          badge: leadCount > 0 ? `${leadCount}` : null,
          badgeColor: 'bg-blue-500',
          description: 'HVAC inquiries, client leads & visits'
        },
        {
          id: 'quotes',
          label: 'Quotes & Estimations',
          icon: FileText,
          badge: null,
          description: 'Estimation sheets & customer quotes'
        },
        {
          id: 'projects',
          label: 'Projects & BOQ Engine',
          icon: Briefcase,
          badge: openShortagesCount > 0 ? `${openShortagesCount} Short` : null,
          badgeColor: 'bg-amber-500',
          description: 'BOQ execution, jobs & shortages'
        },
        {
          id: 'cost_analysis',
          label: 'Project Cost & PO Variance',
          icon: TrendingUp,
          badge: 'Actuals',
          badgeColor: 'bg-emerald-600',
          description: 'PO variance & budget tracking'
        }
      ]
    },
    {
      id: 'services_section',
      title: 'Services & AMC Contracts',
      shortTitle: 'Services/AMC',
      icon: ShieldCheck,
      items: [
        {
          id: 'services_amc',
          label: 'Services & AMC Contracts',
          icon: ShieldCheck,
          badge: activeAmcCount ? `${activeAmcCount} AMC` : 'Active',
          badgeColor: 'bg-emerald-600',
          description: 'AMC contracts, PPM schedule & breakdown tickets'
        },
        {
          id: 'services_schedule',
          label: 'Service Scheduling & PPM',
          icon: CalendarClock,
          badge: 'Live',
          badgeColor: 'bg-blue-600',
          description: 'PPM visits, 4-point checklists & breakdown queue'
        },
        {
          id: 'workorders',
          label: 'Work Orders & Field Dispatch',
          icon: Wrench,
          badge: null,
          description: 'Field engineer dispatch & service'
        }
      ]
    },
    {
      id: 'procurement_field',
      title: 'Supply Chain & Procurement',
      shortTitle: 'Supply Chain',
      icon: ShoppingCart,
      items: [
        {
          id: 'procurement',
          label: 'Inventory & PR/PO',
          icon: ShoppingCart,
          badge: pendingPRCount + pendingPOCount > 0 ? `${pendingPRCount + pendingPOCount} Act` : null,
          badgeColor: 'bg-red-500',
          description: 'Purchase requisitions & vendor POs'
        },
        {
          id: 'inventory',
          label: 'Warehouse Stock & SKUs',
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
          badgeColor: 'bg-red-500',
          description: 'Warehouse ledger & stock balance'
        }
      ]
    },
    {
      id: 'finance_section',
      title: 'Finance & Accounting',
      shortTitle: 'Finance',
      icon: Landmark,
      items: [
        {
          id: 'finance',
          label: 'General Ledger & Vouchers',
          icon: Landmark,
          badge: null,
          description: 'General ledger & journal vouchers'
        },
        {
          id: 'payments',
          label: 'Invoices & Receivables',
          icon: CreditCard,
          badge: pendingInvoicesCount > 0 ? `${pendingInvoicesCount}` : null,
          badgeColor: 'bg-purple-500',
          description: 'Tax invoices, GST & receivables'
        }
      ]
    },
    {
      id: 'hr_section',
      title: 'AlphaHR & Talent Operations',
      shortTitle: 'AlphaHR',
      icon: Sparkles,
      items: [
        {
          id: 'hr',
          label: 'AlphaHR Suite (HRMS & Payroll)',
          icon: Sparkles,
          badge: '12 Subs',
          badgeColor: 'bg-indigo-600',
          description: 'HRMS, biometric logs & payroll'
        },
        {
          id: 'ess',
          label: 'ESS / MSS Self-Service Portal',
          icon: UserCheck,
          badge: 'Portal',
          badgeColor: 'bg-emerald-600',
          description: 'Employee self-service & leaves'
        }
      ]
    },
    {
      id: 'master_section',
      title: 'Master Data Hub',
      shortTitle: 'Master Data',
      icon: Database,
      items: [
        {
          id: 'masterdata',
          label: 'Master Data Management',
          icon: Database,
          badge: 'Master',
          badgeColor: 'bg-blue-600',
          description: 'Clients, vendors, SKUs & tax slabs'
        }
      ]
    },
    {
      id: 'system_section',
      title: 'System & Administration',
      shortTitle: 'Admin',
      icon: Sliders,
      items: [
        {
          id: 'sheets',
          label: 'Google Sheet Master Sync',
          icon: FileSpreadsheet,
          badge: 'Live',
          badgeColor: 'bg-emerald-500',
          description: 'Live Google Sheets bidirectional sync'
        },
        {
          id: 'users',
          label: 'Users & RBAC Roles',
          icon: ShieldCheck,
          badge: 'Admin',
          badgeColor: 'bg-slate-700',
          description: 'Role-based access control (RBAC)'
        },
        {
          id: 'customization',
          label: 'Admin Customization',
          icon: Sliders,
          badge: null,
          description: 'ERP configuration & numbering'
        },
        {
          id: 'audit',
          label: 'Audit Trail Logs',
          icon: History,
          badge: null,
          description: 'Security logs & system audit trail'
        }
      ]
    }
  ];

  // Role Module Visibility Filter
  const currentUser = storageService.getCurrentUser();
  const effectiveRole: UserRole = currentRole || currentUser?.role || 'executive';
  const roleMeta = ROLE_DEFINITIONS[effectiveRole] || ROLE_DEFINITIONS.executive;
  const allowedModuleIds = storageService.getModulesForRole(effectiveRole);

  const filteredNavGroups: NavGroup[] = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => allowedModuleIds.includes(item.id))
    }))
    .filter((group) => group.items.length > 0);

  // Hover & Auto-collapse state
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Pin state: when pinned, sidebar stays open permanently.
  // When unpinned, sidebar collapses to sub menu bar and opens interactive flyouts on hover.
  const [internalPinned, setInternalPinned] = useState<boolean>(() => {
    if (controlledIsCollapsed !== undefined) {
      return !controlledIsCollapsed;
    }
    try {
      const saved = sessionStorage.getItem('alphaerp_sidebar_pinned_state');
      if (saved !== null) {
        return saved === 'true';
      }
      return false; // Default: collapsed to sub menu bar
    } catch {
      return false;
    }
  });

  const isPinned = controlledIsCollapsed !== undefined ? !controlledIsCollapsed : internalPinned;

  const togglePin = () => {
    if (controlledToggleCollapse) {
      controlledToggleCollapse();
    } else {
      setInternalPinned((prev) => {
        const next = !prev;
        try {
          sessionStorage.setItem('alphaerp_sidebar_pinned_state', String(next));
        } catch {}
        return next;
      });
    }
  };

  // Determine whether sidebar is visually expanded
  const isExpanded = isMobileOpen || (controlledIsCollapsed !== undefined ? !controlledIsCollapsed : isPinned);
  const isCollapsed = !isExpanded;

  // Active Flyout Sub Menu Bar state for Collapsed Mode
  const [activeFlyoutGroup, setActiveFlyoutGroup] = useState<{
    group: NavGroup;
    top: number;
    hoveredItemId?: string;
  } | null>(null);
  const flyoutTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearFlyoutTimer = () => {
    if (flyoutTimerRef.current) {
      clearTimeout(flyoutTimerRef.current);
      flyoutTimerRef.current = null;
    }
  };

  const handleRailItemMouseEnter = (group: NavGroup, item: NavItem, event: React.MouseEvent<HTMLElement>) => {
    clearFlyoutTimer();
    const rect = event.currentTarget.getBoundingClientRect();
    const estimatedHeight = 70 + group.items.length * 46;
    const windowHeight = window.innerHeight;
    const idealTop = rect.top - 10;
    const clampedTop = Math.max(12, Math.min(windowHeight - estimatedHeight - 16, idealTop));

    setActiveFlyoutGroup({
      group,
      top: clampedTop,
      hoveredItemId: item.id
    });
  };

  const handleRailItemMouseLeave = () => {
    clearFlyoutTimer();
    flyoutTimerRef.current = setTimeout(() => {
      setActiveFlyoutGroup(null);
    }, 180);
  };

  const handleFlyoutMouseEnter = () => {
    clearFlyoutTimer();
  };

  const handleFlyoutMouseLeave = () => {
    clearFlyoutTimer();
    flyoutTimerRef.current = setTimeout(() => {
      setActiveFlyoutGroup(null);
    }, 180);
  };

  // Close flyout on Escape key or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveFlyoutGroup(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearFlyoutTimer();
    };
  }, []);

  // Hover Tooltip state for Collapsed Mode
  const [hoveredItem, setHoveredItem] = useState<{
    id: string;
    label: string;
    groupTitle: string;
    badge?: string | null;
    badgeColor?: string;
    isActive?: boolean;
    top: number;
  } | null>(null);

  // Accordion collapsible state for groups in expanded mode: default all groups collapsed
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const collapseAll = () => {
    setExpandedGroups({});
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    filteredNavGroups.forEach((g) => {
      allExpanded[g.id] = true;
    });
    setExpandedGroups(allExpanded);
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setHoveredItem(null);
    setActiveFlyoutGroup(null);
    clearFlyoutTimer();
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Prominent theme group background colors
  const groupBgColors: Record<string, string> = {
    executive: 'bg-[#030334] text-white border-blue-900/60 hover:bg-[#070747]',
    sales_eng: 'bg-[#030334] text-white border-blue-900/60 hover:bg-[#070747]',
    services_section: 'bg-[#030334] text-white border-blue-900/60 hover:bg-[#070747]',
    procurement_field: 'bg-[#030334] text-white border-blue-900/60 hover:bg-[#070747]',
    finance_section: 'bg-[#030334] text-white border-blue-900/60 hover:bg-[#070747]',
    hr_section: 'bg-[#030334] text-white border-blue-900/60 hover:bg-[#070747]',
    master_section: 'bg-[#030334] text-white border-blue-900/60 hover:bg-[#070747]',
    system_section: 'bg-[#030334] text-white border-blue-900/60 hover:bg-[#070747]'
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`bg-[var(--sidebar-bg,#F8FAFB)] border-r border-[var(--sidebar-border,#E5E7EB)] flex flex-col justify-between h-full text-[var(--sidebar-text,#374151)] select-none transition-[width] duration-300 ease-in-out shrink-0 ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 z-50 w-64 shadow-2xl'
            : isExpanded
            ? 'w-64 z-30 shadow-xl'
            : 'w-16 z-30 shadow-lg'
        }`}
      >
        {/* Mobile Close Button only when mobile drawer is open */}
        {isMobileOpen && onCloseMobile && (
          <div className="md:hidden p-2 flex justify-end border-b border-[#152347] bg-[#09112c]/90">
            <button
              onClick={onCloseMobile}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-rose-900/60 cursor-pointer"
              title="Close mobile menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      {/* Navigation Scrollable Body */}
      <div
        onScroll={() => {
          setHoveredItem(null);
          setActiveFlyoutGroup(null);
        }}
        className="flex-1 min-h-0 p-2 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar"
      >
        {/* Accordion Quick Expand / Collapse buttons when expanded */}
        {!isCollapsed && (
          <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 bg-[var(--sidebar-hover-bg,#F3F4F6)] rounded-xl border border-[var(--sidebar-border,#E5E7EB)]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color,#3B82F6)] animate-pulse"></span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--sidebar-text-muted,#6B7280)]">
                Workflows
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="btn-expand-all-workflows"
                onClick={expandAll}
                className="p-1 text-[var(--sidebar-text-muted,#6B7280)] hover:text-[var(--sidebar-text-hover,#1F2937)] rounded bg-[var(--sidebar-bg,#F8FAFB)] hover:bg-[var(--sidebar-active-bg,#EFF6FF)] border border-[var(--sidebar-border,#E5E7EB)] text-[9px] transition-all duration-200 ease-out transform hover:scale-110 active:scale-95 cursor-pointer"
                title="Expand all workflow groups"
              >
                <UnfoldHorizontal className="w-3 h-3" />
              </button>
              <button
                id="btn-collapse-all-workflows"
                onClick={collapseAll}
                className="p-1 text-[var(--sidebar-text-muted,#6B7280)] hover:text-[var(--sidebar-text-hover,#1F2937)] rounded bg-[var(--sidebar-bg,#F8FAFB)] hover:bg-[var(--sidebar-active-bg,#EFF6FF)] border border-[var(--sidebar-border,#E5E7EB)] text-[9px] transition-all duration-200 ease-out transform hover:scale-110 active:scale-95 cursor-pointer"
                title="Collapse all workflow groups"
              >
                <FoldHorizontal className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Grouped Items */}
        {filteredNavGroups.map((group, groupIdx) => {
          const isGroupExpanded = !!expandedGroups[group.id];
          const hasActiveChild = group.items.some((i) => i.id === activeTab);
          const GroupIcon = group.icon;
          const prominentBg = groupBgColors[group.id] || 'bg-[#0f1d40] text-white border-blue-900/40';

          if (isCollapsed) {
            // COLLAPSED SUB MENU RAIL MODE
            return (
              <div key={group.id} className="space-y-1.5 pb-1 border-b border-[var(--sidebar-border,#E5E7EB)] last:border-b-0">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isHoveredInSubmenu = activeFlyoutGroup?.hoveredItemId === item.id;

                  return (
                    <div key={item.id} className="relative flex justify-center">
                      <motion.button
                        id={`sidebar-rail-nav-${item.id}`}
                        onClick={() => handleSelectTab(item.id)}
                        whileTap={{ scale: 0.94 }}
                        onMouseEnter={(e) => handleRailItemMouseEnter(group, item, e)}
                        onMouseLeave={handleRailItemMouseLeave}
                        className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 overflow-hidden cursor-pointer ${
                          isActive
                            ? 'bg-[var(--sidebar-active-bg,#EFF6FF)] text-[var(--primary-color,#3B82F6)] shadow-xs ring-2 ring-[var(--sidebar-active-border,#3B82F6)] font-bold'
                            : isHoveredInSubmenu
                            ? 'bg-[var(--sidebar-hover-bg,#F3F4F6)] text-[var(--sidebar-hover-text,#1F2937)] ring-1 ring-[var(--sidebar-active-border,#3B82F6)]/50'
                            : 'text-[var(--sidebar-text-muted,#6B7280)] hover:bg-[var(--sidebar-hover-bg,#F3F4F6)] hover:text-[var(--sidebar-hover-text,#1F2937)]'
                        }`}
                        title={`${item.label} (${group.title})`}
                        aria-label={item.label}
                      >
                        <Icon className={`relative z-10 w-5 h-5 transition-transform duration-200 ease-out group-hover:scale-110 ${isActive ? 'text-[var(--primary-color,#3B82F6)]' : 'text-[var(--sidebar-text-muted,#6B7280)] group-hover:text-[var(--primary-color,#3B82F6)]'}`} />

                        {/* Notification Dot / Badge on icon */}
                        {item.badge && (
                          <span
                            className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ring-2 ring-[var(--sidebar-bg,#F8FAFB)] z-20 transition-transform duration-200 ease-out group-hover:scale-115 ${
                              item.badgeColor || 'bg-[var(--primary-color,#3B82F6)]'
                            }`}
                          />
                        )}
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            );
          }

          // EXPANDED MODE
          return (
            <div key={group.id} className="space-y-1 rounded-xl p-1 bg-[var(--card-bg,#FFFFFF)] border border-[var(--sidebar-border,#E5E7EB)] shadow-2xs">
              {/* Group Collapsible Button Header */}
              <motion.button
                id={`sidebar-group-header-${group.id}`}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleGroup(group.id)}
                title={isGroupExpanded ? `Click to collapse ${group.title}` : `Click to expand ${group.title}`}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-200 ease-out transform hover:scale-[1.01] active:scale-[0.99] border cursor-pointer ${
                  hasActiveChild
                    ? 'bg-[var(--sidebar-active-bg,#EFF6FF)] text-[var(--sidebar-active-text,#1F2937)] border-[var(--sidebar-active-border,#3B82F6)] font-extrabold shadow-xs'
                    : 'bg-[var(--sidebar-hover-bg,#F3F4F6)] text-[var(--sidebar-text,#374151)] border-[var(--sidebar-border,#E5E7EB)] hover:bg-[var(--sidebar-bg,#F8FAFB)] hover:text-[var(--sidebar-text-hover,#1F2937)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className={`w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover:scale-110 ${hasActiveChild ? 'text-[var(--primary-color,#3B82F6)]' : 'text-[var(--sidebar-text-muted,#6B7280)]'}`} />
                  <span className="truncate">{group.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  {hasActiveChild && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color,#3B82F6)]" title="Active module inside"></span>
                  )}
                  {isGroupExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--sidebar-text-muted,#6B7280)] transition-transform duration-200 group-hover:translate-y-0.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--sidebar-text-muted,#6B7280)] transition-transform duration-200 group-hover:translate-x-0.5" />
                  )}
                </div>
              </motion.button>

              {/* Items under Group */}
              {isGroupExpanded && (
                <div className="space-y-0.5 pt-0.5 pb-0.5 px-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        id={`sidebar-nav-${item.id}`}
                        onClick={() => handleSelectTab(item.id)}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold overflow-hidden transition-all duration-200 ease-out transform hover:scale-[1.01] active:scale-[0.98] group cursor-pointer ${
                          isActive
                            ? 'bg-[var(--sidebar-active-bg,#EFF6FF)] text-[var(--sidebar-active-text,#1F2937)] font-bold shadow-xs border-l-3 border-[var(--sidebar-active-border,#3B82F6)]'
                            : 'text-[var(--sidebar-text-muted,#6B7280)] hover:bg-[var(--sidebar-hover-bg,#F3F4F6)] hover:text-[var(--sidebar-hover-text,#1F2937)]'
                        }`}
                      >
                        <div className="relative z-10 flex items-center gap-2 min-w-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110 ${isActive ? 'text-[var(--primary-color,#3B82F6)]' : 'text-[var(--sidebar-text-muted,#6B7280)] group-hover:text-[var(--primary-color,#3B82F6)]'}`} />
                          <span className="truncate transition-transform duration-200 ease-out group-hover:translate-x-0.5">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`relative z-10 text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white shrink-0 ml-1 shadow-xs transition-transform duration-200 ease-out group-hover:scale-105 ${
                              item.badgeColor || 'bg-[var(--primary-color,#3B82F6)]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Sub Menu Bar Flyout in Collapsed Mode */}
      {isCollapsed && activeFlyoutGroup && (
        <div
          role="menu"
          aria-label={`${activeFlyoutGroup.group.title} Sub Menu`}
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
          className="fixed left-[70px] z-50 w-72 bg-[var(--card-bg,#FFFFFF)] text-[var(--text-primary,#1F2937)] rounded-2xl shadow-2xl border border-[var(--card-border,#E5E7EB)] p-2 select-none ring-1 ring-[var(--primary-color,#3B82F6)]/20"
          style={{ top: `${activeFlyoutGroup.top}px` }}
        >
          {/* Sub Menu Bar Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-default,#E5E7EB)] mb-1.5 bg-[var(--sidebar-hover-bg,#F3F4F6)] rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-[var(--primary-color-light,#EFF6FF)] text-[var(--primary-color,#3B82F6)] border border-[var(--primary-color,#3B82F6)]/30 shrink-0">
                <activeFlyoutGroup.group.icon className="w-4 h-4 text-[var(--primary-color,#3B82F6)]" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold text-[var(--text-primary,#1F2937)] truncate uppercase tracking-wider">
                  {activeFlyoutGroup.group.title}
                </div>
                <div className="text-[9px] text-[var(--text-secondary,#6B7280)] font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color,#3B82F6)] animate-pulse" />
                  <span>Sub Menu Bar • {activeFlyoutGroup.group.items.length} Modules</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Menu Items List */}
          <div className="space-y-1">
            {activeFlyoutGroup.group.items.map((subItem) => {
              const SubIcon = subItem.icon;
              const isCurrentActive = activeTab === subItem.id;
              const isFocused = activeFlyoutGroup.hoveredItemId === subItem.id;

              return (
                <motion.button
                  key={subItem.id}
                  id={`sidebar-flyout-nav-${subItem.id}`}
                  type="button"
                  onClick={() => handleSelectTab(subItem.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all duration-200 ease-out transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer group ${
                    isCurrentActive
                      ? 'bg-[var(--primary-color,#3B82F6)] text-[var(--primary-text-on-primary,#FFFFFF)] shadow-sm font-bold'
                      : isFocused
                      ? 'bg-[var(--sidebar-hover-bg,#F3F4F6)] text-[var(--text-primary,#1F2937)]'
                      : 'text-[var(--text-secondary,#6B7280)] hover:bg-[var(--sidebar-hover-bg,#F3F4F6)] hover:text-[var(--text-primary,#1F2937)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg transition-all duration-200 ease-out shrink-0 group-hover:scale-110 ${
                        isCurrentActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--primary-color-light,#EFF6FF)] text-[var(--primary-color,#3B82F6)]'
                      }`}
                    >
                      <SubIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold truncate transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                          {subItem.label}
                        </span>
                        {isCurrentActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white ring-2 ring-white/40 animate-pulse" />
                        )}
                      </div>
                      {subItem.description && (
                        <div
                          className={`text-[10px] truncate leading-tight transition-colors duration-200 ${
                            isCurrentActive
                              ? 'text-white/80'
                              : 'text-[var(--text-muted,#9CA3AF)] group-hover:text-[var(--text-secondary,#6B7280)]'
                          }`}
                        >
                          {subItem.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {subItem.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-2 shrink-0 transition-transform duration-200 ease-out group-hover:scale-105 ${
                          subItem.badgeColor || 'bg-[var(--primary-color,#3B82F6)] text-white'
                        }`}
                      >
                        {subItem.badge}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted,#9CA3AF)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 ease-out" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Sub Menu Footer */}
          <div className="px-2.5 pt-2 pb-1 border-t border-[var(--border-default,#E5E7EB)] mt-1.5 flex items-center justify-between text-[9px] text-[var(--text-muted,#9CA3AF)]">
            <span>Click any module to jump</span>
            <span className="font-mono text-[var(--primary-color,#3B82F6)]">Esc to close</span>
          </div>
        </div>
      )}

      {/* Bottom padding spacer */}
      <div className="h-2" />
    </aside>
  </>
  );
};
