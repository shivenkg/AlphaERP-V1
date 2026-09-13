import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  ExternalLink,
  X,
  Wrench,
  ShieldCheck,
  Building2,
  Layers,
  Sparkles
} from 'lucide-react';
import { ServiceEquipment, ServiceCustomer } from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';

interface AssetQrCodeModalProps {
  equipment: ServiceEquipment;
  customer?: ServiceCustomer;
  allEquipments?: ServiceEquipment[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTimeline?: (equipmentId: string) => void;
  autoPrint?: boolean;
}

export const AssetQrCodeModal: React.FC<AssetQrCodeModalProps> = ({
  equipment,
  customer,
  allEquipments = [],
  isOpen,
  onClose,
  onNavigateToTimeline,
  autoPrint = false
}) => {
  const [selectedEq, setSelectedEq] = useState<ServiceEquipment>(equipment);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchQrCodes, setBatchQrCodes] = useState<{ eq: ServiceEquipment; qrUrl: string }[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  const hasAutoPrintedRef = useRef<boolean>(false);

  useEffect(() => {
    setSelectedEq(equipment);
    hasAutoPrintedRef.current = false;
  }, [equipment, isOpen]);

  // Construct target scan URL
  const getScanUrl = (eq: ServiceEquipment) => {
    return `${window.location.origin}${window.location.pathname}#asset-history?id=${eq.id}`;
  };

  const currentScanUrl = getScanUrl(selectedEq);

  // Generate QR code data URL
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    QRCode.toDataURL(currentScanUrl, {
      width: 400,
      margin: 1,
      color: {
        dark: '#0a1438',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          // If autoPrint requested, trigger window.print() once QR image is ready
          if (autoPrint && !hasAutoPrintedRef.current) {
            hasAutoPrintedRef.current = true;
            setTimeout(() => {
              window.print();
            }, 300);
          }
        }
      })
      .catch((err) => console.error('Failed to generate asset QR code:', err));

    return () => {
      isMounted = false;
    };
  }, [currentScanUrl, isOpen, autoPrint]);

  // Generate batch QR codes if batch mode toggled
  useEffect(() => {
    if (!batchMode || allEquipments.length === 0) return;

    let isMounted = true;
    Promise.all(
      allEquipments.map(async (eq) => {
        const url = await QRCode.toDataURL(getScanUrl(eq), {
          width: 250,
          margin: 1,
          color: { dark: '#0a1438', light: '#ffffff' },
          errorCorrectionLevel: 'M'
        });
        return { eq, qrUrl: url };
      })
    ).then((results) => {
      if (isMounted) setBatchQrCodes(results);
    });

    return () => {
      isMounted = false;
    };
  }, [batchMode, allEquipments]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentScanUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-Tag-${selectedEq.brand}-${selectedEq.serialNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSimulateScan = () => {
    onClose();
    if (onNavigateToTimeline) {
      onNavigateToTimeline(selectedEq.id);
    } else {
      window.location.hash = `asset-history?id=${selectedEq.id}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      {/* Hidden Print Styling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-qr-tag-area, #printable-qr-tag-area * {
            visibility: visible;
          }
          #printable-qr-tag-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Printable HVAC Asset Passport & QR Tag
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Industrial equipment sticker. Scanning opens instant maintenance history & repair logs.
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Equipment Switcher & Mode Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {allEquipments.length > 1 && !batchMode && (
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Select Unit to Generate Tag:
                </label>
                <select
                  value={selectedEq.id}
                  onChange={(e) => {
                    const found = allEquipments.find((eq) => eq.id === e.target.value);
                    if (found) setSelectedEq(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {allEquipments.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.brand} {eq.capacityTR}TR {eq.type} — SN: {eq.serialNumber} ({eq.customerName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {allEquipments.length > 1 && (
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setBatchMode(!batchMode)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    batchMode
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>{batchMode ? 'Single Tag View' : `Batch Print (${allEquipments.length} Assets)`}</span>
                </button>
              </div>
            )}
          </div>

          {/* PRINTABLE AREA */}
          <div id="printable-qr-tag-area" ref={printRef}>
            {!batchMode ? (
              /* Single Industrial HVAC Asset Passport Tag */
              <div className="p-5 rounded-2xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-900 dark:border-slate-700 shadow-lg text-slate-900 dark:text-slate-100 space-y-4">
                {/* Sticker Top Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-700 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                    <span className="font-black tracking-wider text-xs sm:text-sm uppercase">
                      AlphaERP • HVAC Asset Passport
                    </span>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    ID: {selectedEq.id.toUpperCase()}
                  </span>
                </div>

                {/* Main Sticker Content: QR + Specs */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* High-res QR Code Frame */}
                  <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-300 dark:border-slate-600 shadow-inner">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`QR Code for ${selectedEq.serialNumber}`}
                        className="w-44 h-44 object-contain"
                      />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                        <QrCode className="w-8 h-8 animate-spin" />
                      </div>
                    )}
                    <div className="text-center mt-1.5 space-y-0.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                        SCAN WITH CAMERA
                      </div>
                      <div className="text-[9px] text-slate-500 font-medium">
                        Instant Unit Maintenance Timeline
                      </div>
                    </div>
                  </div>

                  {/* Asset Technical Specifications */}
                  <div className="sm:col-span-7 space-y-2.5 text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Equipment Description
                      </div>
                      <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {selectedEq.brand} {selectedEq.modelNumber || ''} ({selectedEq.capacityTR} TR)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {selectedEq.type}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Serial Number</div>
                        <div className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          {selectedEq.serialNumber}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Refrigerant</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          {selectedEq.refrigerantType}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Client / Facility</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                          {selectedEq.customerName}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">AMC Coverage</div>
                        <div className="font-bold text-emerald-600 text-[11px]">
                          {selectedEq.amcType}
                        </div>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Status: <strong className="text-emerald-600">{selectedEq.status}</strong></span>
                      <span>Last Serviced: <strong>{selectedEq.lastServicedDate || 'Recent'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Sticker Footer Notice */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400">
                  <span>Authorized Service Provider: Alpha HVAC Engineering Services</span>
                  <span>24/7 Breakdown Dispatch: +91 98200 12345</span>
                </div>
              </div>
            ) : (
              /* Batch Print Grid of Stickers */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {batchQrCodes.map(({ eq, qrUrl }) => (
                  <div
                    key={eq.id}
                    className="p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-3 text-xs"
                  >
                    <img src={qrUrl} alt={eq.serialNumber} className="w-20 h-20 object-contain shrink-0" />
                    <div className="space-y-1 truncate">
                      <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {eq.brand} {eq.capacityTR}TR {eq.type}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">SN: {eq.serialNumber}</div>
                      <div className="text-[10px] text-slate-400 truncate">{eq.customerName}</div>
                      <span className="inline-block px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[9px] font-bold">
                        {eq.amcType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Scan Link Display */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="truncate flex-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                Direct Browser Target URL:
              </span>
              <span className="font-mono text-blue-600 dark:text-blue-400 text-[11px] truncate block">
                {currentScanUrl}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied!' : 'Copy URL'}</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateScan}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-[11px] font-bold flex items-center gap-1 transition-all"
                title="Test how mobile scanner loads maintenance history"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Simulate Scan</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Sticker PNG</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Asset Tag Label</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
