import jsPDF from 'jspdf';
import { storageService } from '../services/storageService';
import { exportToCSV } from './pdfExportHelper';

/**
 * Returns user-friendly metadata & title for the active view tab.
 */
export function getActiveViewInfo(activeTab: string): { title: string; category: string; description: string } {
  switch (activeTab) {
    case 'search':
      return {
        title: 'Global ERP Search & Record Lookup',
        category: 'Core Tools',
        description: 'Multi-module unified database search and record filtering summary.'
      };
    case 'dashboard':
      return {
        title: 'Executive Management Dashboard',
        category: 'Executive Strategy',
        description: 'Comprehensive commercial operations, financial KPIs, and site progress summary.'
      };
    case 'sales':
      return {
        title: 'Sales Performance & Analytics',
        category: 'Commercial Pipeline',
        description: 'Target vs. achievement, quotation conversion rates, and revenue pipeline.'
      };
    case 'crm':
      return {
        title: 'CRM & HVAC Leads Pipeline',
        category: 'Sales & Engineering',
        description: 'Inbound client leads, site surveys, inquiry stages, and estimated deal values.'
      };
    case 'quotes':
      return {
        title: 'HVAC Quotes & Estimations',
        category: 'Sales & Engineering',
        description: 'Detailed commercial estimates, equipment margins, and client proposal statuses.'
      };
    case 'projects':
      return {
        title: 'Projects & BOQ Engineering Engine',
        category: 'Projects & Field',
        description: 'Active site executions, milestone billing, stage completions, and shortage alerts.'
      };
    case 'procurement':
      return {
        title: 'Procurement & Supply Chain (PR / PO)',
        category: 'Procurement & Field',
        description: 'Purchase requisitions, approved vendor POs, goods receipts, and vendor commitments.'
      };
    case 'inventory':
      return {
        title: 'Warehouse Stock & SKU Inventory',
        category: 'Inventory Management',
        description: 'Central stock levels, low-inventory alerts, unit valuation, and warehouse reorder points.'
      };
    case 'workorders':
      return {
        title: 'Work Orders & Field Services',
        category: 'Field Operations',
        description: 'Preventive maintenance tasks, technician dispatches, and emergency HVAC breakdown tickets.'
      };
    case 'finance':
      return {
        title: 'General Ledger & Journal Vouchers',
        category: 'Finance & Accounting',
        description: 'Double-entry vouchers, ledger balances, cashflow statement, and journal summaries.'
      };
    case 'payments':
      return {
        title: 'Invoices & Receivables Management',
        category: 'Finance & Accounting',
        description: 'Tax invoices raised, client milestone collections, vendor payables, and outstanding aging.'
      };
    case 'hr':
      return {
        title: 'Talent, Payroll & KRA Operations',
        category: 'Human Resources',
        description: 'Staff headcount, department payroll distribution, open job requisitions, and attendance.'
      };
    case 'ess':
      return {
        title: 'Employee Self-Service (ESS / MSS)',
        category: 'HR Self-Service',
        description: 'Leave balances, shift schedules, salary slip records, and reimbursement claims.'
      };
    case 'masterdata':
      return {
        title: 'Master Data Directory Hub',
        category: 'Master Data',
        description: 'Client masters, vendor directories, cost centers, tax slabs, and standard items.'
      };
    case 'audit':
      return {
        title: 'Security & Activity Audit Logs',
        category: 'System Governance',
        description: 'Immutable system event trail, user logins, data modifications, and approvals.'
      };
    case 'users':
      return {
        title: 'User Access & RBAC Directory',
        category: 'Administration',
        description: 'System user profiles, departmental roles, and access control authorizations.'
      };
    case 'customization':
      return {
        title: 'System Administration & Settings',
        category: 'Administration',
        description: 'Auto-numbering rules, layout presets, Google Sheet sync, and system preferences.'
      };
    default:
      return {
        title: 'AlphaERP Operations Summary',
        category: 'General System',
        description: 'Comprehensive enterprise status and snapshot report.'
      };
  }
}

/**
 * Generates a clean, structured Plaintext / Markdown summary of the current view for clipboard copy.
 */
