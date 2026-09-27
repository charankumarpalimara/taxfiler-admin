import { Client, ClientStatus, ClientType } from '@/types';
import { API_BASE_URL } from './api.config';

// Initial Mock Clients Data for fallback / instant response
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
    totalFilings: 3,
    lastFilingDate: '2024-04-10',
    notes: 'Form 1040 with Schedule C for consulting income and stock option exercises.',
    createdAt: '2024-02-20T14:15:00.000Z',
  },
  {
    id: 'CLI-1003',
    clientName: 'Marcus Thorne',
    companyName: 'Apex Innovations Inc',
    email: 'mthorne@apexinnovations.io',
    phone: '(555) 456-7890',
    clientType: 'Corporate',
    assignedCPA: 'David Miller, CPA',
    taxYear: '2025',
    status: 'Onboarding',
    totalFilings: 1,
    lastFilingDate: 'N/A',
    notes: 'New tech startup client. Needs R&D tax credit advisory and C-Corp setup.',
    createdAt: '2025-01-10T11:00:00.000Z',
  },
  {
    id: 'CLI-1004',
    clientName: 'Dr. Rachel Green',
    companyName: 'Green Medical Practice Group',
    email: 'r.green@greenmd.org',
    phone: '(555) 987-1234',
    clientType: 'Partnership',
    assignedCPA: 'Michael Chang, CPA',
    taxYear: '2025',
    status: 'Active',
    totalFilings: 7,
    lastFilingDate: '2025-03-15',
    notes: 'Partnership Form 1065 + Schedule K-1 distribution for 4 medical partners.',
    createdAt: '2023-08-05T16:45:00.000Z',
  },
  {
    id: 'CLI-1005',
    clientName: 'James O\'Connor',
    companyName: 'O\'Connor Construction & Co',
    email: 'james@oconnorbuilt.com',
    phone: '(555) 321-6547',
    clientType: 'Small Business',
    assignedCPA: 'Sarah Jenkins, CPA',
    taxYear: '2024',
    status: 'Completed',
    totalFilings: 4,
    lastFilingDate: '2024-10-15',
    notes: 'Equipment depreciation (Section 179) and commercial vehicle write-offs.',
    createdAt: '2023-11-12T10:20:00.000Z',
  },
  {
    id: 'CLI-1006',
    clientName: 'Sophia Martinez',
    companyName: 'Individual',
    email: 'sophia.m@outlook.com',
    phone: '(555) 654-9870',
    clientType: 'Individual',
    assignedCPA: 'Michael Chang, CPA',
    taxYear: '2025',
    status: 'Active',
    totalFilings: 2,
    lastFilingDate: '2025-04-01',
    notes: 'Individual 1040 return + real estate rental property income (Schedule E).',
    createdAt: '2024-03-01T13:30:00.000Z',
  },
];

export class ClientsService {
  public static async getClients(filters?: {
    status?: string | null;
    search?: string | null;
    clientType?: string | null;
  }): Promise<Client[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/clients`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          mockClients = json.data;
        }
      }
    } catch {
      // Backend not running, fallback to memory mockClients
    }

    let data = [...mockClients];

    if (filters?.status && filters.status.toLowerCase() !== 'all') {
      data = data.filter((item) => item.status.toLowerCase() === filters.status!.toLowerCase());
    }

    if (filters?.clientType && filters.clientType.toLowerCase() !== 'all') {
      data = data.filter((item) => item.clientType.toLowerCase() === filters.clientType!.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (item) =>
          item.clientName.toLowerCase().includes(q) ||
          item.companyName?.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q) ||
          item.assignedCPA.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
      );
    }

    return data;
  }

  public static async createClient(payload: Partial<Client>): Promise<Client> {
    const newClient: Client = {
      id: payload.id || `CLI-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: payload.clientName || 'Unnamed Client',
      companyName: payload.companyName || 'Individual',
      email: payload.email || '',
      phone: payload.phone || '',
      clientType: (payload.clientType as ClientType) || 'Individual',
      assignedCPA: payload.assignedCPA || 'Unassigned',
      taxYear: payload.taxYear || '2025',
      status: (payload.status as ClientStatus) || 'Onboarding',
      totalFilings: payload.totalFilings || 1,
      lastFilingDate: payload.lastFilingDate || new Date().toISOString().split('T')[0],
      notes: payload.notes || '',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          mockClients.unshift(json.data);
          return json.data;
        }
      }
    } catch {
      // Memory fallback
    }

    mockClients.unshift(newClient);
    return newClient;
  }

  public static async updateClientStatus(id: string, status: ClientStatus): Promise<Client> {
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const idx = mockClients.findIndex((c) => c.id === id);
          if (idx !== -1) mockClients[idx] = json.data;
          return json.data;
        }
      }
    } catch {
      // Memory fallback
    }

    const client = mockClients.find((c) => c.id === id);
    if (!client) throw new Error('Client not found');
    client.status = status;
    client.updatedAt = new Date().toISOString();
    return client;
  }

  public static async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const idx = mockClients.findIndex((c) => c.id === id);
          if (idx !== -1) mockClients[idx] = json.data;
          return json.data;
        }
      }
    } catch {
      // Memory fallback
    }

    const idx = mockClients.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Client not found');
    mockClients[idx] = { ...mockClients[idx], ...updates, updatedAt: new Date().toISOString() };
    return mockClients[idx];
  }

  public static async deleteClient(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        mockClients = mockClients.filter((c) => c.id !== id);
        return true;
      }
    } catch {
      // Memory fallback
    }

    mockClients = mockClients.filter((c) => c.id !== id);
    return true;
  }
}
