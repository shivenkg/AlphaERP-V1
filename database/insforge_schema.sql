-- ====================================================================
-- AlphaERP Database Schema for InsForge Backend (PostgreSQL)
-- With User Ownership (user_id) & Row Level Security (RLS) Policies
-- ====================================================================

-- 1. LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_number TEXT NOT NULL,
    client_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    project_address TEXT,
    city TEXT,
    building_type TEXT,
    hvac_type TEXT,
    estimated_capacity_tr NUMERIC DEFAULT 0,
    estimated_value NUMERIC DEFAULT 0,
    source TEXT DEFAULT 'Direct Sales',
    status TEXT DEFAULT 'New',
    priority TEXT DEFAULT 'Medium',
    assigned_to TEXT,
    assigned_to_name TEXT,
    notes TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. QUOTES TABLE
CREATE TABLE IF NOT EXISTS public.quotes (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_number TEXT NOT NULL,
    lead_id TEXT,
    client_name TEXT NOT NULL,
    company_name TEXT,
    project_title TEXT NOT NULL,
    site_address TEXT,
    prepared_by TEXT,
    date TEXT,
    valid_until TEXT,
    subtotal NUMERIC DEFAULT 0,
    discount_pct NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    tax_pct NUMERIC DEFAULT 18,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    total_cost NUMERIC DEFAULT 0,
    gross_margin_amount NUMERIC DEFAULT 0,
    gross_margin_pct NUMERIC DEFAULT 0,
    payment_terms TEXT,
    warranty_terms TEXT,
    delivery_timeline TEXT,
    status TEXT DEFAULT 'Draft',
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    project_number TEXT NOT NULL,
    title TEXT NOT NULL,
    client_name TEXT NOT NULL,
    company_name TEXT,
    status TEXT DEFAULT 'In Progress',
    start_date TEXT,
    completion_date TEXT,
    contract_value NUMERIC DEFAULT 0,
    total_budget NUMERIC DEFAULT 0,
    invoiced_amount NUMERIC DEFAULT 0,
    collected_amount NUMERIC DEFAULT 0,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity NUMERIC DEFAULT 0,
    reorder_level NUMERIC DEFAULT 5,
    unit_cost NUMERIC DEFAULT 0,
    unit TEXT DEFAULT 'Nos',
    location TEXT DEFAULT 'Central Warehouse',
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PURCHASE REQUISITIONS (PR) TABLE
CREATE TABLE IF NOT EXISTS public.purchase_requisitions (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    pr_number TEXT NOT NULL,
    project_id TEXT,
    requested_by TEXT,
    status TEXT DEFAULT 'Pending Approval',
    total_estimated_cost NUMERIC DEFAULT 0,
    date TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PURCHASE ORDERS (PO) TABLE
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    po_number TEXT NOT NULL,
    pr_id TEXT,
    vendor_id TEXT,
    vendor_name TEXT,
    status TEXT DEFAULT 'Issued',
    total_amount NUMERIC DEFAULT 0,
    date TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. WORK ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.work_orders (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    wo_number TEXT NOT NULL,
    project_id TEXT,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'Scheduled',
    priority TEXT DEFAULT 'Medium',
    assigned_to TEXT,
    scheduled_date TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    expense_number TEXT NOT NULL,
    project_id TEXT,
    category TEXT NOT NULL,
    amount NUMERIC DEFAULT 0,
    date TEXT,
    status TEXT DEFAULT 'Approved',
    payment_method TEXT,
    notes TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    project_id TEXT,
    client_name TEXT,
    amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Received',
    payment_date TEXT,
    due_date TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp TEXT NOT NULL,
    user_name TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ====================================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Only authenticated users can access, insert, update and delete their own records
-- ====================================================================

-- LEADS POLICIES
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
CREATE POLICY "Users can view own leads" ON public.leads
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own leads" ON public.leads;
CREATE POLICY "Users can insert own leads" ON public.leads
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own leads" ON public.leads;
CREATE POLICY "Users can update own leads" ON public.leads
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own leads" ON public.leads;
CREATE POLICY "Users can delete own leads" ON public.leads
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- QUOTES POLICIES
DROP POLICY IF EXISTS "Users can view own quotes" ON public.quotes;
CREATE POLICY "Users can view own quotes" ON public.quotes
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own quotes" ON public.quotes;
CREATE POLICY "Users can insert own quotes" ON public.quotes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own quotes" ON public.quotes;
CREATE POLICY "Users can update own quotes" ON public.quotes
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own quotes" ON public.quotes;
CREATE POLICY "Users can delete own quotes" ON public.quotes
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- PROJECTS POLICIES
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects" ON public.projects
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- INVENTORY POLICIES
DROP POLICY IF EXISTS "Users can view own inventory" ON public.inventory;
CREATE POLICY "Users can view own inventory" ON public.inventory
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own inventory" ON public.inventory;
CREATE POLICY "Users can insert own inventory" ON public.inventory
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own inventory" ON public.inventory;
CREATE POLICY "Users can update own inventory" ON public.inventory
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own inventory" ON public.inventory;
CREATE POLICY "Users can delete own inventory" ON public.inventory
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- PURCHASE REQUISITIONS POLICIES
DROP POLICY IF EXISTS "Users can view own PRs" ON public.purchase_requisitions;
CREATE POLICY "Users can view own PRs" ON public.purchase_requisitions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own PRs" ON public.purchase_requisitions;
CREATE POLICY "Users can insert own PRs" ON public.purchase_requisitions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own PRs" ON public.purchase_requisitions;
CREATE POLICY "Users can update own PRs" ON public.purchase_requisitions
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own PRs" ON public.purchase_requisitions;
CREATE POLICY "Users can delete own PRs" ON public.purchase_requisitions
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- PURCHASE ORDERS POLICIES
DROP POLICY IF EXISTS "Users can view own POs" ON public.purchase_orders;
CREATE POLICY "Users can view own POs" ON public.purchase_orders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own POs" ON public.purchase_orders;
CREATE POLICY "Users can insert own POs" ON public.purchase_orders
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own POs" ON public.purchase_orders;
CREATE POLICY "Users can update own POs" ON public.purchase_orders
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own POs" ON public.purchase_orders;
CREATE POLICY "Users can delete own POs" ON public.purchase_orders
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- WORK ORDERS POLICIES
DROP POLICY IF EXISTS "Users can view own work orders" ON public.work_orders;
CREATE POLICY "Users can view own work orders" ON public.work_orders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own work orders" ON public.work_orders;
CREATE POLICY "Users can insert own work orders" ON public.work_orders
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own work orders" ON public.work_orders;
CREATE POLICY "Users can update own work orders" ON public.work_orders
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own work orders" ON public.work_orders;
CREATE POLICY "Users can delete own work orders" ON public.work_orders
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- EXPENSES POLICIES
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses" ON public.expenses
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
CREATE POLICY "Users can insert own expenses" ON public.expenses
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
CREATE POLICY "Users can update own expenses" ON public.expenses
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can delete own expenses" ON public.expenses
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- PAYMENTS POLICIES
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments" ON public.payments
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update own payments" ON public.payments;
CREATE POLICY "Users can update own payments" ON public.payments
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own payments" ON public.payments;
CREATE POLICY "Users can delete own payments" ON public.payments
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- AUDIT LOGS POLICIES
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert own audit logs" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ====================================================================
-- SAMPLE DATA SEEDING
-- ====================================================================

-- Sample Inventory Items
INSERT INTO public.inventory (id, sku, name, category, quantity, reorder_level, unit_cost, unit, location, data)
VALUES
    ('inv-001', 'VRF-ODU-32HP', 'Daikin VRV X Series 32 HP Outdoor Unit', 'Equipment', 4, 2, 485000, 'Set', 'Main Bay A1', '{"brand": "Daikin", "model": "RXYQ32U", "specs": "R410A High COP"}'::jsonb),
    ('inv-002', 'VRF-IDU-2.5TR', 'Daikin Round Flow 2.5 TR Cassette Indoor Unit', 'Equipment', 18, 5, 38500, 'Nos', 'Rack C-04', '{"brand": "Daikin", "model": "FXFQ80B", "airflow": "680 CFM"}'::jsonb),
    ('inv-003', 'COP-PIPE-58', 'Copper Pipe Grade M 5/8" OD x 18 Gauge', 'Piping & Valves', 240, 50, 1450, 'Mtr', 'Piping Yard P2', '{"material": "Deoxidized Copper", "ratedPSI": 700}'::jsonb),
    ('inv-004', 'GI-DUCT-22G', 'Galvanized Iron Sheet 22 Gauge (120 GSM)', 'Ducting & Insulation', 125, 25, 4200, 'Sheet', 'Metal Shop M1', '{"thickness": "0.80mm", "grade": "IS 277"}'::jsonb),
    ('inv-005', 'NIT-INS-19MM', 'Class O Nitrile Rubber Insulation Sheet 19mm', 'Ducting & Insulation', 80, 15, 2100, 'Roll', 'Thermal Yard T1', '{"flameResistance": "Class 1 / Class O"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    quantity = EXCLUDED.quantity,
    unit_cost = EXCLUDED.unit_cost;

-- Sample Leads
INSERT INTO public.leads (id, lead_number, client_name, company_name, phone, email, project_address, city, building_type, hvac_type, estimated_capacity_tr, estimated_value, source, status, priority, assigned_to_name, notes, data)
VALUES
    ('lead-001', 'LEAD-2026-001', 'Vikramaditya Roy', 'Apex Biotech Hub', '+91 98450 12345', 'v.roy@apexbiotech.com', 'Plot 44, Electronic City Phase 1', 'Bangalore', 'Data Center', 'VRV / VRF System', 120, 4800000, 'HVAC Consultant', 'Site Survey Completed', 'High', 'Shivender Kumar', 'Cleanroom precision cooling required for laboratories.', '{"followUpsCount": 2}'::jsonb),
    ('lead-002', 'LEAD-2026-002', 'Sunita Rao', 'Prestige Tech Park Office', '+91 97310 99881', 'srao@prestigegroup.in', 'Outer Ring Road, Marathahalli', 'Bangalore', 'Commercial Office', 'Water Cooled Chiller', 350, 14200000, 'Website', 'Quote Sent', 'High', 'Shivender Kumar', '5-floor corporate headquarters with VAV air distribution.', '{"followUpsCount": 1}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    estimated_value = EXCLUDED.estimated_value,
    status = EXCLUDED.status;

-- Sample Projects
INSERT INTO public.projects (id, project_number, title, client_name, company_name, status, start_date, completion_date, contract_value, total_budget, invoiced_amount, collected_amount, data)
VALUES
    ('proj-001', 'PRJ-2026-101', 'Apex Biotech VRF Installation & Cleanroom HVAC', 'Vikramaditya Roy', 'Apex Biotech Hub', 'In Progress', '2026-02-01', '2026-06-30', 4800000, 3600000, 2400000, 1800000, '{"progressPct": 45, "pm": "Shivender Kumar"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    contract_value = EXCLUDED.contract_value;
