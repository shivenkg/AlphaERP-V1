import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogViewProps {
  auditLogs: AuditLog[];
  onOpenSheetsModal: () => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  auditLogs,
  onOpenSheetsModal
}) => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const term = (search || '').trim().toLowerCase();
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      !term ||
      (log.user || '').toLowerCase().includes(term) ||
      (log.targetId || '').toLowerCase().includes(term) ||
      (log.summary || '').toLowerCase().includes(term) ||
      (log.module || '').toLowerCase().includes(term);

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const actions = Array.from(new Set(auditLogs.map((l) => l.action)));

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Security & User Activity Audit Trail</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {auditLogs.length} Events Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Immutable system activity log recording quote creations, status transitions, PR-to-PO conversions, and payment settlements.
          </p>
        </div>

        <button
          onClick={onOpenSheetsModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Audit Sheet View</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs placeholder-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <span>Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-50 text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-medium"
          >
            <option value="ALL">All Actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User & Persona</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Target Reference</th>
                <th className="py-3.5 px-4">Summary Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 font-sans">{log.user}</span>
                    <span className="block text-[10px] text-blue-600 font-sans font-semibold">{log.role}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-sans font-semibold">{log.module}</td>
                  <td className="py-3.5 px-4 text-slate-900 font-bold">{log.targetId}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-sans font-medium">{log.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
