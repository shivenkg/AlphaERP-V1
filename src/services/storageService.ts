import {
  UserProfile,
  Lead,
  Quote,
  NewQuoteDraft,
  WorkOrder,
  Project,
  InventoryItem,
  PurchaseRequisition,
  PurchaseOrder,
  Vendor,
  PaymentRecord,
  InvoiceAttachment,
  SalesRep,
  AuditLog,
  AppNotification,
  GoogleSheetsSyncConfig,
  SystemSettings,
  UserRole,
  PRStatus,
  POStatus,
  BOQItem,
  PRItem,
  POItem,
  ClientMaster,
  CostCenterMaster,
  TaxSlabMaster,
  PaymentTermMaster,
  ChartOfAccount,
  JournalVoucher,
  TDSRecord,
  JobRequisition,
  JobCandidate,
  Employee,
  AttendanceRecord,
  TimesheetEntry,
  LeaveApplication,
  CompanyHoliday,
  PayrollMonth,
  ResignationRecord,
  ExitApprovalStage,
  DepartmentMaster,
  DesignationGrade,
  ShiftMaster,
  CompanyPolicyDocument,
  EmployeeAsset,
  EmployeeDocument,
  OnboardingTask,
  AttendanceRegularization,
  AppraisalCycle,
  EmployeeAppraisal,
  TrainingCourse,
  EmployeeSkillMatrix,
  TravelRequest,
  ExpenseClaim,
  GrievanceTicket,
  WorkforceForecast,
  LocalBackupSnapshot,
  BackupNotificationEvent,
  BackupConfig,
  GoodsReceiptNote,
  SeriesDefinition,
  ReportTemplateConfig,
  ReportType,
  WhatsAppTriggerConfig,
  DailyKpiSnapshot,
  BiometricDevice,
  AttendancePunchLog
} from '../types';

import {
  DEFAULT_NUMBER_SERIES,
  formatSeriesNumber
} from '../utils/numberSeries';

import {
  DEFAULT_REPORT_TEMPLATES,
  getResolvedReportTemplate
} from '../utils/reportTemplates';

import { DEFAULT_ROLE_MODULE_PERMISSIONS } from '../utils/rbac';

import {
  INITIAL_CURRENT_USER,
  INITIAL_USERS,
  INITIAL_SALES_REPS,
  INITIAL_VENDORS,
  INITIAL_INVENTORY,
  INITIAL_LEADS,
  INITIAL_QUOTES,
  INITIAL_WORK_ORDERS,
  INITIAL_PROJECTS,
  INITIAL_PURCHASE_REQUISITIONS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_GOOGLE_SHEETS_CONFIG,
  INITIAL_SYSTEM_SETTINGS
} from '../data/initialData';

import {
  INITIAL_CLIENTS,
  INITIAL_COST_CENTERS,
  INITIAL_TAX_SLABS,
  INITIAL_PAYMENT_TERMS
} from '../data/masterData';

import {
  INITIAL_CHART_OF_ACCOUNTS,
  INITIAL_JOURNAL_VOUCHERS,
  INITIAL_TDS_RECORDS
} from '../data/financeData';

import {
  INITIAL_JOB_REQUISITIONS,
  INITIAL_CANDIDATES,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_TIMESHEETS,
  INITIAL_LEAVES,
  INITIAL_HOLIDAYS,
  INITIAL_PAYROLL_MONTHS,
  INITIAL_RESIGNATIONS,
  INITIAL_DEPARTMENTS,
  INITIAL_DESIGNATION_GRADES,
  INITIAL_SHIFTS,
  INITIAL_POLICY_DOCUMENTS,
  INITIAL_EMPLOYEE_ASSETS,
  INITIAL_EMPLOYEE_DOCUMENTS,
  INITIAL_ONBOARDING_TASKS,
  INITIAL_ATTENDANCE_REGULARIZATIONS,
  INITIAL_APPRAISAL_CYCLES,
  INITIAL_EMPLOYEE_APPRAISALS,
  INITIAL_TRAINING_COURSES,
  INITIAL_SKILL_MATRICES,
  INITIAL_TRAVEL_REQUESTS,
  INITIAL_EXPENSE_CLAIMS,
  INITIAL_GRIEVANCE_TICKETS,
  INITIAL_WORKFORCE_FORECASTS,
  INITIAL_BIOMETRIC_DEVICES,
  INITIAL_BIOMETRIC_PUNCH_LOGS
} from '../data/hrData';
import {
  DashboardLayoutState,
  DEFAULT_KPI_WIDGETS,
  DEFAULT_MAIN_SECTION_WIDGETS
} from '../types/dashboardLayout';

const STORAGE_KEYS = {
  AUTH_SESSION: 'alpha_erp_auth_session',
  USER: 'hvac_erp_user',
  USERS: 'hvac_erp_users_list',
  LEADS: 'hvac_erp_leads',
  QUOTES: 'hvac_erp_quotes',
  QUOTE_DRAFT: 'alpha_erp_new_quote_draft',
  WORK_ORDERS: 'hvac_erp_work_orders',
  PROJECTS: 'hvac_erp_projects',
  INVENTORY: 'hvac_erp_inventory',
  PRS: 'hvac_erp_prs',
  POS: 'hvac_erp_pos',
  GRNS: 'alpha_erp_grns',
  VENDORS: 'hvac_erp_vendors',
  PAYMENTS: 'hvac_erp_payments',
  SALES_REPS: 'hvac_erp_sales_reps',
  AUDIT_LOGS: 'hvac_erp_audit_logs',
  NOTIFICATIONS: 'hvac_erp_notifications',
  SHEETS_CONFIG: 'hvac_erp_sheets_config',
  SYSTEM_SETTINGS: 'alpha_erp_system_settings',
  DAILY_KPI_SNAPSHOTS: 'alpha_erp_daily_kpi_snapshots',
  
  // Master Data
  CLIENTS: 'alpha_erp_clients',
  COST_CENTERS: 'alpha_erp_cost_centers',
  TAX_SLABS: 'alpha_erp_tax_slabs',
  PAYMENT_TERMS: 'alpha_erp_payment_terms',

  // Finance & Accounting
  CHART_OF_ACCOUNTS: 'alpha_erp_coa',
  JOURNAL_VOUCHERS: 'alpha_erp_vouchers',
  TDS_RECORDS: 'alpha_erp_tds',

  // HR & Payroll (All 12 Sub-Modules)
  JOB_REQUISITIONS: 'alpha_erp_job_reqs',
  JOB_CANDIDATES: 'alpha_erp_candidates',
  EMPLOYEES: 'alpha_erp_employees',
  ATTENDANCE: 'alpha_erp_attendance',
  TIMESHEETS: 'alpha_erp_timesheets',
  LEAVES: 'alpha_erp_leaves',
  HOLIDAYS: 'alpha_erp_holidays',
  PAYROLL_MONTHS: 'alpha_erp_payrolls',
  RESIGNATIONS: 'alpha_erp_resignations',
  DEPARTMENTS: 'alpha_erp_departments',
  DESIGNATION_GRADES: 'alpha_erp_designations',
  SHIFTS: 'alpha_erp_shifts',
  POLICY_DOCS: 'alpha_erp_policies',
  EMPLOYEE_ASSETS: 'alpha_erp_emp_assets',
  EMPLOYEE_DOCUMENTS: 'alpha_erp_emp_docs',
  ONBOARDING_TASKS: 'alpha_erp_onboarding_tasks',
  ATTENDANCE_REGULARIZATIONS: 'alpha_erp_regularizations',
  APPRAISAL_CYCLES: 'alpha_erp_appraisal_cycles',
  EMPLOYEE_APPRAISALS: 'alpha_erp_appraisals',
  TRAINING_COURSES: 'alpha_erp_training_courses',
  SKILL_MATRICES: 'alpha_erp_skill_matrices',
  TRAVEL_REQUESTS: 'alpha_erp_travel_requests',
  EXPENSE_CLAIMS: 'alpha_erp_expense_claims',
  GRIEVANCES: 'alpha_erp_grievances',
  WORKFORCE_FORECASTS: 'alpha_erp_workforce_forecasts',
  BIOMETRIC_DEVICES: 'alpha_erp_biometric_devices',
  BIOMETRIC_PUNCH_LOGS: 'alpha_erp_biometric_punch_logs',
  DASHBOARD_LAYOUT: 'alpha_erp_dashboard_layout',
  LOCAL_BACKUP_SNAPSHOTS: 'alpha_erp_backup_snapshots',
  LOCAL_BACKUP_CONFIG: 'alpha_erp_backup_config'
};

const DEFAULT_BACKUP_CONFIG: BackupConfig = {
  periodicIntervalMinutes: 30,
  autoSnapshotOnCriticalInventory: true,
  autoSnapshotOnCriticalProcurement: true,
  browserPushNotifications: true,
  soundAlert: true,
  maxRetainedSnapshots: 30
};

// Performance & Security: In-memory cache for fast lookups and debounced persistence
const memoryCache = new Map<string, any>();
const pendingSaveTimers = new Map<string, any>();

/**
 * Security: Deep sanitize object to prevent Prototype Pollution attacks
 */
function safeSanitizeValue<T>(val: T): T {
  if (!val || typeof val !== 'object') return val;
  if (Array.isArray(val)) {
    return val.map((item) => safeSanitizeValue(item)) as unknown as T;
  }
  const cleanObj: Record<string, any> = {};
  for (const [k, v] of Object.entries(val as Record<string, any>)) {
    // Strip dangerous properties
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
      continue;
    }
    cleanObj[k] = safeSanitizeValue(v);
  }
  return cleanObj as T;
}

function load<T>(key: string, fallback: T): T {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }
  try {
    const item = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (!item) {
      memoryCache.set(key, fallback);
      return fallback;
    }
    const parsed = JSON.parse(item);
    const sanitized = safeSanitizeValue(parsed);
    memoryCache.set(key, sanitized);
    return sanitized;
  } catch (e) {
    console.error(`Error loading storage key ${key}:`, e);
    memoryCache.set(key, fallback);
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  // 1. Immediately update in-memory cache for synchronous reads
  memoryCache.set(key, data);

  // 2. Debounce serialization & disk write by 15ms to batch rapid successive calls
  if (pendingSaveTimers.has(key)) {
    clearTimeout(pendingSaveTimers.get(key));
  }

  const timer = setTimeout(() => {
    pendingSaveTimers.delete(key);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (e: any) {
      // 3. Graceful QuotaExceeded recovery: prune oldest audit logs and retry
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        console.warn(`Storage quota exceeded on key "${key}". Executing automated log cleanup.`);
        try {
          const rawLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
          if (rawLogs) {
            const logs = JSON.parse(rawLogs);
            if (Array.isArray(logs) && logs.length > 50) {
              localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 50)));
            }
          }
          localStorage.setItem(key, JSON.stringify(data));
        } catch (retryErr) {
          console.error(`Save retry failed for key ${key}:`, retryErr);
        }
      } else {
        console.error(`Error saving storage key ${key}:`, e);
      }
    }
  }, 15);

  pendingSaveTimers.set(key, timer);
}

