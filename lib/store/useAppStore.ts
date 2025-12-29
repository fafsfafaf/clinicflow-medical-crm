
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import { Lead, PipelineColumn, Call, Agent, ActivityLog, Notification, LeadFile } from '../mock/types';
import { MOCK_LEADS, DEFAULT_PIPELINE, MOCK_CALLS, MOCK_AGENTS } from '../mock/data';
import { MOCK_CALENDAR_EVENTS, CalendarEvent } from '../mock/calendarData';

export type DateRange = 'today' | '7d' | '30d' | '90d' | 'all';
export type ViewDensity = 'comfortable' | 'compact';

export interface AvailabilityConfig {
  workingDays: string[]; // 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'
  workHourStart: string;
  workHourEnd: string;
  appointmentDuration: number; // minutes
  bufferTime: number; // minutes
  blockedDates: string[]; // ISO date strings 'YYYY-MM-DD'
}

export interface ConnectionState {
  isConnected: boolean;
  connectedAs?: string; // e.g., email address or account ID
  provider?: string;    // e.g., 'gmail', 'mailgun', 'twilio'
  config?: Record<string, any>;
  lastTestedAt?: string;
}

interface AppState {
  // Mock Auth State (for demo purposes, assuming logged in as Sarah Connor)
  currentUserId: string; 

  leads: Lead[];
  pipelineColumns: PipelineColumn[];
  calls: Call[];
  agents: Agent[];
  notifications: Notification[];
  calendarEvents: CalendarEvent[]; // Added calendar events

  searchQuery: string;
  isSidebarOpen: boolean;
  selectedLeadIds: string[];
  
  // Active Call State (Global)
  activeCallLead: Lead | null;
  isCallWidgetMinimized: boolean;
  
  // View State
  dateRange: DateRange;
  viewDensity: ViewDensity; // New state
  isMyLeadsOnly: boolean;
  
  // Integration State
  googleCalendarEmail: string | null;
  emailMode: 'gmail' | 'custom'; // New state for email configuration mode
  connections: {
    email: ConnectionState;
    sms: ConnectionState;
    voice: ConnectionState;
    automations: ConnectionState;
    payments: ConnectionState; 
    erx: ConnectionState;      
  };
  
  // Availability State
  availability: AvailabilityConfig;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setDateRange: (range: DateRange) => void;
  setViewDensity: (density: ViewDensity) => void; // New action
  toggleMyLeadsOnly: () => void;
  toggleSidebar: () => void;
  
  // Call Actions
  startCall: (lead: Lead) => void;
  endActiveCall: () => void;
  toggleCallWidgetMinimize: () => void;

  setLeads: (leads: Lead[]) => void; // New action for DnD reordering
  updateLeadStatus: (leadId: string, newStatus: string) => void;
  updateLeadValue: (leadId: string, value: number) => void;
  updateLeadNotes: (leadId: string, notes: string) => void; 
  addLeadActivity: (leadId: string, activity: ActivityLog) => void; // New action
  addLeadFile: (leadId: string, file: LeadFile) => void; // New action
  addLeadTag: (leadId: string, tag: string) => void;
  removeLeadTag: (leadId: string, tag: string) => void;
  updatePipeline: (columns: PipelineColumn[]) => void;
  reorderPipelineColumns: (activeId: string, overId: string) => void;
  addLead: (lead: Lead) => void;
  assignAgent: (leadId: string, agentId: string) => void;
  
  // Calendar Actions
  setCalendarEvents: (events: CalendarEvent[]) => void; // New Action
  addCalendarEvent: (event: CalendarEvent) => void;
  updateCalendarEvent: (event: CalendarEvent) => void; // New Action
  deleteCalendarEvent: (eventId: string) => void;

  // Integration Actions
  connectGoogleCalendar: (email: string) => void;
  disconnectGoogleCalendar: () => void;
  setEmailMode: (mode: 'gmail' | 'custom') => void; // New action
  updateConnection: (type: keyof AppState['connections'], data: Partial<ConnectionState>) => void;
  
  // Availability Actions
  updateAvailability: (updates: Partial<AvailabilityConfig>) => void;
  toggleWorkingDay: (day: string) => void;
  addBlockedDate: (date: string) => void;
  removeBlockedDate: (date: string) => void;
  
