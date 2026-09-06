import React, { useState, useRef } from 'react';
import {
  ShoppingCart,
  FileText,
  CheckCircle2,
  XCircle,
  Send,
  MessageSquare,
  Mail,
  Truck,
  Boxes,
  Plus,
  Search,
  Building,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  PackageCheck,
  Zap,
  Printer,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Layers,
  Sparkles,
  Download,
  Loader2,
  TrendingUp,
  Clock
} from 'lucide-react';
import {
  PurchaseRequisition,
  PurchaseOrder,
  Vendor,
  Project,
  InventoryItem,
  UserRole
} from '../types';
import { storageService } from '../services/storageService';
import { CommunicationService } from '../services/whatsappEmailService';
import { RBAC, ROLE_DEFINITIONS } from '../utils/rbac';
import { CreatePRModal } from './CreatePRModal';
import { CreatePOModal } from './CreatePOModal';
import { PRDetailModal } from './PRDetailModal';
import { PODetailModal } from './PODetailModal';
import { downloadElementAsPDF, triggerDirectPrint } from '../utils/pdfExportHelper';

interface ProcurementPRPOViewProps {
  prs: PurchaseRequisition[];
  pos: PurchaseOrder[];
  vendors: Vendor[];
  projects: Project[];
  inventory: InventoryItem[];
  currentRole: UserRole;
  onOpenNewPR?: () => void;
}

