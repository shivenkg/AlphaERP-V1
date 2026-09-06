import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  FileText,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { Lead, Quote, LeadStatus } from '../types';
import { storageService } from '../services/storageService';
import { CommunicationService } from '../services/whatsappEmailService';

interface LeadDetailModalProps {
  lead: Lead | null;
  quotes: Quote[];
  isOpen: boolean;
  onClose: () => void;
  onCreateQuote: (lead: Lead) => void;
  onAwardLead: (lead: Lead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  quotes,
  isOpen,
  onClose,
  onCreateQuote,
  onAwardLead
}) => {
  const [newFollowUpDate, setNewFollowUpDate] = useState<string>(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newFollowUpType, setNewFollowUpType] = useState<string>('Site Survey & Technical Review');
  const [newFollowUpNote, setNewFollowUpNote] = useState<string>('Confirm duct routing with site MEP consultant');

  if (!isOpen || !lead) return null;

  const linkedQuotes = quotes.filter((q) => lead.quoteIds?.includes(q.id) || q.leadId === lead.id);

  const handleAddFollowUp = () => {
    if (!newFollowUpNote) return;
    storageService.addLeadFollowUp(lead.id, {
      date: newFollowUpDate,
      type: 'Site Visit',
      notes: `${newFollowUpType}: ${newFollowUpNote}`
    });
    setNewFollowUpNote('');
  };

  const handleToggleFollowUp = (fuId: string) => {
    storageService.markFollowUpCompleted(lead.id, fuId);
  };

  const handleSendWhatsApp = () => {
    const { message } = CommunicationService.getLeadNurtureTemplate(lead);
    const url = CommunicationService.getWhatsAppUrl(lead.phone, message);
    storageService.logLeadCommunication(lead.id, 'WhatsApp', `Sent follow-up via WhatsApp`);
    window.open(url, '_blank');
  };

  const handleSendEmail = () => {
    const { subject, message } = CommunicationService.getLeadNurtureTemplate(lead);
    const url = CommunicationService.getMailtoUrl(lead.email, subject, message);
    storageService.logLeadCommunication(lead.id, 'Email', `Sent email: "${subject}"`);
    window.open(url, '_blank');
  };

  const PIPELINE_STAGES: Array<{ id: LeadStatus; label: string; step: number }> = [
    { id: 'New', label: '1. New Lead', step: 1 },
    { id: 'Site Survey Scheduled', label: '2. Site Survey', step: 2 },
    { id: 'Quote Sent', label: '3. Quote Sent', step: 3 },
    { id: 'Negotiation', label: '4. Negotiation', step: 4 },
    { id: 'Awarded', label: '5. Awarded', step: 5 }
  ];

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

  const nextStage = getNextStage(lead.status);

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (newStatus === 'Awarded') {
      onAwardLead(lead);
      onClose();
    } else {
      storageService.updateLead(lead.id, { status: newStatus });
    }
  };

  const handleAdvanceNextStage = () => {
    if (!nextStage) return;
    handleStatusChange(nextStage);
  };

  const isStageActiveOrPassed = (stageId: LeadStatus) => {
    const stageOrder: Record<string, number> = {
      'New': 1,
      'Site Survey Scheduled': 2,
      'Site Survey Completed': 2,
      'Quote Sent': 3,
      'Negotiation': 4,
      'Awarded': 5,
      'Lost': 0
    };
    return (stageOrder[lead.status] || 0) >= (stageOrder[stageId] || 0);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 shadow-xs">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{lead.leadNumber}</span>
                <h3 className="text-base font-bold text-slate-900">{lead.companyName}</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">{lead.clientName} • {lead.city}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors">✕</button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Interactive Pipeline Stage Stepper */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Pipeline Lifecycle Progression
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Current: {lead.status}
              </span>
            </div>

            {/* Stage Progression Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {PIPELINE_STAGES.map((s) => {
                const isCurrent = lead.status === s.id || (s.id === 'Site Survey Scheduled' && lead.status === 'Site Survey Completed');
                const isPassed = isStageActiveOrPassed(s.id);

                return (
                  <button
                    key={s.id}
                    onClick={() => handleStatusChange(s.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all border flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300'
                        : isPassed
                        ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] opacity-75">Step {s.step}</span>
                    <span className="truncate">{s.label.split('. ')[1]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="bg-white text-blue-700 font-bold px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
              >
                <option value="New">1. New Lead</option>
                <option value="Site Survey Scheduled">2. Site Survey Scheduled</option>
                <option value="Site Survey Completed">2. Site Survey Completed</option>
                <option value="Quote Sent">3. Quote Sent</option>
                <option value="Negotiation">4. Negotiation</option>
                <option value="Awarded">5. Awarded (Won 🎉)</option>
                <option value="Lost">Lost Opportunity</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {nextStage && lead.status !== 'Awarded' && (
                <button
                  onClick={handleAdvanceNextStage}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  <span>Advance to {nextStage}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleSendWhatsApp}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-xs transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleSendEmail}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
              {lead.status !== 'Awarded' && (
                <button
                  onClick={() => {
                    onAwardLead(lead);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Award Contract</span>
                </button>
              )}
            </div>
          </div>

          {/* Technical Scope Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">HVAC Scope</span>
              <div className="font-semibold text-slate-900 mt-0.5">{lead.hvacType}</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Tonnage Capacity</span>
              <div className="font-bold text-blue-600 mt-0.5 font-mono">{lead.estimatedCapacityTR} TR</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Budget Estimate</span>
              <div className="font-bold text-emerald-600 mt-0.5 font-mono">₹{(lead.estimatedValue / 100000).toFixed(2)} L</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Assigned Engineer</span>
              <div className="font-semibold text-slate-900 mt-0.5">{lead.assignedToName}</div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Site & Contact Info</div>
            <div className="text-slate-700 font-medium">Phone / WhatsApp: <strong className="text-slate-900 font-semibold">{lead.phone}</strong></div>
            <div className="text-slate-700 font-medium">Email: <strong className="text-slate-900 font-semibold">{lead.email || 'N/A'}</strong></div>
            <div className="text-slate-700 font-medium">Site Address: <strong className="text-slate-900 font-semibold">{lead.siteAddress}</strong></div>
            {lead.notes && <div className="text-slate-500 text-[11px] pt-1 font-normal">Notes: {lead.notes}</div>}
          </div>

          {/* Linked Quotes Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                Linked Techno-Commercial Quotes ({linkedQuotes.length})
              </span>
              <button
                onClick={() => {
                  onCreateQuote(lead);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-slate-50 text-blue-600 rounded-xl font-bold text-xs border border-slate-200 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Quote</span>
              </button>
            </div>

            {linkedQuotes.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400 font-medium">
                No quotations created yet for this lead.
              </div>
            ) : (
              linkedQuotes.map((q) => (
                <div key={q.id} className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="font-mono font-bold text-blue-600">{q.quoteNumber}</span>
                    <div className="text-slate-900 font-semibold">{q.projectTitle}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 font-mono">₹{(q.totalAmount / 100000).toFixed(2)} Lakhs</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">{q.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Follow-up Tasks */}
          <div className="space-y-3">
            <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Follow-up Reminders & Schedule
            </span>

            <div className="space-y-2">
              {lead.followUps.map((fu) => (
                <div
                  key={fu.id}
                  onClick={() => handleToggleFollowUp(fu.id)}
                  className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={fu.completed}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className={`font-semibold ${fu.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {fu.type}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">{fu.notes}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {fu.date}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Follow-up task form */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-700">Schedule Next Action / Follow-up:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="date"
                  value={newFollowUpDate}
                  onChange={(e) => setNewFollowUpDate(e.target.value)}
                  className="bg-white text-slate-900 p-2 rounded-xl border border-slate-200 font-medium text-xs focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newFollowUpType}
                  onChange={(e) => setNewFollowUpType(e.target.value)}
                  placeholder="Task type"
                  className="bg-white text-slate-900 p-2 rounded-xl border border-slate-200 font-medium text-xs focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
                <input
                  type="text"
                  value={newFollowUpNote}
                  onChange={(e) => setNewFollowUpNote(e.target.value)}
                  placeholder="Notes / instructions"
                  className="bg-white text-slate-900 p-2 rounded-xl border border-slate-200 font-medium text-xs focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleAddFollowUp}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                >
                  Save Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
