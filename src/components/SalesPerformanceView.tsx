import React, { useState } from 'react';
import {
  Target,
  TrendingUp,
  Award,
  DollarSign,
  Percent,
  Edit2,
  CheckCircle2,
  Users,
  Briefcase,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { SalesRep } from '../types';
import { storageService } from '../services/storageService';
import { SalesTrendAnalysis } from './SalesTrendAnalysis';
import { SalesRepQuotaComparisonChart } from './SalesRepQuotaComparisonChart';

interface SalesPerformanceViewProps {
  salesReps: SalesRep[];
  onOpenSheetsModal: () => void;
  onNavigate?: (tab: string) => void;
}

export const SalesPerformanceView: React.FC<SalesPerformanceViewProps> = ({
  salesReps,
  onOpenSheetsModal,
  onNavigate
}) => {
  const [editingRep, setEditingRep] = useState<SalesRep | null>(null);
  const [newQuota, setNewQuota] = useState<number>(0);
  const [newCommissionRate, setNewCommissionRate] = useState<number>(0);

  const totalQuota = salesReps.reduce((s, r) => s + r.monthlyQuota, 0);
  const totalAchieved = salesReps.reduce((s, r) => s + r.achievedSalesMonth, 0);
  const totalCommission = salesReps.reduce((s, r) => s + r.calculatedCommission, 0);
  const overallAchievementPct = totalQuota > 0 ? ((totalAchieved / totalQuota) * 100).toFixed(2) : '0.00';

  const handleUpdateQuotaSubmit = () => {
    if (!editingRep) return;
    storageService.updateSalesQuota(
      editingRep.id,
      newQuota,
      newQuota * 3,
      newCommissionRate
    );
    setEditingRep(null);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Sales Team Quotas & Commission Engineering</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {salesReps.length} Sales Engineers
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Individual quota tracking, gross-margin bonus multipliers, and commission calculations for HVAC sales engineers.
          </p>
        </div>
      </div>

      {/* Top Metrics Cards - Clickable Landing to Datasources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Card 1: Monthly Target Quotas */}
        <div
          onClick={() => onNavigate?.('quotes')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate?.('quotes');
            }
          }}
          title="Click to view Quotations & Target Contract Value"
          className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.015] cursor-pointer transition-all duration-200 min-w-0 group select-none flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate block">Total Monthly Team Target</span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 group-hover:scale-110 transition-transform">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 font-mono group-hover:translate-x-0.5 transition-transform">
              ₹{(totalQuota / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium truncate">
              Sum of individual sales engineer quotas
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Target Quotations</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:underline">
              <span>View Quotes Register</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Card 2: Realized Sales Won */}
        <div
          onClick={() => onNavigate?.('quotes')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate?.('quotes');
            }
          }}
          title="Click to view Awarded Quotes & Realized Sales"
          className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.015] cursor-pointer transition-all duration-200 min-w-0 group select-none flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate block">Team Realized Sales (Won)</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-mono group-hover:translate-x-0.5 transition-transform">
              ₹{(totalAchieved / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-semibold truncate">
              {overallAchievementPct}% Team Quota Achieved
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Awarded Contracts</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:underline">
              <span>View Awarded Deals</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </div>
        </div>

        {/* Card 3: Total Commission Pool */}
        <div
          onClick={() => onNavigate?.('finance')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate?.('finance');
            }
          }}
          title="Click to view Commission Ledger, Payroll & General Ledger"
          className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.015] cursor-pointer transition-all duration-200 min-w-0 sm:col-span-2 lg:col-span-1 group select-none flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate block">Total Commission Pool</span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900 group-hover:scale-110 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2 font-mono group-hover:translate-x-0.5 transition-transform">
              ₹{totalCommission.toLocaleString()}
            </div>
            <div className="text-[11px] text-blue-700 dark:text-blue-400 mt-1 font-medium truncate">
              Base rate + high-margin bonus incentive
            </div>
          </div>
          <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Payroll & Ledger</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:underline">
              <span>View Finance Books</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* Individual Sales Reps vs Monthly Quota Target Comparative Bar Chart */}
      <SalesRepQuotaComparisonChart salesReps={salesReps} onNavigate={onNavigate} />

      {/* Trend Analysis & Future Sales Cycle Projections Engine */}
      <SalesTrendAnalysis salesReps={salesReps} onNavigate={onNavigate} />

      {/* Sales Reps Table & Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {salesReps.map((rep) => {
          const achievementPct = ((rep.achievedSalesMonth / rep.monthlyQuota) * 100).toFixed(2);
          const isTargetMet = Number(achievementPct) >= 100;

          return (
            <div
              key={rep.id}
              onClick={() => onNavigate?.('crm')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate?.('crm');
                }
              }}
              title={`Click to view CRM Deals & Pipeline for ${rep.name}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01] cursor-pointer transition-all duration-200 space-y-4 group select-none"
            >
              {/* Profile Top */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rep.avatar}
                    alt={rep.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {rep.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{rep.email}</div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingRep(rep);
                    setNewQuota(rep.monthlyQuota);
                    setNewCommissionRate(rep.baseCommissionPct);
                  }}
                  className="p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
                  title="Edit Quota & Commission Rate"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quota Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Monthly Target Progress</span>
                  <span className={`font-bold font-mono ${isTargetMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {achievementPct}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isTargetMet ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(100, Number(achievementPct))}%` }}
                  />
                </div>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Monthly Quota</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 font-mono">₹{(rep.monthlyQuota / 100000).toFixed(1)} L</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Achieved Sales</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹{(rep.achievedSalesMonth / 100000).toFixed(1)} L</div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Commission Rate</div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">{rep.baseCommissionPct}% base</div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Commission Earned</div>
                  <div className="font-bold text-blue-600 dark:text-blue-400 font-mono">₹{rep.calculatedCommission.toLocaleString()}</div>
                </div>
              </div>

              {/* Won Deals & Win Rate */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate?.('quotes');
                  }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{rep.wonDealsCount} Closed HVAC Deals</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate?.('crm');
                  }}
                  className="text-emerald-700 dark:text-emerald-400 font-bold font-mono hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>₹{(rep.activePipelineValue / 100000).toFixed(1)} L In Pipeline</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Quota Modal */}
      {editingRep && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Adjust Quota: {editingRep.name}</h3>
              <button onClick={() => setEditingRep(null)} className="text-xs text-slate-400 hover:text-slate-700 font-bold p-1">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Monthly Quota Target (₹):</label>
                <input
                  type="number"
                  value={newQuota}
                  onChange={(e) => setNewQuota(Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 font-bold p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Commission Rate Percentage (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                  className="w-full bg-slate-50 text-slate-900 font-bold p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingRep(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateQuotaSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Save Quota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