export const ProcurementPRPOView: React.FC<ProcurementPRPOViewProps> = ({
  prs,
  pos,
  vendors,
  projects,
  inventory,
  currentRole,
  onOpenNewPR
}) => {
  const [activeTab, setActiveTab] = useState<'prs' | 'pos'>('prs');
  const [search, setSearch] = useState('');
  const [isExportingReport, setIsExportingReport] = useState(false);
  const procurementReportRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isCreatePRModalOpen, setIsCreatePRModalOpen] = useState(false);
  const [isCreatePOModalOpen, setIsCreatePOModalOpen] = useState(false);
  const [viewingPR, setViewingPR] = useState<PurchaseRequisition | null>(null);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);

  // Quick Convert PR to PO state
  const [selectedPRForPO, setSelectedPRForPO] = useState<PurchaseRequisition | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.id || '');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [poPaymentTerms, setPoPaymentTerms] = useState<string>('30 days credit net upon delivery');

  // Inward Goods / GRN state
  const [selectedPOForGRN, setSelectedPOForGRN] = useState<PurchaseOrder | null>(null);
  const [receivedQtyMap, setReceivedQtyMap] = useState<Record<string, number>>({});

  const term = (search || '').trim().toLowerCase();

  // Filtered PRs
  const filteredPRs = prs.filter((p) => {
    return (
      !term ||
      (p.prNumber || '').toLowerCase().includes(term) ||
      (p.projectName || '').toLowerCase().includes(term) ||
      (p.requestedBy || '').toLowerCase().includes(term) ||
      (p.status || '').toLowerCase().includes(term)
    );
  });

  // Filtered POs
  const filteredPOs = pos.filter((p) => {
    return (
      !term ||
      (p.poNumber || '').toLowerCase().includes(term) ||
      (p.vendorName || '').toLowerCase().includes(term) ||
      (p.projectName || '').toLowerCase().includes(term) ||
      (p.status || '').toLowerCase().includes(term)
    );
  });

  const totalPREstimatedValue = filteredPRs.reduce((s, p) => s + p.totalEstimatedAmount, 0);
  const approvedPRCount = filteredPRs.filter((p) => p.status === 'Approved' || p.status === 'Converted to PO').length;
  const pendingPRCount = filteredPRs.filter((p) => p.status === 'Pending Approval').length;

  const totalPOValue = filteredPOs.reduce((s, p) => s + p.grandTotal, 0);
  const approvedPOCount = filteredPOs.filter((p) => p.status === 'Approved' || p.status === 'Sent to Vendor' || p.status === 'Partially Received' || p.status === 'Fulfilled').length;
  const pendingPOCount = filteredPOs.filter((p) => p.status === 'Pending Approval').length;

  const handleExportReportPDF = async () => {
    if (!procurementReportRef.current) return;
    setIsExportingReport(true);
    try {
      await downloadElementAsPDF(procurementReportRef.current, {
        filename: activeTab === 'prs'
          ? `AlphaERP_ProcurementRequisitions_Report_${new Date().toISOString().split('T')[0]}`
          : `AlphaERP_PurchaseOrders_Report_${new Date().toISOString().split('T')[0]}`,
        documentTitle: `AlphaERP - ${activeTab === 'prs' ? 'Procurement Requisitions (PR) Register' : 'Purchase Orders (PO) Commitment Register'}`
      });
    } finally {
      setIsExportingReport(false);
    }
  };

  const handlePrintReport = () => {
    triggerDirectPrint(
      procurementReportRef.current,
      activeTab === 'prs' ? 'AlphaERP_ProcurementRequisitions_Report' : 'AlphaERP_PurchaseOrders_Report'
    );
  };

  // RBAC checks
  const canCreatePR = RBAC.canCreatePR(currentRole);
  const canApprovePR = RBAC.canApprovePR(currentRole);
  const canCreatePO = RBAC.canCreatePO(currentRole);
  const canApprovePO = RBAC.canApprovePO(currentRole);
  const canTransmitPO = RBAC.canTransmitPO(currentRole);
  const canInward = RBAC.canInwardGoods(currentRole);

  // Action: Approve PR directly
  const handleApprovePR = (prId: string) => {
    if (!canApprovePR) {
      alert('Only Purchase/Procurement Manager or Admin can approve PRs.');
      return;
    }
    storageService.approvePR(prId);
  };

  // Action: Approve PO directly (Business Manager signoff)
  const handleApprovePO = (poId: string) => {
    if (!canApprovePO) {
      alert('Only Business Manager or Admin can approve Purchase Orders.');
      return;
    }
    storageService.approvePO(poId);
  };

  // Action: Convert PR to PO Submit
  const handleConvertPRToPOSubmit = () => {
    if (!selectedPRForPO || !selectedVendorId) return;
    try {
      storageService.convertPRToPO(
        selectedPRForPO.id,
        selectedVendorId,
        expectedDeliveryDate,
        poPaymentTerms
      );
      setSelectedPRForPO(null);
      setActiveTab('pos');
    } catch (e: any) {
      alert(e.message || 'Error converting PR to PO');
    }
  };

  // Action: Send PO to Vendor (WhatsApp / Email)
  const handleSendPOToVendor = (po: PurchaseOrder, channel: 'WhatsApp' | 'Email') => {
    if (!canTransmitPO) {
      alert('Your role does not have permission to transmit POs to vendors.');
      return;
    }
    storageService.sendPOToVendor(po.id, channel);
    const { subject, message } = CommunicationService.getPOTemplate(po);

    if (channel === 'WhatsApp') {
      const url = CommunicationService.getWhatsAppUrl(po.vendorPhone, message);
      window.open(url, '_blank');
    } else {
      const url = CommunicationService.getMailtoUrl(po.vendorEmail, subject, message);
      window.open(url, '_blank');
    }
  };

  // Action: Submit Goods Inwarding (GRN)
  const handleGRNSubmit = () => {
    if (!selectedPOForGRN) return;
    const itemsReceived = selectedPOForGRN.items.map((it) => ({
      sku: it.sku,
      qty: Number(receivedQtyMap[it.sku] ?? (it.orderedQty - it.receivedQty))
    }));

    storageService.receivePOGoods(selectedPOForGRN.id, itemsReceived);
    setSelectedPOForGRN(null);
  };

  const roleMeta = ROLE_DEFINITIONS[currentRole] || ROLE_DEFINITIONS.executive;

  return (
    <div className="space-y-5 pb-12">
      {/* Top RBAC Context Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900">Current Role Authority: </span>
            <span className={`px-2 py-0.5 rounded font-bold border ${roleMeta.badgeColor}`}>
              {roleMeta.name}
            </span>
            <span className="text-slate-500 ml-2 hidden sm:inline">
              (PR Approvals: {canApprovePR ? '✅ Yes' : '🔒 Procurement Only'} • PO Approvals: {canApprovePO ? '✅ Yes' : '🔒 Business Mgr Only'})
            </span>
          </div>
        </div>

        <div className="text-slate-500 text-[11px]">
          Use the profile header menu to switch roles or test permissions.
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              HVAC Procurement & Replenishment Pipeline
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {prs.length} PRs • {pos.length} POs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and track Purchase Requisitions, route for Procurement Manager approval, generate Purchase Orders, obtain Business Manager sign-off, and inward stock.
          </p>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportReportPDF}
            disabled={isExportingReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
            title="Export Current Procurement PR / PO Register as PDF"
          >
            {isExportingReport ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Report</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
            title="Print Current PR / PO Register Directly"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print</span>
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('prs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'prs' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Purchase Requisitions ({prs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'pos' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Purchase Orders ({pos.length})</span>
            </button>
          </div>

          {activeTab === 'prs' && (
            <button
              onClick={() => setIsCreatePRModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New PR</span>
            </button>
          )}

          {activeTab === 'pos' && (
            <button
              onClick={() => setIsCreatePOModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Direct PO</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Counter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-xs">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'prs' ? 'Search PR #, project, requester...' : 'Search PO #, vendor, project...'}
            className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs placeholder-slate-400 font-medium transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
          {activeTab === 'prs' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <strong>{prs.filter((p) => p.status === 'Pending Approval').length}</strong> PRs Awaiting Procurement Approval
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <strong>{pos.filter((p) => p.status === 'Pending Approval').length}</strong> POs Awaiting Business Manager Sign-off
            </>
          )}
        </div>
      </div>

      {/* Printable / Exportable Report Container */}
      <div ref={procurementReportRef} className="space-y-5 print-container bg-transparent">
        {/* Company Letterhead & Executive Procurement Register Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          {/* Top Accent Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 rounded-full" />

          {/* Letterhead Main Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-100 pb-5 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/25 shrink-0">
                  α
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight uppercase">
                    ALPHA HVAC SOLUTIONS & ENGINEERING SERVICES LTD
                  </h1>
                  <p className="text-xs font-semibold text-blue-600">
                    {activeTab === 'prs'
                      ? 'Central Materials Procurement Requisitions & Deficit Management Ledger'
                      : 'Purchase Order Commitments, OEM Vendor Awards & Logistics Schedule'}
                  </p>
                </div>
              </div>

              {/* Statutory Registrations Badges */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-mono pt-1">
                <span><strong className="font-semibold text-slate-700">HQ:</strong> MIDC Industrial Area, Andheri East, Mumbai 400093</span>
                <span className="text-slate-300">•</span>
                <span><strong className="font-semibold text-slate-700">GSTIN:</strong> 27AABCA1299K1Z4</span>
                <span className="text-slate-300">•</span>
                <span><strong className="font-semibold text-slate-700">Central Supply Depot:</strong> Navi Mumbai Warehouse</span>
              </div>
            </div>

            {/* Document Metadata Pill Box */}
            <div className="text-left sm:text-right bg-slate-50 p-3.5 rounded-2xl border border-slate-200 min-w-[220px] w-full sm:w-auto space-y-1 shrink-0">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white font-black rounded-lg uppercase tracking-wider text-[10px]">
                {activeTab === 'prs' ? 'Requisitions Register' : 'Purchase Orders Ledger'}
              </div>
              <div className="text-[11px] text-slate-600 pt-1">
                <span className="font-semibold text-slate-700">Report Date:</span>{' '}
                <strong className="font-mono text-slate-900">
                  {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </strong>
              </div>
              <div className="text-[10px] text-slate-500">
                <span className="font-semibold text-slate-600">Scope:</span>{' '}
                {search ? `Filtered by "${search}"` : `All Records (${activeTab === 'prs' ? filteredPRs.length + ' PRs' : filteredPOs.length + ' POs'})`}
              </div>
            </div>
          </div>

          {/* First Part of Report Detail: Executive KPI Material & Commercial Summary Cards */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Executive Procurement & Material Requisition Status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {activeTab === 'prs' ? (
                <>
                  {/* Card 1: Total Active Requisitions */}
                  <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl relative overflow-hidden shadow-xs">
                    <div className="h-1 bg-slate-400 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Total Active Requisitions
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center">
                        <Boxes className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-slate-900 mt-1 font-mono tracking-tight">
                      {filteredPRs.length} PRs
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Deficit project BoQ material requests
                    </div>
                  </div>

                  {/* Card 2: Pending Procurement Signoff */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl relative overflow-hidden shadow-xs">
                    <div className="h-1 bg-amber-500 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                        Pending Procurement Signoff
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-amber-900 mt-1 font-mono tracking-tight">
                      {pendingPRCount} PRs
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">
                      Awaiting department manager validation
                    </div>
                  </div>

                  {/* Card 3: Estimated Material Budget */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl relative overflow-hidden shadow-xs">
                    <div className="h-1 bg-emerald-500 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Estimated Material Budget
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-emerald-200/80 text-emerald-800 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-emerald-900 mt-1 font-mono tracking-tight">
                      ₹{(totalPREstimatedValue / 100000).toFixed(2)} Lakhs
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">
                      {approvedPRCount} Approved & ready for PO conversion
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Card 1: Total Purchase Orders */}
                  <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl relative overflow-hidden shadow-xs">
                    <div className="h-1 bg-slate-400 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Total Purchase Orders
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center">
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-slate-900 mt-1 font-mono tracking-tight">
                      {filteredPOs.length} POs
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Vendor & OEM commitments issued
                    </div>
                  </div>

                  {/* Card 2: Pending Business Signoff */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl relative overflow-hidden shadow-xs">
                    <div className="h-1 bg-amber-500 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                        Pending Business Signoff
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-amber-900 mt-1 font-mono tracking-tight">
                      {pendingPOCount} POs
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">
                      Awaiting executive commercial signoff
                    </div>
                  </div>

                  {/* Card 3: Committed Order Value */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl relative overflow-hidden shadow-xs">
                    <div className="h-1 bg-emerald-500 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Committed Order Value
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-emerald-200/80 text-emerald-800 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-emerald-900 mt-1 font-mono tracking-tight">
                      ₹{(totalPOValue / 100000).toFixed(2)} Lakhs
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">
                      {approvedPOCount} Approved & in active fulfillment
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      {/* TAB 1: PURCHASE REQUISITIONS (PR) */}
      {activeTab === 'prs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPRs.length === 0 ? (
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <div className="font-semibold text-slate-700 text-sm">No Purchase Requisitions Found</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No requisitions match your search criteria. Click "Create New PR" to raise a new material requirement.
              </p>
              {canCreatePR && (
                <button
                  onClick={() => setIsCreatePRModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create First PR
                </button>
              )}
            </div>
          ) : (
            filteredPRs.map((pr) => {
              const statusStyles: Record<string, string> = {
                Draft: 'bg-slate-100 text-slate-700 border-slate-200',
                'Pending Approval': 'bg-amber-100 text-amber-800 border-amber-200',
                Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                'Converted to PO': 'bg-blue-100 text-blue-800 border-blue-200',
                Rejected: 'bg-rose-100 text-rose-800 border-rose-200'
              };

              return (
                <div
                  key={pr.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-blue-300 transition-all cursor-pointer"
                  onClick={() => setViewingPR(pr)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{pr.prNumber}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusStyles[pr.status] || 'bg-slate-100'}`}>
                          {pr.status}
                        </span>
                        <span
                          className={`text-[9px] uppercase px-2 py-0.5 rounded-md font-bold ${
                            pr.priority === 'Urgent'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {pr.priority} Priority
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 line-clamp-1">{pr.projectName}</h3>
                      <div className="text-xs text-slate-500 font-medium">
                        Requested by: {pr.requestedBy} • {pr.requestDate}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-600 font-mono">
                        ₹{(pr.totalEstimatedAmount / 100000).toFixed(2)} L
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">{pr.items.length} Line Items</div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Deficit Materials Required:</span>
                      <span className="text-blue-600 font-semibold">{pr.items.length} Items</span>
                    </div>
                    {pr.items.slice(0, 3).map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-700 font-medium">
                        <div className="truncate max-w-[240px]">
                          <span className="font-mono text-blue-600 font-bold mr-1.5">[{it.sku}]</span>
                          <span>{it.name}</span>
                        </div>
                        <div className="font-bold text-slate-900 font-mono text-[11px]">
                          {it.requiredQty} {it.unit} (~₹{it.estimatedTotal.toLocaleString()})
                        </div>
                      </div>
                    ))}
                    {pr.items.length > 3 && (
                      <div className="text-[10px] text-slate-400 font-semibold text-center pt-1">
                        + {pr.items.length - 3} more items (Click card to view all)
                      </div>
                    )}
                  </div>

                  {/* Remarks & Approver */}
                  {pr.approvalRemarks && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800">Remarks:</span> {pr.approvalRemarks}
                      {pr.approvedBy && (
                        <span className="block text-[10px] text-blue-600 font-semibold mt-0.5">
                          Approved by: {pr.approvedBy}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div
                    className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 no-print"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setViewingPR(pr)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Direct PR Approval (Procurement Manager / Admin) */}
                      {pr.status === 'Pending Approval' && canApprovePR && (
                        <button
                          onClick={() => handleApprovePR(pr.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve PR</span>
                        </button>
                      )}

                      {/* Convert to PO */}
                      {pr.status === 'Approved' && (
                        <button
                          onClick={() => setSelectedPRForPO(pr)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          <span>Convert to PO</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {pr.status === 'Converted to PO' && (
                        <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Converted ({pr.convertedPoNumber})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS (PO) */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPOs.length === 0 ? (
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <ShoppingCart className="w-8 h-8 mx-auto text-slate-300" />
              <div className="font-semibold text-slate-700 text-sm">No Purchase Orders Found</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No purchase orders match your search criteria. You can create direct POs or convert approved PRs.
              </p>
              {canCreatePO && (
                <button
                  onClick={() => setIsCreatePOModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Direct PO
                </button>
              )}
            </div>
          ) : (
            filteredPOs.map((po) => {
              const statusColors: Record<PurchaseOrder['status'], string> = {
                Draft: 'bg-slate-100 text-slate-700 border-slate-200',
                'Pending Approval': 'bg-amber-100 text-amber-800 border-amber-200',
                Approved: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                'Sent to Vendor': 'bg-blue-100 text-blue-800 border-blue-200',
                'Partially Received': 'bg-amber-100 text-amber-800 border-amber-200',
                Fulfilled: 'bg-teal-100 text-teal-800 border-teal-200',
                Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
                Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
              };

              return (
                <div
                  key={po.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-emerald-300 transition-all cursor-pointer"
                  onClick={() => setViewingPO(po)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{po.poNumber}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusColors[po.status] || 'bg-slate-100'}`}>
                          {po.status}
                        </span>
                        {po.prNumber && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                            PR: {po.prNumber}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 line-clamp-1">{po.vendorName}</h3>
                      <div className="text-xs text-slate-500 font-medium">
                        Project: {po.projectName} • Expected: {po.expectedDeliveryDate}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-600 font-mono">
                        ₹{(po.grandTotal / 100000).toFixed(2)} L
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">incl. 18% GST & Freight</div>
                    </div>
                  </div>

                  {/* Items Ordered Table Preview */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Ordered Equipment & SKUs:</span>
                      <span className="text-emerald-700 font-semibold">{po.items.length} Items</span>
                    </div>
                    {po.items.slice(0, 3).map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-700 font-medium">
                        <div className="truncate max-w-[240px]">
                          <span className="font-mono text-blue-600 font-bold mr-1.5">[{it.sku}]</span>
                          <span>{it.name}</span>
                        </div>
                        <div className="font-bold text-slate-900 flex items-center gap-2 font-mono text-[11px]">
                          <span>
                            {it.orderedQty} {it.unit}
                          </span>
                          {it.receivedQty > 0 && (
                            <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                              ({it.receivedQty} Inwarded)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {po.items.length > 3 && (
                      <div className="text-[10px] text-slate-400 font-semibold text-center pt-1">
                        + {po.items.length - 3} more items (Click to view full PO)
                      </div>
                    )}
                  </div>

                  {/* Approver / Remarks */}
                  {po.approvalRemarks && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800">Business Signoff:</span> {po.approvalRemarks}
                      {po.approvedBy && (
                        <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5">
                          Approved by: {po.approvedBy}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions Toolbar */}
                  <div
                    className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs no-print"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingPO(po)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View PO Details
                      </button>
                      <button
                        onClick={() => setViewingPO(po)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                        title="Print or Generate PDF for this Purchase Order"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print / PDF
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Business Manager / Admin Signoff */}
                      {(po.status === 'Pending Approval' || po.status === 'Draft') && canApprovePO && (
                        <button
                          onClick={() => handleApprovePO(po.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve PO (Sign-off)</span>
                        </button>
                      )}

                      {/* Transmit to Vendor via WhatsApp */}
                      {po.status === 'Approved' && canTransmitPO && (
                        <button
                          onClick={() => handleSendPOToVendor(po, 'WhatsApp')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 font-bold transition-colors shadow-xs"
                          title="Transmit PO via WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp PO</span>
                        </button>
                      )}

                      {/* Transmit to Vendor via Email */}
                      {po.status === 'Approved' && canTransmitPO && (
                        <button
                          onClick={() => handleSendPOToVendor(po, 'Email')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 font-bold transition-colors shadow-xs"
                          title="Transmit PO via Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email PO</span>
                        </button>
                      )}

                      {/* Inward Goods GRN */}
                      {(po.status === 'Sent to Vendor' || po.status === 'Partially Received') && canInward && (
                        <button
                          onClick={() => {
                            setSelectedPOForGRN(po);
                            const initialMap: Record<string, number> = {};
                            po.items.forEach((it) => {
                              initialMap[it.sku] = it.orderedQty - it.receivedQty;
                            });
                            setReceivedQtyMap(initialMap);
                          }}
                          className="flex items-center gap-1 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs shadow-xs"
                          title="Record Goods Receipt & Replenish Stock"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Inward Stock (GRN)</span>
                        </button>
                      )}

                      {po.status === 'Fulfilled' && (
                        <span className="text-xs font-bold text-teal-700 flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Inwarded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

        {/* Official Document Footer for Exported PDF */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-slate-500 gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="font-semibold text-slate-700">ISO 9001:2015 Central Procurement Compliance</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                All procurement requisitions and purchase orders are logged in accordance with Alpha ERP strict authorization matrix and central BoQ budget control.
              </p>
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              Doc Ref: AEP-{activeTab.toUpperCase()}-{(search ? 'FLT' : 'ALL')}-{new Date().getFullYear()}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-center">
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">Prepared By</div>
              <div className="text-xs font-bold text-slate-800">Project Site Engineer</div>
              <div className="text-[10px] text-slate-500">BoQ Material Takeoff</div>
            </div>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">Procurement Manager</div>
              <div className="text-xs font-bold text-slate-800">Verified & Approved</div>
              <div className="text-[10px] text-slate-500">Rate & Spec Authorization</div>
            </div>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">Commercial Controller</div>
              <div className="text-xs font-bold text-slate-800">Audit Verified</div>
              <div className="text-[10px] text-slate-500">Budget Compliance</div>
            </div>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-6">Director / Signatory</div>
              <div className="text-xs font-bold text-slate-800">Authorized Release</div>
              <div className="text-[10px] text-slate-500">Alpha ClimaTech ERP</div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Create New PR */}
      <CreatePRModal
        isOpen={isCreatePRModalOpen}
        onClose={() => setIsCreatePRModalOpen(false)}
        projects={projects}
        currentRole={currentRole}
        onPRCreated={() => {
          setIsCreatePRModalOpen(false);
          setActiveTab('prs');
        }}
      />

      {/* MODAL: Create Direct PO */}
      <CreatePOModal
        isOpen={isCreatePOModalOpen}
        onClose={() => setIsCreatePOModalOpen(false)}
        projects={projects}
        vendors={vendors}
        currentRole={currentRole}
        onPOCreated={() => {
          setIsCreatePOModalOpen(false);
          setActiveTab('pos');
        }}
      />

      {/* MODAL: View PR Details */}
      <PRDetailModal
        pr={viewingPR}
        isOpen={!!viewingPR}
        onClose={() => setViewingPR(null)}
        currentRole={currentRole}
        vendors={vendors}
        onOpenConvertModal={(pr) => setSelectedPRForPO(pr)}
      />

      {/* MODAL: View PO Details */}
      <PODetailModal
        po={viewingPO}
        isOpen={!!viewingPO}
        onClose={() => setViewingPO(null)}
        currentRole={currentRole}
        onOpenInwardModal={(po) => {
          setSelectedPOForGRN(po);
          const initialMap: Record<string, number> = {};
          po.items.forEach((it) => {
            initialMap[it.sku] = it.orderedQty - it.receivedQty;
          });
          setReceivedQtyMap(initialMap);
        }}
      />

      {/* MODAL: Convert PR to Purchase Order (PO) */}
      {selectedPRForPO && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Convert PR {selectedPRForPO.prNumber} to Purchase Order (PO)
                </h3>
              </div>
              <button
                onClick={() => setSelectedPRForPO(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Supplier / OEM Vendor *:</label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.categoriesSupplied.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Expected Delivery Date *:</label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Terms:</label>
                  <input
                    type="text"
                    value={poPaymentTerms}
                    onChange={(e) => setPoPaymentTerms(e.target.value)}
                    placeholder="30 days credit / Advance"
                    className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Items Summary */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order Items:</div>
                {selectedPRForPO.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700 font-medium">
                    <span>
                      {it.name} ({it.sku})
                    </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {it.requiredQty} {it.unit}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-emerald-600 font-bold">
                  <span>Est. Total (incl. GST):</span>
                  <span className="font-mono">₹{(selectedPRForPO.totalEstimatedAmount * 1.18).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPRForPO(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertPRToPOSubmit}
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-colors"
              >
                <span>Generate Official PO</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Warehouse Inwarding / Goods Receipt Note (GRN) */}
      {selectedPOForGRN && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Goods Inwarding (GRN) - {selectedPOForGRN.poNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPOForGRN(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Verify actual received quantities from supplier{' '}
              <strong className="text-slate-900">{selectedPOForGRN.vendorName}</strong>. This automatically updates warehouse inventory levels and fulfills BOQ shortages.
            </p>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedPOForGRN.items.map((it) => {
                const remaining = it.orderedQty - it.receivedQty;
                return (
                  <div
                    key={it.sku}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{it.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        SKU: {it.sku} • Ordered: {it.orderedQty} {it.unit} • Inwarded: {it.receivedQty} {it.unit}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Qty:</span>
                      <input
                        type="number"
                        min="0"
                        max={remaining}
                        value={receivedQtyMap[it.sku] ?? remaining}
                        onChange={(e) =>
                          setReceivedQtyMap({
                            ...receivedQtyMap,
                            [it.sku]: Number(e.target.value)
                          })
                        }
                        className="w-20 bg-white text-slate-900 font-bold px-2 py-1 rounded-lg border border-slate-300 text-center font-mono focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="text-slate-500 font-medium">{it.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPOForGRN(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGRNSubmit}
                className="flex items-center gap-1.5 px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 transition-colors"
              >
                <Boxes className="w-4 h-4" />
                <span>Confirm Stock Inwarding</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
