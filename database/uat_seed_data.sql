-- ====================================================================
-- AlphaERP Industry Best Practice UAT Seed Data
-- Complete end-to-end HVAC ERP scenarios for User Acceptance Testing (UAT)
-- ====================================================================

-- 1. SEED INVENTORY (Central Warehouse & Site Stores)
INSERT INTO public.inventory (id, sku, name, category, quantity, reorder_level, unit_cost, unit, location, data)
VALUES
  ('inv-01', 'DAIKIN-VRV-16HP', 'Daikin VRV X7 Outdoor Unit 16 HP (Heat Pump)', 'VRV / VRF Systems', 14, 3, 245000, 'Set', 'Bhiwandi Central Warehouse - Bay A1', '{"refrigerant": "R410A", "powerSupply": "415V / 3Ph / 50Hz", "warrantyMonths": 60}'::jsonb),
  ('inv-02', 'DAIKIN-VRV-12HP', 'Daikin VRV X7 Outdoor Unit 12 HP (Heat Pump)', 'VRV / VRF Systems', 8, 2, 195000, 'Set', 'Bhiwandi Central Warehouse - Bay A1', '{"refrigerant": "R410A", "powerSupply": "415V / 3Ph / 50Hz", "warrantyMonths": 60}'::jsonb),
  ('inv-03', 'MITSUBISHI-VRF-18HP', 'Mitsubishi Electric City Multi VRF Y-Series 18 HP', 'VRV / VRF Systems', 6, 2, 285000, 'Set', 'Bhiwandi Central Warehouse - Bay A2', '{"refrigerant": "R410A", "inverterDriven": true}'::jsonb),
  ('inv-04', 'BLUESTAR-CASSETTE-3TR', 'Blue Star Inverter Round Flow 4-Way Cassette 3.0 TR', 'Indoor Units (IDU)', 45, 10, 42000, 'Nos', 'Bhiwandi Central Warehouse - Bay B1', '{"airFlowCFM": 1100, "drainPumpBuiltin": true}'::jsonb),
  ('inv-05', 'CARRIER-CASSETTE-2TR', 'Carrier Inverter Superflow 4-Way Cassette 2.0 TR', 'Indoor Units (IDU)', 32, 8, 33500, 'Nos', 'Bhiwandi Central Warehouse - Bay B2', '{"airFlowCFM": 750, "refrigerant": "R32"}'::jsonb),
  ('inv-06', 'VOLTAS-DUCTABLE-5.5TR', 'Voltas Ductable Split Unit Inverter 5.5 TR High Static', 'Ductable Units', 18, 4, 68000, 'Nos', 'Bhiwandi Central Warehouse - Bay B3', '{"staticPressurePa": 150, "airFlowCFM": 2200}'::jsonb),
  ('inv-07', 'TRANE-CHILLER-120TR', 'Trane AquaStream 3G Air-Cooled Scroll Chiller 120 TR', 'Chillers & AHU', 2, 1, 1850000, 'Set', 'Heavy Equipment Yard - Bay H1', '{"compressorType": "Scroll", "refrigerant": "R134a", "bmsCompatible": true}'::jsonb),
  ('inv-08', 'ZECO-AHU-6500CFM', 'Zeco Double Skin Air Handling Unit (AHU) 6,500 CFM with VFD', 'Chillers & AHU', 5, 2, 240000, 'Nos', 'Heavy Equipment Yard - Bay H2', '{"panelThicknessMm": 43, "motorEfficiency": "IE3"}'::jsonb),
  ('inv-09', 'COPPER-PIPE-1-2IN', 'Mandev Copper Tube 1/2" (12.7mm) OD 20 SWG (15m Coil)', 'Copper & Piping', 160, 30, 4850, 'Coil', 'Hardware Store - Rack C1', '{"grade": "VRV Hard Drawn", "pressureRatedBar": 45}'::jsonb),
  ('inv-10', 'COPPER-PIPE-3-4IN', 'Mandev Copper Tube 3/4" (19.05mm) OD 18 SWG (15m Coil)', 'Copper & Piping', 120, 25, 6950, 'Coil', 'Hardware Store - Rack C2', '{"grade": "VRV Hard Drawn", "pressureRatedBar": 45}'::jsonb),
  ('inv-11', 'COPPER-PIPE-1-1-8', 'Mandev Copper Tube 1-1/8" (28.6mm) OD 16 SWG (6m Length)', 'Copper & Piping', 95, 20, 3600, 'Length', 'Hardware Store - Rack C3', '{"grade": "VRV Hard Drawn"}'::jsonb),
  ('inv-12', 'GI-SHEET-24G', 'JSW Galvanized Iron (GI) Ducting Sheet 24 Gauge (120 GSM Zinc)', 'Ducting & Air Dist', 450, 100, 1850, 'Sheet', 'Metal Yard - Bay D1', '{"dimension": "8ft x 4ft", "zincCoatingGsm": 120}'::jsonb),
  ('inv-13', 'GI-SHEET-22G', 'JSW Galvanized Iron (GI) Ducting Sheet 22 Gauge (120 GSM Zinc)', 'Ducting & Air Dist', 320, 80, 2350, 'Sheet', 'Metal Yard - Bay D2', '{"dimension": "8ft x 4ft", "zincCoatingGsm": 120}'::jsonb),
  ('inv-14', 'ARMAFLEX-19MM', 'Armacell Class 1 Nitrile Rubber Insulation Sheet 19mm Thick', 'Insulation', 210, 40, 1280, 'Sqm', 'Insulation Depot - Rack E1', '{"fireRating": "Class 1", "densityKgM3": 55}'::jsonb),
  ('inv-15', 'ARMAFLEX-13MM-TUBE', 'Armaflex Nitrile Rubber Pipe Insulation 13mm Thk x 3/4" ID', 'Insulation', 350, 60, 220, 'Meter', 'Insulation Depot - Rack E2', '{"uvResistant": true}'::jsonb),
  ('inv-16', 'FIRE-DAMPER-UL', 'Caryaire Motorized Fire & Smoke Damper 600x450mm with Belimo Actuator', 'Valves & Dampers', 28, 6, 14500, 'Nos', 'Dampers & Grilles - Rack F1', '{"ratingHours": 2, "actuatorVoltage": "230V AC"}'::jsonb),
  ('inv-17', 'VAV-BOX-800CFM', 'Titus Single Duct Pressure Independent VAV Box 800 CFM with DDC', 'Valves & Dampers', 22, 5, 18200, 'Nos', 'Dampers & Grilles - Rack F2', '{"flowController": "BACnet MS/TP"}'::jsonb),
  ('inv-18', 'SUPPLY-DIFFUSER-4WAY', 'Airflow Aluminum 4-Way Supply Air Diffuser 600x600mm with OBD', 'Ducting & Air Dist', 180, 35, 1650, 'Nos', 'Dampers & Grilles - Rack F3', '{"material": "Extruded Aluminum", "powderCoated": "Pure White RAL9010"}'::jsonb),
  ('inv-19', 'R410A-GAS-45KG', 'Honeywell Genetron R410A Eco-Refrigerant Gas Cylinder 45 Kg', 'Refrigerants & Oils', 16, 4, 28500, 'Cylinder', 'Hazardous Storage Bay HZ1', '{"purity": "99.9%", "safetyClass": "A1 Non-Toxic"}'::jsonb),
  ('inv-20', 'REFNET-JOINTS-SET', 'Daikin VRV Refnet Y-Joint Branch Piping Header Set (KHRQ22M20T)', 'Copper & Piping', 75, 15, 3400, 'Set', 'Hardware Store - Rack C4', '{"maxPressureBar": 48}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  unit_cost = EXCLUDED.unit_cost,
  data = EXCLUDED.data,
  updated_at = now();

-- 2. SEED LEADS (Covering all stages, HVAC systems, and deal values)
INSERT INTO public.leads (id, lead_number, client_name, company_name, phone, email, project_address, city, building_type, hvac_type, estimated_capacity_tr, estimated_value, source, status, priority, assigned_to, assigned_to_name, notes, data)
VALUES
  (
    'lead-uat-01',
    'LEAD-2026-0081',
    'Rajesh Sharma (Director - Real Estate & Projects)',
    'Nexus Tower Infotech Park',
    '+91 98201 44552',
    'rajesh.sharma@nexustower.com',
    'Nexus Cyber City, Block B, BKC Complex',
    'Mumbai',
    'Commercial Office',
    'VRV / VRF System',
    280,
    14500000,
    'HVAC Consultant',
    'Awarded',
    'High',
    'rep-1',
    'Amit Verma (Lead HVAC Project Manager)',
    'Contract finalized for 7-floor corporate fitout with Daikin VRV X7 systems and smart BMS control.',
    '{"consultant": "AECOM MEP Services", "expectedHandoverDate": "2026-11-30", "floorsCount": 7, "attachments": [{"id": "att-1", "name": "Nexus_Tower_HVAC_Tender_Specs_Rev2.pdf", "size": 3421500, "type": "application/pdf", "url": "https://as2hwz72.us-east.insforge.app/storage/v1/object/public/attachments/Nexus_Tower_HVAC_Tender_Specs_Rev2.pdf", "uploadedAt": "2026-09-08T10:15:00Z"}]}'::jsonb
  ),
  (
    'lead-uat-02',
    'LEAD-2026-0082',
    'Dr. Sunita Deshmukh (VP Operations)',
    'Biogenix Life Sciences Ltd',
    '+91 98112 33441',
    'sunita.d@biogenixpharma.in',
    'Plot 45-B, Biotech SEZ, Hinjawadi Phase 2',
    'Pune',
    'Pharmaceutical / Lab',
    'Cleanroom AHU & Chiller System',
    160,
    21500000,
    'Consultant',
    'Negotiation',
    'High',
    'rep-2',
    'Sneha Kulkarni (Senior HVAC Engineer)',
    'Requires ISO Class 7 Cleanroom HVAC validation with differential pressure cascading and HEPA Terminal Filters.',
    '{"cleanroomClass": "ISO-7", "temperatureTolerance": "+/- 1 Deg C", "rhRange": "45-55%", "attachments": []}'::jsonb
  ),
  (
    'lead-uat-03',
    'LEAD-2026-0083',
    'Vikramaditya Oberoi (Managing Director)',
    'Oberoi Horizon Luxury Residences',
    '+91 99203 88776',
    'projects@oberoiholdings.in',
    'Worli Sea Face Boulevard, Tower A & B',
    'Mumbai',
    'Luxury Residential',
    'VRV / VRF System',
    85,
    6200000,
    'Architect',
    'Quote Sent',
    'Medium',
    'rep-1',
    'Amit Verma (Lead HVAC Project Manager)',
    'Pre-commissioned duct design for duplex penthouses. Low acoustic decibel requirement (NC 25).',
    '{"acousticNC": 25, "architect": "Hafeez Contractor Studio", "attachments": []}'::jsonb
  ),
  (
    'lead-uat-04',
    'LEAD-2026-0084',
    'Dr. K. S. Nair (Medical Superintendent)',
    'Fortis Super Specialty Healthcare',
    '+91 98401 22998',
    'projects.mumbai@fortiscare.com',
    'Eastern Express Highway, Mulund West',
    'Mumbai',
    'Hospital & Healthcare',
    'Chiller Plant with Precision AHU',
    350,
    38000000,
    'Trade Expo',
    'Site Survey Completed',
    'High',
    'rep-3',
    'Rohan Nair (Technical MEP Consultant)',
    'Complete HVAC overhaul for 8 Operation Theaters (Laminar flow) and 60-bed ICU block with 100% standby chiller.',
    '{"otCount": 8, "icuBeds": 60, "standbyChillerRequired": true, "attachments": []}'::jsonb
  ),
  (
    'lead-uat-05',
    'LEAD-2026-0085',
    'Anil Mehra (COO - Supply Chain)',
    'SwiftLogix Mega Cold Chain Hub',
    '+91 97110 55663',
    'anil.mehra@swiftlogix.com',
    'JNPT Port Logistics Corridor, Uran',
    'Navi Mumbai',
    'Industrial & Warehouse',
    'Ventilation & Industrial Exhaust',
    120,
    8900000,
    'Direct Sales',
    'New',
    'Medium',
    'rep-2',
    'Sneha Kulkarni (Senior HVAC Engineer)',
    'Heavy industrial ventilation with roof-mounted jet fans, smoke spill extraction, and evaporative cooling pads.',
    '{"buildingHeightMeters": 14, "airChangesPerHour": 12, "attachments": []}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  estimated_value = EXCLUDED.estimated_value,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 3. SEED QUOTES (Techno-Commercial Proposals with full BOQ itemization)
INSERT INTO public.quotes (id, quote_number, lead_id, client_name, company_name, project_title, site_address, prepared_by, date, valid_until, subtotal, discount_pct, discount_amount, tax_pct, tax_amount, total_amount, total_cost, gross_margin_amount, gross_margin_pct, payment_terms, warranty_terms, delivery_timeline, status, data)
VALUES
  (
    'quote-uat-01',
    'QT-2026-0045',
    'lead-uat-01',
    'Rajesh Sharma',
    'Nexus Tower Infotech Park',
    'Daikin VRV X7 Air Conditioning Fitout - 7 Floors (280 TR)',
    'Nexus Cyber City, Block B, BKC Complex, Mumbai',
    'Amit Verma (Lead HVAC Project Manager)',
    '2026-09-01',
    '2026-10-01',
    12850000,
    4.5,
    578250,
    18,
    2208915,
    14480665,
    10280000,
    1991750,
    16.23,
    '20% Advance with PO, 60% Pro-rata on Delivery, 15% on Installation & Testing, 5% against Performance Bank Guarantee.',
    '12 Months Comprehensive on Equipment & Installation, 60 Months on Inverter Compressors.',
    '8 to 10 Weeks from confirmed drawing approval and site handover.',
    'Approved',
    '{"boqItems": [{"id": "b1", "description": "Daikin VRV X7 Outdoor Units (16HP & 12HP Modules) Total 280 TR", "qty": 18, "unit": "Set", "unitRate": 265000, "total": 4770000, "cost": 3800000}, {"id": "b2", "description": "Daikin Inverter Round Flow 4-Way Cassette IDUs (2TR & 3TR)", "qty": 85, "unit": "Nos", "unitRate": 48000, "total": 4080000, "cost": 3300000}, {"id": "b3", "description": "Mandev VRV Grade Hard Drawn Copper Piping with Armacell Class 1 Insulation", "qty": 2400, "unit": "Meter", "unitRate": 950, "total": 2280000, "cost": 1750000}, {"id": "b4", "description": "Factory Fabricated GI Ducting & Air Terminal Diffusers with Motorized Dampers", "qty": 1200, "unit": "Sqm", "unitRate": 1100, "total": 1320000, "cost": 1050000}, {"id": "b5", "description": "Installation, Nitrogen Pressure Testing @ 41.5 Bar, Vacuuming & Commissioning", "qty": 1, "unit": "Lot", "unitRate": 400000, "total": 400000, "cost": 380000}]}'::jsonb
  ),
  (
    'quote-uat-02',
    'QT-2026-0046',
    'lead-uat-02',
    'Dr. Sunita Deshmukh',
    'Biogenix Life Sciences Ltd',
    'ISO Class 7 Cleanroom AHU & Chiller System (160 TR)',
    'Plot 45-B, Biotech SEZ, Hinjawadi Phase 2, Pune',
    'Sneha Kulkarni (Senior HVAC Engineer)',
    '2026-09-04',
    '2026-10-04',
    18900000,
    3.0,
    567000,
    18,
    3299940,
    21632940,
    14800000,
    3533000,
    19.27,
    '30% Advance with PO, 50% on Equipment Dispatch, 10% on Cleanroom Validation DQ/IQ/OQ, 10% after 60 days.',
    '24 Months Comprehensive Warranty including quarterly ISO 14644-1 particle count certification.',
    '12 to 14 Weeks.',
    'Draft',
    '{"boqItems": [{"id": "b1", "description": "Air-Cooled Screw Chiller with Dual VFD Compressors (160 TR)", "qty": 1, "unit": "Set", "unitRate": 4800000, "total": 4800000, "cost": 3900000}, {"id": "b2", "description": "Double Skin Cleanroom AHUs with 3-Stage Filtration (EU4 + EU9 + Terminal H14 HEPA)", "qty": 4, "unit": "Nos", "unitRate": 1450000, "total": 5800000, "cost": 4500000}, {"id": "b3", "description": "Stainless Steel SS304 Cleanroom Grade Ductwork & Laminar Flow Canopies", "qty": 850, "unit": "Sqm", "unitRate": 3800, "total": 3230000, "cost": 2600000}]}'::jsonb
  ),
  (
    'quote-uat-03',
    'QT-2026-0047',
    'lead-uat-03',
    'Vikramaditya Oberoi',
    'Oberoi Horizon Luxury Residences',
    'VRF Air Conditioning with Acoustic Attenuation (85 TR)',
    'Worli Sea Face Boulevard, Tower A & B, Mumbai',
    'Amit Verma (Lead HVAC Project Manager)',
    '2026-09-06',
    '2026-10-06',
    5600000,
    0,
    0,
    18,
    1008000,
    6608000,
    4350000,
    1250000,
    22.32,
    '25% Advance, 50% on Piping & Equipment Delivery, 25% on Handover.',
    '18 Months Comprehensive On-Site Warranty.',
    '6 to 8 Weeks.',
    'Sent',
    '{"boqItems": [{"id": "b1", "description": "Mitsubishi City Multi VRF Outdoor Units (85 TR Total)", "qty": 5, "unit": "Set", "unitRate": 360000, "total": 1800000, "cost": 1400000}, {"id": "b2", "description": "Slim Duct Indoor Units with Acoustic Silencer Boxes (NC 25)", "qty": 24, "unit": "Nos", "unitRate": 65000, "total": 1560000, "cost": 1200000}]}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  total_amount = EXCLUDED.total_amount,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 4. SEED PROJECTS (Active execution, progress milestones, and project financials)
INSERT INTO public.projects (id, project_number, title, client_name, company_name, status, start_date, completion_date, contract_value, total_budget, invoiced_amount, collected_amount, data)
VALUES
  (
    'proj-uat-01',
    'PRJ-2026-012',
    'Nexus Tower Infotech Park - 7-Floor VRV HVAC Fitout',
    'Rajesh Sharma',
    'Nexus Tower Infotech Park',
    'In Progress',
    '2026-09-05',
    '2026-11-30',
    14480665,
    10500000,
    2896133,
    2896133,
    '{"progressPct": 35, "projectManager": "Amit Verma", "leadId": "lead-uat-01", "quoteId": "quote-uat-01", "phases": [{"name": "Site Survey & Core Cut Approvals", "status": "Completed", "progress": 100}, {"name": "Primary Refrigerant & Drain Piping", "status": "In Progress", "progress": 65}, {"name": "GI Ducting & Acoustic Lining", "status": "In Progress", "progress": 40}, {"name": "Outdoor & Indoor Unit Mounting", "status": "Pending", "progress": 0}, {"name": "Pressure Testing & Gas Charging", "status": "Pending", "progress": 0}, {"name": "Testing, Balancing & Commissioning (TAB)", "status": "Pending", "progress": 0}]}'::jsonb
  ),
  (
    'proj-uat-02',
    'PRJ-2026-013',
    'Godrej One Corporate Headquarters - Chiller Plant Modernization',
    'Siddharth Godrej',
    'Godrej Properties Ltd',
    'Execution',
    '2026-08-10',
    '2026-10-25',
    28500000,
    21800000,
    14250000,
    12000000,
    '{"progressPct": 70, "projectManager": "Rohan Nair", "phases": [{"name": "Old Chiller Decommissioning", "status": "Completed", "progress": 100}, {"name": "Condenser Water Header Piping", "status": "Completed", "progress": 100}, {"name": "Trane 240 TR Chiller Rigging & Placement", "status": "Completed", "progress": 100}, {"name": "BMS Sensor Integration & Balancing", "status": "In Progress", "progress": 55}]}'::jsonb
  ),
  (
    'proj-uat-03',
    'PRJ-2026-014',
    'Sterling Biotech Cleanroom HVAC Phase 1',
    'Kiran Mazumdar',
    'Sterling Biopharma Ltd',
    'Commissioning',
    '2026-07-01',
    '2026-09-20',
    18200000,
    13900000,
    16380000,
    14500000,
    '{"progressPct": 92, "projectManager": "Sneha Kulkarni", "phases": [{"name": "HEPA Filter Integrity Testing", "status": "Completed", "progress": 100}, {"name": "Airflow Velocity & Uniformity Test", "status": "Completed", "progress": 100}, {"name": "Differential Pressure Cascading", "status": "In Progress", "progress": 85}, {"name": "Final Third-Party ISO 14644 Audit", "status": "Pending", "progress": 0}]}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  contract_value = EXCLUDED.contract_value,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 5. SEED PURCHASE REQUISITIONS (PR)
INSERT INTO public.purchase_requisitions (id, pr_number, project_id, requested_by, status, total_estimated_cost, date, data)
VALUES
  (
    'pr-uat-01',
    'PR-2026-0088',
    'proj-uat-01',
    'Amit Verma (Lead HVAC Project Manager)',
    'Approved',
    845000,
    '2026-09-06',
    '{"projectTitle": "Nexus Tower Infotech Park - 7-Floor VRV HVAC Fitout", "urgency": "High", "items": [{"sku": "COPPER-PIPE-1-2IN", "name": "Mandev Copper Tube 1/2 OD 20 SWG", "qty": 40, "unit": "Coil", "estRate": 4850, "total": 194000}, {"sku": "COPPER-PIPE-3-4IN", "name": "Mandev Copper Tube 3/4 OD 18 SWG", "qty": 35, "unit": "Coil", "estRate": 6950, "total": 243250}, {"sku": "ARMAFLEX-19MM", "name": "Armacell Class 1 Nitrile Rubber Sheet 19mm", "qty": 120, "unit": "Sqm", "estRate": 1280, "total": 153600}, {"sku": "GI-SHEET-24G", "name": "JSW GI Sheet 24 Gauge 120 GSM", "qty": 140, "unit": "Sheet", "estRate": 1850, "total": 259000}], "approvedBy": "COO / Operations Head"}'::jsonb
  ),
  (
    'pr-uat-02',
    'PR-2026-0089',
    'proj-uat-02',
    'Rohan Nair (Technical MEP Consultant)',
    'Pending Approval',
    485000,
    '2026-09-08',
    '{"projectTitle": "Godrej One Headquarters - Chiller Modernization", "urgency": "Medium", "items": [{"sku": "FIRE-DAMPER-UL", "name": "Caryaire Motorized Fire & Smoke Damper with Belimo Actuator", "qty": 12, "unit": "Nos", "estRate": 14500, "total": 174000}, {"sku": "VAV-BOX-800CFM", "name": "Titus VAV Box 800 CFM with DDC", "qty": 8, "unit": "Nos", "estRate": 18200, "total": 145600}, {"sku": "SUPPLY-DIFFUSER-4WAY", "name": "Airflow Aluminum 4-Way Diffuser 600x600mm", "qty": 100, "unit": "Nos", "estRate": 1650, "total": 165000}]}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  total_estimated_cost = EXCLUDED.total_estimated_cost,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 6. SEED PURCHASE ORDERS (PO)
INSERT INTO public.purchase_orders (id, po_number, pr_id, vendor_id, vendor_name, status, total_amount, date, data)
VALUES
  (
    'po-uat-01',
    'PO-2026-0062',
    'pr-uat-01',
    'ven-mandev-01',
    'Mandev Tubes Private Limited',
    'Issued',
    437250,
    '2026-09-07',
    '{"gstNo": "27AAACM1234F1Z5", "deliveryAddress": "Nexus Tower Site Store, BKC, Mumbai", "paymentTerms": "30 Days Credit", "items": [{"description": "Mandev Copper Tube 1/2 OD 20 SWG", "qty": 40, "unit": "Coil", "rate": 4850, "total": 194000}, {"description": "Mandev Copper Tube 3/4 OD 18 SWG", "qty": 35, "unit": "Coil", "rate": 6950, "total": 243250}], "expectedDeliveryDate": "2026-09-15"}'::jsonb
  ),
  (
    'po-uat-02',
    'PO-2026-0063',
    'pr-uat-01',
    'ven-jsw-02',
    'JSW Steel & Coated Products Ltd',
    'Delivered',
    259000,
    '2026-09-07',
    '{"gstNo": "27AAACJ5678G1Z9", "deliveryAddress": "Nexus Tower Site Store, BKC, Mumbai", "paymentTerms": "Immediate on Delivery", "items": [{"description": "JSW GI Sheet 24 Gauge 120 GSM", "qty": 140, "unit": "Sheet", "rate": 1850, "total": 259000}], "grnNumber": "GRN-2026-0041", "receivedDate": "2026-09-09"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  total_amount = EXCLUDED.total_amount,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 7. SEED WORK ORDERS (Installation, Testing & Site Tasks)
INSERT INTO public.work_orders (id, wo_number, project_id, title, status, priority, assigned_to, scheduled_date, data)
VALUES
  (
    'wo-uat-01',
    'WO-2026-0031',
    'proj-uat-01',
    'Floor 3 & 4 VRV Refrigerant Piping Nitrogen Pressure Hold (41.5 Bar for 24h)',
    'In Progress',
    'High',
    'Prakash Shinde (Senior Site Technician)',
    '2026-09-10',
    '{"checklist": ["Check all brazed joints with soap bubble test", "Pressurize with dry nitrogen to 41.5 bar", "Log temperature and pressure gauges at T=0 and T=24h", "Verify zero drop in pressure after temperature normalization"], "projectTitle": "Nexus Tower Infotech Park"}'::jsonb
  ),
  (
    'wo-uat-02',
    'WO-2026-0032',
    'proj-uat-01',
    'Floor 5 GI Duct Erection & Acoustic Lining Inspection',
    'Scheduled',
    'Medium',
    'Ganesh Pawar (Ducting Foreman)',
    '2026-09-12',
    '{"checklist": ["Inspect duct hanger supports at 1.5m intervals", "Verify 19mm nitrile rubber insulation vapor seal", "Install acoustic insulation inside plenum boxes near IDUs"], "projectTitle": "Nexus Tower Infotech Park"}'::jsonb
  ),
  (
    'wo-uat-03',
    'WO-2026-0033',
    'proj-uat-03',
    'Cleanroom ISO-7 HEPA Filter DOP / PAO Aerosol Leakage Test',
    'Completed',
    'High',
    'Dr. K. Swaminathan (Validation Engineer)',
    '2026-09-08',
    '{"checklist": ["Calibrate photometer / aerosol generator", "Scan HEPA filter media and gasket frame at 15mm distance", "Confirm penetration is less than 0.01% (Class H14 compliant)", "Sign off ISO 14644-3 certification sheet"], "projectTitle": "Sterling Biotech Cleanroom"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 8. SEED EXPENSES (Site logistics, cranes, permits, petty cash)
INSERT INTO public.expenses (id, expense_number, project_id, category, amount, date, status, payment_method, notes, data)
VALUES
  (
    'exp-uat-01',
    'EXP-2026-0071',
    'proj-uat-01',
    'Site Logistics & Crane Rental',
    65000,
    '2026-09-06',
    'Approved',
    'NEFT Transfer',
    '50-Ton Mobile Crane rental for lifting 18 Daikin VRV outdoor units to 8th-floor terrace plant room.',
    '{"vendor": "Bhiwandi Heavy Lifters & Crane Services", "invoiceNo": "BLC-9821"}'::jsonb
  ),
  (
    'exp-uat-02',
    'EXP-2026-0072',
    'proj-uat-01',
    'Consumables & Gas Refilling',
    38500,
    '2026-09-07',
    'Approved',
    'Company Card',
    'Oxygen/Acetylene brazing gas kits, silver brazing alloy rods (45% silver), and dry nitrogen cylinders.',
    '{"vendor": "Industrial Gas & Welding Supplies", "invoiceNo": "IGW-4412"}'::jsonb
  ),
  (
    'exp-uat-03',
    'EXP-2026-0073',
    'proj-uat-03',
    'Third-Party Validation & Certification',
    120000,
    '2026-09-08',
    'Approved',
    'NEFT Transfer',
    'NABL Accredited Cleanroom Airflow, Velocity & Airborne Particle Count Certification.',
    '{"vendor": "TUV SUD South Asia Validation Lab", "certificateNo": "TUV-CR-8891"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  amount = EXCLUDED.amount,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 9. SEED PAYMENTS (Client milestone receipts, mobilization advances, retention)
INSERT INTO public.payments (id, invoice_number, project_id, client_name, amount, status, payment_date, due_date, data)
VALUES
  (
    'pay-uat-01',
    'INV-2026-0038',
    'proj-uat-01',
    'Nexus Tower Infotech Park',
    2896133,
    'Received',
    '2026-09-05',
    '2026-09-05',
    '{"type": "Mobilization Advance (20%)", "projectTitle": "Nexus Tower VRV Fitout", "utrNumber": "HDFCR202609059881234", "bankName": "HDFC Bank Corporate"}'::jsonb
  ),
  (
    'pay-uat-02',
    'INV-2026-0035',
    'proj-uat-02',
    'Godrej Properties Ltd',
    12000000,
    'Received',
    '2026-08-25',
    '2026-08-20',
    '{"type": "Running Account Bill #2", "projectTitle": "Godrej One Headquarters Chiller Modernization", "utrNumber": "ICICIR202608257712390", "bankName": "ICICI Bank"}'::jsonb
  ),
  (
    'pay-uat-03',
    'INV-2026-0039',
    'proj-uat-02',
    'Godrej Properties Ltd',
    2250000,
    'Pending',
    NULL,
    '2026-09-25',
    '{"type": "Running Account Bill #3 (BMS & Commissioning)", "projectTitle": "Godrej One Headquarters Chiller Modernization"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  amount = EXCLUDED.amount,
  status = EXCLUDED.status,
  data = EXCLUDED.data,
  updated_at = now();

-- 10. SEED AUDIT LOGS (Compliance and transaction trail)
INSERT INTO public.audit_logs (id, timestamp, user_name, user_role, action, module, details, ip_address)
VALUES
  ('aud-uat-01', '2026-09-05T09:30:00Z', 'Amit Verma', 'Project Manager', 'CREATE', 'LEAD', 'Created new HVAC Lead LEAD-2026-0081 for Nexus Tower Infotech Park (280 TR)', '192.168.1.45'),
  ('aud-uat-02', '2026-09-05T14:15:00Z', 'Amit Verma', 'Project Manager', 'CREATE', 'QUOTE', 'Generated techno-commercial quotation QT-2026-0045 with 5 BOQ item groups totaling ₹14,480,665', '192.168.1.45'),
  ('aud-uat-03', '2026-09-05T17:45:00Z', 'Rajesh Sharma', 'Client Director', 'APPROVE', 'QUOTE', 'Client approved Quotation QT-2026-0045. Project converted to Active Execution PRJ-2026-012', '49.36.128.90'),
  ('aud-uat-04', '2026-09-06T10:00:00Z', 'Sneha Kulkarni', 'Senior HVAC Engineer', 'CREATE', 'PR', 'Raised PR-2026-0088 for Mandev VRV Copper Piping, Armacell Insulation and JSW GI sheets (₹845,000)', '192.168.1.52'),
  ('aud-uat-05', '2026-09-07T11:20:00Z', 'Purchase Officer', 'Procurement', 'CREATE', 'PO', 'Issued Purchase Order PO-2026-0062 to Mandev Tubes Pvt Ltd for ₹437,250', '192.168.1.20'),
  ('aud-uat-06', '2026-09-09T08:00:00Z', 'Prakash Shinde', 'Site Technician', 'CREATE', 'WORK_ORDER', 'Scheduled 24h Nitrogen pressure hold test at 41.5 bar on 3rd & 4th floor VRV headers', '192.168.1.66')
ON CONFLICT (id) DO NOTHING;
