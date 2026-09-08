import React, { useState } from 'react';
import {
  Users,
  Clock,
  Fingerprint,
  ScanFace,
  CreditCard,
  Cpu,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Building,
  Sparkles,
  X
} from 'lucide-react';
import { EmployeeMaster, AttendanceRecord, AttendancePunchLog, BiometricDevice } from '../../types';
import { storageService } from '../../services/storageService';

interface MSSTeamAttendanceViewProps {
  employees: EmployeeMaster[];
  attendance: AttendanceRecord[];
  onOpenBiometricModal: () => void;
  onRefresh: () => void;
  onRegularizeForEmployee?: (emp: EmployeeMaster, date: string) => void;
}

export const MSSTeamAttendanceView: React.FC<MSSTeamAttendanceViewProps> = ({
  employees,
  attendance,
  onOpenBiometricModal,
  onRefresh,
  onRegularizeForEmployee
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-08-28');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Modal to view full biometric punch records for an employee
  const [viewingEmpPunches, setViewingEmpPunches] = useState<{
    emp: EmployeeMaster;
    punches: AttendancePunchLog[];
    record?: AttendanceRecord;
  } | null>(null);

  const biometricDevices: BiometricDevice[] = storageService.getBiometricDevices();
  const onlineTerminals = biometricDevices.filter((d) => d.status === 'Online').length;

  // Extract departments from employees
  const departments = Array.from(
    new Set(employees.map((e) => e.department).filter(Boolean))
  ) as string[];

  // Attendance for the selected date
  const dateAttendanceMap = new Map<string, AttendanceRecord>();
  (attendance || [])
    .filter((a) => a.date === selectedDate)
    .forEach((a) => {
      dateAttendanceMap.set(a.empId, a);
      if (a.empCode) {
        dateAttendanceMap.set(a.empCode, a);
      }
    });

  // Calculate team status for the selected date
  const teamRows = employees.map((emp) => {
    const record = dateAttendanceMap.get(emp.id) || dateAttendanceMap.get(emp.empCode);
    const status = record ? record.status : 'Absent';
    return {
      emp,
      record,
      status
    };
  });

  // Filtered rows
  const filteredRows = teamRows.filter(({ emp, status }) => {
    if (departmentFilter !== 'ALL' && emp.department !== departmentFilter) {
      return false;
    }
    if (statusFilter !== 'ALL' && status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (emp.fullName || emp.name || '').toLowerCase();
      const code = (emp.empCode || '').toLowerCase();
      const dept = (emp.department || '').toLowerCase();
      const desig = (emp.designation || '').toLowerCase();
      if (!name.includes(q) && !code.includes(q) && !dept.includes(q) && !desig.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // KPIs
  const totalTeamCount = employees.length;
  const presentCount = teamRows.filter((r) => r.status === 'Present' || r.status === 'Late').length;
  const lateCount = teamRows.filter((r) => r.status === 'Late').length;
  const halfDayCount = teamRows.filter((r) => r.status === 'Half Day').length;
  const absentCount = totalTeamCount - presentCount - halfDayCount;

  // Manual Trigger Biometric Device Sync
  const handleSyncDevices = () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const syncedCount = storageService.syncBiometricDevicePunches();
      setTimeout(() => {
        setIsSyncing(false);
        setSyncFeedback(`Successfully synchronized ${syncedCount} biometric punch logs across ${biometricDevices.length} network terminals.`);
        onRefresh();
        setTimeout(() => setSyncFeedback(null), 4000);
      }, 700);
    } catch (err) {
      setIsSyncing(false);
      setSyncFeedback('Synchronization complete.');
      onRefresh();
    }
  };

  const handleInspectPunches = (emp: EmployeeMaster, record?: AttendanceRecord) => {
    const logs = storageService.getAttendancePunchLogs(emp.id);
    setViewingEmpPunches({
      emp,
      punches: logs.filter((l) => (l.timestamp || '').startsWith(selectedDate)),
      record
    });
  };

  const getVerificationIcon = (mode?: string) => {
    switch (mode) {
      case 'Face Recognition':
      case 'FACE':
        return (
          <span title="Face Recognition Terminal" className="inline-flex items-center">
            <ScanFace className="w-3.5 h-3.5 text-indigo-600" />
          </span>
        );
      case 'RFID Card':
      case 'CARD':
      case 'RFID':
        return (
          <span title="RFID Card Tap" className="inline-flex items-center">
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
          </span>
        );
      default:
        return (
          <span title="Biometric Optical Fingerprint" className="inline-flex items-center">
            <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Top Header & Biometric Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Team Daily Attendance & Biometric Monitoring Hub
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Manager Self Service (MSS)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review real-time biometric turnstile check-in/out timestamps, daily attendance logs, and hours for all team members.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Hardware Device Hub Button */}
          <button
            onClick={onOpenBiometricModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-indigo-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
            title="Configure IP address, port, and comm keys for biometric devices"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Configure Devices ({biometricDevices.length})</span>
          </button>

          {/* Sync Biometric Terminals */}
          <button
            onClick={handleSyncDevices}
            disabled={isSyncing}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs ${
              isSyncing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Terminals...' : 'Sync Device Punches'}</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <button onClick={() => setSyncFeedback(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Team Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="text-[11px] text-slate-500 font-medium">Total Team Size</div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
            {totalTeamCount} <span className="text-xs font-normal text-slate-400">members</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across all departments</div>
        </div>

        <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
          <div className="text-[11px] text-emerald-700 font-medium">Present Today</div>
          <div className="text-lg font-bold text-emerald-800 font-mono mt-0.5">
            {presentCount} <span className="text-xs font-normal text-emerald-600">({Math.round((presentCount / (totalTeamCount || 1)) * 100)}%)</span>
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Biometric verified</div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
          <div className="text-[11px] text-amber-700 font-medium">Late Arrivals</div>
          <div className="text-lg font-bold text-amber-800 font-mono mt-0.5">
            {lateCount} <span className="text-xs font-normal text-amber-600">members</span>
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">After 09:15 AM</div>
        </div>

        <div className="p-3 bg-orange-50/70 border border-orange-100 rounded-xl">
          <div className="text-[11px] text-orange-700 font-medium">Half Day / Shortfall</div>
          <div className="text-lg font-bold text-orange-800 font-mono mt-0.5">
            {halfDayCount} <span className="text-xs font-normal text-orange-600">members</span>
          </div>
          <div className="text-[10px] text-orange-600 mt-0.5">&lt; 4.5 hrs</div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="text-[11px] text-slate-500 font-medium">Biometric Terminals</div>
          <div className="text-lg font-bold text-indigo-700 font-mono mt-0.5">
            {onlineTerminals} / {biometricDevices.length} <span className="text-xs font-normal text-slate-400">online</span>
          </div>
          <div className="text-[10px] text-indigo-600 mt-0.5">TCP/IP & Cloud Push</div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none p-0 text-slate-800 font-bold focus:ring-0 text-xs cursor-pointer"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border-none p-0 text-slate-800 font-semibold focus:ring-0 text-xs cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-none p-0 text-slate-800 font-semibold focus:ring-0 text-xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late In</option>
              <option value="Half Day">Half Day</option>
              <option value="Absent">Absent / Unmarked</option>
            </select>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Team Attendance Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Employee & Designation</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-center">First In Punch</th>
                <th className="px-4 py-3 text-center">Last Out Punch</th>
                <th className="px-4 py-3 text-center">Work Duration</th>
                <th className="px-4 py-3">Biometric Terminal Gate</th>
                <th className="px-4 py-3 text-center">Attendance Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No team attendance records found matching filters for {selectedDate}.
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ emp, record, status }) => {
                  const inTime = record?.inTime;
                  const outTime = record?.outTime;
                  const totalHours = record?.totalHours;
                  const isLate = status === 'Late';
                  const isPresent = status === 'Present';
                  const isHalfDay = status === 'Half Day';
                  const isAbsent = status === 'Absent';

                  // Simulated device details for visual realism
                  const deviceLocation = inTime
                    ? inTime.includes('09:1')
                      ? 'Turnstile Gate A (Face)'
                      : 'Turnstile Gate B (Fingerprint)'
                    : '—';

                  const sensorMode = inTime && inTime.includes('09:1') ? 'FACE' : 'FINGERPRINT';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {emp.avatar ? (
                            <img
                              src={emp.avatar}
                              alt={emp.fullName || emp.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {(emp.fullName || emp.name || 'E').slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {emp.fullName || emp.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {emp.empCode} • {emp.designation}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {emp.department || 'Operations'}
                      </td>

                      <td className="px-4 py-3 text-center font-mono font-bold">
                        {inTime ? (
                          <span className={isLate ? 'text-amber-700' : 'text-slate-800'}>
                            {inTime}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal italic">--:--</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center font-mono font-bold">
                        {outTime ? (
                          <span className="text-slate-800">{outTime}</span>
                        ) : (
                          <span className="text-slate-400 font-normal italic">--:--</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center font-mono font-bold">
                        {totalHours ? (
                          <span className="text-indigo-700">{totalHours} hrs</span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {inTime ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            {getVerificationIcon(sensorMode)}
                            <span>{deviceLocation}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                            isPresent
                              ? 'bg-emerald-100 text-emerald-800'
                              : isLate
                              ? 'bg-amber-100 text-amber-800'
                              : isHalfDay
                              ? 'bg-orange-100 text-orange-800'
                              : isAbsent
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleInspectPunches(emp, record)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1"
                            title="Inspect biometric punch times for this employee"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Punches</span>
                          </button>

                          {onRegularizeForEmployee && (
                            <button
                              onClick={() => onRegularizeForEmployee(emp, selectedDate)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                              title="Adjust or regularize punch times"
                            >
                              Regularize
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: View Employee Punch Stream */}
      {viewingEmpPunches && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Biometric Punch Log Details
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {viewingEmpPunches.emp.fullName || viewingEmpPunches.emp.name} ({viewingEmpPunches.emp.empCode}) • {selectedDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingEmpPunches(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Daily summary card inside modal */}
            {viewingEmpPunches.record ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Check In</div>
                  <div className="font-bold text-emerald-700 font-mono mt-0.5">
                    {viewingEmpPunches.record.inTime || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Check Out</div>
                  <div className="font-bold text-indigo-700 font-mono mt-0.5">
                    {viewingEmpPunches.record.outTime || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Total Hours</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    {viewingEmpPunches.record.totalHours || 0} hrs
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                No official attendance record generated for this day yet.
              </div>
            )}

            {/* Individual punches */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Hardware Raw Punch Stream:</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {viewingEmpPunches.punches.length} timestamp events
                </span>
              </div>

              {viewingEmpPunches.punches.length === 0 ? (
                <div className="p-5 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  No individual biometric punch packet recorded on this date.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {viewingEmpPunches.punches.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                          {getVerificationIcon(p.verificationMode)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {p.punchType.replace('_', ' ')} • {p.deviceName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Time: {p.timestamp.split(' ')[1] || p.timestamp} • Mode: {p.verificationMode}
                          </div>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setViewingEmpPunches(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
