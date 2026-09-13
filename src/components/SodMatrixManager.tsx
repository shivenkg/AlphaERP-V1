import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Search,
  RotateCcw,
  Layers,
  Sparkles,
  Info,
  Building2,
  Users,
  ChevronRight,
  Filter,
  X,
  Check
} from 'lucide-react';
import {
  SodConflictRule,
  SodViolation,
  BusinessRole,
  UserProfile
} from '../types';
import { storageService } from '../services/storageService';
import {
  ENTERPRISE_SOD_RULES,
  ENTERPRISE_FUNCTIONS
} from '../utils/rbac';

export const SodMatrixManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'violations' | 'rules' | 'matrix'>('violations');
  const [violations, setViolations] = useState<SodViolation[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Modal for Compensating Control / Mitigation Override
  const [selectedViolationForMitigation, setSelectedViolationForMitigation] = useState<SodViolation | null>(null);
  const [mitigationForm, setMitigationForm] = useState({
    approver: 'Executive Internal Auditor',
    reason: 'Compensating control: Mandatory dual physical authorization and weekly CFO review.'
  });

  useEffect(() => {
    refreshData();
    const unsubscribe = storageService.subscribe(() => {
      refreshData();
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const refreshData = () => {
    setViolations(storageService.getAllSodViolations());
  };

  const showFeedback = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Filtered violations
  const filteredViolations = useMemo(() => {
    return violations.filter((v) => {
      if (severityFilter !== 'ALL' && v.severity !== severityFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          v.violatorName.toLowerCase().includes(q) ||
          v.ruleTitle.toLowerCase().includes(q) ||
          (v.mitigationNotes || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [violations, severityFilter, searchTerm]);

  // Violations counts
  const violationCounts = useMemo(() => {
    const unmitigated = violations.filter((v) => v.status !== 'mitigated').length;
    const mitigated = violations.filter((v) => v.status === 'mitigated').length;
    const critical = violations.filter((v) => v.severity === 'CRITICAL' && v.status !== 'mitigated').length;
    return { unmitigated, mitigated, critical, total: violations.length };
  }, [violations]);

  // Handle mitigation override
  const handleSaveMitigation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedViolationForMitigation) return;

    storageService.addSodOverride({
      ruleId: selectedViolationForMitigation.ruleId,
      targetId: selectedViolationForMitigation.violatorId,
      targetType: selectedViolationForMitigation.violatorType,
      approvedBy: mitigationForm.approver.trim() || 'Internal Auditor',
      reason: mitigationForm.reason.trim()
    });

    showFeedback(
      `Compensating control recorded for ${selectedViolationForMitigation.violatorName}.`,
      'success'
    );
    setSelectedViolationForMitigation(null);
  };

  // Handle revoke override
  const handleRevokeOverride = (v: SodViolation) => {
    if (window.confirm(`Revoke compensating control override for rule "${v.ruleTitle}"?`)) {
      storageService.removeSodOverride(v.ruleId, v.violatorId);
      showFeedback(`Mitigation override revoked.`, 'info');
    }
  };

  // Functions lookup
  const funcMap = useMemo(() => {
    const map = new Map<string, string>();
    ENTERPRISE_FUNCTIONS.forEach((f) => map.set(f.id, f.name));
    return map;
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Enterprise Segregation of Duties (SoD) Governance Matrix
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                {ENTERPRISE_SOD_RULES.length} Canonical Rules
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated conflict detection prevents unauthorized dual privileges (such as Requisition Creation vs Approval, or PO Release vs Warehouse GRN Inwarding). Document formal compensating controls for approved operational exceptions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {feedback && (
              <span
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border animate-in fade-in ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {feedback.message}
              </span>
            )}
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Critical Conflicts
            </span>
            <div className="text-xl font-black text-rose-900 mt-1">
              {violationCounts.critical}
            </div>
            <span className="text-[10px] text-rose-600">Immediate hazard risk</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Unmitigated Conflicts
            </span>
            <div className="text-xl font-black text-amber-900 mt-1">
              {violationCounts.unmitigated}
            </div>
            <span className="text-[10px] text-amber-600">Needs compensating control</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Mitigated Overrides
            </span>
            <div className="text-xl font-black text-emerald-900 mt-1">
              {violationCounts.mitigated}
            </div>
            <span className="text-[10px] text-emerald-600">Controls documented</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
              Active SoD Rules
            </span>
            <div className="text-xl font-black text-indigo-900 mt-1">
              {ENTERPRISE_SOD_RULES.length}
            </div>
            <span className="text-[10px] text-indigo-600">Across 9 HVAC domains</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('violations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'violations'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Live Violations Scanner ({violations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>8 Canonical SoD Conflict Rules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'matrix'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Cross-Domain Matrix Grid</span>
        </button>
      </div>

      {/* TAB 1: LIVE VIOLATION SCANNER */}
      {activeTab === 'violations' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter violations by role name or rule title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
            </select>
          </div>

          {/* Violations List */}
          {filteredViolations.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-slate-900">Zero SoD Conflicts Detected</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your functional role assignments and user permissions currently adhere 100% to enterprise segregation of duties guidelines.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredViolations.map((v, idx) => {
                const isMitigated = v.status === 'mitigated';
                const severityColor =
                  v.severity === 'CRITICAL'
                    ? 'border-rose-300 bg-rose-50/40 text-rose-900'
                    : v.severity === 'HIGH'
                    ? 'border-amber-300 bg-amber-50/40 text-amber-900'
                    : 'border-blue-300 bg-blue-50/40 text-blue-900';

                return (
                  <div
                    key={`${v.ruleId}-${v.violatorId}-${idx}`}
                    className={`bg-white rounded-3xl p-5 border shadow-sm transition-all space-y-3 ${
                      isMitigated ? 'border-emerald-200 opacity-90' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase border ${severityColor}`}
                        >
                          {v.severity}
                        </span>
                        <h5 className="text-xs font-black text-slate-900">{v.ruleTitle}</h5>
                      </div>

                      <div className="flex items-center gap-2">
                        {isMitigated ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Mitigated Override
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Unmitigated Violation
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Conflict Pair Details */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Target {v.violatorType === 'role' ? 'Role' : 'User'}
                        </span>
                        <span className="font-bold text-slate-900">{v.violatorName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-700">
                          {v.functionA}
                        </span>
                        <span className="text-rose-500 font-bold">⚡ vs ⚡</span>
                        <span className="font-mono text-[11px] bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-700">
                          {v.functionB}
                        </span>
                      </div>
                    </div>

                    {/* Mitigation Info or Action Button */}
                    {isMitigated ? (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-[11px] text-emerald-900">
                        <div>
                          <strong>Compensating Control:</strong> {v.mitigationNotes} (Approved by{' '}
                          <em>{v.approvedBy}</em>)
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRevokeOverride(v)}
                          className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedViolationForMitigation(v)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Record Compensating Control</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 8 CANONICAL SOD RULES */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ENTERPRISE_SOD_RULES.map((rule) => {
            const conflictsCount = violations.filter((v) => v.ruleId === rule.id).length;
            const severity =
              rule.severity === 'CRITICAL'
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : rule.severity === 'HIGH'
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-blue-100 text-blue-800 border-blue-200';

            return (
              <div
                key={rule.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">{rule.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severity}`}>
                      {rule.severity}
                    </span>
                  </div>

                  <h5 className="text-sm font-black text-slate-900 leading-snug">{rule.title}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">{rule.riskDescription}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Incompatible Opposing Functions:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px] text-slate-700">
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                        {rule.functionAName}
                      </span>
                      <span className="text-rose-500 font-bold">≠</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                        {rule.functionBName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>
                      Active Violations:{' '}
                      <strong className={conflictsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {conflictsCount}
                      </strong>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">SoD Rule Enforced</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: MATRIX CROSS-GRID */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-black text-slate-900">Segregation of Duties Cross-Grid</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Intersection matrix showing incompatible function pairings across commercial, procurement, inventory, and finance modules.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Rule Identifier</th>
                  <th className="p-3">Primary Initiator Function</th>
                  <th className="p-3">Incompatible Approver / Execution Function</th>
                  <th className="p-3 text-center">Severity</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ENTERPRISE_SOD_RULES.map((rule) => {
                  const conflictCount = violations.filter((v) => v.ruleId === rule.id).length;
                  return (
                    <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{rule.id}</td>
                      <td className="p-3 font-medium text-slate-800">
                        {rule.functionAName}
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {rule.functionBName}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            rule.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : rule.severity === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rule.severity}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {conflictCount > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {conflictCount} violation(s)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Clear
                          </span>
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

      {/* Modal: Record Compensating Control */}
      {selectedViolationForMitigation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900">Record Compensating Control</h4>
                <span className="text-xs text-slate-500 font-mono">
                  {selectedViolationForMitigation.ruleTitle}
                </span>
              </div>
              <button
                onClick={() => setSelectedViolationForMitigation(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMitigation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Entity
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedViolationForMitigation.violatorName}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Approving Officer / Authority *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., CFO & Chief Compliance Officer"
                  value={mitigationForm.approver}
                  onChange={(e) => setMitigationForm({ ...mitigationForm, approver: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Compensating Control Rationale *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the operational control mitigating the risk (e.g. weekly audit, dual approval)..."
                  value={mitigationForm.reason}
                  onChange={(e) => setMitigationForm({ ...mitigationForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedViolationForMitigation(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  Approve & Log Control
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
