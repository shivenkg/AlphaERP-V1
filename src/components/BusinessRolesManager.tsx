import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Building2,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Mail
} from 'lucide-react';
import {
  BusinessRole,
  UserProfile,
  EnterpriseFunction
} from '../types';
import { storageService } from '../services/storageService';
import {
  ENTERPRISE_FUNCTIONS,
  evaluateSodConflicts
} from '../utils/rbac';

export const BusinessRolesManager: React.FC = () => {
  const [businessRoles, setBusinessRoles] = useState<BusinessRole[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Expanded functions accordion per role
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);

  // User Mapping Modal
  const [mappingRole, setMappingRole] = useState<BusinessRole | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');

  // Create / Edit Business Role Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    department: 'Sales & Project Engineering',
    description: '',
    selectedFunctions: [] as string[],
    status: 'active' as 'active' | 'inactive'
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
    setBusinessRoles(storageService.getBusinessRoles());
    setAllUsers(storageService.getUsers());
  };

  const showFeedback = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Filtered business roles
  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return businessRoles;
    const q = searchTerm.toLowerCase();
    return businessRoles.filter((r) => {
      if (
        r.name.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q)
      ) {
        return true;
      }
      // Search assigned users
      const hasUserMatch = (r.assignedUserIds || []).some((uid) => {
        const u = allUsers.find((usr) => usr.id === uid);
        return u && (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      });
      return hasUserMatch;
    });
  }, [businessRoles, searchTerm, allUsers]);

  // Total unique mapped users
  const totalMappedUsersCount = useMemo(() => {
    const set = new Set<string>();
    businessRoles.forEach((r) => (r.assignedUserIds || []).forEach((uid) => set.add(uid)));
    return set.size;
  }, [businessRoles]);

  // Open User Mapping Picker
  const handleOpenUserMapping = (role: BusinessRole) => {
    setMappingRole(role);
    setSelectedUserIds([...(role.assignedUserIds || [])]);
    setUserSearchTerm('');
  };

  // Toggle user in mapping modal
  const handleToggleUserInMapping = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Save User Mapping
  const handleSaveUserMapping = () => {
    if (!mappingRole) return;
    storageService.assignUsersToBusinessRole(mappingRole.id, selectedUserIds);
    showFeedback(
      `Assigned ${selectedUserIds.length} user(s) to business role "${mappingRole.name}".`,
      'success'
    );
    setMappingRole(null);
  };

  // Remove single user directly from role card
  const handleRemoveUserFromRole = (roleId: string, userId: string) => {
    const role = businessRoles.find((r) => r.id === roleId);
    if (!role) return;
    const updatedUserIds = (role.assignedUserIds || []).filter((id) => id !== userId);
    storageService.assignUsersToBusinessRole(roleId, updatedUserIds);
    showFeedback(`User removed from role.`, 'info');
  };

  // Open Create Role Modal
  const handleOpenCreateRole = () => {
    setEditingRoleId(null);
    setRoleForm({
      name: '',
      department: 'HVAC Project Engineering',
      description: '',
      selectedFunctions: ['fn_eng_heatload_calc', 'fn_eng_boq_costing', 'fn_proj_manage_lifecycle'],
      status: 'active'
    });
    setIsEditModalOpen(true);
  };

  // Open Edit Role Modal
  const handleOpenEditRole = (role: BusinessRole) => {
    setEditingRoleId(role.id);
    setRoleForm({
      name: role.name,
      department: role.department,
      description: role.description || '',
      selectedFunctions: [...(role.assignedFunctions || [])],
      status: role.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  // Save Business Role (Create / Update)
  const handleSaveRoleForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      alert('Please enter a business role title');
      return;
    }

    if (editingRoleId) {
      storageService.updateBusinessRole(editingRoleId, {
        name: roleForm.name.trim(),
        department: roleForm.department.trim(),
        description: roleForm.description.trim(),
        assignedFunctions: roleForm.selectedFunctions,
        status: roleForm.status
      });
      showFeedback(`Business role "${roleForm.name}" updated!`, 'success');
    } else {
      const code = `BR_${roleForm.name.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 8)}`;
      storageService.addBusinessRole({
        code,
        name: roleForm.name.trim(),
        department: roleForm.department.trim(),
        description: roleForm.description.trim(),
        associatedSystemRole: 'estimator',
        assignedFunctions: roleForm.selectedFunctions,
        assignedUserIds: [],
        status: roleForm.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      showFeedback(`Business role "${roleForm.name}" created!`, 'success');
    }

    setIsEditModalOpen(false);
  };

  // Delete Business Role
  const handleDeleteRole = (roleId: string, roleName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete business role "${roleName}"?`)) {
      storageService.deleteBusinessRole(roleId);
      showFeedback(`Business role "${roleName}" deleted.`, 'warning');
    }
  };

  // Filtered users for mapping modal
  const filteredUsersForModal = useMemo(() => {
    if (!userSearchTerm.trim()) return allUsers;
    const q = userSearchTerm.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [allUsers, userSearchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Business Roles & Multi-User Assignment Directory
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                {businessRoles.length} Defined Roles
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Business roles define organizational titles with bound HVAC operational functions. Map multiple employees from your user roster directly to these roles to govern execution permissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {feedback && (
              <span
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border animate-in fade-in ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {feedback.message}
              </span>
            )}

            <button
              type="button"
              onClick={handleOpenCreateRole}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Business Role</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
              Business Roles
            </span>
            <div className="text-xl font-black text-teal-900 mt-1">
              {businessRoles.length}
            </div>
            <span className="text-[10px] text-teal-600">Configured job positions</span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              Mapped Employees
            </span>
            <div className="text-xl font-black text-blue-900 mt-1">
              {totalMappedUsersCount} / {allUsers.length}
            </div>
            <span className="text-[10px] text-blue-600">Active roster members</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
              Total Roster Users
            </span>
            <div className="text-xl font-black text-indigo-900 mt-1">
              {allUsers.length}
            </div>
            <span className="text-[10px] text-indigo-600">System user accounts</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Governance Status
            </span>
            <div className="text-xl font-black text-emerald-900 mt-1">
              Active
            </div>
            <span className="text-[10px] text-emerald-600">SoD checks integrated</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search business roles by title, department, or mapped employee name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Business Roles Cards Directory */}
      <div className="space-y-4">
        {filteredRoles.map((role) => {
          const isExpanded = expandedRoleId === role.id;
          const assignedUserObjs = (role.assignedUserIds || [])
            .map((uid) => allUsers.find((u) => u.id === uid))
            .filter((u): u is UserProfile => Boolean(u));

          const conflicts = evaluateSodConflicts(role.assignedFunctions || []);

          return (
            <div
              key={role.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="text-base font-black text-slate-900">{role.name}</h4>
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {role.department}
                    </span>
                    {conflicts.length > 0 && (
                      <span
                        title="This business role bundles opposing sensitive functions"
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        SoD Warning ({conflicts.length})
                      </span>
                    )}
                  </div>
                  {role.description && (
                    <p className="text-xs text-slate-500 mt-1">{role.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenUserMapping(role)}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Map Users ({(role.assignedUserIds || []).length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditRole(role)}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors cursor-pointer"
                    title="Edit Role Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteRole(role.id, role.name)}
                    className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors cursor-pointer"
                    title="Delete Role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mapped Users Section (Interactive Tags) */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    Assigned Employees ({assignedUserObjs.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenUserMapping(role)}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                  >
                    + Add / Modify Users
                  </button>
                </div>

                {assignedUserObjs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No users currently mapped to this position. Click "+ Add / Modify Users" to assign employees.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {assignedUserObjs.map((usr) => (
                      <div
                        key={usr.id}
                        className="bg-white border border-slate-200 rounded-xl pl-2.5 pr-1.5 py-1 flex items-center gap-2 text-xs shadow-2xs group hover:border-teal-300 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold">
                          {usr.name.charAt(0)}
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="font-bold text-slate-800">{usr.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{usr.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveUserFromRole(role.id, usr.id)}
                          className="w-4 h-4 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          title={`Unmap ${usr.name} from this role`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Functions Summary Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setExpandedRoleId(isExpanded ? null : role.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>
                    {(role.assignedFunctions || []).length} Bound Enterprise Functions{' '}
                    {isExpanded ? '(Hide List)' : '(Click to View)'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap gap-1.5 animate-in fade-in">
                    {(role.assignedFunctions || []).map((fnId) => {
                      const fnObj = ENTERPRISE_FUNCTIONS.find((f) => f.id === fnId);
                      return (
                        <span
                          key={fnId}
                          className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-medium text-slate-800 flex items-center gap-1.5 shadow-2xs"
                        >
                          <span className="font-bold text-teal-600">✓</span>
                          <span>{fnObj?.name || fnId}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Interactive Multi-User Mapping Picker */}
      {mappingRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900">
                  Assign Users to "{mappingRole.name}"
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select multiple employees from your enterprise user directory.
                </p>
              </div>
              <button
                onClick={() => setMappingRole(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or current system role..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* User Checkbox List */}
            <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
              {filteredUsersForModal.map((usr) => {
                const isSelected = selectedUserIds.includes(usr.id);

                return (
                  <div
                    key={usr.id}
                    onClick={() => handleToggleUserInMapping(usr.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-300 text-teal-950'
                        : 'bg-white border-slate-200 hover:bg-slate-100/70 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by container click
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 cursor-pointer"
                      />
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {usr.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{usr.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{usr.email}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                      {usr.role}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-600">
                {selectedUserIds.length} employee(s) selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMappingRole(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserMapping}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-500/20 cursor-pointer"
                >
                  Save Mapping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Business Role */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900">
                  {editingRoleId ? 'Edit Business Role' : 'Create Business Role Position'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define title, department, and bind enterprise functions.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoleForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior HVAC Project Lead"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., HVAC Project Engineering"
                  value={roleForm.department}
                  onChange={(e) => setRoleForm({ ...roleForm, department: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Role mandate and key operational authorities..."
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              {/* Function checklist inside modal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Associated Functions ({roleForm.selectedFunctions.length} selected)
                </label>
                <div className="max-h-[200px] overflow-y-auto border border-slate-200 rounded-xl p-2 divide-y divide-slate-100 bg-slate-50/50 text-xs">
                  {ENTERPRISE_FUNCTIONS.map((f) => {
                    const isChecked = roleForm.selectedFunctions.includes(f.id);
                    return (
                      <div
                        key={f.id}
                        onClick={() => {
                          setRoleForm((prev) => ({
                            ...prev,
                            selectedFunctions: isChecked
                              ? prev.selectedFunctions.filter((id) => id !== f.id)
                              : [...prev.selectedFunctions, f.id]
                          }));
                        }}
                        className="py-1.5 px-2 flex items-center justify-between cursor-pointer hover:bg-slate-100 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span className="font-semibold text-slate-800">{f.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{f.code}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-500/20 cursor-pointer"
                >
                  {editingRoleId ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
