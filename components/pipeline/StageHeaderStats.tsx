import React from 'react';
import { PipelineColumn, Lead } from '../../lib/mock/types';

interface StageHeaderStatsProps {
  column: PipelineColumn;
  leads: Lead[];
}

export const StageHeaderStats: React.FC<StageHeaderStatsProps> = ({ column, leads }) => {
  // Mock calculations for realism
  const count = leads.length;
  const mockConversion = Math.max(10, 85 - (column.order * 15)); // Fake decay
  const mockAvgDays = Math.max(1, (column.order + 1) * 2);

  return (
    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium px-1 mb-2">
      <div className="flex items-center gap-1">
        <span className="text-slate-500">{count}</span>
        <span>Leads</span>
      </div>
      <div className="w-px h-2.5 bg-slate-300"></div>
      <div>
        <span className="text-emerald-600 font-bold">{mockConversion}%</span> Conv.
      </div>
      <div className="w-px h-2.5 bg-slate-300"></div>
      <div>
        <span className="text-slate-600">{mockAvgDays}d</span> avg
      </div>
    </div>
  );
};