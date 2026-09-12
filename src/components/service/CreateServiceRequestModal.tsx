import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  X,
  Building2,
  FolderKanban,
  Cpu,
  AlertTriangle,
  Clock,
  Flame,
  Calendar,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import {
  ServiceRequest,
  ServiceCustomer,
  ServiceEquipment,
  ServiceTechnician,
  ServiceRequestPriority,
  ServiceRequestIssueCategory
} from '../../types/service';
import { Project } from '../../types';
import { serviceStorage } from '../../services/serviceStorage';
import { storageService } from '../../services/storageService';

interface CreateServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedEquipmentId?: string | null;
  preselectedCustomerId?: string | null;
  preselectedProjectId?: string | null;
  onRequestCreated?: (newRequest: ServiceRequest) => void;
  onDispatchWorkOrder?: (ticketId: string) => void;
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

export const CreateServiceRequestModal: React.FC<CreateServiceRequestModalProps> = ({
  isOpen,
  onClose,
  preselectedEquipmentId,
  preselectedCustomerId,
  preselectedProjectId,
  onRequestCreated,
  onDispatchWorkOrder
}) => {
  // Master data
  const [customers, setCustomers] = useState<ServiceCustomer[]>([]);
  const [equipments, setEquipments] = useState<ServiceEquipment[]>([]);
  const [technicians, setTechnicians] = useState<ServiceTechnician[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [customEquipmentName, setCustomEquipmentName] = useState<string>('');
  const [siteAddress, setSiteAddress] = useState<string>('');
  const [issueCategory, setIssueCategory] = useState<ServiceRequestIssueCategory>('No Cooling / High Temperature');
  const [priority, setPriority] = useState<ServiceRequestPriority>('P2 - Urgent');
  const [requestSource, setRequestSource] = useState<'Phone Call' | 'WhatsApp' | 'Customer Portal' | 'Email' | 'Site Inspection'>('Phone Call');
  const [description, setDescription] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [preferredSlot, setPreferredSlot] = useState<string>('Morning 09:00 - 12:00');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState<string>('');
  const [autoDispatch, setAutoDispatch] = useState<boolean>(false);

  // Load Data
  useEffect(() => {
    if (isOpen) {
      setCustomers(serviceStorage.getCustomers());
      setEquipments(serviceStorage.getEquipments());
      setTechnicians(serviceStorage.getTechnicians());
      setProjects(storageService.getProjects());

      if (preselectedCustomerId) {
        setSelectedCustomerId(preselectedCustomerId);
      }
      if (preselectedEquipmentId) {
        setSelectedEquipmentId(preselectedEquipmentId);
      }
      if (preselectedProjectId) {
        setSelectedProjectId(preselectedProjectId);
      }
    }
  }, [isOpen, preselectedCustomerId, preselectedEquipmentId, preselectedProjectId]);

  // Handle Project Change
  const handleProjectSelect = (projId: string) => {
    setSelectedProjectId(projId);
    if (!projId) return;

    const proj = projects.find((p) => p.id === projId);
    if (proj) {
      // Find matching customer by client name
      const matchedCust = customers.find(
        (c) => c.name.toLowerCase().includes(proj.clientName.toLowerCase()) ||
               c.companyName.toLowerCase().includes(proj.clientName.toLowerCase())
      );

      if (matchedCust) {
        setSelectedCustomerId(matchedCust.id);
        setSiteAddress(matchedCust.address);
        setContactPerson(matchedCust.name);
        setContactPhone(matchedCust.phone);
        setContactEmail(matchedCust.email);
      }
    }
  };

  // Handle Customer Change
  const handleCustomerSelect = (custId: string) => {
    setSelectedCustomerId(custId);
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setSiteAddress(cust.address);
      setContactPerson(cust.name);
      setContactPhone(cust.phone);
      setContactEmail(cust.email);

      // Check if this customer has a matching project
      const matchedProj = projects.find(
        (p) => p.clientName.toLowerCase().includes(cust.name.toLowerCase()) ||
               p.clientName.toLowerCase().includes(cust.companyName.toLowerCase())
      );
      if (matchedProj && !selectedProjectId) {
        setSelectedProjectId(matchedProj.id);
      }
    }
  };

  // Handle Equipment Change
  const handleEquipmentSelect = (eqId: string) => {
    setSelectedEquipmentId(eqId);
    if (!eqId) return;

    const eq = equipments.find((e) => e.id === eqId);
    if (eq) {
      // Auto-set customer if not set
      if (!selectedCustomerId && eq.customerId) {
        handleCustomerSelect(eq.customerId);
      }
    }
  };

  // Filtered equipments based on selected customer
  const filteredEquipments = useMemo(() => {
    if (!selectedCustomerId) return equipments;
    return equipments.filter((e) => e.customerId === selectedCustomerId);
  }, [selectedCustomerId, equipments]);

  // Selected Equipment Detail
  const selectedEquipment = useMemo(() => {
    return equipments.find((e) => e.id === selectedEquipmentId);
  }, [selectedEquipmentId, equipments]);

  // Selected Project Detail
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId);
  }, [selectedProjectId, projects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cust = customers.find((c) => c.id === selectedCustomerId);
    const customerName = cust ? cust.name : (selectedProject?.clientName || 'Walk-in Client');
    const custPhone = contactPhone || (cust ? cust.phone : '+91 98000 00000');
    const custEmail = contactEmail || cust?.email;
    const finalAddress = siteAddress || (cust ? cust.address : 'Main Facility');

    const eqName = selectedEquipment
      ? `${selectedEquipment.brand} ${selectedEquipment.modelNumber} (${selectedEquipment.capacityTR}TR)`
      : customEquipmentName || 'Central HVAC Plant';

    const assignedTech = technicians.find((t) => t.id === assignedTechnicianId);

    const existingReqs = serviceStorage.getServiceRequests();
    const seqNum = String(existingReqs.length + 81).padStart(4, '0');
    const requestNumber = `REQ-${new Date().getFullYear()}-${seqNum}`;

    const newReq: ServiceRequest = {
      id: `req-${Date.now()}`,
      requestNumber,
      customerId: cust ? cust.id : `scust-${Date.now()}`,
      customerName,
      customerPhone: custPhone,
      customerEmail: custEmail,
      siteAddress: finalAddress,
      projectId: selectedProject?.id,
      projectNumber: selectedProject?.projectNumber || selectedProject?.projectCode,
      projectName: selectedProject?.projectName || selectedProject?.name,
      equipmentId: selectedEquipment?.id,
      equipmentName: eqName,
      equipmentType: selectedEquipment?.type,
      equipmentSerialNumber: selectedEquipment?.serialNumber,
      issueCategory,
      priority,
      status: assignedTech ? 'Assigned' : 'New',
      requestSource,
      description,
      preferredDate,
      preferredSlot,
      contactPerson: contactPerson || customerName,
      contactPersonPhone: custPhone,
      assignedTechnicianId: assignedTech?.id,
      assignedTechnicianName: assignedTech?.name,
      slaTargetMinutes: priority.includes('P1') ? 120 : priority.includes('P2') ? 360 : 1440,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    serviceStorage.saveServiceRequest(newReq);

    // Auto-dispatch work order if checked or P1 emergency
    if (autoDispatch) {
      const wo = serviceStorage.convertServiceRequestToWorkOrder(
        newReq.id,
        assignedTech?.id,
        preferredDate,
        preferredSlot
      );
      if (wo && onDispatchWorkOrder) {
        onDispatchWorkOrder(wo.id);
      }
    }

    if (onRequestCreated) {
      onRequestCreated(newReq);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-2xl shadow-2xl space-y-5 my-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Create Service Request
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Project & Asset Linked
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log HVAC breakdown or emergency repair linked directly to active projects and installed client assets.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Project & Client Asset Linkage */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                1. Project & Client Asset Record Linkage
              </span>
              <span className="text-[10px] text-slate-500">Auto-syncs customer & site specs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Linked Project Dropdown */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Link to Existing Project (Optional)
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none truncate"
                >
                  <option value="">None / Standalone Service Request</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.projectNumber || p.projectCode || 'PRJ'}] {p.projectName || p.name} — {p.clientName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer / Facility Selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer / Facility <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Customer Account...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.companyName} ({c.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Client Asset Record Dropdown */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Client HVAC Asset / Unit Record
              </label>
              <select
                value={selectedEquipmentId}
                onChange={(e) => handleEquipmentSelect(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select from Installed Assets or Specify Custom below...</option>
                {filteredEquipments.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.brand} {eq.modelNumber} ({eq.capacityTR}TR) — SN: {eq.serialNumber} [{eq.status} - {eq.amcType}]
                  </option>
                ))}
              </select>
            </div>

            {/* Asset Detail Card if an asset is selected */}
            {selectedEquipment ? (
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedEquipment.brand} {selectedEquipment.modelNumber} ({selectedEquipment.capacityTR}TR)
                    </span>
                    <span className="text-slate-500 ml-2 font-mono">SN: {selectedEquipment.serialNumber}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                    {selectedEquipment.status} • {selectedEquipment.amcType}
                  </span>
                  <span className="text-slate-500">Refrigerant: {selectedEquipment.refrigerantType}</span>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Or enter custom HVAC unit name (e.g. Server Room Split AC #2)"
                  value={customEquipmentName}
                  onChange={(e) => setCustomEquipmentName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                />
              </div>
            )}
          </div>

          {/* Section 2: Malfunction Details & Issue Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Issue / Malfunction Category <span className="text-red-500">*</span>
              </label>
              <select
                value={issueCategory}
                onChange={(e) => setIssueCategory(e.target.value as ServiceRequestIssueCategory)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority & SLA Commitment <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ServiceRequestPriority)}
                className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  priority.includes('P1')
                    ? 'border-red-400 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20'
                    : priority.includes('P2')
                    ? 'border-amber-400 text-amber-700 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <option value="P1 - Emergency Breakdown">P1 - Emergency Breakdown (&lt; 2h SLA)</option>
                <option value="P2 - Urgent">P2 - Urgent (&lt; 6h SLA)</option>
                <option value="P3 - Routine">P3 - Routine (&lt; 24h SLA)</option>
                <option value="P4 - Low Priority">P4 - Low Priority</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reported Symptoms & Diagnostic Details <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Master chiller tripping on high discharge temperature (108°C). Chilled water temp rising from 7°C to 12°C across trading floors. Error code U4 displayed."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Section 3: Scheduling & Dispatch Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Channel / Source</label>
              <select
                value={requestSource}
                onChange={(e) => setRequestSource(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Phone Call">Phone Call (Hotline)</option>
                <option value="WhatsApp">WhatsApp Message</option>
                <option value="Customer Portal">Customer Web Portal</option>
                <option value="Email">Email Desk</option>
                <option value="Site Inspection">On-Site Routine Survey</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Date</label>
              <input
                type="date"
                required
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Time Slot</label>
              <select
                value={preferredSlot}
                onChange={(e) => setPreferredSlot(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Immediate (Within 2 Hours)">Immediate (Within 2 Hours)</option>
                <option value="Morning 09:00 - 12:00">Morning 09:00 - 12:00</option>
                <option value="Afternoon 14:00 - 18:00">Afternoon 14:00 - 18:00</option>
                <option value="Night Shift (22:00 - 04:00)">Night Shift (22:00 - 04:00)</option>
              </select>
            </div>
          </div>

          {/* Site Address & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Site Address</label>
              <input
                type="text"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                placeholder="e.g. Bandra Kurla Complex, Mumbai"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Site Contact Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Field Technician Assignment */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assign Certified Field Technician (Optional)
            </label>
            <select
              value={assignedTechnicianId}
              onChange={(e) => setAssignedTechnicianId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Queue for Dispatcher Assignment</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — Status: {t.status} (Van: {t.truckPlate})
                </option>
              ))}
            </select>
          </div>

          {/* Auto-Dispatch Option */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">Auto-generate Field Work Order</div>
              <div className="text-[11px] text-slate-500">
                Immediately creates a formal Work Order ticket & schedules the technician
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoDispatch}
                onChange={(e) => setAutoDispatch(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Log Service Request</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
