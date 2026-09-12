import {
  JobRequisition,
  JobCandidate,
  Employee,
  AttendanceRecord,
  TimesheetEntry,
  LeaveApplication,
  CompanyHoliday,
  PayrollMonth,
  ResignationRecord,
  BiometricDevice,
  AttendancePunchLog
} from '../types';

export const INITIAL_JOB_REQUISITIONS: JobRequisition[] = [
  {
    id: 'req-001',
    reqNumber: 'HR-REQ-2026-001',
    jobTitle: 'Senior HVAC Project Manager (Turnkey Commercial & VRV)',
    department: 'Projects & Operations',
    location: 'Mumbai & Pune (Site-Based)',
    experienceReq: '7 - 12 Years in MEP / HVAC Turnkey Contracting',
    employmentType: 'Full-Time',
    salaryRange: '₹14,00,000 - ₹20,00,000 PA',
    openPositions: 2,
    filledPositions: 1,
    hiringManager: 'Shivender Kumar (Managing Director)',
    status: 'Active / Hiring',
    kraList: [
      {
        id: 'kra-1',
        title: 'Project Timeline & On-Time Commissioning',
        weightagePct: 35,
        description: 'Ensure 100% adherence to project critical path (Gantt milestones), pipe brazing pressure tests, duct erection, and final handover.',
        kpiMetric: 'Zero project delay days beyond approved baseline schedule.'
      },
      {
        id: 'kra-2',
        title: 'Gross Project Profit Margin Safeguarding',
        weightagePct: 25,
        description: 'Control site material consumption against BOQ allocations; prevent copper and insulation scrap wastage exceeding 2.5%.',
        kpiMetric: 'Deliver minimum 22% gross project margin at handover.'
      },
      {
        id: 'kra-3',
        title: 'Automated BOQ Shortage Resolution & PR Timeliness',
        weightagePct: 20,
        description: 'Cross-check warehouse inventory with site requirements 3 weeks ahead of erection; raise purchase requisitions proactively.',
        kpiMetric: 'Zero site downtime due to material stock-out.'
      },
      {
        id: 'kra-4',
        title: 'Client Joint Measurement & Milestone Bill Clearance',
        weightagePct: 20,
        description: 'Obtain signed joint measurement sheets and consultant completion certificates within 48 hours of stage completion.',
        kpiMetric: '100% stage billing certification within 5 working days.'
      }
    ],
    responsibilities: [
      'Lead end-to-end execution of multi-crore commercial VRF, Water Cooled Chiller, and Cleanroom HVAC installations.',
      'Manage site engineers, MEP subcontractors, duct fabrication teams, and commissioning crews.',
      'Coordinate with client architects, PMC consultants, and electrical contractors for seamless site progress.',
      'Enforce nitrogen leak testing (550 PSI for 48 hrs) and vacuum dehydration (< 500 microns) QA/QC protocols.'
    ],
    requirements: [
      'B.Tech / B.E. in Mechanical Engineering.',
      'Proven track record in executing Tier-1 commercial IT parks, hospitals, or high-rise HVAC contracts.',
      'Hands-on expertise with Daikin, Voltas, Blue Star, Trane, Carrier VRF & Chiller piping and controls.',
      'Strong leadership, subcontractor vendor negotiation, and client liaison skills.'
    ],
    certificationsPreferred: ['ISHRAE / ASHRAE Member', 'PMP Certification', 'Revit MEP / AutoCAD'],
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'req-002',
    reqNumber: 'HR-REQ-2026-002',
    jobTitle: 'HVAC Design & Heat Load Estimation Engineer',
    department: 'Engineering & Estimations',
    location: 'Mumbai HQ (MIDC Andheri)',
    experienceReq: '4 - 7 Years in HVAC Tendering & Heat Load Sizing',
    employmentType: 'Full-Time',
    salaryRange: '₹8,50,000 - ₹12,50,000 PA',
    openPositions: 1,
    filledPositions: 0,
    hiringManager: 'Priya Mukherjee (Chief MEP Estimator)',
    status: 'Active / Hiring',
    kraList: [
      {
        id: 'kra-5',
        title: 'Heat Load & Equipment Selection Precision',
        weightagePct: 35,
        description: 'Perform accurate HAP / Trace 700 heat load calculations; optimize CFM, TR sizing, and static pressure duct calculations.',
        kpiMetric: 'Accuracy within ±3% of consultant tender requirements.'
      },
      {
        id: 'kra-6',
        title: 'Tender Quotation Turnaround Time (TAT)',
        weightagePct: 35,
        description: 'Generate high-accuracy BOQ costing and multi-option quotation proposals within 48 hours of client site survey/RFP.',
        kpiMetric: '< 48 hours quotation turnaround for standard VRV proposals.'
      },
      {
        id: 'kra-7',
        title: 'Value Engineering & Margin Optimization',
        weightagePct: 30,
        description: 'Identify value engineering opportunities in duct route optimization and copper pipe sizing to give competitive pricing edge.',
        kpiMetric: 'Achieve > 30% tender win rate with healthy margins.'
      }
    ],
    responsibilities: [
      'Prepare comprehensive HVAC heat load analysis using Carrier HAP, ASHRAE fundamentals, and solar heat gain indices.',
      'Select VRF indoor/outdoor units, chillers, AHUs, FCUs, cooling towers, and circulation pumps.',
      'Draft detailed BOQ line items with current OEM pricing, labor charges, and statutory tax calculations.',
      'Assist sales team during technical presentations with client MEP consultants.'
    ],
    requirements: [
      'B.E. Mechanical / Diploma in MEP Engineering.',
      'Expert proficiency in Carrier HAP, AutoCAD, and Revit MEP.',
      'In-depth knowledge of SMACNA duct standards, ASHRAE 90.1, and NBC 2016 guidelines.'
    ],
    certificationsPreferred: ['Carrier HAP Certified Estimator', 'ISHRAE Certified Professional'],
    createdAt: '2026-08-15T11:30:00Z'
  },
  {
    id: 'req-003',
    reqNumber: 'HR-REQ-2026-003',
    jobTitle: 'HVAC Chiller & Commissioning Specialist',
    department: 'Service & Commissioning',
    location: 'Field Sites (Pan-India)',
    experienceReq: '5 - 9 Years in Centrifugal / Screw Chiller Commissioning',
    employmentType: 'Site-Based',
    salaryRange: '₹7,00,000 - ₹10,50,000 PA',
    openPositions: 2,
    filledPositions: 0,
    hiringManager: 'Vikram Sundaram (Field Operations)',
    status: 'Active / Hiring',
    kraList: [
      {
        id: 'kra-8',
        title: 'Chiller Startup & Water Balancing Quality',
        weightagePct: 40,
        description: 'Conduct primary/secondary chilled water balancing, flow meter calibration, oil charge analysis, and BMS integration.',
        kpiMetric: 'Zero chiller tripping during 72-hour continuous test run.'
      },
      {
        id: 'kra-9',
        title: 'First-Time-Right Commissioning Sign-off',
        weightagePct: 35,
        description: 'Obtain client technical representative signature on comprehensive Commissioning Test Reports (CTR) on first attempt.',
        kpiMetric: '> 95% first-time CTR pass rate.'
      },
      {
        id: 'kra-10',
        title: 'Safety Compliance & Refrigerant Recovery Protocols',
        weightagePct: 25,
        description: 'Strict enforcement of zero-venting refrigerant recovery, safety relief valves, and OSHA site compliance.',
        kpiMetric: '100% safety audit compliance score.'
      }
    ],
    responsibilities: [
      'Lead on-site startup, deep vacuum dehydration, refrigerant charging, and oil balancing for screw & magnetic bearing centrifugal chillers.',
      'Calibrate motorized 2-way/3-way modulating valves, VFD drives, and differential pressure sensors.',
      'Troubleshoot electrical microprocessor controllers, PLC alarms, and high-pressure head trips.',
      'Train client facility engineers on routine maintenance, daily logs, and emergency cutoff procedures.'
    ],
    requirements: [
      'Diploma in Mechanical / Refrigeration & Air Conditioning (RAC) or ITI RAC.',
      'Hands-on experience with Trane, York, Carrier, Daikin, or Blue Star industrial chillers.',
      'Strong diagnostic skills with digital manifold gauges, megohmmeters, and thermal imaging cameras.'
    ],
    certificationsPreferred: ['EPA 608 Universal Certification', 'BMS Modbus/BACnet Certified'],
    createdAt: '2026-08-20T09:00:00Z'
  }
];

