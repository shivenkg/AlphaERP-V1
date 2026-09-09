import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HardDrive,
  Activity,
  Layers,
  ShieldCheck,
  Zap,
  Info,
  ExternalLink,
  Lock,
  Server,
  Terminal,
  FileCheck2,
  X,
  Copy,
  Globe,
  Settings,
  KeyRound,
  FileSpreadsheet,
  ArrowDownToLine
} from 'lucide-react';
import { mongoService } from '../services/mongoService';
import { storageService } from '../services/storageService';
import { unifiedProjectSyncService } from '../services/unifiedProjectSyncService';
import {
  MongoDbStatus,
  MongoMigrationResult,
  MongoRestoreResult
} from '../types';

export const MongoDbAdminSection: React.FC = () => {
  const [status, setStatus] = useState<MongoDbStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isPinging, setIsPinging] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customUriInput, setCustomUriInput] = useState('');
  const [customDbInput, setCustomDbInput] = useState('alphaerp');
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [migrationResult, setMigrationResult] = useState<MongoMigrationResult | null>(null);
  const [restoreResult, setRestoreResult] = useState<MongoRestoreResult | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Active state counts for previewing what will be migrated
  const allData = storageService.getAllData();
  const currentMasterCount = [
    allData.clients?.length || 0,
    allData.vendors?.length || 0,
    allData.inventory?.length || 0,
    allData.salesReps?.length || 0,
    allData.costCenters?.length || 0,
    allData.taxSlabs?.length || 0,
    allData.paymentTerms?.length || 0,
    allData.chartOfAccounts?.length || 0,
    allData.employees?.length || 0,
    allData.departments?.length || 0,
    allData.designations?.length || 0,
    allData.shifts?.length || 0,
    allData.holidays?.length || 0,
    allData.policyDocuments?.length || 0,
    allData.biometricDevices?.length || 0,
    allData.trainingCourses?.length || 0,
    1 // systemSettings
  ].reduce((a, b) => a + b, 0);

  const currentTransactionCount = [
    allData.leads?.length || 0,
    allData.quotes?.length || 0,
    allData.projects?.length || 0,
    allData.workOrders?.length || 0,
    allData.prs?.length || 0,
    allData.pos?.length || 0,
    allData.payments?.length || 0,
    allData.vouchers?.length || 0,
    allData.attendance?.length || 0,
    allData.timesheets?.length || 0,
    allData.leaves?.length || 0,
    allData.payrollMonths?.length || 0,
    allData.resignations?.length || 0,
    allData.employeeAppraisals?.length || 0,
    allData.grievanceTickets?.length || 0,
    allData.auditLogs?.length || 0
  ].reduce((a, b) => a + b, 0);

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await mongoService.getStatus();
      setStatus(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch MongoDB status' });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handlePingTest = async () => {
    setIsPinging(true);
    setFeedback(null);
    try {
      const res = await mongoService.testConnection();
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Ping successful to database "${res.databaseName}" (${res.pingMs ?? '<1'}ms) [${res.mode || 'connected'}]`
        });
        loadStatus();
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Ping test failed to reach MongoDB cluster'
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Connection ping error' });
    } finally {
      setIsPinging(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUriInput.trim()) return;
    setIsUpdatingConfig(true);
    try {
      const res = await mongoService.updateConfig(customUriInput.trim(), customDbInput.trim() || undefined);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'MongoDB connection string updated! Testing cluster connection...'
        });
        setShowConfigModal(false);
        setCustomUriInput('');
        await loadStatus();
        await handlePingTest();
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to update MongoDB configuration'
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Configuration update failed' });
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  const handleMigrateToMongo = async () => {
    if (isMigrating) return;
    setIsMigrating(true);
    setFeedback(null);
    setMigrationResult(null);

    try {
      const result = await mongoService.migrateToMongoDB();
      setMigrationResult(result);
      setFeedback({
        type: 'success',
        message: `Successfully migrated ${result.totalMasterRecords} master records and ${result.totalTransactionRecords} transaction records to MongoDB (${result.databaseName}) in ${result.durationMs}ms!`
      });
      loadStatus();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to execute database migration to MongoDB'
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleExecuteRestore = async () => {
    if (isRestoring) return;
    setIsRestoring(true);
    setShowRestoreModal(false);
    setFeedback(null);

    try {
      const res = await mongoService.restoreFromMongoDB();
      setRestoreResult(res);
      setFeedback({
        type: 'success',
        message: `Restoration complete! Successfully restored ${res.totalMasterRecords} master records and ${res.totalTransactionRecords} transaction records from MongoDB (${res.source}).`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to restore database from MongoDB'
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const [isSyncingProjects, setIsSyncingProjects] = useState(false);
  const [isHydratingProjects, setIsHydratingProjects] = useState(false);

  const handleSyncProjectsToBoth = async () => {
    setIsSyncingProjects(true);
    setFeedback(null);
    try {
      const result = await unifiedProjectSyncService.syncProjectsToBoth();
      await loadStatus();
      if (result.success) {
        setFeedback({
          type: 'success',
          message: `Saved ${result.mongo.count} projects in MongoDB Atlas (${result.mongo.target}) and synced with linked Google Sheet!`
        });
      } else if (result.mongo.success) {
        setFeedback({
          type: 'info',
          message: `Saved ${result.mongo.count} projects in MongoDB Atlas. (Google Sheet: ${result.sheets.message})`
        });
      } else {
        setFeedback({
          type: 'error',
          message: result.mongo.message || 'Failed to sync projects'
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Sync failed' });
    } finally {
      setIsSyncingProjects(false);
    }
  };

  const handleLoadProjectsFromMongo = async () => {
    setIsHydratingProjects(true);
    setFeedback(null);
    try {
      const res = await unifiedProjectSyncService.loadProjectsFromMongo();
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Loaded ${res.count} project records from ${res.source} into active store!`
        });
      } else {
        setFeedback({
          type: 'info',
          message: res.error || 'No project records found in MongoDB'
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load projects from MongoDB' });
    } finally {
      setIsHydratingProjects(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner / Status Overview */}
      <div className="p-6 rounded-3xl bg-linear-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-inner">
              <Database className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl font-black tracking-tight text-white">
                  MongoDB Linked Database Engine
                </h3>
                {isLoadingStatus ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 animate-pulse">
                    Connecting...
                  </span>
                ) : status?.mode === 'mongodb_cluster' && status?.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    MongoDB Atlas Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Linked (Local Emulated Mode)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Seamlessly migrate all master entities and transaction records from Firebase / active local state to MongoDB. All data is structured across dedicated MongoDB collections with full JSON schema integrity.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCustomDbInput(status?.databaseName || 'alphaerp');
                setShowConfigModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Edit Connection String"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Update URI</span>
            </button>

            <button
              type="button"
              onClick={handlePingTest}
              disabled={isPinging || isLoadingStatus}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isPinging ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-white" />
              )}
              <span>Test Ping</span>
            </button>

            <button
              type="button"
              onClick={loadStatus}
              disabled={isLoadingStatus}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingStatus ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Connection Meta Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-900/40">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Database</span>
            <span className="text-sm font-extrabold text-emerald-300 mt-0.5 block truncate">
              {status?.databaseName || 'alphaerp'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Connection URI</span>
            <span className="text-xs font-mono text-slate-300 mt-0.5 block truncate" title={status?.maskedUri || 'Local Fallback'}>
              {status?.maskedUri || 'MONGODB_URI (Not Set)'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Collections In Mongo</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block">
              {status?.collectionsCount || 0} Collections
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Cluster Status</span>
            <span className="text-xs font-semibold text-slate-300 mt-0.5 block truncate">
              {status?.connected ? '✅ Reachable' : status?.ipWhitelistRequired ? '⚠️ IP Whitelist Needed' : '⚪ Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* ATLAS NETWORK ACCESS WHITELIST ALERT CARD */}
      {(status?.ipWhitelistRequired || status?.error?.includes('SSL Alert 80') || status?.error?.includes('Network Access')) && (
        <div className="p-6 rounded-3xl bg-linear-to-br from-amber-950/90 via-slate-900 to-amber-950/80 text-white border-2 border-amber-500/60 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-black text-amber-300">
                    Action Required in MongoDB Atlas: Whitelist Network Access
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/40">
                    Quick 1-Minute Step
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Your MongoDB Atlas credentials (<code className="text-amber-200 font-mono">shivenk_db_user</code> on <code className="text-amber-200 font-mono">cluster0.5gbrhfg.mongodb.net</code>) are recognized. By default, Atlas restricts all outside inbound IPs until you permit network access.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://cloud.mongodb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
              >
                <span>Open MongoDB Atlas</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 3 Step Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-xs space-y-1.5">
              <div className="text-amber-400 font-bold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-mono">1</span>
                <span>Navigate to Network Access</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Log into MongoDB Atlas, look under <strong className="text-white">Security</strong> in the left sidebar, and click <strong className="text-white">Network Access</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-xs space-y-1.5">
              <div className="text-amber-400 font-bold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-mono">2</span>
                <span>Add IP Access Entry</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Click the green <strong className="text-white">+ Add IP Address</strong> button. Select <strong className="text-white">Allow Access from Anywhere</strong> (<code className="text-amber-300 font-mono">0.0.0.0/0</code>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-xs space-y-1.5">
              <div className="text-amber-400 font-bold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-mono">3</span>
                <span>Confirm &amp; Test Ping</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Click <strong className="text-white">Confirm</strong>. Atlas takes ~15–30 seconds to apply, then click the <strong className="text-white">Test Ping</strong> button!
              </p>
            </div>
          </div>

          {/* Quick Copy & Verify Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-slate-400 text-xs font-semibold">Recommended Rule:</span>
              <code className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 font-mono text-xs border border-slate-700 font-bold">
                0.0.0.0/0
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard('0.0.0.0/0', 'anywhere')}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'anywhere' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedKey === 'anywhere' ? 'Copied 0.0.0.0/0!' : 'Copy 0.0.0.0/0'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePingTest}
              disabled={isPinging}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isPinging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>Test Ping Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-indigo-50 text-indigo-900 border-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* DEDICATED PROJECT DATA IN MONGODB & GOOGLE SHEET SYNC CARD */}
      <div className="p-6 rounded-3xl bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border-2 border-indigo-500/40 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
              <Zap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-black text-white">
                  Keep Projects in MongoDB &amp; Sync to Linked Google Sheet
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Primary Data Channel
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Automatically stores all project records, BOQs, contract milestones, and delay audits in MongoDB Atlas (<code className="text-emerald-300 font-mono">projects</code> collection) and writes the synchronized data into the linked Google Sheet (<code className="text-emerald-300 font-mono">🏗️ Projects &amp; BOQs</code>).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleLoadProjectsFromMongo}
              disabled={isHydratingProjects || isSyncingProjects}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Load projects from MongoDB Atlas into active state"
            >
              <ArrowDownToLine className={`w-4 h-4 text-blue-400 ${isHydratingProjects ? 'animate-bounce' : ''}`} />
              <span>{isHydratingProjects ? 'Loading...' : 'Load from Mongo'}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncProjectsToBoth}
              disabled={isSyncingProjects || isHydratingProjects}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              title="Persist projects to MongoDB and sync with Google Sheet"
            >
              {isSyncingProjects ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-amber-300" />
              )}
              <span>{isSyncingProjects ? 'Syncing...' : 'Keep in Mongo & Sync Sheet'}</span>
            </button>
          </div>
        </div>

        {/* Status badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">MongoDB Atlas Collection:</span>
            </div>
            <span className="font-mono font-bold text-emerald-300">
              projects ({status?.collections?.projects || allData.projects?.length || 0} docs)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">Google Sheet Tab:</span>
            </div>
            <span className="font-semibold text-slate-200">
              🏗️ Projects &amp; BOQs
            </span>
          </div>
        </div>
      </div>

      {/* MIGRATION EXECUTION CARD */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                <ArrowRight className="w-4 h-4" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                Migrate Database from Firebase / Active DB to MongoDB
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Migrate all 24 ERP collections directly into MongoDB. Documents are transformed and indexed with native Mongo IDs.
            </p>
          </div>

          <button
            type="button"
            onClick={handleMigrateToMongo}
            disabled={isMigrating}
            className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            {isMigrating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Migrating Collections to MongoDB...</span>
              </>
            ) : (
              <>
                <HardDrive className="w-4 h-4" />
                <span>Migrate All Data to MongoDB</span>
              </>
            )}
          </button>
        </div>

        {/* Scope Cards: Master Data vs Transaction Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Master Data Collections</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                {currentMasterCount} Active Records
              </span>
            </div>
            <p className="text-[11px] text-emerald-900/80 leading-relaxed">
              Clients, Vendors, Inventory Items, Sales Reps, Cost Centers, Tax Slabs, Payment Terms, Chart of Accounts, Employees, Shifts, Holidays, Biometric Devices & Policies.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-600" />
                <span>Transaction Data Collections</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 border border-slate-300">
                {currentTransactionCount} Active Records
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              CRM Leads, Quotations, Projects, Field Orders, Purchase Requisitions, Purchase Orders, Payments, Journal Vouchers, Attendance, Payroll, and Audit Logs.
            </p>
          </div>
        </div>

        {/* MIGRATION RECEIPT REPORT */}
        {migrationResult && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Migration Successfully Completed</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-mono">
                Duration: {migrationResult.durationMs}ms • {new Date(migrationResult.migratedAt).toLocaleTimeString()}
              </span>
            </div>

            <p className="text-xs text-emerald-800 leading-relaxed">
              Target: <strong>{migrationResult.target}</strong>. Successfully written{' '}
              <strong>{migrationResult.totalMasterRecords}</strong> master records and{' '}
              <strong>{migrationResult.totalTransactionRecords}</strong> transaction records into MongoDB database{' '}
              <strong>"{migrationResult.databaseName}"</strong>.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto">
              {migrationResult.collectionsReport.map((rep) => (
                <span
                  key={rep.collection}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                    rep.count > 0
                      ? 'bg-white text-emerald-900 border-emerald-200'
                      : 'bg-white/50 text-slate-500 border-slate-200'
                  }`}
                >
                  {rep.collection}: {rep.count} docs
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RESTORATION & SYNC CARD */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-700" />
              <span>Restore State from MongoDB</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Pull all collections from the linked MongoDB database into active AlphaERP state.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowRestoreModal(true)}
            disabled={isRestoring}
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restore from MongoDB</span>
          </button>
        </div>

        {restoreResult && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Restored from MongoDB Succeeded</span>
            </div>
            <p>
              Successfully loaded {restoreResult.totalMasterRecords} master records and {restoreResult.totalTransactionRecords} transaction records from {restoreResult.source} at {new Date(restoreResult.restoredAt).toLocaleTimeString()}.
            </p>
          </div>
        )}
      </div>

      {/* COLLECTIONS EXPLORER */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-600" />
            <span>MongoDB Collections Explorer ({Object.keys(status?.collections || {}).length} Total)</span>
          </h4>
          <span className="text-xs text-slate-400">Database: {status?.databaseName || 'alphaerp'}</span>
        </div>

        {Object.keys(status?.collections || {}).length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 text-xs">
            No collections populated yet. Click <strong>"Migrate All Data to MongoDB"</strong> above to migrate your active database.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {Object.entries(status?.collections || {}).map(([name, count]) => (
              <div
                key={name}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <span className="text-xs font-medium text-slate-700 truncate pr-2" title={name}>
                  {name}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ENVIRONMENT SETUP INSTRUCTIONS CARD */}
      <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-3">
        <div className="flex items-center gap-2 font-black text-slate-900">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>MongoDB Atlas Connection Configuration</span>
        </div>
        <p className="leading-relaxed">
          To connect this project to your external MongoDB Atlas cluster or MongoDB deployment, declare your connection string in the AI Studio Settings / environment variables:
        </p>
        <div className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto select-all">
          MONGODB_URI="mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.abcde.mongodb.net/alphaerp?retryWrites=true&amp;w=majority"
          <br />
          MONGODB_DB_NAME="alphaerp"
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Passwords and credentials are protected server-side and never exposed to client browsers.</span>
        </div>
      </div>

      {/* RESTORE CONFIRMATION MODAL */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Confirm MongoDB Restore</h4>
                  <p className="text-xs text-slate-500">Restore database from MongoDB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Safety Snapshot Guarantee:</span>
              <p>AlphaERP will automatically record a local safety backup snapshot right before applying the restore, so you can revert anytime if needed.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={isRestoring}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <span>Yes, Restore Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE CONNECTION STRING MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Configure MongoDB Connection</h4>
                  <p className="text-xs text-slate-500">Update MongoDB Atlas cluster connection URI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateConfig} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  MongoDB Connection URI (SRV or Standard)
                </label>
                <textarea
                  rows={3}
                  value={customUriInput}
                  onChange={(e) => setCustomUriInput(e.target.value)}
                  placeholder="mongodb+srv://shivenk_db_user:password@cluster0.5gbrhfg.mongodb.net/?retryWrites=true&w=majority"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  required
                />
                <span className="text-[11px] text-slate-400 block">
                  Passwords are securely masked in the UI and stored server-side.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Target Database Name
                </label>
                <input
                  type="text"
                  value={customDbInput}
                  onChange={(e) => setCustomDbInput(e.target.value)}
                  placeholder="alphaerp"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-700 block">Atlas Network Access Reminder:</span>
                <p>Ensure <code className="font-mono text-emerald-700 font-bold">0.0.0.0/0</code> is added in MongoDB Atlas &gt; Security &gt; Network Access so Atlas allows cloud connections.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingConfig || !customUriInput.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  {isUpdatingConfig ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving &amp; Connecting...</span>
                    </>
                  ) : (
                    <span>Save &amp; Connect</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MongoDbAdminSection;
