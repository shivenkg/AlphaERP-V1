import React, { useState, useEffect } from 'react';
import {
  Hash,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Edit3,
  Save,
  Search,
  Check,
  X,
  Layers,
  ArrowRight,
  Info,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  Filter,
  RefreshCw,
  Eye
} from 'lucide-react';
import { SeriesDefinition } from '../types';
import { storageService } from '../services/storageService';
import { formatSeriesNumber } from '../utils/numberSeries';

export const NumberSeriesAdminSection: React.FC = () => {
  const [seriesList, setSeriesList] = useState<SeriesDefinition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewLayout, setViewLayout] = useState<'table' | 'grid'>('table');
  const [editingSeries, setEditingSeries] = useState<SeriesDefinition | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadSeries();
    const unsubscribe = storageService.subscribe(() => {
      loadSeries();
    });
    return () => unsubscribe();
  }, []);

  const loadSeries = () => {
    const list = storageService.getNumberSeriesList();
    setSeriesList(list.map((s) => ({ ...s })));
  };

  const showFeedback = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Inline changes handlers
  const handleInlinePrefixChange = (id: string, newPrefix: string) => {
    const sanitized = newPrefix.toUpperCase().slice(0, 4);
    setSeriesList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, prefix: sanitized } : item))
    );
    setHasUnsavedChanges(true);
  };

  const handleInlineSequenceChange = (id: string, newSeq: number) => {
    const validSeq = Math.max(1, newSeq || 1);
    setSeriesList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, currentSequence: validSeq } : item))
    );
    setHasUnsavedChanges(true);
  };

  const handleInlinePaddingChange = (id: string, padding: number) => {
    setSeriesList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, paddingDigits: padding } : item))
    );
    setHasUnsavedChanges(true);
  };

  const handleInlineYearToggle = (id: string, includeYear: boolean) => {
    setSeriesList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, includeYear } : item))
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveSingleRow = (series: SeriesDefinition) => {
    storageService.updateSingleSeries(series.id, series);
    showFeedback(`Number series for "${series.entityName}" saved successfully.`);
  };

  const handleSaveAll = () => {
    storageService.updateNumberSeriesList(seriesList);
    setHasUnsavedChanges(false);
    showFeedback('All master data auto-numbering prefixes & sequence settings saved successfully!');
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Reset all automated number series back to initial system standards (Year 26 + 2-character prefixes + starting sequence #1)?'
      )
    ) {
      storageService.resetNumberSeriesToDefaults();
      setHasUnsavedChanges(false);
      showFeedback('All master data number series restored to default configuration.');
    }
  };

  const handleBackfillMigration = (forceReassign: boolean = false) => {
    const promptMsg = forceReassign
      ? 'Force re-assign all vendor and employee records to fresh sequential numbers starting from #1?'
      : 'Backfill unique automated codes for existing vendor and employee records and synchronize related HR records?';

    if (window.confirm(promptMsg)) {
      const result = storageService.backfillNumberSeriesCodes({ forceReassignAll: forceReassign });
      loadSeries();
      showFeedback(result.summary, 'success');
    }
  };

  const handleOpenAdvancedModal = (item: SeriesDefinition) => {
    setEditingSeries({ ...item });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeries) return;

    storageService.updateSingleSeries(editingSeries.id, editingSeries);
    setSeriesList((prev) =>
      prev.map((s) => (s.id === editingSeries.id ? { ...editingSeries } : s))
    );
    showFeedback(`Advanced configuration for "${editingSeries.entityName}" updated.`);
    setEditingSeries(null);
  };

  const getEntityCategory = (id: string): string => {
    if (['lead', 'quote', 'client'].includes(id)) return 'Sales & CRM';
    if (['pr', 'po', 'grn', 'product', 'vendor'].includes(id)) return 'Procurement & Inventory';
    if (['project', 'workorder'].includes(id)) return 'Projects & Field';
    if (['invoice', 'voucher', 'cost_center'].includes(id)) return 'Finance & Accounting';
    if (['employee', 'job_req', 'department', 'asset', 'grievance'].includes(id)) return 'HR & Operations';
    return 'General Master';
  };

  const currentYearDigits = new Date().getFullYear().toString().slice(-2);

  const filteredList = seriesList.filter((s) => {
    const matchesSearch =
      s.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.prefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory === 'ALL') return true;
    return getEntityCategory(s.id) === selectedCategory;
  });

  const categories = [
    'ALL',
    'Sales & CRM',
    'Procurement & Inventory',
    'Projects & Field',
    'Finance & Accounting',
    'HR & Operations'
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              Auto-Numbering Master Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              Current Year Prefix: <strong className="text-blue-600 dark:text-blue-400">{currentYearDigits}</strong> (20{currentYearDigits})
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Master Data & Transaction Automated Number Series
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Configure automated system-generated series for all master data records. Standard format begins with the 2-digit active year (e.g. <strong>{currentYearDigits}-</strong>) followed by a customizable <strong>2-character prefix</strong> and a custom <strong>sequence starting point</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => handleBackfillMigration(false)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Backfill unique automated series codes for existing vendor and employee records"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Backfill & Migrate Codes</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Restore system default series formats"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          {hasUnsavedChanges && (
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <Save className="w-4 h-4" />
              <span>Save All Changes</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : feedback.type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Filter Ribbon & View Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search object, 2-char prefix, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Layout Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setViewLayout('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewLayout === 'table'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Table View (Fast Batch Edit)"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewLayout('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewLayout === 'grid'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TABLE VIEW (Optimal for editing 2-character prefixes and sequence starting points directly) */}
      {viewLayout === 'table' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Master Data Object</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3 w-32">2-Char Prefix</th>
                  <th className="py-3.5 px-3 w-36">Starting Sequence #</th>
                  <th className="py-3.5 px-3 w-28">Year (26-)</th>
                  <th className="py-3.5 px-3">Live Sample Preview</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredList.map((series) => {
                  const sample = formatSeriesNumber(series, series.currentSequence);
                  const isTwoChar = series.prefix.length === 2;

                  return (
                    <tr
                      key={series.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {series.entityName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {series.description}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold whitespace-nowrap">
                          {getEntityCategory(series.id)}
                        </span>
                      </td>

                      {/* 2-Character Prefix Input */}
                      <td className="py-3.5 px-3">
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={4}
                            value={series.prefix}
                            onChange={(e) => handleInlinePrefixChange(series.id, e.target.value)}
                            placeholder="e.g. EM"
                            className={`w-24 px-2.5 py-1.5 rounded-lg font-mono font-bold text-xs uppercase border transition-all ${
                              isTwoChar
                                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 focus:ring-2 focus:ring-blue-500'
                                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 focus:ring-2 focus:ring-amber-500'
                            }`}
                          />
                          <span className="ml-1 text-[10px] text-slate-400">
                            {series.prefix.length}c
                          </span>
                        </div>
                      </td>

                      {/* Sequence Starting Point Input */}
                      <td className="py-3.5 px-3">
                        <input
                          type="number"
                          min="1"
                          value={series.currentSequence}
                          onChange={(e) =>
                            handleInlineSequenceChange(series.id, parseInt(e.target.value) || 1)
                          }
                          className="w-24 px-2.5 py-1.5 rounded-lg font-mono font-bold text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>

                      {/* Year Toggle */}
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => handleInlineYearToggle(series.id, !series.includeYear)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            series.includeYear !== false
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {series.includeYear !== false ? `+${currentYearDigits}` : 'Off'}
                        </button>
                      </td>

                      {/* Live Preview Sample */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs border border-indigo-200 dark:border-indigo-800/60">
                          {sample}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveSingleRow(series)}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-600 hover:text-emerald-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                            title="Save this row"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenAdvancedModal(series)}
                            className="p-1.5 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-600 hover:text-blue-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                            title="Advanced Configuration"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((series) => {
            const sample = formatSeriesNumber(series, series.currentSequence);

            return (
              <div
                key={series.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        {getEntityCategory(series.id)}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {series.entityName}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md font-mono text-[10px] font-bold shrink-0">
                      {series.id}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {series.description}
                  </p>

                  {/* Live Preview */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Live Generated Sample</span>
                      <span className="text-blue-600">Seq #{series.currentSequence}</span>
                    </div>
                    <div className="text-base font-black text-indigo-700 dark:text-indigo-300 font-mono tracking-tight bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      {sample}
                    </div>
                  </div>

                  {/* Inline Quick Fields */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        2-Char Prefix
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={series.prefix}
                        onChange={(e) => handleInlinePrefixChange(series.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold uppercase text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Sequence Start
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={series.currentSequence}
                        onChange={(e) =>
                          handleInlineSequenceChange(series.id, parseInt(e.target.value) || 1)
                        }
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleSaveSingleRow(series)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => handleOpenAdvancedModal(series)}
                    className="p-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
                    title="Configure Advanced Rule"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Advanced Edit Modal */}
      {editingSeries && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Advanced Configuration: {editingSeries.entityName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure prefix, zero padding, separator, and sequence starting point.
                </p>
              </div>
              <button
                onClick={() => setEditingSeries(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 pt-4">
              {/* Live Preview Display */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60">
                <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-1">
                  Live Generation Preview
                </div>
                <div className="text-xl font-black font-mono text-indigo-950 dark:text-indigo-200">
                  {formatSeriesNumber(editingSeries, editingSeries.currentSequence)}
                </div>
              </div>

              {/* Year Prefix Option */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Include Year Prefix ({currentYearDigits}-)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Starts with "{currentYearDigits}" representing calendar year {new Date().getFullYear()}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={editingSeries.includeYear !== false}
                  onChange={(e) =>
                    setEditingSeries({ ...editingSeries, includeYear: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    2-Character Prefix
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={editingSeries.prefix}
                    onChange={(e) =>
                      setEditingSeries({
                        ...editingSeries,
                        prefix: e.target.value.toUpperCase()
                      })
                    }
                    placeholder="e.g. EM, PR, PO"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-mono text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Separator Character
                  </label>
                  <select
                    value={editingSeries.separator}
                    onChange={(e) =>
                      setEditingSeries({ ...editingSeries, separator: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="-">Hyphen (-)</option>
                    <option value="/">Slash (/)</option>
                    <option value=".">Dot (.)</option>
                    <option value="_">Underscore (_)</option>
                    <option value="">None (Concatenated)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Zero-Padding Length
                  </label>
                  <select
                    value={editingSeries.paddingDigits || 4}
                    onChange={(e) =>
                      setEditingSeries({
                        ...editingSeries,
                        paddingDigits: parseInt(e.target.value) || 4
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={3}>3 Digits (e.g. 001)</option>
                    <option value={4}>4 Digits (e.g. 0001)</option>
                    <option value={5}>5 Digits (e.g. 00001)</option>
                    <option value={6}>6 Digits (e.g. 000001)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sequence Starting Point
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingSeries.currentSequence}
                    onChange={(e) =>
                      setEditingSeries({
                        ...editingSeries,
                        currentSequence: Math.max(1, parseInt(e.target.value) || 1)
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold font-mono text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Pattern Template (Optional)
                </label>
                <input
                  type="text"
                  value={editingSeries.customPattern || ''}
                  onChange={(e) =>
                    setEditingSeries({ ...editingSeries, customPattern: e.target.value })
                  }
                  placeholder="{YY}-{PREFIX}-{SEQ}"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Supported tokens: {'{YY}'}, {'{YYYY}'}, {'{PREFIX}'}, {'{SEQ}'}, {'{SEP}'}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSeries(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
