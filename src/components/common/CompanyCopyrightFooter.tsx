import React from 'react';
import { ShieldCheck, ExternalLink, Award, Sparkles, Building2, Lock, FileCheck } from 'lucide-react';
import { JSAlphaSoftCompanyLogo, AtmosAirconLogo } from '../JSAlphaSoftLogo';

interface CompanyCopyrightFooterProps {
  onNavigate?: (tab: string) => void;
  className?: string;
}

export const CompanyCopyrightFooter: React.FC<CompanyCopyrightFooterProps> = ({
  onNavigate,
  className = ''
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="company-copyright-disclaimer-footer"
      className={`mt-10 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-xs ${className}`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        {/* Official Brand Mark & Legal Entity Identity */}
        <div className="flex items-center gap-3.5 text-left w-full md:w-auto">
          <div className="shrink-0 p-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-xs">
            <JSAlphaSoftCompanyLogo size="md" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 font-mono uppercase tracking-wider">
                Corporate Principal
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 font-mono uppercase tracking-wider flex items-center gap-1">
                <FileCheck className="w-2.5 h-2.5" />
                Licensed Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              HVAC Biz&trade; &bull; Enterprise Techno-Commercial, Heat Load Engineering &amp; Multi-Tier Procurement Suite
            </p>
          </div>
        </div>

        {/* Quick Jump Module Navigation */}
        {onNavigate && (
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap text-xs text-slate-600 dark:text-slate-300 w-full md:w-auto justify-start md:justify-end">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              Executive Dashboard
            </button>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <button
              onClick={() => onNavigate('crm')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              CRM
            </button>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <button
              onClick={() => onNavigate('quotes')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              Quotes
            </button>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <button
              onClick={() => onNavigate('projects')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              BOQ
            </button>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <button
              onClick={() => onNavigate('sales')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              Sales Performance
            </button>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <button
              onClick={() => onNavigate('finance')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              Finance
            </button>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <button
              onClick={() => onNavigate('hr')}
              className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              HRMS
            </button>
          </div>
        )}
      </div>

      {/* Official Copyright Statement & Legal Entity Notice */}
      <div className="pt-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        <div className="flex items-center gap-1.5 flex-wrap">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Copyright &copy; {currentYear} JS AlphaSoft Pvt. Ltd.
          </span>
          <span>All rights reserved.</span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">&bull;</span>
          <span>HVAC Biz&trade; and AlphaERP&trade; are proprietary trademarks of JS AlphaSoft Pvt. Ltd.</span>
        </div>

        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tight shrink-0 flex items-center gap-1.5">
          <Lock className="w-2.5 h-2.5 text-blue-500" />
          <span>CIN: U72200MH2023PTC409812 &bull; ISO 27001 &bull; SOC-2 Type II</span>
        </div>
      </div>

      {/* Official Legal & Intellectual Property Disclaimer */}
      <div className="mt-2.5 text-[10px] text-slate-500 dark:text-slate-400 text-left leading-normal border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Legal Disclaimer:</span> This software application, source code, predictive inventory models, sizing algorithms, and database structures are authored and deployed on behalf of <strong className="text-slate-700 dark:text-slate-200">JS AlphaSoft Pvt. Ltd.</strong> No part of this software, documentation, or design may be reproduced, decompiled, distributed, or transmitted in any form or by any means without the prior written consent of JS AlphaSoft Pvt. Ltd.
      </div>
    </footer>
  );
};
