import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  CalendarCheck,
  Clock,
  Calendar,
  CreditCard,
  UserMinus,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  FileText,
  DollarSign,
  Download,
  Building,
  Check,
  X,
  Printer,
  ChevronRight,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Layers,
  Sparkles,
  ClipboardList,
  Compass,
  ShieldCheck,
  Target,
  GraduationCap,
  Plane,
  ShieldAlert,
  PieChart,
  FolderCheck,
  CheckSquare,
  UserCheck,
  Camera,
  Upload,
  Image as ImageIcon,
  Cpu,
  Fingerprint,
  RefreshCw
} from 'lucide-react';
import {
  JobRequisition,
  JobCandidate,
  EmployeeMaster,
  AttendanceRecord,
  TimesheetRecord,
  LeaveApplication,
  HolidayRecord,
  PayrollMonth,
  ResignationRecord,
  KRAItem
} from '../types';
import { storageService } from '../services/storageService';
import { PREBUILT_HVAC_JDS } from '../data/hrData';

import { HRExecutiveSummaryCard } from './hr/HRExecutiveSummaryCard';
import { OrgMasterView } from './hr/OrgMasterView';
import { EmployeeAssetsDocsView } from './hr/EmployeeAssetsDocsView';
import { OnboardingWorkflowView } from './hr/OnboardingWorkflowView';
import { AttendanceRegularizationView } from './hr/AttendanceRegularizationView';
import { SelfServicePortalView } from './hr/SelfServicePortalView';
import { PerformanceManagementView } from './hr/PerformanceManagementView';
import { TrainingTalentView } from './hr/TrainingTalentView';
import { TravelExpensesView } from './hr/TravelExpensesView';
import { GrievanceManagementView } from './hr/GrievanceManagementView';
import { WorkforcePlanningView } from './hr/WorkforcePlanningView';
import { ExitResignationView } from './hr/ExitResignationView';
import { RegisterResignationModal } from './hr/RegisterResignationModal';
import { PayslipModal } from './hr/PayslipModal';
import { EmployeeAvatarUploadModal } from './common';
import { BiometricDeviceManagerModal } from './hr/BiometricDeviceManagerModal';

interface HRViewProps {
  jobRequisitions: JobRequisition[];
  candidates: JobCandidate[];
  employees: EmployeeMaster[];
  attendance: AttendanceRecord[];
  timesheets: TimesheetRecord[];
  leaves: LeaveApplication[];
  holidays: HolidayRecord[];
  payrollMonths: PayrollMonth[];
  resignations: ResignationRecord[];
  initialTab?: TabType;
  onRefresh: () => void;
}

export type TabType =
  | 'org_master'
  | 'employees'
  | 'recruitment'
  | 'attendance'
  | 'leaves'
  | 'payroll'
  | 'ess_mss'
  | 'performance'
  | 'training'
  | 'travel_expenses'
  | 'grievances'
  | 'analytics'
  | 'resignations';

