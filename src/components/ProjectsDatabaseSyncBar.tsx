import React, { useState, useEffect } from 'react';
import {
  Database,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Zap,
  HardDrive,
  CloudCheck,
  Globe,
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers
} from 'lucide-react';
import { Project, MongoDbStatus, GoogleSheetsSyncConfig } from '../types';
import { storageService } from '../services/storageService';
import { mongoService } from '../services/mongoService';
import { unifiedProjectSyncService, UnifiedSyncResult } from '../services/unifiedProjectSyncService';

interface ProjectsDatabaseSyncBarProps {
  projects: Project[];
  onOpenSheetsModal: () => void;
  onProjectsUpdated?: () => void;
}

export const ProjectsDatabaseSyncBar: React.FC<ProjectsDatabaseSyncBarProps> = ({
  projects,
  onOpenSheetsModal,
  onProjectsUpdated
}) => {
  const [mongoStatus, setMongoStatus] = useState<MongoDbStatus | null>(null);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsSyncConfig>(storageService.getGoogleSheetsConfig());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<UnifiedSyncResult | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const loadStatus = async () => {
    try {
      const status = await mongoService.getStatus();
      setMongoStatus(status);
      setSheetsConfig(storageService.getGoogleSheetsConfig());
    } catch {}
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleDualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setFeedback(null);
    try {
      const result = await unifiedProjectSyncService.syncProjectsToBoth(projects);
      setLastSyncResult(result);
      setSheetsConfig(storageService.getGoogleSheetsConfig());
      await loadStatus();

      if (result.success) {
        setFeedback({
          type: 'success',
          message: `Saved ${result.mongo.count} projects in MongoDB Atlas and updated linked Google Sheet!`
        });
      } else if (result.mongo.success) {
        setFeedback({
          type: 'info',
          message: `Saved ${result.mongo.count} projects in MongoDB Atlas. (Google Sheet: ${result.sheets.message})`
        });
      } else {
        setFeedback({
          type: 'error',
          message: result.mongo.message || 'Sync failed'
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Dual sync failed' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFetchFromMongo = async () => {
    if (isHydrating) return;
    setIsHydrating(true);
    setFeedback(null);
    try {
      const res = await unifiedProjectSyncService.loadProjectsFromMongo();
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Loaded ${res.count} projects from ${res.source} into active view!`
        });
        if (onProjectsUpdated) {
          onProjectsUpdated();
        }
      } else {
        setFeedback({
          type: 'info',
          message: res.error || 'No records in MongoDB to load'
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch from MongoDB' });
    } finally {
      setIsHydrating(false);
    }
  };

  const isMongoConnected = mongoStatus?.connected;
  const isSheetLinked = Boolean(sheetsConfig?.spreadsheetId);

  return (
    <div className="mb-5 rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 text-white border border-slate-700 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Engine identity and status pills */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs font-black tracking-wide text-slate-100 uppercase">
                Project Persistence &amp; Sheet Synchronization
              </h4>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Store
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-300">
              {/* MongoDB pill */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isMongoConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="font-semibold text-slate-200">MongoDB Atlas:</span>
                <span className="font-mono text-[11px] text-emerald-300 font-bold">
                  {isMongoConnected
                    ? `${mongoStatus?.collections?.projects || projects.length} Projects (${mongoStatus?.databaseName || 'alphaerp'})`
                    : 'Connecting / Standby'}
                </span>
              </div>

              <span className="text-slate-600 hidden sm:inline">•</span>

              {/* Google Sheets pill */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSheetLinked ? 'bg-emerald-400' : 'bg-slate-500'
                  }`}
                />
                <span className="font-semibold text-slate-200">Google Sheet:</span>
                {isSheetLinked ? (
                  <a
                    href={sheetsConfig.spreadsheetUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-300 hover:text-emerald-200 underline font-semibold flex items-center gap-1"
                  >
                    <span>{sheetsConfig.spreadsheetName || 'Linked Sheet'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">Not Linked</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleFetchFromMongo}
            disabled={isHydrating || isSyncing}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Fetch latest projects from MongoDB Atlas into active view"
          >
            <ArrowDownToLine className={`w-3.5 h-3.5 text-blue-400 ${isHydrating ? 'animate-bounce' : ''}`} />
            <span>{isHydrating ? 'Fetching...' : 'Fetch from Mongo'}</span>
          </button>

          {!isSheetLinked && (
            <button
              type="button"
              onClick={onOpenSheetsModal}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Link Sheet</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDualSync}
            disabled={isSyncing || isHydrating}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            title="Keep projects in MongoDB Atlas and synchronize with linked Google Sheet"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{isSyncing ? 'Saving & Syncing...' : 'Keep in Mongo & Sync Sheet'}</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`mt-3 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-950/70 border-rose-500/40 text-rose-200'
              : 'bg-blue-950/70 border-blue-500/40 text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Detailed last sync metadata */}
      {lastSyncResult && (
        <div className="mt-3 pt-2.5 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400 font-medium">MongoDB:</span>
            <span className="text-emerald-300 font-semibold">{lastSyncResult.mongo.message}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400 font-medium">Google Sheet:</span>
            <span className={lastSyncResult.sheets.success ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
              {lastSyncResult.sheets.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
