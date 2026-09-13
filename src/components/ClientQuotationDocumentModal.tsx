import React, { useState, useRef, useMemo } from 'react';
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
  MapPin,
  User,
  Clock,
  CheckCheck,
  Info,
  ChevronDown,
  Briefcase,
  TrendingUp,
  FileDown
} from 'lucide-react';
import { Quote, Project, Lead } from '../types';
import { downloadElementAsPDF, triggerDirectPrint } from '../utils/pdfExportHelper';
import { JSAlphaSoftLogo } from './JSAlphaSoftLogo';
import { numberToWords } from './common/PrintableDocumentTemplate';

export interface ClientQuotationDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote;
  project?: Project | null;
  allProjects?: Project[];
  allQuotes?: Quote[];
  leads?: Lead[];
  onSelectQuote?: (quote: Quote) => void;
  onSelectProject?: (project: Project) => void;
  onAwardQuote?: (quote: Quote) => void;
  onShareWhatsApp?: (quote: Quote) => void;
  onShareEmail?: (quote: Quote) => void;
}

export const ClientQuotationDocumentModal: React.FC<ClientQuotationDocumentModalProps> = ({
  isOpen,
  onClose,
  quote: initialQuote,
  project: initialProject,
  allProjects = [],
  allQuotes = [],
  leads = [],
  onSelectQuote,
  onSelectProject,
  onAwardQuote,
  onShareWhatsApp,
  onShareEmail
}) => {
  const printDocRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Active Quote & Project State
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(initialQuote.id);
  const currentQuote = useMemo(() => {
    return allQuotes.find((q) => q.id === selectedQuoteId) || initialQuote;
  }, [allQuotes, selectedQuoteId, initialQuote]);

  // Find linked or selected project
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    if (initialProject) return initialProject.id;
    // Auto-detect project matching quote
    const matched = allProjects.find(
      (p) =>
        p.quoteId === initialQuote.id ||
        initialQuote.convertedToProjectId === p.id ||
        (p.leadId && p.leadId === initialQuote.leadId) ||
        p.projectName.toLowerCase().includes((initialQuote.projectTitle || '').toLowerCase().substring(0, 15))
    );
    return matched ? matched.id : (allProjects[0]?.id || '');
  });

  const currentProject = useMemo(() => {
    if (selectedProjectId) {
      const found = allProjects.find((p) => p.id === selectedProjectId);
      if (found) return found;
    }
    // Fallback: match by currentQuote
    return (
      allProjects.find(
        (p) =>
          p.quoteId === currentQuote.id ||
          currentQuote.convertedToProjectId === p.id ||
          (p.leadId && p.leadId === currentQuote.leadId)
      ) ||
      initialProject ||
      null
    );
  }, [allProjects, selectedProjectId, currentQuote, initialProject]);

  const currentLead = useMemo(() => {
    return leads.find((l) => l.id === currentQuote.leadId) || null;
  }, [leads, currentQuote.leadId]);

  // Layout & Formatting Controls
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [colorTheme, setColorTheme] = useState<'indigo' | 'navy' | 'slate'>('indigo');
  const [watermark, setWatermark] = useState<string>('NONE'); // NONE, DRAFT, CONFIDENTIAL, ORIGINAL CLIENT COPY, REVISED
  const [showMilestones, setShowMilestones] = useState<boolean>(true);
  const [showTechSpecs, setShowTechSpecs] = useState<boolean>(true);
  const [showBankDetails, setShowBankDetails] = useState<boolean>(true);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState<boolean>(true);
  const [showTerms, setShowTerms] = useState<boolean>(true);
  const [showSignatures, setShowSignatures] = useState<boolean>(true);
  const [customRemarks, setCustomRemarks] = useState<string>(
    'Equipment supply carries 1-Year Comprehensive On-Site Warranty and 5-Year Compressor Warranty. Testing, Adjusting & Balancing (TAB) report will be submitted within 7 days of site commissioning.'
  );

  // Commercial calculations (Client-facing Selling Price, NOT internal cost)
  const subtotal = currentQuote.subtotal || currentQuote.items.reduce((sum, i) => sum + (i.totalPrice || (i.unitPrice * i.qty)), 0);
  const discountAmount = currentQuote.discountAmount || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstRate = 18; // 18% standard GST for HVAC contracts
  const cgstAmount = Number(((taxableAmount * 9) / 100).toFixed(2));
  const sgstAmount = Number(((taxableAmount * 9) / 100).toFixed(2));
  const totalTax = currentQuote.taxAmount || (cgstAmount + sgstAmount);
  const grandTotal = currentQuote.totalAmount || (taxableAmount + totalTax);

  // Derive cooling capacity and system type from quote or line items
  const derivedCapacity = useMemo(() => {
    const title = currentQuote.projectTitle || '';
    const match = title.match(/(\d+)\s*(?:TR|Ton|HP)/i);
    if (match) return `${match[1]} TR`;
    const hasEquipment = currentQuote.items.find((i) => i.category === 'Equipment' || i.description.includes('TR'));
    if (hasEquipment) {
      const eqMatch = hasEquipment.description.match(/(\d+(?:\.\d+)?)\s*(?:TR|HP)/i);
      if (eqMatch) return `${eqMatch[1]} TR (Modular)`;
    }
    return '120 TR';
  }, [currentQuote]);

  const derivedSystemType = useMemo(() => {
    const text = (currentQuote.projectTitle + ' ' + currentQuote.items.map((i) => i.description).join(' ')).toLowerCase();
    if (text.includes('vrv') || text.includes('vrf')) return 'Variable Refrigerant Flow (VRV / VRF) Inverter System';
    if (text.includes('chiller')) return 'Water-Cooled / Air-Cooled Central Chiller Plant';
    if (text.includes('packaged') || text.includes('ductable')) return 'Packaged Rooftop DX Ductable System';
    return 'Turnkey Central HVAC & Air Distribution System';
  }, [currentQuote]);

  // Project Milestones data for payment schedule
  const projectMilestones = useMemo(() => {
    if (currentProject?.expenseMilestones && currentProject.expenseMilestones.length > 0) {
      const totalBudget = currentProject.expenseMilestones.reduce((s, m) => s + m.budgetCost, 0) || 1;
      return currentProject.expenseMilestones.map((m, idx) => {
        const pct = Math.round((m.budgetCost / totalBudget) * 100);
        return {
          phase: m.phase || `M${idx + 1}`,
          title: m.label || `Milestone ${idx + 1}`,
          percentage: pct > 0 ? pct : (idx === 0 ? 30 : idx === 1 ? 40 : 30),
          deliverable:
            idx === 0
              ? 'Engineering submittals, drawing approvals & mobilization'
              : idx === 1
              ? 'Dispatch of primary VRF / Chiller equipment at site'
              : idx === 2
              ? 'Refrigerant piping, insulation & ducting erection'
              : idx === 3
              ? 'Electrical cabling, BMS controllers & diffuser installation'
              : 'Testing, Adjusting, Balancing (TAB) & handover certificate'
        };
      });
    }

    // Default commercial HVAC standard milestones
    return [
      { phase: 'M1', title: 'Mobilization & Technical Submittals', percentage: 20, deliverable: 'Drawing approval, heat load verification & mobilization advance' },
      { phase: 'M2', title: 'Major Equipment Dispatch', percentage: 40, deliverable: 'Delivery of Outdoor Units (ODUs) and Cassette/Ductable IDUs to site' },
      { phase: 'M3', title: 'Piping, Ducting & Electrical Works', percentage: 25, deliverable: 'Completion of copper piping, GI ducting, insulation & power cabling' },
      { phase: 'M4', title: 'Testing, Commissioning & Handover', percentage: 15, deliverable: 'Pressure testing, air balancing (TAB), 72-hr trial run & handover' }
    ];
  }, [currentProject]);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    if (!printDocRef.current) return;
    setIsExportingPDF(true);
    const safeProjectNumber = currentProject?.projectNumber ? `_${currentProject.projectNumber}` : '';
    try {
      await downloadElementAsPDF(printDocRef.current, {
        filename: `AlphaERP_Client_Quotation_${currentQuote.quoteNumber}${safeProjectNumber}`,
        documentTitle: `AlphaERP Formal Client Quotation - ${currentQuote.quoteNumber} - ${currentQuote.companyName || currentQuote.clientName}`,
        orientation,
        scale: 2,
        marginMm: 8,
        footerText: `AlphaERP Official Client Quotation • HVAC Biz Pvt Ltd • Ref: ${currentQuote.quoteNumber} • Generated on ${new Date().toLocaleDateString('en-IN')}`
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDirectPrint = () => {
    if (!printDocRef.current) return;
    triggerDirectPrint(printDocRef.current, `AlphaERP_Client_Quotation_${currentQuote.quoteNumber}`);
  };

  const getHeaderThemeClass = () => {
    switch (colorTheme) {
      case 'navy':
        return 'bg-slate-900 text-white border-slate-800';
      case 'slate':
        return 'bg-slate-800 text-white border-slate-700';
      case 'indigo':
      default:
        return 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-indigo-950';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Top Controls & Action Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <FileDown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900">
                Client Quotation Document Generator
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {currentQuote.quoteNumber}
              </span>
              {currentProject && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Project: {currentProject.projectNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Formatted client proposal with current project details, technical scope, BOQ schedule, milestones, and statutory GST calculation.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onShareWhatsApp && (
            <button
              onClick={() => onShareWhatsApp(currentQuote)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors"
              title="Share via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          )}

          {onShareEmail && (
            <button
              onClick={() => onShareEmail(currentQuote)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200 transition-colors"
              title="Send via Email"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </button>
          )}

          <button
            onClick={handleDirectPrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-all shadow-2xs"
            title="Trigger Direct Browser Print Dialog"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          {/* Primary PDF Generation Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            title="Download high-resolution client-ready PDF document"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Client PDF</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container: Customizer Controls Sidebar + Printable Document Preview */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Layout & Project Selection Customizer */}
        <div className="w-full md:w-80 lg:w-84 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto space-y-4 shrink-0 text-xs text-slate-700">
          <div className="flex items-center gap-2 font-bold text-slate-900 pb-2 border-b border-slate-200">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>Document & Project Configuration</span>
          </div>

          {/* Current Project Linkage Selector */}
          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <label className="font-bold text-slate-900 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Current Project Context:</span>
            </label>
            <select
              value={currentProject?.id || ''}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                const prj = allProjects.find((p) => p.id === e.target.value);
                if (prj && onSelectProject) onSelectProject(prj);
                // If project has quoteId, auto-select it
                if (prj?.quoteId) {
                  const matchingQuote = allQuotes.find((q) => q.id === prj.quoteId);
                  if (matchingQuote) {
                    setSelectedQuoteId(matchingQuote.id);
                    if (onSelectQuote) onSelectQuote(matchingQuote);
                  }
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectNumber} - {p.projectName}
                </option>
              ))}
              {allProjects.length === 0 && <option value="">No Active Projects</option>}
            </select>
            {currentProject && (
              <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                <div>Manager: <span className="font-semibold text-slate-700">{currentProject.projectManager}</span></div>
                <div>Timeline: <span className="font-semibold text-slate-700">{currentProject.startDate}</span> to <span className="font-semibold text-slate-700">{currentProject.targetCompletionDate}</span></div>
                <div>Status: <span className="font-semibold text-blue-700">{currentProject.status} ({currentProject.progressPct}% Done)</span></div>
              </div>
            )}
          </div>

          {/* Quotation Selection */}
          <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <label className="font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quotation Record:</span>
            </label>
            <select
              value={currentQuote.id}
              onChange={(e) => {
                setSelectedQuoteId(e.target.value);
                const q = allQuotes.find((item) => item.id === e.target.value);
                if (q && onSelectQuote) onSelectQuote(q);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allQuotes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.quoteNumber} - ₹{(q.totalAmount / 100000).toFixed(2)}L ({q.clientName})
                </option>
              ))}
            </select>
          </div>

          {/* Page Orientation */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-900 block">Page Layout & Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-3 py-1.5 rounded-xl border font-semibold text-center transition-all ${
                  orientation === 'portrait'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Portrait (A4)
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-3 py-1.5 rounded-xl border font-semibold text-center transition-all ${
                  orientation === 'landscape'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Landscape
              </button>
            </div>
          </div>

          {/* Header Theme */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-900 block">Header Style Palette</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'indigo', label: 'Sapphire' },
                { id: 'navy', label: 'Deep Navy' },
                { id: 'slate', label: 'Slate Minimal' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setColorTheme(theme.id as any)}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold text-center transition-all ${
                    colorTheme === theme.id
                      ? 'bg-blue-100 text-blue-900 border-blue-500 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Watermark Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-900 block">Document Watermark</label>
            <select
              value={watermark}
              onChange={(e) => setWatermark(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NONE">None (Official Final Client Copy)</option>
              <option value="DRAFT">DRAFT (Under Technical Review)</option>
              <option value="CONFIDENTIAL">CONFIDENTIAL</option>
              <option value="ORIGINAL CLIENT COPY">ORIGINAL CLIENT COPY</option>
              <option value="REVISED ESTIMATE">REVISED ESTIMATE</option>
            </select>
          </div>

          {/* Scope & Section Visibility Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="font-semibold text-slate-900 block">Visible Sections</label>

            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span>Project Milestones & Timeline</span>
              <input
                type="checkbox"
                checked={showMilestones}
                onChange={(e) => setShowMilestones(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span>Technical Design Parameters</span>
              <input
                type="checkbox"
                checked={showTechSpecs}
                onChange={(e) => setShowTechSpecs(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span>Detailed Tax Schedule (CGST/SGST)</span>
              <input
                type="checkbox"
                checked={showTaxBreakdown}
                onChange={(e) => setShowTaxBreakdown(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span>Bank RTGS / NEFT Remittance</span>
              <input
                type="checkbox"
                checked={showBankDetails}
                onChange={(e) => setShowBankDetails(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span>Standard Terms & Warranty</span>
              <input
                type="checkbox"
                checked={showTerms}
                onChange={(e) => setShowTerms(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer py-0.5">
              <span>Authorized Signatures Block</span>
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={(e) => setShowSignatures(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>

          {/* Custom Engineering Remarks */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            <label className="font-semibold text-slate-900 block">Engineering & Warranty Notes</label>
            <textarea
              rows={3}
              value={customRemarks}
              onChange={(e) => setCustomRemarks(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter special technical warranty or site mobilization notes..."
            />
          </div>

          {/* Zoom Level Indicator */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="font-medium text-slate-500">Preview: {zoomLevel}%</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="px-2 py-0.5 rounded text-[11px] bg-white border border-slate-200 hover:bg-slate-100 font-semibold"
                title="Reset Zoom"
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: High-Fidelity Formatted Document Canvas */}
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
                  <span className="text-7xl sm:text-8xl font-black text-slate-300/30 -rotate-30 uppercase tracking-widest border-4 border-dashed border-slate-300/30 px-8 py-4 rounded-3xl">
                    {watermark}
                  </span>
                </div>
              )}

              {/* Document Header with Logo & Corporate Letterhead */}
              <div className={`p-6 rounded-2xl ${getHeaderThemeClass()} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm relative z-10`}>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                      <JSAlphaSoftLogo variant="icon" size="xs" />
                    </div>
                    <div>
                      <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
                        <span>HVAC BIZ PRIVATE LIMITED</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/30 border border-blue-400/40 text-blue-200 font-bold uppercase">
                          ISO 9001:2015 Certified
                        </span>
                      </div>
                      <div className="text-[10px] text-blue-200 font-mono">
                        Class-1 Licensed HVAC Turnkey Engineering Contractor • VRF & Chiller Specialist
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-blue-200/90 leading-relaxed pt-0.5">
                    Plot No. 42, Sector 18, Vashi Commercial Complex, Navi Mumbai, MH - 400705
                  </div>
                  <div className="text-[10px] text-blue-300/80 font-mono">
                    GSTIN: 27AABCA1299K1Z4 • PAN: AABCA1299K • CIN: U29190MH2018PLC312984 • Phone: +91 22 2789 4400
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1 border-t sm:border-t-0 sm:border-l border-white/20 pt-2 sm:pt-0 sm:pl-5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                    Official Client Quotation
                  </div>
                  <div className="text-xl font-mono font-black text-white">
                    {currentQuote.quoteNumber}
                  </div>
                  <div className="text-[11px] text-blue-200">
                    Date: <span className="font-semibold text-white">{currentQuote.date || new Date().toISOString().split('T')[0]}</span>
                  </div>
                  <div className="text-[10px] text-blue-300">
                    Valid Until: <span className="font-semibold text-white">{currentQuote.validUntil || '30 Days from Issue'}</span>
                  </div>
                </div>
              </div>

              {/* Client & Current Project Details Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs relative z-10">
                {/* Client Metadata */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-blue-600" />
                    <span>Client / Bill To Particulars</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {currentQuote.companyName || currentQuote.clientName}
                  </div>
                  <div className="text-slate-700 font-medium">
                    Attn: <span className="font-semibold text-slate-900">{currentQuote.clientName}</span>
                  </div>
                  <div className="text-slate-500 leading-snug">
                    {currentQuote.siteAddress || currentLead?.siteAddress || currentLead?.address || 'Site Premises, Mumbai Metropolitan Region'}
                  </div>
                  <div className="text-slate-500 pt-0.5">
                    Contact: {currentLead?.phone || '+91 98201 55678'} • Email: {currentLead?.email || 'commercial@clientcorp.in'}
                  </div>
                  <div className="text-slate-500 font-mono text-[10px]">
                    Client GSTIN: 27AABCA9911D1Z2 • State: 27 (Maharashtra)
                  </div>
                </div>

                {/* Current Project Details */}
                <div className="space-y-1 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center sm:justify-end gap-1">
                    <Briefcase className="w-3 h-3 text-emerald-600" />
                    <span>Current Project Specifications</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {currentProject?.projectName || currentQuote.projectTitle || 'Central HVAC Engineering Installation'}
                  </div>
                  {currentProject && (
                    <div className="text-slate-700 font-medium">
                      Project Code: <span className="font-mono font-bold text-blue-700">{currentProject.projectNumber}</span>
                    </div>
                  )}
                  <div className="text-slate-600">
                    Assigned PM: <span className="font-semibold text-slate-800">{currentProject?.projectManager || currentQuote.preparedBy || 'Vikramaditya Solanki (Senior PM)'}</span>
                  </div>
                  <div className="text-slate-500">
                    Execution Schedule: <span className="font-medium text-slate-800">{currentProject?.startDate || currentQuote.date}</span> to <span className="font-medium text-slate-800">{currentProject?.targetCompletionDate || 'Commissioning Handover'}</span>
                  </div>
                  <div className="text-slate-500">
                    System Architecture: <span className="font-semibold text-blue-900">{derivedCapacity} • {derivedSystemType}</span>
                  </div>
                </div>
              </div>

              {/* Technical Design Parameters Highlight (If enabled) */}
              {showTechSpecs && (
                <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 text-xs space-y-1.5 relative z-10">
                  <div className="font-bold text-blue-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Engineering Basis of Design & Technical Parameters</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Cooling Capacity:</span>
                      <span className="font-semibold font-mono text-slate-900">{derivedCapacity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Ambient Condition:</span>
                      <span className="font-semibold text-slate-900">43°C DBT / 28°C WBT</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Indoor Condition:</span>
                      <span className="font-semibold text-slate-900">23°C ± 1°C, 55% ± 5% RH</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Refrigerant / Power:</span>
                      <span className="font-semibold text-slate-900">R-410A / 415V, 3Ph, 50Hz</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Itemized BOQ Schedule Table */}
              <div className="space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Itemized Bill of Quantities (BOQ) & Scope of Works</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {currentQuote.items.length} Scope Items
                  </span>
                </div>

                <table className="w-full text-left text-xs border-collapse border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 border-r border-slate-200 w-10 text-center">#</th>
                      <th className="p-2.5 border-r border-slate-200">Item Description & Specification</th>
                      <th className="p-2.5 border-r border-slate-200 w-28">Category</th>
                      <th className="p-2.5 border-r border-slate-200 w-16 text-center">Qty</th>
                      <th className="p-2.5 border-r border-slate-200 w-16 text-center">Unit</th>
                      <th className="p-2.5 border-r border-slate-200 w-28 text-right">Unit Rate (₹)</th>
                      <th className="p-2.5 w-32 text-right">Total Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {currentQuote.items.map((item, idx) => {
                      const itemPrice = item.unitPrice || (item.totalPrice ? item.totalPrice / (item.qty || 1) : 0);
                      const totalItemPrice = item.totalPrice || (itemPrice * (item.qty || 1));
                      return (
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
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-center font-mono font-semibold">
                            {item.qty}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-center text-slate-500">
                            {item.unit || 'Nos'}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-right font-mono">
                            {itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {totalItemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Commercial Calculation & GST Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 relative z-10">
                {/* Left Side: Amount in Words, Bank Details, Remarks */}
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-bold uppercase text-slate-500">Total Contract Value in Words:</div>
                    <div className="text-xs font-semibold text-slate-900 mt-1 italic">
                      {numberToWords(grandTotal)}
                    </div>
                  </div>

                  {customRemarks && (
                    <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                      <div className="text-[10px] font-bold uppercase text-blue-900">Engineering & Warranty Commitment:</div>
                      <div className="text-xs text-blue-950 mt-1 leading-relaxed">
                        {customRemarks}
                      </div>
                    </div>
                  )}

                  {showBankDetails && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] space-y-1">
                      <div className="font-bold text-slate-800 uppercase text-[10px]">Bank Remittance Coordinates (RTGS / NEFT):</div>
                      <div className="text-slate-600">Bank: <span className="font-semibold text-slate-800">HDFC Bank Limited</span> • Branch: Vashi Commercial Banking Branch</div>
                      <div className="text-slate-600">A/C Name: <span className="font-semibold text-slate-800">HVAC BIZ PRIVATE LIMITED</span></div>
                      <div className="text-slate-600">A/C No: <span className="font-mono font-bold text-slate-900">50200088991234</span> • IFSC: <span className="font-mono font-bold text-slate-900">HDFC0001024</span></div>
                    </div>
                  )}
                </div>

                {/* Right Side: Commercial Totals Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>BOQ Basic Amount:</span>
                    <span className="font-mono font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Special Commercial Discount ({currentQuote.discountPct || 0}%):</span>
                      <span className="font-mono font-semibold">- ₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-800 font-semibold pt-1 border-t border-slate-200">
                    <span>Net Taxable Base Value:</span>
                    <span className="font-mono">₹{taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  {showTaxBreakdown && (
                    <>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>CGST @ 9.0%:</span>
                        <span className="font-mono">₹{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>SGST @ 9.0%:</span>
                        <span className="font-mono">₹{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-base font-bold text-blue-950 pt-2 border-t-2 border-slate-300">
                    <span>Total Quoted Amount (All Inclusive):</span>
                    <span className="font-mono text-blue-900">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">
                    Includes 18% Works Contract GST, Freight, Transit Insurance & Labor
                  </div>
                </div>
              </div>

              {/* Project Milestone Payment Schedule (If enabled) */}
              {showMilestones && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 relative z-10 page-break-avoid">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Project Milestone Billing & Execution Schedule</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Linked to Project Phases ({currentProject?.projectNumber || 'Contract'})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    {projectMilestones.map((m) => {
                      const milestoneVal = Math.round((grandTotal * m.percentage) / 100);
                      return (
                        <div key={m.phase} className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-blue-700 text-[11px]">{m.phase}</span>
                            <span className="font-bold px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700">
                              {m.percentage}%
                            </span>
                          </div>
                          <div className="font-semibold text-slate-800 text-[11px] line-clamp-1">{m.title}</div>
                          <div className="font-mono font-bold text-slate-900 text-xs">
                            ₹{(milestoneVal / 100000).toFixed(2)} Lakhs
                          </div>
                          <div className="text-[9px] text-slate-500 leading-tight line-clamp-2">
                            {m.deliverable}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Terms & Conditions Section */}
              {showTerms && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5 relative z-10 page-break-avoid">
                  <div className="font-bold text-slate-800 uppercase text-[10px] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Commercial & Operational Terms:</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-0.5 leading-relaxed">
                    <li>Prices are inclusive of supply, transit insurance, unpacking, lifting, erection and commissioning at designated site.</li>
                    <li>Delivery Period: 4 to 6 weeks from receipt of technically clear Work Order and site readiness clearance.</li>
                    <li>Client Site Scope: Provision of continuous 415V 3-phase raw power, clean water tapping, and secure lockable storage at site.</li>
                    <li>Warranty: 12 months comprehensive warranty from date of handover; 5 years warranty on OEM Inverter Compressors.</li>
                    <li>Validity: This techno-commercial offer remains firm for 30 calendar days from the date of issue.</li>
                  </ol>
                </div>
              )}

              {/* Signatures & Client Acceptance Block */}
              {showSignatures && (
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 relative z-10 page-break-avoid">
                  <div className="space-y-12">
                    <div className="text-xs font-bold text-slate-800">
                      Client Acceptance & Formal Confirmation:
                    </div>
                    <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-500">
                      <div>Authorized Signatory & Corporate Stamp</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        For {currentQuote.companyName || currentQuote.clientName}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12 text-right">
                    <div className="text-xs font-bold text-blue-900">
                      For HVAC BIZ PRIVATE LIMITED:
                    </div>
                    <div className="border-t border-dashed border-slate-400 pt-1 text-[11px] text-slate-500">
                      <div className="font-semibold text-slate-700">
                        {currentProject?.projectManager || currentQuote.preparedBy || 'Vikramaditya Solanki'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Senior Project Manager & Head of Estimations
                      </div>
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
