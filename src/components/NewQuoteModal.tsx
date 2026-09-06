import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Calculator, Sparkles, Save, RotateCcw, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Lead, QuoteLineItem, InventoryItem, NewQuoteDraft } from '../types';
import { storageService } from '../services/storageService';

interface NewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  inventory: InventoryItem[];
  preselectedLead?: Lead | null;
}

const DEFAULT_LINE_ITEMS: QuoteLineItem[] = [
  {
    id: 'item-1',
    category: 'Equipment',
    itemSku: 'VRF-ODU-28HP',
    description: 'Daikin VRV X Series 28 HP High Efficiency Outdoor Unit (Model RXQ28AMY1)',
    qty: 2,
    unit: 'Units',
    unitCost: 380000,
    totalCost: 760000,
    unitPrice: 475000,
    totalPrice: 950000
  },
  {
    id: 'item-2',
    category: 'Equipment',
    itemSku: 'VRF-IDU-CAS-3TR',
    description: 'Blue Star 3.0 TR 4-Way Round Flow Cassette Indoor Units with Cordless Remote',
    qty: 12,
    unit: 'Units',
    unitCost: 32000,
    totalCost: 384000,
    unitPrice: 41000,
    totalPrice: 492000
  },
  {
    id: 'item-3',
    category: 'Ducting & Insulation',
    itemSku: 'DUCT-GI-24G',
    description: 'Factory Fabricated G.I. Rectangular Ducting 24 Gauge with Class O Nitrile Insulation',
    qty: 450,
    unit: 'Sq. Mtrs',
    unitCost: 1100,
    totalCost: 495000,
    unitPrice: 1550,
    totalPrice: 697500
  },
  {
    id: 'item-4',
    category: 'Piping & Valves',
    itemSku: 'COP-TUBE-410A',
    description: 'Mandev VRF Grade Refrigerant Copper Piping with Nitrile Rubber Insulation Sleeves',
    qty: 380,
    unit: 'R. Mtrs',
    unitCost: 620,
    totalCost: 235600,
    unitPrice: 880,
    totalPrice: 334400
  },
  {
    id: 'item-5',
    category: 'Testing & Commissioning',
    description: 'System Pressure Testing with Nitrogen, Deep Vacuumization, Gas Top-up & Air Balancing',
    qty: 1,
    unit: 'Lot',
    unitCost: 65000,
    totalCost: 65000,
    unitPrice: 95000,
    totalPrice: 95000
  }
];

