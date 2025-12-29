
import React, { useState, useEffect } from 'react';
import { X, Send, Smartphone, MessageSquare, Info, AlertCircle, Wand2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Lead } from '../../lib/mock/types';
import { cn, formatDate } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';

interface SMSComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

const TEMPLATES = [
  {
    id: 'reminder',
    label: 'Appt Reminder',
    content: "Hi {{FirstName}}, this is a friendly reminder for your appointment at {{ClinicName}} on {{AppointmentDate}}. Reply C to confirm."
  },
  {
    id: 'followup',
    label: 'Post-Visit',
    content: "Hi {{FirstName}}, checking in after your visit to {{ClinicName}}. How are you feeling today?"
  },
  {
    id: 'rebook',
    label: 'Re-booking',
    content: "Hi {{FirstName}}, it's time for your next treatment. Would you like to book a slot for next week?"
  }
];

export const SMSComposerModal: React.FC<SMSComposerModalProps> = ({ isOpen, onClose, lead }) => {
  const { addLeadActivity, currentUserId, agents } = useAppStore();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Constants
  const SEGMENT_LENGTH = 160;
  
  useEffect(() => {
    if (isOpen) {
      setMessage('');
      setIsSending(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Variables Replacement Logic
  const getPreviewText = (text: string) => {
    let processed = text;
    processed = processed.replace(/{{FirstName}}/g, lead.firstName);
    processed = processed.replace(/{{LastName}}/g, lead.lastName);
    processed = processed.replace(/{{ClinicName}}/g, 'Vitality Clinic');
    processed = processed.replace(/{{AppointmentDate}}/g, lead.nextFollowUp ? formatDate(lead.nextFollowUp) : '[Date]');
    return processed;
  };

  const currentLength = getPreviewText(message).length;
  const segmentCount = Math.ceil(currentLength / SEGMENT_LENGTH) || 1;
  const isMultiSegment = segmentCount > 1;

  const handleSend = () => {
    if (!message.trim()) return;

    setIsSending(true);

    setTimeout(() => {
      // Log the SMS
      const currentUser = agents.find(a => a.id === currentUserId);
      const finalContent = getPreviewText(message);

      addLeadActivity(lead.id, {
        id: `act_sms_${Date.now()}`,
        type: 'sms',
        content: `Sent SMS: ${finalContent}`,
        author: currentUser?.name || 'Unknown Agent',
        timestamp: new Date().toISOString(),
        metadata: {
          segments: segmentCount,
          originalTemplate: message
        }
      });

      setIsSending(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      {/* Modal Container with Pop Animation */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex overflow-hidden border border-slate-200 h-[600px] animate-in zoom-in-95 slide-in-from-bottom-8 fade-in duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        
        {/* LEFT COLUMN: Composer */}
        <div className="flex-1 flex flex-col border-r border-slate-100 min-w-0">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Send SMS
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">To: <span className="font-mono font-medium text-slate-700">{lead.phone}</span></p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
            
            {/* Templates */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5" /> Quick Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => setMessage(tpl.content)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-primary/50 hover:text-primary rounded-lg text-xs font-medium transition-all shadow-sm active:scale-95"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Message</label>
                <div className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded border",
                  isMultiSegment ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-500 border-slate-200"
                )}>
                  {currentLength} chars • {segmentCount} SMS
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here... Use {{FirstName}} for variables."
                  className="w-full h-48 p-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm leading-relaxed"
                  autoFocus
                />
                <div className="absolute bottom-3 right-3 flex gap-1">
                   {['{{FirstName}}', '{{AppointmentDate}}', '{{ClinicName}}'].map(variable => (
                     <button
                        key={variable}
                        onClick={() => setMessage(prev => prev + ' ' + variable)}
                        className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 font-mono transition-colors"
                        title="Insert Variable"
                     >
                       {variable}
                     </button>
                   ))}
                </div>
              </div>

              {/* Warning/Info */}
              {isMultiSegment ? (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Message exceeds 160 characters. It will be sent as <strong>{segmentCount} parts</strong>, which may increase costs.</p>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-slate-500 p-1 pl-2">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <p>Variables will be automatically replaced with lead data.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
            <Button variant="ghost" onClick={onClose} className="text-slate-500">Cancel</Button>
            <Button 
              onClick={handleSend} 
              isLoading={isSending}
              disabled={!message.trim()}
              className="bg-primary hover:bg-primary-hover shadow-lg shadow-blue-200 px-8"
              icon={<Send className="w-4 h-4 mr-2" />}
            >
              Send SMS
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Preview */}
        <div className="w-[340px] bg-slate-50 flex flex-col items-center justify-center p-8 border-l border-slate-100 shrink-0 relative overflow-hidden">
           {/* Background Decoration */}
           <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           
           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 z-10 flex items-center gap-2">
             <Smartphone className="w-4 h-4" /> Live Preview
           </div>

           {/* Phone Mockup */}
           <div className="relative w-[280px] h-[500px] bg-white rounded-[40px] shadow-2xl border-[8px] border-slate-800 overflow-hidden flex flex-col z-10">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
              
              {/* Status Bar Mock */}
              <div className="h-10 bg-slate-50 flex justify-between px-6 pt-3 items-center text-[10px] font-bold text-slate-800 shrink-0">
                 <span>9:41</span>
                 <div className="flex gap-1">
                    <div className="w-3 h-3 bg-slate-800 rounded-full opacity-20"></div>
                    <div className="w-3 h-3 bg-slate-800 rounded-full opacity-20"></div>
                 </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 bg-slate-50 p-4 flex flex-col gap-3 overflow-y-auto">
                 <div className="self-center text-[10px] text-slate-400 font-medium my-2">Today 9:41 AM</div>
                 
                 {/* Recipient Bubble (Mock Previous Context) */}
                 <div className="bg-slate-200 text-slate-600 p-3 rounded-2xl rounded-tl-none max-w-[85%] text-xs leading-relaxed self-start shadow-sm">
                    Hi, do you have any appointments available next Tuesday?
                 </div>

                 {/* Sender Bubble (Live Preview) */}
                 {message ? (
                   <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-tr-none max-w-[90%] text-xs leading-relaxed self-end shadow-md break-words animate-in slide-in-from-bottom-2 duration-300">
                      {getPreviewText(message)}
                   </div>
                 ) : (
                   <div className="self-end text-[10px] text-slate-400 italic pr-2">Typing...</div>
                 )}
              </div>

              {/* Input Area Mock */}
              <div className="h-14 bg-white border-t border-slate-100 flex items-center px-4 shrink-0">
                 <div className="flex-1 h-8 bg-slate-100 rounded-full mx-2"></div>
                 <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
