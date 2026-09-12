import React, { useState } from 'react';
import {
  Building2,
  Users,
  Search,
  Plus,
  Wrench,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import {
  ServiceCustomer,
  ServiceEquipment,
  EquipmentType,
  AmcContractType,
  PreferredContactMethod
} from '../../types/service';
import { serviceStorage } from '../../services/serviceStorage';

interface ServiceCustomerEquipmentViewProps {
  customers: ServiceCustomer[];
  equipments: ServiceEquipment[];
  onRefresh: () => void;
  onDispatchForEquipment?: (equipment: ServiceEquipment) => void;
}

export const ServiceCustomerEquipmentView: React.FC<ServiceCustomerEquipmentViewProps> = ({
  customers,
  equipments,
  onRefresh,
  onDispatchForEquipment
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'equipments'>('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);

  // Add Customer Form
  const [custName, setCustName] = useState('');
  const [custCompany, setCustCompany] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custCity, setCustCity] = useState('Mumbai');
  const [custContactMethod, setCustContactMethod] = useState<PreferredContactMethod>('WhatsApp');

  // Add Equipment Form
  const [eqCustomerId, setEqCustomerId] = useState(customers[0]?.id || '');
  const [eqType, setEqType] = useState<EquipmentType>('VRV / VRF Outdoor Unit');
  const [eqBrand, setEqBrand] = useState('Daikin');
  const [eqModel, setEqModel] = useState('');
  const [eqSerial, setEqSerial] = useState('');
  const [eqTonnage, setEqTonnage] = useState(20);
  const [eqRefrigerant, setEqRefrigerant] = useState<'R-410A' | 'R-32' | 'R-134a' | 'R-22'>('R-410A');
  const [eqAmcType, setEqAmcType] = useState<AmcContractType>('Comprehensive AMC');
  const [eqLocationNotes, setEqLocationNotes] = useState('');

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEquipments = equipments.filter((e) => {
    const matchesSearch =
      e.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCust = selectedCustomerId ? e.customerId === selectedCustomerId : true;
    return matchesSearch && matchesCust;
  });

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCust: ServiceCustomer = {
      id: `scust-${Date.now()}`,
      name: custName,
      companyName: custCompany || custName,
      phone: custPhone,
      email: custEmail,
      address: custAddress,
      city: custCity,
      preferredContact: custContactMethod,
      amcStatus: 'Active',
      amcExpiryDate: '2027-03-31',
      totalEquipments: 0,
      openTicketsCount: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };
    serviceStorage.saveCustomer(newCust);
    setIsAddCustomerOpen(false);
    onRefresh();
  };

  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === eqCustomerId) || customers[0];
    const newEq: ServiceEquipment = {
      id: `seq-${Date.now()}`,
      customerId: cust.id,
      customerName: cust.name,
      type: eqType,
      brand: eqBrand,
      modelNumber: eqModel || `${eqBrand}-${eqType.slice(0, 3)}-${eqTonnage}TR`,
      serialNumber: eqSerial || `${eqBrand.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      capacityTR: eqTonnage,
      refrigerantType: eqRefrigerant,
      installDate: new Date().toISOString().split('T')[0],
      warrantyExpiry: new Date(Date.now() + 365 * 2 * 86400000).toISOString().split('T')[0],
      amcType: eqAmcType,
      amcExpiry: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: 'Operational',
      lastServicedDate: new Date().toISOString().split('T')[0],
      locationNotes: eqLocationNotes || 'Main Plant Room / Rooftop'
    };
    serviceStorage.saveEquipment(newEq);
    setIsAddEquipmentOpen(false);
    onRefresh();
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Toggle subtabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveSubTab('customers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'customers'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Customer CRM ({customers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('equipments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'equipments'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            HVAC Equipment Assets ({equipments.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients or serial #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
          />
        </div>

        {/* Action Button */}
        <div>
          {activeSubTab === 'customers' ? (
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register Customer</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddEquipmentOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register Equipment</span>
            </button>
          )}
        </div>
      </div>

      {/* CUSTOMERS VIEW */}
      {activeSubTab === 'customers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const amcBadge =
              cust.amcStatus === 'Active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : cust.amcStatus === 'Expiring Soon'
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 animate-pulse'
                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';

            return (
              <div
                key={cust.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{cust.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{cust.companyName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${amcBadge}`}>
                      {cust.amcStatus}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{cust.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      {cust.address}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {equipments.filter((e) => e.customerId === cust.id).length} Units Covered
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCustomerId(cust.id);
                      setActiveSubTab('equipments');
                    }}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>View Assets</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EQUIPMENTS VIEW */}
      {activeSubTab === 'equipments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>Equipment Lifecycle & AMC Repository ({filteredEquipments.length})</span>
            </h3>
            {selectedCustomerId && (
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Clear Customer Filter
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="py-3 px-4">Equipment & Serial #</th>
                  <th className="py-3 px-4">Client Site</th>
                  <th className="py-3 px-4">Capacity & Gas</th>
                  <th className="py-3 px-4">AMC Contract</th>
                  <th className="py-3 px-4">Health Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEquipments.map((eq) => {
                  const statusBadge =
                    eq.status === 'Operational'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : eq.status === 'Requires Service'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';

                  return (
                    <tr key={eq.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{eq.brand} {eq.type}</div>
                        <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{eq.serialNumber}</div>
                      </td>
                      <td className="py-3 px-4 max-w-[180px]">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{eq.customerName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{eq.locationNotes}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{eq.capacityTR} TR</div>
                        <div className="text-[10px] text-slate-500">{eq.refrigerantType}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{eq.amcType}</div>
                        <div className="text-[10px] text-slate-400">Expires: {eq.amcExpiry}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                          {eq.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDispatchForEquipment && onDispatchForEquipment(eq)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
                        >
                          Dispatch Service
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Register New Customer Profile
              </h3>
              <button onClick={() => setIsAddCustomerOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Customer / Facility Name:</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Fortis Hospital Vashi"
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Parent Company / Org:</label>
                <input
                  type="text"
                  value={custCompany}
                  onChange={(e) => setCustCompany(e.target.value)}
                  placeholder="e.g. Fortis Healthcare Ltd."
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone / WhatsApp:</label>
                  <input
                    type="text"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+91 98200..."
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email:</label>
                  <input
                    type="email"
                    required
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="facility@domain.com"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Site Address:</label>
                <textarea
                  rows={2}
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="Plot 10, Sector 12, Vashi, Navi Mumbai..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {isAddEquipmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                Register HVAC Equipment Asset
              </h3>
              <button onClick={() => setIsAddEquipmentOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Assigned Customer Site:</label>
                <select
                  value={eqCustomerId}
                  onChange={(e) => setEqCustomerId(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Brand:</label>
                  <select
                    value={eqBrand}
                    onChange={(e) => setEqBrand(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {['Daikin', 'Carrier', 'Trane', 'Blue Star', 'Voltas', 'LG', 'Mitsubishi', 'York'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Capacity (TR Tonnage):</label>
                  <input
                    type="number"
                    value={eqTonnage}
                    onChange={(e) => setEqTonnage(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Equipment Category / Type:</label>
                <select
                  value={eqType}
                  onChange={(e) => setEqType(e.target.value as EquipmentType)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {[
                    'VRV / VRF Outdoor Unit',
                    'Water-Cooled Screw Chiller',
                    'Air-Cooled Package Chiller',
                    'Air Handling Unit (AHU)',
                    'Ductable Split System',
                    'Cassette Indoor Unit',
                    'Cooling Tower'
                  ].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Serial Number:</label>
                  <input
                    type="text"
                    required
                    value={eqSerial}
                    onChange={(e) => setEqSerial(e.target.value)}
                    placeholder="e.g. DKN-VRV-9011"
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Refrigerant:</label>
                  <select
                    value={eqRefrigerant}
                    onChange={(e) => setEqRefrigerant(e.target.value as any)}
                    className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="R-410A">R-410A</option>
                    <option value="R-32">R-32</option>
                    <option value="R-134a">R-134a</option>
                    <option value="R-22">R-22</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEquipmentOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
