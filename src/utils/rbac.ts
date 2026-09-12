import { UserRole } from '../types';

export interface RoleMetadata {
  id: UserRole;
  name: string;
  department: string;
  badge: string;
  badgeColor: string;
  description: string;
  keyPermissions: string[];
}

export interface AppModuleInfo {
  id: string;
  name: string;
  shortName: string;
  category: 'management' | 'sales_eng' | 'services' | 'supply_chain' | 'finance' | 'hr' | 'system';
  categoryLabel: string;
  description: string;
  defaultRoles: UserRole[];
  isEssential?: boolean; // Modules like search or dashboard that are core utilities
}

export const APP_MODULES: AppModuleInfo[] = [
  // Management & Strategy
  {
    id: 'search',
    name: 'Global ERP Search & Lookup',
    shortName: 'Global Search',
    category: 'management',
    categoryLabel: 'Management & Strategy',
    description: 'Universal instant search across all leads, quotes, projects, POs, items, and team records.',
    defaultRoles: ['executive', 'sales_manager', 'estimator', 'procurement', 'warehouse', 'finance', 'technician'],
    isEssential: true
  },
  {
    id: 'dashboard',
    name: 'Executive Management Dashboard',
    shortName: 'Dashboard',
    category: 'management',
    categoryLabel: 'Management & Strategy',
    description: 'High-level business KPIs, gross margins, project status distributions, cashflow and sales trends.',
    defaultRoles: ['executive', 'sales_manager', 'estimator', 'procurement', 'warehouse', 'finance']
  },
  {
    id: 'pitch_deck',
    name: 'Interactive Investor Pitch Deck',
    shortName: 'Pitch Deck',
    category: 'management',
    categoryLabel: 'Management & Strategy',
    description: 'Interactive presentation deck for investors, business partners, and key stakeholders.',
    defaultRoles: ['executive', 'sales_manager']
  },
  {
    id: 'sales',
    name: 'Sales Quotas & Bonus Performance',
    shortName: 'Sales Quotas',
    category: 'management',
    categoryLabel: 'Management & Strategy',
    description: 'Sales representative targets, achievement percentages, and commission incentives.',
    defaultRoles: ['executive', 'sales_manager']
  },

  // Sales & Engineering
  {
    id: 'crm',
    name: 'CRM & HVAC Leads Pipeline',
    shortName: 'CRM Leads',
    category: 'sales_eng',
    categoryLabel: 'Sales & Engineering',
    description: 'Manage prospect stages, scheduled site surveys, communication logs, and customer contacts.',
    defaultRoles: ['executive', 'sales_manager', 'estimator']
  },
  {
    id: 'quotes',
    name: 'Techno-Commercial Quotations',
    shortName: 'Quotations',
    category: 'sales_eng',
    categoryLabel: 'Sales & Engineering',
    description: 'Itemized HVAC BOQ estimates, heat load calculations, discounts, and GST billing rates.',
    defaultRoles: ['executive', 'sales_manager', 'estimator']
  },
  {
    id: 'projects',
    name: 'Projects & BOQ Inventory Engine',
    shortName: 'Projects & BOQ',
    category: 'sales_eng',
    categoryLabel: 'Sales & Engineering',
    description: 'Live HVAC project progress, milestone execution, shortage takeoffs, and BOQ material allocation.',
    defaultRoles: ['executive', 'sales_manager', 'estimator', 'procurement', 'technician']
  },
  {
    id: 'cost_analysis',
    name: 'Project Cost Variance & Actuals Analysis',
    shortName: 'Cost Analysis',
    category: 'sales_eng',
    categoryLabel: 'Sales & Engineering',
    description: 'Real-time project cost tracking, contract budget vs PO commitment variance, and margin preservation.',
    defaultRoles: ['executive', 'sales_manager', 'estimator', 'finance', 'procurement']
  },

  // Services & AMC Operations
  {
    id: 'services_amc',
    name: 'HVAC Services & AMC Contracts',
    shortName: 'Services & AMC',
    category: 'services',
    categoryLabel: 'Services & AMC Operations',
    description: 'Annual Maintenance Contracts (AMC), PPM schedules, SLA compliance, equipment health, and emergency breakdown tickets.',
    defaultRoles: ['executive', 'sales_manager', 'estimator', 'technician', 'warehouse', 'service_manager']
  },
  {
    id: 'services_schedule',
    name: 'Service Scheduling & PPM Visits',
    shortName: 'PPM Scheduling',
    category: 'services',
    categoryLabel: 'Services & AMC Operations',
    description: 'Technician dispatch, 4-point HVAC inspection checklists, preventive maintenance visits, and 24x7 emergency ticket resolution.',
    defaultRoles: ['executive', 'sales_manager', 'estimator', 'technician', 'warehouse', 'service_manager']
  },
  {
    id: 'workorders',
    name: 'Work Orders & Field Operations',
    shortName: 'Work Orders',
    category: 'services',
    categoryLabel: 'Services & AMC Operations',
    description: 'Site installation tickets, HVAC testing checklists, technician dispatch, and handover certs.',
    defaultRoles: ['executive', 'technician', 'warehouse', 'service_manager']
  },

  // Supply Chain & Procurement
  {
    id: 'procurement',
    name: 'Procurement & PR/PO Pipeline',
    shortName: 'PR / PO Orders',
    category: 'supply_chain',
    categoryLabel: 'Supply Chain & Field',
    description: 'Purchase Requisitions (PR), OEM Purchase Orders (PO), vendor transmission, and credit terms.',
    defaultRoles: ['executive', 'procurement', 'estimator', 'warehouse']
  },
  {
    id: 'inventory',
    name: 'Warehouse Stock & SKU Catalog',
    shortName: 'Warehouse Stock',
    category: 'supply_chain',
    categoryLabel: 'Supply Chain & Field',
    description: 'Multi-bay storage bins, SKU counts, reorder level alerts, and Goods Receipt Notes (GRN).',
    defaultRoles: ['executive', 'warehouse', 'procurement', 'technician']
  },

  // Finance & Commercial
  {
    id: 'finance',
    name: 'General Ledger & Journal Vouchers',
    shortName: 'Finance & Ledger',
    category: 'finance',
    categoryLabel: 'Finance & Accounting',
    description: 'Chart of accounts, debit/credit journal vouchers, TDS compliance, and financial audits.',
    defaultRoles: ['executive', 'finance']
  },
  {
    id: 'payments',
    name: 'Invoices & Milestone Receivables',
    shortName: 'Invoices & Billing',
    category: 'finance',
    categoryLabel: 'Finance & Accounting',
    description: 'Commercial tax invoices, client remittance milestones, payment receipts, and vendor payouts.',
    defaultRoles: ['executive', 'finance', 'sales_manager']
  },

  // HR & Self-Service
  {
    id: 'hr',
    name: 'HR, Job Requisitions & Payroll',
    shortName: 'HR & Payroll',
    category: 'hr',
    categoryLabel: 'HR & Organization',
    description: 'Organization master, candidate pipeline, biometric attendance, timesheets, and monthly payroll.',
    defaultRoles: ['executive', 'finance']
  },
  {
    id: 'ess',
    name: 'Employee Self-Service (ESS / MSS)',
    shortName: 'ESS Portal',
    category: 'hr',
    categoryLabel: 'HR & Organization',
    description: 'Leave applications, payslip downloads, daily attendance clock-in, and expense claims.',
    defaultRoles: ['executive', 'sales_manager', 'estimator', 'procurement', 'warehouse', 'finance', 'technician'],
    isEssential: true
  },

  // Master Data & Administration
  {
    id: 'masterdata',
    name: 'Master Data Management',
    shortName: 'Master Data',
    category: 'system',
    categoryLabel: 'System & Master Data',
    description: 'Corporate client accounts, vendor directories, cost centers, tax slabs, and payment terms.',
    defaultRoles: ['executive', 'sales_manager', 'procurement', 'finance']
  },
  {
    id: 'sheets',
    name: 'Google Sheet Live Master Sync',
    shortName: 'Google Sheets',
    category: 'system',
    categoryLabel: 'System & Master Data',
    description: 'Automated bidirectional cloud synchronization with corporate Google Sheets databases.',
    defaultRoles: ['executive']
  },
  {
    id: 'users',
    name: 'Users & RBAC Roles Governance',
    shortName: 'User Directory',
    category: 'system',
    categoryLabel: 'System & Master Data',
    description: 'Manage staff credentials, access levels, role-to-module mappings, and security policies.',
    defaultRoles: ['executive']
  },
  {
    id: 'customization',
    name: 'Admin Customization & Numbering',
    shortName: 'Admin Settings',
    category: 'system',
    categoryLabel: 'System & Master Data',
    description: 'Configure corporate branding, auto-numbering prefixes, thresholds, and backup restoration.',
    defaultRoles: ['executive']
  },
  {
    id: 'audit',
    name: 'Security & Audit Trail Logs',
    shortName: 'Audit Logs',
    category: 'system',
    categoryLabel: 'System & Master Data',
    description: 'Tamper-evident logs of all transactions, user logins, data modifications, and approvals.',
    defaultRoles: ['executive', 'finance']
  }
];

