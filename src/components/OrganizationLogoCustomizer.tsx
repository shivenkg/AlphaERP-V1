import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Upload,
  Link as LinkIcon,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Sun,
  Moon,
  Save,
  Check
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { JSAlphaSoftLogo } from './JSAlphaSoftLogo';

interface OrganizationLogoCustomizerProps {
  onSaved?: () => void;
}

export const OrganizationLogoCustomizer: React.FC<OrganizationLogoCustomizerProps> = ({ onSaved }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoData, setLogoData] = useState<string>('');
  const [altText, setAltText] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [savedLogo, setSavedLogo] = useState<string>('');

  useEffect(() => {
    loadSettings();
    const unsubscribe = storageService.subscribe(() => {
      loadSettings();
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loadSettings = () => {
    const s = storageService.getSystemSettings();
    const currentLogo = s.organizationLogo || '';
    const currentAlt = s.organizationLogoAlt || s.companyName || 'Organization Logo';
    setLogoData(currentLogo);
    setSavedLogo(currentLogo);
    setAltText(currentAlt);
    if (currentLogo.startsWith('http')) {
      setUrlInput(currentLogo);
    }
  };

  const showFeedback = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleFileProcess = (file: File) => {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      showFeedback('Invalid file format. Please upload a PNG, JPEG, SVG, or WebP image.', 'error');
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showFeedback('Image file too large. Maximum size allowed is 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setLogoData(result);
        setUrlInput('');
        showFeedback(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Click "Save Logo" to apply.`, 'info');
      }
    };
    reader.onerror = () => {
      showFeedback('Failed to read image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      showFeedback('Please enter a valid image URL.', 'error');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
      showFeedback('URL must begin with http:// or https://', 'error');
      return;
    }
    setLogoData(trimmed);
    showFeedback('Logo URL configured. Click "Save Logo" to apply.', 'info');
  };

  const handleSave = () => {
    if (!logoData) {
      // If empty, reset to default
      handleReset();
      return;
    }
    storageService.setOrganizationLogo(logoData, altText);
    setSavedLogo(logoData);
    showFeedback('Enterprise Organization Logo successfully updated and published!', 'success');
    if (onSaved) onSaved();
  };

  const handleReset = () => {
    if (window.confirm('Reset organization logo to default system branding?')) {
      storageService.resetOrganizationLogo();
      setLogoData('');
      setUrlInput('');
      setSavedLogo('');
      showFeedback('Organization logo reset to default system brand.', 'info');
      if (onSaved) onSaved();
    }
  };

  const isCustomActive = Boolean(savedLogo);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Enterprise Organization Logo & Visual Identity
            </h3>
            {isCustomActive && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Custom Logo Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload your organization logo to appear on top application headers, formal techno-commercial quotation printouts, client BOQ sheets, and Purchase Orders.
          </p>
        </div>

        {feedback && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : feedback.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {feedback.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
            {feedback.type === 'error' && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
            {feedback.type === 'info' && <Sparkles className="w-3.5 h-3.5 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & URL Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Drag and Drop Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Upload High-Resolution Logo File
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/70 bg-slate-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                Click to browse or drag & drop logo image
              </div>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Recommended: Transparent PNG or SVG vector format, minimum 200×60 px, maximum 2MB.
              </p>
            </div>
          </div>

          {/* Direct URL Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Or Link From Web / Cloud CDN (Direct URL)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="https://yourcompany.com/assets/logo.png"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Load URL</span>
              </button>
            </div>
          </div>

          {/* Logo Alt Text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Organization Name / Alt Label
            </label>
            <input
              type="text"
              placeholder="e.g., Atmos Aircon Engineering Pvt Ltd"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!logoData && !savedLogo}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Logo</span>
            </button>

            {isCustomActive && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Logo</span>
              </button>
            )}

            {logoData && logoData !== savedLogo && (
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                ● Unsaved logo preview
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Live Dual-Theme Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Live Header Simulation</span>
            <span className="text-[11px] font-normal text-slate-400 lowercase">light & dark theme</span>
          </div>

          {/* Light Theme Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Light Background Appearance
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Day Mode</span>
            </div>
            <div className="h-20 bg-white border border-slate-200/80 rounded-xl p-3 flex items-center justify-between shadow-2xs overflow-hidden">
              <div className="flex items-center gap-3">
                {logoData ? (
                  <img
                    src={logoData}
                    alt={altText || 'Custom Logo'}
                    className="h-10 w-auto max-w-[140px] object-contain"
                  />
                ) : (
                  <JSAlphaSoftLogo size="sm" variant="icon" isDarkTheme={false} />
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-black text-[#0B3B95] leading-tight">
                    {altText || 'HVAC Biz AlphaERP'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Techno-Commercial Suite
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                Preview
              </span>
            </div>
          </div>

          {/* Dark Theme Preview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-white">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                Dark Background Appearance
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Night Mode</span>
            </div>
            <div className="h-20 bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-inner overflow-hidden">
              <div className="flex items-center gap-3">
                {logoData ? (
                  <img
                    src={logoData}
                    alt={altText || 'Custom Logo'}
                    className="h-10 w-auto max-w-[140px] object-contain drop-shadow-[0_1px_4px_rgba(255,255,255,0.15)]"
                  />
                ) : (
                  <JSAlphaSoftLogo size="sm" variant="icon" isDarkTheme={true} />
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-black text-blue-400 leading-tight">
                    {altText || 'HVAC Biz AlphaERP'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    Techno-Commercial Suite
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                Preview
              </span>
            </div>
          </div>

          {/* Specs note */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Automatic Document Header Propagation</span>
            </div>
            <p className="text-blue-700/90">
              Once saved, this logo is automatically embedded into browser LocalStorage and synchronized across printable Quotation PDFs, Handover Certificates, and PO Transmittals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
