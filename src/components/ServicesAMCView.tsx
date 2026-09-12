import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  Wrench,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Plus,
  Filter,
  DollarSign,
  Building2,
  Phone,
  Mail,
  User,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  Printer,
  ChevronRight,
  Tag,
  Eye,
  Edit2,
  Trash2,
  Award,
  RefreshCw,
  Zap,
  Sliders,
  LifeBuoy,
  Smartphone,
  Navigation,
  Camera,
  Check,
  Star,
  Truck,
  BarChart3,
  MapPin,
  Play,
  Square,
  Send,
  Download,
  Wifi,
  WifiOff,
  Cpu,
  Receipt
} from 'lucide-react';
import {
  AmcContract,
  AmcContractType,
  AmcStatus,
  PpmScheduleVisit,
  BreakdownTicket,
  ServiceEquipmentItem,
  ClientMaster,
  Project,
  InventoryItem,
  UserRole
} from '../types';
import { storageService } from '../services/storageService';
import {
  validateMobile,
  formatMobileInput,
  validateEmail,
  validateDateRange,
  validatePositiveNumber,
  getTodayDateString
} from '../utils/validation';

interface ServicesAMCViewProps {
  amcContracts: AmcContract[];
  ppmVisits: PpmScheduleVisit[];
  breakdownTickets: BreakdownTicket[];
  clients?: ClientMaster[];
  projects?: Project[];
  inventory?: InventoryItem[];
  currentRole?: UserRole;
  onOpenSheetsModal?: () => void;
  onNavigateToQuotes?: () => void;
}

// Truck stock inventory item structure
interface TruckStockItem {
  id: string;
  technicianName: string;
  vanNumber: string;
  sku: string;
  itemName: string;
  qty: number;
  unit: string;
  reorderAlert: number;
}

