import { ChartOfAccount, JournalVoucher, TDSRecord } from '../types';

export const INITIAL_CHART_OF_ACCOUNTS: ChartOfAccount[] = [
  // 1. Assets
  {
    id: 'coa-1010',
    accountCode: '1010',
    accountName: 'HDFC Current Operating Bank A/c',
    type: 'Bank & Cash',
    subCategory: 'Bank Accounts',
    balance: 8450200,
    openingBalance: 5200000,
    description: 'Primary corporate operating account for vendor disbursements & client receipts',
    isSystemAccount: true
  },
  {
    id: 'coa-1020',
    accountCode: '1020',
    accountName: 'ICICI Escrow & Client Project A/c',
    type: 'Bank & Cash',
    subCategory: 'Bank Accounts',
    balance: 4120000,
    openingBalance: 3000000,
    description: 'Project milestone escrow account',
    isSystemAccount: false
  },
  {
    id: 'coa-1050',
    accountCode: '1050',
    accountName: 'Petty Cash & Site Imprest',
    type: 'Bank & Cash',
    subCategory: 'Cash in Hand',
    balance: 145000,
    openingBalance: 100000,
    description: 'Site supervisor petty cash for local transit, consumable fasteners, crane diesel',
    isSystemAccount: true
  },
  {
    id: 'coa-1100',
    accountCode: '1100',
    accountName: 'Accounts Receivable (Trade Debtors)',
    type: 'Accounts Receivable',
    subCategory: 'Trade Debtors',
    balance: 24700862,
    openingBalance: 18500000,
    description: 'Pending client milestone and progress invoices',
    isSystemAccount: true
  },
  {
    id: 'coa-1200',
    accountCode: '1200',
    accountName: 'HVAC Warehouse Stock Valuation',
    type: 'Inventory Asset',
    subCategory: 'Current Assets',
    balance: 15420000,
    openingBalance: 12100000,
    description: 'Raw copper, insulation, AHU units, valves, refrigerants in central warehouse',
    isSystemAccount: true
  },
  {
    id: 'coa-1300',
    accountCode: '1300',
    accountName: 'GST Input Tax Credit (ITC - Electronic Ledger)',
    type: 'Current Asset',
    subCategory: 'Duties & Taxes',
    balance: 1984250,
    openingBalance: 1250000,
    description: 'Accumulated GST paid on vendor purchases available for setoff',
    isSystemAccount: true
  },
  {
    id: 'coa-1500',
    accountCode: '1500',
    accountName: 'Site Tools, Vacuum Pumps & Nitrogen Rigs',
    type: 'Fixed Asset',
    subCategory: 'Fixed Assets',
    balance: 3200000,
    openingBalance: 3500000,
    description: 'Mechanical vacuum dehydrators, brazing kits, digital manifolds, flaring tools',
    isSystemAccount: false
  },

  // 2. Liabilities & Equity
  {
    id: 'coa-2010',
    accountCode: '2010',
    accountName: 'Accounts Payable (Trade Creditors)',
    type: 'Accounts Payable',
    subCategory: 'Trade Creditors',
    balance: 18450000,
    openingBalance: 14200000,
    description: 'Vendor bills due for OEM equipment, copper pipes, GI sheets, insulation',
    isSystemAccount: true
  },
  {
    id: 'coa-2100',
    accountCode: '2100',
    accountName: 'GST Output Liability (CGST + SGST + IGST)',
    type: 'Statutory Liability',
    subCategory: 'Duties & Taxes',
    balance: 3120500,
    openingBalance: 2100000,
    description: 'GST collected on customer invoices to be remitted after ITC setoff',
    isSystemAccount: true
  },
  {
    id: 'coa-2150',
    accountCode: '2150',
    accountName: 'TDS Payable (Contractors Sec 194C / Professional Sec 194J)',
    type: 'Statutory Liability',
    subCategory: 'Duties & Taxes',
    balance: 284300,
    openingBalance: 190000,
    description: 'TDS deducted from vendor and subcontractor payments due for govt deposit',
    isSystemAccount: true
  },
  {
    id: 'coa-2200',
    accountCode: '2200',
    accountName: 'EPF / ESIC Statutory Payable',
    type: 'Statutory Liability',
    subCategory: 'Payroll Dues',
    balance: 165400,
    openingBalance: 155000,
    description: 'Provident fund and ESIC monthly contributions for payroll deposit',
    isSystemAccount: true
  },
  {
    id: 'coa-3000',
    accountCode: '3000',
    accountName: 'Share Capital & Retained Earnings',
    type: 'Equity & Capital',
    subCategory: 'Capital Account',
    balance: 25000000,
    openingBalance: 25000000,
    description: 'Promoter equity and accumulated retained profits',
    isSystemAccount: true
  },

  // 3. Direct Revenue & COGS
  {
    id: 'coa-4010',
    accountCode: '4010',
    accountName: 'HVAC Turnkey Contracting Revenue',
    type: 'Direct Revenue',
    subCategory: 'Operating Revenue',
    balance: 48950000,
    openingBalance: 0,
    description: 'Revenue from awarded VRV, Chiller, and Ducting contract billings',
    isSystemAccount: true
  },
  {
    id: 'coa-4020',
    accountCode: '4020',
    accountName: 'HVAC Annual Maintenance (AMC) & Service Fees',
    type: 'Direct Revenue',
    subCategory: 'Service Revenue',
    balance: 4250000,
    openingBalance: 0,
    description: 'Quarterly and annual chiller/VRV preventative maintenance contracts',
    isSystemAccount: false
  },
  {
    id: 'coa-5010',
    accountCode: '5010',
    accountName: 'Cost of Materials (VRV/Chiller/Ducting/Pipes)',
    type: 'Direct Cost (COGS)',
    subCategory: 'Direct Project Costs',
    balance: 31200000,
    openingBalance: 0,
    description: 'Direct procurement of HVAC equipment, copper, valves, insulation, sheets',
    isSystemAccount: true
  },
  {
    id: 'coa-5020',
    accountCode: '5020',
    accountName: 'Site Labor & Subcontracting Erection Charges',
    type: 'Direct Cost (COGS)',
    subCategory: 'Direct Project Costs',
    balance: 5400000,
    openingBalance: 0,
    description: 'Duct fabrication labor, copper brazing teams, scaffolding & lifting crane rentals',
    isSystemAccount: true
  },

  // 4. Indirect Operating Expenses
  {
    id: 'coa-6010',
    accountCode: '6010',
    accountName: 'Employee Salaries & Payroll Costs',
    type: 'Indirect Expense',
    subCategory: 'Personnel Cost',
    balance: 4850000,
    openingBalance: 0,
    description: 'Engineers, estimators, project managers, warehouse & finance payroll',
    isSystemAccount: true
  },
  {
    id: 'coa-6020',
    accountCode: '6020',
    accountName: 'Office Rent & Warehouse Facility Leases',
    type: 'Indirect Expense',
    subCategory: 'Administrative Expenses',
    balance: 1440000,
    openingBalance: 0,
    description: 'MIDC Andheri HQ and Bhiwandi central storage yard lease rentals',
    isSystemAccount: false
  },
  {
    id: 'coa-6030',
    accountCode: '6030',
    accountName: 'Sales Commission & Business Development',
    type: 'Indirect Expense',
    subCategory: 'Selling Expenses',
    balance: 850000,
    openingBalance: 0,
    description: 'Sales incentive payout and consultant presentation seminars',
    isSystemAccount: false
  },
  {
    id: 'coa-6040',
    accountCode: '6040',
    accountName: 'Logistics, Freight & Local Site Transport',
    type: 'Indirect Expense',
    subCategory: 'Freight & Transport',
    balance: 620000,
    openingBalance: 0,
    description: 'Trailer transport for chillers, tempos for copper pipes and ducting sheets',
    isSystemAccount: false
  }
];

