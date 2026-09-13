import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Sparkles,
  FileText,
  CreditCard,
  ShoppingCart,
  Boxes,
  Briefcase,
  Users,
  Wrench,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  Radio,
  X,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { AuditLog } from '../../types';
import { storageService } from '../../services/storageService';

interface RecentActivityPanelProps {
  auditLogs?: AuditLog[];
  onNavigate?: (tab: string) => void;
  className?: string;
}

export const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({
  auditLogs: propAuditLogs,
  onNavigate,
  className = ''
}) => {
  const [logs, setLogs] = useState<AuditLog[]>(() => {
    return propAuditLogs || storageService.getAuditLogs();
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Subscribe to real-time storage changes
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setLogs(storageService.getAuditLogs());
      setLastRefreshed(new Date());
    });
    return () => unsubscribe();
  }, []);

  // Update when prop changes
  useEffect(() => {
    if (propAuditLogs) {
      setLogs(propAuditLogs);
      setLastRefreshed(new Date());
    }
  }, [propAuditLogs]);

  // Handle manual refresh animation
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLogs(storageService.getAuditLogs());
    setLastRefreshed(new Date());
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Extract exactly the last 5 audit log entries
  const recentLogs = logs.slice(0, 5);

  // Helper to format human-readable relative time
  const getRelativeTime = (timestamp: string): string => {
    try {
      const now = Date.now();
      const timeMs = new Date(timestamp).getTime();
      const diffSec = Math.max(0, Math.floor((now - timeMs) / 1000));

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

  // Helper to get semantic icon & color styling
  const getEventStyling = (log: AuditLog) => {
    const action = (log.action || '').toUpperCase();
    const entityType = (log.entityType || '').toUpperCase();
    const summary = (log.summary || '').toLowerCase();

    // 1. Quoting & Contracts
    if (entityType === 'QUOTE' || summary.includes('quote')) {
      if (action === 'AWARD' || summary.includes('award')) {
        return {
          icon: Sparkles,
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          badgeText: 'Awarded',
          targetTab: 'projects',
          accentColor: 'emerald'
        };
      }
      return {
        icon: FileText,
        iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        badgeText: action === 'CREATE' ? 'Quote Created' : 'Quote Updated',
        targetTab: 'quotes',
        accentColor: 'blue'
      };
    }

    // 2. Payments & Financials
    if (entityType === 'PAYMENT' || action === 'PAYMENT_PROCESSED' || summary.includes('payment') || summary.includes('invoice')) {
      return {
        icon: CreditCard,
        iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        badgeText: 'Payment',
        targetTab: 'payments',
        accentColor: 'purple'
      };
    }

    // 3. Procurement & PR/PO
    if (entityType === 'PR' || entityType === 'PO' || action.includes('PR') || action.includes('PO') || summary.includes('pr') || summary.includes('po')) {
      const isApproved = action === 'APPROVE' || summary.includes('approved');
      const isDispatched = action === 'SEND_TO_VENDOR' || summary.includes('vendor');
      return {
        icon: ShoppingCart,
        iconBg: isApproved
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        badgeBg: isApproved
          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        badgeText: isDispatched ? 'PO Sent' : isApproved ? 'PR Approved' : 'Procurement',
        targetTab: 'inventory',
        accentColor: isApproved ? 'emerald' : 'amber'
      };
    }

    // 4. Projects & BOQ
    if (entityType === 'PROJECT' || entityType === 'BOQ' || summary.includes('project') || summary.includes('boq')) {
      return {
        icon: Briefcase,
        iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        badgeText: 'Project BOQ',
        targetTab: 'projects',
        accentColor: 'indigo'
      };
    }

    // 5. CRM Leads
    if (entityType === 'LEAD' || summary.includes('lead')) {
      return {
        icon: Users,
        iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
        badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        badgeText: 'CRM Lead',
        targetTab: 'crm',
        accentColor: 'cyan'
      };
    }

    // 6. Google Sheets & Sync
    if (entityType === 'GOOGLE_SHEET' || action === 'SYNC_SHEETS' || summary.includes('sheet') || summary.includes('sync')) {
      return {
        icon: FileSpreadsheet,
        iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
        badgeBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        badgeText: 'Sheet Sync',
        targetTab: 'sheets',
        accentColor: 'teal'
      };
    }

    // 7. Work Orders
    if (entityType === 'WORK_ORDER' || summary.includes('work order') || summary.includes('service')) {
      return {
        icon: Wrench,
        iconBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
        badgeBg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        badgeText: 'Work Order',
        targetTab: 'workorders',
        accentColor: 'orange'
      };
    }

    // 8. Warehouse / Inventory
    if (entityType === 'INVENTORY' || summary.includes('stock') || summary.includes('inventory')) {
      return {
        icon: Boxes,
        iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        badgeText: 'Inventory',
        targetTab: 'inventory',
        accentColor: 'rose'
      };
    }

    // Default System / Security / Admin
    return {
      icon: ShieldCheck,
      iconBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      badgeText: action || 'Activity',
      targetTab: 'audit',
      accentColor: 'slate'
    };
  };

  const handleNavigateToModule = (tab: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <>
      <div
        id="recent-activity-panel"
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col ${className}`}
      >
        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                    Recent Activity
                  </h3>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Last 5 system audit events
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                id="btn-refresh-recent-activity"
                type="button"
                onClick={handleManualRefresh}
                title="Refresh audit log stream"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
              {onNavigate && (
                <button
                  id="btn-view-all-audit-logs"
                  type="button"
                  onClick={() => onNavigate('audit')}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Open full Audit Log view"
                >
                  <span>All Logs</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Status Sub-Bar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-500" />
            <span className="font-medium">Status: Monitoring</span>
          </div>
          <span className="font-mono text-[10px]">
            {recentLogs.length} recent • updated {getRelativeTime(lastRefreshed.toISOString())}
          </span>
        </div>

        {/* Audit Log Entries List (Last 5) */}
        <div className="p-3 sm:p-4 divide-y divide-slate-100 dark:divide-slate-800/80">
          {recentLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p>No audit log events recorded yet.</p>
            </div>
          ) : (
            recentLogs.map((log, index) => {
              const styling = getEventStyling(log);
              const EventIcon = styling.icon;
              const userName = (log as any).userName || (log as any).user || 'System User';
              const entityId = (log as any).entityId || (log as any).targetId || '';
              const summaryText = log.summary || `${log.action} on ${entityId || log.entityType}`;

              return (
                <div
                  key={log.id || `recent-log-${index}`}
                  id={`recent-log-entry-${index}`}
                  onClick={() => {
                    if (onNavigate && styling.targetTab) {
                      onNavigate(styling.targetTab);
                    } else {
                      setSelectedLog(log);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (onNavigate && styling.targetTab) {
                        onNavigate(styling.targetTab);
                      } else {
                        setSelectedLog(log);
                      }
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  title={styling.targetTab ? `Click to open in ${styling.targetTab.toUpperCase()}` : 'Click to inspect audit log details'}
                  className="py-3 first:pt-1 last:pb-1 group hover:bg-slate-50/90 dark:hover:bg-slate-800/60 hover:translate-x-1.5 hover:shadow-xs rounded-xl px-2 -mx-2 transition-all duration-200 cursor-pointer focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800/60"
                >
                  <div className="flex items-start gap-3">
                    {/* Event Icon with Badge Style */}
                    <div
                      className={`p-2 rounded-xl border shrink-0 mt-0.5 transition-all duration-200 group-hover:scale-115 group-hover:rotate-[-4deg] ${styling.iconBg}`}
                    >
                      <EventIcon className="w-3.5 h-3.5" />
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Top row: Action Badge, Entity, and Relative Time */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider shrink-0 transition-transform duration-200 group-hover:scale-105 ${styling.badgeBg}`}
                          >
                            {styling.badgeText}
                          </span>
                          {entityId && (
                            <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                              {entityId}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap shrink-0 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{getRelativeTime(log.timestamp)}</span>
                        </span>
                      </div>

                      {/* Summary Description */}
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {summaryText}
                      </p>

                      {/* Bottom Row: User Actor & Quick Navigate Link */}
                      <div className="flex items-center justify-between pt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="truncate">
                          by <strong className="font-semibold text-slate-700 dark:text-slate-300">{userName}</strong>
                        </span>

                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {onNavigate && styling.targetTab && (
                            <button
                              type="button"
                              onClick={(e) => handleNavigateToModule(styling.targetTab, e)}
                              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                              title={`Jump to ${styling.targetTab.toUpperCase()}`}
                            >
                              <span>View</span>
                              <ArrowUpRight className="w-2.5 h-2.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-600 dark:text-slate-400">
            Total Logged: <span className="font-bold font-mono text-slate-700 dark:text-slate-300">{logs.length}</span> events
          </div>

          {onNavigate ? (
            <button
              id="btn-footer-view-audit-trail"
              type="button"
              onClick={() => onNavigate('audit')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Audit Trail</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Quick Event Detail Modal */}
      {selectedLog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Audit Event Details
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {selectedLog.id || 'N/A'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Event Summary
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {selectedLog.summary}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Action</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {selectedLog.action}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Entity Type</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {selectedLog.entityType}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Target Entity ID</div>
                  <div className="font-mono font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    {(selectedLog as any).entityId || (selectedLog as any).targetId || 'N/A'}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Timestamp</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {new Date(selectedLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Executed By</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {(selectedLog as any).userName || (selectedLog as any).user || 'System'}
                  </div>
                </div>
                {selectedLog.userRole && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {selectedLog.userRole}
                  </span>
                )}
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Metadata Payload
                  </div>
                  <pre className="p-2.5 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[10px] overflow-x-auto max-h-28">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    const styling = getEventStyling(selectedLog);
                    setSelectedLog(null);
                    if (styling.targetTab) onNavigate(styling.targetTab);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Go to Module</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs rounded-xl shadow-xs cursor-pointer ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
