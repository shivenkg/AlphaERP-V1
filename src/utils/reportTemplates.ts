import { ReportTemplateConfig, ReportType, SystemSettings } from '../types';

export const DEFAULT_REPORT_TEMPLATES: Record<ReportType, ReportTemplateConfig> = {
  invoice: {
    id: 'invoice',
    name: 'Tax Invoice & Final Handover Bill',
    description: 'Commercial tax billing, progress milestone claims, and project handover clearance certificates',
    header: {
      documentTitle: 'TAX INVOICE & COMPLETION BILL',
      documentSubtitle: 'Final Commercial Handover & Turnkey HVAC Execution Invoice',
      divisionName: 'HVAC & MEP Engineering Contracting Division',
      logoStyle: 'left_brand',
      accentColor: '#059669', // Emerald
      showGstin: true,
      showPan: true,
      showCin: true,
      showIsoCert: true,
      isoCertText: 'ISO 9001:2015 Quality Certified',
      showSacCode: true,
      sacCodeText: 'SAC Code: 995461 (HVAC Services)',
      showAddress: true,
      showContactInfo: true,
      showDocMetaBox: true,
      metaBoxStyle: 'rounded_cards'
    },
    footer: {
      termsHeading: 'Statutory & Commercial Terms:',
      termsAndConditions: [
        'Payment terms as per agreed contract milestone schedule.',
        'Interest @ 18% per annum will be charged on overdue payments beyond due date.',
        'Title to all equipment & goods supplied remains with company until full settlement.',
        'Subject to local municipal jurisdiction. E. & O.E.'
      ],
      customNotesHeading: 'Commercial Remittance Note:',
      customNotes: 'Please reference the invoice number in your NEFT/RTGS payment transfer remarks.',
      showBankDetails: true,
      bankDetailsHeading: 'Electronic Fund Remittance (NEFT / RTGS / IMPS):',
      customBankInstructions: 'Kindly remit payment directly to our corporate current account as detailed above.',
      showDeclaration: true,
      declarationHeading: 'Testing & Commissioning Certification:',
      declarationText: 'We hereby certify that the HVAC turnkey installation has undergone thorough pneumatic pressure testing, vacuum dehydration, and operational balancing in accordance with approved engineering drawings.',
      primarySignatoryTitle: 'Authorized Financial Signatory',
      primarySignatorySubtitle: 'Accounts & Billing Controller',
      secondarySignatoryTitle: 'Client Representative Acceptance',
      secondarySignatorySubtitle: 'Site Facility / Project Head',
      showDigitalSeal: true,
      digitalSealText: 'AlphaERP Digitally Verified',
      confidentialityNotice: 'This is a computer-generated tax invoice generated via AlphaERP. Generated for official commercial accounting.',
      showPageNumbers: true,
      pageNumberFormat: 'page_x_of_y'
    },
    styling: {
      fontArchetype: 'sans_modern',
      layoutDensity: 'standard',
      watermarkText: '',
      tableHeaderBgColor: '#F8FAFC',
      tableBorderColor: '#E2E8F0'
    }
  },

  po: {
    id: 'po',
    name: 'Purchase Order (PO)',
    description: 'Vendor procurement orders for HVAC chillers, VRF units, copper, ducts, and site materials',
    header: {
      documentTitle: 'OFFICIAL PURCHASE ORDER',
      documentSubtitle: 'Authorized Procurement Order & Vendor Supply Agreement',
      divisionName: 'Procurement & Supply Chain Management',
      logoStyle: 'left_brand',
      accentColor: '#2563EB', // Blue
      showGstin: true,
      showPan: true,
      showCin: true,
      showIsoCert: true,
      isoCertText: 'ISO 9001:2015 Certified System',
      showSacCode: false,
      sacCodeText: 'HSN / SAC Class 1',
      showAddress: true,
      showContactInfo: true,
      showDocMetaBox: true,
      metaBoxStyle: 'rounded_cards'
    },
    footer: {
      termsHeading: 'Terms & Conditions of Procurement:',
      termsAndConditions: [
        'Consignment must be accompanied by original delivery challan, commercial invoice, and OEM test certificates.',
        'Materials are subject to strict QA inspection at destination site prior to offloading clearance.',
        'Transit insurance and secure packaging are the vendor’s responsibility unless explicitly waived.',
        'Payment will be processed in accordance with approved milestone terms upon Goods Receipt Note (GRN) verification.'
      ],
      customNotesHeading: 'Vendor Delivery & Site Notes:',
      customNotes: 'Notify site supervisor 24 hours in advance of freight arrival for forklift & unloading gate pass.',
      showBankDetails: false,
      bankDetailsHeading: 'Remittance Reference:',
      customBankInstructions: '',
      showDeclaration: true,
      declarationHeading: 'Procurement Authorization Declaration:',
      declarationText: 'This purchase order represents a legally binding agreement for the supply of specified materials according to approved HVAC technical schedules.',
      primarySignatoryTitle: 'Authorized Procurement Head',
      primarySignatorySubtitle: 'Head of Supply Chain & Contracts',
      secondarySignatoryTitle: 'Vendor Acceptance & Confirmation',
      secondarySignatorySubtitle: 'Authorized Commercial Signatory',
      showDigitalSeal: true,
      digitalSealText: 'AlphaERP Procurement Sign-off',
      confidentialityNotice: 'Confidential commercial document intended exclusively for the named vendor. AlphaERP Supply Chain Engine.',
      showPageNumbers: true,
      pageNumberFormat: 'page_x_of_y'
    },
    styling: {
      fontArchetype: 'sans_modern',
      layoutDensity: 'standard',
      watermarkText: '',
      tableHeaderBgColor: '#F8FAFC',
      tableBorderColor: '#E2E8F0'
    }
  },

  pr: {
    id: 'pr',
    name: 'Purchase Requisition (PR)',
    description: 'Internal site material indents, shortage requisitions, and engineering indent requests',
    header: {
      documentTitle: 'INTERNAL MATERIAL REQUISITION',
      documentSubtitle: 'HVAC Engineering Indent & Material Sourcing Request',
      divisionName: 'Project Engineering & Site Execution Division',
      logoStyle: 'left_brand',
      accentColor: '#4F46E5', // Indigo
      showGstin: true,
      showPan: false,
      showCin: false,
      showIsoCert: true,
      isoCertText: 'Internal Operations Protocol',
      showSacCode: false,
      sacCodeText: '',
      showAddress: true,
      showContactInfo: true,
      showDocMetaBox: true,
      metaBoxStyle: 'rounded_cards'
    },
    footer: {
      termsHeading: 'Requisition & Indent Guidelines:',
      termsAndConditions: [
        'Requisition raised against verified Bill of Quantities (BOQ) and site shortage schedule.',
        'Minimum 2 comparative vendor quotes required for all requisitions exceeding threshold limit.',
        'Delivery timelines must align with active site milestone deadlines.'
      ],
      customNotesHeading: 'Engineering Application Notes:',
      customNotes: 'Direct site delivery required with test certificates.',
      showBankDetails: false,
      bankDetailsHeading: '',
      customBankInstructions: '',
      showDeclaration: true,
      declarationHeading: 'Site Verification & Justification:',
      declarationText: 'The requisitioning engineer confirms that the quantities and specifications above match site requirements without excess inventory buildup.',
      primarySignatoryTitle: 'Site In-Charge / Project Engineer',
      primarySignatorySubtitle: 'Requisitioning Officer',
      secondarySignatoryTitle: 'Procurement Manager Sign-off',
      secondarySignatorySubtitle: 'Approved for PO Generation',
      showDigitalSeal: true,
      digitalSealText: 'AlphaERP Indent Verified',
      confidentialityNotice: 'Internal AlphaERP document. Not for external vendor circulation.',
      showPageNumbers: true,
      pageNumberFormat: 'page_x_of_y'
    },
    styling: {
      fontArchetype: 'sans_modern',
      layoutDensity: 'compact',
      watermarkText: 'INTERNAL USE ONLY',
      tableHeaderBgColor: '#F8FAFC',
      tableBorderColor: '#E2E8F0'
    }
  },

  quotation: {
    id: 'quotation',
    name: 'Techno-Commercial Quotation',
    description: 'Client proposals, turnkey HVAC estimates, equipment BOQ schedules, and commercial contract bids',
    header: {
      documentTitle: 'TECHNO-COMMERCIAL QUOTATION',
      documentSubtitle: 'Turnkey Centralized HVAC, VRF/VRV & Precision Engineering Proposal',
      divisionName: 'HVAC & MEP Turnkey Solutions Division',
      logoStyle: 'left_brand',
      accentColor: '#0066E0', // Sapphire Blue
      showGstin: true,
      showPan: true,
      showCin: true,
      showIsoCert: true,
      isoCertText: 'ISO 9001:2015 Certified Organization',
      showSacCode: true,
      sacCodeText: 'SAC Code: 995461 (HVAC Services)',
      showAddress: true,
      showContactInfo: true,
      showDocMetaBox: true,
      metaBoxStyle: 'rounded_cards'
    },
    footer: {
      termsHeading: 'Commercial Terms & Conditions:',
      termsAndConditions: [
        'Payment Terms: 30% Advance with Purchase Order, 40% against Equipment Delivery, 20% on Erection, 10% on Handover.',
        'Warranty: 12 Months comprehensive warranty on all installations against manufacturing defects.',
        'Validity: Proposal remains valid for 30 days from date of issue.',
        'Taxes: GST @ 18% extra as per statutory norms.',
        'Client Scope: Unhindered power, water, and secure storage space to be provided at site by client free of cost.',
        'Exclusions: Structural civil work, core cutting exceeding 100mm, and main electrical breaker panels unless itemized.'
      ],
      customNotesHeading: 'Bank Details for Advance Remittance:',
      customNotes: 'A/c Name: Atmos Aircon Pvt Ltd • Bank: HDFC Bank • A/c: 50200049281729 • IFSC: HDFC0000240',
      showBankDetails: true,
      bankDetailsHeading: 'Direct Bank Remittance Instructions (RTGS / NEFT):',
      customBankInstructions: 'Please wire advance payment quoting Quotation Reference # to enable immediate material ordering.',
      showDeclaration: true,
      declarationHeading: 'Proposal Acceptance & Handover Commitment:',
      declarationText: 'We trust our techno-commercial proposal meets your project requirements. To proceed, please return a signed copy or issue an official Purchase Order.',
      primarySignatoryTitle: 'Authorized HVAC Sales Engineer',
      primarySignatorySubtitle: 'HVAC & MEP Commercial Division',
      secondarySignatoryTitle: 'Client Acceptance & Work Order Sign-Off',
      secondarySignatorySubtitle: 'Authorized Client Signatory & Seal',
      showDigitalSeal: true,
      digitalSealText: 'AlphaERP Commercial Sign-off',
      confidentialityNotice: 'Commercial proposal proprietary to Atmos Aircon Pvt Ltd. Subject to standard contract terms.',
      showPageNumbers: true,
      pageNumberFormat: 'page_x_of_y'
    },
    styling: {
      fontArchetype: 'sans_modern',
      layoutDensity: 'standard',
      watermarkText: '',
      tableHeaderBgColor: '#F8FAFC',
      tableBorderColor: '#E2E8F0'
    }
  },

  workorder: {
    id: 'workorder',
    name: 'Work Order & Field Service Ticket',
    description: 'Field service tickets, preventive HVAC maintenance logs, technician dispatch, and site breakdowns',
    header: {
      documentTitle: 'FIELD SERVICE & MAINTENANCE WORK ORDER',
      documentSubtitle: 'HVAC Preventive Service, Breakdown Repair & Operational Log',
      divisionName: 'Field Services & Operations Engineering',
      logoStyle: 'left_brand',
      accentColor: '#D97706', // Amber
      showGstin: true,
      showPan: false,
      showCin: false,
      showIsoCert: true,
      isoCertText: 'ISO 9001:2015 Service Standard',
      showSacCode: true,
      sacCodeText: 'SAC: 995461 Maintenance',
      showAddress: true,
      showContactInfo: true,
      showDocMetaBox: true,
      metaBoxStyle: 'rounded_cards'
    },
    footer: {
      termsHeading: 'Service & Maintenance Conditions:',
      termsAndConditions: [
        'Site in-charge signature required upon completion of all itemized inspection steps.',
        'Consumable spares used must be cross-checked against standard service rates.',
        'Emergency response SLA: 4 hours from breakdown ticket creation.'
      ],
      customNotesHeading: 'Service Protocol Remarks:',
      customNotes: 'Lockout/Tagout (LOTO) safety protocol strictly mandatory before servicing high-voltage VRF units.',
      showBankDetails: false,
      bankDetailsHeading: '',
      customBankInstructions: '',
      showDeclaration: true,
      declarationHeading: 'Field Service Completion Certification:',
      declarationText: 'The technician confirms that all service checks, refrigerant leak checks, and filter sanitizations were performed safely.',
      primarySignatoryTitle: 'Lead Field HVAC Technician',
      primarySignatorySubtitle: 'Field Operations Division',
      secondarySignatoryTitle: 'Client Facility Manager Sign-off',
      secondarySignatorySubtitle: 'Site Representative Confirmation',
      showDigitalSeal: true,
      digitalSealText: 'AlphaERP Field Verified',
      confidentialityNotice: 'Official Field Service Record generated via AlphaERP Field Operations.',
      showPageNumbers: true,
      pageNumberFormat: 'page_x_of_y'
    },
    styling: {
      fontArchetype: 'sans_modern',
      layoutDensity: 'standard',
      watermarkText: '',
      tableHeaderBgColor: '#F8FAFC',
      tableBorderColor: '#E2E8F0'
    }
  }
};

/**
 * Resolves the effective template with fallbacks to systemSettings
 */
export function getResolvedReportTemplate(
  template: ReportTemplateConfig,
  settings: SystemSettings
): ReportTemplateConfig {
  if (!template) {
    return DEFAULT_REPORT_TEMPLATES.invoice;
  }

  return {
    ...template,
    header: {
      ...template.header,
      companyName: template.header.companyName || settings.companyName || 'ALPHA HVAC SOLUTIONS & ENGINEERING SERVICES LTD',
      tagline: template.header.tagline || settings.tagline || 'Licensed HVAC Turnkey Contractor & VRF Integrator',
      customAddress: template.header.customAddress || settings.hqAddress,
      customContactPhone: template.header.customContactPhone || settings.supportPhone,
      customContactEmail: template.header.customContactEmail || settings.supportEmail
    },
    footer: {
      ...template.footer,
      termsAndConditions: template.footer.termsAndConditions?.length
        ? template.footer.termsAndConditions
        : [settings.defaultPaymentTerms || 'Standard Payment Terms']
    }
  };
}