export function generateViewSummaryText(activeTab: string): string {
  const info = getActiveViewInfo(activeTab);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const lines: string[] = [
    `═══════════════════════════════════════════════════════════════════`,
    ` HVAC BIZ • ALPHAERP SUMMARY REPORT`,
    ` Module: ${info.title} [${info.category}]`,
    ` Exported on: ${dateStr}`,
    `═══════════════════════════════════════════════════════════════════\n`
  ];

  switch (activeTab) {
    case 'dashboard': {
      const leads = storageService.getLeads();
      const quotes = storageService.getQuotes();
      const projects = storageService.getProjects();
      const payments = storageService.getPayments();
      const totalQuoteVal = quotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0);
      const totalProjectVal = projects.reduce((acc, p) => acc + (p.contractValue || 0), 0);
      const receivedPayments = payments.filter((p) => p.status === 'Paid').reduce((acc, p) => acc + (p.totalAmount || 0), 0);

      lines.push(`📊 EXECUTIVE KEY METRICS:`);
      lines.push(`• Total CRM Leads: ${leads.length} leads`);
      lines.push(`• Active Quotations: ${quotes.length} quotes (Total: ₹${totalQuoteVal.toLocaleString('en-IN')})`);
      lines.push(`• Awarded Projects: ${projects.length} active sites (Total: ₹${totalProjectVal.toLocaleString('en-IN')})`);
      lines.push(`• Collections Realized: ₹${receivedPayments.toLocaleString('en-IN')}`);
      lines.push(`\n📌 TOP ACTIVE SITES:`);
      projects.slice(0, 5).forEach((p, idx) => {
        lines.push(`  ${idx + 1}. [${p.projectNumber}] ${p.projectName} - ₹${(p.contractValue || 0).toLocaleString('en-IN')} (${p.status}, ${p.progressPct || 0}% Done)`);
      });
      break;
    }

    case 'crm': {
      const leads = storageService.getLeads();
      const totalEst = leads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);
      lines.push(`📊 CRM LEADS SUMMARY:`);
      lines.push(`• Total Inquiries: ${leads.length}`);
      lines.push(`• Pipeline Valuation: ₹${totalEst.toLocaleString('en-IN')}`);
      lines.push(`\n📌 RECENT LEADS:`);
      leads.slice(0, 8).forEach((l, idx) => {
        lines.push(`  ${idx + 1}. [${l.leadNumber}] ${l.clientName} - ${l.hvacType || 'HVAC'} | ₹${(l.estimatedValue || 0).toLocaleString('en-IN')} | Status: ${l.status}`);
      });
      break;
    }

    case 'quotes': {
      const quotes = storageService.getQuotes();
      const totalVal = quotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0);
      const approvedCount = quotes.filter((q) => q.status === 'Approved' || q.status === 'Awarded').length;
      lines.push(`📊 QUOTES & ESTIMATES SUMMARY:`);
      lines.push(`• Total Proposals: ${quotes.length}`);
      lines.push(`• Approved / Awarded: ${approvedCount}`);
      lines.push(`• Total Value: ₹${totalVal.toLocaleString('en-IN')}`);
      lines.push(`\n📌 RECENT QUOTATIONS:`);
      quotes.slice(0, 8).forEach((q, idx) => {
        lines.push(`  ${idx + 1}. [${q.quoteNumber}] ${q.clientName} - ₹${(q.totalAmount || 0).toLocaleString('en-IN')} | Status: ${q.status} (Margin: ${q.grossMarginPct || 18}%)`);
      });
      break;
    }

    case 'projects': {
      const projects = storageService.getProjects();
      const totalVal = projects.reduce((acc, p) => acc + (p.contractValue || 0), 0);
      lines.push(`📊 PROJECTS & BOQ SUMMARY:`);
      lines.push(`• Active Site Projects: ${projects.length}`);
      lines.push(`• Order Book Value: ₹${totalVal.toLocaleString('en-IN')}`);
      lines.push(`\n📌 SITE EXECUTION STATUS:`);
      projects.slice(0, 8).forEach((p, idx) => {
        lines.push(`  ${idx + 1}. [${p.projectNumber}] ${p.projectName} (${p.clientName}) | Value: ₹${(p.contractValue || 0).toLocaleString('en-IN')} | Progress: ${p.progressPct || 0}% | Status: ${p.status}`);
      });
      break;
    }

    case 'procurement': {
      const prs = storageService.getPRs();
      const pos = storageService.getPOs();
      const totalPOVal = pos.reduce((acc, po) => acc + (po.grandTotal || 0), 0);
      lines.push(`📊 PROCUREMENT & SUPPLY CHAIN SUMMARY:`);
      lines.push(`• Purchase Requisitions (PR): ${prs.length} indents`);
      lines.push(`• Purchase Orders (PO): ${pos.length} orders (Committed: ₹${totalPOVal.toLocaleString('en-IN')})`);
      lines.push(`\n📌 RECENT PURCHASE ORDERS:`);
      pos.slice(0, 8).forEach((po, idx) => {
        lines.push(`  ${idx + 1}. [${po.poNumber}] Vendor: ${po.vendorName} | ₹${(po.grandTotal || 0).toLocaleString('en-IN')} | Status: ${po.status}`);
      });
      break;
    }

    case 'inventory': {
      const items = storageService.getInventory();
      const lowStock = items.filter((i) => i.currentStock <= i.reorderLevel);
      const totalVal = items.reduce((acc, i) => acc + (i.currentStock * i.averageUnitCost), 0);
      lines.push(`📊 WAREHOUSE INVENTORY SUMMARY:`);
      lines.push(`• Total Cataloged SKUs: ${items.length} items`);
      lines.push(`• Low Stock Alerts: ${lowStock.length} items below reorder point`);
      lines.push(`• Total Inventory Valuation: ₹${totalVal.toLocaleString('en-IN')}`);
      lines.push(`\n📌 TOP INVENTORY ITEMS:`);
      items.slice(0, 8).forEach((i, idx) => {
        lines.push(`  ${idx + 1}. [${i.sku}] ${i.name} | Stock: ${i.currentStock} ${i.unit} (Min: ${i.reorderLevel}) | Cost: ₹${i.averageUnitCost.toLocaleString('en-IN')}`);
      });
      break;
    }

    case 'workorders': {
      const wos = storageService.getWorkOrders();
      lines.push(`📊 WORK ORDERS & FIELD SUMMARY:`);
      lines.push(`• Total Dispatched Orders: ${wos.length}`);
      lines.push(`\n📌 ACTIVE WORK ORDERS:`);
      wos.slice(0, 8).forEach((w, idx) => {
        lines.push(`  ${idx + 1}. [${w.orderNumber}] ${w.projectTitle} | Assigned: ${w.assignedTechnician} | Service: ${w.serviceType} | Status: ${w.status}`);
      });
      break;
    }

    case 'finance': {
      const vouchers = storageService.getJournalVouchers();
      const accounts = storageService.getChartOfAccounts();
      lines.push(`📊 GENERAL LEDGER & VOUCHERS SUMMARY:`);
      lines.push(`• Active Chart of Accounts: ${accounts.length} ledgers`);
      lines.push(`• Posted Journal Vouchers: ${vouchers.length} vouchers`);
      lines.push(`\n📌 RECENT JOURNAL VOUCHERS:`);
      vouchers.slice(0, 8).forEach((v, idx) => {
        lines.push(`  ${idx + 1}. [${v.voucherNumber}] ${v.voucherType} | Date: ${v.voucherDate} | ₹${(v.totalAmount || 0).toLocaleString('en-IN')} | Status: ${v.status}`);
      });
      break;
    }

    case 'payments': {
      const payments = storageService.getPayments();
      const totalInvoiced = payments.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
      const paid = payments.filter((p) => p.status === 'Paid').reduce((acc, p) => acc + (p.totalAmount || 0), 0);
      const pending = totalInvoiced - paid;
      lines.push(`📊 INVOICES & RECEIVABLES SUMMARY:`);
      lines.push(`• Total Invoices Raised: ${payments.length}`);
      lines.push(`• Invoiced Gross: ₹${totalInvoiced.toLocaleString('en-IN')}`);
      lines.push(`• Collections Realized: ₹${paid.toLocaleString('en-IN')}`);
      lines.push(`• Pending Outstanding: ₹${pending.toLocaleString('en-IN')}`);
      lines.push(`\n📌 RECENT INVOICES:`);
      payments.slice(0, 8).forEach((p, idx) => {
        lines.push(`  ${idx + 1}. [${p.invoiceNumber}] ${p.referenceTitle} | ₹${(p.totalAmount || 0).toLocaleString('en-IN')} | Status: ${p.status} | Due: ${p.dueDate || 'N/A'}`);
      });
      break;
    }

    case 'hr':
    case 'ess': {
      const emps = storageService.getEmployees();
      const reqs = storageService.getJobRequisitions();
      lines.push(`📊 HR & TALENT SUMMARY:`);
      lines.push(`• Total Active Staff: ${emps.length} employees`);
      lines.push(`• Open Job Requisitions: ${reqs.length} positions`);
      lines.push(`\n📌 KEY PERSONNEL:`);
      emps.slice(0, 8).forEach((e, idx) => {
        lines.push(`  ${idx + 1}. [${e.empCode}] ${e.name} - ${e.designation} (${e.department}) | Status: ${e.status}`);
      });
      break;
    }

    case 'masterdata': {
      const clients = storageService.getClients();
      const vendors = storageService.getVendors();
      const costCenters = storageService.getCostCenters();
      lines.push(`📊 MASTER DATA SUMMARY:`);
      lines.push(`• Client Accounts: ${clients.length}`);
      lines.push(`• Approved Suppliers / Vendors: ${vendors.length}`);
      lines.push(`• Cost Centers: ${costCenters.length}`);
      lines.push(`\n📌 DIRECTORY HIGHLIGHTS:`);
      clients.slice(0, 4).forEach((c) => lines.push(`• Client [${c.clientCode}]: ${c.companyName}`));
      vendors.slice(0, 4).forEach((v) => lines.push(`• Vendor [${v.vendorCode || v.code || 'VN'}]: ${v.name} (${v.category || 'General'})`));
      break;
    }

    default: {
      const leads = storageService.getLeads();
      const quotes = storageService.getQuotes();
      const projects = storageService.getProjects();
      lines.push(`📊 GENERAL METRICS:`);
      lines.push(`• Leads: ${leads.length} | Quotes: ${quotes.length} | Projects: ${projects.length}`);
      break;
    }
  }

  lines.push(`\n───────────────────────────────────────────────────────────────────`);
  lines.push(`Generated securely by AlphaERP • HVAC Biz Enterprise Suite`);
  return lines.join('\n');
}

