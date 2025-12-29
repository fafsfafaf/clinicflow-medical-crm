
import { Agent } from "./types";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;
  type: 'appointment' | 'blocked';
  patientName?: string;
  providerId: string;
  status: 'confirmed' | 'pending' | 'checked-in' | 'completed' | 'cancelled';
  notes?: string;
}

// Helper to create date relative to today at specific hour
const getTodayAt = (hour: number, minute: number = 0, dayOffset: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_1',
    title: 'Consultation - Sarah J.',
    start: getTodayAt(9, 0, 0),
    end: getTodayAt(10, 0, 0),
    type: 'appointment',
    patientName: 'Sarah Johnson',
    providerId: 'ag_1',
    status: 'confirmed'
  },
  {
    id: 'evt_2',
    title: 'Follow-up - Mike T.',
    start: getTodayAt(11, 30, 0),
    end: getTodayAt(12, 0, 0),
    type: 'appointment',
    patientName: 'Mike Tyson',
    providerId: 'ag_1',
    status: 'checked-in'
  },
  {
    id: 'evt_3',
    title: 'Lunch Break',
    start: getTodayAt(12, 0, 0),
    end: getTodayAt(13, 0, 0),
    type: 'blocked',
    providerId: 'ag_1',
    status: 'confirmed'
  },
  {
    id: 'evt_4',
    title: 'TRT Injection - John D.',
    start: getTodayAt(14, 0, 0),
    end: getTodayAt(14, 15, 0),
    type: 'appointment',
    patientName: 'John Doe',
    providerId: 'ag_2',
    status: 'pending'
  },
  {
    id: 'evt_5',
    title: 'New Patient Intake',
    start: getTodayAt(10, 0, 1), // Tomorrow
    end: getTodayAt(11, 30, 1),
    type: 'appointment',
    patientName: 'Emily Blunt',
    providerId: 'ag_1',
    status: 'confirmed'
  },
  {
    id: 'evt_6',
    title: 'Staff Meeting',
    start: getTodayAt(8, 0, 0),
    end: getTodayAt(9, 0, 0),
    type: 'blocked',
    providerId: 'all',
    status: 'confirmed'
  }
];

export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00'
];
