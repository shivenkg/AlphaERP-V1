import React, { useState, useEffect } from 'react';
import {
  Save,
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Settings,
  X,
  AlertTriangle,
  FileJson,
  Bell,
  Trash2,
  History,
  HardDrive
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { BackupConfig, BackupNotificationEvent, LocalBackupSnapshot } from '../types';

export const LocalBackupNotification: React.FC = () => {
  const [latestEvent, setLatestEvent] = useState<BackupNotificationEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [snapshots, setSnapshots] = useState<LocalBackupSnapshot[]>([]);
  const [config, setConfig] = useState<BackupConfig>(storageService.getBackupConfig());
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [autoDismissTimer, setAutoDismissTimer] = useState<any>(null);

  useEffect(() => {
    // Listen for real-time backup triggers
    const unsubBackup = storageService.onBackupNotification((evt) => {
      setLatestEvent(evt);
      setSnapshots(storageService.getBackupSnapshots());

      // Auto dismiss banner after 8 seconds
      if (autoDismissTimer) clearTimeout(autoDismissTimer);
      const timer = setTimeout(() => {
        setLatestEvent(null);
      }, 8000);
      setAutoDismissTimer(timer);
    });

    const unsubStorage = storageService.subscribe(() => {
      setSnapshots(storageService.getBackupSnapshots());
      setConfig(storageService.getBackupConfig());
    });

    setSnapshots(storageService.getBackupSnapshots());

    return () => {
      unsubBackup();
      unsubStorage();
      if (autoDismissTimer) clearTimeout(autoDismissTimer);
    };
  }, []);

  const handleDismissBanner = () => {
    setLatestEvent(null);
    if (autoDismissTimer) clearTimeout(autoDismissTimer);
  };

  const handleDownloadSnapshot = (snap?: LocalBackupSnapshot | BackupNotificationEvent) => {
    if (!snap) return;
    const payload = 'downloadPayload' in snap ? snap.downloadPayload : snap.payloadJson;
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date(snap.timestamp).toISOString().replace(/[:.]/g, '-');
    a.href = url;
    a.download = `AlphaERP_Backup_${snap.module || 'Snapshot'}_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleManualBackupNow = () => {
    const snap = storageService.recordCriticalSnapshot(
      'MANUAL_USER',
      'System',
      'Manual User-Triggered System Snapshot'
    );
    setSaveSuccessMsg(`Snapshot ${snap.id} created successfully.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleRestore = (id: string) => {
    const success = storageService.restoreFromSnapshot(id);
    if (success) {
      setSaveSuccessMsg(`System restored successfully from snapshot ${id}.`);
      setRestoreConfirmId(null);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } else {
      alert('Failed to restore snapshot. The data payload might be corrupted.');
    }
  };

  const handleDeleteSnapshot = (id: string) => {
    storageService.deleteSnapshot(id);
  };

  const handleRequestPushPerm = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        storageService.updateBackupConfig({ browserPushNotifications: true });
        new Notification('AlphaERP Backup Notifications Enabled', {
          body: 'You will now receive desktop alerts on periodic backups and inventory/procurement updates.',
          icon: '/favicon.ico'
        });
      } else {
        storageService.updateBackupConfig({ browserPushNotifications: false });
      }
    }
  };

  const handleConfigChange = (updates: Partial<BackupConfig>) => {
    storageService.updateBackupConfig(updates);
  };

  return (
    <>
      {/* Real-time Floating Notification Toast */}
      {latestEvent && (
        <div
          id="local-backup-notification-toast"
          className="fixed bottom-5 right-5 z-50 max-w-md w-full bg-white dark:bg-slate-900 border-2 border-emerald-500/80 dark:border-emerald-500 shadow-2xl rounded-2xl p-4 animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 rounded-xl shrink-0">
              <HardDrive className="w-5 h-5 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {latestEvent.triggerType === 'PERIODIC_SCHEDULE' ? 'Periodic Backup' : 'Critical Change Backup'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(latestEvent.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
                {latestEvent.description}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {latestEvent.itemCountSummary}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  id="backup-toast-download-btn"
                  onClick={() => handleDownloadSnapshot(latestEvent)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .JSON</span>
                </button>

                <button
                  id="backup-toast-history-btn"
                  onClick={() => {
                    setShowModal(true);
                    setLatestEvent(null);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-all"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Snapshots ({snapshots.length})</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleDismissBanner}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Snapshot Manager & Periodic Backup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            id="backup-manager-modal"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Local Backup Snapshots & Periodic Recovery
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Automated snapshots triggered on critical Inventory & Procurement mutations or scheduled intervals.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="modal-manual-backup-btn"
                  onClick={handleManualBackupNow}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Snapshot Now</span>
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification alert message */}
            {saveSuccessMsg && (
              <div className="m-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* Configuration Panel */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Periodic Schedule & Trigger Settings
                    </h4>
                  </div>
                  <button
                    onClick={handleRequestPushPerm}
                    className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Request Desktop Push Permission</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Periodic Backup Interval
                    </label>
                    <select
                      value={config.periodicIntervalMinutes}
                      onChange={(e) =>
                        handleConfigChange({ periodicIntervalMinutes: Number(e.target.value) })
                      }
                      className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>Every 5 minutes (Testing / Rapid)</option>
                      <option value={15}>Every 15 minutes</option>
                      <option value={30}>Every 30 minutes (Default)</option>
                      <option value={60}>Every 1 hour</option>
                      <option value={120}>Every 2 hours</option>
                      <option value={0}>Disabled</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={config.autoSnapshotOnCriticalInventory}
                        onChange={(e) =>
                          handleConfigChange({ autoSnapshotOnCriticalInventory: e.target.checked })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Auto-snapshot on Inventory Edits</span>
                    </label>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={config.autoSnapshotOnCriticalProcurement}
                        onChange={(e) =>
                          handleConfigChange({ autoSnapshotOnCriticalProcurement: e.target.checked })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Auto-snapshot on PR/PO Changes</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Snapshots Table / List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Saved Snapshots History ({snapshots.length})
                    </h4>
                  </div>
                  {snapshots.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('Clear all snapshots from local history?')) {
                          storageService.clearAllSnapshots();
                        }
                      }}
                      className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {snapshots.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <FileJson className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No snapshots recorded yet</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Snapshots will appear automatically when Inventory stock is adjusted, POs are approved, or when scheduled timer fires.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 max-h-80 overflow-y-auto">
                    {snapshots.map((snap) => (
                      <div
                        key={snap.id}
                        className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                snap.triggerType === 'PERIODIC_SCHEDULE'
                                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                                  : snap.triggerType === 'INVENTORY_CRITICAL'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                  : snap.triggerType === 'PROCUREMENT_CRITICAL'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              {snap.triggerType.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {snap.description}
                            </span>
                            <span className="text-[10px] text-slate-400">({snap.sizeKb} KB)</span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {new Date(snap.timestamp).toLocaleString()}
                            </span>
                            <span>•</span>
                            <span>
                              {snap.itemCounts.inventoryCount} SKUs | {snap.itemCounts.prCount} PRs | {snap.itemCounts.poCount} POs
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDownloadSnapshot(snap)}
                            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                            title="Download JSON file"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Export</span>
                          </button>

                          {restoreConfirmId === snap.id ? (
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 p-1 rounded-lg border border-amber-200 dark:border-amber-800">
                              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 px-1">
                                Restore this state?
                              </span>
                              <button
                                onClick={() => handleRestore(snap.id)}
                                className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setRestoreConfirmId(null)}
                                className="px-1.5 py-0.5 text-slate-500 hover:text-slate-700 text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRestoreConfirmId(snap.id)}
                              className="p-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                              title="Restore system state from this snapshot"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Restore</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteSnapshot(snap.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                            title="Delete snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
              <button
                onClick={() => storageService.downloadBackupFile()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Full Database JSON Export</span>
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