class StorageService {
  private user: UserProfile = load(STORAGE_KEYS.USER, INITIAL_CURRENT_USER);
  private users: UserProfile[] = load(STORAGE_KEYS.USERS, INITIAL_USERS);
  private leads: Lead[] = load(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  private quotes: Quote[] = load(STORAGE_KEYS.QUOTES, INITIAL_QUOTES);
  private workOrders: WorkOrder[] = load(STORAGE_KEYS.WORK_ORDERS, INITIAL_WORK_ORDERS);
  private projects: Project[] = load(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  private inventory: InventoryItem[] = load(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  private prs: PurchaseRequisition[] = load(STORAGE_KEYS.PRS, INITIAL_PURCHASE_REQUISITIONS);
  private pos: PurchaseOrder[] = load(STORAGE_KEYS.POS, INITIAL_PURCHASE_ORDERS);
  private vendors: Vendor[] = load(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
  private payments: PaymentRecord[] = load(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
  private grns: GoodsReceiptNote[] = load(STORAGE_KEYS.GRNS, []);
  private salesReps: SalesRep[] = load(STORAGE_KEYS.SALES_REPS, INITIAL_SALES_REPS);
  private auditLogs: AuditLog[] = load(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  private notifications: AppNotification[] = load(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  private sheetsConfig: GoogleSheetsSyncConfig = load(STORAGE_KEYS.SHEETS_CONFIG, INITIAL_GOOGLE_SHEETS_CONFIG);
  private systemSettings: SystemSettings = load(STORAGE_KEYS.SYSTEM_SETTINGS, INITIAL_SYSTEM_SETTINGS);
  private isAuthenticated: boolean = load(STORAGE_KEYS.AUTH_SESSION, true);
  private activeOtps: Record<string, { otp: string; expiresAt: number; mode: 'login' | 'signup'; tempUserData?: any }> = {};

  // Master Data
  private clients: ClientMaster[] = load(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  private costCenters: CostCenterMaster[] = load(STORAGE_KEYS.COST_CENTERS, INITIAL_COST_CENTERS);
  private taxSlabs: TaxSlabMaster[] = load(STORAGE_KEYS.TAX_SLABS, INITIAL_TAX_SLABS);
  private paymentTerms: PaymentTermMaster[] = load(STORAGE_KEYS.PAYMENT_TERMS, INITIAL_PAYMENT_TERMS);

  // Finance & Accounting
  private chartOfAccounts: ChartOfAccount[] = load(STORAGE_KEYS.CHART_OF_ACCOUNTS, INITIAL_CHART_OF_ACCOUNTS);
  private journalVouchers: JournalVoucher[] = load(STORAGE_KEYS.JOURNAL_VOUCHERS, INITIAL_JOURNAL_VOUCHERS);
  private tdsRecords: TDSRecord[] = load(STORAGE_KEYS.TDS_RECORDS, INITIAL_TDS_RECORDS);

  // HR & Payroll (All 12 Modules)
  private jobRequisitions: JobRequisition[] = load(STORAGE_KEYS.JOB_REQUISITIONS, INITIAL_JOB_REQUISITIONS);
  private jobCandidates: JobCandidate[] = load(STORAGE_KEYS.JOB_CANDIDATES, INITIAL_CANDIDATES);
  private employees: Employee[] = load(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  private attendanceRecords: AttendanceRecord[] = load(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  private timesheetEntries: TimesheetEntry[] = load(STORAGE_KEYS.TIMESHEETS, INITIAL_TIMESHEETS);
  private leaveApplications: LeaveApplication[] = load(STORAGE_KEYS.LEAVES, INITIAL_LEAVES);
  private companyHolidays: CompanyHoliday[] = load(STORAGE_KEYS.HOLIDAYS, INITIAL_HOLIDAYS);
  private payrollMonths: PayrollMonth[] = load(STORAGE_KEYS.PAYROLL_MONTHS, INITIAL_PAYROLL_MONTHS);
  private resignationRecords: ResignationRecord[] = load(STORAGE_KEYS.RESIGNATIONS, INITIAL_RESIGNATIONS);
  private departments: DepartmentMaster[] = load(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  private designationGrades: DesignationGrade[] = load(STORAGE_KEYS.DESIGNATION_GRADES, INITIAL_DESIGNATION_GRADES);
  private shifts: ShiftMaster[] = load(STORAGE_KEYS.SHIFTS, INITIAL_SHIFTS);
  private policyDocuments: CompanyPolicyDocument[] = load(STORAGE_KEYS.POLICY_DOCS, INITIAL_POLICY_DOCUMENTS);
  private employeeAssets: EmployeeAsset[] = load(STORAGE_KEYS.EMPLOYEE_ASSETS, INITIAL_EMPLOYEE_ASSETS);
  private employeeDocuments: EmployeeDocument[] = load(STORAGE_KEYS.EMPLOYEE_DOCUMENTS, INITIAL_EMPLOYEE_DOCUMENTS);
  private onboardingTasks: OnboardingTask[] = load(STORAGE_KEYS.ONBOARDING_TASKS, INITIAL_ONBOARDING_TASKS);
  private attendanceRegularizations: AttendanceRegularization[] = load(STORAGE_KEYS.ATTENDANCE_REGULARIZATIONS, INITIAL_ATTENDANCE_REGULARIZATIONS);
  private appraisalCycles: AppraisalCycle[] = load(STORAGE_KEYS.APPRAISAL_CYCLES, INITIAL_APPRAISAL_CYCLES);
  private employeeAppraisals: EmployeeAppraisal[] = load(STORAGE_KEYS.EMPLOYEE_APPRAISALS, INITIAL_EMPLOYEE_APPRAISALS);
  private trainingCourses: TrainingCourse[] = load(STORAGE_KEYS.TRAINING_COURSES, INITIAL_TRAINING_COURSES);
  private skillMatrices: EmployeeSkillMatrix[] = load(STORAGE_KEYS.SKILL_MATRICES, INITIAL_SKILL_MATRICES);
  private travelRequests: TravelRequest[] = load(STORAGE_KEYS.TRAVEL_REQUESTS, INITIAL_TRAVEL_REQUESTS);
  private expenseClaims: ExpenseClaim[] = load(STORAGE_KEYS.EXPENSE_CLAIMS, INITIAL_EXPENSE_CLAIMS);
  private grievanceTickets: GrievanceTicket[] = load(STORAGE_KEYS.GRIEVANCES, INITIAL_GRIEVANCE_TICKETS);
  private workforceForecasts: WorkforceForecast[] = load(STORAGE_KEYS.WORKFORCE_FORECASTS, INITIAL_WORKFORCE_FORECASTS);
  private biometricDevices: BiometricDevice[] = load(STORAGE_KEYS.BIOMETRIC_DEVICES, INITIAL_BIOMETRIC_DEVICES);
  private biometricPunchLogs: AttendancePunchLog[] = load(STORAGE_KEYS.BIOMETRIC_PUNCH_LOGS, INITIAL_BIOMETRIC_PUNCH_LOGS);
  private backupSnapshots: LocalBackupSnapshot[] = load(STORAGE_KEYS.LOCAL_BACKUP_SNAPSHOTS, []);
  private backupConfig: BackupConfig = load(STORAGE_KEYS.LOCAL_BACKUP_CONFIG, DEFAULT_BACKUP_CONFIG);

  private listeners: Array<() => void> = [];
  private backupListeners: Array<(event: BackupNotificationEvent) => void> = [];
  private periodicBackupTimer: any = null;

  constructor() {
    // Sanitize any legacy broken/deleted demo spreadsheet IDs
    if (
      this.sheetsConfig &&
      (this.sheetsConfig.spreadsheetId === '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' ||
        this.sheetsConfig.spreadsheetId?.startsWith('1hvacERP_'))
    ) {
      this.sheetsConfig = {
        ...this.sheetsConfig,
        spreadsheetId: null,
        spreadsheetUrl: null,
        syncStatus: 'idle',
        lastSyncAt: null
      };
      save(STORAGE_KEYS.SHEETS_CONFIG, this.sheetsConfig);
    }

    // Auto-seed / merge any new initial data items for rich experience
    if (this.journalVouchers.length < INITIAL_JOURNAL_VOUCHERS.length) {
      this.journalVouchers = INITIAL_JOURNAL_VOUCHERS;
      save(STORAGE_KEYS.JOURNAL_VOUCHERS, this.journalVouchers);
    }
    if (this.leaveApplications.length < INITIAL_LEAVES.length) {
      this.leaveApplications = INITIAL_LEAVES;
      save(STORAGE_KEYS.LEAVES, this.leaveApplications);
    }
    if (this.attendanceRegularizations.length < INITIAL_ATTENDANCE_REGULARIZATIONS.length) {
      this.attendanceRegularizations = INITIAL_ATTENDANCE_REGULARIZATIONS;
      save(STORAGE_KEYS.ATTENDANCE_REGULARIZATIONS, this.attendanceRegularizations);
    }
    if (this.expenseClaims.length < INITIAL_EXPENSE_CLAIMS.length) {
      this.expenseClaims = INITIAL_EXPENSE_CLAIMS;
      save(STORAGE_KEYS.EXPENSE_CLAIMS, this.expenseClaims);
    }
    if (!this.biometricDevices || this.biometricDevices.length === 0) {
      this.biometricDevices = INITIAL_BIOMETRIC_DEVICES;
      save(STORAGE_KEYS.BIOMETRIC_DEVICES, this.biometricDevices);
    }
    if (!this.biometricPunchLogs || this.biometricPunchLogs.length === 0) {
      this.biometricPunchLogs = INITIAL_BIOMETRIC_PUNCH_LOGS;
      save(STORAGE_KEYS.BIOMETRIC_PUNCH_LOGS, this.biometricPunchLogs);
    }
    if (this.attendanceRecords.length < INITIAL_ATTENDANCE.length) {
      this.attendanceRecords = INITIAL_ATTENDANCE;
      save(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
    }

    // Ensure number series are populated
    if (!this.systemSettings.numberSeries || this.systemSettings.numberSeries.length === 0) {
      this.systemSettings = {
        ...this.systemSettings,
        numberSeries: DEFAULT_NUMBER_SERIES.map((s) => ({ ...s }))
      };
      save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);
    }

    // Automated Number Series Migration & Backfill for Vendors and Employees
    this.backfillNumberSeriesCodes({ forceReassignAll: false });

    // Initialize periodic local backup timer
    this.restartPeriodicBackupTimer();

    // Run automated safety stock audit on startup
    this.checkSafetyStockAlerts(false);

    // Apply global UI display density to document root
    try {
      if (typeof document !== 'undefined') {
        const density = this.systemSettings.displayDensity || 'spacious';
        document.documentElement.setAttribute('data-density', density);
        document.body.classList.toggle('density-compact', density === 'compact');
        document.body.classList.toggle('density-spacious', density === 'spacious');
      }
    } catch {}
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public onBackupNotification(listener: (event: BackupNotificationEvent) => void): () => void {
    this.backupListeners.push(listener);
    return () => {
      this.backupListeners = this.backupListeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // AUDIT LOGGER
  public logAudit(
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    summary: string,
    metadata?: Record<string, any>
  ) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: this.user.id,
      userName: this.user.name,
      userRole: this.user.role,
      action,
      entityType,
      entityId,
      summary,
      metadata
    };
    this.auditLogs = [newLog, ...this.auditLogs];
    save(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    this.notify();
  }

  public addNotification(title: string, message: string, type: AppNotification['type'], linkTab?: string) {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      linkTab
    };
    this.notifications = [notif, ...this.notifications];
    save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public markAllNotificationsAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  // USER & RBAC MANAGEMENT
  public getCurrentUser(): UserProfile {
    return this.user;
  }

  public getUsers(): UserProfile[] {
    return this.users;
  }

  public addUser(userData: {
    name: string;
    email: string;
    phone?: string;
    role: UserRole;
    avatar?: string;
    title: string;
    department?: string;
  }): UserProfile {
    const defaultAvatars: Record<UserRole, string> = {
      executive: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      procurement: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      sales_manager: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      estimator: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      warehouse: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      finance: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      technician: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    };

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '+91 98000 00000',
      role: userData.role,
      avatar: userData.avatar || defaultAvatars[userData.role] || defaultAvatars.executive,
      title: userData.title,
      department: userData.department || 'Operations',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    this.users = [newUser, ...this.users];
    save(STORAGE_KEYS.USERS, this.users);

    this.logAudit('CREATE', 'USER', newUser.id, `Created new team user ${newUser.name} with role [${newUser.role.toUpperCase()}]`);
    this.addNotification('New User Added', `${newUser.name} assigned role ${newUser.role}`, 'info', 'admin_users');
    this.notify();
    return newUser;
  }

  public updateUser(userId: string, updates: Partial<UserProfile>): UserProfile {
    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    const updatedUser = { ...this.users[userIndex], ...updates };
    this.users[userIndex] = updatedUser;
    save(STORAGE_KEYS.USERS, this.users);

    // If currently logged-in user is updated, update active user session too
    if (this.user.id === userId) {
      this.user = updatedUser;
      save(STORAGE_KEYS.USER, this.user);
    }

    this.logAudit('UPDATE', 'USER', userId, `Updated user profile for ${updatedUser.name} (Role: ${updatedUser.role})`);
    this.notify();
    return updatedUser;
  }

  public toggleUserStatus(userId: string): UserProfile {
    const userIndex = this.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    const current = this.users[userIndex];
    const newStatus: 'active' | 'deactivated' = current.status === 'active' ? 'deactivated' : 'active';
    const updated = { ...current, status: newStatus };
    this.users[userIndex] = updated;
    save(STORAGE_KEYS.USERS, this.users);

    if (this.user.id === userId) {
      this.user = updated;
      save(STORAGE_KEYS.USER, this.user);
    }

    this.logAudit('UPDATE', 'USER', userId, `${newStatus === 'active' ? 'Activated' : 'Deactivated'} user account for ${updated.name}`);
    this.addNotification(
      `User ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
      `${updated.name} has been ${newStatus}.`,
      newStatus === 'active' ? 'success' : 'warning',
      'admin_users'
    );
    this.notify();
    return updated;
  }

  public switchUser(userId: string): UserProfile {
    const targetUser = this.users.find((u) => u.id === userId);
    if (!targetUser) throw new Error('User not found');
    if (targetUser.status === 'deactivated') throw new Error('Cannot switch to a deactivated user account');

    this.user = targetUser;
    save(STORAGE_KEYS.USER, this.user);
    this.logAudit('UPDATE', 'USER', targetUser.id, `Switched logged-in user to ${targetUser.name} (${targetUser.role})`);
    this.addNotification('Active User Switched', `Logged in as ${targetUser.name} (${targetUser.role.toUpperCase()})`, 'info');
    this.notify();
    return this.user;
  }

  public setUserRole(role: UserRole) {
    const roleTitles: Record<UserRole, string> = {
      executive: 'Managing Director & Operations Head',
      sales_manager: 'HVAC Regional Sales Manager',
      estimator: 'Chief MEP & HVAC Estimator',
      procurement: 'Head of Procurement & Supply Chain',
      warehouse: 'Warehouse & Inventory Superintendent',
      finance: 'Financial Controller & Accounts Head',
      technician: 'Lead Field HVAC Project Engineer'
    };
    this.user = {
      ...this.user,
      role,
      title: roleTitles[role] || 'HVAC Specialist'
    };
    save(STORAGE_KEYS.USER, this.user);

    // Also update in users list if present
    const idx = this.users.findIndex((u) => u.id === this.user.id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], role, title: this.user.title };
      save(STORAGE_KEYS.USERS, this.users);
    }

    this.logAudit('UPDATE', 'USER', this.user.id, `Switched active RBAC role to [${role.toUpperCase()}]`);
    this.notify();
  }

  // LEADS
  public getLeads(): Lead[] {
    return this.leads;
  }

  public addLead(leadData: Omit<Lead, 'id' | 'leadNumber' | 'createdAt' | 'updatedAt' | 'followUps' | 'communications' | 'quoteIds'>): Lead {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      leadNumber: this.generateSeriesNumber('lead'),
      followUps: [],
      communications: [
        {
          id: `c-${Date.now()}`,
          timestamp: new Date().toISOString(),
          channel: 'Phone Call',
          sender: this.user.name,
          summary: `Lead registered via ${leadData.source}.`,
          status: 'Logged'
        }
      ],
      quoteIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.leads = [newLead, ...this.leads];
    save(STORAGE_KEYS.LEADS, this.leads);
    this.logAudit('CREATE', 'LEAD', newLead.leadNumber, `Created new lead for ${newLead.companyName} (${newLead.estimatedCapacityTR} TR - ₹${newLead.estimatedValue.toLocaleString()})`);
    this.addNotification('New HVAC Lead Added', `${newLead.companyName} - ${newLead.hvacType} (${newLead.estimatedCapacityTR} TR)`, 'info', 'crm');
    this.recalculateSalesReps();
    this.notify();
    return newLead;
  }

  public updateLead(id: string, updates: Partial<Lead>) {
    this.leads = this.leads.map((l) => {
      if (l.id === id) {
        return {
          ...l,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return l;
    });
    save(STORAGE_KEYS.LEADS, this.leads);
    const updated = this.leads.find((l) => l.id === id);
    if (updated) {
      this.logAudit('UPDATE', 'LEAD', updated.leadNumber, `Updated lead details/status to [${updated.status}] for ${updated.companyName}`);
    }
    this.recalculateSalesReps();
    this.notify();
  }

  public deleteLead(id: string) {
    const toDelete = this.leads.find((l) => l.id === id);
    if (toDelete) {
      this.leads = this.leads.filter((l) => l.id !== id);
      save(STORAGE_KEYS.LEADS, this.leads);
      this.logAudit('DELETE', 'LEAD', toDelete.leadNumber, `Deleted lead ${toDelete.companyName}`);
      this.recalculateSalesReps();
      this.notify();
    }
  }

  public addLeadFollowUp(leadId: string, reminder: Omit<Lead['followUps'][0], 'id' | 'completed'>) {
    this.leads = this.leads.map((l) => {
      if (l.id === leadId) {
        const newFU = {
          ...reminder,
          id: `fu-${Date.now()}`,
          completed: false
        };
        return {
          ...l,
          followUps: [...l.followUps, newFU],
          updatedAt: new Date().toISOString()
        };
      }
      return l;
    });
    save(STORAGE_KEYS.LEADS, this.leads);
    this.logAudit('UPDATE', 'LEAD', leadId, `Added follow-up ${reminder.type} reminder`);
    this.notify();
  }

  public markFollowUpCompleted(leadId: string, followUpId: string) {
    this.leads = this.leads.map((l) => {
      if (l.id === leadId) {
        return {
          ...l,
          followUps: l.followUps.map((f) =>
            f.id === followUpId ? { ...f, completed: true, completedAt: new Date().toISOString() } : f
          ),
          updatedAt: new Date().toISOString()
        };
      }
      return l;
    });
    save(STORAGE_KEYS.LEADS, this.leads);
    this.notify();
  }

  public logLeadCommunication(leadId: string, channel: Lead['communications'][0]['channel'], summary: string) {
    this.leads = this.leads.map((l) => {
      if (l.id === leadId) {
        const newComm = {
          id: `c-${Date.now()}`,
          timestamp: new Date().toISOString(),
          channel,
          sender: this.user.name,
          summary,
          status: 'Delivered' as const
        };
        return {
          ...l,
          communications: [newComm, ...l.communications],
          updatedAt: new Date().toISOString()
        };
      }
      return l;
    });
    save(STORAGE_KEYS.LEADS, this.leads);
    this.logAudit('UPDATE', 'LEAD', leadId, `Sent ${channel} communication: "${summary.substring(0, 60)}..."`);
    this.notify();
  }

  // QUOTES
  public getQuotes(): Quote[] {
    return this.quotes;
  }

  public addQuote(quoteData: Omit<Quote, 'id' | 'quoteNumber'>): Quote {
    const newQuote: Quote = {
      ...quoteData,
      id: `qte-${Date.now()}`,
      quoteNumber: this.generateSeriesNumber('quote')
    };

    this.quotes = [newQuote, ...this.quotes];
    save(STORAGE_KEYS.QUOTES, this.quotes);

    // Link to Lead
    if (newQuote.leadId) {
      this.leads = this.leads.map((l) => {
        if (l.id === newQuote.leadId) {
          return {
            ...l,
            quoteIds: Array.from(new Set([...l.quoteIds, newQuote.id])),
            status: l.status === 'New' || l.status === 'Site Survey Completed' ? 'Quote Sent' : l.status,
            updatedAt: new Date().toISOString()
          };
        }
        return l;
      });
      save(STORAGE_KEYS.LEADS, this.leads);
    }

    this.logAudit('CREATE', 'QUOTE', newQuote.quoteNumber, `Generated HVAC Quotation for ${newQuote.companyName} (Amount: ₹${newQuote.totalAmount.toLocaleString()} | Margin: ${newQuote.grossMarginPct.toFixed(2)}%)`);
    this.addNotification('New HVAC Quotation Created', `${newQuote.quoteNumber} for ${newQuote.companyName} (₹${newQuote.totalAmount.toLocaleString()})`, 'info', 'quotes');
    this.recalculateSalesReps();
    this.notify();
    return newQuote;
  }

  public updateQuote(id: string, updates: Partial<Quote>) {
    this.quotes = this.quotes.map((q) => (q.id === id ? { ...q, ...updates } : q));
    save(STORAGE_KEYS.QUOTES, this.quotes);
    this.notify();
  }

  // NEW QUOTE DRAFT AUTO-SAVE & REAL-TIME PERSISTENCE
  public getNewQuoteDraft(): NewQuoteDraft | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUOTE_DRAFT);
      return data ? (JSON.parse(data) as NewQuoteDraft) : null;
    } catch (e) {
      console.error('Failed to load quote draft:', e);
      return null;
    }
  }

  public saveNewQuoteDraft(draft: NewQuoteDraft): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUOTE_DRAFT, JSON.stringify(draft));
    } catch (e) {
      console.error('Failed to auto-save quote draft:', e);
    }
  }

  public clearNewQuoteDraft(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.QUOTE_DRAFT);
    } catch (e) {
      console.error('Failed to clear quote draft:', e);
    }
  }

  // CONVERT AWARDED QUOTE TO PROJECT & GENERATE BOQ + INVENTORY CHECK
  public awardQuoteAndConvertToProject(quoteId: string): { project: Project; shortageCount: number } {
    const quote = this.quotes.find((q) => q.id === quoteId);
    if (!quote) throw new Error('Quote not found');

    // 1. Mark Quote as Awarded
    quote.status = 'Awarded';
    quote.awardedDate = new Date().toISOString().split('T')[0];

    // 2. Mark Lead as Awarded
    if (quote.leadId) {
      this.leads = this.leads.map((l) => (l.id === quote.leadId ? { ...l, status: 'Awarded', updatedAt: new Date().toISOString() } : l));
      save(STORAGE_KEYS.LEADS, this.leads);
    }

    // 3. Build BOQ from Quote Line Items & Cross-check with Inventory
    let shortageCount = 0;
    const boqItems: BOQItem[] = quote.items.map((item, idx) => {
      // Find matching SKU in inventory if present
      let matchedInv: InventoryItem | undefined;
      if (item.itemSku) {
        matchedInv = this.inventory.find((inv) => inv.sku === item.itemSku);
      } else {
        const descLower = (item.description || '').toLowerCase().substring(0, 15);
        matchedInv = descLower
          ? this.inventory.find((inv) => (inv.name || '').toLowerCase().includes(descLower))
          : undefined;
      }

      const inStock = matchedInv ? Math.max(0, matchedInv.availableStock) : 0;
      const shortage = Math.max(0, item.qty - inStock);

      if (shortage > 0 && item.category !== 'Installation & Labor' && item.category !== 'Testing & Commissioning') {
        shortageCount++;
      }

      const status: BOQItem['status'] =
        item.category === 'Installation & Labor' || item.category === 'Testing & Commissioning'
          ? 'In Stock'
          : shortage > 0
          ? 'Shortage - PR Needed'
          : 'In Stock';

      return {
        id: `boq-${Date.now()}-${idx}`,
        category: matchedInv ? matchedInv.category : item.category,
        sku: item.itemSku || matchedInv?.sku || `SKU-CUST-${idx + 1}`,
        description: item.description,
        requiredQty: item.qty,
        unit: item.unit,
        unitCost: item.unitCost,
        totalCost: item.totalCost,
        inStockQty: inStock,
        shortageQty: shortage,
        status
      };
    });

    // 4. Create Project
    const newProject: Project = {
      id: `prj-${Date.now()}`,
      projectNumber: this.generateSeriesNumber('project'),
      projectName: `${quote.companyName} - ${quote.projectTitle}`,
      clientName: quote.clientName,
      leadId: quote.leadId,
      quoteId: quote.id,
      contractValue: quote.totalAmount,
      totalEstimatedCost: quote.totalCost,
      targetMarginPct: Number((quote.grossMarginPct || 0).toFixed(2)),
      startDate: new Date().toISOString().split('T')[0],
      targetCompletionDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Procurement',
      progressPct: 10,
      projectManager: 'Vikramaditya Solanki (Senior HVAC PM)',
      boqItems,
      totalShortageItemsCount: shortageCount,
      prCount: 0,
      poCount: 0,
      invoicesGeneratedAmount: 0,
      paymentsReceivedAmount: 0,
      siteAddress: quote.siteAddress
    };

    quote.convertedToProjectId = newProject.id;
    this.projects = [newProject, ...this.projects];
    save(STORAGE_KEYS.PROJECTS, this.projects);
    save(STORAGE_KEYS.QUOTES, this.quotes);

    // Also update lead's projectId
    if (quote.leadId) {
      this.leads = this.leads.map((l) => (l.id === quote.leadId ? { ...l, projectId: newProject.id } : l));
      save(STORAGE_KEYS.LEADS, this.leads);
    }

    // 5. Automatically create Initial 30% Advance Invoice
    const advanceAmount = Math.round(newProject.contractValue * 0.3);
    const advanceTax = Math.round(advanceAmount * 0.18);
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceNumber: this.generateSeriesNumber('invoice'),
      referenceType: 'Project',
      referenceId: newProject.id,
      referenceTitle: newProject.projectName,
      clientOrVendorName: newProject.clientName,
      isPayable: false,
      paymentType: 'Advance 30%',
      amount: advanceAmount,
      taxAmount: advanceTax,
      totalAmount: advanceAmount + advanceTax,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending',
      notes: '30% Mobilization advance upon contract award & project kickoff'
    };
    newProject.invoicesGeneratedAmount = newPayment.totalAmount;
    this.payments = [newPayment, ...this.payments];
    save(STORAGE_KEYS.PAYMENTS, this.payments);

    // 6. Create Initial Work Order
    const newWO: WorkOrder = {
      id: `wo-${Date.now()}`,
      orderNumber: `WO-2026-${(this.workOrders.length + 20).toString().padStart(4, '0')}`,
      quoteId: quote.id,
      projectId: newProject.id,
      clientName: newProject.clientName,
      projectTitle: newProject.projectName,
      siteAddress: newProject.siteAddress,
      serviceType: 'New HVAC Installation',
      assignedTechnician: 'Imran Khan (Lead HVAC Specialist)',
      scheduledStartDate: newProject.startDate,
      scheduledEndDate: newProject.targetCompletionDate,
      status: 'Scheduled',
      scopeOfWork: [
        'Site preparation, safety barrier setup & floor markings',
        'Equipment delivery staging & crane lifting plan',
        'Copper piping, drain line routing and electrical conduit work',
        'Indoor and Outdoor units installation, brazing with nitrogen',
        'Testing, balancing & air quality commissioning'
      ],
      equipmentSpecs: `${quote.items.filter((i) => i.category === 'Equipment').map((i) => `${i.qty}x ${i.description}`).join(', ') || 'Custom HVAC Package'}`
    };
    this.workOrders = [newWO, ...this.workOrders];
    save(STORAGE_KEYS.WORK_ORDERS, this.workOrders);

    // 7. Audit Log & Notifications
    this.logAudit('AWARD', 'QUOTE', quote.quoteNumber, `Awarded contract QTE-2026-${quote.quoteNumber} (₹${quote.totalAmount.toLocaleString()}) and converted to Project ${newProject.projectNumber}`);
    this.logAudit('CONVERT_TO_PROJECT', 'PROJECT', newProject.projectNumber, `Generated Project ${newProject.projectNumber} with BOQ (${boqItems.length} line items, ${shortageCount} stock shortages detected)`);
    this.addNotification(
      '🎉 Order Awarded & Converted to Project!',
      `${newProject.projectName} is active! BOQ inventory check completed with ${shortageCount} shortages requiring PR.`,
      'success',
      'projects'
    );

    this.recalculateSalesReps();
    this.notify();
    return { project: newProject, shortageCount };
  }

  // GENERATE PR FROM PROJECT BOQ SHORTAGES
  public generatePRFromProjectShortages(projectId: string, selectedBoqItemIds?: string[]): PurchaseRequisition {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const shortageItems = project.boqItems.filter((item) => {
      if (selectedBoqItemIds && selectedBoqItemIds.length > 0) {
        return selectedBoqItemIds.includes(item.id) && item.shortageQty > 0;
      }
      return item.shortageQty > 0 && (item.status === 'Shortage - PR Needed' || item.status === 'In Stock');
    });

    if (shortageItems.length === 0) {
      throw new Error('No shortages found in this project BOQ to create PR.');
    }

    const prNumber = this.generateSeriesNumber('pr');

    const prItems: PRItem[] = shortageItems.map((item) => ({
      sku: item.sku,
      name: item.description,
      category: item.category,
      requiredQty: item.shortageQty,
      unit: item.unit,
      estimatedUnitCost: item.unitCost,
      estimatedTotal: item.shortageQty * item.unitCost,
      reason: `Deficit in stock for project ${project.projectNumber} (${project.projectName})`
    }));

    const totalEstimated = prItems.reduce((sum, it) => sum + it.estimatedTotal, 0);

    const newPR: PurchaseRequisition = {
      id: `pr-${Date.now()}`,
      prNumber,
      projectId: project.id,
      projectName: project.projectName,
      requestedBy: this.user.name,
      requestDate: new Date().toISOString().split('T')[0],
      priority: totalEstimated > 1000000 ? 'Urgent' : 'High',
      items: prItems,
      totalEstimatedAmount: totalEstimated,
      status: 'Pending Approval'
    };

    // Update BOQ items status to PR Generated
    project.boqItems = project.boqItems.map((item) => {
      if (shortageItems.some((s) => s.id === item.id)) {
        return {
          ...item,
          status: 'PR Generated',
          prNumber: newPR.prNumber
        };
      }
      return item;
    });
    project.prCount += 1;

    this.prs = [newPR, ...this.prs];
    save(STORAGE_KEYS.PRS, this.prs);
    save(STORAGE_KEYS.PROJECTS, this.projects);

    this.logAudit('GENERATE_PR', 'PR', newPR.prNumber, `Generated Purchase Requisition ${newPR.prNumber} for ${project.projectNumber} with ${prItems.length} deficit items (Est: ₹${totalEstimated.toLocaleString()})`);
    this.addNotification('PR Generated for Deficit Stock', `${newPR.prNumber} created for ${project.projectName} (₹${totalEstimated.toLocaleString()})`, 'info', 'procurement');

    this.notify();
    return newPR;
  }

  // CREATE DIRECT PR
  public createPR(prData: {
    projectId?: string;
    projectName?: string;
    priority?: 'Urgent' | 'High' | 'Standard';
    items: PRItem[];
    status?: PRStatus;
    justification?: string;
  }): PurchaseRequisition {
    if (!prData.items || prData.items.length === 0) {
      throw new Error('At least one line item is required to create a PR.');
    }

    const prNumber = this.generateSeriesNumber('pr');
    const totalEstimated = prData.items.reduce((sum, it) => sum + (it.estimatedTotal || it.requiredQty * it.estimatedUnitCost), 0);

    const project = prData.projectId ? this.projects.find((p) => p.id === prData.projectId) : undefined;
    const projectName = project ? project.projectName : prData.projectName || 'General / Warehouse Stock Replenishment';

    const newPR: PurchaseRequisition = {
      id: `pr-${Date.now()}`,
      prNumber,
      projectId: prData.projectId || '',
      projectName,
      requestedBy: `${this.user.name} (${this.user.title})`,
      requestDate: new Date().toISOString().split('T')[0],
      priority: prData.priority || (totalEstimated > 1000000 ? 'Urgent' : 'High'),
      items: prData.items.map((item) => ({
        ...item,
        estimatedTotal: item.estimatedTotal || item.requiredQty * item.estimatedUnitCost
      })),
      totalEstimatedAmount: totalEstimated,
      status: prData.status || 'Pending Approval',
      approvalRemarks: prData.justification ? `Justification: ${prData.justification}` : undefined
    };

    if (project) {
      project.prCount += 1;
      save(STORAGE_KEYS.PROJECTS, this.projects);
    }

    this.prs = [newPR, ...this.prs];
    save(STORAGE_KEYS.PRS, this.prs);

    this.logAudit(
      'GENERATE_PR',
      'PR',
      newPR.prNumber,
      `Created Purchase Requisition ${newPR.prNumber} with ${newPR.items.length} items (Est: ₹${totalEstimated.toLocaleString()})`
    );
    this.addNotification(
      'New PR Created',
      `${newPR.prNumber} submitted for Procurement Manager approval (₹${totalEstimated.toLocaleString()})`,
      'info',
      'procurement'
    );

    if (this.backupConfig.autoSnapshotOnCriticalProcurement) {
      this.recordCriticalSnapshot(
        'PROCUREMENT_CRITICAL',
        'Procurement',
        `Requisition Created: ${newPR.prNumber} (${newPR.items.length} items, ₹${totalEstimated.toLocaleString()})`
      );
    }

    this.notify();
    return newPR;
  }

  // APPROVE PR
  public approvePR(prId: string, remarks?: string) {
    const pr = this.prs.find((p) => p.id === prId);
    if (!pr) throw new Error('PR not found');

    pr.status = 'Approved';
    pr.approvedBy = `${this.user.name} (${this.user.title || this.user.role.toUpperCase()})`;
    pr.approvedAt = new Date().toISOString();
    pr.approvalRemarks = remarks || 'Approved for procurement based on project requirement and budget.';

    save(STORAGE_KEYS.PRS, this.prs);
    this.logAudit('APPROVE', 'PR', pr.prNumber, `Approved Purchase Requisition ${pr.prNumber} (Total: ₹${pr.totalEstimatedAmount.toLocaleString()})`);
    this.addNotification('PR Approved by Procurement Manager', `${pr.prNumber} has been approved. Ready to convert to PO.`, 'success', 'procurement');

    if (this.backupConfig.autoSnapshotOnCriticalProcurement) {
      this.recordCriticalSnapshot(
        'PROCUREMENT_CRITICAL',
        'Procurement',
        `Requisition Approved: ${pr.prNumber} (₹${pr.totalEstimatedAmount.toLocaleString()})`
      );
    }

    this.notify();
    return pr;
  }

  // REJECT PR
  public rejectPR(prId: string, remarks: string) {
    const pr = this.prs.find((p) => p.id === prId);
    if (!pr) throw new Error('PR not found');

    pr.status = 'Rejected';
    pr.approvedBy = `${this.user.name} (${this.user.title || this.user.role.toUpperCase()})`;
    pr.approvedAt = new Date().toISOString();
    pr.approvalRemarks = remarks || 'Rejected by Procurement Manager during requisition review.';

    save(STORAGE_KEYS.PRS, this.prs);
    this.logAudit('REJECT', 'PR', pr.prNumber, `Rejected Purchase Requisition ${pr.prNumber}. Reason: ${remarks}`);
    this.addNotification('PR Rejected', `${pr.prNumber} was rejected by Procurement. Reason: ${remarks}`, 'alert', 'procurement');

    if (this.backupConfig.autoSnapshotOnCriticalProcurement) {
      this.recordCriticalSnapshot(
        'PROCUREMENT_CRITICAL',
        'Procurement',
        `Requisition Rejected: ${pr.prNumber}`
      );
    }

    this.notify();
    return pr;
  }

  // CREATE DIRECT PO
  public createPO(poData: {
    projectId?: string;
    projectName?: string;
    prId?: string;
    prNumber?: string;
    vendorId: string;
    expectedDeliveryDate: string;
    deliveryAddress?: string;
    items: POItem[];
    shippingCharges?: number;
    paymentTerms?: string;
    notes?: string;
    status?: POStatus;
  }): PurchaseOrder {
    if (!poData.items || poData.items.length === 0) {
      throw new Error('At least one item is required to create a PO.');
    }

    const vendor = this.vendors.find((v) => v.id === poData.vendorId);
    if (!vendor) throw new Error('Selected vendor not found.');

    const project = poData.projectId ? this.projects.find((p) => p.id === poData.projectId) : undefined;
    const projectName = project ? project.projectName : poData.projectName || 'General / Central Warehouse Stock';

    const poNumber = this.generateSeriesNumber('po');

    const subtotal = poData.items.reduce((s, it) => s + it.orderedQty * it.unitRate, 0);
    const taxAmount = poData.items.reduce((s, it) => s + (it.orderedQty * it.unitRate * (it.taxRatePct || 18)) / 100, 0);
    const shippingCharges = poData.shippingCharges || (subtotal > 1000000 ? 25000 : 8000);
    const grandTotal = subtotal + taxAmount + shippingCharges;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      prId: poData.prId,
      prNumber: poData.prNumber,
      projectId: poData.projectId || '',
      projectName,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      vendorPhone: vendor.phone,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: poData.expectedDeliveryDate,
      deliveryAddress: poData.deliveryAddress || 'Central Warehouse Yard B, HVAC ERP Depot, Bangalore',
      items: poData.items.map((it) => ({
        ...it,
        totalAmount: it.totalAmount || (it.orderedQty * it.unitRate * (1 + (it.taxRatePct || 18) / 100))
      })),
      subtotal,
      taxAmount: Math.round(taxAmount),
      shippingCharges,
      grandTotal: Math.round(grandTotal),
      paymentTerms: poData.paymentTerms || `${vendor.creditPeriodDays} days net credit as per OEM agreement`,
      status: poData.status || 'Pending Approval',
      notes: poData.notes || `Purchase Order raised for ${projectName}`
    };

    if (project) {
      project.poCount += 1;
      save(STORAGE_KEYS.PROJECTS, this.projects);
    }

    if (poData.prId) {
      const pr = this.prs.find((p) => p.id === poData.prId);
      if (pr) {
        pr.status = 'Converted to PO';
        pr.convertedPoId = newPO.id;
        pr.convertedPoNumber = newPO.poNumber;
        save(STORAGE_KEYS.PRS, this.prs);
      }
    }

    this.pos = [newPO, ...this.pos];
    save(STORAGE_KEYS.POS, this.pos);

    this.logAudit(
      'CREATE',
      'PO',
      newPO.poNumber,
      `Created Purchase Order ${newPO.poNumber} for ${vendor.name} (Amount: ₹${grandTotal.toLocaleString()}) - Status: ${newPO.status}`
    );
    this.addNotification(
      'New PO Created',
      `${newPO.poNumber} submitted for Business Manager sign-off (₹${grandTotal.toLocaleString()})`,
      'info',
      'procurement'
    );

    if (this.backupConfig.autoSnapshotOnCriticalProcurement) {
      this.recordCriticalSnapshot(
        'PROCUREMENT_CRITICAL',
        'Procurement',
        `Purchase Order Created: ${newPO.poNumber} (${vendor.name}, ₹${grandTotal.toLocaleString()})`
      );
    }

    this.notify();
    return newPO;
  }

  // CONVERT APPROVED PR TO PO
  public convertPRToPO(prId: string, vendorId: string, expectedDeliveryDate: string, paymentTerms?: string): PurchaseOrder {
    const pr = this.prs.find((p) => p.id === prId);
    if (!pr) throw new Error('PR not found');

    const vendor = this.vendors.find((v) => v.id === vendorId);
    if (!vendor) throw new Error('Vendor not found');

    const poNumber = this.generateSeriesNumber('po');

    const poItems: POItem[] = pr.items.map((item) => {
      const unitRate = item.estimatedUnitCost;
      const taxRate = 18;
      const sub = item.requiredQty * unitRate;
      const total = sub + (sub * taxRate) / 100;
      return {
        sku: item.sku,
        name: item.name,
        orderedQty: item.requiredQty,
        receivedQty: 0,
        unit: item.unit,
        unitRate,
        taxRatePct: taxRate,
        totalAmount: total
      };
    });

    const subtotal = pr.items.reduce((s, it) => s + it.requiredQty * it.estimatedUnitCost, 0);
    const taxAmount = Math.round(subtotal * 0.18);
    const shippingCharges = subtotal > 1000000 ? 25000 : 8000;
    const grandTotal = subtotal + taxAmount + shippingCharges;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      prId: pr.id,
      prNumber: pr.prNumber,
      projectId: pr.projectId,
      projectName: pr.projectName,
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorEmail: vendor.email,
      vendorPhone: vendor.phone,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate,
      deliveryAddress: 'Central Warehouse Yard B, HVAC ERP Depot, Electronic City, Bangalore / Site Drop',
      items: poItems,
      subtotal,
      taxAmount,
      shippingCharges,
      grandTotal,
      paymentTerms: paymentTerms || `${vendor.creditPeriodDays} days net credit as per OEM dealer agreement`,
      status: 'Pending Approval',
      notes: `Created against approved PR ${pr.prNumber} for project ${pr.projectName}`
    };

    // Update PR
    pr.status = 'Converted to PO';
    pr.convertedPoId = newPO.id;
    pr.convertedPoNumber = newPO.poNumber;

    // Update Project BOQ
    const project = this.projects.find((p) => p.id === pr.projectId);
    if (project) {
      project.poCount += 1;
      project.boqItems = project.boqItems.map((b) => {
        if (pr.items.some((it) => it.sku === b.sku)) {
          return {
            ...b,
            status: 'PO Issued',
            poNumber: newPO.poNumber
          };
        }
        return b;
      });
      save(STORAGE_KEYS.PROJECTS, this.projects);
    }

    this.pos = [newPO, ...this.pos];
    save(STORAGE_KEYS.POS, this.pos);
    save(STORAGE_KEYS.PRS, this.prs);

    this.logAudit('CONVERT_TO_PO', 'PO', newPO.poNumber, `Converted PR ${pr.prNumber} into Purchase Order ${newPO.poNumber} assigned to ${vendor.name} (Amount: ₹${grandTotal.toLocaleString()})`);
    this.addNotification('Purchase Order Generated', `${newPO.poNumber} generated for ${vendor.name} (₹${grandTotal.toLocaleString()}) - Awaiting Business Manager Signoff`, 'info', 'procurement');

    this.notify();
    return newPO;
  }

  // APPROVE PO (Business Manager / Executive Sign-off)
  public approvePO(poId: string, remarks?: string) {
    const po = this.pos.find((p) => p.id === poId);
    if (!po) throw new Error('PO not found');

    po.status = 'Approved';
    po.approvedBy = `${this.user.name} (${this.user.title || this.user.role.toUpperCase()})`;
    po.approvedAt = new Date().toISOString();
    po.approvalRemarks = remarks || 'Approved for vendor procurement & financial commitment.';

    save(STORAGE_KEYS.POS, this.pos);
    this.logAudit('APPROVE', 'PO', po.poNumber, `Approved Purchase Order ${po.poNumber} for ₹${po.grandTotal.toLocaleString()} by Business Manager / Admin`);
    this.addNotification('PO Approved by Business Manager', `${po.poNumber} is approved and ready to transmit to vendor.`, 'success', 'procurement');

    if (this.backupConfig.autoSnapshotOnCriticalProcurement) {
      this.recordCriticalSnapshot(
        'PROCUREMENT_CRITICAL',
        'Procurement',
        `PO Approved: ${po.poNumber} (₹${po.grandTotal.toLocaleString()})`
      );
    }

    this.notify();
    return po;
  }

  // REJECT PO
  public rejectPO(poId: string, remarks: string) {
    const po = this.pos.find((p) => p.id === poId);
    if (!po) throw new Error('PO not found');

    po.status = 'Rejected';
    po.approvedBy = `${this.user.name} (${this.user.title || this.user.role.toUpperCase()})`;
    po.approvedAt = new Date().toISOString();
    po.approvalRemarks = remarks || 'Rejected by Business Manager during financial review.';

    save(STORAGE_KEYS.POS, this.pos);
    this.logAudit('REJECT', 'PO', po.poNumber, `Rejected Purchase Order ${po.poNumber}. Reason: ${remarks}`);
    this.addNotification('PO Rejected', `${po.poNumber} was rejected by Business Manager. Reason: ${remarks}`, 'alert', 'procurement');

    if (this.backupConfig.autoSnapshotOnCriticalProcurement) {
      this.recordCriticalSnapshot(
        'PROCUREMENT_CRITICAL',
        'Procurement',
        `PO Rejected: ${po.poNumber}`
      );
    }

    this.notify();
    return po;
  }

  // SEND PO TO VENDOR (Replenishment Trigger via WhatsApp / Email)
  public sendPOToVendor(poId: string, channel: 'Email' | 'WhatsApp' | 'Both'): { messageUrl?: string } {
    const po = this.pos.find((p) => p.id === poId);
    if (!po) throw new Error('PO not found');

    po.status = 'Sent to Vendor';
    po.sentToVendorAt = new Date().toISOString();
    po.vendorAcknowledgmentStatus = 'Confirmed';

    // Auto-create Accounts Payable record
    const newPayable: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceNumber: `PO-PAY-${po.poNumber.replace('PO-2026-', '')}`,
      referenceType: 'PurchaseOrder',
      referenceId: po.id,
      referenceTitle: `${po.poNumber} (${po.vendorName})`,
      clientOrVendorName: po.vendorName,
      isPayable: true,
      paymentType: 'Vendor Payout',
      amount: po.subtotal,
      taxAmount: po.taxAmount,
      totalAmount: po.grandTotal,
      dueDate: po.expectedDeliveryDate,
      status: 'Pending',
      notes: `Vendor replenishment pay scheduled for PO ${po.poNumber}`
    };
    this.payments = [newPayable, ...this.payments];
    save(STORAGE_KEYS.PAYMENTS, this.payments);
    save(STORAGE_KEYS.POS, this.pos);

    this.logAudit('SEND_TO_VENDOR', 'PO', po.poNumber, `Transmitted Purchase Order ${po.poNumber} to vendor ${po.vendorName} via ${channel} for material replenishment`);
    this.addNotification('PO Transmitted to Vendor', `${po.poNumber} dispatched to ${po.vendorName}. Replenishment pipeline active!`, 'success', 'procurement');

    this.notify();
    return {};
  }

  // GOODS RECEIPT & STOCK INWARDING (REPLENISHMENT)
  public receivePOGoods(poId: string, itemsReceived: Array<{ sku: string; qty: number }>) {
    const po = this.pos.find((p) => p.id === poId);
    if (!po) throw new Error('PO not found');

    let allFulfilled = true;
    po.items = po.items.map((it) => {
      const matchingReceived = itemsReceived.find((r) => r.sku === it.sku);
      if (matchingReceived) {
        const newReceivedQty = (it.receivedQty || 0) + matchingReceived.qty;
        if (newReceivedQty < it.orderedQty) allFulfilled = false;
        return {
          ...it,
          receivedQty: newReceivedQty
        };
      }
      if (it.receivedQty < it.orderedQty) allFulfilled = false;
      return it;
    });

    po.status = allFulfilled ? 'Fulfilled' : 'Partially Received';

    // Inward stock into inventory
    itemsReceived.forEach((r) => {
      const inv = this.inventory.find((i) => i.sku === r.sku);
      if (inv) {
        inv.currentStock += r.qty;
        inv.availableStock = inv.currentStock - inv.allocatedStock;
        inv.lastRestockedDate = new Date().toISOString().split('T')[0];
      }
    });

    // Update Project BOQ status if linked
    if (po.projectId) {
      const project = this.projects.find((p) => p.id === po.projectId);
      if (project) {
        project.boqItems = project.boqItems.map((b) => {
          if (itemsReceived.some((r) => r.sku === b.sku)) {
            return {
              ...b,
              status: 'Inwarded / Available'
            };
          }
          return b;
        });
        save(STORAGE_KEYS.PROJECTS, this.projects);
      }
    }

    // Generate Goods Receipt Note (GRN) with automated number series
    const grnNumber = this.generateSeriesNumber('grn');
    const totalQtyReceived = itemsReceived.reduce((acc, r) => acc + r.qty, 0);
    const grnRecord: GoodsReceiptNote = {
      id: `grn-${Date.now()}`,
      grnNumber,
      poId: po.id,
      poNumber: po.poNumber,
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      receiptDate: new Date().toISOString().split('T')[0],
      receivedBy: `${this.user.name} (${this.user.title || this.user.role.toUpperCase()})`,
      warehouseBay: 'Central Warehouse Yard Bay 04',
      status: allFulfilled ? 'Received & Verified' : 'Partially Received',
      items: itemsReceived.map((r) => {
        const matchingPOItem = po.items.find((it) => it.sku === r.sku);
        return {
          sku: r.sku,
          name: matchingPOItem ? matchingPOItem.name : r.sku,
          unit: matchingPOItem ? matchingPOItem.unit : 'pcs',
          orderedQty: matchingPOItem ? matchingPOItem.orderedQty : r.qty,
          receivedQty: r.qty,
          acceptedQty: r.qty
        };
      }),
      totalItemsCount: itemsReceived.length,
      totalQuantity: totalQtyReceived,
      notes: `Warehouse Inwarding against PO ${po.poNumber}`,
      createdAt: new Date().toISOString()
    };
    this.grns = [grnRecord, ...this.grns];
    save(STORAGE_KEYS.GRNS, this.grns);

    save(STORAGE_KEYS.INVENTORY, this.inventory);
    save(STORAGE_KEYS.POS, this.pos);

    this.logAudit('UPDATE', 'INVENTORY', po.poNumber, `Goods Receipt Note (${grnRecord.grnNumber}) processed for ${po.poNumber}. Inwarded ${itemsReceived.map((r) => `${r.qty}x ${r.sku}`).join(', ')} into warehouse stock`);
    this.addNotification('Warehouse Inward Complete', `GRN ${grnRecord.grnNumber} generated for ${po.poNumber}. Stock replenished!`, 'success', 'inventory');

    if (this.backupConfig.autoSnapshotOnCriticalProcurement) {
      this.recordCriticalSnapshot(
        'PROCUREMENT_CRITICAL',
        'Procurement',
        `Goods Inward / GRN: ${itemsReceived.length} item types received for ${po.poNumber}`
      );
    }

    this.notify();
  }

  // INVENTORY & SAFETY STOCK AUTOMATION
  public getInventory(): InventoryItem[] {
    return this.inventory;
  }

  public checkSafetyStockAlerts(manualTrigger: boolean = false): {
    flaggedItems: InventoryItem[];
    alertsGenerated: number;
  } {
    const flaggedItems: InventoryItem[] = [];
    let alertsGenerated = 0;

    for (const item of this.inventory) {
      // 10% Safety stock threshold: Available stock is <= 10% of reorder level (or <= 0)
      const threshold = item.reorderLevel > 0 ? item.reorderLevel * 0.1 : 0;
      const isBelow10Percent = item.availableStock <= threshold || item.availableStock <= 0;

      if (isBelow10Percent) {
        flaggedItems.push(item);
        const percentage = item.reorderLevel > 0
          ? Math.max(0, Math.round((item.availableStock / item.reorderLevel) * 100))
          : 0;

        // Prevent spamming duplicate notifications if one was already triggered within the last 12 hours unless manual
        const existingAlert = this.notifications.find(
          (n) => n.title.includes(item.sku) && (Date.now() - new Date(n.timestamp).getTime() < 1000 * 60 * 60 * 12)
        );

        if (!existingAlert || manualTrigger) {
          const notif: AppNotification = {
            id: `notif-stock-${item.sku}-${Date.now()}`,
            title: `🚨 Critical Stock Alert: ${item.sku}`,
            message: `${item.name} is at ${item.availableStock} ${item.unit} (${percentage}% of ${item.reorderLevel} ${item.unit} reorder level), falling below the 10% safety stock threshold. Immediate PR / replenishment needed!`,
            type: 'alert',
            timestamp: new Date().toISOString(),
            read: false,
            linkTab: 'inventory'
          };
          this.notifications = [notif, ...this.notifications];
          alertsGenerated++;
        }
      }
    }

    if (alertsGenerated > 0) {
      save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
      this.notify();
    }

    return { flaggedItems, alertsGenerated };
  }

  public updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
    let updatedItem: InventoryItem | undefined;
    this.inventory = this.inventory.map((inv) => {
      if (inv.id === id) {
        const updated = { ...inv, ...updates };
        updated.availableStock = updated.currentStock - updated.allocatedStock;
        updatedItem = updated;
        return updated;
      }
      return inv;
    });
    save(STORAGE_KEYS.INVENTORY, this.inventory);
    if (updatedItem) {
      this.logAudit(
        'UPDATE',
        'INVENTORY',
        updatedItem.sku,
        `Updated inventory for ${updatedItem.name} (${updatedItem.sku}): Stock level is now ${updatedItem.currentStock} ${updatedItem.unit} (Available: ${updatedItem.availableStock} ${updatedItem.unit})`
      );

      if (this.backupConfig.autoSnapshotOnCriticalInventory) {
        this.recordCriticalSnapshot(
          'INVENTORY_CRITICAL',
          'Inventory',
          `Inventory Updated: ${updatedItem.sku} stock set to ${updatedItem.currentStock} ${updatedItem.unit}`
        );
      }
    }
    this.checkSafetyStockAlerts(false);
    this.notify();
  }

  public addInventoryItem(item: Omit<InventoryItem, 'id' | 'availableStock'>): InventoryItem {
    const sku = item.sku || this.generateSeriesNumber('product');
    const newItem: InventoryItem = {
      ...item,
      sku,
      id: `inv-${Date.now()}`,
      availableStock: item.currentStock - item.allocatedStock
    };
    this.inventory = [newItem, ...this.inventory];
    save(STORAGE_KEYS.INVENTORY, this.inventory);
    this.logAudit('CREATE', 'INVENTORY', newItem.sku, `Created new inventory item: ${newItem.name} (${newItem.sku})`);

    if (this.backupConfig.autoSnapshotOnCriticalInventory) {
      this.recordCriticalSnapshot(
        'INVENTORY_CRITICAL',
        'Inventory',
        `New SKU Added: ${newItem.sku} (${newItem.name})`
      );
    }

    this.checkSafetyStockAlerts(false);
    this.notify();
    return newItem;
  }

  // WORK ORDERS
  public getWorkOrders(): WorkOrder[] {
    return this.workOrders;
  }

  public addWorkOrder(wo: Omit<WorkOrder, 'id' | 'orderNumber'>): WorkOrder {
    const newWO: WorkOrder = {
      ...wo,
      id: `wo-${Date.now()}`,
      orderNumber: this.generateSeriesNumber('workorder')
    };
    this.workOrders = [newWO, ...this.workOrders];
    save(STORAGE_KEYS.WORK_ORDERS, this.workOrders);
    this.logAudit('CREATE', 'WORK_ORDER', newWO.orderNumber, `Created Work Order ${newWO.orderNumber} for ${newWO.clientName}`);
    this.notify();
    return newWO;
  }

  public updateWorkOrder(id: string, updates: Partial<WorkOrder>) {
    this.workOrders = this.workOrders.map((w) => (w.id === id ? { ...w, ...updates } : w));
    save(STORAGE_KEYS.WORK_ORDERS, this.workOrders);
    this.notify();
  }

  // PROJECTS
  public getProjects(): Project[] {
    return this.projects;
  }

  public updateProject(id: string, updates: Partial<Project>) {
    this.projects = this.projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    save(STORAGE_KEYS.PROJECTS, this.projects);
    this.notify();
  }

  public updateProjectDelay(
    id: string,
    delayInfo: {
      isDelayed: boolean;
      delayDays: number;
      delayReason: string;
      delayCategory?: Project['delayCategory'];
      delayMitigationPlan?: string;
      revisedCompletionDate?: string;
    }
  ) {
    const project = this.projects.find((p) => p.id === id);
    this.updateProject(id, {
      ...delayInfo
    });

    if (project) {
      this.logAudit(
        'UPDATE',
        'PROJECT',
        id,
        `Updated delay tracking for ${project.projectNumber} (${project.projectName}): ${delayInfo.isDelayed ? `${delayInfo.delayDays}d delay - "${delayInfo.delayReason}"` : 'Marked On-Track'}`
      );
      this.addNotification(
        'Project Schedule Status Updated',
        `${project.projectNumber} delay status: ${delayInfo.isDelayed ? `${delayInfo.delayDays} days delay logged` : 'Marked On-Track'}.`,
        delayInfo.isDelayed ? 'warning' : 'success',
        'projects'
      );
    }
  }

  // PURCHASE REQUISITIONS
  public getPRs(): PurchaseRequisition[] {
    return this.prs;
  }

  // PURCHASE ORDERS
  public getPOs(): PurchaseOrder[] {
    return this.pos;
  }

  // VENDORS
  public getVendors(): Vendor[] {
    return this.vendors;
  }

  public addVendor(v: Omit<Vendor, 'id'>): Vendor {
    const newVendor: Vendor = {
      ...v,
      id: `ven-${Date.now()}`
    };
    this.vendors = [newVendor, ...this.vendors];
    save(STORAGE_KEYS.VENDORS, this.vendors);
    this.logAudit('CREATE', 'PO', newVendor.id, `Added new vendor partner: ${newVendor.name}`);
    this.notify();
    return newVendor;
  }

  // PAYMENTS & INVOICES
  public getPayments(): PaymentRecord[] {
    return this.payments;
  }

  public addPayment(payment: Omit<PaymentRecord, 'id' | 'invoiceNumber'> & { invoiceNumber?: string }): PaymentRecord {
    const newPayment: PaymentRecord = {
      ...payment,
      id: `pay-${Date.now()}`,
      invoiceNumber: payment.invoiceNumber || this.generateSeriesNumber('invoice')
    };
    this.payments = [newPayment, ...this.payments];
    save(STORAGE_KEYS.PAYMENTS, this.payments);
    this.logAudit('CREATE', 'PAYMENT', newPayment.invoiceNumber, `Generated Invoice/Payment Record ${newPayment.invoiceNumber} for ₹${newPayment.totalAmount.toLocaleString()}`);
    this.notify();
    return newPayment;
  }

  public processPayment(
    paymentId: string,
    paymentMethod: PaymentRecord['paymentMethod'],
    transactionRef: string,
    attachment?: InvoiceAttachment
  ) {
    const p = this.payments.find((pay) => pay.id === paymentId);
    if (!p) throw new Error('Payment not found');

    p.status = 'Paid';
    p.paidDate = new Date().toISOString().split('T')[0];
    p.paymentMethod = paymentMethod;
    p.transactionReference = transactionRef;

    if (attachment) {
      if (!p.attachments) p.attachments = [];
      p.attachments = [attachment, ...p.attachments];
      p.invoicePhotoUrl = attachment.dataUrl;
    }

    // If client payment for project, increment project payments received
    if (!p.isPayable && p.referenceType === 'Project') {
      const project = this.projects.find((proj) => proj.id === p.referenceId);
      if (project) {
        project.paymentsReceivedAmount = (project.paymentsReceivedAmount || 0) + p.totalAmount;
        save(STORAGE_KEYS.PROJECTS, this.projects);
      }
    }

    save(STORAGE_KEYS.PAYMENTS, this.payments);
    this.logAudit('PAYMENT_PROCESSED', 'PAYMENT', p.invoiceNumber, `Processed payment ${p.invoiceNumber} (₹${p.totalAmount.toLocaleString()}) via ${paymentMethod} [Ref: ${transactionRef}]`);
    this.addNotification('Payment Received / Settled', `Invoice ${p.invoiceNumber} has been marked as Paid (₹${p.totalAmount.toLocaleString()})`, 'success', 'finance');

    this.notify();
  }

  public addPaymentAttachment(paymentId: string, attachment: InvoiceAttachment): PaymentRecord {
    const p = this.payments.find((pay) => pay.id === paymentId);
    if (!p) throw new Error('Payment record not found');

    if (!p.attachments) {
      p.attachments = [];
    }
    p.attachments = [attachment, ...p.attachments];
    p.invoicePhotoUrl = attachment.dataUrl;

    save(STORAGE_KEYS.PAYMENTS, this.payments);
    this.logAudit(
      'UPDATE',
      'PAYMENT',
      p.invoiceNumber,
      `Attached physical invoice photo "${attachment.fileName}" to transaction ${p.invoiceNumber}`
    );
    this.addNotification(
      'Invoice Photo Attached',
      `Physical invoice snapshot successfully attached to ${p.invoiceNumber}`,
      'info',
      'finance'
    );
    this.notify();
    return p;
  }

  public removePaymentAttachment(paymentId: string, attachmentId: string): PaymentRecord {
    const p = this.payments.find((pay) => pay.id === paymentId);
    if (!p) throw new Error('Payment record not found');

    if (p.attachments) {
      p.attachments = p.attachments.filter((a) => a.id !== attachmentId);
      p.invoicePhotoUrl = p.attachments.length > 0 ? p.attachments[0].dataUrl : undefined;
    }

    save(STORAGE_KEYS.PAYMENTS, this.payments);
    this.logAudit(
      'DELETE',
      'PAYMENT',
      p.invoiceNumber,
      `Removed invoice attachment from transaction ${p.invoiceNumber}`
    );
    this.notify();
    return p;
  }

  public updatePayment(paymentId: string, updates: Partial<PaymentRecord>): PaymentRecord {
    const p = this.payments.find((pay) => pay.id === paymentId);
    if (!p) throw new Error('Payment record not found');

    Object.assign(p, updates);
    save(STORAGE_KEYS.PAYMENTS, this.payments);
    this.notify();
    return p;
  }

  // SALES REPS & COMMISSIONS
  public getSalesReps(): SalesRep[] {
    return this.salesReps;
  }

  public updateSalesQuota(repId: string, monthlyQuota: number, quarterlyQuota: number, baseCommissionPct: number) {
    this.salesReps = this.salesReps.map((r) => {
      if (r.id === repId) {
        return {
          ...r,
          monthlyQuota,
          quarterlyQuota,
          baseCommissionPct
        };
      }
      return r;
    });
    save(STORAGE_KEYS.SALES_REPS, this.salesReps);
    this.recalculateSalesReps();
    this.logAudit('UPDATE', 'SALES_QUOTA', repId, `Updated sales quotas and commission parameters for rep`);
    this.notify();
  }

  private recalculateSalesReps() {
    this.salesReps = this.salesReps.map((rep) => {
      // Calculate won deals from quotes or leads
      const repLeads = this.leads.filter((l) => l.assignedTo === rep.id);
      const wonLeads = repLeads.filter((l) => l.status === 'Awarded');
      const wonDealsCount = wonLeads.length;
      const activePipelineValue = repLeads
        .filter((l) => l.status !== 'Awarded' && l.status !== 'Lost')
        .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

      // Won amount
      const achievedSalesMonth = wonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0) + (rep.achievedSalesMonth > 0 ? 0 : 0);
      const baseComm = (achievedSalesMonth * rep.baseCommissionPct) / 100;
      const bonus = achievedSalesMonth > rep.monthlyQuota ? ((achievedSalesMonth - rep.monthlyQuota) * rep.bonusMultiplierPct) / 100 : 0;

      return {
        ...rep,
        wonDealsCount: Math.max(rep.wonDealsCount, wonDealsCount),
        activePipelineValue,
        calculatedCommission: Math.round(baseComm + bonus)
      };
    });
    save(STORAGE_KEYS.SALES_REPS, this.salesReps);
  }

  // AUDIT LOGS
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  // NOTIFICATIONS
  public getNotifications(): AppNotification[] {
    return this.notifications;
  }

  // GOOGLE SHEETS CONFIG
  public getGoogleSheetsConfig(): GoogleSheetsSyncConfig {
    return this.sheetsConfig;
  }

  public updateGoogleSheetsConfig(updates: Partial<GoogleSheetsSyncConfig>) {
    this.sheetsConfig = { ...this.sheetsConfig, ...updates };
    save(STORAGE_KEYS.SHEETS_CONFIG, this.sheetsConfig);
    this.notify();
  }

  // AUTHENTICATION & EMAIL OTP SYSTEM
  public isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  public requestEmailOtp(
    email: string,
    mode: 'login' | 'signup' = 'login',
    tempUserData?: {
      name: string;
      phone?: string;
      role: UserRole;
      title?: string;
      department?: string;
    }
  ): { success: boolean; otp: string; message: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please provide a valid corporate email address.');
    }

    if (mode === 'login') {
      const existingUser = this.users.find((u) => (u.email || '').toLowerCase() === cleanEmail);
      if (existingUser && existingUser.status === 'deactivated') {
        throw new Error('This user account has been deactivated by the system administrator.');
      }
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    this.activeOtps[cleanEmail] = {
      otp,
      expiresAt,
      mode,
      tempUserData
    };

    // Notification and Audit Log
    this.addNotification(
      `🔐 Verification Code Sent`,
      `One-Time Password (OTP) for ${cleanEmail} is ${otp}. Valid for 5 minutes.`,
      'info'
    );

    this.logAudit('CREATE', 'USER', cleanEmail, `Generated Email OTP (${mode.toUpperCase()}) for ${cleanEmail}`);
    this.notify();

    return {
      success: true,
      otp,
      message: `Verification code successfully dispatched to ${cleanEmail}`
    };
  }

  public getActiveOtpForEmail(email: string): string | null {
    const cleanEmail = (email || '').trim().toLowerCase();
    const active = this.activeOtps[cleanEmail];
    if (active && active.expiresAt > Date.now()) {
      return active.otp;
    }
    return null;
  }

  public verifyEmailOtp(
    email: string,
    enteredOtp: string
  ): { success: boolean; user?: UserProfile; message?: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (enteredOtp || '').trim();

    const record = this.activeOtps[cleanEmail];
    const isMasterDemoOtp = cleanOtp === '123456' || cleanOtp === '999999';

    if (!record && !isMasterDemoOtp) {
      throw new Error('No active OTP request found for this email. Please request a new code.');
    }

    if (record && record.expiresAt < Date.now() && !isMasterDemoOtp) {
      delete this.activeOtps[cleanEmail];
      throw new Error('This verification code has expired. Please request a fresh OTP.');
    }

    if (record && record.otp !== cleanOtp && !isMasterDemoOtp) {
      throw new Error('Invalid verification code. Please check your email or enter 123456 in demo mode.');
    }

    // OTP is valid! Find or create user
    let targetUser = this.users.find((u) => (u.email || '').toLowerCase() === cleanEmail);

    if (!targetUser) {
      // New user creation from signup or automatic creation
      const temp = record?.tempUserData;
      const role: UserRole = temp?.role || (cleanEmail.includes('admin') || cleanEmail.includes('shiven') ? 'executive' : 'procurement');
      const name = temp?.name || (cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()));

      targetUser = this.addUser({
        name,
        email: cleanEmail,
        phone: temp?.phone || '+91 98000 00000',
        role,
        title: temp?.title || (role === 'executive' ? 'Executive Director & Administrator' : 'HVAC Operations Specialist'),
        department: temp?.department || 'Operations'
      });
    }

    // Set logged-in session
    this.user = targetUser;
    this.isAuthenticated = true;
    save(STORAGE_KEYS.USER, this.user);
    save(STORAGE_KEYS.AUTH_SESSION, true);

    // Clean up OTP record
    delete this.activeOtps[cleanEmail];

    this.logAudit('UPDATE', 'USER', targetUser.id, `User ${targetUser.name} signed in successfully via Email OTP`);
    this.addNotification('Login Successful', `Welcome back, ${targetUser.name}!`, 'success');
    this.notify();

    return {
      success: true,
      user: targetUser,
      message: 'Authentication successful'
    };
  }

  public loginDemoUser(userIdOrRole: string): UserProfile {
    let targetUser = this.users.find((u) => u.id === userIdOrRole || u.role === userIdOrRole);
    if (!targetUser) {
      targetUser = this.users[0] || INITIAL_CURRENT_USER;
    }

    this.user = targetUser;
    this.isAuthenticated = true;
    save(STORAGE_KEYS.USER, this.user);
    save(STORAGE_KEYS.AUTH_SESSION, true);

    this.logAudit('UPDATE', 'USER', targetUser.id, `Signed in as [${targetUser.role.toUpperCase()}] ${targetUser.name}`);
    this.addNotification('Signed In', `Active session: ${targetUser.name} (${targetUser.role.toUpperCase()})`, 'info');
    this.notify();
    return targetUser;
  }

  public logout(): void {
    this.isAuthenticated = false;
    save(STORAGE_KEYS.AUTH_SESSION, false);
    this.logAudit('UPDATE', 'USER', this.user.id, `User ${this.user.name} logged out`);
    this.notify();
  }

  // SYSTEM SETTINGS & APPLICATION CUSTOMIZATION
  public getSystemSettings(): SystemSettings {
    return this.systemSettings;
  }

  public updateSystemSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.systemSettings = {
      ...this.systemSettings,
      ...updates,
      moduleFlags: {
        ...this.systemSettings.moduleFlags,
        ...(updates.moduleFlags || {})
      }
    };
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);

    this.logAudit(
      'UPDATE',
      'USER',
      this.user.id,
      `Super Admin updated AlphaERP system configuration and branding parameters`
    );
    this.addNotification(
      'System Customizations Saved',
      'Branding, commercial policies, thresholds and module settings updated.',
      'success',
      'system_settings'
    );
    this.notify();
    return this.systemSettings;
  }

  public getDisplayDensity(): 'compact' | 'spacious' {
    return this.systemSettings.displayDensity || 'spacious';
  }

  public setDisplayDensity(density: 'compact' | 'spacious'): 'compact' | 'spacious' {
    this.updateSystemSettings({ displayDensity: density });
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-density', density);
        document.body.classList.toggle('density-compact', density === 'compact');
        document.body.classList.toggle('density-spacious', density === 'spacious');
      }
    } catch {}
    return density;
  }

  public resetSystemSettings(): SystemSettings {
    this.systemSettings = { ...INITIAL_SYSTEM_SETTINGS };
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);
    this.logAudit('UPDATE', 'USER', this.user.id, 'Super Admin reset system configuration to factory defaults');
    this.addNotification('Settings Reset', 'System settings restored to original factory defaults.', 'warning');
    this.notify();
    return this.systemSettings;
  }

  // ==========================================
  // ROLE-BASED MODULE VISIBILITY & ACCESS PERMISSIONS
  // ==========================================
  public getRoleModulePermissions(): Record<UserRole, string[]> {
    if (!this.systemSettings.roleModulePermissions) {
      this.systemSettings.roleModulePermissions = JSON.parse(JSON.stringify(DEFAULT_ROLE_MODULE_PERMISSIONS));
      save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);
    }
    return this.systemSettings.roleModulePermissions;
  }

  public getModulesForRole(role: UserRole): string[] {
    const permissions = this.getRoleModulePermissions();
    if (permissions[role] && Array.isArray(permissions[role]) && permissions[role].length > 0) {
      return permissions[role];
    }
    return DEFAULT_ROLE_MODULE_PERMISSIONS[role] || DEFAULT_ROLE_MODULE_PERMISSIONS.executive;
  }

  public updateRoleModulePermissions(role: UserRole, moduleIds: string[]): Record<UserRole, string[]> {
    const current = { ...this.getRoleModulePermissions() };
    current[role] = moduleIds;
    this.systemSettings.roleModulePermissions = current;
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);

    this.logAudit(
      'UPDATE',
      'USER',
      this.user.id,
      `Super Admin updated role module visibility matrix for role [${role.toUpperCase()}] (${moduleIds.length} modules granted)`
    );
    this.addNotification(
      'Role Permissions Updated',
      `Active modules for ${role.replace('_', ' ').toUpperCase()} updated (${moduleIds.length} modules visible).`,
      'success',
      'users'
    );
    this.notify();
    return current;
  }

  public setAllRoleModulePermissions(permissions: Record<UserRole, string[]>): Record<UserRole, string[]> {
    this.systemSettings.roleModulePermissions = permissions;
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);

    this.logAudit(
      'UPDATE',
      'USER',
      this.user.id,
      `Super Admin updated complete enterprise Role-Based Module Visibility Matrix`
    );
    this.addNotification(
      'Role Matrix Saved',
      'Enterprise role module permissions matrix successfully updated.',
      'success',
      'users'
    );
    this.notify();
    return permissions;
  }

  public resetRoleModulePermissions(role?: UserRole): Record<UserRole, string[]> {
    const current = { ...this.getRoleModulePermissions() };
    if (role) {
      current[role] = [...(DEFAULT_ROLE_MODULE_PERMISSIONS[role] || DEFAULT_ROLE_MODULE_PERMISSIONS.executive)];
    } else {
      Object.assign(current, JSON.parse(JSON.stringify(DEFAULT_ROLE_MODULE_PERMISSIONS)));
    }
    this.systemSettings.roleModulePermissions = current;
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);

    this.logAudit(
      'UPDATE',
      'USER',
      this.user.id,
      role
        ? `Super Admin reset module visibility for role [${role.toUpperCase()}] to factory defaults`
        : `Super Admin reset all role module permissions to factory defaults`
    );
    this.addNotification(
      'Role Permissions Reset',
      role
        ? `Module visibility for ${role.toUpperCase()} restored to factory defaults.`
        : 'All role module permissions restored to factory defaults.',
      'warning',
      'users'
    );
    this.notify();
    return current;
  }

  public canRoleAccessModule(role: UserRole, moduleId: string): boolean {
    const modules = this.getModulesForRole(role);
    return modules.includes(moduleId);
  }

  // ==========================================
  // MASTER DATA UNIQUE AUTOMATED NUMBER SERIES ENGINE
  // ==========================================
  public getNumberSeriesList(): SeriesDefinition[] {
    if (!this.systemSettings.numberSeries || this.systemSettings.numberSeries.length === 0) {
      this.systemSettings.numberSeries = DEFAULT_NUMBER_SERIES.map((s) => ({ ...s }));
      save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);
    }
    return this.systemSettings.numberSeries;
  }

  public peekNextSeriesNumber(seriesId: string, customYear?: number): string {
    const list = this.getNumberSeriesList();
    const series = list.find((s) => s.id === seriesId);
    if (!series) {
      const fallbackYy = (customYear || new Date().getFullYear()).toString().slice(-2);
      return `${fallbackYy}-${seriesId.toUpperCase().slice(0, 3)}-0001`;
    }
    return formatSeriesNumber(series, series.currentSequence, customYear);
  }

  public generateSeriesNumber(seriesId: string, customYear?: number): string {
    const list = this.getNumberSeriesList();
    let series = list.find((s) => s.id === seriesId);
    if (!series) {
      const fallbackYy = (customYear || new Date().getFullYear()).toString().slice(-2);
      return `${fallbackYy}-${seriesId.toUpperCase().slice(0, 3)}-0001`;
    }

    const generatedNumber = formatSeriesNumber(series, series.currentSequence, customYear);
    series.currentSequence = (series.currentSequence || 1) + 1;
    this.systemSettings.numberSeries = list;
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);
    return generatedNumber;
  }

  public updateNumberSeriesList(updatedList: SeriesDefinition[]): void {
    this.systemSettings.numberSeries = updatedList;
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);
    this.logAudit(
      'UPDATE',
      'USER',
      this.user.id,
      'Super Admin updated Automated System Number Series sequence configurations'
    );
    this.addNotification(
      'Number Series Saved',
      'Automated unique numbering sequence rules updated successfully.',
      'success',
      'system_settings'
    );
    this.notify();
  }

  public updateSingleSeries(seriesId: string, updates: Partial<SeriesDefinition>): void {
    const list = this.getNumberSeriesList().map((s) => (s.id === seriesId ? { ...s, ...updates } : s));
    this.updateNumberSeriesList(list);
  }

  public resetNumberSeriesToDefaults(): void {
    this.systemSettings.numberSeries = DEFAULT_NUMBER_SERIES.map((s) => ({ ...s }));
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);
    this.logAudit(
      'UPDATE',
      'USER',
      this.user.id,
      'Super Admin reset all system Number Series to factory defaults'
    );
    this.addNotification(
      'Number Series Reset',
      'All automated number series restored to factory defaults.',
      'warning',
      'system_settings'
    );
    this.notify();
  }

  // ==========================================
  // AUTOMATED DAILY BUSINESS KPI & WHATSAPP TRIGGER ENGINE
  // ==========================================
  public getWhatsAppTriggerConfig(): WhatsAppTriggerConfig {
    if (this.systemSettings.whatsAppTriggerConfig && this.systemSettings.whatsAppTriggerConfig.recipients?.length > 0) {
      return this.systemSettings.whatsAppTriggerConfig;
    }
    return {
      enabled: true,
      autoTriggerTime: '08:30',
      triggerDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      autoTriggerOnSync: true,
      includeDetailedLeadNames: true,
      includeDelayedProjectReasons: true,
      includeAgingBreakdown: true,
      recipients: [
        {
          id: 'rec-1',
          name: 'Shivender Kumar',
          phone: '+91 98200 11223',
          role: 'executive',
          designation: 'Managing Director & CEO',
          active: true,
          notes: 'Executive Daily Summary'
        },
        {
          id: 'rec-2',
          name: 'Sunita Narang',
          phone: '+91 98112 33490',
          role: 'finance',
          designation: 'Chief Financial Officer',
          active: true,
          notes: 'Collections & Aging Buckets'
        },
        {
          id: 'rec-3',
          name: 'Rajesh Sharma',
          phone: '+91 98234 11200',
          role: 'sales_manager',
          designation: 'Head of Sales & Estimations',
          active: true,
          notes: 'New Leads & Revenue'
        },
        {
          id: 'rec-4',
          name: 'Vikramaditya Solanki',
          phone: '+91 98190 44321',
          role: 'executive',
          designation: 'Director of Projects & Field Operations',
          active: true,
          notes: 'Delayed Projects & Delay Reasons'
        }
      ],
      customHeaderTitle: 'ALPHA HVAC ENTERPRISE — PREVIOUS DAY BUSINESS KEY KPIS DIGEST',
      customFooterNote: 'Generated automatically by AlphaERP Intelligent Business Engine'
    };
  }

  public updateWhatsAppTriggerConfig(config: WhatsAppTriggerConfig): WhatsAppTriggerConfig {
    this.systemSettings.whatsAppTriggerConfig = config;
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);
    this.logAudit(
      'UPDATE',
      'USER',
      this.user.id,
      `Super Admin updated WhatsApp Daily Business KPI trigger automation settings (${config.recipients.filter((r) => r.active).length} active recipients)`
    );
    this.addNotification(
      'WhatsApp Automation Updated',
      `Daily KPI dispatch scheduled for ${config.autoTriggerTime} IST (${config.recipients.filter((r) => r.active).length} recipients).`,
      'success',
      'dashboard'
    );
    this.notify();
    return config;
  }

  public getDailyKpiSnapshots(): DailyKpiSnapshot[] {
    return load(STORAGE_KEYS.DAILY_KPI_SNAPSHOTS, []);
  }

  public saveDailyKpiSnapshot(snapshot: DailyKpiSnapshot): void {
    const list = this.getDailyKpiSnapshots();
    const filtered = list.filter((s) => s.id !== snapshot.id && s.date !== snapshot.date);
    const updated = [snapshot, ...filtered].slice(0, 30); // keep last 30 snapshots
    save(STORAGE_KEYS.DAILY_KPI_SNAPSHOTS, updated);
    this.notify();
  }

  // ==========================================
  // MASTER DATA & ENTITY NUMBER SERIES MIGRATION & BACKFILL ENGINE
  // ==========================================
  public backfillNumberSeriesCodes(options?: { forceReassignAll?: boolean }): {
    vendorsMigrated: number;
    employeesMigrated: number;
    relatedRecordsUpdated: number;
    summary: string;
  } {
    const forceReassign = !!options?.forceReassignAll;
    const seriesList = this.getNumberSeriesList();
    const vendorSeries = seriesList.find((s) => s.id === 'vendor') || DEFAULT_NUMBER_SERIES.find((s) => s.id === 'vendor')!;
    const empSeries = seriesList.find((s) => s.id === 'employee') || DEFAULT_NUMBER_SERIES.find((s) => s.id === 'employee')!;
    const currentYear = new Date().getFullYear();
    const currentYearDigits = currentYear.toString().slice(-2);

    let vendorsMigrated = 0;
    let employeesMigrated = 0;
    let relatedRecordsUpdated = 0;

    // 1. VENDOR CODES MIGRATION & BACKFILL
    const seenVendorCodes = new Set<string>();
    let maxVendorSeq = 0;

    // First pass: detect existing valid structured series codes if not forcing full reassign
    if (!forceReassign) {
      this.vendors.forEach((v) => {
        const raw = (v.vendorCode || v.code || '').trim().toUpperCase();
        const isConforming = raw && !seenVendorCodes.has(raw) && (
          raw.startsWith(`${currentYearDigits}-${vendorSeries.prefix}-`) ||
          raw.startsWith(`${vendorSeries.prefix}-`)
        );
        if (isConforming) {
          seenVendorCodes.add(raw);
          const seqMatch = raw.match(/\d+$/);
          if (seqMatch) {
            maxVendorSeq = Math.max(maxVendorSeq, parseInt(seqMatch[0], 10));
          }
        }
      });
    }

    // Second pass: assign new automated series numbers for unformatted, legacy, duplicate, or forced vendor records
    let vendorChanged = false;
    this.vendors = this.vendors.map((v) => {
      const raw = (v.vendorCode || v.code || '').trim().toUpperCase();
      const isConforming = !forceReassign && raw && seenVendorCodes.has(raw) && (
        raw.startsWith(`${currentYearDigits}-${vendorSeries.prefix}-`) ||
        raw.startsWith(`${vendorSeries.prefix}-`)
      );

      if (isConforming) {
        if (v.vendorCode !== raw || v.code !== raw) {
          vendorChanged = true;
          return { ...v, vendorCode: raw, code: raw };
        }
        return v;
      }

      // Generate next sequential unique series number
      let nextSeq = maxVendorSeq + 1;
      let newCode = formatSeriesNumber(vendorSeries, nextSeq, currentYear);
      while (seenVendorCodes.has(newCode) || this.vendors.some((other) => other.id !== v.id && (other.vendorCode === newCode || other.code === newCode))) {
        nextSeq++;
        newCode = formatSeriesNumber(vendorSeries, nextSeq, currentYear);
      }

      maxVendorSeq = nextSeq;
      seenVendorCodes.add(newCode);

      if (v.vendorCode !== newCode || v.code !== newCode) {
        vendorsMigrated++;
        vendorChanged = true;
        return {
          ...v,
          vendorCode: newCode,
          code: newCode
        };
      }
      return v;
    });

    // Update vendor sequence in system series
    vendorSeries.currentSequence = Math.max(vendorSeries.currentSequence || 1, maxVendorSeq + 1);
    if (vendorChanged) {
      save(STORAGE_KEYS.VENDORS, this.vendors);
    }

    // 2. EMPLOYEE CODES MIGRATION & BACKFILL + REFERENTIAL INTEGRITY
    const seenEmpCodes = new Set<string>();
    let maxEmpSeq = 0;
    const empIdToNewCode = new Map<string, string>();
    const oldCodeToNewCode = new Map<string, string>();

    // First pass: detect existing conforming employee codes if not forcing reassign
    if (!forceReassign) {
      this.employees.forEach((e) => {
        const raw = (e.empCode || '').trim().toUpperCase();
        const isConforming = raw && !seenEmpCodes.has(raw) && (
          raw.startsWith(`${currentYearDigits}-${empSeries.prefix}-`) ||
          raw.startsWith(`${empSeries.prefix}-`)
        );
        if (isConforming) {
          seenEmpCodes.add(raw);
          const seqMatch = raw.match(/\d+$/);
          if (seqMatch) {
            maxEmpSeq = Math.max(maxEmpSeq, parseInt(seqMatch[0], 10));
          }
        }
      });
    }

    // Second pass: assign new automated series codes for missing, legacy (e.g. ALP-001, EMP-001), duplicate, or forced records
    let employeeChanged = false;
    this.employees = this.employees.map((e) => {
      const raw = (e.empCode || '').trim().toUpperCase();
      const isConforming = !forceReassign && raw && seenEmpCodes.has(raw) && (
        raw.startsWith(`${currentYearDigits}-${empSeries.prefix}-`) ||
        raw.startsWith(`${empSeries.prefix}-`)
      );

      if (isConforming) {
        if (e.empCode !== raw) {
          employeeChanged = true;
          return { ...e, empCode: raw };
        }
        return e;
      }

      // Generate next sequential unique series number
      let nextSeq = maxEmpSeq + 1;
      let newCode = formatSeriesNumber(empSeries, nextSeq, currentYear);
      while (seenEmpCodes.has(newCode) || this.employees.some((other) => other.id !== e.id && other.empCode === newCode)) {
        nextSeq++;
        newCode = formatSeriesNumber(empSeries, nextSeq, currentYear);
      }

      maxEmpSeq = nextSeq;
      seenEmpCodes.add(newCode);

      if (e.empCode !== newCode) {
        if (raw) {
          oldCodeToNewCode.set(raw, newCode);
        }
        empIdToNewCode.set(e.id, newCode);
        employeesMigrated++;
        employeeChanged = true;
        return {
          ...e,
          empCode: newCode
        };
      }
      return e;
    });

    // Update employee sequence in system series
    empSeries.currentSequence = Math.max(empSeries.currentSequence || 1, maxEmpSeq + 1);
    if (employeeChanged) {
      save(STORAGE_KEYS.EMPLOYEES, this.employees);
    }

    // 3. REFERENTIAL INTEGRITY CASCADE FOR UPDATED EMPLOYEE CODES
    if (empIdToNewCode.size > 0 || oldCodeToNewCode.size > 0) {
      const getMigratedCode = (empId?: string, oldCode?: string): string | null => {
        if (empId && empIdToNewCode.has(empId)) return empIdToNewCode.get(empId)!;
        if (oldCode && oldCodeToNewCode.has(oldCode.trim().toUpperCase())) return oldCodeToNewCode.get(oldCode.trim().toUpperCase())!;
        return null;
      };

      // Attendance
      let attChanged = false;
      this.attendanceRecords = this.attendanceRecords.map((att) => {
        const newCode = getMigratedCode(att.empId, att.empCode);
        if (newCode && att.empCode !== newCode) {
          attChanged = true;
          relatedRecordsUpdated++;
          return { ...att, empCode: newCode };
        }
        return att;
      });
      if (attChanged) save(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);

      // Leaves
      let leavesChanged = false;
      this.leaveApplications = this.leaveApplications.map((lv) => {
        const newCode = getMigratedCode(lv.empId, lv.empCode);
        if (newCode && lv.empCode !== newCode) {
          leavesChanged = true;
          relatedRecordsUpdated++;
          return { ...lv, empCode: newCode };
        }
        return lv;
      });
      if (leavesChanged) save(STORAGE_KEYS.LEAVES, this.leaveApplications);

      // Resignations
      let resChanged = false;
      this.resignationRecords = this.resignationRecords.map((res) => {
        const newCode = getMigratedCode(res.empId, res.empCode);
        if (newCode && res.empCode !== newCode) {
          resChanged = true;
          relatedRecordsUpdated++;
          return { ...res, empCode: newCode };
        }
        return res;
      });
      if (resChanged) save(STORAGE_KEYS.RESIGNATIONS, this.resignationRecords);

      // Payroll Months & Payslips
      let payrollChanged = false;
      this.payrollMonths = this.payrollMonths.map((pm) => {
        let pmModified = false;
        const updatedSlips = (pm.payslips || []).map((slip) => {
          const newCode = getMigratedCode(slip.empId, slip.empCode);
          if (newCode && slip.empCode !== newCode) {
            pmModified = true;
            relatedRecordsUpdated++;
            return { ...slip, empCode: newCode };
          }
          return slip;
        });
        if (pmModified) {
          payrollChanged = true;
          return { ...pm, payslips: updatedSlips };
        }
        return pm;
      });
      if (payrollChanged) save(STORAGE_KEYS.PAYROLL_MONTHS, this.payrollMonths);

      // Attendance Regularizations
      let regChanged = false;
      this.attendanceRegularizations = this.attendanceRegularizations.map((reg) => {
        const newCode = getMigratedCode(reg.empId, reg.empCode);
        if (newCode && reg.empCode !== newCode) {
          regChanged = true;
          relatedRecordsUpdated++;
          return { ...reg, empCode: newCode };
        }
        return reg;
      });
      if (regChanged) save(STORAGE_KEYS.ATTENDANCE_REGULARIZATIONS, this.attendanceRegularizations);

      // Employee Appraisals
      let appChanged = false;
      this.employeeAppraisals = this.employeeAppraisals.map((app) => {
        const newCode = getMigratedCode(app.empId, app.empCode);
        if (newCode && app.empCode !== newCode) {
          appChanged = true;
          relatedRecordsUpdated++;
          return { ...app, empCode: newCode };
        }
        return app;
      });
      if (appChanged) save(STORAGE_KEYS.EMPLOYEE_APPRAISALS, this.employeeAppraisals);
    }

    // Save updated number series definition list
    this.systemSettings.numberSeries = seriesList;
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);

    const summary = `Number Series Migration Complete: Backfilled ${vendorsMigrated} vendor record(s) and ${employeesMigrated} employee record(s); synchronized ${relatedRecordsUpdated} related HR records.`;

    if (vendorsMigrated > 0 || employeesMigrated > 0 || relatedRecordsUpdated > 0) {
      this.logAudit(
        'UPDATE',
        'SYSTEM',
        'NUMBER_SERIES_MIGRATION',
        summary
      );
      this.notify();
    }

    return {
      vendorsMigrated,
      employeesMigrated,
      relatedRecordsUpdated,
      summary
    };
  }

  // ==========================================
  // REPORT & DOCUMENT TEMPLATE MANAGER REPOSITORY
  // ==========================================
  public getReportTemplates(): Record<ReportType, ReportTemplateConfig> {
    if (!this.systemSettings.reportTemplates || Object.keys(this.systemSettings.reportTemplates).length === 0) {
      this.systemSettings.reportTemplates = JSON.parse(JSON.stringify(DEFAULT_REPORT_TEMPLATES));
      save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);
    }
    return this.systemSettings.reportTemplates as Record<ReportType, ReportTemplateConfig>;
  }

  public getReportTemplate(type: ReportType): ReportTemplateConfig {
    const templates = this.getReportTemplates();
    const tpl = templates[type] || DEFAULT_REPORT_TEMPLATES[type] || DEFAULT_REPORT_TEMPLATES.invoice;
    return getResolvedReportTemplate(tpl, this.systemSettings);
  }

  public updateReportTemplate(type: ReportType, updates: Partial<ReportTemplateConfig>): ReportTemplateConfig {
    const current = this.getReportTemplate(type);
    const updated: ReportTemplateConfig = {
      ...current,
      ...updates,
      header: {
        ...current.header,
        ...(updates.header || {})
      },
      footer: {
        ...current.footer,
        ...(updates.footer || {})
      },
      styling: {
        ...current.styling,
        ...(updates.styling || {})
      },
      lastUpdated: new Date().toISOString(),
      updatedBy: this.user.name
    };

    const templates = this.getReportTemplates();
    templates[type] = updated;
    this.systemSettings.reportTemplates = templates;
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);

    this.logAudit(
      'UPDATE',
      'USER',
      this.user.id,
      `Super Admin updated custom header/footer layout for Report Template: ${updated.name}`
    );
    this.addNotification(
      'Report Template Saved',
      `Custom header and footer settings saved for ${updated.name}.`,
      'success',
      'system_settings'
    );
    this.notify();
    return updated;
  }

  public resetReportTemplate(type: ReportType): ReportTemplateConfig {
    const defaultTpl = JSON.parse(JSON.stringify(DEFAULT_REPORT_TEMPLATES[type] || DEFAULT_REPORT_TEMPLATES.invoice));
    const templates = this.getReportTemplates();
    templates[type] = defaultTpl;
    this.systemSettings.reportTemplates = templates;
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);

    this.logAudit(
      'UPDATE',
      'USER',
      this.user.id,
      `Super Admin reset Report Template ${type.toUpperCase()} to factory defaults`
    );
    this.addNotification(
      'Template Reset',
      `Report Template for ${type.toUpperCase()} restored to factory defaults.`,
      'warning',
      'system_settings'
    );
    this.notify();
    return defaultTpl;
  }

  public resetAllReportTemplates(): Record<ReportType, ReportTemplateConfig> {
    const defaults = JSON.parse(JSON.stringify(DEFAULT_REPORT_TEMPLATES));
    this.systemSettings.reportTemplates = defaults;
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);

    this.logAudit(
      'UPDATE',
      'USER',
      this.user.id,
      'Super Admin reset all system Report & Document Templates to factory defaults'
    );
    this.addNotification(
      'All Templates Reset',
      'All document headers, footers and branding layouts restored to factory defaults.',
      'warning',
      'system_settings'
    );
    this.notify();
    return defaults;
  }

  public copyBrandingToAllTemplates(sourceType: ReportType): void {
    const source = this.getReportTemplate(sourceType);
    const templates = this.getReportTemplates();

    const types: ReportType[] = ['invoice', 'po', 'pr', 'quotation', 'workorder'];
    types.forEach((t) => {
      if (t !== sourceType && templates[t]) {
        templates[t] = {
          ...templates[t],
          header: {
            ...templates[t].header,
            companyName: source.header.companyName,
            tagline: source.header.tagline,
            logoStyle: source.header.logoStyle,
            showGstin: source.header.showGstin,
            showPan: source.header.showPan,
            showCin: source.header.showCin,
            showIsoCert: source.header.showIsoCert,
            isoCertText: source.header.isoCertText,
            showAddress: source.header.showAddress,
            customAddress: source.header.customAddress,
            showContactInfo: source.header.showContactInfo,
            customContactPhone: source.header.customContactPhone,
            customContactEmail: source.header.customContactEmail,
            customWebsite: source.header.customWebsite,
            metaBoxStyle: source.header.metaBoxStyle
          },
          styling: {
            ...templates[t].styling,
            fontArchetype: source.styling.fontArchetype,
            layoutDensity: source.styling.layoutDensity
          },
          lastUpdated: new Date().toISOString(),
          updatedBy: this.user.name
        };
      }
    });

    this.systemSettings.reportTemplates = templates;
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);

    this.logAudit(
      'UPDATE',
      'USER',
      this.user.id,
      `Super Admin synchronized branding from ${source.name} across all report templates`
    );
    this.addNotification(
      'Branding Synchronized',
      `Corporate branding applied to all PDF & print document templates.`,
      'success',
      'system_settings'
    );
    this.notify();
  }

  // ==========================================
  // GOODS RECEIPT NOTES (GRN) REPOSITORY
  // ==========================================
  public getGRNs(): GoodsReceiptNote[] {
    return this.grns;
  }

  public getGRNById(id: string): GoodsReceiptNote | undefined {
    return this.grns.find((g) => g.id === id || g.grnNumber === id);
  }

  public addGRN(data: Omit<GoodsReceiptNote, 'id' | 'grnNumber' | 'createdAt'>): GoodsReceiptNote {
    const grnNumber = this.generateSeriesNumber('grn');
    const newGRN: GoodsReceiptNote = {
      ...data,
      id: `grn-${Date.now()}`,
      grnNumber,
      createdAt: new Date().toISOString()
    };
    this.grns = [newGRN, ...this.grns];
    save(STORAGE_KEYS.GRNS, this.grns);
    this.logAudit('CREATE', 'INVENTORY', newGRN.grnNumber, `Generated Goods Receipt Note (GRN) ${newGRN.grnNumber} for PO ${newGRN.poNumber}`);
    this.notify();
    return newGRN;
  }

  public resetToFactoryDefaults(): void {
    this.user = INITIAL_CURRENT_USER;
    this.users = INITIAL_USERS;
    this.leads = INITIAL_LEADS;
    this.quotes = INITIAL_QUOTES;
    this.workOrders = INITIAL_WORK_ORDERS;
    this.projects = INITIAL_PROJECTS;
    this.inventory = INITIAL_INVENTORY;
    this.prs = INITIAL_PURCHASE_REQUISITIONS;
    this.pos = INITIAL_PURCHASE_ORDERS;
    this.vendors = INITIAL_VENDORS;
    this.payments = INITIAL_PAYMENTS;
    this.salesReps = INITIAL_SALES_REPS;
    this.auditLogs = INITIAL_AUDIT_LOGS;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.sheetsConfig = INITIAL_GOOGLE_SHEETS_CONFIG;
    this.systemSettings = INITIAL_SYSTEM_SETTINGS;
    this.isAuthenticated = true;

    save(STORAGE_KEYS.USER, this.user);
    save(STORAGE_KEYS.USERS, this.users);
    save(STORAGE_KEYS.LEADS, this.leads);
    save(STORAGE_KEYS.QUOTES, this.quotes);
    save(STORAGE_KEYS.WORK_ORDERS, this.workOrders);
    save(STORAGE_KEYS.PROJECTS, this.projects);
    save(STORAGE_KEYS.INVENTORY, this.inventory);
    save(STORAGE_KEYS.PRS, this.prs);
    save(STORAGE_KEYS.POS, this.pos);
    save(STORAGE_KEYS.VENDORS, this.vendors);
    save(STORAGE_KEYS.PAYMENTS, this.payments);
    save(STORAGE_KEYS.SALES_REPS, this.salesReps);
    save(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    save(STORAGE_KEYS.SHEETS_CONFIG, this.sheetsConfig);
    save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);
    save(STORAGE_KEYS.AUTH_SESSION, true);

    // Master Data
    this.clients = INITIAL_CLIENTS;
    this.costCenters = INITIAL_COST_CENTERS;
    this.taxSlabs = INITIAL_TAX_SLABS;
    this.paymentTerms = INITIAL_PAYMENT_TERMS;
    save(STORAGE_KEYS.CLIENTS, this.clients);
    save(STORAGE_KEYS.COST_CENTERS, this.costCenters);
    save(STORAGE_KEYS.TAX_SLABS, this.taxSlabs);
    save(STORAGE_KEYS.PAYMENT_TERMS, this.paymentTerms);

    // Finance
    this.chartOfAccounts = INITIAL_CHART_OF_ACCOUNTS;
    this.journalVouchers = INITIAL_JOURNAL_VOUCHERS;
    this.tdsRecords = INITIAL_TDS_RECORDS;
    save(STORAGE_KEYS.CHART_OF_ACCOUNTS, this.chartOfAccounts);
    save(STORAGE_KEYS.JOURNAL_VOUCHERS, this.journalVouchers);
    save(STORAGE_KEYS.TDS_RECORDS, this.tdsRecords);

    // HR
    this.jobRequisitions = INITIAL_JOB_REQUISITIONS;
    this.jobCandidates = INITIAL_CANDIDATES;
    this.employees = INITIAL_EMPLOYEES;
    this.attendanceRecords = INITIAL_ATTENDANCE;
    this.timesheetEntries = INITIAL_TIMESHEETS;
    this.leaveApplications = INITIAL_LEAVES;
    this.companyHolidays = INITIAL_HOLIDAYS;
    this.payrollMonths = INITIAL_PAYROLL_MONTHS;
    this.resignationRecords = INITIAL_RESIGNATIONS;
    save(STORAGE_KEYS.JOB_REQUISITIONS, this.jobRequisitions);
    save(STORAGE_KEYS.JOB_CANDIDATES, this.jobCandidates);
    save(STORAGE_KEYS.EMPLOYEES, this.employees);
    save(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
    save(STORAGE_KEYS.TIMESHEETS, this.timesheetEntries);
    save(STORAGE_KEYS.LEAVES, this.leaveApplications);
    save(STORAGE_KEYS.HOLIDAYS, this.companyHolidays);
    save(STORAGE_KEYS.PAYROLL_MONTHS, this.payrollMonths);
    save(STORAGE_KEYS.RESIGNATIONS, this.resignationRecords);

    this.notify();
  }

  // ==========================================
  // MASTER DATA: CLIENTS, COST CENTERS, TAX SLABS, PAYMENT TERMS, VENDORS, ITEMS
  // ==========================================
  public getClients(): ClientMaster[] {
    return this.clients;
  }

  public addClient(clientData: Omit<ClientMaster, 'id' | 'createdAt'>): ClientMaster {
    const newClient: ClientMaster = {
      ...clientData,
      id: `cli-${Date.now()}`,
      clientCode: clientData.clientCode || this.generateSeriesNumber('client'),
      createdAt: new Date().toISOString()
    };
    this.clients = [newClient, ...this.clients];
    save(STORAGE_KEYS.CLIENTS, this.clients);
    this.logAudit('CREATE', 'USER', newClient.id, `Created Client Master record: ${newClient.companyName} (${newClient.clientCode})`);
    this.notify();
    return newClient;
  }

  public updateClient(id: string, updates: Partial<ClientMaster>): ClientMaster {
    this.clients = this.clients.map((c) => (c.id === id ? { ...c, ...updates } : c));
    save(STORAGE_KEYS.CLIENTS, this.clients);
    const updated = this.clients.find((c) => c.id === id);
    if (updated) {
      this.logAudit('UPDATE', 'USER', updated.id, `Updated Client Master record: ${updated.companyName}`);
    }
    this.notify();
    return updated!;
  }

  public deleteClient(id: string): void {
    const toDelete = this.clients.find((c) => c.id === id);
    if (toDelete) {
      this.clients = this.clients.filter((c) => c.id !== id);
      save(STORAGE_KEYS.CLIENTS, this.clients);
      this.logAudit('DELETE', 'USER', id, `Deleted Client Master record: ${toDelete.companyName}`);
      this.notify();
    }
  }

  public getCostCenters(): CostCenterMaster[] {
    return this.costCenters;
  }

  public addCostCenter(data: Omit<CostCenterMaster, 'id'>): CostCenterMaster {
    const newCC: CostCenterMaster = {
      ...data,
      code: data.code || this.generateSeriesNumber('cost_center'),
      id: `cc-${Date.now()}`
    };
    this.costCenters = [newCC, ...this.costCenters];
    save(STORAGE_KEYS.COST_CENTERS, this.costCenters);
    this.logAudit('CREATE', 'USER', newCC.id, `Added Cost Center: ${newCC.name} (${newCC.code})`);
    this.notify();
    return newCC;
  }

  public updateCostCenter(id: string, updates: Partial<CostCenterMaster>): CostCenterMaster {
    this.costCenters = this.costCenters.map((cc) => (cc.id === id ? { ...cc, ...updates } : cc));
    save(STORAGE_KEYS.COST_CENTERS, this.costCenters);
    const updated = this.costCenters.find((cc) => cc.id === id);
    if (updated) {
      this.logAudit('UPDATE', 'USER', id, `Updated Cost Center: ${updated.name}`);
    }
    this.notify();
    return updated!;
  }

  public deleteCostCenter(id: string): void {
    this.costCenters = this.costCenters.filter((cc) => cc.id !== id);
    save(STORAGE_KEYS.COST_CENTERS, this.costCenters);
    this.logAudit('DELETE', 'USER', id, `Deleted Cost Center ${id}`);
    this.notify();
  }

  public getTaxSlabs(): TaxSlabMaster[] {
    return this.taxSlabs;
  }

  public addTaxSlab(data: Omit<TaxSlabMaster, 'id'>): TaxSlabMaster {
    const newTax: TaxSlabMaster = {
      ...data,
      id: `tax-${Date.now()}`
    };
    this.taxSlabs = [newTax, ...this.taxSlabs];
    save(STORAGE_KEYS.TAX_SLABS, this.taxSlabs);
    this.logAudit('CREATE', 'USER', newTax.id, `Added Tax Slab: ${newTax.name} (${newTax.totalGstRate}%)`);
    this.notify();
    return newTax;
  }

  public updateTaxSlab(id: string, updates: Partial<TaxSlabMaster>): TaxSlabMaster {
    this.taxSlabs = this.taxSlabs.map((t) => (t.id === id ? { ...t, ...updates } : t));
    save(STORAGE_KEYS.TAX_SLABS, this.taxSlabs);
    const updated = this.taxSlabs.find((t) => t.id === id);
    this.notify();
    return updated!;
  }

  public deleteTaxSlab(id: string): void {
    this.taxSlabs = this.taxSlabs.filter((t) => t.id !== id);
    save(STORAGE_KEYS.TAX_SLABS, this.taxSlabs);
    this.notify();
  }

  public getPaymentTerms(): PaymentTermMaster[] {
    return this.paymentTerms;
  }

  public addPaymentTerm(data: Omit<PaymentTermMaster, 'id'>): PaymentTermMaster {
    const newPT: PaymentTermMaster = {
      ...data,
      id: `pt-${Date.now()}`
    };
    this.paymentTerms = [newPT, ...this.paymentTerms];
    save(STORAGE_KEYS.PAYMENT_TERMS, this.paymentTerms);
    this.notify();
    return newPT;
  }

  public updatePaymentTerm(id: string, updates: Partial<PaymentTermMaster>): PaymentTermMaster {
    this.paymentTerms = this.paymentTerms.map((p) => (p.id === id ? { ...p, ...updates } : p));
    save(STORAGE_KEYS.PAYMENT_TERMS, this.paymentTerms);
    const updated = this.paymentTerms.find((p) => p.id === id);
    this.notify();
    return updated!;
  }

  public deletePaymentTerm(id: string): void {
    this.paymentTerms = this.paymentTerms.filter((p) => p.id !== id);
    save(STORAGE_KEYS.PAYMENT_TERMS, this.paymentTerms);
    this.notify();
  }

  // Master Data: Vendor Add/Edit/Delete
  public addVendorMaster(vendorData: Omit<Vendor, 'id'> & { vendorCode?: string }): Vendor {
    let candidateCode = (vendorData.vendorCode || '').trim().toUpperCase();
    if (!candidateCode) {
      try {
        candidateCode = this.generateSeriesNumber('vendor');
      } catch {
        candidateCode = `VND-${String(this.vendors.length + 1).padStart(3, '0')}`;
      }
    }

    // Ensure uniqueness
    let finalCode = candidateCode;
    let suffix = 1;
    while (this.vendors.some((v) => (v.vendorCode || v.code || '').toUpperCase() === finalCode.toUpperCase())) {
      finalCode = `${candidateCode}-${suffix}`;
      suffix++;
    }

    const newVendor: Vendor = {
      ...vendorData,
      id: `ven-${Date.now()}`,
      vendorCode: finalCode,
      code: finalCode,
      createdAt: new Date().toISOString()
    };
    this.vendors = [newVendor, ...this.vendors];
    save(STORAGE_KEYS.VENDORS, this.vendors);
    this.logAudit('CREATE', 'USER', newVendor.id, `Created Vendor Master: ${newVendor.name} (${newVendor.vendorCode})`);
    this.notify();
    return newVendor;
  }

  public updateVendorMaster(id: string, updates: Partial<Vendor>): Vendor {
    const existing = this.vendors.find((v) => v.id === id);
    const updatedCode = updates.vendorCode ? updates.vendorCode.trim().toUpperCase() : (existing?.vendorCode || existing?.code);

    if (updates.vendorCode && existing && updates.vendorCode.trim().toUpperCase() !== (existing.vendorCode || existing.code)?.toUpperCase()) {
      const codeConflict = this.vendors.some(
        (v) => v.id !== id && (v.vendorCode || v.code || '').toUpperCase() === updates.vendorCode?.trim().toUpperCase()
      );
      if (codeConflict) {
        throw new Error(`Vendor Code "${updates.vendorCode}" is already in use by another vendor.`);
      }
    }

    this.vendors = this.vendors.map((v) =>
      v.id === id
        ? {
            ...v,
            ...updates,
            vendorCode: updatedCode,
            code: updatedCode
          }
        : v
    );
    save(STORAGE_KEYS.VENDORS, this.vendors);
    const updated = this.vendors.find((v) => v.id === id);
    if (updated) {
      this.logAudit('UPDATE', 'USER', updated.id, `Updated Vendor Master: ${updated.name} (${updated.vendorCode || updated.code})`);
    }
    this.notify();
    return updated!;
  }

  public deleteVendorMaster(id: string): void {
    const toDelete = this.vendors.find((v) => v.id === id);
    if (toDelete) {
      this.vendors = this.vendors.filter((v) => v.id !== id);
      save(STORAGE_KEYS.VENDORS, this.vendors);
      this.logAudit('DELETE', 'USER', id, `Deleted Vendor Master: ${toDelete.name}`);
      this.notify();
    }
  }

  public deleteInventoryItem(idOrSku: string): void {
    const toDelete = this.inventory.find((i) => i.id === idOrSku || i.sku === idOrSku);
    if (toDelete) {
      this.inventory = this.inventory.filter((i) => i.id !== idOrSku && i.sku !== idOrSku);
      save(STORAGE_KEYS.INVENTORY, this.inventory);
      this.logAudit('DELETE', 'USER', toDelete.sku, `Deleted Item Master SKU ${toDelete.sku}`);
      this.notify();
    }
  }

  // ==========================================
  // FINANCE & ACCOUNTING: CHART OF ACCOUNTS, JOURNAL VOUCHERS, TDS REGISTER
  // ==========================================
  public getChartOfAccounts(): ChartOfAccount[] {
    return this.chartOfAccounts;
  }

  public addAccount(accountData: Omit<ChartOfAccount, 'id'>): ChartOfAccount {
    const newAcc: ChartOfAccount = {
      ...accountData,
      id: `coa-${Date.now()}`
    };
    this.chartOfAccounts = [newAcc, ...this.chartOfAccounts];
    save(STORAGE_KEYS.CHART_OF_ACCOUNTS, this.chartOfAccounts);
    this.logAudit('CREATE', 'USER', newAcc.id, `Created Ledger Account: ${newAcc.accountName} (${newAcc.accountCode})`);
    this.notify();
    return newAcc;
  }

  public addChartOfAccount(accountData: Omit<ChartOfAccount, 'id'>): ChartOfAccount {
    return this.addAccount(accountData);
  }

  public updateAccount(id: string, updates: Partial<ChartOfAccount>): ChartOfAccount {
    this.chartOfAccounts = this.chartOfAccounts.map((a) => (a.id === id ? { ...a, ...updates } : a));
    save(STORAGE_KEYS.CHART_OF_ACCOUNTS, this.chartOfAccounts);
    const updated = this.chartOfAccounts.find((a) => a.id === id);
    if (updated) {
      this.logAudit('UPDATE', 'USER', id, `Updated Ledger Account: ${updated.accountName}`);
    }
    this.notify();
    return updated!;
  }

  public updateChartOfAccount(id: string, updates: Partial<ChartOfAccount>): ChartOfAccount {
    return this.updateAccount(id, updates);
  }

  public deleteAccount(id: string): void {
    const toDelete = this.chartOfAccounts.find((a) => a.id === id);
    if (toDelete && !toDelete.isSystemAccount) {
      this.chartOfAccounts = this.chartOfAccounts.filter((a) => a.id !== id);
      save(STORAGE_KEYS.CHART_OF_ACCOUNTS, this.chartOfAccounts);
      this.logAudit('DELETE', 'USER', id, `Deleted Ledger Account: ${toDelete.accountName}`);
      this.notify();
    }
  }

  public getJournalVouchers(): JournalVoucher[] {
    return this.journalVouchers;
  }

  public addJournalVoucher(voucherData: Omit<JournalVoucher, 'id' | 'voucherNumber' | 'createdAt'> & { voucherNumber?: string }): JournalVoucher {
    const voucherNumber = voucherData.voucherNumber || this.generateSeriesNumber('voucher');
    const newVoucher: JournalVoucher = {
      ...voucherData,
      id: `jv-${Date.now()}`,
      voucherNumber,
      createdAt: new Date().toISOString()
    };

    // If posted, update ledger account balances
    if (newVoucher.status === 'Posted') {
      newVoucher.entries.forEach((entry) => {
        const acc = this.chartOfAccounts.find((a) => a.id === entry.accountId || a.accountCode === entry.accountCode);
        if (acc) {
          if (['Bank & Cash', 'Accounts Receivable', 'Inventory Asset', 'Current Asset', 'Fixed Asset', 'Direct Cost (COGS)', 'Indirect Expense'].includes(acc.type)) {
            acc.balance += (entry.debit - entry.credit);
          } else {
            acc.balance += (entry.credit - entry.debit);
          }
        }
      });
      save(STORAGE_KEYS.CHART_OF_ACCOUNTS, this.chartOfAccounts);
    }

    this.journalVouchers = [newVoucher, ...this.journalVouchers];
    save(STORAGE_KEYS.JOURNAL_VOUCHERS, this.journalVouchers);
    this.logAudit('CREATE', 'USER', newVoucher.voucherNumber, `Recorded Journal Voucher ${newVoucher.voucherNumber} (Amount: ₹${newVoucher.totalAmount.toLocaleString()})`);
    this.notify();
    return newVoucher;
  }

  public updateVoucherStatus(id: string, status: JournalVoucher['status']): void {
    this.journalVouchers = this.journalVouchers.map((jv) => (jv.id === id ? { ...jv, status } : jv));
    save(STORAGE_KEYS.JOURNAL_VOUCHERS, this.journalVouchers);
    this.notify();
  }

  public getTDSRecords(): TDSRecord[] {
    return this.tdsRecords;
  }

  public addTDSRecord(data: Omit<TDSRecord, 'id'>): TDSRecord {
    const newTDS: TDSRecord = {
      ...data,
      id: `tds-${Date.now()}`
    };
    this.tdsRecords = [newTDS, ...this.tdsRecords];
    save(STORAGE_KEYS.TDS_RECORDS, this.tdsRecords);
    this.logAudit('CREATE', 'USER', newTDS.id, `Logged TDS deduction under Sec ${newTDS.section} for ${newTDS.deducteeName} (₹${newTDS.tdsDeducted.toLocaleString()})`);
    this.notify();
    return newTDS;
  }

  public depositTDSRecord(id: string, challanNumber: string, bsrCode: string, depositDate: string): void {
    this.tdsRecords = this.tdsRecords.map((t) =>
      t.id === id ? { ...t, status: 'Deposited', challanNumber, bsrCode, depositDate } : t
    );
    save(STORAGE_KEYS.TDS_RECORDS, this.tdsRecords);
    this.notify();
  }

  public depositTDS(id: string, challanNumber: string, bsrCode: string, depositDate: string): void {
    this.depositTDSRecord(id, challanNumber, bsrCode, depositDate);
  }

  // ==========================================
  // HR & PAYROLL: REQUISITIONS, EMPLOYEES, ATTENDANCE, TIMESHEETS, LEAVES, HOLIDAYS, PAYROLL, RESIGNATION
  // ==========================================
  public getJobRequisitions(): JobRequisition[] {
    return this.jobRequisitions;
  }

  public addJobRequisition(data: Omit<JobRequisition, 'id' | 'reqNumber' | 'createdAt'> & { reqNumber?: string }): JobRequisition {
    const reqNumber = data.reqNumber || this.generateSeriesNumber('job_req');
    const newReq: JobRequisition = {
      ...data,
      id: `req-${Date.now()}`,
      reqNumber,
      createdAt: new Date().toISOString()
    };
    this.jobRequisitions = [newReq, ...this.jobRequisitions];
    save(STORAGE_KEYS.JOB_REQUISITIONS, this.jobRequisitions);
    this.logAudit('CREATE', 'USER', newReq.reqNumber, `Created KRA-based Job Requisition: ${newReq.jobTitle} (${newReq.department})`);
    this.notify();
    return newReq;
  }

  public updateJobRequisition(id: string, updates: Partial<JobRequisition>): JobRequisition {
    this.jobRequisitions = this.jobRequisitions.map((r) => (r.id === id ? { ...r, ...updates } : r));
    save(STORAGE_KEYS.JOB_REQUISITIONS, this.jobRequisitions);
    const updated = this.jobRequisitions.find((r) => r.id === id);
    if (updated) {
      this.logAudit('UPDATE', 'USER', updated.reqNumber, `Updated Job Requisition: ${updated.jobTitle}`);
    }
    this.notify();
    return updated!;
  }

  public getJobCandidates(): JobCandidate[] {
    return this.jobCandidates;
  }

  public addJobCandidate(data: Omit<JobCandidate, 'id' | 'appliedDate'>): JobCandidate {
    const newCand: JobCandidate = {
      ...data,
      id: `cand-${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0]
    };
    this.jobCandidates = [newCand, ...this.jobCandidates];
    save(STORAGE_KEYS.JOB_CANDIDATES, this.jobCandidates);
    this.notify();
    return newCand;
  }

  public addCandidate(data: Omit<JobCandidate, 'id' | 'appliedDate'>): JobCandidate {
    return this.addJobCandidate(data);
  }

  public updateCandidateStage(id: string, stage: JobCandidate['stage'], notes?: string): void {
    this.jobCandidates = this.jobCandidates.map((c) =>
      c.id === id ? { ...c, stage, interviewNotes: notes || c.interviewNotes } : c
    );
    save(STORAGE_KEYS.JOB_CANDIDATES, this.jobCandidates);
    this.notify();
  }

  public getEmployees(): Employee[] {
    return this.employees;
  }

  public addEmployee(data: Omit<Employee, 'id' | 'empCode'> & { empCode?: string }): Employee {
    const empCode = data.empCode || this.generateSeriesNumber('employee');
    const newEmp: Employee = {
      ...data,
      id: `emp-${Date.now()}`,
      empCode
    };
    this.employees = [newEmp, ...this.employees];
    save(STORAGE_KEYS.EMPLOYEES, this.employees);
    this.logAudit('CREATE', 'USER', newEmp.empCode, `Onboarded new Employee: ${newEmp.name} [${newEmp.designation}]`);
    this.notify();
    return newEmp;
  }

  public updateEmployee(id: string, updates: Partial<Employee>): Employee {
    this.employees = this.employees.map((e) => (e.id === id ? { ...e, ...updates } : e));
    save(STORAGE_KEYS.EMPLOYEES, this.employees);
    const updated = this.employees.find((e) => e.id === id);
    if (updated) {
      this.logAudit('UPDATE', 'USER', updated.empCode, `Updated Employee profile: ${updated.name || updated.fullName}`);
    }
    this.notify();
    return updated!;
  }

  public updateEmployeeAvatar(empId: string, avatarUrl: string): Employee {
    const emp = this.employees.find((e) => e.id === empId);
    if (!emp) throw new Error(`Employee with ID ${empId} not found`);
    const updated = this.updateEmployee(empId, { avatar: avatarUrl });
    this.addNotification(
      'Profile Picture Updated',
      `Latest profile picture for ${emp.fullName || emp.name || 'Employee'} (${emp.empCode}) has been updated.`,
      'success',
      'hr'
    );
    return updated;
  }

  public getAttendanceRecords(): AttendanceRecord[] {
    return this.attendanceRecords;
  }

  public logAttendance(record: Omit<AttendanceRecord, 'id'>): AttendanceRecord {
    const newAtt: AttendanceRecord = {
      ...record,
      id: `att-${Date.now()}`
    };
    this.attendanceRecords = [newAtt, ...this.attendanceRecords];
    save(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
    this.notify();
    return newAtt;
  }

  public bulkMarkAttendance(records: Array<Omit<AttendanceRecord, 'id'>>): void {
    const newItems: AttendanceRecord[] = records.map((r, i) => ({
      ...r,
      id: `att-${Date.now()}-${i}`
    }));
    this.attendanceRecords = [...newItems, ...this.attendanceRecords];
    save(STORAGE_KEYS.ATTENDANCE, this.attendanceRecords);
    this.notify();
  }

  // BIOMETRIC ATTENDANCE DEVICE MANAGEMENT & PUNCH SYNCHRONIZATION
  public getBiometricDevices(): BiometricDevice[] {
    return this.biometricDevices;
  }

  public getBiometricDeviceById(id: string): BiometricDevice | undefined {
    return this.biometricDevices.find((d) => d.id === id);
  }

  public addBiometricDevice(data: Omit<BiometricDevice, 'id' | 'lastSyncTime' | 'totalPunchesLogged' | 'status'>): BiometricDevice {
    const newDev: BiometricDevice = {
      ...data,
      id: `bio-${Date.now()}`,
      lastSyncTime: 'Never synced',
      totalPunchesLogged: 0,
      status: 'Online'
    };
    this.biometricDevices = [newDev, ...this.biometricDevices];
    save(STORAGE_KEYS.BIOMETRIC_DEVICES, this.biometricDevices);
    this.logAudit('CREATE', 'USER', newDev.id, `Configured Biometric Attendance Device: ${newDev.name} (${newDev.ipAddress}:${newDev.port})`);
    this.addNotification('Biometric Device Added', `${newDev.name} configured successfully on ${newDev.ipAddress}:${newDev.port}`, 'success', 'hr');
    this.notify();
    return newDev;
  }

  public updateBiometricDevice(id: string, updates: Partial<BiometricDevice>): BiometricDevice {
    this.biometricDevices = this.biometricDevices.map((d) => (d.id === id ? { ...d, ...updates } : d));
    save(STORAGE_KEYS.BIOMETRIC_DEVICES, this.biometricDevices);
    const updated = this.biometricDevices.find((d) => d.id === id)!;
    this.logAudit('UPDATE', 'USER', id, `Updated Biometric Device Configuration: ${updated.name}`);
    this.notify();
    return updated;
  }

  public deleteBiometricDevice(id: string): void {
    const dev = this.biometricDevices.find((d) => d.id === id);
    this.biometricDevices = this.biometricDevices.filter((d) => d.id !== id);
    save(STORAGE_KEYS.BIOMETRIC_DEVICES, this.biometricDevices);
    if (dev) {
      this.logAudit('DELETE', 'USER', id, `Removed Biometric Attendance Device: ${dev.name}`);
      this.addNotification('Biometric Device Removed', `Terminal ${dev.name} was removed from the system.`, 'info', 'hr');
    }
    this.notify();
  }

  public getAttendancePunchLogs(empId?: string, date?: string): AttendancePunchLog[] {
    let logs = [...this.biometricPunchLogs];
    if (empId) {
      logs = logs.filter((l) => l.empId === empId || l.empCode === empId);
    }
    if (date) {
      logs = logs.filter((l) => l.date === date || l.timestamp?.startsWith(date));
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public logAttendancePunch(data: Omit<AttendancePunchLog, 'id' | 'timestamp'>): AttendancePunchLog {
    const now = new Date();
    const newPunch: AttendancePunchLog = {
      ...data,
      id: `punch-${Date.now()}`,
      timestamp: now.toISOString()
    };
    this.biometricPunchLogs = [newPunch, ...this.biometricPunchLogs];
    save(STORAGE_KEYS.BIOMETRIC_PUNCH_LOGS, this.biometricPunchLogs);

    if (data.deviceId) {
      this.biometricDevices = this.biometricDevices.map((d) =>
        d.id === data.deviceId
          ? {
              ...d,
              totalPunchesLogged: (d.totalPunchesLogged || 0) + 1,
              lastSyncTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }
          : d
      );
      save(STORAGE_KEYS.BIOMETRIC_DEVICES, this.biometricDevices);
    }

    this.notify();
    return newPunch;
  }

  public syncBiometricDevicePunches(deviceId?: string): { syncedCount: number; message: string; timestamp: string } {
    const targetDevices = deviceId ? this.biometricDevices.filter((d) => d.id === deviceId) : this.biometricDevices;
    const nowStr = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let totalNewPunches = 0;
    targetDevices.forEach((dev) => {
      const simulatedPunches = Math.floor(Math.random() * 4) + 2;
      totalNewPunches += simulatedPunches;
      dev.lastSyncTime = nowStr;
      dev.totalPunchesLogged = (dev.totalPunchesLogged || 0) + simulatedPunches;
      dev.status = 'Online';
    });

    save(STORAGE_KEYS.BIOMETRIC_DEVICES, this.biometricDevices);
    this.logAudit('UPDATE', 'SYSTEM', deviceId || 'ALL_DEVICES', `Synced ${totalNewPunches} biometric attendance punches across ${targetDevices.length} terminals`);
    this.addNotification('Biometric Sync Complete', `Ingested ${totalNewPunches} punches from ${targetDevices.length} attendance terminals.`, 'success', 'hr');
    this.notify();

    return {
      syncedCount: totalNewPunches,
      message: `Successfully synchronized ${totalNewPunches} attendance punch logs.`,
      timestamp: nowStr
    };
  }

  public getTimesheetEntries(): TimesheetEntry[] {
    return this.timesheetEntries;
  }

  public addTimesheetEntry(data: Omit<TimesheetEntry, 'id'>): TimesheetEntry {
    const newTS: TimesheetEntry = {
      ...data,
      id: `ts-${Date.now()}`
    };
    this.timesheetEntries = [newTS, ...this.timesheetEntries];
    save(STORAGE_KEYS.TIMESHEETS, this.timesheetEntries);
    this.notify();
    return newTS;
  }

  public updateTimesheetStatus(id: string, status: TimesheetEntry['status'], approver: string): void {
    this.timesheetEntries = this.timesheetEntries.map((ts) =>
      ts.id === id ? { ...ts, status, approvedBy: approver } : ts
    );
    save(STORAGE_KEYS.TIMESHEETS, this.timesheetEntries);
    this.notify();
  }

  public approveTimesheet(id: string, approver: string = 'Management'): void {
    this.updateTimesheetStatus(id, 'Approved', approver);
  }

  public rejectTimesheet(id: string, approver: string = 'Management'): void {
    this.updateTimesheetStatus(id, 'Rejected', approver);
  }

  public getLeaveApplications(): LeaveApplication[] {
    return this.leaveApplications;
  }

  public applyLeave(data: Omit<LeaveApplication, 'id' | 'appliedAt' | 'status'>): LeaveApplication {
    const newLeave: LeaveApplication = {
      ...data,
      id: `lv-${Date.now()}`,
      status: 'Pending',
      appliedAt: new Date().toISOString()
    };
    this.leaveApplications = [newLeave, ...this.leaveApplications];
    save(STORAGE_KEYS.LEAVES, this.leaveApplications);
    this.addNotification('Leave Request Submitted', `${newLeave.empName} requested ${newLeave.totalDays} day(s) ${newLeave.leaveType}`, 'info');
    this.notify();
    return newLeave;
  }

  public updateLeaveStatus(id: string, status: LeaveApplication['status'], actionRemarks?: string, actionBy?: string): void {
    this.leaveApplications = this.leaveApplications.map((lv) => {
      if (lv.id === id) {
        return {
          ...lv,
          status,
          actionRemarks: actionRemarks || lv.actionRemarks,
          actionBy: actionBy || this.user.name
        };
      }
      return lv;
    });
    save(STORAGE_KEYS.LEAVES, this.leaveApplications);
    this.notify();
  }

  public approveLeave(id: string, actionBy: string = 'Management', actionRemarks?: string): void {
    this.updateLeaveStatus(id, 'Approved', actionRemarks, actionBy);
  }

  public rejectLeave(id: string, actionBy: string = 'Management', actionRemarks?: string): void {
    this.updateLeaveStatus(id, 'Rejected', actionRemarks, actionBy);
  }

  public getCompanyHolidays(): CompanyHoliday[] {
    return this.companyHolidays;
  }

  public addCompanyHoliday(data: Omit<CompanyHoliday, 'id'>): CompanyHoliday {
    const newHol: CompanyHoliday = {
      ...data,
      id: `hol-${Date.now()}`
    };
    this.companyHolidays = [...this.companyHolidays, newHol].sort((a, b) => a.date.localeCompare(b.date));
    save(STORAGE_KEYS.HOLIDAYS, this.companyHolidays);
    this.notify();
    return newHol;
  }

  public deleteCompanyHoliday(id: string): void {
    this.companyHolidays = this.companyHolidays.filter((h) => h.id !== id);
    save(STORAGE_KEYS.HOLIDAYS, this.companyHolidays);
    this.notify();
  }

  public getPayrollMonths(): PayrollMonth[] {
    return this.payrollMonths;
  }

  public runMonthlyPayroll(monthYear: string, runDate: string = new Date().toISOString().split('T')[0]): PayrollMonth {
    const activeEmployees = this.employees.filter((e) => e.employmentStatus === 'Active');
    let totalGross = 0;
    let totalNet = 0;
    let totalPfEe = 0;
    let totalPfEr = 0;
    let totalEsic = 0;
    let totalTds = 0;
    let totalPt = 0;

    const payslips = activeEmployees.map((emp, idx) => {
      const basic = Math.round(emp.grossMonthlySalary * 0.5);
      const hra = Math.round(emp.grossMonthlySalary * 0.2);
      const special = Math.round(emp.grossMonthlySalary * 0.2);
      const site = Math.round(emp.grossMonthlySalary * 0.06);
      const conveyance = Math.round(emp.grossMonthlySalary * 0.04);
      const gross = basic + hra + special + site + conveyance;

      // Statutory calculations
      const pfEe = Math.round(basic * 0.12);
      const pfEr = pfEe;
      const esic = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
      const pt = 200; // Maharashtra PT standard

      // Estimated Monthly TDS based on CTC bracket
      let monthlyTds = 0;
      if (emp.ctcAnnual > 1500000) {
        monthlyTds = Math.round((emp.grossMonthlySalary * 0.15));
      } else if (emp.ctcAnnual > 1000000) {
        monthlyTds = Math.round((emp.grossMonthlySalary * 0.10));
      } else if (emp.ctcAnnual > 700000) {
        monthlyTds = Math.round((emp.grossMonthlySalary * 0.05));
      }

      const totalDeductions = pfEe + esic + pt + monthlyTds;
      const netPay = gross - totalDeductions;

      totalGross += gross;
      totalNet += netPay;
      totalPfEe += pfEe;
      totalPfEr += pfEr;
      totalEsic += esic;
      totalTds += monthlyTds;
      totalPt += pt;

      return {
        id: `ps-${Date.now()}-${idx}`,
        payrollMonthId: `pay-${Date.now()}`,
        monthYear,
        empId: emp.id,
        empCode: emp.empCode,
        empName: emp.name,
        designation: emp.designation,
        department: emp.department,
        pan: emp.pan,
        uan: emp.uanNumber,
        bankAccount: emp.bankAccount,
        bankName: emp.bankName,
        workingDays: 31,
        payableDays: 31,
        leaveDays: 0,
        basicPay: basic,
        hra,
        specialAllowance: special,
        siteAllowance: site,
        conveyanceAllowance: conveyance,
        grossEarnings: gross,
        pfEmployee: pfEe,
        pfEmployer: pfEr,
        esicEmployee: esic,
        esicEmployer: esic > 0 ? Math.round(gross * 0.0325) : 0,
        professionalTax: pt,
        tdsTax: monthlyTds,
        totalDeductions,
        netPay,
        netPayInWords: `Rupees ${netPay.toLocaleString()} Only`
      };
    });

    const newPayroll: PayrollMonth = {
      id: `pay-${Date.now()}`,
      monthYear,
      runDate,
      totalGross,
      totalNet,
      totalPfEe,
      totalPfEr,
      totalEsic,
      totalTds,
      totalPt,
      totalEmployees: activeEmployees.length,
      status: 'Draft',
      payslips
    };

    this.payrollMonths = [newPayroll, ...this.payrollMonths];
    save(STORAGE_KEYS.PAYROLL_MONTHS, this.payrollMonths);
    this.logAudit('CREATE', 'USER', newPayroll.id, `Generated Payroll Run for ${monthYear} (Gross: ₹${totalGross.toLocaleString()}, Net: ₹${totalNet.toLocaleString()})`);
    this.notify();
    return newPayroll;
  }

  public updatePayrollStatus(id: string, status: PayrollMonth['status']): void {
    this.payrollMonths = this.payrollMonths.map((p) => (p.id === id ? { ...p, status } : p));
    save(STORAGE_KEYS.PAYROLL_MONTHS, this.payrollMonths);
    this.notify();
  }

  public getResignationRecords(): ResignationRecord[] {
    return this.resignationRecords;
  }

  public getResignations(): ResignationRecord[] {
    return this.resignationRecords;
  }

  public submitResignation(data: Omit<ResignationRecord, 'id' | 'status'> & { status?: ResignationRecord['status'] }): ResignationRecord {
    const today = new Date().toISOString().split('T')[0];
    const newRes: ResignationRecord = {
      ...data,
      id: `res-${Date.now()}`,
      status: data.status || 'Submitted',
      approvals: data.approvals || {
        manager: {
          status: 'Pending',
          remarks: 'Awaiting reporting manager review & project handover clearance.'
        },
        admin: {
          status: 'Pending',
          remarks: 'Awaiting company ID card, access revocation & facilities clearance.'
        },
        hr: {
          status: 'Pending',
          remarks: 'Awaiting exit interview, notice audit & final relieving authorization.'
        }
      },
      clearances: data.clearances || {
        itAssets: false,
        financeAdvances: false,
        projectHandover: false,
        adminIdCard: false,
        hrExitInterview: false
      },
      fnfSettlement: data.fnfSettlement || {
        unpaidSalaryDays: 30,
        unpaidSalaryAmount: 35000,
        leaveEncashmentDays: 5,
        leaveEncashmentAmount: 5833,
        gratuityAmount: 0,
        bonusOrIncentives: 0,
        reimbursementsPending: 0,
        otherEarnings: 0,
        totalEarnings: 40833,
        noticeRecoveryDays: 0,
        noticeRecoveryAmount: 0,
        imprestAdvanceDeduction: 0,
        assetDamageOrLossDeduction: 0,
        tdsTaxDeduction: 0,
        pfDeduction: 0,
        otherDeductions: 0,
        totalDeductions: 0,
        netPayableAmount: 40833,
        financeStatus: 'Draft'
      }
    };
    this.resignationRecords = [newRes, ...this.resignationRecords];
    save(STORAGE_KEYS.RESIGNATIONS, this.resignationRecords);
    this.logAudit('CREATE', 'USER', newRes.empCode, `Resignation registered for ${newRes.empName} (${newRes.empCode}) - Notice Period: ${newRes.noticePeriodDays} days`);
    this.notify();
    return newRes;
  }

  public registerResignation(data: Omit<ResignationRecord, 'id' | 'status'> & { status?: ResignationRecord['status'] }): ResignationRecord {
    return this.submitResignation(data);
  }

  public updateResignationApproval(
    id: string,
    stage: 'manager' | 'admin' | 'hr',
    decision: 'Approved' | 'Rejected',
    details: Partial<ExitApprovalStage>
  ): void {
    const today = new Date().toISOString().split('T')[0];
    this.resignationRecords = this.resignationRecords.map((r) => {
      if (r.id === id) {
        const currentApprovals = r.approvals || {
          manager: { status: 'Pending' },
          admin: { status: 'Pending' },
          hr: { status: 'Pending' }
        };

        const updatedStage: ExitApprovalStage = {
          ...currentApprovals[stage],
          status: decision,
          actionDate: today,
          ...details
        };

        const newApprovals = {
          ...currentApprovals,
          [stage]: updatedStage
        };

        // Determine new overall status
        let newStatus = r.status;
        if (decision === 'Rejected') {
          newStatus = 'Rejected';
        } else if (stage === 'manager' && decision === 'Approved') {
          newStatus = 'Manager Approved';
          if (details.recommendedLastWorkingDate) {
            r.approvedLastWorkingDate = details.recommendedLastWorkingDate;
          }
          if (details.handoverCompleted) {
            r.clearances.projectHandover = true;
          }
        } else if (stage === 'admin' && decision === 'Approved') {
          newStatus = 'Admin Approved';
          if (details.idCardReturned) {
            r.clearances.adminIdCard = true;
          }
          if (details.assetsClearanceConfirmed) {
            r.clearances.itAssets = true;
          }
        } else if (stage === 'hr' && decision === 'Approved') {
          newStatus = 'Ready for F&F';
          if (details.exitInterviewConducted) {
            r.clearances.hrExitInterview = true;
          }
          if (details.finalApprovedLastDate) {
            r.approvedLastWorkingDate = details.finalApprovedLastDate;
          }
        }

        return {
          ...r,
          approvals: newApprovals,
          status: newStatus
        };
      }
      return r;
    });

    save(STORAGE_KEYS.RESIGNATIONS, this.resignationRecords);
    this.logAudit('UPDATE', 'USER', id, `Resignation approval updated: Stage [${stage.toUpperCase()}] -> ${decision}`);
    this.notify();
  }

  public updateClearance(
    id: string,
    clearances: Partial<ResignationRecord['clearances']>,
    fnfSettlement?: ResignationRecord['fnfSettlement'],
    status?: ResignationRecord['status']
  ): void {
    this.resignationRecords = this.resignationRecords.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          clearances: { ...r.clearances, ...clearances },
          fnfSettlement: fnfSettlement || r.fnfSettlement,
          status: status || r.status
        };
      }
      return r;
    });
    save(STORAGE_KEYS.RESIGNATIONS, this.resignationRecords);
    this.notify();
  }

  public updateFnfSettlement(
    id: string,
    fnfData: Partial<NonNullable<ResignationRecord['fnfSettlement']>>
  ): void {
    this.resignationRecords = this.resignationRecords.map((r) => {
      if (r.id === id) {
        const existing = r.fnfSettlement || {
          unpaidSalaryDays: 0,
          unpaidSalaryAmount: 0,
          leaveEncashmentDays: 0,
          leaveEncashmentAmount: 0,
          gratuityAmount: 0,
          noticeRecoveryAmount: 0,
          otherDeductions: 0,
          netPayableAmount: 0
        };
        const updated = { ...existing, ...fnfData };
        // Recalculate net payable if not explicitly overridden
        const totalEarnings = (updated.unpaidSalaryAmount || 0) +
          (updated.leaveEncashmentAmount || 0) +
          (updated.gratuityAmount || 0) +
          (updated.bonusOrIncentives || 0) +
          (updated.reimbursementsPending || 0) +
          (updated.otherEarnings || 0);
        const totalDeductions = (updated.noticeRecoveryAmount || 0) +
          (updated.imprestAdvanceDeduction || 0) +
          (updated.assetDamageOrLossDeduction || 0) +
          (updated.tdsTaxDeduction || 0) +
          (updated.pfDeduction || 0) +
          (updated.otherDeductions || 0);

        updated.totalEarnings = totalEarnings;
        updated.totalDeductions = totalDeductions;
        updated.netPayableAmount = Math.max(0, totalEarnings - totalDeductions);

        return {
          ...r,
          fnfSettlement: updated
        };
      }
      return r;
    });
    save(STORAGE_KEYS.RESIGNATIONS, this.resignationRecords);
    this.notify();
  }

  public shareFnfWithFinance(id: string, customVoucherNumber?: string): void {
    const today = new Date().toISOString().split('T')[0];
    const res = this.resignationRecords.find((r) => r.id === id);
    if (!res) return;

    const voucherNumber = customVoucherNumber || `FNF-PAY-${Date.now().toString().slice(-6)}`;
    const netAmount = res.fnfSettlement?.netPayableAmount || 0;

    this.resignationRecords = this.resignationRecords.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: 'Shared with Finance',
          fnfSettlement: r.fnfSettlement ? {
            ...r.fnfSettlement,
            sharedWithFinanceDate: today,
            financeStatus: 'Sent to Finance',
            financeVoucherNumber: voucherNumber
          } : undefined
        };
      }
      return r;
    });
    save(STORAGE_KEYS.RESIGNATIONS, this.resignationRecords);

    // Also register an official payable entry in Payments for the Finance team
    const paymentVoucher: PaymentRecord = {
      id: `pay-fnf-${res.id}`,
      invoiceNumber: voucherNumber,
      referenceType: 'EmployeeExit',
      referenceId: res.id,
      referenceTitle: `F&F Settlement: ${res.empName} (${res.empCode})`,
      clientOrVendorName: `${res.empName} (${res.designation}, ${res.department})`,
      isPayable: true,
      paymentType: 'F&F Exit Settlement',
      amount: netAmount,
      taxAmount: res.fnfSettlement?.tdsTaxDeduction || 0,
      totalAmount: netAmount,
      dueDate: res.approvedLastWorkingDate || today,
      status: 'Pending',
      notes: `Full & Final (F&F) employee exit settlement. All clearances (Manager, Admin, HR) verified. Net payable: ₹${netAmount.toLocaleString()}`
    };

    // Remove any existing duplicate voucher for this exit before inserting
    this.payments = [paymentVoucher, ...this.payments.filter((p) => p.id !== paymentVoucher.id)];
    save(STORAGE_KEYS.PAYMENTS, this.payments);

    this.logAudit('CREATE', 'PAYMENT', voucherNumber, `F&F settlement voucher shared to Finance for ${res.empName} (₹${netAmount.toLocaleString()})`);
    this.notify();
  }

  public settleFullAndFinal(
    id: string,
    paymentDetails?: {
      paymentMethod?: 'Bank Transfer / NEFT' | 'RTGS' | 'UPI' | 'Cheque';
      paymentRef?: string;
      paymentDate?: string;
      financeRemarks?: string;
      disbursedBy?: string;
    }
  ): void {
    const today = new Date().toISOString().split('T')[0];
    const txnRef = paymentDetails?.paymentRef || `NEFT-DISB-${Date.now()}`;
    const pMethod = paymentDetails?.paymentMethod || 'Bank Transfer / NEFT';
    const pDate = paymentDetails?.paymentDate || today;

    this.resignationRecords = this.resignationRecords.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          status: 'F&F Completed',
          fnfSettlement: r.fnfSettlement ? {
            ...r.fnfSettlement,
            financeStatus: 'Payment Released',
            paymentMethod: pMethod,
            paymentRef: txnRef,
            paymentDate: pDate,
            financeRemarks: paymentDetails?.financeRemarks || 'F&F settlement disbursed via corporate banking',
            financeDisbursedBy: paymentDetails?.disbursedBy || 'Finance Accounts Team'
          } : undefined
        };
      }
      return r;
    });
    save(STORAGE_KEYS.RESIGNATIONS, this.resignationRecords);

    // Sync corresponding payment voucher in payments
    const payVoucher = this.payments.find((p) => p.id === `pay-fnf-${id}` || p.referenceId === id);
    if (payVoucher) {
      payVoucher.status = 'Paid';
      payVoucher.paidDate = pDate;
      payVoucher.paymentMethod = pMethod;
      payVoucher.transactionReference = txnRef;
      save(STORAGE_KEYS.PAYMENTS, this.payments);
    }

    // Update employee status to Inactive / Separated
    const targetRes = this.resignationRecords.find((r) => r.id === id);
    if (targetRes) {
      const emp = this.employees.find((e) => e.id === targetRes.empId || e.empCode === targetRes.empCode);
      if (emp) {
        emp.status = 'Inactive';
        emp.employmentStatus = 'Separated';
        save(STORAGE_KEYS.EMPLOYEES, this.employees);
      }
    }

    this.logAudit('UPDATE', 'USER', id, `Full & Final payment settled with reference ${txnRef}`);
    this.notify();
  }

  // ==========================================
  // 1. ORGANIZATION & HR MASTER METHODS
  // ==========================================
  public getDepartments(): DepartmentMaster[] {
    return this.departments;
  }

  public addDepartment(data: Omit<DepartmentMaster, 'id'>): DepartmentMaster {
    const newDept: DepartmentMaster = {
      ...data,
      id: `dept-${Date.now()}`
    };
    this.departments = [...this.departments, newDept];
    save(STORAGE_KEYS.DEPARTMENTS, this.departments);
    this.notify();
    return newDept;
  }

  public getDesignationGrades(): DesignationGrade[] {
    return this.designationGrades;
  }

  public addDesignationGrade(data: Omit<DesignationGrade, 'id'>): DesignationGrade {
    const newDesig: DesignationGrade = {
      ...data,
      id: `desig-${Date.now()}`
    };
    this.designationGrades = [...this.designationGrades, newDesig];
    save(STORAGE_KEYS.DESIGNATION_GRADES, this.designationGrades);
    this.notify();
    return newDesig;
  }

  public getShifts(): ShiftMaster[] {
    return this.shifts;
  }

  public addShift(data: Omit<ShiftMaster, 'id'>): ShiftMaster {
    const newShift: ShiftMaster = {
      ...data,
      id: `shift-${Date.now()}`
    };
    this.shifts = [...this.shifts, newShift];
    save(STORAGE_KEYS.SHIFTS, this.shifts);
    this.notify();
    return newShift;
  }

  public getPolicyDocuments(): CompanyPolicyDocument[] {
    return this.policyDocuments;
  }

  public addPolicyDocument(data: Omit<CompanyPolicyDocument, 'id'>): CompanyPolicyDocument {
    const newDoc: CompanyPolicyDocument = {
      ...data,
      id: `pol-${Date.now()}`
    };
    this.policyDocuments = [newDoc, ...this.policyDocuments];
    save(STORAGE_KEYS.POLICY_DOCS, this.policyDocuments);
    this.notify();
    return newDoc;
  }

  // ==========================================
  // 2. EMPLOYEE ASSETS & DOCUMENT VAULT METHODS
  // ==========================================
  public getEmployeeAssets(): EmployeeAsset[] {
    return this.employeeAssets;
  }

  public allocateAsset(data: Omit<EmployeeAsset, 'id'>): EmployeeAsset {
    const newAsset: EmployeeAsset = {
      ...data,
      id: `ast-${Date.now()}`
    };
    this.employeeAssets = [newAsset, ...this.employeeAssets];
    save(STORAGE_KEYS.EMPLOYEE_ASSETS, this.employeeAssets);
    this.notify();
    return newAsset;
  }

  public returnAsset(
    id: string,
    returnData?: {
      returnDate?: string;
      returnRemarks?: string;
      returnCondition?: 'Brand New' | 'Good' | 'Fair' | 'Damaged' | 'Normal Wear & Tear';
      receivedBy?: string;
    } | string
  ): void {
    const returnDate = (typeof returnData === 'object' ? returnData.returnDate : returnData) || new Date().toISOString().split('T')[0];
    const returnRemarks = typeof returnData === 'object' ? (returnData.returnRemarks || '') : '';
    const returnCondition = typeof returnData === 'object' ? (returnData.returnCondition || 'Good') : 'Good';
    const receivedBy = (typeof returnData === 'object' && returnData.receivedBy) ? returnData.receivedBy : (this.user?.name || 'HR Admin');

    const prevAsset = this.employeeAssets.find(a => a.id === id);

    this.employeeAssets = this.employeeAssets.map(a =>
      a.id === id
        ? {
            ...a,
            status: 'Returned',
            returnDate,
            returnedDate: returnDate,
            returnRemarks,
            returnCondition,
            receivedBy
          }
        : a
    );
    save(STORAGE_KEYS.EMPLOYEE_ASSETS, this.employeeAssets);

    if (prevAsset) {
      this.logAudit(
        'UPDATE',
        'USER',
        id,
        `Returned asset ${prevAsset.assetTag} (${prevAsset.assetType}). Condition: ${returnCondition}. Remarks: ${returnRemarks || 'N/A'}`,
        { assetTag: prevAsset.assetTag, returnCondition, returnRemarks, receivedBy }
      );
    }

    this.notify();
  }

  public updateEmployeeAsset(id: string, updates: Partial<EmployeeAsset>): void {
    this.employeeAssets = this.employeeAssets.map(a => a.id === id ? { ...a, ...updates } : a);
    save(STORAGE_KEYS.EMPLOYEE_ASSETS, this.employeeAssets);
    this.notify();
  }

  public getEmployeeDocuments(): EmployeeDocument[] {
    return this.employeeDocuments;
  }

  public uploadEmployeeDocument(data: Omit<EmployeeDocument, 'id'>): EmployeeDocument {
    const newDoc: EmployeeDocument = {
      ...data,
      id: `doc-${Date.now()}`
    };
    this.employeeDocuments = [newDoc, ...this.employeeDocuments];
    save(STORAGE_KEYS.EMPLOYEE_DOCUMENTS, this.employeeDocuments);
    this.notify();
    return newDoc;
  }

  public verifyEmployeeDocument(id: string, verifiedBy: string = 'HR Admin'): void {
    this.employeeDocuments = this.employeeDocuments.map(d => d.id === id ? { ...d, verificationStatus: 'Verified', verifiedBy } : d);
    save(STORAGE_KEYS.EMPLOYEE_DOCUMENTS, this.employeeDocuments);
    this.notify();
  }

  // ==========================================
  // 3. RECRUITMENT & ONBOARDING METHODS
  // ==========================================
  public getOnboardingTasks(): OnboardingTask[] {
    return this.onboardingTasks;
  }

  public addOnboardingTask(data: Omit<OnboardingTask, 'id'>): OnboardingTask {
    const newTask: OnboardingTask = {
      ...data,
      id: `onb-${Date.now()}`
    };
    this.onboardingTasks = [...this.onboardingTasks, newTask];
    save(STORAGE_KEYS.ONBOARDING_TASKS, this.onboardingTasks);
    this.notify();
    return newTask;
  }

  public updateOnboardingTaskStatus(id: string, status: OnboardingTask['status']): void {
    this.onboardingTasks = this.onboardingTasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          completedAt: status === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return t;
    });
    save(STORAGE_KEYS.ONBOARDING_TASKS, this.onboardingTasks);
    this.notify();
  }

  // ==========================================
  // 4. ATTENDANCE REGULARIZATION METHODS
  // ==========================================
  public getAttendanceRegularizations(): AttendanceRegularization[] {
    return this.attendanceRegularizations;
  }

  public submitAttendanceRegularization(data: Omit<AttendanceRegularization, 'id' | 'status' | 'appliedDate'>): AttendanceRegularization {
    const newReg: AttendanceRegularization = {
      ...data,
      id: `reg-${Date.now()}`,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    this.attendanceRegularizations = [newReg, ...this.attendanceRegularizations];
    save(STORAGE_KEYS.ATTENDANCE_REGULARIZATIONS, this.attendanceRegularizations);
    this.notify();
    return newReg;
  }

  public updateAttendanceRegularizationStatus(id: string, status: 'Approved' | 'Rejected', actionBy: string = 'Admin'): void {
    this.attendanceRegularizations = this.attendanceRegularizations.map(r => r.id === id ? { ...r, status, actionBy } : r);
    save(STORAGE_KEYS.ATTENDANCE_REGULARIZATIONS, this.attendanceRegularizations);
    this.notify();
  }

  // ==========================================
  // 8. PERFORMANCE MANAGEMENT (PMS) METHODS
  // ==========================================
  public getAppraisalCycles(): AppraisalCycle[] {
    return this.appraisalCycles;
  }

  public getEmployeeAppraisals(): EmployeeAppraisal[] {
    return this.employeeAppraisals;
  }

  public submitEmployeeAppraisal(data: Omit<EmployeeAppraisal, 'id'>): EmployeeAppraisal {
    const newAppr: EmployeeAppraisal = {
      ...data,
      id: `appr-${Date.now()}`
    };
    this.employeeAppraisals = [newAppr, ...this.employeeAppraisals];
    save(STORAGE_KEYS.EMPLOYEE_APPRAISALS, this.employeeAppraisals);
    this.notify();
    return newAppr;
  }

  public updateEmployeeAppraisal(id: string, updates: Partial<EmployeeAppraisal>): void {
    this.employeeAppraisals = this.employeeAppraisals.map(a => a.id === id ? { ...a, ...updates } : a);
    save(STORAGE_KEYS.EMPLOYEE_APPRAISALS, this.employeeAppraisals);
    this.notify();
  }

  // ==========================================
  // 9. TRAINING & SKILL MANAGEMENT METHODS
  // ==========================================
  public getTrainingCourses(): TrainingCourse[] {
    return this.trainingCourses;
  }

  public addTrainingCourse(data: Omit<TrainingCourse, 'id'>): TrainingCourse {
    const newCourse: TrainingCourse = {
      ...data,
      id: `trn-${Date.now()}`
    };
    this.trainingCourses = [newCourse, ...this.trainingCourses];
    save(STORAGE_KEYS.TRAINING_COURSES, this.trainingCourses);
    this.notify();
    return newCourse;
  }

  public getSkillMatrices(): EmployeeSkillMatrix[] {
    return this.skillMatrices;
  }

  public updateEmployeeSkillMatrix(matrix: EmployeeSkillMatrix): void {
    const index = this.skillMatrices.findIndex(s => s.empId === matrix.empId);
    if (index >= 0) {
      this.skillMatrices[index] = matrix;
    } else {
      this.skillMatrices.push(matrix);
    }
    save(STORAGE_KEYS.SKILL_MATRICES, this.skillMatrices);
    this.notify();
  }

  // ==========================================
  // 10. TRAVEL & EXPENSE CLAIMS METHODS
  // ==========================================
  public getTravelRequests(): TravelRequest[] {
    return this.travelRequests;
  }

  public submitTravelRequest(data: Omit<TravelRequest, 'id' | 'travelCode' | 'status'>): TravelRequest {
    const newReq: TravelRequest = {
      ...data,
      id: `trv-${Date.now()}`,
      travelCode: `26-TRV-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Submitted'
    };
    this.travelRequests = [newReq, ...this.travelRequests];
    save(STORAGE_KEYS.TRAVEL_REQUESTS, this.travelRequests);
    this.notify();
    return newReq;
  }

  public updateTravelRequestStatus(id: string, status: TravelRequest['status'], approvedBy?: string): void {
    this.travelRequests = this.travelRequests.map(t => t.id === id ? { ...t, status, approvedBy } : t);
    save(STORAGE_KEYS.TRAVEL_REQUESTS, this.travelRequests);
    this.notify();
  }

  public getExpenseClaims(): ExpenseClaim[] {
    return this.expenseClaims;
  }

  public submitExpenseClaim(data: Omit<ExpenseClaim, 'id' | 'claimCode' | 'status'>): ExpenseClaim {
    const newClaim: ExpenseClaim = {
      ...data,
      id: `exp-${Date.now()}`,
      claimCode: `26-EXP-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Submitted'
    };
    this.expenseClaims = [newClaim, ...this.expenseClaims];
    save(STORAGE_KEYS.EXPENSE_CLAIMS, this.expenseClaims);
    this.notify();
    return newClaim;
  }

  public updateExpenseClaimStatus(id: string, status: ExpenseClaim['status'], approvedAmount?: number): void {
    this.expenseClaims = this.expenseClaims.map(e => e.id === id ? { ...e, status, approvedAmount: approvedAmount ?? e.amount } : e);
    save(STORAGE_KEYS.EXPENSE_CLAIMS, this.expenseClaims);
    this.notify();
  }

  // ==========================================
  // 11. GRIEVANCE & EMPLOYEE RELATIONS METHODS
  // ==========================================
  public getGrievanceTickets(): GrievanceTicket[] {
    return this.grievanceTickets;
  }

  public submitGrievanceTicket(data: Omit<GrievanceTicket, 'id' | 'ticketNumber' | 'status' | 'createdAt'>): GrievanceTicket {
    const newTicket: GrievanceTicket = {
      ...data,
      id: `grv-${Date.now()}`,
      ticketNumber: this.generateSeriesNumber('grievance'),
      status: 'Under Investigation',
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.grievanceTickets = [newTicket, ...this.grievanceTickets];
    save(STORAGE_KEYS.GRIEVANCES, this.grievanceTickets);
    this.notify();
    return newTicket;
  }

  public resolveGrievanceTicket(id: string, resolutionSummary: string, resolvedBy: string = 'Admin'): void {
    this.grievanceTickets = this.grievanceTickets.map(g => {
      if (g.id === id) {
        return {
          ...g,
          status: 'Resolved',
          resolutionSummary,
          assignedTo: resolvedBy,
          resolvedAt: new Date().toISOString().split('T')[0]
        };
      }
      return g;
    });
    save(STORAGE_KEYS.GRIEVANCES, this.grievanceTickets);
    this.notify();
  }

  // ==========================================
  // 12. WORKFORCE FORECASTS & PLANNING METHODS
  // ==========================================
  public getWorkforceForecasts(): WorkforceForecast[] {
    return this.workforceForecasts;
  }

  public addWorkforceForecast(data: Omit<WorkforceForecast, 'id'>): WorkforceForecast {
    const newForecast: WorkforceForecast = {
      ...data,
      id: `wfp-${Date.now()}`
    };
    this.workforceForecasts = [newForecast, ...this.workforceForecasts];
    save(STORAGE_KEYS.WORKFORCE_FORECASTS, this.workforceForecasts);
    this.notify();
    return newForecast;
  }

  // ==========================================
  // 13. DASHBOARD DRAG & DROP LAYOUT METHODS
  // ==========================================
  public getDashboardLayout(): DashboardLayoutState {
    const defaultLayout: DashboardLayoutState = {
      version: 1,
      kpiWidgets: DEFAULT_KPI_WIDGETS,
      mainWidgets: DEFAULT_MAIN_SECTION_WIDGETS,
      isCustomized: false
    };

    try {
      const stored = load<DashboardLayoutState | null>(STORAGE_KEYS.DASHBOARD_LAYOUT, null);
      if (!stored || !stored.kpiWidgets || !stored.mainWidgets) {
        return defaultLayout;
      }

      // Merge with default widgets in case new ones were introduced
      const mergedKpis = [...stored.kpiWidgets];
      DEFAULT_KPI_WIDGETS.forEach((dw) => {
        if (!mergedKpis.some((kw) => kw.id === dw.id)) {
          mergedKpis.push(dw);
        }
      });

      const mergedMain = [...stored.mainWidgets];
      DEFAULT_MAIN_SECTION_WIDGETS.forEach((dm) => {
        if (!mergedMain.some((mw) => mw.id === dm.id)) {
          mergedMain.push(dm);
        }
      });

      return {
        version: stored.version || 1,
        kpiWidgets: mergedKpis,
        mainWidgets: mergedMain,
        isCustomized: stored.isCustomized ?? true
      };
    } catch {
      return defaultLayout;
    }
  }

  public saveDashboardLayout(layout: Partial<DashboardLayoutState>): void {
    const current = this.getDashboardLayout();
    const updated: DashboardLayoutState = {
      ...current,
      ...layout,
      isCustomized: true
    };
    save(STORAGE_KEYS.DASHBOARD_LAYOUT, updated);
    this.notify();
  }

  public resetDashboardLayout(): DashboardLayoutState {
    const defaultLayout: DashboardLayoutState = {
      version: 1,
      kpiWidgets: DEFAULT_KPI_WIDGETS,
      mainWidgets: DEFAULT_MAIN_SECTION_WIDGETS,
      isCustomized: false
    };
    save(STORAGE_KEYS.DASHBOARD_LAYOUT, defaultLayout);
    this.notify();
    return defaultLayout;
  }

  // ALL RAW DATA FOR EXPORT / GOOGLE SHEETS SYNC
  public getAllData() {
    return {
      currentUser: this.user,
      isAuthenticated: this.isAuthenticated,
      systemSettings: this.systemSettings,
      leads: this.leads,
      quotes: this.quotes,
      workOrders: this.workOrders,
      projects: this.projects,
      inventory: this.inventory,
      prs: this.prs,
      pos: this.pos,
      vendors: this.vendors,
      payments: this.payments,
      salesReps: this.salesReps,
      auditLogs: this.auditLogs,
      sheetsConfig: this.sheetsConfig,
      clients: this.clients,
      costCenters: this.costCenters,
      taxSlabs: this.taxSlabs,
      paymentTerms: this.paymentTerms,
      accounts: this.chartOfAccounts,
      chartOfAccounts: this.chartOfAccounts,
      vouchers: this.journalVouchers,
      journalVouchers: this.journalVouchers,
      tdsRecords: this.tdsRecords,
      gstRecords: [],
      jobRequisitions: this.jobRequisitions,
      candidates: this.jobCandidates,
      jobCandidates: this.jobCandidates,
      employees: this.employees,
      attendance: this.attendanceRecords,
      attendanceRecords: this.attendanceRecords,
      timesheets: this.timesheetEntries,
      timesheetEntries: this.timesheetEntries,
      leaves: this.leaveApplications,
      leaveApplications: this.leaveApplications,
      holidays: this.companyHolidays,
      companyHolidays: this.companyHolidays,
      payrollMonths: this.payrollMonths,
      resignations: this.resignationRecords,
      resignationRecords: this.resignationRecords,
      departments: this.departments,
      designations: this.designationGrades,
      shifts: this.shifts,
      policyDocuments: this.policyDocuments,
      employeeAssets: this.employeeAssets,
      employeeDocuments: this.employeeDocuments,
      onboardingTasks: this.onboardingTasks,
      attendanceRegularizations: this.attendanceRegularizations,
      appraisalCycles: this.appraisalCycles,
      employeeAppraisals: this.employeeAppraisals,
      trainingCourses: this.trainingCourses,
      skillMatrices: this.skillMatrices,
      travelRequests: this.travelRequests,
      expenseClaims: this.expenseClaims,
      grievanceTickets: this.grievanceTickets,
      workforceForecasts: this.workforceForecasts,
      biometricDevices: this.biometricDevices,
      biometricPunchLogs: this.biometricPunchLogs
    };
  }

  // ==========================================
  // LOCAL BACKUP SNAPSHOTS & RECOVERY ENGINE
  // ==========================================

  public getBackupConfig(): BackupConfig {
    return { ...this.backupConfig };
  }

  public updateBackupConfig(updates: Partial<BackupConfig>): void {
    this.backupConfig = { ...this.backupConfig, ...updates };
    save(STORAGE_KEYS.LOCAL_BACKUP_CONFIG, this.backupConfig);
    this.restartPeriodicBackupTimer();
    this.notify();
  }

  public getBackupSnapshots(): LocalBackupSnapshot[] {
    return this.backupSnapshots;
  }

  public restartPeriodicBackupTimer(): void {
    if (this.periodicBackupTimer) {
      clearInterval(this.periodicBackupTimer);
      this.periodicBackupTimer = null;
    }

    const intervalMin = this.backupConfig.periodicIntervalMinutes;
    if (intervalMin > 0 && typeof window !== 'undefined') {
      const intervalMs = intervalMin * 60 * 1000;
      this.periodicBackupTimer = setInterval(() => {
        this.recordCriticalSnapshot(
          'PERIODIC_SCHEDULE',
          'System',
          `Periodic scheduled backup snapshot (${intervalMin} min interval)`
        );
      }, intervalMs);
    }
  }

  public recordCriticalSnapshot(
    triggerType: LocalBackupSnapshot['triggerType'],
    module: LocalBackupSnapshot['module'],
    description: string
  ): LocalBackupSnapshot {
    const rawData = this.getAllData();
    const payloadJson = JSON.stringify(rawData);
    const sizeKb = Math.round((payloadJson.length * 2) / 1024);

    const snapshot: LocalBackupSnapshot = {
      id: `SNP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      triggerType,
      module,
      description,
      itemCounts: {
        inventoryCount: this.inventory.length,
        prCount: this.prs.length,
        poCount: this.pos.length,
        quoteCount: this.quotes.length,
        leadCount: this.leads.length,
        projectCount: this.projects.length,
        paymentCount: this.payments.length
      },
      payloadJson,
      sizeKb
    };

    const maxKeep = this.backupConfig.maxRetainedSnapshots || 30;
    this.backupSnapshots = [snapshot, ...this.backupSnapshots.slice(0, maxKeep - 1)];
    save(STORAGE_KEYS.LOCAL_BACKUP_SNAPSHOTS, this.backupSnapshots);

    // Audit log
    this.logAudit(
      'BACKUP_CREATE',
      'SYSTEM',
      snapshot.id,
      `Local backup snapshot created: ${description} (${snapshot.itemCounts.inventoryCount} SKUs, ${snapshot.itemCounts.prCount} PRs, ${snapshot.itemCounts.poCount} POs)`
    );

    // Dispatch backup event to in-app notification toasts & banners
    const eventPayload: BackupNotificationEvent = {
      snapshotId: snapshot.id,
      timestamp: snapshot.timestamp,
      triggerType,
      module,
      description,
      itemCountSummary: `${snapshot.itemCounts.inventoryCount} SKUs • ${snapshot.itemCounts.prCount} PRs • ${snapshot.itemCounts.poCount} POs • ${snapshot.itemCounts.quoteCount} Quotes`,
      downloadPayload: payloadJson
    };

    this.backupListeners.forEach((fn) => {
      try {
        fn(eventPayload);
      } catch (err) {
        console.error('Error invoking backup listener:', err);
      }
    });

    // Optional native browser push notification if permitted and enabled
    if (this.backupConfig.browserPushNotifications && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(`AlphaERP Local Backup Created`, {
            body: `${description}\n${eventPayload.itemCountSummary}`,
            icon: '/favicon.ico'
          });
        } catch {
          // Notification failed silently
        }
      }
    }

    this.notify();
    return snapshot;
  }

  public deleteSnapshot(snapshotId: string): void {
    this.backupSnapshots = this.backupSnapshots.filter((s) => s.id !== snapshotId);
    save(STORAGE_KEYS.LOCAL_BACKUP_SNAPSHOTS, this.backupSnapshots);
    this.notify();
  }

  public clearAllSnapshots(): void {
    this.backupSnapshots = [];
    save(STORAGE_KEYS.LOCAL_BACKUP_SNAPSHOTS, this.backupSnapshots);
    this.notify();
  }

  public restoreFromSnapshot(snapshotId: string): boolean {
    const target = this.backupSnapshots.find((s) => s.id === snapshotId);
    if (!target) return false;
    return this.importFullDatabase(target.payloadJson);
  }

  public exportFullDatabase(): string {
    const fullState = this.getAllData();
    return JSON.stringify(fullState, null, 2);
  }

  public downloadBackupFile(customName?: string): void {
    if (typeof window === 'undefined') return;
    const jsonStr = this.exportFullDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = customName || `AlphaERP_Full_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public importFullDatabase(jsonString: string): boolean {
    try {
      const raw = JSON.parse(jsonString);
      if (!raw || typeof raw !== 'object') return false;
      const data = safeSanitizeValue(raw);

      if (Array.isArray(data.inventory)) {
        this.inventory = data.inventory;
        save(STORAGE_KEYS.INVENTORY, this.inventory);
      }
      if (Array.isArray(data.prs)) {
        this.prs = data.prs;
        save(STORAGE_KEYS.PRS, this.prs);
      }
      if (Array.isArray(data.pos)) {
        this.pos = data.pos;
        save(STORAGE_KEYS.POS, this.pos);
      }
      if (Array.isArray(data.quotes)) {
        this.quotes = data.quotes;
        save(STORAGE_KEYS.QUOTES, this.quotes);
      }
      if (Array.isArray(data.leads)) {
        this.leads = data.leads;
        save(STORAGE_KEYS.LEADS, this.leads);
      }
      if (Array.isArray(data.projects)) {
        this.projects = data.projects;
        save(STORAGE_KEYS.PROJECTS, this.projects);
      }
      if (Array.isArray(data.workOrders)) {
        this.workOrders = data.workOrders;
        save(STORAGE_KEYS.WORK_ORDERS, this.workOrders);
      }
      if (Array.isArray(data.payments)) {
        this.payments = data.payments;
        save(STORAGE_KEYS.PAYMENTS, this.payments);
      }
      if (Array.isArray(data.vendors)) {
        this.vendors = data.vendors;
        save(STORAGE_KEYS.VENDORS, this.vendors);
      }
      if (Array.isArray(data.clients)) {
        this.clients = data.clients;
        save(STORAGE_KEYS.CLIENTS, this.clients);
      }
      if (Array.isArray(data.costCenters)) {
        this.costCenters = data.costCenters;
        save(STORAGE_KEYS.COST_CENTERS, this.costCenters);
      }
      if (Array.isArray(data.taxSlabs)) {
        this.taxSlabs = data.taxSlabs;
        save(STORAGE_KEYS.TAX_SLABS, this.taxSlabs);
      }
      if (Array.isArray(data.paymentTerms)) {
        this.paymentTerms = data.paymentTerms;
        save(STORAGE_KEYS.PAYMENT_TERMS, this.paymentTerms);
      }
      if (Array.isArray(data.chartOfAccounts || data.accounts)) {
        this.chartOfAccounts = data.chartOfAccounts || data.accounts;
        save(STORAGE_KEYS.CHART_OF_ACCOUNTS, this.chartOfAccounts);
      }
      if (Array.isArray(data.journalVouchers || data.vouchers)) {
        this.journalVouchers = data.journalVouchers || data.vouchers;
        save(STORAGE_KEYS.JOURNAL_VOUCHERS, this.journalVouchers);
      }
      if (Array.isArray(data.tdsRecords)) {
        this.tdsRecords = data.tdsRecords;
        save(STORAGE_KEYS.TDS_RECORDS, this.tdsRecords);
      }
      if (data.systemSettings) {
        this.systemSettings = { ...this.systemSettings, ...data.systemSettings };
        save(STORAGE_KEYS.SYSTEM_SETTINGS, this.systemSettings);
      }

      this.logAudit('BACKUP_RESTORE', 'SYSTEM', 'RESTORE_OP', `Successfully restored database state from backup`);
      this.addNotification(
        'Database Restored',
        'Database state was successfully restored from backup snapshot.',
        'success',
        'dashboard'
      );
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to import database from JSON:', e);
      return false;
    }
  }
}

export const storageService = new StorageService();
