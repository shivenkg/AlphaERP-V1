import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Building,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  FileText,
  Briefcase,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Flame,
  UserCheck,
  Download,
  Paperclip,
  Info,
  Table as TableIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lead, LeadStatus, LeadSource, SalesRep, Quote, UserProfile } from '../types';
import { CommunicationService } from '../services/whatsappEmailService';
import { storageService } from '../services/storageService';
import {
  MultiSelectFilterDropdown,
  MultiSelectOption,
  TableMetadataTooltip,
  LeadMetadataTooltipContent
} from './common';
import { exportTableToCSV } from '../utils/tableExportHelper';

interface CRMLeadsViewProps {
  leads: Lead[];
  quotes: Quote[];
  salesReps: SalesRep[];
  currentUser?: UserProfile;
  onOpenNewLead: () => void;
  onCreateQuoteForLead: (lead: Lead) => void;
  onAwardLead: (lead: Lead) => void;
  onSelectLeadDetail: (lead: Lead) => void;
}

const STAGES: Array<{ id: LeadStatus; title: string; color: string; border: string }> = [
  { id: 'New', title: 'New Leads', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
  { id: 'Site Survey Scheduled', title: 'Site Survey', color: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200' },
  { id: 'Quote Sent', title: 'Quote Submitted', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
  { id: 'Negotiation', title: 'Negotiation / Review', color: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
  { id: 'Awarded', title: 'Won / Awarded 🎉', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' }
];

const ALL_STAGE_OPTIONS: Array<{ value: LeadStatus; label: string }> = [
  { value: 'New', label: '1. New Lead' },
  { value: 'Site Survey Scheduled', label: '2. Survey Scheduled' },
  { value: 'Site Survey Completed', label: '2. Survey Completed' },
  { value: 'Quote Sent', label: '3. Quote Sent' },
  { value: 'Negotiation', label: '4. Negotiation' },
  { value: 'Awarded', label: '5. Awarded (Won)' },
  { value: 'Lost', label: 'Lost Opportunity' }
];

export const CRMLeadsView: React.FC<CRMLeadsViewProps> = ({
  leads,
  quotes,
  salesReps,
  currentUser,
  onOpenNewLead,
  onCreateQuoteForLead,
  onAwardLead,
  onSelectLeadDetail
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedReps, setSelectedReps] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [personalViewOnly, setPersonalViewOnly] = useState<boolean>(false);
  const [displayDensity, setDisplayDensityState] = useState<'compact' | 'spacious'>(() => storageService.getDisplayDensity());

  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setDisplayDensityState(storageService.getDisplayDensity());
    });
    return unsubscribe;
  }, []);

  const handleDensityToggle = (density: 'compact' | 'spacious') => {
    storageService.setDisplayDensity(density);
    setDisplayDensityState(density);
  };

  // Active user for personal view
  const activeUser = currentUser || storageService.getCurrentUser();

  // Personal leads count
  const personalLeadsCount = React.useMemo(() => {
    const userName = (activeUser?.name || '').toLowerCase();
    const userId = (activeUser?.id || '').toLowerCase();
    return (leads || []).filter((lead) => {
      const repId = (lead.assignedTo || '').toLowerCase();
      const repName = (lead.assignedToName || '').toLowerCase();
      return Boolean(
        (userId && repId === userId) ||
        (userName && repName && (repName.includes(userName) || userName.includes(repName)))
      );
    }).length;
  }, [leads, activeUser]);

  // Rep options with dynamic count and avatar
  const repOptions: MultiSelectOption[] = React.useMemo(() => {
    return (salesReps || []).map((rep) => {
      const count = (leads || []).filter((l) => l.assignedTo === rep.id).length;
      return {
        value: rep.id,
        label: rep.name,
        avatar: rep.avatar,
        count
      };
    });
  }, [salesReps, leads]);

  // Priority options with counts
  const priorityOptions: MultiSelectOption[] = React.useMemo(() => {
    const priorities: Array<{ value: 'High' | 'Medium' | 'Low'; label: string; badgeColor: string }> = [
      { value: 'High', label: 'High Priority', badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
      { value: 'Medium', label: 'Medium Priority', badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
      { value: 'Low', label: 'Low Priority', badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' }
    ];

    return priorities.map((p) => {
      const count = (leads || []).filter((l) => l.priority === p.value).length;
      return {
        value: p.value,
        label: p.label,
        badgeColor: p.badgeColor,
        count
      };
    });
  }, [leads]);

  // Filtered Leads with safe optional checks
  const term = (search || '').trim().toLowerCase();
  const filteredLeads = (leads || []).filter((lead) => {
    const matchesSearch =
      !term ||
      (lead.companyName || '').toLowerCase().includes(term) ||
      (lead.clientName || '').toLowerCase().includes(term) ||
      (lead.leadNumber || '').toLowerCase().includes(term) ||
      (lead.city || '').toLowerCase().includes(term) ||
      (lead.hvacType || '').toLowerCase().includes(term);

    const matchesSource = selectedSource === 'ALL' || lead.source === selectedSource;
    const matchesRep = selectedReps.length === 0 || selectedReps.includes(lead.assignedTo);
    const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(lead.priority);

    let matchesPersonal = true;
    if (personalViewOnly) {
      const userName = (activeUser?.name || '').toLowerCase();
      const userId = (activeUser?.id || '').toLowerCase();
      const repId = (lead.assignedTo || '').toLowerCase();
      const repName = (lead.assignedToName || '').toLowerCase();
      matchesPersonal = Boolean(
        (userId && repId === userId) ||
        (userName && repName && (repName.includes(userName) || userName.includes(repName)))
      );
    }

    return matchesSearch && matchesSource && matchesRep && matchesPriority && matchesPersonal;
  });

  const hasActiveFilters = search.trim() !== '' || selectedSource !== 'ALL' || selectedReps.length > 0 || selectedPriorities.length > 0 || personalViewOnly;

  const resetAllFilters = () => {
    setSearch('');
    setSelectedSource('ALL');
    setSelectedReps([]);
    setSelectedPriorities([]);
    setPersonalViewOnly(false);
  };

  const handleExportFilteredLeads = () => {
    const today = new Date().toISOString().split('T')[0];
    const filename = `HVAC_CRM_Leads_${personalViewOnly ? 'Personal_' : ''}${today}.csv`;
    const headers = [
      'Lead #',
      'Company Name',
      'Client Contact',
      'Phone',
      'Email',
      'City',
      'HVAC System Type',
      'Capacity (TR)',
      'Estimated Value (INR)',
      'Source',
      'Stage / Pipeline Status',
      'Priority',
      'Assigned Sales Rep',
      'Created Date'
    ];
    const rows = filteredLeads.map((l) => [
      l.leadNumber || '',
      l.companyName || '',
      l.clientName || '',
      l.phone || '',
      l.email || '',
      l.city || '',
      l.hvacType || '',
      l.capacityTR || 0,
      l.estimatedValue || 0,
      l.source || '',
      l.status || '',
      l.priority || '',
      l.assignedToName || l.assignedTo || '',
      l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''
    ]);
    exportTableToCSV(filename, headers, rows);
  };

  const getNextStage = (current: LeadStatus): LeadStatus | null => {
    switch (current) {
      case 'New':
        return 'Site Survey Scheduled';
      case 'Site Survey Scheduled':
      case 'Site Survey Completed':
        return 'Quote Sent';
      case 'Quote Sent':
        return 'Negotiation';
      case 'Negotiation':
        return 'Awarded';
      default:
        return null;
    }
  };

  const handleStageChange = (leadId: string, newStatus: LeadStatus) => {
    if (newStatus === 'Awarded') {
      const lead = leads.find((l) => l.id === leadId);
      if (lead) {
        onAwardLead(lead);
        return;
      }
    }
    storageService.updateLead(leadId, { status: newStatus });
  };

  const handleAdvanceNextStage = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = getNextStage(lead.status);
    if (!next) return;
    if (next === 'Awarded') {
      onAwardLead(lead);
    } else {
      storageService.updateLead(lead.id, { status: next });
    }
  };

  const handleQuickWhatsApp = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    const { message } = CommunicationService.getLeadNurtureTemplate(lead);
    const url = CommunicationService.getWhatsAppUrl(lead.phone, message);
    storageService.logLeadCommunication(lead.id, 'WhatsApp', `Initiated direct WhatsApp message to ${lead.clientName}`);
    window.open(url, '_blank');
  };

  const handleQuickEmail = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    const { subject, message } = CommunicationService.getLeadNurtureTemplate(lead);
    const url = CommunicationService.getMailtoUrl(lead.email, subject, message);
    storageService.logLeadCommunication(lead.id, 'Email', `Sent email proposal: "${subject}"`);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">HVAC CRM & Leads Lifecycle</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {filteredLeads.length} Leads
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track opportunities from multi-channel inquiries through survey, quote generation, and project conversion.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Pipeline Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              List View
            </button>
          </div>

          {/* Personal View Toggle */}
          <button
            onClick={() => setPersonalViewOnly(!personalViewOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              personalViewOnly
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs ring-2 ring-indigo-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Personal View: Only display leads assigned to you"
          >
            <UserCheck className={`w-3.5 h-3.5 ${personalViewOnly ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Personal View</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                personalViewOnly ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {personalLeadsCount}
            </span>
          </button>

          {/* Export CSV / Excel */}
          <button
            onClick={handleExportFilteredLeads}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-400 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            title="Export currently filtered leads to CSV / Excel spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV/Excel</span>
          </button>

          <button
            onClick={onOpenNewLead}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 text-xs shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter leads by company, city, HVAC..."
            className="w-full bg-slate-50 text-slate-900 pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="font-medium">Source:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Sources</option>
              <option value="Website">Website</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="HVAC Consultant">HVAC Consultant</option>
              <option value="Architect">Architect</option>
              <option value="Referral">Referral</option>
              <option value="Trade Expo">Trade Expo</option>
              <option value="Inbound Call">Inbound Call</option>
              <option value="Direct Sales">Direct Sales</option>
            </select>
          </div>

          {/* Multi-Select Sales Rep Filter */}
          <MultiSelectFilterDropdown
            id="crm-rep-multiselect-filter"
            label="Sales Rep"
            options={repOptions}
            selectedValues={selectedReps}
            onChange={setSelectedReps}
            placeholder="All Reps"
            icon={Users}
          />

          {/* Multi-Select Priority Filter */}
          <MultiSelectFilterDropdown
            id="crm-priority-multiselect-filter"
            label="Priority"
            options={priorityOptions}
            selectedValues={selectedPriorities}
            onChange={setSelectedPriorities}
            placeholder="All Priorities"
            icon={Flame}
          />

          {/* Reset Filters button if any active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' ? (
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory lg:grid lg:grid-cols-5 lg:overflow-x-visible items-start scrollbar-thin">
          {STAGES.map((col) => {
            const colLeads = filteredLeads.filter((l) => {
              if (col.id === 'Site Survey Scheduled') {
                return l.status === 'Site Survey Scheduled' || l.status === 'Site Survey Completed';
              }
              return l.status === col.id;
            });
            const totalStageVal = colLeads.reduce((s, l) => s + (l.estimatedValue || 0), 0);

            return (
              <div
                key={col.id}
                className="bg-slate-100/70 border border-slate-200 rounded-2xl flex flex-col min-w-[280px] sm:min-w-[320px] lg:min-w-0 snap-start flex-1 shrink-0 lg:shrink max-h-[calc(100vh-250px)]"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200 bg-white/90 sticky top-0 rounded-t-2xl z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{col.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${col.color}`}>
                      {colLeads.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-semibold">
                    ₹{(totalStageVal / 100000).toFixed(1)} Lakhs
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                  {colLeads.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">No leads in this stage</div>
                  ) : (
                    colLeads.map((lead) => {
                      const nextStage = getNextStage(lead.status);
                      const pendingFollowUps = lead.followUps.filter((f) => !f.completed);

                      return (
                        <div
                          key={lead.id}
                          onClick={() => onSelectLeadDetail(lead)}
                          className="p-3.5 bg-white hover:bg-white border border-slate-200 hover:border-blue-400 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-md group space-y-2.5"
                        >
                          {/* Top Row: Lead Code & Priority */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-slate-500 font-semibold">{lead.leadNumber}</span>
                            <span
                              className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold ${
                                lead.priority === 'High'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : lead.priority === 'Medium'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {lead.priority}
                            </span>
                          </div>

                          {/* Company & Client */}
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {lead.companyName}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{lead.clientName}</p>
                          </div>

                          {/* HVAC Specs Tag */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                              {lead.estimatedCapacityTR} TR
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium truncate max-w-[110px]">
                              {lead.hvacType}
                            </span>
                          </div>

                          {/* Value & City */}
                          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                            <span className="font-bold text-emerald-600">
                              ₹{(lead.estimatedValue / 100000).toFixed(1)} L
                            </span>
                            <span className="text-[10px] text-slate-400">{lead.city}</span>
                          </div>

                          {/* Interactive Stage Dropdown on Card */}
                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] text-slate-500 font-medium shrink-0">Stage:</span>
                            <select
                              value={lead.status}
                              onChange={(e) => handleStageChange(lead.id, e.target.value as LeadStatus)}
                              className="w-full text-[10px] font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                            >
                              {ALL_STAGE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Follow-up / Action Alerts */}
                          {pendingFollowUps.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span className="font-medium truncate">
                                {pendingFollowUps[0].type}: {pendingFollowUps[0].date}
                              </span>
                            </div>
                          )}

                          {/* InsForge Attachments Indicator */}
                          {lead.attachments && lead.attachments.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 font-medium">
                              <Paperclip className="w-3 h-3 text-blue-600" />
                              <span>{lead.attachments.length} attachment{lead.attachments.length > 1 ? 's' : ''}</span>
                            </div>
                          )}

                          {/* Action Buttons: WhatsApp, Email, Next Stage Advance, Quote, Award */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={(e) => handleQuickWhatsApp(lead, e)}
                                title="Send WhatsApp Message"
                                className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleQuickEmail(lead, e)}
                                title="Send Proposal Email"
                                className="p-1 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Stage Move / Quote Actions */}
                            <div className="flex items-center gap-1">
                              {lead.status !== 'Awarded' && nextStage && (
                                <button
                                  onClick={(e) => handleAdvanceNextStage(lead, e)}
                                  title={`Advance to ${nextStage}`}
                                  className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-0.5 transition-colors border border-blue-200"
                                >
                                  <span>Next</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              )}

                              {lead.status !== 'Awarded' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCreateQuoteForLead(lead);
                                    }}
                                    title="Create Formal HVAC Quotation"
                                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 font-semibold transition-colors"
                                  >
                                    + Quote
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAwardLead(lead);
                                    }}
                                    title="Award Contract & Convert to Project with BOQ"
                                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[10px] text-white font-bold flex items-center gap-1 shadow-xs transition-colors"
                                  >
                                    <span>Award</span>
                                    <Sparkles className="w-2.5 h-2.5" />
                                  </button>
                                </>
                              )}

                              {lead.status === 'Awarded' && (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Won
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Table Header Controls: Density Toggle & Tooltip Tip */}
          <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="p-1 rounded-md bg-blue-100 text-blue-700">
                <Info className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium">
                Hover over any <strong className="text-slate-900">Lead #</strong> or <strong className="text-slate-900">Company Name</strong> to view extended commercial & engineering metadata, site contacts, and instant actions.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <TableIcon className="w-3.5 h-3.5 text-indigo-500" />
                Density:
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[10px] font-bold shadow-xs">
                <button
                  id="btn-density-compact-crm"
                  onClick={() => handleDensityToggle('compact')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    displayDensity === 'compact'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Enable Compact Density Mode (dense rows, ideal for reviewing high-volume leads)"
                >
                  Compact
                </button>
                <button
                  id="btn-density-spacious-crm"
                  onClick={() => handleDensityToggle('spacious')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    displayDensity === 'spacious'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Enable Spacious Density Mode"
                >
                  Spacious
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Lead #</th>
                  <th className="py-3 px-4">Company & Client</th>
                  <th className="py-3 px-4">HVAC Solution</th>
                  <th className="py-3 px-4">Capacity (TR)</th>
                  <th className="py-3 px-4">Est Value (₹)</th>
                  <th className="py-3 px-4">Stage / Pipeline Status</th>
                  <th className="py-3 px-4">Assigned Engineer</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => {
                  const nextStage = getNextStage(lead.status);
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLeadDetail(lead)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        <TableMetadataTooltip
                          content={
                            <LeadMetadataTooltipContent
                              lead={lead}
                              onAdvanceStage={(l) => handleAdvanceNextStage(l, { stopPropagation: () => {} } as any)}
                              onWhatsApp={(l) => handleQuickWhatsApp(l, { stopPropagation: () => {} } as any)}
                              onEmail={(l) => handleQuickEmail(l, { stopPropagation: () => {} } as any)}
                              onViewDetail={() => onSelectLeadDetail(lead)}
                              onAward={() => onAwardLead(lead)}
                            />
                          }
                        >
                          <span className="hover:underline flex items-center gap-1">
                            {lead.leadNumber}
                            <Info className="w-2.5 h-2.5 text-blue-400 opacity-60" />
                          </span>
                        </TableMetadataTooltip>
                      </td>
                      <td className="py-3.5 px-4">
                        <TableMetadataTooltip
                          content={
                            <LeadMetadataTooltipContent
                              lead={lead}
                              onAdvanceStage={(l) => handleAdvanceNextStage(l, { stopPropagation: () => {} } as any)}
                              onWhatsApp={(l) => handleQuickWhatsApp(l, { stopPropagation: () => {} } as any)}
                              onEmail={(l) => handleQuickEmail(l, { stopPropagation: () => {} } as any)}
                              onViewDetail={() => onSelectLeadDetail(lead)}
                              onAward={() => onAwardLead(lead)}
                            />
                          }
                        >
                          <div className="flex items-center gap-1.5 group/cell">
                            <span className="font-bold text-slate-900 group-hover/cell:text-blue-600 transition-colors">
                              {lead.companyName}
                            </span>
                            <span className="p-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 opacity-50 group-hover/cell:opacity-100 transition-opacity" title="Extended item metadata">
                              <Info className="w-2.5 h-2.5" />
                            </span>
                            {lead.attachments && lead.attachments.length > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-bold" title={`${lead.attachments.length} attachment(s)`}>
                                <Paperclip className="w-2.5 h-2.5 text-blue-600" />
                                {lead.attachments.length}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {lead.clientName} • {lead.city}
                          </div>
                        </TableMetadataTooltip>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{lead.hvacType}</td>
                      <td className="py-3.5 px-4 text-slate-800 font-semibold">{lead.estimatedCapacityTR} TR</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        ₹{(lead.estimatedValue / 100000).toFixed(2)} L
                      </td>
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStageChange(lead.id, e.target.value as LeadStatus)}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          {ALL_STAGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{lead.assignedToName}</td>
                      <td className="py-3.5 px-4 text-slate-500">{lead.source}</td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {nextStage && lead.status !== 'Awarded' && (
                            <button
                              onClick={(e) => handleAdvanceNextStage(lead, e)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors"
                              title={`Advance to ${nextStage}`}
                            >
                              <span>Next</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleQuickWhatsApp(lead, e)}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleQuickEmail(lead, e)}
                            className="p-1.5 bg-slate-100 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                            title="Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          {lead.status !== 'Awarded' && (
                            <button
                              onClick={() => onAwardLead(lead)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] shadow-xs"
                            >
                              Award
                            </button>
                          )}
                        </div>
                      </td>
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
