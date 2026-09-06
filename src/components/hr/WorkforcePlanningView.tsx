import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Building,
  DollarSign,
  AlertTriangle,
  Plus,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { WorkforceForecast, EmployeeMaster, JobRequisition } from '../../types';
import { storageService } from '../../services/storageService';

interface WorkforcePlanningViewProps {
  employees: EmployeeMaster[];
  jobRequisitions: JobRequisition[];
  onRefresh: () => void;
}

export const WorkforcePlanningView: React.FC<WorkforcePlanningViewProps> = ({
  employees,
  jobRequisitions,
  onRefresh
}) => {
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const forecasts = storageService.getWorkforceForecasts();

  const [form, setForm] = useState({
    quarter: 'Q3 FY26 (Oct-Dec)',
    department: 'Projects & Execution',
    currentHeadcount: 14,
    projectedDemand: 18,
    budgetAllocated: 4200000,
    keyDrivers: 'Commercial VRF Site & Airport Expansion execution',
    hiringPriority: 'High' as WorkforceForecast['hiringPriority']
  });

  const handleCreateForecast = (e: React.FormEvent) => {
    e.preventDefault();
    const shortage = Math.max(0, Number(form.projectedDemand) - Number(form.currentHeadcount));
    storageService.addWorkforceForecast({
      quarter: form.quarter,
      department: form.department,
      currentHeadcount: Number(form.currentHeadcount),
      projectedDemand: Number(form.projectedDemand),
      gapShortage: shortage,
      budgetAllocated: Number(form.budgetAllocated),
      keyDrivers: form.keyDrivers,
      hiringPriority: form.hiringPriority
    });
    setPlanModalOpen(false);
    onRefresh();
  };

  const totalCurrentHeadcount = forecasts.reduce((acc, p) => acc + p.currentHeadcount, 0);
  const totalProjectedDemand = forecasts.reduce((acc, p) => acc + p.projectedDemand, 0);
  const totalShortage = forecasts.reduce((acc, p) => acc + p.gapShortage, 0);
  const totalExpansionBudget = forecasts.reduce((acc, p) => acc + p.budgetAllocated, 0);

  // Department distribution
  const deptBreakdown: Record<string, number> = {};
  employees.forEach(e => {
    const d = e.department || 'General';
    deptBreakdown[d] = (deptBreakdown[d] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Current Staff Strength</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{employees.length} Engineers & Staff</div>
          <span className="text-xs text-indigo-600 font-medium mt-1 block">Full-Time on Payroll</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Projected Q3/Q4 Demand</span>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">{totalProjectedDemand} Positions</div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">Across MEP Project Sites</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Forecasted Talent Gap</span>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">-{totalShortage} Openings</div>
          <span className="text-xs text-rose-600 font-medium mt-1 block">Needs Active Hiring</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Workforce Expansion Budget</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">₹{(totalExpansionBudget / 100000).toFixed(1)} Lakhs</div>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">Allocated Annualized CTC</span>
        </div>
      </div>

      {/* Workforce Demand vs Shortage Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quarterly Workforce Demand & Headcount Planning
            </h4>
            <p className="text-[11px] text-slate-500">Strategic capacity planning mapped against HVAC project pipeline and site milestones</p>
          </div>
          <button
            onClick={() => setPlanModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Forecast Quarter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Quarter</th>
                <th className="py-3 px-4">Department / Division</th>
                <th className="py-3 px-4 text-center">Current Staff</th>
                <th className="py-3 px-4 text-center">Target Demand</th>
                <th className="py-3 px-4 text-center">Net Shortage</th>
                <th className="py-3 px-4">Key Demand Drivers</th>
                <th className="py-3 px-4 text-right">Allocated Budget</th>
                <th className="py-3 px-4 text-center">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecasts.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{f.quarter}</td>
                  <td className="py-3 px-4 font-bold text-indigo-700">{f.department}</td>
                  <td className="py-3 px-4 text-center font-mono">{f.currentHeadcount}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600">{f.projectedDemand}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-rose-600">
                    {f.gapShortage > 0 ? `+${f.gapShortage}` : '0 (Balanced)'}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{f.keyDrivers}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{(f.budgetAllocated / 100000).toFixed(1)} L
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      f.hiringPriority === 'Critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : f.hiringPriority === 'High'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {f.hiringPriority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Headcount Department Breakdown & Open Requisitions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Department Headcount Distribution</h4>
            <span className="text-xs font-mono font-bold text-indigo-600">{employees.length} Total</span>
          </div>
          <div className="space-y-2">
            {Object.entries(deptBreakdown).map(([dept, count]) => {
              const pct = Math.round((count / (employees.length || 1)) * 100);
              return (
                <div key={dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{dept}</span>
                    <span className="font-mono text-slate-500">{count} staff ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Active Job Requisitions</h4>
            <span className="text-xs font-mono font-bold text-emerald-600">{jobRequisitions.length} Openings</span>
          </div>
          <div className="space-y-2">
            {jobRequisitions.map((req) => (
              <div key={req.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{req.jobTitle}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{req.department} • {req.location}</div>
                </div>
                <div className="text-right font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                    {req.openPositions - req.filledPositions} Open
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{req.salaryRange}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Add Forecast */}
      {planModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add Workforce Forecast</h3>
            <form onSubmit={handleCreateForecast} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quarter</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 FY26"
                    value={form.quarter}
                    onChange={(e) => setForm({ ...form, quarter: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="Projects & Execution">Projects & Execution</option>
                    <option value="Design & Engineering">Design & Engineering</option>
                    <option value="Service & AMC Maintenance">Service & AMC Maintenance</option>
                    <option value="Procurement & Stores">Procurement & Stores</option>
                    <option value="Tendering & Estimation">Tendering & Estimation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Current Headcount</label>
                  <input
                    type="number"
                    min="0"
                    value={form.currentHeadcount}
                    onChange={(e) => setForm({ ...form, currentHeadcount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Projected Demand</label>
                  <input
                    type="number"
                    min="0"
                    value={form.projectedDemand}
                    onChange={(e) => setForm({ ...form, projectedDemand: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Allocated Budget (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.budgetAllocated}
                  onChange={(e) => setForm({ ...form, budgetAllocated: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Key Demand Drivers & Milestones</label>
                <textarea
                  rows={2}
                  required
                  value={form.keyDrivers}
                  onChange={(e) => setForm({ ...form, keyDrivers: e.target.value })}
                  placeholder="e.g. Airport Terminal Phase 2 handover, BMS commissioning..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hiring Priority</label>
                <select
                  value={form.hiringPriority}
                  onChange={(e) => setForm({ ...form, hiringPriority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Save Forecast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
