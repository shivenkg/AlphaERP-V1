import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Calendar,
  Layers,
  Sparkles,
  FileSpreadsheet,
  AlertTriangle,
  Search,
  Filter,
  Printer,
  Eye,
  FileText
} from 'lucide-react';
import { WorkOrder, WorkOrderStatus, Project } from '../types';
import { storageService } from '../services/storageService';
import { WorkOrderDetailModal } from './WorkOrderDetailModal';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  projects: Project[];
  onOpenSheetsModal: () => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  workOrders,
  projects,
  onOpenSheetsModal
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedWorkOrderForModal, setSelectedWorkOrderForModal] = useState<WorkOrder | null>(null);

  const term = (search || '').trim().toLowerCase();
  const filteredWorkOrders = workOrders.filter((wo) => {
    const statusMatch = selectedStatus === 'ALL' || wo.status === selectedStatus;
    const searchMatch =
      !term ||
      (wo.orderNumber || '').toLowerCase().includes(term) ||
      (wo.clientName || '').toLowerCase().includes(term) ||
      (wo.projectTitle || '').toLowerCase().includes(term) ||
      (wo.assignedTechnician || '').toLowerCase().includes(term);

    return statusMatch && searchMatch;
  });

  const handleUpdateStatus = (woId: string, newStatus: WorkOrderStatus) => {
    storageService.updateWorkOrder(woId, {
      status: newStatus,
      actualEndDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
    });
    if (selectedWorkOrderForModal && selectedWorkOrderForModal.id === woId) {
      setSelectedWorkOrderForModal({
        ...selectedWorkOrderForModal,
        status: newStatus,
        actualEndDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
      });
    }
  };

  const statusStyles: Record<WorkOrderStatus, string> = {
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    Inspection: 'bg-purple-50 text-purple-700 border-purple-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Billed: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">HVAC Field Work Orders & Site Operations</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {workOrders.length} Work Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Ducting installation, copper piping pressure testing, VRF outdoor unit commissioning, and handover checklists.
          </p>
        </div>

        <button
          onClick={onOpenSheetsModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Work Orders Sheet</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search work order #, title, technician..."
            className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <span>Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Inspection">Inspection</option>
            <option value="Completed">Completed</option>
            <option value="Billed">Billed</option>
          </select>
        </div>
      </div>

      {/* Work Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredWorkOrders.map((wo) => {
          return (
            <div
              key={wo.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{wo.orderNumber}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusStyles[wo.status]}`}>
                      {wo.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5">{wo.projectTitle}</h3>
                  <div className="text-xs text-slate-500 font-medium">{wo.clientName}</div>
                </div>

                <div className="flex items-center gap-1">
                  <select
                    value={wo.status}
                    onChange={(e) => handleUpdateStatus(wo.id, e.target.value as WorkOrderStatus)}
                    className="bg-slate-50 text-slate-800 text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Completed">Completed</option>
                    <option value="Billed">Billed</option>
                  </select>
                </div>
              </div>

              {/* Specs & Location */}
              <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-medium">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate text-slate-700">{wo.siteAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Lead Technician: <strong className="text-slate-900">{wo.assignedTechnician}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Schedule: {wo.scheduledStartDate} → {wo.scheduledEndDate}</span>
                </div>
                {wo.equipmentSpecs && (
                  <div className="pt-1 text-[11px] text-blue-700 font-mono font-semibold">
                    Specs: {wo.equipmentSpecs}
                  </div>
                )}
              </div>

              {/* Scope of Work Steps */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Scope of Work & Method Statements
                </div>
                <div className="space-y-1.5 text-xs">
                  {wo.scopeOfWork.map((scopeStep, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-slate-700 font-medium"
                    >
                      <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{scopeStep}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completion Signoff Banner */}
              {wo.completionSignoff && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-emerald-800 font-bold">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Client Handover Signed</span>
                    </div>
                    <span>Rating: {wo.completionSignoff.clientSatisfactionScore}/5 ★</span>
                  </div>
                  <div className="text-emerald-700 text-[11px] font-medium">
                    Signed by: {wo.completionSignoff.signedBy} on {wo.completionSignoff.signatureDate}
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedWorkOrderForModal(wo)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Commissioning Sheet</span>
                </button>

                <button
                  onClick={() => setSelectedWorkOrderForModal(wo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 font-bold text-xs shadow-xs transition-colors"
                  title="Print or Save Work Order as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF Work Order</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Work Order Detail & Printable PDF Modal */}
      {selectedWorkOrderForModal && (
        <WorkOrderDetailModal
          workOrder={selectedWorkOrderForModal}
          project={projects.find(p => p.id === selectedWorkOrderForModal.projectId)}
          onClose={() => setSelectedWorkOrderForModal(null)}
          onUpdateStatus={(newStatus) => handleUpdateStatus(selectedWorkOrderForModal.id, newStatus)}
        />
      )}
    </div>
  );
};
