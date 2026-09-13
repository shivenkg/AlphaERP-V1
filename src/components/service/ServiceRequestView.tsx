import React, { useState, useMemo } from 'react';
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Search,
  Plus,
  ArrowRight,
  ShieldAlert,
  Flame,
  UserCheck,
  Building2,
  Calendar,
  X,
  FileText,
  Trash2
} from 'lucide-react';
import {
  ServiceRequest,
  ServiceCustomer,
  ServiceEquipment,
  ServiceTechnician,
  ServiceRequestPriority,
  ServiceRequestStatus,
  ServiceRequestIssueCategory
} from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';

interface ServiceRequestViewProps {
  customers: ServiceCustomer[];
  equipments: ServiceEquipment[];
  technicians: ServiceTechnician[];
  onRefresh: () => void;
  onNavigateToWorkOrder?: (ticketId: string) => void;
  initialStatusFilter?: string;
}

const ISSUE_CATEGORIES: ServiceRequestIssueCategory[] = [
  'No Cooling / High Temperature',
  'Refrigerant Gas Leakage',
  'Water Dropping / Drain Choke',
  'Compressor Tripped / High Noise',
  'Electrical / MCB Tripping',
  'Thermostat & Controller Error',
  'Preventive AMC Breakdown Visit',
  'Vibration & Blower Issue',
  'Other Breakdown'
];

