import { SeriesDefinition } from '../types';

export const DEFAULT_NUMBER_SERIES: SeriesDefinition[] = [
  {
    id: 'employee',
    entityName: 'Employee Profile (Employee Code)',
    prefix: 'EM',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Auto-generated unique employee code on staff onboarding (e.g. 26-EM-0001)',
    isActive: true
  },
  {
    id: 'pr',
    entityName: 'Purchase Requisition (PR)',
    prefix: 'PR',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Material procurement requisition generated from BOQ shortage or ad-hoc indent',
    isActive: true
  },
  {
    id: 'po',
    entityName: 'Purchase Order (PO)',
    prefix: 'PO',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Vendor commercial purchase order issued for HVAC equipment & material replenishment',
    isActive: true
  },
  {
    id: 'product',
    entityName: 'Product Item / SKU Master',
    prefix: 'SK',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Item Master catalogue SKU number for VRF units, chillers, ducts, copper & valves',
    isActive: true
  },
  {
    id: 'invoice',
    entityName: 'Tax Invoice / Billing Record',
    prefix: 'IN',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Client progressive milestone tax billing and vendor payment vouchers',
    isActive: true
  },
  {
    id: 'grn',
    entityName: 'Goods Receipt Note (GRN)',
    prefix: 'GR',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Inward warehouse goods receipt note generated when stock arrives against PO',
    isActive: true
  },
  {
    id: 'lead',
    entityName: 'CRM HVAC Lead',
    prefix: 'LD',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Client commercial enquiry and pipeline opportunity tracking series',
    isActive: true
  },
  {
    id: 'quote',
    entityName: 'Quotation / Estimation',
    prefix: 'QT',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Engineering heat load estimation and formal client techno-commercial quote',
    isActive: true
  },
  {
    id: 'project',
    entityName: 'Project & Site Order',
    prefix: 'PJ',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Awarded engineering site execution project & master BOQ reference',
    isActive: true
  },
  {
    id: 'workorder',
    entityName: 'Field Service Work Order',
    prefix: 'WO',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Field engineer technician dispatch for maintenance, repair, or commissioning',
    isActive: true
  },
  {
    id: 'client',
    entityName: 'Client / Customer Master',
    prefix: 'CL',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Unique corporate client account identifier',
    isActive: true
  },
  {
    id: 'vendor',
    entityName: 'Vendor / Supplier Master',
    prefix: 'VN',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Approved equipment OEM, distributor, or subcontractor vendor code',
    isActive: true
  },
  {
    id: 'voucher',
    entityName: 'Journal / GL Voucher',
    prefix: 'JV',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'General ledger double-entry debit/credit financial transaction voucher',
    isActive: true
  },
  {
    id: 'job_req',
    entityName: 'Job Requisition / Recruitment Indent',
    prefix: 'JR',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'KRA-linked talent vacancy indent for engineering and corporate staff',
    isActive: true
  },
  {
    id: 'cost_center',
    entityName: 'Cost Center Master',
    prefix: 'CC',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Departmental budget and project cost center accounting code',
    isActive: true
  },
  {
    id: 'department',
    entityName: 'Department Master',
    prefix: 'DP',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Organizational division and business unit code',
    isActive: true
  },
  {
    id: 'asset',
    entityName: 'Company Asset Master',
    prefix: 'AS',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'IT and physical equipment enterprise asset tag identifier',
    isActive: true
  },
  {
    id: 'grievance',
    entityName: 'Employee Grievance Ticket',
    prefix: 'GV',
    separator: '-',
    paddingDigits: 4,
    currentSequence: 1,
    includeYear: true,
    yearDigits: 2,
    yearPosition: 'prefix',
    customPattern: '{YY}-{PREFIX}-{SEQ}',
    description: 'Confidential staff grievance ticketing and resolution code',
    isActive: true
  }
];

/**
 * Generates the formatted number string based on a SeriesDefinition
 */
export function formatSeriesNumber(
  series: SeriesDefinition,
  sequenceOverride?: number,
  customYear?: number
): string {
  const fullYear = customYear || new Date().getFullYear();
  const yy = fullYear.toString().slice(-2); // e.g. "26" for 2026
  const yyyy = fullYear.toString(); // e.g. "2026"
  const seqNum = sequenceOverride !== undefined ? sequenceOverride : series.currentSequence;
  const seqPadded = (seqNum || 1).toString().padStart(series.paddingDigits || 4, '0');
  const prefix = (series.prefix || '').trim().toUpperCase();
  const sep = series.separator !== undefined ? series.separator : '-';

  // If a customPattern is provided and non-empty, use template tokens
  if (series.customPattern && series.customPattern.trim().length > 0) {
    let result = series.customPattern
      .replace(/\{YY\}/g, yy)
      .replace(/\{YYYY\}/g, yyyy)
      .replace(/\{PREFIX\}/g, prefix)
      .replace(/\{SEP\}/g, sep)
      .replace(/\{SEQ\}/g, seqPadded);
    return result;
  }

  // Default behavior: Initial 2 digits represent the Year last 2 digits (e.g. 26-EMP-0001)
  if (series.includeYear !== false) {
    const yearStr = (series.yearDigits === 4 ? yyyy : yy);
    if (series.yearPosition === 'suffix') {
      return `${prefix}${sep}${seqPadded}${sep}${yearStr}`;
    } else if (series.yearPosition === 'after_prefix') {
      return `${prefix}${sep}${yearStr}${sep}${seqPadded}`;
    } else {
      // Default: Initial 2 digits (Year at very beginning)
      return `${yearStr}${sep}${prefix}${sep}${seqPadded}`;
    }
  }

  return `${prefix}${sep}${seqPadded}`;
}

/**
 * Live preview generator for UI tables and inputs
 */
export function previewSeriesNumber(series: SeriesDefinition): string {
  return formatSeriesNumber(series, series.currentSequence);
}
