import React, { useRef, useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Loader2,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  User,
  Zap,
  Mail,
  MessageSquare,
  X,
  Share2,
  TrendingUp,
  Percent,
  Receipt
} from 'lucide-react';
import { Project, BOQItem, SystemSettings } from '../types';
import { storageService } from '../services/storageService';
import { downloadElementAsPDF, triggerDirectPrint } from '../utils/pdfExportHelper';
import { JSAlphaSoftLogo } from './JSAlphaSoftLogo';
import { DocumentHeader } from './common/DocumentHeader';
import { DocumentFooter } from './common/DocumentFooter';

interface ProjectSummaryPdfModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onGeneratePR?: (itemIds?: string[]) => void;
}

export function numberToWords(num: number): string {
  const a = [
    '',
    'One ',
    'Two ',
    'Three ',
    'Four ',
    'Five ',
    'Six ',
    'Seven ',
    'Eight ',
    'Nine ',
    'Ten ',
    'Eleven ',
    'Twelve ',
    'Thirteen ',
    'Fourteen ',
    'Fifteen ',
    'Sixteen ',
    'Seventeen ',
    'Eighteen ',
    'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';

  function inWords(val: number): string {
    let str = '';
    if (val > 9999999) {
      str += inWords(Math.floor(val / 10000000)) + 'Crore ';
      val %= 10000000;
    }
    if (val > 99999) {
      str += inWords(Math.floor(val / 100000)) + 'Lakh ';
      val %= 100000;
    }
    if (val > 999) {
      str += inWords(Math.floor(val / 1000)) + 'Thousand ';
      val %= 1000;
    }
    if (val > 99) {
      str += inWords(Math.floor(val / 100)) + 'Hundred ';
      val %= 100;
    }
    if (val > 0) {
      if (str !== '') str += 'and ';
      if (val < 20) str += a[val];
      else {
        str += b[Math.floor(val / 10)];
        if (val % 10 > 0) str += ' ' + a[val % 10];
      }
    }
    return str;
  }

  return 'Rupees ' + inWords(n).trim() + ' Only';
}

export const ProjectSummaryPdfModal: React.FC<ProjectSummaryPdfModalProps> = ({
  project,
  isOpen,
  onClose,
  onGeneratePR
}) => {
  const printDocRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [includeMarginAnalytics, setIncludeMarginAnalytics] = useState(false);
  const [includeSignatures, setIncludeSignatures] = useState(true);

  if (!isOpen || !project) return null;

  const settings: SystemSettings = storageService.getSystemSettings();

  // Calculated project totals
  const totalBoqAmount = project.boqItems.reduce(
    (acc, item) => acc + (item.totalCost || item.requiredQty * item.unitCost || 0),
    0
  );
  const contractVal = project.contractValue || totalBoqAmount * 1.25;
  const estimatedProfit = contractVal - totalBoqAmount;
  const marginPct = contractVal > 0 ? (estimatedProfit / contractVal) * 100 : 0;

  const isCompleted = project.status === 'Handover & Closed' || (project.progressPct ?? 0) >= 100;

  // 1. Download PDF Action
  const handleDownloadPDF = async () => {
    if (!printDocRef.current) return;
    try {
      setIsExportingPDF(true);
      await downloadElementAsPDF(printDocRef.current, {
        filename: `AlphaERP_Project_Summary_${project.projectNumber}`,
        documentTitle: `AlphaERP Project Executive Summary - ${project.projectName} (${project.projectNumber})`,
        orientation: 'portrait',
        marginMm: 8,
        scale: 2
      });
    } catch (err) {
      console.error('Failed to export Project Summary PDF:', err);
      alert('Error generating PDF. Please try printing to PDF as fallback.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // 2. Direct Print Action
  const handlePrint = () => {
    if (!printDocRef.current) return;
    triggerDirectPrint(
      printDocRef.current,
      `AlphaERP - Project Summary - ${project.projectNumber}`
    );
  };

  // 3. Share via WhatsApp
  const handleShareWhatsApp = () => {
    const text = `*ALPHA HVAC SOLUTIONS — PROJECT EXECUTIVE SUMMARY*
Project: *${project.projectName}* (${project.projectNumber})
Client: ${project.clientName}
Contract Value: Rs. ${(project.contractValue / 100000).toFixed(2)} Lakhs
Status: ${project.status} (${project.progressPct}% Complete)
${project.isDelayed ? `⚠️ Schedule: ${project.delayDays}d Delayed (${project.delayReason})` : '✅ Schedule: On Track'}
Site Location: ${project.siteAddress}
Target Handover: ${project.targetCompletionDate}

_Generated via AlphaERP Enterprise Suite_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // 4. Share via Email
  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Project Executive Summary: ${project.projectName} (${project.projectNumber})`);
    const body = encodeURIComponent(`Dear Client,

Please find the executive project summary and milestone execution schedule for ${project.projectName} (${project.projectNumber}).

Project Overview:
- Client Name: ${project.clientName}
- Site Location: ${project.siteAddress}
- Contract Value: Rs. ${project.contractValue.toLocaleString('en-IN')}
- Current Phase: ${project.status} (${project.progressPct}% Complete)
- Target Completion Date: ${project.targetCompletionDate}
- Project Manager: ${project.projectManager}

Please review the attached specifications and commercial milestones.

Sincerely,
Alpha HVAC Solutions & Engineering Services Ltd
Authorized Project PMO`);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 flex flex-col max-h-[94vh] overflow-hidden my-auto">
        {/* Top Floating Action Toolbar (Excluded from Print/PDF) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-500/50 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Client Project Summary PDF</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {project.projectNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                A4 Print-Ready Document formatted for client handover, consultants, and management sharing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Options */}
            <label className="flex items-center gap-1.5 text-xs text-slate-300 mr-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>Signatures & Seal</span>
            </label>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share brief project status via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleShareEmail}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share via Email"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Email</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isExportingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPDF ? 'Exporting PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Canvas */}
        <div className="overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/80">
          <div
            ref={printDocRef}
            id="client-project-summary-pdf"
            className="print-document bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10 rounded-xl shadow-xl border border-slate-300 flex flex-col justify-between"
            style={{ boxSizing: 'border-box' }}
          >
            {/* 1. Official Corporate Header */}
            <div>
              <div className="border-b-2 border-slate-900 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <JSAlphaSoftLogo className="w-12 h-12" />
                    <div>
                      <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                        ALPHA HVAC SOLUTIONS & ENGINEERING SERVICES LTD
                      </h1>
                      <p className="text-[10px] text-slate-600 font-medium">
                        Licensed HVAC Class-1 Engineering Contractor & VRF Turnkey Integrator • ISO 9001:2015 Certified
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        HQ: Tech Park Tower B, 4th Floor, MIDC Andheri East, Mumbai 400093 • GSTIN: 27AABCA1299K1Z4 • PAN: AABCA1299K
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-black tracking-wider uppercase">
                      PROJECT SUMMARY
                    </div>
                    <div className="font-mono text-xs font-bold text-slate-900 mt-1">
                      {project.projectNumber}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Banner */}
              <div className="mt-3.5 bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Techno-Commercial Project Executive Summary & BOQ Scope
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Milestone Progress, Equipment Verification, Schedule Compliance & Billing Ledger
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {project.status} ({project.progressPct}%)
                  </span>
                  {project.isDelayed && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      {project.delayDays}d Delayed
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Client & Project Metadata Grid */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                {/* Client / Counterparty Panel */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-600" />
                    <span>Client Master Information</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{project.clientName}</div>
                  <div className="text-slate-600 mt-1 flex items-start gap-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                    <span>{project.siteAddress || 'Site Address: As per Contract Schedule'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    GSTIN: 27AABCA1299K1Z4 • Attention: Commercial PMO
                  </div>
                </div>

                {/* Project Execution Panel */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span>Project Execution & PMO</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{project.projectName}</div>
                  <div className="grid grid-cols-2 gap-2 mt-1 text-[11px] text-slate-700">
                    <div>
                      <span className="text-slate-500">Project Manager:</span>{' '}
                      <strong>{project.projectManager || 'Er. Shivender K.'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Commencement:</span>{' '}
                      <strong>{project.startDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Target Handover:</span>{' '}
                      <strong>{project.targetCompletionDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Contract Value:</span>{' '}
                      <strong className="text-emerald-700 font-mono">
                        ₹{(project.contractValue / 100000).toFixed(2)} L
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Executive KPI Metric Summary Cards */}
              <div className="mt-4 grid grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="block text-[9px] uppercase font-bold text-slate-500">Total Contract Value</span>
                  <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                    ₹{project.contractValue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60">
                  <span className="block text-[9px] uppercase font-bold text-emerald-800">Physical Progress</span>
                  <span className="font-mono font-bold text-emerald-900 text-xs sm:text-sm">
                    {project.progressPct}% Complete
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60">
                  <span className="block text-[9px] uppercase font-bold text-blue-800">BOQ Equipment Lines</span>
                  <span className="font-mono font-bold text-blue-900 text-xs sm:text-sm">
                    {project.boqItems.length} Line Items
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="block text-[9px] uppercase font-bold text-slate-500">Schedule Status</span>
                  <span
                    className={`font-mono font-bold text-xs sm:text-sm ${
                      project.isDelayed ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {project.isDelayed ? `${project.delayDays}d Delayed` : 'On Schedule'}
                  </span>
                </div>
              </div>

              {/* Delay & Root Cause Note if project is delayed */}
              {project.isDelayed && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Schedule Variance Notice: {project.delayDays || 0} Days Behind Baseline</span>
                  </div>
                  <div className="mt-1 text-[11px] text-rose-900">
                    <strong>Root Cause Category:</strong> {project.delayCategory || 'Client Site Clearance'} •{' '}
                    <strong>Reason:</strong> {project.delayReason || 'Reason pending documentation'}
                  </div>
                  {project.delayMitigationPlan && (
                    <div className="mt-0.5 text-[11px] text-emerald-900">
                      <strong>PM Mitigation Plan:</strong> {project.delayMitigationPlan}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Structured BOQ Equipment & Piping Matrix */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Equipment & Bill of Quantities (BOQ) Specification
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    Currency: INR (₹) • Taxes as per applicable GST slabs
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-2 px-2.5 w-8 text-center">#</th>
                        <th className="py-2 px-2.5 w-24">Category</th>
                        <th className="py-2 px-2.5 w-24">Item SKU</th>
                        <th className="py-2 px-2.5">Description & Technical Spec</th>
                        <th className="py-2 px-2 text-center w-14">Qty</th>
                        <th className="py-2 px-2 text-center w-12">Unit</th>
                        <th className="py-2 px-2.5 text-right w-20">Rate (₹)</th>
                        <th className="py-2 px-2.5 text-right w-24">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      {project.boqItems.map((item, idx) => {
                        const lineTotal = item.totalCost || item.requiredQty * item.unitCost || 0;
                        return (
                          <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="py-1.5 px-2.5 text-center font-mono text-slate-400 font-bold">
                              {idx + 1}
                            </td>
                            <td className="py-1.5 px-2.5 font-semibold text-slate-700 text-[10px]">
                              {item.category}
                            </td>
                            <td className="py-1.5 px-2.5 font-mono text-[10px] text-blue-700 font-bold">
                              {item.sku}
                            </td>
                            <td className="py-1.5 px-2.5 text-slate-800 font-medium leading-tight">
                              {item.description}
                            </td>
                            <td className="py-1.5 px-2 text-center font-bold text-slate-900">
                              {item.requiredQty}
                            </td>
                            <td className="py-1.5 px-2 text-center text-slate-500 text-[10px]">
                              {item.unit}
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-mono text-slate-700">
                              {item.unitCost.toLocaleString('en-IN')}
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900">
                              {lineTotal.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-xs">
                        <td colSpan={6} className="py-2 px-3 text-right uppercase text-slate-700">
                          Total BOQ Equipment & Execution Estimate:
                        </td>
                        <td className="py-2 px-2.5 text-right text-slate-500 font-normal text-[10px]">
                          Net Cost
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono text-slate-900 font-bold">
                          ₹{totalBoqAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* 5. Standard Payment Milestones & Commercial Terms */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-[11px]">
                {/* Milestone Schedule */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="text-[10px] uppercase font-bold text-slate-700 tracking-wider mb-1.5">
                    Standard Commercial Milestone Schedule
                  </div>
                  <div className="space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>1. Mobilization Advance (on PO Signoff):</span>
                      <strong className="text-slate-900 font-mono">20%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>2. Equipment & VRF Delivery at Site:</span>
                      <strong className="text-slate-900 font-mono">50%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>3. Piping, Ducting & Installation Completion:</span>
                      <strong className="text-slate-900 font-mono">20%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>4. Testing, Commissioning & Handover:</span>
                      <strong className="text-slate-900 font-mono">10%</strong>
                    </div>
                  </div>
                </div>

                {/* Terms and Quality Guarantee */}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="text-[10px] uppercase font-bold text-slate-700 tracking-wider mb-1.5">
                    Warranty & Compliance Terms
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[10px]">
                    <li>OEM Warranty: 5 Years on Compressors, 1 Year comprehensive VRF parts.</li>
                    <li>Installation certified under ASHRAE / ISHRAE compliance guidelines.</li>
                    <li>Site testing includes nitrogen pressure hold (450 PSI for 24 hours).</li>
                    <li>Final Handover certificate issued upon satisfactory commissioning.</li>
                  </ul>
                </div>
              </div>

              {/* Amount in words */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-600 uppercase text-[10px]">Total Contract Value in Words: </span>
                  <span className="font-semibold text-slate-900">{numberToWords(contractVal)}</span>
                </div>
                <div className="font-mono font-bold text-emerald-800 text-xs">
                  ₹{contractVal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* 6. Signatures & Official Stamp Footer */}
            {includeSignatures && (
              <div className="mt-8 pt-6 border-t-2 border-slate-300">
                <div className="grid grid-cols-2 gap-8 text-xs">
                  {/* Client Acceptance */}
                  <div className="text-center">
                    <div className="h-16 flex items-end justify-center pb-2">
                      <span className="text-[11px] text-slate-400 italic">Client Signature & Official Seal</span>
                    </div>
                    <div className="border-t border-slate-400 pt-1.5">
                      <div className="font-bold text-slate-900 uppercase tracking-wide">
                        For {project.clientName}
                      </div>
                      <div className="text-[10px] text-slate-500">Authorized Client Signatory / Project Director</div>
                    </div>
                  </div>

                  {/* Contractor Authorized Signatory */}
                  <div className="text-center">
                    <div className="h-16 flex items-end justify-center pb-2">
                      <div className="inline-block px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold">
                        Digitally Signed & Validated • AlphaERP PMO
                      </div>
                    </div>
                    <div className="border-t border-slate-400 pt-1.5">
                      <div className="font-bold text-slate-900 uppercase tracking-wide">
                        ALPHA HVAC SOLUTIONS & ENGINEERING SERVICES LTD
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Authorized Signatory • Head of Engineering & Projects
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400 flex items-center justify-between">
                  <span>Document Ref: ALPHA-PROJ-{project.projectNumber}</span>
                  <span>Confidential • Prepared exclusively for {project.clientName}</span>
                  <span>Generated via AlphaERP Cloud v3.4</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
