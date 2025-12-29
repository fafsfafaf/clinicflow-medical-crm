
import React from 'react';
import { useAppStore, DateRange } from '../../lib/store/useAppStore';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, SlidersHorizontal, User, CalendarRange, Eye, Save, ChevronDown, Check, LayoutGrid, List, Rows, AlignJustify } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PipelineFiltersProps {
  isReorderMode: boolean;
  onToggleReorder: () => void;
}

export const PipelineFilters: React.FC<PipelineFiltersProps> = ({ isReorderMode, onToggleReorder }) => {
  const { 
    searchQuery, setSearchQuery, 
    isMyLeadsOnly, toggleMyLeadsOnly,
    dateRange, setDateRange,
    viewDensity, setViewDensity
  } = useAppStore();
  
  const [currentView, setCurrentView] = React.useState('Default View');
  const [showDateMenu, setShowDateMenu] = React.useState(false);

  const dateOptions: { label: string; value: DateRange }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'All Time', value: 'all' },
  ];

  const activeDateLabel = dateOptions.find(o => o.value === dateRange)?.label || 'All Time';

  return (
    <div className="flex flex-col gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0 relative z-20">
      
      {/* Top Row: Search & Primary Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-64">
            <Input 
              placeholder="Search patients..." 
              icon={<Search className="w-4 h-4"/>} 
              className="h-9 border-slate-200 bg-slate-50 focus:bg-white transition-all text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="h-5 w-px bg-slate-200 mx-1" />
          
          {/* My Leads Toggle */}
          <button 
             onClick={toggleMyLeadsOnly}
             className={cn(
               "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border select-none",
               isMyLeadsOnly 
                ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" 
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
             )}
          >
             <User className={cn("w-3.5 h-3.5", isMyLeadsOnly && "fill-current")} />
             My Leads
          </button>

          {/* Date Range Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowDateMenu(!showDateMenu)}
              onBlur={() => setTimeout(() => setShowDateMenu(false), 200)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border select-none",
                dateRange !== 'all' 
                  ? "bg-slate-100 text-slate-900 border-slate-300" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
               <CalendarRange className="w-3.5 h-3.5" />
               {activeDateLabel}
               <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
            </button>

            {/* Date Dropdown */}
            {showDateMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDateRange(opt.value)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50",
                      dateRange === opt.value ? "text-primary font-medium bg-blue-50/50" : "text-slate-700"
                    )}
                  >
                    {opt.label}
                    {dateRange === opt.value && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           {/* View Density Toggle */}
           <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-100 mr-2">
              <button 
                onClick={() => setViewDensity('comfortable')}
                title="Comfortable View"
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewDensity === 'comfortable' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setViewDensity('compact')}
                title="Compact View"
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewDensity === 'compact' ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
           </div>

           {/* Saved Views */}
           <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100 mr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">View:</span>
              <button className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md shadow-sm text-xs font-medium text-slate-800 border border-slate-200">
                <Eye className="w-3 h-3 text-primary" />
                {currentView}
              </button>
              <button className="p-1 hover:bg-slate-200 rounded text-slate-400" title="Save View">
                <Save className="w-3 h-3" />
              </button>
           </div>

           {/* Reorder Toggle */}
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleReorder}
            className={cn("h-8 text-xs transition-colors", isReorderMode ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200" : "text-slate-500")}
          >
            {isReorderMode ? 'Done Ordering' : 'Reorder'}
          </Button>

          <Button variant="outline" size="sm" className="h-8 w-8 p-0" icon={<SlidersHorizontal className="w-3.5 h-3.5"/>} />
        </div>
      </div>
    </div>
  );
};
