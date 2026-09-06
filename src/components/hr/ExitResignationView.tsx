import React, { useState } from 'react';
import {
  UserMinus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Receipt,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  Printer,
  Plus,
  ArrowRight,
  ExternalLink,
  Laptop,
  CreditCard,
  Building,
  UserCheck,
  X
} from 'lucide-react';
import { ResignationRecord, EmployeeMaster } from '../../types';
import { storageService } from '../../services/storageService';
import { RegisterResignationModal } from './RegisterResignationModal';
import { ExitApprovalWorkflowModal } from './ExitApprovalWorkflowModal';
import { FnfSettlementModal } from './FnfSettlementModal';

interface ExitResignationViewProps {
  resignations: ResignationRecord[];
  employees: EmployeeMaster[];
  onRefresh: () => void;
  onRequestNewExit?: () => void;
}

export const ExitResignationView: React.FC<ExitResignationViewProps> = ({
  resignations,
  employees,
  onRefresh,
  onRequestNewExit
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [activeResignationForApproval, setActiveResignationForApproval] = useState<ResignationRecord | null>(null);
  const [activeResignationForFnf, setActiveResignationForFnf] = useState<ResignationRecord | null>(null);

  // Filtered resignations
  const filteredResignations = resignations.filter((res) => {
    const matchesSearch =
      res.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.designation.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'IN_REVIEW') {
      return res.status === 'Submitted' || res.status === 'Notice Period';
    }
    if (statusFilter === 'TIER_APPROVED') {
      return res.status === 'Manager Approved' || res.status === 'Admin Approved';
    }
    if (statusFilter === 'READY_FNF') {
      return res.status === 'Ready for F&F';
    }
    if (statusFilter === 'FINANCE') {
      return res.status === 'Shared with Finance';
    }
    if (statusFilter === 'COMPLETED') {
      return res.status === 'F&F Completed' || res.status === 'Settled';
    }
    return true;
  });

  // KPIs
  const totalActive = resignations.filter((r) => r.status !== 'F&F Completed' && r.status !== 'Settled' && r.status !== 'Rejected').length;
  const pendingManager = resignations.filter((r) => r.approvals?.manager.status === 'Pending').length;
  const pendingAdmin = resignations.filter((r) => r.approvals?.admin.status === 'Pending').length;
  const pendingHr = resignations.filter((r) => r.approvals?.hr.status === 'Pending').length;
  const sharedWithFinance = resignations.filter((r) => r.status === 'Shared with Finance').length;
  const completedFnf = resignations.filter((r) => r.status === 'F&F Completed' || r.status === 'Settled').length;

  const handleQuickShareToFinance = (res: ResignationRecord) => {
    storageService.shareFnfWithFinance(res.id);
    onRefresh();
  };

  const getStatusBadge = (status: ResignationRecord['status']) => {
    switch (status) {
      case 'Submitted':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Stage 1: Submitted</span>;
      case 'Notice Period':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">Serving Notice</span>;
      case 'Manager Approved':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Manager Approved</span>;
      case 'Admin Approved':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Admin Approved</span>;
      case 'Ready for F&F':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Ready for F&F</span>;
      case 'Shared with Finance':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">Shared with Finance</span>;
      case 'F&F Completed':
      case 'Settled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">F&F Completed / Settled</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Rejected / Retained</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Active Exits</span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{totalActive}</div>
          <span className="text-[10px] text-slate-400">Total in pipeline</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-blue-100 bg-blue-50/20 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-700 block">Tier 1: Manager</span>
          <div className="text-2xl font-black text-blue-900 mt-0.5">{pendingManager}</div>
          <span className="text-[10px] text-blue-500">Handover review</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 block">Tier 2: Admin</span>
          <div className="text-2xl font-black text-amber-900 mt-0.5">{pendingAdmin}</div>
          <span className="text-[10px] text-amber-500">ID & assets clearance</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-purple-100 bg-purple-50/20 shadow-2xs">
          <span className="text-[11px] font-semibold text-purple-700 block">Tier 3: HR Head</span>
          <div className="text-2xl font-black text-purple-900 mt-0.5">{pendingHr}</div>
          <span className="text-[10px] text-purple-500">Exit interview & F&F</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-cyan-100 bg-cyan-50/20 shadow-2xs">
          <span className="text-[11px] font-semibold text-cyan-700 block">In Finance Payout</span>
          <div className="text-2xl font-black text-cyan-900 mt-0.5">{sharedWithFinance}</div>
          <span className="text-[10px] text-cyan-500">Awaiting bank transfer</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 block">F&F Settled</span>
          <div className="text-2xl font-black text-emerald-900 mt-0.5">{completedFnf}</div>
          <span className="text-[10px] text-emerald-500">Disbursed & archived</span>
        </div>
      </div>

      {/* Action Header & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserMinus className="w-5 h-5 text-rose-600" />
              <span>Employee Resignation & Organization Exit Workflow</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprise best-practice exit management: Manager review → Admin clearances → HR authorization → Finance F&F payout
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register Resignation / Exit</span>
          </button>
        </div>

        {/* Filter Tabs & Search Box */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'ALL', label: 'All Exits' },
              { id: 'IN_REVIEW', label: 'In Review' },
              { id: 'TIER_APPROVED', label: 'Tier Approved' },
              { id: 'READY_FNF', label: 'Ready for F&F' },
              { id: 'FINANCE', label: 'Shared with Finance' },
              { id: 'COMPLETED', label: 'Completed' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search employee, code, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Resignation Cards List */}
      <div className="space-y-3">
        {filteredResignations.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <UserMinus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-slate-700">No resignation or exit records found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or register a new exit request.</p>
          </div>
        ) : (
          filteredResignations.map((res) => {
            const emp = employees.find((e) => e.id === res.empId || e.empCode === res.empCode);
            const approvals = res.approvals || {
              manager: { status: 'Pending' },
              admin: { status: 'Pending' },
              hr: { status: 'Pending' }
            };
            const fnf = res.fnfSettlement;
            const isManagerDone = approvals.manager.status === 'Approved';
            const isAdminDone = approvals.admin.status === 'Approved';
            const isHrDone = approvals.hr.status === 'Approved';
            const isFinanceShared = res.status === 'Shared with Finance' || fnf?.financeStatus === 'Sent to Finance' || fnf?.financeStatus === 'Payment Released' || res.status === 'F&F Completed';
            const isSettled = res.status === 'F&F Completed' || res.status === 'Settled';

            // Clearances count
            const clearances = res.clearances || {
              itAssets: false,
              financeAdvances: false,
              projectHandover: false,
              adminIdCard: false,
              hrExitInterview: false
            };
            const clearedCount = Object.values(clearances).filter(Boolean).length;

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:border-indigo-200 transition-all space-y-3.5"
              >
                {/* Header Row: Employee particulars & status */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-800 text-white font-black flex items-center justify-center text-sm shadow-2xs">
                      {res.empName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{res.empName}</h4>
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {res.empCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {res.designation} • <span className="font-semibold text-slate-700">{res.department}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(res.status)}
                  </div>
                </div>

                {/* Resignation Metadata Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Resigned On</span>
                    <strong className="text-slate-800 font-mono">{res.resignationDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Relieving Date</span>
                    <strong className="text-indigo-700 font-mono">{res.approvedLastWorkingDate || res.requestedRelievingDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Notice Period</span>
                    <span className="font-semibold text-slate-800">
                      {res.noticePeriodDays} Days {res.noticeShortfallDays ? `(${res.noticeShortfallDays}d shortfall)` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Exit Reason</span>
                    <span className="font-semibold text-slate-800">{res.reasonCategory}</span>
                  </div>
                </div>

                {/* 4-Step Approval & Finance Progress Bar */}
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Organization Approval & Payout Lifecycle:</span>
                    </span>
                    <span className="text-slate-500 font-medium">
                      Clearances: {clearedCount}/5 completed
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
                    {/* Step 1: Manager */}
                    <div
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isManagerDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : approvals.manager.status === 'Rejected'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-center gap-1">
                        {isManagerDone ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-slate-400" />}
                        <span>1. Manager</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {isManagerDone ? 'Approved' : 'Pending'}
                      </div>
                    </div>

                    {/* Step 2: Admin */}
                    <div
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isAdminDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : approvals.admin.status === 'Rejected'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-center gap-1">
                        {isAdminDone ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-slate-400" />}
                        <span>2. Admin</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {isAdminDone ? 'Assets Cleared' : 'Pending'}
                      </div>
                    </div>

                    {/* Step 3: HR */}
                    <div
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isHrDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : approvals.hr.status === 'Rejected'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-center gap-1">
                        {isHrDone ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-slate-400" />}
                        <span>3. HR Head</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {isHrDone ? 'Exit Authorized' : 'Pending'}
                      </div>
                    </div>

                    {/* Step 4: Finance */}
                    <div
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isSettled
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-extrabold'
                          : isFinanceShared
                          ? 'bg-cyan-50 border-cyan-200 text-cyan-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-center gap-1">
                        {isSettled ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : isFinanceShared ? <Send className="w-3 h-3 text-cyan-600" /> : <CreditCard className="w-3 h-3 text-slate-400" />}
                        <span>4. Finance</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {isSettled ? 'Disbursed' : isFinanceShared ? 'Voucher Shared' : 'Draft'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: F&F Amount & Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-semibold">Net F&F Settlement:</span>
                    <span className="font-bold text-slate-900 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                      ₹{(fnf?.netPayableAmount || 0).toLocaleString()}
                    </span>
                    {fnf?.financeVoucherNumber && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        (Voucher: {fnf.financeVoucherNumber})
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Action 1: Approval Gateway */}
                    <button
                      type="button"
                      onClick={() => setActiveResignationForApproval(res)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Review Approvals</span>
                    </button>

                    {/* Action 2: F&F Settlement Sheet */}
                    <button
                      type="button"
                      onClick={() => setActiveResignationForFnf(res)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                      <span>F&F Settlement & Finance</span>
                    </button>

                    {/* Quick share to finance if ready */}
                    {isHrDone && !isFinanceShared && (
                      <button
                        type="button"
                        onClick={() => handleQuickShareToFinance(res)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 shadow-2xs"
                        title="Transmit F&F voucher to Finance department"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Share to Finance</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODALS */}
      {isRegisterOpen && (
        <RegisterResignationModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          employees={employees}
          onSuccess={() => {
            onRefresh();
          }}
        />
      )}

      {activeResignationForApproval && (
        <ExitApprovalWorkflowModal
          isOpen={!!activeResignationForApproval}
          onClose={() => setActiveResignationForApproval(null)}
          resignation={activeResignationForApproval}
          onSuccess={() => {
            setActiveResignationForApproval(null);
            onRefresh();
          }}
        />
      )}

      {activeResignationForFnf && (
        <FnfSettlementModal
          isOpen={!!activeResignationForFnf}
          onClose={() => setActiveResignationForFnf(null)}
          resignation={activeResignationForFnf}
          employee={employees.find((e) => e.id === activeResignationForFnf.empId || e.empCode === activeResignationForFnf.empCode)}
          onSuccess={() => {
            setActiveResignationForFnf(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
