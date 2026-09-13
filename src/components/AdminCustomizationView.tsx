import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Building2,
  FileText,
  ShoppingCart,
  CreditCard,
  Layers,
  ShieldCheck,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Save,
  Plus,
  Trash2,
  HelpCircle,
  Eye,
  Lock,
  DollarSign,
  Palette,
  Hash,
  FileSignature,
  AlignJustify,
  Maximize2,
  Table,
  Type,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Mail,
  Key,
  Users
} from 'lucide-react';
import { SystemSettings, UserRole, UserProfile } from '../types';
import { FontSizeScaleMode } from '../types/fontSize';
import { storageService } from '../services/storageService';
import { useFontSize } from '../context/FontSizeContext';
import { ROLE_DEFINITIONS } from '../utils/rbac';
import { NumberSeriesAdminSection } from './NumberSeriesAdminSection';
import { ReportTemplateManager } from './ReportTemplateManager';
import { RoleModulePermissionsManager } from './RoleModulePermissionsManager';
import { GoogleSheetsAdminSection } from './GoogleSheetsAdminSection';
import { MongoDbAdminSection } from './MongoDbAdminSection';
import { EmailSettingsAdminSection } from './EmailSettingsAdminSection';
import { EnvironmentVariablesAdminSection } from './EnvironmentVariablesAdminSection';
import { OrganizationLogoCustomizer } from './OrganizationLogoCustomizer';
import { EnterpriseFunctionsRolesManager } from './EnterpriseFunctionsRolesManager';
import { SodMatrixManager } from './SodMatrixManager';
import { BusinessRolesManager } from './BusinessRolesManager';
import {
  FileSpreadsheet,
  ExternalLink,
  Database,
  Cloud,
  Check,
  Activity,
  HardDrive,
  Info,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';
import {
  GoogleSheetBackupStats,
  GoogleSheetRestorePreview,
  GoogleSheetRestoreResult
} from '../types';
import { googleSheetsService } from '../services/googleSheets';

interface AdminCustomizationViewProps {
  currentUser: UserProfile;
  onNavigateTab?: (tab: string) => void;
}

export const AdminCustomizationView: React.FC<AdminCustomizationViewProps> = ({
  currentUser,
  onNavigateTab
}) => {
  const {
    fontSizeMode,
    isAuto,
    computedScale,
    baseFontSizePx,
    viewportInfo,
    setFontSizeMode,
    setCustomScale,
    resetToAuto
  } = useFontSize();
  const [settings, setSettings] = useState<SystemSettings>(storageService.getSystemSettings());
  const [activeSubTab, setActiveSubTab] = useState<
    'branding' | 'report_templates' | 'commercial' | 'procurement' | 'number_series' | 'banking' | 'modules' | 'roles' | 'functions_roles' | 'sod_matrix' | 'business_roles' | 'role_modules' | 'google_sheets' | 'backup' | 'mongodb' | 'email_settings' | 'env_vars'
  >('branding');

  // Form states for inclusion/exclusion additions
  const [newInclusionText, setNewInclusionText] = useState('');
  const [newExclusionText, setNewExclusionText] = useState('');

  // Backup & Restore states
  const [jsonInput, setJsonInput] = useState('');
  const [restoreFeedback, setRestoreFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);

  // Google Sheets Master & Transaction Cloud Backup/Restore states
  const [sheetsConfig, setSheetsConfig] = useState(storageService.getGoogleSheetsConfig());
  const [isGSheetBackingUp, setIsGSheetBackingUp] = useState(false);
  const [isGSheetRestoring, setIsGSheetRestoring] = useState(false);
  const [isGSheetPreviewing, setIsGSheetPreviewing] = useState(false);
  const [sheetRestorePreview, setSheetRestorePreview] = useState<GoogleSheetRestorePreview | null>(null);
  const [sheetRestoreResult, setSheetRestoreResult] = useState<GoogleSheetRestoreResult | null>(null);
  const [sheetBackupResult, setSheetBackupResult] = useState<GoogleSheetBackupStats | null>(
    storageService.getGoogleSheetsConfig().lastBackupStats || null
  );
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const isAdmin = currentUser.role === 'executive';

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setSettings(storageService.getSystemSettings());
      setSheetsConfig(storageService.getGoogleSheetsConfig());
    });
    return () => unsubscribe();
  }, []);

  const handleSaveSettings = () => {
    try {
      storageService.updateSystemSettings(settings);
      setSaveSuccessNotification(true);
      setTimeout(() => setSaveSuccessNotification(false), 3000);
    } catch (e: any) {
      alert(e.message || 'Failed to save settings');
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all system customizations back to factory default?')) {
      const reset = storageService.resetSystemSettings();
      setSettings(reset);
      setSaveSuccessNotification(true);
      setTimeout(() => setSaveSuccessNotification(false), 3000);
    }
  };

  const handleDensityChange = (density: 'compact' | 'spacious') => {
    const updated = { ...settings, displayDensity: density };
    setSettings(updated);
    storageService.setDisplayDensity(density);
    setSaveSuccessNotification(true);
    setTimeout(() => setSaveSuccessNotification(false), 2500);
  };

  const handleAddInclusion = () => {
    if (!newInclusionText.trim()) return;
    setSettings({
      ...settings,
      defaultInclusions: [...settings.defaultInclusions, newInclusionText.trim()]
    });
    setNewInclusionText('');
  };

  const handleRemoveInclusion = (index: number) => {
    setSettings({
      ...settings,
      defaultInclusions: settings.defaultInclusions.filter((_, i) => i !== index)
    });
  };

  const handleAddExclusion = () => {
    if (!newExclusionText.trim()) return;
    setSettings({
      ...settings,
      defaultExclusions: [...settings.defaultExclusions, newExclusionText.trim()]
    });
    setNewExclusionText('');
  };

  const handleRemoveExclusion = (index: number) => {
    setSettings({
      ...settings,
      defaultExclusions: settings.defaultExclusions.filter((_, i) => i !== index)
    });
  };

  const handleExportJson = () => {
    const jsonStr = storageService.exportFullDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AlphaERP_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    setRestoreFeedback(null);
    if (!jsonInput.trim()) {
      setRestoreFeedback({ type: 'error', message: 'Please paste valid JSON backup content.' });
      return;
    }

    try {
      const report = storageService.importFullDatabaseWithReport(jsonInput);
      if (report.success) {
        setRestoreFeedback({
          type: 'success',
          message: `Full ERP Database restored! Successfully loaded ${report.totalMaster} master records and ${report.totalTransactions} transaction records.`
        });
        setJsonInput('');
      } else {
        setRestoreFeedback({ type: 'error', message: report.error || 'Failed to restore database.' });
      }
    } catch (e: any) {
      setRestoreFeedback({ type: 'error', message: e.message || 'Invalid JSON format.' });
    }
  };

  const handleBackupToGoogleSheet = async () => {
    if (isGSheetBackingUp) return;
    setIsGSheetBackingUp(true);
    setRestoreFeedback(null);

    try {
      const res = await googleSheetsService.backupToGoogleSheet();
      setSheetBackupResult(res.stats);
      setRestoreFeedback({
        type: 'success',
        message: `Google Sheets Cloud Backup Successful: Backed up ${res.stats.totalMasterRecords} master records and ${res.stats.totalTransactionRecords} transaction records to Google Sheet.`
      });
    } catch (err: any) {
      setRestoreFeedback({
        type: 'error',
        message: err.message || 'Failed to backup master and transaction data to Google Sheet.'
      });
    } finally {
      setIsGSheetBackingUp(false);
    }
  };

  const handleInitiateGoogleSheetRestore = async () => {
    if (isGSheetPreviewing || isGSheetRestoring) return;
    setIsGSheetPreviewing(true);
    setRestoreFeedback(null);

    try {
      const preview = await googleSheetsService.previewRestoreFromGoogleSheet();
      setSheetRestorePreview(preview);
      setShowRestoreModal(true);
    } catch (err: any) {
      setRestoreFeedback({
        type: 'error',
        message: err.message || 'Failed to inspect linked Google Sheet for restoration.'
      });
    } finally {
      setIsGSheetPreviewing(false);
    }
  };

  const handleExecuteGoogleSheetRestore = async () => {
    if (isGSheetRestoring) return;
    setIsGSheetRestoring(true);

    try {
      const result = await googleSheetsService.restoreFromGoogleSheet();
      setSheetRestoreResult(result);
      setShowRestoreModal(false);
      const totalCollections = Object.keys(result.masterCounts).length + Object.keys(result.transactionCounts).length;
      setRestoreFeedback({
        type: 'success',
        message: `Google Sheets Restoration Complete! Successfully restored ${result.totalMasterRecords} master records and ${result.totalTransactionRecords} transaction records across ${totalCollections} collections.`
      });
    } catch (err: any) {
      setRestoreFeedback({
        type: 'error',
        message: err.message || 'Failed to restore database from Google Sheet.'
      });
    } finally {
      setIsGSheetRestoring(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
    };
    reader.readAsText(file);
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 font-bold">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Super Admin Authorization Required</h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Application-wide customization, branding policies, and approval thresholds are strictly restricted to the{' '}
          <strong>Executive Managing Director (Super Admin)</strong> role.
        </p>
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
          Your active role is: <strong className="text-slate-800 uppercase">{currentUser.role}</strong> ({currentUser.name})
        </div>
        <div className="mt-6">
          <button
            onClick={() => storageService.setUserRole('executive')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            Switch to Executive Super Admin Role
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/25">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Enterprise Customization Suite
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure corporate branding, tax laws, PR/PO approval limits, bank details, and active modules.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Display Density Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2.5 hidden sm:inline">
              Density:
            </span>
            <button
              type="button"
              onClick={() => handleDensityChange('compact')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                (settings.displayDensity || 'spacious') === 'compact'
                  ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Compact Mode: dense rows and reduced cell padding for maximum information density"
            >
              <AlignJustify className="w-3.5 h-3.5" />
              <span>Compact</span>
            </button>
            <button
              type="button"
              onClick={() => handleDensityChange('spacious')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                (settings.displayDensity || 'spacious') === 'spacious'
                  ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Spacious Mode: increased padding and relaxed breathing room for comfortable viewing"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Spacious</span>
            </button>
          </div>

          {saveSuccessNotification && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings Saved!
            </span>
          )}

          <button
            onClick={handleResetSettings}
            title="Reset to initial factory defaults"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveSettings}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveSubTab('branding')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'branding'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Company & Branding</span>
        </button>

        <button
          onClick={() => setActiveSubTab('report_templates')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'report_templates'
              ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSignature className="w-4 h-4" />
          <span>2. Report & PDF Templates</span>
        </button>

        <button
          onClick={() => setActiveSubTab('commercial')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'commercial'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. Quotations & Tax</span>
        </button>

        <button
          onClick={() => setActiveSubTab('procurement')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'procurement'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>4. PR/PO Approval Limits</span>
        </button>

        <button
          onClick={() => setActiveSubTab('number_series')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'number_series'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Hash className="w-4 h-4" />
          <span>5. Auto-Numbering Settings</span>
        </button>

        <button
          onClick={() => setActiveSubTab('banking')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'banking'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>6. Bank Remittance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('modules')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'modules'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>7. Module Feature Flags</span>
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'roles'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>8. Role Privileges Overview</span>
        </button>

        <button
          id="tab-admin-functions-roles"
          onClick={() => setActiveSubTab('functions_roles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'functions_roles'
              ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-200" />
          <span>9. Functions & Custom Roles</span>
        </button>

        <button
          id="tab-admin-sod-matrix"
          onClick={() => setActiveSubTab('sod_matrix')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'sod_matrix'
              ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>10. SoD Governance Matrix</span>
        </button>

        <button
          id="tab-admin-business-roles"
          onClick={() => setActiveSubTab('business_roles')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'business_roles'
              ? 'bg-teal-600 text-white shadow-xs ring-2 ring-teal-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-teal-500" />
          <span>11. Business Roles & Users</span>
        </button>

        <button
          onClick={() => setActiveSubTab('role_modules')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'role_modules'
              ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>12. Role Module Visibility</span>
        </button>

        <button
          onClick={() => setActiveSubTab('google_sheets')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'google_sheets'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>13. Google Sheets & API</span>
        </button>

        <button
          onClick={() => setActiveSubTab('backup')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>14. Backup & Restore</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mongodb')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'mongodb'
              ? 'bg-emerald-800 text-white shadow-xs ring-1 ring-emerald-500'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>15. MongoDB Linked Database</span>
        </button>

        <button
          onClick={() => setActiveSubTab('email_settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeSubTab === 'email_settings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-4 h-4 text-blue-300" />
          <span>16. Email & SMTP</span>
        </button>

        <button
          id="tab-admin-env-vars"
          onClick={() => setActiveSubTab('env_vars')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'env_vars'
              ? 'bg-purple-700 text-white shadow-xs ring-1 ring-purple-500'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Key className="w-4 h-4 text-purple-300" />
          <span>17. Environment Variables</span>
        </button>
      </div>

      {/* TAB 1: COMPANY & BRANDING */}
      {activeSubTab === 'branding' && (
        <div className="space-y-6">
          {/* DISPLAY DENSITY & TABLE ERGONOMICS SECTION */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Table className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Display Density & Table Layout Ergonomics
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Configure table cell padding, row heights, and information density across all data-heavy views (CRM Leads, Quotes, Projects BOQ, Inventory, PR/PO Procurement, and Finance Ledgers).
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Active Mode:
                </span>
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-indigo-600 text-white uppercase tracking-wider shadow-xs">
                  {settings.displayDensity || 'spacious'}
                </span>
              </div>
            </div>

            {/* Density Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Compact Mode Card */}
              <div
                onClick={() => handleDensityChange('compact')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden ${
                  (settings.displayDensity || 'spacious') === 'compact'
                    ? 'bg-white border-indigo-600 shadow-md ring-4 ring-indigo-500/10'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        (settings.displayDensity || 'spacious') === 'compact'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <AlignJustify className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Compact Mode</h4>
                      <span className="text-[11px] font-bold text-indigo-600">Dense Tables & High Capacity</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="displayDensity"
                    checked={(settings.displayDensity || 'spacious') === 'compact'}
                    onChange={() => handleDensityChange('compact')}
                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  Condensed cell padding (<code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono font-bold">px-2.5 py-1.5</code>), compact typography, and reduced row heights. Recommended for estimators, warehouse inventory managers, and power users who scan high-volume lists without excessive scrolling.
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Tight Padding (py-1.5)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Maximum Rows Per Screen
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Power User Workflow
                  </span>
                </div>
              </div>

              {/* Spacious Mode Card */}
              <div
                onClick={() => handleDensityChange('spacious')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden ${
                  (settings.displayDensity || 'spacious') === 'spacious'
                    ? 'bg-white border-indigo-600 shadow-md ring-4 ring-indigo-500/10'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        (settings.displayDensity || 'spacious') === 'spacious'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Maximize2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Spacious Mode</h4>
                      <span className="text-[11px] font-bold text-indigo-600">Increased Padding & Ergonomics</span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="displayDensity"
                    checked={(settings.displayDensity || 'spacious') === 'spacious'}
                    onChange={() => handleDensityChange('spacious')}
                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  Increased cell padding (<code className="text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-mono font-bold">px-4.5 py-3.5</code>), spacious touch targets, and comfortable line heights. Recommended for boardroom reviews, laptop touchpads, and relaxed reading ergonomics.
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Generous Padding (py-3.5)
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Relaxed Eye Comfort
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Touch & Presentation Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Auto-Rendering & Viewport Typography Scaling Section */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Type className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">
                        Auto-Rendering & Responsive Viewport Typography
                      </h4>
                      {isAuto && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Auto-Scale
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Automatically measures the user's viewport dimensions, DPI, and device orientation to adjust the base typography scale across the entire web application.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {Math.round(computedScale * 100)}% ({baseFontSizePx}px)
                  </span>
                </div>
              </div>

              {/* Viewport Live Diagnostics Pill */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Viewport Size</span>
                  <span className="font-mono font-bold text-slate-800">{viewportInfo.width} × {viewportInfo.height} px</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Breakpoint</span>
                  <span className="font-bold text-indigo-600 uppercase">{viewportInfo.breakpoint} ({viewportInfo.orientation})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Root Size</span>
                  <span className="font-mono font-bold text-slate-800">{baseFontSizePx} px</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Effective Multiplier</span>
                  <span className="font-mono font-bold text-emerald-600">{computedScale.toFixed(2)}x</span>
                </div>
              </div>

              {/* Preset Selection Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { mode: 'auto' as FontSizeScaleMode, title: 'Auto (Responsive)', desc: 'Adaptive scale' },
                  { mode: 'compact' as FontSizeScaleMode, title: 'Compact (90%)', desc: '14.4px dense' },
                  { mode: 'normal' as FontSizeScaleMode, title: 'Standard (100%)', desc: '16.0px normal' },
                  { mode: 'large' as FontSizeScaleMode, title: 'Large (110%)', desc: '17.6px readable' },
                  { mode: 'xlarge' as FontSizeScaleMode, title: 'Extra Large (125%)', desc: '20.0px spacious' },
                ].map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => {
                      setFontSizeMode(item.mode);
                      setSettings({ ...settings, fontSizeMode: item.mode });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      fontSizeMode === item.mode
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Fine-Tuning Slider */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Fine-Tune Scale:</span>
                  <input
                    type="range"
                    min="0.75"
                    max="1.40"
                    step="0.05"
                    value={computedScale}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCustomScale(val);
                      if (val >= 1.2) setFontSizeMode('xlarge');
                      else if (val >= 1.08) setFontSizeMode('large');
                      else if (val >= 0.98) setFontSizeMode('normal');
                      else setFontSizeMode('compact');
                    }}
                    className="w-full max-w-xs accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-indigo-600 w-12 text-right">
                    {Math.round(computedScale * 100)}%
                  </span>
                </div>

                {!isAuto && (
                  <button
                    type="button"
                    onClick={() => {
                      resetToAuto();
                      setSettings({ ...settings, fontSizeMode: 'auto' });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset to Auto-Rendering</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Interactive Table Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Live Interactive Table Spacing Preview
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Simulating data-heavy table view
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item SKU & Description</th>
                      <th className="py-2.5 px-3">System Sub-Type</th>
                      <th className="py-2.5 px-3 text-right">Req. Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                      <th className="py-2.5 px-3 text-right">Total Amount (₹)</th>
                      <th className="py-2.5 px-3 text-center">QC Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        VRF-ODU-16HP • 16 HP Top-Discharge Inverter Outdoor Unit
                      </td>
                      <td className="py-2.5 px-3">HVAC High-Side Equipment</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">2 Nos</td>
                      <td className="py-2.5 px-3 text-right font-mono">₹4,25,000</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">₹8,50,000</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Approved
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        CU-PIPE-34 • 3/4" Hard-Drawn Refrigerant Copper Piping
                      </td>
                      <td className="py-2.5 px-3">Low-Side Piping Package</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">240 Rmt</td>
                      <td className="py-2.5 px-3 text-right font-mono">₹850</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">₹2,04,000</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          In Stock
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        GI-DUCT-24G • 24 Gauge Galvanized Iron Sheet Air Distribution
                      </td>
                      <td className="py-2.5 px-3">Ductwork Fabrication</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">450 Sqm</td>
                      <td className="py-2.5 px-3 text-right font-mono">₹1,150</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">₹5,17,500</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Pending Inspection
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ENTERPRISE BRANDING LOGO CUSTOMIZER */}
          <OrganizationLogoCustomizer onSaved={() => setSettings(storageService.getSystemSettings())} />

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Company Identity & Legal Entity Settings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                These details appear on official Quotation headers, Purchase Orders, Work Orders, and Handover Tax Invoices.
              </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Legal Registered Name *
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Application Display Title *
              </label>
              <input
                type="text"
                value={settings.appTitle}
                onChange={(e) => setSettings({ ...settings, appTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                GSTIN / Tax Registration Number *
              </label>
              <input
                type="text"
                value={settings.gstin}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Corporate PAN Number *
              </label>
              <input
                type="text"
                value={settings.pan}
                onChange={(e) => setSettings({ ...settings, pan: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Corporate CIN Number
              </label>
              <input
                type="text"
                value={settings.cin}
                onChange={(e) => setSettings({ ...settings, cin: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Services Accounting Code (SAC / HSN)
              </label>
              <input
                type="text"
                value={settings.sacCode}
                onChange={(e) => setSettings({ ...settings, sacCode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Corporate HQ Registered Address *
              </label>
              <input
                type="text"
                value={settings.hqAddress}
                onChange={(e) => setSettings({ ...settings, hqAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Support Helpline / WhatsApp Hotline
              </label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Operations / Procurement Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Base Currency Symbol
              </label>
              <select
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="AED">AED (United Arab Emirates Dirham)</option>
                <option value="£">£ (GBP - British Pound)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TAB: REPORT & PDF TEMPLATE MANAGER */}
      {activeSubTab === 'report_templates' && (
        <ReportTemplateManager currentUser={currentUser} />
      )}

      {/* TAB 3: COMMERCIAL & QUOTATIONS */}
      {activeSubTab === 'commercial' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Quotation, Estimation & GST Policy Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control standard tax rates, quote validity timelines, margin requirements, and contract clauses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default GST Tax Rate (%)
              </label>
              <input
                type="number"
                value={settings.defaultGstRate}
                onChange={(e) => setSettings({ ...settings, defaultGstRate: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Quote Validity Period (Days)
              </label>
              <input
                type="number"
                value={settings.quoteValidityDays}
                onChange={(e) => setSettings({ ...settings, quoteValidityDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Minimum Gross Margin (%)
              </label>
              <input
                type="number"
                value={settings.minimumGrossMarginPct}
                onChange={(e) => setSettings({ ...settings, minimumGrossMarginPct: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Milestone Payment Terms Clause
              </label>
              <textarea
                rows={2}
                value={settings.defaultPaymentTerms}
                onChange={(e) => setSettings({ ...settings, defaultPaymentTerms: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Standard Warranty & AMC Commitment Clause
              </label>
              <textarea
                rows={2}
                value={settings.defaultWarrantyClause}
                onChange={(e) => setSettings({ ...settings, defaultWarrantyClause: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium leading-relaxed"
              />
            </div>
          </div>

          {/* Inclusions & Exclusions Builder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Inclusions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Default Scope Inclusions ({settings.defaultInclusions.length})
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {settings.defaultInclusions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2"
                  >
                    <span className="text-slate-700 font-medium line-clamp-2">✓ {item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInclusion(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add scope item..."
                  value={newInclusionText}
                  onChange={(e) => setNewInclusionText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddInclusion}
                  className="p-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Exclusions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Default Scope Exclusions ({settings.defaultExclusions.length})
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {settings.defaultExclusions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2"
                  >
                    <span className="text-slate-700 font-medium line-clamp-2">✕ {item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExclusion(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add exclusion item..."
                  value={newExclusionText}
                  onChange={(e) => setNewExclusionText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddExclusion}
                  className="p-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROCUREMENT & PR/PO LIMITS */}
      {activeSubTab === 'procurement' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Procurement & Approval Threshold Controls
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set financial limits for auto-approval and dual sign-off on Purchase Requisitions (PR) and Purchase Orders (PO).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                PR Auto-Approval Ceiling ({settings.currencySymbol})
              </label>
              <input
                type="number"
                value={settings.prAutoApprovalThreshold}
                onChange={(e) => setSettings({ ...settings, prAutoApprovalThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">Requisitions below this value can be auto-approved.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                PO Executive Dual Sign-off Threshold ({settings.currencySymbol})
              </label>
              <input
                type="number"
                value={settings.poDualSignoffThreshold}
                onChange={(e) => setSettings({ ...settings, poDualSignoffThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">Purchase Orders above this value require Super Admin Sign-off.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Vendor Credit Period (Days)
              </label>
              <input
                type="number"
                value={settings.defaultVendorCreditDays}
                onChange={(e) => setSettings({ ...settings, defaultVendorCreditDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">Standard payment terms for newly onboarded suppliers.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUTOMATED NUMBER SERIES CUSTOMIZATION */}
      {activeSubTab === 'number_series' && (
        <NumberSeriesAdminSection />
      )}

      {/* TAB 5: BANK REMITTANCE PROFILE */}
      {activeSubTab === 'banking' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Corporate Banking & NEFT Remittance Account
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details are printed on Client Handover Invoices, Milestone Payment Requests, and Completion Bills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Beneficiary Name (Account Title) *
              </label>
              <input
                type="text"
                value={settings.bankBeneficiaryName}
                onChange={(e) => setSettings({ ...settings, bankBeneficiaryName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bank Name & Branch *
              </label>
              <input
                type="text"
                value={settings.bankName}
                onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Account Number *
              </label>
              <input
                type="text"
                value={settings.bankAccountNumber}
                onChange={(e) => setSettings({ ...settings, bankAccountNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                IFSC Code (Indian Financial System Code) *
              </label>
              <input
                type="text"
                value={settings.bankIfscCode}
                onChange={(e) => setSettings({ ...settings, bankIfscCode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                SWIFT / BIC Code (Optional for International)
              </label>
              <input
                type="text"
                value={settings.bankSwiftCode || ''}
                onChange={(e) => setSettings({ ...settings, bankSwiftCode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                UPI VPA Virtual Address (Quick Scan QR)
              </label>
              <input
                type="text"
                value={settings.upiVpaId}
                onChange={(e) => setSettings({ ...settings, upiVpaId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MODULE FEATURE FLAGS */}
      {activeSubTab === 'modules' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Enterprise Module Visibility & Workflow Flags
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enable or disable specific operational modules across the ERP application.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'crmLeads', label: 'CRM Leads & Pipeline', desc: 'Manage prospect stages & surveys' },
              { id: 'quotesEstimations', label: 'Quotes & Estimations', desc: 'Heat load, BOQ costing & GST' },
              { id: 'projectsBOQ', label: 'Projects & BOQ Execution', desc: 'Shortage tracking & conversion' },
              { id: 'procurementPRPO', label: 'Procurement & PR/PO', desc: 'Requisitions, vendor orders & GRN' },
              { id: 'inventoryWarehouse', label: 'Warehouse & Inventory', desc: 'Stock quantities, safety levels' },
              { id: 'workOrdersField', label: 'Work Orders & Field Testing', desc: 'Testing checklists & sign-offs' },
              { id: 'paymentsBilling', label: 'Milestone Payments & Invoices', desc: 'Receivables & vendor payouts' },
              { id: 'salesPerformance', label: 'Sales Quotas & Commissions', desc: 'Performance quotas & bonus %' },
              { id: 'googleSheetsSync', label: 'Google Sheets Cloud Sync', desc: 'Live multi-tab bidirectional sync' },
              { id: 'auditLogs', label: 'Activity Audit Trail', desc: 'Tamper-proof compliance logs' },
              { id: 'userManagement', label: 'User Directory & RBAC', desc: 'Manage team access & credentials' }
            ].map((mod) => {
              const isEnabled = settings.moduleFlags[mod.id as keyof typeof settings.moduleFlags] ?? true;
              return (
                <div
                  key={mod.id}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      moduleFlags: {
                        ...settings.moduleFlags,
                        [mod.id]: !isEnabled
                      }
                    })
                  }
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isEnabled
                      ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 opacity-60 text-slate-600'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{mod.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{mod.desc}</div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                      isEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    {isEnabled ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: ROLE ACCESS MATRIX */}
      {activeSubTab === 'roles' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Role-Based Access Control (RBAC) Governance Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of system privileges granted to each functional department.
              </p>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('users')}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-colors"
              >
                Go to User Directory
              </button>
            )}
          </div>

          <div className="space-y-4">
            {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((roleKey) => {
              const roleMeta = ROLE_DEFINITIONS[roleKey];
              return (
                <div
                  key={roleKey}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${roleMeta.badgeColor}`}>
                        {roleMeta.badge}
                      </span>
                      <span className="text-xs font-black text-slate-900">{roleMeta.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{roleMeta.department}</span>
                  </div>

                  <p className="text-xs text-slate-600">{roleMeta.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {roleMeta.keyPermissions.map((perm, pIdx) => (
                      <span
                        key={pIdx}
                        className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700"
                      >
                        ✓ {perm}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 9: GRANULAR ENTERPRISE FUNCTIONS & CUSTOM ROLES */}
      {activeSubTab === 'functions_roles' && (
        <EnterpriseFunctionsRolesManager />
      )}

      {/* TAB 10: SEGREGATION OF DUTIES (SOD) GOVERNANCE MATRIX */}
      {activeSubTab === 'sod_matrix' && (
        <SodMatrixManager />
      )}

      {/* TAB 11: BUSINESS ROLES & MULTI-USER MAPPING */}
      {activeSubTab === 'business_roles' && (
        <BusinessRolesManager />
      )}

      {/* TAB 12: ROLE MODULE VISIBILITY CONFIGURATION */}
      {activeSubTab === 'role_modules' && (
        <RoleModulePermissionsManager
          onRoleSwitch={(role) => {
            if (onNavigateTab) onNavigateTab('dashboard');
          }}
        />
      )}

      {/* TAB 10: GOOGLE SHEETS API & PERSISTENT CLOUD INTEGRATION */}
      {activeSubTab === 'google_sheets' && (
        <GoogleSheetsAdminSection />
      )}

      {/* TAB 11: BACKUP, RESTORE & FACTORY RESET */}
      {activeSubTab === 'backup' && (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <span>Enterprise Data Vault: Backup, Migration & Restoration</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Backup and restore all master data collections and transaction data records using your linked Google Sheet or offline JSON files.
              </p>
            </div>

            {restoreFeedback && (
              <div
                className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                  restoreFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : restoreFeedback.type === 'info'
                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {restoreFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : restoreFeedback.type === 'info' ? (
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{restoreFeedback.message}</span>
                </div>
                <button
                  onClick={() => setRestoreFeedback(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5"
                >
                  ✕
                </button>
              </div>
            )}

            {/* MONGODB CLOUD LINKED DATABASE VAULT SECTION */}
            <div className="rounded-2xl border border-emerald-800/40 bg-linear-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 text-white space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-white">
                        MongoDB Linked Database Vault
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Native Schema Collections
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Migrated from Firebase to native MongoDB collections. Direct cloud persistence with instant migration and restoration controls.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('mongodb')}
                    className="px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Open MongoDB Migration Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* GOOGLE SHEETS ENTERPRISE CLOUD BACKUP & RESTORE SECTION */}
            <div className="rounded-2xl border border-emerald-200 bg-linear-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        Linked Google Sheet Cloud Vault
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        Auto-Vault Enabled
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Target Spreadsheet:{' '}
                      <span className="font-semibold text-slate-800">
                        {sheetsConfig.spreadsheetName || 'AlphaERP_Master_Sync'}
                      </span>{' '}
                      {sheetsConfig.spreadsheetId && (
                        <a
                          href={`https://docs.google.com/spreadsheets/d/${sheetsConfig.spreadsheetId}/edit`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-mono text-[11px] ml-1"
                        >
                          <span className="truncate max-w-[140px]">{sheetsConfig.spreadsheetId}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSubTab('google_sheets')}
                    className="px-3 py-1.5 rounded-xl border border-emerald-300 hover:bg-emerald-100/60 text-emerald-900 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Configure Sheet
                  </button>
                </div>
              </div>

              {/* Master & Transaction Scope Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Master Data Collections */}
                <div className="p-3.5 rounded-xl bg-white/90 border border-emerald-100/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Master Data Collections</span>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {sheetBackupResult?.totalMasterRecords
                        ? `${sheetBackupResult.totalMasterRecords} Records Backed Up`
                        : '10 Master Modules'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Clients, Vendors, Inventory Catalog, Sales Reps, Cost Centers, Tax Slabs, Payment Terms, Chart of Accounts, Employees, Shifts & Policies.
                  </p>
                </div>

                {/* Transaction Data Collections */}
                <div className="p-3.5 rounded-xl bg-white/90 border border-teal-100/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-teal-600" />
                      <span>Transaction Data Collections</span>
                    </span>
                    <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                      {sheetBackupResult?.totalTransactionRecords
                        ? `${sheetBackupResult.totalTransactionRecords} Records Backed Up`
                        : '14 Transaction Modules'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    CRM Leads, Quotations, Projects & BOQs, Field Orders, PRs, POs, Goods Receipt Notes, Customer Billing, Journal Vouchers, Attendance, Payroll & Audit Logs.
                  </p>
                </div>
              </div>

              {/* Status Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 pt-1 border-t border-emerald-100/70">
                <div className="flex items-center gap-3">
                  <span>
                    Last Cloud Backup:{' '}
                    <strong className="text-slate-700">
                      {sheetsConfig.lastBackupAt ? new Date(sheetsConfig.lastBackupAt).toLocaleString() : 'Never'}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Last Cloud Restore:{' '}
                    <strong className="text-slate-700">
                      {sheetsConfig.lastRestoreAt ? new Date(sheetsConfig.lastRestoreAt).toLocaleString() : 'Never'}
                    </strong>
                  </span>
                </div>
                <div className="text-emerald-700 font-medium">
                  Full 24-collection Data Vault serialization active
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBackupToGoogleSheet}
                  disabled={isGSheetBackingUp || isGSheetRestoring}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGSheetBackingUp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Backing Up All Master & Transaction Data...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Backup to Linked Google Sheet</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleInitiateGoogleSheetRestore}
                  disabled={isGSheetBackingUp || isGSheetRestoring || isGSheetPreviewing}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGSheetPreviewing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reading Sheet Data Vault...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span>Restore from Linked Google Sheet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RESTORATION RESULT SUMMARY (Shown after successful restoration) */}
            {sheetRestoreResult && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Google Sheet Restoration Succeeded</span>
                  </div>
                  <span className="text-[11px] text-emerald-700">
                    {new Date(sheetRestoreResult.restoredAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Successfully restored <strong>{sheetRestoreResult.totalMasterRecords}</strong> master data records and{' '}
                  <strong>{sheetRestoreResult.totalTransactionRecords}</strong> transaction data records across{' '}
                  <strong>{Object.keys(sheetRestoreResult.masterCounts).length + Object.keys(sheetRestoreResult.transactionCounts).length}</strong> collections.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {Object.entries({ ...sheetRestoreResult.masterCounts, ...sheetRestoreResult.transactionCounts }).map(([name, count]) => (
                    <span
                      key={name}
                      className="px-2 py-0.5 bg-white text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-semibold"
                    >
                      {name}: {Number(count)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* OFFLINE JSON EXPORT & RESTORE */}
            <div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                <span>Offline JSON File Backup & Restoration</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export */}
                <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-xs text-indigo-950 uppercase tracking-wider">
                      <Download className="w-4 h-4 text-indigo-600" />
                      <span>Full Database Snapshot Export</span>
                    </div>
                    <p className="text-xs text-indigo-900/80 mt-2 leading-relaxed">
                      Download all Master Collections, Quotations, BOQ Line Items, Vendor POs, Inventory Items, and System Settings in a single JSON file.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="mt-4 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export AlphaERP_Backup.json</span>
                  </button>
                </div>

                {/* Restore */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800 uppercase tracking-wider">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>Restore from JSON Backup File</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Upload an existing AlphaERP backup JSON file to restore all collections and configurations.
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {jsonInput && (
                      <button
                        onClick={handleImportJson}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Apply & Restore Database</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hard Reset Card */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Factory Demo Data Reset</span>
                </div>
                <p className="text-xs text-rose-900/80 mt-0.5">
                  Restores default sample projects (Apex Health Tower, Daikin VRF, Voltas, Blue Star) and clears changes.
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Reset the entire database back to initial factory demo state?')) {
                    storageService.resetToFactoryDefaults();
                    setRestoreFeedback({ type: 'success', message: 'System reset to factory demo state.' });
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
              >
                Reset to Factory Demo Data
              </button>
            </div>
          </div>

          {/* CONFIRMATION & INSPECTION MODAL BEFORE GOOGLE SHEET RESTORATION */}
          {showRestoreModal && sheetRestorePreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">
                        Confirm Google Sheet Restoration
                      </h4>
                      <p className="text-xs text-slate-500">
                        Review master and transaction records detected in the linked sheet.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRestoreModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Source Sheet Info */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Source Spreadsheet:</span>
                    <a
                      href={sheetRestorePreview.spreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>{sheetRestorePreview.spreadsheetTitle}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Vault Detection:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-md text-[10px] ${
                        sheetRestorePreview.vaultFound
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sheetRestorePreview.vaultFound
                        ? 'Full Serialized Data Vault (Accurate)'
                        : 'Multi-Tab Relational Mode'}
                    </span>
                  </div>
                  {sheetRestorePreview.backupTimestamp && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Vault Backup Timestamp:</span>
                      <span className="font-semibold text-slate-700">
                        {new Date(sheetRestorePreview.backupTimestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Master Collections */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Master Data Collections</span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {sheetRestorePreview.totalMasterRecords} Total
                      </span>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
                      {Object.entries(sheetRestorePreview.masterCounts).map(([name, count]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/80 text-[11px]"
                        >
                          <span className="text-slate-700">{name}</span>
                          <span className="font-bold text-slate-900">{Number(count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transaction Collections */}
                  <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-teal-700" />
                        <span>Transaction Collections</span>
                      </span>
                      <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                        {sheetRestorePreview.totalTransactionRecords} Total
                      </span>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
                      {Object.entries(sheetRestorePreview.transactionCounts).map(([name, count]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/80 text-[11px]"
                        >
                          <span className="text-slate-700">{name}</span>
                          <span className="font-bold text-slate-900">{Number(count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Safety Guarantee Callout */}
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Automatic Safety Snapshot:</strong> AlphaERP will automatically record a local safety backup snapshot of your active database right before restoring.
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRestoreModal(false)}
                    disabled={isGSheetRestoring}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteGoogleSheetRestore}
                    disabled={isGSheetRestoring}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGSheetRestoring ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Restoring All Collections...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Restore Full Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 12: MONGODB LINKED DATABASE */}
      {activeSubTab === 'mongodb' && (
        <MongoDbAdminSection />
      )}

      {/* TAB 13: EMAIL & SMTP NOTIFICATIONS */}
      {activeSubTab === 'email_settings' && (
        <EmailSettingsAdminSection currentUser={currentUser} />
      )}

      {/* TAB 14: ENVIRONMENT VARIABLES & SECRETS */}
      {activeSubTab === 'env_vars' && (
        <EnvironmentVariablesAdminSection currentUser={currentUser} />
      )}
    </div>
  );
};
