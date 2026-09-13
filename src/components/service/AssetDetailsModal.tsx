import React, { useState } from 'react';
import {
  Wrench,
  QrCode,
  History,
  Building2,
  Calendar,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  Printer,
  ChevronRight,
  FileText,
  X,
  Plus
} from 'lucide-react';
import { ServiceEquipment, ServiceCustomer, ServiceWorkOrder } from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';

interface AssetDetailsModalProps {
  equipment: ServiceEquipment | null;
  customer?: ServiceCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onAttachQr: (equipment: ServiceEquipment) => void;
  onViewHistory: (equipmentId: string) => void;
  onDispatchService?: (equipment: ServiceEquipment) => void;
  onCreateServiceRequest?: (equipmentId: string) => void;
}

export const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({
  equipment,
  customer,
  isOpen,
  onClose,
  onAttachQr,
  onViewHistory,
  onDispatchService,
  onCreateServiceRequest
}) => {
  if (!isOpen || !equipment) return null;

  const resolvedCustomer = customer || serviceStorage.getCustomers().find((c) => c.id === equipment.customerId);
  const historyEntries = serviceStorage.getAssetServiceHistory(equipment.id);
  const workOrders = serviceStorage.getWorkOrders().filter((w) => w.equipmentId === equipment.id);

  // Status style
  const statusBadge =
    equipment.status === 'Operational'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
      : equipment.status === 'Requires Service'
      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  {equipment.brand} {equipment.capacityTR} TR {equipment.type}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                  {equipment.status}
                </span>
              </div>
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                Serial No: {equipment.serialNumber} • Model: {equipment.modelNumber || 'Standard Industrial'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Quick Action Bar including the prominent 'Attach QR' button */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50/20 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Physical Unit Identification & QR Tag</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Print industrial QR sticker linking mobile cameras directly to this unit's maintenance history timeline.
              </p>
            </div>

            {/* Requested 'Attach QR' button */}
            <button
              id="btn-attach-qr-asset-modal"
              onClick={() => {
                onAttachQr(equipment);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              title="Generate and auto-print a unique QR code sticker linking directly to this unit's maintenance timeline"
            >
              <Printer className="w-4 h-4" />
              <span>Attach QR</span>
            </button>
          </div>

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Cooling Capacity
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                {equipment.capacityTR} TR
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ~{(equipment.capacityTR * 12000).toLocaleString()} BTU/hr
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Refrigerant
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                {equipment.refrigerantType}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                Pre-charged spec
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                AMC Contract
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-slate-100 truncate block">
                {equipment.amcType}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Exp: {equipment.amcExpiry}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Installation Date
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {equipment.installDate || '2024-03-15'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Last: {equipment.lastServicedDate || 'Recent'}
              </span>
            </div>
          </div>

          {/* Facility & Location Details */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Customer & Site Location
              </span>
              {resolvedCustomer && (
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {resolvedCustomer.phone}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                  Client Organization
                </span>
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {equipment.customerName}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                  <span>{resolvedCustomer?.address || 'Site Facility Address'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                  Physical Plant Room / Floor Location
                </span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  {equipment.locationNotes || 'Rooftop HVAC Plant Area'}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Maintenance Timeline Preview */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-teal-600" />
                Maintenance Timeline Records ({historyEntries.length})
              </span>
              <button
                onClick={() => onViewHistory(equipment.id)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Full Timeline</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {historyEntries.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400">
                No previous maintenance entries recorded yet for this unit.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {historyEntries.slice(0, 3).map((hist) => (
                  <div
                    key={hist.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{hist.actionType}</span>
                        <span className="text-[10px] text-slate-400">{hist.actionDate}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{hist.workSummary}</p>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                      {hist.outcomeStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onViewHistory(equipment.id);
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-600 hover:text-white dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold transition-all border border-teal-200 dark:border-teal-800 flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              <span>View History</span>
            </button>

            {/* Attach QR Sticker Action */}
            <button
              onClick={() => {
                onAttachQr(equipment);
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Attach QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
