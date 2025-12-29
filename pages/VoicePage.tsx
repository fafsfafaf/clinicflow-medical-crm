import React, { useState, useMemo } from 'react';
import { useAppStore, DateRange } from '../lib/store/useAppStore';
import { VoiceKPIs } from '../components/voice/VoiceKPIs';
import { VoiceCallList } from '../components/voice/VoiceCallList';
import { AgentPerformanceList } from '../components/voice/AgentPerformanceList';
import { LeadDetailDrawer } from '../components/leads/LeadDetailDrawer';
import { cn } from '../lib/utils';
import { CalendarRange } from 'lucide-react';

const VoicePage = () => {
  const { calls, leads, agents, dateRange, setDateRange } = useAppStore();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Custom filter logic strictly for the Voice Dashboard's requirement (Today, 7d, 30d)
  // We use the store's dateRange but map the UI to only show relevant options
  const filteredCalls = useMemo(() => {
    let result = calls;

    if (dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (dateRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case '7d':
          cutoff.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoff.setDate(now.getDate() - 30);
          break;
        default:
          cutoff.setDate(now.getDate() - 30); // Default fallback
      }
      result = result.filter(call => new Date(call.timestamp) >= cutoff);
    }
    
    // Sort by most recent
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [calls, dateRange]);

  // KPI Calculations
  const totalCalls = filteredCalls.length;
  const connected = filteredCalls.filter(c => c.outcome === 'connected' || c.outcome === 'qualified' || c.outcome === 'booked').length;
  const qualified = filteredCalls.filter(c => c.outcome === 'qualified' || c.outcome === 'booked').length;
  const cost = filteredCalls.reduce((acc, curr) => acc + curr.cost, 0);

  const filterOptions: { label: string; value: DateRange }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
       
       {/* Header & Filter */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Voice Agent Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time overview of AI clinic reception performance.</p>
        </div>
        
        <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateRange(opt.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                dateRange === opt.value 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Row: KPIs */}
      <div className="shrink-0">
        <VoiceKPIs 
          totalCalls={totalCalls} 
          connectedCount={connected} 
          qualifiedCount={qualified} 
          totalCost={cost} 
        />
      </div>

      {/* Main Content: List + Sidebar */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-2">
        {/* Left: Call List */}
        <div className="lg:col-span-2 h-full min-h-[400px]">
          <VoiceCallList 
            calls={filteredCalls} 
            leads={leads} 
            onSelectCall={setSelectedLeadId} 
          />
        </div>

        {/* Right: Agent Sidebar */}
        <div className="h-full">
          <AgentPerformanceList 
            agents={agents} 
            filteredCalls={filteredCalls} 
          />
        </div>
      </div>

      {/* Patient Detail Popup (Hidden until triggered) */}
      <LeadDetailDrawer 
        leadId={selectedLeadId} 
        onClose={() => setSelectedLeadId(null)} 
      />
    </div>
  );
};

export default VoicePage;