import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  ShoppingCart,
  Building2,
  Truck,
  Layers,
  Sparkles,
  ShieldAlert,
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react';
import { Project, Vendor, POItem, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { RBAC } from '../utils/rbac';

interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  vendors: Vendor[];
  currentRole: UserRole;
  onPOCreated?: () => void;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({
  isOpen,
  onClose,
  projects,
  vendors,
  currentRole,
  onPOCreated
}) => {
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [customProjectName, setCustomProjectName] = useState<string>('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    'Central Warehouse Yard B, HVAC ERP Depot, Electronic City, Bangalore / Site Drop'
  );
  const [paymentTerms, setPaymentTerms] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitAs, setSubmitAs] = useState<'Pending Approval' | 'Draft'>('Pending Approval');

  const [items, setItems] = useState<POItem[]>([
    {
      sku: 'VRF-ODU-20HP',
      name: 'Daikin VRV X Series ODU 20 HP (56kW)',
      orderedQty: 2,
      receivedQty: 0,
      unit: 'Nos',
      unitRate: 690000,
      taxRatePct: 18,
      totalAmount: 1628400
    }
  ]);

  if (!isOpen) return null;

  const canCreate = RBAC.canCreatePO(currentRole);
  const inventory = storageService.getInventory();
  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        sku: 'MISC-EQUIP',
        name: 'Cast Iron Butterfly Valve 6" Flanged PN16 with EPDM Seat',
        orderedQty: 4,
        receivedQty: 0,
        unit: 'Nos',
        unitRate: 18500,
        taxRatePct: 18,
        totalAmount: 87320
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof POItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'sku') {
      const inv = inventory.find((i) => i.sku === value);
      if (inv) {
        item.name = inv.name;
        item.unit = inv.unit;
        item.unitRate = inv.averageUnitCost || 0;
      }
    }

    if (field === 'orderedQty' || field === 'unitRate' || field === 'taxRatePct' || field === 'sku') {
      const qty = field === 'orderedQty' ? Number(value) || 0 : item.orderedQty;
      const rate = field === 'unitRate' ? Number(value) || 0 : item.unitRate;
      const tax = field === 'taxRatePct' ? Number(value) || 0 : item.taxRatePct;
      const sub = qty * rate;
      item.totalAmount = Math.round(sub + (sub * tax) / 100);
    }

    updated[index] = item;
    setItems(updated);
  };

  const subtotal = items.reduce((s, it) => s + it.orderedQty * it.unitRate, 0);
  const taxAmount = Math.round(items.reduce((s, it) => s + (it.orderedQty * it.unitRate * (it.taxRatePct || 18)) / 100, 0));
  const shippingCharges = subtotal > 1000000 ? 25000 : 8000;
  const grandTotal = subtotal + taxAmount + shippingCharges;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreate) {
      alert('Your current role does not have permission to create Purchase Orders.');
      return;
    }

    if (!selectedVendorId) {
      alert('Please select a vendor.');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one line item.');
      return;
    }

    const selectedProj = projects.find((p) => p.id === selectedProjectId);

    storageService.createPO({
      projectId: selectedProjectId || undefined,
      projectName: selectedProj ? selectedProj.projectName : customProjectName || 'Direct Vendor Replenishment',
      vendorId: selectedVendorId,
      expectedDeliveryDate,
      deliveryAddress,
      items,
      shippingCharges,
      paymentTerms: paymentTerms || `${selectedVendor?.creditPeriodDays || 30} days net credit as per OEM dealer agreement`,
      notes,
      status: submitAs
    });

    if (onPOCreated) onPOCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Create Purchase Order (PO)</h2>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Vendor Procurement
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generate formal purchase order for equipment & materials with automated GST and vendor routing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Warning Banner */}
        {!canCreate && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Your active persona (<strong>{currentRole}</strong>) does not have PO creation permission. Switch to Procurement, Sales/Business Manager, or Admin.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Row 1: Vendor Selection & Vendor Details Pill */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Target Vendor / OEM *
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => {
                  setSelectedVendorId(e.target.value);
                  const v = vendors.find((vend) => vend.id === e.target.value);
                  if (v) {
                    setPaymentTerms(`${v.creditPeriodDays} days net credit as per OEM dealer agreement`);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.category})
                  </option>
                ))}
              </select>
            </div>

            {selectedVendor && (
              <div className="lg:col-span-2 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-emerald-950">{selectedVendor.name}</div>
                  <div className="text-emerald-700 text-[11px]">
                    GSTIN: <span className="font-mono font-semibold">{selectedVendor.gstNumber}</span> • Contact: {selectedVendor.contactPerson} ({selectedVendor.phone})
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                    Credit: {selectedVendor.creditPeriodDays} Days
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                    Rating: {selectedVendor.rating} ★
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Project, Expected Delivery, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Linked Project (Optional)
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              >
                <option value="">-- General / Warehouse Stock Replenishment --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectNumber} - {p.projectName}
                  </option>
                ))}
              </select>
              {!selectedProjectId && (
                <input
                  type="text"
                  placeholder="Or enter custom requirement description..."
                  value={customProjectName}
                  onChange={(e) => setCustomProjectName(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Expected Delivery Date *
              </label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Workflow Status
              </label>
              <select
                value={submitAs}
                onChange={(e) => setSubmitAs(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              >
                <option value="Pending Approval">Submit for Business Manager Approval</option>
                <option value="Draft">Save as Draft PO</option>
              </select>
            </div>
          </div>

          {/* Row 3: Delivery Address & Payment Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Delivery / Site Address
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                Payment Terms & Schedule
              </label>
              <input
                type="text"
                placeholder="e.g. 30 days credit against invoice and physical inspection report"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  PO Line Items ({items.length})
                </h3>
                <span className="text-[11px] text-slate-400">Specify SKU, quantities, negotiated rates & GST</span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 w-10">#</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Item Description / SKU</th>
                      <th className="py-2.5 px-3 w-24 text-right">Order Qty</th>
                      <th className="py-2.5 px-3 w-20">Unit</th>
                      <th className="py-2.5 px-3 w-32 text-right">Unit Rate (₹)</th>
                      <th className="py-2.5 px-3 w-20 text-right">GST %</th>
                      <th className="py-2.5 px-3 w-36 text-right">Line Total Inc. GST (₹)</th>
                      <th className="py-2.5 px-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-400">{index + 1}</td>
                        <td className="py-2 px-3">
                          <div className="space-y-1">
                            <select
                              value={item.sku}
                              onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="CUSTOM-ITEM">-- Custom Material / Equipment --</option>
                              {inventory.map((inv) => (
                                <option key={inv.id} value={inv.sku}>
                                  [{inv.sku}] {(inv.name || '').substring(0, 45)}...
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              placeholder="Line item description..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="1"
                            value={item.orderedQty}
                            onChange={(e) => handleItemChange(index, 'orderedQty', e.target.value)}
                            className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-right font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.unitRate}
                            onChange={(e) => handleItemChange(index, 'unitRate', e.target.value)}
                            className="w-28 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-right font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            max="28"
                            value={item.taxRatePct}
                            onChange={(e) => handleItemChange(index, 'taxRatePct', e.target.value)}
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-right font-semibold text-slate-700"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          ₹{item.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Financial Breakdown & Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Special Procurement Notes / Terms
              </label>
              <textarea
                rows={2}
                placeholder="Include transport LR requirements, calibration certificates, or packaging instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({items.length} items):</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated GST (18% Avg):</span>
                <span className="font-semibold text-slate-900">₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Freight & Insurance:</span>
                <span className="font-semibold text-slate-900">₹{shippingCharges.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-900">PO Grand Total:</span>
                <span className="text-base font-black text-emerald-700">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canCreate || items.length === 0}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Create Purchase Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
