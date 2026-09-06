import { ClientMaster, CostCenterMaster, TaxSlabMaster, PaymentTermMaster } from '../types';

export const INITIAL_CLIENTS: ClientMaster[] = [
  {
    id: 'cli-001',
    clientCode: 'CLI-001',
    companyName: 'Nexus Tech Park Developers Pvt Ltd',
    contactPerson: 'Mr. Arvind Swaminathan',
    designation: 'VP - Infrastructure & MEP',
    email: 'arvind.s@nexustechpark.com',
    phone: '+91 98111 22334',
    altPhone: '+91 22 6677 8899',
    billingAddress: 'Tower A, 8th Floor, Nexus IT Campus, Mindspace, Airoli, Navi Mumbai, MH 400708',
    siteAddress: 'Nexus Infinity Tech Park, Sector 4, Mahape, Navi Mumbai',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pincode: '400708',
    gstin: '27AABCN1234M1Z5',
    pan: 'AABCN1234M',
    creditLimit: 25000000,
    creditPeriodDays: 45,
    paymentTerms: '30% Advance, 40% Delivery, 20% Erection, 10% Testing & Handover',
    industry: 'Commercial Real Estate / IT Parks',
    status: 'active',
    notes: 'Premium Tier-1 client. All MEP contractor billing requires dual sign-off from Project Director.',
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'cli-002',
    clientCode: 'CLI-002',
    companyName: 'Max Super Speciality Hospitals',
    contactPerson: 'Dr. Rameshwaram Iyer',
    designation: 'Director - Hospital Engineering & Biomedical',
    email: 'r.iyer@maxhealthcare.in',
    phone: '+91 98222 33445',
    billingAddress: 'Corporate Office, 14th Floor, Max House, Okhla Phase III, New Delhi 110020',
    siteAddress: 'Max Oncology & Cardiac Wing, Sector 62, Gurgaon, Haryana',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122001',
    gstin: '06AABCM5678P1Z8',
    pan: 'AABCM5678P',
    creditLimit: 35000000,
    creditPeriodDays: 30,
    paymentTerms: 'Milestone-based Progressive Billing against Architect & HVAC Consultant Certification',
    industry: 'Healthcare / Hospital Facilities',
    status: 'active',
    notes: 'Requires NABH compliant cleanroom AHU validation, HEPA filtration certs, and 99.99% positive pressure testing.',
    createdAt: '2026-01-20T11:30:00Z'
  },
  {
    id: 'cli-003',
    clientCode: 'CLI-003',
    companyName: 'Serum Biosolutions India Ltd',
    contactPerson: 'Ms. Sunita Deshpande',
    designation: 'General Manager - Cleanroom Facilities',
    email: 'sunita.d@serumbio.com',
    phone: '+91 98333 44556',
    billingAddress: 'Plot 45, Hadapsar Biotech Park, Pune, Maharashtra 411028',
    siteAddress: 'Vaccine Fill-Finish Facility, Hinjewadi Phase 2, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    gstin: '27AABCS9988Q1Z2',
    pan: 'AABCS9988Q',
    creditLimit: 50000000,
    creditPeriodDays: 30,
    paymentTerms: '20% Advance, 50% on Factory Despatch, 20% on Site Erection, 10% on DQ/IQ/OQ Validation',
    industry: 'Pharmaceuticals & Cleanrooms',
    status: 'active',
    notes: 'Requires US-FDA & WHO GMP Class 100/10,000 cleanroom air balance reports.',
    createdAt: '2026-02-01T09:00:00Z'
  },
  {
    id: 'cli-004',
    clientCode: 'CLI-004',
    companyName: 'Marriott Luxury Hotel & Spa',
    contactPerson: 'Mr. Vikram Oberoi',
    designation: 'Chief Engineer',
    email: 'vikram.oberoi@marriottmumbai.com',
    phone: '+91 98444 55667',
    billingAddress: 'Juhu Tara Road, Juhu Beach, Mumbai, Maharashtra 400049',
    siteAddress: 'Marriott Luxury Hotel & Suites, Juhu, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400049',
    gstin: '27AABCM7766K1Z9',
    pan: 'AABCM7766K',
    creditLimit: 18000000,
    creditPeriodDays: 30,
    paymentTerms: '30% Advance, 40% On Delivery, 30% on Commissioning',
    industry: 'Hospitality & Luxury Hotels',
    status: 'active',
    notes: 'Low acoustic decibel limit (< 35 dBA NC curves) mandated in guest suites.',
    createdAt: '2026-02-10T14:00:00Z'
  }
];

