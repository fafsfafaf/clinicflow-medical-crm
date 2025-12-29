import React from 'react';
import { Agent, Call } from '../../lib/mock/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Phone, CheckCircle2, UserCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AgentPerformanceListProps {
  agents: Agent[];
  filteredCalls: Call[];
}

export const AgentPerformanceList: React.FC<AgentPerformanceListProps> = ({ agents, filteredCalls }) => {
  
  const getAgentStats = (agentId: string) => {
    const agentCalls = filteredCalls.filter(c => c.agentId === agentId);
    return {
      total: agentCalls.length,
      qualified: agentCalls.filter(c => c.outcome === 'qualified' || c.outcome === 'booked').length,
      booked: agentCalls.filter(c => c.outcome === 'booked').length // Assuming booked is a subset or separate status
    };
  };

  return (
    <Card className="border-slate-200 shadow-sm h-full bg-white">
      <CardHeader className="py-4 px-5 border-b border-slate-100">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Agent Status</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-50">
          {agents.map(agent => {
            const stats = getAgentStats(agent.id);
            
            return (
              <div key={agent.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                {/* Header: Avatar + Name + Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-100" />
                      <div className={cn(
                        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                        agent.status === 'online' ? "bg-emerald-500" : 
                        agent.status === 'busy' ? "bg-red-500" : "bg-slate-300"
                      )} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{agent.name}</h4>
                      <p className="text-xs text-slate-500 capitalize">AI Receptionist</p>
                    </div>
                  </div>
                  <Badge 
                    variant={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'danger' : 'outline'}
                    className="capitalize text-[10px]"
                  >
                    {agent.status}
                  </Badge>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100">
                    <Phone className="w-3 h-3 text-slate-400 mb-1" />
                    <span className="text-sm font-bold text-slate-700">{stats.total}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-medium">Calls</span>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100">
                    <CheckCircle2 className="w-3 h-3 text-slate-400 mb-1" />
                    <span className="text-sm font-bold text-slate-700">{stats.qualified}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-medium">Quals</span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-100">
                    <UserCheck className="w-3 h-3 text-slate-400 mb-1" />
                    <span className="text-sm font-bold text-slate-700">{stats.booked}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-medium">Booked</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};