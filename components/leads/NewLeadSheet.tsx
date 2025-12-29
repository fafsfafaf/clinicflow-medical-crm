
import React, { useState } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { useNewLeadSheetSettings } from '../../lib/theme/useNewLeadSheetSettings';
import { Sheet } from '../ui/sheet';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Lead } from '../../lib/mock/types';
import { User, Mail, Phone, DollarSign, Tag, Briefcase, Layout, UserPlus, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NewLeadSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewLeadSheet: React.FC<NewLeadSheetProps> = ({ isOpen, onClose }) => {
  const { addLead, pipelineColumns } = useAppStore();
  const settings = useNewLeadSheetSettings();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    valueEstimate: '',
    source: 'Manual Entry',
    status: pipelineColumns[0]?.id || 'col_new',
    notes: '' // Added notes to state
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.firstName || !formData.lastName) return;

    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      source: formData.source,
      status: formData.status,
      score: 50, // Default score
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      nextFollowUp: null,
      assignedAgentId: 'ag_1', // Default assign to current user or unassigned
      valueEstimate: parseFloat(formData.valueEstimate) || 0,
      tags: ['New'],
      notes: formData.notes // Save the notes
    };

    addLead(newLead);
    
    // Reset and close
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      valueEstimate: '',
      source: 'Manual Entry',
      status: pipelineColumns[0]?.id || 'col_new',
      notes: ''
    });
    onClose();
  };

  // --- Styles ---
  
  const headerStyle: React.CSSProperties = {
    paddingTop: `${settings.headerPaddingY}px`,
    paddingBottom: `${settings.headerPaddingY}px`,
    paddingLeft: `${settings.headerPaddingX}px`,
    paddingRight: `${settings.headerPaddingX}px`,
  };

  const bodyStyle: React.CSSProperties = {
    paddingTop: `${settings.contentPaddingTop}px`,
    paddingBottom: `${settings.contentPaddingBottom}px`,
    paddingLeft: `${settings.contentPaddingX}px`,
    paddingRight: `${settings.contentPaddingX}px`,
    marginBottom: `${settings.contentFooterGap}px`,
  };

  const footerStyle: React.CSSProperties = {
    paddingTop: `${settings.footerPaddingTop}px`,
    paddingBottom: `${settings.footerPaddingBottom + (settings.safeAreaBottom ? 20 : 0)}px`,
    paddingLeft: `${settings.footerPaddingX}px`,
    paddingRight: `${settings.footerPaddingX}px`,
  };

  return (
    <Sheet 
      isOpen={isOpen} 
      onClose={onClose} 
      height={`${settings.sheetMaxHeightVh}vh`}
    >
      <form 
        onSubmit={handleSubmit} 
        className={cn(
          "bg-white h-full",
          settings.scrollBehavior === 'content' ? "flex flex-col overflow-hidden" : "block overflow-y-auto"
        )}
      >
        
        {/* Header Section */}
        <div 
          className="border-b border-slate-100 bg-slate-50/50 flex items-start gap-5 shrink-0"
          style={headerStyle}
        >
           <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-1 shadow-sm shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600">
                <UserPlus className="w-6 h-6" />
              </div>
           </div>
           <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">New Patient Profile</h2>
              <p className="text-sm text-slate-500 mt-1">Enter contact details and initial pipeline stage for the new lead.</p>
           </div>
        </div>

        {/* Scrollable Body */}
        <div 
          className={cn(
            settings.scrollBehavior === 'content' ? "flex-1 overflow-y-auto" : ""
          )}
          style={bodyStyle}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.sectionGap}px` }}>
            
            {/* Section 1: Contact */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                 <User className="w-4 h-4 text-slate-400" />
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-2" style={{ gap: `${settings.fieldGap}px` }}>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">First Name <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="e.g. John" 
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Last Name <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="e.g. Doe" 
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2" style={{ gap: `${settings.fieldGap}px` }}>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    icon={<Mail className="w-4 h-4" />}
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                  <Input 
                    type="tel" 
                    placeholder="+1 (555) 000-0000" 
                    icon={<Phone className="w-4 h-4" />}
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Pipeline */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                 <Briefcase className="w-4 h-4 text-slate-400" />
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Deal & Pipeline</h3>
              </div>
              
              <div className="grid grid-cols-2" style={{ gap: `${settings.fieldGap}px` }}>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Initial Stage</label>
                  <div className="relative">
                    <Layout className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select 
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none focus:bg-white transition-colors"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                    >
                      {pipelineColumns.map(col => (
                        <option key={col.id} value={col.id}>{col.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Lead Source</label>
                   <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <select 
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none focus:bg-white transition-colors"
                        value={formData.source}
                        onChange={(e) => handleChange('source', e.target.value)}
                      >
                        <option value="Manual Entry">Manual Entry</option>
                        <option value="Phone Call">Phone Call</option>
                        <option value="Walk-in">Walk-in</option>
                        <option value="Referral">Referral</option>
                        <option value="Website">Website</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Est. Value ($)</label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    icon={<DollarSign className="w-4 h-4" />}
                    value={formData.valueEstimate}
                    onChange={(e) => handleChange('valueEstimate', e.target.value)}
                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors no-spinner"
                  />
                </div>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-2 pt-2">
               <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Quick Note</span>
               </div>
               <textarea 
                  className="w-full h-24 p-3 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors resize-none placeholder:text-slate-400"
                  placeholder="Any initial notes about this patient..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
               />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div 
          className="bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 shrink-0"
          style={footerStyle}
        >
          <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-slate-100 text-slate-600">Cancel</Button>
          <Button type="submit" className="px-8 shadow-md shadow-blue-500/20">Create Lead</Button>
        </div>
      </form>
    </Sheet>
  );
};
