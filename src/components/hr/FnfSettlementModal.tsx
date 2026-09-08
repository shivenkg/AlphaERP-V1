import React, { useState } from 'react';
import {
  X,
  Receipt,
  Send,
  Printer,
  CheckCircle2,
  DollarSign,
  Building,
  CreditCard,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileText,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ResignationRecord, EmployeeMaster } from '../../types';
import { storageService } from '../../services/storageService';
import { triggerDirectPrint } from '../../utils/pdfExportHelper';

interface FnfSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  resignation: ResignationRecord;
  employee?: EmployeeMaster;
  onSuccess: () => void;
}

export const FnfSettlementModal: React.FC<FnfSettlementModalProps> = ({
  isOpen,
  onClose,
  resignation,
  employee,
  onSuccess
}) => {
  if (!isOpen) return null;

  const initialFnf = resignation.fnfSettlement || {
    unpaidSalaryDays: 30,
    unpaidSalaryAmount: 35000,
    leaveEncashmentDays: 5,
    leaveEncashmentAmount: 5833,
    gratuityAmount: 0,
    bonusOrIncentives: 0,
    reimbursementsPending: 0,
    otherEarnings: 0,
    totalEarnings: 40833,
    noticeRecoveryDays: 0,
    noticeRecoveryAmount: 0,
    imprestAdvanceDeduction: 0,
    assetDamageOrLossDeduction: 0,
    tdsTaxDeduction: 0,
    pfDeduction: 1800,
    otherDeductions: 0,
    totalDeductions: 1800,
    netPayableAmount: 39033,
    financeStatus: 'Draft'
  };

  // Editable earnings
  const [unpaidSalaryDays, setUnpaidSalaryDays] = useState<number>(initialFnf.unpaidSalaryDays);
  const [unpaidSalaryAmount, setUnpaidSalaryAmount] = useState<number>(initialFnf.unpaidSalaryAmount);
  const [leaveEncashmentDays, setLeaveEncashmentDays] = useState<number>(initialFnf.leaveEncashmentDays);
  const [leaveEncashmentAmount, setLeaveEncashmentAmount] = useState<number>(initialFnf.leaveEncashmentAmount);
  const [gratuityAmount, setGratuityAmount] = useState<number>(initialFnf.gratuityAmount);
  const [bonusOrIncentives, setBonusOrIncentives] = useState<number>(initialFnf.bonusOrIncentives || 0);
  const [reimbursementsPending, setReimbursementsPending] = useState<number>(initialFnf.reimbursementsPending || 0);
  const [otherEarnings, setOtherEarnings] = useState<number>(initialFnf.otherEarnings || 0);

  // Editable deductions
  const [noticeRecoveryDays, setNoticeRecoveryDays] = useState<number>(initialFnf.noticeRecoveryDays || 0);
  const [noticeRecoveryAmount, setNoticeRecoveryAmount] = useState<number>(initialFnf.noticeRecoveryAmount);
  const [imprestAdvanceDeduction, setImprestAdvanceDeduction] = useState<number>(initialFnf.imprestAdvanceDeduction || 0);
  const [assetDamageDeduction, setAssetDamageDeduction] = useState<number>(initialFnf.assetDamageOrLossDeduction || 0);
  const [tdsTaxDeduction, setTdsTaxDeduction] = useState<number>(initialFnf.tdsTaxDeduction || 0);
  const [pfDeduction, setPfDeduction] = useState<number>(initialFnf.pfDeduction || 0);
  const [otherDeductions, setOtherDeductions] = useState<number>(initialFnf.otherDeductions || 0);

  // Disbursal form states
  const [isDisbursing, setIsDisbursing] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer / NEFT' | 'RTGS' | 'UPI' | 'Cheque'>('Bank Transfer / NEFT');
  const [paymentRef, setPaymentRef] = useState<string>(
    initialFnf.paymentRef || `NEFT-HDFC-FNF-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [paymentDate, setPaymentDate] = useState<string>(
    initialFnf.paymentDate || new Date().toISOString().split('T')[0]
  );
  const [financeRemarks, setFinanceRemarks] = useState<string>(
    initialFnf.financeRemarks || 'Full & Final payment processed via Corporate Netbanking.'
  );
  const [disbursedBy, setDisbursedBy] = useState<string>(
    initialFnf.financeDisbursedBy || 'Finance Accounts Department'
  );

  // Totals
  const totalEarnings =
    unpaidSalaryAmount +
    leaveEncashmentAmount +
    gratuityAmount +
    bonusOrIncentives +
    reimbursementsPending +
    otherEarnings;

  const totalDeductions =
    noticeRecoveryAmount +
    imprestAdvanceDeduction +
    assetDamageDeduction +
    tdsTaxDeduction +
    pfDeduction +
    otherDeductions;

  const netPayable = Math.max(0, totalEarnings - totalDeductions);

  // Save changes to F&F
  const handleSaveDraft = () => {
    storageService.updateFnfSettlement(resignation.id, {
      unpaidSalaryDays,
      unpaidSalaryAmount,
      leaveEncashmentDays,
      leaveEncashmentAmount,
      gratuityAmount,
      bonusOrIncentives,
      reimbursementsPending,
      otherEarnings,
      totalEarnings,
      noticeRecoveryDays,
      noticeRecoveryAmount,
      imprestAdvanceDeduction,
      assetDamageOrLossDeduction: assetDamageDeduction,
      tdsTaxDeduction,
      pfDeduction,
      otherDeductions,
      totalDeductions,
      netPayableAmount: netPayable
    });
    onSuccess();
  };

  // Transmit to Finance
  const handleShareWithFinance = () => {
    handleSaveDraft();
    const voucherNumber = initialFnf.financeVoucherNumber || `FNF-PAY-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    storageService.shareFnfWithFinance(resignation.id, voucherNumber);
    onSuccess();
  };

  // Confirm Payment Disbursed
  const handleCompleteDisbursal = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveDraft();
    storageService.settleFullAndFinal(resignation.id, {
      paymentMethod,
      paymentRef,
      paymentDate,
      financeRemarks,
      disbursedBy
    });
    setIsDisbursing(false);
    onSuccess();
  };

  const isSharedWithFinance =
    resignation.status === 'Shared with Finance' ||
    resignation.status === 'F&F Completed' ||
    resignation.status === 'Settled' ||
    initialFnf.financeStatus === 'Sent to Finance' ||
    initialFnf.financeStatus === 'Payment Released';

  const isCompleted =
    resignation.status === 'F&F Completed' ||
    resignation.status === 'Settled' ||
    initialFnf.financeStatus === 'Payment Released';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full p-5 sm:p-6 shadow-2xl my-6 transition-all animate-in fade-in-50 zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Full & Final (F&F) Settlement & Finance Payout
              </h3>
              <p className="text-xs text-slate-500">
                Itemized statutory dues, encashment, gratuity, clearances, and Finance voucher sharing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerDirectPrint('fnf-printable-sheet')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all"
              title="Print F&F Statement"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Section Wrapper */}
        <div id="fnf-printable-sheet" className="space-y-4 pt-4">
          {/* Employee & Bank Particulars Bar */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Employee Name</span>
              <span className="font-bold text-slate-900 text-sm">{resignation.empName}</span>
              <span className="text-[11px] text-slate-500 block font-mono">
                {resignation.empCode} • {resignation.designation}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Department / DOJ</span>
              <span className="font-semibold text-slate-800">{resignation.department}</span>
              <span className="text-[11px] text-slate-500 block font-mono">Joined: {resignation.dateOfJoining}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Last Working Date</span>
              <span className="font-bold text-indigo-700 font-mono text-sm">
                {resignation.approvedLastWorkingDate}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Notice: {resignation.noticePeriodDays}d ({resignation.noticeShortfallDays ? `${resignation.noticeShortfallDays}d shortfall` : 'Full notice served'})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Finance Payout Status</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] mt-0.5 ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : isSharedWithFinance
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {isCompleted ? 'Payment Released' : isSharedWithFinance ? 'Sent to Finance' : 'Draft / Pending Review'}
              </span>
              {initialFnf.financeVoucherNumber && (
                <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                  Voucher: {initialFnf.financeVoucherNumber}
                </span>
              )}
            </div>
          </div>

          {/* Bank Transfer Details for Finance */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span className="font-bold text-indigo-950">Employee Payout Bank Account Details:</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-700 font-mono">
              {(() => {
                const bank = typeof employee?.bankDetails === 'object' ? employee.bankDetails : null;
                return (
                  <>
                    <div>
                      Bank: <strong className="text-slate-900">{bank?.bankName || employee?.bankName || 'HDFC Bank Ltd.'}</strong>
                    </div>
                    <div>
                      A/C No: <strong className="text-slate-900">{bank?.accountNumber || employee?.bankAccount || employee?.bankAccountNo || '50100492819201'}</strong>
                    </div>
                    <div>
                      IFSC: <strong className="text-slate-900">{bank?.ifscCode || employee?.ifscCode || employee?.bankIfsc || 'HDFC0000240'}</strong>
                    </div>
                    <div>
                      Branch: <strong className="text-slate-900">{bank?.branchName || bank?.branch || 'Fort Mumbai'}</strong>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* 2-Column Earnings & Deductions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* COLUMN 1: EARNINGS (+) */}
            <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>A. Gross Settlement Earnings (+)</span>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  ₹{totalEarnings.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Unpaid Salary */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      Unpaid Salary ({unpaidSalaryDays} Working Days)
                    </label>
                    <span className="text-[10px] text-slate-500">Days served in exit month</span>
                  </div>
                  <input
                    type="number"
                    value={unpaidSalaryAmount}
                    onChange={(e) => setUnpaidSalaryAmount(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                  />
                </div>

                {/* Leave Encashment */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      Leave Encashment ({leaveEncashmentDays} Days EL/PL)
                    </label>
                    <span className="text-[10px] text-slate-500">Earned leaves encashed as per policy</span>
                  </div>
                  <input
                    type="number"
                    value={leaveEncashmentAmount}
                    onChange={(e) => setLeaveEncashmentAmount(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                  />
                </div>

                {/* Gratuity */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      Statutory Gratuity Settlement
                    </label>
                    <span className="text-[10px] text-slate-500">(15 * Basic * Years) / 26</span>
                  </div>
                  <input
                    type="number"
                    value={gratuityAmount}
                    onChange={(e) => setGratuityAmount(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                  />
                </div>

                {/* Bonus / Performance Incentives */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      Bonus / Performance Incentive
                    </label>
                    <span className="text-[10px] text-slate-500">Pro-rata statutory annual bonus</span>
                  </div>
                  <input
                    type="number"
                    value={bonusOrIncentives}
                    onChange={(e) => setBonusOrIncentives(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                  />
                </div>

                {/* Reimbursements */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      Site Travel / Expense Reimbursements
                    </label>
                    <span className="text-[10px] text-slate-500">Verified pending expense claims</span>
                  </div>
                  <input
                    type="number"
                    value={reimbursementsPending}
                    onChange={(e) => setReimbursementsPending(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                  />
                </div>

                {/* Other Earnings */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">Other Earnings / Ex-gratia</label>
                    <span className="text-[10px] text-slate-500">Special allowances or retention pay</span>
                  </div>
                  <input
                    type="number"
                    value={otherEarnings}
                    onChange={(e) => setOtherEarnings(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* COLUMN 2: DEDUCTIONS (-) */}
            <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>B. Settlement Deductions & Recoveries (-)</span>
                </div>
                <span className="font-mono font-bold text-rose-800 text-sm">
                  ₹{totalDeductions.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Notice Shortfall Recovery */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      Notice Shortfall Recovery ({noticeRecoveryDays} Days)
                    </label>
                    <span className="text-[10px] text-slate-500">Unserved notice deduction (unless waived)</span>
                  </div>
                  <input
                    type="number"
                    value={noticeRecoveryAmount}
                    onChange={(e) => setNoticeRecoveryAmount(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                  />
                </div>

                {/* Imprest / Salary Advance */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      Pending Salary Advance / Imprest
                    </label>
                    <span className="text-[10px] text-slate-500">Finance loans or site float balance</span>
                  </div>
                  <input
                    type="number"
                    value={imprestAdvanceDeduction}
                    onChange={(e) => setImprestAdvanceDeduction(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                  />
                </div>

                {/* Asset Damage / Loss */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      Company Asset Damage / Missing Gear
                    </label>
                    <span className="text-[10px] text-slate-500">Hardware replacement or repair charge</span>
                  </div>
                  <input
                    type="number"
                    value={assetDamageDeduction}
                    onChange={(e) => setAssetDamageDeduction(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                  />
                </div>

                {/* TDS Income Tax */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      TDS (Tax Deducted at Source)
                    </label>
                    <span className="text-[10px] text-slate-500">Form 16 exit tax deduction</span>
                  </div>
                  <input
                    type="number"
                    value={tdsTaxDeduction}
                    onChange={(e) => setTdsTaxDeduction(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                  />
                </div>

                {/* PF Employee Contribution */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      Provident Fund (PF) Employee Share
                    </label>
                    <span className="text-[10px] text-slate-500">Statutory PF for exit month</span>
                  </div>
                  <input
                    type="number"
                    value={pfDeduction}
                    onChange={(e) => setPfDeduction(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                  />
                </div>

                {/* Other Deductions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 block text-[11px]">
                      Other Deductions / Dues
                    </label>
                    <span className="text-[10px] text-slate-500">Mess dues, ID card replacement, etc.</span>
                  </div>
                  <input
                    type="number"
                    value={otherDeductions}
                    onChange={(e) => setOtherDeductions(Number(e.target.value))}
                    className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* NET SETTLEMENT PAYOUT HIGHLIGHT */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div>
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-bold block">
                Final Net Payable Amount (A - B)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 mt-0.5">
                ₹{netPayable.toLocaleString()}
              </div>
              <span className="text-[11px] text-indigo-200 mt-1 block">
                Official amount payable to employee upon full clearances sign-off
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition-all"
              >
                Save F&F Calculation
              </button>

              {!isSharedWithFinance && (
                <button
                  type="button"
                  onClick={handleShareWithFinance}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Share Settlement with Finance</span>
                </button>
              )}

              {isSharedWithFinance && !isCompleted && (
                <button
                  type="button"
                  onClick={() => setIsDisbursing(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Record Finance Disbursal</span>
                </button>
              )}
            </div>
          </div>

          {/* Disbursal Details if already completed */}
          {isCompleted && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-900 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Full & Final Payment Disbursed</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block">Bank Ref / UTR</span>
                  <strong>{initialFnf.paymentRef}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Payment Date</span>
                  <strong>{initialFnf.paymentDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Method</span>
                  <strong>{initialFnf.paymentMethod || 'Bank Transfer / NEFT'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Disbursed By</span>
                  <strong>{initialFnf.financeDisbursedBy || 'Finance Team'}</strong>
                </div>
              </div>
              {initialFnf.financeRemarks && (
                <div className="italic text-[11px] text-emerald-800 pt-1">
                  "{initialFnf.financeRemarks}"
                </div>
              )}
            </div>
          )}

          {/* Form to process payment disbursal */}
          {isDisbursing && (
            <form onSubmit={handleCompleteDisbursal} className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-900">Finance Payout Processing Voucher</h4>
                <button
                  type="button"
                  onClick={() => setIsDisbursing(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Corporate Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction UTR / Reference No. *</label>
                  <input
                    type="text"
                    required
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disbursal Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disbursed By (Officer Name)</label>
                  <input
                    type="text"
                    value={disbursedBy}
                    onChange={(e) => setDisbursedBy(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Finance Advice & Remarks</label>
                  <input
                    type="text"
                    value={financeRemarks}
                    onChange={(e) => setFinanceRemarks(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDisbursing(false)}
                  className="px-3 py-1.5 text-slate-600 bg-white border border-slate-300 rounded-lg font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  Confirm & Finalize F&F Disbursal
                </button>
              </div>
            </form>
          )}

          {/* Official Sign-off Audit Signatures in Print */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] text-center text-slate-500">
            <div className="border-t border-slate-300 pt-2">
              <span className="font-bold text-slate-800 block">Reporting Manager</span>
              <span>{resignation.approvals?.manager.approverName || 'Handover Verified'}</span>
            </div>
            <div className="border-t border-slate-300 pt-2">
              <span className="font-bold text-slate-800 block">Admin & Facilities</span>
              <span>{resignation.approvals?.admin.approverName || 'Assets & ID Received'}</span>
            </div>
            <div className="border-t border-slate-300 pt-2">
              <span className="font-bold text-slate-800 block">HR Authorization</span>
              <span>{resignation.approvals?.hr.approverName || 'Notice & F&F Approved'}</span>
            </div>
            <div className="border-t border-slate-300 pt-2">
              <span className="font-bold text-slate-800 block">Finance / Accounts</span>
              <span>{initialFnf.financeDisbursedBy || 'Payment Released'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
