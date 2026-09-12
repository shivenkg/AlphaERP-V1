import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Wrench,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckSquare,
  Square,
  FileText,
  MapPin,
  CalendarCheck,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  Truck
} from 'lucide-react';
import {
  AmcScheduledVisit,
  ServiceEquipment,
  ServiceCustomer,
  ServiceTechnician,
  AmcContractType,
  EquipmentType
} from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';

interface AmcCalendarDashboardProps {
  equipments: ServiceEquipment[];
  customers: ServiceCustomer[];
  technicians: ServiceTechnician[];
  onRefresh: () => void;
  onNavigateToHistory?: (equipmentId: string) => void;
  initialStatusFilter?: string;
  initialViewMode?: 'calendar' | 'agenda';
}

export const AmcCalendarDashboard: React.FC<AmcCalendarDashboardProps> = ({
  equipments,
  customers,
  technicians,
  onRefresh,
  onNavigateToHistory,
  initialStatusFilter = 'ALL',
  initialViewMode = 'calendar'
}) => {
  // Current view month/year state (Default to September 2026 as per simulated timestamp)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 0-indexed: 8 is September
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>(initialViewMode);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [customerFilter, setCustomerFilter] = useState<string>('ALL');
  const [equipmentTypeFilter, setEquipmentTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  // Selected Visit for inspection / action
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState<boolean>(false);
  const [completionNotes, setCompletionNotes] = useState<string>('');

  // Form State for Scheduling New AMC Visit
  const [newCustId, setNewCustId] = useState<string>(customers[0]?.id || '');
  const [newEqId, setNewEqId] = useState<string>(equipments[0]?.id || '');
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newTimeSlot, setNewTimeSlot] = useState<string>('09:00 AM - 12:30 PM');
  const [newQuarter, setNewQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q3');
  const [newVisitNum, setNewVisitNum] = useState<number>(3);
  const [newTotalVisits, setNewTotalVisits] = useState<number>(4);
  const [newTechId, setNewTechId] = useState<string>(technicians[0]?.id || '');
  const [newNotes, setNewNotes] = useState<string>('');

  // All AMC visits from storage
  const amcVisits = serviceStorage.getAmcVisits();

  // Active visit selection
  const selectedVisit = amcVisits.find((v) => v.id === selectedVisitId) || amcVisits[0] || null;

  // Key KPI Calculations
  const totalAmcUnits = equipments.filter((e) => e.amcType !== 'None').length;

  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const thisMonthVisits = amcVisits.filter((v) => v.scheduledDate.startsWith(currentMonthPrefix));

  const overdueVisits = amcVisits.filter((v) => v.status === 'Overdue');
  const dueSoonVisits = amcVisits.filter((v) => v.status === 'Due Soon');
  const completedQuarterVisits = amcVisits.filter((v) => v.status === 'Completed' && v.quarter === 'Q3');

  // Filtered visits
  const filteredVisits = amcVisits.filter((visit) => {
    const matchesStatus = statusFilter === 'ALL' || visit.status === statusFilter;
    const matchesCustomer = customerFilter === 'ALL' || visit.customerId === customerFilter;
    const matchesType = equipmentTypeFilter === 'ALL' || visit.equipmentType === equipmentTypeFilter;
    const matchesSearch =
      visit.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.equipmentSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.contractCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visit.assignedTechnicianName && visit.assignedTechnicianName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesCustomer && matchesType && matchesSearch;
  });

  // Calendar Days Calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8); // September 2026
  };

  // Schedule New AMC Visit
  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newCustId) || customers[0];
    const eq = equipments.find((item) => item.id === newEqId) || equipments[0];
    const tech = technicians.find((t) => t.id === newTechId) || technicians[0];

    const visit: AmcScheduledVisit = {
      id: `amc-vis-${Date.now()}`,
      contractCode: `AMC-2026-${cust.name.split(' ')[0].toUpperCase()}`,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      siteAddress: cust.address,
      equipmentId: eq.id,
      equipmentName: `${eq.brand} ${eq.capacityTR}TR ${eq.type}`,
      equipmentSerialNumber: eq.serialNumber,
      equipmentType: eq.type,
      capacityTR: eq.capacityTR,
      scheduledDate: newDate,
      timeSlot: newTimeSlot,
      quarter: newQuarter,
      visitNumber: newVisitNum,
      totalVisitsInContract: newTotalVisits,
      status: 'Scheduled',
      amcType: eq.amcType,
      assignedTechnicianId: tech?.id,
      assignedTechnicianName: tech?.name,
      checklistItems: [
        'Condenser coil cleaning & fin straightening',
        'Operating suction and discharge refrigerant pressure check',
        'Motor insulation and contactor electrical terminals check',
        'Air intake pre-filter clean & sanitize',
        'Condensate drain pan flushing and leak test'
      ],
      notes: newNotes || 'Routine quarterly preventive AMC inspection'
    };

    serviceStorage.saveAmcVisit(visit);
    setIsScheduleModalOpen(false);
    setSelectedVisitId(visit.id);
    onRefresh();
  };

  // Mark Completed
  const handleCompleteVisit = () => {
    if (!selectedVisit) return;
    serviceStorage.updateAmcVisitStatus(
      selectedVisit.id,
      'Completed',
      completionNotes || 'Quarterly preventive maintenance completed according to manufacturer checklist. Customer signoff secured.'
    );

    // Also auto-log a service history entry for this asset
    const historyEntry = {
      id: `hist-${Date.now()}`,
      equipmentId: selectedVisit.equipmentId,
      equipmentName: selectedVisit.equipmentName,
      equipmentSerialNumber: selectedVisit.equipmentSerialNumber,
      equipmentType: selectedVisit.equipmentType,
      customerId: selectedVisit.customerId,
      customerName: selectedVisit.customerName,
      actionDate: selectedVisit.scheduledDate,
      actionType: 'Quarterly AMC Inspection' as const,
      technicianName: selectedVisit.assignedTechnicianName || 'Rajesh Sharma',
      technicianId: selectedVisit.assignedTechnicianId,
      operatingHours: 6200,
      refrigerantPressurePSI: { suction: 120, discharge: 365 },
      ampsDrawn: 27.5,
      workSummary: `Completed ${selectedVisit.quarter} AMC Visit #${selectedVisit.visitNumber} of ${selectedVisit.totalVisitsInContract}`,
      repairNotes: completionNotes || 'All 5 checklist points verified. Coils washed with non-acidic cleaner. Running pressures in optimal range.',
      partsReplaced: ['Air filter pre-mesh replacement'],
      totalCost: 0, // AMC Covered
      outcomeStatus: 'Operational & Verified' as const,
      nextServiceDueDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      loggedBy: selectedVisit.assignedTechnicianName || 'Technician',
      loggedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    serviceStorage.saveAssetServiceHistoryEntry(historyEntry);

    setIsCompleteModalOpen(false);
    setCompletionNotes('');
    onRefresh();
  };

  // Helper for status badge styling
  const getStatusBadge = (status: AmcScheduledVisit['status']) => {
    switch (status) {
      case 'Overdue':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'Due Soon':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'In Progress':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
      case 'Scheduled':
      default:
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              Units Under AMC
            </span>
            <ShieldCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {totalAmcUnits} Units
          </div>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
            Active Contracts
          </span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              Visits This Month
            </span>
            <CalendarIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {thisMonthVisits.length}
          </div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </span>
        </div>

        <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase">
              Due Within 7 Days
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-900 dark:text-amber-200 font-mono">
            {dueSoonVisits.length} Visits
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
            Action Required
          </span>
        </div>

        <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase">
              Overdue Visits
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-900 dark:text-rose-200 font-mono">
            {overdueVisits.length}
          </div>
          <span className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold">
            Immediate Dispatch
          </span>
        </div>

        <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
              Q3 Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-900 dark:text-emerald-200 font-mono">
            {completedQuarterVisits.length}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
            100% SLA Maintained
          </span>
        </div>
      </div>

      {/* Overdue Warning Alert Bar if any */}
      {overdueVisits.length > 0 && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Attention: {overdueVisits.length} scheduled AMC preventive maintenance visit is overdue! Priority technician re-assignment advised.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {overdueVisits.map((ov) => (
              <button
                key={ov.id}
                onClick={() => setSelectedVisitId(ov.id)}
                className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors text-[11px]"
              >
                Inspect {ov.customerName.split(' ')[0]} ({ov.scheduledDate})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Controls & View Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs sm:text-sm px-3 text-slate-900 dark:text-slate-100 min-w-[130px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleJumpToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Today
          </button>

          {/* Toggle Calendar vs Agenda Mode */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Monthly Calendar
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'agenda'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Visits Agenda ({filteredVisits.length})
            </button>
          </div>
        </div>

        {/* Right side filter triggers & Schedule button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Due Soon">Due Soon</option>
            <option value="Overdue">Overdue</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Customer Filter */}
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="text-xs font-semibold py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden max-w-[150px] truncate"
          >
            <option value="ALL">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule AMC Visit</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Calendar Grid + Selected Visit Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar Grid / Agenda View (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          {viewMode === 'calendar' ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/70">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[90px] bg-slate-50/50 dark:bg-slate-950/20 p-1.5" />
                ))}

                {/* Month Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSimulatedToday = dateStr === '2026-09-12';
                  const dayVisits = filteredVisits.filter((v) => v.scheduledDate === dateStr);

                  return (
                    <div
                      key={`day-${dayNum}`}
                      className={`min-h-[90px] p-1.5 transition-colors relative flex flex-col justify-between ${
                        isSimulatedToday
                          ? 'bg-blue-50/40 dark:bg-blue-950/30'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-bold inline-flex items-center justify-center rounded-full ${
                            isSimulatedToday
                              ? 'w-5 h-5 bg-blue-600 text-white shadow-xs'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {dayNum}
                        </span>
                        {isSimulatedToday && (
                          <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                            Today
                          </span>
                        )}
                      </div>

                      {/* Visit Badges */}
                      <div className="space-y-1 flex-1 overflow-y-auto max-h-[65px] scrollbar-none">
                        {dayVisits.map((visit) => {
                          const isSelected = selectedVisit?.id === visit.id;
                          let dotColor = 'bg-blue-500';
                          if (visit.status === 'Overdue') dotColor = 'bg-rose-500';
                          if (visit.status === 'Due Soon') dotColor = 'bg-amber-500';
                          if (visit.status === 'Completed') dotColor = 'bg-emerald-500';

                          return (
                            <button
                              key={visit.id}
                              onClick={() => setSelectedVisitId(visit.id)}
                              className={`w-full text-left p-1 rounded-md text-[10px] font-semibold truncate transition-all flex items-center gap-1 border ${
                                isSelected
                                  ? 'ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 border-blue-400'
                                  : getStatusBadge(visit.status)
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                              <span className="truncate">{visit.customerName.split(' ')[0]} - {visit.capacityTR}TR</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Agenda View */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Chronological Schedule of AMC Visits
              </h3>
              {filteredVisits.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No AMC visits match current filters.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredVisits.map((visit) => {
                    const isSelected = selectedVisit?.id === visit.id;
                    return (
                      <div
                        key={visit.id}
                        onClick={() => setSelectedVisitId(visit.id)}
                        className={`py-3 px-3 rounded-xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(visit.status)}`}>
                              {visit.status}
                            </span>
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                              {visit.customerName}
                            </span>
                            <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                              {visit.equipmentName} ({visit.capacityTR} TR)
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>Contract: <strong>{visit.contractCode}</strong> ({visit.quarter} Visit #{visit.visitNumber})</span>
                            <span>•</span>
                            <span>Tech: <strong>{visit.assignedTechnicianName || 'Unassigned'}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-xs">
                          <div className="text-right">
                            <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                              {visit.scheduledDate}
                            </div>
                            <div className="text-[10px] text-slate-400">{visit.timeSlot}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Visit Inspection & Action Drawer */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              AMC Visit Details & Scope
            </h3>
            {selectedVisit && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(selectedVisit.status)}`}>
                {selectedVisit.status}
              </span>
            )}
          </div>

          {selectedVisit ? (
            <div className="space-y-4 text-xs">
              {/* Unit Title and Customer */}
              <div>
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {selectedVisit.contractCode} • {selectedVisit.quarter} (Visit {selectedVisit.visitNumber} of {selectedVisit.totalVisitsInContract})
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedVisit.equipmentName}
                </h4>
                <span className="font-mono text-[11px] text-slate-500">
                  Serial Number: {selectedVisit.equipmentSerialNumber}
                </span>
              </div>

              {/* Customer and Location Info */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  {selectedVisit.customerName}
                </div>
                <div className="text-slate-500 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{selectedVisit.siteAddress}</span>
                </div>
                <div className="flex items-center gap-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <a
                    href={`tel:${selectedVisit.customerPhone}`}
                    className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    {selectedVisit.customerPhone}
                  </a>
                  <a
                    href={`https://wa.me/${selectedVisit.customerPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline ml-auto"
                  >
                    <MessageSquare className="w-3 h-3" />
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Schedule and Assigned Crew */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Scheduled Date</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {selectedVisit.scheduledDate}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{selectedVisit.timeSlot}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-medium">Lead Technician</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedVisit.assignedTechnicianName || 'Unassigned'}
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium block">
                    Certified HVAC Tech
                  </span>
                </div>
              </div>

              {/* Checklist Scope */}
              <div>
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 block mb-1.5">
                  Contract Maintenance Scope & Checklist ({selectedVisit.checklistItems.length} tasks)
                </span>
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  {selectedVisit.checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Site Instructions */}
              {selectedVisit.notes && (
                <div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 block mb-1">
                    Site Access & Technical Notes
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                    {selectedVisit.notes}
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {selectedVisit.status !== 'Completed' ? (
                  <button
                    onClick={() => setIsCompleteModalOpen(true)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Visit & Log to Asset History</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Completed on {selectedVisit.completedAt || selectedVisit.scheduledDate}</span>
                  </div>
                )}

                {/* Jump to Asset History Timeline */}
                {onNavigateToHistory && (
                  <button
                    onClick={() => onNavigateToHistory(selectedVisit.equipmentId)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-4 h-4 text-teal-600" />
                    <span>View Asset Service History Timeline</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              Select any visit on the calendar to view specifications and dispatch status.
            </div>
          )}
        </div>
      </div>

      {/* Schedule New AMC Visit Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                Schedule Upcoming AMC Visit for HVAC Unit
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleVisit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Customer / Facility Site:</label>
                <select
                  value={newCustId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    setNewCustId(cId);
                    const matchingEq = equipments.find((eq) => eq.customerId === cId);
                    if (matchingEq) setNewEqId(matchingEq.id);
                  }}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Target HVAC Equipment Unit:</label>
                <select
                  value={newEqId}
                  onChange={(e) => setNewEqId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  {equipments
                    .filter((eq) => eq.customerId === newCustId)
                    .map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.brand} {eq.capacityTR}TR {eq.type} (SN: {eq.serialNumber})
                      </option>
                    ))}
                  {equipments.filter((eq) => eq.customerId === newCustId).length === 0 && (
                    <option value="">No equipment linked to this customer</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Scheduled Date:</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Time Slot:</label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="08:00 AM - 12:00 PM">08:00 AM - 12:00 PM (Morning)</option>
                    <option value="09:00 AM - 12:30 PM">09:00 AM - 12:30 PM (Mid-Morning)</option>
                    <option value="01:00 PM - 05:00 PM">01:00 PM - 05:00 PM (Afternoon)</option>
                    <option value="06:00 AM - 10:00 AM">06:00 AM - 10:00 AM (Early Pre-Opening)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold mb-1">Quarter:</label>
                  <select
                    value={newQuarter}
                    onChange={(e) => setNewQuarter(e.target.value as any)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Q1">Q1 (Apr - Jun)</option>
                    <option value="Q2">Q2 (Jul - Sep)</option>
                    <option value="Q3">Q3 (Oct - Dec)</option>
                    <option value="Q4">Q4 (Jan - Mar)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Visit Number:</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newVisitNum}
                    onChange={(e) => setNewVisitNum(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Total in Contract:</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newTotalVisits}
                    onChange={(e) => setNewTotalVisits(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Assigned Lead Technician:</label>
                <select
                  value={newTechId}
                  onChange={(e) => setNewTechId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status}) - {t.truckPlate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Special Scope or Site Notes:</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Needs permit to work on roof terrace. Check chiller approach temperatures..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Confirm AMC Visit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Visit Modal */}
      {isCompleteModalOpen && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Signoff & Complete AMC Visit
              </h3>
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                You are marking visit <strong>#{selectedVisit.visitNumber}</strong> for{' '}
                <strong>{selectedVisit.customerName}</strong> ({selectedVisit.equipmentName}) as Completed. This will also automatically log an entry into the asset's service history timeline.
              </p>

              <div>
                <label className="block font-bold mb-1">Technician Completion Notes & Findings:</label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Cleaned coils, operating pressures verified at 120/365 PSI, belts checked, filters replaced, customer signoff received."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteVisit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Completion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
