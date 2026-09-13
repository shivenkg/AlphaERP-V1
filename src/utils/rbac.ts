import {
  UserRole,
  UserProfile,
  EnterpriseFunction,
  CustomRoleDefinition,
  SodConflictRule,
  SodViolation,
  BusinessRole
} from '../types';

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
    description: 'Interactive presentation deck for investors, business partners, and key stakeholders (Superadmin Only).',
    defaultRoles: ['superadmin']
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
    defaultRoles: ['superadmin', 'admin', 'executive', 'finance']
  },
  {
    id: 'license',
    name: 'Enterprise Licensing & System Control',
    shortName: 'License Manager',
    category: 'system',
    categoryLabel: 'System & Master Data',
    description: 'Generate time-based enterprise licenses, manage active installations, and enforce seat limits (Superadmin Only).',
    defaultRoles: ['superadmin']
  }
];

export const DEFAULT_ROLE_MODULE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: [
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
    'audit',
    'license'
  ],
  admin: [
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
  executive: [
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
  // Pitch deck and license management are strictly accessible only to superadmin
  if (tabId === 'pitch_deck' || tabId === 'license') {
    return role === 'superadmin';
  }
  const allowed = getEffectiveRoleModules(role, customRoleModulePermissions);
  return allowed.includes(tabId);
};

export const ROLE_DEFINITIONS: Record<UserRole, RoleMetadata> = {
  superadmin: {
    id: 'superadmin',
    name: 'Root Super Administrator',
    department: 'Information Security & Executive Office',
    badge: 'SuperAdmin',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60',
    description: 'Supreme unrestricted governance authority across all ERP systems, exclusive Investor Pitch Deck access, license generation & controls, and admin user activation/deactivation.',
    keyPermissions: [
      'Full Root Administrative Control',
      'Exclusive Access to Investor Pitch Deck',
      'Generate, Control & Implement System Licenses',
      'Activate & Disable Admin & User Accounts',
      'Segregation of Duties (SoD) Overrides',
      'All Financial, Operational & Technical Approvals'
    ]
  },
  admin: {
    id: 'admin',
    name: 'Enterprise System Administrator',
    department: 'IT & System Operations',
    badge: 'Enterprise Admin',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
    description: 'Enterprise administrator with complete access to all business workflows, master configurations, user directory, and operational management.',
    keyPermissions: [
      'Operational Admin Control (Workflows & Masters)',
      'User Directory & Role Assignments',
      'PR & PO Authorizations',
      'Financial & Accounting Approvals',
      'Customization & Numbering Series',
      'Audit Trail Monitoring'
    ]
  },
  executive: {
    id: 'executive',
    name: 'Executive / Managing Director',
    department: 'Executive Management',
    badge: 'Executive Director',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
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

// =========================================================================
// 36 GRANULAR ENTERPRISE FUNCTIONS CATALOG (Across 9 Business Domains)
// =========================================================================

export const ENTERPRISE_FUNCTIONS: EnterpriseFunction[] = [
  // 1. CRM & Sales Pipeline
  {
    id: 'fn_crm_lead_view',
    code: 'CRM-01',
    name: 'View Inbound Leads & Customer Accounts',
    domain: 'crm_sales',
    domainLabel: 'CRM & Sales Pipeline',
    description: 'Read-only access to customer inquiries, company profiles, and CRM deal stages.',
    riskLevel: 'LOW',
    defaultRoles: ['executive', 'sales_manager', 'estimator', 'service_manager', 'technician']
  },
  {
    id: 'fn_crm_lead_create',
    code: 'CRM-02',
    name: 'Create & Qualify Inbound Leads',
    domain: 'crm_sales',
    domainLabel: 'CRM & Sales Pipeline',
    description: 'Capture new prospect records, contact details, project types, and initial heat load expectations.',
    riskLevel: 'LOW',
    defaultRoles: ['executive', 'sales_manager', 'estimator']
  },
  {
    id: 'fn_crm_survey_schedule',
    code: 'CRM-03',
    name: 'Schedule & Record Technical Site Surveys',
    domain: 'crm_sales',
    domainLabel: 'CRM & Sales Pipeline',
    description: 'Assign site engineers, schedule physical room dimension surveys, and record ceiling heights.',
    riskLevel: 'MEDIUM',
    defaultRoles: ['executive', 'sales_manager', 'estimator', 'service_manager']
  },
  {
    id: 'fn_crm_deal_advance',
    code: 'CRM-04',
    name: 'Advance CRM Deal Stages & Negotiations',
    domain: 'crm_sales',
    domainLabel: 'CRM & Sales Pipeline',
    description: 'Progress leads through survey, estimation, quote sent, and commercial negotiations.',
    riskLevel: 'MEDIUM',
    defaultRoles: ['executive', 'sales_manager']
  },

  // 2. Engineering & Quotation
  {
    id: 'fn_quote_create',
    code: 'EST-01',
    name: 'Draft HVAC Line-Item BOQ & Quotations',
    domain: 'engineering_quote',
    domainLabel: 'Engineering & Quotation',
    description: 'Draft itemized equipment, piping, ducting, grilles, and labor line items with unit costs.',
    riskLevel: 'MEDIUM',
    defaultRoles: ['executive', 'sales_manager', 'estimator']
  },
  {
    id: 'fn_quote_pricing_override',
    code: 'EST-02',
    name: 'Apply Custom Discounts & Margin Overrides',
    domain: 'engineering_quote',
    domainLabel: 'Engineering & Quotation',
    description: 'Modify standard markup percentages, adjust unit selling rates, and apply client discount amounts.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive', 'sales_manager']
  },
  {
    id: 'fn_quote_commercial_approve',
    code: 'EST-03',
    name: 'Commercial Approval & Award Quote to Project',
    domain: 'engineering_quote',
    domainLabel: 'Engineering & Quotation',
    description: 'Formally approve commercial quotations and convert awarded bids into live HVAC site projects.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive', 'sales_manager']
  },
  {
    id: 'fn_quote_print_export',
    code: 'EST-04',
    name: 'Export Formal Client Quotation PDF',
    domain: 'engineering_quote',
    domainLabel: 'Engineering & Quotation',
    description: 'Generate high-resolution printable client quotation sheets with bank terms and GST breakdown.',
    riskLevel: 'LOW',
    defaultRoles: ['executive', 'sales_manager', 'estimator']
  },

  // 3. Project BOQ & Site Execution
  {
    id: 'fn_proj_view_workspace',
    code: 'PRJ-01',
    name: 'View Project Milestones & BOQ Workspace',
    domain: 'project_boq',
    domainLabel: 'Project BOQ & Site Execution',
    description: 'Access project Gantt timeline, milestone completions, and allocated inventory reserves.',
    riskLevel: 'LOW',
    defaultRoles: ['executive', 'sales_manager', 'estimator', 'procurement', 'technician', 'service_manager']
  },
  {
    id: 'fn_proj_reconcile_shortages',
    code: 'PRJ-02',
    name: 'Reconcile BOQ Shortages & Stock Allocations',
    domain: 'project_boq',
    domainLabel: 'Project BOQ & Site Execution',
    description: 'Reconcile required vs available warehouse inventory and generate shortage take-off deficit items.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive', 'estimator', 'procurement']
  },
  {
    id: 'fn_proj_workorder_release',
    code: 'PRJ-03',
    name: 'Release Field Commissioning Work Orders',
    domain: 'project_boq',
    domainLabel: 'Project BOQ & Site Execution',
    description: 'Authorize site installation tickets, piping pressure test checklists, and technician dispatch.',
    riskLevel: 'MEDIUM',
    defaultRoles: ['executive', 'technician', 'service_manager']
  },
  {
    id: 'fn_proj_final_handover',
    code: 'PRJ-04',
    name: 'Signoff Final Project Handover & DLP Clearance',
    domain: 'project_boq',
    domainLabel: 'Project BOQ & Site Execution',
    description: 'Approve completion certificate, Testing & Balancing (TAB) report, and commence Defect Liability Period.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive']
  },

  // 4. Procurement & Supply Chain
  {
    id: 'fn_proc_create_pr',
    code: 'SCM-01',
    name: 'Create Purchase Requisition (PR)',
    domain: 'procurement',
    domainLabel: 'Procurement & Supply Chain',
    description: 'Raise formal materials requisitions for project shortage take-offs or warehouse safety-stock replenishments.',
    riskLevel: 'MEDIUM',
    defaultRoles: ['executive', 'estimator', 'procurement', 'technician', 'warehouse']
  },
  {
    id: 'fn_proc_approve_pr',
    code: 'SCM-02',
    name: 'Management Approval for Purchase Requisition',
    domain: 'procurement',
    domainLabel: 'Procurement & Supply Chain',
    description: 'Authorize PR requests against project budget cost codes and approve release for PO issuance.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive', 'procurement']
  },
  {
    id: 'fn_proc_release_po',
    code: 'SCM-03',
    name: 'Generate & Authorize Vendor Purchase Order (PO)',
    domain: 'procurement',
    domainLabel: 'Procurement & Supply Chain',
    description: 'Commit binding commercial Purchase Orders with OEM manufacturers, negotiate credit terms & release to vendor.',
    riskLevel: 'CRITICAL',
    defaultRoles: ['executive', 'procurement']
  },
  {
    id: 'fn_proc_vendor_transmit',
    code: 'SCM-04',
    name: 'Transmit Purchase Orders to Vendors via SMTP/EDI',
    domain: 'procurement',
    domainLabel: 'Procurement & Supply Chain',
    description: 'Dispatch automated PO PDF attachments to vendor dispatch desks with delivery date SLAs.',
    riskLevel: 'MEDIUM',
    defaultRoles: ['executive', 'procurement']
  },

  // 5. Warehouse & Inventory
  {
    id: 'fn_inv_view_stock',
    code: 'WMS-01',
    name: 'Inspect Multi-Bay Storage Bins & Stock Counts',
    domain: 'warehouse_inventory',
    domainLabel: 'Warehouse & Inventory',
    description: 'Inspect bin locations, available vs allocated physical counts, and unit moving averages.',
    riskLevel: 'LOW',
    defaultRoles: ['executive', 'warehouse', 'procurement', 'technician', 'estimator']
  },
  {
    id: 'fn_inv_receive_grn',
    code: 'WMS-02',
    name: 'Process Physical Goods Receipt Note (GRN) Inwarding',
    domain: 'warehouse_inventory',
    domainLabel: 'Warehouse & Inventory',
    description: 'Verify incoming shipment deliveries against PO line items, conduct QC check & update warehouse stock ledger.',
    riskLevel: 'CRITICAL',
    defaultRoles: ['executive', 'warehouse']
  },
  {
    id: 'fn_inv_stock_adjustment',
    code: 'WMS-03',
    name: 'Execute Stock Adjustment, Scrap & Material Write-Off',
    domain: 'warehouse_inventory',
    domainLabel: 'Warehouse & Inventory',
    description: 'Manual corrections, scrap write-offs, physical count reconciliation, and damaged pipe deductions.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive', 'warehouse']
  },
  {
    id: 'fn_inv_safety_stock_config',
    code: 'WMS-04',
    name: 'Configure Safety-Stock Thresholds & Reorder Alerts',
    domain: 'warehouse_inventory',
    domainLabel: 'Warehouse & Inventory',
    description: 'Set minimum reorder levels, safety buffer days, and trigger automated stock deficit email alerts.',
    riskLevel: 'MEDIUM',
    defaultRoles: ['executive', 'warehouse', 'procurement']
  },

  // 6. Services & AMC Contracts
  {
    id: 'fn_svc_create_amc',
    code: 'SVC-01',
    name: 'Register Comprehensive AMC Contract & Assets',
    domain: 'services_amc',
    domainLabel: 'Services & AMC Contracts',
    description: 'Create multi-year AMC contracts, define SLA response windows, and register HVAC equipment serials.',
    riskLevel: 'MEDIUM',
    defaultRoles: ['executive', 'sales_manager', 'service_manager']
  },
  {
    id: 'fn_svc_schedule_ppm',
    code: 'SVC-02',
    name: 'Schedule Quarterly PPM Visits & Route Engineers',
    domain: 'services_amc',
    domainLabel: 'Services & AMC Contracts',
    description: 'Plan preventive maintenance calendar, assign field technicians, and track visit windows.',
    riskLevel: 'MEDIUM',
    defaultRoles: ['executive', 'service_manager', 'technician']
  },
  {
    id: 'fn_svc_execute_inspection',
    code: 'SVC-03',
    name: 'Execute 4-Point HVAC Inspection Checklist & Telemetry',
    domain: 'services_amc',
    domainLabel: 'Services & AMC Contracts',
    description: 'Record refrigerant suction/discharge pressures, delta-T airflow, motor amps, and signoff visits.',
    riskLevel: 'LOW',
    defaultRoles: ['executive', 'service_manager', 'technician']
  },
  {
    id: 'fn_svc_emergency_dispatch',
    code: 'SVC-04',
    name: 'Log & Dispatch 24x7 Critical Breakdown Tickets',
    domain: 'services_amc',
    domainLabel: 'Services & AMC Contracts',
    description: 'Receive emergency customer alerts, prioritize cooling failure tickets, and mobilize fast-response crews.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive', 'service_manager', 'technician']
  },

  // 7. Finance & Accounting
  {
    id: 'fn_fin_create_invoice',
    code: 'FIN-01',
    name: 'Generate Milestone Tax Invoice & Debit Notes',
    domain: 'finance_accounting',
    domainLabel: 'Finance & Accounting',
    description: 'Issue GST-compliant milestone invoices, calculate SGST/CGST/IGST, and record accounts receivable (AR).',
    riskLevel: 'HIGH',
    defaultRoles: ['executive', 'finance']
  },
  {
    id: 'fn_fin_record_payment',
    code: 'FIN-02',
    name: 'Record Inward Customer Wire Payments & Receipts',
    domain: 'finance_accounting',
    domainLabel: 'Finance & Accounting',
    description: 'Acknowledge bank wire transfers, reconcile customer remittances, and clear outstanding invoice balances.',
    riskLevel: 'CRITICAL',
    defaultRoles: ['executive', 'finance']
  },
  {
    id: 'fn_fin_post_jv',
    code: 'FIN-03',
    name: 'Create Balanced Double-Entry Journal Voucher (JV)',
    domain: 'finance_accounting',
    domainLabel: 'Finance & Accounting',
    description: 'Post general ledger vouchers with strict Debit === Credit mathematical validation and cost center tagging.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive', 'finance']
  },
  {
    id: 'fn_fin_tds_challan',
    code: 'FIN-04',
    name: 'Process Statutory TDS Deductions & Deposit Challans',
    domain: 'finance_accounting',
    domainLabel: 'Finance & Accounting',
    description: 'Record Section 194C contractor TDS, monitor withholding thresholds, and record BSR tax payment challans.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive', 'finance']
  },

  // 8. HR & Talent Management
  {
    id: 'fn_hr_employee_directory',
    code: 'HR-01',
    name: 'Manage Employee Master & Department Positions',
    domain: 'hr_payroll',
    domainLabel: 'HR & Talent Management',
    description: 'Maintain staff employee codes, designation grades, department allocations, and contact data.',
    riskLevel: 'MEDIUM',
    defaultRoles: ['executive', 'finance']
  },
  {
    id: 'fn_hr_biometric_attendance',
    code: 'HR-02',
    name: 'Manage Biometric Punch Logs & Shift Attendance',
    domain: 'hr_payroll',
    domainLabel: 'HR & Talent Management',
    description: 'Inspect terminal in/out time stamps, authorize attendance regularizations, and calculate overtime.',
    riskLevel: 'LOW',
    defaultRoles: ['executive', 'finance']
  },
  {
    id: 'fn_hr_run_payroll',
    code: 'HR-03',
    name: 'Calculate & Finalize Monthly Payroll Registers',
    domain: 'hr_payroll',
    domainLabel: 'HR & Talent Management',
    description: 'Execute salary computations with PF, ESI, Professional Tax, and generate monthly payslip registers.',
    riskLevel: 'CRITICAL',
    defaultRoles: ['executive', 'finance']
  },
  {
    id: 'fn_hr_exit_settlement',
    code: 'HR-04',
    name: 'Authorize Resignations & Full and Final (F&F) Settlements',
    domain: 'hr_payroll',
    domainLabel: 'HR & Talent Management',
    description: 'Conduct multi-stage exit clearances (IT, Facilities, HR) and compute gratuity & leave encashment.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive', 'finance']
  },

  // 9. System Administration & Compliance
  {
    id: 'fn_sys_manage_users',
    code: 'SYS-01',
    name: 'Provision Staff Credentials & Assign RBAC Roles',
    domain: 'system_admin',
    domainLabel: 'System Administration & Security',
    description: 'Create user profiles, issue temporary passwords, assign system roles, and revoke system access.',
    riskLevel: 'CRITICAL',
    defaultRoles: ['executive']
  },
  {
    id: 'fn_sys_configure_sod',
    code: 'SYS-02',
    name: 'Configure SoD Policies, Role Functions & Overrides',
    domain: 'system_admin',
    domainLabel: 'System Administration & Security',
    description: 'Maintain the Segregation of Duties matrix, customize enterprise roles, and document audit exceptions.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive']
  },
  {
    id: 'fn_sys_audit_logs',
    code: 'SYS-03',
    name: 'Inspect Tamper-Evident Security Audit Logs',
    domain: 'system_admin',
    domainLabel: 'System Administration & Security',
    description: 'Review immutable chronological audit trail of all transactions, logins, role changes, and data edits.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive', 'finance']
  },
  {
    id: 'fn_sys_cloud_backup',
    code: 'SYS-04',
    name: 'Execute Google Sheets Sync & Cloud Database Snapshots',
    domain: 'system_admin',
    domainLabel: 'System Administration & Security',
    description: 'Trigger full 9-tab Google Sheets sync, MongoDB Atlas exports, and local encrypted vault snapshots.',
    riskLevel: 'HIGH',
    defaultRoles: ['executive']
  }
];

