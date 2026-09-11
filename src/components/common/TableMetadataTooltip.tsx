import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Layers,
  Thermometer,
  FileText,
  Paperclip,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  PackageCheck,
  TrendingDown,
  Warehouse,
  Truck,
  Hash,
  Tag,
  Info,
  ShoppingCart,
  Edit,
  Copy,
  Check
} from 'lucide-react';
import { Lead, InventoryItem, LeadStatus } from '../../types';

export interface TooltipPosition {
  x: number;
  y: number;
  placement: 'top' | 'bottom';
  align: 'left' | 'right' | 'center';
}

interface TableMetadataTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  delayMs?: number;
  hideDelayMs?: number;
  disabled?: boolean;
}

/**
 * High-performance interactive portal tooltip for table rows & cells.
 * Viewport-aware, prevents overflow clipping from scrollable tables,
 * and remains open while cursor moves inside the tooltip for actions.
 */
export const TableMetadataTooltip: React.FC<TableMetadataTooltipProps> = ({
  children,
  content,
  className = '',
  delayMs = 120,
  hideDelayMs = 220,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' }>({
    top: 0,
    left: 0,
    placement: 'bottom'
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<any>(null);
  const hideTimeoutRef = useRef<any>(null);

  const clearTimers = () => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  };

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 360;
    const tooltipEstimatedHeight = 320;
    const margin = 10;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine vertical placement (top vs bottom)
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placeTop = spaceBelow < tooltipEstimatedHeight && spaceAbove > spaceBelow;

    let top: number;
    if (placeTop) {
      top = rect.top - margin;
    } else {
      top = rect.bottom + margin;
    }

    // Determine horizontal placement
    let left = rect.left;
    if (left + tooltipWidth > viewportWidth - 16) {
      left = Math.max(16, viewportWidth - tooltipWidth - 16);
    }
    if (left < 16) {
      left = 16;
    }

    setCoords({
      top: top + window.scrollY,
      left: left + window.scrollX,
      placement: placeTop ? 'top' : 'bottom'
    });
  }, []);

  const handleMouseEnter = () => {
    if (disabled) return;
    clearTimers();
    showTimeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsOpen(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    clearTimers();
    hideTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, hideDelayMs);
  };

  const handleTooltipMouseEnter = () => {
    clearTimers();
    setIsOpen(true);
  };

  const handleTooltipMouseLeave = () => {
    clearTimers();
    hideTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, hideDelayMs);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-block ${className}`}
      >
        {children}
      </div>

      {isOpen && typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.placement === 'top' ? 'translateY(-100%)' : 'none'
            }}
            className="fixed z-[9999] pointer-events-auto w-[360px] sm:w-[380px] max-w-[95vw] shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
};

/* =========================================================================
   1. LEAD EXTENDED METADATA TOOLTIP CONTENT
   ========================================================================= */

interface LeadTooltipContentProps {
  lead: Lead;
  onAdvanceStage?: (lead: Lead) => void;
  onWhatsApp?: (lead: Lead) => void;
  onEmail?: (lead: Lead) => void;
  onViewDetail?: (lead: Lead) => void;
  onAward?: (lead: Lead) => void;
}

export const LeadMetadataTooltipContent: React.FC<LeadTooltipContentProps> = ({
  lead,
  onAdvanceStage,
  onWhatsApp,
  onEmail,
  onViewDetail,
  onAward
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusColor = (s: LeadStatus) => {
    switch (s) {
      case 'Awarded':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Negotiation':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Quote Sent':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Site Survey Scheduled':
      case 'Site Survey Completed':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Lost':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  const valInLakhs = (lead.estimatedValue / 100000).toFixed(2);

  return (
    <div className="p-4 space-y-3.5 text-xs select-none">
      {/* Header with Lead # and Badges */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
              {lead.leadNumber}
            </span>
            <button
              onClick={(e) => handleCopy(lead.leadNumber, 'leadNo', e)}
              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Copy Lead Number"
            >
              {copied === 'leadNo' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusColor(lead.status)}`}>
              {lead.status}
            </span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-1 leading-tight">
            {lead.companyName}
          </h4>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <User className="w-3 h-3 text-slate-400" />
            <span>{lead.clientName}</span>
            <span>•</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">{lead.city}</span>
          </div>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getPriorityColor(lead.priority)}`}>
          {lead.priority} Priority
        </span>
      </div>

      {/* Commercial & Engineering Grid */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Est. Deal Value
          </span>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            ₹{valInLakhs} L
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            ₹{lead.estimatedValue.toLocaleString()}
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-blue-500" />
            Cooling Capacity
          </span>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">
            {lead.estimatedCapacityTR} TR
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {lead.buildingType || 'Commercial'}
          </div>
        </div>
      </div>

      {/* HVAC Solution & Address */}
      <div className="space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            HVAC Scope:
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">
            {lead.hvacType}
          </span>
        </div>

        <div className="flex items-start justify-between gap-2 text-slate-600 dark:text-slate-300">
          <span className="text-slate-400 flex items-center gap-1 shrink-0 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400" />
            Site Address:
          </span>
          <span className="text-slate-700 dark:text-slate-300 text-right font-medium line-clamp-1">
            {lead.projectAddress || lead.siteAddress || lead.city}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="text-slate-400 flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            Phone / Mobile:
          </span>
          <div className="flex items-center gap-1.5 font-mono">
            <a
              href={`tel:${lead.phone}`}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              {lead.phone}
            </a>
            <button
              onClick={(e) => handleCopy(lead.phone, 'phone', e)}
              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Copy phone"
            >
              {copied === 'phone' ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="text-slate-400 flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            Email:
          </span>
          <a
            href={`mailto:${lead.email}`}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold truncate max-w-[190px]"
            onClick={(e) => e.stopPropagation()}
          >
            {lead.email}
          </a>
        </div>
      </div>

      {/* Operational Metadata Row */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
        <div>
          Engineer: <span className="font-semibold text-slate-700 dark:text-slate-300">{lead.assignedToName || 'Unassigned'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Source: <strong className="text-slate-700 dark:text-slate-300">{lead.source}</strong></span>
          {lead.attachments && lead.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-bold">
              <Paperclip className="w-2.5 h-2.5" />
              {lead.attachments.length} files
            </span>
          )}
        </div>
      </div>

      {/* Internal Notes if present */}
      {lead.notes && (
        <div className="p-2 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-lg text-[10px] text-amber-900 dark:text-amber-200 line-clamp-2">
          <span className="font-bold">Notes: </span>
          {lead.notes}
        </div>
      )}

      {/* Interactive Action Buttons */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          {onWhatsApp && (
            <button
              onClick={() => onWhatsApp(lead)}
              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors flex items-center gap-1 font-bold text-[10px]"
              title="Send WhatsApp Inquiry"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp</span>
            </button>
          )}

          {onEmail && (
            <button
              onClick={() => onEmail(lead)}
              className="p-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors flex items-center gap-1 font-bold text-[10px]"
              title="Compose Proposal Email"
            >
              <Mail className="w-3 h-3" />
              <span>Email</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onAdvanceStage && lead.status !== 'Awarded' && (
            <button
              onClick={() => onAdvanceStage(lead)}
              className="px-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors"
            >
              <span>Next Stage</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          )}

          {onViewDetail && (
            <button
              onClick={() => onViewDetail(lead)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[10px] transition-colors"
            >
              Open Full View
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. INVENTORY EXTENDED METADATA TOOLTIP CONTENT
   ========================================================================= */

interface InventoryTooltipContentProps {
  item: InventoryItem;
  onQuickPR?: (item: InventoryItem) => void;
  onAdjustStock?: (item: InventoryItem) => void;
}

export const InventoryMetadataTooltipContent: React.FC<InventoryTooltipContentProps> = ({
  item,
  onQuickPR,
  onAdjustStock
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const safetyThreshold = Math.max(1, Math.ceil(item.reorderLevel * 0.10));
  const isCritical = item.availableStock <= safetyThreshold;
  const isLow = item.availableStock <= item.reorderLevel;
  const deficit = isLow ? item.reorderLevel - item.availableStock : 0;
  const totalValuation = item.currentStock * item.averageUnitCost;

  // Percentage of reorder buffer
  const safetyPercentage = item.reorderLevel > 0
    ? Math.round((item.availableStock / item.reorderLevel) * 100)
    : 100;

  return (
    <div className="p-4 space-y-3 text-xs select-none">
      {/* Header: SKU & Status */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
              {item.sku}
            </span>
            <button
              onClick={(e) => handleCopy(item.sku, 'sku', e)}
              className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Copy SKU code"
            >
              {copied === 'sku' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
            <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[9px] font-bold">
              {item.category}
            </span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-1 leading-snug">
            {item.name}
          </h4>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Brand: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{item.manufacturer || item.brand || 'OEM Standard'}</strong>
          </div>
        </div>

        {/* Health Badge */}
        {isCritical ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center gap-1 shrink-0 animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            CRITICAL &le; 10%
          </span>
        ) : isLow ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 shrink-0">
            <PackageCheck className="w-3 h-3" />
            Adequate
          </span>
        )}
      </div>

      {/* Stock Levels Breakdown Card */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Physical</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
              {item.currentStock} {item.unit}
            </span>
          </div>

          <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Allocated</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
              {item.allocatedStock} {item.unit}
            </span>
          </div>

          <div className={`p-1.5 rounded-lg border ${
            isCritical
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
              : isLow
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
          }`}>
            <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Available</span>
            <span className={`text-xs font-bold font-mono ${
              isCritical
                ? 'text-rose-600 dark:text-rose-400'
                : isLow
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {item.availableStock} {item.unit}
            </span>
          </div>
        </div>

        {/* Safety buffer progress indicator */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500 dark:text-slate-400">
              Reorder Point: <strong className="font-mono">{item.reorderLevel} {item.unit}</strong>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              10% Safety Buffer: <strong className="font-mono text-rose-600 dark:text-rose-400">{safetyThreshold} {item.unit}</strong>
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, safetyPercentage))}%` }}
            />
          </div>
          {deficit > 0 && (
            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-between pt-0.5">
              <span>Immediate Deficit:</span>
              <span className="font-mono font-bold">-{deficit} {item.unit} required</span>
            </div>
          )}
        </div>
      </div>

      {/* Commercial & Valuation Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-slate-400 flex items-center gap-1 text-[10px]">
            <DollarSign className="w-3 h-3 text-slate-400" />
            Avg Unit Cost:
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            ₹{item.averageUnitCost.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50">
          <span className="text-slate-400 flex items-center gap-1 text-[10px]">
            <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Asset Value:
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            ₹{totalValuation.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Warehouse Logistics & Lead Time */}
      <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <Warehouse className="w-3 h-3 text-slate-400" />
            Warehouse Location:
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {item.warehouseLocation || item.location || 'Central Depot / Bay A'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <Truck className="w-3 h-3 text-slate-400" />
            Lead Time / Vendor:
          </span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {item.leadTimeDays ? `${item.leadTimeDays} days` : '3-5 business days'} • {item.preferredVendor || item.defaultSupplier || 'Primary OEM'}
          </span>
        </div>

        {item.hsnCode && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Hash className="w-3 h-3 text-slate-400" />
              HSN Code / GST:
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              {item.hsnCode} ({item.gstRatePct || 18}% GST)
            </span>
          </div>
        )}
      </div>

      {/* Specifications / Description */}
      {(item.specification || item.description) && (
        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 line-clamp-2">
          <span className="font-bold text-slate-700 dark:text-slate-200">Tech Specs: </span>
          {item.specification || item.description}
        </div>
      )}

      {/* Interactive Action Bar */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="text-[10px] text-slate-400">
          Last restocked: <span className="font-medium text-slate-600 dark:text-slate-300">{item.lastRestockedDate || 'Recent'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {onQuickPR && isLow && (
            <button
              onClick={() => onQuickPR(item)}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors"
              title="Create Purchase Requisition (PR)"
            >
              <ShoppingCart className="w-3 h-3" />
              <span>Raise PR</span>
            </button>
          )}

          {onAdjustStock && (
            <button
              onClick={() => onAdjustStock(item)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors"
            >
              <Edit className="w-3 h-3" />
              <span>Adjust</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
