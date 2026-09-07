import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  moduleName?: string;
}

export function ViewLoadingFallback({ moduleName }: Props) {
  return (
    <div className="h-full min-h-[420px] w-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-2xs">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
        Loading {moduleName ? `${moduleName} Module` : 'Enterprise Workspace'}...
      </div>
      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
        AlphaERP Secure Data Pipeline
      </div>
    </div>
  );
}
