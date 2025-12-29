
import React, { useState } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle2, ShieldCheck, Loader2, Check, Lock, Server, ArrowRight, X, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Sheet } from '../ui/sheet';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

export const GoogleCalendarConnect = () => {
  const {
    googleCalendarEmail,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    emailMode,
    setEmailMode
  } = useAppStore();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<'method-selection' | 'oauth-consent' | 'manual-input'>('method-selection');
  const [isConnecting, setIsConnecting] = useState(false);

  // Manual Form State
  const [manualCreds, setManualCreds] = useState({ clientId: '', clientSecret: '', serviceEmail: '' });

  const handleConnectOAuth = () => {
    setIsConnecting(true);
    // Simulate redirect delay
    setTimeout(() => {
      setIsConnecting(false);
      setWizardStep('oauth-consent');
    }, 800);
  };

  const handleConfirmConsent = () => {
    setIsConnecting(true);
    setTimeout(() => {
      connectGoogleCalendar('sarah.connor@gmail.com');
      setIsConnecting(false);
      setIsWizardOpen(false);
      setWizardStep('method-selection');
    }, 1500);
  };

  const handleConnectManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCreds.serviceEmail) return;

    setIsConnecting(true);
    setTimeout(() => {
      connectGoogleCalendar(manualCreds.serviceEmail);
      setIsConnecting(false);
      setIsWizardOpen(false);
      setWizardStep('method-selection');
    }, 1200);
  };

  // Check Initial Status
  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/oauth/status');
        const data = await res.json();
        if (data.isConnected) {
          // We're connected! The store might need an update, or we just trust the API status for this component
          // For now, let's update the store with a placeholder email or fetch it if available
          connectGoogleCalendar('Google User');
        }
      } catch (e) { console.error(e); }
    };
    checkStatus();
  }, [connectGoogleCalendar]);

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Google Account? Calendar sync and Gmail sending will stop.')) {
      try {
        await fetch('/api/oauth/google/disconnect', { method: 'POST' });
        disconnectGoogleCalendar();
      } catch (e) {
        alert('Failed to disconnect');
      }
    }
  };

  return (
    <>
      <Card className="border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

            <div className="flex items-start gap-5">
              {/* Icon Wrapper */}
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                <svg className="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">Google Account</h3>
                  {googleCalendarEmail && (
                    <Badge variant="success" className="h-5 px-1.5 gap-1 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </Badge>
                  )}
                </div>

                {googleCalendarEmail ? (
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600">
                      Authorized as <span className="font-semibold text-slate-900">{googleCalendarEmail}</span>
                    </p>
                    <p className="text-xs text-slate-400">Calendar Sync • Gmail Sending • Contacts</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                    Connect your Google Workspace to enable 2-way Calendar sync and send emails directly from your Gmail account.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              {googleCalendarEmail ? (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 w-full md:w-auto"
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    try {
                      setIsConnecting(true);
                      const res = await fetch('/api/oauth/google/url');
                      const { url } = await res.json();
                      window.location.href = url;
                    } catch (err) {
                      console.error(err);
                      setIsConnecting(false);
                    }
                  }}
                  isLoading={isConnecting}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm w-full md:w-auto h-11 px-6 gap-3"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  </div>
                  <span className="font-semibold">Connect Google</span>
                </Button>
              )}
            </div>
          </div>

          {/* Email Mode Toggle (Only when connected) */}
          {googleCalendarEmail && (
            <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-48 shrink-0">
                  <h4 className="text-sm font-bold text-slate-900">Sending Method</h4>
                  <p className="text-xs text-slate-500 mt-1">Choose how outbound emails are routed.</p>
                </div>

                <div className="flex-1 flex flex-col sm:flex-row gap-4">
                  <label className={cn(
                    "flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    emailMode === 'gmail'
                      ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  )}>
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="radio"
                        name="emailMode"
                        checked={emailMode === 'gmail'}
                        onChange={() => setEmailMode('gmail')}
                        className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded-full checked:border-blue-500 checked:bg-blue-500 transition-all"
                      />
                      <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"></div>
                    </div>
                    <div>
                      <span className={cn("text-sm font-bold block", emailMode === 'gmail' ? "text-blue-900" : "text-slate-700")}>Via Gmail API</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Sent items appear in your Sent folder.</p>
                    </div>
                  </label>

                  <label className={cn(
                    "flex-1 flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    emailMode === 'custom'
                      ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  )}>
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="radio"
                        name="emailMode"
                        checked={emailMode === 'custom'}
                        onChange={() => setEmailMode('custom')}
                        className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded-full checked:border-blue-500 checked:bg-blue-500 transition-all"
                      />
                      <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"></div>
                    </div>
                    <div>
                      <span className={cn("text-sm font-bold block", emailMode === 'custom' ? "text-blue-900" : "text-slate-700")}>Via Custom SMTP</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Use external transactional provider.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {!googleCalendarEmail && (
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified App • ISO 27001 Certified • HIPAA Compliant</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- CONNECTION WIZARD SHEET --- */}
      <Sheet isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} height="auto" className="sm:max-w-lg">
        <div className="flex flex-col h-full bg-white">

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Connect Google Account</h3>
              <p className="text-xs text-slate-500">Enable Calendar & Gmail integration.</p>
            </div>
            <button type="button" onClick={() => setIsWizardOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 1: METHOD SELECTION */}
          {wizardStep === 'method-selection' && (
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 mb-2">Choose how you want to authenticate with Google:</p>

              {/* Option A: OAuth */}
              <div
                onClick={handleConnectOAuth}
                className="group relative p-5 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700">OAuth 2.0 (Recommended)</h4>
                      {isConnecting ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Securely sign in with your Google account. We'll ask for permission to manage your calendar and send emails.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option B: Service Account */}
              <div
                onClick={() => setWizardStep('manual-input')}
                className="group relative p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-slate-200 transition-colors">
                    <Server className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-900">Service Account</h4>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Connect using a GCP Service Account JSON key. Best for backend-only or automated server integrations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OAUTH CONSENT SIMULATION */}
          {wizardStep === 'oauth-consent' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-full p-2 shadow-sm border border-slate-100 mb-6">
                  <svg className="w-full h-full" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">ClinicDashboard wants access to your Google Account</h3>
                <p className="text-sm text-slate-500 mb-8 max-w-xs">
                  sarah.connor@gmail.com
                </p>

                <div className="w-full max-w-sm space-y-4 text-left bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex gap-3">
                    <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
                    <p className="text-xs text-slate-600 font-medium">See, edit, share, and permanently delete all the calendars you can access using Google Calendar</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
                    <p className="text-xs text-slate-600 font-medium">Send email on your behalf</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
                    <p className="text-xs text-slate-600 font-medium">View your email messages and settings</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
                  <Button
                    onClick={handleConfirmConsent}
                    isLoading={isConnecting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                  >
                    Allow
                  </Button>
                  <Button variant="ghost" onClick={() => setWizardStep('method-selection')} className="text-slate-500">Cancel</Button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 text-center text-[10px] text-slate-400 border-t border-slate-100">
                Read our Privacy Policy and Terms of Service.
              </div>
            </div>
          )}

          {/* STEP 3: MANUAL INPUT */}
          {wizardStep === 'manual-input' && (
            <form onSubmit={handleConnectManual} className="flex flex-col h-full">
              <div className="p-6 space-y-5 flex-1 overflow-y-auto">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>You are connecting via Service Account. Ensure you have shared your Calendar with the service account email.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Service Account Email</label>
                  <Input
                    placeholder="service-account@project-id.iam.gserviceaccount.com"
                    value={manualCreds.serviceEmail}
                    onChange={(e) => setManualCreds({ ...manualCreds, serviceEmail: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Client ID (OAuth)</label>
                  <Input
                    placeholder="123456789-abc..."
                    value={manualCreds.clientId}
                    onChange={(e) => setManualCreds({ ...manualCreds, clientId: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Private Key</label>
                  <textarea
                    className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="-----BEGIN PRIVATE KEY-----&#10;..."
                    value={manualCreds.clientSecret}
                    onChange={(e) => setManualCreds({ ...manualCreds, clientSecret: e.target.value })}
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
                <Button type="button" variant="ghost" onClick={() => setWizardStep('method-selection')}>Back</Button>
                <Button type="submit" isLoading={isConnecting} className="bg-slate-900 text-white">
                  Save Credentials
                </Button>
              </div>
            </form>
          )}

        </div>
      </Sheet>
    </>
  );
};
