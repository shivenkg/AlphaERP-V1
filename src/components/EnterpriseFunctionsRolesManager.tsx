import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Filter,
  Layers,
  Sparkles,
  Sliders,
  ChevronRight,
  Info,
  Lock,
  Eye,
  Building2
} from 'lucide-react';
import {
  EnterpriseFunction,
  EnterpriseFunctionDomain,
  CustomRoleDefinition,
  UserRole
} from '../types';
import { storageService } from '../services/storageService';
import {
  ENTERPRISE_FUNCTIONS,
  DEFAULT_ROLE_FUNCTION_PERMISSIONS,
  ROLE_DEFINITIONS,
  evaluateSodConflicts
} from '../utils/rbac';

const DOMAIN_METADATA: Record<
  EnterpriseFunctionDomain,
  { label: string; icon: string; color: string; border: string; bg: string }
> = {
  crm_sales: {
    label: 'CRM & Sales Pipeline',
    icon: '💼',
    color: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    bg: 'bg-blue-50/60 dark:bg-blue-950/30'
  },
  engineering_quote: {
    label: 'HVAC Engineering & Quotes',
    icon: '📐',
    color: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
    bg: 'bg-indigo-50/60 dark:bg-indigo-950/30'
  },
  project_boq: {
    label: 'Projects & BOQ Execution',
    icon: '🏗️',
    color: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    bg: 'bg-amber-50/60 dark:bg-amber-950/30'
  },
  procurement: {
    label: 'Procurement & Supply Chain',
    icon: '🛒',
    color: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/30'
  },
  warehouse_inventory: {
    label: 'Warehouse & Inventory',
    icon: '📦',
    color: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
    bg: 'bg-teal-50/60 dark:bg-teal-950/30'
  },
  services_amc: {
    label: 'Services & AMC Contracts',
    icon: '🔧',
    color: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800',
    bg: 'bg-cyan-50/60 dark:bg-cyan-950/30'
  },
  finance_accounting: {
    label: 'Finance & Accounting',
    icon: '💳',
    color: 'text-violet-700 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800',
    bg: 'bg-violet-50/60 dark:bg-violet-950/30'
  },
  hr_payroll: {
    label: 'HR & Talent Operations',
    icon: '👥',
    color: 'text-fuchsia-700 dark:text-fuchsia-400',
    border: 'border-fuchsia-200 dark:border-fuchsia-800',
    bg: 'bg-fuchsia-50/60 dark:bg-fuchsia-950/30'
  },
  system_admin: {
    label: 'System Admin & Governance',
    icon: '⚙️',
    color: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-800',
    bg: 'bg-rose-50/60 dark:bg-rose-950/30'
  }
};

