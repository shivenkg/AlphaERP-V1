import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Copy,
  FileText,
  Check,
  Share2,
  Printer,
  Table,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Zap
} from 'lucide-react';
import {
  getActiveViewInfo,
  generateViewSummaryText,
  downloadViewPDFSummary,
  exportViewCSV
} from '../utils/quickExportEngine';
import { triggerDirectPrint } from '../utils/pdfExportHelper';

interface QuickExportMenuProps {
  activeTab: string;
  isCollapsed?: boolean;
}

export const QuickExportMenu: React.FC<QuickExportMenuProps> = ({
  activeTab,
  isCollapsed = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const viewInfo = getActiveViewInfo(activeTab);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Download PDF Summary
  const handleDownloadPDF = async () => {
    try {
      setIsExportingPDF(true);
      await downloadViewPDFSummary(activeTab);
      showToast(`PDF Summary for "${viewInfo.title}" generated & downloaded!`);
      setIsOpen(false);
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Error generating PDF summary');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // 2. Copy formatted summary to clipboard
  const handleCopyToClipboard = async () => {
    try {
      const summary = generateViewSummaryText(activeTab);
      await navigator.clipboard.writeText(summary);
      setCopyFeedback(true);
      showToast(`Summary report for "${viewInfo.title}" copied to clipboard!`);
      setTimeout(() => {
        setCopyFeedback(false);
        setIsOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Clipboard copy error:', err);
      // Fallback for clipboard
      const textarea = document.createElement('textarea');
      textarea.value = generateViewSummaryText(activeTab);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopyFeedback(true);
      showToast(`Summary report copied to clipboard!`);
      setTimeout(() => {
        setCopyFeedback(false);
        setIsOpen(false);
      }, 1200);
    }
  };

  // 3. Export CSV
  const handleExportCSV = () => {
    exportViewCSV(activeTab);
    showToast(`CSV data file for "${viewInfo.title}" downloaded!`);
    setIsOpen(false);
  };

  // 4. Print View
  const handlePrintView = () => {
    setIsOpen(false);
    triggerDirectPrint(document.querySelector('main') as HTMLElement, `${viewInfo.title} • AlphaERP`);
    showToast(`Opening Print Dialog for "${viewInfo.title}"`);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-950 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-200 text-xs font-bold flex items-center gap-2.5 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Menu Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`absolute bottom-full mb-2 z-50 bg-[#0d1738] border border-[#233876] rounded-2xl shadow-2xl p-3 text-white backdrop-blur-xl ${
              isCollapsed
                ? 'left-0 sm:left-2 w-72'
                : 'left-0 right-0 w-full min-w-[260px]'
            }`}
          >
            {/* Popover Header */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#1c2e63]">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold border border-emerald-500/30">
                    LIVE VIEW
                  </span>
                  <span className="text-[10px] text-blue-300 font-semibold truncate max-w-[140px]">
                    {viewInfo.category}
                  </span>
                </div>
                <h4 className="text-xs font-black text-white mt-1 leading-tight line-clamp-1">
                  {viewInfo.title}
                </h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close Menu"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-1.5 pt-2.5">
              {/* Option 1: Download PDF Summary */}
              <button
                onClick={handleDownloadPDF}
                disabled={isExportingPDF}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-900/30 transition-all cursor-pointer group active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-white/20 group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-extrabold">Download PDF Summary</div>
                    <div className="text-[10px] text-blue-200 font-normal">Branded Executive Report</div>
                  </div>
                </div>
                {isExportingPDF ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-blue-200 group-hover:translate-y-0.5 transition-transform" />
                )}
              </button>

              {/* Option 2: Copy to Clipboard */}
              <button
                onClick={handleCopyToClipboard}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#13224d] hover:bg-[#1c306b] border border-[#233876] text-slate-100 font-bold text-xs transition-all cursor-pointer group active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-white/10 group-hover:scale-110 transition-transform text-emerald-400">
                    {copyFeedback ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white">
                      {copyFeedback ? 'Copied to Clipboard!' : 'Copy Summary Data'}
                    </div>
                    <div className="text-[10px] text-slate-300 font-normal">Plaintext / Markdown</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                  {copyFeedback ? '✓ Copied' : 'Ctrl+C'}
                </span>
              </button>

              {/* Option 3: Export CSV & Option 4: Direct Print */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#101b3d] hover:bg-[#182859] border border-[#1f3166] text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handlePrintView}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#101b3d] hover:bg-[#182859] border border-[#1f3166] text-slate-300 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Print View</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Trigger Button in Sidebar */}
      {!isCollapsed ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer group shadow-lg ${
            isOpen
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-emerald-900/40 ring-2 ring-emerald-400'
              : 'bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-blue-600/90 hover:from-emerald-600 hover:to-blue-600 text-white shadow-emerald-950/50 hover:shadow-emerald-900/60'
          }`}
          title="Global Quick Export • Download PDF or Copy View Data"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-lg bg-white/20 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-extrabold tracking-wide flex items-center gap-1.5">
                <span>Quick Export</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              </div>
              <div className="text-[10px] text-emerald-100 font-normal">
                PDF Summary & Copy Data
              </div>
            </div>
          </div>
          <div className="p-1 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
            <Download className="w-3.5 h-3.5 text-white" />
          </div>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-md cursor-pointer ${
            isOpen
              ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
              : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:scale-105 shadow-emerald-950/40'
          }`}
          title="Quick Export (PDF Summary / Copy Data)"
        >
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
        </button>
      )}
    </div>
  );
};
