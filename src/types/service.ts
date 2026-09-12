export type ServicePriority =
  | 'P1 - Emergency Breakdown'
  | 'P2 - Urgent'
  | 'P3 - Routine Maintenance'
  | 'P4 - Inspection';

export type ServiceTicketStatus =
  | 'Draft'
  | 'Scheduled'
  | 'En Route'
  | 'On Site'
  | 'In Progress'
  | 'Completed'
  | 'Invoiced'
  | 'Cancelled';

export type TechnicianStatus = 'On Site' | 'En Route' | 'Idle' | 'Off Duty';

export type PreferredContactMethod = 'Phone' | 'WhatsApp' | 'Email';

export type AmcContractType =
  | 'Comprehensive AMC'
  | 'Non-Comprehensive AMC'
  | 'Labor Only'
  | 'Standard Warranty'
  | 'None';

export type EquipmentType =
  | 'VRV / VRF Outdoor Unit'
  | 'Water-Cooled Screw Chiller'
  | 'Air-Cooled Package Chiller'
  | 'Air Handling Unit (AHU)'
  | 'Ductable Split System'
  | 'Cassette Indoor Unit'
  | 'Cooling Tower'
  | 'Ventilation Exhaust Fan';

export interface ServiceCustomer {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  preferredContact: PreferredContactMethod;
  amcStatus: 'Active' | 'Expiring Soon' | 'Under Warranty' | 'No Contract';
  amcExpiryDate?: string;
  totalEquipments: number;
  openTicketsCount: number;
  createdDate: string;
}

export interface ServiceEquipment {
  id: string;
  customerId: string;
  customerName: string;
  type: EquipmentType;
  brand: string;
  modelNumber: string;
  serialNumber: string;
  capacityTR: number; // Tonnage
  refrigerantType: 'R-410A' | 'R-32' | 'R-134a' | 'R-22';
  installDate: string;
  warrantyExpiry: string;
  amcType: AmcContractType;
  amcExpiry: string;
  status: 'Operational' | 'Requires Service' | 'Under Repair' | 'Decommissioned';
  lastServicedDate: string;
  locationNotes: string;
}

export interface ServiceTechnician {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  certifications: string[];
  truckId: string;
  truckPlate: string;
  workingHours: string;
  status: TechnicianStatus;
  currentCoordinates: {
    lat: number;
    lng: number;
    address: string;
  };
  assignedTicketId?: string;
  assignedTicketNumber?: string;
  assignedCustomer?: string;
  completedJobsToday: number;
  rating: number; // 1-5
}

export interface ServiceChecklistItem {
  id: string;
  task: string;
  category: 'Electrical' | 'Refrigerant' | 'Mechanical' | 'Airflow' | 'Safety';
  completed: boolean;
  measurementValue?: string;
  unit?: string;
  normalRange?: string;
  status?: 'Pass' | 'Fail' | 'Attention Required';
}

