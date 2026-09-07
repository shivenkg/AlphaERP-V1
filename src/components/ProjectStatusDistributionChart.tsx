import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { Layers, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Project, ProjectStatus } from '../types';

interface ProjectStatusDistributionChartProps {
  projects: Project[];
  onNavigate?: (tab: string) => void;
  className?: string;
}

export type DistributionMode = 'count' | 'value';

export const ALL_PROJECT_STATUSES: Array<{
  status: ProjectStatus;
  label: string;
  shortLabel: string;
  abbr: string;
  color: string;
  bgBadge: string;
  textBadge: string;
  borderColor: string;
}> = [
  {
    status: 'Planning & Engineering',
    label: 'Planning & Engineering',
    shortLabel: 'Engineering',
    abbr: 'Eng',
    color: '#6366f1', // Indigo
    bgBadge: 'bg-indigo-50',
    textBadge: 'text-indigo-700',
    borderColor: 'border-indigo-200'
  },
  {
    status: 'Procurement',
    label: 'Procurement & Materials',
    shortLabel: 'Procurement',
    abbr: 'Proc',
    color: '#f59e0b', // Amber
    bgBadge: 'bg-amber-50',
    textBadge: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  {
    status: 'Installation',
    label: 'Installation & Erection',
    shortLabel: 'Installation',
    abbr: 'Inst',
    color: '#3b82f6', // Blue
    bgBadge: 'bg-blue-50',
    textBadge: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  {
    status: 'Testing & Commissioning',
    label: 'Testing & Commissioning',
    shortLabel: 'Commissioning',
    abbr: 'Comm',
    color: '#8b5cf6', // Purple
    bgBadge: 'bg-purple-50',
    textBadge: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  {
    status: 'Handover & Closed',
    label: 'Handover & Closed',
    shortLabel: 'Completed',
    abbr: 'Done',
    color: '#10b981', // Emerald
    bgBadge: 'bg-emerald-50',
    textBadge: 'text-emerald-700',
    borderColor: 'border-emerald-200'
  }
];

const DEFAULT_CONFIG = {
  label: 'Other',
  shortLabel: 'Other',
  abbr: 'Oth',
  color: '#94a3b8',
  bgBadge: 'bg-slate-50',
  textBadge: 'text-slate-700',
  borderColor: 'border-slate-200'
};

export const ProjectStatusDistributionChart: React.FC<ProjectStatusDistributionChartProps> = ({
  projects,
  onNavigate,
  className = ''
}) => {
  const [distributionMode, setDistributionMode] = useState<DistributionMode>('count');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalContractSum = useMemo(
    () => projects.reduce((sum, p) => sum + (p.contractValue || 0), 0),
    [projects]
  );
  const totalProjectsCount = projects.length;
  const totalOrderBookCr = (totalContractSum / 10000000).toFixed(2);
  const totalOrderBookLakhs = (totalContractSum / 100000).toFixed(2);

  // Group projects by status
  const { activeGroups, allStageMetrics } = useMemo(() => {
    const groupsMap: Record<
      string,
      {
        status: string;
        count: number;
        totalValue: number;
        avgProgress: number;
        shortageCount: number;
        projectNames: string[];
      }
    > = {};

    projects.forEach((p) => {
      const statusKey = p.status || 'Planning & Engineering';
      if (!groupsMap[statusKey]) {
        groupsMap[statusKey] = {
          status: statusKey,
          count: 0,
          totalValue: 0,
          avgProgress: 0,
          shortageCount: 0,
          projectNames: []
        };
      }
      groupsMap[statusKey].count += 1;
      groupsMap[statusKey].totalValue += p.contractValue || 0;
      groupsMap[statusKey].avgProgress += p.progressPct || 0;
      groupsMap[statusKey].shortageCount += p.totalShortageItemsCount || 0;
      groupsMap[statusKey].projectNames.push(p.projectName);
    });

    const activeList = Object.values(groupsMap).map((group) => {
      const stageConfig = ALL_PROJECT_STATUSES.find((s) => s.status === group.status) || DEFAULT_CONFIG;
      const valueLakhs = Number((group.totalValue / 100000).toFixed(2));
      const countPct = totalProjectsCount > 0 ? Number(((group.count / totalProjectsCount) * 100).toFixed(1)) : 0;
      const valuePct = totalContractSum > 0 ? Number(((group.totalValue / totalContractSum) * 100).toFixed(1)) : 0;

      return {
        name: stageConfig.shortLabel,
        fullLabel: stageConfig.label,
        statusKey: group.status,
        count: group.count,
        value: distributionMode === 'count' ? group.count : (valueLakhs > 0 ? valueLakhs : 0.01),
        rawTotalValue: group.totalValue,
        valueLakhs,
        countPct,
        valuePct,
        avgProgress: group.count > 0 ? Math.round(group.avgProgress / group.count) : 0,
        shortageCount: group.shortageCount,
        projectNames: group.projectNames,
        color: stageConfig.color,
        bgBadge: stageConfig.bgBadge,
        textBadge: stageConfig.textBadge,
        borderColor: stageConfig.borderColor
      };
    });

    // Overview across all 5 standard stages
    const allStages = ALL_PROJECT_STATUSES.map((stage) => {
      const grp = groupsMap[stage.status];
      const count = grp ? grp.count : 0;
      const totalVal = grp ? grp.totalValue : 0;
      return {
        ...stage,
        count,
        valueLakhs: Number((totalVal / 100000).toFixed(1)),
        avgProgress: grp && grp.count > 0 ? Math.round(grp.avgProgress / grp.count) : 0,
        shortageCount: grp ? grp.shortageCount : 0
      };
    });

    return { activeGroups: activeList, allStageMetrics: allStages };
  }, [projects, distributionMode, totalProjectsCount, totalContractSum]);

  // Custom Tooltip for Recharts Pie
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[210px] z-50">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5 font-bold">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-slate-100">{data.statusKey}</span>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span>Projects:</span>
            <span className="font-bold text-white font-mono">{data.count} ({data.countPct}%)</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Contract Value:</span>
            <span className="font-bold text-emerald-400 font-mono">₹{data.valueLakhs} L ({data.valuePct}%)</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>Avg Progress:</span>
            <span className="font-bold text-blue-400">{data.avgProgress}%</span>
          </div>

          {data.shortageCount > 0 && (
            <div className="flex items-center justify-between text-amber-300 pt-1 border-t border-slate-800/80">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>BOQ Shortages:</span>
              </span>
              <span className="font-bold font-mono">{data.shortageCount} SKUs</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full ${className}`}>
      {/* Header Controls */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider truncate">
                Project Status Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 hidden xs:block truncate">
                Live lifecycle stage breakdown across contracts & execution
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-medium text-slate-600 shrink-0">
            <button
              onClick={() => setDistributionMode('count')}
              className={`px-3 py-1 rounded-lg transition-all text-xs ${
                distributionMode === 'count'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              By Count
            </button>
            <button
              onClick={() => setDistributionMode('value')}
              className={`px-3 py-1 rounded-lg transition-all text-xs ${
                distributionMode === 'value'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              By Value (₹)
            </button>
          </div>
        </div>

        {/* 5-Stage Compact Pipeline Indicator Strip */}
        <div className="grid grid-cols-5 gap-1.5 mt-3.5">
          {allStageMetrics.map((stage) => {
            const hasProjects = stage.count > 0;
            return (
              <div
                key={stage.status}
                onClick={() => onNavigate && onNavigate('projects')}
                className={`py-1.5 px-1 rounded-lg text-center cursor-pointer transition-all border ${
                  hasProjects
                    ? `${stage.bgBadge} ${stage.borderColor} shadow-2xs`
                    : 'bg-slate-50/70 border-slate-100 opacity-60 hover:opacity-100'
                }`}
                title={`${stage.label}: ${stage.count} Projects, ₹${stage.valueLakhs} L`}
              >
                <div className="text-[10px] font-bold truncate text-slate-700">
                  <span className="hidden sm:inline">{stage.shortLabel}</span>
                  <span className="sm:hidden">{stage.abbr}</span>
                </div>
                <div className={`text-xs font-mono font-extrabold ${hasProjects ? stage.textBadge : 'text-slate-400'}`}>
                  {stage.count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content: Donut Chart on Left, Full Cards on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center mt-4 mb-2">
          {/* Left Donut Area */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[190px]">
            <div className="w-full h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeGroups.length > 0 ? activeGroups : [{ name: 'None', value: 1, color: '#e2e8f0' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={74}
                    paddingAngle={activeGroups.length > 1 ? 4 : 0}
                    dataKey="value"
                    onMouseEnter={(_, idx) => setActiveIndex(idx)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {activeGroups.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={activeIndex === index ? 3 : 2}
                        style={{
                          filter: activeIndex === index ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Center Callout Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                {distributionMode === 'count' ? 'Active Projects' : 'Order Book'}
              </span>
              <span className="text-xl font-extrabold font-mono text-slate-900 leading-tight">
                {distributionMode === 'count' ? totalProjectsCount : `₹${totalOrderBookCr} Cr`}
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                {distributionMode === 'count' ? `₹${totalOrderBookLakhs} L Total` : `${totalProjectsCount} Contracts`}
              </span>
            </div>
          </div>

          {/* Right Status Breakdown Cards */}
          <div className="lg:col-span-7 space-y-2.5">
            {activeGroups.map((item, idx) => (
              <div
                key={item.statusKey}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => onNavigate && onNavigate('projects')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  activeIndex === idx
                    ? 'bg-slate-50 border-slate-300 shadow-xs ring-1 ring-slate-300/50'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Line 1: Status Name + Count Badge + Progress */}
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.name || item.statusKey}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold shrink-0 ${item.bgBadge} ${item.textBadge} border ${item.borderColor}`}>
                      {item.count} {item.count === 1 ? 'Proj' : 'Projects'}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-700 shrink-0 font-mono ml-auto">
                    {item.avgProgress}% Done
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(5, item.avgProgress)}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>

                {/* Line 2: Contract Value & Shortage Alert */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2 text-[11px]">
                  <div className="text-slate-500 font-medium truncate flex-1 min-w-[120px]">
                    Val: <strong className="font-mono font-bold text-slate-800">₹{item.valueLakhs} L</strong>
                    <span className="text-slate-400 ml-1">
                      ({distributionMode === 'count' ? `${item.countPct}%` : `${item.valuePct}%`})
                    </span>
                  </div>

                  <div className="shrink-0 ml-auto">
                    {item.shortageCount > 0 ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span>{item.shortageCount} Shortages</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>100% In-Stock</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer link to Projects tab */}
      <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 text-[11px]">
          Click any project phase to inspect line-by-line BOQ and orders
        </span>
        {onNavigate && (
          <button
            onClick={() => onNavigate('projects')}
            className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 shrink-0 text-xs transition-colors"
          >
            <span>Open Projects & BOQ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
