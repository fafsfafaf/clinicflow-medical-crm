
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Agent } from '../../lib/mock/types';
import { cn } from '../../lib/utils';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: 'day' | 'week';
  onViewChange: (view: 'day' | 'week') => void;
  selectedProviderId: string;
  onProviderChange: (id: string) => void;
  agents: Agent[];
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onDateChange,
  view,
  onViewChange,
  selectedProviderId,
  onProviderChange,
  agents
}) => {
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const formatDateRange = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } else {
      // Week range logic
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
      start.setDate(diff);
      
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleString('en-US', { month: 'long' })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
      } else {
        return `${start.toLocaleString('en-US', { month: 'short' })} ${start.getDate()} – ${end.toLocaleString('en-US', { month: 'short' })} ${end.getDate()}, ${end.getFullYear()}`;
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-4">
      
      {/* Left: Date Nav */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
          <button onClick={handlePrev} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={handleToday} className="px-3 py-1 text-xs font-bold text-slate-700 hover:bg-white hover:shadow-sm rounded-md transition-all">
            Today
          </button>
          <button onClick={handleNext} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm font-bold text-slate-900 min-w-[140px] text-center sm:text-left">
          {formatDateRange()}
        </div>
      </div>

      {/* Right: Filters */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Provider Filter */}
        <div className="relative hidden sm:block">
           <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <User className="w-3.5 h-3.5 text-slate-400" />
           </div>
           <select 
             value={selectedProviderId}
             onChange={(e) => onProviderChange(e.target.value)}
             className="pl-8 pr-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-slate-50 hover:bg-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer transition-colors"
           >
             <option value="all">All Providers</option>
             {agents.map(a => (
               <option key={a.id} value={a.id}>{a.name}</option>
             ))}
           </select>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* View Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => onViewChange('day')}
            className={cn(
              "flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-all",
              view === 'day' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Day
          </button>
          <button
            onClick={() => onViewChange('week')}
            className={cn(
              "flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-all",
              view === 'week' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Week
          </button>
        </div>
      </div>
    </div>
  );
};