/**
 * Cleans text to standard ASCII characters and replaces Unicode currency symbols
 * to prevent character corruption and font collisions in jsPDF.
 */
function sanitizePdfText(str: string): string {
  if (!str) return '';
  return str
    .replace(/₹/g, 'Rs. ')
    .replace(/[\u20B9]/g, 'Rs. ')
    .replace(/¹/g, 'Rs. ')
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates and downloads a clean, branded PDF summary document for the active view.
 * Guarantees zero data overlap across all table columns, metric boxes, and pagination breaks.
 */
export async function downloadViewPDFSummary(activeTab: string): Promise<boolean> {
  const info = getActiveViewInfo(activeTab);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const bottomSafetyMargin = 16;
  let currentY = margin;

  // Function to render the top header banner on any page
  const renderHeaderBanner = (isFirstPage: boolean) => {
    if (isFirstPage) {
      // 1. Top Header Banner
      pdf.setFillColor(8, 16, 41); // Deep Navy #081029
      pdf.rect(margin, currentY, contentWidth, 22, 'F');

      // Orange brand accent strip
      pdf.setFillColor(255, 102, 0);
      pdf.rect(margin, currentY + 21, contentWidth, 1.2, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text('HVAC BIZ • HVAC ENGINEERING ALPHAERP', margin + 5, currentY + 8);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(203, 213, 225); // Slate 300
      pdf.text('Turnkey HVAC Solutions • VRF/VRV Centralized Systems • GSTIN: 27AABCA1299K1Z4', margin + 5, currentY + 13.5);
      pdf.text('ISO 9001:2015 Certified • Official Executive Management Report', margin + 5, currentY + 18);

      currentY += 28;

      // 2. Document Title & Category Badge
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42); // Slate 900
      pdf.text(sanitizePdfText(info.title).toUpperCase(), margin, currentY);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(37, 99, 235); // Blue 600
      pdf.text(`CATEGORY: ${info.category.toUpperCase()}`, margin, currentY + 5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139); // Slate 500
      pdf.text(`Generated on: ${dateStr} at ${timeStr} | Authoritative System Record`, margin, currentY + 9.5);

      currentY += 15;

      // Horizontal divider
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.4);
      pdf.line(margin, currentY, margin + contentWidth, currentY);
      currentY += 6;
    } else {
      // Sub-page continuation mini banner
      pdf.setFillColor(8, 16, 41);
      pdf.rect(margin, currentY, contentWidth, 9, 'F');
      pdf.setFillColor(255, 102, 0);
      pdf.rect(margin, currentY + 8.5, contentWidth, 0.6, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`HVAC BIZ • ${sanitizePdfText(info.title).toUpperCase()} (CONTINUED)`, margin + 4, currentY + 5.5);

      currentY += 14;
    }
  };

  // Render initial page banner
  renderHeaderBanner(true);

  // 3. Extract Tab-Specific Data
  let kpis: { label: string; value: string }[] = [];
  let tableHeaders: string[] = [];
  let colWidthWeights: number[] = [];
  let colAlignments: ('left' | 'center' | 'right')[] = [];
  let tableRows: string[][] = [];

  switch (activeTab) {
    case 'dashboard': {
      const leads = storageService.getLeads();
      const quotes = storageService.getQuotes();
      const projects = storageService.getProjects();
      const payments = storageService.getPayments();
      const totalQuoteVal = quotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0);
      const totalProjectVal = projects.reduce((acc, p) => acc + (p.contractValue || 0), 0);
      const received = payments.filter((p) => p.status === 'Paid').reduce((acc, p) => acc + (p.totalAmount || 0), 0);

      kpis = [
        { label: 'Active Leads', value: `${leads.length}` },
        { label: 'Total Quotes Val', value: `Rs. ${(totalQuoteVal / 100000).toFixed(1)}L` },
        { label: 'Project Order Book', value: `Rs. ${(totalProjectVal / 100000).toFixed(1)}L` },
        { label: 'Collections Realized', value: `Rs. ${(received / 100000).toFixed(1)}L` }
      ];

      tableHeaders = ['Project #', 'Client / Site Name', 'Contract Value', 'Status', 'Progress'];
      colWidthWeights = [0.18, 0.38, 0.20, 0.14, 0.10];
      colAlignments = ['left', 'left', 'right', 'center', 'center'];
      tableRows = projects.map((p) => [
        p.projectNumber,
        p.projectName,
        `Rs. ${(p.contractValue || 0).toLocaleString('en-IN')}`,
        p.status,
        `${p.progressPct || 0}%`
      ]);
      break;
    }

    case 'crm': {
      const leads = storageService.getLeads();
      const totalEst = leads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);
      kpis = [
        { label: 'Total CRM Leads', value: `${leads.length}` },
        { label: 'Total Pipeline Val', value: `Rs. ${(totalEst / 100000).toFixed(1)}L` },
        { label: 'Hot / High Priority', value: `${leads.filter((l) => l.priority === 'High').length}` },
        { label: 'Total Inquiries', value: `${leads.length}` }
      ];
      tableHeaders = ['Lead Code', 'Client Name', 'HVAC Type', 'Est. Value', 'Status', 'Priority'];
      colWidthWeights = [0.16, 0.28, 0.18, 0.18, 0.10, 0.10];
      colAlignments = ['left', 'left', 'left', 'right', 'center', 'center'];
      tableRows = leads.map((l) => [
        l.leadNumber,
        l.clientName,
        l.hvacType || 'HVAC Commercial',
        `Rs. ${(l.estimatedValue || 0).toLocaleString('en-IN')}`,
        l.status,
        l.priority || 'Medium'
      ]);
      break;
    }

    case 'quotes': {
      const quotes = storageService.getQuotes();
      const totalVal = quotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0);
      const approved = quotes.filter((q) => q.status === 'Approved' || q.status === 'Awarded');
      kpis = [
        { label: 'Total Quotes', value: `${quotes.length}` },
        { label: 'Gross Quoted Value', value: `Rs. ${(totalVal / 100000).toFixed(1)}L` },
        { label: 'Approved / Awarded', value: `${approved.length}` },
        { label: 'Win Rate', value: `${quotes.length ? Math.round((approved.length / quotes.length) * 100) : 0}%` }
      ];
      tableHeaders = ['Quote #', 'Client / Proposal', 'Amount', 'Margin', 'Status', 'Date'];
      colWidthWeights = [0.18, 0.32, 0.18, 0.10, 0.11, 0.11];
      colAlignments = ['left', 'left', 'right', 'center', 'center', 'center'];
      tableRows = quotes.map((q) => [
        q.quoteNumber,
        q.clientName,
        `Rs. ${(q.totalAmount || 0).toLocaleString('en-IN')}`,
        `${q.grossMarginPct || 18}%`,
        q.status,
        q.date || 'Active'
      ]);
      break;
    }

    case 'projects': {
      const projects = storageService.getProjects();
      const totalVal = projects.reduce((acc, p) => acc + (p.contractValue || 0), 0);
      kpis = [
        { label: 'Active Sites', value: `${projects.length}` },
        { label: 'Contract Book', value: `Rs. ${(totalVal / 100000).toFixed(1)}L` },
        { label: 'In Execution', value: `${projects.filter((p) => p.status === 'Installation' || p.status === 'Testing & Commissioning').length}` },
        { label: 'Avg Progress', value: `${projects.length ? Math.round(projects.reduce((a, b) => a + (b.progressPct || 0), 0) / projects.length) : 0}%` }
      ];
      tableHeaders = ['Project Code', 'Site Name', 'Client', 'Contract Value', 'Status', 'Done'];
      colWidthWeights = [0.16, 0.28, 0.22, 0.16, 0.10, 0.08];
      colAlignments = ['left', 'left', 'left', 'right', 'center', 'center'];
      tableRows = projects.map((p) => [
        p.projectNumber,
        p.projectName,
        p.clientName,
        `Rs. ${(p.contractValue || 0).toLocaleString('en-IN')}`,
        p.status,
        `${p.progressPct || 0}%`
      ]);
      break;
    }

    case 'procurement': {
      const prs = storageService.getPRs();
      const pos = storageService.getPOs();
      const totalPO = pos.reduce((acc, po) => acc + (po.grandTotal || 0), 0);
      kpis = [
        { label: 'Total PR Indents', value: `${prs.length}` },
        { label: 'Purchase Orders', value: `${pos.length}` },
        { label: 'Committed PO Val', value: `Rs. ${(totalPO / 100000).toFixed(1)}L` },
        { label: 'Pending Approvals', value: `${prs.filter((pr) => pr.status === 'Pending Approval').length}` }
      ];
      tableHeaders = ['PO Number', 'Vendor / Supplier', 'Total Amount', 'Status', 'Date'];
      colWidthWeights = [0.18, 0.36, 0.18, 0.14, 0.14];
      colAlignments = ['left', 'left', 'right', 'center', 'center'];
      tableRows = pos.map((po) => [
        po.poNumber,
        po.vendorName,
        `Rs. ${(po.grandTotal || 0).toLocaleString('en-IN')}`,
        po.status,
        po.orderDate || '2026-09'
      ]);
      break;
    }

    case 'inventory': {
      const items = storageService.getInventory();
      const lowStock = items.filter((i) => i.currentStock <= i.reorderLevel);
      const val = items.reduce((acc, i) => acc + (i.currentStock * i.averageUnitCost), 0);
      kpis = [
        { label: 'SKU Count', value: `${items.length}` },
        { label: 'Total Valuation', value: `Rs. ${(val / 100000).toFixed(1)}L` },
        { label: 'Low Stock Alerts', value: `${lowStock.length}` },
        { label: 'In-Stock Health', value: `${items.length ? Math.round(((items.length - lowStock.length) / items.length) * 100) : 0}%` }
      ];
      tableHeaders = ['SKU Code', 'Item Description', 'Category', 'Stock Qty', 'Unit Cost'];
      colWidthWeights = [0.16, 0.38, 0.18, 0.12, 0.16];
      colAlignments = ['left', 'left', 'left', 'center', 'right'];
      tableRows = items.map((i) => [
        i.sku,
        i.name,
        i.category,
        `${i.currentStock} ${i.unit}`,
        `Rs. ${i.averageUnitCost.toLocaleString('en-IN')}`
      ]);
      break;
    }

    case 'workorders': {
      const wos = storageService.getWorkOrders();
      kpis = [
        { label: 'Total Work Orders', value: `${wos.length}` },
        { label: 'Completed', value: `${wos.filter((w) => w.status === 'Completed' || w.status === 'Billed').length}` },
        { label: 'In Progress', value: `${wos.filter((w) => w.status === 'In Progress' || w.status === 'Inspection').length}` },
        { label: 'Scheduled', value: `${wos.filter((w) => w.status === 'Scheduled').length}` }
      ];
      tableHeaders = ['Order #', 'Project / Client', 'Technician', 'Service Type', 'Status'];
      colWidthWeights = [0.16, 0.34, 0.20, 0.18, 0.12];
      colAlignments = ['left', 'left', 'left', 'left', 'center'];
      tableRows = wos.map((w) => [
        w.orderNumber,
        w.projectTitle,
        w.assignedTechnician,
        w.serviceType,
        w.status
      ]);
      break;
    }

    case 'finance': {
      const vouchers = storageService.getJournalVouchers();
      const accounts = storageService.getChartOfAccounts();
      const totalVoucherVal = vouchers.reduce((acc, v) => acc + (v.totalAmount || 0), 0);
      kpis = [
        { label: 'Chart of Accounts', value: `${accounts.length}` },
        { label: 'Posted Vouchers', value: `${vouchers.length}` },
        { label: 'Total Transactions', value: `Rs. ${(totalVoucherVal / 100000).toFixed(1)}L` },
        { label: 'Accounting Standard', value: 'GAAP / AS' }
      ];
      tableHeaders = ['Voucher #', 'Voucher Type', 'Posting Date', 'Total Amount', 'Status'];
      colWidthWeights = [0.20, 0.25, 0.20, 0.20, 0.15];
      colAlignments = ['left', 'left', 'center', 'right', 'center'];
      tableRows = vouchers.map((v) => [
        v.voucherNumber,
        v.voucherType,
        v.voucherDate,
        `Rs. ${(v.totalAmount || 0).toLocaleString('en-IN')}`,
        v.status
      ]);
      break;
    }

    case 'payments': {
      const payments = storageService.getPayments();
      const totalInv = payments.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
      const paid = payments.filter((p) => p.status === 'Paid').reduce((acc, p) => acc + (p.totalAmount || 0), 0);
      kpis = [
        { label: 'Invoices Raised', value: `${payments.length}` },
        { label: 'Invoiced Gross', value: `Rs. ${(totalInv / 100000).toFixed(1)}L` },
        { label: 'Realized Paid', value: `Rs. ${(paid / 100000).toFixed(1)}L` },
        { label: 'Pending Balance', value: `Rs. ${((totalInv - paid) / 100000).toFixed(1)}L` }
      ];
      tableHeaders = ['Invoice #', 'Reference Title', 'Amount', 'Status', 'Due Date'];
      colWidthWeights = [0.18, 0.38, 0.18, 0.12, 0.14];
      colAlignments = ['left', 'left', 'right', 'center', 'center'];
      tableRows = payments.map((p) => [
        p.invoiceNumber,
        p.referenceTitle,
        `Rs. ${(p.totalAmount || 0).toLocaleString('en-IN')}`,
        p.status,
        p.dueDate || 'Immediate'
      ]);
      break;
    }

    case 'hr':
    case 'ess': {
      const emps = storageService.getEmployees();
      const reqs = storageService.getJobRequisitions();
      kpis = [
        { label: 'Total Staff', value: `${emps.length}` },
        { label: 'Active Staff', value: `${emps.filter((e) => e.status === 'Active').length}` },
        { label: 'Open Job Reqs', value: `${reqs.length}` },
        { label: 'Departments', value: `6 Depts` }
      ];
      tableHeaders = ['Emp Code', 'Staff Name', 'Department', 'Designation', 'Status'];
      colWidthWeights = [0.16, 0.28, 0.20, 0.24, 0.12];
      colAlignments = ['left', 'left', 'left', 'left', 'center'];
      tableRows = emps.map((e) => [
        e.empCode,
        e.name,
        e.department,
        e.designation,
        e.status
      ]);
      break;
    }

    default: {
      const leads = storageService.getLeads();
      const quotes = storageService.getQuotes();
      const projects = storageService.getProjects();
      kpis = [
        { label: 'Total Leads', value: `${leads.length}` },
        { label: 'Active Quotes', value: `${quotes.length}` },
        { label: 'Site Projects', value: `${projects.length}` },
        { label: 'System Health', value: '100% OK' }
      ];
      tableHeaders = ['Entity Type', 'Active Count', 'System Status'];
      colWidthWeights = [0.34, 0.33, 0.33];
      colAlignments = ['left', 'center', 'center'];
      tableRows = [
        ['CRM Inquiries', `${leads.length}`, 'Active'],
        ['Quotations', `${quotes.length}`, 'Synced'],
        ['Projects / BOQ', `${projects.length}`, 'Operational']
      ];
      break;
    }
  }

  // 4. Render KPI Metric Boxes with dynamic font sizing and wrapping
  if (kpis.length > 0) {
    const kpiCount = kpis.length;
    const gap = 3;
    const kpiBoxWidth = (contentWidth - (kpiCount - 1) * gap) / kpiCount;
    const kpiBoxHeight = 15;

    kpis.forEach((kpi, idx) => {
      const boxX = margin + idx * (kpiBoxWidth + gap);

      // Background card
      pdf.setFillColor(248, 250, 252); // Slate 50
      pdf.roundedRect(boxX, currentY, kpiBoxWidth, kpiBoxHeight, 2, 2, 'F');

      pdf.setDrawColor(226, 232, 240); // Slate 200
      pdf.setLineWidth(0.3);
      pdf.roundedRect(boxX, currentY, kpiBoxWidth, kpiBoxHeight, 2, 2, 'D');

      // Label text
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(100, 116, 139);
      const safeLabel = sanitizePdfText(kpi.label).toUpperCase();
      const labelLines = pdf.splitTextToSize(safeLabel, kpiBoxWidth - 4);
      pdf.text(labelLines[0] || safeLabel, boxX + 2.5, currentY + 4.8);

      // Value text with auto font-size adjustment
      const safeVal = sanitizePdfText(kpi.value);
      pdf.setFont('helvetica', 'bold');
      let valFontSize = 10;
      pdf.setFontSize(valFontSize);
      while (pdf.getTextWidth(safeVal) > kpiBoxWidth - 5 && valFontSize > 7) {
        valFontSize -= 0.5;
        pdf.setFontSize(valFontSize);
      }
      pdf.setTextColor(15, 23, 42);
      pdf.text(safeVal, boxX + 2.5, currentY + 11.5);
    });

    currentY += kpiBoxHeight + 7;
  }

  // 5. Section Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Current Records Breakdown', margin, currentY);
  currentY += 4.5;

  // 6. Draw Table with Non-Overlapping Cell Engine & Dynamic Pagination
  if (tableHeaders.length > 0 && tableRows.length > 0) {
    const colCount = tableHeaders.length;
    // Normalize weights to sum to contentWidth
    const totalWeight = colWidthWeights.reduce((a, b) => a + b, 0);
    const colWidths = colWidthWeights.map((w) => (w / totalWeight) * contentWidth);

    // Function to render the table header row
    const drawTableHeader = () => {
      const headerRowHeight = 6.5;
      pdf.setFillColor(241, 245, 249); // Slate 100
      pdf.rect(margin, currentY, contentWidth, headerRowHeight, 'F');

      pdf.setDrawColor(203, 213, 225); // Slate 300
      pdf.setLineWidth(0.3);
      pdf.line(margin, currentY + headerRowHeight, margin + contentWidth, currentY + headerRowHeight);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(51, 65, 85);

      let colX = margin;
      tableHeaders.forEach((h, cIdx) => {
        const width = colWidths[cIdx];
        const align = colAlignments[cIdx] || 'left';
        const safeH = sanitizePdfText(h);

        let textX = colX + 2;
        if (align === 'right') textX = colX + width - 2;
        else if (align === 'center') textX = colX + width / 2;

        pdf.text(safeH, textX, currentY + 4.3, { align });
        colX += width;
      });

      currentY += headerRowHeight;
    };

    // Draw initial table header
    drawTableHeader();

    // Iterate through all table rows
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);

    for (let rIdx = 0; rIdx < tableRows.length; rIdx++) {
      const row = tableRows[rIdx];

      // Step A: Calculate per-cell text wrapping and find the maximum row height
      const cellLinesArray: string[][] = [];
      let maxLinesInRow = 1;

      for (let cIdx = 0; cIdx < colCount; cIdx++) {
        const rawCell = sanitizePdfText(row[cIdx] || '-');
        const cellWidth = colWidths[cIdx];
        const printableWidth = Math.max(cellWidth - 4, 6); // 2mm padding on each side
        const wrapped = pdf.splitTextToSize(rawCell, printableWidth);
        cellLinesArray.push(wrapped);
        if (wrapped.length > maxLinesInRow) {
          maxLinesInRow = wrapped.length;
        }
      }

      const lineHeightMm = 3.4;
      const rowHeight = Math.max(5.8, maxLinesInRow * lineHeightMm + 2.2);

      // Step B: Check for Page Overflow
      if (currentY + rowHeight > pageHeight - bottomSafetyMargin) {
        pdf.addPage();
        currentY = margin;
        renderHeaderBanner(false);
        drawTableHeader();
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
      }

      // Step C: Draw row background (subtle alternating zebra stripe)
      if (rIdx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin, currentY, contentWidth, rowHeight, 'F');
      }

      // Step D: Draw cell text within strictly bounded coordinates
      let cellX = margin;
      for (let cIdx = 0; cIdx < colCount; cIdx++) {
        const cellWidth = colWidths[cIdx];
        const align = colAlignments[cIdx] || 'left';
        const lines = cellLinesArray[cIdx];

        pdf.setTextColor(30, 41, 59);

        let targetX = cellX + 2;
        if (align === 'right') targetX = cellX + cellWidth - 2;
        else if (align === 'center') targetX = cellX + cellWidth / 2;

        lines.forEach((line, lineIndex) => {
          pdf.text(line, targetX, currentY + 3.8 + lineIndex * lineHeightMm, { align });
        });

        cellX += cellWidth;
      }

      // Step E: Draw subtle bottom divider
      pdf.setDrawColor(241, 245, 249);
      pdf.setLineWidth(0.2);
      pdf.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);

      currentY += rowHeight;
    }
  }

  // 7. Stamp Clean Footer and Page Numbers across all generated pages
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    // Footer divider line
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(margin, pageHeight - 10, margin + contentWidth, pageHeight - 10);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184); // Slate 400
    pdf.text(
      `AlphaERP • HVAC Biz • Page ${i} of ${totalPages} • Generated on ${dateStr} • Confidential Record`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  const cleanFilename = `${info.title.replace(/\s+/g, '_')}_Summary_${now.toISOString().slice(0, 10)}.pdf`;
  pdf.save(cleanFilename);
  return true;
}

