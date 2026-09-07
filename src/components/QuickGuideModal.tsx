import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  Command,
  ArrowLeft,
  Search,
  Sliders,
  FileDown,
  FileSpreadsheet,
  Send,
  CheckCircle2,
  MousePointerClick,
  Sparkles,
  Layers,
  ShieldCheck,
  TrendingUp,
  Boxes,
  Briefcase,
  Users
} from 'lucide-react';

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export const QuickGuideModal: React.FC<QuickGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'navigation' | 'dashboard' | 'workflows'>('shortcuts');

  // Listen for Escape or ? to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="quick-guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-guide-title"
    >
      <div
        id="quick-guide-modal-container"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-700/50">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="quick-guide-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
                >
                  AlphaERP Quick Guide & Navigation Tips
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Sparkles className="w-3 h-3" /> Shortcuts Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Master system keyboard shortcuts, breadcrumb navigation, and interactive dashboard tools
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <span>Press</span>
              <kbd className="font-bold text-slate-700 dark:text-slate-200">Esc</kbd>
              <span>or</span>
              <kbd className="font-bold text-slate-700 dark:text-slate-200">?</kbd>
              <span>to exit</span>
            </span>
            <button
              id="btn-close-quick-guide"
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close Quick Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 px-5 sm:px-6 py-2.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'shortcuts'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Command className="w-3.5 h-3.5" />
            <span>Keyboard Shortcuts</span>
          </button>
          <button
            onClick={() => setActiveTab('navigation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'navigation'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Screen Navigation & Back Keys</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>Interactive Playcards & Reports</span>
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'workflows'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Enterprise Workflows</span>
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB 1: Keyboard Shortcuts */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Shortcut 1 */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Toggle Quick Guide</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Opens or closes this interactive help overlay anywhere in the system
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <kbd className="px-2 py-1 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">
                      ?
                    </kbd>
                  </div>
                </div>

                {/* Shortcut 2 */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Global ERP Search</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Instant search across Leads, Quotes, Projects, POs, and SKUs
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <kbd className="px-2 py-1 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">
                      Cmd/Ctrl
                    </kbd>
                    <span className="text-slate-400 text-xs">+</span>
                    <kbd className="px-2 py-1 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">
                      K
                    </kbd>
                  </div>
                </div>

                {/* Shortcut 3 */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Back to Previous Screen</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Instant single-press return to previous screen when not inside text inputs
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <kbd className="px-2.5 py-1 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">
                      Backspace
                    </kbd>
                  </div>
                </div>

                {/* Shortcut 4 */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Browser Back Key / Shortcut</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Standard keyboard and hardware multimedia back shortcuts
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <kbd className="px-2 py-1 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">
                      Alt
                    </kbd>
                    <span className="text-slate-400 text-xs">+</span>
                    <kbd className="px-2 py-1 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">
                      ←
                    </kbd>
                  </div>
                </div>

                {/* Shortcut 5 */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Close Modal / Dismiss</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Closes active modals, drawers, slide-overs, or global search preview
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <kbd className="px-2.5 py-1 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">
                      Esc
                    </kbd>
                  </div>
                </div>

                {/* Shortcut 6 */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Activate Focused Item</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Navigates into focused summary card or triggers action button
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <kbd className="px-2.5 py-1 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">
                      Enter
                    </kbd>
                  </div>
                </div>

                {/* Shortcut 7: Font Scaling */}
                <div className="flex items-start justify-between p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Adjust Font Size & Auto-Rendering</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Scale application typography up/down, or reset to responsive Auto Viewport mode
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                    <div className="flex items-center gap-1">
                      <kbd className="px-2 py-1 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">Alt</kbd>
                      <span className="text-slate-400 text-xs">+</span>
                      <kbd className="px-2 py-1 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs">+/ -</kbd>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">Auto:</span>
                      <kbd className="px-1.5 py-0.5 text-[10px] font-bold font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded shadow-2xs">Alt + 0</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Screen Navigation & Back Keys */}
          {activeTab === 'navigation' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Single-Press Back Navigation Engine</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  AlphaERP maintains a deduplicated historical stack of every screen transition.
                  Pressing the <strong>Backspace</strong> key, using <strong>Alt + Left Arrow</strong>,
                  or clicking the <strong>Back</strong> button in the breadcrumb bar immediately returns you to
                  your previous view in a single press without extra clicks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <ArrowLeft className="w-4 h-4 text-blue-600" />
                    <span>Breadcrumb Back Button</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Visible whenever you are on a sub-screen. Displays the shortcut tooltip and takes you back directly.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Hierarchy Pills</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Click any level in the breadcrumb trail to navigate upward to group hubs or switch to sibling modules.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Modal Priority Dismissal</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    If any dialog or drawer is open, back keys dismiss the modal first so you never lose your active screen context.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Interactive Playcards & Reports */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      KPI Card Direct Links
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Click on any dashboard metric card (Awarded Sales, Pipeline, Low Stock, Pending PRs, Invoices)
                    to drill down directly into the corresponding detail view.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <FileDown className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Download Full Report
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Click the "Download Full Report" button on the dashboard header for high-DPI, print-ready
                    A4 PDF compilation with executive headers, pagination, and timestamps.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Drag & Drop Layout Customization
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Click "Customize Layout" to reorder KPI cards and main dashboard sections to prioritize metrics
                    most relevant to your operational focus.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
                      <Send className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      WhatsApp Daily KPI Digest
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Generate previous-day management digests formatted for executive WhatsApp channels with sales,
                    collections, and inventory shortage telemetry.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Enterprise Workflows */}
          {activeTab === 'workflows' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  End-to-End HVAC Project Lifecycle
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-blue-600 dark:text-blue-400">1. CRM Inbound</div>
                    <p className="text-[11px] text-slate-500 mt-1">Lead capture, site survey scheduling & requirement gathering.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-indigo-600 dark:text-indigo-400">2. BOQ & Quotation</div>
                    <p className="text-[11px] text-slate-500 mt-1">Margin analysis, UOM calculator & formal quotation approval.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-amber-600 dark:text-amber-400">3. Procurement & PO</div>
                    <p className="text-[11px] text-slate-500 mt-1">Shortage cross-check, PR conversion to PO & goods receipt note.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">4. Billing & Commissioning</div>
                    <p className="text-[11px] text-slate-500 mt-1">Milestone invoices, GST calculation & site commissioning signoff.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Need to switch modules quickly?
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate?.('dashboard');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate?.('crm');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    CRM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate?.('quotes');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Quotes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate?.('procurement');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Procurement
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Shortcut system active across all modules</span>
          </div>
          <button
            id="btn-quick-guide-confirm"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Got it, Continue
          </button>
        </div>
      </div>
    </div>
  );
};
