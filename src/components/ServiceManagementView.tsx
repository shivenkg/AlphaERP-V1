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
  Sliders,
  Mail,
  Send,
  Loader2,
  QrCode
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
import { AmcCalendarDashboard } from './service/AmcCalendarDashboard';
import { AssetServiceHistoryTimeline } from './service/AssetServiceHistoryTimeline';
import { CalendarCheck, History, AlertCircle, ShieldCheck } from 'lucide-react';
import { ServiceRequestView } from './service/ServiceRequestView';
import { AmcRenewalView } from './service/AmcRenewalView';
import { AmcExpirationWidget } from './service/AmcExpirationWidget';
import { CreateServiceRequestModal } from './service/CreateServiceRequestModal';
import { TechnicianTurnaroundChart } from './service/TechnicianTurnaroundChart';
import { TechnicianWorkloadView } from './service/TechnicianWorkloadView';

export const ServiceManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'requests' | 'dispatch' | 'workorders' | 'amc' | 'amcrenewal' | 'history' | 'crm' | 'invoicing' | 'truckstock' | 'analytics'
  >('requests');

  // Technician Workload View Toggle Mode
  const [showTechnicianView, setShowTechnicianView] = useState(false);

  // Reactive State
  const [workOrders, setWorkOrders] = useState<ServiceWorkOrder[]>([]);
  const [customers, setCustomers] = useState<ServiceCustomer[]>([]);
  const [equipments, setEquipments] = useState<ServiceEquipment[]>([]);
  const [technicians, setTechnicians] = useState<ServiceTechnician[]>([]);
  const [truckStock, setTruckStock] = useState<TruckStockItem[]>([]);
  const [priceBook, setPriceBook] = useState<FlatRatePriceBookItem[]>([]);
  const [invoices, setInvoices] = useState<ServiceInvoice[]>([]);
  const [selectedAssetHistoryId, setSelectedAssetHistoryId] = useState<string | null>(null);
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] = useState(false);
  const [createRequestPreselectedAssetId, setCreateRequestPreselectedAssetId] = useState<string | null>(null);
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

  // Automated 30-Day AMC Expiry Email Notification State
  const [isTriggeringAmcEmail, setIsTriggeringAmcEmail] = useState(false);
  const [amcAlertNotice, setAmcAlertNotice] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
    count?: number;
  } | null>(null);

  // Turnaround Time Recharts Chart Visibility Toggle
  const [showTurnaroundChart, setShowTurnaroundChart] = useState(false);

  // Filter state passed from KPI cards to table views
  const [kpiFilterStatus, setKpiFilterStatus] = useState<string | null>(null);
  const [activeKpiFilterLabel, setActiveKpiFilterLabel] = useState<string | null>(null);

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

    // Automated 30-day AMC expiry alert trigger check in background
    serviceStorage
      .trigger30DayAmcExpiryAlerts(false)
      .then((res) => {
        if (res.dispatched && res.count > 0) {
          setAmcAlertNotice({
            type: 'success',
            text: `Automated Notification: Alert email dispatched to sales team for ${res.count} AMC contract(s) expiring within 30 days.`,
            count: res.count
          });
        }
      })
      .catch((err) => {
        console.warn('Automated 30-day AMC expiry alert check failed:', err);
      });

    // Periodic scheduled check every 4 hours
    const timer = setInterval(() => {
      serviceStorage.trigger30DayAmcExpiryAlerts(false).catch(() => {});
    }, 4 * 60 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  // Listen to hash changes (e.g. scanning HVAC asset QR tag: #asset-history?id=eq-01)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#asset-history')) {
        const query = hash.split('?')[1];
        if (query) {
          const params = new URLSearchParams(query);
          const id = params.get('id');
          if (id) {
            setSelectedAssetHistoryId(id);
            setActiveTab('history');
          }
        } else {
          setActiveTab('history');
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTriggerAmcEmailAlerts = async () => {
    setIsTriggeringAmcEmail(true);
    setAmcAlertNotice(null);
    try {
      const res = await serviceStorage.trigger30DayAmcExpiryAlerts(true);
      setAmcAlertNotice({
        type: res.count > 0 ? 'success' : 'info',
        text: res.note,
        count: res.count
      });
      loadData();
    } catch (err: any) {
      setAmcAlertNotice({
        type: 'error',
        text: err?.message || 'Failed to dispatch AMC alert emails.'
      });
    } finally {
      setIsTriggeringAmcEmail(false);
    }
  };

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

        {/* Key Quick Stats & Create Request Action */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Technician View Toggle */}
          <button
            id="btn-technician-view-toggle"
            onClick={() => setShowTechnicianView(!showTechnicianView)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
              showTechnicianView
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="Toggle technician employee workload & daily task limits view"
          >
            <Users className="w-4 h-4" />
            <span>{showTechnicianView ? 'Exit Tech View' : 'Technician View'}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                showTechnicianView
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {technicians.length} Techs
            </span>
          </button>

          <button
            onClick={() => {
              setCreateRequestPreselectedAssetId(null);
              setIsCreateRequestModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Service Request</span>
          </button>

          <button
            onClick={() => setShowTurnaroundChart(!showTurnaroundChart)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              showTurnaroundChart
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Recharts technician resolution turnaround time chart"
          >
            <Clock className={`w-4 h-4 ${showTurnaroundChart ? 'text-white' : 'text-blue-600'}`} />
            <span>{showTurnaroundChart ? 'Hide TAT Chart' : 'Technician TAT Chart'}</span>
          </button>

          <button
            onClick={handleTriggerAmcEmailAlerts}
            disabled={isTriggeringAmcEmail}
            className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Trigger automated 30-day AMC expiry email alert notification to sales team"
          >
            {isTriggeringAmcEmail ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            ) : (
              <Mail className="w-4 h-4 text-amber-600" />
            )}
            <span>{isTriggeringAmcEmail ? 'Dispatching...' : 'Dispatch 30-Day AMC Alerts'}</span>
          </button>

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

      {/* Top-Level Summary Row: Immediate Operational Pulse (KPI Cards) */}
      {(() => {
        const allAmcs = serviceStorage.getAmcContracts();
        const activeAmcs = allAmcs.filter(
          (c) => c.status === 'Active' || new Date(c.endDate).getTime() >= Date.now()
        );
        const totalActiveAmcs = activeAmcs.length || customers.filter((c) => c.amcStatus === 'Active').length || kpis.activeAmcContracts;
        const expiringSoonAmcs = allAmcs.filter((c) => {
          const diffMs = new Date(c.endDate).getTime() - Date.now();
          const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          return days >= 0 && days <= 30 && c.renewalStatus !== 'Renewed';
        }).length;

        const allReqs = serviceStorage.getServiceRequests();
        const pendingReqs = allReqs.filter(
          (r) => r.status !== 'Resolved' && r.status !== 'Cancelled'
        );
        const pendingRequestsCount = pendingReqs.length;
        const emergencyReqsCount = pendingReqs.filter(
          (r) => r.priority === 'P1 - Emergency Breakdown'
        ).length;
        const unassignedReqsCount = pendingReqs.filter(
          (r) => !r.assignedTechnicianId || r.status === 'New'
        ).length;

        const avgRespTime = kpis.meanTimeToRepairHours ? `${kpis.meanTimeToRepairHours} Hrs` : '2.4 Hrs';

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Total Active AMCs */}
            <div
              id="kpi-card-total-active-amcs"
              onClick={() => {
                setShowTechnicianView(false);
                setKpiFilterStatus('Active');
                setActiveKpiFilterLabel('Filter: Active AMC Contracts');
                setActiveTab('amc');
              }}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${
                activeTab === 'amc' && kpiFilterStatus === 'Active'
                  ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
              title="Click to filter and view Active AMC Contracts"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                      Total Active AMCs
                    </span>
                    {activeTab === 'amc' && kpiFilterStatus === 'Active' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        FILTER ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                    {totalActiveAmcs} <span className="text-xs font-semibold text-slate-400">Contracts</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {expiringSoonAmcs > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      ● {expiringSoonAmcs} Expiring in &le;30d
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      ● 100% Active SLA Coverage
                    </span>
                  )}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Filter AMC Table →
                </span>
              </div>
            </div>

            {/* Card 2: Pending Service Requests */}
            <div
              id="kpi-card-pending-service-requests"
              onClick={() => {
                setShowTechnicianView(false);
                setKpiFilterStatus('Pending');
                setActiveKpiFilterLabel('Filter: Pending / Open Service Requests');
                setActiveTab('requests');
              }}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${
                activeTab === 'requests' && kpiFilterStatus === 'Pending'
                  ? 'border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
              title="Click to filter and view all Pending Service Requests"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                      Pending Service Requests
                    </span>
                    {activeTab === 'requests' && kpiFilterStatus === 'Pending' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                        FILTER ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                    {pendingRequestsCount} <span className="text-xs font-semibold text-slate-400">Tickets</span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 group-hover:scale-105 transition-transform">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {emergencyReqsCount > 0 ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                      ● {emergencyReqsCount} Critical P1 • {unassignedReqsCount} Unassigned
                    </span>
                  ) : (
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {unassignedReqsCount} Unassigned for Dispatch
                    </span>
                  )}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Filter Request Queue →
                </span>
              </div>
            </div>

            {/* Card 3: Average Response Time (Hrs) */}
            <div
              id="kpi-card-average-response-time"
              onClick={() => {
                setShowTechnicianView(false);
                setShowTurnaroundChart(true);
                setKpiFilterStatus('Pending');
                setActiveKpiFilterLabel('Filter: Active Tickets by SLA Response Time');
                setActiveTab('workorders');
              }}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${
                activeTab === 'workorders' && kpiFilterStatus === 'Pending'
                  ? 'border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
              title="Click to filter Active Tickets by Response Time and display TAT chart"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                      Average Response Time (Hrs)
                    </span>
                    {activeTab === 'workorders' && kpiFilterStatus === 'Pending' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                        FILTER ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
                    {avgRespTime}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    ● Target: &le; 4.0 Hrs (SLA Met)
                  </span>{' '}
                  • FTFR: {kpis.firstTimeFixRatePct}%
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Filter Active Tickets & TAT →
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Automated AMC 30-Day Expiry Notification Banner */}
      {amcAlertNotice && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 border animate-in fade-in duration-200 shadow-xs ${
            amcAlertNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : amcAlertNotice.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {amcAlertNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : amcAlertNotice.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <Mail className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <div>
              <span className="font-bold block text-sm">
                {amcAlertNotice.type === 'success'
                  ? '30-Day AMC Expiry Alert Dispatched to Sales Team'
                  : 'AMC Notification Service Status'}
              </span>
              <span className="text-xs opacity-90">{amcAlertNotice.text}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('amcrenewal')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-50 transition-colors"
            >
              View Expiring Contracts
            </button>
            <button
              onClick={() => setAmcAlertNotice(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Conditionally Rendered Technician Turnaround Time Chart */}
      {showTurnaroundChart && (
        <div className="animate-in fade-in duration-200">
          <TechnicianTurnaroundChart
            onSelectTechnician={(techId) => {
              setActiveTab('workorders');
            }}
          />
        </div>
      )}

      {/* AMC Expiration Watchlist Widget (30 / 60 / 90 Days) */}
      <AmcExpirationWidget
        onNavigateToRenewals={() => setActiveTab('amcrenewal')}
        onNavigateToCalendar={() => setActiveTab('amc')}
        onNavigateToAssetHistory={(eqId) => {
          setSelectedAssetHistoryId(eqId);
          setActiveTab('history');
        }}
        onOpenRenewModal={() => {
          setActiveTab('amcrenewal');
        }}
      />

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs font-bold scrollbar-none">
        {[
          {
            id: 'requests',
            label: '1. Service Request',
            icon: AlertCircle,
            badge: serviceStorage.getServiceRequests().filter((r) => r.status !== 'Resolved' && r.status !== 'Cancelled').length || undefined,
            badgeAlert: true
          },
          { id: 'dispatch', label: '2. Scheduling & Dispatch', icon: Calendar, badge: workOrders.length },
          { id: 'workorders', label: '3. Work Orders & Tickets', icon: FileText, badge: workOrders.filter(w => w.status !== 'Completed' && w.status !== 'Invoiced').length },
          { id: 'amc', label: '4. AMC Calendar & Visits', icon: CalendarCheck, badge: serviceStorage.getAmcVisits().filter(v => v.status === 'Due Soon' || v.status === 'Overdue').length || undefined },
          {
            id: 'amcrenewal',
            label: '5. AMC Renewal',
            icon: RefreshCw,
            badge: serviceStorage.getAmcContracts().filter((c) => {
              const diffMs = new Date(c.endDate).getTime() - Date.now();
              const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              return days <= 30 && c.renewalStatus !== 'Renewed';
            }).length || undefined,
            badgeAmber: true
          },
          { id: 'history', label: '6. Service History Timeline', icon: History, badge: serviceStorage.getAssetServiceHistory().length },
          { id: 'crm', label: '7. Customer & Equipment CRM', icon: Users, badge: customers.length },
          { id: 'invoicing', label: '8. Invoicing & Price Book', icon: CreditCard, badge: invoices.length },
          { id: 'truckstock', label: '9. Truck Stock & Inventory', icon: Truck, badge: truckStock.filter(s => s.currentStock <= s.minThreshold).length || undefined },
          { id: 'analytics', label: '10. Analytics & Integrations', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = !showTechnicianView && activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setShowTechnicianView(false);
                setKpiFilterStatus(null);
                setActiveKpiFilterLabel(null);
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
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
                      : tab.badgeAlert
                      ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold'
                      : tab.badgeAmber
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Technician View Toggle Tab Pill */}
        <button
          onClick={() => setShowTechnicianView(!showTechnicianView)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            showTechnicianView
              ? 'bg-indigo-600 text-white shadow-xs font-bold'
              : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Technician Workload View</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              showTechnicianView
                ? 'bg-white/20 text-white'
                : 'bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold'
            }`}
          >
            {technicians.length} Techs
          </span>
        </button>

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

      {/* Active KPI Filter Banner with Clear Filter Button */}
      {kpiFilterStatus && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-2xl text-xs">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span className="font-bold">Active KPI Filter:</span>
            <span>{activeKpiFilterLabel || kpiFilterStatus}</span>
          </div>
          <button
            onClick={() => {
              setKpiFilterStatus(null);
              setActiveKpiFilterLabel(null);
            }}
            className="text-xs font-bold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 underline hover:no-underline cursor-pointer transition-colors"
          >
            Clear KPI Filter ✕
          </button>
        </div>
      )}

      {/* View Switcher: Technician Workload vs Module Tabs */}
      {showTechnicianView ? (
        <TechnicianWorkloadView
          technicians={technicians}
          workOrders={workOrders}
          onRefresh={loadData}
          onSelectWorkOrder={(ticket) => {
            setSelectedTicket(ticket);
            setShowTechnicianView(false);
            setActiveTab('workorders');
          }}
          onNavigateToRequests={() => {
            setShowTechnicianView(false);
            setActiveTab('requests');
          }}
        />
      ) : (
        <>
          {activeTab === 'requests' && (
            <ServiceRequestView
              customers={customers}
              equipments={equipments}
              technicians={technicians}
              initialStatusFilter={kpiFilterStatus === 'Pending' ? 'Pending' : 'All'}
              onRefresh={loadData}
              onNavigateToWorkOrder={(woId) => {
                const wo = workOrders.find((w) => w.id === woId);
                if (wo) setSelectedTicket(wo);
                setActiveTab('workorders');
              }}
            />
          )}

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
          initialStatusFilter={kpiFilterStatus === 'Pending' ? 'Pending' : 'all'}
          onSelectTicket={setSelectedTicket}
          onOpenMobileMode={handleOpenMobileMode}
          onGenerateInvoice={handleGenerateInvoice}
          onRefresh={loadData}
        />
      )}

      {activeTab === 'amc' && (
        <AmcCalendarDashboard
          equipments={equipments}
          customers={customers}
          technicians={technicians}
          initialStatusFilter={kpiFilterStatus === 'Active' ? 'Due Soon' : 'ALL'}
          initialViewMode={kpiFilterStatus === 'Active' ? 'agenda' : 'calendar'}
          onRefresh={loadData}
          onNavigateToHistory={(eqId) => {
            setSelectedAssetHistoryId(eqId);
            setActiveTab('history');
          }}
        />
      )}

      {activeTab === 'amcrenewal' && (
        <AmcRenewalView
          customers={customers}
          equipments={equipments}
          onRefresh={loadData}
          onNavigateToCalendar={() => setActiveTab('amc')}
        />
      )}

      {activeTab === 'history' && (
        <AssetServiceHistoryTimeline
          equipments={equipments}
          customers={customers}
          technicians={technicians}
          selectedEquipmentId={selectedAssetHistoryId}
          onSelectEquipmentId={(id) => setSelectedAssetHistoryId(id)}
          onRefresh={loadData}
          onOpenCreateServiceRequest={(eqId) => {
            setCreateRequestPreselectedAssetId(eqId || null);
            setIsCreateRequestModalOpen(true);
          }}
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
          onViewHistory={(eqId) => {
            setSelectedAssetHistoryId(eqId);
            setActiveTab('history');
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
        </>
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

      {/* Create Service Request Modal with Project & Client Asset Linkage */}
      <CreateServiceRequestModal
        isOpen={isCreateRequestModalOpen}
        onClose={() => {
          setIsCreateRequestModalOpen(false);
          setCreateRequestPreselectedAssetId(null);
        }}
        preselectedEquipmentId={createRequestPreselectedAssetId || undefined}
        onRequestCreated={() => {
          loadData();
          setActiveTab('requests');
        }}
        onDispatchWorkOrder={(woId) => {
          loadData();
          const wo = serviceStorage.getWorkOrders().find((w) => w.id === woId);
          if (wo) {
            setSelectedTicket(wo);
          }
          setActiveTab('workorders');
        }}
      />
    </div>
  );
};
