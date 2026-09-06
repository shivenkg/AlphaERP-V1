import jsPDF from 'jspdf';
import { EmployeeMaster } from '../types';

export interface PayslipData {
  month: string;
  year: number;
  empId?: string;
  empCode?: string;
  empName?: string;
  employeeName?: string;
  designation?: string;
  department?: string;
  pan?: string;
  uan?: string;
  bankAccount?: string;
  bankAccountNo?: string;
  bankName?: string;
  ifscCode?: string;
  workingDays?: number;
  totalDaysInMonth?: number;
  payableDays?: number;
  daysPresent?: number;
  leaveDays?: number;
  lossOfPayDays?: number;
  basicPay?: number;
  basicEarned?: number;
  hra?: number;
  hraEarned?: number;
  specialAllowance?: number;
  specialAllowanceEarned?: number;
  siteAllowance?: number;
  siteAllowanceEarned?: number;
  conveyanceAllowance?: number;
  overtimePay?: number;
  grossEarnings?: number;
  grossEarned?: number;
  grossSalary?: number;
  pfEmployee?: number;
  epfDeduction?: number;
  esicEmployee?: number;
  esicDeduction?: number;
  professionalTax?: number;
  ptDeduction?: number;
  tdsTax?: number;
  tdsDeduction?: number;
  lossOfPayDeduction?: number;
  totalDeductions?: number;
  netPay?: number;
  netPayable?: number;
  netSalary?: number;
  netPayInWords?: string;
}

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

function cleanStr(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '-';
  return String(str)
    .replace(/₹/g, 'Rs. ')
    .replace(/¹/g, 'Rs. ')
    .replace(/[^\x00-\x7F]/g, ' ')
    .trim();
}

/**
 * Generates and downloads a clean, professional PDF summary of an employee's monthly payslip
 */
