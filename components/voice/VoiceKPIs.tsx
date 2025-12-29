import React from 'react';
import { Card } from '../ui/card';
import { Phone, Activity, UserCheck, DollarSign } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';

interface VoiceKPIsProps {
  totalCalls: number;
  connectedCount: number;
  qualifiedCount: number;
  totalCost: number;
}

export const VoiceKPIs: React.FC<VoiceKPIsProps> = ({ 
  totalCalls, 
  connectedCount, 
  qualifiedCount, 
  totalCost 
}) => {
  
  const connectRate = totalCalls > 0 ? Math.round((connectedCount / totalCalls) * 100) : 0;

  const MetricItem = ({ label, value, icon: Icon, colorClass }: any) => (
    <div className="flex-1 flex flex-col justify-center gap-1 p-4 border-r border-slate-100 last:border-0 first:pl-2">
      <div className="flex items-center gap-2 text-slate-500 mb-1">
        <div className={cn("p-1.5 rounded-md", colorClass)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 font-metrics pl-1">
        {value}
      </div>
    </div>
  );

  return (
    <Card className="flex flex-col sm:flex-row border-slate-200 shadow-sm bg-white overflow-hidden">
      <MetricItem 
        label="Total Calls" 
        value={totalCalls} 
        icon={Phone} 
        colorClass="bg-blue-50 text-blue-600"
      />
      <MetricItem 
        label="Connected" 
        value={`${connectRate}%`} 
        icon={Activity} 
        colorClass="bg-indigo-50 text-indigo-600"
      />
      <MetricItem 
        label="Qual / Booked" 
        value={qualifiedCount} 
        icon={UserCheck} 
        colorClass="bg-emerald-50 text-emerald-600"
      />
      <MetricItem 
        label="Est. Cost" 
        value={formatCurrency(totalCost)} 
        icon={DollarSign} 
        colorClass="bg-slate-100 text-slate-600"
      />
    </Card>
  );
};