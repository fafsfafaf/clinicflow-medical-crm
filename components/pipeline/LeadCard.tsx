
import React, { useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '../../lib/mock/types';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { CalendarClock, Instagram, Facebook, Globe, Users, RefreshCw, GripVertical, AlertCircle, CheckCircle2, ArrowRight, Check, History } from 'lucide-react';
import { cn, formatDate, formatRelativeTime } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';
import { LeadQuickActions } from './LeadQuickActions';
import { AgentAssignDropdown } from './AgentAssignDropdown';
import { Button } from '../ui/button';

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
  onMoveStart?: () => void; // Mobile only
  isMobileView?: boolean;
  isOverlay?: boolean; // New prop to identify if this is the drag ghost
  isJustDropped?: boolean; // New prop for drop animation
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, onMoveStart, isMobileView = false, isOverlay = false, isJustDropped = false }) => {
  const { selectedLeadIds, toggleLeadSelection, viewDensity } = useAppStore();
  const isSelected = selectedLeadIds.includes(lead.id);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const isCompact = viewDensity === 'compact' && !isMobileView;
  
  // Long press logic for mobile selection
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    if (!isMobileView) return;
    longPressTimer.current = setTimeout(() => {
      toggleLeadSelection(lead.id);
      if (window.navigator.vibrate) window.navigator.vibrate(50); // Haptic feedback
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // SWITCH TO USE SORTABLE
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: { 
      type: 'Lead',
      lead 
    },
    disabled: isMobileView, // Disable DnD on mobile
  });

  const style = {
    transform: isOverlay ? undefined : CSS.Translate.toString(transform),
    transition: (isDragging || isOverlay) ? 'none' : transition,
  };

  // Helpers
  const isOverdue = lead.nextFollowUp ? new Date(lead.nextFollowUp) < new Date() : false;
  
  const getSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    const iconClass = isCompact ? "w-2.5 h-2.5" : "w-3 h-3";
    if (s.includes('instagram')) return <Instagram className={cn(iconClass, "text-[#E1306C]")} />;
    if (s.includes('facebook') || s.includes('meta')) return <Facebook className={cn(iconClass, "text-[#1877F2]")} />;
    if (s.includes('referral')) return <Users className={cn(iconClass, "text-emerald-600")} />;
    return <Globe className={cn(iconClass, "text-slate-400")} />;
  };

  const visibilityClass = (isDragging && !isOverlay) ? "opacity-0" : "opacity-100";

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "focus:outline-none group relative touch-none select-none rounded-xl",
        isCompact ? "mb-2" : "mb-3",
        visibilityClass,
        (isDragging || isAgentDropdownOpen) ? "z-50" : "z-0 hover:z-10"
      )}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd} 
      tabIndex={0}
    >
      <Card className={cn(
        "cursor-default border-slate-200/60 shadow-sm bg-white overflow-hidden transition-all duration-200 ease-out",
        (isDragging || isOverlay) 
          ? "shadow-2xl ring-2 ring-primary ring-offset-2 rotate-2 scale-105 cursor-grabbing !opacity-100" 
          : cn(
              "hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-primary/30",
              isMobileView && "active:scale-[0.98] active:bg-slate-50 transition-transform"
            ),
        (isJustDropped && !isDragging) && "animate-land",
        (isSelected && !isDragging && !isOverlay) ? "ring-2 ring-primary border-primary/50 bg-blue-50/10" : ""
      )}>
        <CardContent className={cn("p-0 flex items-stretch", isCompact ? "min-h-[70px]" : "min-h-[100px]")}>
          
          {/* 1. Drag Handle / Selection */}
          <div 
            {...(!isMobileView ? attributes : {})} 
            {...(!isMobileView ? listeners : {})} 
            className={cn(
               "shrink-0 flex flex-col items-center border-r border-transparent hover:border-slate-100 hover:bg-slate-50 transition-colors group/handle",
               isCompact ? "w-6 pt-2" : "w-9 pt-3.5",
               !isMobileView && "cursor-grab active:cursor-grabbing"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {isMobileView ? (
              isSelected ? (
                <CheckCircle2 className="w-4 h-4 text-primary mt-1" />
              ) : (
                <div className="w-1 h-8 rounded-full bg-slate-100 mt-1" />
              )
            ) : (
              <GripVertical className={cn("text-slate-300 group-hover/handle:text-slate-500 transition-colors", isCompact ? "w-3 h-3" : "w-4 h-4")} />
            )}
            
            {/* Desktop Checkbox (Hidden in Compact unless hovering handle) */}
            <div 
               className={cn(
                 "flex items-center justify-center w-full cursor-pointer",
                 isMobileView && "hidden",
                 isCompact ? "h-6 mt-1 opacity-0 group-hover/handle:opacity-100" : "h-8 mt-3"
               )} 
               onPointerDown={(e) => e.stopPropagation()} 
               onClick={(e) => {
                 e.stopPropagation();
                 toggleLeadSelection(lead.id);
               }}
             >
               <div className={cn(
                 "rounded border flex items-center justify-center transition-all duration-200",
                 isCompact ? "w-3 h-3" : "w-4 h-4",
                 isSelected 
                   ? "bg-primary border-primary shadow-sm shadow-blue-200" 
                   : "bg-white border-blue-200 hover:border-blue-400 group-hover:border-blue-300"
               )}>
                 <Check 
                    className={cn(
                      "text-white transition-all duration-200", 
                      isCompact ? "w-2.5 h-2.5" : "w-3 h-3",
                      isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                    )} 
                    strokeWidth={3} 
                 />
               </div>
            </div>
          </div>

          {/* 2. Main Content */}
          <div className={cn("flex-1 min-w-0 flex flex-col", isCompact ? "p-2 gap-1" : "p-3 gap-2")}>
            
            {/* Top Row: Name & Actions */}
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0 flex-1">
                <h4 className={cn(
                  "font-semibold text-slate-800 leading-snug whitespace-normal break-words group-hover:text-primary transition-colors duration-200 truncate",
                  isCompact ? "text-xs font-bold" : "text-sm"
                )}>
                  {lead.firstName} {lead.lastName}
                </h4>
                
                {/* Score & Volume Row - Inline for compact */}
                <div className={cn("flex items-center", isCompact ? "mt-0.5 gap-1.5" : "mt-1.5 gap-2")}>
                   <Badge variant={lead.score > 70 ? 'success' : lead.score < 40 ? 'danger' : 'outline'} className={cn("font-bold shrink-0", isCompact ? "text-[9px] px-1 h-3.5" : "text-[10px] px-1.5 h-4")}>
                    {lead.score}
                   </Badge>

                   <div className={cn("flex items-center font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-md", isCompact ? "text-[10px] px-1 py-0 border-none bg-transparent" : "text-xs px-1.5 py-0.5")}>
                      <span className={cn("text-slate-400 mr-0.5", isCompact ? "text-[9px]" : "text-[10px]")}>$</span>
                      {lead.valueEstimate > 0 ? lead.valueEstimate.toLocaleString() : '0'}
                   </div>
                </div>
              </div>
              
              {/* Actions */}
              <div 
                className="shrink-0 -mr-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()} 
              >
                {isMobileView ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg text-xs font-medium" 
                    onClick={onMoveStart}
                  >
                    Move <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                ) : (
                  <LeadQuickActions leadId={lead.id} />
                )}
              </div>
            </div>
            
            {/* Last Activity (Hidden in compact unless space permits or vital) */}
            {!isCompact && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                 <History className="w-3 h-3 text-slate-300" />
                 <span>Last active: <span className="text-slate-600">{formatRelativeTime(lead.lastActivity)}</span></span>
              </div>
            )}

            {/* Status / Next Step */}
            <div className={cn("flex flex-col", isCompact ? "gap-1 mt-0" : "gap-1.5 mt-0.5")}>
              {lead.nextFollowUp ? (
                <div className={cn(
                  "flex items-center rounded-md font-medium w-fit border",
                  isCompact ? "px-1.5 py-0.5 text-[10px] gap-1" : "px-2 py-1 text-[11px] gap-1.5",
                  isOverdue 
                    ? "bg-red-50 text-red-700 border-red-100" 
                    : "bg-slate-50 text-slate-600 border-slate-100"
                )}>
                  {isOverdue ? <AlertCircle className={isCompact ? "w-2.5 h-2.5" : "w-3 h-3"} /> : <CalendarClock className={isCompact ? "w-2.5 h-2.5" : "w-3 h-3"} />}
                  <span>{isOverdue ? 'Overdue: ' : 'Next: '}{formatDate(lead.nextFollowUp)}</span>
                </div>
              ) : (
                !isCompact && <div className="text-[11px] text-slate-400 italic px-1">No follow-up scheduled</div>
              )}
            </div>
            
            {/* Footer */}
            <div className={cn("flex items-center justify-between border-t border-slate-50 mt-auto", isCompact ? "pt-1 gap-1" : "pt-2 gap-2")}>
              <div className="flex items-center gap-1.5 min-w-0 max-w-full text-slate-500" title={`Source: ${lead.source}`}>
                 <div className="shrink-0">{getSourceIcon(lead.source)}</div>
                 <span className={cn("uppercase tracking-wider font-bold whitespace-normal break-words leading-tight truncate", isCompact ? "text-[9px]" : "text-[10px]")}>
                    {lead.source}
                 </span>
              </div>
              
              <div 
                onClick={(e) => e.stopPropagation()} 
                onPointerDown={(e) => e.stopPropagation()}
                className="shrink-0"
              >
                <AgentAssignDropdown 
                  leadId={lead.id} 
                  currentAgentId={lead.assignedAgentId} 
                  onOpenChange={setIsAgentDropdownOpen}
                />
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};
