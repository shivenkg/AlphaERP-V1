import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Search,
  Plus,
  Send,
  MessageSquare,
  FileText,
  Building2,
  Calendar,
  X,
  Trash2,
  ArrowUpRight,
  TrendingUp,
  Mail,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  AmcContract,
  ServiceCustomer,
  ServiceEquipment,
  AmcContractType
} from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';

interface AmcRenewalViewProps {
  customers: ServiceCustomer[];
  equipments: ServiceEquipment[];
  onRefresh: () => void;
  onNavigateToCalendar?: () => void;
}

export const AmcRenewalView: React.FC<AmcRenewalViewProps> = ({
  customers,
  equipments,
  onRefresh,
  onNavigateToCalendar
}) => {
  const [contracts, setContracts] = useState<AmcContract[]>(() => serviceStorage.getAmcContracts());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Modals
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedContractForRenew, setSelectedContractForRenew] = useState<AmcContract | null>(null);
  const [renewEscalationPct, setRenewEscalationPct] = useState<number>(8); // 8% default
  const [renewCustomAmount, setRenewCustomAmount] = useState<number>(0);
  const [renewYears, setRenewYears] = useState<number>(1);
  const [renewAutoSchedule, setRenewAutoSchedule] = useState<boolean>(true);

  // Proposal Modal
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedContractForProposal, setSelectedContractForProposal] = useState<AmcContract | null>(null);

  // New Contract Modal
  const [isNewContractModalOpen, setIsNewContractModalOpen] = useState(false);
  const [newCustId, setNewCustId] = useState('');
  const [newContractCode, setNewContractCode] = useState('');
  const [newType, setNewType] = useState<AmcContractType>('Comprehensive AMC');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEndDate, setNewEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [newAnnualValue, setNewAnnualValue] = useState<number>(350000);
  const [newEquipSummary, setNewEquipSummary] = useState('');
  const [newPaymentTerms, setNewPaymentTerms] = useState<'Annual Advance' | 'Quarterly Advance' | 'Half-Yearly'>('Quarterly Advance');

  const reloadContracts = () => {
    setContracts(serviceStorage.getAmcContracts());
    onRefresh();
  };

  // Helper to calculate days until expiry
  const getDaysUntilExpiry = (endDateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);
    const diffMs = end.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // KPI calculations
  const today = new Date();
  const expiringSoonCount = contracts.filter((c) => {
    const days = getDaysUntilExpiry(c.endDate);
    return days >= 0 && days <= 30 && c.renewalStatus !== 'Renewed';
  }).length;

  const lapsedCount = contracts.filter((c) => {
    const days = getDaysUntilExpiry(c.endDate);
    return days < 0 && c.renewalStatus !== 'Renewed';
  }).length;

  const totalPortfolioValue = contracts.reduce((acc, c) => acc + c.annualValue, 0);
  const atRiskValue = contracts
    .filter((c) => {
      const days = getDaysUntilExpiry(c.endDate);
      return days <= 60 && c.renewalStatus !== 'Renewed';
    })
    .reduce((acc, c) => acc + c.annualValue, 0);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchSearch =
        searchTerm === '' ||
        c.contractCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.coveredEquipmentSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.siteAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const days = getDaysUntilExpiry(c.endDate);

      let matchStatus = true;
      if (statusFilter === 'ExpiringSoon') {
        matchStatus = days >= 0 && days <= 30 && c.renewalStatus !== 'Renewed';
      } else if (statusFilter === 'Expiring60') {
        matchStatus = days > 30 && days <= 60 && c.renewalStatus !== 'Renewed';
      } else if (statusFilter === 'Expired') {
        matchStatus = days < 0 && c.renewalStatus !== 'Renewed';
      } else if (statusFilter === 'Active') {
        matchStatus = days > 60 || c.renewalStatus === 'Renewed';
      }

      const matchType = typeFilter === 'All' || c.contractType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [contracts, searchTerm, statusFilter, typeFilter]);

  // Open Renew Modal
  const handleOpenRenewModal = (contract: AmcContract) => {
    setSelectedContractForRenew(contract);
    const escalated = Math.round(contract.annualValue * 1.08);
    setRenewCustomAmount(escalated);
    setRenewEscalationPct(8);
    setRenewYears(1);
    setRenewAutoSchedule(true);
    setIsRenewModalOpen(true);
  };

  // Submit Contract Renewal
  const handleConfirmRenew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractForRenew) return;

    serviceStorage.renewAmcContract(
      selectedContractForRenew.id,
      renewCustomAmount,
      renewYears,
      renewAutoSchedule
    );

    reloadContracts();
    setIsRenewModalOpen(false);
    setSelectedContractForRenew(null);
  };

  // Open Proposal Modal
  const handleOpenProposal = (contract: AmcContract) => {
    setSelectedContractForProposal(contract);
    setIsProposalModalOpen(true);
  };

  // Dispatch Reminder
  const handleSendNotice = (channel: 'WhatsApp' | 'Email') => {
    if (!selectedContractForProposal) return;
    serviceStorage.sendRenewalNotice(selectedContractForProposal.id, channel);
    reloadContracts();
    setIsProposalModalOpen(false);
  };

  // Create New AMC Contract
  const handleCreateNewContract = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newCustId);
    if (!cust) {
      alert('Please select a customer.');
      return;
    }

    const code = newContractCode || `AMC-${new Date().getFullYear()}-${cust.name.slice(0, 4).toUpperCase()}-${String(contracts.length + 1).padStart(2, '0')}`;

    const newContract: AmcContract = {
      id: `amc-c-${Date.now()}`,
      contractCode: code,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerEmail: cust.email,
      siteAddress: cust.address,
      coveredEquipmentSummary: newEquipSummary || '4x VRV Outdoor Units + AHUs',
      equipmentIds: [],
      contractType: newType,
      startDate: newStartDate,
      endDate: newEndDate,
      annualValue: Number(newAnnualValue),
      renewalProposedValue: Math.round(Number(newAnnualValue) * 1.08),
      paymentTerms: newPaymentTerms,
      visitsPerYear: newType === 'Comprehensive AMC' ? 4 : 4,
      visitsCompleted: 0,
      status: 'Active',
      renewalStatus: 'Active',
      notes: 'New enterprise AMC contract registered.',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    serviceStorage.saveAmcContract(newContract);
    reloadContracts();
    setIsNewContractModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Expiring &le; 30 Days
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-2">{expiringSoonCount}</div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">Actionable renewal notices</div>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">
              Lapsed / Expired
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-700 dark:text-red-300 mt-2">{lapsedCount}</div>
          <div className="text-[11px] text-red-600/80 mt-0.5">Needs win-back / retention</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Annual AMC ARR</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ₹{(totalPortfolioValue / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{contracts.length} active AMC accounts</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue at Risk</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
            ₹{(atRiskValue / 100000).toFixed(1)}L
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Expiring within 60 days</div>
        </div>
      </div>

      {/* Control Header & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-500" />
              AMC Contract Renewal & SLA Agreements
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Annual maintenance contract expiry tracking, automated price escalation, and renewal quote dispatching.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToCalendar && (
              <button
                onClick={onNavigateToCalendar}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>AMC Calendar</span>
              </button>
            )}

            <button
              onClick={() => setIsNewContractModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New AMC Contract</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search contract, client, equipment, site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="All">All Expiry Windows</option>
              <option value="ExpiringSoon">Critical: Expiring in &le; 30 Days</option>
              <option value="Expiring60">Upcoming: Expiring in 31 - 60 Days</option>
              <option value="Expired">Lapsed / Expired</option>
              <option value="Active">Healthy Active Contracts</option>
            </select>
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="All">All AMC Types</option>
              <option value="Comprehensive AMC">Comprehensive AMC (Parts + Labor)</option>
              <option value="Non-Comprehensive AMC">Non-Comprehensive AMC (Labor Only)</option>
              <option value="Labor Only">Labor Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="space-y-3">
        {filteredContracts.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No AMC Contracts Found</div>
            <p className="text-xs text-slate-500 mt-1">Try changing the filter parameters or register a new contract.</p>
          </div>
        ) : (
          filteredContracts.map((contract) => {
            const daysLeft = getDaysUntilExpiry(contract.endDate);
            const isCritical = daysLeft >= 0 && daysLeft <= 30 && contract.renewalStatus !== 'Renewed';
            const isExpired = daysLeft < 0 && contract.renewalStatus !== 'Renewed';
            const isRenewed = contract.renewalStatus === 'Renewed';

            return (
              <div
                key={contract.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                  isCritical
                    ? 'border-amber-300 dark:border-amber-800/80 shadow-xs ring-1 ring-amber-200 dark:ring-amber-900/30'
                    : isExpired
                    ? 'border-red-300 dark:border-red-900/60 shadow-xs ring-1 ring-red-200 dark:ring-red-900/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                      {contract.contractCode}
                    </span>

                    {/* Expiry Pill */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isRenewed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : isCritical
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                          : isExpired
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {isRenewed ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : isCritical ? (
                        <Clock className="w-3 h-3 text-amber-600" />
                      ) : isExpired ? (
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                      ) : (
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                      )}

                      {isRenewed
                        ? 'Renewed & Active'
                        : isExpired
                        ? `Expired ${Math.abs(daysLeft)}d ago`
                        : isCritical
                        ? `Expires in ${daysLeft} days`
                        : `Valid for ${daysLeft} days`}
                    </span>

                    {/* Contract Type */}
                    <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                      {contract.contractType}
                    </span>

                    {/* Proposal Status Tag */}
                    {contract.renewalStatus === 'Proposal Sent' && (
                      <span className="text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                        Proposal Sent ({contract.lastReminderDate})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Contract Value</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        ₹{contract.annualValue.toLocaleString('en-IN')}/yr
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 text-xs">
                  {/* Customer Info */}
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{contract.customerName}</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{contract.siteAddress}</p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        {contract.customerPhone}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                      <span className="text-[11px] text-slate-500 truncate">{contract.customerEmail}</span>
                    </div>
                  </div>

                  {/* Covered Equipments & Term */}
                  <div className="space-y-1 md:border-l md:border-slate-100 dark:md:border-slate-800 md:pl-4">
                    <div className="text-slate-500 font-semibold text-[11px]">Covered HVAC Units:</div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {contract.coveredEquipmentSummary}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>Term: {contract.startDate} to {contract.endDate}</span>
                      <span>&bull;</span>
                      <span>{contract.visitsPerYear} Visits/Yr</span>
                    </div>
                  </div>

                  {/* Proposed Renewal & Action Buttons */}
                  <div className="space-y-2 md:border-l md:border-slate-100 dark:md:border-slate-800 md:pl-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Proposed Renewal:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{contract.renewalProposedValue.toLocaleString('en-IN')} (+8%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-0.5">
                        <span className="text-slate-500">Payment Terms:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{contract.paymentTerms}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleOpenProposal(contract)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Send Renewal Notice via WhatsApp or Email"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-600" />
                        <span>Send Proposal</span>
                      </button>

                      <button
                        onClick={() => handleOpenRenewModal(contract)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Renew Contract</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete AMC Contract ${contract.contractCode}?`)) {
                            serviceStorage.deleteAmcContract(contract.id);
                            reloadContracts();
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Contract"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: Renew Contract */}
      {isRenewModalOpen && selectedContractForRenew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Renew AMC Contract</h3>
                  <p className="text-xs text-slate-500">{selectedContractForRenew.contractCode}</p>
                </div>
              </div>
              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Client:</span>
                <span>{selectedContractForRenew.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Current Annual Fee:</span>
                <span className="font-semibold">₹{selectedContractForRenew.annualValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Current Expiry:</span>
                <span>{selectedContractForRenew.endDate}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmRenew} className="space-y-4 text-xs">
              {/* Term Extension */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Extension Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setRenewYears(yr)}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        renewYears === yr
                          ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {yr} Year{yr > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Escalation Quick Buttons */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Annual Escalation Rate
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 8, 10].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setRenewEscalationPct(pct);
                        setRenewCustomAmount(Math.round(selectedContractForRenew.annualValue * (1 + pct / 100)));
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        renewEscalationPct === pct
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {pct === 0 ? 'Same' : `+${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Renewed Annual Fee (₹) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Renewed Annual Value (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    value={renewCustomAmount}
                    onChange={(e) => setRenewCustomAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Auto Schedule Checkbox */}
              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={renewAutoSchedule}
                  onChange={(e) => setRenewAutoSchedule(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Automatically schedule 4 quarterly preventive maintenance visits into the AMC Calendar for the new renewal year.
                </span>
              </label>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Contract Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Send Proposal / Reminder Preview */}
      {isProposalModalOpen && selectedContractForProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Dispatch Renewal Proposal</h3>
                  <p className="text-xs text-slate-500">{selectedContractForProposal.customerName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsProposalModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proposal Message Preview */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2 font-mono text-slate-700 dark:text-slate-200 leading-relaxed">
              <div className="font-bold text-slate-900 dark:text-white">
                Dear {selectedContractForProposal.customerName},
              </div>
              <div>
                Re: Annual Maintenance Contract Renewal Notice ({selectedContractForProposal.contractCode})
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Your current HVAC Maintenance Agreement for ({selectedContractForProposal.coveredEquipmentSummary}) expires on{' '}
                <span className="font-bold underline">{selectedContractForProposal.endDate}</span>.
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                Renewal Annual Proposal Value: <span className="font-bold text-emerald-600">₹{selectedContractForProposal.renewalProposedValue.toLocaleString('en-IN')}</span> + 18% GST (Includes 4 quarterly comprehensive visits + 2hr breakdown SLA).
              </div>
              <div className="text-[11px] text-slate-500">
                Regards,
                <br />
                AlphaERP HVAC Service Operations Team
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
              <span className="text-[11px] text-slate-400">
                Target: {selectedContractForProposal.customerPhone}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={`https://wa.me/${selectedContractForProposal.customerPhone.replace(/[^0-9]/g, '')}?text=Dear%20${encodeURIComponent(selectedContractForProposal.customerName)},%20Your%20HVAC%20AMC%20contract%20${selectedContractForProposal.contractCode}%20expires%20on%20${selectedContractForProposal.endDate}.%20Renewal%20Proposed%20Fee:%20INR%20${selectedContractForProposal.renewalProposedValue.toLocaleString('en-IN')}%20%2B%20GST.%20Please%20confirm%20to%20extend%20coverage.`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => handleSendNotice('WhatsApp')}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </a>

                <a
                  href={`mailto:${selectedContractForProposal.customerEmail}?subject=HVAC%20AMC%20Renewal%20Quotation%20-%20${selectedContractForProposal.contractCode}&body=Dear%20${encodeURIComponent(selectedContractForProposal.customerName)},%0A%0APlease%20find%20attached%20our%20renewal%20proposal%20for%20HVAC%20AMC%20contract%20${selectedContractForProposal.contractCode}.%0ACoverage%20Expiry:%20${selectedContractForProposal.endDate}%0AAnnual%20Renewal%20Fee:%20INR%20${selectedContractForProposal.renewalProposedValue}%20%2B%2018%25%20GST.%0A%0ARegards,%0AAlphaERP%20Service`}
                  onClick={() => handleSendNotice('Email')}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Notice</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Create New AMC Contract */}
      {isNewContractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Register New AMC Contract</h3>
                  <p className="text-xs text-slate-500">Create maintenance agreement with SLA terms</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewContractModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewContract} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer / Facility <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={newCustId}
                  onChange={(e) => setNewCustId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">Select Customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contract Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AMC-2026-CLIENT-01"
                    value={newContractCode}
                    onChange={(e) => setNewContractCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contract Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as AmcContractType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Comprehensive AMC">Comprehensive (Parts + Labor)</option>
                    <option value="Non-Comprehensive AMC">Non-Comprehensive (Labor Only)</option>
                    <option value="Labor Only">Labor Only (Inspection Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Covered HVAC Units Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4x Daikin VRV 20HP + 2x AHUs + 1x Cooling Tower"
                  value={newEquipSummary}
                  onChange={(e) => setNewEquipSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Annual Fee (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newAnnualValue}
                    onChange={(e) => setNewAnnualValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-black focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Terms</label>
                  <select
                    value={newPaymentTerms}
                    onChange={(e) => setNewPaymentTerms(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Quarterly Advance">Quarterly Advance</option>
                    <option value="Annual Advance">Annual Advance</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewContractModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Save AMC Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
