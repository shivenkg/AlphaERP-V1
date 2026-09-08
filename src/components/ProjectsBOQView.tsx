import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Layers,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  Plus,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Search,
  ChevronRight,
  Building,
  Calendar,
  DollarSign,
  FileSpreadsheet,
  Zap,
  Info,
  Printer,
  Receipt,
  ToggleLeft,
  ToggleRight,
  RotateCcw,
  CheckCheck,
  Filter,
  Eye,
  Check,
  Clock,
  Edit3,
  Save,
  MessageSquare,
  FileText,
  Download,
  Share2,
  Flame,
  Users,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Project, BOQItem, InventoryItem, PurchaseRequisition, ProjectPriority, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { ProjectCompletionBillModal } from './ProjectCompletionBillModal';
import { ProjectMarginExpenseSparkline } from './ProjectMarginExpenseSparkline';
import { ProjectSummaryPdfModal } from './ProjectSummaryPdfModal';
import { ProjectActivityFeed } from './ProjectActivityFeed';
import { useToastNotification } from '../context/ToastNotificationContext';
import { MultiSelectFilterDropdown, MultiSelectOption } from './common';
import { exportTableToCSV } from '../utils/tableExportHelper';

export type ProjectVisibilityFilter = 'active' | 'completed' | 'all';

interface ProjectsBOQViewProps {
  projects: Project[];
  inventory: InventoryItem[];
  currentUser?: UserProfile;
  onNavigateToProcurement: () => void;
  onNavigateToCostAnalysis?: () => void;
  onOpenSheetsModal: () => void;
}

