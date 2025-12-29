import React from 'react';
import { LeadsTable } from '../components/leads/LeadsTable';

const LeadsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads & Patients</h1>
        <p className="text-slate-500 mt-1">View and manage all contacts in list view.</p>
      </div>
      
      <LeadsTable />
    </div>
  );
};

export default LeadsPage;