import React, { useState, useEffect } from 'react';
import {
  Mail,
  Server,
  ShieldCheck,
  Key,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  Check,
  ExternalLink,
  Zap,
  Save,
  RotateCcw,
  Sliders,
  Bell,
  Layers
} from 'lucide-react';
import { EmailSmtpConfig, EmailProviderType, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { DEFAULT_EMAIL_CONFIG } from '../data/initialData';

interface EmailSettingsAdminSectionProps {
  currentUser: UserProfile;
}

export const EmailSettingsAdminSection: React.FC<EmailSettingsAdminSectionProps> = ({ currentUser }) => {
  const [config, setConfig] = useState<EmailSmtpConfig>(() => storageService.getEmailConfig());
  const [showPassword, setShowPassword] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [recipientError, setRecipientError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  // Testing states
  const [testRecipient, setTestRecipient] = useState(currentUser.email || 'procurement@alphaerp.com');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    mode: string;
    messageId?: string;
    message: string;
    timestamp: string;
    latencyMs?: number;
  } | null>(null);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setConfig(storageService.getEmailConfig());
    });
    return () => unsub();
  }, []);

  const handleProviderPreset = (provider: EmailProviderType) => {
    switch (provider) {
      case 'mailtrap':
        setConfig((prev) => ({
          ...prev,
          provider: 'mailtrap',
          mode: 'mock',
          host: 'smtp.mailtrap.io',
          port: 587,
          secure: false,
          username: 'procurement-sandbox@alphaerp.com',
          password: 'demo_smtp_key_884920',
          senderName: 'AlphaERP Automated Notification Engine',
          senderEmail: 'notifications@alphaerp.com'
        }));
        break;
      case 'ethereal':
        setConfig((prev) => ({
          ...prev,
          provider: 'ethereal',
          mode: 'mock',
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          username: 'ethereal-test@alphaerp.com',
          password: 'demo_ethereal_secret_key',
          senderName: 'AlphaERP Inventory Control',
          senderEmail: 'notifications@alphaerp.com'
        }));
        break;
      case 'gmail':
        setConfig((prev) => ({
          ...prev,
          provider: 'gmail',
          mode: 'smtp',
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          username: currentUser.email || 'your-account@gmail.com',
          senderName: 'AlphaERP Cloud Notifications',
          senderEmail: currentUser.email || 'your-account@gmail.com'
        }));
        break;
      case 'office365':
        setConfig((prev) => ({
          ...prev,
          provider: 'office365',
          mode: 'smtp',
          host: 'smtp.office365.com',
          port: 587,
          secure: false,
          username: currentUser.email || 'user@company.com',
          senderName: 'AlphaERP Corporate Dispatch',
          senderEmail: currentUser.email || 'user@company.com'
        }));
        break;
      case 'sendgrid':
        setConfig((prev) => ({
          ...prev,
          provider: 'sendgrid',
          mode: 'smtp',
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          username: 'apikey',
          senderName: 'AlphaERP Notification Engine',
          senderEmail: 'notifications@alphaerp.com'
        }));
        break;
      case 'custom_smtp':
      default:
        setConfig((prev) => ({
          ...prev,
          provider: 'custom_smtp',
          mode: 'smtp',
          host: 'mail.yourcompany.com',
          port: 587,
          secure: false
        }));
        break;
    }
  };

  const handleAddRecipient = () => {
    const trimmed = newRecipient.trim();
    if (!trimmed) return;
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setRecipientError('Please enter a valid email address');
      return;
    }
    if (config.defaultRecipients.includes(trimmed)) {
      setRecipientError('This recipient email is already in the list');
      return;
    }
    setRecipientError('');
    setConfig((prev) => ({
      ...prev,
      defaultRecipients: [...prev.defaultRecipients, trimmed]
    }));
    setNewRecipient('');
  };

  const handleRemoveRecipient = (emailToRemove: string) => {
    setConfig((prev) => ({
      ...prev,
      defaultRecipients: prev.defaultRecipients.filter((e) => e !== emailToRemove)
    }));
  };

  const handleSave = () => {
    try {
      storageService.updateEmailConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to save email settings');
    }
  };

  const handleResetToDummy = () => {
    if (window.confirm('Reset all email settings to the default dummy sandbox configuration?')) {
      const reset = storageService.resetEmailConfig();
      setConfig(reset);
      setTestResult(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleRunTest = async () => {
    if (!testRecipient || !testRecipient.includes('@')) {
      alert('Please enter a valid test recipient email address');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await storageService.testEmailConnection(config, testRecipient);
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        mode: config.mode,
        message: err?.message || 'Connection test failed',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div id="email-settings-admin-container" className="space-y-6">
      {/* SUCCESS BANNER */}
      {saveSuccess && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl transition-all animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Email configuration saved successfully & synced with notification services.</span>
          </div>
          <button
            onClick={() => setSaveSuccess(false)}
            className="text-xs px-2 py-1 bg-emerald-200/60 hover:bg-emerald-200 text-emerald-900 rounded-md font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* HEADER CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">Automated Email & SMTP Dispatch Engine</h2>
                {config.mode === 'mock' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Dummy Sandbox Mode (Testing Active)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Live SMTP Relay Active
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-1 max-w-3xl">
                Configure outbound email delivery for automated inventory reorder alerts, supplier purchase orders, client invoices, and management KPI digests. Currently configured with dummy test parameters for frictionless development, with full controls to switch to real SMTP anytime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            <button
              onClick={handleResetToDummy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              title="Revert all fields back to standard dummy test values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Dummy
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Configuration
            </button>
          </div>
        </div>

        {/* MODE TOGGLE BANNER */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/80 -mx-6 -mb-6 p-5 rounded-b-2xl">
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-700">Dispatch Operating Mode:</div>
            <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, mode: 'mock' }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  config.mode === 'mock'
                    ? 'bg-amber-100 text-amber-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🧪 Dummy Sandbox (Testing)
              </button>
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, mode: 'smtp' }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  config.mode === 'smtp'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Live SMTP Relay
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Enabled Engine:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
            <span className="font-semibold text-slate-700">{config.enabled ? 'Active' : 'Disabled'}</span>
          </div>
        </div>
      </div>

      {/* QUICK PRESETS BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Quick Configuration Presets</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowHelpGuide(!showHelpGuide)}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showHelpGuide ? 'Hide Credentials Guide' : 'How to configure external SMTP'}
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Click any preset to automatically populate host, port, and security parameters:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            type="button"
            onClick={() => handleProviderPreset('mailtrap')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              config.provider === 'mailtrap'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">Mailtrap</div>
            <div className="text-[11px] text-slate-500">Dummy Sandbox</div>
          </button>

          <button
            type="button"
            onClick={() => handleProviderPreset('ethereal')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              config.provider === 'ethereal'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">Ethereal Email</div>
            <div className="text-[11px] text-slate-500">Free Mock SMTP</div>
          </button>

          <button
            type="button"
            onClick={() => handleProviderPreset('gmail')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              config.provider === 'gmail'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">Google / Gmail</div>
            <div className="text-[11px] text-slate-500">App Password</div>
          </button>

          <button
            type="button"
            onClick={() => handleProviderPreset('office365')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              config.provider === 'office365'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">Microsoft 365</div>
            <div className="text-[11px] text-slate-500">Outlook SMTP</div>
          </button>

          <button
            type="button"
            onClick={() => handleProviderPreset('sendgrid')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              config.provider === 'sendgrid'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">SendGrid</div>
            <div className="text-[11px] text-slate-500">API Key Relay</div>
          </button>

          <button
            type="button"
            onClick={() => handleProviderPreset('custom_smtp')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              config.provider === 'custom_smtp'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">Custom SMTP</div>
            <div className="text-[11px] text-slate-500">Corporate Mail</div>
          </button>
        </div>

        {/* GUIDANCE CALLOUT */}
        {showHelpGuide && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Instructions for Real Email Relay Setup
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>
                <strong>Testing & Sandbox (Current default):</strong> Keep Mode set to <em>Dummy Sandbox</em>. Any simulated alerts generate valid RFC message IDs and log to the audit trail without external mail dependencies.
              </li>
              <li>
                <strong>Gmail / Google Workspace:</strong> Enable 2-Step Verification on your Google Account, then create an <strong>App Password</strong> under <em>Security → 2-Step Verification → App passwords</em>. Use host <code className="bg-white px-1 py-0.5 rounded border border-slate-200">smtp.gmail.com</code>, port <code className="bg-white px-1 py-0.5 rounded border border-slate-200">587</code>, your Gmail address as username, and the 16-character App Password.
              </li>
              <li>
                <strong>SendGrid:</strong> Use host <code className="bg-white px-1 py-0.5 rounded border border-slate-200">smtp.sendgrid.net</code>, port <code className="bg-white px-1 py-0.5 rounded border border-slate-200">587</code>, username <code className="bg-white px-1 py-0.5 rounded border border-slate-200">apikey</code>, and your SendGrid API key as password.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* TWO COLUMN CONFIGURATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CONNECTION CREDENTIALS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Server className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">SMTP Server & Authentication Parameters</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  SMTP Host Server
                </label>
                <input
                  type="text"
                  value={config.host}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  placeholder="e.g. smtp.mailtrap.io or smtp.gmail.com"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Port
                </label>
                <input
                  type="number"
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: Number(e.target.value) || 587 })}
                  placeholder="587"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 py-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.secure}
                  onChange={(e) => setConfig({ ...config, secure: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>SSL / TLS Encryption (typically Port 465)</span>
              </label>
              <span className="text-[11px] text-slate-400">Default Port 587 uses STARTTLS automatically</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  SMTP Username / Auth ID
                </label>
                <input
                  type="text"
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                  placeholder="procurement@alphaerp.com"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    SMTP Password / App Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPassword ? 'Mask' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={config.password || ''}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={config.senderName}
                  onChange={(e) => setConfig({ ...config, senderName: e.target.value })}
                  placeholder="AlphaERP Notification Engine"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Outbound From Email Address
                </label>
                <input
                  type="email"
                  value={config.senderEmail}
                  onChange={(e) => setConfig({ ...config, senderEmail: e.target.value })}
                  placeholder="notifications@alphaerp.com"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reply-To Email (Optional)
              </label>
              <input
                type="email"
                value={config.replyToEmail || ''}
                onChange={(e) => setConfig({ ...config, replyToEmail: e.target.value })}
                placeholder="procurement@alphaerp.com"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Incoming replies to automated emails will be routed to this inbox.
              </p>
            </div>
          </div>

          {/* NOTIFICATION EVENT TRIGGERS MATRIX */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Automated Notification Event Triggers</h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.procurementAlertsEnabled}
                  onChange={(e) => setConfig({ ...config, procurementAlertsEnabled: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Inventory Safety Stock & Reorder Alerts</div>
                  <div className="text-[11px] text-slate-500">
                    Dispatches automated alerts to procurement officers when warehouse items breach safety stock or minimum reorder levels.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.poDispatchEnabled}
                  onChange={(e) => setConfig({ ...config, poDispatchEnabled: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Purchase Order (PO) Vendor Transmission</div>
                  <div className="text-[11px] text-slate-500">
                    Sends authorized purchase order documentation, schedule dates, and item requirements directly to vendor email contacts.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.invoiceRemindersEnabled}
                  onChange={(e) => setConfig({ ...config, invoiceRemindersEnabled: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Milestone Tax Invoices & Payment Reminders</div>
                  <div className="text-[11px] text-slate-500">
                    Transmits commercial invoices and upcoming milestone payment schedules to client finance contacts.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.workOrderDispatchEnabled}
                  onChange={(e) => setConfig({ ...config, workOrderDispatchEnabled: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">Field Site Work Order Technician Briefing</div>
                  <div className="text-[11px] text-slate-500">
                    Emails HVAC site engineers and technicians their task assignments, site addresses, and safety protocols.
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DISTRIBUTION LIST & LIVE TEST SUITE */}
        <div className="lg:col-span-5 space-y-6">
          {/* DEFAULT RECIPIENTS CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Default Notification Distribution List</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                {config.defaultRecipients.length} Recipient(s)
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Outbound system alerts will be sent to these addresses unless overridden by a specific workflow:
            </p>

            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {config.defaultRecipients.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-lg text-xs font-mono transition-colors"
                >
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient(email)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove recipient"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {config.defaultRecipients.length === 0 && (
                <div className="text-xs text-slate-400 italic py-2">
                  No default recipients configured. Add one below.
                </div>
              )}
            </div>

            {/* ADD RECIPIENT INPUT */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newRecipient}
                  onChange={(e) => {
                    setNewRecipient(e.target.value);
                    if (recipientError) setRecipientError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRecipient();
                    }
                  }}
                  placeholder="Add recipient email..."
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddRecipient}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
              {recipientError && (
                <p className="text-[11px] text-rose-600 mt-1">{recipientError}</p>
              )}

              {currentUser.email && !config.defaultRecipients.includes(currentUser.email) && (
                <button
                  type="button"
                  onClick={() => {
                    setConfig((prev) => ({
                      ...prev,
                      defaultRecipients: [...prev.defaultRecipients, currentUser.email]
                    }));
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold mt-2 inline-flex items-center gap-1"
                >
                  + Add Current User ({currentUser.email})
                </button>
              )}
            </div>
          </div>

          {/* INTERACTIVE LIVE TEST SUITE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Send className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Interactive Email Dispatcher Test</h3>
            </div>

            <p className="text-xs text-slate-500">
              Verify connection health, SMTP handshake, or dummy sandbox dispatch by firing a test notification:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Send Test Email To:
              </label>
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="procurement@alphaerp.com"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleRunTest}
              disabled={isTesting}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
                isTesting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'
              }`}
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Testing Dispatch Engine...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Test Verification Email
                </>
              )}
            </button>

            {/* TEST RESULT REPORT BOX */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 animate-fadeIn ${
                  testResult.success
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    {testResult.success ? 'Dispatch Test Verified' : 'Dispatch Test Failed'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/70">
                    {testResult.mode.toUpperCase()}
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed">{testResult.message}</p>

                <div className="pt-2 border-t border-emerald-200/60 font-mono text-[10px] text-slate-600 space-y-0.5">
                  {testResult.messageId && <div>Message ID: {testResult.messageId}</div>}
                  {testResult.latencyMs && <div>Roundtrip: {testResult.latencyMs} ms</div>}
                  <div>Timestamp: {new Date(testResult.timestamp).toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* PREVIOUS RECORDED TEST */}
            {!testResult && config.lastTestedAt && (
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Last Automated Verification:</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      config.lastTestStatus === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {config.lastTestStatus}
                  </span>
                </div>
                {config.lastTestMessage && <p className="text-slate-500">{config.lastTestMessage}</p>}
                <p className="text-[10px] text-slate-400">
                  {new Date(config.lastTestedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
