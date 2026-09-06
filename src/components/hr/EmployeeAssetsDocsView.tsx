import React, { useState } from 'react';
import {
  Laptop,
  HardHat,
  FileCheck2,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  RotateCcw,
  UserCheck,
  Eye,
  Edit3,
  Check,
  X,
  AlertTriangle,
  ClipboardList,
  Building2,
  PackageCheck,
  Sparkles
} from 'lucide-react';
import { EmployeeAsset, EmployeeDocument, EmployeeMaster } from '../../types';
import { storageService } from '../../services/storageService';

interface EmployeeAssetsDocsViewProps {
  employees: EmployeeMaster[];
  onRefresh: () => void;
}

export const EmployeeAssetsDocsView: React.FC<EmployeeAssetsDocsViewProps> = ({
  employees,
  onRefresh
}) => {
  const [subTab, setSubTab] = useState<'assets' | 'documents'>('assets');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Allocated' | 'Returned'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Success Notification banner
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // 1. Issue Asset Modal
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [assetForm, setAssetForm] = useState({
    empId: employees[0]?.id || 'emp-001',
    assetType: 'Laptop / PC' as EmployeeAsset['assetType'],
    assetTag: '',
    serialNumber: '',
    condition: 'Brand New' as EmployeeAsset['condition'],
    allocatedDate: new Date().toISOString().split('T')[0]
  });

  // 2. Return Asset Modal (Fixing broken confirm & adding remarks)
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedAssetForReturn, setSelectedAssetForReturn] = useState<EmployeeAsset | null>(null);
  const [returnForm, setReturnForm] = useState({
    returnDate: new Date().toISOString().split('T')[0],
    returnCondition: 'Good' as 'Brand New' | 'Good' | 'Fair' | 'Damaged' | 'Normal Wear & Tear',
    returnRemarks: '',
    receivedBy: 'Shivender Kumar (HR Admin)'
  });

  // 3. View / Edit Return Details Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<EmployeeAsset | null>(null);
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [editedRemarks, setEditedRemarks] = useState('');

  // 4. Document Modal
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    empId: employees[0]?.id || 'emp-001',
    docType: 'Aadhaar Card' as EmployeeDocument['docType'],
    fileName: '',
    uploadDate: new Date().toISOString().split('T')[0]
  });

  const assets = storageService.getEmployeeAssets();
  const documents = storageService.getEmployeeDocuments();

  // Handle Allocate
  const handleAllocateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.assetTag) return;
    storageService.allocateAsset({
      empId: assetForm.empId,
      assetType: assetForm.assetType,
      assetTag: assetForm.assetTag,
      serialNumber: assetForm.serialNumber,
      allocatedDate: assetForm.allocatedDate,
      condition: assetForm.condition,
      status: 'Allocated'
    });
    setAssetModalOpen(false);
    setAssetForm({
      empId: employees[0]?.id || 'emp-001',
      assetType: 'Laptop / PC',
      assetTag: '',
      serialNumber: '',
      condition: 'Brand New',
      allocatedDate: new Date().toISOString().split('T')[0]
    });
    showFeedback(`Asset ${assetForm.assetTag} successfully issued.`);
    onRefresh();
  };

  // Open Return Modal
  const openReturnModal = (asset: EmployeeAsset) => {
    setSelectedAssetForReturn(asset);
    setReturnForm({
      returnDate: new Date().toISOString().split('T')[0],
      returnCondition: asset.condition === 'Brand New' ? 'Good' : (asset.condition as any) || 'Good',
      returnRemarks: '',
      receivedBy: 'Shivender Kumar (HR Admin)'
    });
    setReturnModalOpen(true);
  };

  // Confirm Return with Remarks
  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForReturn) return;

    storageService.returnAsset(selectedAssetForReturn.id, {
      returnDate: returnForm.returnDate,
      returnCondition: returnForm.returnCondition,
      returnRemarks: returnForm.returnRemarks.trim(),
      receivedBy: returnForm.receivedBy.trim()
    });

    const tag = selectedAssetForReturn.assetTag;
    setReturnModalOpen(false);
    setSelectedAssetForReturn(null);
    showFeedback(`Asset ${tag} successfully returned with inspection remarks recorded.`);
    onRefresh();
  };

  // Open Details Modal
  const openDetailModal = (asset: EmployeeAsset) => {
    setSelectedAssetForDetail(asset);
    setEditedRemarks(asset.returnRemarks || '');
    setIsEditingRemarks(false);
    setDetailModalOpen(true);
  };

  // Save Edited Remarks
  const handleSaveEditedRemarks = () => {
    if (!selectedAssetForDetail) return;
    storageService.updateEmployeeAsset(selectedAssetForDetail.id, {
      returnRemarks: editedRemarks.trim()
    });
    setSelectedAssetForDetail({
      ...selectedAssetForDetail,
      returnRemarks: editedRemarks.trim()
    });
    setIsEditingRemarks(false);
    showFeedback('Return remarks updated successfully.');
    onRefresh();
  };

  // Re-issue a returned asset
  const handleReissueAsset = (asset: EmployeeAsset) => {
    setAssetForm({
      empId: employees[0]?.id || 'emp-001',
      assetType: asset.assetType,
      assetTag: asset.assetTag,
      serialNumber: asset.serialNumber,
      condition: (asset.returnCondition as any) === 'Damaged' ? 'Fair' : (asset.returnCondition as any) || 'Good',
      allocatedDate: new Date().toISOString().split('T')[0]
    });
    setAssetModalOpen(true);
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.fileName) return;
    storageService.uploadEmployeeDocument({
      empId: docForm.empId,
      docType: docForm.docType,
      fileName: docForm.fileName,
      uploadDate: docForm.uploadDate,
      verificationStatus: 'Pending Review'
    });
    setDocModalOpen(false);
    setDocForm({
      empId: employees[0]?.id || 'emp-001',
      docType: 'Aadhaar Card',
      fileName: '',
      uploadDate: new Date().toISOString().split('T')[0]
    });
    showFeedback('Document uploaded successfully.');
    onRefresh();
  };

  const handleVerifyDoc = (docId: string) => {
    storageService.verifyEmployeeDocument(docId, 'Shivender Kumar (HR Admin)');
    showFeedback('KYC document verified.');
    onRefresh();
  };

  // Quick Preset Remarks for convenient entry
  const remarkPresets = [
    'All accessories, power adapter & carrying case returned intact.',
    'Working condition inspected; screen, keyboard & battery functional.',
    'Normal site wear & tear. Minor exterior scratches, hardware OK.',
    'HVAC testing kit cleaned, calibrated & placed on storage rack.',
    'Returned upon employee transfer/relieving; data wiped & audited.',
    'Unit has damage / wear; scheduled for IT maintenance & servicing.'
  ];

  // Filters
  const term = (searchTerm || '').trim().toLowerCase();
  const filteredAssets = assets.filter(a => {
    const emp = employees.find(e => e.id === a.empId);
    const empName = emp?.fullName || emp?.name || '';
    const matchesSearch =
      (a.assetTag || '').toLowerCase().includes(term) ||
      (a.assetType || '').toLowerCase().includes(term) ||
      (a.serialNumber || '').toLowerCase().includes(term) ||
      (a.returnRemarks || '').toLowerCase().includes(term) ||
      empName.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesCat = categoryFilter === 'ALL' || a.assetType === categoryFilter;

    return matchesSearch && matchesStatus && matchesCat;
  });

  const filteredDocs = documents.filter(d => {
    const emp = employees.find(e => e.id === d.empId);
    const empName = emp?.fullName || emp?.name || '';
    return (
      (d.docType || '').toLowerCase().includes(term) ||
      (d.fileName || '').toLowerCase().includes(term) ||
      empName.toLowerCase().includes(term)
    );
  });

  // Metrics
  const totalAssetsCount = assets.length;
  const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
  const returnedCount = assets.filter(a => a.status === 'Returned').length;
  const assetsWithRemarksCount = assets.filter(a => a.returnRemarks && a.returnRemarks.trim().length > 0).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sub-Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSubTab('assets')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'assets'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Company Assets & Site Gear ({assets.length})</span>
          </button>

          <button
            onClick={() => setSubTab('documents')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'documents'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Document Vault & KYC ({documents.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tag, serial, employee, remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {subTab === 'assets' ? (
            <button
              onClick={() => setAssetModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Asset</span>
            </button>
          ) : (
            <button
              onClick={() => setDocModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. ASSETS VIEW */}
      {subTab === 'assets' && (
        <div className="space-y-4">
          {/* Metrics Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500">Total Registered</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{totalAssetsCount}</div>
              <div className="text-[10px] text-slate-400 mt-1">IT & Field Equipment</div>
            </div>

            <div
              onClick={() => setStatusFilter('Allocated')}
              className={`bg-white border rounded-2xl p-3.5 shadow-2xs cursor-pointer transition-all ${
                statusFilter === 'Allocated' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-emerald-700">Active In-Hand</div>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">{allocatedCount}</div>
              <div className="text-[10px] text-emerald-600 mt-1">Currently issued to staff</div>
            </div>

            <div
              onClick={() => setStatusFilter('Returned')}
              className={`bg-white border rounded-2xl p-3.5 shadow-2xs cursor-pointer transition-all ${
                statusFilter === 'Returned' ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-slate-700">Returned to Store</div>
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{returnedCount}</div>
              <div className="text-[10px] text-slate-500 mt-1">Available / Inwarded</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
              <div className="text-[11px] font-semibold text-amber-700">Inspected with Remarks</div>
              <div className="text-xl font-bold text-amber-800 mt-0.5">{assetsWithRemarksCount}</div>
              <div className="text-[10px] text-amber-600 mt-1">Detailed return records</div>
            </div>
          </div>

          {/* Filtering Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-500 mr-1">Status:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All ({assets.length})
              </button>
              <button
                onClick={() => setStatusFilter('Allocated')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === 'Allocated'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Active In-Hand ({allocatedCount})
              </button>
              <button
                onClick={() => setStatusFilter('Returned')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === 'Returned'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Returned ({returnedCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Categories</option>
                <option value="Laptop / PC">Laptop / PC</option>
                <option value="HVAC Multimeter / Micron Gauge">HVAC Multimeter / Micron Gauge</option>
                <option value="Safety Harness & PPE Kit">Safety Harness & PPE Kit</option>
                <option value="Mobile Handset">Mobile Handset</option>
                <option value="Sim Card">Sim Card</option>
                <option value="Vehicle / Fuel Card">Vehicle / Fuel Card</option>
              </select>
            </div>
          </div>

          {/* ASSETS TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Asset Tag & S.No</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Assigned Employee</th>
                    <th className="py-3 px-4">Issue / Return Timeline</th>
                    <th className="py-3 px-4">Status & Inspection Remarks</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No company assets found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((ast) => {
                      const emp = employees.find(e => e.id === ast.empId);
                      const isReturned = ast.status === 'Returned';

                      return (
                        <tr key={ast.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{ast.assetTag}</span>
                              {ast.returnRemarks && (
                                <span title="Has return inspection remarks" className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">SN: {ast.serialNumber || 'N/A'}</div>
                          </td>

                          <td className="py-3 px-4 font-medium text-slate-800">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700 inline-block text-[11px]">
                              {ast.assetType}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {emp?.avatar ? (
                                <img
                                  src={emp.avatar}
                                  alt={emp.fullName || emp.name || 'Staff'}
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] flex items-center justify-center border border-indigo-100 shrink-0">
                                  {(emp?.fullName || emp?.name || 'EM').substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-900">{emp?.fullName || emp?.name || ast.empId}</div>
                                <div className="text-[11px] text-slate-500">
                                  {emp?.empCode ? `${emp.empCode} • ` : ''}{emp?.designation || 'Staff'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-[11px]">
                                <span className="text-slate-400">Issued:</span>
                                <span className="font-mono font-medium">{ast.allocatedDate}</span>
                                <span className="text-slate-400">({ast.condition})</span>
                              </div>
                              {isReturned && (
                                <div className="flex items-center gap-1 text-[11px] text-indigo-700 font-semibold">
                                  <span>Returned:</span>
                                  <span className="font-mono">{ast.returnDate || ast.returnedDate || 'Yes'}</span>
                                  {ast.returnCondition && (
                                    <span className="text-[10px] px-1.5 py-0.2 bg-indigo-50 border border-indigo-100 rounded text-indigo-700">
                                      {ast.returnCondition}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div>
                                {!isReturned ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Active In-Hand
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200 inline-flex items-center gap-1">
                                    <Check className="w-3 h-3 text-slate-600" />
                                    Returned & Inspected
                                  </span>
                                )}
                              </div>

                              {ast.returnRemarks ? (
                                <div
                                  onClick={() => openDetailModal(ast)}
                                  className="text-[11px] text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg border border-slate-200 cursor-pointer max-w-xs transition-colors"
                                  title="Click to view full inspection notes"
                                >
                                  <div className="flex items-center gap-1 font-semibold text-indigo-700 text-[10px]">
                                    <ClipboardList className="w-3 h-3" />
                                    <span>Remarks:</span>
                                  </div>
                                  <p className="line-clamp-2 italic text-slate-700">"{ast.returnRemarks}"</p>
                                </div>
                              ) : isReturned ? (
                                <div
                                  onClick={() => openDetailModal(ast)}
                                  className="text-[10px] text-slate-400 hover:text-indigo-600 cursor-pointer flex items-center gap-1"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>+ Add return remarks</span>
                                </div>
                              ) : null}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isReturned ? (
                                <button
                                  type="button"
                                  onClick={() => openReturnModal(ast)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95"
                                  title="Return asset and record inspection remarks"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Return Asset</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openDetailModal(ast)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-all"
                                    title="View Return Slip & Inspection Remarks"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Details</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleReissueAsset(ast)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
                                    title="Re-issue this asset to another employee"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Re-issue</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. DOCUMENTS VAULT */}
      {subTab === 'documents' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4 text-center">KYC Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No documents found matching the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const emp = employees.find(e => e.id === doc.empId);
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{doc.docType}</td>
                        <td className="py-3 px-4 font-mono text-indigo-600 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span>{doc.fileName}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          <div className="flex items-center gap-2">
                            {emp?.avatar ? (
                              <img
                                src={emp.avatar}
                                alt={emp.fullName || emp.name || 'Staff'}
                                className="w-6 h-6 rounded-md object-cover border border-slate-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center border border-indigo-100 shrink-0">
                                {(emp?.fullName || emp?.name || 'EM').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span>{emp?.fullName || emp?.name || doc.empId}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono">{doc.uploadDate}</td>
                        <td className="py-3 px-4 text-center">
                          {doc.verificationStatus === 'Verified' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {doc.verificationStatus !== 'Verified' && (
                            <button
                              onClick={() => handleVerifyDoc(doc.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Verify KYC</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: RETURN ASSET WITH INSPECTION & REMARKS (FIXED)     */}
      {/* ======================================================== */}
      {returnModalOpen && selectedAssetForReturn && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Return Company Asset & Inward Slip</h3>
                  <p className="text-[11px] text-slate-500">Record equipment condition and inspection remarks</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReturnModalOpen(false);
                  setSelectedAssetForReturn(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Asset Summary Card */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-indigo-700 text-sm">{selectedAssetForReturn.assetTag}</div>
                  <div className="font-semibold text-slate-800">{selectedAssetForReturn.assetType}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  In-Hand Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-600 border-t border-slate-200/70">
                <div>
                  <span className="text-slate-400">Assigned To: </span>
                  <strong className="text-slate-800">
                    {employees.find(e => e.id === selectedAssetForReturn.empId)?.fullName || selectedAssetForReturn.empId}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Serial No: </span>
                  <strong className="font-mono text-slate-800">{selectedAssetForReturn.serialNumber || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Allocated Date: </span>
                  <strong className="font-mono text-slate-800">{selectedAssetForReturn.allocatedDate}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Issue Condition: </span>
                  <strong className="text-slate-800">{selectedAssetForReturn.condition}</strong>
                </div>
              </div>
            </div>

            {/* Return Form */}
            <form onSubmit={handleConfirmReturn} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Return Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={returnForm.returnDate}
                    onChange={(e) => setReturnForm({ ...returnForm, returnDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Return Condition <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={returnForm.returnCondition}
                    onChange={(e) => setReturnForm({ ...returnForm, returnCondition: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="Good">Good (Operational & Clean)</option>
                    <option value="Brand New">Brand New (Unopened / Unused)</option>
                    <option value="Normal Wear & Tear">Normal Wear & Tear (Usable)</option>
                    <option value="Fair">Fair (Minor Scratches / Dents)</option>
                    <option value="Damaged">Damaged (Needs Repair / Service)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Received & Inspected By
                </label>
                <input
                  type="text"
                  required
                  value={returnForm.receivedBy}
                  onChange={(e) => setReturnForm({ ...returnForm, receivedBy: e.target.value })}
                  placeholder="e.g. Shivender Kumar (HR Admin)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Remarks for Returning Assets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Remarks for Returning Asset <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Required for inward audit</span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={returnForm.returnRemarks}
                  onChange={(e) => setReturnForm({ ...returnForm, returnRemarks: e.target.value })}
                  placeholder="Enter detailed remarks (e.g. equipment functionality test, returned accessories, charger/bag status, physical condition, storage shelf)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                />

                {/* Quick Presets */}
                <div className="mt-2 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>Quick Remarks Presets (Click to insert):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {remarkPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const current = returnForm.returnRemarks;
                          const updated = current ? `${current} ${preset}` : preset;
                          setReturnForm({ ...returnForm, returnRemarks: updated });
                        }}
                        className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg border border-slate-200 transition-colors text-left"
                      >
                        + {preset.length > 38 ? `${preset.substring(0, 38)}...` : preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setReturnModalOpen(false);
                    setSelectedAssetForReturn(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Return & Save Remarks</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW / EDIT ASSET RETURN DETAILS & REMARKS SLIP    */}
      {/* ======================================================== */}
      {detailModalOpen && selectedAssetForDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                  <ClipboardList className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Asset Inward & Return Record</h3>
                  <p className="text-[11px] text-slate-500">{selectedAssetForDetail.assetTag} • {selectedAssetForDetail.assetType}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedAssetForDetail(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lifecycle Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Asset Tag</div>
                  <div className="font-mono text-base font-bold text-slate-900">{selectedAssetForDetail.assetTag}</div>
                  <div className="text-[11px] text-slate-500 font-mono">SN: {selectedAssetForDetail.serialNumber || 'N/A'}</div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    selectedAssetForDetail.status === 'Returned'
                      ? 'bg-slate-200 text-slate-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedAssetForDetail.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-[11px]">
                <div>
                  <div className="text-slate-400">Issued Employee:</div>
                  <div className="font-bold text-slate-800">
                    {employees.find(e => e.id === selectedAssetForDetail.empId)?.fullName || selectedAssetForDetail.empId}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Issue Date & Condition:</div>
                  <div className="font-medium text-slate-700">
                    {selectedAssetForDetail.allocatedDate} ({selectedAssetForDetail.condition})
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Return Date:</div>
                  <div className="font-bold text-indigo-700 font-mono">
                    {selectedAssetForDetail.returnDate || selectedAssetForDetail.returnedDate || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Return Condition:</div>
                  <div className="font-semibold text-slate-800">
                    {selectedAssetForDetail.returnCondition || 'Good'}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-400">Received By:</div>
                  <div className="font-medium text-slate-700">
                    {selectedAssetForDetail.receivedBy || 'HR Admin'}
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Return Inspection Remarks</span>
                </h4>
                {!isEditingRemarks && (
                  <button
                    type="button"
                    onClick={() => setIsEditingRemarks(true)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Remarks</span>
                  </button>
                )}
              </div>

              {isEditingRemarks ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={editedRemarks}
                    onChange={(e) => setEditedRemarks(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                    placeholder="Update remarks for returning this asset..."
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditedRemarks(selectedAssetForDetail.returnRemarks || '');
                        setIsEditingRemarks(false);
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedRemarks}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                    >
                      Save Remarks
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-slate-800 italic leading-relaxed">
                  {selectedAssetForDetail.returnRemarks ? (
                    `"${selectedAssetForDetail.returnRemarks}"`
                  ) : (
                    <span className="text-slate-400 not-italic">No remarks recorded yet for this returned asset.</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedAssetForDetail(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ISSUE ASSET                                       */}
      {/* ======================================================== */}
      {assetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Issue Company Asset / Testing Kit</h3>
            <form onSubmit={handleAllocateAsset} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assign to Employee</label>
                <select
                  value={assetForm.empId}
                  onChange={(e) => setAssetForm({ ...assetForm, empId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.fullName || e.name} ({e.empCode}) - {e.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Asset Category</label>
                  <select
                    value={assetForm.assetType}
                    onChange={(e) => setAssetForm({ ...assetForm, assetType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Laptop / PC">Laptop / PC</option>
                    <option value="HVAC Multimeter / Micron Gauge">HVAC Multimeter / Micron Gauge</option>
                    <option value="Safety Harness & PPE Kit">Safety Harness & PPE Kit</option>
                    <option value="Mobile Handset">Mobile Handset</option>
                    <option value="Sim Card">Sim Card</option>
                    <option value="Vehicle / Fuel Card">Vehicle / Fuel Card</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Asset Tag</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AST-FLK-088"
                    value={assetForm.assetTag}
                    onChange={(e) => setAssetForm({ ...assetForm, assetTag: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Serial Number / Model</label>
                <input
                  type="text"
                  placeholder="e.g. FLUKE-116-HVAC-9812"
                  value={assetForm.serialNumber}
                  onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Condition</label>
                  <select
                    value={assetForm.condition}
                    onChange={(e) => setAssetForm({ ...assetForm, condition: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={assetForm.allocatedDate}
                    onChange={(e) => setAssetForm({ ...assetForm, allocatedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAssetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Issue Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: UPLOAD DOC                                        */}
      {/* ======================================================== */}
      {docModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Upload Employee KYC / Certificate</h3>
            <form onSubmit={handleUploadDoc} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Employee</label>
                <select
                  value={docForm.empId}
                  onChange={(e) => setDocForm({ ...docForm, empId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.fullName || e.name} ({e.empCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Type</label>
                <select
                  value={docForm.docType}
                  onChange={(e) => setDocForm({ ...docForm, docType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Degree / Diploma Certificate">Degree / Diploma Certificate</option>
                  <option value="Appointment Letter">Appointment Letter</option>
                  <option value="Previous Relieving Letter">Previous Relieving Letter</option>
                  <option value="Form 16">Form 16</option>
                  <option value="Medical Fitness">Medical Fitness</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">File Name / Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aadhaar_Verified_Doc.pdf"
                  value={docForm.fileName}
                  onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Upload & Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
