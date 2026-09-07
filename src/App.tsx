import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserRole,
  Lead,
  Quote,
  Project
} from './types';
import { storageService } from './services/storageService';
import { googleSheetsService } from './services/googleSheets';

import { Header } from './components/Header';
import { BreadcrumbNav } from './components/BreadcrumbNav';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CRMLeadsView } from './components/CRMLeadsView';
import { QuotesView } from './components/QuotesView';
import { ProjectsBOQView } from './components/ProjectsBOQView';
import { ProjectCostAnalysisView } from './components/ProjectCostAnalysisView';
import { ProcurementPRPOView } from './components/ProcurementPRPOView';
import { InventoryWarehouseView } from './components/InventoryWarehouseView';
import { WorkOrdersView } from './components/WorkOrdersView';
import { FinancePaymentsView } from './components/FinancePaymentsView';
import { FinanceView } from './components/FinanceView';
import { MasterDataView } from './components/MasterDataView';
import { HRView } from './components/HRView';
import { SalesPerformanceView } from './components/SalesPerformanceView';
import { UserManagementView } from './components/UserManagementView';
import { AuditLogView } from './components/AuditLogView';
import { AdminCustomizationView } from './components/AdminCustomizationView';
import { GlobalSearchView } from './components/GlobalSearchView';
import { AuthModalOrPage } from './components/AuthModalOrPage';
import { PitchDeckView } from './components/PitchDeckView';

import { NewLeadModal } from './components/NewLeadModal';
import { NewQuoteModal } from './components/NewQuoteModal';
import { LeadDetailModal } from './components/LeadDetailModal';
import { GoogleSheetIntegrationModal } from './components/GoogleSheetIntegrationModal';
import { LocalBackupNotification } from './components/LocalBackupNotification';
import { ApiIntegrationAndDeploymentModal } from './components/ApiIntegrationAndDeploymentModal';
import { CreatePRModal } from './components/CreatePRModal';
import { NewExpenseModal } from './components/NewExpenseModal';
import { QuickActionFloatingButton } from './components/QuickActionFloatingButton';

