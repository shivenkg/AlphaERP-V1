export type UserRole =
  | 'executive'
  | 'sales_manager'
  | 'estimator'
  | 'procurement'
  | 'warehouse'
  | 'finance'
  | 'technician'
  | 'service_manager';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar: string;
  title: string;
  department?: string;
  status: 'active' | 'deactivated';
  createdAt?: string;
}

export type LeadStatus =
  | 'New'
  | 'Site Survey Scheduled'
  | 'Site Survey Completed'
  | 'Quote Sent'
  | 'Negotiation'
  | 'Awarded'
  | 'Lost';

export type LeadSource =
  | 'Website'
  | 'Inbound Call'
  | 'Referral'
  | 'WhatsApp'
  | 'HVAC Consultant'
  | 'Architect'
  | 'Trade Expo'
  | 'Direct Sales';

export interface FollowUpReminder {
  id: string;
  date: string;
  time?: string;
  type: 'Call' | 'WhatsApp' | 'Email' | 'Site Visit' | 'Meeting';
  notes: string;
  completed: boolean;
  completedAt?: string;
}

export interface CommunicationLog {
  id: string;
  timestamp: string;
  channel: 'WhatsApp' | 'Email' | 'Phone Call' | 'In-Person';
  sender: string;
  summary: string;
  status: 'Sent' | 'Delivered' | 'Read' | 'Logged';
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  key: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface Lead {
  id: string;
  leadNumber: string;
  clientName: string;
  companyName: string;
  phone: string;
  email: string;
  projectAddress: string;
  siteAddress?: string;
  address?: string;
  location?: string;
  city: string;
  buildingType: 'Commercial Office' | 'Hospital / Healthcare' | 'Industrial Plant' | 'Luxury Villa / Residential' | 'Retail Mall' | 'Hotel / Hospitality' | 'Data Center';
  hvacType: 'VRV / VRF System' | 'Water Cooled Chiller' | 'Air Cooled Chiller' | 'Ducted Split System' | 'Cleanroom AHU & Ducting' | 'Ventilation & Exhaust';
  estimatedCapacityTR: number; // Tonnage of Refrigeration
  capacityTR?: number;
  estimatedValue: number;
  source: LeadSource;
  status: LeadStatus;
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: string; // Sales Rep ID
  assignedToName: string;
  notes: string;
  followUps: FollowUpReminder[];
  communications: CommunicationLog[];
  quoteIds: string[];
  attachments?: FileAttachment[];
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteLineItem {
  id: string;
  category: 'Equipment' | 'Ducting & Insulation' | 'Piping & Valves' | 'Electrical & Controls' | 'Grilles & Diffusers' | 'Installation & Labor' | 'Testing & Commissioning';
  itemSku?: string;
  description: string;
  qty: number;
  unit: string;
  unitCost: number;
  unitPrice: number;
  totalCost: number;
  totalPrice: number;
  notes?: string;
}

export type QuoteStatus = 'Draft' | 'Sent' | 'Approved' | 'Awarded' | 'Rejected' | 'Expired' | 'Sent to Client' | string;

export interface Quote {
  id: string;
  quoteNumber: string;
  leadId: string;
  clientName: string;
  companyName: string;
  projectTitle: string;
  siteAddress: string;
  preparedBy: string;
  date: string;
  validUntil: string;
  items: QuoteLineItem[];
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  taxPct: number;
  taxAmount: number;
  totalAmount: number;
  totalCost: number;
  grossMarginAmount: number;
  grossMarginPct: number;
  targetMarginPct?: number;
  paymentTerms: string;
  warrantyTerms: string;
  deliveryTimeline: string;
  status: QuoteStatus;
  awardedDate?: string;
  convertedToProjectId?: string;
  notes: string;
  termsAndConditions?: string[];
  systemType?: string;
  coolingCapacity?: string | number;
}

export interface NewQuoteDraft {
  selectedLeadId: string;
  projectTitle: string;
  siteAddress: string;
  deliveryTimeline: string;
  paymentTerms: string;
  discountPct: number;
  items: QuoteLineItem[];
  savedAt: string;
}

export type WorkOrderStatus = 'Scheduled' | 'In Progress' | 'Inspection' | 'Completed' | 'Billed';

export interface WorkOrder {
  id: string;
  orderNumber: string;
  quoteId?: string;
  projectId?: string;
  clientName: string;
  projectTitle: string;
  siteAddress: string;
  serviceType: 'New HVAC Installation' | 'Ductwork Fabrication' | 'Chiller Commissioning' | 'Preventive Maintenance' | 'Emergency Repair';
  assignedTechnician: string;
  scheduledStartDate: string;
  scheduledEndDate: string;
  actualEndDate?: string;
  status: WorkOrderStatus;
  scopeOfWork: string[];
  equipmentSpecs: string;
  completionSignoff?: {
    signedBy: string;
    signatureDate: string;
    clientSatisfactionScore: number;
    notes: string;
  };
}

export type AmcContractType =
  | 'Comprehensive'
  | 'Non-Comprehensive (Labor Only)'
  | 'Semi-Comprehensive'
  | 'Preventive Only';

export type AmcStatus = 'Active' | 'Pending Renewal' | 'Expired' | 'Terminated';

export interface ServiceEquipmentItem {
  id: string;
  tagNumber: string;
  equipmentType: string;
  brand: string;
  modelNumber: string;
  capacityTR: number;
  locationFloor: string;
  serialNumber?: string;
  lastServiceDate?: string;
  nextPpmDate?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Requires Attention';
}

export interface AmcContract {
  id: string;
  contractNumber: string;
  clientName: string;
  clientId?: string;
  companyName: string;
  siteAddress: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  contractType: AmcContractType;
  planType?: string;
  systemType: string;
  equipmentCount: number;
  equipmentCovered?: number;
  equipmentList: ServiceEquipmentItem[];
  startDate: string;
  endDate: string;
  billingFrequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annually';
  annualContractValue: number;
  billedAmount: number;
  receivedAmount: number;
  serviceFrequency: 'Monthly' | 'Quarterly' | 'Bi-Monthly';
  slaResponseHours: number;
  status: AmcStatus;
  assignedLeadTechnician: string;
  technicianPhone?: string;
  ppmVisitsCompleted: number;
  ppmVisitsTotal: number;
  notes?: string;
  createdAt: string;
}

export type AMCContract = AmcContract;
export type PPMVisit = PpmScheduleVisit;

export interface PpmChecklistItem {
  task: string;
  done: boolean;
  notes?: string;
}

export interface PpmScheduleVisit {
  id: string;
  visitNumber: string;
  contractId: string;
  contractNumber: string;
  clientName: string;
  siteAddress: string;
  scheduledDate: string;
  completedDate?: string;
  quarter?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue' | 'Rescheduled';
  assignedTechnician: string;
  checklistSummary: PpmChecklistItem[];
  findingsNotes?: string;
  technicianRemarks?: string;
  customerSignatureName?: string;
  customerRating?: number;
}

export interface BreakdownSparesItem {
  partName: string;
  qty: number;
  cost: number;
  isCoveredUnderAmc: boolean;
}

export interface BreakdownTicket {
  id: string;
  ticketNumber: string;
  contractId?: string;
  contractNumber?: string;
  clientName: string;
  siteAddress: string;
  contactPhone: string;
  reportedIssue: string;
  systemType: string;
  priority: 'Critical 24x7' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Dispatched' | 'Work In Progress' | 'Resolved' | 'Closed';
  reportedAt: string;
  assignedTechnician: string;
  resolutionNotes?: string;
  sparesReplaced?: BreakdownSparesItem[];
  billableAmount?: number;
  resolvedAt?: string;
}


export interface BOQItem {
  id: string;
  category: string;
  sku: string;
  description: string;
  requiredQty: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  inStockQty: number;
  shortageQty: number;
  status: 'In Stock' | 'Shortage - PR Needed' | 'PR Generated' | 'PO Issued' | 'Inwarded / Available';
  prNumber?: string;
  poNumber?: string;
}

export type ProjectStatus = 'Planning & Engineering' | 'Procurement' | 'Installation' | 'Testing & Commissioning' | 'Handover & Closed' | 'Completed' | 'In Progress' | 'On Hold' | string;

export interface ProjectExpenseMilestone {
  phase: string;
  label: string;
  budgetCost: number;
  actualExpense: number;
  projectedMarginPct: number;
}

export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Project {
  id: string;
  projectNumber: string;
  projectCode?: string;
  projectName: string;
  name?: string;
  clientName: string;
  leadId: string;
  quoteId: string;
  contractValue: number;
  totalEstimatedCost: number;
  actualExpenses?: number;
  actualCost?: number;
  expenseMilestones?: ProjectExpenseMilestone[];
  targetMarginPct: number;
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  status: ProjectStatus;
  priority?: ProjectPriority;
  progressPct: number;
  projectManager: string;
  boqItems: BOQItem[];
  totalShortageItemsCount: number;
  prCount: number;
  poCount: number;
  invoicesGeneratedAmount: number;
  paymentsReceivedAmount: number;
  siteAddress: string;
  isDelayed?: boolean;
  delayDays?: number;
  delayReason?: string;
  delayCategory?: 'Client Site Clearance' | 'Material / PR Hold' | 'OEM Delivery Delay' | 'Consultant Drawing Approval' | 'Manpower / Labor Shortage' | 'Payment Milestone Block' | 'Civil / Structural Pending' | 'Other' | string;
  delayMitigationPlan?: string;
  revisedCompletionDate?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'VRF / AC Units' | 'Chillers & AHU' | 'Ducting & Sheets' | 'Insulation Material' | 'Copper Pipes & Fittings' | 'Valves & Dampers' | 'Refrigerants' | 'BMS & Thermostats' | 'Air Outlets & Diffusers' | string;
  specification?: string;
  description?: string;
  brand?: string;
  currentStock: number;
  allocatedStock: number;
  availableStock: number; // currentStock - allocatedStock
  reorderLevel: number;
  unit: string; // 'Nos', 'Meters', 'Rolls', 'Sheets', 'Cylinders', 'Kg'
  averageUnitCost: number;
  standardSellingPrice?: number;
  hsnCode?: string;
  gstRatePct?: number;
  defaultSupplier?: string;
  warehouseLocation?: string; // e.g. Bay A-12, Main Yard
  storageLocation?: string;
  location?: string;
  manufacturer?: string;
  leadTimeDays?: number;
  preferredVendor?: string;
  lastRestockedDate?: string;
}

export interface PRItem {
  sku: string;
  name: string;
  category: string;
  requiredQty: number;
  unit: string;
  estimatedUnitCost: number;
  estimatedTotal: number;
  reason: string;
}

export type PRStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Converted to PO';

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  projectId: string;
  projectName: string;
  requestedBy: string;
  requestDate: string;
  requiredByDate?: string;
  priority: 'Urgent' | 'High' | 'Standard';
  items: PRItem[];
  totalEstimatedAmount: number;
  status: PRStatus;
  approvalRemarks?: string;
  approvedBy?: string;
  approvedAt?: string;
  convertedPoId?: string;
  convertedPoNumber?: string;
}

export interface POItem {
  sku: string;
  name: string;
  orderedQty: number;
  receivedQty: number;
  unit: string;
  unitRate: number;
  taxRatePct: number;
  totalAmount: number;
}

export type POStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Sent to Vendor' | 'Partially Received' | 'Fulfilled' | 'Received' | 'Fully Received' | 'Cancelled' | string;

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  prId?: string;
  prNumber?: string;
  projectId: string;
  projectName: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone: string;
  orderDate: string;
  expectedDeliveryDate: string;
  deliveryAddress: string;
  items: POItem[];
  subtotal: number;
  taxAmount: number;
  shippingCharges: number;
  grandTotal: number;
  totalAmount?: number;
  paymentTerms: string;
  status: POStatus;
  approvalRemarks?: string;
  approvedBy?: string;
  approvedAt?: string;
  sentToVendorAt?: string;
  vendorAcknowledgmentStatus?: 'Pending' | 'Confirmed' | 'Shipped' | 'Delayed';
  notes: string;
}

