import React from 'react';
import { Phone, Calendar, Check, X } from 'lucide-react';
import { useAppStore } from '../../lib/store/useAppStore';
import { IconActionButton } from './IconActionButton';
import { useIconBarSettings } from '../../lib/theme/useIconBarSettings';

interface LeadQuickActionsProps {
  leadId: string;
}

export const LeadQuickActions: React.FC<LeadQuickActionsProps> = ({ leadId }) => {
  const { updateLeadStatus } = useAppStore();
  const { buttonStyle } = useIconBarSettings();

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (action === 'qualify') updateLeadStatus(leadId, 'col_booked');
    if (action === 'disqualify') updateLeadStatus(leadId, 'col_lost');
  };

  return (
    <div 
      className="flex items-center" 
      style={{ gap: `${buttonStyle.gap}px` }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <IconActionButton 
        icon={<Phone />} 
        label="Call Lead" 
        onClick={(e) => handleAction(e, 'call')} 
      />
      
      <IconActionButton 
        icon={<Calendar />} 
        label="Book Appt" 
        onClick={(e) => handleAction(e, 'book')} 
      />
      
      {/* Divider logic using gap - no explicit divider div for cleaner flex gap control */}
      <div className="w-px h-3 bg-slate-200/50 mx-0.5" />
      
      <IconActionButton 
        icon={<Check />} 
        label="Qualify" 
        onClick={(e) => handleAction(e, 'qualify')} 
      />
      
      <IconActionButton 
        icon={<X />} 
        label="Disqualify" 
        onClick={(e) => handleAction(e, 'disqualify')} 
      />
    </div>
  );
};