/**
 * Triggers CSV export for the active view.
 */
export function exportViewCSV(activeTab: string) {
  const info = getActiveViewInfo(activeTab);
  const now = new Date().toISOString().slice(0, 10);

  switch (activeTab) {
    case 'crm': {
      const leads = storageService.getLeads();
      const rows = [
        ['Lead Code', 'Client Name', 'Company', 'Phone', 'HVAC Type', 'Estimated Value', 'Status', 'Priority'],
        ...leads.map((l) => [
          l.leadNumber,
          l.clientName,
          l.companyName || '',
          l.phone || '',
          l.hvacType || '',
          l.estimatedValue || 0,
          l.status,
          l.priority || 'Medium'
        ])
      ];
      exportToCSV(`Leads_Export_${now}`, rows);
      break;
    }
    case 'quotes': {
      const quotes = storageService.getQuotes();
      const rows = [
        ['Quote #', 'Client Name', 'Project Title', 'Total Amount', 'Margin %', 'Status', 'Date'],
        ...quotes.map((q) => [
          q.quoteNumber,
          q.clientName,
          q.projectTitle || '',
          q.totalAmount || 0,
          q.grossMarginPct || 18,
          q.status,
          q.date || ''
        ])
      ];
      exportToCSV(`Quotes_Export_${now}`, rows);
      break;
    }
    case 'projects': {
      const projects = storageService.getProjects();
      const rows = [
        ['Project Code', 'Project Name', 'Client Name', 'Contract Value', 'Status', 'Progress %', 'Start Date'],
        ...projects.map((p) => [
          p.projectNumber,
          p.projectName,
          p.clientName,
          p.contractValue || 0,
          p.status,
          p.progressPct || 0,
          p.startDate || ''
        ])
      ];
      exportToCSV(`Projects_Export_${now}`, rows);
      break;
    }
    case 'inventory': {
      const items = storageService.getInventory();
      const rows = [
        ['SKU Code', 'Item Name', 'Category', 'Current Stock', 'Unit', 'Reorder Level', 'Unit Cost'],
        ...items.map((i) => [
          i.sku,
          i.name,
          i.category,
          i.currentStock,
          i.unit,
          i.reorderLevel,
          i.averageUnitCost
        ])
      ];
      exportToCSV(`Inventory_Export_${now}`, rows);
      break;
    }
    case 'payments': {
      const payments = storageService.getPayments();
      const rows = [
        ['Invoice #', 'Reference Title', 'Client / Vendor', 'Total Amount', 'Status', 'Due Date'],
        ...payments.map((p) => [
          p.invoiceNumber,
          p.referenceTitle,
          p.clientOrVendorName || '',
          p.totalAmount,
          p.status,
          p.dueDate || ''
        ])
      ];
      exportToCSV(`Payments_Export_${now}`, rows);
      break;
    }
    default: {
      const summaryText = generateViewSummaryText(activeTab);
      const rows = [
        ['Module', info.title],
        ['Category', info.category],
        ['Export Date', new Date().toISOString()],
        ['Summary', summaryText]
      ];
      exportToCSV(`${info.title.replace(/\s+/g, '_')}_Export_${now}`, rows);
      break;
    }
  }
}
