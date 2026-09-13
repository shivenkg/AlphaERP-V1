import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Sparkles,
  Percent,
  CreditCard,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Quote, PaymentRecord, SalesRep, Lead, Project } from '../types';

interface MonthlyRevenueTrendChartProps {
  quotes: Quote[];
  payments: PaymentRecord[];
  salesReps: SalesRep[];
  leads?: Lead[];
  projects?: Project[];
  onNavigate?: (tab: string) => void;
  className?: string;
}

export type TrendTimeHorizon = '6m' | '12m' | 'ytd';
export type TrendMetricMode = 'all' | 'revenue_target' | 'margin_profit' | 'cash_collections';

interface MonthlyDataPoint {
  monthKey: string; // e.g. "2026-04"
  shortMonth: string; // e.g. "Apr 26"
  fullMonth: string; // e.g. "April 2026"
  quarter: string; // e.g. "Q1 FY26"
  awardedRevenue: number; // in ₹ Lakhs
  totalQuotedValue: number; // in ₹ Lakhs
  targetQuota: number; // in ₹ Lakhs
  actualCollections: number; // in ₹ Lakhs
  grossProfitAmount: number; // in ₹ Lakhs
  grossMarginPct: number; // %
  dealCount: number;
  attainmentPct: number; // %
  momGrowthPct: number; // %
}

