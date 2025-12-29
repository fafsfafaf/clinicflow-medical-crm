import { Lead, PipelineColumn, Agent, Call, Org } from './types';

export const MOCK_ORG: Org = {
  id: 'org_1',
  name: 'Vitality Peptide Clinic',
  logo: 'https://picsum.photos/40/40'
};

export const DEFAULT_PIPELINE: PipelineColumn[] = [
  { id: 'col_new', title: 'New Lead', order: 0 },
  { id: 'col_contacted', title: 'Contacted', order: 1 },
  { id: 'col_booked', title: 'Booked', order: 2 },
  { id: 'col_noshow', title: 'No-Show', order: 3 },
  { id: 'col_patient', title: 'Patient', order: 4 },
  { id: 'col_lost', title: 'Disqualified', order: 5 },
];

export const MOCK_AGENTS: Agent[] = [
  { id: 'ag_1', name: 'Sarah Connor', avatar: 'https://i.pravatar.cc/150?u=1', status: 'online' },
  { id: 'ag_2', name: 'John Reese', avatar: 'https://i.pravatar.cc/150?u=2', status: 'busy' },
];

export const MOCK_LEADS: Lead[] = [
  {
    id: 'ld_1', firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@example.com', phone: '+1 555-0101',
    source: 'Meta', status: 'col_new', score: 85, createdAt: '2023-10-01T09:00:00Z',
    lastActivity: '2023-10-05T14:30:00Z', nextFollowUp: '2023-10-06T10:00:00Z', assignedAgentId: 'ag_1', valueEstimate: 0,
    tags: ['Peptides', 'Weight Loss']
  },
  {
    id: 'ld_2', firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@example.com', phone: '+1 555-0102',
    source: 'Referral', status: 'col_contacted', score: 92, createdAt: '2023-09-28T11:15:00Z',
    lastActivity: '2023-10-04T16:00:00Z', nextFollowUp: null, assignedAgentId: 'ag_2', valueEstimate: 2500,
    tags: ['TRT', 'High Value']
  },
  {
    id: 'ld_3', firstName: 'Charlie', lastName: 'Davis', email: 'charlie.d@example.com', phone: '+1 555-0103',
    source: 'Website', status: 'col_booked', score: 60, createdAt: '2023-10-02T08:45:00Z',
    lastActivity: '2023-10-03T09:30:00Z', nextFollowUp: '2023-10-10T11:00:00Z', assignedAgentId: 'ag_1', valueEstimate: 800,
    tags: []
  },
  {
    id: 'ld_4', firstName: 'Diana', lastName: 'Prince', email: 'diana.p@example.com', phone: '+1 555-0104',
    source: 'Instagram', status: 'col_new', score: 45, createdAt: '2023-10-05T10:00:00Z',
    lastActivity: '2023-10-05T10:05:00Z', nextFollowUp: null, assignedAgentId: 'ag_2', valueEstimate: 0,
    tags: ['Botox']
  },
  // Additional Leads to fill the board
  {
    id: 'ld_5', firstName: 'Erik', lastName: 'Lensherr', email: 'erik@magneto.com', phone: '+1 555-0999',
    source: 'Referral', status: 'col_noshow', score: 35, createdAt: '2023-10-06T12:00:00Z',
    lastActivity: '2023-10-07T09:00:00Z', nextFollowUp: '2023-10-12T15:00:00Z', assignedAgentId: 'ag_2', valueEstimate: 0,
    tags: ['Rescheduled']
  },
  {
    id: 'ld_6', firstName: 'Charles', lastName: 'Xavier', email: 'prof@x.edu', phone: '+1 555-0888',
    source: 'Website', status: 'col_patient', score: 99, createdAt: '2023-09-10T08:00:00Z',
    lastActivity: '2023-10-02T11:00:00Z', nextFollowUp: null, assignedAgentId: 'ag_1', valueEstimate: 12000,
    tags: ['VIP', 'Stem Cells']
  },
  {
    id: 'ld_7', firstName: 'Logan', lastName: 'Howlett', email: 'wolverine@x.men', phone: '+1 555-0777',
    source: 'Meta', status: 'col_lost', score: 15, createdAt: '2023-10-01T14:00:00Z',
    lastActivity: '2023-10-01T14:05:00Z', nextFollowUp: null, assignedAgentId: 'ag_2', valueEstimate: 0,
    tags: ['Not Interested', 'Price']
  },
   {
    id: 'ld_8', firstName: 'Jean', lastName: 'Grey', email: 'phoenix@x.men', phone: '+1 555-0666',
    source: 'Instagram', status: 'col_lost', score: 25, createdAt: '2023-10-03T16:00:00Z',
    lastActivity: '2023-10-04T09:00:00Z', nextFollowUp: null, assignedAgentId: 'ag_1', valueEstimate: 0,
    tags: ['Bad Fit']
  }
];

export const MOCK_CALLS: Call[] = [
  {
    id: 'cl_1', leadId: 'ld_1', agentId: 'ag_1', direction: 'outbound', durationSeconds: 145, cost: 0.50,
    timestamp: '2023-10-05T14:25:00Z', outcome: 'connected',
    transcript: "Agent: Hello, this is Sarah from Vitality.\nAlice: Hi, yes I asked for info on peptides.\nAgent: Great, let me explain our process...",
    audioUrl: '#'
  },
  {
    id: 'cl_2', leadId: 'ld_2', agentId: 'ag_2', direction: 'inbound', durationSeconds: 320, cost: 1.20,
    timestamp: '2023-10-04T15:55:00Z', outcome: 'qualified',
    transcript: "Bob: I'm calling to confirm my appointment.\nAgent: Sure Bob, let me check the calendar.",
    audioUrl: '#'
  }
];