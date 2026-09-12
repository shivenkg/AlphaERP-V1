import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from './firebaseConfig';
import { storageService } from './storageService';
import {
  GoogleSheetBackupStats,
  GoogleSheetRestorePreview,
  GoogleSheetRestoreResult,
  GoogleSheetsSyncConfig
} from '../types';

export function formatCollectionLabel(key: string): string {
  const map: Record<string, string> = {
    systemSettings: 'System Settings',
    clients: 'Clients Master',
    vendors: 'Vendors Master',
    inventory: 'Inventory SKUs',
    salesReps: 'Sales Reps & Targets',
    costCenters: 'Cost Centers',
    taxSlabs: 'Tax Slabs',
    paymentTerms: 'Payment Terms',
    chartOfAccounts: 'Chart of Accounts',
    employees: 'Employees & Staff',
    departments: 'Departments',
    designationGrades: 'Designation Grades',
    shifts: 'Work Shifts',
    companyHolidays: 'Company Holidays',
    policyDocuments: 'Policy Documents',
    biometricDevices: 'Biometric Devices',
    trainingCourses: 'Training Courses',
    leads: 'CRM Leads Pipeline',
    quotes: 'Quotes & Proposals',
    projects: 'Projects & BOQs',
    workOrders: 'Work Orders',
    prs: 'Purchase Requisitions (PR)',
    pos: 'Purchase Orders (PO)',
    grns: 'Goods Receipt Notes (GRN)',
    payments: 'Payments & Invoices',
    journalVouchers: 'Journal Vouchers',
    tdsRecords: 'TDS Filings',
    attendanceRecords: 'Attendance Records',
    timesheetEntries: 'Timesheet Entries',
    leaveApplications: 'Leave Applications',
    payrollMonths: 'Payroll Cycles',
    jobRequisitions: 'Job Requisitions',
    jobCandidates: 'Job Candidates',
    expenseClaims: 'Expense Claims',
    travelRequests: 'Travel Requests',
    resignationRecords: 'Resignation Records',
    employeeAssets: 'Employee Assets',
    employeeDocuments: 'Employee Documents',
    onboardingTasks: 'Onboarding Tasks',
    attendanceRegularizations: 'Attendance Regularizations',
    appraisalCycles: 'Appraisal Cycles',
    employeeAppraisals: 'Employee Appraisals',
    skillMatrices: 'Skill Matrices',
    grievanceTickets: 'Grievance Tickets',
    workforceForecasts: 'Workforce Forecasts',
    biometricPunchLogs: 'Biometric Punch Logs',
    amcContracts: 'AMC Service Contracts',
    ppmVisits: 'PPM Maintenance Visits',
    breakdownTickets: 'Breakdown & Emergency Tickets',
    auditLogs: 'Audit Logs'
  };
  return map[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
}

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Configure Google Provider with required Google Workspace Scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

export interface SheetTabDefinition {
  title: string;
  sheetId?: number;
  values: (string | number | boolean | null | undefined)[][];
}

class GoogleSheetsService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private currentUser: FirebaseUser | null = null;
  private isSigningIn: boolean = false;
  private readonly STORAGE_KEY_TOKEN = 'ALPHA_ERP_GSHEETS_AUTH_TOKEN';
  private readonly STORAGE_KEY_EXPIRY = 'ALPHA_ERP_GSHEETS_AUTH_EXPIRY';
  private readonly STORAGE_KEY_USER_EMAIL = 'ALPHA_ERP_GSHEETS_USER_EMAIL';

  constructor() {
    // Load persistently saved token only if strictly non-expired (with 60s buffer)
    try {
      const savedToken = localStorage.getItem(this.STORAGE_KEY_TOKEN);
      const savedExpiry = localStorage.getItem(this.STORAGE_KEY_EXPIRY);
      if (savedToken && savedExpiry && Number(savedExpiry) > Date.now() + 60000) {
        this.accessToken = savedToken;
        this.tokenExpiry = Number(savedExpiry);
      } else if (savedToken) {
        // Expired or stale token detected on boot - purge immediately to prevent 401 cascade
        this.clearAuthToken();
      }
    } catch {
      // localStorage may be restricted in sandbox
    }

    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user?.email) {
        try {
          localStorage.setItem(this.STORAGE_KEY_USER_EMAIL, user.email);
        } catch {}
      }
    });
  }

  public getCurrentFirebaseUser(): FirebaseUser | null {
    return this.currentUser || auth.currentUser;
  }

  public hasValidToken(): boolean {
    return !!this.accessToken && Date.now() < (this.tokenExpiry - 60000);
  }

  public isAuthorized(): boolean {
    return this.hasValidToken();
  }

  public getAuthStatus(): {
    isAuthenticated: boolean;
    isExpired: boolean;
    email: string | null;
    expiresInMinutes: number;
    hasSpreadsheet: boolean;
  } {
    const valid = this.hasValidToken();
    let email: string | null = this.currentUser?.email || null;
    if (!email) {
      try {
        email = localStorage.getItem(this.STORAGE_KEY_USER_EMAIL);
      } catch {}
    }

    let isExpired = false;
    try {
      const savedToken = localStorage.getItem(this.STORAGE_KEY_TOKEN);
      const savedExpiry = localStorage.getItem(this.STORAGE_KEY_EXPIRY);
      if (savedToken && savedExpiry && Number(savedExpiry) <= Date.now()) {
        isExpired = true;
      }
    } catch {}

    const expiresInMinutes = valid ? Math.max(0, Math.round((this.tokenExpiry - Date.now()) / 60000)) : 0;
    const config = storageService.getGoogleSheetsConfig();

    return {
      isAuthenticated: valid,
      isExpired: !valid && (isExpired || !!this.accessToken),
      email,
      expiresInMinutes,
      hasSpreadsheet: Boolean(config.spreadsheetId)
    };
  }

  public clearAuthToken(): void {
    this.accessToken = null;
    this.tokenExpiry = 0;
    try {
      localStorage.removeItem(this.STORAGE_KEY_TOKEN);
      localStorage.removeItem(this.STORAGE_KEY_EXPIRY);
      localStorage.removeItem(this.STORAGE_KEY_USER_EMAIL);
    } catch {}
    storageService.updateGoogleSheetsConfig({ syncStatus: 'idle' });
  }

  public setToken(token: string, expiresInSeconds: number = 3500): void {
    this.accessToken = token;
    this.tokenExpiry = Date.now() + expiresInSeconds * 1000;
    try {
      localStorage.setItem(this.STORAGE_KEY_TOKEN, token);
      localStorage.setItem(this.STORAGE_KEY_EXPIRY, String(this.tokenExpiry));
    } catch {}
  }

  public getAccessToken(): string | null {
    if (this.hasValidToken() && this.accessToken) {
      return this.accessToken;
    }
    // Check saved token in localStorage with valid non-expired timestamp
    try {
      const savedToken = localStorage.getItem(this.STORAGE_KEY_TOKEN);
      const savedExpiry = localStorage.getItem(this.STORAGE_KEY_EXPIRY);
      if (savedToken && savedExpiry && Number(savedExpiry) > Date.now() + 60000) {
        this.accessToken = savedToken;
        this.tokenExpiry = Number(savedExpiry);
        return this.accessToken;
      } else if (savedToken) {
        this.clearAuthToken();
      }
    } catch {}

    // Check saved config in storageService
    const config = storageService.getGoogleSheetsConfig();
    if (config?.apiKey && config.apiKey.trim()) {
      return config.apiKey.trim();
    }

    return null;
  }

  /**
   * Universal fetch wrapper that manages authorization tokens,
   * detects 401 expiry, purges invalid credentials, and transparently re-authenticates.
   */
  public async fetchWithAuth(
    url: string,
    options: RequestInit = {},
    retryOn401: boolean = true
  ): Promise<Response> {
    let token = this.getAccessToken();
    if (!token) {
      const authRes = await this.signInWithGoogle();
      token = authRes.token;
    }

    const headers = new Headers(options.headers || {});
    if (!headers.has('Authorization')) {
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      headers.set('Authorization', authHeader);
    }

    let response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      console.warn('Google Sheets API returned 401 Unauthorized. Invalidating expired token.');
      this.clearAuthToken();

      if (retryOn401) {
        try {
          const reauthRes = await this.signInWithGoogle();
          const freshHeaders = new Headers(options.headers || {});
          freshHeaders.set('Authorization', `Bearer ${reauthRes.token}`);
          const retryResponse = await fetch(url, {
            ...options,
            headers: freshHeaders
          });
          if (retryResponse.ok) {
            return retryResponse;
          }
          response = retryResponse;
        } catch (reauthErr) {
          console.warn('Re-authentication after 401 failed or was dismissed:', reauthErr);
        }
      }

      storageService.updateGoogleSheetsConfig({ syncStatus: 'error' });
      throw new Error(
        'Google Sheets authorization expired or invalid. Please re-authenticate via the "Authorize Google Workspace" button in Admin Settings or Google Sheets modal.'
      );
    }

    return response;
  }

  /**
   * Save API Key and Sheet ID persistently from Admin Configuration Panel
   */
  public saveConfigCredentials(spreadsheetId: string, apiKey: string): { spreadsheetId: string; spreadsheetUrl: string } {
    let cleanId = (spreadsheetId || '').trim();
    const match = cleanId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      cleanId = match[1];
    }
    const cleanApiKey = (apiKey || '').trim();
    const spreadsheetUrl = cleanId ? `https://docs.google.com/spreadsheets/d/${cleanId}/edit` : null;

    storageService.updateGoogleSheetsConfig({
      spreadsheetId: cleanId || null,
      spreadsheetUrl,
      apiKey: cleanApiKey || null,
      syncStatus: 'idle'
    });

    if (cleanApiKey) {
      // If it looks like an OAuth access token (starts with ya29.), treat as standard 1-hour token
      const expiry = cleanApiKey.startsWith('ya29.') ? 3600 : 86400 * 30;
      this.setToken(cleanApiKey, expiry);
    }

    storageService.logAudit(
      'UPDATE',
      'GOOGLE_SHEET',
      cleanId || 'CONFIG',
      `Google Sheets API key & Sheet ID updated and saved via Admin Configuration Panel`
    );

    return {
      spreadsheetId: cleanId,
      spreadsheetUrl: spreadsheetUrl || ''
    };
  }

  // Sign in to Google Workspace with popup to acquire Sheets & Drive scopes
  public async signInWithGoogle(): Promise<{ user?: FirebaseUser; token: string; email?: string }> {
    if (this.isSigningIn) {
      throw new Error('Google Sign-In is already in progress.');
    }

    this.isSigningIn = true;
    try {
      let token: string | null = null;
      let email: string | undefined = undefined;

      // Method A: Check if Google Identity Services (GSI) is available with configured OAuth Client ID
      const gsiAvailable =
        typeof window !== 'undefined' &&
        !!(window as any).google?.accounts?.oauth2 &&
        !!firebaseConfig.oAuthClientId;

      if (gsiAvailable) {
        try {
          token = await new Promise<string>((resolve, reject) => {
            const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
              client_id: firebaseConfig.oAuthClientId,
              scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
              callback: (tokenResponse: any) => {
                if (tokenResponse.error) {
                  reject(new Error(tokenResponse.error_description || tokenResponse.error || 'Google authorization declined'));
                } else if (tokenResponse.access_token) {
                  resolve(tokenResponse.access_token);
                } else {
                  reject(new Error('No access token received from Google Identity Services.'));
                }
              }
            });
            tokenClient.requestAccessToken({ prompt: 'consent' });
          });
        } catch (gsiErr: any) {
          console.warn('GSI Token Client prompt was not completed, trying Firebase Auth popup:', gsiErr);
        }
      }

      // Method B: Firebase Auth popup fallback
      if (!token) {
        provider.setCustomParameters({
          prompt: 'select_account'
        });

        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        
        if (!credential?.accessToken) {
          throw new Error('No Google Workspace access token received. Please ensure you grant spreadsheet permissions.');
        }

        token = credential.accessToken;
        this.currentUser = result.user;
        email = result.user.email || undefined;
      }

      if (!token) {
        throw new Error('No Google Workspace access token received. Please complete the sign-in authorization.');
      }

      this.setToken(token, 3500);
      if (email) {
        try {
          localStorage.setItem(this.STORAGE_KEY_USER_EMAIL, email);
        } catch {}
      }

      storageService.updateGoogleSheetsConfig({ syncStatus: 'idle' });

      storageService.logAudit(
        'SYNC_SHEETS',
        'GOOGLE_SHEET',
        email || 'GOOGLE_WORKSPACE',
        `Google Workspace account authorized: ${email || 'Connected Account'}`
      );

      storageService.addNotification(
        'Google Account Connected',
        `Authorized as ${email || 'Google Account'} with Google Sheets & Drive permissions.`,
        'success',
        'sheets'
      );

      return {
        user: this.currentUser || undefined,
        token,
        email
      };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Google Sign-in popup was closed before completing authorization.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Only one sign-in popup can be active at a time.');
      }
      throw error;
    } finally {
      this.isSigningIn = false;
    }
  }

  public async signOutGoogle(): Promise<void> {
    await signOut(auth);
    this.clearAuthToken();
    this.currentUser = null;
  }

  // Generate All Formatted Sheets Data Structure for all AlphaERP Modules
  public generateAllSheetTabsData(): SheetTabDefinition[] {
    const data = storageService.getAllData();
    const {
      leads,
      quotes,
      projects,
      inventory,
      prs,
      pos,
      payments,
      salesReps,
      auditLogs,
      systemSettings,
      clients,
      vendors,
      employees,
      amcContracts
    } = data;
    const curr = systemSettings.currencySymbol || '₹';

    // 1. Executive Dashboard KPIs
    const totalWonSales = quotes.filter((q) => q.status === 'Awarded').reduce((s, q) => s + q.totalAmount, 0);
    const activePipeline = leads.filter((l) => l.status !== 'Awarded' && l.status !== 'Lost').reduce((s, l) => s + l.estimatedValue, 0);
    const totalInventoryValue = inventory.reduce((s, i) => s + i.currentStock * i.averageUnitCost, 0);
    const lowStockCount = inventory.filter((i) => i.availableStock <= i.reorderLevel).length;
    const pendingPRCount = prs.filter((p) => p.status === 'Pending Approval').length;
    const activePOCount = pos.filter((p) => p.status === 'Sent to Vendor' || p.status === 'Partially Received').length;
    const unpaidReceivables = payments.filter((p) => !p.isPayable && p.status !== 'Paid').reduce((s, p) => s + p.totalAmount, 0);
    const unpaidPayables = payments.filter((p) => p.isPayable && p.status !== 'Paid').reduce((s, p) => s + p.totalAmount, 0);

    const dashboardRows = [
      [`${systemSettings.companyName.toUpperCase()} - ENTERPRISE MANAGEMENT SYSTEM`],
      [`Live Synchronized: ${new Date().toLocaleString()}`, `Corporate PAN: ${systemSettings.pan}`, `GSTIN: ${systemSettings.gstin}`],
      [],
      ['METRIC CLASSIFICATION', 'KEY PERFORMANCE INDICATOR (KPI)', 'CURRENT VALUE', 'STATUS / BENCHMARK'],
      ['Revenue & Sales', 'Total Awarded Contract Sales', `${curr}${totalWonSales.toLocaleString()}`, 'Confirmed Turnkey Revenue'],
      ['Revenue & Sales', 'Active Sales Pipeline Value', `${curr}${activePipeline.toLocaleString()}`, `${leads.length} Active Leads in Funnel`],
      ['Revenue & Sales', 'Lead-to-Order Conversion Rate', `${((leads.filter((l) => l.status === 'Awarded').length / Math.max(1, leads.length)) * 100).toFixed(2)}%`, 'Target: > 35%'],
      ['Warehouse & Stock', 'Total Inventory Asset Value', `${curr}${totalInventoryValue.toLocaleString()}`, `${inventory.length} Stock SKUs Registered`],
      ['Warehouse & Stock', 'Deficit / Low Stock Alerts', `${lowStockCount} Items`, lowStockCount > 0 ? 'CRITICAL - PR REQUISITIONS ACTIVE' : 'STOCK OPTIMAL'],
      ['Procurement & PR/PO', 'Pending Purchase Requisitions (PR)', `${pendingPRCount} PRs`, pendingPRCount > 0 ? 'Awaiting Executive Signoff' : 'All Clear'],
      ['Procurement & PR/PO', 'Active Vendor POs Dispatched', `${activePOCount} POs`, 'Tracking Material Delivery'],
      ['Finance & Cashflow', 'Accounts Receivable (Client Pending)', `${curr}${unpaidReceivables.toLocaleString()}`, 'Milestone Handover Invoices'],
      ['Finance & Cashflow', 'Accounts Payable (Vendor Due)', `${curr}${unpaidPayables.toLocaleString()}`, 'OEM Credit Balances'],
      [],
      ['SALES TEAM MONTHLY QUOTA & COMMISSION LEADERBOARD'],
      ['Sales Representative', 'Monthly Quota', 'Achieved Sales', 'Quota Achievement %', 'Calculated Commission'],
      ...salesReps.map((r) => [
        r.name,
        `${curr}${r.monthlyQuota.toLocaleString()}`,
        `${curr}${r.achievedSalesMonth.toLocaleString()}`,
        `${((r.achievedSalesMonth / r.monthlyQuota) * 100).toFixed(2)}%`,
        `${curr}${r.calculatedCommission.toLocaleString()}`
      ])
    ];

    // 2. CRM Leads Pipeline
    const leadsRows = [
      [
        'Lead ID',
        'Company Name',
        'Contact Person',
        'Phone',
        'Email',
        'City',
        'HVAC System Type',
        'Capacity (TR)',
        'Est. Value',
        'Lead Source',
        'Pipeline Stage',
        'Priority',
        'Assigned Rep',
        'Created Date'
      ],
      ...leads.map((l) => [
        l.leadNumber,
        l.companyName,
        l.clientName,
        l.phone,
        l.email,
        l.city,
        l.hvacType,
        l.estimatedCapacityTR,
        l.estimatedValue,
        l.source,
        l.status,
        l.priority,
        l.assignedToName,
        new Date(l.createdAt).toLocaleDateString()
      ])
    ];

    // 3. Quotes & Proposals
    const quotesRows = [
      [
        'Quote Number',
        'Client / Company',
        'Project Title',
        'Date',
        'Valid Until',
        'Prepared By',
        'Line Items Count',
        'Subtotal',
        'Discount',
        'GST Amount',
        'Grand Total',
        'Estimated Cost',
        'Gross Margin %',
        'Quote Status'
      ],
      ...quotes.map((q) => [
        q.quoteNumber,
        q.companyName,
        q.projectTitle,
        q.date,
        q.validUntil,
        q.preparedBy,
        q.items.length,
        q.subtotal,
        q.discountAmount,
        q.taxAmount,
        q.totalAmount,
        q.totalCost,
        `${q.grossMarginPct.toFixed(2)}%`,
        q.status
      ])
    ];

    // 4. Projects & BOQs
    const projectsRows = [
      [
        'Project Code',
        'Project Name',
        'Client Name',
        'Quote Ref',
        'Contract Value',
        'Target Margin %',
        'Start Date',
        'Target Completion',
        'Project Status',
        'Progress %',
        'Project Manager',
        'Shortage Items Count',
        'PRs Created',
        'POs Issued',
        'Invoices Raised',
        'Payments Received'
      ],
      ...projects.map((p) => [
        p.projectNumber,
        p.projectName,
        p.clientName,
        p.quoteId,
        p.contractValue,
        `${p.targetMarginPct.toFixed(2)}%`,
        p.startDate,
        p.targetCompletionDate,
        p.status,
        `${p.progressPct}%`,
        p.projectManager,
        p.totalShortageItemsCount,
        p.prCount,
        p.poCount,
        p.invoicesGeneratedAmount,
        p.paymentsReceivedAmount
      ])
    ];

    // 5. Inventory & Warehouse
    const inventoryRows = [
      [
        'SKU Code',
        'Item Name',
        'HVAC Category',
        'Specification',
        'Brand / OEM',
        'Total Physical Stock',
        'Allocated to Projects',
        'Available Free Stock',
        'Reorder Threshold',
        'Unit of Measure',
        'Unit Cost',
        'Total Valuation',
        'Default Supplier',
        'Warehouse Location',
        'Stock Health Status'
      ],
      ...inventory.map((i) => [
        i.sku,
        i.name,
        i.category,
        i.specification,
        i.brand,
        i.currentStock,
        i.allocatedStock,
        i.availableStock,
        i.reorderLevel,
        i.unit,
        i.averageUnitCost,
        i.currentStock * i.averageUnitCost,
        i.defaultSupplier,
        i.warehouseLocation,
        i.availableStock <= 0 ? 'OUT OF STOCK / DEFICIT' : i.availableStock <= i.reorderLevel ? 'LOW STOCK ALERT' : 'HEALTHY'
      ])
    ];

    // 6. Purchase Requisitions (PR)
    const prRows = [
      [
        'PR Number',
        'Project Name',
        'Requested By',
        'Request Date',
        'Priority',
        'Items Count',
        'Est Total Amount',
        'PR Status',
        'Approved By',
        'Approval Date',
        'Converted PO Number'
      ],
      ...prs.map((p) => [
        p.prNumber,
        p.projectName,
        p.requestedBy,
        p.requestDate,
        p.priority,
        p.items.length,
        p.totalEstimatedAmount,
        p.status,
        p.approvedBy || 'N/A',
        p.approvedAt ? new Date(p.approvedAt).toLocaleDateString() : 'Pending',
        p.convertedPoNumber || 'N/A'
      ])
    ];

    // 7. Purchase Orders (PO)
    const poRows = [
      [
        'PO Number',
        'PR Reference',
        'Project Name',
        'Vendor Name',
        'Vendor Email',
        'Order Date',
        'Expected Delivery',
        'Subtotal',
        'Tax Amount',
        'Shipping',
        'Grand Total',
        'Payment Terms',
        'PO Status',
        'Vendor Status'
      ],
      ...pos.map((p) => [
        p.poNumber,
        p.prNumber || 'Direct PO',
        p.projectName,
        p.vendorName,
        p.vendorEmail,
        p.orderDate,
        p.expectedDeliveryDate,
        p.subtotal,
        p.taxAmount,
        p.shippingCharges,
        p.grandTotal,
        p.paymentTerms,
        p.status,
        p.vendorAcknowledgmentStatus || 'Pending'
      ])
    ];

    // 8. Payments & Invoices
    const paymentRows = [
      [
        'Invoice / Voucher #',
        'Classification',
        'Reference Title',
        'Party (Client / Vendor)',
        'Payment Type',
        'Taxable Amount',
        'Tax Amount',
        'Total Amount',
        'Due Date',
        'Payment Status',
        'Paid Date',
        'Payment Mode',
        'Transaction Ref / UTR'
      ],
      ...payments.map((p) => [
        p.invoiceNumber,
        p.isPayable ? 'Accounts Payable (Vendor)' : 'Accounts Receivable (Client)',
        p.referenceTitle,
        p.clientOrVendorName,
        p.paymentType,
        p.amount,
        p.taxAmount,
        p.totalAmount,
        p.dueDate,
        p.status,
        p.paidDate || 'Unpaid',
        p.paymentMethod || 'N/A',
        p.transactionReference || 'N/A'
      ])
    ];

    // 9. Sales Quotas & Commissions
    const salesRows = [
      [
        'Sales Representative',
        'Email',
        'Phone',
        'Monthly Target',
        'Achieved Month Sales',
        'Monthly Target Achievement %',
        'Won Deals Count',
        'Active Pipeline',
        'Base Comm Rate %',
        'Total Calculated Commission'
      ],
      ...salesReps.map((r) => [
        r.name,
        r.email,
        r.phone,
        r.monthlyQuota,
        r.achievedSalesMonth,
        `${((r.achievedSalesMonth / r.monthlyQuota) * 100).toFixed(2)}%`,
        r.wonDealsCount,
        r.activePipelineValue,
        `${r.baseCommissionPct}%`,
        r.calculatedCommission
      ])
    ];

    // 10. Audit Logs
    const auditRows = [
      ['Timestamp', 'User Name', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Audit Summary'],
      ...auditLogs.map((a) => [
        new Date(a.timestamp).toLocaleString(),
        a.userName,
        a.userRole.toUpperCase(),
        a.action,
        a.entityType,
        a.entityId,
        a.summary
      ])
    ];

    // 11. Clients Master
    const clientRows = [
      ['Client ID', 'Client Code', 'Company Name', 'Contact Person', 'Email', 'Phone', 'City', 'GSTIN', 'Credit Limit', 'Payment Terms', 'Status'],
      ...(clients || []).map((c) => [
        c.id,
        c.clientCode || c.id,
        c.companyName,
        c.contactPerson,
        c.email,
        c.phone,
        c.city || 'N/A',
        c.gstin || 'N/A',
        c.creditLimit || 0,
        c.paymentTerms || 'Net 30',
        c.status || 'Active'
      ])
    ];

    // 12. Vendors Master
    const vendorRows = [
      ['Vendor ID', 'Vendor Name', 'Category', 'Contact Person', 'Email', 'Phone', 'City', 'GSTIN', 'PAN', 'Rating', 'Status'],
      ...(vendors || []).map((v) => [
        v.id,
        v.name,
        v.category || 'General HVAC',
        v.contactPerson || v.name,
        v.email,
        v.phone,
        v.city || 'N/A',
        v.gstin || 'N/A',
        v.pan || 'N/A',
        v.rating || 5,
        v.status || 'Active'
      ])
    ];

    // 13. Employees & HR Master
    const employeeRows = [
      ['Emp ID', 'Emp Code', 'Full Name', 'Department', 'Designation', 'Official Email', 'Phone', 'Date of Joining', 'Employment Status'],
      ...(employees || []).map((e) => [
        e.id,
        e.empCode || e.code || e.id,
        e.fullName || e.name || 'Staff',
        e.department || 'Operations',
        e.designation || 'Staff',
        e.officialEmail || e.email || 'N/A',
        e.phone || 'N/A',
        e.dateOfJoining || e.joiningDate || 'N/A',
        e.employmentStatus || e.status || 'Active'
      ])
    ];

    // 14. AMC & Maintenance Contracts
    const amcRows = [
      [
        'Contract Number',
        'Client / Company',
        'Site Address',
        'Plan Tier',
        'Annual Contract Value (ACV)',
        'Start Date',
        'End Date',
        'Renewal / Contract Status',
        'PPM Frequency / Year',
        'SLA Response (Hours)',
        'Contact Person',
        'Contact Phone',
        'Contact Email',
        'Equipment Units Covered',
        'Emergency 24x7 Coverage'
      ],
      ...(amcContracts || []).map((c: any) => [
        c.contractNumber,
        c.clientName,
        c.siteAddress,
        c.planType,
        c.annualContractValue,
        c.startDate,
        c.endDate,
        c.status,
        c.ppmFrequencyPerYear || 4,
        `${c.slaResponseHours || 4} Hours`,
        c.contactPerson,
        c.contactPhone,
        c.contactEmail || 'N/A',
        (c.equipmentCovered || []).map((eq: any) => `${eq.qty}x ${eq.model || eq.equipmentType}`).join('; ') || 'Standard Package',
        c.emergencyBreakdownCoverage ? 'YES (24x7 Included)' : 'NO (Standard Business Hours)'
      ])
    ];

    return [
      { title: '📊 Management Dashboard & KPIs', values: dashboardRows },
      { title: '🎯 CRM Leads Pipeline', values: leadsRows },
      { title: '📋 Quotes & Proposals', values: quotesRows },
      { title: '🏗️ Projects & BOQs', values: projectsRows },
      { title: '📦 Inventory & Warehouse', values: inventoryRows },
      { title: '📝 Purchase Requisitions', values: prRows },
      { title: '🛒 Purchase Orders (PO)', values: poRows },
      { title: '💰 Payments & Invoices', values: paymentRows },
      { title: '🏢 Clients Master', values: clientRows },
      { title: '🏭 Vendors Master', values: vendorRows },
      { title: '👔 Employees & HR Master', values: employeeRows },
      { title: '🔧 AMC_Service_Contracts', values: amcRows },
      { title: '👥 Sales Quota & Comm', values: salesRows },
      { title: '📜 Audit Trail Logs', values: auditRows }
    ];
  }

  // Generates complete serialized state chunked into spreadsheet rows
  public generateDataVaultSheetTab(): SheetTabDefinition {
    const allData = storageService.getAllData();
    const CHUNK_SIZE = 35000; // Well within Sheets 50,000 char per cell limit
    const vaultRows: (string | number)[][] = [
      ['COLLECTION_KEY', 'RECORD_COUNT', 'CHUNK_INDEX', 'TOTAL_CHUNKS', 'PAYLOAD_CHUNK', 'UPDATED_AT', 'APP_VERSION']
    ];

    const keysToBackup = [
      // Master collections
      'systemSettings',
      'clients',
      'vendors',
      'inventory',
      'salesReps',
      'costCenters',
      'taxSlabs',
      'paymentTerms',
      'chartOfAccounts',
      'employees',
      'departments',
      'designationGrades',
      'shifts',
      'companyHolidays',
      'policyDocuments',
      'biometricDevices',
      'trainingCourses',
      // Transaction collections
      'leads',
      'quotes',
      'projects',
      'workOrders',
      'amcContracts',
      'ppmVisits',
      'breakdownTickets',
      'prs',
      'pos',
      'grns',
      'payments',
      'journalVouchers',
      'tdsRecords',
      'attendanceRecords',
      'timesheetEntries',
      'leaveApplications',
      'payrollMonths',
      'jobRequisitions',
      'jobCandidates',
      'expenseClaims',
      'travelRequests',
      'resignationRecords',
      'employeeAssets',
      'employeeDocuments',
      'onboardingTasks',
      'attendanceRegularizations',
      'appraisalCycles',
      'employeeAppraisals',
      'skillMatrices',
      'grievanceTickets',
      'workforceForecasts',
      'biometricPunchLogs',
      'auditLogs'
    ];

    const nowStr = new Date().toISOString();
    for (const key of keysToBackup) {
      const val = (allData as any)[key];
      if (val === undefined || val === null) continue;
      const count = Array.isArray(val) ? val.length : 1;
      const jsonStr = JSON.stringify(val);
      const totalChunks = Math.max(1, Math.ceil(jsonStr.length / CHUNK_SIZE));
      for (let c = 0; c < totalChunks; c++) {
        const chunk = jsonStr.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
        vaultRows.push([
          key,
          count,
          c,
          totalChunks,
          chunk,
          nowStr,
          '2.5'
        ]);
      }
    }

    return {
      title: '💾 AlphaERP System Data Vault',
      values: vaultRows
    };
  }

  // Create a brand new authentic Google Sheet in the user's Google Drive
  public async createMasterGoogleSheet(): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    storageService.updateGoogleSheetsConfig({ syncStatus: 'syncing' });

    try {
      // Ensure we have a valid token
      let token = this.getAccessToken();
      if (!token) {
        const authRes = await this.signInWithGoogle();
        token = authRes.token;
      }

      const tabs = this.generateAllSheetTabsData();
      const vaultTab = this.generateDataVaultSheetTab();
      const allTabs = [...tabs, vaultTab];
      const settings = storageService.getSystemSettings();

      // 1. Create Spreadsheet with all tabs including Data Vault
      const title = `${settings.appTitle || 'AlphaERP'} Master Database - ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      
      const createResponse = await this.fetchWithAuth('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title
          },
          sheets: allTabs.map((tab, idx) => ({
            properties: {
              sheetId: idx,
              title: tab.title,
              gridProperties: {
                frozenRowCount: 1
              }
            }
          }))
        })
      });

      if (!createResponse.ok) {
        const errData = await createResponse.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Google Sheets API Error: ${createResponse.statusText}`);
      }

      const createdSheet = await createResponse.json();
      const spreadsheetId: string = createdSheet.spreadsheetId;
      const spreadsheetUrl: string = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

      // 2. Batch Update cell values for all sheets
      const dataPayload = allTabs.map((tab) => ({
        range: `'${tab.title}'!A1`,
        values: tab.values
      }));

      const updateResponse = await this.fetchWithAuth(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            valueInputOption: 'USER_ENTERED',
            data: dataPayload
          })
        }
      );

      if (!updateResponse.ok) {
        console.warn('Initial data batch update warning:', await updateResponse.text());
      }

      // Save real spreadsheet in storage service
      storageService.updateGoogleSheetsConfig({
        spreadsheetId,
        spreadsheetUrl,
        spreadsheetName: title,
        lastSyncAt: new Date().toISOString(),
        lastBackupAt: new Date().toISOString(),
        syncStatus: 'success'
      });

      storageService.logAudit(
        'SYNC_SHEETS',
        'GOOGLE_SHEET',
        spreadsheetId,
        `Created master spreadsheet with ${allTabs.length} tabs including AlphaERP Data Vault: ${title}`
      );

      storageService.addNotification(
        'Google Sheet Created & Synced',
        `Created master spreadsheet in Google Drive with ${allTabs.length} synchronized tabs and Data Vault.`,
        'success',
        'sheets'
      );

      return { spreadsheetId, spreadsheetUrl };
    } catch (e: any) {
      storageService.updateGoogleSheetsConfig({ syncStatus: 'error' });
      storageService.addNotification('Google Sheet Creation Failed', e.message || 'Failed to create Google Spreadsheet', 'alert', 'sheets');
      throw e;
    }
  }

  // Backup all master data and transaction data to the linked Google Sheet
  public async backupToGoogleSheet(targetSheetId?: string): Promise<{
    success: boolean;
    spreadsheetUrl: string;
    stats: GoogleSheetBackupStats;
  }> {
    storageService.updateGoogleSheetsConfig({ syncStatus: 'syncing' });

    try {
      const config = storageService.getGoogleSheetsConfig();
      let spreadsheetId = targetSheetId || config.spreadsheetId;

      let token = this.getAccessToken();
      if (!token) {
        const authRes = await this.signInWithGoogle();
        token = authRes.token;
      }

      if (!spreadsheetId) {
        // If no sheet is linked yet, create a new master sheet
        const created = await this.createMasterGoogleSheet();
        spreadsheetId = created.spreadsheetId;
      }

      const tabs = this.generateAllSheetTabsData();
      const vaultTab = this.generateDataVaultSheetTab();
      const allTabsToSync = [...tabs, vaultTab];

      const metaRes = await this.fetchWithAuth(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`);

      if (metaRes.status === 404) {
        throw new Error(`The linked Google Sheet (ID: ${spreadsheetId}) was not found in Google Drive. Please verify the Sheet ID.`);
      }
      if (!metaRes.ok) {
        const err = await metaRes.json().catch(() => ({}));
        throw new Error(err.error?.message || `Failed to access Google Sheet (Status ${metaRes.status})`);
      }

      const sheetMeta = await metaRes.json();
      const existingTitles: string[] = (sheetMeta.sheets || []).map((s: any) => s.properties?.title);

      // Create any missing sheet tabs (including the vault tab)
      const missingTabs = allTabsToSync.filter((t) => !existingTitles.includes(t.title));
      if (missingTabs.length > 0) {
        await this.fetchWithAuth(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            requests: missingTabs.map((t) => ({
              addSheet: {
                properties: {
                  title: t.title
                }
              }
            }))
          })
        });
      }

      // Clear the vault sheet tab first to prevent residual rows from previous backups
      await this.fetchWithAuth(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(vaultTab.title)}'!A1:Z5000:clear`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        false
      ).catch((err) => console.warn('Clear vault range notice:', err));

      // Batch update data across all tabs
      const dataPayload = allTabsToSync.map((tab) => ({
        range: `'${tab.title}'!A1`,
        values: tab.values
      }));

      const batchUpdateRes = await this.fetchWithAuth(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            valueInputOption: 'USER_ENTERED',
            data: dataPayload
          })
        }
      );

      if (!batchUpdateRes.ok) {
        const err = await batchUpdateRes.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Failed to update Google Sheet values');
      }

      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
      const allData = storageService.getAllData();

      const masterCounts: Record<string, number> = {
        'System Settings': 1,
        'Clients Master': (allData.clients || []).length,
        'Vendors Master': (allData.vendors || []).length,
        'Inventory SKUs': (allData.inventory || []).length,
        'Sales Reps & Targets': (allData.salesReps || []).length,
        'Cost Centers': (allData.costCenters || []).length,
        'Tax Slabs': (allData.taxSlabs || []).length,
        'Payment Terms': (allData.paymentTerms || []).length,
        'Chart of Accounts': (allData.chartOfAccounts || []).length,
        'Employees & Staff': (allData.employees || []).length,
        'Departments': (allData.departments || []).length,
        'Designation Grades': (allData.designations || []).length,
        'Work Shifts': (allData.shifts || []).length,
        'Company Holidays': (allData.holidays || []).length
      };

      const transactionCounts: Record<string, number> = {
        'CRM Leads Pipeline': (allData.leads || []).length,
        'Quotes & Proposals': (allData.quotes || []).length,
        'Projects & BOQs': (allData.projects || []).length,
        'Work Orders': (allData.workOrders || []).length,
        'Purchase Requisitions': (allData.prs || []).length,
        'Purchase Orders': (allData.pos || []).length,
        'Goods Receipt Notes': ((allData as any).grns || (allData as any).goodsReceiptNotes || []).length,
        'Payments & Invoices': (allData.payments || []).length,
        'Journal Vouchers': (allData.journalVouchers || []).length,
        'TDS Filings': (allData.tdsRecords || []).length,
        'Attendance Records': (allData.attendanceRecords || []).length,
        'Timesheet Entries': (allData.timesheetEntries || []).length,
        'Leave Applications': (allData.leaveApplications || []).length,
        'Payroll Cycles': (allData.payrollMonths || []).length,
        'Audit Logs': (allData.auditLogs || []).length
      };

      const totalMasterRecords = Object.values(masterCounts).reduce((a, b) => a + b, 0);
      const totalTransactionRecords = Object.values(transactionCounts).reduce((a, b) => a + b, 0);
      const nowStr = new Date().toISOString();

      const stats: GoogleSheetBackupStats = {
        timestamp: nowStr,
        spreadsheetId,
        spreadsheetUrl,
        totalMasterRecords,
        totalTransactionRecords,
        masterCounts,
        transactionCounts
      };

      storageService.updateGoogleSheetsConfig({
        spreadsheetId,
        spreadsheetUrl,
        lastSyncAt: nowStr,
        lastBackupAt: nowStr,
        lastBackupStats: stats,
        syncStatus: 'success'
      });

      storageService.logAudit(
        'BACKUP_CREATE',
        'GOOGLE_SHEET',
        spreadsheetId,
        `Backed up ${totalMasterRecords} master records and ${totalTransactionRecords} transaction records to Google Sheet.`
      );

      storageService.addNotification(
        'Google Sheet Backup Completed',
        `Backed up ${totalMasterRecords} master records and ${totalTransactionRecords} transaction records across ${allTabsToSync.length} tabs.`,
        'success',
        'sheets'
      );

      return { success: true, spreadsheetUrl, stats };
    } catch (e: any) {
      storageService.updateGoogleSheetsConfig({ syncStatus: 'error' });
      storageService.addNotification('Google Sheet Backup Failed', e.message || 'Error communicating with Google Sheets', 'alert', 'sheets');
      throw e;
    }
  }

  // Synchronize ERP records to the currently linked spreadsheet (calls backupToGoogleSheet)
  public async syncToGoogleSheet(targetSheetId?: string): Promise<{ success: boolean; spreadsheetUrl: string }> {
    const res = await this.backupToGoogleSheet(targetSheetId);
    return { success: res.success, spreadsheetUrl: res.spreadsheetUrl };
  }

  // Previews data in linked Google Sheet without modifying current state
  public async previewRestoreFromGoogleSheet(targetSheetId?: string): Promise<GoogleSheetRestorePreview> {
    const config = storageService.getGoogleSheetsConfig();
    const spreadsheetId = targetSheetId || config.spreadsheetId;

    if (!spreadsheetId) {
      throw new Error('No Google Sheet is currently linked. Please link a Google Sheet first.');
    }

    const metaRes = await this.fetchWithAuth(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`);

    if (!metaRes.ok) {
      const err = await metaRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch spreadsheet metadata (HTTP ${metaRes.status})`);
    }

    const sheetMeta = await metaRes.json();
    const spreadsheetTitle = sheetMeta.properties?.title || 'Linked Google Sheet';
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    const sheets: any[] = sheetMeta.sheets || [];
    const vaultSheet = sheets.find(
      (s) =>
        s.properties?.title?.includes('AlphaERP System Data Vault') ||
        s.properties?.title?.includes('Data Vault')
    );

    const masterCounts: Record<string, number> = {};
    const transactionCounts: Record<string, number> = {};
    let backupTimestamp: string | undefined;
    let schemaVersion: string | undefined;

    if (vaultSheet) {
      const vaultTitle = vaultSheet.properties.title;
      const valuesRes = await this.fetchWithAuth(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(vaultTitle)}'!A2:G3000`
      );

      if (valuesRes.ok) {
        const valuesData = await valuesRes.json();
        const rows: any[][] = valuesData.values || [];

        for (const row of rows) {
          if (!row || row.length < 5) continue;
          const key = String(row[0] || '').trim();
          const count = Number(row[1]) || 0;
          const chunkIndex = Number(row[2]) || 0;
          const timestamp = row[5] ? String(row[5]) : undefined;
          const ver = row[6] ? String(row[6]) : undefined;
          if (timestamp && !backupTimestamp) backupTimestamp = timestamp;
          if (ver && !schemaVersion) schemaVersion = ver;

          if (chunkIndex === 0) {
            const label = formatCollectionLabel(key);
            const isMaster = [
              'systemSettings',
              'clients',
              'vendors',
              'inventory',
              'salesReps',
              'costCenters',
              'taxSlabs',
              'paymentTerms',
              'chartOfAccounts',
              'employees',
              'departments',
              'designationGrades',
              'shifts',
              'companyHolidays',
              'policyDocuments',
              'biometricDevices',
              'trainingCourses'
            ].includes(key);

            if (isMaster) {
              masterCounts[label] = count;
            } else {
              transactionCounts[label] = count;
            }
          }
        }
      }
    }

    // Fallback: If vault sheet was absent or empty, inspect table tabs
    if (Object.keys(masterCounts).length === 0 && Object.keys(transactionCounts).length === 0) {
      for (const sheet of sheets) {
        const title = sheet.properties?.title || '';
        const rowCount = Math.max(0, (sheet.properties?.gridProperties?.rowCount || 1) - 1);
        if (title.includes('Dashboard')) continue;
        if (title.includes('Lead') || title.includes('CRM')) transactionCounts['CRM Leads Pipeline'] = rowCount;
        else if (title.includes('Quote')) transactionCounts['Quotes & Proposals'] = rowCount;
        else if (title.includes('Project')) transactionCounts['Projects & BOQs'] = rowCount;
        else if (title.includes('Inventory')) masterCounts['Inventory SKUs'] = rowCount;
        else if (title.includes('Requisition') || title.includes('PR')) transactionCounts['Purchase Requisitions'] = rowCount;
        else if (title.includes('Order') || title.includes('PO')) transactionCounts['Purchase Orders'] = rowCount;
        else if (title.includes('Payment') || title.includes('Invoice')) transactionCounts['Payments & Invoices'] = rowCount;
        else if (title.includes('Client')) masterCounts['Clients Master'] = rowCount;
        else if (title.includes('Vendor')) masterCounts['Vendors Master'] = rowCount;
        else if (title.includes('Employee')) masterCounts['Employees & Staff'] = rowCount;
        else if (title.includes('Quota')) masterCounts['Sales Reps & Targets'] = rowCount;
        else if (title.includes('Audit')) transactionCounts['Audit Logs'] = rowCount;
      }
    }

    const totalMasterRecords = Object.values(masterCounts).reduce((a, b) => a + b, 0);
    const totalTransactionRecords = Object.values(transactionCounts).reduce((a, b) => a + b, 0);

    return {
      spreadsheetTitle,
      spreadsheetId,
      spreadsheetUrl,
      vaultFound: Boolean(vaultSheet),
      backupTimestamp,
      schemaVersion,
      totalMasterRecords,
      totalTransactionRecords,
      masterCounts,
      transactionCounts
    };
  }

  // Restores all master data and transaction data from the linked Google Sheet
  public async restoreFromGoogleSheet(targetSheetId?: string): Promise<GoogleSheetRestoreResult> {
    storageService.updateGoogleSheetsConfig({ syncStatus: 'syncing' });

    try {
      const config = storageService.getGoogleSheetsConfig();
      const spreadsheetId = targetSheetId || config.spreadsheetId;

      if (!spreadsheetId) {
        throw new Error('No Google Sheet linked. Please link a Google Sheet before restoring.');
      }

      // 1. Fetch spreadsheet metadata
      const metaRes = await this.fetchWithAuth(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`);

      if (!metaRes.ok) {
        const err = await metaRes.json().catch(() => ({}));
        throw new Error(err.error?.message || `Failed to access spreadsheet (HTTP ${metaRes.status})`);
      }

      const sheetMeta = await metaRes.json();
      const sheets: any[] = sheetMeta.sheets || [];
      const vaultSheet = sheets.find(
        (s) =>
          s.properties?.title?.includes('AlphaERP System Data Vault') ||
          s.properties?.title?.includes('Data Vault')
      );

      let restoredData: Record<string, any> = {};
      let vaultFound = false;

      if (vaultSheet) {
        vaultFound = true;
        const vaultTitle = vaultSheet.properties.title;
        const valuesRes = await this.fetchWithAuth(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(vaultTitle)}'!A2:G5000`
        );

        if (valuesRes.ok) {
          const valuesData = await valuesRes.json();
          const rows: any[][] = valuesData.values || [];

          // Reassemble chunks
          const chunksByKey: Record<string, { totalChunks: number; chunks: { index: number; data: string }[] }> = {};
          for (const row of rows) {
            if (!row || row.length < 5) continue;
            const key = String(row[0] || '').trim();
            if (!key || key === 'COLLECTION_KEY') continue;
            const chunkIndex = Number(row[2]) || 0;
            const totalChunks = Number(row[3]) || 1;
            const chunk = String(row[4] || '');

            if (!chunksByKey[key]) {
              chunksByKey[key] = { totalChunks, chunks: [] };
            }
            chunksByKey[key].chunks.push({ index: chunkIndex, data: chunk });
          }

          for (const [key, item] of Object.entries(chunksByKey)) {
            item.chunks.sort((a, b) => a.index - b.index);
            const fullStr = item.chunks.map((c) => c.data).join('');
            try {
              restoredData[key] = JSON.parse(fullStr);
            } catch (err) {
              console.error(`Failed to parse vault collection ${key}:`, err);
            }
          }
        }
      }

      // Fallback: If vault was not present or empty, parse standard table tabs
      if (Object.keys(restoredData).length === 0) {
        restoredData = await this.fallbackParseStandardTabs(spreadsheetId, sheets);
      }

      if (Object.keys(restoredData).length === 0) {
        throw new Error('No valid AlphaERP master or transaction data could be located in the linked Google Sheet.');
      }

      // 2. Automated Safety Snapshot before overwriting database state
      storageService.recordCriticalSnapshot(
        'MANUAL_USER',
        'GoogleSheet' as any,
        'Automated safety snapshot created before Google Sheet restoration'
      );

      // 3. Import into database with detailed report
      const importReport = storageService.importFullDatabaseWithReport(JSON.stringify(restoredData));

      if (!importReport.success) {
        throw new Error(importReport.error || 'Failed to restore database from Google Sheet data.');
      }

      const nowStr = new Date().toISOString();
      const result: GoogleSheetRestoreResult = {
        success: true,
        vaultFound,
        totalMasterRecords: importReport.totalMaster,
        totalTransactionRecords: importReport.totalTransactions,
        masterCounts: importReport.masterCounts,
        transactionCounts: importReport.transactionCounts,
        restoredAt: nowStr
      };

      storageService.updateGoogleSheetsConfig({
        lastRestoreAt: nowStr,
        lastRestoreStats: result,
        syncStatus: 'success'
      });

      storageService.logAudit(
        'BACKUP_RESTORE',
        'GOOGLE_SHEET',
        spreadsheetId,
        `Restored ${importReport.totalMaster} master records and ${importReport.totalTransactions} transaction records from Google Sheet.`
      );

      storageService.addNotification(
        'Google Sheet Restore Completed',
        `Restored ${importReport.totalMaster} master records and ${importReport.totalTransactions} transaction records into AlphaERP.`,
        'success',
        'sheets'
      );

      return result;
    } catch (e: any) {
      storageService.updateGoogleSheetsConfig({ syncStatus: 'error' });
      storageService.addNotification(
        'Google Sheet Restore Failed',
        e.message || 'Error restoring from Google Sheets',
        'alert',
        'sheets'
      );
      throw e;
    }
  }

  // Parses standard tabular tabs as a fallback when Data Vault tab is absent
  private async fallbackParseStandardTabs(
    spreadsheetId: string,
    sheets: any[]
  ): Promise<Record<string, any>> {
    const sheetTitles: string[] = (sheets || []).map((s: any) => s.properties?.title || '');
    const restored: Record<string, any> = {};

    for (const title of sheetTitles) {
      if (title.includes('Dashboard')) continue;

      try {
        const res = await this.fetchWithAuth(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(title)}'!A1:Z500`,
          {},
          false
        );
        if (!res.ok) continue;
        const data = await res.json();
        const rows: any[][] = data.values || [];
        if (rows.length < 2) continue;

        const dataRows = rows.slice(1);

        if (title.includes('Leads') || title.includes('CRM')) {
          restored.leads = dataRows.map((r, idx) => ({
            id: `lead-restored-${idx + 1}`,
            leadNumber: r[0] || `LD-${idx + 100}`,
            companyName: r[1] || 'Lead Client',
            clientName: r[2] || 'Contact Person',
            phone: r[3] || '',
            email: r[4] || '',
            city: r[5] || 'Mumbai',
            hvacType: r[6] || 'VRV/VRF Systems',
            estimatedCapacityTR: Number(r[7]) || 25,
            estimatedValue: Number(r[8]) || 500000,
            source: r[9] || 'Website',
            status: r[10] || 'New Lead',
            priority: r[11] || 'Medium',
            assignedToName: r[12] || 'Unassigned',
            createdAt: r[13] ? new Date(r[13]).toISOString() : new Date().toISOString()
          }));
        } else if (title.includes('Inventory') || title.includes('Warehouse')) {
          restored.inventory = dataRows.map((r, idx) => ({
            id: `inv-restored-${idx + 1}`,
            sku: r[0] || `SKU-${idx + 100}`,
            name: r[1] || 'HVAC Equipment',
            category: r[2] || 'Equipment',
            brand: r[3] || 'Daikin',
            currentStock: Number(r[4]) || 0,
            allocatedStock: Number(r[5]) || 0,
            availableStock: Number(r[6]) || 0,
            uom: r[7] || 'Nos',
            reorderLevel: Number(r[8]) || 5,
            averageUnitCost: Number(r[9]) || 0,
            location: r[11] || 'Main Warehouse'
          }));
        } else if (title.includes('Clients')) {
          restored.clients = dataRows.map((r, idx) => ({
            id: r[0] || `client-restored-${idx + 1}`,
            name: r[1] || 'Corporate Client',
            companyName: r[2] || r[1] || 'Corporate Client',
            contactPerson: r[3] || r[1],
            email: r[4] || '',
            phone: r[5] || '',
            city: r[6] || 'Mumbai',
            gstin: r[7] || '',
            creditLimit: Number(r[8]) || 1000000,
            paymentTerms: r[9] || 'Net 30',
            status: r[10] || 'Active'
          }));
        } else if (title.includes('Vendors')) {
          restored.vendors = dataRows.map((r, idx) => ({
            id: r[0] || `vendor-restored-${idx + 1}`,
            name: r[1] || 'OEM Vendor',
            category: r[2] || 'Equipment OEM',
            contactPerson: r[3] || r[1],
            email: r[4] || '',
            phone: r[5] || '',
            city: r[6] || 'Mumbai',
            gstin: r[7] || '',
            pan: r[8] || '',
            rating: Number(r[9]) || 5,
            status: r[10] || 'Active'
          }));
        }
      } catch (err) {
        console.warn(`Failed to parse standard tab ${title}:`, err);
      }
    }

    return restored;
  }

  // Link an existing Google Sheet by URL or ID
  public async linkExistingGoogleSheet(urlOrId: string): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    const raw = urlOrId.trim();
    if (!raw) {
      throw new Error('Please enter a Google Sheet URL or ID.');
    }

    // Extract ID from URL if full URL is given
    // Example: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
    let sheetId = raw;
    const match = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      sheetId = match[1];
    }

    // Verify sheet exists and is accessible
    const metaRes = await this.fetchWithAuth(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`);

    if (!metaRes.ok) {
      if (metaRes.status === 404) {
        throw new Error(`Google Sheet not found (404). Please verify that the spreadsheet exists in your Google Drive and the link is correct.`);
      } else if (metaRes.status === 403) {
        throw new Error(`Access denied (403). Please make sure your Google account has edit permissions for this spreadsheet.`);
      }
      const err = await metaRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to connect to Google Sheet (HTTP ${metaRes.status})`);
    }

    const sheetMeta = await metaRes.json();
    const spreadsheetTitle = sheetMeta.properties?.title || 'Connected Google Sheet';
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

    // Save configuration
    storageService.updateGoogleSheetsConfig({
      spreadsheetId: sheetId,
      spreadsheetUrl,
      spreadsheetName: spreadsheetTitle,
      lastSyncAt: new Date().toISOString(),
      syncStatus: 'idle'
    });

    storageService.logAudit(
      'UPDATE',
      'GOOGLE_SHEET',
      sheetId,
      `Linked existing Google Spreadsheet: "${spreadsheetTitle}" (ID: ${sheetId})`
    );

    // Push initial sync
    await this.syncToGoogleSheet(sheetId);

    return { spreadsheetId: sheetId, spreadsheetUrl };
  }

  // Unlink current sheet
  public unlinkCurrentSheet(): void {
    const config = storageService.getGoogleSheetsConfig();
    const oldId = config.spreadsheetId;

    storageService.updateGoogleSheetsConfig({
      spreadsheetId: null,
      spreadsheetUrl: null,
      spreadsheetName: 'AlphaERP Master Database',
      lastSyncAt: null,
      syncStatus: 'idle'
    });

    if (oldId) {
      storageService.logAudit('UPDATE', 'GOOGLE_SHEET', oldId, 'Disconnected Google Sheet from AlphaERP');
    }

    storageService.addNotification('Google Sheet Disconnected', 'You can create a new sheet or link a different one.', 'info', 'sheets');
  }

  // Export individual tab as CSV
  public exportTabAsCsv(tabIndex: number = 0) {
    const tabs = this.generateAllSheetTabsData();
    const tab = tabs[tabIndex] || tabs[0];

    const csvContent = tab.values
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${tab.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const googleSheetsService = new GoogleSheetsService();