// Default function IDs assigned to standard system roles
export const DEFAULT_ROLE_FUNCTION_PERMISSIONS: Record<string, string[]> = {
  superadmin: ENTERPRISE_FUNCTIONS.map((f) => f.id),
  admin: ENTERPRISE_FUNCTIONS.map((f) => f.id),
  executive: ENTERPRISE_FUNCTIONS.map((f) => f.id),
  sales_manager: [
    'fn_crm_lead_view',
    'fn_crm_lead_create',
    'fn_crm_survey_schedule',
    'fn_crm_deal_advance',
    'fn_quote_create',
    'fn_quote_pricing_override',
    'fn_quote_commercial_approve',
    'fn_quote_print_export',
    'fn_proj_view_workspace',
    'fn_svc_create_amc',
    'fn_fin_create_invoice'
  ],
  estimator: [
    'fn_crm_lead_view',
    'fn_crm_lead_create',
    'fn_crm_survey_schedule',
    'fn_quote_create',
    'fn_quote_print_export',
    'fn_proj_view_workspace',
    'fn_proj_reconcile_shortages',
    'fn_proc_create_pr',
    'fn_inv_view_stock'
  ],
  procurement: [
    'fn_proj_view_workspace',
    'fn_proj_reconcile_shortages',
    'fn_proc_create_pr',
    'fn_proc_approve_pr',
    'fn_proc_release_po',
    'fn_proc_vendor_transmit',
    'fn_inv_view_stock',
    'fn_inv_safety_stock_config'
  ],
  warehouse: [
    'fn_proc_create_pr',
    'fn_inv_view_stock',
    'fn_inv_receive_grn',
    'fn_inv_stock_adjustment',
    'fn_inv_safety_stock_config'
  ],
  finance: [
    'fn_fin_create_invoice',
    'fn_fin_record_payment',
    'fn_fin_post_jv',
    'fn_fin_tds_challan',
    'fn_hr_employee_directory',
    'fn_hr_biometric_attendance',
    'fn_hr_run_payroll',
    'fn_hr_exit_settlement',
    'fn_sys_audit_logs'
  ],
  technician: [
    'fn_proj_view_workspace',
    'fn_proj_workorder_release',
    'fn_inv_view_stock',
    'fn_svc_schedule_ppm',
    'fn_svc_execute_inspection',
    'fn_svc_emergency_dispatch'
  ],
  service_manager: [
    'fn_crm_lead_view',
    'fn_crm_survey_schedule',
    'fn_proj_view_workspace',
    'fn_proj_workorder_release',
    'fn_svc_create_amc',
    'fn_svc_schedule_ppm',
    'fn_svc_execute_inspection',
    'fn_svc_emergency_dispatch'
  ]
};

