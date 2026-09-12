import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  PenTool,
  Wrench,
  User,
  ShieldCheck,
  X,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Check,
  Wifi,
  WifiOff,
  Star,
  Upload,
  ArrowRight
} from 'lucide-react';
import {
  ServiceWorkOrder,
  ServiceChecklistItem,
  TruckStockItem,
  ServicePhoto
} from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';

interface TechnicianMobileFieldModalProps {
  order: ServiceWorkOrder;
  truckStock: TruckStockItem[];
  onClose: () => void;
  onJobCompleted: (updatedOrder: ServiceWorkOrder) => void;
}

export const TechnicianMobileFieldModal: React.FC<TechnicianMobileFieldModalProps> = ({
  order,
  truckStock,
  onClose,
  onJobCompleted
}) => {
  const [activeStep, setActiveStep] = useState<number>(
    order.status === 'Scheduled'
      ? 1
      : order.status === 'En Route'
      ? 2
      : order.status === 'On Site' || order.status === 'In Progress'
      ? 3
      : 5
  );

  // Time Tracking State
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(order.status === 'In Progress');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(order.timeTracking.totalLaborMinutes * 60 || 0);

  // Offline Mode Toggle
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Checklist State
  const [checklist, setChecklist] = useState<ServiceChecklistItem[]>(order.checklist);

  // Parts Added State
  const [partsUsed, setPartsUsed] = useState(order.partsUsed);
  const [selectedStockId, setSelectedStockId] = useState(truckStock[0]?.id || '');
  const [partQty, setPartQty] = useState(1);

  // Photos State
  const [photos, setPhotos] = useState<ServicePhoto[]>(order.photos);
  const [photoType, setPhotoType] = useState<'Before' | 'After'>('Before');
  const [photoCaption, setPhotoCaption] = useState('');

  // Digital Signature State
  const [signerName, setSignerName] = useState(order.signature?.signerName || '');
  const [signerDesignation, setSignerDesignation] = useState(order.signature?.signerDesignation || 'Facility Manager');
  const [feedbackScore, setFeedbackScore] = useState<number>(order.signature?.customerFeedbackScore || 5);
  const [customerComments, setCustomerComments] = useState(order.signature?.customerComments || '');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(Boolean(order.signature?.signatureDataUrl));

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Step 1: Start Travel
  const handleStartTravel = () => {
    serviceStorage.updateTicketStatus(order.id, 'En Route');
    order.status = 'En Route';
    setActiveStep(2);
  };

  // Step 2: Arrive On Site
  const handleArriveOnSite = () => {
    serviceStorage.updateTicketStatus(order.id, 'On Site');
    order.status = 'On Site';
    setIsTimerRunning(true);
    setActiveStep(3);
  };

  // Step 3: Toggle checklist item
  const handleToggleCheck = (id: string, customReading?: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCompleted = !item.completed;
          return {
            ...item,
            completed: nextCompleted,
            status: nextCompleted ? 'Pass' : 'Attention Required',
            measurementValue: customReading || item.measurementValue
          };
        }
        return item;
      })
    );
  };

  // Step 4: Add Part from Truck Stock
  const handleAddPart = () => {
    const stockItem = truckStock.find((s) => s.id === selectedStockId);
    if (!stockItem) return;

    const newPart = {
      id: `part-${Date.now()}`,
      sku: stockItem.sku,
      name: stockItem.name,
      quantity: partQty,
      unit: stockItem.unit,
      unitCost: stockItem.unitPrice,
      totalCost: stockItem.unitPrice * partQty
    };

    setPartsUsed((prev) => [...prev, newPart]);
    serviceStorage.updateTruckStockQuantity(stockItem.id, -partQty);
  };

  // Step 4: Add Sample HVAC Photo
  const handleAddSamplePhoto = () => {
    const sampleUrls = [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80'
    ];
    const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];

    const newPhoto: ServicePhoto = {
      id: `photo-${Date.now()}`,
      caption: photoCaption || `${photoType} Inspection of ${order.equipmentTitle}`,
      url: randomUrl,
      type: photoType,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setPhotos((prev) => [...prev, newPhoto]);
    setPhotoCaption('');
  };

  // Signature Canvas Handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2563eb';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  // Final Job Completion
  const handleCompleteJob = () => {
    setIsTimerRunning(false);
    const signatureDataUrl = canvasRef.current?.toDataURL('image/png') || 'data:image/svg+xml;utf8,<svg><path d="M10 20 L50 20"/></svg>';

    const updatedOrder: ServiceWorkOrder = {
      ...order,
      status: 'Completed',
      checklist,
      partsUsed,
      photos,
      timeTracking: {
        ...order.timeTracking,
        totalLaborMinutes: Math.max(30, Math.round(elapsedSeconds / 60)),
        workCompletedTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
      },
      signature: {
        signerName: signerName || order.customerName,
        signerDesignation: signerDesignation || 'Facility Manager',
        signatureDataUrl,
        signedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        customerFeedbackScore: feedbackScore,
        customerComments
      }
    };

    serviceStorage.saveWorkOrder(updatedOrder);
    serviceStorage.updateTicketStatus(order.id, 'Completed');
    onJobCompleted(updatedOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Mobile Device Container - sized like a tablet or large phone */}
      <div className="bg-slate-900 text-white rounded-3xl border border-slate-700 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Mobile Header Bar */}
        <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-mono tracking-wide text-blue-400">
                {order.ticketNumber} • FIELD MODE
              </div>
              <div className="text-[11px] text-slate-300 font-semibold truncate max-w-[200px]">
                {order.customerName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Offline Mode Indicator */}
            <button
              onClick={() => setIsOfflineMode(!isOfflineMode)}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                isOfflineMode
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
              title="Toggle Offline Cache Simulator"
            >
              {isOfflineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span className="text-[10px] hidden sm:inline">{isOfflineMode ? 'Offline' : 'Online'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Labor Timer Bar */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isTimerRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="font-mono text-sm font-bold text-emerald-400">{formatTimer(elapsedSeconds)}</span>
            <span className="text-[10px] text-slate-400">Job Labor Time</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                isTimerRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
            </button>
          </div>
        </div>

        {/* Step Progression Tabs */}
        <div className="grid grid-cols-5 bg-slate-800/50 border-b border-slate-700 text-[10px] font-bold text-center">
          {[
            { step: 1, label: 'En Route' },
            { step: 2, label: 'Arrival' },
            { step: 3, label: 'Diagnosis' },
            { step: 4, label: 'Parts/Pics' },
            { step: 5, label: 'Signoff' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`py-2 px-1 border-b-2 transition-all ${
                activeStep === s.step
                  ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.step}. {s.label}
            </button>
          ))}
        </div>

        {/* Step Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* STEP 1: EN ROUTE */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  Step 1: Start Technician Travel
                </span>
                <h4 className="text-sm font-bold text-white">{order.customerName}</h4>
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{order.customerAddress}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-slate-400">
                  <span>Scheduled Time Slot:</span>
                  <span className="text-white font-bold">{order.scheduledTimeSlot}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-800 text-blue-200 text-xs">
                💡 Clicking &ldquo;Start Travel to Site&rdquo; automatically updates customer tracking link and sets status to <span className="font-bold">En Route</span>.
              </div>

              <button
                onClick={handleStartTravel}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Start Travel to Site (En Route)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: ARRIVED ON SITE */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Step 2: On-Site Geofence Verification
                </span>
                <div className="text-sm font-bold text-white">{order.equipmentTitle}</div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-[11px]">
                  <span className="font-bold text-amber-400">Reported Symptoms:</span> {order.symptomsReported}
                </div>
              </div>

              <button
                onClick={handleArriveOnSite}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm Arrival On-Site (Clock-In)</span>
              </button>
            </div>
          )}

          {/* STEP 3: DIAGNOSIS & DIGITAL CHECKLIST */}
          {activeStep === 3 && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Digital Checklist ({checklist.filter((c) => c.completed).length}/{checklist.length} Passed)
                </span>
                <span className="text-[10px] text-slate-400">Tap to toggle test status</span>
              </div>

              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleCheck(item.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      item.completed
                        ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                        item.completed
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : 'border-slate-500 bg-slate-900'
                      }`}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-xs">{item.task}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                        <span>Category: {item.category}</span>
                        {item.measurementValue && (
                          <span className="font-mono text-blue-400 font-bold">{item.measurementValue}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveStep(4)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Parts & Photos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 4: PARTS CONSUMED & PHOTO UPLOADS */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Truck Stock Consumed */}
              <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    Truck Stock Consumed
                  </span>
                  <span className="text-[10px] text-slate-400">Total: ₹{partsUsed.reduce((a, b) => a + b.totalCost, 0).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedStockId}
                    onChange={(e) => setSelectedStockId(e.target.value)}
                    className="flex-1 py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white"
                  >
                    {truckStock.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.currentStock} {s.unit} in Van) - ₹{s.unitPrice}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={partQty}
                    onChange={(e) => setPartQty(Number(e.target.value))}
                    className="w-16 py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white text-center"
                  />

                  <button
                    onClick={handleAddPart}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shrink-0"
                  >
                    Add
                  </button>
                </div>

                {partsUsed.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-slate-700">
                    {partsUsed.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-[11px] text-slate-300">
                        <span>{p.name} × {p.quantity} {p.unit}</span>
                        <span className="font-mono font-bold text-white">₹{p.totalCost.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photo Evidence Upload */}
              <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-400" />
                    Before / After Inspection Photos ({photos.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={photoType}
                    onChange={(e) => setPhotoType(e.target.value as any)}
                    className="py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white"
                  >
                    <option value="Before">Before Repair</option>
                    <option value="After">After Repair</option>
                    <option value="Defect">Defect / Damaged</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Photo caption (e.g. Burned capacitor terminal)..."
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    className="flex-1 py-1.5 px-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                  />

                  <button
                    onClick={handleAddSamplePhoto}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Attach</span>
                  </button>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {photos.map((ph) => (
                      <div key={ph.id} className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                        <img src={ph.url} alt={ph.caption} className="w-full h-24 object-cover" />
                        <div className="p-1.5 bg-slate-900/90 text-[10px] truncate text-slate-300">
                          <span className="font-bold text-blue-400">[{ph.type}]</span> {ph.caption}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveStep(5)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Customer Signoff</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 5: CUSTOMER DIGITAL SIGNATURE & SIGNOFF */}
          {activeStep === 5 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <PenTool className="w-3.5 h-3.5" />
                  Step 5: Customer Digital Signature & Feedback
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Signer Name:</label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="e.g. Kishore Deshmukh"
                      className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Designation:</label>
                    <input
                      type="text"
                      value={signerDesignation}
                      onChange={(e) => setSignerDesignation(e.target.value)}
                      placeholder="e.g. Chief Engineer"
                      className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                {/* Rating Stars */}
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">Customer Service Rating:</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackScore(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= feedbackScore ? 'fill-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-400 ml-2">{feedbackScore} / 5</span>
                  </div>
                </div>

                {/* Customer Signature Pad */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-400 font-semibold">Draw Customer Signature:</label>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                    >
                      Clear Pad
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={100}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-24 bg-white rounded-xl border border-slate-600 cursor-crosshair touch-none"
                  />
                </div>

                {/* Comments */}
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">Customer Feedback Notes:</label>
                  <input
                    type="text"
                    value={customerComments}
                    onChange={(e) => setCustomerComments(e.target.value)}
                    placeholder="e.g. Excellent quick repair, cooling restored."
                    className="w-full py-1.5 px-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleCompleteJob}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Save Signoff & Complete Job</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
