import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  MessageSquare,
  Lock,
  User,
  Check,
  Building
} from 'lucide-react';
import { GrievanceTicket, EmployeeMaster } from '../../types';
import { storageService } from '../../services/storageService';

interface GrievanceManagementViewProps {
  employees: EmployeeMaster[];
  onRefresh: () => void;
}

export const GrievanceManagementView: React.FC<GrievanceManagementViewProps> = ({
  employees,
  onRefresh
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<GrievanceTicket | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const grievances = storageService.getGrievanceTickets();

  const [form, setForm] = useState({
    empId: employees[0]?.id || 'emp-001',
    isAnonymous: false,
    subject: '',
    category: 'Workplace Safety & Site Conditions' as GrievanceTicket['category'],
    severity: 'Medium' as GrievanceTicket['severity'],
    description: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject) return;

    const emp = employees.find(e => e.id === form.empId);
    storageService.submitGrievanceTicket({
      empId: form.isAnonymous ? undefined : emp?.id,
      empName: form.isAnonymous ? 'Anonymous' : (emp?.fullName || emp?.name),
      isAnonymous: form.isAnonymous,
      subject: form.subject,
      category: form.category,
      severity: form.severity,
      description: form.description,
      assignedTo: 'HR Ethics & Safety Committee'
    });

    setModalOpen(false);
    setForm({ empId: employees[0]?.id || 'emp-001', isAnonymous: false, subject: '', category: 'Workplace Safety & Site Conditions' as any, severity: 'Medium', description: '' });
    onRefresh();
  };

  const handleOpenResolve = (ticket: GrievanceTicket) => {
    setSelectedTicket(ticket);
    setResolutionText(ticket.resolutionSummary || '');
    setResolveModalOpen(true);
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !resolutionText) return;

    storageService.resolveGrievanceTicket(selectedTicket.id, resolutionText, 'Shivender Kumar (HR & Safety Head)');
    setResolveModalOpen(false);
    setSelectedTicket(null);
    onRefresh();
  };

  const openCount = grievances.filter(g => g.status === 'Open' || g.status === 'Under Investigation').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
              Confidential & POSH Compliant
            </span>
            <span className="text-xs text-slate-500">Employee Welfare & Site Safety</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Grievance Redressal & Employee Relations Desk
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Secure, confidential grievance logging for site safety hazards, overtime compensation disputes, POSH, and contractor conduct issues.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-bold uppercase">Active Issues</span>
            <span className="text-2xl font-bold font-mono text-rose-600">{openCount} Cases</span>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Confidential Ticket</span>
          </button>
        </div>
      </div>

      {/* Grievances List */}
      <div className="space-y-3">
        {grievances.map((g) => (
          <div
            key={g.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-400">#{g.id}</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                  {g.category}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  g.severity === 'Critical'
                    ? 'bg-rose-100 text-rose-800'
                    : g.severity === 'High'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {g.severity} Priority
                </span>

                {g.isAnonymous ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    <Lock className="w-3 h-3" /> Anonymous
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    <User className="w-3 h-3" /> {g.empName}
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-900">{g.subject}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{g.description}</p>

              {g.resolutionSummary && (
                <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                  <strong className="block font-bold">Resolution Recorded ({g.assignedTo || 'HR Head'} - {g.resolvedAt || 'Resolved'}):</strong>
                  {g.resolutionSummary}
                </div>
              )}
            </div>

            <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                g.status === 'Resolved'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : g.status === 'Under Investigation'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {g.status}
              </span>

              {g.status !== 'Resolved' && (
                <button
                  onClick={() => handleOpenResolve(g)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                >
                  Record Resolution
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Raise Ticket */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Raise Confidential Grievance</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700">Submit Anonymously</span>
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>

              {!form.isAnonymous && (
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
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject / Issue</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scaffolding harness anchor defect at Chiller Room"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Workplace Safety & Site Conditions">Workplace Safety & Site Conditions</option>
                    <option value="Overtime & Site Allowance Discrepancy">Overtime & Site Allowance Discrepancy</option>
                    <option value="Harassment / POSH">Harassment / POSH</option>
                    <option value="Manager / Contractor Dispute">Manager / Contractor Dispute</option>
                    <option value="Facilities & Site Food/Stay">Facilities & Site Food/Stay</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide facts, date, site location and witnesses..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve */}
      {resolveModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Resolve Grievance #{selectedTicket.id}</h3>
            <p className="text-xs text-slate-600 font-medium">{selectedTicket.subject}</p>

            <form onSubmit={handleResolve} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Corrective Action Taken & Resolution Notes</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Document corrective actions taken, safety equipment replaced, or dispute resolution agreed..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Mark Case Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
