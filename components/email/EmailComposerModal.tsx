
import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Maximize2, Paperclip, Send, ChevronDown, AtSign, CornerDownLeft } from 'lucide-react';
import { RichTextEditor } from '../ui/RichTextEditor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { Agent } from '../../lib/mock/types';
import { useAppStore } from '../../lib/store/useAppStore';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  recipientName: string;
  userEmail?: string;
  leadId?: string; // Needed for activity log
  availableAgents?: Agent[];
}

export const EmailComposerModal: React.FC<EmailComposerModalProps> = ({ 
  isOpen, 
  onClose, 
  recipientEmail, 
  recipientName,
  userEmail = "sarah.connor@vitality.clinic",
  leadId,
  availableAgents = []
}) => {
  const { addLeadActivity, currentUserId, agents, addLeadFile } = useAppStore();
  const [subject, setSubject] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when opening a new email
  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setBody('');
      setAttachedFiles([]);
      setIsMinimized(false);
      setShowCc(false);
    }
  }, [isOpen, recipientEmail]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  if (!isOpen) return null;

  const handleSend = () => {
    if (!subject) {
        const subjectInput = document.getElementById('email-subject');
        subjectInput?.focus();
        subjectInput?.classList.add('ring-2', 'ring-red-100');
        setTimeout(() => subjectInput?.classList.remove('ring-2', 'ring-red-100'), 1000);
        return;
    }

    setIsSending(true);
    
    // Simulate API call and logging
    setTimeout(() => {
      if (leadId) {
        // 1. Log Email Activity
        const currentUser = agents.find(a => a.id === currentUserId);
        
        // Add files to store if any
        if (attachedFiles.length > 0) {
            attachedFiles.forEach(file => {
                addLeadFile(leadId, {
                    id: `file_${Date.now()}_${Math.random()}`,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: '#',
                    uploadedAt: new Date().toISOString()
                });
            });
        }

        addLeadActivity(leadId, {
          id: `act_email_${Date.now()}`,
          type: 'email',
          content: `Sent email: ${subject}`,
          author: currentUser?.name || 'Unknown Agent',
          timestamp: new Date().toISOString(),
          metadata: {
            subject: subject,
            recipient: recipientEmail,
            hasAttachments: attachedFiles.length > 0
          }
        });
      }

      setIsSending(false);
      onClose();
    }, 1200);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-8 z-[200] w-72 bg-white border border-slate-200 rounded-t-xl shadow-xl flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setIsMinimized(false)}>
        <span className="font-bold text-sm text-slate-700 truncate">Draft: {subject || '(No Subject)'}</span>
        <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}><Maximize2 className="w-4 h-4 text-slate-400" /></button>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop with smooth fade in */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      {/* Modal Window with "Pop Up" Animation */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 animate-in zoom-in-95 slide-in-from-bottom-8 fade-in duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl shrink-0">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            New Message
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-slate-200 rounded-md text-slate-400 transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-red-100 hover:text-red-500 rounded-md text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-3 shrink-0">
          
          {/* To Field */}
          <div className="flex items-start gap-3 text-sm">
             <span className="text-slate-500 font-medium w-12 pt-1.5 text-right">To</span>
             <div className="flex-1 flex flex-wrap gap-2 items-center min-h-[32px] border-b border-slate-100 pb-1">
                {/* Recipient Chip */}
                <div className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full border border-slate-200">
                   <span className="text-xs font-semibold">{recipientName}</span>
                   <span className="text-[10px] text-slate-500">&lt;{recipientEmail}&gt;</span>
                   <button onClick={onClose} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
                </div>
             </div>
             <button 
                onClick={() => setShowCc(!showCc)} 
                className="text-xs text-slate-400 hover:text-primary hover:underline pt-1.5"
             >
                Cc/Bcc
             </button>
          </div>

          {/* Cc/Bcc Fields (Collapsible) */}
          {showCc && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
               <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500 font-medium w-12 text-right">Cc</span>
                  <input 
                    type="text" 
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="flex-1 border-b border-slate-100 pb-1 focus:outline-none focus:border-blue-300 text-slate-700 bg-transparent"
                    placeholder="Carbon copy recipients..."
                  />
               </div>
               <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500 font-medium w-12 text-right">Bcc</span>
                  <input 
                    type="text" 
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    className="flex-1 border-b border-slate-100 pb-1 focus:outline-none focus:border-blue-300 text-slate-700 bg-transparent"
                    placeholder="Blind copy recipients..."
                  />
               </div>
            </div>
          )}

          {/* Subject Field */}
          <div className="flex items-center gap-3 text-sm">
             <span className="text-slate-500 font-medium w-12 text-right">Subject</span>
             <input 
               id="email-subject"
               type="text" 
               value={subject}
               onChange={(e) => setSubject(e.target.value)}
               className="flex-1 border-b border-slate-100 pb-1 focus:outline-none focus:border-blue-300 text-slate-900 font-medium bg-transparent transition-all"
               placeholder="Write a subject line..."
               autoFocus
             />
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-2 min-h-[300px] flex flex-col relative">
           
           {/* File Chips Display */}
           {attachedFiles.length > 0 && (
             <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
               {attachedFiles.map((file, idx) => (
                 <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 shadow-sm">
                   <Paperclip className="w-3 h-3 text-slate-400" />
                   <span className="max-w-[150px] truncate">{file.name}</span>
                   <button onClick={() => removeFile(idx)} className="hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>
                 </div>
               ))}
             </div>
           )}

           <RichTextEditor 
             initialContent=""
             onChange={setBody}
             availableAgents={availableAgents}
             hideFooter={true} // Hide internal footer
             className="flex-1 border-none shadow-none focus-within:ring-0 px-0"
             placeholder="Draft your message here..."
           />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-white rounded-b-2xl shrink-0">
           <div className="flex items-center gap-3">
              <Button 
                onClick={handleSend} 
                isLoading={isSending}
                size="md"
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm h-9 px-4 rounded-lg flex items-center gap-2 group"
              >
                {!isSending && <Send className="w-3.5 h-3.5 fill-white/20" />}
                <span>Send Email</span>
                {!isSending && (
                  <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-400/30 text-blue-50 text-[10px] ml-1">
                    <CornerDownLeft className="w-3 h-3" />
                  </div>
                )}
              </Button>
              
              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                multiple 
              />

              <Button
                variant="secondary"
                size="md"
                className="h-9 px-3 text-slate-600 hover:text-slate-900"
                onClick={() => fileInputRef.current?.click()}
                icon={<Paperclip className="w-4 h-4 mr-2" />}
              >
                Attach Files
              </Button>
           </div>
           
           <button onClick={onClose} className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors p-2">
             Discard
           </button>
        </div>

      </div>
    </div>
  );
};
