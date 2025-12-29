
import React, { useState } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { CheckCircle2, MessageSquare, Loader2, X, Send, Smartphone, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Sheet } from '../ui/sheet';
import { cn } from '../../lib/utils';

export const SMSConnect = () => {
  const { connections, updateConnection } = useAppStore();
  const smsState = connections.sms;

  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Connection Form
  const [formData, setFormData] = useState({
    senderNumber: '',
    accountId: '',
    authKey: '',
    displayName: ''
  });

  // Test Form
  const [testPhone, setTestPhone] = useState('');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.senderNumber || !formData.accountId || !formData.authKey) return;

    setIsConnecting(true);
    setTimeout(() => {
      updateConnection('sms', {
        isConnected: true,
        connectedAs: formData.senderNumber,
        config: { ...formData }
      });
      setIsConnecting(false);
      setIsConnectOpen(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect SMS? You will no longer be able to send messages.')) {
      updateConnection('sms', {
        isConnected: false,
        connectedAs: undefined,
        config: {}
      });
      setFormData({ senderNumber: '', accountId: '', authKey: '', displayName: '' });
    }
  };

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;

    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      setIsTestOpen(false);
      setTestPhone('');
      alert('Test SMS sent successfully!');
    }, 1500);
  };

  // Helper to mask number
  const getMaskedNumber = (num: string) => {
    if (!num) return '';
    if (num.length < 4) return num;
    return `****${num.slice(-4)}`;
  };

  return (
    <>
      <Card className="border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-start gap-5">
              {/* Icon Wrapper */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                <MessageSquare className="w-7 h-7 text-indigo-500" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">SMS Messaging</h3>
                  {smsState.isConnected && (
                    <Badge variant="success" className="h-5 px-1.5 gap-1 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </Badge>
                  )}
                </div>
                
                {smsState.isConnected ? (
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600">
                      Sending from <span className="font-semibold text-slate-900 font-mono">{getMaskedNumber(smsState.connectedAs || '')}</span>
                    </p>
                    <p className="text-xs text-slate-400">Automated reminders • Manual messaging active</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                    Connect an SMS gateway to enable appointment reminders, patient follow-ups, and two-way messaging directly from the dashboard.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              {smsState.isConnected ? (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full md:w-auto text-slate-600 hover:text-slate-900"
                    onClick={() => setIsTestOpen(true)}
                  >
                    Send test SMS
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 w-full md:w-auto"
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsConnectOpen(true)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm w-full md:w-auto h-11 px-6 gap-3"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-semibold">Connect SMS</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Trust Badge Footer (Matches Google Calendar style) */}
          {!smsState.isConnected && (
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure encryption • Standard SMS rates may apply</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connect Modal */}
      <Sheet isOpen={isConnectOpen} onClose={() => setIsConnectOpen(false)} height="auto" className="sm:max-w-md">
        <form onSubmit={handleConnect} className="flex flex-col h-full bg-white">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
             <div>
                <h3 className="font-bold text-slate-900 text-lg">Connect SMS</h3>
                <p className="text-xs text-slate-500">Enter your provider credentials.</p>
             </div>
             <button type="button" onClick={() => setIsConnectOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
               <X className="w-5 h-5" />
             </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">SMS Sender Number</label>
              <Input 
                placeholder="+1..." 
                value={formData.senderNumber}
                onChange={(e) => setFormData({...formData, senderNumber: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Account ID</label>
              <Input 
                type="password"
                placeholder="Enter Account ID" 
                value={formData.accountId}
                onChange={(e) => setFormData({...formData, accountId: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Auth Key</label>
              <Input 
                type="password"
                placeholder="Enter Auth Key" 
                value={formData.authKey}
                onChange={(e) => setFormData({...formData, authKey: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Display Name <span className="text-slate-400 font-normal normal-case">(Optional)</span></label>
              <Input 
                placeholder="e.g. My Clinic" 
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
            <Button type="button" variant="ghost" onClick={() => setIsConnectOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isConnecting} className="shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white">
              Save Connection
            </Button>
          </div>
        </form>
      </Sheet>

      {/* Test SMS Modal */}
      <Sheet isOpen={isTestOpen} onClose={() => setIsTestOpen(false)} height="auto" className="sm:max-w-md">
        <form onSubmit={handleSendTest} className="flex flex-col h-full bg-white">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
             <div>
                <h3 className="font-bold text-slate-900 text-lg">Send Test SMS</h3>
                <p className="text-xs text-slate-500">Verify your connection works.</p>
             </div>
             <button type="button" onClick={() => setIsTestOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
               <X className="w-5 h-5" />
             </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-4 items-start">
               <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                 <Smartphone className="w-5 h-5 text-slate-400" />
               </div>
               <div>
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Message Preview</div>
                 <p className="text-sm text-slate-800 bg-white p-2 rounded-lg border border-slate-100 shadow-sm inline-block">
                   This is a test message from ClinicFlow.
                 </p>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Recipient Phone Number</label>
              <Input 
                placeholder="+1..." 
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
            <Button type="button" variant="ghost" onClick={() => setIsTestOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSendingTest} className="min-w-[100px]" icon={<Send className="w-4 h-4 mr-2" />}>
              Send
            </Button>
          </div>
        </form>
      </Sheet>
    </>
  );
};
