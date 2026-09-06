-- ============================================================================
-- AlphaERP - HVAC Enterprise Techno-Commercial & Resource Planning Platform
-- Sample Production-Grade Seed Data Script (PostgreSQL 14+)
-- ============================================================================

-- 1. System Settings
INSERT INTO system_settings (
    id, company_name, app_title, tagline, gstin, pan, cin, sac_code,
    hq_address, support_phone, support_email, currency_symbol, theme_color,
    default_gst_rate, quote_validity_days, minimum_gross_margin_pct,
    default_payment_terms, default_warranty_clause,
    pr_auto_approval_threshold, po_dual_signoff_threshold, default_vendor_credit_days,
    bank_beneficiary_name, bank_name, bank_branch, bank_account_number, bank_ifsc_code, upi_vpa_id,
    module_flags, custom_role_permissions
) VALUES (
    1,
    'AirDynamic Solutions Pvt Ltd',
    'AlphaERP - HVAC Enterprise Suite',
    'Enterprise HVAC Systems, MEP Engineering & Turnkey Projects',
    '27AAACA9988A1Z5',
    'AAACA9988A',
    'U29190MH2012PTC234567',
    '995461',
    'Plot 45-B, Techno Park, MIDC Industrial Area, Andheri East, Mumbai 400093, Maharashtra, India',
    '+91 22 4988 7700',
    'support@airdynamic.com',
    '₹',
    'blue',
    18.00,
    30,
    18.00,
    '30% Advance with Purchase Order, 40% against Delivery of Major Equipment, 20% on Completion of Ducting/Piping, 10% on Final Commissioning & Handover.',
    '12 Months comprehensive warranty from the date of final commissioning or 18 months from delivery, whichever is earlier. 5 Years OEM warranty on VRV/Chiller Compressors.',
    50000.00,
    200000.00,
    30,
    'AirDynamic Solutions Pvt Ltd',
    'HDFC Bank Ltd',
    'Andheri East Corporate Branch',
    '50200049182371',
    'HDFC0000240',
    'airdynamic@hdfcbank',
    '{"crmLeads": true, "quotesEstimations": true, "projectsBOQ": true, "procurementPRPO": true, "inventoryWarehouse": true, "workOrdersField": true, "paymentsBilling": true, "salesPerformance": true, "googleSheetsSync": true, "auditLogs": true, "userManagement": true}'::jsonb,
    '{}'::jsonb
) ON CONFLICT (id) DO UPDATE SET company_name = EXCLUDED.company_name;

