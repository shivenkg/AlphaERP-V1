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
  MapPin,
  ArrowUpRight
} from 'lucide-react';
import { AMCContract, PPMVisit, BreakdownTicket } from '../../types';
import { storageService } from '../../services/storageService';

interface UpcomingServiceVisitsWidgetProps {
  amcContracts?: AMCContract[];
  ppmVisits?: PPMVisit[];
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
      : storageService.getPPMVisits();
  }, [propVisits]);

  const breakdowns = useMemo(() => {
    return propTickets && propTickets.length > 0
      ? propTickets
      : storageService.getBreakdownTickets();
  }, [propTickets]);

  // Aggregate stats
  const upcomingVisits = useMemo(() => {
    return [...visits]
      .filter((v) => v.status === 'scheduled' || v.status === 'in_progress')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 4);
  }, [visits]);

  const openBreakdowns = useMemo(() => {
    return breakdowns.filter((b) => b.status === 'reported' || b.status === 'assigned' || b.status === 'in_progress');
  }, [breakdowns]);

  const activeAmcs = useMemo(() => {
    return contracts.filter((c) => c.status === 'active');
  }, [contracts]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50';
      case 'high':
        return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50';
      case 'medium':
        return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50';
      case 'scheduled':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-900/50';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
                Upcoming Service Visits & AMC Schedules
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Live Field Dispatch
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Preventive maintenance (PPM) visits, 4-point HVAC inspection checklists, and 24x7 emergency ticket response
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => onNavigate('services_schedule')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <span>Dispatch Board</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('services_amc')}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>AMC Hub</span>
          </button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-medium text-slate-500">Upcoming PPMs</div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {upcomingVisits.length}
          </div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
            Scheduled next
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-medium text-slate-500">Open Breakdowns</div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {openBreakdowns.length}
          </div>
          <div className="text-[10px] text-red-600 dark:text-red-400 font-medium mt-0.5">
            {openBreakdowns.filter(b => b.priority === 'emergency').length} Emergency
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-medium text-slate-500">Active AMC Contracts</div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {activeAmcs.length}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            Covered sites
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-medium text-slate-500">Field Engineers</div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            4
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
            On-call active
          </div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Visits vs Emergency Breakdowns */}
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
                const contract = contracts.find((c) => c.id === visit.amcId);
                const hasChecklist = visit.checklist && Object.values(visit.checklist).some((v) => v === true);

                return (
                  <div
                    key={visit.id}
                    onClick={() => onNavigate('services_schedule')}
                    role="button"
                    tabIndex={0}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 border border-slate-100 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {visit.clientName}
                          </span>
                          <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${getStatusBadge(visit.status)}`}>
                            {visit.status.replace('_', ' ').toUpperCase()}
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
                            {visit.technicianName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-medium text-slate-500">
                          {contract?.equipmentType || 'HVAC System'}
                        </div>
                        <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-end gap-1 mt-0.5">
                          {hasChecklist ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              Checklist
                            </span>
                          ) : (
                            <span>PPM #{visit.visitNumber}</span>
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
                  role="button"
                  tabIndex={0}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-red-50/30 dark:hover:bg-red-950/20 border border-slate-100 dark:border-slate-700/80 hover:border-red-300 dark:hover:border-red-700 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {ticket.clientName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                        {ticket.reportedIssue}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-500 font-mono">
                        {ticket.reportedDate}
                      </div>
                      <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                        {ticket.technicianName}
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
