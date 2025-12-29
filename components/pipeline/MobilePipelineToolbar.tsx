import React, { useState } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

export const MobilePipelineToolbar = () => {
  const { searchQuery, setSearchQuery, dateRange, setDateRange } = useAppStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="px-4 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2 h-14">
      {isSearchOpen ? (
        <div className="flex-1 flex items-center gap-2 animate-in fade-in duration-200">
           <Input 
             autoFocus
             placeholder="Search leads..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="h-9 text-sm"
           />
           <button onClick={() => setIsSearchOpen(false)} className="p-2 text-slate-500">
             <X className="w-5 h-5" />
           </button>
        </div>
      ) : (
        <>
          <h1 className="text-lg font-bold text-slate-900">Pipeline</h1>
          
          <div className="flex items-center gap-1">
             <button 
               onClick={() => setIsSearchOpen(true)}
               className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
             >
               <Search className="w-5 h-5" />
             </button>
             
             {/* Simple date toggle for mobile */}
             <button 
                onClick={() => setDateRange(dateRange === 'all' ? '30d' : 'all')}
                className={cn("p-2 rounded-full hover:bg-slate-100", dateRange !== 'all' ? "text-primary bg-blue-50" : "text-slate-600")}
             >
               <Calendar className="w-5 h-5" />
             </button>

             <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
               <Filter className="w-5 h-5" />
             </button>
          </div>
        </>
      )}
    </div>
  );
};