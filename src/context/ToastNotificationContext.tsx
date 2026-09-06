import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  Zap,
  Package,
  ArrowRight,
  BellRing,
  Volume2,
  VolumeX,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { InventoryItem, BOQItem, Project } from '../types';
import { storageService } from '../services/storageService';

export type ToastType = 'reorder-alert' | 'shortage-alert' | 'warning' | 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}

export interface ToastNotificationItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  timestamp: string;
  durationMs?: number; // default 7000ms
  sku?: string;
  itemName?: string;
  availableStock?: number;
  reorderLevel?: number;
  requiredQty?: number;
  unit?: string;
  warehouseLocation?: string;
  projectId?: string;
  projectNumber?: string;
  actions?: ToastAction[];
  soundEnabled?: boolean;
}

interface ToastNotificationContextType {
  toasts: ToastNotificationItem[];
  addToast: (toast: Omit<ToastNotificationItem, 'id' | 'timestamp'>) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  alertReorderStock: (item: InventoryItem, boq?: BOQItem, project?: Project, onGeneratePR?: () => void) => string;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const ToastNotificationContext = createContext<ToastNotificationContextType | undefined>(undefined);

// Short subtle audio chime synthesizer for low stock alert
function playAlertChime(type: ToastType) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'reorder-alert' || type === 'warning' || type === 'shortage-alert') {
      // Two-tone warning beep
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    }
  } catch {
    // Audio may be blocked before first user gesture
  }
}

export const ToastNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotificationItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('alpha_toast_sound');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('alpha_toast_sound', String(next));
      } catch {}
      return next;
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastNotificationItem, 'id' | 'timestamp'>): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newToast: ToastNotificationItem = {
        ...toast,
        id,
        timestamp,
        durationMs: toast.durationMs ?? 8000
      };

      if (soundEnabled) {
        playAlertChime(toast.type);
      }

      setToasts((prev) => [newToast, ...prev.slice(0, 5)]); // keep max 6 visible toasts

      // Also persist to system notification tray
      try {
        storageService.addNotification(
          toast.title,
          toast.message,
          toast.type === 'reorder-alert' || toast.type === 'warning' ? 'warning' : 'info',
          toast.projectId ? 'projects' : 'inventory'
        );
      } catch (e) {
        console.warn('Could not mirror toast to storage notifications:', e);
      }

      return id;
    },
    [soundEnabled]
  );

  /**
   * High-level helper for BOQ Reorder Level Breach Alerts
   */
  const alertReorderStock = useCallback(
    (item: InventoryItem, boq?: BOQItem, project?: Project, onGeneratePR?: () => void): string => {
      const deficit = Math.max(0, item.reorderLevel - item.availableStock);
      const title = `⚠️ Reorder Threshold Breach: ${item.sku}`;
      const message = `Stock (${item.availableStock} ${item.unit}) is at or below defined Reorder Level (${item.reorderLevel} ${item.unit})${
        boq ? ` for project ${project?.projectNumber || 'BOQ'}. Deficit: ${deficit} ${item.unit}.` : '.'
      }`;

      const actions: ToastAction[] = [];

      if (onGeneratePR) {
        actions.push({
          label: '⚡ Generate PR',
          onClick: onGeneratePR,
          variant: 'danger'
        });
      }

      return addToast({
        type: 'reorder-alert',
        title,
        message,
        sku: item.sku,
        itemName: item.name,
        availableStock: item.availableStock,
        reorderLevel: item.reorderLevel,
        requiredQty: boq?.requiredQty,
        unit: item.unit,
        warehouseLocation: item.warehouseLocation || item.storageLocation,
        projectId: project?.id,
        projectNumber: project?.projectNumber,
        actions,
        durationMs: 9000
      });
    },
    [addToast]
  );

  return (
    <ToastNotificationContext.Provider
      value={{
        toasts,
        addToast,
        dismissToast,
        clearAllToasts,
        alertReorderStock,
        soundEnabled,
        toggleSound
      }}
    >
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onClearAll={clearAllToasts}
      />
    </ToastNotificationContext.Provider>
  );
};

export function useToastNotification() {
  const context = useContext(ToastNotificationContext);
  if (!context) {
    throw new Error('useToastNotification must be used within a ToastNotificationProvider');
  }
  return context;
}

/**
 * Visual Toast Container rendered fixed on screen
 */
