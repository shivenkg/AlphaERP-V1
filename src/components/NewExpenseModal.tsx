import React, { useState } from 'react';
import {
  X,
  Receipt,
  DollarSign,
  Building,
  User,
  Calendar,
  FileText,
  CheckCircle2,
  Paperclip,
  Tag
} from 'lucide-react';
import { Project, Employee, ExpenseClaim } from '../types';
import { storageService } from '../services/storageService';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: Project[];
  employees?: Employee[];
  onExpenseCreated?: () => void;
}

const EXPENSE_CATEGORIES: Array<{
  value: ExpenseClaim['category'];
  label: string;
  desc: string;
}> = [
  {
    value: 'Site Fuel & Conveyance',
    label: 'Site Fuel & Conveyance',
    desc: 'Local technician travel, site visits, fuel, cab fares'
  },
  {
    value: 'Emergency Site Hardware',
    label: 'Emergency Site Hardware',
    desc: 'Urgent local fasteners, copper elbows, brazing rods, tape'
  },
  {
    value: 'Lodging & Hotel',
    label: 'Lodging & Hotel',
    desc: 'Outstation site commissioning hotel stay & boarding'
  },
  {
    value: 'Tolls & Parking',
    label: 'Tolls & Parking',
    desc: 'Expressway tolls and vehicle site parking charges'
  },
  {
    value: 'Client Refreshments',
    label: 'Client Refreshments',
    desc: 'Kickoff and progress meetings with client/PMC engineers'
  }
];

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  projects = [],
  employees = [],
  onExpenseCreated
}) => {
  const activeEmployees = employees.length > 0 ? employees : storageService.getEmployees();
  const activeProjects = projects.length > 0 ? projects : storageService.getProjects();

  const [empId, setEmpId] = useState(activeEmployees[0]?.id || 'emp-001');
  const [projectName, setProjectName] = useState(
    activeProjects[0]?.name || 'Phoenix Mall VRF Installation'
  );
  const [category, setCategory] = useState<ExpenseClaim['category']>(
    'Site Fuel & Conveyance'
  );
  const [amount, setAmount] = useState<number | ''>(2500);
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [receiptNumber, setReceiptNumber] = useState('REC-2026-');
  const [description, setDescription] = useState(
    'Urgent technician site visit conveyance and pressure test fittings'
  );
  const [billAttached, setBillAttached] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setIsSubmitting(true);
    const selectedEmp = activeEmployees.find((e) => e.id === empId);
    const empName = selectedEmp?.fullName || selectedEmp?.name || 'Shivender Kumar';

    const newClaim = storageService.submitExpenseClaim({
      empId,
      empName,
      projectName: projectName.trim(),
      category,
      amount: Number(amount),
      expenseDate,
      receiptNumber: receiptNumber.trim() || undefined,
      description: description.trim(),
      billAttached
    });

    storageService.addNotification(
      'Expense Log Created',
      `Expense claim ${newClaim.claimCode} for ₹${Number(amount).toLocaleString()} logged for ${empName} (${projectName}).`,
      'success',
      'finance'
    );

    setIsSubmitting(false);
    if (onExpenseCreated) {
      onExpenseCreated();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Log New Expense
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record site expense, emergency purchase, or conveyance claim
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Claimant / Employee</span>
              </label>
              <select
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {activeEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName || emp.name} ({emp.empCode || emp.designation || 'Staff'})
                  </option>
                ))}
              </select>
            </div>

            {/* Project Allocation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Project / Cost Center</span>
              </label>
              <select
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.projectCode ? `${p.projectCode} - ` : ''}{p.name}
                  </option>
                ))}
                <option value="General Office Overhead & Travel">
                  General Office Overhead & Travel
                </option>
                <option value="Tender Survey & Pre-bid Visits">
                  Tender Survey & Pre-bid Visits
                </option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Expense Category</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    category === cat.value
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold">{cat.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {cat.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Amount (₹ INR) *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2500"
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Expense Incurred Date *</span>
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Receipt Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Bill / Tax Voucher / Receipt Reference #</span>
            </label>
            <input
              type="text"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="e.g. REC-2026-8910 or Fuel Slip #512"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description & Work Purpose *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief details regarding why the expenditure was incurred on site..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          {/* Bill Attached Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="billAttached"
              checked={billAttached}
              onChange={(e) => setBillAttached(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 dark:border-slate-700 focus:ring-emerald-500 cursor-pointer"
            />
            <label
              htmlFor="billAttached"
              className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 cursor-pointer select-none"
            >
              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
              <span>Physical / digital invoice receipt proof attached</span>
            </label>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Logging...' : 'Submit Expense Log'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
