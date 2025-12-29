
import React, { useEffect } from 'react';
import IconSidebar from './IconSidebar';
import Topbar from './Topbar';
import UIController from '../controller/UIController';
import { useThemeStore } from '../../lib/store/useThemeStore';
import { cn } from '../../lib/utils';
import { GlobalCallWidget } from '../call/GlobalCallWidget';

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useThemeStore();

  // Dynamic styles for the floating window effect + Fonts
  const shellStyles = {
    '--bg-app': theme.appBg,
    '--bg-window': theme.windowBg,
    '--radius-window': `${theme.radius}px`,
    '--border-window': `${theme.borderWidth}px`,
    '--border-color-window': theme.borderColor,
    '--padding-window': `${theme.padding}px`,
    '--shadow-strength': `0 20px 40px -12px rgba(0,0,0, ${theme.shadowStrength / 100})`,
    '--sidebar-width': `${theme.sidebarWidth}px`,
    
    // Drawer styles
    '--drawer-radius': `${theme.drawerRadius}px`,
    '--drawer-width': `${theme.drawerWidth}px`,
    
    // Typography Variables
    '--font-global': theme.fontGlobal,
    '--font-metrics': theme.fontMetrics,
    '--font-headings': theme.fontHeadings,
  } as React.CSSProperties;

  return (
    <div 
      className="h-screen w-screen bg-[var(--bg-app)] text-slate-900 font-sans transition-colors duration-300 overflow-hidden flex"
      style={shellStyles}
    >
      {/* Sidebar - Sits outside the floating window */}
      <IconSidebar />

      {/* Main Content Area - Contains the Floating Window */}
      <div className="flex-1 h-full py-[var(--padding-window)] pr-[var(--padding-window)] pl-0 overflow-hidden">
        
        {/* The Floating Window */}
        <div 
          className="w-full h-full bg-[var(--bg-window)] flex flex-col overflow-hidden relative transition-all duration-300"
          style={{
            borderRadius: 'var(--radius-window)',
            border: 'var(--border-window) solid var(--border-color-window)',
            boxShadow: 'var(--shadow-strength)',
          }}
        >
          {/* Topbar inside the window */}
          <Topbar />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
            {children}
          </main>
        </div>
      </div>

      {/* Live UI Controller */}
      <UIController />
      
      {/* Global Widgets */}
      <GlobalCallWidget />
    </div>
  );
};

export default AppShell;
