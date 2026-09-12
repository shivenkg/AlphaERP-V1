import React, { useState } from 'react';
import {
  CreditCard,
  FileText,
  Search,
  Download,
  CheckCircle2,
  Clock,
  DollarSign,
  Share2,
  BookOpen,
  Plus,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ServiceInvoice, FlatRatePriceBookItem } from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';

interface ServiceInvoicingViewProps {
  invoices: ServiceInvoice[];
  priceBook: FlatRatePriceBookItem[];
  onRefresh: () => void;
}

export const ServiceInvoicingView: React.FC<ServiceInvoicingViewProps> = ({
  invoices,
  priceBook,
  onRefresh
}) => {
  const [subTab, setSubTab] = useState<'invoices' | 'pricebook'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<ServiceInvoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<ServiceInvoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'ACH/Bank'>('UPI');
  const [paymentRefInput, setPaymentRefInput] = useState('');

  const filteredInvoices = invoices.filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPriceBook = priceBook.filter((item) =>
    item.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    serviceStorage.markInvoicePaid(
      paymentModalInvoice.id,
      paymentMethod,
      paymentRefInput || `UPI-${Date.now().toString().slice(-6)}`
    );
    setPaymentModalInvoice(null);
    setPaymentRefInput('');
    onRefresh();
  };

  const handleExportQuickBooks = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(invoices, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AlphaERP-Service-Invoices-QuickBooks-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Toggle subtab */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSubTab('invoices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'invoices'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Service Tax Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setSubTab('pricebook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'pricebook'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Flat Rate Price Book ({priceBook.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
          />
        </div>

        {/* QuickBooks / Xero Export */}
        <button
          onClick={handleExportQuickBooks}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Sync QuickBooks / Xero</span>
        </button>
      </div>

      {/* INVOICES TABLE */}
      {subTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="py-3 px-4">Invoice # / Date</th>
                  <th className="py-3 px-4">Customer & Ticket</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">GST (18%)</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No invoices found. Generate an invoice from any completed Service Work Order!
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isPaid = inv.paymentStatus.startsWith('Paid') || inv.paymentStatus === 'AMC Covered';
                    const badgeClass = isPaid
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse';

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-blue-600 dark:text-blue-400">{inv.invoiceNumber}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{inv.invoiceDate}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{inv.customerName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Ticket: {inv.ticketNumber}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                          ₹{inv.subtotal.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-500">
                          ₹{inv.gstAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          ₹{inv.grandTotal.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          {!isPaid && (
                            <button
                              onClick={() => setPaymentModalInvoice(inv)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold shadow-xs"
                            >
                              Record Payment
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold"
                          >
                            View
                          </button>
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

      {/* FLAT RATE PRICE BOOK */}
      {subTab === 'pricebook' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPriceBook.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {item.category}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">{item.code}</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.serviceName}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Standard Labor ({item.standardHours}h):</span>
                  <span className="font-mono">₹{item.fixedLaborFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Standard Parts Allowance:</span>
                  <span className="font-mono">₹{item.standardPartsFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100">
                  <span>Flat Rate Price:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">₹{item.totalFlatRate.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Record Service Payment
            </h3>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100">{paymentModalInvoice.customerName}</div>
              <div className="text-slate-500">Invoice: {paymentModalInvoice.invoiceNumber}</div>
              <div className="text-sm font-bold font-mono text-emerald-600 pt-1">
                Amount Due: ₹{paymentModalInvoice.grandTotal.toLocaleString('en-IN')}
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Payment Method:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['UPI', 'Card', 'ACH/Bank'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                        paymentMethod === m
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Transaction Ref / Cheque #:</label>
                <input
                  type="text"
                  value={paymentRefInput}
                  onChange={(e) => setPaymentRefInput(e.target.value)}
                  placeholder="e.g. UPI-RAZORPAY-992104"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detailed Preview Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">{selectedInvoice.invoiceNumber}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">HVAC Service Tax Invoice</h3>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100">{selectedInvoice.customerName}</div>
              <div className="text-slate-500">{selectedInvoice.billingAddress}</div>
              <div className="text-slate-500">Phone: {selectedInvoice.customerPhone}</div>
              <div className="text-[11px] font-mono text-blue-600 pt-1">Service Ticket: {selectedInvoice.ticketNumber}</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Replaced Parts Subtotal:</span>
                <span className="font-mono font-semibold">₹{selectedInvoice.partsTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">HVAC Technician Labor:</span>
                <span className="font-mono font-semibold">₹{selectedInvoice.laborTotal.toLocaleString('en-IN')}</span>
              </div>
              {selectedInvoice.flatRateTotal > 0 && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Flat Rate Service Fee:</span>
                  <span className="font-mono font-semibold">₹{selectedInvoice.flatRateTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-mono font-bold">₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <span>Integrated GST (18%):</span>
                <span className="font-mono">₹{selectedInvoice.gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-slate-900 dark:text-slate-100 bg-blue-50/50 dark:bg-blue-950/30 p-2.5 rounded-xl">
                <span>Grand Total (INR):</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">₹{selectedInvoice.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
