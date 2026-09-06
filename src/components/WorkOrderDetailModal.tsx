import React, { useState, useRef } from 'react';
import {
  Wrench,
  Printer,
  X,
  FileDown,
  MapPin,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  ShieldCheck,
  Zap,
  Gauge,
  Wind,
  Droplets,
  Star,
  Download,
  Loader2
} from 'lucide-react';
import { WorkOrder, Project } from '../types';
import { downloadElementAsPDF, triggerDirectPrint } from '../utils/pdfExportHelper';

interface WorkOrderDetailModalProps {
  workOrder: WorkOrder;
  project?: Project;
  onClose: () => void;
  onUpdateStatus?: (status: WorkOrder['status']) => void;
}

export const WorkOrderDetailModal: React.FC<WorkOrderDetailModalProps> = ({
  workOrder,
  project,
  onClose,
  onUpdateStatus
}) => {
  const [qaChecks, setQaChecks] = useState([
    { id: 'c1', label: 'Nitrogen Pressure Leakage Hold Test (Held @ 550 PSI for 24 hours)', checked: true, note: 'Zero drop measured on digital manifold' },
    { id: 'c2', label: 'Deep Vacuum Evacuation (Held < 500 microns for 2 hours)', checked: true, note: 'Triple evacuation completed' },
    { id: 'c3', label: 'Additional Refrigerant R-410A / R-32 Mass Added & Logged', checked: true, note: 'Weight scale verified' },
    { id: 'c4', label: '3-Phase Electrical Voltage Balance & Phase Reversal Test', checked: true, note: '415V steady across all phases' },
    { id: 'c5', label: 'Air Balancing (CFM & Static Pressure) across Diffusers', checked: true, note: 'Anemometer log attached' },
    { id: 'c6', label: 'Condensate Gravity Slope & Trap Flow Test', checked: true, note: 'Positive drain flow confirmed' },
    { id: 'c7', label: 'Thermostat Controller & Central BMS Communication', checked: true, note: 'BACnet / Modbus protocol active' }
  ]);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const woPrintRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!woPrintRef.current || !workOrder) return;
    setIsExportingPDF(true);
    try {
      await downloadElementAsPDF(woPrintRef.current, {
        filename: `AlphaERP_WorkOrder_${workOrder.orderNumber}`,
        documentTitle: `AlphaERP Work Order - ${workOrder.orderNumber}`
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrint = () => {
    triggerDirectPrint(woPrintRef.current, `AlphaERP_WorkOrder_${workOrder.orderNumber}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print-container">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-6 flex flex-col print-document">
        
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-3 sticky top-0 bg-white/95 backdrop-blur-sm z-10 no-print">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  Field Work Order: {workOrder.orderNumber}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 shrink-0">
                  {workOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                Site Installation, Pressure Testing & Commissioning Handover Ticket
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              title="Download Work Order PDF"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              title="Print directly"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formatted HVAC Field Work Order & Commissioning Sheet */}
        <div ref={woPrintRef} className="p-5 sm:p-8 space-y-6 font-sans text-xs text-slate-800 bg-white">
          
          {/* Header & Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  α
                </div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                  ALPHA HVAC SOLUTIONS & ENGINEERING SERVICES LTD
                </h1>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium">
                Centralized HVAC, VRF/VRV Heat Recovery, Ducting Fabrication & Chilled Water Commissioning
              </p>
              <p className="text-[10px] text-slate-500">
                GSTIN: 27AABCA1299K1Z4 • CIN: U29190MH2018PLC312984 • 24x7 Support: +91 98200 11223
              </p>
            </div>

            <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200 w-full sm:w-auto">
              <div className="text-[10px] uppercase font-bold text-slate-400">AlphaERP Operations</div>
              <div className="text-sm font-black text-blue-600 font-mono tracking-wide">
                FIELD WORK ORDER & COMMISSIONING
              </div>
              <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">
                WO #: {workOrder.orderNumber}
              </div>
              <div className="text-[11px] text-slate-500">
                Issued: {workOrder.scheduledStartDate} • Target: {workOrder.scheduledEndDate}
              </div>
            </div>
          </div>

          {/* Standardized Structured Report Detail Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 text-xs shadow-xs relative overflow-hidden border-t-3 border-t-blue-600">
            {/* Column 1: Client & Installation Site */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Client & Installation Site:</span>
              </div>
              <div>
                <div className="font-black text-slate-900 text-sm tracking-tight">{workOrder.clientName}</div>
                <div className="text-slate-600 text-[11px] font-medium mt-0.5">
                  Project: <strong className="text-slate-800 font-semibold">{workOrder.projectTitle}</strong>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{workOrder.siteAddress}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Field Personnel & Schedule */}
            <div className="space-y-2 md:border-l md:border-slate-200 md:pl-4">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Field Deployment & Execution Schedule:</span>
              </div>
              <div>
                <div className="font-black text-slate-900 text-sm tracking-tight">{workOrder.assignedTechnician}</div>
                <div className="text-slate-600 text-[11px] font-medium mt-0.5">
                  Service Type: <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{workOrder.serviceType}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Window</span>
                  <span className="font-semibold text-slate-900 font-mono">{workOrder.scheduledStartDate} – {workOrder.scheduledEndDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Execution Status</span>
                  <span className="font-semibold text-slate-900">{workOrder.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment & Engineering Specs */}
          {workOrder.equipmentSpecs && (
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs">
              <div className="font-bold text-blue-900 flex items-center gap-1.5 uppercase text-[10px] tracking-wider mb-1">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                Designated HVAC Equipment & Design Specifications
              </div>
              <div className="font-mono text-slate-800 font-medium">
                {workOrder.equipmentSpecs}
              </div>
            </div>
          )}

          {/* Scope of Work Steps */}
          <div className="space-y-2.5">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
              <span>Step-by-Step Method Statement & Work Protocol</span>
            </div>
            <div className="space-y-2">
              {workOrder.scopeOfWork.map((step, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-start gap-3 text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="text-slate-800 font-medium leading-relaxed">{step}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Commissioning & Quality Assurance Checklist */}
          <div className="space-y-2.5 pt-2">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Mandatory Commissioning & Quality Acceptance Checklist</span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-12 text-center">Status</th>
                    <th className="p-2.5">Test / Inspection Parameter</th>
                    <th className="p-2.5">Field Measurement & Compliance Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {qaChecks.map((check) => (
                    <tr key={check.id} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      </td>
                      <td className="p-2.5 font-medium text-slate-900">{check.label}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600">{check.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Client Handover Signoff Box */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Site Acceptance & Handover Authorization
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-6">
                <div className="text-xs text-slate-600">
                  <strong>HVAC Field Engineer Sign-Off:</strong>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Certified that all piping, brazing, evacuation, and air delivery checks comply with ASHRAE / ISHRAE standards.
                  </p>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-2 flex justify-between items-end">
                  <div>
                    <div className="font-bold text-slate-900">{workOrder.assignedTechnician}</div>
                    <div className="text-[10px] text-slate-500">Lead Field Engineer Signature</div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Date: ____________</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-xs text-slate-600">
                  <strong>Client / Facility Manager Acceptance:</strong>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Confirmed that installation and cooling/airflow parameters were demonstrated to satisfaction.
                  </p>
                </div>
                <div className="border-t border-dashed border-slate-400 pt-2 flex justify-between items-end">
                  <div>
                    <div className="font-bold text-slate-900">
                      {workOrder.completionSignoff?.signedBy || workOrder.clientName}
                    </div>
                    <div className="text-[10px] text-slate-500">Authorized Client Representative</div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Date: {workOrder.completionSignoff?.signatureDate || '____________'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-400 text-center leading-relaxed">
            This document serves as an official technical work record and test certificate for AlphaERP.
            Keep a signed copy at site for warranty validation and AMC coverage.
          </div>
        </div>

        {/* Bottom Actions (Hidden in Print) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
          >
            Close
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
