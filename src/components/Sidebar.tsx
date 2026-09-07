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
  Flame,
  CheckCircle,
  HelpCircle,
  X,
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
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  PinOff,
  Zap,
  Search,
  TrendingUp,
  Presentation
} from 'lucide-react';
import { JSAlphaSoftLogo } from './JSAlphaSoftLogo';
import { QuickExportMenu } from './QuickExportMenu';
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
      id: 'procurement_field',
      title: 'Supply Chain & Field',
      shortTitle: 'Procure/Field',
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

  // Accordion collapsible state for groups in expanded mode
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    filteredNavGroups.forEach((g) => {
      allCollapsed[g.id] = true;
    });
    setCollapsedGroups(allCollapsed);
  };

  const expandAll = () => {
    setCollapsedGroups({});
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
        className={`bg-[#070d21] border-r border-[#152347] flex flex-col justify-between h-full text-slate-200 select-none transition-[width] duration-300 ease-in-out shrink-0 ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 z-50 w-64 shadow-2xl'
            : isExpanded
            ? 'w-64 z-30 shadow-xl'
            : 'w-16 z-30 shadow-lg'
        }`}
      >
        {/* Top Header & Logo Area */}
        <div className="p-2.5 border-b border-[#152347] bg-[#09112c]/90 flex items-center justify-between">
          {isExpanded ? (
            <div className="flex items-center justify-between w-full min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <JSAlphaSoftLogo size="xs" variant="icon" isDarkTheme={true} />
                <div className="min-w-0 truncate">
                  <div className="text-xs font-black text-white tracking-tight flex items-center gap-1">
                    <span className="text-[#0080FF]">Atmos</span>
                    <span>Aircon</span>
                  </div>
                  <div className="text-[9px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <span>AlphaERP Hub</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={togglePin}
                  className="p-1.5 rounded-lg text-xs font-medium transition-colors text-slate-400 bg-[#14234c] hover:bg-blue-600 hover:text-white cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
                {onCloseMobile && (
                  <button
                    onClick={onCloseMobile}
                    className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg bg-rose-900/60"
                    title="Close mobile menu"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full gap-2 py-1">
              <JSAlphaSoftLogo size="xs" variant="icon" isDarkTheme={true} />
              <button
                onClick={togglePin}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-[#14234c] hover:bg-blue-600 transition-colors cursor-pointer"
                title="Expand to Full Pinned Sidebar"
                aria-label="Expand to Full Pinned Sidebar"
              >
                <PanelLeftOpen className="w-3.5 h-3.5 text-blue-300" />
              </button>
              <div className="text-[7.5px] font-bold text-blue-300/80 uppercase tracking-widest text-center">
                Sub Menu
              </div>
            </div>
          )}
        </div>

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
          <div className="flex items-center justify-between px-2 py-1.5 mb-1 bg-[#030334] rounded-xl border border-[#1b2b5a]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200">
                Workflows
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={expandAll}
                className="p-1 text-slate-300 hover:text-white rounded bg-[#14234c] hover:bg-blue-600 text-[9px] transition-colors"
                title="Expand all workflow groups"
              >
                <UnfoldHorizontal className="w-3 h-3" />
              </button>
              <button
                onClick={collapseAll}
                className="p-1 text-slate-300 hover:text-white rounded bg-[#14234c] hover:bg-blue-600 text-[9px] transition-colors"
                title="Collapse all workflow groups"
              >
                <FoldHorizontal className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Grouped Items */}
        {filteredNavGroups.map((group, groupIdx) => {
          const isGroupCollapsed = !!collapsedGroups[group.id];
          const hasActiveChild = group.items.some((i) => i.id === activeTab);
          const GroupIcon = group.icon;
          const prominentBg = groupBgColors[group.id] || 'bg-[#0f1d40] text-white border-blue-900/40';

          if (isCollapsed) {
            // COLLAPSED SUB MENU RAIL MODE
            return (
              <div key={group.id} className="space-y-1.5 pb-1 border-b border-[#14234c]/60 last:border-b-0">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isHoveredInSubmenu = activeFlyoutGroup?.hoveredItemId === item.id;

                  return (
                    <div key={item.id} className="relative flex justify-center">
                      <motion.button
                        onClick={() => handleSelectTab(item.id)}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.96 }}
                        animate={{
                          scale: isActive ? 1.05 : 1
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 28
                        }}
                        onMouseEnter={(e) => handleRailItemMouseEnter(group, item, e)}
                        onMouseLeave={handleRailItemMouseLeave}
                        className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-200 overflow-hidden cursor-pointer ${
                          isActive
                            ? 'text-white shadow-lg shadow-blue-600/40 ring-2 ring-blue-400'
                            : isHoveredInSubmenu
                            ? 'text-white bg-[#15234f] ring-1 ring-blue-500/50'
                            : 'text-slate-300 hover:bg-[#15234f] hover:text-white'
                        }`}
                        title={`${item.label} (${group.title})`}
                        aria-label={item.label}
                      >
                        {/* Animated Active Background */}
                        {isActive && (
                          <motion.div
                            layoutId="activeCollapsedHighlight"
                            className="absolute inset-0 bg-gradient-to-tr from-[#0a0ada] via-blue-600 to-indigo-600 rounded-xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 450,
                              damping: 32
                            }}
                          />
                        )}

                        <Icon className={`relative z-10 w-5 h-5 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-300'}`} />

                        {/* Notification Dot / Badge on icon */}
                        {item.badge && (
                          <span
                            className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ring-2 ring-[#070d21] z-20 ${
                              item.badgeColor || 'bg-blue-500'
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
            <div key={group.id} className="space-y-1 rounded-xl p-1 bg-[#0a1128]/70 border border-[#16234b]">
              {/* Group Collapsible Button Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-300 shadow-xs border ${
                  hasActiveChild
                    ? `${prominentBg} ring-2 ring-blue-400/50 shadow-md font-extrabold`
                    : `${prominentBg} opacity-90 hover:opacity-100`
                }`}
              >
                <div className="flex items-center gap-2">
                  <GroupIcon className={`w-3.5 h-3.5 ${hasActiveChild ? 'text-cyan-300' : 'text-blue-200'}`} />
                  <span className="truncate">{group.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  {hasActiveChild && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ring-2 ring-cyan-400/40"></span>
                  )}
                  {isGroupCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-blue-200" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-blue-200" />
                  )}
                </div>
              </button>

              {/* Items under Group */}
              {!isGroupCollapsed && (
                <div className="space-y-0.5 pt-0.5 pb-0.5 px-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        whileTap={{ scale: 0.98 }}
                        animate={{
                          x: isActive ? 4 : 0
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30
                        }}
                        className={`w-full relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold overflow-hidden transition-colors duration-300 ${
                          isActive
                            ? 'text-white font-bold shadow-md ring-1 ring-blue-300/40'
                            : 'text-slate-200 hover:bg-[#15234f] hover:text-white'
                        }`}
                      >
                        {/* Smooth Sliding Background Animation */}
                        {isActive && (
                          <motion.div
                            layoutId="activeNavBackgroundHighlight"
                            className="absolute inset-0 bg-gradient-to-r from-[#0a0ada] via-blue-600 to-indigo-600 rounded-lg shadow-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 420,
                              damping: 32
                            }}
                          />
                        )}

                        {/* Subtle Active Left Indicator Bar */}
                        {isActive && (
                          <motion.span
                            layoutId="activeNavIndicatorBar"
                            className="absolute left-0 top-1 bottom-1 w-1 bg-cyan-300 rounded-r-full z-10"
                            transition={{
                              type: "spring",
                              stiffness: 480,
                              damping: 35
                            }}
                          />
                        )}

                        <div className="relative z-10 flex items-center gap-2 min-w-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'text-blue-300'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`relative z-10 text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white shrink-0 ml-1 shadow-xs transition-transform duration-200 ${
                              item.badgeColor || 'bg-blue-600'
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
          className="fixed left-[70px] z-50 w-72 bg-[#070d24]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-[#1d2e63] p-2 select-none ring-1 ring-blue-500/30"
          style={{ top: `${activeFlyoutGroup.top}px` }}
        >
          {/* Sub Menu Bar Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#182756] mb-1.5 bg-[#0a1438]/80 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-blue-900/60 text-blue-300 border border-blue-700/50 shrink-0">
                <activeFlyoutGroup.group.icon className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-extrabold text-white truncate uppercase tracking-wider">
                  {activeFlyoutGroup.group.title}
                </div>
                <div className="text-[9px] text-blue-300 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
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
                <button
                  key={subItem.id}
                  type="button"
                  onClick={() => handleSelectTab(subItem.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer group ${
                    isCurrentActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-bold ring-1 ring-cyan-400/40'
                      : isFocused
                      ? 'bg-[#152454] text-white'
                      : 'text-slate-200 hover:bg-[#13224f] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                        isCurrentActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#101b3e] text-blue-300 group-hover:bg-[#1c2e63] group-hover:text-cyan-300'
                      }`}
                    >
                      <SubIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold truncate">
                          {subItem.label}
                        </span>
                        {isCurrentActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 ring-2 ring-cyan-400/40 animate-pulse" />
                        )}
                      </div>
                      {subItem.description && (
                        <div
                          className={`text-[10px] truncate leading-tight ${
                            isCurrentActive
                              ? 'text-blue-100'
                              : 'text-slate-400 group-hover:text-slate-300'
                          }`}
                        >
                          {subItem.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {subItem.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                        subItem.badgeColor || 'bg-blue-600'
                      }`}
                    >
                      {subItem.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sub Menu Footer */}
          <div className="px-2.5 pt-2 pb-1 border-t border-[#15234c] mt-1.5 flex items-center justify-between text-[9px] text-slate-400">
            <span>Click any module to jump</span>
            <span className="font-mono text-blue-400">Esc to close</span>
          </div>
        </div>
      )}

      {/* Bottom Global Quick Export & Automated Lifecycle Card */}
      {isExpanded ? (
        <div className="p-2 space-y-2">
          {/* Global Quick Export Floating Action Trigger Menu */}
          <QuickExportMenu activeTab={activeTab} isCollapsed={false} />

          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#0c183d] to-[#142352] border border-[#20346b] text-xs shadow-md">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-200">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">AlphaERP • Atmos Aircon</span>
              </div>
              <span className="px-1.5 py-0.2 text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono font-bold">
                v2.4 Live
              </span>
            </div>
            <div className="text-[9px] text-slate-300 leading-tight font-medium">
              Leads ➔ Quotes ➔ BOQ ➔ Procurement ➔ GL Vouchers ➔ HR Payroll
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 flex flex-col items-center justify-center gap-2 border-t border-[#152347] bg-[#081029]">
          <QuickExportMenu activeTab={activeTab} isCollapsed={true} />
          <button
            onClick={togglePin}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-[#14234c] transition-colors"
            title="Auto-collapse mode: Hover over sidebar to expand, or click to pin open"
          >
            <ChevronRight className="w-4 h-4 text-blue-300" />
          </button>
        </div>
      )}
    </aside>
  </>
  );
};
