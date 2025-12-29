
import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mic, MicOff, PhoneOff, X, Clock, User, CheckCircle2, XCircle, HelpCircle, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Lead } from '../../lib/mock/types';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

type CallStatus = 'idle' | 'calling' | 'connected' | 'ended';
type CallOutcome = 'qualified' | 'no-answer' | 'follow-up' | 'not-interested' | null;

export const CallModal: React.FC<CallModalProps> = ({ isOpen, onClose, lead }) => {
  const { addLeadActivity, currentUserId, agents, updateLeadStatus } = useAppStore();
  
  const [status, setStatus] = useState<CallStatus>('idle');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [outcome, setOutcome] = useState<CallOutcome>(null);
  const [note, setNote] = useState('');
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setDuration(0);
      setIsMuted(false);
      setOutcome(null);
      setNote('');
    }
    return () => stopTimer();
  }, [isOpen]);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartCall = () => {
    setStatus('calling');
    // Simulate connection delay
    setTimeout(() => {
      setStatus('connected');
      startTimer();
    }, 1500);
  };

  const handleEndCall = () => {
    setStatus('ended');
    stopTimer();
  };

  const handleSave = () => {
    // Log the call activity
    const currentUser = agents.find(a => a.id === currentUserId);
    
    // Determine activity type and content based on outcome
    let content = `Call ended (${formatTime(duration)}). Outcome: ${outcome?.replace('-', ' ')}.`;
    if (note) content += ` Note: ${note}`;

    addLeadActivity(lead.id, {
      id: `act_call_${Date.now()}`,
      type: 'call', // Reuse 'call' type from ActivityLog if available, or 'system'
      content: content,
      author: currentUser?.name || 'Unknown Agent',
      timestamp: new Date().toISOString(),
      metadata: {
        durationSeconds: duration,
        outcome: outcome
      }
    });

    // Optional: Auto-update status based on outcome
    if (outcome === 'qualified') {
        updateLeadStatus(lead.id, 'col_booked');
    } else if (outcome === 'not-interested') {
        updateLeadStatus(lead.id, 'col_lost');
    }

    onClose();
  };

  // Helper for time formatting (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={status === 'ended' ? onClose : undefined} />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300 border border-slate-200">
        
        {/* Header / Top Section */}
        <div className={cn(
          "flex flex-col items-center justify-center pt-10 pb-8 px-6 transition-colors duration-500",
          status === 'connected' ? "bg-slate-50" : "bg-white"
        )}>
          {/* Avatar / Icon */}
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl transition-all duration-500 relative",
            status === 'idle' ? "bg-slate-100 text-slate-400" :
            status === 'calling' ? "bg-blue-50 text-blue-500 ring-4 ring-blue-100" :
            status === 'connected' ? "bg-white ring-4 ring-emerald-100" :
            "bg-slate-100 text-slate-400"
          )}>
             {status === 'calling' && (
               <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
             )}
             <div className="text-3xl font-bold font-headings">
                {lead.firstName[0]}{lead.lastName[0]}
             </div>
             
             {/* Status Badge */}
             <div className={cn(
               "absolute -bottom-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all duration-300",
               status === 'calling' ? "bg-blue-500 text-white" :
               status === 'connected' ? "bg-emerald-500 text-white" :
               status === 'ended' ? "bg-slate-800 text-white" :
               "bg-slate-200 text-slate-600"
             )}>
               {status === 'idle' ? 'Ready' : status}
             </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-center">{lead.firstName} {lead.lastName}</h2>
          <p className="text-slate-500 font-mono text-sm mt-1">{lead.phone}</p>
          
          {/* Timer Display */}
          {(status === 'connected' || status === 'ended') && (
             <div className="mt-4 font-mono text-2xl text-slate-700 font-medium tabular-nums tracking-tight">
               {formatTime(duration)}
             </div>
          )}
        </div>

        {/* Action Area */}
        <div className="bg-white p-6 pb-8">
          
          {/* IDLE STATE */}
          {status === 'idle' && (
            <div className="flex justify-center">
              <Button 
                onClick={handleStartCall}
                className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all"
              >
                <Phone className="w-5 h-5 mr-3 fill-white" />
                Start Call
              </Button>
            </div>
          )}

          {/* CALLING / CONNECTED STATE */}
          {(status === 'calling' || status === 'connected') && (
            <div className="flex items-center justify-center gap-6">
               <button 
                 onClick={() => setIsMuted(!isMuted)}
                 disabled={status !== 'connected'}
                 className={cn(
                   "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200",
                   isMuted 
                     ? "bg-white border-2 border-slate-200 text-slate-900 shadow-sm" 
                     : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                   status !== 'connected' && "opacity-50 cursor-not-allowed"
                 )}
               >
                 {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
               </button>

               <button 
                 onClick={handleEndCall}
                 className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-200 flex items-center justify-center hover:scale-105 transition-all"
               >
                 <PhoneOff className="w-8 h-8 fill-white" />
               </button>
            </div>
          )}

          {/* ENDED STATE */}
          {status === 'ended' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
               <div className="space-y-3">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">Select Outcome</label>
                 <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'qualified', label: 'Qualified', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
                      { id: 'follow-up', label: 'Follow Up', icon: Calendar, color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
                      { id: 'no-answer', label: 'No Answer', icon: HelpCircle, color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
                      { id: 'not-interested', label: 'Not Interested', icon: XCircle, color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setOutcome(item.id as CallOutcome)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1.5",
                          item.color,
                          outcome === item.id ? "ring-2 ring-primary ring-offset-1 scale-[1.02] shadow-md" : "opacity-80 hover:opacity-100 hover:scale-[1.02]"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-xs font-bold">{item.label}</span>
                      </button>
                    ))}
                 </div>
               </div>

               {/* Quick Note Input */}
               {outcome && (
                 <div className="animate-in fade-in slide-in-from-top-2">
                   <input 
                     type="text" 
                     placeholder="Add a quick note (optional)..."
                     value={note}
                     onChange={(e) => setNote(e.target.value)}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                     autoFocus
                   />
                 </div>
               )}

               <div className="flex gap-3 pt-2">
                 <Button variant="ghost" onClick={onClose} className="flex-1 text-slate-500">Close</Button>
                 <Button 
                   onClick={handleSave} 
                   disabled={!outcome}
                   className="flex-1 bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                 >
                   Save Log
                 </Button>
               </div>
            </div>
          )}

        </div>
        
        {/* Close Button (Top Right) */}
        {status === 'idle' && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