export const INITIAL_JOURNAL_VOUCHERS: JournalVoucher[] = [
  {
    id: 'jv-001',
    voucherNumber: 'JV-2026-081',
    voucherDate: '2026-08-28',
    voucherType: 'Sales Invoice',
    referenceNumber: 'INV-2026-0043-1',
    referenceType: 'Quote / Project',
    totalAmount: 3263229,
    entries: [
      {
        id: 'e-1',
        accountId: 'coa-1100',
        accountCode: '1100',
        accountName: 'Accounts Receivable (Trade Debtors)',
        debit: 3263229,
        credit: 0,
        narration: 'Debit Nexus Tech Park for 30% Advance Invoice'
      },
      {
        id: 'e-2',
        accountId: 'coa-4010',
        accountCode: '4010',
        accountName: 'HVAC Turnkey Contracting Revenue',
        debit: 0,
        credit: 2765448,
        narration: 'Contracting Revenue recognized'
      },
      {
        id: 'e-3',
        accountId: 'coa-2100',
        accountCode: '2100',
        accountName: 'GST Output Liability (CGST + SGST + IGST)',
        debit: 0,
        credit: 497781,
        narration: '18% GST on mobilization advance'
      }
    ],
    narration: 'Being 30% mobilization advance invoice raised on Nexus Infinity Tech Park for Project PRJ-2026-001.',
    status: 'Posted',
    createdBy: 'Ananya Roy (Finance Head)',
    createdAt: '2026-08-28T16:00:00Z'
  },
  {
    id: 'jv-002',
    voucherNumber: 'JV-2026-082',
    voucherDate: '2026-08-29',
    voucherType: 'Purchase Bill',
    referenceNumber: 'BILL-DKN-8891',
    referenceType: 'Purchase Order',
    totalAmount: 5186320,
    entries: [
      {
        id: 'e-4',
        accountId: 'coa-5010',
        accountCode: '5010',
        accountName: 'Cost of Materials (VRV/Chiller/Ducting/Pipes)',
        debit: 4395186,
        credit: 0,
        narration: 'Purchase of 5x VRV Outdoor and 22x Cassette Units'
      },
      {
        id: 'e-5',
        accountId: 'coa-1300',
        accountCode: '1300',
        accountName: 'GST Input Tax Credit (ITC - Electronic Ledger)',
        debit: 791134,
        credit: 0,
        narration: '18% Input Tax Credit claimable'
      },
      {
        id: 'e-6',
        accountId: 'coa-2010',
        accountCode: '2010',
        accountName: 'Accounts Payable (Trade Creditors)',
        debit: 0,
        credit: 5186320,
        narration: 'Credit Daikin Airconditioning India Pvt Ltd'
      }
    ],
    narration: 'Being vendor bill booked against PO-2026-014 for Daikin VRV equipment.',
    status: 'Posted',
    createdBy: 'Ananya Roy',
    createdAt: '2026-08-29T10:30:00Z'
  },
  {
    id: 'jv-003',
    voucherNumber: 'JV-2026-083',
    voucherDate: '2026-08-29',
    voucherType: 'Payment',
    referenceNumber: 'NEFT-HDFC-9912',
    referenceType: 'Vendor Payment',
    totalAmount: 2000000,
    entries: [
      {
        id: 'e-7',
        accountId: 'coa-2010',
        accountCode: '2010',
        accountName: 'Accounts Payable (Trade Creditors)',
        debit: 2000000,
        credit: 0,
        narration: 'Advance payment to Daikin for equipment release'
      },
      {
        id: 'e-8',
        accountId: 'coa-1010',
        accountCode: '1010',
        accountName: 'HDFC Current Operating Bank A/c',
        debit: 0,
        credit: 2000000,
        narration: 'Bank RTGS transfer ref # HDFC99881122'
      }
    ],
    narration: 'Being RTGS disbursement made to Daikin India against PO-2026-014 proforma.',
    status: 'Posted',
    createdBy: 'Shivender Kumar',
    createdAt: '2026-08-29T14:15:00Z'
  },
  {
    id: 'jv-004',
    voucherNumber: 'JV-2026-084',
    voucherDate: '2026-08-30',
    voucherType: 'Receipt',
    referenceNumber: 'NEFT-NX-44120',
    referenceType: 'Client Receipt',
    totalAmount: 3263229,
    entries: [
      {
        id: 'e-9',
        accountId: 'coa-1010',
        accountCode: '1010',
        accountName: 'HDFC Current Operating Bank A/c',
        debit: 3263229,
        credit: 0,
        narration: 'Funds received from Nexus Infinity Tech Park'
      },
      {
        id: 'e-10',
        accountId: 'coa-1100',
        accountCode: '1100',
        accountName: 'Accounts Receivable (Trade Debtors)',
        debit: 0,
        credit: 3263229,
        narration: 'Settlement against Invoice INV-2026-0043-1'
      }
    ],
    narration: 'Being full payment receipt received for Nexus Tech Park HVAC mobilization milestone.',
    status: 'Posted',
    createdBy: 'Ananya Roy (Finance Head)',
    createdAt: '2026-08-30T11:45:00Z'
  },
  {
    id: 'jv-005',
    voucherNumber: 'JV-2026-085',
    voucherDate: '2026-08-30',
    voucherType: 'Journal',
    referenceNumber: 'PAY-AUG-2026',
    referenceType: 'Payroll Register',
    totalAmount: 1856250,
    entries: [
      {
        id: 'e-11',
        accountId: 'coa-6010',
        accountCode: '6010',
        accountName: 'Employee Salary & Wages Cost',
        debit: 1856250,
        credit: 0,
        narration: 'Gross Salary cost for August 2026 across 28 staff'
      },
      {
        id: 'e-12',
        accountId: 'coa-2200',
        accountCode: '2200',
        accountName: 'TDS Payable (Section 192/194C/194J)',
        debit: 0,
        credit: 206250,
        narration: 'TDS withheld under Section 192'
      },
      {
        id: 'e-13',
        accountId: 'coa-2010',
        accountCode: '2010',
        accountName: 'Accounts Payable (Trade Creditors)',
        debit: 0,
        credit: 1650000,
        narration: 'Net salaries payable to staff bank accounts'
      }
    ],
    narration: 'Being August 2026 monthly corporate payroll provision booked per biometric HR register.',
    status: 'Posted',
    createdBy: 'Ananya Roy',
    createdAt: '2026-08-30T17:30:00Z'
  },
  {
    id: 'jv-006',
    voucherNumber: 'JV-2026-086',
    voucherDate: '2026-08-31',
    voucherType: 'Contra',
    referenceNumber: 'CHQ-HDFC-00918',
    referenceType: 'Bank Contra',
    totalAmount: 100000,
    entries: [
      {
        id: 'e-14',
        accountId: 'coa-1050',
        accountCode: '1050',
        accountName: 'Petty Cash & Site Imprest',
        debit: 100000,
        credit: 0,
        narration: 'Cash drawn from HDFC for site imprest replenishment'
      },
      {
        id: 'e-15',
        accountId: 'coa-1010',
        accountCode: '1010',
        accountName: 'HDFC Current Operating Bank A/c',
        debit: 0,
        credit: 100000,
        narration: 'Cheque # 00918 encashed for site imprest'
      }
    ],
    narration: 'Being monthly petty cash imprest fund replenishment for HVAC site supervisors.',
    status: 'Posted',
    createdBy: 'Shivender Kumar',
    createdAt: '2026-08-31T09:15:00Z'
  },
  {
    id: 'jv-007',
    voucherNumber: 'JV-2026-087',
    voucherDate: '2026-08-31',
    voucherType: 'Sales Invoice',
    referenceNumber: 'AMC-INV-2026-112',
    referenceType: 'Quote / Project',
    totalAmount: 472000,
    entries: [
      {
        id: 'e-16',
        accountId: 'coa-1100',
        accountCode: '1100',
        accountName: 'Accounts Receivable (Trade Debtors)',
        debit: 472000,
        credit: 0,
        narration: 'Debit Apollo Hospitals for Annual Comprehensive Maintenance Contract'
      },
      {
        id: 'e-17',
        accountId: 'coa-4020',
        accountCode: '4020',
        accountName: 'HVAC Annual Maintenance (AMC) Services',
        debit: 0,
        credit: 400000,
        narration: 'Quarterly AMC Service Billing'
      },
      {
        id: 'e-18',
        accountId: 'coa-2100',
        accountCode: '2100',
        accountName: 'GST Output Liability (CGST + SGST + IGST)',
        debit: 0,
        credit: 72000,
        narration: '18% GST on AMC Services'
      }
    ],
    narration: 'Being Q2 preventive maintenance and filter replacement invoice raised on Apollo Multispecialty.',
    status: 'Posted',
    createdBy: 'Ananya Roy',
    createdAt: '2026-08-31T12:00:00Z'
  }
];

