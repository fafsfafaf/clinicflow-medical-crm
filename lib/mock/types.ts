
export type LeadStatus = 'New Lead' | 'Contacted' | 'Booked' | 'No-Show' | 'Attended' | 'Patient' | 'Won' | 'Lost';

export interface LeadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string; // Mock url
  uploadedAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'note' | 'mention' | 'stage_change' | 'system' | 'file' | 'email' | 'sms';
  content: string;
  author: string;
  timestamp: string;
  metadata?: any; // For flexible data like file info, email subject
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  leadId: string; // The context
  leadName: string;
  type: 'mention' | 'assignment' | 'reminder';
  message: string;
  isRead: boolean;
  timestamp: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  status: string; // Linked to column ID basically
  score: number; // 0-100
  createdAt: string;
  lastActivity: string;
  nextFollowUp: string | null;
  assignedAgentId: string;
  valueEstimate: number;
  tags: string[];
  notes?: string; // HTML string
  activities?: ActivityLog[]; // New field for timeline events
  files?: LeadFile[]; // New field for attachments
}

export interface PipelineColumn {
  id: string;
  title: string;
  order: number;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
}

export interface Call {
  id: string;
  leadId: string;
  agentId: string;
  direction: 'inbound' | 'outbound';
  durationSeconds: number;
  cost: number;
  timestamp: string;
  outcome: 'connected' | 'voicemail' | 'missed' | 'qualified' | 'not-qualified' | 'booked';
  transcript: string;
  audioUrl: string; // mock
}

export interface Org {
  id: string;
  name: string;
  logo: string;
}
