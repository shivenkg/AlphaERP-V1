import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RotateCw,
  RefreshCw,
  X,
  Check,
  Upload,
  AlertCircle,
  FileText,
  Sparkles,
  Zap,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentRecord, InvoiceAttachment } from '../../types';

interface InvoiceCameraModalProps {
  payment: PaymentRecord;
  onSaveAttachment: (attachment: InvoiceAttachment) => void;
  onClose: () => void;
}

export const InvoiceCameraModal: React.FC<InvoiceCameraModalProps> = ({
  payment,
  onSaveAttachment,
  onClose
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [rotation, setRotation] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [attachmentNote, setAttachmentNote] = useState<string>('Physical Tax Invoice Copy');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check device camera count and start stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const checkDevicesAndStartCamera = async () => {
      setCameraError(null);
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoDevices.length > 1);
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 }
          },
          audio: false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((err) => {
            console.warn('Video play error:', err);
          });
        }
      } catch (err: any) {
        console.error('Camera access failed:', err);
        setIsCameraActive(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera permission was denied. Please allow camera access in your browser or upload an invoice image below.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No active camera device detected. You can upload an image file of the invoice directly.');
        } else {
          setCameraError(err.message || 'Unable to access camera. You can upload an invoice image file directly.');
        }
      }
    };

    if (!capturedImage) {
      checkDevicesAndStartCamera();
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, capturedImage]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw normal frame
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedImage(dataUrl);
        setRotation(0);

        // Stop stream while reviewing
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    } catch (e: any) {
      console.error('Snapshot capture failed:', e);
      setCameraError('Failed to capture frame from camera.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setRotation(0);
  };

  const handleRotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCapturedImage(result);
        setRotation(0);
        setAttachmentNote(`Uploaded Copy - ${file.name}`);
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleFacingMode = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleSaveAndAttach = () => {
    if (!capturedImage) return;

    // Apply rotation if needed
    if (rotation !== 0) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (rotation === 90 || rotation === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        saveFinalAttachment(rotatedDataUrl);
      };
      img.src = capturedImage;
    } else {
      saveFinalAttachment(capturedImage);
    }
  };

  const saveFinalAttachment = (finalDataUrl: string) => {
    const timestamp = new Date().toISOString();
    const newAttachment: InvoiceAttachment = {
      id: `att-${Date.now()}`,
      fileName: `Physical_Invoice_${payment.invoiceNumber}_${Date.now().toString().slice(-4)}.jpg`,
      fileType: 'image/jpeg',
      dataUrl: finalDataUrl,
      capturedAt: timestamp,
      capturedBy: 'Finance Officer',
      notes: attachmentNote
    };

    onSaveAttachment(newAttachment);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Capture Physical Invoice Photo
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {payment.invoiceNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5">
                {payment.projectName} • {payment.clientOrVendorName} (₹{payment.totalAmount.toLocaleString()})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[320px] max-h-[500px]">
          {!capturedImage ? (
            /* Live Camera Viewfinder */
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />

              {/* Documentary Invoice Alignment Overlay Guide */}
              <div className="absolute inset-4 sm:inset-8 pointer-events-none border-2 border-blue-400/40 rounded-xl flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-blue-400"></div>
                  <div className="text-[11px] font-mono font-medium px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-blue-200 border border-blue-500/30">
                    Align Physical Invoice Within Frame
                  </div>
                  <div className="w-6 h-6 border-t-2 border-r-2 border-blue-400"></div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-blue-400"></div>
                  <div className="text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded font-mono">
                    AlphaERP Document Scanner
                  </div>
                  <div className="w-6 h-6 border-b-2 border-r-2 border-blue-400"></div>
                </div>
              </div>

              {/* Camera Error / No Permission Fallback Screen */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center z-20 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="max-w-md space-y-1">
                    <h4 className="text-sm font-bold text-white">Camera Unavailable or Restricted</h4>
                    <p className="text-xs text-slate-400">{cameraError}</p>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Invoice Photo from Device</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Review Captured Frame */
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950 p-2">
              <img
                src={capturedImage}
                alt="Captured Physical Invoice"
                style={{ transform: `rotate(${rotation}deg)` }}
                className="max-w-full max-h-[460px] object-contain rounded-lg transition-transform duration-200 shadow-2xl"
              />

              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Photo Captured ({rotation}° Rotation)</span>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 space-y-3 shrink-0">
          {!capturedImage ? (
            /* Live Camera Toolbar */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                {hasMultipleCameras && (
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                    title="Switch Front/Rear Camera"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Flip Camera</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  title="Upload from File / Gallery"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                </button>
              </div>

              {/* Main Snapshot Button */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  disabled={isCapturing || !isCameraActive}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40 cursor-pointer active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Invoice Photo</span>
                </button>
              </div>

              <div className="hidden sm:block text-right">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Review & Save Controls */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Invoice Document Label / Remarks:
                  </label>
                  <input
                    type="text"
                    value={attachmentNote}
                    onChange={(e) => setAttachmentNote(e.target.value)}
                    placeholder="e.g., Original Signed Vendor Invoice / Stamped Bill"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={handleRotateImage}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Rotate (90°)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-rose-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndAttach}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm & Attach to Transaction</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
