import React, { useState } from 'react';
import {
  Truck,
  Package,
  Search,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Barcode,
  Plus,
  ArrowRight,
  Filter
} from 'lucide-react';
import { TruckStockItem, ServiceTechnician } from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';

interface TruckStockViewProps {
  truckStock: TruckStockItem[];
  technicians: ServiceTechnician[];
  onRefresh: () => void;
}

export const TruckStockView: React.FC<TruckStockViewProps> = ({
  truckStock,
  technicians,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechId, setSelectedTechId] = useState<string>('all');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scannedItem, setScannedItem] = useState<TruckStockItem | null>(null);

  const filteredStock = truckStock.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm) ||
      item.truckPlate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTech = selectedTechId === 'all' || item.technicianId === selectedTechId;
    return matchesSearch && matchesTech;
  });

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const found = truckStock.find((s) => s.barcode === barcodeInput || s.sku.toLowerCase() === barcodeInput.toLowerCase());
    setScannedItem(found || null);
    if (!found) {
      alert(`No truck stock found with barcode / SKU: ${barcodeInput}`);
    }
  };

  const handleReplenish = (stockId: string) => {
    serviceStorage.replenishTruckStock(stockId, 2);
    onRefresh();
  };

  const lowStockCount = truckStock.filter((item) => item.currentStock <= item.minThreshold).length;

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-bold">
              <Truck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                6. Truck Stock & Mobile Van Inventory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time technician vehicle stock tracking, barcode lookup, threshold alerts & central warehouse replenishment.
              </p>
            </div>
          </div>
        </div>

        {/* Barcode scanner simulator */}
        <form onSubmit={handleBarcodeScan} className="flex items-center gap-2">
          <div className="relative">
            <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Scan Barcode / SKU..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Lookup
          </button>
        </form>
      </div>

      {/* Scanned Barcode Card if found */}
      {scannedItem && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <Barcode className="w-6 h-6 text-emerald-600" />
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">{scannedItem.name}</div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                SKU: {scannedItem.sku} • In Van {scannedItem.truckPlate}: {scannedItem.currentStock} {scannedItem.unit}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReplenish(scannedItem.id)}
              className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs"
            >
              + Replenish 2 Units
            </button>
            <button onClick={() => setScannedItem(null)} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
          </div>
        </div>
      )}

      {/* Filter and Overview Cards */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Filter Van / Technician:</span>
          <select
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(e.target.value)}
            className="text-xs py-1.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="all">All Service Vans ({truckStock.length} items)</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>{t.name} ({t.truckPlate})</option>
            ))}
          </select>
        </div>

        {lowStockCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4" />
            <span>{lowStockCount} van stock items at or below safety threshold</span>
          </div>
        )}
      </div>

      {/* Stock Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Van / Technician</th>
                <th className="py-3 px-4">Barcode</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-center">Min Threshold</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStock.map((item) => {
                const isLow = item.currentStock <= item.minThreshold;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{item.sku} • {item.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{item.technicianName}</div>
                      <div className="text-[10px] text-slate-400">{item.truckPlate}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {item.barcode}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isLow
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500 font-mono">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                      ₹{item.unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleReplenish(item.id)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-bold rounded-lg transition-colors border border-blue-200 dark:border-blue-800 text-[11px]"
                      >
                        Replenish
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
