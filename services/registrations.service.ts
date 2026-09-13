import { Registration, PortalStatus } from '@/types';
import { API_BASE_URL } from './api.config';

export class RegistrationsService {
  public static async getRegistrations(filters?: {
    status?: string | null;
    search?: string | null;
  }): Promise<Registration[]> {
    const res = await fetch(`${API_BASE_URL}/registrations`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch registrations from backend');
    const json = await res.json();
    let data: Registration[] = json.data || [];

    if (filters?.status && filters.status.toLowerCase() !== 'all') {
      data = data.filter((item) => item.portalStatus?.toLowerCase() === filters.status!.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (item) =>
          item.fullName?.toLowerCase().includes(q) ||
          item.email?.toLowerCase().includes(q) ||
          item.phone?.toLowerCase().includes(q)
      );
    }

    return data;
  }

  public static async createRegistration(payload: Partial<Registration>): Promise<Registration> {
    const res = await fetch(`${API_BASE_URL}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create registration');
    return json.data;
  }

  public static async updateRegistrationStatus(id: string, portalStatus: PortalStatus): Promise<Registration> {
    const res = await fetch(`${API_BASE_URL}/registrations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portalStatus }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update registration status');
    return json.data;
  }

  public static async deleteRegistration(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/registrations/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete registration');
    return true;
  }
}
