import React, { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  Briefcase,
  Users,
  ShoppingCart,
  Boxes,
  Truck,
  Building2,
  UserCheck,
  CreditCard,
  Landmark,
  Wrench,
  ShieldCheck,
  ExternalLink,
  Download,
  Filter,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Tag,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { exportToCSV } from '../utils/pdfExportHelper';

export interface GlobalSearchViewProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNavigate: (tab: string, meta?: any) => void;
  data: {
    leads?: any[];
    quotes?: any[];
    projects?: any[];
    inventory?: any[];
    prs?: any[];
    pos?: any[];
    vendors?: any[];
    clients?: any[];
    employees?: any[];
    payments?: any[];
    vouchers?: any[];
    workOrders?: any[];
    amcContracts?: any[];
    ppmVisits?: any[];
    breakdownTickets?: any[];
    costCenters?: any[];
    [key: string]: any;
  };
}

export type SearchCategory =
  | 'all'
  | 'quotes'
  | 'leads'
  | 'projects'
  | 'pos'
  | 'prs'
  | 'inventory'
  | 'vendors'
  | 'clients'
  | 'employees'
  | 'finance'
  | 'workorders'
  | 'services_amc';

export interface SearchResultItem {
  id: string;
  category: SearchCategory;
  categoryLabel: string;
  categoryIcon: React.ElementType;
  categoryColor: string;
  code: string;
  title: string;
  subtitle: string;
  details: string[];
  status?: string;
  statusType?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  amount?: number;
  date?: string;
  location?: string;
  targetTab: string;
  rawItem: any;
}

