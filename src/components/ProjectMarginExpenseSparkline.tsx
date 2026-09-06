import React, { useState } from 'react';
import { TrendingUp, DollarSign, Activity, AlertCircle, CheckCircle, BarChart2, LineChart, ShieldCheck } from 'lucide-react';
import { Project } from '../types';

interface ProjectMarginExpenseSparklineProps {
  project: Project;
  compact?: boolean;
  defaultMode?: 'bar' | 'sparkline';
  className?: string;
}

export const ProjectMarginExpenseSparkline: React.FC<ProjectMarginExpenseSparklineProps> = ({
  project,
  compact = true,
  defaultMode = 'bar',
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'bar' | 'sparkline'>(defaultMode);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const contractVal = project.contractValue || 1;
  const estimatedCost = project.totalEstimatedCost || (contractVal * 0.7);
  const estimatedProfit = Math.max(0, contractVal - estimatedCost);
  const rawTargetMargin = typeof project.targetMarginPct === 'number'
    ? project.targetMarginPct
    : ((estimatedProfit / contractVal) * 100);
  const targetMarginPct = Number(rawTargetMargin.toFixed(2));

  // Compute actual expenses from project property or POs or fallback
  const actualExpenses = project.actualExpenses ?? project.actualCost ?? Math.round(estimatedCost * (project.progressPct / 100) * 0.95);
  const expenseBurnPct = Math.min(100, Math.max(0, (actualExpenses / estimatedCost) * 100));
  const remainingBudget = Math.max(0, estimatedCost - actualExpenses);
  const currentNetMargin = Math.max(0, contractVal - actualExpenses);
  const currentNetMarginPct = Number(((currentNetMargin / contractVal) * 100).toFixed(2));

  // Health evaluation
  const isOverBudget = actualExpenses > estimatedCost;
  const progressRatio = (project.progressPct || 20) / 100;
  const expectedBurnAtProgress = estimatedCost * progressRatio;
  const burnVariance = actualExpenses - expectedBurnAtProgress;

  let healthColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let healthLabel = 'Margin Healthy';
  if (isOverBudget) {
    healthColor = 'text-rose-700 bg-rose-50 border-rose-200';
    healthLabel = 'Budget Overrun';
  } else if (burnVariance > estimatedCost * 0.15 && project.progressPct < 80) {
    healthColor = 'text-amber-700 bg-amber-50 border-amber-200';
    healthLabel = 'High Expense Burn';
  }

  // Milestone points for SVG sparkline
  const milestones = project.expenseMilestones && project.expenseMilestones.length > 0
    ? project.expenseMilestones.map(m => ({
        ...m,
        projectedMarginPct: Number(m.projectedMarginPct.toFixed(2))
      }))
    : [
        { phase: 'M1', label: 'Kickoff', budgetCost: estimatedCost * 0.1, actualExpense: actualExpenses * 0.15, projectedMarginPct: Number((targetMarginPct + 3).toFixed(2)) },
        { phase: 'M2', label: 'Procurement', budgetCost: estimatedCost * 0.45, actualExpense: actualExpenses * 0.65, projectedMarginPct: Number((targetMarginPct + 1.5).toFixed(2)) },
        { phase: 'M3', label: 'Installation', budgetCost: estimatedCost * 0.75, actualExpense: actualExpenses * 0.85, projectedMarginPct: targetMarginPct },
        { phase: 'M4', label: 'Testing', budgetCost: estimatedCost * 0.9, actualExpense: actualExpenses * 0.95, projectedMarginPct: Number((targetMarginPct - 0.5).toFixed(2)) },
        { phase: 'M5', label: 'Handover', budgetCost: estimatedCost, actualExpense: actualExpenses, projectedMarginPct: targetMarginPct }
      ];

  // SVG dimensions for Sparkline
  const svgWidth = compact ? 220 : 360;
  const svgHeight = compact ? 42 : 64;
  const paddingX = 14;
  const paddingY = 8;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;

  // Max value for scaling
  const maxVal = Math.max(
    ...milestones.map((m) => Math.max(m.budgetCost, m.actualExpense, contractVal * 0.4))
  );

  const getCoordinates = (index: number, value: number) => {
    const x = paddingX + (index / (milestones.length - 1)) * usableWidth;
    const y = svgHeight - paddingY - (value / (maxVal || 1)) * usableHeight;
    return { x, y: Math.max(paddingY, Math.min(svgHeight - paddingY, y)) };
  };

  const actualPoints = milestones.map((m, idx) => getCoordinates(idx, m.actualExpense));
  const budgetPoints = milestones.map((m, idx) => getCoordinates(idx, m.budgetCost));

  // Build SVG path
  const buildSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const actualPath = buildSmoothPath(actualPoints);
  const budgetPath = buildSmoothPath(budgetPoints);

  // Area under actual expense path
  const actualAreaPath = `${actualPath} L ${actualPoints[actualPoints.length - 1].x} ${svgHeight - paddingY} L ${actualPoints[0].x} ${svgHeight - paddingY} Z`;

  const formatLakhs = (val: number) => {
    return `₹${(val / 100000).toFixed(1)}L`;
  };

  if (compact) {
    return (
      <div className={`mt-2.5 pt-2 border-t border-slate-100/90 text-xs ${className}`}>
        {/* Header Bar within Mini Card with Toggle */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-bold text-slate-700 tracking-tight flex items-center gap-1 truncate">
              <Activity className="w-3 h-3 text-indigo-600 flex-shrink-0" />
              <span>Est. Margin vs Expense</span>
            </span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${healthColor} whitespace-nowrap`}>
              {targetMarginPct.toFixed(2)}% Margin
            </span>
          </div>

          {/* Mini View Mode Toggle */}
          <div
            className="flex items-center bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/80 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewMode('bar');
              }}
              title="Mini Bar Chart View"
              className={`p-1 rounded text-[9px] font-bold transition-all ${
                viewMode === 'bar'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart2 className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewMode('sparkline');
              }}
              title="Mini Sparkline Trend View"
              className={`p-1 rounded text-[9px] font-bold transition-all ${
                viewMode === 'sparkline'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LineChart className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {viewMode === 'bar' ? (
          /* Mini Comparative Bar Chart View */
          <div className="space-y-1.5">
            {/* Target Margin Row */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Target Profit Margin:
                </span>
                <span className="font-mono font-bold text-emerald-700">
                  {targetMarginPct.toFixed(2)}% ({formatLakhs(estimatedProfit)})
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, targetMarginPct * 2.5)}%` }}
                />
              </div>
            </div>

            {/* Actual Expenses Recorded Row */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                  Actual Expenses So Far:
                </span>
                <span className="font-mono font-bold text-indigo-700">
                  {formatLakhs(actualExpenses)}{' '}
                  <span className="text-[9px] font-normal text-slate-500">({expenseBurnPct.toFixed(0)}% budget)</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOverBudget ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${expenseBurnPct}%` }}
                />
              </div>
            </div>

            {/* Ratio Summary Strip */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5 border-t border-slate-100/60 font-medium">
              <span>Budget: <strong className="text-slate-700">{formatLakhs(estimatedCost)}</strong></span>
              <span>•</span>
              <span>Exp. Spent: <strong className="text-indigo-600">{formatLakhs(actualExpenses)}</strong></span>
              <span>•</span>
              <span>Buffer: <strong className="text-emerald-600">{formatLakhs(remainingBudget)}</strong></span>
            </div>
          </div>
        ) : (
          /* Mini Sparkline Line Chart View */
          <div className="relative pt-0.5">
            <div className="flex items-center justify-between text-[9px] text-slate-500 mb-0.5 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-indigo-600 inline-block rounded" /> Actual Exp ({formatLakhs(actualExpenses)})
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <span className="w-2 h-0.5 bg-emerald-500 inline-block rounded" /> Margin ({targetMarginPct.toFixed(2)}%)
              </span>
            </div>

            <div className="w-full bg-slate-50/90 rounded-lg p-1 border border-slate-100 overflow-hidden relative">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-9 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={`grad-actual-${project.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id={`grad-margin-${project.id}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                {/* Target Baseline Grid Line */}
                <line
                  x1={paddingX}
                  y1={svgHeight - paddingY - (targetMarginPct / 100) * usableHeight * 1.5}
                  x2={svgWidth - paddingX}
                  y2={svgHeight - paddingY - (targetMarginPct / 100) * usableHeight * 1.5}
                  stroke="#10b981"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                  opacity="0.6"
                />

                {/* Actual Expense Area Fill */}
                <path d={actualAreaPath} fill={`url(#grad-actual-${project.id})`} />

                {/* Budget Planned Path */}
                <path
                  d={budgetPath}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />

                {/* Actual Expense Stroke */}
                <path
                  d={actualPath}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {actualPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === i ? 3.5 : 2}
                    fill={hoveredIndex === i ? '#4338ca' : '#6366f1'}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                ))}
              </svg>

              {/* Hover Tooltip if point hovered */}
              {hoveredIndex !== null && milestones[hoveredIndex] && (
                <div className="absolute top-1 right-2 bg-slate-900/90 text-white text-[9px] px-2 py-0.5 rounded shadow-md pointer-events-none z-10 flex items-center gap-1.5 font-mono">
                  <span>{milestones[hoveredIndex].label}:</span>
                  <span className="text-amber-300 font-bold">{formatLakhs(milestones[hoveredIndex].actualExpense)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono mt-0.5 px-0.5">
              <span>M1 Kickoff</span>
              <span>M3 Erect</span>
              <span>M5 Handover</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Expanded Mode (For Project Details Banner)
  return (
    <div className={`bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 space-y-3 ${className}`}>
      {/* Header with Title and Mode Switcher */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900">Profit Margin & Expense Health Tracker</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${healthColor}`}>
              {healthLabel}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time margin preservation against recorded procurement and site expense outlays.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('bar')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'bar'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Comparative Bars</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('sparkline')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'sparkline'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Milestone Sparkline</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Contract Value</div>
          <div className="text-xs font-bold text-slate-900 mt-0.5 font-mono">
            {formatLakhs(contractVal)}
          </div>
          <div className="text-[9px] text-slate-400">Awarded Revenue</div>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Est. Margin Target</div>
          <div className="text-xs font-bold text-emerald-600 mt-0.5 font-mono">
            {targetMarginPct.toFixed(2)}% ({formatLakhs(estimatedProfit)})
          </div>
          <div className="text-[9px] text-emerald-600 font-medium">Locked in Estimation</div>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Actual Expenses Spent</div>
          <div className="text-xs font-bold text-indigo-600 mt-0.5 font-mono">
            {formatLakhs(actualExpenses)}
          </div>
          <div className="text-[9px] text-indigo-600 font-medium">{expenseBurnPct.toFixed(2)}% of cost budget</div>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Current Realized Margin</div>
          <div className="text-xs font-bold text-blue-600 mt-0.5 font-mono">
            {currentNetMarginPct.toFixed(2)}% ({formatLakhs(currentNetMargin)})
          </div>
          <div className="text-[9px] text-slate-400">Gross Margin Retained</div>
        </div>
      </div>

      {/* Dynamic Visual Content */}
      {viewMode === 'bar' ? (
        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                Target Margin Baseline:
              </span>
              <span className="font-mono font-bold text-emerald-700">
                {targetMarginPct.toFixed(2)}% Target ({formatLakhs(estimatedProfit)})
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, targetMarginPct * 2.5)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block" />
                Actual Expenses Recorded vs Cost Budget:
              </span>
              <span className="font-mono font-bold text-indigo-700">
                {formatLakhs(actualExpenses)} / {formatLakhs(estimatedCost)} ({expenseBurnPct.toFixed(2)}% consumed)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOverBudget ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600'
                }`}
                style={{ width: `${expenseBurnPct}%` }}
              />
            </div>
          </div>

          {/* Segmented Revenue Breakdown Bar */}
          <div className="pt-1">
            <div className="text-[11px] font-semibold text-slate-600 mb-1">Contract Revenue Allocation Split</div>
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
              <div
                title={`Actual Expenses: ${formatLakhs(actualExpenses)}`}
                className="bg-indigo-600 h-full transition-all"
                style={{ width: `${(actualExpenses / contractVal) * 100}%` }}
              />
              <div
                title={`Remaining Budget: ${formatLakhs(remainingBudget)}`}
                className="bg-slate-300 h-full transition-all"
                style={{ width: `${(remainingBudget / contractVal) * 100}%` }}
              />
              <div
                title={`Target Profit Margin: ${formatLakhs(estimatedProfit)}`}
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${(estimatedProfit / contractVal) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-indigo-600" /> Spent: {formatLakhs(actualExpenses)}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-slate-300" /> Rem. Budget: {formatLakhs(remainingBudget)}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-500" /> Margin: {formatLakhs(estimatedProfit)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-bold text-indigo-700">
                <span className="w-2.5 h-1 bg-indigo-600 inline-block rounded" /> Cumulative Expenses ({formatLakhs(actualExpenses)})
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-1 bg-slate-300 inline-block rounded" /> Planned Budget Baseline
              </span>
            </div>
            <span className="flex items-center gap-1 font-bold text-emerald-700">
              <span className="w-2.5 h-1 bg-emerald-500 inline-block rounded" /> Projected Profit Margin ({targetMarginPct.toFixed(2)}%)
            </span>
          </div>

          <div className="w-full bg-slate-50 rounded-xl p-2 border border-slate-100 overflow-hidden relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-16 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`grad-actual-exp-${project.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Target Margin Reference Line */}
              <line
                x1={paddingX}
                y1={svgHeight - paddingY - (targetMarginPct / 100) * usableHeight * 1.5}
                x2={svgWidth - paddingX}
                y2={svgHeight - paddingY - (targetMarginPct / 100) * usableHeight * 1.5}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Area under curve */}
              <path d={actualAreaPath} fill={`url(#grad-actual-exp-${project.id})`} />

              {/* Budget curve */}
              <path
                d={budgetPath}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Actual expense curve */}
              <path
                d={actualPath}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Nodes */}
              {actualPoints.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === i ? 4.5 : 3}
                    fill={hoveredIndex === i ? '#4338ca' : '#6366f1'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredIndex !== null && milestones[hoveredIndex] && (
              <div className="absolute top-2 right-3 bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-lg shadow-lg pointer-events-none z-10 flex items-center gap-2 font-mono">
                <span className="font-sans text-slate-300 font-bold">{milestones[hoveredIndex].label}:</span>
                <span className="text-amber-300 font-bold">{formatLakhs(milestones[hoveredIndex].actualExpense)}</span>
                <span className="text-slate-400">|</span>
                <span className="text-emerald-400">{milestones[hoveredIndex].projectedMarginPct.toFixed(2)}% Margin</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium px-1">
            {milestones.map((m, idx) => (
              <span key={idx} className="text-center">
                <strong className="text-slate-700 block">{m.phase}</strong>
                <span className="text-[9px] text-slate-400 hidden sm:inline">{m.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
