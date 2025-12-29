
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sheet } from '../ui/sheet';
import { Button } from '../ui/button';
import { CalendarEvent } from '../../lib/mock/calendarData';
import { Calendar, Clock, User, Trash2, StickyNote, CheckCircle2, Pencil, X, Save, AlertTriangle, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Agent } from '../../lib/mock/types';
import { useAppStore } from '../../lib/store/useAppStore';
import { Input } from '../ui/input';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onDelete: (eventId: string) => void;
  onUpdate: (event: CalendarEvent) => void;
  agents: Agent[];
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ isOpen, onClose, event, onDelete, onUpdate, agents }) => {
  const { calendarEvents } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Time Suggestion State
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Edit Form State
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    providerId: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && event) {
      setIsEditing(false);
      setShowDeleteConfirm(false);
      // Initialize form data from event
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);
      
      setFormData({
        date: startDate.toLocaleDateString('en-CA'), // YYYY-MM-DD
        startTime: startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), // HH:MM
        endTime: endDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), // HH:MM
        providerId: event.providerId,
        notes: event.notes || ''
      });
    }
  }, [isOpen, event]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowStartSuggestions(false);
        setShowEndSuggestions(false);
      }
    };
    if (isEditing) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing]);

  // --- Logic to calculate available times (Identical to AppointmentModal) ---
  const availableSlots = useMemo(() => {
    if (!formData.date || !event) return [];

    const slots: string[] = [];
    let currentMins = 8 * 60; 
    const endMins = 19 * 60;

    while (currentMins <= endMins) {
      const h = Math.floor(currentMins / 60);
      const m = currentMins % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      currentMins += 15;
    }

    const dayEvents = calendarEvents.filter(e => {
        // Exclude CURRENT event from blocking logic (we are editing it)
        if (e.id === event.id) return false;
        
        if (e.providerId !== 'all' && e.providerId !== formData.providerId) return false;
        const eStart = new Date(e.start);
        const targetDate = new Date(formData.date);
        return eStart.toDateString() === targetDate.toDateString();
    });

    return slots.filter(slot => {
        const [slotH, slotM] = slot.split(':').map(Number);
        const slotTimeValue = slotH * 60 + slotM;

        const isBlocked = dayEvents.some(e => {
            const start = new Date(e.start);
            const end = new Date(e.end);
            const startVal = start.getHours() * 60 + start.getMinutes();
            const endVal = end.getHours() * 60 + end.getMinutes();
            return slotTimeValue >= startVal && slotTimeValue < endVal;
        });

        return !isBlocked;
    });
  }, [formData.date, formData.providerId, calendarEvents, event]);


  if (!event) return null;

  const agent = agents.find(a => a.id === event.providerId);
  const start = new Date(event.start);
  const end = new Date(event.end);

  const handleSave = () => {
    if (!formData.date || !formData.startTime || !formData.endTime) return;

    const startISO = `${formData.date}T${formData.startTime}:00`;
    const endISO = `${formData.date}T${formData.endTime}:00`;

    const updatedEvent: CalendarEvent = {
        ...event,
        start: new Date(startISO).toISOString(),
        end: new Date(endISO).toISOString(),
        providerId: formData.providerId,
        notes: formData.notes
    };

    onUpdate(updatedEvent);
    setIsEditing(false);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} height="auto" title={isEditing ? "Reschedule Appointment" : "Appointment Details"}>
      <div className="flex flex-col h-full bg-white">
        
        {/* --- VIEW MODE --- */}
        {!isEditing && (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {/* Header Info */}
                <div className="space-y-1 pb-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            event.status === 'confirmed' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"
                        )}>
                            {event.status}
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{event.title}</h2>
                    {event.patientName && <p className="text-sm text-slate-500 font-medium">Patient: {event.patientName}</p>}
                </div>

                {/* Time */}
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Date & Time</label>
                        <div className="text-sm font-semibold text-slate-900 mt-0.5">
                            {start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                            <Clock className="w-3.5 h-3.5" />
                            {start.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                        </div>
                    </div>
                </div>

                {/* Provider */}
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Provider</label>
                        <div className="flex items-center gap-2 mt-1">
                            {agent ? (
                                <>
                                    <img src={agent.avatar} className="w-6 h-6 rounded-full" alt={agent.name} />
                                    <span className="text-sm font-medium text-slate-900">{agent.name}</span>
                                </>
                            ) : (
                                <span className="text-sm text-slate-500">Unassigned</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {event.notes && (
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <StickyNote className="w-5 h-5" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Notes</label>
                            <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                {event.notes}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- EDIT MODE --- */}
        {isEditing && (
            <div className="p-6 space-y-5 flex-1 overflow-y-auto" ref={wrapperRef}>
                {/* Date */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">New Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="date" 
                            className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                    </div>
                </div>

                {/* Time (Smart Inputs) */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-slate-700 uppercase">Start Time</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={formData.startTime}
                                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                onFocus={() => setShowStartSuggestions(true)}
                                placeholder="HH:MM"
                            />
                            <button 
                                type="button" 
                                tabIndex={-1}
                                onClick={() => setShowStartSuggestions(!showStartSuggestions)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <ChevronDown className="w-3 h-3" />
                            </button>
                        </div>
                        {showStartSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
                                    Verfügbare Zeiten
                                </div>
                                {availableSlots.map(time => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => {
                                            setFormData({...formData, startTime: time});
                                            setShowStartSuggestions(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors"
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-slate-700 uppercase">End Time</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={formData.endTime}
                                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                onFocus={() => setShowEndSuggestions(true)}
                                placeholder="HH:MM"
                            />
                            <button 
                                type="button" 
                                tabIndex={-1}
                                onClick={() => setShowEndSuggestions(!showEndSuggestions)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <ChevronDown className="w-3 h-3" />
                            </button>
                        </div>
                        {showEndSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="sticky top-0 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
                                    Verfügbare Zeiten
                                </div>
                                {availableSlots.map(time => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => {
                                            setFormData({...formData, endTime: time});
                                            setShowEndSuggestions(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors"
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Provider */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">Reassign Provider</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                            className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm appearance-none"
                            value={formData.providerId}
                            onChange={(e) => setFormData({...formData, providerId: e.target.value})}
                        >
                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase">Update Notes</label>
                    <textarea 
                        className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                </div>
            </div>
        )}

        {/* --- FOOTER --- */}
        <div className="p-6 border-t border-slate-100 mt-auto bg-slate-50/50 shrink-0">
            {isEditing ? (
                <div className="flex justify-between gap-3">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button onClick={handleSave} className="shadow-lg shadow-blue-500/20" icon={<Save className="w-4 h-4 mr-2" />}>
                        Save Changes
                    </Button>
                </div>
            ) : showDeleteConfirm ? (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100 text-red-800">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">Möchtest du wirklich diesen Appointment löschen?</p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Abbrechen</Button>
                        <Button 
                            variant="danger" 
                            onClick={() => {
                                onDelete(event.id);
                                onClose();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white border-none shadow-md shadow-red-200"
                        >
                            Ja, löschen
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-between gap-3">
                    <Button 
                        variant="danger" 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                        icon={<Trash2 className="w-4 h-4 mr-2" />}
                    >
                        Delete Appointment
                    </Button>
                    
                    <Button 
                        onClick={() => setIsEditing(true)}
                        className="shadow-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        icon={<Calendar className="w-4 h-4 mr-2" />}
                    >
                        Reschedule
                    </Button>
                </div>
            )}
        </div>
      </div>
    </Sheet>
  );
};
