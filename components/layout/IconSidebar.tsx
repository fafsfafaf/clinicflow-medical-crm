import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Phone, Calendar, Settings, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../lib/store/useThemeStore';

interface SidebarItemProps {
  icon: any;
  label: string;
  path: string;
}

// Simple custom tooltip component for the sidebar
const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, path }) => (
  <NavLink
    to={path}
    className={({ isActive }) => cn(
      "relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 mb-2",
      isActive 
        ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" 
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
    )}
  >
    {({ isActive }) => (
      <>
        <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
        
        {/* Tooltip */}
        <span className="absolute left-14 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-md font-medium">
          {label}
        </span>
      </>
    )}
  </NavLink>
);

const IconSidebar = () => {
  const { sidebarWidth } = useThemeStore();

  const navItems = [
    { icon: LayoutDashboard, label: 'Pipeline', path: '/pipeline' },
    { icon: Users, label: 'Leads', path: '/leads' },
    { icon: Phone, label: 'Voice Agent', path: '/voice' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
  ];

  return (
    <aside 
      className="h-full flex flex-col items-center py-6 z-20 shrink-0 transition-[width]"
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* Logo Mark */}
      <div className="mb-6">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20 ring-1 ring-white/20">
           <Activity className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col w-full px-2 items-center">
        {navItems.map((item) => (
          <SidebarItem key={item.path} {...item} />
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto flex flex-col gap-1 px-2 w-full items-center">
        <SidebarItem icon={Settings} label="Settings" path="/settings" />
      </div>
    </aside>
  );
};

export default IconSidebar;
