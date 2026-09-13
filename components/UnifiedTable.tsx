'use client';

import React, { useState, useMemo } from 'react';
import { Download, Eye, Trash2, Calendar, Clock, Mail, Phone, Plus, UserPlus } from 'lucide-react';
import { Submission, SubmissionStatus, Registration, PortalStatus } from '@/types';
import DataTable, { Column, FilterTab } from './DataTable';

export type UnifiedTableProps =
  | {
      type: 'submissions';
      data?: Submission[];
      submissions?: Submission[];
      onSelectSubmission?: (submission: Submission) => void;
      onUpdateStatus: (id: string, status: SubmissionStatus) => Promise<void> | void;
      onDeleteSubmission: (id: string) => Promise<void> | void;
      onOpenNewModal?: () => void;
    }
  | {
      type: 'registrations';
      data?: Registration[];
      registrations?: Registration[];
      onUpdateStatus: (id: string, status: PortalStatus) => Promise<void> | void;
      onDeleteRegistration: (id: string) => Promise<void> | void;
      onOpenNewModal?: () => void;
    };

const SUBMISSION_STATUSES: (SubmissionStatus | 'All')[] = [
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

const REGISTRATION_STATUSES: (PortalStatus | 'All')[] = [
  'All',
  'Verified',
  'Pending Review',
  'Active',
];

export default function UnifiedTable(props: UnifiedTableProps) {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');

  // --- MODE: SUBMISSIONS ---
  if (props.type === 'submissions') {
    const list: Submission[] = Array.isArray(props.data)
      ? props.data
      : Array.isArray(props.submissions)
      ? props.submissions
      : [];

    const filteredSubmissions = useMemo(() => {
      return list.filter((item) => {
        const matchesStatus =
          statusFilter === 'All' ||
          item.status?.toLowerCase() === statusFilter.toLowerCase();

        const matchesService =
          serviceFilter === 'All' ||
          item.services?.some((s) => s.toLowerCase().includes(serviceFilter.toLowerCase()));

        const q = search.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.clientName?.toLowerCase().includes(q) ||
          item.email?.toLowerCase().includes(q) ||
          item.phone?.toLowerCase().includes(q) ||
          item.notes?.toLowerCase().includes(q);

        return matchesStatus && matchesService && matchesSearch;
      });
    }, [list, statusFilter, serviceFilter, search]);

    const filterTabs: FilterTab[] = useMemo(() => {
      return SUBMISSION_STATUSES.map((st) => ({
        key: st,
        label: st,
        count:
          st === 'All'
            ? list.length
            : list.filter((s) => s.status?.toLowerCase() === st.toLowerCase()).length,
      }));
    }, [list]);

    const handleExportCSV = () => {
      if (filteredSubmissions.length === 0) {
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
      const rows = filteredSubmissions.map((s) => [
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

    const submissionColumns: Column<Submission>[] = [
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
        cell: (item) =>
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
          ),
      },
      {
        key: 'status',
        header: 'Status',
        cell: (item) => (
          <div onClick={(e) => e.stopPropagation()}>
            <select
              value={item.status || 'New'}
              onChange={(e) => props.onUpdateStatus(item.id, e.target.value as SubmissionStatus)}
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
            {props.onSelectSubmission && (
              <button
                onClick={() => props.onSelectSubmission?.(item)}
                type="button"
                className="p-1.5 rounded-lg text-text-mid hover:bg-brand-primary/10 hover:text-brand-primary transition-colors cursor-pointer"
                title="View Full Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                if (confirm(`Delete submission from ${item.clientName}?`)) {
                  props.onDeleteSubmission(item.id);
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
      <DataTable
        data={filteredSubmissions}
        columns={submissionColumns}
        getRowId={(item) => item.id}
        searchable={true}
        searchPlaceholder="Search by client name, email, phone, or notes..."
        searchValue={search}
        onSearchChange={setSearch}
        filterTabs={filterTabs}
        activeFilterTab={statusFilter}
        onFilterTabChange={setStatusFilter}
        filterLabel="Status:"
        onRowClick={props.onSelectSubmission}
        enablePagination={true}
        defaultPageSize={10}
        emptyMessage="No submissions match your filters"
        emptySubtext="Try clearing search or changing status filters."
        footerLabel="NexGen Client Relationship Engine"
        toolbarActions={
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
              onClick={handleExportCSV}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-light hover:bg-bg-subtle text-text-dark text-xs font-semibold border border-border-subtle transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-text-light" /> Export CSV
            </button>

            {props.onOpenNewModal && (
              <button
                onClick={props.onOpenNewModal}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 btn-brand-primary text-xs shadow-md shadow-brand-primary/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New Inquiry
              </button>
            )}
          </>
        }
      />
    );
  }

  // --- MODE: REGISTRATIONS ---
  const list: Registration[] = Array.isArray(props.data)
    ? props.data
    : Array.isArray(props.registrations)
    ? props.registrations
    : [];

  const filteredRegistrations = useMemo(() => {
    return list.filter((reg) => {
      const matchesStatus =
        statusFilter === 'All' ||
        reg.portalStatus?.toLowerCase() === statusFilter.toLowerCase();

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        reg.fullName?.toLowerCase().includes(q) ||
        reg.email?.toLowerCase().includes(q) ||
        reg.phone?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [list, statusFilter, search]);

  const filterTabs: FilterTab[] = useMemo(() => {
    return REGISTRATION_STATUSES.map((st) => ({
      key: st,
      label: st,
      count:
        st === 'All'
          ? list.length
          : list.filter((r) => r.portalStatus?.toLowerCase() === st.toLowerCase()).length,
    }));
  }, [list]);

  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert('No registrations to export');
      return;
    }
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Portal Status', 'Account Type', 'Created At'];
    const rows = filteredRegistrations.map((r) => [
      `"${r.id || ''}"`,
      `"${r.fullName || ''}"`,
      `"${r.email || ''}"`,
      `"${r.phone || ''}"`,
      `"${r.portalStatus || ''}"`,
      `"${r.accountType || ''}"`,
      `"${r.createdAt || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexgen_portal_registrations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return 'badge-verified';
      case 'pending review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'active':
        return 'badge-primary';
      default:
        return 'bg-bg-subtle text-text-mid border-border-subtle';
    }
  };

  const registrationColumns: Column<Registration>[] = [
    {
      key: 'fullName',
      header: 'Client Name',
      cell: (reg) => (
        <div className="flex items-center gap-2 font-bold text-text-dark font-heading">
          <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-[11px]">
            {reg.firstName?.[0] || 'U'}
          </div>
          <span>{reg.fullName}</span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      cell: (reg) => (
        <a href={`mailto:${reg.email}`} className="text-text-mid hover:text-brand-primary hover:underline">
          {reg.email}
        </a>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (reg) => (
        <a href={`tel:${reg.phone}`} className="text-text-mid hover:text-brand-green-dark">
          {reg.phone}
        </a>
      ),
    },
    {
      key: 'accountType',
      header: 'Account Type',
      cell: (reg) => (
        <span className="px-2 py-0.5 rounded-md bg-bg-light text-text-dark text-[11px] font-semibold border border-border-subtle">
          {reg.accountType || 'Client Portal'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Registered On',
      cell: (reg) => (
        <span className="text-text-light text-[11px]">
          {new Date(reg.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'portalStatus',
      header: 'Portal Status',
      cell: (reg) => (
        <select
          value={reg.portalStatus || 'Pending Review'}
          onChange={(e) => props.onUpdateStatus(reg.id, e.target.value as PortalStatus)}
          className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none transition-all ${getStatusBadge(
            reg.portalStatus
          )}`}
        >
          <option value="Verified">Verified</option>
          <option value="Active">Active</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Suspended">Suspended</option>
        </select>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (reg) => (
        <button
          onClick={() => {
            if (confirm(`Delete registration for ${reg.fullName}?`)) {
              props.onDeleteRegistration(reg.id);
            }
          }}
          type="button"
          className="p-1.5 rounded-lg text-text-light hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
          title="Delete account"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <DataTable
      data={filteredRegistrations}
      columns={registrationColumns}
      getRowId={(reg) => reg.id}
      searchable={true}
      searchPlaceholder="Search registered clients by name, email, or phone..."
      searchValue={search}
      onSearchChange={setSearch}
      filterTabs={filterTabs}
      activeFilterTab={statusFilter}
      onFilterTabChange={setStatusFilter}
      filterLabel="Account Status:"
      enablePagination={true}
      defaultPageSize={10}
      emptyMessage="No registered clients found"
      emptySubtext="Try adjusting your search query or status filter."
      footerLabel="NexGen Portal Accounts Engine"
      toolbarActions={
        <>
          <button
            onClick={handleExportCSV}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-light hover:bg-bg-subtle text-text-dark text-xs font-semibold border border-border-subtle transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-text-light" /> Export CSV
          </button>
          {props.onOpenNewModal && (
            <button
              onClick={props.onOpenNewModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 btn-brand-primary text-xs shadow-md shadow-brand-primary/20 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" /> Register Client
            </button>
          )}
        </>
      }
    />
  );
}
