import React, { useState } from 'react';
import {
  X,
  UserMinus,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  Briefcase,
  Building2,
  CheckCircle2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { EmployeeMaster, ResignationRecord } from '../../types';
import { storageService } from '../../services/storageService';

interface RegisterResignationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: EmployeeMaster[];
  onSuccess: () => void;
  defaultEmpId?: string;
}

export const RegisterResignationModal: React.FC<RegisterResignationModalProps> = ({
  isOpen,
  onClose,
  employees,
  onSuccess,
  defaultEmpId
}) => {
  const activeEmployees = employees.filter((e) => e.employmentStatus !== 'Separated' && e.status !== 'Inactive');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    defaultEmpId || activeEmployees[0]?.id || employees[0]?.id || ''
  );

  const selectedEmp = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const [resignationDate, setResignationDate] = useState<string>(todayStr);
  const [noticePeriodDays, setNoticePeriodDays] = useState<number>(30);
  
  // Calculate default relieving date
  const computeDefaultRelievingDate = (startDate: string, days: number): string => {
    try {
      const d = new Date(startDate);
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    } catch {
      return startDate;
    }
  };

  const [requestedRelievingDate, setRequestedRelievingDate] = useState<string>(
    computeDefaultRelievingDate(todayStr, 30)
  );
  const [reasonCategory, setReasonCategory] = useState<ResignationRecord['reasonCategory']>('Career Growth');
  const [employeeRemarks, setEmployeeRemarks] = useState<string>('');
  const [handoverPlan, setHandoverPlan] = useState<string>('');
  const [reportingManager, setReportingManager] = useState<string>('Rahul Verma (Engineering Lead)');

  if (!isOpen) return null;

  // Calculate notice shortfall
  const getNoticeShortfallDays = (): number => {
    try {
      const res = new Date(resignationDate).getTime();
      const req = new Date(requestedRelievingDate).getTime();
      const diffDays = Math.round((req - res) / (1000 * 60 * 60 * 24));
      return Math.max(0, noticePeriodDays - diffDays);
    } catch {
      return 0;
    }
  };

  const shortfallDays = getNoticeShortfallDays();

  // Handle notice period adjustment
  const handleNoticeChange = (days: number) => {
    setNoticePeriodDays(days);
    setRequestedRelievingDate(computeDefaultRelievingDate(resignationDate, days));
  };

  const handleResignationDateChange = (date: string) => {
    setResignationDate(date);
    setRequestedRelievingDate(computeDefaultRelievingDate(date, noticePeriodDays));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const empName = selectedEmp.fullName || selectedEmp.name || 'Employee';
    const doj = selectedEmp.dateOfJoining || selectedEmp.joiningDate || todayStr;
    const basicSalary = selectedEmp.basicSalary || (selectedEmp.salary ? Math.round(selectedEmp.salary * 0.5) : 35000);
    const dailyWage = Math.round(basicSalary / 30);
    const shortfallRecovery = shortfallDays * dailyWage;

    // Estimate initial F&F draft
    const initialFnf = {
      unpaidSalaryDays: 30,
      unpaidSalaryAmount: basicSalary,
      leaveEncashmentDays: selectedEmp.leavesRemaining || 5,
      leaveEncashmentAmount: (selectedEmp.leavesRemaining || 5) * dailyWage,
      gratuityAmount: 0,
      bonusOrIncentives: 0,
      reimbursementsPending: 0,
      otherEarnings: 0,
      totalEarnings: basicSalary + (selectedEmp.leavesRemaining || 5) * dailyWage,
      noticeRecoveryDays: shortfallDays,
      noticeRecoveryAmount: shortfallRecovery,
      imprestAdvanceDeduction: 0,
      assetDamageOrLossDeduction: 0,
      tdsTaxDeduction: 0,
      pfDeduction: 1800,
      otherDeductions: 0,
      totalDeductions: shortfallRecovery + 1800,
      netPayableAmount: Math.max(0, basicSalary + (selectedEmp.leavesRemaining || 5) * dailyWage - (shortfallRecovery + 1800)),
      financeStatus: 'Draft' as const
    };

    storageService.registerResignation({
      empId: selectedEmp.id,
      empName,
      empCode: selectedEmp.empCode || `ALP-${Math.floor(100 + Math.random() * 900)}`,
      designation: selectedEmp.designation || 'Staff',
      department: selectedEmp.department || 'Operations',
      dateOfJoining: doj,
      resignationDate,
      requestedRelievingDate,
      approvedLastWorkingDate: requestedRelievingDate,
      reasonCategory,
      employeeRemarks: employeeRemarks.trim() || 'Submitted formal resignation and initiated handover transition.',
      noticePeriodDays,
      noticeShortfallDays: shortfallDays,
      status: 'Submitted',
      approvals: {
        manager: {
          status: 'Pending',
          remarks: `Handover in progress with ${reportingManager}.`,
          recommendedLastWorkingDate: requestedRelievingDate
        },
        admin: {
          status: 'Pending',
          remarks: 'Awaiting clearance on ID card, access revocation and facilities dues.'
        },
        hr: {
          status: 'Pending',
          remarks: 'Exit interview scheduled and F&F settlement drafted.'
        }
      },
      clearances: {
        itAssets: false,
        financeAdvances: false,
        projectHandover: false,
        adminIdCard: false,
        hrExitInterview: false,
        projectHandoverRemarks: handoverPlan || undefined
      },
      fnfSettlement: initialFnf
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-5 sm:p-6 shadow-2xl my-6 transition-all animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <UserMinus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Register Resignation / Exit Request</h3>
              <p className="text-xs text-slate-500">
                Initiate organization exit workflow with Manager, Admin & HR approval chain
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Employee Selector */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Select Resigning Employee <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white text-xs font-semibold text-slate-800 transition-all"
            >
              {activeEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName || emp.name} ({emp.empCode}) — {emp.designation} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Employee Summary Card */}
          {selectedEmp && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">Department</span>
                <span className="font-bold text-slate-800">{selectedEmp.department || 'Operations'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Joining</span>
                <span className="font-bold text-slate-800 font-mono">
                  {selectedEmp.dateOfJoining || selectedEmp.joiningDate || '2023-01-15'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Leaves Balance</span>
                <span className="font-bold text-emerald-700">{selectedEmp.leavesRemaining ?? 12} Days EL/PL</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Status</span>
                <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                  {selectedEmp.employmentStatus || 'Active'}
                </span>
              </div>
            </div>
          )}

          {/* Date & Notice Period Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Resignation Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={resignationDate}
                onChange={(e) => handleResignationDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Notice Period (Days) <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-1">
                {[30, 60, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => handleNoticeChange(days)}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all ${
                      noticePeriodDays === days
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Requested Relieving Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={requestedRelievingDate}
                onChange={(e) => setRequestedRelievingDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Shortfall Alert if any */}
          {shortfallDays > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-[11px] text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Notice Shortfall Detected ({shortfallDays} Days):</strong> The requested relieving date is earlier than the stipulated {noticePeriodDays}-day notice period. Shortfall recovery deduction may be factored in F&F settlement unless waived by HR management.
              </div>
            </div>
          )}

          {/* Reason & Reporting Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
              >
                <option value="Career Growth">Career Growth / Better Opportunity</option>
                <option value="Relocation">Relocation / Hometown Return</option>
                <option value="Compensation">Compensation / Financial</option>
                <option value="Higher Studies">Higher Studies / Certifications</option>
                <option value="Personal / Health">Personal / Health & Family</option>
                <option value="Retirement">Retirement / Superannuation</option>
                <option value="Other">Other Reasons</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reporting Manager for Stage 1 Review <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reportingManager}
                onChange={(e) => setReportingManager(e.target.value)}
                placeholder="e.g. Prakash Rao (Projects Director)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Resignation Letter & Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Resignation Statement / Employee Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={employeeRemarks}
              onChange={(e) => setEmployeeRemarks(e.target.value)}
              placeholder="State resignation notice details, handover commitment, or reason for early release..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Handover Plan */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Knowledge Transfer (KT) & Project Handover Plan
            </label>
            <input
              type="text"
              value={handoverPlan}
              onChange={(e) => setHandoverPlan(e.target.value)}
              placeholder="e.g. Handing over site drawings and calibration tools to Priya Mukherjee by 25th"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* 3-Tier Workflow Guidance Banner */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-[11px] text-indigo-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-indigo-950">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Standard 3-Tier Exit Approval Workflow Triggered:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-700">
              <div className="bg-white p-2 rounded-lg border border-indigo-100/70">
                <span className="font-bold text-indigo-700 block">Tier 1: Manager</span>
                Handover verification & retention review
              </div>
              <div className="bg-white p-2 rounded-lg border border-indigo-100/70">
                <span className="font-bold text-indigo-700 block">Tier 2: Admin</span>
                IT assets, ID card & access clearance
              </div>
              <div className="bg-white p-2 rounded-lg border border-indigo-100/70">
                <span className="font-bold text-indigo-700 block">Tier 3: HR & Finance</span>
                Exit interview, F&F sheet & disbursal
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-rose-600 hover:bg-rose-500 font-bold rounded-xl shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Submit & Register Exit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
