
import React, { useState, useEffect, useRef } from 'react';
import { Phone, Mic, MicOff, PhoneOff, X, Maximize2, Minimize2, GripHorizontal, CheckCircle2, Calendar, HelpCircle, XCircle, ChevronUp, ChevronDown, PenTool, StickyNote } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';

type CallStatus = 'calling' | 'connected' | 'ended';
type CallOutcome = 'qualified' | 'no-answer' | 'follow-up' | 'not-interested' | null;

export const GlobalCallWidget = () => {
  const { 
    activeCallLead, 
    endActiveCall, 
    addLeadActivity, 
    currentUserId, 
    agents, 
    updateLeadStatus,
    isCallWidgetMinimized,
    toggleCallWidgetMinimize
  } = useAppStore();
  
  const [status, setStatus] = useState<CallStatus>('calling');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [outcome, setOutcome] = useState<CallOutcome>(null);
  
  // Note State
  const [note, setNote] = useState('');
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  
  // Dragging State
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 400 }); // Default bottom right-ish
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 }); // Mouse position relative to widget
  const widgetRef = useRef<HTMLDivElement>(null);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize call when lead changes (new call)
  useEffect(() => {
    if (activeCallLead) {
      setStatus('calling');
      setDuration(0);
      setIsMuted(false);
      setOutcome(null);
      setNote('');
      setIsNoteExpanded(false);
      
      // Reset position to bottom right on new call if it's off screen
      setPosition({ x: window.innerWidth - 350, y: window.innerHeight - 500 });

      // Simulate connection
      const connectTimer = setTimeout(() => {
        setStatus('connected');
        startTimer();
      }, 1800);

      return () => clearTimeout(connectTimer);
    } else {
      stopTimer();
    }
  }, [activeCallLead]);

  // --- DRAG LOGIC ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate new position based on mouse delta
      // We want the widget to follow the mouse, offset by where we clicked inside the widget
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;

      // Simple boundary checks (optional, keeps it on screen)
      const clampedX = Math.max(0, Math.min(window.innerWidth - 320, newX));
      const clampedY = Math.max(0, Math.min(window.innerHeight - 100, newY));

      setPosition({ x: clampedX, y: clampedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only trigger drag if clicking the header/grip area
    setIsDragging(true);
    // Calculate the offset of the mouse click relative to the top-left of the widget
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
        dragStartRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
  };

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

  const handleEndCall = () => {
    setStatus('ended');
    stopTimer();
    // Auto-expand if minimized so user can select outcome
    if (isCallWidgetMinimized) toggleCallWidgetMinimize();
    // Ensure note is expanded for final details
    setIsNoteExpanded(true);
  };

  const handleSaveAndClose = () => {
    if (!activeCallLead) return;

    // Log the activity
    const currentUser = agents.find(a => a.id === currentUserId);
    let content = `Call ended (${formatTime(duration)}). Outcome: ${outcome?.replace('-', ' ')}.`;
    
    // We append the note to the content, or separate it if logic requires
    if (note) {
        content += ` Note: ${note}`;
    }

    addLeadActivity(activeCallLead.id, {
      id: `act_call_${Date.now()}`,
      type: 'call', 
      content: content,
      author: currentUser?.name || 'Unknown Agent',
      timestamp: new Date().toISOString(),
      metadata: {
        durationSeconds: duration,
        outcome: outcome
      }
    });

    // Update status based on outcome logic
    if (outcome === 'qualified') updateLeadStatus(activeCallLead.id, 'col_booked');
    if (outcome === 'not-interested') updateLeadStatus(activeCallLead.id, 'col_lost');

    endActiveCall();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeCallLead) return null;

  // --- MINIMIZED VIEW ---
  if (isCallWidgetMinimized) {
    return (
      <div 
        ref={widgetRef}
        className="fixed z-[200] cursor-move animate-in fade-in zoom-in-95 duration-300"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
      >
        <div className={cn(
          "flex items-center gap-4 px-4 py-3 rounded-full shadow-2xl border transition-all hover:scale-105 active:scale-95",
          status === 'connected' ? "bg-emerald-900 text-white border-emerald-800" :
          status === 'ended' ? "bg-slate-800 text-white border-slate-700" : 
          "bg-blue-600 text-white border-blue-500"
        )}>
          <div className="flex items-center gap-2 pointer-events-none">
             <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
             <span className="font-mono font-bold text-sm tabular-nums">{formatTime(duration)}</span>
          </div>
          
          <div className="w-px h-4 bg-white/20"></div>
          
          <div className="flex items-center gap-2 max-w-[120px] pointer-events-none">
             <span className="text-xs font-semibold truncate">{activeCallLead.firstName} {activeCallLead.lastName}</span>
          </div>

          <div className="flex gap-1" onMouseDown={(e) => e.stopPropagation()}>
            <button 
              onClick={toggleCallWidgetMinimize}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <Maximize2 className="w-4 h-4 fill-white" />
            </button>
            <button 
              onClick={handleEndCall}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-red-500 flex items-center justify-center transition-colors"
            >
              <PhoneOff className="w-4 h-4 fill-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- EXPANDED VIEW ---
  return (
    <div 
      ref={widgetRef}
      className={cn(
        "fixed z-[200] w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300 ring-1 ring-black/5",
        isDragging ? "cursor-grabbing scale-[1.02] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)]" : "cursor-default"
      )}
      style={{ left: position.x, top: position.y }}
    >
      
      {/* Header (Draggable Area) */}
      <div 
        className={cn(
          "px-6 py-4 flex items-start justify-between bg-gradient-to-b transition-colors duration-500 shrink-0 cursor-grab active:cursor-grabbing select-none",
          status === 'calling' ? "from-blue-50 to-white" : 
          status === 'connected' ? "from-emerald-50 to-white" : 
          "from-slate-100 to-white"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="pointer-events-none">
           <div className="flex items-center gap-2 mb-1">
             <span className={cn(
               "w-2 h-2 rounded-full",
               status === 'calling' ? "bg-blue-500 animate-ping" : 
               status === 'connected' ? "bg-emerald-500" : "bg-slate-400"
             )} />
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{status}</span>
           </div>
           <h3 className="font-bold text-lg text-slate-900 leading-tight">{activeCallLead.firstName} {activeCallLead.lastName}</h3>
           <p className="text-xs text-slate-500 font-mono mt-0.5">{activeCallLead.phone}</p>
        </div>
        
        <div className="flex gap-1" onMouseDown={(e) => e.stopPropagation()}>
            <div className="p-1.5 text-slate-300">
                <GripHorizontal className="w-4 h-4" />
            </div>
            <button onClick={toggleCallWidgetMinimize} className="p-1.5 hover:bg-white/50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
            <Minimize2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Active Call Body */}
      {status !== 'ended' ? (
        <div className="flex-1 flex flex-col p-6 pt-2 space-y-6">
           
           {/* Timer */}
           <div className="text-center">
             <div className="text-4xl font-mono font-medium text-slate-700 tracking-tighter tabular-nums select-none">
               {formatTime(duration)}
             </div>
           </div>

           {/* Controls */}
           <div className="flex items-center gap-6 w-full justify-center">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 border",
                  isMuted 
                    ? "bg-amber-100 border-amber-200 text-amber-700" 
                    : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                )}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button 
                onClick={handleEndCall}
                className="w-16 h-16 rounded-2xl bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-100 flex items-center justify-center hover:scale-105 transition-all"
              >
                <PhoneOff className="w-7 h-7 fill-white" />
              </button>
           </div>
           
           {/* Expandable Note Section */}
           <div className="w-full relative transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
             {!isNoteExpanded ? (
                <button 
                  onClick={() => setIsNoteExpanded(true)}
                  className="w-full group flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all text-left"
                >
                   <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
                      <PenTool className="w-4 h-4" />
                   </div>
                   <div className="flex-1">
                      <div className="text-xs font-bold text-slate-700">Quick Note</div>
                      <div className="text-[10px] text-slate-400 truncate">{note || "Tap to take notes during call..."}</div>
                   </div>
                   <ChevronUp className="w-4 h-4 text-slate-300" />
                </button>
             ) : (
                <div className="bg-amber-50 rounded-xl border border-amber-100 p-1 shadow-inner animate-in slide-in-from-bottom-2 fade-in duration-300">
                   <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-amber-100/50">
                      <div className="flex items-center gap-1.5 text-amber-800">
                         <StickyNote className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-bold uppercase tracking-wider">Live Notes</span>
                      </div>
                      <button onClick={() => setIsNoteExpanded(false)} className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded p-0.5">
                         <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                   </div>
                   <textarea 
                     className="w-full h-32 p-2 text-sm bg-transparent border-none focus:ring-0 resize-none text-slate-800 placeholder:text-amber-800/30 leading-relaxed"
                     placeholder="Typing notes will automatically sync to lead profile..."
                     value={note}
                     onChange={(e) => setNote(e.target.value)}
                     autoFocus
                   />
                </div>
             )}
           </div>
        </div>
      ) : (
        // --- POST CALL DISPOSITION ---
        <div className="flex-1 p-5 space-y-4 animate-in slide-in-from-right-4 duration-300">
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
                    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1.5 h-20",
                    item.color,
                    outcome === item.id ? "ring-2 ring-primary ring-offset-1 scale-[1.02] shadow-md z-10" : "opacity-80 hover:opacity-100 hover:scale-[1.02]"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              ))}
           </div>
           
           {/* Final Note Review */}
           <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">Call Summary</label>
             <textarea 
               className="w-full h-20 p-2 text-sm bg-white rounded-lg border border-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
               placeholder="Finalize your notes..."
               value={note}
               onChange={(e) => setNote(e.target.value)}
             />
           </div>

           <Button 
             className="w-full shadow-lg shadow-blue-200" 
             onClick={handleSaveAndClose}
             disabled={!outcome}
           >
             Save Log
           </Button>
        </div>
      )}
    </div>
  );
};
