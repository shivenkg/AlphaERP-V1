import React from 'react';
import { ReportFooterConfig, ReportStylingConfig, SystemSettings } from '../../types';
import { Landmark, ShieldCheck, CheckCircle2, Award } from 'lucide-react';

export interface DocumentFooterProps {
  footerConfig: ReportFooterConfig;
  stylingConfig?: ReportStylingConfig;
  settings?: SystemSettings;
  customTerms?: string[];
  customNotes?: string;
  clientOrVendorName?: string;
  companyNameOverride?: string;
  primarySignatoryOverride?: string;
  secondarySignatoryOverride?: string;
  signedAtDate?: string;
  isApproved?: boolean;
  pageNumber?: number;
  totalPages?: number;
}

export const DocumentFooter: React.FC<DocumentFooterProps> = ({
  footerConfig,
  stylingConfig,
  settings,
  customTerms,
  customNotes,
  clientOrVendorName,
  companyNameOverride,
  primarySignatoryOverride,
  secondarySignatoryOverride,
  signedAtDate,
  isApproved = true,
  pageNumber = 1,
  totalPages = 1
}) => {
  const companyName = companyNameOverride || settings?.companyName || 'ALPHA HVAC SOLUTIONS & ENGINEERING SERVICES LTD';
  const termsList = customTerms && customTerms.length > 0 ? customTerms : footerConfig.termsAndConditions;
  const displayNotes = customNotes || footerConfig.customNotes;

  const bankBeneficiary = settings?.bankBeneficiaryName || companyName;
  const bankName = settings?.bankName || 'HDFC Bank Ltd';
  const bankBranch = settings?.bankBranch || 'MIDC Andheri East, Mumbai';
  const bankAccount = settings?.bankAccountNumber || '50200039912044';
  const bankIfsc = settings?.bankIfscCode || 'HDFC0000128';
  const upiId = settings?.upiVpaId || 'alphaerp@hdfcbank';

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200 text-xs text-slate-700">
      {/* Terms & Conditions and Bank Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Commercial / Statutory Terms */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>{footerConfig.termsHeading || 'Commercial Terms & Conditions:'}</span>
          </div>
          {termsList && termsList.length > 0 ? (
            <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside leading-relaxed">
              {termsList.map((term, idx) => (
                <li key={idx}>{term}</li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-slate-500 italic">Standard commercial milestones apply.</p>
          )}

          {displayNotes && (
            <div className="pt-2 border-t border-slate-200 text-[11px]">
              <span className="font-bold text-slate-800">{footerConfig.customNotesHeading || 'Notes:'}</span>{' '}
              <span className="text-slate-600">{displayNotes}</span>
            </div>
          )}
        </div>

        {/* Right Column: Bank Details & Remittance (If Enabled) */}
        {footerConfig.showBankDetails ? (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-blue-600" />
              <span>{footerConfig.bankDetailsHeading || 'Bank Details for Electronic Remittance:'}</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-700">
              <div>
                <span className="text-slate-500">Beneficiary:</span> <strong>{bankBeneficiary}</strong>
              </div>
              <div>
                <span className="text-slate-500">Bank & Branch:</span> <strong>{bankName} {bankBranch ? `(${bankBranch})` : ''}</strong>
              </div>
              <div>
                <span className="text-slate-500">Account No (Current):</span> <strong className="font-mono text-slate-900">{bankAccount}</strong>
              </div>
              <div>
                <span className="text-slate-500">IFSC Code:</span> <strong className="font-mono text-slate-900">{bankIfsc}</strong>
              </div>
              {upiId && (
                <div>
                  <span className="text-slate-500">UPI VPA:</span> <strong className="font-mono text-indigo-700">{upiId}</strong>
                </div>
              )}
              {footerConfig.customBankInstructions && (
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 leading-snug">
                  {footerConfig.customBankInstructions}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="text-[10px] font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>{footerConfig.declarationHeading || 'Engineering & Quality Commitment:'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {footerConfig.declarationText ||
                'All equipment and installation workflows strictly comply with ASHRAE standards, National Building Code (NBC), and OEM engineering guidelines.'}
            </p>
          </div>
        )}
      </div>

      {/* Declaration Clause Banner (If Enabled and bank details are shown) */}
      {footerConfig.showDeclaration && footerConfig.showBankDetails && (
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
          <div className="font-bold text-emerald-900 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {footerConfig.declarationHeading || 'Quality & Compliance Declaration'}
          </div>
          <p className="text-slate-700 text-[11px] leading-relaxed">
            {footerConfig.declarationText}
          </p>
        </div>
      )}

      {/* Signatures & Seal Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3 border-t border-slate-200">
        {/* Primary Company Signatory */}
        <div className="space-y-4">
          <div className="text-xs text-slate-600">
            For <strong className="text-slate-900">{companyName}</strong>
          </div>

          <div className="pt-6 border-t border-dashed border-slate-400 flex justify-between items-end">
            <div>
              <div className="font-bold text-slate-900 text-xs">
                {primarySignatoryOverride || footerConfig.primarySignatoryTitle}
              </div>
              <div className="text-[10px] text-slate-500">
                {footerConfig.primarySignatorySubtitle}
              </div>
            </div>

            {footerConfig.showDigitalSeal ? (
              <div className="text-right">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-300">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {footerConfig.digitalSealText || 'AlphaERP Verified'}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  {signedAtDate || 'System Verified'}
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 font-mono">Seal & Signature</div>
            )}
          </div>
        </div>

        {/* Secondary / Client Signatory */}
        <div className="space-y-4">
          <div className="text-xs text-slate-600">
            {clientOrVendorName ? (
              <>
                Accepted by <strong className="text-slate-900">{clientOrVendorName}</strong>
              </>
            ) : (
              <span>Client / Vendor Acceptance</span>
            )}
          </div>

          <div className="pt-6 border-t border-dashed border-slate-400 flex justify-between items-end">
            <div>
              <div className="font-bold text-slate-900 text-xs">
                {secondarySignatoryOverride || footerConfig.secondarySignatoryTitle || 'Authorized Client Signatory'}
              </div>
              <div className="text-[10px] text-slate-500">
                {footerConfig.secondarySignatorySubtitle || 'Signature & Corporate Seal'}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Date: {signedAtDate ? new Date().toLocaleDateString() : '____________'}
            </div>
          </div>
        </div>
      </div>

      {/* Footnote & Page Numbering */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
        <div>{footerConfig.confidentialityNotice}</div>
        {footerConfig.showPageNumbers && (
          <div className="font-mono font-medium text-slate-500">
            {footerConfig.pageNumberFormat === 'page_x_of_y'
              ? `Page ${pageNumber} of ${totalPages}`
              : footerConfig.pageNumberFormat === 'page_x'
              ? `Page ${pageNumber}`
              : `${pageNumber}/${totalPages}`}
          </div>
        )}
      </div>
    </div>
  );
};
