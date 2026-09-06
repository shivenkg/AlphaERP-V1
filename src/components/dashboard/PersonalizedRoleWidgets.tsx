import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  FileText,
  Boxes,
  CreditCard,
  Users,
  Target,
  Briefcase,
  Layers,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Eye,
  Activity,
  ChevronRight,
  Plus,
  Building2,
  Truck,
  Calendar,
  ShieldAlert,
  DollarSign,
  Percent,
  Landmark,
  Wrench,
  Check,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import {
  UserRole,
  UserProfile,
  Lead,
  Quote,
  Project,
  InventoryItem,
  PurchaseRequisition,
  PurchaseOrder,
  PaymentRecord,
  SalesRep,
  AuditLog,
  GoogleSheetsSyncConfig,
  ChartOfAccount,
  TDSRecord,
  JobRequisition,
  Employee,
  PayrollMonth
} from '../../types';
import { storageService } from '../../services/storageService';
import { ROLE_DEFINITIONS } from '../../utils/rbac';

interface PersonalizedRoleWidgetsProps {
  currentUser?: UserProfile;
  currentRole?: UserRole;
  leads: Lead[];
  quotes: Quote[];
  projects: Project[];
  inventory: InventoryItem[];
  prs: PurchaseRequisition[];
  pos: PurchaseOrder[];
  payments: PaymentRecord[];
  salesReps: SalesRep[];
  auditLogs: AuditLog[];
  sheetsConfig: GoogleSheetsSyncConfig;
  accounts?: ChartOfAccount[];
  tdsRecords?: TDSRecord[];
  jobRequisitions?: JobRequisition[];
  employees?: Employee[];
  payrollMonths?: PayrollMonth[];
  onNavigate: (tab: string) => void;
  onOpenNewLead: () => void;
  onOpenNewQuote: () => void;
}

