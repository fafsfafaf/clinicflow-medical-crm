import React from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { X, CheckSquare, Trash2, ArrowRight } from 'lucide-react';

export const MobileBulkBar = () => {
  const { selectedLeadIds, clearSelection, bulkUpdateStatus, bulkDelete } = useAppStore();

  if (selectedLeadIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-slate-900 text-white p-4 shadow-2xl animate-in slide-in-from-bottom duration-300 pb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-sm">{selectedLeadIds.length} Selected</span>
        <button onClick={clearSelection} className="text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        <button 
          onClick={() => bulkUpdateStatus('col_patient')}
          className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-800 active:bg-slate-700"
        >
          <ArrowRight className="w-5 h-5" />
          <span className="text-[10px]">Move</span>
        </button>
        
        <button className="flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-800 active:bg-slate-700">
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px]">Task</span>
        </button>

        <button 
           onClick={bulkDelete}
           className="flex flex-col items-center gap-1 p-2 rounded-lg bg-red-900/30 text-red-400 active:bg-red-900/50 col-start-4"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-[10px]">Delete</span>
        </button>
      </div>
    </div>
  );
};