export const DEFAULT_ROLE_MODULE_PERMISSIONS: Record<UserRole, string[]> = {
  executive: [
    'search',
    'dashboard',
    'pitch_deck',
    'sales',
    'crm',
    'quotes',
    'projects',
    'cost_analysis',
    'services_amc',
    'services_schedule',
    'workorders',
    'procurement',
    'inventory',
    'finance',
    'payments',
    'hr',
    'ess',
    'masterdata',
    'sheets',
    'users',
    'customization',
    'audit'
  ],
  sales_manager: [
    'search',
    'dashboard',
    'sales',
    'crm',
    'quotes',
    'projects',
    'cost_analysis',
    'services_amc',
    'services_schedule',
    'workorders',
    'payments',
    'ess',
    'masterdata'
  ],
  estimator: [
    'search',
    'dashboard',
    'crm',
    'quotes',
    'projects',
    'cost_analysis',
    'services_amc',
    'services_schedule',
    'workorders',
    'inventory',
    'procurement',
    'ess'
  ],
  procurement: [
    'search',
    'dashboard',
    'procurement',
    'inventory',
    'projects',
    'cost_analysis',
    'services_amc',
    'services_schedule',
    'masterdata',
    'ess'
  ],
  warehouse: [
    'search',
    'dashboard',
    'inventory',
    'procurement',
    'workorders',
    'services_amc',
    'services_schedule',
    'ess'
  ],
  finance: [
    'search',
    'dashboard',
    'finance',
    'payments',
    'procurement',
    'cost_analysis',
    'services_amc',
    'services_schedule',
    'hr',
    'masterdata',
    'ess',
    'audit'
  ],
  technician: [
    'search',
    'dashboard',
    'services_amc',
    'services_schedule',
    'workorders',
    'projects',
    'inventory',
    'ess'
  ],
  service_manager: [
    'search',
    'dashboard',
    'services_amc',
    'services_schedule',
    'workorders',
    'crm',
    'quotes',
    'projects',
    'cost_analysis',
    'procurement',
    'inventory',
    'payments',
    'masterdata',
    'ess',
    'audit'
  ]
};

