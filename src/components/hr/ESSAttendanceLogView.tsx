import React, { useState } from 'react';
import {
  Clock,
  Fingerprint,
  ScanFace,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ChevronRight,
  Filter,
  ShieldCheck,
  Cpu,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { EmployeeMaster, AttendanceRecord, AttendancePunchLog } from '../../types';
import { storageService } from '../../services/storageService';

interface ESSAttendanceLogViewProps {
  employee: EmployeeMaster;
  attendance: AttendanceRecord[];
  onOpenRegularization: (prefilledDate?: string) => void;
  onOpenBiometricModal: () => void;
}

export const ESSAttendanceLogView: React.FC<ESSAttendanceLogViewProps> = ({
  employee,
  attendance,
  onOpenRegularization,
  onOpenBiometricModal
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [showPunchStream, setShowPunchStream] = useState(false);

  // Filter attendance for current employee
  const myRecords = (attendance || []).filter(
    (a) =>
      (a.empId === employee.id || a.empCode === employee.empCode) &&
      (a.date || '').startsWith(selectedMonth)
  ).sort((a, b) => b.date.localeCompare(a.date));

  // Get raw biometric punch logs for this employee
  const rawPunches: AttendancePunchLog[] = storageService.getAttendancePunchLogs(employee.id) || [];
  const myRecentPunches = rawPunches
    .filter((p) => (p.timestamp || '').startsWith(selectedMonth))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Biometric Devices registered
  const biometricDevices = storageService.getBiometricDevices();

  // Metrics for the selected month
  const totalDaysLogged = myRecords.length;
  const presentDays = myRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
  const lateDays = myRecords.filter((r) => r.status === 'Late').length;
  const halfDays = myRecords.filter((r) => r.status === 'Half Day').length;
  const absentDays = myRecords.filter((r) => r.status === 'Absent').length;
  const totalHoursWorked = myRecords.reduce((sum, r) => sum + (Number(r.totalHours) || 0), 0);
  const avgDailyHours = presentDays > 0 ? (totalHoursWorked / presentDays).toFixed(1) : '0';

  // Find latest today or recent record
  const latestRecord = myRecords[0] || {
    id: 'latest-att',
    date: '2026-08-28',
    empId: employee.id,
    empCode: employee.empCode,
    empName: employee.fullName || employee.name,
    inTime: '09:12',
    outTime: '18:45',
    totalHours: 9.55,
    status: 'Present' as const,
    remarks: 'Turnstile A biometric check'
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
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                My Daily Attendance Log & Biometric Punches
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                Confidential ESS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review personal daily in/out time logs, biometric verification stamps, and shift compliance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-bold focus:ring-0 text-xs cursor-pointer"
            >
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
            </select>
          </div>

          <button
            onClick={() => onOpenRegularization()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Regularize Punch</span>
          </button>
        </div>
      </div>

      {/* Today's Live Biometric Snapshot Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-4 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-300">
                Latest Terminal Synchronization • {latestRecord.date}
              </span>
            </div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>Status:</span>
              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                latestRecord.status === 'Present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                latestRecord.status === 'Late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-slate-700 text-slate-300'
              }`}>
                {latestRecord.status}
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              Assigned Shift: <strong className="text-white">General HQ Shift (09:00 - 18:00)</strong> • Grace Period: 15 mins
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">First Check-In</div>
              <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>{latestRecord.inTime || '09:12 AM'}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                Main Turnstile A
              </div>
            </div>

            <div className="border-l border-white/10 pl-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Last Check-Out</div>
              <div className="text-sm font-bold text-indigo-300 font-mono flex items-center gap-1 mt-0.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-300" />
                <span>{latestRecord.outTime || '18:35 PM'}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                Face Recognition
              </div>
            </div>

            <div className="border-l border-white/10 pl-3">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Total Work Hours</div>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {latestRecord.totalHours ? `${latestRecord.totalHours} hrs` : '9.2 hrs'}
              </div>
              <div className="text-[10px] text-emerald-400">
                +25m Overtime
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Attendance KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="text-[11px] text-slate-500 font-medium">Days Present</div>
          <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
            {presentDays} <span className="text-xs font-normal text-slate-400">/ {totalDaysLogged || 22}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Avg {avgDailyHours} hrs / day</div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="text-[11px] text-slate-500 font-medium">Late In Check-Ins</div>
          <div className="text-lg font-bold text-amber-700 font-mono mt-0.5">
            {lateDays} <span className="text-xs font-normal text-slate-400">occurrences</span>
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">Past 09:15 AM threshold</div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="text-[11px] text-slate-500 font-medium">Half Days / Shortfall</div>
          <div className="text-lg font-bold text-indigo-700 font-mono mt-0.5">
            {halfDays} <span className="text-xs font-normal text-slate-400">recorded</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">&lt; 4.5 hrs credited</div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="text-[11px] text-slate-500 font-medium">Total Work Hours</div>
          <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
            {totalHoursWorked.toFixed(1)} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">100% compliant</div>
        </div>
      </div>

      {/* Daily Attendance Log Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Daily Attendance Log Register ({myRecords.length} entries)
          </h4>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPunchStream(!showPunchStream)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>{showPunchStream ? 'Hide Raw Punches' : 'View Raw Biometric Punches'}</span>
            </button>
          </div>
        </div>

        {myRecords.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
            No attendance punch records found for {selectedMonth}.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5">Date & Day</th>
                    <th className="px-4 py-2.5">Shift Window</th>
                    <th className="px-4 py-2.5 text-center">First In Punch</th>
                    <th className="px-4 py-2.5 text-center">Last Out Punch</th>
                    <th className="px-4 py-2.5 text-center">Total Hours</th>
                    <th className="px-4 py-2.5">Device & Sensor</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {myRecords.map((rec) => {
                    const dObj = new Date(rec.date);
                    const dayName = isNaN(dObj.getTime())
                      ? ''
                      : dObj.toLocaleDateString('en-US', { weekday: 'short' });

                    const isLate = rec.status === 'Late';
                    const isPresent = rec.status === 'Present';
                    const isHalfDay = rec.status === 'Half Day';
                    const isAbsent = rec.status === 'Absent';

                    // Pick random sensor & terminal mode for visualization
                    const sensorMode = rec.inTime && rec.inTime.includes('09:1') ? 'FACE' : 'FINGERPRINT';
                    const terminalName = 'HQ Main Turnstile Gate A';

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <div className="font-bold">{rec.date}</div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase">{dayName}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                          09:00 - 18:00
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                          {rec.inTime ? (
                            <span className={isLate ? 'text-amber-700' : 'text-slate-800'}>
                              {rec.inTime}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">--:--</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                          {rec.outTime || <span className="text-slate-400 italic">--:--</span>}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold">
                          {rec.totalHours ? (
                            <span className="text-indigo-700">{rec.totalHours} hrs</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            {getVerificationIcon(sensorMode)}
                            <span className="truncate max-w-[150px]">{terminalName}</span>
                          </div>
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
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => onOpenRegularization(rec.date)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-xs font-bold transition-all"
                            title="Request attendance regularization for this day"
                          >
                            Regularize
                          </button>
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

      {/* Raw Biometric Punch Stream (Expandable) */}
      {showPunchStream && (
        <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Raw Biometric Hardware Punch Events ({myRecentPunches.length})
              </h5>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Filtered for {employee.fullName || employee.name} ({employee.empCode})
            </span>
          </div>

          {myRecentPunches.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center bg-white rounded-lg border border-slate-200">
              No raw device punch packets captured for this employee in {selectedMonth}.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {myRecentPunches.map((punch) => (
                <div
                  key={punch.id}
                  className="bg-white p-2.5 rounded-lg border border-indigo-100 flex items-center justify-between text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100">
                      {getVerificationIcon(punch.verificationMode)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-[11px]">
                        {punch.punchType.replace('_', ' ')} • {punch.deviceName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {punch.timestamp} • Mode: {punch.verificationMode}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