export const INITIAL_TDS_RECORDS: TDSRecord[] = [
  {
    id: 'tds-001',
    deducteeName: 'Speedy Duct Erectors & Contractors',
    deducteePan: 'AABFS4433K',
    deducteeType: 'Individual / Contractor',
    section: '194C',
    ratePct: 2,
    paymentAmount: 850000,
    tdsDeducted: 17000,
    deductDate: '2026-08-15',
    challanNumber: 'CH-2026-08-01',
    bsrCode: '0510012',
    depositDate: '2026-08-20',
    quarter: 'Q2',
    status: 'Deposited'
  },
  {
    id: 'tds-002',
    deducteeName: 'Apex MEP Consultants & Acoustic Labs',
    deducteePan: 'AABCA9911L',
    deducteeType: 'Professional',
    section: '194J',
    ratePct: 10,
    paymentAmount: 420000,
    tdsDeducted: 42000,
    deductDate: '2026-08-22',
    challanNumber: undefined,
    depositDate: undefined,
    quarter: 'Q2',
    status: 'Deducted'
  },
  {
    id: 'tds-003',
    deducteeName: 'MIDC Andheri Commercial Space Owner (Rent)',
    deducteePan: 'AAAPG8822M',
    deducteeType: 'Individual / Contractor',
    section: '194I',
    ratePct: 10,
    paymentAmount: 180000,
    tdsDeducted: 18000,
    deductDate: '2026-08-01',
    challanNumber: 'CH-2026-08-02',
    bsrCode: '0510012',
    depositDate: '2026-08-07',
    quarter: 'Q2',
    status: 'Deposited'
  },
  {
    id: 'tds-004',
    deducteeName: 'Monthly Employee Salaries Group (Section 192)',
    deducteePan: 'AABCA1299K',
    deducteeType: 'Company',
    section: '192',
    ratePct: 12.5,
    paymentAmount: 1650000,
    tdsDeducted: 206250,
    deductDate: '2026-08-30',
    challanNumber: undefined,
    depositDate: undefined,
    quarter: 'Q2',
    status: 'Deducted'
  }
];