export interface Vendor {
  id: string;
  name: string;
  code?: string;
  vendorCode?: string;
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp?: string;
  category?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  gstNumber?: string;
  gstOrTaxId?: string;
  pan?: string;
  categoriesSupplied?: string[];
  rating: number; // 1-5
  creditPeriodDays: number;
  paymentTerms?: string;
  leadTimeDays?: number;
  status?: 'active' | 'inactive' | 'blacklisted' | 'Active' | 'Inactive' | 'Blacklisted' | string;
  bankDetails?:
    | {
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        branch?: string;
        branchName?: string;
      }
    | string;
  createdAt?: string;
}

export type PaymentType =
  | 'Advance 30%'
  | 'Equipment Delivery 40%'
  | 'Installation Completion 20%'
  | 'Testing & Handover 10%'
  | 'Retention Payment'
  | 'Vendor Payout'
  | 'AMC Service Fee'
  | 'F&F Exit Settlement';

export type PaymentStatus = 'Pending' | 'Paid' | 'Partially Paid' | 'Overdue';

export interface InvoiceAttachment {
  id: string;
  name?: string;
  fileName?: string;
  fileType?: string;
  mimeType?: string;
  dataUrl?: string; // Base64 image data URL
  url?: string;
  sizeBytes?: number;
  capturedAt?: string;
  capturedBy?: string;
  capturedVia?: string;
  fileSize?: number | string;
  uploadedAt?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceNumber: string;
  referenceType: 'Quote' | 'Project' | 'WorkOrder' | 'PurchaseOrder' | 'EmployeeExit';
  referenceId: string;
  projectId?: string;
  projectName?: string;
  milestoneTitle?: string;
  milestonePercentage?: number;
  referenceTitle: string;
  clientOrVendorName: string;
  isPayable: boolean; // true = PO payout to vendor, false = Receivable from client
  paymentType: PaymentType;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  paymentMethod?: 'Bank Transfer / NEFT' | 'UPI' | 'Credit Card' | 'Cheque' | 'Stripe / Online' | 'RTGS' | 'Bank NEFT' | string;
  transactionReference?: string;
  notes?: string;
  attachments?: InvoiceAttachment[];
  invoicePhotoUrl?: string;
}

