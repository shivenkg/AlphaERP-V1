import React, { useState, useRef, useEffect } from 'react';
import { Type, Check, Sparkles, Monitor, Smartphone, Tablet, Laptop, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';
import { useFontSize } from '../context/FontSizeContext';
import { FontSizeScaleMode } from '../types/fontSize';

export const FontSizeControl: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    fontSizeMode,
    isAuto,
    computedScale,
    baseFontSizePx,
    viewportInfo,
    setFontSizeMode,
    increaseFontSize,
    decreaseFontSize,
    resetToAuto
  } = useFontSize();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const getDeviceIcon = () => {
    if (viewportInfo.width < 640) return <Smartphone className="w-3.5 h-3.5" />;
    if (viewportInfo.width < 1024) return <Tablet className="w-3.5 h-3.5" />;
    if (viewportInfo.width < 1536) return <Laptop className="w-3.5 h-3.5" />;
    return <Monitor className="w-3.5 h-3.5" />;
  };

  const getBreakpointLabel = () => {
    if (viewportInfo.width < 480) return 'Mobile Compact';
    if (viewportInfo.width < 640) return 'Mobile Wide';
    if (viewportInfo.width < 768) return 'Small Tablet';
    if (viewportInfo.width < 1024) return 'Tablet';
    if (viewportInfo.width < 1440) return 'Standard Laptop';
    if (viewportInfo.width < 1920) return 'Full HD Desktop';
    return 'High-DPI / 4K Ultrawide';
  };

  const presets: { mode: FontSizeScaleMode; label: string; desc: string; scaleText: string }[] = [
    {
      mode: 'auto',
      label: 'Auto (Responsive)',
      desc: 'Dynamically adapts to viewport resolution',
      scaleText: `Auto (${Math.round(computedScale * 100)}%)`
    },
    {
      mode: 'compact',
      label: 'Compact',
      desc: 'Dense rows & high screen capacity',
      scaleText: '90% (14.4px)'
    },
    {
      mode: 'normal',
      label: 'Standard',
      desc: 'Default balanced enterprise layout',
      scaleText: '100% (16.0px)'
    },
    {
      mode: 'large',
      label: 'Large',
      desc: 'Enhanced legibility & crisp contrast',
      scaleText: '110% (17.6px)'
    },
    {
      mode: 'xlarge',
      label: 'Extra Large',
      desc: 'Accessible display & presentations',
      scaleText: '125% (20.0px)'
    }
  ];

  return (
    <div className="relative" ref={containerRef}>
      {/* Header Trigger Button */}
      <button
        id="header-font-scale-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Auto Rendering & Font Size Scaling (Alt + + / Alt + -)"
        className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer select-none ${
          isOpen
            ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-xs ring-2 ring-indigo-500/20'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
        }`}
      >
        <Type className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span className="hidden sm:inline">
          {isAuto ? 'Auto' : `${Math.round(computedScale * 100)}%`}
        </span>
        <span className="text-[10px] px-1 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono hidden md:inline">
          {baseFontSizePx}px
        </span>
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          id="font-scale-popover"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
                  Auto-Rendering & Font Scale
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Adaptive viewport typography ergonomics
                </p>
              </div>
            </div>
            {isAuto && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Auto
              </span>
            )}
          </div>

          {/* Viewport Live Diagnostics Pill */}
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400">{getDeviceIcon()}</span>
              <span>{getBreakpointLabel()}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
              <span>{viewportInfo.width}×{viewportInfo.height}px</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {(computedScale * 100).toFixed(0)}% ({baseFontSizePx}px)
              </span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="mt-3 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1">
              Typography Presets
            </span>
            <div className="grid grid-cols-1 gap-1">
              {presets.map((preset) => {
                const isActive = fontSizeMode === preset.mode;
                return (
                  <button
                    key={preset.mode}
                    type="button"
                    onClick={() => setFontSizeMode(preset.mode)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {preset.mode === 'auto' ? (
                        <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      ) : (
                        <Type className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{preset.label}</span>
                          {preset.mode === 'auto' && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                              Optimal
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          {preset.desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {preset.scaleText}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={decreaseFontSize}
                  title="Decrease Font Size (Alt + -)"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={increaseFontSize}
                  title="Increase Font Size (Alt + +)"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 px-2">
                  {Math.round(computedScale * 100)}%
                </span>
              </div>

              {!isAuto && (
                <button
                  type="button"
                  onClick={resetToAuto}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset to Auto</span>
                </button>
              )}
            </div>
          </div>

          {/* Footer Shortcuts Hint */}
          <div className="mt-3 pt-2 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 font-mono">
            <span>Shortcut: <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">Alt</kbd> + <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">+</kbd> / <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">-</kbd></span>
            <span>Auto: <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">Alt + 0</kbd></span>
          </div>
        </div>
      )}
    </div>
  );
};
