import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  X,
  UserPlus,
  ShoppingCart,
  Receipt,
  ChevronRight,
  Zap,
  Sparkles
} from 'lucide-react';

interface QuickActionFloatingButtonProps {
  onOpenNewLead: () => void;
  onOpenNewPR: () => void;
  onOpenNewExpense: () => void;
  className?: string;
  isInline?: boolean;
}

export const QuickActionFloatingButton: React.FC<QuickActionFloatingButtonProps> = ({
  onOpenNewLead,
  onOpenNewPR,
  onOpenNewExpense,
  className = '',
  isInline = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleAction = (callback: () => void) => {
    setIsOpen(false);
    callback();
  };

  return (
    <div
      ref={containerRef}
      className={
        isInline
          ? `relative inline-block ${className}`
          : `fixed bottom-6 right-6 z-40 ${className}`
      }
    >
      {/* Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Quick Action Options"
          className="absolute bottom-16 right-0 mb-1 w-80 sm:w-84 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-3 z-50 space-y-1.5 animate-in fade-in slide-in-from-bottom-3 duration-150 backdrop-blur-md"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Quick Actions
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Add records on the fly from any page
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action 1: New HVAC Lead */}
          <button
            type="button"
            onClick={() => handleAction(onOpenNewLead)}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-blue-50/70 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    New Lead
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    CRM
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  Capture inquiry, client details & site survey
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
          </button>

          {/* Action 2: New Purchase Requisition (PR) */}
          <button
            type="button"
            onClick={() => handleAction(onOpenNewPR)}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-amber-50/70 dark:hover:bg-amber-950/40 border border-transparent hover:border-amber-200 dark:hover:border-amber-800 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    New PR
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                    Procurement
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  Requisition copper pipes, valves, or hardware
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors shrink-0" />
          </button>

          {/* Action 3: New Expense Log */}
          <button
            type="button"
            onClick={() => handleAction(onOpenNewExpense)}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    New Expense Log
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                    Finance
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  Log site conveyance, fuel, hotel, or emergency buys
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0" />
          </button>
        </div>
      )}

      {/* Trigger Floating Action Button */}
      <button
        type="button"
        id="quick-action-floating-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Quick Action: Create New Lead, New PR, or New Expense Log"
        className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all cursor-pointer border border-white/20"
      >
        <div
          className={`transition-transform duration-300 ${
            isOpen ? 'rotate-45' : 'group-hover:scale-110'
          }`}
        >
          <Plus className="w-5 h-5 text-white" />
        </div>
        <span className="text-xs tracking-wide select-none font-semibold">
          Quick Action
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-300/40 animate-pulse" />
      </button>
    </div>
  );
};