export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatar: string;
  monthlyQuota: number;
  monthlyTarget?: number;
  quarterlyQuota: number;
  baseCommissionPct: number;
  bonusMultiplierPct: number; // If margin > 22%
  achievedSalesMonth: number;
  achievedRevenue?: number;
  achievedSalesQuarter: number;
  wonDealsCount: number;
  activePipelineValue: number;
  calculatedCommission: number;
  region?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  user?: string;
  role?: string;
  module?: string;
  targetId?: string;
  userRole?: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'AWARD' | 'CONVERT_TO_PROJECT' | 'GENERATE_PR' | 'CONVERT_TO_PO' | 'SEND_TO_VENDOR' | 'PAYMENT_PROCESSED' | 'SYNC_SHEETS' | 'BACKUP_CREATE' | 'BACKUP_RESTORE' | string;
  entityType: 'LEAD' | 'QUOTE' | 'WORK_ORDER' | 'PROJECT' | 'BOQ' | 'INVENTORY' | 'PR' | 'PO' | 'PAYMENT' | 'SALES_QUOTA' | 'GOOGLE_SHEET' | 'USER' | 'SYSTEM' | string;
  entityId: string;
  summary: string;
  details?: string;
  metadata?: Record<string, any>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert' | 'error';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface GoogleSheetBackupStats {
  timestamp: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  totalMasterRecords: number;
  totalTransactionRecords: number;
  masterCounts: Record<string, number>;
  transactionCounts: Record<string, number>;
}

export interface GoogleSheetRestorePreview {
  spreadsheetTitle: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  vaultFound: boolean;
  backupTimestamp?: string;
  schemaVersion?: string;
  totalMasterRecords: number;
  totalTransactionRecords: number;
  masterCounts: Record<string, number>;
  transactionCounts: Record<string, number>;
}

export interface GoogleSheetRestoreResult {
  success: boolean;
  error?: string;
  vaultFound: boolean;
  totalMasterRecords: number;
  totalTransactionRecords: number;
  masterCounts: Record<string, number>;
  transactionCounts: Record<string, number>;
  restoredAt: string;
}

export interface GoogleSheetsSyncConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetName: string;
  apiKey?: string | null;
  lastSyncAt: string | null;
  lastBackupAt?: string | null;
  lastRestoreAt?: string | null;
  lastBackupStats?: GoogleSheetBackupStats | null;
  lastRestoreStats?: GoogleSheetRestoreResult | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  autoSync: boolean;
  sheetsCreated: string[];
}

export interface SystemSettings {
  // Company & Branding
  companyName: string;
  appTitle: string;
  tagline: string;
  gstin: string;
  pan: string;
  cin: string;
  sacCode: string;
  hqAddress: string;
  supportPhone: string;
  supportEmail: string;
  currencySymbol: string;
  themeColor: 'blue' | 'emerald' | 'indigo' | 'violet' | 'slate';
  displayDensity?: 'compact' | 'spacious';
  fontSizeMode?: 'auto' | 'compact' | 'normal' | 'large' | 'xlarge';
  autoScaleEnabled?: boolean;
  customFontScale?: number;
  
  // Quotation & Commercial Parameters
  defaultGstRate: number; // e.g. 18
  quoteValidityDays: number; // e.g. 30
  minimumGrossMarginPct: number; // e.g. 15
  defaultPaymentTerms: string;
  defaultWarrantyClause: string;
  defaultInclusions: string[];
  defaultExclusions: string[];
  
  // Procurement & Approval Thresholds
  prAutoApprovalThreshold: number; // e.g. 50000
  poDualSignoffThreshold: number; // e.g. 200000
  defaultVendorCreditDays: number; // e.g. 30
  
  // Banking & Final Tax Invoice Remittance
  bankBeneficiaryName: string;
  bankName: string;
  bankBranch: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankSwiftCode?: string;
  upiVpaId: string;
  
  // Active Module Feature Flags
  moduleFlags: {
    crmLeads: boolean;
    quotesEstimations: boolean;
    projectsBOQ: boolean;
    procurementPRPO: boolean;
    inventoryWarehouse: boolean;
    workOrdersField: boolean;
    paymentsBilling: boolean;
    salesPerformance: boolean;
    googleSheetsSync: boolean;
    auditLogs: boolean;
    userManagement: boolean;
  };

  // Custom Role Permissions Overrides
  customRolePermissions?: Record<string, string[]>;

  // Role-Based Module Visibility Configuration (maps each UserRole to its allowed module tab IDs)
  roleModulePermissions?: Record<UserRole, string[]>;

  // Schema version stamp — bump in storageService to force a one-time reset of cached permissions
  permissionsSchemaVersion?: string;

  // Master Data & Transaction Unique Automated Number Series Configuration
  numberSeries?: SeriesDefinition[];

  // Report & Document Custom Header & Footer Templates
  reportTemplates?: Record<string, ReportTemplateConfig>;

  // Automated WhatsApp Daily Business KPI Trigger Configuration
  whatsAppTriggerConfig?: WhatsAppTriggerConfig;

  // Automated Email & SMTP Notification Engine Configuration
  emailConfig?: EmailSmtpConfig;
}

export type EmailProviderType = 'custom_smtp' | 'mailtrap' | 'ethereal' | 'gmail' | 'sendgrid' | 'office365' | 'mock';

export interface EmailSmtpConfig {
  enabled: boolean;
  provider: EmailProviderType;
  mode: 'mock' | 'mock_wrapper' | 'test_sandbox' | 'smtp';
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  senderName: string;
  senderEmail: string;
  replyToEmail?: string;
  defaultRecipients: string[];
  procurementAlertsEnabled: boolean;
  poDispatchEnabled: boolean;
  invoiceRemindersEnabled: boolean;
  workOrderDispatchEnabled: boolean;
  dailyDigestEnabled: boolean;
  lastTestedAt?: string;
  lastTestStatus?: 'SUCCESS' | 'FAILED';
  lastTestMessage?: string;
}

export type ReportType = 'invoice' | 'po' | 'pr' | 'quotation' | 'workorder';

