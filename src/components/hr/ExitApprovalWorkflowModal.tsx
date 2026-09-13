import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Building,
  Briefcase,
  FileCheck,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ResignationRecord } from '../../types';
import { storageService } from '../../services/storageService';

interface ExitApprovalWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  resignation: ResignationRecord;
  onSuccess: () => void;
}

export const ExitApprovalWorkflowModal: React.FC<ExitApprovalWorkflowModalProps> = ({
  isOpen,
  onClose,
  resignation,
  onSuccess
}) => {
  const approvals = resignation?.approvals || {
    manager: { status: 'Pending' },
    admin: { status: 'Pending' },
    hr: { status: 'Pending' }
  };

  // Manager stage states
  const [managerApproverName, setManagerApproverName] = useState(
    approvals.manager?.approverName || 'Prakash Rao (Projects Director)'
  );
  const [managerRemarks, setManagerRemarks] = useState(
    approvals.manager?.remarks || 'Handover of all engineering documentation verified.'
  );
  const [managerHandoverDone, setManagerHandoverDone] = useState<boolean>(
    approvals.manager?.handoverCompleted ?? true
  );
  const [recommendedDate, setRecommendedDate] = useState<string>(
    approvals.manager?.recommendedLastWorkingDate || resignation?.requestedRelievingDate || resignation?.approvedLastWorkingDate || ''
  );

  // Admin stage states
  const [adminApproverName, setAdminApproverName] = useState(
    approvals.admin?.approverName || 'Suresh Patil (Admin & Facilities)'
  );
  const [adminRemarks, setAdminRemarks] = useState(
    approvals.admin.remarks || 'ID Card returned, access revocation scheduled for exit date.'
  );
  const [idCardReturned, setIdCardReturned] = useState<boolean>(
    approvals.admin.idCardReturned ?? true
  );
  const [premisesAccessRevoked, setPremisesAccessRevoked] = useState<boolean>(
    approvals.admin.premisesAccessRevoked ?? true
  );
  const [assetsClearanceConfirmed, setAssetsClearanceConfirmed] = useState<boolean>(
    approvals.admin.assetsClearanceConfirmed ?? true
  );
  const [facilityDuesCleared, setFacilityDuesCleared] = useState<boolean>(
    approvals.admin.facilityDuesCleared ?? true
  );

  // HR stage states
  const [hrApproverName, setHrApproverName] = useState(
    approvals.hr.approverName || 'Ananya Deshmukh (Head HR)'
  );
  const [hrRemarks, setHrRemarks] = useState(
    approvals.hr.remarks || 'Exit interview completed. Notice period verified. Authorized for Full & Final Settlement.'
  );
  const [exitInterviewConducted, setExitInterviewConducted] = useState<boolean>(
    approvals.hr.exitInterviewConducted ?? true
  );
  const [finalApprovedDate, setFinalApprovedDate] = useState<string>(
    resignation.approvedLastWorkingDate || resignation.requestedRelievingDate
  );
  const [noticeWaiverDays, setNoticeWaiverDays] = useState<number>(
    approvals.hr.noticeWaiverDays || 0
  );

  // Handlers for stage approvals
  const handleManagerAction = (decision: 'Approved' | 'Rejected') => {
    storageService.updateResignationApproval(resignation.id, 'manager', decision, {
      approverName: managerApproverName,
      remarks: managerRemarks,
      handoverCompleted: managerHandoverDone,
      recommendedLastWorkingDate: recommendedDate
    });
    onSuccess();
  };

  const handleAdminAction = (decision: 'Approved' | 'Rejected') => {
    storageService.updateResignationApproval(resignation.id, 'admin', decision, {
      approverName: adminApproverName,
      remarks: adminRemarks,
      idCardReturned,
      premisesAccessRevoked,
      assetsClearanceConfirmed,
      facilityDuesCleared
    });
    onSuccess();
  };

  const handleHrAction = (decision: 'Approved' | 'Rejected') => {
    storageService.updateResignationApproval(resignation.id, 'hr', decision, {
      approverName: hrApproverName,
      remarks: hrRemarks,
      exitInterviewConducted,
      finalApprovedLastDate: finalApprovedDate,
      noticeWaiverDays,
      relievingLetterIssued: decision === 'Approved',
      relievingLetterNumber: decision === 'Approved' ? `ALP/HR/REL/${new Date().toISOString().slice(0, 7)}/${resignation.empCode}` : undefined
    });
    onSuccess();
  };

  const getStageBadge = (status: 'Pending' | 'Approved' | 'Rejected') => {
    if (status === 'Approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Approved</span>
        </span>
      );
    }
    if (status === 'Rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <X className="w-3 h-3 text-rose-600" />
          <span>Rejected</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>Pending Action</span>
      </span>
    );
  };

  if (!isOpen || !resignation) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-5 sm:p-6 shadow-2xl my-6 transition-all animate-in fade-in-50 zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Exit Approval Chain & Clearance Gateway</h3>
              <p className="text-xs text-slate-500">
                Organization Best Practice: 3-Tier Multi-Department Sign-off (Manager → Admin → HR)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employee Summary Card */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-base font-bold text-slate-900">{resignation.empName}</span>
              <span className="ml-2 font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-[11px]">
                {resignation.empCode}
              </span>
              <span className="ml-2 text-slate-500 font-medium">
                {resignation.designation} • {resignation.department}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-semibold">Workflow Status:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                {resignation.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200/80 text-[11px]">
            <div>
              <span className="text-slate-500 block">Resignation Date</span>
              <strong className="text-slate-800 font-mono">{resignation.resignationDate}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Notice Period</span>
              <strong className="text-slate-800">{resignation.noticePeriodDays} Days</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Approved Last Day</span>
              <strong className="text-indigo-700 font-mono">{resignation.approvedLastWorkingDate}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Exit Reason</span>
              <strong className="text-slate-800">{resignation.reasonCategory}</strong>
            </div>
          </div>

          {resignation.employeeRemarks && (
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 italic text-[11px]">
              "{resignation.employeeRemarks}"
            </div>
          )}
        </div>

        {/* 3-Tier Approval Workflow Containers */}
        <div className="mt-5 space-y-4 text-xs">
          {/* TIER 1: REPORTING MANAGER */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Tier 1: Reporting Manager Review</h4>
              </div>
              {getStageBadge(approvals.manager.status)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manager Approver Name</label>
                <input
                  type="text"
                  value={managerApproverName}
                  onChange={(e) => setManagerApproverName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recommended Relieving Date</label>
                <input
                  type="date"
                  value={recommendedDate}
                  onChange={(e) => setRecommendedDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="handoverCompleted"
                checked={managerHandoverDone}
                onChange={(e) => setManagerHandoverDone(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="handoverCompleted" className="font-medium text-slate-800 cursor-pointer">
                Site & Project Handover Complete (Drawings, client accounts, work-in-progress tasks reassigned)
              </label>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Manager Remarks & Feedback</label>
              <input
                type="text"
                value={managerRemarks}
                onChange={(e) => setManagerRemarks(e.target.value)}
                placeholder="Remarks regarding retention discussion or handover notes..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleManagerAction('Rejected')}
                className="px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-bold transition-all"
              >
                Reject / Retain
              </button>
              <button
                type="button"
                onClick={() => handleManagerAction('Approved')}
                className="px-4 py-1.5 text-white bg-blue-600 hover:bg-blue-500 rounded-lg font-bold shadow-2xs transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Tier 1 (Manager)</span>
              </button>
            </div>
          </div>

          {/* TIER 2: ADMIN & FACILITIES */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Tier 2: Admin & Facilities Clearance</h4>
              </div>
              {getStageBadge(approvals.admin.status)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={idCardReturned}
                  onChange={(e) => setIdCardReturned(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="font-medium text-slate-800">Company ID Card & RFID Fob Surrendered</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={premisesAccessRevoked}
                  onChange={(e) => setPremisesAccessRevoked(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="font-medium text-slate-800">Biometric & Cloud Premises Access Revocation Scheduled</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assetsClearanceConfirmed}
                  onChange={(e) => setAssetsClearanceConfirmed(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="font-medium text-slate-800">IT Hardware Returned & Inspected (Laptop, SIM, Phone)</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={facilityDuesCleared}
                  onChange={(e) => setFacilityDuesCleared(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="font-medium text-slate-800">Drawer Keys, Library & Canteen/Mess Dues NIL</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admin Officer Name</label>
                <input
                  type="text"
                  value={adminApproverName}
                  onChange={(e) => setAdminApproverName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admin Inspection Remarks</label>
                <input
                  type="text"
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Notes on returned items and facilities..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleAdminAction('Rejected')}
                className="px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-bold transition-all"
              >
                Hold Dues
              </button>
              <button
                type="button"
                onClick={() => handleAdminAction('Approved')}
                className="px-4 py-1.5 text-white bg-amber-600 hover:bg-amber-500 rounded-lg font-bold shadow-2xs transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Clear Tier 2 (Admin)</span>
              </button>
            </div>
          </div>

          {/* TIER 3: HR FINAL AUTHORIZATION */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Tier 3: HR Final Approval & Relieving Authorization</h4>
              </div>
              {getStageBadge(approvals.hr.status)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">HR Head Name</label>
                <input
                  type="text"
                  value={hrApproverName}
                  onChange={(e) => setHrApproverName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approved Final Last Working Date</label>
                <input
                  type="date"
                  value={finalApprovedDate}
                  onChange={(e) => setFinalApprovedDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Waiver (Days, if any)</label>
                <input
                  type="number"
                  min={0}
                  value={noticeWaiverDays}
                  onChange={(e) => setNoticeWaiverDays(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="exitInterview"
                checked={exitInterviewConducted}
                onChange={(e) => setExitInterviewConducted(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="exitInterview" className="font-medium text-slate-800 cursor-pointer">
                HR Exit Interview Conducted & Feedback Form Archived
              </label>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">HR Final Authorization Notes</label>
              <input
                type="text"
                value={hrRemarks}
                onChange={(e) => setHrRemarks(e.target.value)}
                placeholder="Final HR signoff remarks and relieving instructions..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleHrAction('Rejected')}
                className="px-3 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-bold transition-all"
              >
                Reject Relieving
              </button>
              <button
                type="button"
                onClick={() => handleHrAction('Approved')}
                className="px-4 py-1.5 text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold shadow-2xs transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Grant Final HR Approval (Tier 3)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 mt-5 border-t border-slate-200">
          <div className="text-[11px] text-slate-500">
            All 3 approvals enable automatic F&F settlement transmission to the Finance team.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
