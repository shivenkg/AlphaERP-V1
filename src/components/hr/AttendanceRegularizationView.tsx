import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Check,
  X,
  MapPin,
  FileText
} from 'lucide-react';
import { AttendanceRegularization, EmployeeMaster } from '../../types';
import { storageService } from '../../services/storageService';

interface AttendanceRegularizationViewProps {
  employees: EmployeeMaster[];
  onRefresh: () => void;
}

export const AttendanceRegularizationView: React.FC<AttendanceRegularizationViewProps> = ({
  employees,
  onRefresh
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [form, setForm] = useState({
    empId: employees[0]?.id || 'emp-001',
    date: new Date().toISOString().split('T')[0],
    punchType: 'Site Direct Visit' as AttendanceRegularization['punchType'],
    inTime: '08:30 AM',
    outTime: '06:00 PM',
    reason: ''
  });

  const regularizations = storageService.getAttendanceRegularizations();

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason) return;
    const emp = employees.find(e => e.id === form.empId);
    storageService.submitAttendanceRegularization({
      empId: form.empId,
      empName: emp?.fullName || emp?.name || 'Employee',
      empCode: emp?.empCode || 'EMP',
      date: form.date,
      punchType: form.punchType,
      inTime: form.inTime,
      outTime: form.outTime,
      reason: form.reason
    });
    setModalOpen(false);
    setForm({ empId: employees[0]?.id || 'emp-001', date: new Date().toISOString().split('T')[0], punchType: 'Site Direct Visit', inTime: '08:30 AM', outTime: '06:00 PM', reason: '' });
    onRefresh();
  };

  const handleApprove = (id: string) => {
    storageService.updateAttendanceRegularizationStatus(id, 'Approved', 'Shivender Kumar (MD)');
    onRefresh();
  };

  const handleReject = (id: string) => {
    storageService.updateAttendanceRegularizationStatus(id, 'Rejected', 'Shivender Kumar (MD)');
    onRefresh();
  };

  const filteredList = regularizations.filter(r => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Attendance Regularization Requests</h3>
          <p className="text-xs text-slate-500">Missed punches, direct site visits, customer pre-bid meetings & outstation travel</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Approvals</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Regularization</span>
          </button>
        </div>
      </div>

      {/* Regularizations Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Punch Type</th>
                <th className="py-3 px-4">Adjusted In/Out</th>
                <th className="py-3 px-4">Reason & Justification</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{reg.empName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{reg.empCode}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700">{reg.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                      {reg.punchType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {reg.inTime} - {reg.outTime}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{reg.reason}</td>
                  <td className="py-3 px-4 text-center">
                    {reg.status === 'Approved' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        Approved
                      </span>
                    )}
                    {reg.status === 'Pending' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                        Pending PM Action
                      </span>
                    )}
                    {reg.status === 'Rejected' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {reg.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(reg.id)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold"
                          title="Approve Regularization"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleReject(reg.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold"
                          title="Reject Request"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Apply */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Submit Attendance Regularization</h3>
            <form onSubmit={handleApply} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Employee</label>
                <select
                  value={form.empId}
                  onChange={(e) => setForm({ ...form, empId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.fullName || e.name} ({e.empCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Punch Type</label>
                  <select
                    value={form.punchType}
                    onChange={(e) => setForm({ ...form, punchType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Site Direct Visit">Site Direct Visit</option>
                    <option value="Client Meeting">Client Meeting</option>
                    <option value="Biometric Missed">Biometric Missed</option>
                    <option value="Outstation Travel">Outstation Travel</option>
                    <option value="Work From Home">Work From Home</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expected In Time</label>
                  <input
                    type="text"
                    value={form.inTime}
                    onChange={(e) => setForm({ ...form, inTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expected Out Time</label>
                  <input
                    type="text"
                    value={form.outTime}
                    onChange={(e) => setForm({ ...form, outTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason & Site Location</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Attended pressure holding testing at Metro Grand Tower Chiller plant."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Submit Regularization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
