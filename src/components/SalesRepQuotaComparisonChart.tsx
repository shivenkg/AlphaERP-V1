import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  Target,
  TrendingUp,
  Award,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Filter,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';
import { SalesRep } from '../types';

interface SalesRepQuotaComparisonChartProps {
  salesReps: SalesRep[];
  className?: string;
}

type SortOption = 'achievement_desc' | 'achievement_asc' | 'quota_desc' | 'sales_desc';
type ViewMode = 'comparison' | 'achievement_pct' | 'variance';

export const SalesRepQuotaComparisonChart: React.FC<SalesRepQuotaComparisonChartProps> = ({
  salesReps,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('comparison');
  const [sortBy, setSortBy] = useState<SortOption>('achievement_desc');
  const [selectedRepId, setSelectedRepId] = useState<string | null>(null);

  // Format data for Recharts
  const chartData = useMemo(() => {
    const raw = salesReps.map((rep) => {
      const quotaLakhs = Number((rep.monthlyQuota / 100000).toFixed(2));
      const achievedLakhs = Number((rep.achievedSalesMonth / 100000).toFixed(2));
      const achievementPct = rep.monthlyQuota > 0
        ? Number(((rep.achievedSalesMonth / rep.monthlyQuota) * 100).toFixed(1))
        : 0;
      const varianceLakhs = Number((achievedLakhs - quotaLakhs).toFixed(2));
      const commissionThousands = Number((rep.calculatedCommission / 1000).toFixed(1));

      return {
        id: rep.id,
        name: rep.name,
        shortName: rep.name.split(' ')[0],
        avatar: rep.avatar,
        email: rep.email,
        quotaLakhs,
        achievedLakhs,
        achievementPct,
        varianceLakhs,
        commissionThousands,
        wonDealsCount: rep.wonDealsCount,
        pipelineLakhs: Number(((rep.activePipelineValue || 0) / 100000).toFixed(1)),
        isTargetMet: achievedLakhs >= quotaLakhs
      };
    });

    // Sorting
    return raw.sort((a, b) => {
      if (sortBy === 'achievement_desc') return b.achievementPct - a.achievementPct;
      if (sortBy === 'achievement_asc') return a.achievementPct - b.achievementPct;
      if (sortBy === 'quota_desc') return b.quotaLakhs - a.quotaLakhs;
      if (sortBy === 'sales_desc') return b.achievedLakhs - a.achievedLakhs;
      return 0;
    });
  }, [salesReps, sortBy]);

  // Aggregate Metrics
  const totalTargetLakhs = chartData.reduce((s, r) => s + r.quotaLakhs, 0);
  const totalAchievedLakhs = chartData.reduce((s, r) => s + r.achievedLakhs, 0);
  const teamAchievementPct = totalTargetLakhs > 0
    ? Number(((totalAchievedLakhs / totalTargetLakhs) * 100).toFixed(1))
    : 0;
  const repsMetTargetCount = chartData.filter((r) => r.isTargetMet).length;
  const topPerformer = [...chartData].sort((a, b) => b.achievementPct - a.achievementPct)[0];

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700/60 backdrop-blur-md text-xs min-w-[220px] space-y-2">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <img
              src={data.avatar}
              alt={data.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-600"
            />
            <div>
              <div className="font-bold text-white text-sm">{data.name}</div>
              <div className="text-[10px] text-slate-400">{data.email}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Monthly Quota</span>
              <span className="font-bold text-blue-400 font-mono text-xs">₹{data.quotaLakhs} L</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Achieved Sales</span>
              <span className="font-bold text-emerald-400 font-mono text-xs">₹{data.achievedLakhs} L</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-800">
            <span className="text-slate-400">Target Achievement:</span>
            <span
              className={`font-bold font-mono px-2 py-0.5 rounded-md ${
                data.achievementPct >= 100
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {data.achievementPct}%
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target Variance:</span>
            <span
              className={`font-mono font-bold ${
                data.varianceLakhs >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {data.varianceLakhs >= 0 ? `+₹${data.varianceLakhs} L` : `-₹${Math.abs(data.varianceLakhs)} L`}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Deals Closed: <strong className="text-white">{data.wonDealsCount}</strong></span>
            <span>Commission: <strong className="text-amber-300 font-mono">₹{data.commissionThousands}k</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 ${className}`}>
      {/* Chart Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Sales Representatives vs Monthly Quota Target
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {repsMetTargetCount} / {salesReps.length} Quotas Met
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Comparative bar analytics benchmarking actual closed HVAC contract revenue against assigned monthly quota targets.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Sort Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'comparison'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Target vs Achieved (₹ L)
            </button>
            <button
              onClick={() => setViewMode('achievement_pct')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'achievement_pct'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Achievement %
            </button>
            <button
              onClick={() => setViewMode('variance')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'variance'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Surplus / Deficit
            </button>
          </div>

          {/* Sort Menu */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-50 text-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:bg-white text-xs font-semibold"
            >
              <option value="achievement_desc">Highest % Attainment</option>
              <option value="achievement_asc">Lowest % Attainment</option>
              <option value="sales_desc">Highest Sales Value</option>
              <option value="quota_desc">Highest Quota Target</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mini Executive Highlights Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Total Team Target</span>
          <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">₹{totalTargetLakhs.toFixed(2)} Lakhs</div>
          <span className="text-[10px] text-slate-400">Assigned monthly baseline</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Total Realized Revenue</span>
          <div className="font-bold text-emerald-600 font-mono text-sm mt-0.5">₹{totalAchievedLakhs.toFixed(2)} Lakhs</div>
          <span className="text-[10px] text-emerald-700 font-semibold">{teamAchievementPct}% Team Attainment</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Top Performer</span>
          <div className="font-bold text-blue-700 text-sm mt-0.5 truncate">{topPerformer?.name || 'N/A'}</div>
          <span className="text-[10px] text-blue-600 font-bold">{topPerformer?.achievementPct}% Quota Achieved</span>
        </div>

        <div>
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Quota Attainment Rate</span>
          <div className="font-bold text-indigo-700 font-mono text-sm mt-0.5">
            {repsMetTargetCount} of {salesReps.length} Reps
          </div>
          <span className="text-[10px] text-slate-500">
            {((repsMetTargetCount / Math.max(1, salesReps.length)) * 100).toFixed(0)}% Reps &ge; 100% Target
          </span>
        </div>
      </div>

      {/* Main Bar Chart Rendering */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'comparison' ? (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              barGap={4}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                unit=" L"
                tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
              />
              {/* Assigned Target Quota Bar */}
              <Bar
                dataKey="quotaLakhs"
                name="Assigned Monthly Target (₹ Lakhs)"
                fill="#94A3B8"
                radius={[6, 6, 0, 0]}
              />
              {/* Achieved Sales Bar with Dynamic Colors */}
              <Bar
                dataKey="achievedLakhs"
                name="Realized Sales Won (₹ Lakhs)"
                radius={[6, 6, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isTargetMet ? '#10B981' : '#3B82F6'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : viewMode === 'achievement_pct' ? (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                unit="%"
                tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* 100% Target Benchmark Line */}
              <ReferenceLine
                y={100}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{
                  value: '100% Target Benchmark',
                  fill: '#DC2626',
                  fontSize: 10,
                  position: 'top',
                  fontWeight: 700
                }}
              />
              <Bar
                dataKey="achievementPct"
                name="Target Achievement (%)"
                radius={[6, 6, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-pct-${index}`}
                    fill={entry.achievementPct >= 100 ? '#10B981' : entry.achievementPct >= 80 ? '#3B82F6' : '#F59E0B'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                unit=" L"
                tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#64748B" />
              <Bar
                dataKey="varianceLakhs"
                name="Quota Variance (Surplus / Deficit in ₹ Lakhs)"
                radius={[6, 6, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-var-${index}`}
                    fill={entry.varianceLakhs >= 0 ? '#10B981' : '#F43F5E'}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend & Quick Rep Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-4 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-400 inline-block"></span>
            <span>Monthly Target Quota</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block"></span>
            <span>Target Achieved (&ge; 100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-500 inline-block"></span>
            <span>In Progress (&lt; 100%)</span>
          </div>
        </div>

        <div className="text-slate-400 text-[11px] font-medium">
          Hover over bars for detailed commission & closed contract breakdown
        </div>
      </div>
    </div>
  );
};