export const NewQuoteModal: React.FC<NewQuoteModalProps> = ({
  isOpen,
  onClose,
  leads,
  inventory,
  preselectedLead
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [siteAddress, setSiteAddress] = useState<string>('');
  const [deliveryTimeline, setDeliveryTimeline] = useState<string>('4 - 6 Weeks from PO & Advance');
  const [paymentTerms, setPaymentTerms] = useState<string>(
    '30% Advance, 40% against Equipment Delivery, 20% on Installation, 10% Testing & Handover'
  );
  const [discountPct, setDiscountPct] = useState<number>(5);
  const [items, setItems] = useState<QuoteLineItem[]>(DEFAULT_LINE_ITEMS);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);
  const [isDraftRestored, setIsDraftRestored] = useState<boolean>(false);
  const [restoredDraftSavedAt, setRestoredDraftSavedAt] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // Load existing draft or initialize from defaults / preselected lead when opening modal
  useEffect(() => {
    if (!isOpen) {
      isInitialMount.current = true;
      return;
    }

    const savedDraft = storageService.getNewQuoteDraft();
    if (savedDraft) {
      // Restore draft from local storage
      setSelectedLeadId(savedDraft.selectedLeadId || preselectedLead?.id || leads[0]?.id || '');
      setProjectTitle(savedDraft.projectTitle || (preselectedLead ? `HVAC Turnkey System for ${preselectedLead.companyName}` : 'Commercial HVAC VRF Installation & Ducting'));
      setSiteAddress(savedDraft.siteAddress || (preselectedLead?.projectAddress || 'BKC Commercial Hub, Mumbai'));
      setDeliveryTimeline(savedDraft.deliveryTimeline || '4 - 6 Weeks from PO & Advance');
      setPaymentTerms(savedDraft.paymentTerms || '30% Advance, 40% against Equipment Delivery, 20% on Installation, 10% Testing & Handover');
      setDiscountPct(typeof savedDraft.discountPct === 'number' ? savedDraft.discountPct : 5);
      if (Array.isArray(savedDraft.items) && savedDraft.items.length > 0) {
        setItems(savedDraft.items);
      }
      setIsDraftRestored(true);
      setRestoredDraftSavedAt(savedDraft.savedAt);
      setLastSavedTimestamp(savedDraft.savedAt);
    } else {
      // Initialize with fresh default values
      const initialLead = preselectedLead || leads[0];
      setSelectedLeadId(initialLead?.id || '');
      setProjectTitle(
        initialLead
          ? `HVAC Turnkey System for ${initialLead.companyName}`
          : 'Commercial HVAC VRF Installation & Ducting'
      );
      setSiteAddress(initialLead?.projectAddress || 'BKC Commercial Hub, Mumbai');
      setDeliveryTimeline('4 - 6 Weeks from PO & Advance');
      setPaymentTerms('30% Advance, 40% against Equipment Delivery, 20% on Installation, 10% Testing & Handover');
      setDiscountPct(5);
      setItems(DEFAULT_LINE_ITEMS);
      setIsDraftRestored(false);
      setRestoredDraftSavedAt(null);
    }

    isInitialMount.current = false;
  }, [isOpen, preselectedLead, leads]);

  // Real-time Auto-Save to Local Storage
  useEffect(() => {
    if (!isOpen || isInitialMount.current) return;

    const timeoutId = setTimeout(() => {
      const nowIso = new Date().toISOString();
      const draft: NewQuoteDraft = {
        selectedLeadId,
        projectTitle,
        siteAddress,
        deliveryTimeline,
        paymentTerms,
        discountPct,
        items,
        savedAt: nowIso
      };

      storageService.saveNewQuoteDraft(draft);
      setLastSavedTimestamp(nowIso);
    }, 300); // 300ms debounce for smooth typing

    return () => clearTimeout(timeoutId);
  }, [isOpen, selectedLeadId, projectTitle, siteAddress, deliveryTimeline, paymentTerms, discountPct, items]);

  if (!isOpen) return null;

  const currentLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  // Financial Calculations
  const totalCost = items.reduce((s, it) => s + (it.totalCost || 0), 0);
  const subtotal = items.reduce((s, it) => s + (it.totalPrice || 0), 0);
  const discountAmount = (subtotal * discountPct) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * 0.18; // 18% GST
  const grandTotal = taxableAmount + taxAmount;
  const grossMarginAmount = taxableAmount - totalCost;
  const grossMarginPct = taxableAmount > 0 ? (grossMarginAmount / taxableAmount) * 100 : 0;

  const handleAddItem = () => {
    const newItem: QuoteLineItem = {
      id: 'item-' + Date.now(),
      category: 'Equipment',
      description: 'HVAC Component / Service Description',
      qty: 1,
      unit: 'Units',
      unitCost: 10000,
      totalCost: 10000,
      unitPrice: 14000,
      totalPrice: 14000
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((it) => it.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof QuoteLineItem, val: any) => {
    setItems(
      items.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: val };
        if (field === 'qty' || field === 'unitCost' || field === 'unitPrice') {
          const qty = field === 'qty' ? Number(val) : updated.qty;
          const uCost = field === 'unitCost' ? Number(val) : updated.unitCost;
          const uPrice = field === 'unitPrice' ? Number(val) : updated.unitPrice;
          updated.totalCost = qty * uCost;
          updated.totalPrice = qty * uPrice;
        }
        return updated;
      })
    );
  };

  const handleClearDraft = () => {
    storageService.clearNewQuoteDraft();
    const initialLead = preselectedLead || leads[0];
    setSelectedLeadId(initialLead?.id || '');
    setProjectTitle(
      initialLead
        ? `HVAC Turnkey System for ${initialLead.companyName}`
        : 'Commercial HVAC VRF Installation & Ducting'
    );
    setSiteAddress(initialLead?.projectAddress || 'BKC Commercial Hub, Mumbai');
    setDeliveryTimeline('4 - 6 Weeks from PO & Advance');
    setPaymentTerms('30% Advance, 40% against Equipment Delivery, 20% on Installation, 10% Testing & Handover');
    setDiscountPct(5);
    setItems(DEFAULT_LINE_ITEMS);
    setIsDraftRestored(false);
    setRestoredDraftSavedAt(null);
    setLastSavedTimestamp(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLead) return;

    storageService.addQuote({
      leadId: currentLead.id,
      companyName: currentLead.companyName,
      clientName: currentLead.clientName,
      projectTitle,
      siteAddress,
      preparedBy: currentLead.assignedToName || 'HVAC Lead Estimator',
      date: new Date().toISOString().split('T')[0],
      items,
      subtotal,
      discountPct,
      discountAmount,
      taxPct: 18,
      taxAmount,
      totalAmount: grandTotal,
      totalCost,
      grossMarginAmount,
      grossMarginPct,
      status: 'Sent',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveryTimeline,
      paymentTerms,
      warrantyTerms: '1 Year Comprehensive on System & 5 Years on Compressors',
      notes: 'Generated via HVAC Quote Builder'
    });

    // Clear saved draft on successful quote generation
    storageService.clearNewQuoteDraft();
    onClose();
  };

  const formatSavedTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'just now';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">HVAC Techno-Commercial Quote Builder</h3>
                {/* Real-Time Auto-Save Indicator */}
                <div
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold rounded-full shadow-2xs"
                  title="Your edits are saved in browser storage automatically in real-time"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <Save className="w-3 h-3 text-emerald-600" />
                  <span>Auto-saved {lastSavedTimestamp ? `@ ${formatSavedTime(lastSavedTimestamp)}` : 'locally'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">Engineering itemized bill of quantities with real-time gross margin computation.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearDraft}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Discard auto-saved draft and reset form"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Draft</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Draft Restored Banner */}
        {isDraftRestored && (
          <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Draft Restored:</strong> Loaded your unsaved quote draft from local storage{' '}
                {restoredDraftSavedAt ? `(saved ${formatSavedTime(restoredDraftSavedAt)})` : ''}. All updates auto-save continuously.
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearDraft}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer shrink-0 ml-3"
            >
              Discard & Start Blank
            </button>
          </div>
        )}

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Project & Client Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Target HVAC Client / Lead *</label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.companyName} ({l.clientName} - {l.estimatedCapacityTR} TR)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Project Scope Title *</label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Site Delivery Schedule</label>
              <input
                type="text"
                value={deliveryTimeline}
                onChange={(e) => setDeliveryTimeline(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Line Items Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                  Bill of Items & Scope Line Items ({items.length})
                </span>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  (Changes persist automatically)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-blue-600 rounded-xl font-bold text-xs border border-slate-200 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Item Description & HVAC SKU</th>
                    <th className="py-3 px-2 text-center w-16">Qty</th>
                    <th className="py-3 px-2 text-center w-20">Unit</th>
                    <th className="py-3 px-3 text-right w-28">Est. Cost (₹)</th>
                    <th className="py-3 px-3 text-right w-28">Quote Price (₹)</th>
                    <th className="py-3 px-3 text-right w-28">Total Price (₹)</th>
                    <th className="py-3 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2">
                        <select
                          value={it.category}
                          onChange={(e) => handleUpdateItem(it.id, 'category', e.target.value)}
                          className="bg-slate-50 text-slate-800 p-1.5 rounded-lg border border-slate-200 text-xs w-28 font-sans font-medium"
                        >
                          <option value="Equipment">Equipment</option>
                          <option value="Ducting & Insulation">Ducting & Insulation</option>
                          <option value="Piping & Valves">Piping & Valves</option>
                          <option value="Electrical & Controls">Electrical & Controls</option>
                          <option value="Grilles & Diffusers">Grilles & Diffusers</option>
                          <option value="Installation & Labor">Installation & Labor</option>
                          <option value="Testing & Commissioning">Testing & Commissioning</option>
                        </select>
                      </td>

                      <td className="py-2 px-2 font-sans">
                        <input
                          type="text"
                          value={it.description}
                          onChange={(e) => handleUpdateItem(it.id, 'description', e.target.value)}
                          className="w-full bg-slate-50 text-slate-900 p-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                        />
                      </td>

                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={it.qty}
                          onChange={(e) => handleUpdateItem(it.id, 'qty', e.target.value)}
                          className="w-14 bg-slate-50 text-slate-900 p-1.5 rounded-lg border border-slate-200 text-center font-bold text-xs"
                        />
                      </td>

                      <td className="py-2 px-2 text-center">
                        <input
                          type="text"
                          value={it.unit}
                          onChange={(e) => handleUpdateItem(it.id, 'unit', e.target.value)}
                          className="w-16 bg-slate-50 text-slate-900 p-1.5 rounded-lg border border-slate-200 text-center text-xs font-medium font-sans"
                        />
                      </td>

                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={it.unitCost}
                          onChange={(e) => handleUpdateItem(it.id, 'unitCost', e.target.value)}
                          className="w-24 bg-slate-50 text-slate-900 p-1.5 rounded-lg border border-slate-200 text-right text-xs"
                        />
                      </td>

                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={it.unitPrice}
                          onChange={(e) => handleUpdateItem(it.id, 'unitPrice', e.target.value)}
                          className="w-24 bg-slate-50 text-emerald-700 font-bold p-1.5 rounded-lg border border-slate-200 text-right text-xs"
                        />
                      </td>

                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{it.totalPrice.toLocaleString()}
                      </td>

                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Margins & Taxes Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Margin Analyzer */}
            <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Gross Margin Analysis
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {grossMarginPct >= 20 ? 'Target Achieved' : 'Tight Margin'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Total Raw Engineering Cost:</span>
                <span className="font-semibold text-slate-900 font-mono">₹{totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Quoted Net Revenue:</span>
                <span className="font-semibold text-slate-900 font-mono">₹{taxableAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold pt-2 border-t border-slate-200">
                <span>Gross Profit Margin:</span>
                <span className="font-mono">₹{grossMarginAmount.toLocaleString()} ({grossMarginPct.toFixed(2)}%)</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal (Before Tax):</span>
                <span className="font-mono font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-amber-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <span>Special Discount %:</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={discountPct}
                    onChange={(e) => setDiscountPct(Number(e.target.value))}
                    className="w-12 bg-white text-amber-900 font-bold p-1 rounded-lg border border-slate-200 text-center text-xs"
                  />
                </div>
                <span className="font-mono font-bold">- ₹{discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>GST (18% Commercial HVAC Rate):</span>
                <span className="font-mono text-slate-900">₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span className="text-emerald-700">Grand Total (incl. GST):</span>
                <span className="text-emerald-700 font-bold font-mono">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {lastSavedTimestamp
                  ? `Last auto-saved locally at ${formatSavedTime(lastSavedTimestamp)}`
                  : 'Edits auto-save to browser storage'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Formal HVAC Quotation</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
