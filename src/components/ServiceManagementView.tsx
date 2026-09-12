import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Calendar,
  FileText,
  Smartphone,
  Users,
  CreditCard,
  Truck,
  BarChart3,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Sliders
} from 'lucide-react';
import {
  ServiceWorkOrder,
  ServiceCustomer,
  ServiceEquipment,
  ServiceTechnician,
  TruckStockItem,
  FlatRatePriceBookItem,
  ServiceInvoice,
  ServiceAnalyticsKPIs
} from '../types/service';
import { serviceStorage } from '../services/serviceStorage';
import { ServiceDispatchCalendar } from './service/ServiceDispatchCalendar';
import { ServiceWorkOrdersList } from './service/ServiceWorkOrdersList';
import { TechnicianMobileFieldModal } from './service/TechnicianMobileFieldModal';
import { ServiceCustomerEquipmentView } from './service/ServiceCustomerEquipmentView';
import { ServiceInvoicingView } from './service/ServiceInvoicingView';
import { TruckStockView } from './service/TruckStockView';
import { ServiceAnalyticsView } from './service/ServiceAnalyticsView';

export const ServiceManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'dispatch' | 'workorders' | 'crm' | 'invoicing' | 'truckstock' | 'analytics'
  >('dispatch');

  // Reactive State
  const [workOrders, setWorkOrders] = useState<ServiceWorkOrder[]>([]);
  const [customers, setCustomers] = useState<ServiceCustomer[]>([]);
  const [equipments, setEquipments] = useState<ServiceEquipment[]>([]);
  const [technicians, setTechnicians] = useState<ServiceTechnician[]>([]);
  const [truckStock, setTruckStock] = useState<TruckStockItem[]>([]);
  const [priceBook, setPriceBook] = useState<FlatRatePriceBookItem[]>([]);
  const [invoices, setInvoices] = useState<ServiceInvoice[]>([]);
  const [kpis, setKpis] = useState<ServiceAnalyticsKPIs>({
    totalTickets: 0,
    completedTickets: 0,
    activeEmergencies: 0,
    firstTimeFixRatePct: 89,
    meanTimeToRepairHours: 2.4,
    avgCustomerRating: 4.88,
    monthlyServiceRevenue: 0,
    activeAmcContracts: 0
  });

  // Selected ticket for drawer / modal
  const [selectedTicket, setSelectedTicket] = useState<ServiceWorkOrder | null>(null);
  const [mobileTicket, setMobileTicket] = useState<ServiceWorkOrder | null>(null);

  const loadData = () => {
    setWorkOrders(serviceStorage.getWorkOrders());
    setCustomers(serviceStorage.getCustomers());
    setEquipments(serviceStorage.getEquipments());
    setTechnicians(serviceStorage.getTechnicians());
    setTruckStock(serviceStorage.getTruckStock());
    setPriceBook(serviceStorage.getPriceBook());
    setInvoices(serviceStorage.getInvoices());
    setKpis(serviceStorage.getAnalyticsKPIs());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = serviceStorage.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const handleOpenMobileMode = (ticket: ServiceWorkOrder) => {
    setMobileTicket(ticket);
  };

  const handleGenerateInvoice = (ticket: ServiceWorkOrder) => {
    const inv = serviceStorage.generateInvoiceFromWorkOrder(ticket);
    setActiveTab('invoicing');
    loadData();
  };

  const emergencyCount = workOrders.filter(
    (wo) => wo.priority === 'P1 - Emergency Breakdown' && wo.status !== 'Completed' && wo.status !== 'Invoiced'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Service Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  HVAC Service & Field Operations Management
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  FSM Suite v3.5
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                End-to-end dispatching, real-time technician GPS tracking, digital checklists, mobile signoffs, and 18% GST billing.
              </p>
            </div>
          </div>
        </div>

        {/* Key Quick Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          {emergencyCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>{emergencyCount} P1 Emergency</span>
            </div>
          )}

          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-blue-600" />
            <span>{technicians.filter((t) => t.status !== 'Off Duty').length} Vans Active</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{kpis.firstTimeFixRatePct}% FTFR Fix Rate</span>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs font-bold scrollbar-none">
        {[
          { id: 'dispatch', label: '1. Scheduling & Dispatch', icon: Calendar, badge: workOrders.length },
          { id: 'workorders', label: '2. Work Orders & Tickets', icon: FileText, badge: workOrders.filter(w => w.status !== 'Completed' && w.status !== 'Invoiced').length },
          { id: 'crm', label: '4. Customer & Equipment CRM', icon: Users, badge: customers.length },
          { id: 'invoicing', label: '5. Invoicing & Price Book', icon: CreditCard, badge: invoices.length },
          { id: 'truckstock', label: '6. Truck Stock & Inventory', icon: Truck, badge: truckStock.filter(s => s.currentStock <= s.minThreshold).length || undefined },
          { id: 'analytics', label: '7 & 8. Analytics & Integrations', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Test Mobile App Button */}
        <button
          onClick={() => {
            const activeOrFirst = workOrders.find((w) => w.status === 'In Progress' || w.status === 'On Site') || workOrders[0];
            if (activeOrFirst) setMobileTicket(activeOrFirst);
          }}
          className="ml-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Smartphone className="w-4 h-4" />
          <span>Launch Field Tech Mobile App</span>
        </button>
      </div>

      {/* View Switcher */}
      {activeTab === 'dispatch' && (
        <ServiceDispatchCalendar
          workOrders={workOrders}
          technicians={technicians}
          onSelectTicket={(ticket) => {
            setSelectedTicket(ticket);
            setActiveTab('workorders');
          }}
          onOpenNewTicket={() => {
            setActiveTab('workorders');
          }}
          onRefresh={loadData}
        />
      )}

      {activeTab === 'workorders' && (
        <ServiceWorkOrdersList
          workOrders={workOrders}
          customers={customers}
          equipments={equipments}
          technicians={technicians}
          selectedTicket={selectedTicket}
          onSelectTicket={setSelectedTicket}
          onOpenMobileMode={handleOpenMobileMode}
          onGenerateInvoice={handleGenerateInvoice}
          onRefresh={loadData}
        />
      )}

      {activeTab === 'crm' && (
        <ServiceCustomerEquipmentView
          customers={customers}
          equipments={equipments}
          onRefresh={loadData}
          onDispatchForEquipment={(eq) => {
            setSelectedTicket(null);
            setActiveTab('workorders');
          }}
        />
      )}

      {activeTab === 'invoicing' && (
        <ServiceInvoicingView
          invoices={invoices}
          priceBook={priceBook}
          onRefresh={loadData}
        />
      )}

      {activeTab === 'truckstock' && (
        <TruckStockView
          truckStock={truckStock}
          technicians={technicians}
          onRefresh={loadData}
        />
      )}

      {activeTab === 'analytics' && (
        <ServiceAnalyticsView
          kpis={kpis}
          technicians={technicians}
          onRefresh={loadData}
        />
      )}

      {/* Technician Mobile Field Access Modal (Module 3) */}
      {mobileTicket && (
        <TechnicianMobileFieldModal
          order={mobileTicket}
          truckStock={truckStock}
          onClose={() => setMobileTicket(null)}
          onJobCompleted={(updated) => {
            setMobileTicket(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
