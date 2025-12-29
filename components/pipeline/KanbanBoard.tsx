import React, { useState, useMemo, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent, 
  DragOverlay, 
  DragStartEvent, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  closestCorners 
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useAppStore } from '../../lib/store/useAppStore';
import { useThemeStore } from '../../lib/store/useThemeStore';
import { KanbanColumn } from './KanbanColumn';
import { LeadCard } from './LeadCard';
import { Lead, PipelineColumn } from '../../lib/mock/types';
import { LeadDetailDrawer } from '../leads/LeadDetailDrawer';
import { createPortal } from 'react-dom';

interface KanbanBoardProps {
  isReorderMode?: boolean;
  externalFilteredLeads?: Lead[];
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ isReorderMode = false, externalFilteredLeads }) => {
  const { pipelineColumns, leads, setLeads, reorderPipelineColumns, searchQuery } = useAppStore();
  const theme = useThemeStore();
  const [activeDragData, setActiveDragData] = useState<{ type: 'Lead' | 'Column', data: any } | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  
  // State to track which item was just dropped to trigger animation
  const [recentlyDroppedId, setRecentlyDroppedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Clear the dropped ID after animation finishes to prevent re-animating on re-renders
  useEffect(() => {
    if (recentlyDroppedId) {
      const timer = setTimeout(() => {
        setRecentlyDroppedId(null);
      }, 500); // Match animation duration roughly
      return () => clearTimeout(timer);
    }
  }, [recentlyDroppedId]);

  // Use externally filtered leads if provided, otherwise fallback to store leads
  const displayedLeads = externalFilteredLeads || leads;

  // Search Filtering
  const finalDisplayedLeads = useMemo(() => {
    if (!searchQuery) return displayedLeads;
    const lowerQ = searchQuery.toLowerCase();
    return displayedLeads.filter(l => 
      l.firstName.toLowerCase().includes(lowerQ) || 
      l.lastName.toLowerCase().includes(lowerQ) ||
      l.email.toLowerCase().includes(lowerQ)
    );
  }, [displayedLeads, searchQuery]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type || 'Lead';
    const data = type === 'Column' ? active.data.current?.column : active.data.current?.lead;
    
    setActiveDragData({ type, data });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveALead = active.data.current?.type === 'Lead';
    const isOverALead = over.data.current?.type === 'Lead';
    const isOverAColumn = over.data.current?.type === 'Column';

    if (!isActiveALead) return;

    // SCENARIO 1: Dragging a lead over another lead
    if (isActiveALead && isOverALead) {
      const activeLead = leads.find(l => l.id === activeId);
      const overLead = leads.find(l => l.id === overId);

      if (activeLead && overLead && activeLead.status !== overLead.status) {
        // Move lead to the new column implicitly by updating status locally for sorting
        // Note: We update the store immediately to simulate the move.
        const activeIndex = leads.findIndex((l) => l.id === activeId);
        const overIndex = leads.findIndex((l) => l.id === overId);

        let newLeads = [...leads];
        // Update status of active item
        newLeads[activeIndex].status = overLead.status;
        
        // Move in array
        newLeads = arrayMove(newLeads, activeIndex, overIndex);
        
        setLeads(newLeads);
      }
    }

    // SCENARIO 2: Dragging a lead over a column (empty area)
    if (isActiveALead && isOverAColumn) {
      const activeLead = leads.find(l => l.id === activeId);
      if (activeLead && activeLead.status !== overId) {
        const activeIndex = leads.findIndex((l) => l.id === activeId);
        const newLeads = [...leads];
        newLeads[activeIndex].status = String(overId);
        setLeads(newLeads);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragData(null);
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const activeType = active.data.current?.type;

    // Trigger animation for the item that was dropped
    if (activeType === 'Lead') {
      setRecentlyDroppedId(activeId as string);
    }

    // COLUMN REORDERING
    if (activeType === 'Column' && activeId !== overId) {
      reorderPipelineColumns(activeId as string, overId as string);
      return;
    }

    // LEAD REORDERING (Same Column Sorting)
    if (activeType === 'Lead' && activeId !== overId) {
      const oldIndex = leads.findIndex((l) => l.id === activeId);
      const newIndex = leads.findIndex((l) => l.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        setLeads(arrayMove(leads, oldIndex, newIndex));
      }
    }
  };

  return (
    <>
      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <SortableContext 
          items={pipelineColumns.map(c => c.id)} 
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex h-full overflow-x-auto pb-4 gap-4 items-start px-4 scrollbar-thin">
            {pipelineColumns.map(column => (
              <KanbanColumn 
                key={column.id} 
                column={column} 
                // We must pass the leads in the exact order they appear in the array
                // to ensure the SortableContext indices match.
                leads={finalDisplayedLeads.filter(l => l.status === column.id)}
                onCardClick={(lead) => setSelectedLeadId(lead.id)}
                isReorderMode={isReorderMode}
                // Pass down the ID to trigger animation in correct column
                recentlyDroppedId={recentlyDroppedId}
              />
            ))}
            <div className="w-2 shrink-0 h-full" /> 
          </div>
        </SortableContext>

        {createPortal(
          <DragOverlay>
            <div 
              className="font-sans antialiased text-slate-900"
              style={{
                '--font-global': theme.fontGlobal,
                '--font-metrics': theme.fontMetrics,
                '--font-headings': theme.fontHeadings,
              } as React.CSSProperties}
            >
              {activeDragData?.type === 'Lead' && (
                <LeadCard 
                  lead={activeDragData.data as Lead} 
                  isOverlay={true} 
                />
              )}
              {activeDragData?.type === 'Column' && (
                <div className="opacity-90 rotate-2 cursor-grabbing w-[280px]">
                  <KanbanColumn 
                    column={activeDragData.data as PipelineColumn} 
                    leads={finalDisplayedLeads.filter(l => l.status === (activeDragData.data as PipelineColumn).id)}
                    onCardClick={() => {}}
                    isReorderMode={true}
                  />
                </div>
              )}
            </div>
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      <LeadDetailDrawer 
        leadId={selectedLeadId} 
        onClose={() => setSelectedLeadId(null)} 
      />
    </>
  );
};