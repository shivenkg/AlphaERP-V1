import React, { useState, useEffect } from 'react';
import {
  Activity,
  FileText,
  CreditCard,
  Boxes,
  ShoppingCart,
  ClipboardCheck,
  Wrench,
  UserPlus,
  Camera,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  RefreshCw,
  Eye,
  Layers,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  PackageCheck
} from 'lucide-react';
import { AuditLog } from '../types';
import { storageService } from '../services/storageService';

interface ActivityFeedProps {
  auditLogs?: AuditLog[];
  onNavigate?: (tab: string) => void;
  maxItems?: number;
  showControls?: boolean;
}

type ActivityCategory = 'ALL' | 'QUOTES' | 'FINANCE' | 'INVENTORY' | 'PROCUREMENT' | 'WORK_ORDERS' | 'CRM';

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  auditLogs: propAuditLogs,
  onNavigate,
  maxItems = 10,
  showControls = true
}) => {
  // Live state subscribed to storageService
  const [liveLogs, setLiveLogs] = useState<AuditLog[]>(() => {
    return propAuditLogs || storageService.getAuditLogs();
  });
  const [activeCategory, setActiveCategory] = useState<ActivityCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<AuditLog | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Subscribe to real-time changes
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setLiveLogs(storageService.getAuditLogs());
    });

    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000); // refresh relative timestamps every 15s

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  // Sync when prop changes
  useEffect(() => {
    if (propAuditLogs) {
      setLiveLogs(propAuditLogs);
    }
  }, [propAuditLogs]);

  // Helper to format human-readable relative time
  const getRelativeTime = (timestamp: string): string => {
    try {
      const timeMs = new Date(timestamp).getTime();
      const diffSec = Math.max(0, Math.floor((currentTime - timeMs) / 1000));

      if (diffSec < 45) return 'Just now';
      if (diffSec < 90) return '1m ago';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 7200) return '1h ago';
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      if (diffSec < 172800) return 'Yesterday';
      return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Classify audit logs into semantic action groups
  const getActionMetadata = (log: AuditLog) => {
    const action = log.action;
    const entityType = log.entityType;
    const summary = log.summary || '';

    if (entityType === 'QUOTE' || summary.includes('Quote') || summary.includes('Quotation')) {
      if (action === 'AWARD' || summary.includes('Awarded')) {
        return {
          title: 'Contract Awarded',
          category: 'QUOTES' as ActivityCategory,
          icon: Sparkles,
          iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
          targetTab: 'projects',
          typeLabel: 'Sales Won'
        };
      }
      return {
        title: 'Quote Created',
        category: 'QUOTES' as ActivityCategory,
        icon: FileText,
        iconColor: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
        targetTab: 'quotes',
        typeLabel: 'Quotation'
      };
    }

    if (entityType === 'PAYMENT' || action === 'PAYMENT_PROCESSED' || summary.includes('payment') || summary.includes('Invoice')) {
      if (action === 'PAYMENT_PROCESSED' || summary.includes('Processed') || summary.includes('Paid')) {
        return {
          title: 'Invoice Paid',
          category: 'FINANCE' as ActivityCategory,
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
          targetTab: 'finance',
          typeLabel: 'Settlement'
        };
      }
      if (summary.includes('photo') || summary.includes('attachment')) {
        return {
          title: 'Invoice Photo Attached',
          category: 'FINANCE' as ActivityCategory,
          icon: Camera,
          iconColor: 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800',
          badgeColor: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
          targetTab: 'finance',
          typeLabel: 'Paper Receipt'
        };
      }
      return {
        title: 'Invoice Generated',
        category: 'FINANCE' as ActivityCategory,
        icon: CreditCard,
        iconColor: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
        targetTab: 'finance',
        typeLabel: 'Billing'
      };
    }

    if (entityType === 'INVENTORY' || summary.includes('inventory') || summary.includes('stock') || summary.includes('GRN')) {
      return {
        title: 'Inventory Updated',
        category: 'INVENTORY' as ActivityCategory,
        icon: Boxes,
        iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
        targetTab: 'inventory',
        typeLabel: 'Warehouse SKU'
      };
    }

    if (entityType === 'PR' || action === 'GENERATE_PR' || action === 'CONVERT_TO_PO' || summary.includes('PR-')) {
      return {
        title: action === 'APPROVE' ? 'PR Approved' : 'PR Generated',
        category: 'PROCUREMENT' as ActivityCategory,
        icon: ClipboardCheck,
        iconColor: 'text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
        badgeColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
        targetTab: 'procurement',
        typeLabel: 'Requisition'
      };
    }

    if (entityType === 'PO' || action === 'SEND_TO_VENDOR' || summary.includes('PO-')) {
      return {
        title: 'PO Sent to Vendor',
        category: 'PROCUREMENT' as ActivityCategory,
        icon: ShoppingCart,
        iconColor: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
        targetTab: 'procurement',
        typeLabel: 'Purchase Order'
      };
    }

    if (entityType === 'WORK_ORDER' || summary.includes('WO-') || summary.includes('Work Order')) {
      return {
        title: 'Work Order Scheduled',
        category: 'WORK_ORDERS' as ActivityCategory,
        icon: Wrench,
        iconColor: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
        badgeColor: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800',
        targetTab: 'workorders',
        typeLabel: 'Field Operations'
      };
    }

    if (entityType === 'LEAD' || summary.includes('lead') || summary.includes('Lead')) {
      return {
        title: 'Lead Created',
        category: 'CRM' as ActivityCategory,
        icon: UserPlus,
        iconColor: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
        targetTab: 'crm',
        typeLabel: 'CRM Pipeline'
      };
    }

    if (entityType === 'GOOGLE_SHEET' || summary.includes('Sheets') || summary.includes('Spreadsheet')) {
      return {
        title: 'Google Sheets Synced',
        category: 'ALL' as ActivityCategory,
        icon: FileSpreadsheet,
        iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        targetTab: 'audit',
        typeLabel: 'Cloud Sync'
      };
    }

    // Default fallback
    return {
      title: `${log.action} ${log.entityType}`,
      category: 'ALL' as ActivityCategory,
      icon: Activity,
      iconColor: 'text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      targetTab: 'audit',
      typeLabel: 'System Event'
    };
  };

  // Filter logs based on category and search query
  const filteredLogs = liveLogs.filter((log) => {
    const meta = getActionMetadata(log);
    const matchesCategory = activeCategory === 'ALL' || meta.category === activeCategory;

    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.userName || '').toLowerCase().includes(q) ||
      (log.summary || '').toLowerCase().includes(q) ||
      (log.entityId || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q) ||
      meta.title.toLowerCase().includes(q)
    );
  });

  const displayLogs = filteredLogs.slice(0, maxItems);

  // Quick Action Simulator for Real-Time demonstration
  const handleTriggerSimulation = (type: 'quote' | 'invoice' | 'inventory') => {
    setIsSimulating(true);
    if (type === 'quote') {
      const qVal = Math.floor(600000 + Math.random() * 2400000);
      const qNum = `QTE-2026-00${Math.floor(50 + Math.random() * 40)}`;
      storageService.logAudit(
        'CREATE',
        'QUOTE',
        qNum,
        `Created new quotation ${qNum} for Prestige Cyber Tower Phase 2 (₹${qVal.toLocaleString()}) with 26.4% target margin`
      );
      storageService.addNotification(
        'New Quote Created',
        `Quotation ${qNum} generated for Prestige Cyber Tower (₹${qVal.toLocaleString()})`,
        'info',
        'quotes'
      );
    } else if (type === 'invoice') {
      const invVal = Math.floor(350000 + Math.random() * 1500000);
      const invNum = `INV-2026-00${Math.floor(85 + Math.random() * 15)}`;
      storageService.logAudit(
        'PAYMENT_PROCESSED',
        'PAYMENT',
        invNum,
        `Settled milestone payment for invoice ${invNum} (₹${invVal.toLocaleString()}) via Bank NEFT [Ref: NEFT-7729104]`
      );
      storageService.addNotification(
        'Invoice Paid',
        `Payment received for ${invNum} of ₹${invVal.toLocaleString()}`,
        'success',
        'finance'
      );
    } else if (type === 'inventory') {
      const skus = ['VRF-ODU-20HP', 'COP-TUBE-0.75', 'HON-BMS-TSTAT', 'DIFF-SQR-4WAY'];
      const pickSku = skus[Math.floor(Math.random() * skus.length)];
      const invList = storageService.getInventory();
      const item = invList.find((i) => i.sku === pickSku) || invList[0];
      if (item) {
        const delta = Math.floor(5 + Math.random() * 20);
        storageService.updateInventoryItem(item.id, {
          currentStock: item.currentStock + delta
        });
      }
    }

    setTimeout(() => {
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
      {/* Feed Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/70 to-white dark:from-slate-900 dark:to-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Real-Time Activity Feed
              </h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live audit stream of recent user actions, estimations, billing & stock transactions
            </p>
          </div>
        </div>

        {/* Quick Simulation Trigger & View Full Logs */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Demo Simulator Buttons */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleTriggerSimulation('quote')}
              disabled={isSimulating}
              className="px-2 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
              title="Broadcast simulated 'Quote Created' action to verify real-time stream"
            >
              <FileText className="w-3 h-3" />
              <span>+ Quote</span>
            </button>
            <button
              onClick={() => handleTriggerSimulation('invoice')}
              disabled={isSimulating}
              className="px-2 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
              title="Broadcast simulated 'Invoice Paid' action to verify real-time stream"
            >
              <CreditCard className="w-3 h-3" />
              <span>+ Paid</span>
            </button>
            <button
              onClick={() => handleTriggerSimulation('inventory')}
              disabled={isSimulating}
              className="px-2 py-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
              title="Broadcast simulated 'Inventory Updated' action to verify real-time stream"
            >
              <Boxes className="w-3 h-3" />
              <span>+ Stock</span>
            </button>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('audit')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-colors cursor-pointer border border-blue-100 dark:border-blue-900"
            >
              <span>Full Audit</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      {showControls && (
        <div className="p-3 sm:px-5 sm:py-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          {/* Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { key: 'ALL', label: 'All Actions' },
              { key: 'QUOTES', label: 'Quotes' },
              { key: 'FINANCE', label: 'Invoices' },
              { key: 'INVENTORY', label: 'Inventory' },
              { key: 'PROCUREMENT', label: 'PR & PO' },
              { key: 'CRM', label: 'Leads' }
            ].map((tab) => {
              const isActive = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key as ActivityCategory)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Search Filter */}
          <div className="relative w-full md:w-56">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter actions..."
              className="w-full pl-8 pr-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Activity Items List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[480px] overflow-y-auto">
        {displayLogs.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No activity matches current filter</p>
            <p className="text-[11px] text-slate-400">
              {searchQuery ? 'Try clearing your search term' : 'User actions will appear here in real-time'}
            </p>
          </div>
        ) : (
          displayLogs.map((log) => {
            const meta = getActionMetadata(log);
            const IconComponent = meta.icon;
            const relativeTime = getRelativeTime(log.timestamp);

            return (
              <div
                key={log.id}
                onClick={() => {
                  if (onNavigate && meta.targetTab) {
                    onNavigate(meta.targetTab);
                  } else {
                    setSelectedLogForDetail(log);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onNavigate && meta.targetTab) {
                      onNavigate(meta.targetTab);
                    } else {
                      setSelectedLogForDetail(log);
                    }
                  }
                }}
                title={meta.targetTab ? `Click to open in ${meta.typeLabel} (${meta.targetTab.toUpperCase()})` : 'Click to inspect audit log details'}
                className="p-3.5 sm:px-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex items-start justify-between gap-3 group cursor-pointer focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800/60"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Action Icon Badge */}
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${meta.iconColor}`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Activity Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {meta.title}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold border ${meta.badgeColor}`}>
                        {meta.typeLabel}
                      </span>
                      {log.entityId && (
                        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          {log.entityId}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug break-words">
                      {log.summary}
                    </p>

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-500 dark:text-slate-400">
                        By <strong className="text-slate-700 dark:text-slate-200">{log.userName || 'System'}</strong> ({log.userRole || 'User'})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1" title={new Date(log.timestamp).toLocaleString()}>
                        <Clock className="w-3 h-3" />
                        <span>{relativeTime}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Trigger */}
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLogForDetail(log);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Inspect Audit Metadata"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {onNavigate && meta.targetTab && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(meta.targetTab);
                      }}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer group-hover:translate-x-0.5 transition-transform"
                      title={`Open in ${meta.targetTab} module`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Feed Footer Summary */}
      <div className="p-3 sm:px-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Showing {displayLogs.length} of {liveLogs.length} total events recorded
        </span>
        {onNavigate && (
          <button
            onClick={() => onNavigate('audit')}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Open System Audit Ledger</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Detailed Log Modal */}
      {selectedLogForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Audit Event Details
                  </h3>
                  <span className="font-mono text-xs text-slate-400">{selectedLogForDetail.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-500 dark:text-slate-400">Action Summary</div>
                <div className="font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                  {selectedLogForDetail.summary}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">User</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {selectedLogForDetail.userName}
                  </div>
                  <div className="text-[10px] text-slate-500">Role: {selectedLogForDetail.userRole}</div>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Action & Entity</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {selectedLogForDetail.action} ({selectedLogForDetail.entityType})
                  </div>
                  <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                    {selectedLogForDetail.entityId}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 col-span-2">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Timestamp & Integrity</div>
                  <div className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                    {new Date(selectedLogForDetail.timestamp).toUTCString()} ({new Date(selectedLogForDetail.timestamp).toLocaleString()})
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {onNavigate && (
                <button
                  onClick={() => {
                    const meta = getActionMetadata(selectedLogForDetail);
                    setSelectedLogForDetail(null);
                    onNavigate(meta.targetTab);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Open Target Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
