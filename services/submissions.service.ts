import { Submission, SubmissionStatus } from '@/types';

import { API_BASE_URL } from './api.config';

export class SubmissionsService {
  public static async getSubmissions(filters?: {
    status?: string | null;
    search?: string | null;
    service?: string | null;
  }): Promise<Submission[]> {
    const res = await fetch(`${API_BASE_URL}/submissions`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch submissions from backend');
    const json = await res.json();
    let data: Submission[] = json.data || [];

    if (filters?.status && filters.status.toLowerCase() !== 'all') {
      data = data.filter((item) => item.status?.toLowerCase() === filters.status!.toLowerCase());
    }

    if (filters?.service && filters.service.toLowerCase() !== 'all') {
      data = data.filter((item) =>
        item.services?.some((s) => s.toLowerCase().includes(filters.service!.toLowerCase()))
      );
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (item) =>
          item.clientName?.toLowerCase().includes(q) ||
          item.email?.toLowerCase().includes(q) ||
          item.phone?.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q)
      );
    }

    return data;
  }

  public static async createSubmission(payload: Partial<Submission>): Promise<Submission> {
    const res = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create submission');
    return json.data;
  }

  public static async updateSubmission(
    id: string,
    updates: { status?: SubmissionStatus; staffNote?: string }
  ): Promise<Submission> {
    const res = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update submission');
    return json.data;
  }

  public static async deleteSubmission(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/submissions/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete submission');
    return true;
  }
}
