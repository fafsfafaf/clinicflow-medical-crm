import React, { useState, useMemo } from 'react';
import { KanbanBoard } from '../components/pipeline/KanbanBoard';
import { MobileStageView } from '../components/pipeline/MobileStageView';
import { MobilePipelineToolbar } from '../components/pipeline/MobilePipelineToolbar';
import { KpiCard } from '../components/common/KpiCard';
import { Button } from '../components/ui/button';
import { Users, Calendar as CalendarIcon, DollarSign, UserPlus, Download, Plus } from 'lucide-react';
import { useAppStore } from '../lib/store/useAppStore';
import { formatCurrency } from '../lib/utils';
import { BulkActionBar } from '../components/pipeline/BulkActionBar';
import { IconBarController } from '../components/controller/IconBarController';
import { PipelineFilters } from '../components/pipeline/PipelineFilters';
import { useBreakpoint } from '../lib/hooks/useBreakpoint';
import { NewLeadSheet } from '../components/leads/NewLeadSheet';

// Mock current user ID (Sarah Connor)
const CURRENT_USER_ID = 'ag_1'; 

const PipelinePage = () => {
  const { leads, isMyLeadsOnly, dateRange } = useAppStore();
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const { isMobile } = useBreakpoint();

  // --- FILTERING LOGIC ---
  const filteredLeads = useMemo(() => {
    let result = leads;

    if (isMyLeadsOnly) {
      result = result.filter(lead => lead.assignedAgentId === CURRENT_USER_ID);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      switch (dateRange) {
        case 'today': cutoff.setHours(0, 0, 0, 0); break;
        case '7d': cutoff.setDate(now.getDate() - 7); break;
        case '30d': cutoff.setDate(now.getDate() - 30); break;
        case '90d': cutoff.setDate(now.getDate() - 90); break;
      }
      result = result.filter(lead => new Date(lead.createdAt) >= cutoff);
    }

    return result;
  }, [leads, isMyLeadsOnly, dateRange]);


  // --- METRICS ---
  const totalLeads = filteredLeads.length;
  const booked = filteredLeads.filter(l => l.status === 'col_booked' || l.status === 'col_patient').length;
  const patients = filteredLeads.filter(l => l.status === 'col_patient').length;
  const potentialValue = filteredLeads.reduce((acc, curr) => acc + curr.valueEstimate, 0);

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <MobilePipelineToolbar />
        <div className="flex-1 overflow-hidden">
          <MobileStageView filteredLeads={filteredLeads} />
        </div>
        <IconBarController />
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
  return (
    <div className="flex flex-col h-full space-y-5 relative">
      {/* Header Section */}
      <div className="flex justify-between items-end shrink-0">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">Pipeline</h1>
           <p className="text-slate-500 text-sm mt-1">Manage patient intake, track leads, and monitor conversion.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex" icon={<Download className="w-4 h-4 mr-2"/>}>
            Export
          </Button>
          <Button 
            variant="default" 
            className="shadow-lg shadow-blue-500/20" 
            icon={<Plus className="w-4 h-4 mr-2"/>}
            onClick={() => setIsNewLeadOpen(true)}
          >
            New Lead
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <KpiCard title="Total Leads" value={totalLeads} change={dateRange !== 'all' ? undefined : "+12%"} trend="up" icon={<Users className="w-4 h-4"/>} />
        <KpiCard title="Booked Appts" value={booked} change={dateRange !== 'all' ? undefined : "+5%"} trend="up" icon={<CalendarIcon className="w-4 h-4"/>} />
        <KpiCard title="New Patients" value={patients} change={dateRange !== 'all' ? undefined : "+2%"} trend="up" icon={<UserPlus className="w-4 h-4"/>} />
        <KpiCard title="Pipeline Value" value={formatCurrency(potentialValue)} change={dateRange !== 'all' ? undefined : "-1%"} trend="down" icon={<DollarSign className="w-4 h-4"/>} />
      </div>

      {/* Filter Bar */}
      <PipelineFilters isReorderMode={isReorderMode} onToggleReorder={() => setIsReorderMode(!isReorderMode)} />

      {/* Board */}
      <div className="flex-1 min-h-0 relative">
        <KanbanBoard 
          isReorderMode={isReorderMode} 
          externalFilteredLeads={filteredLeads}
        />
      </div>

      <BulkActionBar />
      <IconBarController />
      
      {/* New Lead Sheet */}
      <NewLeadSheet isOpen={isNewLeadOpen} onClose={() => setIsNewLeadOpen(false)} />
    </div>
  );
};

export default PipelinePage;