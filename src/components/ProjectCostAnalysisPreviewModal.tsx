import React, { useRef, useState } from 'react';
import {
  Eye,
  Download,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  FileText,
  Building2,
  Calendar,
  AlertTriangle,
  Loader2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { exportProjectCostAnalysisPDF, triggerDirectPrint } from '../utils/pdfExportHelper';

interface ProjectCostAnalysisPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: any[];
  summary: {
    totalContract: number;
    totalBudget: number;
    totalCommitted: number;
    totalFulfilled: number;
    netVariance: number;
    netVariancePct: number;
    overBudgetCount: number;
    favorableCount: number;
    avgBudgetedMarginPct: number;
    avgProjectedMarginPct: number;
  };
  filterTitle?: string;
}

export const ProjectCostAnalysisPreviewModal: React.FC<ProjectCostAnalysisPreviewModalProps> = ({
  isOpen,
  onClose,
  records,
  summary,
  filterTitle = 'All Active Commercial Sites'
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const printableSheetRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const filename = `AlphaERP_Project_Cost_Analysis_${new Date().toISOString().split('T')[0]}`;
      const success = exportProjectCostAnalysisPDF(records, summary, {
        filename,
        filterTitle,
        orientation: 'landscape'
      });
      if (success) {
        // Automatically close or keep open with feedback
        setTimeout(() => {
          setIsDownloading(false);
          onClose();
        }, 600);
      } else {
        setIsDownloading(false);
      }
    } catch (err) {
      console.error('Download PDF error:', err);
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!printableSheetRef.current) return;
    triggerDirectPrint(printableSheetRef.current, 'AlphaERP_Project_Cost_Analysis_Preview', 'landscape');
  };

  return (
    <div
      id="modal-cost-analysis-preview"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-between overflow-hidden animate-in fade-in duration-150"
    >
      {/* Top Header / Verification Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Project Cost Analysis • PDF Report Preview
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                Landscape A4
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready to Export</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify report structure, KPI ribbon, and cost variance calculations before downloading the PDF
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(60, z - 15))}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold px-1.5 text-slate-700 dark:text-slate-200 min-w-[42px] text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(140, z + 15))}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              title="Reset 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id="btn-cost-preview-print"
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
            title="Direct Browser Print of Preview"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Direct Print</span>
          </button>

          <button
            id="btn-cost-preview-download-pdf"
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            title="Download verified report as PDF"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            id="btn-cost-preview-close"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Verification Notice Banner */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Report Structure Verified:</strong> Includes {records.length} commercial site records, 5 portfolio KPIs, and complete BOQ budget vs. actual PO commitments with margin variance (Landscape 297×210mm).
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 shrink-0 hidden md:inline">
          Filter: {filterTitle}
        </span>
      </div>

      {/* Document Sheet Canvas with Zoom */}
      <div className="flex-1 bg-slate-900/90 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="w-full max-w-[1100px] shrink-0 pb-12 transition-all duration-200"
        >
          {/* High-Fidelity Printable Document Representation */}
          <div
            ref={printableSheetRef}
            id="printable-cost-analysis-sheet"
            className="bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-300 p-6 sm:p-8 space-y-6 font-sans transition-all duration-200"
            style={{ minHeight: '680px' }}
          >
            {/* Header Navy Block */}
            <div className="bg-slate-900 text-white rounded-lg p-5 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-bold tracking-wider text-blue-300 uppercase">
                      Alpha HVAC Solutions & Engineering Services Ltd
                    </span>
                  </div>
                  <h1 className="text-lg font-black tracking-tight text-white">
                    PROJECT COST VARIANCE & MARGIN EROSION SCHEDULE
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">
                    Enterprise HVAC Commercial Operations • BOQ Budget vs. Actual PO Commitments & Margin Audit
                  </p>
                </div>

                <div className="text-right text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-end gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    Sites Monitored: {records.length} Sites
                  </div>
                  <div className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold border border-emerald-500/30 uppercase">
                    Commercial Audit
                  </div>
                </div>
              </div>
            </div>

            {/* Scope / Subtitle Bar */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-900">Audit Scope:</span>
                <span className="text-slate-600">{filterTitle}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Values expressed in INR (₹) Lakhs unless specified • Standard 18% GST Applicable
              </div>
            </div>

            {/* Executive KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] font-bold uppercase text-slate-500">Total Projects Budget</div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  ₹{(summary.totalBudget / 10000000).toFixed(2)} Cr
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Contract: ₹{(summary.totalContract / 10000000).toFixed(2)} Cr
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] font-bold uppercase text-slate-500">Committed PO Spend</div>
                <div className="text-base font-black text-indigo-700 mt-0.5">
                  ₹{(summary.totalCommitted / 10000000).toFixed(2)} Cr
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Fulfilled: ₹{(summary.totalFulfilled / 10000000).toFixed(2)} Cr
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] font-bold uppercase text-slate-500">Net Cost Variance</div>
                <div
                  className={`text-base font-black mt-0.5 flex items-center gap-1 ${
                    summary.netVariance > 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {summary.netVariance > 0 ? (
                    <TrendingUp className="w-4 h-4 shrink-0" />
                  ) : (
                    <TrendingDown className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {summary.netVariance > 0 ? '+' : ''}₹{(summary.netVariance / 100000).toFixed(2)} L
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {summary.netVariancePct > 0 ? '+' : ''}{summary.netVariancePct.toFixed(2)}% vs Budget
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-[10px] font-bold uppercase text-slate-500">Portfolio Margin</div>
                <div className="text-base font-black text-emerald-700 mt-0.5">
                  {summary.avgProjectedMarginPct.toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Target: {summary.avgBudgetedMarginPct.toFixed(2)}%
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 col-span-2 sm:col-span-1">
                <div className="text-[10px] font-bold uppercase text-slate-500">Over-Budget Sites</div>
                <div
                  className={`text-base font-black mt-0.5 ${
                    summary.overBudgetCount > 0 ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {summary.overBudgetCount} of {records.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {summary.favorableCount} Under Budget
                </div>
              </div>
            </div>

            {/* Tabular Register Preview */}
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Project No & Name</th>
                    <th className="py-2.5 px-3">Client & City</th>
                    <th className="py-2.5 px-3 text-right">Contract (L)</th>
                    <th className="py-2.5 px-3 text-right">Budget (L)</th>
                    <th className="py-2.5 px-3 text-right">Committed (L)</th>
                    <th className="py-2.5 px-3 text-right">Used %</th>
                    <th className="py-2.5 px-3 text-right">Variance (L)</th>
                    <th className="py-2.5 px-3 text-right">Margin %</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {records.map((rec, idx) => {
                    const usedPct = rec.budgetCost > 0 ? (rec.actualCommittedCost / rec.budgetCost) * 100 : 0;
                    return (
                      <tr key={rec.project.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900">
                            {rec.project.projectNumber} - {rec.project.projectName}
                          </div>
                          <div className="text-[10px] text-slate-500">{rec.project.projectType || 'HVAC Commercial'}</div>
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          <div>{rec.project.clientName}</div>
                          <div className="text-[10px] text-slate-400">{rec.project.locationCity || 'India'}</div>
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          {(rec.contractValue / 100000).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          {(rec.budgetCost / 100000).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-indigo-700">
                          {(rec.actualCommittedCost / 100000).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span
                            className={`font-semibold ${
                              usedPct > 100 ? 'text-rose-600 font-bold' : 'text-slate-700'
                            }`}
                          >
                            {usedPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold">
                          {rec.costVariance > 0 ? (
                            <span className="text-rose-600">+{(rec.costVariance / 100000).toFixed(2)}</span>
                          ) : (
                            <span className="text-emerald-700">{(rec.costVariance / 100000).toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="font-semibold text-slate-900">
                            {rec.projectedMarginPct.toFixed(1)}%
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Tgt: {rec.budgetedMarginPct.toFixed(0)}%
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.varianceStatus === 'CRITICAL_OVERRUN'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : rec.varianceStatus === 'WARNING'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {rec.varianceStatusLabel || 'ON TRACK'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200/90 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-2.5 px-3 uppercase text-[11px]">
                      Total Portfolio ({records.length} Sites)
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {(summary.totalContract / 100000).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {(summary.totalBudget / 100000).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-indigo-800">
                      {(summary.totalCommitted / 100000).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {summary.totalBudget > 0
                        ? ((summary.totalCommitted / summary.totalBudget) * 100).toFixed(1)
                        : 0}
                      %
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {summary.netVariance > 0 ? (
                        <span className="text-rose-700">
                          +{(summary.netVariance / 100000).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-emerald-800">
                          {(summary.netVariance / 100000).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-800">
                      {summary.avgProjectedMarginPct.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-center text-[10px] text-slate-600 uppercase">
                      AUDIT COMPLETE
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Audit Certification & Signoff Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-slate-700">Commercial Audit Notice:</div>
                <p className="max-w-xl text-[11px] leading-relaxed">
                  Budget figures represent initial HVAC BOQ baseline estimates. Actual commitments encompass approved Purchase Orders (PO), logistics freight, and statutory taxes. Overruns exceeding 5% trigger mandatory procurement head review.
                </p>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-800">Alpha HVAC Solutions Ltd</div>
                <div className="text-[11px] text-slate-500">Commercial Operations & Finance Audit</div>
                <div className="font-mono text-[10px] text-slate-400 mt-1">Generated via AlphaERP Suite</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 shrink-0">
        <div>
          Page Format: <strong>A4 Landscape (297 × 210 mm)</strong> • Vector PDF High-Resolution Output
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Confirm & Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