export const ServicesAMCView: React.FC<ServicesAMCViewProps> = ({
  amcContracts = [],
  ppmVisits = [],
  breakdownTickets = [],
  clients = [],
  projects = [],
  inventory = [],
  currentRole,
  onOpenSheetsModal,
  onNavigateToQuotes
}) => {
  // Navigation Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<
    'contracts' | 'scheduler' | 'breakdowns' | 'assets' | 'mobile_field' | 'truck_stock' | 'analytics'
  >('contracts');

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedTechFilter, setSelectedTechFilter] = useState<string>('ALL');

  // Modals state
  const [isNewContractOpen, setIsNewContractOpen] = useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedContractForView, setSelectedContractForView] = useState<AmcContract | null>(null);
  const [selectedPpmForChecklist, setSelectedPpmForChecklist] = useState<PpmScheduleVisit | null>(null);
  const [isMobileCockpitOpen, setIsMobileCockpitOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceTicket, setSelectedInvoiceTicket] = useState<BreakdownTicket | null>(null);

  // Mobile Cockpit Field Tech Active State
  const [activeJobTimer, setActiveJobTimer] = useState<number>(0);
  const [isJobTimerRunning, setIsJobTimerRunning] = useState(false);
  const [customerSignName, setCustomerSignName] = useState('');
  const [customerRating, setCustomerRating] = useState(5);
  const [beforePhotoUploaded, setBeforePhotoUploaded] = useState(true);
  const [afterPhotoUploaded, setAfterPhotoUploaded] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Timer Effect for Mobile Field Tech
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isJobTimerRunning) {
      interval = setInterval(() => {
        setActiveJobTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isJobTimerRunning]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Form State: New Contract
  const [newContractForm, setNewContractForm] = useState<{
    clientName: string;
    companyName: string;
    siteAddress: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
    contractType: AmcContractType;
    systemType: string;
    annualContractValue: number;
    billingFrequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annually';
    serviceFrequency: 'Monthly' | 'Quarterly' | 'Bi-Monthly';
    startDate: string;
    endDate: string;
    slaResponseHours: number;
    assignedLeadTechnician: string;
    technicianPhone: string;
    equipmentCount: number;
    notes: string;
  }>({
    clientName: '',
    companyName: '',
    siteAddress: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    contractType: 'Comprehensive',
    systemType: 'VRV / VRF Systems',
    annualContractValue: 500000,
    billingFrequency: 'Quarterly',
    serviceFrequency: 'Quarterly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    slaResponseHours: 2,
    assignedLeadTechnician: 'Dinesh Sawant',
    technicianPhone: '+91 98332 99812',
    equipmentCount: 4,
    notes: 'HVAC maintenance service contract with OEM genuine parts and periodic PPM visits.'
  });

  // Form State: New Breakdown Ticket
  const [newTicketForm, setNewTicketForm] = useState<{
    contractId: string;
    clientName: string;
    siteAddress: string;
    contactPhone: string;
    reportedIssue: string;
    systemType: string;
    priority: 'Critical 24x7' | 'High' | 'Medium' | 'Low';
    assignedTechnician: string;
  }>({
    contractId: amcContracts[0]?.id || '',
    clientName: amcContracts[0]?.clientName || '',
    siteAddress: amcContracts[0]?.siteAddress || '',
    contactPhone: amcContracts[0]?.contactPhone || '',
    reportedIssue: '',
    systemType: amcContracts[0]?.systemType || 'VRV / VRF Systems',
    priority: 'High',
    assignedTechnician: 'Dinesh Sawant'
  });

  // Sample Technician Van / Truck Stock
  const [truckStocks, setTruckStocks] = useState<TruckStockItem[]>([
    { id: 'ts-1', technicianName: 'Dinesh Sawant', vanNumber: 'MH-02-CW-4491', sku: 'R410A-CYL', itemName: 'R410A Refrigerant Cylinder (10kg)', qty: 2, unit: 'Cyl', reorderAlert: 1 },
    { id: 'ts-2', technicianName: 'Dinesh Sawant', vanNumber: 'MH-02-CW-4491', sku: 'FLT-SW-DK', itemName: 'Daikin OEM Float Switch Kit', qty: 3, unit: 'Nos', reorderAlert: 1 },
    { id: 'ts-3', technicianName: 'Dinesh Sawant', vanNumber: 'MH-02-CW-4491', sku: 'CAP-DUAL-50', itemName: 'Dual Run Capacitor 50/5 MFD 440V', qty: 4, unit: 'Nos', reorderAlert: 2 },
    { id: 'ts-4', technicianName: 'Dinesh Sawant', vanNumber: 'MH-02-CW-4491', sku: 'FLARE-NUT-58', itemName: 'Forged Brass Flare Nut 5/8"', qty: 12, unit: 'Nos', reorderAlert: 5 },
    { id: 'ts-5', technicianName: 'Suresh Gaikwad', vanNumber: 'MH-02-BK-8812', sku: 'CHILL-OIL-TRN', itemName: 'Trane Synthetic Chiller Oil (5L)', qty: 3, unit: 'Cans', reorderAlert: 1 },
    { id: 'ts-6', technicianName: 'Suresh Gaikwad', vanNumber: 'MH-02-BK-8812', sku: 'RTD-SEN-PT100', itemName: 'Chilled Water RTD Temp Sensor Pt100', qty: 2, unit: 'Nos', reorderAlert: 1 },
    { id: 'ts-7', technicianName: 'Amit Patil', vanNumber: 'MH-04-AX-1029', sku: 'STZ-CYL-15', itemName: 'Stulz Steam Humidifier Cylinder 15kg', qty: 1, unit: 'Nos', reorderAlert: 1 },
    { id: 'ts-8', technicianName: 'Amit Patil', vanNumber: 'MH-04-AX-1029', sku: 'SOL-VALVE-24V', itemName: 'Water Inlet Solenoid Valve 24VAC', qty: 3, unit: 'Nos', reorderAlert: 1 }
  ]);

  // Technicians Dispatch Fleet Status
  const technicianFleet = useMemo(() => [
    {
      name: 'Dinesh Sawant',
      phone: '+91 98332 99812',
      status: 'On Site',
      statusColor: 'bg-amber-500',
      currentJob: 'SRV-2026-081 (One BKC Tower)',
      location: 'BKC G-Block, Mumbai (GPS Active)',
      eta: 'On Site (42 mins elapsed)',
      activeTickets: 2,
      completedToday: 1,
      rating: 4.9
    },
    {
      name: 'Suresh Gaikwad',
      phone: '+91 98211 44556',
      status: 'En Route',
      statusColor: 'bg-blue-500',
      currentJob: 'PPM-2026-013 (Lilavati Hospital)',
      location: 'Western Express Highway (Moving North)',
      eta: '18 mins (2.4 km)',
      activeTickets: 1,
      completedToday: 2,
      rating: 4.8
    },
    {
      name: 'Amit Patil',
      phone: '+91 98199 88771',
      status: 'Available',
      statusColor: 'bg-emerald-500',
      currentJob: 'Idle / Ready for Dispatch',
      location: 'Central Warehouse Airoli',
      eta: 'Ready',
      activeTickets: 0,
      completedToday: 2,
      rating: 5.0
    }
  ], []);

  // Calculate High-level Summary Metrics
  const metrics = useMemo(() => {
    const totalACV = amcContracts.reduce((sum, c) => sum + (c.status === 'Active' ? c.annualContractValue : 0), 0);
    const activeContractsCount = amcContracts.filter((c) => c.status === 'Active').length;
    const pendingRenewalCount = amcContracts.filter((c) => c.status === 'Pending Renewal').length;
    const totalEquipment = amcContracts.reduce((sum, c) => sum + (c.equipmentCount || (c.equipmentList?.length || 0)), 0);
    
    const totalPpmScheduled = ppmVisits.length;
    const completedPpm = ppmVisits.filter((p) => p.status === 'Completed').length;
    
    const openTickets = breakdownTickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed');
    const criticalTickets = openTickets.filter((t) => t.priority === 'Critical 24x7');

    return {
      totalACV,
      activeContractsCount,
      pendingRenewalCount,
      totalEquipment,
      totalPpmScheduled,
      completedPpm,
      openTicketsCount: openTickets.length,
      criticalTicketsCount: criticalTickets.length
    };
  }, [amcContracts, ppmVisits, breakdownTickets]);

  // Filtered Contracts
  const filteredContracts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return amcContracts.filter((c) => {
      const matchesSearch =
        !query ||
        c.contractNumber.toLowerCase().includes(query) ||
        c.clientName.toLowerCase().includes(query) ||
        c.companyName.toLowerCase().includes(query) ||
        c.systemType.toLowerCase().includes(query) ||
        c.assignedLeadTechnician.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || c.contractType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [amcContracts, searchQuery, statusFilter, typeFilter]);

  // Filtered PPM Visits
  const filteredPpmVisits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ppmVisits.filter((p) => {
      const matchesSearch =
        !query ||
        p.visitNumber.toLowerCase().includes(query) ||
        p.contractNumber.toLowerCase().includes(query) ||
        p.clientName.toLowerCase().includes(query) ||
        p.assignedTechnician.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ppmVisits, searchQuery, statusFilter]);

  // Filtered Breakdown Tickets
  const filteredBreakdownTickets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return breakdownTickets.filter((t) => {
      const matchesSearch =
        !query ||
        t.ticketNumber.toLowerCase().includes(query) ||
        t.clientName.toLowerCase().includes(query) ||
        t.reportedIssue.toLowerCase().includes(query) ||
        t.assignedTechnician.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesTech = selectedTechFilter === 'ALL' || t.assignedTechnician === selectedTechFilter;
      return matchesSearch && matchesStatus && matchesTech;
    });
  }, [breakdownTickets, searchQuery, statusFilter, selectedTechFilter]);

  // All registered equipment assets across contracts
  const allEquipmentAssets = useMemo(() => {
    const list: {
      equipment: ServiceEquipmentItem;
      contractNumber: string;
      clientName: string;
      siteAddress: string;
      contractType: string;
    }[] = [];

    amcContracts.forEach((c) => {
      (c.equipmentList || []).forEach((eq) => {
        list.push({
          equipment: eq,
          contractNumber: c.contractNumber,
          clientName: c.clientName,
          siteAddress: c.siteAddress,
          contractType: c.contractType
        });
      });
    });

    const query = searchQuery.trim().toLowerCase();
    return list.filter((item) => {
      if (!query) return true;
      return (
        item.equipment.tagNumber.toLowerCase().includes(query) ||
        item.equipment.equipmentType.toLowerCase().includes(query) ||
        item.equipment.brand.toLowerCase().includes(query) ||
        item.equipment.modelNumber.toLowerCase().includes(query) ||
        item.clientName.toLowerCase().includes(query)
      );
    });
  }, [amcContracts, searchQuery]);

  // Error States for Modals
  const [contractFormError, setContractFormError] = useState<string | null>(null);
  const [ticketFormError, setTicketFormError] = useState<string | null>(null);

  // Handle Save New AMC Contract
  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    setContractFormError(null);

    if (!newContractForm.clientName.trim()) {
      setContractFormError('Client name is required.');
      return;
    }
    const phoneCheck = validateMobile(newContractForm.contactPhone, true);
    if (!phoneCheck.isValid) {
      setContractFormError(phoneCheck.message || 'Please enter a valid 10-digit mobile number.');
      return;
    }
    const emailCheck = validateEmail(newContractForm.contactEmail, false);
    if (!emailCheck.isValid) {
      setContractFormError(emailCheck.message || 'Please enter a valid email address.');
      return;
    }
    const dateRangeCheck = validateDateRange(newContractForm.startDate, newContractForm.endDate, 'Contract');
    if (!dateRangeCheck.isValid) {
      setContractFormError(dateRangeCheck.message || 'End date cannot be earlier than start date.');
      return;
    }
    const acvCheck = validatePositiveNumber(newContractForm.annualContractValue, 'Annual Contract Value');
    if (!acvCheck.isValid) {
      setContractFormError(acvCheck.message || 'Annual Contract Value must be greater than 0.');
      return;
    }
    const slaCheck = validatePositiveNumber(newContractForm.slaResponseHours, 'SLA Response Hours');
    if (!slaCheck.isValid) {
      setContractFormError(slaCheck.message || 'SLA Response Hours must be greater than 0.');
      return;
    }

    const dummyEquipment: ServiceEquipmentItem[] = Array.from({ length: newContractForm.equipmentCount || 2 }).map((_, i) => ({
      id: `eq-${Date.now()}-${i}`,
      tagNumber: `EQUIP-0${i + 1}`,
      equipmentType: `${newContractForm.systemType} Unit`,
      brand: 'Daikin / Carrier',
      modelNumber: 'STD-2026',
      capacityTR: 10,
      locationFloor: `Floor ${i + 1}`,
      condition: 'Excellent',
      lastServiceDate: newContractForm.startDate
    }));

    storageService.addAmcContract({
      clientName: newContractForm.clientName.trim(),
      companyName: (newContractForm.companyName || newContractForm.clientName).trim(),
      siteAddress: newContractForm.siteAddress.trim(),
      contactPerson: newContractForm.contactPerson.trim(),
      contactPhone: phoneCheck.cleanNumber,
      contactEmail: newContractForm.contactEmail.trim(),
      contractType: newContractForm.contractType,
      systemType: newContractForm.systemType,
      equipmentCount: newContractForm.equipmentCount,
      equipmentList: dummyEquipment,
      startDate: newContractForm.startDate,
      endDate: newContractForm.endDate,
      billingFrequency: newContractForm.billingFrequency,
      annualContractValue: Number(newContractForm.annualContractValue) || 0,
      billedAmount: 0,
      receivedAmount: 0,
      serviceFrequency: newContractForm.serviceFrequency,
      slaResponseHours: Number(newContractForm.slaResponseHours) || 2,
      status: 'Active',
      assignedLeadTechnician: newContractForm.assignedLeadTechnician,
      technicianPhone: newContractForm.technicianPhone,
      ppmVisitsCompleted: 0,
      ppmVisitsTotal: newContractForm.serviceFrequency === 'Monthly' ? 12 : newContractForm.serviceFrequency === 'Bi-Monthly' ? 6 : 4,
      notes: newContractForm.notes
    });

    setIsNewContractOpen(false);
  };

  // Handle Save New Breakdown Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketFormError(null);

    if (!newTicketForm.clientName.trim()) {
      setTicketFormError('Client / Site name is required.');
      return;
    }
    if (!newTicketForm.reportedIssue.trim()) {
      setTicketFormError('Reported issue description is required.');
      return;
    }
    const phoneCheck = validateMobile(newTicketForm.contactPhone, false);
    if (!phoneCheck.isValid) {
      setTicketFormError(phoneCheck.message || 'Please enter a valid 10-digit contact mobile number.');
      return;
    }

    storageService.addBreakdownTicket({
      contractId: newTicketForm.contractId,
      contractNumber: amcContracts.find((c) => c.id === newTicketForm.contractId)?.contractNumber,
      clientName: newTicketForm.clientName.trim(),
      siteAddress: newTicketForm.siteAddress.trim(),
      contactPhone: phoneCheck.cleanNumber || newTicketForm.contactPhone,
      reportedIssue: newTicketForm.reportedIssue.trim(),
      systemType: newTicketForm.systemType,
      priority: newTicketForm.priority,
      status: 'Open',
      assignedTechnician: newTicketForm.assignedTechnician,
      billableAmount: 0
    });

    setIsNewTicketOpen(false);
    setNewTicketForm({
      contractId: '',
      clientName: '',
      siteAddress: '',
      contactPhone: '',
      reportedIssue: '',
      systemType: 'VRV / VRF Systems',
      priority: 'High',
      assignedTechnician: 'Dinesh Sawant'
    });
  };

  // Quick Status updates
  const handleUpdateTicketStatus = (ticketId: string, status: BreakdownTicket['status']) => {
    storageService.updateBreakdownTicket(ticketId, {
      status,
      resolvedAt: status === 'Resolved' || status === 'Closed' ? new Date().toISOString() : undefined
    });
  };

  const handleUpdatePpmStatus = (ppmId: string, status: PpmScheduleVisit['status']) => {
    storageService.updatePpmVisit(ppmId, {
      status,
      completedDate: status === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
    });
  };

  const statusStyles: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    'Pending Renewal': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Expired: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    Terminated: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    Overdue: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    Open: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    Dispatched: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    'Work In Progress': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    Closed: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Page Header & Action Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Services & Annual Maintenance Contracts (AMC)
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {metrics.activeContractsCount} Active AMCs
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  End-to-End HVAC Field Service Suite: Drag & drop dispatching, mobile tech cockpit, truck stock & recurring AMC billing.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsMobileCockpitOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Tech Mobile Cockpit</span>
            </button>

            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Log Breakdown Ticket</span>
            </button>

            <button
              onClick={() => setIsNewContractOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New AMC Contract</span>
            </button>
          </div>
        </div>

        {/* 2. Top Metric KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Contract Value (ARR)
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
              ₹{(metrics.totalACV / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{metrics.activeContractsCount} contracts active</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Equipment Under Care
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
              {metrics.totalEquipment} Units Covered
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
              Chillers, VRV/VRF, AHUs & PACs
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              PPM Service Completion
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
              {metrics.completedPpm} / {metrics.totalPpmScheduled} Visits
            </div>
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
              {metrics.totalPpmScheduled > 0 ? Math.round((metrics.completedPpm / metrics.totalPpmScheduled) * 100) : 100}% compliance rate
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Emergency Breakdown Desk
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
              <span>{metrics.openTicketsCount} Open Tickets</span>
              {metrics.criticalTicketsCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white rounded text-[10px] font-black animate-pulse">
                  {metrics.criticalTicketsCount} CRITICAL
                </span>
              )}
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
              Avg SLA Response: &lt; 2.0 hrs
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs (All 7 Feature Pillars) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => {
              setActiveSubTab('contracts');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'contracts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AMC Contracts</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeSubTab === 'contracts' ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
              {amcContracts.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('scheduler');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'scheduler'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Dispatch & GPS Board</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('breakdowns');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'breakdowns'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Breakdown Tickets</span>
            {metrics.openTicketsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                {metrics.openTicketsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveSubTab('truck_stock');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'truck_stock'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Van / Truck Stock</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('assets');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'assets'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Equipment Registry</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('analytics');
              setStatusFilter('ALL');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Tech Analytics</span>
          </button>
        </div>

        {/* Global Search within Services */}
        <div className="relative min-w-[220px] max-w-xs">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeSubTab}...`}
            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium placeholder-slate-400"
          />
        </div>
      </div>

      {/* 4. SubTab 1: AMC Contracts Hub */}
      {activeSubTab === 'contracts' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
              <div className="flex items-center gap-1">
                {['ALL', 'Active', 'Pending Renewal', 'Expired'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Contract Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
              >
                <option value="ALL">All Types</option>
                <option value="Comprehensive">Comprehensive</option>
                <option value="Non-Comprehensive (Labor Only)">Non-Comprehensive (Labor Only)</option>
                <option value="Semi-Comprehensive">Semi-Comprehensive</option>
                <option value="Preventive Only">Preventive Only</option>
              </select>
            </div>
          </div>

          {/* Contracts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredContracts.map((c) => {
              const progressPct = c.ppmVisitsTotal > 0 ? Math.round((c.ppmVisitsCompleted / c.ppmVisitsTotal) * 100) : 0;
              return (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                          {c.contractNumber}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusStyles[c.status]}`}>
                          {c.status}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          {c.contractType}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                        {c.clientName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium line-clamp-1">
                        {c.siteAddress}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-400 uppercase">Annual Value</div>
                      <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        ₹{c.annualContractValue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">Billed: {c.billingFrequency}</div>
                    </div>
                  </div>

                  {/* Highlights Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">System Type</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{c.systemType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lead Technician</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{c.assignedLeadTechnician}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Emergency SLA</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{c.slaResponseHours} Hours</span>
                    </div>
                  </div>

                  {/* PPM Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        PPM Service Completion ({c.ppmVisitsCompleted}/{c.ppmVisitsTotal} Visits)
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Equipment Preview Tags */}
                  {c.equipmentList && c.equipmentList.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-semibold text-slate-400">Covered Units:</span>
                      {c.equipmentList.slice(0, 3).map((eq) => (
                        <span
                          key={eq.id}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {eq.tagNumber} ({eq.capacityTR} TR {eq.brand})
                        </span>
                      ))}
                      {c.equipmentList.length > 3 && (
                        <span className="text-[10px] text-blue-600 font-bold">
                          +{c.equipmentList.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="text-[11px] text-slate-500 font-medium">
                      Valid: <span className="font-semibold text-slate-700 dark:text-slate-300">{c.startDate}</span> to{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{c.endDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedContractForView(c)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Contract</span>
                      </button>

                      {c.status === 'Pending Renewal' && onNavigateToQuotes && (
                        <button
                          onClick={onNavigateToQuotes}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors shadow-xs cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Renew Quote</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SubTab 2: Dispatcher & GPS Fleet Board */}
      {activeSubTab === 'scheduler' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Live Field Dispatch & Technician GPS Fleet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time technician tracking, travel route ETA, and drag-and-drop job assignment queue.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live GPS Active
                </span>
              </div>
            </div>

            {/* Technician Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {technicianFleet.map((tech, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        {tech.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{tech.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{tech.phone}</div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white ${tech.statusColor}`}>
                      {tech.status}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Current Assignment</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{tech.currentJob}</div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 pt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{tech.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <div>ETA: <strong className="text-slate-800 dark:text-slate-200">{tech.eta}</strong></div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{tech.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PPM Scheduled Calendar / Timeline List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              Preventive Maintenance (PPM) Dispatch Queue
            </h4>
            {filteredPpmVisits.map((ppm) => (
              <div
                key={ppm.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                      {ppm.visitNumber}
                    </span>
                    <span className="font-mono text-xs text-slate-500">{ppm.contractNumber}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusStyles[ppm.status]}`}>
                      {ppm.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ppm.clientName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{ppm.siteAddress}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <div>Date: <strong>{ppm.scheduledDate}</strong></div>
                    <div>Assigned Tech: <strong>{ppm.assignedTechnician}</strong></div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPpmForChecklist(ppm)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Checklist</span>
                  </button>
                  {ppm.status !== 'Completed' && (
                    <button
                      onClick={() => handleUpdatePpmStatus(ppm.id, 'Completed')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SubTab 3: Breakdown & Emergency Desk */}
      {activeSubTab === 'breakdowns' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Status Filter:</span>
              {['ALL', 'Open', 'Work In Progress', 'Resolved', 'Closed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsNewTicketOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Raise Ticket</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBreakdownTickets.map((tkt) => (
              <div
                key={tkt.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                      {tkt.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        tkt.priority === 'Critical 24x7'
                          ? 'bg-rose-500 text-white'
                          : tkt.priority === 'High'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {tkt.priority}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {tkt.clientName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{tkt.siteAddress}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Issue Reported</span>
                    {tkt.reportedIssue}
                  </div>

                  {tkt.resolutionNotes && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Resolution</span>
                      {tkt.resolutionNotes}
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-slate-500">
                    <div>Technician: <strong className="text-slate-800 dark:text-slate-200">{tkt.assignedTechnician}</strong></div>
                    <div>Reported: <strong className="text-slate-800 dark:text-slate-200">{new Date(tkt.reportedAt).toLocaleString()}</strong></div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusStyles[tkt.status]}`}>
                    {tkt.status}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedInvoiceTicket(tkt);
                        setIsInvoiceModalOpen(true);
                      }}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs"
                      title="Generate Service Invoice"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>

                    <select
                      value={tkt.status}
                      onChange={(e) => handleUpdateTicketStatus(tkt.id, e.target.value as BreakdownTicket['status'])}
                      className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Work In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SubTab 4: Van & Truck Stock Inventory */}
      {activeSubTab === 'truck_stock' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Service Van & Field Truck Stock</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mobile inventory carried in technician vans for first-time-fix completion.</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold border border-blue-200">
              {truckStocks.length} Van SKUs Tracked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Van / Technician</th>
                  <th className="py-3 px-3">Item SKU</th>
                  <th className="py-3 px-3">Item Name & Specs</th>
                  <th className="py-3 px-3">Stock on Van</th>
                  <th className="py-3 px-3">Reorder Alert</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {truckStocks.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.technicianName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{item.vanNumber}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{item.sku}</td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">{item.itemName}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        item.qty <= item.reorderAlert ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.qty} {item.unit}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-medium">&lt;= {item.reorderAlert} {item.unit}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setTruckStocks(truckStocks.map(s => s.id === item.id ? { ...s, qty: s.qty + 2 } : s));
                        }}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded font-semibold text-[10px] cursor-pointer"
                      >
                        + Restock 2
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. SubTab 5: Equipment Asset Registry */}
      {activeSubTab === 'assets' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">HVAC Plant & Asset Registry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">All registered Chillers, VRV/VRF outdoor units, AHUs & PACs under maintenance.</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold">
              {allEquipmentAssets.length} Assets Registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Asset Tag</th>
                  <th className="py-3 px-3">Equipment Type</th>
                  <th className="py-3 px-3">Brand & Model</th>
                  <th className="py-3 px-3">Capacity (TR)</th>
                  <th className="py-3 px-3">Location Floor</th>
                  <th className="py-3 px-3">Client & Contract</th>
                  <th className="py-3 px-3">Health Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allEquipmentAssets.map(({ equipment, contractNumber, clientName }) => (
                  <tr key={equipment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {equipment.tagNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                      {equipment.equipmentType}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      <strong>{equipment.brand}</strong> ({equipment.modelNumber})
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {equipment.capacityTR} TR
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {equipment.locationFloor}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{clientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{contractNumber}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          equipment.condition === 'Excellent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : equipment.condition === 'Good'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {equipment.condition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. SubTab 6: Technician Analytics & Performance */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">First Time Fix Rate (FTFR)</span>
              <div className="text-2xl font-black text-emerald-600">94.8%</div>
              <p className="text-[11px] text-slate-500">Benchmark: &gt; 90% (World Class)</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Mean Time To Resolution (MTTR)</span>
              <div className="text-2xl font-black text-blue-600">1.8 Hours</div>
              <p className="text-[11px] text-slate-500">Emergency SLA Compliance: 99.2%</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-400">Customer CSAT Score</span>
              <div className="text-2xl font-black text-amber-500 flex items-center gap-1.5">
                <span>4.9 / 5.0</span>
                <Star className="w-5 h-5 fill-amber-500" />
              </div>
              <p className="text-[11px] text-slate-500">Based on 142 digital signoffs</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Technician Leaderboard & Productivity</h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {technicianFleet.map((tech, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-400 w-4">#{idx + 1}</span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{tech.name}</div>
                      <div className="text-[10px] text-slate-400">{tech.completedToday} jobs completed today</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">{tech.rating} / 5.0 Rating</div>
                    <div className="text-[10px] text-slate-400">Zero callbacks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Create New AMC Contract */}
      {isNewContractOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Register New HVAC AMC Contract
                </h3>
              </div>
              <button
                onClick={() => setIsNewContractOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {contractFormError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{contractFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateContract} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Client / Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContractForm.clientName}
                    onChange={(e) => setNewContractForm({ ...newContractForm, clientName: e.target.value })}
                    placeholder="e.g. Oberoi Sky City Tower"
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Site Installation Address
                  </label>
                  <input
                    type="text"
                    value={newContractForm.siteAddress}
                    onChange={(e) => setNewContractForm({ ...newContractForm, siteAddress: e.target.value })}
                    placeholder="e.g. Bandra Kurla Complex, Mumbai"
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={newContractForm.contactPerson}
                    onChange={(e) => setNewContractForm({ ...newContractForm, contactPerson: e.target.value })}
                    placeholder="Facility In-charge"
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Contact Mobile *
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">10 digits</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={newContractForm.contactPhone}
                    onChange={(e) => setNewContractForm({ ...newContractForm, contactPhone: formatMobileInput(e.target.value) })}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={newContractForm.contactEmail}
                    onChange={(e) => setNewContractForm({ ...newContractForm, contactEmail: e.target.value })}
                    placeholder="admin@facility.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Contract Type
                  </label>
                  <select
                    value={newContractForm.contractType}
                    onChange={(e) => setNewContractForm({ ...newContractForm, contractType: e.target.value as AmcContractType })}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Comprehensive">Comprehensive (With Spares)</option>
                    <option value="Non-Comprehensive (Labor Only)">Non-Comprehensive (Labor Only)</option>
                    <option value="Semi-Comprehensive">Semi-Comprehensive</option>
                    <option value="Preventive Only">Preventive Only</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    HVAC System Type
                  </label>
                  <select
                    value={newContractForm.systemType}
                    onChange={(e) => setNewContractForm({ ...newContractForm, systemType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VRV / VRF Systems">VRV / VRF Systems</option>
                    <option value="Water Cooled Chillers">Water Cooled Chillers</option>
                    <option value="Air Cooled Chillers">Air Cooled Chillers</option>
                    <option value="Precision AC (PAC)">Precision AC (PAC)</option>
                    <option value="Package & Ducted Splits">Package & Ducted Splits</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Annual Value (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newContractForm.annualContractValue}
                    onChange={(e) => setNewContractForm({ ...newContractForm, annualContractValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-emerald-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    PPM Frequency
                  </label>
                  <select
                    value={newContractForm.serviceFrequency}
                    onChange={(e) => setNewContractForm({ ...newContractForm, serviceFrequency: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="Quarterly">Quarterly (4 Visits/yr)</option>
                    <option value="Bi-Monthly">Bi-Monthly (6 Visits/yr)</option>
                    <option value="Monthly">Monthly (12 Visits/yr)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Lead Technician
                  </label>
                  <input
                    type="text"
                    value={newContractForm.assignedLeadTechnician}
                    onChange={(e) => setNewContractForm({ ...newContractForm, assignedLeadTechnician: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Emergency SLA (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newContractForm.slaResponseHours}
                    onChange={(e) => setNewContractForm({ ...newContractForm, slaResponseHours: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newContractForm.startDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newContractForm.endDate}
                    min={newContractForm.startDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewContractOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Save AMC Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Breakdown Ticket */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Log HVAC Breakdown / Emergency Call
                </h3>
              </div>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {ticketFormError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{ticketFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Existing AMC Contract
                </label>
                <select
                  value={newTicketForm.contractId}
                  onChange={(e) => {
                    const sel = amcContracts.find((c) => c.id === e.target.value);
                    if (sel) {
                      setNewTicketForm({
                        ...newTicketForm,
                        contractId: sel.id,
                        clientName: sel.clientName,
                        siteAddress: sel.siteAddress,
                        contactPhone: sel.contactPhone,
                        systemType: sel.systemType,
                        assignedTechnician: sel.assignedLeadTechnician
                      });
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium focus:outline-none"
                >
                  <option value="">-- Ad-hoc Non-AMC Service Request --</option>
                  {amcContracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} — {c.clientName} ({c.contractType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTicketForm.clientName}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, clientName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Contact Phone
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">10 digits</span>
                  </div>
                  <input
                    type="text"
                    value={newTicketForm.contactPhone}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, contactPhone: formatMobileInput(e.target.value) })}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Reported Issue Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTicketForm.reportedIssue}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, reportedIssue: e.target.value })}
                  placeholder="e.g. Chiller compressor tripping on high oil temperature alarm..."
                  className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Urgency / Priority
                  </label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="Critical 24x7">Critical 24x7 (1 hr SLA)</option>
                    <option value="High">High Priority (2 hr SLA)</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Dispatch Technician
                  </label>
                  <input
                    type="text"
                    value={newTicketForm.assignedTechnician}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, assignedTechnician: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Dispatch Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Technician Mobile Field Cockpit (Glove-Friendly Touch Targets) */}
      {isMobileCockpitOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-5 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-black tracking-tight text-white">Technician Field Cockpit</h3>
                  <div className="text-[10px] text-slate-400">Mobile On-Site Job App</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOfflineMode(!isOfflineMode)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    isOfflineMode
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {isOfflineMode ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
                  <span>{isOfflineMode ? 'Offline Cache' : 'Online Sync'}</span>
                </button>
                <button
                  onClick={() => setIsMobileCockpitOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Job Card */}
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-400">SRV-2026-081</span>
                <span className="px-2 py-0.5 bg-rose-500 text-white rounded text-[10px] font-extrabold">CRITICAL 24x7</span>
              </div>
              <div className="font-bold text-base text-white">One BKC Corporate Center</div>
              <p className="text-xs text-slate-300">Cassette Error A3 (Drain water level switch choked)</p>
            </div>

            {/* Live Job Timer Clock */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Job Duration Timer</div>
              <div className="font-mono text-3xl font-black text-emerald-400">{formatTimer(activeJobTimer)}</div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsJobTimerRunning(!isJobTimerRunning)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
                    isJobTimerRunning
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isJobTimerRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isJobTimerRunning ? 'Stop Job Timer' : 'Start Job Timer'}</span>
                </button>
              </div>
            </div>

            {/* Before / After Photo Verification */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                onClick={() => setBeforePhotoUploaded(!beforePhotoUploaded)}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-colors ${
                  beforePhotoUploaded
                    ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Camera className="w-4 h-4 mx-auto mb-1" />
                <span>{beforePhotoUploaded ? '✓ Before Photo OK' : 'Take Before Photo'}</span>
              </div>
              <div
                onClick={() => setAfterPhotoUploaded(!afterPhotoUploaded)}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-colors ${
                  afterPhotoUploaded
                    ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Camera className="w-4 h-4 mx-auto mb-1" />
                <span>{afterPhotoUploaded ? '✓ After Photo OK' : 'Take After Photo'}</span>
              </div>
            </div>

            {/* Customer Digital Sign-off */}
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Customer Digital Signoff</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      onClick={() => setCustomerRating(star)}
                      className={`w-4 h-4 cursor-pointer ${
                        star <= customerRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={customerSignName}
                onChange={(e) => setCustomerSignName(e.target.value)}
                placeholder="Client Name / Facility Rep Sign"
                className="w-full bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none text-xs"
              />
            </div>

            <button
              onClick={() => {
                alert('Job completed successfully! Customer signature & time log recorded.');
                setIsMobileCockpitOpen(false);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Complete Job & Sync Handover
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Generate On-Site Invoice & Receipt */}
      {isInvoiceModalOpen && selectedInvoiceTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  On-Site HVAC Service Invoice
                </h3>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">{selectedInvoiceTicket.clientName}</div>
                <div className="text-slate-500">Ticket Ref: {selectedInvoiceTicket.ticketNumber}</div>
                <div className="text-slate-500">{selectedInvoiceTicket.reportedIssue}</div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200">Billable Spares & Labor Summary</div>
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span>Refrigerant Topping & Nitrogen Pressure Leak Test</span>
                  <span className="font-mono font-bold">₹3,600.00</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span>18% HVAC Services GST</span>
                  <span className="font-mono font-bold">₹648.00</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                  <span>Total Amount Due</span>
                  <span className="font-mono">₹4,248.00</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF Invoice</span>
              </button>

              <button
                onClick={() => {
                  alert('Invoice generated & link sent via WhatsApp to client.');
                  setIsInvoiceModalOpen(false);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Collect Payment & Sign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: View Contract Detail & Printable Job Card */}
      {selectedContractForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600 text-white rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    AMC Service Agreement: {selectedContractForView.contractNumber}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedContractForView.companyName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Job Sheet</span>
                </button>
                <button
                  onClick={() => setSelectedContractForView(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contract Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contract Status</span>
                <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusStyles[selectedContractForView.status]}`}>
                  {selectedContractForView.status}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contract Type</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedContractForView.contractType}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Annual Fee</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">₹{selectedContractForView.annualContractValue.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergency SLA</span>
                <span className="font-bold text-emerald-600">{selectedContractForView.slaResponseHours} Hours</span>
              </div>
            </div>

            {/* Covered Equipment List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Covered Equipment Assets ({selectedContractForView.equipmentList?.length || 0} Units)
              </h4>
              <div className="space-y-2">
                {(selectedContractForView.equipmentList || []).map((eq) => (
                  <div
                    key={eq.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {eq.tagNumber} — {eq.equipmentType} ({eq.capacityTR} TR)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Brand: {eq.brand} | Model: {eq.modelNumber} | S/N: {eq.serialNumber || 'N/A'} | Location: {eq.locationFloor}
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {eq.condition}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scope & Terms */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                Contract Scope & Special Conditions
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                {selectedContractForView.notes || 'Routine quarterly preventive maintenance, cleaning of filters, checking refrigerant charge, torque testing of electrical contacts, and breakdown support within guaranteed SLA.'}
              </p>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedContractForView(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Execute PPM Checklist */}
      {selectedPpmForChecklist && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  PPM Inspection Checklist: {selectedPpmForChecklist.visitNumber}
                </h3>
                <p className="text-xs text-slate-500">{selectedPpmForChecklist.clientName} ({selectedPpmForChecklist.quarter})</p>
              </div>
              <button
                onClick={() => setSelectedPpmForChecklist(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Complete and verify each preventive maintenance checkpoint for site validation:
              </p>

              {selectedPpmForChecklist.checklistSummary.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(e) => {
                      const updated = [...selectedPpmForChecklist.checklistSummary];
                      updated[idx] = { ...updated[idx], done: e.target.checked };
                      const newPpm = { ...selectedPpmForChecklist, checklistSummary: updated };
                      setSelectedPpmForChecklist(newPpm);
                      storageService.updatePpmVisit(selectedPpmForChecklist.id, { checklistSummary: updated });
                    }}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{item.task}</span>
                    {item.notes && <span className="block text-[11px] text-slate-500 mt-0.5">Note: {item.notes}</span>}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  handleUpdatePpmStatus(selectedPpmForChecklist.id, 'Completed');
                  setSelectedPpmForChecklist(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Complete Visit & Signoff
              </button>
              <button
                onClick={() => setSelectedPpmForChecklist(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
