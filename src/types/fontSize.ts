export type FontSizeScaleMode = 'auto' | 'compact' | 'normal' | 'large' | 'xlarge';

export type ViewportBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: ViewportBreakpoint;
  devicePixelRatio: number;
  computedScale: number;
  baseFontSizePx: number;
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
}

export interface FontSizeContextType {
  fontSizeMode: FontSizeScaleMode;
  isAuto: boolean;
  computedScale: number;
  baseFontSizePx: number;
  viewportInfo: ViewportInfo;
  setFontSizeMode: (mode: FontSizeScaleMode) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetToAuto: () => void;
  setCustomScale: (scale: number) => void;
}
