import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { FontSizeScaleMode, ViewportBreakpoint, ViewportInfo, FontSizeContextType } from '../types/fontSize';
import { storageService } from '../services/storageService';

const FONT_MODE_STORAGE_KEY = 'alpha_erp_font_size_mode';
const CUSTOM_SCALE_STORAGE_KEY = 'alpha_erp_custom_font_scale';

const PRESET_SCALES: Record<Exclude<FontSizeScaleMode, 'auto'>, number> = {
  compact: 0.90, // 14.4px
  normal: 1.00,  // 16.0px
  large: 1.10,   // 17.6px
  xlarge: 1.25   // 20.0px
};

const getBreakpoint = (width: number): ViewportBreakpoint => {
  if (width < 480) return 'xs';
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1440) return 'xl';
  if (width < 1920) return '2xl';
  return '3xl';
};

const calculateAutoFontScale = (_width: number): number => {
  // Standard 100% font scale: application auto-adjusts layout without resizing fonts or screen view size
  return 1.0;
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSizeMode, setFontSizeModeState] = useState<FontSizeScaleMode>(() => {
    try {
      const stored = localStorage.getItem(FONT_MODE_STORAGE_KEY) as FontSizeScaleMode | null;
      if (stored && ['auto', 'compact', 'normal', 'large', 'xlarge'].includes(stored)) {
        return stored;
      }
      return storageService.getFontSizeMode();
    } catch {
      return 'auto';
    }
  });

  const [customScale, setCustomScaleState] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_SCALE_STORAGE_KEY);
      if (stored) {
        const val = parseFloat(stored);
        if (!isNaN(val) && val >= 0.75 && val <= 1.4) return val;
      }
      return storageService.getCustomFontScale();
    } catch {
      return 1.0;
    }
  });

  const [windowDimensions, setWindowDimensions] = useState<{ width: number; height: number }>(() => {
    if (typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: 1280, height: 800 };
  });

  // Debounced resize listener
  useEffect(() => {
    let timeoutId: any = null;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 50);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Compute scale and viewport info
  const computedScale = useMemo(() => {
    if (fontSizeMode === 'auto') {
      return calculateAutoFontScale(windowDimensions.width);
    }
    if (fontSizeMode in PRESET_SCALES) {
      return PRESET_SCALES[fontSizeMode as keyof typeof PRESET_SCALES];
    }
    return customScale;
  }, [fontSizeMode, windowDimensions.width, customScale]);

  const baseFontSizePx = useMemo(() => {
    return Number((16 * computedScale).toFixed(2));
  }, [computedScale]);

  const viewportInfo: ViewportInfo = useMemo(() => {
    const width = windowDimensions.width;
    const height = windowDimensions.height;
    const breakpoint = getBreakpoint(width);
    const orientation = width >= height ? 'landscape' : 'portrait';
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    return {
      width,
      height,
      breakpoint,
      devicePixelRatio,
      computedScale,
      baseFontSizePx,
      orientation,
      isTouch
    };
  }, [windowDimensions, computedScale, baseFontSizePx]);

  // Apply attributes and root font-size to the DOM
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Attributes for CSS styling hooks
    root.setAttribute('data-font-size-mode', fontSizeMode);
    root.setAttribute('data-viewport-breakpoint', viewportInfo.breakpoint);
    root.setAttribute('data-viewport-orientation', viewportInfo.orientation);

    // CSS variables for global typography & layout auto-rendering
    root.style.setProperty('--app-font-scale', String(computedScale));
    root.style.setProperty('--app-base-font-size', `${baseFontSizePx}px`);

    // Dynamically adjust root HTML font-size: this automatically scales all `rem` values across the entire application
    root.style.fontSize = `${baseFontSizePx}px`;

    // Persist
    try {
      localStorage.setItem(FONT_MODE_STORAGE_KEY, fontSizeMode);
      localStorage.setItem(CUSTOM_SCALE_STORAGE_KEY, String(customScale));
    } catch {}

    // Dispatch custom window event so charts, canvases, and D3 can adjust
    try {
      window.dispatchEvent(
        new CustomEvent('app-font-scale-change', {
          detail: {
            scale: computedScale,
            fontSizeMode,
            baseFontSizePx,
            viewport: viewportInfo
          }
        })
      );
    } catch {}
  }, [fontSizeMode, computedScale, baseFontSizePx, viewportInfo, customScale]);

  const setFontSizeMode = useCallback((mode: FontSizeScaleMode) => {
    setFontSizeModeState(mode);
    storageService.setFontSizeMode(mode);
  }, []);

  const setCustomScale = useCallback((scale: number) => {
    const clamped = Math.max(0.75, Math.min(1.4, Number(scale.toFixed(2))));
    setCustomScaleState(clamped);
    storageService.setCustomFontScale(clamped);
  }, []);

  const increaseFontSize = useCallback(() => {
    if (fontSizeMode === 'auto') {
      // Find the next scale above current auto scale
      const nextScale = Math.min(1.4, Number((computedScale + 0.05).toFixed(2)));
      setCustomScale(nextScale);
      if (nextScale >= 1.2) setFontSizeMode('xlarge');
      else if (nextScale >= 1.08) setFontSizeMode('large');
      else if (nextScale >= 0.98) setFontSizeMode('normal');
      else setFontSizeMode('compact');
    } else {
      const current = PRESET_SCALES[fontSizeMode as keyof typeof PRESET_SCALES] || customScale;
      const next = Math.min(1.4, Number((current + 0.05).toFixed(2)));
      setCustomScale(next);
      if (next >= 1.2) setFontSizeMode('xlarge');
      else if (next >= 1.08) setFontSizeMode('large');
      else if (next >= 0.98) setFontSizeMode('normal');
      else setFontSizeMode('compact');
    }
  }, [fontSizeMode, computedScale, customScale, setCustomScale, setFontSizeMode]);

  const decreaseFontSize = useCallback(() => {
    if (fontSizeMode === 'auto') {
      const nextScale = Math.max(0.75, Number((computedScale - 0.05).toFixed(2)));
      setCustomScale(nextScale);
      if (nextScale <= 0.92) setFontSizeMode('compact');
      else if (nextScale <= 1.02) setFontSizeMode('normal');
      else if (nextScale <= 1.15) setFontSizeMode('large');
      else setFontSizeMode('xlarge');
    } else {
      const current = PRESET_SCALES[fontSizeMode as keyof typeof PRESET_SCALES] || customScale;
      const next = Math.max(0.75, Number((current - 0.05).toFixed(2)));
      setCustomScale(next);
      if (next <= 0.92) setFontSizeMode('compact');
      else if (next <= 1.02) setFontSizeMode('normal');
      else if (next <= 1.15) setFontSizeMode('large');
      else setFontSizeMode('xlarge');
    }
  }, [fontSizeMode, computedScale, customScale, setCustomScale, setFontSizeMode]);

  const resetToAuto = useCallback(() => {
    setFontSizeMode('auto');
  }, [setFontSizeMode]);

  const value: FontSizeContextType = useMemo(
    () => ({
      fontSizeMode,
      isAuto: fontSizeMode === 'auto',
      computedScale,
      baseFontSizePx,
      viewportInfo,
      setFontSizeMode,
      increaseFontSize,
      decreaseFontSize,
      resetToAuto,
      setCustomScale
    }),
    [
      fontSizeMode,
      computedScale,
      baseFontSizePx,
      viewportInfo,
      setFontSizeMode,
      increaseFontSize,
      decreaseFontSize,
      resetToAuto,
      setCustomScale
    ]
  );

  return <FontSizeContext.Provider value={value}>{children}</FontSizeContext.Provider>;
};

export const useFontSize = (): FontSizeContextType => {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};

export const useChartTypography = (baseSize = 11) => {
  const { computedScale } = useFontSize();
  return {
    scale: computedScale,
    fontSize: Math.max(9, Math.round(baseSize * computedScale)),
    smallFontSize: Math.max(8, Math.round((baseSize - 2) * computedScale)),
    tickFontSize: Math.max(9, Math.round(baseSize * computedScale)),
    tooltipFontSize: Math.max(10, Math.round((baseSize + 1) * computedScale))
  };
};
