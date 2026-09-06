import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  UserX,
  UserCheck,
  Edit3,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Phone,
  Mail,
  Building,
  Key,
  Shield,
  Layers,
  ArrowRightLeft,
  X
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { RBAC, ROLE_DEFINITIONS, APP_MODULES } from '../utils/rbac';
import { RoleModulePermissionsManager } from './RoleModulePermissionsManager';

interface UserManagementViewProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentRole,
  onRoleChange
}) => {
  const [users, setUsers] = useState<UserProfile[]>(storageService.getUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile>(storageService.getCurrentUser());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'users' | 'module_permissions' | 'matrix'>('users');

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('+91 ');
  const [newUserRole, setNewUserRole] = useState<UserRole>('procurement');
  const [newUserTitle, setNewUserTitle] = useState('');
  const [newUserDepartment, setNewUserDepartment] = useState('');

  // Edit User Role Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('procurement');
  const [editTitle, setEditTitle] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

  const isAdmin = currentRole === 'executive';

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setUsers(storageService.getUsers());
      setCurrentUser(storageService.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const handleOpenAddUser = () => {
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('+91 98');
    setNewUserRole('procurement');
    setNewUserTitle(ROLE_DEFINITIONS.procurement.name);
    setNewUserDepartment('Procurement & Materials');
    setIsAddUserModalOpen(true);
  };

  const handleRoleSelectChange = (role: UserRole) => {
    setNewUserRole(role);
    setNewUserTitle(ROLE_DEFINITIONS[role].name);
    setNewUserDepartment(ROLE_DEFINITIONS[role].department);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Please enter user name and email.');
      return;
    }

    try {
      storageService.addUser({
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        phone: newUserPhone.trim(),
        role: newUserRole,
        title: newUserTitle.trim() || ROLE_DEFINITIONS[newUserRole].name,
        department: newUserDepartment.trim() || ROLE_DEFINITIONS[newUserRole].department
      });

      setIsAddUserModalOpen(false);
    } catch (e: any) {
      alert(e.message || 'Error creating user');
    }
  };

  const handleOpenEditUser = (u: UserProfile) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditTitle(u.title);
    setEditDepartment(u.department || ROLE_DEFINITIONS[u.role].department);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      storageService.updateUser(editingUser.id, {
        role: editRole,
        title: editTitle,
        department: editDepartment
      });
      setEditingUser(null);
    } catch (e: any) {
      alert(e.message || 'Error updating user');
    }
  };

  const handleToggleStatus = (u: UserProfile) => {
    if (u.id === currentUser.id && u.status === 'active') {
      const confirmSelf = window.confirm(
        'You are currently logged in as this user. Deactivating this account will limit active operations. Are you sure?'
      );
      if (!confirmSelf) return;
    }
    try {
      storageService.toggleUserStatus(u.id);
    } catch (e: any) {
      alert(e.message || 'Error updating user status');
    }
  };

  const handleSwitchToUser = (u: UserProfile) => {
    if (u.status === 'deactivated') {
      alert('Cannot switch to a deactivated user account. Please activate the user first.');
      return;
    }
    try {
      storageService.switchUser(u.id);
      onRoleChange(u.role);
    } catch (e: any) {
      alert(e.message || 'Error switching user');
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const q = (searchTerm || '').trim().toLowerCase();
    const matchesQuery =
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.title || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q);

    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;

    return matchesQuery && matchesRole && matchesStatus;
  });

  const activeCount = users.filter((u) => u.status === 'active').length;
  const deactivatedCount = users.filter((u) => u.status === 'deactivated').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Permission Bar */}
      {!isAdmin ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">
                Admin Access Restricted • Viewing as {ROLE_DEFINITIONS[currentRole].name}
              </div>
              <p className="text-xs text-slate-600">
                User management, role assignment, and account deactivation are reserved exclusively for the <strong>Admin / Managing Director (Executive)</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => onRoleChange('executive')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <ShieldCheck className="w-4 h-4" />
            Switch to Admin Persona
          </button>
        </div>
      ) : null}

      {/* Main Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              User & RBAC Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Admin Control Center
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision team members, assign operational roles, control approval privileges, and manage account statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Users Directory ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('module_permissions')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'module_permissions' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Module Visibility Matrix
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'matrix' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Action RBAC Matrix
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddUser}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider truncate">Total Users</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{users.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">Configured Profiles</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wider flex items-center gap-1 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"></span>
            <span className="truncate">Active Accounts</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">{activeCount}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5 truncate">Ready for ERP Operations</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="text-xs text-rose-600 font-semibold uppercase tracking-wider flex items-center gap-1 truncate">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0"></span>
            <span className="truncate">Deactivated</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1">{deactivatedCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">Access Suspended</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs min-w-0">
          <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wider flex items-center gap-1 truncate">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Current User</span>
          </div>
          <div className="text-sm sm:text-base font-bold text-slate-900 mt-1 truncate">{currentUser.name}</div>
          <div className="text-[11px] text-indigo-600 font-semibold truncate">{currentUser.title}</div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'users' ? (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user name, email, department, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Roles</option>
                <option value="executive">Admin / Executive</option>
                <option value="procurement">Procurement Manager</option>
                <option value="sales_manager">Business Manager / Sales</option>
                <option value="estimator">MEP / HVAC Estimator</option>
                <option value="warehouse">Warehouse Superintendent</option>
                <option value="finance">Finance Controller</option>
                <option value="technician">Field Project Engineer</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="deactivated">Deactivated Only</option>
              </select>
            </div>
          </div>

          {/* User Cards / Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User Profile</th>
                    <th className="py-3 px-4">Role & Permissions</th>
                    <th className="py-3 px-4">Department & Contact</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No team members matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const roleMeta = ROLE_DEFINITIONS[u.role] || ROLE_DEFINITIONS.executive;
                      const isCurrent = u.id === currentUser.id;

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            u.status === 'deactivated' ? 'opacity-60 bg-slate-50/50' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                  {u.name}
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 text-[11px] font-medium">{u.title}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${roleMeta.badgeColor}`}>
                                {roleMeta.badge}
                              </span>
                              <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                                {roleMeta.description}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="space-y-0.5 text-slate-600 text-xs">
                              <div className="font-medium text-slate-800 flex items-center gap-1.5">
                                <Building className="w-3 h-3 text-slate-400" />
                                {u.department || roleMeta.department}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {u.email}
                              </div>
                              {u.phone && (
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {u.phone}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            {u.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Deactivated
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Switch to this user */}
                              {u.status === 'active' && !isCurrent && (
                                <button
                                  onClick={() => handleSwitchToUser(u)}
                                  title={`Switch login session to ${u.name}`}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                                >
                                  <ArrowRightLeft className="w-3 h-3" />
                                  <span className="hidden sm:inline">Switch</span>
                                </button>
                              )}

                              {/* Edit Role (Admin Only) */}
                              {isAdmin && (
                                <button
                                  onClick={() => handleOpenEditUser(u)}
                                  title="Edit Role & Permissions"
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Deactivate / Reactivate (Admin Only) */}
                              {isAdmin && (
                                <button
                                  onClick={() => handleToggleStatus(u)}
                                  title={u.status === 'active' ? 'Deactivate user' : 'Reactivate user'}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    u.status === 'active'
                                      ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                      : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                                  }`}
                                >
                                  {u.status === 'active' ? (
                                    <UserX className="w-3.5 h-3.5" />
                                  ) : (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* RBAC Permissions Matrix Tab */
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Enterprise Role-Based Access Control (RBAC) Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Detailed mapping of workflow capabilities and approval authorities configured in the HVAC ERP platform.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Role / Persona</th>
                    <th className="py-3 px-3 text-center">PR Creation</th>
                    <th className="py-3 px-3 text-center">PR Approval (Procurement)</th>
                    <th className="py-3 px-3 text-center">PO Creation</th>
                    <th className="py-3 px-3 text-center">PO Signoff (Business Mgr)</th>
                    <th className="py-3 px-3 text-center">Transmit PO</th>
                    <th className="py-3 px-3 text-center">Inward Goods (GRN)</th>
                    <th className="py-3 px-3 text-center">User Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((roleKey) => {
                    const role = ROLE_DEFINITIONS[roleKey];
                    return (
                      <tr key={roleKey} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${role.badgeColor}`}>
                              {role.badge}
                            </span>
                            <span>{role.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {RBAC.canCreatePR(roleKey) ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {RBAC.canApprovePR(roleKey) ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {RBAC.canCreatePO(roleKey) ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {RBAC.canApprovePO(roleKey) ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {RBAC.canTransmitPO(roleKey) ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {RBAC.canInwardGoods(roleKey) ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {RBAC.canManageUsers(roleKey) ? (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 inline-block" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Role-Based Module Visibility Tab */}
      {activeTab === 'module_permissions' && (
        <RoleModulePermissionsManager
          onRoleSwitch={(newRole) => {
            onRoleChange(newRole);
          }}
        />
      )}

      {/* Add New User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Add New Team Member</h2>
                  <p className="text-xs text-slate-500">Provision ERP profile and assign operational role</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="ramesh@company.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Assign RBAC Role *
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => handleRoleSelectChange(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="procurement">Purchase / Procurement Manager (Approves PR, Creates PO)</option>
                  <option value="sales_manager">Business Manager / Sales Head (Signs off PO, Awards contracts)</option>
                  <option value="estimator">MEP / HVAC Estimator (Creates Quotes & BOQ, Raises PR)</option>
                  <option value="warehouse">Warehouse / Inventory Head (Stock, GRN Inwarding)</option>
                  <option value="finance">Finance Controller (Invoicing & Settlement)</option>
                  <option value="technician">Field HVAC Project Engineer (Work Orders & Site PRs)</option>
                  <option value="executive">Executive / Managing Director (Super Admin - All Rights)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={newUserTitle}
                    onChange={(e) => setNewUserTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newUserDepartment}
                    onChange={(e) => setNewUserDepartment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Role Permissions Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Included Permissions for {ROLE_DEFINITIONS[newUserRole].name}:
                </div>
                <ul className="space-y-0.5 text-slate-600 list-disc list-inside text-[11px]">
                  {ROLE_DEFINITIONS[newUserRole].keyPermissions.map((perm, idx) => (
                    <li key={idx}>{perm}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Create & Activate User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Edit User Role</h2>
                  <p className="text-xs text-slate-500">Update permissions for {editingUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Assigned RBAC Role *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => {
                    const role = e.target.value as UserRole;
                    setEditRole(role);
                    setEditTitle(ROLE_DEFINITIONS[role].name);
                    setEditDepartment(ROLE_DEFINITIONS[role].department);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="executive">Executive / Managing Director (Super Admin)</option>
                  <option value="procurement">Purchase / Procurement Manager</option>
                  <option value="sales_manager">Business Manager / Sales Head</option>
                  <option value="estimator">MEP / HVAC Estimator</option>
                  <option value="warehouse">Warehouse Superintendent</option>
                  <option value="finance">Finance Controller</option>
                  <option value="technician">Field HVAC Project Engineer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Designation / Job Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Department
                </label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Save Role Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
