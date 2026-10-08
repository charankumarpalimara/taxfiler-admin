import { UserDocument, ApiResponse, PaginationMeta } from '@/types';
import { API_BASE_URL } from './api.config';

export class DocumentsService {
  /**
   * Fetch all uploaded user documents from the backend with pagination
   */
  public static async getDocuments(filters?: {
    status?: string | null;
    documentType?: string | null;
    search?: string | null;
    page?: number | string | null;
    limit?: number | string | null;
  }): Promise<{ data: UserDocument[]; count: number; pagination: PaginationMeta }> {
    const pageNum = Math.max(1, Number(filters?.page) || 1);
    const limitNum = Math.max(1, Number(filters?.limit) || 10);

    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters?.documentType && filters.documentType !== 'All') params.append('documentType', filters.documentType);
      if (filters?.search) params.append('search', filters.search);
      params.append('page', String(pageNum));
      params.append('limit', String(limitNum));

      const url = `${API_BASE_URL}/admin/documents?${params.toString()}`;
      const res = await fetch(url, { cache: 'no-store' });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json: ApiResponse<UserDocument[]> = await res.json();
      const data = json.data || [];
      const total = json.pagination?.total ?? json.count ?? data.length;
      const pagination: PaginationMeta = {
        page: json.pagination?.page ?? pageNum,
        limit: json.pagination?.limit ?? limitNum,
        total,
        totalPages: json.pagination?.totalPages ?? (Math.ceil(total / limitNum) || 1),
      };

      return { data, count: total, pagination };
    } catch (err) {
      console.warn('Backend documents fetch failed, using fallback empty state:', err);
      return {
        data: [],
        count: 0,
        pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 1 },
      };
    }
  }

  /**
   * Review a document (Approve, Reject, or Pending) with review notes
   */
  public static async updateDocumentStatus(
    id: string,
    status: 'Pending Review' | 'Approved' | 'Rejected',
    reviewNotes?: string
  ): Promise<UserDocument> {
    const res = await fetch(`${API_BASE_URL}/admin/documents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNotes }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update document status');
    return json.data;
  }

  /**
   * Delete an uploaded document
   */
  public static async deleteDocument(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/admin/documents/${id}`, {
      method: 'DELETE',
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete document');
    return true;
  }
}
