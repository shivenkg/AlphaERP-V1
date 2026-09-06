import React, { useState } from 'react';
import {
  Building2,
  Award,
  Clock,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  CheckCircle2,
  Download,
  Users,
  Briefcase
} from 'lucide-react';
import {
  DepartmentMaster,
  DesignationGrade,
  ShiftMaster,
  CompanyPolicyDocument
} from '../../types';
import { storageService } from '../../services/storageService';

interface OrgMasterViewProps {
  onRefresh: () => void;
}

export const OrgMasterView: React.FC<OrgMasterViewProps> = ({ onRefresh }) => {
  const [subTab, setSubTab] = useState<'departments' | 'designations' | 'shifts' | 'policies'>('departments');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({
    code: '',
    name: '',
    headOfDepartment: '',
    totalPositions: 8,
    costCenterCode: 'CC-OPS-MUM',
    description: ''
  });

  const [desigModalOpen, setDesigModalOpen] = useState(false);
  const [desigForm, setDesigForm] = useState({
    gradeCode: 'L4',
    title: '',
    band: 'Junior Engineering',
    minSalaryAnnual: 600000,
    maxSalaryAnnual: 900000,
    noticePeriodDays: 30,
    probationMonths: 6
  });

  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    name: '',
    code: '',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    graceMinutes: 15,
    halfDayHours: 4.5,
    fullDayHours: 8.5,
    isNightShift: false,
    applicableDepartments: ['Projects & Field Operations']
  });

  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    title: '',
    category: 'Safety & Site Protocols',
    version: 'v1.0 (2026)',
    effectiveDate: new Date().toISOString().split('T')[0],
    summary: '',
    fileSize: '1.5 MB PDF',
    isMandatoryAcknowledgment: true
  });

  const departments = storageService.getDepartments();
  const designations = storageService.getDesignationGrades();
  const shifts = storageService.getShifts();
  const policies = storageService.getPolicyDocuments();

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;
    storageService.addDepartment({
      code: deptForm.code,
      name: deptForm.name,
      headOfDepartment: deptForm.headOfDepartment || 'TBD',
      totalPositions: Number(deptForm.totalPositions),
      activeEmployees: 0,
      costCenterCode: deptForm.costCenterCode,
      description: deptForm.description
    });
    setDeptModalOpen(false);
    setDeptForm({ code: '', name: '', headOfDepartment: '', totalPositions: 8, costCenterCode: 'CC-OPS-MUM', description: '' });
    onRefresh();
  };

  const handleCreateDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigForm.title) return;
    storageService.addDesignationGrade({
      gradeCode: desigForm.gradeCode,
      title: desigForm.title,
      band: desigForm.band,
      minSalaryAnnual: Number(desigForm.minSalaryAnnual),
      maxSalaryAnnual: Number(desigForm.maxSalaryAnnual),
      noticePeriodDays: Number(desigForm.noticePeriodDays),
      probationMonths: Number(desigForm.probationMonths)
    });
    setDesigModalOpen(false);
    setDesigForm({ gradeCode: 'L4', title: '', band: 'Junior Engineering', minSalaryAnnual: 600000, maxSalaryAnnual: 900000, noticePeriodDays: 30, probationMonths: 6 });
    onRefresh();
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftForm.name || !shiftForm.code) return;
    storageService.addShift({
      name: shiftForm.name,
      code: shiftForm.code,
      startTime: shiftForm.startTime,
      endTime: shiftForm.endTime,
      graceMinutes: Number(shiftForm.graceMinutes),
      halfDayHours: Number(shiftForm.halfDayHours),
      fullDayHours: Number(shiftForm.fullDayHours),
      isNightShift: shiftForm.isNightShift,
      applicableDepartments: shiftForm.applicableDepartments
    });
    setShiftModalOpen(false);
    setShiftForm({ name: '', code: '', startTime: '09:00 AM', endTime: '06:00 PM', graceMinutes: 15, halfDayHours: 4.5, fullDayHours: 8.5, isNightShift: false, applicableDepartments: ['Projects & Field Operations'] });
    onRefresh();
  };

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyForm.title) return;
    storageService.addPolicyDocument({
      title: policyForm.title,
      category: policyForm.category,
      version: policyForm.version,
      effectiveDate: policyForm.effectiveDate,
      summary: policyForm.summary,
      fileSize: policyForm.fileSize,
      isMandatoryAcknowledgment: policyForm.isMandatoryAcknowledgment
    });
    setPolicyModalOpen(false);
    setPolicyForm({ title: '', category: 'Safety & Site Protocols', version: 'v1.0 (2026)', effectiveDate: new Date().toISOString().split('T')[0], summary: '', fileSize: '1.5 MB PDF', isMandatoryAcknowledgment: true });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tabs Nav */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSubTab('departments')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'departments'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Departments ({departments.length})</span>
          </button>

          <button
            onClick={() => setSubTab('designations')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'designations'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Grades & Designations ({designations.length})</span>
          </button>

          <button
            onClick={() => setSubTab('shifts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'shifts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Shifts & Timings ({shifts.length})</span>
          </button>

          <button
            onClick={() => setSubTab('policies')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'policies'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Statutory & Safety Policies ({policies.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {subTab === 'departments' && (
            <button
              onClick={() => setDeptModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )}

          {subTab === 'designations' && (
            <button
              onClick={() => setDesigModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Add Designation Grade</span>
            </button>
          )}

          {subTab === 'shifts' && (
            <button
              onClick={() => setShiftModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Define Shift</span>
            </button>
          )}

          {subTab === 'policies' && (
            <button
              onClick={() => setPolicyModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Policy</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. DEPARTMENTS VIEW */}
      {subTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-mono font-bold">
                    {dept.code}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {dept.costCenterCode}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2.5">{dept.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{dept.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Head of Dept</span>
                  <span className="text-slate-800 font-medium">{dept.headOfDepartment}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Staffing</span>
                  <span className="text-indigo-600 font-bold font-mono">
                    {dept.activeEmployees} / {dept.totalPositions} Seats
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. DESIGNATIONS & GRADE MATRIX */}
      {subTab === 'designations' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                HVAC Engineering & Corporate Designation Salary Bands
              </h4>
              <p className="text-[11px] text-slate-500">Standardized compensation bands, probation, and notice period matrix</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold font-mono">
              {designations.length} Active Bands
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Designation Title</th>
                  <th className="py-3 px-4">Band Category</th>
                  <th className="py-3 px-4">Annual CTC Range (INR)</th>
                  <th className="py-3 px-4 text-center">Probation</th>
                  <th className="py-3 px-4 text-center">Notice Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {designations.map((desig) => (
                  <tr key={desig.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                      <span className="px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100">
                        {desig.gradeCode}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{desig.title}</td>
                    <td className="py-3 px-4 text-slate-600">{desig.band}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      ₹{(desig.minSalaryAnnual / 100000).toFixed(1)}L - ₹{(desig.maxSalaryAnnual / 100000).toFixed(1)}L PA
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">
                      {desig.probationMonths ? `${desig.probationMonths} Mos` : 'Direct Confirm'}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-800">
                      {desig.noticePeriodDays} Days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SHIFTS & ROSTERS */}
      {subTab === 'shifts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shifts.map((shift) => (
            <div key={shift.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                    {shift.code}
                  </span>
                  {shift.isNightShift ? (
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                      Night Shift (Commissioning)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Day Standard Shift
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2.5">{shift.name}</h4>
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Timing</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {shift.startTime} - {shift.endTime}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Grace</span>
                    <span className="text-xs font-bold text-amber-600 font-mono">
                      +{shift.graceMinutes} mins
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Applicable For:</span>
                  <div className="flex flex-wrap gap-1">
                    {shift.applicableDepartments.map((deptName, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {deptName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between font-mono">
                <span>Full Day: {shift.fullDayHours}h</span>
                <span>Half Day: {shift.halfDayHours}h</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. POLICIES & STATUTORY HANDBOOKS */}
      {subTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((pol) => (
            <div key={pol.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                    {pol.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{pol.version}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2.5">{pol.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pol.summary}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[11px] text-slate-600">
                    {pol.isMandatoryAcknowledgment ? 'Mandatory Induction Signoff' : 'Reference Document'}
                  </span>
                </div>

                <button
                  onClick={() => alert(`Downloading policy PDF: ${pol.title} (${pol.fileSize})`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{pol.fileSize}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Department */}
      {deptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add New Company Department</h3>
            <form onSubmit={handleCreateDepartment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRJ-OPS"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Service & AMC Operations"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Head of Dept</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Patil"
                    value={deptForm.headOfDepartment}
                    onChange={(e) => setDeptForm({ ...deptForm, headOfDepartment: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cost Center Code</label>
                  <input
                    type="text"
                    value={deptForm.costCenterCode}
                    onChange={(e) => setDeptForm({ ...deptForm, costCenterCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description & Scope</label>
                <textarea
                  rows={2}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Designation */}
      {desigModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Designation & Salary Band</h3>
            <form onSubmit={handleCreateDesignation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grade Code</label>
                  <input
                    type="text"
                    required
                    value={desigForm.gradeCode}
                    onChange={(e) => setDesigForm({ ...desigForm, gradeCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Band Category</label>
                  <input
                    type="text"
                    required
                    value={desigForm.band}
                    onChange={(e) => setDesigForm({ ...desigForm, band: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead HVAC Commissioning Engineer"
                  value={desigForm.title}
                  onChange={(e) => setDesigForm({ ...desigForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Annual CTC (₹)</label>
                  <input
                    type="number"
                    value={desigForm.minSalaryAnnual}
                    onChange={(e) => setDesigForm({ ...desigForm, minSalaryAnnual: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Annual CTC (₹)</label>
                  <input
                    type="number"
                    value={desigForm.maxSalaryAnnual}
                    onChange={(e) => setDesigForm({ ...desigForm, maxSalaryAnnual: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notice Period (Days)</label>
                  <input
                    type="number"
                    value={desigForm.noticePeriodDays}
                    onChange={(e) => setDesigForm({ ...desigForm, noticePeriodDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Probation (Months)</label>
                  <input
                    type="number"
                    value={desigForm.probationMonths}
                    onChange={(e) => setDesigForm({ ...desigForm, probationMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setDesigModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
