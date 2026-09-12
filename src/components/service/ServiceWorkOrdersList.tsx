import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Eye,
  Camera,
  Wrench,
  PenTool,
  CreditCard,
  X,
  Smartphone,
  Check
} from 'lucide-react';
import {
  ServiceWorkOrder,
  ServiceCustomer,
  ServiceEquipment,
  ServiceTechnician,
  ServicePriority,
  ServiceTicketStatus
} from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';

interface ServiceWorkOrdersListProps {
  workOrders: ServiceWorkOrder[];
  customers: ServiceCustomer[];
  equipments: ServiceEquipment[];
  technicians: ServiceTechnician[];
  selectedTicket: ServiceWorkOrder | null;
  onSelectTicket: (ticket: ServiceWorkOrder | null) => void;
  onOpenMobileMode: (ticket: ServiceWorkOrder) => void;
  onGenerateInvoice: (ticket: ServiceWorkOrder) => void;
  onRefresh: () => void;
  initialStatusFilter?: string;
}

export const ServiceWorkOrdersList: React.FC<ServiceWorkOrdersListProps> = ({
  workOrders,
  customers,
  equipments,
  technicians,
  selectedTicket,
  onSelectTicket,
  onOpenMobileMode,
  onGenerateInvoice,
  onRefresh,
  initialStatusFilter = 'all'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // New Ticket Form State
  const [newCustId, setNewCustId] = useState(customers[0]?.id || '');
  const [newEqId, setNewEqId] = useState(equipments[0]?.id || '');
  const [newTechId, setNewTechId] = useState(technicians[0]?.id || '');
  const [newPriority, setNewPriority] = useState<ServicePriority>('P2 - Urgent');
  const [newSlot, setNewSlot] = useState('10:00 AM - 12:30 PM');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSymptoms, setNewSymptoms] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');

  const filteredOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.equipmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.technicianName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'Pending' || statusFilter === 'pending'
        ? wo.status !== 'Completed' && wo.status !== 'Invoiced' && wo.status !== 'Cancelled'
        : wo.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === newCustId) || customers[0];
    const eq = equipments.find((e) => e.id === newEqId) || equipments[0];
    const tech = technicians.find((t) => t.id === newTechId) || technicians[0];

    const ticketNum = `SRV-${new Date().getFullYear()}-${String(workOrders.length + 105).padStart(4, '0')}`;

    const newOrder: ServiceWorkOrder = {
      id: `srv-${Date.now()}`,
      ticketNumber: ticketNum,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerAddress: cust.address,
      equipmentId: eq.id,
      equipmentTitle: `${eq.brand} ${eq.capacityTR}TR ${eq.type} (SN: ${eq.serialNumber})`,
      technicianId: tech.id,
      technicianName: tech.name,
      priority: newPriority,
      status: 'Scheduled',
      scheduledDate: newDate,
      scheduledTimeSlot: newSlot,
      estimatedDurationHours: 2.5,
      bufferMinutes: 30,
      symptomsReported: newSymptoms || 'Routine maintenance and inspection requested.',
      diagnosisNotes: newDiagnosis || 'Preliminary inspection pending on-site diagnostics.',
      workDoneSummary: '',
      checklist: [
        { id: 'chk-1', task: 'Check suction & discharge operating pressures', category: 'Refrigerant', completed: false },
        { id: 'chk-2', task: 'Measure compressor electrical running amp draw', category: 'Electrical', completed: false },
        { id: 'chk-3', task: 'Inspect contactor contacts & capacitor ratings', category: 'Electrical', completed: false },
        { id: 'chk-4', task: 'Wash and power-rinse condenser coil fins', category: 'Airflow', completed: false },
        { id: 'chk-5', task: 'Verify thermostat delta T (Supply vs Return Temp)', category: 'Safety', completed: false }
      ],
      partsUsed: [],
      laborHours: 2.0,
      laborRatePerHour: 1200,
      photos: [],
      timeTracking: {
        totalTravelMinutes: 0,
        totalLaborMinutes: 0
      },
      invoiceStatus: 'Unbilled',
      clientNotificationSent: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    serviceStorage.saveWorkOrder(newOrder);
    setIsCreateModalOpen(false);
    onRefresh();
    onSelectTicket(newOrder);
  };

  const handleStatusChange = (status: ServiceTicketStatus) => {
    if (!selectedTicket) return;
    serviceStorage.updateTicketStatus(selectedTicket.id, status);
    onRefresh();
    const updated = serviceStorage.getWorkOrderById(selectedTicket.id);
    if (updated) onSelectTicket(updated);
  };

  const handleToggleChecklist = (checkId: string) => {
    if (!selectedTicket) return;
    const updatedChecklist = selectedTicket.checklist.map((item) =>
      item.id === checkId ? { ...item, completed: !item.completed, status: (!item.completed ? 'Pass' : 'Attention Required') as any } : item
    );
    const updated = { ...selectedTicket, checklist: updatedChecklist };
    serviceStorage.saveWorkOrder(updated);
    onSelectTicket(updated);
    onRefresh();
  };

  return (
    <div className="space-y-5">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket #, client, equipment, tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="P1 - Emergency Breakdown">P1 Emergency</option>
            <option value="P2 - Urgent">P2 Urgent</option>
            <option value="P3 - Routine Maintenance">P3 Routine AMC</option>
            <option value="P4 - Inspection">P4 Inspection</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="En Route">En Route</option>
            <option value="On Site">On Site</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Invoiced">Invoiced</option>
          </select>

          {/* Create Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Work Order</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Orders Table & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table View */}
        <div className={`${selectedTicket ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>2. Service Work Orders Repository ({filteredOrders.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Click any row to inspect digital checklist & history</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="py-3 px-4">Ticket / Date</th>
                  <th className="py-3 px-4">Customer & Equipment</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching service tickets found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isSelected = selectedTicket?.id === order.id;
                    const priorityColor =
                      order.priority === 'P1 - Emergency Breakdown'
                        ? 'text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                        : order.priority === 'P2 - Urgent'
                        ? 'text-amber-600 font-semibold bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                        : 'text-blue-600 font-medium bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';

                    const statusBadge =
                      order.status === 'Completed' || order.status === 'Invoiced'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                        : order.status === 'In Progress' || order.status === 'On Site'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                        : order.status === 'En Route'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';

                    return (
                      <tr
                        key={order.id}
                        onClick={() => onSelectTicket(order)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/30'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-blue-600 dark:text-blue-400">{order.ticketNumber}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{order.scheduledDate}</div>
                        </td>
                        <td className="py-3 px-4 max-w-[200px]">
                          <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{order.customerName}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{order.equipmentTitle}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] border ${priorityColor}`}>
                            {order.priority.split(' - ')[0]}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{order.technicianName}</div>
                          <div className="text-[10px] text-slate-400">{order.scheduledTimeSlot}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTicket(order);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Eye className="w-4 h-4" />
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

        {/* Ticket Inspector Detail Drawer */}
        {selectedTicket && (
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                  {selectedTicket.ticketNumber}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {selectedTicket.status}
                </span>
              </div>
              <button
                onClick={() => onSelectTicket(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Quick Flow Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Update Ticket Status Workflow:
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {(['Scheduled', 'En Route', 'On Site', 'Completed'] as ServiceTicketStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${
                      selectedTicket.status === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Equipment Card */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100">{selectedTicket.customerName}</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">{selectedTicket.customerAddress}</div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Equipment:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTicket.equipmentTitle}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Assigned Tech:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedTicket.technicianName}</span>
              </div>
            </div>

            {/* Diagnosis & Reported Symptoms */}
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-slate-700 dark:text-slate-300">Symptoms & Diagnosis:</div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 text-slate-700 dark:text-slate-300 text-[11px]">
                <span className="font-semibold text-amber-900 dark:text-amber-200">Customer Reported:</span> {selectedTicket.symptomsReported}
              </div>
              {selectedTicket.diagnosisNotes && (
                <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 text-slate-700 dark:text-slate-300 text-[11px]">
                  <span className="font-semibold text-blue-900 dark:text-blue-200">Technician Diagnosis:</span> {selectedTicket.diagnosisNotes}
                </div>
              )}
            </div>

            {/* Digital Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Digital Service Checklist ({selectedTicket.checklist.filter((c) => c.completed).length}/{selectedTicket.checklist.length})
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {selectedTicket.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className={`p-2 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2 ${
                      item.completed
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      item.completed ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {item.completed && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[11px] font-medium leading-tight ${item.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.task}
                      </div>
                      {item.measurementValue && (
                        <div className="mt-1 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                          Reading: {item.measurementValue}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Consumed Truck Stock Parts & Labor */}
            {selectedTicket.partsUsed.length > 0 && (
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  Parts Consumed from Truck Stock:
                </span>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  {selectedTicket.partsUsed.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-300 truncate max-w-[180px]">{p.name} ({p.quantity} {p.unit})</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{p.totalCost.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Digital Signature Card if available */}
            {selectedTicket.signature && (
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5" />
                    Customer Digital Signoff Recorded
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    ★ {selectedTicket.signature.customerFeedbackScore} / 5 Rating
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  Signed by <span className="font-semibold">{selectedTicket.signature.signerName}</span> ({selectedTicket.signature.signerDesignation}) at {selectedTicket.signature.signedAt}
                </div>
                {selectedTicket.signature.customerComments && (
                  <div className="italic text-[10px] text-slate-500">
                    &ldquo;{selectedTicket.signature.customerComments}&rdquo;
                  </div>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => onOpenMobileMode(selectedTicket)}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open in Technician Mobile Field App</span>
              </button>

              <button
                onClick={() => onGenerateInvoice(selectedTicket)}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>{selectedTicket.invoiceStatus === 'Invoiced' ? 'View Tax Invoice' : 'Generate On-Site Tax Invoice (18% GST)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Create & Dispatch HVAC Service Ticket
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              {/* Customer */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Customer:</label>
                <select
                  value={newCustId}
                  onChange={(e) => setNewCustId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipment */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">HVAC Equipment Asset:</label>
                <select
                  value={newEqId}
                  onChange={(e) => setNewEqId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  {equipments.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.brand} {eq.capacityTR}TR {eq.type} (SN: {eq.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority & Tech */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority SLA:</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ServicePriority)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="P1 - Emergency Breakdown">P1 Emergency Breakdown</option>
                    <option value="P2 - Urgent">P2 Urgent</option>
                    <option value="P3 - Routine Maintenance">P3 Routine AMC</option>
                    <option value="P4 - Inspection">P4 Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Technician:</label>
                  <select
                    value={newTechId}
                    onChange={(e) => setNewTechId(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Scheduled Date:</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Time Slot Window:</label>
                  <input
                    type="text"
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value)}
                    placeholder="e.g. 10:00 AM - 12:30 PM"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Reported Symptoms */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reported Symptoms / Job Reason:</label>
                <textarea
                  rows={2}
                  value={newSymptoms}
                  onChange={(e) => setNewSymptoms(e.target.value)}
                  placeholder="e.g. High pressure tripping error code E4, cooling deficiency in Server Room..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Create & Dispatch Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
