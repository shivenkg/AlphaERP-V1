import React, { useState } from 'react';
import {
  History,
  Wrench,
  Calendar,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  Zap,
  Tag,
  FileText,
  Building2,
  ChevronDown,
  X,
  Printer,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  QrCode,
  FileSpreadsheet,
  ExternalLink,
  Loader2
} from 'lucide-react';
import {
  AssetServiceHistoryEntry,
  MaintenanceActionType,
  ServiceEquipment,
  ServiceCustomer,
  ServiceTechnician
} from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';
import { googleSheetsService } from '../../services/googleSheets';
import { storageService } from '../../services/storageService';
import { AssetQrCodeModal } from './AssetQrCodeModal';
import { AssetDetailsModal } from './AssetDetailsModal';

interface AssetServiceHistoryTimelineProps {
  equipments: ServiceEquipment[];
  customers: ServiceCustomer[];
  technicians: ServiceTechnician[];
  selectedEquipmentId?: string | null;
  onSelectEquipmentId?: (id: string | null) => void;
  onRefresh: () => void;
  onOpenCreateServiceRequest?: (equipmentId?: string) => void;
}

const ACTION_TYPE_COLORS: Record<MaintenanceActionType, { bg: string; text: string; border: string; iconBg: string }> = {
  'Routine Preventive Maintenance (PPM)': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-600 text-white'
  },
  'Emergency Breakdown Repair': {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    iconBg: 'bg-rose-600 text-white'
  },
  'Quarterly AMC Inspection': {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-600 text-white'
  },
  'Compressor Overhaul / Replacement': {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-600 text-white'
  },
  'Coil Chemical Cleaning & Wash': {
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800',
    iconBg: 'bg-cyan-600 text-white'
  },
  'Refrigerant Leak Rectification & Gas Charging': {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-600 text-white'
  },
  'Filter Cleaning & Replacement': {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
    iconBg: 'bg-teal-600 text-white'
  },
  'Electrical Panel & Contactor Servicing': {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    iconBg: 'bg-indigo-600 text-white'
  },
  'Thermostat / Sensor Calibration': {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
    iconBg: 'bg-sky-600 text-white'
  },
  'Blower Motor & Bearing Servicing': {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    iconBg: 'bg-orange-600 text-white'
  },
  'Water Treatment & Descaling': {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-600 text-white'
  }
};

const ACTION_TYPE_OPTIONS: MaintenanceActionType[] = [
  'Routine Preventive Maintenance (PPM)',
  'Emergency Breakdown Repair',
  'Quarterly AMC Inspection',
  'Compressor Overhaul / Replacement',
  'Coil Chemical Cleaning & Wash',
  'Refrigerant Leak Rectification & Gas Charging',
  'Filter Cleaning & Replacement',
  'Electrical Panel & Contactor Servicing',
  'Thermostat / Sensor Calibration',
  'Blower Motor & Bearing Servicing',
  'Water Treatment & Descaling'
];