const RISK_BADGE: Record<string, { label: string; class: string }> = {
  LOW: { label: 'LOW', class: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300' },
  MEDIUM: { label: 'MED', class: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300' },
  HIGH: { label: 'HIGH', class: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300' },
  CRITICAL: { label: 'CRIT', class: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/50 dark:text-rose-300' }
};

export const EnterpriseFunctionsRolesManager: React.FC = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('executive');
  const [customRoles, setCustomRoles] = useState<CustomRoleDefinition[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Modal for Custom Role
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomRoleId, setEditingCustomRoleId] = useState<string | null>(null);
  const [customRoleForm, setCustomRoleForm] = useState({
    name: '',
    department: 'Engineering & Projects',
    description: '',
    baseRole: 'estimator',
    status: 'active' as 'active' | 'inactive',
    selectedFunctions: [] as string[]
  });

  useEffect(() => {
    loadData();
    const unsubscribe = storageService.subscribe(() => {
      loadData();
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loadData = () => {
    setCustomRoles(storageService.getCustomRoles());
    setRolePermissions(storageService.getRoleFunctionPermissions());
  };

  const showFeedback = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Standard roles list
  const standardRolesList = useMemo(() => {
    return (Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((r) => ({
      id: r,
      name: ROLE_DEFINITIONS[r].name,
      badge: ROLE_DEFINITIONS[r].badge,
      department: ROLE_DEFINITIONS[r].department,
      isCustom: false
    }));
  }, []);

  // Combined roles list
  const allRolesList = useMemo(() => {
    const list: Array<{ id: string; name: string; badge: string; department: string; isCustom: boolean; status?: string }> = [
      ...standardRolesList
    ];
    customRoles.forEach((cr) => {
      list.push({
        id: cr.id,
        name: cr.name,
        badge: 'CUSTOM',
        department: cr.department,
        isCustom: true,
        status: cr.status
      });
    });
    return list;
  }, [standardRolesList, customRoles]);

  // Current active role object
  const currentRoleObj = useMemo(() => {
    return allRolesList.find((r) => r.id === selectedRoleId) || allRolesList[0];
  }, [allRolesList, selectedRoleId]);

  // Granted functions for currently selected role
  const activeGrantedFunctions = useMemo(() => {
    return rolePermissions[selectedRoleId] || [];
  }, [rolePermissions, selectedRoleId]);

  // Evaluate SoD conflicts for current role's granted functions
  const activeSodConflicts = useMemo(() => {
    return evaluateSodConflicts(activeGrantedFunctions);
  }, [activeGrantedFunctions]);

  // Filtered functions
  const filteredFunctions = useMemo(() => {
    let list = ENTERPRISE_FUNCTIONS;
    if (selectedDomain !== 'ALL') {
      list = list.filter((f) => f.domain === selectedDomain);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.domain.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedDomain, searchTerm]);

  // Group filtered functions by domain
  const functionsByDomain = useMemo(() => {
    const map = new Map<EnterpriseFunctionDomain, EnterpriseFunction[]>();
    filteredFunctions.forEach((fn) => {
      const list = map.get(fn.domain) || [];
      list.push(fn);
      map.set(fn.domain, list);
    });
    return map;
  }, [filteredFunctions]);

  // Handle toggle function
  const handleToggleFunction = (funcId: string) => {
    const isGranted = activeGrantedFunctions.includes(funcId);
    const updated = storageService.toggleRoleFunction(selectedRoleId, funcId, !isGranted);
    setRolePermissions(updated);
    showFeedback(
      `Function ${funcId} ${!isGranted ? 'granted' : 'revoked'} for role ${currentRoleObj.name}.`,
      'info'
    );
  };

  // Bulk Domain Grant/Revoke
  const handleDomainBulkToggle = (domain: EnterpriseFunctionDomain, grantAll: boolean) => {
    const domainFuncIds = ENTERPRISE_FUNCTIONS.filter((f) => f.domain === domain).map((f) => f.id);
    const current = new Set(activeGrantedFunctions);
    domainFuncIds.forEach((id) => {
      if (grantAll) current.add(id);
      else current.delete(id);
    });

    const updatedPermissions = {
      ...rolePermissions,
      [selectedRoleId]: Array.from(current)
    };
    storageService.saveRoleFunctionPermissions(updatedPermissions);
    setRolePermissions(updatedPermissions);
    showFeedback(
      `${grantAll ? 'Granted' : 'Revoked'} all functions for ${DOMAIN_METADATA[domain].label}.`,
      'success'
    );
  };

  // Reset current role to default permissions
  const handleResetRoleDefaults = () => {
    if (window.confirm(`Reset permissions for "${currentRoleObj.name}" to defaults?`)) {
      const updated = storageService.resetRoleFunctionPermissions(selectedRoleId);
      setRolePermissions(updated);
      showFeedback(`Permissions for "${currentRoleObj.name}" restored to defaults.`, 'info');
    }
  };

  // Custom Role Actions
  const handleOpenCreateModal = () => {
    setEditingCustomRoleId(null);
    setCustomRoleForm({
      name: '',
      department: 'HVAC Engineering & Projects',
      description: '',
      baseRole: 'estimator',
      status: 'active',
      selectedFunctions: [...(DEFAULT_ROLE_FUNCTION_PERMISSIONS.estimator || [])]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: CustomRoleDefinition) => {
    setEditingCustomRoleId(role.id);
    setCustomRoleForm({
      name: role.name,
      department: role.department,
      description: role.description || '',
      baseRole: role.baseRole || 'estimator',
      status: role.status || 'active',
      selectedFunctions: [...(rolePermissions[role.id] || role.assignedFunctions || [])]
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoleForm.name.trim()) {
      alert('Please enter a role name');
      return;
    }

    if (editingCustomRoleId) {
      // Update existing
      storageService.updateCustomRole(editingCustomRoleId, {
        name: customRoleForm.name.trim(),
        department: customRoleForm.department.trim(),
        description: customRoleForm.description.trim(),
        status: customRoleForm.status,
        assignedFunctions: customRoleForm.selectedFunctions
      });
      showFeedback(`Custom role "${customRoleForm.name}" updated successfully!`, 'success');
    } else {
      // Create new
      const created = storageService.addCustomRole({
        name: customRoleForm.name.trim(),
        code: `ROLE_${customRoleForm.name.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 8)}`,
        department: customRoleForm.department.trim(),
        badge: 'CUSTOM',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        description: customRoleForm.description.trim(),
        baseRole: customRoleForm.baseRole as UserRole,
        assignedFunctions: customRoleForm.selectedFunctions,
        assignedModuleIds: [],
        status: customRoleForm.status
      });
      setSelectedRoleId(created.id);
      showFeedback(`Custom role "${created.name}" created with ${created.assignedFunctions.length} functions!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDeleteCustomRole = (roleId: string, roleName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete custom role "${roleName}"?`)) {
      storageService.deleteCustomRole(roleId);
      setSelectedRoleId('executive');
      showFeedback(`Custom role "${roleName}" deleted.`, 'warning');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Granular Enterprise Functions & Custom Role Customization
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                {ENTERPRISE_FUNCTIONS.length} System Functions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select any standard or custom role to configure granular operational privileges across all 9 HVAC business domains. Create custom roles tailored to your organization's hierarchy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {feedback && (
              <span
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border animate-in fade-in ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : feedback.type === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {feedback.message}
              </span>
            )}

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Role Selector Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Functional Role ({allRolesList.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {customRoles.length} custom
              </span>
            </div>

            <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
              {allRolesList.map((role) => {
                const isSelected = selectedRoleId === role.id;
                const funcsCount = (rolePermissions[role.id] || []).length;
                const conflicts = evaluateSodConflicts(rolePermissions[role.id] || []);

                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black truncate">{role.name}</span>
                        {role.isCustom && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                              isSelected
                                ? 'bg-indigo-700 text-indigo-100 border border-indigo-400'
                                : 'bg-purple-100 text-purple-700 border border-purple-200'
                            }`}
                          >
                            Custom
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-indigo-200' : 'text-slate-500'
                        }`}
                      >
                        {role.department}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {conflicts.length > 0 && (
                        <span
                          title={`${conflicts.length} SoD conflict(s) detected`}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          !
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                          isSelected ? 'bg-indigo-700 text-white' : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        {funcsCount}/{ENTERPRISE_FUNCTIONS.length}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* If current role is custom, show management panel */}
          {currentRoleObj.isCustom && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  Custom Role Controls
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                  Editable
                </span>
              </div>
              <p className="text-xs text-purple-800/80">
                You can rename this custom role, change its department classification, or delete it if no longer needed.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const found = customRoles.find((r) => r.id === currentRoleObj.id);
                    if (found) handleOpenEditModal(found);
                  }}
                  className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Role</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCustomRole(currentRoleObj.id, currentRoleObj.name)}
                  className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Delete Custom Role"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Function Selection Matrix (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Active Role Card & Filters */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-black text-slate-900">{currentRoleObj.name}</h4>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {currentRoleObj.department}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Currently assigned{' '}
                  <strong className="text-indigo-600 font-bold">
                    {activeGrantedFunctions.length} of {ENTERPRISE_FUNCTIONS.length}
                  </strong>{' '}
                  granular enterprise functions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetRoleDefaults}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>

            {/* SoD Conflict Warning Alert for active role */}
            {activeSodConflicts.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold">
                    Segregation of Duties (SoD) Conflicts Detected ({activeSodConflicts.length})
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  This role has opposing sensitive functions granted which violate enterprise internal control policies:
                </p>
                <div className="space-y-1">
                  {activeSodConflicts.map((c) => (
                    <div
                      key={c.id}
                      className="text-[11px] bg-white/80 px-2.5 py-1.5 rounded-lg border border-amber-300/80 flex items-center justify-between gap-2"
                    >
                      <span className="font-semibold">{c.title}</span>
                      <span className="text-[9px] font-mono font-bold text-amber-700 uppercase bg-amber-100 px-1.5 py-0.5 rounded">
                        {c.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search & Domain Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search functions by title, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">All 9 Business Domains</option>
                {Object.keys(DOMAIN_METADATA).map((dKey) => (
                  <option key={dKey} value={dKey}>
                    {DOMAIN_METADATA[dKey as EnterpriseFunctionDomain].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Functions Matrix List by Domain */}
          <div className="space-y-4">
            {Array.from(functionsByDomain.entries()).map(([domain, funcs]) => {
              const meta = DOMAIN_METADATA[domain];
              const grantedInDomain = funcs.filter((f) => activeGrantedFunctions.includes(f.id)).length;
              const allGrantedInDomain = grantedInDomain === funcs.length;

              return (
                <div
                  key={domain}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Domain Header */}
                  <div className={`p-4 border-b border-slate-100 flex items-center justify-between gap-3 ${meta.bg}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{meta.icon}</span>
                      <div>
                        <h5 className={`text-xs font-black ${meta.color}`}>{meta.label}</h5>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {grantedInDomain} of {funcs.length} functions granted
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDomainBulkToggle(domain, !allGrantedInDomain)}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        {allGrantedInDomain ? 'Revoke All' : 'Grant All'}
                      </button>
                    </div>
                  </div>

                  {/* Functions Checklist */}
                  <div className="divide-y divide-slate-100">
                    {funcs.map((func) => {
                      const isGranted = activeGrantedFunctions.includes(func.id);
                      const risk = RISK_BADGE[func.riskLevel] || RISK_BADGE.LOW;

                      return (
                        <div
                          key={func.id}
                          onClick={() => handleToggleFunction(func.id)}
                          className={`p-4 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                            isGranted ? 'bg-indigo-50/20 hover:bg-indigo-50/40' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isGranted}
                              onChange={() => {}} // Handled by container click
                              className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-black text-slate-900">{func.name}</span>
                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                  {func.code}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${risk.class}`}
                                >
                                  {risk.label}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {func.description}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                              isGranted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {isGranted ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Create / Edit Custom Role */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-base font-black text-slate-900 tracking-tight">
                  {editingCustomRoleId ? 'Edit Custom Role' : 'Create Custom Enterprise Role'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define title, department, and custom function privileges.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior HVAC Commissioning Engineer"
                  value={customRoleForm.name}
                  onChange={(e) => setCustomRoleForm({ ...customRoleForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={customRoleForm.department}
                    onChange={(e) => setCustomRoleForm({ ...customRoleForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Clone Base Permissions From
                  </label>
                  <select
                    value={customRoleForm.baseRole}
                    onChange={(e) => {
                      const base = e.target.value as UserRole;
                      const defaults = DEFAULT_ROLE_FUNCTION_PERMISSIONS[base] || [];
                      setCustomRoleForm({
                        ...customRoleForm,
                        baseRole: base,
                        selectedFunctions: [...defaults]
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_DEFINITIONS[r].name} ({ROLE_DEFINITIONS[r].badge})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description & Responsibilities
                </label>
                <textarea
                  rows={2}
                  placeholder="Summarize the core operational scope of this role..."
                  value={customRoleForm.description}
                  onChange={(e) => setCustomRoleForm({ ...customRoleForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800">Initial Privileges Count</span>
                  <p className="text-[11px] text-slate-500">
                    Will be initialized with {customRoleForm.selectedFunctions.length} functions. You can customize them anytime in the matrix.
                  </p>
                </div>
                <span className="text-sm font-black text-indigo-600 font-mono">
                  {customRoleForm.selectedFunctions.length} functions
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20"
                >
                  {editingCustomRoleId ? 'Save Role Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
