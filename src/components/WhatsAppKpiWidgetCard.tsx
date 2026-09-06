import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  TrendingUp,
  CreditCard,
  Clock,
  DollarSign,
  AlertTriangle,
  Users,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { KpiDigestService } from '../services/kpiDigestService';
import { storageService } from '../services/storageService';
import { DailyKpiSnapshot, WhatsAppTriggerConfig } from '../types';

interface WhatsAppKpiWidgetCardProps {
  onOpenFullModal: () => void;
}

export const WhatsAppKpiWidgetCard: React.FC<WhatsAppKpiWidgetCardProps> = ({
  onOpenFullModal
}) => {
  const [copied, setCopied] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const config: WhatsAppTriggerConfig = useMemo(() => {
    return storageService.getWhatsAppTriggerConfig();
  }, []);

  const snapshot: DailyKpiSnapshot = useMemo(() => {
    return KpiDigestService.calculateDailyKpiSnapshot();
  }, []);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(snapshot.formattedWhatsAppText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleQuickTriggerAll = () => {
    const activeRecipients = config.recipients.filter((r) => r.active);
    if (activeRecipients.length === 0) {
      onOpenFullModal();
      return;
    }

    setIsTriggering(true);
    activeRecipients.forEach((recip, idx) => {
      setTimeout(() => {
        KpiDigestService.triggerWhatsAppToRecipient(
          recip.phone,
          snapshot.formattedWhatsAppText,
          recip.name,
          {
            snapshotDate: snapshot.date,
            triggeredBy: storageService.getCurrentUser().name
          }
        );
        if (idx === 0) {
          const first = KpiDigestService.triggerWhatsAppToRecipient(
            recip.phone,
            snapshot.formattedWhatsAppText,
            recip.name
          );
          window.open(first.url, '_blank');
        }
      }, idx * 250);
    });

    storageService.saveDailyKpiSnapshot({
      ...snapshot,
      status: 'Sent',
      triggeredAt: new Date().toISOString(),
      triggeredBy: storageService.getCurrentUser().name,
      recipientsCount: activeRecipients.length
    });

    setTimeout(() => {
      setIsTriggering(false);
      setSuccessToast(`Dispatched WhatsApp KPI Digest to ${activeRecipients.length} executives!`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 600);
  };

  const activeRecipientsCount = config.recipients.filter((r) => r.active).length;

  return (
    <div
      id="whatsapp-kpi-digest-widget-card"
      className="bg-white rounded-2xl border border-emerald-200 shadow-md hover:shadow-lg transition-all overflow-hidden"
    >
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Previous Day Business KPIs — Auto-Generated WhatsApp Trigger
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Auto-Digest
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/80">
              Close of Day: <strong className="text-white">{snapshot.date}</strong> • Scheduled Daily at <strong className="text-white">{config.autoTriggerTime} IST</strong> ({activeRecipientsCount} Recipients)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold text-emerald-100 transition-colors flex items-center gap-1.5"
            title="Copy formatted WhatsApp text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>

          <button
            onClick={handleQuickTriggerAll}
            disabled={isTriggering}
            className="px-3.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isTriggering ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Trigger to WhatsApp ({activeRecipientsCount})
          </button>

          <button
            onClick={onOpenFullModal}
            className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Configure Schedule & Full Preview"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 flex items-center justify-between text-xs text-emerald-800 font-semibold">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-slate-600 font-normal">
            Dismiss
          </button>
        </div>
      )}

      {/* 6 Requested Metrics Grid */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5 bg-slate-50/50">
        {/* Metric 1: New Leads */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
            <span className="flex items-center gap-1 text-blue-700">
              <Users className="w-3.5 h-3.5" />
              1. New Leads
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
              {snapshot.newLeadsCount} Leads
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 truncate">
            {KpiDigestService.formatCurrency(snapshot.newLeadsValue)}
          </div>
          <div className="text-[10px] text-slate-500 truncate mt-1">
            Top: {snapshot.newLeadsList[0]?.companyName || 'Singhania Cloud'}
          </div>
        </div>

        {/* Metric 2: Total Collection */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
            <span className="flex items-center gap-1 text-emerald-700">
              <CreditCard className="w-3.5 h-3.5" />
              2. Total Collections
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
              {snapshot.collectionEfficiencyPct}% Eff.
            </span>
          </div>
          <div className="text-base font-extrabold text-emerald-700 truncate">
            {KpiDigestService.formatCurrency(snapshot.totalCollectionsReceived)}
          </div>
          <div className="text-[10px] text-slate-500 truncate mt-1">
            Billed: {KpiDigestService.formatCurrency(snapshot.totalInvoicesGenerated)}
          </div>
        </div>

        {/* Metric 3: Pending Aging Buckets */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
            <span className="flex items-center gap-1 text-amber-700">
              <Clock className="w-3.5 h-3.5" />
              3. Aging Buckets
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold">
              0-90+ Days
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 truncate">
            {KpiDigestService.formatCurrency(snapshot.agingBuckets.totalPendingAmount)}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-mono">
            <span className="text-emerald-600 font-bold">0-30d: {KpiDigestService.formatCurrency(snapshot.agingBuckets.bucket0to30.amount)}</span>
          </div>
        </div>

        {/* Metric 4: Total Payment Done */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
            <span className="flex items-center gap-1 text-purple-700">
              <DollarSign className="w-3.5 h-3.5" />
              4. Payments Done
            </span>
            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-bold">
              {snapshot.paymentsDisbursedCount} Outflows
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-900 truncate">
            {KpiDigestService.formatCurrency(snapshot.totalPaymentsDisbursed)}
          </div>
          <div className="text-[10px] text-slate-500 truncate mt-1">
            Vendor & PO Payouts
          </div>
        </div>

        {/* Metric 5: Net Revenue Generated */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
            <span className="flex items-center gap-1 text-indigo-700">
              <TrendingUp className="w-3.5 h-3.5" />
              5. Net Revenue
            </span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 text-[10px] font-bold">
              Won Bookings
            </span>
          </div>
          <div className="text-base font-extrabold text-indigo-900 truncate">
            {KpiDigestService.formatCurrency(snapshot.netRevenueGenerated)}
          </div>
          <div className="text-[10px] text-slate-500 truncate mt-1">
            Pipeline: {KpiDigestService.formatCurrency(snapshot.activePipelineValue)}
          </div>
        </div>

        {/* Metric 6: Delayed Projects with Reason */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-red-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold mb-1">
            <span className="flex items-center gap-1 text-red-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              6. Delayed Projects
            </span>
            <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
              {snapshot.delayedProjectsCount} Behind
            </span>
          </div>
          <div className="text-base font-extrabold text-red-700 truncate">
            {snapshot.delayedProjectsCount} Delayed
          </div>
          <div className="text-[10px] text-slate-500 truncate mt-1">
            {snapshot.delayedProjects[0] ? `PRJ-002: ${snapshot.delayedProjects[0].delayDays}d Overdue` : 'All on track'}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer with Delayed Reason Highlight */}
      <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="font-bold text-red-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Top Delay Reason:
          </span>
          <span className="text-slate-700 italic truncate max-w-md">
            "{snapshot.delayedProjects[0]?.delayReason || 'All projects are currently proceeding on-schedule.'}"
          </span>
        </div>

        <button
          onClick={onOpenFullModal}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
        >
          View Full WhatsApp Message & Edit Root Causes
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
