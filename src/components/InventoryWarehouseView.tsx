import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Plus,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  TrendingDown,
  Layers,
  Building,
  RefreshCw,
  Edit,
  DollarSign,
  ShieldAlert,
  ShoppingCart,
  Zap,
  Info
} from 'lucide-react';
import { InventoryItem } from '../types';
import { storageService } from '../services/storageService';
import { PredictiveInventoryReorderPanel } from './PredictiveInventoryReorderPanel';

interface InventoryWarehouseViewProps {
  inventory: InventoryItem[];
  onOpenSheetsModal: () => void;
}

export const InventoryWarehouseView: React.FC<InventoryWarehouseViewProps> = ({
  inventory,
  onOpenSheetsModal
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState<'ALL' | 'CRITICAL_SAFETY' | 'DEFICIT' | 'ADEQUATE'>('ALL');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Physical Stock Audit Count');
  const [auditSuccessMsg, setAuditSuccessMsg] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const categories = Array.from(new Set(inventory.map((i) => i.category)));

  // Safety stock calculations: 10% threshold
  const getSafetyStockDetails = (item: InventoryItem) => {
    const safetyThreshold = item.reorderLevel > 0 ? Number((item.reorderLevel * 0.10).toFixed(1)) : 0;
    const isCritical = item.availableStock <= safetyThreshold || item.availableStock <= 0;
    const isLow = item.availableStock <= item.reorderLevel;
    const safetyPercentage = item.reorderLevel > 0 
      ? Math.max(0, Math.round((item.availableStock / item.reorderLevel) * 100))
      : (item.availableStock > 0 ? 100 : 0);

    return {
      safetyThreshold,
      isCritical,
      isLow,
      safetyPercentage
    };
  };

  const criticalItems = inventory.filter((item) => getSafetyStockDetails(item).isCritical);
  const lowStockItems = inventory.filter((item) => getSafetyStockDetails(item).isLow);
  const adequateItems = inventory.filter((item) => !getSafetyStockDetails(item).isLow);

  const term = (search || '').trim().toLowerCase();
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      !term ||
      (item.sku || '').toLowerCase().includes(term) ||
      (item.name || '').toLowerCase().includes(term) ||
      (item.manufacturer || '').toLowerCase().includes(term) ||
      (item.location || '').toLowerCase().includes(term);

    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;

    const { isCritical, isLow } = getSafetyStockDetails(item);
    const matchesHealth =
      healthFilter === 'ALL' ||
      (healthFilter === 'CRITICAL_SAFETY' && isCritical) ||
      (healthFilter === 'DEFICIT' && isLow) ||
      (healthFilter === 'ADEQUATE' && !isLow);

    return matchesSearch && matchesCategory && matchesHealth;
  });

  const totalValuation = inventory.reduce((sum, i) => sum + i.currentStock * i.averageUnitCost, 0);

  const handleRunSafetyAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const result = storageService.checkSafetyStockAlerts(true);
      setIsAuditing(false);
      setAuditSuccessMsg(
        `Safety Audit Complete: Scanned ${inventory.length} items. Flagged ${result.flaggedItems.length} items below 10% safety stock threshold. Notifications dispatched.`
      );
      setTimeout(() => setAuditSuccessMsg(null), 5000);
    }, 400);
  };

  const handleQuickPRGeneration = (item: InventoryItem) => {
    const reqQty = Math.max(item.reorderLevel * 2, 10);
    storageService.createPR({
      projectName: 'Warehouse Stock Replenishment',
      priority: 'Urgent',
      items: [
        {
          sku: item.sku,
          name: item.name,
          category: item.category,
          requiredQty: reqQty,
          unit: item.unit,
          estimatedUnitCost: item.averageUnitCost,
          estimatedTotal: reqQty * item.averageUnitCost,
          reason: `Stock deficit: Available stock is below 10% safety threshold (${item.availableStock} / ${item.reorderLevel} ${item.unit})`
        }
      ],
      justification: `Urgent stock replenishment: Available stock (${item.availableStock} ${item.unit}) has breached the 10% safety threshold of ${item.reorderLevel} ${item.unit}.`
    });

    setAuditSuccessMsg(`Purchase Requisition (PR) generated for ${item.sku} (${reqQty} ${item.unit})`);
    setTimeout(() => setAuditSuccessMsg(null), 4000);
  };

  const handleStockAdjustSubmit = () => {
    if (!editingItem) return;
    const newStock = Math.max(0, editingItem.currentStock + adjustmentQty);
    storageService.updateInventoryItem(editingItem.id, {
      currentStock: newStock
    });
    setEditingItem(null);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              HVAC Warehouse & Inventory Ledger
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {inventory.length} SKUs Tracked
            </span>
            {criticalItems.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-3 h-3" />
                {criticalItems.length} Below 10% Safety Stock
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Real-time physical stock, allocated project items, 10% safety stock threshold alarms, and automated PR replenishment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRunSafetyAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
            title="Scan inventory for items under 10% safety stock and dispatch system notifications"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isAuditing ? 'Auditing...' : 'Run Safety Stock Scan'}</span>
          </button>

          <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-800 hidden sm:block">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Valuation</div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ₹{(totalValuation / 100000).toFixed(2)} Lakhs
            </div>
          </div>
        </div>
      </div>

      {/* Audit Success Toast Notification */}
      {auditSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{auditSuccessMsg}</span>
          </div>
          <button
            onClick={() => setAuditSuccessMsg(null)}
            className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Automated Safety Stock Warning Banner (When items < 10%) */}
      {criticalItems.length > 0 && (
        <div className="bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl shrink-0 mt-0.5">
                <AlertOctagon className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                  <span>Automated Safety Stock Alert:</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-200/80 dark:bg-rose-900/80 text-rose-900 dark:text-rose-100 font-mono text-[11px]">
                    {criticalItems.length} SKU{criticalItems.length > 1 ? 's' : ''} &le; 10% Threshold
                  </span>
                </h4>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                  The following items have available stock at or below 10% of their designated safety reorder level:{' '}
                  <span className="font-semibold font-mono">
                    {criticalItems.map((i) => `${i.sku} (${i.availableStock} ${i.unit})`).join(', ')}
                  </span>
                  . Immediate purchase requisition is recommended to prevent project installation halts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setHealthFilter('CRITICAL_SAFETY')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Filter Critical Items</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Predictive Reorder & Historical Consumption Analysis Section */}
      <PredictiveInventoryReorderPanel
        inventory={inventory}
        onPRCreated={(msg) => {
          setAuditSuccessMsg(msg);
          setTimeout(() => setAuditSuccessMsg(null), 5000);
        }}
      />

      {/* Filters & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU, item name, OEM, location..."
            className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 text-xs placeholder-slate-400 font-medium"
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
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
            <span className="hidden sm:inline">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 text-xs font-medium"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Health Filter */}
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
            <span className="hidden sm:inline">Stock Status:</span>
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value as any)}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                healthFilter === 'CRITICAL_SAFETY'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <option value="ALL">All Stock ({inventory.length})</option>
              <option value="CRITICAL_SAFETY">🚨 Critical &le; 10% Safety ({criticalItems.length})</option>
              <option value="DEFICIT">⚠️ Reorder Deficit ({lowStockItems.length})</option>
              <option value="ADEQUATE">✅ Adequate Stock ({adequateItems.length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">SKU & Item Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Manufacturer</th>
                <th className="py-3.5 px-4 text-center">Physical</th>
                <th className="py-3.5 px-4 text-center">Allocated</th>
                <th className="py-3.5 px-4 text-center">Available Stock</th>
                <th className="py-3.5 px-4 text-center">Reorder (10% Safety)</th>
                <th className="py-3.5 px-4 text-right">Avg Cost</th>
                <th className="py-3.5 px-4 text-right">Asset Value</th>
                <th className="py-3.5 px-4 text-center">Location</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                    No inventory records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const { safetyThreshold, isCritical, isLow, safetyPercentage } = getSafetyStockDetails(item);
                  const assetVal = item.currentStock * item.averageUnitCost;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isCritical
                          ? 'bg-rose-50/50 dark:bg-rose-950/20'
                          : isLow
                          ? 'bg-amber-50/40 dark:bg-amber-950/15'
                          : ''
                      }`}
                    >
                      {/* SKU & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                                {item.sku}
                              </span>
                              {isCritical && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                  CRITICAL &le; 10%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                        {item.manufacturer}
                      </td>

                      {/* Physical */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-slate-100 font-mono whitespace-nowrap">
                        {item.currentStock} {item.unit}
                      </td>

                      {/* Allocated */}
                      <td className="py-3.5 px-4 text-center text-slate-500 dark:text-slate-400 font-medium font-mono whitespace-nowrap">
                        {item.allocatedStock} {item.unit}
                      </td>

                      {/* Available with safety indicator */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] border flex items-center gap-1 ${
                              isCritical
                                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-mono animate-pulse'
                                : isLow
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {isCritical && <AlertOctagon className="w-3 h-3" />}
                            {item.availableStock} {item.unit}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5 font-mono">
                            {safetyPercentage}% of reorder
                          </span>
                        </div>
                      </td>

                      {/* Reorder & 10% Safety Threshold */}
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">
                        <div className="font-bold">{item.reorderLevel} {item.unit}</div>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500">
                          10% Min: <span className="font-semibold text-rose-600 dark:text-rose-400">{safetyThreshold} {item.unit}</span>
                        </div>
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        ₹{item.averageUnitCost.toLocaleString()}
                      </td>

                      {/* Asset Value */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        ₹{assetVal.toLocaleString()}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-center text-slate-500 dark:text-slate-400 text-[11px] font-medium whitespace-nowrap">
                        {item.location}
                      </td>

                      {/* Actions: Adjust & Quick PR */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isLow && (
                            <button
                              onClick={() => handleQuickPRGeneration(item)}
                              className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition-colors shadow-xs"
                              title="Create Immediate Purchase Requisition (PR)"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setAdjustmentQty(0);
                            }}
                            className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
                            title="Adjust Physical Stock"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Stock Adjustment</h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold">
                  {editingItem.sku} • {editingItem.name}
                </p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Current Physical Count:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {editingItem.currentStock} {editingItem.unit}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Stock Change (+ to add, - to subtract):
                </label>
                <input
                  type="number"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                  placeholder="e.g. +10 or -5"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 text-center text-sm font-mono"
                />
              </div>

              {(() => {
                const projectedPhysical = Math.max(0, editingItem.currentStock + adjustmentQty);
                const projectedAvailable = projectedPhysical - editingItem.allocatedStock;
                const safetyThreshold = editingItem.reorderLevel * 0.10;
                const isProjectedCritical = projectedAvailable <= safetyThreshold;

                return (
                  <div
                    className={`p-3 border rounded-xl text-xs space-y-1 ${
                      isProjectedCritical
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">New Physical Stock:</span>
                      <strong className="font-bold font-mono text-sm">
                        {projectedPhysical} {editingItem.unit}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span>New Available Free Stock:</span>
                      <strong className="font-bold font-mono">
                        {projectedAvailable} {editingItem.unit}
                      </strong>
                    </div>
                    {isProjectedCritical && (
                      <p className="text-[10px] text-rose-700 dark:text-rose-300 font-semibold pt-1 border-t border-rose-200 dark:border-rose-800 flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3 shrink-0" />
                        Warning: This will drop available stock below the 10% safety threshold ({safetyThreshold} {editingItem.unit}). An automated alert will trigger.
                      </p>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Adjustment Reason / Audit Note:
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Physical audit count, scrap, transfer..."
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStockAdjustSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
