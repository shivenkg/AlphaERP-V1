import React, { useState, useEffect } from 'react';
import {
  Landmark,
  FileSpreadsheet,
  Receipt,
  Percent,
  Plus,
  ArrowUpDown,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  Layers,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building,
  Check,
  X,
  Printer,
  Scale,
  Loader2
} from 'lucide-react';
import {
  ChartOfAccount,
  JournalVoucher,
  TDSRecord,
  JournalVoucherEntry
} from '../types';
import { storageService } from '../services/storageService';
import { GAAPFinancialsView } from './finance/GAAPFinancialsView';
import { downloadElementAsPDF, triggerDirectPrint } from '../utils/pdfExportHelper';

interface FinanceViewProps {
  accounts: ChartOfAccount[];
  vouchers: JournalVoucher[];
  tdsRecords: TDSRecord[];
  initialTab?: TabType;
  onRefresh: () => void;
}

export type TabType = 'coa' | 'vouchers' | 'tds' | 'gst' | 'pnl' | 'gaap';

export const FinanceView: React.FC<FinanceViewProps> = ({
  accounts,
  vouchers,
  tdsRecords,
  initialTab = 'vouchers',
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccountType, setFilterAccountType] = useState<string>('all');
  const [filterTdsStatus, setFilterTdsStatus] = useState<string>('all');

  // New Voucher State
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState<JournalVoucher | null>(null);
  const [isExportingVoucherPDF, setIsExportingVoucherPDF] = useState(false);
  const voucherPrintRef = React.useRef<HTMLDivElement>(null);

  // New Account State
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);

  // TDS Challan Modal
  const [tdsModalOpen, setTdsModalOpen] = useState(false);
  const [selectedTdsForDeposit, setSelectedTdsForDeposit] = useState<TDSRecord | null>(null);
  const [challanNo, setChallanNo] = useState('CHAL-2025-08-9921');
  const [bsrCode, setBsrCode] = useState('0210045');

  // Account Form State
  const [accountForm, setAccountForm] = useState({
    code: '',
    name: '',
    type: 'Asset' as ChartOfAccount['type'],
    subCategory: 'Current Assets',
    openingBalance: 0,
    currentBalance: 0,
    currency: 'INR',
    description: '',
    isActive: true
  });

  // Voucher Form State
  const [voucherForm, setVoucherForm] = useState({
    voucherType: 'Journal' as JournalVoucher['voucherType'],
    date: new Date().toISOString().split('T')[0],
    referenceNo: '',
    narration: '',
    entries: [
      {
        accountId: accounts[0]?.id || 'acc-1',
        accountCode: accounts[0]?.accountCode || accounts[0]?.code || '1010',
        accountName: accounts[0]?.accountName || accounts[0]?.name || 'HDFC Bank - Commercial Current A/c',
        debitAmount: 0,
        creditAmount: 0,
        remarks: ''
      },
      {
        accountId: accounts[1]?.id || 'acc-2',
        accountCode: accounts[1]?.accountCode || accounts[1]?.code || '4010',
        accountName: accounts[1]?.accountName || accounts[1]?.name || 'Commercial HVAC Contract Sales',
        debitAmount: 0,
        creditAmount: 0,
        remarks: ''
      }
    ] as any[]
  });

  // Calculate voucher totals
  const totalDebit = voucherForm.entries.reduce((sum, e) => sum + (Number(e.debitAmount) || 0), 0);
  const totalCredit = voucherForm.entries.reduce((sum, e) => sum + (Number(e.creditAmount) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  // Add Row to Voucher
  const handleAddVoucherRow = () => {
    setVoucherForm({
      ...voucherForm,
      entries: [
        ...voucherForm.entries,
        {
          accountId: accounts[0]?.id || 'acc-1',
          accountCode: accounts[0]?.code || '1010',
          accountName: accounts[0]?.name || 'HDFC Bank',
          debitAmount: 0,
          creditAmount: 0,
          remarks: ''
        }
      ]
    });
  };

  // Remove Row from Voucher
  const handleRemoveVoucherRow = (index: number) => {
    if (voucherForm.entries.length <= 2) return;
    const newEntries = [...voucherForm.entries];
    newEntries.splice(index, 1);
    setVoucherForm({ ...voucherForm, entries: newEntries });
  };

  // Update Voucher Row
  const handleUpdateVoucherRow = (index: number, field: string, val: any) => {
    const newEntries = [...voucherForm.entries];
    if (field === 'accountId') {
      const selectedAcc = accounts.find((a) => a.id === val);
      if (selectedAcc) {
        newEntries[index].accountId = selectedAcc.id;
        newEntries[index].accountCode = selectedAcc.accountCode;
        newEntries[index].accountName = selectedAcc.accountName;
      }
    } else {
      (newEntries[index] as any)[field] = val;
    }
    setVoucherForm({ ...voucherForm, entries: newEntries });
  };

  // Open Voucher Creation Modal
  const handleOpenVoucherModal = () => {
    const nextNum = (vouchers.length + 1).toString().padStart(4, '0');
    setVoucherForm({
      voucherType: 'Journal' as JournalVoucher['voucherType'],
      date: new Date().toISOString().split('T')[0],
      referenceNo: `REF/HVAC/${nextNum}`,
      narration: '',
      entries: [
        {
          accountId: accounts[0]?.id || 'acc-1',
          accountCode: accounts[0]?.accountCode || '1010',
          accountName: accounts[0]?.accountName || 'HDFC Bank - Commercial Current A/c',
          debitAmount: 0,
          creditAmount: 0,
          remarks: ''
        },
        {
          accountId: accounts[1]?.id || 'acc-2',
          accountCode: accounts[1]?.accountCode || '4010',
          accountName: accounts[1]?.accountName || 'Commercial HVAC Contract Sales',
          debitAmount: 0,
          creditAmount: 0,
          remarks: ''
        }
      ] as any
    });
    setVoucherModalOpen(true);
  };

  // Save Journal Voucher
  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    storageService.addJournalVoucher({
      voucherType: (voucherForm.voucherType as any) || 'Journal',
      voucherDate: voucherForm.date,
      referenceNumber: voucherForm.referenceNo,
      narration: voucherForm.narration,
      entries: voucherForm.entries.map((e: any, idx) => ({
        id: `ve-${Date.now()}-${idx}`,
        accountId: e.accountId,
        accountCode: e.accountCode,
        accountName: e.accountName,
        debit: Number(e.debitAmount || e.debit || 0),
        credit: Number(e.creditAmount || e.credit || 0),
        narration: e.remarks || e.narration || ''
      })),
      totalAmount: totalDebit,
      status: 'Posted',
      createdBy: 'Finance Officer'
    });

    setVoucherModalOpen(false);
    onRefresh();
  };

  // Save / Update Chart of Account
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name || !accountForm.code) return;

    if (editingAccount) {
      storageService.updateChartOfAccount(editingAccount.id, {
        accountName: accountForm.name,
        accountCode: accountForm.code,
        type: accountForm.type,
        subCategory: accountForm.subCategory,
        openingBalance: accountForm.openingBalance,
        description: accountForm.description
      });
    } else {
      storageService.addChartOfAccount({
        accountName: accountForm.name,
        accountCode: accountForm.code,
        type: accountForm.type,
        subCategory: accountForm.subCategory,
        balance: accountForm.openingBalance,
        openingBalance: accountForm.openingBalance,
        description: accountForm.description
      });
    }
    setAccountModalOpen(false);
    onRefresh();
  };

  // Deposit TDS Challan
  const handleDepositTds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTdsForDeposit) return;

    storageService.depositTDS(
      selectedTdsForDeposit.id,
      challanNo,
      bsrCode,
      new Date().toISOString().split('T')[0]
    );
    setTdsModalOpen(false);
    setSelectedTdsForDeposit(null);
    onRefresh();
  };

  // Safe data arrays
  const safeAccounts = accounts || [];
  const safeVouchers = vouchers || [];
  const safeTdsRecords = tdsRecords || [];

  // Filtered Accounts
  const term = (searchTerm || '').trim().toLowerCase();
  const filteredAccounts = safeAccounts.filter((a) => {
    const code = a.accountCode || (a as any).code || '';
    const name = a.accountName || (a as any).name || '';
    const subCat = a.subCategory || '';
    const matchSearch =
      name.toLowerCase().includes(term) ||
      code.toLowerCase().includes(term) ||
      subCat.toLowerCase().includes(term);
    const matchType = filterAccountType === 'all' || a.type === filterAccountType;
    return matchSearch && matchType;
  });

  // Filtered Vouchers
  const filteredVouchers = safeVouchers.filter((v) => {
    const vNo = v.voucherNumber || (v as any).voucherNo || '';
    const narr = v.narration || '';
    const refNo = v.referenceNumber || (v as any).referenceNo || '';
    return (
      vNo.toLowerCase().includes(term) ||
      narr.toLowerCase().includes(term) ||
      refNo.toLowerCase().includes(term)
    );
  });

  // Filtered TDS
  const filteredTds = safeTdsRecords.filter((t) => {
    const partyName = t.deducteeName || (t as any).partyName || '';
    const section = t.section || '';
    const partyPan = t.deducteePan || (t as any).partyPan || '';
    const matchSearch =
      partyName.toLowerCase().includes(term) ||
      section.toLowerCase().includes(term) ||
      partyPan.toLowerCase().includes(term);
    const matchStatus = filterTdsStatus === 'all' || t.status === filterTdsStatus;
    return matchSearch && matchStatus;
  });

  // High-Level Financial Metrics with full fallback safety
  const totalAssets = safeAccounts
    .filter((a) => a.type?.includes('Asset') || a.type?.includes('Bank') || a.type?.includes('Receivable') || a.type === ('Asset' as any))
    .reduce((sum, a) => sum + (Number(a.balance ?? (a as any).currentBalance) || 0), 0) || 53500000;

  const totalLiabilities = safeAccounts
    .filter((a) => a.type?.includes('Liability') || a.type?.includes('Payable') || a.type === ('Liability' as any))
    .reduce((sum, a) => sum + (Number(a.balance ?? (a as any).currentBalance) || 0), 0) || 21850000;

  const totalRevenue = safeAccounts
    .filter((a) => a.type?.includes('Revenue') || a.type === ('Revenue' as any))
    .reduce((sum, a) => sum + (Number(a.balance ?? (a as any).currentBalance) || 0), 0) || 53200000;

  const totalExpenses = safeAccounts
    .filter((a) => a.type?.includes('Expense') || a.type?.includes('COGS') || a.type?.includes('Cost') || a.type === ('Expense' as any) || a.type === ('COGS' as any))
    .reduce((sum, a) => sum + (Number(a.balance ?? (a as any).currentBalance) || 0), 0) || 43560000;

  const netProfit = totalRevenue - totalExpenses;
  const netMarginPct = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : '0.00';

  const totalTdsDeducted = safeTdsRecords.reduce((sum, t) => sum + (Number(t.tdsDeducted ?? (t as any).tdsAmount) || 0), 0);
  const totalTdsPendingDeposit = safeTdsRecords
    .filter((t) => t.status === 'Deducted')
    .reduce((sum, t) => sum + (Number(t.tdsDeducted ?? (t as any).tdsAmount) || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Double-Entry ERP Accounting
            </span>
            <span className="text-xs text-slate-400">
              Indian Statutory GAAP & GST Compliant
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            Finance, General Ledger & Statutory Accounting
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
            Maintain real-time Chart of Accounts, balanced dual-entry Journal & Payment Vouchers, Tax Deducted at Source (TDS Sections 194C/J/I), GST GSTR-3B ITC reconciliations, and P&L financial statements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenVoucherModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Journal Voucher</span>
          </button>
        </div>
      </div>

      {/* Financial Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Gross Operating Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              ₹{(totalRevenue / 100000).toFixed(2)} L
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              Active HVAC Contracts & Billing
            </div>
          </div>
        </div>

        {/* Total Expenses / COGS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Direct COGS & Overheads</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              ₹{(totalExpenses / 100000).toFixed(2)} L
            </div>
            <div className="text-xs text-rose-600 font-medium mt-1">
              Material, Labor & Operating Cost
            </div>
          </div>
        </div>

        {/* Operating Net Margin */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Operating Net Profit (P&L)</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-blue-700 font-mono">
              ₹{(netProfit / 100000).toFixed(2)} L
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              {netMarginPct}% Net Operating Margin
            </div>
          </div>
        </div>

        {/* TDS Pending Deposit */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">TDS Pending Remittance</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-700 font-mono">
              ₹{totalTdsPendingDeposit.toLocaleString()}
            </div>
            <div className="text-xs text-amber-600 font-medium mt-1">
              Due on 7th of Next Month
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          onClick={() => { setActiveTab('vouchers'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'vouchers'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Journal Vouchers & Postings ({vouchers.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('coa'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'coa'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Chart of Accounts ({accounts.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('tds'); setSearchTerm(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'tds'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>TDS Statutory Register ({tdsRecords.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('gst'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'gst'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>GST 3B & ITC Reconciliation</span>
        </button>

        <button
          onClick={() => { setActiveTab('pnl'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'pnl'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>P&L Financial Statement</span>
        </button>

        <button
          onClick={() => { setActiveTab('gaap'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'gaap'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>GAAP Multi-Standard & Balance Sheet</span>
        </button>
      </div>

      {/* 1. JOURNAL VOUCHERS VIEW */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Voucher No, narration, ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing {filteredVouchers.length} posted journal transactions
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Voucher No & Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Reference & Narration</th>
                    <th className="px-4 py-3">Accounting Entries (Dr / Cr)</th>
                    <th className="px-4 py-3 text-right">Total Debit / Credit</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredVouchers.map((v) => {
                    const vNumber = v.voucherNumber || (v as any).voucherNo || 'VOUCH-001';
                    const vDate = v.voucherDate || (v as any).date || '';
                    const vType = v.voucherType || 'JV';
                    const vNarration = v.narration || 'General transaction';
                    const vRef = v.referenceNumber || (v as any).referenceNo;
                    const vTotal = Number(v.totalAmount ?? (v as any).totalDebit ?? 0);
                    const vEntries = v.entries || [];

                    return (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 font-mono">{vNumber}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{vDate}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                            vType === 'RV' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            vType === 'PV' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            vType === 'JV' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {vType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <div className="font-medium text-slate-800">{vNarration}</div>
                          {vRef && (
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">Ref: {vRef}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            {vEntries.map((entry, idx) => {
                              const dr = Number(entry.debit ?? (entry as any).debitAmount ?? 0);
                              const cr = Number(entry.credit ?? (entry as any).creditAmount ?? 0);
                              return (
                                <div key={idx} className="flex items-center justify-between gap-4 text-[11px]">
                                  <span className="text-slate-700">
                                    {entry.accountName} <span className="font-mono text-slate-400">({entry.accountCode})</span>
                                  </span>
                                  <span className="font-mono font-semibold">
                                    {dr > 0 ? (
                                      <span className="text-blue-600">Dr ₹{dr.toLocaleString('en-IN')}</span>
                                    ) : (
                                      <span className="text-emerald-600">Cr ₹{cr.toLocaleString('en-IN')}</span>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                          ₹{vTotal.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {v.status || 'Posted'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedVoucherForPrint(v)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Print / View Voucher Slip"
                          >
                            <Printer className="w-4 h-4" />
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
      )}

      {/* 2. CHART OF ACCOUNTS VIEW */}
      {activeTab === 'coa' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search accounts by code, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Type:</span>
              <select
                value={filterAccountType}
                onChange={(e) => setFilterAccountType(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">All Heads</option>
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Revenue">Revenue</option>
                <option value="COGS">COGS (Direct Material/Labor)</option>
                <option value="Expense">Operating Expense</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Account Code</th>
                    <th className="px-4 py-3">Account Title / Ledger</th>
                    <th className="px-4 py-3">Account Classification</th>
                    <th className="px-4 py-3">Sub Category</th>
                    <th className="px-4 py-3 text-right">Opening Balance</th>
                    <th className="px-4 py-3 text-right">Real-Time Balance</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAccounts.map((acc) => {
                    const accCode = acc.accountCode || (acc as any).code || '';
                    const accName = acc.accountName || (acc as any).name || '';
                    const openBal = Number(acc.openingBalance || 0);
                    const curBal = Number(acc.balance ?? (acc as any).currentBalance ?? 0);

                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{accCode}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          <div>{accName}</div>
                          {acc.description && <div className="text-[11px] text-slate-400 font-normal">{acc.description}</div>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                            acc.type === 'Asset' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            acc.type === 'Liability' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            acc.type === 'Revenue' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            acc.type === 'COGS' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {acc.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{acc.subCategory || 'General'}</td>
                        <td className="px-4 py-3.5 text-right font-mono text-slate-500">
                          ₹{openBal.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                          ₹{curBal.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TDS REGISTER VIEW */}
      {activeTab === 'tds' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Contractor, PAN, Section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={filterTdsStatus}
                onChange={(e) => setFilterTdsStatus(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">All Deductions</option>
                <option value="Deducted">Pending Remittance</option>
                <option value="Deposited">Deposited to Govt (Challan Paid)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Section & Description</th>
                    <th className="px-4 py-3">Contractor / Vendor Name</th>
                    <th className="px-4 py-3">Party PAN</th>
                    <th className="px-4 py-3">Gross Payment Base</th>
                    <th className="px-4 py-3">TDS Rate %</th>
                    <th className="px-4 py-3 text-right">TDS Deducted (₹)</th>
                    <th className="px-4 py-3">Challan / BSR Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTds.map((tds) => {
                    const party = tds.deducteeName || (tds as any).partyName || 'Vendor';
                    const pan = tds.deducteePan || (tds as any).partyPan || 'N/A';
                    const gross = Number(tds.paymentAmount ?? (tds as any).grossAmount ?? 0);
                    const rate = Number(tds.ratePct ?? (tds as any).tdsRatePct ?? 0);
                    const amount = Number(tds.tdsDeducted ?? (tds as any).tdsAmount ?? 0);
                    const cNo = tds.challanNumber || (tds as any).challanNo;

                    return (
                      <tr key={tds.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{tds.section}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{tds.description || 'TDS Deduction'}</div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-800">{party}</td>
                        <td className="px-4 py-3.5 font-mono text-[11px] font-semibold">{pan}</td>
                        <td className="px-4 py-3.5 font-mono font-medium">₹{gross.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{rate}%</td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600">
                          ₹{amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3.5">
                          {tds.status === 'Deposited' ? (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Challan Paid
                              </span>
                              {cNo && (
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {cNo} {tds.bsrCode ? `(BSR: ${tds.bsrCode})` : ''}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Pending Deposit
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {tds.status === 'Deducted' && (
                            <button
                              onClick={() => {
                                setSelectedTdsForDeposit(tds);
                                setTdsModalOpen(true);
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold shadow-xs transition-all"
                            >
                              Mark Challan Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. GST 3B & ITC RECONCILIATION */}
      {activeTab === 'gst' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Output GST Collected (Sales) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>GSTR-1 Output Tax Liability (Sales Invoices)</span>
              </h3>
              <span className="text-xs font-mono font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                August 2026
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Taxable Turnover (18% Turnkey Works Contract)</span>
                <span className="font-mono font-bold text-slate-900">₹62,50,000</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">CGST (9%) Output Liability</span>
                <span className="font-mono font-semibold text-slate-800">₹5,62,500</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">SGST (9%) Output Liability</span>
                <span className="font-mono font-semibold text-slate-800">₹5,62,500</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">IGST (Inter-State 18%)</span>
                <span className="font-mono font-semibold text-slate-800">₹0</span>
              </div>
              <div className="flex justify-between py-2.5 bg-slate-50 px-3 rounded-xl font-bold text-slate-900">
                <span>Total Gross Output GST Liability</span>
                <span className="font-mono text-emerald-700">₹11,25,000</span>
              </div>
            </div>
          </div>

          {/* Input Tax Credit (ITC) from Vendor POs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>GSTR-2B Eligible Input Tax Credit (ITC Set-Off)</span>
              </h3>
              <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                August 2026
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">VRV & Chillers Equipment ITC (28% / 18%)</span>
                <span className="font-mono font-semibold text-slate-800">₹6,84,000</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Copper Pipes, Insulation & GI Sheets ITC (18%)</span>
                <span className="font-mono font-semibold text-slate-800">₹1,95,000</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Erection Subcontractor ITC (18%)</span>
                <span className="font-mono font-semibold text-slate-800">₹85,000</span>
              </div>
              <div className="flex justify-between py-2.5 bg-blue-50/50 px-3 rounded-xl font-bold text-slate-900">
                <span>Total Available ITC for Set-off</span>
                <span className="font-mono text-blue-700">₹9,64,000</span>
              </div>
              <div className="flex justify-between py-3 bg-emerald-50 px-3.5 rounded-xl font-bold text-slate-900 border border-emerald-200 mt-2">
                <span>Net Cash GST Payable via PMT-06 Challan</span>
                <span className="font-mono text-emerald-800 text-sm">₹1,61,000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. P&L STATEMENT */}
      {activeTab === 'pnl' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-4xl mx-auto">
          <div className="text-center pb-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">AlphaERP Engineering & MEP Contracts</h3>
            <p className="text-xs text-slate-500 mt-0.5">Condensed Statement of Profit and Loss (FY 2026-27)</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Revenue */}
            <div>
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 p-2 rounded-lg">
                I. Revenue from Operations
              </div>
              <div className="divide-y divide-slate-100 pl-4 mt-2">
                <div className="flex justify-between py-2">
                  <span className="text-slate-700">Commercial Turnkey HVAC Project Contracts</span>
                  <span className="font-mono font-semibold">₹1,85,00,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-700">Annual Maintenance Contracts (AMC) & Service</span>
                  <span className="font-mono font-semibold">₹18,50,000</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-slate-900">
                  <span>Total Operating Revenue (A)</span>
                  <span className="font-mono text-emerald-700">₹2,03,50,000</span>
                </div>
              </div>
            </div>

            {/* Direct Expenses */}
            <div>
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 p-2 rounded-lg">
                II. Direct Cost of Goods Sold (COGS)
              </div>
              <div className="divide-y divide-slate-100 pl-4 mt-2">
                <div className="flex justify-between py-2">
                  <span className="text-slate-700">Equipment Procurement (VRV Outdoor/Indoor, Chillers, AHUs)</span>
                  <span className="font-mono font-semibold">₹94,50,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-700">Raw Materials (Copper Tubes, Duct GI Sheets, Insulation, Valves)</span>
                  <span className="font-mono font-semibold">₹28,20,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-700">Subcontracting Site Erection & Duct Installation Labor</span>
                  <span className="font-mono font-semibold">₹14,80,000</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-slate-900">
                  <span>Total Direct Cost (B)</span>
                  <span className="font-mono text-rose-700">₹1,37,50,000</span>
                </div>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="flex justify-between p-3 bg-blue-50 rounded-xl font-bold text-slate-900 border border-blue-200">
              <span>Gross Profit (A - B)</span>
              <span className="font-mono text-blue-800 text-sm">₹66,00,000 (32.43% Gross Margin)</span>
            </div>

            {/* Operating Overheads */}
            <div>
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 p-2 rounded-lg">
                III. Operating Overheads & General Expenses
              </div>
              <div className="divide-y divide-slate-100 pl-4 mt-2">
                <div className="flex justify-between py-2">
                  <span className="text-slate-700">Engineering Staff & Project Management Payroll</span>
                  <span className="font-mono font-semibold">₹18,40,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-700">Office Rent & Central Warehouse Leases</span>
                  <span className="font-mono font-semibold">₹4,20,000</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-700">Site Travel, Mobilization & Freight Charges</span>
                  <span className="font-mono font-semibold">₹3,10,000</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-slate-900">
                  <span>Total Operating Expenses (C)</span>
                  <span className="font-mono text-rose-700">₹25,70,000</span>
                </div>
              </div>
            </div>

            {/* Net Profit EBITDA */}
            <div className="flex justify-between p-4 bg-emerald-50 rounded-xl font-bold text-slate-900 border border-emerald-300">
              <div>
                <div className="text-sm">Operating Profit Before Tax (EBITDA)</div>
                <div className="text-[11px] text-emerald-700 font-normal">After all COGS, Site Direct, and Overhead Payroll deductions</div>
              </div>
              <span className="font-mono text-emerald-800 text-base">₹40,30,000 (19.80% Net Margin)</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. GAAP MULTI-STANDARD & FINANCIAL STATEMENTS */}
      {activeTab === 'gaap' && (
        <GAAPFinancialsView
          accounts={accounts}
          vouchers={vouchers}
          tdsRecords={tdsRecords}
          onRefresh={onRefresh}
        />
      )}

      {/* ========================================== */}
      {/* VOUCHER CREATION MODAL */}
      {/* ========================================== */}
      {voucherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Create Dual-Entry Journal Voucher</h3>
              </div>
              <button
                onClick={() => setVoucherModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVoucher} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Voucher Type *</label>
                  <select
                    value={voucherForm.voucherType}
                    onChange={(e) => setVoucherForm({ ...voucherForm, voucherType: e.target.value as any })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="JV">JV - Journal Voucher</option>
                    <option value="PV">PV - Payment Voucher</option>
                    <option value="RV">RV - Receipt Voucher</option>
                    <option value="CN">CN - Credit Note</option>
                    <option value="DN">DN - Debit Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Posting Date *</label>
                  <input
                    type="date"
                    required
                    value={voucherForm.date}
                    onChange={(e) => setVoucherForm({ ...voucherForm, date: e.target.value })}
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reference No / Bill No</label>
                  <input
                    type="text"
                    value={voucherForm.referenceNo}
                    onChange={(e) => setVoucherForm({ ...voucherForm, referenceNo: e.target.value })}
                    placeholder="e.g. INV/2026/089"
                    className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Narration / Description *</label>
                <input
                  type="text"
                  required
                  value={voucherForm.narration}
                  onChange={(e) => setVoucherForm({ ...voucherForm, narration: e.target.value })}
                  placeholder="Being payment made towards Site Ducting Material via HDFC NetBanking..."
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Dynamic Voucher Entries Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Accounting Entries (Double-Entry)</span>
                  <button
                    type="button"
                    onClick={handleAddVoucherRow}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ledger Line</span>
                  </button>
                </div>

                <div className="p-3 space-y-3">
                  {voucherForm.entries.map((entry, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select
                          value={entry.accountId}
                          onChange={(e) => handleUpdateVoucherRow(index, 'accountId', e.target.value)}
                          className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-xl font-medium"
                        >
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name} ({acc.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Debit (₹)"
                          value={entry.debitAmount || ''}
                          onChange={(e) => {
                            handleUpdateVoucherRow(index, 'debitAmount', Number(e.target.value));
                            if (Number(e.target.value) > 0) handleUpdateVoucherRow(index, 'creditAmount', 0);
                          }}
                          className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-xl font-mono text-blue-600 font-semibold"
                        />
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Credit (₹)"
                          value={entry.creditAmount || ''}
                          onChange={(e) => {
                            handleUpdateVoucherRow(index, 'creditAmount', Number(e.target.value));
                            if (Number(e.target.value) > 0) handleUpdateVoucherRow(index, 'debitAmount', 0);
                          }}
                          className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-xl font-mono text-emerald-600 font-semibold"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        {voucherForm.entries.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVoucherRow(index)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals & Balance Verification Bar */}
                <div className="bg-slate-50 p-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    {isBalanced ? (
                      <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Voucher is Balanced</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-700 bg-rose-100/60 px-2.5 py-1 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>Difference: ₹{Math.abs(totalDebit - totalCredit).toLocaleString()}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 font-mono text-sm">
                    <div>
                      <span className="text-slate-500 text-xs mr-2">Total Dr:</span>
                      <span className="text-blue-600">₹{totalDebit.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs mr-2">Total Cr:</span>
                      <span className="text-emerald-600">₹{totalCredit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVoucherModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className={`px-5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all ${
                    isBalanced
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Post Journal Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TDS Challan Remittance Modal */}
      {tdsModalOpen && selectedTdsForDeposit && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Record Govt TDS Challan Deposit</h3>
              <button onClick={() => setTdsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs text-slate-700">
              <div><span className="font-semibold">Section:</span> {selectedTdsForDeposit.section} ({selectedTdsForDeposit.description || 'TDS'})</div>
              <div><span className="font-semibold">Deductee:</span> {selectedTdsForDeposit.deducteeName || (selectedTdsForDeposit as any).partyName} (PAN: {selectedTdsForDeposit.deducteePan || (selectedTdsForDeposit as any).partyPan})</div>
              <div><span className="font-semibold">TDS Amount:</span> <span className="font-bold text-rose-600 font-mono">₹{Number(selectedTdsForDeposit.tdsDeducted ?? (selectedTdsForDeposit as any).tdsAmount ?? 0).toLocaleString('en-IN')}</span></div>
            </div>

            <form onSubmit={handleDepositTds} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Challan CIN / No *</label>
                <input
                  type="text"
                  required
                  value={challanNo}
                  onChange={(e) => setChallanNo(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank BSR Code (7 Digits) *</label>
                <input
                  type="text"
                  required
                  value={bsrCode}
                  onChange={(e) => setBsrCode(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setTdsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Confirm ITNS-281 Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Slip Print Preview Modal */}
      {selectedVoucherForPrint && (() => {
        const vNum = selectedVoucherForPrint.voucherNumber || (selectedVoucherForPrint as any).voucherNo || 'VOUCH-001';
        const vDt = selectedVoucherForPrint.voucherDate || (selectedVoucherForPrint as any).date || '';
        const vTot = Number(selectedVoucherForPrint.totalAmount ?? (selectedVoucherForPrint as any).totalDebit ?? 0);
        const vEntries = selectedVoucherForPrint.entries || [];

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Journal Voucher Record Slip</h3>
                <button onClick={() => setSelectedVoucherForPrint(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div ref={voucherPrintRef} className="p-4 border border-slate-200 rounded-xl space-y-4 text-xs font-sans bg-white">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">HVAC Biz Pvt Ltd</h4>
                    <p className="text-slate-500">AlphaERP Commercial Contracting Division</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-blue-600">{vNum}</div>
                    <div className="text-slate-500">Date: {vDt}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold text-slate-800">Narration:</div>
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-700 italic">{selectedVoucherForPrint.narration || 'General Entry'}</div>
                </div>

                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold">
                    <tr>
                      <th className="p-2">Ledger Account</th>
                      <th className="p-2 text-right">Debit (₹)</th>
                      <th className="p-2 text-right">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vEntries.map((e, idx) => {
                      const dr = Number(e.debit ?? (e as any).debitAmount ?? 0);
                      const cr = Number(e.credit ?? (e as any).creditAmount ?? 0);
                      return (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{e.accountName} <span className="text-slate-400 font-mono">({e.accountCode})</span></td>
                          <td className="p-2 text-right font-mono">{dr > 0 ? `₹${dr.toLocaleString('en-IN')}` : '-'}</td>
                          <td className="p-2 text-right font-mono">{cr > 0 ? `₹${cr.toLocaleString('en-IN')}` : '-'}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2">Total</td>
                      <td className="p-2 text-right font-mono">₹{vTot.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-mono">₹{vTot.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-between pt-8 text-[11px] text-slate-500">
                  <div>Prepared By: <span className="font-semibold text-slate-700">{selectedVoucherForPrint.createdBy || 'Finance Officer'}</span></div>
                  <div>Authorized Signatory: ____________________</div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={async () => {
                    if (!voucherPrintRef.current || !selectedVoucherForPrint) return;
                    setIsExportingVoucherPDF(true);
                    try {
                      await downloadElementAsPDF(voucherPrintRef.current, {
                        filename: `AlphaERP_Voucher_${vNum}`,
                        documentTitle: `Journal Voucher - ${vNum}`
                      });
                    } finally {
                      setIsExportingVoucherPDF(false);
                    }
                  }}
                  disabled={isExportingVoucherPDF}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                >
                  {isExportingVoucherPDF ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    triggerDirectPrint(voucherPrintRef.current, `AlphaERP_Voucher_${vNum}`);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>

                <button
                  onClick={() => setSelectedVoucherForPrint(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
