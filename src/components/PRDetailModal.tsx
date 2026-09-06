import React, { useState, useRef } from 'react';
import {
  X,
  FileCheck2,
  Building2,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Printer,
  Sparkles,
  Layers,
  AlertTriangle,
  Download,
  Loader2,
  Clock
} from 'lucide-react';
import { PurchaseRequisition, UserRole, Vendor } from '../types';
import { storageService } from '../services/storageService';
import { RBAC } from '../utils/rbac';
import { downloadElementAsPDF, triggerDirectPrint } from '../utils/pdfExportHelper';
import { DocumentHeader } from './common/DocumentHeader';
import { DocumentFooter } from './common/DocumentFooter';

interface PRDetailModalProps {
  pr: PurchaseRequisition | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  vendors: Vendor[];
  onOpenConvertModal?: (pr: PurchaseRequisition) => void;
  onStatusChanged?: () => void;
}

export const PRDetailModal: React.FC<PRDetailModalProps> = ({
  pr,
  isOpen,
  onClose,
  currentRole,
  vendors,
  onOpenConvertModal,
  onStatusChanged
}) => {
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState('');
  const [showApproveBox, setShowApproveBox] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const prPrintRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!prPrintRef.current || !pr) return;
    setIsExportingPDF(true);
    try {
      await downloadElementAsPDF(prPrintRef.current, {
        filename: `AlphaERP_PurchaseRequisition_${pr.prNumber}`,
        documentTitle: `AlphaERP Purchase Requisition - ${pr.prNumber}`
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrintPR = () => {
    if (!pr) return;
    triggerDirectPrint(prPrintRef.current, `AlphaERP_PurchaseRequisition_${pr.prNumber}`);
  };

  if (!isOpen || !pr) return null;

  const canApprove = RBAC.canApprovePR(currentRole);
  const canReject = RBAC.canRejectPR(currentRole);
  const canConvert = RBAC.canCreatePO(currentRole);

  const handleApprove = () => {
    try {
      storageService.approvePR(pr.id, approveRemarks || 'Approved for procurement based on project execution schedule.');
      if (onStatusChanged) onStatusChanged();
      setShowApproveBox(false);
      onClose();
    } catch (e: any) {
      alert(e.message || 'Error approving PR');
    }
  };

  const handleReject = () => {
    if (!rejectRemarks.trim()) {
      alert('Please provide a reason for rejecting the requisition.');
      return;
    }
    try {
      storageService.rejectPR(pr.id, rejectRemarks);
      if (onStatusChanged) onStatusChanged();
      setShowRejectBox(false);
      onClose();
    } catch (e: any) {
      alert(e.message || 'Error rejecting PR');
    }
  };

  const statusColors: Record<string, string> = {
    Draft: 'bg-slate-100 text-slate-700 border-slate-200',
    'Pending Approval': 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse',
    Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    'Converted to PO': 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print-container">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150 print-document">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{pr.prNumber}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[pr.status] || 'bg-slate-100'}`}>
                  {pr.status}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  pr.priority === 'Urgent'
                    ? 'bg-rose-100 text-rose-700'
                    : pr.priority === 'High'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {pr.priority} Priority
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {pr.projectName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Requested: {pr.requestDate}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  By: {pr.requestedBy}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              title="Generate and Download Requisition PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrintPR}
              title="Print Requisition directly"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
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
        {pr.status === 'Pending Approval' && (
          <div className={`px-6 py-2.5 text-xs flex items-center justify-between border-b ${
            canApprove ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>
                <strong>Approval Workflow:</strong> Requires <strong>Purchase / Procurement Manager</strong> or <strong>Admin</strong> review & signoff.
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
        <div ref={prPrintRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {/* Dynamic Corporate Header */}
          {(() => {
            const prTemplate = storageService.getReportTemplate('pr');
            const systemSettings = storageService.getSystemSettings();
            return (
              <DocumentHeader
                headerConfig={prTemplate.header}
                stylingConfig={prTemplate.styling}
                settings={systemSettings}
                documentNumber={pr.prNumber}
                documentDate={pr.requestDate}
                secondaryDateLabel="Required Date"
                secondaryDateValue={pr.requiredByDate}
                projectRef={pr.projectName}
                statusBadge={{
                  text: `Status: ${pr.status}`,
                  colorClass:
                    pr.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : pr.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                }}
              />
            );
          })()}

          {/* Standardized Structured Report Detail Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 text-xs shadow-xs relative overflow-hidden border-t-3 border-t-blue-600">
            {/* Column 1: Indent Requisitioning Officer */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Requisitioning Site Engineer:</span>
              </div>
              <div>
                <div className="font-black text-slate-900 text-sm tracking-tight">{pr.requestedBy}</div>
                <div className="text-slate-600 text-[11px] font-medium mt-0.5">
                  Department: <strong className="text-slate-800 font-semibold">Site Engineering & Technical Maintenance</strong>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Indent Date: <strong>{pr.requestDate}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Procurement Priority: <strong className="text-amber-800 uppercase text-[10px] bg-amber-100 px-1.5 py-0.5 rounded">{pr.priority || 'Medium'}</strong></span>
                </div>
              </div>
            </div>

            {/* Column 2: Project Allocation & Timeline */}
            <div className="space-y-2 md:border-l md:border-slate-200 md:pl-4">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>HVAC Project Scope & Location:</span>
              </div>
              <div>
                <div className="font-black text-slate-900 text-sm tracking-tight">{pr.projectName}</div>
                <div className="text-slate-600 text-[11px] font-medium mt-0.5">
                  Requisition Ref: <span className="font-mono font-bold text-slate-800">{pr.prNumber}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Required On Site</span>
                  <span className="font-semibold text-slate-900 font-mono">{pr.requiredByDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Items</span>
                  <span className="font-semibold text-slate-900 font-mono">{pr.items.length} Line Items</span>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Remarks or Justification */}
          {pr.approvalRemarks && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs">
              <div className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Remarks & Audit Trail
              </div>
              <p className="text-slate-800 font-medium">{pr.approvalRemarks}</p>
              {pr.approvedBy && (
                <div className="mt-2 text-[11px] text-slate-500">
                  Signed off by: <strong className="text-slate-700">{pr.approvedBy}</strong> on{' '}
                  {pr.approvedAt ? new Date(pr.approvedAt).toLocaleString() : 'N/A'}
                </div>
              )}
            </div>
          )}

          {/* Converted PO reference */}
          {pr.convertedPoNumber && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-900">
                  This PR was converted into Purchase Order <strong className="font-mono">{pr.convertedPoNumber}</strong>.
                </span>
              </div>
            </div>
          )}

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Requisitioned Materials & Equipment ({pr.items.length})
              </h3>
              <span className="text-xs font-bold text-slate-900">
                Total Estimate: ₹{pr.totalEstimatedAmount.toLocaleString()}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 w-10">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Req. Qty</th>
                    <th className="py-2.5 px-3 text-right">Est. Unit Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Est. Total (₹)</th>
                    <th className="py-2.5 px-3">Application / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pr.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-blue-700 font-medium">{item.sku}</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {item.requiredQty} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                        ₹{item.estimatedUnitCost.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₹{item.estimatedTotal.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{item.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic Corporate Footer */}
          {(() => {
            const prTemplate = storageService.getReportTemplate('pr');
            const systemSettings = storageService.getSystemSettings();
            return (
              <DocumentFooter
                footerConfig={prTemplate.footer}
                stylingConfig={prTemplate.styling}
                settings={systemSettings}
                clientOrVendorName={pr.projectName}
                primarySignatoryOverride={pr.requestedBy}
                secondarySignatoryOverride={pr.approvedBy || undefined}
                pageNumber={1}
                totalPages={1}
              />
            );
          })()}

          {/* Interactive Approval / Rejection Box */}
          {showApproveBox && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Confirm Procurement Approval for {pr.prNumber}
              </div>
              <input
                type="text"
                placeholder="Optional approval notes (e.g. Approved for Daikin VRF supplier dispatch)..."
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
                  Confirm & Sign Off PR
                </button>
              </div>
            </div>
          )}

          {showRejectBox && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Reject Requisition {pr.prNumber}
              </div>
              <input
                type="text"
                placeholder="Mandatory reason for rejection (e.g. Existing stock available in Depot Bay 3)..."
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

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* PR Approvals for Procurement Manager / Admin */}
            {(pr.status === 'Pending Approval' || pr.status === 'Draft') && canApprove && !showApproveBox && !showRejectBox && (
              <>
                <button
                  onClick={() => setShowRejectBox(true)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Reject PR
                </button>
                <button
                  onClick={() => setShowApproveBox(true)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve PR (Procurement Signoff)
                </button>
              </>
            )}

            {/* Convert to PO for Approved PRs */}
            {pr.status === 'Approved' && canConvert && onOpenConvertModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenConvertModal(pr);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                Convert to Purchase Order (PO)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
