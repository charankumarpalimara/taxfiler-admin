'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable, { Column } from '@/components/DataTable';
import { UserDocument, ApiResponse } from '@/types';
import { API_BASE_URL } from '@/services/api.config';
import {
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  User,
  AlertCircle,
  FileCheck,
  FolderOpen
} from 'lucide-react';

const STATUS_FILTERS = ['All', 'Pending Review', 'Approved', 'Rejected'];

const CATEGORY_FILTERS = [
  'All',
  'W2-Wage Income',
  'Prior year Tax Return Copy',
  '1099-INT - Interest Income',
  '1099-DIV - Dividend Income',
  '1099-MISC - Business Income',
  '1099-B - Sale of Shares Statement',
  '1098 - Home Mortgage Interest',
  '1098-E - Student Loan Interest',
  'Personal Identification Document of Tax Payer',
  'Others',
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [reviewNoteModal, setReviewNoteModal] = useState<{ id: string; status: 'Approved' | 'Rejected'; note: string } | null>(null);

  const fetchDocuments = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/documents');
      const data: ApiResponse<UserDocument[]> = await res.json();
      if (data.success && data.data) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Update status handler
  const handleUpdateStatus = async (id: string, status: 'Pending Review' | 'Approved' | 'Rejected', reviewNotes?: string) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, reviewNotes }),
      });
      const data: ApiResponse<UserDocument> = await res.json();
      if (data.success) {
        setDocuments((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status, reviewNotes: reviewNotes || item.reviewNotes } : item))
        );
        setReviewNoteModal(null);
      }
    } catch (err) {
      console.error('Error updating document status:', err);
    }
  };

  // Delete document handler
  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document submission?')) return;
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
      const data: ApiResponse<boolean> = await res.json();
      if (data.success) {
        setDocuments((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  // Resolve file link
  const getDownloadUrl = (path?: string) => {
    if (!path) return '#';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Normalize documents status so pending reviews are consistently labeled
  const normalizedDocuments = useMemo(() => {
    return documents.map((d) => ({
      ...d,
      status: (d.status || 'Pending Review') as any,
    }));
  }, [documents]);

  // Statistics
  const stats = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter((d) => !d.status || d.status === 'Pending Review').length;
    const approved = documents.filter((d) => d.status === 'Approved').length;
    const rejected = documents.filter((d) => d.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [documents]);

  // Table columns definition
  const columns: Column<UserDocument>[] = [
    {
      key: 'user',
      header: 'Client',
      cell: (doc) => (
        <div>
          <div className="font-bold text-slate-900 font-heading">{doc.user?.fullName || 'Portal User'}</div>
          <div className="text-[11px] text-slate-400">{doc.user?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'documentType',
      header: 'Document Type',
      cell: (doc) => (
        <span className="font-bold text-blue-800 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded-md text-[11px]">
          {doc.documentType}
        </span>
      ),
    },
    {
      key: 'person',
      header: 'Person',
      cell: (doc) => (
        <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-[11px]">
          {doc.person}
        </span>
      ),
    },
    {
      key: 'fileName',
      header: 'File Name & Size',
      cell: (doc) => (
        <div>
          <div className="font-bold text-slate-900 truncate max-w-[200px]" title={doc.fileName}>
            {doc.fileName}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {(doc.fileSize / 1024).toFixed(1)} KB
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Upload Date',
      cell: (doc) => (
        <span className="text-slate-600 font-medium text-xs">
          {new Date(doc.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Review Status',
      cell: (doc) => (
        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
              doc.status === 'Approved'
                ? 'bg-emerald-100 text-emerald-800'
                : doc.status === 'Rejected'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                doc.status === 'Approved'
                  ? 'bg-emerald-500'
                  : doc.status === 'Rejected'
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
            />
            {doc.status || 'Pending Review'}
          </span>
          {doc.reviewNotes && (
            <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]" title={doc.reviewNotes}>
              Note: {doc.reviewNotes}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (doc) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleUpdateStatus(doc.id, 'Approved')}
            title="Approve Document"
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setReviewNoteModal({ id: doc.id, status: 'Rejected', note: doc.reviewNotes || '' })}
            title="Reject & Add Note"
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
          </button>

          <a
            href={getDownloadUrl(doc.fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block"
            title="Download / View File"
          >
            <Download className="w-4 h-4" />
          </a>

          <button
            onClick={() => handleDeleteDocument(doc.id)}
            title="Delete Record"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Tax Document Submissions" onRefresh={fetchDocuments} isRefreshing={isRefreshing}>
      <div className="space-y-2">
        {/* Documents Directory Header Card */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/15 text-brand-primary flex items-center justify-center shrink-0 shadow-xs">
              <FolderOpen className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading tracking-tight">
                  User Tax Document Submissions
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Review, verify, and approve IRS tax forms (W-2, 1099, 1098, identity files) uploaded by registered portal clients.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              onClick={fetchDocuments}
              disabled={isRefreshing}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-primary' : 'text-slate-500'}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh List'}</span>
            </button>
          </div>
        </div>

        {/* Consolidated Metric Banner Card */}
        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5 lg:p-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:gap-x-8 sm:gap-y-6 lg:gap-y-0 lg:divide-x divide-slate-100">
            <div className="flex items-center justify-between lg:pr-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Uploaded</p>
                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 mt-1 font-heading">{stats.total}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">All tax file submissions</p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 sm:pt-0 lg:px-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</p>
                <h3 className="text-2xl lg:text-3xl font-black text-amber-600 mt-1 font-heading">{stats.pending}</h3>
                <p className="text-[11px] text-amber-600/80 mt-0.5">Awaiting verification</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 sm:pt-0 lg:px-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved</p>
                <h3 className="text-2xl lg:text-3xl font-black text-emerald-600 mt-1 font-heading">{stats.approved}</h3>
                <p className="text-[11px] text-emerald-600/80 mt-0.5">Verified & accepted</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 sm:pt-0 lg:pl-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Needs Resubmission</p>
                <h3 className="text-2xl lg:text-3xl font-black text-rose-600 mt-1 font-heading">{stats.rejected}</h3>
                <p className="text-[11px] text-rose-600/80 mt-0.5">Rejected or invalid</p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Fully Dynamic DataTable */}
        <DataTable
          data={normalizedDocuments}
          columns={columns}
          getRowId={(doc) => doc.id}
          searchPlaceholder="Search by client, file name, document type, or person..."
          searchPredicate={(doc, search) => {
            const q = search.toLowerCase();
            return (
              (doc.fileName?.toLowerCase().includes(q) ?? false) ||
              (doc.documentType?.toLowerCase().includes(q) ?? false) ||
              (doc.person?.toLowerCase().includes(q) ?? false) ||
              (doc.user?.fullName?.toLowerCase().includes(q) ?? false) ||
              (doc.user?.email?.toLowerCase().includes(q) ?? false)
            );
          }}
          filterKey="status"
          statusOptions={STATUS_FILTERS}
          customFilterFn={(doc) => {
            if (categoryFilter === 'All') return true;
            return doc.documentType?.toLowerCase().includes(categoryFilter.toLowerCase()) ?? false;
          }}
          filterLabel="Status:"
          enablePagination={true}
          defaultPageSize={10}
          emptyMessage="No document submissions found"
          emptySubtext="Try adjusting your search terms or category filter."
          footerLabel="NexGen Tax Documents Engine"
          toolbarActions={() => (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
              >
                {CATEGORY_FILTERS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        />

        {/* Modal to add Reject / Review Note */}
        {reviewNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-sm text-slate-900">Add Review Feedback</h3>
                <button onClick={() => setReviewNoteModal(null)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-600">
                Provide a reason or instructions for the client regarding why this document is rejected or needs re-upload.
              </p>
              <textarea
                rows={3}
                value={reviewNoteModal.note}
                onChange={(e) => setReviewNoteModal({ ...reviewNoteModal, note: e.target.value })}
                placeholder="e.g. Missing Box 12 codes, illegible scan, requires W-2 from employer..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-rose-500/20"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewNoteModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(reviewNoteModal.id, reviewNoteModal.status, reviewNoteModal.note)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  Save & Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
