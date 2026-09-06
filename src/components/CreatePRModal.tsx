import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileCheck2,
  Building2,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { Project, PRItem, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { RBAC } from '../utils/rbac';

interface CreatePRModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentRole: UserRole;
  onPRCreated?: () => void;
}

export const CreatePRModal: React.FC<CreatePRModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentRole,
  onPRCreated
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [customProjectName, setCustomProjectName] = useState<string>('');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Standard'>('High');
  const [justification, setJustification] = useState<string>('');
  const [submitAs, setSubmitAs] = useState<'Pending Approval' | 'Draft'>('Pending Approval');

  const [items, setItems] = useState<PRItem[]>([
    {
      sku: 'COP-TUBE-0.75',
      name: 'Hard Drawn Copper Pipe 3/4" OD (19.05mm x 1.0mm wall)',
      category: 'Copper Pipes & Fittings',
      requiredQty: 50,
      unit: 'Meters',
      estimatedUnitCost: 950,
      estimatedTotal: 47500,
      reason: 'Riser piping replenishment'
    }
  ]);

  if (!isOpen) return null;

  const canCreate = RBAC.canCreatePR(currentRole);
  const inventory = storageService.getInventory();

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        sku: 'MISC-MAT-01',
        name: 'Aeroflex Class O Nitrile Rubber Insulation (19mm)',
        category: 'Ducting & Insulation',
        requiredQty: 20,
        unit: 'Tubes',
        estimatedUnitCost: 450,
        estimatedTotal: 9000,
        reason: 'Site installation requirement'
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PRItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'sku') {
      const inv = inventory.find((i) => i.sku === value);
      if (inv) {
        item.name = inv.name;
        item.category = inv.category;
        item.unit = inv.unit;
        item.estimatedUnitCost = inv.averageUnitCost || 0;
      }
    }

    if (field === 'requiredQty' || field === 'estimatedUnitCost' || field === 'sku') {
      const qty = field === 'requiredQty' ? Number(value) || 0 : item.requiredQty;
      const cost = field === 'estimatedUnitCost' ? Number(value) || 0 : item.estimatedUnitCost;
      item.estimatedTotal = qty * cost;
    }

    updated[index] = item;
    setItems(updated);
  };

  const totalEstimatedAmount = items.reduce((sum, it) => sum + (it.estimatedTotal || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreate) {
      alert('Your current role does not have permission to create Purchase Requisitions.');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one line item.');
      return;
    }

    const selectedProj = projects.find((p) => p.id === selectedProjectId);

    storageService.createPR({
      projectId: selectedProjectId || undefined,
      projectName: selectedProj ? selectedProj.projectName : customProjectName || 'General Stock Replenishment',
      priority,
      items,
      status: submitAs,
      justification
    });

    if (onPRCreated) onPRCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Create Purchase Requisition (PR)</h2>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-800">
                  Deficit & Replenishment
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Raise material demand for project BOQ shortages or warehouse stock replenishment
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

        {/* Permission Warning Banner if role cannot create */}
        {!canCreate && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Your active persona (<strong>{currentRole}</strong>) does not have PR creation permission. Switch to Procurement, Estimator, Sales Manager, Technician, or Admin.
            </span>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Row: Project, Priority, Justification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Linked Project (Optional)
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="">-- General Stock / Warehouse Replenishment --</option>
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
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Requisition Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="Standard">Standard (Regular replenishment schedule)</option>
                <option value="High">High (Project milestone critical)</option>
                <option value="Urgent">Urgent (Immediate site stoppage risk)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Initial Status
              </label>
              <select
                value={submitAs}
                onChange={(e) => setSubmitAs(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                <option value="Pending Approval">Submit for Procurement Manager Approval</option>
                <option value="Draft">Save as Working Draft</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Requisition Remarks / Engineering Justification
            </label>
            <input
              type="text"
              placeholder="e.g. Deficit copper tubes and dampers required for 4th floor VRF branch piping staging"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  Requisition Line Items ({items.length})
                </h3>
                <span className="text-[11px] text-slate-400">Select standard SKU or customize description</span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
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
                      <th className="py-2.5 px-3 min-w-[200px]">Item / SKU Selection</th>
                      <th className="py-2.5 px-3 w-28">Category</th>
                      <th className="py-2.5 px-3 w-24 text-right">Req Qty</th>
                      <th className="py-2.5 px-3 w-20">Unit</th>
                      <th className="py-2.5 px-3 w-32 text-right">Est. Unit Cost (₹)</th>
                      <th className="py-2.5 px-3 w-32 text-right">Est. Total (₹)</th>
                      <th className="py-2.5 px-3 min-w-[150px]">Reason / Application</th>
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
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="CUSTOM-ITEM">-- Custom Item / Non-Inventory --</option>
                              {inventory.map((inv) => (
                                <option key={inv.id} value={inv.sku}>
                                  [{inv.sku}] {(inv.name || '').substring(0, 40)}...
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              placeholder="Item description..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="1"
                            value={item.requiredQty}
                            onChange={(e) => handleItemChange(index, 'requiredQty', e.target.value)}
                            className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-right font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
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
                            value={item.estimatedUnitCost}
                            onChange={(e) => handleItemChange(index, 'estimatedUnitCost', e.target.value)}
                            className="w-28 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-right font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          ₹{item.estimatedTotal.toLocaleString()}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.reason || ''}
                            onChange={(e) => handleItemChange(index, 'reason', e.target.value)}
                            placeholder="Reason..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
                          />
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

          {/* Requisition Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  Total Requisition Estimate
                </div>
                <div className="text-xl font-black text-slate-900">
                  ₹{totalEstimatedAmount.toLocaleString()}{' '}
                  <span className="text-xs font-medium text-slate-500">
                    ({items.length} item{items.length > 1 ? 's' : ''})
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500">
              <span>Next step: </span>
              <strong className="text-blue-700 font-semibold">
                Procurement / Purchase Manager Review & Approval
              </strong>
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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              Submit Purchase Requisition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
