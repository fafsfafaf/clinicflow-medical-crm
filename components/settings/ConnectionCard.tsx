
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle2, AlertCircle, XCircle, Power, Settings2, RefreshCw, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ConnectionCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'connected' | 'not-connected' | 'error' | 'coming-soon';
  connectedAs?: string;
  providerName?: string;
  onConnect?: () => void;
  onManage?: () => void;
  onTest?: () => void;
  onDisconnect?: () => void;
  isLoading?: boolean;
  children?: React.ReactNode; // Added children prop support
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  name,
  icon,
  description,
  status,
  connectedAs,
  providerName,
  onConnect,
  onManage,
  onTest,
  onDisconnect,
  isLoading,
  children
}) => {
  return (
    <Card className={cn(
      "border-slate-200 shadow-sm transition-all hover:shadow-md",
      status === 'coming-soon' && "opacity-75 bg-slate-50/50"
    )}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          
          {/* Left: Info */}
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
              status === 'connected' ? "bg-white border-blue-100 text-blue-600 shadow-sm" : 
              status === 'error' ? "bg-red-50 border-red-100 text-red-600" :
              "bg-white border-slate-100 text-slate-500"
            )}>
              {icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{name}</h3>
                {status === 'connected' && (
                  <Badge variant="success" className="h-5 px-1.5 gap-1 text-[10px]">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </Badge>
                )}
                {status === 'error' && (
                  <Badge variant="danger" className="h-5 px-1.5 gap-1 text-[10px]">
                    <AlertCircle className="w-3 h-3" /> Error
                  </Badge>
                )}
                {status === 'coming-soon' && (
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-slate-100 text-slate-500 border-slate-200">
                    Coming Soon
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
              
              {status === 'connected' && connectedAs && (
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Connected as <span className="font-semibold text-slate-900">{connectedAs}</span></span>
                  {providerName && <span className="text-slate-400">via {providerName}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
             {status === 'connected' ? (
               <>
                 {onTest && (
                   <Button variant="outline" size="sm" onClick={onTest} className="h-9" title="Test Connection">
                     <Zap className="w-4 h-4 text-slate-500" />
                   </Button>
                 )}
                 {onManage && (
                   <Button variant="outline" size="sm" onClick={onManage} className="h-9 px-4">
                     Manage
                   </Button>
                 )}
                 {onDisconnect && (
                   <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onDisconnect} 
                      className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Disconnect"
                   >
                     <Power className="w-4 h-4" />
                   </Button>
                 )}
               </>
             ) : status === 'coming-soon' ? (
                <Button disabled variant="outline" size="sm" className="opacity-50">Notify Me</Button>
             ) : (
                <Button 
                  onClick={onConnect} 
                  isLoading={isLoading}
                  className={cn(
                    "min-w-[100px] shadow-sm",
                    status === 'error' ? "bg-red-600 hover:bg-red-700" : ""
                  )}
                >
                  {status === 'error' ? 'Reconnect' : 'Connect'}
                </Button>
             )}
          </div>
        </div>
        
        {/* Children (Nested Content) */}
        {children && (
          <div className="mt-6 pt-4 border-t border-slate-50 animate-in fade-in slide-in-from-top-1">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