interface ToastContainerProps {
  toasts: ToastNotificationItem[];
  onDismiss: (id: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClearAll: () => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  soundEnabled,
  onToggleSound,
  onClearAll
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col-reverse gap-3 max-w-md w-full pointer-events-none px-3 sm:px-0"
      aria-live="polite"
    >
      {/* Toast Manager Control Bar if multiple toasts */}
      {toasts.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="pointer-events-auto flex items-center justify-between px-3 py-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[11px] rounded-xl border border-slate-700 shadow-lg"
        >
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <BellRing className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{toasts.length} Real-Time Stock & System Alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition-colors"
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            </button>
            <button
              onClick={onClearAll}
              className="text-[10px] text-slate-400 hover:text-rose-400 font-bold px-1.5 py-0.5 hover:bg-slate-800 rounded transition-colors"
            >
              Clear All
            </button>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastCardProps {
  toast: ToastNotificationItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  const duration = toast.durationMs || 8000;

  useEffect(() => {
    if (isHovered) return;

    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, isHovered, onDismiss, toast.id]);

  const isReorder = toast.type === 'reorder-alert';
  const isShortage = toast.type === 'shortage-alert';
  const isWarning = toast.type === 'warning';
  const isSuccess = toast.type === 'success';

  // Card theme styling based on type
  const getTheme = () => {
    if (isReorder) {
      return {
        cardBg: 'bg-rose-950/95 border-rose-600/80 text-white',
        iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
        progressBar: 'bg-rose-500',
        badgeBg: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
        icon: <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
      };
    }
    if (isShortage || isWarning) {
      return {
        cardBg: 'bg-amber-950/95 border-amber-500/80 text-white',
        iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
        progressBar: 'bg-amber-500',
        badgeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        icon: <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
      };
    }
    if (isSuccess) {
      return {
        cardBg: 'bg-slate-900/95 border-emerald-500/80 text-white',
        iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
        progressBar: 'bg-emerald-500',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />
      };
    }
    return {
      cardBg: 'bg-slate-900/95 border-blue-500/80 text-white',
      iconBg: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
      progressBar: 'bg-blue-500',
      badgeBg: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      icon: <Info className="w-5 h-5 text-blue-400" />
    };
  };

  const theme = getTheme();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: 20, transition: { duration: 0.2 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl ${theme.cardBg} p-4 transition-all`}
      role="alert"
    >
      {/* Top Header with Icon, Title, and Close Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${theme.iconBg}`}>
            {theme.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${theme.badgeBg}`}>
                {isReorder ? 'Reorder Level Alert' : isShortage ? 'BOQ Shortage' : 'System Notice'}
              </span>
              {toast.sku && (
                <span className="font-mono text-[11px] font-bold text-slate-300 bg-white/10 px-1.5 py-0.5 rounded">
                  {toast.sku}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-mono ml-auto">
                {toast.timestamp}
              </span>
            </div>
            <h4 className="text-xs font-bold text-white mt-1 leading-snug">
              {toast.title}
            </h4>
          </div>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Item stock telemetry detail box for reorder alert */}
      {isReorder && (toast.availableStock !== undefined || toast.reorderLevel !== undefined) && (
        <div className="mt-2.5 p-2.5 rounded-xl bg-black/40 border border-white/10 grid grid-cols-3 gap-2 text-center text-[11px]">
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400">Available</span>
            <span className="font-mono font-bold text-rose-400 text-xs">
              {toast.availableStock ?? 0} {toast.unit || 'Nos'}
            </span>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400">Reorder Level</span>
            <span className="font-mono font-bold text-amber-300 text-xs">
              {toast.reorderLevel ?? 0} {toast.unit || 'Nos'}
            </span>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-slate-400">Deficit Gap</span>
            <span className="font-mono font-bold text-rose-300 text-xs">
              {Math.max(0, (toast.reorderLevel ?? 0) - (toast.availableStock ?? 0))} {toast.unit || 'Nos'}
            </span>
          </div>
        </div>
      )}

      {/* Description / Message */}
      <p className="text-xs text-slate-200 mt-2 leading-relaxed">
        {toast.message}
      </p>

      {/* Location tag if any */}
      {toast.warehouseLocation && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-300">
          <Package className="w-3 h-3 text-slate-400" />
          <span>Warehouse Location: <strong>{toast.warehouseLocation}</strong></span>
          {toast.projectNumber && (
            <span className="ml-auto text-slate-400">Proj: {toast.projectNumber}</span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {toast.actions && toast.actions.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-end gap-2">
          {toast.actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                action.onClick();
                onDismiss(toast.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                action.variant === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : action.variant === 'warning'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {action.icon || <Zap className="w-3.5 h-3.5" />}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Progress countdown line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ${theme.progressBar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};