export const ProjectsBOQView: React.FC<ProjectsBOQViewProps> = ({
  projects,
  inventory,
  currentUser,
  onNavigateToProcurement,
  onNavigateToCostAnalysis,
  onOpenSheetsModal
}) => {
  const { addToast, alertReorderStock } = useToastNotification();
  const [visibilityFilter, setVisibilityFilter] = useState<ProjectVisibilityFilter>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [projectDetailTab, setProjectDetailTab] = useState<'boq' | 'activity'>('boq');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [personalViewOnly, setPersonalViewOnly] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [boqCategoryFilter, setBoqCategoryFilter] = useState('ALL');
  const [selectedBoqItemIds, setSelectedBoqItemIds] = useState<string[]>([]);
  const [isCrossChecking, setIsCrossChecking] = useState(false);
  const [createdPrModal, setCreatedPrModal] = useState<PurchaseRequisition | null>(null);
  const [selectedProjectForBillModal, setSelectedProjectForBillModal] = useState<Project | null>(null);
  const [selectedProjectForPdfModal, setSelectedProjectForPdfModal] = useState<Project | null>(null);
  const [isEditingDelay, setIsEditingDelay] = useState(false);
  const [delayForm, setDelayForm] = useState<{
    isDelayed: boolean;
    delayDays: number;
    delayCategory: string;
    delayReason: string;
    delayMitigationPlan: string;
  }>({
    isDelayed: false,
    delayDays: 0,
    delayCategory: 'Site Access Obstruction',
    delayReason: '',
    delayMitigationPlan: ''
  });

  const activeUser = currentUser || storageService.getCurrentUser();

  const personalProjectsCount = useMemo(() => {
    const userName = (activeUser?.name || '').toLowerCase();
    const userId = (activeUser?.id || '').toLowerCase();
    return (projects || []).filter((p) => {
      const pm = (p.projectManager || '').toLowerCase();
      return Boolean(
        (userName && (pm.includes(userName) || userName.includes(pm))) ||
        (userId && pm.includes(userId))
      );
    }).length;
  }, [projects, activeUser]);

  // Priority options with dynamic counts
  const priorityOptions: MultiSelectOption[] = useMemo(() => {
    const list: Array<{ value: ProjectPriority; label: string; badgeColor: string }> = [
      { value: 'Critical', label: 'Critical', badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
      { value: 'High', label: 'High Priority', badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
      { value: 'Medium', label: 'Medium Priority', badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
      { value: 'Low', label: 'Low Priority', badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' }
    ];

    return list.map((item) => {
      const count = (projects || []).filter((p) => (p.priority || 'Medium') === item.value).length;
      return {
        value: item.value,
        label: item.label,
        badgeColor: item.badgeColor,
        count
      };
    });
  }, [projects]);

  // Manager options with dynamic counts
  const managerOptions: MultiSelectOption[] = useMemo(() => {
    const mgrMap = new Map<string, number>();
    (projects || []).forEach((p) => {
      if (p.projectManager) {
        const cleanMgr = p.projectManager.split('(')[0].trim();
        mgrMap.set(cleanMgr, (mgrMap.get(cleanMgr) || 0) + 1);
      }
    });

    return Array.from(mgrMap.entries()).map(([mgr, count]) => ({
      value: mgr,
      label: mgr,
      count
    }));
  }, [projects]);

  // Helper to check if a project is completed
  const isProjectCompleted = (p: Project) => p.status === 'Handover & Closed' || (p.progressPct ?? 0) >= 100;

  // Active vs Completed calculations
  const activeProjects = useMemo(() => (projects || []).filter((p) => !isProjectCompleted(p)), [projects]);
  const completedProjects = useMemo(() => (projects || []).filter((p) => isProjectCompleted(p)), [projects]);

  // Filtered projects according to visibility toggle AND multi-select priorities/managers
  const displayedProjects = useMemo(() => {
    let baseList = projects || [];
    if (visibilityFilter === 'active') baseList = activeProjects;
    if (visibilityFilter === 'completed') baseList = completedProjects;

    return baseList.filter((p) => {
      const projPriority = p.priority || 'Medium';
      const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(projPriority);
      const matchesManager = selectedManagers.length === 0 || selectedManagers.some((m) => (p.projectManager || '').includes(m));

      let matchesPersonal = true;
      if (personalViewOnly) {
        const userName = (activeUser?.name || '').toLowerCase();
        const userId = (activeUser?.id || '').toLowerCase();
        const pm = (p.projectManager || '').toLowerCase();
        matchesPersonal = Boolean(
          (userName && (pm.includes(userName) || userName.includes(pm))) ||
          (userId && pm.includes(userId))
        );
      }

      return matchesPriority && matchesManager && matchesPersonal;
    });
  }, [projects, visibilityFilter, activeProjects, completedProjects, selectedPriorities, selectedManagers, personalViewOnly, activeUser]);

  const hasProjectFilters = selectedPriorities.length > 0 || selectedManagers.length > 0 || personalViewOnly;

  const resetProjectFilters = () => {
    setSelectedPriorities([]);
    setSelectedManagers([]);
    setPersonalViewOnly(false);
  };

  const handleExportFilteredProjects = () => {
    const today = new Date().toISOString().split('T')[0];
    const filename = `HVAC_Projects_Ledger_${personalViewOnly ? 'Personal_' : ''}${today}.csv`;
    const headers = [
      'Project #',
      'Project Name',
      'Client',
      'Contract Value (INR)',
      'Total Estimated Cost (INR)',
      'Target Margin %',
      'Progress %',
      'Project Manager',
      'Status',
      'Priority',
      'Start Date',
      'Target Completion',
      'Schedule Health',
      'Delay Days',
      'Delay Category',
      'Delay Reason',
      'Shortage Items Count',
      'Total BOQ Items'
    ];
    const rows = displayedProjects.map((p) => [
      p.projectNumber || '',
      p.projectName || '',
      p.clientName || '',
      p.contractValue || 0,
      p.totalEstimatedCost || 0,
      p.targetMarginPct || 0,
      p.progressPct || 0,
      p.projectManager || '',
      p.status || '',
      p.priority || 'Medium',
      p.startDate || '',
      p.targetCompletionDate || '',
      p.isDelayed ? 'DELAYED' : 'ON SCHEDULE',
      p.delayDays || 0,
      p.delayCategory || '',
      p.delayReason || '',
      p.totalShortageItemsCount || 0,
      (p.boqItems || []).length
    ]);
    exportTableToCSV(filename, headers, rows);
  };

  const currentProject = displayedProjects.find((p) => p.id === selectedProjectId) || displayedProjects[0] || (projects || [])[0];

  React.useEffect(() => {
    if (currentProject) {
      setDelayForm({
        isDelayed: currentProject.isDelayed || false,
        delayDays: currentProject.delayDays || 0,
        delayCategory: currentProject.delayCategory || 'Site Access Obstruction',
        delayReason: currentProject.delayReason || '',
        delayMitigationPlan: currentProject.delayMitigationPlan || ''
      });
      setIsEditingDelay(false);
    }
  }, [currentProject?.id]);

  const handleSaveDelay = () => {
    if (!currentProject) return;
    storageService.updateProjectDelay(currentProject.id, {
      isDelayed: delayForm.isDelayed,
      delayDays: delayForm.delayDays,
      delayCategory: delayForm.delayCategory,
      delayReason: delayForm.delayReason,
      delayMitigationPlan: delayForm.delayMitigationPlan
    });
    setIsEditingDelay(false);
  };

  // Quick-toggle status of a project between Active and Completed
  const handleToggleProjectStatus = (e: React.MouseEvent, proj: Project) => {
    e.stopPropagation();
    const completed = isProjectCompleted(proj);
    if (completed) {
      storageService.updateProject(proj.id, {
        status: 'Installation',
        progressPct: 75,
        actualCompletionDate: undefined
      });
      storageService.logAudit(
        'UPDATE',
        'PROJECT',
        proj.projectNumber,
        `Re-opened project ${proj.projectNumber} (${proj.projectName}) to Active status (Installation phase)`
      );
    } else {
      storageService.updateProject(proj.id, {
        status: 'Handover & Closed',
        progressPct: 100,
        actualCompletionDate: new Date().toISOString().split('T')[0]
      });
      storageService.logAudit(
        'UPDATE',
        'PROJECT',
        proj.projectNumber,
        `Marked project ${proj.projectNumber} (${proj.projectName}) as Completed & Handover Closed`
      );
    }
  };

  const term = (search || '').trim().toLowerCase();
  // Filter BOQ Items
  const filteredBoqItems = currentProject
    ? currentProject.boqItems.filter((item) => {
        const matchesCategory = boqCategoryFilter === 'ALL' || item.category === boqCategoryFilter;
        const matchesSearch =
          !term ||
          (item.description || '').toLowerCase().includes(term) ||
          (item.sku || '').toLowerCase().includes(term);
        return matchesCategory && matchesSearch;
      })
    : [];

  const handleExportProjectBOQ = () => {
    if (!currentProject) return;
    const today = new Date().toISOString().split('T')[0];
    const filename = `BOQ_${currentProject.projectNumber}_${today}.csv`;
    const headers = [
      'SKU',
      'Description',
      'Category',
      'Required Qty',
      'Unit',
      'In Stock Qty',
      'Shortage Qty',
      'Unit Cost (INR)',
      'Total Cost (INR)',
      'Fulfillment Status',
      'Linked PR #',
      'Linked PO #'
    ];
    const rows = filteredBoqItems.map((b) => [
      b.sku || '',
      b.description || '',
      b.category || '',
      b.requiredQty || 0,
      b.unit || '',
      b.inStockQty || 0,
      b.shortageQty || 0,
      b.unitCost || 0,
      b.totalCost || 0,
      b.status || '',
      b.prNumber || '',
      b.poNumber || ''
    ]);
    exportTableToCSV(filename, headers, rows);
  };

  const shortageItems = currentProject
    ? currentProject.boqItems.filter((item) => item.shortageQty > 0 && item.status === 'Shortage - PR Needed')
    : [];

  // Helper to generate PR for single or selected items
  const handleGeneratePRForItems = (itemIds?: string[]) => {
    if (!currentProject) return;
    try {
      const itemsToPR = itemIds || (selectedBoqItemIds.length > 0 ? selectedBoqItemIds : undefined);
      const newPR = storageService.generatePRFromProjectShortages(currentProject.id, itemsToPR);
      setSelectedBoqItemIds([]);
      setCreatedPrModal(newPR);
      addToast({
        type: 'success',
        title: '⚡ Purchase Requisition Generated',
        message: `PR ${newPR.prNumber} generated with ${newPR.items.length} item(s) totaling ₹${newPR.totalEstimatedAmount.toLocaleString('en-IN')}`,
        projectId: currentProject.id
      });
    } catch (e: any) {
      alert(e.message || 'Failed to generate PR');
    }
  };

  // 1-Click Inventory Re-check & Real-time Reorder Level Breach Toast Trigger
  const handleCrossCheckInventory = () => {
    setIsCrossChecking(true);
    setTimeout(() => {
      if (!currentProject) {
        setIsCrossChecking(false);
        return;
      }

      let shortageCount = 0;
      let reorderBreachCount = 0;
      const breachedItems: { item: InventoryItem; boq: BOQItem }[] = [];

      const updatedBOQ: BOQItem[] = currentProject.boqItems.map((boq) => {
        const matchedInv = inventory.find((inv) => inv.sku === boq.sku);
        const inStock = matchedInv ? Math.max(0, matchedInv.availableStock) : 0;
        const shortage = Math.max(0, boq.requiredQty - inStock);

        if (shortage > 0 && boq.status !== 'PR Generated' && boq.status !== 'PO Issued' && boq.status !== 'Inwarded / Available') {
          shortageCount++;
        }

        if (matchedInv) {
          const isAtOrBelowReorder = matchedInv.availableStock <= matchedInv.reorderLevel;
          const isDeficitCausingReorder = (matchedInv.availableStock - boq.requiredQty) < matchedInv.reorderLevel;
          if (isAtOrBelowReorder || isDeficitCausingReorder || shortage > 0) {
            reorderBreachCount++;
            breachedItems.push({ item: matchedInv, boq });
          }
        }

        let newStatus = boq.status;
        if (boq.status === 'Shortage - PR Needed' && shortage === 0) {
          newStatus = 'In Stock';
        } else if (boq.status === 'In Stock' && shortage > 0) {
          newStatus = 'Shortage - PR Needed';
        }

        return {
          ...boq,
          inStockQty: inStock,
          shortageQty: shortage,
          status: newStatus
        };
      });

      storageService.updateProject(currentProject.id, {
        boqItems: updatedBOQ,
        totalShortageItemsCount: shortageCount
      });

      storageService.logAudit(
        'UPDATE',
        'BOQ',
        currentProject.projectNumber,
        `Re-executed real-time inventory cross-check for project BOQ (${shortageCount} shortages, ${reorderBreachCount} reorder breaches identified)`
      );

      // Trigger real-time individual toast alerts for breached items (capped to top 3 to avoid flooding, plus summary)
      breachedItems.slice(0, 3).forEach(({ item, boq }) => {
        alertReorderStock(item, boq, currentProject, () => handleGeneratePRForItems([boq.id]));
      });

      if (breachedItems.length === 0) {
        addToast({
          type: 'success',
          title: '✅ BOQ Stock Verification Passed',
          message: `All ${currentProject.boqItems.length} items for ${currentProject.projectNumber} are well stocked above defined reorder thresholds.`,
          projectId: currentProject.id
        });
      } else {
        addToast({
          type: 'warning',
          title: `⚠️ ${reorderBreachCount} Reorder Level Breaches in ${currentProject.projectNumber}`,
          message: `Inventory cross-check detected ${shortageCount} critical shortage(s) and ${reorderBreachCount} item(s) at or below reorder level.`,
          projectId: currentProject.id,
          actions: [
            {
              label: '⚡ Generate PR for All',
              onClick: () => handleGeneratePRForItems(),
              variant: 'danger'
            }
          ]
        });
      }

      setIsCrossChecking(false);
    }, 450);
  };

  // 1-Click Generate PR for Shortage items
  const handleGeneratePR = () => {
    handleGeneratePRForItems();
  };

  const handleSelectAllShortages = () => {
    if (selectedBoqItemIds.length === shortageItems.length) {
      setSelectedBoqItemIds([]);
    } else {
      setSelectedBoqItemIds(shortageItems.map((i) => i.id));
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">HVAC Projects & BOQ Inventory Engine</h2>
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {activeProjects.length} Active
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {completedProjects.length} Completed
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generated Bill of Quantities (BOQ), warehouse stock cross-checks, deficit PR generation, and project lifecycle management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Visibility Switcher in Top Action Header */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-medium text-slate-600 border border-slate-200 shadow-2xs">
            <button
              onClick={() => setVisibilityFilter('active')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                visibilityFilter === 'active'
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
              title="Show only active projects in progress"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Active</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                visibilityFilter === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {activeProjects.length}
              </span>
            </button>

            <button
              onClick={() => setVisibilityFilter('completed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                visibilityFilter === 'completed'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
              title="Show only completed & closed projects"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Completed</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                visibilityFilter === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {completedProjects.length}
              </span>
            </button>

            <button
              onClick={() => setVisibilityFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                visibilityFilter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
              title="Show all projects"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>All</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                visibilityFilter === 'all' ? 'bg-slate-200 text-slate-900 font-bold' : 'bg-slate-200 text-slate-600'
              }`}>
                {projects.length}
              </span>
            </button>
          </div>

          {onNavigateToCostAnalysis && (
            <button
              onClick={onNavigateToCostAnalysis}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              title="View Project Cost Variance & PO Actuals Matrix"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Cost Variance</span>
            </button>
          )}

          {/* Personal View Toggle */}
          <button
            onClick={() => setPersonalViewOnly(!personalViewOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              personalViewOnly
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs ring-2 ring-indigo-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Personal View: Show only projects managed by you"
          >
            <UserCheck className={`w-3.5 h-3.5 ${personalViewOnly ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Personal View</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                personalViewOnly ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {personalProjectsCount}
            </span>
          </button>

          {/* Export Projects CSV / Excel */}
          <button
            onClick={handleExportFilteredProjects}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-400 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            title="Export currently filtered projects list to CSV / Excel spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV/Excel</span>
          </button>

          <button
            onClick={onOpenSheetsModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Sync BOQ</span>
          </button>
          <button
            onClick={onNavigateToProcurement}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>PR & PO</span>
          </button>
        </div>
      </div>

      {/* Projects Ribbon Control Bar with Multi-Select Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {visibilityFilter === 'active'
              ? 'Active Projects in Execution'
              : visibilityFilter === 'completed'
              ? 'Completed & Handed-Over Projects'
              : 'All HVAC Projects'}
          </span>
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {displayedProjects.length} of {projects.length}
          </span>
        </div>

        {/* Filter Bar with Priority & Manager Multi-Select */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Multi-Select Priority Filter */}
          <MultiSelectFilterDropdown
            id="projects-priority-multiselect-filter"
            label="Priority"
            options={priorityOptions}
            selectedValues={selectedPriorities}
            onChange={setSelectedPriorities}
            placeholder="All Priorities"
            icon={Flame}
          />

          {/* Multi-Select Manager Filter */}
          {managerOptions.length > 0 && (
            <MultiSelectFilterDropdown
              id="projects-manager-multiselect-filter"
              label="Manager"
              options={managerOptions}
              selectedValues={selectedManagers}
              onChange={setSelectedManagers}
              placeholder="All PMs"
              icon={Users}
            />
          )}

          {/* Reset Filters button if any active */}
          {hasProjectFilters && (
            <button
              type="button"
              onClick={resetProjectFilters}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}

          {/* 1-Click Fast Toggle Quick-Button */}
          <button
            onClick={() =>
              setVisibilityFilter((prev) => (prev === 'active' ? 'completed' : 'active'))
            }
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
            title={`Toggle between Active (${activeProjects.length}) and Completed (${completedProjects.length}) projects`}
          >
            {visibilityFilter === 'active' ? (
              <>
                <ToggleLeft className="w-4 h-4 text-blue-600" />
                <span>Showing: <strong className="text-blue-700 dark:text-blue-400">Active</strong> → Switch to Completed</span>
              </>
            ) : visibilityFilter === 'completed' ? (
              <>
                <ToggleRight className="w-4 h-4 text-emerald-600" />
                <span>Showing: <strong className="text-emerald-700 dark:text-emerald-400">Completed</strong> → Switch to Active</span>
              </>
            ) : (
              <>
                <Filter className="w-4 h-4 text-slate-600" />
                <span>Filter: <strong className="text-slate-900 dark:text-slate-100">All</strong> → Switch to Active</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Empty State if Filter yields 0 Projects */}
      {displayedProjects.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
            {visibilityFilter === 'completed' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <Briefcase className="w-6 h-6 text-blue-500" />
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {visibilityFilter === 'completed'
              ? 'No Completed Projects Found'
              : 'No Active Projects Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {visibilityFilter === 'completed'
              ? 'All current projects are actively in progress. You can mark any active project as completed using the status button on its card.'
              : 'All projects are currently closed or marked completed.'}
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => setVisibilityFilter('all')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
            >
              View All Projects ({projects.length})
            </button>
            <button
              onClick={() => setVisibilityFilter('active')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
            >
              View Active Projects ({activeProjects.length})
            </button>
          </div>
        </div>
      ) : (
        /* Projects Selector Ribbon Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {displayedProjects.map((proj) => {
            const isSelected = proj.id === (currentProject ? currentProject.id : selectedProjectId);
            const isCompleted = isProjectCompleted(proj);

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-xs relative group ${
                  isSelected
                    ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500/30 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-blue-600">{proj.projectNumber}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {proj.status}
                      </span>
                      {proj.priority && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                            proj.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : proj.priority === 'High'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : proj.priority === 'Low'
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}
                        >
                          {proj.priority}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1.5 line-clamp-1">{proj.projectName}</h3>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{proj.clientName}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-emerald-600">
                      ₹{(proj.contractValue / 100000).toFixed(1)} L
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {proj.boqItems.length} BOQ Lines
                    </div>
                  </div>
                </div>

                {/* Progress & Shortage Alert */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${proj.progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{proj.progressPct}% Done</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Quick PDF Export for Card */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjectForPdfModal(proj);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all border border-blue-200"
                      title="Export Client Project Summary PDF"
                    >
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span>PDF</span>
                    </button>

                    {/* Status Toggle Quick Button on Card */}
                    <button
                      onClick={(e) => handleToggleProjectStatus(e, proj)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                        isCompleted
                          ? 'bg-emerald-100 hover:bg-amber-100 text-emerald-800 hover:text-amber-800'
                          : 'bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800'
                      }`}
                      title={isCompleted ? 'Click to Re-open Project' : 'Click to Mark Project as Completed'}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                          <span>Completed (Re-open)</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3 text-slate-500 group-hover:text-emerald-600" />
                          <span>Mark Complete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Delay Tag if Project is Delayed */}
                {proj.isDelayed && (
                  <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[11px] flex items-center justify-between gap-1.5 font-medium">
                    <div className="flex items-center gap-1 font-bold text-red-700 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{proj.delayDays || 0}d Overdue</span>
                    </div>
                    <span className="truncate text-slate-700 font-normal italic">
                      "{proj.delayReason || 'Reason pending'}"
                    </span>
                  </div>
                )}

                {/* Integrated Profit Margin vs Actual Expenses Mini Chart / Sparkline */}
                <ProjectMarginExpenseSparkline
                  project={proj}
                  compact={true}
                  defaultMode="bar"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Project BOQ Detailed View */}
      {currentProject && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
          {/* Project Details Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-blue-600">{currentProject.projectNumber}</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    isProjectCompleted(currentProject)
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {currentProject.status}
                </span>
                <h3 className="text-base font-bold text-slate-900">{currentProject.projectName}</h3>
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1 font-medium">
                <span>Client: <strong className="text-slate-800">{currentProject.clientName}</strong></span>
                <span>•</span>
                <span>Project Manager: <strong className="text-slate-800">{currentProject.projectManager}</strong></span>
                <span>•</span>
                <span>Site: {currentProject.siteAddress}</span>
                <span>•</span>
                <span>Target Handover: {currentProject.targetCompletionDate}</span>
                {currentProject.actualCompletionDate && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">Completed On: {currentProject.actualCompletionDate}</span>
                  </>
                )}
              </div>
            </div>

            {/* Cross-Check & Action Bar with Quick Status Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Quick Status Toggle in Details Banner */}
              <button
                onClick={(e) => handleToggleProjectStatus(e, currentProject)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors shadow-2xs ${
                  isProjectCompleted(currentProject)
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
                title={
                  isProjectCompleted(currentProject)
                    ? 'Reactivate this project back to Active execution status'
                    : 'Mark project as 100% completed and handover closed'
                }
              >
                {isProjectCompleted(currentProject) ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Re-open to Active</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mark Handover Complete</span>
                  </>
                )}
              </button>

              {/* Export Client PDF Summary Button */}
              <button
                onClick={() => setSelectedProjectForPdfModal(currentProject)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 transition-colors shadow-2xs"
                title="Generate and export high-fidelity PDF Project Executive Summary & BOQ Scope for client sharing"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Export Client PDF</span>
              </button>

              {/* Export BOQ to CSV/Excel */}
              <button
                onClick={handleExportProjectBOQ}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-emerald-400 transition-colors shadow-2xs cursor-pointer"
                title="Export this project's BOQ items table to CSV / Excel spreadsheet"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export BOQ</span>
              </button>

              <button
                onClick={() => setSelectedProjectForBillModal(currentProject)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors shadow-xs"
                title="Print or generate PDF for the Project Completion Bill & Handover Tax Invoice"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Completion Bill</span>
              </button>

              <button
                onClick={handleCrossCheckInventory}
                disabled={isCrossChecking}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                title="Cross-check required quantities against live warehouse inventory ledger"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isCrossChecking ? 'animate-spin' : ''}`} />
                <span>Cross-Check Inventory</span>
              </button>

              {shortageItems.length > 0 && (
                <button
                  onClick={handleGeneratePR}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all animate-pulse"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    Generate PR for {selectedBoqItemIds.length > 0 ? `${selectedBoqItemIds.length} Selected` : `${shortageItems.length} Shortages`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Expanded Project Profit Margin vs Actual Expenses Analytics Box */}
          <ProjectMarginExpenseSparkline
            project={currentProject}
            compact={false}
            defaultMode="bar"
          />

          {/* Project Delay Tracking & Daily WhatsApp KPI Status Card */}
          <div
            className={`rounded-2xl p-4 border text-xs transition-all ${
              currentProject.isDelayed
                ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                : 'bg-slate-50/70 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/60">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    currentProject.isDelayed
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {currentProject.isDelayed ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      Project Schedule & WhatsApp KPI Telemetry:
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        currentProject.isDelayed
                          ? 'bg-rose-600 text-white'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {currentProject.isDelayed
                        ? `${currentProject.delayDays || 0} Days Delayed`
                        : 'On Schedule'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium hidden md:inline">
                      • Synchronized with Previous Day WhatsApp KPI Digest
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {currentProject.isDelayed
                      ? `Root Cause: ${currentProject.delayReason || 'Reason pending documentation'}`
                      : 'Project is progressing within the allocated baseline milestone window.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingDelay(!isEditingDelay)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isEditingDelay ? 'Cancel' : 'Update Delay Reason'}</span>
                </button>
              </div>
            </div>

            {/* Delay Edit Form Drawer */}
            {isEditingDelay ? (
              <div className="mt-3 pt-2 grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Delay Status
                  </label>
                  <select
                    value={delayForm.isDelayed ? 'Delayed' : 'On Track'}
                    onChange={(e) =>
                      setDelayForm({
                        ...delayForm,
                        isDelayed: e.target.value === 'Delayed'
                      })
                    }
                    className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="On Track">On Track (No Delay)</option>
                    <option value="Delayed">Delayed / Blocked</option>
                  </select>
                </div>

                {delayForm.isDelayed && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Days Overdue
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={delayForm.delayDays}
                        onChange={(e) =>
                          setDelayForm({
                            ...delayForm,
                            delayDays: Number(e.target.value) || 0
                          })
                        }
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Delay Category
                      </label>
                      <select
                        value={delayForm.delayCategory}
                        onChange={(e) =>
                          setDelayForm({
                            ...delayForm,
                            delayCategory: e.target.value
                          })
                        }
                        className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Client Civil Delay">Client Civil Delay</option>
                        <option value="Site Access Obstruction">Site Access Obstruction</option>
                        <option value="Material Supply Lead Time">Material Supply Lead Time</option>
                        <option value="Payment Milestone Dispute">Payment Milestone Dispute</option>
                        <option value="Design Revision / Approval">Design Revision / Approval</option>
                        <option value="Manpower Shortage">Manpower Shortage</option>
                        <option value="Statutory Approvals (Fire/Pollution)">Statutory Approvals</option>
                      </select>
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Root Cause Delay Reason (Sent in WhatsApp Digest)
                      </label>
                      <input
                        type="text"
                        value={delayForm.delayReason}
                        placeholder="e.g., Client civil work delayed by 14 days"
                        onChange={(e) =>
                          setDelayForm({
                            ...delayForm,
                            delayReason: e.target.value
                          })
                        }
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-12">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Mitigation & Recovery Plan
                      </label>
                      <input
                        type="text"
                        value={delayForm.delayMitigationPlan}
                        placeholder="e.g., Expedite ducting teams in overtime shift"
                        onChange={(e) =>
                          setDelayForm({
                            ...delayForm,
                            delayMitigationPlan: e.target.value
                          })
                        }
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-12 flex justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setIsEditingDelay(false)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDelay}
                    className="px-4 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save & Update WhatsApp Snapshot
                  </button>
                </div>
              </div>
            ) : (
              currentProject.isDelayed && (
                <div className="mt-2.5 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-xl border border-rose-100">
                  <div>
                    <strong className="text-rose-800">Category:</strong> {currentProject.delayCategory || 'Client Civil Delay'}
                  </div>
                  <div>
                    <strong className="text-rose-800">Overdue:</strong> {currentProject.delayDays || 0} Days Behind Baseline
                  </div>
                  <div>
                    <strong className="text-emerald-800">Mitigation:</strong> {currentProject.delayMitigationPlan || 'Fast-track site work'}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Project Details Navigation Sub-Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProjectDetailTab('boq')}
                className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  projectDetailTab === 'boq'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Boxes className="w-4 h-4" />
                <span>BOQ Scope & Shortages</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-mono font-semibold">
                  {currentProject.boqItems.length} Items
                </span>
              </button>

              <button
                type="button"
                onClick={() => setProjectDetailTab('activity')}
                className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  projectDetailTab === 'activity'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Project Activity Feed & Audit Trail</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  Live Feed
                </span>
              </button>
            </div>
          </div>

          {projectDetailTab === 'activity' ? (
            /* Dedicated Project Activity Feed Tracking Status, Approvals, and Dispatches */
            <ProjectActivityFeed
              project={currentProject}
              onNavigateToProcurement={onNavigateToProcurement}
            />
          ) : (
            <>
              {/* Shortage Summary Alert if any */}
              {shortageItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900">
                        Deficit Alert: {shortageItems.length} BOQ items have insufficient stock in warehouse.
                      </span>
                      <p className="text-[11px] text-amber-800/90 mt-0.5">
                        Click "Generate PR" above to automatically create formal Purchase Requisitions for procurement.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSelectAllShortages}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[11px] whitespace-nowrap shadow-xs cursor-pointer"
                  >
                    {selectedBoqItemIds.length === shortageItems.length ? 'Deselect All' : 'Select All Shortages'}
                  </button>
                </div>
              )}

              {/* Filter & Search Ribbon for BOQ */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search BOQ SKU, description..."
                    className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs placeholder-slate-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <span>Category:</span>
                  <select
                    value={boqCategoryFilter}
                    onChange={(e) => setBoqCategoryFilter(e.target.value)}
                    className="bg-slate-50 text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="VRF / AC Units">VRF / AC Units</option>
                    <option value="Chillers & AHU">Chillers & AHU</option>
                    <option value="Ducting & Sheets">Ducting & Sheets</option>
                    <option value="Insulation Material">Insulation Material</option>
                    <option value="Copper Pipes & Fittings">Copper Pipes & Fittings</option>
                    <option value="BMS & Thermostats">BMS & Thermostats</option>
                  </select>
                </div>
              </div>

              {/* BOQ Items Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                      <th className="py-2.5 px-3 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={shortageItems.length > 0 && selectedBoqItemIds.length === shortageItems.length}
                          onChange={handleSelectAllShortages}
                          disabled={shortageItems.length === 0}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="py-2.5 px-3">SKU & Category</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-right">Req. Qty</th>
                      <th className="py-2.5 px-3 text-right">In-Stock</th>
                      <th className="py-2.5 px-3 text-right">Shortage</th>
                      <th className="py-2.5 px-3 text-right">Est. Unit Cost</th>
                      <th className="py-2.5 px-3 text-right">Total Cost</th>
                      <th className="py-2.5 px-3 text-center">Inventory Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBoqItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          No BOQ line items match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredBoqItems.map((item) => {
                        const isShortage = item.shortageQty > 0;
                        const isChecked = selectedBoqItemIds.includes(item.id);

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isChecked ? 'bg-blue-50/40' : isShortage ? 'bg-amber-50/20' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center">
                              {isShortage && item.status === 'Shortage - PR Needed' ? (
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBoqItemIds([...selectedBoqItemIds, item.id]);
                                    } else {
                                      setSelectedBoqItemIds(selectedBoqItemIds.filter((id) => id !== item.id));
                                    }
                                  }}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                              ) : (
                                <span className="text-slate-300">•</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="font-mono font-bold text-slate-800">{item.sku}</div>
                              <span className="text-[10px] text-slate-500">{item.category}</span>
                            </td>

                            <td className="py-2.5 px-3 text-slate-800 font-medium max-w-xs">
                              {item.description}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {item.requiredQty} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                              {item.inStockQty} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono">
                              {item.shortageQty > 0 ? (
                                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                                  -{item.shortageQty} {item.unit}
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-bold">0</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                              ₹{item.unitCost.toLocaleString()}
                            </td>

                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              ₹{item.totalCost.toLocaleString()}
                            </td>

                            <td className="py-2.5 px-3 text-center">
                              {item.status === 'In Stock' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" /> In Stock
                                </span>
                              )}
                              {item.status === 'Shortage - PR Needed' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                                  <AlertTriangle className="w-3 h-3" /> Deficit (PR Req.)
                                </span>
                              )}
                              {item.status === 'PR Generated' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  PR Created ({item.prNumber})
                                </span>
                              )}
                              {item.status === 'PO Issued' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                  PO Issued ({item.poNumber})
                                </span>
                              )}
                              {item.status === 'Inwarded / Available' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Inwarded (Ready)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Generated PR Success Modal */}
      {createdPrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Purchase Requisition Generated!</h3>
                <p className="text-xs text-slate-500">Deficit stock has been queued for Procurement Manager approval.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-500">PR Number:</span>
                <span className="font-mono font-bold text-blue-600">{createdPrModal.prNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Project:</span>
                <span className="text-slate-900 font-bold">{createdPrModal.projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Line Items:</span>
                <span className="text-slate-900">{createdPrModal.items.length} SKUs</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                <span className="text-slate-700">Est. Procurement Total:</span>
                <span className="text-emerald-600 font-mono">₹{createdPrModal.totalEstimatedAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCreatedPrModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Stay on BOQ
              </button>
              <button
                onClick={() => {
                  setCreatedPrModal(null);
                  onNavigateToProcurement();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <span>Open PR/PO Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover & Tax Completion Bill Modal */}
      {selectedProjectForBillModal && (
        <ProjectCompletionBillModal
          project={selectedProjectForBillModal}
          onClose={() => setSelectedProjectForBillModal(null)}
        />
      )}

      {/* Project Executive Summary & Client Handover Schedule PDF Modal */}
      {selectedProjectForPdfModal && (
        <ProjectSummaryPdfModal
          project={selectedProjectForPdfModal}
          isOpen={!!selectedProjectForPdfModal}
          onClose={() => setSelectedProjectForPdfModal(null)}
          onGeneratePR={handleGeneratePRForItems}
        />
      )}
    </div>
  );
};
