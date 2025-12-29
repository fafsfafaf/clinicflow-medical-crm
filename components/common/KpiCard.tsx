import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, change, trend = 'neutral', icon, className }) => {
  return (
    <Card className={cn("border-slate-200 shadow-sm transition-all hover:shadow-md", className)}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {icon && <div className="text-slate-400 p-1.5 bg-slate-50 rounded-md">{icon}</div>}
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-bold text-slate-900 font-metrics tracking-tight">
            {value}
          </h3>
          {change && (
            <div className={cn(
              "flex items-center text-xs font-bold px-2 py-0.5 rounded-full",
              trend === 'up' ? "text-emerald-700 bg-emerald-50" : 
              trend === 'down' ? "text-red-700 bg-red-50" : "text-slate-600 bg-slate-100"
            )}>
              {trend === 'up' && <ArrowUpRight className="w-3 h-3 mr-1" />}
              {trend === 'down' && <ArrowDownRight className="w-3 h-3 mr-1" />}
              {change}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
