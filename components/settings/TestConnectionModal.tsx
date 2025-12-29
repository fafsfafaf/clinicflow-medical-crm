
import React, { useState, useEffect } from 'react';
import { Sheet } from '../ui/sheet';
import { Button } from '../ui/button';
import { CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TestConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
}

export const TestConnectionModal: React.FC<TestConnectionModalProps> = ({ isOpen, onClose, type }) => {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');

  useEffect(() => {
    if (isOpen) {
      setStatus('testing');
      // Simulate API Check
      const timer = setTimeout(() => {
        // Randomly succeed for demo
        setStatus('success');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleRetry = () => {
    setStatus('testing');
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} height="auto" className="sm:max-w-md">
      <div className="flex flex-col items-center justify-center p-8 text-center h-full">
        
        {status === 'testing' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Testing Connection...</h3>
              <p className="text-sm text-slate-500 mt-1">Verifying credentials with {type} provider.</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Connection Successful</h3>
              <p className="text-sm text-slate-500 mt-1">Your {type} integration is active and working correctly.</p>
            </div>
            <Button onClick={onClose} className="min-w-[120px]">Done</Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Connection Failed</h3>
              <p className="text-sm text-slate-500 mt-1">Could not verify credentials. Please check your API keys.</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button onClick={handleRetry} icon={<RefreshCw className="w-4 h-4 mr-2"/>}>Retry</Button>
            </div>
          </div>
        )}

      </div>
    </Sheet>
  );
};
