import React, { useState, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Layers,
  Building,
  Briefcase,
  ChevronRight,
  ChevronDown,
  X,
  ExternalLink,
  Printer,
  Sparkles,
  Info,
  Calendar,
  Percent,
  Clock,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import { Project, PurchaseOrder, BOQItem } from '../types';
import { storageService } from '../services/storageService';
import { downloadElementAsPDF, triggerDirectPrint, exportProjectCostAnalysisPDF } from '../utils/pdfExportHelper';
import { ProjectCostAnalysisPreviewModal } from './ProjectCostAnalysisPreviewModal';

interface ProjectCostAnalysisViewProps {
  projects?: Project[];
  pos?: PurchaseOrder[];
  onNavigateToProcurement?: () => void;
  onOpenSheetsModal?: () => void;
}

export interface ProjectCostVarianceRecord {
  project: Project;
  contractValue: number;
  budgetCost: number;
  actualCommittedCost: number;
  actualFulfilledCost: number;
  costVariance: number;
  costVariancePct: number;
  budgetedMargin: number;
  budgetedMarginPct: number;
  projectedMargin: number;
  projectedMarginPct: number;
  marginErosionPct: number;
  isOverBudget: boolean;
  varianceStatus: 'FAVORABLE' | 'ON_TRACK' | 'WARNING' | 'CRITICAL_OVERRUN';
  varianceStatusLabel: string;
  varianceColor: string;
  linkedPOs: PurchaseOrder[];
  poCount: number;
  equipmentBudget: number;
  materialsBudget: number;
  servicesBudget: number;
}

export const ProjectCostAnalysisView: React.FC<ProjectCostAnalysisViewProps> = ({
  projects: propProjects,
  pos: propPOs,
  onNavigateToProcurement,
  onOpenSheetsModal
}) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ACTIVE_ONLY' | 'OVER_BUDGET' | 'FAVORABLE'>('ACTIVE_ONLY');
  const [managerFilter, setManagerFilter] = useState<string>('ALL');
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<ProjectCostVarianceRecord | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewRecords, setPreviewRecords] = useState<ProjectCostVarianceRecord[]>([]);
  const [previewSummary, setPreviewSummary] = useState<any>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('All Active Commercial Sites');
  const printRef = useRef<HTMLDivElement>(null);

  // Retrieve latest projects & POs from storage
  const allData = storageService.getAllData();
  const rawProjects: Project[] = propProjects || allData.projects || [];
  const rawPOs: PurchaseOrder[] = propPOs || allData.pos || [];

  // Compute cost variance analytics per project
  const costRecords: ProjectCostVarianceRecord[] = useMemo(() => {
    return rawProjects.map((project) => {
      const contractValue = project.contractValue || 0;
      const budgetCost = project.totalEstimatedCost || (project.boqItems || []).reduce((sum, i) => sum + i.totalCost, 0) || 1;

      // Find all POs issued for this project
      const linkedPOs = rawPOs.filter(
        (po) =>
          po.projectId === project.id ||
          (po.projectName && po.projectName.toLowerCase() === project.projectName.toLowerCase())
      );

      // Total PO commitments
      const actualCommittedCost = linkedPOs.reduce((sum, po) => sum + (po.grandTotal || po.subtotal || 0), 0);
      const actualFulfilledCost = linkedPOs
        .filter((po) => po.status === 'Fulfilled' || po.status === 'Partially Received')
        .reduce((sum, po) => sum + (po.grandTotal || po.subtotal || 0), 0);

      const costVariance = actualCommittedCost - budgetCost;
      const costVariancePct = budgetCost > 0 ? (costVariance / budgetCost) * 100 : 0;

      const budgetedMargin = contractValue - budgetCost;
      const budgetedMarginPct = contractValue > 0 ? (budgetedMargin / contractValue) * 100 : 0;

      const projectedMargin = contractValue - actualCommittedCost;
      const projectedMarginPct = contractValue > 0 ? (projectedMargin / contractValue) * 100 : 0;

      const marginErosionPct = projectedMarginPct - budgetedMarginPct;
      const isOverBudget = actualCommittedCost > budgetCost;

      let varianceStatus: 'FAVORABLE' | 'ON_TRACK' | 'WARNING' | 'CRITICAL_OVERRUN' = 'ON_TRACK';
      let varianceStatusLabel = 'On Track (<= 5%)';
      let varianceColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';

      if (costVariancePct < -2) {
        varianceStatus = 'FAVORABLE';
        varianceStatusLabel = 'Under Budget (Savings)';
        varianceColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      } else if (costVariancePct > 12) {
        varianceStatus = 'CRITICAL_OVERRUN';
        varianceStatusLabel = 'Critical Overrun (> 12%)';
        varianceColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      } else if (costVariancePct > 5) {
        varianceStatus = 'WARNING';
        varianceStatusLabel = 'Budget Exceeded (5-12%)';
        varianceColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      }

      // Break down BOQ items into categories
      const boqItems = project.boqItems || [];
      const equipmentBudget = boqItems
        .filter((i) => (i.category || '').toLowerCase().includes('vrf') || (i.category || '').toLowerCase().includes('chiller') || (i.category || '').toLowerCase().includes('equipment'))
        .reduce((s, i) => s + i.totalCost, 0);
      const materialsBudget = boqItems
        .filter((i) => !((i.category || '').toLowerCase().includes('vrf') || (i.category || '').toLowerCase().includes('chiller') || (i.category || '').toLowerCase().includes('equipment') || (i.category || '').toLowerCase().includes('labor') || (i.category || '').toLowerCase().includes('service')))
        .reduce((s, i) => s + i.totalCost, 0);
      const servicesBudget = boqItems
        .filter((i) => (i.category || '').toLowerCase().includes('labor') || (i.category || '').toLowerCase().includes('service') || (i.category || '').toLowerCase().includes('installation'))
        .reduce((s, i) => s + i.totalCost, 0);

      return {
        project,
        contractValue,
        budgetCost,
        actualCommittedCost,
        actualFulfilledCost,
        costVariance,
        costVariancePct,
        budgetedMargin,
        budgetedMarginPct,
        projectedMargin,
        projectedMarginPct,
        marginErosionPct,
        isOverBudget,
        varianceStatus,
        varianceStatusLabel,
        varianceColor,
        linkedPOs,
        poCount: linkedPOs.length,
        equipmentBudget,
        materialsBudget,
        servicesBudget
      };
    });
  }, [rawProjects, rawPOs]);

  // Extract distinct Project Managers
  const managers = useMemo(() => {
    const set = new Set<string>();
    rawProjects.forEach((p) => {
      if (p.projectManager) set.add(p.projectManager.split('(')[0].trim());
    });
    return Array.from(set);
  }, [rawProjects]);

  // Aggregate Portfolio Totals
  const portfolioSummary = useMemo(() => {
    const totalContract = costRecords.reduce((sum, r) => sum + r.contractValue, 0);
    const totalBudget = costRecords.reduce((sum, r) => sum + r.budgetCost, 0);
    const totalCommitted = costRecords.reduce((sum, r) => sum + r.actualCommittedCost, 0);
    const totalFulfilled = costRecords.reduce((sum, r) => sum + r.actualFulfilledCost, 0);
    const netVariance = totalCommitted - totalBudget;
    const netVariancePct = totalBudget > 0 ? (netVariance / totalBudget) * 100 : 0;
    const overBudgetCount = costRecords.filter((r) => r.isOverBudget).length;
    const favorableCount = costRecords.filter((r) => r.costVariance < 0).length;

    const avgBudgetedMarginPct = totalContract > 0 ? ((totalContract - totalBudget) / totalContract) * 100 : 0;
    const avgProjectedMarginPct = totalContract > 0 ? ((totalContract - totalCommitted) / totalContract) * 100 : 0;

    return {
      totalContract,
      totalBudget,
      totalCommitted,
      totalFulfilled,
      netVariance,
      netVariancePct,
      overBudgetCount,
      favorableCount,
      avgBudgetedMarginPct,
      avgProjectedMarginPct
    };
  }, [costRecords]);

  // Filtered List
  const term = (search || '').trim().toLowerCase();
  const filteredRecords = useMemo(() => {
    return costRecords.filter((rec) => {
      const p = rec.project;
      const matchesSearch =
        !term ||
        p.projectName.toLowerCase().includes(term) ||
        p.projectNumber.toLowerCase().includes(term) ||
        p.clientName.toLowerCase().includes(term) ||
        (p.projectManager || '').toLowerCase().includes(term);

      let matchesFilter = true;
      if (filterMode === 'ACTIVE_ONLY') {
        matchesFilter = p.status !== 'Handover & Closed';
      } else if (filterMode === 'OVER_BUDGET') {
        matchesFilter = rec.isOverBudget;
      } else if (filterMode === 'FAVORABLE') {
        matchesFilter = rec.costVariance < 0;
      }

      const matchesManager =
        managerFilter === 'ALL' ||
        (p.projectManager || '').toLowerCase().includes(managerFilter.toLowerCase());

      return matchesSearch && matchesFilter && matchesManager;
    });
  }, [costRecords, term, filterMode, managerFilter]);

  const handleOpenPortfolioPreview = () => {
    setPreviewRecords(filteredRecords);
    setPreviewSummary(portfolioSummary);
    setPreviewTitle(
      filterMode === 'ACTIVE_ONLY'
        ? 'Active Projects'
        : filterMode === 'OVER_BUDGET'
        ? 'Over-Budget Sites'
        : 'All Commercial Sites'
    );
    setIsPreviewModalOpen(true);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    triggerDirectPrint(printRef.current, 'AlphaERP_Project_Cost_Variance_Schedule');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Real-Time Project Commercials
            </span>
            <span className="text-xs text-slate-400">
              BOQ vs PO Commitments & Margin Variance
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Project Cost Analysis & Budget vs. Actual PO Variance
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
            Monitor real-time cost variance, material procurement commitments via POs, and margin erosion across all active HVAC contracting sites.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 shadow-xs transition-colors cursor-pointer"
            title="Direct Browser Print of Variance Schedule"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <button
            id="btn-cost-analysis-download-pdf"
            onClick={handleOpenPortfolioPreview}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            title="Preview report structure and download cost variance analysis as PDF"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Projects Budget
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono mt-1">
            ₹{(portfolioSummary.totalBudget / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Contract: ₹{(portfolioSummary.totalContract / 10000000).toFixed(2)} Cr
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Committed PO Spend
          </div>
          <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
            ₹{(portfolioSummary.totalCommitted / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Fulfilled: ₹{(portfolioSummary.totalFulfilled / 10000000).toFixed(2)} Cr
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Net Cost Variance
          </div>
          <div className={`text-lg font-black font-mono mt-1 ${
            portfolioSummary.netVariance > 0 
              ? 'text-rose-600 dark:text-rose-400' 
              : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {portfolioSummary.netVariance > 0 ? '+' : ''}₹{(portfolioSummary.netVariance / 100000).toFixed(2)} L
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
            <span>({portfolioSummary.netVariancePct > 0 ? '+' : ''}{portfolioSummary.netVariancePct.toFixed(2)}%)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Projected Portfolio Margin
          </div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {portfolioSummary.avgProjectedMarginPct.toFixed(2)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Target: {portfolioSummary.avgBudgetedMarginPct.toFixed(2)}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Over-Budget Sites
          </div>
          <div className={`text-lg font-black font-mono mt-1 ${
            portfolioSummary.overBudgetCount > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'
          }`}>
            {portfolioSummary.overBudgetCount} of {costRecords.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {portfolioSummary.favorableCount} Under Budget
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project name, client, manager, PO..."
            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 text-xs placeholder-slate-400 font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterMode('ACTIVE_ONLY')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                filterMode === 'ACTIVE_ONLY'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Active ({costRecords.filter((r) => r.project.status !== 'Handover & Closed').length})
            </button>
            <button
              onClick={() => setFilterMode('OVER_BUDGET')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                filterMode === 'OVER_BUDGET'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Over Budget ({portfolioSummary.overBudgetCount})
            </button>
            <button
              onClick={() => setFilterMode('FAVORABLE')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                filterMode === 'FAVORABLE'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Savings ({portfolioSummary.favorableCount})
            </button>
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                filterMode === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({costRecords.length})
            </button>
          </div>

          {/* Project Manager Filter */}
          <select
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
          >
            <option value="ALL">All Project Managers</option>
            {managers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Printable Cost Variance Matrix */}
      <div
        ref={printRef}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm print-document"
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Project Budget vs. Actual PO Procurement Matrix
            </h3>
            <span className="text-xs text-slate-500">
              ({filteredRecords.length} projects displayed)
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Values in INR (₹) Lakhs
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[960px]">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Project & Client</th>
                <th className="py-3 px-3 text-right">Contract Value</th>
                <th className="py-3 px-3 text-right">BOQ Budget Cost</th>
                <th className="py-3 px-3 text-right">Actual PO Commitments</th>
                <th className="py-3 px-3 text-center">Budget Consumption</th>
                <th className="py-3 px-3 text-right">Cost Variance</th>
                <th className="py-3 px-3 text-center">Target vs Projected Margin</th>
                <th className="py-3 px-3 text-center">Variance Status</th>
                <th className="py-3 px-4 text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    No project records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const p = rec.project;
                  const consumptionPct = rec.budgetCost > 0 ? (rec.actualCommittedCost / rec.budgetCost) * 100 : 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedProjectForDetail(rec)}
                    >
                      {/* Project & Client */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {p.projectNumber}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {p.status}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs mt-0.5">
                          {p.projectName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {p.clientName} • PM: {p.projectManager ? p.projectManager.split('(')[0].trim() : 'Unassigned'}
                        </div>
                      </td>

                      {/* Contract Value */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        ₹{(rec.contractValue / 100000).toFixed(2)} L
                      </td>

                      {/* Budget Cost */}
                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                        ₹{(rec.budgetCost / 100000).toFixed(2)} L
                      </td>

                      {/* Actual PO Spend */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        <div>₹{(rec.actualCommittedCost / 100000).toFixed(2)} L</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {rec.poCount} Linked PO{rec.poCount !== 1 ? 's' : ''}
                        </div>
                      </td>

                      {/* Budget Consumption Bar */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`font-mono text-[11px] font-bold ${
                            consumptionPct > 105 
                              ? 'text-rose-600 dark:text-rose-400' 
                              : consumptionPct > 95 
                              ? 'text-amber-600 dark:text-amber-400' 
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {consumptionPct.toFixed(1)}%
                          </span>
                          <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full ${
                                consumptionPct > 105
                                  ? 'bg-rose-500'
                                  : consumptionPct > 95
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, consumptionPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Cost Variance */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold">
                        <div className={rec.costVariance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          {rec.costVariance > 0 ? '+' : ''}₹{(rec.costVariance / 100000).toFixed(2)} L
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {rec.costVariancePct > 0 ? '+' : ''}{rec.costVariancePct.toFixed(1)}%
                        </div>
                      </td>

                      {/* Target vs Projected Margin */}
                      <td className="py-3.5 px-3 text-center font-mono">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-slate-500 text-[11px]">{rec.budgetedMarginPct.toFixed(1)}%</span>
                          <span className="text-slate-400">&rarr;</span>
                          <span className={`font-bold ${
                            rec.projectedMarginPct >= rec.budgetedMarginPct 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {rec.projectedMarginPct.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Variance Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${rec.varianceColor}`}>
                          {rec.varianceStatusLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center no-print" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedProjectForDetail(rec)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors text-[11px]"
                          title="View PO breakdown and cost itemization"
                        >
                          View POs ({rec.poCount})
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Linked PO Drilldown Drawer / Modal */}
      {selectedProjectForDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                    {selectedProjectForDetail.project.projectNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${selectedProjectForDetail.varianceColor}`}>
                    {selectedProjectForDetail.varianceStatusLabel}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedProjectForDetail.project.projectName}
                </h3>
                <p className="text-xs text-slate-500">
                  Client: {selectedProjectForDetail.project.clientName} • Site: {selectedProjectForDetail.project.siteAddress || 'Mumbai'}
                </p>
              </div>

              <button
                onClick={() => setSelectedProjectForDetail(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Contract Value</div>
                <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                  ₹{(selectedProjectForDetail.contractValue / 100000).toFixed(2)} L
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Budgeted Cost</div>
                <div className="text-sm font-bold font-mono text-slate-700 dark:text-slate-300 mt-0.5">
                  ₹{(selectedProjectForDetail.budgetCost / 100000).toFixed(2)} L
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Committed PO Spend</div>
                <div className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                  ₹{(selectedProjectForDetail.actualCommittedCost / 100000).toFixed(2)} L
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Cost Variance</div>
                <div className={`text-sm font-bold font-mono mt-0.5 ${
                  selectedProjectForDetail.costVariance > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {selectedProjectForDetail.costVariance > 0 ? '+' : ''}₹{(selectedProjectForDetail.costVariance / 100000).toFixed(2)} L
                </div>
              </div>
            </div>

            {/* Linked Purchase Orders Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Linked Purchase Orders ({selectedProjectForDetail.linkedPOs.length})</span>
                </h4>
              </div>

              {selectedProjectForDetail.linkedPOs.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  No purchase orders currently issued for this project.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">PO Number</th>
                        <th className="py-2.5 px-3">Vendor</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedProjectForDetail.linkedPOs.map((po) => (
                        <tr key={po.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                            {po.poNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                            {po.vendorName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                            {po.orderDate}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300">
                              {po.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                            ₹{(po.grandTotal || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProjectForDetail(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    setPreviewRecords([selectedProjectForDetail]);
                    setPreviewSummary({
                      totalContract: selectedProjectForDetail.contractValue,
                      totalBudget: selectedProjectForDetail.budgetCost,
                      totalCommitted: selectedProjectForDetail.actualCommittedCost,
                      totalFulfilled: selectedProjectForDetail.actualFulfilledCost,
                      netVariance: selectedProjectForDetail.costVariance,
                      netVariancePct: selectedProjectForDetail.costVariancePct,
                      overBudgetCount: selectedProjectForDetail.isOverBudget ? 1 : 0,
                      favorableCount: selectedProjectForDetail.costVariance < 0 ? 1 : 0,
                      avgBudgetedMarginPct: selectedProjectForDetail.budgetedMarginPct,
                      avgProjectedMarginPct: selectedProjectForDetail.projectedMarginPct
                    });
                    setPreviewTitle(`Site Audit: ${selectedProjectForDetail.project.projectName} (${selectedProjectForDetail.project.projectNumber})`);
                    setIsPreviewModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Preview report structure and download individual project cost variance as PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>

              {onNavigateToProcurement && (
                <button
                  onClick={() => {
                    setSelectedProjectForDetail(null);
                    onNavigateToProcurement();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Open Procurement Desk</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Report Verification & Preview Modal */}
      <ProjectCostAnalysisPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        records={previewRecords.length > 0 ? previewRecords : filteredRecords}
        summary={previewSummary || portfolioSummary}
        filterTitle={previewTitle}
      />
    </div>
  );
};
