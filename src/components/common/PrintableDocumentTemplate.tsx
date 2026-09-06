import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Loader2,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Landmark,
  ShieldCheck,
  MapPin,
  Sparkles,
  Receipt,
  MessageSquare,
  Mail,
  X,
  Phone,
  Tag,
  Hash
} from 'lucide-react';
import { Quote, PaymentRecord, Lead, SystemSettings, ReportTemplateConfig } from '../../types';
import { storageService } from '../../services/storageService';
import { downloadElementAsPDF, triggerDirectPrint } from '../../utils/pdfExportHelper';
import { DocumentHeader } from './DocumentHeader';
import { DocumentFooter } from './DocumentFooter';

// Convert numbers to Indian Rupees in words
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

export interface PrintableLineItem {
  id?: string;
  srNo?: number;
  description: string;
  category?: string;
  skuOrSac?: string;
  qty: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface NormalizedDocumentData {
  documentType: 'quote' | 'invoice' | 'commercial';
  documentNumber: string;
  documentTitle: string;
  documentSubtitle?: string;
  date: string;
  dueDateOrValidity?: string;
  statusText: string;
  statusColorClass?: string;
  watermarkText?: string | null;

  // Party Details
  clientOrParty: {
    name: string;
    attention?: string;
    address?: string;
    gstin?: string;
    pan?: string;
    stateCode?: string;
    phone?: string;
    email?: string;
  };

  // Project & Scope Details
  project: {
    name: string;
    codeOrRef?: string;
    location?: string;
    billingMilestone?: string;
    milestonePercentage?: number;
    paymentMethod?: string;
    sacCode?: string;
  };

  // Line Items
  items: PrintableLineItem[];

  // Financial Breakdown
  financials: {
    subtotal: number;
    discountPct?: number;
    discountAmount?: number;
    taxableAmount: number;
    gstRatePct: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount?: number;
    taxAmount: number;
    grandTotal: number;
    amountInWords?: string;
  };

  // Commercial Terms & Signatures
  terms?: string[];
  notes?: string;
  signatoryOverride?: string;
  clientSignatoryOverride?: string;
  signedAtDate?: string;
}

export interface PrintableDocumentTemplateRef {
  print: () => void;
  exportPDF: (customFilename?: string) => Promise<boolean>;
  getElement: () => HTMLDivElement | null;
}

export interface PrintableDocumentTemplateProps {
  // Input 1: Direct Quote
  quote?: Quote | null;
  lead?: Lead | null;

  // Input 2: Direct Invoice
  invoice?: PaymentRecord | null;

  // Input 3: Generic Normalized Document Data
  documentData?: NormalizedDocumentData;

  // Visual Customizations
  settings?: SystemSettings;
  templateConfig?: ReportTemplateConfig;
  className?: string;
  showWatermark?: boolean;

