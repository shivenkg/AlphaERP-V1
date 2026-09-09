import React, { useState, useRef, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  MessageSquare,
  Mail,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  Building2,
  ShieldCheck,
  MapPin,
  User,
  FileDown,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quote, QuoteStatus, Lead, InventoryItem, Project } from '../types';
import { storageService } from '../services/storageService';
import { CommunicationService } from '../services/whatsappEmailService';
import { downloadElementAsPDF, triggerDirectPrint } from '../utils/pdfExportHelper';
import { JSAlphaSoftLogo } from './JSAlphaSoftLogo';
import { DocumentHeader } from './common/DocumentHeader';
import { DocumentFooter } from './common/DocumentFooter';
import { PrintableDocumentTemplate } from './common/PrintableDocumentTemplate';
import { QuoteMarginSummaryPanel } from './QuoteMarginSummaryPanel';
import { QuotePrintPreviewModal } from './QuotePrintPreviewModal';
import { ClientQuotationDocumentModal } from './ClientQuotationDocumentModal';

interface QuotesViewProps {
  quotes: Quote[];
  leads: Lead[];
  inventory: InventoryItem[];
  projects?: Project[];
  onOpenNewQuote: () => void;
  onAwardQuote: (quote: Quote) => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({
  quotes,
  leads,
  inventory,
  projects = [],
  onOpenNewQuote,
  onAwardQuote
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState<Quote | null>(null);
  const [quoteForPrintModal, setQuoteForPrintModal] = useState<Quote | null>(null);

  // Client Quotation PDF Generation with Current Project Details
  const [isClientQuotationModalOpen, setIsClientQuotationModalOpen] = useState(false);
  const [clientQuotationQuote, setClientQuotationQuote] = useState<Quote | null>(null);
  const [clientQuotationProject, setClientQuotationProject] = useState<Project | null>(null);

  const [isExportingQuotePDF, setIsExportingQuotePDF] = useState(false);
  const [isExportingAllQuotesPDF, setIsExportingAllQuotesPDF] = useState(false);
  const [exportingQuoteId, setExportingQuoteId] = useState<string | null>(null);
  const quotePrintRef = useRef<HTMLDivElement>(null);
  const quotesLedgerPrintRef = useRef<HTMLDivElement>(null);

  // Derive active project pool
  const allAvailableProjects = useMemo(() => {
    if (projects && projects.length > 0) return projects;
    return storageService.getProjects() || [];
  }, [projects]);

  // Find linked or active project for a quote
  const getLinkedProjectForQuote = (targetQuote: Quote): Project | null => {
    return (
      allAvailableProjects.find(
        (p) =>
          p.quoteId === targetQuote.id ||
          targetQuote.convertedToProjectId === p.id ||
          (p.leadId && p.leadId === targetQuote.leadId) ||
          p.projectName.toLowerCase().includes((targetQuote.projectTitle || '').toLowerCase().substring(0, 15))
      ) ||
      allAvailableProjects[0] ||
      null
    );
  };

  const handleOpenClientQuotationModal = (quoteToUse?: Quote, projectToUse?: Project) => {
    const q = quoteToUse || selectedQuoteForPreview || quotes[0] || null;
    const p = projectToUse || (q ? getLinkedProjectForQuote(q) : allAvailableProjects[0] || null);
    setClientQuotationQuote(q);
    setClientQuotationProject(p);
    setIsClientQuotationModalOpen(true);
  };

  const handleDownloadPDF = async (quoteToExport?: Quote) => {
    const targetQuote = quoteToExport || selectedQuoteForPreview || quotes[0];
    if (!targetQuote) return;

    // Launch the Client Quotation Document generator for formatted output with project details
    handleOpenClientQuotationModal(targetQuote);
  };

  const handleExportQuotesLedgerPDF = async () => {
    if (!quotesLedgerPrintRef.current) return;
    setIsExportingAllQuotesPDF(true);
    try {
      await downloadElementAsPDF(quotesLedgerPrintRef.current, {
        filename: `AlphaERP_Quotes_Register_${new Date().toISOString().split('T')[0]}`,
        documentTitle: `AlphaERP - HVAC Techno-Commercial Quotes Register & Costing Schedule`
      });
    } finally {
      setIsExportingAllQuotesPDF(false);
    }
  };

  const handlePrintQuote = () => {
    if (!selectedQuoteForPreview) return;
    triggerDirectPrint(quotePrintRef.current, `AlphaERP_Quotation_${selectedQuoteForPreview.quoteNumber}`);
  };

  const term = (search || '').trim().toLowerCase();
  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      !term ||
      (q.quoteNumber || '').toLowerCase().includes(term) ||
      (q.clientName || '').toLowerCase().includes(term) ||
      (q.companyName || '').toLowerCase().includes(term) ||
      (q.projectTitle || '').toLowerCase().includes(term);

    const matchesStatus = selectedStatus === 'ALL' || q.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleShareWhatsApp = (quote: Quote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const lead = leads.find((l) => l.id === quote.leadId);
    const phone = lead?.phone || '+91 98201 55678';
    const { message } = CommunicationService.getQuotationTemplate(quote);
    const url = CommunicationService.getWhatsAppUrl(phone, message);
    if (lead) storageService.logLeadCommunication(lead.id, 'WhatsApp', `Transmitted formal quotation ${quote.quoteNumber}`);
    window.open(url, '_blank');
  };

  const handleShareEmail = (quote: Quote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const lead = leads.find((l) => l.id === quote.leadId);
    const email = lead?.email || 'client@company.com';
    const { subject, message } = CommunicationService.getQuotationTemplate(quote);
    const url = CommunicationService.getMailtoUrl(email, subject, message);
    if (lead) storageService.logLeadCommunication(lead.id, 'Email', `Sent quotation email ${quote.quoteNumber}`);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">HVAC Quotations & Margin Engineering</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {filteredQuotes.length} Quotes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed techno-commercial estimates with categorized equipment, ducting, piping, labor, and gross margin analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Primary PDF Generation Button for QuotesView using current project details */}
          <button
            id="btn-generate-client-quote-pdf"
            onClick={() => handleOpenClientQuotationModal()}
            disabled={filteredQuotes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Generate formatted quotation document for clients using current project details"
          >
            <FileDown className="w-4 h-4 text-blue-200" />
            <span>Generate Client Quotation PDF</span>
          </button>

          {/* Dedicated Export to PDF Action Button for Quotes Ledger */}
          <button
            onClick={handleExportQuotesLedgerPDF}
            disabled={isExportingAllQuotesPDF || filteredQuotes.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            title="Export all filtered quotations as a comprehensive PDF register"
          >
            {isExportingAllQuotesPDF ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting Ledger...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Ledger PDF</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenNewQuote}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create HVAC Quote</span>
          </button>
        </div>
      </div>

      {/* Technocommercial BOQ Cost & Margin Summary Panel */}
      <QuoteMarginSummaryPanel
        quotes={filteredQuotes}
        onSelectQuote={(quote) => setSelectedQuoteForPreview(quote)}
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 text-xs shadow-sm">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quote #, company, title..."
            className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <span>Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Approved">Approved</option>
            <option value="Awarded">Awarded (Won)</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Quotes Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredQuotes.map((quote) => {
          const statusColors: Record<QuoteStatus, string> = {
            Draft: 'bg-slate-100 text-slate-700 border-slate-200',
            Sent: 'bg-blue-50 text-blue-700 border-blue-200',
            Approved: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            Awarded: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
            Expired: 'bg-slate-100 text-slate-600 border-slate-200'
          };

          return (
            <div
              key={quote.id}
              onClick={() => setSelectedQuoteForPreview(quote)}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{quote.quoteNumber}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusColors[quote.status]}`}>
                      {quote.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{quote.projectTitle}</h3>
                  <div className="text-xs text-slate-500">{quote.companyName} • {quote.clientName}</div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-emerald-600">
                    ₹{(quote.totalAmount / 100000).toFixed(2)} L
                  </div>
                  <div className="text-[11px] text-slate-400">
                    incl. 18% GST (₹{(quote.taxAmount / 1000).toFixed(0)}k)
                  </div>
                </div>
              </div>

              {/* Cost & Margin Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">BOQ Raw Cost</div>
                  <div className="font-semibold text-slate-800 font-mono">₹{(quote.totalCost / 100000).toFixed(2)} L</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Quoted Price (Net)</div>
                  <div className="font-semibold text-slate-900 font-mono">
                    ₹{(((quote.subtotal || quote.totalAmount / 1.18) - (quote.discountAmount || 0)) / 100000).toFixed(2)} L
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Est. Gross Profit</div>
                  <div className="font-semibold text-emerald-600 font-mono">₹{(quote.grossMarginAmount / 100000).toFixed(2)} L</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Estimated Margin</div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`font-bold font-mono px-1.5 py-0.5 rounded text-[11px] ${
                        quote.grossMarginPct >= 20
                          ? 'bg-emerald-100 text-emerald-800'
                          : quote.grossMarginPct >= 15
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {quote.grossMarginPct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items Summary */}
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>{quote.items.length} Scope Line Items ({quote.items.filter((i) => i.category === 'Equipment').length} Equipment Units)</span>
                <span className="font-medium text-slate-400">Valid Until: {quote.validUntil}</span>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenClientQuotationModal(quote);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                    title="Generate formatted quotation document for clients with current project details"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Client Quote PDF</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuoteForPrintModal(quote);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                    title="Open Print Layout Formatter"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={(e) => handleShareWhatsApp(quote, e)}
                    className="p-2 bg-slate-50 hover:bg-emerald-50 text-emerald-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    title="Share via WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleShareEmail(quote, e)}
                    className="p-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    title="Send Email Proposal"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQuoteForPreview(quote);
                    }}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    title="View Document Details"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>

                {quote.status !== 'Awarded' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAwardQuote(quote);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Award & Convert</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Project Active</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Print Preview & Layout Formatter Modal */}
      {quoteForPrintModal && (
        <QuotePrintPreviewModal
          quote={quoteForPrintModal}
          lead={leads.find((l) => l.id === quoteForPrintModal.leadId)}
          onClose={() => setQuoteForPrintModal(null)}
          onAwardQuote={(q) => {
            onAwardQuote(q);
            setQuoteForPrintModal(null);
          }}
          onShareWhatsApp={() => handleShareWhatsApp(quoteForPrintModal)}
          onShareEmail={() => handleShareEmail(quoteForPrintModal)}
        />
      )}

      {/* Formatted Client Quotation Document & PDF Generator Modal */}
      {isClientQuotationModalOpen && clientQuotationQuote && (
        <ClientQuotationDocumentModal
          isOpen={isClientQuotationModalOpen}
          quote={clientQuotationQuote}
          project={clientQuotationProject || getLinkedProjectForQuote(clientQuotationQuote)}
          allProjects={allAvailableProjects}
          allQuotes={quotes}
          leads={leads}
          onClose={() => setIsClientQuotationModalOpen(false)}
          onSelectQuote={(q) => {
            setClientQuotationQuote(q);
            setClientQuotationProject(getLinkedProjectForQuote(q));
          }}
          onSelectProject={(p) => setClientQuotationProject(p)}
          onAwardQuote={(q) => {
            onAwardQuote(q);
            setIsClientQuotationModalOpen(false);
          }}
          onShareWhatsApp={() => handleShareWhatsApp(clientQuotationQuote)}
          onShareEmail={() => handleShareEmail(clientQuotationQuote)}
        />
      )}

      {/* Quote Detail / Standard Printable Document Modal */}
      {selectedQuoteForPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print-container">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 space-y-6 print-document animate-in fade-in zoom-in-95 duration-150">
            <PrintableDocumentTemplate
              quote={selectedQuoteForPreview}
              lead={leads.find((l) => l.id === selectedQuoteForPreview.leadId)}
              onClose={() => setSelectedQuoteForPreview(null)}
              onAwardQuote={(q) => {
                onAwardQuote(q);
                setSelectedQuoteForPreview(null);
              }}
              onShareWhatsApp={() => handleShareWhatsApp(selectedQuoteForPreview)}
              onShareEmail={() => handleShareEmail(selectedQuoteForPreview)}
              showToolbar={true}
            />
          </div>
        </div>
      )}

      {/* Off-screen Quotes Register for handleExportQuotesLedgerPDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
        <div ref={quotesLedgerPrintRef} className="bg-white text-slate-900 p-8 w-[1000px] space-y-6 font-sans">
          <div className="flex items-center justify-between border-b pb-4 border-slate-200">
            <div>
              <div className="text-lg font-black text-slate-900">HVAC BIZ PRIVATE LIMITED</div>
              <div className="text-xs text-slate-500 font-mono">HVAC Techno-Commercial Quotations & Project Costing Register</div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
              <div>Filtered Records: {filteredQuotes.length}</div>
            </div>
          </div>

          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
              <tr>
                <th className="p-2 border border-slate-200">Quote #</th>
                <th className="p-2 border border-slate-200">Client Organization</th>
                <th className="p-2 border border-slate-200">Project / Scope</th>
                <th className="p-2 border border-slate-200">Date</th>
                <th className="p-2 border border-slate-200 text-right">Selling Price (₹)</th>
                <th className="p-2 border border-slate-200 text-right">BOQ Cost (₹)</th>
                <th className="p-2 border border-slate-200 text-right">Gross Margin</th>
                <th className="p-2 border border-slate-200 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredQuotes.map((q) => (
                <tr key={q.id}>
                  <td className="p-2 border border-slate-200 font-mono font-bold text-blue-900">{q.quoteNumber}</td>
                  <td className="p-2 border border-slate-200 font-semibold">{q.companyName || q.clientName}</td>
                  <td className="p-2 border border-slate-200 text-slate-600">{q.projectTitle}</td>
                  <td className="p-2 border border-slate-200">{q.date}</td>
                  <td className="p-2 border border-slate-200 text-right font-mono font-bold">₹{q.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="p-2 border border-slate-200 text-right font-mono text-slate-600">₹{q.totalCost.toLocaleString('en-IN')}</td>
                  <td className="p-2 border border-slate-200 text-right font-mono font-bold text-emerald-700">{q.grossMarginPct.toFixed(1)}%</td>
                  <td className="p-2 border border-slate-200 text-center font-semibold">{q.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
