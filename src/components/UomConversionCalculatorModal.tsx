import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Calculator,
  ArrowRightLeft,
  Copy,
  Check,
  Package,
  Layers,
  Scale,
  Wind,
  Thermometer,
  Ruler,
  Maximize2,
  Gauge,
  Boxes,
  Info,
  ChevronDown,
  Sparkles,
  Search,
  ExternalLink
} from 'lucide-react';
import {
  UOM_CATEGORIES,
  UomCategory,
  convertUomValue,
  convertUnitRate,
  detectUomCategory,
  getUnitMatrix,
  UomUnit
} from '../utils/uomConverter';
import { InventoryItem } from '../types';

interface UomConversionCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  preselectedItem?: InventoryItem | null;
  onApplyConversionToItem?: (itemSku: string, targetUnit: string, convertedRate: number) => void;
}

export const UomConversionCalculatorModal: React.FC<UomConversionCalculatorModalProps> = ({
  isOpen,
  onClose,
  inventory,
  preselectedItem,
  onApplyConversionToItem
}) => {
  if (!isOpen) return null;

  // Active view tab: 'item' (item-linked) | 'quick' (engineering quick converter) | 'matrix' (full unit matrix cheat sheet)
  const [activeTab, setActiveTab] = useState<'item' | 'quick' | 'matrix'>('item');

  // Selected Inventory Item
  const [selectedSku, setSelectedSku] = useState<string>(preselectedItem?.sku || (inventory[0]?.sku || ''));
  const [itemSearch, setItemSearch] = useState<string>('');
  const [showItemDropdown, setShowItemDropdown] = useState<boolean>(false);

  const currentItem = useMemo(() => {
    return inventory.find((i) => i.sku === selectedSku) || preselectedItem || inventory[0] || null;
  }, [inventory, selectedSku, preselectedItem]);

  // Detected or selected Category
  const [category, setCategory] = useState<UomCategory>('length');
  const [fromUnitId, setFromUnitId] = useState<string>('m');
  const [toUnitId, setToUnitId] = useState<string>('ft');

  // Input Value
  const [inputValue, setInputValue] = useState<number>(10);
  const [customMultiplier, setCustomMultiplier] = useState<number>(50); // for Box / Bundle custom counts

  // Custom base unit rate (from item or manual)
  const [customRate, setCustomRate] = useState<number>(currentItem?.averageUnitCost || 100);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Sync category & units when currentItem changes
  useEffect(() => {
    if (currentItem) {
      setCustomRate(currentItem.averageUnitCost || 100);
      const detected = detectUomCategory(currentItem.unit);
      if (detected) {
        setCategory(detected.category);
        setFromUnitId(detected.unitId);
        // Pick an intuitive default target unit
        const units = UOM_CATEGORIES[detected.category].units;
        const fallbackTarget = units.find((u) => u.id !== detected.unitId)?.id || units[0]?.id || detected.unitId;
        setToUnitId(fallbackTarget);
      }
    }
  }, [currentItem?.sku]);

  // Filtered Items for dropdown
  const filteredItems = useMemo(() => {
    const term = itemSearch.trim().toLowerCase();
    if (!term) return inventory.slice(0, 20);
    return inventory
      .filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          i.sku.toLowerCase().includes(term) ||
          i.category.toLowerCase().includes(term) ||
          i.unit.toLowerCase().includes(term)
      )
      .slice(0, 20);
  }, [inventory, itemSearch]);

  // Category change handler
  const handleCategorySelect = (newCat: UomCategory) => {
    setCategory(newCat);
    const units = UOM_CATEGORIES[newCat].units;
    if (units.length > 0) {
      setFromUnitId(units[0].id);
      setToUnitId(units.length > 1 ? units[1].id : units[0].id);
    }
  };

  // Swap units handler
  const handleSwapUnits = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
  };

  // Calculations
  const convertedQty = useMemo(() => {
    return convertUomValue(inputValue, fromUnitId, toUnitId, category, customMultiplier);
  }, [inputValue, fromUnitId, toUnitId, category, customMultiplier]);

  const convertedUnitRate = useMemo(() => {
    return convertUnitRate(customRate, fromUnitId, toUnitId, category, customMultiplier);
  }, [customRate, fromUnitId, toUnitId, category, customMultiplier]);

  const totalBaseCost = useMemo(() => {
    return inputValue * customRate;
  }, [inputValue, customRate]);

  const totalTargetCost = useMemo(() => {
    return convertedQty * convertedUnitRate;
  }, [convertedQty, convertedUnitRate]);

  const activeCategoryDef = UOM_CATEGORIES[category];
  const fromUnitObj = activeCategoryDef?.units.find((u) => u.id === fromUnitId);
  const toUnitObj = activeCategoryDef?.units.find((u) => u.id === toUnitId);

  // Full Unit Matrix for active input
  const unitMatrix = useMemo(() => {
    return getUnitMatrix(inputValue, fromUnitId, category, customMultiplier);
  }, [inputValue, fromUnitId, category, customMultiplier]);

  // Quick Preset Handlers
  const applyPreset = (cat: UomCategory, from: string, to: string, val: number) => {
    setCategory(cat);
    setFromUnitId(from);
    setToUnitId(to);
    setInputValue(val);
  };

  // Category Icon helper
  const getCategoryIcon = (catId: UomCategory) => {
    switch (catId) {
      case 'capacity':
        return Thermometer;
      case 'airflow':
        return Wind;
      case 'length':
        return Ruler;
      case 'area':
        return Maximize2;
      case 'weight':
        return Scale;
      case 'volume':
        return Package;
      case 'pressure':
        return Gauge;
      case 'packaging':
        return Boxes;
      default:
        return Calculator;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Unit of Measure (UoM) Converter</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/30 text-blue-200 border border-blue-400/40">
                  MEP & HVAC Core
                </span>
              </div>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Thermal capacity, airflow, piping lengths, sheet metal area, weights & unit cost estimator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Category Ribbon */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 sm:px-6 pt-3 shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Main Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('item')}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'item'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Item-Linked Estimator</span>
              </button>

              <button
                onClick={() => setActiveTab('quick')}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'quick'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Engineering Quick Converter</span>
              </button>

              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'matrix'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Multi-Unit Cheat Sheet</span>
              </button>
            </div>

            {/* Dimensional Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 custom-scrollbar">
              {(Object.keys(UOM_CATEGORIES) as UomCategory[]).map((catId) => {
                const Icon = getCategoryIcon(catId);
                const isSelected = category === catId;
                return (
                  <button
                    key={catId}
                    onClick={() => handleCategorySelect(catId)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{UOM_CATEGORIES[catId].name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {/* TAB 1: ITEM-LINKED ESTIMATOR */}
          {activeTab === 'item' && (
            <div className="space-y-4">
              {/* Item Selector Card */}
              <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl relative">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Linked Master Inventory Item</span>
                  {currentItem && (
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                      SKU: {currentItem.sku}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Item Dropdown / Search Trigger */}
                  <div className="relative flex-1">
                    <div
                      onClick={() => setShowItemDropdown(!showItemDropdown)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors shadow-xs"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div className="truncate text-left">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {currentItem ? currentItem.name : 'Select Inventory Item...'}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {currentItem
                              ? `${currentItem.category} • Base Unit: ${currentItem.unit} • ₹${(currentItem.averageUnitCost || 0).toLocaleString('en-IN')}`
                              : 'Click to select from catalog'}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>

                    {/* Popover Dropdown */}
                    {showItemDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-72 flex flex-col">
                        <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Search item name, SKU, or category..."
                              value={itemSearch}
                              onChange={(e) => setItemSearch(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-blue-500"
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-1">
                          {filteredItems.map((item) => (
                            <div
                              key={item.sku}
                              onClick={() => {
                                setSelectedSku(item.sku);
                                setShowItemDropdown(false);
                              }}
                              className={`p-2.5 rounded-xl cursor-pointer text-xs flex items-center justify-between gap-2 transition-colors ${
                                item.sku === currentItem?.sku
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="font-semibold truncate">{item.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {item.sku} • {item.category}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-[10px] font-mono font-bold">
                                  {item.unit}
                                </span>
                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                  ₹{item.averageUnitCost.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stock & Unit Cost Indicators */}
                  {currentItem && (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-left">
                        <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Current Stock</div>
                        <div className="text-xs font-mono font-black text-slate-900 dark:text-white">
                          {currentItem.currentStock} {currentItem.unit}
                        </div>
                      </div>

                      <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-left">
                        <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400">Base Unit Cost</div>
                        <div className="text-xs font-mono font-black text-slate-900 dark:text-white">
                          ₹{customRate.toLocaleString('en-IN')} / {fromUnitObj?.symbol || currentItem.unit}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Conversion Calculator Workspace */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source Input Card */}
                <div className="p-4 bg-white dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800/80 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Source Measure (Base)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">From Unit</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Quantity to Convert
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        value={inputValue}
                        onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 text-base font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      <select
                        value={fromUnitId}
                        onChange={(e) => setFromUnitId(e.target.value)}
                        className="px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer"
                      >
                        {activeCategoryDef.units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.symbol} — {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                      <span>Rate per {fromUnitObj?.symbol || 'Unit'}:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold font-mono">₹</span>
                        <input
                          type="number"
                          step="any"
                          value={customRate}
                          onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                          className="w-28 px-2 py-1 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-right"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>Total Source Valuation:</span>
                      <span className="font-mono text-blue-700 dark:text-blue-400">
                        ₹{totalBaseCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Converted Card */}
                <div className="p-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 border-2 border-emerald-300 dark:border-emerald-800/80 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      Converted Result (Target)
                    </span>
                    <button
                      onClick={handleSwapUnits}
                      className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                      title="Swap units"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Target UoM Unit
                    </label>
                    <select
                      value={toUnitId}
                      onChange={(e) => setToUnitId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer"
                    >
                      {activeCategoryDef.units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.symbol} — {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* High Visibility Result Metric */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Converted Quantity</div>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {convertedQty.toLocaleString('en-IN', { maximumFractionDigits: 3 })}
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {toUnitObj?.symbol}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Converted Unit Rate:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        ₹{convertedUnitRate.toFixed(2)} / {toUnitObj?.symbol}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white pt-1">
                    <span>Target Valuation (Cross Check):</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400">
                      ₹{totalTargetCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Packaging Multiplier Customizer (if packaging or box/bundle) */}
              {(category === 'packaging' || fromUnitId === 'box' || toUnitId === 'box' || fromUnitId === 'bundle' || toUnitId === 'bundle') && (
                <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <Boxes className="w-4 h-4 shrink-0 text-amber-600" />
                    <div>
                      <span className="font-bold">Custom Packaging Factor:</span> How many base pieces / meters are inside 1 Box or Bundle?
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      value={customMultiplier}
                      onChange={(e) => setCustomMultiplier(Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-20 px-2 py-1 font-mono font-bold text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-right"
                    />
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">pieces/box</span>
                  </div>
                </div>
              )}

              {/* Formula & Explanatory Summary Bar */}
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    <strong>Conversion Ratio:</strong> 1 {fromUnitObj?.symbol} = {(convertUomValue(1, fromUnitId, toUnitId, category, customMultiplier)).toFixed(4)} {toUnitObj?.symbol} • Rate inverse: 1 {toUnitObj?.symbol} = ₹{convertedUnitRate.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() =>
                      handleCopy(
                        `${inputValue} ${fromUnitObj?.symbol} = ${convertedQty.toFixed(3)} ${toUnitObj?.symbol} (@ ₹${convertedUnitRate.toFixed(2)}/${toUnitObj?.symbol} = Total ₹${totalTargetCost.toFixed(2)})`,
                        'summary'
                      )
                    }
                    className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {copiedKey === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'summary' ? 'Copied!' : 'Copy Summary'}</span>
                  </button>

                  {onApplyConversionToItem && currentItem && (
                    <button
                      onClick={() => onApplyConversionToItem(currentItem.sku, toUnitObj?.symbol || toUnitId, convertedUnitRate)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Apply to Item</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENGINEERING QUICK CONVERTER */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              {/* Category Quick Selector Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(Object.keys(UOM_CATEGORIES) as UomCategory[]).map((catId) => {
                  const Icon = getCategoryIcon(catId);
                  const isSelected = category === catId;
                  const catDef = UOM_CATEGORIES[catId];
                  return (
                    <button
                      key={catId}
                      onClick={() => handleCategorySelect(catId)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-900 dark:text-blue-100 shadow-sm ring-1 ring-blue-500'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-mono text-slate-400">{catDef.units.length} units</span>
                      </div>
                      <div className="text-xs font-bold truncate">{catDef.name}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{catDef.description}</div>
                    </button>
                  );
                })}
              </div>

              {/* Two-way Converter Display */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
                  {/* Left: Input */}
                  <div className="sm:col-span-5 space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Input Value & Unit
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={inputValue}
                      onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 text-lg font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <select
                      value={fromUnitId}
                      onChange={(e) => setFromUnitId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer"
                    >
                      {activeCategoryDef.units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.symbol} ({u.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Middle: Swap Button */}
                  <div className="sm:col-span-1 flex justify-center py-2 sm:py-0">
                    <button
                      onClick={handleSwapUnits}
                      className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-xs"
                      title="Swap From and To units"
                    >
                      <ArrowRightLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Right: Output */}
                  <div className="sm:col-span-5 space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Calculated Conversion
                    </label>
                    <div className="w-full px-3.5 py-2.5 text-lg font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                      <span className="truncate">{convertedQty.toLocaleString('en-IN', { maximumFractionDigits: 4 })}</span>
                      <span className="text-xs text-slate-500 font-sans ml-2">{toUnitObj?.symbol}</span>
                    </div>
                    <select
                      value={toUnitId}
                      onChange={(e) => setToUnitId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer"
                    >
                      {activeCategoryDef.units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.symbol} ({u.name})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Popular HVAC / MEP Presets */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Popular Engineering Shortcuts & Standards
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyPreset('capacity', 'tr', 'kw', 1.5)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    1.5 TR (Split AC) ➔ kW
                  </button>
                  <button
                    onClick={() => applyPreset('capacity', 'tr', 'btuh', 2.0)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    2.0 TR (Cassette AC) ➔ BTU/hr
                  </button>
                  <button
                    onClick={() => applyPreset('airflow', 'cfm', 'cmh', 800)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    800 CFM (Fresh Air Fan) ➔ CMH
                  </button>
                  <button
                    onClick={() => applyPreset('length', 'm', 'ft', 1)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    1 Meter ➔ Feet (3.281 ft)
                  </button>
                  <button
                    onClick={() => applyPreset('area', 'sqm', 'sqft', 1)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    1 sq.m ➔ sq.ft (10.764 sq.ft)
                  </button>
                  <button
                    onClick={() => applyPreset('pressure', 'bar', 'psi', 1)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    1 Bar ➔ PSI (14.504 PSI)
                  </button>
                  <button
                    onClick={() => applyPreset('pressure', 'inwg', 'mmwc', 1)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    1 in.wg (Static ESP) ➔ mmWC
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MULTI-UNIT CHEAT SHEET MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Active Value:</span>
                  <input
                    type="number"
                    step="any"
                    value={inputValue}
                    onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 font-mono font-bold text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-right"
                  />
                  <select
                    value={fromUnitId}
                    onChange={(e) => setFromUnitId(e.target.value)}
                    className="px-2 py-1 font-bold text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
                  >
                    {activeCategoryDef.units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-slate-500 font-mono text-[11px]">
                  Category: <strong>{activeCategoryDef.name}</strong>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5">Unit Symbol</th>
                      <th className="px-4 py-2.5">Full Designation</th>
                      <th className="px-4 py-2.5">Converted Value</th>
                      <th className="px-4 py-2.5">Engineering Scope</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {unitMatrix.map(({ unit, formatted, isSource }) => (
                      <tr
                        key={unit.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          isSource ? 'bg-blue-50/70 dark:bg-blue-950/40 font-bold' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold">
                            {unit.symbol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold">{unit.name}</span>
                          {isSource && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono uppercase">
                              Baseline Source
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono font-black text-slate-900 dark:text-white text-sm">
                          {formatted}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {unit.description}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleCopy(formatted, `matrix-${unit.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                            title={`Copy ${formatted}`}
                          >
                            {copiedKey === `matrix-${unit.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">AlphaERP MEP Suite</span>
            <span>•</span>
            <span>Standard ASHRAE & ISHRAE Thermodynamic Formulas</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
