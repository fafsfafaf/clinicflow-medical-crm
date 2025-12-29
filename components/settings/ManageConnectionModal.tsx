
import React, { useState, useEffect } from 'react';
import { Sheet } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Check, X, ShieldCheck, Mail, MessageSquare, Zap, Mic, CreditCard, FileSignature, Globe, User } from 'lucide-react';
import { useNewLeadSheetSettings } from '../../lib/theme/useNewLeadSheetSettings';
import { cn } from '../../lib/utils';
import { useAppStore, ConnectionState } from '../../lib/store/useAppStore';

interface ManageConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'email' | 'sms' | 'voice' | 'automations' | 'payments' | 'erx';
  initialState?: ConnectionState;
}

export const ManageConnectionModal: React.FC<ManageConnectionModalProps> = ({ isOpen, onClose, type, initialState }) => {
  const { updateConnection } = useAppStore();
  const settings = useNewLeadSheetSettings();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [provider, setProvider] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Specific state for checkboxes
  const [smsUseCases, setSmsUseCases] = useState<string[]>([]);
  const [smsCompliance, setSmsCompliance] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProvider(initialState?.provider || getDefaultProvider(type));
      setFormData(initialState?.config || {});
      
      // Load specific SMS states if they exist
      if (type === 'sms' && initialState?.config) {
        if (initialState.config.useCases) {
          setSmsUseCases(initialState.config.useCases.split(','));
        }
        if (initialState.config.compliance === 'true') {
          setSmsCompliance(true);
        }
      } else {
        // Reset
        setSmsUseCases([]);
        setSmsCompliance(false);
      }
    }
  }, [isOpen, type, initialState]);

  const getDefaultProvider = (t: string) => {
    switch(t) {
      case 'email': return 'gmail';
      case 'sms': return 'generic'; 
      case 'voice': return 'vapi';
      case 'payments': return 'stripe';
      case 'erx': return 'dosespot';
      default: return 'custom';
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleUseCaseToggle = (useCase: string) => {
    setSmsUseCases(prev => {
      if (prev.includes(useCase)) return prev.filter(u => u !== useCase);
      return [...prev, useCase];
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation for SMS
    if (type === 'sms' && !smsCompliance) {
      alert("You must confirm patient consent compliance to activate SMS.");
      return;
    }

    setIsSaving(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Determine "connected as" label based on inputs
      let connectedAs = 'System';
      let finalConfig = { ...formData };

      if (type === 'email') connectedAs = formData.email || 'Connected Account';
      if (type === 'sms') {
        connectedAs = formData.senderNumber || 'Active Number';
        finalConfig.useCases = smsUseCases.join(',');
        finalConfig.compliance = 'true';
      }
      if (type === 'automations') connectedAs = 'Active Webhook';
      if (type === 'voice') connectedAs = 'Voice Agent';
      if (type === 'payments') connectedAs = 'Stripe Account';
      if (type === 'erx') connectedAs = formData.clinicId || 'DoseSpot Clinic';

      updateConnection(type, {
        isConnected: true,
        provider,
        connectedAs,
        config: finalConfig
      });
      setIsSaving(false);
      onClose();
    }, 1000);
  };

  const getIcon = () => {
    switch(type) {
      case 'email': return <Mail className="w-6 h-6" />;
      case 'sms': return <MessageSquare className="w-6 h-6" />;
      case 'voice': return <Mic className="w-6 h-6" />;
      case 'automations': return <Zap className="w-6 h-6" />;
      case 'payments': return <CreditCard className="w-6 h-6" />;
      case 'erx': return <FileSignature className="w-6 h-6" />;
    }
  };

  const getTitle = () => {
    switch(type) {
      case 'email': return 'Email Configuration';
      case 'sms': return 'Set up SMS Messaging';
      case 'voice': return 'Voice Agent Settings';
      case 'automations': return 'Automation Webhooks';
      case 'payments': return 'Payment Gateway';
      case 'erx': return 'e-Prescribing (eRx)';
    }
  };

  const renderFields = () => {
    // --- EMAIL ---
    if (type === 'email') {
      return (
        <div className="space-y-5">
           <div className="space-y-2">
             <label className="text-sm font-medium text-slate-900">Provider</label>
             <div className="flex gap-2">
               {['gmail', 'mailgun'].map(p => (
                 <button
                   key={p}
                   type="button"
                   onClick={() => setProvider(p)}
                   className={cn(
                     "px-4 py-2 rounded-lg border text-sm font-medium capitalize flex-1 transition-all",
                     provider === p 
                       ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" 
                       : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                   )}
                 >
                   {p}
                 </button>
               ))}
             </div>
           </div>
           
           {provider === 'gmail' && (
             <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 flex items-start gap-3">
               <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
               <p>For Gmail, we use OAuth2 for secure access. Clicking 'Save' will redirect you to Google to authorize the connection.</p>
             </div>
           )}

           {provider === 'mailgun' && (
             <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-700">API Key</label>
                 <Input 
                    type="password"
                    placeholder="key-..." 
                    value={formData.apiKey || ''} 
                    onChange={(e) => handleChange('apiKey', e.target.value)} 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-700">Domain</label>
                 <Input 
                    placeholder="mg.yourclinic.com" 
                    value={formData.domain || ''} 
                    onChange={(e) => handleChange('domain', e.target.value)} 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-700">From Email</label>
                 <Input 
                    placeholder="info@yourclinic.com" 
                    value={formData.email || ''} 
                    onChange={(e) => handleChange('email', e.target.value)} 
                 />
               </div>
             </div>
           )}
        </div>
      );
    }

    // --- SMS (GENERIC) ---
    if (type === 'sms') {
      return (
        <div className="space-y-6">
           <div className="space-y-4">
             {/* Sender Phone Number */}
             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-700">Sender Phone Number</label>
               <Input 
                  placeholder="+1 XXX XXX XXXX" 
                  value={formData.senderNumber || ''} 
                  onChange={(e) => handleChange('senderNumber', e.target.value)} 
               />
             </div>

             {/* Country / Region */}
             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-700">Country / Region</label>
               <div className="relative">
                 <select 
                    value={formData.country || 'US'} 
                    onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                 >
                    <option value="US">United States (+1)</option>
                    <option value="CA">Canada (+1)</option>
                    <option value="UK">United Kingdom (+44)</option>
                    <option value="AU">Australia (+61)</option>
                 </select>
                 <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
               </div>
             </div>

             {/* Default Sender Name */}
             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-700">Default Sender Name <span className="font-normal text-slate-400">(Optional)</span></label>
               <Input 
                  placeholder="e.g. Vitality Clinic" 
                  value={formData.senderName || ''} 
                  onChange={(e) => handleChange('senderName', e.target.value)} 
                  icon={<User className="w-4 h-4" />}
               />
             </div>

             {/* Use Cases */}
             <div className="space-y-2 pt-1">
               <label className="text-xs font-semibold text-slate-700">Messaging Use Case</label>
               <div className="space-y-2">
                 {['Appointment reminders', 'Follow-up messages', 'Manual messages'].map((uc) => (
                   <label key={uc} className="flex items-center gap-2 cursor-pointer group">
                     <div className="relative flex items-center justify-center">
                       <input 
                         type="checkbox"
                         checked={smsUseCases.includes(uc)}
                         onChange={() => handleUseCaseToggle(uc)}
                         className="peer appearance-none w-4 h-4 border border-slate-300 rounded checked:bg-blue-600 checked:border-blue-600 transition-all"
                       />
                       <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                     </div>
                     <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{uc}</span>
                   </label>
                 ))}
               </div>
             </div>

             {/* Compliance */}
             <div className="pt-4 border-t border-slate-100">
               <label className="flex items-start gap-3 cursor-pointer p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                 <div className="relative flex items-center justify-center mt-0.5">
                   <input 
                     type="checkbox"
                     checked={smsCompliance}
                     onChange={(e) => setSmsCompliance(e.target.checked)}
                     className="peer appearance-none w-4 h-4 border border-slate-300 rounded checked:bg-emerald-600 checked:border-emerald-600 transition-all"
                   />
                   <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                 </div>
                 <div className="flex-1">
                   <span className="text-sm font-medium text-slate-900 block">Opt-in Compliance</span>
                   <span className="text-xs text-slate-500">I confirm patients have consented to receive SMS messages from this number.</span>
                 </div>
               </label>
             </div>
           </div>
        </div>
      );
    }
    
    // --- AUTOMATIONS ---
    if (type === 'automations') {
      return (
        <div className="space-y-5">
           <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 flex items-start gap-3">
             <Zap className="w-5 h-5 shrink-0" />
             <p>We send events (new lead, status change) to this webhook URL. Great for connecting with n8n, Zapier, or Make.</p>
           </div>
           
           <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-700">Webhook URL</label>
             <Input 
                placeholder="https://n8n.your-server.com/webhook/..." 
                value={formData.webhookUrl || ''} 
                onChange={(e) => handleChange('webhookUrl', e.target.value)} 
             />
           </div>
        </div>
      );
    }
    
    // --- VOICE ---
    if (type === 'voice') {
      return (
        <div className="space-y-5">
           <div className="space-y-2">
             <label className="text-sm font-medium text-slate-900">Voice Provider</label>
             <div className="flex gap-2">
               {['vapi', 'bland', 'retell'].map(p => (
                 <button
                   key={p}
                   type="button"
                   onClick={() => setProvider(p)}
                   className={cn(
                     "px-4 py-2 rounded-lg border text-sm font-medium capitalize flex-1 transition-all",
                     provider === p 
                       ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" 
                       : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                   )}
                 >
                   {p}
                 </button>
               ))}
             </div>
           </div>

           <div className="space-y-4">
             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-700">API Key</label>
               <Input 
                  type="password"
                  placeholder="sk-..." 
                  value={formData.apiKey || ''} 
                  onChange={(e) => handleChange('apiKey', e.target.value)} 
               />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-700">Assistant ID</label>
               <Input 
                  placeholder="ast-..." 
                  value={formData.assistantId || ''} 
                  onChange={(e) => handleChange('assistantId', e.target.value)} 
               />
             </div>
           </div>
        </div>
      );
    }

    // --- PAYMENTS ---
    if (type === 'payments') {
        return (
          <div className="space-y-5">
             <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800 flex items-start gap-3">
               <CreditCard className="w-5 h-5 shrink-0" />
               <p>Connect your Stripe account to collect payments and secure deposits for high-value procedures.</p>
             </div>
  
             <div className="space-y-4">
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-700">Stripe Public Key</label>
                 <Input 
                    placeholder="pk_test_..." 
                    value={formData.publicKey || ''} 
                    onChange={(e) => handleChange('publicKey', e.target.value)} 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-700">Stripe Secret Key</label>
                 <Input 
                    type="password"
                    placeholder="sk_test_..." 
                    value={formData.secretKey || ''} 
                    onChange={(e) => handleChange('secretKey', e.target.value)} 
                 />
               </div>
             </div>
          </div>
        );
    }

    // --- ERX (DoseSpot) ---
    if (type === 'erx') {
        return (
          <div className="space-y-5">
             <div className="space-y-2">
               <label className="text-sm font-medium text-slate-900">Platform</label>
               <div className="flex gap-2">
                 <button
                   type="button"
                   onClick={() => setProvider('dosespot')}
                   className={cn(
                     "px-4 py-2 rounded-lg border text-sm font-medium capitalize flex-1 transition-all bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                   )}
                 >
                   DoseSpot
                 </button>
               </div>
             </div>
  
             <div className="space-y-4">
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-700">Clinic ID</label>
                 <Input 
                    placeholder="Clinic ID..." 
                    value={formData.clinicId || ''} 
                    onChange={(e) => handleChange('clinicId', e.target.value)} 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-700">Clinic Key</label>
                 <Input 
                    type="password"
                    placeholder="Single Sign On Key..." 
                    value={formData.clinicKey || ''} 
                    onChange={(e) => handleChange('clinicKey', e.target.value)} 
                 />
               </div>
             </div>
          </div>
        );
    }

    return null;
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} height="auto" className="sm:max-w-md">
      <form onSubmit={handleSave} className="flex flex-col h-full bg-white">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4 shrink-0">
           <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0">
             <div className="text-blue-600">{getIcon()}</div>
           </div>
           <div>
              <h3 className="font-bold text-slate-900">{getTitle()}</h3>
              <p className="text-xs text-slate-500">Configure connection details</p>
           </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {renderFields()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white mt-auto">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSaving} className="shadow-lg shadow-blue-500/20">
            {type === 'sms' ? 'Save & Activate SMS' : 'Save Connection'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
};
