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
  clientType: ClientType | string;
  assignedCPA: string;
  taxYear: string;
  status: ClientStatus | string;
  filingStatus?: string;
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

export interface UserDocument {
  id: string;
  documentType: string;
  person: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  status: 'Pending Review' | 'Approved' | 'Rejected' | string;
  reviewNotes?: string;
  createdAt: string;
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  } | null;
}

export interface UserFullDetails {
  user: {
    id: string;
    fullName: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    role?: string;
    portalStatus: string;
    filingStatus: string;
    assignedCPA: string;
    accountType: string;
    referralId?: string;
    notes?: string;
    createdAt: string;
  };
  taxpayer?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    ssn?: string;
    dob?: string;
    filingStatus?: string;
    occupation?: string;
  } | null;
  spouse?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    ssn?: string;
    dob?: string;
  } | null;
  dependents?: Array<{
    id?: string;
    _id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    ssn?: string;
    dob?: string;
    relationship?: string;
  }>;
  address?: {
    currentAddress?: { street?: string; city?: string; state?: string; zipCode?: string };
    taxYearAddress?: { street?: string; city?: string; state?: string; zipCode?: string };
  } | null;
  contact?: {
    email?: string;
    phone?: string;
    alternateEmail?: string;
    alternatePhone?: string;
  } | null;
  identity?: {
    licenseNumber?: string;
    stateOfIssue?: string;
    expirationDate?: string;
    licenseDocument?: string;
  } | null;
  bank?: {
    bankName?: string;
    accountType?: string;
    accountNumber?: string;
    routingNumber?: string;
    accountHolderName?: string;
  } | null;
  documents?: UserDocument[];
  schedules?: any[];
  referrals?: any[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  pagination?: PaginationMeta;
  message?: string;
  error?: string;
}