export function App() {
  const [data, setData] = useState(storageService.getAllData());
  const [notifications, setNotifications] = useState(storageService.getNotifications());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);
  const [quotePrefillLead, setQuotePrefillLead] = useState<Lead | null>(null);
  const [selectedLeadDetail, setSelectedLeadDetail] = useState<Lead | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isApiGuideOpen, setIsApiGuideOpen] = useState(false);
  const [isNewPROpen, setIsNewPROpen] = useState(false);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState(false);

  // Sidebar Pinned state (defaults to collapsed sub-menu bar mode)
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem('alphaerp_sidebar_pinned_state');
      if (saved !== null) {
        return saved === 'true';
      }
      return false; // Default: collapsed to sub menu bar
    } catch {
      return false;
    }
  });

  const handleToggleSidebarPinned = () => {
    setIsSidebarPinned((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem('alphaerp_sidebar_pinned_state', String(next));
      } catch {}
      return next;
    });
  };

  // Subscribe to storage service
  useEffect(() => {
    const syncDensity = () => {
      try {
        const density = storageService.getDisplayDensity();
        document.documentElement.setAttribute('data-density', density);
        document.body.classList.toggle('density-compact', density === 'compact');
        document.body.classList.toggle('density-spacious', density === 'spacious');
      } catch {}
    };
    syncDensity();

    const unsubscribe = storageService.subscribe(() => {
      setData(storageService.getAllData());
      setNotifications(storageService.getNotifications());
      syncDensity();
    });
    return () => unsubscribe();
  }, []);

  // Global Keyboard shortcut: Cmd+K / Ctrl+K for Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveTab('search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefreshData = () => {
    setData(storageService.getAllData());
    setNotifications(storageService.getNotifications());
  };

  // Handler: Award Quote / Lead to Project
  const handleAwardQuote = (quote: Quote) => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      storageService.awardQuoteAndConvertToProject(quote.id);
      setActiveTab('projects');
    } catch (e: any) {
      alert(e.message || 'Error awarding quote');
    }
  };

  const handleAwardLead = (lead: Lead) => {
    const existingQuote = data.quotes.find((q) => lead.quoteIds?.includes(q.id) || q.leadId === lead.id);
    if (existingQuote) {
      handleAwardQuote(existingQuote);
    } else {
      setQuotePrefillLead(lead);
      setIsNewQuoteOpen(true);
    }
  };

  const handleCreateQuoteForLead = (lead: Lead) => {
    setQuotePrefillLead(lead);
    setIsNewQuoteOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    storageService.setUserRole(newRole);
    const allowed = storageService.getModulesForRole(newRole);
    if (!allowed.includes(activeTab) && allowed.length > 0) {
      const nextTab = allowed.includes('dashboard') ? 'dashboard' : allowed[0];
      setActiveTab(nextTab);
    }
  };

  // Synchronize activeTab if current role does not have permission
  useEffect(() => {
    if (data.currentUser) {
      const allowedModules = storageService.getModulesForRole(data.currentUser.role);
      if (allowedModules.length > 0 && !allowedModules.includes(activeTab)) {
        const fallback = allowedModules.includes('dashboard')
          ? 'dashboard'
          : allowedModules.includes('search')
          ? 'search'
          : allowedModules[0];
        setActiveTab(fallback);
      }
    }
  }, [data.currentUser?.role]);

  // If user is not authenticated, show the dedicated full-screen login / OTP verification page
  if (!data.isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex flex-col justify-center items-center py-10 px-4 selection:bg-blue-500 selection:text-white">
        <AuthModalOrPage
          onSuccess={() => {
            // Already updated in storageService, App will re-render via subscription
          }}
        />
      </div>
    );
  }

  // Badge counts
  const openShortagesCount = data.projects.reduce((sum, p) => sum + p.totalShortageItemsCount, 0);
  const pendingPRCount = data.prs.filter((p) => p.status === 'Pending Approval').length;
  const pendingPOCount = data.pos.filter((p) => p.status === 'Sent to Vendor').length;
  const lowStockCount = data.inventory.filter((i) => i.availableStock <= i.reorderLevel).length;
  const pendingInvoicesCount = data.payments.filter((p) => p.status !== 'Paid').length;

  return (
    <div className="h-screen w-full max-w-full overflow-hidden bg-[#FAF9F5] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* Top Application Header */}
      <Header
        currentUser={data.currentUser}
        currentRole={data.currentUser.role}
        onRoleChange={handleRoleChange}
        sheetsConfig={data.sheetsConfig}
        notifications={notifications}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenAuditLogs={() => setActiveTab('audit')}
        onOpenApiDocs={() => setIsApiGuideOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isSidebarPinned={isSidebarPinned}
        onToggleSidebar={handleToggleSidebarPinned}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={() => storageService.logout()}
      />

      {/* Dynamic ERP Breadcrumb Hierarchy Navigation */}
      <BreadcrumbNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={data.currentUser?.role}
      />

      {/* Main Workspace: Sidebar + Dynamic View Container */}
      <div className="flex-1 flex w-full max-w-full overflow-hidden min-h-0">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          leadCount={data.leads.length}
          openShortagesCount={openShortagesCount}
          pendingPRCount={pendingPRCount}
          pendingPOCount={pendingPOCount}
          lowStockCount={lowStockCount}
          pendingInvoicesCount={pendingInvoicesCount}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          currentRole={data.currentUser?.role}
          isCollapsed={!isSidebarPinned}
          onToggleCollapse={handleToggleSidebarPinned}
        />

        {/* Viewport */}
        <main className="flex-1 h-full min-w-0 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 lg:p-6 bg-[#FAF9F5] dark:bg-slate-950 transition-colors duration-200">
          <div className="max-w-7xl mx-auto w-full min-w-0">
            {/* View: Global ERP Search & Lookup */}
            {activeTab === 'search' && (
              <GlobalSearchView
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onNavigate={setActiveTab}
                data={data}
              />
            )}

            {/* View: Management Dashboard */}
            {activeTab === 'dashboard' && (
              <DashboardView
                currentUser={data.currentUser}
                currentRole={data.currentUser?.role}
                leads={data.leads}
                quotes={data.quotes}
                projects={data.projects}
                inventory={data.inventory}
                prs={data.prs}
                pos={data.pos}
                payments={data.payments}
                salesReps={data.salesReps}
                auditLogs={data.auditLogs}
                sheetsConfig={data.sheetsConfig}
                accounts={data.accounts}
                tdsRecords={data.tdsRecords}
                jobRequisitions={data.jobRequisitions}
                employees={data.employees}
                payrollMonths={data.payrollMonths}
                onNavigate={setActiveTab}
                onOpenNewLead={() => setIsNewLeadOpen(true)}
                onOpenNewQuote={() => {
                  setQuotePrefillLead(null);
                  setIsNewQuoteOpen(true);
                }}
                onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
                onOpenNewPR={() => setIsNewPROpen(true)}
                onOpenNewExpense={() => setIsNewExpenseOpen(true)}
              />
            )}

            {/* View: Official Investor Pitch Deck & System Overview */}
            {activeTab === 'pitch_deck' && (
              <PitchDeckView
                onNavigateTab={(tab) => setActiveTab(tab)}
                projects={data.projects || []}
                quotes={data.quotes || []}
                leads={data.leads || []}
                inventory={data.inventory || []}
                pos={data.pos || []}
                prs={data.prs || []}
                payments={data.payments || []}
                employees={data.employees || []}
              />
            )}

            {/* View: Master Data Management (Clients, Vendors, Items, Cost Centers, Tax, Payment Terms) */}
            {activeTab === 'masterdata' && (
              <MasterDataView
                clients={data.clients || []}
                vendors={data.vendors || []}
                inventory={data.inventory || []}
                costCenters={data.costCenters || []}
                taxSlabs={data.taxSlabs || []}
                paymentTerms={data.paymentTerms || []}
                onRefresh={handleRefreshData}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            )}

            {/* View: Finance & Accounting (Chart of Accounts, Journal Vouchers, TDS, GST, P&L) */}
            {activeTab === 'finance' && (
              <FinanceView
                accounts={data.accounts || data.chartOfAccounts || []}
                vouchers={data.vouchers || data.journalVouchers || []}
                tdsRecords={data.tdsRecords || []}
                initialTab="vouchers"
                onRefresh={handleRefreshData}
              />
            )}

            {/* View: HR, Talent Acquisition & Payroll Engine */}
            {activeTab === 'hr' && (
              <HRView
                key="hr-suite"
                jobRequisitions={data.jobRequisitions || []}
                candidates={data.candidates || data.jobCandidates || []}
                employees={data.employees || []}
                attendance={data.attendance || []}
                timesheets={data.timesheets || []}
                leaves={data.leaves || []}
                holidays={data.holidays || []}
                payrollMonths={data.payrollMonths || []}
                resignations={data.resignations || []}
                initialTab="org_master"
                onRefresh={handleRefreshData}
              />
            )}

            {/* View: ESS / MSS Employee Self-Service Portal */}
            {activeTab === 'ess' && (
              <HRView
                key="hr-ess-portal"
                jobRequisitions={data.jobRequisitions || []}
                candidates={data.candidates || data.jobCandidates || []}
                employees={data.employees || []}
                attendance={data.attendance || []}
                timesheets={data.timesheets || []}
                leaves={data.leaves || []}
                holidays={data.holidays || []}
                payrollMonths={data.payrollMonths || []}
                resignations={data.resignations || []}
                initialTab="ess_mss"
                onRefresh={handleRefreshData}
              />
            )}

            {/* View: CRM & Leads Pipeline */}
            {activeTab === 'crm' && (
              <CRMLeadsView
                leads={data.leads}
                quotes={data.quotes}
                salesReps={data.salesReps}
                onOpenNewLead={() => setIsNewLeadOpen(true)}
                onCreateQuoteForLead={handleCreateQuoteForLead}
                onAwardLead={handleAwardLead}
                onSelectLeadDetail={(lead) => setSelectedLeadDetail(lead)}
              />
            )}

            {/* View: Quotes & Estimations */}
            {activeTab === 'quotes' && (
              <QuotesView
                quotes={data.quotes}
                leads={data.leads}
                inventory={data.inventory}
                projects={data.projects}
                onOpenNewQuote={() => {
                  setQuotePrefillLead(null);
                  setIsNewQuoteOpen(true);
                }}
                onAwardQuote={handleAwardQuote}
              />
            )}

            {/* View: Projects & BOQ Inventory Engine */}
            {activeTab === 'projects' && (
              <ProjectsBOQView
                projects={data.projects}
                inventory={data.inventory}
                onNavigateToProcurement={() => setActiveTab('procurement')}
                onNavigateToCostAnalysis={() => setActiveTab('cost_analysis')}
                onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
              />
            )}

            {/* View: Project Cost Variance & Actuals Analysis */}
            {activeTab === 'cost_analysis' && (
              <ProjectCostAnalysisView
                projects={data.projects}
                pos={data.pos}
                onNavigateToProcurement={() => setActiveTab('procurement')}
                onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
              />
            )}

            {/* View: Procurement (PR & PO Pipeline) */}
            {activeTab === 'procurement' && (
              <ProcurementPRPOView
                prs={data.prs}
                pos={data.pos}
                vendors={data.vendors}
                projects={data.projects}
                inventory={data.inventory}
                currentRole={data.currentUser.role}
                onOpenNewPR={() => setActiveTab('projects')}
              />
            )}

            {/* View: Inventory & Warehouse */}
            {activeTab === 'inventory' && (
              <InventoryWarehouseView
                inventory={data.inventory}
                onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
              />
            )}

            {/* View: Work Orders & Field Operations */}
            {activeTab === 'workorders' && (
              <WorkOrdersView
                workOrders={data.workOrders}
                projects={data.projects}
                onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
              />
            )}

            {/* View: Invoices & Milestone Payments */}
            {activeTab === 'payments' && (
              <FinancePaymentsView
                payments={data.payments}
                projects={data.projects}
                onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
              />
            )}

            {/* View: Sales Quotas & Commissions */}
            {activeTab === 'sales' && (
              <SalesPerformanceView
                salesReps={data.salesReps}
                onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
              />
            )}

            {/* View: Admin Customization & System Configuration Suite */}
            {activeTab === 'customization' && (
              <AdminCustomizationView
                currentUser={data.currentUser}
                onNavigateTab={setActiveTab}
              />
            )}

            {/* View: Admin User & RBAC Management */}
            {activeTab === 'users' && (
              <UserManagementView
                currentRole={data.currentUser.role}
                onRoleChange={handleRoleChange}
              />
            )}

            {/* View: Google Sheet Master Tab */}
            {activeTab === 'sheets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-xl">📊</span> Google Sheet Live Database & Automation Engine
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      All ERP data is mapped and synchronized live into multi-tab Google Sheet worksheets.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSheetsModalOpen(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Open Live Sheet Viewer
                  </button>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
                  <div className="inline-flex p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-3xl">
                    📑
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Full-Fledged Google Sheets Integration Active</h3>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                    Includes formatted worksheets for Executive Dashboard KPIs, CRM Leads, Quotes, Projects BOQ, Procurement PR/PO, Inventory, Payments, and Audit logs.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setIsSheetsModalOpen(true)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                    >
                      Launch Live Sheet View & Sync Control
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* View: Security & Audit Trail */}
            {activeTab === 'audit' && (
              <AuditLogView
                auditLogs={data.auditLogs}
                onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        salesReps={data.salesReps}
      />

      <NewQuoteModal
        isOpen={isNewQuoteOpen}
        onClose={() => setIsNewQuoteOpen(false)}
        leads={data.leads}
        inventory={data.inventory}
        preselectedLead={quotePrefillLead}
      />

      <LeadDetailModal
        lead={selectedLeadDetail ? data.leads.find((l) => l.id === selectedLeadDetail.id) || selectedLeadDetail : null}
        quotes={data.quotes}
        isOpen={!!selectedLeadDetail}
        onClose={() => setSelectedLeadDetail(null)}
        onCreateQuote={handleCreateQuoteForLead}
        onAwardLead={handleAwardLead}
      />

      <GoogleSheetIntegrationModal
        sheetsConfig={data.sheetsConfig}
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
      />

      {/* Switch Account / Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-5xl my-8">
            <AuthModalOrPage
              isModal
              onClose={() => setIsAuthModalOpen(false)}
              onSuccess={() => {
                setIsAuthModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Interactive API Integration & Enterprise Deployment Guide Modal */}
      <ApiIntegrationAndDeploymentModal
        isOpen={isApiGuideOpen}
        onClose={() => setIsApiGuideOpen(false)}
      />

      {/* Global Quick Action Modals: Create PR & Log Expense */}
      <CreatePRModal
        isOpen={isNewPROpen}
        onClose={() => setIsNewPROpen(false)}
        projects={data.projects}
        inventory={data.inventory}
        currentRole={data.currentUser?.role}
        onPRCreated={() => {
          setIsNewPROpen(false);
          handleRefreshData();
        }}
      />

      <NewExpenseModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        projects={data.projects}
        employees={data.employees}
        onExpenseCreated={() => {
          setIsNewExpenseOpen(false);
          handleRefreshData();
        }}
      />

      {/* Global Quick Action Floating Action Button (Active across all views) */}
      {activeTab !== 'dashboard' && (
        <QuickActionFloatingButton
          onOpenNewLead={() => setIsNewLeadOpen(true)}
          onOpenNewPR={() => setIsNewPROpen(true)}
          onOpenNewExpense={() => setIsNewExpenseOpen(true)}
        />
      )}

      {/* Local Backup Notification & Snapshot Recovery Floating Toast / Modal */}
      <LocalBackupNotification />
    </div>
  );
}

export default App;
