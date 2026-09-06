import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Star,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  UserCheck,
  Building,
  Sparkles
} from 'lucide-react';
import { AppraisalCycle, EmployeeAppraisal, EmployeeMaster } from '../../types';
import { storageService } from '../../services/storageService';

interface PerformanceManagementViewProps {
  employees: EmployeeMaster[];
  onRefresh: () => void;
}

export const PerformanceManagementView: React.FC<PerformanceManagementViewProps> = ({
  employees,
  onRefresh
}) => {
  const [selectedAppraisal, setSelectedAppraisal] = useState<EmployeeAppraisal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [evalModalOpen, setEvalModalOpen] = useState(false);

  const cycles = storageService.getAppraisalCycles();
  const appraisals = storageService.getEmployeeAppraisals();

  const [evalForm, setEvalForm] = useState<{
    managerRating: number;
    finalRating: number;
    recommendedIncrementPct: number;
    promotedTo: string;
    keyAchievements: string;
    areasOfImprovement: string;
  }>({
    managerRating: 4.5,
    finalRating: 4.5,
    recommendedIncrementPct: 12.0,
    promotedTo: '',
    keyAchievements: '',
    areasOfImprovement: ''
  });

  const handleOpenEvaluate = (appr: EmployeeAppraisal) => {
    setSelectedAppraisal(appr);
    setEvalForm({
      managerRating: appr.managerRating || 4.5,
      finalRating: appr.finalRating || 4.5,
      recommendedIncrementPct: appr.recommendedIncrementPct || 12.0,
      promotedTo: appr.promotedTo || '',
      keyAchievements: appr.keyAchievements || '',
      areasOfImprovement: appr.areasOfImprovement || ''
    });
    setEvalModalOpen(true);
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppraisal) return;

    storageService.updateEmployeeAppraisal(selectedAppraisal.id, {
      managerRating: Number(evalForm.managerRating),
      finalRating: Number(evalForm.finalRating),
      recommendedIncrementPct: Number(evalForm.recommendedIncrementPct),
      promotedTo: evalForm.promotedTo || undefined,
      keyAchievements: evalForm.keyAchievements,
      areasOfImprovement: evalForm.areasOfImprovement,
      status: 'Completed'
    });

    setEvalModalOpen(false);
    setSelectedAppraisal(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Appraisal Cycles Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cycles.map((cyc) => (
          <div key={cyc.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase">
                  {cyc.period}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  {cyc.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">{cyc.title}</h4>
              <p className="text-xs text-slate-500 mt-1">
                KRA achievement scorecards, peer feedback & promotion recommendation reviews.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">
                Duration: {cyc.startDate} to {cyc.endDate}
              </span>
              <span className="font-bold text-indigo-600 font-mono">
                {cyc.completedReviews} / {cyc.totalEligible} Completed
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Employee Scorecards List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Employee KRA Scorecards & Appraisal Reviews
            </h4>
            <p className="text-[11px] text-slate-500">Self vs Manager Weighted KRA Scoring & Recommendations</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold font-mono">
            {appraisals.length} Reviews
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Role & Dept</th>
                <th className="py-3 px-4 text-center">Self Rating</th>
                <th className="py-3 px-4 text-center">Manager Rating</th>
                <th className="py-3 px-4 text-center">Final Score</th>
                <th className="py-3 px-4 text-center">Rec. Increment</th>
                <th className="py-3 px-4">Promotion / Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appraisals.map((appr) => (
                <tr key={appr.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{appr.empName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{appr.empCode}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{appr.designation}</div>
                    <div className="text-[11px] text-slate-400">{appr.department}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                    {appr.selfRating ? `${appr.selfRating} / 5.0` : '-'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600">
                    {appr.managerRating ? `${appr.managerRating} / 5.0` : '-'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                      ★ {appr.finalRating} / 5.0
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                    +{appr.recommendedIncrementPct}%
                  </td>
                  <td className="py-3 px-4">
                    {appr.promotedTo ? (
                      <span className="text-indigo-700 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{appr.promotedTo}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">Role Retained</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEvaluate(appr)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Review KRA</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Review & Evaluate */}
      {evalModalOpen && selectedAppraisal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Annual KRA Review: {selectedAppraisal.empName} ({selectedAppraisal.empCode})
                </h3>
                <p className="text-xs text-slate-500">{selectedAppraisal.designation} • {selectedAppraisal.department}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold font-mono">
                Self Score: {selectedAppraisal.selfRating} / 5
              </span>
            </div>

            {/* KRAs Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block uppercase">Assigned Weighted KRAs</span>
              {selectedAppraisal.kraScores.map((k, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{k.kraTitle}</span>
                    <span className="text-[11px] font-mono text-indigo-600 font-semibold">Weight: {k.weightagePct}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{k.comments}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-700 font-mono">
                    <span>Self: {k.selfScore} / 5.0</span>
                    <span className="text-indigo-600 font-bold">Manager Score: {k.managerScore} / 5.0</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-3 text-xs pt-2">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Manager Rating (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={evalForm.managerRating}
                    onChange={(e) => setEvalForm({ ...evalForm, managerRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Final Score</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={evalForm.finalRating}
                    onChange={(e) => setEvalForm({ ...evalForm, finalRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Recommended Increment (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={evalForm.recommendedIncrementPct}
                    onChange={(e) => setEvalForm({ ...evalForm, recommendedIncrementPct: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Promotion Recommendation</label>
                <input
                  type="text"
                  placeholder="e.g. Associate Vice President (Operations)"
                  value={evalForm.promotedTo}
                  onChange={(e) => setEvalForm({ ...evalForm, promotedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Key Annual Accomplishments</label>
                <textarea
                  rows={2}
                  value={evalForm.keyAchievements}
                  onChange={(e) => setEvalForm({ ...evalForm, keyAchievements: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEvalModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Save Appraisal & Increment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
