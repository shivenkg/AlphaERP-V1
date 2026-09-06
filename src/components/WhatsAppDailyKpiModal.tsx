import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  Check,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  DollarSign,
  UserCheck,
  RefreshCw,
  Edit3,
  CheckCircle2,
  ExternalLink,
  Sliders,
  FileText,
  ShieldCheck,
  Phone,
  Plus,
  Trash2,
  X,
  ChevronRight,
  Info,
  Building2,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  DailyKpiSnapshot,
  WhatsAppTriggerConfig,
  WhatsAppTriggerRecipient,
  Project,
  SystemSettings
} from '../types';
import { KpiDigestService } from '../services/kpiDigestService';
import { storageService } from '../services/storageService';

interface WhatsAppDailyKpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const WhatsAppDailyKpiModal: React.FC<WhatsAppDailyKpiModalProps> = ({
  isOpen,
  onClose,
  initialDate
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || KpiDigestService.getPreviousDayDate()
  );
  const [activeTab, setActiveTab] = useState<
    'preview' | 'breakdown' | 'delay_editor' | 'automation_config' | 'history'
  >('preview');
  
  const [copied, setCopied] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerSuccessMsg, setTriggerSuccessMsg] = useState<string | null>(null);
  
  // Custom test number
  const [customPhone, setCustomPhone] = useState('');
  const [customRecipientName, setCustomRecipientName] = useState('Executive Stakeholder');

  // Load config & projects
  const [config, setConfig] = useState<WhatsAppTriggerConfig>(() =>
    storageService.getWhatsAppTriggerConfig()
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    storageService.getProjects()
  );
  const [editingDelayId, setEditingDelayId] = useState<string | null>(null);
  const [editingDelayReason, setEditingDelayReason] = useState<string>('');
  const [editingDelayDays, setEditingDelayDays] = useState<number>(0);
  const [editingDelayCategory, setEditingDelayCategory] = useState<Project['delayCategory']>('Client Site Clearance');
  const [editingIsDelayed, setEditingIsDelayed] = useState<boolean>(true);

  // New recipient form state
  const [newRecipName, setNewRecipName] = useState('');
  const [newRecipPhone, setNewRecipPhone] = useState('+91 ');
  const [newRecipRole, setNewRecipRole] = useState('executive');
  const [newRecipDesignation, setNewRecipDesignation] = useState('');

  // Calculate live snapshot for selected date
  const snapshot: DailyKpiSnapshot = useMemo(() => {
    return KpiDigestService.calculateDailyKpiSnapshot(selectedDate, {
      projects
    });
  }, [selectedDate, projects]);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setConfig(storageService.getWhatsAppTriggerConfig());
      setProjects(storageService.getProjects());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleCopyMessage = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(snapshot.formattedWhatsAppText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTriggerToRecipient = (recipient: WhatsAppTriggerRecipient) => {
    setIsTriggering(true);
    const result = KpiDigestService.triggerWhatsAppToRecipient(
      recipient.phone,
      snapshot.formattedWhatsAppText,
      recipient.name,
      {
        snapshotDate: snapshot.date,
        triggeredBy: storageService.getCurrentUser().name
      }
    );

    // Save snapshot to history
    storageService.saveDailyKpiSnapshot({
      ...snapshot,
      status: 'Sent',
      triggeredAt: new Date().toISOString(),
      triggeredBy: storageService.getCurrentUser().name
    });

    setTimeout(() => {
      setIsTriggering(false);
      setTriggerSuccessMsg(`Dispatched WhatsApp trigger for ${recipient.name}! Opening WhatsApp...`);
      window.open(result.url, '_blank');
      setTimeout(() => setTriggerSuccessMsg(null), 4000);
    }, 400);
  };

  const handleTriggerToAllActive = () => {
    const activeRecipients = config.recipients.filter((r) => r.active);
    if (activeRecipients.length === 0) {
      alert('No active recipients configured. Please enable at least one recipient.');
      return;
    }

    setIsTriggering(true);
    activeRecipients.forEach((recip, idx) => {
      setTimeout(() => {
        KpiDigestService.triggerWhatsAppToRecipient(
          recip.phone,
          snapshot.formattedWhatsAppText,
          recip.name,
          {
            snapshotDate: snapshot.date,
            triggeredBy: storageService.getCurrentUser().name
          }
        );
        if (idx === 0) {
          const firstResult = KpiDigestService.triggerWhatsAppToRecipient(
            recip.phone,
            snapshot.formattedWhatsAppText,
            recip.name
          );
          window.open(firstResult.url, '_blank');
        }
      }, idx * 300);
    });

    // Update trigger metadata
    const updatedConfig: WhatsAppTriggerConfig = {
      ...config,
      lastTriggeredAt: new Date().toISOString(),
      lastTriggerDate: snapshot.date
    };
    storageService.updateWhatsAppTriggerConfig(updatedConfig);
    setConfig(updatedConfig);

    storageService.saveDailyKpiSnapshot({
      ...snapshot,
      status: 'Sent',
      triggeredAt: new Date().toISOString(),
      triggeredBy: storageService.getCurrentUser().name,
      recipientsCount: activeRecipients.length
    });

    setTimeout(() => {
      setIsTriggering(false);
      setTriggerSuccessMsg(`Successfully triggered Daily Business KPI Digest to ${activeRecipients.length} executives!`);
      setTimeout(() => setTriggerSuccessMsg(null), 5000);
    }, 800);
  };

  const handleTriggerCustomPhone = () => {
    if (!customPhone.trim()) {
      alert('Please enter a valid WhatsApp phone number with country code (e.g. +91 9820011223).');
      return;
    }
    const result = KpiDigestService.triggerWhatsAppToRecipient(
      customPhone,
      snapshot.formattedWhatsAppText,
      customRecipientName,
      {
        snapshotDate: snapshot.date,
        triggeredBy: storageService.getCurrentUser().name
      }
    );
    window.open(result.url, '_blank');
  };

  const handleSaveDelayReason = (prjId: string) => {
    storageService.updateProjectDelay(prjId, {
      isDelayed: editingIsDelayed,
      delayDays: editingDelayDays,
      delayReason: editingDelayReason,
      delayCategory: editingDelayCategory
    });
    setEditingDelayId(null);
  };

  const handleStartEditDelay = (prj: Project) => {
    setEditingDelayId(prj.id);
    setEditingIsDelayed(prj.isDelayed ?? (prj.id === 'prj-002' || prj.id === 'prj-003'));
    setEditingDelayDays(prj.delayDays || (prj.id === 'prj-002' ? 12 : 8));
    setEditingDelayReason(
      prj.delayReason ||
        (prj.id === 'prj-002'
          ? 'Client site access restricted to night shifts only; pending consultant drawing signoff for acoustic vibration isolators.'
          : 'Civil contractor delayed ceiling reinforcement; awaiting HEPA filter test validation rig delivery from OEM.')
    );
    setEditingDelayCategory(prj.delayCategory || 'Client Site Clearance');
  };

  const handleToggleRecipient = (id: string) => {
    const updated = config.recipients.map((r) =>
      r.id === id ? { ...r, active: !r.active } : r
    );
    const newConf = { ...config, recipients: updated };
    storageService.updateWhatsAppTriggerConfig(newConf);
    setConfig(newConf);
  };

  const handleAddRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipName.trim() || !newRecipPhone.trim()) return;
    const newR: WhatsAppTriggerRecipient = {
      id: `rec-${Date.now()}`,
      name: newRecipName.trim(),
      phone: newRecipPhone.trim(),
      role: newRecipRole,
      designation: newRecipDesignation.trim() || 'Executive Stakeholder',
      active: true
    };
    const updated = [...config.recipients, newR];
    const newConf = { ...config, recipients: updated };
    storageService.updateWhatsAppTriggerConfig(newConf);
    setConfig(newConf);
    setNewRecipName('');
    setNewRecipPhone('+91 ');
    setNewRecipDesignation('');
  };

  const handleDeleteRecipient = (id: string) => {
    const updated = config.recipients.filter((r) => r.id !== id);
    const newConf = { ...config, recipients: updated };
    storageService.updateWhatsAppTriggerConfig(newConf);
    setConfig(newConf);
  };

  const snapshotsHistory = storageService.getDailyKpiSnapshots();

  return (
    <div
      id="whatsapp-kpi-digest-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white border-b border-emerald-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Automated WhatsApp Daily KPI Digest Trigger
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-Generator
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                Dispatches previous day closing metrics: New Leads, Bill Collections, 0-90+ Days Aging, Payments Done, Revenue & Delayed Projects with Reasons.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-emerald-500/30">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'preview'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp Message Preview
            </button>

            <button
              onClick={() => setActiveTab('breakdown')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'breakdown'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              6 Key Business KPIs Breakdown
            </button>

            <button
              onClick={() => setActiveTab('delay_editor')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'delay_editor'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Delayed Projects & Reasons ({snapshot.delayedProjectsCount})
            </button>

            <button
              onClick={() => setActiveTab('automation_config')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'automation_config'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Auto-Trigger & Recipients ({config.recipients.filter((r) => r.active).length})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Trigger Logs ({snapshotsHistory.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerToAllActive}
              disabled={isTriggering}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all disabled:opacity-50"
            >
              {isTriggering ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Trigger to All Active ({config.recipients.filter((r) => r.active).length})
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {triggerSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-emerald-800 text-xs font-medium animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{triggerSuccessMsg}</span>
            </div>
            <button
              onClick={() => setTriggerSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-100/50">
          {/* TAB 1: WHATSAPP MESSAGE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* WhatsApp Simulated Phone Chat Screen */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Live WhatsApp Dispatch Screen
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyMessage}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-xs font-medium text-slate-700 shadow-sm transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Message Text</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* WhatsApp Chat Frame */}
                <div className="bg-[#e5ddd5] rounded-2xl border-4 border-slate-700 shadow-lg overflow-hidden flex flex-col">
                  {/* WhatsApp App Header Bar */}
                  <div className="bg-[#075e54] text-white px-4 py-2.5 flex items-center justify-between shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-400/30 border border-emerald-300 flex items-center justify-center font-bold text-xs">
                        α
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">
                          AlphaERP Enterprise Bot
                        </div>
                        <div className="text-[10px] text-emerald-200">
                          Automated Daily KPI Broadcast
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>Verified</span>
                    </div>
                  </div>

                  {/* Message Bubble Area */}
                  <div className="p-4 overflow-y-auto max-h-[460px] space-y-3 font-sans text-xs">
                    {/* Timestamp Tag */}
                    <div className="flex justify-center">
                      <span className="bg-white/80 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] text-slate-600 shadow-xs uppercase font-medium">
                        Yesterday's Business Close ({snapshot.date})
                      </span>
                    </div>

                    {/* WhatsApp Outgoing Message Bubble */}
                    <div className="bg-[#dcf8c6] p-3.5 rounded-xl rounded-tr-none shadow-sm text-slate-900 border border-emerald-200/60 max-w-full whitespace-pre-wrap font-mono text-[11px] leading-relaxed select-text">
                      {snapshot.formattedWhatsAppText}
                      
                      <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-slate-500 font-sans">
                        <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <Check className="w-3 h-3 text-blue-500 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Quick Action & Individual Triggers */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                {/* Auto Trigger Status Card */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      Automation Schedule Status
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      config.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {config.enabled ? '● Active' : '○ Paused'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Auto-scheduled daily at <strong className="text-slate-900">{config.autoTriggerTime} IST</strong> to <strong className="text-slate-900">{config.recipients.filter((r) => r.active).length} executive stakeholders</strong>.
                  </p>
                </div>

                {/* Recipient Trigger Directory */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Trigger by Executive Recipient
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {config.recipients.filter((r) => r.active).length} Active
                    </span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-60 pr-1">
                    {config.recipients.map((recip) => (
                      <div
                        key={recip.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                          recip.active
                            ? 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                            : 'bg-slate-50/50 border-slate-100 opacity-60'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {recip.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                              {recip.designation}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {recip.phone}
                          </div>
                        </div>

                        <button
                          onClick={() => handleTriggerToRecipient(recip)}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 transition-all"
                          title="Open WhatsApp chat for this recipient"
                        >
                          <Send className="w-3 h-3" />
                          Send
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Send to Custom Phone */}
                  <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                    <label className="text-[11px] font-bold text-slate-700">
                      Send to Custom WhatsApp Phone:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="+91 9820011223"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                      <button
                        onClick={handleTriggerCustomPhone}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Trigger
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 6 KEY BUSINESS KPIS BREAKDOWN */}
          {activeTab === 'breakdown' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. New Leads Generated */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      1. New Leads Generated
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                      {snapshot.newLeadsCount} Inquiries
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      {KpiDigestService.formatCurrency(snapshot.newLeadsValue)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Total estimated sales pipeline value
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs pt-1">
                    {snapshot.newLeadsList.slice(0, 3).map((lead) => (
                      <div
                        key={lead.id}
                        className="p-2 rounded bg-slate-50 border border-slate-100 flex justify-between items-center text-[11px]"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{lead.companyName}</span>
                          <span className="text-slate-500 block text-[10px]">
                            {lead.hvacType} • Rep: {lead.repName}
                          </span>
                        </div>
                        <span className="font-semibold text-emerald-700">
                          {KpiDigestService.formatCurrency(lead.estimatedValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Collections of Bill Generated */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      2. Total Bill Collections
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                      {snapshot.collectionEfficiencyPct}% Eff.
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-700">
                      {KpiDigestService.formatCurrency(snapshot.totalCollectionsReceived)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Inflows cleared against {snapshot.invoicesGeneratedCount} generated stage invoices ({KpiDigestService.formatCurrency(snapshot.totalInvoicesGenerated)})
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-[11px]">
                      <span>Collection Efficiency:</span>
                      <span>{snapshot.collectionEfficiencyPct}%</span>
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, snapshot.collectionEfficiencyPct)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 3. Pending Amount Aging Buckets */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      3. Pending Aging Buckets
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                      {snapshot.agingBuckets.totalPendingInvoicesCount} Pending
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      {KpiDigestService.formatCurrency(snapshot.agingBuckets.totalPendingAmount)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Total client receivables outstanding
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center p-1.5 rounded bg-emerald-50 text-emerald-900 font-medium">
                      <span>🟢 0 - 30 Days (Normal):</span>
                      <span className="font-bold">{KpiDigestService.formatCurrency(snapshot.agingBuckets.bucket0to30.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-1.5 rounded bg-yellow-50 text-yellow-900 font-medium">
                      <span>🟡 31 - 60 Days:</span>
                      <span className="font-bold">{KpiDigestService.formatCurrency(snapshot.agingBuckets.bucket31to60.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-1.5 rounded bg-amber-50 text-amber-900 font-medium">
                      <span>🟠 61 - 90 Days:</span>
                      <span className="font-bold">{KpiDigestService.formatCurrency(snapshot.agingBuckets.bucket61to90.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-1.5 rounded bg-red-50 text-red-900 font-medium">
                      <span>🔴 &gt; 90 Days (Critical):</span>
                      <span className="font-bold">{KpiDigestService.formatCurrency(snapshot.agingBuckets.bucketOver90.amount)}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Total Payment Done */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      4. Total Payments Done
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
                      {snapshot.paymentsDisbursedCount} Disbursed
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      {KpiDigestService.formatCurrency(snapshot.totalPaymentsDisbursed)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Outflows to OEM partners and raw material vendors
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-slate-700 text-xs space-y-1">
                    <span className="font-medium text-[11px] block">
                      Reconciled against approved POs: Daikin India, Mandev Copper Tubes, and GI Sheet Fabricators.
                    </span>
                  </div>
                </div>

                {/* 5. Net Business Revenue Generated */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      5. Net Business Revenue
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs">
                      {snapshot.awardedDealsCount} Won Contract
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-indigo-900">
                      {KpiDigestService.formatCurrency(snapshot.netRevenueGenerated)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Net awarded project contracts booked
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>Active High-Margin Pipeline:</span>
                      <span className="font-bold">{KpiDigestService.formatCurrency(snapshot.activePipelineValue)}</span>
                    </div>
                  </div>
                </div>

                {/* 6. Delayed Projects with Reason */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      6. Delayed Projects with Reason
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-xs">
                      {snapshot.delayedProjectsCount} Behind
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-red-700">
                      {snapshot.delayedProjectsCount} Projects
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Active execution lagging baseline completion
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {snapshot.delayedProjects.map((prj) => (
                      <div
                        key={prj.projectId}
                        className="p-2 rounded bg-red-50/70 border border-red-200 text-red-950 text-[11px] space-y-0.5"
                      >
                        <div className="flex justify-between font-bold">
                          <span>{prj.projectNumber}: {prj.projectName}</span>
                          <span className="text-red-700">{prj.delayDays}d Overdue</span>
                        </div>
                        <p className="text-[10px] text-slate-600 italic line-clamp-2">
                          "{prj.delayReason}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DELAYED PROJECTS & REASONS EDITOR */}
          {activeTab === 'delay_editor' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Project Delay Tracking & WhatsApp Reason Manager
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update root-cause reasons and delay days for any project. Updates automatically feed into the daily WhatsApp broadcast.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {projects.map((prj) => {
                  const isEditing = editingDelayId === prj.id;
                  const isPrjDelayed = prj.isDelayed ?? (prj.id === 'prj-002' || prj.id === 'prj-003');
                  const dDays = prj.delayDays || (prj.id === 'prj-002' ? 12 : prj.id === 'prj-003' ? 8 : 0);
                  const reason = prj.delayReason || (prj.id === 'prj-002' ? 'Client site access restricted to night shifts only; pending consultant drawing signoff for acoustic vibration isolators.' : prj.id === 'prj-003' ? 'Civil contractor delayed ceiling reinforcement; awaiting HEPA filter test validation rig delivery from OEM.' : 'On-track with baseline master project schedule.');

                  return (
                    <div key={prj.id} className="py-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {prj.projectNumber} — {prj.projectName}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              isPrjDelayed ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isPrjDelayed ? `⚠️ Delayed by ${dDays} Days` : '✅ On-Track'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Client: <strong className="text-slate-700">{prj.clientName}</strong> • PM: <strong className="text-slate-700">{prj.projectManager}</strong> • Progress: <strong className="text-slate-700">{prj.progressPct}%</strong>
                          </div>
                        </div>

                        {!isEditing && (
                          <button
                            onClick={() => handleStartEditDelay(prj)}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            Edit Delay Reason
                          </button>
                        )}
                      </div>

                      {/* Display or Edit form */}
                      {isEditing ? (
                        <div className="p-4 bg-slate-50 rounded-xl border border-emerald-200 space-y-3 animate-fadeIn">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                Schedule Status:
                              </label>
                              <select
                                value={editingIsDelayed ? 'delayed' : 'ontrack'}
                                onChange={(e) => setEditingIsDelayed(e.target.value === 'delayed')}
                                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                              >
                                <option value="delayed">⚠️ Delayed / Behind Baseline</option>
                                <option value="ontrack">✅ On-Track (No Delay)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                Delay Days:
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={editingDelayDays}
                                onChange={(e) => setEditingDelayDays(Number(e.target.value))}
                                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">
                                Delay Category:
                              </label>
                              <select
                                value={editingDelayCategory}
                                onChange={(e) => setEditingDelayCategory(e.target.value as any)}
                                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                              >
                                <option value="Client Site Clearance">Client Site Clearance</option>
                                <option value="Consultant Drawing Approval">Consultant Drawing Approval</option>
                                <option value="OEM Delivery Delay">OEM Delivery Delay</option>
                                <option value="Civil / Structural Pending">Civil / Structural Pending</option>
                                <option value="Material / PR Hold">Material / PR Hold</option>
                                <option value="Manpower / Labor Shortage">Manpower / Labor Shortage</option>
                                <option value="Payment Milestone Block">Payment Milestone Block</option>
                                <option value="Other">Other Delay</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">
                              Detailed Delay Reason (Appears in WhatsApp Digest):
                            </label>
                            <textarea
                              rows={2}
                              value={editingDelayReason}
                              onChange={(e) => setEditingDelayReason(e.target.value)}
                              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                              placeholder="Describe exact root cause of project delay..."
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingDelayId(null)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveDelayReason(prj.id)}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Save & Update Digest
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-100 text-xs">
                          <span className="font-bold text-slate-700">Root Cause Reason: </span>
                          <span className="text-slate-600 italic font-mono text-[11px]">
                            "{reason}"
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: AUTOMATION & RECIPIENTS SETUP */}
          {activeTab === 'automation_config' && (
            <div className="space-y-6">
              {/* Automation Trigger Settings */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Daily Dispatch Automation Schedule
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure automated daily triggers, broadcast timing, and trigger conditions.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => {
                        const newC = { ...config, enabled: e.target.checked };
                        storageService.updateWhatsAppTriggerConfig(newC);
                        setConfig(newC);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Auto-Trigger Time (IST):
                    </label>
                    <input
                      type="time"
                      value={config.autoTriggerTime}
                      onChange={(e) => {
                        const newC = { ...config, autoTriggerTime: e.target.value };
                        storageService.updateWhatsAppTriggerConfig(newC);
                        setConfig(newC);
                      }}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Trigger on Daily Google Sheets Data Sync:
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoTriggerOnSync}
                        onChange={(e) => {
                          const newC = { ...config, autoTriggerOnSync: e.target.checked };
                          storageService.updateWhatsAppTriggerConfig(newC);
                          setConfig(newC);
                        }}
                        className="rounded text-emerald-600"
                      />
                      <span>Auto-generate and log snapshot on sync completion</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Recipients Manager */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Executive WhatsApp Recipient Matrix
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage stakeholders who receive the automated previous day business KPIs summary.
                    </p>
                  </div>
                </div>

                {/* Recipients Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Active</th>
                        <th className="py-2.5 px-3">Stakeholder Name</th>
                        <th className="py-2.5 px-3">Designation / Role</th>
                        <th className="py-2.5 px-3">WhatsApp Phone</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {config.recipients.map((recip) => (
                        <tr key={recip.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3">
                            <input
                              type="checkbox"
                              checked={recip.active}
                              onChange={() => handleToggleRecipient(recip.id)}
                              className="rounded text-emerald-600 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">
                            {recip.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {recip.designation}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">
                            {recip.phone}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleTriggerToRecipient(recip)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold"
                              >
                                Test Send
                              </button>
                              <button
                                onClick={() => handleDeleteRecipient(recip.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded"
                                title="Remove recipient"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Recipient Form */}
                <form
                  onSubmit={handleAddRecipient}
                  className="pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-2.5 items-end"
                >
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Full Name:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Amit Kapoor"
                      value={newRecipName}
                      onChange={(e) => setNewRecipName(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Designation / Title:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Commercial Director"
                      value={newRecipDesignation}
                      onChange={(e) => setNewRecipDesignation(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      WhatsApp Phone:
                    </label>
                    <input
                      type="text"
                      placeholder="+91 9820011223"
                      value={newRecipPhone}
                      onChange={(e) => setNewRecipPhone(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono"
                      required
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Recipient
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: TRIGGER HISTORY & LOGS */}
          {activeTab === 'history' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Dispatched WhatsApp Trigger History
                  </h3>
                  <p className="text-xs text-slate-500">
                    Audit trail of previous day business KPI snapshots generated and triggered via WhatsApp.
                  </p>
                </div>
              </div>

              {snapshotsHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No dispatch history recorded yet. Trigger your first WhatsApp digest to start the audit log.
                </div>
              ) : (
                <div className="space-y-2">
                  {snapshotsHistory.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            Snapshot: {snap.date}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {snap.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Triggered by: {snap.triggeredBy || 'System Automation'} • Collections: {KpiDigestService.formatCurrency(snap.totalCollectionsReceived)} • Delayed: {snap.delayedProjectsCount} Projects
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-400 font-mono">
                        {snap.triggeredAt ? new Date(snap.triggeredAt).toLocaleString() : snap.generatedAt}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>AlphaERP KPI Auto-Trigger Engine • Ready for Dispatch</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMessage}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>

            <button
              onClick={handleTriggerToAllActive}
              disabled={isTriggering}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isTriggering ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Trigger to WhatsApp Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