export const ServiceRequestView: React.FC<ServiceRequestViewProps> = ({
  customers,
  equipments,
  technicians,
  onRefresh,
  onNavigateToWorkOrder,
  initialStatusFilter = 'All'
}) => {
  const [requests, setRequests] = useState<ServiceRequest[]>(() => serviceStorage.getServiceRequests());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedRequestForConvert, setSelectedRequestForConvert] = useState<ServiceRequest | null>(null);

  // New Request Form State
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formEquipmentId, setFormEquipmentId] = useState('');
  const [formEquipmentName, setFormEquipmentName] = useState('');
  const [formIssueCategory, setFormIssueCategory] = useState<ServiceRequestIssueCategory>('No Cooling / High Temperature');
  const [formPriority, setFormPriority] = useState<ServiceRequestPriority>('P2 - Urgent');
  const [formSource, setFormSource] = useState<'Phone Call' | 'WhatsApp' | 'Customer Portal' | 'Email' | 'Site Inspection'>('Phone Call');
  const [formDescription, setFormDescription] = useState('');
  const [formPreferredDate, setFormPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPreferredSlot, setFormPreferredSlot] = useState('Morning 09:00 - 12:00');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formTechnicianId, setFormTechnicianId] = useState('');

  // Dispatch / Convert Form State
  const [convertTechId, setConvertTechId] = useState('');
  const [convertDate, setConvertDate] = useState(new Date().toISOString().split('T')[0]);
  const [convertSlot, setConvertSlot] = useState('Morning 09:00 - 12:00');

  const reloadRequests = () => {
    setRequests(serviceStorage.getServiceRequests());
    onRefresh();
  };

  // KPI calculations
  const totalOpen = requests.filter((r) => r.status !== 'Resolved' && r.status !== 'Cancelled').length;
  const p1EmergencyCount = requests.filter((r) => r.priority === 'P1 - Emergency Breakdown' && r.status !== 'Resolved').length;
  const inProgressCount = requests.filter((r) => r.status === 'In Progress' || r.status === 'Assigned' || r.status === 'En Route').length;
  const resolvedCount = requests.filter((r) => r.status === 'Resolved').length;

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        searchTerm === '' ||
        r.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.siteAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Pending'
          ? r.status !== 'Resolved' && r.status !== 'Cancelled'
          : r.status === statusFilter;
      const matchPriority = priorityFilter === 'All' || r.priority === priorityFilter;
      const matchCategory = categoryFilter === 'All' || r.issueCategory === categoryFilter;

      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [requests, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Handle customer selection in form
  const handleSelectCustomer = (custVal: string) => {
    setFormCustomerId(custVal);
    const cust = customers.find((c) => c.id === custVal);
    if (cust) {
      setFormContactPerson(cust.name);
      setFormContactPhone(cust.phone);
    }
  };

  // Available equipments for selected customer
  const customerEquipments = useMemo(() => {
    if (!formCustomerId) return equipments;
    return equipments.filter((e) => e.customerId === formCustomerId);
  }, [formCustomerId, equipments]);

  // Submit New Service Request
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === formCustomerId);
    if (!cust) {
      alert('Please select a customer.');
      return;
    }

    const selectedEq = equipments.find((eq) => eq.id === formEquipmentId);
    const assignedTech = technicians.find((t) => t.id === formTechnicianId);

    const seqNum = String(requests.length + 81).padStart(4, '0');
    const newReq: ServiceRequest = {
      id: `req-${Date.now()}`,
      requestNumber: `REQ-${new Date().getFullYear()}-${seqNum}`,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: formContactPhone || cust.phone,
      customerEmail: cust.email,
      siteAddress: cust.address,
      equipmentId: selectedEq?.id,
      equipmentName: selectedEq ? `${selectedEq.brand} ${selectedEq.modelNumber} (${selectedEq.capacityTR}TR)` : formEquipmentName || 'Central HVAC Plant',
      equipmentType: selectedEq?.type,
      equipmentSerialNumber: selectedEq?.serialNumber,
      issueCategory: formIssueCategory,
      priority: formPriority,
      status: formTechnicianId ? 'Assigned' : 'New',
      requestSource: formSource,
      description: formDescription,
      preferredDate: formPreferredDate,
      preferredSlot: formPreferredSlot,
      contactPerson: formContactPerson || cust.name,
      contactPersonPhone: formContactPhone || cust.phone,
      assignedTechnicianId: assignedTech?.id,
      assignedTechnicianName: assignedTech?.name,
      slaTargetMinutes: formPriority.includes('P1') ? 120 : formPriority.includes('P2') ? 360 : 1440,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    serviceStorage.saveServiceRequest(newReq);
    reloadRequests();
    setIsNewModalOpen(false);
    // Reset form
    setFormDescription('');
  };

  // Convert to Work Order
  const handleExecuteConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForConvert) return;

    const wo = serviceStorage.convertServiceRequestToWorkOrder(
      selectedRequestForConvert.id,
      convertTechId,
      convertDate,
      convertSlot
    );

    reloadRequests();
    setIsConvertModalOpen(false);
    setSelectedRequestForConvert(null);

    if (wo && onNavigateToWorkOrder) {
      onNavigateToWorkOrder(wo.id);
    }
  };

  // Quick Status change
  const handleStatusChange = (req: ServiceRequest, newStatus: ServiceRequestStatus) => {
    req.status = newStatus;
    if (newStatus === 'Resolved') {
      req.resolvedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      req.resolutionNotes = 'Marked as resolved by service dispatcher.';
    }
    serviceStorage.saveServiceRequest(req);
    reloadRequests();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Requests</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalOpen}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Customer reported issues</div>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">P1 Emergencies</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 animate-pulse">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-red-700 dark:text-red-300 mt-2">{p1EmergencyCount}</div>
          <div className="text-[11px] text-red-600/80 mt-0.5">&lt; 2 Hour SLA Commitment</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dispatched / Working</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{inProgressCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Field tech en route/on-site</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved Tickets</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{resolvedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Successfully closed</div>
        </div>
      </div>

      {/* Control Header & Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              Service Requests & Breakdown Triage
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Client HVAC breakdown intake, emergency dispatching, and ticket lifecycle tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Service Request</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ticket, client, unit, symptom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending (All Open / Active)</option>
              <option value="New">New Requests</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="P1 - Emergency Breakdown">P1 - Emergency (&lt;2h)</option>
              <option value="P2 - Urgent">P2 - Urgent (&lt;6h)</option>
              <option value="P3 - Routine">P3 - Routine (&lt;24h)</option>
              <option value="P4 - Low Priority">P4 - Low</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="All">All Issue Categories</option>
              {ISSUE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests Feed / List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Wrench className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No Service Requests Found</div>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or log a new service request.</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isP1 = req.priority.includes('P1');
            const isP2 = req.priority.includes('P2');
            const isResolved = req.status === 'Resolved';

            return (
              <div
                key={req.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                  isP1 && !isResolved
                    ? 'border-red-300 dark:border-red-900/60 shadow-xs ring-1 ring-red-200 dark:ring-red-900/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      {req.requestNumber}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isP1
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 animate-pulse'
                          : isP2
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isP1 ? <Flame className="w-3 h-3 text-red-600" /> : <Clock className="w-3 h-3" />}
                      {req.priority}
                    </span>

                    {/* Issue Category Pill */}
                    <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                      {req.issueCategory}
                    </span>

                    {/* Source */}
                    <span className="text-[10px] text-slate-400 font-medium">via {req.requestSource}</span>
                  </div>

                  {/* Status & Quick Status Switcher */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Status:</span>
                    <select
                      value={req.status}
                      onChange={(e) => handleStatusChange(req, e.target.value as ServiceRequestStatus)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                        req.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800'
                          : req.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800'
                          : req.status === 'Assigned'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800'
                          : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      <option value="New">New</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Main Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 text-xs">
                  {/* Customer & Location */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.customerName}</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{req.siteAddress}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${req.customerPhone}`}
                        className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline font-medium"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{req.customerPhone}</span>
                      </a>
                      <a
                        href={`https://wa.me/${req.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(req.customerName)},%20regarding%20Service%20Request%20${req.requestNumber}%20(${encodeURIComponent(req.equipmentName)}):%20Our%20technician%20has%20been%20updated.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:underline font-bold"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Equipment & Reported Symptoms */}
                  <div className="space-y-1 md:border-l md:border-slate-100 dark:md:border-slate-800 md:pl-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-blue-500" />
                      <span>{req.equipmentName}</span>
                    </div>
                    {req.equipmentSerialNumber && (
                      <div className="text-[11px] text-slate-400 font-mono">SN: {req.equipmentSerialNumber}</div>
                    )}
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg mt-1 border border-slate-100 dark:border-slate-800">
                      "{req.description}"
                    </p>
                  </div>

                  {/* Scheduling, Assignment & Action */}
                  <div className="space-y-1.5 md:border-l md:border-slate-100 dark:md:border-slate-800 md:pl-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Target Slot:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{req.preferredSlot}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-1">
                        <span className="text-slate-500">Assigned Tech:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {req.assignedTechnicianName || 'Unassigned'}
                        </span>
                      </div>
                      {req.workOrderTicketNumber && (
                        <div className="flex items-center justify-between text-[11px] mt-1">
                          <span className="text-slate-500">Work Order:</span>
                          <span className="font-mono text-emerald-600 font-bold">{req.workOrderTicketNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      {!req.workOrderId ? (
                        <button
                          onClick={() => {
                            setSelectedRequestForConvert(req);
                            setConvertTechId(req.assignedTechnicianId || technicians[0]?.id || '');
                            setConvertDate(req.preferredDate || new Date().toISOString().split('T')[0]);
                            setConvertSlot(req.preferredSlot || 'Morning 09:00 - 12:00');
                            setIsConvertModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Dispatch / Convert to WO</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigateToWorkOrder && onNavigateToWorkOrder(req.workOrderId!)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Work Order</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`Delete Service Request ${req.requestNumber}?`)) {
                            serviceStorage.deleteServiceRequest(req.id);
                            reloadRequests();
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Request"
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

      {/* Modal 1: Log New Service Request */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Log New Service Request</h3>
                  <p className="text-xs text-slate-500">Record customer HVAC malfunction or emergency service call</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              {/* Customer Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer / Facility <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select a Customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.companyName} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Equipment Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    HVAC Equipment / Unit
                  </label>
                  <select
                    value={formEquipmentId}
                    onChange={(e) => {
                      setFormEquipmentId(e.target.value);
                      const eq = equipments.find((x) => x.id === e.target.value);
                      if (eq) setFormEquipmentName(`${eq.brand} ${eq.modelNumber} (${eq.capacityTR}TR)`);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select Unit or Generic Plant...</option>
                    {customerEquipments.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.brand} {eq.type} ({eq.capacityTR}TR) - {eq.serialNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Issue Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formIssueCategory}
                    onChange={(e) => setFormIssueCategory(e.target.value as ServiceRequestIssueCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {ISSUE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority & Request Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority / SLA <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as ServiceRequestPriority)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none text-red-600"
                  >
                    <option value="P1 - Emergency Breakdown">P1 - Emergency Breakdown (&lt;2h SLA)</option>
                    <option value="P2 - Urgent">P2 - Urgent (&lt;6h SLA)</option>
                    <option value="P3 - Routine">P3 - Routine (&lt;24h SLA)</option>
                    <option value="P4 - Low Priority">P4 - Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Channel / Source</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Phone Call">Phone Call (Hotline)</option>
                    <option value="WhatsApp">WhatsApp Message</option>
                    <option value="Customer Portal">Customer Portal / Web</option>
                    <option value="Email">Email Support</option>
                    <option value="Site Inspection">Routine Site Inspection</option>
                  </select>
                </div>
              </div>

              {/* Symptoms Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reported Malfunction Symptoms & Client Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Master VRV tripping on error code U4. Server room temperature climbing to 28°C. Loud vibration on outdoor fan unit."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Scheduling & Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={formPreferredDate}
                    onChange={(e) => setFormPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Slot</label>
                  <select
                    value={formPreferredSlot}
                    onChange={(e) => setFormPreferredSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Immediate (Within 2 Hours)">Immediate (Within 2 Hours)</option>
                    <option value="Morning 09:00 - 12:00">Morning 09:00 - 12:00</option>
                    <option value="Afternoon 14:00 - 18:00">Afternoon 14:00 - 18:00</option>
                    <option value="Night Shift (22:00 - 04:00)">Night Shift (22:00 - 04:00)</option>
                  </select>
                </div>
              </div>

              {/* Initial Tech Assignment */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Lead Technician (Optional)
                </label>
                <select
                  value={formTechnicianId}
                  onChange={(e) => setFormTechnicianId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Leave Unassigned for Dispatch Queue</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status} - Van: {t.truckPlate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Save Service Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Convert to Work Order & Dispatch */}
      {isConvertModalOpen && selectedRequestForConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Convert to Work Order</h3>
                  <p className="text-xs text-slate-500">
                    Dispatch field team for {selectedRequestForConvert.requestNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">{selectedRequestForConvert.customerName}</div>
              <div className="text-slate-600 dark:text-slate-300">{selectedRequestForConvert.equipmentName}</div>
              <div className="text-[11px] text-slate-500">"{selectedRequestForConvert.description}"</div>
            </div>

            <form onSubmit={handleExecuteConvert} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Certified Field Technician <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={convertTechId}
                  onChange={(e) => setConvertTechId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — Status: {t.status} (Van: {t.truckPlate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dispatch Date</label>
                  <input
                    type="date"
                    required
                    value={convertDate}
                    onChange={(e) => setConvertDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
                  <select
                    value={convertSlot}
                    onChange={(e) => setConvertSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Immediate (Within 2 Hours)">Immediate (&lt; 2h)</option>
                    <option value="Morning 09:00 - 12:00">09:00 - 12:00</option>
                    <option value="Afternoon 14:00 - 18:00">14:00 - 18:00</option>
                    <option value="Night 22:00 - 04:00">22:00 - 04:00</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Dispatch & Create WO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