export interface ReportHeaderConfig {
  documentTitle: string; // e.g. "COMMERCIAL TAX INVOICE", "PURCHASE ORDER", "MATERIAL REQUISITION NOTE", "TECHNO-COMMERCIAL QUOTATION"
  documentSubtitle: string; // e.g. "Final Commercial Billing & Handover Certificate", "Authorized OEM Materials Procurement Order"
  companyName?: string; // Custom override or inherits from global settings
  tagline?: string; // Custom tagline override
  divisionName?: string; // e.g. "HVAC & MEP Engineering Division"
  logoStyle: 'left_brand' | 'center_brand' | 'modern_split' | 'minimalist_banner';
  accentColor: string; // Hex color code
  showGstin: boolean;
  showPan: boolean;
  showCin: boolean;
  showIsoCert: boolean;
  isoCertText: string;
  showSacCode: boolean;
  sacCodeText: string;
  showAddress: boolean;
  customAddress?: string;
  showContactInfo: boolean;
  customContactPhone?: string;
  customContactEmail?: string;
  customWebsite?: string;
  showDocMetaBox: boolean;
  metaBoxStyle: 'rounded_cards' | 'clean_table' | 'accent_border';
}

export interface ReportFooterConfig {
  termsHeading: string;
  termsAndConditions: string[];
  customNotesHeading?: string;
  customNotes?: string;
  showBankDetails: boolean;
  bankDetailsHeading?: string;
  customBankInstructions?: string;
  showDeclaration: boolean;
  declarationHeading?: string;
  declarationText: string;
  primarySignatoryTitle: string;
  primarySignatorySubtitle: string;
  secondarySignatoryTitle?: string;
  secondarySignatorySubtitle?: string;
  showDigitalSeal: boolean;
  digitalSealText?: string;
  confidentialityNotice: string;
  showPageNumbers: boolean;
  pageNumberFormat: 'page_x_of_y' | 'page_x' | 'simple';
}

export interface ReportStylingConfig {
  fontArchetype: 'sans_modern' | 'serif_corporate' | 'mono_technical';
  layoutDensity: 'compact' | 'standard' | 'spacious';
  watermarkText?: string;
  tableHeaderBgColor: string;
  tableBorderColor: string;
}

export interface ReportTemplateConfig {
  id: ReportType;
  name: string;
  description: string;
  header: ReportHeaderConfig;
  footer: ReportFooterConfig;
  styling: ReportStylingConfig;
  lastUpdated?: string;
  updatedBy?: string;
}

export interface SeriesDefinition {
  id: string; // e.g. 'employee', 'pr', 'po', 'product', 'invoice', 'grn', 'lead', 'quote', 'project', 'workorder', 'client', 'vendor', 'voucher', 'job_req', 'cost_center', 'department'
  entityName: string;
  prefix: string; // e.g. 'EMP', 'PR', 'PO', 'SKU', 'INV', 'GRN', 'LD', 'QT', 'PRJ', 'WO', 'CLI', 'VND', 'JV', 'JOB', 'CC', 'DEP'
  separator: string; // default '-'
  paddingDigits: number; // default 4
  currentSequence: number; // next sequential integer (e.g. 1)
  includeYear: boolean; // default true
  yearDigits: 2 | 4; // default 2 (represents year last 2 digits e.g. 26)
  yearPosition: 'prefix' | 'suffix' | 'after_prefix'; // default 'prefix' (26-EMP-0001)
  customPattern?: string; // e.g. '{YY}-{PREFIX}-{SEQ}'
  description: string;
  isActive: boolean;
}

export interface GRNItem {
  sku: string;
  name: string;
  unit: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty?: number;
  remarks?: string;
}

export interface GoodsReceiptNote {
  id: string;
  grnNumber: string; // e.g. 26-GRN-0001
  poId: string;
  poNumber: string;
  vendorId?: string;
  vendorName: string;
  receiptDate: string;
  challanNumber?: string;
  transporterName?: string;
  vehicleNumber?: string;
  receivedBy: string;
  warehouseBay?: string;
  status: 'Received & Verified' | 'Partially Received' | 'Quality Issue' | 'Accepted';
  items: GRNItem[];
  totalItemsCount: number;
  totalQuantity: number;
  notes?: string;
  createdAt: string;
}

export interface LocalBackupSnapshot {
  id: string;
  timestamp: string;
  triggerType: 'INVENTORY_CRITICAL' | 'PROCUREMENT_CRITICAL' | 'PERIODIC_SCHEDULE' | 'MANUAL_USER';
  module: 'Inventory' | 'Procurement' | 'System';
  description: string;
  itemCounts: {
    inventoryCount: number;
    prCount: number;
    poCount: number;
    quoteCount: number;
    leadCount: number;
    projectCount: number;
    paymentCount: number;
  };
  payloadJson: string;
  sizeKb: number;
}

export interface BackupNotificationEvent {
  snapshotId: string;
  timestamp: string;
  triggerType: 'INVENTORY_CRITICAL' | 'PROCUREMENT_CRITICAL' | 'PERIODIC_SCHEDULE' | 'MANUAL_USER';
  module: 'Inventory' | 'Procurement' | 'System';
  description: string;
  itemCountSummary: string;
  downloadPayload: string;
}

export interface BackupConfig {
  periodicIntervalMinutes: number; // 0 for off, 15, 30, 60, 120
  autoSnapshotOnCriticalInventory: boolean;
  autoSnapshotOnCriticalProcurement: boolean;
  browserPushNotifications: boolean;
  soundAlert: boolean;
  maxRetainedSnapshots: number;
}