  // Notifications
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void; // New action

  // Bulk Actions
  toggleLeadSelection: (leadId: string) => void;
  selectAllLeads: (leadIds: string[]) => void;
  clearSelection: () => void;
  bulkUpdateStatus: (status: string) => void;
  bulkAssignAgent: (agentId: string) => void;
  bulkDelete: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUserId: 'ag_1', // Defaulting to 'Sarah Connor' for demo
      leads: MOCK_LEADS,
      pipelineColumns: DEFAULT_PIPELINE,
      calls: MOCK_CALLS,
      agents: MOCK_AGENTS,
      notifications: [], // Start empty
      calendarEvents: MOCK_CALENDAR_EVENTS, // Initial mock events
      searchQuery: '',
      isSidebarOpen: true,
      selectedLeadIds: [],
      dateRange: 'all',
      viewDensity: 'comfortable', // Default
      isMyLeadsOnly: false,
      
      activeCallLead: null,
      isCallWidgetMinimized: false,
      
      googleCalendarEmail: null,
      emailMode: 'gmail', // Default to Gmail
      connections: {
        email: { isConnected: false },
        sms: { isConnected: false },
        voice: { isConnected: true, provider: 'Vapi.ai', connectedAs: 'Production Agent' }, // Mock pre-connected
        automations: { isConnected: false },
        payments: { isConnected: false },
        erx: { isConnected: false },
      },
      
