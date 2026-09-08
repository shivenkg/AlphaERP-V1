import React, { useState, useEffect } from 'react';
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
  Database
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { googleSheetsService } from '../services/googleSheets';
import { GoogleSheetsSyncConfig } from '../types';

export const GoogleSheetsAdminSection: React.FC = () => {
  const [config, setConfig] = useState<GoogleSheetsSyncConfig>(storageService.getGoogleSheetsConfig());
  const [sheetIdInput, setSheetIdInput] = useState<string>(config.spreadsheetId || '');
  const [apiKeyInput, setApiKeyInput] = useState<string>(config.apiKey || '');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      const current = storageService.getGoogleSheetsConfig();
      setConfig(current);
    });
    return () => unsub();
  }, []);

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
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {syncStatusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
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