-- 2. Core Users (Role-Based Personas)
INSERT INTO users (id, name, email, phone, role, avatar, title, department, status) VALUES
('usr-exec', 'Vikram Malhotra', 'vikram.m@airdynamic.com', '+91 98200 11223', 'executive', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Managing Director & CEO', 'Executive Leadership', 'active'),
('usr-sales', 'Rajesh Sharma', 'rajesh.s@airdynamic.com', '+91 98201 22334', 'sales_manager', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Head of Commercial Sales', 'Commercial Sales', 'active'),
('usr-estimator', 'Ananya Deshmukh', 'ananya.d@airdynamic.com', '+91 98202 33445', 'estimator', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Senior HVAC Design Estimator', 'Engineering & Estimation', 'active'),
('usr-procure', 'Karan Mehta', 'karan.m@airdynamic.com', '+91 98203 44556', 'procurement', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'Procurement & Supply Chain Manager', 'Supply Chain & SCM', 'active'),
('usr-warehouse', 'Suresh Kumar', 'suresh.k@airdynamic.com', '+91 98204 55667', 'warehouse', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'Chief Warehouse Storekeeper', 'Logistics & Warehousing', 'active'),
('usr-finance', 'Pooja Iyer', 'pooja.i@airdynamic.com', '+91 98205 66778', 'finance', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Financial Controller & Tax Lead', 'Finance & Accounts', 'active'),
('usr-tech', 'Amit Verma', 'amit.v@airdynamic.com', '+91 98206 77889', 'technician', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Lead Commissioning Engineer', 'Field Projects & Service', 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

-- 3. Sales Representatives
INSERT INTO sales_reps (id, name, email, phone, whatsapp, avatar, monthly_quota, quarterly_quota, base_commission_pct, bonus_multiplier_pct, achieved_sales_month, achieved_sales_quarter, won_deals_count, active_pipeline_value, calculated_commission) VALUES
('rep-1', 'Rajesh Sharma', 'rajesh.s@airdynamic.com', '+91 98201 22334', '+91 98201 22334', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 3500000.00, 10500000.00, 1.50, 0.50, 4850000.00, 12600000.00, 4, 18400000.00, 97000.00),
('rep-2', 'Priya Nambiar', 'priya.n@airdynamic.com', '+91 98207 88990', '+91 98207 88990', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 2500000.00, 7500000.00, 1.50, 0.50, 2200000.00, 6800000.00, 2, 9500000.00, 33000.00),
('rep-3', 'Rohit Sen', 'rohit.s@airdynamic.com', '+91 98208 99001', '+91 98208 99001', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 2000000.00, 6000000.00, 1.50, 0.50, 1850000.00, 5200000.00, 1, 7200000.00, 27750.00)
ON CONFLICT (id) DO NOTHING;

-- 4. Master Data: Clients & Vendors
INSERT INTO client_masters (id, client_code, company_name, contact_person, designation, email, phone, billing_address, city, state, pincode, gstin, pan, credit_limit, credit_period_days, payment_terms, industry) VALUES
('cli-1', 'CLI-1001', 'Cyber Towers IT Park Ltd', 'Deepak Singhania', 'VP Infrastructure', 'singhania@cybertowers.com', '+91 98111 22334', 'Level 8, Cyber Towers, Hitec City, Hyderabad', 'Hyderabad', 'Telangana', '500081', '36AAACC1234F1Z1', 'AAACC1234F', 15000000.00, 30, '30 Days Net', 'Commercial Real Estate'),
('cli-2', 'CLI-1002', 'Apollo Super Specialty Hospitals', 'Dr. Arvind Swaminathan', 'Director Projects', 'arvind.s@apollohealth.org', '+91 98112 33445', 'Road No 72, Jubilee Hills, Hyderabad', 'Hyderabad', 'Telangana', '500033', '36AABCA5678G1Z2', 'AABCA5678G', 20000000.00, 45, '45 Days Net', 'Healthcare & Hospitals'),
('cli-3', 'CLI-1003', 'Prestige Nexus Mall & Entertainment', 'Sunil Godrej', 'Chief Project Engineer', 'sunil@prestigenexus.com', '+91 98113 44556', 'Koramangala 7th Block, Bengaluru', 'Bengaluru', 'Karnataka', '560095', '29AABCP9012H1Z3', 'AABCP9012H', 25000000.00, 30, '30 Days Net', 'Retail & Hospitality')
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendor_masters (id, code, name, contact_person, email, phone, address, city, state, pincode, gstin, pan, rating, credit_period_days, categories_supplied) VALUES
('ven-1', 'VEN-2001', 'Daikin Airconditioning India Pvt Ltd', 'Manish Kapoor', 'sales@daikinindia.com', '+91 124 455 5000', 'Plot 12, Sector 8, IMT Manesar, Gurugram', 'Gurugram', 'Haryana', '122050', '06AAACD1122E1Z8', 'AAACD1122E', 4.9, 45, '["VRF / AC Units", "Chillers & AHU"]'::jsonb),
('ven-2', 'VEN-2002', 'Voltas Limited (Tata Enterprise)', 'Sanjay Kulkarni', 'projects@voltas.com', '+91 22 6665 6666', 'Voltas House A, Dr. Babasaheb Ambedkar Rd, Chinchpokli, Mumbai', 'Mumbai', 'Maharashtra', '400033', '27AAACV3344K1Z2', 'AAACV3344K', 4.7, 30, '["VRF / AC Units", "Ducting & Sheets", "Valves & Dampers"]'::jsonb),
('ven-3', 'VEN-2003', 'Supreme Industries Ltd (Insulation Div)', 'Ramesh Bhatt', 'insulation@supreme.co.in', '+91 22 2285 1000', 'Solitaire Corporate Park, Andheri East, Mumbai', 'Mumbai', 'Maharashtra', '400093', '27AAACS5566M1Z5', 'AAACS5566M', 4.8, 30, '["Insulation Material"]'::jsonb),
('ven-4', 'VEN-2004', 'Mandev Tubes Pvt Ltd', 'Girish Shah', 'sales@mandevtubes.com', '+91 22 2387 7788', '21 Opera House, Lamington Road, Mumbai', 'Mumbai', 'Maharashtra', '400004', '27AAACM7788N1Z9', 'AAACM7788N', 4.9, 30, '["Copper Pipes & Fittings"]'::jsonb),
('ven-5', 'VEN-2005', 'Danfoss India Pvt Ltd', 'Vipin Pillai', 'support@danfoss.com', '+91 44 6712 8000', 'Plot A-19, SIPCOT Industrial Park, Oragadam, Chennai', 'Chennai', 'Tamil Nadu', '602105', '33AAACD9900P1Z1', 'AAACD9900P', 4.8, 45, '["Valves & Dampers", "BMS & Thermostats"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5. Warehouse Inventory
INSERT INTO inventory_items (id, sku, name, category, specification, brand, current_stock, allocated_stock, reorder_level, unit, average_unit_cost, standard_selling_price, default_supplier, warehouse_location, last_restocked_date) VALUES
('inv-1', 'VRF-ODU-14HP', 'Daikin VRV IV-X Outdoor Unit 14 HP', 'VRF / AC Units', '14 HP Inverter VRV R-410A Heat Pump System, Cooling 39.5 kW', 'Daikin', 6.00, 2.00, 3.00, 'Nos', 285000.00, 345000.00, 'Daikin Airconditioning India Pvt Ltd', 'Bay A-01 (Heavy Equipment)', '2026-08-15'),
('inv-2', 'VRF-IDU-DUCT-3TR', 'High Static Ducted Indoor Unit 3.2 TR', 'VRF / AC Units', 'High Static 150 Pa ESP, Drain Pump Included, R-410A', 'Daikin', 18.00, 8.00, 5.00, 'Nos', 38000.00, 48500.00, 'Daikin Airconditioning India Pvt Ltd', 'Bay A-04', '2026-08-18'),
('inv-3', 'VRF-IDU-CASS-2TR', 'Round Flow 4-Way Ceiling Cassette 2.0 TR', 'VRF / AC Units', '360 Airflow Distribution Panel, Wireless Remote Ready', 'Voltas', 12.00, 4.00, 4.00, 'Nos', 29500.00, 37000.00, 'Voltas Limited (Tata Enterprise)', 'Bay A-05', '2026-08-10'),
('inv-4', 'GI-SHEET-24G', 'Galvanized Iron GI Sheet 24 Gauge (0.63mm)', 'Ducting & Sheets', 'Class VIII 120 GSM Zinc Coating, Prime Lock Forming Quality', 'Tata Steel / Jindal', 450.00, 120.00, 100.00, 'Sheets', 1150.00, 1450.00, 'Voltas Limited (Tata Enterprise)', 'Bay B-01 (Sheet Racks)', '2026-08-20'),
('inv-5', 'INSUL-NITRILE-19MM', 'Class O Nitrile Rubber Thermal Insulation 19mm', 'Insulation Material', 'Closed Cell Elastomeric Foam Sheet, Fire Retardant Class O', 'Supreme Industries', 85.00, 30.00, 20.00, 'Rolls', 3800.00, 4800.00, 'Supreme Industries Ltd (Insulation Div)', 'Bay B-04', '2026-08-12'),
('inv-6', 'COP-TUBE-3-4', 'Hard Drawn VRF Copper Tube 3/4" (19.05mm x 1.0mm)', 'Copper Pipes & Fittings', 'Deoxidized High Phosphorus (DHP) Seamless Refrigerant Grade', 'Mandev Tubes', 320.00, 90.00, 60.00, 'Meters', 680.00, 880.00, 'Mandev Tubes Pvt Ltd', 'Bay C-02 (Pipe Stacks)', '2026-08-22'),
('inv-7', 'VALVE-MOT-2INCH', 'Danfoss Motorized Modulating Control Valve 2"', 'Valves & Dampers', '2-Way PN16 Flanged, 0-10V Actuator 24V AC/DC', 'Danfoss', 10.00, 2.00, 4.00, 'Nos', 14500.00, 19200.00, 'Danfoss India Pvt Ltd', 'Bay D-01', '2026-08-05'),
('inv-8', 'GAS-R410A-CYL', 'DuPont / Floron Refrigerant R-410A Cylinder 45 Kg', 'Refrigerants', 'Eco-safe Non-Ozone Depleting High Purity Refrigerant Gas', 'Floron', 15.00, 3.00, 5.00, 'Cylinders', 16500.00, 21000.00, 'Voltas Limited (Tata Enterprise)', 'Gas Storage Locker-01', '2026-08-24'),
('inv-9', 'BMS-THERMO-SMART', 'BACnet / Modbus Smart Digital Touch Thermostat', 'BMS & Thermostats', '7-Day Programmable, 0-10V EC Fan & Actuator Outputs', 'Danfoss', 24.00, 6.00, 8.00, 'Nos', 6200.00, 8500.00, 'Danfoss India Pvt Ltd', 'Bay D-03', '2026-08-14')
ON CONFLICT (id) DO NOTHING;

-- 6. CRM Leads & Survey Pipeline
INSERT INTO leads (id, lead_number, client_name, company_name, phone, email, project_address, city, building_type, hvac_type, estimated_capacity_tr, estimated_value, source, status, priority, assigned_to, assigned_to_name, notes) VALUES
('lead-101', 'LD-2026-101', 'Deepak Singhania', 'Cyber Towers IT Park Ltd', '+91 98111 22334', 'singhania@cybertowers.com', 'Tower C, 6th & 7th Floors, Hitec City, Hyderabad', 'Hyderabad', 'Commercial Office', 'VRV / VRF System', 85.00, 4250000.00, 'HVAC Consultant', 'Awarded', 'High', 'rep-1', 'Rajesh Sharma', 'High-density tech workspace requiring low noise VRV IV-X and precision air balancing.'),
('lead-102', 'LD-2026-102', 'Dr. Arvind Swaminathan', 'Apollo Super Specialty Hospitals', '+91 98112 33445', 'arvind.s@apollohealth.org', 'Critical Care Block 4, Jubilee Hills, Hyderabad', 'Hyderabad', 'Hospital / Healthcare', 'Cleanroom AHU & Ducting', 120.00, 6800000.00, 'Referral', 'Quote Sent', 'High', 'rep-1', 'Rajesh Sharma', 'OT suite requiring HEPA filtration, 24/7 pressure cascades, and chilled water AHUs.'),
('lead-103', 'LD-2026-103', 'Sunil Godrej', 'Prestige Nexus Mall & Entertainment', '+91 98113 44556', 'sunil@prestigenexus.com', 'Atrium & Food Court, Koramangala 7th Block, Bengaluru', 'Bengaluru', 'Retail Mall', 'Water Cooled Chiller', 250.00, 14500000.00, 'Direct Sales', 'Site Survey Completed', 'High', 'rep-2', 'Priya Nambiar', 'Turnkey energy-efficient water cooled screw chiller with variable speed secondary pumping.'),
('lead-104', 'LD-2026-104', 'Kavita Reddy', 'Oakridge International Academy', '+91 98114 55667', 'kavita@oakridge.edu', 'Campus Auditorium & Science Wing, Gachibowli, Hyderabad', 'Hyderabad', 'Commercial Office', 'Ducted Split System', 45.00, 2100000.00, 'Inbound Call', 'Negotiation', 'Medium', 'rep-3', 'Rohit Sen', 'Auditorium acoustics are top priority; acoustic duct lining requested.')
ON CONFLICT (id) DO NOTHING;

-- 7. Techno-Commercial Quotes
INSERT INTO quotes (id, quote_number, lead_id, client_name, company_name, project_title, site_address, prepared_by, date, valid_until, subtotal, discount_pct, discount_amount, tax_pct, tax_amount, total_amount, total_cost, gross_margin_amount, gross_margin_pct, payment_terms, warranty_terms, delivery_timeline, status, awarded_date, converted_to_project_id) VALUES
('quote-101', 'QT-2026-101', 'lead-101', 'Deepak Singhania', 'Cyber Towers IT Park Ltd', '85 TR VRV System for Tech Campus Tower C', 'Tower C, 6th & 7th Floors, Hitec City, Hyderabad', 'Ananya Deshmukh', '2026-08-05', '2026-09-05', 4150000.00, 2.00, 83000.00, 18.00, 732060.00, 4799060.00, 3120000.00, 947000.00, 23.29, '30% Advance, 40% on Delivery, 20% on Erection, 10% on Commissioning', '1 Year Unit + 5 Years Compressor Warranty', '4-5 Weeks', 'Awarded', '2026-08-12', 'proj-101')
ON CONFLICT (id) DO NOTHING;

INSERT INTO quote_line_items (id, quote_id, category, item_sku, description, qty, unit, unit_cost, unit_price, total_cost, total_price) VALUES
('qli-1', 'quote-101', 'Equipment', 'VRF-ODU-14HP', 'Daikin VRV IV-X Outdoor Modular Unit 14 HP (R-410A)', 6.00, 'Nos', 285000.00, 345000.00, 1710000.00, 2070000.00),
('qli-2', 'quote-101', 'Equipment', 'VRF-IDU-DUCT-3TR', 'Daikin High Static Ducted Indoor Unit 3.2 TR', 16.00, 'Nos', 38000.00, 48500.00, 608000.00, 776000.00),
('qli-3', 'quote-101', 'Ducting & Insulation', 'GI-SHEET-24G', 'Factory Fabricated Rectangular GI Ductwork (24G) + 19mm Class O Nitrile Rubber', 2200.00, 'Sq.Ft', 185.00, 260.00, 407000.00, 572000.00),
('qli-4', 'quote-101', 'Piping & Valves', 'COP-TUBE-3-4', 'Hard Drawn Deoxidized Copper Piping with Nitrile Sleeves & Refnet Joints', 450.00, 'RMT', 650.00, 920.00, 292500.00, 414000.00),
('qli-5', 'quote-101', 'Installation & Labor', NULL, 'Erection, Leak Pressure Testing (550 PSI), Evacuation, Nitrogen Hold & Commissioning', 1.00, 'Lot', 102500.00, 318000.00, 102500.00, 318000.00)
ON CONFLICT (id) DO NOTHING;

-- 8. Projects & BOQ Execution
INSERT INTO projects (id, project_number, project_name, client_name, lead_id, quote_id, contract_value, total_estimated_cost, actual_expenses, actual_cost, target_margin_pct, start_date, target_completion_date, status, progress_pct, project_manager, total_shortage_items_count, pr_count, po_count, invoices_generated_amount, payments_received_amount, site_address) VALUES
('proj-101', 'PRJ-2026-001', 'Cyber Towers 85 TR Turnkey VRV Implementation', 'Cyber Towers IT Park Ltd', 'lead-101', 'quote-101', 4067000.00, 3120000.00, 1420000.00, 1420000.00, 23.29, '2026-08-15', '2026-10-30', 'Installation', 45, 'Amit Verma', 1, 1, 1, 2846900.00, 1220100.00, 'Tower C, 6th & 7th Floors, Hitec City, Hyderabad')
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_boq_items (id, project_id, category, sku, description, required_qty, unit, unit_cost, total_cost, in_stock_qty, shortage_qty, status, pr_number, po_number) VALUES
('boq-1', 'proj-101', 'Equipment', 'VRF-ODU-14HP', 'Daikin VRV IV-X Outdoor Modular Unit 14 HP', 6.00, 'Nos', 285000.00, 1710000.00, 4.00, 2.00, 'PO Issued', 'PR-2026-001', 'PO-2026-001'),
('boq-2', 'proj-101', 'Equipment', 'VRF-IDU-DUCT-3TR', 'High Static Ducted Indoor Unit 3.2 TR', 16.00, 'Nos', 38000.00, 608000.00, 10.00, 0.00, 'In Stock', NULL, NULL),
('boq-3', 'proj-101', 'Ducting & Insulation', 'GI-SHEET-24G', 'Galvanized Iron GI Sheet 24 Gauge (0.63mm)', 120.00, 'Sheets', 1150.00, 138000.00, 330.00, 0.00, 'In Stock', NULL, NULL),
('boq-4', 'proj-101', 'Piping & Valves', 'COP-TUBE-3-4', 'Hard Drawn VRF Copper Tube 3/4"', 90.00, 'Meters', 680.00, 61200.00, 230.00, 0.00, 'In Stock', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 9. Procurement Requisitions & Purchase Orders
INSERT INTO purchase_requisitions (id, pr_number, project_id, project_name, requested_by, request_date, priority, total_estimated_amount, status, approved_by, approved_at, converted_po_id, converted_po_number) VALUES
('pr-101', 'PR-2026-001', 'proj-101', 'Cyber Towers 85 TR Turnkey VRV Implementation', 'Amit Verma', '2026-08-16', 'Urgent', 570000.00, 'Converted to PO', 'Vikram Malhotra', '2026-08-17 10:30:00+00', 'po-101', 'PO-2026-001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_orders (id, po_number, pr_id, pr_number, project_id, project_name, vendor_id, vendor_name, vendor_email, vendor_phone, order_date, expected_delivery_date, delivery_address, subtotal, tax_amount, shipping_charges, grand_total, payment_terms, status, approved_by, approved_at, sent_to_vendor_at, vendor_acknowledgment_status) VALUES
('po-101', 'PO-2026-001', 'pr-101', 'PR-2026-001', 'proj-101', 'Cyber Towers 85 TR Turnkey VRV Implementation', 'ven-1', 'Daikin Airconditioning India Pvt Ltd', 'sales@daikinindia.com', '+91 124 455 5000', '2026-08-18', '2026-09-08', 'Plot 45-B, MIDC Industrial Area, Andheri East, Mumbai', 570000.00, 102600.00, 15000.00, 687600.00, '30 Days Credit', 'Sent to Vendor', 'Vikram Malhotra', '2026-08-18 14:00:00+00', '2026-08-18 16:30:00+00', 'Confirmed')
ON CONFLICT (id) DO NOTHING;

INSERT INTO po_items (id, po_id, sku, name, ordered_qty, received_qty, unit, unit_rate, tax_rate_pct, total_amount) VALUES
(uuid_generate_v4(), 'po-101', 'VRF-ODU-14HP', 'Daikin VRV IV-X Outdoor Modular Unit 14 HP', 2.00, 0.00, 'Nos', 285000.00, 18.00, 672600.00);

-- 10. Financial Accounts & Milestone Payments
INSERT INTO chart_of_accounts (id, account_code, account_name, type, sub_category, balance, opening_balance, is_system_account) VALUES
('acc-1010', '1010', 'HDFC Corporate Current A/c (50200049182371)', 'Bank & Cash', 'Cash and Cash Equivalents', 4850000.00, 3200000.00, TRUE),
('acc-1200', '1200', 'Accounts Receivable (Trade Debtors)', 'Accounts Receivable', 'Trade Receivables', 2846900.00, 1500000.00, TRUE),
('acc-1300', '1300', 'Raw Materials & HVAC Equipment Inventory', 'Inventory Asset', 'Inventories', 3980000.00, 4200000.00, TRUE),
('acc-2010', '2010', 'Accounts Payable (Trade Creditors)', 'Accounts Payable', 'Trade Payables', 1420000.00, 950000.00, TRUE),
('acc-2100', '2100', 'GST Output Tax Payable (CGST+SGST+IGST)', 'Statutory Liability', 'Duties & Taxes', 512000.00, 320000.00, TRUE),
('acc-4010', '4010', 'HVAC Turnkey Contracting Revenue', 'Direct Revenue', 'Operating Revenue', 12400000.00, 0.00, TRUE),
('acc-5010', '5010', 'HVAC Equipment & Materials Direct Cost', 'Direct Cost (COGS)', 'Cost of Goods Sold', 7850000.00, 0.00, TRUE),
('acc-5020', '5020', 'Site Fabrication & Labor Charges', 'Direct Cost (COGS)', 'Direct Labor', 1650000.00, 0.00, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_records (id, invoice_number, reference_type, reference_id, reference_title, client_or_vendor_name, is_payable, payment_type, amount, tax_amount, total_amount, due_date, paid_date, status, payment_method, transaction_reference) VALUES
('pay-101', 'INV-2026-001', 'Project', 'proj-101', 'Cyber Towers 85 TR Turnkey VRV Implementation', 'Cyber Towers IT Park Ltd', FALSE, 'Advance 30%', 1220100.00, 219618.00, 1439718.00, '2026-08-20', '2026-08-19', 'Paid', 'Bank Transfer / NEFT', 'HDFCN26231908234'),
('pay-102', 'INV-2026-002', 'Project', 'proj-101', 'Cyber Towers 85 TR Turnkey VRV Implementation', 'Cyber Towers IT Park Ltd', FALSE, 'Equipment Delivery 40%', 1626800.00, 292824.00, 1919624.00, '2026-09-15', NULL, 'Pending', NULL, NULL),
('pay-103', 'PO-PAY-2026-001', 'PurchaseOrder', 'po-101', 'Daikin VRV Outdoor Units Indent', 'Daikin Airconditioning India Pvt Ltd', TRUE, 'Vendor Payout', 570000.00, 102600.00, 687600.00, '2026-09-18', NULL, 'Pending', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- 11. Human Resources Master (Departments, Designations & Employees)
INSERT INTO departments (id, code, name, head_of_department, budget) VALUES
('dept-1', 'MGMT', 'Executive Management', 'Vikram Malhotra', 25000000.00),
('dept-2', 'ENG', 'Engineering & Estimation', 'Ananya Deshmukh', 12000000.00),
('dept-3', 'SALES', 'Commercial Sales & CRM', 'Rajesh Sharma', 18000000.00),
('dept-4', 'PROJ', 'Projects & Field Execution', 'Amit Verma', 35000000.00),
('dept-5', 'SCM', 'Supply Chain & Warehousing', 'Karan Mehta', 15000000.00),
('dept-6', 'FIN', 'Finance & Corporate Accounts', 'Pooja Iyer', 8000000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO designations (id, code, title, department_id, grade_code, min_salary, max_salary) VALUES
('desig-1', 'DES-01', 'Managing Director', 'dept-1', 'L1', 250000.00, 450000.00),
('desig-2', 'DES-02', 'Sales Manager', 'dept-3', 'L3', 90000.00, 150000.00),
('desig-3', 'DES-03', 'Senior HVAC Estimator', 'dept-2', 'L3', 75000.00, 120000.00),
('desig-4', 'DES-04', 'Procurement Officer', 'dept-5', 'L4', 55000.00, 95000.00),
('desig-5', 'DES-05', 'Project Site Engineer', 'dept-4', 'L4', 60000.00, 100000.00),
('desig-6', 'DES-06', 'HVAC Technician Lead', 'dept-4', 'L5', 35000.00, 60000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees (id, emp_code, name, full_name, designation, department, email, official_email, phone, date_of_joining, reporting_manager, employment_status, base_monthly_salary, gross_monthly_salary, ctc_annual, pan, aadhaar, bank_account, ifsc_code) VALUES
('emp-101', 'EMP-001', 'Vikram Malhotra', 'Vikramaditya Malhotra', 'Managing Director', 'Executive Management', 'vikram.m@airdynamic.com', 'vikram.m@airdynamic.com', '+91 98200 11223', '2015-04-01', 'Board of Directors', 'Active', 220000.00, 310000.00, 4200000.00, 'AAAPM1234A', '2345 6789 0123', '50200011223344', 'HDFC0000240'),
('emp-102', 'EMP-002', 'Rajesh Sharma', 'Rajesh Kumar Sharma', 'Sales Manager', 'Commercial Sales & CRM', 'rajesh.s@airdynamic.com', 'rajesh.s@airdynamic.com', '+91 98201 22334', '2018-06-15', 'Vikram Malhotra', 'Active', 85000.00, 125000.00, 1680000.00, 'BBQPS5678B', '3456 7890 1234', '50200022334455', 'HDFC0000240'),
('emp-103', 'EMP-003', 'Ananya Deshmukh', 'Ananya Deshmukh', 'Senior HVAC Estimator', 'Engineering & Estimation', 'ananya.d@airdynamic.com', 'ananya.d@airdynamic.com', '+91 98202 33445', '2020-01-10', 'Vikram Malhotra', 'Active', 70000.00, 105000.00, 1400000.00, 'CCRPD9012C', '4567 8901 2345', '50200033445566', 'HDFC0000240'),
('emp-104', 'EMP-004', 'Amit Verma', 'Amit Kumar Verma', 'Project Site Engineer', 'Projects & Field Execution', 'amit.v@airdynamic.com', 'amit.v@airdynamic.com', '+91 98206 77889', '2021-08-01', 'Vikram Malhotra', 'Active', 60000.00, 88000.00, 1180000.00, 'DDTPV3456D', '5678 9012 3456', '50200044556677', 'HDFC0000240')
ON CONFLICT (id) DO NOTHING;

-- 12. Initial Audit Trail
INSERT INTO audit_logs (id, timestamp, user_id, user_name, user_role, action, entity_type, entity_id, summary) VALUES
('log-001', '2026-08-01 09:00:00+00', 'usr-exec', 'Vikram Malhotra', 'executive', 'CREATE', 'USER', 'usr-exec', 'AlphaERP Initialized with multi-tier HVAC engineering and procurement database.'),
('log-002', '2026-08-05 11:30:00+00', 'usr-estimator', 'Ananya Deshmukh', 'estimator', 'CREATE', 'QUOTE', 'quote-101', 'Generated Techno-Commercial Quote QT-2026-101 for Cyber Towers (₹47,99,060).'),
('log-003', '2026-08-12 15:45:00+00', 'usr-sales', 'Rajesh Sharma', 'sales_manager', 'AWARD', 'PROJECT', 'proj-101', 'Awarded Cyber Towers project PRJ-2026-001. Generated BOQ shortage checks & milestone receivables.'),
('log-004', '2026-08-18 16:30:00+00', 'usr-procure', 'Karan Mehta', 'procurement', 'SEND_TO_VENDOR', 'PO', 'po-101', 'Issued Purchase Order PO-2026-001 to Daikin Airconditioning India Pvt Ltd.')
ON CONFLICT (id) DO NOTHING;