export interface ServicePartConsumed {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface ServiceTimeTracking {
  clockInTime?: string;
  travelStartTime?: string;
  arrivedOnSiteTime?: string;
  workCompletedTime?: string;
  totalTravelMinutes: number;
  totalLaborMinutes: number;
}

export interface ServicePhoto {
  id: string;
  caption: string;
  url: string;
  type: 'Before' | 'After' | 'Defect' | 'Nameplate';
  timestamp: string;
}

export interface ServiceDigitalSignature {
  signerName: string;
  signerDesignation: string;
  signatureDataUrl: string; // Base64 or vector data
  signedAt: string;
  customerFeedbackScore: number; // 1 to 5
  customerComments?: string;
}

export interface ServiceWorkOrder {
  id: string;
  ticketNumber: string; // e.g. SRV-2026-0101
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  equipmentId: string;
  equipmentTitle: string; // e.g. "Daikin 20HP VRV ODU (SN: DKN-9921)"
  technicianId: string;
  technicianName: string;
  priority: ServicePriority;
  status: ServiceTicketStatus;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTimeSlot: string; // e.g. "09:30 AM - 11:30 AM"
  estimatedDurationHours: number;
  bufferMinutes: number;
  symptomsReported: string;
  diagnosisNotes: string;
  workDoneSummary: string;
  checklist: ServiceChecklistItem[];
  partsUsed: ServicePartConsumed[];
  laborHours: number;
  laborRatePerHour: number;
  flatRateItemId?: string;
  flatRateItemName?: string;
  flatRateAmount?: number;
  photos: ServicePhoto[];
  timeTracking: ServiceTimeTracking;
  signature?: ServiceDigitalSignature;
  invoiceId?: string;
  invoiceAmount?: number;
  invoiceStatus?: 'Unbilled' | 'Invoiced' | 'Paid';
  clientNotificationSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TruckStockItem {
  id: string;
  technicianId: string;
  technicianName: string;
  truckPlate: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  unit: string;
  unitPrice: number;
  barcode: string;
  lastRestockedDate: string;
}

export interface FlatRatePriceBookItem {
  id: string;
  code: string;
  serviceName: string;
  category: 'Refrigerant & Leakage' | 'Electrical & Controls' | 'Mechanical & Compressor' | 'Preventive AMC' | 'Ducting & Airflow';
  standardHours: number;
  fixedLaborFee: number;
  standardPartsFee: number;
  totalFlatRate: number;
  description: string;
}

export interface ServiceInvoice {
  id: string;
  invoiceNumber: string; // e.g. INV-SRV-2026-0045
  workOrderId: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  billingAddress: string;
  customerEmail: string;
  customerPhone: string;
  partsTotal: number;
  laborTotal: number;
  flatRateTotal: number;
  subtotal: number;
  gstRatePct: number; // 18%
  gstAmount: number;
  grandTotal: number;
  paymentStatus: 'Unpaid' | 'Paid - Card' | 'Paid - UPI' | 'Paid - ACH/Bank' | 'AMC Covered';
  paymentRef?: string;
  paidAt?: string;
  invoiceDate: string;
  dueDate: string;
  accountingSyncStatus: 'Synced to QuickBooks' | 'Synced to Xero' | 'Pending Sync';
}

export interface ServiceAnalyticsKPIs {
  totalTickets: number;
  completedTickets: number;
  activeEmergencies: number;
  firstTimeFixRatePct: number; // e.g. 89.2%
  meanTimeToRepairHours: number; // e.g. 2.4
  avgCustomerRating: number; // e.g. 4.85
  monthlyServiceRevenue: number;
  activeAmcContracts: number;
}

export type MaintenanceActionType =
  | 'Routine Preventive Maintenance (PPM)'
  | 'Emergency Breakdown Repair'
  | 'Quarterly AMC Inspection'
  | 'Compressor Overhaul / Replacement'
  | 'Coil Chemical Cleaning & Wash'
  | 'Refrigerant Leak Rectification & Gas Charging'
  | 'Filter Cleaning & Replacement'
  | 'Electrical Panel & Contactor Servicing'
  | 'Thermostat / Sensor Calibration'
  | 'Blower Motor & Bearing Servicing'
  | 'Water Treatment & Descaling';

export interface AssetServiceHistoryEntry {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentSerialNumber: string;
  equipmentType?: EquipmentType;
  customerId: string;
  customerName: string;
  actionDate: string; // YYYY-MM-DD
  actionType: MaintenanceActionType;
  technicianName: string;
  technicianId?: string;
  operatingHours?: number;
  refrigerantPressurePSI?: {
    suction: number;
    discharge: number;
  };
  ampsDrawn?: number;
  workSummary: string;
  repairNotes: string;
  partsReplaced?: string[];
  totalCost?: number;
  outcomeStatus: 'Operational & Verified' | 'Requires Follow-up' | 'Parts Pending' | 'Observation Mode';
  nextServiceDueDate?: string;
  workOrderTicketNumber?: string;
  loggedBy: string;
  loggedAt: string;
}

export interface AmcScheduledVisit {
  id: string;
  contractCode: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  siteAddress: string;
  equipmentId: string;
  equipmentName: string;
  equipmentSerialNumber: string;
  equipmentType: EquipmentType;
  capacityTR: number;
  scheduledDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 AM - 12:00 PM"
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  visitNumber: number;
  totalVisitsInContract: number;
  status: 'Scheduled' | 'Due Soon' | 'Overdue' | 'In Progress' | 'Completed' | 'Rescheduled';
  amcType: AmcContractType;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  checklistItems: string[];
  notes?: string;
  completedAt?: string;
  completionNotes?: string;
}

export type ServiceRequestIssueCategory =
  | 'No Cooling / High Temperature'
  | 'Refrigerant Gas Leakage'
  | 'Water Dropping / Drain Choke'
  | 'Compressor Tripped / High Noise'
  | 'Electrical / MCB Tripping'
  | 'Thermostat & Controller Error'
  | 'Preventive AMC Breakdown Visit'
  | 'Vibration & Blower Issue'
  | 'Other Breakdown';

export type ServiceRequestStatus =
  | 'New'
  | 'Assigned'
  | 'En Route'
  | 'In Progress'
  | 'Resolved'
  | 'Cancelled';

export type ServiceRequestPriority =
  | 'P1 - Emergency Breakdown'
  | 'P2 - Urgent'
  | 'P3 - Routine'
  | 'P4 - Low Priority';

export interface ServiceRequest {
  id: string;
  requestNumber: string; // e.g. "SR-2026-0081"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  siteAddress: string;
  projectId?: string;
  projectNumber?: string;
  projectName?: string;
  equipmentId?: string;
  equipmentName: string;
  equipmentType?: EquipmentType;
  equipmentSerialNumber?: string;
  issueCategory: ServiceRequestIssueCategory;
  priority: ServiceRequestPriority;
  status: ServiceRequestStatus;
  requestSource: 'Phone Call' | 'WhatsApp' | 'Customer Portal' | 'Email' | 'Site Inspection';
  description: string;
  preferredDate: string; // YYYY-MM-DD
  preferredSlot: string;
  contactPerson?: string;
  contactPersonPhone?: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  workOrderId?: string;
  workOrderTicketNumber?: string;
  slaTargetMinutes: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export type AmcContractRenewalStatus =
  | 'Active'
  | 'Expiring Soon'
  | 'Pending Reminder'
  | 'Expired'
  | 'Proposal Sent'
  | 'Renewed'
  | 'Lapsed';

export interface AmcContract {
  id: string;
  contractCode: string; // e.g. "AMC-2025-APOLLO-01"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  siteAddress: string;
  coveredEquipmentSummary: string;
  equipmentIds: string[];
  contractType: AmcContractType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  annualValue: number; // ₹
  renewalProposedValue: number; // ₹
  paymentTerms: 'Annual Advance' | 'Quarterly Advance' | 'Half-Yearly' | 'Milestone Linked';
  visitsPerYear: number;
  visitsCompleted: number;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Renewed';
  renewalStatus: AmcContractRenewalStatus;
  lastReminderDate?: string;
  renewalProposalRef?: string;
  technicianInCharge?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianTurnaroundStat {
  technicianId: string;
  technicianName: string;
  avatar?: string;
  truckPlate?: string;
  totalAssigned: number;
  resolvedCount: number;
  avgTurnaroundHours: number;
  fastestHours: number;
  longestHours: number;
  slaTargetHours: number;
  slaCompliancePct: number;
  rating: number;
}

