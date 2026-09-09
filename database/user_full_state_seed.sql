-- ====================================================================
-- AlphaERP User Full State Database Seed for InsForge Backend
-- Synchronizing all CRM Leads, Quotes, Projects, Inventory, PRs, POs, Work Orders, Payments & Audits
-- ====================================================================

-- 1. INVENTORY (16 Core SKUs)
INSERT INTO public.inventory (id, sku, name, category, quantity, reorder_level, unit_cost, unit, location, data)
VALUES
  ('inv-01', 'VRF-ODU-14HP', 'Daikin VRV X Series ODU 14 HP (40kW)', 'VRF / AC Units', 4, 3, 480000, 'Nos', 'Bay A-01 (Heavy Equipment)', '{"specification": "Top Discharge Inverter Scroll Compressor, R-410A Eco friendly", "brand": "Daikin", "allocatedStock": 2, "availableStock": 2}'::jsonb),
  ('inv-02', 'VRF-ODU-20HP', 'Daikin VRV X Series ODU 20 HP (56kW)', 'VRF / AC Units', 1, 2, 690000, 'Nos', 'Bay A-02 (Heavy Equipment)', '{"specification": "High Ambient Modular Inverter, Anti-Corrosion treated condenser", "brand": "Daikin", "allocatedStock": 1, "availableStock": 0}'::jsonb),
  ('inv-03', 'VRF-IDU-CAS-3TR', '4-Way Ceiling Cassette IDU 3.0 TR', 'VRF / AC Units', 20, 8, 42000, 'Nos', 'Rack B-04', '{"specification": "360 Airflow round flow panel, wired touch controller included", "brand": "Daikin", "allocatedStock": 8, "availableStock": 12}'::jsonb),
  ('inv-04', 'VRF-IDU-DUC-4TR', 'High Static Concealed Duct IDU 4.0 TR', 'VRF / AC Units', 12, 5, 51000, 'Nos', 'Rack B-06', '{"specification": "150 Pa External Static Pressure, Drain pump built-in", "brand": "Blue Star Climate Systems Ltd", "allocatedStock": 6, "availableStock": 6}'::jsonb),
  ('inv-05', 'CHILL-AC-100TR', 'Air Cooled Screw Chiller 100 TR', 'Chillers & AHU', 0, 1, 3200000, 'Nos', 'Yard Block C-01', '{"specification": "Dual Semi-Hermetic Screw Compressors, Microchannel coils", "brand": "Blue Star", "allocatedStock": 0, "availableStock": 0}'::jsonb),
  ('inv-06', 'AHU-DX-6000CFM', 'Double Skin Modular AHU 6000 CFM (15 TR DX)', 'Chillers & AHU', 3, 2, 285000, 'Nos', 'Yard Block C-03', '{"specification": "43mm PUF injected panels, Plug Fan with EC Motor, VFD ready", "brand": "Caryaire / Custom", "allocatedStock": 2, "availableStock": 1}'::jsonb),
  ('inv-07', 'GI-DUCT-24G', 'Galvanized Iron (GI) Ducting Sheet 24 Gauge (0.63mm)', 'Ducting & Sheets', 180, 50, 1650, 'Sheets', 'Raw Material Shed D-1', '{"specification": "Lock-forming quality 120 GSM Zinc coating, IS 277 grade", "brand": "Tata Steel", "allocatedStock": 120, "availableStock": 60}'::jsonb),
  ('inv-08', 'GI-DUCT-22G', 'Galvanized Iron (GI) Ducting Sheet 22 Gauge (0.80mm)', 'Ducting & Sheets', 40, 40, 2100, 'Sheets', 'Raw Material Shed D-2', '{"specification": "High Pressure Duct Grade, 180 GSM Zinc coating", "brand": "Tata Steel", "allocatedStock": 45, "availableStock": -5}'::jsonb),
  ('inv-09', 'ARM-INSUL-19MM', 'Class O Nitrile Rubber Sheet Insulation 19mm Thick', 'Insulation Material', 25, 15, 5800, 'Rolls', 'Aisle E-01', '{"specification": "Fire retardant Class 0, Anti-microbial, rolls of 1m x 10m", "brand": "Armacell", "allocatedStock": 18, "availableStock": 7}'::jsonb),
  ('inv-10', 'ARM-INSUL-PIPE-0.75', 'Class O Nitrile Pipe Tubing Insulation 3/4" ID (19mm wall)', 'Insulation Material', 120, 60, 280, 'Meters', 'Aisle E-03', '{"specification": "Pre-slit tubular flexible insulation, 2m length", "brand": "Armacell", "allocatedStock": 80, "availableStock": 40}'::jsonb),
  ('inv-11', 'COP-TUBE-0.75', 'Hard Drawn Copper Pipe 3/4" OD (19.05mm x 1.0mm wall)', 'Copper Pipes & Fittings', 350, 100, 950, 'Meters', 'Rack F-02', '{"specification": "VRF Grade deoxidized high phosphorus copper, ASTM B280", "brand": "Mandev Tubes", "allocatedStock": 280, "availableStock": 70}'::jsonb),
  ('inv-12', 'COP-TUBE-1.125', 'Hard Drawn Copper Pipe 1-1/8" OD (28.58mm x 1.25mm wall)', 'Copper Pipes & Fittings', 45, 50, 1750, 'Meters', 'Rack F-04', '{"specification": "Heavy Duty Suction Line VRF Tube, ASTM B280", "brand": "Mandev Tubes", "allocatedStock": 70, "availableStock": -25}'::jsonb),
  ('inv-13', 'REF-R410A-CYL', 'Eco Refrigerant Gas R-410A Cylinder (11.3 kg)', 'Refrigerants', 16, 10, 8200, 'Cylinders', 'Gas Storage Vault G-01', '{"specification": "Zero ODP, non-flammable HFC blend, 99.9% purity certified", "brand": "Blue Star / Chemours", "allocatedStock": 6, "availableStock": 10}'::jsonb),
  ('inv-14', 'HON-BMS-TSTAT', 'Honeywell BACnet MS/TP Digital Touch Thermostat', 'BMS & Thermostats', 35, 15, 7500, 'Nos', 'Electronics Vault H-01', '{"specification": "7-day programmable, Modbus/BACnet compatible, LCD backlit", "brand": "Honeywell", "allocatedStock": 20, "availableStock": 15}'::jsonb),
  ('inv-15', 'DIFF-SQR-4WAY', 'Aluminum 4-Way Square Ceiling Diffuser 600x600mm', 'Air Outlets & Diffusers', 65, 30, 1850, 'Nos', 'Rack J-03', '{"specification": "Powder coated pure white RAL 9010, with opposed blade damper", "brand": "Caryaire", "allocatedStock": 40, "availableStock": 25}'::jsonb),
  ('inv-16', 'DAMP-FIRE-MOT-24V', 'Motorized UL 555 Fire & Smoke Damper 450x450mm with Actuator', 'Valves & Dampers', 8, 5, 14200, 'Nos', 'Rack J-05', '{"specification": "90-min fire rated, 24V Belimo spring-return actuator included", "brand": "Caryaire / Belimo", "allocatedStock": 6, "availableStock": 2}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  unit_cost = EXCLUDED.unit_cost,
  data = EXCLUDED.data,
  updated_at = now();

-- 2. CRM LEADS
INSERT INTO public.leads (id, lead_number, client_name, company_name, phone, email, project_address, city, building_type, hvac_type, estimated_capacity_tr, estimated_value, source, status, priority, assigned_to, assigned_to_name, notes, data)
VALUES
  ('lead-1788618740921', '26-LD-0001', 'Vishal', 'Ajeevi', '+91 90909099000', 'ajeevi@xyz.com', 'Ajeevi Office Greater Noida', 'Noida', 'Commercial Office', 'Air Cooled Chiller', 1, 45000, 'Inbound Call', 'Negotiation', 'High', 'rep-01', 'Rajesh Sharma', 'Client requested immediate site survey for office floor fitout.', '{"followUps": [{"id": "fu-1788618775458", "date": "2026-09-07", "type": "Site Visit", "notes": "Site Survey & Technical Review: Confirm duct routing with site MEP consultant", "completed": true}, {"id": "fu-1788618831596", "date": "2026-09-05", "type": "Site Visit", "notes": "Site Survey & Technical Review: reschedule", "completed": false}], "quoteIds": []}'::jsonb),
  ('lead-1788186478025', 'LEAD-2026-108', 'Shashank', 'Root of Purity', '+91 9090909090', 'shashank@test.com', 'Ghaziabad', 'Ghaziabad', 'Commercial Office', 'Ducted Split System', 5, 225000, 'Referral', 'Quote Sent', 'High', 'rep-04', 'Vikram Sundaram', 'Client requested immediate site survey for office floor fitout.', '{"followUps": [{"id": "fu-1788186528239", "date": "2026-09-02", "type": "Site Visit", "notes": "Site Survey & Technical Review: Confirm duct routing with site MEP consultant", "completed": false}], "quoteIds": ["qte-1788186603717", "qte-1788605892499", "qte-1788618545505"]}'::jsonb),
  ('lead-1788161822065', 'LEAD-2026-107', 'Shivendra Gautam', 'Okaya', '09830065507', 'shiven.k@aol.in', 'Peeragarhi', 'Delhi', 'Commercial Office', 'VRV / VRF System', 5, 225000, 'Architect', 'Site Survey Scheduled', 'Medium', 'rep-03', 'Amitabh Verma', 'Client requested immediate site survey for office floor fitout.', '{"followUps": [{"id": "fu-1788161856094", "date": "2026-09-02", "type": "Site Visit", "completed": true}, {"id": "fu-1788882374946", "date": "2026-09-10", "type": "Site Visit", "completed": false}], "quoteIds": []}'::jsonb),
  ('lead-1788153590940', 'LEAD-2026-106', 'Shiven', 'JSAlphasoft', '+91 9999999999', 'info@jsalphasoft.com', 'Centurian Park Terrace Homes', 'Greater Noida West', 'Commercial Office', 'Ventilation & Exhaust', 2, 90000, 'Inbound Call', 'Awarded', 'Medium', 'rep-04', 'Vikram Sundaram', 'Client requested immediate site survey for office floor fitout.', '{"projectId": "prj-1788186695163", "quoteIds": ["qte-1788162023466", "qte-1788162106491"]}'::jsonb),
  ('lead-1788110732145', 'LEAD-2026-105', 'Shivendra Gautam', 'Okaya Power Group', '9830065507', 'shiven.k@aol.in', 'delhi office', 'Delhi', 'Commercial Office', 'Air Cooled Chiller', 5, 225000, 'Direct Sales', 'Awarded', 'Medium', 'rep-02', 'Priya Mukherjee', 'Client requested immediate site survey for office floor fitout.', '{"projectId": "prj-1788117311294", "quoteIds": ["qte-1788117290831", "qte-1788117297563"]}'::jsonb),
  ('lead-101', 'LEAD-2026-089', 'Sunita Deshmukh (Head of Projects)', 'Apex Health Tower & Multispeciality Clinic', '+91 98201 55678', 'sunita.deshmukh@apexhealth.in', 'Plot 44, BKC Bandra East, Mumbai, MH 400051', 'Mumbai', 'Hospital / Healthcare', 'Cleanroom AHU & Ducting', 180, 14200000, 'HVAC Consultant', 'Awarded', 'High', 'rep-01', 'Rajesh Sharma', 'Requires positive pressure HEPA filtration for 4 OT suites and VRF for patient wards.', '{"projectId": "prj-1788112499075", "quoteIds": ["qte-042", "qte-1788110851573", "qte-1788110903845", "qte-1788110924511", "qte-1788110931427", "qte-1788111029656", "qte-1788111156018"]}'::jsonb),
  ('lead-102', 'LEAD-2026-090', 'Rohan Mehra (VP Facilities)', 'Nexus Infinity Tech Park (Wing C)', '+91 99881 22334', 'rohan.mehra@nexusspaces.com', 'Outer Ring Road, Bellandur, Bengaluru, KA 560103', 'Bengaluru', 'Commercial Office', 'VRV / VRF System', 120, 9800000, 'Website', 'Awarded', 'High', 'rep-02', 'Priya Mukherjee', 'Won contract against Voltas! Converted to active project PRJ-2026-001.', '{"projectId": "prj-001", "quoteIds": ["qte-043"]}'::jsonb),
  ('lead-103', 'LEAD-2026-091', 'Col. Vikram Rathore (Estate Manager)', 'Grand Heritage Palace Hotel & Resort', '+91 94140 88990', 'estate@grandheritagejaipur.com', 'Amer Road, Pink City, Jaipur, RJ 302002', 'Jaipur', 'Hotel / Hospitality', 'Air Cooled Chiller', 250, 21500000, 'Architect', 'Negotiation', 'High', 'rep-04', 'Vikram Sundaram', 'Retrofit of legacy reciprocating chillers to high-efficiency air-cooled screw chiller system.', '{"quoteIds": ["qte-044"]}'::jsonb),
  ('lead-104', 'LEAD-2026-092', 'Deepak Singhania', 'Singhania Cloud & Edge Data Center', '+91 98190 77123', 'd.singhania@cloudsingh.com', 'MIDC Rabale, Navi Mumbai, MH 400701', 'Navi Mumbai', 'Data Center', 'VRV / VRF System', 80, 7200000, 'Inbound Call', 'Lost', 'Medium', 'rep-03', 'Amitabh Verma', 'Requires precision PAC units with N+1 redundancy for 3 server halls.', '{"quoteIds": []}'::jsonb),
  ('lead-105', 'LEAD-2026-093', 'Kavita Chawla', 'Lumina Retail Galleria (Food Court Extension)', '+91 98711 44556', 'kavita@luminagalleria.com', 'MG Road, Sector 29, Gurugram, HR 122002', 'Gurugram', 'Retail Mall', 'Ventilation & Exhaust', 60, 4800000, 'Trade Expo', 'Site Survey Scheduled', 'Medium', 'rep-01', 'Rajesh Sharma', 'Kitchen exhaust scrubber system and treated fresh air (TFA) units.', '{"quoteIds": []}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  estimated_value = EXCLUDED.estimated_value,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 3. QUOTES
INSERT INTO public.quotes (id, quote_number, lead_id, client_name, company_name, project_title, site_address, prepared_by, date, valid_until, subtotal, discount_pct, discount_amount, tax_pct, tax_amount, total_amount, total_cost, gross_margin_amount, gross_margin_pct, payment_terms, warranty_terms, delivery_timeline, status, data)
VALUES
  ('qte-1788618545505', '26-QT-0002', 'lead-1788186478025', 'Shashank', 'Root of Purity', 'HVAC Turnkey System for Root of Purity', 'Ghaziabad', 'Vikram Sundaram', '2026-09-05', '2026-10-05', 2568900, 5, 128445, 18, 439281.9, 2879736.9, 1939600, 500855, 20.52, '30% Advance, 40% Delivery, 20% Installation, 10% Testing', '1 Year Comprehensive on System & 5 Years on Compressors', '4 - 6 Weeks from PO & Advance', 'Sent', '{}'::jsonb),
  ('qte-1788605892499', '26-QT-0001', 'lead-1788186478025', 'Shashank', 'Root of Purity', 'HVAC Turnkey System for Root of Purity', 'Ghaziabad', 'Vikram Sundaram', '2026-09-05', '2026-10-05', 2568900, 10, 256890, 18, 416161.8, 2728171.8, 1939600, 372410, 16.11, '30% Advance, 40% Delivery, 20% Installation, 10% Testing', '1 Year Comprehensive on System & 5 Years on Compressors', '4 - 6 Weeks from PO & Advance', 'Sent', '{}'::jsonb),
  ('qte-1788162106491', 'QTE-2026-0056', 'lead-1788153590940', 'Shiven', 'JSAlphasoft', 'Commercial HVAC VRF Installation & Ducting', 'BKC Commercial Hub, Mumbai', 'Vikram Sundaram', '2026-08-31', '2026-09-30', 2574100, 5, 128705, 18, 440171.1, 2885566.1, 1943400, 501995, 20.53, '30% Advance, 40% Delivery, 20% Installation, 10% Testing', '1 Year Comprehensive on System & 5 Years on Compressors', '4 - 6 Weeks from PO & Advance', 'Awarded', '{"convertedToProjectId": "prj-1788186695163"}'::jsonb),
  ('qte-1788117297563', 'QTE-2026-0054', 'lead-1788110732145', 'Shivendra Gautam', 'Okaya Power Group', 'Commercial HVAC VRF Installation & Ducting', 'BKC Commercial Hub, Mumbai', 'Priya Mukherjee', '2026-08-30', '2026-09-29', 2568900, 5, 128445, 18, 439281.9, 2879736.9, 1939600, 500855, 20.52, '30% Advance, 40% Delivery, 20% Installation, 10% Testing', '1 Year Comprehensive on System & 5 Years on Compressors', '4 - 6 Weeks from PO & Advance', 'Awarded', '{"convertedToProjectId": "prj-1788117311294"}'::jsonb),
  ('qte-1788110903845', 'QTE-2026-0048', 'lead-101', 'Sunita Deshmukh', 'Apex Health Tower & Multispeciality Clinic', 'Commercial HVAC VRF Installation & Ducting', 'BKC Commercial Hub, Mumbai', 'Rajesh Sharma', '2026-08-30', '2026-09-29', 2568900, 5, 128445, 18, 439281.9, 2879736.9, 1939600, 500855, 20.52, '30% Advance, 40% Delivery, 20% Installation, 10% Testing', '1 Year Comprehensive on System & 5 Years on Compressors', '4 - 6 Weeks from PO & Advance', 'Awarded', '{"convertedToProjectId": "prj-1788112499075"}'::jsonb),
  ('qte-043', 'QTE-2026-0043', 'lead-102', 'Rohan Mehra', 'Nexus Infinity Tech Park (Wing C)', 'Supply, Installation & Commissioning of 120 TR Daikin VRV X System', 'Outer Ring Road, Bellandur, Bengaluru, KA 560103', 'Priya Mukherjee', '2026-08-18', '2026-09-18', 9552500, 3.5, 334337.5, 18, 1659269.25, 10877431.75, 7240500, 1977662.5, 21.45, '30% Advance, 40% Delivery, 20% Piping, 10% Commissioning', '12 Months comprehensive + 5 Years on Compressors', '4 Weeks from Advance', 'Awarded', '{"convertedToProjectId": "prj-001"}'::jsonb),
  ('qte-042', 'QTE-2026-0042', 'lead-101', 'Sunita Deshmukh', 'Apex Health Tower & Multispeciality Clinic', 'Cleanroom HVAC System with 4 Modular AHUs, HEPA Terminal Units & VRF', 'Plot 44, BKC Bandra East, Mumbai, MH 400051', 'Rajesh Sharma', '2026-08-22', '2026-09-22', 10296000, 2, 205920, 18, 1816214.4, 11906294.4, 7344400, 2745680, 27.21, '25% Advance, 45% Delivery, 20% Installation, 10% Post NABH Validation', '2 Years full warranty', '6 Weeks', 'Sent', '{}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  total_amount = EXCLUDED.total_amount,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 4. PROJECTS
INSERT INTO public.projects (id, project_number, title, client_name, company_name, status, start_date, completion_date, contract_value, total_budget, invoiced_amount, collected_amount, data)
VALUES
  ('prj-1788186695163', 'PRJ-2026-005', 'JSAlphasoft - Commercial HVAC VRF Installation & Ducting', 'Shiven', 'JSAlphasoft', 'Procurement', '2026-08-31', '2026-10-30', 2885566.1, 1943400, 1021491, 0, '{"progressPct": 10, "projectManager": "Vikramaditya Solanki", "leadId": "lead-1788153590940", "quoteId": "qte-1788162106491"}'::jsonb),
  ('prj-1788117311294', 'PRJ-2026-004', 'Okaya Power Group - Commercial HVAC VRF Installation & Ducting', 'Shivendra Gautam', 'Okaya Power Group', 'Procurement', '2026-08-30', '2026-10-29', 2879736.9, 1939600, 1019427, 0, '{"progressPct": 10, "projectManager": "Vikramaditya Solanki", "leadId": "lead-1788110732145", "quoteId": "qte-1788117297563"}'::jsonb),
  ('prj-1788112499075', 'PRJ-2026-003', 'Apex Health Tower & Multispeciality Clinic - Commercial HVAC VRF Installation & Ducting', 'Sunita Deshmukh', 'Apex Health Tower & Multispeciality Clinic', 'Procurement', '2026-08-30', '2026-10-29', 2879736.9, 1939600, 1019427, 0, '{"progressPct": 10, "projectManager": "Vikramaditya Solanki", "leadId": "lead-101", "quoteId": "qte-1788110903845"}'::jsonb),
  ('prj-001', 'PRJ-2026-001', 'Nexus Tech Park 120 TR VRF Installation', 'Rohan Mehra', 'Nexus Infinity Tech Park (Wing C)', 'Procurement', '2026-08-28', '2026-10-15', 10877431.75, 7240500, 3263229.5, 3263229.5, '{"progressPct": 25, "projectManager": "Vikramaditya Solanki", "leadId": "lead-102", "quoteId": "qte-043"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  contract_value = EXCLUDED.contract_value,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 5. PURCHASE REQUISITIONS (PR)
INSERT INTO public.purchase_requisitions (id, pr_number, project_id, requested_by, status, total_estimated_cost, date, data)
VALUES
  ('pr-1788611833539', '26-PR-0001', NULL, 'shiven (Managing Director & Operations Head)', 'Pending Approval', 47500, '2026-09-05', '{"projectName": "General Stock Replenishment", "items": [{"sku": "COP-TUBE-0.75", "name": "Hard Drawn Copper Pipe 3/4 OD", "requiredQty": 50, "estimatedTotal": 47500}]}'::jsonb),
  ('pr-1788186784269', 'PR-2026-019', 'prj-1788186695163', 'shiven', 'Converted to PO', 1319000, '2026-08-31', '{"projectName": "JSAlphasoft VRF Installation", "convertedPoNumber": "PO-2026-021"}'::jsonb),
  ('pr-1788162268654', 'PR-2026-018', 'prj-1788117311294', 'Shivender Kumar', 'Converted to PO', 64000, '2026-08-31', '{"projectName": "Okaya Power Group", "convertedPoNumber": "PO-2026-020"}'::jsonb),
  ('pr-1788154653503', 'PR-2026-017', 'prj-1788117311294', 'Shivender Kumar', 'Pending Approval', 760000, '2026-08-31', '{"projectName": "Okaya Power Group VRV ODU"}'::jsonb),
  ('pr-008', 'PR-2026-008', 'prj-001', 'Vikramaditya Solanki', 'Converted to PO', 4374000, '2026-08-28', '{"projectName": "Nexus Tech Park 120 TR VRF", "convertedPoNumber": "PO-2026-014"}'::jsonb),
  ('pr-009', 'PR-2026-009', 'prj-001', 'Vikramaditya Solanki', 'Converted to PO', 676000, '2026-08-29', '{"projectName": "Nexus Tech Park 120 TR VRF", "convertedPoNumber": "PO-2026-015"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  total_estimated_cost = EXCLUDED.total_estimated_cost,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 6. PURCHASE ORDERS (PO)
INSERT INTO public.purchase_orders (id, po_number, pr_id, vendor_id, vendor_name, status, total_amount, date, data)
VALUES
  ('po-1788187041431', 'PO-2026-021', 'pr-1788186784269', 'ven-01', 'Daikin Airconditioning India Pvt Ltd', 'Fulfilled', 1581420, '2026-08-31', '{"deliveryAddress": "Central Warehouse Yard B, Bangalore", "paymentTerms": "30 days credit net"}'::jsonb),
  ('po-1788162359217', 'PO-2026-020', 'pr-1788162268654', 'ven-01', 'Daikin Airconditioning India Pvt Ltd', 'Sent to Vendor', 83520, '2026-08-31', '{"deliveryAddress": "Central Warehouse Yard B, Bangalore", "paymentTerms": "30 days credit net"}'::jsonb),
  ('po-014', 'PO-2026-014', 'pr-008', 'ven-01', 'Daikin Airconditioning India Pvt Ltd', 'Sent to Vendor', 5186320, '2026-08-28', '{"deliveryAddress": "Central Warehouse Yard B, Bangalore", "paymentTerms": "30 days net credit"}'::jsonb),
  ('po-015', 'PO-2026-015', 'pr-009', 'ven-04', 'Mandev Tubes (Copper Solutions)', 'Sent to Vendor', 805680, '2026-08-29', '{"deliveryAddress": "Site Address: Bellandur, Bengaluru", "paymentTerms": "15 days credit"}'::jsonb),
  ('po-016', 'PO-2026-016', NULL, 'ven-02', 'Voltas Limited (MEP & Chiller Div)', 'Sent to Vendor', 1325440, '2026-08-30', '{"deliveryAddress": "Central Warehouse Yard B, Bangalore", "paymentTerms": "30 days net credit"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  total_amount = EXCLUDED.total_amount,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 7. WORK ORDERS
INSERT INTO public.work_orders (id, wo_number, project_id, title, status, priority, assigned_to, scheduled_date, data)
VALUES
  ('wo-1788186695165', 'WO-2026-0024', 'prj-1788186695163', 'JSAlphasoft - Commercial HVAC VRF Installation & Ducting', 'Scheduled', 'Medium', 'Imran Khan (Lead HVAC Specialist)', '2026-08-31', '{"clientName": "Shiven", "siteAddress": "BKC Commercial Hub, Mumbai"}'::jsonb),
  ('wo-1788117311295', 'WO-2026-0023', 'prj-1788117311294', 'Okaya Power Group - Commercial HVAC VRF Installation & Ducting', 'Scheduled', 'Medium', 'Imran Khan (Lead HVAC Specialist)', '2026-08-30', '{"clientName": "Shivendra Gautam", "siteAddress": "BKC Commercial Hub, Mumbai"}'::jsonb),
  ('wo-1788112499076', 'WO-2026-0022', 'prj-1788112499075', 'Apex Health Tower & Multispeciality Clinic - Commercial HVAC VRF Installation & Ducting', 'Inspection', 'High', 'Imran Khan (Lead HVAC Specialist)', '2026-08-30', '{"clientName": "Sunita Deshmukh", "siteAddress": "BKC Commercial Hub, Mumbai"}'::jsonb),
  ('wo-001', 'WO-2026-0018', 'prj-001', '120 TR VRV X Installation & Piping Phase 1', 'In Progress', 'High', 'Imran Khan (Lead HVAC Specialist)', '2026-08-30', '{"clientName": "Nexus Infinity Tech Park", "siteAddress": "Outer Ring Road, Bellandur, Bengaluru"}'::jsonb),
  ('wo-002', 'WO-2026-0019', NULL, 'Annual Chiller Overhaul & Condenser Descaling', 'Inspection', 'Medium', 'Suresh Patil (Senior Refrigeration Engineer)', '2026-08-28', '{"clientName": "Metro Grand Tower (Commercial)", "siteAddress": "Andheri East, Mumbai"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 8. PAYMENTS
INSERT INTO public.payments (id, invoice_number, project_id, client_name, amount, status, payment_date, due_date, data)
VALUES
  ('pay-1788187239789', 'PO-PAY-021', 'prj-1788186695163', 'Daikin Airconditioning India Pvt Ltd', 1581420, 'Pending', NULL, '2026-09-07', '{"isPayable": true, "paymentType": "Vendor Payout"}'::jsonb),
  ('pay-1788186695165', 'INV-2026-0098', 'prj-1788186695163', 'Shiven', 1021491, 'Pending', NULL, '2026-09-07', '{"isPayable": false, "paymentType": "Advance 30%"}'::jsonb),
  ('pay-1788162428942', 'PO-PAY-020', 'prj-1788117311294', 'Daikin Airconditioning India Pvt Ltd', 83520, 'Pending', NULL, '2026-09-07', '{"isPayable": true, "paymentType": "Vendor Payout"}'::jsonb),
  ('pay-1788117311295', 'INV-2026-0096', 'prj-1788117311294', 'Shivendra Gautam', 1019427, 'Pending', NULL, '2026-09-06', '{"isPayable": false, "paymentType": "Advance 30%"}'::jsonb),
  ('pay-1788115484786', 'PO-PAY-016', NULL, 'Voltas Limited (MEP & Chiller Div)', 1325440, 'Pending', NULL, '2026-09-10', '{"isPayable": true, "paymentType": "Vendor Payout"}'::jsonb),
  ('pay-1788112499076', 'INV-2026-0094', 'prj-1788112499075', 'Sunita Deshmukh (Head of Projects)', 1019427, 'Pending', NULL, '2026-09-06', '{"isPayable": false, "paymentType": "Advance 30%"}'::jsonb),
  ('pay-001', 'INV-2026-0081', 'prj-001', 'Nexus Infinity Tech Park (Wing C)', 3263229.5, 'Received', '2026-08-28', '2026-08-28', '{"isPayable": false, "paymentType": "Advance 30%", "transactionReference": "HDFC-NEFT-994827104"}'::jsonb),
  ('pay-002', 'INV-2026-0082', 'prj-001', 'Nexus Infinity Tech Park (Wing C)', 4350972.67, 'Pending', NULL, '2026-09-12', '{"isPayable": false, "paymentType": "Equipment Delivery 40%"}'::jsonb),
  ('pay-003', 'PO-PAY-014', 'prj-001', 'Daikin Airconditioning India Pvt Ltd', 5186320, 'Pending', NULL, '2026-09-28', '{"isPayable": true, "paymentType": "Vendor Payout"}'::jsonb),
  ('pay-004', 'PO-PAY-015', 'prj-001', 'Mandev Tubes (Copper Solutions)', 805680, 'Pending', NULL, '2026-09-14', '{"isPayable": true, "paymentType": "Vendor Payout"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  amount = EXCLUDED.amount,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();
