import React, { useState, useRef } from 'react';
import {
  FileText,
  Printer,
  X,
  Building,
  Building2,
  CheckCircle2,
  Calendar,
  CreditCard,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  Landmark,
  Download,
  Loader2
} from 'lucide-react';
import { Project, PaymentRecord } from '../types';
import { downloadElementAsPDF, triggerDirectPrint } from '../utils/pdfExportHelper';
import { storageService } from '../services/storageService';
import { DocumentHeader } from './common/DocumentHeader';
import { DocumentFooter } from './common/DocumentFooter';

interface ProjectCompletionBillModalProps {
  project: Project;
  payments?: PaymentRecord[];
  onClose: () => void;
}

export const ProjectCompletionBillModal: React.FC<ProjectCompletionBillModalProps> = ({
  project,
  payments = [],
  onClose
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const billPrintRef = useRef<HTMLDivElement>(null);

  const settings = storageService.getSystemSettings();
  const projectPayments = payments.filter((p) => p.projectId === project.id && !p.isPayable);
  
  const contractValue = project.contractValue;
  const advanceAmount = contractValue * 0.30;
  const dispatchAmount = contractValue * 0.40;
  const erectionAmount = contractValue * 0.20;
  const handoverAmount = contractValue * 0.10;

  const totalCollected = project.paymentsReceivedAmount || projectPayments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.totalAmount, 0);
  const remainingBalance = Math.max(0, contractValue - totalCollected);

  const gstRate = (settings.defaultGstRate || 18) / 100;
  const baseTaxableAmount = contractValue / (1 + gstRate);
  const gstAmount = contractValue - baseTaxableAmount;
  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  const invoiceNumber = `INV-FINAL-${project.projectNumber.replace(/[^0-9]/g, '') || '2026'}`;
  const currentDate = new Date().toISOString().split('T')[0];

  const handleDownloadPDF = async () => {
    if (!billPrintRef.current) return;
    setIsExportingPDF(true);
    try {
      await downloadElementAsPDF(billPrintRef.current, {
        filename: `AlphaERP_FinalCompletionBill_${invoiceNumber}`,
        documentTitle: `AlphaERP Final Completion Bill - ${invoiceNumber}`
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrint = () => {
    triggerDirectPrint(billPrintRef.current, `AlphaERP_FinalCompletionBill_${invoiceNumber}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print-container">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-6 flex flex-col print-document">
        
        {/* Top Controls Bar (Hidden in Print) */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-3 sticky top-0 bg-white/95 backdrop-blur-sm z-10 no-print">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  Final Project Completion Bill & Handover Tax Invoice
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  {project.status === 'Handover & Closed' ? '100% Completed' : 'Handover Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                Ref: {project.projectNumber} • {project.projectName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              title="Generate and Download Final Completion Invoice PDF"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              title="Print directly"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice & Completion Bill Document */}
        <div ref={billPrintRef} className="p-5 sm:p-8 space-y-6 font-sans text-xs text-slate-800 bg-white">
          
          {/* Dynamic Corporate Header */}
          {(() => {
            const invoiceTemplate = storageService.getReportTemplate('invoice');
            return (
              <DocumentHeader
                headerConfig={invoiceTemplate.header}
                stylingConfig={invoiceTemplate.styling}
                settings={settings}
                documentNumber={invoiceNumber}
                documentDate={currentDate}
                projectRef={project.projectNumber}
                statusBadge={{
                  text: 'Status: Handover Bill (Final)',
                  colorClass: 'bg-emerald-100 text-emerald-800'
                }}
              />
            );
          })()}

          {/* Standardized Structured Report Detail Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 text-xs shadow-xs relative overflow-hidden border-t-3 border-t-blue-600">
            {/* Column 1: Client & Project Site Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Billed To (Client & Project Entity):</span>
              </div>
              <div>
                <div className="font-black text-slate-900 text-sm tracking-tight">{project.clientName}</div>
                <div className="text-slate-600 text-[11px] font-medium mt-0.5">
                  Project: <strong className="text-slate-800 font-semibold">{project.projectName}</strong>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{project.siteAddress || 'Commercial Project Site Address, Mumbai'}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Contractual Handover & PM Sign-off */}
            <div className="space-y-2 md:border-l md:border-slate-200 md:pl-4">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contract & Handover Certification:</span>
              </div>
              <div>
                <div className="font-black text-slate-900 text-sm tracking-tight">PM: {project.projectManager}</div>
                <div className="text-slate-600 text-[11px] font-medium mt-0.5">
                  Total Value: <strong className="text-slate-900 font-mono font-bold">₹{contractValue.toLocaleString()}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Handover Date</span>
                  <span className="font-semibold text-slate-900 font-mono">{project.actualCompletionDate || project.targetCompletionDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Testing & Balancing</span>
                  <span className="font-semibold text-emerald-700">100% Certified</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Stage Milestone Billing Reconciliation Table */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Milestone Billing & Payment Reconciliation Schedule</span>
              <span className="text-slate-500 font-mono text-[11px]">SAC Code: 995461</span>
            </div>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Milestone Description</th>
                    <th className="p-2.5 text-center">Share</th>
                    <th className="p-2.5 text-right">Amount (₹)</th>
                    <th className="p-2.5 text-center">Billing Stage</th>
                    <th className="p-2.5 text-center">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {/* Milestone 1 */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">Milestone 1: Project Mobilization & Engineering</div>
                      <div className="text-[10px] text-slate-500">Shop drawings, heat load validation & consultant approval</div>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold">30%</td>
                    <td className="p-2.5 text-right font-mono font-bold">₹{advanceAmount.toLocaleString()}</td>
                    <td className="p-2.5 text-center text-[10px] text-slate-500">Contract Inception</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Paid / Settled
                      </span>
                    </td>
                  </tr>

                  {/* Milestone 2 */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">Milestone 2: Major HVAC Equipment Dispatch</div>
                      <div className="text-[10px] text-slate-500">VRF Outdoor Units, Chiller delivery & indoor equipment arrival</div>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold">40%</td>
                    <td className="p-2.5 text-right font-mono font-bold">₹{dispatchAmount.toLocaleString()}</td>
                    <td className="p-2.5 text-center text-[10px] text-slate-500">Material Inward</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Paid / Settled
                      </span>
                    </td>
                  </tr>

                  {/* Milestone 3 */}
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">Milestone 3: Piping, Ducting & Erection Progress</div>
                      <div className="text-[10px] text-slate-500">Refrigerant piping, GI ducting, acoustic lining & electrical cabling</div>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold">20%</td>
                    <td className="p-2.5 text-right font-mono font-bold">₹{erectionAmount.toLocaleString()}</td>
                    <td className="p-2.5 text-center text-[10px] text-slate-500">Installation Done</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Paid / Settled
                      </span>
                    </td>
                  </tr>

                  {/* Milestone 4 */}
                  <tr className="hover:bg-slate-50 bg-emerald-50/40">
                    <td className="p-2.5">
                      <div className="font-bold text-emerald-900">Milestone 4: Testing, Commissioning & Handover</div>
                      <div className="text-[10px] text-slate-600">Air balancing, pressure certification, VRF commissioning & client sign-off</div>
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold text-emerald-700">10%</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-700">₹{handoverAmount.toLocaleString()}</td>
                    <td className="p-2.5 text-center text-[10px] text-emerald-700 font-semibold">Final Handover</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {remainingBalance <= 0 ? 'Settled' : 'Current Due'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax & Financial Settlement Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bank Remittance Details */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-blue-600" />
                Electronic Fund Remittance Instructions
              </div>
              <div className="space-y-1 text-slate-700 text-[11px]">
                <div>Beneficiary: <strong>{settings.bankBeneficiaryName || settings.companyName}</strong></div>
                <div>Bank Name: <strong>{settings.bankName} {settings.bankBranch ? `(${settings.bankBranch})` : ''}</strong></div>
                <div>Account Number: <strong className="font-mono">{settings.bankAccountNumber}</strong> (Current A/c)</div>
                <div>IFSC Code: <strong className="font-mono">{settings.bankIfscCode}</strong></div>
                {settings.upiVpaId && <div>UPI VPA: <strong className="font-mono text-indigo-700">{settings.upiVpaId}</strong></div>}
                <div className="text-slate-500 text-[10px] pt-1">
                  Please quote Invoice #{invoiceNumber} on your NEFT / RTGS remittance voucher.
                </div>
              </div>
            </div>

            {/* Total Accounting Box */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Contract Turnkey Value:</span>
                <span className="font-mono font-bold text-slate-900">{settings.currencySymbol}{contractValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Includes CGST ({(settings.defaultGstRate || 18) / 2}%):</span>
                <span className="font-mono text-slate-700">{settings.currencySymbol}{cgst.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Includes SGST ({(settings.defaultGstRate || 18) / 2}%):</span>
                <span className="font-mono text-slate-700">{settings.currencySymbol}{sgst.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                <span>Cumulative Collections to Date:</span>
                <span className="font-mono">{settings.currencySymbol}{totalCollected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-300">
                <span>Final Handover Amount Due:</span>
                <span className="font-mono text-emerald-600">{settings.currencySymbol}{remainingBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Corporate Footer */}
          {(() => {
            const invoiceTemplate = storageService.getReportTemplate('invoice');
            return (
              <DocumentFooter
                footerConfig={invoiceTemplate.footer}
                stylingConfig={invoiceTemplate.styling}
                settings={settings}
                clientOrVendorName={project.clientName}
                primarySignatoryOverride="Accounts & Billing Controller"
                secondarySignatoryOverride="Client Representative Sign-Off"
                pageNumber={1}
                totalPages={1}
              />
            );
          })()}

        </div>

        {/* Bottom Actions (Hidden in Print) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
          >
            Close
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF Bill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