export interface OtpSession {
  email: string;
  otp: string;
  expiresAt: number;
  mode: 'login' | 'signup';
  tempUserData?: {
    name: string;
    phone?: string;
    role: UserRole;
    title?: string;
    department?: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
}

// ==========================================
// 1. MASTER DATA INTERFACES
// ==========================================

export interface ClientMaster {
  id: string;
  clientCode: string;
  companyName: string;
  contactPerson: string;
  designation?: string;
  email: string;
  phone: string;
  altPhone?: string;
  billingAddress: string;
  siteAddress?: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  pan: string;
  creditLimit: number;
  creditPeriodDays: number;
  paymentTerms: string;
  industry: string;
  status: 'active' | 'inactive' | 'blacklisted';
  notes?: string;
  createdAt: string;
}

export interface CostCenterMaster {
  id: string;
  code: string;
  name: string;
  department: string;
  location: string;
  managerName: string;
  budgetLimit: number;
  active: boolean;
}

export interface TaxSlabMaster {
  id: string;
  name: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  totalGstRate: number;
  hsnSacCode: string;
  appliesTo: string;
  active: boolean;
}

export interface PaymentTermMaster {
  id: string;
  code: string;
  name: string;
  days: number;
  description: string;
  isDefault: boolean;
}

// ==========================================
// 2. FINANCE & ACCOUNTING INTERFACES
// ==========================================

export type AccountType =
  | 'Current Asset'
  | 'Fixed Asset'
  | 'Bank & Cash'
  | 'Accounts Receivable'
  | 'Inventory Asset'
  | 'Current Liability'
  | 'Accounts Payable'
  | 'Statutory Liability'
  | 'Equity & Capital'
  | 'Direct Revenue'
  | 'Direct Cost (COGS)'
  | 'Indirect Expense'
  | 'Asset'
  | 'Liability'
  | 'Revenue'
  | 'Expense'
  | 'COGS'
  | string;

export interface ChartOfAccount {
  id: string;
  accountCode: string;
  accountName: string;
  code?: string;
  name?: string;
  type: AccountType;
  subCategory: string;
  balance: number;
  currentBalance?: number;
  openingBalance: number;
  description?: string;
  isSystemAccount?: boolean;
}

export type VoucherType =
  | 'Journal'
  | 'Payment'
  | 'Receipt'
  | 'Sales Invoice'
  | 'Purchase Bill'
  | 'Contra'
  | 'JV'
  | 'RV'
  | 'PV'
  | 'Sales'
  | 'Purchase'
  | string;

export interface VoucherEntry {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  narration?: string;
}

export interface JournalVoucher {
  id: string;
  voucherNumber: string;
  voucherDate: string;
  voucherType: VoucherType;
  referenceNumber?: string;
  referenceType?: string;
  totalAmount: number;
  entries: VoucherEntry[];
  narration: string;
  status: 'Draft' | 'Posted' | 'Cancelled';
  createdBy: string;
  createdAt: string;
}

export interface TDSRecord {
  id: string;
  deducteeName: string;
  deducteePan: string;
  deducteeType: 'Company' | 'Individual / Contractor' | 'Professional';
  section: '194C' | '194J' | '194I' | '194H' | '192';
  ratePct: number;
  paymentAmount: number;
  tdsDeducted: number;
  tdsAmount?: number;
  description?: string;
  deductDate: string;
  challanNumber?: string;
  bsrCode?: string;
  depositDate?: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  status: 'Deducted' | 'Deposited';
}

export interface GSTSummaryData {
  period: string;
  outwardTaxable: number;
  outputCGST: number;
  outputSGST: number;
  outputIGST: number;
  totalOutputTax: number;
  inwardTaxable: number;
  inputCGST: number;
  inputSGST: number;
  inputIGST: number;
  totalInputTaxCredit: number;
  netGstPayable: number;
}

// ==========================================
// 3. HUMAN RESOURCES & PAYROLL INTERFACES
// ==========================================

export interface KRAItem {
  id?: string;
  title?: string;
  metric?: string;
  weightagePct?: number;
  weightage?: number;
  description?: string;
  target?: string;
  kpiMetric?: string;
}

export interface JobRequisition {
  id: string;
  reqNumber: string;
  jobTitle: string;
  department: string;
  location: string;
  experienceReq?: string;
  experienceRequired?: string;
  employmentType?: 'Full-Time' | 'Contract' | 'Site-Based' | string;
  salaryRange: string;
  openPositions?: number;
  positionsCount?: number;
  filledPositions?: number;
  hiringManager?: string;
  status: 'Active / Hiring' | 'On Hold' | 'Closed' | 'Active' | 'Draft' | string;
  kraList?: KRAItem[];
  kras?: KRAItem[] | any[];
  responsibilities?: string[];
  requirements?: string[];
  certificationsPreferred?: string[];
  technicalRequirements?: string[];
  jobSummary?: string;
  createdAt: string;
}

export interface JobCandidate {
  id: string;
  reqId?: string;
  requisitionId?: string;
  jobTitle?: string;
  name: string;
  email: string;
  phone: string;
  currentCompany?: string;
  experienceYears: number;
  currentCtc?: number;
  currentCTC?: number;
  expectedCtc?: number;
  expectedCTC?: number;
  noticePeriodDays?: number;
  stage: 'Applied' | 'Screened' | 'Technical Round' | 'Management Interview' | 'Offer Issued' | 'Offer Letter' | 'Hired' | 'Rejected' | string;
  interviewNotes?: string;
  interviewFeedback?: string;
  rating: number;
  appliedDate: string;
}

export interface Employee {
  id: string;
  empCode: string;
  code?: string;
  name?: string;
  fullName?: string;
  designation: string;
  department: string;
  email?: string;
  officialEmail?: string;
  phone: string;
  dateOfBirth?: string;
  dob?: string;
  dateOfJoining?: string;
  joiningDate?: string;
  reportingManager?: string;
  employmentStatus?: 'Active' | 'Probation' | 'Notice Period' | 'Separated' | string;
  status?: 'Active' | 'Probation' | 'Notice Period' | 'Separated' | 'Resigned' | string;
  baseMonthlySalary?: number;
  basicSalary?: number;
  salary?: number;
  grossMonthlySalary?: number;
  ctcAnnual?: number;
  annualCTC?: number;
  pan?: string;
  aadhaar?: string;
  uanNumber?: string;
  uan?: string;
  pfNumber?: string;
  esicNumber?: string;
  esicNo?: string;
  leavesRemaining?: number;
  bankName?: string;
  bankAccount?: string;
  bankAccountNo?: string;
  ifscCode?: string;
  bankIfsc?: string;
  bankDetails?:
    | {
        bankName?: string;
        accountNumber?: string;
        ifscCode?: string;
        branchName?: string;
        branch?: string;
      }
    | string;
  taxRegime?: 'New Regime' | 'Old Regime';
  casualLeaveBalance?: number;
  sickLeaveBalance?: number;
  privilegeLeaveBalance?: number;
  monthlySalaryStructure?: {
    basicSalary: number;
    hra: number;
    conveyanceAllowance?: number;
    specialAllowance?: number;
    siteAllowance?: number;
    grossMonthlySalary: number;
  };
  leaveBalances?: {
    cl: number; // Casual Leave
    sl: number; // Sick Leave
    pl: number; // Privilege / Earned Leave
  };
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  empId: string;
  empName?: string;
  employeeName?: string;
  empCode: string;
  date: string;
  status: 'Present' | 'WFH' | 'Site Visit' | 'Half Day' | 'Absent' | 'On Leave' | 'Late' | string;
  checkInTime?: string;
  checkOutTime?: string;
  inTime?: string;
  outTime?: string;
  totalHours?: number;
  siteProjectName?: string;
  siteAssigned?: string;
  remarks?: string;
  deviceId?: string;
  deviceName?: string;
  deviceLocation?: string;
  verificationMode?: 'Fingerprint' | 'Face Recognition' | 'RFID Card' | 'Palm Vein' | 'Mobile Geofence' | string;
  isLate?: boolean;
  shiftCode?: string;
}

export interface BiometricDevice {
  id: string;
  name: string;
  model: string;
  brand: string;
  deviceType: 'Biometric Fingerprint + Face' | 'Fingerprint Scanner' | 'Facial Recognition AI' | 'RFID Smart Card';
  ipAddress: string;
  port: number;
  serialNumber: string;
  location: string;
  connectionType: 'TCP/IP LAN' | 'Cloud Push API / Webhook' | 'USB Direct';
  direction: 'Two-Way (In & Out)' | 'Check-In Only' | 'Check-Out Only';
  commKey: string;
  status: 'Online' | 'Offline' | 'Syncing';
  lastSyncTime: string;
  enrolledUsersCount: number;
  totalPunchesLogged: number;
  autoSyncIntervalMinutes: number;
  firmwareVersion?: string;
}

export interface AttendancePunchLog {
  id: string;
  empId: string;
  empCode: string;
  empName: string;
  timestamp: string;
  punchTime: string;
  date: string;
  punchType: 'Check-In' | 'Check-Out' | 'Break-Out' | 'Break-In';
  deviceId: string;
  deviceName: string;
  deviceLocation?: string;
  verificationMode: 'Fingerprint' | 'Face Recognition' | 'RFID Card' | 'Palm Vein';
  status: 'Verified' | 'Late In' | 'Early Out' | 'Normal';
}

export interface TimesheetEntry {
  id: string;
  empId: string;
  empName?: string;
  employeeName?: string;
  weekStartDate?: string;
  weekEndDate?: string;
  weekEndingDate?: string;
  projectId: string;
  projectName: string;
  taskDescription: string;
  monHours?: number;
  tueHours?: number;
  wedHours?: number;
  thuHours?: number;
  friHours?: number;
  satHours?: number;
  mondayHours?: number;
  tuesdayHours?: number;
  wednesdayHours?: number;
  thursdayHours?: number;
  fridayHours?: number;
  saturdayHours?: number;
  sundayHours?: number;
  totalHours: number;
  status: 'Submitted' | 'Approved' | 'Rejected';
  approvedBy?: string;
}

export interface LeaveApplication {
  id: string;
  empId: string;
  empName?: string;
  employeeName?: string;
  empCode: string;
  leaveType: 'Casual Leave (CL)' | 'Sick Leave (SL)' | 'Earned Leave (PL)' | 'Optional Holiday' | 'CL' | 'SL' | 'PL' | 'OH' | string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
  actionRemarks?: string;
  actionBy?: string;
}

export interface CompanyHoliday {
  id: string;
  date: string;
  name: string;
  type: 'National Mandatory' | 'Regional / Festival' | 'Company Event' | 'Gazetted' | string;
  dayOfWeek?: string;
  optional: boolean;
}

export interface EmployeeSalarySlip {
  id: string;
  payrollMonthId: string;
  monthYear: string;
  empId: string;
  empCode: string;
  empName: string;
  designation: string;
  department: string;
  pan: string;
  uan: string;
  bankAccount: string;
  bankName: string;
  workingDays: number;
  payableDays: number;
  leaveDays: number;
  basicPay: number;
  hra: number;
  specialAllowance: number;
  siteAllowance: number;
  conveyanceAllowance: number;
  grossEarnings: number;
  pfEmployee: number;
  pfEmployer: number;
  esicEmployee: number;
  esicEmployer: number;
  professionalTax: number;
  tdsTax: number;
  totalDeductions: number;
  netPay: number;
  netPayInWords: string;
}

export interface PayrollMonth {
  id: string;
  monthYear: string;
  month?: string;
  year?: number;
  runDate: string;
  processedDate?: string;
  totalGross: number;
  totalGrossSalary?: number;
  totalGrossPay?: number;
  totalNet: number;
  totalNetPayable?: number;
  totalNetPay?: number;
  totalDeductions?: number;
  totalPfEe: number;
  totalPfEr: number;
  totalEsic: number;
  totalTds: number;
  totalPt: number;
  totalEmployees: number;
  status: 'Draft' | 'Approved' | 'Disbursed';
  payslips: EmployeeSalarySlip[];
  slips?: EmployeeSalarySlip[];
}

export interface ExitApprovalStage {
  status: 'Pending' | 'Approved' | 'Rejected';
  approverName?: string;
  approverId?: string;
  actionDate?: string;
  remarks?: string;
  recommendedLastWorkingDate?: string;
  handoverCompleted?: boolean;
  handoverDocUrl?: string;
  assetsClearanceConfirmed?: boolean;
  idCardReturned?: boolean;
  premisesAccessRevoked?: boolean;
  facilityDuesCleared?: boolean;
  exitInterviewConducted?: boolean;
  exitInterviewNotes?: string;
  noticeWaiverDays?: number;
  finalApprovedLastDate?: string;
  relievingLetterIssued?: boolean;
  relievingLetterNumber?: string;
}

export interface ResignationRecord {
  id: string;
  empId: string;
  empName: string;
  empCode: string;
  designation: string;
  department: string;
  dateOfJoining: string;
  resignationDate: string;
  requestedRelievingDate: string;
  approvedLastWorkingDate: string;
  reasonCategory: 'Career Growth' | 'Relocation' | 'Compensation' | 'Personal / Health' | 'Higher Studies' | 'Retirement' | 'Other';
  employeeRemarks: string;
  managerRemarks?: string;
  noticePeriodDays: number;
  noticeShortfallDays: number;
  status: 'Submitted' | 'Manager Approved' | 'Admin Approved' | 'HR Approved' | 'Notice Period' | 'Clearances In Progress' | 'Ready for F&F' | 'Shared with Finance' | 'F&F Completed' | 'Settled' | 'Relieved' | 'Rejected' | 'Withdrawn';
  
