import React, { useState, useRef } from 'react';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Plus,
  Search,
  Building,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Calendar,
  Sparkles,
  Printer,
  Receipt,
  Download,
  Loader2,
  Camera,
  Image as ImageIcon,
  Eye,
  Paperclip,
  TrendingUp,
  ShieldCheck,
  Building2,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentRecord, Project, InvoiceAttachment } from '../types';
import { storageService } from '../services/storageService';
import { ProjectCompletionBillModal } from './ProjectCompletionBillModal';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { downloadElementAsPDF, triggerDirectPrint, exportFinancePaymentsPDF } from '../utils/pdfExportHelper';
import { FinancePaymentsPreviewModal } from './FinancePaymentsPreviewModal';
import { InvoiceCameraModal } from './finance/InvoiceCameraModal';
import { InvoiceAttachmentGalleryModal } from './finance/InvoiceAttachmentGalleryModal';

interface FinancePaymentsViewProps {
  payments: PaymentRecord[];
  projects: Project[];
  onOpenSheetsModal: () => void;
}

export const FinancePaymentsView: React.FC<FinancePaymentsViewProps> = ({
  payments,
  projects,
  onOpenSheetsModal
}) => {
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables'>('receivables');
  const [search, setSearch] = useState('');
  const [selectedPaymentForRecord, setSelectedPaymentForRecord] = useState<PaymentRecord | null>(null);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<PaymentRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['paymentMethod']>('Bank NEFT');
  const [transactionRef, setTransactionRef] = useState<string>('NEFT-' + Math.floor(1000000 + Math.random() * 9000000));
  const [notes, setNotes] = useState<string>('Milestone payment settled via corporate banking');
  const [pendingModalAttachment, setPendingModalAttachment] = useState<InvoiceAttachment | null>(null);
  const [selectedProjectForBillModal, setSelectedProjectForBillModal] = useState<Project | null>(null);
  const [showProjectPickerForBill, setShowProjectPickerForBill] = useState(false);
  const [isExportingReport, setIsExportingReport] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const reportPrintRef = useRef<HTMLDivElement>(null);

  // Camera & Attachments State
  const [selectedPaymentForCamera, setSelectedPaymentForCamera] = useState<PaymentRecord | null>(null);
  const [selectedPaymentForGallery, setSelectedPaymentForGallery] = useState<PaymentRecord | null>(null);
  const [showQuickScanSelector, setShowQuickScanSelector] = useState(false);

  const term = (search || '').trim().toLowerCase();
  const filteredPayments = payments.filter((p) => {
    const isReceivable = !p.isPayable;
    const tabMatch = activeTab === 'receivables' ? isReceivable : !isReceivable;
    const searchMatch =
      !term ||
      (p.invoiceNumber || '').toLowerCase().includes(term) ||
      (p.clientOrVendorName || '').toLowerCase().includes(term) ||
      (p.projectName || '').toLowerCase().includes(term) ||
      (p.referenceTitle || '').toLowerCase().includes(term) ||
      (p.milestoneTitle || '').toLowerCase().includes(term) ||
      (p.paymentType || '').toLowerCase().includes(term);

    return tabMatch && searchMatch;
  });

  const totalReceivables = payments.filter((p) => !p.isPayable).reduce((s, p) => s + p.totalAmount, 0);
  const collectedReceivables = payments.filter((p) => !p.isPayable && p.status === 'Paid').reduce((s, p) => s + p.totalAmount, 0);
  const pendingReceivables = totalReceivables - collectedReceivables;

  const totalPayables = payments.filter((p) => p.isPayable).reduce((s, p) => s + p.totalAmount, 0);
  const paidPayables = payments.filter((p) => p.isPayable && p.status === 'Paid').reduce((s, p) => s + p.totalAmount, 0);
  const pendingPayables = totalPayables - paidPayables;

  const handleExportReportPDF = async () => {
    setIsExportingReport(true);
    try {
      // First attempt direct high-precision vector jsPDF generation
      const listToExport = filteredPayments;
      const success = exportFinancePaymentsPDF(listToExport, activeTab, {
        filename: activeTab === 'receivables'
          ? `AlphaERP_ClientReceivables_Report_${new Date().toISOString().split('T')[0]}`
          : `AlphaERP_VendorPayables_Report_${new Date().toISOString().split('T')[0]}`,
        filterTitle: activeTab === 'receivables' ? 'Client Milestone Receivables' : 'Vendor Procurement Payables'
      });

      // Fallback to canvas DOM exporter if needed
      if (!success && reportPrintRef.current) {
        await downloadElementAsPDF(reportPrintRef.current, {
          filename: activeTab === 'receivables'
            ? `AlphaERP_ClientReceivables_Report_${new Date().toISOString().split('T')[0]}`
            : `AlphaERP_VendorPayables_Report_${new Date().toISOString().split('T')[0]}`,
          documentTitle: `AlphaERP - ${activeTab === 'receivables' ? 'Client Receivables & Milestone Billing Report' : 'Vendor Payables & Disbursement Schedule Report'}`
        });
      }
    } catch (err) {
      console.error('Export Report PDF error:', err);
      if (reportPrintRef.current) {
        await downloadElementAsPDF(reportPrintRef.current, {
          filename: activeTab === 'receivables'
            ? `AlphaERP_ClientReceivables_Report_${new Date().toISOString().split('T')[0]}`
            : `AlphaERP_VendorPayables_Report_${new Date().toISOString().split('T')[0]}`,
          documentTitle: `AlphaERP - ${activeTab === 'receivables' ? 'Client Receivables & Milestone Billing Report' : 'Vendor Payables & Disbursement Schedule Report'}`
        });
      }
    } finally {
      setIsExportingReport(false);
    }
  };

  const handlePrintReport = () => {
    triggerDirectPrint(
      reportPrintRef.current,
      activeTab === 'receivables' ? 'AlphaERP_ClientReceivables_Report' : 'AlphaERP_VendorPayables_Report'
    );
  };

  const handleRecordPaymentSubmit = () => {
    if (!selectedPaymentForRecord) return;
    storageService.processPayment(
      selectedPaymentForRecord.id,
      paymentMethod,
      transactionRef,
      pendingModalAttachment || undefined
    );
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    setSelectedPaymentForRecord(null);
    setPendingModalAttachment(null);
  };

  const handleSaveCameraAttachment = (attachment: InvoiceAttachment) => {
    if (selectedPaymentForCamera) {
      storageService.addPaymentAttachment(selectedPaymentForCamera.id, attachment);
      // Update selectedPaymentForGallery if it's currently open
      if (selectedPaymentForGallery && selectedPaymentForGallery.id === selectedPaymentForCamera.id) {
        const updated = storageService.getPayments().find((p) => p.id === selectedPaymentForCamera.id);
        if (updated) setSelectedPaymentForGallery(updated);
      }
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">HVAC Milestone Billing & Payment Processing</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {payments.length} Invoices
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Automated milestone collection tracking (30% Advance, 40% Delivery, 20% Erection, 10% Handover) and vendor payables.
          </p>
        </div>

        {/* Tab Switcher, Camera Scanner, Export Report & Bill Generator */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowQuickScanSelector(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            title="Open camera to photograph a physical paper invoice or receipt"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan / Photo Invoice</span>
          </button>

          <button
            id="btn-finance-download-pdf"
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            title="Preview report structure and download milestone & payment report as PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
            title="Print Current Report Directly"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print</span>
          </button>

          <button
            onClick={() => setShowProjectPickerForBill(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition-colors shadow-xs"
            title="Generate & Print Official Final Project Completion Bill & Handover Tax Invoice"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>Project Completion Bill</span>
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('receivables')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'receivables' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Client Receivables</span>
            </button>
            <button
              onClick={() => setActiveTab('payables')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'payables' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Vendor Payables</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable / Exportable Report Sheet Area */}
      <div ref={reportPrintRef} className="space-y-5 print-container bg-transparent">
        {/* Company Letterhead & Executive Ledger Banner */}
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
                    {activeTab === 'receivables'
                      ? 'Corporate Client Receivables & Milestone Billing Register'
                      : 'Vendor Payables, OEM Procurement & Disbursement Schedule'}
                  </p>
                </div>
              </div>

              {/* Statutory Registrations Badges */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-mono pt-1">
                <span><strong className="font-semibold text-slate-700">HQ:</strong> MIDC Industrial Area, Andheri East, Mumbai 400093</span>
                <span className="text-slate-300">•</span>
                <span><strong className="font-semibold text-slate-700">GSTIN:</strong> 27AABCA1299K1Z4</span>
                <span className="text-slate-300">•</span>
                <span><strong className="font-semibold text-slate-700">PAN:</strong> AABCA1299K</span>
                <span className="text-slate-300">•</span>
                <span><strong className="font-semibold text-slate-700">CIN:</strong> U29190MH2018PLC312984</span>
              </div>
            </div>

            {/* Document Metadata Pill Box */}
            <div className="text-left sm:text-right bg-slate-50 p-3.5 rounded-2xl border border-slate-200 min-w-[220px] w-full sm:w-auto space-y-1 shrink-0">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white font-black rounded-lg uppercase tracking-wider text-[10px]">
                {activeTab === 'receivables' ? 'Client Receivables Ledger' : 'Vendor Payables Ledger'}
              </div>
              <div className="text-[11px] text-slate-600 pt-1">
                <span className="font-semibold text-slate-700">Report Date:</span>{' '}
                <strong className="font-mono text-slate-900">
                  {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </strong>
              </div>
              <div className="text-[10px] text-slate-500">
                <span className="font-semibold text-slate-600">Scope:</span>{' '}
                {search ? `Filtered by "${search}"` : `All Records (${filteredPayments.length} Invoices)`}
              </div>
            </div>
          </div>

          {/* First Part of Report Detail: Executive KPI Financial Summary Cards */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Executive Financial Summary & Milestone Liquidity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {activeTab === 'receivables' ? (
                <>
                  {/* Card 1: Total Contract Billings */}
                  <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl relative overflow-hidden shadow-xs">
                    <div className="h-1 bg-slate-400 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Total Contract Billings
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-slate-900 mt-1 font-mono tracking-tight">
                      ₹{(totalReceivables / 100000).toFixed(2)} Lakhs
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Across active project milestone schedules
                    </div>
                  </div>

                  {/* Card 2: Realized / Collected Milestone Funds */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl relative overflow-hidden shadow-xs">
                    <div className="h-1 bg-emerald-500 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Collected Milestone Funds
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-emerald-200/80 text-emerald-800 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-emerald-900 mt-1 font-mono tracking-tight">
                      ₹{(collectedReceivables / 100000).toFixed(2)} Lakhs
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">
                      Realized via certified bank settlements
                    </div>
                  </div>

                  {/* Card 3: Pending Milestone Invoices */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl relative overflow-hidden shadow-xs">
                    <div className="h-1 bg-amber-500 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                        Pending Milestone Invoices
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-amber-900 mt-1 font-mono tracking-tight">
                      ₹{(pendingReceivables / 100000).toFixed(2)} Lakhs
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">
                      Awaiting stage verification & client release
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Card 1: Total Vendor Invoices */}
                  <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl relative overflow-hidden shadow-xs">
                    <div className="h-1 bg-slate-400 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Total Vendor Invoices
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-slate-900 mt-1 font-mono tracking-tight">
                      ₹{(totalPayables / 100000).toFixed(2)} Lakhs
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      OEM equipment & subcontracting claims
                    </div>
                  </div>

                  {/* Card 2: Disbursed to Vendors */}
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl relative overflow-hidden shadow-xs">
                    <div className="h-1 bg-emerald-500 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Disbursed to Vendors
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-emerald-200/80 text-emerald-800 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-emerald-900 mt-1 font-mono tracking-tight">
                      ₹{(paidPayables / 100000).toFixed(2)} Lakhs
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">
                      Settled via NEFT / RTGS banking
                    </div>
                  </div>

                  {/* Card 3: Outstanding Payables */}
                  <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl relative overflow-hidden shadow-xs">
                    <div className="h-1 bg-rose-500 absolute top-0 inset-x-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                        Outstanding Payables
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-rose-200/80 text-rose-800 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-rose-900 mt-1 font-mono tracking-tight">
                      ₹{(pendingPayables / 100000).toFixed(2)} Lakhs
                    </div>
                    <div className="text-[10px] text-rose-700 mt-0.5">
                      Pending Goods Receipt Note & quality inspection
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">{activeTab === 'receivables' ? 'Client' : 'Supplier / OEM'}</th>
                  <th className="py-3.5 px-4">Milestone Description</th>
                  <th className="py-3.5 px-4 text-center">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                  <th className="py-3.5 px-4 text-center">Physical Invoice</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Payment Ref</th>
                  <th className="py-3.5 px-4 text-right no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => {
                  const isPaid = p.status === 'Paid';
                  const attachments = p.attachments || [];
                  const hasAttachments = attachments.length > 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedInvoiceForModal(p)}
                          className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                          title="Click to view & export formal Tax Invoice PDF"
                        >
                          {p.invoiceNumber}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-semibold">
                        {p.referenceType === 'EmployeeExit' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Exit F&F
                            </span>
                            <span className="text-slate-900 font-semibold">{p.referenceTitle || 'Employee Exit Settlement'}</span>
                          </div>
                        ) : (
                          p.projectName || p.referenceTitle || 'Alpha HVAC Projects'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{p.clientOrVendorName}</td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-semibold text-slate-900">
                          {p.referenceType === 'EmployeeExit' ? (p.paymentType || 'Full & Final Payout') : (p.milestoneTitle || p.paymentType)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {p.referenceType === 'EmployeeExit' ? 'Statutory & Final Dues' : `${p.milestonePercentage || 100}% Milestone`}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 font-mono">{p.dueDate}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600 font-mono">
                        ₹{p.totalAmount.toLocaleString()}
                      </td>

                      {/* Physical Invoice Camera & Photo Attachments Column */}
                      <td className="py-3.5 px-4 text-center no-print">
                        {hasAttachments ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedPaymentForGallery(p)}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[11px] border border-blue-200 shadow-2xs transition-all cursor-pointer group"
                              title="Click to view attached invoice photo(s)"
                            >
                              <Camera className="w-3 h-3 text-blue-600 group-hover:scale-110 transition-transform" />
                              <span>{attachments.length} Photo{attachments.length > 1 ? 's' : ''}</span>
                            </button>
                            <button
                              onClick={() => setSelectedPaymentForCamera(p)}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                              title="Capture additional physical invoice photo with camera"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedPaymentForCamera(p)}
                            className="flex items-center justify-center gap-1.5 mx-auto px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg font-medium text-[11px] border border-slate-200 hover:border-blue-300 shadow-2xs transition-all cursor-pointer group"
                            title="Take photo of physical paper invoice using camera"
                          >
                            <Camera className="w-3 h-3 text-blue-500 group-hover:scale-110 transition-transform" />
                            <span>Capture Photo</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : p.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-[11px] text-slate-500 font-mono">
                        {p.transactionReference || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Dedicated Download PDF Button on Invoice Row */}
                          <button
                            onClick={() => setSelectedInvoiceForModal(p)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs border border-blue-200 shadow-2xs transition-all cursor-pointer"
                            title="View and Download Official Tax Invoice / Payment Voucher as PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>

                          {!isPaid ? (
                            <button
                              onClick={() => {
                                setSelectedPaymentForRecord(p);
                                setPendingModalAttachment(null);
                                setTransactionRef(
                                  (paymentMethod === 'Bank NEFT' ? 'NEFT-' : 'UPI-') +
                                    Math.floor(1000000 + Math.random() * 9000000)
                                );
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
                            >
                              Record Payment
                            </button>
                          ) : (
                            <span className="text-emerald-700 text-xs font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paid
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Footer / Signature Blocks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-end gap-6 pt-6">
          <div className="space-y-1 text-[11px] text-slate-500">
            <div className="font-bold text-slate-800">AlphaERP Milestone Reconciliation Note:</div>
            <div>• All amounts are in Indian Rupees (INR) and reconciled with the general ledger.</div>
            <div>• TDS deductions and GST Reverse Charge Mechanisms (RCM) are applicable per statutory rules.</div>
            <div>• Computer-generated report certified by Alpha ClimaTech Financial Controller.</div>
          </div>
          <div className="flex gap-8 text-center shrink-0">
            <div className="border-t border-slate-300 pt-2 px-4">
              <div className="font-bold text-slate-900 text-xs">Prepared By</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Finance Executive</div>
            </div>
            <div className="border-t border-slate-300 pt-2 px-4">
              <div className="font-bold text-slate-900 text-xs">Authorized Signatory</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Chief Financial Officer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {selectedPaymentForRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Process {activeTab === 'receivables' ? 'Collection' : 'Payment'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPaymentForRecord(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Invoice:</span>
                  <span className="font-mono font-bold text-blue-600">{selectedPaymentForRecord.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Milestone:</span>
                  <span className="text-slate-900 font-semibold">{selectedPaymentForRecord.milestoneTitle}</span>
                </div>
                <div className="flex justify-between text-slate-700 pt-2 border-t border-slate-200 text-sm font-bold text-emerald-600">
                  <span>Amount to Settle:</span>
                  <span className="font-mono">₹{selectedPaymentForRecord.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Bank NEFT">Bank NEFT / RTGS Wire Transfer</option>
                  <option value="UPI">UPI / Instant Corporate QR</option>
                  <option value="Credit Card">Corporate Credit Card (Stripe Gateway)</option>
                  <option value="Cheque">Bank Demand Draft / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Transaction Ref / UTR / Cheque #:</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Accounting Remarks:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 p-2 rounded-xl border border-slate-200 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Physical Invoice / Receipt Camera Attachment Section */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>Physical Invoice / Payment Receipt Photo</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>

                {pendingModalAttachment ? (
                  <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={pendingModalAttachment.dataUrl}
                        alt="Attached Invoice"
                        className="w-12 h-12 object-cover rounded-lg border border-blue-300 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0 text-left">
                        <div className="font-bold text-slate-900 text-xs truncate">{pendingModalAttachment.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {pendingModalAttachment.capturedVia === 'camera' ? '📷 Camera Snapshot' : '📁 File Upload'} • {(pendingModalAttachment.sizeBytes / 1024).toFixed(0)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingModalAttachment(null)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove attachment"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentForCamera(selectedPaymentForRecord);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 font-bold text-xs shadow-2xs transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>Take Photo with Camera</span>
                    </button>
                    <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 font-semibold text-xs transition-colors cursor-pointer shrink-0">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (loadEvt) => {
                            const result = loadEvt.target?.result as string;
                            if (result) {
                              setPendingModalAttachment({
                                id: 'att-' + Date.now(),
                                dataUrl: result,
                                name: file.name || 'Invoice-Doc.jpg',
                                capturedAt: new Date().toISOString(),
                                sizeBytes: file.size,
                                mimeType: file.type || 'image/jpeg',
                                capturedVia: 'upload'
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedPaymentForRecord(null);
                  setPendingModalAttachment(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPaymentSubmit}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Mark Paid</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Scan Invoice Selector Modal */}
      {showQuickScanSelector && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Select Invoice to Photograph</h3>
                  <p className="text-xs text-slate-500">Pick an invoice transaction to launch the camera and capture physical bill photos</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickScanSelector(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {filteredPayments.map((p) => {
                const attachCount = (p.attachments || []).length;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setShowQuickScanSelector(false);
                      setSelectedPaymentForCamera(p);
                    }}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{p.invoiceNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          {p.milestoneTitle}
                        </span>
                        {attachCount > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                            {attachCount} Photo{attachCount > 1 ? 's' : ''} Attached
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-1 truncate">{p.projectName}</div>
                      <div className="text-[11px] text-slate-500 truncate">{p.clientOrVendorName}</div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-xs font-bold text-emerald-600 font-mono">
                        ₹{p.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-blue-600 group-hover:text-blue-700 font-semibold flex items-center gap-1 justify-end mt-1">
                        <Camera className="w-3 h-3" />
                        <span>Open Camera</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowQuickScanSelector(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Live Camera Capture Modal */}
      {selectedPaymentForCamera && (
        <InvoiceCameraModal
          payment={selectedPaymentForCamera}
          onSaveAttachment={(attachment) => {
            if (selectedPaymentForRecord && selectedPaymentForRecord.id === selectedPaymentForCamera.id) {
              setPendingModalAttachment(attachment);
            }
            handleSaveCameraAttachment(attachment);
          }}
          onClose={() => setSelectedPaymentForCamera(null)}
        />
      )}

      {/* Invoice Attachment Gallery & Lightbox Modal */}
      {selectedPaymentForGallery && (
        <InvoiceAttachmentGalleryModal
          payment={selectedPaymentForGallery}
          onOpenNewCapture={() => {
            const p = selectedPaymentForGallery;
            setSelectedPaymentForGallery(null);
            setSelectedPaymentForCamera(p);
          }}
          onAttachmentsUpdated={() => {
            const updated = storageService.getPayments().find((p) => p.id === selectedPaymentForGallery.id);
            if (updated) {
              setSelectedPaymentForGallery(updated);
            }
          }}
          onClose={() => setSelectedPaymentForGallery(null)}
        />
      )}

      {/* Project Selector Modal for Final Completion Bill */}
      {showProjectPickerForBill && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Print Project Completion Bill</h3>
                  <p className="text-xs text-slate-500">Select a project to generate its formal completion handover tax invoice</p>
                </div>
              </div>
              <button
                onClick={() => setShowProjectPickerForBill(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectForBillModal(proj);
                    setShowProjectPickerForBill(false);
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{proj.projectNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {proj.status}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs mt-1 truncate">{proj.projectName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{proj.clientName} • {proj.siteAddress}</div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="text-xs font-bold text-emerald-600 font-mono">
                      ₹{(proj.contractValue / 100000).toFixed(1)} L
                    </div>
                    <div className="text-[10px] text-slate-400 group-hover:text-emerald-700 font-semibold flex items-center gap-1 justify-end mt-1">
                      <span>Generate Bill</span>
                      <Printer className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowProjectPickerForBill(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Completion Bill & Handover Tax Invoice Modal */}
      {selectedProjectForBillModal && (
        <ProjectCompletionBillModal
          project={selectedProjectForBillModal}
          onClose={() => setSelectedProjectForBillModal(null)}
        />
      )}

      {/* Dedicated High-Resolution Statutory Tax Invoice Modal with Export to PDF & Print */}
      {selectedInvoiceForModal && (
        <InvoiceDetailModal
          invoice={selectedInvoiceForModal}
          isOpen={!!selectedInvoiceForModal}
          onClose={() => setSelectedInvoiceForModal(null)}
          onRecordPayment={(inv) => {
            setSelectedPaymentForRecord(inv);
            setPendingModalAttachment(null);
            setTransactionRef(
              (paymentMethod === 'Bank NEFT' ? 'NEFT-' : 'UPI-') +
                Math.floor(1000000 + Math.random() * 9000000)
            );
          }}
        />
      )}

      {/* Finance Report PDF Verification & Preview Modal */}
      <FinancePaymentsPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        payments={filteredPayments}
        activeTab={activeTab}
        filterTitle={activeTab === 'receivables' ? 'Client Milestone Receivables' : 'Vendor Procurement Payables'}
      />
    </div>
  );
};