export const INITIAL_COST_CENTERS: CostCenterMaster[] = [
  {
    id: 'cc-001',
    code: 'CC-HVAC-VRF',
    name: 'Commercial VRF & Ductable Projects',
    department: 'Projects & Contracting',
    location: 'Mumbai HQ & Western Region',
    managerName: 'Shivender Kumar',
    budgetLimit: 80000000,
    active: true
  },
  {
    id: 'cc-002',
    code: 'CC-HVAC-CHILL',
    name: 'Industrial Chillers & Heavy Plant',
    department: 'Engineering & Plants',
    location: 'All India Projects',
    managerName: 'Priya Mukherjee',
    budgetLimit: 120000000,
    active: true
  },
  {
    id: 'cc-003',
    code: 'CC-CLEANROOM',
    name: 'Pharma Cleanroom AHU & Validation',
    department: 'Specialized Healthcare Projects',
    location: 'Pune / Hyderabad Biotech Hubs',
    managerName: 'Rakesh Mehra',
    budgetLimit: 50000000,
    active: true
  },
  {
    id: 'cc-004',
    code: 'CC-SERVICE-AMC',
    name: 'HVAC Maintenance & Field AMC',
    department: 'Service Operations',
    location: 'Pan India Service Centers',
    managerName: 'Vikram Sundaram',
    budgetLimit: 25000000,
    active: true
  }
];

export const INITIAL_TAX_SLABS: TaxSlabMaster[] = [
  {
    id: 'tax-18',
    name: 'GST 18% (Standard HVAC Contracting & Equipment)',
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    totalGstRate: 18,
    hsnSacCode: '995461',
    appliesTo: 'Turnkey HVAC Works Contract, Copper Piping, AHU & Duct Installation',
    active: true
  },
  {
    id: 'tax-28',
    name: 'GST 28% (Air Conditioners & Compressors Luxury Bracket)',
    cgstRate: 14,
    sgstRate: 14,
    igstRate: 28,
    totalGstRate: 28,
    hsnSacCode: '8415',
    appliesTo: 'Direct supply of Split ACs, VRV Outdoor Units, Packaged Units',
    active: true
  },
  {
    id: 'tax-12',
    name: 'GST 12% (Government & Public Health Works)',
    cgstRate: 6,
    sgstRate: 6,
    igstRate: 12,
    totalGstRate: 12,
    hsnSacCode: '995462',
    appliesTo: 'Hospital & Healthcare Infrastructure Work Contracts',
    active: true
  },
  {
    id: 'tax-5',
    name: 'GST 5% (Specific Capital Equipment)',
    cgstRate: 2.5,
    sgstRate: 2.5,
    igstRate: 5,
    totalGstRate: 5,
    hsnSacCode: '8418',
    appliesTo: 'Cold Chain & Agri Storage Chillers',
    active: true
  }
];

export const INITIAL_PAYMENT_TERMS: PaymentTermMaster[] = [
  {
    id: 'pt-001',
    code: 'TURNKEY-30-40-20-10',
    name: 'Turnkey HVAC Standard (30-40-20-10)',
    days: 45,
    description: '30% Advance with PO, 40% on delivery at site, 20% on physical installation, 10% on commissioning & testing sign-off.',
    isDefault: true
  },
  {
    id: 'pt-002',
    code: 'NET-30',
    name: 'Net 30 Days Credit',
    days: 30,
    description: 'Payment in full within 30 days of tax invoice generation.',
    isDefault: false
  },
  {
    id: 'pt-003',
    code: 'ADVANCE-100',
    name: '100% Advance Payment',
    days: 0,
    description: 'Full payment against Proforma Invoice prior to dispatch from warehouse or OEM factory.',
    isDefault: false
  },
  {
    id: 'pt-004',
    code: 'PROGRESSIVE-RA',
    name: 'Monthly Running Account (RA) Bills with 5% Retention',
    days: 60,
    description: 'Progressive monthly billing as per certified site joint measurement sheet with 5% retention for 12 months DLP.',
    isDefault: false
  }
];
