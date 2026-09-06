import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Percent,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Quote, QuoteLineItem } from '../types';

interface QuoteMarginSummaryPanelProps {
  quotes: Quote[];
  onSelectQuote?: (quote: Quote) => void;
}

interface CategorySummary {
  cost: number;
  revenue: number;
  marginPct: number;
}

export const QuoteMarginSummaryPanel: React.FC<QuoteMarginSummaryPanelProps> = ({
  quotes,
  onSelectQuote
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'per-quote' | 'category-breakdown' | 'distribution'>('per-quote');
  const [sortBy, setSortBy] = useState<'marginPctDesc' | 'marginPctAsc' | 'sellingPriceDesc' | 'boqCostDesc'>('marginPctDesc');

  // Compute detailed per-quote margin metrics based on BOQ item costs and selling price
  const quoteMarginMetrics = useMemo(() => {
    return quotes.map((q) => {
      // Direct sum from BOQ items if available, fallback to totalCost
      const boqCost =
        Array.isArray(q.items) && q.items.length > 0
          ? q.items.reduce((s, it) => s + (Number(it.totalCost) || 0), 0)
          : Number(q.totalCost) || 0;

      const subtotalSelling =
        Array.isArray(q.items) && q.items.length > 0
          ? q.items.reduce((s, it) => s + (Number(it.totalPrice) || 0), 0)
          : Number(q.subtotal) || Number(q.totalAmount) / 1.18;

      const discountVal = Number(q.discountAmount) || (subtotalSelling * (Number(q.discountPct) || 0)) / 100;
      const netSellingPrice = Math.max(0, subtotalSelling - discountVal);
      const grossMarginAmt = netSellingPrice - boqCost;
      const calculatedMarginPct = netSellingPrice > 0 ? (grossMarginAmt / netSellingPrice) * 100 : 0;

      // Category breakdown for this quote
      const categoryCosts: Record<string, number> = {};
      const categoryPrices: Record<string, number> = {};
      (q.items || []).forEach((it) => {
        const cat = it.category || 'Equipment';
        categoryCosts[cat] = (categoryCosts[cat] || 0) + (Number(it.totalCost) || 0);
        categoryPrices[cat] = (categoryPrices[cat] || 0) + (Number(it.totalPrice) || 0);
      });

      return {
        quote: q,
        quoteNumber: q.quoteNumber,
        companyName: q.companyName,
        clientName: q.clientName,
        projectTitle: q.projectTitle,
        status: q.status,
        itemCount: q.items?.length || 0,
        boqCost,
        subtotalSelling,
        discountVal,
        netSellingPrice,
        grossMarginAmt,
        calculatedMarginPct,
        categoryCosts,
        categoryPrices
      };
    });
  }, [quotes]);

  // Portfolio level aggregations
  const summary = useMemo(() => {
    const count = quoteMarginMetrics.length;
    if (count === 0) {
      return {
        totalQuotedRevenue: 0,
        totalBOQCost: 0,
        totalMarginAmount: 0,
        overallMarginPct: 0,
        avgMarginPctPerQuote: 0,
        highMarginCount: 0,
        healthyMarginCount: 0,
        tightMarginCount: 0,
        categoryTotals: {}
      };
    }

    const totalQuotedRevenue = quoteMarginMetrics.reduce((s, q) => s + q.netSellingPrice, 0);
    const totalBOQCost = quoteMarginMetrics.reduce((s, q) => s + q.boqCost, 0);
    const totalMarginAmount = totalQuotedRevenue - totalBOQCost;
    const overallMarginPct = totalQuotedRevenue > 0 ? (totalMarginAmount / totalQuotedRevenue) * 100 : 0;
    const avgMarginPctPerQuote = quoteMarginMetrics.reduce((s, q) => s + q.calculatedMarginPct, 0) / count;

    const highMarginCount = quoteMarginMetrics.filter((q) => q.calculatedMarginPct >= 25).length;
    const healthyMarginCount = quoteMarginMetrics.filter((q) => q.calculatedMarginPct >= 18 && q.calculatedMarginPct < 25).length;
    const tightMarginCount = quoteMarginMetrics.filter((q) => q.calculatedMarginPct < 18).length;

    // Aggregate category-wise costs and selling prices across all quotes
    const categoryTotals: Record<string, CategorySummary> = {};
    quoteMarginMetrics.forEach((qm) => {
      Object.entries(qm.categoryCosts).forEach(([cat, costVal]) => {
        const cost = Number(costVal) || 0;
        const rev = Number(qm.categoryPrices[cat]) || 0;
        if (!categoryTotals[cat]) {
          categoryTotals[cat] = { cost: 0, revenue: 0, marginPct: 0 };
        }
        categoryTotals[cat].cost += cost;
        categoryTotals[cat].revenue += rev;
      });
    });

    Object.keys(categoryTotals).forEach((cat) => {
      const data = categoryTotals[cat];
      const margin = data.revenue - data.cost;
      data.marginPct = data.revenue > 0 ? (margin / data.revenue) * 100 : 0;
    });

    return {
      totalQuotedRevenue,
      totalBOQCost,
      totalMarginAmount,
      overallMarginPct,
      avgMarginPctPerQuote,
      highMarginCount,
      healthyMarginCount,
      tightMarginCount,
      categoryTotals
    };
  }, [quoteMarginMetrics]);

  // Sorted quotes for the per-quote table
  const sortedQuoteMetrics = useMemo(() => {
    return [...quoteMarginMetrics].sort((a, b) => {
      if (sortBy === 'marginPctDesc') return b.calculatedMarginPct - a.calculatedMarginPct;
      if (sortBy === 'marginPctAsc') return a.calculatedMarginPct - b.calculatedMarginPct;
      if (sortBy === 'sellingPriceDesc') return b.netSellingPrice - a.netSellingPrice;
      if (sortBy === 'boqCostDesc') return b.boqCost - a.boqCost;
      return 0;
    });
  }, [quoteMarginMetrics, sortBy]);

  if (quotes.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Top Header Bar with Accordion Toggle */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-400/30">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Quotation BOQ Cost & Margin Summary Panel
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {summary.overallMarginPct.toFixed(1)}% Overall Margin
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Live techno-commercial margin analysis calculated from itemized BOQ unit costs and quoted selling prices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Collapse Summary</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Expand Summary ({quoteMarginMetrics.length} Quotes)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5 bg-slate-50/50">
          {/* Executive Margin Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Overall Weighted Margin % */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Portfolio Margin %</span>
                <Percent className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {summary.overallMarginPct.toFixed(2)}%
                </span>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Target: 20%
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Weighted across {quoteMarginMetrics.length} active quotations
              </div>
            </div>

            {/* Total Estimated BOQ Cost */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total BOQ Item Cost</span>
                <Layers className="w-4 h-4 text-slate-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  ₹{(summary.totalBOQCost / 100000).toFixed(2)} L
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Raw material, equipment & labor costs
              </div>
            </div>

            {/* Total Quoted Net Selling Price */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Quoted Net Selling Price</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-600 font-mono">
                  ₹{(summary.totalQuotedRevenue / 100000).toFixed(2)} L
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Net quoted value before 18% GST
              </div>
            </div>

            {/* Total Estimated Gross Profit Amount */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Gross Profit</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-indigo-700 font-mono">
                  ₹{(summary.totalMarginAmount / 100000).toFixed(2)} L
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                  {summary.highMarginCount} High Margin
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{summary.healthyMarginCount} Healthy</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation & Sorting Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('per-quote')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  activeTab === 'per-quote'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Per-Quote Margin Schedule ({quoteMarginMetrics.length})
              </button>
              <button
                onClick={() => setActiveTab('category-breakdown')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  activeTab === 'category-breakdown'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BOQ Category Profitability
              </button>
              <button
                onClick={() => setActiveTab('distribution')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  activeTab === 'distribution'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Margin Health Distribution
              </button>
            </div>

            {activeTab === 'per-quote' && (
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-semibold text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 text-xs font-medium cursor-pointer"
                >
                  <option value="marginPctDesc">Highest Margin % First</option>
                  <option value="marginPctAsc">Lowest Margin % First</option>
                  <option value="sellingPriceDesc">Highest Selling Price</option>
                  <option value="boqCostDesc">Highest BOQ Cost</option>
                </select>
              </div>
            )}
          </div>

          {/* TAB 1: PER-QUOTE BOQ COST & MARGIN SCHEDULE TABLE */}
          {activeTab === 'per-quote' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Quote # & Client</th>
                      <th className="py-3 px-3">Project Title</th>
                      <th className="py-3 px-3 text-center">BOQ Items</th>
                      <th className="py-3 px-3 text-right">BOQ Raw Cost (₹)</th>
                      <th className="py-3 px-3 text-right">Quoted Price (₹)</th>
                      <th className="py-3 px-3 text-right">Est. Gross Profit (₹)</th>
                      <th className="py-3 px-4 text-right">Est. Margin %</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {sortedQuoteMetrics.map((qm) => {
                      const marginColor =
                        qm.calculatedMarginPct >= 25
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : qm.calculatedMarginPct >= 18
                          ? 'text-blue-700 bg-blue-50 border-blue-200'
                          : 'text-amber-800 bg-amber-50 border-amber-200';

                      return (
                        <tr
                          key={qm.quote.id}
                          onClick={() => onSelectQuote && onSelectQuote(qm.quote)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-blue-600 group-hover:text-blue-800">{qm.quoteNumber}</div>
                            <div className="font-sans text-[11px] text-slate-800 font-semibold truncate max-w-[160px]">
                              {qm.companyName}
                            </div>
                          </td>

                          <td className="py-3 px-3 font-sans text-slate-700 font-medium max-w-[200px] truncate">
                            {qm.projectTitle}
                          </td>

                          <td className="py-3 px-3 text-center text-slate-600 font-sans">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                              {qm.itemCount} Lines
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right text-slate-700">
                            ₹{qm.boqCost.toLocaleString()}
                          </td>

                          <td className="py-3 px-3 text-right font-bold text-slate-900">
                            ₹{qm.netSellingPrice.toLocaleString()}
                          </td>

                          <td className="py-3 px-3 text-right font-bold text-emerald-600">
                            +₹{qm.grossMarginAmt.toLocaleString()}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Visual Mini Progress Gauge */}
                              <div className="w-12 bg-slate-100 rounded-full h-1.5 hidden sm:block overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    qm.calculatedMarginPct >= 25
                                      ? 'bg-emerald-500'
                                      : qm.calculatedMarginPct >= 18
                                      ? 'bg-blue-500'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(0, qm.calculatedMarginPct * 2))}%` }}
                                ></div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-lg border font-bold text-xs ${marginColor}`}
                              >
                                {qm.calculatedMarginPct.toFixed(2)}%
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-sans ${
                                qm.status === 'Awarded'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : qm.status === 'Approved'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {qm.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: BOQ CATEGORY PROFITABILITY */}
          {activeTab === 'category-breakdown' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {(Object.entries(summary.categoryTotals) as [string, CategorySummary][]).map(([cat, data]) => {
                const profitAmt = data.revenue - data.cost;
                const costPctOfRev = data.revenue > 0 ? (data.cost / data.revenue) * 100 : 0;

                return (
                  <div key={cat} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{cat}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold ${
                          data.marginPct >= 25
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : data.marginPct >= 18
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {data.marginPct.toFixed(2)}% Margin
                      </span>
                    </div>

                    {/* Progress Bar of Cost vs Margin */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                        <span>Cost Share ({costPctOfRev.toFixed(0)}%)</span>
                        <span>Gross Profit ({(100 - costPctOfRev).toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-emerald-500 h-2 rounded-full flex overflow-hidden">
                        <div
                          className="bg-slate-400 h-full"
                          style={{ width: `${Math.min(100, Math.max(0, costPctOfRev))}%` }}
                          title={`Raw Cost: ₹${data.cost.toLocaleString()}`}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <div className="text-[10px] text-slate-400 font-sans">BOQ Cost:</div>
                        <div className="font-semibold text-slate-800">₹{data.cost.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-sans">Quoted Value:</div>
                        <div className="font-bold text-slate-900">₹{data.revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: MARGIN HEALTH DISTRIBUTION */}
          {activeTab === 'distribution' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* High Margin */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    High Margin (&ge; 25%)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-mono text-xs">
                    {summary.highMarginCount} Quotes
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Optimal engineering profitability exceeding standard turnkey HVAC benchmarks.
                </p>
                <div className="pt-2 border-t border-emerald-200/60 font-mono text-xs text-emerald-950 font-bold">
                  {(
                    (summary.highMarginCount / (quoteMarginMetrics.length || 1)) *
                    100
                  ).toFixed(1)}
                  % of Quotation Portfolio
                </div>
              </div>

              {/* Healthy Standard Margin */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-blue-900 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Standard Margin (18% - 24.9%)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 font-mono text-xs">
                    {summary.healthyMarginCount} Quotes
                  </span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Standard commercial MEP installation margins with balanced competitive pricing.
                </p>
                <div className="pt-2 border-t border-blue-200/60 font-mono text-xs text-blue-950 font-bold">
                  {(
                    (summary.healthyMarginCount / (quoteMarginMetrics.length || 1)) *
                    100
                  ).toFixed(1)}
                  % of Quotation Portfolio
                </div>
              </div>

              {/* Tight Margin */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-amber-900 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Tight Margin (&lt; 18%)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono text-xs">
                    {summary.tightMarginCount} Quotes
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Competitive high-volume bids or highly discounted equipment proposals.
                </p>
                <div className="pt-2 border-t border-amber-200/60 font-mono text-xs text-amber-950 font-bold">
                  {(
                    (summary.tightMarginCount / (quoteMarginMetrics.length || 1)) *
                    100
                  ).toFixed(1)}
                  % of Quotation Portfolio
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