const ROLE_PRESETS: Array<{
  role: UserRole;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
}> = [
  {
    role: 'sales_manager',
    label: 'Sales Rep & Manager',
    shortLabel: 'Sales Rep',
    icon: Target,
    accentColor: 'emerald',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  },
  {
    role: 'procurement',
    label: 'Procurement Officer',
    shortLabel: 'Procurement',
    icon: ShoppingCart,
    accentColor: 'blue',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  },
  {
    role: 'executive',
    label: 'Managing Director & Admin',
    shortLabel: 'Admin / Exec',
    icon: ShieldCheck,
    accentColor: 'indigo',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
  },
  {
    role: 'estimator',
    label: 'Chief Estimator & BOQ',
    shortLabel: 'Estimator',
    icon: FileText,
    accentColor: 'amber',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
  },
  {
    role: 'warehouse',
    label: 'Warehouse & Stock',
    shortLabel: 'Warehouse',
    icon: Boxes,
    accentColor: 'teal',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
  },
  {
    role: 'finance',
    label: 'Finance & Accounts',
    shortLabel: 'Finance',
    icon: Landmark,
    accentColor: 'purple',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  },
  {
    role: 'technician',
    label: 'Field HVAC Engineer',
    shortLabel: 'Technician',
    icon: Wrench,
    accentColor: 'slate',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
];

export const PersonalizedRoleWidgets: React.FC<PersonalizedRoleWidgetsProps> = ({
  currentUser: initialUser,
  currentRole: initialRole,
  leads,
  quotes,
  projects,
  inventory,
  prs,
  pos,
  payments,
  salesReps,
  auditLogs,
  sheetsConfig,
  accounts = [],
  tdsRecords = [],
  jobRequisitions = [],
  employees = [],
  payrollMonths = [],
  onNavigate,
  onOpenNewLead,
  onOpenNewQuote
}) => {
  const loggedInUser = initialUser || storageService.getCurrentUser();
  const effectiveUserRole = initialRole || loggedInUser.role || 'executive';

  // Selected persona view state (defaults to logged-in user's role, but user can switch to preview other roles)
  const [activePersonaRole, setActivePersonaRole] = useState<UserRole>(effectiveUserRole);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Sync with prop changes if current role changes externally
  useEffect(() => {
    setActivePersonaRole(effectiveUserRole);
  }, [effectiveUserRole]);

  const isSimulated = activePersonaRole !== effectiveUserRole;
  const currentRoleMeta = ROLE_DEFINITIONS[activePersonaRole] || ROLE_DEFINITIONS.executive;
  const currentPreset = ROLE_PRESETS.find((p) => p.role === activePersonaRole) || ROLE_PRESETS[0];

  const handleApplyRoleGlobally = (role: UserRole) => {
    storageService.setUserRole(role);
    setActivePersonaRole(role);
  };

  // -------------------------------------------------------------
  // DATA CALCULATIONS FOR PERSONAS
  // -------------------------------------------------------------

  // Sales calculations
  const awardedQuotes = quotes.filter((q) => q.status === 'Awarded');
  const totalAwardedSales = awardedQuotes.reduce((sum, q) => sum + q.totalAmount, 0);
  const activePipelineLeads = leads.filter((l) => l.status !== 'Awarded' && l.status !== 'Lost');
  const activePipelineValue = activePipelineLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const topSalesLeadRep = salesReps[0];
  const monthlyTarget = topSalesLeadRep ? topSalesLeadRep.monthlyTarget : 6500000;
  const achievedSales = topSalesLeadRep ? topSalesLeadRep.achievedSalesMonth : totalAwardedSales;
  const targetPct = Math.min(100, Math.round((achievedSales / monthlyTarget) * 100));
  const targetGap = Math.max(0, monthlyTarget - achievedSales);
  const totalCommission = topSalesLeadRep
    ? topSalesLeadRep.calculatedCommission
    : Math.round(totalAwardedSales * 0.015);

  const urgentLeads = activePipelineLeads
    .filter((l) => l.priority === 'High' || l.status === 'Site Survey Scheduled' || l.status === 'Negotiation')
    .slice(0, 4);

  // Procurement calculations
  const pendingPRs = prs.filter((p) => p.status === 'Pending Approval' || p.status === 'Approved');
  const activePOs = pos.filter((p) => p.status === 'Sent to Vendor' || p.status === 'Partially Received');
  const lowStockItems = inventory.filter((i) => i.availableStock <= i.reorderLevel);
  const projectsWithShortages = projects.filter((p) => p.totalShortageItemsCount > 0);

  // Executive / Admin calculations
  const totalRevenue =
    accounts.filter((a) => a.type === 'Revenue').reduce((sum, a) => sum + a.currentBalance, 0) || 18500000;
  const totalExpenses =
    accounts.filter((a) => a.type === 'Expense' || a.type === 'COGS').reduce((sum, a) => sum + a.currentBalance, 0) ||
    14470000;
  const ebitda = totalRevenue - totalExpenses;
  const ebitdaMargin = ((ebitda / totalRevenue) * 100).toFixed(1);
  const pendingReceivables = payments
    .filter((p) => !p.isPayable && p.status !== 'Paid')
    .reduce((sum, p) => sum + p.totalAmount, 0);
  const totalCollected = payments
    .filter((p) => !p.isPayable && p.status === 'Paid')
    .reduce((sum, p) => sum + p.totalAmount, 0);
  const recentAuditEvents = auditLogs.slice(0, 4);
  const highValuePRs = prs.filter((p) => p.totalEstimatedAmount >= 150000 && p.status === 'Pending Approval');
  const systemUsers = storageService.getUsers();
  const activeUsersCount = systemUsers.filter((u) => u.status === 'active').length;
  const deactivatedUsersCount = systemUsers.filter((u) => u.status === 'deactivated').length;

  // Estimator calculations
  const draftOrSentQuotes = quotes.filter((q) => q.status === 'Draft' || q.status === 'Sent to Client');
  const totalQuotePipelineValue = draftOrSentQuotes.reduce((sum, q) => sum + q.totalAmount, 0);

  // Warehouse calculations
  const totalInventoryValue = inventory.reduce((sum, i) => sum + i.currentStock * i.averageUnitCost, 0);

  // Finance calculations
  const pendingTdsDeposit = tdsRecords
    .filter((t) => t.status === 'Deducted')
    .reduce((sum, t) => sum + t.tdsAmount, 0);
  const latestPayrollAmount = payrollMonths[0]?.totalNetPayable || 335000;
  const activeStaffCount = employees.filter((e) => e.status === 'Active').length || 8;

  // -------------------------------------------------------------
  // RENDER ROLE-SPECIFIC CONTENT
  // -------------------------------------------------------------

  const renderSalesManagerWidgets = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Widget 1: Monthly Sales Target & Quota Velocity */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Monthly Quota & Target
                </h4>
                <p className="text-[11px] text-slate-500">Sales velocity & milestone achievement</p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                targetPct >= 90
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                  : targetPct >= 60
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
              }`}
            >
              {targetPct}% Attained
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                ₹{(achievedSales / 100000).toFixed(2)} L
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Target: ₹{(monthlyTarget / 100000).toFixed(1)} L
              </span>
            </div>

            {/* Target Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  targetPct >= 100
                    ? 'bg-emerald-500'
                    : targetPct >= 70
                    ? 'bg-blue-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${targetPct}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Gap to Target:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {targetGap > 0 ? `₹${(targetGap / 100000).toFixed(1)} L` : 'Target Exceeded!'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Est. Commission:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{(totalCommission / 1000).toFixed(1)}k
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">{awardedQuotes.length} Deals Won This Month</span>
          <button
            onClick={() => onNavigate('sales')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Quotas & Bonus</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 2: Hot Leads Requiring Immediate Action */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Hot Leads & Action Queue
                </h4>
                <p className="text-[11px] text-slate-500">{activePipelineLeads.length} active opportunities</p>
              </div>
            </div>
            <button
              onClick={onOpenNewLead}
              className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Add New Lead"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lead</span>
            </button>
          </div>

          <div className="space-y-2">
            {urgentLeads.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                No hot leads pending action. Create a new lead to populate your pipeline!
              </div>
            ) : (
              urgentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {lead.clientName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0 font-medium">
                        {lead.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {lead.hvacType} • {lead.estimatedCapacityTR} TR
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                      ₹{((lead.estimatedValue || 0) / 100000).toFixed(1)}L
                    </div>
                    <button
                      onClick={() => onNavigate('crm')}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      View CRM
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Pipeline: ₹{(activePipelineValue / 100000).toFixed(1)} Lakhs</span>
          <button
            onClick={() => onNavigate('crm')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Full CRM Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 3: Conversion Rates & Fast Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Win Velocity & Channels
                </h4>
                <p className="text-[11px] text-slate-500">Lead generation source yield</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
              Commercial Focus
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">WhatsApp Inbound</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                {leads.filter((l) => l.source === 'WhatsApp').length} Leads
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">HVAC Consultants</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                {leads.filter((l) => l.source === 'HVAC Consultant').length} Leads
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Direct Sales & Architects</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                {leads.filter((l) => l.source === 'Direct Sales' || l.source === 'Architect').length} Leads
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Average Deal Size</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                ₹{(activePipelineValue / Math.max(1, activePipelineLeads.length) / 100000).toFixed(1)}L
              </span>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-500">Need quick pricing for a client?</div>
            <button
              onClick={onOpenNewQuote}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft Quote</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Quotations: {quotes.length} Total</span>
          <button
            onClick={() => onNavigate('quotes')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Quotes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderProcurementWidgets = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Widget 1: Pending Purchase Requisitions (PR) Queue */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Pending PRs for PO Issuance
                </h4>
                <p className="text-[11px] text-slate-500">{pendingPRs.length} requisitions awaiting action</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              PR Action
            </span>
          </div>

          <div className="space-y-2">
            {pendingPRs.length === 0 ? (
              <div className="text-center py-5 text-xs text-slate-400">
                All purchase requisitions converted to POs. Great job!
              </div>
            ) : (
              pendingPRs.slice(0, 3).map((pr) => (
                <div
                  key={pr.id}
                  onClick={() => onNavigate('procurement')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {pr.prNumber}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        pr.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                      }`}
                    >
                      {pr.priority}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-1">
                    {pr.projectName}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>{pr.items.length} items • By {pr.requestedBy}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      ₹{(pr.totalEstimatedAmount / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">{prs.length} Total PRs in Registry</span>
          <button
            onClick={() => onNavigate('procurement')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Convert to PO</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 2: Active Vendor PO Deliveries & Receipts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Active PO Vendor Deliveries
                </h4>
                <p className="text-[11px] text-slate-500">{activePOs.length} POs en route</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
              Supply Pipeline
            </span>
          </div>

          <div className="space-y-2">
            {activePOs.length === 0 ? (
              <div className="text-center py-5 text-xs text-slate-400">
                No active POs in transit. All vendor shipments received.
              </div>
            ) : (
              activePOs.slice(0, 3).map((po) => (
                <div
                  key={po.id}
                  onClick={() => onNavigate('procurement')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-amber-300 dark:hover:border-amber-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                      {po.poNumber}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-medium">
                      {po.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-1">
                    {po.vendorName}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>ETA: {po.expectedDeliveryDate || 'Immediate'}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      ₹{(po.grandTotal / 100000).toFixed(2)}L
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Inwarding: {pos.filter((p) => p.status === 'Fully Received').length} Received</span>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Process GRN</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 3: Critical BOQ Shortages & Reorder Alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Material Deficits & Shortages
                </h4>
                <p className="text-[11px] text-slate-500">{lowStockItems.length} SKUs below reorder point</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
              Procure ASAP
            </span>
          </div>

          <div className="space-y-2">
            {lowStockItems.length === 0 && projectsWithShortages.length === 0 ? (
              <div className="text-center py-5 text-xs text-emerald-600 font-medium">
                100% stock healthy! No BOQ material deficits detected.
              </div>
            ) : (
              lowStockItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.sku}
                      </span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 font-bold shrink-0">
                        Deficit
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <div className="text-xs font-bold text-rose-600">
                      {item.availableStock} / {item.reorderLevel} {item.unit}
                    </div>
                    <div className="text-[10px] text-slate-400">Avail / Min</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">{projectsWithShortages.length} Projects with Shortages</span>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Review BOQs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderExecutiveWidgets = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Widget 1: Real-Time Security Audit Telemetry & System Health */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Security Alerts & Audit Stream
                </h4>
                <p className="text-[11px] text-slate-500">Tamper-evident system activity log</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
              Admin Telemetry
            </span>
          </div>

          <div className="space-y-2">
            {recentAuditEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                    {event.action.replace('_', ' ')} • {event.entityType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-1">
                  {event.summary}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>User: {event.userName}</span>
                  <span className="font-mono uppercase">{event.userRole}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Audit Engine Active</span>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Full Audit Log</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 2: Pending Executive Sign-offs & Critical Bottlenecks */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Executive Sign-offs & Approvals
                </h4>
                <p className="text-[11px] text-slate-500">High-value commercial authorizations</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
              Sign-off Queue
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  High-Value Requisitions (&gt;₹1.5L)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {highValuePRs.length} PRs requiring MD sign-off
                </div>
              </div>
              <button
                onClick={() => onNavigate('procurement')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Review PRs
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Overdue Client Invoices
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  ₹{(pendingReceivables / 100000).toFixed(1)}L pending collections
                </div>
              </div>
              <button
                onClick={() => onNavigate('payments')}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Invoices
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  User Accounts & Governance
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {activeUsersCount} Active • {deactivatedUsersCount} Deactivated
                </div>
              </div>
              <button
                onClick={() => onNavigate('users')}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Users & Roles
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Google Sheets: {sheetsConfig.syncStatus}</span>
          <button
            onClick={() => onNavigate('customization')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Admin Settings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 3: Enterprise Financial Vital Signs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Enterprise Profitability Pulse
                </h4>
                <p className="text-[11px] text-slate-500">Operating margins and liquidity</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              {ebitdaMargin}% Margin
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 block">Operating EBITDA</span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                ₹{(ebitda / 100000).toFixed(2)}L
              </span>
              <span className="text-[10px] text-slate-400">Net after COGS</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 block">Funds Collected</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5 block">
                ₹{(totalCollected / 100000).toFixed(1)}L
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Bank Remittances</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 block">Staff Headcount</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5 block">
                {activeStaffCount} Engineers
              </span>
              <span className="text-[10px] text-slate-400">Full Deployment</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] text-slate-500 block">Payroll / Mo</span>
              <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5 block">
                ₹{(latestPayrollAmount / 100000).toFixed(2)}L
              </span>
              <span className="text-[10px] text-slate-400">Statutory Net</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">TDS Pending: ₹{pendingTdsDeposit.toLocaleString()}</span>
          <button
            onClick={() => onNavigate('finance')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>General Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderEstimatorWidgets = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Widget 1: Quotations in Progress */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Quotation Preparation Queue
                </h4>
                <p className="text-[11px] text-slate-500">{draftOrSentQuotes.length} active techno-commercial quotes</p>
              </div>
            </div>
            <button
              onClick={onOpenNewQuote}
              className="p-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quote</span>
            </button>
          </div>

          <div className="space-y-2">
            {draftOrSentQuotes.slice(0, 3).map((q) => (
              <div
                key={q.id}
                onClick={() => onNavigate('quotes')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 cursor-pointer hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                    {q.quoteNumber}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                    {q.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-1">
                  {q.clientName}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Margin: {q.targetMarginPct.toFixed(1)}%</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    ₹{(q.totalAmount / 100000).toFixed(2)}L
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Pipeline: ₹{(totalQuotePipelineValue / 100000).toFixed(1)}L</span>
          <button
            onClick={() => onNavigate('quotes')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage Quotes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 2: Project BOQ Takeoffs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  BOQ Engineering & Takeoffs
                </h4>
                <p className="text-[11px] text-slate-500">Contracted BOQs and bill lines</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              BOQ Engine
            </span>
          </div>

          <div className="space-y-2">
            {projects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigate('projects')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 cursor-pointer hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {p.projectNumber}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                    {p.boqItems.length} Lines
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-1">
                  {p.projectName}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Margin: {p.targetMarginPct.toFixed(1)}%</span>
                  <span className="text-amber-600 font-semibold">
                    {p.totalShortageItemsCount > 0 ? `${p.totalShortageItemsCount} Shortages` : 'Stock OK'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">{projects.length} Total Projects</span>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>BOQ Editor</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 3: Cost Analysis & Rates */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Cost Centers & Rate Master
                </h4>
                <p className="text-[11px] text-slate-500">SKU pricing and margin thresholds</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              Master Rates
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Total Material SKUs</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{inventory.length} Items</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Min Target Margin</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">18.00%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Cost Variance Review</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">Live Budget Sync</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Cost Analytics</span>
          <button
            onClick={() => onNavigate('cost_analysis')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Cost Variance</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderWarehouseWidgets = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Widget 1: Critical Stock Reorder Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Reorder Threshold Alerts
                </h4>
                <p className="text-[11px] text-slate-500">{lowStockItems.length} SKUs below minimum</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
              Low Stock
            </span>
          </div>

          <div className="space-y-2">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-5 text-xs text-emerald-600 font-medium">
                All inventory bays at healthy stock levels!
              </div>
            ) : (
              lowStockItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {item.sku}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-rose-600">
                      {item.availableStock} {item.unit}
                    </div>
                    <div className="text-[10px] text-slate-400">Min: {item.reorderLevel}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">{inventory.length} Total SKUs</span>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Stock Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 2: Expected PO Deliveries for Inwarding */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Dock Inwarding & GRN Queue
                </h4>
                <p className="text-[11px] text-slate-500">{activePOs.length} incoming shipments</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              Goods Receipt
            </span>
          </div>

          <div className="space-y-2">
            {activePOs.slice(0, 3).map((po) => (
              <div
                key={po.id}
                onClick={() => onNavigate('inventory')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 cursor-pointer hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {po.poNumber}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                    {po.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-1">
                  Vendor: {po.vendorName}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>{po.items.length} line items</span>
                  <span>ETA: {po.expectedDeliveryDate || 'Prompt'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Inwarding Active</span>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Log Inward GRN</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 3: Inventory Valuation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Warehouse Stock Worth
                </h4>
                <p className="text-[11px] text-slate-500">Capital valuation and bay storage</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
              Valuation
            </span>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              ₹{(totalInventoryValue / 100000).toFixed(2)} Lakhs
            </div>
            <p className="text-xs text-slate-500 mt-1">Weighted average unit costing across storage bays</p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Healthy Stock SKUs:</span>
                <span className="font-bold text-emerald-600">
                  {inventory.length - lowStockItems.length} Items
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Low / Deficit SKUs:</span>
                <span className="font-bold text-rose-600">{lowStockItems.length} Items</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Bay Allocation Active</span>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Warehouse Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderFinanceWidgets = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Widget 1: Milestone Receivables */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Milestone Receivables Aging
                </h4>
                <p className="text-[11px] text-slate-500">Client billing and cash receipts</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
              Receivables
            </span>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-purple-700 dark:text-purple-400">
              ₹{(pendingReceivables / 100000).toFixed(2)} Lakhs
            </div>
            <div className="text-xs text-slate-500 mt-1">
              ₹{(totalCollected / 100000).toFixed(1)} Lakhs Collected to Date
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Paid Receipts:</span>
                <span className="font-bold text-emerald-600">
                  {payments.filter((p) => !p.isPayable && p.status === 'Paid').length} Invoices
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pending Remittances:</span>
                <span className="font-bold text-amber-600">
                  {payments.filter((p) => !p.isPayable && p.status !== 'Paid').length} Invoices
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">{payments.length} Total Billing Records</span>
          <button
            onClick={() => onNavigate('payments')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Invoices & Billing</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 2: Statutory TDS Compliance */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Statutory TDS & GST Watch
                </h4>
                <p className="text-[11px] text-slate-500">Due by 7th of next month</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
              Tax Compliance
            </span>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
              ₹{pendingTdsDeposit.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Section 194C & 194J Contractor Withholding Dues</p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">TDS Records:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{tdsRecords.length} Deductions</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Monthly Net Payroll:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  ₹{(latestPayrollAmount / 100000).toFixed(2)}L
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Challan 281 Filing</span>
          <button
            onClick={() => onNavigate('finance')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>TDS Register</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 3: Cash Flow & Vendor Outflow */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Cash Flow & Ledger Health
                </h4>
                <p className="text-[11px] text-slate-500">EBITDA & vendor payment commitments</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              General Ledger
            </span>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              ₹{(ebitda / 100000).toFixed(2)} Lakhs
            </div>
            <p className="text-xs text-slate-500 mt-1">Operating EBITDA Margin: {ebitdaMargin}%</p>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vendor PO Obligations:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  ₹{(pos.reduce((sum, p) => sum + p.grandTotal, 0) / 100000).toFixed(1)}L
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active GL Accounts:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{accounts.length || 12} Accounts</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Audited Books</span>
          <button
            onClick={() => onNavigate('finance')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Ledger Books</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTechnicianWidgets = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Widget 1: Active Field Project Sites */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Live Field Project Sites
                </h4>
                <p className="text-[11px] text-slate-500">{projects.length} sites in execution</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              Field Sites
            </span>
          </div>

          <div className="space-y-2">
            {projects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigate('projects')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 cursor-pointer hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {p.projectNumber}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-medium">
                    {p.progressPct}% Done
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-1">
                  {p.projectName}
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.progressPct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Site Milestones</span>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Project Sites</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 2: Pending Site Surveys */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Upcoming Site Surveys
                </h4>
                <p className="text-[11px] text-slate-500">Inspection & heat load measurement</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
              Site Inspection
            </span>
          </div>

          <div className="space-y-2">
            {leads
              .filter((l) => l.status === 'Site Survey Scheduled' || l.status === 'New')
              .slice(0, 3)
              .map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onNavigate('crm')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 cursor-pointer hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {lead.clientName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-medium">
                      {lead.buildingType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-1">
                    {lead.projectAddress || lead.city} • {lead.hvacType}
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium mt-1">
                    Est. {lead.estimatedCapacityTR} TR Capacity
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Survey Readiness</span>
          <button
            onClick={() => onNavigate('crm')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Survey Leads</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget 3: Site Shortages & Requisitions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  On-Site Shortages & PRs
                </h4>
                <p className="text-[11px] text-slate-500">Site requisitions and installation tickets</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
              Site Requisition
            </span>
          </div>

          <div className="space-y-2">
            {projectsWithShortages.length === 0 ? (
              <div className="text-center py-5 text-xs text-emerald-600 font-medium">
                No site shortages reported! All installation materials available.
              </div>
            ) : (
              projectsWithShortages.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('projects')}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 cursor-pointer hover:border-amber-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {p.projectNumber}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                      {p.totalShortageItemsCount} Shortages
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 truncate mt-1">
                    {p.projectName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Work Orders Active</span>
          <button
            onClick={() => onNavigate('workorders')}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Work Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 transition-all">
      {/* Top Header: Role Identification, User Welcome & Persona Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative">
            <img
              src={loggedInUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={loggedInUser.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {loggedInUser.name}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentPreset.badgeBg}`}>
                {currentPreset.label}
              </span>
              {isSimulated && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">
                  Simulating Persona View
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personalized Command Deck: <strong className="text-slate-700 dark:text-slate-300">{currentRoleMeta.description.split('.')[0]}.</strong>
            </p>
          </div>
        </div>

        {/* Persona Simulator & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Persona Switcher Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto max-w-full">
            {ROLE_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = activePersonaRole === preset.role;
              return (
                <button
                  key={preset.role}
                  onClick={() => setActivePersonaRole(preset.role)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }`}
                  title={`Preview Dashboard as ${preset.label}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{preset.shortLabel}</span>
                  {isSelected && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* If simulating a different role, offer one-click global session switch */}
          {isSimulated && (
            <button
              onClick={() => handleApplyRoleGlobally(activePersonaRole)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Switch active user session to this role permanently"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Set as Active Role</span>
            </button>
          )}

          {/* Collapse/Expand button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Role Deck' : 'Collapse Role Deck'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Role Deck Body (Collapsible) */}
      {!isCollapsed && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {activePersonaRole === 'sales_manager' && renderSalesManagerWidgets()}
          {activePersonaRole === 'procurement' && renderProcurementWidgets()}
          {activePersonaRole === 'executive' && renderExecutiveWidgets()}
          {activePersonaRole === 'estimator' && renderEstimatorWidgets()}
          {activePersonaRole === 'warehouse' && renderWarehouseWidgets()}
          {activePersonaRole === 'finance' && renderFinanceWidgets()}
          {activePersonaRole === 'technician' && renderTechnicianWidgets()}
        </div>
      )}
    </div>
  );
};
