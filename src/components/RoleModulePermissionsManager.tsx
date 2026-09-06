import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Check,
  X,
  CheckSquare,
  Square,
  RotateCcw,
  Save,
  Sparkles,
  Users,
  Eye,
  HelpCircle,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Sliders,
  Filter,
  Search
} from 'lucide-react';
import { UserRole } from '../types';
import { storageService } from '../services/storageService';
import {
  ROLE_DEFINITIONS,
  APP_MODULES,
  DEFAULT_ROLE_MODULE_PERMISSIONS,
  AppModuleInfo
} from '../utils/rbac';

interface RoleModulePermissionsManagerProps {
  onRoleSwitch?: (role: UserRole) => void;
  compact?: boolean;
}

export const RoleModulePermissionsManager: React.FC<RoleModulePermissionsManagerProps> = ({
  onRoleSwitch,
  compact = false
}) => {
  const [permissions, setPermissions] = useState<Record<UserRole, string[]>>(() =>
    storageService.getRoleModulePermissions()
  );
  const [selectedRole, setSelectedRole] = useState<UserRole>('procurement');
  const [viewMode, setViewMode] = useState<'by_role' | 'matrix_grid'>('by_role');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const currentUser = storageService.getCurrentUser();
  const isAdmin = currentUser.role === 'executive';

  // Listen to storage changes
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setPermissions(storageService.getRoleModulePermissions());
    });
    return unsubscribe;
  }, []);

  const rolesList = useMemo(() => Object.keys(ROLE_DEFINITIONS) as UserRole[], []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    APP_MODULES.forEach((m) => cats.add(m.category));
    return ['ALL', ...Array.from(cats)];
  }, []);

  const filteredModules = useMemo(() => {
    return APP_MODULES.filter((mod) => {
      const matchesSearch =
        mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || mod.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory]);

  const categoryGroupedModules = useMemo(() => {
    const map = new Map<string, AppModuleInfo[]>();
    filteredModules.forEach((mod) => {
      if (!map.has(mod.category)) {
        map.set(mod.category, []);
      }
      map.get(mod.category)!.push(mod);
    });
    return map;
  }, [filteredModules]);

  // Current active modules for the selected role
  const activeModulesForSelectedRole = permissions[selectedRole] || DEFAULT_ROLE_MODULE_PERMISSIONS[selectedRole] || [];

  // Toggle a single module for a given role
  const handleToggleModule = (role: UserRole, moduleId: string) => {
    const currentList = permissions[role] ? [...permissions[role]] : [...(DEFAULT_ROLE_MODULE_PERMISSIONS[role] || [])];
    const index = currentList.indexOf(moduleId);

    let updatedList: string[];
    if (index > -1) {
      // Don't allow deselecting 'search' or 'dashboard' for executive if it's the only one
      if (role === 'executive' && currentList.length <= 1) {
        setSaveNotification('Executive role must have at least one active module');
        setTimeout(() => setSaveNotification(null), 3000);
        return;
      }
      updatedList = currentList.filter((id) => id !== moduleId);
    } else {
      updatedList = [...currentList, moduleId];
    }

    const updatedPermissions = {
      ...permissions,
      [role]: updatedList
    };

    setPermissions(updatedPermissions);
    setHasUnsavedChanges(true);
    storageService.updateRoleModulePermissions(role, updatedList);
    showToast(`Updated permissions for ${ROLE_DEFINITIONS[role].name}`);
  };

  // Select all modules for a role
  const handleSelectAllForRole = (role: UserRole) => {
    const allIds = APP_MODULES.map((m) => m.id);
    const updated = {
      ...permissions,
      [role]: allIds
    };
    setPermissions(updated);
    storageService.updateRoleModulePermissions(role, allIds);
    showToast(`Granted all ${allIds.length} modules to ${ROLE_DEFINITIONS[role].name}`);
  };

  // Deselect all modules for a role (keep minimal safe core)
  const handleDeselectAllForRole = (role: UserRole) => {
    const safeCore = ['search', 'dashboard'];
    const updated = {
      ...permissions,
      [role]: safeCore
    };
    setPermissions(updated);
    storageService.updateRoleModulePermissions(role, safeCore);
    showToast(`Set minimal module visibility for ${ROLE_DEFINITIONS[role].name}`);
  };

  // Reset a specific role to factory defaults
  const handleResetRoleDefaults = (role: UserRole) => {
    const updated = storageService.resetRoleModulePermissions(role);
    setPermissions(updated);
    showToast(`Restored factory default module permissions for ${ROLE_DEFINITIONS[role].name}`);
  };

  // Reset all enterprise roles to factory defaults
  const handleResetAllDefaults = () => {
    if (window.confirm('Reset module visibility matrix for ALL roles to enterprise factory defaults?')) {
      const updated = storageService.resetRoleModulePermissions();
      setPermissions(updated);
      showToast('All role module visibility settings restored to factory defaults');
    }
  };

  const showToast = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => {
      setSaveNotification(null);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Role-Based Module Visibility
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Live Dynamic Access
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize which navigation menus and operational modules are visible to each user role.
                </p>
              </div>
            </div>
          </div>

          {/* View Toggle & Factory Reset */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setViewMode('by_role')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'by_role'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Role Configurator
              </button>
              <button
                onClick={() => setViewMode('matrix_grid')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === 'matrix_grid'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Matrix Grid
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={handleResetAllDefaults}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                title="Restore system default permissions for all roles"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Defaults</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Filter & Search Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search module name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MODE 1: ROLE CONFIGURATOR VIEW */}
      {viewMode === 'by_role' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Role Selector Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
                Select Persona / Role
              </div>
              <div className="space-y-1.5">
                {rolesList.map((roleKey) => {
                  const roleMeta = ROLE_DEFINITIONS[roleKey];
                  const isSelected = selectedRole === roleKey;
                  const activeCount = (permissions[roleKey] || DEFAULT_ROLE_MODULE_PERMISSIONS[roleKey] || []).length;
                  const isUserCurrentRole = currentUser.role === roleKey;

                  return (
                    <button
                      key={roleKey}
                      onClick={() => setSelectedRole(roleKey)}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between gap-3 border ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-300 text-blue-950 shadow-xs'
                          : 'bg-slate-50/50 hover:bg-slate-100/80 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleMeta.badgeColor}`}>
                            {roleMeta.badge}
                          </span>
                          {isUserCurrentRole && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold mt-1 text-slate-900 truncate">
                          {roleMeta.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {roleMeta.department}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-1 rounded-lg text-xs font-mono font-bold ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {activeCount} / {APP_MODULES.length}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">modules</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test / Switch to Role Quick Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-blue-950 text-white rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Live Role Testing</span>
              </div>
              <p className="text-xs text-indigo-200/90 leading-relaxed">
                Experience the ERP interface as a <strong>{ROLE_DEFINITIONS[selectedRole].name}</strong> with their exact visible modules.
              </p>
              <button
                onClick={() => {
                  storageService.setUserRole(selectedRole);
                  if (onRoleSwitch) onRoleSwitch(selectedRole);
                  showToast(`Switched active user role to ${ROLE_DEFINITIONS[selectedRole].name}`);
                }}
                className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                <span>Switch To {ROLE_DEFINITIONS[selectedRole].badge} Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Module Checkboxes & Categories */}
          <div className="lg:col-span-8 space-y-4">
            {/* Selected Role Action Bar */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${ROLE_DEFINITIONS[selectedRole].badgeColor}`}>
                    {ROLE_DEFINITIONS[selectedRole].badge}
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    {ROLE_DEFINITIONS[selectedRole].name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {ROLE_DEFINITIONS[selectedRole].description}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleSelectAllForRole(selectedRole)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Select All</span>
                </button>
                <button
                  onClick={() => handleDeselectAllForRole(selectedRole)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Deselect All</span>
                </button>
                <button
                  onClick={() => handleResetRoleDefaults(selectedRole)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                  title="Reset this role to default modules"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Modules Grouped By Category */}
            <div className="space-y-4">
              {Array.from(categoryGroupedModules.entries()).map(([catName, modules]) => {
                const categoryActiveCount = modules.filter((m) => activeModulesForSelectedRole.includes(m.id)).length;

                return (
                  <div
                    key={catName}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          {catName}
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {categoryActiveCount} / {modules.length} Enabled
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {modules.map((mod) => {
                        const isChecked = activeModulesForSelectedRole.includes(mod.id);

                        return (
                          <div
                            key={mod.id}
                            onClick={() => handleToggleModule(selectedRole, mod.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isChecked
                                ? 'bg-blue-50/70 border-blue-300 text-blue-950 shadow-2xs'
                                : 'bg-slate-50/60 hover:bg-slate-100/60 border-slate-200 text-slate-600 opacity-70'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900">
                                  {mod.name}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                {mod.description}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 mt-1">
                                ID: {mod.id}
                              </div>
                            </div>

                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white font-bold transition-all ${
                                isChecked
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-transparent'
                              }`}
                            >
                              {isChecked ? <Check className="w-4 h-4" /> : null}
                            </div>
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
      )}

      {/* MODE 2: FULL ENTERPRISE MATRIX GRID VIEW */}
      {viewMode === 'matrix_grid' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Enterprise Role-Module Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any cell to grant or revoke module visibility for that role in real-time.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block"></span> Granted
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-slate-200 rounded-sm inline-block"></span> Hidden
              </span>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="py-3.5 px-4 sticky left-0 bg-slate-900 z-10 w-64">
                    Module / Workflow
                  </th>
                  <th className="py-3.5 px-3">Category</th>
                  {rolesList.map((roleKey) => {
                    const r = ROLE_DEFINITIONS[roleKey];
                    return (
                      <th key={roleKey} className="py-3.5 px-3 text-center min-w-[110px]">
                        <div className="flex flex-col items-center">
                          <span className="text-[11px]">{r.badge}</span>
                          <span className="text-[9px] font-normal text-slate-300 truncate max-w-[100px]">
                            {r.name.split('/')[0]}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredModules.map((mod, mIdx) => {
                  return (
                    <tr
                      key={mod.id}
                      className={mIdx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/60'}
                    >
                      <td className="py-2.5 px-4 font-semibold text-slate-900 sticky left-0 bg-inherit z-10">
                        <div>
                          <div className="font-bold text-slate-900">{mod.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{mod.id}</div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium">
                          {mod.category}
                        </span>
                      </td>

                      {rolesList.map((roleKey) => {
                        const rolePerms = permissions[roleKey] || DEFAULT_ROLE_MODULE_PERMISSIONS[roleKey] || [];
                        const isGranted = rolePerms.includes(mod.id);

                        return (
                          <td key={roleKey} className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => handleToggleModule(roleKey, mod.id)}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                                isGranted
                                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xs font-bold'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-300'
                              }`}
                              title={`${isGranted ? 'Revoke' : 'Grant'} ${mod.name} for ${ROLE_DEFINITIONS[roleKey].name}`}
                            >
                              {isGranted ? <Check className="w-4 h-4" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