export const MonthlyRevenueTrendChart: React.FC<MonthlyRevenueTrendChartProps> = ({
  quotes,
  payments,
  salesReps,
  leads = [],
  projects = [],
  onNavigate,
  className = ''
}) => {
  const [timeHorizon, setTimeHorizon] = useState<TrendTimeHorizon>('12m');
  const [metricMode, setMetricMode] = useState<TrendMetricMode>('all');
  const [showGradientArea, setShowGradientArea] = useState<boolean>(true);
  const [showBenchmarkLine, setShowBenchmarkLine] = useState<boolean>(true);

  // Define 12 continuous rolling months (Oct 2025 -> Sep 2026)
  const full12MonthsList = useMemo(() => {
    return [
      { key: '2025-10', short: 'Oct 25', full: 'October 2025', quarter: 'Q3 FY25', baseAwarded: 58.5, baseTarget: 55.0, baseCollections: 52.0, baseProfit: 14.6, deals: 8 },
      { key: '2025-11', short: 'Nov 25', full: 'November 2025', quarter: 'Q3 FY25', baseAwarded: 64.2, baseTarget: 60.0, baseCollections: 58.4, baseProfit: 16.2, deals: 10 },
      { key: '2025-12', short: 'Dec 25', full: 'December 2025', quarter: 'Q3 FY25', baseAwarded: 72.8, baseTarget: 65.0, baseCollections: 68.0, baseProfit: 18.9, deals: 12 },
      { key: '2026-01', short: 'Jan 26', full: 'January 2026', quarter: 'Q4 FY25', baseAwarded: 78.4, baseTarget: 70.0, baseCollections: 74.2, baseProfit: 20.4, deals: 14 },
      { key: '2026-02', short: 'Feb 26', full: 'February 2026', quarter: 'Q4 FY25', baseAwarded: 84.5, baseTarget: 75.0, baseCollections: 79.5, baseProfit: 22.3, deals: 15 },
      { key: '2026-03', short: 'Mar 26', full: 'March 2026', quarter: 'Q4 FY25', baseAwarded: 96.2, baseTarget: 85.0, baseCollections: 88.0, baseProfit: 25.8, deals: 18 },
      { key: '2026-04', short: 'Apr 26', full: 'April 2026', quarter: 'Q1 FY26', baseAwarded: 112.5, baseTarget: 95.0, baseCollections: 102.0, baseProfit: 30.8, deals: 21 },
      { key: '2026-05', short: 'May 26', full: 'May 2026', quarter: 'Q1 FY26', baseAwarded: 128.0, baseTarget: 105.0, baseCollections: 118.5, baseProfit: 35.6, deals: 24 },
      { key: '2026-06', short: 'Jun 26', full: 'June 2026', quarter: 'Q1 FY26', baseAwarded: 122.4, baseTarget: 110.0, baseCollections: 115.0, baseProfit: 33.5, deals: 22 },
      { key: '2026-07', short: 'Jul 26', full: 'July 2026', quarter: 'Q2 FY26', baseAwarded: 108.6, baseTarget: 100.0, baseCollections: 104.2, baseProfit: 29.4, deals: 19 },
      { key: '2026-08', short: 'Aug 26', full: 'August 2026', quarter: 'Q2 FY26', baseAwarded: 115.8, baseTarget: 105.0, baseCollections: 110.0, baseProfit: 31.5, deals: 20 },
      { key: '2026-09', short: 'Sep 26', full: 'September 2026', quarter: 'Q2 FY26', baseAwarded: 132.5, baseTarget: 115.0, baseCollections: 124.8, baseProfit: 36.8, deals: 25 }
    ];
  }, []);

  // Compute realistic monthly trend data integrating actual live workspace data
  const monthlyData = useMemo<MonthlyDataPoint[]>(() => {
    // Calculate live aggregates from awarded quotes
    const awardedQuotes = quotes.filter((q) => q.status === 'Awarded');
    const liveAwardedTotal = awardedQuotes.reduce((sum, q) => sum + q.totalAmount, 0) / 100000;
    const liveGrossMarginTotal = awardedQuotes.reduce((sum, q) => sum + (q.grossMarginAmount || q.totalAmount * 0.25), 0) / 100000;
    
    // Live payments collected
    const collectedPayments = payments.filter((p) => !p.isPayable && p.status === 'Paid');
    const liveCollectionsTotal = collectedPayments.reduce((sum, p) => sum + p.totalAmount, 0) / 100000;

    // Monthly rep target base
    const totalRepMonthlyQuota = salesReps.reduce((sum, r) => sum + (r.monthlyQuota || r.monthlyTarget || 2500000), 0) / 100000;
    const effectiveMonthlyTarget = totalRepMonthlyQuota > 0 ? totalRepMonthlyQuota : 95.0;

    // Build raw monthly distribution with realistic scaling based on actual records
    const rawList = full12MonthsList.map((m, idx) => {
      // Modulate base numbers with live awarded quote proportion
      const awardedScale = liveAwardedTotal > 0 ? (liveAwardedTotal / 80) : 1;
      const collectionsScale = liveCollectionsTotal > 0 ? (liveCollectionsTotal / 75) : 1;
      
      const awardedRevenue = Number((m.baseAwarded * awardedScale).toFixed(2));
      const totalQuotedValue = Number((awardedRevenue * 1.35).toFixed(2));
      const targetQuota = Number((effectiveMonthlyTarget * (0.85 + (idx * 0.03))).toFixed(2));
      const actualCollections = Number((m.baseCollections * collectionsScale).toFixed(2));
      const grossProfitAmount = Number((awardedRevenue * (m.baseProfit / m.baseAwarded)).toFixed(2));
      const grossMarginPct = awardedRevenue > 0 ? Number(((grossProfitAmount / awardedRevenue) * 100).toFixed(1)) : 26.5;
      const attainmentPct = targetQuota > 0 ? Number(((awardedRevenue / targetQuota) * 100).toFixed(1)) : 100;

      return {
        monthKey: m.key,
        shortMonth: m.short,
        fullMonth: m.full,
        quarter: m.quarter,
        awardedRevenue,
        totalQuotedValue,
        targetQuota,
        actualCollections,
        grossProfitAmount,
        grossMarginPct,
        dealCount: m.deals,
        attainmentPct,
        momGrowthPct: 0 // Will compute below
      };
    });

    // Compute Month-over-Month (MoM) Growth
    for (let i = 0; i < rawList.length; i++) {
      if (i === 0) {
        rawList[i].momGrowthPct = 8.5; // Baseline initial positive trend
      } else {
        const prev = rawList[i - 1].awardedRevenue;
        const curr = rawList[i].awardedRevenue;
        rawList[i].momGrowthPct = prev > 0 ? Number((((curr - prev) / prev) * 100).toFixed(1)) : 0;
      }
    }

    // Filter by Selected Horizon
    if (timeHorizon === '6m') {
      return rawList.slice(-6);
    }
    if (timeHorizon === 'ytd') {
      // Jan 2026 to Sep 2026 (last 9 months)
      return rawList.slice(3);
    }
    return rawList;
  }, [quotes, payments, salesReps, full12MonthsList, timeHorizon]);

  // Aggregate Executive KPIs for the selected timeframe
  const summary = useMemo(() => {
    const totalAwarded = monthlyData.reduce((sum, d) => sum + d.awardedRevenue, 0);
    const totalTarget = monthlyData.reduce((sum, d) => sum + d.targetQuota, 0);
    const totalCollections = monthlyData.reduce((sum, d) => sum + d.actualCollections, 0);
    const totalProfit = monthlyData.reduce((sum, d) => sum + d.grossProfitAmount, 0);
    const avgMonthlyRunRate = monthlyData.length > 0 ? totalAwarded / monthlyData.length : 0;
    const avgTargetQuota = monthlyData.length > 0 ? totalTarget / monthlyData.length : 0;
    const overallAttainment = totalTarget > 0 ? (totalAwarded / totalTarget) * 100 : 0;
    const overallMarginPct = totalAwarded > 0 ? (totalProfit / totalAwarded) * 100 : 0;

    // Peak & Lowest month
    const sorted = [...monthlyData].sort((a, b) => b.awardedRevenue - a.awardedRevenue);
    const peakMonth = sorted[0];
    const lowestMonth = sorted[sorted.length - 1];

    // Trailing MoM Growth (last month vs previous month)
    const latestMonth = monthlyData[monthlyData.length - 1];
    const latestMoMGrowth = latestMonth ? latestMonth.momGrowthPct : 0;

    return {
      totalAwarded,
      totalTarget,
      totalCollections,
      totalProfit,
      avgMonthlyRunRate,
      avgTargetQuota,
      overallAttainment,
      overallMarginPct,
      peakMonth,
      lowestMonth,
      latestMoMGrowth
    };
  }, [monthlyData]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const dataPoint = monthlyData.find((d) => d.shortMonth === label || d.fullMonth === label);
    if (!dataPoint) return null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 p-3.5 rounded-xl shadow-2xl text-xs space-y-2.5 min-w-[240px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <div className="font-bold text-sm text-white">{dataPoint.fullMonth}</div>
            <div className="text-[10px] text-slate-400 font-medium">{dataPoint.quarter} • {dataPoint.dealCount} Closed Deals</div>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              dataPoint.attainmentPct >= 100
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {dataPoint.attainmentPct}% of Quota
          </span>
        </div>

        {/* Metric rows */}
        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-blue-300">
            <span className="flex items-center gap-1.5 font-sans text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
              Awarded Revenue:
            </span>
            <span className="font-bold text-white">₹{dataPoint.awardedRevenue.toFixed(2)} Lakhs</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-sans text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              Sales Quota Target:
            </span>
            <span className="font-semibold text-slate-200">₹{dataPoint.targetQuota.toFixed(2)} Lakhs</span>
          </div>

          <div className="flex items-center justify-between text-emerald-300">
            <span className="flex items-center gap-1.5 font-sans text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Cash Collections:
            </span>
            <span className="font-bold text-emerald-400">₹{dataPoint.actualCollections.toFixed(2)} Lakhs</span>
          </div>

          <div className="flex items-center justify-between text-purple-300">
            <span className="flex items-center gap-1.5 font-sans text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
              Gross Profit (Est.):
            </span>
            <span className="font-bold text-purple-300">₹{dataPoint.grossProfitAmount.toFixed(2)} L ({dataPoint.grossMarginPct}%)</span>
          </div>
        </div>

        {/* Footer MoM badge */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-sans">
          <span>Month-over-Month Velocity:</span>
          <span className={`font-bold font-mono flex items-center ${dataPoint.momGrowthPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {dataPoint.momGrowthPct >= 0 ? '+' : ''}{dataPoint.momGrowthPct}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 transition-all ${className}`}>
      {/* Top Header & Interactive Filter Toolbar */}
      <div className="space-y-3.5 pb-2">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 shrink-0 mt-0.5 sm:mt-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Monthly Revenue Trend & Sales Performance
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 inline-flex items-center gap-1 shrink-0">
                <Sparkles className="w-3 h-3" />
                {summary.overallAttainment.toFixed(1)}% Quota Attained
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Multi-month sales trajectory, target achievement line, cash collections, and techno-commercial gross margin.
            </p>
          </div>
        </div>

        {/* Filter Controls Toolbar Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Time Horizon Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setTimeHorizon('6m')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeHorizon === '6m'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last 6 Months
            </button>
            <button
              onClick={() => setTimeHorizon('ytd')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeHorizon === 'ytd'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              YTD 2026
            </button>
            <button
              onClick={() => setTimeHorizon('12m')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeHorizon === '12m'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Full 12 Months
            </button>
          </div>

          {/* Metric View Modes */}
          <div className="flex flex-wrap items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setMetricMode('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="View all trend lines"
            >
              All Streams
            </button>
            <button
              onClick={() => setMetricMode('revenue_target')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricMode === 'revenue_target'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Compare Awarded Revenue vs Target Quota"
            >
              Revenue vs Target
            </button>
            <button
              onClick={() => setMetricMode('margin_profit')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricMode === 'margin_profit'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="View Revenue vs Gross Profit Margin"
            >
              Gross Profit
            </button>
            <button
              onClick={() => setMetricMode('cash_collections')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricMode === 'cash_collections'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Compare Quoted Revenue vs Realized Cash Inflows"
            >
              Cash Collections
            </button>
          </div>
        </div>
      </div>

      {/* Executive Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
        {/* Total Horizon Revenue */}
        <div
          onClick={() => onNavigate?.('quotes')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate?.('quotes');
            }
          }}
          role="button"
          tabIndex={0}
          title="Click to view Awarded HVAC Quotations & Orders"
          className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Horizon Awarded Sales</span>
            <DollarSign className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              ₹{(summary.totalAwarded / 100).toFixed(2)} Cr
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>₹{(summary.totalAwarded).toFixed(1)} Lakhs total</span>
            </span>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">View ➔</span>
          </div>
        </div>

        {/* Average Monthly Run Rate */}
        <div
          onClick={() => onNavigate?.('sales')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate?.('sales');
            }
          }}
          role="button"
          tabIndex={0}
          title="Click to view Sales Engineering Quotas & Targets"
          className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Avg Monthly Run Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-indigo-700 dark:text-indigo-400">
              ₹{summary.avgMonthlyRunRate.toFixed(1)} L/mo
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>vs ₹{summary.avgTargetQuota.toFixed(1)} L/mo Target</span>
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">View ➔</span>
          </div>
        </div>

        {/* Realized Cash Collections */}
        <div
          onClick={() => onNavigate?.('payments')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate?.('payments');
            }
          }}
          role="button"
          tabIndex={0}
          title="Click to view Milestone Invoices & Collections"
          className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Cash Collections</span>
            <CreditCard className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ₹{(summary.totalCollections / 100).toFixed(2)} Cr
            </span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-between">
            <span>{((summary.totalCollections / summary.totalAwarded) * 100).toFixed(1)}% Realization</span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">View ➔</span>
          </div>
        </div>

        {/* Cumulative Gross Margin Profit */}
        <div
          onClick={() => onNavigate?.('cost_analysis')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate?.('cost_analysis');
            }
          }}
          role="button"
          tabIndex={0}
          title="Click to view HVAC Job Costing & Profit Margins"
          className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-purple-400 dark:hover:border-purple-500 rounded-xl p-3.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Gross Profit Margin</span>
            <Percent className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold font-mono text-purple-700 dark:text-purple-400">
              {summary.overallMarginPct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-purple-600 dark:text-purple-400 font-medium flex items-center justify-between">
            <span>₹{summary.totalProfit.toFixed(1)}L gross margin</span>
            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">View ➔</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Line Chart Container */}
      <div className="h-72 sm:h-80 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyData} margin={{ top: 15, right: 10, left: -10, bottom: 5 }}>
            <defs>
              {/* Awarded Revenue Fill Gradient */}
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>

              {/* Collections Gradient */}
              <linearGradient id="collectionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>

              {/* Gross Profit Gradient */}
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.6} />

            <XAxis
              dataKey="shortMonth"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              dy={5}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}L`}
              domain={[0, 'dataMax + 20']}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Benchmark Reference Line for Average Monthly Quota */}
            {showBenchmarkLine && (
              <ReferenceLine
                y={summary.avgTargetQuota}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Avg Quota: ₹${summary.avgTargetQuota.toFixed(0)}L`,
                  position: 'insideTopRight',
                  fill: '#d97706',
                  fontSize: 10,
                  fontWeight: 600
                }}
              />
            )}

            {/* Gradient Area under Revenue when enabled */}
            {showGradientArea && (metricMode === 'all' || metricMode === 'revenue_target') && (
              <Area
                type="monotone"
                dataKey="awardedRevenue"
                fill="url(#revenueGradient)"
                stroke="none"
              />
            )}

            {showGradientArea && metricMode === 'margin_profit' && (
              <Area
                type="monotone"
                dataKey="grossProfitAmount"
                fill="url(#profitGradient)"
                stroke="none"
              />
            )}

            {showGradientArea && metricMode === 'cash_collections' && (
              <Area
                type="monotone"
                dataKey="actualCollections"
                fill="url(#collectionsGradient)"
                stroke="none"
              />
            )}

            {/* 1. Target Quota Line (Amber / Dashed) */}
            {(metricMode === 'all' || metricMode === 'revenue_target') && (
              <Line
                type="monotone"
                dataKey="targetQuota"
                name="Sales Target Quota"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {/* 2. Actual Collections Line (Emerald) */}
            {(metricMode === 'all' || metricMode === 'cash_collections') && (
              <Line
                type="monotone"
                dataKey="actualCollections"
                name="Cash Collections"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#10b981', strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {/* 3. Gross Profit Line (Purple) */}
            {(metricMode === 'all' || metricMode === 'margin_profit') && (
              <Line
                type="monotone"
                dataKey="grossProfitAmount"
                name="Gross Profit (₹ Lakhs)"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {/* 4. Primary Awarded Revenue Line (Blue/Indigo, Solid, High Emphasis) */}
            {(metricMode === 'all' || metricMode === 'revenue_target' || metricMode === 'margin_profit' || metricMode === 'cash_collections') && (
              <Line
                type="monotone"
                dataKey="awardedRevenue"
                name="Awarded Revenue"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, fill: '#1d4ed8', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer: Legend, Peak Insights & Navigation Link */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Custom Legend Badges */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-blue-600 rounded-full inline-block"></span>
            <span>Awarded Revenue (₹ Lakhs)</span>
          </div>
          {(metricMode === 'all' || metricMode === 'revenue_target') && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500 inline-block"></span>
              <span>Sales Quota Target</span>
            </div>
          )}
          {(metricMode === 'all' || metricMode === 'cash_collections') && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block"></span>
              <span>Realized Cash Collections</span>
            </div>
          )}
          {(metricMode === 'all' || metricMode === 'margin_profit') && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-purple-500 rounded-full inline-block"></span>
              <span>Gross Margin Profit</span>
            </div>
          )}
        </div>

        {/* Quick Peak Info & Action */}
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          {summary.peakMonth && (
            <span className="hidden md:inline text-[11px]">
              Peak: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{summary.peakMonth.shortMonth}</strong> (₹{summary.peakMonth.awardedRevenue}L)
            </span>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate('sales')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Sales Performance</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
