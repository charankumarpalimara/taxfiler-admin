import { Client, ClientStatus, ClientType, UserFullDetails, PaginationMeta } from '@/types';
import { API_BASE_URL } from './api.config';

// Fallback Mock Clients Data in case backend is offline
let mockClients: Client[] = [
  {
    id: 'CLI-1001',
    clientName: 'Alexander Vance',
    companyName: 'Vance Logistics LLC',
    email: 'a.vance@vancelogistics.com',
    phone: '(555) 234-8901',
    clientType: 'Corporate',
    assignedCPA: 'David Miller, CPA',
    taxYear: '2025',
    status: 'Active',
    filingStatus: 'Under Review',
    totalFilings: 5,
    lastFilingDate: '2025-04-12',
    notes: 'Corporate tax client. 1120S return and quarterly payroll tax filings.',
    createdAt: '2024-01-15T09:30:00.000Z',
  },
  {
    id: 'CLI-1002',
    clientName: 'Elena Rostova',
    companyName: 'Individual',
    email: 'elena.rostova@gmail.com',
    phone: '(555) 876-5432',
    clientType: 'Individual',
    assignedCPA: 'Sarah Jenkins, CPA',
    taxYear: '2025',
    status: 'Filing Pending',
    filingStatus: 'Documents Uploaded',
    totalFilings: 3,
    lastFilingDate: '2024-04-10',
    notes: 'Form 1040 with Schedule C for consulting income.',
    createdAt: '2024-02-20T14:15:00.000Z',
  },
];

export class ClientsService {
  /**
   * Fetch all clients from backend API with pagination and fallback to local mock data
   */
  public static async getClients(filters?: {
    status?: string | null;
    search?: string | null;
    clientType?: string | null;
    page?: number | string | null;
    limit?: number | string | null;
  }): Promise<{ data: Client[]; count: number; pagination: PaginationMeta }> {
    const pageNum = Math.max(1, Number(filters?.page) || 1);
    const limitNum = Math.max(1, Number(filters?.limit) || 10);

    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      params.append('page', String(pageNum));
      params.append('limit', String(limitNum));

      const res = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          let data: Client[] = json.data;
          if (filters?.clientType && filters.clientType !== 'All') {
            data = data.filter((c) => c.clientType?.toLowerCase() === filters.clientType!.toLowerCase());
          }

          const total = json.pagination?.total ?? json.count ?? data.length;
          const pagination: PaginationMeta = {
            page: json.pagination?.page ?? pageNum,
            limit: json.pagination?.limit ?? limitNum,
            total,
            totalPages: json.pagination?.totalPages ?? (Math.ceil(total / limitNum) || 1),
          };

          return {
            data,
            count: total,
            pagination,
          };
        }
      }
    } catch (err) {
      console.warn('Backend fetch for clients failed, using fallback:', err);
    }

    // Fallback to local memory clients
    let data = [...mockClients];
    if (filters?.status && filters.status !== 'All') {
      data = data.filter((c) => c.status?.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters?.clientType && filters.clientType !== 'All') {
      data = data.filter((c) => c.clientType?.toLowerCase() === filters.clientType!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (c) =>
          c.clientName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      );
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginatedData = data.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return {
      data: paginatedData,
      count: total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  }

  /**
   * Fetch complete user profile including Taxpayer, Spouse, Dependents, Address, Contact, Identity, Bank, and Documents
   */
  public static async getClientFullDetails(userId: string): Promise<UserFullDetails | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/details`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch full user details from backend:', err);
    }
    return null;
  }

  /**
   * Create a new client record
   */
  public static async createClient(payload: Partial<Client>): Promise<Client> {
    const newClient: Client = {
      id: `CLI-${Date.now().toString().slice(-4)}`,
      clientName: payload.clientName || 'New Client',
      companyName: payload.companyName || 'Individual',
      email: payload.email || 'client@example.com',
      phone: payload.phone || '(555) 000-0000',
      clientType: (payload.clientType as ClientType) || 'Individual',
      assignedCPA: payload.assignedCPA || 'David Miller, CPA',
      taxYear: payload.taxYear || '2025',
      status: (payload.status as ClientStatus) || 'Onboarding',
      filingStatus: payload.filingStatus || 'Documents Uploaded',
      totalFilings: 0,
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
    };
    mockClients.unshift(newClient);
    return newClient;
  }

  /**
   * Update client status or filing progress
   */
  public static async updateClientStatus(id: string, status: ClientStatus, filingStatus?: string): Promise<Client> {
    try {
      await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, filingStatus }),
      });
    } catch (e) {
      console.warn('Backend update failed, updating locally:', e);
    }

    const index = mockClients.findIndex((c) => c.id === id);
    if (index !== -1) {
      mockClients[index] = { ...mockClients[index], status, filingStatus: filingStatus || mockClients[index].filingStatus };
      return mockClients[index];
    }
    return { id, status } as any;
  }

  /**
   * Update full client details
   */
  public static async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    try {
      await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('Backend update failed:', e);
    }

    const index = mockClients.findIndex((c) => c.id === id);
    if (index !== -1) {
      mockClients[index] = { ...mockClients[index], ...updates };
      return mockClients[index];
    }
    return { id, ...updates } as any;
  }

  /**
   * Delete a client
   */
  public static async deleteClient(id: string): Promise<boolean> {
    mockClients = mockClients.filter((c) => c.id !== id);
    return true;
  }
}
