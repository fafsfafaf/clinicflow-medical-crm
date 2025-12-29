import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../../lib/store/useAppStore';
import { useThemeStore } from '../../lib/store/useThemeStore';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AgentAssignDropdownProps {
  leadId: string;
  currentAgentId: string;
  onOpenChange?: (isOpen: boolean) => void;
}

export const AgentAssignDropdown: React.FC<AgentAssignDropdownProps> = ({ leadId, currentAgentId, onOpenChange }) => {
  const { agents, assignAgent } = useAppStore();
  const { fontGlobal } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // Positioning state
  const [position, setPosition] = useState<{ top: number; left: number; alignClass: string }>({ top: 0, left: 0, alignClass: '' });

  const currentAgent = agents.find(a => a.id === currentAgentId);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state with external prop callback
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Handle outside clicks and scroll to close
  useEffect(() => {
    if (!isOpen) return;

    const handleInteraction = (event: Event) => {
      // Check if click is inside dropdown or trigger
      if (
        dropdownRef.current && 
        (dropdownRef.current.contains(event.target as Node) || 
         triggerRef.current?.contains(event.target as Node))
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleScroll = () => setIsOpen(false); // Close on scroll to maintain stability

    document.addEventListener('mousedown', handleInteraction);
    window.addEventListener('scroll', handleScroll, true); // Capture phase for scrolling in containers
    window.addEventListener('resize', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleInteraction);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isOpen && triggerRef.current) {
      // Calculate position before opening
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownHeight = 200; // estimated max height
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      
      // Default to opening UP (above) like the design, unless not enough space
      const openUp = spaceAbove > dropdownHeight || spaceAbove > spaceBelow;

      setPosition({
        top: openUp ? rect.top - 4 : rect.bottom + 4,
        left: rect.left,
        alignClass: openUp ? '-translate-y-full' : ''
      });
    }
    setIsOpen(!isOpen);
  };

  const handleAssign = (agentId: string) => {
    assignAgent(leadId, agentId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        ref={triggerRef}
        onClick={toggleOpen}
        onPointerDown={(e) => e.stopPropagation()} // Prevent DnD trigger
        className={cn(
          "flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full transition-colors border border-transparent",
          isOpen ? "bg-slate-100 border-slate-200" : "hover:bg-slate-100 hover:border-slate-200"
        )}
      >
        {currentAgent ? (
          <img src={currentAgent.avatar} alt={currentAgent.name} className="w-5 h-5 rounded-full" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500">?</div>
        )}
        <span className="text-[10px] font-medium text-slate-600 max-w-[60px] truncate">
          {currentAgent?.name.split(' ')[0] || 'Unassigned'}
        </span>
        <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Portal Content */}
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className={cn(
            "fixed z-[9999] w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150",
            position.alignClass
          )}
          style={{ 
            top: position.top, 
            left: position.left,
            fontFamily: fontGlobal
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 mb-1">
            Assign to Agent
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => handleAssign(agent.id)}
                className={cn(
                  "w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors group",
                  currentAgentId === agent.id ? "bg-blue-50/50" : ""
                )}
              >
                <div className="relative shrink-0">
                  <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full border border-slate-100" />
                  <span className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                    agent.status === 'online' ? "bg-emerald-500" : 
                    agent.status === 'busy' ? "bg-amber-500" : "bg-slate-300"
                  )} />
                </div>
                <div className="flex flex-col min-w-0">
                   <span className={cn(
                     "text-sm font-semibold truncate", 
                     currentAgentId === agent.id ? "text-primary" : "text-slate-700"
                   )}>
                     {agent.name}
                   </span>
                   <span className="text-[10px] text-slate-400 capitalize">{agent.status}</span>
                </div>
                {currentAgentId === agent.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};