  // Organization Best Practice 3-Tier Approvals
  approvals?: {
    manager: ExitApprovalStage;
    admin: ExitApprovalStage;
    hr: ExitApprovalStage;
  };

  clearances: {
    itAssets: boolean;
    itAssetsRemarks?: string;
    financeAdvances: boolean;
    financeAdvancesRemarks?: string;
    projectHandover: boolean;
    projectHandoverRemarks?: string;
    adminIdCard: boolean;
    adminRemarks?: string;
    hrExitInterview?: boolean;
    hrRemarks?: string;
  };

  fnfSettlement?: {
    // Earnings (+)
    unpaidSalaryDays: number;
    unpaidSalaryAmount: number;
    leaveEncashmentDays: number;
    leaveEncashmentAmount: number;
    gratuityAmount: number;
    bonusOrIncentives?: number;
    reimbursementsPending?: number;
    otherEarnings?: number;
    totalEarnings?: number;

    // Deductions (-)
    noticeRecoveryDays?: number;
    noticeRecoveryAmount: number;
    imprestAdvanceDeduction?: number;
    assetDamageOrLossDeduction?: number;
    tdsTaxDeduction?: number;
    pfDeduction?: number;
    otherDeductions: number;
    totalDeductions?: number;

    // Net Payable Amount
    netPayableAmount: number;

    // Finance Handover & Payment Processing Details
    sharedWithFinanceDate?: string;
    financeStatus?: 'Draft' | 'Sent to Finance' | 'Verified by Finance' | 'Payment Processed' | 'Payment Released';
    paymentMethod?: 'Bank Transfer / NEFT' | 'RTGS' | 'UPI' | 'Cheque';
    paymentRef?: string;
    paymentDate?: string;
    financeRemarks?: string;
    financeVoucherNumber?: string;
    financeDisbursedBy?: string;
  };

