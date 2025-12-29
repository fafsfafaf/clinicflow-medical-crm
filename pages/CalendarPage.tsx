
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppointmentModal } from '../components/calendar/AppointmentModal';
import { EventDetailsModal } from '../components/calendar/EventDetailsModal';
import { CalendarHeader } from '../components/calendar/CalendarHeader';
import { WeekView } from '../components/calendar/WeekView';
import { useAppStore } from '../lib/store/useAppStore';
import { Button } from '../components/ui/button';
import { Plus, RefreshCw, CheckCircle2, AlertTriangle, Loader2, TimerReset } from 'lucide-react';
import { CalendarEvent, MOCK_CALENDAR_EVENTS } from '../lib/mock/calendarData';
import { cn } from '../lib/utils';

// Webhook Constants (Placeholders)
const WEBHOOK_CREATE_URL = 'https://n8n.your-server.com/webhook/create-appointment';
const WEBHOOK_DELETE_URL = 'https://n8n.your-server.com/webhook/delete-appointment';
const API_GET_EVENTS_URL = '/api/calendar/events'; // Mock GET endpoint

// Simulated Server Database (To preserve data across re-fetches in this mock env)
// In a real app, this would be your actual database.
let SIMULATED_DB: CalendarEvent[] = [...MOCK_CALENDAR_EVENTS];

