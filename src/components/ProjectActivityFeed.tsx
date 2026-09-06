import React, { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShoppingCart,
  Truck,
  Boxes,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Plus,
  Send,
  User,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { Project, PurchaseRequisition, PurchaseOrder, AuditLog } from '../types';
import { storageService } from '../services/storageService';

export interface ProjectActivityFeedProps {
  project: Project;
  prs?: PurchaseRequisition[];
  pos?: PurchaseOrder[];
  auditLogs?: AuditLog[];
  onNavigateToProcurement?: () => void;
  className?: string;
}

export type ProjectActivityCategory = 'ALL' | 'STATUS' | 'APPROVALS' | 'DISPATCH' | 'SITE_NOTES';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  category: 'STATUS' | 'APPROVALS' | 'DISPATCH' | 'SITE_NOTES';
  type: string;
  title: string;
  description: string;
  actor: {
    name: string;
    role: string;
  };
  status?: string;
  referenceId?: string;
  amount?: number;
  itemsCount?: number;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

export const ProjectActivityFeed: React.FC<ProjectActivityFeedProps> = ({
  project,
  prs: propPrs,
  pos: propPos,
  auditLogs: propAuditLogs,
  onNavigateToProcurement,
  className = ''
}) => {
  const [activeCategory, setActiveCategory] = useState<ProjectActivityCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLogType, setNewLogType] = useState<'STATUS' | 'DISPATCH' | 'SITE_NOTES'>('SITE_NOTES');
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogDesc, setNewLogDesc] = useState('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Subscribed live data
  const allPrs = propPrs || storageService.getPRs();
  const allPos = propPos || storageService.getPOs();
  const allAuditLogs = propAuditLogs || storageService.getAuditLogs();

  // Filter items matching current project
  const projectPrs = useMemo(() => {
    return allPrs.filter(
      (pr) =>
        pr.projectId === project.id ||
        (pr.projectName && pr.projectName.toLowerCase() === project.projectName.toLowerCase()) ||
        pr.projectName?.includes(project.projectNumber)
    );
  }, [allPrs, project.id, project.projectName, project.projectNumber]);

  const projectPos = useMemo(() => {
    return allPos.filter(
      (po) =>
        po.projectId === project.id ||
        (po.projectName && po.projectName.toLowerCase() === project.projectName.toLowerCase()) ||
        po.projectName?.includes(project.projectNumber)
    );
  }, [allPos, project.id, project.projectName, project.projectNumber]);

  const projectAuditLogs = useMemo(() => {
    return allAuditLogs.filter((log) => {
      const summary = (log.summary || '').toLowerCase();
      const entityId = (log.entityId || '').toLowerCase();
      const pNum = project.projectNumber.toLowerCase();
      const pName = project.projectName.toLowerCase();
      const pId = project.id.toLowerCase();

      return (
        entityId === pId ||
        entityId === pNum ||
        summary.includes(pNum) ||
        summary.includes(pName) ||
        (log.entityType === 'PROJECT' && (entityId.includes(pNum) || summary.includes(pNum)))
      );
    });
  }, [allAuditLogs, project.id, project.projectName, project.projectNumber]);

  // Assemble full timeline of events
  const timelineEvents: TimelineEvent[] = useMemo(() => {
    const events: TimelineEvent[] = [];

    // 1. Project Inception Base Event
    const createdDate = project.targetCompletionDate
      ? new Date(new Date(project.targetCompletionDate).getTime() - 60 * 24 * 60 * 60 * 1000).toISOString()
      : new Date().toISOString();

    events.push({
      id: `init-${project.id}`,
      timestamp: createdDate,
      category: 'STATUS',
      type: 'PROJECT_CREATED',
      title: 'Project Initiated & BOQ Formatted',
      description: `Turnkey HVAC contract initiated for ${project.clientName}. Total contract value: ₹${project.contractValue.toLocaleString('en-IN')}. Assigned Lead Project Manager: ${project.projectManager}.`,
      actor: {
        name: project.projectManager || 'Lead Project Manager',
        role: 'Project Manager'
      },
      status: 'Initial Setup',
      referenceId: project.projectNumber,
      amount: project.contractValue,
      itemsCount: project.boqItems.length,
      icon: Building2,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200'
    });

    // 2. Current Project Status & Delay telemetry
    if (project.isDelayed) {
      events.push({
        id: `delay-${project.id}`,
        timestamp: new Date().toISOString(),
        category: 'STATUS',
        type: 'DELAY_LOGGED',
        title: `⚠️ Project Delay Recorded: ${project.delayDays || 0} Days Overdue`,
        description: `Delay category: ${project.delayCategory || 'Site Access Obstruction'}. Root cause: "${project.delayReason || 'Civil clearance pending'}". Mitigation plan: "${project.delayMitigationPlan || 'Expediting shifts'}".`,
        actor: {
          name: project.projectManager,
          role: 'Site Operations'
        },
        status: 'Overdue Alert',
        referenceId: project.projectNumber,
        icon: AlertTriangle,
        iconColor: 'text-rose-600 bg-rose-50 border-rose-200'
      });
    }

    if (project.status === 'Handover & Closed' || project.actualCompletionDate) {
      events.push({
        id: `completed-${project.id}`,
        timestamp: project.actualCompletionDate ? new Date(project.actualCompletionDate).toISOString() : new Date().toISOString(),
        category: 'STATUS',
        type: 'HANDOVER_COMPLETED',
        title: 'Project Handover & Client Sign-off Completed',
        description: `HVAC testing, balancing, and client final commissioning completed. Final completion bill and warranty certificate generated.`,
        actor: {
          name: project.projectManager,
          role: 'Project Manager'
        },
        status: 'Handover & Closed',
        referenceId: project.projectNumber,
        icon: CheckCircle2,
        iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200'
      });
    }

    // 3. Purchase Requisitions (PR) Generated & Approvals
    projectPrs.forEach((pr) => {
      // PR Generated Event
      events.push({
        id: `pr-created-${pr.id}`,
        timestamp: pr.requestDate ? new Date(pr.requestDate).toISOString() : new Date().toISOString(),
        category: 'APPROVALS',
        type: 'PR_GENERATED',
        title: `Purchase Requisition Generated (${pr.prNumber})`,
        description: `Automated/Manual PR generated for ${pr.items.length} BOQ deficit SKU(s). Estimated procurement amount: ₹${pr.totalEstimatedAmount.toLocaleString('en-IN')}. Priority: ${pr.priority}.`,
        actor: {
          name: pr.requestedBy || 'Procurement Agent',
          role: 'Procurement'
        },
        status: pr.status,
        referenceId: pr.prNumber,
        amount: pr.totalEstimatedAmount,
        itemsCount: pr.items.length,
        icon: FileText,
        iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200'
      });

      // PR Approved / Rejected Event
      if (pr.status === 'Approved' || pr.status === 'Converted to PO') {
        events.push({
          id: `pr-approved-${pr.id}`,
          timestamp: pr.approvedAt || pr.requestDate || new Date().toISOString(),
          category: 'APPROVALS',
          type: 'PR_APPROVED',
          title: `Purchase Requisition Approved (${pr.prNumber})`,
          description: `PR ${pr.prNumber} verified and approved for purchase order issuance. Authorized by ${pr.approvedBy || 'Business Operations Head'}. Converted PO Reference: ${pr.convertedPoNumber || 'PO in Dispatch'}.`,
          actor: {
            name: pr.approvedBy || 'Procurement Lead',
            role: 'Management Approver'
          },
          status: pr.status,
          referenceId: pr.prNumber,
          amount: pr.totalEstimatedAmount,
          icon: Sparkles,
          iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200'
        });
      } else if (pr.status === 'Rejected') {
        events.push({
          id: `pr-rejected-${pr.id}`,
          timestamp: pr.approvedAt || new Date().toISOString(),
          category: 'APPROVALS',
          type: 'PR_REJECTED',
          title: `Purchase Requisition Rejected (${pr.prNumber})`,
          description: `PR ${pr.prNumber} was declined during executive review. Reason: Budget realignment or inventory substitution.`,
          actor: {
            name: pr.approvedBy || 'Procurement Lead',
            role: 'Management Approver'
          },
          status: 'Rejected',
          referenceId: pr.prNumber,
          icon: AlertTriangle,
          iconColor: 'text-rose-600 bg-rose-50 border-rose-200'
        });
      }
    });

    // 4. Purchase Orders (PO) Issued & Vendor Dispatches
    projectPos.forEach((po) => {
      events.push({
        id: `po-created-${po.id}`,
        timestamp: po.orderDate ? new Date(po.orderDate).toISOString() : new Date().toISOString(),
        category: 'APPROVALS',
        type: 'PO_ISSUED',
        title: `Purchase Order Issued (${po.poNumber})`,
        description: `Official PO dispatched to vendor ${po.vendorName} for ${po.items.length} item(s). Grand total with taxes: ₹${po.grandTotal.toLocaleString('en-IN')}. Target expected delivery date: ${po.expectedDeliveryDate}.`,
        actor: {
          name: 'Purchase Department',
          role: 'Procurement'
        },
        status: po.status,
        referenceId: po.poNumber,
        amount: po.grandTotal,
        itemsCount: po.items.length,
        icon: ShoppingCart,
        iconColor: 'text-purple-600 bg-purple-50 border-purple-200'
      });

      // Material Inward / Dispatch tracking for PO
      if (po.status === 'Received' || po.status === 'Partially Received' || po.status === 'Sent to Vendor') {
        events.push({
          id: `po-dispatch-${po.id}`,
          timestamp: po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toISOString() : new Date().toISOString(),
          category: 'DISPATCH',
          type: 'MATERIAL_DISPATCH_TRANSIT',
          title: `Material Supply Dispatch Tracked (${po.vendorName})`,
          description: `Vendor delivery logistics dispatched for ${po.projectName}. Delivery Address: ${po.deliveryAddress || 'Site Depot'}. Vendor Status: ${po.vendorAcknowledgmentStatus || 'Confirmed / In Transit'}.`,
          actor: {
            name: po.vendorName,
            role: 'Vendor OEM Logistics'
          },
          status: po.status === 'Received' ? 'Delivered & Inwarded' : 'Dispatched / In Transit',
          referenceId: po.poNumber,
          amount: po.grandTotal,
          icon: Truck,
          iconColor: 'text-amber-600 bg-amber-50 border-amber-200'
        });
      }
    });

    // 5. BOQ Stock Deficit & Allocation Dispatches
    const shortageCount = project.boqItems.filter((i) => i.shortageQty > 0).length;
    if (shortageCount > 0) {
      events.push({
        id: `boq-shortage-${project.id}`,
        timestamp: new Date().toISOString(),
        category: 'DISPATCH',
        type: 'INVENTORY_DEFICIT_CHECK',
        title: `Warehouse Ledger Check: ${shortageCount} Shortage(s) Flagged`,
        description: `Cross-checked ${project.boqItems.length} BOQ line items against live stock ledger. ${shortageCount} deficit items require replenishment.`,
        actor: {
          name: 'Warehouse Automated Ledger',
          role: 'Inventory Automation'
        },
        status: 'Deficit Alert',
        referenceId: project.projectNumber,
        itemsCount: shortageCount,
        icon: Boxes,
        iconColor: 'text-rose-600 bg-rose-50 border-rose-200'
      });
    }

    // 6. Audit Trail Logs for this Project
    projectAuditLogs.forEach((log) => {
      // Avoid exact duplicates with already built events
      const isDuplicate = events.some(
        (e) => e.referenceId === log.entityId && e.description.includes(log.action)
      );
      if (!isDuplicate) {
        let cat: TimelineEvent['category'] = 'SITE_NOTES';
        let icon = Activity;
        let iconCol = 'text-slate-600 bg-slate-50 border-slate-200';

        if (log.action === 'UPDATE' && log.entityType === 'PROJECT') {
          cat = 'STATUS';
          icon = RotateCcw;
          iconCol = 'text-blue-600 bg-blue-50 border-blue-200';
        } else if (log.entityType === 'PR' || log.entityType === 'PO') {
          cat = 'APPROVALS';
          icon = FileText;
          iconCol = 'text-indigo-600 bg-indigo-50 border-indigo-200';
        } else if (log.entityType === 'INVENTORY' || log.summary.includes('stock') || log.summary.includes('dispatch')) {
          cat = 'DISPATCH';
          icon = Truck;
          iconCol = 'text-amber-600 bg-amber-50 border-amber-200';
        }

        events.push({
          id: `audit-${log.id}`,
          timestamp: log.timestamp,
          category: cat,
          type: log.action,
          title: log.summary.split(':')[0] || `${log.action} ${log.entityType}`,
          description: log.summary,
          actor: {
            name: log.userName || 'System User',
            role: log.userRole.toUpperCase()
          },
          status: log.action,
          referenceId: log.entityId,
          icon,
          iconColor: iconCol
        });
      }
    });

    // Sort descending by timestamp (newest first)
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [project, projectPrs, projectPos, projectAuditLogs]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return timelineEvents.filter((ev) => {
      const matchesCategory = activeCategory === 'ALL' || ev.category === activeCategory;
      const term = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !term ||
        ev.title.toLowerCase().includes(term) ||
        ev.description.toLowerCase().includes(term) ||
        ev.actor.name.toLowerCase().includes(term) ||
        (ev.referenceId && ev.referenceId.toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [timelineEvents, activeCategory, searchQuery]);

  // Counts by category
  const counts = useMemo(() => {
    return {
      ALL: timelineEvents.length,
      STATUS: timelineEvents.filter((e) => e.category === 'STATUS').length,
      APPROVALS: timelineEvents.filter((e) => e.category === 'APPROVALS').length,
      DISPATCH: timelineEvents.filter((e) => e.category === 'DISPATCH').length,
      SITE_NOTES: timelineEvents.filter((e) => e.category === 'SITE_NOTES').length
    };
  }, [timelineEvents]);

  // Handle submit of custom site / dispatch log
  const handleAddSiteLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTitle.trim()) return;

    const fullSummary = `${newLogTitle}: ${newLogDesc || 'Site progress recorded by project management'}`;
    storageService.logAudit(
      'CREATE',
      newLogType === 'DISPATCH' ? 'INVENTORY' : 'PROJECT',
      project.projectNumber,
      fullSummary
    );

    storageService.addNotification(
      `Project Log Recorded: ${project.projectNumber}`,
      fullSummary,
      'info',
      'projects'
    );

    setNewLogTitle('');
    setNewLogDesc('');
    setIsAddingLog(false);
  };

  // Human relative time helper
  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHrs / 24);

      if (diffHrs < 1) return 'Just now';
      if (diffHrs < 24) return `${diffHrs}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Project Activity Feed & Audit History
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Live chronological tracking of status progressions, PR/PO approval milestones, and material dispatch records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingLog(!isAddingLog)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingLog ? 'Cancel Note' : 'Log Site Activity'}</span>
          </button>
        </div>
      </div>

      {/* Add Custom Note Drawer */}
      {isAddingLog && (
        <form
          onSubmit={handleAddSiteLog}
          className="bg-white border-2 border-blue-200 rounded-2xl p-4 space-y-3 shadow-md animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-blue-600" />
              Record Site Note / Dispatch Update for {project.projectNumber}
            </span>
            <span className="text-[11px] text-slate-400">Writes directly to Project Audit Ledger</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Activity Category</label>
              <select
                value={newLogType}
                onChange={(e) => setNewLogType(e.target.value as any)}
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="SITE_NOTES">Site Engineering / Inspection Note</option>
                <option value="DISPATCH">Material Dispatch / Delivery Milestone</option>
                <option value="STATUS">Phase Status / Milestone Progression</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Headline / Action Summary</label>
              <input
                type="text"
                value={newLogTitle}
                onChange={(e) => setNewLogTitle(e.target.value)}
                placeholder="e.g., 200m Copper piping batch delivered to Site Yard B"
                required
                className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Detailed Observations / QC Notes</label>
              <textarea
                value={newLogDesc}
                onChange={(e) => setNewLogDesc(e.target.value)}
                rows={2}
                placeholder="Specify challan number, site engineer names, inspection approvals, or pressure test signoffs..."
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingLog(false)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Dismiss
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Save Activity Entry
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeCategory === 'ALL'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Events ({counts.ALL})
          </button>
          <button
            onClick={() => setActiveCategory('STATUS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeCategory === 'STATUS'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Status Changes ({counts.STATUS})
          </button>
          <button
            onClick={() => setActiveCategory('APPROVALS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeCategory === 'APPROVALS'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PR/PO Approvals ({counts.APPROVALS})
          </button>
          <button
            onClick={() => setActiveCategory('DISPATCH')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeCategory === 'DISPATCH'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Material Dispatches ({counts.DISPATCH})
          </button>
          <button
            onClick={() => setActiveCategory('SITE_NOTES')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeCategory === 'SITE_NOTES'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Site Logs ({counts.SITE_NOTES})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity history..."
            className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:bg-white text-xs placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6 pt-2">
        {filteredEvents.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
            <Activity className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-slate-700">No project activity entries found</p>
            <p className="mt-1 text-slate-400">
              {searchQuery ? 'Try clearing your search query.' : 'Log a new site activity note above to start tracking history.'}
            </p>
          </div>
        ) : (
          filteredEvents.map((ev, index) => {
            const Icon = ev.icon;
            const isExpanded = expandedEventId === ev.id;

            return (
              <div key={ev.id} className="relative group">
                {/* Timeline Icon Node */}
                <div
                  className={`absolute -left-[35px] top-1.5 p-1.5 rounded-xl border shadow-xs transition-transform group-hover:scale-110 ${ev.iconColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Event Card */}
                <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-xs space-y-2 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {ev.title}
                      </span>
                      {ev.referenceId && (
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-blue-700 border border-slate-200">
                          {ev.referenceId}
                        </span>
                      )}
                      {ev.status && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            ev.status.includes('Approved') || ev.status.includes('Delivered') || ev.status.includes('Closed')
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ev.status.includes('Reject') || ev.status.includes('Overdue') || ev.status.includes('Deficit')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {ev.status}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(ev.timestamp)}</span>
                      <span className="text-slate-300">•</span>
                      <span>{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {ev.description}
                  </p>

                  {/* Highlights / Metadata tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{ev.actor.name}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-400">{ev.actor.role}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {ev.amount !== undefined && ev.amount > 0 && (
                        <span className="font-mono font-bold text-slate-800 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          Value: ₹{ev.amount.toLocaleString('en-IN')}
                        </span>
                      )}

                      {ev.itemsCount !== undefined && ev.itemsCount > 0 && (
                        <span className="text-[11px] text-slate-600 font-medium">
                          {ev.itemsCount} SKU(s) involved
                        </span>
                      )}

                      {onNavigateToProcurement && (ev.category === 'APPROVALS' || ev.category === 'DISPATCH') && (
                        <button
                          onClick={onNavigateToProcurement}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span>Open Pipeline</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
