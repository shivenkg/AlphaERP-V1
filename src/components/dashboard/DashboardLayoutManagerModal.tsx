import React, { useState } from 'react';
import {
  LayoutGrid,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  X,
  SlidersHorizontal,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Layers,
  Activity,
  BarChart3,
  TrendingUp,
  Boxes,
  CreditCard,
  Users,
  Briefcase,
  ShoppingCart,
  Database,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  WidgetConfig,
  DashboardLayoutState,
  DASHBOARD_PRESETS,
  DEFAULT_KPI_WIDGETS,
  DEFAULT_MAIN_SECTION_WIDGETS
} from '../../types/dashboardLayout';

interface DashboardLayoutManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutState: DashboardLayoutState;
  onSaveLayout: (newLayout: DashboardLayoutState) => void;
  onResetLayout: () => void;
}

export const DashboardLayoutManagerModal: React.FC<DashboardLayoutManagerModalProps> = ({
  isOpen,
  onClose,
  layoutState,
  onSaveLayout,
  onResetLayout
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'kpis' | 'sections' | 'presets'>('all');
  const [kpis, setKpis] = useState<WidgetConfig[]>(layoutState.kpiWidgets);
  const [sections, setSections] = useState<WidgetConfig[]>(layoutState.mainWidgets);
  const [draggedItem, setDraggedItem] = useState<{ type: 'kpi' | 'section'; index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  // Reorder helper
  const reorder = <T extends object>(list: T[], startIndex: number, endIndex: number): T[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // Move item up/down
  const moveItem = (type: 'kpi' | 'section', index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (type === 'kpi') {
      if (targetIndex < 0 || targetIndex >= kpis.length) return;
      const reordered = reorder(kpis, index, targetIndex);
      setKpis(reordered.map((item, idx) => ({ ...item, order: idx })));
    } else {
      if (targetIndex < 0 || targetIndex >= sections.length) return;
      const reordered = reorder(sections, index, targetIndex);
      setSections(reordered.map((item, idx) => ({ ...item, order: idx })));
    }
  };

  // Toggle Visibility
  const toggleVisibility = (type: 'kpi' | 'section', id: string) => {
    if (type === 'kpi') {
      const updated = kpis.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item));
      setKpis(updated);
    } else {
      const updated = sections.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item));
      setSections(updated);
    }
  };

  // Drag Handlers
  const handleDragStart = (type: 'kpi' | 'section', index: number) => {
    setDraggedItem({ type, index });
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (type: 'kpi' | 'section', dropIndex: number) => {
    if (!draggedItem || draggedItem.type !== type) return;
    const fromIndex = draggedItem.index;
    if (fromIndex === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    if (type === 'kpi') {
      const reordered = reorder(kpis, fromIndex, dropIndex);
      setKpis(reordered.map((item, idx) => ({ ...item, order: idx })));
    } else {
      const reordered = reorder(sections, fromIndex, dropIndex);
      setSections(reordered.map((item, idx) => ({ ...item, order: idx })));
    }

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  // Apply Preset
  const applyPreset = (presetId: string) => {
    const preset = DASHBOARD_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    // Map KPIs according to preset order
    const orderedKpis: WidgetConfig[] = [];
    preset.kpiOrder.forEach((id, idx) => {
      const found = DEFAULT_KPI_WIDGETS.find((w) => w.id === id) || kpis.find((w) => w.id === id);
      if (found) {
        orderedKpis.push({ ...found, order: idx, visible: true });
      }
    });

    // Map Sections according to preset order
    const orderedSections: WidgetConfig[] = [];
    preset.mainOrder.forEach((id, idx) => {
      const found = DEFAULT_MAIN_SECTION_WIDGETS.find((w) => w.id === id) || sections.find((w) => w.id === id);
      if (found) {
        orderedSections.push({ ...found, order: idx, visible: true });
      }
    });

    setKpis(orderedKpis);
    setSections(orderedSections);
    showToast(`Applied preset: ${preset.name}`);
  };

  // Save changes
  const handleSave = () => {
    const newState: DashboardLayoutState = {
      version: 1,
      kpiWidgets: kpis.map((k, idx) => ({ ...k, order: idx })),
      mainWidgets: sections.map((s, idx) => ({ ...s, order: idx })),
      isCustomized: true
    };
    onSaveLayout(newState);
    onClose();
  };

  // Reset to default
  const handleReset = () => {
    setKpis(DEFAULT_KPI_WIDGETS);
    setSections(DEFAULT_MAIN_SECTION_WIDGETS);
    onResetLayout();
    showToast('Reset dashboard layout to factory defaults');
  };

  const getWidgetIcon = (id: string) => {
    switch (id) {
      case 'kpi_awarded_sales':
        return TrendingUp;
      case 'kpi_active_pipeline':
        return Users;
      case 'kpi_inventory_worth':
        return Boxes;
      case 'kpi_receivables':
        return CreditCard;
      case 'section_activity_feed':
        return Activity;
      case 'section_analytics_charts':
        return BarChart3;
      case 'section_active_projects':
        return Briefcase;
      case 'section_pipeline_funnel':
        return Layers;
      case 'section_sales_leaderboard':
        return Sparkles;
      case 'section_operational_stats':
        return ShoppingCart;
      default:
        return LayoutGrid;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Dashboard Layout Manager
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Drag & Drop
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Reorder KPI cards, prioritize the Activity Feed, or hide unused widgets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All Widgets' },
              { id: 'kpis', label: 'KPI Cards' },
              { id: 'sections', label: 'Main Sections' },
              { id: 'presets', label: 'Layout Presets' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Reset to default arrangement"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>

        {/* Notification Toast */}
        {successToast && (
          <div className="mx-5 mt-3 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Body / Scroll Area */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 max-h-[55vh]">
          {/* Layout Presets View */}
          {activeTab === 'presets' ? (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-2xl flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Select a predefined template tailored for your specific role (Executive, Quoting & Sales, or Project Operations).
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {DASHBOARD_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 cursor-pointer transition-all space-y-2 group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {preset.name}
                      </span>
                      <span className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Instructions Tip */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Drag items by the grip icon or use the <ArrowUp className="w-3 h-3 inline" /> /{' '}
                    <ArrowDown className="w-3 h-3 inline" /> arrows to rearrange positions.
                  </span>
                </div>
              </div>

              {/* KPI Cards Section */}
              {(activeTab === 'all' || activeTab === 'kpis') && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      <span>Primary KPI Widgets ({kpis.filter((k) => k.visible).length}/{kpis.length} Visible)</span>
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {kpis.map((kpi, index) => {
                      const Icon = getWidgetIcon(kpi.id);
                      const isDragged = draggedItem?.type === 'kpi' && draggedItem.index === index;
                      const isDragOver = draggedItem?.type === 'kpi' && dragOverIndex === index;

                      return (
                        <div
                          key={kpi.id}
                          draggable
                          onDragStart={() => handleDragStart('kpi', index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={() => handleDrop('kpi', index)}
                          onDragEnd={() => {
                            setDraggedItem(null);
                            setDragOverIndex(null);
                          }}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isDragged
                              ? 'opacity-40 border-dashed border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                              : isDragOver
                              ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 scale-[1.01]'
                              : kpi.visible
                              ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-2xs hover:border-slate-300'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              title="Drag to reorder"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 flex items-center justify-center shrink-0">
                              <Icon className="w-3.5 h-3.5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                                <span>{kpi.name}</span>
                                <span className="font-mono text-[10px] text-slate-400">#{index + 1}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {kpi.description}
                              </div>
                            </div>
                          </div>

                          {/* Reorder & Toggle Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => moveItem('kpi', index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveItem('kpi', index, 'down')}
                              disabled={index === kpis.length - 1}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => toggleVisibility('kpi', kpi.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                kpi.visible
                                  ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60'
                                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                              title={kpi.visible ? 'Hide from dashboard' : 'Show on dashboard'}
                            >
                              {kpi.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Main Dashboard Sections */}
              {(activeTab === 'all' || activeTab === 'sections') && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        Main Sections & Feeds ({sections.filter((s) => s.visible).length}/{sections.length} Visible)
                      </span>
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {sections.map((section, index) => {
                      const Icon = getWidgetIcon(section.id);
                      const isDragged = draggedItem?.type === 'section' && draggedItem.index === index;
                      const isDragOver = draggedItem?.type === 'section' && dragOverIndex === index;

                      return (
                        <div
                          key={section.id}
                          draggable
                          onDragStart={() => handleDragStart('section', index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={() => handleDrop('section', index)}
                          onDragEnd={() => {
                            setDraggedItem(null);
                            setDragOverIndex(null);
                          }}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isDragged
                              ? 'opacity-40 border-dashed border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                              : isDragOver
                              ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 scale-[1.01]'
                              : section.visible
                              ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-2xs hover:border-slate-300'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              title="Drag to reorder"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                                section.id === 'section_activity_feed'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                                  : 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-900'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                                <span>{section.name}</span>
                                {section.id === 'section_activity_feed' && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[9px] font-bold">
                                    Real-Time
                                  </span>
                                )}
                                <span className="font-mono text-[10px] text-slate-400">#{index + 1}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {section.description}
                              </div>
                            </div>
                          </div>

                          {/* Reorder & Toggle Controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => moveItem('section', index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveItem('section', index, 'down')}
                              disabled={index === sections.length - 1}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => toggleVisibility('section', section.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                section.visible
                                  ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                              title={section.visible ? 'Hide from dashboard' : 'Show on dashboard'}
                            >
                              {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Changes are saved to your profile and persist across sessions.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Dashboard Layout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