  // Backwards compatibility for alternate property access
  employeeName?: string;
  lastWorkingDate?: string;
  clearanceChecklist?: {
    itAssetsHandedOver: boolean;
    projectHandoverComplete: boolean;
    financeAdvanceCleared: boolean;
  };
  fullAndFinalSettlement?: any;
}

// -------------------------------------------------------------
// EXTENDED 12 HR SUB-MODULE INTERFACES
// -------------------------------------------------------------

// 1. Organization & HR Master
export interface DepartmentMaster {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  totalPositions: number;
  activeEmployees: number;
  costCenterCode: string;
  description: string;
}

export interface DesignationGrade {
  id: string;
  gradeCode: string; // e.g. L1, L2, L3, L4, L5, L6
  title: string;
  band: 'Executive Leadership' | 'Senior Management' | 'Middle Engineering' | 'Junior Engineering' | 'Field Operations' | 'Support Staff' | string;
  minSalaryAnnual: number;
  maxSalaryAnnual: number;
  noticePeriodDays: number;
  probationMonths: number;
}

export interface ShiftMaster {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  halfDayHours: number;
  fullDayHours: number;
  isNightShift: boolean;
  applicableDepartments: string[];
}

export interface CompanyPolicyDocument {
  id: string;
  title: string;
  category: 'Safety & Site Protocols' | 'Conduct & Ethics' | 'Travel & Per-Diem' | 'Leave & Attendance' | 'Statutory & Compliance' | string;
  version: string;
  effectiveDate: string;
  summary: string;
  fileSize: string;
  isMandatoryAcknowledgment: boolean;
}

// 2. Employee Assets & Documents (Extension of Employee Master)
export interface EmployeeAsset {
  id: string;
  empId: string;
  assetType: 'Laptop / PC' | 'HVAC Multimeter / Micron Gauge' | 'Safety Harness & PPE Kit' | 'Mobile Handset' | 'Sim Card' | 'Vehicle / Fuel Card';
  assetTag: string;
  serialNumber: string;
  allocatedDate: string;
  condition: 'Brand New' | 'Good' | 'Fair';
  returnDate?: string;
  returnedDate?: string;
  status: 'Allocated' | 'Returned' | 'Under Repair';
  returnRemarks?: string;
  returnCondition?: 'Brand New' | 'Good' | 'Fair' | 'Damaged' | 'Normal Wear & Tear';
  receivedBy?: string;
}

export interface EmployeeDocument {
  id: string;
  empId: string;
  docType: 'Aadhaar Card' | 'PAN Card' | 'Degree / Diploma Certificate' | 'Appointment Letter' | 'Previous Relieving Letter' | 'Form 16' | 'Medical Fitness';
  fileName: string;
  uploadDate: string;
  verificationStatus: 'Verified' | 'Pending Review' | 'Rejected';
  verifiedBy?: string;
}

// 3. Onboarding Task
export interface OnboardingTask {
  id: string;
  candidateId: string;
  empName: string;
  title: string;
  department: 'HR' | 'IT Admin' | 'Finance / Payroll' | 'Site HSE Safety' | 'Reporting Manager' | 'HR Admin' | string;
  dueDate: string;
  status: 'Completed' | 'Pending' | 'In Progress';
  completedAt?: string;
}

// 4. Attendance Regularization
export interface AttendanceRegularization {
  id: string;
  empId: string;
  empName: string;
  empCode: string;
  date: string;
  punchType: 'Missed Punch' | 'Site Direct Visit' | 'WFH Request' | 'Client Meeting';
  inTime: string;
  outTime: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  actionBy?: string;
}

// 8. Performance Management
export interface AppraisalCycle {
  id: string;
  title: string;
  period: string; // e.g. FY 2025-26 Q1
  startDate: string;
  endDate: string;
  status: 'Active' | 'Under Review' | 'Completed';
  totalEligible: number;
  completedReviews: number;
}

export interface EmployeeAppraisal {
  id: string;
  cycleId: string;
  empId: string;
  empCode: string;
  empName: string;
  designation: string;
  department: string;
  reportingManager: string;
  selfRating: number; // 1 to 5
  managerRating: number; // 1 to 5
  finalRating: number; // 1 to 5
  kraScores: {
    kraTitle: string;
    weightagePct: number;
    selfScore: number;
    managerScore: number;
    comments: string;
  }[];
  keyAchievements: string;
  areasOfImprovement: string;
  trainingNeeds: string[];
  promotedTo?: string;
  recommendedIncrementPct: number;
  status: 'Self Review' | 'Manager Review' | 'HR Normalization' | 'Completed';
  submittedDate: string;
}

// 9. Training & Talent Management
export interface TrainingCourse {
  id: string;
  courseCode: string;
  title: string;
  category: 'HVAC Technical' | 'Site HSE & Safety' | 'BMS & Controls' | 'Project Management' | 'Soft Skills & Leadership';
  durationHours: number;
  trainerName: string;
  format: 'Classroom & Site Workshop' | 'Online Webinar' | 'Hands-on Lab';
  targetAudience: string;
  totalEnrolled: number;
  totalCompleted: number;
  passingScorePct: number;
  description: string;
  upcomingDate: string;
}

export interface EmployeeSkillMatrix {
  id: string;
  empId: string;
  empName: string;
  designation: string;
  department: string;
  skills: {
    skillName: string;
    category: 'Technical Sizing' | 'Site Execution' | 'Testing & Commissioning' | 'Safety Compliance';
    proficiencyLevel: 1 | 2 | 3 | 4; // 1: Beginner, 2: Intermediate, 3: Advanced, 4: Master Specialist
    certified: boolean;
  }[];
}

// 10. Travel, Expense & Benefits
export interface TravelRequest {
  id: string;
  travelCode: string;
  empId: string;
  empName: string;
  designation: string;
  purpose: 'Client Site Commissioning' | 'Tender Survey & Kickoff' | 'Vendor Factory Inspection' | 'Architect / PMC Meeting';
  originCity: string;
  destinationCity: string;
  departureDate: string;
  returnDate: string;
  estimatedCost: number;
  perDiemAllowance: number;
  advanceRequested: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Settled';
  approvedBy?: string;
}

export interface ExpenseClaim {
  id: string;
  claimCode: string;
  empId: string;
  empName: string;
  category: 'Site Fuel & Conveyance' | 'Lodging & Hotel' | 'Tolls & Parking' | 'Client Refreshments' | 'Emergency Site Hardware';
  amount: number;
  expenseDate: string;
  projectName?: string;
  description: string;
  billAttached: boolean;
  receiptNumber?: string;
  status: 'Submitted' | 'Manager Approved' | 'Finance Reimbursed' | 'Rejected';
  approvedAmount?: number;
}

// 11. Grievance & Employee Relations
export interface GrievanceTicket {
  id: string;
  ticketNumber: string;
  empId?: string;
  empName?: string;
  isAnonymous: boolean;
  category: 'Workplace Environment' | 'Harassment / POSH' | 'Compensation & Overtime' | 'Manager Conflict' | 'Site Safety Issue';
  subject: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Under Investigation' | 'Committee Hearing' | 'Resolved' | 'Closed';
  assignedTo: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionSummary?: string;
}

// 12. HR Analytics & Workforce Planning
export interface WorkforceForecast {
  id: string;
  quarter: string; // e.g. Q3 FY 2026
  department: string;
  currentHeadcount: number;
  projectedDemand: number;
  gapShortage: number;
  keyDrivers: string;
  budgetAllocated: number;
  hiringPriority: 'Critical' | 'High' | 'Normal';
}

// Backward-compatible type aliases
export type EmployeeMaster = Employee;
export type TimesheetRecord = TimesheetEntry;
export type HolidayRecord = CompanyHoliday;
export type JournalVoucherEntry = VoucherEntry;

// 13. Daily Business KPIs & WhatsApp Trigger System
export interface AgingBucketItem {
  count: number;
  amount: number;
  invoiceNumbers?: string[];
  clientNames?: string[];
}

export interface AgingBucketSummary {
  bucket0to30: AgingBucketItem;
  bucket31to60: AgingBucketItem;
  bucket61to90: AgingBucketItem;
  bucketOver90: AgingBucketItem;
  totalPendingAmount: number;
  totalPendingInvoicesCount: number;
}

export interface DelayedProjectInfo {
  projectId: string;
  projectNumber: string;
  projectName: string;
  clientName: string;
  projectManager: string;
  progressPct: number;
  targetCompletionDate: string;
  delayDays: number;
  delayReason: string;
  delayCategory?: string;
  contractValue?: number;
}

export interface DailyLeadSummary {
  id: string;
  leadNumber: string;
  clientName: string;
  companyName: string;
  estimatedValue: number;
  repName: string;
  hvacType: string;
  estimatedCapacityTR?: number;
  status: string;
}

export interface DailyKpiSnapshot {
  id: string;
  date: string; // YYYY-MM-DD
  generatedAt: string;
  
