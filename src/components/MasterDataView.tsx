import React, { useState } from 'react';
import {
  Database,
  Building2,
  Truck,
  Package,
  Landmark,
  Percent,
  CalendarClock,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
  Filter,
  Check,
  X,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  FileText,
  Scale,
  Calculator
} from 'lucide-react';
import {
  ClientMaster,
  CostCenterMaster,
  TaxSlabMaster,
  PaymentTermMaster,
  Vendor,
  InventoryItem
} from '../types';
import { storageService } from '../services/storageService';
import { UomConversionCalculatorModal } from './UomConversionCalculatorModal';

interface MasterDataViewProps {
  clients: ClientMaster[];
  vendors: Vendor[];
  inventory: InventoryItem[];
  costCenters: CostCenterMaster[];
  taxSlabs: TaxSlabMaster[];
  paymentTerms: PaymentTermMaster[];
  onRefresh: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  initialTab?: TabType;
}

type TabType = 'clients' | 'vendors' | 'items' | 'costCenters' | 'taxSlabs' | 'paymentTerms';

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  clients,
  vendors,
  inventory,
  costCenters,
  taxSlabs,
  paymentTerms,
  onRefresh,
  searchTerm: propSearchTerm,
  onSearchChange,
  initialTab = 'clients'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const searchTerm = propSearchTerm !== undefined ? propSearchTerm : internalSearchTerm;
  const setSearchTerm = (term: string) => {
    setInternalSearchTerm(term);
    if (onSearchChange) onSearchChange(term);
  };
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modal States
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientMaster | null>(null);

  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // UoM Conversion Calculator Modal State
  const [uomCalculatorOpen, setUomCalculatorOpen] = useState(false);
  const [uomPreselectedItem, setUomPreselectedItem] = useState<InventoryItem | null>(null);

  const handleOpenUomCalculator = (item?: InventoryItem) => {
    setUomPreselectedItem(item || null);
    setUomCalculatorOpen(true);
  };

  const handleApplyConversionToItem = (itemSku: string, targetUnit: string, convertedRate: number) => {
    const item = inventory.find((i) => i.sku === itemSku);
    if (item) {
      storageService.updateInventoryItem(itemSku, {
        unit: targetUnit,
        averageUnitCost: Math.round(convertedRate * 100) / 100
      });
      if (onRefresh) onRefresh();
      setUomCalculatorOpen(false);
    }
  };

  const [ccModalOpen, setCcModalOpen] = useState(false);
  const [editingCc, setEditingCc] = useState<CostCenterMaster | null>(null);

  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxSlabMaster | null>(null);

  const [ptModalOpen, setPtModalOpen] = useState(false);
  const [editingPt, setEditingPt] = useState<PaymentTermMaster | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: TabType;
    id: string;
    name: string;
  } | null>(null);

  // Client Form State
  const [clientForm, setClientForm] = useState({
    clientCode: '',
    companyName: '',
    contactPerson: '',
    designation: '',
    email: '',
    phone: '',
    billingAddress: '',
    siteAddress: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    gstin: '',
    pan: '',
    creditLimit: 10000000,
    creditPeriodDays: 30,
    paymentTerms: '30% Advance, 40% Delivery, 20% Erection, 10% Testing',
    industry: 'Commercial Real Estate',
    status: 'active' as 'active' | 'inactive' | 'blacklisted',
    notes: ''
  });

  // Vendor Form State
  const [vendorForm, setVendorForm] = useState({
    vendorCode: '',
    name: '',
    category: 'HVAC Equipment (VRV/Chillers)',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    gstin: '',
    pan: '',
    rating: 5,
    leadTimeDays: 14,
    creditPeriodDays: 30,
    bankDetails: 'HDFC Bank - Current A/c 502000192837'
  });

  // Item Form State
  const [itemForm, setItemForm] = useState({
    sku: '',
    name: '',
    category: 'Copper Pipes',
    description: '',
    unit: 'm',
    currentStock: 100,
    allocatedStock: 0,
    reorderLevel: 20,
    averageUnitCost: 1500,
    standardSellingPrice: 2100,
    hsnCode: '7411',
    gstRatePct: 18,
    storageLocation: 'Central Yard Rack A-1'
  });

  // Cost Center Form State
  const [ccForm, setCcForm] = useState({
    code: '',
    name: '',
    department: 'Projects & Contracting',
    location: 'Mumbai Region',
    managerName: 'Shivender Kumar',
    budgetLimit: 50000000,
    active: true
  });

  // Tax Slab Form State
  const [taxForm, setTaxForm] = useState({
    name: '',
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    totalGstRate: 18,
    hsnSacCode: '995461',
    appliesTo: 'HVAC Turnkey Works Contract',
    active: true
  });

  // Payment Term Form State
  const [ptForm, setPtForm] = useState({
    code: '',
    name: '',
    days: 30,
    description: '',
    isDefault: false
  });

  // Open Client Modal
  const handleOpenClientModal = (client?: ClientMaster) => {
    if (client) {
      setEditingClient(client);
      setClientForm({
        clientCode: client.clientCode,
        companyName: client.companyName,
        contactPerson: client.contactPerson,
        designation: client.designation,
        email: client.email,
        phone: client.phone,
        billingAddress: client.billingAddress,
        siteAddress: client.siteAddress || '',
        city: client.city,
        state: client.state,
        pincode: client.pincode,
        gstin: client.gstin,
        pan: client.pan,
        creditLimit: client.creditLimit,
        creditPeriodDays: client.creditPeriodDays,
        paymentTerms: client.paymentTerms,
        industry: client.industry,
        status: client.status,
        notes: client.notes || ''
      });
    } else {
      setEditingClient(null);
      const nextNum = (clients.length + 1).toString().padStart(3, '0');
      setClientForm({
        clientCode: `CLI-${nextNum}`,
        companyName: '',
        contactPerson: '',
        designation: 'Project Director',
        email: '',
        phone: '',
        billingAddress: '',
        siteAddress: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        gstin: '27AAAAA0000A1Z5',
        pan: 'AAAAA0000A',
        creditLimit: 20000000,
        creditPeriodDays: 30,
        paymentTerms: '30% Advance, 40% Delivery, 20% Erection, 10% Testing',
        industry: 'Commercial Real Estate',
        status: 'active',
        notes: ''
      });
    }
    setClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.companyName || !clientForm.contactPerson) return;

    if (editingClient) {
      storageService.updateClient(editingClient.id, clientForm);
    } else {
      storageService.addClient(clientForm);
    }
    setClientModalOpen(false);
    onRefresh();
  };

  // Open Vendor Modal
  const handleOpenVendorModal = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      setVendorForm({
        vendorCode: vendor.vendorCode || vendor.code || '',
        name: vendor.name,
        category: vendor.category,
        contactPerson: vendor.contactPerson,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        gstin: vendor.gstin || vendor.gstOrTaxId || '',
        pan: vendor.pan || '',
        rating: vendor.rating,
        leadTimeDays: vendor.leadTimeDays,
        creditPeriodDays: vendor.creditPeriodDays,
        bankDetails: typeof vendor.bankDetails === 'string' ? vendor.bankDetails : 'HDFC Bank - Current A/c'
      });
    } else {
      setEditingVendor(null);
      let nextVendorCode = '';
      try {
        nextVendorCode = storageService.peekNextSeriesNumber('vendor');
      } catch {
        nextVendorCode = `VND-${String(vendors.length + 1).padStart(3, '0')}`;
      }
      setVendorForm({
        vendorCode: nextVendorCode,
        name: '',
        category: 'HVAC Equipment (VRV/Chillers)',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        gstin: '27AAAAA0000A1Z5',
        pan: 'AAAAA0000A',
        rating: 5,
        leadTimeDays: 14,
        creditPeriodDays: 30,
        bankDetails: 'HDFC Bank - Current A/c'
      });
    }
    setVendorModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name || !vendorForm.contactPerson) return;

    try {
      if (editingVendor) {
        storageService.updateVendorMaster(editingVendor.id, vendorForm);
      } else {
        storageService.addVendorMaster(vendorForm);
      }
      setVendorModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error saving vendor master');
    }
  };

  // Open Item Modal
  const handleOpenItemModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        sku: item.sku,
        name: item.name,
        category: item.category,
        description: item.description,
        unit: item.unit,
        currentStock: item.currentStock,
        allocatedStock: item.allocatedStock,
        reorderLevel: item.reorderLevel,
        averageUnitCost: item.averageUnitCost,
        standardSellingPrice: item.standardSellingPrice || item.averageUnitCost * 1.3,
        hsnCode: item.hsnCode || '8415',
        gstRatePct: item.gstRatePct || 18,
        storageLocation: item.storageLocation || 'Central Yard'
      });
    } else {
      setEditingItem(null);
      const nextSku = `SKU-HVAC-${(inventory.length + 1).toString().padStart(3, '0')}`;
      setItemForm({
        sku: nextSku,
        name: '',
        category: 'Copper Pipes',
        description: '',
        unit: 'm',
        currentStock: 50,
        allocatedStock: 0,
        reorderLevel: 15,
        averageUnitCost: 1200,
        standardSellingPrice: 1650,
        hsnCode: '7411',
        gstRatePct: 18,
        storageLocation: 'Central Yard Shelf B-2'
      });
    }
    setItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.sku || !itemForm.name) return;

    if (editingItem) {
      storageService.updateInventoryItem(editingItem.sku, itemForm);
    } else {
      storageService.addInventoryItem(itemForm);
    }
    setItemModalOpen(false);
    onRefresh();
  };

  // Open Cost Center Modal
  const handleOpenCcModal = (cc?: CostCenterMaster) => {
    if (cc) {
      setEditingCc(cc);
      setCcForm({
        code: cc.code,
        name: cc.name,
        department: cc.department,
        location: cc.location,
        managerName: cc.managerName,
        budgetLimit: cc.budgetLimit,
        active: cc.active
      });
    } else {
      setEditingCc(null);
      setCcForm({
        code: `CC-HVAC-${(costCenters.length + 1).toString().padStart(3, '0')}`,
        name: '',
        department: 'Projects & Contracting',
        location: 'Mumbai Region',
        managerName: 'Shivender Kumar',
        budgetLimit: 50000000,
        active: true
      });
    }
    setCcModalOpen(true);
  };

  const handleSaveCc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ccForm.code || !ccForm.name) return;

    if (editingCc) {
      storageService.updateCostCenter(editingCc.id, ccForm);
    } else {
      storageService.addCostCenter(ccForm);
    }
    setCcModalOpen(false);
    onRefresh();
  };

  // Open Tax Modal
  const handleOpenTaxModal = (tax?: TaxSlabMaster) => {
    if (tax) {
      setEditingTax(tax);
      setTaxForm({
        name: tax.name,
        cgstRate: tax.cgstRate,
        sgstRate: tax.sgstRate,
        igstRate: tax.igstRate,
        totalGstRate: tax.totalGstRate,
        hsnSacCode: tax.hsnSacCode,
        appliesTo: tax.appliesTo,
        active: tax.active
      });
    } else {
      setEditingTax(null);
      setTaxForm({
        name: '',
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 18,
        totalGstRate: 18,
        hsnSacCode: '995461',
        appliesTo: 'Turnkey HVAC Works Contract',
        active: true
      });
    }
    setTaxModalOpen(true);
  };

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxForm.name) return;

    if (editingTax) {
      storageService.updateTaxSlab(editingTax.id, taxForm);
    } else {
      storageService.addTaxSlab(taxForm);
    }
    setTaxModalOpen(false);
    onRefresh();
  };

  // Open Payment Terms Modal
  const handleOpenPtModal = (pt?: PaymentTermMaster) => {
    if (pt) {
      setEditingPt(pt);
      setPtForm({
        code: pt.code,
        name: pt.name,
        days: pt.days,
        description: pt.description,
        isDefault: pt.isDefault || false
      });
    } else {
      setEditingPt(null);
      setPtForm({
        code: `PT-${(paymentTerms.length + 1).toString().padStart(3, '0')}`,
        name: '',
        days: 30,
        description: '',
        isDefault: false
      });
    }
    setPtModalOpen(true);
  };

  const handleSavePt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptForm.code || !ptForm.name) return;

    if (editingPt) {
      storageService.updatePaymentTerm(editingPt.id, ptForm);
    } else {
      storageService.addPaymentTerm(ptForm);
    }
    setPtModalOpen(false);
    onRefresh();
  };

  // Delete Action
  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;

    if (type === 'clients') storageService.deleteClient(id);
    else if (type === 'vendors') storageService.deleteVendorMaster(id);
    else if (type === 'items') storageService.deleteInventoryItem(id);
    else if (type === 'costCenters') storageService.deleteCostCenter(id);
    else if (type === 'taxSlabs') storageService.deleteTaxSlab(id);
    else if (type === 'paymentTerms') storageService.deletePaymentTerm(id);

    setDeleteConfirm(null);
    onRefresh();
  };

  // Filtered Lists
  const term = (searchTerm || '').trim().toLowerCase();
  const filteredClients = clients.filter((c) => {
    const matchSearch =
      (c.companyName || '').toLowerCase().includes(term) ||
      (c.contactPerson || '').toLowerCase().includes(term) ||
      (c.clientCode || '').toLowerCase().includes(term) ||
      (c.city || '').toLowerCase().includes(term);
    const matchCategory = filterCategory === 'all' || c.status === filterCategory;
    return matchSearch && matchCategory;
  });

  const filteredVendors = vendors.filter((v) => {
    const matchSearch =
      (v.name || '').toLowerCase().includes(term) ||
      (v.vendorCode || v.code || '').toLowerCase().includes(term) ||
      (v.category || '').toLowerCase().includes(term) ||
      (v.contactPerson || '').toLowerCase().includes(term) ||
      (v.city || '').toLowerCase().includes(term) ||
      (v.gstin || v.gstOrTaxId || '').toLowerCase().includes(term) ||
      (v.pan || '').toLowerCase().includes(term) ||
      (v.phone || '').toLowerCase().includes(term);
    const matchCategory = filterCategory === 'all' || v.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const filteredItems = inventory.filter((i) => {
    const matchSearch =
      (i.name || '').toLowerCase().includes(term) ||
      (i.sku || '').toLowerCase().includes(term) ||
      (i.category || '').toLowerCase().includes(term);
    const matchCategory = filterCategory === 'all' || i.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const filteredCostCenters = costCenters.filter((cc) =>
    (cc.name || '').toLowerCase().includes(term) ||
    (cc.code || '').toLowerCase().includes(term) ||
    (cc.department || '').toLowerCase().includes(term)
  );

  const filteredTaxSlabs = taxSlabs.filter((t) =>
    (t.name || '').toLowerCase().includes(term) ||
    (t.hsnSacCode || '').toLowerCase().includes(term)
  );

  const filteredPaymentTerms = paymentTerms.filter((pt) =>
    (pt.name || '').toLowerCase().includes(term) ||
    (pt.code || '').toLowerCase().includes(term)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Enterprise Master Data Management
            </span>
            <span className="text-xs text-slate-400">
              Single Source of Truth
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Master Data Repository & Configuration Hub
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
            Configure and maintain core master data records for Clients, Certified Vendors, HVAC Material SKUs, Project Cost Centers, Statutory GST Slabs, and Payment Term Formulas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'clients' && (
            <button
              onClick={() => handleOpenClientModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client Master</span>
            </button>
          )}
          {activeTab === 'vendors' && (
            <button
              onClick={() => handleOpenVendorModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vendor Master</span>
            </button>
          )}
          {activeTab === 'items' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenUomCalculator()}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl shadow-2xs transition-all"
                title="Unit of Measure (UoM) Conversion Calculator & Rate Estimator"
              >
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>UoM Calculator</span>
              </button>
              <button
                onClick={() => handleOpenItemModal()}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item / SKU</span>
              </button>
            </div>
          )}
          {activeTab === 'costCenters' && (
            <button
              onClick={() => handleOpenCcModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Cost Center</span>
            </button>
          )}
          {activeTab === 'taxSlabs' && (
            <button
              onClick={() => handleOpenTaxModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tax Slab</span>
            </button>
          )}
          {activeTab === 'paymentTerms' && (
            <button
              onClick={() => handleOpenPtModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Payment Term</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          onClick={() => { setActiveTab('clients'); setSearchTerm(''); setFilterCategory('all'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'clients'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Clients Master ({clients.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('vendors'); setSearchTerm(''); setFilterCategory('all'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'vendors'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Vendors Master ({vendors.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('items'); setSearchTerm(''); setFilterCategory('all'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'items'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Item & SKU Master ({inventory.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('costCenters'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'costCenters'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Cost Centers ({costCenters.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('taxSlabs'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'taxSlabs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Tax Slabs & GST ({taxSlabs.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('paymentTerms'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'paymentTerms'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Payment Terms ({paymentTerms.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {activeTab === 'clients' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Clients</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blacklisted">Blacklisted</option>
            </select>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Categories</option>
              <option value="HVAC Equipment (VRV/Chillers)">HVAC Equipment (VRV/Chillers)</option>
              <option value="Copper Pipes & Fittings">Copper Pipes & Fittings</option>
              <option value="Ducting & GI Sheets">Ducting & GI Sheets</option>
              <option value="Thermal Insulation">Thermal Insulation</option>
              <option value="Valves & Accessories">Valves & Accessories</option>
            </select>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Categories</option>
              <option value="VRV Outdoor Unit">VRV Outdoor Unit</option>
              <option value="VRV Indoor Unit">VRV Indoor Unit</option>
              <option value="Chiller Plant">Chiller Plant</option>
              <option value="Copper Pipes">Copper Pipes</option>
              <option value="GI Sheet Ducting">GI Sheet Ducting</option>
              <option value="Nitrile Rubber Insulation">Nitrile Rubber Insulation</option>
              <option value="Valves & Motorized">Valves & Motorized</option>
              <option value="Refrigerant Gas">Refrigerant Gas</option>
            </select>
          </div>
        )}
      </div>

      {/* 1. CLIENTS TABLE */}
      {activeTab === 'clients' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Client Code & Name</th>
                  <th className="px-4 py-3">Contact Person & Designation</th>
                  <th className="px-4 py-3">Contact Details</th>
                  <th className="px-4 py-3">Location / State</th>
                  <th className="px-4 py-3">GSTIN / PAN</th>
                  <th className="px-4 py-3">Credit Limit & Terms</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{client.companyName}</div>
                      <div className="text-[11px] font-mono text-blue-600 mt-0.5">{client.clientCode} • {client.industry}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800">{client.contactPerson}</div>
                      <div className="text-[11px] text-slate-500">{client.designation}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium">{client.city}, {client.state}</div>
                      <div className="text-[11px] text-slate-400 max-w-xs truncate">{client.billingAddress}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px]">
                      <div>GST: <span className="font-semibold text-slate-800">{client.gstin}</span></div>
                      <div className="text-slate-500">PAN: {client.pan}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 font-mono">₹{(client.creditLimit / 100000).toFixed(1)} L</div>
                      <div className="text-[11px] text-slate-500">{client.creditPeriodDays} Days Credit</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        client.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : client.status === 'blacklisted'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenClientModal(client)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Client Master"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'clients', id: client.id, name: client.companyName })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. VENDORS TABLE */}
      {activeTab === 'vendors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Vendor Code</th>
                  <th className="px-4 py-3">Vendor / OEM Name</th>
                  <th className="px-4 py-3">Product Category</th>
                  <th className="px-4 py-3">Key Contact</th>
                  <th className="px-4 py-3">Location & Address</th>
                  <th className="px-4 py-3">GSTIN / PAN</th>
                  <th className="px-4 py-3">Rating & Lead Time</th>
                  <th className="px-4 py-3">Payment Terms</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                        {vendor.vendorCode || vendor.code || 'VND-001'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      <div>{vendor.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{typeof vendor.bankDetails === 'string' ? vendor.bankDetails : 'Bank A/c Verified'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-medium">
                        {vendor.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800">{vendor.contactPerson}</div>
                      <div className="text-[11px] text-slate-500">{vendor.phone} • {vendor.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium">{vendor.city}, {vendor.state}</div>
                      <div className="text-[11px] text-slate-400 max-w-xs truncate">{vendor.address}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px]">
                      <div>GST: <span className="font-semibold text-slate-800">{vendor.gstin}</span></div>
                      <div className="text-slate-500">PAN: {vendor.pan}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-amber-600">★ {vendor.rating}.0 / 5.0</div>
                      <div className="text-[11px] text-slate-500">{vendor.leadTimeDays} Days Lead Time</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800">{vendor.creditPeriodDays} Days Net Credit</div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenVendorModal(vendor)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Vendor Master"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'vendors', id: vendor.id, name: vendor.name })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Vendor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ITEMS / SKU TABLE */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">SKU & Item Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3">Reorder Threshold</th>
                  <th className="px-4 py-3">Unit Cost (Avg)</th>
                  <th className="px-4 py-3">Std Selling Price</th>
                  <th className="px-4 py-3">HSN & GST</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.map((item) => (
                  <tr key={item.sku} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] font-mono text-blue-600 mt-0.5">{item.sku} • {item.storageLocation || 'Central Yard'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold font-mono text-slate-900">{item.currentStock} {item.unit}</div>
                      <div className="text-[11px] text-slate-500">Allocated: {item.allocatedStock} {item.unit}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className={`font-semibold font-mono ${item.availableStock <= item.reorderLevel ? 'text-rose-600' : 'text-slate-700'}`}>
                        {item.reorderLevel} {item.unit}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-medium text-slate-800">
                      ₹{item.averageUnitCost.toLocaleString()} / {item.unit}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">
                      ₹{(item.standardSellingPrice || item.averageUnitCost * 1.3).toLocaleString()} / {item.unit}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px]">
                      <div>HSN: {item.hsnCode || '8415'}</div>
                      <div className="text-blue-600 font-semibold">{item.gstRatePct || 18}% GST</div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenUomCalculator(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="UoM Conversion & Rate Calculator for this Item"
                        >
                          <Scale className="w-4 h-4 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => handleOpenItemModal(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Item Master"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'items', id: item.sku, name: item.name })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. COST CENTERS TABLE */}
      {activeTab === 'costCenters' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Cost Center Code</th>
                  <th className="px-4 py-3">Cost Center Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Operating Region</th>
                  <th className="px-4 py-3">Responsible Manager</th>
                  <th className="px-4 py-3">Budget Cap Limit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCostCenters.map((cc) => (
                  <tr key={cc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{cc.code}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{cc.name}</td>
                    <td className="px-4 py-3.5 font-medium">{cc.department}</td>
                    <td className="px-4 py-3.5 text-slate-600">{cc.location}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{cc.managerName}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                      ₹{(cc.budgetLimit / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cc.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {cc.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenCcModal(cc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Cost Center"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'costCenters', id: cc.id, name: cc.name })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Cost Center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAX SLABS TABLE */}
      {activeTab === 'taxSlabs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Tax Slab Name</th>
                  <th className="px-4 py-3">Total GST Rate</th>
                  <th className="px-4 py-3">CGST / SGST</th>
                  <th className="px-4 py-3">IGST (Inter-State)</th>
                  <th className="px-4 py-3">HSN / SAC Code</th>
                  <th className="px-4 py-3">Applies To Scope</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTaxSlabs.map((tax) => (
                  <tr key={tax.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{tax.name}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600 text-sm">
                      {tax.totalGstRate}%
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      CGST: {tax.cgstRate}% • SGST: {tax.sgstRate}%
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      IGST: {tax.igstRate}%
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-800">
                      {tax.hsnSacCode}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{tax.appliesTo}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenTaxModal(tax)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Tax Slab"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'taxSlabs', id: tax.id, name: tax.name })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Tax Slab"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. PAYMENT TERMS TABLE */}
      {activeTab === 'paymentTerms' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Term Code</th>
                  <th className="px-4 py-3">Payment Term Name</th>
                  <th className="px-4 py-3">Credit Days</th>
                  <th className="px-4 py-3">Description & Milestone Schedule</th>
                  <th className="px-4 py-3">Default</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPaymentTerms.map((pt) => (
                  <tr key={pt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{pt.code}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{pt.name}</td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-800">{pt.days} Days</td>
                    <td className="px-4 py-3.5 text-slate-600">{pt.description}</td>
                    <td className="px-4 py-3.5">
                      {pt.isDefault ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold">
                          System Default
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenPtModal(pt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Payment Term"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'paymentTerms', id: pt.id, name: pt.name })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Payment Term"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODALS */}
      {/* ========================================== */}

      {/* Client Modal */}
      {clientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingClient ? 'Edit Client Master' : 'Add New Client Master'}
                </h3>
              </div>
              <button
                onClick={() => setClientModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.companyName}
                    onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })}
                    placeholder="e.g. Nexus Tech Park Developers"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client Code</label>
                  <input
                    type="text"
                    value={clientForm.clientCode}
                    onChange={(e) => setClientForm({ ...clientForm, clientCode: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={clientForm.contactPerson}
                    onChange={(e) => setClientForm({ ...clientForm, contactPerson: e.target.value })}
                    placeholder="e.g. Mr. Arvind Swaminathan"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={clientForm.designation}
                    onChange={(e) => setClientForm({ ...clientForm, designation: e.target.value })}
                    placeholder="e.g. VP - Infrastructure & MEP"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="e.g. arvind@nexustech.com"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="+91 98111 22334"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={clientForm.gstin}
                    onChange={(e) => setClientForm({ ...clientForm, gstin: e.target.value.toUpperCase() })}
                    placeholder="27AABCN1234M1Z5"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={clientForm.pan}
                    onChange={(e) => setClientForm({ ...clientForm, pan: e.target.value.toUpperCase() })}
                    placeholder="AABCN1234M"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={clientForm.creditLimit}
                    onChange={(e) => setClientForm({ ...clientForm, creditLimit: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Period (Days)</label>
                  <input
                    type="number"
                    value={clientForm.creditPeriodDays}
                    onChange={(e) => setClientForm({ ...clientForm, creditPeriodDays: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Address</label>
                  <input
                    type="text"
                    value={clientForm.billingAddress}
                    onChange={(e) => setClientForm({ ...clientForm, billingAddress: e.target.value })}
                    placeholder="Tower A, 8th Floor, Mindspace IT Park, Navi Mumbai"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={clientForm.city}
                    onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={clientForm.state}
                    onChange={(e) => setClientForm({ ...clientForm, state: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={clientForm.status}
                    onChange={(e) => setClientForm({ ...clientForm, status: e.target.value as any })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blacklisted">Blacklisted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={clientForm.industry}
                    onChange={(e) => setClientForm({ ...clientForm, industry: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setClientModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  {editingClient ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Modal */}
      {vendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingVendor ? 'Edit Vendor Master' : 'Add New Vendor Master'}
                </h3>
              </div>
              <button
                onClick={() => setVendorModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Vendor Code *</label>
                    <span className="text-[10px] text-blue-600 font-medium">Auto-assigned unique series</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={vendorForm.vendorCode}
                    onChange={(e) => setVendorForm({ ...vendorForm, vendorCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. VND-001 or 26-VN-0001"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono font-bold text-blue-700 bg-blue-50/40 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor / OEM Name *</label>
                  <input
                    type="text"
                    required
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    placeholder="e.g. Daikin Airconditioning India Pvt Ltd"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Category *</label>
                  <select
                    value={vendorForm.category}
                    onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="HVAC Equipment (VRV/Chillers)">HVAC Equipment (VRV/Chillers)</option>
                    <option value="Copper Pipes & Fittings">Copper Pipes & Fittings</option>
                    <option value="Ducting & GI Sheets">Ducting & GI Sheets</option>
                    <option value="Thermal Insulation">Thermal Insulation</option>
                    <option value="Valves & Accessories">Valves & Accessories</option>
                    <option value="Air Distribution & Grilles">Air Distribution & Grilles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                    placeholder="e.g. Mr. Sanjay Verma"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    placeholder="+91 98200 11223"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    placeholder="orders@daikinindia.com"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={vendorForm.gstin}
                    onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value.toUpperCase() })}
                    placeholder="27AABCD1234E1Z5"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor Rating (1 to 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={vendorForm.rating}
                    onChange={(e) => setVendorForm({ ...vendorForm, rating: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    value={vendorForm.leadTimeDays}
                    onChange={(e) => setVendorForm({ ...vendorForm, leadTimeDays: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Period (Days)</label>
                  <input
                    type="number"
                    value={vendorForm.creditPeriodDays}
                    onChange={(e) => setVendorForm({ ...vendorForm, creditPeriodDays: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={vendorForm.city}
                    onChange={(e) => setVendorForm({ ...vendorForm, city: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Address</label>
                  <input
                    type="text"
                    value={vendorForm.address}
                    onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                    placeholder="Plot 12, Sector 8, IMT Manesar, Gurgaon, Haryana"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Remittance Details</label>
                  <input
                    type="text"
                    value={vendorForm.bankDetails}
                    onChange={(e) => setVendorForm({ ...vendorForm, bankDetails: e.target.value })}
                    placeholder="HDFC Bank Current A/c 502000192837, IFSC HDFC0000053"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVendorModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  {editingVendor ? 'Save Changes' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem ? 'Edit Item Master' : 'Add New Item / SKU'}
                </h3>
              </div>
              <button
                onClick={() => setItemModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingItem}
                    value={itemForm.sku}
                    onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value.toUpperCase() })}
                    placeholder="e.g. SKU-COP-34"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="VRV Outdoor Unit">VRV Outdoor Unit</option>
                    <option value="VRV Indoor Unit">VRV Indoor Unit</option>
                    <option value="Chiller Plant">Chiller Plant</option>
                    <option value="Copper Pipes">Copper Pipes</option>
                    <option value="GI Sheet Ducting">GI Sheet Ducting</option>
                    <option value="Nitrile Rubber Insulation">Nitrile Rubber Insulation</option>
                    <option value="Valves & Motorized">Valves & Motorized</option>
                    <option value="Refrigerant Gas">Refrigerant Gas</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Material / Item Name *</label>
                  <input
                    type="text"
                    required
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    placeholder="e.g. 3/4 inch Hard Drawn Copper Tube (Mandrel Tested)"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Unit of Measurement (UOM)</label>
                    <button
                      type="button"
                      onClick={() => handleOpenUomCalculator(editingItem || undefined)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors"
                      title="Open UoM Converter"
                    >
                      <Scale className="w-3 h-3 text-indigo-600" />
                      <span>UoM Calculator</span>
                    </button>
                  </div>
                  <select
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="m">m (Meters)</option>
                    <option value="nos">nos (Units/Pieces)</option>
                    <option value="sq.m">sq.m (Square Meters)</option>
                    <option value="kg">kg (Kilograms)</option>
                    <option value="set">set (Complete Sets)</option>
                    <option value="TR">TR (Tons of Refrigeration)</option>
                    <option value="CFM">CFM (Cubic Feet / Min)</option>
                    <option value="Rolls">Rolls (Roll)</option>
                    <option value="Boxes">Boxes (Box / Carton)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Warehouse Storage Location</label>
                  <input
                    type="text"
                    value={itemForm.storageLocation}
                    onChange={(e) => setItemForm({ ...itemForm, storageLocation: e.target.value })}
                    placeholder="e.g. Yard B Shelf 4"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Physical Stock</label>
                  <input
                    type="number"
                    value={itemForm.currentStock}
                    onChange={(e) => setItemForm({ ...itemForm, currentStock: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Threshold Level</label>
                  <input
                    type="number"
                    value={itemForm.reorderLevel}
                    onChange={(e) => setItemForm({ ...itemForm, reorderLevel: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Avg Procurement Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={itemForm.averageUnitCost}
                    onChange={(e) => setItemForm({ ...itemForm, averageUnitCost: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Selling Price (₹)</label>
                  <input
                    type="number"
                    value={itemForm.standardSellingPrice}
                    onChange={(e) => setItemForm({ ...itemForm, standardSellingPrice: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={itemForm.hsnCode}
                    onChange={(e) => setItemForm({ ...itemForm, hsnCode: e.target.value })}
                    placeholder="e.g. 7411"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GST Tax Rate (%)</label>
                  <select
                    value={itemForm.gstRatePct}
                    onChange={(e) => setItemForm({ ...itemForm, gstRatePct: Number(e.target.value) })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                  >
                    <option value="18">18% GST (Standard)</option>
                    <option value="28">28% GST (AC Units)</option>
                    <option value="12">12% GST</option>
                    <option value="5">5% GST</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  {editingItem ? 'Save Changes' : 'Create Item SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cost Center Modal */}
      {ccModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingCc ? 'Edit Cost Center' : 'Add New Cost Center'}
                </h3>
              </div>
              <button onClick={() => setCcModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCc} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Center Code *</label>
                <input
                  type="text"
                  required
                  value={ccForm.code}
                  onChange={(e) => setCcForm({ ...ccForm, code: e.target.value.toUpperCase() })}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cost Center Name *</label>
                <input
                  type="text"
                  required
                  value={ccForm.name}
                  onChange={(e) => setCcForm({ ...ccForm, name: e.target.value })}
                  placeholder="e.g. Commercial VRF Contracting"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={ccForm.department}
                  onChange={(e) => setCcForm({ ...ccForm, department: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Responsible Manager</label>
                <input
                  type="text"
                  value={ccForm.managerName}
                  onChange={(e) => setCcForm({ ...ccForm, managerName: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Budget Allocation Cap (₹)</label>
                <input
                  type="number"
                  value={ccForm.budgetLimit}
                  onChange={(e) => setCcForm({ ...ccForm, budgetLimit: Number(e.target.value) })}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCcModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Save Cost Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Slab Modal */}
      {taxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingTax ? 'Edit Tax Slab' : 'Add Tax Slab'}
                </h3>
              </div>
              <button onClick={() => setTaxModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTax} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Slab Name *</label>
                <input
                  type="text"
                  required
                  value={taxForm.name}
                  onChange={(e) => setTaxForm({ ...taxForm, name: e.target.value })}
                  placeholder="e.g. GST 18% (Turnkey HVAC Contract)"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Rate %</label>
                  <input
                    type="number"
                    value={taxForm.totalGstRate}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      setTaxForm({
                        ...taxForm,
                        totalGstRate: total,
                        cgstRate: total / 2,
                        sgstRate: total / 2,
                        igstRate: total
                      });
                    }}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CGST %</label>
                  <input
                    type="number"
                    value={taxForm.cgstRate}
                    onChange={(e) => setTaxForm({ ...taxForm, cgstRate: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SGST %</label>
                  <input
                    type="number"
                    value={taxForm.sgstRate}
                    onChange={(e) => setTaxForm({ ...taxForm, sgstRate: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">HSN / SAC Code</label>
                <input
                  type="text"
                  value={taxForm.hsnSacCode}
                  onChange={(e) => setTaxForm({ ...taxForm, hsnSacCode: e.target.value })}
                  placeholder="995461"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Applicability Scope</label>
                <input
                  type="text"
                  value={taxForm.appliesTo}
                  onChange={(e) => setTaxForm({ ...taxForm, appliesTo: e.target.value })}
                  placeholder="Works contract, piping, duct installation"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTaxModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Save Tax Slab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Term Modal */}
      {ptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingPt ? 'Edit Payment Term' : 'Add Payment Term'}
                </h3>
              </div>
              <button onClick={() => setPtModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePt} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Term Code *</label>
                <input
                  type="text"
                  required
                  value={ptForm.code}
                  onChange={(e) => setPtForm({ ...ptForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. TURNKEY-30-40-20-10"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Term Name *</label>
                <input
                  type="text"
                  required
                  value={ptForm.name}
                  onChange={(e) => setPtForm({ ...ptForm, name: e.target.value })}
                  placeholder="e.g. Standard Turnkey (30-40-20-10)"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Days</label>
                <input
                  type="number"
                  value={ptForm.days}
                  onChange={(e) => setPtForm({ ...ptForm, days: Number(e.target.value) })}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Milestone Breakdown Description</label>
                <textarea
                  rows={3}
                  value={ptForm.description}
                  onChange={(e) => setPtForm({ ...ptForm, description: e.target.value })}
                  placeholder="30% Advance, 40% Delivery, 20% Erection, 10% Commissioning sign-off"
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={ptForm.isDefault}
                  onChange={(e) => setPtForm({ ...ptForm, isDefault: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-xs font-medium text-slate-700">Set as System Default Term for Quotes</label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPtModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Save Payment Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Delete Master Record</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-slate-800">{deleteConfirm.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unit of Measure (UoM) Conversion Calculator Modal */}
      <UomConversionCalculatorModal
        isOpen={uomCalculatorOpen}
        onClose={() => {
          setUomCalculatorOpen(false);
          setUomPreselectedItem(null);
        }}
        inventory={inventory}
        preselectedItem={uomPreselectedItem}
        onApplyConversionToItem={handleApplyConversionToItem}
      />
    </div>
  );
};
