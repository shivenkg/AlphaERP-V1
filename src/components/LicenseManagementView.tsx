import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Calendar,
  Clock,
  Building2,
  Users,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Download,
  Lock,
  Sparkles,
  Sliders,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
  Search,
  ChevronRight
} from 'lucide-react';
import {
  SystemLicense,
  LicenseTier,
  LicenseTimeFrame,
  LicenseStatus,
  GenerateLicenseParams,
  UserRole
} from '../types';
import { storageService } from '../services/storageService';

interface LicenseManagementViewProps {
  currentRole: UserRole;
}

export const LicenseManagementView: React.FC<LicenseManagementViewProps> = ({ currentRole }) => {
  const [activeLicense, setActiveLicense] = useState<SystemLicense>(storageService.getActiveLicense());
  const [generatedLicenses, setGeneratedLicenses] = useState<SystemLicense[]>(storageService.getGeneratedLicenses());
  const [licenseValidation, setLicenseValidation] = useState(storageService.validateSystemLicense());

  // Form State for License Generation
  const [orgName, setOrgName] = useState('');
  const [tier, setTier] = useState<LicenseTier>('enterprise');
  const [timeFrame, setTimeFrame] = useState<LicenseTimeFrame>('1_year');
  const [customDays, setCustomDays] = useState<number>(45);
  const [maxUsers, setMaxUsers] = useState<number>(100);
  const [notes, setNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<SystemLicense | null>(null);

  // Manual Activation Input
  const [activationKeyInput, setActivationKeyInput] = useState('');
  const [activationMessage, setActivationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // UI helpers
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('ALL');

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setActiveLicense(storageService.getActiveLicense());
      setGeneratedLicenses(storageService.getGeneratedLicenses());
      setLicenseValidation(storageService.validateSystemLicense());
    });
    return unsub;
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      alert('Please provide an organization or client name.');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      try {
        const params: GenerateLicenseParams = {
          organizationName: orgName.trim(),
          tier,
          timeFrame,
          maxUsers: Number(maxUsers) || 50,
          customDays: timeFrame === 'custom' ? Number(customDays) : undefined,
          notes: notes.trim()
        };

        const newLicense = storageService.generateLicense(params);
        setGeneratedResult(newLicense);
        setOrgName('');
        setNotes('');
        setIsGenerating(false);
      } catch (err: any) {
        alert(err.message || 'Error generating license');
        setIsGenerating(false);
      }
    }, 400);
  };

  const handleApplyLicense = (keyToApply: string) => {
    setActivationMessage(null);
    const res = storageService.applyLicense(keyToApply);
    if (res.success) {
      setActivationMessage({ type: 'success', text: res.message });
      setActivationKeyInput('');
    } else {
      setActivationMessage({ type: 'error', text: res.message });
    }
  };

  const handleRevoke = (lic: SystemLicense) => {
    const confirmRevoke = window.confirm(
      `Are you sure you want to revoke license "${lic.licenseKey}" for "${lic.organizationName}"? Active instances will lose authorization.`
    );
    if (!confirmRevoke) return;

    try {
      storageService.revokeLicense(lic.id, 'SuperAdmin administrative revocation');
    } catch (err: any) {
      alert(err.message || 'Error revoking license');
    }
  };

  const handleExtend = (lic: SystemLicense, days: number = 30) => {
    try {
      storageService.extendLicense(lic.id, days);
    } catch (err: any) {
      alert(err.message || 'Error extending license');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'LicenseKey', 'Organization', 'Tier', 'Timeframe', 'StartsAt', 'ExpiresAt', 'MaxUsers', 'Status', 'Checksum'];
    const rows = generatedLicenses.map((l) => [
      l.id,
      l.licenseKey,
      `"${l.organizationName.replace(/"/g, '""')}"`,
      l.tier,
      l.timeFrame,
      l.startsAt,
      l.expiresAt,
      l.maxUsers,
      l.status,
      l.checksum
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AlphaERP_Enterprise_Licenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTimeframeLabel = (tf: LicenseTimeFrame, cd?: number) => {
    switch (tf) {
      case '7_days':
        return '7 Days (Trial)';
      case '14_days':
        return '14 Days (Trial)';
      case '30_days':
        return '30 Days (1 Month POC)';
      case '90_days':
        return '90 Days (Quarterly)';
      case '180_days':
        return '180 Days (Half-Year)';
      case '1_year':
        return '1 Year (Annual Enterprise)';
      case '2_years':
        return '2 Years (Multi-Year)';
      case '3_years':
        return '3 Years (Strategic)';
      case 'lifetime':
        return 'Lifetime Perpetual';
      case 'custom':
        return `Custom (${cd || 30} Days)`;
      default:
        return tf;
    }
  };

  const filteredLicenses = generatedLicenses.filter((l) => {
    const matchesQuery =
      l.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.licenseKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.tier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'ALL' || l.tier === filterTier;
    return matchesQuery && matchesTier;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Root License Authority
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                SuperAdmin Controlled
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Key className="w-6 h-6 text-indigo-400" />
              Enterprise License Engine & DRM Controller
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Generate, sign, provision, and monitor cryptographic enterprise ERP deployment keys with configurable
              evaluation windows, user quotas, and instant revocation privileges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-600/50 shadow-sm flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              Export Keys (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Active Installation Status & Apply Key */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active System License Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Active System License</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Current running node runtime entitlement</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  licenseValidation.isValid
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {licenseValidation.isValid ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Entitled & Active
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {licenseValidation.isRevoked ? 'Revoked' : 'Expired'}
                  </>
                )}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {activeLicense.tier} Tier
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Licensed Organization</span>
              <p className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" />
                {activeLicense.organizationName}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Max Seats: <strong>{activeLicense.maxUsers} Users</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Timeframe: <strong>{getTimeframeLabel(activeLicense.timeFrame, activeLicense.customDays)}</strong>
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Validity & Expiration</span>
                <span
                  className={`text-xs font-bold ${
                    licenseValidation.daysRemaining > 30
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : licenseValidation.daysRemaining > 7
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {licenseValidation.daysRemaining > 0
                    ? `${licenseValidation.daysRemaining} Days Remaining`
                    : 'License Expired'}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Expires: {new Date(activeLicense.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    licenseValidation.daysRemaining > 30
                      ? 'bg-emerald-500'
                      : licenseValidation.daysRemaining > 7
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (licenseValidation.daysRemaining / 365) * 100))}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Active Key Display & Controls */}
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <Key className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <code className="text-xs font-mono text-indigo-200 truncate select-all">{activeLicense.licenseKey}</code>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleCopy(activeLicense.licenseKey, 'active')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copiedKey === 'active' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Key
                  </>
                )}
              </button>
              <button
                onClick={() => handleExtend(activeLicense, 30)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" /> +30 Days
              </button>
              {activeLicense.status === 'active' && (
                <button
                  onClick={() => handleRevoke(activeLicense)}
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-rose-500/30"
                >
                  <XCircle className="w-3.5 h-3.5" /> Revoke
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Apply / Activate Key Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Apply License Key</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Inject or switch current running key</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              Paste an enterprise signed license token string to upgrade limits, extend validity, or activate newly
              provisioned modules immediately.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  License Token / Key
                </label>
                <input
                  type="text"
                  value={activationKeyInput}
                  onChange={(e) => setActivationKeyInput(e.target.value)}
                  placeholder="AERP-ENT-XXXX-XXXX-LIVE"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {activationMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    activationMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {activationMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{activationMessage.text}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => handleApplyLicense(activationKeyInput)}
            disabled={!activationKeyInput.trim()}
            className="w-full mt-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            Validate & Activate Key
          </button>
        </div>
      </div>

      {/* License Generator Studio Card (SuperAdmin Control) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Enterprise License Key Generator Studio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provision new client installations based on custom timeframe selection, tier, and user quotas
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold rounded-lg border border-purple-200 dark:border-purple-800">
            SuperAdmin Authority Only
          </span>
        </div>

        <form onSubmit={handleGenerateLicense} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Target Organization */}
            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Client / Organization Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g., Voltas MEP Projects Ltd or BlueStar Engineering"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* License Tier */}
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                License Edition / Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as LicenseTier)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="trial">Trial Edition (Proof of Concept)</option>
                <option value="professional">Professional (Core HVAC & WMS)</option>
                <option value="enterprise">Enterprise (Full ERP + AMC + HRMS)</option>
                <option value="ultimate">Ultimate (Unlimited Master)</option>
              </select>
            </div>

            {/* Max Users */}
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Allocated User Seats
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={maxUsers}
                onChange={(e) => setMaxUsers(parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Timeframe Selection Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Timeframe / Validity Window Selection <span className="text-rose-500">*</span>
              </label>
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value as LicenseTimeFrame)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="7_days">7 Days — Rapid Evaluation Trial</option>
                <option value="14_days">14 Days — Standard Client Demo Period</option>
                <option value="30_days">30 Days — 1 Month Commercial Pilot</option>
                <option value="90_days">90 Days — Quarterly Evaluation Agreement</option>
                <option value="180_days">180 Days — Half-Year Commercial Deployment</option>
                <option value="1_year">1 Year (365 Days) — Standard Annual Enterprise License</option>
                <option value="2_years">2 Years (730 Days) — Multi-Year Contract</option>
                <option value="3_years">3 Years (1,095 Days) — Strategic Partner License</option>
                <option value="lifetime">Lifetime (Perpetual Enterprise Installation)</option>
                <option value="custom">Custom Duration (Define Specific Number of Days)</option>
              </select>
            </div>

            {timeFrame === 'custom' && (
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Custom Validity (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || 30)}
                  placeholder="e.g., 45"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>
            )}

            <div className={timeFrame === 'custom' ? 'md:col-span-3' : 'md:col-span-1'}>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Contract Reference / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="PO-2026-X1 or Signed Contract Reference"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Cryptographically Signing Key...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Signed Enterprise License
                </>
              )}
            </button>
          </div>
        </form>

        {/* Generated Result Success Callout */}
        {generatedResult && (
          <div className="mt-6 p-5 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                License Generated Successfully!
              </div>
              <button
                onClick={() => setGeneratedResult(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                Dismiss
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <span className="text-xs text-indigo-400 block mb-0.5">Enterprise License Key:</span>
                <code className="text-sm font-mono text-white font-bold">{generatedResult.licenseKey}</code>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(generatedResult.licenseKey, generatedResult.id)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedKey === generatedResult.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied Key
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Key
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleApplyLicense(generatedResult.licenseKey)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Apply To System Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Organization:</span>
                <strong>{generatedResult.organizationName}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Timeframe:</span>
                <strong>{getTimeframeLabel(generatedResult.timeFrame, generatedResult.customDays)}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Expiration:</span>
                <strong>{new Date(generatedResult.expiresAt).toLocaleDateString()}</strong>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Checksum Signature:</span>
                <code className="text-[10px] text-indigo-400">{generatedResult.checksum.slice(0, 18)}...</code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generated Licenses Vault Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Licenses Vault & Registry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {generatedLicenses.length} signed enterprise license tokens in ledger
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search organization or key..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white w-56"
              />
            </div>

            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">All Tiers</option>
              <option value="trial">Trial</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
              <option value="ultimate">Ultimate</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4">Organization & Key</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Timeframe</th>
                <th className="py-3 px-4">Seats</th>
                <th className="py-3 px-4">Issued / Expires</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredLicenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No licenses match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLicenses.map((lic) => {
                  const isCurrentActive = activeLicense.id === lic.id || activeLicense.licenseKey === lic.licenseKey;
                  const isExpired = new Date(lic.expiresAt).getTime() < Date.now();
                  return (
                    <tr key={lic.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{lic.organizationName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <code className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                {lic.licenseKey}
                              </code>
                              <button
                                onClick={() => handleCopy(lic.licenseKey, lic.id)}
                                title="Copy License Key"
                                className="text-slate-400 hover:text-indigo-600 transition-colors"
                              >
                                {copiedKey === lic.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {lic.tier}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {getTimeframeLabel(lic.timeFrame, lic.customDays)}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {lic.maxUsers} Users
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                          Issued: {new Date(lic.issuedAt).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          Exp: {new Date(lic.expiresAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isCurrentActive && (
                          <span className="mb-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            Active Node
                          </span>
                        )}
                        <div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 ${
                              lic.status === 'revoked'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : isExpired
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {lic.status === 'revoked'
                              ? 'Revoked'
                              : isExpired
                              ? 'Expired'
                              : 'Active'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isCurrentActive && lic.status !== 'revoked' && !isExpired && (
                            <button
                              onClick={() => handleApplyLicense(lic.licenseKey)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold transition-colors"
                              title="Activate as current running license"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() => handleExtend(lic, 30)}
                            className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
                            title="Extend validity +30 days"
                          >
                            +30d
                          </button>
                          {lic.status === 'active' && (
                            <button
                              onClick={() => handleRevoke(lic)}
                              className="px-2 py-1 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium transition-colors"
                              title="Revoke license"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
