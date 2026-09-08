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

  constructor() {
    // Load persistently saved token or API key from localStorage
    try {
      const savedToken = localStorage.getItem(this.STORAGE_KEY_TOKEN);
      const savedExpiry = localStorage.getItem(this.STORAGE_KEY_EXPIRY);
      if (savedToken && savedExpiry && Number(savedExpiry) > Date.now()) {
        this.accessToken = savedToken;
        this.tokenExpiry = Number(savedExpiry);
      }
    } catch {
      // localStorage may be restricted in sandbox
    }

    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  }

  public getCurrentFirebaseUser(): FirebaseUser | null {
    return this.currentUser || auth.currentUser;
  }

  public hasValidToken(): boolean {
    return !!this.accessToken && Date.now() < this.tokenExpiry;
  }

  public setToken(token: string, expiresInSeconds: number = 86400 * 30) {
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
    // Check saved config in storageService
    const config = storageService.getGoogleSheetsConfig();
    if (config?.apiKey && config.apiKey.trim()) {
      return config.apiKey.trim();
    }
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY_TOKEN);
      if (saved) return saved;
    } catch {}
    return null;
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
      this.setToken(cleanApiKey, 86400 * 30);
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
  public async signInWithGoogle(): Promise<{ user: FirebaseUser; token: string }> {
    if (this.isSigningIn) {
      throw new Error('Google Sign-In is already in progress.');
    }

    try {
      this.isSigningIn = true;
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (!credential?.accessToken) {
        throw new Error('No Google Workspace access token received. Please ensure you grant spreadsheet permissions.');
      }

      this.currentUser = result.user;
      this.setToken(credential.accessToken, 3600);

      storageService.logAudit(
        'SYNC_SHEETS',
        'GOOGLE_SHEET',
        result.user.uid,
        `Google Workspace account authorized: ${result.user.email} (${result.user.displayName || 'User'})`
      );

      storageService.addNotification(
        'Google Account Connected',
        `Authorized as ${result.user.email} with Google Sheets & Drive permissions.`,
        'success',
        'sheets'
      );

      return {
        user: result.user,
        token: credential.accessToken
      };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      // Fallback: If popup was closed or failed
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
    this.accessToken = null;
    this.tokenExpiry = 0;
    this.currentUser = null;
  }

  // Generate All Formatted Sheets Data Structure for all 10 AlphaERP Modules
  public generateAllSheetTabsData(): SheetTabDefinition[] {
    const data = storageService.getAllData();
    const { leads, quotes, projects, inventory, prs, pos, payments, salesReps, auditLogs, systemSettings } = data;
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

    return [
      { title: '📊 Management Dashboard & KPIs', values: dashboardRows },
      { title: '🎯 CRM Leads Pipeline', values: leadsRows },
      { title: '📋 Quotes & Proposals', values: quotesRows },
      { title: '🏗️ Projects & BOQs', values: projectsRows },
      { title: '📦 Inventory & Warehouse', values: inventoryRows },
      { title: '📝 Purchase Requisitions', values: prRows },
      { title: '🛒 Purchase Orders (PO)', values: poRows },
      { title: '💰 Payments & Invoices', values: paymentRows },
      { title: '👥 Sales Quota & Comm', values: salesRows },
      { title: '📜 Audit Trail Logs', values: auditRows }
    ];
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
      const settings = storageService.getSystemSettings();

      // 1. Create Spreadsheet with all 10 tabs
      const title = `${settings.appTitle || 'AlphaERP'} Master Database - ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      
      const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title
          },
          sheets: tabs.map((tab, idx) => ({
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
      const dataPayload = tabs.map((tab) => ({
        range: `'${tab.title}'!A1`,
        values: tab.values
      }));

      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
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
        syncStatus: 'success'
      });

      storageService.logAudit(
        'SYNC_SHEETS',
        'GOOGLE_SHEET',
        spreadsheetId,
        `Created brand new live Google Master Spreadsheet with ${tabs.length} tabs in Google Drive: ${title}`
      );

      storageService.addNotification(
        'Google Sheet Created & Synced',
        `Created master spreadsheet in Google Drive with ${tabs.length} synced tabs.`,
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

  // Synchronize ERP records to the currently linked spreadsheet
  public async syncToGoogleSheet(targetSheetId?: string): Promise<{ success: boolean; spreadsheetUrl: string }> {
    storageService.updateGoogleSheetsConfig({ syncStatus: 'syncing' });

    try {
      const config = storageService.getGoogleSheetsConfig();
      const spreadsheetId = targetSheetId || config.spreadsheetId;

      if (!spreadsheetId) {
        // If no sheet is linked yet, create a new one!
        const created = await this.createMasterGoogleSheet();
        return { success: true, spreadsheetUrl: created.spreadsheetUrl };
      }

      let token = this.getAccessToken();
      if (!token) {
        // Only prompt if no saved API key or token was provided
        const authRes = await this.signInWithGoogle();
        token = authRes.token;
      }

      const tabs = this.generateAllSheetTabsData();

      // First check if the spreadsheet exists and get existing sheet tabs
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: { Authorization: authHeader }
      });

      if (metaRes.status === 401) {
        throw new Error('Google Sheets authorization expired or invalid API Key. Please update your API key in the Admin Configuration Panel.');
      }

      if (metaRes.status === 404) {
        throw new Error(`The linked Google Sheet (ID: ${spreadsheetId}) was not found in Google Drive. Please verify the Sheet ID in the Admin Configuration Panel.`);
      }

      if (!metaRes.ok) {
        const err = await metaRes.json().catch(() => ({}));
        throw new Error(err.error?.message || `Failed to access Google Sheet (Status ${metaRes.status})`);
      }

      const sheetMeta = await metaRes.json();
      const existingTitles: string[] = (sheetMeta.sheets || []).map((s: any) => s.properties?.title);

      // Create any missing sheet tabs
      const missingTabs = tabs.filter((t) => !existingTitles.includes(t.title));
      if (missingTabs.length > 0) {
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
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

      // Batch update data
      const dataPayload = tabs.map((tab) => ({
        range: `'${tab.title}'!A1`,
        values: tab.values
      }));

      const batchUpdateRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
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
        throw new Error(err.error?.message || 'Failed to update sheet values');
      }

      const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

      storageService.updateGoogleSheetsConfig({
        spreadsheetId,
        spreadsheetUrl,
        lastSyncAt: new Date().toISOString(),
        syncStatus: 'success'
      });

      storageService.logAudit(
        'SYNC_SHEETS',
        'GOOGLE_SHEET',
        spreadsheetId,
        `Synchronized ${tabs.length} tabs with Google Sheets successfully`
      );

      storageService.addNotification(
        'Google Sheet Synced',
        `Successfully pushed live ERP data across ${tabs.length} tabs to Google Sheets.`,
        'success',
        'sheets'
      );

      return { success: true, spreadsheetUrl };
    } catch (e: any) {
      storageService.updateGoogleSheetsConfig({ syncStatus: 'error' });
      storageService.addNotification('Google Sheet Sync Error', e.message || 'Error communicating with Google Sheets', 'alert', 'sheets');
      throw e;
    }
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

    let token = this.getAccessToken();
    if (!token) {
      const authRes = await this.signInWithGoogle();
      token = authRes.token;
    }

    // Verify sheet exists and is accessible
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

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