export const getEffectiveRoleModules = (
  role: UserRole,
  customRoleModulePermissions?: Record<string, string[]> | Record<UserRole, string[]>
): string[] => {
  if (customRoleModulePermissions && customRoleModulePermissions[role]) {
    const customList = customRoleModulePermissions[role];
    if (Array.isArray(customList) && customList.length > 0) {
      return customList;
    }
  }
  return DEFAULT_ROLE_MODULE_PERMISSIONS[role] || DEFAULT_ROLE_MODULE_PERMISSIONS.executive;
};

export const canRoleAccessTab = (
  role: UserRole,
  tabId: string,
  customRoleModulePermissions?: Record<string, string[]> | Record<UserRole, string[]>
): boolean => {
  const allowed = getEffectiveRoleModules(role, customRoleModulePermissions);
  return allowed.includes(tabId);
};

export const ROLE_DEFINITIONS: Record<UserRole, RoleMetadata> = {
  executive: {
    id: 'executive',
    name: 'Executive / Managing Director (Admin)',
    department: 'Executive Management',
    badge: 'Super Admin',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Full unrestricted super-admin privileges across all ERP workflows, approvals, finance, settings, and user management.',
    keyPermissions: [
      'Full Admin Control (Create, Edit, Delete, Override)',
      'PR Approvals & Rejections',
      'PO Approvals & Business Sign-off',
      'User Management (Add, Define Roles, Deactivate Users)',
      'Quote & Contract Awarding',
      'Financial Approvals & Billing Settlement',
      'Google Sheets Sync & System Config'
    ]
  },
  procurement: {
    id: 'procurement',
    name: 'Purchase / Procurement Manager',
    department: 'Procurement & Supply Chain',
    badge: 'Procurement Approver',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Responsible for reviewing & approving PRs, creating POs, negotiating vendor credit terms, dispatching orders, and tracking supply chains.',
    keyPermissions: [
      'Approve & Reject Purchase Requisitions (PR)',
      'Create Direct POs & Convert PRs to POs',
      'Transmit POs to Vendors via WhatsApp / Email',
      'Manage Vendor Directory & Credit Terms',
      'Inward Goods & Goods Receipt Notes (GRN)'
    ]
  },
  sales_manager: {
    id: 'sales_manager',
    name: 'Business Manager / Sales Head',
    department: 'Business Development & Sales',
    badge: 'Business Sign-off',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Drives commercial pipeline, awards client contracts, manages quotas, and provides final Business Sign-off / approval for Purchase Orders (POs).',
    keyPermissions: [
      'Approve & Reject Purchase Orders (PO Sign-off)',
      'Lead CRM & Client Pipeline Stage Management',
      'Contract Awarding & Conversion to Live Projects',
      'Manage Sales Quotas & Commissions'
    ]
  },
  estimator: {
    id: 'estimator',
    name: 'Chief MEP & HVAC Estimator',
    department: 'Engineering & Estimations',
    badge: 'Engineering & BOQ',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Performs heat load calculation, builds cost estimates, creates quotes, generates BOQs, and raises PRs for deficit materials.',
    keyPermissions: [
      'Create & Revise Quotations and Margin Analysis',
      'Generate BOQ Lines & Material Takeoffs',
      'Raise Purchase Requisitions (PR) for Material Shortages',
      'View CRM Leads & Engineering Specs'
    ]
  },
  warehouse: {
    id: 'warehouse',
    name: 'Warehouse & Inventory Superintendent',
    department: 'Logistics & Warehouse',
    badge: 'Stock Controller',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'Manages physical warehouse bays, stock adjustments, safety thresholds, and processes GRN inwarding against open POs.',
    keyPermissions: [
      'Inventory Stock Management & Adjustments',
      'Process Inward Goods Receipt Notes (GRN)',
      'Fulfill BOQ Shortages from Stock',
      'Warehouse Bay Re-allocation'
    ]
  },
  finance: {
    id: 'finance',
    name: 'Financial Controller & Accounts Head',
    department: 'Finance & Accounts',
    badge: 'Finance Controller',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Oversees milestone invoicing, client receivables, vendor payables (PO payouts), and financial ledger audits.',
    keyPermissions: [
      'Generate Milestone Invoices & Client Billing',
      'Settle Client Receipts & Vendor Payouts',
      'Reconcile NEFT/UPI Transaction Proofs',
      'Accounts Receivable & Payable Ledgers'
    ]
  },
  technician: {
    id: 'technician',
    name: 'Senior HVAC Field Service Engineer',
    department: 'Field Engineering & Commissioning',
    badge: 'Field Operations',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Executes on-site HVAC maintenance checkups, 4-point PPM inspections, emergency breakdown resolution, and refrigerant pressure telemetry.',
    keyPermissions: [
      'Update Work Order Progress & Checklists',
      'Log Equipment Health & Refrigerant Pressure Readings',
      'Resolve 24x7 Emergency Breakdown Tickets',
      'Raise On-Site Material Requisitions (PR)'
    ]
  },
  service_manager: {
    id: 'service_manager',
    name: 'Service Operations Manager & AMC Head',
    department: 'Services & Operations',
    badge: 'Service Manager',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Directs AMC contract execution, technician dispatch, SLA uptime adherence, equipment maintenance logs, and emergency ticket resolution.',
    keyPermissions: [
      'Manage AMC Contracts & Renewal Quotations',
      'Schedule & Assign Preventive Maintenance (PPM) Visits',
      'Dispatch Technicians for 24x7 Emergency Breakdowns',
      'Track Equipment Health Logs & Refrigerant Telemetry',
      'Review Service Realization & Maintenance Billing'
    ]
  }
};