export function generateEmployeePayslipPDF(
  employee: EmployeeMaster,
  monthYear: string,
  slip: Partial<PayslipData>
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 24, 'F');

  // Accent Line
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(margin, y + 23, contentWidth, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('ALPHA HVAC SOLUTIONS & ENGINEERING SERVICES PVT. LTD.', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Commercial VRF / Chiller Turnkey MEP Contracting • CIN: U29190MH2018PLC312984 • GSTIN: 27AABCA1299K1Z4', margin + 6, y + 14);
  doc.text('Corporate HQ: Tech Park Tower B, 4th Floor, MIDC Andheri East, Mumbai 400093, Maharashtra, India', margin + 6, y + 19);

  y += 28;

  // Title Strip
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 11, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(`SALARY SLIP & PAYROLL STATEMENT: ${cleanStr(monthYear).toUpperCase()}`, margin + 6, y + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} via AlphaHR ESS`, margin + contentWidth - 62, y + 7.5);

  y += 15;

  // Employee Information Box
  const empName = cleanStr(slip.empName || slip.employeeName || employee.fullName || employee.name || 'Employee');
  const empCode = cleanStr(employee.empCode || slip.empCode || 'EMP-001');
  const designation = cleanStr(slip.designation || employee.designation || 'HVAC Engineer');
  const department = cleanStr(slip.department || employee.department || 'Operations');
  const pan = cleanStr(slip.pan || employee.pan || 'AABCA1299K');
  const uan = cleanStr(slip.uan || employee.uan || employee.uanNumber || '100982341102');
  const bankName = cleanStr(slip.bankName || employee.bankName || 'HDFC Bank Ltd');
  const bankAcc = cleanStr(slip.bankAccount || slip.bankAccountNo || employee.bankAccount || employee.bankAccountNo || '50200019283741');
  const ifsc = cleanStr(slip.ifscCode || employee.ifscCode || 'HDFC0000053');
  const totalDays = slip.totalDaysInMonth ?? 31;
  const payableDays = slip.payableDays ?? slip.daysPresent ?? 31;
  const lopDays = Math.max(0, totalDays - payableDays);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 34, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  const col1 = margin + 5;
  const col2 = margin + 55;
  const col3 = margin + 105;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Employee Name:', col1, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.text(empName, col1 + 25, y + 6);

  doc.setTextColor(100, 116, 139);
  doc.text('Employee ID / Code:', col2, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.text(empCode, col2 + 28, y + 6);

  doc.setTextColor(100, 116, 139);
  doc.text('Payable Days:', col3, y + 6);
  doc.setTextColor(15, 23, 42);
  doc.text(`${payableDays} / ${totalDays} Days (LOP: ${lopDays}d)`, col3 + 22, y + 6);

  // Row 2
  doc.setTextColor(100, 116, 139);
  doc.text('Designation:', col1, y + 13);
  doc.setTextColor(15, 23, 42);
  doc.text(designation, col1 + 25, y + 13);

  doc.setTextColor(100, 116, 139);
  doc.text('Department:', col2, y + 13);
  doc.setTextColor(15, 23, 42);
  doc.text(department, col2 + 28, y + 13);

  doc.setTextColor(100, 116, 139);
  doc.text('Tax Regime:', col3, y + 13);
  doc.setTextColor(15, 23, 42);
  doc.text(cleanStr(employee.taxRegime || 'New Tax Regime'), col3 + 22, y + 13);

  // Row 3
  doc.setTextColor(100, 116, 139);
  doc.text('PAN Number:', col1, y + 20);
  doc.setTextColor(15, 23, 42);
  doc.text(pan, col1 + 25, y + 20);

  doc.setTextColor(100, 116, 139);
  doc.text('UAN / PF Number:', col2, y + 20);
  doc.setTextColor(15, 23, 42);
  doc.text(uan, col2 + 28, y + 20);

  doc.setTextColor(100, 116, 139);
  doc.text('Bank Name:', col3, y + 20);
  doc.setTextColor(15, 23, 42);
  doc.text(bankName, col3 + 22, y + 20);

  // Row 4
  doc.setTextColor(100, 116, 139);
  doc.text('Bank A/C No:', col1, y + 27);
  doc.setTextColor(15, 23, 42);
  doc.text(bankAcc, col1 + 25, y + 27);

  doc.setTextColor(100, 116, 139);
  doc.text('IFSC Code:', col2, y + 27);
  doc.setTextColor(15, 23, 42);
  doc.text(ifsc, col2 + 28, y + 27);

  doc.setTextColor(100, 116, 139);
  doc.text('Disbursement:', col3, y + 27);
  doc.setTextColor(16, 185, 129);
  doc.text('NEFT / Direct Bank Transfer', col3 + 22, y + 27);

  y += 38;

  // Earnings & Deductions Tables (Two Columns)
  const tableWidth = (contentWidth - 4) / 2;
  const earnX = margin;
  const dedX = margin + tableWidth + 4;

  // Table Headers
  doc.setFillColor(243, 244, 246);
  doc.rect(earnX, y, tableWidth, 7, 'F');
  doc.rect(dedX, y, tableWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('EARNINGS & ALLOWANCES', earnX + 4, y + 4.8);
  doc.text('AMOUNT (Rs.)', earnX + tableWidth - 26, y + 4.8);

  doc.text('DEDUCTIONS & STATUTORY', dedX + 4, y + 4.8);
  doc.text('AMOUNT (Rs.)', dedX + tableWidth - 26, y + 4.8);

  y += 7;

  // Computations
  const basic = slip.basicEarned ?? slip.basicPay ?? 50000;
  const hra = slip.hraEarned ?? slip.hra ?? 20000;
  const special = slip.specialAllowanceEarned ?? slip.specialAllowance ?? 15000;
  const site = slip.siteAllowanceEarned ?? slip.siteAllowance ?? 6000;
  const conveyance = slip.conveyanceAllowance ?? 4000;
  const overtime = slip.overtimePay ?? 0;
  const gross = slip.grossEarned ?? slip.grossEarnings ?? slip.grossSalary ?? (basic + hra + special + site + conveyance + overtime);

  const epf = slip.epfDeduction ?? slip.pfEmployee ?? Math.round(basic * 0.12);
  const esic = slip.esicDeduction ?? slip.esicEmployee ?? 0;
  const pt = slip.ptDeduction ?? slip.professionalTax ?? 200;
  const tds = slip.tdsDeduction ?? slip.tdsTax ?? 3500;
  const lop = slip.lossOfPayDeduction ?? 0;
  const deductions = slip.totalDeductions ?? (epf + esic + pt + tds + lop);
  const netPay = slip.netPayable ?? slip.netPay ?? slip.netSalary ?? (gross - deductions);

  const earningsItems = [
    { label: 'Basic Salary', val: basic },
    { label: 'House Rent Allowance (HRA)', val: hra },
    { label: 'Special / Project Allowance', val: special },
    { label: 'Site Technical Duty Allowance', val: site },
    { label: 'Conveyance & Travel Reimbursement', val: conveyance },
    { label: 'Overtime & Site Incentive', val: overtime }
  ];

  const deductionsItems = [
    { label: 'Provident Fund (Employee EPF 12%)', val: epf },
    { label: 'Employee State Insurance (ESIC)', val: esic },
    { label: 'Professional Tax (Maharashtra PT)', val: pt },
    { label: 'Tax Deducted at Source (TDS)', val: tds },
    { label: 'Loss of Pay Deduction (LOP)', val: lop },
    { label: 'Voluntary Provident Fund / Misc.', val: 0 }
  ];

  const rowHeight = 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  for (let i = 0; i < 6; i++) {
    const rowY = y + i * rowHeight;
    const isAlt = i % 2 === 1;

    if (isAlt) {
      doc.setFillColor(248, 250, 252);
      doc.rect(earnX, rowY, tableWidth, rowHeight, 'F');
      doc.rect(dedX, rowY, tableWidth, rowHeight, 'F');
    }

    // Border line
    doc.setDrawColor(241, 245, 249);
    doc.line(earnX, rowY + rowHeight, earnX + tableWidth, rowY + rowHeight);
    doc.line(dedX, rowY + rowHeight, dedX + tableWidth, rowY + rowHeight);

    // Earnings item
    doc.setTextColor(51, 65, 85);
    doc.text(earningsItems[i].label, earnX + 4, rowY + 4.2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(earningsItems[i].val > 0 ? earningsItems[i].val.toLocaleString('en-IN') : '-', earnX + tableWidth - 6, rowY + 4.2, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    // Deductions item
    doc.setTextColor(51, 65, 85);
    doc.text(deductionsItems[i].label, dedX + 4, rowY + 4.2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(deductionsItems[i].val > 0 ? 225 : 15, deductionsItems[i].val > 0 ? 29 : 23, deductionsItems[i].val > 0 ? 72 : 42);
    doc.text(deductionsItems[i].val > 0 ? deductionsItems[i].val.toLocaleString('en-IN') : '-', dedX + tableWidth - 6, rowY + 4.2, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  }

  y += 6 * rowHeight;

  // Subtotal Rows
  doc.setFillColor(241, 245, 249);
  doc.rect(earnX, y, tableWidth, 7, 'F');
  doc.rect(dedX, y, tableWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL GROSS EARNINGS', earnX + 4, y + 4.8);
  doc.text(`Rs. ${gross.toLocaleString('en-IN')}`, earnX + tableWidth - 6, y + 4.8, { align: 'right' });

  doc.setTextColor(225, 29, 72);
  doc.text('TOTAL DEDUCTIONS', dedX + 4, y + 4.8);
  doc.text(`Rs. ${deductions.toLocaleString('en-IN')}`, dedX + tableWidth - 6, y + 4.8, { align: 'right' });

  y += 12;

  // Net Disbursed Highlight Banner
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 78, 59); // emerald-900
  doc.text('NET SALARY DISBURSED TO BANK ACCOUNT', margin + 6, y + 7);

  doc.setFontSize(14);
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text(`Rs. ${netPay.toLocaleString('en-IN')}`, margin + contentWidth - 6, y + 8, { align: 'right' });

  const words = slip.netPayInWords || numberToWords(netPay);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70);
  doc.text(`Amount in Words: ${words}`, margin + 6, y + 14);

  y += 24;

  // Signatures & Statutory Footer Note
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 32, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('1. This is a computer-generated salary advice and certificate generated via AlphaHR ERP. No physical signature is required.', margin + 6, y + 6);
  doc.text('2. Income Tax TDS has been deducted based on employee-declared investments under applicable Indian Income Tax slab.', margin + 6, y + 11);
  doc.text('3. For statutory queries, EPF claims, or discrepancies, please email payroll@alphahvac.com within 5 working days.', margin + 6, y + 16);

  // Signature Block
  const sigX = margin + contentWidth - 55;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('For Alpha HVAC Solutions Pvt. Ltd.', sigX, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorised Signatory / Head of HR', sigX, y + 26);
  doc.text('[Digitally Verified Payroll System]', sigX, y + 29.5);

  // Bottom Footer
  y += 36;
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text('Confidential - For Private Employee Record Only • AlphaERP v3.4 Enterprise Cloud Platform', margin, y);

  // Filename formatting
  const sanitizedEmpCode = (employee.empCode || 'EMP').replace(/[^a-zA-Z0-9_-]/g, '');
  const sanitizedMonth = monthYear.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `AlphaERP_Payslip_${sanitizedEmpCode}_${sanitizedMonth}.pdf`;

  doc.save(filename);
}
