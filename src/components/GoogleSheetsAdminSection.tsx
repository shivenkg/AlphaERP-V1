import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  Key,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  HelpCircle,
  Database,
  Upload,
  Download,
  ShieldCheck,
  Activity,
  X,
  LogIn,
  LogOut,
  Clock,
  UserCheck
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { googleSheetsService } from '../services/googleSheets';
import {
  GoogleSheetsSyncConfig,
  GoogleSheetBackupStats,
  GoogleSheetRestorePreview,
  GoogleSheetRestoreResult
} from '../types';

export const GoogleSheetsAdminSection: React.FC = () => {
  const [config, setConfig] = useState<GoogleSheetsSyncConfig>(storageService.getGoogleSheetsConfig());
  const [sheetIdInput, setSheetIdInput] = useState<string>(config.spreadsheetId || '');
  const [apiKeyInput, setApiKeyInput] = useState<string>(config.apiKey || '');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Auth Status state
  const [authStatus, setAuthStatus] = useState(() => googleSheetsService.getAuthStatus());

  // Cloud Master & Transaction Vault Backup / Restore states
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const [restorePreview, setRestorePreview] = useState<GoogleSheetRestorePreview | null>(null);
  const [restoreResult, setRestoreResult] = useState<GoogleSheetRestoreResult | null>(null);
  const [backupStats, setBackupStats] = useState<GoogleSheetBackupStats | null>(config.lastBackupStats || null);
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);

  const refreshAuthStatus = useCallback(() => {
    setAuthStatus(googleSheetsService.getAuthStatus());
  }, []);

  useEffect(() => {
    refreshAuthStatus();
    const interval = setInterval(refreshAuthStatus, 15000);
    const unsub = storageService.subscribe(() => {
      const current = storageService.getGoogleSheetsConfig();
      setConfig(current);
      refreshAuthStatus();
    });
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [refreshAuthStatus]);

  const handleAuthorizeGoogle = async () => {
    if (isAuthorizing) return;
    setIsAuthorizing(true);
    setSyncStatusMsg(null);

    try {
      const authRes = await googleSheetsService.signInWithGoogle();
      refreshAuthStatus();
      if (authRes.token) {
        setApiKeyInput(authRes.token);
      }
      setSyncStatusMsg({
        type: 'success',
        message: `Google Workspace authorized successfully (${authRes.user?.email || 'Account connected'})! Automatic token refresh is active.`
      });
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        message: err.message || 'Failed to authenticate with Google Workspace.'
      });
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleClearAuth = () => {
    googleSheetsService.clearAuthToken();
    setApiKeyInput('');
    refreshAuthStatus();
    setSyncStatusMsg({
      type: 'info',
      message: 'Google Sheets authorization cleared. You can re-authenticate anytime.'
    });
  };

  const handleSaveCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = googleSheetsService.saveConfigCredentials(sheetIdInput, apiKeyInput);
      setSheetIdInput(res.spreadsheetId);
      setSaveSuccess(true);
      setSyncStatusMsg({
        type: 'success',
        message: 'Google Sheets ID and API Key saved persistently. Quick Sync will now execute directly without prompts.'
      });
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        message: err.message || 'Failed to save Google Sheets configuration.'
      });
    }
  };

  const handleTestAndQuickSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatusMsg(null);

    try {
      // First ensure the credentials currently in fields are saved
      googleSheetsService.saveConfigCredentials(sheetIdInput, apiKeyInput);

      const res = await googleSheetsService.syncToGoogleSheet();
      setSyncStatusMsg({
        type: 'success',
        message: `Quick Sync successful! All 10 ERP modules synced to Google Sheets (${new Date().toLocaleTimeString()}).`
      });
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        message: err.message || 'Quick Sync failed. Please check your Google Sheet ID and API key permissions.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySheetId = () => {
    if (!sheetIdInput) return;
    navigator.clipboard.writeText(sheetIdInput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCreateNewMasterSheet = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const res = await googleSheetsService.createMasterGoogleSheet();
      setSheetIdInput(res.spreadsheetId);
      setSyncStatusMsg({
        type: 'success',
        message: `Brand new Google Sheet created and linked! ID: ${res.spreadsheetId}`
      });
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        message: err.message || 'Failed to create new master Google Sheet.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBackupAll = async () => {
    if (isBackingUp || isSyncing) return;
    setIsBackingUp(true);
    setSyncStatusMsg(null);

    try {
      // Save credentials first if edited
      googleSheetsService.saveConfigCredentials(sheetIdInput, apiKeyInput);

      const res = await googleSheetsService.backupToGoogleSheet();
      setBackupStats(res.stats);
      setSyncStatusMsg({
        type: 'success',
        message: `Cloud Backup Succeeded: ${res.stats.totalMasterRecords} master records and ${res.stats.totalTransactionRecords} transaction records backed up to Google Sheet.`
      });
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        message: err.message || 'Failed to backup master and transaction data to Google Sheet.'
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleInitiateRestore = async () => {
    if (isPreviewing || isRestoring) return;
    setIsPreviewing(true);
    setSyncStatusMsg(null);

    try {
      googleSheetsService.saveConfigCredentials(sheetIdInput, apiKeyInput);
      const preview = await googleSheetsService.previewRestoreFromGoogleSheet();
      setRestorePreview(preview);
      setShowRestoreModal(true);
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        message: err.message || 'Failed to inspect linked Google Sheet for restoration.'
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleExecuteRestore = async () => {
    if (isRestoring) return;
    setIsRestoring(true);

    try {
      const result = await googleSheetsService.restoreFromGoogleSheet();
      setRestoreResult(result);
      setShowRestoreModal(false);
      const totalCollections = Object.keys(result.masterCounts).length + Object.keys(result.transactionCounts).length;
      setSyncStatusMsg({
        type: 'success',
        message: `Cloud Restoration Complete: Restored ${result.totalMasterRecords} master records and ${result.totalTransactionRecords} transaction records across ${totalCollections} collections!`
      });
    } catch (err: any) {
      setSyncStatusMsg({
        type: 'error',
        message: err.message || 'Failed to restore database from Google Sheet.'
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const effectiveSheetUrl = sheetIdInput
    ? `https://docs.google.com/spreadsheets/d/${sheetIdInput.trim()}/edit`
    : config.spreadsheetUrl;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border border-emerald-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Google Sheets API & Cloud Synchronization</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Persistent Storage
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                Configure your target Google Spreadsheet ID and API Key / OAuth Bearer Token. Credentials are automatically remembered and stored persistently in the database, allowing Quick Sync to execute instantly without recurring prompts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {effectiveSheetUrl && (
              <a
                href={effectiveSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-emerald-400 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>Open in Sheets</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleTestAndQuickSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Quick Sync Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback status banner */}
      {syncStatusMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in ${
            syncStatusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : syncStatusMsg.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncStatusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : syncStatusMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
            <span>{syncStatusMsg.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncStatusMsg(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Google Workspace Account & OAuth Authorization Status Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-3 rounded-xl text-white shadow-xs shrink-0 ${
                authStatus.isAuthenticated
                  ? 'bg-emerald-600'
                  : authStatus.isExpired
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
            >
              {authStatus.isAuthenticated ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <Key className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Google Workspace Authorization & Token Lifecycle
                </h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    authStatus.isAuthenticated
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : authStatus.isExpired
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {authStatus.isAuthenticated
                    ? 'Active & Authenticated'
                    : authStatus.isExpired
                    ? 'Authorization Expired'
                    : 'Not Authorized'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                {authStatus.isAuthenticated
                  ? `Authorized Google Account: ${authStatus.email || 'Connected'}. Active session with automatic 401 retry & token renewal.`
                  : authStatus.isExpired
                  ? 'Your Google OAuth token has expired. Click "Re-Authenticate with Google" below to refresh credentials without leaving this page.'
                  : 'Connect your Google Workspace account to grant AlphaERP permission to read, write, and create spreadsheets directly in your Google Drive.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {authStatus.isAuthenticated && (
              <button
                type="button"
                onClick={handleClearAuth}
                title="Disconnect stored credentials"
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAuthorizeGoogle}
              disabled={isAuthorizing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-50 ${
                authStatus.isAuthenticated
                  ? 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isAuthorizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>
                    {authStatus.isAuthenticated
                      ? 'Re-Authenticate with Google'
                      : authStatus.isExpired
                      ? 'Re-Authenticate Expired Token'
                      : 'Authorize Google Workspace (1-Click)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {authStatus.isAuthenticated && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Account: <strong>{authStatus.email || 'Authenticated User'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>
                Session Remaining: <strong>{authStatus.expiresInMinutes > 0 ? `~${authStatus.expiresInMinutes} mins` : 'Active'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Auto-Refresh: <strong>Transparent 401 Interceptor Active</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Form Settings Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
        <form onSubmit={handleSaveCredentials} className="space-y-4">
          {/* Google Sheet ID Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>Google Sheet ID or Full Spreadsheet URL</span>
                <span className="text-rose-500">*</span>
              </label>
              {sheetIdInput && (
                <button
                  type="button"
                  onClick={handleCopySheetId}
                  className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copied' : 'Copy ID'}</span>
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={sheetIdInput}
                onChange={(e) => setSheetIdInput(e.target.value)}
                placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms or paste full docs.google.com URL"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              You can paste either the raw Sheet ID or the entire Google Spreadsheet URL from your browser address bar. The ID will be parsed and saved.
            </p>
          </div>

          {/* Google Sheets API Key / Token Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>Google Sheets API Key / Access Token</span>
              </label>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
              >
                {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showApiKey ? 'Hide' : 'Reveal'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy... or OAuth Access Token / Service Account Key"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-10"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              This API key is permanently retained in application storage until updated by an Admin. Quick Sync will automatically authorize requests using this saved key.
            </p>
          </div>

          {/* Sync Stats & Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Status</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    config.syncStatus === 'success'
                      ? 'bg-emerald-500'
                      : config.syncStatus === 'syncing'
                      ? 'bg-amber-500 animate-ping'
                      : config.syncStatus === 'error'
                      ? 'bg-rose-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="capitalize">{config.syncStatus}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Last Synced</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                {config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString() : 'Never synced'}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Sync Scope</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                10 ERP Modules (KPIs, CRM, Quotes, BOQs, Warehouse, POs, etc.)
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCreateNewMasterSheet}
              disabled={isSyncing}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Generate New Master Google Sheet</span>
            </button>

            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Credentials Saved!
                </span>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ENTERPRISE CLOUD MASTER & TRANSACTION DATA VAULT (BACKUP & RESTORE) */}
      <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Full Master & Transaction Cloud Vault
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  24 Collections
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full-state cloud backup and restoration covering all master definitions and operational transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 bg-emerald-50/50 dark:bg-slate-800/50 rounded-xl border border-emerald-100 dark:border-slate-700 text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Master Data Records</div>
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {backupStats ? `${backupStats.totalMasterRecords} Records` : 'Clients, Vendors, SKUs, Staff...'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Transaction Records</div>
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {backupStats ? `${backupStats.totalTransactionRecords} Records` : 'Leads, Quotes, POs, Orders...'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Last Vault Backup</div>
            <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
              {config.lastBackupAt ? new Date(config.lastBackupAt).toLocaleString() : 'Never backed up'}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Last Vault Restore</div>
            <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
              {config.lastRestoreAt ? new Date(config.lastRestoreAt).toLocaleString() : 'Never restored'}
            </div>
          </div>
        </div>

        {/* Restoration Result Banner */}
        {restoreResult && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Restoration Succeeded</span>
            </div>
            <p>
              Restored {restoreResult.totalMasterRecords} master data records and {restoreResult.totalTransactionRecords} transactions across {Object.keys(restoreResult.masterCounts).length + Object.keys(restoreResult.transactionCounts).length} collections.
            </p>
          </div>
        )}

        {/* Backup & Restore Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleBackupAll}
            disabled={isBackingUp || isSyncing || isRestoring}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isBackingUp ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Serializing & Backing Up to Sheet...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Backup All Master & Transaction Data</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleInitiateRestore}
            disabled={isBackingUp || isSyncing || isRestoring || isPreviewing}
            className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPreviewing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Reading Sheet Vault...</span>
              </>
            ) : (
              <>
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Restore All from Google Sheet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RESTORE INSPECTION & CONFIRMATION MODAL */}
      {showRestoreModal && restorePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                    Confirm Google Sheet Cloud Restoration
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verify records to restore into the active AlphaERP database.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Source Info */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Source Spreadsheet:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {restorePreview.spreadsheetTitle}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vault Mode:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-md text-[10px] ${
                    restorePreview.vaultFound
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {restorePreview.vaultFound
                    ? 'Serialized Data Vault (DataVault_DoNotEdit)'
                    : 'Multi-Tab Reconstruction'}
                </span>
              </div>
            </div>

            {/* Collections Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-slate-800/60 border border-emerald-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-300">
                    Master Data Collections
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    {restorePreview.totalMasterRecords} Total
                  </span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
                  {Object.entries(restorePreview.masterCounts).map(([name, count]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between py-1 px-2 rounded-lg bg-white dark:bg-slate-800 text-[11px]"
                    >
                      <span className="text-slate-700 dark:text-slate-300">{name}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{Number(count)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-50/50 dark:bg-slate-800/60 border border-teal-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-950 dark:text-teal-300">
                    Transaction Collections
                  </span>
                  <span className="text-[11px] font-bold text-teal-800 dark:text-teal-400 bg-teal-100 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                    {restorePreview.totalTransactionRecords} Total
                  </span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs">
                  {Object.entries(restorePreview.transactionCounts).map(([name, count]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between py-1 px-2 rounded-lg bg-white dark:bg-slate-800 text-[11px]"
                    >
                      <span className="text-slate-700 dark:text-slate-300">{name}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{Number(count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Safety Snapshot Guarantee */}
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>
                <strong>Safety Snapshot:</strong> AlphaERP will record a local safety backup snapshot before restoring, so you can revert anytime if needed.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                disabled={isRestoring}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={isRestoring}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Restoring Database...</span>
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

      {/* Explanatory Help Card */}
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
          <span>Quick Sync Persistence Guarantee</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed">
          <li>
            <strong>Permanent Retention:</strong> Your Google Sheet ID and API key are saved persistently in application local storage. They remain active until an administrator updates or clears them.
          </li>
          <li>
            <strong>Silent Quick Sync:</strong> Once your credentials are saved here, clicking the Quick Sync button in the header or dashboard will automatically synchronize all 10 ERP modules in the background without opening OAuth popups.
          </li>
          <li>
            <strong>Sheet Permissions:</strong> Make sure the Google Spreadsheet is accessible by the account associated with your API credentials, with Editor/Writer access enabled.
          </li>
        </ul>
      </div>
    </div>
  );
};
