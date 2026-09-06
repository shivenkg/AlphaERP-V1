import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Download,
  CheckCircle2,
  Table,
  Layers,
  Database,
  Search,
  Sparkles,
  AlertCircle,
  PlusCircle,
  Link2,
  Unlink,
  LogIn,
  Check,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { GoogleSheetsSyncConfig } from '../types';
import { googleSheetsService } from '../services/googleSheets';

interface GoogleSheetIntegrationModalProps {
  sheetsConfig: GoogleSheetsSyncConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetIntegrationModal: React.FC<GoogleSheetIntegrationModalProps> = ({
  sheetsConfig,
  isOpen,
  onClose
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [searchTable, setSearchTable] = useState<string>('');
  const [customSheetUrl, setCustomSheetUrl] = useState<string>('');
  const [showLinkInput, setShowLinkInput] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

  const googleUser = googleSheetsService.getCurrentFirebaseUser();
  const allTabs = googleSheetsService.generateAllSheetTabsData();
  const currentTab = allTabs[activeSheetIndex] || allTabs[0];
  const currentSheetData = currentTab ? currentTab.values : [];

  const isSheetConnected = Boolean(sheetsConfig.spreadsheetId && sheetsConfig.spreadsheetUrl);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const handleGoogleAuth = async () => {
    setIsAuthorizing(true);
    setErrorMessage(null);
    try {
      await googleSheetsService.signInWithGoogle();
      setSuccessMessage('Google Workspace authorized successfully!');
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to authenticate with Google.');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleCreateMasterSheet = async () => {
    setIsCreating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await googleSheetsService.createMasterGoogleSheet();
      setSuccessMessage('Created and synchronized master spreadsheet in your Google Drive!');
      // Open in new tab
      if (res.spreadsheetUrl) {
        window.open(res.spreadsheetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'Failed to create Google Spreadsheet. Ensure popup was not blocked.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSyncCurrentSheet = async () => {
    setIsSyncing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await googleSheetsService.syncToGoogleSheet();
      setSuccessMessage('All 10 module tabs updated in your Google Sheet!');
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'Failed to synchronize with Google Sheet.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLinkExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSheetUrl.trim()) return;

    setIsLinking(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await googleSheetsService.linkExistingGoogleSheet(customSheetUrl);
      setSuccessMessage('Successfully linked and synchronized existing Google Sheet!');
      setShowLinkInput(false);
      setCustomSheetUrl('');
      if (res.spreadsheetUrl) {
        window.open(res.spreadsheetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'Failed to link Google Sheet. Verify the URL/ID and permissions.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = () => {
    if (window.confirm('Disconnect this Google Sheet from AlphaERP? You can reconnect or create a new sheet anytime.')) {
      googleSheetsService.unlinkCurrentSheet();
      setSuccessMessage('Google Sheet disconnected.');
    }
  };

  const handleExportCSV = () => {
    googleSheetsService.exportTabAsCsv(activeSheetIndex);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Navigation Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Google Sheets Integration & Live Master Sync
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Live multi-tab synchronization connecting CRM leads, quotes, projects, BOQ inventory, PR/POs, and finance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isSheetConnected && (
              <button
                onClick={handleSyncCurrentSheet}
                disabled={isSyncing || isCreating}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Pushing Data...' : 'Sync to Sheets'}</span>
              </button>
            )}

            {isSheetConnected && sheetsConfig.spreadsheetUrl && (
              <a
                href={sheetsConfig.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 shadow-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open in Sheets</span>
              </a>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 shadow-xs cursor-pointer"
              title="Download CSV for current tab"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Tab CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Alert / Error / Success Messages */}
        {errorMessage && (
          <div className="px-4.5 py-3 bg-rose-50 border-b border-rose-200 flex items-start justify-between gap-3 text-xs text-rose-800 flex-shrink-0">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Google Sheet Connection Issue:</strong> {errorMessage}
                <div className="text-[11px] text-rose-700 mt-0.5">
                  If the previous sheet was deleted or inaccessible, click <strong>"Create Master Sheet in My Google Drive"</strong> below to generate a new live spreadsheet.
                </div>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 font-bold px-2"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="px-4.5 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-800 flex-shrink-0 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 font-bold px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Connection Setup & Status Banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex-shrink-0">
          {!isSheetConnected ? (
            <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl flex-shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      No Google Sheet Linked to AlphaERP
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Create an authentic 10-tab master spreadsheet in your Google Drive or link an existing Google Sheet to start syncing ERP records.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCreateMasterSheet}
                    disabled={isCreating || isSyncing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Creating in Google Drive...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>Create Master Sheet in My Drive (1-Click)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 shadow-xs cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Link Existing Sheet URL</span>
                  </button>
                </div>
              </div>

              {showLinkInput && (
                <form onSubmit={handleLinkExisting} className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customSheetUrl}
                    onChange={(e) => setCustomSheetUrl(e.target.value)}
                    placeholder="Paste Google Sheet URL (https://docs.google.com/spreadsheets/d/.../edit) or Sheet ID"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isLinking || !customSheetUrl.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isLinking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{isLinking ? 'Verifying...' : 'Link & Sync Now'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkInput(false)}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{sheetsConfig.spreadsheetName || 'Connected Master Spreadsheet'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Live Connected
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] flex flex-wrap items-center gap-3 mt-0.5">
                    <span className="font-mono">ID: {sheetsConfig.spreadsheetId}</span>
                    {sheetsConfig.lastSyncAt && (
                      <span>• Last synced: {new Date(sheetsConfig.lastSyncAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCreateMasterSheet}
                  disabled={isCreating || isSyncing}
                  title="Generate a fresh new spreadsheet in your Google Drive"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Create Fresh Sheet</span>
                </button>

                <button
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Change Sheet</span>
                </button>

                <button
                  onClick={handleUnlink}
                  title="Disconnect this sheet"
                  className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  <Unlink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {isSheetConnected && showLinkInput && (
            <form onSubmit={handleLinkExisting} className="mt-2.5 p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customSheetUrl}
                onChange={(e) => setCustomSheetUrl(e.target.value)}
                placeholder="Enter new Google Sheet URL or ID..."
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="submit"
                disabled={isLinking || !customSheetUrl.trim()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {isLinking ? 'Switching...' : 'Switch to Sheet'}
              </button>
              <button
                type="button"
                onClick={() => setShowLinkInput(false)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {/* Sheet Tabs Ribbon */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
          {allTabs.map((tab, idx) => {
            const isActive = activeSheetIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveSheetIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Table className="w-3 h-3" />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter inside table */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              placeholder="Search in current sheet tab..."
              className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400"
            />
          </div>
          <div className="text-slate-500 text-[11px] font-medium flex items-center gap-2">
            <span>
              {Math.max(0, currentSheetData.length - 1)} data rows in <strong className="text-slate-900">{currentTab?.title}</strong>
            </span>
          </div>
        </div>

        {/* Table Viewer (Google Sheets Live Grid Simulation) */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4 font-mono text-xs">
          {currentSheetData.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-sans">No data available for this tab.</div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden inline-block min-w-full shadow-xs">
              <table className="w-full border-collapse">
                {/* Header Row */}
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="p-2 border-r border-slate-200 text-center w-10 text-slate-400 font-sans text-[10px]">
                      #
                    </th>
                    {currentSheetData[0]?.map((colName, idx) => (
                      <th
                        key={idx}
                        className="p-2.5 text-left border-r border-slate-200 last:border-r-0 whitespace-nowrap text-xs font-semibold"
                      >
                        {String(colName ?? '')}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Body Rows */}
                <tbody className="divide-y divide-slate-100">
                  {currentSheetData
                    .slice(1)
                    .filter((row) =>
                      searchTable === ''
                        ? true
                        : row.some((cell) => String(cell ?? '').toLowerCase().includes(searchTable.toLowerCase()))
                    )
                    .map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className={rowIdx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/60 hover:bg-slate-50'}
                      >
                        <td className="p-2 border-r border-slate-200 text-center text-slate-400 text-[10px] font-sans">
                          {rowIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="p-2 border-r border-slate-200 last:border-r-0 text-slate-700 whitespace-nowrap"
                          >
                            {String(cell ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
