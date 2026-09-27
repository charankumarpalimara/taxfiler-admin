export type SubmissionStatus = 'New' | 'In Progress' | 'Contacted' | 'Completed' | 'Archived';

export type PortalStatus = 'Verified' | 'Active' | 'Pending Review' | 'Suspended';

export type ClientStatus = 'Active' | 'Onboarding' | 'Filing Pending' | 'Completed' | 'Inactive';
export type ClientType = 'Individual' | 'Corporate' | 'Partnership' | 'Small Business';

export interface Client {
  id: string;
  clientName: string;
  companyName?: string;
  email: string;
  phone: string;
  clientType: ClientType;
  assignedCPA: string;
  taxYear: string;
  status: ClientStatus;
  totalFilings: number;
  lastFilingDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Submission {
  id: string;
  type?: 'consultation' | 'quick_contact';
  firstName?: string;
  lastName?: string;
  clientName: string;
  email: string;
  phone: string;
  preferredLanguage?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  services: string[];
  leadSource?: string;
  notes?: string;
  staffNote?: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Registration {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  phone: string;
  portalStatus: PortalStatus;
  accountType: string;
  createdAt: string;
  lastLogin?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  error?: string;
}
