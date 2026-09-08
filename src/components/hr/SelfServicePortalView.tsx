import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Calendar,
  CreditCard,
  Laptop,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Briefcase,
  TrendingUp,
  MapPin,
  Plus,
  Printer,
  Camera,
  Building,
  Users,
  Sparkles,
  CalendarCheck,
  Target,
  GraduationCap,
  Plane,
  ArrowRight,
  Send,
  X,
  AlertCircle,
  Info,
  LayoutGrid,
  Table as TableIcon,
  Download,
  Cpu,
  Fingerprint,
  ScanFace,
  Activity,
  Eye,
  Filter,
  RefreshCw,
  RotateCcw,
  UserMinus
} from 'lucide-react';
import {
  EmployeeMaster,
  LeaveApplication,
  AttendanceRecord,
  PayrollMonth,
  ExpenseClaim,
  AttendanceRegularization,
  EmployeeAsset,
  BiometricDevice,
  AttendancePunchLog,
  ResignationRecord
} from '../../types';
import { storageService } from '../../services/storageService';
import { EmployeeAvatarUploadModal } from '../common';
import { generateEmployeePayslipPDF } from '../../utils/payslipPdfGenerator';
import { BiometricDeviceManagerModal } from './BiometricDeviceManagerModal';
import { ESSAttendanceLogView } from './ESSAttendanceLogView';
import { MSSTeamAttendanceView } from './MSSTeamAttendanceView';
import { RegisterResignationModal } from './RegisterResignationModal';

interface SelfServicePortalViewProps {
  employees: EmployeeMaster[];
  leaves: LeaveApplication[];
  attendance: AttendanceRecord[];
  payrollMonths: PayrollMonth[];
  onRefresh: () => void;
  onViewPayslip: (month: string, year: number, slip: any, employee: EmployeeMaster) => void;
  onNavigateAlphaHR?: (subTab: string) => void;
}

