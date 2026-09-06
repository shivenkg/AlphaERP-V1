import React, { useState } from 'react';
import {
  X,
  Camera,
  Download,
  Trash2,
  Calendar,
  FileText,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Plus,
  Printer,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { PaymentRecord, InvoiceAttachment } from '../../types';
import { storageService } from '../../services/storageService';

interface InvoiceAttachmentGalleryModalProps {
  payment: PaymentRecord;
  onClose: () => void;
  onOpenNewCapture: () => void;
  onAttachmentsUpdated: () => void;
}

export const InvoiceAttachmentGalleryModal: React.FC<InvoiceAttachmentGalleryModalProps> = ({
  payment,
  onClose,
  onOpenNewCapture,
  onAttachmentsUpdated
}) => {
  const attachments = payment.attachments || [];
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const currentAttachment: InvoiceAttachment | undefined = attachments[selectedIndex];

  const handleDownload = (att: InvoiceAttachment) => {
    const link = document.createElement('a');
    link.href = att.dataUrl;
    link.download = att.fileName || `Invoice_${payment.invoiceNumber}_Attachment.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (att: InvoiceAttachment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Physical Invoice Copy - ${payment.invoiceNumber}</title>
          <style>
            body { font-family: system-ui, sans-serif; margin: 20px; text-align: center; color: #1e293b; }
            .header { margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
            .title { font-size: 18px; font-weight: bold; }
            .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
            img { max-width: 100%; max-height: 85vh; object-fit: contain; border: 1px solid #cbd5e1; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Alpha ClimaTech - Physical Invoice Document Copy</div>
            <div class="meta">Invoice Ref: ${payment.invoiceNumber} | Project: ${payment.projectName} | Amount: ₹${payment.totalAmount.toLocaleString()}</div>
            <div class="meta">Captured: ${new Date(att.capturedAt).toLocaleString()} | Notes: ${att.notes || 'N/A'}</div>
          </div>
          <img src="${att.dataUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDelete = (attachmentId: string) => {
    if (!confirm('Are you sure you want to remove this attached physical invoice photo?')) return;
    storageService.removePaymentAttachment(payment.id, attachmentId);
    if (selectedIndex > 0 && selectedIndex >= attachments.length - 1) {
      setSelectedIndex(selectedIndex - 1);
    }
    onAttachmentsUpdated();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Attached Physical Invoices & Receipts
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {payment.invoiceNumber}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  ({attachments.length} {attachments.length === 1 ? 'Attachment' : 'Attachments'})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {payment.projectName} • {payment.clientOrVendorName} • ₹{payment.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewCapture}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Capture New Photo</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gallery Content */}
        {attachments.length === 0 ? (
          <div className="p-12 text-center space-y-4 flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h4 className="text-base font-bold text-slate-900">No Physical Invoice Photos Attached</h4>
              <p className="text-xs text-slate-500">
                Use your device camera to photograph paper invoices, stamped milestone completion certificates, delivery challans, or cheque slips for this transaction.
              </p>
            </div>
            <button
              onClick={onOpenNewCapture}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Take First Invoice Photo</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-900 text-white min-h-[380px]">
            {/* Main Image Stage */}
            <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden bg-black/90">
              {currentAttachment && (
                <div className="relative max-w-full max-h-full flex items-center justify-center overflow-auto">
                  <img
                    src={currentAttachment.dataUrl}
                    alt={currentAttachment.fileName}
                    style={{
                      transform: `rotate(${rotation}deg) scale(${zoom})`,
                      transition: 'transform 0.15s ease-out'
                    }}
                    className="max-w-full max-h-[500px] object-contain rounded shadow-2xl"
                  />
                </div>
              )}

              {/* Floating Controls for Image */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono font-semibold text-slate-400 px-1">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-700"></div>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white flex items-center gap-1 text-[11px]"
                  title="Rotate Image"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Prev / Next Page Buttons */}
              {attachments.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : attachments.length - 1));
                      setRotation(0);
                      setZoom(1);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedIndex((prev) => (prev < attachments.length - 1 ? prev + 1 : 0));
                      setRotation(0);
                      setZoom(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Side Panel: Metadata & Thumbnails */}
            <div className="w-full md:w-72 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Attachment Details ({selectedIndex + 1} of {attachments.length})
                  </div>
                  {currentAttachment && (
                    <div className="mt-2 space-y-1.5 text-xs">
                      <div className="font-bold text-white break-all">
                        {currentAttachment.fileName}
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(currentAttachment.capturedAt).toLocaleString()}</span>
                      </div>
                      {currentAttachment.notes && (
                        <div className="p-2 bg-slate-800 rounded-lg text-slate-300 text-[11px] border border-slate-700/60 mt-1">
                          <span className="text-slate-400 font-bold block text-[10px]">Note / Tag:</span>
                          {currentAttachment.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Thumbnails Strip */}
                <div>
                  <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
                    <span>All Pages / Photos ({attachments.length})</span>
                    <button
                      onClick={onOpenNewCapture}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Photo</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {attachments.map((att, idx) => (
                      <button
                        key={att.id}
                        onClick={() => {
                          setSelectedIndex(idx);
                          setRotation(0);
                          setZoom(1);
                        }}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${
                          selectedIndex === idx
                            ? 'border-blue-500 ring-2 ring-blue-500/30'
                            : 'border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <img
                          src={att.dataUrl}
                          alt={att.fileName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-white py-0.5 truncate px-1">
                          #{idx + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {currentAttachment && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(currentAttachment)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                      title="Download Image"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => handlePrint(currentAttachment)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                      title="Print Invoice Photo"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Print</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(currentAttachment.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-semibold border border-rose-800/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Photo</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Audit Trail: Images timestamped and archived per ISO MEP Accounting Standards</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
          >
            Close Gallery
          </button>
        </div>
      </div>
    </div>
  );
};
