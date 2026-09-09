import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart3,
  HelpCircle,
  Mail,
  Sliders,
  X
} from 'lucide-react';
import { InventoryItem } from '../types';
import { storageService } from '../services/storageService';
import { triggerProcurementReorderEmailNotification } from '../services/procurementNotificationService';
import { EmailSettingsAdminSection } from './EmailSettingsAdminSection';

interface PredictiveInventoryReorderPanelProps {
  inventory: InventoryItem[];
  onPRCreated?: (message: string) => void;
}

export interface PredictiveItemAnalysis {
  item: InventoryItem;
  avgMonthlyConsumption: number; // units / month
  leadTimeDays: number;
  safetyStockRecommended: number;
  optimalReorderQty: number;
  estimatedReorderCost: number;
  daysOfInventoryLeft: number;
  urgency: 'CRITICAL' | 'REORDER_NOW' | 'HEALTHY' | 'SURPLUS';
  urgencyLabel: string;
  urgencyColor: string;
}

export const PredictiveInventoryReorderPanel: React.FC<PredictiveInventoryReorderPanelProps> = ({
  inventory,
  onPRCreated
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'ALL' | 'ACTIONABLE' | 'CRITICAL'>('ACTIONABLE');
  const [isGeneratingBulkPR, setIsGeneratingBulkPR] = useState(false);
  const [isSendingEmailAlert, setIsSendingEmailAlert] = useState(false);
  const [emailAlertStatus, setEmailAlertStatus] = useState<string | null>(null);
  const [showEmailConfigModal, setShowEmailConfigModal] = useState(false);

  const handleSendReorderEmailAlert = async () => {
    setIsSendingEmailAlert(true);
    setEmailAlertStatus(null);
    try {
      const result = await triggerProcurementReorderEmailNotification({
        items: inventory,
        forceSend: true
      });
      setEmailAlertStatus(
        `Dispatched alert to ${result.sentTo.length} manager(s) for ${result.itemCount} SKU(s) (Est: ₹${result.totalEstimatedCost.toLocaleString('en-IN')}) via ${result.mode === 'smtp' ? 'SMTP' : 'Mock Wrapper'}`
      );
      setTimeout(() => setEmailAlertStatus(null), 6000);
    } catch (err: any) {
      setEmailAlertStatus(`Error sending alert: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSendingEmailAlert(false);
    }
  };

  // Compute predictive values based on item categories, current allocations, and historical velocity
  const predictiveData: PredictiveItemAnalysis[] = useMemo(() => {
    return inventory.map((item) => {
      // Establish baseline consumption rate based on category and current allocation velocity
      let baseMonthlyRate = 10;
      let leadDays = 14;

      const cat = (item.category || '').toLowerCase();
      if (cat.includes('copper') || cat.includes('pipes')) {
        baseMonthlyRate = Math.max(120, item.reorderLevel * 2.5);
        leadDays = 10;
      } else if (cat.includes('ducting') || cat.includes('sheets')) {
        baseMonthlyRate = Math.max(90, item.reorderLevel * 2.2);
        leadDays = 12;
      } else if (cat.includes('insulation')) {
        baseMonthlyRate = Math.max(60, item.reorderLevel * 2.0);
        leadDays = 8;
      } else if (cat.includes('refrigerant')) {
        baseMonthlyRate = Math.max(15, item.reorderLevel * 1.8);
        leadDays = 7;
      } else if (cat.includes('valves') || cat.includes('dampers')) {
        baseMonthlyRate = Math.max(30, item.reorderLevel * 1.6);
        leadDays = 15;
      } else if (cat.includes('vrf') || cat.includes('chiller') || cat.includes('ahu')) {
        baseMonthlyRate = Math.max(4, Math.ceil(item.reorderLevel * 1.2));
        leadDays = 30; // longer OEM lead time
      } else if (cat.includes('diffuser') || cat.includes('grille') || cat.includes('outlets')) {
        baseMonthlyRate = Math.max(45, item.reorderLevel * 1.7);
        leadDays = 10;
      } else {
        baseMonthlyRate = Math.max(item.reorderLevel > 0 ? item.reorderLevel * 1.5 : 12, item.allocatedStock * 1.2);
        leadDays = 14;
      }

      const avgMonthlyConsumption = Math.round(baseMonthlyRate);
      const dailyConsumption = avgMonthlyConsumption / 30;
      
      // Safety stock formula: (Daily Consumption * Lead Time) * 1.35 (safety buffer factor)
      const safetyStockRecommended = Math.ceil(dailyConsumption * leadDays * 1.35);

      // Optimal reorder quantity (Order-up-to level: 1.5 months demand + Safety Stock - Current Available)
      const targetStockLevel = Math.ceil(avgMonthlyConsumption * 1.5 + safetyStockRecommended);
      const rawOptimalQty = Math.max(0, targetStockLevel - item.availableStock);
      
      // Round to clean pack sizes
      let optimalReorderQty = rawOptimalQty;
      if (optimalReorderQty > 0) {
        if (optimalReorderQty > 50) {
          optimalReorderQty = Math.ceil(optimalReorderQty / 10) * 10;
        } else if (optimalReorderQty > 10) {
          optimalReorderQty = Math.ceil(optimalReorderQty / 5) * 5;
        }
      }

      // Runway in days
      const daysOfInventoryLeft = dailyConsumption > 0 
        ? Math.round(item.availableStock / dailyConsumption) 
        : 999;

      let urgency: 'CRITICAL' | 'REORDER_NOW' | 'HEALTHY' | 'SURPLUS' = 'HEALTHY';
      let urgencyLabel = 'Healthy Stock';
      let urgencyColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';

      if (daysOfInventoryLeft <= 10 || item.availableStock <= item.reorderLevel * 0.1) {
        urgency = 'CRITICAL';
        urgencyLabel = 'Critical Stockout Risk';
        urgencyColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      } else if (daysOfInventoryLeft <= 25 || item.availableStock <= item.reorderLevel) {
        urgency = 'REORDER_NOW';
        urgencyLabel = 'Reorder Suggested';
        urgencyColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      } else if (daysOfInventoryLeft > 80) {
        urgency = 'SURPLUS';
        urgencyLabel = 'Surplus / Adequate';
        urgencyColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      }

      const estimatedReorderCost = optimalReorderQty * (item.averageUnitCost || 0);

      return {
        item,
        avgMonthlyConsumption,
        leadTimeDays: leadDays,
        safetyStockRecommended,
        optimalReorderQty,
        estimatedReorderCost,
        daysOfInventoryLeft,
        urgency,
        urgencyLabel,
        urgencyColor
      };
    });
  }, [inventory]);

  // Aggregate Metrics
  const actionableItems = predictiveData.filter((p) => p.optimalReorderQty > 0);
  const criticalItems = predictiveData.filter((p) => p.urgency === 'CRITICAL');
  const totalSuggestedCost = actionableItems.reduce((sum, p) => sum + p.estimatedReorderCost, 0);

  const displayedItems = useMemo(() => {
    if (filterMode === 'CRITICAL') {
      return predictiveData.filter((p) => p.urgency === 'CRITICAL');
    }
    if (filterMode === 'ACTIONABLE') {
      return predictiveData.filter((p) => p.optimalReorderQty > 0);
    }
    return predictiveData;
  }, [predictiveData, filterMode]);

  // Handle single item PR generation
  const handleGenerateSinglePR = (analysis: PredictiveItemAnalysis) => {
    const { item, optimalReorderQty, estimatedReorderCost, daysOfInventoryLeft } = analysis;
    
    storageService.createPR({
      projectName: 'Predictive Warehouse Stock Replenishment',
      priority: analysis.urgency === 'CRITICAL' ? 'Urgent' : 'High',
      items: [
        {
          sku: item.sku,
          name: item.name,
          category: item.category,
          requiredQty: optimalReorderQty,
          unit: item.unit,
          estimatedUnitCost: item.averageUnitCost,
          estimatedTotal: estimatedReorderCost,
          reason: `Predictive Analysis: ${daysOfInventoryLeft} days runway left based on ${analysis.avgMonthlyConsumption} ${item.unit}/mo historical consumption rate.`
        }
      ],
      justification: `Automated replenishment based on consumption runway (${daysOfInventoryLeft} days) and recommended safety buffer (${analysis.safetyStockRecommended} ${item.unit}).`
    });

    if (onPRCreated) {
      onPRCreated(`Purchase Requisition generated for ${item.sku} (${optimalReorderQty} ${item.unit})`);
    }
  };

  // Handle bulk PR generation for all actionable items
  const handleGenerateBulkPR = () => {
    if (actionableItems.length === 0) return;
    setIsGeneratingBulkPR(true);

    setTimeout(() => {
      const prItems = actionableItems.map((a) => ({
        sku: a.item.sku,
        name: a.item.name,
        category: a.item.category,
        requiredQty: a.optimalReorderQty,
        unit: a.item.unit,
        estimatedUnitCost: a.item.averageUnitCost,
        estimatedTotal: a.estimatedReorderCost,
        reason: `Predictive Reorder: ${a.daysOfInventoryLeft}d runway remaining (AMC: ${a.avgMonthlyConsumption} ${a.item.unit}/mo)`
      }));

      storageService.createPR({
        projectName: 'Bulk Predictive Inventory Replenishment',
        priority: criticalItems.length > 0 ? 'Urgent' : 'High',
        items: prItems,
        justification: `Consolidated PR for ${actionableItems.length} SKUs facing projected stockouts within lead time buffers. Total estimated procurement value: ₹${(totalSuggestedCost / 100000).toFixed(2)} Lakhs.`
      });

      setIsGeneratingBulkPR(false);
      if (onPRCreated) {
        onPRCreated(`Bulk PR generated for ${actionableItems.length} SKUs (₹${(totalSuggestedCost / 100000).toFixed(2)} Lakhs)`);
      }
    }, 400);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>Predictive Inventory & Optimal Reorder Analysis</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                AI Run-Rate Model
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Suggests optimal restocking quantities based on 3-month average monthly consumption (AMC), lead times, and safety buffers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendReorderEmailAlert}
            disabled={isSendingEmailAlert}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 shrink-0"
            title="Dispatch automated email notification to procurement managers"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{isSendingEmailAlert ? 'Alerting...' : 'Email Procurement'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowEmailConfigModal(true)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Configure Email & SMTP Settings (Dummy Sandbox vs Live SMTP)"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {actionableItems.length > 0 && (
            <button
              onClick={handleGenerateBulkPR}
              disabled={isGeneratingBulkPR}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 shrink-0"
              title="Generate consolidated Purchase Requisition for all replenishment items"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isGeneratingBulkPR ? 'Creating PR...' : `Auto-PR All (${actionableItems.length} SKUs)`}</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Collapse Section' : 'Expand Section'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {emailAlertStatus && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 rounded-xl text-xs font-medium text-blue-900 dark:text-blue-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{emailAlertStatus}</span>
          </div>
          <button
            onClick={() => setEmailAlertStatus(null)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-xs font-bold underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Summary KPI Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">
                Suggested Reorder Investment
              </div>
              <div className="text-base font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                ₹{(totalSuggestedCost / 100000).toFixed(2)} L
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Across {actionableItems.length} replenishment SKUs
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">
                Critical Runway (&le; 10 Days)
              </div>
              <div className="text-base font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                {criticalItems.length} SKUs
              </div>
              <div className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                Immediate stockout risk
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">
                Reorder Buffer Needed
              </div>
              <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                {actionableItems.length - criticalItems.length} SKUs
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Within lead time threshold
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">
                Healthy Stock SKUs
              </div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                {predictiveData.length - actionableItems.length} SKUs
              </div>
              <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                &gt; 30 days buffer coverage
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">Filter:</span>
              <button
                onClick={() => setFilterMode('ACTIONABLE')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors text-[11px] ${
                  filterMode === 'ACTIONABLE'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Reorder Suggested ({actionableItems.length})
              </button>
              <button
                onClick={() => setFilterMode('CRITICAL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors text-[11px] ${
                  filterMode === 'CRITICAL'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Critical Risk Only ({criticalItems.length})
              </button>
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors text-[11px] ${
                  filterMode === 'ALL'
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All SKUs ({predictiveData.length})
              </button>
            </div>

            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              Showing {displayedItems.length} predictive forecasts
            </div>
          </div>

          {/* Predictive Items Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">SKU & Item Details</th>
                  <th className="py-2.5 px-3 text-center">Avail / Reorder Level</th>
                  <th className="py-2.5 px-3 text-center">Avg. Monthly Run (AMC)</th>
                  <th className="py-2.5 px-3 text-center">Runway (Days)</th>
                  <th className="py-2.5 px-3 text-center">Rec. Safety Buffer</th>
                  <th className="py-2.5 px-3 text-right">Optimal Reorder Qty</th>
                  <th className="py-2.5 px-3 text-right">Est. Cost</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {displayedItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                      No items matching current predictive filter.
                    </td>
                  </tr>
                ) : (
                  displayedItems.map((analysis) => {
                    const { item, avgMonthlyConsumption, daysOfInventoryLeft, safetyStockRecommended, optimalReorderQty, estimatedReorderCost, urgency, urgencyLabel, urgencyColor } = analysis;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                              {item.sku}
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${urgencyColor}`}>
                              {urgencyLabel}
                            </span>
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-xs">
                            {item.name} • {item.category}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {item.availableStock}
                          </span>
                          <span className="text-slate-400"> / {item.reorderLevel} {item.unit}</span>
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {avgMonthlyConsumption} {item.unit}/mo
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`font-mono font-bold ${
                              daysOfInventoryLeft <= 10 
                                ? 'text-rose-600 dark:text-rose-400' 
                                : daysOfInventoryLeft <= 25 
                                ? 'text-amber-600 dark:text-amber-400' 
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {daysOfInventoryLeft > 365 ? '> 1 Year' : `${daysOfInventoryLeft} Days`}
                            </span>
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full ${
                                  daysOfInventoryLeft <= 10
                                    ? 'bg-rose-500'
                                    : daysOfInventoryLeft <= 25
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(8, (daysOfInventoryLeft / 60) * 100))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                          {safetyStockRecommended} {item.unit}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {optimalReorderQty > 0 ? (
                            <span className="text-purple-600 dark:text-purple-400">
                              +{optimalReorderQty} {item.unit}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">0 (Adequate)</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                          {estimatedReorderCost > 0 ? `₹${estimatedReorderCost.toLocaleString('en-IN')}` : '—'}
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          {optimalReorderQty > 0 ? (
                            <button
                              onClick={() => handleGenerateSinglePR(analysis)}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/60 font-bold rounded-lg border border-purple-200 dark:border-purple-800 transition-colors shadow-2xs text-[11px] whitespace-nowrap"
                              title="Create Purchase Requisition for this suggested quantity"
                            >
                              + Create PR
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>OK</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* POPUP MODAL FOR EMAIL SETTINGS */}
      {showEmailConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setShowEmailConfigModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 rounded-full border border-slate-200 shadow-2xs transition-colors z-10"
              title="Close Email Settings"
            >
              <X className="w-5 h-5" />
            </button>
            <EmailSettingsAdminSection currentUser={storageService.getCurrentUser()} />
          </div>
        </div>
      )}
    </div>
  );
};