export const GlobalSearchView: React.FC<GlobalSearchViewProps> = ({
  searchTerm,
  onSearchChange,
  onNavigate,
  data
}) => {
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'title' | 'code' | 'amount'>('relevance');

  // Convert raw datasets into unified SearchResultItem list
  const allResults: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // 1. Vendors
    (data.vendors || []).forEach((v) => {
      const code = v.vendorCode || v.code || `VND-${v.id}`;
      items.push({
        id: `ven-${v.id}`,
        category: 'vendors',
        categoryLabel: 'Vendor Master',
        categoryIcon: Truck,
        categoryColor: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
        code,
        title: v.name || 'Unnamed Vendor',
        subtitle: v.category || 'HVAC Supplier',
        details: [
          v.contactPerson ? `Contact: ${v.contactPerson}` : '',
          v.phone ? `Phone: ${v.phone}` : '',
          v.email ? `Email: ${v.email}` : '',
          v.city ? `City: ${v.city}` : '',
          v.gstin || v.gstOrTaxId ? `GST: ${v.gstin || v.gstOrTaxId}` : '',
          v.pan ? `PAN: ${v.pan}` : '',
          v.rating ? `Rating: ${v.rating}★` : '',
          v.leadTimeDays ? `Lead Time: ${v.leadTimeDays}d` : ''
        ].filter(Boolean),
        status: 'Active Vendor',
        statusType: 'success',
        location: v.city ? `${v.city}, ${v.state || ''}` : v.address,
        targetTab: 'masterdata',
        rawItem: v
      });
    });

    // 2. Clients
    (data.clients || []).forEach((c) => {
      const code = c.clientCode || c.code || `CL-${c.id}`;
      items.push({
        id: `cli-${c.id}`,
        category: 'clients',
        categoryLabel: 'Client Master',
        categoryIcon: Building2,
        categoryColor: 'text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
        code,
        title: c.companyName || c.name || 'Unnamed Client',
        subtitle: c.industry || 'Corporate Account',
        details: [
          c.contactPerson ? `Contact: ${c.contactPerson}` : '',
          c.designation ? `Role: ${c.designation}` : '',
          c.phone ? `Phone: ${c.phone}` : '',
          c.email ? `Email: ${c.email}` : '',
          c.city ? `City: ${c.city}` : '',
          c.gstin ? `GST: ${c.gstin}` : ''
        ].filter(Boolean),
        status: c.status || 'Active Client',
        statusType: c.status === 'inactive' ? 'neutral' : 'success',
        location: c.city ? `${c.city}, ${c.state || ''}` : c.billingAddress,
        targetTab: 'masterdata',
        rawItem: c
      });
    });

    // 3. Quotes & Estimations
    (data.quotes || []).forEach((q) => {
      const code = q.quoteNumber || q.code || `QT-${q.id}`;
      const statusType: SearchResultItem['statusType'] =
        q.status === 'awarded' || q.status === 'approved'
          ? 'success'
          : q.status === 'rejected'
          ? 'danger'
          : 'warning';

      items.push({
        id: `qt-${q.id}`,
        category: 'quotes',
        categoryLabel: 'Quotation / Estimation',
        categoryIcon: FileText,
        categoryColor: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
        code,
        title: q.projectTitle || q.title || `HVAC Quotation for ${q.clientName || 'Client'}`,
        subtitle: `Client: ${q.clientName || 'General Client'}`,
        details: [
          q.salesRep ? `Rep: ${q.salesRep}` : '',
          q.hvacType ? `System: ${q.hvacType}` : '',
          q.validUntil ? `Valid: ${q.validUntil}` : '',
          q.totalTonnage ? `Capacity: ${q.totalTonnage} TR` : ''
        ].filter(Boolean),
        status: q.status ? q.status.toUpperCase() : 'DRAFT',
        statusType,
        amount: q.grandTotal || q.totalAmount || 0,
        date: q.createdAt || q.date,
        location: q.siteLocation,
        targetTab: 'quotes',
        rawItem: q
      });
    });

    // 4. CRM Leads
    (data.leads || []).forEach((l) => {
      const code = l.leadNumber || l.leadCode || `LD-${l.id}`;
      const statusType: SearchResultItem['statusType'] =
        l.status === 'won'
          ? 'success'
          : l.status === 'lost'
          ? 'danger'
          : 'info';

      items.push({
        id: `ld-${l.id}`,
        category: 'leads',
        categoryLabel: 'CRM Lead / Enquiry',
        categoryIcon: Users,
        categoryColor: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800',
        code,
        title: l.clientName || l.contactName || 'HVAC Commercial Enquiry',
        subtitle: l.projectTitle || l.companyName || 'Opportunity',
        details: [
          l.assignedSalesRep ? `Assigned: ${l.assignedSalesRep}` : '',
          l.phone ? `Phone: ${l.phone}` : '',
          l.email ? `Email: ${l.email}` : '',
          l.city ? `City: ${l.city}` : '',
          l.source ? `Source: ${l.source}` : '',
          l.probability ? `Prob: ${l.probability}%` : ''
        ].filter(Boolean),
        status: l.status ? l.status.toUpperCase() : 'NEW',
        statusType,
        amount: l.estimatedValue || 0,
        date: l.createdAt,
        location: l.city,
        targetTab: 'crm',
        rawItem: l
      });
    });

    // 5. Projects & BOQ
    (data.projects || []).forEach((p) => {
      const code = p.projectNumber || p.code || `PJ-${p.id}`;
      const statusType: SearchResultItem['statusType'] =
        p.status === 'completed'
          ? 'success'
          : p.status === 'on_hold'
          ? 'danger'
          : 'warning';

      items.push({
        id: `pj-${p.id}`,
        category: 'projects',
        categoryLabel: 'Project & BOQ Site',
        categoryIcon: Briefcase,
        categoryColor: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        code,
        title: p.name || p.title || 'Engineering Project',
        subtitle: `Client: ${p.clientName || p.client || 'Client Account'}`,
        details: [
          p.projectManager ? `PM: ${p.projectManager}` : '',
          p.completionPercentage !== undefined ? `Progress: ${p.completionPercentage}%` : '',
          p.hvacType ? `Type: ${p.hvacType}` : '',
          p.startDate ? `Start: ${p.startDate}` : '',
          p.targetCompletionDate ? `Target: ${p.targetCompletionDate}` : ''
        ].filter(Boolean),
        status: p.status ? p.status.toUpperCase() : 'ACTIVE',
        statusType,
        amount: p.totalBudget || p.contractValue || 0,
        date: p.startDate,
        location: p.location || p.siteAddress,
        targetTab: 'projects',
        rawItem: p
      });
    });

    // 6. Purchase Orders (PO)
    (data.pos || []).forEach((po) => {
      const code = po.poNumber || po.code || `PO-${po.id}`;
      const statusType: SearchResultItem['statusType'] =
        po.status === 'fulfilled' || po.status === 'approved'
          ? 'success'
          : po.status === 'cancelled'
          ? 'danger'
          : 'warning';

      items.push({
        id: `po-${po.id}`,
        category: 'pos',
        categoryLabel: 'Purchase Order',
        categoryIcon: ShoppingCart,
        categoryColor: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
        code,
        title: `PO for ${po.vendorName || 'Supplier'}`,
        subtitle: `Project: ${po.projectName || 'General Supply'}`,
        details: [
          po.vendorName ? `Vendor: ${po.vendorName}` : '',
          po.expectedDeliveryDate ? `Exp Delivery: ${po.expectedDeliveryDate}` : '',
          po.paymentTerms ? `Terms: ${po.paymentTerms}` : '',
          po.items ? `${po.items.length} line items` : ''
        ].filter(Boolean),
        status: po.status ? po.status.toUpperCase() : 'ISSUED',
        statusType,
        amount: po.totalAmount || po.grandTotal || 0,
        date: po.createdAt || po.poDate,
        targetTab: 'procurement',
        rawItem: po
      });
    });

    // 7. Purchase Requisitions (PR)
    (data.prs || []).forEach((pr) => {
      const code = pr.prNumber || pr.code || `PR-${pr.id}`;
      const statusType: SearchResultItem['statusType'] =
        pr.status === 'converted_to_po' || pr.status === 'approved'
          ? 'success'
          : pr.status === 'rejected'
          ? 'danger'
          : 'warning';

      items.push({
        id: `pr-${pr.id}`,
        category: 'prs',
        categoryLabel: 'Purchase Requisition',
        categoryIcon: ShoppingCart,
        categoryColor: 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800',
        code,
        title: `PR: ${pr.projectName || 'Material Requisition'}`,
        subtitle: `Requested by: ${pr.requestedBy || 'Site Engineer'}`,
        details: [
          pr.priority ? `Priority: ${pr.priority.toUpperCase()}` : '',
          pr.requiredByDate ? `Required By: ${pr.requiredByDate}` : '',
          pr.items ? `${pr.items.length} Items Requested` : ''
        ].filter(Boolean),
        status: pr.status ? pr.status.toUpperCase() : 'PENDING',
        statusType,
        amount: pr.estimatedCost || 0,
        date: pr.createdAt,
        targetTab: 'procurement',
        rawItem: pr
      });
    });

    // 8. Inventory & SKUs
    (data.inventory || []).forEach((item) => {
      const code = item.sku || item.itemCode || `SKU-${item.id}`;
      const isLowStock = (item.currentStock || 0) <= (item.reorderLevel || 0);

      items.push({
        id: `inv-${item.id}`,
        category: 'inventory',
        categoryLabel: 'Warehouse Stock / SKU',
        categoryIcon: Boxes,
        categoryColor: 'text-violet-600 bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800',
        code,
        title: item.name || item.description || 'Inventory Item',
        subtitle: item.category || 'HVAC Material',
        details: [
          `Stock: ${item.currentStock || 0} ${item.unit || 'Nos'}`,
          `Allocated: ${item.allocatedStock || 0}`,
          `Reorder: ${item.reorderLevel || 0}`,
          item.brand ? `Brand: ${item.brand}` : '',
          item.storageLocation ? `Location: ${item.storageLocation}` : '',
          item.hsnCode ? `HSN: ${item.hsnCode}` : ''
        ].filter(Boolean),
        status: isLowStock ? 'LOW STOCK ALERT' : 'IN STOCK',
        statusType: isLowStock ? 'danger' : 'success',
        amount: (item.averageUnitCost || 0) * (item.currentStock || 0),
        location: item.storageLocation,
        targetTab: 'inventory',
        rawItem: item
      });
    });

    // 9. Employees & HR
    (data.employees || []).forEach((emp) => {
      const code = emp.employeeCode || emp.code || `EMP-${emp.id}`;
      items.push({
        id: `emp-${emp.id}`,
        category: 'employees',
        categoryLabel: 'Employee Profile',
        categoryIcon: UserCheck,
        categoryColor: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
        code,
        title: emp.fullName || emp.name || 'Team Member',
        subtitle: `${emp.designation || 'Staff'} • ${emp.department || 'Operations'}`,
        details: [
          emp.email ? `Email: ${emp.email}` : '',
          emp.phone ? `Phone: ${emp.phone}` : '',
          emp.employmentType ? `Type: ${emp.employmentType}` : '',
          emp.joiningDate ? `Joined: ${emp.joiningDate}` : ''
        ].filter(Boolean),
        status: emp.status ? emp.status.toUpperCase() : 'ACTIVE',
        statusType: emp.status === 'resigned' ? 'danger' : 'success',
        location: emp.workLocation || emp.city,
        targetTab: 'hr',
        rawItem: emp
      });
    });

    // 10. Finance & Invoices
    (data.payments || []).forEach((pay) => {
      const code = pay.invoiceNumber || pay.receiptNumber || `INV-${pay.id}`;
      items.push({
        id: `pay-${pay.id}`,
        category: 'finance',
        categoryLabel: 'Invoice / Payment Voucher',
        categoryIcon: CreditCard,
        categoryColor: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        code,
        title: pay.milestoneName || pay.title || `Payment: ${pay.clientName || 'Client'}`,
        subtitle: `Account: ${pay.clientName || pay.vendorName || 'Receivables'}`,
        details: [
          pay.paymentMethod ? `Method: ${pay.paymentMethod}` : '',
          pay.tdsAmount ? `TDS: ₹${pay.tdsAmount.toLocaleString()}` : '',
          pay.gstAmount ? `GST: ₹${pay.gstAmount.toLocaleString()}` : '',
          pay.dueDate ? `Due: ${pay.dueDate}` : ''
        ].filter(Boolean),
        status: pay.status ? pay.status.toUpperCase() : 'PAID',
        statusType: pay.status === 'overdue' ? 'danger' : pay.status === 'pending' ? 'warning' : 'success',
        amount: pay.amount || pay.totalAmount || 0,
        date: pay.date || pay.paymentDate,
        targetTab: 'payments',
        rawItem: pay
      });
    });

    // 11. Work Orders
    (data.workOrders || []).forEach((wo) => {
      const code = wo.workOrderNumber || wo.code || `WO-${wo.id}`;
      items.push({
        id: `wo-${wo.id}`,
        category: 'workorders',
        categoryLabel: 'Field Work Order',
        categoryIcon: Wrench,
        categoryColor: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
        code,
        title: wo.title || wo.description || 'HVAC Field Dispatch',
        subtitle: `Customer: ${wo.clientName || wo.customer || 'Site'}`,
        details: [
          wo.assignedTechnician ? `Technician: ${wo.assignedTechnician}` : '',
          wo.serviceType ? `Type: ${wo.serviceType}` : '',
          wo.scheduledDate ? `Scheduled: ${wo.scheduledDate}` : ''
        ].filter(Boolean),
        status: wo.status ? wo.status.toUpperCase() : 'SCHEDULED',
        statusType: wo.status === 'completed' ? 'success' : 'warning',
        location: wo.location || wo.siteAddress,
        targetTab: 'workorders',
        rawItem: wo
      });
    });

    // 12. Services & AMC Contracts
    (data.amcContracts || []).forEach((amc) => {
      items.push({
        id: `amc-${amc.id}`,
        category: 'services_amc',
        categoryLabel: 'Services & AMC',
        categoryIcon: ShieldCheck,
        categoryColor: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        code: amc.contractNumber,
        title: `${amc.contractType} AMC — ${amc.clientName}`,
        subtitle: `System: ${amc.systemType} | Equipment: ${amc.equipmentCount} units`,
        details: [
          `Tenure: ${amc.startDate} to ${amc.endDate}`,
          `Lead Tech: ${amc.assignedLeadTechnician}`,
          `PPM: ${amc.ppmVisitsCompleted}/${amc.ppmVisitsTotal} done`
        ],
        status: amc.status.toUpperCase(),
        statusType: amc.status === 'Active' ? 'success' : amc.status === 'Pending Renewal' ? 'warning' : 'neutral',
        amount: amc.annualContractValue,
        location: amc.siteAddress,
        targetTab: 'services_amc',
        rawItem: amc
      });
    });

    // 13. Breakdown / Emergency Service Tickets
    (data.breakdownTickets || []).forEach((tkt) => {
      items.push({
        id: `tkt-${tkt.id}`,
        category: 'services_amc',
        categoryLabel: 'Breakdown Ticket',
        categoryIcon: Wrench,
        categoryColor: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
        code: tkt.ticketNumber,
        title: tkt.reportedIssue,
        subtitle: `Customer: ${tkt.clientName} | Priority: ${tkt.priority}`,
        details: [
          `Technician: ${tkt.assignedTechnician}`,
          `Reported: ${new Date(tkt.reportedAt).toLocaleDateString()}`,
          tkt.systemType
        ],
        status: tkt.status.toUpperCase(),
        statusType: tkt.status === 'Resolved' || tkt.status === 'Closed' ? 'success' : 'danger',
        amount: tkt.billableAmount || 0,
        location: tkt.siteAddress,
        targetTab: 'services_amc',
        rawItem: tkt
      });
    });

    return items;
  }, [data]);

  // Filtered & Sorted Search Results
  const filteredResults = useMemo(() => {
    const term = (searchTerm || '').trim().toLowerCase();

    return allResults
      .filter((item) => {
        // Category filter
        if (activeCategory !== 'all' && item.category !== activeCategory) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'active' && item.statusType !== 'success') return false;
          if (statusFilter === 'pending' && item.statusType !== 'warning' && item.statusType !== 'info') return false;
          if (statusFilter === 'alert' && item.statusType !== 'danger') return false;
        }

        // Search Term matching
        if (!term) return true;

        const inCode = (item.code || '').toLowerCase().includes(term);
        const inTitle = (item.title || '').toLowerCase().includes(term);
        const inSubtitle = (item.subtitle || '').toLowerCase().includes(term);
        const inCategory = (item.categoryLabel || '').toLowerCase().includes(term);
        const inLocation = (item.location || '').toLowerCase().includes(term);
        const inStatus = (item.status || '').toLowerCase().includes(term);
        const inDetails = item.details.some((d) => d.toLowerCase().includes(term));

        return inCode || inTitle || inSubtitle || inCategory || inLocation || inStatus || inDetails;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'code') return a.code.localeCompare(b.code);
        if (sortBy === 'amount') return (b.amount || 0) - (a.amount || 0);
        return 0; // relevance / natural order
      });
  }, [allResults, searchTerm, activeCategory, statusFilter, sortBy]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allResults.length };
    const term = (searchTerm || '').trim().toLowerCase();

    allResults.forEach((item) => {
      let matchesTerm = true;
      if (term) {
        const inCode = (item.code || '').toLowerCase().includes(term);
        const inTitle = (item.title || '').toLowerCase().includes(term);
        const inSubtitle = (item.subtitle || '').toLowerCase().includes(term);
        const inDetails = item.details.some((d) => d.toLowerCase().includes(term));
        matchesTerm = inCode || inTitle || inSubtitle || inDetails;
      }
      if (matchesTerm) {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
    });

    return counts;
  }, [allResults, searchTerm]);

  // Export search results to CSV
  const handleExportCSV = () => {
    const headers = ['Category', 'Identifier Code', 'Title', 'Subtitle', 'Status', 'Amount (INR)', 'Date', 'Location', 'Details'];
    const rows = filteredResults.map((r) => [
      r.categoryLabel,
      r.code,
      r.title,
      r.subtitle,
      r.status || '',
      r.amount ? r.amount.toFixed(2) : '',
      r.date || '',
      r.location || '',
      r.details.join(' | ')
    ]);
    exportToCSV(`Global_Search_Results_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  };

  const categoriesConfig: { id: SearchCategory; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All Modules', icon: Sparkles },
    { id: 'quotes', label: 'Quotes & Estimations', icon: FileText },
    { id: 'leads', label: 'CRM Leads', icon: Users },
    { id: 'projects', label: 'Projects & BOQ', icon: Briefcase },
    { id: 'pos', label: 'Purchase Orders', icon: ShoppingCart },
    { id: 'prs', label: 'Requisitions (PR)', icon: ShoppingCart },
    { id: 'inventory', label: 'Warehouse & SKUs', icon: Boxes },
    { id: 'vendors', label: 'Vendor Master', icon: Truck },
    { id: 'clients', label: 'Client Accounts', icon: Building2 },
    { id: 'employees', label: 'HR & Employees', icon: UserCheck },
    { id: 'finance', label: 'Invoices & Finance', icon: CreditCard },
    { id: 'workorders', label: 'Work Orders', icon: Wrench },
    { id: 'services_amc', label: 'Services & AMC', icon: ShieldCheck }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner & Primary Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Global ERP Search & Record Lookup
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Search across Quotes, Projects, CRM Leads, POs, Vendor Master, Client Master, Inventory SKUs & HR Profiles.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredResults.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export Search CSV ({filteredResults.length})
            </button>
          </div>
        </div>

        {/* Big Search Input Field */}
        <div className="mt-5 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-blue-600 dark:text-blue-400 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Type vendor code (e.g. VND-001), quote #, client name, SKU, PO #, lead, engineer..."
              className="w-full text-sm sm:text-base font-medium pl-12 pr-24 py-3 bg-slate-50 dark:bg-slate-800/80 border-2 border-blue-500/30 dark:border-blue-500/40 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Search Helper Suggestions */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Quick queries:</span>
          {['VND-001', 'Daikin', 'VRF', 'Copper Pipes', 'Blue Star', 'Mumbai', 'QT-', 'PO-'].map((tag) => (
            <button
              key={tag}
              onClick={() => onSearchChange(tag)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 text-[11px] font-mono transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Module Filters & Stats Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Horizontal Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin">
          {categoriesConfig.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary filters: Status & Sorting */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active / Approved</option>
              <option value="pending">Pending / Draft</option>
              <option value="alert">Alerts / Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="title">Name / Title</option>
              <option value="code">Identifier Code</option>
              <option value="amount">Amount (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div>
          Showing <span className="font-bold text-slate-800 dark:text-slate-200">{filteredResults.length}</span> matching record
          {filteredResults.length !== 1 ? 's' : ''}{' '}
          {searchTerm ? (
            <span>
              for query &ldquo;<span className="font-semibold text-blue-600 dark:text-blue-400">{searchTerm}</span>&rdquo;
            </span>
          ) : (
            'across ERP database'
          )}
        </div>
      </div>

      {/* Results Cards List */}
      {filteredResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredResults.map((item) => {
            const CategoryIcon = item.categoryIcon;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Category Pill & Identifier Code */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${item.categoryColor}`}
                    >
                      <CategoryIcon className="w-3 h-3" />
                      {item.categoryLabel}
                    </span>

                    <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 tracking-wide">
                      {item.code}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 font-medium">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Details Badge Chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.details.map((detail, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>

                  {/* Amount / Date / Location */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {item.amount !== undefined && item.amount > 0 ? (
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        ₹{item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    ) : item.location ? (
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    ) : (
                      <div className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">Record Verified</div>
                    )}

                    {item.status && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.statusType === 'success'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : item.statusType === 'danger'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : item.statusType === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>
                </div>

                {/* Open View Action Button */}
                <div className="mt-3 pt-2">
                  <button
                    onClick={() => onNavigate(item.targetTab, { selectedItem: item.rawItem, code: item.code })}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 hover:text-white dark:text-slate-200 dark:hover:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-blue-600 transition-all shadow-2xs"
                  >
                    <span>Open in {item.categoryLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Results State */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-800">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No matching records found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            We couldn&apos;t find any records matching &ldquo;{searchTerm}&rdquo; in {activeCategory === 'all' ? 'any module' : activeCategory}. Try refining your search term, code, or switching category filters.
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                onSearchChange('');
                setActiveCategory('all');
                setStatusFilter('all');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Reset Search & Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
