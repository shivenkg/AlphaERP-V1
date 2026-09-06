import React, { useRef, useState } from 'react';
import {
  Printer,
  Download,
  X,
  Building,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Calendar,
  CreditCard,
  Loader2
} from 'lucide-react';
import { EmployeeMaster } from '../../types';
import { downloadElementAsPDF, triggerDirectPrint } from '../../utils/pdfExportHelper';

interface PayslipModalProps {
  month: string;
  year: number;
  slip: {
    employeeName?: string;
    empName?: string;
    designation?: string;
    basicEarned?: number;
    hraEarned?: number;
    specialAllowanceEarned?: number;
    siteAllowanceEarned?: number;
    conveyanceAllowance?: number;
    grossEarned?: number;
    grossSalary?: number;
    epfDeduction?: number;
    ptDeduction?: number;
    esicDeduction?: number;
    tdsDeduction?: number;
    lossOfPayDeduction?: number;
    totalDeductions?: number;
    netPayable?: number;
    netSalary?: number;
    daysPresent?: number;
    totalDaysInMonth?: number;
    overtimeHours?: number;
    overtimePay?: number;
  };
  employee: EmployeeMaster;
  onClose: () => void;
}

// Convert numbers to Indian Rupees in words
function numberToWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';

  function inWords(n: number): string {
    let str = '';
    if (n > 9999999) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (n > 99999) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n > 999) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (n > 99) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) str += a[n];
      else {
        str += b[Math.floor(n / 10)];
        if (n % 10 > 0) str += ' ' + a[n % 10];
      }
    }
    return str;
  }

  return 'Rupees ' + inWords(n).trim() + ' Only';
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  month,
  year,
  slip,
  employee,
  onClose
}) => {
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Safe normalizations
  const safeSlip = slip || {};
  const empName = safeSlip.employeeName || safeSlip.empName || employee?.fullName || employee?.name || 'Employee';
  const designation = safeSlip.designation || employee?.designation || 'HVAC Engineer';
  const empCode = employee?.empCode || employee?.code || 'EMP-001';
  const department = employee?.department || 'Projects & Engineering';
  const bankAcc = employee?.bankAccountNo || 'HDFC000192847192';
  const ifsc = employee?.ifscCode || 'HDFC0000123';
  const pan = employee?.pan || 'ABCDE1234F';
  const uan = employee?.uan || '101239847192';
  const esicNo = employee?.esicNo || '3100098472910001';
  const dateOfJoining = employee?.dateOfJoining || employee?.joiningDate || '2023-04-15';

  const daysPresent = safeSlip.daysPresent ?? 26;
  const totalDays = safeSlip.totalDaysInMonth ?? 30;
  const lopDays = Math.max(0, totalDays - daysPresent);

  const basic = safeSlip.basicEarned ?? 45000;
  const hra = safeSlip.hraEarned ?? 22500;
  const special = safeSlip.specialAllowanceEarned ?? 12500;
  const site = safeSlip.siteAllowanceEarned ?? 8000;
  const overtime = safeSlip.overtimePay ?? 0;
  const gross = safeSlip.grossEarned ?? safeSlip.grossSalary ?? (basic + hra + special + site + overtime);

  const epf = safeSlip.epfDeduction ?? Math.round(basic * 0.12);
  const pt = safeSlip.ptDeduction ?? 200;
  const esic = safeSlip.esicDeduction ?? 0;
  const tds = safeSlip.tdsDeduction ?? 3500;
  const lop = safeSlip.lossOfPayDeduction ?? 0;
  const totalDeductions = safeSlip.totalDeductions ?? (epf + pt + esic + tds + lop);
  const netPayable = safeSlip.netPayable ?? safeSlip.netSalary ?? (gross - totalDeductions);

  const netInWords = numberToWords(netPayable);

  const handlePrint = () => {
    triggerDirectPrint(printContainerRef.current, `AlphaERP_Payslip_${empCode}_${month}_${year}`);
  };

  const handleDownloadPDF = async () => {
    if (!printContainerRef.current) return;
    setIsExportingPDF(true);
    try {
      await downloadElementAsPDF(printContainerRef.current, {
        filename: `AlphaERP_Payslip_${empCode}_${month}_${year}`,
        documentTitle: `AlphaERP Payslip - ${empName} (${month} ${year})`
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-4 sm:p-6 shadow-2xl my-6 space-y-4 text-xs font-sans print:shadow-none print:border-none print:m-0 print:p-0">
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Salary Certificate</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {empName} ({empCode}) • {month} {year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
              title="Download official PDF to your computer"
            >
              {isExportingPDF ? (
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
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              title="Print directly or save via browser dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Certificate Sheet */}
        <div ref={printContainerRef} className="border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 bg-white">
          {/* Company Branding & Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-700" />
                <h4 className="font-extrabold text-base text-slate-900 tracking-tight">
                  AlphaERP Engineering Pvt Ltd
                </h4>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                HVAC Projects, Cleanroom Contracting & Maintenance Services
              </p>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 space-x-2">
                <span>CIN: U29190MH2019PTC328101</span>
                <span>•</span>
                <span>GSTIN: 27AABCA1234F1Z9</span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-bold font-mono text-xs inline-block">
                Payslip - {month} {year}
              </span>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                Pay Period: {month} {year}
              </div>
            </div>
          </div>

          {/* Employee & Statutory Particulars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
            <div>
              <span className="text-slate-500 block text-[10px]">Employee Name:</span>
              <span className="font-bold text-slate-900">{empName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Employee Code:</span>
              <span className="font-mono font-bold text-indigo-700">{empCode}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Designation:</span>
              <span className="font-semibold text-slate-800">{designation}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Department:</span>
              <span className="font-medium text-slate-700">{department}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Bank Account No:</span>
              <span className="font-mono font-semibold text-slate-800">{bankAcc}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Bank IFSC:</span>
              <span className="font-mono font-semibold text-slate-800">{ifsc}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Income Tax PAN:</span>
              <span className="font-mono font-bold text-slate-900">{pan}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">UAN / PF Number:</span>
              <span className="font-mono text-slate-800">{uan}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Paid Days / Month:</span>
              <span className="font-bold font-mono text-emerald-700">
                {daysPresent} / {totalDays} Days {lopDays > 0 ? `(LOP: ${lopDays})` : ''}
              </span>
            </div>
          </div>

          {/* Earnings & Deductions Dual Ledger */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-100/90 px-3 py-1.5 font-bold text-slate-800 text-[11px] border-b border-slate-200">
                Gross Earnings
              </div>
              <div className="divide-y divide-slate-100 p-2 text-xs space-y-1">
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Basic Salary</span>
                  <span className="font-mono font-semibold">₹{basic.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>House Rent Allowance (HRA)</span>
                  <span className="font-mono font-semibold">₹{hra.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Special Allowance</span>
                  <span className="font-mono font-semibold">₹{special.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Site / Execution Allowance</span>
                  <span className="font-mono font-semibold">₹{site.toLocaleString()}</span>
                </div>
                {overtime > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Overtime & Site Incentives</span>
                    <span className="font-mono font-semibold">₹{overtime.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 font-bold border-t border-slate-200 text-slate-900 pt-2">
                  <span>Gross Earnings</span>
                  <span className="font-mono text-emerald-700">₹{gross.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="bg-slate-100/90 px-3 py-1.5 font-bold text-slate-800 text-[11px] border-b border-slate-200">
                Statutory & Other Deductions
              </div>
              <div className="divide-y divide-slate-100 p-2 text-xs space-y-1">
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Employee PF (12%)</span>
                  <span className="font-mono font-semibold text-rose-600">₹{epf.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-700">
                  <span>Professional Tax (PT)</span>
                  <span className="font-mono font-semibold text-rose-600">₹{pt.toLocaleString()}</span>
                </div>
                {esic > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>ESIC Deduction (0.75%)</span>
                    <span className="font-mono font-semibold text-rose-600">₹{esic.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 text-slate-700">
                  <span>TDS Income Tax Deduction</span>
                  <span className="font-mono font-semibold text-rose-600">₹{tds.toLocaleString()}</span>
                </div>
                {lop > 0 && (
                  <div className="flex justify-between py-1 text-slate-700">
                    <span>Loss of Pay (LOP)</span>
                    <span className="font-mono font-semibold text-rose-600">₹{lop.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 font-bold border-t border-slate-200 text-slate-900 pt-2">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-700">₹{totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Disbursed Card */}
          <div className="p-3.5 bg-emerald-50/90 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Net Salary Payable:</span>
              </div>
              <div className="text-[11px] text-emerald-700">Directly deposited via Bank NEFT</div>
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-800">
              ₹{netPayable.toLocaleString()}
            </div>
          </div>

          {/* Amount in Words */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700">
            <span className="font-bold text-slate-900 mr-1.5">Amount in Words:</span>
            <span className="italic font-medium">{netInWords}</span>
          </div>

          {/* Digital Signature & Verification Seal */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] text-slate-500 gap-2">
            <div className="flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Digitally Authenticated by AlphaERP Automated Payroll System</span>
            </div>
            <div className="font-mono text-slate-400">
              Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Action Buttons (Bottom) */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-slate-600 text-xs"
          >
            Close
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Download Payslip PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
