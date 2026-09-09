import React from 'react';
import { AtmosAirconLogo } from '../JSAlphaSoftLogo';
import { ReportHeaderConfig, ReportStylingConfig, SystemSettings } from '../../types';
import { ShieldCheck, Calendar, FileText, Building2, Tag } from 'lucide-react';

export interface DocumentMetaField {
  label: string;
  value: string | React.ReactNode;
  isHighlight?: boolean;
}

export interface DocumentHeaderProps {
  headerConfig: ReportHeaderConfig;
  stylingConfig?: ReportStylingConfig;
  settings?: SystemSettings;
  documentTypeLabel?: string;
  documentNumber: string;
  documentDate: string;
  secondaryDateLabel?: string;
  secondaryDateValue?: string;
  statusBadge?: {
    text: string;
    colorClass?: string;
  };
  projectRef?: string;
  extraMetaFields?: DocumentMetaField[];
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  headerConfig,
  stylingConfig,
  settings,
  documentNumber,
  documentDate,
  secondaryDateLabel,
  secondaryDateValue,
  statusBadge,
  projectRef,
  extraMetaFields = []
}) => {
  const companyName = headerConfig.companyName || settings?.companyName || 'ALPHA HVAC SOLUTIONS & ENGINEERING SERVICES LTD';
  const tagline = headerConfig.tagline || settings?.tagline || 'Licensed HVAC Class-1 Engineering Contractor & VRF Turnkey Integrator';
  const address = headerConfig.customAddress || settings?.hqAddress || 'Tech Park Tower B, 4th Floor, MIDC Andheri East, Mumbai 400093';
  const phone = headerConfig.customContactPhone || settings?.supportPhone || '+91 98200 11223';
  const email = headerConfig.customContactEmail || settings?.supportEmail || 'contact@alphaerp.com';
  const website = headerConfig.customWebsite || 'www.hvacbiz.com';
  const gstin = settings?.gstin || '27AABCA1299K1Z4';
  const pan = settings?.pan || 'AABCA1299K';
  const cin = settings?.cin || 'U29190MH2018PLC312984';

  const accentColor = headerConfig.accentColor || '#0066E0';

  const renderLogo = () => {
    return (
      <div className="flex items-center gap-2.5 shrink-0">
        <AtmosAirconLogo size="md" variant="icon" />
        <div>
          <div className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1 uppercase">
            <span style={{ color: accentColor }}>HVAC</span>
            <span>Biz</span>
          </div>
          {headerConfig.divisionName && (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {headerConfig.divisionName}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRegistrationBadges = () => {
    const badges: { label: string; value: string }[] = [];
    if (headerConfig.showGstin && gstin) badges.push({ label: 'GSTIN', value: gstin });
    if (headerConfig.showPan && pan) badges.push({ label: 'PAN', value: pan });
    if (headerConfig.showCin && cin) badges.push({ label: 'CIN', value: cin });
    if (headerConfig.showSacCode && headerConfig.sacCodeText) badges.push({ label: 'SAC/HSN', value: headerConfig.sacCodeText });

    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-mono">
        {badges.map((b, idx) => (
          <React.Fragment key={idx}>
            <span>
              <strong className="font-semibold text-slate-700">{b.label}:</strong> {b.value}
            </span>
            {idx < badges.length - 1 && <span className="text-slate-300">•</span>}
          </React.Fragment>
        ))}
        {headerConfig.showIsoCert && headerConfig.isoCertText && (
          <>
            {badges.length > 0 && <span className="text-slate-300">•</span>}
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              {headerConfig.isoCertText}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Accent Color Bar */}
      <div
        className="h-1.5 w-full rounded-full"
        style={{ backgroundColor: accentColor }}
      />

      {/* Main Header Row */}
      {headerConfig.logoStyle === 'center_brand' ? (
        <div className="text-center space-y-2 border-b-2 border-slate-900 pb-5">
          <div className="flex justify-center">{renderLogo()}</div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">
            {companyName}
          </h1>
          <p className="text-[11px] text-slate-600 max-w-2xl mx-auto">{tagline}</p>
          {headerConfig.showAddress && (
            <p className="text-[10px] text-slate-500">{address}</p>
          )}
          {renderRegistrationBadges()}

          {/* Document Title Banner */}
          <div
            className="inline-block px-4 py-1.5 rounded-lg text-white font-black text-xs uppercase tracking-wider mt-2"
            style={{ backgroundColor: accentColor }}
          >
            {headerConfig.documentTitle}
          </div>
          {headerConfig.documentSubtitle && (
            <div className="text-[11px] text-slate-500 font-medium">{headerConfig.documentSubtitle}</div>
          )}
        </div>
      ) : (
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
          {/* Left Brand & Corporate Identity */}
          <div className="space-y-1.5 max-w-xl">
            {renderLogo()}
            <div className="text-xs font-bold text-slate-800 tracking-tight">{companyName}</div>
            <p className="text-[11px] text-slate-600 leading-snug">{tagline}</p>
            {headerConfig.showAddress && (
              <p className="text-[10px] text-slate-500 leading-relaxed">{address}</p>
            )}
            {headerConfig.showContactInfo && (
              <div className="flex flex-wrap gap-x-3 text-[10px] text-slate-500">
                <span>Tel: {phone}</span>
                <span>•</span>
                <span>Email: {email}</span>
                <span>•</span>
                <span>Web: {website}</span>
              </div>
            )}
            {renderRegistrationBadges()}
          </div>

          {/* Right Document Meta Box */}
          {headerConfig.showDocMetaBox && (
            <div
              className={`text-left sm:text-right p-3.5 rounded-xl border min-w-[220px] w-full sm:w-auto space-y-1.5 ${
                headerConfig.metaBoxStyle === 'accent_border'
                  ? 'bg-white border-l-4'
                  : 'bg-slate-50 border-slate-200'
              }`}
              style={{
                borderLeftColor: headerConfig.metaBoxStyle === 'accent_border' ? accentColor : undefined
              }}
            >
              <div
                className="text-[11px] font-black uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                {headerConfig.documentTitle}
              </div>
              {headerConfig.documentSubtitle && (
                <div className="text-[10px] text-slate-500 font-medium leading-tight">
                  {headerConfig.documentSubtitle}
                </div>
              )}

              <div className="pt-1 border-t border-slate-200 space-y-0.5 text-xs">
                <div className="font-mono font-black text-slate-900 text-sm">
                  {documentNumber}
                </div>
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Date:</span> {documentDate}
                </div>

                {secondaryDateLabel && secondaryDateValue && (
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">{secondaryDateLabel}:</span> {secondaryDateValue}
                  </div>
                )}

                {projectRef && (
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Project:</span>{' '}
                    <span className="font-mono font-medium">{projectRef}</span>
                  </div>
                )}

                {extraMetaFields.map((field, idx) => (
                  <div key={idx} className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">{field.label}:</span> {field.value}
                  </div>
                ))}

                {statusBadge && (
                  <div className="pt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        statusBadge.colorClass || 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {statusBadge.text}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
