-- ============================================================================
-- AlphaERP - HVAC Enterprise Techno-Commercial & Resource Planning Platform
-- Database Schema Definition (PostgreSQL 14+)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set client timezone
SET timezone = 'UTC';

-- ============================================================================
-- 1. SYSTEM CONFIGURATION, USERS & SECURITY (RBAC)
-- ============================================================================

CREATE TYPE user_role_enum AS ENUM (
    'executive',
    'sales_manager',
    'estimator',
    'procurement',
    'warehouse',
    'finance',
    'technician'
);

CREATE TYPE user_status_enum AS ENUM ('active', 'deactivated');

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32),
    role user_role_enum NOT NULL DEFAULT 'estimator',
    avatar TEXT,
    title VARCHAR(128) NOT NULL DEFAULT 'Staff Member',
    department VARCHAR(128),
    status user_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(16) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    mode VARCHAR(32) NOT NULL DEFAULT 'login',
    temp_user_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS app_notifications (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    link_tab VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    company_name VARCHAR(255) NOT NULL DEFAULT 'AirDynamic Solutions Pvt Ltd',
    app_title VARCHAR(255) NOT NULL DEFAULT 'AlphaERP - HVAC Enterprise Suite',
    tagline VARCHAR(255) DEFAULT 'Enterprise HVAC Systems & Project ERP',
    gstin VARCHAR(32) NOT NULL DEFAULT '27AAACA9988A1Z5',
    pan VARCHAR(32) NOT NULL DEFAULT 'AAACA9988A',
    cin VARCHAR(64) DEFAULT 'U29190MH2012PTC234567',
    sac_code VARCHAR(32) DEFAULT '995461',
    hq_address TEXT NOT NULL,
    support_phone VARCHAR(32) NOT NULL DEFAULT '+91 22 4988 7700',
    support_email VARCHAR(255) NOT NULL DEFAULT 'support@airdynamic.com',
    currency_symbol VARCHAR(8) NOT NULL DEFAULT '₹',
    theme_color VARCHAR(32) NOT NULL DEFAULT 'blue',
    default_gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    quote_validity_days INTEGER NOT NULL DEFAULT 30,
    minimum_gross_margin_pct NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    default_payment_terms TEXT,
    default_warranty_clause TEXT,
    default_inclusions JSONB DEFAULT '[]'::jsonb,
    default_exclusions JSONB DEFAULT '[]'::jsonb,
    pr_auto_approval_threshold NUMERIC(15,2) NOT NULL DEFAULT 50000.00,
    po_dual_signoff_threshold NUMERIC(15,2) NOT NULL DEFAULT 200000.00,
    default_vendor_credit_days INTEGER NOT NULL DEFAULT 30,
    bank_beneficiary_name VARCHAR(255),
    bank_name VARCHAR(255),
    bank_branch VARCHAR(255),
    bank_account_number VARCHAR(64),
    bank_ifsc_code VARCHAR(32),
    bank_swift_code VARCHAR(32),
    upi_vpa_id VARCHAR(128),
    module_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
    custom_role_permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_settings_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role user_role_enum NOT NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    summary TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. MASTER DATA (CLIENTS, VENDORS, COST CENTERS, TAX SLABS, PAYMENT TERMS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_masters (
    id VARCHAR(64) PRIMARY KEY,
    client_code VARCHAR(32) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    designation VARCHAR(128),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    alt_phone VARCHAR(32),
    billing_address TEXT NOT NULL,
    site_address TEXT,
    city VARCHAR(128) NOT NULL,
    state VARCHAR(128) NOT NULL,
    pincode VARCHAR(16) NOT NULL,
    gstin VARCHAR(32) NOT NULL,
    pan VARCHAR(32) NOT NULL,
    credit_limit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    credit_period_days INTEGER NOT NULL DEFAULT 30,
    payment_terms VARCHAR(255) NOT NULL DEFAULT '30 Days Net',
    industry VARCHAR(128) NOT NULL DEFAULT 'Commercial',
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendor_masters (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    whatsapp VARCHAR(32),
    category VARCHAR(128),
    address TEXT NOT NULL,
    city VARCHAR(128),
    state VARCHAR(128),
    pincode VARCHAR(16),
    gstin VARCHAR(32),
    pan VARCHAR(32),
    categories_supplied JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC(3,2) NOT NULL DEFAULT 4.5,
    credit_period_days INTEGER NOT NULL DEFAULT 30,
    payment_terms VARCHAR(255) DEFAULT '30 Days Credit',
    lead_time_days INTEGER DEFAULT 14,
    bank_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cost_centers (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(128) NOT NULL,
    location VARCHAR(128) NOT NULL,
    manager_name VARCHAR(255) NOT NULL,
    budget_limit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tax_slabs (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    cgst_rate NUMERIC(5,2) NOT NULL DEFAULT 9.00,
    sgst_rate NUMERIC(5,2) NOT NULL DEFAULT 9.00,
    igst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    total_gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    hsn_sac_code VARCHAR(32) NOT NULL,
    applies_to VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_term_masters (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    days INTEGER NOT NULL DEFAULT 30,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. INVENTORY & WAREHOUSE MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_items (
    id VARCHAR(64) PRIMARY KEY,
    sku VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    specification TEXT NOT NULL,
    description TEXT,
    brand VARCHAR(128) NOT NULL,
    current_stock NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    allocated_stock NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    reorder_level NUMERIC(12,2) NOT NULL DEFAULT 5.00,
    unit VARCHAR(32) NOT NULL DEFAULT 'Nos',
    average_unit_cost NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    standard_selling_price NUMERIC(15,2),
    hsn_code VARCHAR(32),
    gst_rate_pct NUMERIC(5,2) DEFAULT 18.00,
    default_supplier VARCHAR(255) NOT NULL,
    warehouse_location VARCHAR(128) NOT NULL DEFAULT 'Main Yard',
    storage_location VARCHAR(128),
    last_restocked_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. CRM & SALES PIPELINE (LEADS, SURVEYS, COMMISSIONS)
-- ============================================================================

CREATE TYPE lead_status_enum AS ENUM (
    'New',
    'Site Survey Scheduled',
    'Site Survey Completed',
    'Quote Sent',
    'Negotiation',
    'Awarded',
    'Lost'
);

CREATE TYPE lead_source_enum AS ENUM (
    'Website',
    'Inbound Call',
    'Referral',
    'WhatsApp',
    'HVAC Consultant',
    'Architect',
    'Trade Expo',
    'Direct Sales'
);

CREATE TABLE IF NOT EXISTS sales_reps (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32) NOT NULL,
    whatsapp VARCHAR(32),
    avatar TEXT,
    monthly_quota NUMERIC(15,2) NOT NULL DEFAULT 2500000.00,
    quarterly_quota NUMERIC(15,2) NOT NULL DEFAULT 7500000.00,
    base_commission_pct NUMERIC(5,2) NOT NULL DEFAULT 1.50,
    bonus_multiplier_pct NUMERIC(5,2) NOT NULL DEFAULT 0.50,
    achieved_sales_month NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    achieved_sales_quarter NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    won_deals_count INTEGER NOT NULL DEFAULT 0,
    active_pipeline_value NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    calculated_commission NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(64) PRIMARY KEY,
    lead_number VARCHAR(32) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL,
    project_address TEXT NOT NULL,
    city VARCHAR(128) NOT NULL,
    building_type VARCHAR(128) NOT NULL,
    hvac_type VARCHAR(128) NOT NULL,
    estimated_capacity_tr NUMERIC(8,2) NOT NULL DEFAULT 0.00,
    estimated_value NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    source lead_source_enum NOT NULL DEFAULT 'Inbound Call',
    status lead_status_enum NOT NULL DEFAULT 'New',
    priority VARCHAR(16) NOT NULL DEFAULT 'Medium',
    assigned_to VARCHAR(64) REFERENCES sales_reps(id) ON DELETE SET NULL,
    assigned_to_name VARCHAR(255),
    notes TEXT,
    follow_ups JSONB DEFAULT '[]'::jsonb,
    communications JSONB DEFAULT '[]'::jsonb,
    quote_ids JSONB DEFAULT '[]'::jsonb,
    project_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. TECHNO-COMMERCIAL QUOTATIONS & BOQ ENGINE
-- ============================================================================

CREATE TYPE quote_status_enum AS ENUM (
    'Draft',
    'Sent',
    'Approved',
    'Awarded',
    'Rejected',
    'Expired'
);

CREATE TABLE IF NOT EXISTS quotes (
    id VARCHAR(64) PRIMARY KEY,
    quote_number VARCHAR(32) UNIQUE NOT NULL,
    lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    site_address TEXT NOT NULL,
    prepared_by VARCHAR(255) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    discount_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    tax_pct NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    gross_margin_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    gross_margin_pct NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    payment_terms TEXT NOT NULL,
    warranty_terms TEXT NOT NULL,
    delivery_timeline VARCHAR(128) NOT NULL,
    status quote_status_enum NOT NULL DEFAULT 'Draft',
    awarded_date DATE,
    converted_to_project_id VARCHAR(64),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quote_line_items (
    id VARCHAR(64) PRIMARY KEY,
    quote_id VARCHAR(64) NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    category VARCHAR(128) NOT NULL,
    item_sku VARCHAR(64) REFERENCES inventory_items(sku) ON DELETE SET NULL,
    description TEXT NOT NULL,
    qty NUMERIC(12,2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(32) NOT NULL DEFAULT 'Nos',
    unit_cost NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    unit_price NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. PROJECT EXECUTION, BILL OF QUANTITIES & SHORTAGES
-- ============================================================================

CREATE TYPE project_status_enum AS ENUM (
    'Planning & Engineering',
    'Procurement',
    'Installation',
    'Testing & Commissioning',
    'Handover & Closed'
);

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    project_number VARCHAR(32) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE SET NULL,
    quote_id VARCHAR(64) REFERENCES quotes(id) ON DELETE SET NULL,
    contract_value NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_estimated_cost NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    actual_expenses NUMERIC(15,2) DEFAULT 0.00,
    actual_cost NUMERIC(15,2) DEFAULT 0.00,
    target_margin_pct NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    start_date DATE NOT NULL,
    target_completion_date DATE NOT NULL,
    actual_completion_date DATE,
    status project_status_enum NOT NULL DEFAULT 'Planning & Engineering',
    progress_pct INTEGER NOT NULL DEFAULT 0,
    project_manager VARCHAR(255) NOT NULL,
    total_shortage_items_count INTEGER NOT NULL DEFAULT 0,
    pr_count INTEGER NOT NULL DEFAULT 0,
    po_count INTEGER NOT NULL DEFAULT 0,
    invoices_generated_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    payments_received_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    site_address TEXT NOT NULL,
    expense_milestones JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_boq_items (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category VARCHAR(128) NOT NULL,
    sku VARCHAR(64) REFERENCES inventory_items(sku) ON DELETE SET NULL,
    description TEXT NOT NULL,
    required_qty NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(32) NOT NULL DEFAULT 'Nos',
    unit_cost NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    in_stock_qty NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    shortage_qty NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(64) NOT NULL DEFAULT 'In Stock',
    pr_number VARCHAR(32),
    po_number VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. PROCUREMENT (PURCHASE REQUISITIONS & PURCHASE ORDERS)
-- ============================================================================

CREATE TYPE pr_status_enum AS ENUM (
    'Draft',
    'Pending Approval',
    'Approved',
    'Rejected',
    'Converted to PO'
);

CREATE TYPE po_status_enum AS ENUM (
    'Draft',
    'Pending Approval',
    'Approved',
    'Rejected',
    'Sent to Vendor',
    'Partially Received',
    'Fulfilled',
    'Cancelled'
);

CREATE TABLE IF NOT EXISTS purchase_requisitions (
    id VARCHAR(64) PRIMARY KEY,
    pr_number VARCHAR(32) UNIQUE NOT NULL,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
    project_name VARCHAR(255) NOT NULL,
    requested_by VARCHAR(255) NOT NULL,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    priority VARCHAR(16) NOT NULL DEFAULT 'Standard',
    total_estimated_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    status pr_status_enum NOT NULL DEFAULT 'Pending Approval',
    approval_remarks TEXT,
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,
    converted_po_id VARCHAR(64),
    converted_po_number VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pr_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pr_id VARCHAR(64) NOT NULL REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    sku VARCHAR(64) REFERENCES inventory_items(sku) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    required_qty NUMERIC(12,2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(32) NOT NULL DEFAULT 'Nos',
    estimated_unit_cost NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    estimated_total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    reason TEXT
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id VARCHAR(64) PRIMARY KEY,
    po_number VARCHAR(32) UNIQUE NOT NULL,
    pr_id VARCHAR(64) REFERENCES purchase_requisitions(id) ON DELETE SET NULL,
    pr_number VARCHAR(32),
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
    project_name VARCHAR(255) NOT NULL,
    vendor_id VARCHAR(64) REFERENCES vendor_masters(id) ON DELETE SET NULL,
    vendor_name VARCHAR(255) NOT NULL,
    vendor_email VARCHAR(255) NOT NULL,
    vendor_phone VARCHAR(32) NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE NOT NULL,
    delivery_address TEXT NOT NULL,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    shipping_charges NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    payment_terms VARCHAR(255) NOT NULL DEFAULT '30 Days Credit',
    status po_status_enum NOT NULL DEFAULT 'Draft',
    approval_remarks TEXT,
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,
    sent_to_vendor_at TIMESTAMPTZ,
    vendor_acknowledgment_status VARCHAR(32) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS po_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_id VARCHAR(64) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    sku VARCHAR(64) REFERENCES inventory_items(sku) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    ordered_qty NUMERIC(12,2) NOT NULL DEFAULT 1.00,
    received_qty NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(32) NOT NULL DEFAULT 'Nos',
    unit_rate NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    tax_rate_pct NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00
);

-- ============================================================================
-- 8. FIELD WORK ORDERS & COMMISSIONING
-- ============================================================================

CREATE TYPE work_order_status_enum AS ENUM (
    'Scheduled',
    'In Progress',
    'Inspection',
    'Completed',
    'Billed'
);

CREATE TABLE IF NOT EXISTS work_orders (
    id VARCHAR(64) PRIMARY KEY,
    order_number VARCHAR(32) UNIQUE NOT NULL,
    quote_id VARCHAR(64) REFERENCES quotes(id) ON DELETE SET NULL,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    site_address TEXT NOT NULL,
    service_type VARCHAR(128) NOT NULL,
    assigned_technician VARCHAR(255) NOT NULL,
    scheduled_start_date DATE NOT NULL,
    scheduled_end_date DATE NOT NULL,
    actual_end_date DATE,
    status work_order_status_enum NOT NULL DEFAULT 'Scheduled',
    scope_of_work JSONB DEFAULT '[]'::jsonb,
    equipment_specs TEXT,
    completion_signoff JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 9. GAAP FINANCE, INVOICES & PAYMENTS
-- ============================================================================

CREATE TYPE payment_status_enum AS ENUM (
    'Pending',
    'Paid',
    'Partially Paid',
    'Overdue'
);

CREATE TABLE IF NOT EXISTS payment_records (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(32) UNIQUE NOT NULL,
    reference_type VARCHAR(32) NOT NULL,
    reference_id VARCHAR(64) NOT NULL,
    reference_title VARCHAR(255) NOT NULL,
    client_or_vendor_name VARCHAR(255) NOT NULL,
    is_payable BOOLEAN NOT NULL DEFAULT FALSE,
    payment_type VARCHAR(128) NOT NULL,
    amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    paid_date DATE,
    status payment_status_enum NOT NULL DEFAULT 'Pending',
    payment_method VARCHAR(64),
    transaction_reference VARCHAR(128),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id VARCHAR(64) PRIMARY KEY,
    account_code VARCHAR(32) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    sub_category VARCHAR(128) NOT NULL,
    balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    is_system_account BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journal_vouchers (
    id VARCHAR(64) PRIMARY KEY,
    voucher_number VARCHAR(32) UNIQUE NOT NULL,
    voucher_date DATE NOT NULL DEFAULT CURRENT_DATE,
    voucher_type VARCHAR(32) NOT NULL,
    reference_number VARCHAR(64),
    reference_type VARCHAR(64),
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    entries JSONB NOT NULL DEFAULT '[]'::jsonb,
    narration TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Posted',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tds_records (
    id VARCHAR(64) PRIMARY KEY,
    deductee_name VARCHAR(255) NOT NULL,
    deductee_pan VARCHAR(32) NOT NULL,
    deductee_type VARCHAR(64) NOT NULL,
    section VARCHAR(32) NOT NULL,
    rate_pct NUMERIC(5,2) NOT NULL DEFAULT 2.00,
    payment_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    tds_deducted NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    deduct_date DATE NOT NULL,
    challan_number VARCHAR(64),
    bsr_code VARCHAR(32),
    deposit_date DATE,
    quarter VARCHAR(16) NOT NULL DEFAULT 'Q4',
    status VARCHAR(32) NOT NULL DEFAULT 'Deducted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gst_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period VARCHAR(32) UNIQUE NOT NULL,
    outward_taxable NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    output_cgst NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    output_sgst NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    output_igst NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_output_tax NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    inward_taxable NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    input_cgst NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    input_sgst NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    input_igst NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_input_tax_credit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    net_gst_payable NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. HUMAN RESOURCES, PAYROLL & WORKFORCE MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    head_of_department VARCHAR(255),
    budget NUMERIC(15,2) DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS designations (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    title VARCHAR(128) NOT NULL,
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE SET NULL,
    grade_code VARCHAR(32) NOT NULL DEFAULT 'L3',
    min_salary NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    max_salary NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(64) PRIMARY KEY,
    emp_code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    designation VARCHAR(128) NOT NULL,
    department VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL,
    official_email VARCHAR(255),
    phone VARCHAR(32) NOT NULL,
    date_of_joining DATE NOT NULL,
    reporting_manager VARCHAR(255),
    employment_status VARCHAR(32) NOT NULL DEFAULT 'Active',
    base_monthly_salary NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    gross_monthly_salary NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    ctc_annual NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    pan VARCHAR(32) NOT NULL,
    aadhaar VARCHAR(32) NOT NULL,
    uan_number VARCHAR(32),
    pf_number VARCHAR(32),
    esic_number VARCHAR(32),
    bank_name VARCHAR(128),
    bank_account VARCHAR(64) NOT NULL,
    ifsc_code VARCHAR(32) NOT NULL,
    tax_regime VARCHAR(32) DEFAULT 'New Regime',
    leave_balances JSONB DEFAULT '{"cl": 10, "sl": 7, "pl": 15}'::jsonb,
    monthly_salary_structure JSONB,
    avatar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(64) PRIMARY KEY,
    emp_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    emp_name VARCHAR(255) NOT NULL,
    emp_code VARCHAR(32) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Present',
    check_in_time TIME,
    check_out_time TIME,
    total_hours NUMERIC(4,2),
    site_project_name VARCHAR(255),
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_emp_attendance_date UNIQUE (emp_id, date)
);

CREATE TABLE IF NOT EXISTS timesheet_entries (
    id VARCHAR(64) PRIMARY KEY,
    emp_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    emp_name VARCHAR(255) NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
    project_name VARCHAR(255) NOT NULL,
    task_description TEXT NOT NULL,
    mon_hours NUMERIC(4,2) DEFAULT 0,
    tue_hours NUMERIC(4,2) DEFAULT 0,
    wed_hours NUMERIC(4,2) DEFAULT 0,
    thu_hours NUMERIC(4,2) DEFAULT 0,
    fri_hours NUMERIC(4,2) DEFAULT 0,
    sat_hours NUMERIC(4,2) DEFAULT 0,
    total_hours NUMERIC(5,2) DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'Submitted',
    approved_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_applications (
    id VARCHAR(64) PRIMARY KEY,
    emp_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    emp_name VARCHAR(255) NOT NULL,
    emp_code VARCHAR(32) NOT NULL,
    leave_type VARCHAR(64) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC(4,1) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Pending',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    action_remarks TEXT,
    action_by VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS payroll_months (
    id VARCHAR(64) PRIMARY KEY,
    month_year VARCHAR(32) UNIQUE NOT NULL,
    run_date DATE NOT NULL,
    total_gross NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_net NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_pf_ee NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_pf_er NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_esic NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_tds NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_pt NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_employees INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'Approved',
    payslips JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_assets (
    id VARCHAR(64) PRIMARY KEY,
    asset_tag VARCHAR(64) UNIQUE NOT NULL,
    asset_type VARCHAR(128) NOT NULL,
    brand_model VARCHAR(255) NOT NULL,
    serial_number VARCHAR(128),
    allocated_emp_id VARCHAR(64) REFERENCES employees(id) ON DELETE SET NULL,
    allocated_emp_name VARCHAR(255),
    allocated_date DATE,
    condition VARCHAR(32) NOT NULL DEFAULT 'Good',
    value NUMERIC(15,2) DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'Allocated',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_documents (
    id VARCHAR(64) PRIMARY KEY,
    emp_id VARCHAR(64) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    emp_name VARCHAR(255) NOT NULL,
    doc_type VARCHAR(128) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_requisitions (
    id VARCHAR(64) PRIMARY KEY,
    req_number VARCHAR(32) UNIQUE NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(128) NOT NULL,
    location VARCHAR(128) NOT NULL,
    experience_req VARCHAR(64) NOT NULL,
    employment_type VARCHAR(64) NOT NULL DEFAULT 'Full-Time',
    salary_range VARCHAR(64) NOT NULL,
    open_positions INTEGER NOT NULL DEFAULT 1,
    filled_positions INTEGER NOT NULL DEFAULT 0,
    hiring_manager VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active / Hiring',
    kra_list JSONB DEFAULT '[]'::jsonb,
    responsibilities JSONB DEFAULT '[]'::jsonb,
    requirements JSONB DEFAULT '[]'::jsonb,
    certifications_preferred JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_candidates (
    id VARCHAR(64) PRIMARY KEY,
    req_id VARCHAR(64) REFERENCES job_requisitions(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    current_company VARCHAR(255),
    experience_years NUMERIC(4,1) NOT NULL DEFAULT 0,
    current_ctc NUMERIC(15,2),
    expected_ctc NUMERIC(15,2),
    stage VARCHAR(64) NOT NULL DEFAULT 'Screened',
    interview_notes TEXT,
    rating NUMERIC(3,1) NOT NULL DEFAULT 4.0,
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_lead_id ON quotes(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_pr_status ON purchase_requisitions(status);
CREATE INDEX IF NOT EXISTS idx_pr_project ON purchase_requisitions(project_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payments_due_date ON payment_records(due_date);
CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance_records(emp_id, date);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);

-- ============================================================================
-- 12. TRIGGERS FOR UPDATED_AT TIMESTAMP REFRESH
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
          AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_update_%I_updated_at ON %I;
            CREATE TRIGGER trg_update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$;
