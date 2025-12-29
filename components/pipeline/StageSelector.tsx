import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface StageSelectorProps {
  activeStageId: string;
  onSelectStage: (id: string) => void;
}

export const StageSelector: React.FC<StageSelectorProps> = ({ activeStageId, onSelectStage }) => {
  const { pipelineColumns, leads } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active item
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector(`[data-stage-id="${activeStageId}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeStageId]);

  return (
    <div className="sticky top-0 bg-white/95 backdrop-blur z-20 border-b border-slate-200 shadow-sm">
      {/* Main Selector Dropdown (Optional visible title) */}
      <div className="px-4 py-2 border-b border-slate-50 flex items-center justify-between sm:hidden">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Current Stage</span>
      </div>

      {/* Scrollable Tabs */}
      <div 
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto px-4 py-2 no-scrollbar snap-x"
      >
        {pipelineColumns.map((col) => {
          const count = leads.filter(l => l.status === col.id).length;
          const isActive = activeStageId === col.id;
          
          return (
            <button
              key={col.id}
              data-stage-id={col.id}
              onClick={() => onSelectStage(col.id)}
              className={cn(
                "flex-shrink-0 snap-center flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              {col.title}
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};