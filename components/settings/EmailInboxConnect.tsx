
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Sheet } from '../ui/sheet';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, Power, ShieldCheck, Server, Settings2, Globe, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

export const EmailInboxConnect = () => {
  const { connections, updateConnection } = useAppStore();
  const emailState = connections.email;

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [setupMode, setSetupMode] = useState<'google' | 'manual'>('google');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Manual Config State
  const [manualConfig, setManualConfig] = useState({
    fromName: '',
    fromEmail: '',
    smtpHost: '',
    smtpPort: '587',
    username: '',
    password: '',
    useTls: true
  });
  const [showPassword, setShowPassword] = useState(false);

  // Reset form when opening
  useEffect(() => {
    if (isSheetOpen && !emailState.isConnected) {
      setSetupMode('google');
      setManualConfig({
        fromName: '',
        fromEmail: '',
        smtpHost: '',
        smtpPort: '587',
        username: '',
        password: '',
        useTls: true
      });
    } else if (isSheetOpen && emailState.isConnected && emailState.provider === 'manual') {
      setSetupMode('manual');
      setManualConfig(emailState.config as any || {});
    }
  }, [isSheetOpen, emailState.isConnected, emailState.provider, emailState.config]);

  const handleConnectGoogle = () => {
    setIsRedirecting(true);
    // Simulate OAuth Redirect
    setTimeout(() => {
      setIsRedirecting(false);
      updateConnection('email', {
        isConnected: true,
        provider: 'google',
        connectedAs: 'sarah.connor@gmail.com', // Mocked
        lastTestedAt: new Date().toISOString()
      });
      setIsSheetOpen(false);
    }, 2000);
  };

  const handleConnectManual = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate Validation
    setTimeout(() => {
      setIsLoading(false);
      updateConnection('email', {
        isConnected: true,
        provider: 'manual',
        connectedAs: manualConfig.fromEmail,
        config: manualConfig,
        lastTestedAt: new Date().toISOString()
      });
      setIsSheetOpen(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect your email inbox?')) {
      updateConnection('email', {
        isConnected: false,
        connectedAs: undefined,
        config: undefined
      });
    }
  };

  const handleTest = () => {
    alert("Connection tested successfully: OK");
  };

  return (
    <>
      <Card className="border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="flex items-start gap-5">
              <div className={cn(
                "w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 transition-colors",
                emailState.isConnected ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-white border-slate-100 text-slate-400"
              )}>
                <Mail className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">Email Inbox</h3>
                  {emailState.isConnected && (
                    <Badge variant="success" className="h-5 px-1.5 gap-1 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </Badge>
                  )}
                </div>
                
                {emailState.isConnected ? (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      Connected as <span className="font-semibold text-slate-900">{emailState.connectedAs}</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="text-slate-500 capitalize">{emailState.provider === 'google' ? 'Google Workspace' : 'SMTP'}</span>
                    </p>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded w-fit border border-slate-100">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Permissions: Read inbox + Send email
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 pl-1">
                        <RefreshCw className="w-3 h-3" />
                        Last checked: just now
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                    Connect your email inbox to sync messages, track replies, and send campaigns directly from the dashboard.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              {emailState.isConnected ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full md:w-auto text-slate-600"
                    onClick={handleTest}
                  >
                    Test connection
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 border-red-100 hover:bg-red-50 hover:border-red-200 w-full md:w-auto"
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setIsSheetOpen(true)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm w-full md:w-auto h-11 px-6 gap-3"
                >
                  <Mail className="w-4 h-4" />
                  <span className="font-semibold">Connect Inbox</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Wizard Sheet */}
      <Sheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} height="auto" className="sm:max-w-lg">
        <div className="flex flex-col h-full bg-white">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
             <div>
                <h3 className="font-bold text-slate-900 text-lg">Connect Email Inbox</h3>
                <p className="text-xs text-slate-500">Choose your provider to start syncing.</p>
             </div>
             <button onClick={() => setIsSheetOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
               <span className="sr-only">Close</span>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
             </button>
          </div>

          <div className="p-6 overflow-y-auto">
            
            {/* Toggle Options */}
            {!emailState.isConnected && (
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button
                  onClick={() => setSetupMode('google')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                    setupMode === 'google' 
                      ? "border-blue-500 bg-blue-50/50 text-blue-700" 
                      : "border-slate-100 hover:border-slate-200 text-slate-500"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  </div>
                  <span className="font-bold text-sm">Google</span>
                </button>

                <button
                  onClick={() => setSetupMode('manual')}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                    setupMode === 'manual' 
                      ? "border-slate-800 bg-slate-50 text-slate-900" 
                      : "border-slate-100 hover:border-slate-200 text-slate-500"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-700">
                    <Settings2 className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm">Manual SMTP</span>
                </button>
              </div>
            )}

            {/* OPTION A: GOOGLE */}
            {setupMode === 'google' && (
              <div className="space-y-6 text-center py-4">
                {isRedirecting ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in-95">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Redirecting to Google...</h4>
                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">Please wait while we redirect you to the secure authentication page.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-left flex gap-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm h-fit">
                        <Zap className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-blue-900 mb-1">Recommended Integration</h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Connect instantly using OAuth 2.0. We will sync your emails securely without storing your password.
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        onClick={handleConnectGoogle}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 font-bold text-base"
                      >
                        Connect Google Inbox
                      </Button>
                      <p className="text-[10px] text-slate-400 mt-3">
                        By connecting, you agree to our Terms of Service and Privacy Policy.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* OPTION B: MANUAL */}
            {setupMode === 'manual' && (
              <form onSubmit={handleConnectManual} className="space-y-5 animate-in slide-in-from-right-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">From Name</label>
                    <Input 
                      placeholder="Dr. Smith"
                      value={manualConfig.fromName}
                      onChange={(e) => setManualConfig({...manualConfig, fromName: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">From Email</label>
                    <Input 
                      placeholder="info@clinic.com"
                      value={manualConfig.fromEmail}
                      onChange={(e) => setManualConfig({...manualConfig, fromEmail: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Server className="w-3 h-3" /> SMTP Server
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Host</label>
                      <Input 
                        placeholder="smtp.office365.com"
                        value={manualConfig.smtpHost}
                        onChange={(e) => setManualConfig({...manualConfig, smtpHost: e.target.value})}
                        required
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600">Port</label>
                      <Input 
                        placeholder="587"
                        value={manualConfig.smtpPort}
                        onChange={(e) => setManualConfig({...manualConfig, smtpPort: e.target.value})}
                        required
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Username</label>
                    <Input 
                      placeholder="user@domain.com"
                      value={manualConfig.username}
                      onChange={(e) => setManualConfig({...manualConfig, username: e.target.value})}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Password</label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={manualConfig.password}
                        onChange={(e) => setManualConfig({...manualConfig, password: e.target.value})}
                        className="bg-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">Use TLS/SSL</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={manualConfig.useTls} 
                        onChange={(e) => setManualConfig({...manualConfig, useTls: e.target.checked})}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    isLoading={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Save Configuration
                  </Button>
                </div>
              </form>
            )}

          </div>
        </div>
      </Sheet>
    </>
  );
};
