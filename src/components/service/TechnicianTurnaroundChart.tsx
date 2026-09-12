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
  Clock,
  TrendingDown,
  Award,
  CheckCircle2,
  ShieldCheck,
  Filter,
  BarChart3,
  Zap,
  ArrowDownRight,
  UserCheck
} from 'lucide-react';
import { serviceStorage } from '../../services/serviceStorage';
import { TechnicianTurnaroundStat } from '../../types/service';

interface TechnicianTurnaroundChartProps {
  className?: string;
  onSelectTechnician?: (techId: string) => void;
}

type SortBy = 'fastest' | 'jobs' | 'rating' | 'compliance';

export const TechnicianTurnaroundChart: React.FC<TechnicianTurnaroundChartProps> = ({
  className = '',
  onSelectTechnician
}) => {
  const [sortBy, setSortBy] = useState<SortBy>('fastest');
  const [metricMode, setMetricMode] = useState<'turnaround' | 'volume' | 'compliance'>('turnaround');

  // Load live stats from serviceStorage
  const stats: TechnicianTurnaroundStat[] = useMemo(() => {
    return serviceStorage.getTechnicianTurnaroundStats();
  }, []);

  // Sorted data
  const chartData = useMemo(() => {
    const cloned = [...stats];
    switch (sortBy) {
      case 'fastest':
        cloned.sort((a, b) => a.avgTurnaroundHours - b.avgTurnaroundHours);
        break;
      case 'jobs':
        cloned.sort((a, b) => b.resolvedCount - a.resolvedCount);
        break;
      case 'rating':
        cloned.sort((a, b) => b.rating - a.rating);
        break;
      case 'compliance':
        cloned.sort((a, b) => b.slaCompliancePct - a.slaCompliancePct);
        break;
    }

    return cloned.map((item) => ({
      id: item.technicianId,
      name: item.technicianName,
      shortName: item.technicianName.split(' ')[0],
      avgHours: item.avgTurnaroundHours,
      fastestHours: item.fastestHours,
      longestHours: item.longestHours,
      resolved: item.resolvedCount,
      totalAssigned: item.totalAssigned,
      slaCompliance: item.slaCompliancePct,
      rating: item.rating,
      truckPlate: item.truckPlate,
      avatar: item.avatar
    }));
  }, [stats, sortBy]);

  // Overall KPIs
  const totalResolved = useMemo(
    () => stats.reduce((sum, s) => sum + s.resolvedCount, 0),
    [stats]
  );

  const fleetAvgHours = useMemo(() => {
    if (stats.length === 0) return 0;
    const sum = stats.reduce((acc, curr) => acc + curr.avgTurnaroundHours, 0);
    return Number((sum / stats.length).toFixed(1));
  }, [stats]);

  const fastestTech = useMemo(() => {
    if (stats.length === 0) return null;
    return [...stats].sort((a, b) => a.avgTurnaroundHours - b.avgTurnaroundHours)[0];
  }, [stats]);

  const fleetCompliance = useMemo(() => {
    if (stats.length === 0) return 100;
    const sum = stats.reduce((acc, curr) => acc + curr.slaCompliancePct, 0);
    return Math.round(sum / stats.length);
  }, [stats]);

  // Dynamic bar color based on turnaround speed relative to 24h SLA target
  const getBarColor = (hours: number) => {
    if (hours <= 4.0) return '#10b981'; // Fast (emerald)
    if (hours <= 8.0) return '#3b82f6'; // Standard (blue)
    if (hours <= 16.0) return '#f59e0b'; // Moderate (amber)
    return '#ef4444'; // Near SLA threshold (red)
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4 ${className}`}
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Service Request Turnaround Time by Technician
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Target SLA: 24.0h
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Average duration from customer ticket creation to on-site resolution & digital signoff.
              </p>
            </div>
          </div>
        </div>

        {/* View & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Metric Selector */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMetricMode('turnaround')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                metricMode === 'turnaround'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Avg Hours (TAT)
            </button>
            <button
              onClick={() => setMetricMode('volume')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                metricMode === 'volume'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tickets Resolved
            </button>
            <button
              onClick={() => setMetricMode('compliance')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                metricMode === 'compliance'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              SLA Adherence %
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="fastest">Fastest Turnaround</option>
            <option value="jobs">Most Resolved Tickets</option>
            <option value="compliance">Highest SLA Compliance</option>
            <option value="rating">Top CSAT Rating</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fleet Avg TAT</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
            {fleetAvgHours} <span className="text-xs font-normal text-slate-400">hours</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <ArrowDownRight className="w-3 h-3" />
            <span>Well below 24h SLA</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Field Performer</div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
            {fastestTech ? fastestTech.technicianName : 'N/A'}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
            {fastestTech ? `${fastestTech.avgTurnaroundHours} hrs avg` : ''}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tickets Closed</div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
            {totalResolved} <span className="text-xs font-normal text-slate-400">tickets</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Across 5 field technicians</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SLA Adherence Rate</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {fleetCompliance}%
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Standard 24-hr SLA</div>
        </div>
      </div>

      {/* Main Recharts Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 20, left: -5, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="shortName"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit={metricMode === 'turnaround' ? 'h' : metricMode === 'compliance' ? '%' : ''}
              domain={
                metricMode === 'turnaround'
                  ? [0, 26]
                  : metricMode === 'compliance'
                  ? [80, 100]
                  : ['auto', 'auto']
              }
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg text-xs space-y-1.5 min-w-[200px]">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span>{d.name}</span>
                      <span className="text-amber-500 font-semibold">★ {d.rating}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{d.truckPlate}</div>
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-500">Avg Turnaround Time:</span>
                        <span className="text-blue-600 font-bold">{d.avgHours} hours</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Fastest Resolution:</span>
                        <span className="text-emerald-600 font-semibold">{d.fastestHours} hours</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Tickets Resolved:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{d.resolved} closed</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">SLA Compliance:</span>
                        <span className="text-emerald-600 font-bold">{d.slaCompliance}%</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* 24-Hour SLA Reference Line (Shown in Turnaround mode) */}
            {metricMode === 'turnaround' && (
              <ReferenceLine
                y={24}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: '24h SLA Target',
                  position: 'top',
                  fill: '#ef4444',
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
              />
            )}

            {metricMode === 'turnaround' && (
              <Bar
                dataKey="avgHours"
                name="Average Turnaround Time (Hours)"
                radius={[6, 6, 0, 0]}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={getBarColor(entry.avgHours)}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={() => onSelectTechnician?.(entry.id)}
                  />
                ))}
              </Bar>
            )}

            {metricMode === 'volume' && (
              <Bar
                dataKey="resolved"
                name="Total Tickets Resolved"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />
            )}

            {metricMode === 'compliance' && (
              <Bar
                dataKey="slaCompliance"
                name="SLA Adherence %"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Technician Breakdown Grid */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Technician SLA & Efficiency Breakdown
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
          {chartData.map((tech, idx) => (
            <div
              key={tech.id}
              onClick={() => onSelectTechnician?.(tech.id)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-400 transition-colors cursor-pointer space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <img
                  src={tech.avatar}
                  alt={tech.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="truncate flex-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{tech.name}</div>
                  <div className="text-[10px] text-slate-400">★ {tech.rating}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Avg TAT:</span>
                <span className="font-black text-blue-600 dark:text-blue-400">{tech.avgHours}h</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Resolved: {tech.resolved}</span>
                <span className="text-emerald-600 font-semibold">{tech.slaCompliance}% SLA</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
