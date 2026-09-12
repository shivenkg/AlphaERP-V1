import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Send,
  Star,
  Activity,
  Layers,
  CheckSquare,
  Square,
  SlidersHorizontal,
  ArrowUpRight
} from 'lucide-react';
import {
  AmcContract,
  PpmScheduleVisit,
  BreakdownTicket,
  UserRole
} from '../types';
import { storageService } from '../services/storageService';
import { checkAmcRenewalAlerts, notifyAmcRenewals, AmcRenewalAlertItem } from '../services/amcRenewalNotificationService';
import { validateMobile, formatMobileInput, validateAppointmentDate, getTodayDateString, getMaxAppointmentDateString } from '../utils/validation';

interface ServiceScheduleViewProps {
  amcContracts?: AmcContract[];
  ppmVisits?: PpmScheduleVisit[];
  breakdownTickets?: BreakdownTicket[];
  clients?: any[];
  projects?: any[];
  inventory?: any[];
  currentRole?: UserRole;
  onNavigateToAmc?: () => void;
  onNavigateToAMC?: () => void;
  onOpenSheetsModal?: () => void;
}

export const ServiceScheduleView: React.FC<ServiceScheduleViewProps> = ({
  amcContracts: initialContracts,
  ppmVisits: initialPpmVisits,
  breakdownTickets: initialBreakdowns,
  currentRole,
  onNavigateToAmc,
  onOpenSheetsModal
}) => {
  const [ppmVisits, setPpmVisits] = useState<PpmScheduleVisit[]>(() => initialPpmVisits || storageService.getPpmVisits());
  const [breakdownTickets, setBreakdownTickets] = useState<BreakdownTicket[]>(() => initialBreakdowns || storageService.getBreakdownTickets());
  const [amcContracts, setAmcContracts] = useState<AmcContract[]>(() => initialContracts || storageService.getAmcContracts());

  const [activeSubTab, setActiveSubTab] = useState<'ppm_schedule' | 'technicians' | 'breakdowns' | 'history' | 'renewals'>('ppm_schedule');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTechnician, setFilterTechnician] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | '7_DAYS' | '30_DAYS' | 'THIS_MONTH'>('30_DAYS');

  // Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [selectedVisitForChecklist, setSelectedVisitForChecklist] = useState<PpmScheduleVisit | null>(null);

  // Form States - Schedule PPM
  const [selectedContractId, setSelectedContractId] = useState(amcContracts[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState(getTodayDateString());
  const [assignedTechnician, setAssignedTechnician] = useState('Imran Khan');
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Form States - Breakdown Ticket
  const [breakdownContractId, setBreakdownContractId] = useState(amcContracts[0]?.id || '');
  const [breakdownClientName, setBreakdownClientName] = useState(amcContracts[0]?.clientName || '');
  const [breakdownAddress, setBreakdownAddress] = useState(amcContracts[0]?.siteAddress || '');
  const [breakdownPhone, setBreakdownPhone] = useState('+91 ');
  const [breakdownIssue, setBreakdownIssue] = useState('');
  const [breakdownSystem, setBreakdownSystem] = useState('VRV / VRF Systems');
  const [breakdownPriority, setBreakdownPriority] = useState<BreakdownTicket['priority']>('Critical 24x7');
  const [breakdownTechnician, setBreakdownTechnician] = useState('Dinesh Sawant');
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  // Renewal Alert state
  const [isSendingRenewalAlert, setIsSendingRenewalAlert] = useState(false);
  const [renewalAlertResult, setRenewalAlertResult] = useState<string | null>(null);

  // List of HVAC Field Technicians & Service Operations Team
  const techniciansList = [
    { name: 'Vikram Sundaram', role: 'Senior HVAC Field Service Engineer', phone: '+91 99014 44521', rating: 4.95, activeSites: 5 },
    { name: 'Rajesh Varma', role: 'Service Operations Manager & AMC Head', phone: '+91 98201 55678', rating: 5.0, activeSites: 8 },
    { name: 'Imran Khan', role: 'Lead HVAC Specialist', phone: '+91 98201 44556', rating: 4.9, activeSites: 4 },
    { name: 'Dinesh Sawant', role: 'Senior Field Engineer', phone: '+91 98112 33490', rating: 4.8, activeSites: 3 },
    { name: 'Suresh More', role: 'Chiller & VRV Technician', phone: '+91 98765 11223', rating: 4.7, activeSites: 2 },
    { name: 'Rahul Patil', role: 'Ducting & Controls Specialist', phone: '+91 98334 55667', rating: 4.9, activeSites: 3 }
  ];

  const handleRefresh = () => {
    setPpmVisits(storageService.getPpmVisits());
    setBreakdownTickets(storageService.getBreakdownTickets());
    setAmcContracts(storageService.getAmcContracts());
  };

  // Filtered PPM Visits
  const filteredPpmVisits = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return ppmVisits.filter((v) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        v.visitNumber.toLowerCase().includes(q) ||
        v.clientName.toLowerCase().includes(q) ||
        v.contractNumber.toLowerCase().includes(q) ||
        v.assignedTechnician.toLowerCase().includes(q) ||
        v.siteAddress.toLowerCase().includes(q);

      const matchesTech = filterTechnician === 'ALL' || v.assignedTechnician.includes(filterTechnician);
      const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;

      // Date range filter
      let matchesDate = true;
      if (dateRangeFilter !== 'ALL' && v.scheduledDate) {
        const visitDate = new Date(v.scheduledDate);
        visitDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((visitDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (dateRangeFilter === '7_DAYS') {
          matchesDate = diffDays >= 0 && diffDays <= 7;
        } else if (dateRangeFilter === '30_DAYS') {
          matchesDate = diffDays >= -7 && diffDays <= 30;
        } else if (dateRangeFilter === 'THIS_MONTH') {
          matchesDate = visitDate.getMonth() === today.getMonth() && visitDate.getFullYear() === today.getFullYear();
        }
      }

      return matchesSearch && matchesTech && matchesStatus && matchesDate;
    });
  }, [ppmVisits, searchTerm, filterTechnician, filterStatus, dateRangeFilter]);

  // Renewal Summary
  const renewalStatus = useMemo(() => {
    return checkAmcRenewalAlerts(false);
  }, [amcContracts]);

  // Handlers
  const handleOpenScheduleModal = () => {
    setScheduleError(null);
    setSelectedContractId(amcContracts[0]?.id || '');
    setScheduledDate(getTodayDateString());
    setAssignedTechnician('Imran Khan');
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedulePPM = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError(null);

    const contract = amcContracts.find((c) => c.id === selectedContractId);
    if (!contract) {
      setScheduleError('Please select a valid AMC contract.');
      return;
    }

    const dateCheck = validateAppointmentDate(scheduledDate, 3);
    if (!dateCheck.isValid) {
      setScheduleError(dateCheck.error || 'Invalid scheduled date.');
      return;
    }

    try {
      storageService.addPpmVisit({
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        clientName: contract.clientName,
        siteAddress: contract.siteAddress,
        scheduledDate,
        assignedTechnician,
        quarter: `Q${Math.floor(new Date(scheduledDate).getMonth() / 3) + 1} 2026`,
        status: 'Scheduled',
        checklistSummary: [
          { task: 'Clean / replace primary & secondary air filters', done: false },
          { task: 'Inspect electrical terminals & measure compressor amp draw', done: false },
          { task: 'Check suction & discharge refrigerant pressures (R410A / R32)', done: false },
          { task: 'Chemical wash outdoor condenser coils & clear drain choke', done: false }
        ]
      });

      handleRefresh();
      setIsScheduleModalOpen(false);
    } catch (err: any) {
      setScheduleError(err.message || 'Error scheduling PPM visit.');
    }
  };

  const handleOpenBreakdownModal = () => {
    setBreakdownError(null);
    const contract = amcContracts[0];
    setBreakdownContractId(contract?.id || '');
    setBreakdownClientName(contract?.clientName || '');
    setBreakdownAddress(contract?.siteAddress || '');
    setBreakdownPhone(contract?.contactPhone || '+91 ');
    setBreakdownIssue('');
    setBreakdownSystem('VRV / VRF Systems');
    setBreakdownPriority('Critical 24x7');
    setBreakdownTechnician('Dinesh Sawant');
    setIsBreakdownModalOpen(true);
  };

  const handleSaveBreakdown = (e: React.FormEvent) => {
    e.preventDefault();
    setBreakdownError(null);

    if (!breakdownIssue.trim()) {
      setBreakdownError('Please describe the reported HVAC breakdown issue.');
      return;
    }

    const phoneCheck = validateMobile(breakdownPhone);
    if (!phoneCheck.isValid) {
      setBreakdownError(phoneCheck.error || 'Invalid contact phone number.');
      return;
    }

    const contract = amcContracts.find((c) => c.id === breakdownContractId);

    try {
      storageService.addBreakdownTicket({
        contractId: contract?.id || 'amc-direct',
        contractNumber: contract?.contractNumber || 'AMC-DIRECT',
        clientName: breakdownClientName || contract?.clientName || 'Commercial Client',
        siteAddress: breakdownAddress || contract?.siteAddress || 'Site Location',
        contactPhone: breakdownPhone.trim(),
        reportedIssue: breakdownIssue.trim(),
        systemType: breakdownSystem,
        priority: breakdownPriority,
        status: 'Open',
        assignedTechnician: breakdownTechnician,
        billableAmount: 0
      });

      handleRefresh();
      setIsBreakdownModalOpen(false);
    } catch (err: any) {
      setBreakdownError(err.message || 'Error registering breakdown ticket.');
    }
  };

  const handleOpenChecklist = (visit: PpmScheduleVisit) => {
    setSelectedVisitForChecklist(JSON.parse(JSON.stringify(visit)));
    setIsChecklistModalOpen(true);
  };

  const handleToggleChecklistItem = (index: number) => {
    if (!selectedVisitForChecklist) return;
    const updated = { ...selectedVisitForChecklist };
    updated.checklistSummary[index].done = !updated.checklistSummary[index].done;
    setSelectedVisitForChecklist(updated);
  };

  const handleSaveChecklist = () => {
    if (!selectedVisitForChecklist) return;

    const allDone = selectedVisitForChecklist.checklistSummary.every((t) => t.done);
    const newStatus = allDone ? 'Completed' : 'In Progress';

    storageService.updatePpmVisit(selectedVisitForChecklist.id, {
      checklistSummary: selectedVisitForChecklist.checklistSummary,
      status: newStatus,
      completedDate: allDone ? new Date().toISOString().split('T')[0] : selectedVisitForChecklist.completedDate,
      customerRating: selectedVisitForChecklist.customerRating || 5,
      technicianRemarks: selectedVisitForChecklist.technicianRemarks || 'Quarterly PPM inspection executed per OEM checklist.'
    });

    handleRefresh();
    setIsChecklistModalOpen(false);
  };

  const handleTriggerRenewalAlertEmail = async () => {
    setIsSendingRenewalAlert(true);
    setRenewalAlertResult(null);
    try {
      const res = await notifyAmcRenewals({ forceSend: true });
      if (res.success) {
        setRenewalAlertResult(`✓ Renewal alert email sent (${res.contractCount} contracts, Mode: ${res.mode.toUpperCase()})`);
      } else {
        setRenewalAlertResult(`Note: ${res.subject}`);
      }
    } catch (err: any) {
      setRenewalAlertResult(`Alert notice: ${err.message || 'Verification recorded'}`);
    } finally {
      setIsSendingRenewalAlert(false);
    }
  };

  const scheduledCount = ppmVisits.filter((v) => v.status === 'Scheduled').length;
  const inProgressCount = ppmVisits.filter((v) => v.status === 'In Progress').length;
  const completedCount = ppmVisits.filter((v) => v.status === 'Completed').length;
  const openBreakdownCount = breakdownTickets.filter((t) => t.status === 'Open' || t.status === 'Work In Progress').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                HVAC Service & PPM Schedule Hub
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                  Field Dispatch Active
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage Planned Preventive Maintenance (PPM), field technician site assignments, and emergency breakdown tickets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {renewalStatus.hasExpiringContracts && (
            <button
              onClick={handleTriggerRenewalAlertEmail}
              disabled={isSendingRenewalAlert}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Dispatch 30-day AMC renewal notification emails to management"
            >
              <Send className={`w-3.5 h-3.5 ${isSendingRenewalAlert ? 'animate-spin' : ''}`} />
              <span>{isSendingRenewalAlert ? 'Sending...' : `Send 30d Renewal Alerts (${renewalStatus.expiringContracts.length})`}</span>
            </button>
          )}

          <button
            onClick={handleOpenBreakdownModal}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Log Breakdown Ticket</span>
          </button>

          <button
            onClick={handleOpenScheduleModal}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule PPM Visit</span>
          </button>
        </div>
      </div>

      {renewalAlertResult && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <span>{renewalAlertResult}</span>
          <button onClick={() => setRenewalAlertResult(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Visits</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{scheduledCount}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">Next 30 Days Queue</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress On-Site</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{inProgressCount}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Technicians at Site</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Visits</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{completedCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">100% Sign-off Rate</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Breakdowns</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{openBreakdownCount}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">2-Hr SLA Guarantee</div>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold w-fit">
        <button
          onClick={() => setActiveSubTab('ppm_schedule')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeSubTab === 'ppm_schedule'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>PPM Visit Schedule ({ppmVisits.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('technicians')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeSubTab === 'technicians'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Technicians Workload ({techniciansList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('breakdowns')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeSubTab === 'breakdowns'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>24x7 Breakdown Queue ({breakdownTickets.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('renewals')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeSubTab === 'renewals'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>30-Day AMC Renewals ({renewalStatus.expiringContracts.length})</span>
        </button>
      </div>

      {/* TAB 1: PPM SCHEDULE & CALENDAR TABLE */}
      {activeSubTab === 'ppm_schedule' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search visit #, client, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={filterTechnician}
                onChange={(e) => setFilterTechnician(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Technicians</option>
                {techniciansList.map((t) => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="ALL">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value as any)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <option value="7_DAYS">Next 7 Days</option>
                <option value="30_DAYS">Next 30 Days</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="ALL">All Dates</option>
              </select>
            </div>
          </div>

          {/* Visits Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Visit #</th>
                  <th className="py-3 px-4">Client & Site Location</th>
                  <th className="py-3 px-4">AMC Contract</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Assigned Technician</th>
                  <th className="py-3 px-4">Checklist Progress</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPpmVisits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No PPM maintenance visits match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredPpmVisits.map((v) => {
                    const doneTasks = v.checklistSummary.filter((t) => t.done).length;
                    const totalTasks = v.checklistSummary.length;

                    return (
                      <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {v.visitNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{v.clientName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-xs">{v.siteAddress}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                          {v.contractNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{v.scheduledDate}</div>
                          {v.completedDate && (
                            <div className="text-[10px] text-emerald-600">Done: {v.completedDate}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{v.assignedTechnician}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                              {doneTasks}/{totalTasks}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {v.status === 'Completed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Completed
                            </span>
                          ) : v.status === 'In Progress' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Activity className="w-3 h-3 text-amber-600 animate-pulse" />
                              In Progress
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              <Clock className="w-3 h-3 text-blue-600" />
                              Scheduled
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenChecklist(v)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-700 dark:text-slate-300 hover:text-blue-700 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            Checklist & Signoff
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TECHNICIAN WORKLOAD MATRIX */}
      {activeSubTab === 'technicians' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {techniciansList.map((tech) => {
            const assignedVisits = ppmVisits.filter((v) => v.assignedTechnician.includes(tech.name));
            const completed = assignedVisits.filter((v) => v.status === 'Completed').length;
            const pending = assignedVisits.filter((v) => v.status !== 'Completed').length;

            return (
              <div
                key={tech.name}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-base border border-indigo-200 dark:border-indigo-800">
                    {tech.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{tech.name}</h3>
                    <div className="text-xs text-slate-500">{tech.role}</div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold mt-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{tech.rating} / 5.0 Rating</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span>Active Sites:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{tech.activeSites} Corporate Sites</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pending Visits:</span>
                    <strong className="text-blue-600">{pending} Scheduled</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completed Visits:</span>
                    <strong className="text-emerald-600">{completed} Done</strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Direct Phone:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{tech.phone}</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setFilterTechnician(tech.name);
                      setActiveSubTab('ppm_schedule');
                    }}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Scheduled Queue</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: 24x7 BREAKDOWN EMERGENCY QUEUE */}
      {activeSubTab === 'breakdowns' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Emergency Breakdown Dispatch Queue
              </h3>
              <p className="text-xs text-slate-500">24x7 Critical Service Level Agreement (SLA) tickets</p>
            </div>
            <button
              onClick={handleOpenBreakdownModal}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Ticket</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {breakdownTickets.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No active breakdown tickets reported.</div>
            ) : (
              breakdownTickets.map((t) => (
                <div key={t.id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">{t.ticketNumber}</span>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{t.clientName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        {t.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {t.systemType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {t.reportedIssue}
                    </p>

                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>Site: {t.siteAddress}</span>
                      <span>•</span>
                      <span>Assigned: <strong className="text-slate-700 dark:text-slate-300">{t.assignedTechnician}</strong></span>
                      <span>•</span>
                      <span>Contact: {t.contactPhone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {t.status}
                      </div>
                      {t.billableAmount > 0 && (
                        <div className="text-[11px] text-purple-600 font-bold">₹{t.billableAmount.toLocaleString()} Billable</div>
                      )}
                    </div>

                    {t.status !== 'Resolved' && (
                      <button
                        onClick={() => {
                          storageService.updateBreakdownTicket(t.id, {
                            status: 'Resolved',
                            resolvedAt: new Date().toISOString(),
                            resolutionNotes: 'Technician reached site and resolved breakdown issue.'
                          });
                          handleRefresh();
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: 30-DAY AMC RENEWALS */}
      {activeSubTab === 'renewals' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Contracts Expiring in &le; 30 Days
              </h3>
              <p className="text-xs text-slate-500">Automated background checks flag upcoming renewals for key account managers</p>
            </div>
            <button
              onClick={handleTriggerRenewalAlertEmail}
              disabled={isSendingRenewalAlert}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingRenewalAlert ? 'Dispatching...' : 'Dispatch Email Alerts'}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {renewalStatus.expiringContracts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                All active AMC contracts are healthy with renewal dates &gt; 30 days ahead.
              </div>
            ) : (
              renewalStatus.expiringContracts.map((c) => (
                <div key={c.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-amber-50/30 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{c.contractNumber}</span>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{c.clientName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {c.planType}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        {c.daysRemaining <= 0 ? 'EXPIRED' : `${c.daysRemaining} Days Left`}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Site: {c.siteAddress} • Contact: <strong>{c.contactPerson} ({c.contactPhone})</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Covered Equipment: {c.equipmentSummary}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      ACV: ₹{c.annualContractValue.toLocaleString()} / Yr
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Expiry Date: {c.endDate}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE NEW PPM VISIT */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Schedule PPM Visit</h2>
                  <p className="text-xs text-slate-500">Plan Preventive Maintenance visit against AMC contract</p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedulePPM} className="p-6 space-y-4">
              {scheduleError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{scheduleError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select AMC Contract *
                </label>
                <select
                  value={selectedContractId}
                  onChange={(e) => setSelectedContractId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {amcContracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} — {c.clientName} ({c.planType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Scheduled Date *
                  </label>
                  <input
                    type="date"
                    min={getTodayDateString()}
                    max={getMaxAppointmentDateString(3)}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Assigned Lead Technician *
                  </label>
                  <select
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {techniciansList.map((t) => (
                      <option key={t.name} value={t.name}>{t.name} ({t.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-800 dark:text-slate-200">Included 4-Point Inspection Checklist:</div>
                <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                  <li>Air filters cleaning & static pressure verification</li>
                  <li>Compressor electrical amp draw & contactors test</li>
                  <li>Refrigerant operating pressure & leak check</li>
                  <li>Condenser coil chemical wash & drain clear</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG EMERGENCY BREAKDOWN TICKET */}
      {isBreakdownModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Log 24x7 Breakdown Ticket</h2>
                  <p className="text-xs text-slate-500">Dispatch immediate field engineering response</p>
                </div>
              </div>
              <button
                onClick={() => setIsBreakdownModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBreakdown} className="p-6 space-y-4">
              {breakdownError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{breakdownError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select Associated AMC Contract
                </label>
                <select
                  value={breakdownContractId}
                  onChange={(e) => {
                    setBreakdownContractId(e.target.value);
                    const sel = amcContracts.find((c) => c.id === e.target.value);
                    if (sel) {
                      setBreakdownClientName(sel.clientName);
                      setBreakdownAddress(sel.siteAddress);
                      setBreakdownPhone(sel.contactPhone);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {amcContracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} — {c.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Customer / Client Name *
                  </label>
                  <input
                    type="text"
                    value={breakdownClientName}
                    onChange={(e) => setBreakdownClientName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={breakdownPhone}
                    onChange={(e) => setBreakdownPhone(formatMobileInput(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Reported Issue & Symptoms *
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Indoor Unit flashing Error A3, water overflowing into ceiling, compressor tripping on high pressure."
                  value={breakdownIssue}
                  onChange={(e) => setBreakdownIssue(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Priority SLA Tier
                  </label>
                  <select
                    value={breakdownPriority}
                    onChange={(e) => setBreakdownPriority(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="Critical 24x7">Critical 24x7 (2-Hr Turnaround)</option>
                    <option value="Urgent">Urgent (4-Hr Turnaround)</option>
                    <option value="Standard">Standard (Next Business Day)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Assign Technician
                  </label>
                  <select
                    value={breakdownTechnician}
                    onChange={(e) => setBreakdownTechnician(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    {techniciansList.map((t) => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBreakdownModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20"
                >
                  Dispatch Emergency Tech
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: 4-POINT INSPECTION CHECKLIST & SIGNOFF */}
      {isChecklistModalOpen && selectedVisitForChecklist && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedVisitForChecklist.visitNumber} Checklist & Signoff
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedVisitForChecklist.clientName} • Assigned: {selectedVisitForChecklist.assignedTechnician}
                </p>
              </div>
              <button
                onClick={() => setIsChecklistModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Mandatory Preventive Maintenance Tasks:
                </div>
                {selectedVisitForChecklist.checklistSummary.map((task, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleChecklistItem(idx)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      task.done
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-semibold">{task.task}</span>
                    {task.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Technician Diagnosis Remarks
                </label>
                <textarea
                  rows={2}
                  value={selectedVisitForChecklist.technicianRemarks || ''}
                  onChange={(e) =>
                    setSelectedVisitForChecklist({
                      ...selectedVisitForChecklist,
                      technicianRemarks: e.target.value
                    })
                  }
                  placeholder="e.g. Cleaned filters, refrigerant level healthy (125 PSI suction), coils washed."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsChecklistModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveChecklist}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Save & Signoff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
