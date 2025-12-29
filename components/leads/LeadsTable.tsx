import React, { useState } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatDate } from '../../lib/utils';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { Filter, ArrowUpDown } from 'lucide-react';

export const LeadsTable = () => {
  const { leads, searchQuery } = useAppStore();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const filteredLeads = leads.filter(l => 
    !searchQuery || 
    l.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800">All Leads ({filteredLeads.length})</h2>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" icon={<Filter className="w-3 h-3 mr-2"/>}>Filter</Button>
           <Button variant="default" size="sm">Export CSV</Button>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1">
                  Created <ArrowUpDown className="w-3 h-3" />
                </th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map(lead => (
                <tr 
                  key={lead.id} 
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedLeadId(lead.id)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{lead.firstName} {lead.lastName}</div>
                    <div className="text-xs text-slate-500">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{lead.status.replace('col_', '')}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className={lead.score > 80 ? "text-emerald-600 font-bold" : "text-slate-600"}>
                      {lead.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{lead.source}</td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(lead.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedLeadId(lead.id); }}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
             <div className="p-12 text-center text-slate-400">No leads found matching your search.</div>
          )}
        </div>
      </Card>

      <LeadDetailDrawer 
        leadId={selectedLeadId} 
        onClose={() => setSelectedLeadId(null)} 
      />
    </>
  );
};