
import React from 'react';
import { ConnectionsView } from '../components/settings/ConnectionsView';
import { AvailabilitySettings } from '../components/settings/AvailabilitySettings';
import { User, Settings, Lock, Bell, Plug, CalendarClock } from 'lucide-react';
import { cn } from '../lib/utils';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = React.useState('availability');

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'availability', label: 'Availability', icon: CalendarClock },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage your account preferences and integrations.</p>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 flex flex-col gap-1 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all text-left",
                activeTab === tab.id 
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-primary" : "text-slate-400")} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-3xl pb-10">
          
          {/* AVAILABILITY TAB */}
          {activeTab === 'availability' && (
             <AvailabilitySettings />
          )}

          {/* INTEGRATIONS TAB */}
          {activeTab === 'integrations' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <ConnectionsView />
            </div>
          )}

          {/* OTHER TABS (Placeholders) */}
          {activeTab !== 'integrations' && activeTab !== 'availability' && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
               <Settings className="w-8 h-8 mb-2 opacity-20" />
               <p className="text-sm">This settings section is under development.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
