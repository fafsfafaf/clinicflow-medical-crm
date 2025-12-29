import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { useBulkBarSettings } from '../../lib/theme/useBulkBarSettings';
import { Button } from '../ui/button';
import { X, Trash2, UserPlus, ArrowRight, Ban } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BulkActionBar = () => {
  const { selectedLeadIds, clearSelection, bulkUpdateStatus, bulkAssignAgent, agents, pipelineColumns } = useAppStore();
  const { style } = useBulkBarSettings();
  
  const [activeAction, setActiveAction] = useState<'assign' | 'move' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveAction(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (selectedLeadIds.length === 0) return null;

  const handleAssign = (agentId: string) => {
    bulkAssignAgent(agentId);
    setActiveAction(null);
  };

  const handleMove = (columnId: string) => {
    bulkUpdateStatus(columnId);
    setActiveAction(null);
  };

  const handleDisqualify = () => {
    // Moved to "Disqualified" (col_lost) instead of deleting
    bulkUpdateStatus('col_lost');
  };

  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
      style={{ bottom: `${style.bottomOffset}px` }}
      ref={containerRef}
    >
      {/* Main Bar */}
      <div 
        className={cn(
           "flex items-center gap-4 shadow-2xl transition-all duration-300",
           style.showGlassEffect ? "backdrop-blur-md" : ""
        )}
        style={{
          backgroundColor: style.showGlassEffect ? `${style.backgroundColor}dd` : style.backgroundColor,
          color: style.textColor,
          borderRadius: `${style.borderRadius}px`,
          border: `${style.borderWidth}px solid ${style.borderColor}`,
          padding: `${style.paddingY}px ${style.paddingX}px`,
          fontFamily: style.fontFamily
        }}
      >
        
        {/* Counter */}
        <div className="flex items-center gap-3 pl-2 pr-4 border-r" style={{ borderColor: style.borderColor }}>
          <div 
            className="text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-bounce shadow-sm"
            style={{ backgroundColor: style.accentColor }}
          >
            {selectedLeadIds.length}
          </div>
          <span className="text-sm font-medium">Selected</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
           
           {/* Assign Button Wrapper */}
           <div className="relative">
             {activeAction === 'assign' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 fade-in duration-200 origin-bottom">
                   <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                     Assign to Agent
                   </div>
                   <div className="max-h-48 overflow-y-auto">
                     {agents.map(agent => (
                       <button
                         key={agent.id}
                         onClick={() => handleAssign(agent.id)}
                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                       >
                         <img src={agent.avatar} className="w-6 h-6 rounded-full" alt={agent.name} />
                         <span>{agent.name}</span>
                       </button>
                     ))}
                   </div>
                   {/* Little arrow pointing down */}
                   <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>
                </div>
             )}
             
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setActiveAction(activeAction === 'assign' ? null : 'assign')}
               className={cn(
                 "h-8 text-xs transition-colors hover:bg-white/10", 
                 activeAction === 'assign' && "bg-slate-100/10 text-slate-900" // Light highlight if active
               )}
               style={{ color: style.textColor }}
               icon={<UserPlus className="w-3.5 h-3.5 mr-1.5" />}
             >
               Assign
             </Button>
           </div>

           {/* Move Button Wrapper */}
           <div className="relative">
             {activeAction === 'move' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 fade-in duration-200 origin-bottom">
                   <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                     Move to Stage
                   </div>
                   <div className="max-h-60 overflow-y-auto p-1">
                     {pipelineColumns.map(col => (
                       <button
                         key={col.id}
                         onClick={() => handleMove(col.id)}
                         className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                       >
                         <span>{col.title}</span>
                         <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                       </button>
                     ))}
                   </div>
                   {/* Little arrow pointing down */}
                   <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>
                </div>
             )}

             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => setActiveAction(activeAction === 'move' ? null : 'move')}
               className={cn(
                 "h-8 text-xs transition-colors hover:bg-white/10",
                 activeAction === 'move' && "bg-slate-100/10 text-slate-900"
               )}
               style={{ color: style.textColor }}
               icon={<ArrowRight className="w-3.5 h-3.5 mr-1.5" />}
             >
               Move
             </Button>
           </div>

           <Button 
             variant="ghost" 
             size="sm" 
             onClick={handleDisqualify}
             className="h-8 text-xs transition-colors hover:bg-red-500/20 hover:text-red-200"
             style={{ color: style.textColor }}
             icon={<Ban className="w-3.5 h-3.5 mr-1.5" />}
           >
             Disqualify
           </Button>
        </div>

        <div className="pl-2 border-l" style={{ borderColor: style.borderColor }}>
           <button 
             onClick={clearSelection}
             className="p-1 rounded-full hover:bg-white/10 transition-colors"
             style={{ color: style.textColor }}
           >
             <X className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};