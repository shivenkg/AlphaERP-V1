import React, { useMemo } from 'react';
import {
  CalendarClock,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  User,
  IndianRupee,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { AmcContract, PpmScheduleVisit, BreakdownTicket } from '../../types';
import { storageService } from '../../services/storageService';

interface UpcomingServiceVisitsWidgetProps {
  amcContracts?: AmcContract[];
  ppmVisits?: PpmScheduleVisit[];
  breakdownTickets?: BreakdownTicket[];
  onNavigate: (tab: string) => void;
}

export const UpcomingServiceVisitsWidget: React.FC<UpcomingServiceVisitsWidgetProps> = ({
  amcContracts: propContracts,
  ppmVisits: propVisits,
  breakdownTickets: propTickets,
  onNavigate
}) => {
  // Use props if provided, otherwise retrieve live from storageService
  const contracts = useMemo(() => {
    return propContracts && propContracts.length > 0
      ? propContracts
      : storageService.getAmcContracts();
  }, [propContracts]);

  const visits = useMemo(() => {
    return propVisits && propVisits.length > 0
      ? propVisits
      : storageService.getPpmVisits();
  }, [propVisits]);

  const breakdowns = useMemo(() => {
    return propTickets && propTickets.length > 0
      ? propTickets
      : storageService.getBreakdownTickets();
  }, [propTickets]);

  // Calculations for the 3 Core Required Summary Metrics
  const activeContracts = useMemo(() => {
    return contracts.filter((c) => c.status === 'Active' || (c.status as string) === 'active');
  }, [contracts]);

  const totalAmcRevenue = useMemo(() => {
    return activeContracts.reduce((sum, c) => sum + (c.annualContractValue || 0), 0);
  }, [activeContracts]);

  const pendingVisits = useMemo(() => {
    return visits.filter(
      (v) =>
        v.status === 'Scheduled' ||
        v.status === 'In Progress' ||
        (v.status as string) === 'scheduled' ||
        (v.status as string) === 'in_progress'
    );
  }, [visits]);

  const openBreakdowns = useMemo(() => {
    return breakdowns.filter(
      (b) =>
        b.status === 'Open' ||
        b.status === 'Dispatched' ||
        b.status === 'Work In Progress' ||
        (b.status as string) === 'reported' ||
        (b.status as string) === 'assigned' ||
        (b.status as string) === 'in_progress'
    );
  }, [breakdowns]);

  // Combined Pending Service Calls (Scheduled PPMs + Open Breakdowns)
  const totalPendingServiceCalls = useMemo(() => {
    return pendingVisits.length + openBreakdowns.length;
  }, [pendingVisits, openBreakdowns]);

  const totalEquipmentCovered = useMemo(() => {
    return activeContracts.reduce((sum, c) => {
      if (c.equipmentList && c.equipmentList.length > 0) {
        return sum + c.equipmentList.length;
      }
      return sum + (c.equipmentCount || 1);
    }, 0);
  }, [activeContracts]);

  // Sorting next upcoming PPM visits
  const upcomingVisits = useMemo(() => {
    return [...pendingVisits]
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 4);
  }, [pendingVisits]);

  const emergencyBreakdownsCount = useMemo(() => {
    return openBreakdowns.filter(
      (b) =>
        b.priority === 'Critical 24x7' ||
        b.priority === 'High' ||
        (b.priority as string) === 'emergency' ||
        (b.priority as string) === 'high'
    ).length;
  }, [openBreakdowns]);

  // Format currency in Indian format
  const formatINR = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakhs`;
    }
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical 24x7':
      case 'emergency':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50';
      case 'High':
      case 'high':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
      case 'Medium':
      case 'medium':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
      case 'In Progress':
      case 'Work In Progress':
      case 'in_progress':
      case 'Dispatched':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50';
      case 'Scheduled':
      case 'Open':
      case 'scheduled':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
                Service & AMC Operations Hub
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Live Field Dispatch
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Preventive maintenance (PPM) visits, individual equipment health logs, and 24x7 emergency ticket response
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          <button
            onClick={() => onNavigate('services_schedule')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>Dispatch Board</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('services_amc')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>AMC Hub & Logs</span>
          </button>
        </div>
      </div>

      {/* THREE CORE SUMMARY CARDS specifically requested for the Service & AMC Module */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Active Contracts */}
        <div
          onClick={() => onNavigate('services_amc')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('services_amc');
            }
          }}
          role="button"
          tabIndex={0}
          title="Click to view Active AMC Contracts & Equipment Directory"
          className="relative overflow-hidden bg-gradient-to-br from-emerald-50/50 via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-800/60 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active AMC Contracts
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1 group-hover:text-emerald-600 transition-colors">
              {activeContracts.length}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">Contracts</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-emerald-100 dark:border-emerald-950/60 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              {totalEquipmentCovered} HVAC Units Covered
            </span>
            <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md text-[10px]">
              99.8% SLA Uptime
            </span>
          </div>
        </div>

        {/* Card 2: Pending Service Calls */}
        <div
          onClick={() => onNavigate('services_schedule')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('services_schedule');
            }
          }}
          role="button"
          tabIndex={0}
          title="Click to view Field Service Schedule & Dispatch Board"
          className="relative overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-slate-50 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-800/60 p-4 sm:p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
              <span>Dispatch Board</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Service Calls
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1 group-hover:text-amber-600 transition-colors">
              {totalPendingServiceCalls}{' '}
              <span className="text-xs font-normal text-slate-500 font-sans">Calls in Queue</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-amber-100 dark:border-amber-950/60 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {pendingVisits.length} PPMs • {openBreakdowns.length} Breakdowns
            </span>
            {emergencyBreakdownsCount > 0 ? (
              <span className="text-red-700 dark:text-red-300 font-bold bg-red-100/80 dark:bg-red-900/60 px-2 py-0.5 rounded-md text-[10px] animate-pulse">
                {emergencyBreakdownsCount} Critical Emergency
              </span>
            ) : (
              <span className="text-slate-500 font-medium text-[10px]">
                Normal Dispatch
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Total Revenue from AMCs */}
        <div
          onClick={() => onNavigate('services_amc')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('services_amc');
            }
          }}
          role="button"
          tabIndex={0}
          title="Click to view AMC Revenue & Service Contracts"
          className="relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-slate-50 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-800/60 p-4 sm:p-5 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 group-hover:scale-105 transition-transform">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
              <span>Financials</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Revenue from AMCs
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-1">
              {formatINR(totalAmcRevenue)}
            </div>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-blue-100 dark:border-blue-950/60 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Annual Recurring Value (ACV)
            </span>
            <span className="text-blue-700 dark:text-blue-300 font-bold bg-blue-100/80 dark:bg-blue-900/60 px-2 py-0.5 rounded-md text-[10px]">
              Recurring ARR
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Next Scheduled PPM Visits vs Emergency Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        {/* Left: Upcoming PPM Visits */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-blue-500" />
              <span>Next Scheduled PPM Visits</span>
            </h4>
            <span className="text-[11px] text-slate-500">{upcomingVisits.length} visits in queue</span>
          </div>

          <div className="space-y-2">
            {upcomingVisits.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                No upcoming PPM visits scheduled.
              </div>
            ) : (
              upcomingVisits.map((visit) => {
                const contract = contracts.find((c) => c.id === visit.contractId);
                const hasChecklist = visit.checklistSummary && visit.checklistSummary.some((v) => v.done === true);

                return (
                  <div
                    key={visit.id}
                    onClick={() => onNavigate('services_schedule')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onNavigate('services_schedule');
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title={`Click to inspect PPM Visit #${visit.visitNumber} for ${visit.clientName} in Dispatch Board`}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 border border-slate-100 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {visit.clientName}
                          </span>
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${getStatusBadge(visit.status)}`}>
                            {visit.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {visit.scheduledDate}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {visit.assignedTechnician}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-medium text-slate-500">
                          {contract?.systemType || 'HVAC System'}
                        </div>
                        <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-end gap-1 mt-0.5">
                          {hasChecklist ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              Checklist
                            </span>
                          ) : (
                            <span>Visit #{visit.visitNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Emergency Breakdown Queue */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>Active Breakdown Tickets</span>
            </h4>
            <span className="text-[11px] text-slate-500">{openBreakdowns.length} active tickets</span>
          </div>

          <div className="space-y-2">
            {openBreakdowns.length === 0 ? (
              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-center text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero open breakdown tickets. All HVAC systems nominal.</span>
              </div>
            ) : (
              openBreakdowns.slice(0, 3).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => onNavigate('services_schedule')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onNavigate('services_schedule');
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  title={`Click to view Breakdown Ticket for ${ticket.clientName} in Dispatch Board`}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-red-50/30 dark:hover:bg-red-950/20 border border-slate-100 dark:border-slate-700/80 hover:border-red-300 dark:hover:border-red-700 rounded-xl transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                          {ticket.clientName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                        {ticket.reportedIssue}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-500 font-mono">
                        {ticket.reportedAt ? ticket.reportedAt.split('T')[0] : ''}
                      </div>
                      <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                        {ticket.assignedTechnician}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
