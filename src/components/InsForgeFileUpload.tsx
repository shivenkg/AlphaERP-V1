import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  Trash2,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  Paperclip
} from 'lucide-react';
import { FileAttachment } from '../types';
import { insforge } from '../lib/insforge';

interface InsForgeFileUploadProps {
  bucketName?: string;
  attachments?: FileAttachment[];
  onAttachmentsChange?: (attachments: FileAttachment[]) => void;
  recordTitle?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
}

export const InsForgeFileUpload: React.FC<InsForgeFileUploadProps> = ({
  bucketName = 'attachments',
  attachments = [],
  onAttachmentsChange,
  recordTitle = 'Record',
  maxFiles = 10,
  maxSizeMB = 25,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.dwg',
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string, name: string) => {
    if (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name)) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (mimeType.includes('pdf') || /\.pdf$/i.test(name)) {
      return <FileText className="w-5 h-5 text-rose-500" />;
    }
    if (mimeType.includes('sheet') || mimeType.includes('excel') || /\.(xls|xlsx|csv)$/i.test(name)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    return <File className="w-5 h-5 text-slate-500" />;
  };

  const handleUploadFile = async (file: globalThis.File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`File size exceeds maximum allowed ${maxSizeMB} MB.`);
      return;
    }

    if (attachments.length >= maxFiles) {
      setErrorMessage(`Maximum limit of ${maxFiles} attachments reached.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      setUploadProgress(50);
      const { data, error } = await insforge.storage
        .from(bucketName)
        .uploadAuto(file);

      if (error) {
        throw error;
      }

      setUploadProgress(100);

      const newAttachment: FileAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        url: data.url,
        key: data.key,
        size: data.size || file.size,
        mimeType: data.mimeType || file.type || 'application/octet-stream',
        uploadedAt: data.uploadedAt || new Date().toISOString()
      };

      const updated = [...attachments, newAttachment];
      if (onAttachmentsChange) {
        onAttachmentsChange(updated);
      }

      setSuccessMessage(`"${file.name}" uploaded successfully to InsForge Storage.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('File upload failed:', err);
      setErrorMessage(err.message || 'Failed to upload file to InsForge Storage.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteAttachment = async (att: FileAttachment) => {
    if (!window.confirm(`Delete attachment "${att.name}"?`)) return;

    try {
      // Remove from InsForge Storage bucket
      if (att.key) {
        await insforge.storage.from(bucketName).remove(att.key);
      }

      const updated = attachments.filter((a) => a.id !== att.id);
      if (onAttachmentsChange) {
        onAttachmentsChange(updated);
      }
    } catch (err) {
      console.error('Failed to delete attachment:', err);
    }
  };

  const handleDownloadAttachment = async (att: FileAttachment) => {
    try {
      if (att.key) {
        const { data: blob, error } = await insforge.storage.from(bucketName).download(att.key);
        if (!error && blob) {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = att.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
          return;
        }
      }
      // Direct URL fallback
      window.open(att.url, '_blank');
    } catch {
      window.open(att.url, '_blank');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Header & Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Files & Attachments ({attachments.length})
          </h4>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          InsForge Storage • Max {maxSizeMB}MB
        </span>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Drag & Drop Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 hover:bg-slate-100/80 dark:hover:bg-slate-850'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <div className="w-full max-w-xs space-y-2">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Uploading to InsForge Storage...
              </div>
              {uploadProgress !== null && (
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Click to upload
                </span>{' '}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  or drag & drop files here
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Drawings, Site Survey Photos, HVAC BOQs, Invoices, Technical PDFs
              </p>
            </>
          )}
        </div>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((att) => {
            const isImage = att.mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(att.name);

            return (
              <div
                key={att.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail / Icon */}
                  {isImage ? (
                    <div
                      onClick={() => setPreviewModalUrl({ url: att.url, name: att.name })}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                    >
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getFileIcon(att.mimeType, att.name)}
                    </div>
                  )}

                  {/* File Metadata */}
                  <div className="min-w-0">
                    <div
                      title={att.name}
                      onClick={() => window.open(att.url, '_blank')}
                      className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer max-w-[200px] sm:max-w-xs md:max-w-md"
                    >
                      {att.name}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{formatFileSize(att.size)}</span>
                      <span>•</span>
                      <span>{new Date(att.uploadedAt).toLocaleDateString()}</span>
                      <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-semibold text-[9px]">
                        InsForge
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {isImage && (
                    <button
                      type="button"
                      onClick={() => setPreviewModalUrl({ url: att.url, name: att.name })}
                      title="Preview Image"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownloadAttachment(att)}
                    title="Download File"
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    title="Open in new tab"
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteAttachment(att)}
                    title="Delete Attachment"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Full-Preview Lightbox Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl p-4 max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {previewModalUrl.name}
              </div>
              <button
                onClick={() => setPreviewModalUrl(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] flex items-center justify-center overflow-auto rounded-2xl bg-slate-950 p-2">
              <img
                src={previewModalUrl.url}
                alt={previewModalUrl.name}
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