  // Actions & Toolbar Controls
  showToolbar?: boolean;
  onClose?: () => void;
  onAwardQuote?: (quote: Quote) => void;
  onRecordPayment?: (invoice: PaymentRecord) => void;
  onShareWhatsApp?: () => void;
  onShareEmail?: () => void;
  extraActions?: React.ReactNode;
}

export const PrintableDocumentTemplate = forwardRef<PrintableDocumentTemplateRef, PrintableDocumentTemplateProps>(
  (
    {
      quote,
      lead,
      invoice,
      documentData,
      settings: propSettings,
      templateConfig: propTemplateConfig,
      className = '',
      showWatermark = true,
      showToolbar = true,
      onClose,
      onAwardQuote,
      onRecordPayment,
      onShareWhatsApp,
      onShareEmail,
      extraActions
    },
    ref
  ) => {
    const internalDocRef = useRef<HTMLDivElement>(null);
    const [isExportingPDF, setIsExportingPDF] = useState(false);

    // Fetch system settings & report templates
    const systemSettings = propSettings || storageService.getSystemSettings();

    // 1. Normalize Document Data across Quotes, Invoices, and Custom Payloads
    const doc: NormalizedDocumentData = React.useMemo(() => {
      if (documentData) {
        return documentData;
      }

      // Case A: Quote
      if (quote) {
        const taxable = quote.subtotal - (quote.discountAmount || 0);
        const gstRate = 18;
        const cgst = Math.round(quote.taxAmount / 2);
        const sgst = quote.taxAmount - cgst;
        const isAwarded = quote.status === 'Awarded';

        return {
          documentType: 'quote',
          documentNumber: quote.quoteNumber,
          documentTitle: 'TECHNO-COMMERCIAL QUOTATION & BOQ SCHEDULE',
          documentSubtitle: 'Comprehensive HVAC Engineering, VRF Air Conditioning & Turnkey Execution Proposal',
          date: quote.date,
          dueDateOrValidity: quote.validUntil || '30 Days from issuance',
          statusText: quote.status.toUpperCase(),
          statusColorClass: isAwarded
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
            : quote.status === 'Draft'
            ? 'bg-slate-100 text-slate-800 border-slate-300'
            : 'bg-blue-100 text-blue-800 border-blue-300',
          watermarkText: isAwarded ? 'AWARDED & APPROVED' : null,
          clientOrParty: {
            name: quote.companyName || quote.clientName,
            attention: quote.clientName,
            address: lead?.siteAddress || 'Tech Park Campus, MIDC Andheri East, Mumbai 400093',
            gstin: '27AABCA9911D1Z2',
            pan: 'AABCA9911D',
            stateCode: '27 (Maharashtra)',
            phone: lead?.phone || '+91 98201 55678',
            email: lead?.email || 'contact@clientcompany.com'
          },
          project: {
            name: quote.projectTitle || `${quote.companyName} HVAC Installation`,
            codeOrRef: quote.leadId || 'PRJ-HVAC-2026',
            location: lead?.location || 'Mumbai, MH',
            billingMilestone: 'Turnkey Contract Execution',
            paymentMethod: 'Bank Wire / RTGS / NEFT',
            sacCode: '995461'
          },
          items: quote.items.map((item, idx) => ({
            id: item.id,
            srNo: idx + 1,
            description: item.description,
            category: item.category,
            skuOrSac: item.itemSku || '995461',
            qty: item.qty,
            unit: item.unit,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            notes: item.notes
          })),
          financials: {
            subtotal: quote.subtotal,
            discountPct: quote.discountPct,
            discountAmount: quote.discountAmount,
            taxableAmount: taxable,
            gstRatePct: gstRate,
            cgstAmount: cgst,
            sgstAmount: sgst,
            taxAmount: quote.taxAmount,
            grandTotal: quote.totalAmount,
            amountInWords: numberToWords(quote.totalAmount)
          },
          terms: quote.termsAndConditions || [
            'Validity: Quotation remains valid for 30 calendar days from the date of issue.',
            'Payment Terms: 30% Advance along with formal Work Order, 50% on equipment delivery to site, 20% on testing & commissioning.',
            'Warranty: 12 Months comprehensive warranty on installation & 5 years OEM compressor warranty.',
            'Taxes: GST @ 18% as applicable under Indian GST Works Contract Act.'
          ],
          notes: quote.notes,
          signatoryOverride: quote.preparedBy || 'Senior HVAC Sales Engineer'
        };
      }

      // Case B: Invoice / Payment Record
      if (invoice) {
        const isPaid = invoice.status === 'Paid';
        const isReceivable = !invoice.isPayable;
        const gstRate = 18;
        const taxable = Math.round(invoice.totalAmount / (1 + gstRate / 100));
        const gstAmount = invoice.totalAmount - taxable;
        const cgst = Math.round(gstAmount / 2);
        const sgst = gstAmount - cgst;

        return {
          documentType: 'invoice',
          documentNumber: invoice.invoiceNumber,
          documentTitle: isReceivable ? 'COMMERCIAL TAX INVOICE' : 'VENDOR PAYMENT VOUCHER',
          documentSubtitle: `${invoice.projectName} • ${invoice.milestoneTitle} (${invoice.milestonePercentage}% Milestone)`,
          date: invoice.dueDate,
          dueDateOrValidity: isPaid ? (invoice.paidDate || invoice.dueDate) : invoice.dueDate,
          statusText: isPaid ? 'PAID & SETTLED' : invoice.status.toUpperCase(),
          statusColorClass: isPaid
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
            : invoice.status === 'Overdue'
            ? 'bg-rose-100 text-rose-800 border-rose-300'
            : 'bg-amber-100 text-amber-800 border-amber-300',
          watermarkText: isPaid ? 'PAID & SETTLED' : null,
          clientOrParty: {
            name: invoice.clientOrVendorName,
            attention: 'Commercial Accounts & Projects Division',
            address: 'Industrial Estate, Andheri-Kurla Road, Mumbai, Maharashtra 400093',
            gstin: '27AABCA9911D1Z2',
            pan: 'AABCA9911D',
            stateCode: '27 (Maharashtra)'
          },
          project: {
            name: invoice.projectName,
            codeOrRef: invoice.projectId,
            billingMilestone: invoice.milestoneTitle,
            milestonePercentage: invoice.milestonePercentage,
            paymentMethod: invoice.paymentMethod || 'Bank NEFT / RTGS',
            sacCode: '995461'
          },
          items: [
            {
              id: invoice.id,
              srNo: 1,
              description: `${invoice.milestoneTitle} - Turnkey HVAC Installation & Air Balancing`,
              category: 'Milestone Work',
              skuOrSac: '995461',
              qty: 1,
              unit: 'Lot',
              unitPrice: taxable,
              totalPrice: taxable,
              notes: 'Progress milestone certification per approved Schedule of Values (SOV).'
            }
          ],
          financials: {
            subtotal: taxable,
            taxableAmount: taxable,
            gstRatePct: gstRate,
            cgstAmount: cgst,
            sgstAmount: sgst,
            taxAmount: gstAmount,
            grandTotal: invoice.totalAmount,
            amountInWords: numberToWords(invoice.totalAmount)
          },
          terms: [
            'Payment strictly due within 15 days of invoice date via RTGS / NEFT.',
            'Interest @ 18% per annum will be charged on overdue payments.',
            'Goods once sold or milestones certified will not be subject to deductions.'
          ],
          notes: invoice.notes,
          signatoryOverride: 'Authorized Finance & Accounts Officer'
        };
      }

      // Default fallback
      return {
        documentType: 'commercial',
        documentNumber: 'DOC-2026-000',
        documentTitle: 'COMMERCIAL DOCUMENT',
        date: new Date().toISOString().split('T')[0],
        statusText: 'DRAFT',
        clientOrParty: { name: 'Valued Client' },
        project: { name: 'HVAC Project' },
        items: [],
        financials: {
          subtotal: 0,
          taxableAmount: 0,
          gstRatePct: 18,
          cgstAmount: 0,
          sgstAmount: 0,
          taxAmount: 0,
          grandTotal: 0
        }
      };
    }, [quote, lead, invoice, documentData]);

    // 2. Resolve Report Template (Header, Styling, Footer)
    const reportTemplate = React.useMemo(() => {
      if (propTemplateConfig) return propTemplateConfig;
      if (doc.documentType === 'quote') {
        return storageService.getReportTemplate('quotation');
      }
      return storageService.getReportTemplate('invoice');
    }, [propTemplateConfig, doc.documentType]);

    // 3. Imperative Handle for Parent Calling Print / Export
    useImperativeHandle(ref, () => ({
      print: () => {
        if (!internalDocRef.current) return;
        triggerDirectPrint(
          internalDocRef.current,
          `AlphaERP_${doc.documentType.toUpperCase()}_${doc.documentNumber}`
        );
      },
      exportPDF: async (customFilename?: string) => {
        if (!internalDocRef.current) return false;
        setIsExportingPDF(true);
        try {
          const filename =
            customFilename || `AlphaERP_${doc.documentType.toUpperCase()}_${doc.documentNumber}`;
          return await downloadElementAsPDF(internalDocRef.current, {
            filename,
            documentTitle: `AlphaERP - ${doc.documentTitle} (${doc.documentNumber})`,
            orientation: 'portrait',
            marginMm: 8
          });
        } finally {
          setIsExportingPDF(false);
        }
      },
      getElement: () => internalDocRef.current
    }));

    // Action Handlers
    const handleDirectPrint = () => {
      if (!internalDocRef.current) return;
      triggerDirectPrint(
        internalDocRef.current,
        `AlphaERP_${doc.documentType.toUpperCase()}_${doc.documentNumber}`
      );
    };

    const handleExportPDF = async () => {
      if (!internalDocRef.current) return;
      setIsExportingPDF(true);
      try {
        await downloadElementAsPDF(internalDocRef.current, {
          filename: `AlphaERP_${doc.documentType.toUpperCase()}_${doc.documentNumber}`,
          documentTitle: `AlphaERP - ${doc.documentTitle} (${doc.documentNumber})`,
          orientation: 'portrait',
          marginMm: 8
        });
      } catch (err) {
        console.error('Failed to export PDF:', err);
      } finally {
        setIsExportingPDF(false);
      }
    };

    const categoryPillColors: Record<string, string> = {
      Equipment: 'bg-blue-50 text-blue-700 border-blue-200',
      Ducting: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      Piping: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Labor: 'bg-amber-50 text-amber-700 border-amber-200',
      Accessories: 'bg-slate-50 text-slate-700 border-slate-200',
      'Milestone Work': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };

    return (
      <div className={`print-container w-full ${className}`}>
        {/* Top Screen Actions Bar (Suppressed on Print) */}
        {showToolbar && (
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5 gap-3 no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900 shadow-xs">
                {doc.documentType === 'quote' ? (
                  <FileText className="w-5 h-5" />
                ) : (
                  <Receipt className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {doc.documentTitle}
                  </h3>
                  <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    {doc.documentNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {doc.project.name} • {doc.clientOrParty.name}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                title="Generate and Download High-Resolution PDF Document"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export to PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDirectPrint}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Print via Browser System Dialog"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>

              {onShareWhatsApp && (
                <button
                  onClick={onShareWhatsApp}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  title="Share document details via WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              )}

              {onShareEmail && (
                <button
                  onClick={onShareEmail}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  title="Email formal PDF document to client"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Email PDF</span>
                </button>
              )}

              {extraActions}

              {quote && onAwardQuote && quote.status !== 'Awarded' && (
                <button
                  onClick={() => onAwardQuote(quote)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Award Contract</span>
                </button>
              )}

              {invoice && onRecordPayment && invoice.status !== 'Paid' && (
                <button
                  onClick={() => onRecordPayment(invoice)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Process Payment</span>
                </button>
              )}

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close Dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Printable Formatted Document Body */}
        <div
          ref={internalDocRef}
          className="print-document bg-white rounded-xl p-6 sm:p-8 border border-slate-200 text-xs text-slate-800 shadow-xs relative overflow-visible space-y-6"
        >
          {/* Watermark Overlay for Settled/Awarded/Special Statuses */}
          {showWatermark && doc.watermarkText && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
              <div className="text-6xl sm:text-8xl font-black text-emerald-500/10 -rotate-30 tracking-widest uppercase border-8 border-emerald-500/10 p-6 sm:p-8 rounded-3xl">
                {doc.watermarkText}
              </div>
            </div>
          )}

          <div className="relative z-10 space-y-6">
            {/* 1. Header Block */}
            <DocumentHeader
              headerConfig={reportTemplate.header}
              stylingConfig={reportTemplate.styling}
              settings={systemSettings}
              documentNumber={doc.documentNumber}
              documentDate={doc.date}
              secondaryDateLabel={
                doc.documentType === 'quote'
                  ? 'Valid Until'
                  : doc.statusText.includes('PAID')
                  ? 'Settled On'
                  : 'Due Date'
              }
              secondaryDateValue={doc.dueDateOrValidity}
              projectRef={doc.project.name}
              statusBadge={{
                text: `Status: ${doc.statusText}`,
                colorClass: doc.statusColorClass || 'bg-blue-100 text-blue-800 border-blue-200'
              }}
            />

            {/* 2. Structured Party & Scope Specification Grid */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 text-xs shadow-2xs relative overflow-hidden avoid-break"
              style={{
                borderTop: `3px solid ${reportTemplate.header.accentColor || '#0066E0'}`
              }}
            >
              {/* Column 1: Client / Party Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {doc.documentType === 'quote'
                      ? 'Client / Proposal Recipient:'
                      : 'Billed To (Client / Entity):'}
                  </span>
                </div>
                <div>
                  <div className="font-black text-slate-900 text-sm tracking-tight">
                    {doc.clientOrParty.name}
                  </div>
                  {doc.clientOrParty.attention && (
                    <div className="text-slate-600 text-[11px] font-medium mt-0.5">
                      Attn: {doc.clientOrParty.attention}
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                  {doc.clientOrParty.address && (
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{doc.clientOrParty.address}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10px] text-slate-500">
                    {doc.clientOrParty.gstin && (
                      <span>
                        <strong>GSTIN:</strong> {doc.clientOrParty.gstin}
                      </span>
                    )}
                    {doc.clientOrParty.pan && (
                      <span>
                        <strong>PAN:</strong> {doc.clientOrParty.pan}
                      </span>
                    )}
                    {doc.clientOrParty.stateCode && (
                      <span>
                        <strong>State:</strong> {doc.clientOrParty.stateCode}
                      </span>
                    )}
                  </div>
                  {(doc.clientOrParty.phone || doc.clientOrParty.email) && (
                    <div className="flex flex-wrap items-center gap-x-3 text-[10px] text-slate-500 pt-0.5">
                      {doc.clientOrParty.phone && <span>Tel: {doc.clientOrParty.phone}</span>}
                      {doc.clientOrParty.email && <span>Email: {doc.clientOrParty.email}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Contract Scope / Project Specifications */}
              <div className="space-y-2 md:border-l md:border-slate-200 md:pl-4">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>HVAC Contract Scope & Site Details:</span>
                </div>
                <div>
                  <div className="font-black text-slate-900 text-sm tracking-tight">
                    {doc.project.name}
                  </div>
                  {doc.project.billingMilestone && (
                    <div className="text-slate-600 text-[11px] font-medium mt-0.5">
                      Execution Stage:{' '}
                      <span className="font-bold text-slate-800">
                        {doc.project.billingMilestone}{' '}
                        {doc.project.milestonePercentage !== undefined
                          ? `(${doc.project.milestonePercentage}%)`
                          : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      SAC / HSN Code
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {doc.project.sacCode || '995461 (HVAC Works)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Settlement Mode
                    </span>
                    <span className="font-semibold text-slate-800">
                      {doc.project.paymentMethod || 'Bank Wire (RTGS / NEFT)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Line Items & Bill of Quantities Schedule */}
            <div className="space-y-2 avoid-break">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                <span>
                  {doc.documentType === 'quote'
                    ? 'Schedule of Works & Technical Bill of Quantities (BOQ):'
                    : 'Taxable HVAC Services & Milestone Deliverables:'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {doc.items.length} Line {doc.items.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      {doc.items.some((i) => i.category) && (
                        <th className="py-2.5 px-3 w-28">Category</th>
                      )}
                      <th className="py-2.5 px-3">Description & Engineering Specifications</th>
                      <th className="py-2.5 px-3 text-center w-20">SAC / SKU</th>
                      <th className="py-2.5 px-3 text-center w-16">Qty</th>
                      <th className="py-2.5 px-3 text-center w-16">Unit</th>
                      <th className="py-2.5 px-3 text-right w-28">Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right w-28">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {doc.items.map((item, idx) => (
                      <tr
                        key={item.id || idx}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[10px]">
                          {item.srNo || idx + 1}
                        </td>
                        {doc.items.some((i) => i.category) && (
                          <td className="py-2.5 px-3">
                            {item.category && (
                              <span
                                className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded border ${
                                  categoryPillColors[item.category] ||
                                  'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                {item.category}
                              </span>
                            )}
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-slate-900">
                          <div className="font-semibold text-xs">{item.description}</div>
                          {item.notes && (
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.notes}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[10px]">
                          {item.skuOrSac || '995461'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                          {item.qty}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-medium">
                          {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                          ₹{item.totalPrice.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Financial Calculation Summary Block */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2 avoid-break">
              {/* Left Column: Amount in Words & Notes */}
              <div className="w-full sm:max-w-md bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Total Amount in Words:
                </div>
                <div className="font-bold text-slate-900 text-xs italic leading-relaxed">
                  {doc.financials.amountInWords || numberToWords(doc.financials.grandTotal)}
                </div>
                {doc.notes && (
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600">
                    <strong>Special Note:</strong> {doc.notes}
                  </div>
                )}
              </div>

              {/* Right Column: Taxation Calculation Breakdown */}
              <div className="w-full sm:w-80 bg-white p-4 rounded-xl border-2 border-slate-200 space-y-2 text-xs shadow-2xs">
                <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Taxation & Financial Summary:
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    ₹{doc.financials.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {doc.financials.discountAmount && doc.financials.discountAmount > 0 ? (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Discount ({doc.financials.discountPct || 0}%):</span>
                    <span className="font-mono">
                      - ₹{doc.financials.discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : null}

                <div className="flex justify-between text-slate-600 border-t border-slate-100 pt-1.5">
                  <span>Taxable Base Value:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    ₹{doc.financials.taxableAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>CGST (9%):</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    ₹{doc.financials.cgstAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>SGST (9%):</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    ₹{doc.financials.sgstAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-black text-blue-900 bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                  <span>Total Payable (incl. GST):</span>
                  <span className="font-mono font-bold text-base text-blue-700">
                    ₹{doc.financials.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Statutory Terms, Bank Electronic Remittance & Signatures */}
            <div className="avoid-break">
              <DocumentFooter
                footerConfig={reportTemplate.footer}
                stylingConfig={reportTemplate.styling}
                settings={systemSettings}
                customTerms={doc.terms}
                clientOrVendorName={doc.clientOrParty.name}
                primarySignatoryOverride={doc.signatoryOverride}
                secondarySignatoryOverride={doc.clientSignatoryOverride}
                pageNumber={1}
                totalPages={1}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintableDocumentTemplate.displayName = 'PrintableDocumentTemplate';
