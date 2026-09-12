import React, { useState } from 'react';
import { Plus, Users, Building, Phone, Mail, MapPin, DollarSign, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { Lead, LeadSource, SalesRep, FileAttachment } from '../types';
import { storageService } from '../services/storageService';
import { InsForgeFileUpload } from './InsForgeFileUpload';
import { validateMobile, formatMobileInput, validateEmail, validatePositiveNumber } from '../utils/validation';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesReps: SalesRep[];
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose, salesReps }) => {
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [siteAddress, setSiteAddress] = useState('');
  const [hvacType, setHvacType] = useState<Lead['hvacType']>('VRV / VRF System');
  const [buildingType, setBuildingType] = useState<Lead['buildingType']>('Commercial Office');
  const [estimatedCapacityTR, setEstimatedCapacityTR] = useState<number>(50);
  const [estimatedValue, setEstimatedValue] = useState<number>(2500000);
  const [source, setSource] = useState<LeadSource>('Inbound Call');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [assignedTo, setAssignedTo] = useState(salesReps[0]?.id || 'rep-1');
  const [notes, setNotes] = useState('Client requested immediate site survey for office floor fitout.');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const phoneCheck = validateMobile(phone, true);
  const emailCheck = validateEmail(email, false);
  const capacityCheck = validatePositiveNumber(estimatedCapacityTR, 'Capacity');
  const valueCheck = validatePositiveNumber(estimatedValue, 'Budget');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!companyName.trim()) {
      setFormError('Company or organization name is required.');
      return;
    }
    if (!clientName.trim()) {
      setFormError('Contact person name is required.');
      return;
    }
    if (!phoneCheck.isValid) {
      setFormError(phoneCheck.message || 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!emailCheck.isValid) {
      setFormError(emailCheck.message || 'Please enter a valid email address.');
      return;
    }
    if (!capacityCheck.isValid) {
      setFormError(capacityCheck.message || 'Capacity must be greater than 0.');
      return;
    }
    if (!valueCheck.isValid) {
      setFormError(valueCheck.message || 'Estimated budget must be greater than 0.');
      return;
    }

    const rep = salesReps.find((r) => r.id === assignedTo);

    storageService.addLead({
      companyName: companyName.trim(),
      clientName: clientName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      projectAddress: siteAddress.trim() || `${companyName} Facility, ${city}`,
      hvacType,
      buildingType,
      estimatedCapacityTR: Number(estimatedCapacityTR),
      estimatedValue: Number(estimatedValue),
      source,
      priority,
      assignedTo,
      assignedToName: rep?.name || 'Assigned Rep',
      status: 'New',
      notes,
      attachments
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create New HVAC Lead</h3>
              <p className="text-xs text-slate-500 font-medium">Capture client requirements, tonnage capacity, and project scope.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors">✕</button>
        </div>

        {formError && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Company / Organization *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Global Tech Park"
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Contact Person Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Rajesh Sharma (Head Projects)"
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">Phone / WhatsApp *</label>
                <span className="text-[10px] text-slate-400 font-mono">Max 10 digits</span>
              </div>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(formatMobileInput(e.target.value))}
                placeholder="+91 9876543210"
                className={`w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border font-mono font-medium focus:bg-white focus:ring-2 ${
                  phone && !phoneCheck.isValid ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {phone && !phoneCheck.isValid && (
                <p className="text-[10px] text-rose-600 font-medium mt-1">{phoneCheck.message}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.com"
                className={`w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border font-medium placeholder-slate-400 focus:bg-white focus:ring-2 ${
                  email && !emailCheck.isValid ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              {email && !emailCheck.isValid && (
                <p className="text-[10px] text-rose-600 font-medium mt-1">{emailCheck.message}</p>
              )}
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">City / Region</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">HVAC Solution Type</label>
              <select
                value={hvacType}
                onChange={(e) => setHvacType(e.target.value as any)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="VRV / VRF System">VRV / VRF System</option>
                <option value="Water Cooled Chiller">Water Cooled Chiller</option>
                <option value="Air Cooled Chiller">Air Cooled Chiller</option>
                <option value="Ducted Split System">Ducted Split System</option>
                <option value="Cleanroom AHU & Ducting">Cleanroom AHU & Ducting</option>
                <option value="Ventilation & Exhaust">Ventilation & Exhaust</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Estimated Capacity (TR)</label>
              <input
                type="number"
                value={estimatedCapacityTR}
                onChange={(e) => {
                  const tr = Number(e.target.value);
                  setEstimatedCapacityTR(tr);
                  setEstimatedValue(tr * 45000);
                }}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Estimated Budget (₹)</label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(Number(e.target.value))}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold text-emerald-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Website">Website Inbound</option>
                <option value="WhatsApp">WhatsApp Inbound</option>
                <option value="HVAC Consultant">HVAC Consultant</option>
                <option value="Architect">Architect Referral</option>
                <option value="Referral">Client Referral</option>
                <option value="Trade Expo">Trade Expo / ACREX</option>
                <option value="Inbound Call">Inbound Call</option>
                <option value="Direct Sales">Direct Sales Outreach</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Assign Sales Engineer</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {salesReps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Deal Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Site Address / Project Location</label>
            <input
              type="text"
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              placeholder="Full site location for survey dispatch"
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Initial Project Requirements & Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 p-2.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* InsForge Storage Attachments */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <InsForgeFileUpload
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              bucket="attachments"
              recordTitle={companyName ? `Lead: ${companyName}` : 'New HVAC Lead'}
              description="Attach HVAC drawings, tender BOQ, architectural floor plans, or site survey pictures."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lead & Add to Pipeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