      availability: {
        workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        workHourStart: '09:00',
        workHourEnd: '17:00',
        appointmentDuration: 30,
        bufferTime: 5,
        blockedDates: [],
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setDateRange: (range) => set({ dateRange: range }),
      setViewDensity: (density) => set({ viewDensity: density }),
      toggleMyLeadsOnly: () => set((state) => ({ isMyLeadsOnly: !state.isMyLeadsOnly })),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      
      startCall: (lead) => set({ activeCallLead: lead, isCallWidgetMinimized: false }),
      endActiveCall: () => set({ activeCallLead: null }),
      toggleCallWidgetMinimize: () => set((state) => ({ isCallWidgetMinimized: !state.isCallWidgetMinimized })),

      setLeads: (leads) => set({ leads }),

      updateLeadStatus: (leadId, newStatus) => set((state) => ({
        leads: state.leads.map(lead => 
          lead.id === leadId ? { ...lead, status: newStatus, lastActivity: new Date().toISOString() } : lead
        )
      })),

      updateLeadValue: (leadId, value) => set((state) => ({
        leads: state.leads.map(lead => 
          lead.id === leadId ? { ...lead, valueEstimate: value } : lead
        )
      })),

      updateLeadNotes: (leadId, notes) => set((state) => ({
        leads: state.leads.map(lead => 
          lead.id === leadId ? { ...lead, notes: notes } : lead
        )
      })),

      addLeadActivity: (leadId, activity) => set((state) => ({
        leads: state.leads.map(lead => {
          if (lead.id !== leadId) return lead;
          // Add new activity to the beginning of the array
          const newActivities = [activity, ...(lead.activities || [])];
          return { ...lead, activities: newActivities, lastActivity: activity.timestamp };
        })
      })),

      addLeadFile: (leadId, file) => set((state) => ({
        leads: state.leads.map(lead => {
          if (lead.id !== leadId) return lead;
          const newFiles = [file, ...(lead.files || [])];
          return { ...lead, files: newFiles };
        })
      })),

      addLeadTag: (leadId, tag) => set((state) => ({
        leads: state.leads.map(lead => {
          if (lead.id !== leadId) return lead;
          const currentTags = lead.tags || [];
          if (currentTags.includes(tag)) return lead; 
          return { ...lead, tags: [...currentTags, tag] };
        })
      })),

      removeLeadTag: (leadId, tagToRemove) => set((state) => ({
        leads: state.leads.map(lead => {
          if (lead.id !== leadId) return lead;
          return { ...lead, tags: (lead.tags || []).filter(t => t !== tagToRemove) };
        })
      })),

      updatePipeline: (columns) => set({ pipelineColumns: columns }),

      reorderPipelineColumns: (activeId, overId) => set((state) => {
        const oldIndex = state.pipelineColumns.findIndex((c) => c.id === activeId);
        const newIndex = state.pipelineColumns.findIndex((c) => c.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          return {
            pipelineColumns: arrayMove(state.pipelineColumns, oldIndex, newIndex)
          };
        }
        return {};
      }),
      
      addLead: (lead) => set((state) => ({ leads: [...state.leads, lead] })),

      assignAgent: (leadId, agentId) => set((state) => ({
        leads: state.leads.map(lead => 
          lead.id === leadId ? { ...lead, assignedAgentId: agentId } : lead
        )
      })),
      
      // --- Calendar Actions ---
      setCalendarEvents: (events) => set({ calendarEvents: events }),
      
      addCalendarEvent: (event) => set((state) => ({
        calendarEvents: [...state.calendarEvents, event]
      })),

      updateCalendarEvent: (event) => set((state) => ({
        calendarEvents: state.calendarEvents.map(e => e.id === event.id ? event : e)
      })),

      deleteCalendarEvent: (eventId) => set((state) => ({
        calendarEvents: state.calendarEvents.filter(e => e.id !== eventId)
      })),

      // --- Integrations ---
      connectGoogleCalendar: (email) => set({ googleCalendarEmail: email }),
      disconnectGoogleCalendar: () => set({ googleCalendarEmail: null }),
      setEmailMode: (mode) => set({ emailMode: mode }),
      
      updateConnection: (type, data) => set((state) => ({
        connections: {
          ...state.connections,
          [type]: { ...state.connections[type], ...data }
        }
      })),
      
      // --- Availability ---
      updateAvailability: (updates) => set((state) => ({ 
        availability: { ...state.availability, ...updates } 
      })),
      
      toggleWorkingDay: (day) => set((state) => {
        const currentDays = state.availability.workingDays;
        const newDays = currentDays.includes(day)
          ? currentDays.filter(d => d !== day)
          : [...currentDays, day];
        return { availability: { ...state.availability, workingDays: newDays } };
      }),
      
      addBlockedDate: (date) => set((state) => {
        if (state.availability.blockedDates.includes(date)) return state;
        return { availability: { ...state.availability, blockedDates: [...state.availability.blockedDates, date].sort() } };
      }),
      
      removeBlockedDate: (date) => set((state) => ({ 
        availability: { ...state.availability, blockedDates: state.availability.blockedDates.filter(d => d !== date) } 
      })),

      // --- Notifications ---
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications]
      })),

      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        )
      })),

      markAllNotificationsAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      })),

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),


      // --- Bulk Actions ---
      toggleLeadSelection: (leadId) => set((state) => {
        const isSelected = state.selectedLeadIds.includes(leadId);
        return {
          selectedLeadIds: isSelected 
            ? state.selectedLeadIds.filter(id => id !== leadId)
            : [...state.selectedLeadIds, leadId]
        };
      }),

      selectAllLeads: (leadIds) => set({ selectedLeadIds: leadIds }),
      
      clearSelection: () => set({ selectedLeadIds: [] }),

      bulkUpdateStatus: (status) => set((state) => ({
        leads: state.leads.map(lead => 
          state.selectedLeadIds.includes(lead.id) ? { ...lead, status } : lead
        ),
        selectedLeadIds: [] // Clear selection after action
      })),

      bulkAssignAgent: (agentId) => set((state) => ({
        leads: state.leads.map(lead => 
          state.selectedLeadIds.includes(lead.id) ? { ...lead, assignedAgentId: agentId } : lead
        ),
        selectedLeadIds: []
      })),

      bulkDelete: () => set((state) => ({
        leads: state.leads.filter(lead => !state.selectedLeadIds.includes(lead.id)),
        selectedLeadIds: []
      })),
    }),
    {
      name: 'clinicflow-storage',
      version: 15, 
      partialize: (state) => ({ 
        pipelineColumns: state.pipelineColumns, 
        leads: state.leads,
        dateRange: state.dateRange,
        viewDensity: state.viewDensity, // Persist
        isMyLeadsOnly: state.isMyLeadsOnly,
        notifications: state.notifications,
        calendarEvents: state.calendarEvents,
        googleCalendarEmail: state.googleCalendarEmail,
        emailMode: state.emailMode,
        availability: state.availability,
        connections: state.connections,
      }), 
    }
  )
);
