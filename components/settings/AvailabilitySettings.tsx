
import React, { useState } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Clock, Calendar, Check, Ban, Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const DAYS = [
  { id: 'mon', label: 'M' },
  { id: 'tue', label: 'T' },
  { id: 'wed', label: 'W' },
  { id: 'thu', label: 'T' },
  { id: 'fri', label: 'F' },
  { id: 'sat', label: 'S' },
  { id: 'sun', label: 'S' },
];

const DURATIONS = [15, 30, 45, 60];
const BUFFERS = [0, 5, 10, 15, 30];

export const AvailabilitySettings = () => {
  const { availability, updateAvailability, toggleWorkingDay, addBlockedDate, removeBlockedDate } = useAppStore();
  const [newBlockDate, setNewBlockDate] = useState('');

  const handleAddBlockDate = () => {
    if (newBlockDate) {
      addBlockedDate(newBlockDate);
      setNewBlockDate('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Appointment Rules</h2>
        <p className="text-sm text-slate-500 mt-1">Configure when patients can book appointments with you.</p>
      </div>

      {/* 1. Working Days & Hours */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Weekly Schedule</h3>
        </div>
        <CardContent className="p-6 space-y-6">
          
          {/* Days Toggle */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-900 block">Working Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const isActive = availability.workingDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    onClick={() => toggleWorkingDay(day.id)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border",
                      isActive 
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200" 
                        : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400">
              Days not selected will be marked as unavailable.
            </p>
          </div>

          {/* Hours Input */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-medium text-slate-900 block">Standard Hours</label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="time"
                  value={availability.workHourStart}
                  onChange={(e) => updateAvailability({ workHourStart: e.target.value })}
                  className="pl-3 pr-2 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 w-32"
                />
              </div>
              <span className="text-slate-400 font-medium">to</span>
              <div className="relative">
                <input
                  type="time"
                  value={availability.workHourEnd}
                  onChange={(e) => updateAvailability({ workHourEnd: e.target.value })}
                  className="pl-3 pr-2 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 w-32"
                />
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* 2. Appointment Configuration */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Booking Settings</h3>
        </div>
        <CardContent className="p-6 space-y-6">
          
          {/* Duration */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-900 block">Appointment Duration</label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => updateAvailability({ appointmentDuration: mins })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                    availability.appointmentDuration === mins
                      ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Buffer */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-900 block">Buffer Time (Between Slots)</label>
            <div className="flex flex-wrap gap-2">
              {BUFFERS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => updateAvailability({ bufferTime: mins })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                    availability.bufferTime === mins
                      ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {mins === 0 ? 'None' : `${mins} min`}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Extra time added after each appointment to prepare for the next patient.
            </p>
          </div>

        </CardContent>
      </Card>

      {/* 3. Blocked Dates */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Ban className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Blocked Dates (Time Off)</h3>
        </div>
        <CardContent className="p-6">
          <div className="flex gap-2 mb-4">
            <Input 
              type="date" 
              value={newBlockDate}
              onChange={(e) => setNewBlockDate(e.target.value)}
              className="w-48 bg-white"
            />
            <Button onClick={handleAddBlockDate} disabled={!newBlockDate} variant="secondary" icon={<Plus className="w-4 h-4 mr-2" />}>
              Block Date
            </Button>
          </div>

          {availability.blockedDates.length === 0 ? (
            <div className="text-sm text-slate-400 italic">No specific dates blocked.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availability.blockedDates.map((date) => (
                <div key={date} className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100 text-sm font-medium">
                  <span>{new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <button 
                    onClick={() => removeBlockedDate(date)}
                    className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
