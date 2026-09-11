import React, { useState, useEffect, useMemo } from 'react';
import {
  Key,
  ShieldCheck,
  Save,
  RefreshCw,
  Plus,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Search,
  Sliders,
  Filter,
  Trash2,
  RotateCcw,
  Sparkles,
  Zap,
  Terminal,
  FileCode,
  Info,
  Server,
  Database,
  Mail,
  Cloud,
  Layers,
  Globe,
  HardDrive,
  CheckCheck,
  X,
  ExternalLink
} from 'lucide-react';
import { UserProfile, AdminEnvVariableItem, AdminEnvMetadata, AdminEnvSummary } from '../types';
import { envService } from '../services/envService';
import { storageService } from '../services/storageService';

interface EnvironmentVariablesAdminSectionProps {
  currentUser: UserProfile;
}

export const EnvironmentVariablesAdminSection: React.FC<EnvironmentVariablesAdminSectionProps> = ({
  currentUser,
}) => {
  // Loading & Data States
  const [summary, setSummary] = useState<AdminEnvSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Edit Buffer (Key -> edited value)
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [removedKeys, setRemovedKeys] = useState<Set<string>>(new Set());

  // UI / Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'configured' | 'missing' | 'modified' | 'sensitive'>('all');
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [showAllSecrets, setShowAllSecrets] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Testing States (Key -> testing status / result)
  const [testingKeys, setTestingKeys] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<
    Record<string, { success: boolean; message: string; latencyMs?: number; timestamp: string }>
  >({});

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Add Custom Variable Form
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [newVarCategory, setNewVarCategory] = useState('Custom');
  const [newVarDescription, setNewVarDescription] = useState('');
  const [newVarSensitive, setNewVarSensitive] = useState(false);
  const [addFormError, setAddFormError] = useState<string | null>(null);

  // Import Text Form
  const [importEnvText, setImportEnvText] = useState('');
  const [importOverwrite, setImportOverwrite] = useState(true);
  const [importParsedCount, setImportParsedCount] = useState(0);

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Fetch Environment Variables from Server
  const loadVariables = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await envService.fetchEnvSummary();
      setSummary(data);

      // Initialize buffer with current values
      const initialMap: Record<string, string> = {};
      for (const v of data.variables) {
        initialMap[v.key] = v.value;
      }
      setEditedValues(initialMap);
      setRemovedKeys(new Set());
    } catch (err: any) {
      console.error('Failed to load environment variables:', err);
      setLoadError(err?.message || 'Failed to communicate with server /api/admin/env');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVariables();
  }, []);

  // Compute dirty (modified) keys
  const modifiedKeys = useMemo(() => {
    if (!summary) return [];
    const modified: string[] = [];
    for (const v of summary.variables) {
      if (removedKeys.has(v.key)) {
        modified.push(v.key);
      } else if (editedValues[v.key] !== undefined && editedValues[v.key] !== v.value) {
        modified.push(v.key);
      }
    }
    // Also include any new keys in editedValues not in original summary
    const originalKeys = new Set(summary.variables.map((v) => v.key));
    for (const k of Object.keys(editedValues)) {
      if (!originalKeys.has(k) && !removedKeys.has(k)) {
        modified.push(k);
      }
    }
    return modified;
  }, [summary, editedValues, removedKeys]);

  // Categories list
  const categories = useMemo(() => {
    if (!summary) return [];
    const set = new Set<string>();
    summary.variables.forEach((v) => set.add(v.category));
    return Array.from(set);
  }, [summary]);

  // Filtered variables
  const filteredVariables = useMemo(() => {
    if (!summary) return [];

    return summary.variables.filter((item) => {
      // Exclude removed keys
      if (removedKeys.has(item.key)) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      const currentValue = editedValues[item.key] !== undefined ? editedValues[item.key] : item.value;
      const isConfigured = currentValue.trim().length > 0;
      const isModified = currentValue !== item.value;

      // Status filter
      if (statusFilter === 'configured' && !isConfigured) return false;
      if (statusFilter === 'missing' && (isConfigured || !item.required)) return false;
      if (statusFilter === 'modified' && !isModified) return false;
      if (statusFilter === 'sensitive' && !item.sensitive) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKey = item.key.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchVal = currentValue.toLowerCase().includes(q);
        if (!matchKey && !matchDesc && !matchCat && !matchVal) {
          return false;
        }
      }

      return true;
    });
  }, [summary, editedValues, removedKeys, selectedCategory, statusFilter, searchQuery]);

  // Handle value change for a variable
  const handleValueChange = (key: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Revert single variable to original value
  const handleRevertSingle = (key: string) => {
    if (!summary) return;
    const original = summary.variables.find((v) => v.key === key);
    if (original) {
      setEditedValues((prev) => ({
        ...prev,
        [key]: original.value,
      }));
    }
  };

  // Toggle secret visibility
  const toggleRevealKey = (key: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Copy key to clipboard
  const handleCopyKey = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Test single variable
  const handleTestVariable = async (key: string) => {
    const currentValue = editedValues[key] !== undefined ? editedValues[key] : (summary?.variables.find((v) => v.key === key)?.value || '');
    if (!currentValue.trim()) {
      setTestResults((prev) => ({
        ...prev,
        [key]: {
          success: false,
          message: `Cannot test "${key}" because the value is currently empty.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
      return;
    }

    setTestingKeys((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await envService.testEnvVariable(key, currentValue);
      setTestResults((prev) => ({
        ...prev,
        [key]: {
          success: result.success,
          message: result.message,
          latencyMs: result.latencyMs,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [key]: {
          success: false,
          message: err?.message || `Test failed for ${key}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } finally {
      setTestingKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Remove custom variable
  const handleRemoveVariable = (key: string) => {
    setRemovedKeys((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setEditedValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Add Custom Variable Submit
  const handleAddCustomVariable = (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    const trimmedKey = newVarKey.trim().toUpperCase().replace(/\s+/g, '_');
    if (!trimmedKey) {
      setAddFormError('Variable key is required.');
      return;
    }

    if (!/^[A-Z0-9_]+$/.test(trimmedKey)) {
      setAddFormError('Variable key must only contain uppercase letters, numbers, and underscores.');
      return;
    }

    // Check if key already exists in summary
    const alreadyExists = summary?.variables.some((v) => v.key === trimmedKey && !removedKeys.has(trimmedKey));
    if (alreadyExists) {
      setAddFormError(`Variable "${trimmedKey}" already exists. You can edit its value directly in the list.`);
      return;
    }

    // Add to summary and edited values
    const newItem: AdminEnvVariableItem = {
      key: trimmedKey,
      value: newVarValue,
      category: newVarCategory || 'Custom',
      description: newVarDescription.trim() || 'Custom user-defined environment variable.',
      sensitive: newVarSensitive,
      required: false,
      example: '',
      defaultValue: '',
      isConfigured: newVarValue.trim().length > 0,
      isCustom: true,
      source: 'process_env',
    };

    setSummary((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        variables: [newItem, ...prev.variables],
      };
    });

    setEditedValues((prev) => ({
      ...prev,
      [trimmedKey]: newVarValue,
    }));

    // Reset form
    setNewVarKey('');
    setNewVarValue('');
    setNewVarDescription('');
    setNewVarSensitive(false);
    setShowAddModal(false);

    setFeedback({
      type: 'info',
      message: `Added custom variable "${trimmedKey}". Click "Save All Changes" to persist to .env file and runtime.`,
    });
  };

  // Import .env text handler
  const handleImportParsed = () => {
    try {
      const parsed = envService.parseEnvText(importEnvText);
      const count = Object.keys(parsed).length;
      if (count === 0) {
        setFeedback({
          type: 'error',
          message: 'No valid KEY=VALUE pairs were found in the pasted text.',
        });
        return;
      }

      setEditedValues((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(parsed)) {
          if (importOverwrite || next[k] === undefined || next[k] === '') {
            next[k] = v;
          }
        }
        return next;
      });

      // Also ensure any keys not currently in summary are added
      if (summary) {
        const existingKeys = new Set(summary.variables.map((v) => v.key));
        const newItems: AdminEnvVariableItem[] = [];

        for (const [k, v] of Object.entries(parsed)) {
          if (!existingKeys.has(k)) {
            newItems.push({
              key: k,
              value: v,
              category: 'Custom',
              description: 'Imported from .env payload',
              sensitive: k.toLowerCase().includes('key') || k.toLowerCase().includes('secret') || k.toLowerCase().includes('pass') || k.toLowerCase().includes('token'),
              required: false,
              example: '',
              defaultValue: '',
              isConfigured: v.trim().length > 0,
              isCustom: true,
              source: 'env_file',
            });
          }
        }

        if (newItems.length > 0) {
          setSummary((prev) => prev ? { ...prev, variables: [...newItems, ...prev.variables] } : null);
        }
      }

      setShowImportModal(false);
      setImportEnvText('');
      setFeedback({
        type: 'success',
        message: `Imported ${count} environment variables into editor buffer. Click "Save All Changes" to persist.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Failed to import .env: ${err?.message}`,
      });
    }
  };

  // Save All Changes to Server & File
  const handleSaveAll = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const removedArr = Array.from(removedKeys);
      const result = await envService.saveEnvVariables(editedValues, removedArr);

      // Audit log
      storageService.logAudit(
        'UPDATE',
        'SYSTEM',
        currentUser.id,
        `Super Admin updated environment variables (${Object.keys(editedValues).length} keys). File persisted: ${result.persistedToFile}`
      );

      storageService.addNotification(
        'Environment Variables Saved',
        `Updated ${result.updatedCount} parameters. ${result.persistedToFile ? 'Saved to .env on disk.' : 'Applied to process runtime.'}`,
        'success',
        'system_settings'
      );

      setFeedback({
        type: 'success',
        message: result.message,
      });

      // Reload fresh state from server
      await loadVariables();
    } catch (err: any) {
      console.error('Failed to save environment variables:', err);
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to save environment variables to server.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Discard all unsaved edits
  const handleDiscardAll = () => {
    if (!summary) return;
    const initialMap: Record<string, string> = {};
    for (const v of summary.variables) {
      initialMap[v.key] = v.value;
    }
    setEditedValues(initialMap);
    setRemovedKeys(new Set());
    setFeedback({
      type: 'info',
      message: 'All unsaved modifications have been discarded.',
    });
  };

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'AI & Voice Engine':
        return <Sparkles className="w-4 h-4 text-violet-500" />;
      case 'Application & Network':
        return <Globe className="w-4 h-4 text-blue-500" />;
      case 'Database & Storage':
        return <Database className="w-4 h-4 text-emerald-500" />;
      case 'BaaS & PostgreSQL':
        return <Server className="w-4 h-4 text-indigo-500" />;
      case 'Email & Notifications':
        return <Mail className="w-4 h-4 text-amber-500" />;
      case 'Deployment & Cloud':
        return <Cloud className="w-4 h-4 text-sky-500" />;
      default:
        return <Terminal className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Headline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Key className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Environment Variables & Secrets Manager
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Super Admin Console
                </span>
                {summary?.metadata && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                      summary.metadata.canWriteToFile
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                    title={
                      summary.metadata.canWriteToFile
                        ? 'Changes are permanently saved to .env on disk and runtime process.env'
                        : 'Running in container/serverless: Changes update process.env in-memory'
                    }
                  >
                    <HardDrive className="w-3 h-3" />
                    {summary.metadata.canWriteToFile ? '.env on disk (Persistent)' : 'Runtime In-Memory'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Inspect, modify, and persist mission-critical credentials across Google Gemini AI, MongoDB Atlas, Nodemailer SMTP, InsForge BaaS PostgreSQL, and custom deployment keys. Changes take immediate effect in server runtime.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="btn-env-refresh"
              onClick={loadVariables}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Reload environment variables from backend server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              id="btn-env-import"
              onClick={() => setShowImportModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Import or paste raw .env format variables"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Import .env</span>
            </button>

            <button
              id="btn-env-export"
              onClick={() => setShowExportModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Download or preview formatted .env file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Export .env</span>
            </button>

            <button
              id="btn-env-add-custom"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Variable</span>
            </button>

            {modifiedKeys.length > 0 && (
              <button
                id="btn-env-discard"
                onClick={handleDiscardAll}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard</span>
              </button>
            )}

            <button
              id="btn-env-save-all"
              onClick={handleSaveAll}
              disabled={isSaving || modifiedKeys.length === 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                modifiedKeys.length > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25 ring-2 ring-indigo-500/30 animate-pulse'
                  : 'bg-slate-400 dark:bg-slate-700 opacity-60 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>
                {isSaving
                  ? 'Saving to .env...'
                  : modifiedKeys.length > 0
                  ? `Save All Changes (${modifiedKeys.length})`
                  : 'Saved & Synced'}
              </span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Monitored
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {summary?.metadata.totalCount ?? 0}
            </div>
          </div>

          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl p-3 border border-emerald-200/60 dark:border-emerald-800/60">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Active / Configured
            </span>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
              {summary?.metadata.configuredCount ?? 0}
            </div>
          </div>

          <div className="bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl p-3 border border-amber-200/60 dark:border-amber-800/60">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Missing Required
            </span>
            <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-0.5">
              {summary?.metadata.missingCount ?? 0}
            </div>
          </div>

          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl p-3 border border-indigo-200/60 dark:border-indigo-800/60">
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
              Pending Edits
            </span>
            <div className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-0.5">
              {modifiedKeys.length}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Alert Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : feedback.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
              : 'bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
            {feedback.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />}
            {feedback.type === 'info' && <Info className="w-4 h-4 shrink-0 text-blue-600" />}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-env-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search key, description, value..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Reveal All Secrets Toggle */}
          <button
            onClick={() => setShowAllSecrets(!showAllSecrets)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
              showAllSecrets
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle masking for all sensitive variables at once"
          >
            {showAllSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showAllSecrets ? 'Mask Secrets' : 'Reveal Secrets'}</span>
          </button>
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Reading Environment Variables...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Querying server runtime process.env and inspecting .env file on disk.
          </p>
        </div>
      )}

      {loadError && (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-3xl text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Failed to load environment variables</h3>
              <p className="text-xs mt-1 text-rose-700 dark:text-rose-300">{loadError}</p>
            </div>
          </div>
          <button
            onClick={loadVariables}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Variables List Card Container */}
      {!isLoading && !loadError && (
        <div className="space-y-4">
          {filteredVariables.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Key className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No variables match filter criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search query or category filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setStatusFilter('all');
                }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredVariables.map((item) => {
              const currentValue = editedValues[item.key] !== undefined ? editedValues[item.key] : item.value;
              const isModified = currentValue !== item.value;
              const isConfigured = currentValue.trim().length > 0;
              const isRevealed = showAllSecrets || revealedKeys.has(item.key);
              const isTesting = testingKeys[item.key] || false;
              const testResult = testResults[item.key];

              return (
                <div
                  key={item.key}
                  id={`env-item-${item.key.toLowerCase()}`}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-4.5 transition-all shadow-xs ${
                    isModified
                      ? 'border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-400/30'
                      : !isConfigured && item.required
                      ? 'border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Key, Badges, Description */}
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {getCategoryIcon(item.category)}
                        </span>

                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 select-all">
                          {item.key}
                        </span>

                        <button
                          onClick={() => handleCopyKey(item.key, currentValue)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors cursor-pointer"
                          title="Copy current value"
                        >
                          {copiedKey === item.key ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          {item.category}
                        </span>

                        {item.required && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                            REQUIRED
                          </span>
                        )}

                        {item.sensitive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                            SECRET
                          </span>
                        )}

                        {isModified && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 animate-pulse">
                            MODIFIED
                          </span>
                        )}

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            isConfigured
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {isConfigured ? 'CONFIGURED' : 'UNSET'}
                        </span>

                        {item.isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                            CUSTOM
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>

                      {item.example && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                          Format example: <span className="text-slate-500 dark:text-slate-400">{item.example}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Input Field & Control Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-[460px]">
                      <div className="relative flex-1">
                        <input
                          id={`input-env-${item.key}`}
                          type={item.sensitive && !isRevealed ? 'password' : 'text'}
                          value={currentValue}
                          onChange={(e) => handleValueChange(item.key, e.target.value)}
                          placeholder={item.example || 'Enter value...'}
                          className={`w-full font-mono text-xs px-3 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                            isModified
                              ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-100 font-semibold'
                              : 'bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                          } ${item.sensitive && !isRevealed ? 'tracking-widest' : ''}`}
                        />

                        {/* Sensitive Eye Reveal Toggle */}
                        {item.sensitive && (
                          <button
                            type="button"
                            onClick={() => toggleRevealKey(item.key)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                            title={isRevealed ? 'Hide sensitive value' : 'Reveal sensitive value'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Undo modification */}
                        {isModified && (
                          <button
                            type="button"
                            onClick={() => handleRevertSingle(item.key)}
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Revert to original value"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Test Button for supported keys */}
                        {['GEMINI_API_KEY', 'MONGODB_URI', 'VITE_INSFORGE_URL', 'APP_URL', 'SMTP_HOST'].includes(item.key) && (
                          <button
                            type="button"
                            onClick={() => handleTestVariable(item.key)}
                            disabled={isTesting}
                            className="px-2.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title={`Test and validate ${item.key}`}
                          >
                            {isTesting ? (
                              <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" />
                            ) : (
                              <Zap className="w-3 h-3 text-amber-500" />
                            )}
                            <span>Test</span>
                          </button>
                        )}

                        {/* Delete custom variable */}
                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariable(item.key)}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                            title="Delete custom variable"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inline Test Result Box */}
                  {testResult && (
                    <div
                      className={`mt-3 p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in ${
                        testResult.success
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {testResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{testResult.message}</span>
                        {testResult.latencyMs !== undefined && (
                          <span className="text-[10px] opacity-75 font-mono">({testResult.latencyMs}ms)</span>
                        )}
                      </div>
                      <span className="text-[10px] opacity-60 shrink-0">{testResult.timestamp}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL: ADD CUSTOM VARIABLE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Add Custom Environment Variable</h3>
                  <p className="text-[11px] text-slate-500">Append custom key to runtime and .env file</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addFormError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-medium border border-rose-200">
                {addFormError}
              </div>
            )}

            <form onSubmit={handleAddCustomVariable} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Variable Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newVarKey}
                  onChange={(e) => setNewVarKey(e.target.value.toUpperCase())}
                  placeholder="e.g. ERP_REPORT_SERVER_KEY"
                  className="w-full font-mono uppercase px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Must contain uppercase letters, numbers, and underscores only.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Variable Value
                </label>
                <input
                  type={newVarSensitive ? 'password' : 'text'}
                  value={newVarValue}
                  onChange={(e) => setNewVarValue(e.target.value)}
                  placeholder="Enter value string..."
                  className="w-full font-mono px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                  <select
                    value={newVarCategory}
                    onChange={(e) => setNewVarCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Custom">Custom</option>
                    <option value="AI & Voice Engine">AI & Voice</option>
                    <option value="Application & Network">Application & Network</option>
                    <option value="Database & Storage">Database & Storage</option>
                    <option value="BaaS & PostgreSQL">BaaS & PostgreSQL</option>
                    <option value="Email & Notifications">Email & Notifications</option>
                    <option value="Deployment & Cloud">Deployment & Cloud</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newVarSensitive}
                      onChange={(e) => setNewVarSensitive(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Mark as Secret</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newVarDescription}
                  onChange={(e) => setNewVarDescription(e.target.value)}
                  placeholder="Explain the purpose of this environment variable..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
                >
                  Add to Variables
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT RAW .ENV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Import from .env File Text</h3>
                  <p className="text-[11px] text-slate-500">Paste raw KEY=VALUE pairs to parse into editor</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Paste your configuration below. Comments starting with <code>#</code> and quotes around values are automatically cleaned and parsed.
              </p>

              <textarea
                rows={8}
                value={importEnvText}
                onChange={(e) => {
                  setImportEnvText(e.target.value);
                  const parsed = envService.parseEnvText(e.target.value);
                  setImportParsedCount(Object.keys(parsed).length);
                }}
                placeholder={`# Paste .env content here\nGEMINI_API_KEY="AIzaSy..."\nMONGODB_URI="mongodb+srv://..."\nSMTP_HOST="smtp.gmail.com"`}
                className="w-full font-mono text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={importOverwrite}
                    onChange={(e) => setImportOverwrite(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Overwrite existing non-empty values
                  </span>
                </label>
                <span className="text-slate-500 font-mono text-[11px]">
                  Detected: <strong>{importParsedCount}</strong> variable(s)
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportParsed}
                  disabled={importParsedCount === 0}
                  className="px-4 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  Load {importParsedCount} Variables into Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPORT / PREVIEW .ENV */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Export Formatted .env File</h3>
                  <p className="text-[11px] text-slate-500">Download or copy standard enterprise .env layout</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[11px] max-h-80 overflow-y-auto leading-relaxed border border-slate-800 select-all">
                <pre>{`# ===================================================================
# AlphaERP Enterprise Environment Configuration Export
# Generated: ${new Date().toISOString()}
# ===================================================================

# --- [AI & VOICE ENGINE] ---
GEMINI_API_KEY="${editedValues['GEMINI_API_KEY'] || ''}"

# --- [APPLICATION & NETWORK] ---
APP_URL="${editedValues['APP_URL'] || 'https://hvacbiz.vercel.app'}"

# --- [DATABASE & STORAGE] ---
MONGODB_URI="${editedValues['MONGODB_URI'] || ''}"
MONGODB_DB_NAME="${editedValues['MONGODB_DB_NAME'] || 'alphaerp'}"

# --- [BAAS & POSTGRESQL] ---
VITE_INSFORGE_URL="${editedValues['VITE_INSFORGE_URL'] || 'https://as2hwz72.us-east.insforge.app'}"
VITE_INSFORGE_ANON_KEY="${editedValues['VITE_INSFORGE_ANON_KEY'] || ''}"

# --- [EMAIL & NOTIFICATIONS] ---
SMTP_HOST="${editedValues['SMTP_HOST'] || ''}"
SMTP_PORT=${editedValues['SMTP_PORT'] || 587}
SMTP_USER="${editedValues['SMTP_USER'] || ''}"
SMTP_PASS="${editedValues['SMTP_PASS'] || ''}"
SMTP_FROM="${editedValues['SMTP_FROM'] || 'AlphaERP Inventory Control <procurement@alphaerp.com>'}"
PROCUREMENT_ALERT_EMAIL="${editedValues['PROCUREMENT_ALERT_EMAIL'] || ''}"

# --- [DEPLOYMENT & CLOUD] ---
VERCEL_TOKEN="${editedValues['VERCEL_TOKEN'] || ''}"
VERCEL_ORG_ID="${editedValues['VERCEL_ORG_ID'] || ''}"
VERCEL_PROJECT_ID="${editedValues['VERCEL_PROJECT_ID'] || ''}"
`}</pre>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[11px]">
                  Matches canonical format recognized by Docker, Cloud Run & Vercel.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `# AlphaERP .env export\n` + Object.entries(editedValues).map(([k, v]) => `${k}="${v}"`).join('\n');
                      navigator.clipboard.writeText(text);
                      setFeedback({ type: 'info', message: 'Raw .env text copied to clipboard!' });
                      setShowExportModal(false);
                    }}
                    className="px-4 py-2 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy to Clipboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      envService.downloadEnvFile();
                      setShowExportModal(false);
                    }}
                    className="px-4 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .env File</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