export const INITIAL_CANDIDATES: JobCandidate[] = [
  {
    id: 'cand-001',
    reqId: 'req-001',
    jobTitle: 'Senior HVAC Project Manager (Turnkey Commercial & VRV)',
    name: 'Karthik Ramanathan',
    email: 'karthik.ram@gmail.com',
    phone: '+91 98201 77890',
    currentCompany: 'Sterling & Wilson MEP Contracting',
    experienceYears: 9.5,
    currentCtc: 1550000,
    expectedCtc: 1800000,
    stage: 'Offer Issued',
    interviewNotes: 'Exceptional track record in managing 1200 TR VRF project in Mumbai. Clear communicator with strong vendor network.',
    rating: 5,
    appliedDate: '2026-08-12'
  },
  {
    id: 'cand-002',
    reqId: 'req-001',
    jobTitle: 'Senior HVAC Project Manager (Turnkey Commercial & VRV)',
    name: 'Amitabh Sen',
    email: 'amitabh.sen@outlook.com',
    phone: '+91 98310 44552',
    currentCompany: 'Voltas Projects Ltd',
    experienceYears: 8,
    currentCtc: 1350000,
    expectedCtc: 1600000,
    stage: 'Technical Round',
    interviewNotes: 'Strong site technical skills; evaluating commercial negotiation depth in next round.',
    rating: 4,
    appliedDate: '2026-08-18'
  },
  {
    id: 'cand-003',
    reqId: 'req-002',
    jobTitle: 'HVAC Design & Heat Load Estimation Engineer',
    name: 'Shweta Kulkarni',
    email: 'shweta.kulkarni@gmail.com',
    phone: '+91 98450 33119',
    currentCompany: 'Blue Star Estimation Bureau',
    experienceYears: 5.2,
    currentCtc: 750000,
    expectedCtc: 950000,
    stage: 'Management Interview',
    interviewNotes: 'Carrier HAP expert; completed sample BOQ test in 45 minutes with 100% accuracy.',
    rating: 5,
    appliedDate: '2026-08-22'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    empCode: 'ALP-001',
    name: 'Shivender Kumar',
    designation: 'Managing Director & Operations Head',
    department: 'Executive Management',
    email: 'shiven.k@gmail.com',
    phone: '+91 98100 44231',
    dateOfJoining: '2020-01-15',
    reportingManager: 'Board of Directors',
    employmentStatus: 'Active',
    baseMonthlySalary: 150000,
    grossMonthlySalary: 250000,
    ctcAnnual: 3200000,
    pan: 'AABCA1299K',
    aadhaar: 'XXXX-XXXX-9012',
    uanNumber: '100982341102',
    pfNumber: 'MH/BAN/0043129/000/0000001',
    bankName: 'HDFC Bank Ltd',
    bankAccount: '50200019283741',
    ifscCode: 'HDFC0000053',
    taxRegime: 'New Regime',
    leaveBalances: { cl: 8, sl: 6, pl: 18 },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-002',
    empCode: 'ALP-002',
    name: 'Rakesh Mehra',
    designation: 'Head of Procurement & Supply Chain',
    department: 'Procurement & Materials',
    email: 'rakesh.procure@company.com',
    phone: '+91 98220 55123',
    dateOfJoining: '2021-03-01',
    reportingManager: 'Shivender Kumar',
    employmentStatus: 'Active',
    baseMonthlySalary: 75000,
    grossMonthlySalary: 125000,
    ctcAnnual: 1650000,
    pan: 'AABPM4412R',
    aadhaar: 'XXXX-XXXX-3341',
    uanNumber: '100982341103',
    pfNumber: 'MH/BAN/0043129/000/0000002',
    bankName: 'ICICI Bank',
    bankAccount: '001105029384',
    ifscCode: 'ICIC0000011',
    taxRegime: 'New Regime',
    leaveBalances: { cl: 6, sl: 5, pl: 14 },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-003',
    empCode: 'ALP-003',
    name: 'Rajesh Sharma',
    designation: 'Business Manager & Regional Sales Head',
    department: 'Sales & Business Development',
    email: 'rajesh.hvac@company.com',
    phone: '+91 98234 11200',
    dateOfJoining: '2021-06-15',
    reportingManager: 'Shivender Kumar',
    employmentStatus: 'Active',
    baseMonthlySalary: 70000,
    grossMonthlySalary: 120000,
    ctcAnnual: 1550000,
    pan: 'AABPS8821Q',
    aadhaar: 'XXXX-XXXX-8872',
    uanNumber: '100982341104',
    pfNumber: 'MH/BAN/0043129/000/0000003',
    bankName: 'HDFC Bank Ltd',
    bankAccount: '50200028391823',
    ifscCode: 'HDFC0000053',
    taxRegime: 'New Regime',
    leaveBalances: { cl: 7, sl: 4, pl: 12 },
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-004',
    empCode: 'ALP-004',
    name: 'Priya Mukherjee',
    designation: 'Chief MEP & HVAC Estimator',
    department: 'Engineering & Estimations',
    email: 'priya.m@company.com',
    phone: '+91 98112 33490',
    dateOfJoining: '2022-01-10',
    reportingManager: 'Shivender Kumar',
    employmentStatus: 'Active',
    baseMonthlySalary: 65000,
    grossMonthlySalary: 110000,
    ctcAnnual: 1420000,
    pan: 'AABPM9932P',
    aadhaar: 'XXXX-XXXX-6612',
    uanNumber: '100982341105',
    pfNumber: 'MH/BAN/0043129/000/0000004',
    bankName: 'Axis Bank',
    bankAccount: '918020038472819',
    ifscCode: 'UTIB0000123',
    taxRegime: 'New Regime',
    leaveBalances: { cl: 9, sl: 7, pl: 16 },
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-005',
    empCode: 'ALP-005',
    name: 'Imran Khan',
    designation: 'Warehouse & Logistics Superintendent',
    department: 'Logistics & Inventory',
    email: 'imran.warehouse@company.com',
    phone: '+91 98331 77654',
    dateOfJoining: '2022-04-01',
    reportingManager: 'Rakesh Mehra',
    employmentStatus: 'Active',
    baseMonthlySalary: 40000,
    grossMonthlySalary: 65000,
    ctcAnnual: 840000,
    pan: 'AABPK1123K',
    aadhaar: 'XXXX-XXXX-1192',
    uanNumber: '100982341106',
    pfNumber: 'MH/BAN/0043129/000/0000005',
    bankName: 'State Bank of India',
    bankAccount: '30491827364',
    ifscCode: 'SBIN0001234',
    taxRegime: 'New Regime',
    leaveBalances: { cl: 5, sl: 6, pl: 10 },
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-006',
    empCode: 'ALP-006',
    name: 'Ananya Roy',
    designation: 'Financial Controller & Accounts Head',
    department: 'Finance & Billing',
    email: 'ananya.roy@company.com',
    phone: '+91 98450 99812',
    dateOfJoining: '2022-08-15',
    reportingManager: 'Shivender Kumar',
    employmentStatus: 'Active',
    baseMonthlySalary: 60000,
    grossMonthlySalary: 100000,
    ctcAnnual: 1300000,
    pan: 'AABPR7719L',
    aadhaar: 'XXXX-XXXX-5521',
    uanNumber: '100982341107',
    pfNumber: 'MH/BAN/0043129/000/0000006',
    bankName: 'HDFC Bank Ltd',
    bankAccount: '50200039281726',
    ifscCode: 'HDFC0000053',
    taxRegime: 'New Regime',
    leaveBalances: { cl: 8, sl: 5, pl: 15 },
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-007',
    empCode: 'ALP-007',
    name: 'Vikram Sundaram',
    designation: 'Senior HVAC Field Service Engineer',
    department: 'Services & Operations',
    email: 'service.engineer@company.com',
    phone: '+91 99014 44521',
    dateOfJoining: '2023-02-01',
    reportingManager: 'Rajesh Varma',
    employmentStatus: 'Active',
    baseMonthlySalary: 45000,
    grossMonthlySalary: 75000,
    ctcAnnual: 980000,
    pan: 'AABPS2231M',
    aadhaar: 'XXXX-XXXX-7734',
    uanNumber: '100982341108',
    pfNumber: 'MH/BAN/0043129/000/0000007',
    bankName: 'Kotak Mahindra Bank',
    bankAccount: '4819203847',
    ifscCode: 'KKBK0000123',
    taxRegime: 'New Regime',
    leaveBalances: { cl: 6, sl: 4, pl: 11 },
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'emp-009',
    empCode: 'ALP-009',
    name: 'Rajesh Varma',
    designation: 'Service Operations Manager & AMC Head',
    department: 'Services & Operations',
    email: 'service.manager@company.com',
    phone: '+91 98201 55678',
    dateOfJoining: '2023-01-15',
    reportingManager: 'Shivender Kumar',
    employmentStatus: 'Active',
    baseMonthlySalary: 68000,
    grossMonthlySalary: 115000,
    ctcAnnual: 1480000,
    pan: 'AABPV5567K',
    aadhaar: 'XXXX-XXXX-9912',
    uanNumber: '100982341109',
    pfNumber: 'MH/BAN/0043129/000/0000009',
    bankName: 'HDFC Bank Ltd',
    bankAccount: '50200038491820',
    ifscCode: 'HDFC0000053',
    taxRegime: 'New Regime',
    leaveBalances: { cl: 8, sl: 5, pl: 15 },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // 2026-08-30 (Saturday)
  {
    id: 'att-001',
    empId: 'emp-001',
    empCode: 'ALP-001',
    empName: 'Shivender Kumar',
    date: '2026-08-30',
    status: 'Present',
    checkInTime: '09:05 AM',
    checkOutTime: '06:45 PM',
    totalHours: 9.6,
    deviceId: 'bio-001',
    deviceName: 'HQ Main Turnstile [eSSL SilkBio-101TC]',
    deviceLocation: 'HQ MIDC Andheri East',
    verificationMode: 'Face Recognition',
    siteProjectName: 'HQ MIDC Andheri Office',
    remarks: 'Executive review meeting'
  },
  {
    id: 'att-002',
    empId: 'emp-002',
    empCode: 'ALP-002',
    empName: 'Rakesh Mehra',
    date: '2026-08-30',
    status: 'Present',
    checkInTime: '09:15 AM',
    checkOutTime: '06:30 PM',
    totalHours: 9.2,
    deviceId: 'bio-003',
    deviceName: 'Turbhe Yard Gate [Matrix COSEC VEGA]',
    deviceLocation: 'Turbhe Central Yard',
    verificationMode: 'Fingerprint',
    siteProjectName: 'Bhiwandi Central Yard',
    remarks: 'Copper tube shipment inspection'
  },
  {
    id: 'att-003',
    empId: 'emp-003',
    empCode: 'ALP-003',
    empName: 'Rajesh Sharma',
    date: '2026-08-30',
    status: 'Site Visit',
    checkInTime: '09:45 AM',
    checkOutTime: '07:15 PM',
    totalHours: 9.5,
    deviceId: 'bio-002',
    deviceName: 'BKC Project Site Terminal [ZKTeco uFace 800]',
    deviceLocation: 'BKC Site Office Cabin B',
    verificationMode: 'Fingerprint',
    siteProjectName: 'Nexus Tech Park Client Office',
    remarks: 'Phase 2 expansion proposal discussion'
  },
  {
    id: 'att-004',
    empId: 'emp-004',
    empCode: 'ALP-004',
    empName: 'Priya Mukherjee',
    date: '2026-08-30',
    status: 'Present',
    checkInTime: '09:10 AM',
    checkOutTime: '06:15 PM',
    totalHours: 9.1,
    deviceId: 'bio-001',
    deviceName: 'HQ Main Turnstile [eSSL SilkBio-101TC]',
    deviceLocation: 'HQ MIDC Andheri East',
    verificationMode: 'Face Recognition',
    siteProjectName: 'HQ Estimations Dept',
    remarks: 'Max Hospital HAP load calculation'
  },
  {
    id: 'att-005',
    empId: 'emp-005',
    empCode: 'ALP-005',
    empName: 'Imran Khan',
    date: '2026-08-30',
    status: 'Present',
    checkInTime: '08:45 AM',
    checkOutTime: '05:45 PM',
    totalHours: 9.0,
    deviceId: 'bio-003',
    deviceName: 'Turbhe Yard Gate [Matrix COSEC VEGA]',
    deviceLocation: 'Turbhe Central Yard',
    verificationMode: 'RFID Card',
    siteProjectName: 'Warehouse Dispatch Gate',
    remarks: 'Daikin VRV delivery inwarding'
  },
  {
    id: 'att-006',
    empId: 'emp-006',
    empCode: 'ALP-006',
    empName: 'Ananya Roy',
    date: '2026-08-30',
    status: 'WFH',
    checkInTime: '09:00 AM',
    checkOutTime: '06:00 PM',
    totalHours: 9.0,
    deviceId: 'bio-001',
    deviceName: 'HQ Web Geofence Punch Terminal',
    deviceLocation: 'Remote Virtual VPN',
    verificationMode: 'Mobile Geofence',
    siteProjectName: 'Finance Remote',
    remarks: 'Monthly GSTR-3B filing & bank reconciliation'
  },
  {
    id: 'att-007',
    empId: 'emp-007',
    empCode: 'ALP-007',
    empName: 'Vikram Sundaram',
    date: '2026-08-30',
    status: 'Site Visit',
    checkInTime: '08:30 AM',
    checkOutTime: '07:00 PM',
    totalHours: 10.5,
    deviceId: 'bio-002',
    deviceName: 'BKC Project Site Terminal [ZKTeco uFace 800]',
    deviceLocation: 'BKC Site Office Cabin B',
    verificationMode: 'Fingerprint',
    siteProjectName: 'Nexus Tech Park Site',
    remarks: '550 PSI Nitrogen pressure hold testing'
  },

  // 2026-08-29 (Friday)
  {
    id: 'att-008',
    empId: 'emp-001',
    empCode: 'ALP-001',
    empName: 'Shivender Kumar',
    date: '2026-08-29',
    status: 'Present',
    checkInTime: '09:12 AM',
    checkOutTime: '07:10 PM',
    totalHours: 9.9,
    deviceId: 'bio-001',
    deviceName: 'HQ Main Turnstile [eSSL SilkBio-101TC]',
    deviceLocation: 'HQ MIDC Andheri East',
    verificationMode: 'Face Recognition',
    siteProjectName: 'Corporate Operations',
    remarks: 'Monthly project review'
  },
  {
    id: 'att-009',
    empId: 'emp-002',
    empCode: 'ALP-002',
    empName: 'Rakesh Mehra',
    date: '2026-08-29',
    status: 'Present',
    checkInTime: '09:00 AM',
    checkOutTime: '06:15 PM',
    totalHours: 9.2,
    deviceId: 'bio-003',
    deviceName: 'Turbhe Yard Gate [Matrix COSEC VEGA]',
    deviceLocation: 'Turbhe Central Yard',
    verificationMode: 'Fingerprint',
    siteProjectName: 'Procurement Yard',
    remarks: 'Steel framing stock count'
  },
  {
    id: 'att-010',
    empId: 'emp-003',
    empCode: 'ALP-003',
    empName: 'Rajesh Sharma',
    date: '2026-08-29',
    status: 'Present',
    checkInTime: '09:20 AM',
    checkOutTime: '06:40 PM',
    totalHours: 9.3,
    deviceId: 'bio-001',
    deviceName: 'HQ Main Turnstile [eSSL SilkBio-101TC]',
    deviceLocation: 'HQ MIDC Andheri East',
    verificationMode: 'Fingerprint',
    siteProjectName: 'Sales HQ',
    remarks: 'Commercial pricing finalization'
  },
  {
    id: 'att-011',
    empId: 'emp-004',
    empCode: 'ALP-004',
    empName: 'Priya Mukherjee',
    date: '2026-08-29',
    status: 'Present',
    checkInTime: '08:58 AM',
    checkOutTime: '06:05 PM',
    totalHours: 9.1,
    deviceId: 'bio-001',
    deviceName: 'HQ Main Turnstile [eSSL SilkBio-101TC]',
    deviceLocation: 'HQ MIDC Andheri East',
    verificationMode: 'Face Recognition',
    siteProjectName: 'Engineering & BIM',
    remarks: 'Revit drawing submittal'
  },
  {
    id: 'att-012',
    empId: 'emp-005',
    empCode: 'ALP-005',
    empName: 'Imran Khan',
    date: '2026-08-29',
    status: 'Present',
    checkInTime: '08:40 AM',
    checkOutTime: '05:50 PM',
    totalHours: 9.2,
    deviceId: 'bio-003',
    deviceName: 'Turbhe Yard Gate [Matrix COSEC VEGA]',
    deviceLocation: 'Turbhe Central Yard',
    verificationMode: 'RFID Card',
    siteProjectName: 'Central Logistics',
    remarks: 'Dispatch to BKC Site'
  },
  {
    id: 'att-013',
    empId: 'emp-006',
    empCode: 'ALP-006',
    empName: 'Ananya Roy',
    date: '2026-08-29',
    status: 'Present',
    checkInTime: '09:05 AM',
    checkOutTime: '06:20 PM',
    totalHours: 9.2,
    deviceId: 'bio-001',
    deviceName: 'HQ Main Turnstile [eSSL SilkBio-101TC]',
    deviceLocation: 'HQ MIDC Andheri East',
    verificationMode: 'Fingerprint',
    siteProjectName: 'Accounts Wing',
    remarks: 'Vendor billing audits'
  },
  {
    id: 'att-014',
    empId: 'emp-007',
    empCode: 'ALP-007',
    empName: 'Vikram Sundaram',
    date: '2026-08-29',
    status: 'Present',
    checkInTime: '08:35 AM',
    checkOutTime: '06:45 PM',
    totalHours: 10.1,
    deviceId: 'bio-002',
    deviceName: 'BKC Project Site Terminal [ZKTeco uFace 800]',
    deviceLocation: 'BKC Site Office Cabin B',
    verificationMode: 'Fingerprint',
    siteProjectName: 'BKC Site Office',
    remarks: 'AHU unit vibration dampers'
  },

  // 2026-08-28 (Thursday)
  {
    id: 'att-015',
    empId: 'emp-001',
    empCode: 'ALP-001',
    empName: 'Shivender Kumar',
    date: '2026-08-28',
    status: 'Present',
    checkInTime: '09:00 AM',
    checkOutTime: '06:30 PM',
    totalHours: 9.5,
    deviceId: 'bio-001',
    deviceName: 'HQ Main Turnstile [eSSL SilkBio-101TC]',
    deviceLocation: 'HQ MIDC Andheri East',
    verificationMode: 'Face Recognition',
    siteProjectName: 'Executive Wing'
  },
  {
    id: 'att-016',
    empId: 'emp-002',
    empCode: 'ALP-002',
    empName: 'Rakesh Mehra',
    date: '2026-08-28',
    status: 'Present',
    checkInTime: '09:10 AM',
    checkOutTime: '06:15 PM',
    totalHours: 9.1,
    deviceId: 'bio-003',
    deviceName: 'Turbhe Yard Gate [Matrix COSEC VEGA]',
    deviceLocation: 'Turbhe Central Yard',
    verificationMode: 'Fingerprint'
  },
  {
    id: 'att-017',
    empId: 'emp-003',
    empCode: 'ALP-003',
    empName: 'Rajesh Sharma',
    date: '2026-08-28',
    status: 'Present',
    checkInTime: '09:08 AM',
    checkOutTime: '06:30 PM',
    totalHours: 9.3,
    deviceId: 'bio-001',
    deviceName: 'HQ Main Turnstile [eSSL SilkBio-101TC]',
    deviceLocation: 'HQ MIDC Andheri East',
    verificationMode: 'Fingerprint'
  },
  {
    id: 'att-018',
    empId: 'emp-004',
    empCode: 'ALP-004',
    empName: 'Priya Mukherjee',
    date: '2026-08-28',
    status: 'Present',
    checkInTime: '09:15 AM',
    checkOutTime: '06:15 PM',
    totalHours: 9.0,
    deviceId: 'bio-001',
    deviceName: 'HQ Main Turnstile [eSSL SilkBio-101TC]',
    deviceLocation: 'HQ MIDC Andheri East',
    verificationMode: 'Face Recognition'
  },
  {
    id: 'att-019',
    empId: 'emp-005',
    empCode: 'ALP-005',
    empName: 'Imran Khan',
    date: '2026-08-28',
    status: 'Present',
    checkInTime: '08:45 AM',
    checkOutTime: '05:45 PM',
    totalHours: 9.0,
    deviceId: 'bio-003',
    deviceName: 'Turbhe Yard Gate [Matrix COSEC VEGA]',
    deviceLocation: 'Turbhe Central Yard',
    verificationMode: 'RFID Card'
  },
  {
    id: 'att-020',
    empId: 'emp-006',
    empCode: 'ALP-006',
    empName: 'Ananya Roy',
    date: '2026-08-28',
    status: 'Present',
    checkInTime: '08:55 AM',
    checkOutTime: '06:10 PM',
    totalHours: 9.2,
    deviceId: 'bio-001',
    deviceName: 'HQ Main Turnstile [eSSL SilkBio-101TC]',
    deviceLocation: 'HQ MIDC Andheri East',
    verificationMode: 'Fingerprint'
  },
  {
    id: 'att-021',
    empId: 'emp-007',
    empCode: 'ALP-007',
    empName: 'Vikram Sundaram',
    date: '2026-08-28',
    status: 'Present',
    checkInTime: '08:30 AM',
    checkOutTime: '06:40 PM',
    totalHours: 10.2,
    deviceId: 'bio-002',
    deviceName: 'BKC Project Site Terminal [ZKTeco uFace 800]',
    deviceLocation: 'BKC Site Office Cabin B',
    verificationMode: 'Fingerprint'
  }
];

export const INITIAL_TIMESHEETS: TimesheetEntry[] = [
  {
    id: 'ts-001',
    empId: 'emp-007',
    empName: 'Vikram Sundaram',
    weekStartDate: '2026-08-24',
    weekEndDate: '2026-08-29',
    projectId: 'PRJ-2026-001',
    projectName: 'Nexus Infinity Tech Park (1200 TR VRF)',
    taskDescription: 'Refrigerant copper line brazing, nitrogen flushing, and vibration isolator installation on 5th floor terrace.',
    monHours: 8.5,
    tueHours: 9.0,
    wedHours: 8.5,
    thuHours: 9.0,
    friHours: 8.0,
    satHours: 5.0,
    totalHours: 48.0,
    status: 'Approved',
    approvedBy: 'Shivender Kumar'
  },
  {
    id: 'ts-002',
    empId: 'emp-004',
    empName: 'Priya Mukherjee',
    weekStartDate: '2026-08-24',
    weekEndDate: '2026-08-29',
    projectId: 'PRJ-2026-002',
    projectName: 'Max Super Speciality Oncology Chiller Wing',
    taskDescription: 'Cleanroom AHU CFM calculation, HEPA filter differential pressure sizing, and BOQ draft.',
    monHours: 8.0,
    tueHours: 8.5,
    wedHours: 8.0,
    thuHours: 8.0,
    friHours: 8.0,
    satHours: 0.0,
    totalHours: 40.5,
    status: 'Approved',
    approvedBy: 'Shivender Kumar'
  }
];

export const INITIAL_LEAVES: LeaveApplication[] = [
  {
    id: 'lv-001',
    empId: 'emp-003',
    empName: 'Rajesh Sharma',
    empCode: 'ALP-003',
    leaveType: 'Casual Leave (CL)',
    startDate: '2026-09-04',
    endDate: '2026-09-05',
    totalDays: 2,
    reason: 'Family function in Pune.',
    status: 'Approved',
    appliedAt: '2026-08-28T14:00:00Z',
    actionRemarks: 'Approved. Ensure client follow-ups delegated to sales associate.',
    actionBy: 'Shivender Kumar'
  },
  {
    id: 'lv-002',
    empId: 'emp-005',
    empCode: 'ALP-005',
    empName: 'Imran Khan',
    leaveType: 'Earned Leave (PL)',
    startDate: '2026-09-15',
    endDate: '2026-09-18',
    totalDays: 4,
    reason: 'Annual family festival visit.',
    status: 'Pending',
    appliedAt: '2026-08-29T11:00:00Z'
  },
  {
    id: 'lv-003',
    empId: 'emp-001',
    empCode: 'ALP-001',
    empName: 'Shivender Kumar',
    leaveType: 'Earned Leave (PL)',
    startDate: '2026-09-22',
    endDate: '2026-09-24',
    totalDays: 3,
    reason: 'ASHRAE International HVAC Leadership Summit delegation.',
    status: 'Approved',
    appliedAt: '2026-08-25T09:30:00Z',
    actionRemarks: 'Authorized self-travel delegation.',
    actionBy: 'Board of Directors'
  },
  {
    id: 'lv-004',
    empId: 'emp-002',
    empCode: 'ALP-002',
    empName: 'Sunil Mehta',
    leaveType: 'Casual Leave (CL)',
    startDate: '2026-09-10',
    endDate: '2026-09-11',
    totalDays: 2,
    reason: 'Personal medical checkup and dental appointment.',
    status: 'Pending',
    appliedAt: '2026-08-30T16:20:00Z'
  },
  {
    id: 'lv-005',
    empId: 'emp-004',
    empCode: 'ALP-004',
    empName: 'Ananya Roy',
    leaveType: 'Sick Leave (SL)',
    startDate: '2026-08-20',
    endDate: '2026-08-21',
    totalDays: 2,
    reason: 'Severe viral fever and physician prescribed rest.',
    status: 'Approved',
    appliedAt: '2026-08-20T08:15:00Z',
    actionRemarks: 'Medical prescription verified. Approved.',
    actionBy: 'Shivender Kumar'
  }
];

export const INITIAL_HOLIDAYS: CompanyHoliday[] = [
  { id: 'hol-01', date: '2026-01-26', name: 'Republic Day', type: 'National Mandatory', optional: false },
  { id: 'hol-02', date: '2026-03-04', name: 'Holi / Festival of Colors', type: 'Regional / Festival', optional: false },
  { id: 'hol-03', date: '2026-05-01', name: 'Maharashtra Day / Labour Day', type: 'Regional / Festival', optional: false },
  { id: 'hol-04', date: '2026-08-15', name: 'Independence Day', type: 'National Mandatory', optional: false },
  { id: 'hol-05', date: '2026-09-14', name: 'Ganesh Chaturthi', type: 'Regional / Festival', optional: false },
  { id: 'hol-06', date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', type: 'National Mandatory', optional: false },
  { id: 'hol-07', date: '2026-10-20', name: 'Dussehra (Vijayadashami)', type: 'Regional / Festival', optional: false },
  { id: 'hol-08', date: '2026-11-08', name: 'Diwali (Laxmi Pujan)', type: 'Regional / Festival', optional: false },
  { id: 'hol-09', date: '2026-12-25', name: 'Christmas', type: 'Regional / Festival', optional: false }
];

export const INITIAL_PAYROLL_MONTHS: PayrollMonth[] = [
  {
    id: 'pay-2026-08',
    monthYear: 'August 2026',
    runDate: '2026-08-30',
    totalGross: 840000,
    totalNet: 712400,
    totalPfEe: 60480,
    totalPfEr: 60480,
    totalEsic: 0,
    totalTds: 65720,
    totalPt: 1400,
    totalEmployees: 7,
    status: 'Approved',
    payslips: [
      {
        id: 'ps-001',
        payrollMonthId: 'pay-2026-08',
        monthYear: 'August 2026',
        empId: 'emp-001',
        empCode: 'ALP-001',
        empName: 'Shivender Kumar',
        designation: 'Managing Director & Operations Head',
        department: 'Executive Management',
        pan: 'AABCA1299K',
        uan: '100982341102',
        bankAccount: '50200019283741',
        bankName: 'HDFC Bank Ltd',
        workingDays: 31,
        payableDays: 31,
        leaveDays: 0,
        basicPay: 125000,
        hra: 50000,
        specialAllowance: 50000,
        siteAllowance: 15000,
        conveyanceAllowance: 10000,
        grossEarnings: 250000,
        pfEmployee: 15000,
        pfEmployer: 15000,
        esicEmployee: 0,
        esicEmployer: 0,
        professionalTax: 200,
        tdsTax: 28500,
        totalDeductions: 43700,
        netPay: 206300,
        netPayInWords: 'Rupees Two Lakh Six Thousand Three Hundred Only'
      },
      {
        id: 'ps-002',
        payrollMonthId: 'pay-2026-08',
        monthYear: 'August 2026',
        empId: 'emp-002',
        empCode: 'ALP-002',
        empName: 'Rakesh Mehra',
        designation: 'Head of Procurement & Supply Chain',
        department: 'Procurement & Materials',
        pan: 'AABPM4412R',
        uan: '100982341103',
        bankAccount: '001105029384',
        bankName: 'ICICI Bank',
        workingDays: 31,
        payableDays: 31,
        leaveDays: 0,
        basicPay: 62500,
        hra: 25000,
        specialAllowance: 25000,
        siteAllowance: 7500,
        conveyanceAllowance: 5000,
        grossEarnings: 125000,
        pfEmployee: 7500,
        pfEmployer: 7500,
        esicEmployee: 0,
        esicEmployer: 0,
        professionalTax: 200,
        tdsTax: 9800,
        totalDeductions: 17500,
        netPay: 107500,
        netPayInWords: 'Rupees One Lakh Seven Thousand Five Hundred Only'
      },
      {
        id: 'ps-003',
        payrollMonthId: 'pay-2026-08',
        monthYear: 'August 2026',
        empId: 'emp-003',
        empCode: 'ALP-003',
        empName: 'Rajesh Sharma',
        designation: 'Business Manager & Regional Sales Head',
        department: 'Sales & Business Development',
        pan: 'AABPS8821Q',
        uan: '100982341104',
        bankAccount: '50200028391823',
        bankName: 'HDFC Bank Ltd',
        workingDays: 31,
        payableDays: 31,
        leaveDays: 0,
        basicPay: 60000,
        hra: 24000,
        specialAllowance: 24000,
        siteAllowance: 7000,
        conveyanceAllowance: 5000,
        grossEarnings: 120000,
        pfEmployee: 7200,
        pfEmployer: 7200,
        esicEmployee: 0,
        esicEmployer: 0,
        professionalTax: 200,
        tdsTax: 8900,
        totalDeductions: 16300,
        netPay: 103700,
        netPayInWords: 'Rupees One Lakh Three Thousand Seven Hundred Only'
      },
      {
        id: 'ps-004',
        payrollMonthId: 'pay-2026-08',
        monthYear: 'August 2026',
        empId: 'emp-004',
        empCode: 'ALP-004',
        empName: 'Priya Mukherjee',
        designation: 'Chief MEP & HVAC Estimator',
        department: 'Engineering & Estimations',
        pan: 'AABPM9932P',
        uan: '100982341105',
        bankAccount: '918020038472819',
        bankName: 'Axis Bank',
        workingDays: 31,
        payableDays: 31,
        leaveDays: 0,
        basicPay: 55000,
        hra: 22000,
        specialAllowance: 22000,
        siteAllowance: 6000,
        conveyanceAllowance: 5000,
        grossEarnings: 110000,
        pfEmployee: 6600,
        pfEmployer: 6600,
        esicEmployee: 0,
        esicEmployer: 0,
        professionalTax: 200,
        tdsTax: 7600,
        totalDeductions: 14400,
        netPay: 95600,
        netPayInWords: 'Rupees Ninety Five Thousand Six Hundred Only'
      },
      {
        id: 'ps-005',
        payrollMonthId: 'pay-2026-08',
        monthYear: 'August 2026',
        empId: 'emp-005',
        empCode: 'ALP-005',
        empName: 'Imran Khan',
        designation: 'Warehouse & Logistics Superintendent',
        department: 'Logistics & Inventory',
        pan: 'AABPK1123K',
        uan: '100982341106',
        bankAccount: '30491827364',
        bankName: 'State Bank of India',
        workingDays: 31,
        payableDays: 31,
        leaveDays: 0,
        basicPay: 32500,
        hra: 13000,
        specialAllowance: 13000,
        siteAllowance: 3500,
        conveyanceAllowance: 3000,
        grossEarnings: 65000,
        pfEmployee: 3900,
        pfEmployer: 3900,
        esicEmployee: 0,
        esicEmployer: 0,
        professionalTax: 200,
        tdsTax: 2120,
        totalDeductions: 6220,
        netPay: 58780,
        netPayInWords: 'Rupees Fifty Eight Thousand Seven Hundred Eighty Only'
      },
      {
        id: 'ps-006',
        payrollMonthId: 'pay-2026-08',
        monthYear: 'August 2026',
        empId: 'emp-006',
        empCode: 'ALP-006',
        empName: 'Ananya Roy',
        designation: 'Financial Controller & Accounts Head',
        department: 'Finance & Billing',
        pan: 'AABPR7719L',
        uan: '100982341107',
        bankAccount: '50200039281726',
        bankName: 'HDFC Bank Ltd',
        workingDays: 31,
        payableDays: 31,
        leaveDays: 0,
        basicPay: 50000,
        hra: 20000,
        specialAllowance: 20000,
        siteAllowance: 5000,
        conveyanceAllowance: 5000,
        grossEarnings: 100000,
        pfEmployee: 6000,
        pfEmployer: 6000,
        esicEmployee: 0,
        esicEmployer: 0,
        professionalTax: 200,
        tdsTax: 5600,
        totalDeductions: 11800,
        netPay: 88200,
        netPayInWords: 'Rupees Eighty Eight Thousand Two Hundred Only'
      },
      {
        id: 'ps-007',
        payrollMonthId: 'pay-2026-08',
        monthYear: 'August 2026',
        empId: 'emp-007',
        empCode: 'ALP-007',
        empName: 'Vikram Sundaram',
        designation: 'Senior Commissioning Engineer & Field Supervisor',
        department: 'Service & Field Operations',
        pan: 'AABPS2231M',
        uan: '100982341108',
        bankAccount: '4819203847',
        bankName: 'Kotak Mahindra Bank',
        workingDays: 31,
        payableDays: 31,
        leaveDays: 0,
        basicPay: 37500,
        hra: 15000,
        specialAllowance: 15000,
        siteAllowance: 4500,
        conveyanceAllowance: 3000,
        grossEarnings: 75000,
        pfEmployee: 4500,
        pfEmployer: 4500,
        esicEmployee: 0,
        esicEmployer: 0,
        professionalTax: 200,
        tdsTax: 3200,
        totalDeductions: 7900,
        netPay: 67100,
        netPayInWords: 'Rupees Sixty Seven Thousand One Hundred Only'
      }
    ]
  }
];

export const INITIAL_RESIGNATIONS: ResignationRecord[] = [
  {
    id: 'res-001',
    empId: 'emp-008-demo',
    empCode: 'ALP-008',
    empName: 'Tanmay Kulkarni',
    designation: 'Junior MEP Draughtsman',
    department: 'Engineering & Estimations',
    dateOfJoining: '2023-06-01',
    resignationDate: '2026-08-01',
    requestedRelievingDate: '2026-08-31',
    approvedLastWorkingDate: '2026-08-31',
    reasonCategory: 'Career Growth',
    employeeRemarks: 'Accepted an opportunity for international MEP project work in Dubai.',
    managerRemarks: 'Handed over all CAD drawings to Priya Mukherjee. Clean clearance across all departments.',
    noticePeriodDays: 30,
    noticeShortfallDays: 0,
    status: 'F&F Completed',
    approvals: {
      manager: {
        status: 'Approved',
        approverName: 'Rahul Verma (Engineering Lead)',
        actionDate: '2026-08-03',
        remarks: 'Handover of all BIM & Revit project files verified and assigned to team.',
        handoverCompleted: true,
        recommendedLastWorkingDate: '2026-08-31'
      },
      admin: {
        status: 'Approved',
        approverName: 'Suresh Patil (Admin & Facilities)',
        actionDate: '2026-08-28',
        remarks: 'Biometric access revoked, company ID card returned, drawer keys received.',
        idCardReturned: true,
        premisesAccessRevoked: true,
        assetsClearanceConfirmed: true,
        facilityDuesCleared: true
      },
      hr: {
        status: 'Approved',
        approverName: 'Ananya Deshmukh (Head HR)',
        actionDate: '2026-08-29',
        remarks: 'Exit interview conducted. Full notice served. Relieving letter authorized.',
        exitInterviewConducted: true,
        finalApprovedLastDate: '2026-08-31',
        relievingLetterIssued: true,
        relievingLetterNumber: 'ALP/HR/REL/2026-08/042'
      }
    },
    clearances: {
      itAssets: true,
      itAssetsRemarks: 'Dell Latitude 5420 & charger returned to IT Store (Good condition)',
      financeAdvances: true,
      financeAdvancesRemarks: 'All site travel imprest accounts reconciled (NIL dues)',
      projectHandover: true,
      projectHandoverRemarks: 'Sign-off received from Project Lead Rahul Verma',
      adminIdCard: true,
      adminRemarks: 'ID Card & access fob surrendered',
      hrExitInterview: true,
      hrRemarks: 'Exit feedback documented'
    },
    fnfSettlement: {
      unpaidSalaryDays: 31,
      unpaidSalaryAmount: 42000,
      leaveEncashmentDays: 6,
      leaveEncashmentAmount: 9692,
      gratuityAmount: 0, // < 5 years service
      bonusOrIncentives: 0,
      reimbursementsPending: 0,
      otherEarnings: 0,
      totalEarnings: 51692,
      noticeRecoveryDays: 0,
      noticeRecoveryAmount: 0,
      imprestAdvanceDeduction: 0,
      assetDamageOrLossDeduction: 0,
      tdsTaxDeduction: 0,
      pfDeduction: 0,
      otherDeductions: 0,
      totalDeductions: 0,
      netPayableAmount: 51692,
      sharedWithFinanceDate: '2026-08-29',
      financeStatus: 'Payment Released',
      paymentMethod: 'Bank Transfer / NEFT',
      paymentDate: '2026-08-30',
      paymentRef: 'NEFT-HDFC-FNF-8812',
      financeRemarks: 'Processed via HDFC Corporate Netbanking. Advice sent to ex-employee email.',
      financeVoucherNumber: 'FNF-PAY-2026-081',
      financeDisbursedBy: 'Vikram Mehta (Accounts Manager)'
    }
  },
  {
    id: 'res-002',
    empId: 'emp-005-demo',
    empCode: 'ALP-005',
    empName: 'Kunal Sharma',
    designation: 'Senior HVAC Commissioning Engineer',
    department: 'Testing & Commissioning',
    dateOfJoining: '2021-02-15',
    resignationDate: '2026-08-10',
    requestedRelievingDate: '2026-09-10',
    approvedLastWorkingDate: '2026-09-10',
    reasonCategory: 'Relocation',
    employeeRemarks: 'Relocating to Bengaluru due to family requirements. Thankful for the great learning opportunity at Alpha HVAC.',
    managerRemarks: 'Critical HVAC handover in progress for Prestige CyberTower chiller plant.',
    noticePeriodDays: 30,
    noticeShortfallDays: 0,
    status: 'Admin Approved',
    approvals: {
      manager: {
        status: 'Approved',
        approverName: 'Prakash Rao (Projects Director)',
        actionDate: '2026-08-12',
        remarks: 'Handover of all field test calibration reports and client punch-lists assigned to Rakesh Nair.',
        handoverCompleted: true,
        recommendedLastWorkingDate: '2026-09-10'
      },
      admin: {
        status: 'Approved',
        approverName: 'Suresh Patil (Admin & Facilities)',
        actionDate: '2026-08-25',
        remarks: 'Site safety gear and security ID badge verified. Access revocation scheduled for Sep 10.',
        idCardReturned: true,
        premisesAccessRevoked: false,
        assetsClearanceConfirmed: true,
        facilityDuesCleared: true
      },
      hr: {
        status: 'Pending',
        remarks: 'Exit interview scheduled for Sep 08. F&F settlement drafted and awaiting final HR signoff to release to Finance.'
      }
    },
    clearances: {
      itAssets: true,
      itAssetsRemarks: 'Lenovo ThinkPad P14s returned in good working order',
      financeAdvances: true,
      financeAdvancesRemarks: 'Site imprest of ₹15,000 settled and verified with vouchers',
      projectHandover: true,
      projectHandoverRemarks: 'Prestige project logbooks handed over',
      adminIdCard: true,
      adminRemarks: 'ID Card surrendered to reception',
      hrExitInterview: false,
      hrRemarks: 'Exit feedback pending'
    },
    fnfSettlement: {
      unpaidSalaryDays: 10,
      unpaidSalaryAmount: 23333,
      leaveEncashmentDays: 12,
      leaveEncashmentAmount: 28000,
      gratuityAmount: 110769, // 5.5 years service ((15 * 35000 * 5.5) / 26)
      bonusOrIncentives: 15000,
      reimbursementsPending: 4200,
      otherEarnings: 0,
      totalEarnings: 181302,
      noticeRecoveryDays: 0,
      noticeRecoveryAmount: 0,
      imprestAdvanceDeduction: 0,
      assetDamageOrLossDeduction: 0,
      tdsTaxDeduction: 12500,
      pfDeduction: 1800,
      otherDeductions: 0,
      totalDeductions: 14300,
      netPayableAmount: 167002,
      sharedWithFinanceDate: '2026-08-28',
      financeStatus: 'Sent to Finance',
      paymentMethod: 'Bank Transfer / NEFT',
      financeRemarks: 'Awaiting final HR authorization and clearance before bank release on Sep 10.',
      financeVoucherNumber: 'FNF-PAY-2026-094'
    }
  }
];

export const PREBUILT_HVAC_JDS = [
  {
    title: 'Senior HVAC Project Manager (Turnkey Commercial & VRV)',
    department: 'Projects & Operations',
    experienceRequired: '7 - 12 Years',
    salaryRange: '₹14,00,000 - ₹20,00,000 PA',
    summary: 'Lead end-to-end execution of multi-crore commercial VRF, Water Cooled Chiller, and Cleanroom HVAC installations across turnkey sites.',
    responsibilities: [
      'Lead end-to-end execution of commercial VRF, Chiller, and Cleanroom projects.',
      'Manage site engineers, MEP subcontractors, and commissioning crews.',
      'Coordinate with client architects, PMC consultants, and electrical teams.',
      'Enforce nitrogen leak testing (550 PSI) and vacuum dehydration (< 500 microns) QA/QC.'
    ],
    technicalRequirements: [
      'B.Tech / B.E. in Mechanical Engineering.',
      'Hands-on expertise with Daikin, Voltas, Blue Star, Trane, Carrier VRF & Chiller piping.',
      'ISHRAE / ASHRAE Member, PMP certification preferred.'
    ],
    kras: [
      { metric: 'On-Time Project Commissioning', target: '100% within SLA', weightage: 35 },
      { metric: 'Gross Profit Margin Safeguarding', target: '>= 22% Margin', weightage: 25 },
      { metric: 'BOQ Shortage Resolution & PR Timeliness', target: 'Zero site downtime', weightage: 20 },
      { metric: 'Client Milestone Bill Clearance', target: '<= 5 days from stage completion', weightage: 20 }
    ]
  },
  {
    title: 'HVAC Design & Heat Load Estimation Engineer',
    department: 'Engineering & Estimations',
    experienceRequired: '4 - 7 Years',
    salaryRange: '₹8,50,000 - ₹12,50,000 PA',
    summary: 'Perform accurate heat load calculations (HAP / Trace 700), equipment sizing, duct design, and generate high-margin tender BOQs.',
    responsibilities: [
      'Perform detailed heat load calculations using Carrier HAP and Trace 700.',
      'Select VRF outdoor/indoor units, chillers, AHUs, FCUs, and cooling towers.',
      'Design duct layouts with optimal CFM distribution and static pressure sizing.',
      'Prepare competitive techno-commercial BOQs and tender bids.'
    ],
    technicalRequirements: [
      'B.E. Mechanical / Diploma MEP.',
      'Proficiency in AutoCAD MEP, Carrier HAP, ductulator, and pipe sizing charts.',
      'Sound knowledge of ASHRAE 62.1 ventilation standards and ECBC guidelines.'
    ],
    kras: [
      { metric: 'Heat Load & Sizing Precision', target: 'Within ±3% of consultant specs', weightage: 35 },
      { metric: 'Quotation Turnaround Time', target: '< 48 hours for standard proposals', weightage: 35 },
      { metric: 'Bid-to-Win Conversion Rate', target: '>= 25% quote conversion', weightage: 30 }
    ]
  },
  {
    title: 'Chiller & VRF Testing & Commissioning Engineer',
    department: 'Service & Field Operations',
    experienceRequired: '3 - 6 Years',
    salaryRange: '₹6,00,000 - ₹9,00,000 PA',
    summary: 'Execute site testing, nitrogen pressure holding, vacuuming, oil & refrigerant charging, air balancing, and client handover.',
    responsibilities: [
      'Perform nitrogen pressure holding tests (550 PSI for 48 hours) on copper networks.',
      'Carry out vacuum holding down to 500 microns with digital micron gauges.',
      'Charge R410A / R32 refrigerants with precision digital weigh scales.',
      'Conduct CFM air balancing with thermal anemometers and hood balometers.'
    ],
    technicalRequirements: [
      'Diploma / Degree in Mechanical / Refrigeration & Air Conditioning.',
      'Hands-on expertise in VRF inverter diagnostics, error codes, and PCB troubleshooting.',
      'Valid electrical safety / ISHRAE service certification.'
    ],
    kras: [
      { metric: 'First-Pass Commissioning Success', target: 'Zero rework on initial startup', weightage: 40 },
      { metric: 'Air & Water Balancing Precision', target: '±5% CFM design adherence', weightage: 30 },
      { metric: 'Testing Signoff Report Handover', target: '< 24 hours from commissioning', weightage: 30 }
    ]
  },
  {
    title: 'MEP BIM & AutoCAD Draughtsman',
    department: 'Engineering & Estimations',
    experienceRequired: '2 - 5 Years',
    salaryRange: '₹4,50,000 - ₹7,00,000 PA',
    summary: 'Create detailed HVAC shop drawings, coordinated MEP composite drawings, duct fabrication cut-sheets, and as-built submittals.',
    responsibilities: [
      'Prepare detailed HVAC double-line ducting, piping, and equipment layouts.',
      'Develop clash-free coordinated composite MEP drawings with electrical & plumbing.',
      'Generate duct fabrication spool drawings and BOM for factory cutting.',
      'Update as-built drawings post-site commissioning.'
    ],
    technicalRequirements: [
      'Diploma in Mechanical / ITI Draughtsmanship.',
      'Proficiency in AutoCAD 2D/3D and Revit MEP BIM modeling.',
      'Understanding of SMACNA / ISHRAE duct construction standards.'
    ],
    kras: [
      { metric: 'Shop Drawing Approval Rate', target: 'First-round PMC consultant signoff', weightage: 40 },
      { metric: 'Clash Resolution & Coordination', target: 'Zero site spatial clashes', weightage: 35 },
      { metric: 'Duct Spool Sheet Accuracy', target: '< 1% material mismatch', weightage: 25 }
    ]
  },
  {
    title: 'Commercial HVAC Sales Engineer (B2B Enterprise & Builders)',
    department: 'Sales & Business Development',
    experienceRequired: '3 - 7 Years',
    salaryRange: '₹7,00,000 - ₹12,00,000 PA + Incentives',
    summary: 'Drive B2B sales of commercial HVAC solutions to general contractors, architects, MEP consultants, and developers.',
    responsibilities: [
      'Generate new business leads from developers, architects, and corporate clients.',
      'Conduct technical presentations on energy-efficient VRF and inverter chillers.',
      'Negotiate commercial contracts, payment milestones, and warranty terms.',
      'Achieve assigned quarterly sales revenue and gross margin quotas.'
    ],
    technicalRequirements: [
      'B.E. Mechanical / MBA Marketing.',
      'Proven sales track record in HVAC contracting / capital equipment.',
      'Excellent communication and relationship-building skills.'
    ],
    kras: [
      { metric: 'Monthly Sales Revenue Quota', target: '100% quota achievement', weightage: 40 },
      { metric: 'Average Deal Gross Margin', target: '>= 20% margin', weightage: 30 },
      { metric: 'New Consultant Empanelment', target: '2 new consultants / month', weightage: 30 }
    ]
  }
];

// =============================================================
// INITIAL DATASETS FOR ALL 12 HR SUB-MODULES
// =============================================================

// 1. Organization & HR Master
export const INITIAL_DEPARTMENTS: any[] = [
  {
    id: 'dept-001',
    code: 'PRJ-OPS',
    name: 'Projects & Field Operations',
    headOfDepartment: 'Sunil Mehta (VP Operations)',
    totalPositions: 18,
    activeEmployees: 14,
    costCenterCode: 'CC-OPS-MUM',
    description: 'Turnkey HVAC installation, duct fabrication, VRF/Chiller piping, site engineering, and commissioning.'
  },
  {
    id: 'dept-002',
    code: 'ENG-EST',
    name: 'Engineering & Estimations',
    headOfDepartment: 'Priya Mukherjee (Chief Estimator)',
    totalPositions: 8,
    activeEmployees: 6,
    costCenterCode: 'CC-ENG-DES',
    description: 'Heat load calculations (HAP/Trace 700), tender BOQ preparation, Revit MEP BIM modeling, and value engineering.'
  },
  {
    id: 'dept-003',
    code: 'SALES-BD',
    name: 'Sales & Business Development',
    headOfDepartment: 'Rohan Deshmukh (Head - Commercial Sales)',
    totalPositions: 6,
    activeEmployees: 5,
    costCenterCode: 'CC-SALES-BD',
    description: 'B2B enterprise client acquisition, architect & PMC consultant liaisons, and tender bidding.'
  },
  {
    id: 'dept-004',
    code: 'PROC-LOG',
    name: 'Procurement & Logistics',
    headOfDepartment: 'Anand Kulkarni (Procurement Head)',
    totalPositions: 6,
    activeEmployees: 4,
    costCenterCode: 'CC-PROC-LOG',
    description: 'Vendor management, OEM price negotiations (Daikin, Voltas, Blue Star), and central warehouse dispatches.'
  },
  {
    id: 'dept-005',
    code: 'QA-HSE',
    name: 'Quality Assurance & HSE Safety',
    headOfDepartment: 'Vikram Singhania (HSE Lead)',
    totalPositions: 4,
    activeEmployees: 3,
    costCenterCode: 'CC-QA-HSE',
    description: 'Site safety protocols, nitrogen pressure test audits (550 PSI), vacuum verification (<500 microns), and QA/QC certifications.'
  },
  {
    id: 'dept-006',
    code: 'FIN-HR',
    name: 'Finance, Accounts & HR',
    headOfDepartment: 'Shivender Kumar (Managing Director)',
    totalPositions: 6,
    activeEmployees: 5,
    costCenterCode: 'CC-FIN-ADM',
    description: 'Statutory compliance (EPF, ESIC, PT, TDS), payroll, talent acquisition, and corporate governance.'
  }
];

export const INITIAL_DESIGNATION_GRADES: any[] = [
  {
    id: 'desig-001',
    gradeCode: 'L1',
    title: 'Managing Director / Executive VP',
    band: 'Executive Leadership',
    minSalaryAnnual: 2400000,
    maxSalaryAnnual: 4500000,
    noticePeriodDays: 90,
    probationMonths: 0
  },
  {
    id: 'desig-002',
    gradeCode: 'L2',
    title: 'Senior Project Manager / Chief Estimator',
    band: 'Senior Management',
    minSalaryAnnual: 1400000,
    maxSalaryAnnual: 2200000,
    noticePeriodDays: 60,
    probationMonths: 3
  },
  {
    id: 'desig-003',
    gradeCode: 'L3',
    title: 'Lead Project Engineer / Senior Sales Engineer',
    band: 'Middle Engineering',
    minSalaryAnnual: 800000,
    maxSalaryAnnual: 1400000,
    noticePeriodDays: 30,
    probationMonths: 6
  },
  {
    id: 'desig-004',
    gradeCode: 'L4',
    title: 'HVAC Site Engineer / Commissioning Specialist',
    band: 'Junior Engineering',
    minSalaryAnnual: 500000,
    maxSalaryAnnual: 850000,
    noticePeriodDays: 30,
    probationMonths: 6
  },
  {
    id: 'desig-005',
    gradeCode: 'L5',
    title: 'Senior HVAC Technician / Ducting Supervisor',
    band: 'Field Operations',
    minSalaryAnnual: 360000,
    maxSalaryAnnual: 550000,
    noticePeriodDays: 15,
    probationMonths: 3
  },
  {
    id: 'desig-006',
    gradeCode: 'L6',
    title: 'Assistant Draughtsman / Warehouse Associate',
    band: 'Support Staff',
    minSalaryAnnual: 280000,
    maxSalaryAnnual: 400000,
    noticePeriodDays: 15,
    probationMonths: 3
  }
];

export const INITIAL_SHIFTS: any[] = [
  {
    id: 'shift-001',
    name: 'General HQ Office Shift',
    code: 'SH-GEN-01',
    startTime: '09:30 AM',
    endTime: '06:30 PM',
    graceMinutes: 15,
    halfDayHours: 4.5,
    fullDayHours: 8.5,
    isNightShift: false,
    applicableDepartments: ['Engineering & Estimations', 'Finance, Accounts & HR', 'Procurement & Logistics', 'Sales & Business Development']
  },
  {
    id: 'shift-002',
    name: 'Site Erection & Piping Shift',
    code: 'SH-SITE-DAY',
    startTime: '08:30 AM',
    endTime: '05:30 PM',
    graceMinutes: 10,
    halfDayHours: 4.5,
    fullDayHours: 8.5,
    isNightShift: false,
    applicableDepartments: ['Projects & Field Operations', 'Quality Assurance & HSE Safety']
  },
  {
    id: 'shift-003',
    name: 'Night Testing & Commissioning Shift',
    code: 'SH-SITE-NIGHT',
    startTime: '08:00 PM',
    endTime: '05:00 AM',
    graceMinutes: 15,
    halfDayHours: 4.5,
    fullDayHours: 8.5,
    isNightShift: true,
    applicableDepartments: ['Projects & Field Operations']
  }
];

export const INITIAL_POLICY_DOCUMENTS: any[] = [
  {
    id: 'pol-001',
    title: 'HVAC High-Pressure Nitrogen Testing & Safety Standard (550 PSI)',
    category: 'Safety & Site Protocols',
    version: 'v2.4 (2026)',
    effectiveDate: '2026-01-01',
    summary: 'Standard operating procedure for nitrogen pressure holding, safety barricades, digital gauge calibration, and relief valve checks.',
    fileSize: '2.4 MB PDF',
    isMandatoryAcknowledgment: true
  },
  {
    id: 'pol-002',
    title: 'Site Travel, Per-Diem & Boarding Policy (Metro & Non-Metro)',
    category: 'Travel & Per-Diem',
    version: 'v3.1 (2026)',
    effectiveDate: '2026-04-01',
    summary: 'Daily per-diem rates (₹1,200 for Metro / ₹800 for non-metro), fuel reimbursement rates (₹9/km for 4W, ₹4.5/km for 2W), hotel limits.',
    fileSize: '1.1 MB PDF',
    isMandatoryAcknowledgment: true
  },
  {
    id: 'pol-003',
    title: 'Prevention of Sexual Harassment (POSH) & Workplace Code of Conduct',
    category: 'Conduct & Ethics',
    version: 'v4.0 (2026)',
    effectiveDate: '2026-01-01',
    summary: 'Statutory compliance policy outlining POSH internal committee, grievance filing process, zero-tolerance clause, and investigation SLAs.',
    fileSize: '1.8 MB PDF',
    isMandatoryAcknowledgment: true
  },
  {
    id: 'pol-004',
    title: 'Statutory EPF, ESIC, Gratuity & Group Term Insurance Handbook',
    category: 'Statutory & Compliance',
    version: 'v2.0 (2026)',
    effectiveDate: '2026-01-01',
    summary: 'Overview of employee provident fund contributions, ESIC medical benefits, group medical coverage (₹5,00,000 family float), and gratuity norms.',
    fileSize: '3.2 MB PDF',
    isMandatoryAcknowledgment: false
  }
];

// 2. Employee Assets & Document Vault records
export const INITIAL_EMPLOYEE_ASSETS: any[] = [
  {
    id: 'ast-001',
    empId: 'emp-001',
    assetType: 'Laptop / PC',
    assetTag: 'AST-LTP-042',
    serialNumber: 'DL-LAT-7420-X89',
    allocatedDate: '2025-06-15',
    condition: 'Good',
    status: 'Allocated'
  },
  {
    id: 'ast-002',
    empId: 'emp-002',
    assetType: 'HVAC Multimeter / Micron Gauge',
    assetTag: 'AST-FLK-116',
    serialNumber: 'FLUKE-116-HVAC-9921',
    allocatedDate: '2025-08-01',
    condition: 'Brand New',
    status: 'Allocated'
  },
  {
    id: 'ast-003',
    empId: 'emp-002',
    assetType: 'Safety Harness & PPE Kit',
    assetTag: 'AST-PPE-018',
    serialNumber: 'KARAM-SH-PN56',
    allocatedDate: '2025-08-01',
    condition: 'Good',
    status: 'Allocated'
  },
  {
    id: 'ast-004',
    empId: 'emp-003',
    assetType: 'Laptop / PC',
    assetTag: 'AST-LTP-045',
    serialNumber: 'HP-ZBOOK-CAD-781',
    allocatedDate: '2025-09-10',
    condition: 'Brand New',
    status: 'Allocated'
  },
  {
    id: 'ast-005',
    empId: 'emp-001',
    assetType: 'Mobile Handset',
    assetTag: 'AST-MOB-012',
    serialNumber: 'SMP-A54-5G-9021',
    allocatedDate: '2025-01-10',
    returnDate: '2025-06-15',
    returnedDate: '2025-06-15',
    condition: 'Brand New',
    returnCondition: 'Good',
    status: 'Returned',
    returnRemarks: 'Returned on transition to corporate laptop. Accessories and charger verified intact.',
    receivedBy: 'Pooja Rao (HR Operations)'
  }
];

export const INITIAL_EMPLOYEE_DOCUMENTS: any[] = [
  {
    id: 'doc-001',
    empId: 'emp-001',
    docType: 'Aadhaar Card',
    fileName: 'Aadhaar_Shivender_Kumar.pdf',
    uploadDate: '2025-06-01',
    verificationStatus: 'Verified',
    verifiedBy: 'HR Admin (Pooja Rao)'
  },
  {
    id: 'doc-002',
    empId: 'emp-001',
    docType: 'PAN Card',
    fileName: 'PAN_AAAPK8921B.pdf',
    uploadDate: '2025-06-01',
    verificationStatus: 'Verified',
    verifiedBy: 'HR Admin (Pooja Rao)'
  },
  {
    id: 'doc-003',
    empId: 'emp-002',
    docType: 'Degree / Diploma Certificate',
    fileName: 'BTech_Mechanical_SunilMehta.pdf',
    uploadDate: '2025-07-28',
    verificationStatus: 'Verified',
    verifiedBy: 'HR Admin (Pooja Rao)'
  },
  {
    id: 'doc-004',
    empId: 'emp-002',
    docType: 'Appointment Letter',
    fileName: 'Signed_Appointment_Sunil_Mehta.pdf',
    uploadDate: '2025-08-01',
    verificationStatus: 'Verified',
    verifiedBy: 'HR Admin (Pooja Rao)'
  }
];

// 3. Onboarding Tasks
export const INITIAL_ONBOARDING_TASKS: any[] = [
  {
    id: 'onb-001',
    candidateId: 'cand-004',
    empName: 'Vikram Malhotra (Lead Project PM - Offered)',
    title: 'Statutory KYC Collection (Aadhaar, PAN, PF UAN & Bank Details)',
    department: 'HR',
    dueDate: '2026-09-05',
    status: 'Completed',
    completedAt: '2026-08-30'
  },
  {
    id: 'onb-002',
    candidateId: 'cand-004',
    empName: 'Vikram Malhotra (Lead Project PM - Offered)',
    title: 'Workstation Setup & AutoCAD/HAP License Allocation',
    department: 'IT Admin',
    dueDate: '2026-09-08',
    status: 'In Progress'
  },
  {
    id: 'onb-003',
    candidateId: 'cand-004',
    empName: 'Vikram Malhotra (Lead Project PM - Offered)',
    title: 'Site Safety Orientation & PPE Kit / Safety Harness Issuance',
    department: 'Site HSE Safety',
    dueDate: '2026-09-10',
    status: 'Pending'
  },
  {
    id: 'onb-004',
    candidateId: 'cand-004',
    empName: 'Vikram Malhotra (Lead Project PM - Offered)',
    title: 'Project Handover Briefing for Metro Grand VRV Site',
    department: 'Reporting Manager',
    dueDate: '2026-09-12',
    status: 'Pending'
  }
];

// 4. Attendance Regularizations
export const INITIAL_ATTENDANCE_REGULARIZATIONS: any[] = [
  {
    id: 'reg-001',
    empId: 'emp-002',
    empName: 'Sunil Mehta',
    empCode: 'ALP-002',
    date: '2026-08-28',
    punchType: 'Site Direct Visit',
    inTime: '08:15 AM',
    outTime: '06:45 PM',
    reason: 'Direct client site visit at Metro Grand Tower for Chiller pressure test observation. Could not punch at HQ biometric.',
    status: 'Approved',
    appliedDate: '2026-08-29',
    actionBy: 'Shivender Kumar (MD)'
  },
  {
    id: 'reg-002',
    empId: 'emp-003',
    empName: 'Rajesh Sharma',
    empCode: 'ALP-003',
    date: '2026-08-29',
    punchType: 'Client Meeting',
    inTime: '09:30 AM',
    outTime: '07:15 PM',
    reason: 'Attended pre-bid meeting at Apex Health Tower with MEP consultants until 7:00 PM.',
    status: 'Pending',
    appliedDate: '2026-08-30'
  },
  {
    id: 'reg-003',
    empId: 'emp-001',
    empName: 'Shivender Kumar',
    empCode: 'ALP-001',
    date: '2026-08-27',
    punchType: 'Vendor Negotiation',
    inTime: '08:30 AM',
    outTime: '06:00 PM',
    reason: 'Executive visit to Daikin Neemrana Manufacturing Facility for commercial VRV allocation.',
    status: 'Approved',
    appliedDate: '2026-08-28',
    actionBy: 'Board of Directors'
  },
  {
    id: 'reg-004',
    empId: 'emp-005',
    empName: 'Imran Khan',
    empCode: 'ALP-005',
    date: '2026-08-30',
    punchType: 'Site Commissioning',
    inTime: '07:45 AM',
    outTime: '08:30 PM',
    reason: 'Overnight nitrogen pressure leak testing on Bellandur IT Park copper piping.',
    status: 'Pending',
    appliedDate: '2026-08-31'
  }
];

// 8. Performance Management Appraisals
export const INITIAL_APPRAISAL_CYCLES: any[] = [
  {
    id: 'cyc-001',
    title: 'Annual Performance Appraisal Review FY 2025-26',
    period: 'FY 2025-26 (Annual)',
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    status: 'Active',
    totalEligible: 28,
    completedReviews: 19
  },
  {
    id: 'cyc-002',
    title: 'Mid-Year Project KRA Health Check Q2',
    period: 'Q2 FY 2026-27',
    startDate: '2026-09-15',
    endDate: '2026-10-15',
    status: 'Under Review',
    totalEligible: 28,
    completedReviews: 0
  }
];

export const INITIAL_EMPLOYEE_APPRAISALS: any[] = [
  {
    id: 'appr-001',
    cycleId: 'cyc-001',
    empId: 'emp-002',
    empCode: 'EMP-2025-002',
    empName: 'Sunil Mehta',
    designation: 'Senior Project Manager (HVAC)',
    department: 'Projects & Operations',
    reportingManager: 'Shivender Kumar (Managing Director)',
    selfRating: 4.5,
    managerRating: 4.7,
    finalRating: 4.6,
    kraScores: [
      {
        kraTitle: 'Project Timeline & Commissioning Speed',
        weightagePct: 35,
        selfScore: 4.5,
        managerScore: 4.8,
        comments: 'Delivered Apex Cleanroom AHU project 6 days ahead of schedule.'
      },
      {
        kraTitle: 'Gross Project Profit Margin Safeguarding',
        weightagePct: 25,
        selfScore: 4.2,
        managerScore: 4.5,
        comments: 'Maintained 24.2% margin against 21.5% target through strict copper scrap controls.'
      },
      {
        kraTitle: 'Site Safety Zero LTI (Lost Time Injury)',
        weightagePct: 20,
        selfScore: 5.0,
        managerScore: 5.0,
        comments: 'Zero safety incidents; 100% compliance with 550 PSI nitrogen testing norms.'
      },
      {
        kraTitle: 'Subcontractor Management & Joint Measurement',
        weightagePct: 20,
        selfScore: 4.3,
        managerScore: 4.4,
        comments: 'Rapid clearance of stage milestone bills with client PMC.'
      }
    ],
    keyAchievements: 'Successfully commissioned 1,200 TR VRV and Cleanroom AHU systems with zero customer punchlist items.',
    areasOfImprovement: 'Further mentor junior site engineers on digital micron vacuum logs.',
    trainingNeeds: ['Advanced Daikin VRV IV Diagnostics', 'PMP Project Scheduling in Primavera'],
    promotedTo: 'Associate Vice President (Operations)',
    recommendedIncrementPct: 15.5,
    status: 'Completed',
    submittedDate: '2026-08-25'
  },
  {
    id: 'appr-002',
    cycleId: 'cyc-001',
    empId: 'emp-003',
    empCode: 'EMP-2025-003',
    empName: 'Priya Mukherjee',
    designation: 'Chief Estimations Engineer',
    department: 'Engineering & Estimations',
    reportingManager: 'Shivender Kumar (Managing Director)',
    selfRating: 4.2,
    managerRating: 4.4,
    finalRating: 4.3,
    kraScores: [
      {
        kraTitle: 'Heat Load & Equipment Selection Precision',
        weightagePct: 35,
        selfScore: 4.5,
        managerScore: 4.6,
        comments: 'Heat load sizing perfectly aligned with ISHRAE guidelines.'
      },
      {
        kraTitle: 'Tender Turnaround Time (<48 hours)',
        weightagePct: 35,
        selfScore: 4.0,
        managerScore: 4.2,
        comments: 'Achieved 38-hour average turnaround on high-value commercial tenders.'
      },
      {
        kraTitle: 'BOQ Margin Optimization',
        weightagePct: 30,
        selfScore: 4.1,
        managerScore: 4.4,
        comments: 'Secured Tier-1 OEM bulk discounts saving 4.8% on compressor costs.'
      }
    ],
    keyAchievements: 'Generated ₹42 Crore in competitive commercial HVAC bids with a 28% bid-win ratio.',
    areasOfImprovement: 'Expand BIM Revit clash detection integration with architectural models.',
    trainingNeeds: ['Revit MEP BIM Level 3 Advanced Modeling', 'LEED Green Associate Certification'],
    promotedTo: 'Head of MEP Engineering & Estimations',
    recommendedIncrementPct: 14.0,
    status: 'Completed',
    submittedDate: '2026-08-26'
  }
];

// 9. Training & Talent Management
export const INITIAL_TRAINING_COURSES: any[] = [
  {
    id: 'trn-001',
    courseCode: 'TRN-HVAC-550',
    title: 'High-Pressure Nitrogen Leak Testing & Digital Vacuum Dehydration (<500 Microns)',
    category: 'HVAC Technical',
    durationHours: 12,
    trainerName: 'Vikram Singhania (HSE & QA Lead)',
    format: 'Classroom & Site Workshop',
    targetAudience: 'Site Engineers, Commissioning Technicians, Subcontractor Leads',
    totalEnrolled: 16,
    totalCompleted: 14,
    passingScorePct: 85,
    description: 'Comprehensive workshop covering manifold connections, 550 PSI holding safety protocols, temperature compensation formula, and two-stage vacuuming.',
    upcomingDate: '2026-09-12'
  },
  {
    id: 'trn-002',
    courseCode: 'TRN-VRV-COMM',
    title: 'Daikin & Voltas VRF Inverter Diagnostics, Error Code Rectification & BMS BACnet Integration',
    category: 'BMS & Controls',
    durationHours: 16,
    trainerName: 'External Master Specialist (ISHRAE Senior Faculty)',
    format: 'Hands-on Lab',
    targetAudience: 'Lead Commissioning Engineers & Testing Specialists',
    totalEnrolled: 12,
    totalCompleted: 10,
    passingScorePct: 90,
    description: 'Hands-on training in PCB diagnostics, EEV stepper motor checks, compressor inverter frequency analysis, and Modbus/BACnet gateway mapping.',
    upcomingDate: '2026-09-18'
  },
  {
    id: 'trn-003',
    courseCode: 'TRN-HSE-HEIGHT',
    title: 'Site Safety at Heights, Scaffolding Inspection & Electrical Lockout/Tagout (LOTO)',
    category: 'Site HSE & Safety',
    durationHours: 8,
    trainerName: 'National Safety Council Certified Safety Auditor',
    format: 'Classroom & Site Workshop',
    targetAudience: 'All Field Staff, Site Supervisors & Erectors',
    totalEnrolled: 24,
    totalCompleted: 22,
    passingScorePct: 100,
    description: 'Mandatory annual safety refresher for double lanyard harnesses, lifelines, scaffolding green tag inspection, and 415V 3-Phase LOTO procedures.',
    upcomingDate: '2026-09-25'
  }
];

export const INITIAL_SKILL_MATRICES: any[] = [
  {
    id: 'skl-001',
    empId: 'emp-002',
    empName: 'Sunil Mehta',
    designation: 'Senior Project Manager',
    department: 'Projects & Operations',
    skills: [
      { skillName: 'VRV Inverter Commissioning', category: 'Testing & Commissioning', proficiencyLevel: 4, certified: true },
      { skillName: 'Nitrogen 550 PSI Testing Protocol', category: 'Safety Compliance', proficiencyLevel: 4, certified: true },
      { skillName: 'Water Cooled Chiller Piping', category: 'Site Execution', proficiencyLevel: 4, certified: true },
      { skillName: 'Heat Load Carrier HAP Sizing', category: 'Technical Sizing', proficiencyLevel: 3, certified: false }
    ]
  },
  {
    id: 'skl-002',
    empId: 'emp-003',
    empName: 'Priya Mukherjee',
    designation: 'Chief Estimator',
    department: 'Engineering & Estimations',
    skills: [
      { skillName: 'Heat Load Carrier HAP Sizing', category: 'Technical Sizing', proficiencyLevel: 4, certified: true },
      { skillName: 'Revit MEP BIM Clash Detection', category: 'Technical Sizing', proficiencyLevel: 4, certified: true },
      { skillName: 'Ductulator Static Pressure Calculation', category: 'Technical Sizing', proficiencyLevel: 4, certified: true },
      { skillName: 'VRV Inverter Commissioning', category: 'Testing & Commissioning', proficiencyLevel: 2, certified: false }
    ]
  }
];

// 10. Travel, Expense & Benefits
export const INITIAL_TRAVEL_REQUESTS: any[] = [
  {
    id: 'trv-001',
    travelCode: 'TRV-2026-018',
    empId: 'emp-002',
    empName: 'Sunil Mehta',
    designation: 'Senior Project Manager',
    purpose: 'Client Site Commissioning',
    originCity: 'Mumbai HQ',
    destinationCity: 'Bengaluru (Bellandur Tech Park)',
    departureDate: '2026-09-02',
    returnDate: '2026-09-06',
    estimatedCost: 28500,
    perDiemAllowance: 6000,
    advanceRequested: 20000,
    status: 'Approved',
    approvedBy: 'Shivender Kumar (MD)'
  },
  {
    id: 'trv-002',
    travelCode: 'TRV-2026-019',
    empId: 'emp-003',
    empName: 'Priya Mukherjee',
    designation: 'Chief Estimator',
    purpose: 'Tender Survey & Kickoff',
    originCity: 'Mumbai HQ',
    destinationCity: 'Pune (Hinjawadi Phase 3)',
    departureDate: '2026-09-08',
    returnDate: '2026-09-09',
    estimatedCost: 8500,
    perDiemAllowance: 2400,
    advanceRequested: 5000,
    status: 'Submitted'
  }
];

export const INITIAL_EXPENSE_CLAIMS: any[] = [
  {
    id: 'exp-001',
    claimCode: 'EXP-2026-042',
    empId: 'emp-002',
    empName: 'Sunil Mehta',
    category: 'Site Fuel & Conveyance',
    amount: 3450,
    expenseDate: '2026-08-28',
    projectName: 'Metro Grand Tower Chiller Retrofit',
    description: 'Site visits across Mumbai Metro Line 1 sites (380 km round-trips with tools).',
    billAttached: true,
    receiptNumber: 'HPCL-FUEL-99120',
    status: 'Finance Reimbursed',
    approvedAmount: 3450
  },
  {
    id: 'exp-002',
    claimCode: 'EXP-2026-043',
    empId: 'emp-003',
    empName: 'Rajesh Sharma',
    category: 'Client Refreshments',
    amount: 1850,
    expenseDate: '2026-08-29',
    projectName: 'Apex Health Cleanroom HVAC',
    description: 'Pre-bid technical clarification meeting lunch with PMC consultants.',
    billAttached: true,
    receiptNumber: 'REST-BKC-7712',
    status: 'Manager Approved',
    approvedAmount: 1850
  },
  {
    id: 'exp-003',
    claimCode: 'EXP-2026-044',
    empId: 'emp-002',
    empName: 'Sunil Mehta',
    category: 'Emergency Site Hardware',
    amount: 4200,
    expenseDate: '2026-08-30',
    projectName: 'PRJ-2026-001 VRF Project',
    description: 'Emergency procurement of 550 PSI nitrogen high-pressure braided charging hose and brass flare nuts at local site market.',
    billAttached: true,
    receiptNumber: 'MKT-HARDW-5501',
    status: 'Submitted'
  },
  {
    id: 'exp-004',
    claimCode: 'EXP-2026-045',
    empId: 'emp-001',
    empName: 'Shivender Kumar',
    category: 'Client Business Development',
    amount: 5800,
    expenseDate: '2026-08-26',
    projectName: 'DLF CyberCity Expansion Proposal',
    description: 'Dinner meeting with DLF Chief Project Director & Lead MEP Consultant.',
    billAttached: true,
    receiptNumber: 'TAJ-CORP-3391',
    status: 'Finance Reimbursed',
    approvedAmount: 5800
  },
  {
    id: 'exp-005',
    claimCode: 'EXP-2026-046',
    empId: 'emp-004',
    empName: 'Ananya Roy',
    category: 'Statutory Filing Fees & Stamp Paper',
    amount: 2250,
    expenseDate: '2026-08-29',
    projectName: 'Corporate Finance & ROC Filings',
    description: 'Notary & non-judicial stamp papers for project bank guarantee submission.',
    billAttached: true,
    receiptNumber: 'GOV-E-STAMP-102',
    status: 'Submitted'
  },
  {
    id: 'exp-006',
    claimCode: 'EXP-2026-047',
    empId: 'emp-005',
    empName: 'Imran Khan',
    category: 'Site Safety Equipment',
    amount: 1950,
    expenseDate: '2026-08-31',
    projectName: 'Bellandur Tech Park VRV Site',
    description: 'Recharging of 2x dry chemical fire extinguishers for site brazing permit.',
    billAttached: true,
    receiptNumber: 'FIRE-SAFE-8821',
    status: 'Submitted'
  }
];

// 11. Grievance & Employee Relations
export const INITIAL_GRIEVANCE_TICKETS: any[] = [
  {
    id: 'grv-001',
    ticketNumber: 'GRV-2026-008',
    empId: 'emp-004',
    empName: 'Field Site Technician (Site Crew)',
    isAnonymous: false,
    category: 'Site Safety Issue',
    subject: 'Request for Heavy-Duty Safety Harnesses & Rigging Gloves at High-Rise Site',
    description: 'Current safety harness stock at Bellandur site has only 2 double lanyard sets. Need 4 additional sets for duct hanging at 18 meters height.',
    severity: 'High',
    status: 'Resolved',
    assignedTo: 'Vikram Singhania (HSE Lead)',
    createdAt: '2026-08-22',
    resolvedAt: '2026-08-24',
    resolutionSummary: 'Dispatched 6 new KARAM double-lanyard PPE safety kits directly to Bellandur site via express courier. Acknowledged by site engineer.'
  },
  {
    id: 'grv-002',
    ticketNumber: 'GRV-2026-009',
    isAnonymous: true,
    category: 'Compensation & Overtime',
    subject: 'Overtime Rate Clarification for Sunday Night Commissioning',
    description: 'Clarification requested regarding 2.0x overtime multiplier for night testing hours vs standard comp-off.',
    severity: 'Medium',
    status: 'Under Investigation',
    assignedTo: 'Shivender Kumar (MD / HR Head)',
    createdAt: '2026-08-27'
  }
];

// 12. HR Analytics & Workforce Planning
export const INITIAL_WORKFORCE_FORECASTS: any[] = [
  {
    id: 'wfp-001',
    quarter: 'Q3 FY 2026-27',
    department: 'Projects & Field Operations',
    currentHeadcount: 14,
    projectedDemand: 20,
    gapShortage: 6,
    keyDrivers: 'Award of Bengaluru 2,400 TR IT Park contract and Mumbai Metro Line Chiller retrofit requiring 2 new commissioning crews.',
    budgetAllocated: 4800000,
    hiringPriority: 'Critical'
  },
  {
    id: 'wfp-002',
    quarter: 'Q3 FY 2026-27',
    department: 'Engineering & Estimations',
    currentHeadcount: 6,
    projectedDemand: 8,
    gapShortage: 2,
    keyDrivers: 'Surge in hospital cleanroom tenders requiring specialized Revit MEP BIM draughtsman and HAP heat load engineer.',
    budgetAllocated: 1800000,
    hiringPriority: 'High'
  },
  {
    id: 'wfp-003',
    quarter: 'Q4 FY 2026-27',
    department: 'Quality Assurance & HSE Safety',
    currentHeadcount: 3,
    projectedDemand: 5,
    gapShortage: 2,
    keyDrivers: 'Mandatory on-site full-time HSE officers for Tier-1 corporate commercial client compliance.',
    budgetAllocated: 1200000,
    hiringPriority: 'Normal'
  }
];

export const INITIAL_BIOMETRIC_DEVICES: BiometricDevice[] = [
  {
    id: 'bio-001',
    name: 'HQ Main Entrance Turnstile [Gate A]',
    model: 'SilkBio-101TC Dual Biometric Terminal',
    brand: 'eSSL',
    deviceType: 'Biometric Fingerprint + Face',
    ipAddress: '192.168.1.210',
    port: 4370,
    serialNumber: 'eSSL-2026-HQ-01',
    location: 'Corporate HQ, MIDC Andheri East - Main Turnstile',
    connectionType: 'TCP/IP LAN',
    direction: 'Two-Way (In & Out)',
    commKey: '0',
    status: 'Online',
    lastSyncTime: '2026-08-30 09:15 AM',
    enrolledUsersCount: 42,
    totalPunchesLogged: 1280,
    autoSyncIntervalMinutes: 5,
    firmwareVersion: 'v4.2.1-build89'
  },
  {
    id: 'bio-002',
    name: 'BKC Project Site Cabin Terminal',
    model: 'uFace 800 Multi-Biometric Time Attendance',
    brand: 'ZKTeco',
    deviceType: 'Biometric Fingerprint + Face',
    ipAddress: '10.20.4.15',
    port: 4370,
    serialNumber: 'ZK-2026-BKC-02',
    location: 'BKC High-Rise Commercial Site - Site Office Cabin B',
    connectionType: 'Cloud Push API / Webhook',
    direction: 'Two-Way (In & Out)',
    commKey: 'zk_bkc_key_26',
    status: 'Online',
    lastSyncTime: '2026-08-30 09:20 AM',
    enrolledUsersCount: 18,
    totalPunchesLogged: 640,
    autoSyncIntervalMinutes: 15,
    firmwareVersion: 'v5.1.0-pro'
  },
  {
    id: 'bio-003',
    name: 'Turbhe Central Fabrication Yard Gate',
    model: 'COSEC VEGA Door Controller',
    brand: 'Matrix',
    deviceType: 'Fingerprint Scanner',
    ipAddress: '192.168.10.88',
    port: 5005,
    serialNumber: 'MX-2026-TRB-03',
    location: 'Turbhe Central Yard - Security Cabin Gate 1',
    connectionType: 'TCP/IP LAN',
    direction: 'Check-In Only',
    commKey: 'matrix_sec_2026',
    status: 'Online',
    lastSyncTime: '2026-08-30 08:55 AM',
    enrolledUsersCount: 25,
    totalPunchesLogged: 915,
    autoSyncIntervalMinutes: 15,
    firmwareVersion: 'v3.8.4'
  }
];

export const INITIAL_BIOMETRIC_PUNCH_LOGS: AttendancePunchLog[] = [
  // 2026-08-30 Punches
  {
    id: 'punch-001',
    empId: 'emp-001',
    empCode: 'ALP-001',
    empName: 'Shivender Kumar',
    timestamp: '2026-08-30T09:05:22',
    punchTime: '09:05:22 AM',
    date: '2026-08-30',
    punchType: 'Check-In',
    deviceId: 'bio-001',
    deviceName: 'HQ Main Entrance Turnstile [Gate A]',
    deviceLocation: 'Corporate HQ, MIDC Andheri East',
    verificationMode: 'Face Recognition',
    status: 'Verified'
  },
  {
    id: 'punch-002',
    empId: 'emp-001',
    empCode: 'ALP-001',
    empName: 'Shivender Kumar',
    timestamp: '2026-08-30T18:45:10',
    punchTime: '06:45:10 PM',
    date: '2026-08-30',
    punchType: 'Check-Out',
    deviceId: 'bio-001',
    deviceName: 'HQ Main Entrance Turnstile [Gate A]',
    deviceLocation: 'Corporate HQ, MIDC Andheri East',
    verificationMode: 'Face Recognition',
    status: 'Verified'
  },
  {
    id: 'punch-003',
    empId: 'emp-002',
    empCode: 'ALP-002',
    empName: 'Rakesh Mehra',
    timestamp: '2026-08-30T09:15:04',
    punchTime: '09:15:04 AM',
    date: '2026-08-30',
    punchType: 'Check-In',
    deviceId: 'bio-003',
    deviceName: 'Turbhe Central Fabrication Yard Gate',
    deviceLocation: 'Turbhe Central Yard',
    verificationMode: 'Fingerprint',
    status: 'Verified'
  },
  {
    id: 'punch-004',
    empId: 'emp-002',
    empCode: 'ALP-002',
    empName: 'Rakesh Mehra',
    timestamp: '2026-08-30T18:30:19',
    punchTime: '06:30:19 PM',
    date: '2026-08-30',
    punchType: 'Check-Out',
    deviceId: 'bio-003',
    deviceName: 'Turbhe Central Fabrication Yard Gate',
    deviceLocation: 'Turbhe Central Yard',
    verificationMode: 'Fingerprint',
    status: 'Verified'
  },
  {
    id: 'punch-005',
    empId: 'emp-003',
    empCode: 'ALP-003',
    empName: 'Rajesh Sharma',
    timestamp: '2026-08-30T09:45:33',
    punchTime: '09:45:33 AM',
    date: '2026-08-30',
    punchType: 'Check-In',
    deviceId: 'bio-002',
    deviceName: 'BKC Project Site Cabin Terminal',
    deviceLocation: 'BKC Site Office Cabin B',
    verificationMode: 'Fingerprint',
    status: 'Verified'
  },
  {
    id: 'punch-006',
    empId: 'emp-003',
    empCode: 'ALP-003',
    empName: 'Rajesh Sharma',
    timestamp: '2026-08-30T19:15:42',
    punchTime: '07:15:42 PM',
    date: '2026-08-30',
    punchType: 'Check-Out',
    deviceId: 'bio-002',
    deviceName: 'BKC Project Site Cabin Terminal',
    deviceLocation: 'BKC Site Office Cabin B',
    verificationMode: 'Fingerprint',
    status: 'Verified'
  },
  {
    id: 'punch-007',
    empId: 'emp-004',
    empCode: 'ALP-004',
    empName: 'Priya Mukherjee',
    timestamp: '2026-08-30T09:10:11',
    punchTime: '09:10:11 AM',
    date: '2026-08-30',
    punchType: 'Check-In',
    deviceId: 'bio-001',
    deviceName: 'HQ Main Entrance Turnstile [Gate A]',
    deviceLocation: 'Corporate HQ, MIDC Andheri East',
    verificationMode: 'Face Recognition',
    status: 'Verified'
  },
  {
    id: 'punch-008',
    empId: 'emp-004',
    empCode: 'ALP-004',
    empName: 'Priya Mukherjee',
    timestamp: '2026-08-30T18:15:55',
    punchTime: '06:15:55 PM',
    date: '2026-08-30',
    punchType: 'Check-Out',
    deviceId: 'bio-001',
    deviceName: 'HQ Main Entrance Turnstile [Gate A]',
    deviceLocation: 'Corporate HQ, MIDC Andheri East',
    verificationMode: 'Face Recognition',
    status: 'Verified'
  },
  {
    id: 'punch-009',
    empId: 'emp-005',
    empCode: 'ALP-005',
    empName: 'Imran Khan',
    timestamp: '2026-08-30T08:45:00',
    punchTime: '08:45:00 AM',
    date: '2026-08-30',
    punchType: 'Check-In',
    deviceId: 'bio-003',
    deviceName: 'Turbhe Central Fabrication Yard Gate',
    deviceLocation: 'Turbhe Central Yard',
    verificationMode: 'RFID Card',
    status: 'Verified'
  },
  {
    id: 'punch-010',
    empId: 'emp-005',
    empCode: 'ALP-005',
    empName: 'Imran Khan',
    timestamp: '2026-08-30T17:45:30',
    punchTime: '05:45:30 PM',
    date: '2026-08-30',
    punchType: 'Check-Out',
    deviceId: 'bio-003',
    deviceName: 'Turbhe Central Fabrication Yard Gate',
    deviceLocation: 'Turbhe Central Yard',
    verificationMode: 'RFID Card',
    status: 'Verified'
  },
  {
    id: 'punch-011',
    empId: 'emp-007',
    empCode: 'ALP-007',
    empName: 'Vikram Sundaram',
    timestamp: '2026-08-30T08:30:15',
    punchTime: '08:30:15 AM',
    date: '2026-08-30',
    punchType: 'Check-In',
    deviceId: 'bio-002',
    deviceName: 'BKC Project Site Cabin Terminal',
    deviceLocation: 'BKC Site Office Cabin B',
    verificationMode: 'Fingerprint',
    status: 'Verified'
  },
  {
    id: 'punch-012',
    empId: 'emp-007',
    empCode: 'ALP-007',
    empName: 'Vikram Sundaram',
    timestamp: '2026-08-30T19:00:28',
    punchTime: '07:00:28 PM',
    date: '2026-08-30',
    punchType: 'Check-Out',
    deviceId: 'bio-002',
    deviceName: 'BKC Project Site Cabin Terminal',
    deviceLocation: 'BKC Site Office Cabin B',
    verificationMode: 'Fingerprint',
    status: 'Verified'
  }
];

