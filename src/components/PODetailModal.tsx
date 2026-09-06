import React, { useState, useRef } from 'react';
import {
  X,
  ShoppingCart,
  Building2,
  Calendar,
  Truck,
  CheckCircle2,
  XCircle,
  Send,
  Printer,
  Sparkles,
  Layers,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  ShieldCheck,
  PackageCheck,
  AlertTriangle,
  Download,
  Loader2
} from 'lucide-react';
import { PurchaseOrder, UserRole, Vendor } from '../types';
import { storageService } from '../services/storageService';
import { RBAC } from '../utils/rbac';
import { downloadElementAsPDF, triggerDirectPrint } from '../utils/pdfExportHelper';
import { DocumentHeader } from './common/DocumentHeader';
import { DocumentFooter } from './common/DocumentFooter';

interface PODetailModalProps {
  po: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onOpenInwardModal?: (po: PurchaseOrder) => void;
  onStatusChanged?: () => void;
}

export const PODetailModal: React.FC<PODetailModalProps> = ({
  po,
  isOpen,
  onClose,
  currentRole,
  onOpenInwardModal,
  onStatusChanged
}) => {
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState('');
  const [showApproveBox, setShowApproveBox] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const poPrintRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!poPrintRef.current || !po) return;
    setIsExportingPDF(true);
    try {
      await downloadElementAsPDF(poPrintRef.current, {
        filename: `AlphaERP_PurchaseOrder_${po.poNumber}`,
        documentTitle: `AlphaERP Purchase Order - ${po.poNumber}`
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrintPO = () => {
    if (!po) return;
    triggerDirectPrint(poPrintRef.current, `AlphaERP_PurchaseOrder_${po.poNumber}`);
  };

  if (!isOpen || !po) return null;

  const canApprove = RBAC.canApprovePO(currentRole);
  const canReject = RBAC.canRejectPO(currentRole);
  const canTransmit = RBAC.canTransmitPO(currentRole);
  const canInward = RBAC.canInwardGoods(currentRole);

  const handleApprove = () => {
    try {
      storageService.approvePO(po.id, approveRemarks || 'Approved for commercial procurement and financial release.');
      if (onStatusChanged) onStatusChanged();
      setShowApproveBox(false);
      onClose();
    } catch (e: any) {
      alert(e.message || 'Error approving PO');
    }
  };

  const handleReject = () => {
    if (!rejectRemarks.trim()) {
      alert('Please provide a reason for rejecting the purchase order.');
      return;
    }
    try {
      storageService.rejectPO(po.id, rejectRemarks);
      if (onStatusChanged) onStatusChanged();
      setShowRejectBox(false);
      onClose();
    } catch (e: any) {
      alert(e.message || 'Error rejecting PO');
    }
  };

  const handleTransmit = (channel: 'Email' | 'WhatsApp' | 'Both') => {
    setIsTransmitting(true);
    try {
      storageService.sendPOToVendor(po.id, channel);
      if (onStatusChanged) onStatusChanged();
      alert(`PO ${po.poNumber} has been successfully transmitted to ${po.vendorName} via ${channel}!`);
      onClose();
    } catch (e: any) {
      alert(e.message || 'Error transmitting PO');
    } finally {
      setIsTransmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    Draft: 'bg-slate-100 text-slate-700 border-slate-200',
    'Pending Approval': 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse',
    Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Sent to Vendor': 'bg-blue-100 text-blue-800 border-blue-200',
    'Partially Received': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Fulfilled: 'bg-teal-100 text-teal-800 border-teal-200',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    Cancelled: 'bg-slate-200 text-slate-600 border-slate-300'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print-container">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150 print-document">
        {/* Header (Hidden in Print) */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 truncate">Purchase Order: {po.poNumber}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 ${statusColors[po.status] || 'bg-slate-100'}`}>
                  {po.status}
                </span>
                {po.prNumber && (
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200 hidden sm:inline shrink-0">
                    Ref PR: {po.prNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  {po.vendorName}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {po.projectName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Ordered: {po.orderDate}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              title="Generate and Download Approved PO PDF"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrintPO}
              title="Print Approved Purchase Order"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RBAC Notice Banner */}
        {po.status === 'Pending Approval' && (
          <div className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
            canApprove ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Approval Workflow:</strong> Requires <strong>Business Manager (Sales Head)</strong> or <strong>Admin</strong> financial sign-off.
              </span>
            </div>
            {!canApprove && (
              <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Current Role ({currentRole}): View Only
              </span>
            )}
          </div>
        )}

        {/* Body Content */}
        <div ref={poPrintRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white">
          {/* Dynamic Corporate Header */}
          {(() => {
            const poTemplate = storageService.getReportTemplate('po');
            const systemSettings = storageService.getSystemSettings();
            return (
              <DocumentHeader
                headerConfig={poTemplate.header}
                stylingConfig={poTemplate.styling}
                settings={systemSettings}
                documentNumber={po.poNumber}
                documentDate={po.orderDate}
                secondaryDateLabel="Delivery Due"
                secondaryDateValue={po.expectedDeliveryDate}
                projectRef={po.projectName}
                statusBadge={{
                  text: `Status: ${po.status}`,
                  colorClass: statusColors[po.status] || 'bg-slate-100 text-slate-800'
                }}
              />
            );
          })()}

          {/* Standardized Structured Report Detail Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 text-xs shadow-xs relative overflow-hidden border-t-3 border-t-blue-600">
            {/* Column 1: Authorized Supplier / Vendor */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized Supplier / Vendor Details:</span>
              </div>
              <div>
                <div className="font-black text-slate-900 text-sm tracking-tight">{po.vendorName}</div>
                <div className="text-slate-600 text-[11px] font-medium mt-0.5">
                  Vendor ID: <span className="font-mono font-bold text-slate-800">{po.vendorId}</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700 truncate">{po.vendorEmail || 'orders@vendor.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-700">{po.vendorPhone || '+91 (022) 6700-1122'}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Logistics & Commercial Delivery */}
            <div className="space-y-2 md:border-l md:border-slate-200 md:pl-4">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Consignee Destination & Delivery Terms:</span>
              </div>
              <div>
                <div className="font-black text-slate-900 text-sm tracking-tight">{po.projectName || 'Central Warehouse'}</div>
                <div className="text-slate-600 text-[11px] font-medium mt-0.5 flex items-start gap-1">
                  <span>{po.deliveryAddress || 'Central Warehouse Logistics Bay, Mumbai'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Due Date</span>
                  <span className="font-semibold text-slate-900 font-mono">{po.expectedDeliveryDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Terms</span>
                  <span className="font-semibold text-slate-900">{po.paymentTerms || 'Net 30 Days'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks / Approval Trail */}
          {po.approvalRemarks && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
              <div className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Business Manager Sign-off Remarks
              </div>
              <p className="text-slate-800 font-medium">{po.approvalRemarks}</p>
              {po.approvedBy && (
                <div className="mt-2 text-[11px] text-slate-500">
                  Approved by: <strong className="text-slate-700">{po.approvedBy}</strong> on{' '}
                  {po.approvedAt ? new Date(po.approvedAt).toLocaleString() : 'N/A'}
                </div>
              )}
            </div>
          )}

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                Ordered Equipment & Materials ({po.items.length})
              </h3>
              <span className="text-xs font-bold text-slate-900">
                Grand Total: ₹{po.grandTotal.toLocaleString()}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-right">Ordered Qty</th>
                    <th className="py-2.5 px-3 text-right">Received Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">GST %</th>
                    <th className="py-2.5 px-3 text-right">Total Inc. GST (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {po.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-700 font-medium">{item.sku}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {item.orderedQty} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        <span className={item.receivedQty >= item.orderedQty ? 'text-emerald-700' : 'text-amber-600'}>
                          {item.receivedQty || 0} {item.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                        ₹{item.unitRate.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 font-medium">
                        {item.taxRatePct}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{item.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <strong>Notes:</strong> {po.notes || 'Standard OEM dealer supply agreement'}
              </div>
              {po.sentToVendorAt && (
                <div className="text-blue-700 font-semibold flex items-center gap-1">
                  <Send className="w-3.5 h-3.5" />
                  Transmitted to vendor on {new Date(po.sentToVendorAt).toLocaleString()}
                </div>
              )}
            </div>

            <div className="w-full sm:w-72 bg-white border border-slate-200 rounded-xl p-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{po.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (18%):</span>
                <span className="font-semibold text-slate-900">₹{po.taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Freight & Handling:</span>
                <span className="font-semibold text-slate-900">₹{po.shippingCharges.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900">PO Grand Total:</span>
                <span className="text-base font-black text-emerald-700">₹{po.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Corporate Footer */}
          {(() => {
            const poTemplate = storageService.getReportTemplate('po');
            const systemSettings = storageService.getSystemSettings();
            return (
              <DocumentFooter
                footerConfig={poTemplate.footer}
                stylingConfig={poTemplate.styling}
                settings={systemSettings}
                clientOrVendorName={po.vendorName}
                primarySignatoryOverride={po.approvedBy || undefined}
                pageNumber={1}
                totalPages={1}
              />
            );
          })()}

          {/* Interactive Approval / Rejection Box (Hidden in Print) */}
          {showApproveBox && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-in fade-in no-print">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Sign Off & Approve Purchase Order {po.poNumber} (Business Manager Approval)
              </div>
              <input
                type="text"
                placeholder="Optional sign-off remarks (e.g. Approved against client advance receipt)..."
                value={approveRemarks}
                onChange={(e) => setApproveRemarks(e.target.value)}
                className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowApproveBox(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Confirm Financial Signoff
                </button>
              </div>
            </div>
          )}

          {showRejectBox && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3 animate-in fade-in no-print">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Reject Purchase Order {po.poNumber}
              </div>
              <input
                type="text"
                placeholder="Mandatory reason for PO rejection (e.g. Budget exceeded for Project)..."
                value={rejectRemarks}
                onChange={(e) => setRejectRemarks(e.target.value)}
                className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowRejectBox(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (Hidden in Print) */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* Approvals for Business Manager / Admin */}
            {(po.status === 'Pending Approval' || po.status === 'Draft') && canApprove && !showApproveBox && !showRejectBox && (
              <>
                <button
                  onClick={() => setShowRejectBox(true)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Reject PO
                </button>
                <button
                  onClick={() => setShowApproveBox(true)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve PO (Business Sign-off)
                </button>
              </>
            )}

            {/* Transmit to Vendor for Approved PO */}
            {po.status === 'Approved' && canTransmit && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTransmit('WhatsApp')}
                  disabled={isTransmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send WhatsApp PO
                </button>
                <button
                  onClick={() => handleTransmit('Email')}
                  disabled={isTransmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email PO to Vendor
                </button>
              </div>
            )}

            {/* Inward Goods GRN for Sent / Partially Received PO */}
            {(po.status === 'Sent to Vendor' || po.status === 'Partially Received') && canInward && onOpenInwardModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInwardModal(po);
                }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 transition-all flex items-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                Process Goods Receipt (GRN)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
