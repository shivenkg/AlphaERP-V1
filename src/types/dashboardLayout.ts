export type KpiWidgetId =
  | 'kpi_awarded_sales'
  | 'kpi_active_pipeline'
  | 'kpi_inventory_worth'
  | 'kpi_receivables'
  | 'kpi_ebitda'
  | 'kpi_tds'
  | 'kpi_staff'
  | 'kpi_payroll';

export type MainSectionWidgetId =
  | 'section_monthly_revenue_trend'
  | 'section_analytics_charts'
  | 'section_activity_feed'
  | 'section_pipeline_funnel'
  | 'section_active_projects'
  | 'section_sales_leaderboard'
  | 'section_operational_stats';

export interface WidgetConfig {
  id: string;
  name: string;
  category: 'KPI' | 'FINANCE_HR_KPI' | 'MAIN_SECTION';
  description: string;
  visible: boolean;
  order: number;
  minWidth?: 'full' | 'half' | 'third' | 'quarter';
}

export interface DashboardLayoutState {
  version: number;
  kpiWidgets: WidgetConfig[];
  mainWidgets: WidgetConfig[];
  isCustomized: boolean;
}

export const DEFAULT_KPI_WIDGETS: WidgetConfig[] = [
  {
    id: 'kpi_awarded_sales',
    name: 'Awarded Sales (Won)',
    category: 'KPI',
    description: 'Total revenue from won quotes and win-rate percentage',
    visible: true,
    order: 0,
    minWidth: 'quarter'
  },
  {
    id: 'kpi_active_pipeline',
    name: 'Active CRM Pipeline',
    category: 'KPI',
    description: 'Total prospective deal value across all active CRM leads',
    visible: true,
    order: 1,
    minWidth: 'quarter'
  },
  {
    id: 'kpi_inventory_worth',
    name: 'Inventory Stock Worth',
    category: 'KPI',
    description: 'Warehouse inventory valuation and deficit stock alerts',
    visible: true,
    order: 2,
    minWidth: 'quarter'
  },
  {
    id: 'kpi_receivables',
    name: 'Milestone Receivables',
    category: 'KPI',
    description: 'Pending billing receivables and collected funds',
    visible: true,
    order: 3,
    minWidth: 'quarter'
  }
];

export const DEFAULT_FINANCE_HR_KPIS: WidgetConfig[] = [
  {
    id: 'kpi_ebitda',
    name: 'Operating EBITDA',
    category: 'FINANCE_HR_KPI',
    description: 'Net operating earnings and overall profit margin',
    visible: true,
    order: 0,
    minWidth: 'quarter'
  },
  {
    id: 'kpi_tds',
    name: 'Statutory TDS Pending',
    category: 'FINANCE_HR_KPI',
    description: 'Section 194C/194J contractor withholding tax dues',
    visible: true,
    order: 1,
    minWidth: 'quarter'
  },
  {
    id: 'kpi_staff',
    name: 'Staff Deployment',
    category: 'FINANCE_HR_KPI',
    description: 'Active field engineers, site supervisors and HVAC staff',
    visible: true,
    order: 2,
    minWidth: 'quarter'
  },
  {
    id: 'kpi_payroll',
    name: 'Monthly Payroll / Hiring',
    category: 'FINANCE_HR_KPI',
    description: 'Net salary disbursal, EPF contributions, and open job roles',
    visible: true,
    order: 3,
    minWidth: 'quarter'
  }
];

