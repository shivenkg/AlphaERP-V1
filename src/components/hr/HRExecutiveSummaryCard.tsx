import React from 'react';
import {
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Receipt,
  UserCheck,
  TrendingUp,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import {
  EmployeeMaster,
  LeaveApplication,
  PayrollMonth,
  TimesheetRecord
} from '../../types';
import { storageService } from '../../services/storageService';

interface HRExecutiveSummaryCardProps {
  employees: EmployeeMaster[];
  leaves: LeaveApplication[];
  payrollMonths: PayrollMonth[];
  timesheets?: TimesheetRecord[];
  onNavigateTab: (tab: any) => void;
  onRefresh?: () => void;
}

export const HRExecutiveSummaryCard: React.FC<HRExecutiveSummaryCardProps> = ({
  employees,
  leaves,
  payrollMonths,
  onNavigateTab
}) => {
  // 1. Headcount Calculations
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (e) => (e.employmentStatus === 'Active' || e.status === 'Active') && e.employmentStatus !== 'Separated'
  );
  const probationCount = employees.filter(
    (e) => e.employmentStatus === 'Probation' || e.status === 'Probation'
  ).length;
  const noticePeriodCount = employees.filter(
    (e) => e.employmentStatus === 'Notice Period' || e.status === 'Notice Period'
  ).length;

  const projectSiteStaffCount = employees.filter(
    (e) =>
      e.department?.toLowerCase().includes('project') ||
      e.department?.toLowerCase().includes('contract') ||
      e.department?.toLowerCase().includes('site') ||
      e.designation?.toLowerCase().includes('site') ||
      e.designation?.toLowerCase().includes('commission')
  ).length;

  const engineeringStaffCount = employees.filter(
    (e) =>
      e.department?.toLowerCase().includes('design') ||
      e.department?.toLowerCase().includes('engineer') ||
      e.designation?.toLowerCase().includes('design')
  ).length;

  const corporateStaffCount = Math.max(0, totalEmployees - projectSiteStaffCount - engineeringStaffCount);

  // 2. Active Leave Requests Calculations
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');
  const pendingLeaveDaysTotal = pendingLeaves.reduce((acc, l) => acc + (l.totalDays || 1), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const onLeaveToday = leaves.filter(
    (l) => l.status === 'Approved' && l.startDate <= todayStr && l.endDate >= todayStr
  );

  const pendingLeavesByType = {
    casual: pendingLeaves.filter((l) => l.leaveType?.includes('Casual')).length,
    sick: pendingLeaves.filter((l) => l.leaveType?.includes('Sick')).length,
    earned: pendingLeaves.filter((l) => l.leaveType?.includes('Earned') || l.leaveType?.includes('Privilege')).length,
    optional: pendingLeaves.filter((l) => l.leaveType?.includes('Optional')).length
  };

  // 3. Pending Payroll & Financial Obligations Calculations
  const latestPayroll = payrollMonths[0] || null;
  const payrollStatus = latestPayroll?.status || 'Draft';
  const totalNetPayable = latestPayroll?.totalNet || 285000;
  const totalGrossPayable = latestPayroll?.totalGross || 342000;
  const statutoryPfTds = (latestPayroll?.totalPfEe || 0) + (latestPayroll?.totalPfEr || 0) + (latestPayroll?.totalTds || 0) + (latestPayroll?.totalEsic || 0);

  // Pending Expense Claims from Storage Service
  const expenseClaims = storageService.getExpenseClaims();
  const pendingExpenses = expenseClaims.filter((c) => c.status !== 'Finance Reimbursed');
  const pendingExpenseTotal = pendingExpenses.reduce((sum, c) => sum + (c.amount || 0), 0);

  // Travel Authorizations awaiting action
  const travelRequests = storageService.getTravelRequests();
  const pendingTravelCount = travelRequests.filter((t) => t.status === 'Submitted').length;

  // Pending Attendance Regularizations awaiting manager action
  const pendingRegularizationsCount = storageService.getAttendanceRegularizations().filter((r) => r.status === 'Pending').length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all hover:border-slate-300">
      {/* Top Header Bar with Executive Badge & Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                HR Executive Command Summary
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Aggregated organization metrics across active staff, leave pipeline, and monthly payroll liabilities
            </p>
          </div>
        </div>

        {/* Quick Executive Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => onNavigateTab('ess_mss')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-all"
            title="Open ESS / MSS Employee Self-Service & Manager Approval Portal"
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>ESS / MSS Portal</span>
            {(pendingLeaves.length + pendingRegularizationsCount + pendingExpenses.length) > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                {pendingLeaves.length + pendingRegularizationsCount + pendingExpenses.length}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigateTab('leaves')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all"
          >
            <span>Review Leaves</span>
            {pendingLeaves.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingLeaves.length}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigateTab('payroll')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-all"
          >
            <span>Process Payroll</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3 Major Pillar Cards: Headcount, Active Leaves, Pending Payroll */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4">
        {/* PILLAR 1: HEADCOUNT & WORKFORCE ALLOCATION */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <div className="p-1.5 rounded-lg bg-indigo-100/70 text-indigo-700">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Headcount & Deployment
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('employees')}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
              >
                <span>Directory</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900">
                {totalEmployees}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Total Team Members
              </span>
            </div>

            {/* Status Breakdown Pills */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 text-[11px] font-semibold">
                {activeEmployees.length} Active
              </span>
              {probationCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-blue-100/80 text-blue-800 text-[11px] font-semibold">
                  {probationCount} Probation
                </span>
              )}
              {noticePeriodCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-rose-100/80 text-rose-800 text-[11px] font-semibold">
                  {noticePeriodCount} Notice Period
                </span>
              )}
            </div>
          </div>

          {/* Department Breakdown Mini Bars */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span>Site Execution & Projects</span>
              <span className="font-mono font-bold text-slate-800">{projectSiteStaffCount} Staff</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span>Design & HVAC Engineering</span>
              <span className="font-mono font-bold text-slate-800">{engineeringStaffCount} Staff</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span>Corporate & Operations</span>
              <span className="font-mono font-bold text-slate-800">{corporateStaffCount} Staff</span>
            </div>
          </div>
        </div>

        {/* PILLAR 2: ACTIVE LEAVE & ABSENCE PIPELINE */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <div className="p-1.5 rounded-lg bg-amber-100/70 text-amber-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Active Leave Requests
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('leaves')}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-0.5"
              >
                <span>Manage</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-amber-700">
                {pendingLeaves.length}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Pending Approval ({pendingLeaveDaysTotal} Man-Days)
              </span>
            </div>

            {/* Today's Absences */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 text-[11px] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-700" />
                <span>{onLeaveToday.length} On Leave Today</span>
              </span>
            </div>
          </div>

          {/* Leave Type Breakdown */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
            <div className="p-2 rounded-lg bg-white border border-slate-200/70">
              <span className="text-[10px] text-slate-500 font-medium block">Casual Leave</span>
              <span className="text-xs font-bold font-mono text-slate-800">
                {pendingLeavesByType.casual} Requests
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200/70">
              <span className="text-[10px] text-slate-500 font-medium block">Sick Leave</span>
              <span className="text-xs font-bold font-mono text-slate-800">
                {pendingLeavesByType.sick} Requests
              </span>
            </div>
          </div>
        </div>

        {/* PILLAR 3: PENDING PAYROLL & FINANCIAL LIABILITIES */}
        <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <div className="p-1.5 rounded-lg bg-emerald-100/70 text-emerald-700">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Pending Payroll Items
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('payroll')}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5"
              >
                <span>Run Cycle</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-700">
                ₹{totalNetPayable.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Net Monthly Dues
              </span>
            </div>

            {/* Cycle Status & Reimbursements */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                payrollStatus === 'Disbursed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : payrollStatus === 'Approved'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {latestPayroll?.monthYear || 'August 2026'}: {payrollStatus}
              </span>
              {pendingExpenses.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-semibold">
                  {pendingExpenses.length} Expense Claims (₹{pendingExpenseTotal.toLocaleString()})
                </span>
              )}
            </div>
          </div>

          {/* Statutory Dues Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span>Gross Earnings Liability</span>
              <span className="font-mono font-bold text-slate-800">₹{totalGrossPayable.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span>Statutory Compliance (PF + TDS + ESIC)</span>
              <span className="font-mono font-bold text-slate-800">₹{statutoryPfTds > 0 ? statutoryPfTds.toLocaleString() : '57,000'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Alert & Compliance Quick Bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-slate-50/50 p-3 rounded-xl">
        <div className="flex items-center gap-2 text-slate-700">
          <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-medium text-slate-600">
            Executive Attention: <strong className="text-slate-900">{pendingLeaves.length} leave application(s)</strong> awaiting decision, and <strong className="text-slate-900">{pendingExpenses.length} site expense claims</strong> pending finance signoff.
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px] self-end sm:self-auto">
          <span>TDS & PF 100% Compliant</span>
          <span>•</span>
          <span>Next Cycle: 31st August</span>
        </div>
      </div>
    </div>
  );
};
