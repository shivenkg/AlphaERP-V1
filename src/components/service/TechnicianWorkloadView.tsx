import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  Truck,
  Phone,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Filter,
  PlusCircle,
  X,
  ExternalLink,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import {
  ServiceTechnician,
  ServiceWorkOrder,
  ServiceRequest
} from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';

interface TechnicianWorkloadViewProps {
  technicians: ServiceTechnician[];
  workOrders: ServiceWorkOrder[];
  onRefresh: () => void;
  onSelectWorkOrder?: (ticket: ServiceWorkOrder) => void;
  onNavigateToRequests?: () => void;
}

export const TechnicianWorkloadView: React.FC<TechnicianWorkloadViewProps> = ({
  technicians,
  workOrders,
  onRefresh,
  onSelectWorkOrder,
  onNavigateToRequests
}) => {
  // Configurable daily task limit (default 4 tasks per day)
  const [dailyTaskLimit, setDailyTaskLimit] = useState<number>(4);
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'at_capacity' | 'overloaded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechForAssign, setSelectedTechForAssign] = useState<ServiceTechnician | null>(null);

  // Retrieve reactive service requests
  const serviceRequests = serviceStorage.getServiceRequests();

  // Active unassigned requests available for quick assignment
  const unassignedRequests = serviceRequests.filter(
    (r) => (!r.assignedTechnicianId || r.status === 'New') && r.status !== 'Resolved' && r.status !== 'Cancelled'
  );

  // Compute workload for each technician
  const technicianWorkloads = technicians.map((tech) => {
    // Assigned pending service requests
    const assignedRequests = serviceRequests.filter(
      (r) => r.assignedTechnicianId === tech.id && r.status !== 'Resolved' && r.status !== 'Cancelled'
    );

    // Assigned active work orders (not linked to an already-counted service request)
    const assignedWorkOrders = workOrders.filter(
      (w) =>
        w.technicianId === tech.id &&
        w.status !== 'Completed' &&
        w.status !== 'Invoiced' &&
        w.status !== 'Cancelled' &&
        !assignedRequests.some((r) => r.workOrderId === w.id)
    );

    const totalActiveTasks = assignedRequests.length + assignedWorkOrders.length;
    const loadPercentage = Math.round((totalActiveTasks / dailyTaskLimit) * 100);

    let workloadStatus: 'available' | 'at_capacity' | 'overloaded' = 'available';
    if (totalActiveTasks >= dailyTaskLimit + 1) {
      workloadStatus = 'overloaded';
    } else if (totalActiveTasks >= dailyTaskLimit) {
      workloadStatus = 'at_capacity';
    }

    const emergencyCount =
      assignedRequests.filter((r) => r.priority === 'P1 - Emergency Breakdown').length +
      assignedWorkOrders.filter((w) => w.priority === 'P1 - Emergency Breakdown').length;

    return {
      technician: tech,
      assignedRequests,
      assignedWorkOrders,
      totalActiveTasks,
      loadPercentage,
      workloadStatus,
      emergencyCount
    };
  });

  // Filtered list
  const filteredTechs = technicianWorkloads.filter((item) => {
    const matchesSearch =
      item.technician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.technician.certifications.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.technician.truckPlate.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'available') return item.workloadStatus === 'available';
    if (filterStatus === 'at_capacity') return item.workloadStatus === 'at_capacity';
    if (filterStatus === 'overloaded') return item.workloadStatus === 'overloaded';
    return true;
  });

  // Summary Metrics
  const totalActiveTechs = technicians.filter((t) => t.status !== 'Off Duty').length;
  const availableCount = technicianWorkloads.filter((t) => t.workloadStatus === 'available').length;
  const atCapacityCount = technicianWorkloads.filter((t) => t.workloadStatus === 'at_capacity').length;
  const overloadedCount = technicianWorkloads.filter((t) => t.workloadStatus === 'overloaded').length;
  const totalAssignedAcrossTeam = technicianWorkloads.reduce((sum, t) => sum + t.totalActiveTasks, 0);
  const totalTeamCapacity = technicians.length * dailyTaskLimit;
  const teamUtilizationRate = totalTeamCapacity > 0 ? Math.round((totalAssignedAcrossTeam / totalTeamCapacity) * 100) : 0;

  // Handle Quick Request Assignment
  const handleAssignRequest = (requestId: string) => {
    if (!selectedTechForAssign) return;
    const req = serviceRequests.find((r) => r.id === requestId);
    if (!req) return;

    req.assignedTechnicianId = selectedTechForAssign.id;
    req.assignedTechnicianName = selectedTechForAssign.name;
    req.status = 'Assigned';
    serviceStorage.saveServiceRequest(req);
    setSelectedTechForAssign(null);
    onRefresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Technician Workload Header & Metric Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Technician Workload & Task Limit Distribution
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Daily Limit: {dailyTaskLimit} Tasks/Day
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time task allocations, employee capacity progress bars, and balanced dispatch balancing.
              </p>
            </div>
          </div>

          {/* Daily Task Limit Control */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start md:self-auto">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 pl-2">Daily Task Limit:</span>
            <div className="flex items-center gap-1">
              {[3, 4, 5, 6].map((limit) => (
                <button
                  key={limit}
                  onClick={() => setDailyTaskLimit(limit)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    dailyTaskLimit === limit
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {limit}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Capacity Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Team Capacity Used</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-slate-900 dark:text-slate-100">{teamUtilizationRate}%</span>
              <span className="text-xs text-slate-500 font-medium font-mono">
                {totalAssignedAcrossTeam}/{totalTeamCapacity} Tasks
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50">
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Available for Dispatch</span>
            </div>
            <div className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-1">
              {availableCount} <span className="text-xs font-normal text-emerald-600">Techs (&lt; {dailyTaskLimit} tasks)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50">
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>At Daily Limit</span>
            </div>
            <div className="text-xl font-black text-amber-800 dark:text-amber-200 mt-1">
              {atCapacityCount} <span className="text-xs font-normal text-amber-600">Techs (= {dailyTaskLimit} tasks)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/50">
            <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Overloaded</span>
            </div>
            <div className="text-xl font-black text-rose-800 dark:text-rose-200 mt-1">
              {overloadedCount} <span className="text-xs font-normal text-rose-600">Techs (&gt; {dailyTaskLimit} tasks)</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: 'all', label: `All (${technicians.length})` },
              { id: 'available', label: `Available (${availableCount})` },
              { id: 'at_capacity', label: `At Capacity (${atCapacityCount})` },
              { id: 'overloaded', label: `Overloaded (${overloadedCount})` }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterStatus === f.id
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search technician, skill, van..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Technician Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTechs.map((item) => {
          const { technician: tech, assignedRequests, assignedWorkOrders, totalActiveTasks, loadPercentage, workloadStatus, emergencyCount } = item;

          // Color scheme for progress bar
          let progressColor = 'bg-emerald-500';
          let badgeBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
          let statusText = 'Optimal Load';

          if (workloadStatus === 'overloaded') {
            progressColor = 'bg-rose-500';
            badgeBg = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse';
            statusText = 'Overloaded (Rebalance)';
          } else if (workloadStatus === 'at_capacity') {
            progressColor = 'bg-amber-500';
            badgeBg = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            statusText = 'At Daily Limit';
          } else if (totalActiveTasks === 0) {
            progressColor = 'bg-slate-400';
            badgeBg = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
            statusText = 'Ready for Dispatch';
          }

          return (
            <div
              key={tech.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-all space-y-4"
            >
              {/* Top Technician Profile */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-black text-sm shrink-0">
                      {tech.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                        {tech.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{tech.certifications[0] || 'HVAC Technician'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          ★ {tech.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeBg}`}>
                    {statusText}
                  </span>
                </div>

                {/* Van & Status Info */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tech.truckPlate}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tech.phone}</span>
                  </span>
                </div>

                {/* Simple Workload Progress Bar based on Daily Task Limit */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Daily Workload Progress</span>
                    </span>
                    <span className="font-mono font-black text-slate-900 dark:text-slate-100">
                      {totalActiveTasks} / {dailyTaskLimit} Tasks ({loadPercentage}%)
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                      style={{ width: `${Math.min(100, Math.max(loadPercentage, totalActiveTasks > 0 ? 12 : 0))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                    <span>0 tasks</span>
                    <span>Daily Limit: {dailyTaskLimit}</span>
                    <span>Capacity: {dailyTaskLimit}</span>
                  </div>
                </div>

                {/* Assigned Tasks Summary List */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Assigned Tickets ({totalActiveTasks})</span>
                    {emergencyCount > 0 && (
                      <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {emergencyCount} P1 Emergency
                      </span>
                    )}
                  </div>

                  {totalActiveTasks === 0 ? (
                    <div className="p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                      No active tickets assigned for today. Ready for immediate dispatch.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {/* Active Requests */}
                      {assignedRequests.map((req) => (
                        <div
                          key={req.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1 hover:border-indigo-400 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                              {req.requestNumber}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                req.priority === 'P1 - Emergency Breakdown'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              }`}
                            >
                              {req.priority.split(' - ')[0]}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {req.customerName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {req.equipmentName} • {req.issueCategory}
                          </div>
                        </div>
                      ))}

                      {/* Active Work Orders */}
                      {assignedWorkOrders.map((wo) => (
                        <div
                          key={wo.id}
                          onClick={() => onSelectWorkOrder && onSelectWorkOrder(wo)}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1 hover:border-indigo-400 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                              {wo.ticketNumber}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {wo.status}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {wo.customerName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {wo.equipmentTitle} • {wo.scheduledTimeSlot}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Dispatch Action */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedTechForAssign(tech)}
                  disabled={unassignedRequests.length === 0}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    unassignedRequests.length > 0
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>
                    {unassignedRequests.length > 0
                      ? `Assign Pending Request (${unassignedRequests.length} available)`
                      : 'No Unassigned Requests'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Assign Request Modal */}
      {selectedTechForAssign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Assign Service Request
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assigning to <span className="font-bold text-indigo-600">{selectedTechForAssign.name}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedTechForAssign(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {unassignedRequests.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No unassigned service requests available.
                </div>
              ) : (
                unassignedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:border-indigo-500 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          {req.requestNumber}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            req.priority === 'P1 - Emergency Breakdown'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {req.priority.split(' - ')[0]}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {req.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {req.equipmentName} • {req.issueCategory}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAssignRequest(req.id)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold whitespace-nowrap cursor-pointer shrink-0"
                    >
                      Assign
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTechForAssign(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
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