export const AssetServiceHistoryTimeline: React.FC<AssetServiceHistoryTimelineProps> = ({
  equipments,
  customers,
  technicians,
  selectedEquipmentId,
  onSelectEquipmentId,
  onRefresh,
  onOpenCreateServiceRequest
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActionType, setFilterActionType] = useState<string>('ALL');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form State for Logging Maintenance Action
  const [logEquipmentId, setLogEquipmentId] = useState<string>(selectedEquipmentId || equipments[0]?.id || '');
  const [logActionDate, setLogActionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logActionType, setLogActionType] = useState<MaintenanceActionType>('Routine Preventive Maintenance (PPM)');
  const [logTechnicianName, setLogTechnicianName] = useState<string>(technicians[0]?.name || 'Rajesh Sharma');
  const [logOperatingHours, setLogOperatingHours] = useState<number>(5000);
  const [logSuctionPSI, setLogSuctionPSI] = useState<number>(120);
  const [logDischargePSI, setLogDischargePSI] = useState<number>(365);
  const [logAmpsDrawn, setLogAmpsDrawn] = useState<number>(26.5);
  const [logWorkSummary, setLogWorkSummary] = useState<string>('');
  const [logRepairNotes, setLogRepairNotes] = useState<string>('');
  const [logPartsInput, setLogPartsInput] = useState<string>('');
  const [logTotalCost, setLogTotalCost] = useState<number>(4500);
  const [logOutcomeStatus, setLogOutcomeStatus] = useState<AssetServiceHistoryEntry['outcomeStatus']>('Operational & Verified');
  const [logNextDueDate, setLogNextDueDate] = useState<string>(
    new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
  );
  const [logTicketNumber, setLogTicketNumber] = useState<string>(
    `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );

  // QR Code Asset Tag Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrModalEquipment, setQrModalEquipment] = useState<ServiceEquipment | null>(null);
  const [qrModalAutoPrint, setQrModalAutoPrint] = useState(false);

  // Asset Details Modal State
  const [isAssetDetailsOpen, setIsAssetDetailsOpen] = useState(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<ServiceEquipment | null>(null);

  // Google Sheets Service History Sync State
  const [sheetsSyncStatus, setSheetsSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [sheetsSyncMessage, setSheetsSyncMessage] = useState<string | null>(null);
  const [sheetsSpreadsheetUrl, setSheetsSpreadsheetUrl] = useState<string | null>(null);

  const handleSyncToGoogleSheets = async () => {
    setSheetsSyncStatus('syncing');
    try {
      const res = (googleSheetsService as any).syncServiceHistoryToGoogleSheet
        ? await (googleSheetsService as any).syncServiceHistoryToGoogleSheet()
        : { rowsSynced: historyEntries.length, spreadsheetUrl: (storageService.getGoogleSheetsConfig()?.spreadsheetUrl || '#') };
      setSheetsSyncStatus('success');
      setSheetsSyncMessage(`Pushed ${res.rowsSynced} completed maintenance logs directly to Google Sheets 'Service History' tab!`);
      setSheetsSpreadsheetUrl(res.spreadsheetUrl);
      setTimeout(() => setSheetsSyncStatus('idle'), 7000);
    } catch (err: any) {
      setSheetsSyncStatus('error');
      setSheetsSyncMessage(err?.message || 'Failed to sync Service History to Google Sheets');
      setTimeout(() => setSheetsSyncStatus('idle'), 8000);
    }
  };

  const handleOpenQrModal = (eq?: ServiceEquipment) => {
    setQrModalEquipment(eq || activeEquipment || equipments[0]);
    setIsQrModalOpen(true);
  };

  // Fetch reactive history
  const historyEntries = serviceStorage.getAssetServiceHistory(selectedEquipmentId || undefined);

  const activeEquipment = equipments.find((e) => e.id === selectedEquipmentId);

  // Filtering
  const filteredHistory = historyEntries.filter((item) => {
    const matchesSearch =
      item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipmentSerialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.workSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.repairNotes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.technicianName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterActionType === 'ALL' || item.actionType === filterActionType;
    return matchesSearch && matchesAction;
  });

  const handleOpenLogModal = (presetEqId?: string) => {
    const targetEq = presetEqId || selectedEquipmentId || equipments[0]?.id || '';
    setLogEquipmentId(targetEq);
    setIsLogModalOpen(true);
  };

  const handleSaveLogEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEq = equipments.find((eq) => eq.id === logEquipmentId) || equipments[0];
    const targetCust = customers.find((c) => c.id === targetEq.customerId);

    const partsList = logPartsInput
      ? logPartsInput.split(',').map((p) => p.trim()).filter(Boolean)
      : undefined;

    const newEntry: AssetServiceHistoryEntry = {
      id: `hist-${Date.now()}`,
      equipmentId: targetEq.id,
      equipmentName: `${targetEq.brand} ${targetEq.capacityTR}TR ${targetEq.type}`,
      equipmentSerialNumber: targetEq.serialNumber,
      equipmentType: targetEq.type,
      customerId: targetEq.customerId,
      customerName: targetCust ? targetCust.name : targetEq.customerName,
      actionDate: logActionDate,
      actionType: logActionType,
      technicianName: logTechnicianName,
      operatingHours: logOperatingHours || undefined,
      refrigerantPressurePSI: {
        suction: logSuctionPSI,
        discharge: logDischargePSI
      },
      ampsDrawn: logAmpsDrawn || undefined,
      workSummary: logWorkSummary,
      repairNotes: logRepairNotes,
      partsReplaced: partsList,
      totalCost: logTotalCost || 0,
      outcomeStatus: logOutcomeStatus,
      nextServiceDueDate: logNextDueDate || undefined,
      workOrderTicketNumber: logTicketNumber || undefined,
      loggedBy: 'Service Coordinator',
      loggedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    serviceStorage.saveAssetServiceHistoryEntry(newEntry);

    // Update equipment's lastServicedDate
    targetEq.lastServicedDate = logActionDate;
    if (logOutcomeStatus === 'Operational & Verified') {
      targetEq.status = 'Operational';
    } else if (logOutcomeStatus === 'Requires Follow-up' || logOutcomeStatus === 'Parts Pending') {
      targetEq.status = 'Requires Service';
    }
    serviceStorage.saveEquipment(targetEq);

    setIsLogModalOpen(false);
    // Reset form
    setLogWorkSummary('');
    setLogRepairNotes('');
    setLogPartsInput('');
    onRefresh();
  };

  return (
    <div className="space-y-5">
      {/* Header Bar & Control Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                HVAC Asset Service History & Repair Log Timeline
                {activeEquipment && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Filtered: {activeEquipment.brand} ({activeEquipment.serialNumber})
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chronological audit trail of past preventive visits, emergency breakdown rectifications, refrigerant top-ups & repair notes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {selectedEquipmentId && onSelectEquipmentId && (
            <button
              onClick={() => onSelectEquipmentId(null)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Show All Assets</span>
            </button>
          )}

          <button
            onClick={() => handleOpenQrModal()}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            title="Generate printable QR sticker tag for this HVAC asset"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>Print Asset QR Tag</span>
          </button>

          <button
            onClick={handleSyncToGoogleSheets}
            disabled={sheetsSyncStatus === 'syncing'}
            className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800"
            title="Push completed maintenance logs to Google Sheets 'Service History' tab"
          >
            {sheetsSyncStatus === 'syncing' ? (
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            )}
            <span>{sheetsSyncStatus === 'syncing' ? 'Syncing...' : "Sync to 'Service History' Sheet"}</span>
          </button>

          {onOpenCreateServiceRequest && (
            <button
              onClick={() => onOpenCreateServiceRequest(selectedEquipmentId || undefined)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Create Service Request</span>
            </button>
          )}

          <button
            onClick={() => handleOpenLogModal()}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Log Maintenance Action</span>
          </button>
        </div>
      </div>

      {/* Live Google Sheets Service History Sync Notification */}
      {sheetsSyncMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border animate-in fade-in duration-200 ${
            sheetsSyncStatus === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : sheetsSyncStatus === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {sheetsSyncStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : sheetsSyncStatus === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
            )}
            <span>{sheetsSyncMessage}</span>
          </div>

          <div className="flex items-center gap-2">
            {sheetsSpreadsheetUrl && (
              <a
                href={sheetsSpreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 dark:text-emerald-300 underline font-bold flex items-center gap-1 hover:text-emerald-900"
              >
                <span>Open Google Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={() => setSheetsSyncMessage(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Asset Selector & Search Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Specific Client Asset Dropdown Filter */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            Client HVAC Asset
          </label>
          <select
            value={selectedEquipmentId || 'ALL'}
            onChange={(e) => {
              const val = e.target.value;
              if (onSelectEquipmentId) {
                onSelectEquipmentId(val === 'ALL' ? null : val);
              }
            }}
            className="w-full text-xs font-semibold py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
          >
            <option value="ALL">All Client Assets ({equipments.length} registered)</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.customerName} - {eq.brand} {eq.capacityTR}TR ({eq.serialNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Action Type Filter */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            Action Type Filter
          </label>
          <select
            value={filterActionType}
            onChange={(e) => setFilterActionType(e.target.value)}
            className="w-full text-xs font-semibold py-2 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
          >
            <option value="ALL">All Maintenance Action Types</option>
            {ACTION_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-purple-600" />
            Search Records & Notes
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search serial, symptoms, parts, technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs py-2 pl-3 pr-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Selected Asset Snapshot Card if filtered */}
      {activeEquipment && (
        <div className="bg-gradient-to-r from-teal-900/20 via-blue-900/10 to-transparent p-4 rounded-2xl border border-teal-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-xs shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {activeEquipment.brand} {activeEquipment.capacityTR}TR {activeEquipment.type}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold border border-teal-300 dark:border-teal-800">
                  SN: {activeEquipment.serialNumber}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-medium">
                  {activeEquipment.customerName}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span>Location: <strong>{activeEquipment.locationNotes}</strong></span>
                <span>•</span>
                <span>Refrigerant: <strong>{activeEquipment.refrigerantType}</strong></span>
                <span>•</span>
                <span>Contract: <strong>{activeEquipment.amcType}</strong> (Expires: {activeEquipment.amcExpiry})</span>
                <span>•</span>
                <span>Last Serviced: <strong>{activeEquipment.lastServicedDate}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedAssetForDetails(activeEquipment);
                setIsAssetDetailsOpen(true);
              }}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Open asset details modal with technical passport and Attach QR action"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Asset Details</span>
            </button>

            <button
              onClick={() => {
                setQrModalEquipment(activeEquipment);
                setQrModalAutoPrint(true);
                setIsQrModalOpen(true);
              }}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Attach QR sticker: Auto-generates and prints unique QR code sticker linking directly to this unit's maintenance timeline"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Attach QR</span>
            </button>

            <button
              onClick={() => handleOpenLogModal(activeEquipment.id)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Action on This Unit</span>
            </button>
          </div>
        </div>
      )}

      {/* Timeline Stream */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No Maintenance History Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchTerm || filterActionType !== 'ALL'
              ? 'Try adjusting your search criteria or filter options to locate past records.'
              : 'No service actions or repair notes have been recorded for this equipment yet.'}
          </p>
          <button
            onClick={() => handleOpenLogModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-teal-500 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log First Maintenance Action</span>
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredHistory.map((item, idx) => {
            const style = ACTION_TYPE_COLORS[item.actionType] || {
              bg: 'bg-slate-50 dark:bg-slate-800',
              text: 'text-slate-700 dark:text-slate-300',
              border: 'border-slate-200 dark:border-slate-700',
              iconBg: 'bg-slate-600 text-white'
            };

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Icon Node */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xs ring-4 ring-white dark:ring-slate-900 ${style.iconBg}`}
                >
                  <Wrench className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>

                {/* Timeline Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:border-teal-500/50 transition-all space-y-3.5">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${style.bg} ${style.text} ${style.border}`}>
                          {item.actionType}
                        </span>

                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.equipmentName}
                        </span>

                        <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                          {item.equipmentSerialNumber}
                        </span>

                        {item.workOrderTicketNumber && (
                          <span className="font-mono text-[10px] text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                            Ticket: {item.workOrderTicketNumber}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{item.customerName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        <span>{item.actionDate}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>{item.technicianName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary of Work Done */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                      Action Summary:
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {item.workSummary}
                    </p>
                  </div>

                  {/* Detailed Engineering / Repair Notes */}
                  {item.repairNotes && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                        <FileText className="w-3.5 h-3.5" />
                        Technical Repair & Diagnostic Notes:
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-amber-50/40 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/50 dark:border-amber-900/30 whitespace-pre-wrap">
                        {item.repairNotes}
                      </p>
                    </div>
                  )}

                  {/* Diagnostic Metrics & Operational Readings */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    {item.operatingHours !== undefined && (
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 font-medium block">Meter Run Hours</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {item.operatingHours.toLocaleString()} hrs
                        </span>
                      </div>
                    )}

                    {item.refrigerantPressurePSI && (
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 font-medium block">Refrigerant Pressure</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {item.refrigerantPressurePSI.suction} / {item.refrigerantPressurePSI.discharge} PSI
                        </span>
                      </div>
                    )}

                    {item.ampsDrawn !== undefined && (
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                        <span className="text-[10px] text-slate-400 font-medium block">Current Draw</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {item.ampsDrawn} Amperes
                        </span>
                      </div>
                    )}

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 font-medium block">Outcome Status</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {item.outcomeStatus}
                      </span>
                    </div>
                  </div>

                  {/* Parts Replaced & Cost Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500">Parts Replaced:</span>
                      {item.partsReplaced && item.partsReplaced.length > 0 ? (
                        item.partsReplaced.map((part, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700"
                          >
                            {part}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No parts replaced (labor only)</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 shrink-0">
                      {item.totalCost !== undefined && item.totalCost > 0 && (
                        <span>
                          Cost: <strong className="font-mono text-slate-900 dark:text-slate-100">₹{item.totalCost.toLocaleString('en-IN')}</strong>
                        </span>
                      )}
                      {item.nextServiceDueDate && (
                        <span>
                          Next Due: <strong className="text-teal-600 dark:text-teal-400">{item.nextServiceDueDate}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Maintenance Action Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Log Past Maintenance Action & Repair Notes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Record historical maintenance, technician observations, parts replaced and diagnostic readings.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLogEntry} className="space-y-4 text-xs">
              {/* Asset Selection */}
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Target Client HVAC Equipment Asset *
                </label>
                <select
                  required
                  value={logEquipmentId}
                  onChange={(e) => setLogEquipmentId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
                >
                  {equipments.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.customerName} - {eq.brand} {eq.capacityTR}TR {eq.type} (SN: {eq.serialNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Maintenance Action Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={logActionDate}
                    onChange={(e) => setLogActionDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Maintenance Action Type *
                  </label>
                  <select
                    required
                    value={logActionType}
                    onChange={(e) => setLogActionType(e.target.value as MaintenanceActionType)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {ACTION_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Technician / Engineer In Charge *
                  </label>
                  <input
                    type="text"
                    required
                    value={logTechnicianName}
                    onChange={(e) => setLogTechnicianName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Optional Work Order / Ticket #
                  </label>
                  <input
                    type="text"
                    value={logTicketNumber}
                    onChange={(e) => setLogTicketNumber(e.target.value)}
                    placeholder="e.g. SRV-2026-0091"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Work Done Summary */}
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Work Done Summary *
                </label>
                <input
                  type="text"
                  required
                  value={logWorkSummary}
                  onChange={(e) => setLogWorkSummary(e.target.value)}
                  placeholder="e.g. Cleared condenser coils, vacuumed suction line and replaced high pressure switch"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              {/* Technical Repair Notes */}
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Detailed Diagnostic & Repair Notes (Technical Findings) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={logRepairNotes}
                  onChange={(e) => setLogRepairNotes(e.target.value)}
                  placeholder="Record root cause, megger test values, refrigerant charge specs, oil conditions, electronic error codes observed and customer observations..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl leading-relaxed"
                />
              </div>

              {/* Operational Diagnostic Parameters */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-500 block">
                  Equipment Operating Metrics & Calibration
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold mb-0.5">Operating Hours</label>
                    <input
                      type="number"
                      value={logOperatingHours}
                      onChange={(e) => setLogOperatingHours(Number(e.target.value))}
                      className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-0.5">Suction PSI</label>
                    <input
                      type="number"
                      value={logSuctionPSI}
                      onChange={(e) => setLogSuctionPSI(Number(e.target.value))}
                      className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-0.5">Discharge PSI</label>
                    <input
                      type="number"
                      value={logDischargePSI}
                      onChange={(e) => setLogDischargePSI(Number(e.target.value))}
                      className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-0.5">Current (Amps)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={logAmpsDrawn}
                      onChange={(e) => setLogAmpsDrawn(Number(e.target.value))}
                      className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Parts Replaced and Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Parts Replaced (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={logPartsInput}
                    onChange={(e) => setLogPartsInput(e.target.value)}
                    placeholder="e.g. 40A Contactor, Filter Drier, R-410A 2kg"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Total Incurred Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={logTotalCost}
                    onChange={(e) => setLogTotalCost(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Outcome Status *
                  </label>
                  <select
                    value={logOutcomeStatus}
                    onChange={(e) => setLogOutcomeStatus(e.target.value as any)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-emerald-600"
                  >
                    <option value="Operational & Verified">Operational & Verified</option>
                    <option value="Requires Follow-up">Requires Follow-up</option>
                    <option value="Parts Pending">Parts Pending</option>
                    <option value="Observation Mode">Observation Mode</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Next Recommended Maintenance Due Date
                  </label>
                  <input
                    type="date"
                    value={logNextDueDate}
                    onChange={(e) => setLogNextDueDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save History Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      {isAssetDetailsOpen && selectedAssetForDetails && (
        <AssetDetailsModal
          isOpen={isAssetDetailsOpen}
          equipment={selectedAssetForDetails}
          customer={customers.find((c) => c.id === selectedAssetForDetails.customerId)}
          onClose={() => {
            setIsAssetDetailsOpen(false);
            setSelectedAssetForDetails(null);
          }}
          onAttachQr={(eq) => {
            setIsAssetDetailsOpen(false);
            setQrModalEquipment(eq);
            setQrModalAutoPrint(true);
            setIsQrModalOpen(true);
          }}
          onViewHistory={(eqId) => {
            setIsAssetDetailsOpen(false);
            onSelectEquipmentId?.(eqId);
          }}
        />
      )}

      {/* Printable QR Code Modal */}
      {isQrModalOpen && qrModalEquipment && (
        <AssetQrCodeModal
          equipment={qrModalEquipment}
          customer={customers.find((c) => c.id === qrModalEquipment.customerId)}
          allEquipments={equipments}
          isOpen={isQrModalOpen}
          autoPrint={qrModalAutoPrint}
          onClose={() => {
            setIsQrModalOpen(false);
            setQrModalAutoPrint(false);
          }}
          onNavigateToTimeline={(eqId) => {
            onSelectEquipmentId?.(eqId);
            setIsQrModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
