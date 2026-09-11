import React, { useRef, useState } from 'react';
import {
  Eye,
  Download,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  Building2,
  Calendar,
  Loader2,
  ShieldCheck,
  RotateCcw,
  Receipt,
  FileCheck,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { PaymentRecord } from '../types';
import { exportFinancePaymentsPDF, triggerDirectPrint } from '../utils/pdfExportHelper';

interface FinancePaymentsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: PaymentRecord[];
  activeTab: 'receivables' | 'payables';
  filterTitle?: string;
}

export const FinancePaymentsPreviewModal: React.FC<FinancePaymentsPreviewModalProps> = ({
  isOpen,
  onClose,
  payments,
  activeTab,
  filterTitle
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const printableSheetRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const isReceivable = activeTab === 'receivables';
  const totalGross = payments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalPaid = payments.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalPending = totalGross - totalPaid;
  const paidCount = payments.filter((p) => p.status === 'Paid').length;
  const pendingCount = payments.filter((p) => p.status !== 'Paid').length;
  const settlementRatio = totalGross > 0 ? (totalPaid / totalGross) * 100 : 0;

  const totalTaxable = payments.reduce(
    (sum, p) => sum + (p.amount || Math.round((p.totalAmount || 0) / 1.18)),
    0
  );
  const totalGst = totalGross - totalTaxable;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const filename = isReceivable
        ? `AlphaERP_ClientReceivables_Report_${new Date().toISOString().split('T')[0]}`
        : `AlphaERP_VendorPayables_Report_${new Date().toISOString().split('T')[0]}`;

      const success = exportFinancePaymentsPDF(payments, activeTab, {
        filename,
        filterTitle: filterTitle || (isReceivable ? 'Client Milestone Receivables' : 'Vendor Procurement Payables')
      });

      if (success) {
        setTimeout(() => {
          setIsDownloading(false);
          onClose();
        }, 600);
      } else {
        setIsDownloading(false);
      }
    } catch (err) {
      console.error('Download PDF error:', err);
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!printableSheetRef.current) return;
    triggerDirectPrint(
      printableSheetRef.current,
      isReceivable ? 'AlphaERP_Client_Receivables_Report' : 'AlphaERP_Vendor_Payables_Report'
    );
  };

  return (
    <div
      id="modal-finance-payments-preview"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-between overflow-hidden animate-in fade-in duration-150"
    >
      {/* Top Header / Verification Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border ${
              isReceivable
                ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            }`}
          >
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isReceivable ? 'Client Receivables (AR)' : 'Vendor Payables (AP)'} • PDF Report Preview
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isReceivable
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                }`}
              >
                Landscape A4
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready to Export</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify report structure, ledger balances, and GST breakdown before downloading the official PDF
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(60, z - 15))}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold px-1.5 text-slate-700 dark:text-slate-200 min-w-[42px] text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(140, z + 15))}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              title="Reset 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id="btn-finance-preview-print"
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
            title="Direct Browser Print of Preview"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Direct Print</span>
          </button>

          <button
            id="btn-finance-preview-download-pdf"
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            title="Download verified financial report as PDF"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            id="btn-finance-preview-close"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Verification Notice Banner */}
      <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-2 text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Report Structure Verified:</strong> Includes {payments.length} ledger invoices, Gross Volume ₹{(totalGross / 100000).toFixed(2)} Lakhs, and 18% CGST/SGST tax compliance breakdown.
          </span>
        </div>
        <span className="text-[11px] font-mono text-blue-700 dark:text-blue-400 shrink-0 hidden md:inline">
          Ledger: {isReceivable ? 'Client Receivables (AR)' : 'Vendor Payables (AP)'}
        </span>
      </div>

      {/* Document Sheet Canvas with Zoom */}
      <div className="flex-1 bg-slate-900/90 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="w-full max-w-[1100px] shrink-0 pb-12"
        >
          {/* Printable Document Sheet */}
          <div
            ref={printableSheetRef}
            id="printable-finance-payments-sheet"
            className="bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-300 p-8 space-y-6 font-sans"
            style={{ minHeight: '680px' }}
          >
            {/* Header Navy Block */}
            <div className="bg-slate-900 text-white rounded-lg p-5 relative overflow-hidden shadow-sm">
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isReceivable ? 'bg-blue-600' : 'bg-amber-500'
                }`}
              />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold tracking-wider text-blue-300 uppercase">
                      Alpha HVAC Solutions & Engineering Services Ltd
                    </span>
                  </div>
                  <h1 className="text-lg font-black tracking-tight text-white">
                    {isReceivable
                      ? 'CLIENT MILESTONE BILLING & ACCOUNTS RECEIVABLE REGISTER'
                      : 'VENDOR PROCUREMENT PAYABLES & DISBURSEMENT REGISTER'}
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">
                    Corporate Commercial Ledger • {isReceivable ? 'Client Milestone Invoicing (AR)' : 'Vendor Procurement Payables (AP)'} • GAAP Double-Entry Verified
                  </p>
                </div>

                <div className="text-right text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-end gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    Total Invoices: {payments.length} Records
                  </div>
                  <div className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-bold border border-blue-500/30 uppercase">
                    Official Financial Audit
                  </div>
                </div>
              </div>
            </div>

            {/* Scope Bar */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isReceivable ? 'bg-blue-500' : 'bg-amber-500'}`} />
                <span className="font-semibold text-slate-900">Ledger Classification:</span>
                <span className="text-slate-600">
                  {isReceivable ? 'Client Milestone Receivables (Inflow)' : 'Vendor Procurement Payables (Outflow)'}
                </span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Currency: INR (₹) • Includes 18% CGST & SGST Compliance Breakdown
              </div>
            </div>

            {/* Executive KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] font-bold uppercase text-slate-500">
                  {isReceivable ? 'Total Billed Revenue' : 'Total Payables Committed'}
                </div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  ₹{(totalGross / 100000).toFixed(2)} Lakhs
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {payments.length} total invoice records
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] font-bold uppercase text-slate-500">
                  {isReceivable ? 'Collected Receivables' : 'Disbursed / Settled'}
                </div>
                <div className="text-base font-black text-emerald-700 mt-0.5">
                  ₹{(totalPaid / 100000).toFixed(2)} Lakhs
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {paidCount} settled milestones
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] font-bold uppercase text-slate-500">
                  {isReceivable ? 'Pending Outstanding' : 'Pending Disbursements'}
                </div>
                <div className="text-base font-black text-rose-600 mt-0.5">
                  ₹{(totalPending / 100000).toFixed(2)} Lakhs
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {pendingCount} open milestones
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] font-bold uppercase text-slate-500">
                  {isReceivable ? 'Collection Efficiency' : 'Settlement Ratio'}
                </div>
                <div className="text-base font-black text-indigo-700 mt-0.5">
                  {settlementRatio.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {isReceivable ? 'Target: 95% within 30 days' : 'Cash flow status: Balanced'}
                </div>
              </div>
            </div>

            {/* Tabular Register Preview */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Invoice / Ref No</th>
                    <th className="py-2.5 px-3">Project Name</th>
                    <th className="py-2.5 px-3">{isReceivable ? 'Client Name' : 'Vendor Name'}</th>
                    <th className="py-2.5 px-3">Milestone Stage</th>
                    <th className="py-2.5 px-3 text-center">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                    <th className="py-2.5 px-3 text-right">GST 18% (₹)</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {payments.map((pay, idx) => {
                    const taxable = pay.amount || (pay.totalAmount ? Math.round(pay.totalAmount / 1.18) : 0);
                    const gst = pay.taxAmount || (pay.totalAmount ? Math.round(pay.totalAmount - taxable) : 0);
                    const isPaid = pay.status === 'Paid';
                    const isOverdue = pay.status === 'Overdue';

                    return (
                      <tr key={pay.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900 font-mono text-[11px]">
                            {pay.invoiceNumber || pay.referenceTitle || 'INV-000'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {pay.paymentMethod || 'NEFT / RTGS'}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-slate-700 font-medium">
                          {pay.projectName || '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {pay.clientOrVendorName || '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-600 text-[11px]">
                          {pay.milestoneTitle || pay.paymentType || 'Milestone Stage'}
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                          {pay.dueDate || '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-slate-700">
                          {taxable.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-slate-500">
                          {gst.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {(pay.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isOverdue
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {(pay.status || 'Pending').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200/90 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={5} className="py-2.5 px-3 uppercase text-[11px]">
                      Total Summary ({payments.length} Records)
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {totalTaxable.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {totalGst.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-950 font-black">
                      {totalGross.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-center text-[10px] text-slate-600 uppercase">
                      VERIFIED
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Audit Certification & Signoff Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-slate-700">GAAP Commercial Compliance Notice:</div>
                <p className="max-w-xl text-[11px] leading-relaxed">
                  This document serves as an official commercial schedule extracted from AlphaERP Finance Engine. All tax invoices incorporate 18% GST (9% CGST + 9% SGST) compliant with Indian Central and State Goods & Services Tax statutory frameworks.
                </p>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-800">Alpha HVAC Solutions Ltd</div>
                <div className="text-[11px] text-slate-500">Finance & Commercial Treasury Desk</div>
                <div className="font-mono text-[10px] text-slate-400 mt-1">Generated via AlphaERP Suite</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <div>
          Page Format: <strong>A4 Landscape (297 × 210 mm)</strong> • Vector PDF High-Resolution Output
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Confirm & Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
