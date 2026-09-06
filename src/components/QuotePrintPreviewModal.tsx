import React, { useState, useRef } from 'react';
import {
  Printer,
  Download,
  X,
  Eye,
  Sliders,
  Sparkles,
  CheckCircle2,
  Building2,
  Calendar,
  CreditCard,
  Layers,
  FileText,
  Percent,
  ShieldCheck,
  MessageSquare,
  Mail,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw
} from 'lucide-react';
import { Quote, Lead } from '../types';
import { downloadElementAsPDF, triggerDirectPrint } from '../utils/pdfExportHelper';
import { JSAlphaSoftLogo } from './JSAlphaSoftLogo';
import { numberToWords } from './common/PrintableDocumentTemplate';

interface QuotePrintPreviewModalProps {
  quote: Quote;
  lead?: Lead;
  onClose: () => void;
  onAwardQuote?: (quote: Quote) => void;
  onShareWhatsApp?: () => void;
  onShareEmail?: () => void;
}

export const QuotePrintPreviewModal: React.FC<QuotePrintPreviewModalProps> = ({
  quote,
  lead,
  onClose,
  onAwardQuote,
  onShareWhatsApp,
  onShareEmail
}) => {
  const printDocRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Formatting State Controls
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [colorTheme, setColorTheme] = useState<'indigo' | 'slate' | 'navy'>('indigo');
  const [showBankDetails, setShowBankDetails] = useState<boolean>(true);
  const [showTerms, setShowTerms] = useState<boolean>(true);
  const [showSignatures, setShowSignatures] = useState<boolean>(true);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState<boolean>(true);
  const [watermark, setWatermark] = useState<string>('NONE'); // NONE, DRAFT, CONFIDENTIAL, ORIGINAL
  const [customRemarks, setCustomRemarks] = useState<string>('Standard 1-Year Comprehensive Warranty on all HVAC equipment and 90-day testing & balancing signoff included.');

  // Financial calculations
  const subtotal = quote.subtotal || quote.totalCost || quote.items.reduce((sum, i) => sum + i.totalCost, 0);
  const discountAmount = quote.discountAmount || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstRate = 18; // 18% standard GST for HVAC contracts
  const cgstAmount = Number(((taxableAmount * (gstRate / 2)) / 100).toFixed(2));
  const sgstAmount = Number(((taxableAmount * (gstRate / 2)) / 100).toFixed(2));
  const totalTax = cgstAmount + sgstAmount;
  const grandTotal = quote.totalAmount || (taxableAmount + totalTax);

  const handleDownloadPDF = async () => {
    if (!printDocRef.current) return;
    setIsExportingPDF(true);
    try {
      await downloadElementAsPDF(printDocRef.current, {
        filename: `AlphaERP_Quote_${quote.quoteNumber}_${orientation}`,
        documentTitle: `Techno-Commercial Quotation - ${quote.quoteNumber}`,
        orientation,
        scale: 2
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDirectPrint = () => {
    if (!printDocRef.current) return;
    triggerDirectPrint(printDocRef.current, `AlphaERP_Quote_${quote.quoteNumber}`);
  };

  const getThemeHeaderClasses = () => {
    switch (colorTheme) {
      case 'navy':
        return 'bg-slate-900 text-white border-slate-800';
      case 'slate':
        return 'bg-slate-800 text-white border-slate-700';
      case 'indigo':
      default:
        return 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white border-indigo-950';
    }
  };

  const getAccentColor = () => {
    switch (colorTheme) {
      case 'navy':
        return 'text-slate-900 border-slate-900';
      case 'slate':
        return 'text-slate-800 border-slate-800';
      case 'indigo':
      default:
        return 'text-indigo-900 border-indigo-900';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Top Controls & Action Bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                PDF Print & Layout Preview
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                {quote.quoteNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Format, toggle sections, and review print-specific CSS styling before generating final document
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onShareWhatsApp && (
            <button
              onClick={onShareWhatsApp}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors"
              title="Share via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          )}

          {onShareEmail && (
            <button
              onClick={onShareEmail}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200 transition-colors"
              title="Send via Email"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
          )}

          <button
            onClick={handleDirectPrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition-all shadow-2xs"
            title="Trigger Direct Browser Print Dialog"
          >
            <Printer className="w-4 h-4" />
            <span>Direct Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Area: Sidebar Controls + Document Canvas */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Layout & Section Customizer Sidebar */}
        <div className="w-full md:w-72 lg:w-80 bg-slate-50 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto space-y-4 shrink-0 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Print & Layout Options</span>
          </div>

          {/* Orientation & Paper Size */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-900 dark:text-slate-200 block">Page Setup</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-3 py-1.5 rounded-xl border font-semibold text-center transition-all ${
                  orientation === 'portrait'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                Portrait (A4)
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-3 py-1.5 rounded-xl border font-semibold text-center transition-all ${
                  orientation === 'landscape'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                Landscape
              </button>
            </div>
          </div>

          {/* Theme Header */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-900 dark:text-slate-200 block">Header Style & Palette</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'indigo', label: 'Indigo Corporate' },
                { id: 'navy', label: 'Deep Navy' },
                { id: 'slate', label: 'Slate Minimal' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setColorTheme(theme.id as any)}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold text-center transition-all ${
                    colorTheme === theme.id
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 border-indigo-500 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Watermark Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-900 dark:text-slate-200 block">Document Watermark</label>
            <select
              value={watermark}
              onChange={(e) => setWatermark(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="NONE">None (Official / Final)</option>
              <option value="DRAFT">DRAFT (Under Review)</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL</option>
              <option value="ORIGINAL">ORIGINAL FOR CLIENT</option>
              <option value="REVISED">REVISED ESTIMATE</option>
            </select>
          </div>

          {/* Section Visibility Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="font-semibold text-slate-900 dark:text-slate-200 block">Visible Sections & Scope</label>
            
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>GST & Tax Schedule</span>
              <input
                type="checkbox"
                checked={showTaxBreakdown}
                onChange={(e) => setShowTaxBreakdown(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Bank NEFT / RTGS Details</span>
              <input
                type="checkbox"
                checked={showBankDetails}
                onChange={(e) => setShowBankDetails(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Terms & Exclusions</span>
              <input
                type="checkbox"
                checked={showTerms}
                onChange={(e) => setShowTerms(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-1">
              <span>Authorized Signatures Block</span>
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={(e) => setShowSignatures(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>

          {/* Custom Notes Input */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="font-semibold text-slate-900 dark:text-slate-200 block">Quotation Remarks / Warranty Note</label>
            <textarea
              rows={3}
              value={customRemarks}
              onChange={(e) => setCustomRemarks(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter special technical warranty or site mobilization notes..."
            />
          </div>

          {/* Zoom Level Indicator */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="font-medium text-slate-500">Preview Zoom: {zoomLevel}%</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 font-semibold"
                title="Reset Zoom"
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: High-Fidelity Print-Styled Document Preview Container */}
        <div className="flex-1 bg-slate-800/90 overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="w-full max-w-4xl"
          >
            {/* The Document Element Captured for PDF Generation */}
            <div
              ref={printDocRef}
              className={`bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-10 space-y-6 relative print-document border border-slate-200 ${
                orientation === 'landscape' ? 'max-w-5xl' : 'max-w-4xl'
              }`}
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
              {/* Optional Watermark Overlay */}
              {watermark !== 'NONE' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none">
                  <span className="text-7xl sm:text-8xl font-black text-slate-300/30 dark:text-slate-400/20 -rotate-30 uppercase tracking-widest border-4 border-dashed border-slate-300/30 px-8 py-4 rounded-3xl">
                    {watermark}
                  </span>
                </div>
              )}

              {/* Document Header with Logo & Company Identification */}
              <div className={`p-6 rounded-2xl ${getThemeHeaderClasses()} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative z-10`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center">
                      <JSAlphaSoftLogo className="w-6 h-6 text-indigo-900" />
                    </div>
                    <div>
                      <div className="font-extrabold text-lg tracking-tight text-white">
                        ATMOS AIRCON PRIVATE LIMITED
                      </div>
                      <div className="text-[10px] text-indigo-200 font-mono">
                        HVAC Turnkey Contracting & Engineering Solutions
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-indigo-200/90 leading-relaxed pt-1">
                    Plot No. 42, Sector 18, Vashi, Navi Mumbai, MH - 400705 • Phone: +91 22 2789 4400
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1 border-t sm:border-t-0 sm:border-l border-white/20 pt-2 sm:pt-0 sm:pl-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    Techno-Commercial Quotation
                  </div>
                  <div className="text-xl font-mono font-black text-white">
                    {quote.quoteNumber}
                  </div>
                  <div className="text-[11px] text-indigo-200">
                    Date: <span className="font-semibold text-white">{quote.date || new Date().toISOString().split('T')[0]}</span>
                  </div>
                  <div className="text-[10px] text-indigo-300">
                    Valid Until: <span className="font-semibold text-white">{quote.validUntil || '30 Days from Issue'}</span>
                  </div>
                </div>
              </div>

              {/* Client & Project Details Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs relative z-10">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Customer / Client Information
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {quote.companyName || quote.clientName}
                  </div>
                  <div className="text-slate-600">
                    Attn: <span className="font-semibold">{quote.clientName}</span>
                  </div>
                  <div className="text-slate-500">
                    {lead?.address || 'Site Location, Mumbai Metropolitan Region'}
                  </div>
                  <div className="text-slate-500">
                    Email: {lead?.email || 'commercial@clientcorp.in'} • Contact: {lead?.phone || '+91 98201 55678'}
                  </div>
                </div>

                <div className="space-y-1 sm:text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Project & Scope Identification
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {quote.projectTitle || 'Turnkey HVAC Engineering Contract'}
                  </div>
                  <div className="text-slate-600">
                    System Type: <span className="font-semibold">{quote.systemType || 'VRF Heat Recovery & Ducting'}</span>
                  </div>
                  <div className="text-slate-500">
                    Capacity: <span className="font-semibold font-mono">{quote.coolingCapacity || '120 TR'}</span>
                  </div>
                  <div className="text-slate-500">
                    Quotation Status: <span className="font-bold text-indigo-700">{quote.status || 'Active'}</span>
                  </div>
                </div>
              </div>

              {/* Scope of Work Line Items Table */}
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Bill of Quantities (BOQ) & Scope of Supply</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {quote.items.length} Scope Items
                  </span>
                </div>

                <table className="w-full text-left text-xs border-collapse border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 border-r border-slate-200 w-10 text-center">#</th>
                      <th className="p-2.5 border-r border-slate-200">Item Description & Specification</th>
                      <th className="p-2.5 border-r border-slate-200 w-24">Category</th>
                      <th className="p-2.5 border-r border-slate-200 w-16 text-center">Qty</th>
                      <th className="p-2.5 border-r border-slate-200 w-16 text-center">Unit</th>
                      <th className="p-2.5 border-r border-slate-200 w-28 text-right">Unit Rate (₹)</th>
                      <th className="p-2.5 w-32 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {quote.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50">
                        <td className="p-2.5 border-r border-slate-200 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 font-medium">
                          <div>{item.description}</div>
                          {item.notes && (
                            <div className="text-[10px] text-slate-500 italic mt-0.5">{item.notes}</div>
                          )}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-[11px] text-slate-600">
                          {item.category}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-center font-mono font-semibold">
                          {item.quantity}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-center text-slate-500">
                          {item.unit || 'Nos'}
                        </td>
                        <td className="p-2.5 border-r border-slate-200 text-right font-mono">
                          {item.unitCost?.toLocaleString('en-IN') || '0'}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                          {item.totalCost?.toLocaleString('en-IN') || '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation & GST Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 relative z-10">
                {/* Left Side: Amount in Words & Remarks */}
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold uppercase text-slate-500">Total Contract Value in Words:</div>
                    <div className="text-xs font-semibold text-slate-900 mt-1 italic">
                      {numberToWords(grandTotal)}
                    </div>
                  </div>

                  {customRemarks && (
                    <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
                      <div className="text-[10px] font-bold uppercase text-indigo-900">Engineering & Warranty Notes:</div>
                      <div className="text-xs text-indigo-950 mt-1 leading-relaxed">
                        {customRemarks}
                      </div>
                    </div>
                  )}

                  {showBankDetails && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
                      <div className="font-bold text-slate-800 uppercase text-[10px]">Bank Remittance Coordinates:</div>
                      <div className="text-slate-600">Bank: <span className="font-semibold text-slate-800">HDFC Bank Limited</span> • Branch: Vashi Commercial</div>
                      <div className="text-slate-600">A/C No: <span className="font-mono font-bold text-slate-900">50200088991234</span> • IFSC: <span className="font-mono font-bold text-slate-900">HDFC0001024</span></div>
                    </div>
                  )}
                </div>

                {/* Right Side: Commercial Totals Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>BOQ Subtotal:</span>
                    <span className="font-mono font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Commercial Discount:</span>
                      <span className="font-mono font-semibold">- ₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-800 font-semibold pt-1 border-t border-slate-200">
                    <span>Taxable Base Value:</span>
                    <span className="font-mono">₹{taxableAmount.toLocaleString('en-IN')}</span>
                  </div>

                  {showTaxBreakdown && (
                    <>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>CGST @ 9%:</span>
                        <span className="font-mono">₹{cgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>SGST @ 9%:</span>
                        <span className="font-mono">₹{sgstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-base font-bold text-indigo-900 pt-2 border-t-2 border-slate-300">
                    <span>Grand Total (All Inclusive):</span>
                    <span className="font-mono text-indigo-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions Section */}
              {showTerms && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5 relative z-10 page-break-avoid">
                  <div className="font-bold text-slate-800 uppercase text-[10px]">Commercial & Technical Terms:</div>
                  <ol className="list-decimal pl-4 space-y-0.5 leading-relaxed">
                    <li>Prices are inclusive of supply, transit insurance, and installation at designated site.</li>
                    <li>Payment Terms: 30% Advance with PO, 50% on material delivery against inspection, 20% on testing and handover.</li>
                    <li>Delivery Period: 4-6 weeks from receipt of technically clear PO and site mobilization clearance.</li>
                    <li>Site Requirements: Continuous 3-Phase power, scaffolding, and water supply to be provided by client.</li>
                  </ol>
                </div>
              )}

              {/* Signatures & Seal Block */}
              {showSignatures && (
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 relative z-10 page-break-avoid">
                  <div className="space-y-12">
                    <div className="text-xs font-bold text-slate-800">Client Acceptance & Confirmation:</div>
                    <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-500">
                      Authorized Signatory & Company Stamp
                    </div>
                  </div>

                  <div className="space-y-12 text-right">
                    <div className="text-xs font-bold text-indigo-900">For ATMOS AIRCON PRIVATE LIMITED:</div>
                    <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-500">
                      Authorized Signatory (HVAC Projects Division)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
