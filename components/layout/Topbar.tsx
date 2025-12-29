
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, ChevronDown, Check, X, BellRing, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { useAppStore } from '../../lib/store/useAppStore';
import { useThemeStore } from '../../lib/store/useThemeStore';
import { createPortal } from 'react-dom';
import { cn, formatRelativeTime } from '../../lib/utils';
import { LeadDetailDrawer } from '../leads/LeadDetailDrawer';

const Topbar = () => {
  const { searchQuery, setSearchQuery, notifications, currentUserId, markNotificationAsRead, markAllNotificationsAsRead, removeNotification } = useAppStore();
  const { topbarHeight, fontGlobal } = useThemeStore();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifButtonRef = useRef<HTMLButtonElement>(null);
  
  // State to open lead drawer if notification is clicked
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Filter notifications for the current user
  const myNotifications = notifications.filter(n => n.recipientId === currentUserId);
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  const handleNotifClick = (notifId: string, leadId: string) => {
    markNotificationAsRead(notifId);
    setSelectedLeadId(leadId); // Open the lead context
    setIsNotifOpen(false);
  };

  const handleActionClick = (e: React.MouseEvent, notifId: string, isRead: boolean) => {
    e.stopPropagation();
    if (isRead) {
      removeNotification(notifId);
    } else {
      markNotificationAsRead(notifId);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifButtonRef.current && !notifButtonRef.current.contains(event.target as Node)) {
        // We rely on the portal content being closed by logic inside the portal render usually, 
        // but here the portal is detached. Simple check:
        const dropdown = document.getElementById('notif-dropdown');
        if (dropdown && !dropdown.contains(event.target as Node)) {
           setIsNotifOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
    <header 
      className="flex items-center justify-between px-8 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10"
      style={{ height: `${topbarHeight}px` }}
    >
      {/* Left: Search */}
      <div className="flex items-center gap-4">
        {/* Org Switcher Compact */}
        <button className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
          Vitality Clinic
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
        
        <div className="h-4 w-px bg-slate-200 mx-2"></div>

        <div className="w-64 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
          <input 
            type="text"
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 bg-slate-50 border-none rounded-lg pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        
        {/* Notifications Bell */}
        <button 
          ref={notifButtonRef}
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          className={cn(
            "w-9 h-9 flex items-center justify-center rounded-lg transition-colors relative",
            isNotifOpen ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          )}
        >
          {unreadCount > 0 ? (
             <BellRing className="w-5 h-5 text-slate-900" />
          ) : (
             <Bell className="w-5 h-5" />
          )}
          
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white shadow-sm animate-pulse"></span>
          )}
        </button>
        
        <div className="pl-2">
          <button className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-full pr-3 transition-colors ring-1 ring-transparent hover:ring-slate-100">
            <img 
              src="https://i.pravatar.cc/150?u=admin" 
              alt="User" 
              className="w-8 h-8 rounded-full shadow-sm"
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-700 leading-none">Dr. Admin</p>
            </div>
          </button>
        </div>
      </div>
    </header>

    {/* Notification Dropdown Portal */}
    {isNotifOpen && notifButtonRef.current && createPortal(
      <div 
        id="notif-dropdown"
        className="fixed z-[9999] w-80 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
        style={{ 
          top: notifButtonRef.current.getBoundingClientRect().bottom + 10, 
          left: notifButtonRef.current.getBoundingClientRect().right - 320,
          fontFamily: fontGlobal
        }}
      >
         <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllNotificationsAsRead}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Mark all read
              </button>
            )}
         </div>

         <div className="max-h-[360px] overflow-y-auto">
            {myNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                 <Bell className="w-8 h-8 opacity-20" />
                 <span className="text-xs">No notifications yet</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {myNotifications.map(notif => (
                   <div 
                      key={notif.id}
                      onClick={() => handleNotifClick(notif.id, notif.leadId)}
                      className={cn(
                        "p-4 transition-all cursor-pointer flex gap-3 relative group",
                        notif.isRead 
                          ? "bg-slate-50/50 opacity-60 hover:opacity-100 hover:bg-slate-50 grayscale-[0.5] hover:grayscale-0" 
                          : "bg-white hover:bg-slate-50"
                      )}
                   >
                      {/* Active Indicator Strip */}
                      {!notif.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                      )}

                      {/* Quick Action Button */}
                      <button
                        onClick={(e) => handleActionClick(e, notif.id, notif.isRead)}
                        className={cn(
                            "absolute top-3 right-3 p-1.5 rounded-full transition-all z-20 focus:outline-none opacity-0 group-hover:opacity-100 shadow-sm",
                            notif.isRead 
                                ? "text-slate-400 hover:text-red-500 hover:bg-red-50 bg-white border border-slate-100" 
                                : "text-blue-500 hover:bg-blue-100 bg-white ring-1 ring-slate-100"
                        )}
                        title={notif.isRead ? "Remove notification" : "Mark as read"}
                      >
                        {notif.isRead ? <Trash2 className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </button>

                      <div className="shrink-0 relative">
                         <img src={notif.senderAvatar} className="w-9 h-9 rounded-full border border-slate-100" />
                         <div className="absolute -bottom-1 -right-1 bg-amber-100 text-amber-600 rounded-full p-0.5 border border-white">
                            <span className="text-[8px] font-bold px-0.5">@</span>
                         </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-6">
                         <p className="text-xs text-slate-600 leading-relaxed">
                            <span className="font-bold text-slate-900">{notif.senderName}</span> {notif.message} <span className="font-semibold text-slate-900">{notif.leadName}</span>.
                         </p>
                         <p className="text-[10px] text-slate-400 mt-1 font-medium">{formatRelativeTime(notif.timestamp)}</p>
                      </div>
                   </div>
                ))}
              </div>
            )}
         </div>
      </div>,
      document.body
    )}

    {/* Hidden Detail Drawer Trigger */}
    <LeadDetailDrawer 
      leadId={selectedLeadId} 
      onClose={() => setSelectedLeadId(null)} 
    />
    </>
  );
};

export default Topbar;
