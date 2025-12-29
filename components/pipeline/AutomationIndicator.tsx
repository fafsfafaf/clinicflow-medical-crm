import React from 'react';
import { Zap } from 'lucide-react';

interface AutomationIndicatorProps {
  hasAutomation: boolean;
}

export const AutomationIndicator: React.FC<AutomationIndicatorProps> = ({ hasAutomation }) => {
  if (!hasAutomation) return null;

  return (
    <div className="group relative">
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600 cursor-help">
        <Zap className="w-3 h-3 fill-amber-600" />
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-2 py-1.5 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
        <div className="font-semibold mb-0.5">Automations Active</div>
        <ul className="list-disc pl-3 text-slate-300 space-y-0.5">
          <li>SMS Reminder (24h)</li>
          <li>Missed Call Follow-up</li>
        </ul>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800"></div>
      </div>
    </div>
  );
};