export const RBAC = {
  // PR Permissions
  canCreatePR: (role: UserRole): boolean => {
    return ['executive', 'procurement', 'estimator', 'sales_manager', 'technician', 'service_manager'].includes(role);
  },
  canApprovePR: (role: UserRole): boolean => {
    return ['executive', 'procurement'].includes(role);
  },
  canRejectPR: (role: UserRole): boolean => {
    return ['executive', 'procurement'].includes(role);
  },

  // PO Permissions
  canCreatePO: (role: UserRole): boolean => {
    return ['executive', 'procurement', 'sales_manager'].includes(role);
  },
  canApprovePO: (role: UserRole): boolean => {
    return ['executive', 'sales_manager'].includes(role);
  },
  canRejectPO: (role: UserRole): boolean => {
    return ['executive', 'sales_manager'].includes(role);
  },
  canTransmitPO: (role: UserRole): boolean => {
    return ['executive', 'procurement'].includes(role);
  },
  canInwardGoods: (role: UserRole): boolean => {
    return ['executive', 'warehouse', 'procurement'].includes(role);
  },

  // User Management
  canManageUsers: (role: UserRole): boolean => {
    return role === 'executive';
  },

  // CRM & Quotes
  canCreateQuote: (role: UserRole): boolean => {
    return ['executive', 'estimator', 'sales_manager'].includes(role);
  },
  canAwardQuote: (role: UserRole): boolean => {
    return ['executive', 'sales_manager'].includes(role);
  },

  // Finance
  canManageFinance: (role: UserRole): boolean => {
    return ['executive', 'finance'].includes(role);
  },

  // Quotas
  canManageQuotas: (role: UserRole): boolean => {
    return ['executive', 'sales_manager'].includes(role);
  }
};