export const DEFAULT_MAIN_SECTION_WIDGETS: WidgetConfig[] = [
  {
    id: 'section_monthly_revenue_trend',
    name: 'Monthly Revenue Trend & Sales Performance',
    category: 'MAIN_SECTION',
    description: 'High-level multi-month sales performance line chart with quota attainment, margins, and cash flow',
    visible: true,
    order: 0,
    minWidth: 'full'
  },
  {
    id: 'section_analytics_charts',
    name: 'Sales Trends & Project Status Charts',
    category: 'MAIN_SECTION',
    description: 'Weekly sales performance trajectory and project status breakdown',
    visible: true,
    order: 1,
    minWidth: 'full'
  },
  {
    id: 'section_activity_feed',
    name: 'Real-Time Activity Feed',
    category: 'MAIN_SECTION',
    description: 'Live reactive feed of user actions (Quotes, Invoices, Inventory, PR/PO)',
    visible: true,
    order: 2,
    minWidth: 'third'
  },
  {
    id: 'section_pipeline_funnel',
    name: 'HVAC CRM Sales Lifecycle Funnel',
    category: 'MAIN_SECTION',
    description: 'Active deal distribution across the 5 CRM pipeline stages',
    visible: true,
    order: 3,
    minWidth: 'half'
  },
  {
    id: 'section_active_projects',
    name: 'Active Projects & BOQ Inventory Check',
    category: 'MAIN_SECTION',
    description: 'Live contract execution progress and shortage alerts',
    visible: true,
    order: 4,
    minWidth: 'half'
  },
  {
    id: 'section_sales_leaderboard',
    name: 'Sales Engineering Leaderboard',
    category: 'MAIN_SECTION',
    description: 'Monthly quotas, target achievements, and rep commissions',
    visible: true,
    order: 5,
    minWidth: 'third'
  },
  {
    id: 'section_operational_stats',
    name: 'Secondary Operational Shortcuts',
    category: 'MAIN_SECTION',
    description: 'Quick link cards for Projects, Procurement PR/PO, and Master Data',
    visible: true,
    order: 6,
    minWidth: 'full'
  }
];

export const DASHBOARD_PRESETS = [
  {
    id: 'default',
    name: 'Standard Executive Layout',
    description: 'Balanced arrangement of high-level KPIs, charts, pipeline funnel, and live activity feed.',
    kpiOrder: ['kpi_awarded_sales', 'kpi_active_pipeline', 'kpi_inventory_worth', 'kpi_receivables'],
    mainOrder: [
      'section_monthly_revenue_trend',
      'section_analytics_charts',
      'section_pipeline_funnel',
      'section_active_projects',
      'section_sales_leaderboard',
      'section_activity_feed',
      'section_operational_stats'
    ]
  },
  {
    id: 'activity_centric',
    name: 'Activity & Telemetry First',
    description: 'Prioritizes the real-time user action stream and live operations on top of the dashboard.',
    kpiOrder: ['kpi_receivables', 'kpi_awarded_sales', 'kpi_active_pipeline', 'kpi_inventory_worth'],
    mainOrder: [
      'section_activity_feed',
      'section_monthly_revenue_trend',
      'section_analytics_charts',
      'section_active_projects',
      'section_pipeline_funnel',
      'section_sales_leaderboard',
      'section_operational_stats'
    ]
  },
  {
    id: 'sales_pipeline',
    name: 'Sales & Quoting Pipeline',
    description: 'Focuses on deal velocity, leaderboard targets, CRM funnel, and won contracts.',
    kpiOrder: ['kpi_active_pipeline', 'kpi_awarded_sales', 'kpi_receivables', 'kpi_inventory_worth'],
    mainOrder: [
      'section_monthly_revenue_trend',
      'section_pipeline_funnel',
      'section_sales_leaderboard',
      'section_analytics_charts',
      'section_activity_feed',
      'section_active_projects',
      'section_operational_stats'
    ]
  },
  {
    id: 'operations_inventory',
    name: 'Project Execution & Inventory',
    description: 'Optimized for site engineers, project managers, and warehouse replenishment.',
    kpiOrder: ['kpi_inventory_worth', 'kpi_awarded_sales', 'kpi_receivables', 'kpi_active_pipeline'],
    mainOrder: [
      'section_active_projects',
      'section_operational_stats',
      'section_monthly_revenue_trend',
      'section_activity_feed',
      'section_analytics_charts',
      'section_pipeline_funnel',
      'section_sales_leaderboard'
    ]
  }
];
