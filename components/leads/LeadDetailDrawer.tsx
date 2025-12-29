
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sheet } from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Phone, Mail, Calendar, Mic, FileText, User, Clock, 
  ArrowRight, StickyNote, Activity, MapPin, ExternalLink,
  MessageSquare, History, Stethoscope, Instagram, Facebook, Globe, Users,
  Plus, X, Save, Check, Trash2, AtSign, PenTool, Paperclip, FileIcon
} from 'lucide-react';
import { formatDate, formatCurrency, cn, formatRelativeTime } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';
import { RichTextEditor } from '../ui/RichTextEditor';
import { ActivityLog, Notification, LeadFile } from '../../lib/mock/types';
import { EmailComposerModal } from '../email/EmailComposerModal';
import { SMSComposerModal } from '../sms/SMSComposerModal';
import { AppointmentModal } from '../calendar/AppointmentModal';
import { CalendarEvent } from '../../lib/mock/calendarData';

interface LeadDetailDrawerProps {
  leadId: string | null;
  onClose: () => void;
}

// Pastel Color Palette for Tags (More vibrant now: 200 bg, 800 text)
const PASTEL_COLORS = [
  'bg-red-200 text-red-800 border-red-300',
  'bg-orange-200 text-orange-800 border-orange-300',
  'bg-amber-200 text-amber-800 border-amber-300',
  'bg-yellow-200 text-yellow-800 border-yellow-300',
  'bg-lime-200 text-lime-800 border-lime-300',
  'bg-green-200 text-green-800 border-green-300',
  'bg-emerald-200 text-emerald-800 border-emerald-300',
  'bg-teal-200 text-teal-800 border-teal-300',
  'bg-cyan-200 text-cyan-800 border-cyan-300',
  'bg-sky-200 text-sky-800 border-sky-300',
  'bg-blue-200 text-blue-800 border-blue-300',
  'bg-indigo-200 text-indigo-800 border-indigo-300',
  'bg-violet-200 text-violet-800 border-violet-300',
  'bg-purple-200 text-purple-800 border-purple-300',
  'bg-fuchsia-200 text-fuchsia-800 border-fuchsia-300',
  'bg-pink-200 text-pink-800 border-pink-300',
  'bg-rose-200 text-rose-800 border-rose-300',
];

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ leadId, onClose }) => {
  const { leads, calls, agents, updateLeadValue, updateLeadNotes, addLeadActivity, addLeadTag, removeLeadTag, addNotification, currentUserId, addLeadFile, startCall, addCalendarEvent } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'history'>('overview');
  
  const lead = leads.find(l => l.id === leadId);
  const leadCalls = calls.filter(c => c.leadId === leadId);

  // Value Input State
  const [localValue, setLocalValue] = useState<string>('');
  
  // Tag Input State
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Notes & Files State
  const [newNote, setNewNote] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [editorKey, setEditorKey] = useState(0); // Used to force reset editor
  
  // Modal States
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);
  const [isSMSComposerOpen, setIsSMSComposerOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Ref for auto-scrolling notes history
  const notesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lead) {
      setLocalValue(lead.valueEstimate > 0 ? lead.valueEstimate.toString() : '');
      setNewNote(''); 
      setPendingFiles([]);
      setSaveStatus('idle');
    }
    setIsAddingTag(false);
    setNewTag('');
    setIsEmailComposerOpen(false);
    setIsSMSComposerOpen(false);
    setIsAppointmentModalOpen(false);
  }, [lead]);

  // Scroll to bottom of notes when tab changes or new note added
  useEffect(() => {
    if (activeTab === 'notes' && notesEndRef.current) {
        notesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, lead?.notes]);

  // Focus input when adding tag
  useEffect(() => {
    if (isAddingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isAddingTag]);

  // --- Derived Timeline Data ---
  const timelineItems = useMemo(() => {
    if (!lead) return [];

    const items: Array<{
      id: string;
      type: 'call' | 'note' | 'mention' | 'system' | 'created' | 'file' | 'email' | 'sms';
      timestamp: Date;
      data?: any;
    }> = [];

    // 1. Calls
    leadCalls.forEach(call => {
      items.push({
        id: call.id,
        type: 'call',
        timestamp: new Date(call.timestamp),
        data: call
      });
    });

    // 2. Activities (Notes, Mentions, System, Files, Emails, SMS)
    if (lead.activities) {
      lead.activities.forEach(act => {
        items.push({
          id: act.id,
          type: act.type as any,
          timestamp: new Date(act.timestamp),
          data: act
        });
      });
    }

    // 3. Creation
    items.push({
      id: 'created',
      type: 'created',
      timestamp: new Date(lead.createdAt),
      data: { source: lead.source }
    });

    // Sort descending
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [lead, leadCalls]);


  const handleValueSave = () => {
    if (lead) {
      const numValue = parseFloat(localValue);
      updateLeadValue(lead.id, isNaN(numValue) ? 0 : numValue);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setPendingFiles(prev => [...prev, ...files]);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddNote = () => {
    if (!lead) return;
    const hasNoteContent = newNote && newNote !== '<p><br></p>';
    const hasFiles = pendingFiles.length > 0;

    if (hasNoteContent || hasFiles) {
      // 1. Capture Data immediately
      const contentToSave = newNote;
      const filesToSave = [...pendingFiles];
      const currentUser = agents.find(a => a.id === currentUserId) || { name: 'Dr. Admin', avatar: 'https://i.pravatar.cc/150?u=admin' };
      const authorName = currentUser.name;
      const authorAvatar = currentUser.avatar;
      const timestamp = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      // 2. OPTIMISTIC UI UPDATE: Clear inputs immediately
      setSaveStatus('saving');
      setNewNote('');
      setPendingFiles([]);
      setEditorKey(prev => prev + 1); // Force reset editor component

      // 3. Process Logic
      
      // Handle Notifications
      if (hasNoteContent) {
        agents.forEach(agent => {
          if (contentToSave.includes(`@${agent.name}`)) {
            const notif: Notification = {
              id: `notif_${Date.now()}_${agent.id}`,
              recipientId: agent.id,
              senderId: currentUserId,
              senderName: authorName,
              senderAvatar: authorAvatar,
              leadId: lead.id,
              leadName: `${lead.firstName} ${lead.lastName}`,
              type: 'mention',
              message: `mentioned you in a note`,
              isRead: false,
              timestamp: new Date().toISOString()
            };
            addNotification(notif);
          }
        });
      }

      // Process Files & Build HTML for Note Entry
      let attachmentsHTML = '';
      
      if (filesToSave.length > 0) {
        const fileCards = filesToSave.map(file => {
          const newFile: LeadFile = {
            id: `file_${Date.now()}_${Math.random()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: '#', 
            uploadedAt: new Date().toISOString()
          };
          
          addLeadFile(lead.id, newFile);

          addLeadActivity(lead.id, {
            id: `act_file_${Date.now()}_${Math.random()}`,
            type: 'file',
            content: `Uploaded file: ${file.name}`,
            author: authorName,
            timestamp: new Date().toISOString(),
            metadata: newFile
          });

          const sizeKb = (file.size / 1024).toFixed(1);
          return `
            <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors group/file cursor-pointer">
               <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
               </div>
               <div class="min-w-0 flex-1">
                 <p class="text-xs font-bold text-slate-700 truncate leading-tight">${file.name}</p>
                 <p class="text-[10px] text-slate-400 font-medium">${sizeKb} KB</p>
               </div>
               <div class="text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
               </div>
            </div>
          `;
        }).join('');

        attachmentsHTML = `
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 select-none">
            ${fileCards}
          </div>
        `;
      }

      // Create Note Entry
      if (hasNoteContent || filesToSave.length > 0) {
        const noteBody = hasNoteContent ? contentToSave : (filesToSave.length > 0 ? '<p class="text-slate-400 italic text-xs">Attached files to profile.</p>' : '');
        
        const newEntryHTML = `
          <div class="note-entry border-b border-slate-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0 group">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <img src="${authorAvatar}" class="w-6 h-6 rounded-full border border-slate-200" alt="${authorName}" />
                <span class="text-xs font-bold text-slate-900">${authorName}</span>
              </div>
              <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wide">${timestamp}</span>
            </div>
            <div class="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none pl-8">
              ${noteBody}
              ${attachmentsHTML}
            </div>
          </div>
        `;
        
        const updatedNotes = newEntryHTML + (lead.notes || '');
        updateLeadNotes(lead.id, updatedNotes);

        if (hasNoteContent) {
            const isMention = contentToSave.includes('@');
            addLeadActivity(lead.id, {
            id: `act_${Date.now()}`,
            type: isMention ? 'mention' : 'note',
            content: isMention ? 'Mentioned a teammate in notes' : 'Left a clinical note',
            author: authorName,
            timestamp: new Date().toISOString()
            });
        }
      }

      // 4. Simulate Network completion after UI is already cleared
      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 600);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && lead) {
      addLeadTag(lead.id, newTag.trim());
      setNewTag('');
    }
    setIsAddingTag(false);
  };

  const handleKeyDownTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setIsAddingTag(false);
      setNewTag('');
    }
  };

  const handleCreateAppointment = (data: any) => {
    if (!lead) return;
    const startISO = `${data.date}T${data.startTime}:00`;
    const endISO = `${data.date}T${data.endTime}:00`;
    
    const newEvent: CalendarEvent = {
      id: `evt_${Date.now()}`,
      title: data.title,
      start: new Date(startISO).toISOString(),
      end: new Date(endISO).toISOString(),
      type: 'appointment',
      providerId: data.providerId,
      status: 'confirmed',
      notes: data.notes,
      patientName: data.patientName
    };

    addCalendarEvent(newEvent);
    
    // Log activity
    addLeadActivity(lead.id, {
        id: `act_appt_${Date.now()}`,
        type: 'system',
        content: `Booked appointment: ${data.title} for ${data.date} at ${data.startTime}`,
        author: 'System',
        timestamp: new Date().toISOString()
    });
  };

  const getTagColor = (tag: string) => {
    const t = tag.toLowerCase();
    
    // Priority Keywords (Keep logic as requested)
    if (t.includes('loss') || t.includes('ozempic')) return 'bg-purple-50 text-purple-700 border-purple-100';
    if (t.includes('peptide') || t.includes('trt')) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (t.includes('vip') || t.includes('high')) return 'bg-amber-50 text-amber-700 border-amber-100';
    
    // Deterministic Random Pastel Color for others
    let hash = 0;
    for (let i = 0; i < t.length; i++) {
      hash = t.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PASTEL_COLORS.length;
    
    return PASTEL_COLORS[index];
  };

  if (!lead) return null;

  // Derived state to check if value has changed
  const isValueDirty = lead && parseFloat(localValue || '0') !== lead.valueEstimate;

  const getSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes('instagram')) return <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />;
    if (s.includes('facebook') || s.includes('meta')) return <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />;
    if (s.includes('referral')) return <Users className="w-3.5 h-3.5 text-slate-500" />;
    return <Globe className="w-3.5 h-3.5 text-slate-400" />;
  };

  // Determine title based on stage
  const drawerTitle = lead.status === 'col_patient' ? 'Patient Profile' : 'Lead Profile';

  return (
    <Sheet isOpen={!!lead} onClose={onClose} title={drawerTitle}>
      <div className="flex flex-col h-full bg-white">
        
        {/* Header Section - Sticky Top */}
        <div className="px-6 py-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 shrink-0">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-1 shadow-sm shrink-0">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl font-bold text-slate-600">
                {lead.firstName[0]}{lead.lastName[0]}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{lead.firstName} {lead.lastName}</h1>
                <Badge variant="outline" className="text-xs bg-white">{lead.status.replace('col_', '')}</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Los Angeles, CA</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="flex items-center gap-1.5 font-medium text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-100 shadow-sm">
                  {getSourceIcon(lead.source)} {lead.source}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Score</div>
            <div className="flex items-center gap-3">
               <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${lead.score}%` }} />
               </div>
               <span className="font-bold text-lg text-slate-900">{lead.score}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar - Shrinkable */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 bg-white overflow-x-auto no-scrollbar shrink-0">
          <Button 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 active:scale-95 transition-transform" 
            icon={<Phone className="w-3.5 h-3.5 mr-2"/>}
            onClick={() => startCall(lead)} 
          >
            Call
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="active:scale-95 transition-transform"
            icon={<MessageSquare className="w-3.5 h-3.5 mr-2"/>}
            onClick={() => setIsSMSComposerOpen(true)}
          >
            SMS
          </Button>
          
          {/* Email Button triggers the modal */}
          <Button 
            size="sm" 
            variant="outline" 
            className="active:scale-95 transition-transform"
            icon={<Mail className="w-3.5 h-3.5 mr-2"/>}
            onClick={() => setIsEmailComposerOpen(true)}
          >
            Email
          </Button>
          
          <div className="h-6 w-px bg-slate-200 mx-2 shrink-0" />
          
          <Button 
            size="sm" 
            variant="secondary" 
            className="whitespace-nowrap active:scale-95 transition-transform" 
            icon={<Calendar className="w-3.5 h-3.5 mr-2"/>}
            onClick={() => setIsAppointmentModalOpen(true)}
          >
            Book Appt
          </Button>
          
          <Button size="sm" variant="secondary" className="whitespace-nowrap active:scale-95 transition-transform" icon={<Stethoscope className="w-3.5 h-3.5 mr-2"/>}>Prescribe</Button>
        </div>

        {/* Main Content Area - Flex layout to handle scrolling internally */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Sidebar (Info) - Scrollable independently */}
          <div className="w-[320px] shrink-0 border-r border-slate-100 bg-slate-50/30 overflow-y-auto flex flex-col">
            <div className="p-6 space-y-8">
                {/* Contact Info */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <User className="w-3 h-3" /> Contact Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group">
                      <Phone className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <span className="font-mono">{lead.phone}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group">
                      <Mail className="w-4 h-4 text-slate-400 mt-0.5 group-hover:text-blue-500 transition-colors shrink-0" />
                      <span className="break-all leading-tight">{lead.email}</span>
                    </div>
                  </div>
                </div>

                {/* Financials (Editable) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Opportunity
                  </h4>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-slate-500 text-xs mb-1 font-medium">Estimated Value</div>
                    
                    {/* Editable Value Input */}
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-2xl font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onBlur={handleValueSave}
                        placeholder="0.00"
                        className="w-full py-1 text-3xl font-bold text-emerald-600 placeholder:text-slate-300 border-none focus:ring-0 p-0 focus:outline-none bg-transparent tracking-tight font-metrics no-spinner"
                      />
                    </div>
                    
                    {/* Explicit Save Button - Only shows when dirty */}
                    {isValueDirty && (
                      <div className="mt-2 flex justify-end animate-in fade-in slide-in-from-top-1">
                        <Button 
                          size="sm" 
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          onClick={handleValueSave}
                          icon={<Check className="w-3 h-3 mr-1" />}
                        >
                          Save Amount
                        </Button>
                      </div>
                    )}

                    {localValue === '' && (
                      <div className="text-[10px] text-orange-500 mb-3 font-medium animate-pulse">
                        Enter estimated value
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {(lead.tags || []).map((tag, idx) => (
                      <div 
                        key={`${tag}-${idx}`}
                        className={cn(
                          "px-2.5 py-1 text-xs font-medium rounded-md border flex items-center gap-1.5 group cursor-default",
                          getTagColor(tag)
                        )}
                      >
                        {tag}
                        <button 
                          onClick={() => removeLeadTag(lead.id, tag)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {isAddingTag ? (
                      <div className="flex items-center">
                        <input
                          ref={tagInputRef}
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onBlur={handleAddTag}
                          onKeyDown={handleKeyDownTag}
                          className="px-2.5 py-1 w-24 text-xs font-medium rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          placeholder="Type..."
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsAddingTag(true)}
                        className="px-2.5 py-1 bg-white text-slate-500 text-xs font-medium rounded-md border border-slate-200 border-dashed hover:border-slate-300 hover:text-slate-700 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Tag
                      </button>
                    )}
                  </div>
                </div>
            </div>
          </div>

          {/* Right Main Content - Flex Layout for Sticky Editor */}
          <div className="flex-1 flex flex-col bg-white min-w-0 overflow-hidden relative">
            
            {/* Tabs Header - Sticky */}
            <div className="flex border-b border-slate-100 px-6 shrink-0 bg-white z-10">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'notes', label: 'Clinical Notes', icon: StickyNote },
                { id: 'history', label: 'Call History', icon: History }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id 
                      ? "border-primary text-primary bg-slate-50/50" 
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content Areas */}
            <div className="flex-1 flex flex-col min-h-0 relative">
              
              {/* --- OVERVIEW TAB (Scrollable) --- */}
              {activeTab === 'overview' && (
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="space-y-8 max-w-3xl">
                    {/* Next Step */}
                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 flex items-start gap-4 shadow-sm">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-amber-900">Next Follow-up</h4>
                        <p className="text-sm text-amber-800 mt-1">
                          Scheduled for <span className="font-semibold">{lead.nextFollowUp ? formatDate(lead.nextFollowUp) : 'Not scheduled'}</span>
                        </p>
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-amber-700 hover:text-amber-800 hover:bg-amber-100 h-8 px-3 mt-3 -ml-2 font-medium"
                            onClick={() => setIsAppointmentModalOpen(true)}
                        >
                          Reschedule Event
                        </Button>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Activity Timeline</h3>
                      <div className="relative pl-8 border-l-2 border-slate-100 space-y-8">
                        {timelineItems.map((item) => {
                           // RENDER CALLS (Modified to handle manually logged calls and new rich design)
                           if (item.type === 'call') {
                             const call = item.data;
                             const isActivityLog = 'author' in call; // Simple check if it's an ActivityLog or Call object
                             
                             let authorName = 'Unknown Agent';
                             let duration = 0;
                             let outcome = 'unknown';
                             let noteOrTranscript = '';

                             if (isActivityLog) {
                               // It's a manual log from GlobalCallWidget
                               authorName = call.author;
                               duration = call.metadata?.durationSeconds || 0;
                               outcome = call.metadata?.outcome || 'connected';
                               // Try to parse note from content string "Call ended (00:00). Outcome: x. Note: y"
                               if (call.content.includes('Note:')) {
                                   noteOrTranscript = call.content.split('Note:')[1].trim();
                               }
                             } else {
                               // It's a legacy/mock Call object
                               const agent = agents.find(a => a.id === call.agentId);
                               authorName = agent ? agent.name : 'System';
                               duration = call.durationSeconds;
                               outcome = call.outcome;
                               noteOrTranscript = call.transcript;
                             }

                             return (
                               <div key={item.id} className="relative group">
                                  <div className="absolute -left-[39px] top-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white ring-1 ring-slate-200 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center">
                                     <Phone className="w-2.5 h-2.5 text-white" />
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm text-slate-900 font-bold">{authorName}</span>
                                        <span className="text-xs text-slate-500 font-normal">logged a call</span>
                                        <span className="text-xs text-slate-400 font-medium">• {Math.floor(duration / 60)}m {duration % 60}s</span>
                                      </div>
                                      <span className="text-xs text-slate-400 shrink-0">{formatRelativeTime(item.timestamp.toISOString())}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant={outcome === 'qualified' || outcome === 'booked' ? 'success' : outcome === 'missed' || outcome === 'no-answer' ? 'danger' : 'outline'} className="text-[10px] h-5 capitalize px-2">
                                            {outcome?.replace('-', ' ')}
                                        </Badge>
                                    </div>

                                    {noteOrTranscript && (
                                      <div className="text-sm text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic leading-relaxed">
                                        "{noteOrTranscript}"
                                      </div>
                                    )}
                                  </div>
                                </div>
                             );
                           }

                           // RENDER SMS
                           if (item.type === 'sms') {
                             return (
                                <div key={item.id} className="relative group">
                                  <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full border-4 border-white ring-1 ring-slate-200 shadow-sm bg-blue-100 text-blue-600 flex items-center justify-center">
                                     <MessageSquare className="w-2.5 h-2.5" />
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                     <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-slate-900 font-semibold">{item.data.author}</span>
                                          <span className="text-xs text-slate-500 font-normal">sent an SMS</span>
                                        </div>
                                        <span className="text-xs text-slate-400 shrink-0">{formatRelativeTime(item.timestamp.toISOString())}</span>
                                     </div>
                                     <div className="mt-1 text-sm font-medium text-slate-800 break-words">
                                        {item.data.content.replace('Sent SMS: ', '')}
                                     </div>
                                     {item.data.metadata?.segments > 1 && (
                                        <div className="mt-2 text-[10px] text-slate-400 italic">
                                           {item.data.metadata.segments} segments used
                                        </div>
                                     )}
                                  </div>
                                </div>
                             );
                           }

                           // RENDER EMAILS
                           if (item.type === 'email') {
                             return (
                                <div key={item.id} className="relative group">
                                  <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full border-4 border-white ring-1 ring-slate-200 shadow-sm bg-sky-100 text-sky-600 flex items-center justify-center">
                                     <Mail className="w-2.5 h-2.5" />
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                     <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-slate-900 font-semibold">{item.data.author}</span>
                                          <span className="text-xs text-slate-500 font-normal">sent an email</span>
                                        </div>
                                        <span className="text-xs text-slate-400 shrink-0">{formatRelativeTime(item.timestamp.toISOString())}</span>
                                     </div>
                                     <div className="mt-1 text-sm font-medium text-slate-800">
                                        {item.data.content.replace('Sent email: ', '')}
                                     </div>
                                     {item.data.metadata?.hasAttachments && (
                                        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 w-fit px-2 py-1 rounded">
                                           <Paperclip className="w-3 h-3" />
                                           <span>Attachments included</span>
                                        </div>
                                     )}
                                  </div>
                                </div>
                             );
                           }
                           
                           // RENDER NOTES / MENTIONS
                           if (item.type === 'note' || item.type === 'mention') {
                             return (
                                <div key={item.id} className="relative group">
                                  <div className={cn(
                                    "absolute -left-[39px] top-1 w-5 h-5 rounded-full border-4 border-white ring-1 ring-slate-200 shadow-sm group-hover:scale-110 transition-transform",
                                    item.type === 'mention' ? "bg-amber-400" : "bg-purple-400"
                                  )}></div>
                                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                     <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-slate-900 font-semibold">{item.data.author}</span>
                                          <span className="text-xs text-slate-500 font-normal">{item.data.content}</span>
                                        </div>
                                        <span className="text-xs text-slate-400 shrink-0">{formatRelativeTime(item.timestamp.toISOString())}</span>
                                     </div>
                                  </div>
                                </div>
                             );
                           }
                           
                           // RENDER SYSTEM EVENTS (e.g. booked appt)
                           if (item.type === 'system') {
                             return (
                               <div key={item.id} className="relative">
                                 <div className="absolute -left-[39px] top-1 w-5 h-5 bg-slate-100 rounded-full border-4 border-white ring-1 ring-slate-200 shadow-sm flex items-center justify-center">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full" />
                                 </div>
                                 <div className="py-1">
                                    <p className="text-sm text-slate-600">{item.data.content}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{formatRelativeTime(item.timestamp.toISOString())}</p>
                                 </div>
                               </div>
                             );
                           }

                           // RENDER FILES
                           if (item.type === 'file') {
                              const file: LeadFile = item.data.metadata;
                              return (
                                 <div key={item.id} className="relative group">
                                    <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full border-4 border-white ring-1 ring-slate-200 shadow-sm bg-white flex items-center justify-center">
                                       <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                       <div className="flex justify-between items-start mb-3">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-900">{item.data.author}</span>
                                            <span className="text-xs text-slate-500 font-medium">uploaded a file</span>
                                          </div>
                                          <span className="text-xs text-slate-400 shrink-0">{formatRelativeTime(item.timestamp.toISOString())}</span>
                                       </div>
                                       
                                       <a 
                                         href={file?.url || '#'} 
                                         target="_blank"
                                         rel="noopener noreferrer"
                                         className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group/file"
                                       >
                                          <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-blue-500 shadow-sm group-hover/file:scale-110 transition-transform">
                                             <FileIcon className="w-5 h-5" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <div className="text-sm font-bold text-slate-700 truncate group-hover/file:text-blue-700 transition-colors">{file?.name || 'Attachment'}</div>
                                             <div className="text-xs text-slate-400 flex items-center gap-1">
                                                 <span>{(file?.size / 1024).toFixed(1)} KB</span>
                                                 <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                                                 <span className="group-hover/file:text-blue-500 transition-colors">Click to view</span>
                                             </div>
                                          </div>
                                          <ExternalLink className="w-4 h-4 text-slate-300 group-hover/file:text-blue-400 transition-colors" />
                                       </a>
                                    </div>
                                 </div>
                              );
                           }
                           // RENDER CREATION
                           if (item.type === 'created') {
                             return (
                               <div key="created" className="relative">
                                 <div className="absolute -left-[39px] top-1 w-5 h-5 bg-slate-300 rounded-full border-4 border-white ring-1 ring-slate-200 shadow-sm"></div>
                                 <div className="py-1">
                                    <p className="text-sm font-medium text-slate-900">Lead Created</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Source: {item.data.source} • {formatDate(item.timestamp.toISOString())}</p>
                                 </div>
                               </div>
                             );
                           }
                           return null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- NOTES TAB (Split View) --- */}
              {activeTab === 'notes' && (
                <>
                  {/* Top: Scrollable History */}
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="max-w-3xl space-y-4">
                      {lead.notes ? (
                        <div dangerouslySetInnerHTML={{ __html: lead.notes }} className="space-y-4" />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-sm italic">
                          <StickyNote className="w-8 h-8 mb-2 opacity-20" />
                          No notes recorded yet.
                        </div>
                      )}
                      <div ref={notesEndRef} />
                    </div>
                  </div>

                  {/* Bottom: Sticky Editor */}
                  <div className="shrink-0 border-t border-slate-200 bg-white p-6 z-20 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
                    <div className="space-y-3 max-w-3xl">
                      {/* Pending File Attachments - Compact List */}
                      {pendingFiles.length > 0 && (
                        <div className="flex gap-2 items-center overflow-x-auto no-scrollbar max-w-full pb-2">
                          {pendingFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[10px] border border-blue-100 shrink-0">
                                <Paperclip className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{file.name}</span>
                                <button onClick={() => removePendingFile(idx)} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                              </div>
                          ))}
                        </div>
                      )}
                      
                      <RichTextEditor 
                        key={editorKey} 
                        initialContent="" 
                        onChange={setNewNote}
                        onFilesSelected={handleFilesSelected}
                        availableAgents={agents} 
                        className="min-h-[120px] shadow-sm border-slate-200"
                        placeholder="Type a new clinical note... Use @ to mention a teammate."
                        onSave={handleAddNote}
                        saveButtonLabel="Save Note"
                        isSaving={saveStatus === 'saving'}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* --- HISTORY TAB (Scrollable) --- */}
              {activeTab === 'history' && (
                 <div className="flex-1 overflow-y-auto p-8">
                   <div className="space-y-4 max-w-3xl">
                      {leadCalls.map(call => (
                        <div key={call.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                               <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-sm", call.direction === 'inbound' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600")}>
                                  <Phone className="w-5 h-5" />
                               </div>
                               <div>
                                  <div className="text-base font-bold text-slate-900 capitalize">{call.direction} Call</div>
                                  <div className="text-xs text-slate-500 font-medium">{formatDate(call.timestamp)}</div>
                               </div>
                            </div>
                            <Badge variant={call.outcome === 'qualified' ? 'success' : 'default'} className="px-3 py-1 text-xs">{call.outcome}</Badge>
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 font-mono leading-relaxed mb-4 border border-slate-100">
                            {call.transcript}
                          </div>

                          <div className="flex items-center gap-3">
                             <Button size="sm" variant="outline" className="h-8 text-xs" icon={<ExternalLink className="w-3 h-3 mr-1"/>}>View Recording</Button>
                             <Button size="sm" variant="ghost" className="h-8 text-xs" icon={<FileText className="w-3 h-3 mr-1"/>}>Copy Transcript</Button>
                          </div>
                        </div>
                      ))}
                   </div>
                 </div>
              )}

            </div>
          </div>
        </div>
        
        {/* Email Composer Overlay */}
        <EmailComposerModal 
          isOpen={isEmailComposerOpen}
          onClose={() => setIsEmailComposerOpen(false)}
          recipientEmail={lead.email}
          recipientName={`${lead.firstName} ${lead.lastName}`}
          leadId={lead.id}
          availableAgents={agents}
        />

        {/* SMS Composer Overlay */}
        <SMSComposerModal
          isOpen={isSMSComposerOpen}
          onClose={() => setIsSMSComposerOpen(false)}
          lead={lead}
        />

        {/* Appointment Modal Overlay */}
        <AppointmentModal 
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          agents={agents}
          onCreate={handleCreateAppointment}
          initialLeadId={lead.id}
        />
      </div>
    </Sheet>
  );
};