// =========================================================================
// SEGREGATION OF DUTIES (SoD) CONFLICT RULES (Enterprise HVAC / EPC)
// =========================================================================

export const ENTERPRISE_SOD_RULES: SodConflictRule[] = [
  {
    id: 'SOD-01',
    code: 'SOD-PR-01',
    title: 'PR Requisition Generation vs Management Approval',
    functionAId: 'fn_proc_create_pr',
    functionAName: 'Create Purchase Requisition (PR)',
    functionBId: 'fn_proc_approve_pr',
    functionBName: 'Management Approval for Purchase Requisition',
    severity: 'HIGH',
    riskDescription: 'A single individual can create and approve their own requisitions, bypassing budgetary verification.',
    mitigatingControl: 'Dual sign-off matrix requires separate technical estimator creation and procurement manager sign-off.'
  },
  {
    id: 'SOD-02',
    code: 'SOD-PO-GRN',
    title: 'Purchase Order Release vs Physical GRN Inwarding',
    functionAId: 'fn_proc_release_po',
    functionAName: 'Generate & Authorize Vendor Purchase Order (PO)',
    functionBId: 'fn_inv_receive_grn',
    functionBName: 'Process Physical Goods Receipt Note (GRN) Inwarding',
    severity: 'CRITICAL',
    riskDescription: 'A single user can create fictitious purchase orders and acknowledge fake receipt of physical goods (phantom orders).',
    mitigatingControl: 'Independent physical warehouse bay custodian verification with mandatory supplier delivery challan upload.'
  },
  {
    id: 'SOD-03',
    code: 'SOD-FIN-AR',
    title: 'Tax Invoice Billing vs Payment Receipt Collection',
    functionAId: 'fn_fin_create_invoice',
    functionAName: 'Generate Milestone Tax Invoice & Debit Notes',
    functionBId: 'fn_fin_record_payment',
    functionBName: 'Record Inward Customer Wire Payments & Receipts',
    severity: 'HIGH',
    riskDescription: 'Risk of teeming and lading fraud where incoming remittances are misdirected against unapproved invoices.',
    mitigatingControl: 'Direct bank statement reconciliation API feed and separate collection verification by chief accountant.'
  },
  {
    id: 'SOD-04',
    code: 'SOD-QTE-PRC',
    title: 'Quotation Discount Override vs Final Award Approval',
    functionAId: 'fn_quote_pricing_override',
    functionAName: 'Apply Custom Discounts & Margin Overrides',
    functionBId: 'fn_quote_commercial_approve',
    functionBName: 'Commercial Approval & Award Quote to Project',
    severity: 'MEDIUM',
    riskDescription: 'Estimator applies unverified discounts and approves quote, causing gross margin erosion.',
    mitigatingControl: 'Executive Managing Director sign-off mandatory on all contracts with gross margin below 15%.'
  },
  {
    id: 'SOD-05',
    code: 'SOD-INV-ADJ',
    title: 'Physical Goods Inwarding vs Stock Adjustment & Write-Off',
    functionAId: 'fn_inv_receive_grn',
    functionAName: 'Process Physical Goods Receipt Note (GRN) Inwarding',
    functionBId: 'fn_inv_stock_adjustment',
    functionBName: 'Execute Stock Adjustment, Scrap & Material Write-Off',
    severity: 'HIGH',
    riskDescription: 'Risk of inventory theft covered up by unilateral manual stock write-offs and scrap deductions.',
    mitigatingControl: 'Annual third-party inventory count and managerial counter-signature for write-offs exceeding ₹25,000.'
  },
  {
    id: 'SOD-06',
    code: 'SOD-HR-PAY',
    title: 'Monthly Payroll Run vs Finance Payout Disbursal',
    functionAId: 'fn_hr_run_payroll',
    functionAName: 'Calculate & Finalize Monthly Payroll Registers',
    functionBId: 'fn_fin_record_payment',
    functionBName: 'Record Inward Customer Wire Payments & Receipts',
    severity: 'CRITICAL',
    riskDescription: 'Adding fictitious employees to monthly payroll register with direct payout authorization.',
    mitigatingControl: 'HR submits salary sheet to Finance Controller; biometric attendance records cross-verified before disbursement.'
  },
  {
    id: 'SOD-07',
    code: 'SOD-SYS-AUD',
    title: 'User Credentials Administration vs Security Audit Log Inspection',
    functionAId: 'fn_sys_manage_users',
    functionAName: 'Provision Staff Credentials & Assign RBAC Roles',
    functionBId: 'fn_sys_audit_logs',
    functionBName: 'Inspect Tamper-Evident Security Audit Logs',
    severity: 'HIGH',
    riskDescription: 'System administrator creates illicit access privileges and modifies or suppresses audit detection.',
    mitigatingControl: 'Immutable append-only cloud audit trail mirroring to Google Sheets and independent compliance review.'
  },
  {
    id: 'SOD-08',
    code: 'SOD-BOQ-PR',
    title: 'BOQ Shortage Reconciliation vs Purchase Requisition Approval',
    functionAId: 'fn_proj_reconcile_shortages',
    functionAName: 'Reconcile BOQ Shortages & Stock Allocations',
    functionBId: 'fn_proc_approve_pr',
    functionBName: 'Management Approval for Purchase Requisition',
    severity: 'MEDIUM',
    riskDescription: 'Project engineer computes site shortages and self-approves purchase requisitions without oversight.',
    mitigatingControl: 'Central procurement head independently verifies warehouse stock availability before PR sign-off.'
  }
];