export const HRView: React.FC<HRViewProps> = ({
  jobRequisitions,
  candidates,
  employees,
  attendance,
  timesheets,
  leaves,
  holidays,
  payrollMonths,
  resignations,
  initialTab = 'org_master',
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [recruitmentSubTab, setRecruitmentSubTab] = useState<'jds' | 'candidates' | 'onboarding'>('jds');
  const [employeeSubTab, setEmployeeSubTab] = useState<'directory' | 'assets_docs'>('directory');
  const [attendanceSubTab, setAttendanceSubTab] = useState<'biometrics' | 'timesheets' | 'regularization'>('biometrics');
  const [leaveSubTab, setLeaveSubTab] = useState<'applications' | 'holidays'>('applications');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected JD for Preview
  const [selectedJdPreview, setSelectedJdPreview] = useState<JobRequisition | null>(null);

  // New Requisition Modal State
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);

  const [reqForm, setReqForm] = useState<{
    jobTitle: string;
    department: string;
    positionsCount: number;
    experienceRequired: string;
    location: string;
    salaryRange: string;
    jobSummary: string;
    responsibilities: string[];
    technicalRequirements: string[];
    kras: KRAItem[];
    status: 'Draft' | 'Active' | 'Closed';
  }>({
    jobTitle: '',
    department: 'Projects & Contracting',
    positionsCount: 2,
    experienceRequired: '5-8 Years in HVAC',
    location: 'Mumbai & Site Locations',
    salaryRange: '₹8,00,000 - ₹12,00,000 PA',
    jobSummary: '',
    responsibilities: [],
    technicalRequirements: [],
    kras: [],
    status: 'Active'
  });

  // Candidate Modal
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    requisitionId: jobRequisitions[0]?.id || 'req-1',
    name: '',
    email: '',
    phone: '',
    currentCompany: '',
    experienceYears: 5,
    currentCTC: 800000,
    expectedCTC: 1100000,
    noticePeriodDays: 30,
    rating: 4,
    stage: 'Screening' as JobCandidate['stage'],
    interviewFeedback: ''
  });

  // Employee Profile Modal
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeMaster | null>(null);
  const [selectedEmployeeCard, setSelectedEmployeeCard] = useState<EmployeeMaster | null>(null);

  // Employee Profile Picture / Avatar Modal State
  const [avatarModalEmployee, setAvatarModalEmployee] = useState<EmployeeMaster | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const [empForm, setEmpForm] = useState({
    empCode: '',
    fullName: '',
    designation: '',
    department: 'Projects & Contracting',
    officialEmail: '',
    phone: '',
    avatar: '',
    joiningDate: new Date().toISOString().split('T')[0],
    pan: '',
    aadhaar: '',
    uan: '',
    pfNumber: '',
    bankAccountNo: '',
    bankIfsc: '',
    annualCTC: 900000,
    status: 'Active' as EmployeeMaster['status'],
    casualLeaveBalance: 12,
    sickLeaveBalance: 8,
    privilegeLeaveBalance: 15
  });

  // Daily Attendance Logger Modal
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceForm, setAttendanceForm] = useState({
    employeeId: employees[0]?.id || 'emp-1',
    status: 'Present' as AttendanceRecord['status'],
    inTime: '09:15',
    outTime: '18:45',
    siteAssigned: 'Commercial VRF Site - BKC',
    remarks: 'Regular on-site commissioning duty'
  });
  const [isBiometricDeviceModalOpen, setIsBiometricDeviceModalOpen] = useState(false);

  // Leave Modal
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employeeId: employees[0]?.id || 'emp-1',
    leaveType: 'PL' as LeaveApplication['leaveType'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    totalDays: 2,
    reason: 'Personal travel and family commitment'
  });

  // Resignation & F&F Modal
  const [resignationModalOpen, setResignationModalOpen] = useState(false);
  const [resignationForm, setResignationForm] = useState({
    employeeId: employees[0]?.id || 'emp-1',
    resignationDate: new Date().toISOString().split('T')[0],
    noticePeriodDays: 30,
    reason: 'Better career opportunity'
  });

  // Selected Payslip for View / Print
  const [selectedPayslip, setSelectedPayslip] = useState<{
    month: string;
    year: number;
    slip: any;
    employee: EmployeeMaster;
  } | null>(null);

  // Load Template into Requisition Form
  const handleLoadTemplate = (index: number) => {
    const tpl = PREBUILT_HVAC_JDS[index];
    setSelectedTemplateIndex(index);
    setReqForm({
      jobTitle: tpl.title,
      department: tpl.department,
      positionsCount: 2,
      experienceRequired: tpl.experienceRequired,
      location: 'Mumbai Regional Office & Sites',
      salaryRange: tpl.salaryRange,
      jobSummary: tpl.summary,
      responsibilities: [...tpl.responsibilities],
      technicalRequirements: [...tpl.technicalRequirements],
      kras: [...tpl.kras],
      status: 'Active'
    });
  };

  // Save Job Requisition
  const handleSaveRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.jobTitle) return;

    storageService.addJobRequisition({
      ...reqForm,
      responsibilities: reqForm.responsibilities.length > 0 ? reqForm.responsibilities : ['HVAC Site Execution & Coordination'],
      technicalRequirements: reqForm.technicalRequirements.length > 0 ? reqForm.technicalRequirements : ['B.Tech / Diploma Mechanical'],
      kras: reqForm.kras.length > 0 ? reqForm.kras : [
        { metric: 'Project On-Time Completion', target: '100% within SLA', weightage: 50 },
        { metric: 'Quality & Safety Compliance', target: 'Zero Incident', weightage: 50 }
      ]
    });

    setReqModalOpen(false);
    onRefresh();
  };

  // Save Candidate
  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateForm.name || !candidateForm.phone) return;

    storageService.addCandidate(candidateForm);
    setCandidateModalOpen(false);
    onRefresh();
  };

  // Open Employee Modal
  const handleOpenEmployeeModal = (emp?: EmployeeMaster) => {
    if (emp) {
      setEditingEmployee(emp);
      setEmpForm({
        empCode: emp.empCode,
        fullName: emp.fullName || (emp as any).name || '',
        designation: emp.designation,
        department: emp.department,
        officialEmail: emp.officialEmail || (emp as any).email || '',
        phone: emp.phone,
        avatar: emp.avatar || '',
        joiningDate: emp.joiningDate || (emp as any).dateOfJoining || new Date().toISOString().split('T')[0],
        pan: emp.pan,
        aadhaar: emp.aadhaar,
        uan: emp.uan || '',
        pfNumber: emp.pfNumber || '',
        bankAccountNo: emp.bankAccountNo,
        bankIfsc: emp.bankIfsc,
        annualCTC: emp.annualCTC || (emp as any).ctcAnnual || 900000,
        status: emp.status || (emp as any).employmentStatus || 'Active',
        casualLeaveBalance: emp.casualLeaveBalance ?? (emp as any).leaves?.cl ?? 12,
        sickLeaveBalance: emp.sickLeaveBalance ?? (emp as any).leaves?.sl ?? 8,
        privilegeLeaveBalance: emp.privilegeLeaveBalance ?? (emp as any).leaves?.pl ?? 15
      });
    } else {
      setEditingEmployee(null);
      const nextCode = `EMP-${(employees.length + 1).toString().padStart(3, '0')}`;
      setEmpForm({
        empCode: nextCode,
        fullName: '',
        designation: 'HVAC Project Engineer',
        department: 'Projects & Contracting',
        officialEmail: '',
        phone: '',
        avatar: '',
        joiningDate: new Date().toISOString().split('T')[0],
        pan: 'ABCDE1234F',
        aadhaar: '1234 5678 9012',
        uan: '100987654321',
        pfNumber: 'MH/BAN/0012345/000/0001',
        bankAccountNo: '501000293847',
        bankIfsc: 'HDFC0000053',
        annualCTC: 750000,
        status: 'Active',
        casualLeaveBalance: 12,
        sickLeaveBalance: 8,
        privilegeLeaveBalance: 15
      });
    }
    setEmployeeModalOpen(true);
  };

  // Save Employee
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.fullName) return;

    const monthlyGross = Math.round(empForm.annualCTC / 12);
    const basic = Math.round(monthlyGross * 0.5);
    const hra = Math.round(basic * 0.5);
    const specialAllowance = Math.max(0, monthlyGross - basic - hra - 1600 - 3000);

    const empData: any = {
      ...empForm,
      monthlySalaryStructure: {
        basicSalary: basic,
        hra,
        conveyanceAllowance: 1600,
        specialAllowance,
        siteAllowance: 3000,
        grossMonthlySalary: monthlyGross
      }
    };

    if (editingEmployee) {
      storageService.updateEmployee(editingEmployee.id, empData);
    } else {
      storageService.addEmployee(empData);
    }

    setEmployeeModalOpen(false);
    onRefresh();
  };

  // Log Attendance
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === attendanceForm.employeeId);
    if (!emp) return;

    storageService.logAttendance({
      empId: emp.id,
      empName: emp.name || emp.fullName || 'Employee',
      empCode: emp.empCode,
      date: attendanceDate,
      status: attendanceForm.status as any,
      checkInTime: attendanceForm.inTime,
      checkOutTime: attendanceForm.outTime,
      siteProjectName: attendanceForm.siteAssigned,
      remarks: attendanceForm.remarks
    });

    setAttendanceModalOpen(false);
    onRefresh();
  };

  // Submit Leave
  const handleSaveLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === leaveForm.employeeId);
    if (!emp) return;

    storageService.applyLeave({
      empId: emp.id,
      empName: emp.name || emp.fullName || 'Employee',
      empCode: emp.empCode,
      leaveType: (leaveForm.leaveType === 'CL' ? 'Casual Leave (CL)' : leaveForm.leaveType === 'SL' ? 'Sick Leave (SL)' : 'Earned Leave (PL)') as any,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      totalDays: leaveForm.totalDays,
      reason: leaveForm.reason
    });

    setLeaveModalOpen(false);
    onRefresh();
  };

  // Submit Resignation
  const handleSaveResignation = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === resignationForm.employeeId);
    if (!emp) return;

    const resDate = new Date(resignationForm.resignationDate);
    const lastDate = new Date(resDate.getTime() + resignationForm.noticePeriodDays * 86400000);
    const lastWorkingDateStr = lastDate.toISOString().split('T')[0];

    storageService.registerResignation({
      empId: emp.id,
      empName: emp.name || emp.fullName || 'Employee',
      empCode: emp.empCode,
      designation: emp.designation,
      department: emp.department,
      dateOfJoining: emp.dateOfJoining || emp.joiningDate || new Date().toISOString().split('T')[0],
      resignationDate: resignationForm.resignationDate,
      requestedRelievingDate: lastWorkingDateStr,
      approvedLastWorkingDate: lastWorkingDateStr,
      reasonCategory: 'Career Growth',
      employeeRemarks: resignationForm.reason,
      noticePeriodDays: resignationForm.noticePeriodDays,
      noticeShortfallDays: 0,
      clearances: {
        itAssets: false,
        financeAdvances: false,
        projectHandover: false,
        adminIdCard: false
      }
    });

    setResignationModalOpen(false);
    onRefresh();
  };

  // Run Payroll Month Action
  const handleRunPayroll = (monthStr: string, year: number) => {
    storageService.runMonthlyPayroll(`${monthStr} ${year}`);
    onRefresh();
  };

  // High-Level HR Stats
  const activeEmployeesCount = employees.filter((e) => e.employmentStatus === 'Active' || e.status === 'Active').length;
  const openJdsCount = jobRequisitions.filter((j) => j.status === 'Active / Hiring' || (j.status as string) === 'Active').length;
  const activeCandidatesCount = candidates.filter((c) => c.stage !== 'Hired' && c.stage !== 'Rejected').length;
  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              AlphaHR™ Unified Talent & HRMS Suite
            </span>
            <span className="text-xs text-slate-400">
              Indian Statutory (EPF / ESIC / PT / TDS) Compliant & ESS/MSS Integrated
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>AlphaHR™ Human Resources, Talent Acquisition & Payroll Engine</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
            End-to-end HRMS suite uniting KRA-based job postings, talent hiring pipeline, employee master records, biometric attendance & timesheet signoffs, leave calendars, automated monthly payroll computation with printable payslips, full & final exit settlements, and employee/manager self-service (ESS/MSS).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap md:flex-nowrap">
          {/* Quick Direct Link between AlphaHR and ESS/MSS Portal */}
          {activeTab !== 'ess_mss' ? (
            <button
              onClick={() => {
                setActiveTab('ess_mss');
                setSearchTerm('');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0"
              title="Switch to ESS/MSS Employee Self-Service & Manager Approvals"
            >
              <UserCheck className="w-4 h-4 text-purple-200" />
              <span>Open ESS / MSS Portal</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveTab('org_master');
                setSearchTerm('');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 shadow-sm transition-all shrink-0"
              title="Switch back to AlphaHR Admin Suite"
            >
              <Building className="w-4 h-4 text-indigo-400" />
              <span>AlphaHR Admin Suite</span>
            </button>
          )}

          {activeTab === 'recruitment' && recruitmentSubTab === 'jds' && (
            <button
              onClick={() => {
                handleLoadTemplate(0);
                setReqModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Post KRA Job with Prebuilt Template</span>
            </button>
          )}

          {activeTab === 'recruitment' && recruitmentSubTab === 'candidates' && (
            <button
              onClick={() => setCandidateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Candidate Profile</span>
            </button>
          )}

          {activeTab === 'employees' && (
            <button
              onClick={() => handleOpenEmployeeModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Employee</span>
            </button>
          )}

          {activeTab === 'attendance' && (
            <button
              onClick={() => setAttendanceModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Daily Attendance</span>
            </button>
          )}

          {activeTab === 'leaves' && (
            <button
              onClick={() => setLeaveModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          )}

          {activeTab === 'resignations' && (
            <button
              onClick={() => setResignationModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <UserMinus className="w-4 h-4" />
              <span>Register Resignation / Exit</span>
            </button>
          )}
        </div>
      </div>

      {/* HR Executive Command Summary Card */}
      <HRExecutiveSummaryCard
        employees={employees}
        leaves={leaves}
        payrollMonths={payrollMonths}
        timesheets={timesheets}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setSearchTerm('');
        }}
        onRefresh={onRefresh}
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => { setActiveTab('org_master'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'org_master'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="🔴 Essential" />
          <Building className="w-4 h-4" />
          <span>1. Org & HR Master</span>
        </button>

        <button
          onClick={() => { setActiveTab('employees'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'employees'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="🔴 Essential" />
          <Users className="w-4 h-4" />
          <span>2. Employee Management ({employees.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('recruitment'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'recruitment'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="🔴 Essential" />
          <Sparkles className="w-4 h-4" />
          <span>3. Recruitment & Onboarding</span>
        </button>

        <button
          onClick={() => { setActiveTab('attendance'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="🔴 Essential" />
          <CalendarCheck className="w-4 h-4" />
          <span>4. Attendance & Shift</span>
        </button>

        <button
          onClick={() => { setActiveTab('leaves'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'leaves'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="🔴 Essential" />
          <Calendar className="w-4 h-4" />
          <span>5. Leave Management</span>
        </button>

        <button
          onClick={() => { setActiveTab('payroll'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'payroll'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="🔴 Essential" />
          <CreditCard className="w-4 h-4" />
          <span>6. Payroll & Statutory</span>
        </button>

        <button
          onClick={() => { setActiveTab('ess_mss'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'ess_mss'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="🔴 Essential" />
          <UserCheck className="w-4 h-4" />
          <span>7. ESS / MSS Portal</span>
        </button>

        <button
          onClick={() => { setActiveTab('performance'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'performance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" title="🟠 Phase 2" />
          <Target className="w-4 h-4" />
          <span>8. Performance (PMS)</span>
        </button>

        <button
          onClick={() => { setActiveTab('training'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'training'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" title="🟠 Phase 2" />
          <GraduationCap className="w-4 h-4" />
          <span>9. Training & Talent</span>
        </button>

        <button
          onClick={() => { setActiveTab('travel_expenses'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'travel_expenses'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" title="🟠 Phase 2" />
          <Plane className="w-4 h-4" />
          <span>10. Travel & Expenses</span>
        </button>

        <button
          onClick={() => { setActiveTab('grievances'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'grievances'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" title="🟡 Phase 3" />
          <ShieldAlert className="w-4 h-4" />
          <span>11. Grievance Desk</span>
        </button>

        <button
          onClick={() => { setActiveTab('analytics'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" title="🟠 Phase 2" />
          <PieChart className="w-4 h-4" />
          <span>12. HR Analytics & Planning</span>
        </button>

        <button
          onClick={() => { setActiveTab('resignations'); setSearchTerm(''); }}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'resignations'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserMinus className="w-4 h-4" />
          <span>Exit & F&F ({resignations.length})</span>
        </button>
      </div>

      {/* 1. ORGANIZATION & HR MASTER VIEW */}
      {activeTab === 'org_master' && (
        <OrgMasterView onRefresh={onRefresh} />
      )}

      {/* 2. EMPLOYEE MANAGEMENT & ASSETS/DOCS */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setEmployeeSubTab('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                employeeSubTab === 'directory'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Employee Directory ({employees.length})
            </button>
            <button
              onClick={() => setEmployeeSubTab('assets_docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                employeeSubTab === 'assets_docs'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Assets, Hardware & Document Vault
            </button>
          </div>

          {employeeSubTab === 'assets_docs' ? (
            <EmployeeAssetsDocsView employees={employees} onRefresh={onRefresh} />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search employees by name, code, role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-xs text-slate-500 font-medium">
                    {employees.length} Employee Profiles
                  </span>
                  <button
                    onClick={() => {
                      setEditingEmployee(null);
                      setEmployeeModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Onboard Employee</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Emp Code & Name</th>
                        <th className="px-4 py-3">Designation & Dept</th>
                        <th className="px-4 py-3">Contact Details</th>
                        <th className="px-4 py-3">Statutory (UAN / PF / PAN)</th>
                        <th className="px-4 py-3">Annual CTC & Gross/mo</th>
                        <th className="px-4 py-3">Leave Balances (CL/SL/PL)</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {employees.map((emp) => {
                        const empName = emp.fullName || (emp as any).name || 'Employee';
                        const joinDate = emp.joiningDate || (emp as any).dateOfJoining || '2026-01-01';
                        const email = emp.officialEmail || (emp as any).email || 'emp@alphaerp.com';
                        const ctc = emp.annualCTC || (emp as any).ctc || 800000;
                        const grossMo = emp.monthlySalaryStructure?.grossMonthlySalary || (emp as any).monthlyGross || Math.round(ctc / 12);
                        const cl = emp.casualLeaveBalance ?? (emp as any).leaves?.cl ?? 12;
                        const sl = emp.sickLeaveBalance ?? (emp as any).leaves?.sl ?? 8;
                        const pl = emp.privilegeLeaveBalance ?? (emp as any).leaves?.pl ?? 15;
                        const status = emp.status || (emp as any).employmentStatus || 'Active';
                        const initials = (empName || 'EM')
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase();

                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div
                                  className="relative group/avatar cursor-pointer shrink-0"
                                  onClick={() => {
                                    setAvatarModalEmployee(emp);
                                    setIsAvatarModalOpen(true);
                                  }}
                                  title="Click to update latest profile photo"
                                >
                                  {emp.avatar ? (
                                    <img
                                      src={emp.avatar}
                                      alt={empName}
                                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs group-hover/avatar:ring-2 group-hover/avatar:ring-indigo-500 transition-all"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center shadow-2xs group-hover/avatar:bg-indigo-100 transition-all">
                                      {initials}
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-slate-900/50 rounded-xl opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity text-white">
                                    <Camera className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>{empName}</span>
                                  </div>
                                  <div className="text-[11px] font-mono text-indigo-600 mt-0.5">{emp.empCode} • Joined {joinDate}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-medium text-slate-800">{emp.designation}</div>
                              <div className="text-[11px] text-slate-500">{emp.department}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div>{email}</div>
                              <div className="text-[11px] text-slate-500">{emp.phone}</div>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-[11px]">
                              <div>PAN: <span className="font-semibold">{emp.pan}</span></div>
                              <div className="text-slate-500">UAN: {emp.uan || 'Pending'}</div>
                            </td>
                            <td className="px-4 py-3.5 font-mono">
                              <div className="font-bold text-slate-900">₹{(ctc / 100000).toFixed(2)} L PA</div>
                              <div className="text-[11px] text-emerald-600 font-semibold">
                                ₹{grossMo.toLocaleString()} /mo
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-[11px]">
                              <span className="text-blue-600 font-semibold">CL: {cl}</span> •{' '}
                              <span className="text-amber-600 font-semibold">SL: {sl}</span> •{' '}
                              <span className="text-emerald-600 font-semibold">PL: {pl}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                status === 'Resigned' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setAvatarModalEmployee(emp);
                                    setIsAvatarModalOpen(true);
                                  }}
                                  title="Add/Update Latest Profile Picture"
                                  className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold rounded-lg text-[11px] transition-colors flex items-center gap-1 border border-transparent hover:border-indigo-200"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline">Photo</span>
                                </button>
                                <button
                                  onClick={() => handleOpenEmployeeModal(emp)}
                                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors"
                                >
                                  Edit Profile
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. RECRUITMENT & ONBOARDING */}
      {activeTab === 'recruitment' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setRecruitmentSubTab('jds')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                recruitmentSubTab === 'jds'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              KRA-based JDs & Postings ({jobRequisitions.length})
            </button>
            <button
              onClick={() => setRecruitmentSubTab('candidates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                recruitmentSubTab === 'candidates'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Candidate Pipeline ({candidates.length})
            </button>
            <button
              onClick={() => setRecruitmentSubTab('onboarding')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                recruitmentSubTab === 'onboarding'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Onboarding Checklist & Tasks
            </button>
          </div>

          {recruitmentSubTab === 'onboarding' ? (
            <OnboardingWorkflowView candidates={candidates} employees={employees} onRefresh={onRefresh} />
          ) : recruitmentSubTab === 'candidates' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search candidate by name, company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Total {candidates.length} candidate applications in pipeline
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Candidate Name</th>
                        <th className="px-4 py-3">Target Role</th>
                        <th className="px-4 py-3">Current Company & Exp</th>
                        <th className="px-4 py-3">Current / Expected CTC</th>
                        <th className="px-4 py-3">Notice Period</th>
                        <th className="px-4 py-3">Rating</th>
                        <th className="px-4 py-3">Hiring Stage</th>
                        <th className="px-4 py-3 text-right">Advance Stage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {candidates.map((c) => {
                        const req = jobRequisitions.find((r) => r.id === c.requisitionId);
                        const cExp = c.experienceYears ?? (c as any).experience ?? 3;
                        const cCurrCTC = c.currentCTC ?? (c as any).currentCtc ?? 600000;
                        const cExpCTC = c.expectedCTC ?? (c as any).expectedCtc ?? 850000;
                        const cNotice = c.noticePeriodDays ?? (c as any).noticePeriod ?? 30;
                        const cRating = c.rating ?? 4;

                        return (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-900">{c.name}</div>
                              <div className="text-[11px] text-slate-500">{c.phone} • {c.email}</div>
                            </td>
                            <td className="px-4 py-3.5 font-medium text-slate-800">
                              {req?.jobTitle || 'HVAC Engineer'}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-medium">{c.currentCompany || 'MEP Contracting'}</div>
                              <div className="text-[11px] text-slate-500">{cExp} Years Total Exp</div>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-[11px]">
                              <div>Curr: ₹{(cCurrCTC / 100000).toFixed(1)} L</div>
                              <div className="text-emerald-600 font-semibold">Exp: ₹{(cExpCTC / 100000).toFixed(1)} L</div>
                            </td>
                            <td className="px-4 py-3.5 font-mono font-medium">{cNotice} Days</td>
                            <td className="px-4 py-3.5 font-bold text-amber-600 font-mono">★ {cRating}.0 / 5.0</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                c.stage === 'Hired' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                c.stage === 'Offer Letter' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                c.stage === 'Technical Round' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {c.stage}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <select
                                value={c.stage}
                                onChange={(e) => {
                                  storageService.updateCandidateStage(c.id, e.target.value as any);
                                  onRefresh();
                                }}
                                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none"
                              >
                                <option value="Applied">Applied</option>
                                <option value="Screening">Screening</option>
                                <option value="Technical Round">Technical Round</option>
                                <option value="Management Round">Management Round</option>
                                <option value="Offer Letter">Offer Letter</option>
                                <option value="Hired">Hired</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick Prebuilt Templates Bar */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                      Prebuilt HVAC Industry Role Templates (With Weighted KRAs & KPIs)
                    </span>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-medium">Click template to launch posting</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PREBUILT_HVAC_JDS.map((tpl, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        handleLoadTemplate(idx);
                        setReqModalOpen(true);
                      }}
                      className="bg-white border border-indigo-200/80 hover:border-indigo-500 rounded-xl p-3 cursor-pointer shadow-2xs hover:shadow-xs transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {tpl.department}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{tpl.experienceRequired}</span>
                      </div>
                      <div className="font-bold text-xs text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
                        {tpl.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {tpl.summary}
                      </div>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-600">
                        <span className="font-semibold">{tpl.kras.length} KRAs</span> • <span>{tpl.salaryRange}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Job Requisitions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Active Job Openings & Position Matrix</h3>
                  <button
                    onClick={() => {
                      setReqForm({
                        jobTitle: '',
                        department: 'Projects & Contracting',
                        positionsCount: 2,
                        experienceRequired: '3-6 Years',
                        location: 'Mumbai & Site Locations',
                        salaryRange: '₹6,00,000 - ₹9,00,000 PA',
                        jobSummary: '',
                        responsibilities: [],
                        technicalRequirements: [],
                        kras: [],
                        status: 'Active'
                      });
                      setSelectedTemplateIndex(null);
                      setReqModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Custom Requisition</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobRequisitions.map((req) => {
                    const krasList: KRAItem[] = req.kras || ((req as any).kraList ? (req as any).kraList.map((k: any) => ({
                      metric: k.title || k.metric || 'Performance Metric',
                      target: k.kpiMetric || k.target || k.description || 'Target SLA',
                      weightage: k.weightagePct ?? k.weightage ?? 25
                    })) : []);
                    const openCount = req.positionsCount ?? (req as any).openPositions ?? 1;
                    const expReq = req.experienceRequired || (req as any).experienceReq || '3-6 Years';
                    const summary = req.jobSummary || (req as any).responsibilities?.[0] || 'HVAC Turnkey Contracting and Engineering Execution';

                    return (
                      <div
                        key={req.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold">
                                {req.department}
                              </span>
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold">
                                {openCount} Positions Open
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 text-base mt-1.5">{req.jobTitle}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {req.location} • Exp: {expReq} • CTC: {req.salaryRange}
                            </p>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'Active' || (req.status as string) === 'Active / Hiring' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {req.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                          {summary}
                        </p>

                        {/* KRA List Section */}
                        <div>
                          <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Key Result Areas (KRAs) & Evaluation Weightages:</span>
                          </div>
                          <div className="space-y-1.5">
                            {krasList.map((kra, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs bg-slate-50/80 px-3 py-1.5 rounded-lg border border-slate-100">
                                <span className="text-slate-700 font-medium">{kra.metric || kra.title} ({kra.target || kra.kpiMetric || kra.description || 'Target'})</span>
                                <span className="font-mono font-bold text-indigo-600 text-[11px]">{kra.weightage ?? kra.weightagePct ?? 25}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                          <button
                            onClick={() => setSelectedJdPreview({ ...req, kras: krasList, positionsCount: openCount, experienceRequired: expReq, jobSummary: summary, responsibilities: req.responsibilities || [], technicalRequirements: req.technicalRequirements || (req as any).requirements || [] })}
                            className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                          >
                            <span>View Full JD & Responsibilities</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setCandidateForm({ ...candidateForm, requisitionId: req.id });
                              setCandidateModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors"
                          >
                            + Add Applicant
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. ATTENDANCE & SHIFT */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setAttendanceSubTab('biometrics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                attendanceSubTab === 'biometrics'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Daily Biometric Logs ({attendance.length})
            </button>
            <button
              onClick={() => setAttendanceSubTab('timesheets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                attendanceSubTab === 'timesheets'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Project Timesheets ({timesheets.length})
            </button>
            <button
              onClick={() => setAttendanceSubTab('regularization')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                attendanceSubTab === 'regularization'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Missed Punch Regularization
            </button>
          </div>

          {attendanceSubTab === 'regularization' ? (
            <AttendanceRegularizationView employees={employees} onRefresh={onRefresh} />
          ) : attendanceSubTab === 'timesheets' ? (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm">Weekly Project Execution Timesheets</h3>
                <p className="text-xs text-slate-500 mt-0.5">Project manager verification and cost-allocation tracking</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Employee Name</th>
                        <th className="px-4 py-3">Week Ending Date</th>
                        <th className="px-4 py-3">Assigned HVAC Project</th>
                        <th className="px-4 py-3 text-right">Mon - Fri Hours</th>
                        <th className="px-4 py-3 text-right">Total Hours</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">PM Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {timesheets.map((ts) => {
                        const tsName = ts.employeeName || (ts as any).empName || 'Employee';
                        const wDate = ts.weekEndingDate || (ts as any).weekEndDate || (ts as any).weekStartDate || '2026-08-29';
                        const mH = ts.mondayHours ?? (ts as any).monHours ?? 8;
                        const tuH = ts.tuesdayHours ?? (ts as any).tueHours ?? 8;
                        const wH = ts.wednesdayHours ?? (ts as any).wedHours ?? 8;
                        const thH = ts.thursdayHours ?? (ts as any).thuHours ?? 8;
                        const fH = ts.fridayHours ?? (ts as any).friHours ?? 8;
                        const totH = ts.totalHours ?? (mH + tuH + wH + thH + fH);

                        return (
                          <tr key={ts.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-900">{tsName}</td>
                            <td className="px-4 py-3.5 font-mono">{wDate}</td>
                            <td className="px-4 py-3.5 font-medium text-slate-800">{ts.projectName}</td>
                            <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                              {mH}h | {tuH}h | {wH}h | {thH}h | {fH}h
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono font-bold text-blue-600 text-sm">
                              {totH} hrs
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                ts.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                ts.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {ts.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {ts.status === 'Submitted' && (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      storageService.approveTimesheet(ts.id, 'Project Director');
                                      onRefresh();
                                    }}
                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                    title="Approve Timesheet"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      storageService.rejectTimesheet(ts.id, 'Mismatch in site hours');
                                      onRefresh();
                                    }}
                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                    title="Reject Timesheet"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Biometric & Field Site Daily Attendance Logs</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time check-in timestamps and site project tracking</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setIsBiometricDeviceModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
                    title="Configure biometric attendance terminals & test connection"
                  >
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Configure Biometric Devices</span>
                  </button>
                  <span className="text-xs text-slate-500 font-medium">Selected Date:</span>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Employee Name</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Check-in / Check-out</th>
                        <th className="px-4 py-3">Assigned Site Location</th>
                        <th className="px-4 py-3">Remarks / Task Duty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {attendance.map((att) => {
                        const eName = att.employeeName || (att as any).empName || 'Employee';
                        const inT = att.inTime || (att as any).checkInTime || '09:00 AM';
                        const outT = att.outTime || (att as any).checkOutTime || '';
                        const site = att.siteAssigned || (att as any).siteProjectName || 'Corporate Office';

                        return (
                          <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-bold text-slate-900">{eName}</td>
                            <td className="px-4 py-3.5 font-mono text-slate-600">{att.date}</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                att.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                att.status === 'Site Visit' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                att.status === 'WFH' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                att.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {att.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-mono">
                              {inT ? `${inT} - ${outT || 'Active'}` : '—'}
                            </td>
                            <td className="px-4 py-3.5 text-slate-800 font-medium">{site}</td>
                            <td className="px-4 py-3.5 text-slate-500">{att.remarks || 'Standard Duty'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. LEAVE MANAGEMENT */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLeaveSubTab('applications')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  leaveSubTab === 'applications'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Leave Applications ({leaves.length})
              </button>
              <button
                onClick={() => setLeaveSubTab('holidays')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  leaveSubTab === 'holidays'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Holiday Calendar ({holidays.length})
              </button>
            </div>

            <button
              onClick={() => setLeaveModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Leave</span>
            </button>
          </div>

          {leaveSubTab === 'holidays' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Annual Holiday Calendar 2026</span>
                </h3>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {holidays.length} Holidays
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {holidays.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{h.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{h.date} {h.dayOfWeek ? `(${h.dayOfWeek})` : ''}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      h.type === 'Gazetted' || (h.type as string) === 'National Mandatory' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {h.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Date Range</th>
                      <th className="px-4 py-3">Days</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {leaves.map((lv) => {
                      const lName = lv.employeeName || (lv as any).empName || 'Employee';
                      return (
                        <tr key={lv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-slate-900">{lName}</td>
                          <td className="px-4 py-3.5 font-semibold text-blue-600">{lv.leaveType}</td>
                          <td className="px-4 py-3.5 font-mono text-[11px]">{lv.startDate} to {lv.endDate}</td>
                          <td className="px-4 py-3.5 font-mono font-bold">{lv.totalDays} Days</td>
                          <td className="px-4 py-3.5 text-slate-600 max-w-xs">{lv.reason}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              lv.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              lv.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {lv.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {lv.status === 'Pending' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    storageService.approveLeave(lv.id, 'Approved by HR Lead');
                                    onRefresh();
                                  }}
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  title="Approve Leave"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    storageService.rejectLeave(lv.id, 'Critical site commissioning phase');
                                    onRefresh();
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                                  title="Reject Leave"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. PAYROLL & STATUTORY ENGINE */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Automated Statutory Payroll Engine</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Computes Basic, HRA, Allowances, Employee EPF (12%), ESIC (0.75%), PT (₹200), and TDS deduction
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleRunPayroll('August', 2026)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Run Payroll for August 2026</span>
              </button>
            </div>
          </div>

          {/* Processed Payroll Runs */}
          {payrollMonths.map((pMonth) => {
            const mName = pMonth.month || pMonth.monthYear?.split(' ')[0] || 'August';
            const yNum = pMonth.year || Number(pMonth.monthYear?.split(' ')[1]) || 2026;
            const grossTot = pMonth.totalGrossSalary ?? (pMonth as any).totalGross ?? 0;
            const netTot = pMonth.totalNetPayable ?? (pMonth as any).totalNet ?? 0;
            const dedTot = pMonth.totalDeductions ?? (grossTot - netTot);
            const pDate = pMonth.processedDate || (pMonth as any).runDate || '2026-08-30';
            const slips = pMonth.slips || (pMonth as any).payslips || [];

            return (
              <div key={pMonth.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{mName} {yNum} Payroll Register</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {pMonth.status || 'Approved'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">Processed on {pDate}</div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 mr-2">Total Gross:</span>
                      <span className="font-bold text-slate-900">₹{grossTot.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 mr-2">Total Deductions:</span>
                      <span className="font-bold text-rose-600">₹{dedTot.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 mr-2">Net Disbursed:</span>
                      <span className="font-bold text-emerald-700 text-sm">₹{netTot.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Employee Name</th>
                        <th className="px-4 py-3 text-right">Basic (₹)</th>
                        <th className="px-4 py-3 text-right">HRA + Allowances (₹)</th>
                        <th className="px-4 py-3 text-right">Gross Salary (₹)</th>
                        <th className="px-4 py-3 text-right">EPF (12%)</th>
                        <th className="px-4 py-3 text-right">PT / ESIC</th>
                        <th className="px-4 py-3 text-right">TDS (₹)</th>
                        <th className="px-4 py-3 text-right">Net Payable (₹)</th>
                        <th className="px-4 py-3 text-right">Payslip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {slips.map((slip: any) => {
                        const empId = slip.employeeId || slip.empId;
                        const emp = employees.find((e) => e.id === empId);
                        const empName = slip.employeeName || slip.empName || emp?.fullName || emp?.name || 'Employee';
                        const desig = slip.designation || emp?.designation || 'Staff';
                        const basicEarned = slip.basicEarned ?? slip.earnings?.basicSalary ?? slip.basicSalary ?? 0;
                        const hraEarned = slip.hraEarned ?? slip.earnings?.hra ?? slip.hra ?? 0;
                        const spEarned = slip.specialAllowanceEarned ?? slip.earnings?.specialAllowance ?? slip.specialAllowance ?? 0;
                        const siteEarned = slip.siteAllowanceEarned ?? slip.earnings?.siteAllowance ?? slip.siteAllowance ?? 0;
                        const allowancesTot = hraEarned + spEarned + siteEarned;
                        const grossEarned = slip.grossEarned ?? slip.grossSalary ?? slip.totalEarnings ?? (basicEarned + allowancesTot);
                        const epf = slip.epfDeduction ?? slip.deductions?.providentFund ?? slip.pfEe ?? 0;
                        const pt = slip.ptDeduction ?? slip.deductions?.professionalTax ?? slip.pt ?? 0;
                        const esic = slip.esicDeduction ?? slip.deductions?.esic ?? slip.esic ?? 0;
                        const tds = slip.tdsDeduction ?? slip.deductions?.tdsTax ?? slip.tds ?? 0;
                        const netPay = slip.netPayable ?? slip.netSalary ?? (grossEarned - (epf + pt + esic + tds));

                        const safeSlip = {
                          ...slip,
                          employeeName: empName,
                          designation: desig,
                          basicEarned,
                          hraEarned,
                          specialAllowanceEarned: spEarned,
                          siteAllowanceEarned: siteEarned,
                          grossEarned,
                          epfDeduction: epf,
                          ptDeduction: pt,
                          esicDeduction: esic,
                          tdsDeduction: tds,
                          lossOfPayDeduction: slip.lossOfPayDeduction ?? slip.deductions?.lossOfPay ?? 0,
                          totalDeductions: slip.totalDeductions ?? slip.totalDeduction ?? (epf + pt + esic + tds),
                          netPayable: netPay,
                          daysPresent: slip.daysPresent ?? slip.paidDays ?? 26,
                          totalDaysInMonth: slip.totalDaysInMonth ?? 30
                        };

                        return (
                          <tr key={empId || Math.random()} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-900">{empName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{desig}</div>
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono font-medium">₹{basicEarned.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-right font-mono text-slate-600">
                              ₹{allowancesTot.toLocaleString()}
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                              ₹{grossEarned.toLocaleString()}
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono text-rose-600">₹{epf.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-right font-mono text-rose-600">₹{(pt + esic).toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-right font-mono text-rose-600 font-semibold">₹{tds.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                              ₹{netPay.toLocaleString()}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {emp && (
                                <button
                                  onClick={() => setSelectedPayslip({ month: mName, year: yNum, slip: safeSlip, employee: emp })}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  title="Print / Download Salary Slip"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 7. ESS / MSS PORTAL */}
      {activeTab === 'ess_mss' && (
        <SelfServicePortalView
          employees={employees}
          leaves={leaves}
          attendance={attendance}
          payrollMonths={payrollMonths}
          onRefresh={onRefresh}
          onViewPayslip={(month, year, slip, emp) => setSelectedPayslip({ month, year, slip, employee: emp })}
          onNavigateAlphaHR={(subTab) => {
            setActiveTab(subTab as TabType);
            setSearchTerm('');
          }}
        />
      )}

      {/* 8. PERFORMANCE MANAGEMENT (PMS) */}
      {activeTab === 'performance' && (
        <PerformanceManagementView
          employees={employees}
          onRefresh={onRefresh}
        />
      )}

      {/* 9. TRAINING & TALENT MANAGEMENT */}
      {activeTab === 'training' && (
        <TrainingTalentView
          employees={employees}
          onRefresh={onRefresh}
        />
      )}

      {/* 10. TRAVEL, EXPENSE & BENEFITS */}
      {activeTab === 'travel_expenses' && (
        <TravelExpensesView
          employees={employees}
          onRefresh={onRefresh}
        />
      )}

      {/* 11. GRIEVANCE REDRESSAL & EMPLOYEE RELATIONS */}
      {activeTab === 'grievances' && (
        <GrievanceManagementView
          employees={employees}
          onRefresh={onRefresh}
        />
      )}

      {/* 12. HR ANALYTICS & WORKFORCE PLANNING */}
      {activeTab === 'analytics' && (
        <WorkforcePlanningView
          employees={employees}
          jobRequisitions={jobRequisitions}
          onRefresh={onRefresh}
        />
      )}

      {/* 8. RESIGNATION & F&F SETTLEMENT */}
      {activeTab === 'resignations' && (
        <ExitResignationView
          resignations={resignations}
          employees={employees}
          onRefresh={onRefresh}
          onRequestNewExit={() => setResignationModalOpen(true)}
        />
      )}

      {/* ========================================== */}
      {/* MODALS */}
      {/* ========================================== */}

      {/* 1. KRA Job Requisition Creator Modal */}
      {reqModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Post KRA-Based HVAC Job Requisition</h3>
              </div>
              <button onClick={() => setReqModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRequisition} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={reqForm.jobTitle}
                    onChange={(e) => setReqForm({ ...reqForm, jobTitle: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={reqForm.department}
                    onChange={(e) => setReqForm({ ...reqForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Projects & Contracting">Projects & Contracting</option>
                    <option value="HVAC Engineering & Design">HVAC Engineering & Design</option>
                    <option value="Commercial HVAC Sales">Commercial HVAC Sales</option>
                    <option value="Testing & Commissioning">Testing & Commissioning</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience Required</label>
                  <input
                    type="text"
                    value={reqForm.experienceRequired}
                    onChange={(e) => setReqForm({ ...reqForm, experienceRequired: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salary Budget Range</label>
                  <input
                    type="text"
                    value={reqForm.salaryRange}
                    onChange={(e) => setReqForm({ ...reqForm, salaryRange: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Job Summary & Role Purpose</label>
                  <textarea
                    rows={2}
                    value={reqForm.jobSummary}
                    onChange={(e) => setReqForm({ ...reqForm, jobSummary: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* KRA Preview Table */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Preloaded Weighted KRAs for Performance Evaluation</span>
                  <span className="text-indigo-600 font-mono">Total 100% Weightage</span>
                </div>
                <div className="space-y-1.5">
                  {reqForm.kras.map((k, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-semibold text-slate-800">{k.metric}</span>
                        <span className="text-slate-500 text-[11px] ml-2">Target: {k.target}</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-600">{k.weightage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReqModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-xs"
                >
                  Publish KRA Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Candidate Creation Modal */}
      {candidateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Candidate to Pipeline</h3>
              <button onClick={() => setCandidateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCandidate} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Requisition *</label>
                <select
                  value={candidateForm.requisitionId}
                  onChange={(e) => setCandidateForm({ ...candidateForm, requisitionId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                >
                  {jobRequisitions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.jobTitle} ({r.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  placeholder="e.g. Rajesh Nair"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={candidateForm.phone}
                    onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Employer</label>
                  <input
                    type="text"
                    value={candidateForm.currentCompany}
                    onChange={(e) => setCandidateForm({ ...candidateForm, currentCompany: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Experience (Years)</label>
                  <input
                    type="number"
                    value={candidateForm.experienceYears}
                    onChange={(e) => setCandidateForm({ ...candidateForm, experienceYears: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current CTC (₹)</label>
                  <input
                    type="number"
                    value={candidateForm.currentCTC}
                    onChange={(e) => setCandidateForm({ ...candidateForm, currentCTC: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected CTC (₹)</label>
                  <input
                    type="number"
                    value={candidateForm.expectedCTC}
                    onChange={(e) => setCandidateForm({ ...candidateForm, expectedCTC: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCandidateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Employee Profile Onboarding Modal */}
      {employeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl my-8 text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingEmployee ? 'Edit Employee Profile' : 'Onboard New Employee'}
                </h3>
              </div>
              <button onClick={() => setEmployeeModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 mt-4">
              {/* Profile Picture Upload Section */}
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0">
                    {empForm.avatar ? (
                      <img
                        src={empForm.avatar}
                        alt={empForm.fullName || 'Employee'}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center border-2 border-indigo-400 shadow-sm">
                        {(empForm.fullName || 'EM').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Employee Profile Picture</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Upload latest high-resolution photo or select from curated role presets
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Create temporary employee object for modal
                      setAvatarModalEmployee({
                        ...(editingEmployee || {
                          id: `temp-${Date.now()}`,
                          empCode: empForm.empCode || 'EMP-NEW',
                          fullName: empForm.fullName || 'New Employee',
                          designation: empForm.designation,
                          department: empForm.department,
                          officialEmail: empForm.officialEmail,
                          phone: empForm.phone,
                          joiningDate: empForm.joiningDate,
                          pan: empForm.pan,
                          aadhaar: empForm.aadhaar,
                          uan: empForm.uan,
                          pfNumber: empForm.pfNumber,
                          bankAccountNo: empForm.bankAccountNo,
                          bankIfsc: empForm.bankIfsc,
                          annualCTC: empForm.annualCTC,
                          status: empForm.status,
                          casualLeaveBalance: empForm.casualLeaveBalance,
                          sickLeaveBalance: empForm.sickLeaveBalance,
                          privilegeLeaveBalance: empForm.privilegeLeaveBalance,
                          monthlySalaryStructure: {
                            basicSalary: 0,
                            hra: 0,
                            conveyanceAllowance: 0,
                            specialAllowance: 0,
                            siteAllowance: 0,
                            grossMonthlySalary: 0
                          }
                        }),
                        avatar: empForm.avatar
                      });
                      setIsAvatarModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold shadow-2xs transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{empForm.avatar ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>
                  {empForm.avatar && (
                    <button
                      type="button"
                      onClick={() => setEmpForm({ ...empForm, avatar: '' })}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
                      title="Remove Photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={empForm.fullName}
                    onChange={(e) => setEmpForm({ ...empForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={empForm.empCode}
                    onChange={(e) => setEmpForm({ ...empForm, empCode: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={empForm.designation}
                    onChange={(e) => setEmpForm({ ...empForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={empForm.department}
                    onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Projects & Contracting">Projects & Contracting</option>
                    <option value="HVAC Engineering & Design">HVAC Engineering & Design</option>
                    <option value="Commercial HVAC Sales">Commercial HVAC Sales</option>
                    <option value="Testing & Commissioning">Testing & Commissioning</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={empForm.officialEmail}
                    onChange={(e) => setEmpForm({ ...empForm, officialEmail: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Annual CTC (₹)</label>
                  <input
                    type="number"
                    value={empForm.annualCTC}
                    onChange={(e) => setEmpForm({ ...empForm, annualCTC: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Income Tax PAN</label>
                  <input
                    type="text"
                    value={empForm.pan}
                    onChange={(e) => setEmpForm({ ...empForm, pan: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">EPF UAN Number</label>
                  <input
                    type="text"
                    value={empForm.uan}
                    onChange={(e) => setEmpForm({ ...empForm, uan: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    value={empForm.bankAccountNo}
                    onChange={(e) => setEmpForm({ ...empForm, bankAccountNo: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEmployeeModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  {editingEmployee ? 'Save Profile' : 'Onboard Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Payslip Print & PDF Modal */}
      {selectedPayslip && (
        <PayslipModal
          month={selectedPayslip.month}
          year={selectedPayslip.year}
          slip={selectedPayslip.slip}
          employee={selectedPayslip.employee}
          onClose={() => setSelectedPayslip(null)}
        />
      )}

      {/* 5. View Full JD Modal */}
      {selectedJdPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl my-8 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedJdPreview.jobTitle}</h3>
                <span className="text-slate-500">{selectedJdPreview.department} • {selectedJdPreview.location}</span>
              </div>
              <button onClick={() => setSelectedJdPreview(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="font-bold text-slate-900 mb-1">Job Purpose:</div>
                <div className="text-slate-600 bg-slate-50 p-2.5 rounded-xl leading-relaxed">{selectedJdPreview.jobSummary}</div>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-1">Key Responsibilities:</div>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {selectedJdPreview.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-1">Technical Skills & Requirements:</div>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {selectedJdPreview.technicalRequirements.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-1">Key Result Areas (KRAs):</div>
                <div className="space-y-1">
                  {selectedJdPreview.kras.map((k, i) => (
                    <div key={i} className="flex justify-between bg-slate-50 px-3 py-1.5 rounded-lg">
                      <span className="text-slate-700">{k.metric} (Target: {k.target})</span>
                      <span className="font-mono font-bold text-indigo-600">{k.weightage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedJdPreview(null)}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture / Avatar Upload Modal */}
      {avatarModalEmployee && (
        <EmployeeAvatarUploadModal
          employee={avatarModalEmployee}
          isOpen={isAvatarModalOpen}
          onClose={() => {
            setIsAvatarModalOpen(false);
            setAvatarModalEmployee(null);
          }}
          onAvatarUpdated={(newAvatar) => {
            // If the employee modal is open, also sync form state
            if (employeeModalOpen) {
              setEmpForm((prev) => ({ ...prev, avatar: newAvatar }));
            }
            onRefresh();
          }}
        />
      )}

      {/* Biometric Attendance Device Terminal Configuration Modal */}
      <BiometricDeviceManagerModal
        isOpen={isBiometricDeviceModalOpen}
        onClose={() => setIsBiometricDeviceModalOpen(false)}
        onDataChanged={onRefresh}
      />

      {/* Employee Resignation / Exit Registration Modal */}
      <RegisterResignationModal
        isOpen={resignationModalOpen}
        onClose={() => setResignationModalOpen(false)}
        employees={employees}
        onSuccess={onRefresh}
      />
    </div>
  );
};