export const SelfServicePortalView: React.FC<SelfServicePortalViewProps> = ({
  employees = [],
  leaves = [],
  attendance = [],
  payrollMonths = [],
  onRefresh,
  onViewPayslip,
  onNavigateAlphaHR
}) => {
  // Safe Fallbacks for Collections
  const safeEmployees = employees && employees.length > 0 ? employees : [];
  const safeLeaves = leaves || [];
  const safeAttendance = attendance || [];
  const safePayrollMonths = payrollMonths || [];

  // Current Selected Employee Context for ESS
  const [selectedEmpId, setSelectedEmpId] = useState<string>(safeEmployees[0]?.id || 'emp-001');
  const [portalMode, setPortalMode] = useState<'ess' | 'mss'>('ess');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [leaveViewMode, setLeaveViewMode] = useState<'cards' | 'table'>('cards');

  // Quick Action Modals State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [isResignationModalOpen, setIsResignationModalOpen] = useState(false);
  const [assetReturnModalOpen, setAssetReturnModalOpen] = useState(false);
  const [selectedAssetForReturn, setSelectedAssetForReturn] = useState<EmployeeAsset | null>(null);
  const [assetReturnRemarks, setAssetReturnRemarks] = useState('');
  const [assetReturnCondition, setAssetReturnCondition] = useState<'Good' | 'Fair' | 'Damaged' | 'Normal Wear & Tear'>('Good');

  // Attendance Filter States for ESS & MSS
  const [essAttendanceMonth, setEssAttendanceMonth] = useState('2026-08');
  const [teamAttendanceDate, setTeamAttendanceDate] = useState('2026-08-28');
  const [teamAttendanceDeptFilter, setTeamAttendanceDeptFilter] = useState('ALL');
  const [teamAttendanceStatusFilter, setTeamAttendanceStatusFilter] = useState('ALL');
  const [teamAttendanceSearch, setTeamAttendanceSearch] = useState('');
  const [selectedPunchEmployee, setSelectedPunchEmployee] = useState<EmployeeMaster | null>(null);

  // Form states
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual Leave (CL)',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    totalDays: 1,
    reason: 'Personal and family commitment'
  });

  const [regForm, setRegForm] = useState({
    date: new Date().toISOString().split('T')[0],
    punchType: 'Missed Biometric Punch',
    inTime: '09:15',
    outTime: '18:45',
    reason: 'Biometric fingerprint device was undergoing server sync at Mumbai HQ'
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'Site Fuel & Conveyance',
    amount: 1450,
    projectName: 'Commercial VRF Site - BKC',
    description: 'Site visit taxi fare and local transit for engineering team inspection'
  });

  const fallbackEmployee: EmployeeMaster = {
    id: 'emp-001',
    empCode: 'EMP-001',
    fullName: 'Shivender Kumar',
    name: 'Shivender Kumar',
    designation: 'Managing Director & Operations Head',
    department: 'Management',
    email: 'shiven.k@gmail.com',
    officialEmail: 'shiven.k@gmail.com',
    phone: '+91 98201 23456',
    dateOfJoining: '2023-01-15',
    joiningDate: '2023-01-15',
    employmentStatus: 'Active',
    baseMonthlySalary: 120000,
    grossMonthlySalary: 200000,
    ctcAnnual: 2400000,
    annualCTC: 2400000,
    pan: 'ABCDE1234F',
    aadhaar: '1234 5678 9012',
    bankAccount: '123456789012',
    ifscCode: 'HDFC0001234',
    casualLeaveBalance: 12,
    sickLeaveBalance: 8,
    privilegeLeaveBalance: 15,
    leaveBalances: {
      cl: 12,
      sl: 8,
      pl: 15
    },
    avatar: ''
  };

  const currentEmp: EmployeeMaster = safeEmployees.find(e => e.id === selectedEmpId) || safeEmployees[0] || fallbackEmployee;

  // Safe Data Retrievals
  const allAssets = (storageService.getEmployeeAssets() || []).filter(a => a.empId === currentEmp?.id);
  const myLeaves = safeLeaves.filter(l => l.empId === currentEmp?.id);
  const myRegularizations = (storageService.getAttendanceRegularizations() || []).filter(r => r.empId === currentEmp?.id);
  const myExpenses = (storageService.getExpenseClaims() || []).filter(e => e.empId === currentEmp?.id);
  const myAttendance = safeAttendance.filter(
    (a) => a.empId === currentEmp?.id || a.empCode === currentEmp?.empCode
  );
  const myPunchLogs = storageService.getAttendancePunchLogs(currentEmp?.id);
  const biometricDevices = storageService.getBiometricDevices();
  const myResignation = (storageService.getResignations() || []).find(
    (r) => r.empId === currentEmp?.id || r.empCode === currentEmp?.empCode
  );

  // Leave Balances Engine for Current Logged-in Employee
  const matchesLeaveType = (leaveTypeStr: string, category: 'CL' | 'SL' | 'PL' | 'OH' | 'COMP') => {
    const s = (leaveTypeStr || '').toLowerCase();
    switch (category) {
      case 'CL':
        return s.includes('casual') || s.includes('(cl)') || s === 'cl';
      case 'SL':
        return s.includes('sick') || s.includes('medical') || s.includes('(sl)') || s === 'sl';
      case 'PL':
        return s.includes('earned') || s.includes('privilege') || s.includes('(pl)') || s === 'pl' || s.includes('annual');
      case 'OH':
        return s.includes('optional') || s.includes('holiday') || s.includes('(oh)') || s.includes('festival');
      case 'COMP':
        return s.includes('compensatory') || s.includes('comp') || s.includes('c-off');
      default:
        return false;
    }
  };

  const getLeaveItemData = (
    name: string,
    code: string,
    category: 'CL' | 'SL' | 'PL' | 'OH' | 'COMP',
    annualQuota: number,
    empCustomBalance?: number,
    description: string = '',
    policyRules: string = '',
    colorTheme: {
      accent: string;
      bg: string;
      border: string;
      text: string;
      bar: string;
    } = {
      accent: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      text: 'text-indigo-900',
      bar: 'bg-indigo-600'
    }
  ) => {
    const approvedLeaves = myLeaves.filter(l => matchesLeaveType(l.leaveType, category) && l.status === 'Approved');
    const approvedDays = approvedLeaves.reduce((sum, l) => sum + (Number(l.totalDays) || 0), 0);

    const pendingLeaves = myLeaves.filter(l => matchesLeaveType(l.leaveType, category) && l.status === 'Pending');
    const pendingDays = pendingLeaves.reduce((sum, l) => sum + (Number(l.totalDays) || 0), 0);

    const earned = annualQuota;
    let used = approvedDays;
    if (empCustomBalance != null && approvedDays === 0 && empCustomBalance < earned) {
      used = earned - empCustomBalance;
    } else if (empCustomBalance != null && approvedDays > 0) {
      const baseUsed = Math.max(0, earned - empCustomBalance);
      used = Math.max(approvedDays, baseUsed);
    }

    const remaining = Math.max(0, earned - used);
    const usagePct = earned > 0 ? Math.min(100, Math.round((used / earned) * 100)) : 0;

    return {
      name,
      code,
      category,
      fullTypeOption: `${name} (${code})`,
      earned,
      used,
      pending: pendingDays,
      remaining,
      usagePct,
      description,
      policyRules,
      colorTheme
    };
  };

  const leaveBalancesList = [
    getLeaveItemData(
      'Casual Leave',
      'CL',
      'CL',
      12,
      currentEmp.leaveBalances?.cl ?? currentEmp.casualLeaveBalance,
      'For unexpected personal emergencies, family events, or immediate unplanned errands.',
      'Max 3 consecutive days • Prior 24h notice preferred • Unused balance lapses on 31st March',
      {
        accent: 'text-blue-600',
        bg: 'bg-blue-50/80',
        border: 'border-blue-100',
        text: 'text-blue-900',
        bar: 'bg-blue-500'
      }
    ),
    getLeaveItemData(
      'Sick / Medical Leave',
      'SL',
      'SL',
      10,
      currentEmp.leaveBalances?.sl ?? currentEmp.sickLeaveBalance,
      'For personal sickness, medical treatments, outpatient consultations, or hospital recovery.',
      'Doctor fitness certificate mandatory if >2 days • Half-day allowed • Lapses at year end',
      {
        accent: 'text-rose-600',
        bg: 'bg-rose-50/80',
        border: 'border-rose-100',
        text: 'text-rose-900',
        bar: 'bg-rose-500'
      }
    ),
    getLeaveItemData(
      'Earned / Privilege Leave',
      'PL',
      'PL',
      18,
      currentEmp.leaveBalances?.pl ?? currentEmp.privilegeLeaveBalance,
      'Credited annually for planned vacation, rest, and annual leave commitments.',
      'Encashable at F&F • Max 30 days carry-forward to next FY • Apply 7 days in advance',
      {
        accent: 'text-indigo-600',
        bg: 'bg-indigo-50/80',
        border: 'border-indigo-100',
        text: 'text-indigo-900',
        bar: 'bg-indigo-600'
      }
    ),
    getLeaveItemData(
      'Optional Holiday',
      'OH',
      'OH',
      3,
      undefined,
      'Selectable cultural and festival occasions chosen from the approved corporate gazette.',
      'Max 3 days per calendar year • Advance manager intimation required • Cannot carry forward',
      {
        accent: 'text-amber-600',
        bg: 'bg-amber-50/80',
        border: 'border-amber-100',
        text: 'text-amber-900',
        bar: 'bg-amber-500'
      }
    ),
    getLeaveItemData(
      'Compensatory Off',
      'Comp-Off',
      'COMP',
      2,
      undefined,
      'Awarded for weekend site installation duty, emergency client commissioning, or overtime.',
      'Valid for 60 days from field duty date • Requires site project manager confirmation',
      {
        accent: 'text-emerald-600',
        bg: 'bg-emerald-50/80',
        border: 'border-emerald-100',
        text: 'text-emerald-900',
        bar: 'bg-emerald-500'
      }
    )
  ];

  const totalEarnedDays = leaveBalancesList.reduce((acc, item) => acc + item.earned, 0);
  const totalUsedDays = leaveBalancesList.reduce((acc, item) => acc + item.used, 0);
  const totalPendingDays = leaveBalancesList.reduce((acc, item) => acc + item.pending, 0);
  const totalRemainingDays = leaveBalancesList.reduce((acc, item) => acc + item.remaining, 0);

  const clBalance = leaveBalancesList[0];
  const slBalance = leaveBalancesList[1];
  const plBalance = leaveBalancesList[2];

  // MSS Manager View: All Pending Items across organization
  const pendingLeaves = safeLeaves.filter(l => l.status === 'Pending');
  const pendingRegularizations = (storageService.getAttendanceRegularizations() || []).filter(r => r.status === 'Pending');
  const pendingExpenses = (storageService.getExpenseClaims() || []).filter(e => e.status === 'Submitted');

  // Submit Leave Action
  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.applyLeave({
      empId: currentEmp.id,
      empName: currentEmp.fullName || currentEmp.name || 'Employee',
      empCode: currentEmp.empCode,
      leaveType: leaveForm.leaveType as any,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      totalDays: Number(leaveForm.totalDays) || 1,
      reason: leaveForm.reason
    });
    setIsLeaveModalOpen(false);
    onRefresh();
  };

  // Submit Regularization Action
  const handleSubmitRegularization = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.submitAttendanceRegularization({
      empId: currentEmp.id,
      empName: currentEmp.fullName || currentEmp.name || 'Employee',
      empCode: currentEmp.empCode,
      date: regForm.date,
      punchType: regForm.punchType as any,
      inTime: regForm.inTime,
      outTime: regForm.outTime,
      reason: regForm.reason
    });
    setIsRegModalOpen(false);
    onRefresh();
  };

  // Submit Expense Action
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.submitExpenseClaim({
      empId: currentEmp.id,
      empName: currentEmp.fullName || currentEmp.name || 'Employee',
      category: expenseForm.category as any,
      amount: Number(expenseForm.amount) || 0,
      expenseDate: new Date().toISOString().split('T')[0],
      projectName: expenseForm.projectName,
      description: expenseForm.description,
      billAttached: true,
      receiptNumber: `REC-${Date.now().toString().slice(-4)}`
    });
    setIsExpenseModalOpen(false);
    onRefresh();
  };

  // Manager Approval Actions
  const handleApproveLeave = (id: string) => {
    storageService.updateLeaveStatus(id, 'Approved');
    onRefresh();
  };

  const handleRejectLeave = (id: string) => {
    storageService.updateLeaveStatus(id, 'Rejected');
    onRefresh();
  };

  const handleApproveReg = (id: string) => {
    storageService.updateAttendanceRegularizationStatus(id, 'Approved', 'Management');
    onRefresh();
  };

  const handleApproveExpense = (id: string) => {
    storageService.updateExpenseClaimStatus(id, 'Manager Approved');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* AlphaHR Suite Linked Interconnect Ribbon */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-indigo-700/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              AlphaHR™ Interconnected Suite
            </span>
            <span className="text-xs text-indigo-200/90 font-medium">
              Live Employee & Manager Portal (ESS / MSS)
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Employee Self-Service & Manager Approval Hub</span>
          </h3>
          <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed">
            Directly connected to AlphaHR Org Master, Biometrics, Leave Management, Payroll Engine, and PMS Appraisals.
          </p>
        </div>

        {/* AlphaHR Admin Module Quick Switcher */}
        {onNavigateAlphaHR && (
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <button
              onClick={() => onNavigateAlphaHR('org_master')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all border border-white/10"
              title="Open Org & HR Master"
            >
              <Building className="w-3.5 h-3.5 text-indigo-300" />
              <span>Org Master</span>
            </button>
            <button
              onClick={() => onNavigateAlphaHR('employees')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all border border-white/10"
              title="Open Employee Directory"
            >
              <Users className="w-3.5 h-3.5 text-indigo-300" />
              <span>Employees</span>
            </button>
            <button
              onClick={() => onNavigateAlphaHR('attendance')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all border border-white/10"
              title="Open Attendance & Shifts"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Attendance</span>
            </button>
            <button
              onClick={() => onNavigateAlphaHR('leaves')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-all border border-white/10"
              title="Open Leave Management"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>Leaves</span>
            </button>
            <button
              onClick={() => onNavigateAlphaHR('payroll')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shadow-xs"
              title="Open Payroll & Salary Slips"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payroll</span>
            </button>
          </div>
        )}
      </div>

      {/* Header Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                Active ESS Profile:
              </span>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-500"
              >
                {safeEmployees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.fullName || e.name} ({e.empCode}) - {e.designation}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Simulate individual Employee Self-Service (ESS) & Manager Approvals (MSS)
            </p>
          </div>
        </div>

        {/* Action Buttons & Portal Mode Switcher */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => setIsBiometricModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50/50 text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all hover:border-indigo-300"
            title="Configure biometric attendance terminals & sync punch logs"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Biometric Devices ({biometricDevices.length})</span>
          </button>

          {/* Portal Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setPortalMode('ess')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                portalMode === 'ess'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My ESS Portal
            </button>
            <button
              onClick={() => setPortalMode('mss')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                portalMode === 'mss'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manager Portal (MSS)
              {(pendingLeaves.length + pendingRegularizations.length + pendingExpenses.length) > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  {pendingLeaves.length + pendingRegularizations.length + pendingExpenses.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 1. EMPLOYEE SELF SERVICE (ESS) VIEW */}
      {portalMode === 'ess' && currentEmp && (
        <div className="space-y-6">
          {/* Employee Hero Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="relative group cursor-pointer shrink-0"
                  onClick={() => setIsAvatarModalOpen(true)}
                  title="Click to update latest profile photo"
                >
                  {currentEmp.avatar ? (
                    <img
                      src={currentEmp.avatar}
                      alt={currentEmp.fullName || currentEmp.name || 'Employee'}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-md group-hover:ring-2 group-hover:ring-indigo-300 transition-all"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center border-2 border-indigo-400/40 shadow-inner group-hover:bg-indigo-500 transition-colors">
                      {(currentEmp.fullName || currentEmp.name || 'EM').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-950/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 text-white rounded-full shadow-xs border border-white/20">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {currentEmp.fullName || currentEmp.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                      {currentEmp.empCode}
                    </span>
                    <button
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="ml-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white rounded-lg text-[10px] font-bold border border-white/10 flex items-center gap-1 transition-colors"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Update Photo</span>
                    </button>
                  </div>
                  <div className="text-xs text-indigo-200 mt-0.5">
                    {currentEmp.designation} • <span className="text-slate-300">{currentEmp.department}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Joined: {currentEmp.dateOfJoining || currentEmp.joiningDate || '2025-06-01'} • PAN: {currentEmp.pan || 'PAN Verified'}
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar right on hero */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Apply Leave</span>
                </button>
                <button
                  onClick={() => setIsRegModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 shadow-xs transition-all"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Regularize Punch</span>
                </button>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 shadow-xs transition-all"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Submit Claim</span>
                </button>
                <button
                  onClick={() => setIsResignationModalOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border shadow-xs transition-all ${
                    myResignation
                      ? 'bg-rose-500/25 hover:bg-rose-500/35 border-rose-400/50 text-rose-200'
                      : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                  }`}
                >
                  <UserMinus className="w-3.5 h-3.5 text-rose-300" />
                  <span>{myResignation ? 'Exit & Clearance' : 'Exit / Resign'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Casual Leave (CL)</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {clBalance.remaining} Days
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {clBalance.used} Used / {clBalance.earned} Earned
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Sick Leave (SL)</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {slBalance.remaining} Days
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {slBalance.used} Used / {slBalance.earned} Earned
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Privilege Leave (PL)</span>
                <span className="text-xl font-bold font-mono text-white mt-1 block">
                  {plBalance.remaining} Days
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {plBalance.used} Used / {plBalance.earned} Earned
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Leave Available</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                  {totalRemainingDays} Days
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {totalUsedDays} Availed / {totalEarnedDays} Total
                </span>
              </div>
            </div>
          </div>

          {/* Separation & Exit Clearance Workflow Status Banner (If Applicable) */}
          {myResignation && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                    <UserMinus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">Separation & Resignation Tracking</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        {myResignation.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Submitted on <span className="font-semibold text-slate-800">{myResignation.resignationDate}</span> • 
                      Approved Last Working Date: <span className="font-semibold text-slate-800">{myResignation.approvedLastWorkingDate || myResignation.requestedRelievingDate}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsResignationModalOpen(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shrink-0"
                >
                  View Exit Details
                </button>
              </div>

              {/* 3-Tier Multi-Department Approvals Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-1 text-xs">
                <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400">1. Reporting Manager</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {myResignation.approvals?.manager?.status === 'Approved' ? '✓ Approved' : myResignation.approvals?.manager?.status || 'Pending'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {myResignation.approvals?.manager?.remarks || 'Awaiting initial sign-off'}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400">2. Executive Admin</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {myResignation.approvals?.admin?.status === 'Approved' ? '✓ Approved' : myResignation.approvals?.admin?.status || 'Pending'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {myResignation.approvals?.admin?.remarks || 'Company assets & facility review'}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400">3. Human Resources</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {myResignation.approvals?.hr?.status === 'Approved' ? '✓ Approved' : myResignation.approvals?.hr?.status || 'Pending'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {myResignation.fullAndFinalSettlement?.netPayableAmount 
                      ? `F&F Calculated: ₹${myResignation.fullAndFinalSettlement.netPayableAmount.toLocaleString()}`
                      : 'Final sign-off & F&F preparation'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MY LEAVE BALANCES SECTION (EARNED, USED, REMAINING)     */}
          {/* ======================================================== */}
          <div id="my-leave-balances-section" className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900">
                      My Leave Balances
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
                      FY 2026-27 Entitlement Cycle
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                      Live Accrual
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Breakdown of earned entitlements, utilized days, and remaining available leave balances for {currentEmp.fullName || currentEmp.name}
                  </p>
                </div>
              </div>

              {/* Action and View Mode Controls */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
                  <button
                    onClick={() => setLeaveViewMode('cards')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      leaveViewMode === 'cards'
                        ? 'bg-white text-indigo-600 font-bold shadow-2xs'
                        : 'hover:text-slate-900'
                    }`}
                    title="Grid Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </button>
                  <button
                    onClick={() => setLeaveViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      leaveViewMode === 'table'
                        ? 'bg-white text-indigo-600 font-bold shadow-2xs'
                        : 'hover:text-slate-900'
                    }`}
                    title="Detailed Table View"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setLeaveForm(prev => ({
                      ...prev,
                      leaveType: 'Casual Leave (CL)'
                    }));
                    setIsLeaveModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Apply Leave</span>
                </button>
              </div>
            </div>

            {/* Overall Accrual & Utilization Summary Pill Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 rounded-xl p-3 border border-slate-200/70">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Total Earned Quota</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono text-slate-900">{totalEarnedDays}</span>
                  <span className="text-xs text-slate-500 font-medium">Days</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">Across 5 leave categories</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Total Used / Availed</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono text-indigo-600">{totalUsedDays}</span>
                  <span className="text-xs text-slate-500 font-medium">Days</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {totalEarnedDays > 0 ? `${Math.round((totalUsedDays / totalEarnedDays) * 100)}% of quota utilized` : '0% utilized'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Pending Approvals</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-xl font-bold font-mono ${totalPendingDays > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                    {totalPendingDays}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Days</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {totalPendingDays > 0 ? 'Awaiting manager sign-off' : 'All applications approved'}
                </span>
              </div>

              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-800 block">Total Remaining Balance</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono text-emerald-700">{totalRemainingDays}</span>
                  <span className="text-xs text-emerald-800 font-bold">Days Available</span>
                </div>
                <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium">Ready for immediate application</span>
              </div>
            </div>

            {/* View Mode: Cards View */}
            {leaveViewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leaveBalancesList.map((item) => (
                  <div
                    key={item.code}
                    className={`rounded-2xl border ${item.colorTheme.border} p-4 bg-white hover:shadow-md transition-all flex flex-col justify-between`}
                  >
                    <div>
                      {/* Card Top: Code Badge & Name & Policy */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl ${item.colorTheme.bg} ${item.colorTheme.accent} font-bold text-xs flex items-center justify-center border ${item.colorTheme.border} font-mono shrink-0`}>
                            {item.code}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">
                              {item.name}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Category: {item.code}
                            </span>
                          </div>
                        </div>

                        {item.pending > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold whitespace-nowrap">
                            +{item.pending}d Pending
                          </span>
                        )}
                      </div>

                      {/* Three Core Metric Pillars: Earned, Used, Remaining */}
                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-center mb-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Earned</span>
                          <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                            {item.earned} <span className="text-[10px] font-normal text-slate-500">d</span>
                          </span>
                        </div>
                        <div className="border-x border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Used</span>
                          <span className="text-base font-bold font-mono text-indigo-600 mt-0.5 block">
                            {item.used} <span className="text-[10px] font-normal text-slate-500">d</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Remaining</span>
                          <span className="text-base font-bold font-mono text-emerald-700 mt-0.5 block">
                            {item.remaining} <span className="text-[10px] font-normal text-emerald-700">d</span>
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Quota Utilized</span>
                          <span className="font-mono font-bold text-slate-700">
                            {item.used} / {item.earned} Days ({item.usagePct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full ${item.colorTheme.bar} rounded-full transition-all`}
                            style={{ width: `${item.usagePct}%` }}
                          />
                        </div>
                      </div>

                      {/* Description & Policy Rule */}
                      <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 mb-4 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-2">{item.policyRules}</span>
                      </div>
                    </div>

                    {/* Card Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700">
                        {item.remaining} days available
                      </span>
                      <button
                        onClick={() => {
                          setLeaveForm(prev => ({
                            ...prev,
                            leaveType: item.fullTypeOption
                          }));
                          setIsLeaveModalOpen(true);
                        }}
                        className={`px-3 py-1.5 rounded-lg ${item.colorTheme.bg} hover:brightness-95 ${item.colorTheme.accent} font-bold text-xs flex items-center gap-1 transition-all`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Apply {item.code}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View Mode: Table View */}
            {leaveViewMode === 'table' && (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Leave Type & Code</th>
                        <th className="px-4 py-3 text-center">Earned (Allotted)</th>
                        <th className="px-4 py-3 text-center">Used (Availed)</th>
                        <th className="px-4 py-3 text-center">Pending Approvals</th>
                        <th className="px-4 py-3 text-center">Remaining Balance</th>
                        <th className="px-4 py-3">Utilization</th>
                        <th className="px-4 py-3">Carry Forward / Encashment Policy</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {leaveBalancesList.map((item) => (
                        <tr key={item.code} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-7 h-7 rounded-lg ${item.colorTheme.bg} ${item.colorTheme.accent} font-bold text-[10px] font-mono flex items-center justify-center border ${item.colorTheme.border}`}>
                                {item.code}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 block">{item.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">Code: {item.code}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-800">
                            {item.earned} d
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono font-bold text-indigo-600">
                            {item.used} d
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono">
                            {item.pending > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                {item.pending} d
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-700 text-sm">
                            {item.remaining} d
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="w-28 space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                <span>{item.usagePct}%</span>
                                <span>{item.used}/{item.earned}d</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${item.colorTheme.bar} rounded-full`}
                                  style={{ width: `${item.usagePct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[11px] text-slate-600 max-w-xs">
                            {item.policyRules}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => {
                                setLeaveForm(prev => ({
                                  ...prev,
                                  leaveType: item.fullTypeOption
                                }));
                                setIsLeaveModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition-colors"
                            >
                              Apply
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs">
                      <tr>
                        <td className="px-4 py-3 text-slate-900">Total Across All Leave Types</td>
                        <td className="px-4 py-3 text-center font-mono text-slate-900">{totalEarnedDays} d</td>
                        <td className="px-4 py-3 text-center font-mono text-indigo-600">{totalUsedDays} d</td>
                        <td className="px-4 py-3 text-center font-mono text-amber-700">{totalPendingDays} d</td>
                        <td className="px-4 py-3 text-center font-mono text-emerald-700 text-sm">{totalRemainingDays} d</td>
                        <td className="px-4 py-3 font-mono text-slate-600">
                          {totalEarnedDays > 0 ? `${Math.round((totalUsedDays / totalEarnedDays) * 100)}% Overall` : '0%'}
                        </td>
                        <td colSpan={2} className="px-4 py-3 text-right text-slate-500 text-[11px] font-normal">
                          All leave transactions audited per statutory MEP standards
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ESS Sub-Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Payslips */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    My Monthly Payslips & Tax Slips
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">FY 2025-26</span>
              </div>

              <div className="space-y-2">
                {safePayrollMonths.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                    No payroll register runs recorded yet.
                  </div>
                ) : (
                  safePayrollMonths.slice(0, 4).map((pm) => {
                    const slips = pm.payslips || (pm as any).slips || [];
                    const slip = slips.find(
                      (s: any) =>
                        s.employeeId === currentEmp.id ||
                        s.empId === currentEmp.id ||
                        s.empCode === currentEmp.empCode
                    ) || slips[0];

                    const mParts = (pm.monthYear || 'August 2026').split(' ');
                    const monthName = (pm as any).month || mParts[0] || 'August';
                    const yearNum = (pm as any).year || Number(mParts[1]) || 2026;
                    const netVal = slip?.netPayable ?? slip?.netSalary ?? slip?.netPay ?? 72400;

                    return (
                      <div
                        key={pm.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            {monthName} {yearNum}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Net Disbursed: <strong className="text-emerald-700 font-bold">₹{netVal.toLocaleString()}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const safeSlipObj = slip || {
                                employeeId: currentEmp.id,
                                empCode: currentEmp.empCode,
                                empName: currentEmp.fullName || currentEmp.name,
                                designation: currentEmp.designation,
                                daysPresent: 26,
                                totalDaysInMonth: 30,
                                basicEarned: 45000,
                                hraEarned: 22500,
                                specialAllowanceEarned: 12500,
                                siteAllowanceEarned: 8000,
                                conveyanceAllowance: 3000,
                                grossEarned: 91000,
                                grossSalary: 91000,
                                epfDeduction: 5400,
                                ptDeduction: 200,
                                esicDeduction: 0,
                                tdsDeduction: 3500,
                                totalDeductions: 9100,
                                netPayable: netVal,
                                netSalary: netVal
                              };
                              onViewPayslip(monthName, yearNum, safeSlipObj, currentEmp);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all"
                            title="Preview digital payslip modal"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => {
                              const safeSlipObj = slip || {
                                employeeId: currentEmp.id,
                                empCode: currentEmp.empCode,
                                empName: currentEmp.fullName || currentEmp.name,
                                designation: currentEmp.designation,
                                daysPresent: 26,
                                totalDaysInMonth: 30,
                                basicEarned: 45000,
                                hraEarned: 22500,
                                specialAllowanceEarned: 12500,
                                siteAllowanceEarned: 8000,
                                conveyanceAllowance: 3000,
                                grossEarned: 91000,
                                grossSalary: 91000,
                                epfDeduction: 5400,
                                ptDeduction: 200,
                                esicDeduction: 0,
                                tdsDeduction: 3500,
                                totalDeductions: 9100,
                                netPayable: netVal,
                                netSalary: netVal
                              };
                              generateEmployeePayslipPDF(currentEmp, `${monthName} ${yearNum}`, safeSlipObj);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-2xs"
                            title="Download official PDF salary slip"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Payslip</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* My In-Hand Assets */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    My Issued Equipment & Hardware
                  </h4>
                </div>
                <span className="text-xs font-bold text-indigo-600">{allAssets.length} Assets</span>
              </div>

              <div className="space-y-2">
                {allAssets.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                    No company assets allocated yet.
                  </p>
                ) : (
                  allAssets.map((ast) => {
                    const isReturned = ast.status === 'Returned';
                    return (
                      <div key={ast.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900">{ast.assetType}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Tag: <strong className="text-slate-800">{ast.assetTag}</strong> • SN: {ast.serialNumber || 'N/A'}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Issued on {ast.allocatedDate} ({ast.condition})
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {!isReturned ? (
                              <>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                  Active In-Hand
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAssetForReturn(ast);
                                    setAssetReturnRemarks('');
                                    setAssetReturnCondition('Good');
                                    setAssetReturnModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs"
                                  title="Initiate asset return with remarks"
                                >
                                  <RotateCcw className="w-3 h-3 text-indigo-600" />
                                  <span>Return Asset</span>
                                </button>
                              </>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                                Returned ({ast.returnDate || ast.returnedDate || 'Completed'})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Return remarks callout if asset is returned */}
                        {isReturned && (
                          <div className="pt-2 border-t border-slate-200/70 text-[11px] space-y-1">
                            <div className="flex items-center gap-2 text-slate-500">
                              <span>Return Condition: <strong className="text-slate-700">{ast.returnCondition || 'Good'}</strong></span>
                              {ast.receivedBy && <span>• Receiver: <strong className="text-slate-700">{ast.receivedBy}</strong></span>}
                            </div>
                            {ast.returnRemarks && (
                              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-700 italic">
                                "{ast.returnRemarks}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Additional ESS Tracking: Leaves & Expenses Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Leave Requests */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    My Leave History & Status
                  </h4>
                </div>
                <button
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  + Apply New
                </button>
              </div>

              <div className="space-y-2">
                {myLeaves.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                    No leave applications submitted yet.
                  </p>
                ) : (
                  myLeaves.slice(0, 4).map((l) => (
                    <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{l.leaveType}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {l.startDate} to {l.endDate} ({l.totalDays} {l.totalDays === 1 ? 'day' : 'days'})
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5">{l.reason}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        l.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {l.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* My Expense Claims */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    My Expense Claims & Advances
                  </h4>
                </div>
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
                >
                  + New Claim
                </button>
              </div>

              <div className="space-y-2">
                {myExpenses.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                    No expense claims submitted yet.
                  </p>
                ) : (
                  myExpenses.slice(0, 4).map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{exp.category}</div>
                        <div className="text-[11px] text-slate-500">
                          {exp.projectName || 'General'} • ₹{exp.amount.toLocaleString()}
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5">{exp.description}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        exp.status === 'Manager Approved' || exp.status === 'Finance Reimbursed' ? 'bg-emerald-100 text-emerald-800' :
                        exp.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {exp.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Individual Daily Attendance Log & Biometric Punches (ESS Confidential View) */}
          <ESSAttendanceLogView
            employee={currentEmp}
            attendance={safeAttendance}
            onOpenRegularization={(prefilledDate) => {
              if (prefilledDate) {
                setRegForm((prev) => ({ ...prev, date: prefilledDate }));
              }
              setIsRegModalOpen(true);
            }}
            onOpenBiometricModal={() => setIsBiometricModalOpen(true)}
          />
        </div>
      )}

      {/* 2. MANAGER SELF SERVICE (MSS) APPROVALS HUB */}
      {portalMode === 'mss' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pending Leaves */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase">Pending Leave Requests</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                  {pendingLeaves.length}
                </span>
              </div>

              <div className="space-y-3">
                {pendingLeaves.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">All leave requests cleared.</p>
                ) : (
                  pendingLeaves.map((l) => (
                    <div key={l.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{l.empName}</span>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {l.leaveType} ({l.totalDays}d)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{l.reason}</p>
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => handleApproveLeave(l.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-500 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLeave(l.id)}
                          className="px-2.5 py-1 rounded bg-rose-100 text-rose-700 text-[11px] font-bold hover:bg-rose-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Regularizations */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase">Punch Regularizations</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                  {pendingRegularizations.length}
                </span>
              </div>

              <div className="space-y-3">
                {pendingRegularizations.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No pending punch adjustments.</p>
                ) : (
                  pendingRegularizations.map((r) => (
                    <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{r.empName}</span>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {r.punchType}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{r.date} ({r.inTime} - {r.outTime})</div>
                      <p className="text-[11px] text-slate-600">{r.reason}</p>
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => handleApproveReg(r.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-500 transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Expense Claims */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase">Expense Claims</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                  {pendingExpenses.length}
                </span>
              </div>

              <div className="space-y-3">
                {pendingExpenses.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No pending expense claims.</p>
                ) : (
                  pendingExpenses.map((e) => (
                    <div key={e.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{e.empName}</span>
                        <span className="text-xs font-mono font-bold text-emerald-700">₹{e.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{e.category} • {e.projectName || 'General'}</div>
                      <p className="text-[11px] text-slate-600">{e.description}</p>
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => handleApproveExpense(e.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-500 transition-colors"
                        >
                          Approve Claim
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Team Daily Attendance & Biometric Monitoring Hub (MSS Team-Wide View) */}
          <MSSTeamAttendanceView
            employees={safeEmployees}
            attendance={safeAttendance}
            onOpenBiometricModal={() => setIsBiometricModalOpen(true)}
            onRefresh={onRefresh}
            onRegularizeForEmployee={(emp, date) => {
              setRegForm({
                date,
                punchType: 'Missed Biometric Punch',
                inTime: '09:00',
                outTime: '18:00',
                reason: `Manager attendance regularization for ${emp.fullName || emp.name}`
              });
              setIsRegModalOpen(true);
            }}
          />
        </div>
      )}

      {/* Quick Modal: Apply Leave */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Submit Leave Application</h3>
              </div>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white text-xs font-medium"
                >
                  {leaveBalancesList.map((item) => (
                    <option key={item.code} value={item.fullTypeOption}>
                      {item.name} ({item.code}) — {item.remaining}d Available (Earned: {item.earned}d, Used: {item.used}d)
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Live Balance Helper */}
              {(() => {
                const selectedItem = leaveBalancesList.find(
                  item => leaveForm.leaveType.includes(item.code) || leaveForm.leaveType.includes(item.name)
                ) || leaveBalancesList[0];
                const isOverBudget = Number(leaveForm.totalDays) > selectedItem.remaining;

                return (
                  <div className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                    isOverBudget ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{selectedItem.name} Status</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700 text-xs">
                        {selectedItem.remaining} Days Remaining
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Annual Quota: {selectedItem.earned} Days</span>
                      <span>Already Availed: {selectedItem.used} Days</span>
                    </div>
                    {isOverBudget && (
                      <p className="text-[10px] text-amber-800 font-semibold pt-1 border-t border-amber-200/70 leading-relaxed">
                        ⚠️ Note: Requesting {leaveForm.totalDays} day(s) exceeds your available balance of {selectedItem.remaining} day(s). Uncovered days may be processed as Leave Without Pay (LWP).
                      </p>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Days</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={leaveForm.totalDays}
                  onChange={(e) => setLeaveForm({ ...leaveForm, totalDays: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Explain reason for leave..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Modal: Punch Regularization */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Attendance Punch Regularization</h3>
              </div>
              <button onClick={() => setIsRegModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRegularization} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjustment Type</label>
                <select
                  value={regForm.punchType}
                  onChange={(e) => setRegForm({ ...regForm, punchType: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                >
                  <option value="Missed Biometric Punch">Missed Biometric Punch</option>
                  <option value="On-Site Duty / Field Assignment">On-Site Duty / Field Assignment</option>
                  <option value="Client Office Visit">Client Office Visit</option>
                  <option value="Work From Home (WFH)">Work From Home (WFH)</option>
                  <option value="Half Day Adjustment">Half Day Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={regForm.date}
                  onChange={(e) => setRegForm({ ...regForm, date: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-in Time</label>
                  <input
                    type="time"
                    value={regForm.inTime}
                    onChange={(e) => setRegForm({ ...regForm, inTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-out Time</label>
                  <input
                    type="time"
                    value={regForm.outTime}
                    onChange={(e) => setRegForm({ ...regForm, outTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Explanation</label>
                <textarea
                  rows={3}
                  value={regForm.reason}
                  onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })}
                  placeholder="Explain why punch adjustment is requested..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Submit Regularization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Modal: Submit Expense Claim */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Submit Expense Claim</h3>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                >
                  <option value="Site Fuel & Conveyance">Site Fuel & Conveyance (Taxi / Auto / Fuel)</option>
                  <option value="Lodging & Hotel">Lodging & Hotel</option>
                  <option value="Tolls & Parking">Tolls & Parking</option>
                  <option value="Client Refreshments">Client Refreshments & Site Meals</option>
                  <option value="Emergency Site Hardware">Emergency Site Hardware Purchase</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Claim Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Project / Site Name</label>
                <input
                  type="text"
                  value={expenseForm.projectName}
                  onChange={(e) => setExpenseForm({ ...expenseForm, projectName: e.target.value })}
                  placeholder="e.g. Commercial VRF Site - BKC"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Receipt Details</label>
                <textarea
                  rows={3}
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Describe the nature of expense and vendor..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Upload Modal in ESS */}
      {currentEmp && (
        <EmployeeAvatarUploadModal
          employee={currentEmp}
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          onAvatarUpdated={() => {
            onRefresh();
          }}
        />
      )}

      {/* Biometric Attendance Device Terminal Configuration Modal */}
      <BiometricDeviceManagerModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        onDataChanged={onRefresh}
      />

      {/* ESS Asset Return Modal with Remarks */}
      {assetReturnModalOpen && selectedAssetForReturn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Return Company Asset</h3>
                  <p className="text-[11px] text-slate-500">Provide remarks & return condition</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAssetReturnModalOpen(false);
                  setSelectedAssetForReturn(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="font-mono font-bold text-indigo-700">{selectedAssetForReturn.assetTag}</div>
              <div className="font-semibold text-slate-800">{selectedAssetForReturn.assetType}</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Serial No: {selectedAssetForReturn.serialNumber || 'N/A'} • Issued: {selectedAssetForReturn.allocatedDate}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!selectedAssetForReturn) return;
                storageService.returnAsset(selectedAssetForReturn.id, {
                  returnDate: new Date().toISOString().split('T')[0],
                  returnCondition: assetReturnCondition,
                  returnRemarks: assetReturnRemarks.trim() || 'Returned via Employee Self-Service',
                  receivedBy: `HR Store (Initiated by ${currentEmp.fullName || currentEmp.name})`
                });
                setAssetReturnModalOpen(false);
                setSelectedAssetForReturn(null);
                setAssetReturnRemarks('');
                onRefresh();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Physical Condition upon Return <span className="text-rose-500">*</span>
                </label>
                <select
                  value={assetReturnCondition}
                  onChange={(e) => setAssetReturnCondition(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Good">Good (Working & Complete)</option>
                  <option value="Normal Wear & Tear">Normal Wear & Tear</option>
                  <option value="Fair">Fair (Minor Scratches)</option>
                  <option value="Damaged">Damaged (Requires Repair / Defective)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Return Remarks & Equipment Handover Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={assetReturnRemarks}
                  onChange={(e) => setAssetReturnRemarks(e.target.value)}
                  placeholder="State the reason for return, accessories handed over (charger, bag, cables), or device status..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setAssetReturnModalOpen(false);
                    setSelectedAssetForReturn(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs active:scale-95 transition-all"
                >
                  Confirm Asset Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Employee Resignation / Exit Registration Modal */}
      <RegisterResignationModal
        isOpen={isResignationModalOpen}
        onClose={() => setIsResignationModalOpen(false)}
        employees={safeEmployees}
        defaultEmpId={currentEmp?.id}
        onSuccess={onRefresh}
      />
    </div>
  );
};
