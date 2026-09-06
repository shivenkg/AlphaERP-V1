import React, { useState } from 'react';
import {
  Plane,
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  Check,
  X,
  MapPin,
  FileText,
  DollarSign
} from 'lucide-react';
import { TravelRequest, ExpenseClaim, EmployeeMaster } from '../../types';
import { storageService } from '../../services/storageService';

interface TravelExpensesViewProps {
  employees: EmployeeMaster[];
  onRefresh: () => void;
}

export const TravelExpensesView: React.FC<TravelExpensesViewProps> = ({
  employees,
  onRefresh
}) => {
  const [subTab, setSubTab] = useState<'travel' | 'expenses'>('travel');
  const [travelModalOpen, setTravelModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  const travelRequests = storageService.getTravelRequests();
  const expenseClaims = storageService.getExpenseClaims();

  const [travelForm, setTravelForm] = useState({
    empId: employees[0]?.id || 'emp-001',
    purpose: 'Client Site Commissioning' as TravelRequest['purpose'],
    originCity: 'Mumbai HQ',
    destinationCity: 'Bengaluru IT Park Site',
    departureDate: new Date().toISOString().split('T')[0],
    returnDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    estimatedCost: 18000,
    perDiemAllowance: 1500,
    advanceRequested: 10000
  });

  const [expenseForm, setExpenseForm] = useState({
    empId: employees[0]?.id || 'emp-001',
    projectName: 'Phoenix Mall VRF Installation',
    category: 'Site Fuel & Conveyance' as ExpenseClaim['category'],
    amount: 2850,
    expenseDate: new Date().toISOString().split('T')[0],
    receiptNumber: 'REC-90124',
    description: 'Site inter-floor testing conveyance & urgent pressure test fittings',
    billAttached: true
  });

  const handleCreateTravel = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === travelForm.empId);
    if (!emp) return;

    storageService.submitTravelRequest({
      empId: emp.id,
      empName: emp.fullName || emp.name || 'Employee',
      designation: emp.designation,
      purpose: travelForm.purpose,
      originCity: travelForm.originCity,
      destinationCity: travelForm.destinationCity,
      departureDate: travelForm.departureDate,
      returnDate: travelForm.returnDate,
      estimatedCost: Number(travelForm.estimatedCost),
      perDiemAllowance: Number(travelForm.perDiemAllowance),
      advanceRequested: Number(travelForm.advanceRequested)
    });
    setTravelModalOpen(false);
    onRefresh();
  };

  const handleApproveTravel = (id: string) => {
    storageService.updateTravelRequestStatus(id, 'Approved', 'Operations Manager');
    onRefresh();
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === expenseForm.empId);
    if (!emp) return;

    storageService.submitExpenseClaim({
      empId: emp.id,
      empName: emp.fullName || emp.name || 'Employee',
      projectName: expenseForm.projectName,
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      expenseDate: expenseForm.expenseDate,
      receiptNumber: expenseForm.receiptNumber,
      description: expenseForm.description,
      billAttached: expenseForm.billAttached
    });
    setExpenseModalOpen(false);
    onRefresh();
  };

  const handleApproveExpense = (id: string) => {
    storageService.updateExpenseClaimStatus(id, 'Manager Approved');
    onRefresh();
  };

  const handleReimburseExpense = (id: string) => {
    storageService.updateExpenseClaimStatus(id, 'Finance Reimbursed');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Sub Tab Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setSubTab('travel')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'travel'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Site Travel Authorizations ({travelRequests.length})</span>
          </button>

          <button
            onClick={() => setSubTab('expenses')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              subTab === 'expenses'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Expense Claims & Reimbursements ({expenseClaims.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {subTab === 'travel' ? (
            <button
              onClick={() => setTravelModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Travel Request</span>
            </button>
          ) : (
            <button
              onClick={() => setExpenseModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Expense Claim</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. TRAVEL REQUESTS TAB */}
      {subTab === 'travel' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Request Ref</th>
                  <th className="py-3 px-4">Engineer</th>
                  <th className="py-3 px-4">Purpose & Destination</th>
                  <th className="py-3 px-4">Travel Dates</th>
                  <th className="py-3 px-4 text-right">Est. Cost / Advance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {travelRequests.map((tr) => (
                  <tr key={tr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{tr.travelCode}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{tr.empName}</div>
                      <div className="text-[11px] text-slate-400">{tr.designation}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{tr.purpose}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{tr.originCity} → {tr.destinationCity}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {tr.departureDate} to {tr.returnDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold font-mono text-slate-900">₹{tr.estimatedCost.toLocaleString()}</div>
                      <div className="text-[10px] font-mono text-slate-500">Adv: ₹{tr.advanceRequested.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        tr.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : tr.status === 'Submitted'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {tr.status === 'Submitted' && (
                        <button
                          onClick={() => handleApproveTravel(tr.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. EXPENSE CLAIMS TAB */}
      {subTab === 'expenses' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Claim Code</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Category & Details</th>
                  <th className="py-3 px-4">Project / Receipt</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenseClaims.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{exp.claimCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{exp.empName}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{exp.category}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{exp.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      <div>{exp.projectName || 'General Site'}</div>
                      <div className="font-mono text-slate-400">{exp.receiptNumber || 'Bill Verified'} • {exp.expenseDate}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        exp.status === 'Finance Reimbursed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : exp.status === 'Manager Approved'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {exp.status === 'Submitted' && (
                        <button
                          onClick={() => handleApproveExpense(exp.id)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                        >
                          Approve
                        </button>
                      )}
                      {exp.status === 'Manager Approved' && (
                        <button
                          onClick={() => handleReimburseExpense(exp.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                        >
                          Disburse
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Raise Travel */}
      {travelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Raise Site Travel Authorization</h3>
            <form onSubmit={handleCreateTravel} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Employee</label>
                <select
                  value={travelForm.empId}
                  onChange={(e) => setTravelForm({ ...travelForm, empId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName || emp.name} ({emp.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Purpose of Travel</label>
                <select
                  value={travelForm.purpose}
                  onChange={(e) => setTravelForm({ ...travelForm, purpose: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="Client Site Commissioning">Client Site Commissioning</option>
                  <option value="Tender Survey & Kickoff">Tender Survey & Kickoff</option>
                  <option value="Vendor Factory Inspection">Vendor Factory Inspection</option>
                  <option value="Architect / PMC Meeting">Architect / PMC Meeting</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Origin City</label>
                  <input
                    type="text"
                    required
                    value={travelForm.originCity}
                    onChange={(e) => setTravelForm({ ...travelForm, originCity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Destination City</label>
                  <input
                    type="text"
                    required
                    value={travelForm.destinationCity}
                    onChange={(e) => setTravelForm({ ...travelForm, destinationCity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={travelForm.departureDate}
                    onChange={(e) => setTravelForm({ ...travelForm, departureDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Return Date</label>
                  <input
                    type="date"
                    required
                    value={travelForm.returnDate}
                    onChange={(e) => setTravelForm({ ...travelForm, returnDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={travelForm.estimatedCost}
                    onChange={(e) => setTravelForm({ ...travelForm, estimatedCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Advance Requested (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={travelForm.advanceRequested}
                    onChange={(e) => setTravelForm({ ...travelForm, advanceRequested: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setTravelModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Submit Travel Authorization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Raise Expense */}
      {expenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Submit Site Expense Claim</h3>
            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Employee</label>
                <select
                  value={expenseForm.empId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, empId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName || emp.name} ({emp.designation})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expense Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="Site Fuel & Conveyance">Site Fuel & Conveyance</option>
                    <option value="Lodging & Hotel">Lodging & Hotel</option>
                    <option value="Tolls & Parking">Tolls & Parking</option>
                    <option value="Client Refreshments">Client Refreshments</option>
                    <option value="Emergency Site Hardware">Emergency Site Hardware</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.projectName}
                    onChange={(e) => setExpenseForm({ ...expenseForm, projectName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Receipt / Bill Number</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.receiptNumber}
                    onChange={(e) => setExpenseForm({ ...expenseForm, receiptNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expense Description</label>
                <textarea
                  rows={2}
                  required
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  Submit Expense Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
