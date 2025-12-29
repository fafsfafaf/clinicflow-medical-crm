import React from 'react';
import { Call, Lead } from '../../lib/mock/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Phone, ArrowUpRight, ArrowDownLeft, Clock, User } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface VoiceCallListProps {
  calls: Call[];
  leads: Lead[];
  onSelectCall: (leadId: string) => void;
}

export const VoiceCallList: React.FC<VoiceCallListProps> = ({ calls, leads, onSelectCall }) => {
  
  const getLeadName = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead ? `${lead.firstName} ${lead.lastName}` : 'Unknown Patient';
  };

  const getOutcomeVariant = (outcome: string) => {
    switch (outcome) {
      case 'booked':
      case 'qualified': return 'success';
      case 'connected': return 'default';
      case 'missed': return 'danger';
      default: return 'outline';
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <Card className="h-full border-slate-200 shadow-sm flex flex-col">
      <CardHeader className="py-4 px-6 border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Call History</CardTitle>
      </CardHeader>
      <div className="flex-1 overflow-y-auto">
        {calls.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No calls found for this period.</div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-slate-400 font-medium text-xs sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 font-semibold">Direction</th>
                <th className="px-6 py-3 font-semibold">Patient</th>
                <th className="px-6 py-3 font-semibold">Time</th>
                <th className="px-6 py-3 font-semibold">Duration</th>
                <th className="px-6 py-3 font-semibold text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calls.map((call) => (
                <tr 
                  key={call.id} 
                  onClick={() => onSelectCall(call.leadId)}
                  className="group hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border",
                        call.direction === 'inbound' 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                          : "bg-blue-50 border-blue-100 text-blue-600"
                      )}>
                        {call.direction === 'inbound' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <span className="font-medium text-slate-700 capitalize hidden sm:inline-block">{call.direction}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-3.5">
                    <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                       <User className="w-3.5 h-3.5 text-slate-400" />
                       {getLeadName(call.leadId)}
                    </div>
                  </td>

                  <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">
                    {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>

                  <td className="px-6 py-3.5 text-slate-500 font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      {formatDuration(call.durationSeconds)}
                    </div>
                  </td>

                  <td className="px-6 py-3.5 text-right">
                    <Badge variant={getOutcomeVariant(call.outcome)} className="capitalize font-medium">
                      {call.outcome}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
};