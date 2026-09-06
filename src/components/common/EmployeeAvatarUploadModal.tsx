import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Link,
  Sparkles,
  Check,
  X,
  Trash2,
  User,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
import { EmployeeMaster } from '../../types';
import { storageService } from '../../services/storageService';

// High quality curated avatars for executive, engineering, and site staff
export const PRESET_AVATARS = [
  {
    id: 'preset-1',
    label: 'Senior Executive',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-2',
    label: 'Lead PM & Engineer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-3',
    label: 'Technical Specialist',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-4',
    label: 'Regional Sales Head',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-5',
    label: 'MEP Project Manager',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-6',
    label: 'Design & Estimations',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-7',
    label: 'Field Operations Lead',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-8',
    label: 'Quality & Safety Engineer',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-9',
    label: 'Procurement Specialist',
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'preset-10',
    label: 'Commissioning Specialist',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80'
  }
];

export interface EmployeeAvatarUploadModalProps {
  employee: EmployeeMaster;
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdated?: (newAvatar: string) => void;
}

export const EmployeeAvatarUploadModal: React.FC<EmployeeAvatarUploadModalProps> = ({
  employee,
  isOpen,
  onClose,
  onAvatarUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(employee.avatar || '');
  const [urlInput, setUrlInput] = useState<string>(employee.avatar || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const empName = employee.fullName || (employee as any).name || 'Employee';
  const empInitials = empName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Compress and convert image to lightweight Data URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WEBP, or SVG).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Draw to canvas for max 360x360 resolution & compression
        const maxDim = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setSelectedAvatar(compressedDataUrl);
          setPreviewError(false);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        alert('Failed to process image file.');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessing(false);
      alert('Error reading uploaded file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setSelectedAvatar(urlInput.trim());
    setPreviewError(false);
  };

  const handleSave = () => {
    storageService.updateEmployee(employee.id, { avatar: selectedAvatar });
    if (onAvatarUpdated) {
      onAvatarUpdated(selectedAvatar);
    }
    onClose();
  };

  const handleRemovePhoto = () => {
    setSelectedAvatar('');
    setUrlInput('');
    setPreviewError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-5 shadow-2xl my-8 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Update Employee Profile Picture
              </h3>
              <p className="text-[11px] text-slate-500">
                Add or change the latest avatar for employee records & ESS portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employee Summary Card */}
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3.5">
          <div className="relative">
            {selectedAvatar && !previewError ? (
              <img
                src={selectedAvatar}
                alt={empName}
                onError={() => setPreviewError(true)}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center border-2 border-indigo-400 shadow-sm">
                {empInitials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs border border-slate-200">
              <Camera className="w-3 h-3 text-indigo-600" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs text-slate-900 truncate">{empName}</h4>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold border border-indigo-100">
                {employee.empCode}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 truncate mt-0.5">
              {employee.designation} • <span className="text-slate-500">{employee.department}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {employee.officialEmail || (employee as any).email || 'emp@alphaerp.com'}
            </div>
          </div>

          {selectedAvatar && (
            <button
              onClick={handleRemovePhoto}
              title="Remove current photo"
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={() => setActiveTab('preset')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'preset'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'url'
                ? 'bg-white text-indigo-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Web URL</span>
          </button>
        </div>

        {/* Tab 1: File Upload (Drag & Drop) */}
        {activeTab === 'upload' && (
          <div className="mt-4 space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs mb-2.5">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Click to browse or drag & drop latest picture
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supports PNG, JPG, WEBP, or SVG (Auto-compressed for fast loading)
              </p>
            </div>

            {isProcessing && (
              <div className="p-2.5 bg-indigo-50 rounded-xl text-center text-xs text-indigo-700 font-medium">
                Optimizing and loading profile image...
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Preset Avatars */}
        {activeTab === 'preset' && (
          <div className="mt-4 space-y-3">
            <p className="text-[11px] text-slate-500 font-medium">
              Choose from curated professional and engineering avatar styles:
            </p>
            <div className="grid grid-cols-5 gap-2.5 max-h-56 overflow-y-auto p-1">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = selectedAvatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(preset.url);
                      setPreviewError(false);
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/30 shadow-md scale-105'
                        : 'border-slate-200 hover:border-indigo-400'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center text-white">
                        <div className="p-0.5 bg-indigo-600 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-0.5 text-[8px] text-white font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {preset.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Direct Web URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleApplyUrl} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Image Web URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/photos/profile.jpg"
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Preview
                </button>
              </div>
            </div>
            {previewError && (
              <p className="text-[11px] text-rose-500">
                Could not load image from this URL. Please verify the link.
              </p>
            )}
          </form>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-5 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Save Latest Picture</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