const CalendarPage = () => {
  const { agents, calendarEvents, addCalendarEvent, deleteCalendarEvent, updateCalendarEvent, setCalendarEvents } = useAppStore();

  // UI State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('week');
  const [selectedProviderId, setSelectedProviderId] = useState('all');

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Sync & Loading State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const autoRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- API INTEGRATION ---

  const fetchEvents = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      // 1. Fetch Mock/Local Events (existing logic)
      let allEvents = [...SIMULATED_DB];

      // 2. Fetch Google Events (if connected)
      try {
        const res = await fetch('/api/google/calendar/events');
        if (res.ok) {
          const googleEvents = await res.json();
          // Map Google Events to App Interface
          const mappedGoogleEvents: CalendarEvent[] = googleEvents.map((ge: any) => ({
            id: ge.id,
            title: ge.summary || '(No Title)',
            start: ge.start.dateTime || ge.start.date,
            end: ge.end.dateTime || ge.end.date,
            type: 'google', // specialized type
            providerId: 'google',
            status: 'confirmed',
            notes: ge.description,
            patientName: 'External'
          }));
          allEvents = [...allEvents, ...mappedGoogleEvents];
        } else {
          // If 401, mostly means not connected. We can silently fail or show "Sync Needed"
          if (res.status === 401) {
            // optionally handle "not connected" state
          }
        }
      } catch (e) {
        console.warn('Google Sync failed', e);
      }

      setCalendarEvents(allEvents);
      setSyncStatus('synced');
    } catch (err) {
      console.error("Fetch failed", err);
      setSyncStatus('error');
    }
  }, [setCalendarEvents]);

  // Initial Fetch & Auto Refresh
  useEffect(() => {
    fetchEvents();
    return () => { if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current); };
  }, [fetchEvents]);

  // Auto Refresh Interval
  useEffect(() => {
    if (isAutoRefresh) {
      autoRefreshTimerRef.current = setInterval(fetchEvents, 60000);
    } else {
      if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
    }
    return () => { if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current); };
  }, [isAutoRefresh, fetchEvents]);


  // --- ACTIONS ---

  const handleCreateAppointment = async (data: any) => {
    const startISO = `${data.date}T${data.startTime}:00`;
    const endISO = `${data.date}T${data.endTime}:00`;

    setSyncStatus('syncing');

    // Try Google Calendar Create first
    try {
      const res = await fetch('/api/google/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: data.title,
          description: `Patient: ${data.patientName}\nNotes: ${data.notes || ''}`,
          start: { dateTime: new Date(startISO).toISOString() },
          end: { dateTime: new Date(endISO).toISOString() },
        })
      });

      if (!res.ok) throw new Error('Failed to create in Google Calendar');

      // Refresh to get the real ID and object back
      await fetchEvents();

    } catch (err) {
      console.error('Create failed', err);
      setSyncStatus('error');
      alert('Could not create event found in Google Calendar. Is it connected?');
    }
  };

  const handleUpdateAppointment = async (updatedEvent: CalendarEvent) => {
    setSyncStatus('syncing');

    try {
      // If it's a Google Event, update via API
      // (We assume ID format or type distinguishes it, though simple ID check is risky if collisions. 
      //  Our mock IDs start with 'evt_', Google IDs are alphanumeric long strings)

      const isGoogleEvent = !updatedEvent.id.startsWith('evt_');

      if (isGoogleEvent) {
        const res = await fetch(`/api/google/calendar/events/${updatedEvent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summary: updatedEvent.title,
            description: updatedEvent.notes,
            start: { dateTime: updatedEvent.start },
            end: { dateTime: updatedEvent.end },
          })
        });
        if (!res.ok) throw new Error('Failed update');
      } else {
        // Local Mock Update
        SIMULATED_DB = SIMULATED_DB.map(e => e.id === updatedEvent.id ? updatedEvent : e);
      }

      await fetchEvents();
      setSelectedEvent(null); // Close modal
    } catch (err) {
      console.error('Update failed', err);
      setSyncStatus('error');
    }
  };

  const handleDeleteAppointment = async (eventId: string) => {
    setSyncStatus('syncing');
    try {
      const isGoogleEvent = !eventId.startsWith('evt_');

      if (isGoogleEvent) {
        const res = await fetch(`/api/google/calendar/events/${eventId}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed delete');
      } else {
        SIMULATED_DB = SIMULATED_DB.filter(e => e.id !== eventId);
      }

      await fetchEvents();
    } catch (err) {
      console.error('Delete failed', err);
      setSyncStatus('error');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">Manage appointments and provider schedules.</p>
        </div>

        <div className="flex items-center gap-2">

          {/* Auto-Refresh Toggle */}
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={cn(
              "p-2 rounded-lg transition-colors border",
              isAutoRefresh
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-white text-slate-400 border-slate-200 hover:text-slate-600"
            )}
            title={isAutoRefresh ? "Auto-refresh: ON (60s)" : "Auto-refresh: OFF"}
          >
            <TimerReset className={cn("w-4 h-4", isAutoRefresh && "animate-pulse")} />
          </button>

          {/* Refresh Button & Status */}
          <div className={cn(
            "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all mr-2",
            syncStatus === 'synced' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
              syncStatus === 'syncing' ? "bg-blue-50 text-blue-700 border-blue-100" :
                "bg-red-50 text-red-700 border-red-100"
          )}>
            {syncStatus === 'synced' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {syncStatus === 'syncing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {syncStatus === 'error' && <AlertTriangle className="w-3.5 h-3.5" />}

            {syncStatus === 'synced' && "Synced"}
            {syncStatus === 'syncing' && "Syncing..."}
            {syncStatus === 'error' && "Sync Failed"}

            {/* Divider */}
            <div className="w-px h-3 bg-current opacity-20 mx-1"></div>

            <button
              onClick={fetchEvents}
              disabled={syncStatus === 'syncing'}
              className="hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {syncStatus === 'error' ? "Retry" : "Refresh"}
              <RefreshCw className={cn("w-3 h-3", syncStatus === 'syncing' && "animate-spin")} />
            </button>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="shadow-lg shadow-blue-500/20"
            icon={<Plus className="w-4 h-4 mr-2" />}
          >
            New Appointment
          </Button>
        </div>
      </div>

      {/* Calendar Filters & Nav */}
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        view={view}
        onViewChange={setView}
        selectedProviderId={selectedProviderId}
        onProviderChange={setSelectedProviderId}
        agents={agents}
      />

      {/* Calendar Grid */}
      <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
        <WeekView
          currentDate={currentDate}
          events={calendarEvents}
          view={view}
          selectedProviderId={selectedProviderId}
          agents={agents}
          onEventClick={setSelectedEvent}
        />

        {/* Loading Overlay (First Load) */}
        {calendarEvents.length === 0 && syncStatus === 'syncing' && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Loading events...</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AppointmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        agents={agents}
        onCreate={handleCreateAppointment}
      />

      <EventDetailsModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        onDelete={handleDeleteAppointment}
        onUpdate={handleUpdateAppointment}
        agents={agents}
      />
    </div>
  );
};

export default CalendarPage;
