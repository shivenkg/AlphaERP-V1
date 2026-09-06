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
  UserCheck
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

  // Modals
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [assetForm, setAssetForm] = useState({
    empId: employees[0]?.id || 'emp-001',
    assetType: 'Laptop / PC' as EmployeeAsset['assetType'],
    assetTag: '',
    serialNumber: '',
    condition: 'Brand New',
    allocatedDate: new Date().toISOString().split('T')[0]
  });

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    empId: employees[0]?.id || 'emp-001',
    docType: 'Aadhaar Card' as EmployeeDocument['docType'],
    fileName: '',
    uploadDate: new Date().toISOString().split('T')[0]
  });

  const assets = storageService.getEmployeeAssets();
  const documents = storageService.getEmployeeDocuments();

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
    setAssetForm({ empId: employees[0]?.id || 'emp-001', assetType: 'Laptop / PC', assetTag: '', serialNumber: '', condition: 'Brand New', allocatedDate: new Date().toISOString().split('T')[0] });
    onRefresh();
  };

  const handleReturnAsset = (assetId: string) => {
    if (window.confirm('Confirm asset return and inspection?')) {
      storageService.returnAsset(assetId);
      onRefresh();
    }
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
    setDocForm({ empId: employees[0]?.id || 'emp-001', docType: 'Aadhaar Card', fileName: '', uploadDate: new Date().toISOString().split('T')[0] });
    onRefresh();
  };

  const handleVerifyDoc = (docId: string) => {
    storageService.verifyEmployeeDocument(docId, 'Shivender Kumar (HR Admin)');
    onRefresh();
  };

  const term = (searchTerm || '').trim().toLowerCase();
  const filteredAssets = assets.filter(a => {
    const emp = employees.find(e => e.id === a.empId);
    const empName = emp?.fullName || emp?.name || '';
    return (a.assetTag || '').toLowerCase().includes(term) ||
      (a.assetType || '').toLowerCase().includes(term) ||
      empName.toLowerCase().includes(term);
  });

  const filteredDocs = documents.filter(d => {
    const emp = employees.find(e => e.id === d.empId);
    const empName = emp?.fullName || emp?.name || '';
    return (d.docType || '').toLowerCase().includes(term) ||
      (d.fileName || '').toLowerCase().includes(term) ||
      empName.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Sub-Tabs */}
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
              placeholder="Search assets or docs..."
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

      {/* 1. ASSETS TABLE */}
      {subTab === 'assets' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Asset Tag / S.No</th>
                  <th className="py-3 px-4">Asset Type</th>
                  <th className="py-3 px-4">Assigned Employee</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map((ast) => {
                  const emp = employees.find(e => e.id === ast.empId);
                  return (
                    <tr key={ast.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{ast.assetTag}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{ast.serialNumber || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700">
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
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] flex items-center justify-center border border-indigo-100 shrink-0">
                              {((emp?.fullName || emp?.name || 'EM')).substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{emp?.fullName || emp?.name || ast.empId}</div>
                            <div className="text-[11px] text-slate-500">{emp?.designation || 'Staff'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{ast.condition}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{ast.allocatedDate}</td>
                      <td className="py-3 px-4 text-center">
                        {ast.status === 'Allocated' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            Active In-Hand
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            Returned ({ast.returnDate || 'Completed'})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {ast.status === 'Allocated' && (
                          <button
                            onClick={() => handleReturnAsset(ast.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Return</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                {filteredDocs.map((doc) => {
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
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center border border-indigo-100 shrink-0">
                              {((emp?.fullName || emp?.name || 'EM')).substring(0, 2).toUpperCase()}
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Issue Asset */}
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
                    <option value="Company Sim / Mobile">Company Sim / Mobile</option>
                    <option value="Vehicle / Tool Box">Vehicle / Tool Box</option>
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
                    onChange={(e) => setAssetForm({ ...assetForm, condition: e.target.value })}
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

      {/* Modal: Upload Doc */}
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
                  <option value="Safety / ISHRAE Certification">Safety / ISHRAE Certification</option>
                  <option value="Relieving Letter">Relieving Letter</option>
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
