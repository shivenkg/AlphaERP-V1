import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  Calendar,
  Building2,
  CheckCircle2,
  RefreshCw,
  Send,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileText,
  IndianRupee,
  History,
  Phone
} from 'lucide-react';
import { AmcContract, ServiceEquipment } from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';

interface AmcExpirationWidgetProps {
  onNavigateToRenewals?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToAssetHistory?: (equipmentId: string) => void;
  onOpenRenewModal?: (contract: AmcContract) => void;
}

export const AmcExpirationWidget: React.FC<AmcExpirationWidgetProps> = ({
  onNavigateToRenewals,
  onNavigateToCalendar,
  onNavigateToAssetHistory,
  onOpenRenewModal
}) => {
  const [filterWindow, setFilterWindow] = useState<'30' | '60' | '90' | 'all'>('30');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [contracts, setContracts] = useState<AmcContract[]>(() => serviceStorage.getAmcContracts());
  const [sentNoticeCodes, setSentNoticeCodes] = useState<string[]>([]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const reloadData = () => {
    setContracts(serviceStorage.getAmcContracts());
  };

  // Calculate days remaining for each contract
  const contractStats = useMemo(() => {
    const today = Date.now();

    const categorized = contracts.map((c) => {
      const diffMs = new Date(c.endDate).getTime() - today;
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        contract: c,
        daysRemaining
      };
    });

    // Exclude already renewed contracts
    const activeContracts = categorized.filter((i) => i.contract.renewalStatus !== 'Renewed');

    const critical30 = activeContracts.filter((i) => i.daysRemaining <= 30 && i.daysRemaining >= -30);
    const urgent60 = activeContracts.filter((i) => i.daysRemaining > 30 && i.daysRemaining <= 60);
    const upcoming90 = activeContracts.filter((i) => i.daysRemaining > 60 && i.daysRemaining <= 90);
    const allWithin90 = activeContracts.filter((i) => i.daysRemaining <= 90);

    const totalArrAtRisk = allWithin90.reduce((acc, i) => acc + i.contract.annualValue, 0);

    return {
      critical30,
      urgent60,
      upcoming90,
      allWithin90,
      totalArrAtRisk
    };
  }, [contracts]);

  // Active list based on selected filter
  const displayedList = useMemo(() => {
    switch (filterWindow) {
      case '30':
        return contractStats.critical30;
      case '60':
        return contractStats.urgent60;
      case '90':
        return contractStats.upcoming90;
      case 'all':
      default:
        return contractStats.allWithin90;
    }
  }, [filterWindow, contractStats]);

  const handleSendQuickNotice = (contract: AmcContract) => {
    serviceStorage.sendRenewalNotice(contract.id, 'WhatsApp');
    serviceStorage.sendRenewalNotice(contract.id, 'Email');
    setSentNoticeCodes((prev) => [...prev, contract.contractCode]);
    setActionSuccessMsg(`Renewal proposal & SLA reminder dispatched to ${contract.customerName} via WhatsApp & Email`);
    reloadData();
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-50 dark:from-amber-950/40 dark:via-slate-900/60 dark:to-slate-900/90 border border-amber-300 dark:border-amber-800/60 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 transition-all">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                AMC Expiration Watchlist
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                {contractStats.allWithin90.length} Contracts At Risk (&le; 90 Days)
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Proactively safeguard annual service revenue and dispatch timely renewal proposals before plant coverage lapses.
            </p>
          </div>
        </div>

        {/* Quick ARR stat & minimize toggle */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              ARR Up for Renewal
            </div>
            <div className="text-base font-black text-amber-700 dark:text-amber-400">
              {formatCurrency(contractStats.totalArrAtRisk)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Widget' : 'Minimize Widget'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="space-y-4 pt-1">
          {/* 30 / 60 / 90 Days Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => setFilterWindow('30')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterWindow === '30'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>&le; 30 Days (Critical)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterWindow === '30' ? 'bg-white/20' : 'bg-red-100 dark:bg-red-900/60'}`}>
                {contractStats.critical30.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterWindow('60')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterWindow === '60'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>31 - 60 Days (Urgent)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterWindow === '60' ? 'bg-white/20' : 'bg-amber-100 dark:bg-amber-900/60'}`}>
                {contractStats.urgent60.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterWindow('90')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterWindow === '90'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>61 - 90 Days (Upcoming)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterWindow === '90' ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/60'}`}>
                {contractStats.upcoming90.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterWindow('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterWindow === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>View All (&le; 90 Days)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {contractStats.allWithin90.length}
              </span>
            </button>

            {onNavigateToRenewals && (
              <button
                type="button"
                onClick={onNavigateToRenewals}
                className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Renewal Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Cards / Table List */}
          {displayedList.length === 0 ? (
            <div className="p-8 text-center bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Contracts Expiring in this Range
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All client agreements in this window are renewed or in healthy active coverage.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedList.map(({ contract, daysRemaining }) => {
                const isNoticeSent = sentNoticeCodes.includes(contract.contractCode) || contract.renewalStatus === 'Proposal Sent';

                const urgencyColor =
                  daysRemaining <= 15
                    ? 'border-red-400 bg-red-50/50 dark:bg-red-950/30'
                    : daysRemaining <= 30
                    ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';

                const badgeStyle =
                  daysRemaining <= 0
                    ? 'bg-red-600 text-white font-black'
                    : daysRemaining <= 30
                    ? 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 font-black'
                    : daysRemaining <= 60
                    ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold'
                    : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold';

                return (
                  <div
                    key={contract.id}
                    className={`p-3.5 rounded-2xl border ${urgencyColor} shadow-xs space-y-3 flex flex-col justify-between transition-all hover:shadow-md`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] font-bold text-slate-500">
                            {contract.contractCode}
                          </span>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                            {contract.customerName}
                          </h4>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{contract.siteAddress}</span>
                          </div>
                        </div>

                        {/* Days Remaining Pill */}
                        <div className={`px-2 py-1 rounded-xl text-[10px] shrink-0 text-center ${badgeStyle}`}>
                          {daysRemaining <= 0 ? 'EXPIRED' : `${daysRemaining} Days Left`}
                        </div>
                      </div>

                      {/* Equipment Summary */}
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 mt-2.5 text-[11px] text-slate-700 dark:text-slate-300">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {contract.coveredEquipmentSummary}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span>{contract.contractType}</span>
                          <span>Expires: {contract.endDate}</span>
                        </div>
                      </div>

                      {/* Financial Value */}
                      <div className="flex items-center justify-between pt-2 text-xs">
                        <span className="text-[11px] text-slate-500">Annual Value</span>
                        <span className="font-black text-slate-900 dark:text-slate-100">
                          {formatCurrency(contract.annualValue)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendQuickNotice(contract)}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isNoticeSent
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200'
                        }`}
                        title="Send pre-filled proposal via WhatsApp/Email"
                      >
                        <Send className="w-3 h-3" />
                        <span>{isNoticeSent ? 'Notice Sent' : 'Send Notice'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {contract.equipmentIds && contract.equipmentIds.length > 0 && onNavigateToAssetHistory && (
                          <button
                            type="button"
                            onClick={() => onNavigateToAssetHistory(contract.equipmentIds[0])}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs transition-colors cursor-pointer"
                            title="View Asset Maintenance History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenRenewModal) {
                              onOpenRenewModal(contract);
                            } else if (onNavigateToRenewals) {
                              onNavigateToRenewals();
                            }
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Renew</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
