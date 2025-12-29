
import React, { useState } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { ConnectionCard } from './ConnectionCard';
import { GoogleCalendarConnect } from './GoogleCalendarConnect';
import { SMSConnect } from './SMSConnect';
import { EmailInboxConnect } from './EmailInboxConnect';
import { ManageConnectionModal } from './ManageConnectionModal';
import { TestConnectionModal } from './TestConnectionModal';
import { Mic, Zap, Stethoscope, CreditCard, FileSignature, Check, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export const ConnectionsView = () => {
  const { 
    googleCalendarEmail, 
    connections, updateConnection, emailMode
  } = useAppStore();

  const [activeModal, setActiveModal] = useState<{ type: 'manage' | 'test', connection: string } | null>(null);

  const handleDisconnect = (type: string) => {
    if (confirm(`Disconnect ${type}?`)) {
        updateConnection(type as any, { isConnected: false, connectedAs: undefined, config: {} });
    }
  };

  // Helper to determine email card state
  const isGmailActive = emailMode === 'gmail' && !!googleCalendarEmail;
  const isEmailConnected = isGmailActive || connections.email.isConnected;

  // Header Checklist Data
  const checklist = [
    { label: 'Calendar', isConnected: !!googleCalendarEmail },
    { label: 'Email', isConnected: isEmailConnected },
    { label: 'SMS', isConnected: connections.sms.isConnected },
    { label: 'Voice', isConnected: connections.voice.isConnected },
    { label: 'Payments', isConnected: connections.payments.isConnected },
    { label: 'eRx', isConnected: connections.erx.isConnected },
    { label: 'Automations', isConnected: connections.automations.isConnected },
  ];

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Section with Checklist */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Connections</h2>
        <p className="text-slate-500 mt-1 mb-6 max-w-2xl">
          Connect the services needed to run your clinic workflows. Ensure all core channels are active for full AI capabilities.
        </p>
        
        <div className="flex flex-wrap gap-3">
           {checklist.map(item => (
             <div 
               key={item.label} 
               className={cn(
                 "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors",
                 item.isConnected 
                   ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                   : "bg-white text-slate-400 border-slate-200"
               )}
             >
               {item.isConnected ? <Check className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />}
               {item.label}
             </div>
           ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="space-y-4">
        
        {/* 1. Google Calendar (Custom Component) */}
        <GoogleCalendarConnect />

        {/* 2. Email Inbox (New Custom Component) */}
        <EmailInboxConnect />

        {/* 3. SMS Messaging (Custom Component) */}
        <SMSConnect />

        {/* 4. Voice Agent */}
        <ConnectionCard 
          id="voice"
          name="Voice Agent"
          icon={<Mic className="w-6 h-6" />}
          description="Deploy AI receptionists to handle inbound calls and outbound qualification."
          status={connections.voice.isConnected ? 'connected' : 'not-connected'}
          connectedAs={connections.voice.connectedAs}
          providerName={connections.voice.provider}
          onConnect={() => setActiveModal({ type: 'manage', connection: 'voice' })}
          onManage={() => setActiveModal({ type: 'manage', connection: 'voice' })}
          onTest={() => setActiveModal({ type: 'test', connection: 'voice' })}
          onDisconnect={() => handleDisconnect('voice')}
        >
           <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
              <div className="flex items-center gap-2">
                 <div className={cn("w-2 h-2 rounded-full", connections.voice.isConnected ? "bg-emerald-500" : "bg-red-500")}></div>
                 <span className="text-xs font-semibold text-slate-700">{connections.voice.isConnected ? 'Configured' : 'Setup Required'}</span>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs bg-white" onClick={() => alert('View Setup Status')}>View Setup Status</Button>
           </div>
        </ConnectionCard>

        {/* 5. Payments */}
        <ConnectionCard 
          id="payments"
          name="Payment Gateway"
          icon={<CreditCard className="w-6 h-6" />}
          description="Collect deposits, membership fees, and treatment payments securely via Stripe."
          status={connections.payments.isConnected ? 'connected' : 'not-connected'}
          connectedAs={connections.payments.connectedAs}
          providerName={connections.payments.provider}
          onConnect={() => setActiveModal({ type: 'manage', connection: 'payments' })}
          onManage={() => setActiveModal({ type: 'manage', connection: 'payments' })}
          onTest={() => setActiveModal({ type: 'test', connection: 'payments' })}
          onDisconnect={() => handleDisconnect('payments')}
        />

        {/* 6. eRx */}
        <ConnectionCard 
          id="erx"
          name="e-Prescribing"
          icon={<FileSignature className="w-6 h-6" />}
          description="Send electronic prescriptions directly to pharmacies via DoseSpot integration."
          status={connections.erx.isConnected ? 'connected' : 'not-connected'}
          connectedAs={connections.erx.connectedAs}
          providerName="DoseSpot"
          onConnect={() => setActiveModal({ type: 'manage', connection: 'erx' })}
          onManage={() => setActiveModal({ type: 'manage', connection: 'erx' })}
          onTest={() => setActiveModal({ type: 'test', connection: 'erx' })}
          onDisconnect={() => handleDisconnect('erx')}
        />

        {/* 7. Automations */}
        <ConnectionCard 
          id="automations"
          name="Automations"
          icon={<Zap className="w-6 h-6" />}
          description="Trigger external workflows in n8n, Make, or Zapier via webhooks."
          status={connections.automations.isConnected ? 'connected' : 'not-connected'}
          connectedAs={connections.automations.connectedAs}
          onConnect={() => setActiveModal({ type: 'manage', connection: 'automations' })}
          onManage={() => setActiveModal({ type: 'manage', connection: 'automations' })}
          onTest={() => setActiveModal({ type: 'test', connection: 'automations' })}
          onDisconnect={() => handleDisconnect('automations')}
        />

        {/* 8. EMR */}
        <ConnectionCard 
          id="emr"
          name="DrChrono EMR"
          icon={<Stethoscope className="w-6 h-6" />}
          description="Sync patient records and clinical notes directly with your EMR system."
          status="coming-soon"
        />

      </div>

      {/* Modals */}
      {activeModal?.type === 'manage' && (
        <ManageConnectionModal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          type={activeModal.connection as any}
          initialState={connections[activeModal.connection as keyof typeof connections]}
        />
      )}

      {activeModal?.type === 'test' && (
        <TestConnectionModal 
          isOpen={true} 
          onClose={() => setActiveModal(null)} 
          type={activeModal.connection as any}
        />
      )}

    </div>
  );
};
