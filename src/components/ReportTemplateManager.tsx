import React, { useState, useEffect, useRef } from 'react';
import {
  FileSignature,
  FileText,
  ShoppingCart,
  Receipt,
  Wrench,
  Save,
  RotateCcw,
  Copy,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  Building2,
  ShieldCheck,
  CreditCard,
  Palette,
  Sliders,
  Maximize2,
  Minimize2,
  Check,
  ZoomIn,
  ZoomOut,
  X,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Truck,
  User,
  Clock,
  Briefcase
} from 'lucide-react';
import { ReportTemplateConfig, ReportType, SystemSettings, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { DocumentHeader } from './common/DocumentHeader';
import { DocumentFooter } from './common/DocumentFooter';
import { downloadElementAsPDF, triggerDirectPrint } from '../utils/pdfExportHelper';

interface ReportTemplateManagerProps {
  currentUser: UserProfile;
}

const REPORT_TABS: { id: ReportType; label: string; icon: React.FC<{ className?: string }>; description: string }[] = [
  {
    id: 'invoice',
    label: 'Tax Invoice',
    icon: Receipt,
    description: 'Commercial Tax Invoices & Project Handover Completion Bills'
  },
  {
    id: 'po',
    label: 'Purchase Order (PO)',
    icon: ShoppingCart,
    description: 'Authorized Vendor Procurement Orders & Equipment Agreements'
  },
  {
    id: 'pr',
    label: 'Purchase Requisition (PR)',
    icon: FileText,
    description: 'Internal Site Engineering Material Indents & Requisitions'
  },
  {
    id: 'quotation',
    label: 'Techno-Commercial Quote',
    icon: FileSignature,
    description: 'Client Estimates, HVAC Technical Proposals & Contract Bids'
  },
  {
    id: 'workorder',
    label: 'Work Order',
    icon: Wrench,
    description: 'Field Service Tickets & Preventive Maintenance Logs'
  }
];

const PRESET_COLORS = [
  { label: 'Sapphire Blue', hex: '#0066E0' },
  { label: 'Emerald Green', hex: '#059669' },
  { label: 'Royal Indigo', hex: '#4F46E5' },
  { label: 'Ruby Red', hex: '#DC2626' },
  { label: 'Corporate Slate', hex: '#0F172A' },
  { label: 'Amber Gold', hex: '#D97706' },
  { label: 'Teal Cyan', hex: '#0D9488' }
];

export const ReportTemplateManager: React.FC<ReportTemplateManagerProps> = ({ currentUser }) => {
  const [activeReportType, setActiveReportType] = useState<ReportType>('invoice');
  const [settings, setSettings] = useState<SystemSettings>(storageService.getSystemSettings());
  const [template, setTemplate] = useState<ReportTemplateConfig>(storageService.getReportTemplate('invoice'));
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [newTermText, setNewTermText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);
  const [modalZoom, setModalZoom] = useState<number>(100);

  const previewDocumentRef = useRef<HTMLDivElement>(null);
  const liveModalPreviewRef = useRef<HTMLDivElement>(null);

  // Sync when active report type or settings change
  useEffect(() => {
    const tpl = storageService.getReportTemplate(activeReportType);
    setTemplate(JSON.parse(JSON.stringify(tpl)));
  }, [activeReportType]);

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setSettings(storageService.getSystemSettings());
    });
    return () => unsubscribe();
  }, []);

  const handleSave = () => {
    try {
      storageService.updateReportTemplate(activeReportType, template);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message || 'Error saving report template');
    }
  };

  const handleResetTemplate = () => {
    if (window.confirm(`Reset template for "${template.name}" back to factory defaults?`)) {
      const reset = storageService.resetReportTemplate(activeReportType);
      setTemplate(JSON.parse(JSON.stringify(reset)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleCopyBrandingToAll = () => {
    if (
      window.confirm(
        `Apply current branding (Company details, Logo style, Accent color, Address & Contacts) from "${template.name}" to ALL report templates (Invoice, PO, PR, Quotation, Work Order)?`
      )
    ) {
      storageService.updateReportTemplate(activeReportType, template);
      storageService.copyBrandingToAllTemplates(activeReportType);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3500);
    }
  };

  const handleAddTerm = () => {
    if (!newTermText.trim()) return;
    setTemplate({
      ...template,
      footer: {
        ...template.footer,
        termsAndConditions: [...(template.footer.termsAndConditions || []), newTermText.trim()]
      }
    });
    setNewTermText('');
  };

  const handleRemoveTerm = (index: number) => {
    const list = [...(template.footer.termsAndConditions || [])];
    list.splice(index, 1);
    setTemplate({
      ...template,
      footer: {
        ...template.footer,
        termsAndConditions: list
      }
    });
  };

  const handleMoveTerm = (index: number, direction: 'up' | 'down') => {
    const list = [...(template.footer.termsAndConditions || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setTemplate({
      ...template,
      footer: {
        ...template.footer,
        termsAndConditions: list
      }
    });
  };

  const handleTestPrint = () => {
    window.print();
  };

  const handleTestPDF = async () => {
    if (!previewDocumentRef.current) return;
    setIsExportingPDF(true);
    try {
      await downloadElementAsPDF(previewDocumentRef.current, {
        filename: `${template.id.toUpperCase()}_Template_Preview_${new Date().toISOString().split('T')[0]}.pdf`,
        documentTitle: template.header.documentTitle,
        orientation: 'portrait',
        marginMm: 8
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleLiveModalExportPDF = async () => {
    const targetEl = liveModalPreviewRef.current || previewDocumentRef.current;
    if (!targetEl) return;
    setIsExportingPDF(true);
    try {
      await downloadElementAsPDF(targetEl, {
        filename: `${template.id.toUpperCase()}_Live_Sample_${new Date().toISOString().split('T')[0]}.pdf`,
        documentTitle: `${template.header.documentTitle} - Live Sample Preview`,
        orientation: 'portrait',
        marginMm: 8
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Sample data generation based on active report type for realistic preview
  const getSampleLineItems = () => {
    switch (activeReportType) {
      case 'invoice':
        return [
          {
            desc: 'Turnkey Centralized VRF Air Conditioning System - High Efficiency Inverter Outdoor Units (28 HP)',
            sku: 'VRF-ODU-28HP',
            qty: 2,
            unit: 'Sets',
            rate: 685000,
            amount: 1370000
          },
          {
            desc: 'Concealed Duct Indoor Units (3.2 TR, High Static 120 Pa) with Corded Remote Controllers',
            sku: 'VRF-IDU-CD32',
            qty: 8,
            unit: 'Nos',
            rate: 42500,
            amount: 340000
          },
          {
            desc: 'Class-0 Nitrile Insulated Hard Drawn Copper Piping with Aeroflex Protection (Factory Tested)',
            sku: 'COP-PIPE-LOT',
            qty: 1,
            unit: 'Lot',
            rate: 185000,
            amount: 185000
          },
          {
            desc: 'Nitrogen Pressure Testing at 550 PSI, Vacuum Dehydration (500 Microns) & Commissioning Handover',
            sku: 'SRV-TEST-COMM',
            qty: 1,
            unit: 'Job',
            rate: 95000,
            amount: 95000
          }
        ];
      case 'po':
        return [
          {
            desc: 'Daikin Commercial VRV X-Series Variable Speed Compressor ODU (32 HP)',
            sku: 'DK-VRV-32HP',
            qty: 2,
            unit: 'Sets',
            rate: 590000,
            amount: 1180000
          },
          {
            desc: 'Refnet Joint Y-Shape Branch Piping Headers (Gas & Liquid Lines)',
            sku: 'RF-BR-HDR12',
            qty: 14,
            unit: 'Pairs',
            rate: 4800,
            amount: 67200
          },
          {
            desc: 'Zinc-Coated Factory Galvanized GI Sheet Coils 22 Gauge (Tata Steel)',
            sku: 'GI-COIL-22G',
            qty: 1800,
            unit: 'Kg',
            rate: 92,
            amount: 165600
          }
        ];
      case 'pr':
        return [
          {
            desc: 'Honeywell 2-Way Modulating Pressure Independent Control Valves (PICV 50mm)',
            sku: 'HW-PICV-50',
            qty: 6,
            unit: 'Nos',
            rate: 22000,
            amount: 132000
          },
          {
            desc: 'Armstrong Flexible Braided Stainless Steel Pump Connectors (Flanged 100mm)',
            sku: 'ARM-FLEX-100',
            qty: 8,
            unit: 'Nos',
            rate: 6500,
            amount: 52000
          },
          {
            desc: 'Honeywell Programmable Digital BACnet DDC Room Thermostats',
            sku: 'HW-BAC-TS9',
            qty: 16,
            unit: 'Units',
            rate: 4200,
            amount: 67200
          }
        ];
      case 'workorder':
        return [
          {
            desc: 'Quarterly Preventive Maintenance of Central Chiller Plant #1 & Evaporator Coil Sanitization',
            sku: 'PM-CHILLER-QTR',
            qty: 1,
            unit: 'Job',
            rate: 35000,
            amount: 35000
          },
          {
            desc: 'Refrigerant R-410A Top-up & High-Pressure Leak Detection Scan',
            sku: 'REF-R410A-CAN',
            qty: 4,
            unit: 'Kg',
            rate: 1800,
            amount: 7200
          },
          {
            desc: 'V-Belt Replacement for AHU Supply Air Blower Motor & Alignment',
            sku: 'BLT-B52-SET',
            qty: 2,
            unit: 'Sets',
            rate: 2400,
            amount: 4800
          }
        ];
      default: // quotation
        return [
          {
            desc: 'Design, Engineering & Supply of Precision Screw Water-Cooled Chiller (150 TR, Eco R-134a)',
            sku: 'CHL-SCREW-150',
            qty: 1,
            unit: 'Unit',
            rate: 2450000,
            amount: 2450000
          },
          {
            desc: 'Factory Fabricated Low Leakage GSS Rectangular Ductwork with Acoustic Liner & Volume Dampers',
            sku: 'DCT-GSS-HVAC',
            qty: 650,
            unit: 'Sq.M',
            rate: 1250,
            amount: 812500
          },
          {
            desc: 'Chilled Water Heavy Duty Seamless Mild Steel Class C Piping with Polyurethane Foam Insulation',
            sku: 'PIP-MS-CHW',
            qty: 180,
            unit: 'R.Mtr',
            rate: 3200,
            amount: 576000
          },
          {
            desc: 'Testing, Air Balancing, Thermal Imaging Scan & Certified Handover to Project Consultant',
            sku: 'TAB-COMM-DOC',
            qty: 1,
            unit: 'Job',
            rate: 160000,
            amount: 160000
          }
        ];
    }
  };

  const sampleItems = getSampleLineItems();
  const subtotal = sampleItems.reduce((acc, curr) => acc + curr.amount, 0);
  const gstRate = settings.defaultGstRate || 18;
  const gstAmount = (subtotal * gstRate) / 100;
  const grandTotal = subtotal + gstAmount;

  return (
    <div className="space-y-6">
      {/* Header & Sub-Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/25">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Report & Document Template Manager
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200">
                Brand Customizer
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Define custom headers, footers, corporate letterheads, and statutory terms for each report type to ensure unified enterprise branding across all PDF exports and printouts.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Template Saved!
            </span>
          )}

          {copySuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 animate-in fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              Branding Applied to All!
            </span>
          )}

          <button
            onClick={handleCopyBrandingToAll}
            title="Apply this template's company details, logo styling, and contact info to all other report types"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Branding to All</span>
          </button>

          <button
            onClick={handleResetTemplate}
            title="Reset current template to factory default"
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => setShowLivePreviewModal(true)}
            title="Open interactive Live Preview modal to review and test sample PDF with current unsaved changes"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Live Preview</span>
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Template</span>
          </button>
        </div>
      </div>

      {/* Report Types Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportType(tab.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-indigo-600 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                  : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                )}
              </div>
              <div className="mt-2.5">
                <div className={`text-xs font-black ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {tab.label}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* View Mode Toolbar */}
      <div className="flex items-center justify-between bg-slate-100/80 p-2 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold px-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Configuring: <strong className="text-slate-900 uppercase">{template.name}</strong></span>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'editor' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Editor Only
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'split' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Live Preview
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* LEFT / MAIN CONFIGURATION PANEL */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div className={`space-y-6 ${viewMode === 'split' ? 'xl:col-span-6' : 'w-full'}`}>
            
            {/* SECTION 1: HEADER & CORPORATE LETTERHEAD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      1. Header & Corporate Letterhead
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Title, division subtitle, logo placement and registration badges
                    </p>
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: template.header.accentColor }} />
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Document Title Heading *
                  </label>
                  <input
                    type="text"
                    value={template.header.documentTitle}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        header: { ...template.header, documentTitle: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Document Subtitle
                  </label>
                  <input
                    type="text"
                    value={template.header.documentSubtitle}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        header: { ...template.header, documentSubtitle: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Division Name & Accent Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Division / Department Tag
                  </label>
                  <input
                    type="text"
                    value={template.header.divisionName || ''}
                    placeholder="e.g. HVAC & MEP Engineering Division"
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        header: { ...template.header, divisionName: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Accent Theme Color</span>
                    <span className="font-mono text-[10px] text-slate-500">{template.header.accentColor}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() =>
                            setTemplate({
                              ...template,
                              header: { ...template.header, accentColor: c.hex }
                            })
                          }
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                          className={`w-6 h-6 rounded-lg transition-transform cursor-pointer shrink-0 ${
                            template.header.accentColor === c.hex ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={template.header.accentColor}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          header: { ...template.header, accentColor: e.target.value }
                        })
                      }
                      className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer shrink-0 p-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Presentation Style */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Header & Logo Alignment Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setTemplate({
                        ...template,
                        header: { ...template.header, logoStyle: 'left_brand' }
                      })
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      template.header.logoStyle === 'left_brand'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🏢 Left Logo + Right Meta Box
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setTemplate({
                        ...template,
                        header: { ...template.header, logoStyle: 'center_brand' }
                      })
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      template.header.logoStyle === 'center_brand'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🏛️ Centered Corporate Letterhead
                  </button>
                </div>
              </div>

              {/* Registration Badges & Info Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Show Legal & Statutory Registration Badges:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={template.header.showGstin}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          header: { ...template.header, showGstin: e.target.checked }
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-800">GSTIN ({settings.gstin || '27AABCA1299K1Z4'})</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={template.header.showPan}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          header: { ...template.header, showPan: e.target.checked }
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-800">Corporate PAN</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={template.header.showCin}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          header: { ...template.header, showCin: e.target.checked }
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-800">Corporate CIN</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={template.header.showIsoCert}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          header: { ...template.header, showIsoCert: e.target.checked }
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-800">ISO 9001:2015</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={template.header.showSacCode}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          header: { ...template.header, showSacCode: e.target.checked }
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-800">SAC / HSN Code</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={template.header.showContactInfo}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          header: { ...template.header, showContactInfo: e.target.checked }
                        })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-800">Phone & Email</span>
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 2: TERMS, CONDITIONS & BANK REMITTANCE */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    2. Terms, Conditions & Bank Remittance
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Commercial clauses, special notes, and bank payment instructions
                  </p>
                </div>
              </div>

              {/* Terms Heading */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Terms & Conditions Section Heading
                </label>
                <input
                  type="text"
                  value={template.footer.termsHeading}
                  onChange={(e) =>
                    setTemplate({
                      ...template,
                      footer: { ...template.footer, termsHeading: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Terms List Manager */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Bullet Points & Clauses ({template.footer.termsAndConditions?.length || 0})
                </label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {template.footer.termsAndConditions?.map((term, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs"
                    >
                      <span className="w-5 text-center font-mono text-[10px] text-slate-400 font-bold">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={term}
                        onChange={(e) => {
                          const updated = [...(template.footer.termsAndConditions || [])];
                          updated[idx] = e.target.value;
                          setTemplate({
                            ...template,
                            footer: { ...template.footer, termsAndConditions: updated }
                          });
                        }}
                        className="flex-1 bg-transparent border-none text-xs text-slate-800 focus:outline-none focus:bg-white px-1.5 py-0.5 rounded font-medium"
                      />
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveTerm(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTerm(idx, 'down')}
                          disabled={idx === (template.footer.termsAndConditions?.length || 0) - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveTerm(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Term Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add a new commercial clause or statutory term..."
                    value={newTermText}
                    onChange={(e) => setNewTermText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTerm();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTerm}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Clause</span>
                  </button>
                </div>
              </div>

              {/* Special Dispatch / Site Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Default Special Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  value={template.footer.customNotes || ''}
                  onChange={(e) =>
                    setTemplate({
                      ...template,
                      footer: { ...template.footer, customNotes: e.target.value }
                    })
                  }
                  placeholder="e.g. Please quote document number on all remittance vouchers..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Bank Remittance Instructions Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Include Bank Remittance Details</div>
                      <div className="text-[10px] text-slate-500">
                        Prints corporate current account, IFSC, and UPI for electronic payments
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={template.footer.showBankDetails}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        footer: { ...template.footer, showBankDetails: e.target.checked }
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </label>

                {template.footer.showBankDetails && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <input
                      type="text"
                      placeholder="Custom bank remittance instruction text..."
                      value={template.footer.customBankInstructions || ''}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          footer: { ...template.footer, customBankInstructions: e.target.value }
                        })
                      }
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Declaration & Warranty Clause */}
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Statutory Declaration & Compliance Text
                  </div>
                  <input
                    type="checkbox"
                    checked={template.footer.showDeclaration}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        footer: { ...template.footer, showDeclaration: e.target.checked }
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
                {template.footer.showDeclaration && (
                  <textarea
                    rows={2}
                    value={template.footer.declarationText}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        footer: { ...template.footer, declarationText: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            </div>

            {/* SECTION 3: SIGNATORIES & AUTHORIZATION BLOCKS */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    3. Signatures & Authorization Blocks
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Designate primary and secondary authorized sign-off titles
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Signatory */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    Primary Signatory (Company)
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Title / Designation</label>
                    <input
                      type="text"
                      value={template.footer.primarySignatoryTitle}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          footer: { ...template.footer, primarySignatoryTitle: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Department / Subtitle</label>
                    <input
                      type="text"
                      value={template.footer.primarySignatorySubtitle}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          footer: { ...template.footer, primarySignatorySubtitle: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                    />
                  </div>
                </div>

                {/* Secondary Signatory */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    Secondary Signatory (Client / Counterparty)
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Title / Designation</label>
                    <input
                      type="text"
                      value={template.footer.secondarySignatoryTitle || ''}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          footer: { ...template.footer, secondarySignatoryTitle: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Department / Subtitle</label>
                    <input
                      type="text"
                      value={template.footer.secondarySignatorySubtitle || ''}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          footer: { ...template.footer, secondarySignatorySubtitle: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Digital Seal & Footnote */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={template.footer.showDigitalSeal}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        footer: { ...template.footer, showDigitalSeal: e.target.checked }
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Show Digital Seal Badge</div>
                    <div className="text-[10px] text-slate-500">Prints 'AlphaERP Digitally Verified' badge</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={template.footer.showPageNumbers}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        footer: { ...template.footer, showPageNumbers: e.target.checked }
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Print Page Numbers</div>
                    <div className="text-[10px] text-slate-500">e.g. Page 1 of 1</div>
                  </div>
                </label>
              </div>

              {/* Confidentiality Notice */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confidentiality Footnote
                </label>
                <input
                  type="text"
                  value={template.footer.confidentialityNotice}
                  onChange={(e) =>
                    setTemplate({
                      ...template,
                      footer: { ...template.footer, confidentialityNotice: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* SECTION 4: WATERMARK & PRESENTATION */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    4. Watermark & Document Density
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Watermark text overlays and document spacing
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Document Watermark Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DRAFT, CONFIDENTIAL, ORIGINAL, or leave empty"
                    value={template.styling.watermarkText || ''}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        styling: { ...template.styling, watermarkText: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Document Density
                  </label>
                  <select
                    value={template.styling.layoutDensity}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        styling: { ...template.styling, layoutDensity: e.target.value as any }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="compact">Compact (Dense line items)</option>
                    <option value="standard">Standard (Balanced enterprise spacing)</option>
                    <option value="spacious">Spacious (Executive presentation)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* RIGHT / LIVE DOCUMENT PREVIEW PANE */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className={`space-y-4 ${viewMode === 'split' ? 'xl:col-span-6' : 'w-full'}`}>
            <div className="bg-slate-900 text-white rounded-3xl p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">Live Document Preview</div>
                  <div className="text-[11px] text-slate-400">
                    Real-time WYSIWYG render of custom header and footer
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLivePreviewModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-indigo-400/30"
                  title="Open full interactive live preview modal"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Preview</span>
                </button>

                <button
                  onClick={handleTestPrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Print test document"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  onClick={handleTestPDF}
                  disabled={isExportingPDF}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                  title="Download test PDF file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingPDF ? 'Exporting...' : 'Export PDF'}</span>
                </button>
              </div>
            </div>

            {/* Simulated Sheet Paper */}
            <div className="bg-slate-200/80 p-3 sm:p-5 rounded-3xl border border-slate-300 shadow-inner overflow-x-auto">
              <div
                ref={previewDocumentRef}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-5 font-sans relative min-w-[500px]"
              >
                {/* Watermark Overlay (If Enabled) */}
                {template.styling.watermarkText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                    <div className="text-6xl sm:text-7xl font-black text-slate-900/5 -rotate-45 tracking-widest uppercase">
                      {template.styling.watermarkText}
                    </div>
                  </div>
                )}

                <div className="relative z-10 space-y-5">
                  {/* Dynamic Document Header */}
                  <DocumentHeader
                    headerConfig={template.header}
                    stylingConfig={template.styling}
                    settings={settings}
                    documentNumber={
                      activeReportType === 'invoice'
                        ? 'INV-2026-0042'
                        : activeReportType === 'po'
                        ? 'PO-2026-0189'
                        : activeReportType === 'pr'
                        ? 'PR-2026-0083'
                        : activeReportType === 'workorder'
                        ? 'WO-2026-0051'
                        : 'QT-2026-0012'
                    }
                    documentDate={new Date().toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                    secondaryDateLabel={
                      activeReportType === 'invoice'
                        ? 'Due Date'
                        : activeReportType === 'po'
                        ? 'Delivery Due'
                        : activeReportType === 'pr'
                        ? 'Required By'
                        : 'Offer Validity'
                    }
                    secondaryDateValue={
                      activeReportType === 'invoice'
                        ? '15-Oct-2026'
                        : activeReportType === 'po'
                        ? '28-Sep-2026'
                        : activeReportType === 'pr'
                        ? '20-Sep-2026'
                        : '30 Days'
                    }
                    projectRef="PRJ-2026-0001 (Mumbai Corporate Hub HVAC)"
                    statusBadge={{
                      text:
                        activeReportType === 'invoice'
                          ? 'Commercial Billed'
                          : activeReportType === 'po'
                          ? 'Approved & Issued'
                          : activeReportType === 'pr'
                          ? 'Engineering Approved'
                          : 'Official Proposal',
                      colorClass: 'bg-emerald-100 text-emerald-800'
                    }}
                  />

                  {/* Standardized Structured Report Detail Block */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 text-xs shadow-xs relative overflow-hidden"
                    style={{ borderTop: `3px solid ${template.header.accentColor || '#0066E0'}` }}
                  >
                    {/* Column 1: Organization / Counterparty Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                        {activeReportType === 'po' ? (
                          <>
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Authorized Supplier / Vendor:</span>
                          </>
                        ) : activeReportType === 'pr' ? (
                          <>
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <span>Indent Requisitioning Officer:</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Billed Organization / Client:</span>
                          </>
                        )}
                      </div>

                      <div>
                        <div className="font-black text-slate-900 text-sm tracking-tight">
                          {activeReportType === 'po'
                            ? 'Daikin Airconditioning India Pvt Ltd'
                            : activeReportType === 'pr'
                            ? 'Er. Rahul Verma (HVAC Site In-charge)'
                            : 'Godrej Tech Park Commercial Towers'}
                        </div>
                        <div className="text-slate-600 text-[11px] font-medium mt-0.5">
                          {activeReportType === 'po'
                            ? 'Attn: Commercial OEM Sourcing Lead • SCM Division'
                            : activeReportType === 'pr'
                            ? 'Site Engineering & Technical Maintenance Team'
                            : 'Attn: Mr. Vikram Shah (VP Infrastructure & Facilities)'}
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Plot 42, Andheri-Kurla Industrial Corridor, Mumbai 400093</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500">
                          <span>
                            <strong>GSTIN:</strong> 27AABCA9911D1Z2
                          </span>
                          <span>•</span>
                          <span>
                            <strong>PAN:</strong> AABCA9911D
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Engineering Scope & Project Specifications */}
                    <div className="space-y-2 md:border-l md:border-slate-200 md:pl-4">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                        <span>HVAC Project Scope & Contract Ref:</span>
                      </div>

                      <div>
                        <div className="font-black text-slate-900 text-sm tracking-tight">
                          Turnkey VRF Air Conditioning & Chiller Commissioning
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                          Project ID: <span className="font-mono font-bold text-slate-800">PRJ-2026-0001</span> • Phase 2 Fitout
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery / Validity</span>
                          <span className="font-semibold text-slate-800">
                            {activeReportType === 'invoice'
                              ? 'Net 15 Days'
                              : activeReportType === 'po'
                              ? 'Ex-Factory 3 Weeks'
                              : activeReportType === 'pr'
                              ? 'Urgent Site Indent'
                              : '30 Days from Issue'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Billing Currency</span>
                          <span className="font-semibold text-slate-800 font-mono">INR (₹) Indian Rupee</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sample Line Items Table */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      Itemized Scope & Technical Quantities:
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                          <tr>
                            <th className="py-2 px-3 w-8 text-center">#</th>
                            <th className="py-2 px-3">Description & Technical Specs</th>
                            <th className="py-2 px-3 text-center w-14">Qty</th>
                            <th className="py-2 px-3 text-center w-14">Unit</th>
                            <th className="py-2 px-3 text-right w-24">Rate (₹)</th>
                            <th className="py-2 px-3 text-right w-28">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sampleItems.map((item, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="py-2 px-3 text-center font-mono text-slate-400 text-[10px]">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3 text-slate-900">
                                <div className="font-semibold text-xs">{item.desc}</div>
                                <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-slate-800">{item.qty}</td>
                              <td className="py-2 px-3 text-center text-slate-600 text-[11px]">{item.unit}</td>
                              <td className="py-2 px-3 text-right font-mono text-slate-700">
                                ₹{item.rate.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                ₹{item.amount.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Subtotal & Taxes Summary Box */}
                  <div className="flex justify-end">
                    <div className="w-72 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span className="font-mono font-semibold text-slate-900">
                          ₹{subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>GST ({gstRate}%):</span>
                        <span className="font-mono font-semibold text-slate-900">
                          ₹{gstAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-300 flex justify-between items-center text-slate-900 font-bold">
                        <span>Grand Total:</span>
                        <span
                          className="font-mono text-sm font-black"
                          style={{ color: template.header.accentColor }}
                        >
                          ₹{grandTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Document Footer */}
                  <DocumentFooter
                    footerConfig={template.footer}
                    stylingConfig={template.styling}
                    settings={settings}
                    clientOrVendorName={
                      activeReportType === 'po'
                        ? 'Daikin Airconditioning India Pvt Ltd'
                        : 'Godrej Tech Park Commercial Towers'
                    }
                    signedAtDate={new Date().toLocaleDateString('en-IN')}
                    pageNumber={1}
                    totalPages={1}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* FULL-SCREEN LIVE PREVIEW MODAL */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-start p-2 sm:p-4 animate-in fade-in duration-150">
          {/* Top Floating Control Bar */}
          <div className="sticky top-2 z-20 w-full max-w-5xl bg-slate-900/95 text-white border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-md"
                style={{ backgroundColor: template.header.accentColor || '#0066E0' }}
              >
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                    Live PDF Preview: {template.header.documentTitle}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-400/30 uppercase">
                    {template.name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rendering in-memory configured header & footer settings before saving</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
                <button
                  onClick={() => setModalZoom((z) => Math.max(z - 10, 60))}
                  title="Zoom Out"
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setModalZoom(100)}
                  title="Reset Zoom to 100%"
                  className="px-2 py-1 font-mono text-[11px] font-bold text-slate-200 hover:text-white"
                >
                  {modalZoom}%
                </button>
                <button
                  onClick={() => setModalZoom((z) => Math.min(z + 10, 150))}
                  title="Zoom In"
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Print Sample */}
              <button
                onClick={() => {
                  if (liveModalPreviewRef.current) {
                    triggerDirectPrint(liveModalPreviewRef.current, `${template.id.toUpperCase()}_Live_Sample`);
                  } else {
                    window.print();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                title="Print current sample sheet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print Sample</span>
              </button>

              {/* Download Sample PDF */}
              <button
                onClick={handleLiveModalExportPDF}
                disabled={isExportingPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                title="Export high-resolution PDF with unsaved template settings"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingPDF ? 'Exporting...' : 'Download Sample PDF'}</span>
              </button>

              {/* Save & Apply */}
              <button
                onClick={() => {
                  handleSave();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                title="Save current template configuration"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save Template</span>
              </button>

              {/* Close Modal */}
              <button
                onClick={() => setShowLivePreviewModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Live Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Document Sheet Display Canvas */}
          <div className="w-full flex justify-center pb-12 overflow-auto">
            <div
              style={{
                transform: `scale(${modalZoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className="max-w-4xl w-full"
            >
              <div
                ref={liveModalPreviewRef}
                className="bg-white rounded-2xl p-8 sm:p-10 shadow-2xl border border-slate-200 space-y-6 font-sans relative text-slate-900"
              >
                {/* Watermark */}
                {template.styling.watermarkText && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                    <div className="text-7xl sm:text-8xl font-black text-slate-900/5 -rotate-45 tracking-widest uppercase">
                      {template.styling.watermarkText}
                    </div>
                  </div>
                )}

                <div className="relative z-10 space-y-6">
                  {/* Real-time Document Header */}
                  <DocumentHeader
                    headerConfig={template.header}
                    stylingConfig={template.styling}
                    settings={settings}
                    documentNumber={
                      activeReportType === 'invoice'
                        ? 'INV-2026-0042'
                        : activeReportType === 'po'
                        ? 'PO-2026-0189'
                        : activeReportType === 'pr'
                        ? 'PR-2026-0083'
                        : activeReportType === 'workorder'
                        ? 'WO-2026-0051'
                        : 'QT-2026-0012'
                    }
                    documentDate={new Date().toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                    secondaryDateLabel={
                      activeReportType === 'invoice'
                        ? 'Due Date'
                        : activeReportType === 'po'
                        ? 'Delivery Due'
                        : activeReportType === 'pr'
                        ? 'Required By'
                        : 'Offer Validity'
                    }
                    secondaryDateValue={
                      activeReportType === 'invoice'
                        ? '15-Oct-2026'
                        : activeReportType === 'po'
                        ? '28-Sep-2026'
                        : activeReportType === 'pr'
                        ? '20-Sep-2026'
                        : '30 Days'
                    }
                    projectRef="PRJ-2026-0001 (Mumbai Corporate Hub HVAC)"
                    statusBadge={{
                      text:
                        activeReportType === 'invoice'
                          ? 'Commercial Billed'
                          : activeReportType === 'po'
                          ? 'Approved & Issued'
                          : activeReportType === 'pr'
                          ? 'Engineering Approved'
                          : 'Official Proposal',
                      colorClass: 'bg-emerald-100 text-emerald-800'
                    }}
                  />

                  {/* Standardized Structured Report Detail Block */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 text-xs shadow-xs relative overflow-hidden"
                    style={{ borderTop: `3px solid ${template.header.accentColor || '#0066E0'}` }}
                  >
                    {/* Column 1: Organization / Counterparty Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                        {activeReportType === 'po' ? (
                          <>
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Authorized Supplier / Vendor:</span>
                          </>
                        ) : activeReportType === 'pr' ? (
                          <>
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <span>Indent Requisitioning Officer:</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Billed Organization / Client:</span>
                          </>
                        )}
                      </div>

                      <div>
                        <div className="font-black text-slate-900 text-sm tracking-tight">
                          {activeReportType === 'po'
                            ? 'Daikin Airconditioning India Pvt Ltd'
                            : activeReportType === 'pr'
                            ? 'Er. Rahul Verma (HVAC Site In-charge)'
                            : 'Godrej Tech Park Commercial Towers'}
                        </div>
                        <div className="text-slate-600 text-[11px] font-medium mt-0.5">
                          {activeReportType === 'po'
                            ? 'Attn: Commercial OEM Sourcing Lead • SCM Division'
                            : activeReportType === 'pr'
                            ? 'Site Engineering & Technical Maintenance Team'
                            : 'Attn: Mr. Vikram Shah (VP Infrastructure & Facilities)'}
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Plot 42, Andheri-Kurla Industrial Corridor, Mumbai 400093</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-[10px] text-slate-500">
                          <span>
                            <strong>GSTIN:</strong> 27AABCA9911D1Z2
                          </span>
                          <span>•</span>
                          <span>
                            <strong>PAN:</strong> AABCA9911D
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Engineering Scope & Project Specifications */}
                    <div className="space-y-2 md:border-l md:border-slate-200 md:pl-4">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                        <span>HVAC Project Scope & Contract Ref:</span>
                      </div>

                      <div>
                        <div className="font-black text-slate-900 text-sm tracking-tight">
                          Turnkey VRF Air Conditioning & Chiller Commissioning
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                          Project ID: <span className="font-mono font-bold text-slate-800">PRJ-2026-0001</span> • Phase 2 Fitout
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery / Validity</span>
                          <span className="font-semibold text-slate-800">
                            {activeReportType === 'invoice'
                              ? 'Net 15 Days'
                              : activeReportType === 'po'
                              ? 'Ex-Factory 3 Weeks'
                              : activeReportType === 'pr'
                              ? 'Urgent Site Indent'
                              : '30 Days from Issue'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Billing Currency</span>
                          <span className="font-semibold text-slate-800 font-mono">INR (₹) Indian Rupee</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sample Line Items Table */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      Itemized Scope & Technical Quantities:
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                          <tr>
                            <th className="py-2.5 px-3.5 w-8 text-center">#</th>
                            <th className="py-2.5 px-3.5">Description & Technical Specs</th>
                            <th className="py-2.5 px-3.5 text-center w-16">Qty</th>
                            <th className="py-2.5 px-3.5 text-center w-16">Unit</th>
                            <th className="py-2.5 px-3.5 text-right w-28">Rate (₹)</th>
                            <th className="py-2.5 px-3.5 text-right w-32">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sampleItems.map((item, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                              <td className="py-2.5 px-3.5 text-center font-mono text-slate-400 text-[10px]">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-3.5 text-slate-900">
                                <div className="font-semibold text-xs">{item.desc}</div>
                                <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                              </td>
                              <td className="py-2.5 px-3.5 text-center font-bold text-slate-800">{item.qty}</td>
                              <td className="py-2.5 px-3.5 text-center text-slate-600 text-[11px]">{item.unit}</td>
                              <td className="py-2.5 px-3.5 text-right font-mono text-slate-700">
                                ₹{item.rate.toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-900">
                                ₹{item.amount.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Subtotal & Taxes Summary Box */}
                  <div className="flex justify-end pt-1">
                    <div className="w-80 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs shadow-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span className="font-mono font-semibold text-slate-900">
                          ₹{subtotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>GST ({gstRate}%):</span>
                        <span className="font-mono font-semibold text-slate-900">
                          ₹{gstAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-slate-900 font-bold">
                        <span>Grand Total:</span>
                        <span
                          className="font-mono text-base font-black"
                          style={{ color: template.header.accentColor }}
                        >
                          ₹{grandTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Document Footer */}
                  <DocumentFooter
                    footerConfig={template.footer}
                    stylingConfig={template.styling}
                    settings={settings}
                    clientOrVendorName={
                      activeReportType === 'po'
                        ? 'Daikin Airconditioning India Pvt Ltd'
                        : 'Godrej Tech Park Commercial Towers'
                    }
                    signedAtDate={new Date().toLocaleDateString('en-IN')}
                    pageNumber={1}
                    totalPages={1}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