/**
 * Checks a specific list of function IDs against all standard SoD conflict rules.
 * Returns an array of rules that have been violated.
 */
export function evaluateSodConflicts(functionIds: string[]): SodConflictRule[] {
  const set = new Set(functionIds);
  return ENTERPRISE_SOD_RULES.filter((rule) => set.has(rule.functionAId) && set.has(rule.functionBId));
}

/**
 * Scans all Business Roles, Role-Function Mappings, and Users to generate a comprehensive
 * list of active SoD violations across the organization.
 */
export function evaluateAllSodViolations(
  businessRoles: BusinessRole[],
  roleFunctionMap: Record<string, string[]>,
  users: UserProfile[],
  overrides: Record<string, { notes: string; approvedBy: string; approvedAt: string }> = {}
): SodViolation[] {
  const violations: SodViolation[] = [];

  // 1. Role-Level SoD Evaluation
  Object.entries(roleFunctionMap).forEach(([roleKey, functions]) => {
    // Skip executive super admin as they naturally hold all rights
    if (roleKey === 'executive') return;

    const conflicts = evaluateSodConflicts(functions);
    conflicts.forEach((rule) => {
      const violationKey = `role_${roleKey}_${rule.id}`;
      const override = overrides[violationKey];
      violations.push({
        id: violationKey,
        ruleId: rule.id,
        ruleTitle: rule.title,
        severity: rule.severity,
        violatorType: 'role',
        violatorId: roleKey,
        violatorName: `Role: ${ROLE_DEFINITIONS[roleKey as UserRole]?.name || roleKey}`,
        functionA: rule.functionAName,
        functionB: rule.functionBName,
        status: override ? 'mitigated' : 'active',
        mitigationNotes: override?.notes,
        approvedBy: override?.approvedBy,
        detectedAt: override?.approvedAt || new Date().toISOString()
      });
    });
  });

  // 2. User-Level SoD Evaluation across multiple assigned Business Roles
  users.forEach((user) => {
    // Skip executive super admin
    if (user.role === 'executive') return;

    // Collect all functions assigned to this user through business roles and their primary system role
    const userFunctions = new Set<string>();
    
    // Add primary system role functions
    const primaryFunctions = roleFunctionMap[user.role] || DEFAULT_ROLE_FUNCTION_PERMISSIONS[user.role] || [];
    primaryFunctions.forEach((f) => userFunctions.add(f));

    // Add business role functions
    const userBusinessRoles = businessRoles.filter((br) => br.assignedUserIds?.includes(user.id) && br.status === 'active');
    userBusinessRoles.forEach((br) => {
      br.assignedFunctions?.forEach((f) => userFunctions.add(f));
    });

    const userConflicts = evaluateSodConflicts(Array.from(userFunctions));
    userConflicts.forEach((rule) => {
      const violationKey = `user_${user.id}_${rule.id}`;
      const override = overrides[violationKey];
      violations.push({
        id: violationKey,
        ruleId: rule.id,
        ruleTitle: rule.title,
        severity: rule.severity,
        violatorType: 'user',
        violatorId: user.id,
        violatorName: `${user.name} (${user.email})`,
        functionA: rule.functionAName,
        functionB: rule.functionBName,
        status: override ? 'mitigated' : 'active',
        mitigationNotes: override?.notes,
        approvedBy: override?.approvedBy,
        detectedAt: override?.approvedAt || new Date().toISOString()
      });
    });
  });

  return violations;
}

