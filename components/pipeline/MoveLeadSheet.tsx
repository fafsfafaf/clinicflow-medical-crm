import React from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Lead } from '../../lib/mock/types';

interface MoveLeadSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MoveLeadSheet: React.FC<MoveLeadSheetProps> = ({ lead, isOpen, onClose }) => {
  const { pipelineColumns, updateLeadStatus } = useAppStore();

  if (!isOpen || !lead) return null;

  const handleMove = (columnId: string) => {
    updateLeadStatus(lead.id, columnId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl z-[151] animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div>
             <h3 className="font-bold text-slate-900">Move Lead</h3>
             <p className="text-xs text-slate-500">Select a new stage for {lead.firstName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-2 space-y-1">
          {pipelineColumns.map((col) => {
            const isActive = lead.status === col.id;
            return (
              <button
                key={col.id}
                onClick={() => handleMove(col.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-100" 
                    : "text-slate-700 hover:bg-slate-50 border border-transparent"
                )}
              >
                <span>{col.title}</span>
                {isActive && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};