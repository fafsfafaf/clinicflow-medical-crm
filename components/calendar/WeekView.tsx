
import React from 'react';
import { CalendarEvent } from '../../lib/mock/calendarData';
import { cn } from '../../lib/utils';
import { Agent } from '../../lib/mock/types';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  view: 'day' | 'week';
  selectedProviderId: string;
  agents: Agent[];
  onEventClick: (event: CalendarEvent) => void;
}

const START_HOUR = 8;
const END_HOUR = 19; // 7 PM
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);
const HOUR_HEIGHT = 80; // Increased from 64px to 80px for better 15-min slot visibility

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  view,
  selectedProviderId,
  agents,
  onEventClick
}) => {
  // 1. Calculate Days to display
  const getDays = () => {
    if (view === 'day') return [currentDate];
    
    const start = new Date(currentDate);
    const day = start.getDay(); // 0 is Sunday
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Make Monday start
    start.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) { // Mon-Sun
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        days.push(d);
    }
    return days;
  };

  const daysToRender = getDays();

  // 2. Position Helpers
  const getTopOffset = (dateStr: string) => {
    const d = new Date(dateStr);
    const hour = d.getHours();
    const minutes = d.getMinutes();
    const offsetHours = hour - START_HOUR;
    return (offsetHours * 60 + minutes) * (HOUR_HEIGHT / 60);
  };

  const getHeight = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMins = (end.getTime() - start.getTime()) / (1000 * 60);
    // Ensure minimum height for visibility (e.g. 20px)
    return Math.max(diffMins * (HOUR_HEIGHT / 60), 22); 
  };

  const isSameDay = (d1: Date, d2Str: string) => {
    const d2 = new Date(d2Str);
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const getEventStyle = (event: CalendarEvent) => {
    switch (event.type) {
        case 'blocked': return 'bg-slate-100 border-slate-200 text-slate-500';
        default:
            if (event.status === 'checked-in') return 'bg-purple-100 border-purple-200 text-purple-700';
            if (event.status === 'confirmed') return 'bg-blue-100 border-blue-200 text-blue-700';
            return 'bg-amber-50 border-amber-200 text-amber-700';
    }
  };

  const filteredEvents = events.filter(e => 
    selectedProviderId === 'all' || e.providerId === selectedProviderId || e.providerId === 'all'
  );

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      
      {/* Header Row (Days) - Sticky Top */}
      <div className="flex border-b border-slate-200 bg-white z-30 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]">
        {/* Fixed Width Time Header to match Time Column */}
        <div className="w-20 shrink-0 border-r border-slate-100 bg-slate-50/80" /> 
        
        {daysToRender.map((day, i) => {
            const isToday = new Date().toDateString() === day.toDateString();
            return (
                <div key={i} className={cn(
                    "flex-1 py-3 text-center border-r border-slate-100 last:border-0",
                    isToday ? "bg-blue-50/30" : "bg-white"
                )}>
                    <div className={cn("text-[11px] font-bold uppercase mb-1 tracking-wider", isToday ? "text-blue-600" : "text-slate-400")}>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={cn(
                        "text-lg font-bold w-9 h-9 rounded-full flex items-center justify-center mx-auto transition-colors",
                        isToday ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-slate-700 hover:bg-slate-50"
                    )}>
                        {day.getDate()}
                    </div>
                </div>
            );
        })}
      </div>

      {/* Grid Body - Scrollable Area */}
      <div className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
         <div className="flex relative" style={{ minHeight: `${HOURS.length * HOUR_HEIGHT}px` }}>
            
            {/* Time Axis (Left Column) - Fixed Width */}
            <div className="w-20 shrink-0 border-r border-slate-100 bg-slate-50/40 select-none z-20">
               {HOURS.map((h) => (
                   <div key={h} className="border-b border-slate-100 relative box-border" style={{ height: `${HOUR_HEIGHT}px` }}>
                       {/* Label aligns with top border of row, padded from right */}
                       <span className="absolute -top-3 right-3 text-[11px] font-medium text-slate-400 tabular-nums">
                         {h > 12 ? h - 12 : h} {h >= 12 ? 'PM' : 'AM'}
                       </span>
                   </div>
               ))}
            </div>

            {/* Days Columns */}
            {daysToRender.map((day, i) => (
                <div key={i} className="flex-1 border-r border-slate-100 last:border-0 relative group min-w-[100px]">
                    {/* Background Grid Lines */}
                    {HOURS.map((h) => (
                        <div key={h} className="border-b border-slate-50 box-border" style={{ height: `${HOUR_HEIGHT}px` }} />
                    ))}

                    {/* Current Time Indicator (Today Only) */}
                    {new Date().toDateString() === day.toDateString() && (
                        <div 
                            className="absolute w-full border-t-2 border-red-400 z-10 pointer-events-none flex items-center opacity-70"
                            style={{ top: `${getTopOffset(new Date().toISOString())}px` }}
                        >
                            <div className="w-2 h-2 bg-red-400 rounded-full -ml-1 shadow-sm"></div>
                        </div>
                    )}

                    {/* Events */}
                    {filteredEvents.filter(e => isSameDay(day, e.start)).map(event => {
                        const top = getTopOffset(event.start);
                        const height = getHeight(event.start, event.end);
                        const isShort = height < 35; // Logic for tight spaces
                        
                        return (
                            <button
                                key={event.id}
                                onClick={() => onEventClick(event)}
                                className={cn(
                                    "absolute inset-x-1.5 rounded-lg border text-left overflow-hidden transition-all hover:brightness-95 hover:z-20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                                    getEventStyle(event),
                                    "flex flex-col",
                                    isShort ? "justify-center px-2" : "p-2"
                                )}
                                style={{ top: `${top}px`, height: `${height}px` }}
                            >
                                <div className={cn(
                                    "font-bold text-[11px] leading-snug text-slate-800", 
                                    isShort ? "truncate" : "line-clamp-2"
                                )}>
                                    {event.title}
                                </div>
                                
                                {!isShort && (
                                    <div className="text-[10px] opacity-80 mt-0.5 font-medium tracking-tight">
                                        {new Date(event.start).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})} - {new Date(event.end).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};
