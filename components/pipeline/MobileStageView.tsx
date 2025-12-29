import React, { useState } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { StageSelector } from './StageSelector';
import { LeadCard } from './LeadCard';
import { MoveLeadSheet } from './MoveLeadSheet';
import { MobileBulkBar } from './MobileBulkBar';
import { LeadDetailDrawer } from '../leads/LeadDetailDrawer';
import { DndContext } from '@dnd-kit/core';
import { Lead } from '../../lib/mock/types';

interface MobileStageViewProps {
  filteredLeads: Lead[];
}

export const MobileStageView: React.FC<MobileStageViewProps> = ({ filteredLeads }) => {
  const { pipelineColumns } = useAppStore();
  const [activeStageId, setActiveStageId] = useState(pipelineColumns[0]?.id || 'col_new');
  const [movingLead, setMovingLead] = useState<Lead | null>(null);
  const [detailLeadId, setDetailLeadId] = useState<string | null>(null);

  const stageLeads = filteredLeads.filter(l => l.status === activeStageId);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* 1. Stage Tabs */}
      <StageSelector 
        activeStageId={activeStageId} 
        onSelectStage={setActiveStageId} 
      />

      {/* 2. Lead List (Vertical) */}
      {/* Wrapped in DndContext just to keep LeadCard's useDraggable hook happy without error, even if we disable drag UI */}
      <DndContext>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-32">
          {stageLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
              <p>No leads in this stage</p>
            </div>
          ) : (
            stageLeads.map(lead => (
              <LeadCard 
                key={lead.id} 
                lead={lead} 
                onClick={() => setDetailLeadId(lead.id)}
                onMoveStart={() => setMovingLead(lead)}
                isMobileView={true}
              />
            ))
          )}
        </div>
      </DndContext>

      {/* 3. Interaction Overlays */}
      <MoveLeadSheet 
        lead={movingLead} 
        isOpen={!!movingLead} 
        onClose={() => setMovingLead(null)} 
      />
      
      <LeadDetailDrawer 
        leadId={detailLeadId} 
        onClose={() => setDetailLeadId(null)} 
      />

      <MobileBulkBar />
    </div>
  );
};