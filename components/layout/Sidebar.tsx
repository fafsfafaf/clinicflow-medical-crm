import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Phone, Calendar, Settings, ChevronDown, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';

const Sidebar = () => {
  const { isSidebarOpen } = useAppStore();

  if (!isSidebarOpen) return null;

  const navItems = [
    { icon: LayoutDashboard, label: 'Pipeline', path: '/pipeline' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Phone, label: 'Voice Agent', path: '/voice' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-10">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-sm shadow-blue-200">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="font-bold text-slate-800 text-lg">ClinicDashboard</span>
      </div>

      {/* Org Switcher */}
      <div className="p-4">
        <button className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">V</div>
            <span className="font-medium text-slate-700">Vitality Clinic</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
              isActive
                ? "bg-white text-primary shadow-sm border border-slate-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <item.icon className={cn("w-5 h-5", ({ isActive }: any) => isActive ? "text-primary" : "text-slate-400")} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Invite */}
      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-primary transition-colors">
          <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
            <Plus className="w-3 h-3" />
          </div>
          Invite Member
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;