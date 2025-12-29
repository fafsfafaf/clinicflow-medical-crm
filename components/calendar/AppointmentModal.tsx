
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sheet } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Calendar, Clock, User, Users, ChevronDown } from 'lucide-react';
import { Agent } from '../../lib/mock/types';
import { useAppStore } from '../../lib/store/useAppStore';
import { cn } from '../../lib/utils';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  onCreate: (data: any) => void;
  initialLeadId?: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, agents, onCreate, initialLeadId }) => {
  const { leads, calendarEvents } = useAppStore();
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing');
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    providerId: agents[0]?.id || 'ag_1',
    leadId: '',
    newPatientName: '',
    notes: ''
  });

  // Time Suggestion State
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const selectedLead = initialLeadId ? leads.find(l => l.id === initialLeadId) : null;
      
      setFormData({
        title: selectedLead ? `Consultation - ${selectedLead.firstName} ${selectedLead.lastName}` : '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        providerId: agents[0]?.id || 'ag_1',
        leadId: initialLeadId || '',
        newPatientName: '',
        notes: ''
      });
      setPatientMode(initialLeadId ? 'existing' : 'existing');
    }
  }, [isOpen, agents, initialLeadId, leads]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowStartSuggestions(false);
        setShowEndSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Logic to calculate available times ---
  const availableSlots = useMemo(() => {
    if (!formData.date) return [];

    // 1. Generate all possible slots (08:00 to 19:00, every 15 mins)
    const slots: string[] = [];
    let currentMins = 8 * 60; // Start at 08:00
    const endMins = 19 * 60; // End at 19:00

    while (currentMins <= endMins) {
      const h = Math.floor(currentMins / 60);
      const m = currentMins % 60;
      const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      slots.push(timeString);
      currentMins += 15;
    }

    // 2. Filter out blocked times based on existing events
    // Filter events for this day and provider
    const dayEvents = calendarEvents.filter(event => {
        if (event.providerId !== 'all' && event.providerId !== formData.providerId) return false;
        
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const targetDate = new Date(formData.date);

        return eventStart.toDateString() === targetDate.toDateString();
    });

    // Remove slots that overlap with any event
    return slots.filter(slot => {
        const [slotH, slotM] = slot.split(':').map(Number);
        const slotTimeValue = slotH * 60 + slotM;

        const isBlocked = dayEvents.some(event => {
            const start = new Date(event.start);
            const end = new Date(event.end);
            const startVal = start.getHours() * 60 + start.getMinutes();
            const endVal = end.getHours() * 60 + end.getMinutes();

            // Check if slot start time falls strictly inside an event
            // Note: If slot == endVal, it's usually free (back-to-back), so use < endVal
            return slotTimeValue >= startVal && slotTimeValue < endVal;
        });

        return !isBlocked;
    });
  }, [formData.date, formData.providerId, calendarEvents]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Resolve Patient Name
    let finalPatientName = 'Unknown Patient';
    if (patientMode === 'existing') {
        const lead = leads.find(l => l.id === formData.leadId);
        if (lead) finalPatientName = `${lead.firstName} ${lead.lastName}`;
    } else {
        finalPatientName = formData.newPatientName || 'New Patient';
    }

    // Auto-generate title if empty
    const finalTitle = formData.title || `Consultation - ${finalPatientName}`;

    onCreate({
        ...formData,
        title: finalTitle,
        patientName: finalPatientName
    });
    onClose();
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} height="auto" title="New Appointment">
      <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
        <div className="p-6 space-y-6" ref={wrapperRef}>
            
            {/* Patient Selection */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase">Patient / Lead</label>
                
                <div className="flex bg-slate-100 p-1 rounded-lg mb-2">
                    <button 
                        type="button"
                        onClick={() => setPatientMode('existing')}
                        className={cn(
                            "flex-1 py-1.5 text-xs font-medium rounded-md transition-all", 
                            patientMode === 'existing' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        Existing Patient/Lead
                    </button>
                    <button 
                        type="button"
                        onClick={() => setPatientMode('new')}
                        className={cn(
                            "flex-1 py-1.5 text-xs font-medium rounded-md transition-all", 
                            patientMode === 'new' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        New Patient/Lead
                    </button>
                </div>

                {patientMode === 'existing' ? (
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select 
                            className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={formData.leadId}
                            onChange={(e) => {
                                const lead = leads.find(l => l.id === e.target.value);
                                setFormData({
                                    ...formData, 
                                    leadId: e.target.value,
                                    // Auto-suggest title
                                    title: lead ? `Consultation - ${lead.firstName} ${lead.lastName}` : formData.title
                                });
                            }}
                        >
                            <option value="">Select a patient/lead...</option>
                            {leads.map(lead => (
                                <option key={lead.id} value={lead.id}>{lead.firstName} {lead.lastName}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="Full Name (e.g. John Doe)" 
                                value={formData.newPatientName}
                                onChange={(e) => setFormData({...formData, newPatientName: e.target.value})}
                                className="pl-10"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Title */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Appointment Title</label>
                <Input 
                    placeholder="e.g. Consultation" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="font-medium"
                />
            </div>

            {/* Provider */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Assign Provider</label>
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

            {/* Schedule (Date & Smart Time) */}
            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-700 uppercase">Schedule</label>
               <div className="grid grid-cols-1 gap-3">
                  <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                          type="date" 
                          className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          required
                      />
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3 mt-2">
                  {/* Start Time */}
                  <div className="space-y-1 relative">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Start Time</span>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={formData.startTime}
                            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                            onFocus={() => setShowStartSuggestions(true)}
                            placeholder="09:00"
                            required
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
                            {availableSlots.length === 0 && (
                                <div className="px-3 py-4 text-center text-xs text-slate-400 italic">
                                    No free slots
                                </div>
                            )}
                        </div>
                    )}
                  </div>

                  {/* End Time */}
                  <div className="space-y-1 relative">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">End Time</span>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={formData.endTime}
                            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                            onFocus={() => setShowEndSuggestions(true)}
                            placeholder="10:00"
                            required
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
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Internal Notes</label>
                <textarea 
                    className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Add details about the appointment..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
            </div>

        </div>

        <div className="p-6 border-t border-slate-100 mt-auto flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="shadow-lg shadow-blue-500/20 px-6">Create Appointment</Button>
        </div>
      </form>
    </Sheet>
  );
};