  // 1. New Leads
  newLeadsCount: number;
  newLeadsValue: number;
  newLeadsList: DailyLeadSummary[];
  
  // 2. Collections & Invoices
  totalCollectionsReceived: number;
  collectionsCount: number;
  totalInvoicesGenerated: number;
  invoicesGeneratedCount: number;
  collectionEfficiencyPct: number;
  
  // 3. Pending Amount Aging Buckets (0, 30, 60, 90, >90 days)
  agingBuckets: AgingBucketSummary;
  
  // 4. Total Payment Done (Vendor disbursements / payouts)
  totalPaymentsDisbursed: number;
  paymentsDisbursedCount: number;
  
  // 5. Net Business Revenue Generated
  netRevenueGenerated: number;
  awardedDealsCount: number;
  awardedDealsValue: number;
  activePipelineValue: number;
  
  // 6. Delayed Projects with Reason
  delayedProjectsCount: number;
  delayedProjects: DelayedProjectInfo[];
  
  // Formatted Output
  formattedWhatsAppText: string;
  
  // Trigger Execution Metadata
  triggeredBy?: string;
  triggeredAt?: string;
  recipientsCount?: number;
  status: 'Draft' | 'Sent' | 'Scheduled' | 'Failed';
}

export interface WhatsAppTriggerRecipient {
  id: string;
  name: string;
  phone: string;
  role: string;
  designation: string;
  active: boolean;
  notes?: string;
}

export interface WhatsAppTriggerConfig {
  enabled: boolean;
  autoTriggerTime: string; // e.g. "08:30" (AM)
  triggerDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  autoTriggerOnSync: boolean;
  includeDetailedLeadNames: boolean;
  includeDelayedProjectReasons: boolean;
  includeAgingBreakdown: boolean;
  recipients: WhatsAppTriggerRecipient[];
  customHeaderTitle?: string;
  customFooterNote?: string;
  lastTriggeredAt?: string;
  lastTriggerDate?: string;
  triggerHistory?: DailyKpiSnapshot[];
}

// 14. MongoDB Linked Database & Migration
export interface MongoDbStatus {
  configured: boolean;
  connected: boolean;
  mode: 'mongodb_cluster' | 'emulated_local';
  databaseName: string;
  maskedUri?: string;
  pingMs?: number;
  collectionsCount: number;
  collections: Record<string, number>;
  lastMigratedAt?: string;
  message?: string;
  error?: string;
  ipWhitelistRequired?: boolean;
  egressIp?: string;
}

export interface MongoCollectionReport {
  collection: string;
  count: number;
  status: 'migrated' | 'skipped';
}

export interface MongoMigrationResult {
  success: boolean;
  error?: string;
  totalMasterRecords: number;
  totalTransactionRecords: number;
  collectionCounts: Record<string, number>;
  collectionsReport: MongoCollectionReport[];
  migratedAt: string;
  durationMs: number;
  databaseName: string;
  target: string;
}

export interface MongoRestoreResult {
  success: boolean;
  error?: string;
  totalMasterRecords: number;
  totalTransactionRecords: number;
  collectionsRestored: Record<string, number>;
  restoredAt: string;
  source: string;
}

// Environment Variables & Secrets Management in Super Admin
export interface AdminEnvVariableItem {
  key: string;
  value: string;
  category: string;
  description: string;
  sensitive: boolean;
  required: boolean;
  example: string;
  defaultValue: string;
  isConfigured: boolean;
  isCustom: boolean;
  source: 'process_env' | 'env_file' | 'default' | 'not_set';
}

export interface AdminEnvMetadata {
  envFilePath: string;
  envFileExists: boolean;
  canWriteToFile: boolean;
  totalCount: number;
  configuredCount: number;
  missingCount: number;
  customCount: number;
  lastUpdated: string;
  nodeEnv: string;
  platform: string;
}

export interface AdminEnvSummary {
  variables: AdminEnvVariableItem[];
  metadata: AdminEnvMetadata;
}

export interface AdminEnvTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  details?: any;
}



