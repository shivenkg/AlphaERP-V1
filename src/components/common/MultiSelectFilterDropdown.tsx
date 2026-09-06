import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Filter } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  count?: number;
  badgeColor?: string;
  avatar?: string;
  icon?: React.ElementType;
}

export interface MultiSelectFilterDropdownProps {
  label: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  icon?: React.ElementType;
  className?: string;
  id?: string;
}

export const MultiSelectFilterDropdown: React.FC<MultiSelectFilterDropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'All',
  icon: Icon = Filter,
  className = '',
  id = 'multi-select-filter'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside or ESC key pressed
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const allSelected = options.length > 0 && selectedValues.length === options.length;
  const isNoneSelected = selectedValues.length === 0;

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const selectAll = () => {
    onChange(options.map((o) => o.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  const getButtonText = () => {
    if (isNoneSelected) return placeholder;
    if (allSelected) return `All (${options.length})`;
    if (selectedValues.length === 1) {
      const match = options.find((o) => o.value === selectedValues[0]);
      return match ? match.label : '1 selected';
    }
    return `${selectedValues.length} Selected`;
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none ${
          !isNoneSelected && !allSelected
            ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/80 shadow-xs'
            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{label}:</span>
          <span className="font-bold truncate max-w-[130px]">{getButtonText()}</span>
        </div>

        {!isNoneSelected && !allSelected && (
          <span className="flex items-center justify-center w-4.5 h-4.5 text-[10px] font-bold rounded-full bg-blue-600 text-white shrink-0">
            {selectedValues.length}
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-2 divide-y divide-slate-100 dark:divide-slate-800 text-xs animate-in fade-in zoom-in-95 duration-150">
          {/* Header Controls */}
          <div className="px-3 py-1.5 flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
              Filter by {label}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer hover:underline"
              >
                All
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer hover:underline"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5 px-1">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              const OptionIcon = option.icon;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleOption(option.value)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {/* Custom Checkbox */}
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    {/* Avatar if exists */}
                    {option.avatar && (
                      <img
                        src={option.avatar}
                        alt={option.label}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                    )}

                    {/* Icon if exists */}
                    {OptionIcon && (
                      <OptionIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                    )}

                    {/* Label */}
                    <span className="truncate text-xs font-medium">{option.label}</span>
                  </div>

                  {/* Badge or Count */}
                  <div className="flex items-center gap-1 shrink-0">
                    {option.badgeColor && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${option.badgeColor}`}>
                        {option.label}
                      </span>
                    )}
                    {typeof option.count === 'number' && (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                        {option.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active selections footer pills */}
          {!isNoneSelected && !allSelected && (
            <div className="px-3 pt-2 pb-1.5 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[10px] text-slate-400 font-medium">Applied:</span>
                {selectedValues.map((val) => {
                  const opt = options.find((o) => o.value === val);
                  return (
                    <span
                      key={val}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold"
                    >
                      <span className="truncate max-w-[80px]">{opt ? opt.label : val}</span>
                      <X
                        className="w-2.5 h-2.5 cursor-pointer hover:text-rose-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOption(val);
                        }}
                      />
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
