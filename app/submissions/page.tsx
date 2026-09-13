'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable, { Column } from '@/components/DataTable';
import SubmissionDetailModal from '@/components/SubmissionDetailModal';
import NewSubmissionModal from '@/components/NewSubmissionModal';
import { Submission, SubmissionStatus, ApiResponse } from '@/types';
import { Download, Eye, Trash2, Calendar, Clock, Mail, Phone, Plus } from 'lucide-react';

const SUBMISSION_STATUSES: string[] = [
  'All',
  'New',
  'In Progress',
  'Contacted',
  'Completed',
  'Archived',
];

const SERVICE_OPTIONS: string[] = [
  'All',
  'Tax Preparation',
  'Bookkeeping',
  'Payroll',
  'Tax Planning',
  'ERC Tax Credit Consulting',
];

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [serviceFilter, setServiceFilter] = useState<string>('All');

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/submissions');
      const data: ApiResponse<Submission[]> = await res.json();
      if (data.success && data.data) {
        setSubmissions(data.data);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, status: SubmissionStatus, staffNote?: string) => {
    try {
      const res = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, staffNote }),
      });
      const data: ApiResponse<Submission> = await res.json();
      if (data.success) {
        setSubmissions((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status, staffNote } : item))
        );
        if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission((prev) => (prev ? { ...prev, status, staffNote } : null));
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      const res = await fetch(`/api/submissions?id=${id}`, { method: 'DELETE' });
      const data: ApiResponse<boolean> = await res.json();
      if (data.success) {
        setSubmissions((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
    }
  };

  const handleAddSubmission = async (newItem: Partial<Submission>) => {
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const data: ApiResponse<Submission> = await res.json();
      if (data.success && data.data) {
        setSubmissions((prev) => [data.data!, ...prev]);
      }
    } catch (err) {
      console.error('Error creating submission:', err);
    }
  };

  // Export CSV logic
  const handleExportCSV = (exportItems: Submission[]) => {
    if (!exportItems || exportItems.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'ID',
      'Client Name',
      'Email',
      'Phone',
      'Status',
      'Services',
      'Scheduled Date',
      'Scheduled Time',
      'Lead Source',
      'Notes',
      'Created At',
    ];

    const rows = exportItems.map((s) => [
      `"${s.id || ''}"`,
      `"${s.clientName || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.status || ''}"`,
      `"${(s.services || []).join(', ')}"`,
      `"${s.scheduledDate || ''}"`,
      `"${s.scheduledTime || ''}"`,
      `"${s.leadSource || ''}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
      `"${s.createdAt || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexgen_submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'in progress':
        return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      case 'contacted':
        return 'bg-brand-secondary/10 text-brand-blue-dark border-brand-secondary/20';
      case 'completed':
        return 'badge-verified';
      default:
        return 'bg-bg-subtle text-text-mid border-border-subtle';
    }
  };

  // Define columns directly in the page
  const columns: Column<Submission>[] = [
    {
      key: 'clientName',
      header: 'Client Name',
      cell: (item) => (
        <div>
          <div className="font-bold text-text-dark group-hover:text-brand-primary transition-colors font-heading">
            {item.clientName}
          </div>
          <div className="text-[11px] text-text-light mt-0.5">
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact Info',
      cell: (item) => (
        <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
          <a
            href={`mailto:${item.email}`}
            className="text-text-mid hover:text-brand-primary flex items-center gap-1 hover:underline"
          >
            <Mail className="w-3 h-3 text-text-light" /> {item.email}
          </a>
          <a
            href={`tel:${item.phone}`}
            className="text-text-light hover:text-brand-green-dark flex items-center gap-1"
          >
            <Phone className="w-3 h-3 text-text-light" /> {item.phone}
          </a>
        </div>
      ),
    },
    {
      key: 'services',
      header: 'Services',
      cell: (item) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(item.services || ['General']).map((srv, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md badge-primary text-[10px]">
              {srv}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'schedule',
      header: 'Appointment Schedule',
      cell: (item) => (
        item.scheduledDate && item.scheduledDate !== 'Not Scheduled' ? (
          <div className="text-text-dark font-medium">
            <div className="flex items-center gap-1 text-text-dark">
              <Calendar className="w-3 h-3 text-brand-primary shrink-0" />
              <span className="font-bold">{item.scheduledDate}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-text-light mt-0.5">
              <Clock className="w-3 h-3 text-brand-secondary shrink-0" />
              <span>{item.scheduledTime}</span>
            </div>
          </div>
        ) : (
          <span className="text-text-light italic">Direct Message</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (item) => (
        <div onClick={(e) => e.stopPropagation()}>
          <select
            value={item.status || 'New'}
            onChange={(e) => handleUpdateStatus(item.id, e.target.value as SubmissionStatus)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none transition-all ${getStatusBadge(
              item.status
            )}`}
          >
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Contacted">Contacted</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedSubmission(item)}
            type="button"
            className="p-1.5 rounded-lg text-text-mid hover:bg-brand-primary/10 hover:text-brand-primary transition-colors cursor-pointer"
            title="View Full Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete submission from ${item.clientName}?`)) {
                handleDeleteSubmission(item.id);
              }
            }}
            type="button"
            className="p-1.5 rounded-lg text-text-light hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
            title="Delete record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout 
      title="Form Submissions & Consultation Bookings" 
      onRefresh={fetchData} 
      isRefreshing={isRefreshing}
    >
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">All Client Form Submissions</h2>
          <p className="text-xs text-slate-500">
            View, filter, manage pipeline status, and inspect full appointment questionnaires.
          </p>
        </div>

        {/* Fully Dynamic DataTable */}
        <DataTable
          data={submissions}
          columns={columns}
          getRowId={(item) => item.id}
          searchKeys={['clientName', 'email', 'phone', 'notes']}
          filterKey="status"
          statusOptions={SUBMISSION_STATUSES}
          customFilterFn={(item) =>
            serviceFilter === 'All' ||
            item.services?.some((s) => s.toLowerCase().includes(serviceFilter.toLowerCase()))
          }
          searchPlaceholder="Search by client name, email, phone, or notes..."
          filterLabel="Status:"
          onRowClick={(item) => setSelectedSubmission(item)}
          enablePagination={true}
          defaultPageSize={10}
          emptyMessage="No submissions match your filters"
          emptySubtext="Try clearing search or changing status filters."
          footerLabel="NexGen Client Relationship Engine"
          toolbarActions={(filteredItems) => (
            <>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-bg-light border border-border-subtle text-xs font-semibold text-text-dark focus:outline-none focus:bg-white focus:border-brand-primary cursor-pointer"
              >
                {SERVICE_OPTIONS.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv === 'All' ? 'All Services' : srv}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleExportCSV(filteredItems)}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-light hover:bg-bg-subtle text-text-dark text-xs font-semibold border border-border-subtle transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-text-light" /> Export CSV
              </button>

              <button
                onClick={() => setShowNewModal(true)}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 btn-brand-primary text-xs shadow-md shadow-brand-primary/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Inquiry
              </button>
            </>
          )}
        />
      </div>

      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteSubmission}
        />
      )}

      {showNewModal && (
        <NewSubmissionModal
          onClose={() => setShowNewModal(false)}
          onAdd={handleAddSubmission}
        />
      )}
    </AdminLayout>
  );
}
