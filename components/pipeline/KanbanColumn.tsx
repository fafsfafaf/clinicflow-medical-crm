import React, { useMemo } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PipelineColumn, Lead } from '../../lib/mock/types';
import { LeadCard } from './LeadCard';
import { cn } from '../../lib/utils';
import { MoreHorizontal, GripHorizontal, Inbox } from 'lucide-react';
import { StageHeaderStats } from './StageHeaderStats';

interface KanbanColumnProps {
  column: PipelineColumn;
  leads: Lead[];
  onCardClick: (lead: Lead) => void;
  isReorderMode?: boolean;
  recentlyDroppedId?: string | null;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, leads, onCardClick, isReorderMode = false, recentlyDroppedId }) => {
  // Sortable hook for the COLUMN itself (horizontal reordering)
  const { 
    setNodeRef, 
    attributes, 
    listeners, 
    transform, 
    transition, 
    isDragging,
    isOver
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column
    },
    disabled: !isReorderMode
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // IDs for the SortableContext within this column (for LEADS)
  const leadIds = useMemo(() => leads.map(l => l.id), [leads]);

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col h-full min-w-[280px] flex-1 shrink-0 transition-opacity",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-center justify-between mb-1 px-1 group relative z-10">
        <h3 className="font-headings font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
          {isReorderMode && (
            <button 
              {...attributes} 
              {...listeners}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-grab active:cursor-grabbing"
            >
              <GripHorizontal className="w-4 h-4" />
            </button>
          )}
          {column.title}
          <span className="bg-slate-200/60 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{leads.length}</span>
        </h3>
        <MoreHorizontal className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
      </div>

      {/* Stats Header */}
      <StageHeaderStats column={column} leads={leads} />
      
      <div 
        className={cn(
          "flex-1 bg-slate-100/50 rounded-xl px-2 pb-2 pt-3 border border-transparent transition-colors overflow-y-auto min-h-[150px] scrollbar-thin relative flex flex-col",
          isOver && !isReorderMode && "bg-blue-50 border-blue-200 border-dashed"
        )}
      >
        <SortableContext items={leadIds} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onClick={() => onCardClick(lead)}
              isJustDropped={lead.id === recentlyDroppedId}
            />
          ))}
        </SortableContext>
        
        {/* Improved Empty State */}
        {leads.length === 0 && !isOver && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-3 min-h-[120px] opacity-70">
            <div className="w-10 h-10 rounded-full bg-slate-200/50 flex items-center justify-center border border-slate-200 border-dashed">
               <Inbox className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-semibold block text-slate-400 uppercase tracking-wider">Empty Stage</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};